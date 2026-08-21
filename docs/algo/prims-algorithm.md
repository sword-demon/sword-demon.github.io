---
title: Prim 算法
description: Prim 最小生成树算法——贪心策略下的切分定理详解
date: 2026-08-14 08:00:00
categories:
  - Algorithm
tags:
  - prim
  - minimum-spanning-tree
  - greedy-algorithm
  - union-find
  - graph
sidebarSort: 73
---

# Prim 最小生成树算法（Prim's MST）

上回我们聊了 Kruskal——那个"把所有边排个序，然后一根一根抽出来"的贪心算法。今天来讲它的好兄弟：**Prim 算法**。

两者都是求最小生成树（Minimum Spanning Tree，MST），但思路完全不一样：

- **Kruskal**：从边出发，始终选全局最便宜的可用边 —— 像是一个"不断扩张的森林"
- **Prim**：从点出发，始终选"已连接部分"和"未连接部分"之间最便宜的边 —— 像是一个"从种子节点向外生长的树"

听起来有点绕？别急，我们先从生活场景说起 👇

## 问题引入

你是一个城市规划师，需要在城市中铺设天然气管道，让所有居民区都能用上气。每两个居民区之间都可以铺设管道，但距离不同，费用也不同。怎么铺才能让总费用最低，同时保证所有居民区都连通？

```text
居民区分布：

        A ---(6)--- B
       /|          /|
    (1)|    (3)   |(2)
     /  |         | \
    C   |(5)      |  D
     \  |   (4)   | /
      \ |         |/
       X ---(2)--- Y

每个居民区是一个节点，每条边上的数字是铺设费用（万元）。
目标是让所有节点连通，同时总费用最少——这就是最小生成树问题。
```

同样的问题，我们既可以用 Kruskal 解决，也可以用 Prim 解决。今天的主角是 Prim。

## 原理拆解

### 核心思想：切分（Cut）

Prim 的理论基础是**切分定理（Cut Property）**：

> 任意选择一个切分（把图中的节点分成两部分），横跨这个切分的最小权边，一定属于某个最小生成树。

这个定理是 Kruskal 和 Prim 共同的理论基础。但两者的使用方式不同：

- **Kruskal**：每次在全局所有边中，找最小的、且不会形成环的边
- **Prim**：从某个起始点出发，每次把距离"已选节点集合"最近的未选节点拉进来

### 图解过程

```text
原始图：

        A ---(6)--- B
       /|          /|
    (1)|    (3)   |(2)
     /  |         | \
    C   |(5)      |  D
     \  |   (4)   | /
      \ |         |/
       X ---(2)--- Y

开始：任选节点 A 作为起始点。已选集合 = {A}

Step 1: 从 A 出发的边有：
  A-C (1), A-B (6)
  最便宜的是 A-C (1) → 把 C 加入已选集合
  已选 = {A, C}

Step 2: 从 {A, C} 出发的边有：
  A-B (6), A-X (5), C-X (4)
  最便宜的是 C-X (4) → 把 X 加入
  已选 = {A, C, X}

Step 3: 从 {A, C, X} 出发的边有：
  A-B (6), C-X 已在集合内, A-X 已在集合内,
  X-Y (2), X-D (5)
  最便宜的是 X-Y (2) → 把 Y 加入
  已选 = {A, C, X, Y}

Step 4: 从 {A, C, X, Y} 出发的边有：
  A-B (6), X-D (5), Y-B (2), Y-D (4)
  最便宜的是 Y-B (2) → 把 B 加入
  已选 = {A, C, X, Y, B}

Step 5: 从 {A, C, X, Y, B} 出发的边有：
  B-D (2), A-B 已在集合内
  最便宜的是 B-D (2) → 把 D 加入
  已选 = {A, C, X, Y, B, D}

完成！总费用 = 1 + 4 + 2 + 2 + 2 = 11（万元）

最小生成树：
        A ---(6)--- B
       /             |
    (1)|          (2)|
     /               |
    C               D
     \             /
      \---(4)--- X ---(2)--- Y
```

### 为什么用堆（Priority Queue）？

朴素实现：每次遍历所有边找最小，时间 O(V × E)。用**最小堆**优化：

1. 把起始节点的所有边加入堆
2. 每次弹出最小边，如果目标节点未访问，就加入生成树
3. 把新节点的所有边加入堆

这样每条边最多进堆一次、出堆一次，总时间 **O(E log E)**。

## 代码实现

### TypeScript

```typescript
/**
 * Prim 最小生成树算法 —— TypeScript 实现
 *
 * 图用邻接表存储：Map<节点编号, [邻居, 权重][]>
 * 使用最小堆（优先队列）优化
 */
class PrimMST {
  // 存储图结构
  private graph: Map<number, [number, number][]> = new Map();
  // 是否访问过
  private visited: Set<number> = new Set();
  // 结果：最小生成树的边
  private mstEdges: [number, number, number][] = [];

  addEdge(u: number, v: number, weight: number): void {
    if (!this.graph.has(u)) this.graph.set(u, []);
    if (!this.graph.has(v)) this.graph.set(v, []);
    this.graph.get(u)!.push([v, weight]);
    this.graph.get(v)!.push([u, weight]);
  }

  /**
   * Prim 算法核心
   * 时间复杂度：O(E log E) ≈ O(E log V)
   * 空间复杂度：O(V + E)
   */
  prim(start: number = 0): [number, number, number][] {
    this.visited.clear();
    this.mstEdges = [];

    // 最小堆：[权重, 起点, 终点]
    const pq: [number, number, number][] = [];
    this.visited.add(start);

    // 把起始节点的所有边加入堆
    for (const [v, w] of this.graph.get(start) || []) {
      pq.push([w, start, v]);
    }

    // 最小堆化
    pq.sort((a, b) => a[0] - b[0]);

    while (pq.length > 0 && this.visited.size < this.graph.size) {
      // 弹出最小边
      const [weight, u, v] = pq.shift()!;

      // 如果终点已经访问过，跳过
      if (this.visited.has(v)) continue;

      // 加入生成树
      this.visited.add(v);
      this.mstEdges.push([u, v, weight]);

      // 把新节点的所有边加入堆
      for (const [next, w] of this.graph.get(v) || []) {
        if (!this.visited.has(next)) {
          pq.push([w, v, next]);
        }
      }

      // 重新堆化（懒排序，实际工程可用真正的优先队列）
      pq.sort((a, b) => a[0] - b[0]);
    }

    return this.mstEdges;
  }

  /** 获取 MST 总权重 */
  getTotalWeight(): number {
    return this.mstEdges.reduce((sum, [, , w]) => sum + w, 0);
  }
}

// 使用示例
const prim = new PrimMST();
prim.addEdge(0, 1, 6); // A - B
prim.addEdge(0, 2, 1); // A - C
prim.addEdge(0, 3, 5); // A - X
prim.addEdge(2, 3, 4); // C - X
prim.addEdge(2, 4, 3); // C - D (实际上图中没有D，这里做演示)
prim.addEdge(3, 4, 2); // X - Y
prim.addEdge(1, 3, 2); // B - Y
prim.addEdge(1, 4, 5); // B - D
prim.addEdge(1, 5, 3); // B - E (如果有E)
prim.addEdge(4, 5, 4); // D - E

const mst = prim.prim(0);
console.log("MST 边：", mst);
console.log("总权重：", prim.getTotalWeight());
```

### Go

```go
package mst

import (
	"container/heap"
	"fmt"
)

// Edge 表示一条边
type Edge struct {
	To     int
	Weight int
}

// PrimMST Prim 算法实现
type PrimMST struct {
	graph map[int][]Edge
}

// New 创建 PrimMST 实例
func New() *PrimMST {
	return &PrimMST{
		graph: make(map[int][]Edge),
	}
}

// AddEdge 添加无向边
func (p *PrimMST) AddEdge(u, v, weight int) {
	p.graph[u] = append(p.graph[u], Edge{To: v, Weight: weight})
	p.graph[v] = append(p.graph[v], Edge{To: u, Weight: weight})
}

// Item 堆元素
type Item struct {
	weight int
	from   int
	to     int
}

// PriorityQueue 最小堆
type PriorityQueue []Item

func (pq PriorityQueue) Len() int            { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool  { return pq[i].weight < pq[j].weight }
func (pq PriorityQueue) Swap(i, j int)       { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PriorityQueue) Push(x any)          { *pq = append(*pq, x.(Item)) }
func (pq *PriorityQueue) Pop() any {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[:n-1]
	return item
}

// Prim 求最小生成树，返回边列表和总权重
func (p *PrimMST) Prim(start int) ([][3]int, int) {
	visited := make(map[int]bool)
	mstEdges := [][3]int{}

	pq := &PriorityQueue{}
	heap.Init(pq)

	visited[start] = true
	for _, edge := range p.graph[start] {
		heap.Push(pq, Item{weight: edge.Weight, from: start, to: edge.To})
	}

	for pq.Len() > 0 && len(visited) < len(p.graph) {
		item := heap.Pop(pq).(Item)
		if visited[item.to] {
			continue
		}

		visited[item.to] = true
		mstEdges = append(mstEdges, [3]int{item.from, item.to, item.weight})

		for _, edge := range p.graph[item.to] {
			if !visited[edge.To] {
				heap.Push(pq, Item{weight: edge.Weight, from: item.to, to: edge.To})
			}
		}
	}

	totalWeight := 0
	for _, edge := range mstEdges {
		totalWeight += edge[2]
	}

	return mstEdges, totalWeight
}
```

### Python

```python
import heapq
from collections import defaultdict
from typing import List, Tuple


class PrimMST:
    """Prim 最小生成树算法 —— Python 实现"""

    def __init__(self):
        self.graph: dict[int, List[Tuple[int, int]]] = defaultdict(list)

    def add_edge(self, u: int, v: int, weight: int) -> None:
        """添加无向边"""
        self.graph[u].append((v, weight))
        self.graph[v].append((u, weight))

    def prim(self, start: int = 0) -> Tuple[List[Tuple[int, int, int]], int]:
        """
        Prim 算法

        Returns:
            (mst_edges, total_weight): 边列表和总权重
        """
        if not self.graph:
            return [], 0

        visited = set()
        mst_edges = []
        total_weight = 0

        # 最小堆：[权重, 起点, 终点]
        pq: List[Tuple[int, int, int]] = []

        visited.add(start)
        for neighbor, weight in self.graph[start]:
            heapq.heappush(pq, (weight, start, neighbor))

        while pq and len(visited) < len(self.graph):
            weight, u, v = heapq.heappop(pq)

            if v in visited:
                continue

            visited.add(v)
            mst_edges.append((u, v, weight))
            total_weight += weight

            for neighbor, w in self.graph[v]:
                if neighbor not in visited:
                    heapq.heappush(pq, (w, v, neighbor))

        return mst_edges, total_weight


# 使用示例
if __name__ == "__main__":
    prim = PrimMST()

    # 添加边（无向图）
    edges = [
        (0, 1, 6),   # A - B
        (0, 2, 1),   # A - C
        (0, 3, 5),   # A - X
        (2, 3, 4),   # C - X
        (3, 4, 2),   # X - Y
        (1, 3, 2),   # B - Y
        (1, 4, 5),   # B - D
        (1, 5, 3),   # B - E
        (4, 5, 4),   # D - E
    ]

    for u, v, w in edges:
        prim.add_edge(u, v, w)

    mst, total = prim.prim(0)
    print("MST 边：", mst)
    print("总权重：", total)
```

### 邻接矩阵版本（适合密集图）

对于**稠密图**（边很多），可以用更简单的 O(V²) 朴素版本，不需要堆：

```typescript
/**
 * Prim 算法 —— 朴素版本
 * 适合稠密图，时间复杂度 O(V²)
 */
function primDense(n: number, edges: [number, number, number][]): number {
  // 构建邻接矩阵
  const dist: number[][] = Array.from({ length: n }, () =>
    Array(n).fill(Infinity)
  );
  for (const [u, v, w] of edges) {
    dist[u][v] = w;
    dist[v][u] = w;
  }

  const visited = new Array(n).fill(false);
  visited[0] = true;

  let totalWeight = 0;
  let edgeCount = 1;

  while (edgeCount < n) {
    let minWeight = Infinity;
    let nextNode = -1;

    // 在所有已访问节点和未访问节点之间，找最小边
    for (let i = 0; i < n; i++) {
      if (!visited[i]) continue;
      for (let j = 0; j < n; j++) {
        if (visited[j]) continue;
        if (dist[i][j] < minWeight) {
          minWeight = dist[i][j];
          nextNode = j;
        }
      }
    }

    if (nextNode === -1) {
      // 图不连通
      throw new Error("图不连通，无法生成最小生成树");
    }

    visited[nextNode] = true;
    totalWeight += minWeight;
    edgeCount++;
  }

  return totalWeight;
}
```

## Kruskal vs Prim：该怎么选？

```text
对比维度：

        Kruskal                          Prim
─────────────────────────────────────────────────────────
核心思想   每次选全局最便宜边               从某点出发，每次选最近的未连接点
数据结构   并查集 + 最小堆                  最小堆（优先队列）
适用场景   稀疏图（边少）                   稠密图（边多）
时间复杂度  O(E log E)                      O(E log V) 或 O(V²) 朴素版
空间复杂度  O(E)                            O(V + E)
```

```text
选择建议：

边数 E 远小于 V²（稀疏图）→ Kruskal 更高效
边数 E 接近 V²（稠密图）→ 朴素 Prim O(V²) 更简单高效
```

## 面试题精选

| 题号 | 题目 | 考察点 | 难度 |
| ---- | ---- | ------ | ---- |
| 1135 | Connecting Cities With Minimum Cost | Prim 标准模板 | 中等 |
| 1168 | Optimize Water Distribution in Buildings | Prim 变种 | 困难 |
| 261 | Graph Valid Tree | 判断是否为树（ MST 思想） | 中等 |
| 1489 | Find Critical and Pseudo-Critical Edges | MST + 删边判断 | 困难 |

## 实际应用

### 1. 网络基础设施规划

铺设光纤、燃气管道、公路网——这些都可以建模成 MST 问题。Prim 算法（或 Kruskal）帮你算出"如何连通所有节点，同时总成本最低"。城市规划、电网设计都离不开它。

### 2. 聚类分析（Clustering）

MST 可以用于层次聚类（Hierarchical Clustering）——删除 MST 中最长的 k-1 条边，就得到 k 个簇。这在图像分割、生物分类中都有应用。

### 3. 近似算法

旅行商问题（TSP）的启发式解法之一：先求 MST，再做欧拉遍历（近似比 2）。这里 MST 就是用 Prim 或 Kruskal 算的。

### 4. 电视网络分配

有线电视公司需要向多个社区铺设信号线。先用 MST 算出最低成本的主干网络，然后根据各社区需求追加分支线。

## 复杂度分析

| 版本 | 时间复杂度 | 空间复杂度 | 适用场景 |
| ---- | ---------- | ---------- | -------- |
| 朴素版 | O(V²) | O(V²) | 稠密图 |
| 堆优化版 | O(E log V) | O(V + E) | 稀疏图 |
| 斐波那契堆版 | O(E + V log V) | O(V + E) | 理论最优 |

> 注：实际工程中用普通最小堆就够了，斐波那契堆的常数因子太大，意义有限。

## 小结

Prim 算法的核心就一句话：**从一个点出发，始终选离"已选集合"最近的那个点**。

这个"最近"由切分定理保证——每次选的边一定是某个 MST 的组成部分，最终一定能构造出最小生成树。

两种实现方式：

- **稀疏图**：用最小堆，O(E log V)
- **稠密图**：用邻接矩阵 + 朴素选择，O(V²) 更简单

记住 Kruskal 和 Prim 的核心区别：
- **Kruskal**：边贪心——"哪条全局最便宜？"
- **Prim**：点贪心——"哪个点离当前树最近？"

两个算法的灵魂都是**切分定理**，只是使用姿势不同 🎯
