---
title: K 路归并：合并 K 个排序链表
description: K 路归并（Merge K Sorted Lists）—— 合并多个有序链表的高效算法
date: 2026-10-02 09:17:55
categories:
  - Algorithm
tags:
  - merge-k-sorted-lists
  - heap
  - divide-and-conquer
  - k-way-merge
  - leetcode
sidebarSort: 94
---

# K 路归并：合并 K 个排序链表

想象这么一个场景：你有多个sorted的日志文件，每个文件内部按时间戳排好了序，但现在你需要把它们合并成一个大文件，按时间顺序输出。

或者换个更接地气的例子：你开了几家分店，每家店每天会产生一批订单，每批订单内部是按订单号排好序的。现在总部需要把所有人的订单合起来，按订单号排序后统一处理。

这就是经典的 **K 路归并（K-way Merge）** 问题——把 K 个有序序列合并成一个有序序列。

这个问题在面试里有多常见呢？LeetCode 上合并两个有序链表是 Easy，合并 K 个有序链表直接升格为 LeetCode #23，是 Medium 级别的高频面试题。Facebook、Google、Amazon 面试里都出现过。

## 为什么需要专门研究？

你可能会想——直接把 K 个链表的元素都捞出来，放到一个数组里排序，再重新构建链表不就完了？

思路确实对，但复杂度爆炸：把所有元素拿出来是 O(N)，排序是 O(N log N)，最后建链表 O(N)。总的时间 O(N log N)，空间 O(N)。

问题在于：**每个链表本来就已经排好序了，你没有利用这个先验信息**。合并 K 个有序序列，有更聪明的办法能把时间复杂度降到 O(N log K)，甚至 O(N)。

下面介绍三种主流解法，由浅入深。

## 解法一：顺序两两合并（最直观）

最直接的想法：先合并前两个得到一个有序链表，再拿这个结果和第三个合并，以此类推。

```typescript
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

/**
 * 解法一：顺序两两合并
 * 思路：逐个把链表合并进来
 *
 * 时间复杂度：O(KN)，每次合并操作需要遍历两个链表的全部节点
 * 空间复杂度：O(1)（不计递归栈）
 */
function mergeKLists_baseline(lists: Array<ListNode | null>): ListNode | null {
  let result: ListNode | null = null;

  for (const head of lists) {
    result = mergeTwoLists(result, head);
  }

  return result;
}

/** 合并两个有序链表 */
function mergeTwoLists(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0);
  let curr = dummy;

  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next!;
  }

  // 剩余的直接接上
  curr.next = l1 !== null ? l1 : l2;

  return dummy.next;
}
```

思路简单，但效率低。假设每个链表平均长度是 N/K，总节点数是 N，那么：

- 第 1 次合并：遍历 (N/K) + (N/K) = 2N/K
- 第 2 次合并：遍历 2N/K + N/K = 3N/K
- ...
- 第 K-1 次合并：遍历 (K-1)N/K + N/K = KN/K = N

总共遍历次数是 O(KN)，当 K 很大时（比如 1000 个链表），这就很慢了。

## 解法二：分治归并（工程上最常用）

既然顺序合并太慢，自然想到分治——把 K 个链表分成两半，先分别合并每一半，最后把两个结果合并。

```
lists = [L1, L2, L3, L4, L5, L6, L7, L8]
                ↓ 分治
        [L1~L4]      [L5~L8]
           ↓             ↓
       [L1,L2] [L3,L4] [L5,L6] [L7,L8]
          ↓       ↓       ↓       ↓
        merged  merged  merged  merged
          ↓       ↓       ↓       ↓
         [12]   [34]   [56]   [78]
            ↓     ↓     ↓     ↓
          [1234]       [5678]
               ↓           ↓
            [12345678]
```

这就是经典的 **分治（Divide & Conquer）** 思想，时间复杂度从 O(KN) 降到 O(N log K)。

```typescript
/**
 * 解法二：分治归并
 * 核心思路：两两合并 → 合并结果两两合并 → 重复直到只剩一个
 *
 * 时间复杂度：O(N log K)
 *   - 每一轮合并需要遍历所有 N 个节点
 *   - 合并轮次是 log K（像归并排序一样）
 * 空间复杂度：O(log K)（递归栈深度）
 */
function mergeKLists_divide(lists: Array<ListNode | null>): ListNode | null {
  if (lists.length === 0) return null;

  return divide(lists, 0, lists.length - 1);
}

function divide(
  lists: Array<ListNode | null>,
  left: number,
  right: number
): ListNode | null {
  // 递归终止条件：只有一个链表
  if (left === right) return lists[left];

  // 分成两半
  const mid = Math.floor((left + right) / 2);
  const leftResult = divide(lists, left, mid);
  const rightResult = divide(lists, mid + 1, right);

  // 合并两半的结果
  return mergeTwoLists(leftResult, rightResult);
}
```

## 解法三：最小堆（最优解法之一）

分治已经很快了，但还有更精妙的思路——**堆**。

想象一下：你有 K 个指向各链表当前节点的指针（就像 K 个路标），每次只需要问："这 K 个节点里，谁最小？"把最小的输出，然后把该链表的指针往右移一位，继续问同样的问题。

这不就是 **最小堆** 干的事吗？

```
初始状态（每个链表的指针）：

链表1: 1 → 4 → 7 → ...
指针:  ↑
       节点值 = 1（最小）

链表2: 2 → 5 → 8 → ...
指针:  ↑
       节点值 = 2

链表3: 3 → 6 → 9 → ...
指针:  ↑
       节点值 = 3

最小堆内容：[1, 2, 3]  →  弹出 1，链表1 指针右移到 4
结果：1

最小堆内容：[2, 3, 4]  →  弹出 2，链表2 指针右移到 5
结果：1 → 2

最小堆内容：[3, 4, 5]  →  弹出 3，链表3 指针右移到 6
结果：1 → 2 → 3

...继续直到所有链表都遍历完
```

```typescript
/**
 * 解法三：最小堆
 * 核心思路：用最小堆维护 K 个链表的当前节点，始终弹出最小的
 *
 * 时间复杂度：O(N log K)
 *   - N 是总节点数
 *   - 每次弹出/插入堆的操作是 O(log K)
 *   - 共 N 次操作
 * 空间复杂度：O(K)（堆的大小）
 */
function mergeKLists_heap(lists: Array<ListNode | null>): ListNode | null {
  // 最小堆，按节点值排序
  const minHeap = new MinHeap<ListNode>();

  // 初始化：把每个链表的第一个节点（头指针）加入堆
  for (const head of lists) {
    if (head !== null) {
      minHeap.push(head, head.val);
    }
  }

  const dummy = new ListNode(0);
  let curr = dummy;

  while (!minHeap.isEmpty()) {
    // 弹出最小节点
    const node = minHeap.pop()!;
    curr.next = node;
    curr = curr.next;

    // 如果该链表还有下一个节点，加入堆
    if (node.next !== null) {
      minHeap.push(node.next, node.next.val);
    }
  }

  return dummy.next;
}

/** 最小堆实现 */
class MinHeap<T> {
  private heap: T[] = [];
  private getLeft(i: number) { return 2 * i + 1; }
  private getRight(i: number) { return 2 * i + 2; }
  private getParent(i: number) { return Math.floor((i - 1) / 2); }

  push(item: T, priority: number): void {
    // 存 [item, priority]，用 priority 做比较
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = this.getParent(i);
      if (this.heap[parent] < this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = this.getLeft(i);
      const right = this.getRight(i);
      if (left < n) smallest = left; // 简化：直接用数组索引比较，实际应该用 priority
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}
```

> 注意：上面堆的比较是基于对象引用而非 priority，这只是示意。实际推荐用 `[item, priority]` 元组 + 单独维护优先级的写法，或者用 TypeScript 的 `MathHeap` 类型。下面给出更规范的实现。

### 规范的 TypeScript 堆实现

```typescript
/**
 * 带优先级的最小堆
 * 每个元素是 [node, priority] 元组
 */
class PriorityMinHeap {
  private heap: Array<{ node: ListNode; priority: number }> = [];

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  push(node: ListNode, priority: number): void {
    this.heap.push({ node, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): ListNode | null {
    if (this.heap.length === 0) return null;
    const top = this.heap[0].node;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].priority <= this.heap[i].priority) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

function mergeKLists_heap_v2(lists: Array<ListNode | null>): ListNode | null {
  const heap = new PriorityMinHeap();

  // 初始化堆
  for (const head of lists) {
    if (head !== null) {
      heap.push(head, head.val);
    }
  }

  const dummy = new ListNode(0);
  let curr = dummy;

  while (!heap.isEmpty()) {
    const node = heap.pop()!;
    curr.next = node;
    curr = curr.next;

    if (node.next !== null) {
      heap.push(node.next, node.next.val);
    }
  }

  return dummy.next;
}
```

### Python 实现

```python
import heapq
from typing import Optional, List


class ListNode:
    def __init__(self, val: int = 0, next: 'ListNode' = None):
        self.val = val
        self.next = next


def mergeKLists_heap(lists: List[Optional[ListNode]]) -> Optional[ListNode]:
    """K路归并 —— 最小堆解法（Python）

    思路：用最小堆维护 K 个链表的当前节点
    时间：O(N log K)，空间：O(K)
    """
    heap = []  # 最小堆，存 (node.val, index, node)

    # 初始化：把每个链表的头节点入堆
    for i, head in enumerate(lists):
        if head:
            heapq.heappush(heap, (head.val, i, head))

    dummy = ListNode(0)
    curr = dummy

    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next

        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))

    return dummy.next


def mergeKLists_divide(lists: List[Optional[ListNode]]) -> Optional[ListNode]:
    """K路归并 —— 分治解法（Python）

    时间：O(N log K)，空间：O(log K)
    """
    if not lists:
        return None

    def merge_two(l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)
        curr = dummy
        while l1 and l2:
            if l1.val <= l2.val:
                curr.next = l1
                l1 = l1.next
            else:
                curr.next = l2
                l2 = l2.next
            curr = curr.next
        curr.next = l1 or l2
        return dummy.next

    def divide(left: int, right: int) -> Optional[ListNode]:
        if left == right:
            return lists[left]
        mid = (left + right) // 2
        left_result = divide(left, mid)
        right_result = divide(mid + 1, right)
        return merge_two(left_result, right_result)

    return divide(0, len(lists) - 1)
```

## 三种解法对比

| 解法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|-----------|-----------|---------|
| 顺序两两合并 | O(KN) | O(1) | K 很小（如 ≤3），不推荐 |
| 分治归并 | O(N log K) | O(log K) | 工程首选，稳定高效 |
| 最小堆 | O(N log K) | O(K) | 面试最优解，思路巧妙 |

分治和堆的时间复杂度一样，都是 O(N log K)，但堆的常数因子更小——因为分治每次合并都需要遍历所有节点，而堆只做 log K 级别的比较操作。

## 实际应用场景

### 1. 多路归并外部排序

当数据量大到无法全部加载到内存时（比如排序一个 10GB 的文件），会把大文件分成多个小段分别排序（这些小段可以在内存中处理），然后用 K 路归并把这些排好序的小段合并成最终结果。这就是外部排序的核心步骤，数据库和文件系统里广泛使用。

### 2. 合并多个 sorted feed

社交媒体的信息流（Timeline）通常需要合并多个来源的 feed：关注的人发的帖子、推荐算法插入的内容、广告等。每个来源内部是按时间排好序的，需要合并成一个统一的时间线列表。

### 3. 海量日志实时聚合

多个日志源产生 sorted 日志流，需要实时合并成一个全局有序的日志流，用于统一监控和分析。

### 4. 排行榜合并

游戏中有多个区服，每个区服内部是按分数排序的排行榜。需要合并成全服排行榜。K 路归并就能高效搞定。

## 复杂度深入分析

假设：
- K = 链表数量
- N = 总节点数
- 每个链表平均长度 = N/K

### 堆解法详细推导

- **初始化**：把 K 个头节点插入堆 → O(K log K)
- **弹出/插入**：每个节点都会弹出一次（输出），同时可能插入一次（如果它后面还有节点）→ 最多 2N 次堆操作 → O(N log K)
- **总计**：O(K log K + N log K) = O(N log K)

### 分治解法详细推导

- **合并轮次**：每轮把 K 个子问题合并成 K/2 个，持续 log K 轮
- **每轮工作量**：遍历所有 N 个节点一次
- **总计**：O(N log K)

### 什么时候用堆，什么时候用分治？

- **堆**：适合 **"流式输入"** 场景——数据持续产生，实时需要当前最小值。堆是有状态的，可以随时知道最小的是谁。
- **分治**：适合 **"静态数据"** 场景——所有数据已经准备好，一次性合并完成。分治的代码更简洁，递归结构清晰。

## 图解分治过程

```
输入: lists = [1→4→5, 1→3→4, 2→6]

第1层（分）：
  left: [1→4→5, 1→3→4]    right: [2→6]

第2层（继续分）：
  left-left: [1→4→5]       left-right: [1→3→4]    right: [2→6]

第2层（合）：
  left: 1→1→3→4→4→5        right: 2→6

第1层（合）：
  1→1→2→3→4→4→5→6  ✓
```

## 总结

K 路归并不是一个孤立的算法，它是一种 **算法思想**，可以广泛应用于合并有序序列的场景：

1. **堆解法**：维护一个 K 大小的最小堆，始终知道当前最小的是哪个。适合流式数据。
2. **分治解法**：两两合并，像归并排序一样层层向上。代码简洁，思路清晰。
3. **顺序合并**：虽然直观，但 O(KN) 的复杂度在 K 较大时不可接受，了解即可。

面试时能说出 **堆** 和 **分治** 两种 O(N log K) 解法，基本就能覆盖面试官的所有期待了。如果能进一步讨论工程中的应用场景（外部排序、多路归并），那更是加分项。

关键是理解：**利用每个子序列已经排好序这个先验信息，而不是粗暴地把所有数据混在一起排序**。
