---
title: 0-1 背包问题
description: 0-1 背包（0/1 Knapsack）——动态规划的入门经典，从"装箱子"到面试必考
date: 2026-06-22 09:00:00
categories:
  - Algorithm
tags:
  - dynamic-programming
  - knapsack
  - leetcode
sidebarSort: 52
---

# 0-1 背包问题（0/1 Knapsack）

你出差一周，只能带一个 7kg 的登机箱。面前摆着一堆东西：笔记本电脑（3kg，价值 ¥5000）、相机（2kg，¥3000）、充电宝（1kg，¥500）、几件衣服（2kg，¥200）、一本书（1kg，¥100）……你怎么装才能让箱子不超重，且总价值最大？

这就是经典的**背包问题**。而且我告诉你，这个问题在面试中出现的频率极高——不是直接问你"背包怎么装"，而是把它伪装成各种花样：**分割等和子集**、**目标和**、**最后一块石头的重量 II**……本质上全是背包。

今天我们就来彻底搞懂它 ✨。

## 为什么叫"0-1"背包？

因为每件物品只有两种选择：**拿（1）** 或 **不拿（0）**。不能拿一半，不能重复拿。就这么简单。

> 还有其他变体：完全背包（每件物品无限个）、多重背包（每件物品有限个），但 0-1 背包是基础中的基础，搞懂它其他变体都好说。

## 问题定义

给你 `n` 件物品和一个容量为 `W` 的背包：

- 第 `i` 件物品的重量是 `weight[i]`
- 第 `i` 件物品的价值是 `value[i]`

每件物品只能选一次，求背包能装下的**最大总价值**。

## 暴力思路

最直觉的做法：每件物品选或不选，一共有 `2^n` 种组合，全部试一遍取最大值。

```
物品：  [笔记本, 相机, 充电宝, 衣服, 书]
重量：  [3,     2,    1,     2,    1]
价值：  [5000, 3000, 500,   200, 100]

选笔记本+相机+充电宝：重量 3+2+1=6 ≤ 7，价值 5000+3000+500 = 8500 ✓
选笔记本+相机+衣服：  重量 3+2+2=7 ≤ 7，价值 5000+3000+200 = 8200 ✓
选笔记本+衣服+书：    重量 3+2+1=6 ≤ 7，价值 5000+200+100  = 5300
……
```

但 `2^n` 在 `n=100` 时就爆炸了。我们需要更聪明的方法——**动态规划**。

## 原理拆解

### 1. 状态定义

DP 的灵魂：**定义清楚 `dp[i][j]` 代表什么**。

```
dp[i][j] = 在前 i 件物品中选择，背包容量为 j 时，能获得的最大价值
```

- `i`：考虑第 0 到第 i-1 件物品（0-indexed）
- `j`：当前背包剩余容量（0 到 W）

最终答案：`dp[n][W]`

### 2. 状态转移方程

对于第 `i` 件物品，只有两个选择：

```
如果不选第 i 件：dp[i][j] = dp[i-1][j]
    （"我不拿这件，那最大价值就和前 i-1 件物品、容量 j 时一样"）

如果选第 i 件（前提：j >= weight[i]）：
    dp[i][j] = dp[i-1][j - weight[i]] + value[i]
    （"我拿了这件，容量减少了 weight[i]，但加上了它的价值"）
```

取两者最大值：

```
dp[i][j] = max(
    dp[i-1][j],                                      // 不选
    dp[i-1][j - weight[i]] + value[i]   // 选（容量够的话）
)
```

画个表格直觉感受一下（3 件物品，背包容量 5）：

```
        容量 j →    0     1     2     3     4     5
物品 0 (w=2, v=3):  0     0     3     3     3     3
物品 1 (w=3, v=4):  0     0     3     4     4     7
物品 2 (w=1, v=2):  0     0     3     4     5     7  ← 答案
```

> 💡 表格怎么读：`dp[2][5] = 7` 表示"考虑前 3 件物品，容量为 5 时，最大价值是 7"。

### 3. 代码实现（二维 DP）

TypeScript 实现，老规矩，先写二维版本理解原理：

```typescript
function knapsack01(weights: number[], values: number[], capacity: number): number {
    const n = weights.length;
    // dp[i][j]：前 i 件物品、容量 j 时的最大价值
    const dp: number[][] = Array.from({ length: n + 1 }, () =>
        new Array(capacity + 1).fill(0)
    );

    for (let i = 1; i <= n; i++) {
        const w = weights[i - 1]; // 当前物品重量
        const v = values[i - 1];  // 当前物品价值
        for (let j = 0; j <= capacity; j++) {
            // 不选第 i 件物品
            dp[i][j] = dp[i - 1][j];
            // 选第 i 件物品（容量够的话）
            if (j >= w) {
                dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - w] + v);
            }
        }
    }

    return dp[n][capacity];
}

// 测试：出差装箱
const weights = [3, 2, 1, 2, 1];
const values  = [5000, 3000, 500, 200, 100];
console.log(knapsack01(weights, values, 7)); // 8500（笔记本+相机+充电宝）
```

**时间复杂度**：O(n × W)，两层循环
**空间复杂度**：O(n × W)，二维数组

### 4. 空间优化：滚动数组

观察状态转移方程，`dp[i][j]` 只依赖 `dp[i-1][...]`——也就是只和上一行有关。那我们完全可以用一个一维数组，反复"滚动"更新。

```typescript
function knapsack01Optimized(weights: number[], values: number[], capacity: number): number {
    const n = weights.length;
    const dp: number[] = new Array(capacity + 1).fill(0);

    for (let i = 0; i < n; i++) {
        // ⚠️ 关键：必须从右往左遍历！
        // 因为 dp[j] 要用到的是"上一行"的 dp[j - weights[i]]
        // 如果从左往右，dp[j - weights[i]] 可能已经被当前行更新过了
        for (let j = capacity; j >= weights[i]; j--) {
            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }

    return dp[capacity];
}

console.log(knapsack01Optimized(weights, values, 7)); // 8500
```

> ⚠️ **从右往左** 这个细节超级重要！这是 0-1 背包和完全背包的唯一区别。完全背包是从左往右（因为可以重复选），0-1 背包必须从右往左（每件只选一次）。

优化后：
- **时间复杂度**：O(n × W)，不变
- **空间复杂度**：O(W)，只用了一维数组 🎉

### 5. 还原选择方案

上面的代码只能告诉你"最大价值是多少"，但没告诉你"到底选了哪些物品"。面试有时候会追问这个。还原方法：**从 dp 数组倒推**。

```typescript
function knapsackWithPath(
    weights: number[], values: number[], capacity: number
): { maxValue: number; selected: number[] } {
    const n = weights.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () =>
        new Array(capacity + 1).fill(0)
    );

    for (let i = 1; i <= n; i++) {
        for (let j = 0; j <= capacity; j++) {
            dp[i][j] = dp[i - 1][j];
            if (j >= weights[i - 1]) {
                dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - weights[i - 1]] + values[i - 1]);
            }
        }
    }

    // 倒推：从最后一行开始，看每个物品是选了还是没选
    const selected: number[] = [];
    let j = capacity;
    for (let i = n; i >= 1; i--) {
        if (dp[i][j] !== dp[i - 1][j]) {
            // 说明第 i 件物品被选了
            selected.push(i - 1); // 转回 0-indexed
            j -= weights[i - 1];  // 容量减掉
        }
    }

    return { maxValue: dp[n][capacity], selected: selected.reverse() };
}

const result = knapsackWithPath(weights, values, 7);
console.log(result.maxValue);  // 8500
console.log(result.selected);  // [0, 1, 2] → 笔记本、相机、充电宝
```

## 面试中的背包问题（LeetCode 实战）

背包问题最狡猾的地方在于：**它不会直接告诉你"这是背包问题"**。来看几个经典变体：

### LeetCode 416：分割等和子集

> 给一个正整数数组，判断能否将其分割为两个子集，使得两个子集的元素和相等。

一眼看不出来？转换一下：数组总和为 `sum`，如果 `sum` 是奇数直接返回 false。如果是偶数，问题变成——**能不能从数组中选出若干个数，使其和恰好等于 `sum / 2`**？

这不就是背包问题嘛！`sum / 2` 是背包容量，每个数既是重量也是价值，问"最大价值能不能等于容量"。

```typescript
function canPartition(nums: number[]): boolean {
    const sum = nums.reduce((a, b) => a + b, 0);
    if (sum % 2 !== 0) return false;

    const target = sum / 2;
    const dp: boolean[] = new Array(target + 1).fill(false);
    dp[0] = true; // 和为 0 总是可达的

    for (const num of nums) {
        for (let j = target; j >= num; j--) {
            dp[j] = dp[j] || dp[j - num];
        }
    }

    return dp[target];
}

console.log(canPartition([1, 5, 11, 5])); // true → {1,5,5} 和 {11}
console.log(canPartition([1, 2, 3, 5]));  // false
```

### LeetCode 494：目标和

> 给一个数组和目标值 `target`，你可以在每个数字前加 `+` 或 `-`，求有多少种方法使表达式的值等于 `target`。

换个角度：设正数集合的和为 `P`，负数集合的和为 `N`，则：
- `P - N = target`
- `P + N = sum`

两式相加：`P = (target + sum) / 2`。问题变成——**从数组中选若干个数，使其和恰好等于 `P` 的方案数**。还是背包！

```typescript
function findTargetSumWays(nums: number[], target: number): number {
    const sum = nums.reduce((a, b) => a + b, 0);
    // (target + sum) 必须是偶数且非负
    if ((target + sum) % 2 !== 0 || target + sum < 0) return 0;

    const p = (target + sum) / 2;
    const dp: number[] = new Array(p + 1).fill(0);
    dp[0] = 1; // 和为 0 有 1 种方案（什么都不选）

    for (const num of nums) {
        for (let j = p; j >= num; j--) {
            dp[j] += dp[j - num];
        }
    }

    return dp[p];
}

console.log(findTargetSumWays([1, 1, 1, 1, 1], 3)); // 5
```

### LeetCode 1049：最后一块石头的重量 II

> 每次选两块石头碰撞，重量差留下，求最小剩余重量。

转换：把石头分成两堆，使两堆重量差最小 → 从 `n` 块石头中选若干块，使其重量尽可能接近 `sum / 2`。又是背包！

## 复杂度总结

| 方案 | 时间 | 空间 | 适用场景 |
|------|------|------|----------|
| 二维 DP | O(n × W) | O(n × W) | 需要还原方案路径时 |
| 一维滚动数组 | O(n × W) | O(W) | 只需要最优值时（推荐） |

> 注意：这里 W 是背包容量，如果 W 非常大（比如 10^9），DP 就不适用了，需要考虑贪心或分支限界等方法。

## 实际应用场景

背包问题远不止面试题，实际开发中也经常遇到：

1. **资源分配**：服务器有固定的 CPU/内存预算，有 N 个服务要部署，每个服务需要不同资源、带来不同收益，怎么分配最优？
2. **物流装载**：货车有载重限制，货物有价值和重量，怎么装收益最大？
3. **广告投放**：预算有限，每个广告位有不同点击率和成本，怎么投放 ROI 最高？
4. **投资组合**：手上有 N 万，有若干项目可投，每个项目需要不同本金、预期回报不同。

这些场景的本质都是："**在有限资源下做选择，使收益最大化**"——就是背包问题。

## 总结

| 要点 | 内容 |
|------|------|
| 核心思想 | 每件物品选或不选，用 DP 记录每种状态下的最优解 |
| 状态定义 | `dp[i][j]` = 前 i 件物品、容量 j 时的最大价值 |
| 状态转移 | `dp[i][j] = max(不选, 选)` |
| 空间优化 | 滚动数组，一维 dp，**从右往左遍历** |
| 面试技巧 | 看到"选/不选""分成两组""凑目标值"就要往背包上想 |

记住一句话：**背包问题的本质是"有限资源下的最优选择"**。下次面试遇到类似的题目，先问自己——"这能不能转换成选或不选的问题？"如果能，大概率就是背包。

祝你下次面试一背包就中 🎯
