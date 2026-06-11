---
title: 双堆找中位数
description: 双堆找中位数（Two Heaps / Find Median from Data Stream）
date: 2026-06-08 10:00:00
categories:
  - Algorithm
tags:
  - two-heaps
  - heap
  - median
  - leetcode
sidebarSort: 40
---

# 双堆找中位数（Two Heaps）

假设你在做一个实时监控系统，每秒都有大量延迟数据涌入。你需要随时回答一个问题：**当前所有请求的中位数延迟是多少？**

中位数这个东西，排序后取中间值就行了嘛——但问题是数据在不断涌来，你不可能每来一个数就把所有数据排序一遍。那用什么数据结构好呢？数组插入 O(n)，平衡树太复杂……

其实只需要 **两个堆** 就能搞定，而且插入 O(log n)，取中位数 O(1) ✨。这就是今天要讲的 **双堆（Two Heaps）** 技巧。

## 为什么需要双堆？

先想想中位数的本质是什么：

```
排序后的数组: [1, 2, 3, 5, 7, 8, 9]
                                 ↑
                              中位数 = 5

把数组分成两半:
左边（较小的一半）: [1, 2, 3]    ← 最大值是 3
右边（较大的一半）: [5, 7, 8, 9] ← 最大值是... 不对，最小值是 5

中位数 = 左半边的最大值 和 右半边的最小值 的平均值（偶数个时）
       = 左半边的最大值（奇数个时）
```

看到没？中位数本质上就是 **左边的最大值** 和 **右边的最小值**。

而"快速取最大值"和"快速取最小值"——这不就是 **堆** 干的事吗？

## 原理拆解

### 核心思路

用两个堆来维护数据流的两半：

```
┌─────────────────┐     ┌─────────────────┐
│   最大堆 (左半)   │     │   最小堆 (右半)   │
│                  │     │                  │
│   存较小的一半    │     │   存较大的一半    │
│   堆顶 = 最大值   │     │   堆顶 = 最小值   │
│                  │     │                  │
│      [3]         │     │      [5]         │
│     /   \        │     │     /   \        │
│   [1]   [2]      │     │   [7]   [8]      │
└─────────────────┘     └─────────────────┘
         ↑                       ↑
     左边最大值               右边最小值
              中位数 = (3 + 5) / 2 = 4
```

**规则**：
1. 最大堆（左半）的所有元素 ≤ 最小堆（右半）的所有元素
2. 两个堆的大小差不超过 1
3. 如果元素总数是奇数，让其中一个堆多一个元素

### 插入过程

来了一个新数，怎么插入？

```
步骤 1: 先把新数扔进最大堆（左半）
步骤 2: 把最大堆的堆顶（最大值）弹出来，放进最小堆（右半）
步骤 3: 如果最小堆比最大堆多了 2 个以上，就把最小堆的堆顶挪回最大堆
```

这样做的目的是保证：**最大堆的堆顶永远 ≤ 最小堆的堆顶**，同时两边大小平衡。

图解一下，假设当前状态：

```
最大堆(左): [3, 1, 2]    最小堆(右): [5, 7, 8]
中位数 = 3
```

来了一个新数 `4`：

```
步骤 1: 塞进最大堆 → [4, 3, 2, 1]（堆化后 4 在顶部）
步骤 2: 弹出最大堆顶 4，放进最小堆 → 左: [3, 1, 2]  右: [4, 5, 7, 8]
步骤 3: 右边(4个) - 左边(3个) = 1，没超过 1，不用调整
中位数 = (3 + 4) / 2 = 3.5
```

来了一个新数 `6`：

```
步骤 1: 塞进最大堆 → [6, 3, 2, 1]
步骤 2: 弹出 6 放进最小堆 → 左: [3, 1, 2]  右: [4, 5, 6, 7, 8]
步骤 3: 右边(5个) - 左边(3个) = 2 > 1，需要把最小堆顶 4 挪回最大堆
         → 左: [4, 3, 2, 1]  右: [5, 6, 7, 8]
中位数 = (4 + 5) / 2 = 4.5
```

### 为什么这样保证正确性？

关键在于步骤 2：每次插入都先经过最大堆，再把最大值"上交"给最小堆。这保证了：
- 最大堆里放的永远是 **较小的那一半**
- 最小堆里放的永远是 **较大的那一半**
- 最大堆顶 ≤ 最小堆顶

## 代码实现

### TypeScript 实现

```typescript
class MedianFinder {
  // 最大堆：存较小的一半（用负数模拟最大堆，因为 JS 只有最小堆）
  private left: number[] = [];
  // 最小堆：存较大的一半
  private right: number[] = [];

  // 最小堆操作
  private minPush(heap: number[], val: number): void {
    heap.push(val);
    this.bubbleUp(heap, heap.length - 1, false);
  }

  private minPop(heap: number[]): number {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      this.bubbleDown(heap, 0, false);
    }
    return top;
  }

  // 最大堆操作（用负数技巧）
  private maxPush(heap: number[], val: number): void {
    heap.push(-val);
    this.bubbleUp(heap, heap.length - 1, true);
  }

  private maxPop(heap: number[]): number {
    const top = -heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      this.bubbleDown(heap, 0, true);
    }
    return top;
  }

  private maxPeek(heap: number[]): number {
    return -heap[0];
  }

  private minPeek(heap: number[]): number {
    return heap[0];
  }

  // 上浮
  private bubbleUp(heap: number[], i: number, isMax: boolean): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      const shouldSwap = isMax
        ? heap[i] > heap[parent]   // 最大堆：子 > 父则交换
        : heap[i] < heap[parent];  // 最小堆：子 < 父则交换
      if (!shouldSwap) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  }

  // 下沉
  private bubbleDown(heap: number[], i: number, isMax: boolean): void {
    const n = heap.length;
    while (true) {
      let target = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (isMax) {
        if (left < n && heap[left] > heap[target]) target = left;
        if (right < n && heap[right] > heap[target]) target = right;
      } else {
        if (left < n && heap[left] < heap[target]) target = left;
        if (right < n && heap[right] < heap[target]) target = right;
      }
      if (target === i) break;
      [heap[i], heap[target]] = [heap[target], heap[i]];
      i = target;
    }
  }

  // 核心：添加数字
  addNum(num: number): void {
    // 1. 先塞进最大堆（左半）
    this.maxPush(this.left, num);
    // 2. 把最大堆顶挪到最小堆（保证左边的最大值 ≤ 右边的最小值）
    this.minPush(this.right, this.maxPop(this.left));
    // 3. 平衡大小：如果右边比左边多 2 个，挪一个回来
    if (this.right.length > this.left.length + 1) {
      this.maxPush(this.left, this.minPop(this.right));
    }
  }

  // 核心：取中位数
  findMedian(): number {
    if (this.left.length > this.right.length) {
      return this.maxPeek(this.left);
    } else if (this.right.length > this.left.length) {
      return this.minPeek(this.right);
    }
    return (this.maxPeek(this.left) + this.minPeek(this.right)) / 2;
  }
}

// 测试
const mf = new MedianFinder();
mf.addNum(1);
mf.addNum(2);
console.log(mf.findMedian()); // 1.5
mf.addNum(3);
console.log(mf.findMedian()); // 2
mf.addNum(5);
mf.addNum(4);
console.log(mf.findMedian()); // 3
```

### Python 实现

Python 自带 `heapq` 模块，但只有最小堆。最大堆同样用取负数的技巧：

```python
import heapq
from typing import List

class MedianFinder:
    def __init__(self):
        self.left = []   # 最大堆（存负数模拟）
        self.right = []  # 最小堆

    def add_num(self, num: int) -> None:
        # 1. 先塞进最大堆
        heapq.heappush(self.left, -num)
        # 2. 把最大堆顶挪到最小堆
        heapq.heappush(self.right, -heapq.heappop(self.left))
        # 3. 平衡大小
        if len(self.right) > len(self.left) + 1:
            heapq.heappush(self.left, -heapq.heappop(self.right))

    def find_median(self) -> float:
        if len(self.left) > len(self.right):
            return -self.left[0]
        elif len(self.right) > len(self.left):
            return self.right[0]
        return (-self.left[0] + self.right[0]) / 2


# 测试
mf = MedianFinder()
mf.add_num(1)
mf.add_num(2)
print(mf.find_median())  # 1.5
mf.add_num(3)
print(mf.find_median())  # 2
mf.add_num(5)
mf.add_num(4)
print(mf.find_median())  # 3
```

> 💡 **TypeScript vs Python 的区别**：Python 的 `heapq` 天然是最小堆，所以左半（最大堆）直接存负数就行。TypeScript 没有内置堆，需要手写堆操作。面试时如果语言允许，用 Python 写会简洁很多。

## 复杂度分析

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| `addNum` | O(log n) | 堆的插入和删除都是 O(log n) |
| `findMedian` | O(1) | 直接取堆顶元素 |
| 空间复杂度 | O(n) | 所有元素都要存下来 |

对比其他方案：

| 方案 | 插入 | 取中位数 | 说明 |
|------|------|---------|------|
| 排序数组 | O(n) | O(1) | 插入要移动元素 |
| 未排序数组 | O(1) | O(n) | 每次取都要排序 |
| 平衡 BST | O(log n) | O(log n) | 实现复杂 |
| **双堆** | **O(log n)** | **O(1)** | ✅ 最优平衡 |

## 进阶：滑动窗口中位数

LeetCode 480「滑动窗口中位数」是这道题的升级版。窗口在滑动时需要 **删除** 某个元素，但普通堆不支持 O(log n) 的删除操作。

解决方案是 **延迟删除**：用一个 HashMap 记录待删除的元素，每次取堆顶时检查是否需要清理。

```typescript
class SlidingWindowMedian {
  private left: number[] = [];       // 最大堆
  private right: number[] = [];      // 最小堆
  private delayed = new Map<number, number>(); // 延迟删除表
  private leftSize = 0;
  private rightSize = 0;

  addNum(num: number): void {
    // 和前面一样，但插入后要清理无效堆顶
    // ... 省略堆操作细节
    this.prune(this.left, true);
    this.prune(this.right, false);
  }

  removeNum(num: number): void {
    // 不直接删除，而是记录到 delayed 表
    this.delayed.set(num, (this.delayed.get(num) ?? 0) + 1);
    // 减少对应堆的有效大小
    // ... 根据 num 和堆顶的关系判断属于哪个堆
  }

  private prune(heap: number[], isMax: boolean): void {
    // 清理堆顶的无效元素
    while (heap.length > 0) {
      const top = isMax ? -heap[0] : heap[0];
      if (this.delayed.has(top)) {
        const cnt = this.delayed.get(top)!;
        if (cnt === 1) this.delayed.delete(top);
        else this.delayed.set(top, cnt - 1);
        // 弹出无效元素... 但手写堆删除比较复杂
        // 实际面试中可以用 BST / 平衡树 的思路
      } else {
        break;
      }
    }
  }
}
```

> ⚠️ 滑动窗口中位数的完整实现比较繁琐，面试中能讲清楚延迟删除的思路就够了。实际工程中建议用有序数据结构（如 `SortedList`）。

## 实际应用场景

### 1. 实时监控系统
服务器延迟数据流实时涌入，需要随时报告 P50（中位数）延迟。中位数比平均值更抗干扰——一个极端慢请求不会把中位数拉偏。

### 2. 推荐系统评分
用户评分不断更新，需要实时计算中位数评分来判断商品热度。

### 3. 金融数据
股票价格每秒更新，实时计算移动中位数来平滑噪声。

### 4. 负载均衡
统计多台服务器的响应时间中位数，用于智能路由决策。

### 5. 医疗监测
病人心率数据持续流入，中位数心率比平均值更能反映真实状态。

## 相关 LeetCode 题目

| 题号 | 题目 | 难度 | 关键点 |
|------|------|------|--------|
| 295 | Find Median from Data Stream | Hard | 双堆经典题 |
| 480 | Sliding Window Median | Hard | 双堆 + 延迟删除 |
| 346 | Moving Average from Data Stream | Easy | 简化版，用队列就行 |
| 1825 | Finding MK Average | Hard | 双堆变种 |

## 总结

```
双堆技巧的本质：
┌──────────────────────────────────────┐
│  把"中位数"问题转化为                    │
│  "左边最大值" + "右边最小值"             │
│                                        │
│  最大堆(左半) ← 中位数 → 最小堆(右半)    │
│  堆顶 = 最大值           堆顶 = 最小值    │
│                                        │
│  插入: O(log n)   查询: O(1)           │
└──────────────────────────────────────┘
```

记住三步走：

1. **新数先塞最大堆** → 保证左边都是较小的
2. **最大堆顶挪到最小堆** → 保证排序关系
3. **平衡大小** → 保证两边最多差 1

这个技巧的精髓在于：**利用堆的有序性来维护数据的"半序"关系**，不需要完全排序就能快速找到中位数。面试遇到"数据流中位数"相关问题，直接掏出来用就对了 😎
