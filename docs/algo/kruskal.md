---
title: Kruskal 最小生成树算法
description: Kruskal 最小生成树算法（Kruskal's MST）—— 贪心 + 并查集的经典组合拳
date: 2026-06-20 09:00:00
categories:
  - Algorithm
tags:
  - kruskal
  - minimum-spanning-tree
  - greedy-algorithm
  - union-find
  - graph
sidebarSort: 49
---

# Kruskal 最小生成树算法（Kruskal's MST）

想象一下：你是一个城市的网络工程师，需要在 6 个小区之间铺设光纤。每两个小区之间都可以直连，但铺设费用各不相同。你的任务是：**让所有小区都互相连通，同时总花费最少**。

```
小区拓扑图：

        2
   A ------- B
   |\      /|
   | \4  8/ |
  3|  \  /  |5
   |   \/   |
   |   /\   |
   |  /  \  |
   | /6   \ |
   |/      \|
   C ------- D
       7

每条边上的数字 = 铺设光纤的费用（万元）
```

直觉告诉我们：**优先选便宜的边**。但如果选了便宜的边会形成环呢？那就跳过它，选下一条。这个直觉，恰好就是 Kruskal 算法的核心思想 —— 一个纯粹的**贪心策略**。

## 什么是最小生成树（MST）？

在开始之前，先明确几个概念：

```
给定一个连通的、无向的、加权图 G = (V, E)：

- 生成树（Spanning Tree）：包含图中所有顶点的一棵树（即 V-1 条边，无环，连通）
- 最小生成树（MST）：所有生成树中，边权之和最小的那棵

注意：
- 一个图可能有多棵 MST（如果有多条边权重相同的话）
- MST 只对连通图有意义；对于非连通图，可以求"最小生成森林"
```

## 原理拆解

### 核心思想

Kruskal 算法的策略非常简单粗暴：

```
1. 把所有边按权重从小到大排序
2. 从小到大依次考虑每条边：
   a. 如果这条边的两个端点还不连通 → 选它，加入 MST
   b. 如果已经连通 → 跳过（否则会形成环）
3. 重复，直到选了 V-1 条边
```

为什么这样能得到 MST？因为这是贪心的——**每一步都选当前最优（最短的边）**，而且选了不会影响后面的选择（只要不形成环）。

### 用图来走一遍

```
原始图：所有边列出来

边列表：(A-B, 2), (A-C, 3), (A-D, 4), (C-D, 6), (B-D, 5), (B-C, 8)

排序后：(A-B, 2), (A-C, 3), (A-D, 4), (B-D, 5), (C-D, 6), (B-C, 8)

第 1 步：考虑 (A-B, 2)
  A 和 B 连通吗？不连通 → 选它！
  MST 边集：{(A-B, 2)}  总费用：2

第 2 步：考虑 (A-C, 3)
  A 和 C 连通吗？不连通 → 选它！
  MST 边集：{(A-B, 2), (A-C, 3)}  总费用：5

第 3 步：考虑 (A-D, 4)
  A 和 D 连通吗？不连通 → 选它！
  MST 边集：{(A-B, 2), (A-C, 3), (A-D, 4)}  总费用：9
  → 已选 V-1 = 3 条边，算法结束！

最终 MST：
        2
   A ------- B
   |
  3|
   |
   C      D
         /
   4    /
     A-D

总费用 = 2 + 3 + 4 = 9 ✅

跳过的边：(B-D, 5)——会和 A-B、A-D 形成环
         (C-D, 6)——A 和 D 已连通
         (B-C, 8)——B 和 C 已连通
```

### 关键问题：怎么快速判断"两个点是否连通"？

如果每次都要遍历整个图来判断连通性，效率太低了。这里就需要请出我们之前讲过的**并查集（Union-Find）** 了！

```
并查集的核心操作：

find(x)    → 找到 x 所在集合的"代表"（根节点）
union(x,y) → 把 x 和 y 所在的两个集合合并成一个

如果 find(x) == find(y) → x 和 y 在同一个集合 → 已经连通
如果 find(x) != find(y) → x 和 y 不连通 → 可以合并
```

把 Kruskal 和并查集结合起来：

```
初始状态：每个节点都是独立的集合

并查集：{A} {B} {C} {D}

考虑 (A-B, 2)：find(A) != find(B) → union(A, B)
并查集：{A, B} {C} {D}

考虑 (A-C, 3)：find(A) != find(C) → union(A, C)
并查集：{A, B, C} {D}

考虑 (A-D, 4)：find(A) != find(D) → union(A, D)
并查集：{A, B, C, D}  ← 全部连通，完成！

考虑 (B-D, 5)：find(B) == find(D)（都在同一个集合）→ 跳过！
考虑 (C-D, 6)：find(C) == find(D) → 跳过！
考虑 (B-C, 8)：find(B) == find(C) → 跳过！
```

有了带路径压缩和按秩合并的并查集，`find` 和 `union` 的均摊时间复杂度几乎是 O(1)（准确说是 O(α(n))，α 是反阿克曼函数，增长极慢，可以认为是常数）。

## 代码实现

### TypeScript 实现

```typescript
/**
 * 并查集 —— 路径压缩 + 按秩合并
 */
class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(n: number) {
    // 初始时，每个节点的父亲是自己
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  /** 查找根节点，同时做路径压缩 */
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // 路径压缩
    }
    return this.parent[x];
  }

  /** 按秩合并，返回是否真的合并了 */
  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false; // 已经在同一集合

    // 按秩合并：矮树挂到高树下面
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}

interface Edge {
  u: number;
  v: number;
  weight: number;
}

/**
 * Kruskal 最小生成树算法
 * @param n     节点数（0 ~ n-1）
 * @param edges 边列表
 * @returns     MST 的边列表和总权重
 */
function kruskal(
  n: number,
  edges: Edge[],
): { mst: Edge[]; totalWeight: number } {
  // 第 1 步：按权重排序
  edges.sort((a, b) => a.weight - b.weight);

  const uf = new UnionFind(n);
  const mst: Edge[] = [];
  let totalWeight = 0;

  // 第 2 步：依次考虑每条边
  for (const edge of edges) {
    // 如果两个端点不在同一集合 → 选它
    if (uf.union(edge.u, edge.v)) {
      mst.push(edge);
      totalWeight += edge.weight;
      // 已选 V-1 条边，MST 完成
      if (mst.length === n - 1) break;
    }
  }

  return { mst, totalWeight };
}

// ---- 使用示例 ----
// 用 0~3 分别代表 A, B, C, D
const edges: Edge[] = [
  { u: 0, v: 1, weight: 2 }, // A-B
  { u: 0, v: 2, weight: 3 }, // A-C
  { u: 0, v: 3, weight: 4 }, // A-D
  { u: 1, v: 3, weight: 5 }, // B-D
  { u: 2, v: 3, weight: 6 }, // C-D
  { u: 1, v: 2, weight: 8 }, // B-C
];

const result = kruskal(4, edges);
console.log("MST 边：");
for (const e of result.mst) {
  console.log(`  ${e.u} - ${e.v} : ${e.weight}`);
}
console.log(`总权重：${result.totalWeight}`);

// 输出：
// MST 边：
//   0 - 1 : 2
//   0 - 2 : 3
//   0 - 3 : 4
// 总权重：9
```

## 复杂度分析

```
Kruskal 算法复杂度：

┌──────────────┬────────────────────────────────────┐
│ 操作         │ 复杂度                             │
├──────────────┼────────────────────────────────────┤
│ 边排序       │ O(E log E)                         │
│ 遍历所有边   │ O(E) 次 find/union 操作            │
│ find/union   │ 每次 O(α(V)) ≈ O(1)              │
├──────────────┼────────────────────────────────────┤
│ 总复杂度     │ O(E log E) ← 排序是瓶颈           │
└──────────────┴────────────────────────────────────┘

其中：V = 顶点数，E = 边数，α 是反阿克曼函数

注意：如果用邻接矩阵存储，E = V²，那排序就是 O(V² log V)。
对于稠密图（边很多），Prim 算法可能更优。
```

## LeetCode 实战

### LeetCode 1584. 连接所有点的最小费用（Min Cost to Connect All Points）

> 给你一个 points 数组，其中 `points[i] = [xi, yi]` 表示第 i 个点的坐标。
> 两点之间的距离是曼哈顿距离 `|xi - xj| + |yi - yj|`。
> 求连接所有点的最小总费用。

```typescript
function minCostConnectPoints(points: number[][]): number {
  const n = points.length;
  const edges: Edge[] = [];

  // 生成所有可能的边
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist =
        Math.abs(points[i][0] - points[j][0]) +
        Math.abs(points[i][1] - points[j][1]);
      edges.push({ u: i, v: j, weight: dist });
    }
  }

  // 直接调用 Kruskal
  return kruskal(n, edges).totalWeight;
}

// 测试
console.log(
  minCostConnectPoints([[0, 0], [2, 2], [3, 10], [5, 2]])
);
// 输出：20
```

这道题就是 Kruskal 的标准应用，生成所有边 → 排序 → 贪心选取。
