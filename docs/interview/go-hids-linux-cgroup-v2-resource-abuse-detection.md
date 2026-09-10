---
title: Go主机安全面试：Linux cgroup v2 资源滥用与容器异常行为检测
date: 2026-09-10 17:05:39
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- container
- cgroup
---

# Go 主机安全面试：Linux cgroup v2 资源滥用与容器异常行为检测

容器里的异常行为不一定先表现为恶意命令，也可能表现为持续抢占 CPU、制造内存压力、耗尽 PID、频繁触发 OOM，或者篡改 cgroup 控制文件逃避资源限制。面试官通常会追问：Go Agent 如何识别一个进程属于哪个 cgroup？怎样区分正常业务高负载和资源型攻击？cgroup v2 的统计文件怎么采集，如何把资源证据和进程、容器、镜像关联起来？

## 岗位场景

```text
Linux 主机 / 容器节点
  -> 读取进程 cgroup、容器元数据和 cgroup v2 统计文件
  -> 采集 cpu.stat、memory.events、io.stat、pids.events 与 PSI
  -> 关联进程树、镜像、Pod、用户、命令行和控制文件变更
  -> 区分业务高负载、资源配置错误、拒绝服务和逃逸前兆
  -> 输出带时间窗口、阈值和证据链的可解释告警
```

这类题考的是 Linux cgroup v2、容器上下文、资源监控、Go 文件解析、采样性能和检测降噪。重点不是记住某一个阈值，而是能解释“资源为什么异常、谁造成了异常、限制是否生效、平台是否能复盘”。

## 高频面试题

### 1. cgroup v2 和 cgroup v1 有什么关键区别？

简洁答案：cgroup v2 使用统一层级，控制器通过 `cgroup.subtree_control` 在子树中启用；资源统计和控制文件的语义更一致，Agent 不应继续假设 v1 下每个 controller 都有独立层级。

关键知识点：

- v2 通常挂载在 `/sys/fs/cgroup`，进程的归属可以从 `/proc/<pid>/cgroup` 解析。
- `cpu.max`、`memory.max`、`pids.max` 等文件描述限制；`cpu.stat`、`memory.events`、`pids.events` 等文件描述结果。
- 一个非根 cgroup 不能同时作为有进程的叶子节点和有子 cgroup 的内部节点，采集器要理解这种层级约束。
- 兼容旧发行版时，必须先判断挂载类型和文件是否存在，不要把读取失败直接当成攻击。

### 2. 只看 CPU 使用率，为什么不能判断资源滥用？

简洁答案：CPU 高只能说明资源消耗高，不能说明主体、原因和影响。检测至少要结合 cgroup 限额、节流、进程行为、历史基线和业务角色。

关键知识点：

- `cpu.stat` 的 `nr_throttled` 和 `throttled_usec` 能说明是否长期撞上 CPU 限制。
- 同样的 95% CPU，批处理任务可能是正常行为，未知容器里持续 fork 加密或扫描文件则更可疑。
- 资源异常要保留时间窗口，比较使用量增量，而不是把累计 `usage_usec` 当作瞬时值。
- 告警应区分“资源超限”“资源耗尽风险”和“伴随攻击行为”，避免把所有高负载都升级成安全告警。

### 3. `memory.events` 能提供哪些检测证据？

简洁答案：它能反映 cgroup 内存压力和限制结果，例如 `high`、`max`、`oom`、`oom_kill`。这些计数需要按采样窗口计算增量。

Go 落地思路：

```go
func readEventCounters(path string) (map[string]uint64, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	out := make(map[string]uint64)
	scan := bufio.NewScanner(f)
	for scan.Scan() {
		fields := strings.Fields(scan.Text())
		if len(fields) != 2 {
			continue
		}
		n, err := strconv.ParseUint(fields[1], 10, 64)
		if err != nil {
			continue
		}
		out[fields[0]] = n
	}
	if err := scan.Err(); err != nil {
		return nil, err
	}
	return out, nil
}
```

- `oom_kill` 在一个采样窗口内增加，通常比“内存使用率高”更接近实际影响。
- `high` 持续增加表示业务频繁触碰高水位，可能导致延迟抖动。
- 计数器重置、cgroup 删除重建和容器重启都要结合 cgroup inode、容器 ID 或启动时间处理。

### 4. Go Agent 如何低开销采集大量 cgroup？

简洁答案：事件驱动字段优先，周期采样做补充；缓存 cgroup 路径和容器元数据，用固定周期读取少量统计文件，不要每个进程事件都递归扫描整个 cgroup 树。

Go 落地思路：

```go
type CgroupSample struct {
	Path       string
	CPUUsage   uint64
	Throttled  uint64
	OOMKills   uint64
	PIDMax     uint64
	Collected  time.Time
}

func delta(current, previous map[string]uint64, key string) uint64 {
	now, ok := current[key]
	old, hadOld := previous[key]
	if !ok || !hadOld || now < old {
		return 0
	}
	return now - old
}
```

- 采样周期按主机规模和事件量调整，优先保证高风险 cgroup 的新鲜度。
- 统计文件读取失败时保留错误原因，例如 `deleted`、`permission_denied`、`unsupported`，不要静默填零。
- 使用 cgroup inode 或稳定路径作为短期缓存键，防止容器重建后复用旧状态。
- `memory.current`、`cpu.stat` 等累计值需要保存上次快照后计算增量，单次值不能直接用于速率判断。

### 5. 如何检测 PID 耗尽或 fork 炸弹？

简洁答案：结合 `pids.current`、`pids.max`、`pids.events` 和进程创建速率。`pids.current` 接近上限只是风险，`pids.events` 中 `max` 持续增加才说明限制已经被触发。

关键知识点：

- 记录触发限制的 cgroup、最早出现时间、相关进程树和父进程命令行。
- 容器启动探针、编译任务和短时批处理也可能快速创建大量进程，需要结合历史基线。
- 如果父进程位于宿主机而子进程进入容器 cgroup，要重点核对运行时行为和 cgroup 迁移事件。
- 采集器本身不能为了追踪每个短进程而无限增加开销，应保留汇总计数和代表性样本。

### 6. 如何识别 cgroup 配置被篡改？

简洁答案：监控敏感控制文件的写入和层级变化，并将变更主体与容器运行时、编排系统和管理员操作关联。重点文件包括 `cgroup.subtree_control`、`cpu.max`、`memory.max`、`pids.max` 和 `cgroup.procs`。

```text
控制文件写入
  -> 记录写入进程、UID、容器 ID、cgroup 路径和旧后值
  -> 判断是否来自 kubelet、containerd、systemd 或授权运维工具
  -> 关联随后 5 分钟内的 CPU、内存、PID、文件和网络异常
  -> 输出“策略变更”或“策略变更 + 资源滥用”告警
```

不要只要看到 `cgroup.procs` 有变化就告警。容器启动、进程退出和运行时调度都会产生合法迁移；真正有价值的是“谁发起迁移、迁移到哪里、是否绕过既有边界、之后是否出现异常资源行为”。

### 7. PSI 在资源型攻击检测中有什么用？

简洁答案：PSI 描述 CPU、内存和 IO 压力导致的等待情况，比单看使用率更接近业务是否真的受到资源争用影响。cgroup v2 可提供对应资源的压力文件，主机级 PSI 可作为整体背景。

关键知识点：

- CPU 使用率高但没有业务等待，不一定需要告警；内存 `some` 或 `full` 压力持续升高则更值得关注。
- PSI 适合和 `memory.events`、`io.stat`、进程创建速率组合，而不是单独设一个固定阈值。
- 记录 `avg10`、`avg60`、`avg300` 及采样时间，避免把一次尖峰当成长时间攻击。
- 内核版本和挂载配置可能影响可用文件，采集器要把“不支持”与“读取异常”区分开。

### 8. 客户说“容器资源告警是误报”，怎么定位？

简洁答案：先固定容器 ID、cgroup 路径、时间窗口和规则版本，再核对资源增量、限额、进程树、镜像入口、部署变更和运维操作。最后用脱敏快照重放，而不是直接放宽阈值。

排查顺序：

1. 确认 `cpu.stat`、`memory.events`、`pids.events` 的增量是否真实存在。
2. 确认 cgroup 是否在窗口内被删除、重建或迁移，避免把两个容器的计数拼到一起。
3. 关联进程命令行、文件访问、外联、控制文件写入和 Kubernetes 审计事件。
4. 判断是业务基线变化、资源配置错误、采集关联错误，还是确有攻击行为。
5. 若需要调阈值，按镜像、工作负载和环境范围调整，并保留审计记录。

## 通俗答案

可以把 cgroup 想成每个容器的资源账本：`cpu.stat` 记录 CPU 花了多少，`memory.events` 记录内存限制被撞了几次，`pids.events` 记录进程数是否触顶，PSI 记录大家是否在排队等资源。面试时不要只说“定时读取文件”，要说明如何计算增量、如何处理容器重建、如何关联进程和控制文件，以及如何把正常高负载和攻击行为分开。

## Go 落地设计要点

```go
type ResourceEvidence struct {
	ContainerID string
	CgroupPath string
	ProcessKey  string
	CPUDelta    uint64
	OOMKills    uint64
	PIDMaxHits  uint64
	Pressure    string
	ObservedAt  time.Time
}

func shouldAlert(e ResourceEvidence) bool {
	return e.OOMKills > 0 || e.PIDMaxHits > 0 ||
		(e.CPUDelta > 0 && strings.Contains(e.Pressure, "full"))
}
```

- 证据结构同时保留资源、主体和时间，便于服务端关联而不是只上报一个分数。
- 规则应优先使用增量和组合条件，单一资源高值只能作为风险信号。
- 采集失败、容器消失和版本不支持都要有可观测状态。
- 资源型检测不能替代运行时安全策略；`pids.max`、`memory.max` 等限制仍应由编排和运行时正确配置。

## 学习要点

| 模块 | 需要掌握的点 |
| --- | --- |
| Linux 基础 | cgroup v2 层级、controller、控制文件、PSI |
| 容器安全 | 容器 ID、cgroup 迁移、运行时与编排操作关联 |
| 检测规则 | 计数器增量、资源组合、时间窗口、基线降噪 |
| Go 工程 | `/proc` 与 cgroup 文件解析、缓存、采样、错误分类 |
| 线上排障 | 容器重建、计数器重置、规则版本、脱敏事件回放 |

## 小练习

1. 设计一个采样器：每 10 秒读取一组 cgroup 的 `cpu.stat` 和 `memory.events`，计算增量并处理 cgroup 删除重建。
2. 设计一条检测规则：`pids.events:max` 增加，同时出现异常 shell 和对外连接时，告警中必须展示哪些证据？
3. 对比“业务编译任务”和“容器内 fork 炸弹”两种样本，说明如何用进程树、PSI 和历史基线降低误报。

## 参考资料

- [Control Group v2](https://docs.kernel.org/admin-guide/cgroup-v2.html)
- [Pressure Stall Information](https://docs.kernel.org/accounting/psi.html)
