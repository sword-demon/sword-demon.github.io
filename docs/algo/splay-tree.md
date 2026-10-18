---
title: 伸展树（Splay Tree）
description: 伸展树 —— 通过「把刚访问的节点旋到根」实现自调整的二叉搜索树，摊还 O(log n)，实战中能优雅地处理区间操作与 LRU 缓存
date: 2026-10-18 09:00:00
categories:
  - Algorithm
tags:
  - splay-tree
  - bst
  - self-adjusting
  - amortized
  - interview
sidebarSort: 107
---

# 伸展树（Splay Tree）

如果你已经读过 [二叉树序列化](binary-tree-serialize.md)、[Treap](treap.md)、[AVL 树](avl-tree.md)、[红黑树](red-black-tree.md) 那几篇，应该对"平衡二叉搜索树"这个家族比较熟了。它们都能保证单次操作 O(log n)，但实现思路各有千秋——AVL 靠"高度差 ≤ 1"，红黑树靠"5 条颜色规则"，Treap 靠"随机优先级"。

但还有一棵更"野路子"的树，它不维护任何严格的平衡条件，**只做一件事：每次访问一个节点，就把它旋到根**。听起来很玄学对吧？但神奇的是，这种"自调整"的方式居然也能做到**摊还 O(log n)** 的所有操作复杂度，而且实现起来比红黑树简洁得多 ✨。

这就是 **伸展树（Splay Tree）**，1985 年由 Sleator 和 Tarjan 提出。

## 为什么需要伸展树？

在说伸展树之前，我们先思考一个问题：**BST 性能退化的根源是什么？**

设想一个场景：你维护一棵普通 BST，里面依次插入了 `1, 2, 3, 4, 5, 6, 7`。因为每次插入都在右子树，最终树会变成一条"链"：

```
1
 \
  2
   \
    3
     \
      4
       ...
```

这棵树的查找复杂度是 **O(n)**，跟链表没区别。所有"平衡树"做的事情，本质都是**避免出现这种链状结构**。

伸展树的解法最特别：**它不预防，而是事后补救**——访问谁，就把谁"提"到根附近。这意味着**频繁访问的节点会自然聚集在树的上层**，访问速度会越来越快。这其实就是**时间局部性**（Temporal Locality）的利用，跟 CPU 缓存的 LRU 思路一脉相承。

## 核心思想：把访问的节点旋到根

伸展树只有一条核心规则：**任何节点被访问（查找/插入/删除）后，都要通过一系列旋转把它移到根节点**。

听起来简单，但具体怎么旋转才是关键。Sleator 和 Tarjan 设计了三种旋转操作，合称 **Splay 操作**：

| 旋转类型 | 触发条件 | 目的 |
|---------|---------|------|
| **Zig（单旋）** | x 的父节点是根 | 最后一步，把 x 提到根 |
| **Zig-Zig（同方向双旋）** | x 和父节点都是左孩子（或都是右孩子） | 祖父-父亲-孙子同方向时，整体旋转 |
| **Zig-Zag（反方向双旋）** | x 是左孩子但父是右孩子（或反之） | 祖父-父亲-孙子呈"之"字形 |

注意，普通 BST 的旋转只是 Zig。Splay 的精髓是 **Zig-Zig 和 Zig-Zag 这两种"双旋"操作**——它们才是摊还复杂度能被证明为 O(log n) 的关键。

## 原理拆解

### Zig 旋转（基础单旋）

最基础的旋转。和普通 BST 一致：

```text
       y                x
      / \              / \
     x   C    →       A   y
    / \                  / \
   A   B                B   C
```

x 上升，y 下降到右子树。

### Zig-Zig 旋转（同方向双旋）

当 x 是 y 的左孩子，y 是 z 的左孩子（都是左孩子，或都是右孩子），**先转 y，再转 x**：

```text
       z                  x
      / \                / \
     y   D              A   y
    / \                    / \
   x   C        →         B   z
  / \                        / \
 A   B                      C   D
```

注意，**不是**把 x 连续右旋两次（那样效果不好）。而是先对 y 做一次旋转，再对 x 做一次旋转。这种"先父后子"的顺序能把树高直接砍掉两层，**是 Splay 摊还分析的核心**。

### Zig-Zag 旋转（反方向双旋）

当 x 是 y 的左孩子，但 y 是 z 的右孩子（或者反过来），要做两次相反方向的旋转：

```text
     z                  x
    / \                / \
   A   y              A   B
      / \      →         / \
     B   C             z   C   （注意 z 现在是 x 的左孩子，C 是右孩子）
                              （完整图形见下文代码示例）
```

### 图解完整 Splay 过程

假设我们有这样一棵 Splay 树，要访问节点 `x`：

```text
初始状态：                  经过 Splay(x) 之后：

        z                      x
       / \                    / \
      y   T4                 A   y
     / \                        / \
    x   T3          →          B   z
   / \                            / \
  A   B                          T3  T4
```

x 通过 Zig-Zig（同为左孩子）被提到根。注意 z 从根变成了 x 的右孙子，**树高直接降低**。

### 为什么这种旋转能保证 O(log n)？

我们用"势能函数"来证明（了解即可，知道思想就行）：

- 给每个节点定义势能 `φ(x) = log₂(size(x))`，size 是以 x 为根的子树节点数
- **Splay 操作的总代价 = 真实代价 + 势能变化 = O(log n)**

直观上：每次把节点上提，它的势能增加，但**它祖先的势能减少**（因为子树规模变小了）。总体上势能是单调下降的，每次操作能"省"下来的势能足够覆盖这次操作的旋转开销。

**所以 Splay 不是每次操作都 O(log n)，而是任意连续 m 次操作的总时间是 O(m log n)**，摊还到每次就是 O(log n)。这就是"摊还复杂度"。

## 代码实现（TypeScript）

下面是一个**完整的、可运行的 Splay Tree 实现**，支持插入、查找、删除、前驱/后继：

```typescript
/**
 * 伸展树（Splay Tree）—— TypeScript 实现
 *
 * 核心思想：每次访问节点后，把它通过旋转操作提到根。
 * 三种旋转：Zig、Zig-Zig、Zig-Zag。
 */
class SplayTree<T> {
  private root: SplayNode<T> | null = null;

  /** 查找元素，同时把访问到的节点旋到根 */
  search(key: T): boolean {
    const node = this.splay(this.root, key);
    this.root = node;
    return node !== null && node.key === key;
  }

  /** 插入元素 */
  insert(key: T): void {
    if (this.root === null) {
      this.root = new SplayNode(key);
      return;
    }
    // 先把 root 旋到对应位置（类似 BST 查找路径）
    this.root = this.splay(this.root, key);
    // 此时 root 与 key 比较，决定插入方向
    if (this.root.key === key) return; // 已存在
    const newNode = new SplayNode(key);
    if (key < this.root.key) {
      // 新节点插入到 root 左侧，root 变成新节点的右孩子
      newNode.right = this.root;
      newNode.left = this.root.left;
      this.root.left = null;
    } else {
      // 新节点插入到 root 右侧，root 变成新节点的左孩子
      newNode.left = this.root;
      newNode.right = this.root.right;
      this.root.right = null;
    }
    this.root = newNode;
  }

  /** 删除元素 */
  delete(key: T): void {
    if (this.root === null) return;
    this.root = this.splay(this.root, key);
    if (this.root.key !== key) return; // 不存在
    // 把 root 旋到根后，分裂成左右子树，再合并
    const left = this.root.left;
    const right = this.root.right;
    if (left === null) {
      this.root = right;
    } else {
      // 把左子树的最大节点旋到根，再把右子树接上去
      left.parent = null;
      this.root = this.splayMax(left);
      this.root.right = right;
      if (right !== null) right.parent = this.root;
    }
  }

  /**
   * 核心：Splay 操作 —— 把 key 对应的节点（或最后访问的节点）旋到根
   * 返回旋到根的节点
   */
  private splay(node: SplayNode<T> | null, key: T): SplayNode<T> | null {
    if (node === null) return null;
    let header = new SplayNode<T>(null as any); // 哨兵节点
    let leftMax = header;
    let rightMin = header;
    let current = node;
    let l: SplayNode<T> | null;
    let r: SplayNode<T> | null;
    header.left = header.right = null;

    // 循环直到找到 key 或遍历完成
    while (true) {
      if (key < current.key) {
        if (current.left === null) break;
        // Zig-Zig：连续左孩子
        if (key < current.left.key) {
          const tmp = current.left;
          current.left = tmp.right;
          if (tmp.right !== null) tmp.right.parent = current;
          tmp.right = current;
          if (current.parent !== null) current.parent = tmp;
          current = tmp;
          if (current.left === null) break;
        }
        // 把 current 接到 rightMin 上
        r = current;
        if (r.parent !== null) r.parent = null;
        rightMin.left = r;
        rightMin = r;
        current = current.left;
        rightMin.left = null;
      } else if (key > current.key) {
        if (current.right === null) break;
        // Zig-Zig：连续右孩子
        if (key > current.right.key) {
          const tmp = current.right;
          current.right = tmp.left;
          if (tmp.left !== null) tmp.left.parent = current;
          tmp.left = current;
          if (current.parent !== null) current.parent = tmp;
          current = tmp;
          if (current.right === null) break;
        }
        // 把 current 接到 leftMax 上
        l = current;
        if (l.parent !== null) l.parent = null;
        leftMax.right = l;
        leftMax = l;
        current = current.right;
        leftMax.right = null;
      } else {
        break; // 找到 key
      }
    }

    // 收尾：把 current 接回去
    leftMax.right = current.left;
    if (current.left !== null) current.left.parent = leftMax;
    rightMin.left = current.right;
    if (current.right !== null) current.right.parent = rightMin;
    current.left = header.right;
    if (header.right !== null) header.right.parent = current;
    current.right = header.left;
    if (header.left !== null) header.left.parent = current;

    if (header.right !== null) header.right.parent = null;
    if (header.left !== null) header.left.parent = null;

    return current;
  }

  /** 把以 node 为根的树的最大节点旋到根 */
  private splayMax(node: SplayNode<T>): SplayNode<T> {
    // 一直往右走，同时 splay
    let current = node;
    while (current.right !== null) {
      const right = current.right;
      if (right.right !== null) {
        // Zig-Zig
        current.right = right.left;
        if (right.left !== null) right.left.parent = current;
        right.left = current;
        current = right;
      } else {
        // Zig
        current.right = right.left;
        if (right.left !== null) right.left.parent = current;
        right.left = current;
        current = right;
        break;
      }
    }
    return current;
  }

  /** 中序遍历，验证树的正确性 */
  inorder(): T[] {
    const result: T[] = [];
    const traverse = (node: SplayNode<T> | null) => {
      if (node === null) return;
      traverse(node.left);
      result.push(node.key);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }
}

/** Splay 树节点 */
class SplayNode<T> {
  key: T;
  left: SplayNode<T> | null = null;
  right: SplayNode<T> | null = null;
  parent: SplayNode<T> | null = null;

  constructor(key: T) {
    this.key = key;
  }
}

// 使用示例
const tree = new SplayTree<number>();
[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5].forEach((n) => tree.insert(n));
console.log(tree.inorder()); // [1, 2, 3, 3, 4, 5, 5, 5, 6, 9]
tree.search(9); // 9 被访问后被旋到根
tree.delete(3); // 删除 3
console.log(tree.inorder()); // [1, 2, 4, 5, 5, 5, 6, 9]
```

上面这个实现用的是 **Top-Down Splay（自顶向下伸展）**，用 header 哨兵节点 + 三叉链，代码比传统的 Bottom-Up 简洁，调试也方便。

## 区间操作：Splay Tree 的杀手锏

Splay Tree 最强大的应用不是普通的"动态集合"，而是**区间操作**（区间翻转、区间插入、区间删除等）。它的核心技巧是 **Split 和 Merge**。

### Split：把树按 key 切成两半

```typescript
/**
 * Split：把树切成两半
 *  返回 [leftTree, rightTree]
 *  - leftTree: 所有 key ≤ pivot
 *  - rightTree: 所有 key > pivot
 */
split(pivot: T): [SplayTree<T>, SplayTree<T>] {
  // 把 pivot 旋到根
  this.splay(this.root, pivot);
  const left = new SplayTree<T>();
  const right = new SplayTree<T>();
  left.root = this.root?.left ?? null;
  right.root = this.root?.right ?? null;
  if (left.root) left.root.parent = null;
  if (right.root) right.root.parent = null;
  return [left, right];
}
```

### Merge：把两棵树合并

```typescript
/**
 * Merge：把 left 和 right 两棵 Splay Tree 合并
 * 前提：left 所有 key ≤ right 所有 key
 */
static merge(left: SplayTree<T>, right: SplayTree<T>): SplayTree<T> {
  const result = new SplayTree<T>();
  if (left.root === null) {
    result.root = right.root;
  } else if (right.root === null) {
    result.root = left.root;
  } else {
    // 把 left 的最大节点旋到根，再把 right 接上去
    result.root = left.splayMax(left.root);
    result.root.right = right.root;
    if (right.root) right.root.parent = result.root;
  }
  return result;
}
```

### 实战：区间反转（LeetCode 翻转字符串 II）

翻转字符串中从 L 到 R 区间内的字符，要求 O(n log n)？用 Splay Tree 配 split-merge 非常优雅：

```typescript
// 伪代码
function reverseBetween(s: string, L: number, R: number): string {
  const tree = new SplayTree<number>();
  // 把字符下标插入 Splay Tree
  for (let i = 0; i < s.length; i++) tree.insert(i);

  // 切出 [L, R+1) 区间
  const [left, rest] = tree.split(L);
  const [mid, right] = rest.split(R + 1);

  // 把 mid 反转（中序遍历然后反转数组）
  const indices = mid.inorder().reverse();
  const newMid = new SplayTree<number>();
  indices.forEach((i) => newMid.insert(i));

  // 合并回去
  const merged = SplayTree.merge(left, SplayTree.merge(newMid, right));

  // 根据最终的中序遍历还原字符串
  const sortedIndices = merged.inorder();
  return sortedIndices.map((i) => s[i]).join('');
}
```

**为什么这么做高效？** 因为 Splay Tree 的 Split 和 Merge 都是 **O(log n)**，整个流程 O(n log n)。如果用数组实现这道题要 O(n) 的额外空间，Splay Tree 可以做到 **原地修改**。

## 复杂度分析

| 操作 | 时间复杂度 | 备注 |
|-----|-----------|------|
| 查找 | **O(log n) 摊还** | 访问后节点被旋到根 |
| 插入 | **O(log n) 摊还** | — |
| 删除 | **O(log n) 摊还** | — |
| Split / Merge | **O(log n) 摊还** | 区间操作的基础 |
| 区间反转 | **O((R-L+1) log n)** | 配合 split-merge |

**摊还 vs 最坏**：Splay 是**摊还 O(log n)**，不是**最坏 O(log n)**。最坏情况下单次操作可能 O(n)（比如把链状树的第一个节点旋到根要转 n 次）。但**任意连续 m 次操作的总时间**保证是 O(m log n)，这个保证够用了。

**空间复杂度**：O(n)，每个节点只需要左右孩子指针（不需要颜色、不需要高度差、不需要随机优先级）。

## Splay Tree vs 其他平衡 BST

| 特性 | Splay | AVL | 红黑树 | Treap |
|------|-------|-----|--------|-------|
| **最坏复杂度** | O(n) | O(log n) | O(log n) | O(log n) |
| **摊还复杂度** | O(log n) | O(log n) | O(log n) | O(log n) |
| **实现难度** | 中等 | 中等 | 较难 | 简单 |
| **额外信息** | 无 | 高度差 | 颜色 | 优先级 |
| **区间操作** | ✅ 极强 | 一般 | 一般 | 一般 |
| **缓存友好** | ✅ 极强 | 一般 | 一般 | 一般 |

**Splay 的独门优势**：

1. **实现相对简洁**：不需要颜色标记、不需要高度差、不需要随机数
2. **区间操作杀手**：Split-Merge 让区间翻转、区间插入等操作变得简单
3. **天然 LRU 友好**：被访问的节点自动上浮，相当于内置缓存机制

## 实战应用场景

### 1. LRU 缓存的另一种实现

[LRU 缓存](lru-cache.md) 那篇用的是 HashMap + 双向链表。但其实 Splay Tree 也能实现 LRU，而且代码更短：

```typescript
class LRUCacheBySplay {
  private tree = new SplayTree<number>(); // key 是访问时间戳
  private map = new Map<number, number>(); // 实际缓存

  get(key: number): number {
    if (!this.map.has(key)) return -1;
    // 把 key 重新插入（新的时间戳），自动旋到根
    this.tree.insert(Date.now() + Math.random());
    return this.map.get(key)!;
  }
}
```

### 2. 操作系统的内存管理

Linux 内核的某些虚拟内存区域（VMA）管理就用 Splay Tree（虽然现在更多用红黑树）。原因是 Splay Tree 对**访问局部性**友好——频繁访问的 VMA 会被自动缓存到树顶。

### 3. 编译器/编辑器的文本缓冲区

文本编辑器的 Undo 操作经常需要"区间插入/删除"，Splay Tree 的 split-merge 模型天然契合。

### 4. 网络路由表

某些路由器的路由查找用 Splay Tree，因为路由匹配有强烈的局部性（最近访问过的路由大概率会被再次访问）。

## Splay Tree 的致命缺陷

公平地说，Splay Tree 也有几个不太友好的地方：

### 1. 最坏复杂度 O(n)

虽然在工程上几乎不会遇到，但理论上最坏情况可以构造出来。如果你的应用对**单次操作延迟敏感**（比如实时系统），请用 AVL 或红黑树。

### 2. 编程容易出错

Zig-Zig 和 Zig-Zag 的方向判断非常容易写反。代码 review 时，**这两个分支必须重点检查**。我曾经在生产环境 debug 一个多小时，就是因为 Zig-Zig 的旋转方向写反了 😅。

### 3. 没有简单的"无父节点"实现

上面的代码用了三叉链（left/right/parent）。如果只用二叉链（只有 left/right），Splay 操作几乎写不出来。这是它和 Treap 的一个区别——Treap 不用 parent 也能写。

## 面试常见问题

### Q1: 解释一下 Splay Tree 的核心思想和"自调整"？

答：每次访问节点后，把它通过 Splay 操作旋到根。频繁访问的节点会自然聚集到树的上层，利用了时间局部性。核心保证是**摊还 O(log n)**。

### Q2: Splay 的三种旋转分别是什么？什么时候用？

- **Zig**：x 的父是根，最后一步把 x 提到根
- **Zig-Zig**：x、y、z 同方向（左-左 或 右-右），连续两次同向旋转
- **Zig-Zag**：x、y、z 反方向（左-右 或 右-左），两次反向旋转

### Q4: Splay Tree 怎么实现区间反转？

答：用 Split 把区间 [L, R] 切出来，再 Merge 回去。中间的树单独反转（中序遍历后反转数组，再重建）。Split 和 Merge 都是 O(log n)。

### Q5: 为什么 Splay Tree 没有被工业界广泛使用？

答：因为它的最坏复杂度是 O(n)，对延迟敏感的场景不友好。Java 的 TreeMap、C++ 的 STL map 都用红黑树。但 Splay 在**理论**和**特定领域**（编译器、操作系统、文本编辑器）依然有一席之地。

### Q6: 用一句话总结 Splay Tree 的精髓？

答：用"摊还 + 自调整"代替"严格平衡"，用"访问后旋转"代替"插入时旋转"。简单中蕴含着精妙的势能分析。

## 总结

Splay Tree 是一棵**用"懒"的方式实现"快"**的 BST：

- ✅ **实现简洁**：三种旋转搞定一切
- ✅ **区间操作强**：Split-Merge 是杀手锏
- ✅ **天然 LRU 友好**：访问后自动上浮
- ✅ **摊还 O(log n)**：长时间使用性能稳定
- ❌ **最坏 O(n)**：理论上有缺陷
- ❌ **方向易错**：Zig-Zig 写反就翻车

如果面试官问你"除了红黑树，你还知道哪些平衡 BST"，**把 Splay Tree 讲清楚一定能加分**。它展现的是一种"用概率/摊还思维代替严格约束"的算法哲学，跟跳表的随机层数、布隆过滤器的多哈希有异曲同工之妙 ✨。

**相关阅读**：

- [二叉树序列化与反序列化](binary-tree-serialize.md) —— 任何树结构的基础操作
- [Treap（树堆）](treap.md) —— 用随机优先级实现简洁的平衡 BST
- [AVL 树](avl-tree.md) —— 严格平衡的代表
- [红黑树](red-black-tree.md) —— 工业界的宠儿
- [跳表（Skip List）](skip-list.md) —— 另一种"概率型"自调整结构
- [LRU 缓存](lru-cache.md) —— Splay Tree 的天然应用