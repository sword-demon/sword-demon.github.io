---
title: Go主机安全面试：Linux内核模块与可疑驱动检测
date: 2026-07-26 17:17:07
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- kernel
- rootkit
---

# Go 主机安全面试：Linux 内核模块与可疑驱动检测

Linux 主机被入侵后，攻击者可能加载恶意内核模块，隐藏进程、文件、网络连接，或者拦截系统调用。面试官通常会追问：Go Agent 怎么发现可疑模块？怎么区分正常驱动和 Rootkit？内核态能力受限时怎么做降级检测？

## 岗位场景

```text
Linux 主机
  -> 采集内核模块列表、模块文件、签名、依赖、加载时间和系统日志
  -> 关联进程执行、文件落地、提权行为、网络外联和基线变化
  -> 识别异常驱动、Rootkit 线索和模块隐藏风险
  -> 输出可解释证据，支持客户排障和误报复盘
```

这类题考的是 Linux 内核模块机制、Rootkit 常见手法、多源交叉验证、误报治理和 Go 侧低权限采集能力。

## 高频面试题

### 1. HIDS/EDR 为什么要关注 Linux 内核模块？

简洁答案：内核模块运行在内核态，权限高、隐蔽性强，攻击者可以用它隐藏进程、文件、网络连接或绕过用户态检测。

关键知识点：

- 正常模块常见于网卡、存储、文件系统、虚拟化、安全软件和云厂商驱动。
- 恶意模块可能 hook 系统调用、修改内核对象、隐藏 `/proc` 视图。
- 用户态命令 `lsmod`、`modinfo` 的输出可能被劫持，不能只信单一来源。

Go 落地思路：

- 同时采集 `/proc/modules`、`/sys/module`、模块文件路径和内核日志线索。
- 事件字段至少包含 `name`、`size`、`ref_count`、`deps`、`state`、`source`。
- 把“新增模块”作为风险信号之一，不直接等同于恶意。

### 2. Linux 上可以从哪些位置采集模块信息？

简洁答案：优先读 `/proc/modules` 和 `/sys/module`，再结合 `/lib/modules/<kernel>` 下的模块文件、`dmesg` 或 audit 日志补证据。

常见来源：

```text
/proc/modules
/sys/module/<name>/
/sys/module/<name>/parameters/
/sys/module/<name>/sections/
/lib/modules/$(uname -r)/
/var/log/kern.log
/var/log/messages
```

关键知识点：

- `/proc/modules` 适合快速拿当前加载列表。
- `/sys/module` 可以补参数、holders、sections 等上下文。
- 发行版日志路径不同，日志不可用是正常情况。

Go 落地思路：

- 先做只读采集，不执行 `insmod`、`rmmod` 这类有副作用命令。
- 目录不存在、权限不足、文件瞬时消失都要记录错误计数。
- 文件扫描限制在固定路径，避免全盘递归。

### 3. 可疑内核模块通常有哪些特征？

简洁答案：重点看未知来源、异常路径、无签名、近期落地、名称伪装、参数异常和与攻击链时间接近。

典型信号：

- 模块文件来自 `/tmp`、`/dev/shm`、Web 目录或用户可写目录。
- 名称伪装成常见驱动，但 hash、路径或签名不匹配。
- 加载时间接近 Web RCE、提权 POC、异常登录或 root shell。
- 模块参数包含隐藏端口、隐藏 PID、后门 key 或调试开关。
- 安装包、内核版本和模块 vermagic 明显不匹配。

Go 落地思路：

- 规则输出命中原因，例如 `temp_path`、`unsigned_module`、`new_after_rce`。
- 对模块路径做 `filepath.Clean`，再判断是否落在高风险目录。
- 对文件 hash 和包来源做缓存，避免重复计算。

```go
func suspiciousModulePath(path string) bool {
	path = filepath.Clean(path)
	return strings.HasPrefix(path, "/tmp/") ||
		strings.HasPrefix(path, "/dev/shm/") ||
		strings.HasPrefix(path, "/var/tmp/")
}
```

### 4. Go Agent 怎么解析 `/proc/modules`？

简洁答案：逐行读取并按空白字段切分，提取模块名、大小、引用计数、依赖、状态和地址；解析失败保留原始行用于排障。

关键知识点：

- `/proc/modules` 每行通常包含模块名、大小、引用计数、依赖、状态和内存地址。
- 依赖字段可能是 `-`，表示没有依赖。
- 模块列表会变化，读取期间模块卸载导致的不一致要容忍。

Go 落地思路：

- 解析器只做稳定字段抽取，不模拟内核模块依赖图。
- 字段转换失败不要让整批采集失败。
- 保留采集源和原始行号，便于客户复盘。

```go
type KernelModule struct {
	Name     string
	Size     int64
	RefCount int
	Deps     []string
	State    string
}
```

### 5. 如何发现模块被隐藏的线索？

简洁答案：用多源交叉验证找不一致，例如内核事件显示加载过模块，但 `/proc/modules` 或 `/sys/module` 看不到对应对象。

关键知识点：

- Rootkit 可能从模块链表里摘除自己，导致常规枚举看不到。
- `init_module`、`finit_module`、`delete_module` 系统调用可以提供加载和卸载线索。
- eBPF、auditd、日志、文件落地事件和历史快照能互相补证。

Go 落地思路：

- 记录模块加载事件和周期快照，按模块名、hash、时间窗口关联。
- 发现“有加载事件但无当前模块对象”时输出低置信度隐藏线索。
- 告警证据写清楚差异来源，避免直接下 Rootkit 结论。

### 6. 如何降低正常驱动带来的误报？

简洁答案：把模块来源、签名、包归属、资产角色、内核版本、历史基线和厂商白名单一起判断。

常见误报：

- 云厂商、虚拟化、网卡、存储、备份和安全软件驱动。
- 内核升级后自动重建的 DKMS 模块。
- 容器、GPU、监控和性能分析组件加载的合法模块。

Go 落地思路：

- 首次上线建立模块基线，后续重点关注新增、替换和路径变化。
- 白名单必须带作用域，例如模块名、hash、签名主体、内核版本和过期时间。
- 被压制的命中仍保留审计计数，避免白名单过宽。

### 7. 没有 root 权限时还能做哪些检测？

简洁答案：可以采集 `/proc/modules`、部分 `/sys/module` 信息、模块文件元数据和日志可读部分；采不到高权限字段时要明确降级。

关键知识点：

- 客户环境可能限制 `dmesg`、audit、BPF 和 `/sys/module/*/sections`。
- 权限不足不是采集失败，而是能力降级。
- 降级后更依赖文件基线、进程链路和服务端规则关联。

Go 落地思路：

- Agent 上报 capability，例如 `can_read_proc_modules`、`can_read_kmsg`。
- 每个采集源独立失败，不能拖垮整个 HIDS 事件链路。
- 告警里区分“未命中”和“无权限采集”。

### 8. 客户反馈内核模块告警误报，怎么排查？

简洁答案：先确认模块来源和加载时间，再看签名、包归属、hash、加载进程、规则版本和资产角色。

排查顺序：

1. 确认模块名、路径、hash、签名主体和内核版本。
2. 查看是否来自 DKMS、包管理器、云厂商或安全软件。
3. 关联加载时间附近的登录、提权、文件落地和进程执行事件。
4. 检查规则命中原因、白名单作用域和基线变化。
5. 判断是规则过严、基线缺失，还是模块确实来源不明。

Go 落地思路：

- 告警带 `rule_id`、`rule_version`、`risk_reasons` 和采集能力快照。
- 排障包只包含必要元数据，不默认上传完整 `.ko` 文件。
- 对客户确认合法的模块，用 hash 和签名做窄作用域白名单。

## 学习要点

| 方向 | 要掌握的内容 |
| --- | --- |
| Linux 原理 | 内核模块、`/proc/modules`、`/sys/module`、DKMS、模块签名 |
| 检测工程 | 多源交叉验证、基线变化、隐藏线索、误报压制 |
| Go 实现 | 逐行解析、文件元信息、hash 缓存、权限降级、错误计数 |
| 客户排障 | 模块来源、内核版本、规则版本、白名单作用域、证据复盘 |

## 小练习

1. 设计一个 `KernelModuleFinding` 结构体，字段至少包含模块名、路径、hash、签名、风险原因、采集源和证据摘要。
2. 写一个函数解析 `/proc/modules` 的一行，返回模块名、大小、引用计数、依赖和状态；字段不足时返回可解释错误。
3. 设计一条规则：Web RCE 落地 `.ko` 文件后执行 `insmod`，随后出现进程隐藏线索。列出至少 6 个证据字段。
4. 复盘一个误报场景：云厂商合法驱动被识别为未知模块，如何降噪但保留审计记录？
