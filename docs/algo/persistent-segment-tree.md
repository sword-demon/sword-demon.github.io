---
title: 可持久化线段树（主席树）
description: 可持久化线段树 —— 每次修改只新建 O(log n) 节点,保留所有历史版本,用来秒杀"静态区间第 K 大"等离线问题
date: 2026-10-17 09:00:55
categories:
  - Algorithm
tags:
  - segment-tree
  - persistent
  - chairman-tree
  - offline
  - kth-number
  - interview
sidebarSort: 106
---

# 可持久化线段树（主席树 / Persistent Segment Tree）

如果你已经读过 [线段树](segment-tree.md) 和 [树状数组](binary-indexed-tree.md) 那两篇,应该能熟练解决"区间求和""区间最值"之类的问题了。但面试官依然不会这么轻易放过你——他会再升一级:

> "给定一个长度为 N 的静态数组,会有 M 次查询,每次问 `[L, R]` 区间内的第 K 大数。要求每次查询在 O(log² N) 内返回结果。"

> "我想知道某篇文章,在第 100 次编辑、第 200 次编辑、第 300 次编辑之后,各自长什么样。能让我随时回到任意历史版本吗?"

> "给你 N 个历史时刻的状态,每个时刻由一些事件触发。我要在第 i 个时刻插入一个值,然后查询 `[1, i-1]` 的前缀信息……"

这些题目有一个共同点:**数据本身不变(或者说,是离线的),但我们要查询的是「某个时间点 / 某个前缀」上的状态**。普通的线段树每改一次就「覆盖」掉原值,历史版本丢了;新建 N 棵线段树则内存爆炸(O(N²) 的节点数)。

这时候就要请出 **可持久化线段树(Persistent Segment Tree)** ✨,江湖人称 **主席树**(因为发明者是 HJT,江湖人称 HJT 主席,所以这门数据结构被叫"主席树")。

## 1. 核心思想:不要覆盖,只「长出」新分支

普通线段树做单点修改时,会从根节点一直改到叶子节点,把路径上所有节点的值都更新一遍。这意味着**老版本的数据彻底没了**。

可持久化线段树的精髓在于:**修改时只把路径上的节点复制一份(创建新节点),其他节点保持不变**。这样:

- 老版本的数据一个都不丢 ✅
- 新版本和老版本共享大部分节点,内存不会爆 ✅
- 每个版本都是一棵「根节点不同,但树形几乎一样」的线段树 ✅

听起来很玄乎?直接上图 👇

```
普通线段树(单点修改覆盖):

初始版本 v1:        修改后版本 v2(原 v1 已经没了):
       [1,4]                 [1,4]
       /  \                  /  \
   [1,2]  [3,4]          [1,2]  [3,4]  ← 整个树的值都被覆盖
   / \    / \             / \    / \
  1   2  3   4           1   5  3   4   ← 原值 2 没了
                         ↑ 改这里


可持久化线段树(单点修改只复制路径):

版本 v1:            修改位置 3 后的版本 v2:
      r1                    r2 ← 新根
     /  \                  /  \
   a1   b1               a1'  b2 ← 新节点
   /\   /\               /\   /\
  1  2 3  4              1  2 3' 4 ← 只复制了路径上的节点

关键:节点 a1 没动,只是被 v2 引用了!所以 v1 还在。
新创建的节点数 = 树的高度 = O(log n)
```

所以可持久化的核心是:**路径复制 + 共享**。

## 2. 节点结构:左孩子、右孩子,再加个版本号

在代码层面,普通线段树的节点就是一个数组下标,存左右孩子和当前节点的权值。但可持久化线段树的节点必须显式存「左右孩子是谁」,因为同一个父节点的不同版本,可能指向不同的孩子:

```typescript
/**
 * 节点结构:每个节点是一个独立的对象
 * 为什么不用数组存节点:数组没法表达「多版本共享节点」的拓扑关系
 */
class Node {
  left: number;     // 左孩子节点编号(下标),0 表示空
  right: number;    // 右孩子节点编号
  count: number;    // 当前区间内的元素个数(或者其他聚合值,看具体问题)
}
```

通常我们用一个全局数组 `nodes: Node[]` 来存所有节点,用数组下标当节点 ID。初始空树是 `node[1]`(根),每次修改就 `nodes.length++` 加新节点,新节点继承老节点的 left/right,然后只覆盖路径上的 count。

## 3. 应用一:静态区间第 K 大(经典题)

这是主席树最经典的用途。LeetCode 没有原题,但在各大 OJ 上常年霸榜。

### 3.1 问题描述

```
给定一个长度为 N 的数组 arr,会有 M 次查询:
  每次查询给出 L, R, K,要求返回 arr[L..R] 内第 K 大的数。

约束:1 ≤ N, M ≤ 10^5,数组元素范围大但值域可离散化
```

### 3.2 朴素思路的失败

最直接的做法是把 `[L, R]` 排序,然后取第 K 个。每次排序 O(N log N),查询 M 次是 O(MN log N),N=10^5 时直接 TLE。

如果用一个大根堆维护 `[L, R]`,弹出 K 次,每次堆调整 O(log N),单次查询 O(K log N)。K 大的时候也慢。

### 3.3 主席树思路

**离散化 + 前缀版本差分**。

先离散化:把所有出现过的值排个序,映射到 `[1, S]` 范围(S ≤ N),这样值域就压缩了。

然后建 N 棵线权树(实际上是 N 个版本):

- `root[i]` 表示「前 i 个元素」的线权树版本。
- 也就是说,`root[i] - root[i-1]` 就是「第 i 个元素」的增量。

每棵线权树的节点含义是:**当前区间 `[l, r]` 内有多少个元素**。

```
举例:arr = [3, 1, 4, 2],离散化后 = [2, 1, 3, 2]

root[0]: 空树
   count = 0

root[1]: 处理前 1 个元素(值 2)
   区间 [1,3] 内有 1 个元素

root[2]: 处理前 2 个元素(值 1, 2)
   区间 [1,3] 内有 2 个元素

root[3]: 处理前 3 个元素(值 1, 2, 3)
   区间 [1,3] 内有 3 个元素

root[4]: 处理前 4 个元素(值 1, 2, 2, 3)
   区间 [1,3] 内有 4 个元素
```

**关键魔法**:`root[R] - root[L-1]` 表示什么?

答:`[1, R]` 区间减去 `[1, L-1]` 区间,剩下的就是 `[L, R]` 区间。每个节点存的都是「该值域区间内元素个数」,所以两个版本相减,得到的就是 `[L, R]` 内元素在每个值域区间的分布!

那查询第 K 大就变成了:**在值域区间 `[1, S]` 上,根据左右子树元素个数的差值,递归找到第 K 个元素所在的叶子**。

```
举例:arr = [3, 1, 4, 2, 3]
离散化后:[2, 1, 3, 2, 2]
查询 [2, 4] 内第 2 大的数(应该是 3)

root[4] - root[1]:
  区间 [1,4]:  左子树 [1,2] 有 2 个 → 候选值 1, 2
               右子树 [3,4] 有 1 个 → 候选值 3, 4

  找第 2 大:
  左子树 2 个 + 右子树 1 个 = 3 个,我们想要第 2 个
  左子树有 2 个 ≥ 2,第 2 个在左子树
  继续往左走:
    左子树 [1,1]: 1 个
    右子树 [2,2]: 1 个
    找第 2 个:
    左子树 1 个 < 2,第 2 个在右子树
    答:右子树叶子对应的值 = 2
  但等等!我们要的是「第 2 大」,也就是排序后第 2 个

哦,我说反了。这里写「第 K 大」是按「从大到小」排的第 K 个。
让我重新说明一下:实际实现是「按值从小到大找第 K 个」(也就是第 K 小)
然后输出时,如果要第 K 大,就把 K 转换成 len-K+1 即可。
```

### 3.4 ASCII 图解查询过程

```
arr = [3, 1, 4, 2, 3]
排序后 = [1, 2, 3, 3, 4]
对应的值域版本:

root[0]: root[1]: root[2]: root[3]: root[4]: root[5]:
 count=0  count=1  count=2  count=3  count=4  count=5
           值=3     值=1,3   值=1,3,4  值=1,2,3,4 值=1,2,3,3,4

查询 L=2, R=5, K=2 第 K 小(K=2,就是值 2)

在 root[5] - root[1] 上查询:
根节点 [1,4]:   左子树 3 个(值 1,2,3 中有 3 个) → 右子树 1 个(值 4)
找第 2 个:
  左子树 3 个 ≥ 2,往左走
中间节点 [1,2]: 左子树 2 个(值 1,2) → 右子树 0 个
找第 2 个:
  左子树 2 个 ≥ 2,往左走
叶子节点 [1,1]: 1 个(值 1)
找第 2 个:
  左子树 1 个 < 2,改在右子树找第 (2-1)=1 个
叶子节点 [2,2]: 1 个(值 2)
找到!值 = 2 ✅
```

### 3.5 复杂度分析

- **建树**:N 个版本,每个版本创建 O(log N) 个新节点 → 总节点数 O(N log N),时间 O(N log N)
- **查询**:从根往下走,O(log S) = O(log N) 层 → 时间 O(log N)
- **空间**:O(N log N) 个节点,每个节点 O(1) 空间 → O(N log N) 内存

N = 10^5 时,N log N ≈ 1.7 × 10^6,内存完全能接受。

## 4. 应用二:可持久化数组(回到历史版本)

```typescript
/**
 * 可持久化数组 —— 支持「创建某个历史版本 + 在某个历史版本基础上修改」
 * 这是函数式编程里的「Persistent Data Structure」概念
 */
class PersistentArray {
  private roots: number[] = [];     // 每个版本的根节点 ID
  private left: number[] = [];      // left[i] = 节点 i 的左孩子
  private right: number[] = [];     // right[i] = 节点 i 的右孩子
  private values: number[] = [];    // values[i] = 节点 i 存的值(叶子节点)
  private nodeCount = 0;            // 已创建的节点数(0 号节点当 null)

  constructor(initial: number[]) {
    this.roots.push(0); // 版本 0:空树(根节点是 null)

    // 从空版本开始,逐步 build 出初始数组的版本 1
    let root = 0;
    for (let i = 0; i < initial.length; i++) {
      root = this.update(root, i, initial[i], 0, initial.length - 1);
    }
    this.roots.push(root);
  }

  /**
   * 在 version 版本上,把 array[idx] 改成 val,返回新版本
   * 为什么返回新根:新版本和老版本从此分道扬镳
   */
  update(version: number, idx: number, val: number, l: number, r: number): number {
    const newNode = ++this.nodeCount;

    if (l === r) {
      // 叶子节点:直接存值
      this.left[newNode] = 0;
      this.right[newNode] = 0;
      this.values[newNode] = val;
      return newNode;
    }

    const mid = (l + r) >> 1;
    if (idx <= mid) {
      // 改左子树:左孩子是新节点,右孩子复用老版本的右孩子
      const newLeft = this.update(this.left[version], idx, val, l, mid);
      this.left[newNode] = newLeft;
      this.right[newNode] = this.right[version];
    } else {
      // 改右子树:左孩子复用,右孩子是新节点
      const newLeft = this.left[version];
      const newRight = this.update(this.right[version], idx, val, mid + 1, r);
      this.left[newNode] = newLeft;
      this.right[newNode] = newRight;
    }
    this.values[newNode] = 0; // 非叶子节点不存值
    return newNode;
  }

  /**
   * 在 version 版本上,查询 array[idx]
   */
  query(version: number, idx: number, l: number, r: number): number {
    if (l === r) return this.values[version];
    const mid = (l + r) >> 1;
    if (idx <= mid) {
      return this.query(this.left[version], idx, l, mid);
    } else {
      return this.query(this.right[version], idx, mid + 1, r);
    }
  }

  /** 公开 API:创建新版本 */
  set(version: number, idx: number, val: number, n: number): number {
    const newRoot = this.update(version, idx, val, 0, n - 1);
    this.roots.push(newRoot);
    return this.roots.length - 1; // 新版本号
  }

  /** 公开 API:读取某个版本 */
  get(version: number, idx: number, n: number): number {
    return this.query(this.roots[version], idx, 0, n - 1);
  }
}
```

## 5. 应用三:可持久化并查集(进阶)

并查集本身不能持久化(因为路径压缩会改老节点),但**按秩合并 + 不路径压缩**的并查集,可以做成可持久化:

```typescript
/**
 * 可持久化并查集 —— 用于「带时间维度的连通性问题」
 * 例:给你 N 个节点和 M 条边,edges[i] = [u, v, time],
 *     多次查询「在 time ≤ T 时,u 和 v 是否连通」
 */
class PersistentDSU {
  private parent: number[] = [0];    // parent[i] = 节点 i 的父亲
  private rank: number[] = [0];     // rank[i] = 节点 i 的秩
  private roots: number[][] = [];   // roots[t] = 第 t 条边加入后的根节点信息

  constructor(n: number) {
    // 初始化 N 个节点,每个节点的父亲是自己
    for (let i = 1; i <= n; i++) {
      this.parent.push(i);
      this.rank.push(1);
    }
    this.roots.push([...this.parent]); // 保存一份副本作为初始版本
  }

  /**
   * 在 version 版本上合并 u 和 v,返回新版本的根节点数组
   */
  merge(version: number[], u: number, v: number): number[] {
    const parent = [...version]; // 拷贝一份新版本
    const rank = [...this.rank];

    const rootU = this.findRoot(parent, u);
    const rootV = this.findRoot(parent, v);
    if (rootU === rootV) return parent;

    // 按秩合并
    if (rank[rootU] < rank[rootV]) {
      parent[rootU] = rootV;
    } else if (rank[rootU] > rank[rootV]) {
      parent[rootV] = rootU;
    } else {
      parent[rootV] = rootU;
      rank[rootU]++;
    }

    this.rank = rank;
    return parent;
  }

  private findRoot(parent: number[], x: number): number {
    // 注意:这里不用路径压缩!路径压缩会破坏持久化
    // 只用 while 一直向上找根
    while (parent[x] !== x) {
      x = parent[x];
    }
    return x;
  }
}
```

## 6. 代码实现:静态区间第 K 大(完整版)

### 6.1 TypeScript

```typescript
/**
 * 静态区间第 K 小(可持久化线段树 / 主席树)
 * 经典问题:给定数组,多次查询 [L, R] 内第 K 小的数
 *
 * 为什么用主席树:
 *   朴素做法每次排序 O(N log N),整体 O(MN log N),N=10^5 时必 TLE
 *   主席树通过「前缀版本 + 差分」,把每次查询降到 O(log N)
 */
class PersistentSegTree {
  private left: number[] = [];    // left[i] = 节点 i 的左孩子 ID
  private right: number[] = [];   // right[i] = 节点 i 的右孩子 ID
  private count: number[] = [];   // count[i] = 节点 i 表示的区间内有多少个元素
  private roots: number[] = [];   // roots[i] = 前 i 个元素的线段树版本根节点
  private nodeCnt = 0;            // 已创建的节点数(0 当 null)

  constructor(arr: number[]) {
    // 第一步:离散化,把元素压缩到 [1, N]
    const sorted = [...new Set(arr)].sort((a, b) => a - b);
    const rank = new Map<number, number>();
    sorted.forEach((v, i) => rank.set(v, i + 1));

    // 第二步:构建 N 个版本
    this.roots.push(0); // 版本 0 是空树
    let curRoot = 0;
    for (let i = 0; i < arr.length; i++) {
      const r = rank.get(arr[i])!;
      curRoot = this.update(curRoot, r, 1, 1, sorted.length);
      this.roots.push(curRoot);
    }
  }

  /**
   * 从 version 版本创建新版本,把 [pos] 单值）点的 count 加 delta
   * 为什么是返回新节点而不是修改原节点:不能破坏老版本
   */
  private update(version: number, pos: number, delta: number, l: number, r: number): number {
    const newNode = ++this.nodeCnt;
    if (l === r) {
      // 叶子节点,直接存 count
      this.left[newNode] = 0;
      this.right[newNode] = 0;
      this.count[newNode] = this.count[version] + delta;
      return newNode;
    }

    const mid = (l + r) >> 1;
    if (pos <= mid) {
      // 路径在左子树:创建新左孩子,右孩子复用
      const newLeft = this.update(this.left[version], pos, delta, l, mid);
      this.left[newNode] = newLeft;
      this.right[newNode] = this.right[version];
    } else {
      // 路径在右子树:左孩子复用,创建新右孩子
      const newLeft = this.left[version];
      const newRight = this.update(this.right[version], pos, delta, mid + 1, r);
      this.left[newNode] = newLeft;
      this.right[newNode] = newRight;
    }
    // 新节点的 count = 孩子 count 之和(因为只改了路径上的一边)
    this.count[newNode] =
      this.count[this.left[newNode]] + this.count[this.right[newNode]];
    return newNode;
  }

  /**
   * 在 [1, R] - [1, L-1] 的版本差上,查询第 K 小
   * 为什么传两个版本:差分 = 两个版本对应节点 count 相减
   */
  queryKth(L: number, R: number, K: number, l: number, r: number): number {
    const leftRootR = this.left[this.roots[R]];
    const leftRootL = this.left[this.roots[L - 1]];
    return this.queryKthHelper(this.roots[R], this.roots[L - 1], K, l, r);
  }

  private queryKthHelper(
    rootR: number,
    rootL: number,
    K: number,
    l: number,
    r: number,
  ): number {
    if (l === r) return l; // 找到叶子节点,值就是离散化后的排名
    const mid = (l + r) >> 1;

    // 关键:左子树的差值 = R 版本的左子树 count - L-1 版本的左子树 count
    const leftCount = this.count[this.left[rootR]] - this.count[this.left[rootL]];

    if (K <= leftCount) {
      // 第 K 个在左子树
      return this.queryKthHelper(this.left[rootR], this.left[rootL], K, l, mid);
    } else {
      // 第 K 个在右子树
      return this.queryKthHelper(
        this.right[rootR],
        this.right[rootL],
        K - leftCount,
        mid + 1,
        r,
      );
    }
  }

  /** 反离散化:把排名转回原始值 */
  static getOriginalValue(rank: number, sortedArr: number[]): number {
    return sortedArr[rank - 1];
  }
}

// === 使用示例 ===
const arr = [3, 1, 4, 2, 3];
const sortedArr = [...new Set(arr)].sort((a, b) => a - b);
const pst = new PersistentSegTree(arr);

console.log(pst.queryKth(2, 5, 1, 1, sortedArr.length)); // 1
console.log(pst.queryKth(2, 5, 2, 1, sortedArr.length)); // 2
console.log(pst.queryKth(2, 5, 3, 1, sortedArr.length)); // 3
console.log(pst.queryKth(1, 5, 3, 1, sortedArr.length)); // 3
```

### 6.2 Go

```go
package main

import "sort"

// PersistentSegTree 可持久化线段树(主席树),用于静态区间第 K 小
type PersistentSegTree struct {
	left  []int // left[i] = 节点 i 的左孩子
	right []int // right[i] = 节点 i 的右孩子
	count []int // count[i] = 节点 i 区间内的元素个数
	roots []int // roots[i] = 前 i 个元素的版本根节点
	nodes int    // 已创建的节点总数
}

// NewPersistentSegTree 构造主席树
// arr:原始数组
// 返回值:已经构建好的主席树
func NewPersistentSegTree(arr []int) *PersistentSegTree {
	// 离散化:把元素压缩到 [1, N]
	sorted := make([]int, len(arr))
	copy(sorted, arr)
	sort.Ints(sorted)
	uniqueSorted := sorted[:1]
	for i := 1; i < len(sorted); i++ {
		if sorted[i] != sorted[i-1] {
			uniqueSorted = append(uniqueSorted, sorted[i])
		}
	}

	rank := make(map[int]int, len(uniqueSorted))
	for i, v := range uniqueSorted {
		rank[v] = i + 1
	}

	pst := &PersistentSegTree{
		left:  []int{0},
		right: []int{0},
		count: []int{0},
		roots: []int{0},
	}

	curRoot := 0
	for _, v := range arr {
		r := rank[v]
		curRoot = pst.update(curRoot, r, 1, 1, len(uniqueSorted))
		pst.roots = append(pst.roots, curRoot)
	}

	return pst
}

// update 从 version 版本出发,创建新版本,在 pos 位置 count += delta
func (pst *PersistentSegTree) update(version, pos, delta, l, r int) int {
	newNode := pst.newNode()
	if l == r {
		// 叶子节点
		pst.left[newNode] = 0
		pst.right[newNode] = 0
		pst.count[newNode] = pst.count[version] + delta
		return newNode
	}

	mid := (l + r) >> 1
	if pos <= mid {
		newLeft := pst.update(pst.left[version], pos, delta, l, mid)
		pst.left[newNode] = newLeft
		pst.right[newNode] = pst.right[version]
	} else {
		newLeft := pst.left[version]
		newRight := pst.update(pst.right[version], pos, delta, mid+1, r)
		pst.left[newNode] = newLeft
		pst.right[newNode] = newRight
	}
	pst.count[newNode] = pst.left[newNode] + 1 // 占位,实际下面会覆盖
	pst.count[newNode] = pst.count[pst.left[newNode]] + pst.count[pst.right[newNode]]
	return newNode
}

// newNode 创建一个新节点,返回节点 ID
func (pst *PersistentSegTree) newNode() int {
	pst.nodes++
	pst.left = append(pst.left, 0)
	pst.right = append(pst.right, 0)
	pst.count = append(pst.count, 0)
	return pst.nodes
}

// QueryKth 查询 [L, R] 内第 K 小的数(返回离散化后的排名)
func (pst *PersistentSegTree) QueryKth(L, R, K, l, r int) int {
	if l == r {
		return l
	}
	mid := (l + r) >> 1
	// 关键:左子树差值 = R 版本左子树 - L-1 版本左子树
	leftCount := pst.count[pst.left[pst.roots[R]]] - pst.count[pst.left[pst.roots[L-1]]]
	if K <= leftCount {
		return pst.queryKthHelper(
			pst.left[pst.roots[R]],
			pst.left[pst.roots[L-1]],
			K, l, mid,
		)
	}
	return pst.queryKthHelper(
		pst.right[pst.roots[R]],
		pst.right[pst.roots[L-1]],
		K-leftCount, mid+1, r,
	)
}

func (pst *PersistentSegTree) queryKthHelper(rootR, rootL, K, l, r int) int {
	if l == r {
		return l
	}
	mid := (l + r) >> 1
	leftCount := pst.count[pst.left[rootR]] - pst.count[pst.left[rootL]]
	if K <= leftCount {
		return pst.queryKthHelper(pst.left[rootR], pst.left[rootL], K, l, mid)
	}
	return pst.queryKthHelper(pst.right[rootR], pst.right[rootL], K-leftCount, mid+1, r)
}
```

### 6.3 Python

```python
class PersistentSegTree:
    """可持久化线段树(主席树),用于静态区间第 K 小"""

    def __init__(self, arr: list[int]):
        # 离散化
        sorted_unique = sorted(set(arr))
        rank = {v: i + 1 for i, v in enumerate(sorted_unique)}

        # 节点存储:left[i], right[i], count[i]
        self.left = [0]
        self.right = [0]
        self.count = [0]
        self.roots = [0]  # roots[i] = 前 i 个元素的版本根
        self.n = len(sorted_unique)

        # 逐个版本构建
        cur_root = 0
        for v in arr:
            r = rank[v]
            cur_root = self._update(cur_root, r, 1, 1, self.n)
            self.roots.append(cur_root)

        self.sorted_unique = sorted_unique

    def _new_node(self) -> int:
        """创建新节点,返回节点 ID"""
        self.left.append(0)
        self.right.append(0)
        self.count.append(0)
        return len(self.count) - 1

    def _update(self, version: int, pos: int, delta: int, l: int, r: int) -> int:
        """从 version 版本创建新版本,在 pos 位置 count += delta"""
        new_node = self._new_node()
        if l == r:
            self.count[new_node] = self.count[version] + delta
            return new_node

        mid = (l + r) >> 1
        if pos <= mid:
            new_left = self._update(self.left[version], pos, delta, l, mid)
            self.left[new_node] = new_left
            self.right[new_node] = self.right[version]
        else:
            self.left[new_node] = self.left[version]
            new_right = self._update(self.right[version], pos, delta, mid + 1, r)
            self.right[new_node] = new_right

        self.count[new_node] = self.count[self.left[new_node]] + self.count[self.right[new_node]]
        return new_node

    def query_kth(self, L: int, R: int, K: int) -> int:
        """查询 [L, R] 内第 K 小的数,返回原始值"""
        rank = self._query_kth_helper(
            self.roots[R], self.roots[L - 1], K, 1, self.n
        )
        return self.sorted_unique[rank - 1]

    def _query_kth_helper(self, root_R: int, root_L: int, K: int, l: int, r: int) -> int:
        """在 root_R - root_L 的版本差上找第 K 小"""
        if l == r:
            return l
        mid = (l + r) >> 1
        # 关键:左子树差值
        left_count = self.count[self.left[root_R]] - self.count[self.left[root_L]]
        if K <= left_count:
            return self._query_kth_helper(
                self.left[root_R], self.left[root_L], K, l, mid
            )
        return self._query_kth_helper(
            self.right[root_R], self.right[root_L], K - left_count, mid + 1, r
        )


# 使用示例
arr = [3, 1, 4, 2, 3]
pst = PersistentSegTree(arr)
print(pst.query_kth(2, 5, 1))  # 1
print(pst.query_kth(2, 5, 2))  # 2
print(pst.query_kth(2, 5, 3))  # 3
print(pst.query_kth(1, 5, 4))  # 4
```

## 7. 业务场景

### 7.1 数据库的 MVCC(多版本并发控制)

你以为主席树只是 OI 选手的工具?其实 MySQL、PostgreSQL 的 **MVCC 机制** 就是它最重要的工业应用!

数据库的 undo log 会保留每一行数据的「历史版本」(比如某个 ID 的值在 t1 时刻是 100,在 t2 时刻被改成 200,undo log 会保留 100 这份数据)。当事务做 snapshot read 时,会根据当前事务的快照时间点,找到那个时间点应该看到的数据版本。

这跟主席树的「路径复制 + 多版本共享」思路一模一样:

- 新版本只创建路径上的新节点 → 写时复制(Copy-on-Write)
- 老版本完全保留 → 历史快照随时可查
- 多个版本共享大量节点 → 内存不会爆炸

像 `git` 的 commit 树、CouchDB 的文档历史、Linux 内核的 `COW` 机制(写时复制),都是同一个思想的不同变体。

### 7.2 编辑器的 Undo/Redo

你用 VSCode 编辑文件时,Ctrl+Z 能回到任意历史版本。每次编辑不是直接覆盖原文件,而是创建一个新版本。撤销操作 = 切换到上一个版本。这种「事件溯源(Event Sourcing)」模式,在金融系统、协作编辑工具(Figma、Google Docs)里广泛使用。

### 7.3 函数式编程的不可变数据结构

Clojure、Scala、Haskell 等语言里的 `PersistentVector`、`PersistentMap`,底层用的就是「路径复制」的胖树(Fat Node 或 Hash Array Mapped Trie)。每次「修改」返回的是新对象,老对象完全不变。这样天然支持:

- 时间旅行调试(time-travel debugging)
- 乐观并发控制(无锁并发数据结构)
- 函数式编程的引用透明性

### 7.4 离线算法题

OJ 上凡是带「时间戳」「历史版本」「区间查询」的离线问题,主席树大概率是正解。比如:

- **静态区间第 K 大/小**(本文主题)
- **树上路径第 K 大**:用「树链前缀差分」+ 主席树
- **区间 ≤ K 的数有多少**:用「在线主席树 + 二分」处理动态插入

## 8. 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
| ---- | --------- | --------- |
| 单次修改(创建新版本) | O(log N) | O(log N) 新节点 |
| 建 N 个版本 | O(N log N) | O(N log N) 总节点 |
| 单次查询(第 K 小) | O(log N) | O(1) |
| N 次查询 | O(N log N) | 不增加额外空间 |

**为什么空间是 O(N log N) 而不是 O(N²)?**

每次修改新建 O(log N) 个节点,N 次修改就是 N × O(log N)。如果建 N 棵独立线段树,每棵 O(N),总共 O(N²)。可持久化线段树通过共享非路径节点,避免了重复创建,所以是 O(N log N)。N=10^5 时,N log N ≈ 1.7 × 10^6,大约几十 MB,完全可接受。

## 9. 常见误区 & 调试技巧

### 9.1 误区 1:以为「可持久化 = 全树拷贝」

```
错!全树拷贝 = O(N) 空间 / 每次修改 → 跟建 N 棵独立线段树没区别
对!只拷贝路径 = O(log N) 空间 / 每次修改 → 才是真主席树
```

### 9.2 误区 2:把 left/right 用「下标」而不是「节点引用」导致共享丢失

如果你的数据结构是「左孩子是数组下标,右孩子也是数组下标」,那直接修改父节点的 left 是没问题的(因为父节点没改)。但要小心:**绝对不能 in-place 修改老节点**——你改了老节点,所有引用它的版本都被污染了。

### 9.3 调试技巧:画出版本树

调试时,把每个版本的根节点和它依赖的节点用 ASCII 画出来,直观看出哪些节点被共享了:

```
root[0] → n1 (空)
root[1] → n2 ─┐
             ├─ n3 → n4 (叶子 count=1)
root[2] → n5 ─┘
             ├─ n6 → n4 (复用!) count=1
             ├─ n7 → n8 (叶子 count=1)
```

### 9.4 性能优化:用数组而不是对象存节点

实际比赛中,千万**不要**用对象存节点。对象有指针、内存分散、cache miss 严重。用三个全局数组 `left[]`、`right[]`、`count[]`,节点 ID 就是数组下标,内存连续、访问快、cache 友好。Node 对象只在教学示例里看着好看。

## 10. 小结

可持久化线段树的核心就一句话:**修改时只复制路径上的节点,其他节点共享**。

- 🌳 **结构上**:每棵版本树是「老版本」+「路径上的新节点」,新旧版本共享大部分节点
- 🔍 **查询上**:「版本差」天然解决「前缀/区间」类问题(因为线段树本来就擅长区间)
- 💾 **空间上**:O(N log N) 而不是 O(N²),N=10^5 时完全可接受
- 🏭 **工业上**:COW、MVCC、undo log、不可变数据结构,都是同一个思想

如果一句话总结:**线段树 + 函数式不可变 = 主席树**。

它不只是一个算法模板,更是一种思维方式:**当问题涉及「历史版本」「时间维度」「不可变性」时,想想能不能用可持久化**。