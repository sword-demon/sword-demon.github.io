---
title: "Go 主机安全面试：Linux systemd generator 启动期持久化检测"
date: 2026-11-28 17:03:50
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- linux
- systemd
---

# Go 主机安全面试：Linux systemd generator 启动期持久化检测

很多主机安全 Agent 会扫描 `/etc/systemd/system`、`/usr/lib/systemd/system` 和用户级 unit，检查服务、timer、drop-in 是否异常。但 systemd 还有一个更靠前的阶段：**generator**。

它不是在 unit 文件里声明一个服务，而是在 systemd 加载 unit 之前先执行的小程序。generator 可以动态生成 unit、drop-in 或符号链接，把原本不存在的启动项“变”出来。攻击者如果拿到 root，把恶意程序放进 generator 目录，就可能实现：

- 每次开机自动执行；
- 每次 `systemctl daemon-reload` 重新执行；
- 生成一个覆盖正常服务的 unit；
- 把恶意启动项藏到常规 unit 扫描看不到的位置；
- 删除 generator 后，已经生成的 unit 还可能继续存在，直到下一次 reload 或重启。

这类题考的不是“会不会列目录”，而是是否理解 systemd 的启动阶段、source 与 output 的关系，以及 Go Agent 如何做可解释的取证和降噪。

## 岗位场景

```text
开机 / systemctl daemon-reload
  -> systemd 扫描 system-generators / user-generators
  -> 并行执行 generator
  -> generator 向 generator.early / generator / generator.late 写 unit、drop-in、symlink
  -> systemd 加载 unit，启动服务

Agent 侧
  -> 采集 generator 目录的文件元数据、链接、哈希、包来源
  -> 采集 /run/systemd/generator* 下的生成物
  -> 关联 SourcePath、生成物内容、daemon-reload 时间线
  -> 与基线、包管理器记录、进程和网络行为对账
  -> 输出带证据分层的告警或 unknown
```

关键点是：**generator 是“生成启动项的代码”，不是启动项本身**。只看 unit 会漏掉 source，只看 generator 文件又会漏掉它生成出来的恶意 unit。

## 高频面试题

### 1. 什么是 systemd generator？为什么它是主机安全盲区？

**简洁答案：** generator 是 systemd 在 unit 加载前执行的程序，用来把 fstab、GPT、getty 等非 unit 配置转换成 unit。它可以生成或覆盖启动项，而常规 unit 扫描通常看不到“是谁生成了它”。

**关键知识点：**

- generator 的执行时机是启动早期，以及配置 reload 时，均发生在 unit 文件被加载之前。
- 它可以写普通 unit、模板 unit、`.d/*.conf` drop-in，也可以创建 `.wants/`、`.requires/` 符号链接。
- 系统级 generator 由 system manager 执行，权限和启动影响都很大；用户级 generator 由 per-user manager 执行，风险范围较小但同样可用于用户级持久化。
- 一个典型攻击链是：落 generator -> 生成 `generator.early` 下的同名 unit -> 覆盖正常服务定义 -> 服务启动时执行恶意命令。
- 只扫描 `.service` 会漏掉 generator 可执行文件；只扫描 generator 目录会漏掉已经被生成、但仍留在 `/run` 的 unit。

**Go 落地思路：**

- 把 generator 目录作为独立采集面，不要混在普通 unit 扫描器里。
- 事件模型至少区分 `generator_source` 和 `generated_unit` 两种实体，保留它们的路径、哈希、属主和关联关系。
- 规则命中后同时展示“源程序”和“生成物”，否则客户很难判断是包管理器正常行为还是攻击。

### 2. generator 什么时候执行？生成物能活多久？

**简洁答案：** systemd 在启动早期和配置 reload 时并行执行 generator；生成物位于 `/run/systemd/generator*` 一类的运行时目录，通常在下一次 `daemon-reload` 或 `daemon-reexec` 后失效并重新生成。

**关键知识点：**

- 官方语义是 generator 在 unit 加载前运行，主要作用是把非原生配置转换成 unit、drop-in 或链接。
- 所有 generator 并行执行，不能依赖 systemd 或其他外部服务；系统级 generator 还在受限沙箱里运行，官方文档描述其大部分文件系统只读，只有输出目录等少数位置可写。
- `/var`、`/home` 等非必要文件系统在 generator 阶段可能尚未挂载，不能假设 generator 一定能读取这些路径。
- generator 不应通过 syslog 记日志；需要输出诊断信息时通常写 `/dev/kmsg`。
- generated unit 是运行时产物，不是持久化配置文件。攻击者删除 generator 后，生成物可能仍存在到下一次 reload 或重启。
- 慢 generator 会拖慢启动；检测器不应为了“验证”而直接执行可疑 generator。

**Go 落地思路：**

- 事件里记录 `boot_id`、采集时间、generator 文件时间和生成物时间，避免把“重启后重新生成”误判成“攻击者反复落地”。
- 把“文件存在”和“曾经执行”分开建模；文件存在只能证明候选，执行还需要 reload、进程、日志或其他遥测佐证。
- 对 `/run` 下的生成物标注“重启后可能消失”，不要把无法在下次采集看到直接当成误报。

### 3. 系统和用户 generator 的搜索路径、优先级是什么？

**简洁答案：** 系统级和用户级各有一组 `system-generators`、`user-generators` 目录；列表前面的目录优先，同名 generator 会覆盖后面的，`/run` 还会覆盖 `/etc`。空文件或指向 `/dev/null` 的符号链接可以屏蔽某个 generator。

**关键知识点：**

系统级常见搜索目录：

```text
/run/systemd/system-generators
/etc/systemd/system-generators
/usr/local/lib/systemd/system-generators
/usr/lib/systemd/system-generators
```

用户级对应目录：

```text
/run/systemd/user-generators
/etc/systemd/user-generators
/usr/local/lib/systemd/user-generators
/usr/lib/systemd/user-generators
```

- 同名 generator 按上面的顺序取优先级更高的一个；`/run` 中的版本会覆盖 `/etc` 中的版本。
- 空文件或指向 `/dev/null` 的符号链接是 mask，语义是“阻止这个 generator 运行”，不是“目录为空”。
- `/run` 是运行时状态，重启后可能消失；`/etc` 更适合持久化。两者都要采集，但风险解释不同。
- `/usr/local` 如果位于独立分区，启动早期可能尚未可用；这是官方文档特别提示的部署约束。
- 有些发行版把 `/lib` 合并到 `/usr/lib`，扫描时要做路径归一化和去重，否则同一文件可能被算两次。

**Go 落地思路：**

- 用 basename 建立“优先级视图”，同时保留每个物理文件，不要因为 `/etc` 覆盖了 `/usr` 就丢掉 `/usr` 的基线信息。
- 对符号链接只记录目标，不默认跟随到最终文件；mask 链接要被识别并单独建模。
- 扫描固定目录即可，不要递归遍历整个 `/usr` 或 `/lib`，否则在客户机上会产生不可控的 I/O 开销。

### 4. generator 的输出目录有什么优先级？`SourcePath=` 能证明什么？

**简洁答案：** `generator.early` 的优先级高于 `/etc` 配置，`generator` 低于 `/etc`、高于 `/usr`，`generator.late` 低于其他配置；生成物里的 `SourcePath=` 是来源线索，但可以被伪造，不能单独当作可信证明。

**关键知识点：**

- 系统级常见输出位置是 `/run/systemd/generator.early`、`/run/systemd/generator`、`/run/systemd/generator.late`。
- 用户级输出通常在 `$XDG_RUNTIME_DIR/systemd/generator*`。
- `generator.early` 中的 unit 可以覆盖 `/etc`、`/run`、`/usr` 的正常配置，攻击价值最高。
- `generator.late` 主要用于扩展，不应覆盖正常的 vendor 或管理员配置。
- 生成物是运行时状态，不应被当作普通持久化服务文件处理。
- 官方建议 generator 在生成文件顶部写自己的名字，并用 `SourcePath=` 指向来源配置；这能帮助排查，但生成物由程序写出，不能把字段内容当成不可篡改的事实。

**Go 落地思路：**

- 解析生成物时保留 `SourcePath=` 原文和归一化后的路径，同时检查来源文件是否存在、是否可读、是否与 generator 的预期输入匹配。
- 如果 `SourcePath=` 缺失，不要把生成物直接判恶意；把它降级为“来源不明”，再结合路径、`ExecStart` 和时间线打分。
- 生成物中的 `ExecStart=` 指向 `/tmp`、`/dev/shm`、`/var/tmp`、`/run/user`，或出现 `sh -c`、`curl`、`wget`、`socat` 等组合时，证据权重应明显提高。

### 5. 为什么不能只看 generator 文件？还需要哪些证据？

**简洁答案：** 攻击者可能不改 generator，而是改它读取的配置；也可能用合法 generator 生成恶意 unit。必须把源程序、输入配置、生成物、reload 行为和运行进程串起来。

**关键知识点：**

- generator 的输入可能来自 `/etc/fstab`、内核命令行、GPT 分区信息、getty 配置等。只校验 generator 二进制哈希，无法覆盖“输入被改”的情况。
- 同一个 generator 可以生成多个 unit；生成物的内容和目标路径比 generator 文件名更有判断价值。
- `systemctl daemon-reload` 是重要时间锚点，但它也可能是包安装、管理员变更或云初始化正常触发。
- 生成物里的注释、`SourcePath=`、文件属主、权限和 mtime 都只是证据，不是单独的可信证明。
- 运行侧证据包括：systemd 拉起的进程、进程的 cgroup、父子关系、命令行、网络连接和文件访问。

**Go 落地思路：**

- 采集器输出“证据集合”，不要只输出一个 `suspicious=true`：

```text
generator_path
generator_sha256
generated_unit_path
generated_unit_sha256
source_path
exec_start
reload_seen_at
process_started_at
```

- 对“源文件被删但生成物仍在”的场景单独建规则：这比单纯“目录里多一个文件”更能说明启动项曾被执行或即将被执行。
- 关联失败时输出 `unknown`，不要用“没有找到进程”直接推断“没有执行”。

### 6. 如何建立 generator 基线，避免每天被正常更新淹没？

**简洁答案：** 基线要同时覆盖 generator 二进制、链接关系、输入来源和生成物指纹；变更判断以“包事务或审批变更”为解释来源，不要只看 mtime。

**关键知识点：**

- 基线字段至少包括路径、basename、类型、权限、属主、大小、哈希、符号链接目标、包来源和首次发现时间。
- 系统升级会批量替换 `/usr/lib/systemd/system-generators` 下的文件，按单文件 mtime 告警会制造大量噪声。
- 管理员自定义 generator、云厂商 agent、备份软件和监控软件都可能合法新增 generator，需要资产角色和变更单解释。
- 包管理器拥有文件不等于文件未被篡改；包来源只能降低优先级，不能替代哈希和内容检查。
- 同名覆盖和 mask 变化要单独处理：它们可能只是运维禁用，也可能是攻击者削弱已有防护或启动链。

**Go 落地思路：**

- 用 `(path, basename, priority)` 作为稳定键，保存“上次基线”和“本次快照”，再做差集。
- 把变更分成 `new`、`modified`、`masked`、`unmasked`、`link_changed`、`owner_changed` 六类，不同类别给不同风险分。
- 允许按“包名 + 精确哈希”设置有时效的白名单；白名单命中也要计数，避免永久静默。

### 7. Go Agent 如何安全地扫描 generator，而不执行它？

**简洁答案：** 只做目录枚举、`Lstat`、链接读取和有上限的哈希计算，不调用 generator，不执行 `systemctl daemon-reload`，也不跟随不可信链接。扫描失败要返回 `unknown`，不能当作干净。

**关键知识点：**

- `os.ReadDir` 只读取目录项；`os.Lstat` 不跟随符号链接，适合识别 mask 和链接目标。
- 对普通文件做哈希前要限制最大读取量，避免异常大文件拖慢 Agent。
- 文件可能在扫描期间被替换，检测器不是内核级安全边界；高风险主机应先做只读快照或离线取证。
- 不应在扫描逻辑里调用 `exec.Command` 执行 generator，也不应为了“看输出”触发 reload；这些动作本身可能执行恶意代码。

```go
package systemdgen

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"
	"os"
	"path/filepath"
	"sort"
)

const maxGeneratorSize = 4 << 20

var SystemGeneratorDirs = []string{
	"/run/systemd/system-generators",
	"/etc/systemd/system-generators",
	"/usr/local/lib/systemd/system-generators",
	"/usr/lib/systemd/system-generators",
}

var UserGeneratorDirs = []string{
	"/run/systemd/user-generators",
	"/etc/systemd/user-generators",
	"/usr/local/lib/systemd/user-generators",
	"/usr/lib/systemd/user-generators",
}

type Generator struct {
	Path       string
	Name       string
	Mode       os.FileMode
	Size       int64
	LinkTarget string
	SHA256     string
	Truncated  bool
	Err        string
}

func Scan(dirs []string) ([]Generator, error) {
	var out []Generator
	for _, dir := range dirs {
		items, err := scanDir(dir)
		if err != nil {
			return nil, err
		}
		out = append(out, items...)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Path < out[j].Path })
	return out, nil
}

func scanDir(dir string) ([]Generator, error) {
	names, err := os.ReadDir(dir)
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	out := make([]Generator, 0, len(names))
	for _, de := range names {
		p := filepath.Join(dir, de.Name())
		info, err := os.Lstat(p)
		if err != nil {
			out = append(out, Generator{Path: p, Name: de.Name(), Err: err.Error()})
			continue
		}
		g := Generator{Path: p, Name: de.Name(), Mode: info.Mode(), Size: info.Size()}
		if info.Mode()&os.ModeSymlink != 0 {
			g.LinkTarget, _ = os.Readlink(p)
		}
		if info.Mode().IsRegular() {
			g.SHA256, g.Truncated, err = hashFile(p)
			if err != nil {
				g.Err = err.Error()
			}
		}
		out = append(out, g)
	}
	return out, nil
}

func hashFile(path string) (string, bool, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", false, err
	}
	defer f.Close()

	h := sha256.New()
	n, err := io.Copy(h, io.LimitReader(f, maxGeneratorSize+1))
	if err != nil {
		return "", false, err
	}
	if n > maxGeneratorSize {
		return "", true, nil
	}
	return hex.EncodeToString(h.Sum(nil)), false, nil
}
```

**Go 落地思路：**

- `scanDir` 对不存在的目录返回空结果，对权限错误返回错误；不要把“无权读取”伪装成“没有文件”。
- `Lstat` 和 `Readlink` 只用于识别路径关系，不追到最终目标，避免扫描器被链接引到系统其他位置。
- 生产实现还可以记录 inode、设备号、扩展属性和包管理器来源，但这些是增强字段，不应阻塞基础采集。

### 8. 如何把生成物和 generator 关联起来？

**简洁答案：** 优先使用生成物里的 generator 注释和 `SourcePath=`，再结合 basename、输出目录优先级和时间窗口做辅助关联；关联不确定时保留候选集，不要硬编码成唯一来源。

**关键知识点：**

- `SourcePath=` 和文件顶部注释是官方建议的来源线索，但生成器可以写任意内容，攻击者也可以伪造。
- generator 输出可能包含多个 unit，且文件名不一定与 generator 同名。
- `generator.early` 的覆盖语义会影响最终生效的 unit；同一个路径可能同时存在原生配置和生成物。
- 并行执行意味着不能依赖“最后修改时间更晚的一定是实际 generator”，时间只能作为弱证据。
- 生成物的 `ExecStart=`、`User=`、`WantedBy=` 等字段要单独标准化，便于规则复用。

```go
import (
	"path/filepath"
	"strings"
)

func SourcePath(unit string) string {
	for _, line := range strings.Split(unit, "\n") {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "SourcePath=") {
			return NormalizePath(strings.TrimSpace(strings.TrimPrefix(line, "SourcePath=")))
		}
	}
	return ""
}

func NormalizePath(p string) string {
	if p == "" {
		return ""
	}
	return filepath.Clean(p)
}

func GeneratedSignals(unit string) []string {
	var signals []string
	if SourcePath(unit) == "" {
		signals = append(signals, "missing-sourcepath")
	}
	for _, line := range strings.Split(unit, "\n") {
		line = strings.TrimSpace(line)
		if !strings.HasPrefix(line, "ExecStart=") {
			continue
		}
		cmd := strings.ToLower(line)
		if containsAny(cmd, []string{"/tmp/", "/dev/shm/", "/var/tmp/", "/run/user/"}) {
			signals = append(signals, "exec-writable-path")
		}
		if containsAny(cmd, []string{"bash -c", "sh -c", "curl ", "wget ", "socat ", "nc "}) {
			signals = append(signals, "exec-interpreter-or-download")
		}
	}
	return signals
}

func containsAny(s string, needles []string) bool {
	for _, n := range needles {
		if strings.Contains(s, n) {
			return true
		}
	}
	return false
}
```

**Go 落地思路：**

- 把 `SourcePath` 解析成“候选来源”，再与实际 generator 清单求交集；交集为空时输出 `source-unresolved`。
- 不要因为 `SourcePath` 指向一个合法文件就关闭告警；检查该文件是否在基线内、是否被包管理器拥有、内容是否变化。
- 生成物内容要做长度上限和行数上限，避免恶意 unit 把解析器拖死。

### 9. 规则如何做降噪和攻击链关联？

**简洁答案：** 把“新增 generator”“reload 触发”“生成高优先级 unit”“systemd 拉起可疑进程”“异常外联”分开计分，用组合证据升级，不要看到 generator 文件就告警。

**关键知识点：**

- 低风险：包管理器拥有的正常 generator、哈希未变、生成物与历史一致。
- 中风险：新增未归属 generator、mask 变化、生成物缺 `SourcePath`、生成物 `ExecStart` 指向可写目录。
- 高风险：`generator.early` 覆盖正常服务、生成物启动解释器或下载命令、短时间内出现 `daemon-reload`、随后 systemd 子进程访问敏感文件或外联。
- 只有文件变化、没有 reload 或进程，可能是“已落地未触发”的休眠持久化，也应进入复核队列。
- 只有进程异常、没有 generator 变化，可能是普通服务被利用，不能硬套本规则。

```go
type Finding struct {
	Signal string
	Score  int
}

func Assess(g Generator, generatedSignals []string) []Finding {
	var findings []Finding
	if g.Err != "" {
		findings = append(findings, Finding{Signal: "unreadable", Score: 0})
	}
	if g.Mode&os.ModeSymlink != 0 {
		switch {
		case g.LinkTarget == "/dev/null":
			findings = append(findings, Finding{Signal: "masked", Score: 10})
		case strings.HasPrefix(g.LinkTarget, "/usr/") || strings.HasPrefix(g.LinkTarget, "/etc/"):
			findings = append(findings, Finding{Signal: "symlink-managed-area", Score: 30})
		default:
			findings = append(findings, Finding{Signal: "symlink-outside", Score: 60})
		}
	}
	if strings.HasPrefix(g.Path, "/run/") {
		findings = append(findings, Finding{Signal: "runtime-source", Score: 30})
	}
	if g.Truncated {
		findings = append(findings, Finding{Signal: "hash-skipped-too-large", Score: 10})
	}
	for _, signal := range generatedSignals {
		findings = append(findings, Finding{Signal: "generated-" + signal, Score: 50})
	}
	return findings
}
```

**Go 落地思路：**

- 规则输出要写明证据层级：`observed`（看到了什么）、`inferred`（推断什么）、`missing`（缺什么证据）。
- 用时间窗聚合同一 generator、同一 unit、同一进程的重复命中，避免每次巡检都生成一条告警。
- 对“源文件已删除、生成物仍在”的场景提升证据等级，因为它说明 source 和 output 的生命周期出现了不一致。

### 10. 客户反馈“删掉后门服务还是重启复活”或“生成物不见了”，怎么排查？

**简洁答案：** 先区分 source 被删、generated unit 仍存活、包管理器重装、以及容器/命名空间视图不同；不要在可疑主机上直接执行 generator 或盲目 `daemon-reload`。

**关键知识点：**

排查顺序建议：

1. 确认目标主机是否真的以 systemd 作为系统管理器，以及 Agent 是否在宿主机的 PID namespace 中采集。
2. 枚举系统级和用户级 generator 目录，按 basename 计算优先级，识别空文件和 `/dev/null` mask。
3. 检查 `/run/systemd/generator*`（用户级检查 `$XDG_RUNTIME_DIR/systemd/generator*`）下的生成物，记录 `SourcePath=`、顶部注释、`ExecStart=` 和文件哈希。
4. 查询包管理器归属和最近的软件包事务；升级可能在短时间内批量替换 `/usr/lib` 下的 generator。
5. 用 auditd、eBPF 或进程事件查 `systemctl daemon-reload` 的触发者、时间、父进程和后续 systemd 子进程。
6. 检查内核日志中的 generator 诊断信息；官方建议 generator 写 `/dev/kmsg`，而不是依赖 syslog。
7. 如果 source 已被删除但生成物还在，先做取证快照，再在隔离环境验证重启后的状态。

**Go 落地思路：**

- 客户排障包要包含目录快照、文件哈希、链接目标、包来源、生成物原文和采集错误，不能只回传一个“未发现”。
- 对 `daemon-reload` 本身做审计，但把它当“可能触发执行”的高风险动作，不在生产主机上为了排查随意执行。
- 如果 Agent 读不到 `/run` 或目标 namespace，结论必须是 `unknown`，不要输出“已清理”。

## Go 实现要点

### 1. 目录优先级不要靠遍历顺序碰运气

扫描结果需要显式携带“来源目录”和“优先级”。同名 generator 只展示最高优先级版本作为“当前生效候选”，但所有物理文件都要保留用于取证。

```go
type Candidate struct {
	Base      string
	Path      string
	Priority  int
	IsMask    bool
	IsSymlink bool
}

func Precedence(items []Generator, dirs []string) map[string]Candidate {
	priority := make(map[string]int, len(dirs))
	for i, dir := range dirs {
		priority[filepath.Clean(dir)] = i
	}
	out := make(map[string]Candidate)
	for _, g := range items {
		p, ok := priority[filepath.Dir(g.Path)]
		if !ok {
			continue
		}
		cur, exists := out[g.Name]
		if exists && cur.Priority <= p {
			continue
		}
		out[g.Name] = Candidate{
			Base:      g.Name,
			Path:      g.Path,
			Priority:  p,
			IsMask:    g.LinkTarget == "/dev/null" || (g.Mode.IsRegular() && g.Size == 0),
			IsSymlink: g.Mode&os.ModeSymlink != 0,
		}
	}
	return out
}
```

注意：`/lib` 和 `/usr/lib` 在 merged-/usr 系统上可能是同一目录，真实实现应先归一化路径再去重。

### 2. 不要把“生成物存在”直接等同于“配置生效”

生成物只说明 generator 曾经写过文件，不等于 systemd 最终采用了它。最终生效还取决于：

- 输出目录优先级；
- 是否有更高优先级的原生 unit 或 drop-in；
- 生成物语法是否有效；
- systemd 是否完成了 reload；
- 服务是否被启用、启动或依赖拉起。

所以规则最好输出“候选链”而不是单点结论：

```text
generator 文件变化
  -> reload 事件
  -> generated unit 出现
  -> unit 被 systemd 加载
  -> 进程实际启动
  -> 进程行为异常
```

### 3. 三态结论比二值判断更适合客户现场

| 结论 | 含义 | 典型证据 |
| --- | --- | --- |
| `healthy` | 当前没有发现异常 generator 或生成物 | 目录可读、基线一致、无异常 mask |
| `suspicious` | 有需要复核的组合证据 | 新增未归属 generator + 高优先级生成物 + 可疑 `ExecStart` |
| `unknown` | 关键证据缺失 | 无权限读目录、namespace 不对、Agent 未覆盖 `/run` |

不要用 `healthy` 表示“没有告警”。没有采集能力时，`unknown` 才是诚实结论。

## 学习要点

- generator 是 unit 加载前的可执行阶段，不是普通 service。
- 源程序、输入配置、生成物、reload 事件和运行进程是五个不同证据层。
- `/run` 下的生成物是运行时状态，生命周期与 reload/reboot 绑定。
- 目录优先级、mask 语义、同名覆盖比“文件名像不像后门”更重要。
- 任何“执行 generator 来验证”的方案都要先问：这是不是在客户主机上执行未知代码。
- 主机安全检测的结论应可解释、可复盘，并显式表达证据缺口。

## 小练习 / 复盘题

1. 写出系统级和用户级 generator 的搜索目录，并说明为什么 `/run` 优先于 `/etc`。
2. 给定 `/etc`、`/usr/lib` 和 `/run` 下的同名 generator，写一个函数选出当前生效候选，同时保留所有物理文件。
3. 解析一个 unit 的 `SourcePath=`，并判断它是否指向已存在的普通文件。
4. 设计一个规则：`generator.early` 中出现覆盖正常 `ssh.service` 的 unit，应该如何输出证据？
5. 解释为什么“生成物文件存在”不能直接证明“服务已经执行”。
6. 客户环境中 `daemon-reload` 可能是包管理器正常触发，你会如何区分正常发布和攻击？
7. 如果 Agent 只能读取 `/etc`，读不到 `/run`，结论应该是什么？为什么？
8. 画出一条从 generator 落地到 systemd 子进程外联的检测链，并标出每一层的可缺失证据。
9. 删除恶意 generator 后，为什么生成物可能仍然存在？清理和取证顺序应该怎么安排？

## 参考资料

- [systemd.generator(7)](https://www.freedesktop.org/software/systemd/man/latest/systemd.generator.html)：generator 的搜索路径、输出目录、优先级、mask、执行环境和生命周期。
- [systemd.unit(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html)：unit 加载路径与覆盖语义。
- [systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html)：`daemon-reload` 与 `daemon-reexec` 的行为。
