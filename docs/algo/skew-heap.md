---
title: 斜堆（Skew Heap）
description: 斜堆（Skew Heap）—— 最简单的可并堆实现，无固定平衡规则
date: 2026-10-04 09:05:39
categories:
  - Algorithm
tags:
  - skew-heap
  - leftist-tree
  - mergeable-heap
  - priority-queue
sidebarSort: 96
---

# 斜堆（Skew Heap）

你维护了一个最小堆用来做 TopK。突然有一天，产品经理跑过来："我们要把两个数据源合并起来，**两个堆要能 O(log n) 地合并成一个堆**，而不是把一个堆的全部 n 个元素一个一个 pop 再 push 到另一个堆。"你愣了一下——普通二叉堆合并是 O(n) 的，因为合并后得重新建堆或者一个一个插。

这就是**可并堆（Mergeable Heap）** 的用武之地。能"高效合并"的堆不多，左偏树（Leftist Tree）是最经典的，但代码略复杂。今天我们聊它的简化版——**斜堆（Skew Heap）**，一种**无平衡规则、纯靠交换**就能保证摊还 O(log n) 合并的神奇数据结构 ✨。

## 为什么需要可并堆？

先看看普通堆在合并时的尴尬。假设你有两棵二叉堆（数组实现）：

```
堆 A: [1, 3, 5, 7, 9]   (大小 5)
堆 B: [2, 4, 6, 8, 10]  (大小 5)
```

想把它们合并成一个最小堆，最直接的做法——把 B 的 5 个元素一个一个 push 到 A，总共 O(m log n)，m=5、n=10，没问题。但如果是两个各 100 万的堆合并？这就是 O(m log n) = O(100 万 × log 1M) ≈ 2000 万次操作，慢得让人想哭。

**斜堆的合并是 O(log n) 摊还时间复杂度**，无论堆里有多少元素。这就是它的杀手锏。

## 原理拆解

### 斜堆的定义

斜堆是一种**二叉堆**（满足父子节点大小关系的树），但和标准二叉堆相比，它有两大特点：

1. **没有显式的平衡规则**：不像 AVL 树要算平衡因子，红黑树要维护颜色，斜堆啥都不维护
2. **靠合并时的"左右子树互换"** 保持"大致平衡"

听起来像是在耍流氓？没有平衡规则，怎么保证 O(log n)？答案是——**通过摊还分析**，单次合并可能慢，但连续操作的平均成本是 O(log n)。这就是斜堆的魔法。

### 一棵斜堆长什么样

```
          1 (根，最小)
        /   \
       4     2
      / \   / \
     7   5 6   3

这是一棵满足"父 ≤ 子"的最小堆，但树看起来"歪歪扭扭"
——左边可以很高、右边可以很矮，反过来也行
没有 AVL 那种"左右子树高度差 ≤ 1"的规则
```

**核心观察**：斜堆不强制平衡。但每次合并时会触发一次"左右子树互换"，让"重的那一边"换到轻的那边去。多次合并下来，树的形态会自然调整到接近平衡。

### 合并操作：核心中的核心

斜堆的代码量极少——核心逻辑就一个递归函数 `merge(h1, h2)`：

```typescript
function merge(h1, h2):
    if h1 == null: return h2
    if h2 == null: return h1
    // 保证 h1 是根较小的那个
    if h1.val > h2.val: swap(h1, h2)
    // 把 h1 的右子树和 h2 合并，结果作为 h1 的新右子树
    h1.right = merge(h1.right, h2)
    // 关键！合并完立刻交换左右子树
    swap(h1.left, h1.right)
    return h1
```

是不是简单到不可思议？就这两步：

1. **递归合并**：把根较小的那个堆的右子树，与另一个堆合并
2. **交换左右**：合并完立刻把左右子树互换

就这么简单的操作，居然能实现 O(log n) 摊还合并，凭什么？我们用图说话 👇

### 图解合并过程

假设要合并这两棵斜堆：

```
  斜堆 A:          斜堆 B:
      1                 2
     / \               / \
    4   3             6   5
   /                 /
  7                 9
```

**步骤 1**：比较根，1 < 2，所以保留 A 的根不动。问题变成：**把 A 的右子树 `[3]` 和 B 合并**。

```
A:    1                B:    2
     / \                    / \
    4   3 ⬅要合并          6   5
   /                       /
  7                       9
```

**步骤 2**：合并 `[3]` 和 B 的根 `2`。3 > 2，所以保留 B 的根。结果变成：**B 的右子树 `[5]` 要和 `[3]` 合并**。

```
当前节点: 1
左子树: [4]
右子树: 2 (因为 3 > 2，2 顶上来)
       / \
      ?   5
     (原来 B 的左子树)
     /
    6
   /
  9
```

**步骤 3**：合并 `[5]` 和 `[3]`。3 < 5，所以保留 3。结果：**5 的右子树（null）和 3 合并 → 直接返回 5**。然后交换 3 的左右子树。

```
当前节点: 1
左子树: 4
右子树: 2
       / \
      6   3 ← 合并完成，交换了左右
     /   / \
    9   ?   5 (5 是从 B 那边来的)
```

**步骤 4**：回到上一层，节点 2。合并完成后交换它的左右子树。

```
       1
      / \
     4   2  ← 交换了：原来的左 6 跑到右边去了
        / \
       3   6
      / \   \
     5   ?   9
```

看到了吗？**每次合并后都交换左右子树**。这就是斜堆保持"大致平衡"的关键——重的那一边（深度大的）被换到轻的那一边去，下次合并时大概率会走另一边。

### 插入和删除（基于合并）

斜堆本身没有 insert / delete 接口，所有操作都通过 merge 实现：

```typescript
function push(val):
    return merge(root, new Node(val))

function pop():  // 删除最小（根）
    min = root.val
    root = merge(root.left, root.right)
    return min
```

- **插入**：新元素建一个节点，跟原堆 merge 就行
- **删除堆顶**：把左右子树 merge 起来，作为新根

## 代码实现

### TypeScript

```typescript
/**
 * 斜堆（Skew Heap）—— TypeScript 实现
 *
 * 核心特性：
 * 1. 支持 O(log n) 摊还时间复杂度的合并
 * 2. 代码极简（核心 merge 不到 10 行）
 * 3. 没有显式的平衡规则，靠"合并后交换左右子树"自然平衡
 */
class SkewHeap<T> {
  public val: T;
  public left: SkewHeap<T> | null = null;
  public right: SkewHeap<T> | null = null;

  constructor(val: T) {
    this.val = val;
  }

  /**
   * 判断是否为最小堆的比较函数
   * 实际使用时换成自定义的 comparator
   */
  static cmp<T>(a: T, b: T): number {
    return a < b ? -1 : a > b ? 1 : 0;
  }
}

/**
 * 合并两个斜堆 —— 整个数据结构的核心
 * 为什么这么简洁：因为没有平衡规则要维护
 */
function merge<T>(
  h1: SkewHeap<T> | null,
  h2: SkewHeap<T> | null,
  cmp: (a: T, b: T) => number = SkewHeap.cmp,
): SkewHeap<T> | null {
  if (!h1) return h2;
  if (!h2) return h1;

  // 确保 h1 是堆顶更小的那个
  if (cmp(h1.val, h2.val) > 0) {
    [h1, h2] = [h2, h1];
  }

  // 关键两步：递归合并右子树，然后交换左右
  // 为什么合并右子树：右子树通常更"小"，递归深度可控
  h1.right = merge(h1.right, h2, cmp);
  // 交换左右子树 —— 斜堆唯一的"平衡操作"
  [h1.left, h1.right] = [h1.right!, h1.left];

  return h1;
}

/**
 * SkewHeap 优先队列封装 —— 提供常规 push/pop 接口
 */
class SkewHeapPQ<T> {
  private root: SkewHeap<T> | null = null;
  private size = 0;

  constructor(private cmp: (a: T, b: T) => number = SkewHeap.cmp) {}

  /** 插入一个元素 —— O(log n) 摊还 */
  push(val: T): void {
    this.root = merge(this.root, new SkewHeap(val), this.cmp);
    this.size++;
  }

  /** 弹出堆顶（最小值） —— O(log n) 摊还 */
  pop(): T | undefined {
    if (!this.root) return undefined;
    const min = this.root.val;
    this.root = merge(this.root.left, this.root.right, this.cmp);
    this.size--;
    return min;
  }

  /** 查看堆顶 —— O(1) */
  peek(): T | undefined {
    return this.root?.val;
  }

  /** 堆大小 —— O(1) */
  getSize(): number {
    return this.size;
  }

  /** 合并另一个堆进来 —— O(log n) 摊还，这就是斜堆的杀手锏 */
  mergeWith(other: SkewHeapPQ<T>): void {
    this.root = merge(this.root, other.root, this.cmp);
    this.size += other.size;
    other.root = null;
    other.size = 0;
  }
}

// 使用示例
const pq = new SkewHeapPQ<number>();
[3, 1, 4, 1, 5, 9, 2, 6].forEach((n) => pq.push(n));

while (pq.peek() !== undefined) {
  console.log(pq.pop()); // 1, 1, 2, 3, 4, 5, 6, 9
}

// 杀手锏演示：两个堆合并
const pq1 = new SkewHeapPQ<number>();
const pq2 = new SkewHeapPQ<number>();
[5, 3, 8].forEach((n) => pq1.push(n));
[2, 7, 1, 4].forEach((n) => pq2.push(n));

pq1.mergeWith(pq2); // 一行搞定合并！
// 之后从 pq1 里 pop 就是 1, 2, 3, 4, 5, 7, 8
```

### Go

```go
package skewheap

import "container/heap"

// SkewHeap 斜堆节点
type SkewHeap struct {
	Val   int
	Left  *SkewHeap
	Right *SkewHeap
}

// NewSkewHeap 创建一个节点
func NewSkewHeap(val int) *SkewHeap {
	return &SkewHeap{Val: val}
}

// Merge 合并两个斜堆，返回合并后的根
// 核心逻辑就两行：递归合并右子树 + 交换左右子树
func Merge(h1, h2 *SkewHeap) *SkewHeap {
	if h1 == nil {
		return h2
	}
	if h2 == nil {
		return h1
	}

	// 保证 h1 是根较小的
	if h1.Val > h2.Val {
		h1, h2 = h2, h1
	}

	// 关键：合并 h1 的右子树和 h2
	h1.Right = Merge(h1.Right, h2)
	// 交换左右子树 —— 斜堆唯一的平衡操作
	h1.Left, h1.Right = h1.Right, h1.Left

	return h1
}

// Push 插入一个元素
func Push(root *SkewHeap, val int) *SkewHeap {
	return Merge(root, NewSkewHeap(val))
}

// Pop 删除堆顶（最小值），返回新的根和被删除的值
func Pop(root *SkewHeap) (*SkewHeap, int) {
	if root == nil {
		return nil, 0
	}
	min := root.Val
	newRoot := Merge(root.Left, root.Right)
	return newRoot, min
}

// SkewHeapPQ 斜堆优先队列封装
type SkewHeapPQ struct {
	root *SkewHeap
	size int
}

func NewSkewHeapPQ() *SkewHeapPQ {
	return &SkewHeapPQ{}
}

func (pq *SkewHeapPQ) Push(val int) {
	pq.root = Push(pq.root, val)
	pq.size++
}

func (pq *SkewHeapPQ) Pop() (int, bool) {
	if pq.root == nil {
		return 0, false
	}
	var min int
	pq.root, min = Pop(pq.root)
	pq.size--
	return min, true
}

func (pq *SkewHeapPQ) Peek() (int, bool) {
	if pq.root == nil {
		return 0, false
	}
	return pq.root.Val, true
}

func (pq *SkewHeapPQ) Size() int {
	return pq.size
}

// MergeWith 合并另一个堆进来 —— O(log n) 摊还
func (pq *SkewHeapPQ) MergeWith(other *SkewHeapPQ) {
	pq.root = Merge(pq.root, other.root)
	pq.size += other.size
	other.root = nil
	other.size = 0
}

// 演示：把斜堆用 Go 标准库的 heap.Interface 适配
type SkewHeapAdapter struct {
	root *SkewHeap
}

func (s *SkewHeapAdapter) Push(x any) {
	s.root = Push(s.root, x.(int))
}

func (s *SkewHeapAdapter) Pop() any {
	s.root, _ = Pop(s.root)
	// 注意：container/heap 要求 Push 后必须 Pop 配对
	// 实际使用时建议直接用 SkewHeapPQ
	return nil
}

func (s *SkewHeapAdapter) Len() int {
	// 实现略 —— 需要遍历计算
	return 0
}

func (s *SkewHeapAdapter) Less(i, j int) bool {
	return false
}

func (s *SkewHeapAdapter) Swap(i, j int) {}

// 编译器保活
var _ heap.Interface = (*SkewHeapAdapter)(nil)
```

### Java

```java
/**
 * 斜堆（Skew Heap）—— Java 实现
 *
 * 特点：合并 O(log n) 摊还，代码极简，无需维护平衡因子
 */
public class SkewHeap<T extends Comparable<T>> {
    public T val;
    public SkewHeap<T> left;
    public SkewHeap<T> right;

    public SkewHeap(T val) {
        this.val = val;
    }

    /**
     * 合并两个斜堆 —— 这是整个数据结构的核心
     * 为什么这么简洁：因为没有平衡规则要维护
     */
    public static <T extends Comparable<T>> SkewHeap<T> merge(
        SkewHeap<T> h1, SkewHeap<T> h2
    ) {
        if (h1 == null) return h2;
        if (h2 == null) return h1;

        // 保证 h1 的堆顶更小
        if (h1.val.compareTo(h2.val) > 0) {
            SkewHeap<T> tmp = h1;
            h1 = h2;
            h2 = tmp;
        }

        // 关键两步：递归合并右子树，然后交换左右子树
        h1.right = merge(h1.right, h2);

        SkewHeap<T> tmp = h1.left;
        h1.left = h1.right;
        h1.right = tmp;

        return h1;
    }
}

/**
 * 斜堆优先队列 —— 提供常规 push/pop/merge 接口
 */
class SkewHeapPQ<T extends Comparable<T>> {
    private SkewHeap<T> root;
    private int size;

    public SkewHeapPQ() {
        this.root = null;
        this.size = 0;
    }

    /** 插入 —— O(log n) 摊还 */
    public void push(T val) {
        root = SkewHeap.merge(root, new SkewHeap<>(val));
        size++;
    }

    /** 弹出堆顶 —— O(log n) 摊还 */
    public T pop() {
        if (root == null) throw new IllegalStateException("heap is empty");
        T min = root.val;
        root = SkewHeap.merge(root.left, root.right);
        size--;
        return min;
    }

    /** 查看堆顶 —— O(1) */
    public T peek() {
        if (root == null) throw new IllegalStateException("heap is empty");
        return root.val;
    }

    public int size() {
        return size;
    }

    /** 合并另一个堆 —— O(log n) 摊还（杀手锏） */
    public void mergeWith(SkewHeapPQ<T> other) {
        this.root = SkewHeap.merge(this.root, other.root);
        this.size += other.size;
        other.root = null;
        other.size = 0;
    }

    public static void main(String[] args) {
        // 基础用法
        SkewHeapPQ<Integer> pq = new SkewHeapPQ<>();
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6};
        for (int n : arr) pq.push(n);

        while (pq.size() > 0) {
            System.out.print(pq.pop() + " ");
        }
        // 输出：1 1 2 3 4 5 6 9

        System.out.println();

        // 杀手锏：合并两个堆
        SkewHeapPQ<Integer> pq1 = new SkewHeapPQ<>();
        SkewHeapPQ<Integer> pq2 = new SkewHeapPQ<>();
        for (int n : new int[]{5, 3, 8}) pq1.push(n);
        for (int n : new int[]{2, 7, 1, 4}) pq2.push(n);

        pq1.mergeWith(pq2);
        while (pq1.size() > 0) {
            System.out.print(pq1.pop() + " ");
        }
        // 输出：1 2 3 4 5 7 8
    }
}
```

### Python

```python
class SkewHeap:
    """斜堆节点

    核心特性：
    1. 合并 O(log n) 摊还 —— 整个可并堆家族的杀手锏
    2. 代码极简：核心 merge 就两行
    3. 无平衡规则，靠"合并后交换左右子树"自然平衡
    """

    __slots__ = ("val", "left", "right")

    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def merge(h1: SkewHeap | None, h2: SkewHeap | None) -> SkewHeap | None:
    """合并两个斜堆 —— 这是整个数据结构的灵魂

    为什么这么简洁？因为没有平衡规则要维护。
    核心就两件事：递归合并右子树 + 交换左右子树。
    """
    if h1 is None:
        return h2
    if h2 is None:
        return h1

    # 保证 h1 是堆顶更小的那个
    if h1.val > h2.val:
        h1, h2 = h2, h1

    # 关键两步：递归合并右子树，然后交换左右
    h1.right = merge(h1.right, h2)
    h1.left, h1.right = h1.right, h1.left

    return h1


class SkewHeapPQ:
    """斜堆优先队列 —— 提供常规 push/pop/merge 接口"""

    def __init__(self):
        self._root = None
        self._size = 0

    def push(self, val) -> None:
        """插入 —— O(log n) 摊还"""
        self._root = merge(self._root, SkewHeap(val))
        self._size += 1

    def pop(self):
        """弹出堆顶（最小值）—— O(log n) 摊还"""
        if self._root is None:
            raise IndexError("pop from empty heap")
        min_val = self._root.val
        self._root = merge(self._root.left, self._root.right)
        self._size -= 1
        return min_val

    def peek(self):
        """查看堆顶 —— O(1)"""
        if self._root is None:
            raise IndexError("peek from empty heap")
        return self._root.val

    def __len__(self) -> int:
        return self._size

    def merge_with(self, other: "SkewHeapPQ") -> None:
        """合并另一个堆进来 —— O(log n) 摊还（杀手锏）"""
        self._root = merge(self._root, other._root)
        self._size += other._size
        other._root = None
        other._size = 0


# 使用示例
if __name__ == "__main__":
    # 基础用法
    pq = SkewHeapPQ()
    for n in [3, 1, 4, 1, 5, 9, 2, 6]:
        pq.push(n)

    result = []
    while len(pq) > 0:
        result.append(pq.pop())
    print(result)  # [1, 1, 2, 3, 4, 5, 6, 9]

    # 杀手锏：合并两个堆
    pq1 = SkewHeapPQ()
    pq2 = SkewHeapPQ()
    for n in [5, 3, 8]:
        pq1.push(n)
    for n in [2, 7, 1, 4]:
        pq2.push(n)

    pq1.merge_with(pq2)  # 一行搞定！
    merged = []
    while len(pq1) > 0:
        merged.append(pq1.pop())
    print(merged)  # [1, 2, 3, 4, 5, 7, 8]
```

## 业务场景

### 1. 多路归并（外部排序）

经典用途之一。假设你有 100 个已经排好序的文件，每个 1GB，内存只能装下 100MB。想把它们合并成一个有序大文件，思路是：

```
每个文件读 1MB 进内存 → 100 个数字 → 找最小 → 输出 → 读下一个

但 100 个数字用普通二叉堆，合并 100 个堆就是 O(100 log n)，慢。

用斜堆：两两合并，最后一个堆就是答案，O(log n) 摊还。
```

实际工程里用的是 loser tree / tournament tree，但原理类似。

### 2. 动态 TopK 流

数据流场景：维护"最近 1 小时的 Top 100 商品"。常见做法是按时间分窗口，每个窗口一个最小堆（容量 100）。窗口滚动时：

- 老的窗口堆扔掉
- 新的窗口堆初始化
- **把所有"还活着的"窗口堆合并** → 问：要 TopK，斜堆合并 O(log n)！

相比每次合并都一个个 pop 再 push，斜堆直接 merge 就能搞定。

### 3. Dijkstra 算法的优化

Dijkstra 算法中需要维护一个"待访问"集合，集合要支持：

1. 提取最小距离的节点（pop）
2. 插入新的距离候选（push）
3. **可能需要合并**（比如多源 Dijkstra）

普通二叉堆合并是 O(n)，斜堆是 O(log n)。这就是为什么一些高性能图算法库（比如某些 OI 模板）会用斜堆。

### 4. 单源最短路的多源起点问题

```typescript
// 多源 Dijkstra：起点不止一个
const heaps: SkewHeapPQ<Edge>[] = sources.map(s => /* 每个源建一个堆 */);
// 合并所有起点堆
let merged = new SkewHeapPQ<Edge>();
heaps.forEach(h => merged.mergeWith(h));
// 然后正常跑 Dijkstra
```

对于 K 个起点，K 个堆合并只要 (K-1) 次 merge，每次 O(log n)，总共 O(K log n)。

## 复杂度分析

| 操作     | 时间复杂度（摊还）| 说明                              |
| -------- | ----------------- | --------------------------------- |
| merge    | O(log n)          | 核心操作，n 是合并后总节点数      |
| push     | O(log n)          | 新建节点 + merge                  |
| pop      | O(log n)          | merge 左右子树                    |
| peek     | O(1)              | 看根节点即可                      |

**为什么是摊还 O(log n) 而不是最坏 O(log n)？**

斜堆是**最坏情况可以很糟糕**的——单次合并可能退化成 O(n)（比如合并两个极端不平衡的堆）。但经过摊还分析，连续 M 次合并（M ≥ n）的总成本是 O(M log n)，平均下来每次就是 O(log n)。

用势能分析法的简要解释：

```
势能函数 Φ = 根节点到最重叶子路径上的节点数

合并 h1 和 h2 时：
  - 重的那条路径会被交换到另一侧
  - 每次交换，势能至少减 1
  - 总势能是 O(log n)，所以摊还时间 O(log n)
```

实际操作时，斜堆几乎不会真正退化到 O(n)，所以工程上直接用就行。

## 小结

斜堆是一个非常**优雅**的数据结构：

- ✅ **代码极简**：核心 merge 就 2 行，比左偏树 / 斐波那契堆简单得多
- ✅ **合并 O(log n) 摊还**：可并堆家族的核心需求
- ✅ **无需维护平衡因子 / 颜色 / 高度**：省心
- ✅ **单次插入 / 弹出也是 O(log n) 摊还**：跟普通二叉堆一个数量级
- ❌ **不保证严格平衡**：单次最坏情况可能退化
- ❌ **不支持 decrease-key**（除非额外维护指针）：堆顶调整经典操作
- ❌ **随机访问差**：做不到"删除第 K 个元素"这类操作

它跟兄弟们的对比：

| 数据结构           | 合并       | 插入       | 删除堆顶     | 代码量  |
| ------------------ | ---------- | ---------- | ----------- | ------ |
| 普通二叉堆（数组） | O(n)       | O(log n)   | O(log n)    | 简单   |
| **斜堆**           | **O(log n)** 摊还 | O(log n) 摊还 | O(log n) 摊还 | **极简** |
| 左偏树             | O(log n)   | O(log n)   | O(log n)    | 较复杂 |
| 斐波那契堆         | O(1) 摊还 | O(1) 摊还  | O(log n) 摊还 | 复杂   |

> 顺带提一句：左偏树（Leftist Tree）是斜堆的"父辈"——它显式维护 `s.dist`（左偏距离），合并时也是递归合并右子树然后交换左右，但每次要更新距离字段。如果你在面试中被问到"如何高效合并两个堆"，先答斜堆（简单），再补一句"工程上更常用左偏树，因为最坏情况有 O(log n) 保证"——基本就稳了 🎯。

下次遇到"两个堆要合并"的需求，别再傻乎乎地一个个 pop 再 push 了。斜堆 merge 一下，代码少一半，性能还快 ✨