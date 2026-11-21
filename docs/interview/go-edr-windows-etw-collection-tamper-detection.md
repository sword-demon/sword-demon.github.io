---
title: Go 主机安全面试：Windows ETW 采集链路与 ETW 篡改降级检测
date: 2026-11-21 09:20:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- windows
- etw
---

# Go 主机安全面试：Windows ETW 采集链路与 ETW 篡改降级检测

## 岗位场景

你是云铠主机安全产品的 Go 研发，负责 Windows 侧的主机行为采集。客户和同事问得最多的不是"ETW 是什么"，而是这几类更扎心的问题：

- "客户说机器上明明跑了 `powershell.exe`，你们的 EDR 一点进程创建事件都没有，是不是漏报了？"
- "同一个 Windows 版本，为什么在客户机上采集不到，在研发本机就能采到？"
- "研发用 `logman query -ets` 看，ETW 会话明明在跑，Agent 侧的进程事件却断断续续。"
- "客户机上有别的安全软件，我们的进程创建是不是被它抢走了？"
- "听说有人能直接把 EDR 的 ETW 关掉，我们怎么发现？"
- "客户说 Agent 装上以后机器变慢了，能不能把 ETW 的开销压下去？"

这六类问题指向同一个技术面：**ETW 这条采集链路本身既是最好的数据源，也是最容易被掐断的采集面**。

很多主机安全产品把 ETW 当成一个"只读数据源"——provider 写事件，Agent 读事件，读到就检测，读不到就沉默。但 ETW 的会话、provider 的启用状态、实时消费的缓冲配额，全部是**可写、可抢占、可被外部进程改变**的面。别人只要动一下"采不采"，你的 EDR 就会安静地退化成瞎子；而"安静"恰恰是客户最难发现、事后最难追责的状态。

这一篇把这条链路拆开讲清楚：ETW 的 Controller / Provider / Consumer 三角色怎么分工、session 是什么、level 与 keyword 怎么过滤、8 个 session 的配额意味着什么、别人怎么关掉你的采集、Go 里怎么消费实时事件（以及 cgo 那个绕不开的坑）、Go 侧怎么做三态健康度判定、以及"客户说没告警"这条经典问题的标准排查路径。

---

## 背景速览：ETW 的四个面

判断"ETW 采集能力有没有被削弱"，得先知道这条链路由哪几块拼出来。

| 面 | 载体 | 谁会写 | 被动了会怎样 |
| --- | --- | --- | --- |
| 会话（Session） | ETW session（缓冲区池、文件模式、过滤器） | Controller（你的 Agent / 别的工具） | 决定"采到的事件放在哪、留多久" |
| Provider 启用状态 | 某个 provider 是否被某个 session 启用 | 任意有权限的 Controller | 决定"采什么"，改完不留明显痕迹 |
| 实时消费 | `OpenTrace` + `ProcessTrace` 回调链路 | Agent 进程 | 决定"我们能不能看到"，慢了就丢 |
| 事件本体 | `EVENT_RECORD` / `EVENT_HEADER` / 用户数据 | 内核与各 provider | 决定"证据长什么样" |

四条必须先记住的硬规则，全部有 Microsoft Learn 或 Windows SDK 头文件背书：

1. **ETW 是 Controller / Provider / Consumer 三角色模型**。Learn 的原文：Controllers "start and stop event tracing sessions and enable providers"，Providers "provide the events"，Consumers "consume the events"。
2. **provider 有新旧两套启用语义**。老式 MOF / WPP provider（`RegisterTraceGuids`）**只能被一个 session 启用**，第二个 session 启用同一个 legacy provider 时，"the first session would stop receiving events"；现代 manifest / TraceLogging provider（`EventRegister`）**最多可以被 8 个 session 同时启用**。
3. **provider 的启用是"按 session"的，进程退出不会自动回收**。Learn 原文："A provider remains enabled for the session until the session disables the provider. If the application that started the session ends without disabling the provider, the provider remains enabled."
4. **ETW session 是有限的系统资源**。`StartTraceW` 文档在注意事项里直接写："Cross-process event tracing sessions are a limited system resource. Developers should avoid starting event tracing sessions on customer machines"，并建议尽量用 in-process-only 的私有 logger（`EVENT_TRACE_PRIVATE_LOGGER_MODE | EVENT_TRACE_PRIVATE_IN_PROC`），以及"如果你的组件的会话已经存在，应该清理孤儿会话，而不是再开一个第二个会话"。

还有一个最容易踩的坑：**session 名冲突返回 `ERROR_ALREADY_EXISTS`，很多人误以为是"冲突了就算了"，结果直接新开一个 session**——这会同时踩中上面第 2 条和第 4 条：多开 session、白占内存、挤占 provider 配额，最后自己把自己的采集挤没了。

---

## 高频面试题

### Q1：Windows 上采集进程创建、文件落地、网络连接，为什么用 ETW 而不是 WMI 或事件日志？

**简洁答案**：三者不是同一类东西。事件日志是"归档 + 审计"（事后再查，默认有大小与时间窗，事件量大了会被覆盖）；WMI 是"查当前状态"（`Win32_Process` 这类查询），拿来做事件订阅不可靠、延迟大、还容易因为 WMI 仓库压力丢事件；ETW 是"内核级事件流"，provider 在事件发生的瞬间把事件推给 session，consumer 实时消费，还能按 level / keyword / scope 在源头过滤。**要"不漏的实时行为流"，Windows 上只有 ETW 这条路。**

**关键知识点**：

- Learn 原文：ETW 是 "an efficient kernel-level tracing facility"，"lets you enable or disable event tracing dynamically"，不需要重启进程或系统。
- ETW 的过滤发生在 provider 侧：`EnableTraceEx2` 传下去的 level 与 keyword 掩码，provider 自己判断要不要写这个事件，"In most providers, events that are disabled by level or keyword have almost no impact on system performance"。这就是"精准开关键字 = 低开销"的底层原因。
- 事件日志仍然要采（很多合规场景要它），但不要指望它做实时检测。

**Go 落地思路**：进程创建 / 镜像加载 / 网络连接走 ETW；文件落地用 `ReadDirectoryChangesW` 或 `USN Journal`；注册表、计划任务这类低频面用事件日志或直接轮询。不要用一个采集器包打天下。

### Q2：`EnableTraceEx2` 的 level、MatchAnyKeyword、MatchAllKeyword 分别怎么理解？传 0 会怎样？

**简洁答案**：level 是"严重度上限"，Microsoft 定义 1=Critical、2=Error、3=Warning、4=Information、5=Verbose，**Level=N 会收所有 level ≤ N 的事件**；`MatchAnyKeyword` 是 64 位位掩码，事件的 keyword 与它**有交集**就收；`MatchAllKeyword` 要求事件 keyword **包含全部置位**才算命中。

**关键知识点**：

- Learn 原文："The provider typically writes an event if its keyword bits match any of the bits set in this value or if the event has no keyword bits set"。
- **关键字为 0 的事件会绕过掩码直接写入**，除非显式设置 `EVENT_ENABLE_PROPERTY_IGNORE_KEYWORD_0`（Learn 原文："If an event's keyword is zero, the provider will write the event to the session regardless of the MatchAnyKeyword and MatchAllKeyword masks"）。这类"无关键字事件"是典型的噪声与误报来源。
- `MatchAnyKeyword = 0` 对**现代 provider** 等价于"全开"（等价 `0xFFFFFFFFFFFFFFFF`），但对 **legacy provider** 必须传 `0xFFFFFFFF` 才等价全开。
- 想知道某个 provider 支持哪些 level / keyword，官方给的命令是 `logman query providers <provider>` 或 `wevtutil gp <provider>`（Learn 原文直接给了这两条命令）。

**Go 落地思路**：把关键字集合做成配置项（而不是写死在代码里），`Keywords(...)` 按位或成掩码，规则热更新时重建 `EnableSpec` 并重新下发；过滤逻辑在 Go 侧再兜一层 `HasKeyword`，避免 provider 侧行为与预期不一致时漏事件。

```go
package etwdetect

import (
	"encoding/hex"
	"fmt"
	"strings"
)

// GUID 与 Windows GUID 布局一致（Data1/2/3/4 共 16 字节）。
type GUID struct {
	Data1 uint32
	Data2 uint16
	Data3 uint16
	Data4 [8]byte
}

// ParseGUID 解析 "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 形式的小写/大写 GUID。
func ParseGUID(s string) (GUID, error) {
	raw := strings.ReplaceAll(strings.TrimSpace(s), "-", "")
	if len(raw) != 32 {
		return GUID{}, fmt.Errorf("invalid guid %q", s)
	}
	b, err := hex.DecodeString(raw)
	if err != nil {
		return GUID{}, fmt.Errorf("invalid guid %q: %w", s, err)
	}
	var g GUID
	g.Data1 = uint32(b[0])<<24 | uint32(b[1])<<16 | uint32(b[2])<<8 | uint32(b[3])
	g.Data2 = uint16(b[4])<<8 | uint16(b[5])
	g.Data3 = uint16(b[6])<<8 | uint16(b[7])
	copy(g.Data4[:], b[8:16])
	return g, nil
}

func (g GUID) String() string {
	var b [16]byte
	b[0] = byte(g.Data1 >> 24)
	b[1] = byte(g.Data1 >> 16)
	b[2] = byte(g.Data1 >> 8)
	b[3] = byte(g.Data1)
	b[4] = byte(g.Data2 >> 8)
	b[5] = byte(g.Data2)
	b[6] = byte(g.Data3 >> 8)
	b[7] = byte(g.Data3)
	copy(b[8:], g.Data4[:])
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

// EnableSpec 是一次 EnableTraceEx2 调用的参数集合。
type EnableSpec struct {
	Provider    GUID
	ControlCode uint32
	Level       uint8
	MatchAny    uint64
	MatchAll    uint64
}

// Keywords 把多个关键字按位或成一个 MatchAnyKeyword 掩码。
func Keywords(keywords ...uint64) uint64 {
	var mask uint64
	for _, k := range keywords {
		mask |= k
	}
	return mask
}

// HasKeyword 判断事件是否命中指定的任一关键字。
func HasKeyword(eventKeyword, matchAny uint64) bool {
	if eventKeyword == 0 {
		// 关键字为 0 的事件默认无视掩码，除非设置 EVENT_ENABLE_PROPERTY_IGNORE_KEYWORD_0。
		return true
	}
	return eventKeyword&matchAny != 0
}
```

### Q3：什么叫 ETW session？起 session 有什么资源代价？配额在哪里？

**简洁答案**：session 就是一个 ETW 采集上下文：它决定缓冲区池大小、内存还是文件、实时还是落盘、过滤规则、以及"这次采集是谁在消费"。代价有三块：**系统 session 数量有限**、**每个 session 的缓冲区池吃内存**、**同一个 modern provider 最多只能被 8 个 session 同时启用**。

**关键知识点**：

- Learn 原文："Up to eight trace sessions can enable and receive events from the same modern (manifest-based or TraceLogging) provider. However, only one trace session can enable a legacy (MOF, TMF-based WPP) provider."
- 超过配额时 `EnableTraceEx2` 返回 `ERROR_NO_SYSTEM_RESOURCES`（1450），Learn 的错误码说明里写得很直白："Exceeded the number of trace sessions that can enable the provider"。
- `EVENT_TRACE_PROPERTIES.BufferSize` 的语义是**单个缓冲区的 KB 数**：最小 4、最大 16384（Windows 8 之前最大 1024）。Learn 特别强调 "ETW does not fragment events across buffer boundaries"，而且 "ETW cannot collect events larger than 64KB"。
- 内存占用靠 `MinimumBuffers` / `MaximumBuffers` 控制，不是靠 `BufferSize`。Learn 的 Tip 写得很清楚："Do not use BufferSize to control the trace session's memory usage."

**Go 落地思路**：会话配置模板化（`BufferSize=64KB`、`MinimumBuffers` 按 CPU 数给下限、`MaximumBuffers` 给上限、`FlushTimer` 设秒级），启动时先 `StartTrace`，返回 `ERROR_ALREADY_EXISTS`（183）说明已有同名会话 → 改为 **接管/复用**（`ControlTrace` 查询属性）而不是再开一个；退出时必须 `ControlTrace(Stop)` 并 `EnableTraceEx2(DISABLE_PROVIDER)`，否则 provider 会一直处于启用状态。

### Q4：在 Go 里消费 ETW 实时事件，最大的坑是什么？

**简洁答案**：`ProcessTrace` 是阻塞调用，回调在 ETW 的**原生线程**上执行，而 Go 的 `syscall` 包**不能把 Go 指针交给 C**、也不能在 C 回调里随便调 Go 函数。结论是：**要么用 cgo 写一层薄 shim，要么放弃实时消费**（改用文件模式 + 离线解析）。

**关键知识点**：

- `OpenTraceW` 填充 `EVENT_TRACE_LOGFILE`，`ProcessTrace` 拉事件；Learn 建议 "Specify this mode if you want to receive events in the new EVENT_RECORD format (strongly recommended)"，即 `PROCESS_TRACE_MODE_EVENT_RECORD`。
- `EVENT_TRACE_LOGFILE` 里有 `EventRecordCallback`、`BufferCallback`、`EventsLost`、`IsKernelTrace` 等字段；`ProcessTrace` 每处理完一个 buffer 会回调 `BufferCallback`，可以在那里读 `EventsLost` 做丢事件统计。
- 实时消费有权限门槛：只有管理员、`Performance Log Users` 组、以及以 LocalSystem / LocalService / NetworkService 运行的服务才能实时消费（Learn 在 `OpenTraceW` 与 `EnableTraceEx2` 两处都写了这条）。
- `ProcessTrace` 会阻塞调用线程直到 `CloseTrace`，所以 Go 里必须 `runtime.LockOSThread()`，并且不能占用太多线程。

**Go 落地思路**：把 Win32 绑定隔离在 `//go:build windows` 的文件里；cgo shim 只做"把 `EVENT_RECORD` 拷进一块 C 内存 → 交给 Go 侧 channel"，Go 侧再解析；**核心逻辑（解析、判定、掩码）写成纯 Go 并单测**，这样 CI 在 Linux 上也能跑回归。文件模式（`EVENT_TRACE_LOGFILE.LogFileName` 指向 `.etl`）是最佳回归手段：不需要实时权限，用脱敏后的 `.etl` 当 fixture 跑断言。

### Q5：`EVENT_RECORD` 里哪些字段能做进程归因、去重和跨主机关联？

**简洁答案**：能用的是 `EventHeader` 里的 `ProcessId`、`ThreadId`、`TimeStamp`、`ProviderId`、`EventDescriptor`（Id / Level / Opcode / Task / Keyword）和 `ActivityId`；**`ProcessStartKey` 要通过 `EnableProperty` 请求**，以扩展数据形式出现。

**关键知识点**：

- `EVENT_RECORD` 的布局是 `EVENT_HEADER` + `ETW_BUFFER_CONTEXT` + `ExtendedDataCount` + `UserDataLength` + `ExtendedData` + `UserData` + `UserContext`（Learn 的 `EVENT_RECORD` 文档与 `evntcons.h` 一致）。
- Learn 原文：扩展数据"includes some items, such as the security identifier (SID) of the user that logged the event, **only if** the controller sets the EnableProperty parameter"，但 TraceLogging 的解码信息与 related activity id 是**总是附带**的。
- `UserData` 是**二进制 blob**，没有 metadata 就是一堆无意义的字节——Learn 的 Event Metadata Overview 原话："Without the event metadata, the event payload is meaningless and unintelligible."。解码要用 TDH（`TdhGetEventProperty` / `TdhFormatProperty`），`tdh.dll` 不在标准库里，需要自己绑定。
- **`EventDescriptor.Id` 只是 provider 内部的事件号**，跨版本、跨 provider 不保证稳定；跨主机关联要用 `ActivityId`（相关活动 ID）或 `ProcessStartKey`，**不要用 PID**（PID 会复用）。

**Go 落地思路**：Go 侧先解析固定头（自己按偏移读，避免依赖 C 结构体的指针语义），把 `UserData` 指针字段按"相对缓冲区偏移"约定处理；业务字段交给 TDH 或 provider manifest 解码；进程身份统一收敛成 `EntityID`，把 PID 换成 `ProcessStartKey`/exe 哈希，避免 PID 复用导致的误归因。

```go
package etwdetect

import (
	"encoding/binary"
	"fmt"
	"time"
	"unsafe"
)

// EventInfo 是从 EVENT_RECORD 里取出的、与业务无关的通用元数据。
type EventInfo struct {
	ProviderGUID      GUID
	EventID           uint16
	Version           uint8
	Channel           uint8
	Level             uint8
	Opcode            uint8
	Task              uint16
	Keyword           uint64
	ProcessID         uint32
	ThreadID          uint32
	TimeStamp         time.Time
	ActivityID        GUID
	UserDataOffset    uint64
	UserDataLength    uint16
	ExtendedDataCount uint16
}

// ParseEventRecord 解析 EVENT_RECORD 字节流。
// 约定：EventRecord.UserData 字段存放的是相对 buf 起点的偏移（C 里是绝对指针）。
func ParseEventRecord(buf []byte) (EventInfo, error) {
	if len(buf) < int(unsafe.Sizeof(EventRecord{})) {
		return EventInfo{}, fmt.Errorf("event record too short: %d", len(buf))
	}
	le := binary.LittleEndian
	hdr := EventHeader{
		Size:          le.Uint16(buf[0:2]),
		HeaderType:    le.Uint16(buf[2:4]),
		Flags:         le.Uint16(buf[4:6]),
		EventProperty: le.Uint16(buf[6:8]),
		ThreadId:      le.Uint32(buf[8:12]),
		ProcessId:     le.Uint32(buf[12:16]),
		TimeStamp:     int64(le.Uint64(buf[16:24])),
	}
	copy(hdr.ProviderId.Data4[:], buf[32:40])
	hdr.ProviderId.Data1 = le.Uint32(buf[24:28])
	hdr.ProviderId.Data2 = le.Uint16(buf[28:30])
	hdr.ProviderId.Data3 = le.Uint16(buf[30:32])
	hdr.EventDescriptor.Id = le.Uint16(buf[40:42])
	hdr.EventDescriptor.Version = buf[42]
	hdr.EventDescriptor.Channel = buf[43]
	hdr.EventDescriptor.Level = buf[44]
	hdr.EventDescriptor.Opcode = buf[45]
	hdr.EventDescriptor.Task = le.Uint16(buf[46:48])
	hdr.EventDescriptor.Keyword = le.Uint64(buf[48:56])
	copy(hdr.ActivityId.Data4[:], buf[72:80])
	hdr.ActivityId.Data1 = le.Uint32(buf[64:68])
	hdr.ActivityId.Data2 = le.Uint16(buf[68:70])
	hdr.ActivityId.Data3 = le.Uint16(buf[70:72])

	rec := EventRecord{}
	userDataOffset := unsafe.Offsetof(rec.UserData)
	userDataLengthOffset := unsafe.Offsetof(rec.UserDataLength)
	extCountOffset := unsafe.Offsetof(rec.ExtendedDataCount)

	return EventInfo{
		ProviderGUID:      hdr.ProviderId,
		EventID:           hdr.EventDescriptor.Id,
		Version:           hdr.EventDescriptor.Version,
		Channel:           hdr.EventDescriptor.Channel,
		Level:             hdr.EventDescriptor.Level,
		Opcode:            hdr.EventDescriptor.Opcode,
		Task:              hdr.EventDescriptor.Task,
		Keyword:           hdr.EventDescriptor.Keyword,
		ProcessID:         hdr.ProcessId,
		ThreadID:          hdr.ThreadId,
		TimeStamp:         filetimeToTime(hdr.TimeStamp),
		ActivityID:        hdr.ActivityId,
		UserDataOffset:    le.Uint64(buf[userDataOffset : userDataOffset+8]),
		UserDataLength:    le.Uint16(buf[userDataLengthOffset : userDataLengthOffset+2]),
		ExtendedDataCount: le.Uint16(buf[extCountOffset : extCountOffset+2]),
	}, nil
}

// filetimeToTime 把 FILETIME（1601-01-01 起的 100ns 计数）转成 time.Time。
func filetimeToTime(ft int64) time.Time {
	const unixEpochDelta = 11644473600
	return time.Unix(ft/1e7-unixEpochDelta, (ft%1e7)*100).UTC()
}
```

### Q6：攻击者 / 别的软件，怎么让你的 ETW 采集失效？

**简洁答案**：至少有六条路径，而且**没有一条会留下"明显"的痕迹**：

| 手法 | 效果 | 官方依据 |
| --- | --- | --- |
| 对你的 session 调 `EnableTraceEx2(DISABLE_PROVIDER)` | 该 provider 对你的会话停止投递 | `EVENT_CONTROL_CODE_DISABLE_PROVIDER` |
| 对你的 session 调 `ControlTrace(Stop)` | 你的会话被删，Agent 变哑巴 | `EVENT_TRACE_CONTROL_STOP` |
| 占满 provider 的 8 个 session 配额 | 你再启用时返回 `ERROR_NO_SYSTEM_RESOURCES` | "Up to eight trace sessions can enable…" |
| 启用同一个 **legacy** provider | **你的会话直接收不到该 provider 的事件** | "the first session would stop receiving events" |
| hook 用户态 ETW 写入路径（如 `ntdll!EtwEventWrite`） | 事件被静默丢弃 | 用户态可见 |
| 改 ETW 相关注册表 / 自动记录器（auto-logger）项 | 开机即生效的持久化削弱 | `HKLM\SYSTEM\CurrentControlSet\Control\Wdi\Autologger`（需在目标机核验） |

**关键知识点**：注意第 3、4 条**不需要管理员之外的任何提权**——一个有相应权限的普通进程就能让另一个会话"哑掉"。这就是为什么 EDR 不能假设"我在采集 ⇒ 一定采到"。

**Go 落地思路**：把"我的采集是否还活着"当成一个**一等公民的运行时指标**，而不是"启动时检查一次就完事"。做法是周期性探针 + 事件流连续性校验（见 Q7）。

### Q7：怎么检测 provider 被禁用、会话被删、事件流被掐断？

**简洁答案**：靠**多个独立信号交叉验证**，并输出三态结论（healthy / degraded / unknown），而不是二值告警。信号有五个：会话存活性、重新使能的返回码、丢事件计数、provider 状态变更事件、事件流断流（配合本机进程活动基线）。

**关键知识点**：

- **会话存活性**：用 `ControlTrace(EVENT_TRACE_CONTROL_QUERY)` 查自己的会话，查不到（`ERROR_WMI_INSTANCE_NOT_FOUND` 之类）说明会话被删了。
- **重新使能返回码**：`EnableTraceEx2` 返回 `ERROR_NO_SYSTEM_RESOURCES` 说明配额被占；返回 `ERROR_ACCESS_DENIED` 说明权限被改（组策略/账号降权）。
- **丢事件计数**：`EVENT_TRACE_PROPERTIES` 里有 `EventsLost`（事件级）、`LogBuffersLost`、`RealTimeBuffersLost`（缓冲级）；`EVENT_TRACE_LOGFILE` 里也有 `EventsLost`。Learn 的 About Event Tracing 明确把 "the number of events and buffers lost" 列为会话统计的一部分。
- **provider 状态变更事件**：现代 provider 在自身通道上会发出 provider 注册 / 状态变更类事件，表示"有人改了我的启用状态"。**具体事件 ID 由 provider manifest 定义，不同 Windows 版本可能不同，必须在目标机用 `wevtutil gp <provider> /ge:true /gm:true` 或 `logman query providers <provider>` 核对，不要写死。**
- **断流判定必须结合"本机是否有活动"**：客户机器可能一整天没有进程创建，这时候"没有事件"是正常的。所以要拿"本机进程创建活动"做基线，没有活动就没有断流证据。

**Go 落地思路**：判定函数保持纯函数（输入是观测值，输出是结论 + 原因列表），便于单测与回归；**证据不足时必须返回 unknown 而不是 healthy**，这是安全产品最容易翻车的地方。

```go
package etwdetect

import (
	"fmt"
	"time"
)

// Verdict 是采集健康度的三态结论。
type Verdict string

const (
	VerdictHealthy  Verdict = "healthy"
	VerdictDegraded Verdict = "degraded"
	VerdictUnknown  Verdict = "unknown"
)

// Observation 是一次健康度评估的输入，全部来自本机可观测信号。
type Observation struct {
	SessionAlive        bool          // ControlTrace 查询自己的会话是否还在
	EnableErrno         uint32        // EnableTraceEx2 的返回码，0 表示成功
	EventsLost          uint32        // 会话累计丢事件数
	RealTimeBuffersLost uint32        // 实时消费缓冲区丢失数
	ProviderStateChange bool          // 收到 provider 状态变更类事件
	LastEventAt         time.Time     // 最近一条目标 provider 事件的时间
	MaxExpectedGap      time.Duration // 业务上可接受的静默时长
	ActivitySinceGap    int           // 静默期内本机是否有进程创建活动
}

// Assessment 是一次评估的结论。
type Assessment struct {
	Verdict Verdict
	Reasons []string
}

// Assess 判断 ETW 采集链路是否仍然可信。
// 关键原则：证据不足时返回 unknown，不要硬给"正常"。
func Assess(obs Observation, now time.Time) Assessment {
	var reasons []string
	degraded := false

	if !obs.SessionAlive {
		degraded = true
		reasons = append(reasons, "session_missing: 采集会话已不存在，可能被 StopTrace 或重启清除")
	}
	if obs.EnableErrno == ErrorNoSystemResource {
		degraded = true
		reasons = append(reasons, "provider_quota_exhausted: 启用 provider 返回 ERROR_NO_SYSTEM_RESOURCES")
	}
	if obs.EnableErrno == ErrorAccessDenied {
		degraded = true
		reasons = append(reasons, "enable_access_denied: 无权启用或实时消费 provider")
	}
	if obs.EventsLost > 0 {
		degraded = true
		reasons = append(reasons, fmt.Sprintf("events_lost: 累计丢事件 %d 条", obs.EventsLost))
	}
	if obs.RealTimeBuffersLost > 0 {
		degraded = true
		reasons = append(reasons, fmt.Sprintf("realtime_buffers_lost: 实时消费丢缓冲 %d 个", obs.RealTimeBuffersLost))
	}
	if obs.ProviderStateChange {
		degraded = true
		reasons = append(reasons, "provider_state_changed: provider 启用状态被外部修改")
	}

	gap := now.Sub(obs.LastEventAt)
	switch {
	case obs.LastEventAt.IsZero():
		reasons = append(reasons, "no_baseline: 尚未建立事件基线")
		return Assessment{Verdict: VerdictUnknown, Reasons: reasons}
	case obs.MaxExpectedGap > 0 && gap > obs.MaxExpectedGap && obs.ActivitySinceGap > 0:
		degraded = true
		reasons = append(reasons, fmt.Sprintf("stream_stalled: 静默 %s 期间仍有 %d 次进程活动", gap.Truncate(time.Second), obs.ActivitySinceGap))
	case obs.MaxExpectedGap > 0 && gap > obs.MaxExpectedGap:
		reasons = append(reasons, fmt.Sprintf("idle_host: 静默 %s 但无进程活动，无法区分空闲与被掐断", gap.Truncate(time.Second)))
		return Assessment{Verdict: VerdictUnknown, Reasons: reasons}
	}

	if degraded {
		return Assessment{Verdict: VerdictDegraded, Reasons: reasons}
	}
	return Assessment{Verdict: VerdictHealthy, Reasons: reasons}
}
```

### Q8：ETW 自己会丢事件吗？客户说"偶尔漏了几条进程创建"怎么解释？

**简洁答案**：会，而且是常态。ETW 的丢事件有三种：provider 侧根本没写（被 level / keyword 过滤掉）、运行时缓冲区丢（`EventsLost` / `LogBuffersLost`）、实时消费跟不上（`RealTimeBuffersLost`）。

**关键知识点**：

- 缓冲区不够时 ETW 会丢事件而不是阻塞 provider——这是 ETW 设计的取舍：宁可丢也不卡住被观测的系统。
- `BufferSize` 决定单缓冲区大小，**单个事件超过缓冲区就收不到**；Learn 明确 "ETW cannot collect events larger than 64KB"。
- 实时消费场景下，消费者处理速度跟不上 → `RealTimeBuffersLost` 增长；Learn 的 `EVENT_TRACE_LOGFILE` 就有 `EventsLost` 字段。
- `MinimumBuffers` 在没有 `EVENT_TRACE_NO_PER_PROCESSOR_BUFFERING` 时"至少每逻辑处理器 2 个"，这是 ETW 自己定的下限。

**Go 落地思路**：把 `EventsLost` / `RealTimeBuffersLost` 做**累计量 + 增量速率**两个指标上报；速率突然升高说明消费端变慢（解析阻塞、GC 抖动、channel 拥塞），要能定位到"是 ETW 丢的，还是我 Go 侧消费慢"。Go 侧最容易造成这个的是：回调里做重活（正则、文件 IO、RPC 序列化）——**回调只做拷贝，解析丢到工作队列**。

### Q9：怎么控制 ETW 采集对客户机器的性能影响？

**简洁答案**：四招，按收益排序：**关键字精准过滤**（provider 侧过滤，几乎零开销）→ **level 收敛**（只开到 Information，够用就别开 Verbose）→ **scope 过滤**（Windows 8.1+ 支持按 PID / 可执行文件名 / App ID 过滤）→ **缓冲区与 session 数量收敛**。

**关键知识点**：

- Learn 关于过滤的原话："events should primarily be filtered based scope filters or via control GUID, level, and keyword"，并且 "events that are disabled by level or keyword have almost no impact on system performance"。
- 采样类需求不要靠 ETW 全量 + 自己在 Go 侧丢弃，那是把成本全留在客户机器上。
- `StartTraceW` 的建议是"只在确实需要采集时才起 trace，用完立刻停"。

**Go 落地思路**：关键字集合 + level 做成**服务端下发的配置**，Agent 支持热更新（改配置 → 重新 `EnableTraceEx2` 更新 level/keyword，不需要重建 session）；上报采集开销指标（会话内存占用、缓冲区数、丢事件率）到云端，**让"性能问题"变成可量化的对话**。

### Q10：ETW 会和 Sysmon 或其他安全软件互相干扰吗？

**简洁答案**：**大部分情况不会，但有两个例外必须知道**。

**关键知识点**：

- 同一个 modern provider 可以被**最多 8 个 session** 同时启用，各收各的，互不干扰（这正是 Sysmon、Defender、你的 EDR 能共存的基础）。
- 但 **legacy provider 只能被一个 session 启用**：如果另一个工具启用了同一个 legacy provider，"the first session would stop receiving events"——**先启的那个输**。这是"装了某个安全软件后我们的事件就没了"的经典原因。
- 关键区别在于 provider 是现代（manifest / TraceLogging）还是老式（MOF / WPP）。`Microsoft-Windows-Kernel-Process` 属于现代 provider。
- 另外注意"provider 启用是 per-session 的"：你禁用自己会话里的 provider，不会影响别人的会话。

**Go 落地思路**：把"我们启用了哪些 provider、当前会话被谁挤占"做成资产清单上报；启动时用 `logman query -ets` 枚举现有会话，识别同机的其他安全产品会话，遇到 legacy provider 冲突时改用替代采集面（事件日志 / WMI / 内核旁路）而不是死磕。

### Q11：客户机器上 ETW 采集异常，你的标准排查路径是什么？

**简洁答案**：固定五步，从"最便宜、最可能"开始：

1. **会话在不在**：`logman query -ets`（列出所有 ETW 会话）；没有我们的会话 → Agent 启动失败或被 Stop 了。
2. **权限对不对**：实时消费与启用 provider 需要管理员或 `Performance Log Users`；服务账号被改组就采不到。
3. **provider 状态对不对**：`logman query providers <provider>` / `wevtutil gp <provider>` 看 level、keyword、是否被别的会话占用。
4. **是不是在丢**：`EventsLost` / `LogBuffersLost` / `RealTimeBuffersLost` 三个计数；结合 Go 侧消费速率。
5. **是不是被 hook 了**：用户态下校验 `ntdll!EtwEventWrite` 等关键代码段是否被 inline hook（字节比对 / 跳板检测），这是用户态唯一能自查的写入路径篡改。

**关键知识点**：ETW 的"隐式关闭"最容易被漏掉，因为它不报错——`StartTrace` 成功、`EnableTraceEx2` 成功、进程也起来了，就是没事件。所以排查必须**从"有没有事件"倒推**，而不是从"有没有报错"正推。

**Go 落地思路**：把这五步做成一个 `etwdoctor` 诊断子命令，输出**结构化 JSON**（会话列表、provider 状态、丢事件计数、权限、hook 检测结果），客服拿一段日志就能定位；这也是白盒 POC 里最省时间的一环。

### Q12：Go 侧怎么把 ETW 采集做成可测试、可回归的工程模块？

**简洁答案**：三层切分：**Win32 绑定层**（只有 Windows 编译，带 `//go:build windows`）、**纯 Go 核心层**（解析、掩码、健康度判定，全部可单测）、**数据源层**（接口化，实时实现 + `.etl` 回放实现）。

**关键知识点**：

- 标准库 `syscall` 没有 ETW 绑定；`golang.org/x/sys/windows` 也没有 ETW 会话管理 API（没有 `StartTrace` / `EnableTraceEx2` / `OpenTrace`），所以**必须自己用 `syscall.NewLazyDLL("advapi32.dll")` 绑定**（Windows SDK 头文件 `evntrace.h`）。
- **结构体镜像必须做偏移断言**：Go 的 `struct` 布局与 C 的对齐规则一致，但只要有一个字段类型写错，后面全部错位，而这种错误**不会编译报错**，只会在运行期表现为"读出来全是乱码"。最经典的坑是 `EVENT_TRACE_PROPERTIES.LoggerThreadId` 是 `HANDLE`，x64 下占 8 字节，写成 `uint32` 会让 `LogFileNameOffset` / `LoggerNameOffset` 全部偏移 4 字节。
- `.etl` 文件模式回放是**唯一能在 CI 里跑 ETW 回归**的办法：把脱敏后的 `.etl` 当 fixture，走同一套解析代码。

**Go 落地思路**：把"结构体偏移断言"写成单测放进 CI；把健康度判定写成纯函数单测（healthy / degraded / unknown 各若干分支）；把 Win32 调用收敛到一个很薄的适配层，业务代码不出现任何 `unsafe.Pointer`。

```go
package etwdetect

// WNODEHeader 镜像 WNODE_HEADER（evntrace.h），x64 下 48 字节。
type WNODEHeader struct {
	BufferSize        uint32
	ProviderId        uint32
	HistoricalContext uint64
	KernelHandle      uint64 // 与 TimeStamp 共用 union
	Guid              GUID
	ClientContext     uint32
	Flags             uint32
}

// EventTraceProperties 镜像 EVENT_TRACE_PROPERTIES（evntrace.h）。
// LoggerThreadId 是 HANDLE，x64 下占 8 字节，用 uint32 会让后面所有字段错位。
type EventTraceProperties struct {
	Wnode               WNODEHeader
	BufferSize          uint32
	MinimumBuffers      uint32
	MaximumBuffers      uint32
	MaximumFileSize     uint32
	LogFileMode         uint32
	FlushTimer          uint32
	EnableFlags         uint32
	AgeLimit            int32
	NumberOfBuffers     uint32
	FreeBuffers         uint32
	EventsLost          uint32
	BuffersWritten      uint32
	LogBuffersLost      uint32
	RealTimeBuffersLost uint32
	LoggerThreadId      uint64 // HANDLE
	LogFileNameOffset   uint32
	LoggerNameOffset    uint32
}

// EventDescriptor 镜像 EVENT_DESCRIPTOR（evntprov.h）。
type EventDescriptor struct {
	Id      uint16
	Version uint8
	Channel uint8
	Level   uint8
	Opcode  uint8
	Task    uint16
	Keyword uint64
}

// EventHeader 镜像 EVENT_HEADER（evntcons.h），x64 下 80 字节。
type EventHeader struct {
	Size            uint16
	HeaderType      uint16
	Flags           uint16
	EventProperty   uint16
	ThreadId        uint32
	ProcessId       uint32
	TimeStamp       int64
	ProviderId      GUID
	EventDescriptor EventDescriptor
	ProcessorTime   uint64
	ActivityId      GUID
}

// ETWBufferContext 镜像 ETW_BUFFER_CONTEXT。
type ETWBufferContext struct {
	ProcessorNumber uint8
	Alignment       uint8
	LoggerId        uint16
}

// EventRecord 镜像 EVENT_RECORD（evntcons.h）。
// UserData / ExtendedData 在 C 里是绝对指针，Go 侧按"相对缓冲区的偏移"约定解析。
type EventRecord struct {
	EventHeader       EventHeader
	BufferContext     ETWBufferContext
	ExtendedDataCount uint16
	UserDataLength    uint16
	ExtendedData      uint64
	UserData          uint64
	UserContext       uint64
}

// ETW 常用控制码（evntrace.h / evntcons.h）。
const (
	ControlTraceQuery = 0
	ControlTraceStop  = 1
	ControlTraceFlush = 3

	ControlCodeDisableProvider = 0
	ControlCodeEnableProvider  = 1
	ControlCodeCaptureState    = 2

	TraceLevelCritical    = 1
	TraceLevelError       = 2
	TraceLevelWarning     = 3
	TraceLevelInformation = 4
	TraceLevelVerbose     = 5

	LogFileModeNone       = 0x00000000
	LogFileModeSequential = 0x00000001
	LogFileModeCircular   = 0x00000002
	LogFileModeRealTime   = 0x00000100

	NoPerProcessorBuffering = 0x10000000

	ErrorAccessDenied     = 5
	ErrorInvalidParameter = 87
	ErrorAlreadyExists    = 183
	ErrorNoSystemResource = 1450
	ErrorTimeout          = 1460
	ErrorNotFound         = 1168
)
```

Win32 绑定层保持极薄，只做参数搬运：

```go
//go:build windows

package etwdetect

import (
	"syscall"
	"unsafe"
)

var (
	advapi32           = syscall.NewLazyDLL("advapi32.dll")
	procStartTraceW    = advapi32.NewProc("StartTraceW")
	procControlTraceW  = advapi32.NewProc("ControlTraceW")
	procEnableTraceEx2 = advapi32.NewProc("EnableTraceEx2")
)

// StartTrace 创建 ETW 采集会话，返回会话句柄与错误码。
func StartTrace(sessionName string, props *EventTraceProperties) (uint64, uint32) {
	name, err := syscall.UTF16PtrFromString(sessionName)
	if err != nil {
		return 0, ErrorInvalidParameter
	}
	var handle uint64
	ret, _, _ := procStartTraceW.Call(
		uintptr(unsafe.Pointer(&handle)),
		uintptr(unsafe.Pointer(name)),
		uintptr(unsafe.Pointer(props)),
	)
	return handle, uint32(ret)
}

// ControlTrace 查询（Query）、停止（Stop）或刷新（Flush）会话。
func ControlTrace(handle uint64, sessionName string, props *EventTraceProperties, code uint32) uint32 {
	var namePtr uintptr
	if sessionName != "" {
		name, err := syscall.UTF16PtrFromString(sessionName)
		if err != nil {
			return ErrorInvalidParameter
		}
		namePtr = uintptr(unsafe.Pointer(name))
	}
	ret, _, _ := procControlTraceW.Call(
		uintptr(handle),
		namePtr,
		uintptr(unsafe.Pointer(props)),
		uintptr(code),
	)
	return uint32(ret)
}

// EnableProvider 启用或禁用 provider；Timeout 传 0 表示异步配置，立即返回。
func EnableProvider(session uint64, provider GUID, controlCode uint32, level uint8, matchAny, matchAll uint64) uint32 {
	ret, _, _ := procEnableTraceEx2.Call(
		uintptr(session),
		uintptr(unsafe.Pointer(&provider)),
		uintptr(controlCode),
		uintptr(level),
		uintptr(matchAny),
		uintptr(matchAll),
		0,
		0,
	)
	return uint32(ret)
}
```

---

## 学习要点与知识点

| 主题 | 一句话结论 | 出处 |
| --- | --- | --- |
| 三角色模型 | Controller 起会话并启用 provider，Provider 写事件，Consumer 读事件 | Learn「About Event Tracing」 |
| provider 新旧之分 | MOF/WPP 只能被 1 个 session 启用；manifest/TraceLogging 最多 8 个 | Learn「About Event Tracing」/「EnableTraceEx2」 |
| level 语义 | Level=N 收 level ≤ N 的事件；1 最严重、5 最详细 | Learn「EnableTraceEx2」 |
| keyword 语义 | MatchAny 命中任一即收；keyword 为 0 的事件无视掩码 | Learn「EnableTraceEx2」 |
| provider 生命周期 | 进程退出不会自动禁用 provider，必须显式 DISABLE | Learn「EnableTraceEx2」 |
| 配额 | 超出可启用该 provider 的 session 数 → `ERROR_NO_SYSTEM_RESOURCES` | Learn「EnableTraceEx2」 |
| 实时消费权限 | 需管理员 / Performance Log Users / LocalSystem 等服务账号 | Learn「OpenTraceW」 |
| 缓冲区语义 | `BufferSize` 是单缓冲 KB 数（4~16384）；内存靠 Min/MaxBuffers | Learn「EVENT_TRACE_PROPERTIES」 |
| 事件大小上限 | ETW 不跨缓冲区切分事件，且收不到 >64KB 的事件 | Learn「EVENT_TRACE_PROPERTIES」 |
| 丢事件指标 | `EventsLost` / `LogBuffersLost` / `RealTimeBuffersLost` | Learn「EVENT_TRACE_PROPERTIES」/「EVENT_TRACE_LOGFILEW」 |
| 事件解码 | 用户数据是二进制 blob，必须配合 manifest + TDH | Learn「Event Metadata Overview」 |
| Go 侧现状 | 标准库与 `x/sys/windows` 都没有 ETW API，需自行 LazyDLL 绑定 | Windows SDK `evntrace.h` |

**Go 侧最容易翻车的三个点**（面试常追问）：

1. **结构体镜像不做偏移断言** → 字段错位，运行期才炸，且现象是"数据乱码"而不是"报错"。
2. **在 ETW 回调里做重活** → 消费跟不上 → `RealTimeBuffersLost` 上涨 → 客户投诉"漏事件"，而根因在 Go 侧。
3. **把"没有事件"当成"没有问题"** → 采集被掐断时系统静默，检测能力归零却没有告警。正确做法是三态判定 + 独立探针。

---

## 小练习与复盘题

1. `StartTraceW` 返回 `ERROR_ALREADY_EXISTS`（183）时，你的 Agent 应该怎么处理？为什么不能直接再开一个同名会话？
2. `EVENT_TRACE_PROPERTIES.BufferSize` 设为 4KB，客户机器上偶发"进程创建事件缺失"，可能的原因有哪些？和 `MinimumBuffers` 什么关系？
3. 为什么说"provider 保持启用直到 session 禁用"？Agent 异常退出（被 kill）会在系统上留下什么残留？
4. `MatchAnyKeyword = 0` 在现代 provider 和 legacy provider 上分别意味着什么？
5. 哪些事件会绕过你的 keyword 掩码直接进来？如何用 `EnableProperty` 关掉它们？
6. 同一个 modern provider 最多能被几个 session 同时启用？如果有别的安全软件先开了，你还能开吗？
7. legacy provider 的"独占"特性会造成什么现象？怎么在启动时提前发现？
8. 你的 Agent 和另一个 EDR 同时订阅同一个 provider，`RealTimeBuffersLost` 分别统计的是谁的丢失？会影响对方吗？
9. 为什么 `ProviderId` 的 GUID 与 keyword 值都必须以目标机为准，不能写死在代码里？用什么命令核对？
10. `EVENT_RECORD.UserData` 在 C 里是绝对指针，Go 侧改成"相对偏移"约定后，解析流程有什么变化？
11. 设计一个探针：每 60 秒确认"我的 session 还在、provider 还启用着"。你会调哪几个 API？分别看什么字段？
12. 客户机上有 4 小时没有进程创建事件。请列出至少三种可能，并说明需要哪些额外信号才能区分。
13. `EventsLost` 和 `RealTimeBuffersLost` 分别在什么阶段产生？Go 侧哪个更可能是自己的锅？
14. 如果你在 ETW 回调里直接做 RPC 上报，会有什么后果？该怎么改？
15. 为什么 `LoggerThreadId` 必须用 `uint64`（HANDLE）而不是 `uint32`？写个偏移断言单测来证明。
16. 客户要求"把 ETW 开销压到最低"，你会按什么顺序调整哪几个参数？
17. 用户态能检测 `ntdll!EtwEventWrite` 被 inline hook 吗？原理是什么？局限是什么？
18. 某 provider 的事件 ID 在客户机（Win10 LTSC）和研发机（Win11 23H2）上不一致，你的规则引擎应该怎么写才不会漏？
19. 用 `ActivityId` 和用 PID 做跨主机进程关联，各有什么风险？
20. 为什么说"ETW 采集健康度"本身应该是一条可观测指标，并给出三个建议上报的字段。

---

## 参考资料

- [About Event Tracing（ETW 官方概览）](https://learn.microsoft.com/en-us/windows/win32/etw/about-event-tracing)
- [EnableTraceEx2 function](https://learn.microsoft.com/en-us/windows/win32/api/evntrace/nf-evntrace-enabletraceex2)
- [StartTraceW function](https://learn.microsoft.com/en-us/windows/win32/api/evntrace/nf-evntrace-starttracew)
- [OpenTraceW function](https://learn.microsoft.com/en-us/windows/win32/api/evntrace/nf-evntrace-opentracew)
- [EVENT_TRACE_PROPERTIES structure](https://learn.microsoft.com/en-us/windows/win32/api/evntrace/ns-evntrace-event_trace_properties)
- [EVENT_TRACE_LOGFILEW structure](https://learn.microsoft.com/en-us/windows/win32/api/evntrace/ns-evntrace-event_trace_logfilew)
- [EVENT_RECORD structure](https://learn.microsoft.com/en-us/windows/win32/api/evntcons/ns-evntcons-event_record)
- [WNODE_HEADER structure](https://learn.microsoft.com/en-us/windows/win32/etw/wnode-header)
- [Event Metadata Overview（事件负载与元数据）](https://learn.microsoft.com/en-us/windows/win32/etw/event-metadata-overview)
- Windows SDK 头文件 `evntrace.h` / `evntcons.h` / `evntprov.h`（结构体布局与常量取值的基准）

> 需在目标主机核验的项：`Microsoft-Windows-Kernel-Process` 等 provider 的 GUID、关键字与事件 ID、provider 状态变更类事件的具体事件号、ETW 自动记录器（auto-logger）注册表路径，以及本机实际可用的 provider 列表（`wevtutil gp <provider>` / `logman query providers <provider>`）。
