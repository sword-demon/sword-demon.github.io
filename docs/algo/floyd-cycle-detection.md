---
title: Floyd 判圈算法（龟兔算法）
description: Floyd 判圈算法（Floyd's Cycle Detection），用快慢指针检测链表环、找环入口、检测数组重复元素
date: 2026-06-10 10:00:00
categories:
  - Algorithm
tags:
  - floyd-cycle-detection
  - two-pointers
  - linked-list
sidebarSort: 42
---

# Floyd 判圈算法（龟兔算法）

你小时候一定听过龟兔赛跑的故事吧？兔子跑得快，乌龟跑得慢，但兔子偷懒睡觉了，最后乌龟赢了。但在算法世界里，我们可以给这个故事一个新结局：**如果赛道是一个环，兔子不睡觉，它一定会追上乌龟**。

为什么？因为兔子每步走 2 格，乌龟每步走 1 格，只要赛道有环，兔子就一定会在某一刻和乌龟在同一个位置相遇。这就是 **Floyd 判圈算法** 的核心直觉——用两个不同速度的指针，在有环结构中找到相遇点。

这个算法看起来简单到让人怀疑它到底有什么用，但实际上它是很多经典面试题的底层解法：链表环检测（LeetCode 141/142）、数组中找重复数（LeetCode 287）等，都是 Google、Meta 面试的高频题。

## 为什么需要这个算法？

在正式拆解之前，我们先想想：**检测"有没有环"这件事，为什么不是随便搞搞就行？**

### 最朴素的方法：记录访问过的位置

最直觉的想法：我遍历一遍，把访问过的节点存到一个 Set 里。如果某天我发现"这个节点我已经访问过了"，那不就有环了吗？

```typescript
function hasCycle(head: ListNode | null): boolean {
  const visited = new Set<ListNode>();
  let curr = head;
  while (curr !== null) {
    if (visited.has(curr)) return true;  // 重复访问 = 有环
    visited.add(curr);
    curr = curr.next;
  }
  return false;
}
```

这个方法完全正确，但它需要 **O(n) 的额外空间**。对于链表题来说，面试官通常会追问一句：**"能不能用 O(1) 空间解决？"**

这就是 Floyd 算法登场的时候了——它只需要两个指针，零额外空间。

## 原理拆解

### 第一步：检测有没有环

维护两个指针，从头出发：

```
慢指针（乌龟）🐢：每次走 1 步
快指针（兔子）🐇：每次走 2 步
```

如果有环，快指针一定会追上慢指针（在环内相遇）。如果没环，快指针会先走到 null。

```
无环链表：1 → 2 → 3 → 4 → null

🐢 起点: 1
🐇 起点: 1

Step 1: 🐢→2  🐇→3
Step 2: 🐢→3  🐇→null  → 快指针到 null，无环 ✅
```

```
有环链表：1 → 2 → 3 → 4 → 5
                       ↑         ↓
                       ← ← ← ← ←

🐢 起点: 1     🐇 起点: 1

Step 1: 🐢→2   🐇→3
Step 2: 🐢→3   🐇→5
Step 3: 🐢→4   🐇→3  (5→4→3，走两步)
Step 4: 🐢→5   🐇→5  → 相遇了！有环 ✅
```

### 第二步：找到环的入口

检测到环只是第一步。更常见也更难的问题是：**环的入口是哪个节点？**

这里有一个优美的数学推导 👇

```
设：
  a = 从头节点到环入口的距离
  b = 从环入口到快慢指针相遇点的距离
  c = 从相遇点回到环入口的距离（环的剩余部分）
  环的周长 = b + c

相遇时：
  慢指针走过的距离 = a + b
  快指针走过的距离 = a + b + n(b + c)  （快指针在环里多转了 n 圈）

因为快指针速度是慢指针的 2 倍：
  2(a + b) = a + b + n(b + c)
  2a + 2b = a + b + nb + nc
  a + b = nb + nc
  a + b = n(b + c)
  a = n(b + c) - b
  a = (n-1)(b + c) + c
```

**关键结论**：`a = (n-1)(b+c) + c`

这意味着什么？**从头节点出发走 a 步**，和**从相遇点出发走 (n-1) 圈再加 c 步**，会到达同一个地方——那就是**环的入口**。

最简单的理解方式（当 n=1 时）：`a = c`。也就是说，从头走 a 步到入口，从相遇点走 c 步也到入口。那我们就让两个指针分别从这两个位置出发，每次走 1 步，它们一定会在入口相遇！

```
          a 步          b 步
  头节点 ─────→ 环入口 ←───── 相遇点
              ↑                    ↓
              └────── c 步 ────────┘

令两个指针分别从「头节点」和「相遇点」出发，每次走 1 步
它们走 a 步后在环入口相遇 ✅
```

### 完整图解

```
链表：1 → 3 → 5 → 7 → 9 → 11
                   ↑          ↓
                   ← ← ← ← ← ←
                   环入口是节点 7

Phase 1: 检测环
  🐢: 1→3→5→7→9→11→7→9→11→7
  🐇: 1→5→9→7→5→9→7
  在节点 7 相... 实际会在环内某处相遇（这里简化示意）

假设在节点 11 相遇：
  Phase 2: 找入口
  指针 P1 从头(1)出发:  1→3→5→7  ← 到达！
  指针 P2 从相遇点(11)出发: 11→7  ← 到达！
  环入口 = 节点 7 ✅
```

## 代码实现

### LeetCode 141：检测链表环

```typescript
/**
 * 给定链表，判断是否有环
 * 思路：快慢指针，快指针走 2 步，慢指针走 1 步，相遇则有环
 *
 * 时间复杂度：O(n)  空间复杂度：O(1)
 */
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

function hasCycle(head: ListNode | null): boolean {
  if (!head || !head.next) return false;

  let slow: ListNode | null = head;      // 🐢 慢指针
  let fast: ListNode | null = head.next; // 🐇 快指针

  while (slow !== fast) {
    if (!fast || !fast.next) return false; // 快指针到头了，无环
    slow = slow!.next;           // 慢指针走 1 步
    fast = fast.next.next;       // 快指针走 2 步
  }

  return true; // 相遇了，有环
}
```

> 💡 **小技巧**：也可以让快慢指针都从 head 出发，把 while 条件改成先走再判断。两种写法都对，看你习惯哪种。

### LeetCode 142：找环的入口节点

```typescript
/**
 * 给定链表，返回环的入口节点。如果无环返回 null。
 * 思路：Phase 1 快慢指针找相遇点，Phase 2 从头和相遇点各走 1 步找入口
 *
 * 时间复杂度：O(n)  空间复杂度：O(1)
 */
function detectCycle(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return null;

  // Phase 1: 检测有没有环，找到相遇点
  let slow: ListNode | null = head;
  let fast: ListNode | null = head;

  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;

    if (slow === fast) {
      // Phase 2: 一个指针从头出发，另一个从相遇点出发
      let p1: ListNode | null = head;
      let p2: ListNode | null = slow;

      while (p1 !== p2) {
        p1 = p1!.next;
        p2 = p2!.next;
      }

      return p1; // 相遇点就是环入口
    }
  }

  return null; // 无环
}
```

### LeetCode 287：寻找重复数

这个题是 Floyd 算法最巧妙的应用之一。题目说：给你一个包含 n+1 个整数的数组，每个数都在 `[1, n]` 范围内，只有一个数重复出现了（可能重复多次），要求**不修改数组**且**O(1) 额外空间**。

乍一看跟链表环毫无关系？别急，看下去 👇

```
把数组看成一个链表：
  数组下标 i 指向 nums[i]

例如：nums = [1, 3, 4, 2, 2]
  index 0 → nums[0] = 1  →  index 1 → nums[1] = 3  →  index 3 → nums[3] = 2  →  index 2 → nums[2] = 4  →  index 4 → nums[4] = 2
                                                                                                                   ↑  又回到 2！
                                                                                                              形成了环 2 → 4 → 2

为什么一定有环？
  n+1 个数，值域 [1, n]（只有 n 种可能的值）
  根据鸽巢原理，必然有至少两个 index 指向同一个值
  → 从 index 0 出发走，一定会进入一个环
  → 环的入口就是那个重复的数！
```

这不就变成找链表环入口的问题了吗？

```typescript
/**
 * LeetCode 287: 寻找重复数
 * 思路：把数组当链表，用 Floyd 算法找环入口
 *
 * 时间复杂度：O(n)  空间复杂度：O(1)
 */
function findDuplicate(nums: number[]): number {
  // Phase 1: 快慢指针找相遇点
  let slow = 0;
  let fast = 0;

  do {
    slow = nums[slow];           // 走 1 步
    fast = nums[nums[fast]];     // 走 2 步
  } while (slow !== fast);

  // Phase 2: 从起点和相遇点各走 1 步，找环入口
  let p1 = 0;
  let p2 = slow;

  while (p1 !== p2) {
    p1 = nums[p1];
    p2 = nums[p2];
  }

  return p1; // 环入口就是重复的数
}
```

## 为什么一定相遇？（直觉解释）

很多人读完证明还是会觉得："快指针一定能追上慢指针吗？万一每次都恰好错过了呢？"

来个直觉解释：

```
把环想象成一个圆形跑道。

慢指针在位置 s，快指针在位置 f（假设快指针在慢指针后面 d 步）

每一轮（一次迭代）：
  慢指针走 1 格，快指针走 2 格
  → 快指针相对慢指针，"追近"了 1 格
  → 距离 d 减少 1

所以每走一轮，距离减 1。环的长度是 L，
最多走 L 轮，距离就会从 L-1 变成 0 → 相遇！
```

换句话说，快指针每轮都在**缩短与慢指针的距离**，而环是有限的，所以不可能永远错过。最多 `O(L)` 步（L 是环的长度），必定相遇。

## 复杂度分析

```
┌───────────────┬──────────────┬──────────────┐
│     步骤      │   时间复杂度  │  空间复杂度   │
├───────────────┼──────────────┼──────────────┤
│ 检测环         │    O(n)      │    O(1)      │
│ 找环入口        │    O(n)      │    O(1)      │
│ 寻找重复数      │    O(n)      │    O(1)      │
└───────────────┴──────────────┴──────────────┘

为什么是 O(n)？
  - 检测环：慢指针最多走 n 步就会进入环或到达 null
  - 找入口：Phase 2 的两个指针各走 a 步，a ≤ n
  - 寻找重复数：同理，数组长度就是 n+1

为什么是 O(1)？
  - 只用了固定数量的指针变量，没有额外的数据结构
```

## 变体与扩展

### 1. 求环的长度

在 Phase 1 相遇后，让一个指针继续走，再走回相遇点时就得到了环的长度：

```typescript
function getCycleLength(head: ListNode | null): number {
  if (!head) return 0;

  let slow: ListNode | null = head;
  let fast: ListNode | null = head;

  // Phase 1: 找相遇点
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) break;
  }
  if (!fast || !fast.next) return 0; // 无环

  // Phase 2: 从相遇点继续走一圈
  let length = 1;
  let current: ListNode | null = slow!.next;
  while (current !== slow) {
    length++;
    current = current!.next;
  }

  return length;
}
```

### 2. 判断两个链表是否相交

虽然这不是严格的"环检测"，但 Floyd 的思想可以延伸：把两个链表尾部连起来，就变成了一个"环"问题。

```typescript
/**
 * LeetCode 160: 相交链表
 * 思路：让两个指针分别从 A 和 B 出发，走到末尾后跳到另一个链表的头部。
 *       如果有交点，它们一定在交点相遇；如果无交点，它们同时到达 null。
 *
 * 这其实就是 Floyd 思想的变体——"消除长度差"
 */
function getIntersectionNode(
  headA: ListNode | null,
  headB: ListNode | null
): ListNode | null {
  let pA: ListNode | null = headA;
  let pB: ListNode | null = headB;

  while (pA !== pB) {
    pA = pA ? pA.next : headB; // A 走完换到 B 的头部
    pB = pB ? pB.next : headA; // B 走完换到 A 的头部
  }

  return pA; // 交点或 null
}
```

### 3. Happy Number（LeetCode 202）

判断一个数是不是"快乐数"——不断把各位数字的平方和替换原数，最终能否得到 1。

```typescript
/**
 * LeetCode 202: 快乐数
 * 思路：如果不快乐，平方和计算一定会进入循环 → Floyd 检测环
 *
 * 例如 2: 2→4→16→37→58→89→145→42→20→4→16→... 进入循环
 */
function isHappy(n: number): boolean {
  function getNext(num: number): number {
    let sum = 0;
    while (num > 0) {
      const digit = num % 10;
      sum += digit * digit;
      num = Math.floor(num / 10);
    }
    return sum;
  }

  let slow = n;
  let fast = getNext(n); // 快指针先走一步

  while (fast !== 1 && slow !== fast) {
    slow = getNext(slow);           // 走 1 步
    fast = getNext(getNext(fast));   // 走 2 步
  }

  return fast === 1; // 如果快指针停在 1，是快乐数
}
```

## 面试中的使用技巧

```
面试官问"能不能 O(1) 空间？"的时候，先想想这几个套路：

  1. 链表有环吗？           → Floyd Phase 1
  2. 环的入口在哪？          → Floyd Phase 2
  3. 数组里有重复数吗？       → 把数组当链表，Floyd 全套
  4. 数字会进入循环吗？       → Floyd Phase 1（快乐数等）
  5. 两个链表有没有交点？     → Floyd 思想的变体

记住模板：
  Phase 1: slow = next(slow), fast = next(next(fast))，找相遇
  Phase 2: p1 = start, p2 = meet，各走 1 步，找入口
```

## 总结

Floyd 判圈算法是一个看起来极其简单、但应用极其广泛的小算法：

- **核心思想**：快慢指针在有环结构中一定相遇，通过数学推导找入口
- **时间 O(n)，空间 O(1)**，比哈希表方案更优雅
- **三大应用**：链表环检测/找入口、数组重复数、数字循环检测
- **面试利器**：几乎所有大厂都会问，背模板就行

下次面试官问你"链表有没有环"，你就可以淡定地说：*"两个指针，一个走一步一个走两步，相遇就有环。然后一个从头出发一个从相遇点出发，再相遇就是入口。"* 面试官一听就知道你是真的懂，不是背题的 😎
