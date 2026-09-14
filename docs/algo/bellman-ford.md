---
title: Bellman-Ford 算法（含负权边与负环检测）
description: Bellman-Ford 最短路径算法——为什么 Dijkstra 遇到负权边就翻车，以及如何用 SPFA 优化
date: 2026-09-13 09:12:24
categories:
  - Algorithm
tags:
  - bellman-ford
  - spfa
  - shortest-path
  - graph
  - negative-cycle
sidebarSort: 83
---

# Bellman-Ford 算法（含负权边与负环检测）

上一篇文章我们聊了 Dijkstra 算法，它又优雅又快，最短路径问题里的大明星。但不知道你有没有想过一个问题：**如果地图上的某条路是"负的"呢？**

别笑，负权边在真实世界是有意义的。举个最直观的例子——**外汇套利**：假设 1 美元换 0.9 欧元，1 欧元换 130 日元，1 日元又换 0.01 美元，转一圈回来你手里的美元居然变多了。这一圈"汇率环"本质上就是图里的负环。

Dijkstra 面对这种负权边直接翻车。今天我们就来聊聊专门搞定负权边的 **Bellman-Ford 算法**，以及它的工程化优化版 **SPFA**。

## 为什么 Dijkstra 遇到负权边会翻车？

Dijkstra 的核心假设是"**已确定最短路径的节点不会再被更新**"。这个假设成立的前提是：**所有边的权重都是非负的**。

来看一个反例：

```
        2
  A ────────► B
  │           │
  │ -3        │ 2
  │           ▼
  └────────► C
```

从 A 出发：
- Dijkstra 先确定 A 到 B 的最短距离是 2（走 A→B）
- 再确定 A 到 C 是 min(直接 2, 经过 B 的 2+2=4) = 2
- 然后 B 被标记为"已确定"，不会再更新

但真实的最短路径其实是 A→B→C = 2+2 = 4？不对，等等，A→C 直接是 2，那走 A→B→C 是 4，反而更长。我们换个更狠的：

```
        2
  A ────────► B
  │           │
  │ -3        │ -3
  │           ▼
  └────────► C
```

- A→B = 2，A→C = -3
- Dijkstra 贪心选 C（-3 < 2），标记 C 已确定
- 但 A→B→C = 2 + (-3) = -1，比 -3 更短！
- 可 C 已经被"确定"了，Dijkstra 不会回头更新，于是算错了

结论：**只要图里有负权边，Dijkstra 的贪心策略就可能失效**。而 Bellman-Ford 则用"反复松弛"的方式，允许节点被反复修正，所以能正确处理负权边。


## 原理拆解：松弛操作 + 反复迭代

### 什么是"松弛"（Relaxation）？

松弛是 Bellman-Ford 的核心操作，一句话就能说清：

> 对于一条边 `u → v`（权重 w），如果 `dist[u] + w < dist[v]`，就更新 `dist[v] = dist[u] + w`。

翻译成人话：**我找到了一条到 v 更短的路，赶紧把记录改小**。这就是"松弛"——把紧绷的距离值放松到更小的值。

### 核心思想：反复松弛 V-1 轮

Bellman-Ford 的思路非常朴素：

1. 初始化 `dist[起点] = 0`，其他节点 = 无穷大
2. **重复 V-1 轮**（V 是节点数），每轮遍历所有边做一次松弛
3. V-1 轮之后，如果还能继续松弛，说明存在负环

为什么是 V-1 轮？因为在一个没有负环的图中，任意两点之间的最短路径**最多包含 V-1 条边**（再多就一定出现环，而正环只会绕远路）。所以松弛 V-1 轮就足够了。

### 图解一次完整流程

```
图：
      A ──5──► B
      │        │
      3       -2
      │        │
      ▼        ▼
      C ──4──► D

从 A 出发，求 A 到所有点的最短距离

初始化：
dist = { A: 0, B: ∞, C: ∞, D: ∞ }

第 1 轮（按边遍历）：
  松弛 A→B(5)：dist[B] = min(∞, 0+5) = 5
  松弛 A→C(3)：dist[C] = min(∞, 0+3) = 3
  松弛 B→D(-2)：dist[D] = min(∞, 5-2) = 3
  松弛 C→D(4)：dist[D] = min(3, 3+4) = 3（不更新）
  → dist = { A:0, B:5, C:3, D:3 }

第 2 轮：
  松弛 A→B(5)：dist[B] = min(5, 0+5) = 5
  松弛 A→C(3)：dist[C] = min(3, 0+3) = 3
  松弛 B→D(-2)：dist[D] = min(3, 5-2) = 3
  松弛 C→D(4)：dist[D] = min(3, 3+4) = 3
  → 本轮没有任何值变化，提前收敛 ✅
```

注意第 2 轮什么都没更新，说明已经稳定了，可以提前结束（这是 SPFA 优化的思路来源之一）。

### 负环检测

如果图里有负环，松弛操作就永远停不下来——每次绕一圈，距离都能再变小一点。

```
负环示例：
      A ──► B
      ▲     │
      │     │ -3
      │     ▼
      └──── C  (边 C→A 权重 1，边 A→B 权重 2)

绕一圈 A→B→C→A = 2 + (-3) + 1 = 0，如果是 A→B→C→A = 负数，就永远能更新
```

所以检测负环的方法就是：**跑完 V-1 轮后再多跑一轮，如果还能松弛成功，说明有负环**。

## 代码实现

### TypeScript

先来个最朴素的版本，把"V-1 轮反复松弛"这个思想直接翻译成代码：

```typescript
/**
 * Bellman-Ford —— TypeScript 实现（朴素版）
 * 用途：求单源最短路径，支持负权边，并能检测负环
 */
interface Edge {
  from: number;
  to: number;
  weight: number;
}

function bellmanFord(
  n: number,        // 节点数（编号 0 ~ n-1）
  edges: Edge[],    // 边列表
  src: number,      // 起点
): number[] | null {
  const INF = Number.MAX_SAFE_INTEGER;
  const dist = new Array(n).fill(INF);
  dist[src] = 0;

  // 松弛 V-1 轮，每轮遍历所有边
  for (let i = 0; i < n - 1; i++) {
    let updated = false; // 本轮是否有更新（提前收敛优化）
    for (const { from, to, weight } of edges) {
      if (dist[from] !== INF && dist[from] + weight < dist[to]) {
        dist[to] = dist[from] + weight;
        updated = true;
      }
    }
    if (!updated) break; // 提前收敛，能省不少时间
  }

  // 第 V 轮：如果还能松弛，说明有负环
  for (const { from, to, weight } of edges) {
    if (dist[from] !== INF && dist[from] + weight < dist[to]) {
      return null; // 检测到负环，返回 null 表示无解
    }
  }

  return dist;
}

// 使用示例
const edges: Edge[] = [
  { from: 0, to: 1, weight: 5 },
  { from: 0, to: 2, weight: 3 },
  { from: 1, to: 3, weight: -2 },
  { from: 2, to: 3, weight: 4 },
];
console.log(bellmanFord(4, edges, 0)); // [0, 5, 3, 3]
```

### Python

```python
def bellman_ford(n: int, edges: list[tuple[int, int, int]], src: int):
    """
    Bellman-Ford 算法 —— Python 实现

    n     : 节点数（0 ~ n-1）
    edges : 边列表，每条边是 (from, to, weight)
    src   : 起点
    返回  : 最短距离列表，存在负环时返回 None
    """
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0

    # 松弛 n-1 轮
    for _ in range(n - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = True
        if not updated:  # 提前收敛
            break

    # 第 n 轮检测负环
    for u, v, w in edges:
        if dist[u] != INF and dist[u] + w < dist[v]:
            return None  # 存在负环

    return dist


if __name__ == "__main__":
    edges = [(0, 1, 5), (0, 2, 3), (1, 3, -2), (2, 3, 4)]
    print(bellman_ford(4, edges, 0))  # [0, 5, 3, 3]
```

## SPFA：Bellman-Ford 的工程化优化

朴素的 Bellman-Ford 每一轮都要**遍历所有边**，即使大部分边根本不会触发更新。这在边数很多时会很慢。

SPFA（Shortest Path Faster Algorithm，也有人叫它"队列优化的 Bellman-Ford"）观察到一件事：**只有"上一轮距离被更新过的节点"，它的出边才可能在下一次触发新的松弛**。

所以 SPFA 用一个队列，只处理"可能带来更新"的节点：

1. 起点入队
2. 每次从队列取出节点 u，遍历 u 的所有出边做松弛
3. 如果某个邻居 v 的距离被更新了，且 v 不在队列里，就把 v 入队
4. 重复直到队列为空

### TypeScript（邻接表版）

```typescript
/**
 * SPFA —— TypeScript 实现
 * 队列优化的 Bellman-Ford，稀疏图下通常比朴素版快很多
 */
interface Neighbor {
  to: number;
  weight: number;
}

function spfa(
  n: number,
  graph: Neighbor[][],  // 邻接表
  src: number,
): number[] | null {
  const INF = Number.MAX_SAFE_INTEGER;
  const dist = new Array(n).fill(INF);
  const inQueue = new Array(n).fill(false);
  const count = new Array(n).fill(0); // 记录每个节点入队次数，用于判负环

  dist[src] = 0;
  const queue: number[] = [src];
  inQueue[src] = true;

  while (queue.length > 0) {
    const u = queue.shift()!;
    inQueue[u] = false;

    for (const { to: v, weight } of graph[u]) {
      if (dist[u] !== INF && dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;

        if (!inQueue[v]) {
          queue.push(v);
          inQueue[v] = true;
          count[v]++;

          // 某个节点入队超过 n 次，说明存在负环
          if (count[v] > n) return null;
        }
      }
    }
  }

  return dist;
}
```

### Python

```python
from collections import deque


def spfa(n: int, graph: list[list[tuple[int, int]]], src: int):
    """
    SPFA —— Python 实现（队列优化的 Bellman-Ford）
    """
    INF = float("inf")
    dist = [INF] * n
    in_queue = [False] * n
    count = [0] * n

    dist[src] = 0
    q = deque([src])
    in_queue[src] = True

    while q:
        u = q.popleft()
        in_queue[u] = False

        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if not in_queue[v]:
                    q.append(v)
                    in_queue[v] = True
                    count[v] += 1
                    if count[v] > n:  # 入队超 n 次 → 负环
                        return None

    return dist
```

> ⚠️ 小提醒：SPFA 的平均时间复杂度是 O(E)，但最坏情况下会退化到 O(V·E)。在某些刻意构造的图（比如网格图）上，SPFA 可能被卡到很慢。所以竞赛里常用它"偷懒"，但工程上如果确定没有负权边，还是老老实实用 Dijkstra 更稳。

## 复杂度分析

| 算法              | 时间复杂度 | 空间复杂度 | 适用场景               |
| ----------------- | ---------- | ---------- | ---------------------- |
| Bellman-Ford      | O(V·E)     | O(V)       | 有负权边，图比较小     |
| SPFA              | 平均 O(E)  | O(V)       | 有负权边，图稀疏、边多 |
| Dijkstra（堆优化） | O(E·logV)  | O(V)       | 无负权边，最常用       |

- **Bellman-Ford**：V-1 轮，每轮遍历 E 条边，所以 O(V·E)。胜在**简单、能处理负权边、能检测负环**。
- **SPFA**：大部分情况下只处理"活跃"的节点，平均 O(E)，但最坏 O(V·E)。
- **Dijkstra**：最快，但前提是没有负权边。

一句话决策：

```
图里有负权边？
├── 没有 → Dijkstra（堆优化）
└── 有   → 图小用 Bellman-Ford，图大用 SPFA
```

## 实际应用

### 1. 外汇套利（Arbitrage）

这是负环最经典的应用。把每种货币当成节点，汇率当成边权（取对数后加法，把乘法转成加法）。如果汇率环的乘积大于 1，取对数后就是一个正环（等价于取负对数的负环）。Bellman-Ford 一旦检测到负环，就意味着存在套利机会。

```
1 USD ──0.9──► EUR ──130──► JPY ──0.01──► USD
乘积 = 0.9 × 130 × 0.01 = 1.17 > 1，套利成功！
```

### 2. 网络路由协议（RIP / BGP）

早期的距离矢量路由协议（如 RIP）底层就是 Bellman-Ford 的思想：每个路由器不断向邻居广播自己的距离表，邻居收到后做松弛更新。这种"反复交换距离信息直到收敛"的机制，和 Bellman-Ford 的"反复松弛"如出一辙。

### 3. 带负权的时间约束系统

有些排程问题（比如"任务 A 必须在任务 B 开始前 5 分钟完成"）可以建模成差分约束系统，转化成带负权边的最短路问题求解。这类 DAG 里没有负环，Bellman-Ford/SPFA 都能解。

### 4. LeetCode 相关题目

- 743. 网络延迟时间（经典单源最短路，可用 Bellman-Ford 或 Dijkstra）
- 787. K 站中转内最便宜的航班（限制经过的边数，Bellman-Ford 的"轮次"天然对应"中转次数"）
- 负环检测类的题（如货币套利）几乎必考 SPFA/Bellman-Ford

## 小结

Bellman-Ford 是 Dijkstra 之外的另一个最短路基石：

- ✅ 支持负权边，Dijkstra 做不到
- ✅ 能检测负环，这是它的杀手锏
- ✅ 思路极其简单：反复松弛 V-1 轮
- ❌ 时间复杂度 O(V·E)，比 Dijkstra 慢，大规模图扛不住
- ❌ 需要 SPFA 等优化才能在实际工程里用得顺

**面试口诀**：看到"负权边"或"负环"，条件反射想到 Bellman-Ford / SPFA；看到"限制最多经过 K 条边"，想到 Bellman-Ford 的轮次正好对应边数。

掌握它，你就补齐了最短路算法的最后一块拼图 🧩
