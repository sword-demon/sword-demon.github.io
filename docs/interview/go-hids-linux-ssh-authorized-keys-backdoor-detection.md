---
title: Go主机安全面试：Linux SSH authorized_keys后门检测
date: 2026-08-06 17:11:54
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- ssh
---

# Go 主机安全面试：Linux SSH authorized_keys 后门检测

攻击者拿到 Linux 主机权限后，常见的持久化方式之一是在用户的 `~/.ssh/authorized_keys` 中写入自己的公钥。这样后续登录会走 SSH 公钥认证，看起来比反弹 Shell、WebShell 或异常进程更“正常”。面试官通常会追问：Go Agent 怎么发现 SSH 公钥被植入？如何区分正常密钥轮换和攻击后门？怎么把文件变化、登录日志和进程链路还原成可解释告警？

## 岗位场景

```text
Linux 主机
  -> 采集用户 home、authorized_keys、sshd 配置、文件事件和登录日志
  -> 标准化账号、key 指纹、文件权限、写入进程、会话来源和认证结果
  -> 识别新增陌生公钥、异常 AuthorizedKeysFile、Web 进程写 key、root 免密入口
  -> 关联 Web RCE、账号提权、sudo、SSH 登录成功和后续命令执行
  -> 输出可解释的 SSH key 持久化告警
```

这类题考的是 Linux SSH 认证链路、文件权限模型、账号体系、登录日志解析、攻击链关联、误报治理和 Go Agent 的轻量采集设计。

## 高频面试题

### 1. 为什么 `authorized_keys` 是高价值检测点？

简洁答案：它直接决定哪些公钥可以登录某个本地账号。攻击者写入自己的公钥后，后续可以绕过密码爆破痕迹，用看似合法的 SSH 公钥认证重新进入主机。

关键知识点：

- 常见路径是 `/root/.ssh/authorized_keys` 和 `/home/<user>/.ssh/authorized_keys`。
- `AuthorizedKeysFile` 可以在 `sshd_config` 中改成其他路径，不能只盯默认文件。
- 公钥认证成功后，登录日志通常只体现账号和来源 IP，不一定直接暴露“新增 key”。
- root 账号、运维账号、应用部署账号的 key 变化风险更高。

Go 落地思路：

- 采集层记录文件路径、inode、mode、uid、gid、mtime、hash 和解析出的 key 指纹。
- 检测层比较前后快照，输出新增、删除、替换和权限漂移。
- 事件模型保留写入进程、父进程链、登录会话和来源 IP，避免只报“文件变了”。

```go
type SSHAuthorizedKey struct {
	User        string
	Path        string
	KeyType     string
	Fingerprint string
	Comment     string
	Options     []string
}
```

### 2. `authorized_keys` 变化应该关注哪些字段？

简洁答案：重点关注新增公钥指纹、key 类型、前置 options、注释、文件权限、属主属组、路径是否偏离基线，以及修改动作来自哪个进程。

关键知识点：

| 关注对象 | 典型字段 | 风险信号 |
| --- | --- | --- |
| key 内容 | type、base64、comment | 陌生指纹、弱算法、异常注释 |
| key options | command、from、environment | 强制命令被改、来源限制被放宽 |
| 文件属性 | mode、uid、gid、inode | 权限过宽、属主异常、文件被替换 |
| 写入来源 | pid、ppid、uid、cmdline | Web 进程、脚本、临时目录二进制写入 |
| 用户上下文 | user、uid、shell、groups | root、高权组、服务账号突然可登录 |

Go 落地思路：

- 不要只保存整文件 hash，要把每条 key 解析成结构化记录，方便解释差异。
- 对解析失败的行保留行号和错误原因，异常格式本身也可能是绕过或误配置。
- 文件属性变化和 key 内容变化分开建模，避免一个告警里混淆“谁能登录”和“文件是否安全”。

### 3. 如何计算 SSH 公钥指纹，为什么不用注释判断？

简洁答案：注释可以随便伪造，指纹来自公钥主体，更适合做稳定身份标识。检测时应以 key type 和公钥 blob 计算指纹，注释只作为辅助信息。

关键知识点：

- `authorized_keys` 一行通常包含 options、key type、公钥内容和 comment。
- comment 常见是邮箱、主机名、工具标记，也可能被攻击者伪装成管理员。
- 指纹常见算法有 SHA256，展示时要和 `ssh-keygen -lf` 的结果尽量一致。
- `ssh-rsa` 不一定都是攻击，但在新环境里可以作为弱算法风险信号。

Go 落地思路：

- 优先使用标准库解析 base64 和 hash，不引入新依赖。
- 解析器只负责生成结构化 key，弱算法判断放到规则层。
- 对同一指纹跨用户、跨主机重复出现的情况做后端关联，不把重逻辑塞进 Agent。

```go
func keyFingerprint(raw []byte) string {
	sum := sha256.Sum256(raw)
	return "SHA256:" + base64.RawStdEncoding.EncodeToString(sum[:])
}
```

### 4. 怎么区分正常密钥轮换和攻击者植入后门？

简洁答案：看变更来源、变更时间、账号角色、key 是否在资产基线内、是否来自可信发布系统，以及变更后是否出现异常 SSH 登录或命令执行。

关键知识点：

- 正常轮换通常来自堡垒机、配置管理、镜像初始化、CI/CD 或运维账号。
- 攻击植入常见链路是 `nginx/php-fpm -> sh -> echo >> authorized_keys`。
- 对 root 写 key、服务账号新增交互 shell、多个账号同时加入同一陌生 key，要提高风险。
- 有些客户会批量更新 key，不能把批量变化天然判为攻击。

Go 落地思路：

- 用 `reason_codes` 表达命中原因，例如 `new_key_for_root`、`web_process_writer`、`unknown_fingerprint`。
- 维护小基线：账号到指纹集合、可信写入进程、维护窗口和主机角色。
- 把“新增 key”与“随后 SSH 公钥登录成功”放在短窗口内关联，提升告警可信度。

```text
Web RCE 进程链
  -> 写入 /root/.ssh/authorized_keys
  -> 5 分钟后同一来源网段 SSH 公钥登录成功
  -> root 执行 curl 下载脚本
  -> 高危 SSH key 持久化告警
```

### 5. `sshd_config` 的哪些配置会影响检测？

简洁答案：`AuthorizedKeysFile`、`PermitRootLogin`、`PubkeyAuthentication`、`Match` 块和 `AllowUsers` 等配置都会改变公钥登录边界，检测时要把配置变化纳入证据链。

关键知识点：

- `AuthorizedKeysFile` 支持多个路径和变量，例如 `%h/.ssh/authorized_keys`。
- `Match User`、`Match Address` 可能让部分账号或来源使用不同策略。
- `PermitRootLogin prohibit-password` 仍允许 root 公钥登录。
- 攻击者可能把 key 文件路径改到更隐蔽的位置，而不是直接修改默认文件。

Go 落地思路：

- 低频解析 `/etc/ssh/sshd_config` 和 include 文件，生成有效配置摘要。
- 先支持关键字段和 include 路径，不必实现完整 OpenSSH 配置解释器。
- 配置变化事件与 key 文件变化事件共享同一条检测时间线。

### 6. 文件事件、审计日志和登录日志各自提供什么证据？

简洁答案：文件事件说明“key 被改了”，审计或进程事件说明“谁改的”，登录日志说明“改完有没有被用来登录”。三者结合才能形成完整闭环。

关键知识点：

| 证据来源 | 能回答的问题 | 常见局限 |
| --- | --- | --- |
| 文件快照 | 新增了哪个 key、文件权限如何 | 不一定知道写入者 |
| auditd/fanotify | 谁打开、写入、rename 了文件 | 环境可能未开启或丢事件 |
| 进程执行 | 是否由 echo、sed、scp、配置管理写入 | 需要父子进程链 |
| auth 日志 | 哪个账号从哪里登录成功 | 不一定直接给出 key 指纹 |

Go 落地思路：

- 文件事件只作为触发，最终重新读取文件并生成快照 diff。
- 登录日志解析要保留账号、来源 IP、认证方式、时间和 sshd pid。
- 检测层用事件时间做窗口关联，处理文件事件和日志事件乱序到达。

### 7. 如何降低 `authorized_keys` 检测误报？

简洁答案：不要把“文件变化”直接等价为入侵。要按账号价值、写入来源、key 是否已知、维护窗口、主机角色和后续行为分级。

关键知识点：

- 云初始化、扩缩容、运维平台和部署系统都可能自动写 key。
- 开发机、跳板机、生产服务器的 key 变化基线不同。
- 只按路径白名单会被绕过，攻击者也会写默认路径。
- 降噪应该保留审计事件，低风险变更可以降级而不是丢弃。

Go 落地思路：

- 对可信来源使用多条件匹配：进程路径、签名或 hash、执行用户、父进程和时间窗口。
- 对高权账号新增陌生 key 即使在维护窗口也保留中危审计。
- 客户反馈误报后用离线 replay 验证规则，不直接扩大白名单。

### 8. Agent 采集这类文件时有哪些可靠性和安全注意点？

简洁答案：关键文件数量有限，适合事件触发加周期快照。重点是避免符号链接绕过、权限不足、读取竞态、路径爆炸和敏感内容泄露。

关键知识点：

- home 目录可能很多，不能无限递归扫描所有隐藏目录。
- `authorized_keys` 可能被 symlink 到其他位置，需要记录真实路径和 link 信息。
- 攻击者可能先写临时文件再 rename，单纯监听 write 可能漏掉最终替换。
- 公钥通常不算 secret，但 comment 里可能包含邮箱、机器名或内部标识，上传前要控制字段。

Go 落地思路：

- 从 `/etc/passwd` 或 NSS 快照获取候选用户，再定位 `.ssh` 目录。
- 对 watch 失败、权限不足和解析失败分别上报健康状态，不影响主链路。
- 使用最大用户数、最大文件大小和扫描周期限制资源消耗。

## 通俗答案

可以把 `authorized_keys` 理解成“谁拿着钥匙就能进门”的名单。HIDS/EDR 不能只看名单有没有变，还要回答：

1. 新钥匙是谁加进去的。
2. 这把钥匙以前是否属于可信管理员或运维系统。
3. 它加到了哪个账号，是否是 root 或高权限账号。
4. 加完以后有没有真的被用于 SSH 登录。
5. 这次变更前后是否存在 Web RCE、提权、日志清理或异常外联。

这些问题回答清楚，告警才不是“文件变化提醒”，而是“SSH key 持久化攻击链”。

## Go 落地要点

```text
采集层
  -> 用户与 home 快照：passwd、home、shell、uid/gid
  -> SSH key 文件：authorized_keys、权限、属主、key 指纹
  -> 配置文件：sshd_config、include、AuthorizedKeysFile
  -> 上下文事件：进程执行、文件写入、登录日志、sudo

标准化层
  -> SSHAuthorizedKey / SSHKeyChangeEvent / SSHLoginEvent
  -> 保留 path、line、fingerprint、uid、pid、ppid、session、source_ip

检测层
  -> key diff
  -> 高权账号和陌生指纹识别
  -> 写入进程与登录行为关联
  -> 基线降噪和 reason_codes 输出
```

工程实现上保持 KISS：先把默认路径、关键配置、key 指纹和登录日志串起来，再逐步补 include、Match 块和客户基线。不要一开始就写复杂的 SSH 配置解释器，否则容易在边界条件里消耗大量时间。

## 学习要点

| 方向 | 需要掌握 |
| --- | --- |
| SSH 认证 | 公钥认证、authorized_keys、sshd_config、PermitRootLogin |
| Linux 文件权限 | mode、uid/gid、home 目录、symlink、rename |
| 日志解析 | auth.log、secure、Accepted publickey、来源 IP |
| 攻击链 | Web RCE、提权、写 key、SSH 回连、后续命令 |
| Go 工程 | 文件快照、结构化 diff、滑动窗口、限流、解析容错 |
| 误报治理 | 账号基线、可信变更源、维护窗口、reason_codes |

## 小练习

1. 设计一个 `SSHKeyChangeEvent`，要求能表达新增 key、删除 key、权限变化和写入进程。
2. 写一个只依赖标准库的函数，解析 `authorized_keys` 中的 key type、base64 公钥和 comment。
3. 给出一条规则：`nginx` 子进程写入 `/root/.ssh/authorized_keys` 后 10 分钟内出现 root SSH 公钥登录，如何打分和解释？
4. 如果客户的配置管理系统每天批量更新 key，你会用哪些字段降噪？
5. `AuthorizedKeysFile` 被改到 `/var/tmp/.keys/%u`，你的采集链路如何发现并扩大监控路径？
6. 复盘一次误报时，你希望保存哪些原始证据和标准化字段？
