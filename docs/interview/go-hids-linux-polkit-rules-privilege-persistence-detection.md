---
title: Go 主机安全面试：Linux polkit 授权规则持久化与提权检测
date: 2026-11-01 17:03:28
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- polkit
---

# Go 主机安全面试：Linux polkit 授权规则持久化与提权检测

Linux 桌面的软件安装、磁盘挂载、服务管理，以及不少需要管理员权限的系统操作，都会经过 polkit 做授权决策。与应用自身写死“是否允许”不同，polkit 把“动作是什么”和“谁可以执行”拆开：动作由 `.policy` 文件声明，本机策略可以由 `.rules` 文件覆盖。

这种可扩展性很方便，也形成了主机安全的持久化面。攻击者如果已经取得可写规则目录的权限，可以不再反复利用漏洞，而是留下一条“某个用户或某个条件永远返回 YES”的规则，等待后续 `pkexec`、服务管理或磁盘操作触发。检测的重点不是看到一个 `.rules` 文件就报恶意，而是回答：谁改了规则、改了哪个动作、实际是否授予了权限、之后有没有发生提权行为。

## 岗位场景

```text
Web 服务或低权限账号被利用
  -> 攻击者获得写入 polkit 规则目录的错误权限
  -> 新增或修改 .rules，提前返回 YES / AUTH_SELF
  -> polkitd 检测到目录变化并重新加载规则
  -> 攻击者通过 pkexec 或受 polkit 保护的服务执行管理员操作
  -> Go Agent 关联文件写入、规则内容、授权检查与提权进程树
  -> 输出“谁改了哪条授权边界、何时生效、之后做了什么”的证据链
```

如果攻击者已经拥有 unrestricted root，单独讨论规则文件权限意义不大；真实的高价值场景是错误目录权限、脆弱的管理面、供应链写入、容器错误挂载，以及已经获得局部权限后利用 polkit 做持久化和防御规避。

## 高频面试题

### 1. polkit 在 Linux 权限体系中解决什么问题？核心对象有哪些？

**简洁答案：** polkit 是一个授权管理器。特权程序把“某个主体能否对某个动作执行操作”的决策交给 polkit authority；用户可能需要通过认证代理证明身份。核心对象是 mechanism、subject、action、authority 和 authentication agent。

**关键知识点：**

- mechanism 是提供特权操作的程序，subject 是发起请求的非特权客户端。
- action 用命名空间中的 ID 表示，例如 `org.freedesktop.policykit.exec`。
- authority 由系统总线上的 `polkitd` 服务实现，启动后通常会降到非特权 `polkitd` 用户运行。[1][2]
- 认证代理负责弹出密码框或使用文本界面完成认证；没有代理时，部分工具会注册自己的文本代理。[3]
- polkit 不是 Linux capability、sudo 或 SELinux 的简单替代品。它主要解决“这次请求是否被授权”，执行主体的真实权限仍由进程凭据和 LSM 决定。

**Go 落地思路：** 事件模型不要把 `pkexec` 当成唯一对象。至少保留 `subject`、`action_id`、`mechanism`、`result`、认证方式和进程实例。后续规则、告警和攻击链都依赖这几个维度的稳定关联。

### 2. `.policy` 和 `.rules` 分别是什么？为什么检测重点通常落在 `.rules`？

**简洁答案：** `.policy` 用于声明动作、描述文字和默认授权；`.rules` 是 JavaScript 授权规则，可以根据 action、subject 和运行时细节动态返回授权结果。`.rules` 能直接改变本机决策，因此是本机持久化和权限边界变更的高价值证据。

**关键知识点：**

- `.policy` 通常由软件包安装到 `/usr/share/polkit-1/actions`，定义 action ID、默认值、提示文字等。[1]
- `.rules` 由 `polkitd` 从 `/etc/polkit-1/rules.d` 和 `/usr/share/polkit-1/rules.d` 读取，使用 JavaScript 调用 `polkit.addRule()` 或 `polkit.addAdminRule()`。[1]
- `/etc/polkit-1/rules.d` 通常是管理员本地覆盖区，安全关注度高于软件包管理的 `/usr/share/polkit-1/rules.d`；但两者都必须纳入监控。
- 旧版 `.pkla` 兼容层或发行版自有目录可能存在，不能只看一个固定路径；应以当前发行版实际加载目录为准。
- 规则文件是代码，不是普通配置。Agent 可以静态提取特征，但不应在检测进程里执行规则或加载第三方 JavaScript 引擎。

**Go 落地思路：** 把 `.policy` 变化和 `.rules` 变化分成两个事件类型。前者通常意味着软件包或动作定义变化，后者可能直接改变授权结果；将二者合并会丢失风险级别和处置语义。

### 3. polkit 规则如何排序和生效？为什么“第一条返回值”很关键？

**简洁答案：** `polkitd` 按文件 basename 做字典序加载两个规则目录；同名时先处理 `/etc`，再处理 `/usr`。规则函数按注册顺序调用，直到某个函数返回非 `NOT_HANDLED` 的结果。因此，一个很早加载、条件过宽并直接返回 YES 的规则，可以抢先决定授权结果。

**关键知识点：**

- 示例顺序是 `/etc/.../10-auth.rules`、`/usr/.../10-auth.rules`、`/etc/.../15-auth.rules`。[1]
- `polkit.Result.NOT_HANDLED`、`null`、`undefined` 或不返回值，才会继续尝试后续规则。
- `YES`、`AUTH_SELF`、`AUTH_ADMIN` 等结果会结束本次规则链。
- `AUTH_SELF_KEEP` 和 `AUTH_ADMIN_KEEP` 会在短时间内缓存授权，而且缓存键是 action 与 subject；规则依赖的细节参数变化时仍可能命中缓存。[1]
- 任一规则文件增加、删除或修改后，`polkitd` 会清空现有规则并重新读取两个目录。[1]

**Go 落地思路：** 报告规则变化时同时输出加载顺序键，例如 `source_rank=/etc before /usr`、`basename`、`file_mtime` 和 `content_hash`。只输出绝对路径，无法解释为什么某条规则可能先命中。

### 4. 哪些规则内容值得提高风险级别？能否用正则直接判定恶意？

**简洁答案：** `return polkit.Result.YES`、把 `AUTH_ADMIN` 降为 `AUTH_SELF`、宽泛匹配 action ID、给非预期用户或组增加管理员身份、以及规则中调用 `spawn()`，都值得重点复核。但 JavaScript 语义复杂，正则只能提供证据，不能单独定性。

**关键知识点：**

- 高风险特征包括无条件 `YES`、对任意 action 返回成功、对高价值 action 放宽管理员认证，以及 `addAdminRule()` 返回意外的 `unix-user:` 或 `unix-group:`。
- 条件可能经过变量、函数、字符串拼接或 minify 处理，文本中不一定出现直白的 `YES`。
- `spawn()` 会运行外部 helper，并等待其结束；helper 以 `polkitd` 用户运行，且运行期间可能影响授权检查吞吐。[1]
- 规则脚本超时会被终止，但这不代表 Agent 的静态解析可以忽略大小和复杂度限制。
- 单行、压缩、注释分隔和 Unicode 字符串都可能绕过简单正则。发现可疑片段后，应保存哈希和有限上下文，交给规则引擎或人工复核。

**Go 落地思路：** 规则内容特征输出 `evidence` 和 `reason_code`，例如 `rule_returns_yes`、`admin_rule_added`、`rule_calls_spawn`，不要把 `regex_match=true` 直接等同恶意。事件保留文件 hash，原始内容按最小必要原则采样并脱敏。

### 5. 哪些 polkit action 更值得关注？如何避免写死一组 ID 后很快过时？

**简洁答案：** 优先关注能执行任意程序、安装软件、修改服务、管理网络或挂载设备、创建账号的 action。不要只维护一张固定 ID 表，应从当前主机 `.policy` 文件生成动作清单，再按动作能力、调用方和默认授权做风险分级。

**关键知识点：**

- `org.freedesktop.policykit.exec` 是 `pkexec` 默认检查的 action；执行程序、用户和命令行详情会影响实际风险。[3]
- PackageKit、systemd、NetworkManager、udisks、accounts-service、logind 等组件各自提供 action，ID 随发行版和版本变化。
- 一个 action 的默认授权可能是 `no`、`auth_admin`、`auth_self` 或 `yes`；风险要结合默认值和规则改动前后差异。
- “允许挂载一个受限设备”和“允许执行任意程序”不能使用同一风险权重。
- action 名称看起来像系统组件，不代表调用进程一定正常；仍要关联 subject 和后续进程行为。

**Go 落地思路：** 建立 `action_catalog`：从 `.policy` 解析 action ID、vendor 和默认值，并为每个 action 标注能力类别。规则变更事件引用 action 类别，服务端就能在新组件出现时自动给出基础风险，而不是等待人工补充 ID。

### 6. Go Agent 应如何采集规则目录变化？inotify、auditd、fanotify 和 eBPF 各自缺什么？

**简洁答案：** inotify 适合低开销发现目录内新增、完成写入、重命名和属性变化，但通常不告诉你写入进程；auditd 能补 PID、comm 和路径，但受规则配置、队列和平台差异影响；fanotify 能观察更多文件操作和进程信息；eBPF 适合获取 VFS open/write 事件和进程归因，但受内核、权限和版本影响。生产上应采用事件加周期快照对账，而不是依赖单一来源。

**关键知识点：**

- inotify 常见事件包括 `IN_CREATE`、`IN_CLOSE_WRITE`、`IN_MOVED_TO`、`IN_ATTRIB`、`IN_DELETE`；只监听 `IN_MODIFY` 容易在原子重命名和短文件中丢上下文。
- inotify 队列会溢出；必须处理 `IN_Q_OVERFLOW` 并触发全量对账。
- 递归目录、mount namespace、容器 bind mount 和 watcher 重建都会影响覆盖范围。
- audit 目录 watch 可能产生多条记录，需要按 audit event ID 聚合 `SYSCALL` 与 `PATH` 记录，不能只看一行。
- 文件事件只证明写入，不证明 `polkitd` 已成功加载。还要采集规则解析错误或 reload 后的授权检查。
- 不要把任意大小的 `.rules` 全量写入日志。应设置读入上限、文件数量上限和队列上限。

**Go 落地思路：** 采用三层证据：目录事件提供时间点，周期 hash 快照确认最终内容，授权检查和进程行为证明影响。事件丢失时明确上报 `collector_degraded`，不能把“没有事件”解释成“没有修改”。

### 7. 如何用 Go 对 polkit 规则目录做可靠快照？

**简洁答案：** 只接受目录内普通 `.rules` 文件，限制单文件大小，打开后再次校验文件身份与大小，计算 SHA-256，并保留路径、mode、mtime 等元数据。周期比较快照即可发现新增、删除和内容变化；对于可疑内容再做有界静态提取。

**关键知识点：**

- `filepath.WalkDir` 不跟随符号链接；遇到非普通文件应跳过或上报，而不是盲目读取目标。
- 先 `Lstat`、后 `open`、再 `Fstat` 并比较，可以降低文件在检查与读取之间被替换的风险。
- 生产事件还应保存 device、inode、`nlink`、UID、GID 和 Linux ctime，用于识别硬链接、替换和 owner 变化。
- 哈希只证明当前内容，不证明规则语法有效或已被 `polkitd` 接受。
- 快照用于对账，inotify/audit/eBPF 用于及时性，两者不能互相替代。
- 两次 `Fstat` 只能降低普通原子替换的竞态；同一 inode 内并发改写仍可能绕过检查，强一致场景要结合 eBPF/LSM 写入事件、缩短快照窗口或受保护的文件系统策略。

**Go 落地思路：** 把目录扫描写成无状态纯函数，返回相对路径到元数据的映射；上层负责任务节流、diff、缓存和告警。这样既方便单元测试，也能在 inotify 溢出或 Agent 重启后直接做全量对账。

```go
type RuleFile struct {
	Path    string
	Mode    fs.FileMode
	Size    int64
	ModTime time.Time
	SHA256  string
}

const maxRuleSize = 512 << 10

func snapshotRules(root string) (map[string]RuleFile, error) {
	out := make(map[string]RuleFile)
	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() || !strings.HasSuffix(d.Name(), ".rules") {
			return nil
		}
		before, err := d.Info()
		if err != nil {
			return err
		}
		if before.Mode()&os.ModeSymlink != 0 {
			return nil
		}
		if !before.Mode().IsRegular() || before.Size() > maxRuleSize {
			return fmt.Errorf("invalid rule file %q", path)
		}

		f, err := os.Open(path)
		if err != nil {
			return err
		}
		defer f.Close()

		afterOpen, err := f.Stat()
		if err != nil {
			return err
		}
		if !os.SameFile(before, afterOpen) || afterOpen.Size() > maxRuleSize {
			return fmt.Errorf("rule changed before read: %q", path)
		}

		h := sha256.New()
		if _, err := io.Copy(h, io.LimitReader(f, maxRuleSize+1)); err != nil {
			return err
		}
		afterRead, err := f.Stat()
		if err != nil {
			return err
		}
		if afterOpen.Size() != afterRead.Size() || !afterOpen.ModTime().Equal(afterRead.ModTime()) {
			return fmt.Errorf("rule changed during read: %q", path)
		}

		rel, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		out[filepath.ToSlash(rel)] = RuleFile{
			Path:    path,
			Mode:    afterRead.Mode(),
			Size:    afterRead.Size(),
			ModTime: afterRead.ModTime(),
			SHA256:  hex.EncodeToString(h.Sum(nil)),
		}
		return nil
	})
	return out, err
}
```

这段代码只读元数据和内容哈希，不执行规则。生产实现还应限制递归深度、文件总数和总字节数，并捕获单个文件错误后继续扫描其余文件。

### 8. 规则变化误报很多时，怎样做基线而不是简单按文件名放行？

**简洁答案：** 用文件来源、包管理归属、owner/mode、路径层级、内容 hash、变更进程和变更窗口共同建立基线。`/usr/share` 中由合法软件包升级带来的变化，与 `/etc` 中无工单的临时写入，不应使用同一条抑制规则。

**关键知识点：**

- 可以把 `/usr/share/polkit-1/rules.d` 与包管理数据库比对，确认文件属于哪个包、包版本是否刚升级。
- `/etc/polkit-1/rules.d` 是本地策略区，新增文件通常需要责任人、变更单或配置管理来源。
- 文件 owner、group、mode、ACL 和 SELinux label 都是信任边界；内容没变但权限放宽也可能降低安全性。
- 配置管理工具会批量写文件，适合按任务、父进程和短时间窗口聚合，而不是永久放行某个路径。
- 正常管理员也可能临时添加宽松规则排障；这类变化应降低优先级并提示复核，不应静默删除。

**Go 落地思路：** 先用 `host_role + path_scope + package_owner + writer_process + change_source` 做上下文，再交给策略层判断。进程名为空时不自动白名单；`unknown writer` 应作为证据缺口，而不是正常来源。

### 9. 如何把规则变更关联成攻击链，并避免把“文件变了”直接说成“已经提权”？

**简洁答案：** 规则变更只是“权限边界可能改变”的前置证据；其后还要观察到授权检查结果、`pkexec` 或受保护机制启动、管理员权限进程以及命令、文件、网络行为。按时间窗口和主体关联，输出阶段化结论。

**关键知识点：**

- 规则写入后，`polkitd` 会重新加载；解析失败可能使规则未生效，成功加载也不代表马上有人使用。
- `pkexec`、systemd、PackageKit 等调用会形成新的进程与授权事件，适合与规则变更做短窗口关联。
- 需要区分“规则内容允许”和“本次授权实际返回 YES”。日志字段随版本和发行版变化，不能硬编码单一文本格式。
- 攻击链证据应保留规则动作 ID、调用程序路径、subject UID/进程实例、最终执行用户和后续子进程。
- 高价值结论是“规则变更后出现了非预期提权执行”，而不是“文件 hash 变化，所以主机已失陷”。

**Go 落地思路：** 使用阶段化事件：

```text
polkit.rule.added | modified | removed | permission_changed
polkit.rule.load_failed | loaded
polkit.auth.checked
polkit.privileged_process.started
polkit.post_exec_behavior
```

同一主机、同一 `action_id` 和相近时间窗口内的事件可以组成候选链；关联失败时仍保留独立事件，供人工排查。

### 10. 客户反馈“规则被改了但没有告警”，怎么排查？

**简洁答案：** 先确认改的是哪个实际加载目录，再检查 watcher 是否覆盖该 mount namespace、事件是否丢失、Agent 是否有读取权限、快照是否把首次基线当成正常状态，以及规则是否被策略抑制。最后确认规则是否成功加载并被实际调用。

**关键知识点：**

- 发行版可能使用不同目录或兼容层；不能只检查 `/etc/polkit-1/rules.d`。
- 容器通过 bind mount 写入时，主机路径、容器路径和 inotify 视图可能不一致。
- 首次安装或首次启动时常把现状直接当基线；如果恶意规则已经存在，后续只做增量事件就可能漏报。
- 文件名不以 `.rules` 结尾、符号链接、超大文件、JSON/文本规则或旧版 `.pkla`，可能被当前采集器过滤。
- 事件可能被正确采集，但规则因路径、UID、主机角色或维护窗口被抑制；要区分“没采到”和“采到但被降噪”。
- `polkitd` 日志或授权检查没有出现，只能证明暂时没观察到使用，不能证明规则没有影响系统其他动作。

**Go 落地思路：** 排障接口不要只返回 `alert_found=false`，而应返回 `file_observed`、`writer_attributed`、`watcher_healthy`、`snapshot_compared`、`rule_loaded`、`suppressed_by` 和 `coverage_gaps`。这样可以明确区分漏采、漏关联、主动抑制和暂未使用。

**排查顺序：**

1. 在授权范围内确认实际规则目录、文件属主、mode、hash 和变更时间。
2. 对照 Agent 的 watcher、audit/eBPF 能力状态、队列丢事件指标和全量快照任务。
3. 查看规则加载错误与最近一次授权检查，确认规则是否被 `polkitd` 接受。
4. 核对降噪策略和基线来源，判断是漏采、漏关联还是主动抑制。
5. 保留规则样本、写入进程、重启/重载时间和后续特权进程证据，避免仅凭文件名下结论。

## 学习要点

- 先理解 polkit 的授权链，再记路径和文件名：mechanism -> action -> rules -> authorization result -> privileged action。
- `.rules` 是代码，检测端要“读而不执行”，并设置大小、数量和超时边界。
- 规则加载顺序与第一条有效返回值的语义，决定了 `00-*.rules` 或本地覆盖规则的特殊风险。
- 文件变化、规则加载、授权检查、实际提权是四个不同阶段，不能混成同一个结论。
- Go 采集要把事件及时性、快照对账、进程归因和覆盖缺口组合起来，任何单点都不可靠。
- 误报治理应基于包来源、权限、变更过程和业务角色，而不是脆弱的文件名白名单。

## 小练习 / 复盘题

1. 画出 `pkexec` 从用户进程到 root 执行的授权链，标出 `.policy`、`.rules`、`polkitd` 和认证代理的位置。
2. 解释为什么 `/etc/polkit-1/rules.d/00-a.rules` 和 `/usr/share/polkit-1/rules.d/10-b.rules` 的加载顺序不是简单的“先 etc 后 usr”。
3. 写一个只返回 `NOT_HANDLED` 的测试规则，在隔离虚拟机中验证文件变化、重新加载和 `pkcheck` 检查流程；不要在生产机放宽权限。
4. 为 `snapshotRules` 增加“新增、删除、内容变化、权限变化”四类 diff，并为原子重命名设计测试。
5. 设计一个告警事件，要求同时包含 writer process、file hash、action ID、规则证据片段和采集模式。
6. 分别列出 inotify、auditd、fanotify、eBPF 能提供的关键字段和典型缺失字段。
7. 给 `/usr/share` 包升级和 `/etc` 手工变更设计不同的降噪条件，并说明如何避免永久放行。
8. 模拟“规则已修改但未实际调用”的场景，说明为什么不能直接判定主机已经发生提权。

## 参考资料

1. [polkit(8) Reference Manual](https://polkit.pages.freedesktop.org/polkit/polkit.8.html)
2. [polkitd(8) Reference Manual](https://polkit.pages.freedesktop.org/polkit/polkitd.8.html)
3. [pkexec(1) Reference Manual](https://polkit.pages.freedesktop.org/polkit/pkexec.1.html)
4. [pkcheck(1) Reference Manual](https://polkit.pages.freedesktop.org/polkit/pkcheck.1.html)
5. [inotify(7) Linux man-pages](https://man7.org/linux/man-pages/man7/inotify.7.html)
6. [fanotify(7) Linux man-pages](https://man7.org/linux/man-pages/man7/fanotify.7.html)
