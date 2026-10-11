---
title: Go主机安全面试：Linux Landlock沙箱与异常访问检测
date: 2026-10-11 09:00:00
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- landlock
- sandbox
---

# Go 主机安全面试：Linux Landlock 沙箱与异常访问检测

Linux 主机安全 Agent 不只要发现攻击，也要尽量限制自身和子进程的影响范围。Landlock 是 Linux 提供的非特权访问控制机制，适合给 Agent 的辅助进程、文件解析器、样本分析器或脚本执行器增加文件系统、网络端口等访问边界。

但面试官通常不会只问“Landlock 是什么”，而会继续追问：它和 seccomp、SELinux 有什么区别？Go 程序怎样兼容不同内核？为什么规则生效后仍然可能读到敏感数据？如何把异常拒绝事件、进程链、命名空间和攻击行为关联起来？

## 岗位场景

```text
主机上的 Go EDR Agent
  -> 启动文件解析器、脚本检查器或样本分析子进程
  -> 查询 Landlock ABI，按能力构造最小规则集
  -> 限制子进程访问目录、执行文件和网络端口
  -> 采集拒绝访问、规则启用失败和进程上下文
  -> 关联 Web RCE、临时目录执行、敏感文件访问和外联
  -> 输出“防护生效”或“能力降级”的可解释结果
```

Landlock 的重点是“进程主动把自己的权限边界收窄”。它不是万能的系统级策略，也不能替代进程事件、文件事件和网络事件采集。检测岗位里要同时讲清楚防护、观测和降级三个方面。

## 高频面试题

### 1. Landlock 解决什么问题？和 seccomp、SELinux 有什么区别？

**简洁答案：** Landlock 主要限制进程及其后代对文件层次、网络端口等对象的访问；seccomp 主要限制系统调用；SELinux、AppArmor 等通常由系统管理员配置全局或系统级安全策略。三者可以叠加，但解决的问题不同。

**关键知识点：**

- Landlock 是进程自限制机制，进程可以在不具备全局特权的情况下收窄自己的访问范围。
- seccomp 更适合限制 `openat`、`execve`、`connect` 等系统调用的调用形状、参数或系统调用集合。
- Landlock 更关注“访问哪个对象、执行哪类操作”，例如只允许读取 `/usr`，禁止向工作目录写文件。
- SELinux、AppArmor 的策略来源和管理边界不同，不能把 Landlock 当作它们的轻量替代品。
- 安全产品应避免只依赖某一种机制：策略负责阻断，事件采集负责解释，基线和规则负责检测。

**Go 落地思路：**

- 事件模型中把 `policy_type` 标成 `landlock`、`seccomp` 或 `lsm`，不要把不同机制混成一个“沙箱已开启”布尔值。
- Agent 负责给高风险子进程设置最小权限；检测侧仍然采集进程、文件、网络和退出结果。
- 规则匹配优先使用结构化字段，例如 `policy_enabled`、`handled_access`、`abi_version` 和 `child_executable`。

### 2. Landlock 的基本调用顺序是什么？

**简洁答案：** 先查询能力，再创建 ruleset，添加规则，确保满足 `no_new_privs` 或权限条件，最后调用 `landlock_restrict_self`。规则成功应用到当前线程后，后续创建的子进程会继承限制。

**关键知识点：**

- 常见系统调用是 `landlock_create_ruleset`、`landlock_add_rule` 和 `landlock_restrict_self`。
- 创建 ruleset 时要声明准备处理的访问类型；添加规则时不能超出已声明的范围。
- `landlock_restrict_self` 作用于调用线程，不应默认认为整个多线程进程已经同步受限。
- 规则一旦生效不能被移除，只能继续叠加更严格的限制。
- 实际程序要在创建子进程前完成策略设置，否则子进程可能已经继承了不符合预期的文件描述符或权限状态。

**Go 落地思路：**

可以把策略应用封装成一个只返回错误的窄函数，不引入状态机：

```go
func sandboxChild() error {
	abi, err := queryLandlockABI()
	if err != nil || abi < 1 {
		return fmt.Errorf("landlock unavailable: %w", err)
	}

	ruleset, err := createReadOnlyRuleset(abi)
	if err != nil {
		return err
	}
	defer unix.Close(ruleset)

	if err := unix.Prctl(unix.PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0); err != nil {
		return err
	}
	return restrictSelf(ruleset)
}
```

这里的 `queryLandlockABI`、`createReadOnlyRuleset` 和 `restrictSelf` 应直接封装系统调用，不要为了几个调用再引入沙箱框架。真正启动子进程时，可以在 `exec.Cmd` 的 `SysProcAttr` 或子进程入口中明确执行策略，避免父进程和子进程的职责混在一起。

### 3. 为什么要查询 Landlock ABI，而不是只判断 Linux 内核版本？

**简洁答案：** Landlock 的能力按 ABI 演进，发行版可能回移补丁，内核版本也不等于实际支持的 Landlock 特性。程序应该查询运行中的 ABI，并只使用双方都支持的访问位。

**关键知识点：**

- 新的访问权限可能只在较新的 ABI 中存在。
- 如果把未知访问位直接传入 ruleset，可能得到 `EINVAL`，导致整个沙箱初始化失败。
- 不能把“内核版本足够新”当作“当前内核一定启用了 Landlock”。
- 兼容逻辑应是“查询 -> 掩码裁剪 -> 构造规则”，而不是按版本号硬编码一张永远正确的表。

**Go 落地思路：**

```go
const (
	accessRead  = 1 << 2
	accessExec  = 1 << 0
	accessWrite = 1 << 1
)

func handledAccess(abi int, requested uint64) uint64 {
	// 实际代码按 ABI 清理不支持的访问位；这里只保留业务请求的子集。
	supported := querySupportedAccessMask(abi)
	return requested & supported
}
```

生产代码应以系统头文件或项目已使用的 `unix` 常量为准，并把“查询失败、ABI 太旧、规则创建失败”分别记录。不要把所有错误都压成 `unsupported`，否则客户排查时无法区分内核未启用、权限条件不满足和参数错误。

### 4. 怎样为 Go EDR 的样本解析子进程设计最小 Landlock 策略？

**简洁答案：** 先列出子进程真正需要的资源，再默认拒绝不需要的操作。解析器通常只需要读取系统库和输入样本，把输出写到专用目录；不应直接拥有任意目录写入、任意可执行文件执行和任意网络访问能力。

**关键知识点：**

- 规则设计要从工作流出发：输入目录、依赖目录、输出目录、临时目录和网络需求分别列清楚。
- “允许读取 `/`”再靠代码约束不是最小权限，目录范围应尽量窄。
- 对需要写结果的程序，只给专用输出目录写权限；不要因为方便而放开整个 `/tmp`。
- 如果解析器需要网络更新规则，应只放开固定端口或交给父进程完成下载。
- 已经打开的文件描述符可能不受后续路径策略影响，启动前的 fd 继承必须单独控制。

**Go 落地思路：**

```go
cmd := exec.CommandContext(ctx, parserPath, inputPath, outputDir)
cmd.Env = []string{"PATH=/usr/bin:/bin"}
cmd.Dir = outputDir
cmd.ExtraFiles = nil // 不把父进程的敏感 fd 传给解析器

// 子进程入口：设置 no_new_privs，应用 Landlock，再执行解析器。
cmd.Env = append(cmd.Env, "EDR_SANDBOX=landlock")
```

策略之外还要做三件事：关闭不需要的继承 fd、限制环境变量、给子进程设置资源上限。Landlock 只解决访问边界，不能替代超时、CPU、内存和输出大小限制。

### 5. 如何检测异常的 Landlock 使用或策略拒绝？

**简洁答案：** 不能看到 `landlock_restrict_self` 就直接告警，因为安全 Agent、浏览器、构建工具和解析器都可能合法使用 Landlock。应关注“谁启用了策略、策略前后发生了什么、拒绝访问的对象是否敏感、调用链是否来自可疑进程”。

**关键知识点：**

- Landlock 是自限制，启用本身不代表攻击；安全产品自己的沙箱行为应进入基线。
- 高价值证据包括进程路径、父子链、UID、容器和 mount namespace、ABI、处理的权限位、规则初始化结果和拒绝对象。
- 发生访问拒绝时，要区分应用自身的预期探测失败、兼容性问题和利用过程中的异常访问。
- Web 进程或临时目录脚本突然启动沙箱 API，不一定是恶意，但如果同时访问敏感目录、执行解释器或建立外联，风险会升高。
- 仅有“规则拒绝”无法还原完整攻击链，必须与 exec、文件、网络和提权事件关联。

**Go 落地思路：**

```go
type LandlockEvent struct {
	PID            uint32
	ParentPID      uint32
	ABI            int
	HandledAccess  uint64
	Operation      string
	Target         string
	Result         string
	NamespaceInode string
	Source         string
}
```

Landlock 本身不是通用的主机事件流。受控子进程可以记录被拒绝操作的错误码，主机检测侧再按环境结合 syscall、audit 或 LSM 观测能力补全上下文。采集侧可以对策略初始化失败、拒绝访问和规则叠加次数分别计数；检测侧用 `process_start -> landlock_setup -> sensitive_access_denied -> outbound` 这种短时间链路做风险提升。对 Agent 自身、已签名浏览器和固定版本解析器，应做窄范围基线，而不是全局关闭 Landlock 规则。

### 6. Landlock 已经启用后，为什么仍可能读到敏感数据？

**简洁答案：** Landlock 约束的是后续访问行为，不会自动回收进程已经打开的文件描述符，也不是内存隔离机制。策略只覆盖声明处理的访问类型，未处理的权限不能假设会自动受到限制。

**关键知识点：**

- 父进程如果把敏感文件 fd 传给子进程，子进程可能通过该 fd 继续使用已经获得的访问能力。
- 已经打开的文件、目录或 socket 与之后按路径重新打开是两种不同场景。
- 未声明为 handled 的访问权限不能被当作“默认已拒绝”；策略必须显式声明需要控制的权限。
- mount namespace、用户 namespace 和真实路径映射会影响事件解释，采集时要保留 namespace 上下文。
- Landlock 不是加密、内存清理或反调试能力，不能回答所有“数据是否泄露”的问题。

**Go 落地思路：**

- 使用 `cmd.ExtraFiles = nil`，并在需要时显式设置 `CloseOnExec`，避免 fd 泄露。
- 父进程只把输入文件复制到沙箱输入目录，不直接传递数据库、密钥或日志文件 fd。
- 事件中保留 `fd_source`、`mount_id`、`pid_start_time` 和 `namespace`，避免 PID 重用造成错误归因。
- 对输出目录和临时目录设置独立配额，防止解析器把允许的写权限变成磁盘消耗。

### 7. Landlock 初始化失败时，Agent 应该怎样降级？

**简洁答案：** 先判断失败原因，再选择阻断、受控降级或跳过该子进程。不能把所有初始化错误都当成“功能可用”，也不能因为一个内核不支持就让主 Agent 完全退出。

**关键知识点：**

- 内核不支持或启动时禁用：记录能力缺失，使用更低权限的替代方案或不运行高风险插件。
- `no_new_privs` 设置失败：说明当前进程条件不满足，不能假设规则会安全生效。
- 参数错误：优先修复规则构造，不要静默降级，否则会把代码 bug 伪装成环境限制。
- 初始化成功但后续拒绝访问：这是沙箱运行结果，不是能力缺失。
- 关键检测链路需要明确“保护已开启”和“保护未开启”两个状态，告警中展示证据缺口。

**Go 落地思路：**

```go
type SandboxCapability struct {
	Available bool
	ABI       int
	State     string // enabled, unsupported, failed, degraded
	Reason    string
}

func shouldRunUntrustedParser(cap SandboxCapability) bool {
	return cap.State == "enabled"
}
```

这里不需要引入复杂状态机。每个子进程启动时记录一次能力状态，按错误类型统计计数，并在恢复后上报 `sandbox_recovered`。如果解析任务可以隔离到专用低权限账号或容器中，降级时应切换到更弱但明确的隔离层，而不是直接恢复到 Agent 主权限。

### 8. 如何降低 Landlock 相关告警的误报？

**简洁答案：** 以“主体、策略、对象、结果、上下文”五个维度做分层判断，保留被抑制事件的计数和原因。不能只按进程名、系统调用名或目标路径做永久白名单。

**关键知识点：**

- 合法解析器可能频繁触发预期的拒绝访问，应该区分已知探测目录和敏感目录。
- 浏览器、构建工具、包管理器和沙箱运行时可能天然使用 Landlock。
- 同一路径拒绝事件可以按进程启动实例聚合，但不能隐藏一次新的父进程链或新版本二进制。
- 规则匹配要同时看文件 hash、包来源、执行路径、账号、命名空间和时间窗口。
- 白名单必须有限定范围、过期时间和命中计数，方便发现白名单被滥用。

**Go 落地思路：**

```go
type Suppression struct {
	ExecutableHash string
	UID            uint32
	Namespace      string
	RuleVersion    string
	ExpiresAt      time.Time
	Reason         string
}
```

优先把“确定合法且稳定”的事件降为审计记录；对 Web 进程派生的未知二进制、权限突然变化、敏感目录拒绝和随后外联，仍然保留高风险告警。每次抑制都要累加 `suppressed_total`，否则规则团队看不到误报是否真的下降。

### 9. 客户反馈“开启沙箱后业务失败”，你会怎样排查？

**简洁答案：** 先确认失败发生在策略初始化、规则应用还是业务运行阶段，再比较沙箱前后需要的文件、网络和 fd，最后用最小增量规则定位缺失权限。

**排查顺序：**

1. 记录内核是否支持 Landlock、ABI、规则版本和具体 errno。
2. 确认 `no_new_privs`、子进程启动方式和线程是否按预期应用策略。
3. 对照解析器实际访问记录，确认是读、写、执行、目录枚举还是网络连接被拒绝。
4. 检查父进程是否传入了必须的 fd、环境变量、工作目录或动态库路径。
5. 使用最小规则逐项放开权限，优先只扩大专用目录，不要直接放开根目录。
6. 回归 Web RCE、临时目录执行、敏感文件读取和外联样本，确认修复没有取消安全边界。

**Go 落地思路：**

- 让子进程把 `policy_id`、`policy_version` 和失败阶段写入结构化日志。
- Agent 侧保存规则摘要，不上传完整敏感路径内容；必要时对路径做脱敏。
- 用 table-driven 测试覆盖“ABI 不支持、规则创建失败、权限拒绝、合法读写、非法写入”等结果。
- 客户现场只需要比较规则版本、错误码和事件序列，不要让排查依赖复现所有业务流量。

## 学习要点

| 方向 | 要掌握的内容 |
| --- | --- |
| Linux 原理 | Landlock LSM、ruleset、访问权限位、`no_new_privs`、线程与子进程继承 |
| 机制对比 | Landlock、seccomp、SELinux/AppArmor 的边界与组合方式 |
| Go 实现 | 系统调用封装、ABI 探测、子进程启动、fd 继承控制、错误分层 |
| 检测工程 | 规则拒绝事件、敏感对象、进程链、命名空间、攻击链关联 |
| 线上稳定性 | 能力降级、资源配额、规则版本、指标、客户排障和误报治理 |

## 小练习 / 复盘题

1. 设计一个 `SandboxCapability` 结构，至少表达 ABI、状态、失败阶段、策略版本和覆盖范围。
2. 为什么 Landlock 和 seccomp 不能互相替代？分别给出一个适合的使用场景。
3. 一个 Web 进程启动未知二进制，先设置 Landlock，随后访问 `/etc/shadow` 失败并连接外网。你会关联哪些事件字段？风险如何分层？
4. 解析器需要读取输入目录、读取 `/usr/lib`、写入输出目录，但不应访问网络。请列出最小策略和三个必须关闭的继承入口。
5. 客户机器 ABI 太旧，只支持部分文件访问权限。你会怎样构造兼容规则，怎样向服务端上报覆盖缺口？
6. 设计一条误报治理规则：固定 hash 的安全解析器在固定 namespace 内触发预期拒绝时降为审计，但出现版本变化或新父进程链时恢复告警。
7. 如何测试“父进程已经打开敏感文件 fd，子进程应用 Landlock 后仍能使用该 fd”的边界？这对 Agent 启动流程有什么影响？

## 一句话总结

Landlock 面试题的核心不是背系统调用名，而是把“最小权限策略、ABI 兼容、fd 继承、事件观测、能力降级和攻击链关联”串成一个可上线、可解释、可排障的 Go Agent 方案。
