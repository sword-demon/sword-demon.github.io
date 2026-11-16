---
title: Go 主机安全面试：Windows WDAC / AppLocker 应用控制策略降级与绕过检测
date: 2026-11-16 17:15:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- windows
- wdac
- applocker
---

# Go 主机安全面试：Windows WDAC / AppLocker 应用控制策略降级与绕过检测

## 岗位场景

你在做云铠主机安全（EDR）的 Windows 端 Agent。某天客户提了个工单：

> “我们这台机器上明明部署了应用管控，Windows Defender 也没报毒，但攻击者上传的 `svchost.exe` 照样跑起来了。”

第一反应是“这客户没部署好”。但真正该问的问题是：**应用控制本身是不是被关掉了，或者被换成了一份宽松策略？**

这就是应用控制（Application Control）方向。前面几篇写过 Defender 排除项篡改、AMSI 绕过、事件日志清理、卷影副本删除、启动链 Bootkit——它们都属于“把某一道防线拆掉”。应用控制是 Windows 上最硬的一道防线之一：**代码能不能跑，由策略说了算，不由签名 reputation 说了算。**

这篇要能回答的就是：怎么用 Go 做一个 Agent，采集并判断这台机器上的应用控制状态有没有被降级。

## 背景：三条不同的技术线

Windows 上的“应用控制”不是一套东西，至少要分清：

| 技术 | 决策层 | 策略载体 | 覆盖范围 |
| --- | --- | --- | --- |
| App Control for Business（俗称 WDAC） | 内核 Code Integrity（CI） | 签名后的策略二进制（`.cip` / `SiPolicy.p7b`） | EXE、DLL、脚本、MSI、驱动 |
| AppLocker | 用户态 Application Identity（AppID）服务 | Group Policy 注册表 | EXE、MSI、脚本、DLL、打包应用 |
| Smart App Control（SAC） | 基于 WDAC + 云端应用智能（ISG） | 内置策略，用户不自行编写 | Windows 11 消费级/小型企业 |

一句话记忆：

- **WDAC 是“内核态签了名的合同”**，策略二进制被签名，攻击者没有签名私钥就伪造不了策略本体；
- **AppLocker 是“用户态的规则集合”**，走 Group Policy，管理员自己能改，属于“合法变更”和“恶意变更”边界更模糊的那一类；
- **Smart App Control 是“开箱即用的信誉模式”**，Windows 11 上默认存在，企业受管设备 48 小时内会自动关掉评估模式。

三者互相独立，可以叠加，也可以互相被拆。**EDR 要做的是把它们的“生效状态”采上来，而不是只采进程行为。**

## 高频面试题

### Q1：WDAC、AppLocker、Smart App Control 到底有什么区别？面试官想听什么？

**通俗答案：**

它们都是 allowlist（默认拒绝）模型，但执行者不同：

- **WDAC / App Control for Business** 在内核 Code Integrity 层做判断，策略是二进制文件并带签名；支持 UMCI（用户态代码完整性）、KMCI（内核态）、ISG（Intelligent Security Graph 云信誉）、Managed Installer（受管安装器信任）。Windows 10 1607 以后企业版、专业版等均可用。
- **AppLocker** 在用户态，通过 Application Identity 服务计算文件属性并用 ACE 式的规则匹配；规则来自 Group Policy，存在 `HKLM\Software\Policies\Microsoft\Windows\SrpV2`（策略）、`HKLM\Software\Policies\Microsoft\Windows\AppidPlugins`（COM 对象）、`HKLM\System\CurrentControlSet\Control\Srp\`（服务与状态）三个注册表位置。
- **Smart App Control** 建立在 WDAC 之上，用微软云端应用智能给文件打信誉分；状态由 `VerifiedAndReputablePolicyState` 记录。

**关键知识点：**

- AppLocker 有五个规则集合：可执行文件（`.exe`、`.com`）、Windows Installer（`.msi`、`.mst`、`.msp`）、脚本（`.ps1`、`.bat`、`.cmd`、`.vbs`、`.js`）、DLL（`.dll`、`.ocx`）、打包应用（`.appx`）。
- **DLL 规则集合默认不启用**，因为每个应用都会加载大量 DLL，逐个 DLL 检查会带来兼容性和性能问题。EDR 判断“是否被降级”时，DLL 集合是否从关闭变开启/关闭，本身就是一个变更信号。
- AppLocker 的拦截点有三个：创建新进程时、加载 DLL 时、脚本宿主执行脚本前。**脚本这一路有个坑**：官方明确写“多数第三方脚本宿主并未集成 App Control”，脚本宿主拿到检查结果后**不一定真的阻断**（例如 PowerShell 会退到 Constrained Language Mode 而不是直接拒绝）。所以 AppLocker 对脚本不是沙箱。

**Go 落地思路：**

Agent 里把三者建模成**三个独立的能力状态对象**，而不是一个 `appControlEnabled bool`：

```go
// 三套技术互相独立，状态必须分开建模
type AppControlState struct {
	WDACPolicyIDs  []string       // WDAC 策略清单（GUID）
	WDACEnforced   bool           // 是否处于强制模式
	AppLockerModes map[string]int // 规则集合 -> EnforcementMode
	SmartCtrlState int            // VerifiedAndReputablePolicyState
	CollectedAt    time.Time
}
```

这样客户问“我们到底开了哪些管控”时，能直接答出“WDAC 强制 + AppLocker 仅 EXE 强制 + SAC 评估”，而不是一个模糊的“开了”。

### Q2：为什么 EDR 不能只做行为检测，必须盯策略面？

**通俗答案：**

行为检测看的是“坏东西干了什么”。但 allowlist 防线被拆之后，恶意代码的行为和正常代码完全一样——`calc.exe` 被替换成木马，它的进程名、命令行、内存布局都和真 `calc.exe` 没区别。**行为检测的基线被人为放宽了。**

更进一步，应用控制降级往往是攻击链的**前置动作**，本身不是最终目标。攻击者的顺序通常是：

1. 拿到管理员权限（钓鱼 / 本地提权 / 凭据泄露）；
2. 拆掉应用控制、AMSI、Defender 排除项、审计日志；
3. 落地 payload 并执行；
4. 建立持久化、横向移动。

第 2 步是**状态面证据**，第 3、4 步才是**行为面证据**。EDR 如果只收行为，等看到第 3 步时，第 2 步已经过去几分钟到几小时，错过了“什么时候、谁、什么授权”的关键上下文。

**关键知识点：**

- 状态面证据的价值是**时间锚点**：策略降级事件能把后续所有进程/文件/网络事件串成一条链，而不是一堆孤立告警。
- 策略面证据也是**归因证据**：谁改了策略、改成了什么、有没有走变更流程，这些是定责和客户沟通必需的。
- 官方排障文档里明确列出了这种攻击者行为：“拥有管理员权限的攻击者可能应用了一份策略，导致关键进程被拒绝服务（DoS）”。这是微软自己承认的攻击面，EDR 侧更没有理由看不见。

**Go 落地思路：**

把策略面事件做成**上下文增强事件（context event）**，而不是顶级告警：

```go
type PolicyContext struct {
	PolicyDegradedAt time.Time
	ChainID          string
}

type BehaviorEvent struct {
	Timestamp time.Time
	Score     int
	ChainID   string
}

// BoostByPolicyDegradation 在策略降级后的时间窗内提升后续行为事件权重。
func BoostByPolicyDegradation(ctx PolicyContext, event *BehaviorEvent) {
	if ctx.PolicyDegradedAt.IsZero() {
		return
	}
	if event.Timestamp.Sub(ctx.PolicyDegradedAt) < 30*time.Minute {
		event.Score += 30
		event.ChainID = ctx.ChainID // 与降级动作归到同一条攻击链
	}
}
```

攻击链规则引擎里，把“策略降级”作为一条**前置节点**：`policy_tamper -> unsigned_exec -> outbound_connection`，比单条“可疑进程启动”告警价值高得多。

### Q3：一个 Go Agent 要采集哪些“可观测面”？怎么设计采集通道？

**通俗答案：**

四个面，缺一不可：

1. **策略面**：WDAC 策略清单（有哪些策略、是否强制）、策略文件本体（`.cip` / `SiPolicy.p7b` 的存在性、哈希、签名者）；
2. **配置面**：AppLocker 各规则集合的 `EnforcementMode`、Smart App Control 的 `VerifiedAndReputablePolicyState`；
3. **事件面**：`Microsoft-Windows-CodeIntegrity/Operational` 与 `Microsoft-Windows-AppLocker/*` 日志；
4. **服务面**：AppLocker 相关服务（`appid`、`appidsvc`、`applockerfltr`）是否在跑。

**关键知识点：**

- 官方排障文档给出的采集命令就是最好的采集面清单：
  - `citool.exe -lp -json > CiToolOutput.json`（列出本机所有策略，激活与否都列）；
  - `reg.exe query HKLM\Software\Policies\Microsoft\Windows\SrpV2 /s`、`...\AppidPlugins /s`、`HKLM\System\CurrentControlSet\Control\Srp\ /s`；
  - `sc.exe query appid`、`sc.exe query appidsvc`、`sc.exe query applockerfltr`；
  - `cidiag.exe /stop`（一键收集诊断包）。
- CiTool 仅在 **Windows 11 22H2 及以后、Windows Server 2025** 的系统镜像中自带。更老的系统上“没有 CiTool”是环境事实，**不是“没有策略”**。
- AppLocker 事件分两个日志通道：EXE/DLL/驱动走 `CodeIntegrity - Operational`；MSI、脚本、COM 对象走 `AppLocker - MSI and Script`。

**Go 落地思路：**

采集通道按“变化频率”分层，避免把 Agent 变成轮询机器：

```go
// 状态面变化慢：低频轮询 + 抖动；事件面走订阅，文件面走目录变更看门狗。
func startStatePoller(ctx context.Context, collect func()) {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			collect()
		}
	}
}
```

Go 侧执行外部命令时注意三点：**不经过 shell**（避免命令拼接注入）、**带超时**（`exec.CommandContext`）、**限制输出大小**（策略清单 JSON 可能很大，防止 OOM）。另外 Agent 以 SYSTEM 运行时读这些注册表和事件日志没有权限问题，但非 SYSTEM 部署会读不到——采集失败必须如实报 `unknown`，不能默认“没开”。

### Q4：只看注册表够吗？CodeIntegrity 事件 ID 怎么读？

**通俗答案：**

不够。注册表是“配置意图”，事件是“运行时事实”。只读注册表会踩两类坑：

- 策略写了但**没激活**（刷新失败、需要重启、策略格式不对）；
- 策略激活了但**行为受限**（比如 CI 服务被关、策略与业务二进制冲突导致部分程序起不来）。

**关键知识点（微软官方事件 ID 表，CodeIntegrity - Operational）：**

| 事件 ID | 含义 |
| --- | --- |
| 3076 | **审计模式**下的主拦截事件：文件本来会被拦截，但当前策略是 audit，所以放行了 |
| 3077 | **强制模式**下的主拦截事件：文件没通过策略，被真正拦截 |
| 3064 / 3065 | 用户态 DLL 在 audit / enforce 下的拦截事件 |
| 3033 / 3034 | 文件不符合策略要求（签名被吊销、Lifetime Signing EKU 过期等）/ 3034 是 3033 的审计模式对应 |
| 3089 | 签名信息事件，一个文件一个签名一条；未签名文件只生成一条且 `TotalSignatureCount = 0` |
| 3004 | 驱动签名无效（与 App Control 策略无关时会单独出现） |
| 3095 | 策略无法刷新，只能重启 |
| 3096 | 策略已是最新，无需刷新；Details 里带策略选项 |
| 3097 | 策略刷新失败 |
| 3099 | **策略已加载**，Details 里带策略选项 |
| 3100 | 策略刷新了但激活失败，建议重试 |
| 3101 / 3102 | 策略刷新开始 / 结束 |
| 3103 | 系统忽略了策略刷新（例如内置策略不满足激活条件） |

AppLocker 通道：**8028**（脚本宿主在 audit 模式下做了放行前查询）、**8029**（enforce 对应事件，但真正是否阻断由脚本宿主决定）、**8036**（COM 对象被拦截）、**8037**（脚本通过策略）、**8038**（脚本签名信息事件，与 8028/8029 通过 ActivityID 关联）、**8039/8040**（打包应用 audit 放行 / 被拦截）。

**Go 落地思路：**

事件解析必须**以语义为单位**建模，而不是把原始 XML 直接塞给规则引擎：

```go
// classifyCIEvent 把原始 EventID 归一成内部语义，规则引擎只认语义。
func classifyCIEvent(eventID int) string {
	switch eventID {
	case 3076:
		return "audit_would_block"
	case 3077:
		return "enforce_blocked"
	case 3089:
		return "signature_info"
	case 3099, 3096:
		return "policy_loaded"
	case 3097, 3100:
		return "policy_refresh_failed"
	default:
		return "other"
	}
}
```

拿到事件后先做语义归一，再进规则引擎；这样后面写“3076 突增”“3077 出现”这类规则时不需要反复解析 XML。

### Q5：怎么判断 AppLocker 是“被关掉”还是“本来就没配”？

**通俗答案：**

这正是 `EnforcementMode` 的价值。AppLocker 每个规则集合都有一个强制模式：

- `0` = 未配置（NotConfigured）：这个集合没有启用，属于**正常状态**，不能报“被关闭”；
- `1` = 强制（Enforced）：规则真正拦截；
- `2` = 仅审计（AuditOnly）：规则只记录不拦截，属于**弱化但合法**的形态。

**关键知识点：**

- 配置在 `HKLM\Software\Policies\Microsoft\Windows\SrpV2\<规则集合>\EnforcementMode`（DWORD）。取值语义以目标机 `Get-AppLockerPolicy -Effective` 的输出为准。
- **“集合未配置”≠“被关闭”**：一个企业可能只配了 EXE 集合，完全没配 DLL 集合，这是设计，不是降级。
- 真正的高危信号是**状态跃迁**：原来 `1` 变成 `0` 或 `2`；或者原来配了规则、规则被删空但集合还保持 `1`（“强制模式 + 空规则 = 什么都放行”，这是很隐蔽的绕过）。
- AppLocker 服务（`appid`、`appidsvc`、`applockerfltr`）被停止同样会导致管控失效，而且从注册表上看不出来。

**Go 落地思路：**

判定必须基于**基线差分**，而不是绝对值：

```go
type CollectionState struct {
	Mode     uint32 // 0 未配置 / 1 强制 / 2 仅审计
	RuleHash string // 规则集合内容的哈希
}

// 只有"从有到无"或"从强制到弱化"才升级为可疑
func diffCollection(baseline, current CollectionState) (suspicious bool, reason string) {
	switch {
	case baseline.Mode == 1 && current.Mode != 1:
		return true, "enforcement downgraded"
	case baseline.RuleHash != "" && current.RuleHash == "":
		return true, "rules cleared"
	case baseline.RuleHash != current.RuleHash:
		return true, "rules changed"
	}
	return false, ""
}
```

“强制模式 + 空规则”这个组合建议单独做一条硬规则，因为它是**从配置上看完全正常**的绕过方式。

### Q6：Smart App Control 的三个状态值怎么解读？为什么改注册表不等于生效？

**通俗答案：**

`VerifiedAndReputablePolicyState`（DWORD，位于 `HKLM\SYSTEM\CurrentControlSet\Control\CI\Policy`）三个取值：

- `0` = Off（关闭）
- `1` = Enforce（强制）
- `2` = Evaluation（评估）

**关键知识点：**

- **0 才是“被关掉”**，1 和 2 都还在工作，2 只是还没进入强制阶段。
- 评估模式是**微软的默认设计**：Smart App Control 启动后先跑评估，如果判断你是开发者/重度自定义用户，会在 48 小时内自动关掉。**企业受管设备默认 48 小时内关闭评估模式**。所以“看到 Evaluation”不能直接报攻击。
- 官方文档明确写：改完这个注册表值后**必须执行 `CiTool.exe -r` 才会生效**。这带来一个非常典型的检测盲区：**注册表已经写成 0，但策略还在线上生效**。只看注册表会误报“已降级”，只看事件又会漏报“待生效的降级”。
- 真正生效的标志是事件：策略刷新后会有 **3101（开始刷新）/ 3102（完成刷新）/ 3099（策略已加载）/ 3096（已是最新）**。

**Go 落地思路：**

对“待生效”和“已生效”分别建模，这一步是 AppLocker/WDAC 类降级检测最容易做错的地方：

```go
type SACState struct {
	PolicyState     int       // VerifiedAndReputablePolicyState
	RegistryWriteAt time.Time // 注册值写入时间
	LastActivation  time.Time // 最近一次策略激活事件时间
}

// sacDegraded 判断“关闭 Smart App Control”的意图是否已真正生效。
// 注册表是意图，策略激活事件才是事实。
func sacDegraded(s SACState) (degraded bool, pending bool) {
	if s.PolicyState != 0 {
		return false, false
	}
	if s.LastActivation.After(s.RegistryWriteAt) {
		return true, false // 意图已落地
	}
	return false, true // 待生效：降级尝试，尚未造成影响
}
```

告警分级上，“已生效”走高危，“待生效”走中危并附一句“刷新未确认”，比一刀切报高危要靠谱得多。

读取这个值本身没什么难度，坑在语义——**`0` 是合法状态（Off），不能用 `0` 表示“没读到”**：

```go
//go:build windows

package main

import (
	"encoding/binary"
	"fmt"
	"syscall"
)

const keyRead = 0x20019

// queryDWord 读取 HKLM\<subKey> 下的一个 DWORD 值。
// 值 0 是合法状态（Smart App Control 的 Off 就是 0），
// 所以用 ok 区分“值存在”和“键值不存在”。
func queryDWord(subKey, valueName string) (value uint32, ok bool, err error) {
	subKeyPtr, err := syscall.UTF16PtrFromString(subKey)
	if err != nil {
		return 0, false, err
	}
	var key syscall.Handle
	err = syscall.RegOpenKeyEx(syscall.HKEY_LOCAL_MACHINE, subKeyPtr, 0, keyRead, &key)
	if err != nil {
		return 0, false, err
	}
	defer syscall.RegCloseKey(key)

	name, err := syscall.UTF16PtrFromString(valueName)
	if err != nil {
		return 0, false, err
	}
	var buf [4]byte
	var size uint32
	err = syscall.RegQueryValueEx(key, name, nil, nil, &buf[0], &size)
	if err != nil {
		if err == syscall.ERROR_FILE_NOT_FOUND {
			return 0, false, nil
		}
		return 0, false, err
	}
	if size != 4 {
		return 0, false, fmt.Errorf("unexpected registry value size %d", size)
	}
	return binary.LittleEndian.Uint32(buf[:]), true, nil
}
```

用标准库 `syscall` 就够了，不引入新依赖；如果项目本来依赖 `golang.org/x/sys/windows`，可以直接换成 `windows.RegOpenKeyEx` + `windows.RegistryValue`（注意两者的 API 形态不同，别混着写）。

### Q7：攻击者真要绕过 WDAC / AppLocker，会做什么？怎么逐条检测？

**通俗答案：**

按“成本从低到高”排：

1. **改注册表关掉 Smart App Control**——需要管理员，成本最低；
2. **停掉 AppLocker 服务**——`appidsvc` / `applockerfltr` 停止，管控静默失效；
3. **删除或替换策略文件**——删 `.cip` / `SiPolicy.p7b`，或替换成一份宽松的旧策略；
4. **推送一份宽松策略**（Group Policy / Intune / 本地脚本），把 allowlist 换成 allow-all；
5. **回滚策略版本**——攻击者事先保存了一份旧的宽松策略，降级后替换回去；
6. **绕开策略执行**——利用 AppLocker 对脚本“只是查询不是阻断”的语义，或使用未集成 App Control 的第三方脚本宿主。

**关键知识点：**

- **策略文件本体是签名的**：攻击者没有签名私钥就无法伪造策略，但**可以拿旧的合法策略回滚**。所以检测不能只校验“签名有效”，还要校验“是不是我们下发的那个版本”。
- 官方排障文档列出的几种“策略状态与预期不符”的原因，正好一一对应上面的攻击手法：策略被删除但没重启；策略被部分删除，System / EFI 分区里还留着副本；单策略格式 `SiPolicy.p7b` 被复制到多策略格式目录导致磁盘上出现重复策略二进制；策略被错误下发；**攻击者用管理员权限应用了一份策略**。
- `CiTool --remove-policy <PolicyGUID>` 和 `--update-policy` 都是官方支持的策略变更动作——**同一个动作，既可能是运维，也可能攻击，区别只在于授权**。

**Go 落地思路：**

把策略文件做成**带基线的指纹**，而不是简单看存在性：

```go
type PolicyFingerprint struct {
	Path       string
	GUID       string
	SHA256     string
	SignerInfo string // 签名者与颁发者，用于核对是否是我方策略
	Size       int64
}
```

每轮采集计算 `.cip` 文件哈希，与基线比对；出现**新增 GUID 文件**、**已知 GUID 哈希变化**、**出现 `SiPolicy.p7b` 与 `.cip` 并存**这三种情况，都直接升级告警。`SiPolicy.p7b` 与 `{GUID}.cip` 并存是官方文档点名的重复策略二进制形态，很适合做低成本高信噪比的规则。

### Q8：策略文件存在 ≠ 策略生效。官方视角里有哪些“状态对不上”的坑？

**通俗答案：**

微软在排障文档里列了一整节 “Issue: A policy is active that is unexpected”，原因包括：

- 策略已被移除，但**系统还没重启**，旧策略还在内存里生效；
- 策略被**部分移除**，System 分区或 EFI 分区里还有一份副本；
- 单策略格式的 `SiPolicy.p7b` 被复制到多策略格式目录，磁盘上出现重复策略二进制；
- 策略被错误下发到设备；
- 攻击者用管理员权限应用了一份策略。

**关键知识点：**

- 这五个原因覆盖了三种不同的检测模型：**状态残留**（删了没重启）、**介质残留**（EFI 分区藏副本）、**资产不一致**（下发错机器）、**恶意变更**。
- EFI 分区值得单独说：很多 EDR 只扫 `C:\Windows\System32\...`，完全看不到 EFI 分区里那份 `SiPolicy.p7b`。**攻击者藏策略副本的天然位置，恰恰是 Agent 的盲区。**
- “策略刷新了但激活失败”（3100）和“系统忽略刷新”（3103）同样会导致“文件在、但不生效”。

**Go 落地思路：**

策略清单用官方工具的 JSON 输出做资产化：

```go
// citool.exe -lp -json 的字段以目标机实际输出为准，做宽松解析
type PolicyInventory struct {
	Policies []PolicyEntry
}

type PolicyEntry struct {
	PolicyID   string
	PolicyName string
	Enforced   bool
	Raw        map[string]any // 保留原始字段，版本差异不丢信息
}
```

用 `encoding/json` 解到 `map[string]any` 再按需取字段，比硬编码一个 `struct` 更抗版本变化；字段名大小写/具体键名以目标机输出为准。执行 `citool.exe` 时同样要 `CommandContext` 超时 + 输出上限。

### Q9：Go 侧怎么解析 CodeIntegrity 事件 XML？为什么要用 ActivityID 关联 3089？

**通俗答案：**

Windows 事件日志可以导出成 XML，一条 `3077` 事件里能拿到文件名、父进程名、签名级别、状态码；但**签名信息在另一条 `3089` 事件里**。两条事件靠 System 部分里的 `Correlation ActivityID` 关联。直接按文件名关联会错——同一秒可能有多个同名文件被拦。

**关键知识点：**

- `3089` 一个文件一个签名一条事件；未签名文件只生成一条，`TotalSignatureCount = 0`。
- `3076/3077/3033/3034` 这类拦截事件与对应的 `3089` 通过 ActivityID 一一对应，官方排障文档明确说用 ActivityID 匹配。
- `Status` 字段是 Windows NT 状态码，可以用 `certutil.exe -error <status>` 查含义。
- 事件的 `File Name` 是磁盘上的可变路径，**不是**创建文件规则用的 `OriginalFileName`；做规则命中解释时别混用。

**Go 落地思路：**

用 `encoding/xml` 做结构化解码，`chardata` 拿值、`Name` 属性做键：

```go
type ciEventXML struct {
	XMLName xml.Name `xml:"Event"`
	System  struct {
		EventID     uint32 `xml:"EventID"`
		Correlation struct {
			ActivityID string `xml:"ActivityID,attr"`
		} `xml:"Correlation"`
	} `xml:"System"`
	EventData struct {
		Data []struct {
			Name  string `xml:"Name,attr"`
			Value string `xml:",chardata"`
		} `xml:"Data"`
	} `xml:"EventData"`
}
```

解析出来后按 `ActivityID` 建索引，把签名信息回填到拦截事件上。**这一步直接决定告警质量**：没有签名信息，只能说“被拦了”；有了签名信息，才能说“未签名文件被拦，父进程是 cmd.exe”。

```go
type CIEvent struct {
	EventID     int
	ActivityID  string
	FileName    string
	ProcessName string
	PolicyName  string
	Status      string
	SigTotal    int
	Enforcement string // enforce / audit / none
}

// ParseCIEvent 解析一条 CodeIntegrity 事件的 XML。
func ParseCIEvent(xmlData string) (CIEvent, error) {
	var raw ciEventXML
	if err := xml.Unmarshal([]byte(xmlData), &raw); err != nil {
		return CIEvent{}, err
	}
	ev := CIEvent{
		EventID:    int(raw.System.EventID),
		ActivityID: raw.System.Correlation.ActivityID,
	}
	for _, d := range raw.EventData.Data {
		switch strings.ToLower(strings.TrimSpace(d.Name)) {
		case "file name":
			ev.FileName = d.Value
		case "process name":
			ev.ProcessName = d.Value
		case "policyname":
			ev.PolicyName = d.Value
		case "status":
			ev.Status = d.Value
		case "totalsignaturecount":
			ev.SigTotal, _ = strconv.Atoi(strings.TrimSpace(d.Value))
		}
	}
	switch ev.EventID {
	case 3077, 3065:
		ev.Enforcement = "enforce"
	case 3076, 3064:
		ev.Enforcement = "audit"
	}
	return ev, nil
}

// CorrelateSignatures 按 ActivityID 索引 3089 签名事件。
func CorrelateSignatures(events []CIEvent) map[string]CIEvent {
	sigs := make(map[string]CIEvent)
	for _, ev := range events {
		if ev.EventID != 3089 || ev.ActivityID == "" {
			continue
		}
		sigs[ev.ActivityID] = ev
	}
	return sigs
}
```

### Q10：采集失败时结论应该怎么写？“CiTool 不存在”和“策略未启用”必须区分吗？

**通俗答案：**

必须区分，而且这是主机安全产品的基本功。三态结论：

- `clean`：采集成功，且未发现降级；
- `suspected`：采集成功，发现状态异常；
- `unknown`：**采集失败或数据不足以判断**。

**关键知识点：**

- CiTool 只在 Windows 11 22H2+ / Server 2025 自带。老系统上采集不到 CiTool 输出是**版本事实**，不能翻译成“未部署策略”。
- 权限不足、事件日志通道被关闭、Agent 组件异常，都会让采集静默失败。静默失败如果被当成“阴性结论”，就会产生**最危险的漏报**：客户以为有管控，实际是 Agent 挂了。
- 官方排障文档专门提到一类症状：“发生了应用失败，但完全没有 App Control 事件”。这时既可能是策略问题，也可能是日志通道/组件问题——**没有事件不等于没有拦截**。

**Go 落地思路：**

每个采集项都带来源和状态，缺失就显式表达：

```go
type Observation[T any] struct {
	Value  T
	Source string // citool / registry / eventlog / service
	State  string // ok / unsupported / denied / timeout / error
	Err    error
}
```

最终判定：任何关键面处于非 `ok` 状态，整体结论最高只能是 `unknown`，并在告警里写清“缺哪一面”。**这比给一个自信的“clean”有用得多。**

### Q11：应用控制降级怎么和正常变更区分？误报治理怎么做？

**通俗答案：**

正常变更和攻击在技术动作上几乎一样，区别只有三类证据：**授权、时序、可验证性**。

**关键知识点：**

1. **授权证据**：工单号 / 变更单 / Intune 策略下发记录。Go 侧可以接一个 `ChangeTicket` 字段，规则命中时关联。
2. **时序证据**：合规流程是“工单 → 策略下发 → 策略激活（3101/3102/3099）→ 业务验证”；攻击是“先改注册表 → 再观察有没有生效”，通常**没有对应的激活事件**，或者激活事件迟到。
3. **可验证性证据**：我方策略有固定签名者和版本号。**签名有效但不是我们签的**，等于恶意变更；**签名有效且是我们签的但版本偏旧**，等于回滚。

还有一个非常实用的误报抑制点：**审计模式（3076、8028）不是拦截事件**。它表示“本来会被拦但放行了”。很多团队把 3076 当成攻击事件，这是典型的误报源头。3076 的正确用法是**兼容性评估**——上线强制策略前先跑 audit，统计 3076 分布，再补规则。

**Go 落地思路：**

```go
// 降级判定要同时看"状态差分"和"授权上下文"
type DecisionInput struct {
	Baseline       AppControlState
	Current        AppControlState
	Ticket         string // 关联的变更单
	PolicySigner   string
	ExpectedSigner string
}
```

`Ticket` 非空且能匹配到“策略下发窗口”，则降级为审计级事件；`PolicySigner != ExpectedSigner` 且无工单，直接高危。

### Q12：客户说“某个程序打不开”，你怎么用这套数据定位？

**通俗答案：**

这是最常见的客户工单场景，路径非常固定：

1. **先分清方向**：是“被拦截了”还是“根本没被管控到”？看有没有 `3077`（强制模式拦截）或 `3065`/`3064`（DLL 拦截）。有 `3077` → 策略问题；没有任何拦截事件 → 可能是应用自身问题，别往安全方向硬扯。
2. **看文件名和父进程**：`3077` 的 Details 里有 File Name 和 Process Name（父进程），能直接告诉客户“哪个文件被拦、由谁启动”。
3. **看签名信息**：用 ActivityID 关联 `3089`，`TotalSignatureCount = 0` 就是未签名文件——这基本就是根因（自研程序、脚本生成的 exe、第三方小工具没做代码签名）。
4. **看策略模式**：只有 `3076`（audit）说明客户跑的是审计模式，程序没真被拦，那问题在应用自身；
5. **看策略激活状态**：`3099`/`3096` 确认策略已加载且是预期的那一份（`PolicyName`、`PolicyId` 都在 Details 里）；
6. **兜底**：让客户跑 `cidiag.exe /stop` 收集诊断包，官方排障文档就是这么推荐的。

**关键知识点：**

- 脚本类问题特别容易误判：AppLocker 的 `8029` 事件**只是脚本宿主做了查询**，真正是否阻断由宿主决定（PowerShell 会退到 Constrained Language Mode）。所以“8029 出现了”不等于“脚本被拦了”。
- 官方排障建议：如果怀疑是策略冲突，可以**临时换一份关闭脚本强制、或允许全部 COM 对象的策略**再复测。这是标准的二分定位法。

**Go 落地思路：**

做一个“客户问题定位助手”，输入客户给的程序路径和时间窗口，输出结构化结论：

```go
type SignatureInfo struct {
	TotalSignatureCount int
	Signed              bool
}

type TriageResult struct {
	Conclusion string // blocked_by_policy / audit_only_passed / not_policy_related / insufficient_data
	BlockEvent *CIEvent
	Signature  *SignatureInfo
	PolicyName string
	Advice     string
}
```

`Conclusion` 是**枚举**不是自由文本，Agent 才能基于它做自动回复或工单分类。

## Go 落地要点小结

1. **状态面建模**：WDAC、AppLocker、SAC 三套独立状态对象，不要合并成一个开关。
2. **三态结论**：`clean` / `suspected` / `unknown`，采集失败绝不等于阴性。
3. **意图与事实分离**：注册表是意图，`CodeIntegrity - Operational` 事件是事实，两者时间戳对齐才能判断“是否已生效”。
4. **基线差分优先**：只看当前值无法区分“本来没配”和“被关掉”。
5. **签名只是必要条件**：策略签名有效不代表是我们下发的版本，还要比对 GUID、哈希与签名者。
6. **官方工具优先**：`citool.exe -lp -json`、`cidiag.exe /stop`、`Get-AppLockerPolicy -Effective`，不要自己造轮子解析二进制策略。
7. **执行外部命令要克制**：`CommandContext` 超时 + 输出上限 + 不走 shell。
8. **低频轮询 + 事件驱动**：策略面变化慢，没必要高频采集。

## 学习要点 / 知识点速查

| 知识点 | 要点 |
| --- | --- |
| 应用控制模型 | allowlist，默认拒绝；WDAC 在内核 CI 层，AppLocker 在用户态 AppID 层 |
| AppLocker 规则集合 | EXE、MSI、Script、DLL、Packaged app；DLL 集合默认关闭 |
| AppLocker 注册表 | `SrpV2`（策略）、`AppidPlugins`（COM）、`Control\Srp\`（状态） |
| WDAC 策略文件 | 多策略格式 `{GUID}.cip`，单策略格式 `SiPolicy.p7b`，可存于 System 与 EFI 分区 |
| CiTool | `--list-policies/-lp`、`--update-policy/-up`、`--remove-policy/-rp`、`--refresh/-r`、`--device-id/-id`；仅 Win11 22H2+/Server 2025 |
| SAC 状态 | `HKLM\SYSTEM\CurrentControlSet\Control\CI\Policy\VerifiedAndReputablePolicyState`：0=Off，1=Enforce，2=Evaluation |
| 核心事件 | 3076 audit 拦截、3077 enforce 拦截、3089 签名信息、3099 策略加载、3097/3100 刷新失败 |
| 关联方式 | 拦截事件与 3089 用 `Correlation ActivityID` 关联 |
| 关联工具 | `citool.exe -lp -json`、`cidiag.exe /stop`、`certutil.exe -error <status>` |

## 小练习 / 复盘题

1. 客户主机是 Windows Server 2019，采集脚本发现 `citool.exe` 不存在。请写出你在采集报告里的结论措辞，并解释为什么不能写成“未部署应用控制”。
2. 某主机 `SrpV2\Exe\EnforcementMode` 从 `1` 变成 `2`，其他集合没变，`3076` 事件开始出现。这个改动是“降级”还是“灰度”？你会再查哪两条证据来定性？
3. `VerifiedAndReputablePolicyState` 被改成 `0`，但 `CodeIntegrity - Operational` 里没有 `3101`/`3102`/`3099`。此时 SAC 状态算不算已降级？告警级别怎么定？
4. 解释 `3076` 和 `3077` 的区别。为什么把 `3076` 直接当攻击事件会造成大量误报？
5. 某文件被拦截，日志里有一条 `3077` 和一条 `3089`。如果 `3089` 的 `TotalSignatureCount` 是 0，说明什么？如果是 1 且签名者不是我方证书，说明什么？
6. `citool.exe -lp -json` 的输出里出现两个 GUID，其中一个是 `{A244370E-44C9-4C06-B551-F6016E563076}`。结合官方排障文档，你怀疑什么问题？下一步查什么？
7. 设计一个“策略文件指纹”结构，至少包含哪些字段？为什么光有文件路径和修改时间不够？
8. 策略签名有效，但版本比我方基线旧，且没有变更单。请给出告警级别、理由，以及你会写进告警描述里的三句话。
9. 客户的 AppLocker 只配了 EXE 集合，DLL 集合是 `0`（未配置）。客户认为“Agent 报我们防护被降级”是误报。你怎么用数据解释？
10. 为什么 AppLocker 的 `8029` 事件不能等同于“脚本已被拦截”？它和 `3077` 在语义上差在哪？
11. 你的 Agent 以普通用户运行，读取 `HKLM\SYSTEM\CurrentControlSet\Control\CI\Policy` 失败。请设计状态表达，保证不会产生假阴性。
12. 给你的攻击链规则写一条：`策略降级` + `未签名进程启动` + `外联`。你会怎么定义三个节点的必要条件、时间窗口，以及避免把运维批量安装软件打成攻击链？

## 参考资料

- Microsoft Learn — Understanding App Control events：<https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/operations/event-id-explanations>
- Microsoft Learn — CiTool technical reference：<https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/operations/citool-commands>
- Microsoft Learn — App Control debugging and troubleshooting：<https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/operations/appcontrol-debugging-and-troubleshooting>
- Microsoft Learn — Application Control for Windows：<https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/appcontrol>
- Microsoft Learn — AppLocker technical reference：<https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/applocker/applocker-technical-reference>
- Microsoft Learn — AppLocker architecture and components：<https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/applocker/applocker-architecture-and-components>
- Microsoft Learn — Understanding AppLocker rule collections：<https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/applocker/understanding-applocker-rule-collections>
- Microsoft Learn — Using Event Viewer with AppLocker：<https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/applocker/using-event-viewer-with-applocker>

> 本文涉及的策略文件目录、`EnforcementMode` 具体取值、`citool.exe -lp -json` 的字段名等版本敏感项，需在目标主机核验后再落库；事件 ID 语义以上述微软官方文档为准。
