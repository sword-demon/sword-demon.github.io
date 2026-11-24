---
title: Go 主机安全面试：Windows Sysmon 部署状态与配置篡改检测
date: 2026-11-24 17:10:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- windows
- sysmon
---

# Go 主机安全面试：Windows Sysmon 部署状态与配置篡改检测

前面写过 [Windows ETW 采集链路与 ETW 篡改降级检测](go-edr-windows-etw-collection-tamper-detection.md)、[Windows 事件日志清理与审计策略篡改检测](go-edr-windows-eventlog-audit-policy-tamper-detection.md)，那几篇讲的是"采集链路本身"和"审计策略"两个层面。

这篇讲一个在真实项目里最容易被忽略、但客户出问题时第一个被问到的东西：**Sysmon**。

Sysmon 是 Sysinternals 出的一个"系统服务 + 内核驱动"组合，专门把进程创建、网络连接、驱动加载、注册表修改等主机行为写进 Windows 事件日志。很多 EDR 产品的采集层、很多甲方安全基线，都会在 Windows 主机上部署它。

但围绕它有三件事，几乎每个做 Windows 侧安全产品的 Go 工程师都会踩：

1. **"装了 Sysmon"不等于"有 Sysmon 采集"。** Sysmon64.exe 在 ARM64 机器上能正常安装、服务能起来，但内核驱动装不上，一条事件都不会有。
2. **Sysmon 的配置不是 XML 文件。** 它被编译成二进制 blob 写在注册表里。所有"改配置文件加固"的脚本，如果没有走 `sysmon -c` 下发，实际上什么也没做。
3. **"没有告警"经常不是被攻击，而是被配置过滤了。** 官方文档写得很清楚：网络连接事件（EID 3）默认关闭，镜像加载（EID 7）默认关闭且"需要小心配置，否则会产生巨量日志"。

所以这篇的核心命题是：**怎么证明一台 Windows 主机上的 Sysmon 真的在按预期采集，以及怎么证明它没有被人悄悄降级。**

## 岗位场景

```text
客户：某制造业客户，Windows 10/11 + Server 2019/2022 混合环境，约 800 台终端。
        安全基线要求：所有终端部署 Sysmon v15，开启进程创建 + 网络连接 + 驱动加载。

现场问题（客户安全运营中心提出）：
  1. 某台服务器上突然看不到任何进程创建日志了，但 Agent 进程还在跑，服务也没停。
  2. 抽查 3 台终端，发现 Sysmon 配置文件和基线模板不一致：
     DriverLoad 事件多了一条 exclude 规则，排除了 "windows" 签名。
  3. 有客户抱怨"装了 Sysmon 但没效果"，重装后依旧没有数据。

你的任务：
  - 给出 Sysmon 部署健康度的判定逻辑（多源证据 + 三态结论）；
  - 给出配置指纹基线的实现方式；
  - 给出"运维变更"与"攻击降级"的区分方法；
  - 给出这套逻辑在 Go Agent 里的落地结构。
```

## 先纠正三个错误前提

面试里最容易失分的地方，是顺着错误前提往下答。先把这三条掰正。

### 错误前提一：Sysmon 的配置是一个 XML 文件

**不是。** `sysmon.exe -i` 或 `sysmon.exe -c` 会把你给的 XML **编译成二进制配置**，存到：

```text
HKLM\SYSTEM\CurrentControlSet\Services\SysmonDrv\Parameters\Rules   (REG_BINARY)
```

同一个 `Parameters` 键下还有 `HashingAlgorithm`、`Options` 等值。驱动启动时读的是注册表里的二进制，不是磁盘上某个 `.xml`。

这个事实直接决定了两件事：

- **加固脚本写错地方了。** "把 Sysmon 配置文件设为只读"这种做法在 Sysmon 上完全无效，因为它压根不读文件。
- **配置备份/迁移必须导二进制。** 想把 A 机器的配置搬到 B 机器，得把 `Rules` 的字节拿出来（在 XML 还没丢的情况下用 `sysmon -c` 重新下发），而不是拷一个 XML 文件。社区工具 `sysmon-bin2xml` 存在的唯一理由就是：XML 原文丢了以后，只剩注册表里的二进制 blob，需要反向还原。

### 错误前提二：Sysmon 装上了，事件就一定在产生

官方文档写得很清楚：Sysmon 由**内核驱动**（`SysmonDrv`，altitude 385201，boot-start 驱动）和**用户态服务**（名字跟可执行文件同名，默认 `Sysmon` / `Sysmon64` / `Sysmon64a`，Local System 启动，描述 "System Monitor service"）组成。事件由驱动采集、由服务写进事件日志。

而 Sysinternals 官方文档同时说明：ARM64 主机上必须用原生的 `Sysmon64a.exe`，因为**内核驱动必须匹配操作系统架构**；用 x64 的 `Sysmon64.exe` 装在 ARM64 上，用户态部分在仿真下能跑，但驱动加载不了，**不会采集到任何事件**。

这就是"服务在、驱动在、但一条事件都没有"的经典成因。所以健康度判定必须分层，不能只看服务状态。

### 错误前提三：XML 里配了什么，就等于采集了什么

也不完全成立。官方文档写明：命令行开关启用的事件，**仍然需要在配置里用对应的过滤标签配置**；同时安装时如果没给配置文件，默认启用的是 ProcessCreation、ProcessTermination、DriverLoad、FileCreationTimeChanged，并计算 SHA1。

也就是说：**仅凭 XML 无法完整推导覆盖度**。这直接影响我们后面"覆盖度下降"这个判定的实现方式——我会在代码里明确区分"XML 显式启用"和"安装默认启用"两个集合，并在文中标注这个近似的边界。

## 高频面试题

### Q1：Sysmon 是什么？它和 ETW、Security 4688 有什么区别？什么时候用 Sysmon？

**简洁答案**

Sysmon 是"内核驱动 + 用户态服务"的组合，把主机行为落到 `Microsoft-Windows-Sysmon/Operational` 通道（完整路径 `Applications and Services Logs\Microsoft\Windows\Sysmon\Operational`），共 29 个事件类型 + 一个 255 错误事件。它**不是** ETW provider，**也不是** 4688 的替代品，是第三条独立的数据源。

**关键知识点**

- Sysmon 走的是自己的驱动采集路径（内核回调），事件最终通过事件日志 API 落盘，因此**事件时间戳是 UTC**，这一点和 4688 一致，但和很多依赖本地时间的工具不一致。
- EID 1 进程创建自带完整命令行、`ProcessGUID`（跨 PID 复用仍可关联）、`SessionId`、父进程命令行；4688 要拿到完整命令行，前提是"审计进程创建"策略 + "记录命令行"审计策略都打开。
- ETW 是"总线"，Sysmon 是"自己拉的一路数据"，两者可以同时开；Sysmon 的价值在于**启动早期就能出数据**（boot-start 驱动）以及**字段结构稳定、跨版本对齐**。
- 官方文档明确：Sysmon 不做分析，也不试图隐藏自己——它不是安全产品，是传感器。

**Go 落地思路**

在 Agent 里把 Sysmon 当成**事件源插件**而不是"唯一真相"。事件源注册表里给每个源声明：通道名、支持的事件 ID 集合、字段可信度、是否需要提权。归一化后进统一事件管道，Sysmon 源在管道里和 ETW 源、4688 源平级。

### Q2：怎么判断一台机器上的 Sysmon 是否真的在按预期工作？

**简洁答案**

三层证据缺一不可：驱动服务在不在、用户态服务在不在且在运行、事件通道里最近有没有**期望类型**的事件。只看服务状态会误判。

**关键知识点**

- 驱动服务键：`HKLM\SYSTEM\CurrentControlSet\Services\SysmonDrv`（可用 `-d <name>` 改名，8 字符上限），ImagePath 是 `<driver>.sys`，altitude 固定 385201。
- 用户态服务键：服务名 = 可执行文件名，默认 `Sysmon` / `Sysmon64` / `Sysmon64a`，`ImagePath` = `%windir%\<exe name>`，启动类型 Automatic，账户 Local System，描述 "System Monitor service"。
- 事件通道：`Microsoft-Windows-Sysmon/Operational`，EID 4 = 服务状态变化（started/stopped），EID 16 = 配置变化（ServiceConfigurationChange），这两个**不可被过滤**（官方文档在过滤标签表里明确标注 n/a）。
- 服务在跑但通道里没有事件 → 典型成因：配置把所有事件都过滤掉了、驱动没真正加载（ARM64 架构错配）、通道被清空、Agent 自己的采集范围没包含这个通道。

**Go 落地思路**

采集一个 `Health` 快照（驱动是否存在、服务状态、通道最后一条事件时间），然后给三态结论：

- `healthy`：驱动在 + 服务 RUNNING + 通道在期望时间窗内有事件；
- `degraded`：驱动在但服务不在运行，或通道静默超过阈值；
- `unknown`：拿不到驱动信息（比如权限不足、非 Windows 主机），**不能当成"正常"，也不能当成"被攻击"**。

第四种状态才是关键：客户说"没数据"，Agent 报 `unknown`，等于什么都没查。

### Q3：Sysmon 的配置到底存在哪？为什么"改 XML 文件"是错的？

**简洁答案**

`sysmon -i/-c` 把 XML 编译成二进制存到 `HKLM\SYSTEM\CurrentControlSet\Services\SysmonDrv\Parameters\Rules`（REG_BINARY），同键还有 `HashingAlgorithm`、`Options`。配置是**注册表状态**而不是文件。

**关键知识点**

- 官方文档："Automatically reloads configuration if changed in the registry."——驱动监听的是注册表值。
- 配置 XML 里的 `schemaversion` 属性与 Sysmon 二进制版本**相互独立**，作用是让新版驱动能解析旧版配置。
- XML 里的过滤标签和事件 ID 不是一一对应：`RegistryEvent` → 12/13/14，`PipeEvent` → 17/18，`WmiEvent` → 19/20/21。
- `-s` 可以打印完整 schema（含每个事件的字段名与类型），这是写解析器时的权威输入。

**Go 落地思路**

Agent 采集配置指纹时，直接对注册表里的 `Rules` 字节做 SHA-256。但要注意：升级 Sysmon 二进制会让 blob 结构变化，所以指纹必须**和 Sysmon 版本绑定**，否则每次升级都会误报"配置被改"。产品上正确的做法是两级指纹：

- **blob 指纹**：原始字节 SHA-256，用于判断"有没有被动过"；
- **语义指纹**：把配置解析成结构后规范化再哈希，用于判断"覆盖度有没有下降"（对格式变化免疫）。

### Q4：怎么给 Sysmon 配置做指纹基线？

**简洁答案**

不能对 XML 文本直接做 SHA-256——空白、注释、缩进、属性顺序都会让哈希变。必须**解析成结构 → 规范化 → 再哈希**。

**关键知识点**

规范化要处理的不只是空白：

- 规则的 `condition` 大小写不敏感（官方文档：all conditions are case insensitive），规范化时统一小写；
- 同一事件类型下多条规则的顺序不影响语义（同一字段是 OR，不同字段是 AND），规范化时必须排序；
- `RuleGroup` 用 `groupRelation="and|or"` 显式覆盖组合方式，规范化时要保留这个属性；
- `HashAlgorithms` 是逗号分隔的字符串列表，顺序无意义，要排序。

**Go 落地思路**

用 `encoding/xml` 解析 → 把过滤块的事件类型名记下来（`xml:",any"` 拿不到标签名，需要自己实现 `UnmarshalXML`）→ 规范化成一段确定性文本 → SHA-256。

```go
package sysmon

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/xml"
	"fmt"
	"io"
	"sort"
	"strings"
)

// Config 只保留会影响采集覆盖面的配置字段。
type Config struct {
	XMLName        xml.Name  `xml:"Sysmon"`
	SchemaVersion  string    `xml:"schemaversion,attr"`
	HashAlgorithms []string  `xml:"HashAlgorithms"`
	Filtering      Filtering `xml:"EventFiltering"`
}

// Filtering 对应 <EventFiltering>：规则组和按事件类型的过滤器都在里面。
type Filtering struct {
	RuleGroups []RuleGroup `xml:"RuleGroup"`
	Filters    []Filter    `xml:",any"`
}

// Filter 是一个事件类型的过滤块，例如 <NetworkConnect onmatch="include">。
type Filter struct {
	Event   string `xml:"-"`
	OnMatch string `xml:"onmatch,attr"`
	Rules   []Rule `xml:",any"`
}

// Rule 是一条字段级过滤规则。
type Rule struct {
	Field     string `xml:"name,attr"`
	Condition string `xml:"condition,attr"`
	Value     string `xml:",chardata"`
}

// RuleGroup 用 groupRelation 显式指定组内规则的组合方式。
type RuleGroup struct {
	Name          string   `xml:"name,attr"`
	GroupRelation string   `xml:"groupRelation,attr"`
	Filters       []Filter `xml:",any"`
}

// UnmarshalXML 记住过滤块所属的事件类型名。
func (fl *Filter) UnmarshalXML(d *xml.Decoder, start xml.StartElement) error {
	type plain Filter
	var p plain
	if err := d.DecodeElement(&p, &start); err != nil {
		return err
	}
	*fl = Filter(p)
	fl.Event = start.Name.Local
	return nil
}

// ParseConfig 解析 Sysmon XML 配置。
func ParseConfig(r io.Reader) (*Config, error) {
	cfg := &Config{}
	dec := xml.NewDecoder(r)
	dec.Strict = true
	if err := dec.Decode(cfg); err != nil {
		return nil, fmt.Errorf("parse sysmon config: %w", err)
	}
	return cfg, nil
}

// Fingerprint 返回配置的规范化指纹：空白、注释、属性顺序变化都不影响结果。
func Fingerprint(cfg *Config) string {
	sum := sha256.Sum256([]byte(canonical(cfg)))
	return hex.EncodeToString(sum[:])
}

func canonical(cfg *Config) string {
	var b strings.Builder
	fmt.Fprintf(&b, "schema=%s\n", strings.TrimSpace(cfg.SchemaVersion))

	hashAlgs := append([]string(nil), cfg.HashAlgorithms...)
	sort.Strings(hashAlgs)
	fmt.Fprintf(&b, "hash=%s\n", strings.Join(hashAlgs, ","))

	filters := append([]Filter(nil), cfg.Filtering.Filters...)
	sort.Slice(filters, func(i, j int) bool {
		if filters[i].Event != filters[j].Event {
			return filters[i].Event < filters[j].Event
		}
		return filters[i].OnMatch < filters[j].OnMatch
	})
	for _, fl := range filters {
		fmt.Fprintf(&b, "filter %s onmatch=%s\n", fl.Event, fl.OnMatch)
		for _, r := range sortedRules(fl.Rules) {
			fmt.Fprintf(&b, "  rule %s\n", ruleKey(r))
		}
	}

	groups := append([]RuleGroup(nil), cfg.Filtering.RuleGroups...)
	sort.Slice(groups, func(i, j int) bool { return groups[i].Name < groups[j].Name })
	for _, g := range groups {
		fmt.Fprintf(&b, "group %s relation=%s\n", g.Name, g.GroupRelation)
		inner := append([]Filter(nil), g.Filters...)
		sort.Slice(inner, func(i, j int) bool {
			if inner[i].Event != inner[j].Event {
				return inner[i].Event < inner[j].Event
			}
			return inner[i].OnMatch < inner[j].OnMatch
		})
		for _, fl := range inner {
			fmt.Fprintf(&b, "  filter %s onmatch=%s\n", fl.Event, fl.OnMatch)
			for _, r := range sortedRules(fl.Rules) {
				fmt.Fprintf(&b, "    rule %s\n", ruleKey(r))
			}
		}
	}
	return b.String()
}

func sortedRules(rules []Rule) []Rule {
	out := append([]Rule(nil), rules...)
	sort.Slice(out, func(i, j int) bool { return ruleKey(out[i]) < ruleKey(out[j]) })
	return out
}

func ruleKey(r Rule) string {
	return fmt.Sprintf("%s|%s|%s",
		strings.TrimSpace(r.Field),
		strings.ToLower(strings.TrimSpace(r.Condition)),
		strings.TrimSpace(r.Value),
	)
}
```

### Q5：配置被改了，怎么区分"运维下发变更"和"攻击者降级"？

**简洁答案**

不能靠 diff 本身，要靠**基线来源 + 变更类型分级**。基线来自受控分发渠道（配置管理平台 / SIEM 下发清单），任何与基线不一致都是"漂移"，再按变更类型分高危/低危。

**关键知识点（判定分级表）**

| 变更类型 | 方向 | 严重级 | 理由 |
| --- | --- | --- | --- |
| `event_coverage_lost` | 少采集某类事件 | 高 | 直接丢可见性 |
| `hash_algorithm_removed` | 哈希算法减少 | 高 | 失去可核验的样本指纹 |
| `rule_removed`（onmatch=include） | 收紧匹配集 | 高 | 命中的事件变少 |
| `rule_added`（onmatch=exclude） | 新增排除 | 高 | 抑制事件输出 |
| `filter_removed`（onmatch=include） | 整个过滤块被删 | 高 | 同覆盖度丢失 |
| `schema_changed`（版本回退） | schema 降级 | 高 | 老 schema 支持的事件更少 |
| `rule_added`（onmatch=include） | 收紧匹配集 | 低 | 只会更吵，不会更瞎 |
| `hash_algorithm_added` | 哈希算法增加 | 低 | 通常是加固 |
| `event_coverage_added` | 多采集事件 | 低 | 一般是加固 |

**Go 落地思路**

四态结论，而不是三态：

- `healthy`：指纹完全一致；
- `drift`：有差异但没有命中任何高危项 → 开工单让运维确认，**不要直接报攻击**；
- `tampered`：命中任一高危项 → 告警，并关联 EID 16 / EID 4 事件；
- `unknown`：拿不到当前配置（权限不足、键不存在）→ 明确上报"未知"，不要静默。

这个分级表的落点就是 `Diff` + `Assess`：

```go
package sysmon

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// tagToEventIDs 把配置里的过滤标签映射到 Sysmon 事件 ID。
// RegistryEvent / PipeEvent / WmiEvent 一个标签对应多个 EID。
var tagToEventIDs = map[string][]int{
	"ProcessCreate":          {1},
	"FileCreateTime":         {2},
	"NetworkConnect":         {3},
	"ProcessTerminate":       {5},
	"DriverLoad":             {6},
	"ImageLoad":              {7},
	"CreateRemoteThread":     {8},
	"RawAccessRead":          {9},
	"ProcessAccess":          {10},
	"FileCreate":             {11},
	"RegistryEvent":          {12, 13, 14},
	"FileCreateStreamHash":   {15},
	"PipeEvent":              {17, 18},
	"WmiEvent":               {19, 20, 21},
	"DnsQuery":               {22},
	"FileDelete":             {23},
	"ClipboardChange":        {24},
	"ProcessTampering":       {25},
	"FileDeleteDetected":     {26},
	"FileBlockExecutable":    {27},
	"FileBlockShredding":     {28},
	"FileExecutableDetected": {29},
}

// installDefaultEventIDs 是 `sysmon -i` 不带配置文件时的默认启用集合。
// 安装文档说明默认启用 ProcessCreation / ProcessTermination / DriverLoad /
// FileCreationTimeChanged，并对进程镜像计算 SHA1。
var installDefaultEventIDs = []int{1, 2, 5, 6}

// EnabledEventIDs 返回配置显式启用的事件 ID 集合。
func EnabledEventIDs(cfg *Config) map[int]bool {
	enabled := make(map[int]bool)
	for _, fl := range cfg.Filtering.Filters {
		for _, id := range tagToEventIDs[fl.Event] {
			enabled[id] = true
		}
	}
	for _, g := range cfg.Filtering.RuleGroups {
		for _, fl := range g.Filters {
			for _, id := range tagToEventIDs[fl.Event] {
				enabled[id] = true
			}
		}
	}
	return enabled
}

// EffectiveEventIDs 返回"实际会产出事件"的 ID 集合：XML 显式启用的，加上安装默认启用的。
func EffectiveEventIDs(cfg *Config) map[int]bool {
	enabled := EnabledEventIDs(cfg)
	for _, id := range installDefaultEventIDs {
		enabled[id] = true
	}
	return enabled
}

// Change 描述基线与当前配置之间的一处差异。
type Change struct {
	Kind     string `json:"kind"`
	Detail   string `json:"detail"`
	Severity string `json:"severity"`
}

// Verdict 是配置健康度的结论。
type Verdict struct {
	State   string   `json:"state"`
	Reason  string   `json:"reason"`
	Changes []Change `json:"changes"`
}

// Diff 比较基线配置与当前配置。
func Diff(base, cur *Config) []Change {
	var changes []Change

	if base.SchemaVersion != cur.SchemaVersion {
		severity := "low"
		if compareSchema(cur.SchemaVersion, base.SchemaVersion) < 0 {
			severity = "high"
		}
		changes = append(changes, Change{
			Kind:     "schema_changed",
			Detail:   fmt.Sprintf("%s -> %s", base.SchemaVersion, cur.SchemaVersion),
			Severity: severity,
		})
	}

	baseHash := setOf(base.HashAlgorithms)
	curHash := setOf(cur.HashAlgorithms)
	for _, h := range sortedKeys(baseHash) {
		if !curHash[h] {
			changes = append(changes, Change{
				Kind:     "hash_algorithm_removed",
				Detail:   h,
				Severity: "high",
			})
		}
	}
	for _, h := range sortedKeys(curHash) {
		if !baseHash[h] {
			changes = append(changes, Change{
				Kind:     "hash_algorithm_added",
				Detail:   h,
				Severity: "low",
			})
		}
	}

	baseEvents := EffectiveEventIDs(base)
	curEvents := EffectiveEventIDs(cur)
	for _, id := range sortedIntKeys(baseEvents) {
		if !curEvents[id] {
			changes = append(changes, Change{
				Kind:     "event_coverage_lost",
				Detail:   fmt.Sprintf("EID %d (%s)", id, EventTypeName(id)),
				Severity: "high",
			})
		}
	}
	for _, id := range sortedIntKeys(curEvents) {
		if !baseEvents[id] {
			changes = append(changes, Change{
				Kind:     "event_coverage_added",
				Detail:   fmt.Sprintf("EID %d (%s)", id, EventTypeName(id)),
				Severity: "low",
			})
		}
	}

	changes = append(changes, diffFilters("top_level", base.Filtering.Filters, cur.Filtering.Filters)...)
	changes = append(changes, diffFilters("rule_group", groupFilters(base), groupFilters(cur))...)
	return changes
}

func diffFilters(scope string, base, cur []Filter) []Change {
	var changes []Change
	baseIdx := indexFilters(base)
	curIdx := indexFilters(cur)

	for _, key := range sortedFilterKeys(baseIdx) {
		b := baseIdx[key]
		curFilter, curHas := curIdx[key]
		if !curHas {
			severity := "high"
			if strings.EqualFold(b.OnMatch, "exclude") {
				severity = "low"
			}
			changes = append(changes, Change{
				Kind:     "filter_removed",
				Detail:   fmt.Sprintf("%s %s", scope, key),
				Severity: severity,
			})
			continue
		}
		bRules := setOf(ruleKeys(b.Rules))
		cRules := setOf(ruleKeys(curFilter.Rules))
		for _, rk := range sortedKeys(bRules) {
			if !cRules[rk] {
				severity := "low"
				if strings.EqualFold(b.OnMatch, "include") {
					severity = "high"
				}
				changes = append(changes, Change{
					Kind:     "rule_removed",
					Detail:   fmt.Sprintf("%s %s %s", scope, key, rk),
					Severity: severity,
				})
			}
		}
		for _, rk := range sortedKeys(cRules) {
			if !bRules[rk] {
				severity := "low"
				if strings.EqualFold(b.OnMatch, "exclude") {
					severity = "high"
				}
				changes = append(changes, Change{
					Kind:     "rule_added",
					Detail:   fmt.Sprintf("%s %s %s", scope, key, rk),
					Severity: severity,
				})
			}
		}
	}

	for _, key := range sortedFilterKeys(curIdx) {
		if _, ok := baseIdx[key]; ok {
			continue
		}
		severity := "low"
		if strings.EqualFold(curIdx[key].OnMatch, "exclude") {
			severity = "high"
		}
		changes = append(changes, Change{
			Kind:     "filter_added",
			Detail:   fmt.Sprintf("%s %s", scope, key),
			Severity: severity,
		})
	}
	return changes
}

// Assess 给出结论：healthy / drift / tampered / unknown。
func Assess(base, cur *Config) Verdict {
	if base == nil || cur == nil {
		return Verdict{State: "unknown", Reason: "baseline or current config unavailable"}
	}
	if Fingerprint(base) == Fingerprint(cur) {
		return Verdict{State: "healthy", Reason: "fingerprint matches baseline"}
	}
	changes := Diff(base, cur)
	for _, c := range changes {
		if c.Severity == "high" {
			return Verdict{State: "tampered", Reason: "security relevant downgrade detected", Changes: changes}
		}
	}
	return Verdict{State: "drift", Reason: "config differs from baseline without coverage loss", Changes: changes}
}

func indexFilters(filters []Filter) map[string]Filter {
	idx := make(map[string]Filter, len(filters))
	for _, fl := range filters {
		idx[fl.Event+"|"+strings.ToLower(fl.OnMatch)] = fl
	}
	return idx
}

func groupFilters(cfg *Config) []Filter {
	var out []Filter
	for _, g := range cfg.Filtering.RuleGroups {
		for _, fl := range g.Filters {
			fl.Event = g.Name + "/" + fl.Event
			out = append(out, fl)
		}
	}
	return out
}

func ruleKeys(rules []Rule) []string {
	out := make([]string, 0, len(rules))
	for _, r := range rules {
		out = append(out, ruleKey(r))
	}
	return out
}

func setOf(items []string) map[string]bool {
	m := make(map[string]bool, len(items))
	for _, it := range items {
		if v := strings.TrimSpace(it); v != "" {
			m[v] = true
		}
	}
	return m
}

func sortedKeys(m map[string]bool) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

func sortedFilterKeys(m map[string]Filter) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

func sortedIntKeys(m map[int]bool) []int {
	out := make([]int, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Ints(out)
	return out
}

func compareSchema(a, b string) int {
	fa, oka := parseFloat(a)
	fb, okb := parseFloat(b)
	switch {
	case oka && okb:
		switch {
		case fa < fb:
			return -1
		case fa > fb:
			return 1
		default:
			return 0
		}
	case oka:
		return 1
	case okb:
		return -1
	default:
		return strings.Compare(a, b)
	}
}

func parseFloat(s string) (float64, bool) {
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0, false
	}
	return v, true
}
```

### Q6：EID 16 能不能直接当"配置被改"的告警源？

**简洁答案**

不能只靠它。EID 16（ServiceConfigurationChange）的官方描述是"记录 Sysmon 配置变化，例如过滤规则更新时"，EID 4 是服务状态变化，这两个事件**不可被过滤**（官方过滤标签表里标注 n/a），所以理论上它们一定会产生。

但**直接改注册表 `Rules` 值**与**用 `sysmon -c` 工具下发**不是同一条路径，官方文档没有承诺前者的行为。工程上正确的做法是把它当**辅助证据**，主证据用静态指纹。

**关键知识点**

- 双通道交叉验证：① 静态采集注册表 `Rules` 指纹；② 事件流里观察 EID 16 / EID 4。
- 两条通道**互相独立**才有价值：如果只有事件通道而没有静态基线，攻击者可以先关掉事件采集再改配置；如果只有静态而没有事件，就发现不了"改完又改回"的时间窗。
- "配置被改 → 改回"这种短时间窗口内的翻转，靠采样式的静态采集很可能错过，事件流是唯一能抓住它的通道。
- EID 255（Error）表示 Sysmon 内部出错，可能发生在系统负载过高、某些任务无法执行、或安全完整性条件不满足时——这是"漏采"的信号，不该忽略。

**Go 落地思路**

采集器拆成两条独立管道：

```text
静态管道（低频，分钟级）：服务/驱动状态 + Rules 指纹 + 通道最后事件时间 → Health 快照
事件管道（实时）：Sysmon 通道 → 归一化 → EID 16/4/255 单独打标 → 实时告警
```

两条管道的结果在服务端合并：静态说"配置哈希变了"、事件说"配置变更事件在 T 时刻出现" → 高置信度；只有一边 → 中/低置信度。

### Q7：Sysmon 事件怎么读？Go 怎么解析？

**简洁答案**

Windows 事件日志的 XML 格式：`System` 部分（Provider / EventID / EventRecordID / TimeCreated）+ `EventData` 部分（若干 `Data Name="..."`）。用标准库 `encoding/xml` 就能解析，不需要任何第三方依赖。

**关键知识点**

- 通道全名 `Microsoft-Windows-Sysmon/Operational`；Provider 名 `Microsoft-Windows-Sysmon`。
- `TimeCreated` 的 `SystemTime` 是 ISO8601 带时区偏移，**Sysmon 官方文档明确说事件时间戳是 UTC**，解析后统一转 UTC 存储，避免跨时区串台。
- `EventData/Data` 的**顺序不保证**，字段集合随事件 ID 变化，个别字段可能缺失——不能用固定下标解析。
- 事件文本（`EventData` 之外）通常包含模板化描述，解析时不要依赖它做检测。

**Go 落地思路**

把 `EventData` 收进 `map[string]string`，再按事件 ID 做结构化投影；同时给每个字段打**可信度标签**，下游规则引擎据此决定能不能拿它做"定性"依据。

```go
package sysmon

import (
	"encoding/xml"
	"fmt"
	"strings"
	"time"
)

// eventTypeNames 是 Sysmon 事件 ID 到事件名的映射（Sysmon v15 官方文档口径）。
var eventTypeNames = map[int]string{
	1:   "ProcessCreate",
	2:   "FileCreateTime",
	3:   "NetworkConnect",
	4:   "ServiceStateChange",
	5:   "ProcessTerminate",
	6:   "DriverLoad",
	7:   "ImageLoad",
	8:   "CreateRemoteThread",
	9:   "RawAccessRead",
	10:  "ProcessAccess",
	11:  "FileCreate",
	12:  "RegistryCreateDelete",
	13:  "RegistrySetValue",
	14:  "RegistryRename",
	15:  "FileCreateStreamHash",
	16:  "ServiceConfigurationChange",
	17:  "PipeCreate",
	18:  "PipeConnect",
	19:  "WmiFilter",
	20:  "WmiConsumer",
	21:  "WmiConsumerToFilter",
	22:  "DnsQuery",
	23:  "FileDeleteArchived",
	24:  "ClipboardChange",
	25:  "ProcessTampering",
	26:  "FileDeleteDetected",
	27:  "FileBlockExecutable",
	28:  "FileBlockShredding",
	29:  "FileExecutableDetected",
	255: "Error",
}

// EventTypeName 返回事件 ID 对应的事件名。
func EventTypeName(id int) string {
	if name, ok := eventTypeNames[id]; ok {
		return name
	}
	return fmt.Sprintf("Unknown(%d)", id)
}

// Trust 表示字段的可信度分级。
type Trust int

const (
	// TrustClaimed 字段由被监控进程自述，可能被伪造。
	TrustClaimed Trust = iota
	// TrustDerived 字段由采集端计算得出。
	TrustDerived
	// TrustAttested 字段有内核侧佐证（哈希、签名）。
	TrustAttested
)

func (t Trust) String() string {
	switch t {
	case TrustAttested:
		return "attested"
	case TrustDerived:
		return "derived"
	default:
		return "claimed"
	}
}

// FieldTrust 给出事件字段的可信度分级。
func FieldTrust(field string) Trust {
	switch field {
	case "Hashes", "Signature", "SignatureStatus", "Signed":
		return TrustAttested
	case "ProcessGuid", "LogonGuid", "UtcTime", "SessionId", "ProcessId", "ParentProcessId":
		return TrustDerived
	default:
		return TrustClaimed
	}
}

// SysmonEvent 是解析后的 Sysmon 事件。
type SysmonEvent struct {
	Provider    string            `json:"provider"`
	EventID     int               `json:"event_id"`
	EventName   string            `json:"event_name"`
	TimeCreated time.Time         `json:"time_created"`
	RecordID    uint64            `json:"record_id"`
	Fields      map[string]string `json:"fields"`
}

// ParseEvent 解析 Windows Event Log 的 XML 事件。
func ParseEvent(data []byte) (SysmonEvent, error) {
	var raw struct {
		System struct {
			Provider struct {
				Name string `xml:"Name,attr"`
			} `xml:"Provider"`
			EventID       int    `xml:"EventID"`
			EventRecordID uint64 `xml:"EventRecordID"`
			TimeCreated   struct {
				SystemTime string `xml:"SystemTime,attr"`
			} `xml:"TimeCreated"`
		} `xml:"System"`
		EventData struct {
			Data []struct {
				Name string `xml:"Name,attr"`
				Text string `xml:",chardata"`
			} `xml:"Data"`
		} `xml:"EventData"`
	}
	if err := xml.Unmarshal(data, &raw); err != nil {
		return SysmonEvent{}, fmt.Errorf("parse sysmon event: %w", err)
	}

	ev := SysmonEvent{
		Provider:  raw.System.Provider.Name,
		EventID:   raw.System.EventID,
		EventName: EventTypeName(raw.System.EventID),
		RecordID:  raw.System.EventRecordID,
		Fields:    make(map[string]string, len(raw.EventData.Data)),
	}
	for _, d := range raw.EventData.Data {
		ev.Fields[d.Name] = strings.TrimSpace(d.Text)
	}
	if ts := raw.System.TimeCreated.SystemTime; ts != "" {
		t, err := time.Parse(time.RFC3339Nano, ts)
		if err != nil {
			return SysmonEvent{}, fmt.Errorf("parse event time: %w", err)
		}
		ev.TimeCreated = t.UTC()
	}
	return ev, nil
}

// Field 返回事件字段，第二个返回值表示该字段是否存在。
func (e SysmonEvent) Field(name string) (string, bool) {
	v, ok := e.Fields[name]
	return v, ok
}

// CorrelationKey 返回进程类事件的关联键。
// ProcessId 会被系统复用，只有 ProcessGuid 能稳定关联同一次进程创建。
func (e SysmonEvent) CorrelationKey() string {
	if guid, ok := e.Fields["ProcessGuid"]; ok && guid != "" {
		return guid
	}
	return ""
}
```

### Q8：Sysmon 事件里哪些字段不能直接信？

**简洁答案**

分三档：`claimed`（进程自述，可伪造）、`derived`（采集端推导）、`attested`（有内核侧佐证）。**"可伪造"的一档只能用来做筛选，不能用来做定性结论。**

**关键知识点**

- `Image` / `CommandLine` / `ParentImage` / `OriginalFileName` 是**被监控进程提供的字符串**，完全可以伪造（把自己命名成 `msiexec.exe`、`explorer.exe`）。判定"是不是白名单程序"时不能只看路径名。
- `ProcessId` 会被系统复用；官方文档专门说明 Sysmon 引入 `ProcessGUID` 就是为了"在 Windows 复用进程 ID 时仍能关联事件"。**跨事件关联必须用 `ProcessGuid`。**
- `Hashes` 取决于配置里启用了哪些算法，没启用就**根本没有这个字段**（默认安装只有 SHA1）。
- EID 6（DriverLoad）/ EID 7（ImageLoad）的签名信息是**异步生成**的（为了性能），官方文档明确说签名可能是在文件已被删除之后才生成——所以"签名有效"不等于"文件还在"。
- EID 8（CreateRemoteThread）的 `StartModule` / `StartFunction` 是**推断出来的**，地址不在已加载模块或已知导出函数范围内时会是空的。
- `RuleName` 可能为空（未被过滤规则命中时是 `-`）。

**Go 落地思路**

把可信度做成字段元数据，在规则引擎里区分：需要"attested"证据的规则（确认某文件是恶意样本），如果拿到的字段只是 `claimed`，结论只能降级为"待确认"，不能直接告警。这和之前那篇 [事件标准化与实体关系建模](go-hids-entity-normalization-relationship-modeling.md) 里的实体可信度是同一套思路。

### Q9：Sysmon 和 Security 4688 冲突时信谁？

**简洁答案**

不要试图把两边的 GUID 对齐——它们不是同一套标识体系。冲突时以"字段可信度 + 场景适配"为准：查"执行了什么"信 Sysmon 的命令行，查"以什么权限/令牌执行"信 4688。

**关键知识点**

- 4688 需要"审计进程创建"策略打开，并且要额外打开"记录命令行"，否则 `Process Command Line` 是空的。
- 4688 独有：令牌相关字段（`TokenElevationType`、`ElevatedToken`、`SubjectLogonId`、`MandatoryLabel`），这对判断"提权后执行"很有价值。
- Sysmon 独有：`ProcessGuid`、`ParentProcessGuid`、`SessionId`、多算法哈希，以及**驱动加载 / 镜像加载 / 管道 / WMI / DNS** 等 4688 完全没有的事件类型。
- Sysmon 的 `IntegrityLevel` 与 4688 的 `MandatoryLabel` 语义相近但不等价（一个来自进程令牌完整性级别，一个是 SDDL 形式），跨源合并时要归一化到统一模型。
- 对齐手段：时间窗 + `ParentProcessId`/`ParentImage` + `SubjectLogonId`/`User`；**不要**用 GUID 互相对齐。

**Go 落地思路**

多源合并策略（写进事件管道的设计文档，而不是写在某个函数里）：

```text
同一进程创建事件：
  身份（谁）：Sysmon.ProcessGuid 为主键，4688 用 (NewProcessId + 时间窗) 做二级索引
  行为（做了什么）：Sysmon.CommandLine（4688 缺失时不可用）
  权限（以什么身份）：4688.TokenElevationType 优先，缺失时回落 Sysmon.IntegrityLevel
  冲突处理：字段级择一 + 记录 provenance（来源 + 采集时间），冲突本身也可以作为信号
```

`provenance`（每个字段来自哪个源、什么时候采到的）在多源场景下不是可选项——没有它，事后无法回答"你凭什么说这个进程是高危的"。

### Q10：Sysmon 的过滤规则语义你清楚吗？

**简洁答案**

清楚，而且这是判断"是不是被人下了手脚"的语义基础。规则组合规则：**exclude 优先于 include**；同一字段的多条规则是 OR，不同字段是 AND；所有 condition 大小写不敏感。

**关键知识点（官方条件全集）**

`is`（默认）、`is any`（`;` 分隔）、`is not`、`contains`、`contains any`、`contains all`、`excludes`、`excludes any`、`excludes all`、`begin with`、`end with`、`not begin with`、`not end with`、`less than`、`more than`、`image`。

- `image` 特殊：匹配完整路径或**仅文件名**——`lsass.exe` 会匹配 `c:\windows\system32\lsass.exe`。
- 规则可以命名（`name="network iexplore"`），Sysmon 会在事件里回报命中了哪条规则（`RuleName` 字段），这是把 Sysmon 和自家规则引擎打通的抓手。
- `RuleGroup` 的 `groupRelation`（and/or）可以覆盖组内默认组合方式。
- 一句话记忆：**include 是白名单式收紧，exclude 是黑名单式放宽；exclude 优先**。

**Go 落地思路**

不要把 Sysmon 的过滤语义当成一个黑盒。可以把配置解析成一棵布尔表达式树，对"某条可疑规则会不会命中攻击者的进程"做离线评估——比如把攻击样本的命令行喂进去，看 Sysmon 会不会**过滤掉**它。这在红队模拟和基线评审里非常有用。

### Q11：怎么把"采集覆盖度"做成一个可运营的产品指标？

**简洁答案**

覆盖度 = 配置声明的覆盖度 ∩ 运行时实际产出的覆盖度。两个都要有，只有配置是纸面指标，只有运行时是黑盒。

**关键知识点**

- 配置侧：启用的事件 ID 集合 + 关键字段是否启用（哈希算法是否非空、是否包含 SHA256、网络连接是否开、DriverLoad 是否被排除）。
- 运行时侧：通道里最近 N 小时实际出现过哪些 EID、出现的量级、是否有 EID 255。
- 特别注意 EID 7（ImageLoad）：官方文档说"需要小心配置，监控所有镜像加载会产生巨量日志"——很多客户会主动关掉它。产品上应该把它做成**可关闭但可见**的项，而不是静默丢失。
- 覆盖率不达标 ≠ 被攻击，但也**不能当成正常**：这是"安全能力缺失"，产品上通常单独归类为"基线不合规"。

**Go 落地思路**

```go
package sysmon

// Coverage 评估采集覆盖度：配置声明 vs 运行时实际。
type Coverage struct {
	Declared map[int]bool `json:"declared"` // 配置里启用的事件类型
	Observed map[int]bool `json:"observed"` // 通道里实际出现过的事件类型
	Missing  []int        `json:"missing"`  // 声明了但没看到
	Ratio    float64      `json:"ratio"`    // 实际 / 声明
}

// BuildCoverage 计算覆盖度。
// 注意 Missing 不为空有两种成因：这台机器上确实没发生这类行为，
// 或者采集被压制了。单看单机绝对值无法区分，需要和同类主机横向对比。
func BuildCoverage(declared, observed map[int]bool) Coverage {
	c := Coverage{Declared: declared, Observed: observed}
	for id := range declared {
		if !observed[id] {
			c.Missing = append(c.Missing, id)
		}
	}
	if len(declared) > 0 {
		c.Ratio = float64(len(declared)-len(c.Missing)) / float64(len(declared))
	}
	return c
}
```

### Q12：客户说"装了 Sysmon 但没效果"，你怎么排查？

**简洁答案**

按固定的六步顺序排，不要凭直觉跳步。

**排查步骤**

1. **服务与驱动**：`sc query Sysmon64` / `sc query SysmonDrv`——服务在不在、在不在运行、驱动 ImagePath 对不对。ARM64 机器上重点看驱动是否真的加载。
2. **事件通道**：`wevtutil qe "Microsoft-Windows-Sysmon/Operational" /c:5 /rd:true`——有没有数据、数据是什么时候的。通道空 = 采集断了；通道有数据但很老 = 采集停了但没清理。
3. **配置指纹**：`Rules` 的 SHA-256 与基线比对——被改过就顺着 Q5 的分级表走。
4. **EID 16 / EID 4**：有没有配置变更事件、服务启停事件——时间点能和"没效果"的起始时间对上吗？
5. **Agent 采集范围**：我们的 Agent 是不是根本没订阅这个通道？Sysmon 有数据但 Agent 没读，是另一个经典原因。
6. **日志量**：EID 7 / EID 10 开着的话，日志量会暴涨，通道可能被写满或 Agent 被压垮（EID 255 就是信号）。

**Go 落地思路**

把这六步做成一个**只读的诊断子命令**，客户现场执行后直接产出结构化报告。这是比"教客户怎么查"更有效的交付方式。

采集与健康度判定（零第三方依赖，直接用系统自带工具；生产环境可以换成 `golang.org/x/sys/windows/registry` 和 `EvtQuery` 以避免起进程）：

```go
package sysmon

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/xml"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

// SysmonRegistryPath 是 Sysmon 驱动服务键下存放编译后配置的位置。
const SysmonRegistryPath = `HKLM\SYSTEM\CurrentControlSet\Services\SysmonDrv\Parameters`

// SysmonChannel 是 Sysmon 事件写入的通道。
const SysmonChannel = "Microsoft-Windows-Sysmon/Operational"

// runner 抽象出外部命令，便于测试时替换。
type runner func(ctx context.Context, name string, args ...string) ([]byte, error)

// ParseRegBinary 从 reg.exe query 的输出里解析 REG_BINARY 的字节。
func ParseRegBinary(output string) ([]byte, error) {
	lines := strings.Split(output, "\n")
	for i, line := range lines {
		if !strings.Contains(line, "REG_BINARY") {
			continue
		}
		fields := strings.Fields(line)
		sizeIdx := -1
		declared := 0
		for idx, f := range fields {
			if strings.HasPrefix(f, "0x") {
				sizeIdx = idx
				n, err := strconv.ParseInt(strings.TrimPrefix(f, "0x"), 16, 64)
				if err != nil {
					return nil, fmt.Errorf("reg output: bad size field %q", f)
				}
				declared = int(n)
				break
			}
		}
		if sizeIdx < 0 {
			return nil, fmt.Errorf("reg output: missing size field")
		}
		var data []byte
		for _, f := range fields[sizeIdx+1:] {
			if len(f) != 2 {
				break
			}
			b, err := strconv.ParseUint(f, 16, 8)
			if err != nil {
				break
			}
			data = append(data, byte(b))
		}
		// 大 blob 会被 reg.exe 折行，后续行只有十六进制字节。
		for _, cont := range lines[i+1:] {
			cont = strings.TrimSpace(cont)
			if cont == "" {
				break
			}
			toks := strings.Fields(cont)
			if len(toks) == 0 {
				break
			}
			contBytes := make([]byte, 0, len(toks))
			ok := true
			for _, t := range toks {
				if len(t) != 2 {
					ok = false
					break
				}
				b, err := strconv.ParseUint(t, 16, 8)
				if err != nil {
					ok = false
					break
				}
				contBytes = append(contBytes, byte(b))
			}
			if !ok {
				break
			}
			data = append(data, contBytes...)
		}
		if len(data) == 0 {
			return nil, fmt.Errorf("reg output: no binary payload")
		}
		if declared > 0 && len(data) != declared {
			return nil, fmt.Errorf("reg output: payload truncated, want %d bytes, got %d", declared, len(data))
		}
		return data, nil
	}
	return nil, fmt.Errorf("reg output: REG_BINARY value not found")
}

// RulesFingerprint 返回注册表中编译后 Sysmon 配置的指纹。
func RulesFingerprint(ctx context.Context, run runner) (string, error) {
	out, err := run(ctx, "reg.exe", "query", SysmonRegistryPath, "/v", "Rules")
	if err != nil {
		return "", fmt.Errorf("query sysmon rules: %w", err)
	}
	raw, err := ParseRegBinary(string(out))
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(raw)
	return hex.EncodeToString(sum[:]), nil
}

// ParseServiceState 解析 sc.exe query 的 STATE 字段。
func ParseServiceState(output string) (string, bool) {
	for _, line := range strings.Split(output, "\n") {
		fields := strings.Fields(line)
		if len(fields) >= 4 && strings.EqualFold(fields[0], "STATE") && fields[1] == ":" {
			return strings.Join(fields[2:], " "), true
		}
	}
	return "", false
}

// ParseChannelLastTime 解析 wevtutil 输出的最近一条事件时间。
func ParseChannelLastTime(output []byte) (time.Time, error) {
	start := bytes.IndexByte(output, '<')
	if start < 0 {
		return time.Time{}, fmt.Errorf("wevtutil output: no xml")
	}
	var raw struct {
		System struct {
			TimeCreated struct {
				SystemTime string `xml:"SystemTime,attr"`
			} `xml:"TimeCreated"`
		} `xml:"System"`
	}
	if err := xml.Unmarshal(output[start:], &raw); err != nil {
		return time.Time{}, fmt.Errorf("parse wevtutil xml: %w", err)
	}
	if raw.System.TimeCreated.SystemTime == "" {
		return time.Time{}, fmt.Errorf("wevtutil output: no TimeCreated")
	}
	return time.Parse(time.RFC3339Nano, raw.System.TimeCreated.SystemTime)
}

// ExecRunner 是基于 os/exec 的默认实现。
func ExecRunner(ctx context.Context, name string, args ...string) ([]byte, error) {
	return exec.CommandContext(ctx, name, args...).Output()
}
```

健康度判定与诊断入口：

```go
package sysmon

import (
	"context"
	"fmt"
	"strings"
	"time"
)

// Health 是 Sysmon 部署状态快照。
type Health struct {
	DriverInstalled  bool      `json:"driver_installed"`
	ServiceState     string    `json:"service_state"`
	RulesFingerprint string    `json:"rules_fingerprint"`
	ChannelLastTime  time.Time `json:"channel_last_time"`
}

// AssessHealth 给出部署健康度三态结论。
func AssessHealth(h Health, now time.Time, maxSilence time.Duration) Verdict {
	if !h.DriverInstalled {
		return Verdict{State: "unknown", Reason: "sysmon driver service not found"}
	}
	if !strings.Contains(h.ServiceState, "RUNNING") {
		return Verdict{State: "degraded", Reason: "sysmon service not running: " + h.ServiceState}
	}
	if h.ChannelLastTime.IsZero() {
		return Verdict{State: "unknown", Reason: "no event observed in sysmon channel"}
	}
	if now.Sub(h.ChannelLastTime) > maxSilence {
		return Verdict{
			State:  "degraded",
			Reason: fmt.Sprintf("sysmon channel silent for %s", now.Sub(h.ChannelLastTime).Round(time.Minute)),
		}
	}
	return Verdict{State: "healthy", Reason: "driver, service and event channel are all alive"}
}

// CollectHealth 汇总三层证据：驱动服务、用户态服务、事件通道。
func CollectHealth(ctx context.Context, run runner) (Health, Verdict) {
	now := time.Now().UTC()
	h := Health{}

	if out, err := run(ctx, "sc.exe", "query", "SysmonDrv"); err == nil {
		h.DriverInstalled = strings.Contains(string(out), "SysmonDrv")
	}
	if out, err := run(ctx, "sc.exe", "query", "Sysmon64"); err == nil {
		if state, ok := ParseServiceState(string(out)); ok {
			h.ServiceState = state
		}
	} else {
		// 服务名取决于可执行文件名，Sysmon / Sysmon64 / Sysmon64a 都要试。
		for _, name := range []string{"Sysmon", "Sysmon64a"} {
			out, err := run(ctx, "sc.exe", "query", name)
			if err != nil {
				continue
			}
			if state, ok := ParseServiceState(string(out)); ok {
				h.ServiceState = state
				break
			}
		}
	}
	if fp, err := RulesFingerprint(ctx, run); err == nil {
		h.RulesFingerprint = fp
	}
	if out, err := run(ctx, "wevtutil.exe", "qe", SysmonChannel, "/c:1", "/rd:true"); err == nil {
		if ts, err := ParseChannelLastTime(out); err == nil {
			h.ChannelLastTime = ts
		}
	}
	return h, AssessHealth(h, now, 30*time.Minute)
}
```

## Go 落地思路（整体结构）

把上面的东西拼成一个完整的模块，大概是这样：

```text
internal/sysmon/
├── config.go     # XML 解析、规范化指纹、覆盖度推导
├── coverage.go   # 事件 ID 映射、Diff、Assess
├── event.go      # 事件解析、事件名映射、字段可信度
├── health.go     # 注册表/服务/通道采集与健康度判定
└── source.go     # 事件源适配：读通道 -> 归一化事件 -> 统一事件管道
```

几个设计上的取舍，值得在面试里讲清楚：

**为什么不用 `golang.org/x/sys/windows/registry`？** 不是不能用，是示例里选择了 `reg.exe` 解析，因为：① 零依赖，便于在任意 Go 版本上编译验证；② `reg.exe` 的输出格式是稳定的文本，比自己 cgo 调 `RegGetValue` 更省事。生产环境里我会换成 `x/sys/windows/registry`（避免为每次采集 fork 一个进程），并且用 `golang.org/x/sys/windows` 绑定 `wevtapi.dll` 的 `EvtQuery` 做实时订阅，而不是轮询 `wevtutil`。

**为什么指纹要做两级？** blob 指纹（原始字节）灵敏但对版本升级敏感；语义指纹（解析后规范化）对格式变化免疫但要求能解析二进制 blob——而二进制 blob 的官方格式没有公开文档，社区工具 `sysmon-bin2xml` 也只覆盖部分版本。**所以本篇给出的语义指纹方案，前提是基线里保存了原始 XML 或能拿到 XML 形态的配置源**；拿不到时只能退化为 blob 指纹 + 运行时覆盖度观测。这个边界必须写进产品设计，不能含糊过去。

**为什么结论是四态而不是三态？** 因为 `unknown`（拿不到证据）和 `healthy`（确认正常）在客户沟通里是完全不同的两件事。混淆它们的结果是：Agent 静默失败，客户以为"没问题"，直到出事才发现从来没采到过数据。

**为什么静态采集要低频、事件采集要实时？** 配置指纹每分钟采一次就够（配置不会高频变动），但 EID 16/4 必须实时订阅，否则会漏掉"改完又改回"的短窗口。

## 学习要点 / 知识点地图

**关键路径速查**

| 用途 | 路径 |
| --- | --- |
| 编译后配置（REG_BINARY） | `HKLM\SYSTEM\CurrentControlSet\Services\SysmonDrv\Parameters\Rules` |
| 驱动服务 | `HKLM\SYSTEM\CurrentControlSet\Services\SysmonDrv` |
| 用户态服务 | `HKLM\SYSTEM\CurrentControlSet\Services\Sysmon64`（名字随可执行文件） |
| 事件通道 | `Microsoft-Windows-Sysmon/Operational` |

**命令速查**

```powershell
# 安装（不带配置时启用默认事件集合）
sysmon64.exe -accepteula -i

# 用配置下发（XML 会被编译成二进制写入注册表）
sysmon64.exe -accepteula -i C:\config.xml
sysmon64.exe -c C:\config.xml      # 更新已有安装的配置

# 查看当前生效配置 / 打印 schema
sysmon64.exe -c
sysmon64.exe -s

# 查看通道最近事件
wevtutil qe "Microsoft-Windows-Sysmon/Operational" /c:5 /rd:true

# 查看配置二进制（十六进制）
reg query "HKLM\SYSTEM\CurrentControlSet\Services\SysmonDrv\Parameters" /v Rules
```

**核心事实清单（面试可直接背）**

- Sysmon v15（官方文档版本 v15.22）：内核驱动 `SysmonDrv`（altitude 385201，boot-start）+ 用户态服务（Local System，protected process，描述 "System Monitor service"）。
- 事件类型 1–29 + 255（Error）；**4 和 16 不可被过滤**。
- 默认启用：ProcessCreation、ProcessTermination、DriverLoad、FileCreationTimeChanged + SHA1；默认关闭：网络连接（EID 3）、镜像加载（EID 7）。
- 标签与 EID 不是一一对应：`RegistryEvent`→12/13/14，`PipeEvent`→17/18，`WmiEvent`→19/20/21。
- 过滤语义：exclude 优先于 include；同字段 OR、异字段 AND；condition 大小写不敏感。
- 事件时间戳是 UTC。
- ARM64 必须用 `Sysmon64a.exe`；用 x64 版本会导致驱动装不上、静默无事件。
- 配置由驱动监听注册表变化自动重载；`schemaversion` 与二进制版本相互独立。

## 小练习 / 复盘题

1. 为什么"把 Sysmon 配置文件设为只读"这种加固手段完全无效？换成什么做法才有效？
2. Sysmon 的 `Rules` 注册表值和 `HashingAlgorithm` 分别控制什么？为什么指纹必须和 Sysmon 版本绑定？
3. 一台 Windows 11 ARM64 机器上 `sc query Sysmon64` 显示 RUNNING，但通道里一条事件都没有。列出你的排查顺序，并指出最可能的两个原因。
4. 为什么 `EnabledEventIDs` 只看 XML 会漏掉 EID 1（ProcessCreate）？`EffectiveEventIDs` 补的默认集合是怎么来的？这个近似在什么情况下会出错？
5. 攻击者在你的 Agent 采到配置指纹的两次之间，把 DriverLoad 的 exclude 规则加上又删掉。哪条采集通道能抓住？为什么静态采集抓不住？
6. EID 6 的 `Signature` 字段显示签名有效，但文件已经不在磁盘上了。这和官方文档里哪句话对应？规则引擎该怎么用它？
7. Sysmon 的 EID 1 和 Security 的 4688 都有"进程创建"。列一张字段对照表，说明每个字段该以谁为准、冲突时怎么办。
8. 为什么跨事件关联必须用 `ProcessGuid` 而不是 `ProcessId`？`ParentProcessGuid` 在什么情况下是空的？
9. 官方文档说 EID 7（ImageLoad）会"产生巨量日志"。估算一下：800 台终端、每台每天 2000 次进程创建、平均每次加载 40 个 DLL，EID 7 的日增事件量是多少？你的 Agent 上报链路扛得住吗？
10. 某客户把 EID 10（ProcessAccess）打开后，Sysmon 事件量暴涨且 EID 255 出现。官方文档为什么特别提醒这一点？
11. 你的基线 XML 里有 `<NetworkConnect onmatch="include"><DestinationPort>443</DestinationPort></NetworkConnect>`。攻击者用 8443 端口外联，这条会被记录吗？这条配置对检测"外联"到底好不好？
12. Sysmon 的 `image` 条件和 `contains` 条件有什么区别？为什么 `image` 条件对攻击者更友好？
13. `RuleGroup` 的 `groupRelation="and"` 和默认行为有什么区别？什么时候必须用它？
14. 如果客户的 Sysmon 是用 `-d` 改名安装的（驱动名不是 `SysmonDrv`），你的 Agent 采集逻辑要怎么适配？
15. Sysmon 的服务描述是 "System Monitor service"。这个字符串能用来判断"是不是 Sysmon"吗？攻击者能改吗？
16. 设计一个"Sysmon 采集缺口"的告警：需要哪几个数据源？误报主要来自哪里？怎么降噪？
17. 你的语义指纹基于 XML 解析。那注册表里的二进制 blob 怎么变成 XML？这条路在生产上可靠吗，缺口在哪？
18. 客户要求"证明 Sysmon 没被降级"。你会向客户交付哪几项证据？这些证据分别需要什么权限？
19. `Health` 采集里 `ChannelLastTime` 超过阈值就判定 degraded。阈值该定多少？不同版本的 Sysmon 事件量差异很大，你怎么避免误报？
20. 如果 EID 16（配置变更）被产品用作高优先级告警，攻击者能不能用"直接改注册表"来规避？如果能，你的双通道设计具体怎么落地？

## 参考资料

- [Sysmon - Sysinternals | Microsoft Learn](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)
- [SysmonCommunityGuide（trustedsec）](https://github.com/trustedsec/SysmonCommunityGuide)
- [sysmon-bin2xml（配置二进制反向还原工具）](https://github.com/thejanit0r/sysmon-bin2xml)

> 边界说明：本文基于官方文档与社区指南核对，代码已在本地通过编译与单元测试验证；未在真实 Windows 主机上执行 Sysmon 安装/配置篡改实验。标注为"近似"或"需在目标机核验"的项包括：`installDefaultEventIDs` 的默认值集合（依赖安装时是否带配置文件）、直接改注册表 `Rules` 是否一定产生 EID 16、事件通道在客户环境中的实际保留策略。
