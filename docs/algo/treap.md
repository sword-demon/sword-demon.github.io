---
title: Treap（树堆）
description: Treap——用随机优先级堆起来的平衡二叉搜索树，兼顾 BST 的有序性和堆的高效性
date: 2026-08-02 08:00:00
categories:
  - Algorithm
tags:
  - treap
  - balanced-tree
  - binary-search-tree
  - data-structure
  - interview
sidebarSort: 70
---

# Treap（树堆）

你有没有遇到过这种情况：写了一个二叉搜索树（BST），满怀信心地往里插数据，结果数据恰好是升序的——插入顺序是 `[1, 2, 3, 4, 5, 6, 7]`，然后你的"平衡二叉搜索树"就退化成了一个链表，查询从 O(log n) 退化到 O(n)，直接被打回原形。

这时候你就需要**平衡树**来救场了。AVL 太严格，红黑树太复杂，实现起来让人头秃。有没有一种平衡树，既简单好写，又能有效防止退化？

还真有——**Treap** 就是这么个"偷懒"但极其有效的方案。它把 BST 和 Heap 巧妙地结合在一起，用随机优先级做平衡，整个实现比 AVL/红黑树简单了不止一个量级 ✨

## 原理拆解

### 1. BST 的退化问题

先来看看 BST 为什么会退化：

```
按升序插入 [1, 2, 3, 4, 5]：

        1
         \
          2
           \
            3
             \
              4
               \
                5

高度 = n，查询/插入 = O(n)，完全退化！
```

根本原因是：**BST 的形状完全取决于插入顺序**。如果插入顺序是有序的，树就变成了一条链。

### 2. 平衡树的核心思想

平衡树的目的是：无论插入顺序是什么，树的高度都控制在 O(log n) 范围内。

常见的平衡树策略：

| 策略 | 代表 | 实现难度 | 特点 |
| ---- | ---- | -------- | ---- |
| 严格平衡（左右子树高度差 ≤ 1）| AVL 树 | ⭐⭐⭐⭐ | 查找最快，但插入/删除要旋转多次 |
| 近似平衡（黑高平衡）| 红黑树 | ⭐⭐⭐⭐⭐ | 效率稳定，但代码复杂到怀疑人生 |
| 随机化平衡 | **Treap** | ⭐⭐ | 用随机优先级代替复杂的旋转规则 |
| 替罪羊式平衡 | 替罪羊树 | ⭐⭐ | 发现不平衡就重构，简单粗暴 |

Treap 的精妙之处在于：**它不试图控制高度，而是用概率做保证**。随机生成的优先级天然就有 O(log n) 的期望高度。

### 3. Treap 的核心思想

Treap = **Tree** + **Heap**：

- **BST 性质**：左子树所有节点 < 根节点 < 右子树所有节点（以 key 计）
- **Heap 性质**：每个节点的优先级（priority）满足堆序，即父节点的 priority ≤ 子节点的 priority（以 min-heap 为例）

```
                    5 (key)
                   / \
                  3   8 (key)
                  
BST key:  3 < 5 < 8
Heap priority: priority(5) < priority(3) && priority(5) < priority(8)

为什么 priority(5) 最小在顶上？因为我们是 min-heap
```

每个节点有两个值：**key**（决定 BST 结构）和 **priority**（决定堆结构）。key 是你插入时给定的，priority 是随机生成的。

**关键洞察**：如果每个节点的 priority 都是独立随机生成的，那么整棵树的期望高度是 O(log n)。你不需要手动旋转来维持平衡——随机性会替你搞定一切。

### 4. 图解 Treap 的插入过程

Treap 插入新节点时，分两步走：

1. **按 BST 规则找到插入位置**
2. **如果新节点的 priority 比父节点小（违反了堆性质），就旋转**

```typescript
// 插入 key=4, priority=20（随机生成）

初始状态（min-heap 优先级，优先级小在上）：

        5 (pri=10)
       / \
    3(p=5) 8(p=15)
    
step1: 按 BST 规则，4 应该插在 3 的右子树
       
        5 (pri=10)
       / \
    3(p=5) 8(p=15)
         \
         [4] (pri=20) ← 新节点，pri=20 比父节点 pri=5 大，
                        BST ok，但 Heap 性质不满足（子节点比父节点大，在 min-heap 中这是错的）
                        但实际上 min-heap 要求父节点 ≤ 子节点，20 > 5 所以确实需要调整...

等等，这里我假设错了方向。让我重新梳理：

Treap 通常用 max-heap（根节点的 priority 最大）或 min-heap（根节点 priority 最小）都可以，
关键是要一致。假设用 max-heap：父节点 priority ≥ 子节点 priority。

重新看：

        5 (pri=10)
       / \
    3(p=5) 8(p=15)
    
插入 key=4, pri=20（新节点 pri 比父节点大，不符合 max-heap）
    
对新节点 4(pri=20) 和父节点 3(pri=5) 做判断：
- 4 > 3，所以 4 应该在 3 的位置，3 变成 4 的左子树
- 这需要一次右旋（zig）

旋转后：

        5 (pri=10)
       / \
    [4](pri=20) 8(p=15)   ← 4 上来了，成为 3 的父节点
      /
    3(p=5)                  ← 3 变成了 4 的左子树

现在检查堆性质：4(pri=20) vs 5(pri=10) → 20 > 10，4 应该在 5 的位置！
需要对 4(pri=20) 和 5(pri=10) 做判断，继续旋转...

对 4(pri=20) 和父节点 5(pri=10) 做判断：
- 4 > 5，所以 4 应该在 5 的位置，5 变成 4 的右子树
- 这需要一次左旋（zag）

旋转后：

      4 (pri=20)           ← 4 最终成为根节点！
     / \
  3(p=5)  5 (pri=10)
           \
           8(p=15)

BST 性质检查：3 < 4 < 5 < 8 ✓
Heap 性质检查：pri(4)=20 > pri(3)=5 ✓, pri(4)=20 > pri(5)=10 ✓ ✓
```

插入过程的核心：**新节点先按 BST 规则插入，然后一路"向上冒泡"（旋转），直到堆性质满足为止**。这个过程也叫 **"上浮"（bubble up）** 或 **"展开"（splay）**，但不同于 Splay Tree，Treap 的旋转只到堆性质满足为止，不需要查到根。

### 5. Treap 的删除操作

删除比插入稍微复杂一点，但思路类似：

1. 找到要删除的节点
2. 如果该节点只有一个子节点，直接用子节点替代
3. 如果该节点有两个子节点，需要把它"向下旋转"直到变成叶节点，然后删除

"向下旋转"的思路：比较两个子节点的 priority，priority 更大的那个（更满足堆性质）旋转上来，继续向下直到变成叶节点。

```typescript
// 删除 key=3 的节点

        5 (pri=10)
       / \
    3(p=5) 8(p=15)    ← 要删除 3(p=5)
      \
    4(p=20)           ← 3 只有右子树，直接删除，用 4 替代 3 的位置

结果：

        5 (pri=10)
       / \
    4(p=20) 8(p=15)    ← BST 性质：4 < 5 < 8 ✓
                        ← Heap 性质：pri(5)=10 < min(pri(4)=20, pri(8)=15)？不对，应该是 max-heap...
```

### 6. Treap 的变种：Search Tree vs Priority Queue

Treap 有两种等价的理解角度：

| 视角 | BST 属性 | Heap 属性 | 应用 |
| ---- | -------- | --------- | ---- |
| 搜索树视角 | key 有序 | priority 控制平衡 | 作为平衡 BST 使用 |
| 笛卡尔树 | key 有序 | priority 是单调栈构建的 | 区间最值、表达式树 |

标准 Treap（随机优先级）是最常见的面试和工程实现，本文重点讲这种。

## 代码实现

### TypeScript

```typescript
/**
 * Treap 实现 —— TypeScript
 *
 * 核心思想：
 * - 每个节点有 key（决定 BST 结构）和 priority（随机，决定平衡）
 * - BST 性质：左子树 < 根 < 右子树
 * - Heap 性质：父节点 priority ≥ 子节点 priority（max-heap）
 * - 插入：按 BST 插入，然后上浮到堆性质满足
 * - 删除：把节点旋转到叶节点，然后删除
 */

class TreapNode {
  key: number;
  priority: number;
  left: TreapNode | null;
  right: TreapNode | null;

  constructor(key: number) {
    this.key = key;
    this.priority = Math.random(); // 随机生成优先级
    this.left = null;
    this.right = null;
  }
}

class Treap {
  private root: TreapNode | null = null;

  // ========== 旋转操作 ==========

  /**
   * 右旋（zig）：当左子节点的 priority 比自己大时
   *
   *   x               y
   *  / \             / \
   * y   C   ===>    A   x
   * / \                 / \
   * A   B              B   C
   */
  private rotateRight(x: TreapNode): TreapNode {
    const y = x.left!;
    x.left = y.right;
    y.right = x;
    return y;
  }

  /**
   * 左旋（zag）：当右子节点的 priority 比自己大时
   *
   *   x               y
   *  / \             / \
   * A   y   ===>    x   C
   *     / \         / \
   *    B   C       A   B
   */
  private rotateLeft(x: TreapNode): TreapNode {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    return y;
  }

  // ========== 插入 ==========

  /**
   * 插入新节点
   * 1. 按 BST 规则找到插入位置
   * 2. 新节点优先级高（比父节点大），触发上浮旋转
   */
  insert(key: number): void {
    const newNode = new TreapNode(key);
    this.root = this._insert(this.root, newNode);
  }

  private _insert(root: TreapNode | null, node: TreapNode): TreapNode {
    if (root === null) {
      return node; // 找到插入位置
    }

    // BST 插入逻辑
    if (node.key < root.key) {
      root.left = this._insert(root.left, node);
      // BST 插入完成后，检查堆性质（左子节点 priority 大就要上浮）
      if (root.left.priority > root.priority) {
        root = this.rotateRight(root);
      }
    } else {
      root.right = this._insert(root.right, node);
      if (root.right.priority > root.priority) {
        root = this.rotateLeft(root);
      }
    }

    return root;
  }

  // ========== 删除 ==========

  /**
   * 删除节点
   * 思路：把目标节点旋转到叶节点位置，然后删除
   * 旋转方向：看左右子节点谁的 priority 大，大的那个转上来
   */
  delete(key: number): void {
    this.root = this._delete(this.root, key);
  }

  private _delete(root: TreapNode | null, key: number): TreapNode | null {
    if (root === null) {
      return null; // 没找到
    }

    if (key < root.key) {
      root.left = this._delete(root.left, key);
    } else if (key > root.key) {
      root.right = this._delete(root.right, key);
    } else {
      // 找到目标节点，开始旋转把它送到叶节点位置
      if (root.left === null && root.right === null) {
        return null; // 已经是叶节点，直接删除
      } else if (root.left === null) {
        root = this.rotateLeft(root);
        root.left = this._delete(root.left, key);
      } else if (root.right === null) {
        root = this.rotateRight(root);
        root.right = this._delete(root.right, key);
      } else {
        // 左右子节点都有，priority 大的转上来
        if (root.left.priority > root.right.priority) {
          root = this.rotateRight(root);
          root.right = this._delete(root.right, key);
        } else {
          root = this.rotateLeft(root);
          root.left = this._delete(root.left, key);
        }
      }
    }

    return root;
  }

  // ========== 搜索 ==========

  search(key: number): boolean {
    let current = this.root;
    while (current !== null) {
      if (key === current.key) return true;
      if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return false;
  }

  // ========== 中序遍历（验证 BST 性质） ==========

  inOrder(): number[] {
    const result: number[] = [];
    this._inOrder(this.root, result);
    return result;
  }

  private _inOrder(node: TreapNode | null, result: number[]): void {
    if (node === null) return;
    this._inOrder(node.left, result);
    result.push(node.key);
    this._inOrder(node.right, result);
  }

  // ========== 工具方法 ==========

  /** 获取树高（用于验证平衡性） */
  height(): number {
    return this._height(this.root);
  }

  private _height(node: TreapNode | null): number {
    if (node === null) return 0;
    return 1 + Math.max(this._height(node.left), this._height(node.right));
  }

  /** 可视化打印（调试用） */
  print(): void {
    this._print(this.root, "", true);
  }

  private _print(node: TreapNode | null, prefix: string, isLast: boolean): void {
    if (node === null) return;
    const connector = isLast ? "└── " : "├── ";
    console.log(`${prefix}${connector}${node.key} [pri=${node.priority.toFixed(4)}]`);
    const childPrefix = prefix + (isLast ? "    " : "│   ");
    this._print(node.left, childPrefix, node.right === null);
    this._print(node.right, childPrefix, true);
  }
}

// ==================== 使用示例 ====================

console.log("=== Treap 演示 ===\n");

const treap = new Treap();

// 按升序插入 5 个数字——如果是一般 BST，早就退化成链表了
// 但 Treap 用随机优先级保持平衡
[5, 3, 8, 1, 4].forEach((key) => {
  console.log(`插入 ${key}...`);
  treap.insert(key);
});

console.log("\n中序遍历（BST 性质：升序）:");
console.log(treap.inOrder()); // [1, 3, 4, 5, 8]

console.log("\n树结构:");
treap.print();

console.log("\n树高:", treap.height(), "(期望 ~log n =", Math.ceil(Math.log2(5)), ")");
console.log("完全平衡时树高:", Math.ceil(Math.log2(5 + 1)));

console.log("\n搜索 4:", treap.search(4) ? "✅ 找到了" : "❌ 没找到");
console.log("搜索 99:", treap.search(99) ? "✅ 找到了" : "❌ 没找到");

// 删除节点
console.log("\n删除 3...");
treap.delete(3);
console.log("中序遍历:", treap.inOrder());
console.log("树高:", treap.height());
```

### Python

```python
import random
from typing import Optional, Tuple


class TreapNode:
    """Treap 节点"""

    __slots__ = ("key", "priority", "left", "right")

    def __init__(self, key: int):
        self.key: int = key
        self.priority: float = random.random()  # 随机优先级
        self.left: Optional["TreapNode"] = None
        self.right: Optional["TreapNode"] = None


class Treap:
    """Treap（树堆）—— Python 实现

    结合 BST 的有序性和 Heap 的平衡性，
    通过随机优先级实现期望 O(log n) 的操作复杂度。

    BST 性质：左子树 < 根 < 右子树
    Heap 性质：父节点 priority ≥ 子节点 priority（max-heap）
    """

    def __init__(self):
        self.root: Optional[TreapNode] = None

    # ========== 旋转操作 ==========

    def _rotate_right(self, x: TreapNode) -> TreapNode:
        """右旋"""
        y = x.left
        x.left = y.right
        y.right = x
        return y

    def _rotate_left(self, x: TreapNode) -> TreapNode:
        """左旋"""
        y = x.right
        x.right = y.left
        y.left = x
        return y

    # ========== 插入操作 ==========

    def insert(self, key: int) -> None:
        """插入新节点"""
        new_node = TreapNode(key)
        self.root = self._insert(self.root, new_node)

    def _insert(self, root: Optional[TreapNode], node: TreapNode) -> TreapNode:
        if root is None:
            return node

        # BST 插入
        if node.key < root.key:
            root.left = self._insert(root.left, node)
            # 检查是否需要上浮（右旋）
            if root.left.priority > root.priority:
                root = self._rotate_right(root)
        else:
            root.right = self._insert(root.right, node)
            if root.right.priority > root.priority:
                root = self._rotate_left(root)

        return root

    # ========== 删除操作 ==========

    def delete(self, key: int) -> None:
        """删除节点"""
        self.root = self._delete(self.root, key)

    def _delete(self, root: Optional[TreapNode], key: int) -> Optional[TreapNode]:
        if root is None:
            return None

        if key < root.key:
            root.left = self._delete(root.left, key)
        elif key > root.key:
            root.right = self._delete(root.right, key)
        else:
            # 找到目标节点
            if root.left is None and root.right is None:
                return None  # 叶节点，直接删除
            elif root.left is None:
                root = self._rotate_left(root)
                root.left = self._delete(root.left, key)
            elif root.right is None:
                root = self._rotate_right(root)
                root.right = self._delete(root.right, key)
            else:
                # 两个子节点都有，priority 大的转上来
                if root.left.priority > root.right.priority:
                    root = self._rotate_right(root)
                    root.right = self._delete(root.right, key)
                else:
                    root = self._rotate_left(root)
                    root.left = self._delete(root.left, key)

        return root

    # ========== 搜索 ==========

    def search(self, key: int) -> bool:
        """搜索节点"""
        current = self.root
        while current is not None:
            if key == current.key:
                return True
            elif key < current.key:
                current = current.left
            else:
                current = current.right
        return False

    # ========== 遍历 ==========

    def inorder(self) -> list[int]:
        """中序遍历（验证 BST 性质）"""
        result = []
        self._inorder(self.root, result)
        return result

    def _inorder(self, node: Optional[TreapNode], result: list[int]) -> None:
        if node is None:
            return
        self._inorder(node.left, result)
        result.append(node.key)
        self._inorder(node.right, result)

    # ========== 辅助方法 ==========

    def height(self) -> int:
        """获取树高"""
        return self._height(self.root)

    def _height(self, node: Optional[TreapNode]) -> int:
        if node is None:
            return 0
        return 1 + max(self._height(node.left), self._height(node.right))

    def __str__(self) -> str:
        """打印树结构"""
        lines = []
        self._build_string(self.root, "", True, lines)
        return "\n".join(lines)

    def _build_string(
        self, node: Optional[TreapNode], prefix: str, is_last: bool, lines: list[str]
    ) -> None:
        if node is None:
            return
        connector = "└── " if is_last else "├── "
        lines.append(f"{prefix}{connector}{node.key} [pri={node.priority:.4f}]")
        child_prefix = prefix + ("    " if is_last else "│   ")
        left_is_last = node.right is None
        right_is_last = True
        self._build_string(node.left, child_prefix, left_is_last, lines)
        self._build_string(node.right, child_prefix, right_is_last, lines)


# ==================== 使用示例 ====================
if __name__ == "__main__":
    treap = Treap()

    # 模拟升序插入（最容易让 BST 退化的场景）
    print("=== Treap 演示 ===\n")
    print("按升序插入 [5, 3, 8, 1, 4]...")
    for key in [5, 3, 8, 1, 4]:
        treap.insert(key)

    print("\n中序遍历（BST 性质验证）:")
    print(treap.inorder())  # [1, 3, 4, 5, 8]

    print("\n树结构:")
    print(treap)

    print(f"树高: {treap.height()} (期望 ~log n = {int(Math.ceil(Math.log2(5))))}")

    print(f"\n搜索 4: {'✅ 找到了' if treap.search(4) else '❌ 没找到'}")
    print(f"搜索 99: {'✅ 找到了' if treap.search(99) else '❌ 没找到'}")

    print("\n删除 3...")
    treap.delete(3)
    print("中序遍历:", treap.inorder())
    print("树高:", treap.height())

    # 性能验证：插入大量数据
    print("\n=== 性能测试 ===")
    large_treap = Treap()
    import time

    start = time.time()
    for i in range(10000):
        large_treap.insert(i)
    elapsed = time.time() - start
    print(f"插入 10000 个元素耗时: {elapsed:.3f}s")
    print(f"树高: {large_treap.height()} (完全平衡时 log₂(10000) ≈ 14)")

    # 升序插入 BST 对比
    start = time.time()
    for i in range(10000):
        large_treap.insert(i + 10000)  # 继续插入更大值
    elapsed = time.time() - start
    print(f"继续升序插入 10000 个元素耗时: {elapsed:.3f}s")
    print(f"最终树高: {large_treap.height()}")
```

### Go

```go
package treap

import (
	"fmt"
	"math/rand"
)

// TreapNode 节点
type TreapNode struct {
	Key      int
	Priority float64
	Left     *TreapNode
	Right    *TreapNode
}

// Treap 树堆
type Treap struct {
	root *TreapNode
}

// NewTreap 创建 Treap 实例
func NewTreap() *Treap {
	return &Treap{}
}

// rotateRight 右旋
//
//	  x            y
//	 / \    =>    / \
//	y   C        A   x
//   / \            / \
//  A   B          B   C
func rotateRight(x *TreapNode) *TreapNode {
	y := x.Left
	x.Left = y.Right
	y.Right = x
	return y
}

// rotateLeft 左旋
//
//	  x            y
//	 / \    =>    / \
//	A   y        x   C
//	   / \      / \
//	  B   C    A   B
func rotateLeft(x *TreapNode) *TreapNode {
	y := x.Right
	x.Right = y.Left
	y.Left = x
	return y
}

// insert 插入节点
func (t *Treap) Insert(key int) {
	node := &TreapNode{
		Key:      key,
		Priority: rand.Float64(),
	}
	t.root = t.insert(t.root, node)
}

func (t *Treap) insert(root, node *TreapNode) *TreapNode {
	if root == nil {
		return node
	}

	// BST 插入
	if node.Key < root.Key {
		root.Left = t.insert(root.Left, node)
		// 堆性质检查：左子节点 priority 大就右旋上浮
		if root.Left.Priority > root.Priority {
			root = rotateRight(root)
		}
	} else {
		root.Right = t.insert(root.Right, node)
		if root.Right.Priority > root.Priority {
			root = rotateLeft(root)
		}
	}

	return root
}

// search 搜索节点
func (t *Treap) Search(key int) bool {
	curr := t.root
	for curr != nil {
		if key == curr.Key {
			return true
		} else if key < curr.Key {
			curr = curr.Left
		} else {
			curr = curr.Right
		}
	}
	return false
}

// delete 删除节点
func (t *Treap) Delete(key int) {
	t.root = t.delete(t.root, key)
}

func (t *Treap) delete(root *TreapNode, key int) *TreapNode {
	if root == nil {
		return nil
	}

	if key < root.Key {
		root.Left = t.delete(root.Left, key)
	} else if key > root.Key {
		root.Right = t.delete(root.Right, key)
	} else {
		// 找到目标节点
		if root.Left == nil && root.Right == nil {
			return nil // 叶节点直接删除
		} else if root.Left == nil {
			root = rotateLeft(root)
			root.Left = t.delete(root.Left, key)
		} else if root.Right == nil {
			root = rotateRight(root)
			root.Right = t.delete(root.Right, key)
		} else {
			// 两个子节点都有，priority 大的转上来
			if root.Left.Priority > root.Right.Priority {
				root = rotateRight(root)
				root.Right = t.delete(root.Right, key)
			} else {
				root = rotateLeft(root)
				root.Left = t.delete(root.Left, key)
			}
		}
	}

	return root
}

// inOrder 中序遍历
func (t *Treap) InOrder() []int {
	var result []int
	t.inOrder(t.root, &result)
	return result
}

func (t *Treap) inOrder(node *TreapNode, result *[]int) {
	if node == nil {
		return
	}
	t.inOrder(node.Left, result)
	*result = append(*result, node.Key)
	t.inOrder(node.Right, result)
}

// height 树高
func (t *Treap) Height() int {
	return t.height(t.root)
}

func (t *Treap) height(node *TreapNode) int {
	if node == nil {
		return 0
	}
	leftH := t.height(node.Left)
	rightH := t.height(node.Right)
	if leftH > rightH {
		return leftH + 1
	}
	return rightH + 1
}

// Print 打印树结构
func (t *Treap) Print() {
	t.print(t.root, "", true)
}

func (t *Treap) print(node *TreapNode, prefix string, isLast bool) {
	if node == nil {
		return
	}
	connector := "└── "
	if !isLast {
		connector = "├── "
	}
	fmt.Printf("%s%s%d [pri=%.4f]\n", prefix, connector, node.Key, node.Priority)
	childPrefix := prefix
	if isLast {
		childPrefix += "    "
	} else {
		childPrefix += "│   "
	}
	t.print(node.Left, childPrefix, node.Right == nil)
	t.print(node.Right, childPrefix, true)
}

// 使用示例
func Example() {
	treap := NewTreap()

	fmt.Println("插入 [5, 3, 8, 1, 4]...")
	for _, key := range []int{5, 3, 8, 1, 4} {
		treap.Insert(key)
	}

	fmt.Println("\n中序遍历:")
	fmt.Println(treap.InOrder())

	fmt.Println("\n树结构:")
	treap.Print()

	fmt.Printf("\n树高: %d\n", treap.Height())

	fmt.Printf("搜索 4: %v\n", treap.Search(4))
	fmt.Printf("搜索 99: %v\n", treap.Search(99))

	fmt.Println("\n删除 3...")
	treap.Delete(3)
	fmt.Println("中序遍历:", treap.InOrder())
}
```

## Treap vs 其他平衡树

### 对比表

| 特性 | Treap | AVL | 红黑树 |
| ---- | ----- | --- | ------ |
| 实现难度 | ⭐ 低 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 查找复杂度 | O(log n) | O(log n) | O(log n) |
| 插入复杂度 | O(log n) 期望 | O(log n) | O(log n) |
| 删除复杂度 | O(log n) 期望 | O(log n) | O(log n) |
| 树高（期望/最坏） | O(log n) 期望 | O(log n) 最坏 | O(log n) 最坏 |
| 旋转次数 | 最多 O(log n) | 最多 O(log n) | 最多 O(log n) |
| 工业应用 | 教学/小规模数据 | 数据库索引 | C++ std::map, Java TreeMap |

### Treap 的优势

1. **实现简单**：代码量只有红黑树的 1/3 到 1/5，面试时白板实现完全不虚
2. **随机平衡**：不需要复杂的高度维护逻辑，随机优先级天然防退化
3. **可持久化**（纯函数式版本）：因为没有"破坏性"的更新，所有操作都可以返回新根指针，旧版本完全保留 —— 这是其他平衡树做不到的

### Treap 的劣势

1. **最坏情况 O(n)**：虽然概率极低（2^-log n），但理论上确实存在（随机数恰好生成了一条链）
2. **不适合强实时系统**：如果系统要求严格的最坏情况 O(log n)，不能用 Treap
3. **单条写入链风险**：如果攻击者能控制插入顺序，可以构造一条 worst-case path（但需要 O(n²) 插入，成本太高）

## 业务场景

### 1. Redis Sorted Set 的底层实现（类似跳表）

Redis 的 ZSET（有序集合）可以用跳表或 Treap 实现（Redis 6.0 用跳表，但历史上 Treap 也是可选方案）。它的应用场景包括：

- **排行榜**：用户积分作为 score，ZSET 自动按分数排序
- **延时队列**：任务到期时间作为 score，取出最早要执行的任务
- **IP 黑名单按时间过期**：过期时间作为 score，自动清理过期 IP

### 2. 实时排行榜系统

游戏/直播的礼物排行榜、用户积分榜，用 Treap 或其变种（带分裂/合并操作的多关键字 Treap）可以在 O(log n) 内完成：

- 用户积分变化：删除旧分数节点，插入新分数节点
- 查询 Top K：利用中序遍历的有序性
- 查询用户排名：中序遍历计数

### 3. 替代红黑树的简单方案

如果你的系统需要有序映射，但又不想要红黑树那套复杂实现（比如游戏服务器、简单缓存），Treap 是很好的替代品。C++ 里可以用 `std::map`（红黑树），也可以自己手写一个 Treap。

### 4. 表达式求值与笛卡尔树

Treap 还有一个近亲叫**笛卡尔树（Cartesian Tree）**，它用单调栈而不是随机数来构造：

```
数组: [3, 1, 4, 1, 5, 9, 2, 6]

笛卡尔树（BST key = 数组索引，Heap priority = 数组值）：

            5(9)          ← 堆性质：父节点值 ≥ 子节点值
           / \
         2(1) 6(6)        ← BST 性质：左子树索引 < 根 < 右子树索引
         /
      1(3)                ← value 3 < 9，在左子树
```

笛卡尔树在 **RMQ（区间最值查询）** 和 **线段树的替代** 中有应用。

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 | 说明 |
| ---- | ---------- | ---------- | ---- |
| 插入 | O(log n) 期望 | O(1) | 旋转路径期望 O(log n) |
| 删除 | O(log n) 期望 | O(1) | 旋转到叶节点路径期望 O(log n) |
| 搜索 | O(log n) 期望 | O(1) | BST 搜索路径期望 O(log n) |
| 遍历 | O(n) | O(1) | 必须访问所有节点 |
| 最值 | O(log n) 期望 | O(1) | 最左/最右路径 |

- **Treap 的时间复杂度是"期望"O(log n)**，不是保证 O(log n)。但随机优先级的分布保证了在实践中，极端退化几乎不可能发生。
- **空间复杂度 O(n)**：每个节点 O(1) 存储，n 个节点总共 O(n)。

## 小结

Treap 是一个"小而美"的数据结构，它的成功在于**用随机性换简单性**：

```
AVL 树：  "我要严格控制高度，所以每次插入最多旋转 2 次"
红黑树：  "我要近似平衡，所以每次插入最多旋转 3 次，还要记 5 条规则"
Treap：   "我不想搞那么多规则，我随便给个优先级，数学保证 O(log n)"
```

面试时，Treap 是展示你对平衡树理解的好题目——它既体现了 BST 的基本功，又展示了你对"随机化算法"的理解，比背红黑树的 5 种情况高明多了 😎

记住核心口诀：**Treap = BST + Heap，随机优先级来平衡，旋转上浮要记清**。

> 还想挑战自我？可以试试 **可持久化 Treap**（函数式版本），或者实现一个 **支持分裂/合并的 Treap**（用于区间操作）——这些都是面试加分项 🚀
