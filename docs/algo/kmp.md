---
title: KMP 字符串匹配
description: KMP 算法详解：从暴力匹配到 O(n+m)，next 数组推导，四语言实现
date: 2026-05-18 02:00:00
categories:
  - Algorithm
tags:
  - kmp
  - string-matching
  - algorithm
  - interview
sidebarSort: 28
---

# KMP 字符串匹配（Knuth-Morris-Pratt）

"在一个长文本中查找一个关键词出现的位置"——这听起来是最基本的编程操作，`String.indexOf()` 就能搞定。但如果面试官让你**手写**一个高效的字符串匹配算法呢？

暴力匹配的时间复杂度是 O(n×m)，当文本很长时会超时。而 **KMP 算法**能在 **O(n+m)** 的时间内完成匹配——这个算法由 Knuth、Morris、Pratt 三个人独立发现，以他们名字的首字母命名。

KMP 的核心思想：**当匹配失败时，不回退文本指针，而是利用已匹配的信息，尽可能多地跳过不必要的比较**。

## 原理拆解

### 暴力匹配的问题

```
文本：  a b a b a b c
       ↑
模式：  a b a b c

匹配到第 4 个字符时失败：
文本：  a b a b a b c
               ↑
模式：  a b a b c
               ↑  b ≠ a，失败了！

暴力做法：文本指针回退到第 2 位，模式从头开始
KMP 做法：文本指针不动，模式向右滑动到合适位置继续比较
```

### KMP 的核心：next 数组（失败函数）

KMP 的关键是预处理模式串，得到一个 **next 数组**（也叫 failure function）。

`next[i]` 表示：模式串前 i 个字符中，**最长的相同前后缀的长度**。

```
模式串：  a  b  a  b  c
索引：    0  1  2  3  4

next[0] = 0  （单个字符没有前后缀）
next[1] = 0  （"ab"：前缀"a"，后缀"b"，不同）
next[2] = 1  （"aba"：前缀"a"，后缀"a"，长度 1）
next[3] = 2  （"abab"：前缀"ab"，后缀"ab"，长度 2）
next[4] = 0  （"ababc"：没有相同前后缀）

next = [0, 0, 1, 2, 0]
```

**为什么 next 数组有用？**

当在模式串的第 j 位匹配失败时，我们不需要从头开始。因为 `next[j]` 告诉我们：**前 j 个字符的后 next[j] 个字符和前 next[j] 个字符是相同的**。所以可以把模式串滑动到 next[j] 的位置继续比较。

```
匹配失败时的处理：

文本：  a b a b a b c
               ↑ i = 4（指向第 5 个字符 'a'）
模式：  a b a b c
               ↑ j = 4（c ≠ a，失败了）

next[4] = 0，说明前 4 个字符 "abab" 的最长相同前后缀长度是 2
所以 j 回退到 next[3] = 2 的位置

文本：  a b a b a b c
               ↑ i 不变
模式：      a b a b c
               ↑ j = 2（继续比较）

现在 arr[4] = 'a' == pattern[2] = 'a' ✅ 继续匹配！
```

### 构建 next 数组的过程

next 数组的构建本身也是一个"字符串匹配"过程——**用模式串匹配自己**：

```
模式串：  a  b  a  b  c
          ↑           ↑
          j           i

i 从 1 开始，j 从 0 开始
如果 pattern[i] == pattern[j]：
  next[i] = j + 1, i++, j++
如果 pattern[i] != pattern[j]：
  如果 j > 0：j = next[j-1]（回退 j，类似匹配失败的处理）
  如果 j == 0：next[i] = 0, i++
```

## 代码实现

### TypeScript

```typescript
/**
 * KMP 字符串匹配 —— TypeScript 实现
 */

/** 构建 next 数组（失败函数） */
function buildNext(pattern: string): number[] {
  const n = pattern.length;
  const next = new Array(n).fill(0);

  let j = 0; // j 是前后缀匹配的长度
  for (let i = 1; i < n; i++) {
    // 不匹配时，回退 j（用 next 数组的性质）
    while (j > 0 && pattern[i] !== pattern[j]) {
      j = next[j - 1];
    }
    // 匹配了，前缀长度 +1
    if (pattern[i] === pattern[j]) {
      j++;
    }
    next[i] = j;
  }
  return next;
}

/** KMP 搜索：返回所有匹配的起始位置 */
function kmpSearch(text: string, pattern: string): number[] {
  if (!pattern) return [];

  const next = buildNext(pattern);
  const result: number[] = [];
  let j = 0; // 模式串指针

  for (let i = 0; i < text.length; i++) {
    // 不匹配时，利用 next 数组回退 j，不回退 i
    while (j > 0 && text[i] !== pattern[j]) {
      j = next[j - 1];
    }
    if (text[i] === pattern[j]) {
      j++;
    }
    // 完全匹配！记录位置，然后继续找下一个
    if (j === pattern.length) {
      result.push(i - pattern.length + 1);
      j = next[j - 1]; // 继续搜索（允许重叠匹配）
    }
  }
  return result;
}

// 测试
console.log(kmpSearch("ababababc", "ababc")); // [4]
console.log(kmpSearch("aaaaa", "aa")); // [0, 1, 2, 3]（重叠匹配）
console.log(kmpSearch("hello world", "world")); // [6]
console.log(kmpSearch("abcabc", "abc")); // [0, 3]

// 验证 next 数组
console.log(buildNext("ababc")); // [0, 0, 1, 2, 0]
console.log(buildNext("aabaaab")); // [0, 1, 0, 1, 2, 2, 3]
```

### Go

```go
package kmp

// BuildNext 构建 KMP 的 next 数组 —— Go 实现
func BuildNext(pattern string) []int {
	n := len(pattern)
	next := make([]int, n)

	j := 0
	for i := 1; i < n; i++ {
		for j > 0 && pattern[i] != pattern[j] {
			j = next[j-1]
		}
		if pattern[i] == pattern[j] {
			j++
		}
		next[i] = j
	}
	return next
}

// KMPSearch KMP 搜索 —— 返回所有匹配位置
func KMPSearch(text, pattern string) []int {
	if len(pattern) == 0 {
		return nil
	}

	next := BuildNext(pattern)
	var result []int
	j := 0

	for i := 0; i < len(text); i++ {
		for j > 0 && text[i] != pattern[j] {
			j = next[j-1]
		}
		if text[i] == pattern[j] {
			j++
		}
		if j == len(pattern) {
			result = append(result, i-len(pattern)+1)
			j = next[j-1]
		}
	}
	return result
}
```

### Java

```java
import java.util.*;

/**
 * KMP 字符串匹配 —— Java 实现
 */
public class KMP {

    /** 构建 next 数组 */
    public static int[] buildNext(String pattern) {
        int n = pattern.length();
        int[] next = new int[n];
        int j = 0;

        for (int i = 1; i < n; i++) {
            while (j > 0 && pattern.charAt(i) != pattern.charAt(j)) {
                j = next[j - 1];
            }
            if (pattern.charAt(i) == pattern.charAt(j)) {
                j++;
            }
            next[i] = j;
        }
        return next;
    }

    /** KMP 搜索 */
    public static List<Integer> search(String text, String pattern) {
        List<Integer> result = new ArrayList<>();
        if (pattern.isEmpty()) return result;

        int[] next = buildNext(pattern);
        int j = 0;

        for (int i = 0; i < text.length(); i++) {
            while (j > 0 && text.charAt(i) != pattern.charAt(j)) {
                j = next[j - 1];
            }
            if (text.charAt(i) == pattern.charAt(j)) {
                j++;
            }
            if (j == pattern.length()) {
                result.add(i - pattern.length() + 1);
                j = next[j - 1];
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(search("ababababc", "ababc")); // [4]
        System.out.println(search("aaaaa", "aa"));         // [0, 1, 2, 3]
    }
}
```

### Python

```python
"""KMP 字符串匹配 —— Python 实现"""

def build_next(pattern: str) -> list[int]:
    """构建 KMP 的 next 数组"""
    n = len(pattern)
    nxt = [0] * n
    j = 0

    for i in range(1, n):
        while j > 0 and pattern[i] != pattern[j]:
            j = nxt[j - 1]
        if pattern[i] == pattern[j]:
            j += 1
        nxt[i] = j
    return nxt

def kmp_search(text: str, pattern: str) -> list[int]:
    """KMP 搜索，返回所有匹配位置"""
    if not pattern:
        return []

    nxt = build_next(pattern)
    result = []
    j = 0

    for i, ch in enumerate(text):
        while j > 0 and ch != pattern[j]:
            j = nxt[j - 1]
        if ch == pattern[j]:
            j += 1
        if j == len(pattern):
            result.append(i - len(pattern) + 1)
            j = nxt[j - 1]
    return result


# 测试
print(kmp_search("ababababc", "ababc"))   # [4]
print(kmp_search("aaaaa", "aa"))           # [0, 1, 2, 3]
print(kmp_search("hello world", "world"))  # [6]
```

### LeetCode 28：找出字符串中第一个匹配项的下标

> 给定 haystack 和 needle，返回 needle 在 haystack 中首次出现的位置，不存在返回 -1。

```typescript
/**
 * LeetCode 28 —— 用 KMP 解决
 */
function strStr(haystack: string, needle: string): number {
  if (!needle) return 0;

  const next = buildNext(needle);
  let j = 0;

  for (let i = 0; i < haystack.length; i++) {
    while (j > 0 && haystack[i] !== needle[j]) {
      j = next[j - 1];
    }
    if (haystack[i] === needle[j]) j++;
    if (j === needle.length) return i - needle.length + 1;
  }
  return -1;
}
```

### LeetCode 459：重复的子字符串

> 判断一个字符串是否由其某个子串重复多次构成。

**巧妙的 KMP 解法：如果 `s` 由重复子串构成，那么 `next[n-1]` 一定 > 0，且 `n % (n - next[n-1]) == 0`。**

```typescript
/**
 * LeetCode 459 —— KMP 巧妙解法
 * s 由重复子串构成 ⟺ next[n-1] > 0 且 n 能被 (n - next[n-1]) 整除
 */
function repeatedSubstringPattern(s: string): boolean {
  const next = buildNext(s);
  const n = s.length;
  const maxPrefixLen = next[n - 1];

  // 最长相同前后缀 > 0，且字符串长度能被"最小重复单元"整除
  return maxPrefixLen > 0 && n % (n - maxPrefixLen) === 0;
}

// 测试
console.log(repeatedSubstringPattern("abab")); // true（"ab" × 2）
console.log(repeatedSubstringPattern("aba")); // false
console.log(repeatedSubstringPattern("abcabcabc")); // true（"abc" × 3）
```

## 面试题精选

| 题号 | 题目                     | KMP 相关           | 难度 |
| ---- | ------------------------ | ------------------ | ---- |
| 28   | 找出字符串中第一个匹配项 | 标准 KMP           | 简单 |
| 459  | 重复的子字符串           | next 数组性质      | 简单 |
| 214  | 最短回文串               | KMP 找最长回文前缀 | 困难 |
| 1392 | 最长快乐前缀             | next 数组直接应用  | 困难 |
| 796  | 旋转字符串               | KMP 在 s+s 中找 t  | 简单 |
| 1367 | 二叉树中的列表           | KMP + DFS          | 困难 |
| 1397 | 找到所有好字符串         | KMP + 数位 DP      | 困难 |

## 业务场景

### 1. 搜索引擎与全文检索

搜索引擎需要在数十亿的网页文档中搜索关键词。虽然实际系统用的是倒排索引（Inverted Index），但在索引构建阶段和 snippet 提取阶段，都需要高效的字符串匹配。KMP 及其变体（Boyer-Moore、Sunday）是底层的基础算法。

### 2. 生物信息学

DNA 序列比对是生物信息学的核心任务。人类基因组有 30 亿个碱基对，需要在其中查找特定的基因片段。KMP 的思想被广泛应用于 BLAST（Basic Local Alignment Search Tool）等基因比对工具中。

### 3. 入侵检测系统（IDS）

Snort、Suricata 等网络入侵检测系统需要在网络流量中匹配已知的攻击模式（签名）。每个签名就是一个模式串，KMP 类算法用于高效的模式匹配。多模式匹配则用 Aho-Corasick 自动机（KMP 的多模式扩展）。

### 4. 文本编辑器的查找功能

VS Code、Vim、Sublime Text 等编辑器的 Ctrl+F 查找功能底层就用了字符串匹配算法。对于简单的精确匹配，KMP 是标准选择；对于正则表达式，则用 NFA/DFA。

### 5. 版本控制中的 Diff

Git 在计算两个文件之间的差异时，需要找到最长公共子序列（LCS）。虽然 LCS 是动态规划问题，但 KMP 的"最长相同前后缀"思想在其中也有应用。

## 复杂度分析

| 步骤           | 时间复杂度   | 空间复杂度        |
| -------------- | ------------ | ----------------- |
| 构建 next 数组 | O(m)         | O(m)              |
| KMP 搜索       | O(n)         | O(1)（不含 next） |
| **总计**       | **O(n + m)** | **O(m)**          |

- **构建 next O(m)**：虽然有 while 循环，但 j 最多回退 m 次（总共），所以是摊还 O(m)
- **搜索 O(n)**：同理，i 只增不减，j 的回退次数有上界，摊还 O(n)
- 对比暴力匹配 O(n×m)，KMP 在线性时间内完成匹配

## 小结

KMP 的核心就一句话：**匹配失败时不回退文本指针，用 next 数组跳过已知的匹配部分**。

面试中记住这些要点：

1. **next 数组的含义**：`next[i]` = 模式串前 i+1 个字符中，最长相同前后缀的长度
2. **构建 next**：本质是"用模式串匹配自己"，双指针 i 和 j
3. **搜索过程**：i（文本指针）只前进不回退，j（模式指针）失败时按 next 回退
4. **常见变体**：LeetCode 459（重复子串）利用 `n - next[n-1]` 是最小重复单元的长度

KMP 虽然代码不长，但 next 数组的理解是难点。建议手动在纸上推一遍 `buildNext("aabaaab")`，理解了就永远不会忘 ✅
