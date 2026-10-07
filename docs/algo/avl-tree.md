---
title: AVL 树
description: AVL 树（自平衡二叉搜索树）
date: 2026-10-03 09:11:38
categories:
  - Algorithm
tags:
  - avl-tree
  - balanced-bst
sidebarSort: 95
---

# AVL 树（Adelson-Velsky and Landis Tree）

面试被问"Java 的 TreeMap 底层是什么"，你答了红黑树。面试官接着问："那 AVL 树跟红黑树有啥区别？为啥 Java 选红黑树不选 AVL？"——如果你只背过红黑树的 5 条铁律、却没认真啃过 AVL，这道题大概率要哑火 😵。

我跟很多候选人聊下来，发现一个共性问题：**知道红黑树多，知道 AVL 少**。但其实 AVL 才是平衡二叉搜索树（BBST）的"老祖宗"——它 1962 年就被发明了，比红黑树（1972 年）早了整整十年。今天咱们就把它掰开揉碎，从原理到代码一次性讲透。

## 为什么需要 AVL 树？

先回到二叉搜索树（BST）。理想情况下，BST 的查询是 **O(log n)**，挺美好的。但 BST 有个要命的缺陷：**最坏情况会退化成链表**。

想象一下依次插入 `1, 2, 3, 4, 5, 6, 7`：

```
1
 └── 2
      └── 3
           └── 4
                └── 5
                     └── 6
                          └── 7
```

这就是一根"歪脖子树"，高度从 log₂7 ≈ 3 变成了 7，O(log n) 直接退化到 O(n)，跟链表没区别。这种场景在数据库索引里特别致命——你 insert 一个有序的自增 ID 进去，BST 就废了。

要解决这个退化问题，**平衡二叉搜索树** 应运而生。AVL 树就是最经典的一种，它给 BST 加了一条硬约束：**任意节点的左右子树高度差不超过 1**。

```text
          4 (高度 3)
        /   \
      2     6           ← 高度差 = 0
     / \   / \
    1   3 5   7         ← 叶子高度 = 1

合法的 AVL 树（每个节点的左右子树高度差 ≤ 1）：
          4 (h=3)
        /   \
      2     6
     / \   / \
    1   3 5   7

非法的 AVL 树（左子树高度 2，右子树高度 0，差 2 > 1）：
      1
        \
          2
            \
              3
```

只要这棵树始终满足"高度差 ≤ 1"，它的高度就被牢牢锁死在 **O(log n)** 范围内，查询永远是高效的。但代价是：**每次插入/删除都可能破坏平衡，需要通过旋转来修复**。这就是 AVL 树的核心思想。

## AVL 树的核心：平衡因子 + 旋转

### 平衡因子（Balance Factor）

定义：**节点 N 的平衡因子 = 左子树高度 − 右子树高度**。

```text
        30 (bf = 1 - 1 = 0)  ← 完美平衡
       /  \
   10(bf=-1) 40(bf=0)
       \
        20(bf=0)
```

AVL 树要求每个节点的平衡因子 ∈ {-1, 0, 1}。一旦插入或删除后某个节点的平衡因子变成 `±2` 或更离谱，就说明树失衡了，必须通过**旋转**修复。

### 四种旋转场景

失衡只有 4 种，处理套路是固定的——背下来就完事：

| 失衡类型 | 失衡形状 | 修复方法 |
|---------|---------|---------|
| **LL 型**（左左） | 新节点插在左子树的左子树上 | 一次**右旋** |
| **RR 型**（右右） | 新节点插在右子树的右子树上 | 一次**左旋** |
| **LR 型**（左右） | 新节点插在左子树的右子树上 | **左旋 → 右旋**（先转左子树，再整体右旋） |
| **RL 型**（右左） | 新节点插在右子树的左子树上 | **右旋 → 左旋**（先转右子树，再整体左旋） |

看着抽象？咱们画图一个个来。

#### 1. LL 型：右旋

```text
失衡前：

       30 (bf = 2，左子树高)
       /
     20 (bf = 1)
     /
  5

    插入 1 之后，30 节点的 bf = 2（失衡）

右旋后：

     20 (bf = 0)
    /  \
   5   30
  /
 1
```

操作步骤：**让失衡节点的左孩子顶上来当新根，自己变成右孩子**。

```
右旋示意（最经典的那张图）：

        y                x
       / \              / \
      x   T3   --->    T1  y
     / \                  / \
    T1  T2               T2  T3
```

#### 2. RR 型：左旋

跟 LL 完全反过来：**让失衡节点的右孩子顶上来当新根，自己变成左孩子**。

```
        y                x
       / \              / \
      T1  x   --->     y   T3
         / \          / \
        T2  T3       T1  T2
```

#### 3. LR 型：先左旋子树，再右旋根

```text
失衡前：

       30 (bf = 2)
       /
     20 (bf = -1，右子树高)
       \
        25

第 1 步：对 30 的左子树（即 20 这棵）做左旋
第 2 步：对 30 做右旋

最终：

       25 (bf = 0)
      /  \
    20   30
```

#### 4. RL 型：先右旋子树，再左旋根

LR 的镜像版本，对称处理即可。

### 旋转操作的代码抽象

旋转的核心代码其实非常短，先剧透一下，别被后面的实现吓到：

```typescript
// 右旋：以 y 为根的子树，向右旋转后 x 上升为新根
function rotateRight(y: Node): Node {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  // 别忘了更新 height！
  updateHeight(y);
  updateHeight(x);
  return x;
}
```

看到没？核心逻辑就 3 行。剩下的都是边界处理和递归调用。**所有 4 种旋转的代码加起来不超过 20 行**。

## 删除操作：比插入更麻烦

插入只需要往一个方向走，找到失衡点旋转修复即可。但删除更麻烦——**删除一个节点后，可能有多处失衡**，需要一路向上修复直到根。

基本流程：

1. 找到要删除的节点（普通 BST 删除）
2. 删除后从被删除节点的父节点开始，**沿路径向上**逐个检查平衡
3. 发现失衡就旋转修复
4. 旋转后**继续向上**检查（因为旋转可能让祖先节点也失衡）

整个过程的复杂度仍然是 O(log n)，但实现细节比插入多不少。

## 代码实现

下面是一个**完整可运行**的 TypeScript AVL 树实现，包括插入、删除、查询、4 种旋转：

```typescript
/**
 * AVL 树 —— TypeScript 完整实现
 * 核心特性：任意节点左右子树高度差 ≤ 1
 * 所有操作的时间复杂度均为 O(log n)
 */
class AVLNode<T> {
  value: T;
  left: AVLNode<T> | null = null;
  right: AVLNode<T> | null = null;
  height: number = 1; // 叶子节点高度 = 1

  constructor(value: T) {
    this.value = value;
  }
}

class AVLTree<T> {
  root: AVLNode<T> | null = null;

  // ---------- 辅助函数 ----------

  /** 获取节点高度（null 节点高度为 0） */
  private height(node: AVLNode<T> | null): number {
    return node ? node.height : 0;
  }

  /** 更新节点高度（取左右子树最大高度 + 1） */
  private updateHeight(node: AVLNode<T>): void {
    node.height =
      1 + Math.max(this.height(node.left), this.height(node.right));
  }

  /** 计算平衡因子：左高 - 右高 */
  private balanceFactor(node: AVLNode<T>): number {
    return this.height(node.left) - this.height(node.right);
  }

  // ---------- 旋转操作（4 种） ----------

  /** 右旋：处理 LL 型失衡 */
  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!;
    const T2 = x.right;
    // 旋转
    x.right = y;
    y.left = T2;
    // 先更新 y，再更新 x（顺序很重要！）
    this.updateHeight(y);
    this.updateHeight(x);
    return x; // x 成为新的子树根
  }

  /** 左旋：处理 RR 型失衡 */
  private rotateLeft(y: AVLNode<T>): AVLNode<T> {
    const x = y.right!;
    const T2 = x.left;
    // 旋转
    x.left = y;
    y.right = T2;
    // 先更新 y，再更新 x
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  /** 统一的"再平衡"操作：检测失衡类型并旋转 */
  private rebalance(node: AVLNode<T>): AVLNode<T> {
    this.updateHeight(node);
    const bf = this.balanceFactor(node);

    // LL 型：左子树高 + 左子树的平衡因子 ≥ 0
    if (bf > 1 && this.balanceFactor(node.left!) >= 0) {
      return this.rotateRight(node);
    }
    // LR 型：左子树高 + 左子树的平衡因子 < 0
    if (bf > 1 && this.balanceFactor(node.left!) < 0) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }
    // RR 型：右子树高 + 右子树的平衡因子 ≤ 0
    if (bf < -1 && this.balanceFactor(node.right!) <= 0) {
      return this.rotateLeft(node);
    }
    // RL 型：右子树高 + 右子树的平衡因子 > 0
    if (bf < -1 && this.balanceFactor(node.right!) > 0) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }
    return node; // 已平衡，无需旋转
  }

  // ---------- 插入 ----------

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
    // 1. 普通 BST 插入
    if (!node) return new AVLNode(value);
    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    } else {
      return node; // 已存在，不重复插入
    }
    // 2. 沿路径向上检查平衡
    return this.rebalance(node);
  }

  // ---------- 删除 ----------

  remove(value: T): void {
    this.root = this.removeNode(this.root, value);
  }

  private removeNode(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (!node) return null;

    // 1. 普通 BST 删除
    if (value < node.value) {
      node.left = this.removeNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.removeNode(node.right, value);
    } else {
      // 找到目标节点
      if (!node.left || !node.right) {
        // 情况 1：只有一个孩子或没有孩子
        return node.left || node.right;
      } else {
        // 情况 2：有两个孩子，用右子树的最小值（或左子树最大值）替换
        const successor = this.findMin(node.right);
        node.value = successor.value;
        // 在右子树中删掉那个后继节点
        node.right = this.removeNode(node.right, successor.value);
      }
    }

    // 2. 沿路径向上检查平衡
    return this.rebalance(node);
  }

  /** 找子树中最小节点（最左下角的节点） */
  private findMin(node: AVLNode<T>): AVLNode<T> {
    while (node.left) node = node.left;
    return node;
  }

  // ---------- 查询 ----------

  /** 查找某个值是否存在 */
  contains(value: T): boolean {
    return this.findNode(this.root, value) !== null;
  }

  private findNode(
    node: AVLNode<T> | null,
    value: T,
  ): AVLNode<T> | null {
    if (!node) return null;
    if (value === node.value) return node;
    return value < node.value
      ? this.findNode(node.left, value)
      : this.findNode(node.right, value);
  }

  // ---------- 遍历 ----------

  /** 中序遍历：输出升序序列 */
  inOrder(): T[] {
    const result: T[] = [];
    this.inOrderTraverse(this.root, result);
    return result;
  }

  private inOrderTraverse(
    node: AVLNode<T> | null,
    result: T[],
  ): void {
    if (!node) return;
    this.inOrderTraverse(node.left, result);
    result.push(node.value);
    this.inOrderTraverse(node.right, result);
  }

  // ---------- 校验 ----------

  /**
   * 检查当前树是否还是合法的 AVL 树
   * 主要用于单元测试，验证插入/删除后的状态
   */
  isValidAVL(): boolean {
    return this.validate(this.root).isValid;
  }

  private validate(node: AVLNode<T> | null): {
    isValid: boolean;
    height: number;
  } {
    if (!node) return { isValid: true, height: 0 };
    const left = this.validate(node.left);
    const right = this.validate(node.right);
    const bf = left.height - right.height;
    const isBalanced = left.isValid && right.isValid && Math.abs(bf) <= 1;
    return {
      isValid: isBalanced,
      height: 1 + Math.max(left.height, right.height),
    };
  }
}

// ---------- 使用示例 + 测试 ----------
const tree = new AVLTree<number>();

// 顺序插入（普通 BST 会退化成链表）
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((v) => tree.insert(v));

console.log('中序遍历:', tree.inOrder()); // [1,2,3,4,5,6,7,8,9,10]
console.log('是否合法 AVL:', tree.isValidAVL()); // true
console.log('根节点:', tree.root?.value); // 4 或 5 附近
console.log('树高:', tree.root?.height); // 4（接近 log₂10 ≈ 3.3）

// 验证查找
console.log('包含 7:', tree.contains(7)); // true
console.log('包含 100:', tree.contains(100)); // false

// 删除几个值
tree.remove(4);
tree.remove(7);
console.log('删除后中序:', tree.inOrder()); // [1,2,3,5,6,8,9,10]
console.log('删除后是否合法:', tree.isValidAVL()); // true
```

上面这版代码我特意加了一个 `isValidAVL()` 方法，**强烈建议你写单元测试的时候跑一下**，确保每次操作后树还是合法的 AVL。很多人在面试手撕 AVL 的时候栽跟头，就是因为忽略了一些边界（比如删除时的多次旋转）。

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|----------|----------|
| 查询 | O(log n) | O(1) |
| 插入 | O(log n) | O(log n) 递归栈 |
| 删除 | O(log n) | O(log n) 递归栈 |
| 旋转 | O(1) | O(1) |

为什么是 O(log n)？因为 AVL 树的高度被锁死在 `log₂(n+1)` 以内，最坏情况（斐波那契树）高度也只比 log n 大 44% 左右，但仍然是 O(log n) 级别的。

> **小知识**：高度严格 ≤ ⌊log_φ(n)⌋，其中 φ = (1+√5)/2 ≈ 1.618（黄金比例）。

## AVL 树 vs 红黑树：怎么选？

这是面试最高频的对比题。我直接给你一张对比表：

| 维度 | AVL 树 | 红黑树 |
|------|--------|--------|
| 平衡标准 | 严格平衡，高度差 ≤ 1 | 近似平衡，最长路径 ≤ 2 倍最短路径 |
| 树高 | 较矮（约 1.44 × log₂n） | 较高（最多 2 × log₂n） |
| 查询性能 | **更快**（树更矮） | 稍慢 |
| 插入/删除 | 较慢（可能多次旋转） | **更快**（最多 3 次旋转） |
| 适用场景 | **查询密集**（数据库、静态索引） | **增删密集**（TreeMap、TreeSet、内核调度） |
| 实现难度 | 中等（4 种旋转） | 较高（5 条规则 + 多种情况） |

**工业界的选择**：Java 的 `TreeMap`、C++ STL 的 `map/set`、Linux 内核的 CFS 调度器、epoll 事件管理——**全部用的是红黑树**。因为大多数真实场景下，增删操作比查询更频繁，红黑树的"近似平衡 + 旋转少"更划算。

**AVL 树的优势场景**：

- 数据库中**只读或极少更新**的索引（数据仓库、OLAP）
- 内存数据库（如 H2、SQLite）
- 需要严格保证 O(log n) 最差查询延迟的实时系统

**一句话记忆**：**查询多选 AVL，增删多选红黑树**。这是面试的标准答案。

## 实际应用场景

虽然 AVL 树在通用库里被红黑树"打败"了，但在一些特定场景下它依然是首选：

### 1. 数据库索引

一些嵌入式数据库（SQLite、LMDB）和内存数据库用的是 AVL 树（或其变种），因为**索引一旦建好就很少改动**，AVL 的"严格平衡 → 查询更快"优势明显。

### 2. 字典树/有序字典

当你需要在一个**有序集合**上做大量"给定值查排名"、"给定排名查值"的场景（如排行榜），AVL 树能提供稳定的 O(log n) 查询。

### 3. 实时系统的内存池

实时系统对**最坏情况延迟**有严格要求（比如嵌入式设备的 1ms 中断响应）。红黑树虽然平均快，但最坏情况高度是 AVL 的 2 倍，AVL 更可控。

### 4. 函数式语言的不可变树

Scala 的 `TreeSet`、Haskell 的 `Data.Map` 等基于**不可变树**实现，每次操作都生成新树。它们一般采用 AVL 或类似的高度平衡策略，因为创建新树的开销比修改原地树低。

### 5. 面试手撕代码的常客

如果你面的是高级开发岗（SDE 2/3、资深开发），手撕一个完整的 AVL 树（包含插入、删除、4 种旋转）几乎是标配。红黑树通常只要求讲清原理，不会让你完整手写——**因为实在太容易写错了**。

## 面试常见考点

最后梳理一下 AVL 树在面试里被高频考察的点，准备跳槽的可以重点看：

**Q1：什么是平衡因子？AVL 树对平衡因子有什么要求？**

平衡因子 = 左子树高度 − 右子树高度。AVL 要求每个节点的平衡因子 ∈ {-1, 0, 1}。

**Q2：AVL 树有哪几种旋转？分别在什么场景下用？**

LL（一次右旋）、RR（一次左旋）、LR（先左后右）、RL（先右后左）。

**Q3：为什么删除比插入复杂？**

插入最多引起一次失衡，旋转一次就够；删除可能引起**多个祖先节点**连续失衡，需要一路向上修复。

**Q4：AVL 树和红黑树的本质区别是什么？**

AVL 是"**高度**平衡"（左右子树高度差 ≤ 1），红黑树是"**颜色**平衡"（5 条颜色约束保证最长路径不超过最短路径的 2 倍）。AVL 查询更快，红黑树增删更快。

**Q5：AVL 树的最坏情况高度是多少？**

当树是斐波那契树形态时达到最大，约 1.44 × log₂n。仍然是 O(log n) 级别。

**Q6：如果让你设计一个数据库索引，你会选 AVL 还是红黑树？**

取决于读写比例。**读多写少**选 AVL（查询快），**读写均衡**选红黑树（综合性能更好）。大多数 OLTP 场景选红黑树。

## 总结

AVL 树是平衡二叉搜索树的"祖师爷"，它通过"**每个节点左右子树高度差 ≤ 1**"这条硬约束，把树的高度牢牢锁在 O(log n) 范围内，避免了 BST 退化的问题。

核心要点回顾：

1. **平衡因子** 是判断失衡的关键：`|bf| > 1` 就需要旋转。
2. **4 种旋转** 是 AVL 树的精髓：LL/RR 各一次旋转，LR/RL 两次旋转。
3. **删除比插入麻烦**，需要沿路径向上逐个检查修复。
4. **vs 红黑树**：AVL 查询快但增删慢，红黑树反之；工业界通用库大多选红黑树，但特定场景（只读索引、实时系统）AVL 仍是首选。
5. **面试建议**：能完整手写 AVL（含插入、删除、4 种旋转）= 高级开发岗的入场券。光背红黑树不动手 AVL，关键时刻容易露怯。

下一期咱们聊**红黑树的删除操作**——这是公认的比插入更难的环节，5 条规则 + 6 种情况，相信我，啃下来你的 BBST 功底直接拉满 ✨。