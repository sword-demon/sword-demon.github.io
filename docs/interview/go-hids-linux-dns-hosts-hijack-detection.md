---
title: Go主机安全面试：Linux DNS 配置与 hosts 劫持检测
date: 2026-08-26 17:01:30
categories:
- Interview
tags:
- go
- interview
- security
- hids
- edr
- linux
- dns
- detection
---

# Go 主机安全面试：Linux DNS 配置与 hosts 劫持检测

主机被入侵后，攻击者不一定直接改防火墙或发起异常外联，也可能先篡改域名解析链路：修改 `/etc/hosts` 把安全产品、软件源、业务域名指向恶意地址；替换 `/etc/resolv.conf` 让 DNS 查询走攻击者控制的服务器；调整 `nsswitch.conf` 改变解析优先级；或者利用 `systemd-resolved`、NetworkManager、容器网络配置制造只在特定进程或命名空间内生效的解析劫持。面试官通常会追问：DNS 隧道和 DNS 配置劫持有什么区别？Go Agent 怎么发现“谁改了什么”？怎样避免把云初始化、VPN 和容器运行时误报成攻击？

## 岗位场景

```text
Linux 主机
  -> 采集 /etc/hosts、/etc/resolv.conf、nsswitch.conf、resolved/NetworkManager 配置变化
  -> 解析 nameserver、search domain、hosts 静态映射、解析优先级和符号链接目标
  -> 关联修改进程、用户、父进程、容器命名空间、软件源访问和安全 Agent 上报失败
  -> 识别安全域名劫持、软件源投毒、内网域名重定向和恶意 DNS 服务器
  -> 区分 DHCP、云初始化、VPN、容器 runtime、运维变更和真实攻击
```

这类题考的是 Linux 名称解析链路、关键配置基线、文件事件采集、进程归因、误报治理和 Go Agent 的低成本差异计算能力。它和 DNS 隧道检测不同：DNS 隧道关注查询行为和流量特征，本题更关注解析控制面被篡改后造成的攻击面。

## 高频面试题

### 1. 为什么 DNS 配置和 `/etc/hosts` 篡改属于主机安全检测重点？

简洁答案：域名解析决定“同一个域名最终连到哪里”。攻击者篡改解析链路后，可以让安全产品上报失败、把软件更新源指向恶意站点、拦截内网服务访问，或者让后续 C2 通信看起来像访问正常域名。

关键知识点：

- `/etc/hosts` 的静态映射通常优先级很高，能绕过正常 DNS 查询。
- `/etc/resolv.conf` 决定 DNS 服务器、搜索域、超时和轮询行为。
- `/etc/nsswitch.conf` 决定 `files`、`dns`、`myhostname` 等解析来源的顺序。
- `systemd-resolved`、NetworkManager、DHCP client、VPN client 可能自动改解析配置，是误报高发来源。
- 攻击价值不在“文件被改”本身，而在“关键域名被重定向到不可信地址”。

Go 落地思路：

- 对关键解析文件做基线快照，记录 hash、mtime、owner、mode 和结构化内容。
- 文件变化后输出字段级 diff，例如新增了哪个 hostname 映射、nameserver 从哪里变到哪里。
- 把配置变化和进程执行、网络连接、Agent 上报失败、软件安装事件放进同一时间窗口。

### 2. DNS 隧道检测和 DNS 配置劫持检测有什么区别？

简洁答案：DNS 隧道检测主要看“查询内容是否像数据外传或 C2”；DNS 配置劫持检测主要看“解析链路是否被人改到异常方向”。前者偏流量行为，后者偏控制面完整性。

关键知识点：

| 方向 | 关注点 | 典型证据 |
| --- | --- | --- |
| DNS 隧道 | 长子域、高熵、NXDOMAIN、高频查询 | DNS query、qtype、rcode、进程 |
| hosts 劫持 | 静态域名映射被新增或替换 | `/etc/hosts` diff、目标 IP |
| resolver 劫持 | DNS 服务器变成陌生地址 | `nameserver` diff、修改进程 |
| 解析优先级篡改 | 优先查本地文件或异常模块 | `nsswitch.conf` diff |
| 命名空间劫持 | 只影响容器或特定网络 namespace | mount/ns、container id |

Go 落地思路：

- 不把所有 DNS 相关告警塞进一个规则，事件类型可拆成 `dns_tunnel`、`resolver_tamper`、`hosts_hijack`。
- 对配置劫持保留“修改动作”和“解析结果变化”两类证据。
- 告警解释要说明风险域名、旧解析、新解析、修改主体和影响范围。

### 3. `/etc/hosts` 检测要重点看哪些变化？

简洁答案：重点看安全产品域名、软件源域名、业务核心域名、云服务域名和常见公网域名被映射到私网、回环、保留地址或陌生公网 IP；也要关注大量新增映射、注释伪装和权限异常。

关键知识点：

- `127.0.0.1 security-vendor.example` 可能让 Agent 更新或上报失败。
- 软件源域名被改到陌生 IP，可能导致后续安装恶意包。
- 内网服务域名被改到攻击者控制 IP，可能造成凭据劫持。
- hosts 文件里可能出现重复域名，后出现的记录不一定按所有工具的直觉生效。
- 文件 owner、mode、ctime、inode 变化也能辅助判断是否被替换。

Go 落地思路：

- 解析 hosts 时忽略空行和纯注释，但保留原始行号，方便复盘。
- 对 hostname 做小写归一化，对 IP 使用 `net/netip` 解析，避免字符串误判。
- 为关键域名维护轻量级规则集，先覆盖安全产品、包管理源、云元数据相关域名和企业自定义域名。

```go
type HostsEntry struct {
	Line int
	IP   string
	Names []string
	Raw  string
}
```

### 4. `/etc/resolv.conf` 为什么不好直接按文件内容判断？

简洁答案：很多 Linux 发行版里 `/etc/resolv.conf` 可能是符号链接，真实内容由 `systemd-resolved`、NetworkManager、DHCP 或容器运行时生成。只看这个文件的一次内容，容易漏掉真实来源，也容易把正常网络切换误报成攻击。

关键知识点：

- `/etc/resolv.conf` 可能指向 `/run/systemd/resolve/stub-resolv.conf` 或 NetworkManager 生成文件。
- DHCP 续租、VPN 上线、Wi-Fi 切换、容器启动都可能改变 nameserver。
- `search` 和 `options ndots` 会影响短域名解析路径，可能造成流量走向变化。
- 恶意 nameserver 不一定是公网地址，也可能是同网段里的中间人主机。
- 解析配置的影响范围要结合 network namespace 和 mount namespace 判断。

Go 落地思路：

- 同时记录 `/etc/resolv.conf` 的 `lstat`、符号链接目标和真实文件内容 hash。
- 对 nameserver 做分类：回环、本机 stub、内网、云厂商、企业基线、陌生公网。
- 对配置变更设置稳定窗口，例如短时间内重复 DHCP 刷新只聚合成一次低风险事件。

### 5. 怎样给 DNS 配置变更做进程归因？

简洁答案：仅靠文件最终状态无法回答“谁改的”。需要采集文件写入、rename、chmod、chown、符号链接替换等事件，并关联执行进程、父进程、用户、命令行和容器上下文。

关键知识点：

- 攻击者常用 `echo >> /etc/hosts`、`sed -i`、`cp`、`mv`、`ln -sf`、脚本批量替换。
- 合法组件可能是 `dhclient`、`NetworkManager`、`systemd-resolved`、`resolvconf`、VPN client。
- 只采 inotify 可能看到文件变了，但拿不到可靠进程；audit/eBPF 能补充主体信息。
- 原子替换会表现为临时文件写入后 rename 到目标路径。
- 容器内修改的 `/etc/hosts` 不一定影响宿主机，需要区分 mount namespace。

Go 落地思路：

- 事件模型保留 `pid`、`ppid`、`start_time`、`uid`、`exe`、`cmdline`、`mnt_ns`、`net_ns`。
- 对 `rename` 场景同时记录 old path 和 new path，避免只看到目标文件变更。
- 进程归因失败时明确标记 `attribution=unknown`，不要伪造成系统进程。

```go
type ResolverChange struct {
	Path       string
	Action     string
	PID        int
	ProcessKey string // pid + process start time
	OldHash    string
	NewHash    string
	Diff       []string
}
```

### 6. 如何降低 DHCP、VPN、容器和云初始化带来的误报？

简洁答案：误报治理不能只靠进程名白名单，要把“谁改、什么时候改、改了什么、是否符合主机角色和变更窗口”组合起来判断。合法组件也只能在合理范围内降权，不能无限信任。

关键知识点：

- DHCP 和 NetworkManager 常改 nameserver，但一般不会把安全产品域名写进 `/etc/hosts`。
- VPN 上线可能新增企业 DNS、search domain 和 split DNS，应结合 VPN 进程、路由变化和用户会话。
- 容器运行时会为容器生成 `/etc/hosts` 和 resolver 文件，影响范围通常在容器 namespace 内。
- cloud-init 多发生在启动阶段，长期运行后突然改解析配置更可疑。
- 企业环境应支持客户配置可信 DNS、可信域名和变更时间窗。

Go 落地思路：

- 白名单条件至少包含进程路径、签名或 hash、父进程、用户、时间窗口和修改字段。
- 对合法组件改到陌生公网 DNS 仍保留中低风险事件，避免被进程名绕过。
- 以主机角色做基线：办公终端、Kubernetes 节点、云服务器、数据库服务器的正常模式不同。

### 7. 发现安全 Agent 上报域名被劫持后，告警应如何解释？

简洁答案：告警要能回答五个问题：哪个域名被劫持、解析到哪里、由谁修改、影响了哪些后续连接、是否导致上报失败。只说“hosts 文件异常”对客户处置帮助很小。

关键知识点：

- 安全产品域名被指向 `127.0.0.1`、`0.0.0.0`、保留地址或陌生 IP，通常风险较高。
- 如果随后出现 Agent upload timeout、TLS 握手失败或连接到异常 IP，证据更强。
- 需要避免上报敏感 token、证书私钥或完整业务域名清单。
- 告警应给出处置建议：恢复配置、检查修改进程、排查父进程、核查软件源和代理设置。
- 事件时间线比孤立字段更容易让客户复盘。

Go 落地思路：

- 维护关键域名类别，例如 `agent_upload`、`agent_update`、`package_repo`、`cloud_api`。
- 关联窗口内的连接失败、HTTP/TLS 错误、进程启动和文件落地事件。
- 告警 reason 使用可验证事实，不使用“疑似黑客”这类不可验证结论。

### 8. 规则引擎里如何表达这类检测，既具体又不僵硬？

简洁答案：把规则拆成事实条件、风险权重和抑制条件。事实条件保证可解释，权重适配不同环境，抑制条件用于处理合法网络组件和变更窗口。

关键知识点：

- 单一条件“修改 `/etc/resolv.conf`”太粗，适合低危审计事件，不适合直接高危告警。
- 高风险组合通常是：异常主体修改解析配置 + 关键域名受影响 + 后续连接或上报失败。
- 抑制条件要可审计，不能把所有 `NetworkManager` 行为直接丢弃。
- 规则输出应包含命中的字段、差异和抑制原因，便于白盒测试和客户排障。
- 对规则做离线回放，能用真实客户样本调整阈值和白名单。

Go 落地思路：

- 用结构化事件进入规则引擎，避免规则直接解析原始文件文本。
- 配置热更新要做版本号和灰度，避免错误规则在全量主机上放大误报。
- 保留命中链路：`file_change -> config_diff -> affected_domain -> network_failure`。

```go
func highRiskResolverTamper(c ResolverChange) bool {
	return containsCriticalDomain(c.Diff) &&
		changedByUnexpectedProcess(c.ProcessKey) &&
		hasNetworkFailureAfter(c.ProcessKey)
}
```

## 通俗答案

可以把主机域名解析理解成“电话簿”。DNS 隧道像是有人用电话簿查询过程偷偷传纸条；DNS 配置和 hosts 劫持则是有人直接把电话簿改了，让你拨正常名字时接到错误号码。主机安全 Agent 要做的不是看到电话簿变化就立刻高危，而是看谁改的、改了哪些重要联系人、号码是否可信、改完之后有没有造成更新失败、凭据访问或异常外联。

## Go 落地设计要点

- 采集层：监听 `/etc/hosts`、`/etc/resolv.conf`、`/etc/nsswitch.conf`、`/etc/systemd/resolved.conf`、NetworkManager 配置目录和关键符号链接变化。
- 解析层：把 hosts、nameserver、search domain、options、解析顺序转成结构化字段。
- 归因层：优先用 audit/eBPF 采写入主体，退化时用文件状态 diff 和邻近进程事件做弱关联。
- 规则层：按关键域名、陌生 DNS、异常进程、命名空间、变更窗口和后续网络结果组合评分。
- 降噪层：对 DHCP、VPN、cloud-init、容器 runtime 做有边界白名单，并保留命中与抑制原因。
- 上报层：只上报必要证据和 hash，不上传完整敏感域名清单或凭据内容。

## 学习要点

- 理解 Linux 名称解析链路：`hosts`、`resolv.conf`、`nsswitch.conf`、本地 stub resolver。
- 熟悉文件事件中的 write、rename、chmod、chown、symlink 替换和原子更新。
- 掌握 Go 中 `os.ReadFile`、`os.Lstat`、`filepath.EvalSymlinks`、`net/netip` 的基础用法。
- 能把配置 diff、进程归因、网络结果和攻击链上下文串成可解释告警。
- 知道误报来源：DHCP、VPN、NetworkManager、systemd-resolved、cloud-init、容器运行时。
- 设计规则时坚持结构化输入、可审计白名单、离线回放和灰度发布。

## 小练习/复盘题

1. 设计一个 hosts 解析函数，要求保留原始行号，并能识别同一 hostname 的多次映射。
2. 给出三条高风险 hosts 变更规则，分别覆盖安全 Agent 域名、软件源域名和企业核心域名。
3. 如果 `/etc/resolv.conf` 是符号链接，你会记录哪些字段来避免误判？
4. 如何区分 VPN 正常上线带来的 DNS 变化和攻击者替换 DNS 服务器？
5. 只有文件 hash 变化、没有进程归因时，告警应该怎样降级和补证？
6. 为 `resolver_tamper` 设计一组离线回放样本，至少包含正常 DHCP、容器启动、恶意 hosts 劫持和恶意 nameserver 替换。
