---
title: golang.org/x/crypto 实战：密码哈希、AEAD 与 SSH
date: 2026-11-24
categories:
  - Go
tags:
  - Go
  - crypto
  - security
  - ssh
---

# golang.org/x/crypto 实战：密码哈希、AEAD 与 SSH

`golang.org/x/crypto` 不是某一个加密算法，而是 Go 官方维护的补充加密包集合。标准库 `crypto/*` 提供 AES、Ed25519、X25519、HKDF 等基础原语；`x/crypto` 则补齐了密码哈希、现代 AEAD、SSH、ACME 自动证书等更贴近业务的工程能力。

本文按 Web 后端最常见的四个场景展开：密码存储、业务数据加密、密钥派生、远程运维与 TLS。示例基于 `golang.org/x/crypto v0.59.0`（要求 Go 1.26+，截至 2026-11-24）。版本升级后请以 `go doc` 和 release notes 为准。

## 先给结论

| 场景 | 推荐包 | 关键点 |
| --- | --- | --- |
| 密码存储 | `golang.org/x/crypto/argon2` | 用 Argon2id，每个用户独立盐，参数可升级 |
| 兼容旧密码 | `golang.org/x/crypto/bcrypt` | 只用于存量兼容，登录成功后迁移到 Argon2id |
| 业务数据加密 | `golang.org/x/crypto/chacha20poly1305` | XChaCha20-Poly1305，随机 24 字节 nonce |
| 密钥派生 | `golang.org/x/crypto/hkdf` | 从高熵主密钥派生按用途隔离的子密钥 |
| SSH 自动化 | `golang.org/x/crypto/ssh` | 必须校验 known_hosts，禁止忽略主机密钥 |
| 自动 TLS | `golang.org/x/crypto/acme/autocert` | 适合单机或简单集群的公网服务 |

一句话原则：**标准库优先，`x/crypto` 补位；不要自己发明加密协议。**

## 一、先选对包

### 1.1 标准库已经有的，不要重复引入

| 需求 | 优先使用 | 说明 |
| --- | --- | --- |
| 对称加密 | `crypto/aes` + `crypto/cipher` | AES-GCM 可利用硬件加速，FIPS 场景通常选它 |
| 数字签名 | `crypto/ed25519` | 签名和验签都简单，避免 RSA 参数选择 |
| 密钥交换 | `crypto/ecdh` | X25519 已进入标准库 |
| HKDF | `crypto/hkdf` | Go 1.24+ 可用 |
| PBKDF2 | `crypto/pbkdf2` | Go 1.24+ 可用，兼容旧协议时常见 |
| SHA-2 / SHA-3 | `crypto/sha256`、`crypto/sha3` | 不要自己实现哈希 |

### 1.2 `x/crypto` 真正值得用的部分

- `argon2`：密码哈希的现代默认选择，内存硬，抗 GPU/ASIC 暴力破解。
- `bcrypt`：存量系统兼容性最好，但已有 72 字节密码长度限制。
- `chacha20poly1305`：XChaCha20-Poly1305 AEAD，适合应用层随机 nonce 加密。
- `hkdf`：从主密钥派生多个用途隔离的子密钥。
- `ssh`、`ssh/knownhosts`：SSH 客户端、服务端和主机密钥校验。
- `acme/autocert`：在 Go 进程内自动申请和续期 Let's Encrypt 证书。
- `nacl/box`、`nacl/secretbox`：NaCl 兼容的小消息公钥/对称加密。

以下包不建议在新项目中作为首选：`openpgp` 已废弃；`md4`、`ripemd160`、`blowfish`、`cast5` 等只适合解析历史数据；`ssh/terminal` 已迁移到 `golang.org/x/term`。

### 1.3 安装与版本

```bash
go get golang.org/x/crypto@latest
go mod tidy
```

`x/crypto` 是 Go 扩展仓库，API 稳定性不等同于标准库。升级后至少跑一遍单元测试和 `govulncheck`，不要长期停留在旧版本。

## 二、密码存储：Argon2id

### 2.1 为什么不能用 SHA-256

SHA-256 的设计目标是**快**。快意味着攻击者可以用 GPU 每秒尝试数十亿次。密码哈希的目标相反：在可控的服务器成本内，让每次尝试尽可能慢、尽可能占内存。

Argon2id 同时具备时间成本、内存成本和并行度参数，是目前密码哈希的默认答案。bcrypt 仍然安全，但更适合兼容存量；scrypt 也可以，但新系统优先 Argon2id。

本文参数取 **m=64 MiB、t=3、p=4**，对应 RFC 9106 的第二组推荐参数。OWASP 的最低建议是 m=19 MiB、t=2、p=1，实际参数应结合登录延迟和服务器内存压测确定。

> `p=4` 是算法并行度，不是并发请求数。每个哈希仍然占用约 64 MiB 内存；登录接口必须限流，并限制同时进行的哈希数量，否则攻击者可以用大量登录请求把内存打满。

### 2.2 生成与校验

```go
package auth

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

const (
	argonMemory      = 64 * 1024
	argonIterations  = 3
	argonParallelism = 4
	argonSaltLength  = 16
	argonKeyLength   = 32
	maxPasswordBytes = 1024
)

var ErrInvalidHash = errors.New("auth: invalid argon2id hash")

func HashPassword(password string) (string, error) {
	if len(password) > maxPasswordBytes {
		return "", errors.New("auth: password too long")
	}

	salt := make([]byte, argonSaltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("generate salt: %w", err)
	}

	key := argon2.IDKey(
		[]byte(password),
		salt,
		argonIterations,
		argonMemory,
		argonParallelism,
		argonKeyLength,
	)

	return fmt.Sprintf(
		"$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version,
		argonMemory,
		argonIterations,
		argonParallelism,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(key),
	), nil
}

func VerifyPassword(password, encoded string) (bool, error) {
	parts := strings.Split(encoded, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return false, ErrInvalidHash
	}

	var version int
	if n, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil || n != 1 || version != argon2.Version {
		return false, ErrInvalidHash
	}

	var memory, iterations uint32
	var parallelism uint8
	if n, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &parallelism); err != nil || n != 3 {
		return false, ErrInvalidHash
	}
	if memory < 8*1024 || memory > 128*1024 || iterations < 1 || iterations > 10 || parallelism < 1 || parallelism > 16 {
		return false, ErrInvalidHash
	}

	salt, err := base64.RawStdEncoding.Strict().DecodeString(parts[4])
	if err != nil || len(salt) < 16 {
		return false, ErrInvalidHash
	}

	want, err := base64.RawStdEncoding.Strict().DecodeString(parts[5])
	if err != nil || len(want) < 16 || len(want) > 64 {
		return false, ErrInvalidHash
	}

	got := argon2.IDKey(
		[]byte(password),
		salt,
		iterations,
		memory,
		parallelism,
		uint32(len(want)),
	)

	return subtle.ConstantTimeCompare(got, want) == 1, nil
}
```

几个容易被忽略的点：

- 盐必须是密码学安全的随机数，长度 16 字节起步，每个用户独立生成。
- 输出采用 PHC 字符串格式，参数、盐、哈希都保存在同一个字段里，未来可以平滑调整参数。
- 解析哈希时必须限制 `memory`、`iterations`、`parallelism` 和长度。否则一条被篡改的数据库记录就可能让服务分配几 GB 内存。
- 解析下限只用于拦截异常值，不代表新哈希的目标参数。旧系统如果使用更低的参数，应允许校验成功后再 rehash，不要直接拒绝用户登录。
- 比较哈希用 `subtle.ConstantTimeCompare`，不要用 `bytes.Equal` 比较秘密值。
- 密码长度上限是应用层策略，用来防止超大请求体拖垮哈希函数；不要用短上限限制正常用户。

### 2.3 参数升级与旧密码迁移

参数不是一成不变的。登录校验成功后，如果发现存储的哈希参数低于当前目标参数，就重新哈希并更新数据库：

```go
func NeedsRehash(encoded string) bool {
	prefix := fmt.Sprintf(
		"$argon2id$v=%d$m=%d,t=%d,p=%d$",
		argon2.Version,
		argonMemory,
		argonIterations,
		argonParallelism,
	)
	return !strings.HasPrefix(encoded, prefix)
}
```

调用顺序是：先 `VerifyPassword` 成功，再 `NeedsRehash`，最后写回新哈希。不要在校验失败时重写，否则会把错误密码变成新密码。

用户不存在时也要执行一次固定 dummy hash 的校验，避免攻击者通过响应时间判断账号是否存在。dummy hash 在服务启动时生成一次即可。

### 2.4 bcrypt 兼容

```go
hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
if errors.Is(err, bcrypt.ErrPasswordTooLong) {
	return errors.New("password exceeds bcrypt limit")
}

err = bcrypt.CompareHashAndPassword(hash, []byte(password))
```

bcrypt 的 `cost=12` 是一个合理起点，但要在生产硬件上实测延迟。它有两个限制：

- 密码超过 72 字节会报错；不要静默截断，否则用户会以为长密码生效了。
- 参数升级只能提高 cost，不能改善 72 字节上限。

迁移策略：保留 bcrypt 校验，用户登录成功后用 Argon2id 重新哈希并覆盖旧值；不要强制所有用户重置密码。

## 三、业务数据加密：XChaCha20-Poly1305

### 3.1 为什么选 AEAD

业务数据加密至少需要两个保证：**机密性**和**完整性**。AES-CBC 只提供前者，必须额外加 HMAC；组合方式稍有错误就会产生 padding oracle 或 MAC 校验漏洞。AEAD（Authenticated Encryption with Associated Data）把加密和认证封装成一个接口，解密失败时不会返回任何明文。

`chacha20poly1305.NewX` 使用 XChaCha20-Poly1305，密钥 32 字节，nonce 24 字节。24 字节随机 nonce 的碰撞概率可以忽略，适合应用层直接生成随机 nonce。

### 3.2 一个可复用的信封格式

```go
package secure

import (
	"crypto/cipher"
	"crypto/rand"
	"errors"
	"fmt"
	"io"

	"golang.org/x/crypto/chacha20poly1305"
)

const envelopeVersion = 1

type Box struct {
	aead cipher.AEAD
}

func NewBox(key []byte) (*Box, error) {
	aead, err := chacha20poly1305.NewX(key)
	if err != nil {
		return nil, fmt.Errorf("create aead: %w", err)
	}
	return &Box{aead: aead}, nil
}

func (b *Box) Seal(plaintext, aad []byte) ([]byte, error) {
	nonce := make([]byte, b.aead.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("generate nonce: %w", err)
	}

	out := make([]byte, 1+len(nonce), 1+len(nonce)+len(plaintext)+b.aead.Overhead())
	out[0] = envelopeVersion
	copy(out[1:], nonce)

	return b.aead.Seal(out, nonce, plaintext, aad), nil
}

func (b *Box) Open(sealed, aad []byte) ([]byte, error) {
	if len(sealed) < 1+b.aead.NonceSize()+b.aead.Overhead() {
		return nil, errors.New("secure: ciphertext too short")
	}
	if sealed[0] != envelopeVersion {
		return nil, errors.New("secure: unsupported version")
	}

	nonce := sealed[1 : 1+b.aead.NonceSize()]
	ciphertext := sealed[1+b.aead.NonceSize():]

	plaintext, err := b.aead.Open(nil, nonce, ciphertext, aad)
	if err != nil {
		return nil, errors.New("secure: authentication failed")
	}
	return plaintext, nil
}
```

信封布局是：

```text
version(1 byte) | nonce(24 bytes) | ciphertext + tag
```

`version` 用于后续格式演进。真正做密钥轮换时，还要在头部加入 `keyID`，解密时按 `keyID` 选择旧密钥，重新加密时写入新密钥编号。

### 3.3 AAD 用来绑定上下文

AEAD 的 AAD 不加密，但会被认证。把租户、用户、业务类型等上下文放进去，可以防止攻击者把一条合法密文挪到另一个用户或另一个业务场景：

```go
sealed, err := box.Seal([]byte(`{"amount":100}`), []byte("tenant:42"))
if err != nil {
	return err
}

plaintext, err := box.Open(sealed, []byte("tenant:42"))
```

如果解密时传入 `tenant:43`，即使密文本身没有被修改，认证也会失败。

### 3.4 nonce 规则

- 同一个密钥下，nonce 绝对不能重复。重复一次就可能同时破坏机密性和完整性。
- 使用 `crypto/rand` 或 `rand.Reader`，不要用 `math/rand`，也不要用时间戳、自增 ID 代替随机数。
- XChaCha20-Poly1305 的 24 字节随机 nonce 适合应用层；AES-GCM 的 12 字节随机 nonce 在高消息量下要关注生日界，必要时改用计数器或按消息派生密钥。
- AEAD 是一次性接口。大文件不要简单切块后复用 nonce；每一块都要有唯一 nonce，并把块序号、总长度等元数据放入 AAD，或者直接使用 `age` 这类成熟的流式加密工具。

### 3.5 AES-GCM 还是 XChaCha20-Poly1305

| 维度 | AES-256-GCM | XChaCha20-Poly1305 |
| --- | --- | --- |
| 实现位置 | 标准库 `crypto/aes` | `x/crypto/chacha20poly1305` |
| 硬件加速 | AES-NI 下很快 | 纯软件实现也很快 |
| 随机 nonce | 12 字节，需关注碰撞界 | 24 字节，随机 nonce 更从容 |
| FIPS | 通常可用 | 通常不属于 FIPS 批准算法 |

没有硬件 AES 加速、又希望应用层直接使用随机 nonce 时，XChaCha20-Poly1305 很合适；有 FIPS 合规要求时，优先 AES-GCM，并按规范管理 nonce。

## 四、密钥派生：HKDF

HKDF 不是密码哈希。它用于把**高熵主密钥**扩展成多个用途隔离的子密钥，不能拿用户密码直接喂给 HKDF 当密码哈希用。密码请继续用 Argon2id。

```go
package keys

import (
	"crypto/sha256"
	"fmt"
	"io"

	"golang.org/x/crypto/hkdf"
)

func DeriveKey(master, salt []byte, purpose string) ([]byte, error) {
	r := hkdf.New(sha256.New, master, salt, []byte(purpose))
	key := make([]byte, 32)
	if _, err := io.ReadFull(r, key); err != nil {
		return nil, fmt.Errorf("derive key: %w", err)
	}
	return key, nil
}
```

如果项目已经使用 Go 1.24+，标准库有等价实现，优先用标准库：

```go
import stdhkdf "crypto/hkdf"

key, err := stdhkdf.Key(sha256.New, master, salt, "app:v1:payload", 32)
```

使用要点：

- `purpose` 必须按用途唯一，例如 `app:v1:payload`、`app:v1:index`、`app:v1:session`。不同用途得到不同子密钥，避免一个密钥泄露后横向影响所有模块。
- `salt` 不需要保密，可以随机生成后和密文一起保存；它的作用是区分不同密钥版本。
- `master` 必须来自 KMS、环境变量或密钥管理服务，不能硬编码在仓库里。
- 主密钥轮换时，旧密文用旧 `salt`/`keyID` 解密，新数据用新版本加密。

## 五、SSH 自动化：known_hosts 是底线

`x/crypto/ssh` 可以实现 SSH 客户端、服务端、端口转发和证书认证。运维脚本里最常见、也最容易写错的是主机密钥校验。

```go
package ops

import (
	"context"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"time"

	"golang.org/x/crypto/ssh"
	"golang.org/x/crypto/ssh/knownhosts"
)

func RunSSH(ctx context.Context, addr, user, keyPath, command string) ([]byte, error) {
	privateKey, err := os.ReadFile(keyPath)
	if err != nil {
		return nil, fmt.Errorf("read private key: %w", err)
	}

	signer, err := ssh.ParsePrivateKey(privateKey)
	if err != nil {
		return nil, fmt.Errorf("parse private key: %w", err)
	}

	home, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("get home dir: %w", err)
	}
	hostKeyCallback, err := knownhosts.New(filepath.Join(home, ".ssh", "known_hosts"))
	if err != nil {
		return nil, fmt.Errorf("load known_hosts: %w", err)
	}

	config := &ssh.ClientConfig{
		User:            user,
		Auth:            []ssh.AuthMethod{ssh.PublicKeys(signer)},
		HostKeyCallback: hostKeyCallback,
	}

	dialer := &net.Dialer{Timeout: 10 * time.Second}
	rawConn, err := dialer.DialContext(ctx, "tcp", addr)
	if err != nil {
		return nil, fmt.Errorf("dial ssh: %w", err)
	}

	handshakeCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	if deadline, ok := handshakeCtx.Deadline(); ok {
		_ = rawConn.SetDeadline(deadline)
	}

	sshConn, chans, reqs, err := ssh.NewClientConn(rawConn, addr, config)
	if err != nil {
		_ = rawConn.Close()
		return nil, fmt.Errorf("ssh handshake: %w", err)
	}
	client := ssh.NewClient(sshConn, chans, reqs)
	defer client.Close()
	_ = rawConn.SetDeadline(time.Time{})

	session, err := client.NewSession()
	if err != nil {
		return nil, fmt.Errorf("new session: %w", err)
	}
	defer session.Close()

	type result struct {
		output []byte
		err    error
	}
	done := make(chan result, 1)
	go func() {
		out, err := session.CombinedOutput(command)
		done <- result{output: out, err: err}
	}()

	select {
	case <-ctx.Done():
		_ = session.Signal(ssh.SIGKILL)
		_ = session.Close()
		return nil, ctx.Err()
	case res := <-done:
		if res.err != nil {
			return res.output, fmt.Errorf("run command: %w", res.err)
		}
		return res.output, nil
	}
}
```

注意事项：

- `ssh.InsecureIgnoreHostKey()` 只应该出现在一次性测试里，生产环境等于关闭中间人防护。
- 私钥文件权限应为 `0600`；带口令的私钥用 `ssh.ParsePrivateKeyWithPassphrase`，口令从密钥管理系统读取，不要写进代码。
- `ssh.ClientConfig.Timeout` 只限制 TCP 建连，不覆盖 SSH 握手和认证；上面的实现用 `DialContext` 覆盖拨号，用 `SetDeadline` 覆盖握手，握手完成后再清除 deadline，避免长命令被误杀。
- `ssh.Dial` 本身没有 `context` 参数。需要严格取消拨号时，用 `net.Dialer` 建立连接，再调用 `ssh.NewClientConn`。
- 通过跳板机访问内网时，可以在已建立的 `*ssh.Client` 上调用 `Dial("tcp", target)` 建立隧道，再基于该连接创建新的 SSH 客户端。

## 六、自动 TLS：autocert

单机或简单集群的 Go 服务，可以用 `autocert` 在进程内申请和续期 Let's Encrypt 证书：

```go
package main

import (
	"crypto/tls"
	"log"
	"net/http"

	"golang.org/x/crypto/acme/autocert"
)

func ServeTLS() error {
	m := &autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist("example.com", "www.example.com"),
		Cache:      autocert.DirCache("/var/lib/autocert"),
	}

	go func() {
		if err := http.ListenAndServe(":80", m.HTTPHandler(nil)); err != nil {
			log.Printf("http server: %v", err)
		}
	}()

	srv := &http.Server{
		Addr: ":443",
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, _ = w.Write([]byte("ok"))
		}),
		TLSConfig: &tls.Config{
			GetCertificate: m.GetCertificate,
			MinVersion:     tls.VersionTLS12,
		},
	}

	return srv.ListenAndServeTLS("", "")
}
```

注意事项：

- `HostWhitelist` 限制可以为哪些域名申请证书，避免服务被拿来给任意 SNI 域名签证书。
- `DirCache` 必须持久化，容器部署要挂载卷；多副本部署需要实现共享 `Cache`，否则每个副本会各自申请证书，容易触发速率限制。
- HTTP-01 需要 80 端口，TLS-ALPN-01 需要 443 端口。`HTTPHandler(nil)` 会把非 ACME 请求 302 到 HTTPS。
- 需要 DNS-01、泛域名或服务在 CDN 后面时，`autocert` 不是最佳选择，考虑 `lego`、`certmagic`、Caddy 或 Kubernetes 的 cert-manager。
- 测试环境使用 Let's Encrypt staging，避免生产速率限制；上线前确认证书续期告警。
- `MinVersion` 至少 TLS 1.2；客户端支持时优先 TLS 1.3。

## 七、上线前检查清单

- 密码：新系统用 Argon2id；bcrypt 只做存量兼容；登录接口限流；用户不存在时也跑 dummy hash。
- 随机数：密钥、盐、nonce 全部来自 `crypto/rand`，禁止 `math/rand`。
- AEAD：nonce 永不复用；AAD 绑定租户/用户/业务上下文；信封带版本号，轮换时带 `keyID`。
- 密钥：主密钥放 KMS 或密钥管理服务；HKDF 按用途隔离；密钥和密文分开存储；定期演练轮换。
- 比较：秘密值用 `subtle.ConstantTimeCompare`；AEAD 的 tag 校验交给 `Open`，不要自己比较。
- SSH：生产环境必须校验 `known_hosts`；私钥 `0600`；使用最小权限账号；保留命令审计。
- TLS：`autocert` 的缓存必须持久化；监控续期失败；多副本使用共享缓存或交给 ingress。
- 依赖：固定 `x/crypto` 版本；升级前读 release notes；CI 跑 `govulncheck ./...`。
- 合规：Argon2id、bcrypt、ChaCha20-Poly1305 通常不属于 FIPS 批准算法；FIPS 场景应使用 Go FIPS 模式和目标模块批准的算法，如 AES-GCM、PBKDF2。
- 备份：备份里不要同时存放密钥和密文；恢复流程要验证密钥可用，而不是只验证文件存在。

## 八、总结

`golang.org/x/crypto` 的价值不在于“多”，而在于补上了标准库没有、但业务一定会遇到的几块能力：

- 密码存储用 Argon2id，参数可升级，登录成功后自动 rehash。
- 业务数据用 XChaCha20-Poly1305，随机 nonce + AAD + 版本化信封。
- 多用途密钥用 HKDF 派生，主密钥放 KMS，按用途隔离。
- SSH 用 `knownhosts` 校验主机密钥，拒绝 `InsecureIgnoreHostKey`。
- 简单公网服务用 `autocert`；复杂 ingress、泛域名和 DNS-01 交给 cert-manager、Caddy 或 lego。

最后再强调一次：**加密代码的正确性很难靠 review 保证，优先使用成熟库和成熟协议，不要自己组合原语。**

## 参考资料

- [pkg.go.dev/golang.org/x/crypto](https://pkg.go.dev/golang.org/x/crypto)
- [RFC 9106: Argon2](https://www.rfc-editor.org/rfc/rfc9106)
- [RFC 8439: ChaCha20-Poly1305](https://www.rfc-editor.org/rfc/rfc8439)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

