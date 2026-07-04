---
title: Go主机安全面试：Linux提权与持久化检测
date: 2026-07-04 17:03:35
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
---

# Go 主机安全面试：Linux 提权与持久化检测

Linux 主机安全面试常把“攻击者拿到低权限 shell 之后会做什么”作为主线。Go 研发要能把提权、权限变更、持久化落点和告警降噪讲清楚，而不是只背几个漏洞名。

## 岗位场景

```text
Web RCE / 弱口令登录
  -> 低权限 shell
  -> 提权探测：sudo、SUID、内核漏洞、敏感配置
  -> 持久化：cron、systemd、SSH key、动态库劫持
  -> 横向移动 / 数据窃取
  -> HIDS/EDR 采集、关联、告警、留证
```

这类检测的关键是把“权限发生变化”和“攻击者留下入口”连起来看。

## 高频面试题

## 1. Linux 提权检测应该重点看哪些行为？

> 简答：重点看身份变化、权限边界突破和敏感配置改动。

常见信号：

- 普通用户执行 `sudo`、`su`、`pkexec`、`newgrp`。
- 新增 SUID/SGID 文件，尤其落在 `/tmp`、`/var/tmp`、Web 目录。
- 修改 `/etc/passwd`、`/etc/shadow`、`/etc/sudoers`。
- 加载异常内核模块或执行本地提权 POC。
- Web 服务用户启动 shell 后执行权限探测命令。

Go 落地思路：

- 进程事件保留 `uid`、`euid`、`gid`、`egid`、父进程和命令行。
- 文件事件关注权限位、属主、路径和哈希变化。
- 告警要带证据：哪个用户、哪个进程、改了哪个文件、权限从什么变成什么。

## 2. SUID 文件为什么是高频提权风险？

> 简答：SUID 程序会以文件属主权限运行，错误配置可能让普通用户拿到 root 能力。

关键知识点：

- SUID 位常见权限是 `-rwsr-xr-x`。
- 合法 SUID 程序包括 `passwd`、`sudo`、`su`。
- 攻击者可能复制 shell 并设置 SUID，或利用可写路径里的异常二进制。

Go 落地思路：

```go
func HasSUID(mode uint32) bool {
	return mode&04000 != 0
}
```

- 文件采集层只判断权限变化，不在采集层写复杂策略。
- 检测层组合路径、属主、创建进程和时间窗口。
- 白名单要精确到路径和哈希，不能只按文件名放行。

## 3. cron 和 systemd 持久化怎么检测？

> 简答：看计划任务和服务单元是否新增、被篡改，以及它们启动的命令是否可疑。

重点路径：

| 类型 | 关注位置 |
| --- | --- |
| 用户 cron | `/var/spool/cron/`、`/var/spool/cron/crontabs/` |
| 系统 cron | `/etc/crontab`、`/etc/cron.*` |
| systemd | `/etc/systemd/system/`、`/usr/lib/systemd/system/` |
| 自启动脚本 | `/etc/rc.local`、用户 profile 文件 |

Go 落地思路：

- 监听文件创建、写入、重命名和权限变化。
- 解析关键字段：执行用户、命令、定时表达式、`ExecStart`。
- 新增服务后如果紧跟 `systemctl enable/start`，风险更高。

## 4. SSH key 持久化如何判断误报？

> 简答：不能看到 `authorized_keys` 变化就直接高危，要结合操作者、来源进程和主机基线。

风险信号：

- Web 用户或业务进程写入 `~/.ssh/authorized_keys`。
- 非交互时段批量修改多个用户的 SSH key。
- 新 key 写入后很快出现外部登录成功。
- key 注释、来源 IP、文件属主与历史基线不一致。

Go 落地思路：

- 文件事件记录 `path`、`uid`、`process.name`、`process.cmdline`。
- 登录事件记录用户、来源 IP、认证方式和时间。
- 用短窗口关联“key 写入 -> SSH 登录”，比单点文件告警更可靠。

## 5. 为什么提权检测不能只靠命令行关键字？

> 简答：关键字适合粗筛，但攻击者可以改名、编码、间接执行，单点匹配容易漏报和误报。

例子：

```text
chmod u+s /tmp/sh
cp /bin/bash /tmp/.x && chmod 4755 /tmp/.x
echo 'user ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
```

关键知识点：

- 命令行可能缺失、截断或被混淆。
- 文件权限变化比命令文本更接近结果证据。
- 进程父子关系能解释行为来源。

Go 落地思路：

- 命令行命中作为候选事件。
- 文件最终状态作为强证据。
- 规则输出 `reason`，说明命中了哪些字段，方便客户复核。

## 6. 如何设计一条“Web 用户提权尝试”规则？

> 简答：用 Web 父进程、低权限用户、提权命令和敏感文件变化做组合。

简化规则：

```text
父进程属于 nginx/php-fpm/tomcat
  + 执行用户是 www-data/nginx/apache
  + 命令包含 sudo/su/chmod 4755/sudoers
  或敏感文件权限发生变化
  => Web RCE 后提权尝试
```

Go 落地思路：

```go
type Finding struct {
	Severity string
	Reason   []string
}
```

- 不要只返回 `bool`，否则告警解释性差。
- 先做少量稳定规则，覆盖高价值场景。
- 服务端再做跨事件攻击链还原，Agent 侧避免重规则拖垮性能。

## 7. Linux 下有哪些采集来源可以支持这类检测？

> 简答：进程、文件、登录和权限变化都要采，单一来源不够。

| 来源 | 适合采集 | 主要风险 |
| --- | --- | --- |
| auditd | exec、文件写入、权限修改 | 规则配置和性能成本 |
| eBPF | execve、chmod、chown、open、rename | 内核兼容和丢事件处理 |
| procfs | 补充进程上下文 | 短进程容易错过 |
| auth log | SSH、sudo、su 登录审计 | 发行版路径和格式差异 |

Go 落地思路：

- 多来源事件统一成标准字段，例如 `process.*`、`file.*`、`user.*`。
- 采集失败和降级状态要上报，避免服务端误以为主机安全。
- 高风险事件优先级高于普通文件扫描。

## 8. Agent 如何降低这类规则的误报？

> 简答：用基线、白名单、时间窗口和证据聚合，而不是把规则写成一大坨条件。

常见误报：

- 运维正常新增 systemd 服务。
- 发布脚本更新 cron。
- 安全加固工具修改 sudoers。
- 管理员轮换 SSH key。

Go 落地思路：

- 去重 key 可以用 `host_id + rule_id + user + path + process_hash`。
- 白名单要记录命中原因和范围。
- 规则分级：单点敏感修改是中危，Web 进程链路加敏感修改才是高危。
- 保留原始事件，降噪只影响告警，不影响事后取证。

## 学习要点

- Linux 权限模型：UID/EUID、SUID/SGID、文件权限位。
- 持久化入口：cron、systemd、SSH key、profile、动态库加载。
- Go 工程化：事件结构体、短窗口缓存、队列限流、告警解释字段。
- 检测思路：结果证据优先，命令关键字只做辅助。

## 小练习

1. 设计一个 `FileEvent` 结构体，能表达 SUID 位新增、属主变化和写入进程。
2. 写一条规则：Web 用户在 `/tmp` 下创建 SUID root 文件时告警。
3. 思考：如果 `authorized_keys` 被正常运维系统更新，规则如何降噪？
4. 复盘一次真实告警时，至少保留进程、文件、用户、时间和原始事件五类证据。
