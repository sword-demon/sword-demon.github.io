---
title: Go 主机安全面试：Linux 文件句柄越权访问与 open_by_handle_at 检测
date: 2026-11-03 17:08:00
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- file-handle
---

# Go 主机安全面试：Linux 文件句柄越权访问与 open_by_handle_at 检测

`openat(2)` 用“路径 + 目录 fd”打开文件，`name_to_handle_at(2)` 和 `open_by_handle_at(2)` 则把这件事拆成两步：先取得一个不透明的文件句柄，再凭句柄打开文件。句柄不要求路径继续存在，也不要求调用者沿着目录逐级查找，因此它既是用户态文件服务器的正常基础设施，也是主机安全里需要单独建模的越权入口。

这类行为的特点不是“看起来像后门”，而是“同一套系统调用在错误的能力、挂载视图和目标文件组合下，绕过了基于路径的检查”。检测的重点不是看到一次调用就告警，而是回答：谁拥有 `CAP_DAC_READ_SEARCH`、拿着哪个文件系统的 mount fd、打开了什么类型的句柄、调用成功还是失败、之后是否读取了敏感文件。

## 岗位场景

```text
Web 服务或容器进程被利用
  -> 攻击者发现进程具备 CAP_DAC_READ_SEARCH，或容器被额外授予该能力
  -> 读取 mountinfo，取得目标文件所在文件系统的 mount fd
  -> name_to_handle_at 取得目标文件句柄
  -> open_by_handle_at 绕过路径白名单、bind mount 遮蔽或 chroot 视图
  -> 读取凭据、配置、宿主文件，或继续寻找提权/横向路径
  -> Go Agent 关联 syscall、能力、mount namespace、返回码和后续行为
  -> 输出“谁在按句柄打开哪个文件系统的什么对象”
```

阶段要拆开看：取得句柄、取得 mount fd、真正打开文件、读取内容、修改文件，是五个不同事件。只看到 `name_to_handle_at` 成功，不能推导出越权读取已经完成。

## 高频面试题

### 1. `name_to_handle_at` 和 `open_by_handle_at` 分别做什么？`file_handle` 里有什么？

**简洁答案：** `name_to_handle_at` 根据路径返回一个不透明文件句柄和 mount ID；`open_by_handle_at` 根据这个句柄和 mount fd 打开文件，返回新的文件描述符。句柄由文件系统解释，调用者不应自己解析内部字节；`file_handle` 至少包含 `handle_bytes`、`handle_type` 和柔性数组 `f_handle`。

**关键知识点：**

- 两个系统调用从 Linux 2.6.39 开始提供，设计目标之一是支持用户态文件服务器：服务端生成句柄，客户端之后凭句柄找回文件。
- `handle_bytes` 是入参也是出参。调用前表示缓冲区大小，成功后表示实际写入的字节数；传 0 可用 `EOVERFLOW` 探测所需大小。
- `EOVERFLOW` 有两种含义：缓冲区太小，或者该路径在支持句柄的文件系统上仍然拿不到句柄。前者会增加 `handle_bytes`，后者通常不会。
- `handle_type` 和 `f_handle` 由具体文件系统定义；不同文件系统之间不能假定句柄可移植。
- `MAX_HANDLE_SZ` 目前通常是 128 字节，但手册明确它不是未来文件系统的硬上限，代码应使用常量并处理扩容。
- `mount_fd` 可以是目标文件系统中的任意对象；特殊值 `AT_FDCWD` 表示调用者当前工作目录。句柄只在这个 mount fd 对应的文件系统语境里有意义。
- `flags` 基本沿用 `open(2)`；如果句柄指向符号链接，必须使用 `O_PATH`，此时不会解引用链接。
- `name_to_handle_at` 支持 `AT_EMPTY_PATH`（对已有 fd 取句柄）和 `AT_SYMLINK_FOLLOW`；较新内核还增加了 `AT_HANDLE_FID`、`AT_HANDLE_MNT_ID_UNIQUE`、`AT_HANDLE_CONNECTABLE` 等标志，旧 Agent 不能假设只存在老标志。
- 句柄可以跨进程传递。一个进程取得句柄，另一个进程只要拿到 mount fd 和句柄，也可能完成打开。

**Go 落地思路：** 已有 `golang.org/x/sys/unix` 时，直接用 `unix.NameToHandleAt(dirfd, path, flags)` 和 `unix.OpenByHandleAt(mountFD, handle, flags)`，不要手写 `file_handle` 结构体。事件里保留 `handle.Type()`、`handle.Size()` 和句柄字节的哈希；原始字节只用于短期关联，不作为长期日志字段。

### 2. 为什么 `open_by_handle_at` 需要 `CAP_DAC_READ_SEARCH`？它到底绕过了什么？

**简洁答案：** 这是内核对该系统调用的显式能力要求。`CAP_DAC_READ_SEARCH` 允许进程绕过文件读权限检查，以及目录读和执行权限检查；因此它不再需要通过路径逐级搜索目录，也能打开原本因权限或路径视图而不可见的对象。但它不是“任意读取一切”：仍然受 mount fd 指向的文件系统、挂载命名空间、LSM、seccomp 和文件系统是否支持句柄等条件约束。

**关键知识点：**

- `capabilities(7)` 对 `CAP_DAC_READ_SEARCH` 的描述包括：绕过文件读权限检查、目录读/执行权限检查、调用 `open_by_handle_at(2)`，以及用 `linkat(2)` 的 `AT_EMPTY_PATH` 为 fd 创建链接。
- `CAP_DAC_READ_SEARCH` 的能力位是 bit 1，数值为 2；`CapEff` 中置位只说明“当前有效”，还要看 `CapPrm`、`CapBnd`、`NoNewPrivs` 和 seccomp 状态。
- root 默认通常拥有完整能力集，所以“进程有该能力”本身不是恶意信号。真正有区分度的是：非文件服务进程为什么需要它、它打开的 mount fd 指向哪里、目标是否敏感。
- 用户命名空间会影响能力是否对目标资源有效。容器里看到 `CapEff` 置位，不代表它对宿主文件系统拥有同样的能力。
- seccomp 可能在能力检查之前或之外直接返回 `EPERM`；此时单看 errno 无法区分“没有能力”和“被 seccomp 拦截”。

**Go 落地思路：** 从 `/proc/<pid>/status` 读取 `CapEff`，把能力判断做成独立函数，避免每个规则各写一遍位运算。下面这段代码只解析能力，不负责判断恶意：

```go
import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
)

const capDACReadSearch = uint64(1) << 1

func parseCapEff(status []byte) (uint64, error) {
	for _, line := range strings.Split(string(status), "\n") {
		if v, ok := strings.CutPrefix(line, "CapEff:"); ok {
			return strconv.ParseUint(strings.TrimSpace(v), 16, 64)
		}
	}
	return 0, errors.New("CapEff not found")
}

func hasDACReadSearch(pid int) (bool, error) {
	data, err := os.ReadFile(fmt.Sprintf("/proc/%d/status", pid))
	if err != nil {
		return false, err
	}
	caps, err := parseCapEff(data)
	if err != nil {
		return false, err
	}
	return caps&capDACReadSearch != 0, nil
}
```

### 3. `mount_fd` 从哪里来？为什么 mount ID 不能当作持久标识？

**简洁答案：** `mount_fd` 是目标文件系统中任意对象的 fd，通常可以打开 `/proc/<pid>/mountinfo` 第五列的挂载点得到；也可以来自继承 fd、`SCM_RIGHTS` 传递或 `/proc/<pid>/root` 等路径。`name_to_handle_at` 返回的 mount ID 对应 mountinfo 第一列，但 mount ID 在卸载后可能被复用，不能当作跨时间的稳定主键。

**关键知识点：**

- `mountinfo` 的一行依次是：mount ID、parent ID、`major:minor`、文件系统内根路径、挂载点、挂载选项、若干可选字段、`-` 分隔符、文件系统类型、挂载源、super options。
- 可选字段数量不固定，解析时不能把第七列直接当成文件系统类型；应先找到单独的 `-`。
- 挂载点中的空格、制表符、换行和反斜杠会被转义为 `\040`、`\011`、`\012`、`\134`，不能只看字面字符。
- mount ID 只在当前挂载命名空间内有意义；不同命名空间里的同一个数字可能对应不同挂载。稳定关联应组合 mount namespace inode、设备号、挂载点和文件系统类型，必要时再派生设备 UUID。
- bind mount 会改变路径视图，但不一定改变底层文件系统；这正是“路径看不见，句柄仍可能打开”的原因之一。
- `/proc/<pid>/fdinfo/<fd>` 中的 `mnt_id` 可以帮助判断 fd 属于哪个挂载，但它同样受命名空间和 fd 生命周期影响。

**Go 落地思路：** 缓存键不要只用 `mount_id`，至少用 `(mntns_inode, mount_id, major:minor, mount_point)`；进程 exec、setuid、进入新 mount namespace 或容器重建后要失效缓存。解析 mountinfo 时先按空白切分，再解码转义，最后把 `-` 之后的两列作为 fstype 和 source。

### 4. 为什么它能绕过路径控制？容器里成立的条件是什么？

**简洁答案：** 路径控制依赖“从某个根开始逐级查找”的过程；`open_by_handle_at` 直接用文件系统句柄定位对象，绕过了路径查找，因此可能绕过 chroot 视图、bind mount 遮蔽、路径白名单和部分基于路径的审计。容器内要成立，至少需要进程实际拥有 `CAP_DAC_READ_SEARCH`，并且能拿到指向目标文件系统的 mount fd；如果目标在宿主文件系统上，还要跨过用户命名空间、LSM、seccomp 和挂载隔离。

**关键知识点：**

- `chroot` 和 `pivot_root` 在有足够能力的进程面前不是强安全边界；路径看不到，不等于底层文件系统不可达。
- mount fd 可能来自特权容器、hostPath/共享挂载、从父进程继承的 fd、`SCM_RIGHTS` 传递，或 `/proc/1/root` 这类入口。没有 mount fd 时，句柄本身不足以定位任意文件系统。
- 用户命名空间里的能力是否对宿主文件系统有效，取决于资源所属的用户命名空间；不能只看容器内的 UID 和 `CapEff`。
- 公开的 shocker 类容器逃逸案例说明的是“能力 + 可达文件系统”的组合风险，不是 `open_by_handle_at` 本身的内核漏洞；默认能力集和 seccomp 配置会直接影响是否成立。
- LSM 仍可能在文件打开路径上做检查，但是否覆盖、策略是否启用因环境而异；不能把“有 LSM”当成绝对阻断。
- `AT_FDCWD` 只把 mount fd 限定在当前工作目录；它不是任意文件系统的通配符。

**Go 落地思路：** 事件归一化时，把 mount fd 解析成 `mount_point`、`fstype`、`major:minor` 和 `mntns_inode`，再标记 `host_sensitive_mount`（如宿主根、容器数据目录、配置目录）和 `cross_namespace`。如果 mount fd 来自父进程继承，单独记录 `fd_inherited=true`；这类 fd 比现场打开的 fd 更值得关注。

### 5. 采集 `open_by_handle_at` 时，事件里应该记录什么？

**简洁答案：** 至少要记录进程实例、有效能力、mount fd、mount ID/挂载点/文件系统、句柄类型和大小、句柄哈希、flags、返回值/errno、seccomp 和 `NoNewPrivs` 状态、命名空间、cgroup/容器，以及调用前后的关联行为。还要区分 `name_to_handle_at` 与 `open_by_handle_at`，并把“尝试、被拒、成功、后续读取”分成不同状态。

**关键知识点：**

- eBPF 可以在 `syscalls:sys_enter_open_by_handle_at` 读取 `mount_fd`、`handle` 指针和 `flags`，在 `sys_exit` 读取返回值；句柄内容需要用 `bpf_probe_read_user` 有界读取，先读头部，再按 `handle_bytes` 读取，且设置上限。
- auditd 可以用 `-S open_by_handle_at`（必要时同时审计 `name_to_handle_at`）记录 `SYSCALL` 参数和退出码；seccomp 拒绝时还可能出现独立的 `SECCOMP` 记录，不能只看 `EPERM`。
- 句柄可以跨进程传递，所以关联键不能只有 pid；可以用“句柄类型 + 句柄哈希 + mount 标识 + 时间窗口”做弱关联，再用进程树、fd 继承和 IPC 证据增强。
- `/proc/<pid>/status` 提供能力和 `NoNewPrivs`，`/proc/<pid>/ns/*` 提供命名空间 inode，`/proc/<pid>/fdinfo/<fd>` 提供 `mnt_id` 等 fd 元数据；这些读取都应有超时、大小上限和失败缺口标记。
- 原始句柄字节可能包含文件系统内部标识，不适合长期明文保存；保存哈希、类型、长度和短期关联值即可。
- 只采集 `open_by_handle_at` 会漏掉“先取句柄、稍后由另一个进程打开”的链路；至少要把两个 syscall 放在同一台主机、同一时间窗内关联。

**Go 落地思路：** ring buffer 回调只做固定大小拷贝和入队，不在回调里读 `/proc`、做哈希或写日志；由有界 worker 池完成能力、mountinfo 和容器上下文补全。队列满时记录 `dropped_events`，不要静默丢弃后再宣称“没有发现”。

### 6. `EPERM`、`ESTALE`、`EINVAL`、`EOPNOTSUPP` 分别说明什么？怎样避免误判？

**简洁答案：** `EPERM` 通常表示缺少 `CAP_DAC_READ_SEARCH`，也可能是 seccomp/LSM 拒绝；`ESTALE` 表示句柄失效，常见于文件被删除、移动或句柄类型不支持再次打开；`EINVAL` 表示句柄格式/长度不合法；`EOPNOTSUPP` 表示文件系统不支持句柄解码。它们分别对应不同阶段，不能统一写成“打开失败”。

**关键知识点：**

- `name_to_handle_at` 的 `EOVERFLOW` 可能是缓冲区太小，也可能是该路径没有可用句柄；通过 `handle_bytes` 是否增加来区分。
- `open_by_handle_at` 的 `ESTALE` 可能来自文件已删除、使用 `AT_HANDLE_FID` 取得的句柄不支持打开，或 `AT_HANDLE_CONNECTABLE` 句柄对应的文件被移动到不同父目录。
- `EINVAL` 包括 `handle_bytes` 为 0 或超过上限；这类事件更像探测、实现错误或畸形输入，而不是正常文件服务。
- `EBADF` 可能是 mount fd 已关闭，也可能是 fd 被复用后指向了别的对象；必须结合 fd 生命周期和进程实例判断。
- 高频率 `ESTALE` 在备份、恢复和文件服务中可能是正常的；高频率 `EPERM` 更像能力探测，但仍要结合进程来源。
- seccomp 返回的 `EPERM` 与能力不足的 `EPERM` 在 syscall 退出码上相同，需要额外的 `Seccomp` 状态或 audit `SECCOMP` 记录才能区分。

**Go 落地思路：** 用 `errors.Is(err, unix.EPERM)` 等方法保留原始 errno，再映射成 `denied_by_capability`、`denied_by_seccomp`、`stale_handle`、`unsupported_filesystem`、`invalid_handle`、`bad_mount_fd` 等状态；未知 errno 保留数字，不要强行归类。

### 7. 哪些正常场景会调用它？基线应该怎么建？

**简洁答案：** 用户态文件服务器、备份/恢复、检查点/快照、文件系统工具和部分管理脚本可能合法使用文件句柄；root 进程默认也可能具备所需能力。基线应按可执行文件哈希、父进程、容器镜像、能力集、mount fd 的文件系统类型、调用频率、成功率和目标敏感度建立，而不是只按进程名放行。

**关键知识点：**

- 进程名和命令行可以被伪装；`/proc/<pid>/exe` 的路径也可能被替换。更稳的基线键包括 exe inode/hash、父进程链、cgroup、容器 ID、镜像 digest 和启动时间。
- 同一个二进制在不同主机角色上行为可能不同：文件服务器高频调用是正常，Web 进程低频调用则更可疑。
- root 默认拥有大量能力，不能把“root + `open_by_handle_at`”直接判恶意；要看 mount fd 是否指向宿主敏感文件系统、目标是否是凭据/配置、是否伴随异常子进程。
- 备份窗口、NFS/Samba 类文件服务、容器检查点恢复都可能产生成批句柄操作；允许列表应有作用域、过期时间和审计记录。
- 允许列表本身就是攻击面：攻击者可以替换被允许的二进制，或借用其参数。应结合哈希、签名、父进程和行为，而不是只匹配名字。

**Go 落地思路：** 基线键可以用 `(exe_hash, parent_exe_hash, container_id, mount_fstype, handle_type)`，并记录首次出现时间、样本数和最近一次命中。冷启动阶段先观察不自动放行；对“新二进制 + 具备能力 + 宿主敏感 mount”的组合直接提高风险等级。

### 8. 告警如何降噪，并还原攻击链？

**简洁答案：** 不要用单次 syscall 定恶意。把“能力枚举/挂载探测 -> 取得句柄 -> 打开句柄 -> 访问敏感对象 -> 执行或外联”串成时间窗，再结合调用是否成功、mount fd 是否指向宿主文件系统、进程是否罕见、目标是否敏感进行评分。成功且跨命名空间访问宿主敏感文件，优先级应显著高于孤立的 `EPERM` 探测。

**关键知识点：**

- 证据分三层：原始 syscall（参数、返回值）、上下文（能力、命名空间、容器、mount）、行为（读取了哪些文件、是否执行、是否外联）。告警解释要能指出用了哪一层。
- 常见误报包括 root 管理脚本、文件服务、备份窗口和容器运行时；这些场景也可能与攻击行为重叠，不能简单永久抑制。
- 关联键要用 `pid + starttime + boot_id`，避免 PID 复用把两个进程拼在一起；句柄哈希和 mount 标识用于跨进程关联。
- 事件可能乱序或迟到，规则引擎要有 watermark 和有限等待窗口；窗口过大造成内存膨胀，过小造成链路断裂。
- 同一进程重复尝试同一句柄时应聚合，而不是每个 syscall 一条告警；聚合结果保留首次、末次、次数、成功/失败分布。

**Go 落地思路：** 规则状态按进程实例和句柄哈希分桶，设置 TTL 和容量上限；告警对象包含 `evidence`、`suppressed_by`、`coverage_gaps` 和 `first_seen/last_seen`。如果因为维护窗口抑制，仍保留低优先级审计事件，避免攻击者利用维护窗口完全隐身。

### 9. Go Agent 如何做到低开销、可验证？

**简洁答案：** 让 eBPF 在 syscall 入口/出口完成过滤和最小字段采集，Go 侧异步补全能力、mount 和容器上下文；使用有界队列、缓存和聚合，避免在热路径读 `/proc` 或处理无界句柄字节；同时用隔离环境中的 POC 做成功/失败/被 seccomp 拦截三类验证，并持续监控事件丢失。

**关键知识点：**

- eBPF 侧要遵守 verifier 限制：循环有界、读取用户内存前检查长度、句柄读取设置最大字节数、不要把大结构体直接塞进 ring buffer。
- ring buffer 满、perf buffer 丢事件、audit backlog 溢出都表现为“没有告警”，必须单独上报采集健康度。
- `/proc` 补全要缓存，但缓存必须在 exec、setuid、mount namespace 变化、容器重建时失效；只用 pid 做键会受 PID 复用影响。
- 自测至少覆盖：无能力时 `EPERM`、有能力时成功、seccomp 拦截时 `EPERM`、文件系统不支持时 `EOPNOTSUPP`、句柄失效时 `ESTALE`。
- 性能指标包括事件速率、入队/出队延迟、丢弃数、补全失败率、缓存命中率和规则耗时；只测平均延迟不够，要看高负载下的尾延迟。
- 如果内核不支持所需 tracepoint 或 BTF，应该有 auditd/替代采集的降级路径，并明确覆盖缺口。

**Go 落地思路：** 用固定大小的 ring buffer 事件结构，回调只拷贝字段；worker 池按 CPU 数量和有界 channel 消费；缓存使用带容量上限的 LRU，不用无界 `map`。规则层对同一进程实例做速率限制和聚合，避免攻击者用高频失败调用拖垮 Agent。

### 10. 如何防御、做 POC 和白盒测试？

**简洁答案：** 首选移除不需要的 `CAP_DAC_READ_SEARCH`，再用 seccomp 阻断 `open_by_handle_at`、启用 `no-new-privileges`、限制宿主挂载和 fd 继承，并保留检测作为纵深防御。POC 应在一次性 Linux 虚拟机或隔离容器中，用支持文件句柄的文件系统验证“无能力失败、有能力成功、seccomp 拒绝”三条路径，不能在真实生产主机上直接试验。

**关键知识点：**

- 容器场景优先使用 `--cap-drop=DAC_READ_SEARCH`、`no-new-privileges` 和运行时默认 seccomp；是否默认拦截、默认能力集是否包含该能力，取决于运行时版本和配置，必须实测。
- 大多数业务进程不需要按句柄打开文件；只有文件服务、备份/恢复、检查点等明确场景才考虑放行。
- 减少 hostPath、privileged、共享 mount fd 和 `/proc/1/root` 暴露；这些入口让“能力 + mount fd”更容易凑齐。
- POC 要使用 ext4/XFS 等支持句柄的文件系统；在 tmpfs、`/proc`、`/sys` 或部分网络文件系统上可能得到 `EOPNOTSUPP`，不能据此判断检测逻辑错误。
- 白盒测试应覆盖句柄大小边界、mountinfo 转义、PID 复用、fd 复用、seccomp 与能力两种 `EPERM`、事件丢失和规则抑制。
- 防御不是只靠一条规则：能力收窄、seccomp、挂载隔离、LSM、审计和检测要组合使用；任何一层失效都不应让攻击者直接拿到宿主文件。

**Go 落地思路：** 用 `x/sys/unix` 写一个最小 POC，验证句柄取得和打开；生产 Agent 的测试则用合成事件覆盖错误分支，避免依赖真实内核实验：

```go
func openByHandle(path, mountPoint string) (*os.File, error) {
	mountFD, err := unix.Open(mountPoint, unix.O_PATH|unix.O_DIRECTORY, 0)
	if err != nil {
		return nil, err
	}
	defer unix.Close(mountFD)

	handle, _, err := unix.NameToHandleAt(unix.AT_FDCWD, path, 0)
	if err != nil {
		return nil, err
	}
	fd, err := unix.OpenByHandleAt(mountFD, handle, unix.O_RDONLY)
	if err != nil {
		return nil, err
	}
	return os.NewFile(uintptr(fd), path), nil
}
```

`path` 必须和 `mountPoint` 在同一个文件系统上；否则句柄与 mount fd 不匹配，可能得到 `ESTALE` 或 `EINVAL`。测试无能力场景时，预期是 `EPERM`；如果得到 `EOPNOTSUPP`，先检查文件系统是否支持句柄，而不是直接认定权限逻辑错误。

## Go 实现要点

一个够用的检测链可以分成四层：

1. **事件层：** 采集 `name_to_handle_at` 和 `open_by_handle_at` 的入口/退出，记录 mount fd、flags、返回值、errno、进程实例；句柄只读固定上限，保存类型、长度和哈希。
2. **归因层：** 用 pid + starttime + boot ID 绑定进程实例，读取 `CapEff`、`NoNewPrivs`、`Seccomp`、mount namespace、cgroup/容器和 mountinfo；所有读取失败都写入覆盖缺口。
3. **检测层：** 把能力、mount fd 目标、跨命名空间、句柄类型、成功/失败、目标敏感度和进程基线组合评分；区分“尝试”“被拒”“成功”“后续读取”。
4. **治理层：** 用时间窗聚合、进程/句柄去重、允许列表和维护窗口降噪；保留 `suppressed_by` 和采集健康度，避免把“没有事件”误报成“没有行为”。

一个够用的事件结构：

```go
type HandleEvent struct {
	At          time.Time
	Phase       string // name_to_handle、open_by_handle
	PID         int
	TGID        int
	StartTime   uint64
	MountFD     int32
	MountID     uint64
	HandleType  int32
	HandleSize  uint32
	HandleHash  [16]byte
	Flags       uint32
	ReturnCode  int64
	Errno       string
	CoverageGap []string
}
```

Go 侧不要把原始句柄字节放进告警正文；用截断哈希做关联，原始字节只在有明确取证需求时短期保存，并设置访问控制。

## 学习要点

| 方向 | 需要掌握 |
| --- | --- |
| 系统调用 | `name_to_handle_at`、`open_by_handle_at`、`openat`、`file_handle`、mount fd、`AT_EMPTY_PATH` |
| 权限边界 | `CAP_DAC_READ_SEARCH`、`CapEff`/`CapPrm`/`CapBnd`、`NoNewPrivs`、seccomp、LSM |
| 文件系统 | 句柄类型、`MAX_HANDLE_SZ`、`ESTALE`、`EOPNOTSUPP`、ext4/XFS/NFS/overlayfs 差异 |
| 挂载与容器 | mountinfo、mount ID 复用、mount namespace、bind mount、hostPath、fd 继承 |
| 采集链路 | eBPF `sys_enter/sys_exit`、auditd、procfs status/fdinfo/ns、ring buffer 丢事件 |
| 检测设计 | 能力基线、跨命名空间、敏感目标、调用序列、错误码分类、PID/fd 复用 |
| 降噪与性能 | 进程基线、文件服务白名单、时间窗聚合、有界队列、缓存失效、尾延迟 |

## 小练习 / 复盘题

1. 画出从“发现 `CAP_DAC_READ_SEARCH`”到“读取宿主敏感文件”的完整链路，并标出 Go Agent 至少五个可观测点。
2. 解释为什么 root 进程调用 `open_by_handle_at` 不能直接告警，并给出三个能提高区分度的上下文字段。
3. 写一个 mountinfo 解析器，处理挂载点中的空格、可选字段和 `-` 分隔符；为至少四个边界样本写测试。
4. 在一次性 Linux 虚拟机中做 POC：分别测试无能力、有能力、seccomp 拦截三种情况，记录 errno 和审计/采集结果。
5. 设计一条针对用户态文件服务器的允许规则，说明作用域、过期时间、证据和如何防止二进制替换。
6. 如果要求“不保存原始句柄字节”，设计关联和取证方案，说明会损失哪些能力。
7. 模拟 PID 复用：旧进程退出、新进程复用 PID，说明规则状态如何避免把两者拼成一条攻击链。
8. 客户报告“发生了句柄越权但没有告警”，按采集覆盖、能力、seccomp、文件系统支持、事件丢失和规则抑制六层写出排查顺序。

## 参考资料

1. [Linux man-pages：open_by_handle_at(2)](https://man7.org/linux/man-pages/man2/open_by_handle_at.2.html)
2. [Linux man-pages：capabilities(7)](https://man7.org/linux/man-pages/man7/capabilities.7.html)
3. [Linux man-pages：proc_pid_mountinfo(5)](https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html)
4. [Linux man-pages：proc_pid_fdinfo(5)](https://man7.org/linux/man-pages/man5/proc_pid_fdinfo.5.html)
5. [Linux man-pages：proc_pid_status(5)](https://man7.org/linux/man-pages/man5/proc_pid_status.5.html)
6. [Go x/sys/unix：NameToHandleAt](https://pkg.go.dev/golang.org/x/sys/unix#NameToHandleAt)
7. [Go x/sys/unix：OpenByHandleAt](https://pkg.go.dev/golang.org/x/sys/unix#OpenByHandleAt)
