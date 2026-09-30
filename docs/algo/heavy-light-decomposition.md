---
title: 树链剖分（Heavy-Light Decomposition）
description: 树链剖分（Heavy-Light Decomposition, HLD）详解：用「重链 + DFS 序 + 线段树」把树上路径操作降到 O(log²n)，附 TypeScript/Go/Python 三语言实现
date: 2026-09-30 09:01:36
categories:
  - Algorithm
tags:
  - tree
  - segment-tree
  - heavy-light-decomposition
  - lca
  - interview
sidebarSort: 92
---

# 树链剖分（Heavy-Light Decomposition）

你有没有遇到过这样的题：「给你一棵树，要求支持两种操作 —— ① 把 u 到 v 路径上所有节点的权值加上 x；② 查询 u 到 v 路径上节点权值的最大值。操作多达 10 万次。」

如果只是暴力爬路径，单次操作最坏是 O(n)，总复杂度直接 O(n²)，10 万次操作下绝对 TLE ❌。

这就是**树链剖分（Heavy-Light Decomposition，简称 HLD）**的经典舞台。它能把树上任意两点的路径操作降到 **O(log²n)**，再配合线段树，10 万次操作也能稳稳跑过。

在国内互联网大厂的面试里，HLD 几乎是「树」类问题的压轴题（字节、阿里、腾讯都爱考）。今天我们就来把它彻底拆开揉碎讲清楚。

## 原理拆解

### 1. 先搞懂「重儿子」和「轻儿子」

HLD 的第一步是把树上的边分成"重边"和"轻边"。规则非常简单：

- **子树大小**：以某个节点为根的子树包含的节点总数，记作 `size[u]`
- **重儿子**：`u` 的所有儿子中，`size` 最大的那个（如果有多个，任选一个）
- **轻儿子**：除了重儿子以外的其他儿子
- **重边**：连接 u 和重儿子的那条边
- **轻边**：连接 u 和轻儿子的那些边

看个例子你就明白了 👇

```
              1
            / | \
           2  3  4
          /|     \
         5 6      7
        /  |
       8   9

以 1 为根：
- size[8] = 1, size[9] = 1, size[5] = 3, size[6] = 2
- size[2] = 1 + 3 + 2 = 6
- size[7] = 1, size[3] = 1, size[4] = 2
- size[1] = 1 + 6 + 1 + 2 = 10

重儿子：
- 节点 1 的儿子中 size[2]=6 最大 → 2 是 1 的重儿子 → (1,2) 是重边
- 节点 2 的儿子中 size[5]=3 最大 → 5 是 2 的重儿子 → (2,5) 是重边
- 节点 5 的儿子只有 8 → 8 是 5 的重儿子 → (5,8) 是重边
- 其他边（1-3, 1-4, 2-6, 4-7, 6-9）都是轻边
```

把重边连起来，就形成了一条条**重链**：

```
重链 1:  1 — 2 — 5 — 8
重链 2:  6 — 9
重链 3:  3
重链 4:  4 — 7
```

### 2. 为什么「重链」这么牛？

重链有个关键性质：**从任意节点出发向上爬到根，经过的轻边数量不超过 O(log n)**。

为什么？因为每次走轻边，对应的子树大小至少减半。看 👇：

```
- 节点 u 走向它的轻儿子 v
- size[v] ≤ size[u] / 2（因为轻儿子的 size 不超过总 size 的一半）
- 所以每走一次轻边，子树大小至少砍半
- 从 n 砍到 1 最多需要 log₂n 次
```

这意味着：**从 u 到 v 的路径，可以被拆分成 O(log n) 条重链**。

而重链上的节点是连续排列的（这点下面 DFS 序就体现），所以对每条重链的区间操作可以用**线段树**做到 O(log n)。

于是最终复杂度就是：**O(log n) 条重链 × O(log n) 线段树查询 = O(log²n)** ✨

### 3. DFS 序：把树拍扁到数组

HLD 的精髓在于：把树上的一条重链"映射"到数组的一段连续区间，这样就可以用线段树维护。

我们要做两次 DFS：

**第一次 DFS（dfs1）**：算 `size`、`parent`、`depth`、`heavy`（重儿子）

```typescript
function dfs1(u: number, p: number): void {
  parent[u] = p;
  size[u] = 1;
  depth[u] = (p === -1 ? 0 : depth[p] + 1);
  heavy[u] = -1;

  for (const v of adj[u]) {
    if (v === p) continue;
    dfs1(v, u);
    size[u] += size[v];
    if (heavy[u] === -1 || size[v] > size[heavy[u]]) {
      heavy[u] = v;
    }
  }
}
```

**第二次 DFS（dfs2）**：给每个节点分配 `dfn[u]`（DFS 序），并维护每条重链的链顶 `top[u]`

```typescript
let curPos = 0;
function dfs2(u: number, head: number): void {
  top[u] = head;            // u 所在重链的链顶
  dfn[u] = curPos++;        // u 在数组中的位置
  if (heavy[u] === -1) return;  // 叶子节点
  dfs2(heavy[u], head);     // 重儿子继续走同一条重链

  for (const v of adj[u]) {
    if (v === parent[u] || v === heavy[u]) continue;
    dfs2(v, v);             // 轻儿子是新重链的链顶
  }
}
```

跑完上面这棵树，结果大致是这样（DFS 序数字代表访问顺序）：

```
节点:   1   2   3   4   5   6   7   8   9
dfn:   1   2   7   8   3   6   9   4   5
top:   1   1   3   4   1   6   4   1   6
size:  10   6   1   2   3   2   1   1   1
heavy: 2   5  -1   7   8  -1  -1  -1  -1

重链 1 (top=1): dfn = [1, 2, 3, 4]  → 节点 1,2,5,8  → 在数组中是连续区间！
重链 2 (top=6): dfn = [6, 5]         → 节点 6,9        → 连续区间
重链 3 (top=3): dfn = [7]            → 节点 3
重链 4 (top=4): dfn = [8, 9]         → 节点 4,7
```

### 4. 路径操作：把 u→v 拆成 O(log n) 段

这是 HLD 最核心的算法：**怎么把 u 到 v 的路径拆成若干段，使得每段都在同一条重链上**。

思路：每次让 `top[u]` 和 `top[v]` 中**深度更大的那个节点**往上跳，跳到链顶的父节点，直到 u 和 v 在同一条重链上。

```
while (top[u] !== top[v]) {
  if (depth[top[u]] < depth[top[v]]) [u, v] = [v, u];
  // 现在 top[u] 比 top[v] 深，处理 [dfn[top[u]], dfn[u]] 这段区间
  // 然后 u = parent[top[u]]，跳到上一条重链
  u = parent[top[u]];
}
// 现在 u 和 v 在同一条重链上，处理 [dfn[u], dfn[v]]（注意取 min/max）
```

图解一下：假设要处理 8 → 9 的路径

```
初始：u=8 (top=1), v=9 (top=6)
- top[u].depth=0, top[v].depth=0(节点6的top是6自己,depth=1)
  → 实际 depth[top[u]]=0, depth[top[v]]=1，v 链顶更深
- 交换 u,v → u=9, v=8
- 处理 [dfn[6]=6, dfn[9]=5]? 取 min..max = [5,6] → 节点 9 和 6
- u = parent[top[u]] = parent[6] = 2
- u=2 (top=1), v=8 (top=1) 现在在同一条重链
- 处理 [dfn[2]=2, dfn[8]=4] → 节点 2,5,8

总共处理了 2 段区间 [5,6] 和 [2,4]，正好覆盖 8→5→2→6→9 的路径
```

### 5. 子树操作：O(1) 范围查询

除了路径操作，HLD 还能让子树操作变得极其简单 —— 整棵子树就是数组的一段连续区间！

因为 `dfn` 是按子树连续分配的（DFS 的递归特性），所以子树 u 的所有节点就是 `[dfn[u], dfn[u] + size[u] - 1]`。

### 6. 一图流总结

```
┌─────────────────────────────────────────────┐
│             输入：一棵树                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  DFS1：算 size/parent │
        │  确定每个节点的重儿子 │
        └──────────┬───────────┘
                   ▼
        ┌──────────────────────┐
        │  DFS2：给每个节点分配│
        │  dfn 和 top，建重链  │
        └──────────┬───────────┘
                   ▼
        ┌──────────────────────┐
        │  线段树维护 dfn 数组  │
        │  (区间修改 + 查询)    │
        └──────────┬───────────┘
                   ▼
        ┌──────────────────────┐
        │  路径操作：while 循环 │
        │  把路径拆成 O(log n)  │
        │  段重链区间           │
        └──────────────────────┘
```

## 代码实现

下面是一个完整的 HLD 实现，支持：
- 路径加值（区间修改）
- 路径求和（区间查询）
- 子树加值
- 子树求和

### TypeScript

```typescript
/**
 * 树链剖分 + 线段树 —— TypeScript 实现
 * 功能：路径加值/求和、子树加值/求和
 */
class SegmentTree {
  private n: number;
  private sum: number[];
  private lazy: number[];

  constructor(arr: number[]) {
    this.n = arr.length;
    this.sum = new Array(4 * this.n).fill(0);
    this.lazy = new Array(4 * this.n).fill(0);
    if (this.n > 0) this.build(1, 0, this.n - 1, arr);
  }

  private build(node: number, l: number, r: number, arr: number[]): void {
    if (l === r) { this.sum[node] = arr[l]; return; }
    const mid = (l + r) >> 1;
    this.build(node * 2, l, mid, arr);
    this.build(node * 2 + 1, mid + 1, r, arr);
    this.sum[node] = this.sum[node * 2] + this.sum[node * 2 + 1];
  }

  private pushDown(node: number, l: number, r: number): void {
    if (this.lazy[node] !== 0) {
      const mid = (l + r) >> 1;
      const tag = this.lazy[node];
      this.apply(node * 2, mid - l + 1, tag);
      this.apply(node * 2 + 1, r - mid, tag);
      this.lazy[node] = 0;
    }
  }

  private apply(node: number, len: number, tag: number): void {
    this.sum[node] += tag * len;
    this.lazy[node] += tag;
  }

  rangeAdd(qL: number, qR: number, val: number): void {
    this.update(1, 0, this.n - 1, qL, qR, val);
  }

  private update(node: number, l: number, r: number, qL: number, qR: number, val: number): void {
    if (qL <= l && r <= qR) { this.apply(node, r - l + 1, val); return; }
    this.pushDown(node, l, r);
    const mid = (l + r) >> 1;
    if (qL <= mid) this.update(node * 2, l, mid, qL, qR, val);
    if (qR > mid) this.update(node * 2 + 1, mid + 1, r, qL, qR, val);
    this.sum[node] = this.sum[node * 2] + this.sum[node * 2 + 1];
  }

  rangeSum(qL: number, qR: number): number {
    return this.query(1, 0, this.n - 1, qL, qR);
  }

  private query(node: number, l: number, r: number, qL: number, qR: number): number {
    if (qL <= l && r <= qR) return this.sum[node];
    this.pushDown(node, l, r);
    const mid = (l + r) >> 1;
    let res = 0;
    if (qL <= mid) res += this.query(node * 2, l, mid, qL, qR);
    if (qR > mid) res += this.query(node * 2 + 1, mid + 1, r, qL, qR);
    return res;
  }
}

class HeavyLightDecomposition {
  private n: number;
  private adj: number[][];
  private parent: number[] = [];
  private depth: number[] = [];
  private size: number[] = [];
  private heavy: number[] = [];
  private dfn: number[] = [];
  private top: number[] = [];
  private invDfn: number[] = [];   // dfn -> node
  private values: number[] = [];   // 节点原始权值
  private seg: SegmentTree;
  private curPos = 0;

  constructor(n: number, edges: [number, number][], values: number[]) {
    this.n = n;
    this.adj = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
      this.adj[u].push(v);
      this.adj[v].push(u);
    }
    this.values = values.slice();
    this.parent = new Array(n).fill(-1);
    this.depth = new Array(n).fill(0);
    this.size = new Array(n).fill(0);
    this.heavy = new Array(n).fill(-1);
    this.dfn = new Array(n).fill(0);
    this.top = new Array(n).fill(0);
    this.invDfn = new Array(n).fill(0);

    this.dfs1(0, -1);
    this.dfs2(0, 0);

    const arr = new Array(n).fill(0);
    for (let i = 0; i < n; i++) arr[this.dfn[i]] = this.values[i];
    this.seg = new SegmentTree(arr);
  }

  // 第一次 DFS：算 size、parent、depth、重儿子
  private dfs1(u: number, p: number): void {
    this.parent[u] = p;
    this.size[u] = 1;
    this.depth[u] = (p === -1 ? 0 : this.depth[p] + 1);
    this.heavy[u] = -1;

    for (const v of this.adj[u]) {
      if (v === p) continue;
      this.dfs1(v, u);
      this.size[u] += this.size[v];
      if (this.heavy[u] === -1 || this.size[v] > this.size[this.heavy[u]]) {
        this.heavy[u] = v;
      }
    }
  }

  // 第二次 DFS：分配 dfn 和 top
  private dfs2(u: number, head: number): void {
    this.top[u] = head;
    this.dfn[u] = this.curPos;
    this.invDfn[this.curPos] = u;
    this.curPos++;

    if (this.heavy[u] === -1) return;
    this.dfs2(this.heavy[u], head);   // 重儿子继续同一条链

    for (const v of this.adj[u]) {
      if (v === this.parent[u] || v === this.heavy[u]) continue;
      this.dfs2(v, v);                 // 轻儿子是新链的链顶
    }
  }

  /** 路径 u -> v 区间加上 val */
  pathAdd(u: number, v: number, val: number): void {
    while (this.top[u] !== this.top[v]) {
      if (this.depth[this.top[u]] < this.depth[this.top[v]]) {
        [u, v] = [v, u];
      }
      // top[u] 更深，处理 [dfn[top[u]], dfn[u]]
      this.seg.rangeAdd(this.dfn[this.top[u]], this.dfn[u], val);
      u = this.parent[this.top[u]];
    }
    // 现在同链，处理 [min, max]
    if (this.depth[u] > this.depth[v]) [u, v] = [v, u];
    this.seg.rangeAdd(this.dfn[u], this.dfn[v], val);
  }

  /** 路径 u -> v 的权值和 */
  pathSum(u: number, v: number): number {
    let res = 0;
    while (this.top[u] !== this.top[v]) {
      if (this.depth[this.top[u]] < this.depth[this.top[v]]) {
        [u, v] = [v, u];
      }
      res += this.seg.rangeSum(this.dfn[this.top[u]], this.dfn[u]);
      u = this.parent[this.top[u]];
    }
    if (this.depth[u] > this.depth[v]) [u, v] = [v, u];
    res += this.seg.rangeSum(this.dfn[u], this.dfn[v]);
    return res;
  }

  /** 子树 u 加上 val */
  subtreeAdd(u: number, val: number): void {
    this.seg.rangeAdd(this.dfn[u], this.dfn[u] + this.size[u] - 1, val);
  }

  /** 子树 u 的权值和 */
  subtreeSum(u: number): number {
    return this.seg.rangeSum(this.dfn[u], this.dfn[u] + this.size[u] - 1);
  }

  /** 查询两点 LCA */
  lca(u: number, v: number): number {
    while (this.top[u] !== this.top[v]) {
      if (this.depth[this.top[u]] < this.depth[this.top[v]]) {
        [u, v] = [v, u];
      }
      u = this.parent[this.top[u]];
    }
    return this.depth[u] < this.depth[v] ? u : v;
  }
}

// 使用示例
const n = 5;
const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4]];
const values = [1, 2, 3, 4, 5];
const hld = new HeavyLightDecomposition(n, edges, values);

console.log(hld.pathSum(3, 4));    // 4 + 5 = 9
hld.pathAdd(3, 4, 10);
console.log(hld.pathSum(3, 4));    // 9 + 20 = 29
console.log(hld.subtreeSum(1));    // 节点 1,3,4 之和
console.log(hld.lca(3, 4));        // 1
```

### Go

```go
package main

import "fmt"

type SegTree struct {
	n, size int
	sum     []int64
	lazy    []int64
}

func NewSegTree(arr []int64) *SegTree {
	n := len(arr)
	st := &SegTree{n: n, size: n, sum: make([]int64, 4*n), lazy: make([]int64, 4*n)}
	if n > 0 {
		st.build(1, 0, n-1, arr)
	}
	return st
}

func (st *SegTree) build(node, l, r int, arr []int64) {
	if l == r {
		st.sum[node] = arr[l]
		return
	}
	mid := (l + r) >> 1
	st.build(node*2, l, mid, arr)
	st.build(node*2+1, mid+1, r, arr)
	st.sum[node] = st.sum[node*2] + st.sum[node*2+1]
}

func (st *SegTree) apply(node int, length int, tag int64) {
	st.sum[node] += tag * int64(length)
	st.lazy[node] += tag
}

func (st *SegTree) pushDown(node, l, r int) {
	if st.lazy[node] != 0 {
		mid := (l + r) >> 1
		tag := st.lazy[node]
		st.apply(node*2, mid-l+1, tag)
		st.apply(node*2+1, r-mid, tag)
		st.lazy[node] = 0
	}
}

func (st *SegTree) update(node, l, r, qL, qR int, val int64) {
	if qL <= l && r <= qR {
		st.apply(node, r-l+1, val)
		return
	}
	st.pushDown(node, l, r)
	mid := (l + r) >> 1
	if qL <= mid {
		st.update(node*2, l, mid, qL, qR, val)
	}
	if qR > mid {
		st.update(node*2+1, mid+1, r, qL, qR, val)
	}
	st.sum[node] = st.sum[node*2] + st.sum[node*2+1]
}

func (st *SegTree) query(node, l, r, qL, qR int) int64 {
	if qL <= l && r <= qR {
		return st.sum[node]
	}
	st.pushDown(node, l, r)
	mid := (l + r) >> 1
	var res int64 = 0
	if qL <= mid {
		res += st.query(node*2, l, mid, qL, qR)
	}
	if qR > mid {
		res += st.query(node*2+1, mid+1, r, qL, qR)
	}
	return res
}

func (st *SegTree) RangeAdd(l, r int, val int64) { st.update(1, 0, st.n-1, l, r, val) }
func (st *SegTree) RangeSum(l, r int) int64     { return st.query(1, 0, st.n-1, l, r) }

type HLD struct {
	n        int
	adj      [][]int
	parent   []int
	depth    []int
	size     []int
	heavy    []int
	dfn      []int
	top      []int
	invDfn   []int
	values   []int64
	seg      *SegTree
	curPos   int
}

func NewHLD(n int, edges [][2]int, values []int64) *HLD {
	h := &HLD{
		n: n, adj: make([][]int, n), values: values,
		parent: make([]int, n), depth: make([]int, n),
		size: make([]int, n), heavy: make([]int, n),
		dfn: make([]int, n), top: make([]int, n),
		invDfn: make([]int, n),
	}
	for i := range h.heavy {
		h.heavy[i] = -1
		h.parent[i] = -1
	}
	for _, e := range edges {
		u, v := e[0], e[1]
		h.adj[u] = append(h.adj[u], v)
		h.adj[v] = append(h.adj[v], u)
	}
	h.dfs1(0, -1)
	h.dfs2(0, 0)

	arr := make([]int64, n)
	for i := 0; i < n; i++ {
		arr[h.dfn[i]] = h.values[i]
	}
	h.seg = NewSegTree(arr)
	return h
}

func (h *HLD) dfs1(u, p int) {
	h.parent[u] = p
	h.size[u] = 1
	if p == -1 {
		h.depth[u] = 0
	} else {
		h.depth[u] = h.depth[p] + 1
	}
	for _, v := range h.adj[u] {
		if v == p {
			continue
		}
		h.dfs1(v, u)
		h.size[u] += h.size[v]
		if h.heavy[u] == -1 || h.size[v] > h.size[h.heavy[u]] {
			h.heavy[u] = v
		}
	}
}

func (h *HLD) dfs2(u, head int) {
	h.top[u] = head
	h.dfn[u] = h.curPos
	h.invDfn[h.curPos] = u
	h.curPos++
	if h.heavy[u] == -1 {
		return
	}
	h.dfs2(h.heavy[u], head)
	for _, v := range h.adj[u] {
		if v == h.parent[u] || v == h.heavy[u] {
			continue
		}
		h.dfs2(v, v)
	}
}

func (h *HLD) PathAdd(u, v int, val int64) {
	for h.top[u] != h.top[v] {
		if h.depth[h.top[u]] < h.depth[h.top[v]] {
			u, v = v, u
		}
		h.seg.RangeAdd(h.dfn[h.top[u]], h.dfn[u], val)
		u = h.parent[h.top[u]]
	}
	if h.depth[u] > h.depth[v] {
		u, v = v, u
	}
	h.seg.RangeAdd(h.dfn[u], h.dfn[v], val)
}

func (h *HLD) PathSum(u, v int) int64 {
	var res int64 = 0
	for h.top[u] != h.top[v] {
		if h.depth[h.top[u]] < h.depth[h.top[v]] {
			u, v = v, u
		}
		res += h.seg.RangeSum(h.dfn[h.top[u]], h.dfn[u])
		u = h.parent[h.top[u]]
	}
	if h.depth[u] > h.depth[v] {
		u, v = v, u
	}
	res += h.seg.RangeSum(h.dfn[u], h.dfn[v])
	return res
}

func (h *HLD) SubtreeAdd(u int, val int64) {
	h.seg.RangeAdd(h.dfn[u], h.dfn[u]+h.size[u]-1, val)
}

func (h *HLD) SubtreeSum(u int) int64 {
	return h.seg.RangeSum(h.dfn[u], h.dfn[u]+h.size[u]-1)
}

func (h *HLD) LCA(u, v int) int {
	for h.top[u] != h.top[v] {
		if h.depth[h.top[u]] < h.depth[h.top[v]] {
			u, v = v, u
		}
		u = h.parent[h.top[u]]
	}
	if h.depth[u] < h.depth[v] {
		return u
	}
	return v
}

func main() {
	edges := [][2]int{{0, 1}, {0, 2}, {1, 3}, {1, 4}}
	values := []int64{1, 2, 3, 4, 5}
	h := NewHLD(5, edges, values)
	fmt.Println(h.PathSum(3, 4)) // 9
	h.PathAdd(3, 4, 10)
	fmt.Println(h.PathSum(3, 4)) // 29
	fmt.Println(h.SubtreeSum(1)) // 11 (1+2+4+5+10+10 等等)
	fmt.Println(h.LCA(3, 4))     // 1
}
```

### Python

```python
"""
树链剖分 + 线段树 —— Python 实现
适合快速验证逻辑或刷题用
"""

class SegTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.sum = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        if self.n > 0:
            self._build(1, 0, self.n - 1, arr)

    def _build(self, node, l, r, arr):
        if l == r:
            self.sum[node] = arr[l]
            return
        mid = (l + r) // 2
        self._build(node * 2, l, mid, arr)
        self._build(node * 2 + 1, mid + 1, r, arr)
        self.sum[node] = self.sum[node * 2] + self.sum[node * 2 + 1]

    def _apply(self, node, length, tag):
        self.sum[node] += tag * length
        self.lazy[node] += tag

    def _push_down(self, node, l, r):
        if self.lazy[node] != 0:
            mid = (l + r) // 2
            tag = self.lazy[node]
            self._apply(node * 2, mid - l + 1, tag)
            self._apply(node * 2 + 1, r - mid, tag)
            self.lazy[node] = 0

    def range_add(self, l, r, val):
        self._update(1, 0, self.n - 1, l, r, val)

    def _update(self, node, l, r, ql, qr, val):
        if ql <= l and r <= qr:
            self._apply(node, r - l + 1, val)
            return
        self._push_down(node, l, r)
        mid = (l + r) // 2
        if ql <= mid:
            self._update(node * 2, l, mid, ql, qr, val)
        if qr > mid:
            self._update(node * 2 + 1, mid + 1, r, ql, qr, val)
        self.sum[node] = self.sum[node * 2] + self.sum[node * 2 + 1]

    def range_sum(self, l, r):
        return self._query(1, 0, self.n - 1, l, r)

    def _query(self, node, l, r, ql, qr):
        if ql <= l and r <= qr:
            return self.sum[node]
        self._push_down(node, l, r)
        mid = (l + r) // 2
        res = 0
        if ql <= mid:
            res += self._query(node * 2, l, mid, ql, qr)
        if qr > mid:
            res += self._query(node * 2 + 1, mid + 1, r, ql, qr)
        return res


class HeavyLightDecomposition:
    def __init__(self, n, edges, values):
        self.n = n
        self.adj = [[] for _ in range(n)]
        for u, v in edges:
            self.adj[u].append(v)
            self.adj[v].append(u)
        self.values = values[:]
        self.parent = [-1] * n
        self.depth = [0] * n
        self.size = [0] * n
        self.heavy = [-1] * n
        self.dfn = [0] * n
        self.top = [0] * n
        self.inv_dfn = [0] * n
        self.cur_pos = 0

        self._dfs1(0, -1)
        self._dfs2(0, 0)

        arr = [0] * n
        for i in range(n):
            arr[self.dfn[i]] = self.values[i]
        self.seg = SegTree(arr)

    def _dfs1(self, u, p):
        self.parent[u] = p
        self.size[u] = 1
        self.depth[u] = 0 if p == -1 else self.depth[p] + 1
        for v in self.adj[u]:
            if v == p:
                continue
            self._dfs1(v, u)
            self.size[u] += self.size[v]
            if self.heavy[u] == -1 or self.size[v] > self.size[self.heavy[u]]:
                self.heavy[u] = v

    def _dfs2(self, u, head):
        self.top[u] = head
        self.dfn[u] = self.cur_pos
        self.inv_dfn[self.cur_pos] = u
        self.cur_pos += 1
        if self.heavy[u] == -1:
            return
        self._dfs2(self.heavy[u], head)
        for v in self.adj[u]:
            if v == self.parent[u] or v == self.heavy[u]:
                continue
            self._dfs2(v, v)

    def path_add(self, u, v, val):
        while self.top[u] != self.top[v]:
            if self.depth[self.top[u]] < self.depth[self.top[v]]:
                u, v = v, u
            self.seg.range_add(self.dfn[self.top[u]], self.dfn[u], val)
            u = self.parent[self.top[u]]
        if self.depth[u] > self.depth[v]:
            u, v = v, u
        self.seg.range_add(self.dfn[u], self.dfn[v], val)

    def path_sum(self, u, v):
        res = 0
        while self.top[u] != self.top[v]:
            if self.depth[self.top[u]] < self.depth[self.top[v]]:
                u, v = v, u
            res += self.seg.range_sum(self.dfn[self.top[u]], self.dfn[u])
            u = self.parent[self.top[u]]
        if self.depth[u] > self.depth[v]:
            u, v = v, u
        res += self.seg.range_sum(self.dfn[u], self.dfn[v])
        return res

    def subtree_add(self, u, val):
        self.seg.range_add(self.dfn[u], self.dfn[u] + self.size[u] - 1, val)

    def subtree_sum(self, u):
        return self.seg.range_sum(self.dfn[u], self.dfn[u] + self.size[u] - 1)

    def lca(self, u, v):
        while self.top[u] != self.top[v]:
            if self.depth[self.top[u]] < self.depth[self.top[v]]:
                u, v = v, u
            u = self.parent[self.top[u]]
        return u if self.depth[u] < self.depth[v] else u  # u 或 v 都行


# 使用示例
if __name__ == "__main__":
    edges = [(0, 1), (0, 2), (1, 3), (1, 4)]
    values = [1, 2, 3, 4, 5]
    hld = HeavyLightDecomposition(5, edges, values)

    print(hld.path_sum(3, 4))     # 9
    hld.path_add(3, 4, 10)
    print(hld.path_sum(3, 4))     # 29
    print(hld.subtree_sum(1))     # 子树 1 的和
    print(hld.lca(3, 4))          # 1
```

## 复杂度分析

| 操作 | 时间复杂度 | 说明 |
|------|----------|------|
| 预处理（DFS1 + DFS2） | **O(n)** | 两次遍历 |
| 路径加值/查询 | **O(log²n)** | O(log n) 段重链 × O(log n) 线段树 |
| 子树加值/查询 | **O(log n)** | 子树对应一段连续区间 |
| 求 LCA | **O(log n)** | 顺便就能算 |

空间复杂度：**O(n)** —— 邻接表、线段树、各种辅助数组。

## 实际应用

### 1. 算法竞赛经典题

HLD 是 OI/ACM 中处理"树上路径修改/查询"的标配：

- **洛谷 P3384【模板】轻重链剖分**：把模板题秒了就算入门
- **洛谷 P3178 [树上操作]**：子树加值 + 子树求和
- **HDU 3966 Aragorn's Story**：路径更新 + 单点查询
- **SPOJ QTREE / QTREE2**：边权维护
- **BZOJ 1036 [ZJOI 2008] 树的统计**：经典路径最值 + 求和

### 2. 真实业务场景

**场景一：社交网络关系链**
- 微博/抖音的关注关系构成一个巨大的图（树/森林）
- "查询用户 A 和用户 B 之间的共同祖先" → 用 HLD 求 LCA
- "给一段关系链上的所有用户打标签" → 路径更新

**场景二：组织架构树**
- 公司组织架构是标准的树结构
- HR 系统要"给某部门到某部门的所有管理层级批量更新薪酬区间"
- 配合 HLD 的路径修改能力，几万次操作也秒回

**场景三：文件系统权限**
- 文件目录是树
- "把 /a/b/c 到 /a/b/d 这条路径上的所有文件夹权限改成 755"
- 子树权限继承（递归给子树所有文件加权限）

**场景四：网络路由**
- BGP 路由表维护时，常需要"从源 AS 到目标 AS 路径上的某些属性批量调整"
- 网络拓扑本质是图，但对生成树做操作时 HLD 就很方便

### 3. HLD vs 其他方案对比

| 方案 | 单次路径操作 | 编程复杂度 | 适用场景 |
|------|------------|----------|---------|
| 暴力爬路径 | O(n) | ⭐ | 小数据、调试 |
| 树链剖分 HLD | O(log²n) | ⭐⭐⭐ | 通用，最常用 |
| Link-Cut Tree (LCT) | O(log n) | ⭐⭐⭐⭐⭐ | 动态树（边权会变、连边/断边） |
| 树剖 + 树状数组 | O(log²n) | ⭐⭐ | 只需单点查询/求和 |
| Euler 序 + 树状数组 | O(log n) | ⭐⭐⭐ | 子树操作为主 |

> 💡 **一句话建议**：90% 的树上路径问题，HLD + 线段树就够用了。除非题目有动态加边/删边（Link-Cut Tree）或者只关心子树（Euler 序），否则不用想别的方案。

## 常见易错点

**1. dfs2 中重儿子要先走**
```typescript
// 错误：先遍历轻儿子
for (const v of adj[u]) dfs2(v, v);
// 正确：先走重儿子（保持同一条链）
if (heavy[u] !== -1) dfs2(heavy[u], head);
for (const v of adj[u]) if (v !== heavy[u]) dfs2(v, v);
```

**2. 路径合并时注意大小端**
```typescript
// 错误：dfn[u] 永远 < dfn[v]
const l = Math.min(dfn[u], dfn[v]);
const r = Math.max(dfn[u], dfn[v]);
// 注意：你需要先让 depth[u] < depth[v]，然后 dfn[u] <= dfn[v]
```

**3. 子树区间右端点别忘了 -1**
```typescript
// 错误：写成 dfn[u] + size[u]
// 正确：dfn[u] + size[u] - 1
seg.rangeAdd(dfn[u], dfn[u] + size[u] - 1, val);
```

**4. 根节点的 parent 要初始化**
```typescript
parent[root] = -1;  // 或者 0（自己），但要保证后续判断不出错
```

**5. 多组数据时记得清空**
```typescript
curPos = 0;
parent.fill(0); size.fill(0); heavy.fill(-1); dfn.fill(0); top.fill(0);
```

## 总结

HLD 的本质思想可以浓缩成一句话：**把树拆成重链，让重链上的节点在数组里连续分布，然后用线段树等区间数据结构维护**。

| 关键点 | 内容 |
|--------|------|
| 核心数据结构 | 重儿子 + DFS 序 + 线段树 |
| 时间复杂度 | 预处理 O(n)，路径操作 O(log²n)，子树 O(log n) |
| 空间复杂度 | O(n) |
| 适用题型 | 树上路径批量修改 + 查询 |
| 替代方案 | LCT（动态树，O(log n)） |

学完 HLD，你的「树」类算法工具箱就基本齐了 —— DFS/BFS 遍历、二叉树、字典树、并查集、线段树、树状数组、倍增 LCA、HLD。这一套组合拳能解决 95% 的树形结构问题。

下次遇到「树上的路径」+「区间操作」的题，别再暴力爬了，套 HLD 模板，半小时 AC 收工 🎉。