---
title: 分治算法
description: 分治算法（Divide and Conquer）—— 拆问题的艺术
date: 2026-10-12 09:00:56
categories:
  - Algorithm
tags:
  - divide-and-conquer
sidebarSort: 103
---

# 分治算法（Divide and Conquer）

我跟你说一个面试里经常发生的小故事。

面试官问："写一下归并排序。"你刷刷两下写完了。他看了一眼说："不错。那你知道归并排序用的是什么思想吗？"

你脱口而出："分治啊！"

"好。那**分治三步是什么？**""分、治、合？"

"再具体点呢？每一**步**在做什么？为什么这样设计？想清楚了吗？"

你愣住了。

这就是很多朋友的问题：**平时刷题用着分治，但真要让他把"分治"讲清楚，他反而讲不出个所以然**。算法会写，但底层思维是糊的。今天我们就来彻底讲清楚——分治到底是什么、为什么这么强大、什么时候该用、什么时候不该用，以及怎么用它精确地分析复杂度。

讲完你会发现：**这玩意儿根本不是某个具体算法，而是一种"解题的元方法"**。学完它，你看任何递归题都会清晰很多。

---

## 一、生活场景：分治其实就是找"代理"

我特别想先聊一个生活里的类比，因为它比抽象定义好懂得多。

> 你是一家公司的老板，公司有 1000 个员工。你想做一件事：**选出全公司最高的那个员工**。

如果让你一个人干，你得挨个问："你多高？"然后在心里记下最大值。1000 个人问下来，你脑瓜子嗡嗡的。一个人，O(n) 的工作量。

但你可以换个玩法：

```
你把 1000 人分成 4 组，每组 250 人
  → 你让 4 个组长去自己组里挑最高的
  → 4 个组长再各自把 250 人分成 4 组（每组 60 多人）
  → ……
  → 最后每个组长会给你一个"我组里最高的"，4 个里再比一次
```

你看，这就是一个**层层下放**的过程。这个过程的本质：

```
原问题（找 1000 人中最高） → 拆成 4 个子问题（找每组 250 人中最高） → 组长再把子问题拆小 → ……
```

你不再是一个人干所有事，你找了若干个"代理"。代理帮你干完了各自的活，你只需要把结果**汇总一下**（4 个组里最高的再比一次）。

**这就是分治**。听着挺简单对吧？我们下面把它抽象成公式。

---

## 二、分治三步：Divide / Conquer / Combine

教科书上一般用很抽象的语言讲分治。我直接上大白话：

### 第 1 步：Divide（分）

把原问题**拆成若干个规模更小的、同类型的子问题**。

比如：

- **归并排序**：把 `[5, 2, 8, 1, 4]` 拆成 `[5, 2]` 和 `[8, 1, 4]`，再拆到单个元素
- **二分查找**：每次把搜索区间砍掉一半
- **归并排序递归建 BST**：把数组拆成 `[左半]` 和 `[右半]`，然后各自递归建树
- **快速排序**：找一个 pivot，把数组拆成"小于 pivot"和"大于等于 pivot"两部分

### 第 2 步：Conquer（治）

**递归地**解决每个子问题。当子问题足够小（base case），直接出结果。

比如：归并排序里，当子数组长度只有 1 时，`return [arr[0]]`，因为单个元素天然有序。

### 第 3 步：Combine（合）

把子问题的结果**合并**起来，得到原问题的解。

比如：归并排序里，把两个有序子数组合并成一个更大的有序数组。

**三步合起来的伪代码：**

```text
function solve(problem):
    if problem.size <= base_case_threshold:
        return trivial_solution(problem)   # 治

    sub_problems = divide(problem)        # 分

    results = []
    for sp in sub_problems:
        results.append(solve(sp))         # 治（递归）

    return combine(results)               # 合
```

注意几点：

1. **子问题必须和原问题是同一类问题**。建树拆出来的还是建树，归并拆出来的还是归并。如果你拆出来变成了另一个问题，那就不是分治了。
2. **子问题之间要相互独立**（最好）。如果有大量重叠，就别用分治，用动态规划（这就是后面我们讲"分治 vs DP"的原因）。
3. **Combine 的代价不能太高**。如果你分完、合不起来，分治就是失败的。下面讲归并 vs 插入排序对比的时候你就懂了。

---

## 三、为什么分治这么牛？主定理

面试官最喜欢问的一个问题：**"你写这个算法，怎么判断它有多快？"** 很多朋友会说："呃……感觉是 O(n log n)？" 但说不出为什么。

分治类算法有个神器：**主定理（Master Theorem）**。它能让你**秒判**大多数分治算法的时间复杂度。

### 主定理是什么

如果你的递归式长这样：

```text
T(n) = a · T(n/b) + O(n^d)
```

其中：

- `a`：子问题的**个数**（你把原问题拆成了几份）
- `n/b`：每个子问题的**规模**（拆成几分之一）
- `O(n^d)`：除了递归之外，**合并结果**的代价

那么：

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   if a < b^d    →  T(n) = O(n^d)         合并占主导            │
│                                                                │
│   if a = b^d    →  T(n) = O(n^d · log n)  刚好平衡              │
│                                                                │
│   if a > b^d    →  T(n) = O(n^(log_b(a))) 递归占主导            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

是不是看着有点抽象？我举几个例子，立刻秒懂。

### 例 1：归并排序

```text
T(n) = 2 · T(n/2) + O(n)
      ↑        ↑          ↑
      2 份    规模减半   合并代价是 O(n)（两个有序数组合并，扫一遍）
```

对应到主定理：`a=2, b=2, d=1` → 算出 `b^d = 2^1 = 2`，跟 `a=2` 相等 → 中间情况 → **`T(n) = O(n log n)`** ✅

### 例 2：二分查找

```text
T(n) = 1 · T(n/2) + O(1)
      ↑        ↑        ↑
      1 份    规模减半  不需要合并，因为只看一半
```

`a=1, b=2, d=0` → `b^d = 1`，跟 `a=1` 相等 → 中间情况 → **`T(n) = O(log n)`** ✅

### 例 3：插入排序（递归版）

```text
T(n) = 1 · T(n-1) + O(n)
      ↑         ↑         ↑
      1 份    只缩小 1  合并代价 O(n)（要挪一堆元素）
```

这其实**不是分治**！因为子问题规模没显著缩小（n-1 跟 n 没差多少），所以主定理不算这种情况。它的复杂度是 **`O(n²)`**。

### 主定理的直觉版记忆

你可以这么记：

| 你在干啥 | 时间复杂度 |
|---------|-----------|
| 子问题比较"轻"，合并很"重"（比如算 100 万次合并操作） | 跟着合并走 |
| 子问题比较"重"，递归很深（要把 n=1 亿的拆 n 次） | 跟着层数走 |
| 两者刚好匹配 | 多一个 log n |

下次遇到任何分治算法，第一件事就是写出 `T(n) = a·T(n/b) + O(n^d)`，然后套公式。

---

## 四、五大经典案例：一个一个拆开看

光说理论太干。我把分治最经典的 5 个应用场景过一遍，每个都讲清楚"为什么能用分治"+"怎么分治"。

### 案例 1：归并排序（最经典的 D&C）

我们已经很熟了，直接看代码回忆一下：

```typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;        // base case

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));    // Divide + Conquer
  const right = mergeSort(arr.slice(mid));      // Divide + Conquer

  return merge(left, right);                    // Combine
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}
```

**对应主定理**：T(n) = 2T(n/2) + O(n) → O(n log n)

### 案例 2：二分查找

```typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
```

**对应主定理**：T(n) = T(n/2) + O(1) → O(log n)

> 注意：二分查找虽然"分治"但只有 1 个子问题，所以属于"减治（decrease and conquer）"的一种，主定理照样适用。

### 案例 3：从有序数组构造平衡 BST（LeetCode 108）

**问题**：给你一个升序排列的数组，把它转成一颗**高度平衡**的二叉搜索树。

```typescript
function sortedArrayToBST(nums: number[]): TreeNode | null {
  if (nums.length === 0) return null;

  const mid = Math.floor(nums.length / 2);
  const root = new TreeNode(nums[mid]);
  root.left = sortedArrayToBST(nums.slice(0, mid));     // Divide
  root.right = sortedArrayToBST(nums.slice(mid + 1));   // Divide + Conquer

  return root;                                            // Combine（其实就是 attach）
}
```

**为什么是分治？**

- 把数组从中点拆开 → 中点作为根 → 左半建左子树 → 右半建右子树
- 子问题（建左子树、建右子树）跟原问题（建整棵树）是同一类问题
- 合并只是把两棵子树挂到根上，O(1)

**对应主定理**：T(n) = 2T(n/2) + O(1) → a=2, b=2, d=0 → b^d=1 < a=2 → **T(n) = O(n^log₂2) = O(n)**

诶？O(n)？是不是觉得不对劲？我们建了一棵树，不应该是 O(n log n) 吗？

来算账：每个节点会被访问一次（创建 + 挂到父节点），一共 n 个节点，所以总操作是 O(n)。**`arr.slice()` 本身的开销也要算上**——如果算上，整个复杂度其实是 O(n log n)。我们这里忽略了 slice 的代价，因为用下标版可以省掉。

### 案例 4：多数元素（LeetCode 169）

**问题**：数组里某个数出现次数超过 ⌊n/2⌋，找出它。

**分治思路**：

```
如果 a 在左半边是众数，且它在左半边出现 > leftLen/2
并且 a 在右半边不是众数
那么 a 在整个数组里也不是众数吗？

不一定。我们需要：分别求左右的众数，然后看谁在全局占多数
```

```typescript
function majorityElement(nums: number[]): number {
  return majorityElementRec(nums, 0, nums.length - 1);
}

function majorityElementRec(nums: number[], lo: number, hi: number): number {
  if (lo === hi) return nums[lo];

  const mid = Math.floor((lo + hi) / 2);
  const left = majorityElementRec(nums, lo, mid);
  const right = majorityElementRec(nums, mid + 1, hi);

  if (left === right) return left;

  // 数一下 left 和 right 在 [lo, hi] 区间里各出现几次
  let leftCount = 0, rightCount = 0;
  for (let i = lo; i <= hi; i++) {
    if (nums[i] === left) leftCount++;
    if (nums[i] === right) rightCount++;
  }

  return leftCount > rightCount ? left : right;
}
```

**对应主定理**：T(n) = 2T(n/2) + O(n) → **O(n log n)**

看起来比 Boyer-Moore 投票算法的 O(n) 慢，但因为它**易写、易推广**（比如改成"找出现超过 n/3 的所有数"就只需要稍微改一下），分治版在面试里其实更稳。

### 案例 5：最大子数组和（Kadane 其实是 DP，但我能用分治做）

我们已经知道 Kadane 算法是 O(n) DP 版。但**我们也能用分治做**：

```
把数组从中点切开
最大子数组要么完全在左半、要么完全在右半、要么跨过中点
那么就：分别求这 3 种情况 → 取最大值
```

```typescript
function maxSubArray(nums: number[]): number {
  return divide(nums, 0, nums.length - 1);
}

function divide(nums: number[], lo: number, hi: number): number {
  if (lo === hi) return nums[lo];

  const mid = Math.floor((lo + hi) / 2);
  const leftMax = divide(nums, lo, mid);
  const rightMax = divide(nums, mid + 1, hi);
  const crossMax = maxCross(nums, lo, mid, hi);

  return Math.max(leftMax, rightMax, crossMax);
}

function maxCross(nums: number[], lo: number, mid: number, hi: number): number {
  // 从 mid 向左扫，找最大前缀和
  let leftSum = -Infinity, sum = 0;
  for (let i = mid; i >= lo; i--) {
    sum += nums[i];
    leftSum = Math.max(leftSum, sum);
  }
  // 从 mid+1 向右扫，找最大后缀和
  let rightSum = -Infinity;
  sum = 0;
  for (let i = mid + 1; i <= hi; i++) {
    sum += nums[i];
    rightSum = Math.max(rightSum, sum);
  }
  return leftSum + rightSum;
}
```

**对应主定理**：T(n) = 2T(n/2) + O(n) → **O(n log n)**

显然不如 Kadane 的 O(n) 快，**但分治的好处是它能记录子数组的左右端点位置**——这是 Kadane 改起来麻烦的地方。

---

## 五、分治 vs 动态规划 vs 贪心：什么时候用谁

这是个经典面试题。我经常被学生问："老师，我看到递归题，咋判断该用分治还是 DP 还是贪心？"

我告诉你一个非常实用的**三步判别法**：

```
┌────────────────────────────────────────────────────────────────┐
│  第 1 问：问题能被拆成"子问题"吗？                              │
│           不能拆 → 不能用这三者，考虑别的算法                    │
│           能拆  → 继续                                          │
│                                                                │
│  第 2 问：子问题之间有没有重叠？                                  │
│           有重叠 → DP（用记忆化或者 dp table 复用子解）          │
│           没重叠 → 继续                                         │
│                                                                │
│  第 3 问：有没有一种"贪心的局部选择"保证全局最优？                │
│           有 → 贪心（更快，但不一定所有问题都有）                 │
│           没有 → 分治                                           │
└────────────────────────────────────────────────────────────────┘
```

来个对比表：

| 维度 | 分治 | DP | 贪心 |
|------|------|-----|------|
| 子问题独立 | ✅ 必须 | ❌ 允许重叠 | ✅ 通常独立 |
| 时间复杂度 | 通常 O(n log n) | 通常 O(n²) / O(n) | 通常 O(n) / O(n log n) |
| 关键操作 | 拆分 + 合并 | 状态转移 | 局部最优选 |
| 适合场景 | 完全独立的子任务 | 有后效性的最优化 | 有贪心选择性质 |
| 举例 | 归并排序 / 快排 / 建树 | 最长子序列 / 背包 / 编辑距离 | 区间调度 / Dijkstra |

**一个具体的判别例子**：

> 问题：爬楼梯，每次 1 或 2 阶，到第 n 阶有几种方法？

- 能拆吗？ ✅ f(n) = f(n-1) + f(n-2)
- 子问题重叠吗？ ✅ 重！所以是 DP
- 有贪心性质吗？ ❌ 没有"局部"决策能保证全局最优

→ 用 DP（斐波那契数列）。

**反过来**：

> 问题：把数组分成两半，使得两半和的差最小？

- 能拆吗？ ✅ 拆两半
- 子问题重叠吗？ ❌ 每种切法的左半、右半都不重叠
- 有贪心吗？ ❌ 局部最优（先装大的）不对

→ 用分治 + 全枚举。

---

## 六、分治的几个工程陷阱

光会写是不够的，工程里分治有一些**容易踩的坑**，我列几个常见问题。

### 坑 1：base case 没写对，导致无限递归

```typescript
// ❌ 错误示范
function badRecursion(n: number): number {
  return badRecursion(n - 1) + n;
  // 没 base case，无限递归直到栈溢出
}

// ✅ 正确示范
function goodRecursion(n: number): number {
  if (n <= 1) return n;          // base case
  return goodRecursion(n - 1) + n;
}
```

**经验**：写分治代码时，**第一件事就是写 base case**。我经常看到学生写了三屏代码，base case 是空的。

### 坑 2：子问题切错，导致没收敛

```typescript
// ❌ 不是真正的分治，规模没缩小
function fakeDivide(n: number): void {
  if (n === 0) return;
  fakeDivide(n);          // n 没缩小，无限递归
  fakeDivide(n - 1);     // 一支会收敛，但另一支不会
}

// ✅ 正确示范：每路递归规模都缩小
function realDivide(n: number): void {
  if (n <= 1) return;
  realDivide(Math.floor(n / 2));   // 规模变成一半
  realDivide(Math.floor(n / 2));   // 规模变成一半
}
```

### 坑 3：合并代价太大，把 O(n log n) 变成 O(n²)

合并步骤是分治算法的"瓶颈"。比如：

```typescript
// ❌ 合并用 Array.indexOf + Array.splice，是 O(n)
function badMerge(left: any[], right: any[]): any[] {
  const result = [];
  for (const item of left) {
    result.push(item);
    const idx = result.indexOf(item);  // 这又是 O(n)
    result.splice(idx, 0, item);
  }
  return result;
}

// ✅ 合并老老实实 O(n) 扫一遍
function goodMerge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}
```

### 坑 4：在 JS/TS 里，`slice` 隐式 O(k) 开销

前面我用 `arr.slice(0, mid)` 和 `arr.slice(mid)` 是因为**简单**。但在性能敏感场景，它们其实是 **O(k)** 的（k 是子数组长度），会让你的实际复杂度比主定理算出来的高。

```typescript
// ❌ 带 slice 的"分治"
function mergeSortWithSlice(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSortWithSlice(arr.slice(0, mid));    // slice 是 O(mid)
  const right = mergeSortWithSlice(arr.slice(mid));      // slice 是 O(n-mid)
  return merge(left, right);
}
// 总开销：每层都做 O(n) 的 slice，共 log n 层 → O(n log n) 的额外开销

// ✅ 用下标，避免 slice
function mergeSortIdx(arr: number[], lo = 0, hi = arr.length - 1): void {
  if (lo >= hi) return;
  const mid = Math.floor((lo + hi) / 2);
  mergeSortIdx(arr, lo, mid);
  mergeSortIdx(arr, mid + 1, hi);
  mergeInPlace(arr, lo, mid, hi);
}
// 这是工业级写法，归并排序的标准实践
```

### 坑 5：递归深度太大爆栈

JS 的递归深度默认上限大概 10000 层（V8）或者几万层。如果你的分治深度超过这个值，就会爆栈。

**解决办法**：

- 二分查找 → 转循环（参考前面的代码）
- 归并排序（深度 log₂ n） → 一般不会爆栈，但 10 亿元素会 → 改成迭代版归并排序（bottom-up）
- 真正可能爆的：分治计算树高 / 平衡树时如果树本身很深

---

## 七、工程实战：分治的真实应用

光讲理论太空，我列几个**工程里常见**的分治应用，让你有个具象的体感。

### 场景 1：大文件排序（外排序）

如果你有 100GB 的日志文件，单机内存只有 16GB，怎么排序？

```
┌────────────────────────────────────────────────────────────────┐
│  分治思路：                                                      │
│  1. 把 100GB 文件切成 10 份 10GB 的小文件                      │
│  2. 每份依次读进内存 → 内部排序（用快排或归并）                   │
│  3. 把 10 个有序小文件做 K 路归并（堆优化）→ 写出有序大文件        │
└────────────────────────────────────────────────────────────────┘
```

这就是经典的**外排序（External Sort）**。MapReduce 的 shuffle 阶段就是这个思路。

### 场景 2：最近点对问题（Closest Pair of Points）

平面上 n 个点，找距离最近的两个点。暴力 O(n²)。**分治**能做到 **O(n log n)**：

```
1. 按 x 坐标排序
2. 二分切成两半
3. 递归求左半的最近点对 + 右半的最近点对
4. 关键：跨中线的点对 → 用一个精妙的"按 y 排序 + 滑窗"思路
```

这是计算几何的经典问题，面试不太爱考（除非你面游戏/图形岗），但学了会很爽。

### 场景 3：大整数乘法（Karatsuba 算法）

两个 n 位大数相乘，普通算法 O(n²)。**Karatsuba** 用分治做到 O(n^1.585)：

```
把 x 拆成 a · 10^(n/2) + b
把 y 拆成 c · 10^(n/2) + d

x · y = ac · 10^n + (ad + bc) · 10^(n/2) + bd

巧妙之处：ad + bc = (a+b)(c+d) - ac - bd

所以我们只需要 3 次乘法（ac、(a+b)(c+d)、bd），而不是 4 次！
```

这个 trick 就**直接缩减了一个乘法**，带来了整体复杂度从 n² 降到 n^log₂3 ≈ n^1.585。

### 场景 4：矩阵乘法（Strassen 算法）

类似的思路用在 n×n 矩阵乘法上。普通 O(n³)，Strassen 用分治做到 **O(n^2.807)**。

工程里**很少用**（常数项大），但作为"分治的强大潜力"的代表例子，**面试偶尔会聊到**。

### 场景 5：CDQ 分治（偏题，但是面试炫技加分的）

CDQ 分治是用来解决**三维偏序问题**（如"求每个点有多少个点在它左下且值小于它"）的进阶分治玩法。它把 DP 的状态转移用分治搞成 O(n log²n)，是 ACM/OI 选手的炫技利器。**工业界几乎用不上**，但面试聊起来显得你很懂。

---

## 八、复杂度分析的"分治四件套"

最后再总结一下分析分治算法复杂度的完整方法。我把它叫做"四件套"：

```
┌────────────────────────────────────────────────────────────────┐
│  第一件：画出递归树                                                │
│           把每一层的"问题规模"和"每层的操作总数"标出来                  │
│           例如归并排序：第 0 层 n、第 1 层 n、第 2 层 n...              │
│           每层都是 O(n)，共有 O(log n) 层                              │
│           所以总复杂度 O(n log n)                                       │
│                                                                │
│  第二件：套主定理                                                    │
│           T(n) = a·T(n/b) + O(n^d)                                   │
│           a 是子问题个数，b 是规模缩小倍数，d 是合并开销的指数            │
│           直接套公式                                                  │
│                                                                │
│  第三件：写出递归式 + 主定理算不出的特殊情况                           │
│           比如快排的平均情况 T(n) = 2T(n/2) + O(n)，主定理刚好对得上     │
│           但快排的最坏情况 T(n) = T(n-1) + O(n) 不是主定理的形式        │
│           这种就需要展开递归式或者用数学归纳法                          │
│                                                                │
│  第四件：实际跑 benchmark                                              │
│           理论复杂度再漂亮，实际跑起来不一定快                            │
│           分治的常数项通常不小（递归调用、内存分配），建议实测               │
└────────────────────────────────────────────────────────────────┘
```

---

## 九、分治的"反模式"：什么时候**不该**用

最后讲几个分治**不该用**的场景，避免你走火入魔：

### 反模式 1：子问题严重重叠

比如斐波那契数列：

```typescript
// ❌ 用分治（纯递归），指数级复杂度
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
// T(n) ≈ 1.618^n，黄金分割的指数增长！
```

为什么这么慢？因为 `fib(n-1)` 和 `fib(n-2)` 共享了大量子问题（`fib(n-2)`、`fib(n-3)` 会被算两遍）。

**解决办法**：用 DP（记忆化或者递推）→ O(n)。

```typescript
// ✅ DP 版，O(n) 时间 O(1) 空间
function fib(n: number): number {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}
```

### 反模式 2：合并代价太大

如果合并需要扫描整个问题域，那分治就退化成 O(n²) 或者更糟。

比如"找出数组所有逆序对"的朴素分治版本：

```
T(n) = 2T(n/2) + O(n²)   ← 合并代价太大
     = O(n²)
```

→ 应该用**归并排序的副产物**来做，merge 阶段顺便数逆序对 → O(n log n)。

### 反模式 3：子问题规模没显著缩小

快排的最坏情况：每次选的 pivot 是最大/最小值，把数组拆成 0 和 n-1。

```
T(n) = T(n-1) + O(n) = O(n²)
```

这种情况下，分治没带来任何加速，反而因为递归开销慢了。

**解决办法**：

- **三数取中** 选 pivot
- 或者**随机化** pivot
- 极端情况退化时切换到**堆排序**（这正是很多工业级 quicksort 的做法，比如 `Array.prototype.sort` 在 V8 里实现）

---

## 十、写在最后：分治是一种思考方式

学到这里，你应该已经看明白了——**分治不是某个算法，而是一种"思考算法的方式"**。

它的本质是：**把一个你暂时解决不了的大问题，拆成你能解决的小问题，然后想办法把答案拼回来**。

工程里绝大多数算法，你稍微分析一下都会发现：

- 树相关的（建树、查找、求高度、求 LCA） → 经常用到分治
- 排序类（归并、快排） → 分治
- 计算几何（最近点对、凸包） → 分治
- 字符串（后缀数组、Karatsuba 大数乘法） → 分治
- 分布式系统（Hadoop/MapReduce） → 分治

下次遇到一个递归题，先问自己三个问题：

1. 能不能拆？
2. 拆完之后合并代价大不大？
3. 子问题之间有没有重叠？

带着这三个问题去分析，你会发现**算法题没那么玄乎**。

---

## 参考资料

- 《算法导论》第 2 章 / 第 4 章（分治策略 + 主定理）
- LeetCode 108（有序数组转 BST）、LeetCode 169（多数元素）、LeetCode 53（最大子数组和）
- 《编程珠石》第 11 章（外排序）

---

下期预告：**线段树的进阶玩法 —— 懒标记（Lazy Propagation）**。如果你之前看了线段树但对懒标记半知半解，下一篇会帮你彻底打通。
