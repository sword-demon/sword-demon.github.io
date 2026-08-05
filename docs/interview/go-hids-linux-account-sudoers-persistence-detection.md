---
title: Go主机安全面试：Linux账号新增与sudoers权限持久化检测
date: 2026-08-05 17:32:47
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- account
- sudoers
---

# Go 主机安全面试：Linux 账号新增与 sudoers 权限持久化检测

攻击者拿到一台 Linux 主机后，除了写 cron、systemd 或 SSH key，还可能直接新增账号、修改 UID/GID、加入高权限组，或者在 `sudoers` 里留下免密提权入口。面试官通常会追问：Go Agent 怎么发现账号权限被改？如何区分正常账号运维和后门账号？怎么把文件变化、命令执行、登录日志和 sudo 行为还原成一条攻击链？

## 岗位场景

```text
Linux 主机
  -> 采集账号文件、sudoers 配置、进程执行、登录日志和审计事件
  -> 标准化用户、组、UID/GID、权限配置、修改进程和会话来源
  -> 识别新增高权账号、UID 0 账号、免密 sudo、异常组成员和配置漂移
  -> 关联 Web RCE、SSH 异常登录、sudo/su、文件落地和后续外联
  -> 输出可解释的账号持久化与权限后门告警
```

这类题考的是 Linux 账号体系、文件完整性、权限模型、审计链路、误报治理和 Go Agent 的低开销采集设计。

## 高频面试题

### 1. 为什么账号新增和 sudoers 修改是高价值检测点？

简洁答案：它们直接改变主机的身份入口和提权边界，攻击者一旦留下高权限账号或免密 sudo 规则，后续访问会更像“合法登录”，比单次命令执行更难发现。

关键知识点：

- Linux 本地账号核心文件包括 `/etc/passwd`、`/etc/shadow`、`/etc/group`、`/etc/gshadow`。
- sudo 权限通常来自 `/etc/sudoers` 和 `/etc/sudoers.d/`。
- 风险不只来自新增账号，也来自把普通账号加入 `sudo`、`wheel`、`adm` 等高权限组。
- 攻击者可能使用 `useradd`、`usermod`、`passwd`、`chpasswd`、`visudo`，也可能直接编辑文件。

Go 落地思路：

- 采集层把账号文件和 sudoers 文件的快照、hash、mode、uid、gid、inode 记录下来。
- 进程事件保留 `pid`、`ppid`、`uid`、`euid`、命令行、会话和父进程链。
- 检测层组合“敏感文件变化 + 修改进程 + 登录/提权上下文”，不要只看文件 mtime。

### 2. Linux 账号文件变化应该关注哪些字段？

简洁答案：至少关注用户名、UID、GID、home、shell、密码状态、组成员和文件权限变化，其中 UID 0、异常 shell、空密码和高权限组成员变化最敏感。

关键知识点：

| 文件 | 关注字段 | 高风险变化 |
| --- | --- | --- |
| `/etc/passwd` | user、uid、gid、home、shell | 新增 UID 0、shell 从 `nologin` 变成交互 shell |
| `/etc/shadow` | password hash、last change、expire | 空密码、锁定账号解锁、异常改密 |
| `/etc/group` | group、members | 普通账号加入 `sudo`、`wheel`、`docker` |
| `/etc/gshadow` | admin、members | 组管理员或成员异常变化 |

Go 落地思路：

- 用行解析构建结构化快照，再做前后 diff，避免简单全文比较导致不可解释。
- 对解析失败保留原始错误和文件 hash，因为攻击者也可能故意破坏格式。
- 不在 Agent 里内置过多发行版规则，基础字段标准化后交给规则引擎判断。

```go
type LocalUser struct {
	Name  string
	UID   int
	GID   int
	Home  string
	Shell string
}
```

### 3. sudoers 持久化常见有哪些可疑写法？

简洁答案：重点看 `NOPASSWD`、宽泛命令授权、通配符、危险解释器、可写脚本路径和新建 sudoers.d 文件。

关键知识点：

- `ALL=(ALL) NOPASSWD:ALL` 是典型高危授权。
- 授权 `/bin/sh`、`/bin/bash`、`python`、`perl`、`vim`、`less` 等可逃逸程序风险很高。
- `sudoers.d` 新增文件比修改主文件更隐蔽，很多攻击者会用短文件名伪装。
- sudoers 语法复杂，误解析可能导致误报或漏报，至少要识别用户、主机、runas、标签和命令列表。

Go 落地思路：

- 采集所有 include 路径，记录每条规则来自哪个文件和行号。
- 检测时优先识别高危能力，不要求实现完整 sudoers 解释器。
- 对 `visudo`、配置管理工具、包管理器写入和 Web 进程写入分别打不同风险分。

```go
type SudoRule struct {
	Subject  string
	RunAs    string
	NoPasswd bool
	Commands []string
	Source   string
}
```

### 4. 如何判断“新增用户”是攻击还是正常运维？

简洁答案：不能只看新增账号本身，要看创建者、创建方式、时间、账号属性、来源会话、后续登录和是否命中客户基线。

关键知识点：

- 正常运维常通过堡垒机、配置管理系统、IAM 同步或自动化脚本批量创建。
- 攻击行为常见于 Web 服务用户、异常 SSH 来源、临时目录脚本、反弹 shell 后执行 `useradd`。
- 账号属性也很关键：UID 是否异常、shell 是否可交互、home 是否可疑、是否立即加入高权限组。
- 新账号创建后短时间内出现外部 SSH 登录或 sudo 行为，风险显著升高。

Go 落地思路：

- 建立 `AccountChangeEvent`，把文件 diff 和进程事件合并成同一个安全事件。
- 维护主机侧小基线：常见运维进程、账号命名模式、允许的高权限组。
- 用短窗口关联“账号新增 -> 改密 -> 加组 -> 登录 -> sudo/外联”。

### 5. 账号权限检测为什么需要审计事件和文件快照结合？

简洁答案：审计事件能说明“谁改的”，文件快照能说明“改成了什么”；单独使用任何一边都容易缺证据。

关键知识点：

- auditd 可以记录 `openat`、`rename`、`chmod`、`chown`、`execve` 等动作，但客户环境可能没开启或规则不全。
- inotify/fanotify 能捕获文件变化触发，但不一定可靠拿到完整进程链。
- 定时快照能兜底发现漂移，但实时性较差。
- 攻击者可能直接写文件、先写临时文件再 rename，或修改权限后回写 mtime。

Go 落地思路：

- 文件事件只作为触发信号，最终重新读取目标文件生成结构化快照。
- 对关键路径做周期性校验，避免丢事件后长期失明。
- 事件模型保留 `evidence.source`，让告警能解释来自 auditd、fanotify 还是快照 diff。

```text
auditd execve useradd
  -> /etc/passwd 快照新增 deploy2
  -> /etc/group 快照显示 deploy2 加入 sudo
  -> 3 分钟后 deploy2 SSH 成功登录
  -> 高危账号持久化告警
```

### 6. 如何降低 sudoers 和账号变更误报？

简洁答案：按主机角色、变更来源、账号命名、时间窗口和后续行为分层评分，把正常批量运维降级为审计事件，把攻击链上下文里的变更升为高危。

关键知识点：

- 云主机初始化、镜像构建、CMDB 同步、LDAP/AD 接入都可能引起账号变化。
- 安全加固工具可能批量修改 sudoers 或锁定账号。
- 不能简单白名单整个 `/etc/sudoers.d/`，否则攻击者也会把后门放进去。
- 误报治理要保留审计能力，降级不等于丢弃。

Go 落地思路：

- 规则输出 `risk_score` 和 `reason_codes`，例如 `uid_zero_added`、`nopasswd_all`、`web_process_writer`。
- 对可信变更源使用精确条件：进程路径、签名/hash、父进程、执行用户和维护窗口。
- 客户反馈误报时，用离线 replay 对比变更前后规则命中原因。

### 7. Go Agent 采集这类信息时有哪些性能和可靠性注意点？

简洁答案：关键文件数量少，适合快照加事件触发；重点不是扫描性能，而是原子读取、解析容错、权限不足处理和事件顺序一致性。

关键知识点：

- `/etc/passwd` 等文件通常很小，但更新可能通过临时文件 rename 完成。
- sudoers include 可能分散在多个文件，读取时要避免符号链接绕过和递归过深。
- 文件变更和进程事件可能乱序到达，检测层需要按事件时间做窗口关联。
- Agent 不能因为某个文件解析失败就停止整个采集链路。

Go 落地思路：

- 使用 `os.ReadFile` + `os.Stat` 读取后校验 inode/mtime，必要时重试一次。
- 对解析器做单元测试，覆盖空行、注释、异常字段、include 和格式错误。
- 对事件缓存设置 TTL 和最大容量，防止极端环境下内存膨胀。

## 通俗答案

可以把这类检测理解成“门禁名单被谁改了”。`/etc/passwd` 和 `/etc/group` 决定系统里有哪些人、属于哪些组；`/etc/shadow` 决定账号能不能登录；sudoers 决定谁可以临时变成 root。HIDS/EDR 不应该看到文件变化就立刻高危，而是要回答三个问题：

1. 改了什么：新增账号、改 UID、加高权组、免密 sudo。
2. 谁改的：管理员、配置管理工具、Web 进程、异常 SSH 会话还是未知进程。
3. 改完做了什么：是否马上登录、sudo、落地工具、连接外网或清理日志。

能回答这三个问题，告警就从“配置文件变化”变成了“账号持久化攻击链”。

## Go 落地要点

```text
采集层
  -> 关键文件快照：passwd、shadow、group、gshadow、sudoers、sudoers.d
  -> 进程事件：useradd、usermod、passwd、visudo、编辑器、shell
  -> 登录事件：SSH success/failure、su、sudo

标准化层
  -> AccountSnapshot / AccountChangeEvent / SudoRule
  -> 保留 source、path、line、uid/euid、pid/ppid、session、timestamp

检测层
  -> 结构化 diff
  -> 高危能力识别
  -> 时间窗口关联
  -> 基线降噪与 reason_codes 输出
```

工程实现上要保持 KISS：先把少量关键文件解析清楚，再做清晰的 diff 和关联。不要一开始就写复杂策略语言；如果字段标准化和证据链做不好，规则再复杂也解释不清。

## 学习要点

| 方向 | 需要掌握 |
| --- | --- |
| Linux 账号体系 | passwd、shadow、group、gshadow、UID/GID、登录 shell |
| sudo 权限 | sudoers 语法、NOPASSWD、runas、include、sudoers.d |
| 采集能力 | auditd、fanotify/inotify、文件快照、进程链、登录日志 |
| Go 工程 | 结构化解析、diff、事件缓存、错误兜底、离线 replay |
| 检测策略 | 高危权限识别、攻击链关联、误报分层、客户基线 |

## 小练习 / 复盘题

1. 设计一个 `AccountChangeEvent`，要求能表达新增账号、UID 修改、组成员变化和来源进程。
2. 写一个最小 parser，把 `/etc/passwd` 的一行解析成 `LocalUser`，并说明遇到字段数量异常时如何处理。
3. 设计一条规则：Web 服务进程执行 `useradd` 后 10 分钟内新增账号加入 `sudo` 组，输出高危告警。
4. 复盘一个误报场景：企业配置管理系统批量更新 sudoers 时，如何降噪但保留审计记录？
5. 如果客户环境没有 auditd，只能做文件快照和进程采集，你会如何补足“谁改的”证据？
