---
title: Go 主机安全面试：Windows 防火墙规则篡改与防护降级检测
date: 2026-11-09 17:10:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- windows
- firewall
- wfp
---

# Go 主机安全面试：Windows 防火墙规则篡改与防护降级检测

Windows Defender Firewall 在企业主机上常年开着，但它的"开着"这句话需要拆开看：三个 profile（Domain / Private / Public）的开关状态、防火墙策略（默认入站动作、是否允许入站规则）、具体规则集、以及真正做数据过滤的 WFP 过滤引擎，是四个可以分别被改的东西。

攻击者要做的不是"破解防火墙"，而是**让防火墙不再挡自己的路**。最低成本的做法是 `netsh advfirewall set allprofiles state off`；稍微讲究一点的会直接改注册表、或者干脆绕过策略层、在 WFP 过滤引擎里塞一条自己的允许规则。这条链路的每一个环节都不需要提权到 SYSTEM——一个管理员 shell 就够了。

这类题考的是三件事：**Windows 防火墙的策略层和执行层分别是什么**；**改防火墙会留下哪些可采集的痕迹**；**怎么区分"运维改防火墙"和"攻击者关防火墙"**。最后一条才是主机安全产品真正难的地方，因为防火墙变更在企业里几乎每天都在发生。

文中 API、命令、注册表路径与事件 ID 均以 Microsoft Learn 官方文档为准；涉及 WFP 内核 callout 的部分标注了资料来源的层级。

## 岗位场景

```text
攻击者通过 Web RCE / 钓鱼载荷进入 Windows 主机
  -> 已经拿到本地管理员（或通过提权拿到）
  -> 判断主机有 EDR 拦截，先看防火墙状态
  -> netsh advfirewall set allprofiles state off
     （或直接写注册表 EnableFirewall=0，或加一条 WFP 允许规则）
  -> 关闭 EDR 的上传通道 / 放行外联端口 / 放行 C2 端口
  -> 后续行为：下载载荷、横向移动、建立持久化
  -> Go Agent 需要回答四个问题：
     1) 谁、什么时候、用什么方式改的（进程 / 账号 / 命令行）
     2) 改的是策略层还是执行层（关整档 vs 加单条允许）
     3) 变更是否偏离基线、是否与工单匹配
     4) 关闭防火墙之后紧跟着出现了什么行为（关联链条）
```

注意第二问。这是区分"配置漂移"和"主动降防护"的关键：运维加一条允许某程序入站的规则，和攻击者把整档防火墙关掉，在告警语义上完全不是一回事，前者是常规变更，后者是明确的防护降级。

## 高频面试题

### 1. Windows 防火墙由哪几层组成？策略层和执行层分别管什么？

**简洁答案：** 至少要分成三层。**策略/管理层**是 Windows Defender Firewall 服务（`MpsSvc`）加上 `netsh advfirewall`、NetSecurity PowerShell cmdlet、控制面板和组策略，负责"配置长什么样"；**执行层**是 Windows Filtering Platform（WFP），由 `netio.sys` 里的过滤引擎实现，负责"数据包到底放不放行"；**持久层**是 Base Filtering Engine（BFE）服务，持有过滤器的持久化规则库。

**关键知识点：**

- WFP 的过滤器是分层的（layer），常见的有 `ALE_AUTH_CONNECT`（出站连接授权）、`ALE_AUTH_RECV_ACCEPT`（入站接收授权）、`NWEP`（网络层）等，每层有多个 sublayer，规则按 sublayer 权重和优先级求值。
- WFP 支持三类处置：`Permit`（允许）、`Block`（阻止）、`Callout`（交给注册的 callout 决定）。callout 可以是内核驱动，也可以是用户态的 BFE 回调。
- 关键推论：**关掉策略层不等于关掉引擎**。`MpsSvc` 停止后，过滤引擎里已持久化的规则依然在生效；反过来，攻击者也可以完全不动策略层，直接往引擎里塞规则。这两层必须分开采集。
- 微软明确表示**不支持停止 `MpsSvc`**，正确做法是禁用各个 profile 的防火墙（`Set-NetFirewallProfile -Enabled False`）。这条不是小细节——它决定了"服务被停"应该被当成什么信号。

**Go 落地思路：** Agent 的防火墙采集至少要分两个通道：策略层（profile 状态、策略动作、规则集变化、服务状态）和执行层（WFP 过滤引擎状态）。只做策略层，会漏掉绕过策略层直接改引擎的攻击；只做执行层，则无法回答"用户看到的防火墙面板是什么状态"。

### 2. 攻击者关闭或削弱防火墙有哪几条路径？各自留下什么痕迹？

**简洁答案：** 至少六条路径，痕迹各不相同，这决定了检测不能只押一条数据源。

| 路径 | 典型动作 | 主要痕迹 |
| --- | --- | --- |
| 命令行关整档 | `netsh advfirewall set allprofiles state off` | 进程命令行、Security 日志 4950、profile 注册表值变 0 |
| 直接改注册表 | 写 `HKLM\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\*\EnableFirewall = 0` | 注册表值变化（**不产生 MPSSVC 规则审计事件**）、profile 状态变化 |
| PowerShell | `Set-NetFirewallProfile -All -Enabled False` | PowerShell 事件 4103/4104、Security 日志 4950 |
| 改组策略路径 | 写 `HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\*\EnableFirewall = 0` | 注册表值变化、GPO 相关事件（视变更方式而定） |
| 改策略而非开关 | `Set-NetFirewallProfile -DefaultInboundAction Allow`、`-AllowInboundRules False` | Security 日志 4950、profile 策略值变化 |
| 加/改规则 | `New-NetFirewallRule ...`、删阻断规则 | Security 日志 4946/4947/4948、规则集基线差异 |
| 绕过策略层 | 直接调 `FwpmFilterAdd0` 加允许 filter / sublayer | **没有** MPSSVC 事件，只有 WFP 状态差异或进程行为 |
| 禁用服务 | `sc config MpsSvc start= disabled` | `Services\MpsSvc\Start` 注册表值变化（需重启才完全生效） |

**关键知识点：**

- `netsh advfirewall` 的 profile 关键字是 `domainprofile` / `privateprofile` / `publicprofile`，状态是 `on` / `off`。`set allprofiles state off` 会一次改三个 profile。
- 注册表路径有两个，含义不同（见第 5 题），本地路径下的子键是 `DomainProfile` / `PrivateProfile` / `PublicProfile`。
- `Set-NetFirewallProfile` 的 `-Enabled` 默认作用于 `PersistentStore`；`-DefaultInboundAction` 的合法值是 `NotConfigured` / `Block` / `Allow`。
- 规则级审计事件来自 `MPSSVC.exe`，**直接改注册表不会触发这些事件**——事件驱动通道在这里是有盲区的。

**Go 落地思路：** 把上表当作"采集需求矩阵"：每一行对应至少一个采集源，缺哪一行就在 Agent 自检里报能力缺口，而不是默默少报。

### 3. 防火墙相关的 Security 日志事件 ID 分别代表什么？审计没开怎么办？

**简洁答案：** 规则与设置级变更走的是 Security 日志的 `MPSSVC` 事件族，核心 ID 是 4944–4958：

- `4944` 防火墙启动时加载的**活动策略**（ActiveStore 内容）
- `4945` 防火墙启动时列出的**活动规则**
- `4946` **新增**了防火墙规则
- `4947` **修改**了防火墙规则
- `4948` **删除**了防火墙规则
- `4949` 防火墙恢复到**默认规则**
- `4950` 防火墙的**设置/配置项**发生变更（profile 开关、策略动作属于这一类）
- `4951`–`4953` 某条规则被**忽略**，原因分别是规则无效、规则冲突、无法应用
- `4954` 组策略的防火墙设置被更改
- `4956` 活动的 profile 集合发生变更
- `4957` / `4958` 某条规则因错误未能应用

**关键知识点：**

- 这些事件挂在 Security 日志的 **"Audit MPSSVC Rule-Level Policy Change"** 子类别下。可以用 `auditpol /get /subcategory:"Audit MPSSVC Rule-Level Policy Change"` 确认当前策略是否启用。
- **审计没启用 = 这条通道完全沉默**。这时"没有 4946 事件"不能推出"没有规则变更"。
- `4951`–`4953` 和 `4957`–`4958` 是"应用失败"，从防守角度看它们同样是信号：说明有人提交了一条非法或冲突的规则。
- `4945` 这类"启动时活动规则"事件可以作为**开机时刻的基线快照**，用来和运行期的增量做对比。

**Go 落地思路：** Agent 要把"审计子类别是否启用"作为一个显式的**采集能力状态**上报到控制台，而不是让"没事件"和"没变更"共用同一个表达。缺采集能力时，规则结论要降级为"未知"，不能报"安全"。

### 4. 怎么区分"运维改防火墙"和"攻击者关防火墙"？

**简洁答案：** 单靠事件本身区分不了，必须引入四个维度的上下文做组合判定：**主体**（谁改的）、**过程**（用什么进程/命令行）、**语义**（改了什么）、**时序**（改完之后发生了什么）。

**关键知识点：**

- **主体**：SYSTEM / 域管理员 / 运维工单账号 / 已失陷账号。Winlogon、安全软件自身的健康检查账号，需要单独归类。
- **过程**：`netsh.exe`、`powershell.exe`、WMI、远程执行框架。要区分"域管控统一下发"（通常伴随 GPO 事件 4954 或 `gpupdate` 痕迹）和"交互式命令行"。
- **语义**：这是最有效的降噪维度。规则级变更里，**关闭整个 profile**、**默认入站动作改成 Allow**、**关闭入站规则例外**、**禁用服务启动类型**，这四类是高危形态；新增一条窄范围允许规则是常规形态。给不同形态不同权重，比按"是否发生变更"告警实用得多。
- **时序**：关防火墙之后 5 分钟内出现新的外联、新的服务落地、新的凭据访问，才是完整的攻击链证据。单看防火墙变更，最多是"疑似"。
- **工单匹配**：企业环境里最有效的降噪手段之一。变更窗口 + 变更单号 + 责任人三者对不上，才升级。

**Go 落地思路：** 判定函数要写成**纯函数**：输入是结构化证据（profile 状态、变更事件、进程信息、时间窗），输出是结论 + 理由 + 置信度分层。这样才能被单测覆盖，也才能在客户现场被逐条复核。

### 5. 本地注册表和组策略注册表都写了 `EnableFirewall`，以谁为准？

**简洁答案：** 组策略路径优先，本地路径是"本地设置"，两者可能不一致，所以必须都读，并且要区分"本地值"和"生效值"。

**关键知识点：**

- 组策略路径：`HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\{DomainProfile,PrivateProfile,PublicProfile}\EnableFirewall`。
- 本地路径：`HKLM\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\{DomainProfile,PrivateProfile,PublicProfile}\EnableFirewall`。
- 组策略里的 `EnableFirewall` 优先级高于本地注册表值，而且**控制台显示的开关状态也可能和本地注册表值对不上**——这类"显示与实际不一致"的情况在企业里并不罕见。
- 真正判断"当前生效状态"应该读 ActiveStore，而不是本地注册表。PowerShell 侧对应 `Get-NetFirewallProfile -PolicyStore ActiveStore`，可选的 store 包括 `ActiveStore` / `PersistentStore` / `ConfigurableServiceStore` / `StaticServiceStore` / `SystemDefaults` / `RSOP`。
- 规则集本身也存在多 store 的问题：GPO 下发的规则和本地规则可能在不同 store，改本地规则不生效，这是另一个常见误报来源。

**Go 落地思路：** 数据结构里显式区分三层值——`localValue`、`gpoValue`、`effectiveValue`。只存一个 `enabled` 布尔值是不够的，客户问"我明明在界面上看到防火墙是开的"时，答案就在这三层的差异里。

### 6. WFP 执行层能做什么用户态看不到的事？怎么采？

**简洁答案：** 用户态可以直接调 `FwpmFilterAdd0`（在 `fwpuclnt.dll`）往过滤引擎里加 filter 和 sublayer，可以指定方向、层、条件（端口、地址、接口、进程路径等）和处置；加 `FWPM_FILTER_FLAG_PERSISTENT` 标记的过滤器会跨 BFE 重启存活。内核侧则可以注册 callout 驱动（`FwpsCalloutRegister`），配合 `FWPM_CALLOUT_FLAG_PERSISTENT` 实现跨重启存活，而且 callout 可以自己决定放行还是阻断。

**关键知识点：**

- **sublayer 权重决定求值顺序**。把一个允许 filter 放到高权重 sublayer，就能压过系统默认的阻断逻辑，这是绕过策略层最直接的手法。
- 用户态加 filter 的调用方是 `fwpuclnt.dll`，命令行上**看不到 `netsh`**，只看进程名很可能漏判。
- WFP 状态可以用官方命令导出：`netsh wfp show state`（可加 `file=` 输出到文件）、`netsh wfp show filters`、`netsh wfp show sublayer`，以及 `netsh wfp capture start` 做实时抓取。微软的 eBPF for Windows 文档也推荐用 `netsh wfp show state` 导出的文件做诊断。
- `wfpstate.xml` 是 WFP 的**状态导出格式**，里面包含 layers、filters、sublayers、callouts 等信息，是做执行层基线的天然输入。

**Go 落地思路：** 不要把"全量解析 wfpstate.xml"放进常规轮询。做法是：先对导出结果算摘要哈希，哈希不变就跳过；变了才拉全量做字段级 diff，定位到具体的 filter key / provider / sublayer 权重。

### 7. 禁用防火墙服务（MpsSvc / BFE）会留下事件吗？

**简洁答案：** 不会有防火墙规则审计事件。`MPSSVC` 事件族覆盖的是规则与设置变更，服务启动类型的修改属于服务配置变更，不在那个子类别里。

**关键知识点：**

- 服务相关的痕迹在别处：`HKLM\SYSTEM\CurrentControlSet\Services\MpsSvc\Start`（以及 `BFE\Start`）的 `Start` 值变化；`sc config`、`sc stop` 的命令本身只出现在进程事件里。
- `BFE`（Base Filtering Engine）是承载 WFP 过滤引擎的服务，`MpsSvc` 依赖它；把 `BFE` 的启动类型改成 disabled 属于典型的**为重启后持久化做准备**的动作。
- 微软明确说明停止 `MpsSvc` **不受支持**，所以正常运维路径是禁用 profile。这意味着：**profile 状态是主判据，服务启动类型变化是高危伴随信号**，而不是反过来。
- 服务配置变化可以靠 WMI 事件（`Win32_Service` 的状态变化）、SCM 的 ETW 通道，以及注册表值监控来覆盖。

**Go 落地思路：** 把"profile 被关"和"服务启动类型被改"设计成一条攻击链上的两个阶段事件：前者是防护降级，后者是持久化准备。后者不需要等重启生效就能告警——这是它最有价值的地方。

### 8. Hyper-V、WSL、Windows 容器场景下，防火墙规则会被频繁改动，会不会全是误报？

**简洁答案：** 会，而且量不小。这类环境必须单独处理。

**关键知识点：**

- Hyper-V 虚拟机交换机的防火墙规则由 `New-NetFirewallHyperVRule` / `Get-NetFirewallHyperVRule` 管理，和宿主机 profile 规则是**两套**。规则里带 `VMCreatorId` 标识归属的虚拟机。
- 虚拟机级设置由 `New-NetFirewallHyperVVMSetting` / `Set-NetFirewallHyperVVMSetting` 管理，`-DefaultInboundAction Allow` 这类设置只影响该 VM 的虚拟交换机流量。
- WSL2 会有自己专属的 `VMCreatorId`（`{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}`），它的规则随 WSL 发行版安装/卸载动态增删。
- Windows 容器、Hyper-V 隔离、Docker Desktop 都会动态调整 NAT 与虚拟网卡规则；这些变化是**功能性的、可预期的**。
- 结论：规则基线必须按 **store + creator + 作用域**分组，宿主机 profile 规则和虚拟化/容器规则分开建基线，否则误报量会淹没告警。

**Go 落地思路：** 归一化规则 key 的时候把 `VMCreatorId` / `policyStore` / 作用域一起纳入；对属于已知虚拟化 creator 的规则走独立的基线与更低的默认权重。

### 9. Go Agent 怎么在低开销的前提下采全这些证据？

**简洁答案：** 分三层采样——**事件驱动层**订阅 Security 日志的 MPSSVC 事件；**周期快照层**读 profile 注册表值、服务状态、规则集摘要；**按需深度层**在快照变化时再导出 WFP 状态做 diff。

**关键知识点：**

- 周期层绝对不要每轮跑 `netsh advfirewall show allprofiles`：它会 fork 进程、输出大段文本、在高并发主机上放大开销。profile 开关状态直接读注册表更便宜也更稳。
- 规则集的"是否变化"用**归一化 key 的集合哈希**判定，不要每次都拉全量规则再逐条比。
- 事件层在 Go 里有个现实问题：标准库和 `golang.org/x/sys/windows` 都没有 `wevtapi` 的完整封装。要么自己按 `EvtSubscribe` / `EvtNext` 声明 syscall，要么评估第三方封装——引入前先评估依赖数量和维护成本，符合 KISS 的做法是先用**轮询 Security 日志**这种土办法顶住，把事件订阅作为后续优化。
- 采集器要有**自检**：audit 子类别是否启用、服务是否存在、注册表路径是否可读、快照是否过期。自检结果本身是一条可观测事件。

**Go 落地思路：** 见下面代码。`parseAllProfiles` 解析 `netsh advfirewall show allprofiles` 的输出作为**兜底/校验通道**，主力通道是注册表；`classify` 是纯函数判定，便于单测。

```go
package fwprofile

import (
	"bufio"
	"strings"
)

// ProfileState 描述单个 profile 的状态。
type ProfileState struct {
	Name    string // Domain / Private / Public
	Enabled bool
	Policy  string // 例如 BlockInbound,AllowOutbound
}

// parseAllProfiles 解析 netsh advfirewall show allprofiles 的输出。
// 输出格式随系统版本略有差异，解析必须容错：块头形如
// "Domain Profile Settings:"，块内形如 "State                                 ON"。
func parseAllProfiles(out string) []ProfileState {
	var (
		states []ProfileState
		cur    *ProfileState
	)
	flush := func() {
		if cur != nil {
			states = append(states, *cur)
			cur = nil
		}
	}

	scanner := bufio.NewScanner(strings.NewReader(out))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		switch {
		case strings.HasSuffix(line, "Profile Settings:"):
			flush()
			name := strings.TrimSuffix(line, ":")
			name = strings.TrimSpace(strings.TrimSuffix(name, "Profile Settings"))
			cur = &ProfileState{Name: name, Enabled: true}
		case cur != nil && strings.HasPrefix(line, "State"):
			cur.Enabled = strings.EqualFold(strings.TrimSpace(strings.TrimPrefix(line, "State")), "ON")
		case cur != nil && strings.HasPrefix(line, "Firewall Policy"):
			cur.Policy = strings.TrimSpace(strings.TrimPrefix(line, "Firewall Policy"))
		}
	}
	flush()

	return states
}
```

```go
package fwprofile

import (
	"golang.org/x/sys/windows/registry"
)

const (
	localProfilePath = `SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy`
	gpoProfilePath   = `SOFTWARE\Policies\Microsoft\WindowsFirewall`
)

// readEnableFirewall 读取某个 profile 的 EnableFirewall 值。
// source 取 "local" 或 "gpo"。键或值不存在时返回 (0, false, nil)，
// 表示"没有这个值"，而不是"值为 0"。
func readEnableFirewall(source, profile string) (uint32, bool, error) {
	base := localProfilePath
	if source == "gpo" {
		base = gpoProfilePath
	}

	key, err := registry.OpenKey(registry.LOCAL_MACHINE, base+`\`+profile, registry.QUERY_VALUE)
	if err != nil {
		if err == registry.ErrNotExist {
			return 0, false, nil
		}
		return 0, false, err
	}
	defer key.Close()

	value, _, err := key.GetIntegerValue("EnableFirewall")
	if err != nil {
		if err == registry.ErrNotExist {
			return 0, false, nil
		}
		return 0, false, err
	}
	return uint32(value), true, nil
}
```

```go
package fwprofile

import (
	"fmt"
	"strings"
	"time"
)

// Verdict 是判定结论。no_data 表示采集缺失，不能当成安全。
type Verdict string

const (
	VerdictNormal   Verdict = "normal"
	VerdictSuspect  Verdict = "suspect"
	VerdictDegraded Verdict = "degraded"
	VerdictNoData   Verdict = "no_data"
)

// ChangeEvent 是一次防火墙变更的结构化表示。
type ChangeEvent struct {
	EventID   uint32    // 4946 新增 / 4947 修改 / 4948 删除 / 4950 设置变更 / 4954 GPO
	Profile   string    // Domain / Private / Public
	Action    string    // Allow / Block
	Direction string    // Inbound / Outbound
	Program   string    // 规则关联的程序路径
	Actor     string    // 变更主体
	Process   string    // 发起进程
	At        time.Time // 变更时间
}

// profileSubKeys 三个 profile 的标识，注册表子键名与之一致。
var profileSubKeys = []string{"DomainProfile", "PrivateProfile", "PublicProfile"}

// ProfileSnapshot 是某一时刻的 profile 状态快照。
type ProfileSnapshot struct {
	Enabled    map[string]bool // profile -> 是否启用
	LocalValue map[string]bool // 本地注册表值
	GPOValue   map[string]bool // 组策略值
}

// classify 是纯函数判定：同样的输入必须给出同样的结论，便于单测和客户复核。
func classify(snap ProfileSnapshot, events []ChangeEvent, auditEnabled bool) (Verdict, string) {
	if !auditEnabled {
		return VerdictNoData, "MPSSVC 审计子类别未启用，规则变更不可见"
	}

	// 1) 整档被关闭：最强的防护降级信号。
	for _, profile := range profileSubKeys {
		if snap.Enabled[profile] == false {
			return VerdictDegraded, fmt.Sprintf("profile %s 的防火墙被关闭", profile)
		}
	}

	// 2) 本地值与组策略值冲突：需要人工确认哪一侧生效。
	for _, profile := range profileSubKeys {
		local, hasLocal := snap.LocalValue[profile]
		gpo, hasGPO := snap.GPOValue[profile]
		if hasLocal && hasGPO && local != gpo {
			return VerdictSuspect, fmt.Sprintf("profile %s 的本地值(%v)与组策略值(%v)不一致", profile, local, gpo)
		}
	}

	// 3) 变更语义：新增放行规则比改设置更值得看。
	for _, e := range events {
		if e.Action == "Allow" && e.EventID == 4946 && isUserWritable(e.Program) {
			return VerdictSuspect, fmt.Sprintf("新增放行规则且目标程序位于用户可写路径: %s", e.Program)
		}
	}

	return VerdictNormal, "未发现偏离基线的防火墙变更"
}

// isUserWritable 是占位实现：生产环境应基于文件属主与 ACL 判断，
// 而不是简单看路径前缀。
func isUserWritable(program string) bool {
	return program != "" && !strings.HasPrefix(strings.ToLower(program), `c:\windows\`)
}
```

### 10. 防火墙规则的基线应该怎么建，才不会被正常变更淹没？

**简洁答案：** 不要对全量规则做快照比对，只对**高危语义**建基线；规则要归一化成稳定 key 再做集合差分。

**关键知识点：**

- 归一化 key 至少要包含：`profile | direction | action | protocol | localPort | remoteAddress | program | service`。`Program` 必须转成绝对路径并统一大小写，否则同一条规则会因为写法差异产生噪声。
- 需要单独盯住的"高危语义"只有四类：**整档关闭**、**默认入站动作改 Allow**、**关闭入站规则例外**（相当于全放行）、**服务启动类型被改**。其余规则变更走低优先级。
- 规则新增和规则删除的风险不对称：**删除一条阻断规则**的风险高于新增一条允许规则，因为前者往往直接放开了原本被挡住的东西。
- 基线应当是"允许集合 + 变更白名单"的形式，而不是"全量规则快照"：企业每周都会有规则增删，全量快照会把变更历史变成噪音。
- 规则里 `Program` 指向用户可写目录的（例如 `C:\Users\Public\`、`C:\ProgramData\`）要单独提权，因为这类规则常被用来配合"落地即执行"。

**Go 落地思路：** 归一化和摘要要放在同一个包里，避免"采集用一种拼法、检测用另一种拼法"这种最常见的漏报来源。归一化是纯字符串处理，单元测试成本极低，值得覆盖路径大小写、前后空格、空字段这些边界；摘要函数保证同一规则集合总是得到同一个值，才能用来做"是否变化"的判定。

```go
package fwprofile

import (
	"crypto/sha256"
	"encoding/hex"
	"sort"
	"strings"
)

// NormalizeRule 把一条规则归一化成稳定的比对 key。
func NormalizeRule(profile, direction, action, protocol, localPort, program string) string {
	parts := []string{profile, direction, action, protocol, localPort, program}
	for i := range parts {
		parts[i] = strings.ToLower(strings.TrimSpace(parts[i]))
	}
	return strings.Join(parts, "|")
}

// RuleSetDigest 对归一化后的规则集合求摘要。
// key 集合排序后再拼接，保证同一集合总是得到同一摘要。
func RuleSetDigest(keys []string) string {
	sorted := append([]string(nil), keys...)
	sort.Strings(sorted)
	sum := sha256.Sum256([]byte(strings.Join(sorted, "\n")))
	return hex.EncodeToString(sum[:])
}
```

### 11. 客户说"我们没关过防火墙"，Agent 却报了整档关闭，你怎么排查？

**简洁答案：** 按"证据可信度 → 生效状态 → 变更来源 → 后续行为"四步走，每一步都要能自证。

**关键知识点：**

1. **先确认结论本身**：把本地注册表值、组策略值、netsh 输出、ActiveStore 四者放一起对。四个值不一致时，先解释不一致的来源，再谈告警。
2. **确认采集是否可信**：Agent 是否在变更时刻就在线？审计子类别当时是否启用？是否存在 Agent 重启导致的快照窗口？`no_data` 的结论不能用来反驳客户。
3. **确认变更来源**：从 4946/4947/4948/4950 事件取 Actor 和 Process，再回溯进程执行事件，看 `netsh.exe` / `powershell.exe` 的完整命令行、父进程、会话 ID。远程执行框架（WMI、WinRM、PsExec 类工具）会留下明显的父进程特征。
4. **确认业务影响**：改完之后有没有新外联、新服务、新计划任务。这一步决定最终是"配置事故"还是"攻击链片段"。

**Go 落地思路：** 排障结论必须能复现。把告警里的判定输入（快照 + 事件 + 进程信息）原样打包成一个 JSON，交给一个离线 `classify` 跑一遍，能得到同样结论才算闭环。

## Go 落地思路

一个务实的实现可以分成四层：

1. **快照层**：周期读取三个 profile 在本地路径和组策略路径下的 `EnableFirewall`，加上 `MpsSvc` / `BFE` 的 `Start` 值，形成带时间戳的状态快照。快照要能表达"值不存在"和"值为 0"这两种不同状态。
2. **事件层**：订阅或轮询 Security 日志的 MPSSVC 事件族，把 4946/4947/4948/4950/4954 归一化成统一的变更事件结构。审计未启用时上报能力缺口。
3. **执行层**：按需导出 WFP 状态，用摘要哈希做变化检测，变化时才做字段级 diff，重点关注 sublayer 权重、新增的高权重允许 filter 和新出现的 callout。
4. **关联层**：把防火墙变更和进程执行、外连、服务落地放进同一条时间线。整档关闭 + 紧接外联 → 高危；单纯新增一条窄规则且有工单 → 降级为信息。

降噪的三条硬规则：

- 按**变更语义**分级，不按"是否发生变更"告警。
- 虚拟化 / 容器 / WSL 的规则按 creator 分组，与宿主机 profile 规则分开建基线。
- 白名单绑定"账号 + 工单号 + 时间窗"三元组，而不是绑定命令字符串。

## 学习要点

- Windows 防火墙是**策略层（MpsSvc）+ 执行层（WFP）+ 持久层（BFE）** 的组合，关掉策略层和改掉执行层是两种不同的攻击手法，需要两套采集。
- MPSSVC 事件族覆盖规则与设置变更（4944–4958），但**直接改注册表不产生这些事件**——事件通道有盲区，快照通道必须顶上。
- 组策略路径 `HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall\*` 优先于本地路径 `...\SharedAccess\Parameters\FirewallPolicy\*`，两者不一致时要分开呈现。
- 微软明确**不支持停止 `MpsSvc`**，正规做法是禁用 profile。所以"profile 状态"是主判据，"服务启动类型被改"是持久化准备的高危伴随信号。
- WFP 用户态可直接加 filter/sublayer（`FwpmFilterAdd0`），加持久化标记即可跨重启存活；sublayer 权重可以压过系统默认阻断逻辑。
- Hyper-V / WSL / 容器会动态改写规则并带有专属 `VMCreatorId`，不做分组基线就是误报制造机。
- 判定函数要写成纯函数，输出"结论 + 理由 + 是否存在采集缺口"，让规则层和客户复核都基于同一份事实。

## 小练习

1. 在测试机上用 `netsh advfirewall show allprofiles` 抓一次完整输出，列出三个 profile 各自的 State、Firewall Policy、Logging 段结构，说明为什么解析器要按"块头 + 行前缀"而不是按固定行号来做。
2. 分别用 `netsh advfirewall set allprofiles state off`、`Set-NetFirewallProfile -All -Enabled False`、直接写本地注册表 `EnableFirewall=0` 三种方式关闭防火墙，记录各自在 Security 日志里留下了哪些事件 ID、留下了哪些没有。解释"没事件"的三种不同原因。
3. 写一个最小 Go 程序读取 `HKLM\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\{Domain,Private,Public}Profile` 的 `EnableFirewall`，并用第 5 题的规则同时读取 `HKLM\SOFTWARE\Policies\Microsoft\WindowsFirewall` 下的同名值，输出三列对比表（local / gpo / 是否冲突）。
4. 用 `auditpol /get /subcategory:"Audit MPSSVC Rule-Level Policy Change"` 在一台未启用该子类别的主机上验证，然后新增一条 `New-NetFirewallRule` 放行规则，确认确实没有 4946 事件，说明这条采集通道的盲区以及如何用快照补齐。
5. 导出一次 `netsh wfp show state` 的结果，统计其中的 layers、filters、sublayers、callouts 数量，并设计一个"只保留 sublayer 权重 + filter 处置 + 关联 program"三元组的归一化摘要函数，说明为什么不需要对整个 XML 做全量 diff。
6. 为"整档关闭"设计一条规则，并列出至少四个真实误报来源（例如安全软件自保护联动关闭、应急排障临时放行、Hyper-V 动态调整、组策略刷新），为每条给出降噪手段。
7. 在测试机上启用 Hyper-V 或 WSL，观察防火墙规则随虚拟机 / 发行版安装卸载的变化，说明 `VMCreatorId` 在归一化 key 里扮演什么角色，以及如果不分组会导致什么量级的误报。
8. 为"客户说没关过防火墙"写一份排障清单，逐项说明要采集什么证据、期望看到什么结果、如何区分"结论错误"和"客户记忆错误"。

## 复盘

这道题的核心不是记住几个事件 ID，而是理解一条**分层防护链的结构**：策略层决定配置长什么样，执行层决定数据包走不走，持久层决定重启后还在不在，事件通道决定我们事后看不看得见。

能把这四层分开讲清楚，能说清每一层的采集手段、失效表现和误报来源，能在结论里区分"防火墙是关的"和"防火墙关了但我们没证据"，并且能把"运维改防火墙"和"攻击者关防火墙"用上下文而不是单条事件区分开——回答就达到了主机安全岗位对"检测自身有效性"的要求。

## 参考资料

- [Microsoft Learn：Get-NetFirewallProfile](https://learn.microsoft.com/en-us/powershell/module/netsecurity/get-netfirewallprofile)
- [Microsoft Learn：Set-NetFirewallProfile](https://learn.microsoft.com/en-us/powershell/module/netsecurity/set-netfirewallprofile)
- [Microsoft Learn：New-NetFirewallRule](https://learn.microsoft.com/en-us/powershell/module/netsecurity/new-netfirewallrule)
- [Microsoft Learn：netsh advfirewall](https://learn.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-advfirewall)
- [Microsoft Learn：Windows Filtering Platform](https://learn.microsoft.com/en-us/windows/win32/fwp/windows-filtering-platform-start-page)
- [Microsoft Learn：Using the Windows Filtering Platform (Windows 10)](https://learn.microsoft.com/en-us/windows-hardware/drivers/network/using-the-windows-filtering-platform--windows-10-)
- [Microsoft Learn：Filtering Platform Driver Callout Design](https://learn.microsoft.com/en-us/windows-hardware/drivers/network/filtering-platform-driver-callout-design)
- [Microsoft Learn：Filtering Platform Callout Driver Samples](https://learn.microsoft.com/en-us/samples/microsoft/windows-driver-samples/filtering-platform-callout-driver-samples/)
- [Microsoft Learn：eBPF for Windows 诊断与 netsh wfp show state](https://learn.microsoft.com/en-us/windows/ebpf-for-windows/deployment-and-troubleshooting)
- [Microsoft Learn：New-NetFirewallHyperVRule](https://learn.microsoft.com/en-us/powershell/module/netsecurity/new-netfirewallhypervrule)
- [Microsoft Learn：Set-NetFirewallHyperVVMSetting](https://learn.microsoft.com/en-us/powershell/module/netsecurity/set-netfirewallhypervvmsetting)
- [Microsoft Learn：auditpol 命令](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/auditpol)
- [Microsoft Learn：安全事件 ID（防火墙规则与设置变更 4944-4958）](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/security-event-ids)
- [Microsoft Learn：netsh advfirewall 上下文参考](https://learn.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-advfirewall-context)
