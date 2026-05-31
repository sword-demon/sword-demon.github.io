---
title: Top K 问题
description: Top K 问题——用堆和快速选择高效求解第 K 大/小元素
date: 2026-05-31 09:00:00
categories:
  - Algorithm
tags:
  - top-k
  - heap
  - quick-select
sidebarSort: 34
---

# Top K 问题

面试官说："这道题是 LeetCode 215，求数组中第 K 大的元素。" 你心想，排序不就完了？`sort` 一下取第 K 个，两行代码搞定。面试官微微一笑："时间复杂度是多少？" 你说 O(n log n)。他说："能不能做到 O(n)？"

这就是 Top K 问题的经典场景。它看起来简单，但背后藏着好几种解法，每种的时间复杂度和适用场景都不一样。今天我们从最直觉的解法开始，一步步优化到最优解 🔥。

## 问题定义

给你一个未排序的数组，找出其中第 K 大的元素（或最大的 K 个元素）。

```
输入: nums = [3, 2, 1, 5, 6, 4], k = 2
输出: 5
解释: 排序后是 [1, 2, 3, 4, 5, 6]，第 2 大的是 5
```

这道题的变体非常多：

- 第 K 大的元素
- 前 K 个高频元素（LeetCode 347）
- 数据流中的第 K 大元素（LeetCode 703）
- 前 K 个最常见的单词（LeetCode 692）

但核心思路就那么几个，掌握了就能举一反三。

## 解法一：排序（最直觉）

最简单的办法——排序后取第 K 个。

```typescript
function findKthLargest(nums: number[], k: number): number {
  nums.sort((a, b) => b - a); // 降序排序
  return nums[k - 1];
}
```

- 时间复杂度：**O(n log n)**
- 空间复杂度：**O(1)** 或 **O(n)**（取决于排序算法）

能用，但不够优雅。如果 n = 10 亿，你只想要前 10 个，却要排序整个数组——杀鸡用牛刀了。

## 解法二：小顶堆（面试最常用 ✅）

核心思路：维护一个大小为 K 的**小顶堆**。遍历数组，如果当前元素比堆顶大，就替换堆顶。最后堆里剩下的就是最大的 K 个元素，堆顶就是第 K 大的。

为什么用小顶堆而不是大顶堆？因为小顶堆的堆顶是堆里最小的元素——正好是"门槛"。新来的元素只要比门槛大，就能把门槛挤掉。

```
数组: [3, 2, 1, 5, 6, 4], k = 3

过程演示（维护大小为 3 的小顶堆）：

1. 插入 3 → [3]
2. 插入 2 → [2, 3]
3. 插入 1 → [1, 3, 2]        ← 堆满了，堆顶 = 1（门槛）
4. 来了 5 → 5 > 1，替换堆顶   → [2, 5, 3]  → 调整后堆顶 = 2
5. 来了 6 → 6 > 2，替换堆顶   → [3, 6, 5]  → 调整后堆顶 = 3
6. 来了 4 → 4 > 3，替换堆顶   → [4, 6, 5]  → 调整后堆顶 = 4

最终堆中: [4, 5, 6]，堆顶 = 4 = 第 3 大 ✅
```

### TypeScript 实现

先写一个简单的最小堆：

```typescript
class MinHeap {
  private heap: number[] = [];

  get size(): number {
    return this.heap.length;
  }

  peek(): number {
    return this.heap[0];
  }

  push(val: number): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): number {
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent] <= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}
```

然后用它解 Top K：

```typescript
function findKthLargest(nums: number[], k: number): number {
  const minHeap = new MinHeap();

  for (const num of nums) {
    minHeap.push(num);
    if (minHeap.size > k) {
      minHeap.pop(); // 堆超过 k 个就弹出最小的
    }
  }

  return minHeap.peek(); // 堆顶就是第 K 大
}
```

- 时间复杂度：**O(n log k)**——每个元素最多做一次堆操作，堆大小为 k
- 空间复杂度：**O(k)**——只需要维护 k 个元素的堆

当 k 远小于 n 时，这比排序快多了。比如 n = 10亿，k = 10，排序要 O(10^9 × 30)，堆只要 O(10^9 × 4)。

> 💡 **TypeScript 也有内置方案**：实际工程中一般不用手写堆。可以用第三方库如 `heapify`，或者面试时用 `PriorityQueue`。但面试官大概率会让你手写，所以上面的代码要背熟。

### Python 实现（用内置库更简洁）

Python 的 `heapq` 模块直接支持堆操作，非常方便：

```python
import heapq
from typing import List

def findKthLargest(nums: List[int], k: int) -> int:
    # heapq 默认是最小堆，取负数变大顶堆也行
    # 但这里我们直接用大小为 k 的小顶堆
    min_heap = []
    for num in nums:
        heapq.heappush(min_heap, num)
        if len(min_heap) > k:
            heapq.heappop(min_heap)
    return min_heap[0]
```

## 解法三：快速选择（Quick Select）⚡

如果面试官要求 O(n) 时间复杂度，那就得用**快速选择**了。

快速选择的灵感来自快速排序。快排每次选一个 pivot，把数组分成"比 pivot 小的"和"比 pivot 大的"两部分，然后递归排序两边。

但快速选择说：我只关心第 K 大的，所以只需要递归**一边**就行了！

```
数组: [3, 2, 1, 5, 6, 4], k = 2（找第 2 大）

第 1 轮：选 pivot = 3
  分区后: [1, 2] | 3 | [5, 6, 4]
  比 pivot 大的有 3 个 → 第 2 大在右边
  k = 2，右边有 3 个元素，继续在右边找

第 2 轮：在 [5, 6, 4] 中选 pivot = 5
  分区后: [4] | 5 | [6]
  比 pivot 大的有 1 个 → 第 2 大就是 5 ✅（因为右边只有 1 个比它大）
```

### TypeScript 实现

```typescript
function findKthLargest(nums: number[], k: number): number {
  const target = k - 1; // 转成降序的第 k-1 个索引
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const pivotIndex = partition(nums, left, right);
    if (pivotIndex === target) {
      return nums[pivotIndex];
    } else if (pivotIndex < target) {
      left = pivotIndex + 1;
    } else {
      right = pivotIndex - 1;
    }
  }

  return -1; // 不会走到这里
}

// 降序分区：左边比 pivot 大，右边比 pivot 小
function partition(nums: number[], left: number, right: number): number {
  const pivot = nums[right]; // 选最右边的作为 pivot
  let i = left;

  for (let j = left; j < right; j++) {
    if (nums[j] > pivot) {
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i++;
    }
  }

  [nums[i], nums[right]] = [nums[right], nums[i]];
  return i;
}
```

### 复杂度分析

| | 平均 | 最坏 |
|---|---|---|
| 时间 | O(n) | O(n²) |
| 空间 | O(1) | O(1) |

等等，最坏怎么是 O(n²)？跟快排一样，如果每次 pivot 选得很差（比如选到最大或最小的），就会退化成 O(n²)。

解决方案：**随机选 pivot**！把 `partition` 里的 `pivot = nums[right]` 换成随机选一个：

```typescript
function partition(nums: number[], left: number, right: number): number {
  // 随机选一个 pivot，放到最右边
  const randIdx = left + Math.floor(Math.random() * (right - left + 1));
  [nums[randIdx], nums[right]] = [nums[right], nums[randIdx]];

  const pivot = nums[right];
  let i = left;

  for (let j = left; j < right; j++) {
    if (nums[j] > pivot) {
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i++;
    }
  }

  [nums[i], nums[right]] = [nums[right], nums[i]];
  return i;
}
```

随机化后，期望时间复杂度就是 O(n) 了 ✨。虽然最坏理论上还是 O(n²)，但概率极低，实际使用中几乎不会触发。

> 💡 如果面试官要求**严格的 O(n)** 最坏复杂度，可以提到 **BFPRT 算法**（中位数的中位数），但实际面试中几乎不要求手写，知道有这个东西就行。

## 三种解法对比

```
┌─────────────┬──────────────┬──────────────┬──────────────────┐
│    解法      │  时间复杂度   │  空间复杂度   │     适用场景       │
├─────────────┼──────────────┼──────────────┼──────────────────┤
│  排序        │ O(n log n)   │ O(1) ~ O(n)  │ 数据量小、简单场景  │
│  小顶堆      │ O(n log k)   │ O(k)         │ k << n 时最实用    │
│  快速选择    │ O(n) 期望     │ O(1)         │ 要求最优时间复杂度  │
└─────────────┴──────────────┴──────────────┴──────────────────┘
```

**面试建议**：先说排序（展示基础），然后说堆（展示优化思维），最后说快速选择（展示算法功底）。一般说到堆就能过了，快速选择是加分项。

## 实战：数据流中的第 K 大元素

LeetCode 703 的变体：设计一个类，不断接收数字，随时返回当前第 K 大的元素。

这道题完美适合堆：

```typescript
class KthLargest {
  private minHeap: MinHeap;
  private k: number;

  constructor(k: number, nums: number[]) {
    this.k = k;
    this.minHeap = new MinHeap();
    for (const num of nums) {
      this.add(num);
    }
  }

  add(val: number): number {
    this.minHeap.push(val);
    if (this.minHeap.size > this.k) {
      this.minHeap.pop();
    }
    return this.minHeap.peek();
  }
}
```

为什么这道题用堆而不是快速选择？因为数据是**动态**的，每次 `add` 都要重新算第 K 大。用堆的话，每次操作只要 O(log k)，而快速选择需要 O(n)，差距就出来了。

## 实战：前 K 个高频元素

LeetCode 347：给你一个数组，返回出现频率前 K 高的元素。

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  // 第 1 步：统计频率
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  // 第 2 步：用小顶堆维护前 K 个高频
  const minHeap = new MinHeap(); // 存的是频率值

  // 为了知道哪个频率对应哪个数字，需要维护一个映射
  // 这里用一个更简洁的方式：堆里存 [频率, 数字]
  const entries = [...freqMap.entries()]; // [数字, 频率]

  // 手动实现基于频率的小顶堆
  const heap: [number, number][] = []; // [频率, 数字]

  for (const [num, freq] of entries) {
    heap.push([freq, num]);
    bubbleUp(heap, heap.length - 1);
    if (heap.length > k) {
      // 移除堆顶（频率最小的）
      heap[0] = heap[heap.length - 1];
      heap.pop();
      sinkDown(heap, 0);
    }
  }

  return heap.map(([_, num]) => num);
}
```

当然，更优雅的做法是用桶排序，时间复杂度可以做到 O(n)，但那是另一个话题了。

## 实际应用场景

Top K 问题在实际工程中无处不在：

1. **搜索引擎**：返回最相关的 K 条结果
2. **推荐系统**：从百万商品中选出最可能点击的 K 个
3. **日志分析**：找出访问量最高的 K 个 URL
4. **监控告警**：找出 CPU 使用率最高的 K 台机器
5. **游戏排行榜**：实时维护前 K 名玩家

大部分场景用**小顶堆**就够了，简单、高效、好理解。只有在性能要求极高的场景（比如搜索引擎的召回阶段），才会考虑快速选择或其他更精巧的算法。

## 总结

| 要点 | 内容 |
|------|------|
| 问题本质 | 从 n 个元素中找最大/最小的 K 个 |
| 最简单解法 | 排序 → O(n log n) |
| 最常用解法 | 小顶堆 → O(n log k)，面试首选 |
| 最优解法 | 快速选择 → O(n) 期望，要求最优时用 |
| 动态场景 | 堆更合适，每次操作 O(log k) |

记住这个口诀：**静态数据用快选，动态数据用堆，写不出来先排序**。

最后留一道练习题：LeetCode 215（第K大元素）和 LeetCode 347（前K高频元素），用堆和快速选择各写一遍，保证面试稳了 💪
