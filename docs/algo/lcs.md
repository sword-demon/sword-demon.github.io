---
title: 最长公共子序列（LCS）
description: 最长公共子序列（Longest Common Subsequence）—— 经典 DP 问题，面试高频，理解 diff 工具的核心原理
date: 2026-06-27 10:00:00
categories:
  - Algorithm
tags:
  - longest-common-subsequence
  - dynamic-programming
  - string
  - interview
sidebarSort: 55
---

# 最长公共子序列（LCS）

你用过 `git diff` 吧？它能精确地告诉你两个文件之间哪些行被修改了、哪些行是新增的、哪些行被删除了。你有没有好奇过它是怎么做到的？

其实，`git diff` 的核心算法之一就是今天要讲的**最长公共子序列**（Longest Common Subsequence，简称 LCS）。找到两个文件的 LCS，剩下的部分就是"差异"。

这个概念在面试中出现频率非常高——不只直接问你 LCS 怎么求，还有一大堆变体：**编辑距离**、**最短公共超序列**、**两个字符串的删除操作**……本质上都是 LCS 的变形。搞懂它，一通百通 ✨

## 先搞清楚"子序列"和"子串"的区别

这是面试中经常被追问的点，千万别搞混：

```
字符串：A = "ABCDE"

子串（Substring）：必须连续
  → "ABC", "CDE", "BCD" 都是子串
  → "ACE" ❌ 不是子串（中间跳过了 B 和 D）

子序列（Subsequence）：可以不连续，但必须保持相对顺序
  → "ACE" ✓ 是子序列（A...C...E，顺序对了就行）
  → "AEC" ❌ 不是子序列（E 在 C 后面了，顺序乱了）
```

所以 LCS 的意思是：在两个字符串中，找到**最长的**、**可以不连续**但**顺序要一致**的公共部分。

## 问题定义

给定两个字符串：

```
A = "ABCBDAB"
B = "BDCAB"
```

求它们的最长公共子序列。答案是 `"BCAB"`（长度 4）。

注意：LCS 不一定唯一。比如 `"BDAB"` 也是长度为 4 的公共子序列。我们一般只关心**长度**，不关心具体是哪个。

## 暴力思路

最直觉的做法：枚举 A 的所有子序列（2^m 个），再枚举 B 的所有子序列（2^n 个），找最长的公共部分。

```
时间复杂度：O(2^m × 2^n) —— 爆炸 💥
```

当字符串长度超过 30 就跑不动了。我们需要 DP。

## 原理拆解

### 1. 状态定义

```
dp[i][j] = A 的前 i 个字符和 B 的前 j 个字符的 LCS 长度
```

最终答案：`dp[m][n]`，其中 m = A 的长度，n = B 的长度。

### 2. 状态转移方程

对于 `A[i-1]` 和 `B[j-1]`（注意 DP 数组是 1-indexed，字符串是 0-indexed），有两种情况：

```
情况一：A[i-1] == B[j-1]（当前字符相同）
  → 这个字符可以加入 LCS
  → dp[i][j] = dp[i-1][j-1] + 1

情况二：A[i-1] != B[j-1]（当前字符不同）
  → 这个字符不能同时加入 LCS，只能二选一：
    - 跳过 A 的当前字符：dp[i-1][j]
    - 跳过 B 的当前字符：dp[i][j-1]
  → dp[i][j] = max(dp[i-1][j], dp[i][j-1])
```

合并起来：

```
dp[i][j] = dp[i-1][j-1] + 1               如果 A[i-1] == B[j-1]
dp[i][j] = max(dp[i-1][j], dp[i][j-1])    如果 A[i-1] != B[j-1]
```

### 3. 初始条件

```
dp[0][j] = 0  （A 为空，LCS 长度为 0）
dp[i][0] = 0  （B 为空，LCS 长度为 0）
```

### 图解过程

用 `A = "ABCBDAB"` 和 `B = "BDCAB"` 来画表格：

```
        ""  B  D  C  A  B
    ""   0  0  0  0  0  0
     A   0  0  0  0  1  1
     B   0  1  1  1  1  2
     C   0  1  1  2  2  2
     B   0  1  1  2  2  3
     D   0  1  2  2  2  3
     A   0  1  2  2  3  3
     B   0  1  2  2  3  4  ← 答案
```

来看几个关键格子是怎么填的：

```
dp[1][4]: A[0]='A', B[3]='A' → 相同！dp[1][4] = dp[0][3] + 1 = 0 + 1 = 1
dp[2][1]: A[1]='B', B[0]='B' → 相同！dp[2][1] = dp[1][0] + 1 = 0 + 1 = 1
dp[2][4]: A[1]='B', B[3]='A' → 不同 → max(dp[1][4], dp[2][3]) = max(1, 1) = 1
dp[7][5]: A[6]='B', B[4]='B' → 相同！dp[7][5] = dp[6][4] + 1 = 3 + 1 = 4
```

### 4. 如果需要回溯具体的 LCS 字符串

光知道长度不够，还想输出具体是哪些字符？那就从 `dp[m][n]` 开始**倒着走**：

```
从 dp[m][n] 出发：

如果 A[i-1] == B[j-1]:
    → 这个字符属于 LCS，记录下来
    → 往左上角走：i--, j--

如果 A[i-1] != B[j-1]:
    → 看 dp[i-1][j] 和 dp[i][j-1] 哪个大
    → 往大的那个方向走

直到 i == 0 或 j == 0
```

用我们的例子走一遍：

```
dp[7][5]=4, A[6]='B', B[4]='B' → 相同 → 记录 'B' → 走到 (6,4)
dp[6][4]=3, A[5]='A', B[3]='A' → 相同 → 记录 'A' → 走到 (5,3)
dp[5][3]=2, A[4]='D', B[2]='C' → 不同 → dp[4][3]=2 == dp[5][2]=2 → 走到 (4,3)
dp[4][3]=2, A[3]='B', B[2]='C' → 不同 → dp[3][3]=2 > dp[4][2]=1 → 走到 (3,3)
dp[3][3]=2, A[2]='C', B[2]='C' → 相同 → 记录 'C' → 走到 (2,2)
dp[2][2]=1, A[1]='B', B[1]='D' → 不同 → dp[1][2]=0 < dp[2][1]=1 → 走到 (2,1)
dp[2][1]=1, A[1]='B', B[0]='B' → 相同 → 记录 'B' → 走到 (1,0)

收集到的字符（倒序）：B, A, C, B
正序输出：BCAB ✅
```

## 代码实现

### TypeScript — 基础版（二维 DP 数组）

```typescript
/**
 * LCS —— 求最长公共子序列的长度
 * 时间 O(mn)，空间 O(mn)
 */
function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length;
  const n = text2.length;

  // dp[i][j] = text1 前 i 个字符和 text2 前 j 个字符的 LCS 长度
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}
```

### TypeScript — 空间优化版（滚动数组）

注意到 `dp[i][j]` 只依赖 `dp[i-1][...]` 和 `dp[i][j-1]`，所以只需要**两行**就够了：

```typescript
/**
 * LCS —— 空间优化版
 * 时间 O(mn)，空间 O(min(m, n))
 */
function longestCommonSubsequenceOptimized(
  text1: string,
  text2: string
): number {
  // 保证 text2 是较短的那个，减少空间
  if (text1.length < text2.length) {
    [text1, text2] = [text2, text1];
  }

  const m = text1.length;
  const n = text2.length;

  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }

  return prev[n];
}
```

### TypeScript — 回溯输出 LCS 字符串

```typescript
/**
 * LCS —— 回溯输出具体的公共子序列
 */
function getLCS(text1: string, text2: string): string {
  const m = text1.length;
  const n = text2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  // 先填 DP 表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯
  const result: string[] = [];
  let i = m,
    j = n;
  while (i > 0 && j > 0) {
    if (text1[i - 1] === text2[j - 1]) {
      result.push(text1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result.reverse().join("");
}
```

### Python

```python
"""最长公共子序列 —— Python 实现"""

def longest_common_subsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]


def get_lcs(text1: str, text2: str) -> str:
    """回溯输出具体的公共子序列"""
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    # 回溯
    result = []
    i, j = m, n
    while i > 0 and j > 0:
        if text1[i - 1] == text2[j - 1]:
            result.append(text1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1

    return "".join(reversed(result))
```

## 复杂度分析

```
┌─────────────┬──────────────┬───────────────┐
│    版本      │  时间复杂度   │  空间复杂度    │
├─────────────┼──────────────┼───────────────┤
│  二维 DP     │   O(m × n)   │   O(m × n)    │
│  滚动数组    │   O(m × n)   │   O(min(m,n)) │
│  回溯输出    │   O(m × n)   │   O(m × n)    │
└─────────────┴──────────────┴───────────────┘
```

> 💡 空间优化版在 m 和 n 很大时（比如比较两个长文件），能省下大量内存。

## 经典变体和实战应用

掌握了 LCS 的核心思路后，你会发现一大波面试题都可以转化成 LCS 来解：

### 1. 最长公共子串（Longest Common Substring）

跟 LCS 只差一个字，但区别很大——子串要求**连续**：

```typescript
/**
 * 最长公共子串 —— 注意跟 LCS 的区别
 * 子串必须连续，子序列可以不连续
 * dp[i][j] 表示以 text1[i-1] 和 text2[j-1] 结尾的最长公共子串长度
 */
function longestCommonSubstring(text1: string, text2: string): number {
  const m = text1.length;
  const n = text2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  let maxLen = 0;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        maxLen = Math.max(maxLen, dp[i][j]);
      } else {
        dp[i][j] = 0; // 不连续就断了，归零
      }
    }
  }

  return maxLen;
}
```

### 2. 编辑距离（Edit Distance）

编辑距离就是 LCS 的"孪生兄弟"。两个字符串的最少编辑操作数 = `m + n - 2 × LCS长度`（在只允许插入和删除的情况下）。我们之前已经有独立的[编辑距离文章](edit-distance.md)，这里就不展开了。

### 3. 两个字符串的删除操作（LeetCode 583）

> 给定两个字符串，使它们相等所需的最小删除次数。

```typescript
/**
 * 使两个字符串相等的最小删除次数
 * 思路：保留 LCS，其余的全删掉
 */
function minDistance(word1: string, word2: string): number {
  const lcs = longestCommonSubsequence(word1, word2);
  return word1.length + word2.length - 2 * lcs;
}
```

### 4. 最短公共超序列（LeetCode 1092）

> 找到同时以两个字符串为子序列的最短字符串。

```typescript
/**
 * 最短公共超序列 —— 基于 LCS 构造
 * 思路：LCS 的字符只出现一次，其余字符按顺序插入
 */
function shortestCommonSupersequence(str1: string, str2: string): string {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 从右下角回溯，构造结果
  const result: string[] = [];
  let i = m,
    j = n;
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      result.push(str1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      result.push(str1[i - 1]);
      i--;
    } else {
      result.push(str2[j - 1]);
      j--;
    }
  }

  // 剩余的字符
  while (i > 0) result.push(str1[--i]);
  while (j > 0) result.push(str2[--j]);

  return result.reverse().join("");
}
```

### 5. 实际应用：diff 算法

`git diff` 和各种文本对比工具的核心思路：

```
文件 A（旧版本）:
line 1: hello
line 2: world
line 3: foo

文件 B（新版本）:
line 1: hello
line 2: bar
line 3: world

LCS（按行比较）:
["hello", "world"]

diff 结果:
  hello          （不变）
- foo            （删除）
+ bar            （新增）
  world          （移动了位置）
```

实际的 diff 算法会比纯 LCS 更复杂（会做优化以减少输出行数），但核心思想是一样的。

## 容易踩的坑

### 1. 空字符串边界

```typescript
// 别忘了处理空字符串的情况
// dp[0][j] = 0, dp[i][0] = 0，初始化时已经处理了
// 但如果用递归+记忆化，一定要加上 base case
```

### 2. 字符串索引 vs DP 索引

```typescript
// 字符串是 0-indexed，DP 表是 1-indexed
// dp[i][j] 对应的是 text1[i-1] 和 text2[j-1]
// 这是最容易写错的地方！
```

### 3. 回溯方向搞反

```typescript
// 回溯时从 dp[m][n] 开始，往 (0,0) 方向走
// 收集到的字符是倒序的，记得 reverse()
```

### 4. 混淆 LCS 和最长公共子串

```
LCS（子序列）：可以不连续 → "ABCDE" 和 "ACE" 的 LCS = "ACE"（长度 3）
最长公共子串：必须连续   → "ABCDE" 和 "ACE" 的最长公共子串 = "A" 或 "C" 或 "E"（长度 1）
```

## 举一反三：相关 LeetCode 题目

| 题目 | 难度 | 核心思路 |
|------|------|----------|
| 1143. Longest Common Subsequence | 中等 | LCS 模板题 |
| 583. Delete Operation for Two Strings | 中等 | `m + n - 2 × LCS` |
| 1092. Shortest Common Supersequence | 困难 | LCS + 回溯构造 |
| 712. Minimum ASCII Delete Sum for Two Strings | 中等 | LCS 变体，权重是 ASCII 值 |
| 115. Distinct Subsequences | 困难 | LCS 思想变体 |
| 516. Longest Palindromic Subsequence | 中等 | 字符串和它的反转求 LCS |

## 总结

```
┌──────────────────────────────────────────────────────────┐
│                    LCS 知识图谱                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   子序列 vs 子串 ← 面试必问的区别                         │
│       ↓                                                  │
│   状态：dp[i][j] = A前i个字符 和 B前j个字符 的 LCS 长度    │
│       ↓                                                  │
│   转移：                                                  │
│     相同 → dp[i-1][j-1] + 1                              │
│     不同 → max(dp[i-1][j], dp[i][j-1])                   │
│       ↓                                                  │
│   空间优化：滚动数组 → O(min(m,n))                        │
│       ↓                                                  │
│   回溯输出：从 dp[m][n] 倒着走                            │
│       ↓                                                  │
│   变体：编辑距离 / 删除操作 / 超序列 / diff 算法          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

LCS 是 DP 问题中的"瑞士军刀"——它本身很简洁，但理解了它之后，你会发现很多看似不同的问题其实都是 LCS 的变体。面试时遇到两个字符串相关的题，第一反应就该想想：**能不能用 LCS 的思路来解？** 🎯
