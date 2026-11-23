---
title: Go 主机安全面试：Linux 引导链劫持与 kexec 内核替换检测
date: 2026-11-23 17:20:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- linux
- bootkit
- kexec
- uefi
---

# Go 主机安全面试：Linux 引导链劫持与 kexec 内核替换检测

前面写过一篇 [Windows 启动链完整性与 Bootkit 检测](go-edr-windows-boot-chain-bootkit-detection.md)，那篇的核心矛盾是"Agent 启动得太晚"。Linux 这边有一个**更狠**的同类问题，而且面试里几乎没人主动提：

**Secure Boot 开着，机器照样能被换掉整个内核。**

原因不在固件，在内核自己提供的一个系统调用——`kexec_file_load(2)`。它允许正在运行的内核把另一个内核镜像直接读进内存，下次重启（或崩溃时）直接跳过去，**完全不经过 UEFI、不经过 shim、不经过 GRUB**。Secure Boot 校验的是"固件从启动介质加载镜像"这条路径，而 kexec 是"已经在跑的内核往内存里塞镜像"，签名链在这里是断的。

内核自己也承认这一点。`kernel_lockdown(7)` 明确写着：只有在 lockdown 生效时，"Only validly signed binaries may be kexec'd"——反过来说，**没开 lockdown 就可以 kexec 一个没签名的内核**。

所以这篇要回答的是三个层次的问题：

1. Linux 引导链上到底有哪些"可被改写"的面，每个面能换来什么攻击收益？
2. 怎么在**用户态**发现这些面被动过手（GRUB 配置、initramfs hook、EFI 启动项、preload 的内核）？
3. 结论怎么给？为什么这类检测**必须**是三态（正常 / 被篡改 / 无法判定），而不是二态？

## 岗位场景

```text
客户：某公有云 IaaS 客户，Ubuntu 22.04 物理机 × 120 台，跨 3 个可用区。
        业务跑在 /opt/app 下，Agent 版本 3.2.x。

现象：
  - 某次批量安全基线整改后，运维在 /etc/default/grub 里加了
    GRUB_CMDLINE_LINUX_DEFAULT="audit=1" 想开审计，重启了 3 台试点机。
  - 试点机当天下午有 2 台出现"进程凭空消失、Agent 进程被杀但日志正常"的现象，
    重启后现象消失，文件查杀全绿。
  - 客户安全团队要求：给出一个"引导链被篡改"的检测能力，
    但同时明确说"不要因为内核升级就报高危"。

排查方向：
  1) grub.cfg 里有没有多出来的 menuentry / 可疑的内核路径 / 异常启动参数？
  2) initramfs 里有没有多出来的 dracut hook？
  3) /sys/firmware/efi/efivars 里有没有多出来的 Boot#### 启动项？
  4) /sys/kernel/kexec_loaded 是不是 1？lockdown 是什么级别？
  5) SecureBoot 变量现在是 1 还是 0？

面试官真正想听的：
  - 你怎么区分"运维改的"和"攻击者改的"？（基线 + 变更审计）
  - 你的 Agent 是在 initramfs 之后才启动的，前面的事你怎么知道？
  - 这条结论你敢不敢给二态？
```

## 背景速览：一次 Linux 启动要经过多少个可写面

```text
 UEFI 固件
    │  校验签名(Secure Boot)、读 BootOrder
    ▼
 ESP: \EFI\<vendor>\shimx64.efi          ← shim：第一阶段 UEFI loader
    │  验证 GRUB（内置证书 / DB / MOK），可扩展 PCR 计量
    ▼
 \EFI\<vendor>\grubx64.efi               ← GRUB 二阶段
    │  读 grub.cfg（本质是脚本，顶层命令会被执行）
    │  读 grubenv（save_env/load_env 持久化）
    ▼
 grub.cfg → linux / initrd               ← 决定"加载哪个内核、传什么参数"
    ▼
 vmlinuz-<ver>  +  initramfs-<ver>       ← initramfs 里可以再执行任意 shell
    ▼
 内核（kexec 可在此处被整个替换）
    ▼
 init / systemd（此时 Agent 才启动）
```

每一层都是一个"攻击者用 root 就能改、而你的 Agent 看不到过程"的落点：

| 层面 | 典型落点 | 攻击收益 | 采集难度 | 误报率 |
| --- | --- | --- | --- | --- |
| 固件/EFI 变量 | `efivars` 里的 `Boot####`、`BootNext` | 换启动介质、下次开机走另一条链 | 低（读文件即可） | 中 |
| shim/GRUB 镜像 | ESP 上的 `.efi` | 直接换第二阶段引导器 | 低（hash 基线） | 低 |
| GRUB 配置 | `grub.cfg`、`/etc/default/grub`、`/etc/grub.d/*`、`/boot/grub/custom.cfg` | 加 `init=/bin/sh`、换内核、关掉审计参数 | 中（内容是脚本） | 高 |
| GRUB 环境块 | `grubenv`（`save_env`/`load_env`） | 跨重启持久化引导变量 | 中 | 中 |
| initramfs | `dracut` hooks、`/etc/cmdline.d` | 在 Agent 之前执行任意 shell | 高（要解包镜像） | 中 |
| 内核替换 | `kexec_file_load` | 换掉整个内核，伪造 `/proc`、`uname` | 中（sysfs 有痕迹） | 低 |
| 内核加固 | `lockdown` LSM | 关掉就能 kexec 未签名内核 | 低 | 低 |

这张表是整篇文章的骨架：**越靠近固件的层，攻击收益越大、采集越难、误报越低；越靠近用户的层，越好采、越容易误报。** 你不可能用一套规则同时覆盖它们。

## 高频面试题

### Q1：讲一次 Linux 启动，从固件到 systemd，哪些环节是"root 能改但 Agent 看不见"的？

**简洁答案**

至少五个环节：GRUB 配置（`grub.cfg` 与它的输入源）、GRUB 环境块、initramfs 里的 hook、EFI 变量里的启动项、以及通过 `kexec` 预置的内核镜像。它们的共同点是**修改发生在 Agent 启动之前**，所以你只能靠"事后快照 + 基线差分"发现，不能靠"实时监控"发现。

**关键知识点**

- `grub.cfg` 不是配置文件，是**脚本**。GNU GRUB 手册里写得很直白："The configuration file is now written in something closer to a full scripting language: variables, conditionals, and loops are available." 顶层语句会被 GRUB 执行，不只是被读取。
- `grub.cfg` 通常由 `grub-mkconfig` 生成（`grub-mkconfig -o /boot/grub/grub.cfg`），它读 `/etc/default/grub`（由 shell source，所以必须是合法 POSIX shell）和 `/etc/grub.d/` 下的脚本。
- initramfs 里的 `dracut` hook 是 **source 执行的 POSIX shell**，dracut 手册特别提醒："Since hook scripts are sourced instead of directly executed, 'return' must be used instead of 'exit'"。
- EFI 变量在 `/sys/firmware/efi/efivars` 下，是**文件**，root 可以写。

**Go 落地思路**

不要试图"监控写入"这五个面——`/boot` 上的写会经过 grub-mkconfig 重新生成，initramfs 更是离线构建的。正确做法是**定期快照 + 与基线/变更工单对齐**：

1. 每次采集把每个面的内容归一化成结构体（路径集合、命令集合、变量集合）；
2. 与上次快照、与"发布基线"做差分；
3. 差分结果**不要直接定性为攻击**，先挂到"变更事件"上（谁、什么时候、走的什么发布流程）。

```text
采集面 → 归一化 → 差分 → 归因（发布流程/运维工单/无来源） → 定性
```

### Q2：Secure Boot 开着了，为什么还能被劫持？shim 到底做了什么？

**简洁答案**

因为 Secure Boot 只保证"**固件加载镜像时**校验签名"，它不保证：GRUB 读到的 `grub.cfg` 是可信的、initramfs 是可信的、内核是被合法加载的。这三样都不在签名链的覆盖范围内。shim 做的是第一阶段加载与校验，它能挡住"换掉 GRUB 二进制"，挡不住"用 root 改配置"。

**关键知识点**

shim 自称 "a first-stage UEFI bootloader"，行为是：

- 先按标准 UEFI 路径尝试 `LoadImage()` / `StartImage()` 加载第二阶段；
- 如果失败（典型就是 Secure Boot 开着而目标没被信任地签名），shim 退回到用**内置厂商证书**校验目标；
- 校验通过且目标不在**拒绝列表**（denylist）里，就加载并执行它。shim 的 README 明确说它"is not checked against allowlists (DB/MOK hashes/signatures)"——它默认信任自己的厂商证书链，不去查 DB/MOK 的哈希与签名。
- 通过 **shim lock protocol**，shim 允许第二阶段（GRUB）自己做同级别的校验；通过 **loader protocol**，shim 还能接管 `LoadImage`/`StartImage`，让 UKI（Unified Kernel Image）这种嵌套镜像也能被加载。
- 有 TPM 时，shim 会把加载目标 extend 进 PCR。

所以 Secure Boot 的真实语义是：**"被加载的引导器二进制可信"**，而不是"引导过程可信"。一个拿到 root 但没有拿到 Secure Boot 私钥的攻击者，完全可以：

- 改 `grub.cfg`，加一个 `init=/bin/sh` 的菜单项 → 下次进救援 shell；
- 换掉 initramfs → 在 Agent 之前执行任意代码；
- 直接 `kexec_file_load` 一个自己的内核 → 绕过整条链（见 Q6）。

**Go 落地思路**

Secure Boot 状态本身是一个**一等检测信号**，因为它经常在客户"装驱动 / 装自研内核 / 加 MOK"时被改掉：

- 读 efivarfs 里的 `SecureBoot` 变量（1 字节，第 0 位为 1 表示开启）；
- 采集时间点选在**每次启动后早期**（Agent 起来后第一件事），并把状态变化当作一条独立事件上报；
- 状态从 1 变 0 时结论不是"必然被攻击"，而是"需要关联变更工单"。

### Q3：`grub.cfg` 为什么是脚本？攻击者改它具体能拿到什么？

**简洁答案**

因为 GRUB 会执行 `grub.cfg` 的顶层语句。攻击者能拿到的直接收益有三个：加载另一个内核（完全控制用户态）、加异常启动参数（`init=/bin/sh`、`rd.break`、`systemd.unit=rescue.target`）、以及改 `set root=` 让 GRUB 从别的设备/分区找内核。

**关键知识点**

- `grub.cfg` 里三种关键字要分清：
  - `menuentry '标题' --class xxx { ... }` 块，里面用 `linux`/`linux16` 指定内核、`initrd`/`initrd16` 指定 initramfs；
  - 顶层的 `set root=...`、`search --fs-uuid ...`；
  - 顶层的 `load_env` / `save_env`（GRUB 环境块，见 Q4）。
- `linux16`/`initrd16` 是老式 BIOS 引导路径。现代 UEFI 机器上出现 `linux16` 本身就值得看一眼——要么是遗留配置，要么是有人在绕过 UEFI 路径。
- 内核路径落在 `/tmp`、`/var/tmp`、`/dev/shm`、`/run`、`/home`、`/root`、`/mnt`、`/media` 这些目录，是一个强信号：**这些位置在引导阶段几乎不可能是合法内核来源**。
- `init=/bin/sh` 和 `rd.break` 的效果不一样：前者让 systemd 用 `/bin/sh` 当 init（单用户 shell），后者让 initramfs 停在 pre-pivot 前的调试 shell。两者都意味着"绕过正常启动流程拿到 root"。

**Go 落地思路**

把 `grub.cfg` 解析成一个**结构化快照**，而不是一坨文本：

```text
type GrubMenuEntry struct {
    Title  string   // 菜单项标题
    Kernel string   // 内核路径
    Initrd string   // initramfs 路径
    Args   string   // 传给内核的参数
    Legacy bool     // 是否用了 linux16/initrd16 老式引导路径
}
```

然后针对每个菜单项做三类判定：路径是否可疑、启动参数是否可疑、是否走了 legacy 路径。判定逻辑要写成**纯函数**（输入是文本，输出是 findings），这样才能写单测，也才能在"基线里已有这个配置"的情况下把告警降级。

> 注意：GRUB 配置里出现 `menuentry` 的标题、UUID、顺序都可能随内核升级变化，**不要拿"文本哈希"做基线**，要拿"归一化后的语义集合"做基线。

### Q4：`/etc/default/grub`、`/etc/grub.d/40_custom`、`/boot/grub/custom.cfg`、`grubenv` 四个落点分别怎么被利用？

**简洁答案**

前三个都是 GRUB 配置的**输入源**，攻击者改它们之后，一次 `grub-mkconfig`（或者等下一次内核升级）就会把恶意内容"洗"进 `grub.cfg`——这是最难查的一种，因为 `grub.cfg` 看起来完全正常。第四个 `grubenv` 是**跨重启持久化**的引导变量区，GRUB 手册说它提供"A small amount of persistent storage is available across reboots, using the `save_env` and `load_env` commands in GRUB and the `grub-editenv` utility"。

**关键知识点**

- `/etc/default/grub` 是 shell 脚本，被 `grub-mkconfig` source，里面的 `GRUB_CMDLINE_LINUX`、`GRUB_CMDLINE_LINUX_DEFAULT` 会直接拼进生成的 `grub.cfg`。
- `/etc/grub.d/` 下是编号脚本，`40_custom` 是发行版留给"追加自定义 menuentry"的口子；GRUB 手册明确写了"adding extra custom menu entries to the end of the list can be done by editing `/etc/grub.d/40_custom` or creating `/boot/grub/custom.cfg`"。
- `/boot/grub/custom.cfg` 的存在意义就是**不需要碰 `grub.cfg` 就能加内容**，因为发行版生成的 `grub.cfg` 会去 source 它。
- `grubenv`（Debian 系 `/boot/grub/grubenv`，RHEL 系 `/boot/grub2/grubenv`）是固定大小的一块持久化存储，通过 `grub-editenv` 读写。攻击者可以在里面放 `recordfail`、`saved_entry` 之类的自定义变量；配合 `grub.cfg` 里被插入的 `load_env` 段，形成"环境块里放参数、grub.cfg 里读出来执行"的组合。

**Go 落地思路**

检测面要**顺着生成链往上游追**，而不是只盯 `grub.cfg`：

| 监控对象 | 采集方式 | 判定 |
| --- | --- | --- |
| `/etc/default/grub` | 解析 `GRUB_CMDLINE*` 键值 | 参数集合与基线差分 |
| `/etc/grub.d/*` | 收集每个脚本的归一化摘要 | 新增/内容变化 |
| `/boot/grub/custom.cfg` | 存在性 + 内容 | **存在即高危**（生产机不该有） |
| `grubenv` | `grub-editenv` 读取或直接读文件 | 变量集合差分 |
| `grub.cfg` | 解析成菜单项集合 | 与"上游推导出的期望值"比对 |

一个很实用的技巧：**从 `grub.cfg` 反推期望值**。给定 `/etc/default/grub` 和 `/etc/grub.d/`，理论上能推导出 `grub.cfg` 里应该有什么；如果 `grub.cfg` 里出现了推导不出来的内容，说明它是**绕过生成链被直接改过**的。这是区分"运维改了配置"和"有人手改 grub.cfg"的关键手段。

### Q5：initramfs 在 Agent 之前运行，攻击者能在里面放什么？dracut 的 hook 是怎么被执行的？

**简洁答案**

能放任意 shell 脚本，而且执行时机早于你的 Agent、晚于内核。dracut 的 hook 机制就是最常见的落点：hook 是**被 source 的 POSIX shell**，跑在 initramfs 的 init 上下文里。

**关键知识点**

dracut 的 hook 目录与优先级（来自 `dracut.modules(7)` 与 `dracut-lib.sh`）：

| 目录 | 定位 | 优先级 |
| --- | --- | --- |
| `/var/lib/dracut/hooks/<stage>/` | 运行时由 dracut 模块生成/删除 | 最高 |
| `/etc/dracut/hooks/<stage>/` | 本地覆盖（管理员改这里） | 中 |
| `/usr/lib/dracut/hooks/<stage>/` | 发行版自带 | 最低 |

`dracut-lib.sh` 的 `list_hooks()` 把这三个目录按上述顺序拼接，并且注释写得很清楚：**同名 hook 只执行优先级最高的那一份**（"If a hook with the same name exists in multiple locations simultaneously, the most privileged location ... wins and only one instance of the hook is executed"）。

常用阶段：`cmdline`、`pre-udev`、`pre-trigger`、`initqueue`、`pre-mount`、`pre-pivot`、`cleanup`、`mount`。时序上要注意区分：`pre-udev` 在 udev 启动之前（此时真实 root 通常还没挂上），`pre-mount` 在执行挂载动作之前，而 `pre-pivot` 在 `pivot_root` 切换到真实根**之前**（root 已经挂上，但还不是 `/`）。这几个阶段都落在"Agent 还没起来、但系统已经基本可控"的窗口里。

`dracut.sh` 里导出的 `hookdirs` 就是阶段清单，另外还有 `initqueue/settled`、`initqueue/online`、`initqueue/finished`、`initqueue/timeout` 这些子阶段。

**Go 落地思路**

Hook 目录是可以直接枚举的——你不需要解包 initramfs 镜像，镜像里装的就是这些目录的内容。所以检测分两层：

1. **宿主侧**：枚举 `/usr/lib/dracut/hooks`、`/etc/dracut/hooks`、`/var/lib/dracut/hooks` 各阶段下的 `*.sh`，记录"阶段 + 文件名 + 路径 + 是否被同名高优先级脚本覆盖"；
2. **镜像侧**（可选、更强）：用 `lsinitrd`/解包 cpio 校验 initramfs 内部 hook 集合与宿主侧是否一致——两者不一致，说明 initramfs 是被**单独替换**过的（这比"配置被改"严重得多）。

第 1 层的实现很朴素，但有一个必须做对的地方：**同名覆盖关系**。只看"有哪些文件"会误报（发行版自带 + 本地覆盖是合法的）；必须按 dracut 的优先级把"实际会被执行的那一份"算出来。

```text
# hook 脚本的根目录，顺序即优先级：同名脚本只有优先级最高的那一份会被执行
/var/lib/dracut/hooks     # 最高：运行时由 dracut 模块生成/删除
/etc/dracut/hooks         # 中：本地覆盖
/usr/lib/dracut/hooks     # 最低：发行版自带
```

```go
package bootchain

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// DracutHookStages 是 dracut 支持的 hook 阶段。
var DracutHookStages = []string{
	"cmdline", "pre-udev", "pre-trigger", "netroot",
	"initqueue", "initqueue/settled", "initqueue/online", "initqueue/finished", "initqueue/timeout",
	"pre-mount", "pre-pivot", "cleanup", "mount",
	"emergency", "shutdown-emergency", "pre-shutdown", "shutdown",
}

// DracutHookRoots 是 hook 脚本的根目录，顺序即优先级：
// 同名脚本只有优先级最高的那一份会被执行。
var DracutHookRoots = []string{
	"/var/lib/dracut/hooks",
	"/etc/dracut/hooks",
	"/usr/lib/dracut/hooks",
}

// DracutHook 是 initramfs 里一个 hook 脚本。
type DracutHook struct {
	Stage      string
	Root       string
	File       string
	Path       string
	Shadowed   bool
	ShadowedBy string
}

// ScanDracutHooks 枚举各阶段的 hook 脚本，并标记被高优先级同名脚本覆盖的条目。
func ScanDracutHooks(roots, stages []string) ([]DracutHook, error) {
	var hooks []DracutHook
	for _, stage := range stages {
		for _, root := range roots {
			dir := filepath.Join(root, stage)
			entries, err := os.ReadDir(dir)
			if err != nil {
				if os.IsNotExist(err) {
					continue
				}
				return nil, err
			}
			for _, entry := range entries {
				if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sh") {
					continue
				}
				hooks = append(hooks, DracutHook{
					Stage: stage,
					Root:  root,
					File:  entry.Name(),
					Path:  filepath.Join(dir, entry.Name()),
				})
			}
		}
	}
	for i := range hooks {
		for j := range hooks {
			if i == j || hooks[i].Stage != hooks[j].Stage || hooks[i].File != hooks[j].File {
				continue
			}
			if rootRank(roots, hooks[j].Root) < rootRank(roots, hooks[i].Root) {
				hooks[i].Shadowed = true
				hooks[i].ShadowedBy = hooks[j].Path
			}
		}
	}
	sort.Slice(hooks, func(i, j int) bool {
		if hooks[i].Stage != hooks[j].Stage {
			return hooks[i].Stage < hooks[j].Stage
		}
		return hooks[i].Path < hooks[j].Path
	})
	return hooks, nil
}

func rootRank(roots []string, root string) int {
	for i, r := range roots {
		if r == root {
			return i
		}
	}
	return len(roots)
}
```

### Q6：kexec 是什么？内核提供哪几个系统调用？glibc 为什么没有封装？

**简洁答案**

`kexec` 让**正在运行的内核**把另一个内核镜像读进内存，之后直接跳过去执行，绕过 BIOS/UEFI 的硬件初始化。内核提供两个系统调用：`kexec_load(2)`（自己描述内存段）和 `kexec_file_load(2)`（直接给内核文件与 initramfs 文件描述符）。glibc **没有封装**，必须自己用 `syscall(2)` 发。

**关键知识点**

- `kexec_load(2)`：参数是 `entry`（物理入口地址）、`nr_segments`（最多 `KEXEC_SEGMENT_MAX` = 16）、`segments` 数组（用户态缓冲区 → 物理地址）、`flags`。
- `kexec_file_load(2)`：参数是 `kernel_fd`、`initrd_fd`、`cmdline`/`cmdline_len`、`flags`。`cmdline` 的**最后一个字节必须是 `'\0'`**，否则 `EINVAL`。flag 有 `KEXEC_FILE_UNLOAD`、`KEXEC_FILE_ON_CRASH`、`KEXEC_FILE_NO_INITRAMFS`。
- `KEXEC_ON_CRASH`（`kexec_load`）用于崩溃内核：镜像被加载到启动时通过 `crashkernel=` 预留的内存区域，这块区域在 `/proc/iomem` 里标记为 "Crash kernel"。
- 关键一点：`kexec_file_load()` 这个调用**当初就是为了"只允许加载已签名的内核"而引入的**（"The kexec_file_load() system call was added to provide support for systems where 'kexec' loading should be restricted to only kernels that are signed"）——但它**只在内核启用了签名校验机制时才起作用**，默认情况下并不会拦你。
- 用户态工具是 `kexec(8)`（kexec-tools 包）：`kexec -l <kernel> --append=... --initrd=...` 加载，`kexec -e` 立即切换，`kexec -u` 卸载。发行版的关机流程如果支持 kexec reboot，会在 `shutdown` 脚本里先 `kexec -e`。
- glibc 没有 wrapper：`kexec_load(2)` 手册里明确写了 "Note: glibc provides no wrappers for these system calls, necessitating the use of `syscall(2)`"。Go 里同理，`golang.org/x/sys/unix` 也没有现成封装，需要自己 `unix.Syscall` 并自己定义结构体。

**Go 落地思路**

两件事：

1. **采集面**：用 eBPF 的 `syscall` tracepoint 或 `kprobe` 挂 `kexec_file_load` / `do_kexec_load`，把"谁在什么时刻加载了哪个文件"变成一条实时事件。这是唯一能抓到"**加载动作**"的通道，sysfs 快照只能看到"结果"。
2. **解析面**：Go 侧要自己声明 `kexec_segment` 结构体，调用时注意 `nr_segments` 不超过 16、目标物理地址与长度都要页对齐、`bufsz <= memsz`。这些约束在 man page 里都写着，写错了就是 `EINVAL`。

```text
kexec_segment {
    void   *buf;    // 用户态源地址
    size_t  bufsz;  // 源长度
    void   *mem;    // 目标物理地址（页对齐）
    size_t  memsz;  // 目标物理长度（页对齐，且 bufsz <= memsz）
}
```

### Q7：怎么发现"当前系统已经 preload 了一个内核"？为什么 Agent 自己看不到这件事？

**简洁答案**

看 sysfs：`/sys/kernel/kexec_loaded` 为 1 表示**已有一个内核镜像被加载进内存**，下次 reboot（或崩溃时）会被执行；`/sys/kernel/kexec_crash_loaded` 表示是否加载了崩溃内核；`/sys/kernel/kexec_crash_size` 是崩溃内核保留内存大小。Agent 看不到"加载这个动作"，因为动作发生在过去——但**状态是留痕的**。

**关键知识点**

内核在 `kernel/kexec_core.c` 里注册了这组 sysfs 属性：

| 路径 | 含义 |
| --- | --- |
| `/sys/kernel/kexec_loaded` | `!!kexec_image`，非 0 表示已加载待启动的内核 |
| `/sys/kernel/kexec_crash_loaded` | `kexec_crash_loaded()`，崩溃内核是否已加载（需要 `CONFIG_CRASH_DUMP`） |
| `/sys/kernel/kexec_crash_size` | 崩溃内核保留内存大小（字节），可写（可调小） |
| `/sys/kernel/kexec_crash_cma_ranges` | 崩溃内核的 CMA 区间（需要 `CONFIG_CRASH_RESERVE`） |

`kexec_loaded` 只反映**当前内存里的状态**：`kexec -e` 执行完（真的切过去了）或者机器重启之后，这个标志会被清零（因为已经是新内核了）。所以它的语义是"**下一次重启会被劫持**"，而不是"曾经被劫持过"。

这就是这类检测最难受的地方：**证据会随重启消失**。一个干净的、刚重启完的机器，`kexec_loaded` 一定是 0。所以：

- 必须在**每次启动早期**采集一次并上报；
- 配合"重启时间异常 / 重启后 inode 时间戳倒挂"等旁证做关联；
- 结论只能是"**当前状态**"，不能是"历史结论"。

至于"为什么 Agent 看不到加载动作"——因为 `kexec_file_load` 是**一次性动作**，没有对应的持久化事件。唯一能抓到它的方式是实时挂钩（eBPF tracepoint / kprobe），而这又回到了 Q11 的自举问题。

**Go 落地思路**

Go 侧实现非常直接，但有三个坑：

1. `kexec_crash_loaded` / `kexec_crash_size` 在没开 `CONFIG_CRASH_DUMP` 的内核上**不存在**，必须容忍 `os.IsNotExist`；
2. `lockdown` 文件在 `/sys/kernel/security/lockdown`，**不在** `/sys/kernel/` 根下，且没启用 `CONFIG_SECURITY_LOCKDOWN_LSM` 时整个 `security` 目录可能都不存在；
3. `lockdown` 文件的内容是"当前级别用方括号括起来"，例如 `[none] integrity confidentiality`。如果文本里出现了多个级别却没有方括号，说明格式不是预期的，**必须返回 unknown 而不是猜一个**——这正是三态结论的价值观。

```go
package bootchain

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// BootKernelState 描述"当前内核之外"的引导相关状态。
type BootKernelState struct {
	KexecLoaded         bool
	KexecCrashLoaded    bool
	KexecCrashSizeBytes int64
	Lockdown            string // none / integrity / confidentiality / unknown
	LockdownRaw         string
}

// ReadBootKernelState 从 sysfs 读取 kexec 与 lockdown 状态。
func ReadBootKernelState(sysKernelRoot string) (BootKernelState, error) {
	state := BootKernelState{Lockdown: "unknown"}

	loaded, err := readIntFile(filepath.Join(sysKernelRoot, "kexec_loaded"))
	if err != nil {
		return state, err
	}
	state.KexecLoaded = loaded != 0

	crash, err := readIntFile(filepath.Join(sysKernelRoot, "kexec_crash_loaded"))
	if err != nil && !os.IsNotExist(err) {
		return state, err
	}
	state.KexecCrashLoaded = crash != 0

	size, err := readIntFile(filepath.Join(sysKernelRoot, "kexec_crash_size"))
	if err != nil && !os.IsNotExist(err) {
		return state, err
	}
	state.KexecCrashSizeBytes = size

	raw, err := os.ReadFile(filepath.Join(sysKernelRoot, "security", "lockdown"))
	if err != nil {
		if os.IsNotExist(err) {
			return state, nil
		}
		return state, err
	}
	state.LockdownRaw = strings.TrimSpace(string(raw))
	state.Lockdown = ParseLockdownState(state.LockdownRaw)
	return state, nil
}

// ParseLockdownState 从 lockdown 文件内容里解析当前生效的级别。
// 内核把当前级别用方括号括起来，例如 "[none] integrity confidentiality"。
func ParseLockdownState(text string) string {
	for _, field := range strings.Fields(text) {
		if strings.HasPrefix(field, "[") && strings.HasSuffix(field, "]") {
			return strings.Trim(field, "[]")
		}
	}
	var matched string
	for _, level := range []string{"none", "integrity", "confidentiality"} {
		if !strings.Contains(text, level) {
			continue
		}
		if matched != "" {
			// 没有方括号、又同时出现多个级别时无法判定是哪一级
			return "unknown"
		}
		matched = level
	}
	if matched == "" {
		return "unknown"
	}
	return matched
}

func readIntFile(path string) (int64, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return 0, err
	}
	return strconv.ParseInt(strings.TrimSpace(string(raw)), 10, 64)
}
```

### Q8：Kernel Lockdown 是什么？它挡住什么、为什么挡不住 root？

**简洁答案**

Lockdown 是内核的一个 LSM，用来**限制对运行中内核镜像的直接访问**，防止 root 通过 `/dev/mem`、`/dev/kcore`、BPF、kprobes、debugfs 之类的口子读改内核内存。它在 5.4 引入，级别分 `none` / `integrity` / `confidentiality`。

**关键知识点**

- 开启方式：内核参数 `lockdown=integrity` 或 `lockdown=confidentiality`；或者编译期 `CONFIG_LOCK_DOWN_KERNEL_FORCE_INTEGRITY`（更严格，直接锁死）。LSM 本身需要 `CONFIG_SECURITY_LOCKDOWN_LSM`，并要求 `lsm=` 或 `security=` 里包含 `lockdown`。
- 被禁掉/受限的能力（`kernel_lockdown(7)` 原文列举）：
  - 直接访问内核镜像的设备：`/dev/mem`、`/dev/kmem`、`/dev/kcore`、`/dev/ioports`、`BPF`、`kprobes`；
  - 直接配置/控制硬件：模块参数直写硬件参数、直接 PCI BAR 访问、`ioperm`/`iopl` 指令、`KD*IO` 控制台 ioctl、`TIOCSSERIAL`、写 MSR、替换 PCMCIA CIS、覆盖 ACPI 表、ACPI 错误注入、指定 ACPI RDSP 地址、使用 ACPI custom method；
  - 受限的能力：**只允许加载签名模块**（除非被 IMA appraisal 背书）、**只允许 kexec 签名过的二进制**、禁止未加密的休眠/挂起（避免内核镜像落到可被读取的介质上）、**禁止使用 debugfs**。
- 内核在被限制时会打印：`Lockdown: X: Y is restricted, see man kernel_lockdown.7`，X 是进程名。
- 与 kexec 的关系在 `kernel/kexec.c` 里写得很直白：`kexec` 可以绕过模块加载限制，所以要额外检查 `security_locked_down(LOCKDOWN_KEXEC)`。

**关键判断：lockdown 挡不住"改配置文件"**

lockdown 保护的是**运行中内核的内存**。它不管：

- `grub.cfg` 里加 `init=/bin/sh`；
- initramfs 里塞 hook；
- EFI 变量里塞启动项。

这些都不需要碰内核内存。所以**"Secure Boot 开着 + lockdown 开着"并不等于引导链安全**，它只保证"没人能在内存里替换内核"。

**Go 落地思路**

把 lockdown 级别当成引导链健康度的一个**维度**，而不是一个独立的告警项：

| lockdown | 引导链结论该怎么给 |
| --- | --- |
| `confidentiality` | 最严格，可以声称"未签名的 kexec 内核不可行" |
| `integrity` | 同样禁止未签名 kexec（`kernel_lockdown(7)` 明写），但仍要确认是否有已签名但被授权的内核被 preload |
| `none` | **不能声称 kexec 面安全**；`kexec_loaded == 1` 必须升级为高危 |
| `unknown` | lockdown 未启用或读不到，结论降级为 unknown，**不能当成 none** |

### Q9：UEFI 变量里怎么藏启动项？efivarfs 的文件格式到底是什么？（最容易答错的一题）

**简洁答案**

启动项藏在 `Boot####` 变量里，启动顺序在 `BootOrder` 里（`Boot####` 是 16 进制编号），下次启动强制走某项用 `BootNext`。这些变量在 Linux 上以文件形式暴露在 `/sys/firmware/efi/efivars/` 下：**文件名是 `变量名-GUID`，文件内容是 4 字节属性（小端）+ 变量载荷**。

**关键知识点**

- 文件名格式，内核里 `efivarfs_valid_name()` 的注释写得很清楚：

  ```text
  VariableName-12345678-1234-1234-1234-1234567891bc
  ```

  GUID 在文件名里，**不在文件内容里**。GUID 必须是合法 UUID，且前面必须有一个 `-`。

- 文件内容格式，内核文档 `efivarfs` 明确警告："the first 4 bytes of the output represent the UEFI variable attributes, in little-endian format"，实际内容是：

  ```text
  4_bytes_of_attributes + efivar_data
  ```

- 非标准变量被创建为 **immutable 文件**（`S_IMMUTABLE`），这是为了防止某些固件 bug：删除非标准变量会导致固件 POST 失败。需要 `chattr -i` 才能删。
- `efivarfs` 通常这样挂载：`mount -t efivarfs none /sys/firmware/efi/efivars`。现代内核还支持 `nostatfs` 挂载选项（避免 `statfs` 触发 `QueryVariableInfo()` 把所有 CPU 卡几毫秒）。
- `Boot####` 变量的载荷是 `EFI_LOAD_OPTION` 结构：

  | 字段 | 长度 | 说明 |
  | --- | --- | --- |
  | `Attributes` | 4 字节 | UINT32 |
  | `FilePathListLength` | 2 字节 | 后面设备路径的字节长度 |
  | `Description` | 可变 | UTF-16LE、**以 `\0\0` 结尾**的描述字符串（就是菜单里显示的名字） |
  | `DevicePath` | 可变 | EFI 设备路径 |

- 设备路径本身是一串节点，每个节点的头是 `Type(1) + SubType(1) + Length(2)`。**FILEPATH 节点（Type=4, SubType=4）的载荷是 UTF-16 字符串**，路径用**反斜杠**分隔，比如 `\EFI\ubuntu\shimx64.efi`。
- `efibootmgr(8)` 是官方工具（`-c` 创建启动项、`-b XXXX` 操作 `BootXXXX`、`-o` 设置 `BootOrder`、`-n` 设置 `BootNext`）。

**Go 落地思路**

Go 侧要做三件事：**认名字、解载荷、判可疑**。

判定"可疑启动项"的规则要注意路径分隔符：EFI 路径是 `\EFI\...` 风格，直接拿 POSIX 前缀（`/dev/shm/`）去匹配会漏。正确做法是先把反斜杠归一化成正斜杠再判定。

```go
package bootchain

// Status 是引导链健康度的三态结论：正常、被篡改、无法判定。
type Status string

const (
	StatusHealthy  Status = "healthy"
	StatusTampered Status = "tampered"
	StatusUnknown  Status = "unknown"
)

// Severity 是单条发现的严重级别。
type Severity string

const (
	SeverityInfo   Severity = "info"
	SeverityMedium Severity = "medium"
	SeverityHigh   Severity = "high"
)

// Finding 是一条引导链异常发现。Signal 用于聚合与告警去重。
type Finding struct {
	Severity Severity
	Signal   string
	Detail   string
}
```

```go
package bootchain

import (
	"encoding/binary"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"unicode/utf16"
)

// EFIVariable 是 /sys/firmware/efi/efivars 下一个 UEFI 变量的解析结果。
// 文件名形如 Boot0000-<GUID>，文件内容是 4 字节属性（小端）+ 变量载荷。
type EFIVariable struct {
	Name       string
	GUID       string
	Attributes uint32
	Data       []byte
}

// efiNameRe 匹配 "VariableName-<GUID>" 形式的 efivarfs 文件名。
var efiNameRe = regexp.MustCompile(`^(.+)-([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$`)

// ParseEFIVariable 解析单个 efivarfs 文件的原始字节。
func ParseEFIVariable(path string, raw []byte) (EFIVariable, error) {
	base := filepath.Base(path)
	m := efiNameRe.FindStringSubmatch(base)
	if m == nil {
		return EFIVariable{}, fmt.Errorf("efivarfs 文件名不合法: %s", base)
	}
	if len(raw) < 4 {
		return EFIVariable{}, fmt.Errorf("efivarfs 文件内容过短: %s", base)
	}
	return EFIVariable{
		Name:       m[1],
		GUID:       strings.ToLower(m[2]),
		Attributes: binary.LittleEndian.Uint32(raw[:4]),
		Data:       raw[4:],
	}, nil
}

// FindEFIVariable 在 efivarfs 目录中查找指定名字的所有变量。
func FindEFIVariable(dir, name string) ([]EFIVariable, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var out []EFIVariable
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		base := entry.Name()
		m := efiNameRe.FindStringSubmatch(base)
		if m == nil || m[1] != name {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(dir, base))
		if err != nil {
			return nil, err
		}
		v, err := ParseEFIVariable(base, raw)
		if err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	return out, nil
}

// DevicePathNode 是 EFI_DEVICE_PATH_PROTOCOL 里的一个节点。
type DevicePathNode struct {
	Type    uint8
	SubType uint8
	Length  uint16
	Text    string // 仅 FILEPATH 节点有值
}

// ParseDevicePath 遍历设备路径节点。
func ParseDevicePath(b []byte) ([]DevicePathNode, error) {
	var nodes []DevicePathNode
	for len(b) > 0 {
		if len(b) < 4 {
			return nil, fmt.Errorf("设备路径节点头不完整")
		}
		length := binary.LittleEndian.Uint16(b[2:4])
		if length < 4 || int(length) > len(b) {
			return nil, fmt.Errorf("设备路径节点长度非法: %d", length)
		}
		node := DevicePathNode{
			Type:    b[0],
			SubType: b[1],
			Length:  length,
		}
		if node.Type == 4 && node.SubType == 4 { // FILEPATH 节点，载荷是 UTF-16 字符串
			text, err := decodeUTF16(b[4:length])
			if err != nil {
				return nil, err
			}
			node.Text = strings.TrimRight(text, "\x00")
		}
		nodes = append(nodes, node)
		b = b[length:]
	}
	return nodes, nil
}

// BootEntry 是 EFI_LOAD_OPTION 结构：属性 + 路径长度 + UTF-16 描述 + 设备路径。
type BootEntry struct {
	Attributes  uint32
	PathLength  uint16
	Description string
	DevicePath  []DevicePathNode
}

// ParseBootEntry 解析 Boot#### 变量载荷。
func ParseBootEntry(data []byte) (BootEntry, error) {
	if len(data) < 6 {
		return BootEntry{}, fmt.Errorf("启动项载荷过短")
	}
	entry := BootEntry{
		Attributes: binary.LittleEndian.Uint32(data[0:4]),
		PathLength: binary.LittleEndian.Uint16(data[4:6]),
	}
	desc := data[6:]
	end := -1
	for i := 0; i+1 < len(desc); i += 2 {
		if binary.LittleEndian.Uint16(desc[i:i+2]) == 0 {
			end = i
			break
		}
	}
	if end < 0 {
		return BootEntry{}, fmt.Errorf("启动项描述缺少终止符")
	}
	text, err := decodeUTF16(desc[:end])
	if err != nil {
		return BootEntry{}, err
	}
	entry.Description = text
	nodes, err := ParseDevicePath(desc[end+2:])
	if err != nil {
		return BootEntry{}, err
	}
	entry.DevicePath = nodes
	return entry, nil
}

// BootEntryPaths 取出启动项里的文件系统路径。
func BootEntryPaths(entry BootEntry) []string {
	var paths []string
	for _, node := range entry.DevicePath {
		if node.Text != "" {
			paths = append(paths, node.Text)
		}
	}
	return paths
}

func decodeUTF16(b []byte) (string, error) {
	if len(b)%2 != 0 {
		return "", fmt.Errorf("UTF-16 长度必须是偶数")
	}
	units := make([]uint16, 0, len(b)/2)
	for i := 0; i < len(b); i += 2 {
		units = append(units, binary.LittleEndian.Uint16(b[i:i+2]))
	}
	return string(utf16.Decode(units)), nil
}

// normalizeEFIPath 把 EFI 设备路径（反斜杠分隔）统一成 POSIX 形式，便于做路径判定。
func normalizeEFIPath(path string) string {
	return strings.ReplaceAll(path, "\\", "/")
}
```

这里有个很值得在面试里主动指出的坑：**很多人以为 efivarfs 文件是"32 字节 GUID + 4 字节属性 + 4 字节长度 + 数据"**——那是内存里 `EFI_VARIABLE` 结构（通过 `GetVariable` 拿到）的布局，**不是 efivarfs 文件的布局**。按错误格式去解析，会把所有变量都解析成乱码。

### Q10：Go 侧怎么把"引导链健康度"算出来？基线快照怎么建、怎么差分？

**简洁答案**

三步：**归一化 → 差分 → 三态定级**。归一化把每个采集面变成结构体；差分把当前快照与基线/上次快照对比；定级时把"高危发现"直接判成 tampered，把"采集不完整"判成 unknown，其余才是 healthy。

**关键知识点**

- 归一化的粒度决定误报率。`grub.cfg` 必须解析成"菜单项集合 + 每个菜单项的 kernel/initrd/args"，不能比文本哈希。
- 差分要区分两类变化：
  - **可解释的变化**：内核升级、grub-mkconfig 重新生成、发行版补丁、软件包带来的新 hook；
  - **不可解释的变化**：出现基线里没有的启动项、内核路径落到可写目录、hook 出现在 `pre-udev`/`pre-pivot` 这种早期阶段。
- 引入"**推导基线**"：从 `/etc/default/grub` + `/etc/grub.d/` 推导 `grub.cfg` 的期望内容，对不上的部分就是被直接改过的。这能区分"运维改了配置并重新生成"和"有人手改 grub.cfg"。

**Go 落地思路**

先定义公共类型（严重级别、三态结论、单条发现），再写各采集面的解析器，最后用一个统一的评估函数收口：

```go
package bootchain

import (
	"regexp"
	"strings"
)

var (
	grubMenuEntryRe = regexp.MustCompile(`^\s*menuentry\s+('([^']*)'|"([^"]*)")`)
	grubLinuxRe     = regexp.MustCompile(`^\s*(linux|linux16)\s+(\S+)\s*(.*)$`)
	grubInitrdRe    = regexp.MustCompile(`^\s*(initrd|initrd16)\s+(\S+)\s*(.*)$`)
	grubSetRootRe   = regexp.MustCompile(`^\s*set\s+root=(\S+)`)
	grubEnvRe       = regexp.MustCompile(`^\s*(load_env|save_env)\s+(\S+)`)
)

// GrubMenuEntry 是 grub.cfg 里的一个菜单项。
type GrubMenuEntry struct {
	Title  string
	Kernel string
	Initrd string
	Args   string
	Legacy bool // 使用了 linux16/initrd16 老式引导路径
}

// GrubConfig 是 grub.cfg 的结构化结果。
type GrubConfig struct {
	Entries []GrubMenuEntry
	Roots   []string
	Envs    []string
}

// suspiciousBootPath 判断引导文件路径是否落在不该出现的位置。
func suspiciousBootPath(path string) bool {
	for _, prefix := range []string{"/tmp/", "/var/tmp/", "/dev/shm/", "/run/", "/home/", "/root/", "/mnt/", "/media/"} {
		if strings.HasPrefix(path, prefix) {
			return true
		}
	}
	return false
}

// ParseGrubConfig 解析 grub.cfg 文本，并返回可疑发现。
func ParseGrubConfig(content string) (GrubConfig, []Finding) {
	var cfg GrubConfig
	var findings []Finding
	var cur *GrubMenuEntry

	flush := func() {
		if cur != nil {
			cfg.Entries = append(cfg.Entries, *cur)
			cur = nil
		}
	}

	for _, raw := range strings.Split(content, "\n") {
		line := strings.TrimRight(raw, "\r")
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		if m := grubMenuEntryRe.FindStringSubmatch(line); m != nil {
			flush()
			title := m[2]
			if title == "" {
				title = m[3]
			}
			cur = &GrubMenuEntry{Title: title}
			continue
		}
		if m := grubSetRootRe.FindStringSubmatch(line); m != nil {
			cfg.Roots = append(cfg.Roots, m[1])
			continue
		}
		if m := grubEnvRe.FindStringSubmatch(line); m != nil {
			cfg.Envs = append(cfg.Envs, m[1]+" "+m[2])
			continue
		}
		if cur == nil {
			continue
		}
		if m := grubLinuxRe.FindStringSubmatch(line); m != nil {
			cur.Kernel = m[2]
			cur.Args = strings.TrimSpace(m[3])
			cur.Legacy = cur.Legacy || m[1] == "linux16"
			if suspiciousBootPath(m[2]) {
				findings = append(findings, Finding{
					Severity: SeverityHigh,
					Signal:   "grub.kernel_path",
					Detail:   "菜单项 " + cur.Title + " 的内核路径异常: " + m[2],
				})
			}
			for _, arg := range strings.Fields(cur.Args) {
				switch arg {
				case "init=/bin/sh", "single", "rd.break", "systemd.unit=rescue.target":
					findings = append(findings, Finding{
						Severity: SeverityHigh,
						Signal:   "grub.boot_arg",
						Detail:   "菜单项 " + cur.Title + " 包含异常启动参数: " + arg,
					})
				}
			}
			continue
		}
		if m := grubInitrdRe.FindStringSubmatch(line); m != nil {
			cur.Initrd = m[2]
			cur.Legacy = cur.Legacy || m[1] == "initrd16"
			if suspiciousBootPath(m[2]) {
				findings = append(findings, Finding{
					Severity: SeverityHigh,
					Signal:   "grub.initrd_path",
					Detail:   "菜单项 " + cur.Title + " 的 initrd 路径异常: " + m[2],
				})
			}
		}
	}
	flush()
	return cfg, findings
}
```

```go
package bootchain

import (
	"encoding/binary"
	"fmt"
	"strconv"
	"strings"
)

// BootChainSnapshot 是各采集面汇总出来的引导链快照。
type BootChainSnapshot struct {
	GrubFindings    []Finding
	HookFindings    []Finding
	EFIFindings     []Finding
	KernelState     BootKernelState
	SecureBootOn    bool
	SecureBootKnown bool
	GrubReadable    bool
	EFIAvailable    bool
}

// AssessEFIVariables 从 UEFI 变量里找可疑点。
func AssessEFIVariables(vars []EFIVariable) []Finding {
	var findings []Finding
	var bootOrder []uint16
	entries := map[uint16]EFIVariable{}

	for _, v := range vars {
		switch {
		case v.Name == "SecureBoot":
			if len(v.Data) >= 1 {
				findings = append(findings, secureBootFinding(v.Data[0]&0x01 == 1))
			}
		case v.Name == "BootOrder":
			bootOrder = parseUint16s(v.Data)
		case v.Name == "BootNext":
			findings = append(findings, Finding{
				Severity: SeverityMedium,
				Signal:   "efi.boot_next",
				Detail:   "存在 BootNext 变量，下次启动会优先执行该启动项",
			})
		case strings.HasPrefix(v.Name, "Boot") && len(v.Name) == 8:
			if num, err := strconv.ParseUint(v.Name[4:], 16, 16); err == nil {
				entries[uint16(num)] = v
			}
		}
	}

	for _, num := range bootOrder {
		v, ok := entries[num]
		if !ok {
			continue
		}
		entry, err := ParseBootEntry(v.Data)
		if err != nil {
			continue
		}
		for _, path := range BootEntryPaths(entry) {
			if suspiciousBootPath(normalizeEFIPath(path)) {
				findings = append(findings, Finding{
					Severity: SeverityHigh,
					Signal:   "efi.boot_entry_path",
					Detail:   fmt.Sprintf("启动项 %s 指向可写路径: %s", v.Name, path),
				})
			}
		}
	}
	return findings
}

func secureBootFinding(enabled bool) Finding {
	if enabled {
		return Finding{Severity: SeverityInfo, Signal: "efi.secure_boot_on", Detail: "UEFI Secure Boot 处于开启状态"}
	}
	return Finding{
		Severity: SeverityMedium,
		Signal:   "efi.secure_boot_off",
		Detail:   "SecureBoot 变量为 0，UEFI 不再强制校验签名",
	}
}

// AssessBootChain 汇总所有发现，给出三态结论。
func AssessBootChain(snap BootChainSnapshot) (Status, []Finding) {
	findings := make([]Finding, 0, len(snap.GrubFindings)+len(snap.HookFindings)+len(snap.EFIFindings))
	findings = append(findings, snap.GrubFindings...)
	findings = append(findings, snap.HookFindings...)
	findings = append(findings, snap.EFIFindings...)

	if snap.KernelState.KexecLoaded && snap.KernelState.Lockdown == "none" {
		findings = append(findings, Finding{
			Severity: SeverityHigh,
			Signal:   "kexec.loaded_without_lockdown",
			Detail:   "已 preload 内核镜像，且 lockdown 未生效，kexec 可绕过整条 bootloader 链",
		})
	}
	if snap.SecureBootKnown && !snap.SecureBootOn {
		findings = append(findings, Finding{
			Severity: SeverityMedium,
			Signal:   "efi.secure_boot_off",
			Detail:   "SecureBoot 变量为 0，UEFI 不再强制校验签名",
		})
	}

	for _, f := range findings {
		if f.Severity == SeverityHigh || f.Severity == SeverityMedium {
			return StatusTampered, findings
		}
	}
	if !snap.GrubReadable || !snap.EFIAvailable || snap.KernelState.Lockdown == "unknown" {
		return StatusUnknown, findings
	}
	return StatusHealthy, findings
}

func parseUint16s(data []byte) []uint16 {
	if len(data)%2 != 0 {
		return nil
	}
	out := make([]uint16, 0, len(data)/2)
	for i := 0; i < len(data); i += 2 {
		out = append(out, binary.LittleEndian.Uint16(data[i:i+2]))
	}
	return out
}
```

注意 `AssessBootChain` 里有两条**独立于具体采集面**的规则：

1. `kexec.loaded_without_lockdown`：`kexec_loaded == 1` 且 `lockdown == none` → 高危。因为在没有 lockdown 的机器上，未签名的替代内核随时可以在下次重启接管整台机器。
2. `efi.secure_boot_off`：Secure Boot 关闭 → 中危。它不等于被攻击，但它是"引导链整体防护下降"的证据。

### Q11：采集面怎么选？自举问题怎么破？

**简洁答案**

没有单一采集面能覆盖全链，**必须多通道交叉**。每个通道负责不同的"时间尺度"：实时通道（eBPF/audit）负责抓动作，周期扫描负责抓状态，跨重启上报负责抓"已经发生但被重启擦掉"的事。

**关键知识点**

| 通道 | 能看到什么 | 看不到什么 | 成本 |
| --- | --- | --- | --- |
| eBPF（`execve`/`syscalls` tracepoint、kprobe） | 谁在什么时候执行了什么、谁调了 `kexec_file_load` | 已经发生过的历史 | 高（内核态探针） |
| auditd（`execve` + watch 规则） | 进程执行与关键文件读写 | 内核内部动作 | 中 |
| fanotify / inotify | `/boot`、`/efi` 目录下的写事件 | 离线生成的 initramfs | 低 |
| 周期扫描（本文主线） | 当前所有状态 | 变更发生的时刻与操作者 | 低 |
| 跨重启状态上报 | 重启前后的状态差异 | 重启本身发生了什么 | 中（要解决持久化） |

**自举问题的本质**：Agent 是 initramfs 之后的普通用户态程序，所以它对 initramfs 阶段**天然没有观测能力**。三个可行的缓解手段：

1. **借助已有组件**：auditd、systemd journal 在 initramfs 阶段就可能留下痕迹（例如 dracut 是否写出 `rd.udev.log` 取决于其日志配置），可以尝试读；
2. **从磁盘倒推**：解包当前 initramfs，比对内部 hook 与宿主侧 `/etc/dracut/hooks` 的一致性——不一致本身就是结论；
3. **接受盲区并声明**：把"initramfs 内部"标记为**明确不可观测**，在结论里体现为"该维度未知"，而不是假装覆盖了。

第 3 点最容易做，也最重要。**检测能力的边界要写进产品文档，而不是留在工程师脑子里。**

### Q12：误报怎么治理？客户说"你们的 Agent 报引导链被篡改"，你怎么排查？

**简洁答案**

误报主要来自四类合法变化：内核升级（`vmlinuz`/`initrd`/`grub.cfg` 同时变）、`grub-mkconfig` 重新生成、发行版差异（`/boot/grub/grub.cfg` vs `/boot/grub2/grub.cfg`、Debian vs RHEL 的 dracut 目录结构不同）、以及客户自己在做合规整改（关 Secure Boot、加 MOK、装自研内核）。治理手段是**归一化 + 变更关联 + 分级**，而不是简单地"把规则关掉"。

**关键知识点**

- **基线要分层**：一台机器至少有三条基线——发行版出厂基线、当前运行内核基线、当前 hook 集合基线。跨基线比较只会制造噪声。
- **变更关联优先于规则本身**：`grub.cfg` 变了，但同时检测到 `/etc/default/grub` 变了且有对应的发布单 → 结论"已解释"；`grub.cfg` 变了但上游输入源没变 → 结论"直接篡改"。
- **客户排查路径（按顺序，每步都要留证据）**：

  ```text
  1. 拿到告警里的具体 diff：哪个面、哪条发现、哪个字段
  2. 对齐时间线：告警时间 vs 最近一次变更单/发布窗口/重启时间
  3. 看 diff 的"形状"：
       - 是配置语义变化（多一个 menuentry）→ 找操作者
       - 是路径落到可写目录 → 几乎必然是攻击
       - 是 Secure Boot 状态变化 → 找 MOK/自研内核流程
  4. 取证：grub.cfg 时间戳 + ctime + inode、shim/grub 二进制 hash、
     efivarfs 的 mtime、initramfs 的 hash、/var/log/audit、journal
  5. 交叉验证：至少两条独立通道（周期扫描 + auditd/eBPF）同时指向同一结论
  6. 结论分三态输出，把"无法判定"如实写出来
  ```

- **不要做的事**：不要把 `grub.cfg` 的哈希变化直接判成攻击；不要因为 Secure Boot 关闭就报"被入侵"；不要把"读不到 lockdown"当成"lockdown 没开"。

---

## Go 落地思路小结

| 采集面 | 归一化对象 | 判定规则 | 误报治理 | 结论权重 |
| --- | --- | --- | --- | --- |
| GRUB 配置 | 菜单项集合（title/kernel/initrd/args/legacy） | 路径落在可写目录、异常启动参数、`linux16`、与上游推导不一致 | 与 `/etc/default/grub`、`/etc/grub.d/` 的变更关联 | 高 |
| GRUB 其它落点 | `/etc/default/grub` 键值、`/etc/grub.d/*` 摘要、`custom.cfg` 存在性、`grubenv` 变量集 | `custom.cfg` 存在即高危；`grubenv` 变量集变化需归因 | 上游变更优先解释 | 高 |
| initramfs hook | (阶段, 文件名, 生效路径, 覆盖关系) | `pre-udev`/`pre-pivot` 阶段出现基线外脚本 | 软件包升级白名单 | 中 |
| EFI 变量 | `Boot####` 载荷、`BootOrder`、`BootNext`、`SecureBoot` | 启动项指向可写路径；`BootNext` 非预期；Secure Boot 由 1 变 0 | 客户 MOK / 自研内核流程 | 中高 |
| kexec | `kexec_loaded`、`kexec_crash_loaded`、`kexec_crash_size` | `kexec_loaded==1` 且 lockdown 无效 → 高危 | 发行版自动 kexec reboot 需白名单 | 高 |
| lockdown | lockdown 级别 | `none`/`unknown` 都必须体现在结论里 | 不适用 | 高（作为约束条件） |
| 引导二进制 | `shim*.efi`、`grub*.efi` 的 hash | 与发行版基线不符 | 客户自编译引导器流程 | 高 |

**几条贯穿全文的原则**

1. **状态优先于事件**：引导链上大部分篡改发生在过去，你拿不到事件，只能拿状态。状态检测必须有"跨重启"的语义（每次启动早期采一次 + 上报）。
2. **结论必须三态**：`healthy` / `tampered` / `unknown`。`unknown` 不是失败，是诚实——尤其是当采集面本身可能被攻击者屏蔽时。
3. **归一化优先于哈希**：对会随升级变化的文本做语义归一化，对二进制做哈希。
4. **可解释性优先于灵敏度**：一个能被变更单解释的高危告警，价值远高于一个无法解释的低危告警。
5. **盲区要写进产品**：initramfs 内部、固件内部、GRUB 环境块的具体语义，都是明确的能力边界。

---

## 小练习 / 复盘题

1. 按顺序说出一次 UEFI 启动里固件、shim、GRUB、内核各自的职责边界。哪一步是 Secure Boot 唯一真正校验的？
2. shim 在 Secure Boot 开启时是"用标准 `LoadImage`/`StartImage` 加载第二阶段"，失败后才退回自带证书校验。这个设计对攻击者意味着什么？
3. 为什么 `grub.cfg` 会被称为"脚本"而不是"配置"？举两个能利用脚本语义的例子。
4. `grub.cfg` 里出现 `linux16` 而不是 `linux`，在现代 UEFI 机器上说明了什么？
5. 攻击者给 `grub.cfg` 加一条 `menuentry`，内核参数写 `init=/bin/sh`。这个动作在重启前能被用户态 Agent 抓到吗？重启后用什么证据能反推它发生过？
6. `grub-mkconfig` 每次生成 `grub.cfg` 时都会带上新的 UUID 和菜单顺序。为什么不能拿 `grub.cfg` 的哈希做基线？
7. `/etc/default/grub` 是被什么方式读取的？为什么"它必须是合法 POSIX shell"这条限制有安全含义？
8. `/etc/grub.d/40_custom` 与 `/boot/grub/custom.cfg` 两个落点，攻击者用哪个更隐蔽？为什么？
9. `grubenv` 是什么？为什么它比 `grub.cfg` 更难被"读出来看"？攻击者怎么利用它？
10. dracut 的 hook 目录优先级是什么？同名 hook 在三个目录都存在时，实际执行几份？
11. dracut 的 hook 是被执行还是被 source？这两个语义差别会带来什么坑（提示：想想 `exit` 与 `return`）？
12. `pre-udev` 与 `pre-pivot` 两个阶段分别处在"root 已经挂载"之前还是之后？为什么它们对攻击者特别有价值？
13. 只枚举 `/etc/dracut/hooks` 能不能判断 hook 被篡改？为什么？
14. `kexec_load(2)` 与 `kexec_file_load(2)` 的参数形态有什么本质差别？各自适合什么场景？
15. `kexec_file_load` 的 `cmdline` 参数有什么强制要求？写错会得到什么 errno？
16. `KEXEC_SEGMENT_MAX` 是多少？`bufsz` 与 `memsz` 的大小关系是什么？目标物理地址有什么对齐要求？
17. `kexec -l` 与 `kexec -e` 分别做什么？`kexec -u` 做什么？
18. Secure Boot 开着的时候，能不能 kexec 一个没签名的内核？为什么？引用内核文档说明理由。
19. `/sys/kernel/kexec_loaded` 为 1 意味着什么？机器重启之后它会是什么值？为什么这给检测带来困难？
20. `/sys/kernel/kexec_crash_loaded` 和 `/sys/kernel/kexec_crash_size` 分别在什么内核配置下才存在？代码里该怎么处理它们不存在的情况？
21. Lockdown 有哪几个级别？`integrity` 和 `confidentiality` 的差别是什么？`CONFIG_LOCK_DOWN_KERNEL_FORCE_INTEGRITY` 起什么作用？
22. lockdown 会把 `/dev/mem`、`BPF`、`kprobes`、`debugfs` 怎么处理？为什么说"lockdown 挡住了 root 改引导链"是错的？
23. 内核在限制发生时打印的那条 `Lockdown: X: Y is restricted` 消息里，X 和 Y 分别是什么？它对取证有什么用？
24. efivarfs 的文件名和文件内容分别长什么样？为什么"文件名带 GUID、文件内容只有 4 字节属性 + 载荷"这件事容易记错？
25. 为什么内核要把非标准 EFI 变量创建成 immutable 文件？这个设计防的是什么？攻击者要删除这类变量需要做什么？
26. `EFI_LOAD_OPTION` 结构里 `FilePathListLength` 的语义是什么？描述字符串的终止符是什么？
27. EFI 设备路径节点的头是什么？FILEPATH 节点（Type=4/SubType=4）的载荷是什么编码？路径分隔符是哪个？
28. `efibootmgr` 的 `-c`、`-b`、`-o`、`-n` 分别做什么？`BootNext` 与 `BootOrder` 的区别是什么？
29. 写一段 Go 代码解析 efivarfs 文件，正确区分"文件名合法但内容过短"和"文件名不合法"两种错误，并解析出属性与载荷。
30. 写一段 Go 代码解析 `EFI_LOAD_OPTION`，取出描述字符串与设备路径里的文件路径。注意路径里的反斜杠与 UTF-16 解码。至少写 3 个边界用例。
31. 写一段 Go 代码解析 `grub.cfg`，识别出：可疑内核路径、异常启动参数（`init=/bin/sh`、`single`、`rd.break`、`systemd.unit=rescue.target`）、以及 `linux16`/`initrd16` 老式路径。至少写 4 个单测。
32. 写一段 Go 代码枚举 dracut hook，并按优先级计算"同名脚本谁生效、谁被覆盖"。至少写 3 个用例：同名不同根目录、只存在于低优先级目录、hook 文件不是 `.sh` 后缀。
33. 写一段 Go 代码解析 lockdown 文件。当文本里同时出现 `integrity` 和 `confidentiality` 但**没有方括号**时，应该返回什么？为什么不能随便挑一个？
34. 写一段 Go 代码实现三态结论：存在 high/medium 发现 → tampered；无发现但某个关键采集面缺失 → unknown；否则 healthy。至少写 3 个用例覆盖三条分支。
35. 设计一个"推导基线"方案：如何从 `/etc/default/grub` 与 `/etc/grub.d/` 推导出 `grub.cfg` 的期望语义集合？推导结果与实际不一致时，结论应该是什么？
36. 客户升级内核后 `grub.cfg` 与 initramfs 同时变化，`/etc/default/grub` 没变。你的检测应该输出什么结论？请给出三条可能的解释及其区分方法。
37. 客户反馈"你们的 Agent 报 Secure Boot 关闭导致高危，但我们是有意关闭的"。请设计一个既能让客户关闭噪声、又不丢失检测能力的机制。
38. 如果 initramfs 内部被替换但宿主侧 `/etc/dracut/hooks` 完全正常，你会怎么发现？给出至少两条思路并说明各自的盲区。
39. 请画出"引导链健康度"的判定流程图，标出每个环节失败时结论应该落到哪个状态值。
40. 请用一句话向产品经理解释：为什么这条检测永远不能给"绝对安全"的结论？

---

## 参考资料

1. [Linux man-pages：kexec_load(2)](https://man7.org/linux/man-pages/man2/kexec_load.2.html) —— `kexec_load`/`kexec_file_load` 完整参数语义、`KEXEC_ON_CRASH`/`KEXEC_FILE_UNLOAD`/`KEXEC_FILE_ON_CRASH`/`KEXEC_FILE_NO_INITRAMFS`、`KEXEC_SEGMENT_MAX`=16、cmdline 末字节必须为 `'\0'`、glibc 无封装需用 `syscall(2)`
2. [Linux man-pages：kernel_lockdown(7)](https://man7.org/linux/man-pages/man7/kernel_lockdown.7.html) —— Lockdown 覆盖范围原文（`/dev/mem`、`/dev/kmem`、`/dev/kcore`、`/dev/ioports`、BPF、kprobes、debugfs、模块参数直写硬件、PCI BAR、MSR、ACPI 表覆盖）、"Only validly signed binaries may be kexec'd"、Linux 5.4 引入、`CONFIG_SECURITY_LOCKDOWN_LSM`
3. [Linux man-pages：kexec(8)](https://manpages.debian.org/bookworm/kexec-tools/kexec.8.en.html) —— `kexec -l/-e/-u` 语义、"kexec performs the function of the boot loader from within the kernel"、kexec boot 不做固件硬件初始化
4. [内核源码：`security/lockdown/lockdown.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/plain/security/lockdown/lockdown.c) —— `lockdown_levels[]` = none/integrity/confidentiality、`lockdown=integrity|confidentiality` 内核参数、`CONFIG_LOCK_DOWN_KERNEL_FORCE_INTEGRITY`、sysfs 读取格式（当前级别用方括号括起）
5. [内核源码：`kernel/kexec.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/plain/kernel/kexec.c) —— `kexec_load_permitted()`、`security_kernel_load_data(LOADING_KEXEC_IMAGE)`、`security_locked_down(LOCKDOWN_KEXEC)`（"kexec can be used to circumvent module loading restrictions"）
6. [内核源码：`kernel/kexec_core.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/plain/kernel/kexec_core.c) —— `/sys/kernel/kexec_loaded`、`kexec_crash_loaded`、`kexec_crash_size`、`kexec_crash_cma_ranges` 等 sysfs 属性定义
7. [内核文档：`filesystems/efivarfs.rst`](https://www.kernel.org/doc/html/latest/filesystems/efivarfs.html) —— efivarfs 挂载方式、"the first 4 bytes of the output represent the UEFI variable attributes, in little-endian format"、非标准变量被创建为 immutable 文件、`nostatfs` 挂载选项
8. [内核源码：`fs/efivarfs/inode.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/plain/fs/efivarfs/inode.c) —— `efivarfs_valid_name()` 与文件名格式 `VariableName-12345678-1234-1234-1234-1234567891bc`
9. [GNU GRUB 手册](https://www.gnu.org/software/grub/manual/grub/grub.html) —— "The configuration file is now written in something closer to a full scripting language"、"grub.cfg is typically automatically generated by grub-mkconfig"、`/etc/default/grub` 由 shell source、`/etc/grub.d/40_custom` 与 `/boot/grub/custom.cfg`、`save_env`/`load_env` 与 `grub-editenv` 提供的跨重启持久化存储
10. [man-pages：dracut.modules(7)](https://man7.org/linux/man-pages/man7/dracut.modules.7.html) 与 [dracut(8)](https://man7.org/linux/man-pages/man8/dracut.8.html) —— hook 阶段与三个 hook 目录的优先级规则、"most privileged location wins and only one instance of the hook is executed"、hook 被 source 而非 exec（"return must be used instead of exit"）
11. [dracut-ng 源码：`modules.d/80base/dracut-lib.sh`](https://github.com/dracut-ng/dracut-ng/blob/main/modules.d/80base/dracut-lib.sh) —— `list_hooks()` 的实际拼接顺序与同名覆盖逻辑
12. [shim README](https://github.com/rhboot/shim/blob/main/README.md) —— shim 作为 "a first-stage UEFI bootloader" 的行为、标准 `LoadImage`/`StartImage` 失败后回退到内置证书校验、只查 denylist（DBX/MOKX/SBAT）不查 allowlist、shim lock protocol / loader protocol、TPM PCR 扩展
13. [man-pages：efibootmgr(8)](https://manpages.debian.org/bookworm/efibootmgr/efibootmgr.8.en.html) —— `Boot####`/`BootOrder`/`BootNext` 变量语义与 `-c/-b/-o/-n` 选项
14. [同站文章：Go 主机安全面试：Windows 启动链完整性与 Bootkit 检测](go-edr-windows-boot-chain-bootkit-detection.md) —— Windows 侧的引导链视角，与本文的 Linux 引导链互为对照
15. [同站文章：Go 主机安全面试：Linux 审计规则集篡改与 auditd 采集能力削弱检测](go-hids-linux-audit-rule-tamper-detection.md) —— "削弱采集能力"这条思路在引导链上的延伸
16. [同站文章：Go 主机安全面试：Linux 动态链接器路径劫持与 ld.so.cache 投毒检测](go-hids-linux-ld-so-cache-poisoning-detection.md) —— 用户态加载器投毒与本文讨论的引导层投毒在采集面上的差异
