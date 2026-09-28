---
title: 最长回文子序列
description: 最长回文子序列（Longest Palindromic Subsequence）：从区间 DP 到 O(n) 空间的优化，再到工程实战
date: 2026-09-26 09:23:11
categories:
  - Algorithm
tags:
  - palindrome
  - subsequence
  - dp
  - interval-dp
  - interview
sidebarSort: 89
---

# 最长回文子序列（Longest Palindromic Subsequence）

你打开 LeetCode 准备刷题，看到一道编号 516 的题：「最长回文子序列」。题目描述很短——给定一个字符串 `s`，找到其中最长的回文子序列的长度，并返回这个长度。

你心里一嘀咕："子序列"和"子串"是不是一回事？**不是！**

- **子串（substring）**：必须连续，比如 `"abc"` 的子串有 `""`、`"a"`、`"b"`、`"c"`、`"ab"`、`"bc"`、`"abc"`
- **子序列（subsequence）**：可以不连续，但要保持相对顺序，比如 `"ace"` 是 `"abcde"` 的子序列

这俩一字之差，解法和难度天差地别。子串的最优解是 Manacher 算法（O(n)），博客里已经讲过。今天我们专门啃子序列——这道题有个特别巧妙的性质：**字符串 s 的最长回文子序列长度 = s 和 s 反转后的最长公共子序列（LCS）长度**。但比这个"转化思路"更经典的，是**直接用区间 DP 来做**。

## 为什么需要专门讲这个？

你可能会觉得："最长回文子串"已经被 Manacher 解决了，子序列算出来有啥用？

实际上子序列的应用比子串广得多。举几个例子：

- **DNA 序列比对**：两个 DNA 序列找公共子序列，相似度计算
- **代码 diff 工具**：git diff、VSCode 的文件对比，核心算法之一就是 LCS
- **最长回文子序列**：可以理解为"LCS(s, reverse(s))"，比如判断 `"bbbab"` 最长回文子序列长度为 4（"bbbb"）

更重要的是——这是面试官最爱考的一类**区间 DP**入门题。掌握了它，后面很多题（包括矩阵链乘、最优二叉搜索树、戳气球）都能触类旁通。

## 原理拆解

### 核心直觉：从两端往中间"夹"

先别想 DP 公式，咱们用最直觉的方式思考这个问题。

假设给你一个字符串 `"bbbab"`，你怎么判断它的最长回文子序列？

直觉告诉我们：**回文就是两边对称**。所以可以尝试——

- 如果最左和最右字符相等，那它们肯定是要的，答案至少是 2 + 里面的最长回文子序列
- 如果不相等，那只能放弃其中一个，跳过左边或者跳过右边，看哪个更长

这个"两边对称"的思路，就是**区间 DP**的核心——在区间 `[i, j]` 上做决策，然后递归地求小区间。

### 状态定义

```typescript
dp[i][j] // 表示子串 s[i..j]（含 i 和 j）的最长回文子序列长度
```

我们的目标是 `dp[0][n-1]`（n = s.length）。

### 状态转移

四种情况：

1. `i > j`：空串，回文子序列长度为 0
2. `i === j`：单个字符，长度为 1（它本身就是回文）
3. `s[i] === s[j]`：两边配对成功，长度 = 2 + `dp[i+1][j-1]`
4. `s[i] !== s[j]`：两边不能同时选，只能放弃其中一个：
   - 放弃左边：`dp[i+1][j]`
   - 放弃右边：`dp[i][j-1]`
   - 取较大者：`max(dp[i+1][j], dp[i][j-1])`

```
状态转移方程：

if (s[i] === s[j]) dp[i][j] = dp[i+1][j-1] + 2
else                dp[i][j] = max(dp[i+1][j], dp[i][j-1])
```

### 图解过程

以 `"bbbab"` 为例（最终答案 4）：

```
s = "b b b a b"
    0 1 2 3 4

初始：dp[i][i] = 1（单个字符是回文）
dp[0][0] = dp[1][1] = dp[2][2] = dp[3][3] = dp[4][4] = 1

区间长度 2：
dp[0][1]: "bb" 两端相等 → 2 + dp[0+1][1-1] = 2 + dp[1][0] = 2 + 0 = 2
dp[1][2]: "bb" → 2
dp[2][3]: "ba" 两端不等 → max(dp[3][3], dp[2][2]) = max(1, 1) = 1
dp[3][4]: "ab" → max(dp[4][4], dp[3][3]) = 1

区间长度 3：
dp[0][2]: "bbb" 两端相等 → 2 + dp[1][1] = 2 + 1 = 3
dp[1][3]: "bba" → max(dp[2][3], dp[1][2]) = max(1, 2) = 2
dp[2][4]: "bab" → 2 + dp[3][3] = 2 + 1 = 3

区间长度 4：
dp[0][3]: "bbba" → max(dp[1][3], dp[0][2]) = max(2, 3) = 3
dp[1][4]: "bbab" → max(dp[2][4], dp[1][3]) = max(3, 2) = 3

区间长度 5：
dp[0][4]: "bbbab" 两端相等 → 2 + dp[1][3] = 2 + 2 = 4 ✅
```

最终答案是 4，对应的回文子序列是 `"bbbb"`。

### 为什么是区间 DP？

注意依赖关系：`dp[i][j]` 依赖 `dp[i+1][j-1]`、`dp[i+1][j]`、`dp[i][j-1]`，都是**比当前区间更小**的子区间。所以我们必须**从小到大枚举区间长度**——先把 `dp[i][i]` 算出来，再算 `dp[i][i+1]`，最后算 `dp[0][n-1]`。

这就是区间 DP 的标准套路。

## 代码实现

### TypeScript

```typescript
/**
 * 最长回文子序列 —— TypeScript 实现
 * 核心思路：区间 DP，从小区间推到大区间
 */
function longestPalindromeSubseq(s: string): number {
  const n = s.length;
  // dp[i][j] 表示 s[i..j] 的最长回文子序列长度
  const dp: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0),
  );

  // 基础情况：单个字符是回文，长度为 1
  for (let i = 0; i < n; i++) {
    dp[i][i] = 1;
  }

  // 枚举区间长度，从 2 开始（1 已经处理过）
  for (let len = 2; len <= n; len++) {
    // 枚举左端点 i，右端点 j = i + len - 1
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;

      if (s[i] === s[j]) {
        if (len === 2) {
          // 特殊情况：两个相同字符直接配对
          dp[i][j] = 2;
        } else {
          dp[i][j] = dp[i + 1][j - 1] + 2;
        }
      } else {
        // 两端不等，放弃一边看哪个更优
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[0][n - 1];
}

// 测试
console.log(longestPalindromeSubseq("bbbab"));   // 4 → "bbbb"
console.log(longestPalindromeSubseq("cbbd"));    // 2 → "bb"
console.log(longestPalindromeSubseq("a"));       // 1 → "a"
console.log(longestPalindromeSubseq(""));        // 0 → ""
console.log(longestPalindromeSubseq("abcba"));   // 5 → "abcba" 本身就是回文
```

### Go

```go
package lps

// LongestPalindromeSubseq 最长回文子序列
// 区间 DP：从小区间递推到 [0, n-1]
func LongestPalindromeSubseq(s string) int {
	n := len(s)
	if n == 0 {
		return 0
	}

	// dp[i][j] 表示 s[i..j] 的最长回文子序列长度
	dp := make([][]int, n)
	for i := range dp {
		dp[i] = make([]int, n)
		dp[i][i] = 1 // 单字符是回文
	}

	// 枚举区间长度
	for length := 2; length <= n; length++ {
		for i := 0; i+length-1 < n; i++ {
			j := i + length - 1

			if s[i] == s[j] {
				if length == 2 {
					dp[i][j] = 2
				} else {
					dp[i][j] = dp[i+1][j-1] + 2
				}
			} else {
				if dp[i+1][j] > dp[i][j-1] {
					dp[i][j] = dp[i+1][j]
				} else {
					dp[i][j] = dp[i][j-1]
				}
			}
		}
	}

	return dp[0][n-1]
}
```

### Java

```java
class Solution {
    /**
     * 最长回文子序列 —— Java 实现
     */
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        if (n == 0) return 0;

        int[][] dp = new int[n][n];

        // 基础情况
        for (int i = 0; i < n; i++) {
            dp[i][i] = 1;
        }

        // 枚举区间长度
        for (int len = 2; len <= n; len++) {
            for (int i = 0; i + len - 1 < n; i++) {
                int j = i + len - 1;
                if (s.charAt(i) == s.charAt(j)) {
                    dp[i][j] = (len == 2) ? 2 : dp[i + 1][j - 1] + 2;
                } else {
                    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
                }
            }
        }

        return dp[0][n - 1];
    }
}
```

### Python

```python
def longest_palindrome_subseq(s: str) -> int:
    """
    最长回文子序列 —— Python 实现
    区间 DP 经典题
    """
    n = len(s)
    if n == 0:
        return 0

    # dp[i][j] 表示 s[i..j] 的最长回文子序列长度
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = 1  # 单字符是回文

    # 枚举区间长度（2 到 n）
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = 2 if length == 2 else dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])

    return dp[0][n - 1]


# 测试
print(longest_palindrome_subseq("bbbab"))   # 4
print(longest_palindrome_subseq("cbbd"))    # 2
print(longest_palindrome_subseq("abcba"))   # 5
```

## 进阶：O(n) 空间优化

上面的代码用了 O(n²) 的 dp 表，对于 n=1000 的字符串还好，但如果 n=10⁵ 就直接爆栈/爆内存。

观察状态转移：

```
dp[i][j] 依赖 dp[i+1][j-1]、dp[i+1][j]、dp[i][j-1]
```

仔细想一下——当我们在算**长度为 len** 的区间时，需要的所有信息都在**长度为 len-1** 和 **长度为 len-2** 的区间里。如果只维护两行 dp（上一行 + 当前行），能不能搞定？

答案是不行，因为 `dp[i][j]` 依赖**同一行左边的 `dp[i][j-1]`** 和**下一行右边的 `dp[i+1][j]`**，跨行+同行混合依赖，二维 dp 没法直接降到一维。

**但有一个巧妙的替代方案**：先用 `reverse(s)` 把字符串反转，然后求 `s` 和 `reverse(s)` 的 **LCS（最长公共子序列）**——这就是 `dp[i][j]` 的最长回文子序列长度。

LCS 经典 DP 是二维 dp，但它可以**滚动数组优化到 O(n) 空间**（因为 LCS 的 dp[i][j] 只依赖 dp[i-1][..] 和 dp[i][..]）。

### 优化后的代码

```typescript
/**
 * 用 LCS 思路求最长回文子序列 —— 空间优化到 O(n)
 * 核心技巧：滚动数组优化 LCS 二维 dp
 */
function longestPalindromeSubseqOptimized(s: string): number {
  const n = s.length;
  if (n === 0) return 0;

  const reversed = s.split("").reverse().join("");

  // LCS 的 dp 优化版：只用一行数组
  // dp[j] 表示当前处理到 reversed[0..i] 时，与 s[0..j] 的 LCS 长度
  let dp = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    const prev = dp.slice(); // 保存上一行
    for (let j = 1; j <= n; j++) {
      if (reversed[i - 1] === s[j - 1]) {
        // 这里 prev[j-1] 是 dp[i-1][j-1]
        dp[j] = prev[j - 1] + 1;
      } else {
        // dp[j] = max(dp[i-1][j], dp[i][j-1]) = max(prev[j], dp[j-1])
        dp[j] = Math.max(prev[j], dp[j - 1]);
      }
    }
  }

  return dp[n];
}

console.log(longestPalindromeSubseqOptimized("bbbab")); // 4
```

更进一步，我们还可以用**一维数组原地更新**（注意要倒序遍历 j，避免覆盖）：

```typescript
function lpsO1Space(s: string): number {
  const n = s.length;
  if (n === 0) return 0;

  const reversed = s.split("").reverse().join("");
  // dp[j] = LCS( reversed[0..i], s[0..j] )
  const dp = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    // 倒序遍历 j，避免 dp[j-1]（同一轮更新后的值）污染依赖
    let prevDiag = 0; // 保存 dp[j-1] 的"上一轮值"，即 dp[i-1][j-1]
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (reversed[i - 1] === s[j - 1]) {
        dp[j] = prevDiag + 1;
      } else {
        dp[j] = Math.max(dp[j], dp[j - 1]);
      }
      prevDiag = temp;
    }
  }
  return dp[n];
}
```

这下空间真的降到 O(n) 了 ✅

## 复杂度分析

| 方案               | 时间复杂度 | 空间复杂度 |
| ------------------ | ---------- | ---------- |
| 区间 DP（二维）    | O(n²)      | O(n²)      |
| LCS 转化 + 滚动数组 | O(n²)      | O(n)       |
| LCS 转化 + 一维优化 | O(n²)      | O(n)       |

时间复杂度没办法绕过 O(n²)，因为状态数本身就是 n² 个。但空间可以省一大截。

## 实际应用

### 1. DNA/蛋白质序列分析

生物信息学里有个经典问题：两个 DNA 序列的"相似度"怎么算？常见做法就是 LCS。但有时候你只有一个序列，想知道它自己"折叠"成回文结构的能力——这正好对应最长回文子序列。

DNA 是双螺旋结构，两条链是互补反向的（一个 5'→3'，另一个 3'→5'），所以"回文序列"在 DNA 里特别有意义，很多限制酶的识别位点都是回文序列（比如 EcoRI 识别 `GAATTC`）。

### 2. 字符串编辑距离的中间步骤

如果你想算两个字符串的编辑距离（Levenshtein 距离），其中一个重要子问题是判断"最少几次删除能让两个串相同"。**最长回文子序列**可以看作这个问题的特例：把一个串的"反向"和原串做 LCS，结果就是最长回文子序列。

### 3. 文本去重 / 冗余检测

给定一段长文本，找其中"对称性最强"的部分。可能的应用：日志分析中找到反复出现的对称模式、代码美化工具检测过度嵌套的括号等。

## 延伸思考

### 怎么输出最长回文子序列本身？

上面的代码只返回了长度，要输出具体的子序列怎么办？

**回溯 dp 表**：从 `dp[0][n-1]` 出发，根据转移决策往回走。

```typescript
function longestPalindromeSubseqWithString(s: string): string {
  const n = s.length;
  if (n === 0) return "";
  const dp: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0),
  );
  for (let i = 0; i < n; i++) dp[i][i] = 1;
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      if (s[i] === s[j]) {
        dp[i][j] = len === 2 ? 2 : dp[i + 1][j - 1] + 2;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯构造答案
  function build(i: number, j: number): string {
    if (i > j) return "";
    if (i === j) return s[i];
    if (s[i] === s[j]) {
      return s[i] + build(i + 1, j - 1) + s[j];
    }
    if (dp[i + 1][j] >= dp[i][j - 1]) {
      return build(i + 1, j);
    }
    return build(i, j - 1);
  }

  return build(0, n - 1);
}

console.log(longestPalindromeSubseqWithString("bbbab")); // "bbbb"
console.log(longestPalindromeSubseqWithString("cbbd"));  // "bb"
```

注意：如果存在多个最长解，这里返回的可能不是字典序最小的，但长度一定是最优。

### 与 LCS 的关系再深入

我们说了最长回文子序列长度 = `LCS(s, reverse(s))`，但这个**等式为什么成立**？

直觉：

- `s` 的任何回文子序列，反转后还是自己，所以它必然同时是 `s` 和 `reverse(s)` 的子序列 → 它是它们的公共子序列
- 反过来，`s` 和 `reverse(s)` 的任何公共子序列 t，由于 `reverse(t)` 也是 `reverse(s)` 的子序列（其实就是 `s` 的子序列 t），结合 t = reverse(t) 说明 t 是回文

所以两者完全等价 ✅

### 其他"最长 X 子序列"问题

学会了这一类题目，可以举一反三：

- **最长递增子序列（LIS）** —— 已有 [lis.md](./lis.md)，O(n log n) 解法
- **最长公共子序列（LCS）** —— 已有 [lcs.md](./lcs.md)，O(n²) DP
- **最长重复子序列** —— 字符串自己 vs 自己的 LCS（注意 i≠j）
- **编辑距离（Edit Distance）** —— 已有 [edit-distance.md](./edit-distance.md)

它们都是"二维 DP"的范畴，套路非常相似。

## 面试要点

| 题目 | 关键点 | 难度 |
| ---- | ------ | ---- |
| LeetCode 516 最长回文子序列 | 区间 DP，O(n²) | 中等 |
| LeetCode 1312 让字符串成为回文串的最少插入次数 | 衍生题：n - LPS(s) | 困难 |
| LeetCode 1092 最短公共超序列 | 区间 DP 进阶 | 困难 |
| LeetCode 1216 验证回文串 III | 判断是否能通过 k 次删除变回文 | 困难 |

经典的衍生：**让一个字符串变成回文串的最少插入次数 = s.length - LPS(s)**。为什么？因为你最少需要把 s 中**不属于回文子序列**的字符删掉（或在另一边插入对应的字符），剩下的就是最长回文子序列。

## 小结

最长回文子序列是**区间 DP** 的代表题目之一，核心要点：

- **状态定义**：`dp[i][j]` 表示子串 `s[i..j]` 的最长回文子序列长度
- **状态转移**：两端相等就 +2，不等就 `max(放弃左, 放弃右)`
- **枚举顺序**：按区间长度从小到大遍历（短区间先算）
- **空间优化**：转 LCS 思路 + 滚动数组，降到 O(n)

口诀：**区间 DP 看两端，相等加 2 不等 max，从短到长往上爬** ✅

掌握了这道题，区间 DP 类的题目（戳气球、矩阵链乘、最优 BST 等）就有了统一的解题模板——先想清楚子问题边界，再写转移方程，最后注意枚举顺序。
