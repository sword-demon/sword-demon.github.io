---
title: Go 主机安全面试：Windows 注册表全局劫持检测（AppInit_DLLs / AppCertDlls / Winlogon）
date: 2026-11-27 10:20:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- windows
- registry
- persistence
---

# Go 主机安全面试：Windows 注册表全局劫持检测（AppInit_DLLs / AppCertDlls / Winlogon）

前面写过 [Windows Sysmon 部署状态与配置篡改检测](go-edr-windows-sysmon-config-tamper-detection.md)、[Windows Defender 排除项篡改与防护降级检测](go-edr-windows-defender-exclusion-tamper-detection.md)、[Windows 启动链完整性与 Bootkit 检测](go-edr-windows-boot-chain-bootkit-detection.md)，那几篇分别盯住了**采集链路**、**防护产品自身配置**和**引导链**。

这篇盯一个更底层、也更隐蔽的面：**Windows 注册表里的"全局加载点"**。

所谓全局加载点，指的是"改一个注册表键值，就能让一段代码在大量进程里自动执行"的机制。它和 Run Key、计划任务、WMI 订阅最大的区别是——**它不是"启动某个程序"，而是"让每个程序都带上你的 DLL"**。攻击者不需要知道你在跑什么，只要你的进程会调 `CreateProcess`、会加载 `user32.dll`，代码就进来了。

这条链上有三个必须掌握的机制：

| 机制 | 注册表位置 | 触发点 | 攻击者拿到的能力 |
|---|---|---|---|
| **AppInit_DLLs** | `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Windows` | 每个加载了 `user32.dll` 的进程 | 几乎所有 GUI 进程内任意代码执行 |
| **AppCertDlls** | `HKLM\System\CurrentControlSet\Control\Session Manager\AppCertDlls` | 每次 `CreateProcess*` / `WinExec` 调用 | 进程创建链上的全局注入点 + 提权 |
| **Winlogon** | `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon`（+ HKCU） | 用户登录 / 注销 / 锁屏 / 启动 | 登录序列劫持、任意代码执行 |

## 岗位场景

```text
客户：某金融行业客户，Windows Server 2019 / Win10 混合环境，约 1500 台服务器。
        需求：EDR 需要能发现"通过注册表配置实现的全局劫持"，并能区分
              运维基线变更与攻击者篡改。

现场问题（客户 SOC 提出）：
  1. 某台跳板机上发现一个陌生的 DLL，被加载进了 explorer.exe、notepad.exe、
     甚至 svchost.exe——但 EDR 的"进程注入"规则一条都没报。
  2. 一台服务器重启后，登录界面能出来，但桌面起不来，运维排查半天，
     最后发现 Winlogon 的 Shell 值被改过。
  3. 红队复现时用 AppCertDlls 挂了一个 DLL 在 CreateProcess 链上，
     客户问："你们 EDR 为什么没报？"

你的任务：
  - 说清这三个机制各自的触发时机与检测价值；
  - 设计一套 Go 侧的采集 + 判定 + 降噪方案；
  - 给出一个能直接上线、能解释清楚"为什么报/为什么不报"的判定模型。
```

## 先纠正四个错误前提

这四个前提是面试里最常见的翻车点，也是实际做产品时最容易搞错的地方。

### 错误前提一：AppInit_DLLs 就是"自动运行"

**不是，它比自动运行危险一个量级。**

AppInit_DLLs 不是一个"启动某个 exe"的配置，而是一个**"往每个进程里塞 DLL"**的配置。MITRE ATT&CK `T1546.010` 的描述很直白：

> DLLs that are specified in the AppInit_DLLs value in the Registry keys `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Windows` or `HKEY_LOCAL_MACHINE\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Windows` are loaded by `user32.dll` into every process that loads `user32.dll`. In practice this is nearly every program, since `user32.dll` is a very common library.

微软自己的文档（*AppInit DLLs and Secure Boot*）也说这是 "allowing custom DLLs to be loaded into the address space of every interactive application"，并且明确写着：**合法软件用这个机制都是个例，而 malware 大量使用它来做 API hook**。

关键差异在于：

- Run Key 持久化 = 每次开机多一个进程，进程树里能看出来。
- AppInit_DLLs 持久化 = 攻击者的 DLL 出现在**每一个进程**的模块列表里。没有"多出的进程"，只有"多出的模块"。

所以你的检测逻辑如果只挂在"进程创建事件"上，天生看不见它。

### 错误前提二：AppInit_DLLs 在 Windows 8+ 还能用

**分情况，而且这个判断本身就是一条检测规则。**

微软文档标题就叫 *AppInit DLLs and Secure Boot*，第一句是：

> Starting in Windows 8, the AppInit_DLLs infrastructure is disabled when secure boot is enabled.

也就是说：

- **Secure Boot 开启**（Win8 及以后的主流默认状态）→ `AppInit_DLLs` 这套机制**整体不生效**。
- **Secure Boot 关闭**，或 Win7 / Win7 时代的 Server 2008 R2 → 机制可用。

这条事实直接导出一个高质量的检测结论：

> 在一台 Secure Boot 已开启的 Windows 8+ 主机上，如果 `LoadAppInit_DLLs=1` 且 `AppInit_DLLs` 非空，那么要么 Secure Boot 实际没生效（这本身是重大降级），要么这个值是**无效残留**、要么有人绕过了 Secure Boot。两种情况都需要告警。

同时注意注册表路径有**两个视图**：`...CurrentVersion\Windows` 和 `...Wow6432Node\...\Windows`。MITRE 明确把这两个都列为 AppInit_DLLs 的落地位置。64 位系统上 32 位进程读的是 WOW6432Node 那份——**只读 64 位视图会漏**。

### 错误前提三：AppCertDlls 和 AppInit_DLLs 是一回事

**完全不同，而且这个区别直接决定你的采集方案。**

- **AppInit_DLLs** 的触发点是 `user32.dll` 被加载时。MITRE 的原话是 "loaded by `user32.dll` into every process that loads `user32.dll`"。所以它的注入点是 **user32.dll 初始化**那一个时刻。
- **AppCertDlls** 的触发点是**进程创建 API**。MITRE `T1546.009` 写的是："loaded into every process that calls the ubiquitously used API functions `CreateProcess`, `CreateProcessAsUser`, `CreateProcessWithLoginW`, `CreateProcessWithTokenW`, or `WinExec`."

注意这里有个容易搞反的地方：**AppCertDlls 是被加载到"调用了 CreateProcess 的那个进程"里**，然后通过 `CreateProcessNotify` 回调在子进程创建时被通知。第三方研究者 Stefan Kanthak 对 AppCert.dll 的分析里写得更细：AppCert DLL 在进程第一次调用上述 API 时被加载，`CreateProcessNotify` 回调以 `PROCESS_CREATION_QUERY` 原因被调用；**如果它返回负的 NTSTATUS（如 `0xC0000372`），进程创建会被直接拒绝**。

所以 AppCertDlls 有两个能力：

1. **持久化**：每创建一个进程就被触发一次。
2. **提权**：MITRE 明确说 "Similar to Process Injection, this value can be abused to obtain elevated privileges"——因为它是在**父进程**上下文里加载的，高权限父进程创建子进程时，恶意 DLL 就获得了高权限上下文。

还有一个实践细节必须知道：**AppCertDlls 是微软未公开文档的机制**（Kanthak 原话："AppCertDlls are not documented by Microsoft"）。这意味着它的注册表格式在不同资料里有出入——

- Microsoft Learn 的 `AppCertDlls` 文档（`ntddk`）描述为 `HKLM\System\CurrentControlSet\Control\Session Manager\AppCertDlls`，**值名是 DLL 路径**。
- 而 Atomic Red Team 的 `T1546.009` 用 `reg add ... /v "AtomicTest" /t REG_EXPAND_SZ /d "C:\Users\Public\AtomicTest.dll"`——**值名是任意标识，路径在值数据里**。

真实攻击里两种都见过。**你的采集代码必须同时看值名和值数据**，这是我在实现里踩到并修正的一个坑。

### 错误前提四：Winlogon 只有 HKLM 那一个键

**HKLM 和 HKCU 都要看，而且 HKCU 那个更危险。**

MITRE ATT&CK `T1547.004`（Winlogon Helper DLL）的描述同时列了两个位置：

> Registry entries in `HKLM\Software[\\Wow6432Node\\]\Microsoft\Windows NT\CurrentVersion\Winlogon\` and `HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon\`

并且点名了三个可被滥用的子键/值：

- **`Winlogon\Notify`** —— 指向处理 Winlogon 事件的 notification package DLL
- **`Winlogon\Userinit`** —— 指向 userinit.exe，用户登录时执行的用户初始化程序
- **`Winlogon\Shell`** —— 指向 explorer.exe，用户登录时执行的系统 shell

微软的 *Winlogon* 文档补了 `Notify` 的内部结构（在 `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\Notify` 下建子键）：`DllName`（REG_EXPAND_SZ，DLL 路径）、`Logon`/`Logoff`/`Startup`/`Shell` 等事件处理函数名（REG_SZ）、`Asynchronous`/`Impersonate`（REG_DWORD）。

HKCU 那份为什么更危险？因为 HKLM 的 Winlogon 键通常只有管理员能改，动了会触发大量审计；而 HKCU 下的 Winlogon 是**普通用户自己就能写**的。一个低权限账号被攻陷后，可以直接改自己 HKCU 下的 `Shell`，下次登录就把 shell 换成自己的程序——**这还是一条天然的提权路径**（因为 `Shell` 是以登录用户的 token 启动的，但如果你把 `Shell` 指向一个需要更高权限才能读的资源，就会触发 UAC 提权）。

## 高频面试题

### 1. AppInit_DLLs 到底在什么时刻被加载？你的 Agent 该在哪一层观测它？

**答案：** 加载发生在 `user32.dll` 被加载进进程的那一瞬间，由 `user32.dll` 自己完成加载。MITRE 的表述是 "loaded by `user32.dll` into every process that loads `user32.dll`"。

**关键知识点：**

- 这是一个**进程内模块注入**，不是一个"启动动作"。所以：
  - **进程创建事件**看不到它（进程确实正常启动了）。
  - **进程注入规则**（`CreateRemoteThread`、`NtMapViewOfSection`）也看不到它——因为根本没有跨进程写入动作，Windows 自己在进程地址空间里完成了 `LoadLibrary`。
  - **模块加载事件**（Sysmon EID 7、Image Load）才看得到，但 Sysmon 默认关闭了 EID 7。
- 它的注入点在**进程初始化早期**，早于绝大多数用户态 Agent 自己的逻辑。这也是为什么"用 EDR 自己的进程注入检测来发现 AppInit"是无效的。

**Go 落地思路：** 三条互补的证据链，缺一不可：

1. **配置侧（主力）**：读注册表三个值，直接判定"全局加载通道是否被打开"。
2. **行为侧（补漏）**：从目标进程已加载的模块列表里，找"出现在很多进程里、但路径不受信任"的 DLL。这需要读 `Process.Modules` 或用 ETW 的 image load 事件；纯 Go 侧比较别扭，通常走 `EnumProcessModules`。
3. **历史侧（定性）**：注册表修改时间（如果能用 `reg query` 之外的手段拿到）、Sysmon 的注册表事件（EID 13）等。

结论上要区分两个层次：**"通道被打开"是配置事实，"DLL 真的被加载了"是行为事实**。前者可以由 Agent 直接确认，后者在 Secure Boot 开启的机器上可能根本不成立。

---

### 2. `LoadAppInit_DLLs`、`AppInit_DLLs`、`RequireSignedAppInit_DLLs` 三个值分别管什么？

**答案：** 都在 `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Windows` 下（32 位视图另有 `Wow6432Node` 一份）。

| 值名 | 类型 | 语义 |
|---|---|---|
| `LoadAppInit_DLLs` | REG_DWORD | 全局开关，`0x0` 禁用 / `0x1` 启用 |
| `AppInit_DLLs` | REG_SZ | **空格或逗号分隔**的 DLL 列表，微软建议写**完整短路径（Short Names）** |
| `RequireSignedAppInit_DLLs` | REG_DWORD | `0x0` 加载任意 DLL / `0x1` 只加载代码签名过的 DLL |

**关键知识点（几个容易答错的细节）：**

- 微软文档明确写："The complete path to the DLL should be specified using Short Names"，示例是 `C:\PROGRA~1\WID288~1\MICROS~1.DLL`。**为什么是短路径？** 因为列表项用空格分隔，长路径里的空格会破坏解析。所以你会看到真实攻击样本里全是 `PROGRA~1` 这种形态。
- **默认值的差异是有信息量的**：Windows 7 上 `RequireSignedAppInit_DLLs` 默认是 `0`（为了兼容，Win7 会加载所有 AppInit DLL）；Windows Server 2008 R2 上默认是 `1`（只加载签名过的）。所以"Win7 上 RequireSigned=0"是正常的，"Win10 上 RequireSigned=0"就值得看了。
- `AppInit_DLLs` 是 REG_SZ，**不是多值（REG_MULTI_SZ）**。解析时按空格/逗号切，别按 `;` 假设。
- 这套机制在 **Windows 8 桌面应用认证里是明确的失败项**——微软文档说 "using the AppInit_DLLs mechanism is a Windows desktop app certification failure"。**含义：任何还在正经发行的软件都不会用这个机制，命中即高度可疑。**

**Go 落地思路：** 判定逻辑要分层，不能只看"列表非空"：

```go
// EvaluateAppInit 依据快照与受信任目录给出结论。
func EvaluateAppInit(state AppInitState, trustedDirs []string) []Finding {
	if !state.Enabled {
		return []Finding{{
			Verdict: VerdictHealthy,
			Reason:  ReasonAppInitEnabled,
			Detail:  "LoadAppInit_DLLs 未开启，AppInit 机制未生效",
		}}
	}

	findings := []Finding{{
		Verdict: VerdictSuspicious,
		Reason:  ReasonAppInitEnabled,
		Detail:  "LoadAppInit_DLLs=1，全局 DLL 注入通道处于开启状态",
	}}

	if !state.RequireSigned {
		findings = append(findings, Finding{
			Verdict: VerdictSuspicious,
			Reason:  ReasonAppInitUnsignedAllowed,
			Detail:  "RequireSignedAppInit_DLLs=0，未签名 DLL 也可以被加载",
		})
	}

	if len(state.DLLs) == 0 {
		findings = append(findings, Finding{
			Verdict: VerdictUnknown,
			Reason:  ReasonAppInitEnabled,
			Detail:  "机制已开启但列表为空，需确认采集是否完整",
		})
		return findings
	}

	for _, dll := range state.DLLs {
		normalized := NormalizeWindowsPath(dll)
		switch {
		case !IsAbsoluteWindowsPath(normalized):
			findings = append(findings, Finding{
				Verdict: VerdictSuspicious,
				Reason:  ReasonAppInitRelativePath,
				Detail:  "AppInit 列表项不是绝对路径，实际落点依赖 DLL 搜索顺序：" + dll,
			})
		case !PathInDirs(normalized, trustedDirs):
			findings = append(findings, Finding{
				Verdict: VerdictSuspicious,
				Reason:  ReasonAppInitUntrustedPath,
				Detail:  "AppInit 列表项不在受信任目录内：" + dll,
			})
		}
	}
	return findings
}
```

注意这里 `Enabled` 和 `RequireSigned` 是**两个独立的可疑度来源**：即使所有 DLL 都在 `System32` 下，`RequireSigned=0` 也说明"未签名 DLL 通道是开的"——这是个独立结论。

---

### 3. 怎么解析 `AppInit_DLLs` 里的路径？为什么不能用 `filepath.Clean`？

**答案：** 这题专门考 Go 的工程细节，答错很致命。

**关键知识点：**

- 列表项是**空格或逗号分隔**的。因为空格是分隔符，路径里不能有空格——所以真实值都是 8.3 短路径（`C:\PROGRA~1\...`）。你**不能**简单地按空格切完就认为每个 token 都是完整路径——必须容忍空项、重复项、前后空白。
- 归一化时的三个坑：
  1. **不能用 `filepath.Clean`**。`filepath` 的分隔符语义**取决于运行平台**。你的 Agent 编译出来跑在 Windows 上时 `filepath.Clean` 处理 `\` 没问题；但一旦你在 Linux 容器里跑测试、或者代码被复用到跨平台工具里，`filepath.Clean("C:\\Windows\\System32\\a.dll")` 会得到**原样不动**的结果（因为 `/` 才是 Linux 的分隔符，`\` 被当成普通字符），`..` 也不会被解析。所以 Windows 路径归一化必须自己写，或者显式用 `path.Clean` + 手动替换分隔符。
  2. **大小写不敏感**。Windows 文件系统默认大小写不敏感，`C:\WINDOWS\SYSTEM32\a.dll` 和 `c:\windows\system32\a.dll` 是同一个文件。做白名单比较必须先转小写。
  3. **目录边界要防前缀误判**。`C:\Windows\System32Evil\x.dll` 用 `strings.HasPrefix(p, "c:/windows/system32")` 会**误判为在 System32 内**。必须补上前缀分隔符。

**Go 落地思路：**

```go
// NormalizeWindowsPath 把任意来源的 Windows 路径规范化成可比较的形式：
// 去空白与引号、反斜杠转正斜杠、折叠重复分隔符、解析 . 与 ..、转小写。
// 不能用 filepath.Clean：filepath 依赖运行平台的分隔符语义，
// 在 Linux/macOS 上处理 Windows 路径会得到错误结果。
func NormalizeWindowsPath(raw string) string {
	p := strings.TrimSpace(raw)
	p = strings.Trim(p, "\"")
	if p == "" {
		return ""
	}
	p = strings.ReplaceAll(p, "\\", "/")
	p = path.Clean(p)
	return strings.ToLower(p)
}

// PathInDirs 判断规范化后的路径是否位于给定受信任目录之下。
func PathInDirs(normalized string, trustedDirs []string) bool {
	for _, dir := range trustedDirs {
		dn := NormalizeWindowsPath(dir)
		if dn == "" || normalized == dn {
			continue
		}
		if strings.HasPrefix(normalized, dn+"/") {
			return true
		}
	}
	return false
}
```

`path.Clean` 是标准库 `path` 包的（不是 `filepath`），它**永远**用 `/` 做分隔符，所以行为是确定的、可跨平台测试的。先把 `\` 换成 `/` 再交给它，`..` 也就正确解析了。

---

### 4. AppCertDlls 的注册表项到底怎么存？值名还是值数据？

**答案：** **两种都要看**，因为真实环境里两种都存在。

**关键知识点：**

- 微软 Learn 的 `AppCertDlls` 文档（`ntddk` 命名空间）描述为 `HKLM\System\CurrentControlSet\Control\Session Manager\AppCertDlls`，语义上**值名是 DLL 路径**。
- Atomic Red Team 的 `T1546.009` 测试用例则是：`reg add "HKKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\AppCertDlls" /v "AtomicTest" /t REG_EXPAND_SZ /d "C:\Users\Public\AtomicTest.dll"`，**值名是任意标识，路径在值数据**。
- 还有一种更隐蔽的变体：值名写相对文件名（依赖 DLL 搜索顺序），值数据为空或写绝对路径。

**所以采集规则应该是：路径 = 值数据（若非空）优先，否则回退到值名。**

**Go 落地思路：**

```go
// AppCertEntry 是 AppCertDlls 键下的一个条目。
// 注册表值名通常是任意标识（如 "AtomicTest"），DLL 完整路径写在值数据里；
// 也有实现把短文件名写在值名里，因此两者都要看。
type AppCertEntry struct {
	Name string
	Path string
}

// ParseAppCertEntries 把 AppCertDlls 的值整理成有序条目列表。
// 注册表枚举顺序不保证稳定，必须排序后再做基线 diff，否则会抖动。
func ParseAppCertEntries(values map[string]string) []AppCertEntry {
	entries := make([]AppCertEntry, 0, len(values))
	for name, data := range values {
		path := strings.TrimSpace(data)
		if path == "" {
			path = name
		}
		entries = append(entries, AppCertEntry{Name: name, Path: path})
	}
	sort.Slice(entries, func(i, j int) bool {
		if NormalizeWindowsPath(entries[i].Path) != NormalizeWindowsPath(entries[j].Path) {
			return NormalizeWindowsPath(entries[i].Path) < NormalizeWindowsPath(entries[j].Path)
		}
		return entries[i].Name < entries[j].Name
	})
	return entries
}
```

**为什么必须排序？** 因为你要拿当前快照和基线快照做 diff。注册表的枚举顺序**不保证稳定**，不排序的话每次扫描都会产出一堆"顺序不同的假变更"。这是最常见的误报来源之一。

顺带说个检测上的加分项：Windows 11 上 `services.exe` / `wininit.exe` 以 Protected Process Lite 运行，AppCert.dll 加载会失败，并在 `Microsoft-Windows-CodeIntegrity/Operational` 日志里留下 **Event ID 3033（Error）和 3089（Information）**，插入字符串里能看到被拒绝加载的 DLL 路径。这是**行为侧**独立于注册表的证据源。

---

### 5. Winlogon 的 `Shell` 和 `Userinit` 分别在什么时候执行？默认值是什么？

**答案：** `Userinit` 在用户认证后、桌面出现前运行；`Shell` 在 `Userinit` 之后启动。

**关键知识点：**

- 默认值（微软 KB555648《Windows logs on and logs off immediately》给出的官方修复值）：
  - `Shell = explorer.exe`
  - `Userinit = C:\windows\system32\userinit.exe`

  实际机器上 `Userinit` 的值通常带一个**结尾逗号**（`C:\windows\system32\userinit.exe,`），因为它支持**多值**（逗号分隔的多个程序依次执行）。**这个逗号是攻击者最爱用的位置**——追加一个自己的 exe，就能在 shell 起来之前先跑自己的代码。

- 微软的排障文档也确认了 `Shell` 的期望值是 `explorer.exe`，并且指出 `Userinit` 相关的 `userinit.exe` 和 `explorer.exe` 文件"may also be deleted by spywares"。

- `Notify` 子键的结构（微软 *Winlogon* 文档）：`HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\Notify\<包名>`，内含 `DllName`（REG_EXPAND_SZ）、`Logon`/`Logoff`/`Startup`/`Shell` 等事件处理函数名（REG_SZ）、`Asynchronous`/`Impersonate`（REG_DWORD）。

**Go 落地思路：** 判定要同时看"首项对不对"和"有没有多出来的项"：

```go
// ParseWinlogonUserinit 解析 Userinit 值：逗号分隔的多项，末尾逗号会被忽略。
func ParseWinlogonUserinit(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	seen := make(map[string]bool, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		key := NormalizeWindowsPath(part)
		if seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, part)
	}
	return out
}
```

为什么"去重"和"忽略空项"都要做？因为 `Userinit` 的值里如果写成 `a.exe,,b.exe`（双逗号），空项会被当成一个空的可执行文件路径。你的解析要能容错，否则解析器自己就崩了。

---

### 6. 怎么区分"运维改的"和"攻击者改的"？

**答案：** 单看注册表值**不可能**区分，必须靠**多源证据交叉**。

**关键知识点——分层证据：**

| 证据层 | 内容 | 作用 |
|---|---|---|
| 路径信任 | 变更后的路径是否在 `System32` / `SysWOW64` / 厂商签名目录下 | 排除绝大多数误报 |
| 代码签名 | 目标 DLL 是否被 Authenticode 签名、签名者是否是已知厂商 | 排除"合法但少见的软件" |
| 时间上下文 | 变更是否落在变更工单窗口内 | 区分运维 vs 攻击 |
| 变更来源 | 是谁写的：域 GPO 下发、部署系统、还是本地管理员手工操作 | 最强的判别依据 |
| 值形态 | 是否偏离该软件的"正常形态"（如 AppInit 列表项用了空格路径、路径不在短名规范下） | 弱信号，但可叠加 |

**Go 落地思路：** 三态结论，不要二值化：

- `healthy` —— 符合基线
- `suspicious` —— 明确偏离
- `unknown` —— **采集不完整或环境受限，无法判定**

第三态极其重要。客户环境里你的 Agent 可能没有足够权限读某个键、可能在 32 位系统上没有 WOW6432Node 视图、可能被 EDR 自保护挡了。**把这些情况报成"正常"是错误的**，报成"可疑"会产生海量误报。正确做法是报 `unknown` 并附上原因，让 SOC 知道"这台机器这块我们没看清"。

同理，`EvaluateAppInit` 里"机制已开启但列表读出来是空的"应该是 `unknown` 而不是 `healthy`——因为可能只是你的读取被拒绝了。

---

### 7. 32 位 / 64 位注册表视图，Go 里到底怎么读？

**答案：** 用 `golang.org/x/sys/windows/registry` 的视图标志，不要手工拼 `WOW6432Node` 路径。

**关键知识点：**

- WOW64 重定向规则：`HKLM\SOFTWARE` 下的键在 64 位系统上对 32 位进程会被重定向到 `WOW6432Node` 子键。`HKLM\System\CurrentControlSet` **不**重定向（除了少数例外）。
- `x/sys/windows/registry` 提供 `registry.WOW64_64KEY` 和 `registry.WOW64_32KEY` 两个访问标志，用它们打开同一个逻辑键，就能拿到两个视图的内容。
- 手工拼 `WOW6432Node` 路径**在 32 位系统上会得到错误结果**（不存在这个子键），而且对 `CurrentControlSet` 这类不重定向的键会误导。

**Go 落地思路：** 把"读哪个视图"抽象成参数，而不是散落在代码里：

```go
// RegistryView 表示注册表视图。64 位系统上同一个逻辑键在 32 位进程中
// 会被 WOW64 重定向到 WOW6432Node，必须两个视图都读。
type RegistryView int

const (
	View64 RegistryView = iota
	View32
)

// RegistrySource 抽象注册表读取，使检测逻辑可以在任意平台做单元测试。
type RegistrySource interface {
	StringValue(view RegistryView, path, name string) (string, bool, error)
	Uint32Value(view RegistryView, path, name string) (uint32, bool, error)
	ValueNames(view RegistryView, path string) ([]string, error)
	SubKeyNames(view RegistryView, path string) ([]string, error)
}
```

这个 `RegistrySource` 接口是整篇文章**最值得抄走的设计**：

- **Windows 实现**用 `registry.OpenKey` + 视图标志。
- **测试实现**用内存 map，可以断言任意输入组合。
- **判定逻辑 100% 是纯函数**，可以在 CI 上跑，不需要 Windows 机器，不需要真实注册表。

我这套代码的全部单测就是这么跑的——`go test` 在 macOS 上直接过。

---

### 8. `Notify` 子键要读到多深？

**答案：** 至少读 `DllName`，理想情况下把整个子键结构读出来。

**关键知识点：**

- `Notify` 下**每个子键**是一个 notification package，子键名通常和 DLL 同名但不强制（微软文档说 "The name of the key is usually the same as the name of the DLL; however, this is not mandatory"）。
- 关键值：`DllName`（REG_EXPAND_SZ，DLL 路径）、`Logon`/`Logoff`/`Startup`/`Shell`/`Lock`/`Unlock`/`Shutdown`/`StartScreenSaver`/`StopScreenSaver`（REG_SZ，事件处理函数名）、`Asynchronous`/`Impersonate`/`SmartCardLogonNotify`（REG_DWORD）。
- **`Impersonate=1`** 意味着 Winlogon 调用该包时会模拟登录用户的安全上下文。这不是恶意信号，但它意味着这个 DLL 能拿到用户令牌——所以路径不可信时风险更高。

**Go 落地思路：** 用 `SubKeyNames` 拿子键列表，再逐个子键读 `DllName`：

```go
	notifyRoot := WinlogonKeyPath + `\Notify`
	notifyNames, err := src.SubKeyNames(view, notifyRoot)
	if err != nil && !errors.Is(err, ErrUnsupportedView) {
		return WinlogonState{}, err
	}
	notify := make([]string, 0, len(notifyNames))
	for _, name := range notifyNames {
		dll, _, err := src.StringValue(view, notifyRoot+`\`+name, "DllName")
		if err != nil {
			continue
		}
		if dll = strings.TrimSpace(dll); dll != "" {
			notify = append(notify, dll)
		}
	}
	sort.Strings(notify)
```

注意两点：

1. `Notify` 子键**不存在**是正常情况，不是错误。所以对 `ErrUnsupportedView`（键不存在）要做容错，否则每台正常机器都会报错。
2. 单个子键读失败（比如权限不足）**跳过即可**，不要整个失败——部分可读 > 完全不可用。

---

### 9. 这类检测怎么上报？事件模型怎么设计？

**答案：** 上报**状态快照 + 变更**，而不是"每次扫描都报一次当前值"。

**关键知识点：**

- 这些注册表项**变化极少**。每次扫描全量上报，1 万台机器 × 每小时一次 = 巨量无意义流量，还会让 SOC 淹没在重复告警里。
- 正确姿势：**Agent 本地做基线快照**，只有当"当前值 vs 上次快照"发生变化时才产生事件。事件里带**完整的前后值**。
- 事件字段建议：
  - `mechanism`：`appinit` / `appcert` / `winlogon`
  - `registry_path`：完整注册表路径（**含视图标识**，如 `HKLM\SOFTWARE\WOW6432Node\...`）
  - `value_name` / `value_data`
  - `previous_data`
  - `verdict` + `reason`（机器可读的原因码）
  - `trusted_dir_hit`：路径信任判定结果
  - `collector_state`：采集是否完整（决定 SOC 怎么理解这条告警）

**Go 落地思路：** 原因码用常量字符串，不要在告警文本里硬编码：

```go
// 机器可读的结论原因码，便于告警聚合与降噪。
const (
	ReasonAppInitEnabled         = "appinit_enabled"
	ReasonAppInitUnsignedAllowed = "appinit_unsigned_allowed"
	ReasonAppInitUntrustedPath   = "appinit_untrusted_path"
	ReasonAppInitRelativePath    = "appinit_relative_path"
	ReasonAppCertPresent         = "appcert_dlls_present"
	ReasonAppCertUntrustedPath   = "appcert_untrusted_path"
	ReasonWinlogonShellChanged   = "winlogon_shell_changed"
	ReasonWinlogonUserinitExtra  = "winlogon_userinit_extra"
	ReasonWinlogonUntrustedPath  = "winlogon_untrusted_path"
	ReasonRegistryUnreadable     = "registry_unreadable"
)
```

原因码让 SOC 侧可以做聚合（"全网 200 台机器命中 `appinit_untrusted_path`"比 200 条自由文本有用得多）。

---

### 10. 误报怎么压？降噪策略有哪些层次？

**答案：** 分四层，从便宜到贵依次用。

**第一层：路径信任（最有效）。** 受信任目录白名单：`System32`、`SysWOW64`、`Program Files` 下的厂商目录。路径不在白名单 → 立刻可疑。这一层能干掉 95% 的噪声。

**第二层：值形态。** AppInit 列表项必须是**绝对路径 + 短路径形态**。出现相对路径、出现长路径带空格 → 强烈可疑，因为正常软件不会这么写。

**第三层：厂商基线。** 大部分企业环境里 `AppInit_DLLs` / `AppCertDlls` **根本应该是空的**。如果你的客户基线要求"这两个键必须为空"，那"非空"本身就是违规，不需要再判路径。这是最省事的做法。

**第四层：时间与来源上下文。** 结合变更工单、GPO 下发记录、部署系统写入记录。

**Go 落地思路：** 前三层都是纯函数，天然可测：

```go
func TestEvaluateAppInitUntrustedAndUnsigned(t *testing.T) {
	findings := EvaluateAppInit(AppInitState{
		Enabled:       true,
		RequireSigned: false,
		DLLs:          []string{`C:\Users\attacker\evil.dll`},
	}, trusted)
	reasons := map[string]bool{}
	for _, f := range findings {
		reasons[f.Reason] = true
		if f.Verdict != VerdictSuspicious {
			t.Fatalf("expected suspicious, got %+v", f)
		}
	}
	if !reasons[ReasonAppInitUnsignedAllowed] || !reasons[ReasonAppInitUntrustedPath] {
		t.Fatalf("missing reasons: %+v", reasons)
	}
}
```

这种测试的价值在于：**它同时是规格说明**。新人 review 时看测试就知道"什么样的输入应该产生什么结论"。

---

### 11. 这条链在攻击链还原里处于什么位置？

**答案：** 它是**持久化 + 提权**的组合节点，且**位置很靠后**——通常在攻击者已经拿到本地管理员权限之后。

**关键知识点：**

- MITRE ATT&CK 给 AppInit DLLs 打的标签是 `Privilege Escalation, Persistence`；AppCert DLLs 同样是 `Privilege Escalation, Persistence`；Winlogon Helper DLL（`T1547.004`）是 `Persistence, Privilege Escalation`。
- **这三个都需要写 HKLM（或 HKCU）的权限**，也就是说通常需要**管理员**。所以在攻击链上，它们出现在**横向移动或凭据窃取之后**，而不是初始入侵阶段。
- 这一点对规则设计有直接影响：
  - 如果你在**初始入侵**阶段（钓鱼附件、webshell）就告警"AppInit_DLLs 被篡改"，几乎一定是误报——攻击者还没拿到管理员权限。
  - 更有价值的用法是**关联**：在已经存在"凭据窃取"或"提权成功"事件之后，再出现"全局加载通道被打开"，这是一条高质量的**攻击链确认**信号。
  - 反过来，如果一台机器上**从来没有**管理员级别的活动，却出现了 HKLM 的 Winlogon 变更——**要么是你的 Agent 权限异常，要么是有人在绕过你的审计**。这本身值得单独看。

**Go 落地思路：** 原因码要和攻击链上下文关联使用，而不是孤立告警。这块不属于本文的纯函数部分，但架构上要留出接口——把 `Finding.Reason` 设计成能和"提权成功""凭据访问"这些事件做 join 的键。

---

### 12. 客户说"我们机器上 AppInit_DLLs 是空的，为什么你的产品报了可疑"——你怎么回答？

**答案：** 这是典型的**三态误用**。产品必须能解释自己。

**关键排查顺序：**

1. **先确认报的是哪个视图。** 你的告警事件里 `registry_path` 带不带 `WOW6432Node`？64 位视图为空、32 位视图有值，说明攻击者（或某个老软件）只写了 32 位那一份。
2. **确认是哪条规则。** `appinit_enabled`（开关被打开但列表为空）和 `appinit_untrusted_path`（列表里有不受信任路径）是完全不同的两回事。前者可能只是某个软件打开了开关但没配列表。
3. **确认采集完整性。** 你的 `collector_state` 是不是标了"部分可读"？如果 Agent 读 32 位视图失败（权限不足），你会拿到空列表——**空列表不等于"没有配置"**。这是最容易误报的一处：读取失败被当成了"值为空"。

第 3 点是设计缺陷，不是配置问题。**空值和读取失败必须在数据结构上区分开**，不能都塞进一个 `string`。

**Go 落地思路：** 接口层就区分这两种情况：

```go
type RegistrySource interface {
	// StringValue 返回值、是否存在、以及读取错误。
	// 错误必须与"值不存在"区分：空值可能来自读取失败。
	StringValue(view RegistryView, path, name string) (string, bool, error)
	Uint32Value(view RegistryView, path, name string) (uint32, bool, error)
	ValueNames(view RegistryView, path string) ([]string, error)
	SubKeyNames(view RegistryView, path string) ([]string, error)
}
```

`ok` 表示"键存在"，`err` 表示"读取失败"。两者语义完全不同，调用方必须分开处理。上面 `ReadWinlogon` 里对 `Notify` 的处理就是这个模式的示范：**键不存在 → 忽略；读取失败 → 跳过单个子键**。

## Go 落地思路：整体结构

把上面所有点收敛成一个可上线的结构：

```text
                    ┌─────────────────────────────────────┐
                    │  WinRegistrySource (Windows only)   │
                    │  x/sys/windows/registry             │
                    │  · WOW64_64KEY / WOW64_32KEY        │
                    │  · 区分"不存在"与"读取失败"          │
                    └──────────────┬──────────────────────┘
                                   │ 实现 RegistrySource 接口
                    ┌──────────────▼──────────────────────┐
                    │  ReadAppInit / ReadAppCert /        │
                    │  ReadWinlogon                       │
                    │  → 纯快照，无判断逻辑                │
                    └──────────────┬──────────────────────┘
                                   │ 纯函数
                    ┌──────────────▼──────────────────────┐
                    │  EvaluateAppInit / EvaluateAppCert  │
                    │  / EvaluateWinlogon                 │
                    │  → []Finding（Verdict + Reason）     │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │  快照 diff → 变更事件                │
                    │  · 只在变化时上报                    │
                    │  · 带前后值 + 视图标识 + collector_state │
                    └─────────────────────────────────────┘
```

**分层原则：**

- **最底层（平台相关）**：`RegistrySource` 的 Windows 实现。这是唯一碰 `x/sys/windows/registry` 的地方。
- **中间层（纯函数）**：全部解析和判定。零平台依赖，零 I/O，100% 可测。
- **最上层（策略）**：diff、事件构造、上报。这层决定"报不报、报给谁"。

**为什么要这么分？** 因为中间层是你**唯一能大规模测试**的部分。真机验证一次覆盖 1500 台机器的组合是不可能的，但纯函数可以用表驱动测试穷举。而且中间层可以在 CI 上跑——`go test` 不需要 Windows。

主流程大致是这样：

```go
// Detect 在一个视图上完成 AppInit/AppCert/Winlogon 的采集与判定。
func Detect(src RegistrySource, view RegistryView, expect WinlogonExpectation, trustedDirs []string) (Collect, error) {
	result := Collect{View: view}

	appInit, err := ReadAppInit(src, view)
	if err != nil {
		return result, err
	}
	result.Findings = append(result.Findings, EvaluateAppInit(appInit, trustedDirs)...)

	appCert, err := ReadAppCert(src, view)
	if err != nil && !errors.Is(err, ErrUnsupportedView) {
		return result, err
	}
	result.Findings = append(result.Findings, EvaluateAppCert(appCert, trustedDirs)...)

	winlogon, err := ReadWinlogon(src, view)
	if err != nil {
		return result, err
	}
	result.Findings = append(result.Findings, EvaluateWinlogon(winlogon.Shell, winlogon.Userinit, expect, trustedDirs)...)

	for _, dll := range winlogon.Notify {
		normalized := NormalizeWindowsPath(dll)
		if IsAbsoluteWindowsPath(normalized) && !PathInDirs(normalized, trustedDirs) {
			result.Findings = append(result.Findings, Finding{
				Verdict: VerdictSuspicious,
				Reason:  ReasonWinlogonUntrustedPath,
				Detail:  "Winlogon Notify 包 DLL 不在受信任目录内：" + dll,
			})
		}
	}
	return result, nil
}
```

调用方对 `View64` 和 `View32` 各跑一次，把结果合并。**任一视图命中就告警**——因为攻击者只需要一个视图生效。

## 学习要点

1. **AppInit_DLLs 是"往每个进程塞 DLL"，不是"自动运行"。** 进程创建事件和进程注入规则都看不见它。
2. **Secure Boot 是它的开关。** Win8+ 开了 Secure Boot，这套机制整体失效——"Secure Boot 开着但 `LoadAppInit_DLLs=1`"本身就是告警。
3. **AppInit_DLLs 在 Win8 桌面应用认证里是失败项。** 正规软件不会用，命中即高度可疑。
4. **AppInit_DLLs 有两个注册表视图**（64 位 + WOW6432Node），只读一个会漏。
5. **AppCertDlls 的触发点是 `CreateProcess*` / `WinExec`**，不是 user32.dll 加载；它加载到**调用方**进程，因而具备提权能力；它是微软未公开的机制，注册表格式两种都存在，**值名和值数据都要看**。
6. **Winlogon 要看 HKLM 和 HKCU 两份**，HKCU 那份普通用户就能写。
7. **`Userinit` 是逗号分隔的多值**，尾部逗号是常态，多出来的项就是攻击载荷。
8. **Windows 路径归一化不能用 `filepath`**，要用 `path.Clean` + 手动替换分隔符，并且注意大小写和目录边界。
9. **注册表枚举顺序不稳定**，做 diff 前必须排序，否则全是假变更。
10. **三态结论（healthy / suspicious / unknown）** 是硬要求，"读不到"绝不能报成"正常"。
11. **这些机制都需要管理员权限**，所以在攻击链上属于后段；把它们和提权/凭据事件关联才有高价值。
12. **`RegistrySource` 抽象接口**是让这套逻辑可测试的关键设计。

## 小练习

**练习 1（基础）** `AppInit_DLLs` 的值是 `"C:\PROGRA~1\APP\a.dll,C:\Windows\System32\b.dll  C:\PROGRA~1\APP\a.dll"`。用 `ParseAppInitList` 解析后有几个结果？为什么要去重？

**练习 2（基础）** 为什么 `NormalizeWindowsPath` 要用 `path.Clean` 而不是 `filepath.Clean`？写一个例子说明两者的差异。

**练习 3（基础）** `PathInDirs` 里如果只写 `strings.HasPrefix(normalized, dn)`（不加 `dn+"/"`），下面哪个路径会被误判为在 `C:\Windows\System32` 内？
(a) `C:\Windows\System32\a.dll`  (b) `C:\Windows\System32Evil\a.dll`  (c) `C:\Windows\System32\..\System32Evil\a.dll`  (d) 以上都会

**练习 4（进阶）** `Userinit` 的值是 `"C:\Windows\system32\userinit.exe,C:\Users\victim\evil.exe"`。`EvaluateWinlogon` 会产出几条 Finding？分别是什么 Reason？

**练习 5（进阶）** AppCertDlls 键下有两个值：`"AtomicTest" = "C:\Users\Public\AtomicTest.dll"` 和 `"AppCert.dll" = "C:\Windows\System32\AppCert.dll"`。`ParseAppCertEntries` 会返回什么？如果第二个值的**值数据**被清空，判定结果会怎么变？

**练习 6（进阶）** 实现 `IsAbsoluteWindowsPath` 的完整逻辑。注意 `C:foo.dll`（带盘符但没有分隔符）**不是**绝对路径。这种写法在 AppInit 列表里意味着什么？

**练习 7（设计）** 你的 Agent 在一台机器上读 32 位视图失败（权限不足）。请说明：如果你在 `ReadAppInit` 里直接 `return AppInitState{}, err`，会发生什么？应该怎么处理？三态结论里对应哪个值？

**练习 8（设计）** 设计一个"基线快照 diff"的数据结构：Agent 每小时扫描一次注册表，只有变化才上报。快照里应该存什么？如何避免"值顺序抖动"导致的假变更？

**练习 9（设计）** 你要支持"白名单厂商目录"。白名单应该由谁维护（云端下发 / 本地硬编码 / 客户可配置）？如果客户往白名单里加了一个 `C:\Users\` 下的路径，你的系统应该怎么处理？

**练习 10（综合）** 一台 Windows 10 机器上：Secure Boot 开启，`LoadAppInit_DLLs=1`，`RequireSignedAppInit_DLLs=1`，`AppInit_DLLs="C:\Windows\System32\ok.dll"`。请给出你的最终结论（verdict + reasons + 给 SOC 的解释话术），并说明在什么条件下这个结论需要改变。

**练习 11（综合）** 现在把这套能力扩展到 Linux。Linux 上有没有类似的"全局加载点"？`/etc/ld.so.preload`、`LD_PRELOAD`、`ld.so.conf` 各自的触发范围是什么？**注意**：已有文章 [Linux 动态链接器路径劫持与 ld.so.cache 投毒检测](go-hids-linux-ld-so-cache-poisoning-detection.md) 讲的是投毒，你在思考的是"全局加载配置"。两者的检测思路有何不同？

**练习 12（复盘）** 回顾这篇文章，列出你认为**最可能在真实客户环境里被误报**的三条规则，并说明你会怎么改。

## 参考资料

- Microsoft Learn — *AppInit DLLs and Secure Boot*：`https://learn.microsoft.com/en-us/windows/win32/dlls/secure-boot-and-appinit-dlls`
- Microsoft Learn — *AppInit DLLs in Windows 7 and Windows Server 2008 R2*：`https://learn.microsoft.com/en-us/windows/win32/win7appqual/appinit-dlls-in-windows-7-and-windows-server-2008-r2`
- Microsoft Learn — *Winlogon*：`https://learn.microsoft.com/en-us/windows/win32/secauthn/winlogon`
- Microsoft Learn — *Registering a Winlogon Notification Package*（`Notify` 子键结构）：`https://learn.microsoft.com/en-us/windows/win32/secauthn/registering-a-winlogon-notification-package`
- Microsoft Learn — *Can't log on to Windows*（KB555648，官方给出的 `Shell` / `Userinit` 默认值）：`https://learn.microsoft.com/en-us/troubleshoot/windows-server/user-profiles-and-logon/cannot-log-on-windows`
- Microsoft Learn — *Black screen after you sign in to the system*（`Shell` 期望值为 `explorer.exe`）：`https://learn.microsoft.com/en-us/troubleshoot/windows-client/shell-experience/scenario-guide-black-screen-after-sign-in`
- Microsoft Learn — *Configuring Windows to automate logon*（Winlogon 键下的自动登录相关值）：`https://learn.microsoft.com/en-us/troubleshoot/windows-server/user-profiles-and-logon/turn-on-automatic-logon`
- MITRE ATT&CK — *T1546.009 AppCert DLLs*：`https://attack.mitre.org/techniques/T1546/009/`
- MITRE ATT&CK — *T1546.010 AppInit DLLs*：`https://attack.mitre.org/techniques/T1546/010/`
- MITRE ATT&CK — *T1547.004 Winlogon Helper DLL*：`https://attack.mitre.org/techniques/T1547/004/`
- Atomic Red Team — *T1546.009 / T1546.010*：`https://github.com/redcanaryco/atomic-red-team`
- Stefan Kanthak — *Prevent Bypass of AppLocker and SAFER*（AppCertDlls 未公开机制的实测分析）：`https://skanthak.homepage.t-online.de/appcert.html`

### 需要在目标主机核验的项

以下内容文中未做实机验证，落到客户环境时请先确认：

- AppInit_DLLs 的 `AppInit_DLLs` 值在目标机上的**实际分隔符形态**（空格 / 逗号混用的情况）。
- 目标机的 Secure Boot 实际状态（可用 `msinfo32` 的 "Secure Boot State" 字段确认），以及该状态下 `AppInit_DLLs` 是否真的不生效。
- `AppCertDlls` 在目标机上的**实际注册表形态**（值名 vs 值数据），以及 Windows 11 上 Protected Process Lite 导致的 Event ID 3033/3089 是否会出现。
- `Winlogon\Notify` 子键在目标机上是否存在，以及是否存在未在微软文档中列出的第三方扩展值。
- 目标机上 `Userinit` 的**确切默认值形态**（是否带结尾逗号、是否被 GPO 改写）。
- HKCU 下的 `Winlogon` 键在目标机上的实际生效范围（不同 Windows 版本可能有差异）。
