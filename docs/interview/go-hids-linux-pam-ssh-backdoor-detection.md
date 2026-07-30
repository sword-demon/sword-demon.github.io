---
title: Go主机安全面试：Linux PAM后门与SSH登录链路检测
date: 2026-07-30 17:12:52
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
- pam
---

# Go 主机安全面试：Linux PAM 后门与 SSH 登录链路检测

Linux 主机被拿下后，攻击者不一定只写 `authorized_keys` 或开新端口，也可能改 PAM 配置、替换认证模块、调整 SSH 配置，让后续登录看起来像正常认证。面试官常会追问：Go Agent 怎么发现认证链路被改？怎么把文件变化、登录日志和进程行为串起来？怎么避免把正常运维变更报成后门？

## 岗位场景

```text
Linux 主机
  -> 采集 PAM/SSH 配置、认证模块、登录日志和进程事件
  -> 识别认证链路变更、异常模块加载、绕过认证和可疑登录
  -> 关联文件写入、包管理、管理员操作、sshd reload 和后续命令
  -> 输出可解释证据，支持客户现场排查和攻击链复盘
```

这类题考的是 Linux 认证机制、文件完整性、日志标准化、攻击链关联、误报治理和 Go Agent 的低开销采集设计。

## 高频面试题

### 1. 为什么 PAM 后门比普通自启动更隐蔽？

简洁答案：PAM 位于登录认证链路中，攻击者改动后可以影响 `sshd`、`sudo`、`su` 等入口，后续访问可能表现为“认证成功”，不一定伴随新进程或新端口。

关键知识点：

- PAM 配置常见路径包括 `/etc/pam.d/sshd`、`/etc/pam.d/sudo`、`/etc/pam.d/su`。
- 模块常见路径包括 `/lib/security`、`/lib64/security`、`/usr/lib/security`。
- 可疑改动包括新增陌生 `.so`、调整 `required/sufficient/optional` 控制项、插入 `pam_exec.so` 执行脚本。

Go 落地思路：

- 对 PAM 配置和模块目录做文件完整性监控，记录 path、hash、uid、mode、mtime。
- 把 PAM 改动作为认证链路节点，不要只输出“文件被修改”。
- 对 `sshd`、`sudo`、`su` 相关配置提高采集优先级。

### 2. Go Agent 怎么采集 PAM 和 SSH 配置变化？

简洁答案：低依赖方案是定期快照关键文件和目录，结合 inotify 或 fanotify 事件做增量发现；企业版还要接入包管理、审计日志和进程事件补上下文。

关键知识点：

- PAM 配置是文本文件，模块是 ELF 动态库，检测粒度不同。
- `sshd_config` 改动不一定马上生效，通常还要看 `sshd` reload/restart。
- 只靠 mtime 不可靠，攻击者可以回写时间戳，hash 和 inode 变化更稳。

Go 落地思路：

- 快照字段至少包含 `path`、`sha256`、`size`、`mode`、`uid`、`gid`、`mtime`、`inode`。
- 文件事件只做触发，最终以重新读取后的快照为准。
- 读取失败要保留错误原因，例如权限不足、文件消失、符号链接异常。

```go
func isPAMTarget(path string) bool {
	return strings.HasPrefix(path, "/etc/pam.d/") ||
		strings.Contains(path, "/security/pam_")
}
```

### 3. PAM 配置里哪些变化最值得告警？

简洁答案：重点关注认证入口新增模块、认证控制项变弱、执行外部命令、引用可写目录脚本，以及非包管理来源的模块落地。

常见信号：

| 信号 | 为什么可疑 | 例子 |
| --- | --- | --- |
| 新增陌生模块 | 可能截获密码或放行登录 | `auth sufficient pam_x.so` |
| 使用 `pam_exec.so` | 可在认证时执行命令 | 调用 `/tmp/check.sh` |
| 控制项变弱 | 可能绕过原有认证 | `required` 改成 `optional` |
| 模块来自可写目录 | 易被低权限篡改 | `/tmp/pam.so` |
| 非包管理落地 | 来源不可解释 | 手工写入 `/lib64/security` |

Go 落地思路：

- 解析 PAM 行时抽取 `type`、`control`、`module`、`args`，不要只做全文包含匹配。
- 对新增模块、控制项变化和参数变化分别输出命中原因。
- 告警证据要包含变更前后片段，方便客户判断是否为正常变更。

### 4. 如何把 PAM 改动和 SSH 登录异常关联起来？

简洁答案：用时间窗口把“认证链路改动 -> sshd reload/restart -> 登录成功 -> 后续命令/外联”串起来，链路越完整，置信度越高。

关键知识点：

- PAM 配置修改后，攻击者常会触发 `systemctl reload sshd` 或重启 `sshd`。
- 登录日志可能来自 `/var/log/auth.log`、`/var/log/secure` 或 journald。
- 可疑登录要结合来源 IP、账号、认证方式、登录时间和历史基线。

Go 落地思路：

- 事件模型中统一 `auth.config_change`、`process.exec`、`auth.login`、`network.connect`。
- 时间窗口不宜过宽，常见可先用 10 到 30 分钟，再按客户环境调整。
- 规则输出攻击链节点，而不是只输出单条登录日志。

### 5. SSH 配置被改时要看哪些关键项？

简洁答案：重点看允许 root 登录、密码登录、公钥认证、命令强制执行、AuthorizedKeys 文件位置、PAM 开关和端口监听变化。

关键知识点：

- `PermitRootLogin yes`、`PasswordAuthentication yes` 在高安全环境中风险较高。
- `AuthorizedKeysFile` 指向异常路径可能绕过原有密钥管理。
- `UsePAM no` 可能绕过统一认证策略，但不同发行版基线不同。

Go 落地思路：

- 将 SSH 配置解析成 key/value，并保留 include 展开后的来源文件。
- 对配置变化做 diff，告警展示“从什么值改成什么值”。
- 配置风险要结合主机基线，不能把所有 `PasswordAuthentication yes` 都判高危。

### 6. 如何降低 PAM/SSH 正常运维变更造成的误报？

简洁答案：用包管理来源、变更账号、工单窗口、主机角色、历史基线和后续行为一起判断；只看文件变化会误报很多。

关键知识点：

- 合法场景包括系统升级、堡垒机接入、LDAP/SSO 改造、合规加固。
- 安装包写入 PAM 模块和 Web 进程写入 PAM 模块，风险完全不同。
- 白名单不能只按文件名放行，攻击者也能起名为 `pam_unix.so`。

Go 落地思路：

- 白名单维度包含 hash、包名、签名、路径、账号和有效期。
- 对 `rpm`、`dpkg`、`yum`、`apt` 等包管理进程做来源识别。
- 降噪后仍保留审计事件，避免客户事后无法复盘。

### 7. 客户反馈“PAM 后门告警误报”，你怎么排查？

简洁答案：先还原文件 diff 和变更进程，再检查模块来源、规则命中原因、登录链路和客户基线，最后用同版本规则离线 replay。

关键知识点：

- 排查不能只看告警文案，要回到原始事件和规则版本。
- 如果只保存最终风险分，无法判断是解析错、基线缺失还是阈值过严。
- 修规则时要避免把真实攻击样本一起压掉。

Go 落地思路：

- 导出脱敏样本，包含变更前后 hash、diff、进程树、账号、登录事件。
- 用同一规则版本 replay，确认误报来自采集、解析、关联还是降噪。
- 优先修共享解析和基线逻辑，不给单个客户写硬编码分支。

## 学习要点

| 模块 | 需要掌握的点 |
| --- | --- |
| Linux 认证 | PAM 配置、控制项、模块路径、SSH 配置、登录日志 |
| 文件完整性 | hash、inode、mode、uid、mtime、符号链接、包管理来源 |
| 攻击链关联 | 文件写入、sshd reload、登录成功、后续命令、外联 |
| Go 工程 | 快照比对、事件标准化、文本解析、错误容忍、离线 replay |
| 误报治理 | 基线、工单窗口、白名单作用域、规则版本、客户现场复盘 |

## 小练习

1. 设计一个 `AuthConfigChangeEvent` 结构体，字段要能表达 PAM 和 SSH 配置变化。
2. 写一条规则：Web 进程写入 `/etc/pam.d/sshd` 后 10 分钟内出现外部 IP 登录成功，列出至少 6 个证据字段。
3. 复盘一个误报场景：企业接入 LDAP 修改 PAM 配置时，如何降噪但保留审计能力？
