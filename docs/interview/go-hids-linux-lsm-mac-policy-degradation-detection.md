---
title: Go 主机安全面试：Linux LSM 强制访问控制降级与策略篡改检测
date: 2026-11-13 17:20:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- linux
- selinux
- apparmor
---

# Go 主机安全面试：Linux LSM 强制访问控制降级与策略篡改检测

主机安全里有一类事件从不产生"可疑行为"，却直接决定了后面所有行为能不能被拦住：**强制访问控制（MAC）自己被关掉了**。

Linux 上的 MAC 主要由两个玩家提供：SELinux（RHEL/CentOS 的默认选择），基于 Type Enforcement；AppArmor（Ubuntu/Debian 的默认选择），基于可执行文件路径的 profile。两者都能防住同一件事：攻击者拿下 root 或业务账号之后，用一个高危的操作——比如读 `/etc/shadow`、写系统目录、加载内核模块。EDR 看得见"谁做了什么"，MAC 决定"这件事到底允不允许发生"。

## 岗位场景

```text
客户主机（Ubuntu，AppArmor + auditd）遇到奇怪的 root 进程
-> audit.log 里看到连续的 apparmor="ALLOWED" 而不是 "DENIED"
-> Agent 需要回答：
   1) 现在启用了哪些 LSM？一个真正在强制？
   2) AppArmor 被切成了 complain？什么时候？
   3) /etc/apparmor.d 的 profile 和内核里对得上？
   4) 降级期间哪些进程执行了原本会被拒的操作？
```

真正的难点是**第 4 问**：降级本身不是入侵证据，只是把后续行为变合法了。需要把降级和异常行为串成一条链。

## 高频面试题

### 1. LSM 框架是什么？SELinux 和 AppArmor 能同时强制生效吗？

**答案：** LSM 是内核钩子框架，capabilities 总是启用；可以有多个 minor 模块，**最多一个 major 模块**。SELinux 和 AppArmor 都是 major 候选，**互斥**。生效模块列表在 `/sys/kernel/security/lsm`，逗号分隔。

**Go 要点：** 读 `/sys/kernel/security/lsm` 一次性回答"MAC 到底是谁"。列表变短=某个 minor 模块被摘掉（如 yama，摘掉后 ptrace 限制失效）。

### 2. SELinux 的 enforcing / permissive / disabled 三种模式有什么区别？

**答案：** `enforcing` = 阻断并记录；`permissive` = 只记录不阻断；`disabled` = 基本关闭。关键：将 `SELINUX=disabled` 写进 `/etc/selinux/config` 是**已废弃**的，官方推荐的关闭方式是启动参数 `selinux=0`。

**Go 要点：** 要区分两个层面：
- `/etc/selinux/config` 的 `SELINUX=` -> 持久配置（下次启动生效）
- `/sys/fs/selinux/enforce` -> 当前内核运行态（1=强制，0=宽松）

攻击者用 `setenforce 0` 是立刻生效；想重启后仍然降级要改配置文件。两条都要看，不然会漏掉。

### 3. 运行时怎么确定 SELinux 当前是 enforcing 还是 permissive？

**答案：** 读 `/sys/fs/selinux/enforce`：`1` = enforcing，`0` = permissive。selinuxfs 暴露了一组 inode（`load`、`enforce`、`status` 等），权限位很说明问题——`enforce` 是 `S_IRUGO|S_IWUSR`（全局可读，只有 root 可写）。

**Go 要点：** 区分"读不到"和"读到 0"。前者可能没启用 SELinux，后者明确是 permissive。很多实现会把这两种错误混淆。

### 4. `semanage permissive -a <domain>` 做了什么？

**答案：** 把**指定的某个域**单独设为 permissive，只有那个域不再被阻断。比全局 permissive 影响面小，所以从行为上看不出来，**只能从策略配置本身看出来**。`semanage permissive -l` 会列出自定义的 permissive 域。

**Go 要点：** 这是"配置层检测"的经典。推荐做法不是解析 `semanage` 的输出，而是采集 `semanage export`，做**前后 diff**——任何本地定制的新增/删除都是强信号。

### 5. AppArmor 的 enforce / complain 两种模式怎么区分？

**答案：** enforce 下被拒的操作会被**阻断并记录**；complain 下**只记录不阻断**（日志里表现为 `apparmor="ALLOWED"` 而不是 `apparmor="DENIED"`）。全局 complain 的开关是 `/sys/module/apparmor/parameters/mode`。

**Go 要点：** 三个 AppArmor 参数对应三种不同意图：
- `parameters/mode` enforce -> complain = **防护失效**，高危
- `parameters/audit` = **审计行为改变**，中危（要跟基线比）
- `parameters/debug` 0 -> 1 = 调试开启，低危

### 6. `/etc/apparmor.d/` 的 profile 和内核已加载的对不上，说明什么？

**答案：** 两个方向含义不同：
- **磁盘有、内核没有** = 防护缺口（策略存在但没生效）
- **内核有、磁盘没有** = 内存残留（或"磁盘上删了文件、内核里还有的规避手法"）

**Go 要点：** 命名惯例是把路径里的 `/` 换成 `.`。所以 `/usr/sbin/sshd` 的 profile 文件叫 `usr.sbin.sshd`。直接字符串比永远不相等——必须**归一化**。

```go
// normalizeProfileKey 把 profile 路径与磁盘文件名归一到同一个键。
func normalizeProfileKey(name string) string {
	name = strings.TrimSpace(name)
	if i := strings.Index(name, "//"); i > 0 {
		name = name[:i] // hat profile 用 // 连接父 profile，对账时按父 profile 归并
	}
	name = strings.TrimPrefix(name, "/")
	return strings.ReplaceAll(name, "/", ".")
}
```

### 7. `apparmor_parser -R` 卸载 profile 之后，对已经运行的进程还有效吗？

**答案：** **立刻生效**。卸载会立即对已经在运行的受约束进程解除约束。AppArmor 文档明确写了：when kernel profile 被替换时，正在运行的受约束进程**立即**应用新 profile。已经无约束的进程无法被约束。

**Go 要点：** 卸载 profile 的效果是"**即刻全局开口**"。结合 profile 对账：`NotLoaded` 里出现敏感 profile（sshd、nginx）就是高价值告警；`NotOnDisk`（内核有、磁盘没了）也要报，因为可能是"先删文件、再卸载"的规避顺序。

### 8. 启动参数层面的持久化降级怎么检测？

**答案：** 读 `/proc/cmdline`，匹配 `selinux=0`、`lsm=`、`apparmor.mode=complain` 等参数。这些是**重启后依然生效**的降级。

**Go 要点：** 启动参数是低频高价值项，按内容哈希上报，不要每周期全量推。这类参数优先级高于运行态设置（如 `selinux=0` 优先级高于 `/etc/selinux/config`）。

### 9. 怎么把"策略降级"和"攻击行为"串成一条攻击链？

**答案：** 降级是**上下文**，行为是**证据**。把降级事件作为时间窗口内的"防护失效区间"，在这段时间内发生的可疑行为加权升级；同时把降级作为**辅助信号**，不是独立的高危告警。

**Go 要点：** 产品上最实用的是"**降级窗口 + 行为加权**"而不是新增告警类型。合法降级期间如果没人干坏事，就不产生噪音。降级后干坏事时，告警自带"此时防护已被关闭"的解释。

### 10. 如何区分"运维合法降级"和"恶意降级"？

**答案：** 靠**变更通道 + 上下文 + 行为**三重收敛。合法降级走统一管理通道（`semanage`/`semodule`/`apparmor_parser`），会在本地定制集合里留下结构化痕迹；攻击者为了不留痕迹反而可能直接改文件。结合 audit 记录、sudo 记录可以归因到具体的人/自动化任务。

**Go 要点：** 把降级做成**带上下文的上下文事件**，按维度决定告警等级而不是布尔开关。基线必须按发行版建立，不能硬编码"必须有 selinux"。

## Go 落地思路

整条链路在 Go 里拆成三步，每一步都可以单独单测。

**第一步：采集快照。** 所有路径都通过 `root` 前缀参数注入，这样单测可以用临时目录造假文件系统，不需要 root 权限，也不污染真实主机。

```go
package lsm

import (
	"os"
	"path/filepath"
	"strings"
)

// Snapshot 描述一台主机在某一时刻的 LSM 强制访问控制状态。
type Snapshot struct {
	ActiveLSMs     []string
	SELinuxMode    string // enforcing / permissive / disabled
	SELinuxEnforce string // selinuxfs enforce 原始值：1=强制，0=宽松
	SELinuxStore   string // /etc/selinux/config 里的 SELINUXTYPE
	AppArmorMode   string // enforce / complain
	DiskProfiles   []string // /etc/apparmor.d 下的 profile 文件名
	LoadedProfiles []string // 内核中已加载的 profile
}

// Collect 采集快照。root 用于给系统路径加前缀，方便单测注入假文件系统。
func Collect(root string) Snapshot {
	cfg := readString(filepath.Join(root, "/etc/selinux/config"))
	return Snapshot{
		ActiveLSMs:     parseLSMList(readString(filepath.Join(root, "/sys/kernel/security/lsm"))),
		SELinuxMode:    parseKV(cfg, "SELINUX"),
		SELinuxEnforce: strings.TrimSpace(readString(filepath.Join(root, "/sys/fs/selinux/enforce"))),
		SELinuxStore:   parseKV(cfg, "SELINUXTYPE"),
		AppArmorMode:   strings.TrimSpace(readString(filepath.Join(root, "/sys/module/apparmor/parameters/mode"))),
		DiskProfiles:   listDiskProfiles(filepath.Join(root, "/etc/apparmor.d")),
		LoadedProfiles: parseProfileList(readString(filepath.Join(root, "/sys/kernel/security/apparmor/profiles"))),
	}
}

func readString(path string) string {
	b, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	return string(b)
}

// parseLSMList 解析 /sys/kernel/security/lsm，逗号分隔的启用模块列表。
func parseLSMList(s string) []string {
	var out []string
	for _, part := range strings.Split(s, ",") {
		if p := strings.TrimSpace(part); p != "" {
			out = append(out, p)
		}
	}
	return out
}

// parseKV 解析 KEY=VALUE 形式的配置文件，忽略空行与 # 注释。
func parseKV(s, key string) string {
	for _, line := range strings.Split(s, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if !ok || strings.TrimSpace(k) != key {
			continue
		}
		return strings.TrimSpace(v)
	}
	return ""
}

// listDiskProfiles 列出 /etc/apparmor.d 下的 profile 文件，跳过子目录与隐藏文件。
func listDiskProfiles(dir string) []string {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil
	}
	var out []string
	for _, e := range entries {
		if e.IsDir() || strings.HasPrefix(e.Name(), ".") {
			continue
		}
		out = append(out, e.Name())
	}
	return out
}

// parseProfileList 解析内核已加载的 profile 列表，兼容附加了模式后缀的输出。
func parseProfileList(s string) []string {
	var out []string
	for _, line := range strings.Split(s, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		if i := strings.IndexByte(line, ' '); i > 0 {
			line = line[:i]
		}
		if i := strings.IndexByte(line, '('); i > 0 {
			line = line[:i]
		}
		out = append(out, line)
	}
	return out
}
```

**第二步：磁盘与内核对账。** 核心是归一化键，否则磁盘上的 `usr.sbin.sshd` 和内核里的 `/usr/sbin/sshd` 永远比不相等。

```go
// ProfileDiff 描述磁盘 profile 与内核已加载 profile 的差异。
type ProfileDiff struct {
	NotLoaded []string // 磁盘上有，内核里没有：防护缺口
	NotOnDisk []string // 内核里有，磁盘上没有：内存残留
}

// ReconcileProfiles 对账磁盘 profile 与内核已加载 profile。
func ReconcileProfiles(disk, loaded []string) ProfileDiff {
	onDisk := map[string]string{}
	for _, f := range disk {
		onDisk[normalizeProfileKey(f)] = f
	}
	inKernel := map[string]string{}
	for _, p := range loaded {
		inKernel[normalizeProfileKey(p)] = p
	}
	diff := ProfileDiff{}
	for key, file := range onDisk {
		if _, ok := inKernel[key]; !ok {
			diff.NotLoaded = append(diff.NotLoaded, file)
		}
	}
	for key, profile := range inKernel {
		if _, ok := onDisk[key]; !ok {
			diff.NotOnDisk = append(diff.NotOnDisk, profile)
		}
	}
	sort.Strings(diff.NotLoaded)
	sort.Strings(diff.NotOnDisk)
	return diff
}
```

**第三步：判定与分级。** 判定逻辑写成**纯函数**，输入两次快照输出 findings，才能被充分单测。

```go
// Finding 表示一条策略降级发现。
type Finding struct {
	Code     string
	Severity string // info / medium / high / critical
	Detail   string
}

// Evaluate 对比两次快照，给出 LSM 降级结论。
func Evaluate(before, after Snapshot) []Finding {
	var findings []Finding
	add := func(code, severity, detail string) {
		findings = append(findings, Finding{Code: code, Severity: severity, Detail: detail})
	}

	if !sameStringSet(before.ActiveLSMs, after.ActiveLSMs) {
		add("lsm_list_changed", "critical",
			fmt.Sprintf("启用的 LSM 列表变化: %v -> %v", before.ActiveLSMs, after.ActiveLSMs))
	}
	if before.SELinuxMode != after.SELinuxMode {
		sev := "high"
		if after.SELinuxMode == "disabled" {
			sev = "critical"
		}
		add("selinux_mode_changed", sev,
			fmt.Sprintf("SELinux 模式变化: %s -> %s", before.SELinuxMode, after.SELinuxMode))
	}
	if before.SELinuxEnforce == "1" && after.SELinuxEnforce == "0" {
		add("selinux_enforce_dropped", "critical",
			"selinuxfs enforce 由 1 变为 0，内核已切换到 permissive")
	}
	if before.SELinuxStore != "" && after.SELinuxStore != "" && before.SELinuxStore != after.SELinuxStore {
		add("selinux_store_changed", "high",
			fmt.Sprintf("SELinux 策略类型变化: %s -> %s", before.SELinuxStore, after.SELinuxStore))
	}
	if before.AppArmorMode == "enforce" && after.AppArmorMode == "complain" {
		add("apparmor_global_complain", "high",
			"AppArmor 全局模式切换为 complain，约束不再阻断")
	}

	diff := ReconcileProfiles(after.DiskProfiles, after.LoadedProfiles)
	for _, p := range diff.NotLoaded {
		add("apparmor_profile_not_loaded", "high",
			fmt.Sprintf("profile %s 在磁盘存在但内核未加载", p))
	}
	for _, p := range diff.NotOnDisk {
		add("apparmor_profile_ghost", "medium",
			fmt.Sprintf("profile %s 仍驻留内核但磁盘已无对应文件", p))
	}
	return findings
}

func sameStringSet(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	ma, mb := toSet(a), toSet(b)
	for k := range ma {
		if !mb[k] {
			return false
		}
	}
	return true
}

func toSet(items []string) map[string]bool {
	m := make(map[string]bool, len(items))
	for _, item := range items {
		m[item] = true
	}
	return m
}
```

三个设计要点：

1. **采集与判定分离**：`Collect` 只负责把世界读进来，`Evaluate` 是纯函数。纯函数可以喂任意历史快照重放，规则上线后回溯历史数据不需要重装 Agent。
2. **对账基于当前快照，不基于前后 diff**：`NotLoaded` / `NotOnDisk` 是"当前这一秒"的对账结果，diff 是额外的"变化了"信号，两者要分开上报。
3. **缺失 ≠ 值为零**：`readString` 失败返回空串，调用方必须区分"没有这个文件"（可能压根没启用 MAC）和"文件里有值"。生产实现建议让 `Collect` 返回 `(Snapshot, error)`，或在 Snapshot 里显式记录每项的采集状态。

## 学习要点

- LSM 框架明确：capabilities 永远启用，最多一个 major 模块
- SELinux 与 AppArmor 互斥；同一台机器最多一个真正在强制
- `selinuxfs`/securityfs 暴露的就是内核状态，是单一事实来源
- profile 对账要**归一化键**，不然磁盘和内核永远比不相等
- 降级本身不是入侵证据，是上下文；关键是**降级 + 异常行为**的链路
- 配置层（semanage/semodule 的本地定制）比单点文件监控更稳
- 基线管理按发行版和维度分层，而不是布尔开关

## 小练习

1. 区分：磁盘 profile 文件 `usr.sbin.sshd` 与内核 `/usr/sbin/sshd` 怎么对账？
2. AppArmor 的 `parameters/mode` 和 `parameters/audit` 的区别是什么？前者改了不一定产生告警，为什么？
3. 如果 SELinux 的 `enforce` 从 1 变成 0，同期 `SELINUX=enforcing` 没变，说明了什么？
4. 给定 `/proc/cmdline` 里有 `selinux=0 apparmor.mode=complain`，这台机器 MAC 状态应该怎么判？
5. 客户反馈"最近 AppArmor profile 被卸载了"，怎么取证是运维操作还是恶意行为？
6. `/etc/apparmor.d` 下的 profile 被删了，但 `/sys/kernel/security/apparmor/profiles` 里还能看到，说明什么？
7. 如果攻击者先做 `semanage permissive -a httpd_t`，再做恶意操作，怎么检测？
8. 列出至少三个 AppArmor profile 和它们被卸载后的直接后果。

## 参考资料

- Linux Kernel LSM Documentation: `admin-guide/LSM/`
- Linux v6.12 `security/selinux/selinuxfs.c` / `security/selinux/ss.c`
- man-pages: `selinux(8)`, `setenforce(8)`, `getenforce(8)`, `semanage(8)`, `semanage-permissive(8)`, `semodule(8)`
- Ubuntu manpages: `apparmor(7)`, `apparmor_parser(8)`, `aa-status(8)`
