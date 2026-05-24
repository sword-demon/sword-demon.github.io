---
title: 二叉堆（优先队列）
description: Binary Heap 详解：堆排序、Top K 问题、四语言实现
date: 2026-05-17 19:30:00
categories:
  - Algorithm
tags:
  - heap
  - priority-queue
  - topk
  - interview
sidebarSort: 17
---

# 二叉堆（优先队列）

优先队列是一种"每次取出最值"的数据结构。二叉堆是它最常见的实现方式——用数组模拟完全二叉树，O(log n) 插入、O(log n) 删除、O(1) 查最值。

## 原理拆解

```
最大堆（Max Heap）：父节点 >= 子节点

        9
       / \
      7   8
     / \  /
    3  5  6

数组表示：[9, 7, 8, 3, 5, 6]
索引关系：parent = (i-1)/2, left = 2i+1, right = 2i+2
```

### 核心操作

**上浮（Sift Up）**：新元素放在最底层，如果比父节点大就交换上移
**下沉（Sift Down）**：根元素被取出后，把最后一个元素放到根，跟较大的孩子交换下移

## 代码实现

### TypeScript

```typescript
class MaxHeap {
  private data: number[] = [];

  push(val: number): void {
    this.data.push(val);
    this.siftUp(this.data.length - 1);
  }

  pop(): number {
    const max = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return max;
  }

  peek(): number {
    return this.data[0];
  }
  size(): number {
    return this.data.length;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent] >= this.data[i]) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.data.length;
    while (2 * i + 1 < n) {
      let largest = 2 * i + 1;
      if (largest + 1 < n && this.data[largest + 1] > this.data[largest])
        largest++;
      if (this.data[i] >= this.data[largest]) break;
      [this.data[i], this.data[largest]] = [this.data[largest], this.data[i]];
      i = largest;
    }
  }
}
```

### Go

```go
package heap

import "container/heap"

// IntHeap 最大堆
type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] > h[j] } // > 实现最大堆
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *IntHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() interface{} {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[:n-1]
	return x
}
```

### Java

```java
import java.util.PriorityQueue;

// Java 直接用 PriorityQueue（默认最小堆）
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);

minHeap.offer(5);
minHeap.offer(3);
System.out.println(minHeap.poll()); // 3
```

### Python

```python
import heapq

# Python heapq 是最小堆
heap = []
heapq.heappush(heap, 5)
heapq.heappush(heap, 3)
print(heapq.heappop(heap))  # 3

# 最大堆：取负数
max_heap = []
heapq.heappush(max_heap, -5)
heapq.heappush(max_heap, -3)
print(-heapq.heappop(max_heap))  # 5
```

### 经典应用：Top K 问题

> LeetCode 215. Kth Largest Element

用大小为 K 的最小堆维护前 K 大元素：

```typescript
function findKthLargest(nums: number[], k: number): number {
  const minHeap = new MinHeap(); // 最小堆
  for (const num of nums) {
    minHeap.push(num);
    if (minHeap.size() > k) minHeap.pop(); // 超过 k 个就弹最小的
  }
  return minHeap.peek(); // 堆顶就是第 k 大
}
```

## 面试题精选

| 题号 | 题目            | 堆的应用              | 难度 |
| ---- | --------------- | --------------------- | ---- |
| 215  | 第 K 大元素     | 最小堆 / 快速选择     | 中等 |
| 347  | 前 K 个高频元素 | 最小堆按频率          | 中等 |
| 23   | 合并 K 个链表   | 最小堆维护 K 个链表头 | 困难 |
| 295  | 数据流中位数    | 大顶堆 + 小顶堆       | 困难 |
| 703  | 第 K 大         | 维护 K 大小最小堆     | 简单 |

## 复杂度分析

| 操作 | 时间复杂度 |
| ---- | ---------- |
| push | O(log n)   |
| pop  | O(log n)   |
| peek | O(1)       |
| 建堆 | O(n)       |

## 小结

堆的核心：**完全二叉树 + 数组存储 + 上浮下沉**。

- 求 Top K → 维护大小为 K 的最小堆
- 求中位数 → 大顶堆 + 小顶堆
- 合并 K 个有序序列 → 最小堆维护 K 个头节点

口诀：**堆顶永远是最值，弹出后下沉补位。Top K 用最小堆，超了弹小留大的** ✅
