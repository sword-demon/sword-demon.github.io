---
title: 链表算法精讲
description: 链表（Linked List）常见操作与高频面试题全解：反转、找中点、判环、相交、合并、排序
date: 2026-09-29 09:01:34
categories:
  - Algorithm
tags:
  - linked-list
  - two-pointers
  - recursion
  - interview
sidebarSort: 91
---

# 链表算法精讲

你有没有发现，面试官特别喜欢问链表题？

打开 LeetCode 搜"linked list"，前 30 道题里至少有一半是大厂面试的原题：反转链表、找中间节点、判断是否有环、链表相交、合并两个有序链表……很多候选人挂在这些题上，不是因为难，而是因为对**指针的指向变化**没在脑子里跑通。

这一篇，我把链表最常见的 7 类操作一次性讲透。每道题都给你画图 + TypeScript 实现 + 复杂度分析。看完这一篇，链表题基本不会再怕了 ✨。

## 链表基础回顾

链表和数组最大的区别是：**数组在内存里是连续的，链表的节点是散落分布的，靠 next 指针串起来**。

```
数组（连续内存）:
┌────┬────┬────┬────┬────┐
│  1 │  2 │  3 │  4 │  5 │
└────┴────┴────┴────┴────┘

链表（散落，靠 next 串起来）:
┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐
│ 1 │───▶│ 2 │───▶│ 3 │───▶│ 4 │───▶│ 5 │───▶ null
└───┘    └───┘    └───┘    └───┘    └───┘
```

带来的差异：

| 操作 | 数组 | 链表 |
|------|------|------|
| 随机访问（按下标取元素） | O(1) | O(n) |
| 插入 / 删除 | O(n) | O(1) |
| 内存占用 | 紧凑 | 有额外指针开销 |

链表的**优势**就是插入删除快；**劣势**是不能随机访问。这意味着：**链表题的解法，几乎都是用多个指针在链表上"走来走去"来完成的**，没有下标可用，所有跳跃都得靠指针。

下面进入正题。

## 1. 反转链表（LeetCode 206）

### 问题

把一个链表反转过来。`1 → 2 → 3 → 4 → null` 变成 `4 → 3 → 2 → 1 → null`。

### 思路

这是链表题的"Hello World"。核心就一句话：**遍历的时候，把每个节点的 next 指针指向前一个节点**。

需要三个指针：

```
prev   curr   next
 ↓      ↓      ↓
null ◀ 1 ───▶ 2 ───▶ 3 ───▶ 4 ───▶ null

第 1 步：保存 next = curr.next（不然一会断了找不到下一个）
第 2 步：curr.next = prev（反转箭头）
第 3 步：prev = curr，curr = next（三个指针整体右移）
第 4 步：循环，直到 curr === null
```

### 代码

```typescript
/**
 * 反转链表 —— 迭代版（推荐，面试时优先写这个）
 * 时间 O(n)，空间 O(1)
 */
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next; // 第 1 步：先保留下一个节点
    curr.next = prev;        // 第 2 步：反转指针
    prev = curr;             // 第 3 步：prev 前移
    curr = next;             // 第 4 步：curr 前移
  }

  return prev; // 循环结束时 prev 就是新链表的头
}
```

递归版也写一下，理解递归的妙处：

```typescript
/**
 * 反转链表 —— 递归版
 * 时间 O(n)，空间 O(n)（递归栈）
 */
function reverseListRecursive(head: ListNode | null): ListNode | null {
  // 递归出口：空链表或只有一个节点
  if (head === null || head.next === null) return head;

  const newHead = reverseListRecursive(head.next!);
  // 假设后面的已经反完了，现在把 head 接上去
  head.next!.next = head;
  head.next = null;

  return newHead;
}
```

递归版的精髓在于"信任递归"：你假设 `reverseList(head.next)` 已经把后面的部分反好了，接下来只需要把当前的 head 接在新链的尾巴，然后断掉 head 原来的 next。

### 变体：反转链表 II（LeetCode 92）

只反转从第 `m` 个到第 `n` 个节点。这是字节、阿里都考过的题。

```typescript
/**
 * 反转链表 II —— 反转区间 [m, n]
 * 时间 O(n)，空间 O(1)
 */
function reverseBetween(
  head: ListNode | null,
  m: number,
  n: number,
): ListNode | null {
  if (head === null || m === n) return head;

  const dummy = new ListNode(0, head); // 哨兵节点，省掉一堆边界判断
  let pre: ListNode = dummy;

  // 1. 走到第 m-1 个节点
  for (let i = 0; i < m - 1; i++) {
    pre = pre.next!;
  }

  // 2. 反转 [m, n] 这一段，用头插法
  let curr = pre.next!;
  for (let i = 0; i < n - m; i++) {
    const next = curr.next!;
    curr.next = next.next;
    next.next = pre.next;
    pre.next = next;
  }

  return dummy.next;
}
```

## 2. 链表的中间节点（LeetCode 876）

### 问题

返回链表的中间节点。如果有两个中间节点，返回第二个。

### 思路：快慢指针

**快指针一次走两步，慢指针一次走一步**。快指针走到末尾时，慢指针刚好在中间。

```
初始：
slow ──▶
fast ──────▶
[1, 2, 3, 4, 5]

走 1 步后：
slow ──▶ 2
fast ──────────▶ 4

走 2 步后：
slow ──▶ 3
fast ──────────────▶ null（结束）

slow 在 3，正好是中间 ✓
```

为什么快指针走两步，慢指针就刚好在中间？因为慢指针走的距离是快指针的一半，而快指针走了整个链表长度 n，慢指针就走了 n/2。

### 代码

```typescript
/**
 * 返回链表的中间节点
 * 时间 O(n)，空间 O(1)
 */
function middleNode(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;       // 慢走 1 步
    fast = fast.next.next;   // 快走 2 步
  }

  return slow;
}
```

**循环条件为什么是 `fast && fast.next`？** 因为快指针每次走 2 步，要先保证它和它的下一个都不为空，否则下一步会越界。

## 3. 判断链表是否有环（LeetCode 141）

### 问题

判断链表里有没有环。如果某个节点可以通过 next 指针一直走下去回到自己，就有环。

### 思路：快慢指针

和上面一样的套路，但是判断条件变了：**如果快慢指针相遇了，说明有环**。

为什么？有环时，快指针在环里一直转，慢指针也在转。快指针每次比慢指针多走 1 步，相对距离每次缩短 1 步，最终一定追上慢指针。

```
     ┌─────────────┐
     ▼             │
[1]→[2]→[3]→[4]→[5]
     ▲             │
     └─────────────┘

slow 在 2，fast 在 4：
slow ──▶ 2 ──▶ 3 ──▶
fast ─────────▶ 4 ──▶ 5 ──▶ 3 ──▶ 4 ──▶ 5 ──▶ 3 ...

每次 fast 比 slow 多走 1 步，最终会追上 ✨
```

### 代码

```typescript
/**
 * 判断链表是否有环
 * 时间 O(n)，空间 O(1)
 */
function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;

    if (slow === fast) return true; // 相遇了，说明有环
  }

  return false;
}
```

### 进阶：找到环的入口（LeetCode 142）

判断完有环之后，下一步就是找到环的入口节点。这题字节、腾讯都考过。

**数学结论**：相遇之后，让一个指针从 head 开始，另一个指针从相遇点开始，**都每次走 1 步**，它们会在环入口相遇。

为什么？设链表外段长度为 a，环内从入口到相遇点的距离为 b，环剩下的长度为 c。相遇时快指针走了 `a + n(b+c) + b`，慢指针走了 `a + b`。由于快指针是慢指针的 2 倍速度：

```
2(a + b) = a + n(b+c) + b
a = n(b+c) - b = (n-1)(b+c) + c
```

也就是说，从 head 走 a 步到入口，等于从相遇点走 c 步再绕几圈到入口**（mod 一下就是走 c 步）**。所以两者同步走，必在入口相遇。

```typescript
/**
 * 找到环的入口节点
 * 时间 O(n)，空间 O(1)
 */
function detectCycle(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  let hasMeet = false;

  // 第一步：先找到相遇点
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;

    if (slow === fast) {
      hasMeet = true;
      break;
    }
  }

  // 没相遇说明没环
  if (!hasMeet) return null;

  // 第二步：从 head 和相遇点同步走，相遇处就是入口
  let p1 = head;
  let p2 = slow;
  while (p1 !== p2) {
    p1 = p1!.next;
    p2 = p2!.next;
  }

  return p1;
}
```

## 4. 两个链表相交（LeetCode 160）

### 问题

判断两个链表是否相交，返回相交的节点。相交意味着节点是同一个对象（不是值相等）。

### 思路：双指针拼接法

这是面试里"看起来不难、但很多人写不对"的题。技巧是：**让两个指针分别走完自己的链表后，去走对方的链表，相遇点就是答案**。

```
链表 A: a1 → a2 ─┐
                 c1 → c2 → c3
链表 B: b1 → b2 → b3 ──┘

指针 pA 走：A + B = a1,a2,c1,c2,c3,b1,b2,b3,c1,c2,c3
指针 pB 走：B + A = b1,b2,b3,c1,c2,c3,a1,a2,c1,c2,c3

两者在 c1 相遇 ✓
```

**为什么能相遇？** 因为两个指针走的总路程都是 `lenA + lenB`，且走到 c1 时走的距离也相等。

### 代码

```typescript
/**
 * 找到两个链表相交的节点
 * 时间 O(n+m)，空间 O(1)
 */
function getIntersectionNode(
  headA: ListNode | null,
  headB: ListNode | null,
): ListNode | null {
  if (headA === null || headB === null) return null;

  let pA: ListNode | null = headA;
  let pB: ListNode | null = headB;

  // 最多走 lenA + lenB 步就会相遇（或都为 null 表示不相交）
  while (pA !== pB) {
    pA = pA === null ? headB : pA.next;
    pB = pB === null ? headA : pB.next;
  }

  return pA;
}
```

**边界情况**：不相交时，两个指针最终会同时变成 null，跳出循环，返回 null。

## 5. 合并两个有序链表（LeetCode 21）

### 问题

把两个升序链表合并成一个升序链表。

### 思路：双指针 + 哨兵节点

这是归并排序的子操作。两个指针分别从两个链表头开始，每次取较小的那一个接到结果链表的尾部。

**为什么要用哨兵节点（dummy）？** 因为结果链表的头是哪个节点，一开始是不知道的。用一个假头节点，最后返回它的 next，省掉一堆边界判断。

```
l1: 1 → 2 → 4
l2: 1 → 3 → 4

比较 1 和 1：取 1（l1 前进）
比较 2 和 1：取 1（l2 前进）
比较 2 和 3：取 2（l1 前进）
比较 4 和 3：取 3（l2 前进）
比较 4 和 4：取 4（l1 前进）
l1 走到 null：把 l2 剩下的 4 接上

结果：1 → 1 → 2 → 3 → 4 → 4 ✓
```

### 代码

```typescript
/**
 * 合并两个有序链表
 * 时间 O(n+m)，空间 O(1)
 */
function mergeTwoLists(
  l1: ListNode | null,
  l2: ListNode | null,
): ListNode | null {
  const dummy = new ListNode(0);
  let tail = dummy;

  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }

  // 接上剩下的部分
  tail.next = l1 !== null ? l1 : l2;

  return dummy.next;
}
```

## 6. 删除链表的倒数第 N 个节点（LeetCode 19）

### 问题

删除链表的倒数第 n 个节点，返回头节点。

### 思路：快慢指针 + 哨兵

**让快指针先走 n 步，然后快慢指针同步走**。快指针走到末尾时，慢指针刚好在倒数第 n 个节点的前一个。

```
删除倒数第 2 个：

dummy → 1 → 2 → 3 → 4 → 5
        ↑
       slow       （fast 走 2 步到 3）

然后同步走：

dummy → 1 → 2 → 3 → 4 → 5
              ↑           ↑
             slow        fast

fast 走到 null 时，slow 在 3（前一个）
slow.next = slow.next.next，把 4 删了 ✓
```

**为什么需要哨兵？** 如果要删的是头节点（倒数第 N 个），没有哨兵就得特判。

### 代码

```typescript
/**
 * 删除链表的倒数第 N 个节点
 * 时间 O(n)，空间 O(1)
 */
function removeNthFromEnd(
  head: ListNode | null,
  n: number,
): ListNode | null {
  const dummy = new ListNode(0, head);
  let slow = dummy;
  let fast = dummy;

  // fast 先走 n 步
  for (let i = 0; i < n; i++) {
    fast = fast.next!;
  }

  // 同步走，直到 fast 走到最后一个节点
  while (fast.next !== null) {
    slow = slow.next!;
    fast = fast.next!;
  }

  // 此时 slow 在待删节点的前一个
  slow.next = slow.next!.next;
  return dummy.next;
}
```

## 7. 链表排序（LeetCode 148）

### 问题

给链表排序，要求 O(n log n) 时间，**O(1) 空间**（进阶要求）。

### 思路：自顶向下 vs 自底向上

两种都能 O(n log n)，但自顶向下用递归栈空间 O(log n)，自底向上能做到真正 O(1)。

#### 方案一：自顶向下（归并排序递归版）

```
归并排序链表：
1. 找中点，把链表切成两半
2. 分别排序两半
3. 合并两个有序链表

这就是快慢指针 + merge 的组合拳！
```

```typescript
/**
 * 链表排序 —— 自顶向下归并
 * 时间 O(n log n)，空间 O(log n)（递归栈）
 */
function sortList(head: ListNode | null): ListNode | null {
  // 递归出口：空或只有一个节点
  if (head === null || head.next === null) return head;

  // 1. 找中点（用快慢指针）
  let slow = head;
  let fast = head.next; // 注意从 head.next 开始，这样 slow 落在左半的尾部
  while (fast !== null && fast.next !== null) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  // 切断
  const mid = slow.next;
  slow.next = null;

  // 2. 递归排序两半
  const left = sortList(head);
  const right = sortList(mid);

  // 3. 合并
  return mergeTwoLists(left, right);
}
```

**关键细节**：`fast` 初始化为 `head.next` 而不是 `head`，这样 `slow` 会落在左半部分的尾部（左半部分更短或等长），正好是切断点。如果从 `head` 开始，slow 会落在正中间稍后，对奇数长度链表切断后两半长度不一致，逻辑会乱。

#### 方案二：自底向上（O(1) 空间，推荐进阶写法）

```typescript
/**
 * 链表排序 —— 自底向上归并
 * 时间 O(n log n)，空间 O(1)
 */
function sortListBottomUp(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) return head;

  // 1. 先算链表长度
  let len = 0;
  let curr = head;
  while (curr !== null) {
    len++;
    curr = curr.next!;
  }

  const dummy = new ListNode(0, head);

  // 2. 子链表长度从 1 开始倍增：1, 2, 4, 8, ...
  for (let subLen = 1; subLen < len; subLen *= 2) {
    let prev = dummy;
    let curr: ListNode | null = dummy.next;

    // 3. 把链表切成若干段长度为 subLen 的子链表，两两合并
    while (curr !== null) {
      // 第一段
      const head1 = curr;
      let i = 1;
      while (i < subLen && curr!.next !== null) {
        curr = curr!.next;
        i++;
      }
      const head2 = curr!.next;
      curr!.next = null; // 切断第一段
      curr = head2;

      // 第二段
      let j = 1;
      while (j < subLen && curr !== null && curr.next !== null) {
        curr = curr.next;
        j++;
      }
      const next = curr?.next ?? null;
      if (curr !== null) curr.next = null; // 切断第二段

      // 合并两段
      prev.next = mergeTwoLists(head1, head2);
      // 把 prev 移到合并后链表的尾部
      while (prev.next !== null) prev = prev.next;

      curr = next;
    }
  }

  return dummy.next;
}
```

自底向上的精髓：**不递归，全靠循环把链表切成一段段、合并成一段段更长的**。每轮把子链表长度翻倍，最终一轮搞定。

## 复杂度分析总览

| 问题 | 时间 | 空间（最优） | 关键技巧 |
|------|------|--------------|----------|
| 反转链表 | O(n) | O(1) | 三指针迭代 |
| 找中间节点 | O(n) | O(1) | 快慢指针 |
| 判断环 | O(n) | O(1) | 快慢指针相遇 |
| 找环入口 | O(n) | O(1) | 相遇后再同步 |
| 两链表相交 | O(n+m) | O(1) | 拼接走法 |
| 合并有序链表 | O(n+m) | O(1) | 哨兵+双指针 |
| 删除倒数第 N | O(n) | O(1) | 快慢指针+哨兵 |
| 链表排序 | O(n log n) | O(1) | 自底向上归并 |

## 实战建议

### 面试常考的链表题 Top 10

按出现频率排序：

1. **反转链表**（206）—— 字节、阿里、腾讯高频
2. **链表反转 II**（92）—— 字节、Shopee
3. **判断环 + 找入口**（141/142）—— 几乎所有大厂
4. **合并有序链表**（21）—— 美团、滴滴
5. **删除倒数第 N 个**（19）—— 字节、拼多多
6. **链表相交**（160）—— 美团、字节
7. **链表中点**（876）—— 算法岗高频
8. **链表排序**（148）—— 字节、阿里
9. **K 个一组反转**（25）—— 字节、Shopee（进阶）
10. **LRU 缓存**（146）—— 链表 + 哈希表组合拳

### 三个核心套路

学完这一篇，你应该记住三个套路，几乎能解决 80% 的链表题：

1. **快慢指针**：找中点、判环、找倒数第 K 个
2. **哨兵节点**：统一处理头节点被改动的场景（反转、删除、合并）
3. **双链拼接**：链表相交、判断回文链表

### 调试技巧

链表题最怕"我以为我懂，但写完跑起来不对"。几个调试技巧：

- **画图**：每改一个 next，画一条箭头确认方向对不对
- **打日志**：在循环里打印 curr 的值，肉眼看指针走到哪
- **写测试用例**：空链表、1 个节点、2 个节点、环、相等链表都要测
- **用纸笔跑代码**：把代码当脚本，每行手动执行一遍

## 总结

链表题看起来吓人，但拆开来看就是那几招：

- **反转** —— 三指针或递归
- **中点 / 环 / 倒数** —— 快慢指针
- **相交 / 合并** —— 双指针
- **排序** —— 归并排序

核心就是一句话：**链表题的解法，几乎都是用多个指针在链表上"走来走去"完成的，没有下标可以跳**。把这个直觉记住，刷题时先想清楚用什么指针、走几步、停在哪里，写代码就只是把这些想法翻译成 JavaScript/TypeScript 而已。

下一篇想看什么？留言告诉我，我可以写：
- K 个一组反转（链表高阶题）
- LRU 缓存（链表 + 哈希表）
- 一致性哈希 + 虚拟节点

下期见 ✌️

---

## 附：测试用例

```typescript
// 简单的 ListNode 定义，方便你跑上面的代码
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

// 辅助函数：数组 → 链表
function arrayToList(arr: number[]): ListNode | null {
  const dummy = new ListNode(0);
  let curr = dummy;
  for (const v of arr) {
    curr.next = new ListNode(v);
    curr = curr.next;
  }
  return dummy.next;
}

// 辅助函数：链表 → 数组
function listToArray(head: ListNode | null): number[] {
  const result: number[] = [];
  while (head !== null) {
    result.push(head.val);
    head = head.next;
  }
  return result;
}

// 测试：反转
console.log(listToArray(reverseList(arrayToList([1, 2, 3, 4, 5]))));
// [5, 4, 3, 2, 1]

// 测试：合并
console.log(
  listToArray(
    mergeTwoLists(arrayToList([1, 2, 4]), arrayToList([1, 3, 4])),
  ),
);
// [1, 1, 2, 3, 4, 4]

// 测试：找中点
console.log(middleNode(arrayToList([1, 2, 3, 4, 5]))?.val); // 3
console.log(middleNode(arrayToList([1, 2, 3, 4, 5, 6]))?.val); // 4

// 测试：排序
console.log(listToArray(sortList(arrayToList([4, 2, 1, 3]))));
// [1, 2, 3, 4]
```