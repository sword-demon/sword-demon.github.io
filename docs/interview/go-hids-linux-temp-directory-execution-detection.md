---
title: Go主机安全面试：Linux 临时目录落地执行检测
date: 2026-08-20 17:08:12
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- detection
---

# Go 主机安全面试：Linux 临时目录落地执行检测

Linux 主机被入侵后，攻击者经常把 payload 写到 `/tmp`、`/var/tmp`、`/dev/shm`、Web 上传目录或容器可写层，再通过 `chmod +x`、`sh /tmp/x`、`python /dev/shm/a.py` 等方式执行。面试官通常会追问：临时目录本来就会被大量正常程序使用，为什么还能作为检测信号？只要 `/tmp` 执行就告警吗？Go Agent 如何把“写入、赋权、执行、外联、清理”串成可解释攻击链？

## 岗位场景

```text
Linux 主机
  -> 采集文件创建/写入/重命名、chmod/chown、进程执行、父子进程、用户、cwd 和网络连接
  -> 识别 /tmp、/var/tmp、/dev/shm、/run/user、Web 上传目录等高风险可写路径
  -> 关联下载落地、赋权执行、解释器执行、反弹 shell、扫描探测和删除清理
  -> 区分编译构建、包管理、业务临时文件、容器运行时和攻击 payload
  -> 输出命中原因、关键时间线和可复盘证据
```

这类题考的是 Linux 文件系统权限、进程执行链、临时目录语义、攻击链关联、误报治理，以及 Go 侧事件聚合和资源控制能力。

## 高频面试题

### 1. 为什么临时目录执行是 HIDS/EDR 的高价值检测点？

简洁答案：临时目录通常对普通用户或服务进程可写，攻击者拿到低权限后容易在这里投递和执行 payload；但系统正常运行也会使用临时目录，所以它是强上下文信号，不是单点定罪证据。

关键知识点：

- `/tmp` 通常全局可写并带 sticky bit，适合临时文件交换，但不代表适合执行未知二进制。
- `/var/tmp` 可能跨重启保留，攻击者可利用它延长 payload 生命周期。
- `/dev/shm` 是内存文件系统，常被用来降低磁盘取证痕迹。
- Web RCE、弱口令登录、供应链脚本、容器逃逸都可能把临时目录作为中转站。
- 临时目录执行需要结合写入来源、权限变更、父进程、用户、命令行和后续网络行为判断。

Go 落地思路：

- 统一路径归一化，处理软链接、相对路径、`/proc/self/cwd`、容器挂载前缀。
- 把 `write -> chmod -> exec -> connect -> delete` 建成短时间窗口内的事件链。
- 告警输出不要只写“/tmp 执行”，要写清楚“谁写入、谁赋权、谁执行、之后连到哪里”。

### 2. 只要发现 `/tmp` 下文件被执行，就应该高危告警吗？

简洁答案：不应该。临时目录执行本身是可疑行为，但真实产品里要结合上下文评分，否则会误报编译器、安装器、测试框架、打包工具和部分业务脚本。

关键知识点：

| 场景 | 常见证据 | 处理方式 |
| --- | --- | --- |
| 编译/测试 | `go test`、`gcc`、CI 用户、短生命周期 | 降权，绑定构建目录和用户 |
| 包管理/安装 | `apt`、`yum`、`dpkg`、root 用户 | 结合签名源、父进程和维护窗口 |
| Web RCE | `php-fpm/nginx -> sh -> chmod -> /tmp/x` | 升权，输出完整链路 |
| 反弹 shell | 临时文件执行后连接公网异常端口 | 高危，关联网络事件 |
| 容器运行时 | overlay、entrypoint、容器 namespace | 区分容器内外路径和镜像基线 |

Go 落地思路：

- 规则引擎里把临时目录作为 `path_risk`，不要直接作为最终 verdict。
- 为可信构建工具、包管理进程和维护窗口建立可解释白名单。
- 白名单要绑定父进程、路径、用户、hash 或命令行模式，避免只按进程名放行。

### 3. 临时目录落地执行的典型攻击链是什么？

简洁答案：常见链路是下载或写入 payload，然后赋予执行权限，再执行并建立外联，最后删除或改名隐藏。

常见时间线：

```text
T0  nginx/php-fpm/java 拉起 sh -c
T1  curl/wget/python 下载到 /tmp/.x 或 /dev/shm/a
T2  chmod +x /tmp/.x
T3  /tmp/.x 启动，父进程仍能追到 Web 服务或异常 shell
T4  连接公网 IP、扫描内网、读取凭据或写入持久化
T5  rm -f /tmp/.x，或执行中删除文件
```

关键知识点：

- 单个事件可能很弱，但链路组合后置信度明显提高。
- `chmod +x` 不一定存在，攻击者也可能用 `sh /tmp/a`、`python /tmp/a.py`、`perl /dev/shm/p` 执行脚本。
- 删除动作本身不是必要条件，但“执行后很快删除”是高风险补强证据。
- 父子进程关系对攻击入口定位很关键，尤其是 Web 服务进程拉起 shell。

Go 落地思路：

```go
type TempExecEvidence struct {
	PID       int
	PPID      int
	User      string
	Path      string
	Parent    string
	Argv      []string
	Signals   []string // temp_path, recent_write, chmod_x, web_parent, outbound
	FirstSeen int64
	LastSeen  int64
}
```

- 用 `pid + start_time` 作为进程唯一键，避免 PID 复用导致链路串错。
- 文件事件用规范化路径和 inode 做关联，降低 rename 绕过。
- 窗口不用过长，通常 1 到 5 分钟足够覆盖下载、赋权、执行链路。

### 4. Go Agent 应该采集哪些字段才能支撑检测？

简洁答案：至少要采集进程执行、文件写入/权限变更和网络连接三类事件，并保留能做关联的稳定键。

关键字段：

- 进程事件：`pid`、`ppid`、`start_time`、`uid`、`gid`、`exe`、`argv`、`cwd`、`container_id`。
- 文件事件：`path`、`real_path`、`inode`、`op`、`mode`、`uid`、`gid`、`size`、`hash_sample`、`process_key`。
- 权限事件：`chmod`、`chown`、`setxattr`、是否新增执行位。
- 网络事件：目标 IP、端口、方向、协议、进程键、连接时间。
- 上下文：主机角色、服务基线、维护窗口、容器 namespace、是否来自 Web 服务链路。

Go 落地思路：

- Linux 上可以组合 eBPF、auditd、fanotify/inotify、procfs 快照和 netlink，不必所有环境都强依赖一种采集方式。
- Agent 事件要先标准化，再进入规则引擎，避免每条规则重复解析路径和命令行。
- 短生命周期进程要优先在 exec 时记录快照，因为 `/proc/<pid>` 很快会消失。

### 5. 如何识别 `chmod +x` 和解释器执行这两种不同路径？

简洁答案：二进制 payload 常表现为“写入后 chmod 再直接执行”，脚本 payload 可能没有执行位，而是通过 `sh`、`bash`、`python`、`perl`、`php` 等解释器读取临时目录文件。

关键知识点：

- `chmod 755 /tmp/x`、`chmod +x /dev/shm/a` 是直接执行前的典型动作。
- `sh /tmp/a`、`bash /tmp/.x`、`python /dev/shm/p.py` 不需要目标文件有执行位。
- `sh -c "$(curl ...)"` 可能没有稳定落地文件，要和 Web RCE、下载命令、外联一起判断。
- `noexec` 挂载能阻止直接执行，但不能完全阻止解释器读取脚本。

Go 落地思路：

- 对 `execve` 事件同时解析 `exe` 和 `argv`，不要只看 `exe`。
- 如果 `exe` 是解释器，要扫描前几个参数里的路径参数和 `-c` 内联命令特征。
- 对 `chmod` 事件记录旧 mode 和新 mode，只有新增执行位时才作为强信号。

### 6. 误报治理应该怎么做？

简洁答案：不要把临时目录简单列为黑名单，而是建立“主体、路径、动作、时间、后续行为”的评分和基线；白名单必须可解释、可过期、可审计。

关键知识点：

- 编译、测试、安装、升级、备份、杀毒扫描都可能产生临时目录执行。
- 只按文件名或进程名白名单容易被攻击者伪装。
- 主机角色差异很大，CI 机器和生产 Web 机器的临时目录执行风险不同。
- 容器环境里 `/tmp` 可能是业务设计的一部分，但容器内临时执行后访问宿主敏感路径仍然可疑。

Go 落地思路：

- 对每条告警输出 `reasons`，例如 `recent_write`、`web_parent`、`chmod_exec_bit`、`public_outbound`。
- 对低置信事件先进入观察或低危队列，高置信链路再高危告警。
- 用本地 LRU/TTL 缓存保存近期文件和进程事件，避免每次都查数据库或全量扫描。

```go
func tempExecScore(signals map[string]bool) int {
	score := 0
	weights := map[string]int{
		"temp_path":       20,
		"recent_write":    25,
		"chmod_exec_bit":  20,
		"web_parent":      30,
		"public_outbound": 35,
		"quick_delete":    15,
	}
	for signal, weight := range weights {
		if signals[signal] {
			score += weight
		}
	}
	return score
}
```

### 7. 规则引擎如何兼顾实时性和资源开销？

简洁答案：把高频采集和低频深度分析分层处理：实时路径只做标准化、轻量打标和短窗口关联，命中可疑条件后再补充 hash、maps、文件内容片段等重操作。

关键知识点：

- 文件写入和进程执行都是高频事件，不能每个事件都计算全量 hash。
- 临时目录下构建产物可能很多，必须有队列、限流、采样和丢弃策略。
- 规则需要可观测指标，例如事件延迟、队列长度、丢弃数、命中数和告警数。
- Agent 不能为了检测把业务机器 CPU、IO 打满。

Go 落地思路：

- 用有界 channel 或 ring buffer 承接采集事件，避免无界内存增长。
- 对路径前缀和进程角色做预编译 matcher，减少热路径正则开销。
- 对同一 `process_key + file_key` 做去重，避免短时间重复告警。
- 把补充取证放到 worker pool，并设置超时和预算。

### 8. 客户现场反馈“业务脚本在 /tmp 执行被误报”，你怎么排查？

简洁答案：先还原告警证据链，确认触发信号，再判断是否是稳定业务行为；如果确实合法，应该收敛规则条件或增加有边界的白名单，而不是直接关闭临时目录执行检测。

排查步骤：

1. 看告警的 `reasons`：是否只有 `temp_path`，还是同时命中写入、赋权、Web 父进程和外联。
2. 核对父进程、用户、命令行、cwd、文件 hash、执行频率和主机角色。
3. 查看该脚本是否来自固定发布系统、固定路径、固定 hash 或固定签名。
4. 检查是否存在异常参数、异常下载源、执行后删除、异常公网连接。
5. 给出规则调整：降权、限定白名单、增加维护窗口、或要求业务迁移到固定受控目录。

Go 落地思路：

- 告警详情里保留原始事件 ID，方便回放规则和复现评分。
- 白名单配置要支持条件组合，例如 `parent + user + hash + path_prefix`。
- 对客户调整后的规则跑离线回放，确认误报下降且不会漏掉典型攻击链。

## 学习要点

- 临时目录执行是强风险信号，但必须和上下文关联，不能单点告警。
- `/tmp`、`/var/tmp`、`/dev/shm` 的可写性、持久性和取证价值不同。
- `chmod +x` 不是唯一执行路径，解释器执行和内联命令同样重要。
- 进程唯一键要包含 `pid + start_time`，文件关联要尽量结合路径和 inode。
- 规则引擎要输出可解释证据，降噪不能只靠进程名白名单。
- Go Agent 的关键能力是低开销采集、标准化、短窗口关联和可回放排障。

## 小练习/复盘题

1. 设计一个事件模型，描述 `/tmp/x` 从写入、赋权、执行到外联的完整链路。
2. 如果线上主机开启了 `/tmp noexec`，攻击者还能如何执行临时目录脚本？检测点应如何变化？
3. 给 CI 构建机和生产 Web 机分别设计临时目录执行的降噪策略。
4. 写一个 Go 函数，把路径归一化并判断是否属于高风险临时目录，注意软链接和容器路径边界。
5. 如何用离线回放验证新增白名单没有放过 `web_parent + chmod + outbound` 的攻击链？
