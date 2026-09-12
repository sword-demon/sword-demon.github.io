---
title: 后缀数组（Suffix Array）
description: 后缀数组（Suffix Array）详解：倍增算法 O(n log n) 构建 + LCP 数组 + Kasai 算法，TypeScript/Python/Go 多语言实现
date: 2026-09-12 09:00:49
categories:
  - Algorithm
tags:
  - suffix-array
  - string-matching
  - pattern-matching
  - lcp-array
  - string
  - interview
sidebarSort: 82
---

# 后缀数组（Suffix Array）

面试官又出招了："给你一个 10 万字符的文本串 `s`，再给你一个模式串 `p`，要在 `s` 中找 `p` 出现的所有位置，要求**时间复杂度 O(n log n + m)** 左右，n 是 s 的长度，m 是 p 的长度。你怎么办？"

你脱口而出：KMP 啊，O(n+m)！但面试官皮笑肉不笑地说："如果我要的不是单模式匹配，而是**任意子串查询**——比如在线索聊天系统里，输入 `s`，秒级返回所有以 `s` 为前缀的单词，或者统计某个子串在文本里出现了几次、出现位置呢？"

这就不是 KMP 能搞定的事了。你需要的是一个**支持任意子串查询**的数据结构。**后缀数组（Suffix Array）** 就是为这种场景量身定做的——它建一次索引，能回答几十种字符串问题，是字符串领域的"瑞士军刀" 🛠️。

## 为什么需要后缀数组？

先来点场景：

- 🧬 **生物信息学**：在 DNA 序列里查找特定基因片段
- 🔍 **全文检索**：Elasticsearch、Lucene 内部就用到了后缀数组的亲戚（FST / 倒排索引）
- 📖 **论文查重**：快速判断两个文档有没有共同的子串
- 📜 **最长重复子串**：给定一个字符串，找出其中重复出现多次的最长子串
- 💬 **聊天搜索**：输入"今天"瞬间列出所有包含"今天"的句子

这些问题如果每次都从头做字符串匹配，复杂度会爆炸。但如果**预处理**一次文本，建好后缀数组，很多查询能降到 **O(m log n)** 甚至 **O(m)**。

## 原理拆解

### 1. 什么是后缀数组？

给定字符串 `s = "banana"`，它的所有后缀是：

```
s[0..] = "banana"
s[1..] = "anana"
s[2..] = "nana"
s[3..] = "ana"
s[4..] = "na"
s[5..] = "a"
```

把这些后缀按字典序排序，记录排序后每个后缀的起始位置，就是**后缀数组** `sa`：

```
排序后:  ["a", "ana", "anana", "banana", "na", "nana"]
        ↑     ↑       ↑        ↑        ↑     ↑
sa:    [5,    3,      1,       0,       4,    2]
```

就这么简单！但问题是——怎么高效地排这些后缀？

### 2. 朴素做法：直接排序

你可能第一反应是：把每个后缀字符串存出来，用 `Array.sort()` 排序。思路没错，但有问题：

- 后缀字符串总长度是 `n + (n-1) + (n-2) + ... + 1 = n(n+1)/2 ≈ O(n²)`
- 比较两个后缀字符串平均要 O(n) 次
- 总复杂度 **O(n² log n)**，n=10 万的时候根本跑不动

所以我们需要更聪明的排序：**倍增算法**（Prefix Doubling），让复杂度降到 **O(n log² n)** 甚至 **O(n log n)**。

### 3. 倍增算法（Prefix Doubling）

核心思想：**先比较前 1 个字符，再比较前 2 个、前 4 个、前 8 个……直到所有后缀都被唯一区分**。

来看 `s = "banana"` 的过程：

```
第 1 轮：只看第 1 个字符，按它分组
后缀            首字符    rank
"banana" (0)     b         1
"anana"  (1)     a         0
"nana"   (2)     n         3
"ana"    (3)     a         0  ← 和 "anana" 相同！
"na"     (4)     n         3  ← 和 "nana" 相同！
"a"      (5)     a         0  ← 和上面两个相同！

按 (rank[0], rank[1]) 排序，但 rank[1] 没有定义 → 视为 -1 / 最小
```

这样第 1 轮没法区分"anana"、"ana"、"a"三个都以 'a' 开头的后缀。怎么办？**再加上第 2 个字符一起作为排序键**——这就是"倍增"。

```
第 2 轮：按 (rank[i], rank[i+1]) 的元组排序
后缀(i)         首字符  第二字符    元组         新rank
"banana" (0)     b      a         (1, 0)         2
"anana"  (1)     a      n         (0, 3)         1
"nana"   (2)     n      a         (3, 0)         3
"ana"    (3)     a      n         (0, 3)         1  ← 和 "anana" 相同！
"na"     (4)     n      (无)      (3, -1)        4
"a"      (5)     a      (无)      (0, -1)        0

排序后：a < anana < ana < banana < na < nana
sa:    [5,     1,      3,    0,       4,   2]
```

第 2 轮还是没区分开"anana"和"ana"——继续倍增到第 4 个字符：

```
第 3 轮：按 (rank[i], rank[i+1], rank[i+2], rank[i+3]) 排序
后缀(i=1) "anana"，rank = [0, 3, 0, 3, 0, ?]
后缀(i=3) "ana"，  rank = [0, 3, 0, ?, ?]

元组(1)=(0,3,0,3,0,-1) 和 元组(3)=(0,3,0,-1,-1,-1)
它们不一样了！

继续排序后：a < ana < anana < banana < na < nana
sa:    [5,    3,     1,      0,        4,   2]   ✅
```

完美！每个后缀都被唯一区分了。

**收敛条件**：当某一轮所有后缀的 rank 都不重复时，就说明排序完成。本例中第 3 轮就收敛了。

### 4. 时间复杂度分析

- 一共做 `log n` 轮（每次长度翻倍）
- 每轮用计数排序 O(n)，比较元组 O(1)
- 总复杂度 **O(n log n)** 🎉

为啥用计数排序？因为 rank 的范围是 `[0, n-1]，可以直接用计数排序 O(n) 完成；用基于比较的排序反而会退化到 O(n log² n)。

### 5. LCP 数组：后缀数组的最佳拍档

光有 `sa` 还不够。面试官可能会追问："怎么快速求两个后缀的最长公共前缀（LCP）？"

**LCP 数组** `height[i]` 表示 `sa[i]` 和 `sa[i-1]` 两个后缀的最长公共前缀长度：

```
sa:    [5,    3,     1,      0,        4,   2]
suf:   "a"   "ana"  "anana" "banana"  "na"  "nana"

height[1] = LCP("ana", "a")        = 1
height[2] = LCP("anana", "ana")    = 3
height[3] = LCP("banana", "anana") = 0
height[4] = LCP("na", "banana")    = 0
height[5] = LCP("nana", "na")      = 2

最终 height: [_, 1, 3, 0, 0, 2]
```

#### Kasai 算法：O(n) 构建 LCP

朴素做法是每次从头比较两个后缀，O(n²)。Kasai 算法利用一个关键观察：**`height[i+1] ≥ height[i] - 1`**。

直觉：假设 `sa[i] = k`，那么 `sa[i+1] = k+1` 的后缀就是 `sa[i]` 的后缀去掉首字符。两个去掉首字符的子串的 LCP 比原来少 1。所以从 `height[i] - 1` 开始往上比对就够了，不会浪费。

```typescript
function buildLCP(s: string, sa: number[]): number[] {
  const n = s.length;
  const rank = new Array(n).fill(0);
  // 先求出 rank：后缀 sa[i] 的排名是 i
  for (let i = 0; i < n; i++) rank[sa[i]] = i;

  const height = new Array(n).fill(0);
  let k = 0;
  for (let i = 0; i < n; i++) {
    if (rank[i] === 0) continue; // 第一个后缀没有前驱
    const j = sa[rank[i] - 1]; // 上一个排名的后缀
    // 尽量延伸 LCP，但保证 k ≥ height[i-1] - 1
    while (i + k < n && j + k < n && s[i + k] === s[j + k]) k++;
    height[rank[i]] = k;
    if (k > 0) k--;
  }
  return height;
}
```

每个字符最多被访问常数次 → 总复杂度 **O(n)**。

### 6. 子串查询：二分搜索

有了 `sa`，做模式匹配只需要二分：

```typescript
// 在 sa 中找所有以 pattern 开头的后缀位置
function search(s: string, sa: number[], pattern: string): number[] {
  const n = s.length;
  const m = pattern.length;
  const result: number[] = [];

  // 左边界：第一个 >= pattern 的位置
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (s.substring(sa[mid], sa[mid] + m) < pattern) lo = mid + 1;
    else hi = mid;
  }
  const left = lo;

  // 右边界：第一个 > pattern 的位置
  hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (s.substring(sa[mid], sa[mid] + m) <= pattern) lo = mid + 1;
    else hi = mid;
  }

  for (let i = left; i < lo; i++) result.push(sa[i]);
  return result;
}
```

每次比较 `pattern` 和 `s[sa[mid]..]` 的前 m 个字符，O(m)。两次二分总复杂度 **O(m log n)**。如果 `s` 不变，只是 query 多，这个开销完全可以接受。

### 7. 最长重复子串：巧用 height 数组

这是个经典面试题：给定字符串 s，找出其中**至少出现两次**的最长子串。

答案就在 height 数组里：**height 数组的最大值就是答案**。

为什么？`height[i]` 是排名第 i 和 i-1 的后缀的 LCP。如果某个子串重复出现两次，那这两个出现对应的后缀在 sa 中必然相邻（排序后这两个最长公共前缀就是它自己），所以 height 中必然有这一段长度。

```typescript
function longestRepeatingSubstring(s: string): string {
  const sa = buildSA(s);
  const height = buildLCP(s, sa);
  let maxLen = 0, pos = 0;
  for (let i = 1; i < height.length; i++) {
    if (height[i] > maxLen) {
      maxLen = height[i];
      pos = sa[i]; // 重叠子串的起始位置
    }
  }
  return s.substring(pos, pos + maxLen);
}

console.log(longestRepeatingSubstring("banana")); // "ana" ✅
```

## 代码实现

### TypeScript 版（倍增 + 计数排序）

```typescript
/**
 * 后缀数组 —— 倍增算法 + 计数排序 O(n log n)
 *
 * 思路：
 * 1. 第 1 轮按首字符排序
 * 2. 每轮用 (rank[i], rank[i + len]) 元组排序
 * 3. 直到所有 rank 都唯一（说明排序收敛）
 */
function buildSA(s: string): number[] {
  const n = s.length;
  // rank[i] = 后缀 s[i..] 的当前排名
  // 初始按首字符的 ASCII 排序
  const rank: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) rank[i] = s.charCodeAt(i);

  // sa[k] = 排名为 k 的后缀起始位置
  const sa: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) sa[i] = i;

  // 临时数组，复用以避免 GC
  const tmp: number[] = new Array(n).fill(0);

  for (let len = 1; ; len <<= 1) {
    // ---------- 计数排序 ----------
    // 按第二关键字排序：先按 rank[i + len] 排序（i + len 越界视为 -1）
    // 用计数排序 O(n)
    const maxRank = Math.max(n, ...rank) + 1;

    // 第一步：按第二关键字 (rank[i + len]) 排序
    // 为了能用计数排序，我们先按"第二关键字"稳定的桶排
    // 桶的下标是 rank[i + len] + 1（+1 让越界的 -1 变成 0）
    const bucket = new Int32Array(n + 1).fill(0);
    // 1) 数每个桶有多少个元素
    for (let i = 0; i < n; i++) {
      const key = i + len < n ? rank[i + len] + 1 : 0;
      bucket[key]++;
    }
    // 2) 累加成前缀和，确定每个桶的起始位置
    let sum = 0;
    for (let i = 0; i <= n; i++) {
      const cnt = bucket[i];
      bucket[i] = sum;
      sum += cnt;
    }
    // 3) 按桶序输出（稳定排序）
    for (let i = 0; i < n; i++) {
      const key = sa[i] + len < n ? rank[sa[i] + len] + 1 : 0;
      tmp[bucket[key]++] = sa[i];
    }

    // 第二步：再按第一关键字 (rank[i]) 排序
    bucket.fill(0);
    for (let i = 0; i < n; i++) bucket[rank[i] + 1]++;
    sum = 0;
    for (let i = 0; i <= n; i++) {
      const cnt = bucket[i];
      bucket[i] = sum;
      sum += cnt;
    }
    for (let i = 0; i < n; i++) {
      tmp[bucket[rank[tmp[i]] + 1]++] = tmp[i];
    }

    // 把 tmp 拷贝回 sa
    for (let i = 0; i < n; i++) sa[i] = tmp[i];

    // ---------- 计算新 rank ----------
    tmp[sa[0]] = 0;
    let r = 0;
    for (let i = 1; i < n; i++) {
      // 如果当前后缀和上一个后缀的两段排名都相同，rank 相同；否则 +1
      const cur = sa[i],
        prev = sa[i - 1];
      const sameFirst = rank[cur] === rank[prev];
      const sameSecond =
        (cur + len < n ? rank[cur + len] : -1) ===
        (prev + len < n ? rank[prev + len] : -1);
      if (!(sameFirst && sameSecond)) r++;
      tmp[cur] = r;
    }
    for (let i = 0; i < n; i++) rank[i] = tmp[i];

    // 如果所有 rank 都唯一了，说明排序完成
    if (r === n - 1) break;
  }

  return sa;
}
```

### Python 版（更易读）

```python
def build_sa(s: str) -> list[int]:
    """倍增算法构建后缀数组"""
    n = len(s)
    # k = 当前比较的前缀长度（1, 2, 4, 8...）
    k = 1
    # rank[i] = s[i:i+k] 这段子串的排名（用元组表示，便于排序）
    rank = [ord(c) for c in s]
    tmp = [0] * n
    sa = list(range(n))

    while True:
        # 按 (rank[i], rank[i+k]) 元组排序
        sa.sort(key=lambda i: (rank[i], rank[i + k] if i + k < n else -1))
        # 计算新 rank
        tmp[sa[0]] = 0
        for i in range(1, n):
            prev, cur = sa[i - 1], sa[i]
            # 元组是否和上一个完全相等
            same = (
                rank[prev] == rank[cur]
                and
                (prev + k < n and rank[prev + k] or -1) ==
                (cur + k < n and rank[cur + k] or -1)
            )
            tmp[cur] = tmp[prev] + (0 if same else 1)
        rank, tmp = tmp, rank

        # 所有 rank 都唯一了，退出
        if rank[sa[-1]] == n - 1:
            break
        k <<= 1

    return sa


def build_lcp(s: str, sa: list[int]) -> list[int]:
    """Kasai 算法 O(n) 构建 LCP 数组"""
    n = len(s)
    rank = [0] * n
    for i in range(n):
        rank[sa[i]] = i

    height = [0] * n
    k = 0
    for i in range(n):
        if rank[i] == 0:
            continue
        j = sa[rank[i] - 1]
        while i + k < n and j + k < n and s[i + k] == s[j + k]:
            k += 1
        height[rank[i]] = k
        if k > 0:
            k -= 1
    return height


# 验证
s = "banana"
sa = build_sa(s)
lcp = build_lcp(s, sa)
print("sa:    ", sa)    # [5, 3, 1, 0, 4, 2]
print("lcp:   ", lcp)   # [0, 1, 3, 0, 0, 2]
print("suffixes:", [s[i:] for i in sa])
```

### Go 版（工程友好）

```go
package suffixarray

// BuildSA 倍增算法构建后缀数组 O(n log n)
func BuildSA(s string) []int {
	n := len(s)
	rank := make([]int, n)
	for i := 0; i < n; i++ {
		rank[i] = int(s[i])
	}

	sa := make([]int, n)
	for i := 0; i < n; i++ {
		sa[i] = i
	}
	tmp := make([]int, n)

	for k := 1; ; k <<= 1 {
		// 用 sort.Slice 实现元组排序（O(n log n)，比计数排序差但简单）
		// 生产环境想要 O(n log n) 整体复杂度，请用计数排序版本
		sort.Slice(sa, func(i, j int) bool {
			a, b := sa[i], sa[j]
			if rank[a] != rank[b] {
				return rank[a] < rank[b]
			}
			ra, rb := -1, -1
			if a+k < n {
				ra = rank[a+k]
			}
			if b+k < n {
				rb = rank[b+k]
			}
			return ra < rb
		})

		// 计算新 rank
		tmp[sa[0]] = 0
		r := 0
		for i := 1; i < n; i++ {
			cur, prev := sa[i], sa[i-1]
			same := rank[cur] == rank[prev]
			if !same {
				r++
			} else {
				// 第二段也要相同
				ra, rb := -1, -1
				if cur+k < n {
					ra = rank[cur+k]
				}
				if prev+k < n {
					rb = rank[prev+k]
				}
				if ra != rb {
					r++
				}
			}
			tmp[cur] = r
		}
		rank, tmp = tmp, rank

		// 收敛
		if rank[sa[n-1]] == n-1 {
			break
		}
	}
	return sa
}

// BuildLCP Kasai 算法构建 LCP 数组 O(n)
func BuildLCP(s string, sa []int) []int {
	n := len(s)
	rank := make([]int, n)
	for i := 0; i < n; i++ {
		rank[sa[i]] = i
	}

	height := make([]int, n)
	k := 0
	for i := 0; i < n; i++ {
		if rank[i] == 0 {
			continue
		}
		j := sa[rank[i]-1]
		for i+k < n && j+k < n && s[i+k] == s[j+k] {
			k++
		}
		height[rank[i]] = k
		if k > 0 {
			k--
		}
	}
	return height
}
```

## 业务场景

### 1. 全文检索 / 关键字高亮

给定一个长文本和一组查询词，返回每个词出现的所有位置。建好后缀数组和 LCP 后，每次查询 **O(m log n)**，毫秒级响应。

### 2. 最长公共子串（多串）

给两个字符串 `s1` 和 `s2`，找它们的最长公共子串。经典做法：把 `s2` 拼到 `s1` 后面（中间加一个 `s1` 和 `s2` 都没有的特殊字符，如 `#`），构建后缀数组，看 height 数组中跨越分界线的最大值。

### 3. DNA 序列分析

生物信息学里大量子串查询问题。后缀数组 + LCP + Sparse Table（前面文章讲过）能搞定 RMQ、LCP 查询、重复片段检测等。

### 4. 不同子串数量

给定字符串 `s`，求它有多少个**不同**的子串。

公式：**总子串数 - 重复子串数 = n(n+1)/2 - Σ height[i]**。

为什么？每个后缀贡献 `n - sa[i]` 个前缀（也就是子串）。但所有后缀的前缀合起来就是全部子串，重复的子串对应 height 数组中记录的部分。减一下就出来了。

## 复杂度分析

| 操作                  | 时间复杂度     | 空间复杂度 |
| --------------------- | -------------- | ---------- |
| 构建 SA（倍增+计数）  | O(n log n)     | O(n)       |
| 构建 SA（SA-IS）      | O(n)           | O(n)       |
| Kasai 构建 LCP        | O(n)           | O(n)       |
| 单次模式匹配（m 长度）| O(m log n)     | —          |
| 最长重复子串          | O(n)           | O(n)       |
| 不同子串数量          | O(n)           | O(n)       |

> 💡 **SA-IS 算法**是更进阶的 O(n) 构造法，比倍增快但实现复杂得多。面试一般不要求手写 SA-IS，知道倍增就够了。

## 小结

后缀数组是字符串处理的"重型武器"：

- ✅ 一次构建，多次查询，特别适合**文本不变、查询多**的场景
- ✅ 配合 LCP 数组能解决一堆经典问题（重复子串、子串计数、最长公共子串）
- ✅ 空间复杂度 O(n)，跟后缀树一样强大，但实现简单得多
- ❌ 构建比 KMP/Z 函数慢，**单次匹配**不如 KMP
- ❌ 在线场景（文本频繁更新）维护成本高，不如后缀自动机灵活

跟它经常一起出场的"小伙伴"们：

- **Z 函数**：单次匹配 O(n)，但只能算"每个后缀 vs 整个串"的 LCP
- **KMP**：单模式匹配 O(n+m)，代码短但只能处理单模式
- **后缀自动机（SAM）**：功能更强，支持在线追加字符，但实现复杂
- **后缀树**：理论上的"终极武器"，但实际工程都用后缀数组或 SAM 替代

面试里如果被问到"字符串处理有哪些进阶数据结构"，按"Z → KMP → 后缀数组 → 后缀自动机"这个顺序答，能稳赢 💪。

> 🎁 练习题推荐：LeetCode 1062（最长重复子串）、1044（最长重复子串 - 困难版）、P3809【模板】后缀排序（洛谷）。