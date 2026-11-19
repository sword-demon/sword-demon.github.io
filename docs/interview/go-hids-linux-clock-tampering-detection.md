---
title: Go 主机安全面试：Linux 系统时间篡改与事件时间线可信度检测
date: 2026-11-19 17:10:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- linux
- clock
---

# Go 主机安全面试：Linux 系统时间篡改与事件时间线可信度检测

## 岗位场景

你是云铠主机安全产品的 Go 研发，负责“主机侧时间可信度”这一块。客户提的问题往往很安静，但杀伤力很大：

- “我们的告警时间线乱了：同一个攻击链里，前一条事件比后一条早了 3 小时。”
- “客户说机器被人入侵后改过时间，我们拿到的日志全是错的，怎么还原？”
- “沙箱里跑恶意样本，样本把系统时间往前调了 5 年，我们的沙箱就再也不触发超时了。”
- “有一台机器 `/proc/stat` 里的 `btime` 变了，但机器没重启过，这是什么情况？”
- “客户运维说他 `date -s` 改过一次时间校准，我们的告警就报‘时钟被篡改’，怎么解释？”

这五类问题指向同一个技术面：**时间是主机安全里最容易被静默污染、也最容易被忽略的信任根**。

日志、告警时间戳、文件 mtime、证书有效期校验、沙箱超时、C2 心跳抖动窗口、许可证检查——全都建立在一个前提上：**这台机器的墙钟说的是真话**。而 Linux 上改这件事非常便宜，一条 `date -s` 或者一个 `clock_settime(CLOCK_REALTIME)` 系统调用就够了。

这一篇把这条链路拆开讲清楚：Linux 上的几个时钟各自能不能被改、攻击者改时间能拿到什么好处、`adjtimex` 这个不用 root 就能读的内核接口怎么用、怎么用单调钟把墙钟跳变揪出来、时间命名空间为什么不能伪造文件时间戳、Go 侧怎么落地以及误报怎么治理。

---

## 背景速览：Linux 上的五个时间源

主机安全里说的“时间”至少是五个不同的东西，混淆它们是这条线最容易犯的错。

| 时间源 | 能不能被改 | 含义 | 受 NTP 频率调整影响 | 计入休眠时间 |
| --- | --- | --- | --- | --- |
| `CLOCK_REALTIME` | **能**（需 `CAP_SYS_TIME`） | 墙钟，Unix 纪元以来的秒数 | 是 | 否 |
| `CLOCK_MONOTONIC` | 不能 | 单调钟，开机以来的时长 | 是 | **否** |
| `CLOCK_BOOTTIME` | 不能 | 单调钟 + 休眠时长 | 是 | **是** |
| `CLOCK_TAI` | 间接（改 REALTIME 时跟随） | 国际原子时，含闰秒 | 是 | 否 |
| RTC（`/dev/rtc0`） | 能（`RTC_SET_TIME` ioctl 需 `CAP_SYS_TIME`） | 硬件电池时钟，关机也走 | 否 | 是 |

三条必须记住的硬规则，全部来自 `clock_gettime(2)` 的原文：

1. **`CLOCK_MONOTONIC` 不受墙钟阶跃影响**。手册原话是它 “is not affected by discontinuous jumps in the system time (e.g., if the system administrator manually changes the clock)”。这句话是整个检测方案的基石——**单调钟是墙钟的天然对照物**。
2. **`CLOCK_MONOTONIC` 受 NTP 的频率调整影响**，但那是“斜坡”（slew），不是“阶跃”（step）。区分斜坡和阶跃，是区分“运维在正常校时”和“有人在偷时间”的核心。
3. **`CLOCK_BOOTTIME` 比 `CLOCK_MONOTONIC` 多了休眠时长**，所以 `BOOTTIME − MONOTONIC` 就是一个纯粹的“累计挂起时间”指标。

还有一个容易被忽略的点：**`CLOCK_TAI` 的纪元比 `CLOCK_REALTIME` 早 10 秒**（TAI 在 1972 年引入闰秒前本来就领先 UTC），正常机器上 `TAI − REALTIME` 恒为 37 秒（闰秒制度废除前的当前值）。这个差值被改，说明时间不只是被“调”，而是被乱调过。

---

## 高频面试题

### Q1：Linux 上到底有几个时钟？哪些能被改，改了会影响谁？

**简洁答案**

系统调用层面主要是 `CLOCK_REALTIME`、`CLOCK_MONOTONIC`、`CLOCK_BOOTTIME`、`CLOCK_TAI` 这几个全局时钟，另外还有 `CLOCK_PROCESS_CPUTIME_ID` 这类每进程的时钟。

- **`CLOCK_REALTIME` 是唯一能被普通途径改写的全局时钟**。改写它的系统调用是 `clock_settime(CLOCK_REALTIME, ...)` 和 `settimeofday(2)`，两者都需要 `CAP_SYS_TIME`。改写之后：所有进程的 `gettimeofday`/`clock_gettime(CLOCK_REALTIME)` 立刻变；**以绝对时间点为基准的定时器**（`timer_create` 的 `CLOCK_REALTIME_ALARM` 等）会跟着变；**新创建文件的 mtime/ctime** 会带上被改过的时间戳；但**以相对时长为基准的定时器**（相对超时语义的那一类）不受影响。
- **`CLOCK_MONOTONIC` / `CLOCK_BOOTTIME` 改不了**（普通权限下没有任何系统调用能写）。它们只能通过内核内部的偏移机制（时间命名空间）被“看起来”改掉，而且只对该命名空间内的进程可见。
- **`CLOCK_TAI` 改不了**，只能间接跟随 `CLOCK_REALTIME` 的阶跃，加上 `adjtimex(ADJ_TAI)` 设置闰秒偏移。
- **RTC 是另一套**，它是硬件电池时钟，关机状态下照样走。`/dev/rtc0` 的 `RTC_SET_TIME` ioctl 同样需要 `CAP_SYS_TIME`。

**关键知识点**

`clock_settime(2)` 手册明确：`CLOCK_REALTIME` 是 “A settable system-wide clock”，且 “Setting this clock requires appropriate privileges”。`settimeofday(2)` 则是老接口，功能上被 `clock_settime` 取代。

这里有个非常实用的推论：**攻击者改墙钟之后，相对超时逻辑（沙箱的 60 秒 detonation 窗口、EDR 自己的心跳间隔）完全不受影响**。所以“沙箱超时失效”这种客户反馈，根因往往不是沙箱写错了，而是沙箱把 wall clock 当成了超时基准。

**Go 落地思路**

在 Agent 侧，任何“超时”逻辑都应该用单调钟（`time.Since` / `time.NewTimer`），任何“时间戳”逻辑才用墙钟。两者混用是这类问题的经典来源。

---

### Q2：攻击者改主机时间，具体能拿到什么好处？

**简洁答案**

至少六个真实收益，这也是这条检测规则值得存在的理由：

1. **绕过基于时间的沙箱/沙箱逃逸检测**。样本把系统时间往前调 1 年，“进程运行超过 10 分钟就判定为沙箱逃逸”这类逻辑就永远不触发。
2. **绕过证书有效期校验**。把时间往前调，HTTPS/TLS 证书会表现为“已过期”；往后调则表现为“尚未生效”。两个方向都能让基于证书校验的检测（C2 通信的证书指纹比对、恶意流量识别）失准。
3. **污染日志时间线，破坏取证**。这是对防守方伤害最大的一种：事后复盘时你看到的所有时间戳都是攻击者挑过的。
4. **躲过许可证/订阅/试用期检查**。把时间往前调，“你的授权过期了”这类判断就失效了。
5. **绕过时间窗口类检测规则**。“同一账号 24 小时内登录 100 次”、“两次心跳间隔抖动超过 50%”，把时间一调，窗口就错位了。
6. **让勒索软件的倒计时/删除威胁失效**，或者反过来把受害者的“付款期限”改长。

**关键知识点**

第 1 条和第 3 条最值得展开。攻击者真正想要的是**“让检测器的判断基准和我的行为对不上”**，而不只是“让日志好看”。

一个容易被忽略的细节：`CLOCK_REALTIME` 的阶跃会让**以绝对时间点为基准的定时器**错乱，但不会影响相对定时器。`setitimer`/`timerfd` 用的是相对时长，`timer_create` 用 `CLOCK_REALTIME` 时用的是绝对时间点。攻击者改时间后，系统的 cron、`systemd` 定时器（`OnCalendar=` 用的是绝对时间）行为会变得很奇怪，这是很好的旁证。

**Go 落地思路**

规则设计要把“时间被改了”和“行为可疑”**分成两个独立结论**：

- 结论 A：**时钟完整性被破坏**（基础设施层问题，需要立刻知道，因为后续所有时间相关分析都不可信）。
- 结论 B：某段行为是否可疑（业务层判断）。

不要用 A 去直接触发 B。客户机器上运维改一次时间，A 成立，但不代表主机被入侵了。

---

### Q3：`date -s`、`timedatectl set-time`、`hwclock --systohc` 底层分别做了什么？谁能改？

**简洁答案**

| 命令 | 底层动作 | 权限 |
| --- | --- | --- |
| `date -s "..."` | `clock_settime(CLOCK_REALTIME)` | root（`CAP_SYS_TIME`） |
| `timedatectl set-time "..."` | `clock_settime(CLOCK_REALTIME)` | root |
| `hwclock --hctosys` | 读 RTC → `settimeofday` → `clock_settime` | root |
| `hwclock --systohc` | 读系统时钟 → `RTC_SET_TIME` ioctl | root |
| `chronyc makestep` | 让 chronyd 做一次 `clock_settime` 阶跃 | chronyd 持有 `CAP_SYS_TIME` |
| `adjtimex(ADJ_SETOFFSET)` | 阶跃，等价于 `clock_settime` | `CAP_SYS_TIME` |
| `adjtimex(ADJ_OFFSET)` | 斜坡（slew），把偏移在后续几秒里平滑消化 | `CAP_SYS_TIME` |
| `adjtime(3)` | 老式单次调整（斜坡） | `CAP_SYS_TIME` |

**关键知识点**

`adjtimex(2)` 的 man page 有一句硬约束：**“Ordinary users are restricted to a value of either 0 or ADJ_OFFSET_SS_READ for modes. Only the superuser may set any parameters.”** 而 `EPERM` 的说明写得很清楚：“the caller does not have sufficient privilege. Under Linux, the CAP_SYS_TIME capability is required.”

这意味着：**任何 `modes != 0` 的 `adjtimex` 调用都是特权操作**，非特权进程调用必然失败。这给了采集端一个非常干净的过滤条件——**只对 `modes != 0` 的 `adjtimex` 事件告警**。

另外注意 `ADJ_OFFSET` 的钳位：内核文档说 “Since Linux 2.6.26, the supplied value is clamped to the range (-0.5s, +0.5s)”。也就是说单次 `ADJ_OFFSET` 最多只能挪 0.5 秒，**想挪动几小时必须走 `clock_settime` 或 `ADJ_SETOFFSET`**。这个细节能帮我们判断“这是一次大幅阶跃，还是 NTP 的正常微调”。

**Go 落地思路**

在 eBPF 侧挂 `sys_enter_adjtimex` / `sys_enter_clock_adjtime` / `sys_enter_settimeofday` / `sys_enter_clock_settime` 四个 tracepoint，**只在 `modes != 0`（`adjtimex`）时上报**，并附上调用者的 pid、uid、exe 路径、以及 `/proc/<pid>/status` 里的 `CapEff`。判定“是否持有 `CAP_SYS_TIME`”比判定“是不是 root”更准确——很多服务会以非 root 用户运行但单独授予 `CAP_SYS_TIME`。

---

### Q4：`adjtimex(2)` 到底是什么？为什么说它是“不用 root 也能拿到高价值信号”的宝藏接口？

**简洁答案**

`adjtimex(2)` 是 Linux 的 Mills 时钟调整算法（RFC 5905）的内核 API。它做两件事：

1. **读**：传入 `modes = 0`，返回当前内核的时钟调整参数与状态。
2. **写**：用 `modes` 位掩码指定要设置哪些字段（`ADJ_OFFSET`、`ADJ_FREQUENCY`、`ADJ_STATUS`、`ADJ_TIMECONST`、`ADJ_SETOFFSET`、`ADJ_TAI`…）。

读操作**不需要任何特权**，所以 EDR Agent 可以用极低的权限持续采样内核时钟状态机。

**关键知识点**

从 `struct timex` 里能拿到这些高价值字段：

- `status` 位图。可写位包括 `STA_PLL`(0x0001)、`STA_PPSFREQ`(0x0002)、`STA_PPSTIME`(0x0004)、`STA_FLL`(0x0008)、`STA_INS`(0x0010)、`STA_DEL`(0x0020)、**`STA_UNSYNC`(0x0040)**、`STA_FREQHOLD`(0x0080)；只读位包括 `STA_PPSSIGNAL`、`STA_PPSJITTER`、`STA_PPSWANDER`、`STA_PPSERROR`、`STA_CLOCKERR`(0x1000)、`STA_NANO`(0x2000)、`STA_MODE`、`STA_CLK`。手册明确 “Attempts to set read-only status bits are silently ignored”。
- `maxerror` / `esterror`：最大误差与估计误差，单位微秒。
- `tai`：TAI-UTC 偏移秒数。
- `offset` / `freq`：当前待消化的相位偏移与频率偏移。
- `tick`：时钟中断频率（Hz）。

返回值是**时钟状态**（不是 0/-1）：`TIME_OK`(0)、`TIME_INS`(1)、`TIME_DEL`(2)、`TIME_OOP`(3)、`TIME_WAIT`(4)、`TIME_ERROR`(5)。按手册，`TIME_ERROR` 在 `STA_UNSYNC` 或 `STA_CLOCKERR` 置位时返回。

最关键的一条：**`STA_UNSYNC` 是可写位**。攻击者可以主动把它置上，让内核认为“这台机器没有可信同步源”。而内核源码 `kernel/time/ntp.c` 里：

```c
static inline bool ntp_synced(void)
{
	return !(tk_ntp_data[TIMEKEEPER_CORE].time_status & STA_UNSYNC);
}
```

这个 `ntp_synced()` 是 `sync_hw_clock()` 的前置条件——**`STA_UNSYNC` 一旦置位，内核就不再把系统时钟同步回 RTC**（同步周期约 11 分钟）。于是系统时钟和 RTC 的偏差会随时间持续放大，这正好给了我们一个**事后可验证的旁证**。

**Go 落地思路**

Go 的 `syscall` 包在 Linux 上直接提供了 `syscall.Adjtimex(buf *Timex) (state int, err error)`，不需要引入 `golang.org/x/sys`。代码块 3 是完整实现。

**注意一个坑**：Go 的 `syscall` 包**没有导出 `CLOCK_*` 常量**（`syscall.CLOCK_REALTIME` 直接编译不过，报 `undefined: syscall.CLOCK_REALTIME`）。要么自己定义常量，要么走裸系统调用。

---

### Q5：怎么在运行时判断“墙钟被阶跃改过”？为什么单看 `CLOCK_REALTIME` 不行？

**简洁答案**

**核心方法：联合采样墙钟与单调钟，比较两者走时的差值。**

因为 `CLOCK_MONOTONIC` 不受墙钟阶跃影响，所以两次采样之间：

```text
Skew = (墙钟走过的时长) − (单调钟走过的时长)
```

- NTP 的频率微调是斜坡，Skew 是 ppm 量级（毫秒级）。
- 有人 `clock_settime` 改时间，Skew 会瞬间等于跳变幅度（小时级）。

**单看 `CLOCK_REALTIME` 不行的原因**：你没有一个可信的“上一时刻是多少”作为参照。墙钟的绝对值本身没有任何自证能力——它可能昨天就被改过了，只是你不知道。

**关键知识点**

Go 里有一个非常容易踩的坑。`time.Now()` 返回的 `time.Time` **同时带有墙钟读数和单调钟读数**，文档原话：

> The Time returned by time.Now contains a monotonic clock reading.
> If Times t and u both contain monotonic clock readings, the operations t.After(u), t.Before(u), t.Equal(u), t.Compare(u), and t.Sub(u) are carried out using the monotonic clock readings alone, ignoring the wall clock readings.

也就是说，如果你在两个采样点各拿一个 `time.Now()` 直接做 `Sub`，**Go 会走单调钟，恰好把墙钟跳变吃掉**，你会看到 `Skew == 0`，永远检测不到任何篡改。

解法是文档给出的标准姿势：**`t = t.Round(0)`**（“The canonical way to strip a monotonic clock reading is to use t = t.Round(0)”）。丢掉单调读数之后，`Sub` 才会回落到墙钟。

顺带记住哪些操作会**丢掉**单调读数（文档明列）：`AddDate`、`Round`、`Truncate`、`In`、`Local`、`UTC`。哪些操作会**使用**单调读数：`Sub`、`Before`、`After`、`Equal`、`Compare`。

**Go 落地思路**

代码块 1 是完整实现。核心只有两行，但把上面所有坑都踩了一遍：

```go
now := time.Now()
sample := ClockSample{
    Wall: now.Round(0),      // 丢掉单调读数，才能看出墙钟被跳变
    Mono: now.Sub(anchor),   // anchor 自带单调读数，所以这行走单调钟
}
```

完整实现（代码块 1，`clockwatch/clock.go`）：

```go
package clockwatch

import "time"

// anchor 只在进程启动时取一次，作为单调钟零点。
// 它自带单调钟读数，所以 now.Sub(anchor) 走单调钟，不受墙钟跳变影响。
var anchor = time.Now()

// ClockSample 是系统时钟的一次联合采样。
type ClockSample struct {
	// Wall 是墙钟读数（CLOCK_REALTIME），可被 clock_settime/settimeofday 改写。
	Wall time.Time
	// Mono 是单调钟读数（CLOCK_MONOTONIC），不可被改写。
	Mono time.Duration
}

// ReadSample 采样一次系统时钟。
//
// 坑点：time.Now() 返回的 Time 同时带墙钟读数和单调钟读数，
// 两个这样的 Time 做 Sub 会走单调钟，恰好把墙钟跳变"吃掉"。
// 所以墙钟这一路必须用 Round(0) 显式丢弃单调钟读数。
func ReadSample() ClockSample {
	now := time.Now()
	return ClockSample{
		Wall: now.Round(0),
		Mono: now.Sub(anchor),
	}
}

// Divergence 描述两次采样之间墙钟与单调钟的走时差。
type Divergence struct {
	WallDelta time.Duration
	MonoDelta time.Duration
	// Skew = WallDelta - MonoDelta，正常应当接近 0。
	Skew time.Duration
	// Suspect 表示墙钟出现了阶跃。
	Suspect bool
}

// Assess 比较两次采样，判断墙钟是否被阶跃改动。
//
// 正常情况下 NTP 的频率调整是"斜坡"，两个采样间隔内的 Skew 是 ppm 量级；
// 有人调用 clock_settime/settimeofday 时，Skew 会瞬间等于跳变幅度。
func Assess(prev, cur ClockSample, threshold time.Duration) Divergence {
	wall := cur.Wall.Sub(prev.Wall)
	mono := cur.Mono - prev.Mono
	skew := wall - mono
	return Divergence{
		WallDelta: wall,
		MonoDelta: mono,
		Skew:      skew,
		Suspect:   skew > threshold || skew < -threshold,
	}
}
```

---

### Q6：怎么把“NTP 正常校时”和“攻击者改时间”区分开？

**简洁答案**

五个维度联合判别，**单一维度都不可靠**：

| 维度 | 正常校时 | 攻击者改时间 |
| --- | --- | --- |
| 幅度 | 频率微调是 ppm 级；chrony 的 step 阈值默认约 128 ms | 通常是小时/天级 |
| 形态 | 斜坡（slew）为主，`ADJ_OFFSET` 单次还被钳在 ±0.5 s | 阶跃（`clock_settime` / `ADJ_SETOFFSET`） |
| 发起者 | `chronyd` / `systemd-timesyncd` / `ntpd`，通常持有 `CAP_SYS_TIME` | 任意持有 `CAP_SYS_TIME` 的进程 |
| 伴随状态 | `STA_UNSYNC` 通常不置位，NTP 服务在跑 | 可能主动置 `STA_UNSYNC`；NTP 服务被停掉 |
| 时序 | 与 NTP 报文到达时间相关 | 与攻击者动作相关，通常发生在入侵之后 |

**关键知识点**

`adjtimex` 的 `freq` 字段是频率偏移，单位是 ppm 量级。NTP 稳态下这个值在几十 ppm 上下，“秒/天”的量级变化就说明系统时钟在被持续拖动。

另一个非常好用的判别式：**`ADJ_OFFSET` 单次最多挪 0.5 秒**（内核 2.6.26 起的钳位）。所以如果一次事件让墙钟挪了几小时，那它一定不是 `ADJ_OFFSET`，只可能是 `clock_settime` 或 `ADJ_SETOFFSET`。

还有第三条：内核的 `__ntp_clear()` 会 `ntpdata->time_status |= STA_UNSYNC`，`time_maxerror` 超过 `NTP_PHASE_LIMIT` 也会置上 `STA_UNSYNC`。也就是说 **`STA_UNSYNC` 置位本身不一定是攻击**——NTP 长时间同步不上也会置位。它的价值在于：**被攻击者主动置位时，可以用来切断内核对 RTC 的同步**。

**Go 落地思路**

判定函数做成“输入已采集的事实 → 输出分级结论”，入参可注入，便于单测。降噪顺序：

1. **先归因**：调用者是 `chronyd` / `systemd-timesyncd` / `ntpd` 吗？是 → 直接降级为“信息”。
2. **再判形态**：是 `ADJ_OFFSET`（斜坡）还是 `ADJ_SETOFFSET`/`clock_settime`（阶跃）？
3. **再判幅度**：阶跃幅度是否超过阈值（比如 5 分钟）？
4. **再看上下文**：主机上是否刚发生过入侵相关告警？

---

### Q7：`CLOCK_BOOTTIME` 和 `CLOCK_MONOTONIC` 的差值有什么用？

**简洁答案**

`CLOCK_BOOTTIME − CLOCK_MONOTONIC` = **自开机以来的累计挂起（suspend）时间**。

因为 `CLOCK_MONOTONIC` “does not count time that the system is suspended”，而 `CLOCK_BOOTTIME` 计入。

**关键知识点**

这带来一个非常实用的检测方向：**休眠规避（suspend evasion）**。

沙箱/EDR 的典型超时逻辑是“进程存活超过 N 分钟就判定逃逸”。攻击者如果能让机器反复进入 suspend 状态，`CLOCK_MONOTONIC` 停走而 `CLOCK_BOOTTIME` 继续走，**基于 `CLOCK_MONOTONIC` 的超时永远不会触发**。这是一个比“改时钟”更隐蔽的免杀手法，因为它根本不需要 `CAP_SYS_TIME`——只需要能触发 suspend（`echo mem > /sys/power/state` 或 `systemctl suspend`，通常需要 root 或已配置的策略）。

另外一个用途是**跨重启的对齐**：`CLOCK_BOOTTIME` 覆盖休眠，`CLOCK_MONOTONIC` 不覆盖。判断“某次事件发生在上次开机之前还是之后”时，需要 `CLOCK_BOOTTIME`。

**Go 落地思路**

Go 的 `syscall` 包没有 `CLOCK_BOOTTIME` 常量，需要自己定义（值是 7，来自 `uapi/linux/time.h`）并走裸 `clock_gettime` 系统调用，代码块 3 里有。

采样时同时记录 `BOOTTIME − MONOTONIC` 的值。如果这个值在 Agent 运行期间出现**阶跃式增长**（而不是随着正常运行缓慢累积），说明发生了 suspend/resume 事件，应在时间线上打标记。

---

### Q8：时间命名空间（CLONE_NEWTIME）是什么？为什么它不能伪造文件时间戳？

**简洁答案**

时间命名空间是 Linux 5.6 引入的命名空间类型，通过 `unshare(CLONE_NEWTIME)` 创建。**它只虚拟化 `CLOCK_MONOTONIC` 和 `CLOCK_BOOTTIME`，明确不虚拟化 `CLOCK_REALTIME`。**

man page 原文：

> Note that time namespaces do not virtualize the CLOCK_REALTIME clock. Virtualization of this clock was avoided for reasons of complexity and overhead within the kernel.

**关键知识点**

时间命名空间的偏移量通过 `/proc/<pid>/timens_offsets` 暴露，每行三列 `<clock-id> <offset-secs> <offset-nanosecs>`，`clock-id` 取 `monotonic`(1) 或 `boottime`(7)。偏移相对初始时间命名空间。

几条硬约束：

- 偏移只能在**命名空间还没有成员进程**时写入；一旦有进程进入，写操作返回 `EACCES`。
- 写入需要**拥有该时间命名空间的那个 user namespace 里的 `CAP_SYS_TIME`**。
- `offset-nanosecs` 必须 ≤ 999999999；`offset-secs` 不能让命名空间内的时钟变成负数，也不能超过 `KTIME_SEC_MAX` 的一半（约 146 年）。
- 受影响的不只是 `clock_gettime`，还包括 `clock_nanosleep`、`nanosleep`、`timer_settime`、`timerfd_settime` 和 `/proc/uptime`。

所以这个机制的**能力边界**很清楚：

| 攻击目标 | 时间命名空间能做到吗 |
| --- | --- |
| 欺骗基于 monotonic/boottime 的沙箱超时 | **能** |
| 欺骗 `sleep`/`timer` 的实际等待时长 | **能**（内核层面时间被偏移） |
| 伪造文件 mtime/ctime | **不能** |
| 伪造 `CLOCK_REALTIME`（日志时间戳、证书校验） | **不能** |
| 跨进程影响宿主机 | **不能**（只在命名空间内可见） |

**Go 落地思路**

这给了一条**高价值、低误报**的检测规则：

1. 采集宿主机的 `/proc/self/timens_offsets`。**初始时间命名空间里这两个偏移必须都是 0**（man page 给出的参考输出就是 `monotonic 0 0` / `boottime 0 0`）。如果 Agent 跑在初始命名空间里却读到非 0 偏移，说明 Agent 自己被塞进了时间命名空间——这本身就很可疑。
2. 更重要的是枚举**其他进程**的 `/proc/<pid>/ns/time` 链接，统计有多少进程位于**非初始时间命名空间**。因为 `/proc/<pid>/ns/time` 的 inode 号相同就属于同一个命名空间，把 inode 号聚合成集合，就能算出“有几个时间命名空间、各自有多少成员”。
3. 非初始时间命名空间里的进程，运行在容器/sandbox 里是正常的——所以这条规则要**和容器识别结果做交叉**：不在已知容器里、却带非零时间偏移的进程，才值得告警。

代码块 2 是 `timens_offsets` 的解析实现。

```go
package clockwatch

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// TimensOffsets 是时间命名空间的时钟偏移量。
type TimensOffsets struct {
	Monotonic time.Duration
	BootTime  time.Duration
}

// ParseTimensOffsets 解析 /proc/<pid>/timens_offsets。
//
// 文件格式是每行三列：<clock-id> <offset-secs> <offset-nanosecs>，
// clock-id 为 monotonic(1) 或 boottime(7)，偏移量相对初始时间命名空间。
func ParseTimensOffsets(data []byte) (TimensOffsets, error) {
	var out TimensOffsets
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		fields := strings.Fields(line)
		if len(fields) != 3 {
			return out, fmt.Errorf("timens_offsets 行格式错误: %q", line)
		}
		secs, err := strconv.ParseInt(fields[1], 10, 64)
		if err != nil {
			return out, fmt.Errorf("偏移秒数解析失败: %w", err)
		}
		nsecs, err := strconv.ParseInt(fields[2], 10, 64)
		if err != nil {
			return out, fmt.Errorf("偏移纳秒数解析失败: %w", err)
		}
		if nsecs < 0 || nsecs > 999999999 {
			return out, fmt.Errorf("偏移纳秒数越界: %d", nsecs)
		}
		d := time.Duration(secs)*time.Second + time.Duration(nsecs)
		switch fields[0] {
		case "monotonic", "1":
			out.Monotonic = d
		case "boottime", "7":
			out.BootTime = d
		default:
			return out, fmt.Errorf("未知的 clock-id: %q", fields[0])
		}
	}
	return out, nil
}
```

---

### Q9：改完时间，主机上会留下哪些痕迹？

**简洁答案**

至少六类，而且大部分是**可以事后验证、不依赖内存留存的**：

1. **文件时间戳**。改完时间后新建的文件，mtime/ctime 会带上错误时间。表现为：mtime 在未来（比可信时钟快）、mtime 远早于 ctime（内容时间被回拨）。
2. **`/proc/stat` 的 `btime`**。内核实现是 `getboottime64()`，即 `ktime_sub(tk->offs_real, tk->offs_boot)`，也就是 **`CLOCK_REALTIME − CLOCK_BOOTTIME`**。墙钟一阶跃，`btime` 立刻跟着变——**但机器并没有重启过**。这是一个零成本的对照项。
3. **RTC 与系统时钟的偏差**。内核约每 11 分钟把系统时钟同步回 RTC（`sync_hw_clock()`），且 `STA_UNSYNC` 置位时会停止同步。所以 `/sys/class/rtc/rtc0/since_epoch`（或 `/proc/driver/rtc`）与 `CLOCK_REALTIME` 的偏差超过十几分钟，就说明系统时钟被改过且没被重新同步。
4. **`adjtimex` 状态残留**。`STA_UNSYNC` 被置上、`maxerror`/`esterror` 异常增大、返回值为 `TIME_ERROR`。
5. **日志时间线乱序**。`systemd-journald`、`rsyslog`、`auditd` 的时间戳出现倒序或大段空洞。
6. **进程启动时间的单调基准**。`/proc/<pid>/stat` 第 22 字段 `starttime` 的内核实现是 `nsec_to_clock_t(timens_add_boottime_ns(task->start_boottime))`，处于 **boottime 域**，**不受墙钟阶跃影响**。所以它是一个可靠的对照锚点。

**关键知识点**

第 2 条和第 6 条合起来构成本文最实用的一招：

> **`/proc/<pid>/stat` 的 `starttime` 在单调域，`/proc/stat` 的 `btime` 在墙钟域。**

对任意进程，`starttime` 与 `btime` 之间不存在简单的常数关系，但可以这样用：Agent 记录下“Agent 启动瞬间的 `btime`”和“Agent 启动瞬间的 monotonic 读数”，此后任何时刻都能算出“墙钟相对于基准偏移了多少”。这个偏移量单调累积，不受进程重启影响，也不需要任何特权。

第 3 条要小心一个陷阱：**内核大约每 11 分钟才同步一次 RTC**，所以正常的 RTC 偏差就有十几分钟。阈值必须设在 15 分钟以上，否则会误报。而且 `persistent_clock_is_local` 时内核还会做时区补偿，不能直接比。

**Go 落地思路**

文件时间戳检查用 `syscall.Stat`（不是 `os.Stat`）——`os.FileInfo` 只有 `ModTime()`，拿不到 `ctime`。代码块 4 是实现。

代码块 4，`clockwatch/filetimes_linux.go`：

```go
//go:build linux

package clockwatch

import (
	"fmt"
	"syscall"
	"time"
)

// FileTimeFlags 描述文件时间戳的可疑点。
type FileTimeFlags struct {
	FutureMtime bool
	FutureCtime bool
	// MtimeRewound 表示 mtime 明显早于 ctime：文件内容时间被回拨。
	MtimeRewound bool
}

// InspectFileTimes 检查文件时间戳是否与可信墙钟矛盾。
func InspectFileTimes(path string, trustedNow time.Time, futureTolerance time.Duration) (FileTimeFlags, error) {
	var st syscall.Stat_t
	if err := syscall.Stat(path, &st); err != nil {
		return FileTimeFlags{}, fmt.Errorf("stat %s: %w", path, err)
	}
	mtime := time.Unix(st.Mtim.Sec, st.Mtim.Nsec)
	ctime := time.Unix(st.Ctim.Sec, st.Ctim.Nsec)
	var flags FileTimeFlags
	if mtime.After(trustedNow.Add(futureTolerance)) {
		flags.FutureMtime = true
	}
	if ctime.After(trustedNow.Add(futureTolerance)) {
		flags.FutureCtime = true
	}
	if ctime.Sub(mtime) > time.Hour {
		flags.MtimeRewound = true
	}
	return flags, nil
}
```

---

### Q10：`/etc/localtime` 被替换算不算攻击？

**简洁答案**

**改 `/etc/localtime` 不会改变内核时钟**，它只改变“进程按哪个时区解释时间”。所以严格来说它不是时钟篡改，但**它是一个极具迷惑性的时间线污染手段**，必须单独检测。

**关键知识点**

`/etc/localtime` 通常是一个符号链接，指向 `/usr/share/zoneinfo/` 下的某个文件。攻击者把它换成一个自己构造的时区文件（比如 UTC+13），所有使用 `localtime` 的程序（`date`、`ls -l`、`journalctl` 的默认输出、Go 的 `time.Local`）显示的时间都会整体偏移几个小时。

这带来两个 nasty 的后果：

- 人工看日志时，时间戳和别的机器对不上，极难发现。
- **Go 程序的 `time.Local` 会被影响**。Go 在初始化 `time.Local` 时会读取 `/etc/localtime`（或 `TZ` 环境变量）。所以同一台机器上，Agent 报的“事件时间”和客户 `date` 看到的“事件时间”可能差 13 小时。

注意区分三种情况：

| 现象 | 性质 |
| --- | --- |
| `/etc/localtime` 是指向 `zoneinfo` 的正常符号链接 | 正常 |
| `/etc/localtime` 是指向 `zoneinfo` 的符号链接，但指向了罕见时区 | 可疑但可能是运维设置 |
| `/etc/localtime` 是**普通文件**（不是符号链接），且内容不是合法的 tzfile | **伪造时区文件，高危** |
| `TZ` 环境变量被注入到某个进程 | 可疑 |

tzfile 的格式有明确规范（magic 字符串 `TZif`、版本号、时区偏移字段），可以校验文件头和偏移量范围。

**Go 落地思路**

Go 里 `time.Local` 是进程级全局，加载时机是第一次使用时惰性初始化。Agent 应当：

- 在启动时**记录一次** `time.Local` 的实际偏移量（`time.Now().In(time.Local).Zone()`）并上报，和 `/etc/localtime` 的解析结果交叉校验。
- 所有对外上报的事件时间戳**统一用 UTC**（`t.UTC()`），绝不用本地时区。理由不是“规范”，而是本机时区本身可能就是被篡改的。

---

### Q11：Go 里怎么读 `adjtimex` 状态？为什么 `syscall.CLOCK_REALTIME` 编译不过？

**简洁答案**

Go 的 `syscall` 包在 Linux 上直接提供了：

```go
func Adjtimex(buf *Timex) (state int, err error)
```

以及配套的 `syscall.Timex` 结构体，字段与内核 `struct timex` 一一对应（Go 用显式 padding 字段保证布局对齐）。

`syscall.CLOCK_REALTIME` **不存在**——Go 的 `syscall` 包没有导出任何 `CLOCK_*` 常量，编译会直接报 `undefined: syscall.CLOCK_REALTIME`。需要时钟 ID 时有两条路：

1. 自己定义常量（`CLOCK_REALTIME`=0、`CLOCK_MONOTONIC`=1、`CLOCK_BOOTTIME`=7、`CLOCK_TAI`=11，来自 `uapi/linux/time.h`）。
2. 走裸系统调用 `syscall.Syscall(syscall.SYS_CLOCK_GETTIME, clockID, uintptr(unsafe.Pointer(&ts)), 0)`。

**关键知识点**

`syscall.Adjtimex` 的返回值语义和 C 版一致：成功时返回**时钟状态**（`TIME_OK`=0 … `TIME_ERROR`=5），失败时返回 `-1` 并置 `errno`。Go 的封装已经把 errno 转成了 `error`，所以直接判 `err != nil` 即可。

还有一个细节：`struct timex` 里 `time` 字段的 `tv_usec` 在 `STA_NANO` 置位时表示**纳秒**，否则表示**微秒**。解析时必须按 `STA_NANO`（0x2000）决定单位，否则时间戳会差 1000 倍。

**Go 落地思路**

代码块 3 是完整的 Linux 实现。注意三点：

- 状态位常量直接抄 `uapi/linux/timex.h`，不要手打。
- `time.Unix()` 返回本地时区时间，上报前统一 `.UTC()`。
- 这个文件要带 `//go:build linux`，因为 `syscall.Adjtimex` 和裸时钟调用只在 Linux 上存在。

代码块 3，`clockwatch/kernel_linux.go`：

```go
//go:build linux

package clockwatch

import (
	"fmt"
	"syscall"
	"time"
	"unsafe"
)

// 内核 uapi/linux/timex.h 里的状态位与时钟状态常量。
const (
	staPLL      = 0x0001
	staPPSFreq  = 0x0002
	staPPSTime  = 0x0004
	staFLL      = 0x0008
	staINS      = 0x0010
	staDEL      = 0x0020
	staUNSYNC   = 0x0040
	staFreqHold = 0x0080
	staClockErr = 0x1000
	staNano     = 0x2000
)

// adjtimex 的返回状态，取值同 uapi/linux/timex.h 的 TIME_*。
const (
	timeOK    = 0
	timeIns   = 1
	timeDel   = 2
	timeOOP   = 3
	timeWait  = 4
	timeError = 5
)

// CLOCK_BOOTTIME，取值来自 uapi/linux/time.h。
const clockBootTime = 7

// ClockState 是内核 NTP 时钟状态机的可观测快照。
type ClockState struct {
	Unsynced  bool
	ClockErr  bool
	LeapIns   bool
	LeapDel   bool
	MaxError  int64 // 微秒
	EstError  int64 // 微秒
	TAIOffset int32 // TAI-UTC 秒
	State     int   // adjtimex 返回值
	Wall      time.Time
}

// ReadClockState 读取时钟状态。
//
// adjtimex 的 modes=0 是纯读操作，普通用户也能调用，
// 所以这个接口是"无需提权就能拿到高价值信号"的典型。
func ReadClockState() (ClockState, error) {
	var tx syscall.Timex
	state, err := syscall.Adjtimex(&tx)
	if err != nil {
		return ClockState{}, fmt.Errorf("adjtimex: %w", err)
	}
	status := uint32(tx.Status)
	return ClockState{
		Unsynced:  status&staUNSYNC != 0,
		ClockErr:  status&staClockErr != 0,
		LeapIns:   status&staINS != 0,
		LeapDel:   status&staDEL != 0,
		MaxError:  tx.Maxerror,
		EstError:  tx.Esterror,
		TAIOffset: tx.Tai,
		State:     state,
		Wall:      time.Unix(tx.Time.Sec, int64(tx.Time.Usec)*1000),
	}, nil
}

// ReadBootTime 读取开机钟（CLOCK_BOOTTIME）。
//
// Go 的 syscall 包没有导出 CLOCK_* 常量，这里直接走裸系统调用。
func ReadBootTime() (time.Duration, error) {
	var ts syscall.Timespec
	_, _, errno := syscall.Syscall(syscall.SYS_CLOCK_GETTIME, clockBootTime, uintptr(unsafe.Pointer(&ts)), 0)
	if errno != 0 {
		return 0, fmt.Errorf("clock_gettime(CLOCK_BOOTTIME): %w", errno)
	}
	return time.Duration(ts.Sec)*time.Second + time.Duration(ts.Nsec), nil
}
```

---

### Q12：这条检测怎么落地成一条可用的规则？误报怎么治，时间线怎么呈现？

**简洁答案**

采集、判定、呈现三层分开，判定层必须是纯函数。

**采集层**（周期性 + 事件驱动）：

- 周期采样（建议 5～30 秒）：`CLOCK_REALTIME`、`CLOCK_MONOTONIC`、`CLOCK_BOOTTIME` 三元组、`adjtimex` 状态、`/proc/stat` 的 `btime`、RTC 的 `since_epoch`。
- 事件驱动：eBPF/auditd 挂 `settimeofday`、`clock_settime`、`adjtimex`、`clock_adjtime` 四个系统调用。
- 一次性：启动时记录 `/proc/self/timens_offsets`、`/etc/localtime` 的类型与目标。

**判定层**（纯函数，输入是已解析好的数据）：

| 判定 | 条件 | 级别 |
| --- | --- | --- |
| 墙钟阶跃 | `\|Skew\| > 阈值` 且采样间隔足够 | 高 |
| 频率被拖动 | `\|freq\|` 持续超过 ppm 阈值 | 中 |
| 同步被切断 | `STA_UNSYNC` 置位且 NTP 服务不在运行 | 中 |
| RTC 脱节 | `\|RTC − REALTIME\| > 15 min` | 中 |
| 时间命名空间偏移 | 非初始命名空间中非零偏移，且进程不在已知容器内 | 高 |
| 时区文件伪造 | `/etc/localtime` 是普通文件且不符合 tzfile 规范 | 高 |
| 文件时间戳异常 | mtime/ctime 在未来，或 mtime 远早于 ctime | 中（单条）/ 高（批量） |

**呈现层**：这是这条规则和普通规则最大的不同。

因为墙钟不可信，**告警时间线不能直接按事件自身的墙钟时间戳排序**。正确做法是：

1. Agent 给每个事件打一个**单调域锚点**（Agent 自己的 monotonic 读数，或 `/proc/<pid>/stat` 的 `starttime` 换算到 boottime 域）。
2. 用单调锚点排序，用墙钟时间戳只做**展示**。
3. 在时间线上显式标注“不连续点”：每次检测到墙钟阶跃，就在那个位置插一个标记事件，说明“此后的墙钟时间戳需要重新解读”。
4. 上报时同时带上三组时间：事件墙钟时间、Agent 单调锚点、以及“相对本机基准的墙钟偏移量”，让服务端能在必要时重建正确时间线。

**误报治理清单**（这是这类规则能不能上线的关键）：

- **NTP 阶跃**：chrony 的 `makestep` 默认阈值约 128 ms，但有的发行版配了更大的阈值，甚至配了 `maxslew`。→ 用调用者身份归因。
- **虚拟机快照恢复 / 宿主机时钟同步**：虚拟机恢复后墙钟会跳。→ 结合是否有快照恢复事件、是否是虚拟化环境。
- **运维手动改时**：客户经常干这事。→ 提供白名单 + 工单关联，而不是无脑告警。
- **休眠/唤醒**：`CLOCK_BOOTTIME` 跳变但 `CLOCK_REALTIME` 不跳。→ 明确区分，不要误报成墙钟篡改。
- **容器时间命名空间**：容器里的进程带偏移是正常的。→ 先做容器识别再判定。
- **首次纳管**：Agent 刚装上时的第一个采样没有基线。→ 第一轮只记录基线，不判定。

---

## Go 落地思路小结

整条链路在 Go 侧拆成四层，每层都可以独立单测：

| 层 | 职责 | 关键实现 |
| --- | --- | --- |
| 采样层 | 联合采样墙钟/单调钟/开机钟、读 `adjtimex`、读 `timens_offsets` | 纯 I/O，失败一律转 `unknown` |
| 解析层 | `timens_offsets`、`/proc/stat`、`/etc/localtime` → 结构化数据 | 纯函数，字节输入 |
| 判定层 | 双读发散、阶跃判定、三态结论、归因降级 | 纯函数，入参可注入、可配置 |
| 呈现层 | 单调锚点排序、不连续点标注、双时间戳上报 | 与判定层解耦 |

代码块对应关系：

- 代码块 1 → `clockwatch/clock.go`：联合采样与阶跃判定（跨平台纯逻辑）。
- 代码块 2 → `clockwatch/timens.go`：`timens_offsets` 解析（跨平台纯逻辑）。
- 代码块 3 → `clockwatch/kernel_linux.go`：`adjtimex` 状态与 `CLOCK_BOOTTIME`（Linux only）。
- 代码块 4 → `clockwatch/filetimes_linux.go`：文件时间戳异常（Linux only）。

四条工程纪律：

1. **所有超时逻辑用单调钟，所有上报时间戳用 UTC 墙钟。** 两者混用是这个领域的头号 bug 源。
2. **墙钟那一路必须 `Round(0)` 剥掉单调读数。** 忘了这一步，你的检测逻辑会永远返回“没有跳变”。
3. **判定逻辑不碰 I/O。** 所有判定函数入参是已解析好的数据，这样单测能覆盖真实边界（正常校时、阶跃、回拨、阈值边界、解析失败）。
4. **结论永远是三态。** `tampered` / `clean` / `unknown`。`unknown`（比如 `adjtimex` 因为权限或 seccomp 失败）必须单独统计上报，它是采集健康度指标，而不是“干净”。

---

## 小练习 / 复盘题

1. 列出 Linux 上你能用到的全局时钟，说明各自的纪元定义。`CLOCK_TAI` 的纪元为什么比 `CLOCK_REALTIME` 早 10 秒？
2. 攻击者调用 `clock_settime(CLOCK_REALTIME)` 把时间往前调 3 小时。哪些东西会跟着变？哪些不会？（至少各说 3 个。）
3. 为什么 `CLOCK_MONOTONIC` 被称为“单调”？在什么情况下它会停止推进？
4. `CLOCK_BOOTTIME − CLOCK_MONOTONIC` 是什么？它能用来发现什么攻击手法？这个攻击需要什么权限？
5. `adjtimex(2)` 的 `modes` 字段为 0 时会做什么？普通用户调用 `adjtimex` 时，`modes` 允许取哪些值？违规时的 errno 是什么？
6. `ADJ_OFFSET` 单次能挪动多长时间？这是从哪个内核版本开始生效的？为什么这个细节对检测有价值？
7. `ADJ_OFFSET`（斜坡）和 `ADJ_SETOFFSET` / `clock_settime`（阶跃）在 `adjtimex` 的哪个字段上体现区别？内核分别怎么消费它们？
8. `STA_UNSYNC` 的数值是多少？它是可写位还是只读位？把它置上之后，内核对 RTC 的同步策略会怎么变？为什么这能给攻击者带来好处？
9. `adjtimex` 的返回值有哪几个？`TIME_ERROR` 在什么条件下返回？
10. 为什么“单看 `CLOCK_REALTIME` 的绝对值”无法发现时钟被改过？请给出你认为最省事的一条对照量。
11. Go 的 `time.Now()` 返回的 `Time` 同时带两种读数。如果你在两个采样点各拿一个 `time.Now()` 直接 `Sub`，得到的是什么？怎样才能算出墙钟的跳变量？
12. Go 里哪些方法会丢掉单调读数？哪些方法在两个 `Time` 都带单调读数时会用单调读数？`t.Round(0)` 的作用是什么？
13. `syscall.CLOCK_REALTIME` 为什么编译不过？你要拿到 `CLOCK_BOOTTIME` 该怎么办？
14. 时间命名空间虚拟化了哪两个时钟？为什么它不能用来伪造文件 mtime？
15. `/proc/<pid>/timens_offsets` 的格式是什么？在什么条件下写入会返回 `EACCES`？写它需要什么能力？
16. `unshare(CLONE_NEWTIME)` 之后，子进程通过 `clock_nanosleep` 睡 10 秒，实际会睡多久？为什么这能骗过沙箱超时？
17. `/proc/<pid>/stat` 的第 22 字段 `starttime` 的内核实现是什么？为什么它可以用来做不受墙钟影响的时间线锚点？
18. `/proc/stat` 里的 `btime` 在内核里是怎么算出来的？机器没重启但 `btime` 变了，说明发生了什么？
19. 为什么内核大约每 11 分钟才同步一次 RTC？这对“用 RTC 偏差做判据”的阈值设计有什么影响？
20. 客户把 `/etc/localtime` 换成了自己构造的时区文件。这会影响内核时钟吗？会影响 Go 程序里 `time.Local` 吗？该怎么检测？
21. 写一段 Go 代码，联合采样 `CLOCK_REALTIME` 和 `CLOCK_MONOTONIC`，输出两次采样之间的跳变量。要求：**必须能观测到墙钟阶跃**，并为此写至少 3 个单测（正常阶跃、回拨、阈值以内）。
22. 写一段 Go 代码解析 `/proc/<pid>/timens_offsets`，要求支持符号名（`monotonic`/`boottime`）和数字 ID（1/7）两种写法，纳秒越界和字段数不对时必须返回错误。至少写 3 个边界用例。
23. 设计一条规则：“检测非容器进程使用非初始时间命名空间”。给出你的数据来源（要能拿到 namespace inode）、判定条件，以及如何降噪。
24. 某台机器上 `CLOCK_REALTIME` 每 10 分钟跳一次，每次跳 2 秒，但调用者是 `chronyd`。你的双读发散检测会怎么表现？该怎么处理才不会天天告警？
25. 你要给一条“检测墙钟被篡改”的规则写降噪方案。请至少列出 5 个真实的误报来源，并说明每一种的区分手段。

---

## 参考资料

1. [Linux man-pages：clock_gettime(2)](https://man7.org/linux/man-pages/man2/clock_gettime.2.html) —— `CLOCK_REALTIME` 可写、`CLOCK_MONOTONIC` 不受阶跃影响但受频率调整影响、`CLOCK_BOOTTIME` 含休眠时间、`CLOCK_TAI` 纪元早 10 秒
2. [Linux man-pages：adjtimex(2)](https://man7.org/linux/man-pages/man2/adjtimex.2.html) —— `modes` 位掩码、`ADJ_*` 语义、`ADJ_OFFSET` 的 ±0.5 s 钳位、`ADJ_SETOFFSET`、`STA_*` 可写/只读位划分、`TIME_*` 返回值、`EPERM` 与 `CAP_SYS_TIME`
3. [Linux man-pages：time_namespaces(7)](https://man7.org/linux/man-pages/man7/time_namespaces.7.html) —— 只虚拟化 `CLOCK_MONOTONIC`/`CLOCK_BOOTTIME`、明确不虚拟化 `CLOCK_REALTIME`、`/proc/pid/timens_offsets` 格式与写限制、受影响的 API 列表
4. [Linux man-pages：rtc(4)](https://man7.org/linux/man-pages/man4/rtc.4.html) —— RTC 与系统时钟的区别、`/dev/rtc0` 的打开限制、`RTC_SET_TIME` 需 `CAP_SYS_TIME`
5. [Linux man-pages：settimeofday(2)](https://man7.org/linux/man-pages/man2/settimeofday.2.html) —— 老接口与 `clock_settime` 的关系
6. [内核源码：`include/uapi/linux/timex.h`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/include/uapi/linux/timex.h) —— `ADJ_*` / `STA_*` / `TIME_*` 的确切数值（`STA_UNSYNC`=0x0040、`STA_NANO`=0x2000、`TIME_ERROR`=5）
7. [内核源码：`include/uapi/linux/time.h`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/include/uapi/linux/time.h) —— `CLOCK_REALTIME`=0、`CLOCK_MONOTONIC`=1、`CLOCK_BOOTTIME`=7、`CLOCK_TAI`=11
8. [内核源码：`kernel/time/ntp.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/kernel/time/ntp.c) —— `ntp_synced()` 与 `STA_UNSYNC` 的关系、`sync_hw_clock()` 约 11 分钟同步一次 RTC 且在未同步时跳过、`__ntp_clear()` 置位 `STA_UNSYNC`
9. [内核源码：`kernel/time/timekeeping.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/kernel/time/timekeeping.c) —— `offs_real`（monotonic→realtime 偏移）与 `offs_boot`（monotonic→boottime 偏移）、`getboottime64()` 的实现
10. [内核源码：`fs/proc/stat.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/fs/proc/stat.c) —— `/proc/stat` 的 `btime` 取自 `getboottime64()` 并减去时间命名空间偏移
11. [内核源码：`fs/proc/array.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/fs/proc/array.c) —— `/proc/<pid>/stat` 第 22 字段 `starttime` = `nsec_to_clock_t(timens_add_boottime_ns(task->start_boottime))`
12. [Go 源码：`src/time/time.go`](https://github.com/golang/go/blob/go1.27.3/src/time/time.go) —— `time.Now()` 带单调读数、`Round(0)` 是剥离单调读数的标准做法、`Sub`/`Before`/`After` 的单调读数语义、序列化时丢弃单调读数
13. [Go 源码：`src/syscall/zsyscall_linux_amd64.go`](https://github.com/golang/go/blob/go1.27.3/src/syscall/zsyscall_linux_amd64.go) —— `syscall.Adjtimex` 的 Linux 实现与返回值语义
14. [同站文章：Go 主机安全面试：Linux 日志清理与审计痕迹破坏检测](go-hids-linux-log-tamper-detection.md) —— 攻击者对“痕迹”的系统性清理
15. [同站文章：Go 主机安全面试：Linux 动态链接器路径劫持与 ld.so.cache 投毒检测](go-hids-linux-ld-so-cache-poisoning-detection.md) —— `LD_PRELOAD` / `faketime` 这类“在用户态伪造时间”的相邻手法
