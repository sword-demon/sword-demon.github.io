---
title: Go 主机安全面试：Linux 动态链接器路径劫持与 ld.so.cache 投毒检测
date: 2026-11-18 16:40:00
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
- linux
- ld.so
---

# Go 主机安全面试：Linux 动态链接器路径劫持与 ld.so.cache 投毒检测

## 岗位场景

你是云铠主机安全产品的 Go 研发，负责 Linux 主机的"程序加载链路"安全。客户提的问题往往很不直观：

- "我们明明没被入侵，为什么 `/usr/bin/curl` 出来的进程里加载了一个不认识的 `.so`？"
- "攻击者没改任何文件，只是在 `ld.so.conf` 里加了一行目录，你的 EDR 为什么没告警？"
- "客户说机器上装了私有 SDK 放在 `/opt/app/lib`，用 `ldconfig` 加了路径，结果你们的检测天天报，我们怎么解释？"
- "有一台机器 `/etc/ld.so.cache` 的修改时间比 `/etc/ld.so.conf` 还新，是不是 ldconfig 刚跑过？"

这四类问题指向同一个技术面：**动态链接器是 Linux 上"以配置驱动"的一条隐蔽劫持链**。它不像 `/etc/passwd` 那样有明文语义，也不像内核模块那样高调——它藏在一份二进制缓存里，作用范围是**全主机所有动态链接进程**。

这一篇把这条链路拆开讲清楚：加载搜索顺序、`ld.so.conf` 与 `ld.so.cache` 的分工、缓存二进制格式、攻击者的几条劫持路径、可观测信号、Go 侧的实现、误报治理与客户排障。

---

## 背景速览：一次 exec 要过哪几关

`ld.so(8)` 明确写了依赖库的搜索顺序（不含斜杠的 SONAME 才走这套流程）：

| 优先级 | 来源 | 说明 |
| --- | --- | --- |
| 1 | `DT_RPATH` | 二进制里写死的路径，存在 `DT_RUNPATH` 时不生效 |
| 2 | `LD_LIBRARY_PATH` | 环境变量，secure-execution 模式下被忽略 |
| 3 | `DT_RUNPATH` | 只对 `DT_NEEDED` 直接依赖生效，不传递给子依赖 |
| 4 | `/etc/ld.so.cache` | ldconfig 预编译的候选库清单 |
| 5 | 默认路径 | `/lib` 然后 `/usr/lib`（部分 64 位架构是 `/lib64` 然后 `/usr/lib64`） |

三个必须记住的细节：

1. **第 4 步的缓存优先级高于第 5 步的默认路径**。也就是说，只要缓存里有一条 `libcurl.so.4`，加载器就会用它，哪怕 `/usr/lib` 里还有一个同名的。
2. 二进制用 `-z nodefaultlib` 链接时，第 5 步整个跳过。
3. secure-execution 模式（`AT_SECURE` 非 0）下，`LD_LIBRARY_PATH`、`LD_PRELOAD`、`LD_AUDIT` 等变量**失效并被从进程环境里剥离**。

缓存本身是**有序**的：`glibc/elf/dl-cache.c` 的 `search_cache` 注释写得很直白——"The first matching entry in the table is returned"。同名库有多个候选时，谁排在前面谁生效。

---

## 高频面试题

### Q1：`ld.so.conf`、`ld.so.conf.d/`、`ld.so.cache` 三者是什么关系？改完为什么不一定生效？

**简洁答案**

三者是一条"配置 → 编译 → 运行时消费"的链路，各自职责不重叠：

- `/etc/ld.so.conf`：**人类可读的配置**，一行一个库搜索目录，也可以用 `include <glob>` 引入别的文件。
- `/etc/ld.so.conf.d/*.conf`：`include` 展开后的实际内容目录，发行版和第三方 SDK 往这里写私有库路径。
- `/etc/ld.so.cache`：**运行时链接器真正读的东西**，由 `ldconfig` 扫描上述目录后编译出来的二进制清单。

改完 `ld.so.conf` 不生效，是因为**没有任何进程会自动重建缓存**。只有执行 `ldconfig` 才会重新扫描并重写 `/etc/ld.so.cache`。

**关键知识点**

`ld.so.conf(5)` 只说了格式；真正的解析语义要看 glibc 的 `elf/ldconfig.c`，有几个容易踩坑的点：

- `#` 之后的内容**整行截断**（不要求 `#` 在行首）。
- `include` 关键字后面必须跟空白，之后可以跟**多个** glob 模式，用空格或 Tab 分隔。
- 相对 glob 模式按**包含该 `include` 行的配置文件所在目录**解析（`parse_conf_include` 里用 `dirname(config_file)` 拼接），不是按 `ldconfig` 的工作目录。
- `hwcap` 指令在当前 glibc 的 `ldconfig` 里会被**直接忽略并告警**，所以它不会往缓存里贡献目录。

`ldconfig(8)` 还有两条硬约束：它只认 `lib*.so*` 和 `ld-*.so*` 这两类文件名；它期望符号链接呈 `libfoo.so -> libfoo.so.1 -> libfoo.so.1.12` 的层级，不符合这个模式在升级后容易断链。

**Go 落地思路**

Agent 侧要复刻的解析器至少要覆盖上面 4 条语义（尤其是 `#` 截断与相对 include），否则算出来的目录集合和 `ldconfig` 实际用的不一致，差分检测就会全量误报。代码块 1 是这个解析器。

```go
package ldso

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// ConfDirs 解析 ld.so.conf 及其 include 展开结果，返回按出现顺序去重的库搜索目录。
// 语义对齐 ldconfig：'#' 之后为注释；include 后可跟多个 glob 模式；
// 相对模式按"包含该 include 行的配置文件所在目录"解析。
func ConfDirs(confPath string) ([]string, error) {
	seen := map[string]bool{}
	var dirs []string
	add := func(dir string) {
		dir = strings.TrimSpace(dir)
		if dir == "" || seen[dir] {
			return
		}
		seen[dir] = true
		dirs = append(dirs, dir)
	}
	if err := parseConf(confPath, add); err != nil {
		return nil, err
	}
	return dirs, nil
}

func parseConf(path string, add func(string)) error {
	f, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	defer f.Close()

	sc := bufio.NewScanner(f)
	for sc.Scan() {
		line := sc.Text()
		if idx := strings.IndexByte(line, '#'); idx >= 0 {
			line = line[:idx]
		}
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		if fields := strings.Fields(line); fields[0] == "include" && len(fields) > 1 {
			for _, pattern := range fields[1:] {
				if !filepath.IsAbs(pattern) && strings.ContainsRune(path, '/') {
					pattern = filepath.Join(filepath.Dir(path), pattern)
				}
				matches, err := filepath.Glob(pattern)
				if err != nil {
					return fmt.Errorf("glob %q: %w", pattern, err)
				}
				sort.Strings(matches)
				for _, m := range matches {
					if err := parseConf(m, add); err != nil {
						return err
					}
				}
			}
			continue
		}
		add(line)
	}
	return sc.Err()
}
```

---

### Q2：`ld.so.cache` 是什么二进制格式？为什么 Agent 不建议用 `ldconfig -p`？

**简洁答案**

glibc 的 `sysdeps/generic/dl-cache.h` 定义了三代格式，加载器实际能吃两种布局：

- **new 格式**（glibc 2.32 起的默认）：magic `glibc-ld.so.cache` + version `1.1`，头部 48 字节，随后是 `file_entry_new` 数组（每条 24 字节），最后是字符串表。
- **legacy 格式**：magic `ld.so-1.7.0`，头部 15 字节，随后是 `file_entry` 数组（每条 12 字节）。
- **hybrid 布局**：旧格式头部后面又追加了新格式（新格式优先）。

new 格式的 `file_entry_new` 每条 24 字节：`flags`(i32) + `key`(u32) + `value`(u32) + `osversion_unused`(u32) + `hwcap`(u64)。`key` 是 SONAME，`value` 是库的完整路径，两者都是**字符串表偏移**而不是内联字符串。

不用 `ldconfig -p` 的四个理由：

1. `ldconfig` 通常需要 root，且是一个额外子进程。
2. `-p` 的输出是文本快照，**丢失了 `flags` / `hwcap` 等结构化信息**，而这些字段恰恰是判断条目是否被伪造的依据。
3. `ldconfig -c` 支持 `old|new|compat` 三种格式（2.32 起默认 `new`），不同发行版/发行版版本下 `-p` 的输出形态会变，解析要写一堆兼容分支。
4. 子进程执行有 TOCTOU 窗口：读到的文本和磁盘上的二进制文件可能已经不是同一份。

**关键知识点**

new 格式头部第 28 字节是 `flags`，其中低 2 位编码**字节序**：`2` = little endian，`3` = big endian，`0` = 未知，`1` = 无效。解析时必须按它选字节序，否则在跨架构镜像解析时会读出乱码。

另一条硬规则：`elf/dl-cache.c` 里 `_dl_cache_check_flags(flags)` 只接受 `flags == 1` 或 `flags == 3`（`_DL_CACHE_DEFAULT_ID`），其他值的条目会被加载器**直接忽略**。所以伪造缓存时如果 `flags` 填错，这条恶意记录根本不会生效——反过来，我们解析时也应该用同一条规则过滤，否则会报一堆"攻击者其实没生效"的假阳性。

**Go 落地思路**

纯 Go 解析二进制，零外部依赖，同时把字节序判定和 `flags` 合法性校验内置。代码块 2 是解析器。

```go
package ldso

import (
	"encoding/binary"
	"fmt"
)

// CacheEntry 是 ld.so.cache 中的一条库记录，Key 为 SONAME，Value 为库文件路径。
type CacheEntry struct {
	Flags uint32
	Key   string
	Value string
}

// Cache 是解析后的 ld.so.cache。
type Cache struct {
	Format  string // "new"（glibc-ld.so.cache 1.1）或 "legacy"（ld.so-1.7.0）
	Entries []CacheEntry
}

const (
	newCacheHeaderLen = 48
	newCacheEntryLen  = 24
	legacyMagic       = "ld.so-1.7.0"
	legacyHeaderLen   = 15
	legacyEntryLen    = 12
)

// ParseCache 解析 /etc/ld.so.cache 内容，不依赖外部命令。
func ParseCache(data []byte) (*Cache, error) {
	if len(data) >= newCacheHeaderLen && string(data[:len("glibc-ld.so.cache")]) == "glibc-ld.so.cache" {
		return parseNewCache(data)
	}
	if len(data) >= legacyHeaderLen && string(data[:len(legacyMagic)]) == legacyMagic {
		return parseLegacyCache(data)
	}
	return nil, fmt.Errorf("未知的 ld.so.cache 格式")
}

func parseNewCache(data []byte) (*Cache, error) {
	if len(data) < newCacheHeaderLen {
		return nil, fmt.Errorf("缓存过小: %d", len(data))
	}
	order := binary.ByteOrder(binary.LittleEndian)
	switch data[28] & 3 {
	case 2:
		order = binary.LittleEndian
	case 3:
		order = binary.BigEndian
	}
	nlibs := int(order.Uint32(data[20:24]))
	lenStrings := int(order.Uint32(data[24:28]))
	if nlibs < 0 || lenStrings < 0 {
		return nil, fmt.Errorf("缓存头部非法")
	}
	if len(data) < newCacheHeaderLen+nlibs*newCacheEntryLen+lenStrings {
		return nil, fmt.Errorf("缓存被截断")
	}
	strBase := newCacheHeaderLen + nlibs*newCacheEntryLen
	entries := make([]CacheEntry, 0, nlibs)
	for i := 0; i < nlibs; i++ {
		off := newCacheHeaderLen + i*newCacheEntryLen
		raw := data[off : off+newCacheEntryLen]
		key, err := cacheString(data, strBase, lenStrings, int(order.Uint32(raw[4:8])))
		if err != nil {
			return nil, err
		}
		value, err := cacheString(data, strBase, lenStrings, int(order.Uint32(raw[8:12])))
		if err != nil {
			return nil, err
		}
		entries = append(entries, CacheEntry{Flags: order.Uint32(raw[0:4]), Key: key, Value: value})
	}
	return &Cache{Format: "new", Entries: entries}, nil
}

func parseLegacyCache(data []byte) (*Cache, error) {
	order := binary.LittleEndian
	nlibs := int(order.Uint32(data[11:15]))
	if len(data) < legacyHeaderLen+nlibs*legacyEntryLen {
		return nil, fmt.Errorf("缓存被截断")
	}
	strBase := legacyHeaderLen + nlibs*legacyEntryLen
	entries := make([]CacheEntry, 0, nlibs)
	for i := 0; i < nlibs; i++ {
		off := legacyHeaderLen + i*legacyEntryLen
		raw := data[off : off+legacyEntryLen]
		key, err := cacheString(data, strBase, len(data)-strBase, int(order.Uint32(raw[4:8])))
		if err != nil {
			return nil, err
		}
		value, err := cacheString(data, strBase, len(data)-strBase, int(order.Uint32(raw[8:12])))
		if err != nil {
			return nil, err
		}
		entries = append(entries, CacheEntry{Flags: order.Uint32(raw[0:4]), Key: key, Value: value})
	}
	return &Cache{Format: "legacy", Entries: entries}, nil
}

func cacheString(data []byte, base, size, offset int) (string, error) {
	if offset < 0 || offset >= size {
		return "", fmt.Errorf("字符串偏移越界: %d", offset)
	}
	end := base + offset
	for i := end; i < base+size; i++ {
		if data[i] == 0 {
			return string(data[end:i]), nil
		}
	}
	return "", fmt.Errorf("字符串未以 NUL 结尾: %d", offset)
}

// CacheDirs 返回缓存条目中出现过的所有目录（去重且有序）。
func CacheDirs(c *Cache) []string {
	seen := map[string]bool{}
	var dirs []string
	for _, e := range c.Entries {
		dir := dirOf(e.Value)
		if dir == "" || seen[dir] {
			continue
		}
		seen[dir] = true
		dirs = append(dirs, dir)
	}
	return dirs
}
```

---

### Q3：攻击者劫持共享库有哪几条路径？各自的可观测信号是什么？

**简洁答案**

按隐蔽性从低到高排：

| 路径 | 做法 | 可观测信号 |
| --- | --- | --- |
| A. 改配置 | 在 `/etc/ld.so.conf.d/` 加一行目录，再跑 `ldconfig` | 配置文件新增行 + `ldconfig` 进程执行 + 缓存新增该目录 |
| B. 改缓存 | 直接二进制改写 `/etc/ld.so.cache`，不碰任何配置 | 缓存内容与配置目录集合不一致；缓存 mtime 与配置 mtime 关系异常 |
| C. 环境变量 | `LD_PRELOAD` / `LD_LIBRARY_PATH` / `LD_AUDIT` | execve 事件的环境变量；`/proc/<pid>/environ` |
| D. preload 文件 | `/etc/ld.so.preload` | 文件存在性 + 变更事件 |
| E. 二进制内嵌 | 目标程序自带 `RPATH`/`RUNPATH` | ELF 动态段静态分析 |

**路径 B 最值得讲。** 攻击者只要往缓存里追加一条记录：

```
libcurl.so.4  ->  /tmp/.x/libcurl.so.4
```

加载器在第 4 步命中缓存、按"表中第一个匹配项"取到它，于是**所有**链接 `libcurl.so.4` 的程序都会加载攻击者的库——包括 `curl`、`wget`、`git`、`python` 的部分扩展。而整个过程**没有修改任何配置文件**，用"配置文件有没有变"来检测的方案会完全漏报。

**关键知识点**

- 路径 C 受 secure-execution 限制：`AT_SECURE` 非 0 时 `LD_PRELOAD`、`LD_LIBRARY_PATH`、`LD_AUDIT` 失效且被剥离。所以"进程环境里没看到 `LD_PRELOAD`"**不等于**启动时没有——采集时点很关键。
- 路径 D/E 有专门文章覆盖（`go-hids-ld-preload-rootkit-detection.md`），本篇只强调它们和缓存路径的**联动**：三者可以组合成"配置投毒 → 缓存刷新 → 全局生效"的完整链路。

**Go 落地思路**

检测模型应该是"**缓存目录集合 vs 配置目录集合**"的差分，而不是"配置文件是否被改"。

---

### Q4：为什么"缓存里出现了配置之外的目录"是高价值信号？怎么避免误报？

**简洁答案**

因为 `ldconfig(8)` 写死了它的取材范围：命令行给的目录 + `/etc/ld.so.conf` 里的目录 + **可信目录**（`/lib`、`/usr/lib`；x86-64 上 32 位库用这两个，64 位库用 `/lib64`、`/usr/lib64`）。除此之外的目录，正常流程下**不可能**进缓存。

所以 `缓存目录集合 - (配置目录集合 ∪ 可信目录集合)` 的差集，只有三种来源：

1. 有人手工写了缓存（路径 B，恶意或测试）；
2. 历史上某个目录在 `ld.so.conf` 里，后来配置被删但缓存没刷新；
3. 某个第三方工具用了 `ldconfig -C` 之类的方式写了非标准缓存（少见）。

第 2 类是主要的误报来源，靠"配置 mtime 是否晚于缓存 mtime"来区分：配置改过之后没跑 `ldconfig`，差集就会短暂出现。

**关键知识点**

这里有个容易忽略的**误报豁免**：`ld.so.conf.d/` 里放私有库目录（典型如 `/opt/app/lib`、`/usr/local/lib`）是**完全标准的做法**，很多客户环境都有。它不属于"配置之外的目录"，因为它确实在配置目录集合里——所以差分必须严格按集合做，不能用"路径长得像不像系统目录"这种启发式。

另一个误报源是**发行版差异**：某些系统会把 `/usr/lib64`、`/lib64` 写进 `ld.so.conf` 而不是只依赖可信目录。Agent 的可信目录集合必须做成可配置项，而不是硬编码 4 条路径。

**Go 落地思路**

差分结论要三态：干净 / 可疑 / 无法判定。缓存读不出来时是 `unknown`，**不能**判成 clean。

代码块 3 是评估器。

```go
package ldso

import (
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Verdict 是检测结论，必须区分"干净"与"无法判定"。
type Verdict string

const (
	VerdictClean     Verdict = "clean"
	VerdictSuspected Verdict = "suspected"
	VerdictUnknown   Verdict = "unknown"
)

// Assessment 是一次评估的结论与理由。
type Assessment struct {
	Verdict Verdict
	Reasons []string
}

// Assess 关联 ld.so.conf 配置目录与 ld.so.cache 实际目录，给出三态结论。
// trusted 为 ldconfig 内置的可信目录（ldconfig(8): /lib、/usr/lib 等）。
func Assess(confDirs []string, cache *Cache, cacheModTime, newestConfModTime time.Time, trusted []string) Assessment {
	if cache == nil {
		return Assessment{Verdict: VerdictUnknown, Reasons: []string{"ld.so.cache 不可读或格式未知"}}
	}
	known := map[string]bool{}
	for _, d := range append(append([]string{}, confDirs...), trusted...) {
		known[d] = true
	}
	var reasons []string
	for _, dir := range CacheDirs(cache) {
		if !known[dir] {
			reasons = append(reasons, "缓存中出现配置之外的目录: "+dir)
		}
		if reason, ok := riskyDir(dir); ok {
			reasons = append(reasons, reason+" : "+dir)
		}
	}
	if !cacheModTime.IsZero() && !newestConfModTime.IsZero() && cacheModTime.Before(newestConfModTime) {
		reasons = append(reasons, "缓存早于最近一次配置修改，配置变更可能未生效")
	}
	if len(reasons) == 0 {
		return Assessment{Verdict: VerdictClean}
	}
	return Assessment{Verdict: VerdictSuspected, Reasons: reasons}
}

// riskyDir 判断目录是否属于高风险库搜索路径。
func riskyDir(dir string) (string, bool) {
	for _, prefix := range []string{"/tmp", "/var/tmp", "/dev/shm"} {
		if dir == prefix || strings.HasPrefix(dir, prefix+"/") {
			return "临时目录出现在库搜索路径", true
		}
	}
	for _, part := range strings.Split(strings.Trim(dir, "/"), "/") {
		if strings.HasPrefix(part, ".") {
			return "隐藏目录出现在库搜索路径", true
		}
	}
	if fi, err := os.Stat(dir); err == nil && fi.Mode().Perm()&0o022 != 0 {
		return "目录对非 root 可写", true
	}
	return "", false
}

// MissingTargets 返回缓存中指向的、当前并不存在的库文件路径。
func MissingTargets(c *Cache) []string {
	var missing []string
	for _, e := range c.Entries {
		if e.Value == "" {
			continue
		}
		if _, err := os.Stat(e.Value); err != nil && os.IsNotExist(err) {
			missing = append(missing, e.Value)
		}
	}
	return missing
}

func dirOf(path string) string {
	dir := filepath.Dir(path)
	if dir == "." {
		return ""
	}
	return dir
}
```

---

### Q5：怎么判断 `ld.so.cache` 被手工改过？只看 mtime 够吗？

**简洁答案**

不够，但 mtime 依然是最好用的一个信号。要组合三个证据：

1. **时间关系**：缓存 mtime **早于**配置文件 mtime。`ldconfig` 每次都会写出一个全新的缓存文件（`elf/ldconfig.c` 里明确是"先写临时文件再 rename"），所以只要配置改过而缓存没跟上，时间关系一定会露馅。攻击者也可以 `touch` 缓存掩盖，所以这条单独用只是"弱证据"。
2. **集合关系**：缓存目录集合与配置目录集合对不上（Q4 的差分）。
3. **目标关系**：缓存条目指向的库文件**不存在**或**权限异常**。

**关键知识点**

第 3 条叫"影子库"，是攻击链里很实用的一步：

- 攻击者把恶意库放到 `/var/lib/.payload/libfoo.so.1`，然后往缓存里写一条 `libfoo.so.1 -> /var/lib/.payload/libfoo.so.1`。此时告警会响——但真正致命的是下一步：他把 `/usr/lib/libfoo.so.1` 换成软链或直接覆盖。
- 反过来也有一种"预备型"投毒：缓存里已经有指向 `/tmp/.x/libfoo.so.1` 的记录，但文件还没放上去。这时候告警反而是**提前量**，说明攻击者在准备。

还有一种退化情况值得单列：**缓存条目指向的文件被删了**（软件包卸载残留）。这是可用性问题不是安全问题，必须降噪。

权限也是信号：正常库文件一般是 `0755` 且 root 所有。如果缓存指向的库是 `0777`、或属于普通用户，说明有人能在不 root 的情况下替换它。

**Go 落地思路**

`MissingTargets` 负责"目标不存在"的检测；权限检查放在同一轮扫描里做，避免重复遍历。评估逻辑保持纯函数（输入是解析结果和 stat 信息，输出是结论），方便写单测。

---

### Q6：缓存缺失或损坏该怎么判？删掉缓存算不算攻击？

**简洁答案**

算**可用性事件**，不算投毒。`ld.so(8)` 写明，找不到缓存时加载器走第 5 步的默认路径 `/lib`、`/usr/lib`（部分 64 位架构是 `/lib64`、`/usr/lib64`）——**它不会回退到 `ld.so.conf` 里的目录**。

所以：

- 缓存缺失 → 私有库找不到 → 依赖私有库的程序启动失败 → 客户感知是"服务起不来"。
- 攻击面反而**变小了**（`ld.so.conf` 里的目录不再生效）。

但缓存缺失也可能是攻击的一部分（配合后续步骤做"重新生成一份干净缓存"来掩盖痕迹），所以结论应该是 `unknown` 或低危告警，**不能判 clean**，也不能直接判高危。

**关键知识点**

还有一种"格式不认识"的情况：缓存损坏、被截断、magic 不对。此时 `ParseCache` 返回错误，Agent 必须把这种"读不到"表达成 `unknown` 而不是 `clean`——这是所有"以文件为事实来源"的检测项的通用原则。

`ldconfig -c` 支持三种格式（`old` / `new` / `compat`），glibc 2.32 起默认 `new`，之前默认 `compat`。Agent 解析器同时支持 new 和 legacy 两种 magic 正是为了覆盖不同发行版。

**Go 落地思路**

`ParseCache` 的错误路径直接映射到 `VerdictUnknown`，并且原因里带上具体错误（过小 / 截断 / 未知格式），便于客户侧区分"缓存真的没了"和"我们的解析器不兼容"。

---

### Q7：`LD_PRELOAD`、`LD_LIBRARY_PATH`、`LD_AUDIT` 和 `ld.so.conf` 有什么区别？secure-execution mode 是什么？

**简洁答案**

区别在**生效时机与作用域**：

| 手段 | 生效时机 | 作用域 | 是否需要 root |
| --- | --- | --- | --- |
| `ld.so.conf` | 系统级、引导期 | 所有动态链接进程 | 需要（写配置 + 跑 `ldconfig`） |
| `/etc/ld.so.cache` | 系统级、引导期 | 所有动态链接进程 | 需要 |
| `LD_PRELOAD` | 进程启动时 | 当前进程及其子进程 | 不需要，但 secure-exec 下失效 |
| `LD_LIBRARY_PATH` | 进程启动时 | 当前进程及其子进程 | 同上 |
| `LD_AUDIT` | 进程启动时 | 当前进程及其子进程 | 同上 |

secure-execution mode：`ld.so(8)` 规定，`AT_SECURE` 非 0 时，上述环境变量**失效并被从进程环境里剥离**，程序本身都看不到它们。`AT_SECURE` 置位的典型原因：

- 真实 UID 与有效 UID 不同，或真实 GID 与有效 GID 不同（即 setuid/setgid 程序）；
- 非 root 用户执行了一个带 **file capabilities** 的二进制；
- LSM 设置了 `AT_SECURE`。

**关键知识点**

这个机制是**双刃剑**：

- 好的一面：普通用户不能通过环境变量劫持 setuid 程序。
- 坏的一面：你在进程环境里查不到 `LD_PRELOAD`，**不代表**它启动时不存在——它可能已被剥离。所以采集必须发生在 exec 的瞬间（eBPF 挂 `execve` 拿参数与环境），事后读 `/proc/<pid>/environ` 会漏。

**Go 落地思路**

环境变量类信号统一归到"进程启动上下文"证据里，和 execve 事件绑在一起上报，不要单独作为一个文件类告警。secure-execution 场景下的 `AT_SECURE` 可以从 `/proc/<pid>/status` 的 `NoNewPrivs`/capability 字段侧面推断，但结论要写成推断而非事实。

---

### Q8：怎么采集这些文件的变化？inotify / fanotify / auditd 各自的边界？

**简洁答案**

三个采集面各有各的问题：

1. **`/etc/ld.so.conf` 与 `/etc/ld.so.conf.d/`**：用 inotify。对 `/etc/ld.so.conf` 单文件 watch，对 `/etc/ld.so.conf.d/` 整个目录 watch（因为 `include` 是 glob，实际文件集合要展开后才知道，而且新增文件也算配置变更）。
2. **`/etc/ld.so.cache`**：`ldconfig` 是"写临时文件再 rename"覆盖，所以事件是 **`IN_MOVED_TO`** 而不是 `IN_MODIFY`。只监听 `IN_MODIFY` 的实现会**完全收不到缓存变更**。这个细节是很多实现漏报的原因。
3. **谁触发的**：关联 `ldconfig` 进程的 execve 事件。没有对应进程的 `IN_MOVED_TO`，就是"有人绕过 `ldconfig` 直接写了缓存"——这是路径 B 的强信号。

fanotify 在这里基本不适用：它对**本机自己生成**的文件不可靠，而 `ld.so.cache` 恰恰是本机生成的。auditd 适合补 `ldconfig` 执行审计和配置目录写审计。

**关键知识点**

inotify 的已知局限：

- 受 `max_user_watches` 限制，全量 watch 目录容易耗尽；
- **不递归**，子目录要单独 watch；
- 事件与"谁干的"之间没有直接关联，必须和进程事件做时间窗关联；
- 队列溢出（`IN_Q_OVERFLOW`）后必须走一次全量扫描兜底。

**Go 落地思路**

推荐"**事件触发 + 周期全量**"双轨：inotify 只负责把采集延迟从分钟级压到秒级，正确性由每 N 分钟的一次全量解析保证。事件消息里带上 `IN_MOVED_TO` 这类标志位，上报时保留原始 flags，方便客户侧复核。

---

### Q9：合法变更怎么降噪？软件包升级会重写缓存啊。

**简洁答案**

降噪要落在**"只对增量敏感"**上，而不是"内容变了就报"。

1. **只看增量**：只关注"缓存目录集合中**新增**的目录"和"新增的、指向高危路径的条目"。缓存里条目消失、库文件数量变化，都是软件包升级的正常结果。
2. **归属到包管理器**：用 `rpm -qf /etc/ld.so.cache`、`dpkg -S /etc/ld.so.cache` 判断文件属于哪个包；由包管理器触发的变更降级。注意 `ld.so.conf.d/` 下的第三方配置文件通常**不属于任何包**，需要单独的白名单机制。
3. **时间窗关联**：软件包安装事件（rpm/dpkg transaction）之后 N 分钟内的缓存刷新，降级为"变更回溯"而非"攻击"。
4. **可信目录集合可配置**：不同发行版的可信目录不一样，硬编码会误报。

**关键知识点**

降噪的反面是**漏报**。一个常见的翻车做法是"只要缓存变了就报，报告后再人工过滤"——这会让规则在上线第一天就被关掉。正确的做法是在**检测侧**就把噪声消掉：告警内容里带上"新增目录 / 新增条目 / 指向高危前缀 / 目标缺失"这几类结构化字段，让客户一眼能看出告警级别为什么是这一档。

还有一个降噪抓手：**缓存内容哈希基线**。首次采集时记录 `ld.so.cache` 的哈希，后续只在"哈希变了但配置没变"时报——这一条几乎零误报，因为配置没变却缓存变了，要么是有人手工写了缓存，要么是 `ldconfig` 被替换成了恶意版本。

**Go 落地思路**

Agent 侧维护一张 `可信目录 -> 归因方式` 的策略表，配置化下发，不要硬编码。评估器的入参保持可注入（`trusted` 参数），这样策略更新不需要改代码。

---

### Q10：给你一台主机，怎么在 5 分钟内判断"是否被投毒"？

**简洁答案**

一条五步流水线：

1. **读配置面**：解析 `/etc/ld.so.conf` + `ld.so.conf.d/` 展开结果 → 配置目录集合 `C`。
2. **读缓存面**：`os.ReadFile("/etc/ld.so.cache")` + `ParseCache` → 缓存条目集合 `K`、缓存目录集合 `D`。
3. **差分**：`D - (C ∪ trusted)` = 可疑目录集合。这一步是整条链路的核心。
4. **风险评级**：
   - 可疑目录落在 `/tmp`、`/var/tmp`、`/dev/shm`、隐藏目录、或对非 root 可写 → 高危；
   - 只是配置外目录（例如历史遗留）→ 中危，需人工确认；
   - 目录本身合规，但缓存条目 `flags` 不为 1/3 → 伪造条目，中危。
5. **交叉验证**：
   - 缓存 mtime vs 配置 mtime；
   - `MissingTargets`：条目指向的文件是否缺失；
   - 目标文件的属主/权限/是否为符号链接；
   - 最近 N 分钟内有没有 `ldconfig` 的 execve 事件（解释这次缓存更新是谁干的）。

最后输出三态结论 + 证据包（配置原文、缓存解析结果、差集、时间线）。

**关键知识点**

三态在这里是刚需：

- `clean`：缓存可读、差集为空、时间关系正常、目标齐全。
- `suspected`：差集非空或时间关系异常或有条目异常。
- `unknown`：缓存读不出、格式不认识、被截断，或采集组件本身降级了。

把 `unknown` 当成 `clean` 上报，代价是整条规则失去可信度；把 `unknown` 当成 `suspected`，代价是噪声。正确做法是单独统计 unknown 比例，作为采集健康度指标上报。

**Go 落地思路**

流水线要写成"**纯函数 + 薄 I/O 层**"：解析和判定是纯函数（输入字节和 stat 信息，输出结论），I/O 层只负责取文件、取 mtime、读 `/proc`。这样判定逻辑可以完整单测，I/O 出问题时也能把结论降级成 unknown 而不是崩掉。

---

### Q11：`ld.so.cache` 里的 `flags` 字段具体是什么？伪造时有什么坑？

**简洁答案**

`file_entry.flags` 是一个 `int32`，`glibc/elf/dl-cache.h` 与 `elf/dl-cache.c` 给出了它的语义与约束：

- `1` = 这是一个 ELF 库；
- `3`（`_DL_CACHE_DEFAULT_ID`）= 默认 ID，同样是合法的库条目；
- 其他值 = **加载器会忽略这条记录**（`_dl_cache_check_flags`）。

因此伪造缓存条目时，`flags` 必须填 1 或 3 才生效——这也给了检测侧一个免费的过滤条件。

**关键知识点**

new 格式还多了两个字段：

- `osversion_unused`：内核要求的最低 ABI 版本，当前实现里未使用。
- `hwcap`：硬件能力标记。其中 `DL_CACHE_HWCAP_EXTENSION`（`1ULL << 62`）表示低 32 位是 `glibc-hwcaps` 扩展段的索引；高 32 位是 ISA level 计数（掩码 `DL_CACHE_HWCAP_ISA_LEVEL_MASK`，10 位）。`ld.so(8)` 也提到"装在硬件能力目录里的共享对象会被优先选中"——这是 `hwcap` 机制的运行时表现。

解析这两个字段时不需要理解全部语义，但**不能读错偏移**：`file_entry_new` 是 24 字节，不是 old 格式的 12 字节。偏移读错会静默解析出"看起来合理但全是错的"结果，这是这类解析器最危险的失败模式——**宁可报错，不要静默出错**。

**Go 落地思路**

解析器在读任何字符串偏移前，先做 `offset < lenStrings` 的边界检查（代码块 2 的 `cacheString`），越界直接返回错误而不是截断字符串。

---

### Q12：这条检测和别的检测点怎么配合？

**简洁答案**

三条最有价值的联动：

1. **和 `LD_PRELOAD` 检测联动**（`go-hids-ld-preload-rootkit-detection.md`）：两者是不同的注入面，但常常同时出现。`/etc/ld.so.preload` + 缓存投毒 = 同一批攻击者的两条腿。
2. **和包完整性检测联动**（`go-hids-linux-package-integrity-hook-tamper-detection.md`）：`/etc/ld.so.cache` 和 `ld.so.conf` 都归包管理器管。用 `dpkg -S` / `rpm -qf` 判断归属，能把"包管理器拥有的文件被改了"和"包管理器不认识的文件被加了"区分开，误报量能降一个数量级。
3. **和运行时采集联动**（`go-hids-process-thread-syscall-collection.md`、`go-hids-ebpf-exec-connect.md`）：真正确认投毒的最强证据，是"某个进程实际加载了缓存里那条可疑库"。可以从 `/proc/<pid>/maps` 里读已映射的库路径，和缓存条目做交集。

**关键知识点**

一条实用的**降噪增强**：把"缓存里存在的可疑目录"和"运行中有进程从该目录映射了库"两个信号叠加。前者是配置面证据（可疑但不确定），后者是运行时证据（确定在生效），两者叠加再出告警，误报会大幅下降。

**Go 落地思路**

映射关系可以从 `/proc/<pid>/maps` 解析（纯 Go，读文本即可，无需外部依赖），按目录聚合，反查可疑目录。这是最后一道确认，也是最贵的一道——建议只对前两步已经标记为可疑的目录做定向检查，而不是全量扫所有进程的 maps。

---

## Go 落地思路小结

整条检测链路在 Go 侧可以拆成四层，每层都可独立单测：

| 层 | 职责 | 关键实现 |
| --- | --- | --- |
| 解析层 | `ld.so.conf` + `ld.so.cache` → 结构化数据 | `ConfDirs` / `ParseCache`，纯函数 + 字节输入 |
| 采集层 | 读文件、读 mtime、收 inotify 事件 | I/O 薄层，失败一律转成 unknown |
| 判定层 | 差分、风险评级、三态结论 | `Assess`，入参可注入、可配置 |
| 证据层 | 组装告警载荷 | 结构化字段：新增目录 / 异常条目 / 时间关系 / 缺失目标 |

三条工程纪律：

1. **解析器必须对损坏输入报错，不能静默返回空结果。** 空结果会被上层当成"缓存是空的=干净"，这是最典型的假阴性来源。
2. **结论永远是三态。** `unknown` 要单独统计并上报，这是采集健康度指标。
3. **判定逻辑不碰 I/O。** 所有判定函数入参是已解析好的数据和 stat 结果，这样单测能覆盖真实的边界（空缓存、截断缓存、legacy 格式、相对 include）。

---

## 小练习 / 复盘题

1. 按 `ld.so(8)` 的顺序写出动态链接器的 5 级搜索路径，并说明 `DT_RPATH` 与 `DT_RUNPATH` 同时存在时哪个生效、为什么。
2. 为什么 `ld.so.conf` 里加了目录但程序还是加载不到库？请从"谁负责重写缓存"和"缓存的生效点"两个角度回答。
3. `ldconfig` 只处理哪两类文件名？为什么 `libfoo.so` 必须指向 SONAME 而不是直接指向版本文件？
4. 写出 `ld.so.cache` new 格式的头部字段布局（含每个字段的字节数与偏移），并说明 `flags` 字节如何指示字节序。
5. glibc 的 `_dl_cache_check_flags` 接受哪两个值？如果攻击者伪造缓存条目时把 `flags` 填成 2，会发生什么？
6. 攻击者在 `/etc/ld.so.conf.d/x.conf` 里加了 `/opt/evil/lib`，但**没有**跑 `ldconfig`。此时 `ldconfig -p` 里能看到这条吗？程序会加载攻击者的库吗？
7. 攻击者不碰任何配置，直接把 `libcurl.so.4 -> /tmp/.x/libcurl.so.4` 写进 `/etc/ld.so.cache`。请说明：① 哪些进程会受影响；② 为什么"配置文件没被改"的检测方案会漏报；③ 你的差分检测会给出什么结论。
8. 客户机器上 `ld.so.cache` 的 mtime 比 `ld.so.conf` 旧了 3 个月。这个结论能直接判高危吗？还需要哪两个证据才能定性？
9. `ld.so.cache` 里有一条记录指向 `/var/lib/.payload/libfoo.so.1`，但这个文件现在不存在。请给出你的结论、级别，以及它可能对应攻击链的哪一步。
10. `ldconfig` 是"写临时文件再 rename"覆盖缓存的。你的 inotify 监听只订阅了 `IN_MODIFY`，请解释会漏掉什么，以及应该订阅哪些事件。
11. 一台机器上 `ld.so.conf.d/` 里有 12 个第三方目录（含 `/opt/app/lib`），检测一直报"缓存目录不在配置内"。请给出至少两个可能的原因，并说明你的代码应该怎么改。
12. 设计一个规则：检测 `/etc/ld.so.cache` 被非 `ldconfig` 进程改写。给出你的数据来源、判定条件，以及如何避免软件包升级期间的误报。
13. 解释 `AT_SECURE` 是什么，以及为什么"事后读 `/proc/<pid>/environ` 查 `LD_PRELOAD`"这种采集方式在 setuid 程序上会漏报。
14. 写一段 Go 代码，解析 `ld.so.cache` 并输出"SONAME -> 路径"映射，要求：识别 new/legacy 两种格式、按 `flags` 字节选择字节序、字符串偏移越界时返回错误而不是截断。至少写 3 个边界用例的单测。

---

## 参考资料

1. [Linux man-pages：ld.so(8)](https://man7.org/linux/man-pages/man8/ld.so.8.html) —— 5 级搜索顺序、`DT_RPATH`/`DT_RUNPATH` 差异、`AT_SECURE` 与 secure-execution mode、被剥离的环境变量清单
2. [Linux man-pages：ldconfig(8)](https://man7.org/linux/man-pages/man8/ldconfig.8.html) —— 可信目录、只处理 `lib*.so*` 与 `ld-*.so*`、符号链接层级要求、`-c old|new|compat`（2.32 起默认 new）、`/etc/ld.so.cache` 与 `/etc/tunables.conf` 的关系
3. [Linux man-pages：ld.so.conf(5)](https://man7.org/linux/man-pages/man5/ld.so.conf.5.html) —— 每行一个目录、`include` + glob(7) 指令
4. [glibc 源码：`sysdeps/generic/dl-cache.h`](https://raw.githubusercontent.com/bminor/glibc/master/sysdeps/generic/dl-cache.h) —— `CACHEMAGIC`/`CACHEMAGIC_VERSION_NEW`、`struct cache_file`、`struct cache_file_new`（48 字节头部）、`struct file_entry_new`、`DL_CACHE_HWCAP_EXTENSION`
5. [glibc 源码：`elf/dl-cache.c`](https://raw.githubusercontent.com/bminor/glibc/master/elf/dl-cache.c) —— 三种缓存布局的识别、`search_cache` 的二分查找与"第一个匹配项"语义、`_dl_cache_check_flags`
6. [glibc 源码：`elf/ldconfig.c`](https://raw.githubusercontent.com/bminor/glibc/master/elf/ldconfig.c) —— 配置解析语义（`#` 截断、`include` 多模式、相对模式按配置文件目录解析、`hwcap` 指令被忽略）、临时文件 rename 覆盖缓存
7. [同站文章：Go 主机安全面试：Linux LD_PRELOAD 与 rootkit 检测](go-hids-ld-preload-rootkit-detection.md) —— 运行时注入面
8. [同站文章：Go 主机安全面试：Linux 软件包完整性校验与包管理器 Hook 篡改检测](go-hids-linux-package-integrity-hook-tamper-detection.md) —— 包归属归因与降噪
