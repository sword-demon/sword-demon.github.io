---
title: Dijkstra 最短路径算法
description: Dijkstra 最短路径算法——从导航地图到网络路由，贪心思想的经典应用
date: 2026-05-30 09:00:00
categories:
  - Algorithm
tags:
  - dijkstra
  - shortest-path
  - graph
  - greedy-algorithm
sidebarSort: 33
---

# Dijkstra 最短路径算法

你打开高德地图，输入"公司"，它瞬间就给你规划了一条"最快到达"的路线。你有没有想过，它是怎么在几百万条道路里找到那条最优路线的？

这就是**最短路径问题**，而 Dijkstra（迪杰斯特拉）算法就是解决它的经典方案之一。

## 为什么需要最短路径？

想象你是一个快递小哥，城市里有很多条路可以走，每条路的通行时间不同。你要从仓库送一份快递到客户手里，怎么走最快？

```
        5         2
  A --------→ B --------→ D
  |                         ↑
  | 3         4       1    |
  ↓         ↓              |
  C ------→ E ------------→┘
```

从 A 到 D：
- 路线 1：A → B → D，耗时 5 + 2 = 7 分钟
- 路线 2：A → C → E → D，耗时 3 + 4 + 1 = 8 分钟
- 路线 3：A → B → E → D，耗时 5 + 4 + 1 = 10 分钟

最短路径是 A → B → D，7 分钟。但如果是更复杂的城市路网呢？几千个节点、几万条边，靠人脑枚举是不现实的。Dijkstra 算法就是用来**自动化**这个过程的。

## 原理拆解

### 核心思想：贪心

Dijkstra 的策略非常直觉：**每次都走当前能到达的"最近"的那个点，然后从这个点出发去探索更多可能性。**

就像你站在一个陌生城市的十字路口，先看看眼前有哪几条路，选一条最近的走。到了那个路口再看，又选最近的。一直走到目的地。

但有个前提条件很重要：**所有边的权重必须非负**。如果允许负权边，贪心策略就不成立了——后面可能出现一条"绕远路但有个负权折扣"的更短路径。

### 详细步骤

用一个例子来走一遍：

```
        10
  (0) --------→ (1)
   |              ↑  ↘
   | 3            | 1   2
   |              |      ↓
   ↓     4     5 ↓     (3)
  (2) ------→ (4) ------→ ↑
   |                       |
   └───────────────────────┘
            6

节点：0, 1, 2, 3, 4
起点：0
```

**初始状态**：从节点 0 出发

```
dist[0] = 0   （起点到自己距离为 0）
dist[1] = ∞
dist[2] = ∞
dist[3] = ∞
dist[4] = ∞

已访问集合：{}
```

**第 1 轮**：从所有未访问节点中，选 dist 最小的 → 节点 0（dist=0）

- 从节点 0 出发，更新邻居：
  - 0 → 1：dist[1] = min(∞, 0 + 10) = 10
  - 0 → 2：dist[2] = min(∞, 0 + 3) = 3
- 标记节点 0 为已访问

```
dist: [0, 10, 3, ∞, ∞]   已访问：{0}
```

**第 2 轮**：未访问中 dist 最小 → 节点 2（dist=3）

- 从节点 2 出发，更新邻居：
  - 2 → 4：dist[4] = min(∞, 3 + 4) = 7
  - 2 → 3：dist[3] = min(∞, 3 + 6) = 9
- 标记节点 2 为已访问

```
dist: [0, 10, 3, 9, 7]   已访问：{0, 2}
```

**第 3 轮**：未访问中 dist 最小 → 节点 4（dist=7）

- 从节点 4 出发，更新邻居：
  - 4 → 3：dist[3] = min(9, 7 + 5) = 9（没变，7+5=12 > 9）
  - 4 → 1：dist[1] = min(10, 7 + 1) = 8 ← **找到了更短路径！**
- 标记节点 4 为已访问

```
dist: [0, 8, 3, 9, 7]   已访问：{0, 2, 4}
```

**第 4 轮**：未访问中 dist 最小 → 节点 1（dist=8）

- 从节点 1 出发，更新邻居：
  - 1 → 3：dist[3] = min(9, 8 + 2) = 9（没变，8+2=10 > 9）
- 标记节点 1 为已访问

```
dist: [0, 8, 3, 9, 7]   已访问：{0, 2, 4, 1}
```

**第 5 轮**：未访问中 dist 最小 → 节点 3（dist=9），没有未访问邻居了。结束。

```
最终结果：
0 → 0: 0
0 → 1: 8  （路径：0 → 2 → 4 → 1）
0 → 2: 3  （路径：0 → 2）
0 → 3: 9  （路径：0 → 2 → 3）
0 → 4: 7  （路径：0 → 2 → 4）
```

### 算法模板总结

```
1. 初始化：起点 dist = 0，其他 dist = ∞
2. 重复以下步骤，直到所有节点都已访问：
   a. 从未访问节点中选 dist 最小的节点 u
   b. 标记 u 为已访问
   c. 对 u 的每个未访问邻居 v，松弛更新：
      if dist[u] + weight(u,v) < dist[v]:
          dist[v] = dist[u] + weight(u,v)
          prev[v] = u  （记录路径用）
```

其中"松弛"（Relaxation）是图论术语，意思就是"看看经过 u 到 v 能不能比原来更近"。

## 代码实现

### TypeScript（朴素版）

先来一个最容易理解的版本，用数组来选最小 dist 节点：

```typescript
/**
 * Dijkstra 最短路径算法 —— 朴素版
 * 适用场景：边权非负的有向/无向加权图
 * 时间复杂度：O(V²)，适合节点数不太大的场景
 */
function dijkstra(
  graph: number[][],  // 邻接矩阵，graph[i][j] 表示 i→j 的边权，0 表示无边
  source: number,     // 起点
): { dist: number[]; prev: number[] } {
  const n = graph.length;
  const dist = new Array(n).fill(Infinity); // dist[i] = 起点到 i 的最短距离
  const prev = new Array(n).fill(-1);       // prev[i] = 最短路径中 i 的前驱节点
  const visited = new Array(n).fill(false); // 标记是否已确定最短距离

  dist[source] = 0; // 起点到自己的距离为 0

  // 一共需要确定 n 个节点的最短距离
  for (let i = 0; i < n; i++) {
    // 1. 从未访问节点中，找 dist 最小的
    let u = -1;
    let minDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && dist[j] < minDist) {
        minDist = dist[j];
        u = j;
      }
    }

    // 如果找不到可达节点，说明剩余节点不可达
    if (u === -1) break;
    visited[u] = true;

    // 2. 松弛操作：尝试通过 u 到达它的邻居
    for (let v = 0; v < n; v++) {
      if (!visited[v] && graph[u][v] > 0) {
        const newDist = dist[u] + graph[u][v];
        if (newDist < dist[v]) {
          dist[v] = newDist;
          prev[v] = u;
        }
      }
    }
  }

  return { dist, prev };
}

/** 根据 prev 数组还原从 source 到 target 的完整路径 */
function getPath(prev: number[], source: number, target: number): number[] {
  const path: number[] = [];
  let cur = target;
  while (cur !== -1) {
    path.unshift(cur);
    cur = prev[cur];
  }
  // 如果路径的起点不是 source，说明 target 不可达
  return path[0] === source ? path : [];
}

// === 使用示例 ===
//       10
//  0 --------→ 1
//  |             ↘
//  | 3        1   2
//  |          ↓    ↓
//  ↓     4   4    3
//  2 ------→ ────→ ↑
//  |                |
//  └──── 6 ─────────┘
const graph = [
  [ 0, 10,  3,  0,  0],  // 节点 0 的边
  [ 0,  0,  0,  2,  0],  // 节点 1 的边
  [ 0,  0,  0,  6,  4],  // 节点 2 的边
  [ 0,  0,  0,  0,  0],  // 节点 3 的边
  [ 0,  1,  0,  5,  0],  // 节点 4 的边
];

const { dist, prev } = dijkstra(graph, 0);
console.log("最短距离:", dist);       // [0, 8, 3, 9, 7]
console.log("最短路径:", getPath(prev, 0, 3)); // [0, 2, 3]
```

### TypeScript（优先队列优化版）

朴素版每轮都要遍历所有节点找最小值，效率不高。用**最小堆（优先队列）**可以优化到 O((V+E) log V)：

```typescript
/**
 * 简易最小堆（用于 Dijkstra 的优先队列）
 * 元素格式：[距离, 节点编号]
 */
class MinHeap {
  private heap: [number, number][] = [];

  get size(): number {
    return this.heap.length;
  }

  push(item: [number, number]): void {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop(): [number, number] | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  private _bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[i][0] < this.heap[parent][0]) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else break;
    }
  }

  private _sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left][0] < this.heap[smallest][0])
        smallest = left;
      if (right < n && this.heap[right][0] < this.heap[smallest][0])
        smallest = right;
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        i = smallest;
      } else break;
    }
  }
}

/**
 * Dijkstra 最短路径算法 —— 优先队列优化版
 * 用邻接表存储图，适合稀疏图
 * 时间复杂度：O((V + E) log V)
 */
function dijkstraPQ(
  adjList: [number, number][][], // adjList[u] = [[v, weight], ...]
  source: number,
): { dist: number[]; prev: number[] } {
  const n = adjList.length;
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const visited = new Array(n).fill(false);
  const pq = new MinHeap();

  dist[source] = 0;
  pq.push([0, source]);

  while (pq.size > 0) {
    const [d, u] = pq.pop()!;

    // 跳过已处理的"过期"条目（同一个节点可能被多次推入堆）
    if (visited[u]) continue;
    visited[u] = true;

    // 遍历 u 的所有邻居
    for (const [v, weight] of adjList[u]) {
      if (!visited[v]) {
        const newDist = dist[u] + weight;
        if (newDist < dist[v]) {
          dist[v] = newDist;
          prev[v] = u;
          pq.push([newDist, v]); // 新的更短距离入堆
        }
      }
    }
  }

  return { dist, prev };
}

// === 使用示例（同样的图，用邻接表表示） ===
const adjList: [number, number][][] = [
  [[1, 10], [2, 3]],           // 0 → 1(10), 0 → 2(3)
  [[3, 2]],                    // 1 → 3(2)
  [[3, 6], [4, 4]],            // 2 → 3(6), 2 → 4(4)
  [],                          // 3 没有出边
  [[1, 1], [3, 5]],            // 4 → 1(1), 4 → 3(5)
];

const result = dijkstraPQ(adjList, 0);
console.log("最短距离:", result.dist); // [0, 8, 3, 9, 7]
console.log("到节点3的路径:", getPath(result.prev, 0, 3)); // [0, 2, 3]
```

### Python 版本

```python
import heapq


def dijkstra(adj_list: list[list[tuple[int, int]]], source: int) -> tuple[list[int], list[int]]:
    """Dijkstra 最短路径算法（优先队列优化版）

    Args:
        adj_list: 邻接表，adj_list[u] = [(v, weight), ...]
        source: 起点编号

    Returns:
        dist: dist[i] = 起点到 i 的最短距离
        prev: prev[i] = 最短路径中 i 的前驱节点（用于还原路径）
    """
    n = len(adj_list)
    dist = [float("inf")] * n
    prev = [-1] * n
    visited = [False] * n

    dist[source] = 0
    # 堆里元素格式：(距离, 节点)
    pq = [(0, source)]

    while pq:
        d, u = heapq.heappop(pq)

        # 跳过已处理的过期条目
        if visited[u]:
            continue
        visited[u] = True

        # 松弛 u 的所有邻居
        for v, weight in adj_list[u]:
            if not visited[v]:
                new_dist = dist[u] + weight
                if new_dist < dist[v]:
                    dist[v] = new_dist
                    prev[v] = u
                    heapq.heappush(pq, (new_dist, v))

    return dist, prev


def get_path(prev: list[int], source: int, target: int) -> list[int]:
    """根据 prev 数组还原从 source 到 target 的完整路径"""
    path = []
    cur = target
    while cur != -1:
        path.append(cur)
        cur = prev[cur]
    path.reverse()
    return path if path[0] == source else []


# === 使用示例 ===
if __name__ == "__main__":
    #        10
    #  0 --------→ 1
    #  |             ↘
    #  | 3        1   2
    #  |          ↓    ↓
    #  ↓     4   4    3
    #  2 ------→ ────→ ↑
    #  |                |
    #  └──── 6 ─────────┘
    adj = [
        [(1, 10), (2, 3)],  # 0 的邻居
        [(3, 2)],            # 1 的邻居
        [(3, 6), (4, 4)],    # 2 的邻居
        [],                   # 3 没有出边
        [(1, 1), (3, 5)],    # 4 的邻居
    ]

    dist, prev = dijkstra(adj, 0)
    print(f"最短距离: {dist}")                 # [0, 8, 3, 9, 7]
    print(f"到节点3的路径: {get_path(prev, 0, 3)}")  # [0, 2, 3]
    print(f"到节点1的路径: {get_path(prev, 0, 1)}")  # [0, 2, 4, 1]
```

## 关于"松弛"的直觉

你可能会问，为什么这个操作叫"松弛"？这个词翻译自英文 **Relaxation**，其实是个比喻：

想象一根绳子从起点拉到某个节点，一开始拉得很紧（距离是 ∞）。当你发现一条更短的路径，就把绳子"松"一点——距离变小了。每一次松弛操作，都是在说：**"嘿，我发现了一条更近的路，把你的距离值往下调一下。"**

```text
松弛前：dist[v] = 15  （原来的路径）
松弛后：dist[v] = 9   （经过 u 的新路径更短）

     旧路径（长）
起点 ─────────────────────→ v
  │                     ↑
  └──→ u ──(4)──────────┘
     新路径：3 + 4 = 7... 不对，假设是 9
     比 15 短，所以更新 dist[v] = 9
```

## 复杂度分析

| 实现方式 | 时间复杂度 | 空间复杂度 | 适用场景 |
| ---------- | ---------- | ---------- | ---- |
| 朴素版（数组选最小） | O(V²) | O(V²) | 稠密图，节点数 ≤ 1000 |
| 优先队列版（最小堆） | O((V+E) log V) | O(V+E) | 稀疏图，节点数可达 10⁵ |

- **朴素版 O(V²)**：每轮遍历 V 个节点找最小值，共 V 轮。简单但节点多了就慢。
- **优先队列版 O((V+E) log V)**：用堆选最小值只需 O(log V)，每个节点和每条边各处理一次。实际工程中基本都用这个版本。
- **空间 O(V+E)**：存储图的邻接表需要 V 个节点数组 + E 条边。

### Dijkstra 与其他最短路径算法的对比

| 算法 | 适用条件 | 时间复杂度 | 特点 |
| ---- | ---- | ---- | ---- |
| **Dijkstra** | 非负权 | O((V+E) log V) | 贪心，速度快，不支持负权 |
| **Bellman-Ford** | 可以有负权 | O(VE) | 支持负权，可以检测负权环 |
| **Floyd-Warshall** | 任意权 | O(V³) | 全源最短路，代码极短 |
| **SPFA** | 可以有负权 | 平均 O(E)，最坏 O(VE) | Bellman-Ford 的队列优化 |

一句话选型：
- 只求单源、没有负权 → **Dijkstra**（最快）
- 有负权边 → **Bellman-Ford** 或 SPFA
- 求所有节点两两之间的最短路 → **Floyd-Warshall**

## 业务场景

### 1. 导航与地图

这是 Dijkstra 最经典的商业应用。Google Maps、高德地图、百度地图的路线规划底层都用到了基于 Dijkstra 的变体（如 A* 算法在 Dijkstra 的基础上加了启发式函数来加速）。

### 2. 网络路由协议

OSPF（Open Shortest Path First）协议是互联网中最常用的内部网关协议，它的核心就是 Dijkstra 算法。每个路由器都知道网络拓扑图，然后用 Dijkstra 计算到其他所有路由器的最短路径，构建路由表。

### 3. 社交网络分析

在社交网络中，两个用户之间的"最短社交距离"（通过最少的中间人认识）本质上就是一个最短路径问题。LinkedIn 的"二度人脉""三度人脉"就是这么来的。

### 4. 游戏中的寻路

游戏里 NPC 从 A 走到 B 的路径规划，最简单的方案就是 Dijkstra。如果地图是网格的，通常会用 A*（Dijkstra + 启发函数）来提高效率。

## 常见坑点

### 🚫 负权边

Dijkstra 贪心地"确定了的最短路径就不会再更新"，但如果有负权边，后面可能出现更短的路径。看这个例子：

```
  A --(2)--> B
  |          |
 (5)      (-3)
  |          ↓
  └--------→ C
```

Dijkstra 会先确定 A→B=2，然后确定 A→C=5。但实际上 A→B→C = 2 + (-3) = -1 更短！所以**有负权边请用 Bellman-Ford**。

### 🚫 只适用于单源

Dijkstra 解决的是"从一个起点到所有其他点的最短距离"。如果你需要"所有点到所有点的最短距离"，要么对每个点跑一次 Dijkstra（O(V × (V+E) log V)），要么直接用 Floyd-Warshall（O(V³)）。

### 🚫 大图的堆优化

如果图很大（节点数 > 10⁴），朴素版 O(V²) 会超时，一定要用优先队列版。在 LeetCode 上的图论题目，大部分需要 O((V+E) log V) 的复杂度。

## 相关 LeetCode 题目

| 题号 | 题目 | 难度 | 说明 |
| ---- | ---- | ---- | ---- |
| 743 | Network Delay Time | Medium | Dijkstra 模板题，求单源到所有点的最大距离 |
| 787 | Cheapest Flights Within K Stops | Medium | 带限制的最短路径，BFS/Dijkstra 变体 |
| 1514 | Path with Maximum Probability | Medium | 最大概率路径，松弛条件反过来 |
| 1631 | Path With Minimum Effort | Medium | 二分 + BFS / Dijkstra |

## 小结

Dijkstra 算法的核心思想就一句话：**贪心地每次选最近的未确定节点，然后松弛它的邻居。**

- ✅ 速度快，优先队列版 O((V+E) log V)，能处理大规模图
- ✅ 实现简单，模板就那么几行，面试手写完全可行
- ✅ 应用广泛，从导航到网络路由到游戏寻路，到处都有它的身影
- ❌ 不支持负权边，遇到负权请换 Bellman-Ford
- ❌ 只解决单源最短路，全源最短路请用 Floyd-Warshall

掌握 Dijkstra 不仅能刷通一堆图论题目，更重要的是理解**贪心 + 松弛**这种思想——它是很多高级算法的基石 🎯
