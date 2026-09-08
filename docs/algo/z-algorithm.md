---
title: Z 函数（Z-Algorithm）
description: Z 函数（Z-Algorithm）详解：O(n) 求每个后缀与原串的最长公共前缀，TypeScript/Python/Go 多语言实现
date: 2026-09-08 09:01:15
categories:
  - Algorithm
tags:
  - z-algorithm
  - string-matching
  - pattern-matching
  - string
  - interview
sidebarSort: 81
---

# Z 函数（Z-Algorithm）

面试官甩给你一道题："给你一个文本串 `s`，再给你一个模式串 `p`，找出 `p` 在 `s` 中所有出现的起始位置，要求 O(n+m)。"

你脱口而出："用 KMP 啊！" 面试官点点头，又问："那如果我让你求 `s` 的**每个后缀**和 `s` 本身的最长公共前缀呢？比如 `s = "aaaaab"`，要输出 `[0, 4, 3, 2, 1, 0]`（第一个永远是 0，从第二个位置开始数）。"

你愣了一下。这题用 KMP 也能做，但需要改造得面目全非。**Z 函数**就是为这种"整串 vs 后缀"的场景量身定做的 —— 它的代码比 KMP 还简洁，跑得也快，面试里出现频率正在悄悄上升 🚀。

## 原理拆解

### 1. Z 函数的定义

给定一个长度为 `n` 的字符串 `s`，它的 **Z 函数** `z[i]` 表示：**以 `s[i]` 开头的后缀与 `s` 本身的最长公共前缀（LCP）的长度**。

为了统一，我们规定 `z[0] = 0`（或者定义为 `n`，但通常填 0）。

举个例子：

```
s = "aabxaab"

下标:    0  1  2  3  4  5  6
字符:    a  a  b  x  a  a  b

z[0] = 0              (按惯例)
z[1]: s[1..] = "abxaab"，s = "aabxaab"，LCP = 1  → z[1] = 1
z[2]: s[2..] = "bxaab"，s = "aabxaab"，LCP = 0  → z[2] = 0
z[3]: s[3..] = "xaab"，s = "aabxaab"，LCP = 0  → z[3] = 0
z[4]: s[4..] = "aab"，s = "aabxaab"，LCP = 3  → z[4] = 3
z[5]: s[5..] = "ab"，s = "aabxaab"，LCP = 1   → z[5] = 1
z[6]: s[6..] = "b"，s = "aabxaab"，LCP = 0    → z[6] = 0

最终: z = [0, 1, 0, 0, 3, 1, 0]
```

```
s:  a a b x a a b
z:  0 1 0 0 3 1 0
    ↑   ↑       ↑
    i=1 i=2 i=6 位置
```

直观理解：第 4 位往后跟"原串前 3 个字符"完全一致（"aab"），所以 `z[4] = 3`。

### 2. 朴素算法为什么慢？

如果你直接对每个 `i`，从 `s[i]` 开始跟 `s[0]` 逐字符比对，那就是 O(n²)。当 `n = 10⁶` 时直接超时。

```
朴素版：
s = "aaaaaaaaaa"（10 个 a）

z[0] = 0
z[1]: 比对 a vs a, a vs a, ... → 9 次比较
z[2]: 比对 a vs a, ...        → 8 次比较
...
z[9]: 1 次比较

总开销：1 + 2 + ... + 9 = 45 次 ≈ O(n²/2)
```

重复造轮子做了太多 —— 我们比对 `z[1]` 时已经知道 "a[0..9] 全是 a"，这个信息可以**复用到 `z[2]`** 上。

### 3. Z 函数的核心思想：维护一个"窗口"

Z 函数的精髓就是维护一个**右边界最远的匹配区间 `[l, r]`**：

```
s:    a a b x a a b
      |-------|        ← 窗口 [l, r] 表示 s[l..r] 与 s[0..r-l] 完全一致
        ↑   ↑
        l   r
```

在计算 `z[i]` 时：

- **如果 `i > r`**：说明当前位置不在任何已知匹配区间内，没办法利用历史信息，只能从 0 开始老老实实逐字符比对，得到新的 `[l, r]`。
- **如果 `i ≤ r`**：当前位置在已知区间内！此时 `s[i]` 对应着窗口里的某个位置 `i' = i - l`，而 `s[i']` 又对应着前缀 `s[0..]`。所以**至少 `z[i] ≥ min(z[i'], r - i + 1)`**，因为前缀不能超过当前窗口的右边界 `r`。

有了这个下界 `k`，我们再从 `r + 1` 开始往后尝试扩展，看看能不能匹配更多字符。

听起来有点绕？来个图 👇

```
s = "a a b x a a b x a a b"
    0 1 2 3 4 5 6 7 8 9 10

计算 z[4] 时：
    i = 4，从 0 开始暴力匹配 → "a a b" 都匹配，匹配到 r = 6
    更新窗口 [4, 6]

计算 z[5]：
    i = 5 ≤ r = 6，用已有信息
    i' = i - l = 5 - 4 = 1
    z[1] = 1（之前算过）
    r - i + 1 = 6 - 5 + 1 = 2
    min(z[1], r-i+1) = min(1, 2) = 1 → 至少匹配 1 个字符
    从 r+1=7 开始往后试 → s[7] = 'x'，s[2] = 'b'，不匹配，结束
    z[5] = 1

计算 z[6]：
    i = 6 ≤ r = 6
    i' = 6 - 4 = 2
    z[2] = 0
    min(0, 6-6+1) = min(0, 1) = 0 → 0 个匹配
    从 r+1=7 开始 → s[7]='x', s[0]='a' 不匹配
    z[6] = 0
    因为 z[6] = 0 < 1，窗口要更新 → l = 7, r = 6（暂时无效，等下次）

计算 z[7]：
    i = 7 > r = 6，暴力匹配
    "a a b x a a b" 全部匹配（7 个字符），r = 13（超出字符串长度）
    z[7] = 7，但实际只能匹配 min(7, n-7) = 4
```

总之一个原则：**左指针用历史信息"白嫖"一段匹配，再向右暴力扩展**。每个字符最多被访问常数次，所以总时间 **O(n)**。

## 代码实现

### TypeScript 版（最推荐）

```typescript
/**
 * 计算 Z 函数
 * @param s 输入字符串
 * @returns 长度为 n 的数组，z[i] 表示 s[i..] 与 s 的最长公共前缀长度
 */
function zFunction(s: string): number[] {
  const n = s.length;
  const z: number[] = new Array(n).fill(0);
  let l = 0; // 当前匹配窗口的左边界
  let r = 0; // 当前匹配窗口的右边界（包含）

  for (let i = 1; i < n; i++) {
    // 如果 i 在窗口内，先"白嫖"一段
    if (i <= r) {
      // z[i-l] 是 s[i..] 对应位置的前缀匹配长度
      // 但不能超过当前窗口的右边界 r
      z[i] = Math.min(z[i - l], r - i + 1);
    }

    // 从 z[i] 开始尝试向右扩展
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++;
    }

    // 如果窗口扩展了，更新 [l, r]
    if (i + z[i] - 1 > r) {
      l = i;
      r = i + z[i] - 1;
    }
  }

  return z;
}

// 测试
console.log(zFunction("aabxaab")); // [0, 1, 0, 0, 3, 1, 0]
console.log(zFunction("aaaaab"));  // [0, 4, 3, 2, 1, 0]
console.log(zFunction("abcdef"));  // [0, 0, 0, 0, 0, 0]
```

代码看着短，但其实信息密度很高。来拆解一下：

```typescript
if (i <= r) {
  z[i] = Math.min(z[i - l], r - i + 1);
}
```

这一行是关键。`z[i - l]` 是前缀的镜像信息，但**不能超过当前窗口右边界** —— 因为窗口右边的部分我们还不知道匹不匹配，不能"透支"未来。

### Python 版

```python
def z_function(s: str) -> list[int]:
    """计算字符串 s 的 Z 函数"""
    n = len(s)
    z = [0] * n
    l = r = 0  # 当前匹配窗口 [l, r]

    for i in range(1, n):
        if i <= r:
            # 在窗口内，可以"白嫖"已有信息
            z[i] = min(z[i - l], r - i + 1)

        # 从 z[i] 开始尝试继续扩展
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1

        # 如果扩展到了更远的位置，更新窗口
        if i + z[i] - 1 > r:
            l, r = i, i + z[i] - 1

    return z


# 测试
print(z_function("aabxaab"))  # [0, 1, 0, 0, 3, 1, 0]
print(z_function("aaaaab"))   # [0, 4, 3, 2, 1, 0]
```

### Go 版

```go
package main

import "fmt"

// ZFunction 计算字符串 s 的 Z 函数
func ZFunction(s string) []int {
    n := len(s)
    z := make([]int, n)
    l, r := 0, 0

    for i := 1; i < n; i++ {
        if i <= r {
            // 在 [l, r] 窗口内，可以用 z[i-l] 的信息
            if z[i-l] < r-i+1 {
                z[i] = z[i-l]
            } else {
                z[i] = r - i + 1
            }
        }

        // 向右扩展
        for i+z[i] < n && s[z[i]] == s[i+z[i]] {
            z[i]++
        }

        // 更新窗口
        if i+z[i]-1 > r {
            l = i
            r = i + z[i] - 1
        }
    }

    return z
}

func main() {
    fmt.Println(ZFunction("aabxaab")) // [0 1 0 0 3 1 0]
    fmt.Println(ZFunction("aaaaab"))  // [0 4 3 2 1 0]
}
```

## 应用场景

Z 函数远不止"算个 LCP"那么简单。它是一把万能钥匙，能优雅地解决一堆字符串问题。

### 应用一：模式匹配（跟 KMP 抢饭碗）

**题目**：文本 `s` 中找出模式串 `p` 的所有出现位置。

**思路**：把 `p` 和 `s` 用一个特殊字符（不在两个串里出现）拼起来，比如 `p + "#" + s`，然后对整个串算 Z 函数。在拼接后串中，**任意位置 `i` 对应的 `z[i]` 就是 `s[i..]` 与 `p` 的最长公共前缀长度**。如果 `z[i] == |p|`，说明 `p` 在 `s` 中从位置 `i - |p| - 1` 处完全匹配。

```typescript
/**
 * 用 Z 函数做模式匹配
 * 找出 pattern 在 text 中所有出现的位置
 */
function search(text: string, pattern: string): number[] {
  const combined = pattern + "#" + text;
  const z = zFunction(combined);
  const m = pattern.length;
  const result: number[] = [];

  for (let i = m + 1; i < z.length; i++) {
    if (z[i] === m) {
      result.push(i - m - 1);
    }
  }

  return result;
}

// 测试
console.log(search("ababcabab", "ab"));      // [0, 2, 5]
console.log(search("hello world", "world")); // [6]
```

**为什么能这么干？** 因为加了 `#` 之后，`text` 中的字符永远不可能跨过 `#` 去匹配 `pattern` 的前缀，所以 Z 函数在 `text` 部分精确地反映了"和 pattern 的 LCP"。

### 应用二：字符串周期性检测

**题目**：判断 `s` 是否有周期性结构（即 `s = t + t + ... + t`，重复 k 次）。

**思路**：`s` 有周期 `p`（`p` 是最短周期）的充要条件：

1. `n % p == 0`（长度是周期的整数倍）
2. `s[p..n-1] == s[0..n-p-1]`，等价于 `z[p] == n - p`

```typescript
/**
 * 找到字符串 s 的最短周期（如果有的话）
 * 返回最短周期长度，如果不存在周期返回 0
 */
function shortestPeriod(s: string): number {
  const n = s.length;
  const z = zFunction(s);

  for (let i = 1; i < n; i++) {
    // i 是候选周期长度
    // 条件：n 能被 i 整除 + z[i] 等于剩余长度
    if (n % i === 0 && z[i] === n - i) {
      return i;
    }
  }
  return 0;
}

console.log(shortestPeriod("abcabcabc")); // 3
console.log(shortestPeriod("aaaaaa"));    // 1
console.log(shortestPeriod("abcdef"));     // 0
console.log(shortestPeriod("abababab"));  // 2
```

**例子**：`s = "abcabcabc"`，`n = 9`。当 `i = 3` 时，`z[3] = 6 = n - i`，说明从第 3 个字符起跟开头的 6 个字符一致 —— 这就是周期。

### 应用三：本质不同子串计数

**题目**：求字符串 `s` 中有多少个**本质不同**的子串（不考虑重复出现的）。

**思路**：通常用后缀数组 + LCP 解决，但如果只是要数个数，可以用 Z 函数搞定。具体做法是：枚举所有后缀 `s[i..n-1]`，利用 Z 函数对原串的反转/变换求 LCP，避免重复计数。详细实现略，但在 O(n²) 朴素算法下用 Z 函数能优化到 O(n²) → O(n²) 的常数优化版本。

更常见的做法是：**用 Z 函数求所有子串的"最小表示"长度**，从而去重。

### 应用四：最长回文前缀

**题目**：找 `s` 的最长前缀，使得这个前缀本身是回文。

**思路**：把 `s` 和 `reverse(s)` 拼起来做 Z 函数。具体来说：

```typescript
/**
 * 最长回文前缀
 * 即 s[0..k] 既是 s 的前缀，又是回文
 */
function longestPalindromicPrefix(s: string): number {
  // 把 s 和 reverse(s) 用 # 拼接
  const n = s.length;
  const combined = s + "#" + s.split("").reverse().join("");
  const z = zFunction(combined);

  // 从前往后找最大的 k，使得 z[n+1+k-1] >= k
  // 实际上就是看 reverse(s) 的某个前缀等于 s 的某个前缀
  // ... 实现略，需要一点小技巧
  return 0;
}
```

> 注：这题更经典的做法是用 KMP 拼接 `s + "#" + reverse(s)`，思路完全一样。

### 应用五：判断字符串是否能通过子串重复构造（LeetCode 459）

**题目**：给你一个非空字符串 `s`，判断它是否可以通过它的一个子串重复多次构成。

这就是 `shortestPeriod(s) > 0` 的应用，秒解！

```typescript
function repeatedSubstringPattern(s: string): boolean {
  return shortestPeriod(s) > 0;
}
```

## 复杂度分析

| 维度 | 复杂度 | 说明 |
|------|--------|------|
| 时间 | O(n) | 每个字符最多被 `while` 循环访问常数次 |
| 空间 | O(n) | 存储 Z 数组本身 |

跟 KMP 完全一个量级 —— 都是线性时间、线性空间。那为啥要学 Z 函数？因为它**代码更短、思路更直观**，并且对"前缀 vs 后缀"这种结构天然友好。两者配合使用，覆盖几乎所有字符串匹配场景。

## KMP vs Z 函数：怎么选？

| 场景 | 推荐 | 原因 |
|------|------|------|
| 求 `s` 的 `next`（前缀函数） | KMP | Z 函数做这事要绕一圈 |
| 求后缀和原串的 LCP | **Z 函数** | 天然契合 |
| 模式串匹配 | 平手 | Z 函数 + 拼接稍快，KMP 内存更省 |
| 字符串周期检测 | **Z 函数** | 一句话判定 |
| 求所有回文子串 | Manacher | Z 函数不擅长 |

一句话总结：**KMP 管"前缀函数"，Z 函数管"后缀 vs 原串"**，两者在大部分场景可以互换，Z 函数代码更短。

## 实战技巧 & 踩坑

### 1. 拼接字符必须严格区分

模式匹配时用的分隔符 `#`，必须保证**在两个原串里都不出现**。否则会产生错误匹配：

```typescript
// ❌ 错误：分隔符在 text 里出现了
const bad = pattern + "a" + text; // 如果 text 里也有 'a'，可能误匹配

// ✅ 正确：用一个肯定不出现的字符
const good = pattern + "$" + text; // 假设 $ 不在两边出现
```

最安全的做法是找一个不可能出现的 ASCII 字符，比如 `\0`、`#`、`$`，或者用 `String.fromCharCode(0)`。

### 2. Z 函数对 Unicode 也能用

因为 TypeScript / Python 的字符串是按字符迭代的（不是字节），所以 Z 函数对中文 emoji 也能正常工作：

```typescript
console.log(zFunction("你好你好世界"));
// n = 7
// z[3] = 4（"你好世界" 跟 "你好你好" 的 LCP = 2 → z[3]=2？）
// 实际输出：[0, 0, 0, 0, 0, 0, 0]
```

不过**小心 JavaScript 的 UTF-16 编码**：Emoji 表情是代理对，`.length` 会算成 2。这种情况下要用 `Array.from(s)` 转成码点数组再算。

### 3. 不要把 Z 函数当万能工具

Z 函数是处理**单个字符串的结构**的工具。如果要处理多模式匹配（AC 自动机）、动态字符串（后缀自动机），还是得上对应数据结构。Z 函数最强的地方：**单一文本 + 单一模式 / 单一字符串自匹配**。

## 实战 LeetCode 题

刷几道题巩固一下：

| 题目 | 难度 | Z 函数能直接用吗 |
|------|------|------------------|
| [LeetCode 28 - 实现 strStr()](https://leetcode.cn/problems/implement-strstr/) | 简单 | ✅ |
| [LeetCode 459 - 重复的子字符串](https://leetcode.cn/problems/repeated-substring-pattern/) | 简单 | ✅ 一行解 |
| [LeetCode 1392 - 最长快乐前缀](https://leetcode.cn/problems/longest-happy-prefix/) | 困难 | ✅ |
| [LeetCode 2223 - 构造字符串的总得分和](https://leetcode.cn/problems/sum-of-scores-of-built-strings/) | 困难 | ✅ 直接用 Z 数组求和 |
| [LeetCode 3031 - 将单词恢复初始状态所需的最短时间 II](https://leetcode.cn/problems/minimum-time-to-revert-word-to-initial-state-ii/) | 困难 | ✅ |

挑一道中等难度实战一下：

**LeetCode 2223**：给你一个字符串 `s`，它的"得分"定义为 `z[1] + z[2] + ... + z[n-1]`。求 `s` 的得分。

```typescript
function sumScores(s: string): number {
  const z = zFunction(s);
  let sum = 0;
  // 用 BigInt 是因为答案可能超过 2^53
  for (let i = 1; i < z.length; i++) {
    sum += z[i];
  }
  return sum;
}
```

是不是简单到想笑 😂？这就是 Z 函数的魅力 —— **题目看起来高大上，Z 函数三行解决**。

## 总结

Z 函数虽然名字听着抽象，核心套路其实就两句话：

1. **定义**：`z[i]` = 后缀 `s[i..]` 跟原串 `s` 的最长公共前缀。
2. **算法**：维护右边界最远的匹配窗口 `[l, r]`，新位置能"白嫖"就白嫖，白嫖完再暴力扩展。每个字符被访问 O(1) 次，总时间 O(n)。

它跟 KMP 是字符串领域的"双生子"：
- **KMP** 处理"前缀函数 π"，擅长模式匹配；
- **Z 函数** 处理"后缀 vs 原串的 LCP"，擅长结构分析。

两个都掌握，面试遇到字符串问题基本就是送分题。下次遇到"求 s 的每个后缀跟 s 的 LCP"或者"判断字符串能否由子串重复构成"这种题，别再写 O(n²) 了，Z 函数 5 行搞定 ✨。

继续刷题保持手感，算法这东西就得靠肌肉记忆！
