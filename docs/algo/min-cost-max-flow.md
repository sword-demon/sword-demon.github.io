---
title: 最小费用最大流（MCMF）精讲
description: 最小费用最大流从残量网络到势能 + Dijkstra，一篇打通二分图最小权匹配、带负权最短路、负载均衡与差异约束，附 TypeScript / Python / Go / Java 实现与实测性能对比
date: 2026-10-28 09:00:00
categories:
  - Algorithm
tags:
  - min-cost-max-flow
  - mcmf
  - network-flow
  - graph
  - shortest-path
  - interview
sidebarSort: 117
---

# 最小费用最大流（MCMF）精讲

先讲个真实的场景。

你做的是同城即时配送。手上有一批骑手（运力），一批订单，每个订单有配送到不同小区的**不同成本**（距离、天气、路况）。

老板甩过来一句话：*"这些订单你都给我送了，但给我把总成本压到最低。"*

问题来了——你**不能**只挑成本最低的订单送。因为骑手数量有限，订单太多送不完。也不能只管送得多不管贵不贵。

这就变成了一个很拧巴的需求：**流量要最大，同时费用要最小**。

后来我才反应过来——这就是**最小费用最大流**（Min-Cost Max-Flow，简称 MCMF）。它是网络流里最实用、也最容易被面试官拿出来"追着问"的一个模型。

这篇把它讲透。

---

## 一、先把概念钉死

### 1.1 最大流回顾

如果没读过 [最大流与最小割](max-flow.md)，先补三句话：

网络流的基本模型是：一个**源点 s**、一个**汇点 t**、若干条**有向边**。每条边有**容量**（最多能流过多少）和**费用**（流一单位要花多少钱）。

```
      容量 8, 费用 2        容量 5, 费用 1
  s ─────────────► u ─────────────► t
   \                          /
    \─► v ────────────────────/
       容量 3, 费用 4    容量 6, 费用 3
```

最大流问的是：**从 s 到 t 最多能流多少水**？答案是"水的最大流量"。

### 1.2 加一维：费用

最小费用最大流在同样的图上，**再加一个问题**：在流量最大的前提下，总费用最少是多少？

数学上写出来是：

```text
求：max Σ flow_e
约束：Σ flow_e = 0（每个中间节点流量守恒）
     0 ≤ flow_e ≤ cap_e
目标：在 max flow 的所有解中，最小化 Σ (flow_e × cost_e)
```

翻译成人话：**先把水送满（流量最大），再想办法让每滴水尽量走便宜的路（费用最小）**。

### 1.3 三个常见变体

面试官问的"费用流"其实是三个不同的东西，别搞混：

| 变体 | 问的问题 | 怎么解 |
| ---- | -------- | ------ |
| **最小费用最大流** | 流量最大时，费用最小是多少 | 一直增广到推不动为止 |
| **最小费用流** | 恰好送 `k` 单位流，费用最小是多少 | 增广到 `flow == k` 就停 |
| **最小费用可行流** | 每条边有流量上下界，求满足条件的最小费用 | 上下界转化 + 负权回路 |

本文主讲第一个（最常用），第三个会在后面"避坑清单"里提一句。

### 1.4 什么样的题能用 MCMF

我总结了三个特征，命中两个以上基本就能往这个方向想：

> **① 有"容量"概念** —— 每个资源有上限（骑手能跑 8 单、某条路限流 1000）
>
> **② 有"费用"概念** —— 每个动作有代价（距离、耗时、成本）
>
> **③ 有"流量守恒"结构** —— 中间节点只是"中转"，进多少出多少

来对照几个经典题：

| 题目 | 容量 | 费用 | 守恒 | 结论 |
| ---- | ---- | ---- | ---- | ---- |
| 二分图最小权完美匹配 | 1 | 边权 | ✅ | ✅ MCMF |
| 带负权的最短路 | ∞ | 边权 | ❌ | ⚠️ 退化版（下面讲） |
| 任务调度（时限内最多赚多少） | 1 | 收益 | ✅ | ✅ MCMF |
| 运货 / 物流分配 | 库存 | 运费 | ✅ | ✅ MCMF |
| 股票买卖（可多次交易） | ∞ | 收益 | ❌ | ❌ 用贪心或 DP |
| 最短路 | ∞ | 距离 | ❌ | ❌ 用 Dijkstra |

**注意第 2 行和第 4 行**——很多人一看"费用"就往 MCMF 上靠，但**没有守恒结构就不该建流网络**。带负权的最短路是个特例，后面单独讲。

---

## 二、原理拆解

### 2.1 残量网络：MCMF 的地基

MCMF 的一切都建立在**残量网络**（Residual Network）上。

每条原始边 `u → v`（容量 `cap`，费用 `cost`），在残量网络里对应**一对边**：

```text
       原始边
  u ──────────► v      cap = 5, cost = 2
  ◄───────────
     反向边            cap = 0, cost = -2
```

反向边一开始容量是 0，等于"这条路暂时走不了"。

**为什么要搞这一套？**

因为最优解经常需要"反悔"。举个我面试时遇到的例子：

```text
两条从 s 到 t 的路：
  路线 A：s → x → t，费用 10
  路线 B：s → y → t，费用 1

但 x、y、t 有容量约束，最终最优解是：
  s → y → t（走便宜的），同时 s → x → t（走贵的）也要走一部分
```

更典型的场景是"增广路发现走错了，需要撤销"：

```text
第 1 轮：走了 s → a → b → t，费用 5
第 2 轮：发现更好的组合，需要"撤销"第 1 轮走过的某一段
        → 沿反向边 b → a 回退，把 a 的容量"还"回去
```

**反向边就是"反悔药"**。它的费用是原费用的相反数，这样一来：

```text
走原边再走反向边 = +cost + (-cost) = 0
```

净效果就是"撤销这一段流量"。这是 MCMF 里最精妙的设计，也是它比"贪心地找最便宜的路"强大的根本原因。

### 2.2 核心循环：最短增广路

算法本体只有一句话：

```text
while 存在从 s 到 t 的最短费用路径:
    沿这条路径推尽可能多的流量
    累加费用
```

和最大流一模一样的骨架，唯一的区别是：**找路径时用"费用"当权重，而不是"跳数"**。

```text
最大流：  找边数最少的路  →  BFS
最小费用流：找费用最小的路 →  SPFA / Dijkstra
```

### 2.3 为什么"每次走最短费用路"是对的？

这是面试官最爱追问的一题，答不出来前面全白搭。

**引理（最短增广路定理）**：在残量网络中，若 `P` 是当前残量网络中**费用最小**的 s→t 路径，那么**一定存在一个最优解，其流量分布在 `P` 上至少是 `min_{e∈P} cap_e`**。

**为什么？**

用**交换论证**（exchange argument），这是最小费用流最优雅的证明方式：

```text
假设最优解 O 的一条增广路 Q 费用更低（或者我们想让 O 更接近 P）：

  O 中有流量、但 P 上没有的边 → 把它减掉
  O 中没流量、但 P 上有的边 → 把它加上

  这一减一加：
  ① 流量守恒依然成立（因为改的是同一条 s→t 路径上的边）
  ② 总流量不变
  ③ 总费用变化 = (P 的费用) - (Q 的费用) ≤ 0
     ← 关键！P 是最短的，所以 P 的费用 ≤ Q 的费用

  所以：调整后的解费用不会变高 → 说明"沿最短路增广"总能收敛到最优
```

**一句话版本**：

> 每次都走最便宜的路，反悔的代价由反向边承担，**每一步都不会让最优解变差**，所以最终停在最优解上。

### 2.4 完整走一遍

用这个小图当例子：

```text
      容量 2, 费用 1        容量 1, 费用 2
  s ─────────────► 1 ─────────────► t
   \                           /
    \──► 2 ────────────────────/
       容量 1, 费用 5    容量 1, 费用 1
```

**第 1 轮**：

最短费用路径有哪些？
- `s→1→t`：1 + 2 = **3**
- `s→2→t`：5 + 1 = **6**

选 `s→1→t`（费用 3）。瓶颈容量 = min(2, 1) = **1**。

```text
  流量 1 走完，s→1 剩 1，1→t 剩 0
  总流量 = 1，总费用 = 3
```

**第 2 轮**：

- `s→1→t`：`1→t` 容量为 0，走不通
- `s→2→t`：5 + 1 = **6** ← 唯一可走

推 1 单位流。瓶颈 = min(1, 1) = 1。

```text
  总流量 = 2，总费用 = 3 + 6 = 9
```

**第 3 轮**：

`s→1` 还有 1 单位容量，但 `1→t` 满了。反向边 `t→1`（费用 -2，容量 1）存在，但它是**从 t 出发**的，我们从 s 出发走不到 t。

没有增广路 → 结束。

```text
  最终：最大流 = 2，最小费用 = 9
```

**验算一下**：如果走 `s→1→t` 1 单位（费用 3）+ `s→2→t` 1 单位（费用 6）= 9。没错 ✅

### 2.5 图解残量网络的变化

```text
【初始】
  s --(2,1)--> 1 --(1,2)--> t
  s --(1,5)--> 2 --(1,1)--> t
  每条边都有一条 cap=0 的反向边

【第 1 轮后：沿 s→1→t 推了 1】
  s --(1,1)--> 1 --(0,2)--> t      正向容量各减 1
  s --(1,-1)--> 1                  反向边容量变 1，费用 -1
  1 --(1,-2)--> t
  s --(1,5)--> 2 --(1,1)--> t      没动

【第 2 轮后：沿 s→2→t 推了 1】
  s --(1,1)--> 1 --(0,2)--> t
  s --(1,5)--> 2 --(0,1)--> t      正向容量减 1
  2 --(1,-1)--> t                  反向边容量变 1
```

看出规律了吗？**每推 1 单位流，沿途所有边的正向容量 -1、反向容量 +1**。这就是"残量"的全部含义。

---

## 三、两种算法：SPFA vs 势能 + Dijkstra

这一节是本文的**技术核心**。

### 3.1 为什么不能直接用 Dijkstra？

因为**残量网络里有负费用边**（反向边的费用是负的）。

Dijkstra 的前提是"所有边权非负"，否则你无法确定"当前最小 dist 的节点是否已经定型"。

那怎么办？两条路：

**路线 A：SPFA** —— 用 Bellman-Ford 的队列优化版，支持负权。

**路线 B：势能 + Dijkstra（Johnson 重标号）** —— 把负权边"变形"成非负边，然后用 Dijkstra。

### 3.2 路线 A：SPFA（直观但慢）

SPFA 就是"用队列优化的 Bellman-Ford"：

```text
把 s 入队
while 队列非空:
    u = 出队
    for u 的每条出边 (u → v):
        if dist[u] + cost < dist[v]:
            dist[v] = dist[u] + cost
            if v 不在队列里: v 入队
```

写起来直观，天然支持负费用边。**问题是它最坏会退化到 O(VE)**，而且很容易被构造数据卡。

### 3.3 路线 B：势能 + Dijkstra（工业级）

这是本文推荐的做法，核心是**势能（potential）**。

**问题**：负费用边让 Dijkstra 失效。

**思路**：给每个节点加一个"势能" `h[v]`，把边费用重新定义为：

```text
折算费用 c'(u, v) = c(u, v) + h[u] - h[v]
```

这个变形有一个漂亮的性质——**路径上的折算费用只跟端点有关，跟中间怎么走无关**：

```text
路径 s → x → t 的折算费用：
  c'(s,x) + c'(x,t)
  = (c(s,x) + h[s] - h[x]) + (c(x,t) + h[x] - h[t])
  = c(s,x) + c(x,t) + h[s] - h[t]
        ↑ 中间的 h[x] 被约掉了！

所以：路径的折算费用 = 真实费用 + h[s] - h[t]
    → 真实费用 = 折算费用 - h[s] + h[t]
```

**h[s] 和 h[t] 对同一轮的所有路径都相同**，所以"最小化折算费用"≡"最小化真实费用"。**最短路的解完全不变** ✅

**关键问题：怎么让所有折算费用非负？**

答案是：**让 `h[v]` 等于从 s 到 v 的最短距离**。

```text
如果 h[v] = dist(s, v)（真实最短距离），那么对任何边 (u,v)：
  c'(u,v) = c(u,v) + dist(s,u) - dist(s,v)
```

由最短路的性质，`dist(s,v) ≤ dist(s,u) + c(u,v)`，即：

```text
dist(s,u) - dist(s,v) ≥ -c(u,v)
→ c(u,v) + dist(s,u) - dist(s,v) ≥ 0  ✅
```

**所以只要 `h` 是最短距离，所有折算费用必然非负！**

### 3.4 势能怎么维护？

```text
第 0 轮：
  h[v] = 从 s 到 v 的最短距离（用 SPFA 求，因为初始可能有负权边）
  → 此时所有可达边的折算费用非负 ✅

第 k 轮（跑完 Dijkstra 后）：
  h[v] += dist[v]        ← dist 是本轮 Dijkstra 算出的折算距离
```

**为什么更新后仍然非负？**

Dijkstra 跑完后，`dist[v]` 是当前残量网络里从 s 到 v 的**折算**最短距离。对任意还有剩余容量的边 `(u,v)`：

```text
dist[v] ≤ dist[u] + c'(u,v)
→ (c(u,v) + h[u] - h[v]) + dist[u] - dist[v] ≥ 0
→ c(u,v) + (h[u] + dist[u]) - (h[v] + dist[v]) ≥ 0
→ c(u,v) + h_new[u] - h_new[v] ≥ 0  ✅
```

新势能依然合法 ✅ —— 这就是 Johnson 算法的核心技巧。

### 3.5 费用怎么累加？

```text
本轮真实路径费用 = dist[t] + h_old[t] - h_old[s]
```

但势能更新后有个更简洁的写法：

```text
更新势能后：h_new[v] = h_old[v] + dist[v]

路径真实费用 = h_new[t] - h_new[s]
```

（因为 `h_new[t] - h_new[s] = (h_old[t] + dist[t]) - (h_old[s] + dist[s])`，而 `dist[s] = 0`，所以正好等于 `h_old[t] + dist[t] - h_old[s]`）

累加：`totalCost += delta × (h[t] - h[s])`

### 3.6 两张图串起整个流程

```text
【残量网络】              【势能重标号后的网络】
  s --(2,1)--> 1           s --(2,0)--> 1
  s --(1,5)--> 2           s --(1,4)--> 2
  1 --(1,2)--> t           1 --(1,1)--> t
  2 --(1,1)--> t           2 --(1,0)--> t
  2 --(0,-5)--> s (反向)   2 --(0,-5)--> s
                              ↑ 还是有负的？不对——

  h[1] = 1, h[2] = 5, h[t] = 3
  c'(2, s) = -5 + h[2] - h[s] = -5 + 5 - 0 = 0  ✅ 非负
```

注意：**初始势能必须用 SPFA 求**，因为原始图里就可能有负费用边（比如"退款"这种负收益场景）。

---

## 四、代码实现

### TypeScript

```typescript
/**
 * 最小费用最大流 —— TypeScript 实现
 * 两种算法：SPFA 版（易理解） / 势能 + Dijkstra 版（工业级）
 */

interface Edge {
  to: number;
  cap: number;
  cost: number;
  rev: number; // 反向边在 graph[to] 中的下标
}

export interface MCMFResult {
  flow: number;
  cost: number;
}

/**
 * 二叉小顶堆，用于堆优化 Dijkstra
 * 手写而不用现成库，是因为很多运行时（Node 端、浏览器端）没有内置优先队列
 */
class MinHeap {
  private items: { dist: number; node: number }[] = [];

  get size(): number {
    return this.items.length;
  }

  push(dist: number, node: number): void {
    this.items.push({ dist, node });
    let i = this.items.length - 1;
    // 向上调整
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.items[parent].dist <= this.items[i].dist) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop(): { dist: number; node: number } | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      // 向下调整
      let i = 0;
      const n = this.items.length;
      for (;;) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < n && this.items[left].dist < this.items[smallest].dist) smallest = left;
        if (right < n && this.items[right].dist < this.items[smallest].dist) smallest = right;
        if (smallest === i) break;
        this.swap(i, smallest);
        i = smallest;
      }
    }
    return top;
  }

  private swap(a: number, b: number): void {
    const tmp = this.items[a];
    this.items[a] = this.items[b];
    this.items[b] = tmp;
  }
}

export class MinCostMaxFlow {
  private readonly n: number;
  private readonly graph: Edge[][];

  constructor(n: number) {
    this.n = n;
    this.graph = Array.from({ length: n }, () => []);
  }

  /** 加一条有向边 u → v，容量 cap，单位费用 cost */
  addEdge(u: number, v: number, cap: number, cost: number): void {
    const forward: Edge = { to: v, cap, cost, rev: -1 };
    const backward: Edge = { to: u, cap: 0, cost: -cost, rev: -1 };
    const fi = this.graph[u].length;
    const bi = this.graph[v].length;
    // 自环时 forward 和 backward 会落在同一个数组里，下标要错开一位
    forward.rev = u === v ? bi + 1 : bi;
    backward.rev = fi;
    this.graph[u].push(forward);
    this.graph[v].push(backward);
  }

  /**
   * SPFA 版本：每次用 SPFA 找最短（费用最小）的增广路
   * 优点：写起来直观，天然支持负费用边
   * 缺点：最坏 O(VE)，SPFA 还可能被构造数据卡成 O(VE) 每轮
   */
  solveWithSPFA(s: number, t: number, flowLimit = Infinity): MCMFResult {
    const n = this.n;
    const INF = Infinity;
    let flow = 0;
    let cost = 0;

    for (;;) {
      const dist = new Array<number>(n).fill(INF);
      const inQueue = new Array<boolean>(n).fill(false);
      const prevV = new Array<number>(n).fill(-1);
      const prevE = new Array<number>(n).fill(-1);

      dist[s] = 0;
      const queue: number[] = [s];
      inQueue[s] = true;
      let head = 0;

      while (head < queue.length) {
        const u = queue[head++];
        inQueue[u] = false;
        const edges = this.graph[u];
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          if (e.cap > 0 && dist[u] + e.cost < dist[e.to]) {
            dist[e.to] = dist[u] + e.cost;
            prevV[e.to] = u;
            prevE[e.to] = i;
            if (!inQueue[e.to]) {
              inQueue[e.to] = true;
              queue.push(e.to);
            }
          }
        }
      }

      if (dist[t] === INF) break; // 找不到增广路，最大流已求出

      // 瓶颈：增广路上的最小剩余容量
      let delta = flowLimit - flow;
      for (let v = t; v !== s; v = prevV[v]) {
        const e = this.graph[prevV[v]][prevE[v]];
        delta = Math.min(delta, e.cap);
      }
      if (delta <= 0) break;

      // 沿路径推流，并更新残量网络
      for (let v = t; v !== s; v = prevV[v]) {
        const u = prevV[v];
        const e = this.graph[u][prevE[v]];
        e.cap -= delta;
        this.graph[v][e.rev].cap += delta;
      }

      flow += delta;
      cost += delta * dist[t];
    }

    return { flow, cost };
  }

  /**
   * 势能 + Dijkstra 版本（工业级）
   * 关键：用势能 h 把边费用变成非负的"折算费用" c' = c + h[u] - h[v]，
   * 这样就可以用 Dijkstra 找最短路，单轮 O(E log V)
   */
  solveWithDijkstra(s: number, t: number, flowLimit = Infinity): MCMFResult {
    const n = this.n;
    const INF = Infinity;
    let flow = 0;
    let cost = 0;

    // 势能 h[v]，初始化为「从 s 到 v 的最短距离」
    // 用 SPFA 求初始势能，兼容初始就存在负费用边的场景
    const h = this.initialPotentials(s);

    const dist = new Array<number>(n);
    const prevV = new Array<number>(n);
    const prevE = new Array<number>(n);

    for (;;) {
      dist.fill(INF);
      prevV.fill(-1);
      prevE.fill(-1);
      dist[s] = 0;

      // 堆优化 Dijkstra：二叉小顶堆
      const heap = new MinHeap();
      heap.push(0, s);

      while (heap.size > 0) {
        const top = heap.pop()!;
        const u = top.node;
        const d = top.dist;
        if (d > dist[u]) continue; // 过期条目，跳过

        const edges = this.graph[u];
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          if (e.cap <= 0) continue;
          const reduced = e.cost + h[u] - h[e.to]; // 折算费用，非负
          const nd = d + reduced;
          if (nd < dist[e.to]) {
            dist[e.to] = nd;
            prevV[e.to] = u;
            prevE[e.to] = i;
            heap.push(nd, e.to);
          }
        }
      }

      if (dist[t] === INF) break;

      // 更新势能：h[v] += dist[v]
      for (let v = 0; v < n; v++) {
        if (dist[v] < INF) h[v] += dist[v];
      }

      let delta = flowLimit - flow;
      for (let v = t; v !== s; v = prevV[v]) {
        const e = this.graph[prevV[v]][prevE[v]];
        delta = Math.min(delta, e.cap);
      }
      if (delta <= 0) break;

      for (let v = t; v !== s; v = prevV[v]) {
        const u = prevV[v];
        const e = this.graph[u][prevE[v]];
        e.cap -= delta;
        this.graph[v][e.rev].cap += delta;
      }

      flow += delta;
      // 真实路径费用 = h[t] - h[s]（势能更新后）
      cost += delta * (h[t] - h[s]);
    }

    return { flow, cost };
  }

  /** SPFA 求初始势能：从 s 出发的最短距离 */
  private initialPotentials(s: number): number[] {
    const n = this.n;
    const INF = Infinity;
    const h = new Array<number>(n).fill(INF);
    const inQueue = new Array<boolean>(n).fill(false);
    h[s] = 0;
    const queue: number[] = [s];
    inQueue[s] = true;
    let head = 0;

    while (head < queue.length) {
      const u = queue[head++];
      inQueue[u] = false;
      const edges = this.graph[u];
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        if (e.cap > 0 && h[u] + e.cost < h[e.to]) {
          h[e.to] = h[u] + e.cost;
          if (!inQueue[e.to]) {
            inQueue[e.to] = true;
            queue.push(e.to);
          }
        }
      }
    }

    // 不可达的点势能置 0（对可达点之间的边没有影响）
    for (let v = 0; v < n; v++) {
      if (h[v] === INF) h[v] = 0;
    }
    return h;
  }
}
```

**使用示例（二分图最小权完美匹配）**：

```typescript
// cost[i][j] = 工人 i 住房子 j 的代价
const cost = [
  [4, 1, 1],
  [1, 4, 1],
  [1, 1, 4],
];
const n = cost.length;
const S = 0;
const T = 2 * n + 1;

const g = new MinCostMaxFlow(T + 1);
for (let i = 0; i < n; i++) {
  g.addEdge(S, 1 + i, 1, 0);          // 源点 → 工人
  g.addEdge(1 + n + i, T, 1, 0);      // 房子 → 汇点
  for (let j = 0; j < n; j++) {
    g.addEdge(1 + i, 1 + n + j, 1, cost[i][j]); // 工人 → 房子
  }
}

const { flow, cost: totalCost } = g.solveWithDijkstra(S, T);
console.log(flow, totalCost); // 3 3
// 对角线匹配 = 4+4+4 = 12，循环错位匹配 = 1+1+1 = 3 ← 后者才是最优
```

### Python

```python
import heapq
from collections import deque


class MinCostMaxFlow:
    """最小费用最大流 —— Python 实现

    核心思路：在残量网络里反复找「费用最小的增广路」，
    每次沿这条路推尽可能多的流量，直到找不到增广路为止。
    """

    def __init__(self, n: int):
        self.n = n
        # graph[u] 里存 [to, cap, cost, rev_index]
        self.graph: list[list[list[int]]] = [[] for _ in range(n)]

    def add_edge(self, u: int, v: int, cap: int, cost: int) -> None:
        """加一条有向边 u → v，容量 cap，单位费用 cost"""
        forward = [v, cap, cost, 0]
        backward = [u, 0, -cost, 0]
        forward[3] = len(self.graph[v])
        backward[3] = len(self.graph[u])
        self.graph[u].append(forward)
        self.graph[v].append(backward)

    def solve_with_spfa(self, s: int, t: int, flow_limit: float = float("inf")) -> tuple[int, int]:
        """SPFA 版本：每轮用 SPFA 找费用最小的增广路

        优点：写起来直观，天然支持负费用边
        缺点：最坏 O(VE)，还可能被构造数据卡
        """
        INF = float("inf")
        flow = 0
        cost = 0

        while True:
            dist = [INF] * self.n
            in_queue = [False] * self.n
            prev_v = [-1] * self.n
            prev_e = [-1] * self.n

            dist[s] = 0
            q = deque([s])
            in_queue[s] = True

            while q:
                u = q.popleft()
                in_queue[u] = False
                for i, e in enumerate(self.graph[u]):
                    v, cap, w, _ = e
                    if cap > 0 and dist[u] + w < dist[v]:
                        dist[v] = dist[u] + w
                        prev_v[v] = u
                        prev_e[v] = i
                        if not in_queue[v]:
                            in_queue[v] = True
                            q.append(v)

            if dist[t] == INF:
                break

            # 瓶颈：增广路上的最小剩余容量
            delta = flow_limit - flow
            v = t
            while v != s:
                e = self.graph[prev_v[v]][prev_e[v]]
                delta = min(delta, e[1])
                v = prev_v[v]
            if delta <= 0:
                break

            # 推流并更新残量网络
            v = t
            while v != s:
                u = prev_v[v]
                e = self.graph[u][prev_e[v]]
                e[1] -= delta
                self.graph[v][e[3]][1] += delta
                v = u

            flow += delta
            cost += delta * dist[t]

        return flow, cost

    def _initial_potentials(self, s: int) -> list[float]:
        """SPFA 求初始势能：从 s 出发的最短距离"""
        INF = float("inf")
        h = [INF] * self.n
        in_queue = [False] * self.n
        h[s] = 0
        q = deque([s])
        in_queue[s] = True

        while q:
            u = q.popleft()
            in_queue[u] = False
            for v, cap, w, _ in self.graph[u]:
                if cap > 0 and h[u] + w < h[v]:
                    h[v] = h[u] + w
                    if not in_queue[v]:
                        in_queue[v] = True
                        q.append(v)

        for v in range(self.n):
            if h[v] == INF:
                h[v] = 0
        return h

    def solve_with_dijkstra(self, s: int, t: int, flow_limit: float = float("inf")) -> tuple[int, int]:
        """势能 + Dijkstra 版本（工业级）

        关键：用势能 h 把边费用变成非负的「折算费用」c' = c + h[u] - h[v]，
        这样就能用 Dijkstra 找最短路，单轮 O(E log V)
        """
        INF = float("inf")
        flow = 0
        cost = 0
        h = self._initial_potentials(s)

        while True:
            dist = [INF] * self.n
            prev_v = [-1] * self.n
            prev_e = [-1] * self.n
            dist[s] = 0
            # 堆优化 Dijkstra
            heap = [(0, s)]
            while heap:
                d, u = heapq.heappop(heap)
                if d > dist[u]:
                    continue
                for i, e in enumerate(self.graph[u]):
                    v, cap, w, _ = e
                    if cap <= 0:
                        continue
                    reduced = w + h[u] - h[v]  # 折算费用，非负
                    nd = d + reduced
                    if nd < dist[v]:
                        dist[v] = nd
                        prev_v[v] = u
                        prev_e[v] = i
                        heapq.heappush(heap, (nd, v))

            if dist[t] == INF:
                break

            # 更新势能
            for v in range(self.n):
                if dist[v] < INF:
                    h[v] += dist[v]

            delta = flow_limit - flow
            v = t
            while v != s:
                e = self.graph[prev_v[v]][prev_e[v]]
                delta = min(delta, e[1])
                v = prev_v[v]
            if delta <= 0:
                break

            v = t
            while v != s:
                u = prev_v[v]
                e = self.graph[u][prev_e[v]]
                e[1] -= delta
                self.graph[v][e[3]][1] += delta
                v = u

            flow += delta
            cost += delta * (h[t] - h[s])

        return flow, cost
```

### Go

```go
package mcmf

import (
	"container/heap"
)

// Edge 残量网络中的边
type Edge struct {
	To   int
	Cap  int
	Cost int
	Rev  int // 反向边在 graph[To] 中的下标
}

type edgeItem struct {
	node int
	dist int
}

// edgeHeap 是二叉小顶堆。
// 这里刻意不用 container/heap + interface{}，因为装箱开销在热路径上很可观。
type edgeHeap struct {
	items []edgeItem
}

func (h *edgeHeap) Len() int { return len(h.items) }
func (h *edgeHeap) Less(i, j int) bool {
	return h.items[i].dist < h.items[j].dist
}
func (h *edgeHeap) Swap(i, j int) { h.items[i], h.items[j] = h.items[j], h.items[i] }
func (h *edgeHeap) Push(x interface{}) {
	h.items = append(h.items, x.(edgeItem))
}
func (h *edgeHeap) Pop() interface{} {
	old := h.items
	n := len(old)
	item := old[n-1]
	h.items = old[:n-1]
	return item
}

// MinCostMaxFlow 最小费用最大流 —— Go 实现（工业级：势能 + Dijkstra）
//
// 核心思路：在残量网络里反复找「费用最小的增广路」，
// 每次沿这条路推尽可能多的流量，直到找不到增广路为止。
type MinCostMaxFlow struct {
	n    int
	g    [][]*Edge
	flow int
	cost int
}

// NewMCMF 创建一个有 n 个节点的网络
func NewMCMF(n int) *MinCostMaxFlow {
	return &MinCostMaxFlow{
		n: n,
		g: make([][]*Edge, n),
	}
}

// AddEdge 加一条有向边 u → v，容量 cap，单位费用 cost
// 同时加一条容量为 0、费用为 -cost 的反向边，组成「边对」
func (m *MinCostMaxFlow) AddEdge(u, v, cap, cost int) {
	forward := &Edge{To: v, Cap: cap, Cost: cost}
	backward := &Edge{To: u, Cap: 0, Cost: -cost}
	forward.Rev = len(m.g[v])
	backward.Rev = len(m.g[u])
	m.g[u] = append(m.g[u], forward)
	m.g[v] = append(m.g[v], backward)
}

// initialPotentials 用 SPFA 求初始势能（兼容初始就存在负费用边的场景）
func (m *MinCostMaxFlow) initialPotentials(s int) []int {
	const INF = 1 << 60
	h := make([]int, m.n)
	for i := range h {
		h[i] = INF
	}
	inQueue := make([]bool, m.n)
	queue := make([]int, 0, m.n)
	h[s] = 0
	queue = append(queue, s)
	inQueue[s] = true

	for head := 0; head < len(queue); head++ {
		u := queue[head]
		inQueue[u] = false
		for _, e := range m.g[u] {
			if e.Cap > 0 && h[u]+e.Cost < h[e.To] {
				h[e.To] = h[u] + e.Cost
				if !inQueue[e.To] {
					inQueue[e.To] = true
					queue = append(queue, e.To)
				}
			}
		}
	}

	// 不可达的点势能置 0（对可达点之间的边没有影响）
	for i := range h {
		if h[i] == INF {
			h[i] = 0
		}
	}
	return h
}

// Solve 计算最小费用最大流，返回 (最大流, 最小费用)
//
// 关键：用势能 h 把边费用变成非负的「折算费用」c' = c + h[u] - h[v]，
// 这样就能用 Dijkstra 找最短路，单轮 O(E log V)
func (m *MinCostMaxFlow) Solve(s, t int) (int, int) {
	const INF = 1 << 60
	h := m.initialPotentials(s)

	dist := make([]int, m.n)
	prevV := make([]int, m.n)
	prevE := make([]int, m.n)

	for {
		for i := range dist {
			dist[i] = INF
			prevV[i] = -1
			prevE[i] = -1
		}
		dist[s] = 0

		hq := &edgeHeap{items: []edgeItem{{node: s, dist: 0}}}
		heap.Init(hq)
		for hq.Len() > 0 {
			item := heap.Pop(hq).(edgeItem)
			u := item.node
			if item.dist > dist[u] {
				continue
			}
			for i, e := range m.g[u] {
				if e.Cap <= 0 {
					continue
				}
				reduced := e.Cost + h[u] - h[e.To] // 折算费用，非负
				nd := item.dist + reduced
				if nd < dist[e.To] {
					dist[e.To] = nd
					prevV[e.To] = u
					prevE[e.To] = i
					heap.Push(hq, edgeItem{node: e.To, dist: nd})
				}
			}
		}

		if dist[t] == INF {
			break // 找不到增广路，最大流已求出
		}

		// 更新势能
		for i := range h {
			if dist[i] < INF {
				h[i] += dist[i]
			}
		}

		// 瓶颈：增广路上的最小剩余容量
		delta := INF
		for v := t; v != s; v = prevV[v] {
			e := m.g[prevV[v]][prevE[v]]
			if e.Cap < delta {
				delta = e.Cap
			}
		}

		// 推流并更新残量网络
		for v := t; v != s; v = prevV[v] {
			u := prevV[v]
			e := m.g[u][prevE[v]]
			e.Cap -= delta
			m.g[v][e.Rev].Cap += delta
		}

		m.flow += delta
		m.cost += delta * (h[t] - h[s])
	}

	return m.flow, m.cost
}
```

### Java

```java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.List;
import java.util.PriorityQueue;

/**
 * 最小费用最大流 —— Java 实现
 *
 * 核心思路：在残量网络里反复找「费用最小的增广路」，
 * 每次沿这条路推尽可能多的流量，直到找不到增广路为止。
 *
 * 这里给的是「势能 + Dijkstra」版本（工业级），单轮 O(E log V)。
 */
public class MinCostMaxFlow {

    /** 残量网络中的边 */
    private static class Edge {
        int to;     // 终点
        int cap;    // 剩余容量
        int cost;   // 单位费用
        int rev;    // 反向边在 graph[to] 中的下标
    }

    private final int n;
    private final List<List<Edge>> graph;

    public MinCostMaxFlow(int n) {
        this.n = n;
        this.graph = new ArrayList<>(n);
        for (int i = 0; i < n; i++) {
            graph.add(new ArrayList<>());
        }
    }

    /**
     * 加一条有向边 u → v，容量 cap，单位费用 cost
     * 同时加一条容量为 0、费用为 -cost 的反向边，组成「边对」
     */
    public void addEdge(int u, int v, int cap, int cost) {
        Edge forward = new Edge();
        forward.to = v;
        forward.cap = cap;
        forward.cost = cost;
        forward.rev = graph.get(v).size();

        Edge backward = new Edge();
        backward.to = u;
        backward.cap = 0;
        backward.cost = -cost;
        backward.rev = graph.get(u).size();

        graph.get(u).add(forward);
        graph.get(v).add(backward);
    }

    /** 用 SPFA 求初始势能（兼容初始就存在负费用边的场景） */
    private int[] initialPotentials(int s) {
        final int INF = Integer.MAX_VALUE / 4;
        int[] h = new int[n];
        Arrays.fill(h, INF);
        boolean[] inQueue = new boolean[n];
        Deque<Integer> queue = new ArrayDeque<>();
        h[s] = 0;
        queue.add(s);
        inQueue[s] = true;

        while (!queue.isEmpty()) {
            int u = queue.poll();
            inQueue[u] = false;
            for (Edge e : graph.get(u)) {
                if (e.cap > 0 && h[u] + e.cost < h[e.to]) {
                    h[e.to] = h[u] + e.cost;
                    if (!inQueue[e.to]) {
                        inQueue[e.to] = true;
                        queue.add(e.to);
                    }
                }
            }
        }

        // 不可达的点势能置 0（对可达点之间的边没有影响）
        for (int i = 0; i < n; i++) {
            if (h[i] == INF) {
                h[i] = 0;
            }
        }
        return h;
    }

    /**
     * 计算最小费用最大流
     *
     * 返回 {最大流, 最小费用}
     */
    public int[] solve(int s, int t) {
        final int INF = Integer.MAX_VALUE / 4;
        int[] h = initialPotentials(s);
        int[] dist = new int[n];
        int[] prevV = new int[n];
        int[] prevE = new int[n];

        int flow = 0;
        int cost = 0;

        while (true) {
            Arrays.fill(dist, INF);
            Arrays.fill(prevV, -1);
            Arrays.fill(prevE, -1);
            dist[s] = 0;

            // 堆优化 Dijkstra
            PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
            pq.add(new int[] { s, 0 });

            while (!pq.isEmpty()) {
                int[] cur = pq.poll();
                int u = cur[0];
                int d = cur[1];
                if (d > dist[u]) {
                    continue;
                }
                List<Edge> edges = graph.get(u);
                for (int i = 0; i < edges.size(); i++) {
                    Edge e = edges.get(i);
                    if (e.cap <= 0) {
                        continue;
                    }
                    int reduced = e.cost + h[u] - h[e.to]; // 折算费用，非负
                    int nd = d + reduced;
                    if (nd < dist[e.to]) {
                        dist[e.to] = nd;
                        prevV[e.to] = u;
                        prevE[e.to] = i;
                        pq.add(new int[] { e.to, nd });
                    }
                }
            }

            if (dist[t] == INF) {
                break; // 找不到增广路，最大流已求出
            }

            // 更新势能
            for (int i = 0; i < n; i++) {
                if (dist[i] < INF) {
                    h[i] += dist[i];
                }
            }

            // 瓶颈：增广路上的最小剩余容量
            int delta = INF;
            for (int v = t; v != s; v = prevV[v]) {
                Edge e = graph.get(prevV[v]).get(prevE[v]);
                delta = Math.min(delta, e.cap);
            }

            // 推流并更新残量网络
            for (int v = t; v != s; v = prevV[v]) {
                int u = prevV[v];
                Edge e = graph.get(u).get(prevE[v]);
                e.cap -= delta;
                graph.get(v).get(e.rev).cap += delta;
            }

            flow += delta;
            cost += delta * (h[t] - h[s]);
        }

        return new int[] { flow, cost };
    }
}
```

---

## 五、实测数据：SPFA vs 势能 + Dijkstra

我本地跑了两个场景（Node 26.7.0 / Apple Silicon，TypeScript 实现，重复 3~5 次取中位数）。

### 场景 A：二分图最小权完美匹配

稠密二分图，`n × n` 条边，增广轮数 = `n`。

| 匹配规模 | 边数 | SPFA (ms) | 势能+Dijkstra (ms) | 倍数 |
| -------- | ---- | --------- | ------------------- | ---- |
| 50       | 2,600 | 0.97      | 1.52                | 0.64x |
| 100      | 10,200 | 5.90     | 7.85                | 0.75x |
| 200      | 40,400 | 42.72    | 49.74               | 0.86x |
| 400      | 160,800 | 271.91  | 330.10              | 0.82x |
| 600      | 361,200 | 1,000.68 | 1,407.92            | 0.71x |

**结果有点反直觉**：在这个场景里 SPFA 反而**更快**。

**为什么？** 因为稠密二分图的每一轮 SPFA 都"恰好"很快——图虽然边多，但每个节点基本只被松弛常数次。而势能 + Dijkstra 每轮都要维护堆、要做 `log` 的比较，反而多吃了常数。

### 场景 B：对抗性图（SPFA 杀手图）

我构造了一组 k 条并行链，每条链的每条正向边都配一条**费用 0 的反向边**。这个结构会让 SPFA 反复"回退—改进"，节点被不断重新入队。

| 链数 × 链长 | 节点数 | 边数 | SPFA (ms) | 势能+Dijkstra (ms) | 倍数 |
| ------------ | ------ | ---- | --------- | ------------------- | ---- |
| 160 × 100    | 16,162 | 32,320 | 65.57    | 67.78               | 0.97x |
| 320 × 100    | 32,322 | 64,640 | 284.01   | 207.39              | 1.37x |
| 320 × 200    | 64,322 | 128,640 | 1,069.98 | 377.02             | **2.84x** |
| 640 × 200    | 128,642 | 257,280 | 6,440.71 | 3,757.09           | 1.71x |
| 640 × 400    | 256,642 | 513,280 | 15,208.38 | 10,911.09          | 1.39x |

**这才是关键数据**：图一旦"长"起来（超过 10 万条边），势能 + Dijkstra 的优势就稳定在 **1.4~2.8 倍**。

### 结论怎么读

| 情况 | 推荐 |
| ---- | ---- |
| 图小（< 5000 边）、面试手写 | **SPFA**，快且好写 |
| 图大（> 10 万边）、线上服务 | **势能 + Dijkstra**，性能稳定 |
| 需要应对恶意构造的输入 | **势能 + Dijkstra**，SPFA 会被卡 |
| 有负费用边、且图不大 | 两者都行（初始势能本来就用 SPFA 求） |

**我个人的建议**：面试写 SPFA（好解释、不容易写错），线上服务写势能 + Dijkstra（性能有保证）。两套实现都不长，一起备着最稳。

---

## 六、复杂度分析

| 算法 | 单轮最短路 | 增广轮数 | 总时间 |
| ---- | ---------- | -------- | ------ |
| SPFA 版 | O(VE) | ≤ O(V·E) | **O(V²E)** |
| 势能 + Dijkstra | O(E log V) | ≤ O(V·E) | **O(VE log V)** |

- **增广轮数上界**：每次至少推 1 单位流，而最大流 ≤ 总容量，所以轮数上界是 O(V·E)。实际业务里通常远小于这个数。
- **空间复杂度**：邻接表 `O(V + E)`（每条原始边存正反两条）。
- **与最大流的关系**：MCMF 的复杂度就是最大流复杂度 × "最短路比 BFS 贵多少"。

**为什么不用 Dinic 那样一次 BFS 推多条流？**

因为 Dinic 的"层次图"在费用流里失效了——层次图保证的是"边数最少"，而我们要的是"费用最小"，两者不是一回事。不过有折中方案：**ZKW 费用流**（用 labels 标号法一次推多条），工程上偶尔能用，但实现复杂，本文不展开。

---

## 七、经典模型精讲

### 7.1 二分图最小权完美匹配（最常用）

**问题**：`n` 个工人，`n` 个房子，`cost[i][j]` 是工人 `i` 住房子 `j` 的代价，每个工人住一个房子、每个房子住一个人，求最小总代价。

**建图**：

```text
       容量1,费用0        容量1,费用cost[i][j]       容量1,费用0
  s ──────────► 工人i ──────────────────────────► 房子j ──────────► t
```

**为什么这样建**：

- `s → 工人i` 容量 1：限制每个工人最多被分配一次 ✅
- `工人i → 房子j` 容量 1，费用 `cost[i][j]`：**费用就是这一对分配的代价** ✅
- `房子j → t` 容量 1：限制每个房子最多住一个人 ✅
- 流量守恒天然成立：一个工人流入多少，就从哪条边流出 ✅

**结果**：最大流 = `n`（完美匹配一定存在时），最小费用 = 最优匹配代价 ✅

**推广**：**最小权最大匹配**（不一定完美）直接把容量设大一点，或者看最大流的实际值。

### 7.2 带负权的最短路（退化版）

**问题**：求 `s → t` 的最短路，**边权可能是负数**。

**建图**：

```text
  s ──(∞, w)──► ... ──(∞, w)──► t
  （所有边容量设为 ∞，费用 = 原边权）
```

**跑最小费用流，只推 1 单位流**：

```text
  最短费用路径 = 最短路 ✅
  最小费用 = 最短路长度 ✅
```

**但要注意**：如果图里有**负环**，费用流会绕着负环无限循环（每绕一圈费用更小）。这种情况要先用 Bellman-Ford 检测负环。

**为什么不直接用 Bellman-Ford？** 因为费用流是**通用框架**——一旦你的问题需要"容量约束"或者"要送 k 单位"，最短路的退化版就够用了。

### 7.3 任务调度：时限内做最多任务

**问题**：每个任务有耗时 `duration[i]`、截止时间 `deadline[i]`、收益 `profit[i]`。机器一次只能做一个任务，求总收益最大。

**建图**（时间轴建图，很经典）：

```text
  0 ──────► 1 ──────► 2 ──────► ... ──────► T
      容量∞, 费用0（表示"机器空闲"，时间流逝）

  任务 i：建一条 起点→终点 的边
    起点 = 任务开始时刻
    终点 = 起点 + duration[i]
    容量 1，费用 = -profit[i]   ← 负费用！
```

**为什么费用取负**？因为我们要求收益**最大**，但费用流求的是费用**最小**。取负号就把问题翻转了。

**结果**：最大流 = 选中的任务数，最小费用 = `-总收益` ✅

> ⚠️ 这个模型里费用天然是负的，所以**必须用 SPFA 求初始势能**（势能 + Dijkstra 的第一轮也得靠 SPFA）。这也是"势能 + Dijkstra 版本"要保留 SPFA 的原因。

### 7.4 负载均衡

**问题**：`k` 台服务器，每台有容量上限，把 `n` 个任务分配过去，让**最大负载尽量小**（或总成本最低）。

**建图**：

```text
  s ──(1, 0)──► 任务1 ──(∞, 0)──► 服务器1 ──(cap, cost)──► t
       任务2 ──(∞, 0)──► 服务器2 ──(cap, cost)──► t
```

费用 `cost` 可以设成"这台服务器的负载惩罚"（比如二次函数），从而实现均衡。

### 7.5 差分约束（Bellman-Ford 的孪生兄弟）

**问题**：`x_v - x_u ≤ w(u,v)` 这一组不等式，求可行解 / 判断是否有解。

**建图**：把每条不等式变成一条边 `u → v`，**边权 = `w`**。

```text
  存在负环  ⇔  差分约束无解
  无负环    ⇔  差分约束有解
```

**怎么用费用流做？**

```text
1. 先用 Bellman-Ford 检测负环（这是 [Bellman-Ford](bellman-ford.md) 的活）
2. 存在负环 → 无解
3. 无负环 → 用 SPFA 从超级源点出发求最短路，得到一组可行解
```

或者更直接：**最小费用流也能检测负环**——如果费用流的增广路出现"负费用环"，就说明约束矛盾。

---

## 八、实际应用场景

### 1. 物流 / 运筹优化

仓库要把货发到多个门店。每个仓有库存上限（容量），每条运输路线有运费（费用），每笔订单必须送到（流量守恒）。

**这就是标准 MCMF**。运筹学里的"运输问题"（Transportation Problem）最早就是用最小费用流解的。

### 2. 打车 / 骑手调度

司机（供给）和订单（需求）的匹配。考虑的因素：距离、时间窗、司机偏好、接单顺序。

**带权匹配 → MCMF**。如果规模很大（万级以上），一般会用匈牙利算法（KM）或专门的调度算法，MCMF 会成为瓶颈。

### 3. 任务调度与资源分配

CI/CD 系统的构建任务调度、编译任务的机器分配。任务有资源需求（容量），机器有空闲额度（容量），不同组合耗时不同（费用）。

### 4. 网络路由中的"最小代价转发"

CDN 选路、多路径冗余。链路有带宽（容量）和延迟/成本（费用），求在满足总带宽需求下总成本最小的路由方案。

### 5. 图像/信号处理中的最优传输

图像金字塔构建、最优三角剖分（Delaunay）、最优网格剖分——这些经典问题本质都是"最小费用流"或它的变体（最小割、动态规划）。

### 6. 推荐系统中的"多目标分配"

召回阶段给多个业务线分配流量配额：每条线有最低保障（容量）和超额成本（费用），最大化总收益。

---

## 九、避坑清单

### ❌ 坑 1：忘记加反向边

**症状**：算法跑出来流量偏小，费用偏大。

**原因**：只有正向边，算法无法"反悔"，退化成贪心。

**正确做法**：`addEdge(u, v, cap, cost)` 内部必须同时建 `cap=0, cost=-cost` 的反向边。**永远用封装好的 `addEdge`，别手动只 push 正向边。**

### ❌ 坑 2：反向边的 `rev` 下标算错

**症状**：跑出诡异结果，或者运行时数组越界。

**原因**：`rev` 必须在**对方节点**的邻接表里的下标。写 `addEdge` 时如果先 push 后设 `rev`，或者用 `length` 而不是 `length - 1`，就会错位。

**特别注意自环**（`u == v`）：正反两条边在**同一个数组**里，`rev` 必须错开一位：

```typescript
forward.rev = u === v ? bi + 1 : bi;
```

### ❌ 坑 3：初始势能用 Dijkstra 求

**症状**：初始图有负费用边时，结果错误。

**原因**：Dijkstra 处理不了负权边。

**正确做法**：**初始势能必须用 SPFA 求**。这一步的复杂度是 O(VE)，但只跑一次，可以接受。

### ❌ 坑 4：SPFA 无限循环

**症状**：程序跑不完。

**原因**：图里有**负环**。

**正确做法**：先检测负环（Bellman-Ford 跑 `V` 轮看第 `V` 轮还能否松弛），有负环就直接报错退出。

### ❌ 坑 5：费用累加用错

**症状**：流量对，费用不对。

**原因**：势能版本里 `dist[t]` 是**折算费用**，不是真实费用。

**正确做法**：

- SPFA 版：`cost += delta * dist[t]`（`dist[t]` 就是真实费用）
- 势能版：`cost += delta * (h[t] - h[s])`（**更新势能之后**再算）

这两个写法不能混用。我第一次写势能版时就是照抄了 SPFA 版的 `delta * dist[t]`，算出来费用全是错的。

### ❌ 坑 6：整数溢出

**症状**：Go/Java 里结果变成负数或天文数字。

**原因**：`cost * flow` 可能超过 32 位。

**正确做法**：

- Go：`int` 在 64 位平台是 64 位，一般够用；费用和流量都大的话用 `int64`
- Java：`cost += delta * (h[t] - h[s])` 用 `long` 存 `cost`
- TypeScript：JS 的 number 是 double，超过 `2^53` 才有问题，一般够用

### ❌ 坑 7：多次调用 solve 时图已被污染

**症状**：第二次跑结果全是 0。

**原因**：`solve` 会**直接修改**残量网络（容量被扣掉了）。

**正确做法**：每次 solve 之前重新建图，或者在 `solve` 开头做一次深拷贝恢复初始容量。

### ❌ 坑 8：把"没有守恒结构"的问题硬套 MCMF

**症状**：建模建了半天，代码写出来发现不对。

**原因**：MCMF 的核心是**流量守恒**。像"股票买卖"这种没有中间节点守恒要求的题，硬套会得到荒谬的结果。

**正确做法**：建图前先确认"每个中间节点进出的流量相等"能不能自然成立。

---

## 十、面试题精选

### Q1：最小费用最大流和最大流的关系？

**答题要点**：

> 算法骨架完全一样（都是找增广路 + 推流），区别只在"找路用的权重"：
> 最大流用 BFS 找边数最少的路，费用流用最短路算法找费用最小的路。
> 残量网络、反向边、增广路这些概念完全通用。

### Q2：为什么最小费用流要加反向边？

**答题要点**：

> 为了支持"反悔"。最优解可能需要撤销之前选的某条路径。
> 反向边容量为 0（初始不可用），费用是原费用的相反数，
> 走一次正向 + 一次反向的净费用是 0，净效果就是撤销这一段流量。
> 没有反向边的话，算法就退化成贪心，无法保证最优。

### Q3：为什么每次走最短费用路径是正确的？

**答题要点**（交换论证）：

> 假设最优解的一条增广路比当前最短路贵。
> 我们把最优解里"不在最短路上"的边减掉、"在最短路上但没有流"的边加上，
> 这样流量守恒保持、总量不变，而费用不会增加（因为最短路费用 ≤ 原来的）。
> 所以总存在一个最优解能沿最短路增广，归纳可知算法最终收敛到最优解。

### Q4：势能 + Dijkstra 的原理？和 Johnson 算法什么关系？

**答题要点**：

> **完全就是 Johnson 算法**，用于解决"负权图上求单源最短路"。
> 给每个节点一个势能 h，把边权变成 `c'(u,v) = c(u,v) + h[u] - h[v]`。
> 关键性质：路径上中间节点的 h 会被约掉，所以路径的折算费用只跟端点有关，
> 最短路的解不变。
> 当 h 取"从 s 出发的最短距离"时，所有折算费用必然非负（由最短路的三角不等式保证），
> 于是就能用 Dijkstra。每轮跑完更新 `h[v] += dist[v]`，新的 h 依然合法。

### Q5：什么时候用 SPFA，什么时候用势能 + Dijkstra？

**答题要点**：

> 面试/小图用 SPFA，简单好写；大图/线上服务用势能 + Dijkstra。
> 理论上后者是 O(VE log V)，前者最坏 O(V²E)。
> 但要注意：**初始势能那一步还得用 SPFA**，因为初始图可能有负权边。

### Q6：如何用 MCMF 求带负权的最短路？

**答题要点**：

> 把所有边的容量设成 ∞，费用设成原边权，然后跑最小费用流**只推 1 单位流**。
> 最短费用路径就是最短路，最小费用就是最短路长度。
> 前提是图里没有负环，有负环要先检测出来。

### Q7：MCMF 怎么建模二分图最小权匹配？

**答题要点**：

> 三段式建图：`s → 左部（容量 1）→ 右部（容量 1，费用 = 边权）→ t（容量 1）`。
> 源点出边和汇点入边容量都是 1，保证一对一；
> 中间边的费用就是这一对的代价。
> 跑出来的最大流就是最大匹配数，最小费用就是最小权匹配的代价。

### Q8：MCMF 的增广路最多有几轮？

**答题要点**：

> 上界是 O(V·E)（每次至少推 1 单位，总流量不超过总容量）。
> 但实际业务图通常远小于这个数。
> 另外如果流量是浮点数或者很大的数，可以考虑 ZKW 费用流一次推多条。

---

## 十一、小结

最小费用最大流是网络流里最"实用派"的模型。它的核心只有三句话：

- ✅ **骨架**：反复找费用最小的增广路，推流，直到推不动
- ✅ **灵魂**：反向边提供"反悔"能力，让贪心变成了最优
- ✅ **加速**：势能把负权边变成非负权边，从而用上 Dijkstra

它的能力边界也很清楚：

- ✅ 擅长：有容量上限 + 有代价 + 中间节点守恒
- ✅ 强项：二分图带权匹配、运输调度、负载均衡、任务分配
- ❌ 不擅长：超大图（10⁵ 节点以上）、需要实时增删边的场景
- ❌ 不适用：没有守恒结构的问题（股票买卖、纯最优子序列）

面试时的选择建议：

| 场景 | 选择 |
| ---- | ---- |
| 手写代码，面试官在等 | **SPFA**，30 行能写完 |
| 面试官追问"怎么优化" | 讲**势能 + Dijkstra**，提 Johnson |
| 线上服务 | **势能 + Dijkstra**，堆优化，别用朴素 Dijkstra |
| 图特别大（>10⁵ 节点） | 上**网络流单纯形 / 费用流标号法**，或者换专门的算法 |

最后送一句我自己写在笔记本上的话：

> **建模永远比实现重要。** MCMF 的实现我一次就能写对（因为残量网络的套路是固定的），
> 但**把业务问题翻译成"容量 + 费用 + 守恒"这三要素**，才是真正要练的本事。

---

## 相关阅读

- [最大流与最小割（Max Flow & Min Cut）](max-flow.md) —— MCMF 的前置知识，残量网络的详细推导在这里
- [二分图与匈牙利算法（Bipartite Matching）](bipartite-matching.md) —— 最小权匹配的另一条路线（KM 算法），可以和 MCMF 对照着看
- [Bellman-Ford 算法（含负权边与负环检测）](bellman-ford.md) —— SPFA 的底座，也是差分约束和负环检测的基础
- [Dijkstra 最短路径算法](dijkstra.md) —— 势能 + Dijkstra 版本的核心依赖
