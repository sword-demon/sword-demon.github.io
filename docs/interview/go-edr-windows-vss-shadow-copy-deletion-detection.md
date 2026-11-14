---
title: Go 主机安全面试：Windows 卷影副本（VSS）删除与恢复能力破坏检测
date: 2026-11-14 17:05:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- windows
- vss
- ransomware
---

# Go 主机安全面试：Windows 卷影副本（VSS）删除与恢复能力破坏检测

勒索软件最容易被讲出来的一步是"加密文件"，但真正让它变成灾难的，是加密**之前**那一步：把系统的退路一条条掐掉。

卷影副本（Volume Shadow Copy，VSS）就是这些退路之一。它是 Windows 自带的"某一时刻的一致性快照"机制，系统还原点、系统保护、Windows 系统状态备份，乃至 SQL Server、Exchange、VMware 这类依赖快照的业务，全部建立在它之上。攻击者只要把影子副本删干净、把影子存储配额改小、把 WinRE 和 `recoveryenabled` 关掉，受害者即使拿着备份，也可能发现"机器上根本没有可回滚的状态"。

这类检测的难点不在于"找到那条命令"，而在于回答一个更难的问题：**你怎么证明"没有"是正常的？**

## 岗位场景

```text
客户：Windows 10 文件服务器，凌晨 2 点起大量文件被改名为 .encrypted
Agent 上报：批量文件改写 + 高熵写入，但"可用还原点数量 = 0"
客户：我这台机器开着系统保护，为什么一个还原点都没有？

排查方向：
  1) 影子副本是被显式删除的，还是本来就一个都没有？
  2) 影子存储配额（shadow storage）是不是被改小了，导致以后也创建不出来？
  3) WinRE / BCD recoveryenabled / 系统还原开关，是不是同时被关了？
  4) 服务器自己的备份（wbadmin / 第三方备份）是不是也被清空了？

交付要求：
  - 给出"恢复能力破坏"的独立信号，不和加密行为混成一个告警
  - 给出误报口径：多少台机器在正常情况下就是"零影子副本"
  - 给出采集边界：Agent 权限不足 / VSS 服务被停时，结论如何表达
```

## 高频面试题

### 1. 卷影副本（VSS）到底是什么？勒索软件为什么要先删它？

**简洁答案：** VSS 是 Windows 的卷影副本服务，它能在一个**特定时间点**为某个卷创建一份一致性的逻辑快照，快照存放在该卷的 `System Volume Information` 中。系统还原点、系统保护、Windows 系统状态备份、很多第三方备份软件的"崩溃一致快照"，底层都是它。勒索软件删它不是为了加密，而是为了**断掉退路**：受害者在被勒索后无法回滚到加密前的状态，只能付款。顺带一提，影子副本本身也会占磁盘空间，删掉它还能让后续加密过程更快。

**关键知识点：**

- 快照是**按卷**创建的，`C:` 有自己的快照，`D:` 有自己的，互不相关。
- 快照由 `Volume Shadow Copy` 服务（`VSS`）和 `Software Shadow Copy Provider` 服务（`swprv`）协作完成，两者都是**按需启动**，平时不常驻是正常现象。
- 快照数据放在 `System Volume Information` 这个受保护目录里，**普通文件监控（Sysmon ID 11、inotify、EDR 的文件创建钩子）看不到里面的内容**。
- 影子副本绑定创建它的机器（`Win32_ShadowCopy.OriginatingMachine`），把快照拷到另一台机器上是无效的——这给取证提供了一个天然的归属线索。

**Go 落地思路：** Agent 要采集的是"**快照存在性**"这个状态，而不是"快照文件"。拿到的是 `vssadmin list shadows` / `Win32_ShadowCopy` 的**数量与元数据**，不是一个可以下发的文件句柄。

### 2. 删除影子副本有哪些技术路径？各自留下什么痕迹？

**简洁答案：** 至少六条路径，痕迹分布完全不同，这直接决定了不能只押一条数据源。

| 路径 | 典型命令 / 方式 | 主要痕迹 |
| --- | --- | --- |
| vssadmin | `vssadmin delete shadows /all /quiet` | 进程创建 + 命令行 |
| WMI（命令行） | `wmic shadowcopy delete` | 进程创建 + WMI 活动日志 |
| PowerShell | `Get-CimInstance Win32_ShadowCopy \| Remove-CimInstance` | 进程创建 + PowerShell 脚本块日志（若开启） |
| WMI（COM 直调） | `IWbemServices` / `SWbemLocator` → `Win32_ShadowCopy.Delete()` | **无命令行**，只有 WMI 活动日志 |
| VSS API 直调 | `IVssBackupComponents::DeleteSnapshot` | 无命令行，需靠 API 监控或状态差分 |
| 借第三方工具 | 勒索软件自带的删除模块 | 进程创建 + 文件落地 |

**关键知识点：**

- `wmic` 自 Windows 10 21H1 起被标记弃用，在较新的 Windows 11 版本里已作为按需功能被移除，**不能再把它当作"一定有"的采集路径**。
- WMI 活动日志（`Microsoft-Windows-WMI-Activity/Operational`）会记录 WMI 操作，常见事件 ID 包括 5857（操作开始）、5858（操作完成）、5861（永久事件订阅），是覆盖"非命令行路径"的主要来源。
- 快照删除必须**在本机**以管理员权限执行；普通权限调用只会失败。
- `vssadmin` 只能删影子副本，**删不掉 VSS 服务、删不掉影子存储配额、也关不掉 WinRE**。所以一次完整的"退路清除"通常是多步动作，只看一条命令会漏。

**Go 落地思路：** 采集面要同时覆盖**进程创建**（含命令行与父进程）、**WMI 操作活动**、**只读状态快照**三条通道。任何一条缺失，就要在 Agent 自检里显式标注为"能力缺口"。

### 3. 只监控 `vssadmin` 命令行够不够？为什么？

**简洁答案：** 不够。命令行是高置信证据，但覆盖率有限，因为：

1. **绕过成本极低**：直接调 WMI `Win32_ShadowCopy.Delete()` 或自己实现 VSS API 调用，完全不产生 `vssadmin` 进程。
2. **可伪装**：可执行文件可以改名，路径可以放在任意目录。
3. **不覆盖"非删除型"破坏**：改小影子存储配额、关闭 `recoveryenabled`、禁用 WinRE，本质上都不是"删除"。

**关键知识点：** 命令面给出的是"**有人做了这件事**"，状态面给出的是"**结果变成了这样**"。两者不是替代关系：

- 命令面：证据强、样本少、误报低，但**可能完全不出现**。
- 状态面：覆盖全、不依赖执行路径，但**必须有基线**，否则"本来就是 0"和"被删成 0"分不开。

**Go 落地思路：** 判定逻辑做成"**状态断言为主 + 命令行为佐证**"：状态判定命中时，用命令面证据把结论从"suspicious"升级成"critical"，并把执行主体（进程、父进程、用户）带进告警里。

### 4. `vssadmin resize shadowstorage` 把配额改小了，算不算攻击？和"快照归零"有什么区别？

**简洁答案：** 算，而且它是**更早的埋雷**。`vssadmin list shadowstorage` 能看到每个卷上的三组数字：`Maximum Size`（上限）、`Allocated Shadow Copy Storage space`（已分配）、`Used Shadow Copy Storage space`（已用）。攻击者把上限压到几百 MB，即使此刻系统里还有快照，之后系统或备份软件再想创建快照时也会立刻失败。

两者在检测上的定位不同：

- **快照归零**：结果已经发生，是"事后确认"。
- **配额缩容**：是"事前准备"，而且可以**只缩容不删除**，这样在勒索软件真正启动之前，行为看起来完全是运维操作。

**关键知识点：**

- 配额被改小之后，`Used` 会随之下降，但 `Allocated`（分配量）通常还在，所以只看磁盘剩余空间是发现不了的。
- 磁盘空间紧张时系统也会自动缩减配额；备份软件调整保留策略也会改配额——这是最主要的误报来源。
- 所以配额判定**必须用差分**：和 Agent 采集到的基线比，缩容幅度超过一半（例如基线 10GB、当前 512MB）才算异常。

**Go 落地思路：** 把 `Maximum Size` 当成一个**有基线的数值型字段**，用 `基线 * 2 <= 当前` 这种相对判定，而不是写死一个绝对阈值（512MB 这种绝对值在不同磁盘容量上含义完全不同）。

### 5. `bcdedit /set {default} recoveryenabled no` 做了什么？为什么说它比删快照更危险？

**简洁答案：** 它把该启动项上的 **Windows 恢复环境（WinRE）** 关闭，重启后按 F8 / 走"修复此电脑"时不再有"使用设备"这条引导路径。

为什么更危险：影子副本被删了，受害者还有 WinRE、还有安装介质、还有第三方备份；WinRE 也被关掉之后，**"用系统自带的引导把文件捞出来"这条路也被切断了**。两条退路同时消失，恢复成本从"几分钟"变成"只能付钱或重装"。

**关键知识点：**

- **BCD 元素缺失 ≠ 值为 No。** `recoveryenabled` 的默认值是 Yes，不写这个元素和写 `Yes` 是等价的。解析 `bcdedit /enum all` 时，"没找到元素"必须翻译成"启用"，而不是"关闭"。这是这类解析最常见的 bug：把默认状态解析成了异常状态，然后全网误报。
- 要同时看 `{current}` 和 `{default}`，以及**所有**启动项（`/enum all`）；攻击者只改一项时，逐项比对更容易发现。
- 同一类"降级"动作还有 `bcdedit /set {current} safeboot minimal`（进安全模式）。它单独出现时是运维排障，和删快照、关 WinRE 同时出现时才是攻击。
- `bcdedit` 写 BCD 需要管理员权限，且**修改后立即生效**（不需要重启），所以这类行为通常发生在攻击链前期。

**Go 落地思路：** 解析函数必须返回 `(value string, found bool)` 两个值，让调用方区分"值为 No"和"元素不存在"。这是解析器 API 设计问题，不是解析细节。

### 6. `reagentc /info` 和 WinRE 是什么关系？只关 `recoveryenabled` 够吗？

**简洁答案：** `reagentc /info` 输出 WinRE 的当前状态，主要四行：

```text
Windows RE status:         Enabled
Windows RE path:           \\?\GLOBALROOT\device\harddiskvolume4\Recovery\Winre.wim
REAGENTC ID:               {……}
Recovery agent:            enabled
```

`reagentc /disable` 会把 `Winre.wim` 移走（改名成 `Winre.win`）从而禁用 WinRE，`/enable` 再移回来。

**关键知识点：**

- `recoveryenabled`（BCD 启动项）与 WinRE（`reagentc` 管理的 `Winre.wim`）是**两层独立的开关**，可以只关其中一层，所以**两个都要看**。
- WinRE 的 `Winre.wim` 通常放在恢复分区上，`Agent` 未必有权限直接读取；`reagentc /info` 是更可靠的观测口。
- `Windows RE status` 的取值是 `Enabled` / `Disabled`；输出被重定向或命令失败时要当作"未知"，不能当作"已禁用"。
- WinRE 被禁用本身不一定是恶意：卸载某些更新、调整分区布局、镜像制作都可能留下这个状态。**它必须和删快照、加密行为组合判断。**

**Go 落地思路：** 用 `(enabled bool, found bool)` 表达解析结果，`found=false` 表示采集失败而非"禁用"。这类"三态"（启用 / 禁用 / 未知）在安全产品里到处都是，值得在团队内统一成一种返回约定。

### 7. `wbadmin delete catalog` 属于哪一类破坏？客户端 Windows 也要管吗？

**简洁答案：** `wbadmin` 是 Windows Server Backup（Windows 备份）的命令行工具。`wbadmin delete catalog` 删除备份**目录（catalog）**，`wbadmin delete systemstatebackup -keepVersions:0` 删除系统状态备份，`wbadmin delete backup -keepVersions:0` 删除具体备份版本。这属于同一类行为：**清空受害者的恢复资源**。

**关键知识点：**

- 客户端 Windows 10/11 很少有人用 `wbadmin`，所以"是否要管"取决于客户环境：用了 Windows 备份或 Windows Server Backup 的环境必须管。
- 服务器环境里，`wbadmin delete catalog` 是很多勒索组织在删完影子副本后的**下一步**，因为它抹掉的是"曾经有过完整备份"这个事实。
- 第三方的 Veeam/Acronis/Nakivo 等备份软件有各自独立的目录与保留策略，同样属于要覆盖的范围，但它们的接口和 `wbadmin` 完全不同。
- 注意区分"删除备份"和"**篡改备份目录/日志**"：后者还可能包含**备份被加密后重命名**的情况（例如 `.backup` 后缀被改），需要单独的文件完整性检测。

**Go 落地思路：** 不要在 Agent 里为每种备份软件写一套逻辑。先做一个通用的"**备份资源目录**"抽象：备份根目录、catalog 路径、保留版本数、是否有同名 `.encrypted`/`.locked` 后缀文件。判定逻辑复用，采集实现各自独立。

### 8. 影子副本数量为 0，一定是被攻击了吗？

**简洁答案：** **不一定，这正是本主题最大的误报来源。** 必须区分"从来就没有"和"曾经有、现在没了"。

会天然为 0 的常见情况：

- 客户端 Windows 的系统保护**默认多为关闭**，很多人从未手动开启过。
- Windows 8 以后，系统还原点的**创建频率从每小时降到每 24 小时**一次，很多机器本来就没有手工还原点。
- 使用第三方备份（不依赖 VSS 快照）的生产环境，可能完全不需要影子副本。
- 影子副本默认有过期时间（系统还原点的默认保留期是 24 小时左右到数天），**时间到了自己会消失**，不需要任何人动手。

会天然"很多"的常见情况：依赖 VSS 快照的业务——SQL Server、Exchange、VMware/Hyper-V 备份、Veeam/Acronis 等——快照数量和波动都很大，**部分删除属于正常业务行为**。

**关键知识点：**

- 判定必须用**基线差分**："基线 ≥ 1 且现在 = 0"才是强信号；"基线 = 0 且现在 = 0"不产生任何信号。
- **全量归零**和**部分减少**要分开：全量归零更像"清空退路"，部分减少更可能是业务轮转。
- 快照**自然过期**和**被删除**，在只看数量时无法区分。要用"数量在基线周期内突然归零且此后不再回升"这种时间特征来辅助判断。
- 判定要按**卷**做，不要跨卷汇总。攻击者往往只删系统盘或只删数据盘。

**Go 落地思路：** 基线不是一个全局常量，而是 `(卷, 数量区间, 观察周期)` 的统计结果。基线本身也要有置信度：样本太少时不下结论，而是继续观察。

### 9. 如果攻击者把 VSS 服务停掉了，Agent 采集不到状态，结论怎么表达？

**简洁答案：** 必须表达为"**未知**"，不能表达为"安全"，更不能表达为"没有影子副本"。这是安全产品里最经典的错误：**把采集失败当成阴性结论**。

**关键知识点：**

- `vssadmin list shadows` 在 VSS 服务被停止、权限不足、或命令被策略禁用时都会失败。三种失败的含义完全不同：权限不足是**部署问题**，服务被停是**可能的攻击动作**，命令被禁用是**环境加固**。
- `VSS` 和 `swprv` 都是**按需启动**服务，平时不在运行属于正常。因此"服务没运行"只有在**从运行态变成停止态**这个**状态跃迁**上才有信号，稳态停止没有信号。
- "采集失败"本身就是一个有价值的信号：它意味着 Agent 的证据链出现缺口，应当上报为**采集能力缺口**，而不是静默丢弃。

**Go 落地思路：** 采集函数返回 `(data, err)`，判定函数的输入结构体里带 `Collected bool`；`Collected=false` 时判定函数直接返回 `unknown` 并带上原因。不要用"空切片"或"零值"来隐式表达失败。

### 10. 怎么把"恢复能力破坏"和"加密行为"串成一条攻击链？

**简洁答案：** 破坏行为单独看可能只是运维（比如有人手动清盘），加密行为单独看也可能是误报。两者在**时间上紧邻**、**顺序正确**时，结论才变得确定。

**关键知识点：**

- 典型时序：`破坏退路（t1）` → `加密/批量改写（t2）`，`t2 - t1` 通常在分钟级。
- 主体关联：执行删除快照的进程，其父进程、命令行、用户是谁？来自服务、计划任务、还是交互式会话？交互式管理员会话里执行 `vssadmin delete shadows` 非常可疑。
- 行为侧交叉验证：批量改名 + 高熵写入 + 影子文件扩展名（`.encrypted`/`.locked`/`.crypt`）是勒索的典型指纹；只有它出现时，退路破坏才从"可疑"升级为"确证"。
- 攻击者也可能**反向使用** VSS：加密前先 `vssadmin create shadow` 拿一份干净副本，用于对照原文件、或者把快照导出带走。**快照数量异常增加同样是信号**。

**Go 落地思路：** 不要为"攻击链"新增一套引擎。做法是给破坏事件打上**统一时间戳**，让规则引擎在"破坏 + 行为"的滑动窗口里做加权。这比新增告警类型更省事，也更容易被客户接受。

### 11. Go Agent 怎么在低开销前提下把这条链路采全？

**简洁答案：** 分三层采集——**事件驱动层**（进程创建、WMI 活动）、**周期快照层**（只读命令 + 注册表 + 服务状态 + 快照计数）、**按需深度层**（快照状态变化时再拉详细信息）。

**关键知识点：**

- `vssadmin list shadows`、`vssadmin list shadowstorage`、`bcdedit /enum all`、`reagentc /info` 全是**只读**命令，开销低，但也不该高频轮询——建议 30~60 分钟一次，事件触发时立即补一次。
- `bcdedit /enum all` 输出很大（几十个启动项），但变化极少：算一次内容哈希，哈希不变就跳过。
- 采集必须**能区分失败**：命令返回非 0 退出码时，要拿到错误信息并归类，而不是当成"空结果"。
- 快照计数优先走 `Win32_ShadowCopy`（PowerShell CIM 或 WMI），`vssadmin` 的文本输出作为交叉校验——两者不一致本身就是可疑信号（可能是 hook 伪造或命令被劫持）。

**Go 落地思路：** 采集与判定分离，判定写成纯函数。下面是可直接落地的最小实现。

## Go 落地思路

整条链路拆成三层：只读命令解析（纯函数）→ 快照组装 → 判定打分（纯函数）。中间那层负责"把不同来源的数据翻译成同一个事实模型"，所有判定都只依赖事实模型，不依赖命令。

**第一层：解析 `vssadmin` 输出。** 只读子命令的文本输出是稳定的解析源，但要注意 locale 差异（时间格式、容量单位），所以解析器只认自己认识的字段，认不出来就留空。

```go
package vss

import (
	"regexp"
	"strconv"
	"strings"
	"time"
)

// ShadowCopy 是影子副本的最小可观测描述。
type ShadowCopy struct {
	ID        string
	CreatedAt time.Time
	RestoreAt time.Time
	Volume    string
}

var timeLayouts = []string{
	"2006-01-02 15:04:05",
	"2006/01/02 15:04:05",
	"2006-01-02 15:04",
}

// ParseShadowList 解析 `vssadmin list shadows /for=C:` 的输出。
// 只识别自己认识的字段，其余一律忽略，绝不用默认值补齐。
func ParseShadowList(out string) []ShadowCopy {
	var (
		copies []ShadowCopy
		cur    *ShadowCopy
	)
	flush := func() {
		if cur != nil && cur.ID != "" {
			copies = append(copies, *cur)
		}
		cur = nil
	}
	for _, raw := range strings.Split(out, "\n") {
		key, value, ok := strings.Cut(strings.TrimSpace(raw), ":")
		if !ok {
			continue
		}
		key = strings.ToLower(strings.TrimSpace(key))
		value = strings.TrimSpace(value)
		switch key {
		case "shadow copy id":
			flush()
			cur = &ShadowCopy{ID: strings.Trim(value, "{}")}
		case "shadow copy timestamp":
			if cur != nil {
				cur.CreatedAt = parseTime(value)
			}
		case "restore point":
			if cur != nil {
				cur.RestoreAt = parseTime(value)
			}
		case "original volume":
			if cur != nil {
				cur.Volume = value
			}
		}
	}
	flush()
	return copies
}

// ParseShadowStorage 解析 `vssadmin list shadowstorage /for=C:` 的输出。
// ok=false 表示没解析出配额，调用方必须区分"没有配额"和"采集失败"。
func ParseShadowStorage(out string) (ShadowStorage, bool) {
	var st ShadowStorage
	found := false
	for _, raw := range strings.Split(out, "\n") {
		key, value, ok := strings.Cut(strings.TrimSpace(raw), ":")
		if !ok {
			continue
		}
		switch strings.ToLower(strings.TrimSpace(key)) {
		case "maximum size":
			if n, ok := parseSize(value); ok {
				st.MaxBytes = n
				found = true
			}
		case "allocated shadow copy storage space":
			if n, ok := parseSize(value); ok {
				st.AllocatedBytes = n
			}
		case "used shadow copy storage space":
			if n, ok := parseSize(value); ok {
				st.UsedBytes = n
			}
		}
	}
	return st, found
}

// ShadowStorage 描述一个卷上的影子副本存储配额。
type ShadowStorage struct {
	MaxBytes       int64
	AllocatedBytes int64
	UsedBytes      int64
}

var sizeRe = regexp.MustCompile(`^([0-9]+(?:\.[0-9]+)?)\s*([KMGT]?B)?$`)

// parseSize 解析 "10.00 GB" / "512 MB" / "200MB" 这类容量文本。
func parseSize(s string) (int64, bool) {
	m := sizeRe.FindStringSubmatch(strings.TrimSpace(s))
	if m == nil {
		return 0, false
	}
	value, err := strconv.ParseFloat(m[1], 64)
	if err != nil {
		return 0, false
	}
	var multiplier float64 = 1
	switch strings.ToUpper(m[2]) {
	case "KB":
		multiplier = 1 << 10
	case "MB":
		multiplier = 1 << 20
	case "GB":
		multiplier = 1 << 30
	case "TB":
		multiplier = 1 << 40
	}
	return int64(value * multiplier), true
}

func parseTime(s string) time.Time {
	for _, layout := range timeLayouts {
		if t, err := time.ParseInLocation(layout, s, time.Local); err == nil {
			return t
		}
	}
	return time.Time{}
}
```

两个容易踩的坑：

1. `strings.Cut` 切在**第一个冒号**，所以 `Original volume: C:` 拿到的是 `key="Original volume"`、`value="C:"`；而 `Shadow copy volume: \\?\Volume{...}\` 这种行会被整体忽略，符合预期。
2. `parseSize` 里 `GB` 用 `1<<30`，这是**GiB**。`vssadmin` 输出的是 GiB 语义，跨单位比较时不要混用 `1000` 与 `1024`。

**第二层：解析 BCD 与 WinRE。** 这两个命令的输出有个共同陷阱：**元素/状态缺失 ≠ 关闭**。

```go
package vss

import "strings"

// ParseBCDValue 从 `bcdedit /enum all` 的输出里取指定元素的值。
// found=false 表示元素不存在，也就是使用默认值，而不是"被关闭"。
func ParseBCDValue(out, element string) (value string, found bool) {
	for _, raw := range strings.Split(out, "\n") {
		fields := strings.Fields(raw)
		if len(fields) < 2 {
			continue
		}
		if !strings.EqualFold(fields[0], element) {
			continue
		}
		return strings.Join(fields[1:], " "), true
	}
	return "", false
}

// ParseReagentStatus 解析 `reagentc /info` 的输出。
// found=false 表示命令失败或输出异常，调用方应把结论标为"未知"。
func ParseReagentStatus(out string) (enabled bool, found bool) {
	for _, raw := range strings.Split(out, "\n") {
		key, value, ok := strings.Cut(raw, ":")
		if !ok {
			continue
		}
		if !strings.EqualFold(strings.TrimSpace(key), "Windows RE status") {
			continue
		}
		return strings.EqualFold(strings.TrimSpace(value), "Enabled"), true
	}
	return false, false
}

// RecoveryEnabledByBCD 判断 BCD 中的 recoveryenabled。
// 关键：元素不存在时默认是 Yes，必须返回 true，不能返回 false。
func RecoveryEnabledByBCD(bcdOutput string) bool {
	value, found := ParseBCDValue(bcdOutput, "recoveryenabled")
	if !found {
		return true // 默认启用
	}
	return !strings.EqualFold(strings.TrimSpace(value), "No")
}
```

**第三层：Windows 侧的注册表与服务状态。** 标准库就够，**不需要引入 `golang.org/x/sys`**：用 `syscall.NewLazyDLL` 直接调 `advapi32.dll` 里的注册表与服务控制管理器 API。`syscall` 的注册表封装在 Go 1.25 前后改过签名，服务控制管理器则根本没进标准库，所以这里统一走 `Proc.Call`，任何 Go 版本都能编译。

```go
//go:build windows

package vss

import (
	"errors"
	"syscall"
	"unsafe"
)

var (
	advapi32               = syscall.NewLazyDLL("advapi32.dll")
	procRegOpenKeyEx       = advapi32.NewProc("RegOpenKeyExW")
	procRegQueryValueEx    = advapi32.NewProc("RegQueryValueExW")
	procRegCloseKey        = advapi32.NewProc("RegCloseKey")
	procOpenSCManager      = advapi32.NewProc("OpenSCManagerW")
	procOpenService        = advapi32.NewProc("OpenServiceW")
	procQueryServiceStatus = advapi32.NewProc("QueryServiceStatus")
	procCloseServiceHandle = advapi32.NewProc("CloseServiceHandle")
)

const (
	hkeyLocalMachine = uintptr(0x80000002)
	keyRead          = uintptr(0x20019)
	scManagerConnect = uintptr(0x0001)
	serviceQueryStat = uintptr(0x0004)
	regDWORD         = uint32(4)
	serviceRunning   = uint32(4)
)

// regQueryDWORD 读取注册表 DWORD 值。键或值不存在时返回 found=false。
func regQueryDWORD(root uintptr, path, name string) (uint32, bool, error) {
	pathPtr, err := syscall.UTF16PtrFromString(path)
	if err != nil {
		return 0, false, err
	}
	namePtr, err := syscall.UTF16PtrFromString(name)
	if err != nil {
		return 0, false, err
	}

	var key uintptr
	ret, _, _ := procRegOpenKeyEx.Call(root, uintptr(unsafe.Pointer(pathPtr)), 0, keyRead, uintptr(unsafe.Pointer(&key)))
	if ret != 0 {
		return 0, false, nil // 键不存在：这不是错误，只是没有该策略
	}
	defer procRegCloseKey.Call(key)

	var (
		typ  uint32
		size uint32
	)
	buf := make([]byte, 4)
	ret, _, _ = procRegQueryValueEx.Call(key, uintptr(unsafe.Pointer(namePtr)), 0,
		uintptr(unsafe.Pointer(&typ)), uintptr(unsafe.Pointer(&buf[0])), uintptr(unsafe.Pointer(&size)))
	if ret != 0 {
		return 0, false, nil // 值不存在
	}
	if typ != regDWORD {
		return 0, false, nil
	}
	return uint32(buf[0]) | uint32(buf[1])<<8 | uint32(buf[2])<<16 | uint32(buf[3])<<24, true, nil
}

// SystemRestoreDisabled 读取"关闭系统还原"组策略值。
// 键路径与值名请在目标主机核验，不同镜像可能存在差异。
func SystemRestoreDisabled() (bool, error) {
	value, found, err := regQueryDWORD(hkeyLocalMachine,
		`SOFTWARE\Policies\Microsoft\Windows NT\SystemRestore`, "DisableSR")
	if err != nil {
		return false, err
	}
	return found && value == 1, nil
}

// ServiceRunning 查询指定服务当前是否处于 Running 状态。
func ServiceRunning(name string) (bool, error) {
	namePtr, err := syscall.UTF16PtrFromString(name)
	if err != nil {
		return false, err
	}

	mgr, _, _ := procOpenSCManager.Call(0, 0, scManagerConnect)
	if mgr == 0 {
		return false, errors.New("open service control manager failed")
	}
	defer procCloseServiceHandle.Call(mgr)

	svc, _, _ := procOpenService.Call(mgr, uintptr(unsafe.Pointer(namePtr)), serviceQueryStat)
	if svc == 0 {
		return false, errors.New("open service failed")
	}
	defer procCloseServiceHandle.Call(svc)

	// SERVICE_STATUS 共 7 个 DWORD：第 2 个是当前状态。
	var status [7]uint32
	if ret, _, _ := procQueryServiceStatus.Call(svc, uintptr(unsafe.Pointer(&status[0]))); ret == 0 {
		return false, errors.New("query service status failed")
	}
	return status[1] == serviceRunning, nil
}
```

如果产品本来就已经依赖 `golang.org/x/sys`，用 `windows/registry` 和 `windows/svc` 会更省事；本文特意用 `LazyDLL`，是为了强调"**采集一个注册表值不值得为此引入一个新依赖**"。

**第四层：把采集结果组装成事实模型，再交给纯函数判定。** 判定函数不碰任何命令输出，只接收结构化快照，因此可以被历史数据回放，规则上线后不需要重装 Agent 就能回溯历史。

```go
package vss

// RecoveryPosture 是一次恢复能力巡检的快照。
type RecoveryPosture struct {
	Collected           bool
	ShadowCount         int
	BaselineShadowCount int
	ShadowStorageMax    int64
	BaselineStorageMax  int64
	RecoveryEnabled     bool
	WinREEnabled        bool
	SystemRestoreOn     bool
	VSSServiceRunning   bool
	BaselineVSSRunning  bool
}

// Verdict 是判定结论。
type Verdict struct {
	Level   string // ok / suspicious / critical / unknown
	Score   int
	Reasons []string
}

// AssessRecovery 是纯函数：输入事实快照，输出结论与理由。
func AssessRecovery(p RecoveryPosture) Verdict {
	if !p.Collected {
		return Verdict{Level: "unknown", Reasons: []string{"采集失败，恢复能力状态未知"}}
	}

	var v Verdict
	add := func(score int, reason string) {
		v.Score += score
		v.Reasons = append(v.Reasons, reason)
	}

	switch {
	case p.BaselineShadowCount > 0 && p.ShadowCount == 0:
		add(4, "影子副本从基线归零")
	case p.BaselineShadowCount > 0 && p.ShadowCount < p.BaselineShadowCount:
		add(1, "影子副本数量低于基线")
	}

	if p.BaselineStorageMax > 0 && p.ShadowStorageMax > 0 && p.ShadowStorageMax*2 < p.BaselineStorageMax {
		add(2, "影子副本存储上限被压缩到基线的一半以下")
	}
	if !p.RecoveryEnabled {
		add(3, "BCD recoveryenabled 已关闭")
	}
	if !p.WinREEnabled {
		add(2, "Windows 恢复环境(WinRE)被禁用")
	}
	if !p.SystemRestoreOn {
		add(1, "系统还原被策略关闭")
	}
	if p.BaselineVSSRunning && !p.VSSServiceRunning {
		add(2, "VSS 服务从运行变为停止")
	}

	switch {
	case v.Score >= 5:
		v.Level = "critical"
	case v.Score >= 3:
		v.Level = "suspicious"
	default:
		v.Level = "ok"
	}
	return v
}
```

四个设计要点：

1. **采集与判定分离**：`AssessRecovery` 是纯函数，输入输出都可测、可回放。规则调阈值不需要重新部署 Agent。
2. **缺失 ≠ 零值**：`Collected=false` 直接返回 `unknown`。命令失败、服务被停、权限不足，都必须落到这里，而不是伪装成"没有快照"。
3. **一切阈值都走基线差分**：`Baseline*` 字段让"这台机器本来就 0 个快照"和"被删成 0 个"天然分开，也避免了把 512MB 这类绝对值写死。
4. **服务状态只认跃迁**：`VSS`/`swprv` 是按需启动服务，稳态停止无意义，只有从运行变成停止才计分。

## 学习要点

- VSS 是"**能力**"而不是"文件"：检测的是快照的存在性、配额、恢复开关，不是 `System Volume Information` 里的内容。
- 删快照只是第一步，完整链路是：影子副本 → 影子存储配额 → `recoveryenabled` → WinRE → 备份目录。只覆盖第一步等于漏报。
- 命令面覆盖不全（可绕过、可伪装），状态面必须有基线才有意义。**两者互补，不能互相替代。**
- 解析器要能表达三态：正常值、异常值、**采集失败**。`found bool` 这类返回值不是啰嗦，是刚需。
- BCD 元素缺失等于默认值。把"没找到"当成"被关闭"是这类检测最典型、影响面最大的 bug。
- 按需启动的服务，其"停止"只有在**状态跃迁**上才是信号。
- 降噪靠基线、按卷粒度、业务软件白名单，不靠把阈值调高。
- 客户现场验证只用只读命令；`vssadmin delete shadows` 这种破坏性动作只在自己的测试机上做。

## 小练习

1. `vssadmin list shadows` 的输出里，`Shadow copy volume: \\?\Volume{...}\` 这一行会被 `strings.Cut` 切成什么？如果解析器改成"遇到冒号就切"，会不会误命中某个 case？
2. `bcdedit /enum all` 的输出里没有 `recoveryenabled` 这一行，说明 WinRE 是开还是关？为什么这个判断不能写成 `!found → 已关闭`？
3. 某台 SQL Server 服务器平时有 12 个影子副本，今天突然变成 0，但过去 7 天都正常。这条结论应该是 critical 还是 suspicious？还需要什么证据才能升级？
4. 某台机器从来就没有过影子副本，Agent 持续报 `suspicious`。问题出在哪几个地方？（提示：基线、默认值、`Collected`）
5. 如果攻击者不用 `vssadmin`，改用 WMI `Win32_ShadowCopy.Delete()`，进程创建监控还能拿到证据吗？拿不到的话靠什么？
6. `vssadmin list shadowstorage` 显示 `Maximum Size: 512 MB`，`Allocated: 512 MB`，`Used: 0 MB`。这台机器是刚出厂的笔记本，还是被入侵过？怎么区分？
7. 客户抱怨"我们开了系统保护"，但 `vssadmin list shadows` 一直返回空。列出至少四个可能的真实原因。
8. 如果 Agent 以非管理员权限运行，`vssadmin list shadows` 失败，Agent 应该上报什么？
9. 影子副本数量突然从 0 涨到 20 个，可能是什么？需要关注吗？
10. 设计一个"破坏 + 加密"攻击链规则：需要哪几个时间戳、什么关联条件、怎么避免运维清盘场景被牵连？
11. `reagentc /info` 返回 `Windows RE status: Disabled`，同时 `bcdedit` 里 `recoveryenabled` 元素不存在。这台机器的 WinRE 状态怎么综合判断？
12. 为什么 `swprv` 服务没运行本身不是信号？什么情况下才是？

## 参考资料

- Microsoft Learn：`Volume Shadow Copy Service`（VSS 概述与 `IVssBackupComponents` 接口）
- Microsoft Learn：`vssadmin` 命令参考（`list shadows` / `list shadowstorage` / `resize shadowstorage` / `delete shadows`）
- Microsoft Learn：`bcdedit` 命令参考、`reagentc` 命令参考
- Microsoft Learn：`Win32_ShadowCopy` WMI 类、`Win32_ShadowStorage` WMI 类
- Microsoft Learn：`Microsoft-Windows-WMI-Activity/Operational` 通道
- Sysinternals Sysmon：Event ID 1（进程创建）、Event ID 11（文件创建）

> 说明：本文对**命令语义与检测逻辑**的描述基于 Windows 官方文档；但 `vssadmin` 的**输出文本格式、事件 ID 编号、注册表策略路径**会随 Windows 版本与语言包变化，落地前请用 `vssadmin list shadows`、`vssadmin list shadowstorage`、`bcdedit /enum all`、`reagentc /info` 与 `wevtutil qe VolumeShadowCopy /c:20 /rd:true /f:text` 在**目标主机**上核对，并把这些差异收敛到解析层而不是判定层。
