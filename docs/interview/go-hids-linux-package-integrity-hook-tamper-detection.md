---
title: Go 主机安全面试：Linux 软件包完整性校验与包管理器 Hook 篡改检测
date: 2026-11-17 17:20:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- linux
- rpm
- dpkg
---

# Go 主机安全面试：Linux 软件包完整性校验与包管理器 Hook 篡改检测

## 岗位场景

你是云铠主机安全产品的 Go 研发，负责 Linux 主机的"软件供应链与系统文件完整性"检测能力。客户提的需求往往很朴素：

- "服务器上 `/usr/bin/sudo` 被替换了，为什么没有告警？"
- "有人在 `/etc/apt/apt.conf.d/` 放了一个文件，之后每次 `apt upgrade` 都在偷偷执行东西。"
- "我们做了安全加固，改了一批 `/usr/bin` 的权限，你们的完整性检测一直报差异，误报太多。"
- "客户要求证明主机没有被植入后门，`rpm -V` 的结果能不能直接给？"

这四类问题指向同一个技术面：**包管理器既是可信基线的来源，也是攻击者最省事的篡改入口**。包管理器知道"这个文件应该长什么样"，所以它天然是完整性检测的第一站；但它的数据库和配置目录都写在同一个文件系统上，攻击者改文件的同时也能改基线。

这一篇就把这条链路拆开讲清楚：校验原理、输出格式解析、可信基线的边界、Hook 面（APT / dpkg / DNF）、采集与归因、性能与降噪、攻击链关联。

---

## 高频面试题

### Q1：`dpkg --verify` 和 `rpm -V` 到底校验了什么？输出格式长什么样？

**简洁答案**

两者都是"把磁盘上的文件"和"包管理器数据库里记录的元数据"做对比，但覆盖的属性差别很大。

- `dpkg --verify`（等价 `dpkg -V`）：dpkg 官方手册明确写了 *"Currently the only functional check performed is an md5sum verification of the file contents against the stored value in the files database. It will only get checked if the database contains the file md5sum."*，并且强调 *"This is only an integrity check and should not be considered as any kind of security verification."* 自 dpkg 1.21.0 起多了一个 mode 位的启发式检查，其余位恒为 `?`。
- `rpm -V`：比较 size、digest、permissions、type、owner、group、link target、mtime、capabilities，默认只输出有差异的条目。

**关键知识点**

`dpkg --verify` 默认使用 **rpm 格式**输出（`--verify-format rpm`，自 dpkg 1.17.2 起支持），有两种行：

```
missing   [c] pathname [(error-message)]
?M5?????? [c] pathname
```

前 9 个字符是各检查项的结果：

| 位置 | 取值 | 含义 |
| --- | --- | --- |
| 1 | `?` | 该检查不支持，恒为 `?` |
| 2 | `M` | mode 检查失败（仅启发式，见 Q4） |
| 3 | `5` | 摘要（MD5）不一致，即文件内容变了 |
| 4-9 | `?` | 不支持 |

再往后是可选的属性字符 `c`（conffile，管理员配置过的文件），最后是路径。`missing` 行表示文件不存在或元数据取不到，错误信息放在行尾括号里。

`rpm -V` 的输出是 9 个结果字符 + 可选属性字符 + 路径：

| 字符 | 含义 | 字符 | 含义 |
| --- | --- | --- | --- |
| `S` | 大小不同 | `U` | 属主不同 |
| `M` | 模式不同（含权限与文件类型） | `G` | 属组不同 |
| `5` | 摘要不同 | `T` | mtime 不同 |
| `D` | 设备号不同 | `P` | capabilities 不同 |
| `L` | 符号链接目标不同 | `.` | 通过 |

属性字符还有 `a`（artifact）、`c`（配置文件）、`d`（文档）、`g`（ghost）、`l`（license）、`m`（missingok，文件缺失不算失败）、`n`（config noreplace）、`r`（readme）、`s`（源码包 spec 文件）。

注意 `m`（missingok）的存在：rpm 允许某个文件缺失而不算校验失败，做检测规则时不能把"rpm 没报"直接等同于"文件存在"。

**Go 落地思路**

解析器要区分三态

> 本文中的 Go 片段属于同一个 `package main`。合并成一个文件时使用下面这组 import；按文件拆分时，每个文件各自保留所需的部分。

```go
import (
	"bufio"
	"crypto/md5"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
)
```
：**通过 / 失败 / 无法校验**。`?` 不是通过，是"没检查"。把 `?` 当成 `.` 处理是 EDR 里最常见的降噪 bug 之一。

```go
// DpkgVerifyResult 表示 dpkg --verify 输出的一个差异条目。
type DpkgVerifyResult struct {
	Attrs    string // 9 位属性串；missing 时为空
	Conffile bool   // 属性字符 'c'：这是 conffile
	Path     string
	Missing  bool
	ErrMsg   string
}

// ParseDpkgVerifyOutput 解析 `dpkg --verify`（rpm 格式）的输出。
func ParseDpkgVerifyOutput(r io.Reader) ([]DpkgVerifyResult, error) {
	var out []DpkgVerifyResult
	sc := bufio.NewScanner(r)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		res, ok := parseDpkgVerifyLine(line)
		if !ok {
			continue
		}
		out = append(out, res)
	}
	return out, sc.Err()
}

func parseDpkgVerifyLine(line string) (DpkgVerifyResult, bool) {
	if strings.HasPrefix(line, "missing") {
		rest := strings.TrimSpace(strings.TrimPrefix(line, "missing"))
		res := DpkgVerifyResult{Missing: true}
		if i := strings.LastIndex(rest, "("); i >= 0 && strings.HasSuffix(rest, ")") {
			res.ErrMsg = rest[i+1 : len(rest)-1]
			rest = strings.TrimSpace(rest[:i])
		}
		fields := strings.Fields(rest)
		if len(fields) > 0 && fields[0] == "c" {
			res.Conffile = true
			fields = fields[1:]
		}
		if len(fields) == 0 {
			return DpkgVerifyResult{}, false
		}
		res.Path = fields[0]
		return res, true
	}

	fields := strings.Fields(line)
	if len(fields) == 0 || len(fields[0]) != 9 || !isDpkgAttrString(fields[0]) {
		return DpkgVerifyResult{}, false
	}
	res := DpkgVerifyResult{Attrs: fields[0]}
	rest := fields[1:]
	if len(rest) > 0 && rest[0] == "c" {
		res.Conffile = true
		rest = rest[1:]
	}
	if len(rest) == 0 {
		return DpkgVerifyResult{}, false
	}
	res.Path = rest[0]
	return res, true
}

// isDpkgAttrString 判断 9 位属性串是否合法：'.' 通过、'?' 未检查、其余为失败标记。
func isDpkgAttrString(s string) bool {
	if len(s) != 9 {
		return false
	}
	for _, r := range s {
		switch {
		case r == '.' || r == '?':
		case r >= 'A' && r <= 'Z', r >= 'a' && r <= 'z', r >= '0' && r <= '9':
		default:
			return false
		}
	}
	return true
}

// DigestMismatch 表示第 3 位 '5'：文件内容摘要与数据库不一致。
func (r DpkgVerifyResult) DigestMismatch() bool {
	return !r.Missing && len(r.Attrs) >= 3 && r.Attrs[2] == '5'
}

// ModeMismatch 表示第 2 位 'M'：模式启发式检查失败。
func (r DpkgVerifyResult) ModeMismatch() bool {
	return !r.Missing && len(r.Attrs) >= 2 && r.Attrs[1] == 'M'
}
```


---

### Q2：为什么"包管理器校验通过"不能证明主机没被篡改？攻击者有哪几种绕过姿势？

**简洁答案**

因为**基线和被检查对象在同一个可写文件系统上**。dpkg 官方手册说得很直白：数据库里的摘要来自二进制包本身，但它就存在 `/var/lib/dpkg` 里。

**关键知识点**

典型绕过有三条：

1. **同步改基线**：攻击者改了 `/usr/bin/ssh`，同时重算 MD5 并写回 `/var/lib/dpkg/info/<pkg>.md5sums`。此时 `dpkg -V` 全绿，但文件已经是攻击者的版本。
2. **删除基线条目**：dpkg 手册原文 *"It will only get checked if the database contains the file md5sum"* —— 攻击者把某个文件的摘要记录删掉，校验就跳过这个文件。
3. **换掉信任根**：直接重写 rpm 数据库（`/var/lib/rpm`）或 dpkg 的 `status` 文件，让"正确值"变成攻击者想要的值。

因此完整性检测必须分层：

| 层 | 信任来源 | 能发现什么 | 不能发现什么 |
| --- | --- | --- | --- |
| 状态面 | 本机数据库 | 未同步篡改 | 基线被同步改写 |
| 事件面 | auditd/eBPF 写事件 | 谁在什么时候改了基线 | 基线本来就是错的 |
| 外部信任面 | 上游签名包 / 内网镜像 | 数据库被整体替换 | 本机文件被替换但数据库同步更新 |

**Go 落地思路**

产品化时的取舍是：**用状态面做常规检测，用事件面补归因，用外部信任面做定期重锚**（例如重装校验工具、把可信摘要清单从配置中心拉下来比对）。只做状态面是"自证清白"式的伪安全，这一点在跟客户解释清楚之前不要写进宣传材料。

同时，基线文件本身应当纳入高危监控面：`/var/lib/dpkg/info/*.md5sums`、`/var/lib/dpkg/status`、`/var/lib/rpm/` 一旦发生写入，就是高价值事件（正常运维极少改这些文件）。

---

### Q3：dpkg 的数据库结构长什么样？为什么"文件缺失"和"内容被改"要分开告警？

**简洁答案**

dpkg 的管理目录默认是 `/var/lib/dpkg`（`dpkg-divert --admindir` 的默认值），里面 `status`、`available` 记录包状态，`diversions` 记录文件转移（见 Q7），`info/` 目录按包名存放清单（`.list`）、摘要（`.md5sums`）、配置文件列表（`.conffiles`）和维护脚本（`preinst`/`postinst`/`prerm`/`postrm`）、触发器（triggers）等。`dpkg(1)` 的 FILES 章节确认了 `/var/lib/dpkg/available`、`/var/lib/dpkg/status`、`/var/log/dpkg.log` 以及 `/etc/dpkg/dpkg.cfg.d/[0-9a-zA-Z_-]*`（自 dpkg 1.15.4）。

**关键知识点**

两类差异的语义完全不同：

- `missing`（文件不存在）：常见于 rootkit 把自己从文件列表里"摘掉"、或者二进制被删除后由别的程序接管。
- 摘要位 `5`（内容变了）：常见于二进制补丁、动态库注入、配置文件被改。

把它们混成一个"完整性异常"上报，值班同学没法判断优先级，客户也无法评估影响面。

**Go 落地思路**

差异条目先分桶计数，再决定告警级别与合并策略：

```go

```


另外要单独准备"不在包管理范围内"的清单：安全 Agent 自己安装的文件、第三方 agent、配置管理工具（Ansible/Salt）推送的文件，它们本来就不在包数据库里，出现差异是正常的。

---

### Q4：dpkg 的 mode 检查（第 2 位 `M`）到底靠不靠谱？能不能用它替代 setuid 检测？

**简洁答案**

不能。dpkg 官方手册对 `M` 的说明是：*"Because pathname metadata is currently not tracked, this check can only be partially emulated via a very simple heuristic for pathnames that have a known digest, which implies they should be regular files, where the check will fail if the pathname is not a regular file on the filesystem. This check will currently never succeed as it does not have enough information available."*

**关键知识点**

翻译成大白话：dpkg 只知道"这个路径有摘要，那它应该是普通文件"，所以 `M` 实际只覆盖了"类型是不是普通文件"这一条启发式。它**没有**记录原始权限位、属主、setuid、setgid，因此：

- 你把 `/usr/bin/sudo` 的 setuid 位去掉，`dpkg -V` 不会因此报 `M`；
- 你把 `/usr/bin/sudo` 换成目录，它会报 `M`。

这意味着 setuid / capabilities 篡改检测必须自己单独做（参考本仓库 `go-hids-linux-suid-capability-privesc-detection.md` 的思路：基于 `stat` 的 mode 位 + `getcap` 的 file capabilities + 与基线比对）。

**Go 落地思路**

设计检测规则时，把三个数据源分开，不要指望一个工具全包：

1. `dpkg -V` → 内容维度（摘要）；
2. `stat` / `getcap` → 权限与 capabilities 维度；
3. 事件面（auditd / eBPF 对 `chmod`、`setxattr`、`fsetcap` 的采集）→ 谁改的。

三者的差异位不要混在一个规则里，否则"合法加固"和"恶意篡改"永远分不开。

---

### Q5：APT 的 `DPkg::Pre-Invoke` / `Post-Invoke` 是什么？为什么它是持久化的高价值目标？

**简洁答案**

`apt.conf(5)` 明确记录了 `DPkg` 配置段中的这几个指令：`Pre-Invoke`、`Post-Invoke` 是 shell 命令列表，在调用 `dpkg(1)` 之前 / 之后用 `/bin/sh` 依次执行，任一命令失败 APT 会中止；`Pre-Install-Pkgs` 在调用 `dpkg(1)` 之前执行，并把要安装的 `.deb` 文件名逐行写到指定文件描述符（默认标准输入），APT 的协议版本 2 还会额外传递包动作与版本信息。

**关键知识点**

APT 读取配置的顺序（`apt.conf(5)`）：

1. `APT_CONFIG` 环境变量指定的文件；
2. `Dir::Etc::Parts` 目录下按字母序排列的文件，文件名要么没有扩展名，要么是 `.conf`（默认该目录是 `/etc/apt/apt.conf.d`）；
3. `Dir::Etc::main` 指定的主配置文件（默认 `/etc/apt/apt.conf`）；
4. 二进制工具自身的配置子树；
5. 命令行参数。

所以攻击者只要能写 `/etc/apt/apt.conf.d/99-xxx.conf`，就能让**每一次 apt 操作**都执行自己的命令，而且 APT 自己不会报错。同一时刻，dpkg 自身还有一层 hook：`dpkg(1)` 的 `--pre-invoke=command` / `--post-invoke=command`（自 1.15.4 起），作用在 unpack / configure / install / triggers-only / remove / purge 动作前后，通过 `sh -c` 执行；手册还提醒 **配置文件里的选项优先**，并且前端工具可能一次调用触发多次 dpkg，hook 就会执行多次。

**Go 落地思路**

把 `apt.conf.d`、`dpkg.cfg.d`、`yum.repos.d` 当成同一类"Hook 面"统一监控：目录快照 + 内容指纹 + 事件采集。hook 文件的特点是**体积小、几乎不变、正常变更极低频**，这类基线非常适合高准确率检测。

```go
// HookSnapshot 是某个 hook 目录的基线快照：路径 -> 内容摘要。
type HookSnapshot map[string]string

// HookChange 描述基线与现状之间的差异。
type HookChange struct {
	Path   string
	Kind   string // added / removed / modified
	OldSHA string
	NewSHA string
}

// SnapshotHooks 采集指定目录下的 hook 文件摘要。
func SnapshotHooks(dirs []string) (HookSnapshot, error) {
	snap := HookSnapshot{}
	for _, dir := range dirs {
		entries, err := os.ReadDir(dir)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return nil, err
		}
		for _, e := range entries {
			if e.IsDir() {
				continue
			}
			sum, err := sha256File(filepath.Join(dir, e.Name()))
			if err != nil {
				continue
			}
			snap[filepath.Join(dir, e.Name())] = sum
		}
	}
	return snap, nil
}

// DiffHookSnapshots 比较基线与现状。
func DiffHookSnapshots(base, cur HookSnapshot) []HookChange {
	var changes []HookChange
	keys := make(map[string]struct{}, len(base)+len(cur))
	for k := range base {
		keys[k] = struct{}{}
	}
	for k := range cur {
		keys[k] = struct{}{}
	}
	ordered := make([]string, 0, len(keys))
	for k := range keys {
		ordered = append(ordered, k)
	}
	sort.Strings(ordered)

	for _, k := range ordered {
		oldSum, hadOld := base[k]
		newSum, hasNew := cur[k]
		switch {
		case !hadOld && hasNew:
			changes = append(changes, HookChange{Path: k, Kind: "added", NewSHA: newSum})
		case hadOld && !hasNew:
			changes = append(changes, HookChange{Path: k, Kind: "removed", OldSHA: oldSum})
		case oldSum != newSum:
			changes = append(changes, HookChange{Path: k, Kind: "modified", OldSHA: oldSum, NewSHA: newSum})
		}
	}
	return changes
}

func sha256File(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()
	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}
```


配合一个"命名习惯"检查，能低成本抓出伪装成普通配置的 hook 文件（apt 的 `Dir::Etc::Parts` 允许无扩展名文件，dpkg 的片段名有字符集限制）：

```go
// IsHookNameSuspicious 判断文件名是否偏离该目录的常规命名习惯。
func IsHookNameSuspicious(dir, name string) bool {
	base := filepath.Base(name)
	switch filepath.Base(dir) {
	case "apt.conf.d":
		return !strings.HasSuffix(base, ".conf") && base != "apt.conf"
	case "dpkg.cfg.d":
		return !isDpkgCfgFragment(base)
	case "yum.repos.d":
		return !strings.HasSuffix(base, ".repo")
	}
	return false
}

func isDpkgCfgFragment(name string) bool {
	for _, r := range name {
		switch {
		case r >= '0' && r <= '9', r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r == '_', r == '-':
		default:
			return false
		}
	}
	return name != ""
}
```


---

### Q6：`/etc/dpkg/dpkg.cfg.d/` 目录危险在哪？`--path-exclude` 之类选项能被怎么滥用？

**简洁答案**

`dpkg.cfg(5)` 的 FILES 章节列出了三处配置入口：`/etc/dpkg/dpkg.cfg.d/[0-9a-zA-Z_-]*`（自 dpkg 1.15.4 起的片段目录）、`/etc/dpkg/dpkg.cfg`、`~/.dpkg.cfg`。这些文件里的每一行都是一条 dpkg 命令行选项（不带前导 `--`），所以**能写这个文件 = 能改 dpkg 的行为**。

**关键知识点**

最危险的是 `dpkg(1)` 的 `--path-exclude=glob-pattern` / `--path-include=glob-pattern`：它们设置安装时的路径过滤规则，"excluding or re-including previously excluded paths"。手册里的通配符规则值得注意 —— `*` 匹配任意字符序列，**包括 `/` 本身**，所以 `/usr/*/READ*` 会匹配到 `/usr/share/doc/package/README`。手册同时警告：*"depending on the excluded paths you might completely break your system"*。

攻击者写下 `path-exclude=/usr/bin/*` 之后：

- 后续升级不会覆盖 `/usr/bin` 下的文件，攻击者替换掉的二进制可以长期存活；
- 由于文件"还在"，`dpkg -V` 也不会报缺失。

而 `path-include` 可以用来在排除规则之上精确放行某些路径，形成更精细的规避。

**Go 落地思路**

检测侧要做两件事：

1. **内容面**：解析 `dpkg.cfg.d` 片段中的键值，只对高危键告警 —— `path-exclude`、`path-include`、`pre-invoke`、`post-invoke`、`force-confnew`/`force-confold`、`force-unsafe-io`。这类键在同一台机器上出现几乎是零基线事件，误报率极低。
2. **事件面**：监控 `/etc/dpkg/dpkg.cfg.d/` 的创建与写入。用 inotify 或 fanotify 都可以；目录里文件数量极少，inotify 足够且开销远低于全盘 fanotify。

注意 `~/.dpkg.cfg` 是**用户级**配置：普通用户在自己家目录写这个文件就能影响以该用户身份运行的 dpkg 调用（例如用 dpkg 解包一个下载的 `.deb`），这是很多产品漏掉的采集点。

---

### Q7：`dpkg-divert` 是什么？攻击者能用它做什么？

**简洁答案**

`dpkg-divert(1)` 的定位是"override a package's version of a file"：通过 diversion 机制，强制 dpkg 把某个文件安装到 diverted 位置而不是原路径，从而"让某个包不装这个文件"。diversion 列表存放在 `/var/lib/dpkg/diversions`（dpkg-divert 替换该文件前会保留一份带 `-old` 后缀的旧副本）。`--listpackage` 可以打印 divert 某个文件的包名，输出 `LOCAL` 表示是本地 divert；`--local` 选项表示"所有包的版本都被 divert，没有例外"。

**关键知识点**

安全上值得关注的三个点：

1. **本地 divert 优先级最高**：`--local` 意味着连官方包自己的版本也会被 divert 走。正常发行版几乎不会用 `--local` divert 系统关键路径，出现即高危。
2. **divert 与校验的关系**：被 divert 的文件在 dpkg 眼里"已经处理过"，因此原路径上被替换的文件不会触发 `dpkg -V` 的 `missing`。diversions 列表本身就是一份"哪些路径不可信"的清单。
3. **官方手册的陷阱提示**：NOTES 里写明 *"ldconfig does not honor diverts (only dpkg does)"* —— 被 divert 的库如果 SONAME 与未 divert 的库相同，`ldconfig` 生成的符号链接可能指向被 divert 的那一份。这是一个"绕过 dpkg 直接影响动态链接"的路径。

**Go 落地思路**

把 `/var/lib/dpkg/diversions` 纳入基线快照：条目新增、删除、指向变化都要记录。规则上，`--local` 产生的 `LOCAL` 条目、与 `/usr/bin`、`/usr/sbin`、`/usr/lib` 等高价值路径相关的条目，直接给高优先级。

这里的关键认知是：**diversion 是一个"合法绕过校验"的官方机制**，检测它必须先理解语义，否则会把正常的发行版定制当成攻击。

---

### Q8：DNF / YUM 侧有哪些必须纳入监控的配置面？

**简洁答案**

`dnf.conf(5)`（`yum.conf(5)` 现在是它的转发页）给出的结构是：全局配置文件 `/etc/dnf/dnf.conf`，以及 `/etc/yum.repos.d` 下的所有 `*.repo` 文件；**仓库配置优先于全局配置**。

**关键知识点**

这个结构里藏着两个高价值目标：

1. **`/etc/yum.repos.d/*.repo` 的 `baseurl`**：攻击者把 `baseurl` 指向自己的镜像站，后续任何 `dnf update` 都会从恶意源拉包 —— 典型的软件供应链投毒入口。而且这个改动**完全合法**（文件格式没变、权限正常），只靠文件完整性检查发现不了，必须看**内容语义**（源地址是否在可信列表内）。
2. **`/etc/dnf/dnf.conf` 及其插件配置**：DNF 支持加载插件，插件既可以来自系统目录，也可以来自 Python 的 site-packages 路径（插件的 `.conf` 放在 `/etc/dnf/plugins/` 一类的目录里，具体路径随发行版版本变化，**需在目标主机核验**）。插件以 root 权限执行 Python 代码，是与 APT hook 等价的高危面。

**Go 落地思路**

- 对 `*.repo` 文件做**语义级基线**：提取 `baseurl`、`gpgkey`、`enabled`、`metadata_expire` 等关键字段建立基线，而不是整文件摘要。整文件摘要会把任何无害的注释改动也报成事件。
- 把"源地址变更"作为独立的告警类型，与"文件被篡改"分开。语义基线更抗干扰，也更接近客户能看懂的说法。

---

### Q9：采集链路怎么设计？状态面和命令面各自能拿到什么证据？

**简洁答案**

三条采集链路互补，缺一不可。

**关键知识点**

| 采集方式 | 能拿到的证据 | 拿不到的 |
| --- | --- | --- |
| 状态面（读文件、跑 `dpkg -V` / `rpm -Va`） | 现在是什么状态 | 谁改的、什么时候改的 |
| 命令面（auditd / eBPF 采集 `execve`、文件写、`chmod`） | 谁在什么时候执行了什么 | 之前的基线是什么 |
| 语义面（解析 repo、`apt.conf`、diversions） | 配置意图是否被改 | 执行过程 |

几个具体的选型判断：

- **不要自己解析 rpm 数据库**。`/var/lib/rpm` 是二进制 Berkeley DB / sqlite 格式，版本差异大，自己写解析器成本高且脆。直接执行 `rpm -Va` 并解析标准输出，是"用现成能力"的最优解。dpkg 侧同理，优先 `dpkg --verify`。
- **auditd** 适合做基线目录（`/var/lib/dpkg`、`/etc/apt`、`/etc/dnf`、`/etc/dpkg`）的写监控，能直接给出 syscall、pid、uid。
- **eBPF** 适合做"谁执行了 `dpkg` / `apt` / `rpm` / `dpkg-divert`"，并把进程树和后续行为串起来。
- **inotify** 适合 hook 目录这类小目录的创建/写入监控，开销极低。

**Go 落地思路**

统一成"事件"结构，把状态面与命令面用同一套 schema 汇聚，这样后面做攻击链关联才不会写两套逻辑：

```go
// RpmAttrs 是 rpm --verify 输出的 9 位属性结果。
type RpmAttrs struct {
	SizeDiff     bool // S
	ModeDiff     bool // M
	DigestDiff   bool // 5
	DeviceDiff   bool // D
	LinkDiff     bool // L
	UserDiff     bool // U
	GroupDiff    bool // G
	MTimeDiff    bool // T
	Capabilities bool // P
	Unchecked    int  // '?' 的个数
}

// RpmVerifyResult 是一条 rpm 校验差异。
type RpmVerifyResult struct {
	Attrs    RpmAttrs
	AttrChar string // a/c/d/g/l/m/n/r/s，可为空
	Path     string
}

// ParseRpmVerifyOutput 解析 `rpm -Va` 的输出。
func ParseRpmVerifyOutput(r io.Reader) ([]RpmVerifyResult, error) {
	var out []RpmVerifyResult
	sc := bufio.NewScanner(r)
	for sc.Scan() {
		line := strings.TrimRight(sc.Text(), "\r")
		if strings.TrimSpace(line) == "" {
			continue
		}
		res, ok := parseRpmVerifyLine(line)
		if !ok {
			continue
		}
		out = append(out, res)
	}
	return out, sc.Err()
}

func parseRpmVerifyLine(line string) (RpmVerifyResult, bool) {
	if len(line) < 9 {
		return RpmVerifyResult{}, false
	}
	attrs, ok := decodeRpmAttrs(line[:9])
	if !ok {
		return RpmVerifyResult{}, false
	}
	rest := strings.TrimLeft(line[9:], " ")
	res := RpmVerifyResult{Attrs: attrs}
	if len(rest) > 1 && isRpmAttrChar(rest[0]) && rest[1] == ' ' {
		res.AttrChar = rest[:1]
		rest = strings.TrimLeft(rest[1:], " ")
	}
	res.Path = rest
	return res, true
}

func decodeRpmAttrs(s string) (RpmAttrs, bool) {
	var a RpmAttrs
	if len(s) != 9 {
		return a, false
	}
	for _, r := range s {
		switch r {
		case '.':
		case '?':
			a.Unchecked++
		case 'S':
			a.SizeDiff = true
		case 'M':
			a.ModeDiff = true
		case '5':
			a.DigestDiff = true
		case 'D':
			a.DeviceDiff = true
		case 'L':
			a.LinkDiff = true
		case 'U':
			a.UserDiff = true
		case 'G':
			a.GroupDiff = true
		case 'T':
			a.MTimeDiff = true
		case 'P':
			a.Capabilities = true
		default:
			return a, false
		}
	}
	return a, true
}

func isRpmAttrChar(c byte) bool {
	switch c {
	case 'a', 'c', 'd', 'g', 'l', 'm', 'n', 'r', 's':
		return true
	}
	return false
}
```


注意 rpm 的属性位是**定宽**的（前 9 字符），路径可能含空格，所以必须按固定位置切，不能简单地 `strings.Fields` 后取最后一段 —— 那样会把 `/tmp/a b.txt` 解析成 `/tmp/a`。

---

### Q10：怎么给完整性差异做降噪？哪些是常见的误报来源？

**简洁答案**

按"差异维度 × 路径类别"分级，而不是按"文件列表"分级。

**关键知识点**

常见误报来源：

| 误报来源 | 表现 | 处理方式 |
| --- | --- | --- |
| 管理员改了 conffile | `dpkg -V` 报 `c` 文件的 `5` 差异 | conffile 单列规则，默认降级 |
| 安全加固改了权限 | rpm 报 `M` | 权限维度交给单独的基线（setuid/capability），不与内容混报 |
| 单文件手工升级 | rpm 报 `T`/`S` | mtime 差异单独降级 |
| 第三方 agent 安装的文件 | 不在包数据库里，但文件存在 | 维护"不在包管理范围"白名单 |
| 容器镜像内 apt 装完就清 | `/var/lib/apt/lists` 变化 | 容器场景单独策略 |
| 配置管理工具推送 | 文件内容与包内版本不同 | 与变更工单/CMDB 关联 |

还有一个常被忽略的：**`T`（mtime）差异几乎是最没有信息量的差异**，很多发行版打包工具、镜像构建、rsync 同步都会改 mtime。把 `T` 单独告警基本等于制造噪声。

**Go 落地思路**

一个实用的分级例子：

```go
// IntegrityVerdict 是单条差异的最终判定。
type IntegrityVerdict string

const (
	VerdictHigh   IntegrityVerdict = "high"   // 内容被改 / 文件被删
	VerdictMedium IntegrityVerdict = "medium" // 权限或属主差异
	VerdictLow    IntegrityVerdict = "low"    // 仅 mtime 差异
	VerdictIgnore IntegrityVerdict = "ignore"
)

// ClassifyRpmDifference 依据差异位与属性字符给出分级。
func ClassifyRpmDifference(r RpmVerifyResult) IntegrityVerdict {
	switch {
	case r.Attrs.DigestDiff:
		return VerdictHigh
	case r.Attrs.LinkDiff || r.Attrs.DeviceDiff:
		return VerdictHigh
	case r.Attrs.ModeDiff || r.Attrs.UserDiff || r.Attrs.GroupDiff || r.Attrs.Capabilities:
		return VerdictMedium
	case r.Attrs.MTimeDiff || r.Attrs.SizeDiff:
		return VerdictLow
	default:
		return VerdictIgnore
	}
}
```


再叠加路径规则：`/etc/**` 的配置文件差异默认降级（除非是 `missing`），`/usr/bin`、`/usr/sbin`、`/usr/lib` 的内容差异直接高优。

---

### Q11：性能上，全量校验怎么做得住？

**简洁答案**

全量 `rpm -Va` 的成本在**读文件算摘要**，不在 stat。几万个包、几十万文件的主机上，这是一次实打实的全盘读，会和业务 IO 抢资源。

**关键知识点**

分层降本的思路：

1. **元数据预筛**：先用 `stat` 拿 size + mtime + mode，只有和基线不一致的文件才去算摘要。大部分"没被改过"的文件在这一步就被排除，成本降一到两个数量级。
2. **摘要缓存**：用 `(路径, size, mtime, mode)` 作为缓存 key，命中就不重算。但要清楚这个缓存的弱点：攻击者如果能保留 mtime（`touch -r`）并改内容，缓存会漏检 —— 所以高价值路径（`/usr/bin`、`/usr/sbin`、动态库、setuid 文件）不能只依赖缓存，要定期强制重算。
3. **分优先级 + 分批**：先扫高价值路径，再扫全量；错峰执行，避开业务高峰和备份窗口。
4. **限并发**：Go 里用固定 worker 数 + 令牌桶限速，避免把磁盘打满。

**Go 落地思路**

```go
// VerifyFileAgainstBaseline 计算文件当前 MD5 并与基线比对。
func VerifyFileAgainstBaseline(root, path, want string) (state string, got string, err error) {
	full := filepath.Join(root, filepath.Clean("/"+path))
	f, err := os.Open(full)
	if err != nil {
		if os.IsNotExist(err) {
			return "missing", "", nil
		}
		return "unknown", "", err
	}
	defer f.Close()

	h := md5.New()
	if _, err := io.Copy(h, f); err != nil {
		return "unknown", "", err
	}
	got = hex.EncodeToString(h.Sum(nil))
	if got == strings.ToLower(want) {
		return "ok", got, nil
	}
	return "mismatch", got, nil
}
```


这个函数体现两个容易被忽略的工程细节：

- `state` 是**三态**（`ok` / `mismatch` / `missing`），错误时返回 `unknown` 而不是 `ok` —— 采集失败绝不能被当成"校验通过"。
- `filepath.Join(root, filepath.Clean("/"+path))` 做了路径穿越防护：`Clean("/"+path)` 保证 `../` 之类的路径被规整到根目录之下。基线数据来自外部输入时，这一步不能省。

配套的基线解析：

```go
// ParseDpkgMD5Sums 解析 /var/lib/dpkg/info/<pkg>.md5sums 形式的内容。
func ParseDpkgMD5Sums(r io.Reader) (map[string]string, error) {
	out := make(map[string]string)
	sc := bufio.NewScanner(r)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		fields := strings.Fields(line)
		if len(fields) != 2 {
			continue
		}
		sum, path := fields[0], fields[1]
		if _, err := hex.DecodeString(sum); err != nil {
			continue
		}
		out[path] = strings.ToLower(sum)
	}
	return out, sc.Err()
}
```


---

### Q12：怎么把包管理器篡改和后续攻击行为关联起来？

**简洁答案**

单点告警价值有限，完整的链路是：**基线被改 → 下一次包操作触发执行 → 产生异常进程行为**。

**关键知识点**

三条典型攻击链：

1. **Hook 注入链**：写入 `/etc/apt/apt.conf.d/99-x.conf`（内含 `DPkg::Pre-Invoke`）→ 管理员执行 `apt upgrade` → hook 以 root 拉起攻击者命令 → 该命令的外联、落地文件、权限变更被其它规则捕获。
2. **路径排除 + 载荷驻留链**：写入 `path-exclude` 让 `/usr/bin/xxx` 不再被升级覆盖 → 替换该二进制 → 攻击者后续执行它时，进程画像（路径签名不符、父进程异常）触发告警。
3. **基线同步篡改链**：改二进制 + 同步改 `md5sums` → 完整性检查全绿 → 只能靠"这个二进制被执行了"这一侧发现。

第 3 条说明了一件事：**完整性检测不是独立防线，它必须和运行时检测互相印证**。

**Go 落地思路**

关联的两个关键要素是**时间窗**和**主体**：

- 时间窗：`hook 变更时间 T` 与 `异常 exec 时间 T+Δ`（Δ 取一个包操作的自然间隔，比如 24 小时内）；
- 主体：变更的 uid/pid（来自 auditd 或 eBPF），与后续执行进程的用户、命令行、父进程做交叉。

工程上建议把"包管理器完整性差异"做成**上下文事件（context event）**，而不是独立告警：它本身不直接告警，而是给同一时间窗内的其他行为加权或做关联。这既降噪，又保留了它在攻击链里的位置。

---

## 知识点速查表

| 维度 | 要点 |
| --- | --- |
| `dpkg -V` 语义 | 只做 MD5 完整性检查，官方明确"不是安全验证"；数据库没有摘要则不检查 |
| `dpkg -V` 输出 | rpm 格式；`missing [c] path [(err)]` 或 `?M5?????? [c] path`；第 2 位 `M`、第 3 位 `5` |
| `rpm -V` 输出 | 9 位定宽属性：`S M 5 D L U G T P`；`.` 通过、`?` 未检查；属性字符 `a c d g l m n r s` |
| dpkg 配置面 | `/etc/dpkg/dpkg.cfg`、`/etc/dpkg/dpkg.cfg.d/[0-9a-zA-Z_-]*`、`~/.dpkg.cfg` |
| dpkg 高危选项 | `path-exclude` / `path-include`（`--path-exclude` 自 1.15.4 起）、`pre-invoke` / `post-invoke`（`sh -c`，配置优先） |
| APT 配置面 | `APT_CONFIG` → `Dir::Etc::Parts`（默认 `/etc/apt/apt.conf.d`，字母序、无扩展名或 `.conf`）→ `Dir::Etc::main`（`/etc/apt/apt.conf`）→ 命令行 |
| APT hook | `DPkg::Pre-Invoke` / `Post-Invoke` / `Pre-Install-Pkgs`，用 `/bin/sh` 执行，失败则中止 |
| DNF 配置面 | `/etc/dnf/dnf.conf` + `/etc/yum.repos.d/*.repo`；仓库配置优先；`baseurl` 变更是供应链投毒入口 |
| dpkg diversion | `/var/lib/dpkg/diversions`，保留 `-old` 备份；`--local` 优先级最高；`ldconfig` 不遵循 divert |
| 三态原则 | 通过 / 失败 / 无法校验；采集失败必须表达为 unknown，不能当作通过 |
| 降噪维度 | 内容（摘要）> 链接/设备 > 权限/属主/capability > mtime/大小；conffile 单列 |
| 性能策略 | 元数据预筛 → 摘要缓存 → 高价值路径强制重算 → 限并发分批 |
| 信任边界 | 本机数据库可被同步篡改；完整性检测必须与运行时检测互相印证 |

---

## 小练习 / 复盘题

1. 写出 `dpkg --verify` 输出中 9 个属性位的含义，并解释为什么第 4-9 位永远是 `?`。
2. `rpm -V` 的输出里 `S.5....T.  c /etc/passwd` 每个字符分别代表什么？这条记录应该定成什么级别？
3. 解释 "conffile" 标记 `c` 的实际含义，以及它为什么是降噪的关键。
4. 攻击者修改了 `/usr/bin/ssh` 并同步更新了 `/var/lib/dpkg/info/openssh-server.md5sums`，此时 `dpkg -V` 的输出是什么？你有哪三种手段仍然能发现它？
5. 用 `dpkg-divert` 把 `/usr/local/bin/curl` divert 掉，说明这会不会让 `dpkg -V` 报缺失，以及为什么。
6. 设计一个规则，检测 `/etc/dpkg/dpkg.cfg.d/` 下出现包含 `path-exclude` 的片段文件，并说明它与 `apt.conf.d` 里 `DPkg::Pre-Invoke` 规则在归因上的差别。
7. 为什么"配置文件被修改"通常降级，而"系统二进制内容被修改"直接高优？请给出至少两条判定依据。
8. 假设客户的主机上有 12 万个文件来自 RPM，全量 `rpm -Va` 需要 40 分钟。设计一个把耗时降到 5 分钟以内的方案，并说明该方案会引入什么漏检风险。
9. 如果某台主机上 `dpkg -V` 报出 2000 条差异，其中 1900 条是 `/etc/` 下的 `conffile`，剩下 100 条分布在 `/usr/bin`。请给出你的分级与上报策略。
10. 列出你在采集面上会重点监控的 5 个目录，并说明每一个属于哪一类风险（基线篡改 / hook / 供应链 / 权限）。
11. 一个攻击者用 `APT_CONFIG` 环境变量指向了 `/tmp/x.conf`，里面配置了 `DPkg::Pre-Invoke`。基于 apt.conf(5) 的配置读取顺序，说明为什么 `/etc/apt/apt.conf.d/` 里的基线检测发现不了它，以及你该怎么补。
12. 写一段 Go 代码，把 `rpm -Va` 的输出解析成"路径 -> 差异位集合"，并对含空格路径做一次单测验证。

---

## 参考资料

1. [Linux man-pages：dpkg(1)](https://man7.org/linux/man-pages/man1/dpkg.1.html) —— `--verify` 语义、`--verify-format rpm` 的属性位定义、`--path-exclude` / `--path-include`、`--pre-invoke` / `--post-invoke`
2. [Linux man-pages：rpm(8)](https://man7.org/linux/man-pages/man8/rpm.8.html) —— `--verify` 的 9 位属性表与属性字符、VERIFY OPTIONS
3. [Debian manpages：dpkg.cfg(5)](https://manpages.debian.org/bookworm/dpkg/dpkg.cfg.5.en.html) —— `/etc/dpkg/dpkg.cfg.d/[0-9a-zA-Z_-]*`、`/etc/dpkg/dpkg.cfg`、`~/.dpkg.cfg`
4. [Debian manpages：apt.conf(5)](https://manpages.debian.org/bookworm/apt/apt.conf.5.en.html) —— 配置读取顺序、`DPkg::Pre-Invoke` / `Post-Invoke` / `Pre-Install-Pkgs`
5. [Debian manpages：dpkg-divert(1)](https://manpages.debian.org/bookworm/dpkg/dpkg-divert.1.en.html) —— diversion 语义、`/var/lib/dpkg/diversions`、`--local`、`ldconfig` 不遵循 divert
6. [Linux man-pages：dnf.conf(5)](https://man7.org/linux/man-pages/man5/dnf.conf.5.html) —— `/etc/dnf/dnf.conf` 与 `/etc/yum.repos.d/*.repo` 的优先级
7. [Debian manpages：dpkg(1) FILES](https://manpages.debian.org/bookworm/dpkg/dpkg.1.en.html) —— `/var/lib/dpkg/available`、`/var/lib/dpkg/status`、`/var/log/dpkg.log`
