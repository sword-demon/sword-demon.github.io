---
title: Go 主机安全面试：Linux 审计规则集篡改与 auditd 采集能力削弱检测
date: 2026-11-20 17:05:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- linux
- audit
---

# Go 主机安全面试：Linux 审计规则集篡改与 auditd 采集能力削弱检测

## 岗位场景

你是云铠主机安全产品的 Go 研发，负责“主机侧证据链的可信度”这一块。客户提的问题往往不是“被攻击了”，而是“证据没了”：

- “客户说机器被入侵了，但 `/var/log/audit/audit.log` 里什么都没有，你们的 EDR 也没告警。”
- “研发本地复现时 `auditctl -l` 里规则都在，但线上机器的规则莫名其妙少了一半。”
- “客户机器上装了 `10-no-audit.rules`，新加的审计规则完全不生效，怎么回事？”
- “有人反馈说 `auditctl -s` 输出的 `lost` 一直在涨，是不是日志写满了？”
- “客户抱怨：装完你们 Agent 之后，auditd 服务起不来了。”
- “有人手工 `auditctl -D` 之后，系统日志就断档了，怎么发现？”

这六类问题指向同一个技术面：**Linux 审计（audit）子系统的配置面，本身就是攻击面**。

很多主机安全产品把 auditd 当成一个“只读数据源”——有事件就解析，没事件就沉默。但 audit 的规则集、守护进程配置、内核运行时开关，全都是可写、且改动后不留明显痕迹的面。攻击者只要动一下“采什么”，你的 EDR 就会安静地变成瞎子；而“安静”正是最难被客户发现、也最难被事后追责的状态。

这一篇把这条链路拆开讲清楚：audit 规则有哪几类、多个规则冲突时谁赢、`augenrules` 怎么把 `rules.d` 合并成 `audit.rules`、内核如何记录规则变更、`auditctl -s` 每个字段怎么用、Go 侧怎么解析和做基线差分、误报怎么治、以及“EDR 没告警”这条经典客户问题的标准排查路径。

---

## 背景速览：audit 的四个面

要判断“审计能力有没有被削弱”，得先知道审计能力由哪几块拼出来。

| 面 | 载体 | 谁会写 | 被动了会怎样 |
| --- | --- | --- | --- |
| 磁盘规则集 | `/etc/audit/rules.d/*.rules` → 合并后的 `/etc/audit/audit.rules` | 管理员 / 包管理器 / 攻击者 | 决定“采什么”，重启或 reload 后生效 |
| 守护进程配置 | `/etc/audit/auditd.conf` | 管理员 / 攻击者 | 决定“记到哪、记多少、什么时候丢” |
| 内核运行时状态 | `auditctl -s`（enabled / failure / backlog / rate limit / immutable） | `auditctl` / 攻击者 | 决定“现在还能不能采、采到了会不会丢” |
| 事件流 | `/var/log/audit/audit.log`、netlink multicast | 内核 → auditd → 插件 | 决定“我们能看到什么” |

四条必须先记住的硬规则，全部有官方手册或内核源码背书：

1. **规则决定采什么，不决定记到哪**。`audit.rules(7)` 原文：规则文件 “is a file containing audit rules that will be loaded by the audit daemon's init script whenever the daemon is started”——规则由守护进程的 init 脚本在启动时加载。
2. **事件在“第一条命中的规则”上生效**。`auditctl(8)` 原文：“the event triggers on the first matching rule”，并且明确建议 “you want suppressions at the top of the list instead of the bottom”。
3. **失败模式决定出问题时怎么办**。`auditctl(8)` 原文：`-f` 的取值是 “0=silent 1=printk 2=panic”，默认值是 1，“Secure environments will probably want to set this to 2”。
4. **不可变锁定只能靠重启解除**。`auditctl(8)` 原文：`-e 2` 会 “lock the audit configuration so that it can't be changed”，“The configuration can only be changed by rebooting the machine”。

还有一个容易被忽略但极其关键的点：**`auditctl -s` 报告的是内核里的值**，不是磁盘文件里的值。手册原话：“It will tell you the in-kernel values that can be set by -e, -f, -r, and -b options”。磁盘上的 `audit.rules` 看起来完美无缺，但内核里跑的可能是另一套规则——只查文件不看运行时状态，是这类检测最经典的漏报。

---

## 高频面试题

### Q1：为什么“审计规则”本身也是攻击面？攻击者有哪几条路让 EDR 瞎掉？

> 简答：审计的采什么、记多少、丢不丢，三个决策点都在攻击者能写的地方。攻击者不需要破坏你的 Agent，只需要让内核不再产生事件，你的 EDR 就会安静地什么都不报。

三条典型路径：

1. **改磁盘规则集**：在 `/etc/audit/rules.d/` 里塞一条抑制规则，或删掉原有的高价值规则。
2. **改运行时规则**：直接 `auditctl -a never,exit -S execve` 或 `auditctl -D`，不碰磁盘文件，重启前一直生效。
3. **改审计输出与运行参数**：把 `write_logs` 关掉、把失败模式降到 `-f 0`（静默）、把 backlog 上限调小、把 `-e 2` 的不可变锁定解除。

关键知识点：

- 攻击者的目标不是“删日志”（那是 `go-hids-linux-log-tamper-detection.md` 覆盖的痕迹清理），而是“让日志从一开始就不产生”。这比删日志更隐蔽，因为日志文件看起来完全正常。
- 抑制规则不一定需要 root 就能审计到，但落地需要 root；反过来，**抑制规则本身是可以被独立采集的**——这是检测成立的前提。
- 审计规则变更在内核里有专门的事件类型（见 Q7），这是这类检测唯一“自证”的可靠信号。

Go 落地思路：

- 检测对象要拆成三份独立证据：**规则集内容差异**、**内核运行时状态**、**规则变更事件**，三者交叉才能给出可信结论。
- 单独任何一份都不足以定性：磁盘文件干净不代表内核干净，运行时正常不代表没有被改过。

### Q2：audit 规则分几类？内核里的过滤列表分别什么时候被检查？

> 简答：按写法分三类（控制指令、文件监视、系统调用规则）；按内核里的匹配列表分，用户可配的有六个：task、exit、user、exclude、filesystem、io_uring。

`audit.rules(7)` 把规则分成三大类：

| 类别 | 典型写法 | 作用 |
| --- | --- | --- |
| 控制指令（control） | `-D`、`-b 8192`、`-f 1`、`-e 2`、`-r 0` | 配置审计系统本身：清空规则、队列上限、失败模式、启用与锁定、速率限制 |
| 文件系统监视（watch） | `-a always,exit -F arch=b64 -F path=/etc/passwd -F perm=wa -k identity` | 盯特定路径的读写执行属性变化 |
| 系统调用规则（syscall） | `-a always,exit -F arch=b64 -S execve -F auid>=1000 -k exec` | 在系统调用匹配引擎里拦截 |

关于过滤列表，`audit.rules(7)` 原文说：“The Linux kernel has 6 rule matching lists or filters as they are sometimes called. They are: task, exit, user, exclude, filesystem, and io_uring.”

- `task`：只在 fork/clone 创建任务时检查，实践中很少用。
- `exit`：系统调用与文件系统审计请求的求值点，是绝大多数规则的落点。
- `user`：过滤用户态产生的事件。
- `exclude`：按消息类型、pid、uid、auid、subject 等字段整条剔除事件。
- `filesystem`：按 fstype 对整个文件系统生效，常用于排除 tracefs、debugfs。
- `io_uring`：过滤 io_uring 底层系统调用。

内核头文件 `include/uapi/linux/audit.h` 里实际定义了 8 个过滤列表（`AUDIT_FILTER_USER`=0x00、`TASK`=0x01、`ENTRY`=0x02、`WATCH`=0x03、`EXIT`=0x04、`EXCLUDE`=0x05、`FS`=0x06、`URING_EXIT`=0x07），其中 `ENTRY`/`WATCH`/`FS` 是内核内部使用的，用户可配的正是手册说的六个。

关键知识点：

- `-a` 的第一个参数是**动作**，第二个是**列表**：`always`（总是产生事件）/ `never`（不产生事件），`task`/`exit`/`user`/`exclude`/`filesystem`/`io_uring`。
- 手册特别强调：动作和列表的顺序可以互换（“It could be list,action or action,list”），所以解析时不能假设固定顺序。
- `never` 是合法的 `action`，而不是“黑名单”：它就是抑制规则。

Go 落地思路：

- 解析时把 `action` 和 `list` 当成两个独立字段，并对未知组合返回错误而不是静默跳过——静默跳过会让攻击者用畸形规则绕过解析器。

### Q3：多个规则冲突时到底谁赢？为什么 `-a never,exit` 能“合法地”关掉审计？

> 简答：先命中先生效。规则列表里靠前的规则优先，`-a` 追加到尾部（优先级最低），`-A` 前插到头部（优先级最高）。所以攻击者只要在规则列表最前面插一条 `never`，后面所有 `always` 规则就再也轮不到了。

手册层面（`auditctl(8)`）的原话是：“In general, you want suppressions at the top of the list instead of the bottom. This is because the event triggers on the first matching rule.”

内核层面（`kernel/auditfilter.c` + `kernel/auditsc.c`）的机制更精确：

- `audit_add_rule()` 里，`-A`（前置）用 `list_add()` 插到链表头，普通追加用 `list_add_tail()` 插到链表尾。
- 对 exit 和 io_uring 列表，内核给每条规则分配一个 `prio`：前置规则取 `++prio_high`（数值更大），追加规则取 `--prio_low`（数值更小，且**越早追加数值越大**）。
- `audit_filter_rules()` 里有一句关键判断：`if (ctx && rule->prio <= ctx->prio) return 0;`——一旦某条规则命中并记下自己的 `prio`，后面优先级不高于它的规则全部被跳过。

三条结论合起来就是：**exit 列表中，越靠前（越早加载）的规则优先级越高，先命中先生效**。

关键知识点：

- 这解释了为什么 `-a never,exit ...` 能直接压掉一整片 `always` 规则：只要它排在前面。
- 也解释了为什么“同一份 `audit.rules` 文件，顺序变了语义就变了”——所以规则集基线必须保留顺序信息，不能简单当集合比较。
- `-A` 前插是“优先级最高”的手段：它能让一条规则凌驾于所有既有规则之上。
- `never` 规则不是“忽略这一条”，而是“这条命中了就整个事件不产生”。

Go 落地思路：

- 规则基线要保留**有序列表**，差分时既要比较集合，也要比较相对顺序（尤其是 `never` 规则的位置）。
- 检测“新增抑制规则”时，判据不能只是“出现了 `never`”，还得看它是不是排在关键 `always` 规则之前。

### Q4：`augenrules` 是怎么把 `rules.d` 合并成 `audit.rules` 的？为什么“改了 rules.d 但 audit.rules 没变”很可疑？

> 简答：`augenrules` 按自然序拼接 `/etc/audit/rules.d/` 下所有 `.rules` 文件（其他文件直接忽略），并把最后一个 `-D`、`-b`、`-f` 指令分别提到第 1、2、3 行，把最后一个 `-e` 放到最后一行；只有合并结果与现有 `audit.rules` 不同才会覆盖写入。

`augenrules(8)` 原文要点：

- “merges all component audit rules files, found in the audit rules directory, `/etc/audit/rules.d`”，且 “Component audit rule files, must end in `.rules` in order to be processed. All other files in `/etc/audit/rules.d` are ignored.”
- “The files are concatenated in order, based on their natural sort”，空行与注释行被去掉。
- “The last processed `-D` directive without an option, if present, is always emitted as the first line in the resultant file.”，`-b` 第二行、`-f` 第三行、`-e` 最后一行。
- “The generated file is only copied to `/etc/audit/audit.rules`, if it differs.”

关键知识点：

- **文件名必须是 `.rules` 结尾**才会被合并。攻击者把载荷写成一个没有 `.rules` 后缀的文件，运维 `ls /etc/audit/rules.d/` 能看见、但 `augenrules` 根本不会加载——这是一个非常实用的“半隐藏”手法。
- **`-D`/`-b`/`-f`/`-e` 的位置是被重排过的**。你在 `rules.d` 里写的位置和最终生效位置不同，这会直接影响规则顺序语义（Q3）。
- **“只有不同才覆盖”**意味着：如果磁盘上的 `audit.rules` 内容与合并结果一致，`augenrules` 不会写文件，`mtime` 不变。只看文件 mtime 的检测会漏掉“内容被改过又改回”的场景。
- 合并结果才是内核启动时真正加载的东西；`rules.d` 只是原料。所以检测必须同时看**原料**和**产物**。

Go 落地思路：

- Agent 自己实现一份与 `augenrules` 语义一致的合并器（Go 侧纯逻辑，很好测），实时计算“合并结果”，与磁盘上的 `audit.rules` 比对。
- 差异本身就是高价值信号：合并结果与产物不一致，说明有人绕过 `augenrules` 直接改了产物，或者产物没被重新生成。
- 同时检查 `rules.d` 下是否存在**非 `.rules` 后缀**但内容像规则的文件。

### Q5：`-a never,task` 是什么？为什么不能一律把它当成攻击？

> 简答：它让所有新进程在创建时跳过全部审计规则处理，是发行版用来省性能的默认开关，也是这类检测最大的误报来源。

`auditctl(8)` 有一节标题就叫 “DISABLED BY DEFAULT”，原文：

> “On many systems auditd is configured to install an `-a never,task` rule by default. This rule causes every new process to skip all audit rule processing. This is usually done to avoid a small performance overhead imposed by syscall auditing. If you want to use auditd, you need to remove that rule by deleting `10-no-audit.rules` and adding `10-base-config.rules` to the audit rules directory. If you have defined audit rules that are not matching when they should, check `auditctl -l` to make sure there is no `never,task` rule there.”

关键知识点：

- 这不是“某个发行版的怪癖”，而是 audit 生态的**标准做法**：RHEL/Fedora 系默认装 `10-no-audit.rules`，里面就是这条规则。
- 文件名里的 `10-` 前缀是刻意的：`augenrules` 按自然序拼接，`10-no-audit.rules` 会排在 `10-base-config.rules` 之前，靠“靠前即优”把整个审计关掉（回到 Q3 的顺序语义）。
- 只有 `task` 列表被关掉时，**系统调用级规则全部失效**，但 exit 列表里的规则其实还在；`never,task` 命中后任务直接跳过规则处理，这才是“全部审计失效”的原因。

误报治理（本条是整篇文章最重要的一条工程经验）：

- 判定依据不能是“机器上存在 `never,task`”，而应该是“**原本不该有 `never,task` 的机器上新增了它**”，或者“**曾经能采到的事件现在采不到了**”。
- 基线要按发行版 + 机器角色（web 服务器 / 数据库 / 跳板机）建立，不要拿一套规则集要求全网一致。
- 采集要同时记录 `auditctl -l` 的**运行时**结果和磁盘文件；只查 `rules.d` 目录会看到 `10-no-audit.rules` 存在，但真正决定状态的是内核里的列表。

Go 落地思路：

- 把“`never,task` 存在”建模成**状态**而不是**事件**：默认关闭 = 正常，基线为开启却被关掉 = 告警。
- 对已知发行版默认配置（`10-no-audit.rules`）建立内置豁免清单，并且这个清单要可运维更新。

### Q6：怎么判断“现在这台机器的审计能力还剩多少”？`auditctl -s` 每个字段怎么用？

> 简答：`auditctl -s` 是内核状态快照，六个字段各管一件事。它比读文件靠谱，因为文件可以撒谎，内核状态不会。

`auditctl(8)` 对 `-s` 的描述：

> “Report the kernel's audit subsystem status. It will tell you the in-kernel values that can be set by -e, -f, -r, and -b options. The pid value is the process number of the audit daemon. **Note that a pid of 0 indicates that the audit daemon is not running.** The lost entry will tell you how many event records that have been discarded due to the kernel audit queue overflowing. The backlog field tells how many event records are currently queued waiting for auditd to read them.”

六个字段的检测含义：

| 字段 | 含义 | 检测含义 |
| --- | --- | --- |
| `enabled` | 内核审计开关（`auditctl -e`） | `0` = 审计被关；`1` = 开启；`2` = 开启且锁定 |
| `pid` | auditd 守护进程 pid | `0` = 守护进程没在跑，事件只堆在内核队列里 |
| `rate_limit` | 每秒消息上限（`-r`） | 被调小 = 更容易触发丢弃 |
| `backlog_limit` | 内核队列上限（`-b`） | 被调小 = 更容易溢出 |
| `lost` | 因队列溢出被丢弃的事件数 | `> 0` = 已经在丢证据 |
| `backlog` | 当前排队等待 auditd 读取的事件数 | 持续接近 `backlog_limit` = auditd 消费不过来 |

关键知识点：

- `lost` 是**累计值**，不是速率；`auditctl --reset-lost` 可以把它清零，所以 `lost` 归零既可能是健康，也可能是被清过，需要结合日志轮转时间判断。
- `backlog` 持续高位 + `lost` 增长 = 典型的“采集链路堵了”，对应 `go-hids-linux-event-loss-troubleshooting.md` 里的排查路径。
- `enabled 2`（不可变锁定）是一种**防护**而不是削弱：它意味着连 root 也不能在运行期改规则，代价是改配置必须重启机器。
- 执行 `auditctl -s` 需要权限（读内核 audit 状态），所以 Agent 通常以 root 运行，或用文件方式降级采集。

Go 落地思路：

- 解析 `auditctl -s` 输出成结构体，做成**周期快照 + 变化点告警**，而不是每次都当异常。
- 快照节奏按主机角色分档：核心业务机 5 分钟一次，普通机器 30 分钟一次。

```go
package main

import (
	"fmt"
	"strconv"
	"strings"
)

// AuditStatus 是 `auditctl -s` 输出的结构化表示。
type AuditStatus struct {
	Enabled      int
	DaemonPID    int
	RateLimit    int
	BacklogLimit int
	Lost         int
	Backlog      int
}

// ParseAuditStatus 解析 `auditctl -s` 的输出。
//
// 输出是若干 "key value" 行，典型形态（字段顺序需在目标主机核验）：
//
//	enabled 1
//	pid 1234
//	rate_limit 0
//	backlog_limit 8192
//	lost 0
//	backlog 0
func ParseAuditStatus(out string) (AuditStatus, error) {
	status := AuditStatus{DaemonPID: -1}
	targets := map[string]*int{
		"enabled":       &status.Enabled,
		"pid":           &status.DaemonPID,
		"rate_limit":    &status.RateLimit,
		"backlog_limit": &status.BacklogLimit,
		"lost":          &status.Lost,
		"backlog":       &status.Backlog,
	}
	for _, line := range strings.Split(out, "\n") {
		fields := strings.Fields(line)
		if len(fields) == 0 {
			continue
		}
		target, ok := targets[fields[0]]
		if !ok {
			continue
		}
		if len(fields) < 2 {
			return AuditStatus{}, fmt.Errorf("audit status: %q 缺少数值", line)
		}
		value, err := strconv.Atoi(fields[1])
		if err != nil {
			return AuditStatus{}, fmt.Errorf("audit status: %s: %w", fields[0], err)
		}
		*target = value
	}
	return status, nil
}

// DaemonRunning 判断 auditd 是否在运行：auditctl -s 的 pid 为 0 表示守护进程没有运行。
func (s AuditStatus) DaemonRunning() bool {
	return s.DaemonPID > 0
}
```

### Q7：内核怎么记录“规则被改了”？Go 侧怎么采这条事件？

> 简答：内核把审计配置变更统一记成 `AUDIT_CONFIG_CHANGE`（消息类型 1305），里面分两种形态：规则增删（`op=add_rule` / `op=remove_rule`）和控制项变更（`op=set xxx= new old= old`）。

内核头文件 `include/uapi/linux/audit.h`：

```c
#define AUDIT_CONFIG_CHANGE	1305	/* Audit system configuration change */
#define AUDIT_DAEMON_START      1200    /* Daemon startup record */
#define AUDIT_DAEMON_END        1201    /* Daemon normal stop record */
#define AUDIT_DAEMON_ABORT      1202    /* Daemon error stop record */
#define AUDIT_DAEMON_CONFIG     1203    /* Daemon config change */
```

规则增删的记录格式，来自 `kernel/auditfilter.c` 的 `audit_log_rule_change()`：

```c
	audit_log_format(ab, " op=%s", action);
	audit_log_key(ab, rule->filterkey);
	audit_log_format(ab, " list=%d res=%d", rule->listnr, res);
```

其中 `action` 是 `"add_rule"` 或 `"remove_rule"`（见 `audit_rule_change()`），`res` 表示本次操作是否成功。

控制项变更的记录格式，来自 `kernel/audit.c` 的 `audit_log_config_change()`：

```c
	audit_log_format(ab, "op=set %s=%u old=%u ", function_name, new, old);
	...
	audit_log_format(ab, " res=%d", allow_changes);
```

关键知识点：

- 这两类事件都会带上会话信息和任务上下文（uid、auid、pid、comm、exe），所以**归因不需要额外工作**。
- `res` 字段是这条事件最有用的部分：不可变锁定（`audit_enabled == AUDIT_LOCKED`）时，变更被拒绝并记 `res=0`。也就是说，**一次失败的越权改规则尝试，本身就是最强的入侵信号**。
- `AUDIT_DAEMON_ABORT`（1202）表示 auditd 异常退出，`AUDIT_DAEMON_START/END` 是正常生命周期，三者一起能还原“守护进程被重启过”的事实。
- 事件类型 1305 属于内核消息，采集成 Agent 可以从 `/var/log/audit/audit.log` 解析，也可以订阅 audit 的 netlink multicast 组（`AUDIT_EVENT_LISTENER`=1335 就是“任务加入 multicast 读套接字”事件）。

Go 落地思路：

- 解析 `type=1305` 的记录，抽出 `op`、`key`、`list`、`res`、控制项名、新旧值、调用者身份。
- 判据优先级：`res=0`（被拒绝的篡改尝试）> 规则增删 > 控制项降级。
- 这条事件是**唯一不依赖被篡改面的信号**，所以必须独立采集、独立告警，不能和“读文件”混在同一条链路里。

### Q8：Go 侧怎么把规则文件变成可比较的结构？怎么做基线差分？

> 简答：解析成 `{类型, 动作, 列表, 系统调用集, 字段集, key}` 的规范形式，比较时用“归一化标识”做集合差集，再对控制项做数值比较。

关键知识点：

- 归一化时要把**顺序无关的部分**（`-S` 的系统调用集合、`-F` 的字段集合）排序后拼接，否则书写顺序差异会淹没真实差异。
- 但**顺序有关的部分不能丢**：规则在文件里的相对位置决定优先级（Q3）。所以差分结果要能回答“这条 `never` 是不是排在关键规则前面”。
- 控制项（`-b`/`-e`/`-f`/`-r`）要单独做数值比较，不能当普通规则做集合差。

Go 落地思路：

```go
package main

import (
	"fmt"
	"strings"
)

// AuditRule 是审计规则的规范化表示。
type AuditRule struct {
	Raw          string
	Kind         string // control / syscall / watch
	Action       string // always / never
	List         string // task / exit / user / exclude / filesystem / io_uring
	Syscalls     []string
	Fields       []string
	Key          string
	Path         string
	Perms        string
	Control      string // D / b / e / f / r
	ControlValue string
}

var auditLists = map[string]bool{
	"task": true, "exit": true, "user": true,
	"exclude": true, "filesystem": true, "io_uring": true,
}

// expandFlags 把 "-Sexecve" 这类紧凑写法展开成 "-S" "execve"，两种写法都要支持。
func expandFlags(tokens []string) []string {
	out := make([]string, 0, len(tokens))
	for _, token := range tokens {
		switch {
		case token == "-S" || token == "-F" || token == "-k" || token == "-p":
			out = append(out, token)
		case strings.HasPrefix(token, "-S"):
			out = append(out, "-S", strings.TrimPrefix(token, "-S"))
		case strings.HasPrefix(token, "-F"):
			out = append(out, "-F", strings.TrimPrefix(token, "-F"))
		case strings.HasPrefix(token, "-k"):
			out = append(out, "-k", strings.TrimPrefix(token, "-k"))
		case strings.HasPrefix(token, "-p"):
			out = append(out, "-p", strings.TrimPrefix(token, "-p"))
		default:
			out = append(out, token)
		}
	}
	return out
}

// ParseRuleLine 解析一行审计规则。无法识别时返回 ok=false（调用方应跳过并计数）。
func ParseRuleLine(line string) (AuditRule, bool) {
	tokens := strings.Fields(line)
	if len(tokens) == 0 {
		return AuditRule{}, false
	}
	tokens = expandFlags(tokens)
	rule := AuditRule{Raw: strings.Join(tokens, " ")}
	switch tokens[0] {
	case "-D":
		rule.Kind, rule.Control = "control", "D"
		return rule, true
	case "-b", "-e", "-f", "-r":
		rule.Kind, rule.Control = "control", strings.TrimPrefix(tokens[0], "-")
		if len(tokens) > 1 {
			rule.ControlValue = tokens[1]
		}
		return rule, true
	case "-w":
		rule.Kind, rule.Action, rule.List = "watch", "always", "filesystem"
		if len(tokens) > 1 {
			rule.Path = tokens[1]
		}
	case "-a", "-A":
		rule.Kind = "syscall"
		if len(tokens) < 2 {
			return AuditRule{}, false
		}
		action, list, ok := splitActionList(tokens[1])
		if !ok {
			return AuditRule{}, false
		}
		rule.Action, rule.List = action, list
	default:
		return AuditRule{}, false
	}
	for i := 1; i < len(tokens); i++ {
		switch tokens[i] {
		case "-S":
			if i+1 >= len(tokens) {
				return AuditRule{}, false
			}
			i++
			rule.Syscalls = append(rule.Syscalls, tokens[i])
		case "-F":
			if i+1 >= len(tokens) {
				return AuditRule{}, false
			}
			i++
			rule.Fields = append(rule.Fields, tokens[i])
		case "-k":
			if i+1 >= len(tokens) {
				return AuditRule{}, false
			}
			i++
			rule.Key = tokens[i]
		case "-p":
			if i+1 >= len(tokens) {
				return AuditRule{}, false
			}
			i++
			rule.Perms = tokens[i]
		}
	}
	return rule, true
}

// splitActionList 解析 "always,exit" 这类参数，动作与列表的顺序可以互换。
func splitActionList(spec string) (action string, list string, ok bool) {
	parts := strings.Split(spec, ",")
	if len(parts) != 2 {
		return "", "", false
	}
	for _, part := range parts {
		switch {
		case part == "always" || part == "never":
			action = part
		case auditLists[part]:
			list = part
		default:
			return "", "", false
		}
	}
	if action == "" || list == "" {
		return "", "", false
	}
	return action, list, true
}
```

差分与削弱判定：

```go
package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// RuleIdentity 返回规则的归一化标识：忽略书写顺序，只看语义。
func (r AuditRule) RuleIdentity() string {
	switch r.Kind {
	case "control":
		return fmt.Sprintf("control|%s|%s", r.Control, r.ControlValue)
	case "watch":
		return fmt.Sprintf("watch|%s|%s|%s", r.Path, r.Perms, r.Key)
	default:
		syscalls := append([]string(nil), r.Syscalls...)
		sort.Strings(syscalls)
		fields := append([]string(nil), r.Fields...)
		sort.Strings(fields)
		return fmt.Sprintf("syscall|%s|%s|%s|%s|%s", r.Action, r.List,
			strings.Join(syscalls, ","), strings.Join(fields, ","), r.Key)
	}
}

// DiffRules 比较基线规则集和当前规则集。
func DiffRules(baseline, current []AuditRule) (added, removed []AuditRule) {
	base := make(map[string]bool, len(baseline))
	for _, rule := range baseline {
		base[rule.RuleIdentity()] = true
	}
	cur := make(map[string]bool, len(current))
	for _, rule := range current {
		cur[rule.RuleIdentity()] = true
	}
	for _, rule := range current {
		if !base[rule.RuleIdentity()] {
			added = append(added, rule)
		}
	}
	for _, rule := range baseline {
		if !cur[rule.RuleIdentity()] {
			removed = append(removed, rule)
		}
	}
	return added, removed
}

// WeakenedReasons 返回"审计能力被削弱"的原因；空切片代表没有发现削弱。
func WeakenedReasons(baseline, current []AuditRule) []string {
	added, removed := DiffRules(baseline, current)
	var reasons []string
	for _, rule := range added {
		switch {
		case rule.Action == "never" && (rule.List == "exit" || rule.List == "task"):
			reasons = append(reasons, "新增抑制规则: "+rule.Raw)
		case rule.Kind == "control" && rule.Control == "D":
			reasons = append(reasons, "新增清空规则: "+rule.Raw)
		}
	}
	for _, rule := range removed {
		if rule.Action == "always" {
			reasons = append(reasons, "审计规则被删除: "+rule.Raw)
		}
	}
	baseControls := controlValues(baseline)
	curControls := controlValues(current)
	if before, ok := baseControls["f"]; ok {
		if after, ok := curControls["f"]; ok && after < before {
			reasons = append(reasons, fmt.Sprintf("失败模式被降级: -f %d -> -f %d", before, after))
		}
	}
	if before, ok := baseControls["e"]; ok && before == 2 {
		if after, ok := curControls["e"]; !ok || after != 2 {
			reasons = append(reasons, "规则失去不可变锁定: -e 2 -> 可写")
		}
	}
	for _, name := range []string{"b", "r"} {
		before, ok := baseControls[name]
		if !ok {
			continue
		}
		after, ok := curControls[name]
		if ok && after < before {
			reasons = append(reasons, fmt.Sprintf("%s 上限被调小: %d -> %d", controlLabel(name), before, after))
		}
	}
	return reasons
}

// controlValues 提取规则集中的控制项数值（-b/-e/-f/-r）。
func controlValues(rules []AuditRule) map[string]int {
	values := make(map[string]int)
	for _, rule := range rules {
		if rule.Kind != "control" {
			continue
		}
		value, err := strconv.Atoi(rule.ControlValue)
		if err != nil {
			continue
		}
		values[rule.Control] = value
	}
	return values
}

func controlLabel(name string) string {
	switch name {
	case "b":
		return "backlog"
	case "r":
		return "rate limit"
	default:
		return name
	}
}
```

### Q9：`auditd.conf` 被改了怎么发现？哪些配置项最值得盯？

> 简答：它管的是“记到哪、记多少、什么时候丢”，改动不影响规则语义，但能让审计结果悄悄消失。优先级最高的是 `write_logs`、`log_file`、`space_left_action` 这几个。

`auditd.conf(5)` 的关键配置项：

| 配置项 | 作用 | 被篡改的后果 |
| --- | --- | --- |
| `write_logs` | 是否把日志写到磁盘，默认 yes | 改成 `no` = 不落盘，磁盘上什么都看不到 |
| `log_file` | 日志路径，默认 `/var/log/audit/audit.log` | 改到临时目录 = 日志消失 |
| `log_format` | `raw` / `enriched` | 改成 raw 会让解析器拿不到解释后的 uid/系统调用名 |
| `flush` / `freq` | 刷盘策略与频率，默认 `incremental_async` | 改成 `none` = 崩溃即丢尾部事件 |
| `max_log_file` / `max_log_file_action` | 日志轮转与保留策略 | 改成只留 1 个 = 历史证据被覆盖 |
| `space_left` / `space_left_action` | 磁盘低水位与动作 | 动作改成 `ignore` = 磁盘满后静默丢弃 |
| `ruleset_file` | 加载哪个规则文件 | 指向攻击者自备的规则文件 |
| `local_events` | 是否接收本机事件 | 改成 `no` = 只收网络事件 |
| `name` | 标识该机器的字符串 | 影响 `auname` 字段，少量用于关联 |

关键知识点（全部来自 `auditd.conf(5)` 原文）：

- “Each line should be limited to 160 characters or the line will be skipped.” —— 超长行被**静默跳过**。这是一个绝妙的攻击面：把关键配置项改成一个超长行，它就等于被注释掉了，而配置文件看起来只是“有点长”。
- “All option names and values are case insensitive.” —— `WRITE_LOGS = NO` 和 `write_logs = no` 等价，解析器必须大小写不敏感。
- `local_events` “can only be set at daemon start up. Reloading the config file has no effect.” —— 改它必须重启 daemon，这让“配置文件变了但运行时没变”成为正常现象，需要在结论里区分“配置待生效”和“已被篡改”。

Go 落地思路：

- 采集 `auditd.conf` 的解析快照 + 关键项白名单（只关心 `write_logs`/`log_file`/`log_format`/`flush`/`freq`/`max_log_file*`/`space_left*`/`ruleset_file`）。
- 对每一行做长度检查：超过 160 字符的行单独标记，这是官方语义下的“静默失效”。
- `auditd.conf` 变更用 inotify 采集（需要 root），同时用进程执行事件捕获 `vi`/`sed`/`tee` 等对该文件的写入作为交叉验证。

### Q10：采集面怎么选？用 audit 自己的日志发现 audit 被改，逻辑上成立吗？

> 简答：不成立。审计面被削弱时，审计流本身就不可信了。必须用**独立于 audit 的采集面**做交叉验证，这是这类检测能不能落地的分水岭。

各采集面的边界：

| 采集面 | 能看到什么 | 边界 / 盲区 |
| --- | --- | --- |
| audit 事件流（1305 等） | 规则增删、控制项变更，带完整调用者身份 | **审计被关、被删规则时它自己就瞎了**；依赖 auditd 在运行 |
| `/proc`、`/sys` 快照 | 内核暴露的运行时状态 | 部分状态不暴露（如 `auditctl -s` 需要 netlink） |
| inotify | 规则文件、配置文件的写/改名/移动 | 需要 root；队列溢出会丢事件（见 `go-hids-linux-inotify-watch-overflow-recovery.md`）；不覆盖内核内存里的改动 |
| fanotify | 可按挂载点做更细的目录级监控 | 权限要求更高，部署成本高 |
| eBPF（`execve`/`openat`/`write`） | 进程执行、文件写入，独立于 audit | 需要内核能力与权限；探针本身可能被摘除（见 `go-hids-linux-ebpf-rootkit-detection.md`） |
| 进程执行采集 | `auditctl`/`augenrules`/`systemctl stop auditd` 这类命令本身 | 依赖 exec 事件通道可用 |

关键知识点：

- **自证循环**是这个方向的核心矛盾：用审计日志证明审计没被篡改是循环论证。可行的做法是：**用一个独立通道检测“审计通道是否还在产出预期事件”**——比如 Agent 自己周期性在受控路径上做一次无害动作（例如创建一个带唯一 key 的临时文件），检查 audit 是否真的产出了对应记录。没有产出 = 审计通道被削弱。这个思路叫“主动探针（canary）”。
- 主动探针要注意副作用：不能制造噪声告警，探针本身要能被自己识别并豁免。
- 多通道交叉的价值：inotify 说文件被改了 + eBPF 说 `auditctl -D` 被执行了 + 内核状态说规则数对不上，三条独立证据才能定性。

Go 落地思路：

- 采集层至少保留两条**技术栈不同**的通道（audit / inotify / eBPF 中任选两条），任一通道异常时结论降级为 `unknown` 而不是直接告警。
- 主动探针作为独立任务运行，周期可配置，默认关闭（按需开启），因为它会产生真实系统调用。

### Q11：结论怎么给？为什么必须是三态而不是二态？

> 简答：因为你永远无法证明“没有任何东西被改过”。二态结论（非黑即白）要么漏报要么误报；三态（正常 / 被削弱 / 无法判定）是把不确定性显式表达出来。

三态的判定输入：

| 状态 | 含义 | 典型触发条件 |
| --- | --- | --- |
| `healthy` | 规则集与基线一致，内核状态正常，守护进程在跑 | 无差异、无降级 |
| `weakened` | 明确发现有削弱证据 | 新增抑制规则、关键规则被删、失败模式降级、`enabled 0`、守护进程未运行、出现 1305 变更事件 |
| `unknown` | 关键输入缺失，无法判定 | 无基线、规则文件不可读、`auditctl -s` 执行失败、auditd 未安装、多通道互相矛盾 |

关键知识点：

- `unknown` 必须能被上报到服务端，否则客户看到“沉默”就等于“没问题”。
- 发行版差异是 `unknown` 的主要来源：Debian/Ubuntu 默认不装 auditd 规则（只有基础配置），RHEL/Fedora 系默认带一整套规则。拿一套基线去要求所有机器一致，产出的全是噪声。
- 机器角色差异也是来源：容器节点、CI runner、临时虚机本来就不该有完整规则集。

Go 落地思路：

```go
package main

import "fmt"

// CapabilityState 是审计能力的三态结论。
type CapabilityState string

const (
	StateHealthy  CapabilityState = "healthy"
	StateWeakened CapabilityState = "weakened"
	StateUnknown  CapabilityState = "unknown"
)

// Assessment 是一次审计能力评估的结果。
type Assessment struct {
	State   CapabilityState
	Reasons []string
}

// AssessAuditCapability 综合内核状态与规则集差异，给出三态结论。
// 承接 Q6 的 AuditStatus：status 来自 `auditctl -s`，reasons 来自规则集差分。
func AssessAuditCapability(status AuditStatus, reasons []string, baselineAvailable bool) Assessment {
	if !baselineAvailable {
		return Assessment{
			State:   StateUnknown,
			Reasons: []string{"缺少规则基线，只能判定当前状态，无法判定是否被篡改"},
		}
	}
	all := append([]string(nil), reasons...)
	if status.Enabled == 0 {
		all = append(all, "内核审计已关闭 (auditctl -s: enabled 0)")
	}
	if !status.DaemonRunning() {
		all = append(all, "auditd 守护进程未运行 (auditctl -s: pid 0)")
	}
	if status.Lost > 0 {
		all = append(all, fmt.Sprintf("内核审计队列丢失 %d 条事件", status.Lost))
	}
	if len(all) > 0 {
		return Assessment{State: StateWeakened, Reasons: all}
	}
	return Assessment{State: StateHealthy, Reasons: []string{}}
}
```

### Q12：这条检测怎么落地成一条可用的规则？客户说“EDR 没告警”怎么排查？

> 简答：规则本身只做一件事——在规则集、内核状态、变更事件三者之间找不一致；排查则按“守护进程 → 内核开关 → 规则内容 → 输出配置 → 容量”五步走。

规则要素：

```text
输入：
  - 规则基线（来自服务端下发或首次运行快照）
  - /etc/audit/rules.d/*.rules 与 /etc/audit/audit.rules
  - auditctl -s 输出（enabled / pid / lost / backlog / -e / -f / -b / -r）
  - type=1305 事件（规则增删、控制项变更）
  - /etc/audit/auditd.conf 关键项
判定：
  - 规则集差异（新增 never / 删除 always / 控制项降级）
  - 运行时状态降级（enabled=0 / pid=0 / lost 增长）
  - 变更事件（res=0 的越权尝试最高优先级）
输出：
  - 三态结论 + 证据（差异明细、原始行、调用者身份）
  - 受影响的能力域（哪些事件类型将不再产生）
```

客户排查 SOP（“审计日志是空的 / EDR 没告警”）：

1. **守护进程在跑吗**：`auditctl -s` 的 `pid` 是否为 0；`systemctl status auditd`（Debian 系服务名可能是 `auditd`）。pid=0 说明事件在内核队列里堆着，没人消费。
2. **内核审计开着吗**：`enabled` 是否为 0；是不是被人 `auditctl -e 0` 过。
3. **规则还在吗**：`auditctl -l` 是否有预期规则；有没有 `never,task`（Q5）；规则是不是被 `auditctl -D` 清空过。
4. **输出配置对吗**：`write_logs` 是否被关；`log_file` 路径是否还在、目录是否存在、属主是否正确；`log_format` 是否被改成 `raw` 导致解析失效。
5. **容量与水位**：`lost` 是否有增长；`backlog` 是否长期贴近 `backlog_limit`；磁盘 `space_left` 是否触发过 `space_left_action`。

关键知识点：

- 排查顺序要**从便宜到昂贵**：先看 `auditctl -s`（一次调用给出五个答案），再看文件，最后才看进程执行历史。
- 每一步都对应一类攻击手法，排查过程本身就是一次手工的检测验证——这是把客户问题变成规则用例的最好来源。
- 排查结论要回写规则：把“排查步骤”沉淀成可复用的规则用例库，比一次性排查更有价值。

Go 落地思路：

- 把上面 5 步做成一个**诊断工具**（`auditctl -s` 解析 + 文件快照 + 配置解析 + 结论），既能给客户用，也能生成告警证据。
- 诊断输出直接复用规则评估函数，保证“人工排查”和“自动告警”结论一致，不出现两套口径。

---

## Go 落地思路小结

| 环节 | Go 侧做法 | 关键约束 |
| --- | --- | --- |
| 规则解析 | 自实现 `ParseRuleLine`，输出 `{Kind, Action, List, Syscalls, Fields, Key}` | 未知写法必须报错并计数，不能静默丢弃 |
| 合并复现 | 复刻 `augenrules` 语义：自然序拼接 `.rules`、剥离注释与空行、`-D/-b/-f/-e` 提到固定位置 | 复现结果要能与 `audit.rules` 对齐，否则差分全是噪声 |
| 基线差分 | 归一化标识做集合差 + 控制项数值比较 + 顺序检查 | 顺序有语义，不能只比集合 |
| 运行时状态 | `auditctl -s` 周期快照，变化点告警 | 快照节奏按主机角色分档 |
| 变更事件 | 解析 `type=1305`，抽 `op/key/list/res` | `res=0`（被拒绝的篡改）优先级最高 |
| 配置面 | `auditd.conf` 关键项快照 + 160 字符行长检查 | 键值大小写不敏感 |
| 交叉验证 | audit 通道 + 至少一条独立通道（inotify / eBPF / exec） | 单通道结论降级为 `unknown` |
| 结论 | 三态：healthy / weakened / unknown | `unknown` 必须上报，不能当作正常 |

---

## 小练习 / 复盘题

1. 列出 audit 规则的三种类型各一条示例写法，并说明 `-a` 后面的两个参数分别代表什么、顺序能否互换。
2. 内核一共定义了 8 个过滤列表，用户可配的是哪 6 个？`task` 列表在什么时机被检查？
3. 为什么手册建议把抑制规则（`never`）放在规则列表的**前面**？用内核 `prio` 机制解释清楚。
4. `auditctl -A` 和 `auditctl -a` 插入规则的位置有什么区别？哪个优先级更高？
5. `augenrules` 合并时对最后一个 `-D`、`-b`、`-f`、`-e` 分别做了什么处理？为什么这会改变规则顺序语义？
6. 为什么“`/etc/audit/rules.d/` 里存在一个非 `.rules` 后缀的文件”值得单独告警？
7. `10-no-audit.rules` 里的 `-a never,task` 做了什么？为什么它不能一律判为攻击？
8. `auditctl -s` 输出的 `pid` 为 0 意味着什么？`lost` 为 0 能否证明审计没有丢过事件？
9. `-f 0`、`-f 1`、`-f 2` 三种失败模式分别对应什么行为？默认是哪个？为什么安全环境通常选 2？
10. `-e 2` 的不可变锁定是怎么实现的？解除它需要做什么？它的副作用是什么？
11. 内核把审计配置变更记成哪种消息类型？规则增删和配置项变更在字段上有什么区别？
12. 一条 `type=1305` 记录里 `res=0` 代表什么？这条事件为什么应该被排到最高告警优先级？
13. `auditd.conf` 里超过 160 个字符的行会发生什么？这个特性为什么对攻击者有用？
14. `auditd.conf` 的键名和值是否区分大小写？`local_events` 改完配置 reload 会生效吗？
15. 写一段 Go 代码解析 `auditctl -s` 输出，至少支持 `enabled`、`pid`、`lost`、`backlog` 四个字段，并对缺字段和非法数值分别返回错误。写至少 3 个边界用例。
16. 写一段 Go 代码解析审计规则文件，支持 `-a/-A/-w/-D/-b/-e/-f/-r` 七种写法，正确处理 `always,exit` 与 `exit,always` 两种顺序。写至少 4 个边界用例（空行、未知动作、未知列表、缺参数）。
17. 写一段 Go 代码对规则集做基线差分：能识别“新增 `never,exit` 抑制规则”“删除 `always` 规则”“`-f` 从 1 降到 0”“`-e` 从 2 变成可写”四类削弱。写至少 5 个单测。
18. 设计一个“审计主动探针”：Agent 定期做一个无害动作来验证 audit 通道是否还在产出记录。说明这个动作怎么选、怎么避免产生噪声告警、探针失败时结论应该是什么状态。
19. 一台机器的 `auditctl -s` 显示 `enabled 1`、`pid 4321`、`lost 0`、`backlog 0`，但 `auditctl -l` 里没有任何规则。这台机器的审计能力处于什么状态？你的结论应该是什么状态值？
20. 客户说“装了你们 Agent 之后 auditd 起不来了”。请给出至少 4 个可能原因（Agent 侧 + 主机侧各一半），并说明你会依次执行什么命令来定位。
21. 某台机器的规则基线里有 `-e 2`，现在 `auditctl -s` 的 `enabled` 是 1。这说明发生了什么？属于哪一类结论？
22. 请画出这张判定链，并说明每个环节失败时结论应该落到哪个状态：基线 → 规则文件 → `auditctl -s` → 1305 事件 → 交叉通道。

---

## 参考资料

1. [Linux man-pages：audit.rules(7)](https://man7.org/linux/man-pages/man7/audit.rules.7.html) —— 规则三大类型、六个过滤列表、`always`/`never` 动作、syscall 规则写法、`auid` 未设置时为 4294967295、watch 递归在挂载点处停止
2. [Linux man-pages：auditctl(8)](https://man7.org/linux/man-pages/man8/auditctl.8.html) —— `-a`/`-A`/`-D`/`-b`/`-e`/`-f`/`-r`/`-s`/`-l` 语义、“the event triggers on the first matching rule”、失败模式 0/1/2、“DISABLED BY DEFAULT” 一节关于 `10-no-audit.rules` 与 `-a never,task` 的原文
3. [Linux man-pages：auditd.conf(5)](https://man7.org/linux/man-pages/man5/auditd.conf.5.html) —— `write_logs`/`log_file`/`log_format`/`flush`/`freq`/`max_log_file*`/`space_left*`/`ruleset_file`/`local_events` 语义、行长 160 字符限制、键值大小写不敏感
4. [audit-userspace：augenrules(8)](https://raw.githubusercontent.com/linux-audit/audit-userspace/master/docs/augenrules.8) —— 合并语义：仅处理 `.rules`、自然序拼接、剥离空行与注释、`-D`/`-b`/`-f`/`-e` 的固定位置、仅在内容不同时才覆盖写入
5. [Linux man-pages：auditd(8)](https://man7.org/linux/man-pages/man8/auditd.8.html) —— 守护进程职责与启动时的规则加载流程
6. [内核源码：`include/uapi/linux/audit.h`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/plain/include/uapi/linux/audit.h) —— `AUDIT_CONFIG_CHANGE`=1305、`AUDIT_DAEMON_START/END/ABORT/CONFIG`=1200~1203、8 个 `AUDIT_FILTER_*` 列表编号、`AUDIT_FILTER_PREPEND`=0x10
7. [内核源码：`kernel/auditfilter.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/plain/kernel/auditfilter.c) —— `audit_add_rule()` 的 `list_add`/`list_add_tail` 插入位置、`prio_high`/`prio_low` 优先级分配、`audit_log_rule_change()` 的 `op=`/`key=`/`list=`/`res=` 字段格式
8. [内核源码：`kernel/auditsc.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/plain/kernel/auditsc.c) —— `__audit_filter_op()` 顺序遍历与首个命中即返回、`audit_filter_rules()` 中 `rule->prio <= ctx->prio` 的跳过逻辑、命中后 `ctx->prio = rule->prio`
9. [内核源码：`kernel/audit.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/plain/kernel/audit.c) —— `audit_log_config_change()` 的 `op=set %s=%u old=%u` 格式、不可变锁定下 `allow_changes=0` 与 `res=0`
10. [同站文章：Go 主机安全面试：Linux 日志清理与审计痕迹破坏检测](go-hids-linux-log-tamper-detection.md) —— 攻击者对“痕迹”的系统性清理，与本文的“配置面削弱”互为补充
11. [同站文章：Go 主机安全面试：Linux 主机事件丢失与采集链路排障](go-hids-linux-event-loss-troubleshooting.md) —— `lost`/`backlog` 语义与采集链路堵死的排查路径
12. [同站文章：Go 主机安全面试：Linux inotify 监控覆盖与溢出恢复](go-hids-linux-inotify-watch-overflow-recovery.md) —— 用 inotify 采集规则文件变更时的覆盖与溢出边界
