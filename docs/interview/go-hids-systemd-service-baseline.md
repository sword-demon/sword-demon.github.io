---
title: Go主机安全面试：systemd服务基线与异常启动项检测
date: 2026-07-17 17:54:40
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- systemd
---

# Go 主机安全面试：systemd 服务基线与异常启动项检测

Linux 主机被入侵后，攻击者经常把后门注册成服务、定时任务或开机启动项。面试官会追问：为什么只看进程不够？systemd 持久化怎么看？Go Agent 如何采集、标准化、降噪和验证规则？这类题考的是 Linux 系统原理、安全检测和工程落地的组合能力。

## 岗位场景

```text
systemd unit / timer / drop-in 配置
  -> Agent 扫描系统目录和用户目录
  -> 解析 Unit、Service、Install 字段
  -> 关联当前运行进程、文件哈希、用户和网络行为
  -> 和历史基线或可信策略对比
  -> 输出异常启动项、可疑服务和持久化证据
```

服务检测不能只看“有没有新增 unit 文件”，还要看它执行了什么、由谁创建、是否开机启用、是否和可疑进程链路相关。

## 高频面试题

## 1. 为什么主机安全要关注 systemd 服务？

> 简答：systemd 是 Linux 常见的服务管理入口，攻击者可以用它实现开机自启、进程守护和伪装成正常服务。

关键知识点：

- systemd unit 可以通过 `ExecStart` 拉起任意命令或脚本。
- `WantedBy=multi-user.target`、`systemctl enable` 会让服务开机启动。
- timer unit 可以替代 cron，周期性执行后门或下载脚本。
- drop-in 配置可以在不改原 unit 的情况下覆盖启动参数。
- 用户级 systemd 服务可能藏在普通账号目录下，容易被只看系统目录的扫描漏掉。

Go 落地思路：

- 采集 `/etc/systemd/system`、`/usr/lib/systemd/system`、`/lib/systemd/system` 和用户级目录。
- 标准化字段至少包含 `unit_path`、`unit_name`、`exec_start`、`wanted_by`、`user`、`enabled`、`mtime`。
- 把服务配置和进程快照、文件哈希、网络外连关联起来，避免孤立判断。

## 2. systemd 持久化常见异常特征有哪些？

> 简答：重点看非标准目录执行、解释器拉脚本、隐藏命名、可写目录落地和异常自启动目标。

典型特征：

- `ExecStart` 指向 `/tmp`、`/dev/shm`、Web 上传目录或用户家目录下的可执行文件。
- 服务名伪装成系统组件，例如和正常服务只差一个字符。
- 启动命令包含 `curl`、`wget`、`bash -c`、`python -c`、base64 解码或反弹 shell 片段。
- unit 文件由非包管理器安装，修改时间接近入侵时间。
- drop-in 文件覆盖了原服务的 `ExecStart` 或环境变量。

Go 落地思路：

- 先用路径、命令形态和启用状态做候选筛选。
- 对命中的候选补充文件 hash、签名、属主、权限和父目录权限。
- 告警证据里保留原始 unit 片段、命中的字段和检测原因。

## 3. 如何扫描 systemd unit 文件才不容易漏？

> 简答：系统级目录、运行时目录、用户级目录和 drop-in 子目录都要纳入视野，但要有白名单和扫描预算。

关键目录：

```text
/etc/systemd/system
/run/systemd/system
/usr/lib/systemd/system
/lib/systemd/system
~/.config/systemd/user
/etc/systemd/user
```

关键知识点：

- `/etc/systemd/system` 通常优先级高，适合发现本地覆盖和新增服务。
- `/run/systemd/system` 是运行时配置，重启后可能消失，但取证价值高。
- `*.service.d/*.conf` drop-in 能覆盖服务字段。
- 用户级服务不一定需要 root 权限就能持久化。

Go 落地思路：

- 用 `filepath.WalkDir` 扫描固定目录，不递归整个文件系统。
- 只解析 `.service`、`.timer`、`.socket` 和 `.conf` drop-in。
- 对单文件大小设上限，避免异常文件拖慢 Agent。

```go
func suspiciousUnitPath(path string) bool {
	return strings.HasSuffix(path, ".service") ||
		strings.HasSuffix(path, ".timer") ||
		strings.HasSuffix(path, ".conf")
}
```

## 4. 解析 unit 文件时要注意什么？

> 简答：unit 是类 INI 格式，但安全检测不需要一开始实现完整 systemd 解析器，先稳定提取关键字段。

关键知识点：

- `ExecStart` 可以出现多次，也可能用 `-` 前缀表示失败不影响启动。
- drop-in 覆盖可能先清空字段，再重新设置字段。
- 字段值里可能包含引号、变量、转义和环境文件引用。
- `EnvironmentFile` 可能把真正的参数藏到另一个文件。

Go 落地思路：

- 最小解析只提取 section、key、value 三元组。
- 对 `ExecStart`、`ExecStartPre`、`ExecStartPost`、`EnvironmentFile`、`WantedBy` 建索引。
- 保留原始行号，便于告警解释和客户复盘。
- 不要把 unit 解析、规则判断和文件扫描写成一个大函数。

## 5. 如何降低 systemd 服务检测误报？

> 简答：用包来源、路径、签名、资产角色、历史基线和维护窗口分层判断，不要看到新增服务就报警。

常见误报：

- 客户安装监控、备份、日志采集或安全软件。
- 运维通过 Ansible、SaltStack、脚本发布服务。
- 容器宿主机和普通业务主机的服务数量差异很大。
- 系统升级会替换或新增合法 unit 文件。

Go 落地思路：

- 首次上线建立基线，只对后续新增、修改、启用状态变化提高风险。
- 白名单条件要窄，例如固定路径、固定 hash、固定包名或固定发布账号。
- 对服务变化输出风险分，而不是只返回 `true/false`。
- 被白名单压制的命中也要计数，方便发现白名单过宽。

## 6. 如何把服务配置和运行中进程关联起来？

> 简答：unit 文件说明“计划怎么启动”，进程快照说明“现在实际跑了什么”，两者关联后证据更完整。

关键知识点：

- `systemctl status` 不是 Agent 的唯一来源，生产上更适合读配置和 procfs。
- `ExecStart` 可能是 wrapper 脚本，实际恶意进程是子进程。
- PID 会复用，关联时最好带进程启动时间。
- 服务被禁用但进程仍在运行，也可能是异常状态。

Go 落地思路：

- 从 unit 提取可执行路径和参数，再和 `/proc/<pid>/exe`、`cmdline`、`cgroup` 关联。
- cgroup 路径里常能看到 systemd unit 名，可以辅助反查服务。
- 关联失败不要丢弃配置事件，保留为“可疑启动项待确认”。

## 7. 如何检测 timer 型持久化？

> 简答：timer 可以周期性触发 service，检测时要同时看 `.timer` 和它绑定的 `.service`。

关键知识点：

- `.timer` 里常见 `OnBootSec`、`OnUnitActiveSec`、`OnCalendar`。
- timer 名称通常对应同名 service，但也可以通过 `Unit=` 指定目标。
- 攻击者可能让 timer 低频触发，降低进程侧命中概率。
- 只做进程启动检测可能错过“配置已落地但尚未触发”的风险。

Go 落地思路：

- 标准化输出 `timer_unit`、`target_service`、`schedule`、`enabled`。
- 对触发目标的 `ExecStart` 复用 service 检测规则。
- 低频 timer 新增或修改时，即使未触发也要进入风险队列。

## 8. 客户反馈 systemd 持久化告警误报，怎么排查？

> 简答：先确认服务来源和变更时间，再看命中证据、基线差异、白名单和相关进程行为。

排查顺序：

```text
告警样本
  -> unit 路径 / hash / mtime / owner
  -> ExecStart 和 drop-in 覆盖链
  -> enabled 状态和 timer 触发关系
  -> 进程、网络、文件落地证据
  -> 包来源、运维窗口、白名单命中记录
```

Go 落地思路：

- 告警保存 `rule_id`、`rule_version`、`unit_path`、`matched_line`、`evidence`。
- 规则回放工具复用线上解析逻辑，拿客户样本直接验证。
- 修误报优先收紧条件或补上下文，不要直接忽略整个服务名。

## 学习要点

- systemd 是 Linux 持久化检测的重要入口，service、timer、drop-in 和用户级 unit 都要关注。
- 异常服务判断要结合路径、命令、启用状态、文件属性、进程和网络行为。
- Go Agent 不需要一开始实现完整 systemd 语义，先稳定提取关键字段和证据。
- 降低误报靠基线、窄白名单、风险评分和可回放样本，而不是简单关规则。
- 线上排查要能把 unit 配置、规则版本和原始证据串起来。

## 小练习

1. 设计一个 `SystemdUnitEvent` 结构，字段要能表达 service、timer 和 drop-in。
2. 写出检测 `/tmp/.cache/update` 被注册为 `ExecStart` 的规则思路。
3. 如果服务名看起来正常，但 drop-in 覆盖了 `ExecStart`，你会保留哪些证据？
4. 设计一条白名单，只允许固定 hash 的运维服务在固定维护窗口内变更。
5. 如何用 procfs 的 cgroup 信息反查一个进程属于哪个 systemd unit？
