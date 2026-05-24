---
title: 线段树
description: Segment Tree 详解：区间查询与区间修改，四语言实现
date: 2026-05-18 05:00:00
categories:
  - Algorithm
tags:
  - segment-tree
  - range-query
  - lazy-propagation
  - interview
sidebarSort: 31
---

# 线段树（Segment Tree）

前面的文章讲过前缀和和差分数组：

- 前缀和：O(1) 查询区间和，O(n) 区间修改
- 差分数组：O(1) 区间修改，O(n) 查询区间和

**如果你既要频繁查询区间和，又要频繁修改区间呢？** 两者都不够快。

这时候就需要**线段树**——一种可以在 **O(log n)** 时间内同时完成区间查询和区间修改的数据结构。它是竞赛和面试 Hard 题中的常客，也是理解更高级数据结构（如树状数组、平衡树）的基础。

## 原理拆解

### 什么是线段树？

线段树是一棵**二叉树**，每个节点代表一个**区间**。根节点代表整个数组 `[0, n-1]`，每个节点把区间一分为二，左孩子管左半区间，右孩子管右半区间，直到叶子节点代表单个元素。

```
数组：[1, 3, 5, 7, 9, 11]（n = 6）

线段树（存储区间和）：
                     [0,5] sum=36
                    /              \
              [0,2] sum=15      [3,5] sum=21
              /        \         /        \
        [0,1] sum=4  [2,2]  [3,4] sum=16  [5,5]
        /      \      5      /      \       11
   [0,0]   [1,1]       [3,3]   [4,4]
     1       3           7       9
```

### 核心操作

**1. 建树（Build）**：自底向上构建，O(n)

**2. 点更新（Update）**：修改单个元素，O(log n)

**3. 区间查询（Query）**：查询 `[L, R]` 的和/最大值/最小值，O(log n)

**4. 区间更新（Range Update）**：修改 `[L, R]` 区间所有元素，需要**懒标记（Lazy Propagation）**，O(log n)

### 区间查询过程

```
查询 [1, 4] 的和：

从根 [0,5] 开始：
  [0,5] 被 [1,4] 部分覆盖 → 递归左右
    左 [0,2]：
      被 [1,4] 部分覆盖 → 递归
        左 [0,1]：被 [1,4] 部分覆盖 → 递归
          左 [0,0]：不在 [1,4] 内 → 返回 0
          右 [1,1]：完全在 [1,4] 内 → 返回 3
        右 [2,2]：完全在 [1,4] 内 → 返回 5
    右 [3,5]：
      被 [1,4] 部分覆盖 → 递归
        左 [3,4]：完全在 [1,4] 内 → 返回 16
        右 [5,5]：不在 [1,4] 内 → 返回 0

结果 = 3 + 5 + 16 = 24
```

### 懒标记（Lazy Propagation）

当需要对区间 `[L, R]` 内的所有元素都加上一个值 `v` 时，如果逐个更新叶子节点就太慢了（O(n)）。

**懒标记的思想**：先"记下来"这个操作，等到真正需要用到子节点时再下推。

```
对 [1, 4] 所有元素加 2：

[0,5] 部分覆盖 → 递归
  [0,2] 部分覆盖 → 递归
    [0,1] 部分覆盖 → 递归
      [1,1] 完全覆盖 → 值 += 2，不往下走
    [2,2] 完全覆盖 → 值 += 2，打上懒标记
  [3,5] 部分覆盖 → 递归
    [3,4] 完全覆盖 → 值 += 2*2 = +4，打上懒标记
    [5,5] 不覆盖 → 跳过
```

**下推（Push Down）**：当需要访问一个带懒标记的节点的子节点时，先把懒标记传递给子节点，再清除自己的标记。

## 代码实现

### TypeScript

```typescript
/**
 * 线段树 —— TypeScript 实现
 * 支持区间求和 + 区间加法 + 懒标记
 */
class SegmentTree {
  private tree: number[];
  private lazy: number[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this.lazy = new Array(4 * this.n).fill(0);
    this.build(arr, 1, 0, this.n - 1);
  }

  /** 建树 */
  private build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }
    const mid = (start + end) >> 1;
    this.build(arr, 2 * node, start, mid);
    this.build(arr, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  /** 下推懒标记 */
  private pushDown(node: number, start: number, end: number): void {
    if (this.lazy[node] !== 0) {
      const mid = (start + end) >> 1;
      const leftLen = mid - start + 1;
      const rightLen = end - mid;

      // 传递给左孩子
      this.tree[2 * node] += this.lazy[node] * leftLen;
      this.lazy[2 * node] += this.lazy[node];

      // 传递给右孩子
      this.tree[2 * node + 1] += this.lazy[node] * rightLen;
      this.lazy[2 * node + 1] += this.lazy[node];

      this.lazy[node] = 0; // 清除当前节点的懒标记
    }
  }

  /** 区间加法：给 [l, r] 内的元素都加上 val */
  update(
    l: number,
    r: number,
    val: number,
    node = 1,
    start = 0,
    end = this.n - 1,
  ): void {
    if (l <= start && end <= r) {
      // 完全覆盖，直接更新 + 打懒标记
      this.tree[node] += val * (end - start + 1);
      this.lazy[node] += val;
      return;
    }
    this.pushDown(node, start, end); // 下推懒标记
    const mid = (start + end) >> 1;
    if (l <= mid) this.update(l, r, val, 2 * node, start, mid);
    if (r > mid) this.update(l, r, val, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1]; // 更新当前节点
  }

  /** 区间查询：求 [l, r] 的和 */
  query(l: number, r: number, node = 1, start = 0, end = this.n - 1): number {
    if (l <= start && end <= r) return this.tree[node]; // 完全覆盖
    this.pushDown(node, start, end);
    const mid = (start + end) >> 1;
    let sum = 0;
    if (l <= mid) sum += this.query(l, r, 2 * node, start, mid);
    if (r > mid) sum += this.query(l, r, 2 * node + 1, mid + 1, end);
    return sum;
  }
}

// 测试
const st = new SegmentTree([1, 3, 5, 7, 9, 11]);
console.log(st.query(1, 4)); // 3+5+7+9 = 24
st.update(1, 4, 2); // [1, 5, 7, 9, 11, 11]
console.log(st.query(1, 4)); // 5+7+9+11 = 32
console.log(st.query(0, 5)); // 1+5+7+9+11+11 = 44
```

### Go

```go
package segtree

// SegmentTree 线段树 —— Go 实现
type SegmentTree struct {
	tree []int
	lazy []int
	n    int
}

// NewSegmentTree 构建线段树
func NewSegmentTree(arr []int) *SegmentTree {
	n := len(arr)
	st := &SegmentTree{
		tree: make([]int, 4*n),
		lazy: make([]int, 4*n),
		n:    n,
	}
	st.build(arr, 1, 0, n-1)
	return st
}

func (st *SegmentTree) build(arr []int, node, start, end int) {
	if start == end {
		st.tree[node] = arr[start]
		return
	}
	mid := (start + end) / 2
	st.build(arr, 2*node, start, mid)
	st.build(arr, 2*node+1, mid+1, end)
	st.tree[node] = st.tree[2*node] + st.tree[2*node+1]
}

func (st *SegmentTree) pushDown(node, start, end int) {
	if st.lazy[node] != 0 {
		mid := (start + end) / 2
		left := 2 * node
		right := 2*node + 1

		st.tree[left] += st.lazy[node] * (mid - start + 1)
		st.lazy[left] += st.lazy[node]

		st.tree[right] += st.lazy[node] * (end - mid)
		st.lazy[right] += st.lazy[node]

		st.lazy[node] = 0
	}
}

// Update 区间加法
func (st *SegmentTree) Update(l, r, val int) {
	st.update(1, 0, st.n-1, l, r, val)
}

func (st *SegmentTree) update(node, start, end, l, r, val int) {
	if l <= start && end <= r {
		st.tree[node] += val * (end - start + 1)
		st.lazy[node] += val
		return
	}
	st.pushDown(node, start, end)
	mid := (start + end) / 2
	if l <= mid {
		st.update(2*node, start, mid, l, r, val)
	}
	if r > mid {
		st.update(2*node+1, mid+1, end, l, r, val)
	}
	st.tree[node] = st.tree[2*node] + st.tree[2*node+1]
}

// Query 区间求和
func (st *SegmentTree) Query(l, r int) int {
	return st.query(1, 0, st.n-1, l, r)
}

func (st *SegmentTree) query(node, start, end, l, r int) int {
	if l <= start && end <= r {
		return st.tree[node]
	}
	st.pushDown(node, start, end)
	mid := (start + end) / 2
	sum := 0
	if l <= mid {
		sum += st.query(2*node, start, mid, l, r)
	}
	if r > mid {
		sum += st.query(2*node+1, mid+1, end, l, r)
	}
	return sum
}
```

### Java

```java
/**
 * 线段树 —— Java 实现
 */
public class SegmentTree {
    private final int[] tree;
    private final int[] lazy;
    private final int n;

    public SegmentTree(int[] arr) {
        this.n = arr.length;
        this.tree = new int[4 * n];
        this.lazy = new int[4 * n];
        build(arr, 1, 0, n - 1);
    }

    private void build(int[] arr, int node, int start, int end) {
        if (start == end) { tree[node] = arr[start]; return; }
        int mid = (start + end) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    private void pushDown(int node, int start, int end) {
        if (lazy[node] != 0) {
            int mid = (start + end) / 2;
            tree[2 * node] += lazy[node] * (mid - start + 1);
            lazy[2 * node] += lazy[node];
            tree[2 * node + 1] += lazy[node] * (end - mid);
            lazy[2 * node + 1] += lazy[node];
            lazy[node] = 0;
        }
    }

    public void update(int l, int r, int val) {
        update(1, 0, n - 1, l, r, val);
    }

    private void update(int node, int start, int end, int l, int r, int val) {
        if (l <= start && end <= r) {
            tree[node] += val * (end - start + 1);
            lazy[node] += val;
            return;
        }
        pushDown(node, start, end);
        int mid = (start + end) / 2;
        if (l <= mid) update(2 * node, start, mid, l, r, val);
        if (r > mid) update(2 * node + 1, mid + 1, end, l, r, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    public int query(int l, int r) {
        return query(1, 0, n - 1, l, r);
    }

    private int query(int node, int start, int end, int l, int r) {
        if (l <= start && end <= r) return tree[node];
        pushDown(node, start, end);
        int mid = (start + end) / 2, sum = 0;
        if (l <= mid) sum += query(2 * node, start, mid, l, r);
        if (r > mid) sum += query(2 * node + 1, mid + 1, end, l, r);
        return sum;
    }
}
```

### Python

```python
"""线段树 —— Python 实现"""

class SegmentTree:
    def __init__(self, arr: list[int]):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        self._build(arr, 1, 0, self.n - 1)

    def _build(self, arr, node, start, end):
        if start == end:
            self.tree[node] = arr[start]
            return
        mid = (start + end) // 2
        self._build(arr, 2 * node, start, mid)
        self._build(arr, 2 * node + 1, mid + 1, end)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def _push_down(self, node, start, end):
        if self.lazy[node]:
            mid = (start + end) // 2
            left, right = 2 * node, 2 * node + 1

            self.tree[left] += self.lazy[node] * (mid - start + 1)
            self.lazy[left] += self.lazy[node]

            self.tree[right] += self.lazy[node] * (end - mid)
            self.lazy[right] += self.lazy[node]

            self.lazy[node] = 0

    def update(self, l: int, r: int, val: int, node=1, start=None, end=None):
        if start is None:
            start, end = 0, self.n - 1
        if l <= start and end <= r:
            self.tree[node] += val * (end - start + 1)
            self.lazy[node] += val
            return
        self._push_down(node, start, end)
        mid = (start + end) // 2
        if l <= mid:
            self.update(l, r, val, 2 * node, start, mid)
        if r > mid:
            self.update(l, r, val, 2 * node + 1, mid + 1, end)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, l: int, r: int, node=1, start=None, end=None) -> int:
        if start is None:
            start, end = 0, self.n - 1
        if l <= start and end <= r:
            return self.tree[node]
        self._push_down(node, start, end)
        mid = (start + end) // 2
        s = 0
        if l <= mid:
            s += self.query(l, r, 2 * node, start, mid)
        if r > mid:
            s += self.query(l, r, 2 * node + 1, mid + 1, end)
        return s


# 测试
st = SegmentTree([1, 3, 5, 7, 9, 11])
print(st.query(1, 4))   # 24
st.update(1, 4, 2)
print(st.query(1, 4))   # 32
print(st.query(0, 5))   # 44
```

## 面试题精选

| 题号 | 题目                     | 线段树应用               | 难度 |
| ---- | ------------------------ | ------------------------ | ---- |
| 307  | 区域和检索 - 可修改      | 点更新 + 区间查询        | 中等 |
| 303  | 区域和检索（不可修改）   | 前缀和更简单，线段树也行 | 简单 |
| 729  | 我的日程安排表 I         | 区间覆盖判断             | 中等 |
| 731  | 我的日程安排表 II        | 区间覆盖计数             | 中等 |
| 732  | 我的日程安排表 III       | 区间最大值               | 困难 |
| 218  | 天际线问题               | 线段树 / 扫描线          | 困难 |
| 699  | 掉落的方块               | 区间最大值 + 区间更新    | 困难 |
| 1157 | 子数组中占绝大多数的元素 | 线段树 + 随机化          | 困难 |

## 线段树 vs 树状数组

| 特性   | 线段树                     | 树状数组（BIT）                     |
| ------ | -------------------------- | ----------------------------------- |
| 功能   | 区间查询 + 区间修改        | 前缀查询 + 点修改（区间修改需变体） |
| 时间   | O(log n)                   | O(log n)                            |
| 空间   | O(4n)                      | O(n)                                |
| 代码量 | 较多（约 50 行）           | 极少（约 10 行）                    |
| 常数   | 较大                       | 极小（实际更快）                    |
| 适用   | 通用（最值、求和、覆盖等） | 求和类问题                          |

**选择原则**：能用树状数组的就不用线段树（代码短、常数小）。需要区间修改或求最值时，用线段树。

## 业务场景

### 1. 数据库索引

数据库中的区间查询和统计可以用线段树优化。比如"统计某个时间段内每个 IP 的请求数"，线段树可以快速回答任意时间区间的聚合查询。CockroachDB 和 TiDB 等分布式数据库内部使用类似的区间树结构。

### 2. 2D/3D 游戏碰撞检测

在 2D 游戏中，线段树可以维护一条轴上的区间信息，用于快速检测碰撞。比如判断某个 X 坐标范围内有没有障碍物。三维空间中的 BSP 树（Binary Space Partitioning）就是线段树的高维扩展。

### 3. 资源调度

云计算平台的资源调度需要回答"某个时间段内还有多少可用 CPU/内存"。线段树维护时间轴上的资源占用，区间查询 O(log n) 就能回答"未来 2 小时内最少有多少空闲资源"。

### 4. 金融实时风控

实时交易系统需要在滑动时间窗口内统计交易总额、最大单笔金额等指标。线段树可以在 O(log n) 内完成"过去 N 分钟的交易总额"查询，同时支持新交易的实时插入。

### 5. 地图与 GIS

地图缩放时需要根据视口范围查询可见的 POI（兴趣点）。二维线段树（或四叉树）可以快速回答"某个经纬度矩形范围内有哪些地标"，比遍历所有 POI 快得多。

## 复杂度分析

| 操作     | 时间复杂度 | 空间复杂度 |
| -------- | ---------- | ---------- |
| 建树     | O(n)       | O(4n)      |
| 点更新   | O(log n)   | —          |
| 区间更新 | O(log n)   | —          |
| 区间查询 | O(log n)   | —          |
| 空间总量 | —          | O(n)       |

- **建树 O(n)**：叶子节点 n 个，内部节点 n-1 个，总共 2n-1 个节点
- **操作 O(log n)**：每次操作最多访问 4 个节点/层（实际约 2×log n 个节点）
- **空间 O(4n)**：数组实现时分配 4n 大小的数组（保证不会越界）

## 小结

线段树的核心就四件事：**建树、查询、更新、懒标记下推**。

面试中记住这些要点：

1. **节点编号**：根节点为 1，左孩子 `2*node`，右孩子 `2*node+1`
2. **区间开闭**：节点 `[start, end]`，中点 `mid = (start+end)/2`，左孩子 `[start, mid]`，右孩子 `[mid+1, end]`
3. **懒标记**：区间更新时打标记，访问子节点前先下推
4. **4n 空间**：数组实现分配 `4*n` 不会越界
5. **能用树状数组就不用线段树**：代码更短、常数更小

线段树口诀：**一分为二建二叉，区间查询 log n。懒标记记延迟推，修改查询都不迟** ✅
