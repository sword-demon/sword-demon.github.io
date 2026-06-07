---
title: 最长递增子序列
description: 最长递增子序列（Longest Increasing Subsequence）
date: 2026-06-07 10:00:00
categories:
  - Algorithm
tags:
  - lis
  - dynamic-programming
  - binary-search
sidebarSort: 39
---

# 最长递增子序列（Longest Increasing Subsequence）

你是一名后端开发，最近在做一个推荐系统的排序模块。系统会给每个候选商品打分，你要在这些分数序列里找到一个"越来越高的子序列"——用来分析用户的兴趣趋势是持续上升还是波动。

比如用户对 5 个商品的评分是 `[10, 9, 2, 5, 3, 7, 101, 18]`，你想找到一个最长的递增序列，比如 `[2, 3, 7, 18]` 或者 `[2, 5, 7, 18]`——长度都是 4。

这个问题就是经典的 **最长递增子序列（Longest Increasing Subsequence，LIS）**。它是面试中出现频率最高的 DP 题之一，而且它的解法从 O(n²) 到 O(n log n) 的进化过程非常优雅，值得好好拆解 ✨。

> **子串 vs 子序列**：子串必须连续，子序列可以跳着选。`[2, 5, 7]` 是 `[10, 9, 2, 5, 3, 7, 101, 18]` 的子序列，但不是子串。

## 原理拆解

### 思路一：动态规划 O(n²)

先想最直觉的 DP 解法。定义 `dp[i]` 为：**以第 i 个元素结尾的最长递增子序列长度**。

那状态转移怎么推？对于 `dp[i]`，我们回头看前面所有的 `j < i`：

```
如果 nums[j] < nums[i]，说明 nums[i] 可以接在以 nums[j] 结尾的序列后面
dp[i] = max(dp[i], dp[j] + 1)
```

图解一下：`nums = [10, 9, 2, 5, 3, 7, 101, 18]`

```
索引:     0    1    2    3    4    5    6     7
nums:   [10,   9,   2,   5,   3,   7,  101,  18]
dp:     [ 1,   1,   1,   1,   1,   1,   1,    1]  ← 初始值：每个元素自身就是长度 1

i=1: 9 < 10? No → dp[1] = 1
i=2: 2 < 10? No, 2 < 9? No → dp[2] = 1
i=3: 5 < 10? No, 5 < 9? No, 5 > 2 ✓ → dp[3] = dp[2] + 1 = 2
i=4: 3 > 2 ✓ → dp[4] = dp[2] + 1 = 2
i=5: 7 > 2 ✓, 7 > 5 ✓, 7 > 3 ✓ → dp[5] = max(dp[2], dp[3], dp[4]) + 1 = 3
i=6: 101 比前面所有都大 → dp[6] = max(所有 dp) + 1 = 4
i=7: 18 > 7 ✓, 18 < 101 → dp[7] = dp[5] + 1 = 4

最终 dp: [1, 1, 1, 2, 2, 3, 4, 4]
答案: max(dp) = 4
```

### 代码实现：DP 版本

```typescript
function lengthOfLIS(nums: number[]): number {
  const n = nums.length;
  if (n === 0) return 0;

  // dp[i] 表示以 nums[i] 结尾的最长递增子序列长度
  const dp: number[] = new Array(n).fill(1);
  let maxLen = 1;

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }

  return maxLen;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));             // 4
console.log(lengthOfLIS([7, 7, 7, 7, 7]));                 // 1
```

**复杂度**：时间 O(n²)，空间 O(n)。

对于大多数面试场景，这个解法已经够用了。但如果 n 达到 10⁵ 级别，O(n²) 就撑不住了。接下来我们看一个更优的解法。

---

### 思路二：贪心 + 二分查找 O(n log n)

这个思路堪称经典中的经典，面试官最爱问的优化方向。

#### 核心直觉

维护一个数组 `tails`，其中 `tails[i]` 表示：**长度为 i+1 的递增子序列中，最小的末尾元素**。

为什么这样维护有用？因为末尾元素越小，后面能接的数就越多（更容易满足递增条件）。

```
贪心策略：
  - 如果当前数比 tails 里所有数都大 → 追加，LIS 长度 +1
  - 如果当前数可以替换 tails 里某个数 → 替换成更小的，给未来"留更多空间"
  - 替换的时候用二分查找，所以是 O(log n)
```

#### 图解过程

`nums = [10, 9, 2, 5, 3, 7, 101, 18]`

```
处理 10:  tails = [10]                    → LIS 长度 = 1
处理 9:   9 < 10，替换 → tails = [9]      → LIS 长度 = 1
处理 2:   2 < 9，替换  → tails = [2]      → LIS 长度 = 1
处理 5:   5 > 2，追加  → tails = [2, 5]   → LIS 长度 = 2
处理 3:   3 > 2, 3 < 5，替换 → tails = [2, 3]   → LIS 长度 = 2
处理 7:   7 > 3，追加  → tails = [2, 3, 7]       → LIS 长度 = 3
处理 101: 101 > 7，追加 → tails = [2, 3, 7, 101] → LIS 长度 = 4
处理 18:  18 > 7, 18 < 101，替换 → tails = [2, 3, 7, 18] → LIS 长度 = 4

答案 = 4 ✅
```

注意看 `tails` 始终是有序的！所以我们可以用二分查找来定位"第一个 >= 当前数"的位置，然后替换。

> ⚠️ `tails` 最终的内容 **不一定是** 一个真正的 LIS。它只是用来计算长度的。如果你要还原真实的 LIS，需要额外记录路径。

### 代码实现：贪心 + 二分

```typescript
function lengthOfLIS(nums: number[]): number {
  // tails[i] = 长度为 i+1 的递增子序列中最小的末尾元素
  const tails: number[] = [];

  for (const num of nums) {
    // 二分查找：找到 tails 中第一个 >= num 的位置
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < num) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    if (lo === tails.length) {
      // num 比 tails 中所有数都大，扩展 LIS
      tails.push(num);
    } else {
      // 替换成更小的值，为未来留更多空间
      tails[lo] = num;
    }
  }

  return tails.length;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));             // 4
console.log(lengthOfLIS([7, 7, 7, 7, 7]));                 // 1
```

**复杂度**：时间 O(n log n)，空间 O(n)。

#### 二分查找为什么能用？

关键在于 `tails` 数组始终是 **单调递增** 的。证明很直觉：

- 当我们追加一个数时，它一定比 `tails` 末尾大，递增性保持
- 当我们替换 `tails[lo]` 时，我们是用一个 **更小的数** 替换，不会破坏后面的相对顺序

---

### 进阶：还原真实 LIS 路径

面试官有时候会追问：不仅要长度，还要输出 **一个** 最长递增子序列。

```typescript
function findLIS(nums: number[]): number[] {
  const n = nums.length;
  if (n === 0) return [];

  const tails: number[] = [];
  const indices: number[] = [];     // tails 每个位置对应的原始索引
  const prev: number[] = new Array(n).fill(-1); // 记录前驱，用于回溯路径

  for (let i = 0; i < n; i++) {
    const num = nums[i];
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < num) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    if (lo === tails.length) {
      tails.push(num);
      indices.push(i);
    } else {
      tails[lo] = num;
      indices[lo] = i;
    }

    // 记录前驱：当前 LIS 长度为 lo，前一个元素在 indices[lo - 1]
    prev[i] = lo > 0 ? indices[lo - 1] : -1;
  }

  // 从最后一个被选中的索引回溯
  const lisLen = tails.length;
  const result: number[] = [];
  let k = indices[lisLen - 1];
  while (k !== -1) {
    result.push(nums[k]);
    k = prev[k];
  }

  return result.reverse();
}

console.log(findLIS([10, 9, 2, 5, 3, 7, 101, 18])); // [2, 3, 7, 18]（可能的解之一）
console.log(findLIS([0, 1, 0, 3, 2, 3]));             // [0, 1, 2, 3]
```

---

## 变体问题

LIS 不仅仅是"严格递增"这一种，面试中经常变着花样考：

### 1. 非严格递增（允许相等）

把 `tails[mid] < num` 改成 `tails[mid] <= num` 就行。区别在于相等的元素算不算"递增"：

```typescript
// 严格递增：tails[mid] < num
// 非严格递增（LIS 定义改为不下降）：tails[mid] <= num
```

### 2. 最长递减子序列（LDS）

把数组取反，或者把二分查找的方向反过来即可。

### 3. 俄罗斯套娃信封问题（LeetCode 354）

给你一堆信封 `(w, h)`，一个信封能套进另一个当且仅当 `w1 < w2 && h1 < h2`。问最多能套几层？

```
解法：按宽度升序排序，宽度相同时按高度降序排序，然后对高度求 LIS。

为什么要"宽度相同按高度降序"？因为宽度相同时，两个信封不能互相套，
按高度降序排序确保宽度相同时不会在 LIS 中同时选中两个。
```

```typescript
function maxEnvelopes(envelopes: [number, number][]): number {
  // 按宽度升序，宽度相同时按高度降序
  envelopes.sort((a, b) => a[0] === b[0] ? b[1] - a[1] : a[0] - b[0]);

  // 对高度求 LIS（贪心 + 二分）
  const tails: number[] = [];
  for (const [, h] of envelopes) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < h) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) tails.push(h);
    else tails[lo] = h;
  }
  return tails.length;
}

console.log(maxEnvelopes([[5,4],[6,4],[6,7],[2,3]])); // 3 → [2,3] → [5,4] → [6,7]
```

### 4. 最长数对链（LeetCode 646）

和信封问题类似，给定 `[[1,2], [2,3], [3,4]]`，找到最长的链使得每对 `a[1] < b[0]`。

---

## 实际应用场景

LIS 远不只是面试题，在实际系统里到处都是：

- **版本控制系统**：找出文件变更序列中最长的"持续改进"阶段
- **股票分析**：在价格序列中找到最长的持续上涨区间
- **推荐系统**：分析用户评分的趋势，判断兴趣是否持续上升
- **基因序列分析**：DNA 序列中寻找最长递增子序列，用于比对
- **游戏排行榜**：玩家历史排名中找到最长的"进步期"

---

## 复杂度对比

| 方法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|-----------|-----------|---------|
| DP | O(n²) | O(n) | n ≤ 10⁴，面试首选 |
| 贪心 + 二分 | O(n log n) | O(n) | n ≤ 10⁵，性能敏感场景 |

---

## 总结

- **DP 解法** 是基础，理解 `dp[i]` 的含义和状态转移方程是关键
- **贪心 + 二分** 是优化利器，核心思想是"维护最小末尾值，给未来留更多空间"
- `tails` 数组 **不等于** 真实的 LIS，只是用来算长度的
- 面试时建议先写 O(n²) DP 拿到基础分，再主动提出 O(n log n) 优化，展示算法功底 💪
- 变体问题（信封、数对链）本质上都是 LIS 的"套壳"，掌握了核心思想就能举一反三
