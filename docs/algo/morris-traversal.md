---
title: Morris 遍历
description: 用 O(1) 空间遍历二叉树
date: 2026-06-19 10:00:00
categories:
  - Algorithm
tags:
  - binary-tree
  - morris-traversal
  - o1-space
sidebarSort: 48
---

# Morris 遍历（Morris Traversal）

你有没有想过一个问题：二叉树的前序、中序、后序遍历，递归写法简单优雅，迭代写法用栈也还行，但它们都需要 **O(h) 的额外空间**（h 是树的高度）。如果是一棵完全平衡的百万节点二叉树，递归可能栈溢出，迭代版本也要压几万个节点进栈。

那有没有一种方法，能在 **O(1) 空间** 内完成二叉树遍历呢？

有，这就是 **Morris 遍历**（Morris Traversal），由 J.H. Morris 在 1979 年提出。它的核心思想一句话概括：**利用叶子节点的空指针，建立临时"指路牌"，遍历完再拆掉** ✨。

## 问题引入

面试官可能会这样问你："不用栈，不用递归，用 O(1) 空间做二叉树中序遍历，能写吗？"

大多数人的第一反应是"不可能"——不压栈你怎么回溯？但 Morris 的天才之处就在于：它利用了**树中叶子节点大量空闲的 `null` 指针**。这些指针本来是浪费的，Morris 把它们临时改造成"回溯指针"，用完再恢复原状，树的结构不受影响。

## 原理拆解

### 核心思想

对于当前节点 `cur`：

1. 如果 `cur` 没有左子树 → 直接访问 `cur`，然后 `cur = cur.right`
2. 如果 `cur` 有左子树 → 找左子树的**最右节点**（中序前驱）
   - 如果前驱的 `right` 是 `null` → 把它指向 `cur`（建立"指路牌"），然后 `cur = cur.left`
   - 如果前驱的 `right` 已经指向 `cur` → 说明左子树已经遍历完了，把 `right` 恢复为 `null`（拆掉指路牌），访问 `cur`，然后 `cur = cur.right`

```
初始树：
        4
       / \
      2    6
     / \  / \
    1   3 5   7

中序遍历应该输出：1, 2, 3, 4, 5, 6, 7
```

### 图解 Morris 中序遍历

```
cur=4，有左子树，找左子树最右节点 → 3
  3.right == null → 建立指路牌：3.right = 4
  cur = cur.left = 2

        4
       / \
      2    6
     / \  / \
    1   3 5   7
         \
          4  ← 指路牌（3 的 right 指向 4）

cur=2，有左子树，找左子树最右节点 → 1
  1.right == null → 1.right = 2
  cur = 1

cur=1，没有左子树 → 输出 1 ✓，cur = 1.right = 2（走指路牌回来）

cur=2，有左子树，找左子树最右节点 → 1
  1.right == 2（指路牌存在）→ 说明左子树遍历完了
  1.right = null（拆掉指路牌）
  输出 2 ✓，cur = 2.right = 3

cur=3，没有左子树 → 输出 3 ✓，cur = 3.right = 4（走指路牌）

cur=4，有左子树，找左子树最右节点 → 3
  3.right == 4（指路牌存在）→ 左子树已遍历完
  3.right = null（拆掉）
  输出 4 ✓，cur = 4.right = 6

... 同理输出 5, 6, 7 ✓

最终树恢复原样，没有任何修改！
```

关键洞察：叶子节点的 `right` 指针本来都是 `null`，Morris 临时借用它们当"回溯指针"，用完就归还。每个节点最多被访问 3 次（建指路牌、走指路牌回来、拆指路牌），所以总时间仍然是 O(n)。

## 代码实现

### TypeScript — 中序遍历

```typescript
/**
 * Morris 中序遍历 —— TypeScript 实现
 * 核心思想：利用叶子节点的空 right 指针建立临时线索，实现 O(1) 空间遍历
 */

class TreeNode {
  val: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(val: number) {
    this.val = val;
  }
}

function morrisInorder(root: TreeNode | null): number[] {
  const result: number[] = [];
  let cur = root;

  while (cur !== null) {
    if (cur.left === null) {
      // 没有左子树，直接访问当前节点
      result.push(cur.val);
      cur = cur.right;
    } else {
      // 有左子树，找中序前驱（左子树的最右节点）
      let predecessor = cur.left;
      while (predecessor.right !== null && predecessor.right !== cur) {
        predecessor = predecessor.right;
      }

      if (predecessor.right === null) {
        // 第一次到达：建立指路牌，深入左子树
        predecessor.right = cur;
        cur = cur.left;
      } else {
        // 第二次到达：左子树已遍历，拆除指路牌，访问当前节点
        predecessor.right = null;
        result.push(cur.val);
        cur = cur.right;
      }
    }
  }

  return result;
}
```

### TypeScript — 前序遍历

前序和中序的区别只在"什么时候访问节点"：中序在拆指路牌时访问，前序在**建指路牌时访问**（因为前序是根→左→右，先访问根）。

```typescript
function morrisPreorder(root: TreeNode | null): number[] {
  const result: number[] = [];
  let cur = root;

  while (cur !== null) {
    if (cur.left === null) {
      result.push(cur.val);
      cur = cur.right;
    } else {
      let predecessor = cur.left;
      while (predecessor.right !== null && predecessor.right !== cur) {
        predecessor = predecessor.right;
      }

      if (predecessor.right === null) {
        // 第一次到达 → 前序在这里访问（建指路牌时就输出）
        result.push(cur.val);
        predecessor.right = cur;
        cur = cur.left;
      } else {
        // 第二次到达 → 不再访问（前序已经访问过了）
        predecessor.right = null;
        cur = cur.right;
      }
    }
  }

  return result;
}
```

### TypeScript — 后序遍历（进阶）

后序遍历稍微复杂一点，因为后序是"左→右→根"，需要在拆指路牌时**逆序输出右边界**。面试中能写出来中序和前序版本就够了，后序了解思路即可。

```typescript
function morrisPostorder(root: TreeNode | null): number[] {
  const result: number[] = [];
  const dummy = new TreeNode(0);
  dummy.left = root;
  let cur: TreeNode | null = dummy;

  while (cur !== null) {
    if (cur.left === null) {
      cur = cur.right;
    } else {
      let predecessor = cur.left;
      while (predecessor.right !== null && predecessor.right !== cur) {
        predecessor = predecessor.right;
      }

      if (predecessor.right === null) {
        predecessor.right = cur;
        cur = cur.left;
      } else {
        // 拆掉指路牌，逆序输出 cur.left 到 predecessor 的右边界
        predecessor.right = null;
        reverseAddPath(cur.left, predecessor, result);
        cur = cur.right;
      }
    }
  }

  return result;
}

function reverseAddPath(
  from: TreeNode,
  to: TreeNode,
  result: number[]
): void {
  // 反转从 from 到 to 的 right 链
  let prev: TreeNode | null = null;
  let cur: TreeNode | null = from;
  while (cur !== to) {
    const next = cur!.right;
    cur!.right = prev;
    prev = cur;
    cur = next;
  }
  cur!.right = prev;

  // 沿反转后的链收集节点值
  let node: TreeNode | null = cur;
  while (node !== null) {
    result.push(node.val);
    node = node.right;
  }
}
```

## 三种遍历方式对比

```
                中序               前序               后序
访问时机     拆指路牌时        建指路牌时        拆指路牌 + 逆序输出
输出顺序     左 → 根 → 右      根 → 左 → 右      左 → 右 → 根
复杂度       简单               简单               较复杂（需反转链）
面试要求     必会               必会               了解即可
```

## 和普通遍历的对比

| 遍历方式 | 时间 | 额外空间 | 特点 |
|----------|------|----------|------|
| 递归 | O(n) | O(h) 栈空间 | 最简洁，但可能栈溢出 |
| 迭代（显式栈） | O(n) | O(h) 栈空间 | 可控，不会栈溢出 |
| Morris | O(n) | **O(1)** | 空间最优，但会临时修改树结构 |

为什么 Morris 时间也是 O(n)？虽然有两层 while 循环，但内层循环找前驱时，每条边最多被走两次（去一次、回来一次），所以总时间仍是 O(n)。

## 实际应用场景

### 1. 嵌入式 / 内存受限场景

在嵌入式设备上，栈空间可能只有几 KB。递归遍历一棵深度 1000 的二叉树就可能栈溢出。Morris 遍历完全不使用栈，是唯一能在 O(1) 空间内完成遍历的方案。

### 2. 超大树的序列化

当你需要把一棵百万节点的二叉树序列化到磁盘时，用 Morris 遍历可以避免巨大的栈开销。虽然遍历过程中会临时修改树结构，但最终会恢复，不影响数据正确性。

### 3. 面试经典题

Morris 遍历是二叉树相关面试题的"大杀器"。当面试官要求你"不用栈和递归遍历二叉树"时，写出来直接加分。LeetCode 94（中序）、144（前序）、145（后序）都可以用 Morris 实现。

### 4. 线索二叉树的实践

Morris 遍历本质上就是一种**临时线索二叉树**——在线索二叉树中，空指针被永久改造成指向遍历前驱/后继的线索；而 Morris 是用完就拆，更加灵活。

## 复杂度分析

| 指标 | 复杂度 | 说明 |
|------|--------|------|
| 时间 | O(n) | 每条边最多走两次，总操作数 ≤ 2n |
| 空间 | O(1) | 只用了几个指针变量，无栈无递归 |

## 小结

Morris 遍历是一个"优雅到让人怀疑它是不是真的"的算法 🎯

- ✅ **O(1) 空间**，碾压递归和迭代方案
- ✅ **O(n) 时间**，不比其他方法慢
- ✅ 遍历结束后**树的结构完全恢复**，无副作用
- ❌ 代码稍微复杂一点，尤其是后序遍历版本
- ❌ 会临时修改树结构，如果在多线程环境下需要加锁

面试中建议先把中序版本背熟（核心就一个 while + 一个找前驱），理解"建指路牌 → 拆指路牌"的套路后，前序版本几乎是复制粘贴改一行代码的事 😉
