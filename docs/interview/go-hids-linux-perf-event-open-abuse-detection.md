---
title: Go 主机安全面试：Linux perf_event_open 性能监控滥用与检测
date: 2026-11-04 17:10:00
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- perf
---

# Go 主机安全面试：Linux perf_event_open 性能监控滥用与检测

`perf_event_open(2)` 是 Linux 性能观测的底层入口：每打开一个事件就得到一个文件描述符，可以累计计数，也可以按周期把指令指针、寄存器、调用栈等样本写入环形缓冲区。它本身不是后门，root 和运维工具每天都在用；但当调用者拥有足够权限时，它也能观察其他进程甚至内核，因而是一项需要单独建模的敏感能力。

检测这类行为不能只看“有没有调用”。真正有区分度的是四件事：谁在监控谁、采集了什么、凭什么权限、打开之后又做了什么。

## 岗位场景

```text
Web 服务或低权限进程被利用
  -> 攻击者发现进程有 CAP_PERFMON，或宿主的 perf_event_paranoid 较宽松
  -> perf_event_open 附加到 sshd、nginx、凭据相关进程
  -> 采样 IP、用户寄存器、短栈、分支记录
  -> 或打开 tracepoint/kprobe 事件，再通过 ioctl 挂接 eBPF
  -> 高频采样、大量 fd 和 ring buffer 造成性能下降
  -> Go Agent 关联 syscall、attr、目标进程、能力和后续 mmap/ioctl
  -> 输出“谁在监控谁、采了什么、持续多久、是否成功”
```

阶段要拆开：打开事件、开始采集、读取样本、挂接 BPF、关闭或继承 fd 是不同事件。只看到一次 `perf_event_open` 成功，不能直接推导出数据已经泄露。

## 高频面试题

### 1. `perf_event_open` 的计数模式和采样模式有什么区别？`pid`、`cpu`、`group_fd` 怎么理解？

**简洁答案：** 计数模式只累计事件次数，通常用 `read(2)` 取聚合值；采样模式在事件溢出时把样本写入 `mmap(2)` 的环形缓冲区。`pid` 决定监控哪个进程/线程，`cpu` 决定监控哪个 CPU，`group_fd` 把多个事件组成一个调度组。

**关键知识点：**

- `pid == 0` 表示调用者自己；`pid > 0` 表示指定进程/线程；`pid == -1` 且 `cpu >= 0` 表示监控该 CPU 上的所有任务；`pid == -1` 且 `cpu == -1` 是非法组合。
- `group_fd == -1` 创建组长事件；后续事件用组长 fd 加入同一组。组内事件要么一起上 CPU，要么一起不上，因此计数可以相互比较。
- `attr.type` 选择事件源：硬件事件、软件事件、tracepoint、硬件缓存、raw PMU、断点等；`attr.config` 的含义由 `type` 决定，不能脱离 `type` 单独解释。
- `attr.freq == 1` 时使用 `sample_freq`，否则使用 `sample_period`；采样频率过高会放大 CPU、内存和 ring buffer 压力。
- `PERF_FLAG_FD_CLOEXEC` 让事件 fd 在 `execve` 时自动关闭，避免被新程序继承；不设置时，fd 可能跨 exec 存活。
- `PERF_FLAG_PID_CGROUP` 让 `pid` 参数解释为 cgroup fd，监控范围变成整个 cgroup，而不是单个进程。

**Go 落地思路：** 事件模型里把“范围”和“事件定义”分开：范围记录 `pid/cpu/cgroup/namespace`，事件定义记录 `type/config/sample_*`。不要用一个 `pid` 字段同时表达“目标任务”和“cgroup”。

### 2. 为什么普通进程通常打不开内核采样？`perf_event_paranoid` 和 `CAP_PERFMON` 是什么关系？

**简洁答案：** 内核用 `perf_event_paranoid` 限制非特权进程的监控范围，并用 `CAP_PERFMON`（或旧的 `CAP_SYS_ADMIN`）作为绕过限制的特权。数值越大限制越严，默认值通常是 2。

**关键知识点：**

| `perf_event_paranoid` | 非特权进程的范围 |
| --- | --- |
| `-1` | 基本不限制，也不限制 perf 专用的 mlock 额度 |
| `>= 0` | 可做进程级和系统级监控，但不能采 raw tracepoint 和 ftrace function tracepoint |
| `>= 1` | 只能做进程级监控，不能系统级监控；仍可采内核和用户态 |
| `>= 2` | 只能做进程级监控，且只能采用户态；这是 Linux 4.6 以来的默认值 |

- `CAP_PERFMON` 从 Linux 5.8 引入，按最小权限原则替代“为了 perf 而给 `CAP_SYS_ADMIN`”的做法；内核同时接受 `CAP_SYS_ADMIN`。
- Linux 5.9 起，`CAP_PERFMON` 足以通过性能监控的权限检查；更早的内核还会走 `PTRACE_MODE_READ_REALCREDS` 检查。
- 内核的 `perfmon_capable()` 使用 `capable()`，按初始用户命名空间判断。容器里 `CapEff` 有 `CAP_PERFMON`，不代表它在宿主初始 user namespace 里也有效；非初始 user namespace 中的能力不能直接替代宿主权限。
- LSM 的 `security_perf_event_open()` 和 seccomp 还可以在能力检查之外继续拒绝。看到 `EACCES`/`EPERM` 时，不能只归因于“没有 root”。
- `pid == -1, cpu >= 0` 这类系统级监控通常需要能力或更宽松的 paranoid 设置；普通用户附加到别人的进程还会受 ptrace 权限约束。

**Go 落地思路：** 在事件发生时刻读取 `/proc/sys/kernel/perf_event_paranoid`，同时记录 `CapEff`、`CapPrm`、`CapBnd`、`NoNewPrivs` 和 seccomp 状态。不要用事后读取的 sysctl 值解释很久以前的事件；配置可能在窗口内被修改。

### 3. 为什么“性能采样”会变成敏感数据泄露？`sample_type` 里哪些字段值得关注？

**简洁答案：** 采样记录可以带指令指针、调用链、用户寄存器、用户栈片段、分支记录和 tracepoint 原始负载；当调用者能监控其他进程或内核时，这些数据可能暴露控制流、内存地址、执行路径和业务数据特征。它不是“任意读文件”，但足以造成敏感信息泄露和侧信道分析风险。

**关键知识点：**

- `PERF_SAMPLE_IP` 记录采样时的指令指针；`PERF_SAMPLE_CALLCHAIN` 记录调用链；两者能还原程序执行路径。
- `PERF_SAMPLE_REGS_USER` 配合 `sample_regs_user` 选择要保存的用户寄存器；`PERF_SAMPLE_STACK_USER` 配合 `sample_stack_user` 保存一段用户栈。栈里可能残留参数、指针和临时数据。
- `PERF_SAMPLE_REGS_INTR` 记录中断上下文寄存器；`PERF_SAMPLE_RAW` 保存 tracepoint 的原始负载；`PERF_SAMPLE_BRANCH_STACK` 记录分支历史。
- `attr.exclude_kernel`、`exclude_user`、`exclude_hv`、`exclude_idle` 和 `exclude_callchain_*` 共同决定采集边界。字段为 0 通常表示不排除，不能想当然认为默认只采用户态。
- `sample_period` 越小或 `sample_freq` 越高，采样越密；长时间、高频率地监控认证或加密进程，风险显著高于一次性短采样。
- perf 的安全文档明确把“执行上下文寄存器、用户/内核内存地址和数据、相关 MSR”列为可能包含敏感数据的高风险类别；是否真的能提取出密钥，取决于目标代码、采样精度和运行环境，不能承诺“必然拿到”。

**Go 落地思路：** 规则里把 `sample_type` 拆成可解释标签：`ip`、`callchain`、`user_regs`、`user_stack`、`branch_stack`、`raw_tracepoint`。不要只保存一个巨大的 `sample_type` 数字；告警正文应让分析人员一眼看出“采了控制流还是只做了计数”。

### 4. 攻击者可能怎样滥用 perf 事件？哪些行为最值得告警？

**简洁答案：** 常见路径是：附加到高价值进程做定向采样、用系统级事件观察内核和其他进程、通过 tracepoint/kprobe 扩大观测面、用高频采样或大量 fd 消耗资源，以及利用 `sigtrap` 向目标任务发信号。最值得告警的是“跨用户/跨权限边界 + 高信息量采样 + 持续或批量创建”。

**关键知识点：**

- 定向采样：对一个 sshd、Web 服务或凭据相关进程设置用户寄存器/栈/调用链采样，观察认证或加密路径。
- 系统级监控：`pid == -1, cpu >= 0` 观察整个 CPU；有 `CAP_PERFMON` 时更容易成立，容器逃逸场景要特别关注。
- 内核观测：tracepoint、kprobe 和断点可以把观测面扩展到内核函数和系统调用；这不是“绕过所有安全机制”，但会削弱基于路径和命令行的可见性。
- `PERF_EVENT_IOC_SET_BPF` 可以把 eBPF 程序挂到 perf 事件上；`PERF_EVENT_IOC_PERIOD` 能在运行中改变采样周期，`PERF_EVENT_IOC_ENABLE` 控制启停。检测不能只看 open，还要看这些 ioctl。
- `attr.sigtrap` 会向目标任务发送同步 `SIGTRAP`；内核还要求对目标任务所在 user namespace 具备 `CAP_KILL`，否则会升级为 ptrace attach 检查。它可以干扰目标，也可能被用于探测。
- 资源滥用：每个事件占一个 fd；`perf_event_max_sample_rate` 默认 100000，过高采样可能拖慢甚至拖死机器；`perf_event_mlock_kb` 默认 516 kB，ring buffer 还受 mlock 额度约束。
- `inherit` 让子进程继承事件；`remove_on_exec` 让事件在 exec 时移除；`PERF_FLAG_FD_CLOEXEC` 决定 fd 是否跨 exec 存活。这些生命周期字段会影响“事件到底跟到了哪里”。

**Go 落地思路：** 把风险拆成三个维度：信息量（寄存器/栈/调用链/内核）、范围（单进程/跨用户/系统级/cgroup）、持续性（单次/批量/长时间/继承）。三者组合评分，比单独看“调用了 perf_event_open”稳定得多。

### 5. 采集 `perf_event_open` 时，事件里至少应该记录什么？

**简洁答案：** 至少记录进程实例、目标进程、能力与命名空间、`attr` 的关键字段、`pid/cpu/group_fd/flags`、返回值/errno、当时的 paranoid 值，以及后续 `mmap/ioctl/read/close`。还要区分“进入 syscall”“成功拿到 fd”“被拒绝”三种状态。

**关键知识点：**

- `attr.size` 是 ABI 版本和边界：内核接受 `0`（按 `PERF_ATTR_SIZE_VER0`，即 64 字节处理）、小于 64 或大于一页的值会被拒绝；结构体尾部按 `size` 零填充，超出已知结构体的非零字节会触发 `E2BIG`。
- 检测器读取用户态 `attr` 时只能读 `min(attr.size, 4096)`，不能把 144 字节结构体当成永远有效；否则会把内核已经忽略的尾部垃圾当成真实配置。
- 需要保存的字段包括 `type`、`config`、`sample_type`、`read_format`、`sample_period`/`sample_freq`、`freq`、`exclude_kernel`、`exclude_user`、`exclude_hv`、`exclude_callchain_*`、`wakeup_events`、`bp_type`、`config1`、`config2`、`precise_ip`、`inherit`、`remove_on_exec`、`sigtrap`。
- 目标侧至少记录 `pid`、`starttime`、`comm`、`exe` 哈希、UID/EUID、cgroup、mount/pid/user namespace；否则 PID 复用后会把两个进程拼成一条链。
- 还要记录调用者是否具备 `CAP_PERFMON`/`CAP_SYS_ADMIN`、`NoNewPrivs`、seccomp 模式、LSM 是否拒绝，以及容器是否使用 user namespace。
- 返回值是 fd 时记录 fd 和打开时间；返回 `EACCES`、`EPERM`、`EINVAL`、`EMFILE`、`ESRCH`、`ENODEV` 时分别代表权限、参数、资源、目标消失或硬件不支持，不能合并成一个“失败”。
- `sys_enter` 捕获的 `attr` 是用户态声明，内核随后才复制并校验；另一个线程可能在复制前修改内存。要把它当作“声明证据”，最终以成功返回和后续行为为准。

**Go 落地思路：** 事件结构里保留原始 `attr` 的截断哈希和 `attr.size`，但不要把用户态内存原样当字符串写入日志。能力、目标、后续 fd 操作和 paranoid 值分开存储，方便规则组合和事后复盘。

### 6. 怎样把 perf 事件 fd 与后续的 `mmap`、`ioctl`、`read` 关联起来？

**简洁答案：** 用 `sys_exit` 的返回值拿到 fd，再用 `(pid, starttime, fd, open_time)` 关联后续 `mmap/ioctl/read/close/dup`。fd 会被关闭和复用，不能只用 `(pid, fd)` 做长期主键；fork/exec/继承和 `CLOEXEC` 也要纳入生命周期。

**关键知识点：**

- `mmap` 的 `fd` 和 `offset` 可以说明是否为 perf ring buffer 建立映射；`prot`、`length` 和 `flags` 能区分只读观察还是可写映射。
- `ioctl` 的 `cmd` 是关键：`PERF_EVENT_IOC_SET_BPF` 表示尝试挂 BPF，`PERF_EVENT_IOC_PERIOD` 表示改采样周期，`PERF_EVENT_IOC_ENABLE/DISABLE` 表示启停。
- `read` 读取计数聚合值；采样模式通常走 `mmap` ring buffer，但仍可能配合 `read` 读取格式头。
- `dup`、`fcntl(F_DUPFD)` 会制造多个 fd 指向同一事件；`fork`/`clone` 可能继承 fd 表；`execve` 时是否关闭取决于 `CLOEXEC`。
- `close` 事件是生命周期终点；但 fd 号可能立即被新事件复用，必须结合打开时间、进程实例和事件 id（如果采集得到）区分。
- 用 `fd_install` 等内核内部函数做关联更强，但它不是稳定 ABI，跨内核版本风险高；优先用 syscall tracepoint + fd 表快照，并明确覆盖缺口。

**Go 落地思路：** 维护一个有界 map：key 为 `pid + starttime + fd`，value 包含 open_time、事件摘要和最后一次操作；进程退出、close、exec 或超过 TTL 时清理。不要把 fd 关联表做成无界缓存，攻击者可以用大量事件把它撑爆。

### 7. 线上怎样降低误报，又避免把真实滥用降掉？

**简洁答案：** 先建立“正常性能工具”基线，再用目标敏感性、跨用户/跨命名空间、采样信息量、系统级范围和持续性做风险分层。允许列表要绑定可执行文件哈希、父进程、cgroup 和维护窗口，不能只按进程名放行。

**关键知识点：**

- 正常基线通常包括 `perf`、`bpftrace`、可观测性 Agent、数据库/运行时自带的诊断工具，以及运维人员的短时排障。它们的共同特征是来源可解释、目标与职责匹配、持续时间有限。
- 高风险信号：低权限 Web 进程监控 sshd；跨用户附加；系统级 `pid == -1`；内核 tracepoint/kprobe；用户寄存器/栈/调用链采样；高频、长时间、批量 fd；`sigtrap`；挂接 BPF 后继续运行。
- 低风险信号：只读计数、`exclude_kernel=1`、短时、目标就是自身、来自已登记的运维工具、在维护窗口内。
- 允许列表至少绑定 `exe` 的哈希和 inode，防止“同名替换”；同时记录 `suppressed_by` 和过期时间，避免永久静默。
- 聚合维度用“进程实例 + 目标 + 事件类型 + 时间窗”，不要对每一次 `perf_event_open` 单独告警；但也不能把不同主机的同类事件合并到无法定位。
- 降噪不能丢弃证据：保留原始事件计数、覆盖缺口和采样丢失指标，否则客户问“为什么没告警”时无法区分“没发生”和“没看到”。

**Go 落地思路：** 规则引擎里把 `baseline_match`、`risk_score`、`suppression` 分开，先算事实再决定是否抑制。抑制规则命中时仍写入审计流，只降低告警级别，不删除事件。

### 8. Go Agent 怎样安全地解析用户态 `perf_event_attr`？

**简洁答案：** 用 `encoding/binary` 按固定偏移读取，先校验 `size` 和缓冲区长度，再只读取声明范围内的字段；`size == 0` 按 64 字节处理，`config2` 只在 `size >= 72` 时读取。不要用 `unsafe` 直接把用户指针转成结构体，也不要把尾部当有效数据。

**关键知识点：**

- 字段偏移：`type` 0、`size` 4、`config` 8、`sample_period/sample_freq` 16、`sample_type` 24、`read_format` 32、`flags` 40、`wakeup_events` 48、`bp_type` 52、`config1` 56、`config2` 64。
- `flags` 是位域：`inherit` bit 1、`exclude_user` bit 4、`exclude_kernel` bit 5、`freq` bit 10、`inherit_thread` bit 35、`remove_on_exec` bit 36、`sigtrap` bit 37。
- `size == 0` 是内核兼容 quirk，等价于最初的 64 字节结构；检测器应复现这个语义，而不是把 0 当非法值。
- 采样敏感性可以用 `sample_type` 的 `IP`、`CALLCHAIN`、`REGS_USER`、`STACK_USER`、`REGS_INTR` 位做快速筛选，再结合 `exclude_kernel/exclude_user` 判断范围。
- 解析函数只负责“把字节变成事实”，不要在解析层直接判定恶意；恶意判断需要目标、能力和行为上下文。

**Go 落地思路：** 下面这段代码只解析前 72 字节内的稳定字段，足以支撑检测和测试；更细的字段按需扩展，避免一次引入整份内核结构体。

```go
package perfwatch

import (
	"encoding/binary"
	"errors"
	"fmt"
)

const (
	perfAttrVer0 = 64
	perfAttrVer1 = 72
	perfAttrMax  = 4096

	sampleIP        = uint64(1 << 0)
	sampleCallchain = uint64(1 << 5)
	sampleRegsUser  = uint64(1 << 12)
	sampleStackUser = uint64(1 << 13)
	sampleRegsIntr  = uint64(1 << 18)
)

type Attr struct {
	Size         uint32
	Type         uint32
	Config       uint64
	SamplePeriod uint64
	SampleType   uint64
	ReadFormat   uint64
	Flags        uint64
	WakeupEvents uint32
	BpType       uint32
	Config1      uint64
	Config2      uint64
	Config2Valid bool
}

func (a Attr) Freq() bool          { return a.Flags&(1<<10) != 0 }
func (a Attr) ExcludeKernel() bool { return a.Flags&(1<<5) != 0 }
func (a Attr) ExcludeUser() bool   { return a.Flags&(1<<4) != 0 }
func (a Attr) Inherit() bool       { return a.Flags&(1<<1) != 0 }
func (a Attr) Sigtrap() bool       { return a.Flags&(1<<37) != 0 }

func (a Attr) SensitiveSample() bool {
	return a.SampleType&(sampleIP|sampleCallchain|sampleRegsUser|sampleStackUser|sampleRegsIntr) != 0
}

func ParseAttr(buf []byte) (Attr, error) {
	if len(buf) < 8 {
		return Attr{}, errors.New("perf_event_attr header truncated")
	}
	size := binary.LittleEndian.Uint32(buf[4:8])
	if size == 0 {
		size = perfAttrVer0
	}
	if size < perfAttrVer0 || size > perfAttrMax {
		return Attr{}, fmt.Errorf("invalid perf_event_attr size %d", size)
	}
	if uint64(len(buf)) < uint64(size) {
		return Attr{}, fmt.Errorf("attr buffer %d shorter than size %d", len(buf), size)
	}

	a := Attr{
		Type:         binary.LittleEndian.Uint32(buf[0:4]),
		Size:         size,
		Config:       binary.LittleEndian.Uint64(buf[8:16]),
		SamplePeriod: binary.LittleEndian.Uint64(buf[16:24]),
		SampleType:   binary.LittleEndian.Uint64(buf[24:32]),
		ReadFormat:   binary.LittleEndian.Uint64(buf[32:40]),
		Flags:        binary.LittleEndian.Uint64(buf[40:48]),
		WakeupEvents: binary.LittleEndian.Uint32(buf[48:52]),
		BpType:       binary.LittleEndian.Uint32(buf[52:56]),
		Config1:      binary.LittleEndian.Uint64(buf[56:64]),
	}
	if size >= perfAttrVer1 {
		a.Config2 = binary.LittleEndian.Uint64(buf[64:72])
		a.Config2Valid = true
	}
	return a, nil
}
```

配套测试至少要覆盖：`size == 0` 按 64 字节处理、`size == 72` 才解析 `config2`、超过检测器读取上限（示例为 4096 字节）拒绝、缓冲区短于声明长度拒绝、`freq`/`exclude_kernel`/`sigtrap` 位判断。这样即使内核结构体继续增长，解析器也不会越界读取。

### 9. 客户说“发生了性能监控但没有告警”，或者“运维跑 perf 被误报”，怎么排查？

**简洁答案：** 先确认采集层有没有看到 syscall，再确认权限和 sysctl 是否允许，最后检查规则是否抑制、fd 是否快速关闭、事件是否丢失。误报则按工具来源、目标职责、采样范围和持续时间逐项豁免，而不是直接关掉整条规则。

**关键知识点：**

- 漏报排查顺序：eBPF/auditd 是否覆盖 `perf_event_open`；seccomp/LSM 是否在 syscall 入口前拒绝；`perf_event_paranoid` 和能力是否让调用失败；目标是否在调用后立即退出（`ESRCH`）；fd 是否在采集器处理前关闭；ring buffer 是否丢事件；规则是否把该进程/主机抑制掉。
- 误报排查顺序：是否为 root 或具备 `CAP_PERFMON` 的运维工具；是否在维护窗口；目标是否就是自身或已登记服务；是否只做计数且 `exclude_kernel=1`；是否短时、低频；是否来自受管 Agent。
- `perf_event_paranoid` 是全局 sysctl，不是每个容器的独立配置；容器内看到的限制可能来自宿主设置。
- `perf_event_open` 的 `EACCES`/`EPERM` 既可能来自能力，也可能来自 LSM、seccomp 或 paranoid；`EINVAL` 更可能是 attr 参数或事件组合问题；`EMFILE` 要查 `RLIMIT_NOFILE` 和批量 fd。
- 白盒 POC 应在一次性 Linux 虚拟机里做：分别测试无能力、`CAP_PERFMON`、`perf_event_paranoid=2/1/0/-1`、seccomp 拦截和容器 user namespace；记录 syscall 返回值、采集事件和规则命中，不要把客户生产环境当实验场。
- 解析器的单元测试要包含恶意/畸形 attr：超长 size、短缓冲区、尾部垃圾、`size=0`、`size=72`、位域全开。不要只用正常 `perf` 工具生成的样本。

**Go 落地思路：** 给每条告警附带 `coverage_gaps` 和 `decision_path`：哪些字段来自 syscall、哪些来自 procfs、哪些读取失败、命中了哪条抑制规则。这样客户复盘时能看到“没告警”是没采到、没权限、被抑制，还是规则判断为低风险。

## Go 实现要点

一个够用的链路可以分成四层：

1. **采集层：** 用 eBPF tracepoint 或 auditd 捕获 `sys_enter/sys_exit`，记录 `attr` 指针、`pid/cpu/group_fd/flags`、返回 fd 和 errno；对用户指针做有界读取。
2. **归因层：** 用 `pid + starttime + boot ID` 绑定进程实例，读取 `CapEff`、`NoNewPrivs`、seccomp、cgroup、user/pid/mount namespace、目标进程 exe 哈希。
3. **检测层：** 组合范围、信息量、权限、持续时间和后续 ioctl/mmap；区分“尝试”“被拒绝”“成功打开”“开始采样”“挂接 BPF”“已关闭”。
4. **治理层：** 维护工具基线、允许列表、时间窗聚合、事件丢弃指标和覆盖缺口；抑制只降级，不删除原始审计事件。

事件结构可以保持扁平，避免过深嵌套：

```go
type PerfEvent struct {
	At            time.Time
	Phase         string // enter、exit、mmap、ioctl、close
	PID           int
	TGID          int
	StartTime     uint64
	TargetPID     int
	TargetStart   uint64
	Attr          Attr
	PerfParanoid  int
	CapEff        uint64
	NoNewPrivs    bool
	SeccompMode   uint8
	ReturnFD      int32
	Errno         string
	IoctlCmd      uint32
	CoverageGaps  []string
}
```

`Attr` 里的 `Config2Valid` 很重要：旧程序只传 64 字节时，检测器不能把后面的内存解释成 `config2`。同理，`sample_type` 非零不代表一定发生了采样，还要看事件是否成功、是否映射了 ring buffer、是否启用了事件。

## 学习要点

| 方向 | 需要掌握 |
| --- | --- |
| 系统调用 | `perf_event_open`、`read`、`mmap`、`ioctl`、`close`、`dup`、`execve` |
| 事件模型 | counting vs sampling、`perf_event_attr`、`type/config`、`group_fd`、`pid/cpu` |
| 权限边界 | `perf_event_paranoid`、`CAP_PERFMON`、`CAP_SYS_ADMIN`、ptrace 检查、LSM、seccomp |
| 数据敏感性 | `sample_type`、IP、调用链、用户寄存器、用户栈、分支记录、tracepoint raw |
| 采集链路 | eBPF syscall tracepoint、auditd、ring buffer、fd 生命周期、事件丢失 |
| 容器与命名空间 | user namespace 能力、cgroup 范围、宿主 sysctl、跨命名空间归因 |
| 检测设计 | 目标敏感性、跨用户、系统级范围、采样信息量、持续性、后续 ioctl |
| 降噪与性能 | 工具基线、允许列表、时间窗聚合、有界缓存、采样频率和 mlock 限制 |

## 小练习 / 复盘题

1. 画出从“低权限进程被利用”到“对 sshd 做用户栈采样”的完整链路，并标出 Go Agent 至少六个可观测点。
2. 解释 `perf_event_paranoid=2` 时普通进程为什么通常只能采用户态，以及容器内 `CAP_PERFMON` 为什么不一定有效。
3. 写出三条规则：一条针对运维短时 `perf stat`，一条针对跨用户高信息量采样，一条针对系统级 tracepoint + BPF 挂接；说明各自的证据和抑制条件。
4. 为 `ParseAttr` 补测试：`size=0`、`size=64`、`size=72`、`size=4096`、`size=4097`、短缓冲区、`config2` 边界。
5. 设计 fd 关联表，说明 `dup`、`fork`、`exec`、`close` 和 fd 复用分别怎样处理；给出缓存上限和过期策略。
6. 比较 eBPF、auditd 和 procfs 对“打开事件”“读取样本”“挂接 BPF”“关闭事件”分别能提供什么，列成表。
7. 模拟客户漏报：采集器看到 `sys_enter` 但没有 `sys_exit`，写出至少五种可能原因和验证方法。
8. 在隔离虚拟机中做白盒 POC：分别测试无权限、`CAP_PERFMON`、宽松 paranoid、seccomp 拦截四种情况，记录 errno、审计事件和规则结果，并说明哪些结论不能外推到生产。

## 参考资料

1. [Linux man-pages：perf_event_open(2)](https://man7.org/linux/man-pages/man2/perf_event_open.2.html)
2. [Linux kernel documentation：Perf events and tool security](https://www.kernel.org/doc/html/latest/admin-guide/perf-security.html)
3. [Linux man-pages：capabilities(7)](https://man7.org/linux/man-pages/man7/capabilities.7.html)
4. [Linux kernel documentation：kernel sysctl](https://www.kernel.org/doc/html/latest/admin-guide/sysctl/kernel.html)
5. [Linux UAPI：perf_event.h](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/include/uapi/linux/perf_event.h)
6. [Linux kernel source：kernel/events/core.c](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/kernel/events/core.c)
