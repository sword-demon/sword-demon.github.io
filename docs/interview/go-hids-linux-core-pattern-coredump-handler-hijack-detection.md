---
title: Go 主机安全面试：Linux core_pattern 崩溃处理器劫持与提权检测
date: 2026-11-07 17:05:00
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- coredump
---

# Go 主机安全面试：Linux core_pattern 崩溃处理器劫持与提权检测

`/proc/sys/kernel/core_pattern` 决定内核在进程异常终止时把转储写到哪里。默认值是 `core`，也就是在当前目录生成一个 core 文件。但只要这个值的第一个字符是 `|`，内核就会把剩余部分当成一条命令行，在崩溃发生时启动这个程序，并把崩溃进程的身份信息传进去。

这个机制平时是运维用来收集崩溃现场的工具，但在攻击者手里，它变成了一条“改一个字符串就拿到 root 执行”的路径：把 `core_pattern` 改成 `|/tmp/.x`，落地一个二进制，再让任意进程崩溃，内核就会以 root 身份把它跑起来。

这类攻击的技术难度不高，真正的检测难点在于**边界与关联**：`core_pattern` 是 procfs 文件，写它不会产生常规的文件变更事件；改成功不代表 handler 一定被执行；而崩溃本身在生产环境是常见事件，怎么区分“正常崩溃收集”和“恶意劫持”，决定了规则是能用还是纯噪音。

## 岗位场景

```text
攻击者通过 Web RCE / 弱口令拿到主机上的低权限 shell
  -> 提权拿到 root，或直接利用特权容器内可写的 /proc/sys
  -> 写入 /tmp/.handler（ELF 或脚本）
  -> echo '|/tmp/.handler' > /proc/sys/kernel/core_pattern
  -> 触发一次可控崩溃（例如 SIGABRT 或段错误）
  -> 内核以 root 身份启动 handler，core dump 从 stdin 传入
  -> handler 执行提权动作，随后删除自身、把 core_pattern 改回 core
  -> Go Agent 需要回答三个问题：
     1) 谁改了 core_pattern（uid/pid/exe/容器身份）
     2) 当前取值是否偏离基线、handler 是否落在用户可写目录
     3) 是否真的发生过以该 handler 为 exe 的 root 执行
```

注意链路第三步：`/proc/sys` 里的绝大多数 sysctl **不是命名空间化的**。一个特权容器内可写的 `/proc/sys` 改的是宿主机内核的全局状态，不需要真正逃逸就能影响宿主机。这让这条规则的价值远高于普通文件写入类规则。

## 高频面试题

### 1. `core_pattern` 到底是什么？改一个字符串为什么能换来 root 执行？

**简洁答案：** 它是内核崩溃转储的目标模板。取值以 `|` 开头时，内核把 `|` 之后的整行当作一条命令行，在崩溃发生时启动该程序：程序以 root 的用户和组身份运行，core dump 内容通过标准输入传给它，崩溃进程的 PID 等信息以参数形式追加。

**关键知识点：**

- 默认值是 `core`；命名模板支持 `%` 说明符（如 `%p` 进程 PID、`%e` comm 名、`%E` 可执行文件路径、`%s` 触发信号），非管道模式下最终文件名上限 128 字节。
- 管道语法自 Linux 2.6.19 起支持，2.6.24 起允许附带参数，整行长度上限 128 字节。
- handler 必须是绝对路径（或相对于 `/` 的路径），且紧跟在 `|` 之后，否则内核拒绝执行。
- handler 以 root 身份运行，但这不等于绕过安全模块：LSM（如 SELinux）仍然生效，可能限制它访问崩溃进程的 `/proc/pid`。
- handler 的路径在**初始挂载命名空间**中解析，它不受崩溃进程的 root 目录、工作目录和挂载命名空间影响；handler 本身也运行在初始的 PID、挂载、用户命名空间里。
- core dump 数据不是写文件，而是走管道进入 handler 的 stdin，handler 不写盘就不会留下转储文件。

**Go 落地思路：** 把 `core_pattern` 当成“高危配置项”纳入资产与配置基线监控：周期性读取取值并解析成结构化字段（是否管道、handler 路径、参数、说明符），任何偏离基线的变化都要落到可解释的事件里，而不是只比较字符串。

### 2. 内核在什么条件下才会真正调用 handler？有哪些“配好了却不执行”的分支？

**简洁答案：** 条件链很长，任何一环不满足都不会执行：内核必须启用了 core dump 支持；崩溃进程的 `dumpable` 标记必须非 0；管道分支还用 `RLIMIT_CORE == 1` 作为“防递归崩溃”的哨兵值；并发数量还受 `core_pipe_limit` 限制。

**关键知识点：**

- 内核 v6.12 的 `do_coredump()` 顺序是：检查 `binfmt->core_dump` 是否存在（对应 `CONFIG_COREDUMP`）→ 检查 `__get_dumpable(mm_flags)`，为 0 直接放弃 → 再进入管道分支。
- `dumpable` 受 `prctl(PR_SET_DUMPABLE)` 和 `/proc/sys/fs/suid_dumpable` 影响。setuid 程序或带 file capabilities 的程序在 exec 后通常被置为不可 dump，这类进程崩溃不会产生转储，也不会调用 handler。
- 管道分支里 `RLIMIT_CORE` 被当作特殊值使用：等于 1 表示“这是 handler 自身崩溃”，内核直接放弃转储，避免 handler 崩溃时无限递归。
- `core_pipe_limit`（2.6.32 起）限制同时进行的管道转储数量，超限时内核会打印日志并跳过转储。它还有一个容易被忽略的语义：值为 0 表示“不限制并发，但也不等待 handler 退出”，此时 handler 拿不到崩溃进程的 `/proc/pid`。
- `/proc/sys/fs/suid_dumpable` 设为 2（`suidsafe`）时，模板必须是绝对路径或管道形式，否则内核会以 “Unsafe core_pattern used with fs.suid_dumpable=2” 跳过。
- 5.3 是一个行为分界：此前内核先展开 `%` 说明符再按空格切分参数，因此 `%e`/`%E` 带空格的进程名会被切成多个参数；5.3 之后先切分再展开。

**Go 落地思路：** 规则里不要写“检测到管道形式的 `core_pattern` 就判定提权成功”。正确表述是“检测到高危崩溃处理器配置”，再由执行证据补齐结论。这也是面试里区分“会背 API”和“懂链路”的分水岭。

### 3. 谁有权限修改 `core_pattern`？容器里改它会影响宿主机吗？

**简洁答案：** 在 v6.12 的 procfs 实现里，该文件模式是 0644，写权限判定走 `sysctl_perm()` → `test_perm()`：只有 euid 为 0 才能写，普通用户得到 `EACCES`。而 `/proc/sys` 基本不做命名空间隔离，所以特权容器里写这个值改的是宿主机内核。

**关键知识点：**

- v6.12 `fs/coredump.c` 中 `core_pattern` 的表项 mode 为 0644，handler 为 `proc_dostring_coredump`。
- `test_perm()` 对 euid==0 的调用者按 owner 位判定，因此 root 可写；非 root 用户即便在 root 组内，也只能拿到组位，0644 的组位没有写权限。
- 容器里 `/proc/sys` 是否可写取决于挂载参数。普通容器通常把 `/proc/sys` 挂成只读，特权容器（`--privileged` 或 `CAP_SYS_ADMIN`）则可以写。
- 这条规则的定级逻辑因此非常简单：**能改它的人已经具备 root 或等价特权**，事件优先级应该高于普通文件写入。
- 但“谁有改的能力”和“改完有没有生效”是两件事：容器内 `/proc/sys` 是宿主机全局状态，宿主机上的 Agent 同样能看到这次变化，这一点对跨主机关联很重要。

**Go 落地思路：** 告警字段里必须带上变更者身份：`uid`、`pid`、`exe`、`cmdline`、cgroup、容器 ID、namespace 列表。缺少这些字段，跨主机溯源只能靠时间戳猜。

### 4. 为什么用 inotify/fanotify 盯着 `/proc/sys/kernel/core_pattern` 拿不到事件？

**简洁答案：** 因为 procfs 的 sysctl 写路径本身不产生文件变更通知。内核在 v6.12 的 `fs/proc/proc_sysctl.c` 里，sysctl 写入走 `proc_sys_write()` → `proc_sys_call_handler()`，这条路径上没有调用 fsnotify/dnotify，所以 inotify 与 fanotify 在该文件上收不到 `IN_MODIFY` 之类的通知。

**关键知识点：**

- inotify 依赖 inode 的 `dnotify` 钩子，fanotify 依赖 `fsnotify` 标记；procfs 的 sysctl 文件不具备常规文件的那套通知语义。
- procfs 文件的 mtime/ctime 也没有实际意义，“看文件时间戳变化”这条路走不通。
- 可靠的做法是两条腿走路：**事件通道**用 eBPF 挂在写系统调用或内核写路径上（`sys_enter_write` 后做 fd→路径解析，或直接 probe `proc_sys_write` / `proc_dostring_coredump`），**快照通道**用周期性读取兜底，捕捉采集通道启动前已经发生的变化。
- 快照通道能发现“现在是坏的”，但发现不了“改了又还原”；事件通道能发现写入动作，但要注意 Agent 挂载前的窗口。这两条通道的盲区互补，缺一条就会漏。
- 具体到你的内核版本，建议自己写一个最小验证：改一次 `core_pattern`，同时观察 inotify、fanotify 和 eBPF 的事件，把结论写进自己的采集能力清单，而不是照搬文档。

**Go 落地思路：** 采集层要能区分“我采到了写入事件”和“我采不到”。前者给实时告警，后者靠快照差异兜底，并在 Agent 自检里把这条路径的采集状态暴露给控制台，避免“沉默即安全”。

### 5. 检测规则怎么写才不误报？合法场景有哪些？

**简洁答案：** 核心是把“崩溃转储机制”和“恶意劫持”分开。判定要分三层：取值形态（是否管道）、handler 身份（是否在发行版崩溃收集器白名单里）、handler 文件属性（是否落在用户可写目录、是否可被非 root 写入、是否近期被新增或改动）。

**关键知识点：**

- 合法管道形式确实存在，例如 systemd 默认会主动把 `core_pattern` 写成 `core` 关闭转储，只有启用 systemd-coredump 时才使用管道形式；发行版的崩溃收集器（如 Ubuntu 的 apport）也会自行改写这个值。**具体取值必须现场读取确认，不能写死。**
- 非管道形式同样有风险面：如果模板被改成 `/tmp/core.%p` 这类用户可写路径，攻击者可以先让进程崩溃把可执行内容落盘，再单独执行它。规则不能只盯着管道形式。
- 白名单要绑定“绝对路径 + 文件属主 + 内容摘要”，只绑路径不够：同一个路径被换成攻击者的二进制同样是风险。
- 高价值信号包括：handler 位于 `/tmp`、`/var/tmp`、`/dev/shm`、用户家目录等可写目录；handler 在最近 24 小时内被创建或修改；handler 不在基线集合内；`core_pattern` 从管道形式变为管道形式但 handler 换了。
- `core_uses_pid`、`core_pipe_limit` 也是关联项：前者决定文件名是否带 PID，后者影响并发滥用和 handler 的可用性。

**Go 落地思路：** 解析成结构化字段后做差分和评级，而不是做字符串包含匹配。差分的粒度是“字段级”：handler 变了、形态变了、说明符变了要分开告警，客户问“到底改了什么”时才能直接回答。

### 6. 如何证明 handler 真的被执行了？把“配置变更”和“实际提权”关联起来

**简洁答案：** 靠三段证据拼时间线：崩溃事件、崩溃产生的转储记录、以及 handler 的 root 执行。前两段可以从内核审计拿，第三段从进程执行事件拿。

**关键知识点：**

- 内核在产生转储时会调用 `audit_core_dumps()`，写入一条 `AUDIT_ANOM_ABEND`（类型号 1701）审计记录，内容包含触发信号；`SIGQUIT` 触发的结束不记录。
- handler 由内核的 usermodehelper 机制启动，所以它的 `ppid` 往往不是普通业务父进程，`cwd` 是 `/`，`stdin` 是管道，`uid/gid` 为 0，且 `exe` 就是 handler 路径。
- 关联窗口要短：崩溃记录与 handler 执行通常在同一秒级区间内出现。窗口太宽会把无关的 root 进程卷进来，太窄会漏掉排队场景（受 `core_pipe_limit` 影响）。
- 关联方向很重要：先看到转储记录、再看到该 handler 的 root 执行，才支持“劫持已执行”的结论；只有前者说明系统有崩溃，只有后者说明有个 root 进程，两者结合才是完整证据链。
- 对客户解释时要区分三种状态：配置已被篡改但没有执行证据、配置被篡改且已执行、无法采集到执行证据。第三种要明确写成覆盖缺口，而不是默认安全。

**Go 落地思路：** 事件模型里把“配置变更事件”和“执行事件”分成两类，用统一的时间源和主机标识做窗口内 join，输出时保留两段原始事件引用，支持客户自己回放核对。

### 7. Go 侧怎么落地解析、快照和差分？

**简洁答案：** 用一个小的纯函数模块负责“把内核取值翻译成结构化事实”，再用快照做差分。解析与评级保持无副作用，便于单测；I/O 和差分放在上层。

**关键知识点：**

- 解析要区分“命名模板”和“管道命令行”两种形态，两者的风险模型完全不同。
- `%` 说明符只影响 handler 收到的参数，是崩溃进程可控的内容（例如 `comm` 可以被 `prctl(PR_SET_NAME)` 改写），在 5.3 之前的内核上还能影响参数切分，因此说明符集合本身也是检测项。
- handler 路径必须是绝对路径，解析时就要校验，否则下游的路径规范化逻辑会踩坑。
- 快照至少包含 `core_pattern`、`core_uses_pid`、`core_pipe_limit` 三项，且要能记录“读取失败”这个状态本身——读不到不等于没变化。

**Go 落地思路：** 参考实现如下，`Parse` 保持纯函数，快照读取用可注入的根目录，便于在测试里构造临时目录。

```go
package corepattern

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// Pattern 是 /proc/sys/kernel/core_pattern 的解析结果。
type Pattern struct {
	Raw        string
	IsPipe     bool
	Handler    string   // 管道模式下的可执行文件路径
	Args       []string // 管道模式下的参数
	Specifiers []string // 参数中出现的 % 说明符
	Template   string   // 非管道模式下的命名模板
}

// knownSpecifiers 是内核会展开的说明符，其余 "%x" 会被原样丢弃。
const knownSpecifiers = "cCdefFghipPsutE%"

// Parse 解析 core_pattern 的取值，不做 I/O，便于单测。
func Parse(raw string) (Pattern, error) {
	value := strings.TrimRight(raw, "\n")
	p := Pattern{Raw: value}
	if !strings.HasPrefix(value, "|") {
		p.Template = value
		return p, nil
	}

	p.IsPipe = true
	fields := strings.Fields(value[1:])
	if len(fields) == 0 {
		return p, fmt.Errorf("core_pattern 以 | 开头但没有指定处理程序")
	}
	p.Handler = fields[0]
	p.Args = fields[1:]
	for _, arg := range p.Args {
		p.Specifiers = append(p.Specifiers, collectSpecifiers(arg)...)
	}
	if !strings.HasPrefix(p.Handler, "/") {
		return p, fmt.Errorf("core_pattern 处理程序必须使用绝对路径: %s", p.Handler)
	}
	return p, nil
}

func collectSpecifiers(arg string) []string {
	var out []string
	for i := 0; i < len(arg); i++ {
		if arg[i] != '%' || i+1 >= len(arg) {
			continue
		}
		ch := arg[i+1]
		if !strings.ContainsRune(knownSpecifiers, rune(ch)) {
			continue
		}
		out = append(out, "%"+string(ch))
		i++
	}
	return out
}

// Policy 描述基线：白名单处理程序与用户可写目录。
type Policy struct {
	AllowedHandlers []string
	WritableDirs    []string
}

// Level 是风险等级。
type Level string

const (
	LevelNone     Level = "none"
	LevelInfo     Level = "info"
	LevelHigh     Level = "high"
	LevelCritical Level = "critical"
)

// Rate 对当前取值评级：白名单放行，用户可写目录直接判严重。
func (p Pattern) Rate(policy Policy) Level {
	if !p.IsPipe {
		if p.Template == "" || p.Template == "core" {
			return LevelNone
		}
		return LevelInfo
	}
	for _, allowed := range policy.AllowedHandlers {
		if p.Handler == allowed {
			return LevelInfo
		}
	}
	for _, dir := range policy.WritableDirs {
		if filepath.Dir(p.Handler) == dir || strings.HasPrefix(p.Handler, dir+"/") {
			return LevelCritical
		}
	}
	return LevelHigh
}

// Snapshot 是一组 sysctl 的同一时刻取值。
type Snapshot struct {
	Pattern     Pattern
	CoreUsesPID int
	PipeLimit   int
}

// ReadSnapshot 从给定根目录读取快照，根目录可注入以便测试。
func ReadSnapshot(root string) (Snapshot, error) {
	raw, err := os.ReadFile(filepath.Join(root, "core_pattern"))
	if err != nil {
		return Snapshot{}, err
	}
	p, err := Parse(string(raw))
	if err != nil {
		return Snapshot{}, err
	}
	s := Snapshot{Pattern: p}
	if v, err := readInt(filepath.Join(root, "core_uses_pid")); err == nil {
		s.CoreUsesPID = v
	}
	if v, err := readInt(filepath.Join(root, "core_pipe_limit")); err == nil {
		s.PipeLimit = v
	}
	return s, nil
}

func readInt(path string) (int, error) {
	f, err := os.Open(path)
	if err != nil {
		return 0, err
	}
	defer f.Close()
	scanner := bufio.NewScanner(f)
	if !scanner.Scan() {
		return 0, fmt.Errorf("%s 为空", path)
	}
	return strconv.Atoi(strings.TrimSpace(scanner.Text()))
}

// Finding 是一次差分或评级结果。
type Finding struct {
	Kind   string
	Level  Level
	Detail string
}

// Diff 比较两次快照，只报告真正变化的字段。
func Diff(prev, cur Snapshot, policy Policy) []Finding {
	var findings []Finding
	if prev.Pattern.Raw != cur.Pattern.Raw {
		findings = append(findings, Finding{
			Kind:   "core_pattern_changed",
			Level:  cur.Pattern.Rate(policy),
			Detail: fmt.Sprintf("%q -> %q", prev.Pattern.Raw, cur.Pattern.Raw),
		})
	}
	if prev.PipeLimit != cur.PipeLimit {
		findings = append(findings, Finding{
			Kind:   "core_pipe_limit_changed",
			Level:  LevelInfo,
			Detail: fmt.Sprintf("%d -> %d", prev.PipeLimit, cur.PipeLimit),
		})
	}
	return findings
}
```

### 8. 攻击者会怎么规避？我们的盲区在哪里？

**简洁答案：** 规避手段很多，所以规则不能押在单点上。最典型的是“改完即还原”，让快照差分完全看不到；以及“落地后删除 handler”，让文件基线也失效。

**关键知识点：**

- **改完还原**：快照差分只比较当前值，会漏掉。事件通道（eBPF 写事件）能抓到写入动作，但需要可靠地把 fd 解析成 `/proc/sys/kernel/core_pattern` 这个具体路径。
- **handler 自删除**：文件落地后立刻删除，文件基线同样失效。此时唯一稳定的证据是 exec 事件里的 `exe` 路径和“以 root 运行的、cwd 为 `/`、stdin 为管道”的进程特征。
- **延迟触发**：把 handler 设好之后很久才触发崩溃，攻击链在时间上被拉开，关联窗口必须按业务实际设置，并且要保留较长的历史上下文供回溯。
- **换用非管道形式**：把模板改成用户可写目录下的文件路径，先让进程崩溃把内容落盘，再单独执行，绕开“管道形式”这类只匹配形态的规则。
- **利用说明符**：崩溃进程的 `comm` 可被 `prctl(PR_SET_NAME)` 改写，因此在 5.3 之前的内核上，`%e`/`%E` 展开出的进程名如果带空格会被切成多个参数，handler 需要自行拼接。规则侧应该把“说明符出现在参数里”本身当作可评估项，而不是当作无害占位符。
- **环境受限**：普通容器里 `/proc/sys` 只读、特权受限时，这条攻击路径根本不成立；如果检测规则对这类环境仍然高优告警，就是典型误报。

**Go 落地思路：** 用“配置变更 + 崩溃记录 + root 执行”三类信号组合输出结论，并给每个结论标注证据等级：已证实执行、仅有配置变更、采集缺口。宁可承认看不见，也不要用“没有告警”暗示安全。

### 9. 缓解和修复怎么落地？会不会影响业务？

**简洁答案：** 缓解分三档：配置回滚、采集加固、运行时约束。每一档都要有明确的兼容性和回滚说明，不能直接在客户生产上试。

**关键知识点：**

- 回滚取值：恢复成发行版原始取值或受控的管道形式。改动前先记录原值，并确认 handler 路径存在、属主正确、内容可解释。
- 采集加固：容器内把 `/proc/sys` 挂载为只读是最直接的收敛手段；给 `core_pattern` 所在目录和 handler 目录做 root 独占、不可写约束；给 handler 做文件完整性校验和基线告警。
- 运行时约束：`core_pipe_limit` 设成合理上限可以避免 handler 长时间挂死导致的进程堆积；注意值为 0 会带来“不等待 handler”的行为差异，评估后再改。
- `fs.suid_dumpable=2` 时模板必须是绝对路径或管道形式，修改取值前要一起检查，否则内核会直接跳过转储，导致“看起来修好了其实没生效”。
- 业务影响面：崩溃转储是故障排查的证据来源，关掉或改写它会影响客户现有的崩溃收集流程。处置建议要先和客户确认崩溃收集方案，再一起改。

**Go 落地思路：** 给客户提供三段式 runbook：确认现状（读值 + 找 handler）→ 评估影响（谁是崩溃收集方）→ 分步处置（备份、修改、验证、观察），每步都有可回滚动作和验证命令。Agent 侧把处置结果回写到资产视图，避免下次扫描重复报同一件事。

## Go 落地思路

一个务实的实现可以分成四层：

1. **采集层**：eBPF 挂写系统调用或内核 sysctl 写路径，解析 fd 得到 `/proc/sys/kernel/core_pattern`；同时采集 `core_uses_pid`、`core_pipe_limit`。事件里带 `uid`、`pid`、`exe`、`cgroup`、容器与 namespace 信息。
2. **快照层**：周期性读取 sysctl 取值并落一份快照，作为“当前状态”的事实来源，也用来补采集通道启动前的窗口。读取失败本身要作为事件上报。
3. **规则层**：先做形态与白名单判定，再做 handler 文件属性判定，最后结合崩溃记录和 root 执行事件做攻击链关联，分级输出。
4. **输出层**：告警给出“改了什么、谁改的、有没有执行证据、证据在哪”，并保留原始事件引用，支持客户回放。

事件结构保持扁平即可，不要一上来就建复杂的关系模型：

```go
type CorePatternEvent struct {
	Timestamp    int64
	HostID       string
	UID          uint32
	PID          int
	Exe          string
	Cgroup       string
	ContainerID  string
	OldValue     string
	NewValue     string
	HandlerPath  string
	IsPipe       bool
	ExecObserved bool
}
```

`ExecObserved` 这类字段体现了一个重要态度：**结论里必须区分“看到变化”和“看到后果”**，不要用一个布尔值把两件事糊在一起。

## 学习要点

- `core_pattern` 是内核级配置，`|` 前缀把它变成 root 执行的入口，代价只是 128 字节的一个字符串。
- 管道语法、参数切分顺序（5.3 前后行为不同）、`dumpable` 门槛、`core_pipe_limit` 并发限制，共同决定了 handler 到底会不会跑。
- `/proc/sys` 大部分不是命名空间化的，特权容器里的改动会影响宿主机。
- procfs sysctl 写入不产生 fsnotify 通知，inotify/fanotify 盯不住它，事件通道必须用 eBPF 或系统调用层采集。
- 能改这个值的人已经具备 root 等价权限，规则的定级应该据此设计，而不是按“文件变更”低定级。
- 合法场景存在（systemd-coredump、发行版崩溃收集器），白名单要绑路径加属主加摘要，取值必须现场确认。
- “配置被改”和“handler 被执行”是两种证据，输出结论时要分开，并诚实标注采集缺口。

## 小练习

1. 在隔离虚拟机上读取 `/proc/sys/kernel/core_pattern`、`core_uses_pid`、`core_pipe_limit`，说明三者各自的作用，以及为什么它们要放在一起看。
2. 写一个最小 Go 程序，把 `core_pattern` 改成 `|/tmp/handler`，然后用 `kill -ABRT` 触发崩溃，观察 handler 是否以 root 身份启动、`/proc/<pid>` 里能否看到它的 `exe`、`cwd`、`stdin`，把观察结果写成检测字段清单。
3. 用 eBPF 挂 `sys_enter_write`，把 fd 解析成路径，验证能否稳定捕获对 `/proc/sys/kernel/core_pattern` 的写入；同时用 inotify 监听同一路径，验证它确实收不到事件。
4. 在 `core_pattern` 中使用 `%e` 和 `%E`，在 5.3 之前的内核上让 `comm` 含有空格，观察 handler 收到的参数被如何切分，说明这对检测规则意味着什么。
5. 设计三条规则，分别覆盖“取值被改成用户可写目录下的 handler”“handler 文件属性变化”“转储记录后紧跟 root 执行”，并为每条规则写出两个真实误报来源。
6. 模拟攻击者的“改完即还原”，分别用快照差分和事件通道检测，说明两者各自能否发现以及原因。
7. 检查客户环境里是否有发行版崩溃收集器（systemd-coredump、apport 等）在改写 `core_pattern`，设计一个不会误伤它们的基线方案。
8. 为“特权容器内修改宿主机 `core_pattern`”写一条检测规则，说明要采集哪些容器与 namespace 字段，以及跨主机如何关联。

## 复盘

这道题的核心不是记住 `core_pattern` 这个文件路径，而是理解一类“内核配置即执行入口”的攻击模型：内核把一个配置值变成程序启动指令，权限检查发生在配置写入时，而执行发生在完全不同的时刻、由完全不同的上下文触发。

能把“改配置”“触发崩溃”“以 root 执行”三段拆开，能说清每段的采集手段与盲区，能在误报和漏报之间给出有依据的取舍，回答就达到了主机安全岗位的要求。

## 参考资料

- [Linux man-pages：core(5)](https://man7.org/linux/man-pages/man5/core.5.html)
- [Linux 内核文档：Documentation/admin-guide/sysctl/kernel](https://www.kernel.org/doc/html/latest/admin-guide/sysctl/kernel.html)
- [Linux v6.12 源码：fs/coredump.c](https://github.com/torvalds/linux/blob/v6.12/fs/coredump.c)
- [Linux v6.12 源码：fs/proc/proc_sysctl.c](https://github.com/torvalds/linux/blob/v6.12/fs/proc/proc_sysctl.c)
- [Linux v6.12 源码：kernel/auditsc.c（audit_core_dumps）](https://github.com/torvalds/linux/blob/v6.12/kernel/auditsc.c)
- [Linux v6.12 头文件：include/uapi/linux/audit.h（AUDIT_ANOM_ABEND）](https://github.com/torvalds/linux/blob/v6.12/include/uapi/linux/audit.h)
- [systemd v257 源码：src/core/main.c（core_pattern 初始化）](https://github.com/systemd/systemd/blob/v257/src/core/main.c)
