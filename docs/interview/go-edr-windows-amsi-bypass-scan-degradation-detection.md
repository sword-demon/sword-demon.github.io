---
title: Go 主机安全面试：Windows AMSI 绕过与脚本扫描链降级检测
date: 2026-11-08 17:15:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- windows
- amsi
- powershell
---

# Go 主机安全面试：Windows AMSI 绕过与脚本扫描链降级检测

AMSI（Antimalware Scan Interface）是 Windows 提供给脚本宿主的一套“把内容交给杀毒引擎”的标准接口。PowerShell、VBScript、Office VBA 宏、UAC 提权等场景在执行前会把脚本文本交给 AMSI provider 扫描，命中恶意就直接拦截。

它的价值在于覆盖“无文件”攻击：脚本不落盘、纯内存执行，传统文件扫描看不见。但正因为它是用户态的、靠注册表配置 + DLL 加载 + 调用约定支撑的一条链，这条链本身就可以被削弱甚至切断。攻击者不需要破解算法，只要让扫描请求返回“干净”、让 provider 不再加载、或者干脆换一个更早的、不带 AMSI 的执行路径。

这类题考的不是“背几个绕过名词”，而是三件事：**AMSI 到底覆盖了什么、没覆盖什么**；**怎么区分“确实干净”和“根本没被扫描”**；**Go Agent 怎么在 Windows 上把注册表、DLL 完整性和事件日志这几类证据拼成可解释的结论**。

文中 AMSI 接口、结果枚举、组件集成范围以 Microsoft Learn 官方文档为准；检测策略参考 CISA Eviction Strategies Tool 的 CM0110 条目和 Microsoft Defender 官方集成说明，属于产品侧建议。

## 岗位场景

```text
攻击者通过 Web RCE / 钓鱼文档进入 Windows 主机
  -> 需要在内存里执行载荷，但发现 PowerShell 脚本会被 AMSI 拦截
  -> 尝试多条绕过路径：
     A) 改 HKCU\Software\Microsoft\Windows Script\Settings\AmsiEnable = 0
     B) 卸载 / 替换 AMSI provider 的注册表项
     C) 对 amsi.dll 的扫描函数做内存补丁
     D) 降级到不带 AMSI 的 PowerShell v2，或改用不经过 AMSI 的宿主
  -> 载荷执行，转向凭据窃取与横向移动
  -> Go Agent 需要回答四个问题：
     1) AMSI 当前是否还在生效（配置层）
     2) provider 是否仍是可信的那个（注册与签名层）
     3) amsi.dll 的代码有没有被改（运行时完整性层）
     4) 结论属于“扫描后判干净”还是“根本没扫描”（证据分级）
```

注意最后一条：这是整道题的分水岭。把“扫描返回 NOT_DETECTED”当成“没有恶意”，和把“provider 没加载”当成“扫描通过”，是两种完全不同的错误。

## 高频面试题

### 1. AMSI 到底是什么？它覆盖了哪些执行路径？

**简洁答案：** AMSI 是一套接口标准，让应用把“准备执行的文本内容”交给本机的反恶意软件产品去扫描，而不是各自实现一套检测逻辑。Windows 10 起它被集成进多个宿主：UAC（EXE、COM、MSI、ActiveX 安装的提权）、PowerShell（脚本、交互、动态代码求值）、Windows Script Host（`wscript.exe` / `cscript.exe`）、JavaScript 与 VBScript、Office VBA 宏。[1]

**关键知识点：**

- AMSI 与具体厂商无关，是“调用方 ↔ 反恶意软件 provider”的中间层。provider 是一个进程内 COM 服务器，注册在 `HKLM\SOFTWARE\Microsoft\AMSI\Providers\{CLSID}` 下，其 COM 类还要在 `HKLM\SOFTWARE\Classes\CLSID` 里注册。[2]
- provider DLL 自身要通过 Authenticode 签名检查。Windows 10 1903 起系统提供了签名检查开关：注册表 `HKLM\SOFTWARE\Microsoft\AMSI\FeatureBits` 的 DWORD 值 `0x1` 表示关闭签名检查（默认行为），`0x2` 表示开启。[3]
- 覆盖范围有明确边界，这是判断“绕过价值”的前提。Microsoft Defender 文档列出的受支持语言包括 PowerShell、Jscript、VBScript、Windows Script Host、.NET Framework 4.8 及更高（扫描所有程序集）、WMI；使用 Microsoft 365 Apps 时还支持 JavaScript、VBA、XLM。同页明确写着：**AMSI 目前不支持 Python 或 Perl**。[4]
- Defender 侧要真正用上 AMSI，前提是开启了脚本扫描（以及实时保护、行为监控）。这是排查“客户说 Defender 明明开着却没拦”的第一检查项。[4][5]

**Go 落地思路：** 把 AMSI 覆盖范围做成一张“宿主 → 是否在 AMSI 范围内”的表，作为规则前置条件。同一个可疑行为，发生在 PowerShell 里和在 Python 里，结论完全不能复用。

### 2. `AMSI_RESULT` 怎么解读？为什么不能只看“是不是 0”？

**简洁答案：** `AMSI_RESULT` 枚举定义在 `amsi.h`，取值依次是：`AMSI_RESULT_CLEAN`（0）、`AMSI_RESULT_NOT_DETECTED`（1）、`AMSI_RESULT_BLOCKED_BY_ADMIN_START`（0x4000）、`AMSI_RESULT_BLOCKED_BY_ADMIN_END`（0x4FFF）、`AMSI_RESULT_DETECTED`（0x8000）。官方还给出了两条判定规则：provider 可以在 1–32767 之间返回自定的风险等级；**任何大于等于 32768 的返回值都应视为恶意并拦截**，应用侧应该用 `AmsiResultIsMalware` 宏来判断，而不是自己写常量比较。[6][7]

**关键知识点：**

- `CLEAN` 与 `NOT_DETECTED` 不是一回事：前者表示“已判定干净且结论稳定”，后者表示“当前未检出，但后续定义更新可能改变结论”。做结论分级时这个差异值得保留。
- 管理员策略阻断是一个**区间**（0x4000–0x4FFF），官方说明这个区间故意留得很大，以容纳未来的功能扩展，而不是给 provider 用的。
- `AMSI_RESULT_DETECTED` 之后的值一律按恶意处理，这是官方给调用方的硬规则。

**Go 落地思路：** 采集侧把 provider 返回值原样保留成 `uint32`，判定逻辑单独封装，规则只依赖“是否恶意”这一个结论，阈值变化时只改一处：

```go
// AMSI_RESULT 取值，参见 Microsoft Learn 的 AMSI_RESULT 枚举。
const (
	amsiResultClean           uint32 = 0x0
	amsiResultNotDetected     uint32 = 0x1
	amsiResultAdminBlockedMin uint32 = 0x4000
	amsiResultAdminBlockedMax uint32 = 0x4FFF
	amsiResultDetected        uint32 = 0x8000
)

// IsMalware 复刻官方 AmsiResultIsMalware 的语义：>= 32768 即视为恶意。
func IsMalware(result uint32) bool {
	return result >= amsiResultDetected
}

// Classify 把结果归一化成规则可直接使用的等级。
func Classify(result uint32) string {
	switch {
	case IsMalware(result):
		return "malware"
	case result >= amsiResultAdminBlockedMin && result <= amsiResultAdminBlockedMax:
		return "blocked_by_admin"
	case result == amsiResultClean:
		return "clean_stable"
	case result == amsiResultNotDetected:
		return "not_detected"
	default:
		// 1–32767 之间是 provider 自定义的风险等级，越大风险越高。
		return "provider_risk_level"
	}
}
```

### 3. 攻击者绕过 AMSI 的常见路径有哪些？哪条最值得优先检测？

**简洁答案：** 路径可以按“切在哪一层”分成四类：**配置层**（关掉 AMSI 开关）、**注册层**（让 provider 加载不了或加载成别的）、**代码层**（改 amsi.dll 的扫描函数）、**宿主层**（换一个本来就不走 AMSI 的执行路径）。

**关键知识点：**

- 配置层最省事：`HKCU\Software\Microsoft\Windows Script\Settings\AmsiEnable` 被设为 `0` 即表示该用户下 AMSI 被禁用。CISA 的 CM0110 条目把“监控该键值被改为 0”列为首要检测项。[8]
- 注册层：AMSI provider 的注册表项被删除、`HKLM\SOFTWARE\Microsoft\AMSI\FeatureBits` 被改成 `0x1` 关闭签名检查、或 provider 路径指向非预期 DLL，都会让扫描链变形。[2][3]
- 代码层：在进程内对 `amsi.dll` 的扫描函数打补丁，让它直接返回“干净”。CISA 明确建议监控 `Amsi.dll` 代码段的哈希完整性，并检查这些函数的内存指令是否偏离初始预期值。[8]
- 宿主层：降级到 `powershell.exe -v 2`（PowerShell v2 不带 AMSI）、改用 Python/Perl 等不在 AMSI 覆盖范围内的解释器，或者走 AMSI 不覆盖的内存加载路径。CISA 把 `powershell.exe -v 2` / `-version 2` 与 PowerShell 事件日志 ID 400 一并列为需要监控的对象。[8]
- PowerShell 自身也留了痕迹：其 `AmsiUtils` 在初始化时会调用 `CheckAmsiInit()`，失败后置 `s_amsiInitFailed = true`，并通过 `PSEtwLog.LogAmsiUtilStateEvent` 记录状态事件（源码中可见 `init-<bool>`、`DllNotFoundException`、`ScanContent-InitFail` 等状态串）；一旦初始化失败，扫描路径会退化为返回中性结果——**这是“绕过已经发生”的运行时证据**。[9]

**Go 落地思路：** 规则按层分四条独立通道，命中任意一条都只产出“扫描链受损”的中间结论，不直接产出“主机已失陷”：

```go
type ScanChainState string

const (
	ScanChainIntact       ScanChainState = "intact"
	ScanChainConfigOff    ScanChainState = "config_disabled"
	ScanChainProviderLost ScanChainState = "provider_missing_or_changed"
	ScanChainCodePatched  ScanChainState = "code_patched"
	ScanChainNotCovered   ScanChainState = "host_not_covered_by_amsi"
)
```

### 4. 注册表层怎么采？Go 在 Windows 上读这些键要注意什么？

**简洁答案：** 至少采三处：`HKCU\Software\Microsoft\Windows Script\Settings` 的 `AmsiEnable`、`HKLM\SOFTWARE\Microsoft\AMSI\FeatureBits` 的 `AmsiEnable` 状态与 DWORD 值、`HKLM\SOFTWARE\Microsoft\AMSI\Providers` 下的 provider 子键集合（CLSID + 指向的 DLL 路径）。这三处分别对应“用户级开关”“签名检查开关”“provider 列表”。

**关键知识点：**

- `AmsiEnable` 存在用户级（HKCU）和机器级（HKLM）两个位置，只看一个会漏。CM0110 明确要求监控的是 HKCU 路径，同时保留机器级作为基线对照。[8]
- provider 项是 CLSID 形式的目录名，真正的 DLL 路径在对应 COM 类的 `InProcServer32` 里。只比较 CLSID 集合，不解析 `InProcServer32`，无法判断 provider 是不是被换了。[2]
- “键存在”与“键的值等于预期”是两件事。provider 列表为空、FeatureBits 取值偏离基线、DLL 路径指向用户可写目录，都是需要独立表达的信号。
- 注册表读取本身不产生“写入了什么”的证据，只给出“当前是什么”。要拿到归因，还得靠事件日志侧的注册表变更事件（审计策略开启时是 Security 日志 4657，或 Sysmon 的注册表事件类）。

**Go 落地思路：** Windows 上用 `golang.org/x/sys/windows/registry` 读快照，注意权限与异常处理；快照要带采集时刻和来源，好和后续事件做时间对齐：

```go
package amsi

import "golang.org/x/sys/windows/registry"

// AmsiSettingsPath 是用户级 AMSI 开关所在路径。
const AmsiSettingsPath = `Software\Microsoft\Windows Script\Settings`

// AmsiProvidersPath 是 AMSI provider 注册目录。
const AmsiProvidersPath = `SOFTWARE\Microsoft\AMSI\Providers`

// UserAmsiEnabled 返回 AmsiEnable 的取值：值不存在时 ok 为 false。
func UserAmsiEnabled() (value uint32, ok bool, err error) {
	key, err := registry.OpenKey(registry.CURRENT_USER, AmsiSettingsPath, registry.QUERY_VALUE)
	if err != nil {
		if err == registry.ErrNotExist {
			return 0, false, nil
		}
		return 0, false, err
	}
	defer key.Close()

	v, _, err := key.GetIntegerValue("AmsiEnable")
	if err != nil {
		if err == registry.ErrNotExist {
			return 0, false, nil
		}
		return 0, false, err
	}
	return uint32(v), true, nil
}
```

快照和基线的比对建议保留“为什么变了”的原因枚举（值变为 0、键被删除、provider 数量变化、provider 路径变化），不要只输出一个布尔值。

### 5. 代码层怎么检测？“打补丁”具体会改什么？

**简洁答案：** 做法是监控 `amsi.dll` 的代码段完整性，以及关键扫描函数入口处的指令字节是否偏离该 DLL 版本的预期值。CISA 的表述很直接：监控 `Amsi.dll` 中函数内存地址是否被篡改、监控其代码段哈希是否存在未授权的补丁。[8]

**关键知识点：**

- 判定基准是“该文件在磁盘上的可信版本”，而不是某个写死的哈希常量。Windows Update 会更新系统 DLL，写死哈希必然误报。正确做法是取同版本文件的基线哈希，或与系统签名校验结果（Catalog/Authenticode）交叉验证。
- 采样点要对准“可能被打补丁的时刻”：进程创建时、amsi.dll 首次加载时、以及周期性低频复核。只在启动时采一次会漏掉运行期注入式补丁。
- 打补丁通常需要先把内存页改成可写再写入，因此**内存权限变化本身**（例如对 `amsi.dll` 所在区域调用 `VirtualProtect` 放宽保护）是一个比“事后比对哈希”更早、更低成本的信号。
- 只在可疑进程上做深度校验：全量代码段哈希的开销不适合常驻高频执行，深度校验应当由轻量信号触发。

**Go 落地思路：** 完整性和权限变更用事件驱动触发，Go 侧负责读取并归一化：

```go
// IntegrityVerdict 表示一次完整性校验的结论，而不是简单布尔。
type IntegrityVerdict string

const (
	IntegrityOK          IntegrityVerdict = "ok"
	IntegrityMismatch    IntegrityVerdict = "hash_mismatch"
	IntegrityUnreadable  IntegrityVerdict = "unreadable"
	IntegrityNotBaselined IntegrityVerdict = "no_baseline"
)

// CheckCodeSection 只对指定文件的代码段做基线比对。
// baseline 为空表示当前环境还没有可信基线，此时必须如实返回 not_baselined，
// 不能因为“读到了内容”就当成通过。
func CheckCodeSection(actual, baseline []byte) IntegrityVerdict {
	if baseline == nil {
		return IntegrityNotBaselined
	}
	if actual == nil {
		return IntegrityUnreadable
	}
	if len(actual) != len(baseline) {
		return IntegrityMismatch
	}
	for i := range actual {
		if actual[i] != baseline[i] {
			return IntegrityMismatch
		}
	}
	return IntegrityOK
}
```

`IntegrityUnreadable` 和 `IntegrityNotBaselined` 都要如实上报为“证据缺口”。把“没读到”当成“没被改”，是这类规则最常见的漏报来源。

### 6. PowerShell 侧有哪些可用遥测？4104 脚本块日志怎么用？

**简洁答案：** 主要有四类：脚本块日志（ScriptBlockLogging，事件 ID 4104）、进程命令行（尤其 `-v 2` / `-EncodedCommand` / `Bypass`）、AMSI 初始化与扫描状态事件、以及 Defender 侧的检测事件（AMSI 来源的命中会落到 Defender Operational 的 1006 / 1116 等事件中）。[5][8][10]

**关键知识点：**

- 事件 4104 记录的是 PowerShell 处理过的脚本块内容，是还原“攻击者想执行什么”的关键证据；PowerShell 7 的日志在 `PowerShellCore/Operational` 通道，对应 ETW provider GUID `{f90714a8-5509-434a-bf6d-b1624c8a19a2}`，Windows PowerShell 5.1 则在 `Microsoft-Windows-PowerShell/Operational`。[11]
- 4104 属于 Verbose 级别、默认不开启，需要显式启用脚本块日志。**没开就是没有证据**，不能解读成“没有恶意脚本”。
- CISA 给出的脚本块监控关键词包括 `CreateThread`、`DllImport`、`Bypass`、`VirtualAlloc`，以及 Base64 编码命令和大量特殊符号组合；这些是**绕过手法的强指示**，但也可能是合法运维，因此要配合父进程、用户、签名状态一起看。[8]
- AMSI 初始化失败会以状态事件形式暴露（`PSEtwLog.LogAmsiUtilStateEvent`，分析通道、`PSEventId.Amsi_Init` 事件、`PSTask.Amsi`）。这条证据的价值在于它直接说明“扫描没生效”，而不是事后猜测。[9]
- Defender 侧：AMSI 作为检测来源时，会体现在 Defender 事件的 `Detection Source` 字段中（官方文档列举的来源包括 AMSI、UAC、IOAV、Early Launch Antimalware 等）。因此“没有 Defender 事件”既可能是真干净，也可能是扫描链断了。[10]

**Go 落地思路：** 对 4104 事件做轻量特征抽取，把长脚本压成可排序的信号集合，而不是把全文塞进告警：

```go
// ScriptSignals 是从脚本块中抽出的粗粒度特征，供规则匹配。
type ScriptSignals struct {
	HasVirtualAlloc   bool
	HasCreateThread   bool
	HasDllImport      bool
	HasExecutionBypass bool
	HasBase64Blob     bool
	Length            int
}

// ExtractSignals 只做关键词与形态匹配，不做语义分析。
func ExtractSignals(script string) ScriptSignals {
	lower := strings.ToLower(script)
	return ScriptSignals{
		HasVirtualAlloc:    strings.Contains(lower, "virtualalloc"),
		HasCreateThread:    strings.Contains(lower, "createthread"),
		HasDllImport:       strings.Contains(lower, "dllimport"),
		HasExecutionBypass: strings.Contains(lower, "bypass"),
		HasBase64Blob:      strings.Contains(lower, "frombase64string"),
		Length:             len(script),
	}
}
```

这些特征只作为“候选”信号，真正的结论仍要靠“AMSI 状态 + 进程上下文 + 后续行为”组合输出。

### 7. ETW 在这条链里扮演什么角色？ETW 自己被打掉怎么办？

**简洁答案：** ETW 是 Windows 的内核级追踪设施，由 controller、provider、consumer 三方组成：controller 启停追踪会话并启用 provider，provider 产生事件，consumer 消费事件。manifest 型 provider 通过 `EventRegister` / `EventWrite` 注册与写入事件，最多可被 8 个追踪会话同时启用。[12]

**关键知识点：**

- 很多主机的行为遥测（包括 PowerShell 日志、脚本块日志）走的是 ETW 通道。ETW 通道断了，脚本类证据会整体消失，而不是“少几条”。
- ETW 有明确的丢失机制：事件大小超过缓冲区时会丢事件，provider 被禁用时不产生事件，会话统计里也有缓冲丢弃计数。官方文档的结论是“事件丢失只能由 provider 或事件日志服务方修复”。[12]
- 因此 ETW 侧的异常表现为**沉默**：没有事件、事件数断崖式下跌、同一时间窗内多通道同时空档。这类信号本身要作为采集质量指标上报。
- 检测 ETW 被削弱，和检测 AMSI 被削弱是同类问题的两面：**检测平台自身被攻击**。这也是 Agent 自保护的一部分。

**Go 落地思路：** 每条采集通道都要有“最近成功时间”和“本周期事件数”两个自监控指标，空档要作为事件上报，而不是静默。告警语言要区分“没有发生”和“没有采到”。

### 8. 误报怎么治？这条链上哪些是合法行为？

**简洁答案：** 合法场景确实存在，必须分层白名单，且白名单要绑定具体主体而不是简单放行。

**关键知识点：**

- 安全团队自己会跑 AMSI 检测测试。Microsoft 官方给出的验证样例是在 PowerShell / VBScript / JavaScript 里对一段固定测试串做 `Invoke-Expression` / `eval`，正常结果是脚本被拦截并产生 `Win32/MpTest!amsi` 命中；这在客户环境里会真实产生 Defender 事件和阻断记录。[5]
- 合法运维会大量使用 `Bypass`、`-EncodedCommand`、`CreateThread` 这类关键词，脚本块日志里出现它们不等于攻击。
- `AmsiEnable` 被设为 0 可能是某个老旧应用或安装脚本的行为，也可能是攻击。区分靠变更来源、时间、用户与该主机上是否存在配套的 AMSI 绕过迹象。
- 白名单粒度建议：可信安装程序 + 特定用户 + 特定维护窗口 + 明确的行为范围（只放行“注册表读取”，不放行“值变更为 0”）。

**Go 落地思路：** 白名单命中要输出命中了哪一条、剩余风险是什么，便于客户解释：

```go
// SuppressDecision 保留抑制原因，不做静默丢弃。
type SuppressDecision struct {
	Suppressed bool
	Reason     string
	Scope      string
}

func evaluateSuppression(actorTrusted, inMaintenanceWindow bool, action string) SuppressDecision {
	switch {
	case !actorTrusted:
		return SuppressDecision{Reason: "actor_not_trusted", Scope: action}
	case !inMaintenanceWindow:
		return SuppressDecision{Reason: "outside_maintenance_window", Scope: action}
	default:
		return SuppressDecision{Suppressed: true, Reason: "trusted_actor_in_window", Scope: action}
	}
}
```

### 9. Go Agent 落地这套检测要注意什么？

**简洁答案：** 关键是把四层证据分层采集、逐层升级，并且明确区分“扫描后未检出”和“未被扫描”。下面是可直接对照落地的最小结构。

**关键知识点：**

- 采集层：注册表快照（用户级 / 机器级 / provider 列表）、`amsi.dll` 完整性基线、PowerShell 与 Defender 事件。
- 状态层：把四层信号归一成 `ScanChainState`，并记录每层的采集成功与否。
- 检测层：任一层异常 → “扫描链受损”中间结论；叠加可疑脚本与异常行为 → 升级为攻击告警。
- 输出层：结论必须带证据等级，至少三档——`scan_bypassed_confirmed`（有直接证据，如 AMSI 初始化失败事件或代码段哈希不符）、`scan_chain_suspect`（配置或注册偏离，但无直接证据）、`evidence_gap`（采集失败或无基线）。

**Go 落地思路：** 事件结构保持扁平，证据等级单独成字段：

```go
type AmsiDegradationEvent struct {
	Timestamp       int64
	HostID          string
	UserSID         string
	ProcessID       int
	Image           string
	State           ScanChainState
	EvidenceLevel   string   // confirmed / suspect / evidence_gap
	AmsiEnableValue uint32
	AmsiEnableFound bool
	ProviderCount   int
	IntegrityVerdict string
	Detail          string
}
```

`EvidenceLevel` 单独存在，是为了让下游能区分“确证绕过”和“疑似”，避免规则层把中间结论当最终结论用掉。

## Go 落地思路

一个务实的实现可以分成四层：

1. **配置层**：周期性读取用户级与机器级 AMSI 开关、`FeatureBits`、provider 列表，形成快照并与基线比对。任何偏离都要落成可解释事件，而不是只比较字符串。
2. **注册层**：解析 provider CLSID 对应的 `InProcServer32` 路径，关注“数量变化”“路径变化”“路径落在用户可写目录”。解析失败要报证据缺口，不能默认安全。
3. **完整性层**：以磁盘上的可信文件为基线，对 `amsi.dll` 代码段做按需校验；由内存权限变更等轻量信号触发深度校验。基线缺失时如实返回 `not_baselined`。
4. **关联层**：把 AMSI 状态事件、脚本块特征、进程命令行与 Defender 检测事件放进同一条时间线，输出“扫描链受损 → 可疑脚本 → 后续行为”的链条，而不是孤立告警。

## 学习要点

- AMSI 是标准接口而非具体产品：调用方是 PowerShell、WSH、Office VBA、UAC 等宿主，provider 是注册在 `HKLM\SOFTWARE\Microsoft\AMSI\Providers` 下的进程内 COM 服务器。
- 覆盖边界是硬事实：Python、Perl 不在 AMSI 范围内；Defender 侧还要求开启脚本扫描。[1][4]
- `AMSI_RESULT` 的判定规则是“≥ 32768 即恶意”，并有专门的 `AmsiResultIsMalware` 宏，不要自己写死比较。[6][7]
- 绕过分四层：配置（`AmsiEnable=0`）、注册（provider 被替换/签名检查被关）、代码（`amsi.dll` 被打补丁）、宿主（换到不覆盖的执行路径）。
- PowerShell 会自己暴露 AMSI 初始化失败，这是比事后推断更直接的证据。[9]
- 事件 4104 需要显式开启脚本块日志才有；没有日志 ≠ 没有恶意。[8][11]
- “未检出”和“未扫描”必须分开表达，否则既会误报也会漏报。
- ETW 与 AMSI 是同一条链的两端：AMSI 是扫描侧，ETW 是采集侧，两边被削弱都表现为“安静”。

## 小练习

1. 在隔离虚拟机上分别尝试 `HKCU\Software\Microsoft\Windows Script\Settings` 下的 `AmsiEnable` 置 0、`powershell.exe -v 2` 执行一条脚本，说明各自在采集侧留下什么证据、在扫描侧留下什么证据。
2. 用 Defender 官方文档里的 AMSI 测试样例跑一遍完整验证流程，记录产生的 Defender 事件 ID、`Detection Source` 字段和威胁名，并说明为什么这些记录不应被规则当成攻击者行为。
3. 为 `amsi.dll` 建立“磁盘文件 ↔ 代码段哈希”的基线机制，描述基线的获取方式、更新触发条件，以及基线缺失时事件应该怎么写。
4. 设计三条独立规则，分别覆盖配置层（`AmsiEnable` 变 0）、注册层（provider 列表或路径变化）、代码层（代码段哈希不符），并为每条规则各写两个真实误报来源。
5. 写一个最小 Go 程序解析 `HKLM\SOFTWARE\Microsoft\AMSI\Providers` 下的 CLSID 列表，并解析对应 `InProcServer32` 的 DLL 路径，输出哪些路径不在系统目录内。
6. 说明 AMSI 初始化失败事件与“脚本块日志里出现可疑关键词”这两条证据在置信度上的差别，并设计一个把它们组合成单一告警的评分逻辑。
7. 设计 ETW 通道的空档检测：给出指标定义、阈值依据，以及在什么情况下只能报“采集缺口”而不升级为攻击告警。
8. 为“客户说 Defender 实时保护开着但没拦住脚本”写一份排障清单，逐项说明要采集什么证据、期望看到什么结果。

## 复盘

这道题的核心不是记住几个绕过名词，而是理解一条**用户态检测链的结构**：宿主决定谁来调用，provider 决定谁来判定，注册表决定链路如何接通，代码段完整性决定判定逻辑有没有被改，事件通道决定我们事后能不能看到。

能把这五层分开讲清楚，能说清每层的采集手段、失效表现和误报来源，能在结论里区分“扫过了没发现”和“压根没扫”，回答就达到了主机安全岗位对“检测体系自身安全”的要求。

## 参考资料

- [Microsoft Learn：Antimalware Scan Interface (AMSI)](https://learn.microsoft.com/en-us/windows/win32/amsi/antimalware-scan-interface-portal)
- [Microsoft Learn：Developer audience, and sample code（AMSI provider 注册）](https://learn.microsoft.com/en-us/windows/win32/amsi/dev-audience)
- [Microsoft Learn：IAntimalwareProvider interface（FeatureBits 签名检查）](https://learn.microsoft.com/en-us/windows/win32/api/amsi/nn-amsi-iantimalwareprovider)
- [Microsoft Learn：AMSI integration with Microsoft Defender Antivirus](https://learn.microsoft.com/en-us/defender-endpoint/amsi-on-mdav)
- [Microsoft Learn：AMSI demonstrations with Microsoft Defender for Endpoint](https://learn.microsoft.com/en-us/defender-endpoint/mde-demonstration-amsi)
- [Microsoft Learn：AMSI_RESULT (amsi.h)](https://learn.microsoft.com/en-us/windows/win32/api/amsi/ne-amsi-amsi_result)
- [Microsoft Learn：AmsiResultIsMalware macro](https://learn.microsoft.com/en-us/windows/win32/api/amsi/nf-amsi-amsiresultismalware)
- [CISA Eviction Strategies Tool：CM0110 Anti-Malware Scan Interface (AMSI)](https://www.cisa.gov/eviction-strategies-tool/info-countermeasures/CM0110)
- [PowerShell 源码：AmsiUtils（初始化失败状态与扫描降级）](https://github.com/PowerShell/PowerShell/blob/master/src/System.Management.Automation/security/SecuritySupport.cs)
- [Microsoft Learn：Microsoft Defender Antivirus event IDs and error codes](https://learn.microsoft.com/en-us/defender-endpoint/troubleshoot-microsoft-defender-antivirus)
- [Microsoft Learn：about_Logging_Windows（PowerShell 日志与 ETW provider）](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_logging_windows)
- [Microsoft Learn：About Event Tracing](https://learn.microsoft.com/en-us/windows/win32/etw/about-event-tracing)
