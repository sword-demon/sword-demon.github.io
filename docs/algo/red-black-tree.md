---
title: 红黑树
description: 红黑树（Red-Black Tree）
date: 2026-08-29 09:06:44
categories:
  - Algorithm
tags:
  - red-black-tree
sidebarSort: 78
---

# 红黑树（Red-Black Tree）

你去面试，面试官问："Java 的 `TreeMap` 底层是什么？"你说："红黑树。"面试官点点头："那你说说它和 AVL 树有啥区别？"你脑子一片空白……

这种场景我见过太多了。红黑树在工业界用得极广——`java.util.TreeMap`、`java.util.TreeSet`、`C++ STL 的 map/set`、`Linux 内核的 CFS 调度器`、`epoll` 都在用它。但教科书往往一上来就甩一堆"左旋、右旋、变色"的规则，让人看了就头大。

今天咱们换个讲法：**先搞清楚它要解决什么问题，再看它怎么解决，最后再聊代码**。我会尽量用图说话，让你看完就能在面试里复述出来。

---

## 为什么需要红黑树？

我们先从一棵最简单的二叉搜索树（BST）说起：

```
50
├── 30
│   ├── 20
│   └── 40
└── 70
    ├── 60
    └── 80
```

BST 的查询、插入、删除平均是 **O(log n)**，听起来挺美好的。但它有个致命的毛病：**最坏情况会退化成链表**。

想象一下你依次插入 `1, 2, 3, 4, 5`：

```
1
 └── 2
      └── 3
           └── 4
                └── 5
```

一棵"歪脖子树"，高度变成了 n，查询从 O(log n) 直接退化成 O(n)，跟链表没区别。

为了解决退化问题，平衡二叉搜索树（Balanced BST）就登场了。常见的平衡策略有两大流派：

| 类型 | 代表 | 特点 |
|------|------|------|
| 高度平衡 | AVL 树 | 严格平衡，左右子树高度差 ≤ 1，查询极快 |
| 颜色平衡 | 红黑树 | 近似平衡，统计上 O(log n)，插入删除更高效 |

**AVL 树查得快，但每次插入/删除可能要旋转很多次来"维护平衡"**。对于频繁增删的场景，这个开销就有点大了。

红黑树的折中思路是：**我不追求严格平衡，我只保证"大致平衡"**——树的高度最多是 `2 * log(n+1)`，看似不严格，但已经够用了；而作为交换，插入/删除最多只需要 **3 次旋转**，常数项小得多。

---

## 红黑树的 5 条铁律

红黑树的本质是：**在 BST 的基础上，给每个节点染上红色或黑色，然后通过 5 条规则来约束树的结构**。

```
红黑树示意（红色节点用 R 表示，黑色节点用 B 表示）：

         50(B)
        /     \
     30(R)    70(R)
     /  \    /   \
  20(B) 40(B) 60(B) 80(B)
```

### 5 条规则

1. **每个节点要么红，要么黑**。
2. **根节点是黑色**。
3. **每个叶子节点（NIL 空节点）是黑色**。（这里的"叶子"指的是那些哨兵空节点，不是真有数据的叶子）
4. **如果一个节点是红色，它的两个子节点必须是黑色**（不能有连续的红节点）。
5. **从任一节点到其每个叶子节点的所有路径上，黑色节点的数量必须相同**（黑高一致）。

### 这 5 条规则带来的效果

- 规则 4 + 5 联合起来，让红黑树的"最长路径"（红黑交替）最多是"最短路径"（全黑）的 **2 倍**。
- 所以树的高度被限制在 `O(log n)` 级别，但比 AVL 宽松得多。
- **红黑树 = 用一点点的"不平衡"换取更少的旋转次数**，这就是它的设计哲学。

```
最短路径：所有节点都是黑色
最长路径：红黑交替（B-R-B-R-B-R-...）

           50(B)           ← 最短路径：3 个 B
          /     \
       30(B)   70(B)
       /  \    /  \
    20(B) 40(B) 60(B) 80(B)

           50(B)           ← 最长路径：红黑交替
          /     \
       30(R)   70(R)
       /  \    /  \
    20(B) 40(B) 60(B) 80(B)
```

两者高度都还是 O(log n)。

---

## 三个核心操作：左旋、右旋、变色

在讲插入和删除之前，必须先掌握这三个基本操作。旋转不会改变 BST 的中序遍历结果，只是调整树的形状。

### 左旋（Rotate Left）

以某个节点 X 为支点，把 X 的右孩子 Y"提上来"成为新的根，X 变成 Y 的左孩子。

```
左旋前：
    X
   / \
  a   Y
     / \
    b   c

左旋后：
    Y
   / \
  X   c
 / \
a   b
```

### 右旋（Rotate Right）

跟左旋对称。

```
右旋前：
      Y
     / \
    X   c
   / \
  a   b

右旋后：
    X
   / \
  a   Y
     / \
    b   c
```

### 变色（Recolor）

把节点颜色从红变黑，或者从黑变红。这是红黑树独有的操作，AVL 树可没这玩意儿。

---

## 插入操作详解

插入分两步：

1. **按 BST 规则插入新节点**（颜色默认设为红色——为什么？因为黑色节点会影响"黑高"，改变它代价大；红色节点最多违反规则 4，处理起来简单）。
2. **修复红黑树的性质**（因为插了红色节点，可能会出现连续红节点，违反规则 4）。

修复过程要看叔叔节点（uncle）的颜色，分两种情况：

### 情况 1：叔叔是红色

这种情况下，爷爷一定是黑色（否则之前就不平衡了）。处理：**把爸爸和叔叔变黑，爷爷变红**，然后把问题"上抛"到爷爷节点。

```
插入前：           插入新节点 Z（红）后：
      G(B)               G(B)
     /   \              /   \
   P(R)   U(R)         P(R)   U(R)
  /                   / \
 ?                   ?   Z(R)   ← 这里出现红红冲突！
                       ↑
                  Z 是 P 的右孩子

修复（变色 + 上抛）：
      G(R)               ← 爷爷变红
     /   \
   P(B)   U(B)           ← 爸爸和叔叔变黑
  / \
 ?   Z(R)

如果爷爷变成了根，还得把根再变回黑色。
```

### 情况 2：叔叔是黑色

这种情况更复杂，分四个子情况。核心思路：**通过旋转把新节点调整到合适的位置，再变色**。

```
形状：Z 是 P 的左孩子，P 是 G 的左孩子  （LL 型）
       G(B)
      /
    P(R)
   /
  Z(R)

处理：P 变黑，G 变红，对 G 做右旋
       P(B)
      /   \
    Z(R)   G(R)
```

```
形状：Z 是 P 的右孩子，P 是 G 的右孩子  （RR 型）
       G(B)
        \
        P(R)
          \
          Z(R)

处理：P 变黑，G 变红，对 G 做左旋
       P(B)
      /   \
    G(R)   Z(R)
```

LR 和 RL 型是上面两种的镜像，处理方式对称。

---

## 删除操作详解

删除是红黑树里**最复杂**的部分，强烈建议只记个大概思路，面试时不会让你写完整代码。

删除也分两步：

1. **按 BST 规则删除节点**（如果是删除有两个孩子的节点，通常用右子树的最小节点来"替换"它，然后再删除那个最小节点）。
2. **修复红黑树的性质**。

被删除的节点如果是**红色**，那没事，树还是平衡的（红色节点不影响黑高）。

如果被删除的是**黑色节点**，那从根到这个分支路径上的黑高就少了 1，会破坏规则 5。这种情况需要修复——通过旋转和变色，把"缺失的黑色"补回来。

具体要分很多种情况（被删节点的兄弟是黑还是红、兄弟的孩子分布等），面试能讲清楚思路就够了。

---

## 代码实现（TypeScript）

```typescript
/**
 * 红黑树节点颜色枚举
 */
enum Color {
  RED = 'RED',
  BLACK = 'BLACK',
}

/**
 * 红黑树节点
 */
class RBNode<T> {
  value: T;
  color: Color;
  left: RBNode<T> | null = null;
  right: RBNode<T> | null = null;
  parent: RBNode<T> | null = null;

  constructor(value: T, color: Color = Color.RED) {
    this.value = value;
    this.color = color;
  }
}

/**
 * 红黑树 - 简化版实现（仅插入）
 */
class RedBlackTree<T> {
  private NIL: RBNode<T>;
  public root: RBNode<T>;

  constructor() {
    // 哨兵节点，所有 NIL 叶子都指向它，颜色固定为黑
    this.NIL = new RBNode<T>(null as any, Color.BLACK);
    this.root = this.NIL;
  }

  /** 左旋 */
  private rotateLeft(x: RBNode<T>): void {
    const y = x.right!;
    x.right = y.left;
    if (y.left !== this.NIL) {
      y.left!.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === null) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
  }

  /** 右旋 */
  private rotateRight(x: RBNode<T>): void {
    const y = x.left!;
    x.left = y.right;
    if (y.right !== this.NIL) {
      y.right!.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === null) {
      this.root = y;
    } else if (x === x.parent.right) {
      x.parent.right = y;
    } else {
      x.parent.left = y;
    }
    y.right = x;
    x.parent = y;
  }

  /** 插入修复：保证红黑树性质 */
  private fixInsert(z: RBNode<T>): void {
    while (z.parent && z.parent.color === Color.RED) {
      const grandParent = z.parent.parent!;
      if (z.parent === grandParent.left) {
        const uncle = grandParent.right;
        // 情况 1：叔叔是红色 -> 变色 + 上抛
        if (uncle && uncle.color === Color.RED) {
          z.parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          grandParent.color = Color.RED;
          z = grandParent;
        } else {
          // 情况 2：叔叔是黑色，Z 是右孩子 -> 转化为情况 3
          if (z === z.parent.right) {
            z = z.parent;
            this.rotateLeft(z);
          }
          // 情况 3：叔叔是黑色，Z 是左孩子
          z.parent!.color = Color.BLACK;
          grandParent.color = Color.RED;
          this.rotateRight(grandParent);
        }
      } else {
        // 对称的另一侧
        const uncle = grandParent.left;
        if (uncle && uncle.color === Color.RED) {
          z.parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          grandParent.color = Color.RED;
          z = grandParent;
        } else {
          if (z === z.parent.left) {
            z = z.parent;
            this.rotateRight(z);
          }
          z.parent!.color = Color.BLACK;
          grandParent.color = Color.RED;
          this.rotateLeft(grandParent);
        }
      }
    }
    this.root.color = Color.BLACK;
  }

  /** 公开的插入接口 */
  insert(value: T): void {
    const newNode = new RBNode<T>(value, Color.RED);
    newNode.left = this.NIL;
    newNode.right = this.NIL;

    let y: RBNode<T> | null = null;
    let x: RBNode<T> = this.root;

    // 标准 BST 插入
    while (x !== this.NIL) {
      y = x;
      if (newNode.value < x.value) {
        x = x.left;
      } else {
        x = x.right;
      }
    }

    newNode.parent = y;
    if (y === null) {
      this.root = newNode;
    } else if (newNode.value < y.value) {
      y.left = newNode;
    } else {
      y.right = newNode;
    }

    this.fixInsert(newNode);
  }

  /** 中序遍历（验证 BST 性质） */
  inorder(node: RBNode<T> | null = this.root, result: T[] = []): T[] {
    if (node === this.NIL || node === null) return result;
    this.inorder(node.left, result);
    result.push(node.value);
    this.inorder(node.right, result);
    return result;
  }
}

// 演示
const tree = new RedBlackTree<number>();
[10, 20, 30, 15, 25, 5, 1, 8].forEach((v) => tree.insert(v));
console.log('中序遍历:', tree.inorder());
// 输出: [1, 5, 8, 10, 15, 20, 25, 30]  ← 仍然是排好序的
```

> 注：删除操作的修复逻辑比插入复杂得多（要处理 4~6 种 case），上面的代码只实现了插入。生产环境请直接用现成的库。

---

## 复杂度分析

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 查找 | O(log n) | 由黑高保证 |
| 插入 | O(log n) | 最多 2 次旋转 |
| 删除 | O(log n) | 最多 3 次旋转 |
| 空间 | O(n) | 每个节点多存一个颜色位和 parent 指针 |

**为什么红黑树比 AVL 树插入删除快？**

- AVL 树要求左右子树高度差 ≤ 1，插入一个节点后可能需要从插入点一路向上旋转到根，最多 O(log n) 次旋转。
- 红黑树只要求"大致平衡"，最多旋转 2~3 次就搞定了，剩下的事情靠"变色"解决。**变色是 O(1) 操作，比旋转便宜**。

---

## 实际应用场景

### 1. Java 的 TreeMap / TreeSet

`java.util.TreeMap` 的底层就是红黑树。它保证 key 的有序性，提供 `O(log n)` 的 `get`、`put`、`remove`，以及 `firstKey()`、`lastKey()`、`subMap()` 这些有序操作。

```java
TreeMap<Integer, String> map = new TreeMap<>();
map.put(3, "three");
map.put(1, "one");
map.put(2, "two");

// 按 key 升序遍历
for (Map.Entry<Integer, String> entry : map.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
// 1: one
// 2: two
// 3: three
```

### 2. C++ STL 的 map / set

`std::map` 和 `std::set` 的底层也是红黑树（很多实现是）。

### 3. Linux 内核的 CFS 调度器

Linux 用红黑树来管理所有可运行的进程，每个节点是一个 task_struct，红黑树的 key 是"虚拟运行时间"。CFS 每次要选下一个运行的进程，就 `O(log n)` 地从红黑树里取最左节点。

### 4. epoll

Linux 的 `epoll` 内核实现里，用红黑树来管理所有被监听的文件描述符（fd）。每次 `epoll_ctl` 添加/删除 fd，都是 `O(log n)` 的红黑树操作。

### 5. nginx 的定时器

nginx 用红黑树管理定时事件，每次找最近到期的定时器，就是取红黑树的最左节点，O(log n)。

---

## 红黑树 vs AVL 树

面试常考题，给你画个对比：

| 维度 | AVL 树 | 红黑树 |
|------|--------|--------|
| 平衡严格度 | 严格（高度差 ≤ 1） | 较宽松（最长路径 ≤ 2 倍最短） |
| 查询性能 | O(log n)，更快 | O(log n)，稍慢（高度更大） |
| 插入/删除 | 需要更多旋转，慢 | 旋转 ≤ 3 次，快 |
| 适用场景 | 读多写少 | **读写都比较频繁**（工业首选） |

**总结一句话**：查多用 AVL，增删多用红黑树。所以工程实践几乎清一色选红黑树。

---

## 面试常问问题

### Q1: 为什么红黑树查询性能比 AVL 差，工业还选它？

因为现实场景里插入删除比查询还频繁。AVL 每次增删都要旋转很多次维护严格平衡，开销大。红黑树牺牲一点查询性能（树稍高一点），换来增删的常数项小，**总体吞吐量更高**。

### Q2: 红黑树最多旋转几次？

- 插入：最多 **2 次**
- 删除：最多 **3 次**

### Q3: 为什么新插入的节点默认是红色？

因为插入红色节点**最多破坏规则 4**（红红冲突），处理起来简单。插入黑色节点一定会破坏规则 5（黑高不一致），那修复起来要麻烦得多。

### Q4: 红黑树是平衡二叉树吗？

**是**。虽然它不是严格平衡，但它的任意路径长度都被限制在 `O(log n)`，符合平衡二叉树的定义。只是平衡的程度比 AVL 宽松。

---

## 总结

红黑树的核心要点：

- **本质**：在 BST 基础上加颜色约束，保证树大致平衡。
- **5 条规则**：根黑、红节点子必黑、NIL 黑、黑高一致（加颜色二选一）。
- **关键操作**：左旋、右旋、变色。
- **插入**：BST 插入 + 修复（变色为主，旋转为辅）。
- **删除**：BST 删除 + 修复（最复杂，4~6 种 case）。
- **复杂度**：所有操作 O(log n)，最多 3 次旋转。
- **应用**：Java TreeMap、STL map、Linux CFS、epoll、nginx 定时器。

面试前把这些点背熟，再练两道手写红黑树的题（LeetCode 上没有原题，但牛客网和剑指 Offer 有类似题），基本就稳了。

记住，**理解优先于死记硬背**。当你搞清楚"为什么要这样设计"之后，那些旋转和变色的规则就再也忘不掉了 ✨。