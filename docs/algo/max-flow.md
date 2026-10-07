---
title: 最大流与最小割
description: 最大流（Max Flow）与最小割（Min Cut）—— Ford-Fulkerson、Edmonds-Karp、Dinic 三种经典实现
date: 2026-10-01 09:01:47
categories:
  - Algorithm
tags:
  - max-flow
  - min-cut
  - graph-algorithm
sidebarSort: 93
---

# 最大流与最小割（Max Flow & Min Cut）

想象一下，你在负责一个城市的供水系统。水从水源出发，要经过一堆地下水管，最终流到城市的各个居民区。每条水管的直径不一样，意味着每秒能流过的水量（容量）是有限的。现在老板问你：**从水源到居民区，最多能同时送多少水？**

这就是**最大流问题**。听起来像是个脑筋急转弯，但它的应用场景远不止供水系统——网络带宽分配、任务调度、二分图匹配、物流配送路线规划，背后都是最大流。

而更神奇的是，这个问题还有个"孪生兄弟"：**最小割**。把城市想象成一张图，你要修一堵墙把水源和居民区彻底隔开，每条边修墙都有个成本，最小割就是问**最少花多少钱能修起这堵墙**。

而最精彩的结论是：**最大流 = 最小割**。这两个看似无关的问题，答案居然永远相等。这就是著名的**最大流-最小割定理**。

## 原理拆解

### 1. 基本概念

在讲算法之前，先把名词定义清楚：

```
有向图 G = (V, E)，每条边 e 有一个容量 c(e) ≥ 0
有两个特殊节点：
  - 源点 s（source）：水的起点
  - 汇点 t（sink）：水的终点

流 f 是边上的一组赋值，满足：
  1. 容量限制：0 ≤ f(e) ≤ c(e)          // 不能超过管道容量
  2. 流量守恒：除 s 和 t 外，每个节点
              流入量 = 流出量          // 水不会凭空多出来

最大流：最大化 |f| = 从 s 流出的总流量
```

举个具体例子：

```
        3       2
    s ─────► A ─────► t
    │        │ ↘      ↑
    │ 4      │  5  2  │ 6
    ▼        ▼    ↘   │
    B ─────► C ─────► D
        2       3

直觉上，s 有 4+3=7 单位流出，t 有 6+2=8 单位流入，
但中间受限于边的容量，实际最大流是多少？
```

### 2. 残量网络（Residual Network）

**核心思想**：流过一条边后，这条边还剩多少"潜力"？同时，反向还能"退流"！

```
原边：u ──c(e)──► v，已经流了 f(e)

残量网络里有两条边：
  - 正向残量边：u ──c(e) - f(e)──► v    // 还能继续推
  - 反向残量边：v ──f(e)──► u            // 允许"撤销"

为什么要反向边？
  因为可能之前选的路径不是最优的，
  通过反向边可以"反悔"，把流量往更好的方向推。
```

举个例子：

```
原始流：s → A → t，推了 2 个单位（受限于边 s→A 容量 3）

残量网络：
  s ──1──► A    （正向剩余 1，还能继续推）
  A ──2──► s    （反向残量 2，可以撤销之前推的 2 个单位）

这样如果我们后来发现 s → B → A → t 才是更好的路径，
就能通过 A → s 的反向边"退回"一部分流量。
```

### 3. 增广路（Augmenting Path）

最大流的核心思路简单粗暴：**反复找一条从 s 到 t 的"还能走的路"，往里灌水，直到走不通为止**。

```
循环：
  1. 在残量网络里找一条 s → t 的路径
  2. 这条路径上所有边的最小残量 = bottleneck（瓶颈）
  3. 给这条路径灌 bottleneck 单位的水
  4. 更新残量网络
  5. 如果找不到路径了，恭喜，最大流就是答案

这就是 Ford-Fulkerson 方法的核心。
```

### 4. 最大流-最小割定理（Max-Flow Min-Cut Theorem）

```
割（cut）：把节点分成 S（含 s）和 T（含 t）两部分，
          S 和 T 之间的边集就叫一个割。
割的容量 = S → T 的边容量之和（不含反向边）

定理：最大流的值 = 最小割的容量
```

为什么？这有个直观的解释：

```
当你再也找不到增广路时，
从 s 出发在残量网络里能到达的所有节点 = S，
剩下的 = T。

那么 s 到 t 之间所有正向边都饱和了（残量为 0），
而 T 到 S 的边（反向）在残量网络里"用不上"。

所以此时 S → T 的边容量之和 = 当前流的流量，
而这个割恰好就是容量最小的割。
```

### 5. 三种算法的演进

| 算法                      | 时间复杂度              | 核心思想                       |
| ------------------------- | ----------------------- | ------------------------------ |
| **Ford-Fulkerson**        | O(E · max_flow)         | 任意找增广路（DFS）            |
| **Edmonds-Karp**          | O(V · E²)               | BFS 找最短增广路               |
| **Dinic**                 | O(V² · E)               | BFS 分层 + DFS 多路增广        |

实际工程里，**Dinic 是最常用的选择**，因为它在大多数图上跑得飞快。下面我们一个一个实现。

## 代码实现

### TypeScript：Ford-Fulkerson + Edmonds-Karp

```typescript
/**
 * 最大流 —— Edmonds-Karp 实现（BFS 找最短增广路）
 *
 * 为什么用 BFS 不用 DFS：
 *   - DFS 找到的增广路可能很长（路径上残量小）
 *   - BFS 找最短路径，每轮能更快推更多的流
 *   - 关键定理：BFS 找最短增广路，总共只做 O(V·E) 轮增广
 */
class MaxFlow {
  private readonly graph: number[][];      // 邻接矩阵存容量
  private readonly n: number;
  private readonly prev: number[];          // BFS 前驱数组

  constructor(n: number, edges: [number, number, number][]) {
    this.n = n;
    this.graph = Array.from({ length: n }, () => new Array(n).fill(0));
    this.prev = new Array(n).fill(-1);

    for (const [u, v, w] of edges) {
      this.graph[u][v] += w; // 多重边累加
    }
  }

  /**
   * BFS 找一条 s → t 的增广路
   * 返回 true 表示找到了
   */
  private bfs(s: number, t: number): boolean {
    const visited = new Array(this.n).fill(false);
    const queue: number[] = [s];
    visited[s] = true;
    this.prev[s] = -1;

    while (queue.length > 0) {
      const u = queue.shift()!;
      for (let v = 0; v < this.n; v++) {
        // 只走残量 > 0 的边
        if (!visited[v] && this.graph[u][v] > 0) {
          visited[v] = true;
          this.prev[v] = u;
          if (v === t) return true;
          queue.push(v);
        }
      }
    }
    return false;
  }

  /**
   * 计算最大流
   */
  maxFlow(s: number, t: number): number {
    let flow = 0;

    while (this.bfs(s, t)) {
      // 找这条增广路上的瓶颈（最小残量）
      let bottleneck = Infinity;
      for (let v = t; v !== s; v = this.prev[v]) {
        const u = this.prev[v];
        bottleneck = Math.min(bottleneck, this.graph[u][v]);
      }

      // 更新残量网络
      // 正向边减掉 bottleneck，反向边加上 bottleneck
      for (let v = t; v !== s; v = this.prev[v]) {
        const u = this.prev[v];
        this.graph[u][v] -= bottleneck; // 正向残量减少
        this.graph[v][u] += bottleneck; // 反向残量增加（提供"反悔"通道）
      }

      flow += bottleneck;
    }

    return flow;
  }
}

// === 使用示例 ===
// 经典的 6 节点图
// 0=s, 5=t
// 边：[from, to, capacity]
const edges: [number, number, number][] = [
  [0, 1, 16], [0, 2, 13],
  [1, 2, 10], [2, 1, 4],
  [1, 3, 12],
  [2, 4, 14],
  [3, 2, 9], [3, 5, 20],
  [4, 3, 7],  [4, 5, 4],
];

const mf = new MaxFlow(6, edges);
console.log("最大流:", mf.maxFlow(0, 5)); // 输出: 23
```

### Go：Dinic（工业级实现）

```go
package maxflow

// Dinic 最大流算法 —— 工业级实现
//
// 核心思路：
//  1. BFS 构建层次图（level graph）：给每个节点打层次标签
//  2. DFS 在层次图上找增广路，一次能推多条（多路增广）
//  3. 当前弧优化：避免重复遍历已经发空的边
//
// 为什么比 Edmonds-Karp 快：
//  - BFS 把图分层后，DFS 只能从低层走到高层，避免走"绕路"
//  - 多路增广让一次 DFS 能同时推多条流
type Dinic struct {
	n    int              // 节点数
	g    [][]*Edge        // 邻接表
	level []int           // 层次图：-1 表示不在当前分层图里
	it   []int            // 当前弧优化指针
}

type Edge struct {
	to   int // 终点
	rev  int // 反向边在 g[from] 里的下标
	cap  int // 剩余容量
}

// NewDinic 创建一个有 n 个节点的网络
func NewDinic(n int) *Dinic {
	return &Dinic{
		n:     n,
		g:     make([][]*Edge, n),
		level: make([]int, n),
		it:    make([]int, n),
	}
}

// AddEdge 加一条有向边（u → v，容量 cap）
// 同时加一条容量为 0 的反向边，组成"边对"
func (d *Dinic) AddEdge(u, v, cap int) {
	forward := &Edge{to: v, cap: cap}
	backward := &Edge{to: u, cap: 0}
	forward.rev = len(d.g[v])
	backward.rev = len(d.g[u])
	d.g[u] = append(d.g[u], forward)
	d.g[v] = append(d.g[v], backward)
}

// BFS 构建层次图，返回能否到达 t
func (d *Dinic) bfs(s, t int) bool {
	for i := range d.level {
		d.level[i] = -1
	}
	queue := []int{s}
	d.level[s] = 0
	for head := 0; head < len(queue); head++ {
		u := queue[head]
		for _, e := range d.g[u] {
			if e.cap > 0 && d.level[e.to] < 0 {
				d.level[e.to] = d.level[u] + 1
				if e.to == t {
					return true
				}
				queue = append(queue, e.to)
			}
		}
	}
	return false
}

// DFS 在层次图上找增广路，返回推过去多少流量
func (d *Dinic) dfs(u, t, pushed int) int {
	if u == t {
		return pushed
	}
	for ; d.it[u] < len(d.g[u]); d.it[u]++ {
		e := d.g[u][d.it[u]]
		if e.cap > 0 && d.level[u] < d.level[e.to] {
			// 只能从低层走到高层
			tr := d.dfs(e.to, t, min(pushed, e.cap))
			if tr > 0 {
				e.cap -= tr
				d.g[e.to][e.rev].cap += tr
				return tr
			}
		}
	}
	return 0
}

// MaxFlow 求最大流
func (d *Dinic) MaxFlow(s, t int) int {
	flow := 0
	INF := 1 << 30
	for d.bfs(s, t) {
		// 重置当前弧指针
		for i := range d.it {
			d.it[i] = 0
		}
		for {
			pushed := d.dfs(s, t, INF)
			if pushed == 0 {
				break
			}
			flow += pushed
		}
	}
	return flow
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
```

### Java：Dinic + 最小割输出

```java
import java.util.*;

public class MaxFlowDinic {

    /** 边结构 */
    static class Edge {
        int to;     // 终点
        int rev;    // 反向边在 graph[from] 里的下标
        int cap;    // 剩余容量

        Edge(int to, int rev, int cap) {
            this.to = to;
            this.rev = rev;
            this.cap = cap;
        }
    }

    private final int n;
    private final List<Edge>[] graph;
    private int[] level;  // 层次图
    private int[] it;     // 当前弧指针

    public MaxFlowDinic(int n) {
        this.n = n;
        this.graph = new ArrayList[n];
        for (int i = 0; i < n; i++) {
            this.graph[i] = new ArrayList<>();
        }
        this.level = new int[n];
        this.it = new int[n];
    }

    /**
     * 添加一条有向边 u → v，容量为 cap
     * 关键：同时添加一条容量 0 的反向边，给后续"反悔"用
     */
    public void addEdge(int u, int v, int cap) {
        Edge forward = new Edge(v, graph[v].size(), cap);
        Edge backward = new Edge(u, graph[u].size(), 0);
        graph[u].add(forward);
        graph[v].add(backward);
    }

    /** BFS 构建层次图 */
    private boolean bfs(int s, int t) {
        Arrays.fill(level, -1);
        Deque<Integer> queue = new ArrayDeque<>();
        queue.offer(s);
        level[s] = 0;
        while (!queue.isEmpty()) {
            int u = queue.poll();
            for (Edge e : graph[u]) {
                if (e.cap > 0 && level[e.to] == -1) {
                    level[e.to] = level[u] + 1;
                    if (e.to == t) return true;
                    queue.offer(e.to);
                }
            }
        }
        return false;
    }

    /** DFS 在层次图上找增广路 */
    private int dfs(int u, int t, int pushed) {
        if (u == t) return pushed;
        for (; it[u] < graph[u].size(); it[u]++) {
            Edge e = graph[u].get(it[u]);
            if (e.cap > 0 && level[u] < level[e.to]) {
                int tr = dfs(e.to, t, Math.min(pushed, e.cap));
                if (tr > 0) {
                    e.cap -= tr;
                    graph[e.to].get(e.rev).cap += tr;
                    return tr;
                }
            }
        }
        return 0;
    }

    /** 求最大流 */
    public int maxFlow(int s, int t) {
        int flow = 0;
        final int INF = Integer.MAX_VALUE;
        while (bfs(s, t)) {
            Arrays.fill(it, 0);
            int pushed;
            while ((pushed = dfs(s, t, INF)) > 0) {
                flow += pushed;
            }
        }
        return flow;
    }

    /**
     * 顺便输出最小割
     * 原理：跑完 maxFlow 后，从 s 出发 BFS，能到达的节点 = 割的 S 部分
     */
    public Set<Integer> minCutSourceSide(int s, int t) {
        maxFlow(s, t); // 先跑一遍确保残量网络稳定
        Set<Integer> sideS = new HashSet<>();
        Deque<Integer> queue = new ArrayDeque<>();
        queue.offer(s);
        sideS.add(s);
        while (!queue.isEmpty()) {
            int u = queue.poll();
            for (Edge e : graph[u]) {
                if (e.cap > 0 && !sideS.contains(e.to)) {
                    sideS.add(e.to);
                    queue.offer(e.to);
                }
            }
        }
        return sideS;
    }

    public static void main(String[] args) {
        MaxFlowDinic mf = new MaxFlowDinic(6);
        // 0=s, 5=t
        mf.addEdge(0, 1, 16);
        mf.addEdge(0, 2, 13);
        mf.addEdge(1, 2, 10);
        mf.addEdge(2, 1, 4);
        mf.addEdge(1, 3, 12);
        mf.addEdge(2, 4, 14);
        mf.addEdge(3, 2, 9);
        mf.addEdge(3, 5, 20);
        mf.addEdge(4, 3, 7);
        mf.addEdge(4, 5, 4);

        System.out.println("最大流: " + mf.maxFlow(0, 5)); // 23

        Set<Integer> sideS = mf.minCutSourceSide(0, 5);
        System.out.println("最小割 S 侧节点: " + sideS);
        // 输出类似 [0, 1, 2, 3]，节点 4、5 在 T 侧
    }
}
```

### Python：Ford-Fulkerson（教学版，最容易懂）

```python
from collections import deque
from typing import List, Tuple


class MaxFlow:
    """最大流 —— Ford-Fulkerson + Edmonds-Karp 思路（BFS 找最短增广路）

    为什么这个版本适合教学：
      - 用 BFS 找最短增广路，时间复杂度稳定
      - 用邻接表 + 边对象存图，比邻接矩阵省空间
      - 逻辑直观，看代码就能理解原理
    """

    class Edge:
        __slots__ = ("to", "rev", "cap")

        def __init__(self, to: int, rev: int, cap: int):
            self.to = to      # 终点
            self.rev = rev    # 反向边在 graph[from] 里的下标
            self.cap = cap    # 剩余容量

    def __init__(self, n: int):
        self.n = n
        self.graph: List[List[MaxFlow.Edge]] = [[] for _ in range(n)]

    def add_edge(self, u: int, v: int, cap: int) -> None:
        """添加有向边 u → v，容量为 cap

        关键细节：同时加一条反向边，给后续反悔用
        反向边的初始容量是 0（因为一开始并没有真的"推过流"）
        """
        forward = self.Edge(v, len(self.graph[v]), cap)
        backward = self.Edge(u, len(self.graph[u]), 0)
        self.graph[u].append(forward)
        self.graph[v].append(backward)

    def bfs(self, s: int, t: int) -> List[int]:
        """BFS 找增广路，返回前驱数组"""
        parent = [-1] * self.n
        parent[s] = s
        queue = deque([s])
        found = False

        while queue:
            u = queue.popleft()
            if u == t:
                found = True
                break
            for e in self.graph[u]:
                if parent[e.to] == -1 and e.cap > 0:
                    parent[e.to] = u
                    queue.append(e.to)

        # 找到返回前驱数组，否则全 -1
        return parent if found else None

    def max_flow(self, s: int, t: int) -> int:
        """求最大流"""
        flow = 0
        INF = float("inf")

        while True:
            parent = self.bfs(s, t)
            if parent is None:
                break  # 找不到增广路了，结束

            # 计算这条路径的瓶颈
            bottleneck = INF
            v = t
            while v != s:
                u = parent[v]
                # 找到 u → v 的边
                bottleneck = min(bottleneck, next(
                    e.cap for e in self.graph[u] if e.to == v
                ))
                v = u

            # 更新残量网络
            v = t
            while v != s:
                u = parent[v]
                for e in self.graph[u]:
                    if e.to == v:
                        e.cap -= bottleneck
                        # 反向边加上流量
                        self.graph[v][e.rev].cap += bottleneck
                        break
                v = u

            flow += bottleneck

        return flow


# 使用示例
if __name__ == "__main__":
    mf = MaxFlow(6)
    # 0=s, 5=t
    edges = [
        (0, 1, 16), (0, 2, 13),
        (1, 2, 10), (2, 1, 4),
        (1, 3, 12),
        (2, 4, 14),
        (3, 2, 9), (3, 5, 20),
        (4, 3, 7),  (4, 5, 4),
    ]
    for u, v, c in edges:
        mf.add_edge(u, v, c)

    print(f"最大流: {mf.max_flow(0, 5)}")  # 23
```

### 进阶：二分图最大匹配转最大流

这是一个特别常见的应用 —— 求解**二分图最大匹配**问题：

```typescript
/**
 * 二分图最大匹配 ← → 最大流
 *
 * 转化技巧：
 *   - 建一个虚拟源点 s，连接所有左侧节点（容量 1）
 *   - 建一个虚拟汇点 t，所有右侧节点连接到 t（容量 1）
 *   - 左侧节点到右侧节点的边（容量 1）
 *
 * 为什么最大流 = 最大匹配：
 *   - 每个左/右节点只能匹配一次，所以容量都设 1
 *   - 1 单位流 = 1 对匹配
 *   - 最大流 = 能同时匹配的最大对数
 *
 * 时间：O(VE) 用 Dinic（V=n+m, E=n*m+...）
 */
function bipartiteMatch(
  leftSize: number,
  rightSize: number,
  edges: [number, number][],
): number {
  const total = leftSize + rightSize + 2;
  const s = total - 2;
  const t = total - 1;
  const mf = new MaxFlow(total, []);

  // s → 左侧节点
  for (let i = 0; i < leftSize; i++) {
    (mf as any).graph[s][i] = 1;
  }
  // 右侧节点 → t
  for (let j = 0; j < rightSize; j++) {
    (mf as any).graph[leftSize + j][t] = 1;
  }
  // 左侧 → 右侧的边
  for (const [u, v] of edges) {
    (mf as any).graph[u][leftSize + v] = 1;
  }

  return mf.maxFlow(s, t);
}

// 示例：3 个工作，3 个人
// 工作 0,1,2 与人 0,1,2 的匹配关系
const match = bipartiteMatch(3, 3, [
  [0, 0], [0, 1], [1, 0], [1, 2], [2, 1],
]);
console.log("最大匹配数:", match); // 输出: 3
```

## 业务场景

### 1. 项目任务调度（关键路径资源分配）

一个项目有 N 个任务，任务之间有依赖关系。每个任务需要 1 个工程师，工程师人数有限，问最多能并行做多少任务？这本质上是**最大独立子集**问题，可以建模成最大流求解：每个工程师是源点到任务的边，任务间依赖关系转化成图边。

### 2. 网络带宽分配（QoS）

路由器要给不同业务分配带宽（视频、语音、普通数据），每条链路的总带宽有限。怎么分配能让"关键业务"最大化？这就是经典的多源多汇最大流问题。Linux 内核的 TC（Traffic Control）就用了类似思想。

### 3. 二分图匹配

找工作匹配、课程分配、婚恋网站配对，都可以建模成二分图匹配，再用最大流求解。具体见上方代码示例。

### 4. 物流配送路线

货物要从仓库运到 N 个客户，每辆车有容量上限，每个客户的需求量不同，每条路有运力限制。问最多能服务多少客户？这就是**多源点多汇点最大流**的变体。

### 5. 图像分割（计算机视觉）

GraphCut 算法就是基于最大流-最小割：把像素当作节点，相邻像素的相似度当作边的权重，用最小割把前景和背景分开。这可是计算机视觉里的经典算法，PhotoShop 的"魔棒"工具背后就有它的影子。

## 复杂度分析

| 算法                | 时间复杂度 | 空间复杂度  | 适用场景                         |
| ------------------- | ---------- | ----------- | -------------------------------- |
| Ford-Fulkerson (DFS) | O(E·F*)   | O(V+E)      | 教学/理解原理                    |
| Edmonds-Karp (BFS)   | O(V·E²)   | O(V+E)      | 简单场景、面试答题               |
| Dinic                | O(V²·E)   | O(V+E)      | **工业首选**，绝大多数图上跑得飞快 |
| Push-Relabel         | O(V³)      | O(V²)       | 密集图理论上更快                 |

*F 是最大流的值，Ford-Fulkerson 在 F 很大时会退化。

> **实战建议**：
> - 面试写 **Edmonds-Karp**（BFS 版本），代码短、好理解、不会卡复杂度
> - 工程用 **Dinic**，Go/Java 都有现成实现
> - 节点数 ≤ 1000 且边稀疏时，Dinic 通常 1ms 内就跑完
> - 如果边权是浮点数或非整数，用 Dinic 时小心 `INF` 取值

### 空间开销

- 邻接矩阵：O(V²)，适合稠密图，但 V 超过 1000 就别用
- 邻接表：O(V+E)，**最常用**
- 反向边：每条正向边配一条反向边，存储翻倍

### 数值边界

- **容量是 32 位整数**：用 `int` 即可（最大约 21 亿）
- **容量是 64 位**：用 `long long`，小心 `INF` 不能超 long 上限
- **Dinic 中 BFS/DFS 别用递归**：图大时栈溢出，改成显式栈或调高栈大小

## 小结

最大流是个"听着很数学、用起来很工程"的算法：

- ✅ 解决"网络流最大化"的通用问题，是图论的基石
- ✅ 最大流 = 最小割，这个对偶关系本身就是数学之美
- ✅ 能建模二分图匹配、任务调度、图像分割等大量实际问题
- ✅ Dinic 实现简洁，O(V²·E) 在工程上足够快
- ❌ 不适合超大规模（V > 10⁵）的图，需要更高级的算法（HLPP、SDPA）
- ❌ 反向边和残量网络的"反悔"机制，逻辑上要花点时间理解

它的核心思想只有一句话：**反复在残量网络里找增广路，把流量推到推不动为止**。

面试遇到最大流题，推荐优先写 Edmonds-Karp（BFS 版），既不容易写错，又能稳稳通过。如果时间充裕再加一手 Dinic，直接秒杀大部分 Follow-up。

记住，**最大流不只是算法，更是一种建模思维方式**——当你遇到"容量"、"匹配"、"分配"这类词时，想想能不能建图跑一遍最大流 🚰
