---
title: 动态规划
description: Dynamic Programming 详解：从斐波那契到背包问题，四语言实现
date: 2026-05-17 19:55:00
categories:
  - Algorithm
tags:
  - dynamic-programming
  - dp
  - interview
sidebarSort: 20
---

# 动态规划（Dynamic Programming）

动态规划的核心思想：**把大问题拆成小问题，记住小问题的答案，避免重复计算**。

## 原理拆解

DP 三要素：

1. **状态定义**：`dp[i]` 代表什么
2. **状态转移方程**：`dp[i]` 怎么从之前的状态推出来
3. **初始条件**：`dp[0]` 等于多少

```
斐波那契数列：
  状态：dp[i] = 第 i 个斐波那契数
  转移：dp[i] = dp[i-1] + dp[i-2]
  初始：dp[0] = 0, dp[1] = 1
```

### 优化思路

```
递归（自顶向下）  →  记忆化递归  →  DP 数组（自底向上）  →  状态压缩
O(2^n)             O(n)              O(n)                    O(1)
```

## 代码实现

### 经典问题一：爬楼梯

> LeetCode 70. Climbing Stairs

#### TypeScript

```typescript
function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev2 = 1,
    prev1 = 2; // 状态压缩，只记前两个
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2;
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
```

#### Go

```go
package dp

func ClimbStairs(n int) int {
	if n <= 2 { return n }
	prev2, prev1 := 1, 2
	for i := 3; i <= n; i++ {
		prev2, prev1 = prev1, prev1+prev2
	}
	return prev1
}
```

#### Java

```java
public class ClimbStairs {
    public static int solve(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int cur = prev1 + prev2;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}
```

#### Python

```python
"""爬楼梯 —— Python 实现"""
def climb_stairs(n: int) -> int:
    if n <= 2: return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b
```

### 经典问题二：最长递增子序列（LIS）

> LeetCode 300. Longest Increasing Subsequence

#### TypeScript

```typescript
/** DP 解法 O(n²) */
function lengthOfLIS(nums: number[]): number {
  const dp = new Array(nums.length).fill(1);
  let maxLen = 1;
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }
  return maxLen;
}

/** 贪心 + 二分 O(n log n) */
function lengthOfLISFast(nums: number[]): number {
  const tails: number[] = []; // tails[i] = 长度为 i+1 的递增子序列的最小末尾
  for (const num of nums) {
    let left = 0,
      right = tails.length;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (tails[mid] < num) left = mid + 1;
      else right = mid;
    }
    if (left === tails.length) tails.push(num);
    else tails[left] = num;
  }
  return tails.length;
}
```

#### Python

```python
"""最长递增子序列 —— Python 实现"""
import bisect

def lis(nums: list[int]) -> int:
    tails = []
    for num in nums:
        pos = bisect.bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num
    return len(tails)
```

### 经典问题三：0-1 背包

> 给定 n 个物品的重量和价值，背包容量 W，求能装下的最大价值。

```typescript
/**
 * 0-1 背包 —— TypeScript 实现
 * dp[j] = 容量为 j 时的最大价值
 */
function knapsack(weights: number[], values: number[], W: number): number {
  const dp = new Array(W + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    // 从后往前遍历，避免重复使用同一物品
    for (let j = W; j >= weights[i]; j--) {
      dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
    }
  }
  return dp[W];
}

console.log(knapsack([2, 3, 4, 5], [3, 4, 5, 6], 8)); // 10
```

#### Python

```python
"""0-1 背包 —— Python 实现"""

def knapsack(weights: list[int], values: list[int], W: int) -> int:
    dp = [0] * (W + 1)
    for w, v in zip(weights, values):
        for j in range(W, w - 1, -1):
            dp[j] = max(dp[j], dp[j - w] + v)
    return dp[W]
```

## 面试题精选

| 题号 | 题目           | DP 类型     | 难度 |
| ---- | -------------- | ----------- | ---- |
| 70   | 爬楼梯         | 线性 DP     | 简单 |
| 300  | 最长递增子序列 | 序列 DP     | 中等 |
| 322  | 零钱兑换       | 完全背包    | 中等 |
| 1143 | 最长公共子序列 | 二维 DP     | 中等 |
| 72   | 编辑距离       | 二维 DP     | 中等 |
| 53   | 最大子数组和   | Kadane 算法 | 中等 |
| 139  | 单词拆分       | 字符串 DP   | 中等 |
| 198  | 打家劫舍       | 线性 DP     | 中等 |
| 416  | 分割等和子集   | 0-1 背包    | 中等 |
| 518  | 零钱兑换 II    | 完全背包    | 中等 |

## 复杂度分析

| 问题            | 时间       | 空间        |
| --------------- | ---------- | ----------- |
| 爬楼梯          | O(n)       | O(1) 压缩后 |
| LIS (DP)        | O(n²)      | O(n)        |
| LIS (贪心+二分) | O(n log n) | O(n)        |
| 0-1 背包        | O(nW)      | O(W) 压缩后 |

## 小结

DP 解题四步：**定义状态 → 写转移方程 → 确定初始值 → 确定遍历顺序**。

常见 DP 类型：

- **线性 DP**：爬楼梯、打家劫舍
- **序列 DP**：LIS、LCS
- **背包 DP**：0-1 背包、完全背包
- **区间 DP**：戳气球、矩阵链乘法
- **树形 DP**：打家劫舍 III

口诀：**状态转移方程写，初始条件和边界。重叠子问题记忆化，最优子结构递推解** ✅
