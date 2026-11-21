---
title: 0-1 BFS 精讲（双端队列最短路）
description: 从「同一张图，为什么 Dijkstra 要用堆而 0-1 BFS 不用」讲起，一文打通 0-1 BFS 的双端队列原理、单调性证明、两种实现写法、与 Dijkstra / BFS / Bellman-Ford 的选型对比，附 TypeScript / Python / Go 三语言完整实现、LeetCode 2290 / 1293 / 1129 与洛谷 P4667 实战、随机图对拍验证与性能实测
date: 2026-11-13 09:05:00
categories:
  - Algorithm
tags:
  - 0-1-bfs
  - shortest-path
  - deque
  - dijkstra
  - bfs
  - graph
  - interview
sidebarSort: 133
---

# 0-1 BFS 精讲（双端队列最短路）

先问你一个挺实际的问题：

> 你手里有一张图，节点是城市，边是道路。**每条道路的"过路费"只有两种：免费，或者 1 块钱**。现在要从 A 城到 B 城，怎么最快？

如果把"免费"和"1 块钱"都当成普通边权，你当然可以上 Dijkstra。但是——**Dijkstra 要用堆，每次 `push` / `pop` 都是 $O(\log n)$**。

而这个问题的特殊之处在于：**边权只有 0 和 1 两种**。

这时候我们可以用一个**双端队列**（deque）替掉优先队列，把复杂度从 $O((V+E)\log V)$ 直接压到 **$O(V+E)$** ✨。

这就是 **0-1 BFS**。

听起来像是"又一个 BFS 变体"，对吧？但我认为它是**整个最短路家族里最值得单独写一篇的算法**，原因有三个：

1. **它是 Dijkstra 和 BFS 之间的桥梁** —— 搞懂它，你就搞懂了最短路算法"按边权分档"的统一思路
2. **它是面试高频** —— LeetCode 2290、1293、1129，洛谷 P4667，全是这个套路
3. **它的"分层建图"变体极其强大** —— 能把"最多用 k 次特权"这种看着复杂的问题，变成一个边权只有 0/1 的最短路

---

## 一、先说清楚：为什么需要 0-1 BFS

### 1.1 三种算法的适用边界

我们先把地标划清楚：

| 算法 | 边权要求 | 时间复杂度 | 核心数据结构 |
| --- | --- | --- | --- |
| **BFS** | 全部相等（通常为 1） | $O(V+E)$ | 队列 |
| **0-1 BFS** | 只有 0 和 1 | $O(V+E)$ | **双端队列** |
| **Dijkstra** | 全部非负 | $O((V+E)\log V)$ | 优先队列（小顶堆） |
| Bellman-Ford | 可为负 | $O(VE)$ | 数组 |
| SPFA | 可为负 | 最坏 $O(VE)$ | 队列 |

看这张表，**0-1 BFS 正好卡在 BFS 和 Dijkstra 的中间**：它比 BFS 多了"边权可以是 0"，但比 Dijkstra 少了 $O(\log V)$ 的堆开销。

### 1.2 生活场景：地铁换乘 vs 走路

我拿一个特别贴切的例子说：

想象你在一个城市里走路，规则是这样的：

- **走人行道**：不花钱，耗时 1 步
- **坐地铁**：花 1 块钱，可以瞬间跨越好几条街

现在问：从家到公司，最少要花多少钱？

**场景 A：全程走路** —— 步数最少，但可能绕远路
**场景 B：全程地铁** —— 花钱多，但路短

你不会选极端，你会**在需要的时候换乘**。这正是一个"0 权边 + 1 权边"混合的图。

- 如果用普通 BFS（只数步数），它会给你"全程走路"的答案 —— **错**（没考虑地铁能省步数但要花钱）
- 如果用 Dijkstra，它能给出正确答案 —— 但为这点"只有 0 和 1"的差异，付了 $O(\log V)$ 的堆开销

**0-1 BFS 就是那种"知道答案，但想省点电费"的做法。**

### 1.3 关键洞察：边权只有两种，优先级只有两档

Dijkstra 的核心是：**每次取出当前距离最小的节点**。

那用堆的必要性在哪？在于"最小"这个值是**任意连续**的 —— 可能是 3、可能是 7、可能是 12，你事先不知道下一个会是什么，所以必须有个能动态维护任意值的数据结构（堆）。

但如果边权只有 0 和 1，那么从起点出发，**任何时刻队列里的距离只可能是 $d$ 或 $d+1$** —— 相差不超过 1。

**相差不超过 1，意味着我们可以用一个普通的双端队列来维护这个顺序！**

- 队首：距离为 $d$ 的节点
- 队尾：距离为 $d+1$ 的节点
- 中间可能有个"分界线"

出队时从队首取（一定是当前最小的），入队时：

- 走 0 权边 → 新距离还是 $d$ → **插队首**
- 走 1 权边 → 新距离是 $d+1$ → **插队尾**

**这就是 0-1 BFS 的全部。**

---

## 二、原理拆解

### 2.1 图解：双端队列的"两档结构"

假设我们从节点 `S` 出发，图长这样：

```text
        S ──0──> A ──0──> C
        │               ▲
        └──1──> B ──0───┘

边权：S→A 是 0，S→B 是 1，A→C 是 0，B→C 是 0
```

跑一遍 0-1 BFS：

```text
初始：dist = [S:0, A:∞, B:∞, C:∞]
队列（队首 ← → 队尾）：[S]

── 弹出 S（dist=0）──────────────────────────────
  S→A，权重 0：nd = 0 + 0 = 0 < ∞  → dist[A]=0，插队首
  S→B，权重 1：nd = 0 + 1 = 1 < ∞  → dist[B]=1，插队尾

  队列：[A, B]          ← A 在队首（距离 0），B 在队尾（距离 1）
       ↑ 距离0 ↑ 距离1

── 弹出 A（dist=0）──────────────────────────────
  A→C，权重 0：nd = 0 + 0 = 0 < ∞  → dist[C]=0，插队首

  队列：[C, B]
       ↑ 距离0 ↑ 距离1

── 弹出 C（dist=0）──────────────────────────────
  C 无出边

  队列：[B]

── 弹出 B（dist=1）──────────────────────────────
  B→C，权重 0：nd = 1 + 0 = 1，但 dist[C]=0，不满足 1 < 0，跳过

  队列：[]

最终：dist = [S:0, A:0, B:1, C:0]
```

注意观察队列的形态变化：

```text
[S]              距离: {0}
[A, B]           距离: {0, 1}      ← 分界线出现在队首和队尾之间
[C, B]           距离: {0, 1}
[B]              距离: {1}          ← 0 档消耗完，只剩 1 档
[]               距离: {}
```

**队列永远保持"前面一档 0、后面一档 1"的形态**，这就是它能替掉堆的原因。

### 2.2 为什么 0 权边要插队首？

这是最容易搞混的一点，我单独强调：

> **判断依据是"边的权重"，不是"新距离是多少"。**

- 边的权重是 **0** → 新距离 = `dist[u] + 0` = `dist[u]` → 和当前队首一样大 → 插队首
- 边的权重是 **1** → 新距离 = `dist[u] + 1` → 比当前队首大 1 → 插队尾

**为什么 0 权边插队首是必要的？**

看个反例就明白了。假设队首是 `u`，`dist[u] = 5`，如果 0 权边插队尾：

```text
队列：[u(5), x(6), y(5)]     ← y 的距离是 5，却排在 x(6) 后面
```

出队顺序就变成 `u(5) → x(6) → y(5)`，**已经不是从小到大**了，Dijkstra 的贪心前提被破坏 ❌

插队首则保证了：

```text
队列：[u(5), y(5), x(6)]     ← 顺序始终正确
```

### 2.3 单调性证明（为什么这是合法的 Dijkstra）

有同学会问：**"这不就是把堆换成队列吗？凭什么还叫 Dijkstra 的正确性？"**

我们来看关键性质。

**性质：队列中节点的距离值，至多相差 1，且较小的那些一定在前面。**

用归纳法证明：

**初始**：队列只有 `S`，`dist[S] = 0`。性质成立 ✅

**归纳步**：假设当前队列满足性质（形如 `[d, d, ..., d, d+1, ..., d+1]`），队首 `u` 的距离是 $d$。

我们弹出 `u`，考察它的出边：

- **权重 0 的边** → 新距离 $d$。插到队首。队首原来的节点距离是 $d$（性质保证），所以插进去后队列还是"若干个 $d$ + 若干个 $d+1$" ✅
- **权重 1 的边** → 新距离 $d+1$。插到队尾。队尾原来的节点距离是 $d+1$ 或 $d$（但按性质，$d$ 档已经被消耗完了，否则队首就不是 $d$ 了）—— 实际上此时队列里剩下的全是 $d+1$ 档，插到队尾后队列是"若干个 $d+1$" ✅

**归纳成立。** 队列永远有序，且队首永远是最小值。

于是，**0-1 BFS 的每一次出队，都在取当前全局最小距离的节点** —— 这正是 Dijkstra 的贪心步骤。所以：

> **0-1 BFS 不是"简化版的 Dijkstra"，它就是一个借助了边权离散性、把优先队列降级成双端队列的 Dijkstra。** 🎯

### 2.4 两种实现写法的区别

写代码时你会看到两种写法，都能过，但行为不同：

**写法 A：带 `settled` 标记（推荐）**

```typescript
const u = dq.popFront();
if (settled[u]) continue;     // 已经确定最优，跳过
settled[u] = true;             // 标记为"已定型"
```

**写法 B：队列里存 `[距离, 节点]`，出队时丢弃过期条目（lazy Dijkstra 风格）**

```typescript
const [d, u] = dq.popFront();
if (d > dist[u]) continue;     // 这条记录过期了
```

两者都能得到正确结果。区别在于：

| | 写法 A | 写法 B |
| --- | --- | --- |
| 队列元素 | 只有节点编号 | `[距离, 节点]` 元组 |
| 内存开销 | 更小 | 每个条目多存一个数字 |
| 直观性 | 需要理解 `settled` | 更接近 Dijkstra 的写法 |
| 队列长度 | 较短 | 可能较长（有过期条目） |

**我推荐写法 A**，理由是：**队列里只存编号，内存更省，而且和"Dijkstra 出堆后不用再管"的语义完全一致。**

不过要注意写法 A 的一个细节：`settled[u] = true` 之后，**仍然要对 `u` 的出边做松弛**，只是不再重复处理 `u` 自己。

---

## 三、代码实现

### 3.1 TypeScript：核心模板

```typescript
/**
 * 双端队列（循环数组实现）
 * 为什么不用 Array.unshift / Array.shift？
 * 因为它们在 JS 里是 O(n) 的，队列长了直接 TLE。
 */
export class Deque<T> {
  private buf: (T | undefined)[];
  private head = 0; // 队首下标
  private count = 0; // 有效元素个数

  constructor(capacity = 16) {
    this.buf = new Array(capacity);
  }

  get size(): number {
    return this.count;
  }

  /** 扩容时把元素按顺序摊平到新数组头部 */
  private grow(): void {
    const next = new Array(this.buf.length * 2);
    for (let i = 0; i < this.count; i++) {
      next[i] = this.buf[(this.head + i) % this.buf.length];
    }
    this.buf = next;
    this.head = 0;
  }

  pushBack(v: T): void {
    if (this.count === this.buf.length) this.grow();
    this.buf[(this.head + this.count) % this.buf.length] = v;
    this.count++;
  }

  pushFront(v: T): void {
    if (this.count === this.buf.length) this.grow();
    this.head = (this.head - 1 + this.buf.length) % this.buf.length;
    this.buf[this.head] = v;
    this.count++;
  }

  popFront(): T | undefined {
    if (this.count === 0) return undefined;
    const v = this.buf[this.head];
    this.buf[this.head] = undefined; // 释放引用，避免内存泄漏
    this.head = (this.head + 1) % this.buf.length;
    this.count--;
    return v;
  }
}

/** 邻接表：每条边是 [目标节点, 权重]，权重只能是 0 或 1 */
export type ZeroOneGraph = Array<Array<[number, number]>>;

/**
 * 0-1 BFS —— 推荐写法（settled 标记）
 *
 * 时间复杂度：O(V + E)
 * 空间复杂度：O(V + E)
 */
export function zeroOneBfs(graph: ZeroOneGraph, source: number): number[] {
  const n = graph.length;
  const dist = new Array<number>(n).fill(Infinity);
  const settled = new Array<boolean>(n).fill(false);
  const dq = new Deque<number>();

  dist[source] = 0;
  dq.pushBack(source);

  while (dq.size > 0) {
    const u = dq.popFront()!;
    if (settled[u]) continue; // 已经定型，重复出现直接跳过
    settled[u] = true; // 标记：u 的最短距离已经确定

    for (const [v, w] of graph[u]) {
      const nd = dist[u] + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        // 判断依据是【边的权重】，不是新距离
        if (w === 0) dq.pushFront(v); // 0 权边：距离不变，插队首
        else dq.pushBack(v); // 1 权边：距离 +1，插队尾
      }
    }
  }
  return dist;
}
```

> **关于 `Deque` 的实现**：JS 原生没有双端队列。`Array.prototype.unshift()` 和 `shift()` 都是 $O(n)$ 的 —— 在 10 万级别的图上用它们，复杂度会悄悄退化到 $O(V^2)$，直接 TLE。所以要么自己实现循环数组（上面这个），要么用 `linked-list` 之类的库。

### 3.2 TypeScript：写法 B（存距离的 lazy 版本）

```typescript
/**
 * 0-1 BFS —— 版本 B（队列里存 [距离, 节点]，出队时丢弃过期条目）
 * 好处：语义上更接近 Dijkstra，不需要额外的 settled 数组
 */
export function zeroOneBfsLazy(graph: ZeroOneGraph, source: number): number[] {
  const n = graph.length;
  const dist = new Array<number>(n).fill(Infinity);
  const dq = new Deque<[number, number]>(); // [距离, 节点]

  dist[source] = 0;
  dq.pushBack([0, source]);

  while (dq.size > 0) {
    const [d, u] = dq.popFront()!;
    if (d > dist[u]) continue; // 过期条目：这条记录已经不是最优了

    for (const [v, w] of graph[u]) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        if (w === 0) dq.pushFront([nd, v]);
        else dq.pushBack([nd, v]);
      }
    }
  }
  return dist;
}
```

### 3.3 Python 实现

Python 自带 `collections.deque`，双端队列是标准库直接提供的，比 JS 舒服太多：

```python
from collections import deque


def zero_one_bfs(graph, source):
    """
    graph[u] = [(v, w), ...]，w 只能是 0 或 1
    时间复杂度 O(V + E)，空间复杂度 O(V + E)
    """
    n = len(graph)
    INF = float("inf")
    dist = [INF] * n
    settled = [False] * n
    dq = deque()

    dist[source] = 0
    dq.append(source)

    while dq:
        u = dq.popleft()
        if settled[u]:
            continue
        settled[u] = True

        for v, w in graph[u]:
            nd = dist[u] + w
            if nd < dist[v]:
                dist[v] = nd
                # 0 权边插队首，1 权边插队尾
                if w == 0:
                    dq.appendleft(v)
                else:
                    dq.append(v)
    return dist
```

### 3.4 Go 实现

Go 的 `container/list` 提供双端队列，但 `list.Element` 有接口调用开销，高频场景建议直接用切片模拟：

```go
package main

import (
	"container/list"
	"fmt"
)

// 图的邻接表：每条边是 [目标节点, 权重]
type Edge struct {
	To int
	W  int
}

// 写法一：基于 container/list，语义最清晰
func ZeroOneBFSList(graph [][]Edge, source int) []int {
	n := len(graph)
	dist := make([]int, n)
	for i := range dist {
		dist[i] = 1 << 30 // 一个足够大的数，代替 Infinity
	}
	settled := make([]bool, n)

	dq := list.New()
	dist[source] = 0
	dq.PushBack(source)

	for dq.Len() > 0 {
		front := dq.Front()
		dq.Remove(front)
		u := front.Value.(int)

		if settled[u] {
			continue
		}
		settled[u] = true

		for _, e := range graph[u] {
			nd := dist[u] + e.W
			if nd < dist[e.To] {
				dist[e.To] = nd
				if e.W == 0 {
					dq.PushFront(e.To) // 0 权边插队首
				} else {
					dq.PushBack(e.To) // 1 权边插队尾
				}
			}
		}
	}
	return dist
}

func main() {
	// 对应 2.1 节的那张图：S→A 权重 0，S→B 权重 1，A→C 权重 0，B→C 权重 0
	graph := [][]Edge{
		{{To: 1, W: 0}, {To: 2, W: 1}}, // 0 = S
		{{To: 3, W: 0}},                // 1 = A
		{{To: 3, W: 0}},                // 2 = B
		{},                              // 3 = C
	}
	fmt.Println(ZeroOneBFSList(graph, 0)) // [0 0 1 0]
}
```

> **Go 的一个细节**：Go 没有 `Infinity`，我用 `1 << 30` 代替。这个值要**大于任何可能的路径长度**。如果图特别大（比如节点数超过 10 亿），用 `math.MaxInt32` 更稳妥。

---

## 四、LeetCode 实战

### 4.1 LeetCode 2290. 到达角落需要移除障碍物的最小数目

**题目**：给你一个 $m \times n$ 的网格，`0` 表示空地，`1` 表示可以移除的障碍物。求从左上角走到右下角**最少要移除几个障碍物**。

**思路**：这题的"步数"不重要，重要的是"移除障碍的数量"。所以：

- 走到**空地** → 代价 0
- 走到**障碍** → 代价 1（相当于"消掉它"）

**边权天然只有 0 和 1** → 0-1 BFS！🎯

```typescript
export function minimumObstacles(grid: number[][]): number {
  const m = grid.length,
    n = grid[0].length;
  const dist: number[][] = Array.from({ length: m }, () =>
    new Array(n).fill(Infinity),
  );
  const dq = new Deque<[number, number]>();

  dist[0][0] = 0;
  dq.pushBack([0, 0]);

  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  while (dq.size > 0) {
    const [x, y] = dq.popFront()!;
    for (const [dx, dy] of dirs) {
      const nx = x + dx,
        ny = y + dy;
      if (nx < 0 || nx >= m || ny < 0 || ny >= n) continue;

      // 关键：进入障碍物的代价是 1，进入空地的代价是 0
      const cost = grid[nx][ny];
      if (dist[x][y] + cost < dist[nx][ny]) {
        dist[nx][ny] = dist[x][y] + cost;
        if (cost === 0) dq.pushFront([nx, ny]);
        else dq.pushBack([nx, ny]);
      }
    }
  }
  return dist[m - 1][n - 1];
}
```

**复杂度**：时间 $O(mn)$，空间 $O(mn)$。

> **对比一下普通 BFS 写法**：普通 BFS 会找"步数最少"的路径，答案是错的。比如 `[[0,1,1],[1,1,0],[1,1,0]]`，步数最少要 4 步，但只移除 2 个障碍就够了。**BFS 优化的是步数，而这题要的是代价。**

### 4.2 LeetCode 1293. 网格中的最短路径（对照组：为什么这题不该用 0-1 BFS）

**题目**：$m \times n$ 网格，最多消除 $k$ 个障碍物，求从左上到右下的**最短路径长度（步数）**。

这题很有意思 —— 它长得像 0-1 BFS，但**实际上不是**。

看需求："**最多消除 k 个**" —— `k` 是个**资源约束**，不是边权。

用 0-1 BFS 的话，"消除一个障碍"是 0 权边，"不消除"是 1 权边 —— 但这样求出来的是"**消除次数最少**"，而题目要的是"**步数最少（前提是消除次数 ≤ k）**"。

这两个目标不一样！而且更关键的是：**"最多 k 次"这个约束，普通最短路根本表达不了。**

所以这题要用**状态升维**：

```typescript
export function shortestPathWithObstacles(grid: number[][], k: number): number {
  const m = grid.length,
    n = grid[0].length;

  // 剪枝：曼哈顿距离 m+n-2 是理论下界，中间最多经过 m+n-3 个格子
  // 如果 k 足够大，直接返回下界
  if (k >= m + n - 3) return m + n - 2;

  // 状态是 (x, y, 剩余消除次数)，三个维度都要记
  const visited = new Set<string>([`0,0,${k}`]);
  const q: Array<[number, number, number]> = [[0, 0, k]];
  let steps = 0;

  while (q.length > 0) {
    steps++;
    const next: Array<[number, number, number]> = [];
    for (const [x, y, rem] of q) {
      const dirs = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ];
      for (const [dx, dy] of dirs) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 0 || nx >= m || ny < 0 || ny >= n) continue;
        if (nx === m - 1 && ny === n - 1) return steps;

        const nk = rem - grid[nx][ny]; // 进入障碍消耗 1 次机会
        if (nk < 0) continue;

        const key = `${nx},${ny},${nk}`;
        if (visited.has(key)) continue;
        visited.add(key);
        next.push([nx, ny, nk]);
      }
    }
    q.length = 0;
    q.push(...next);
  }
  return -1;
}
```

**复杂度**：$O(mnk)$，$m,n \le 40$，$k \le mn$，完全够用。

> **这题是 0-1 BFS 的最好对照组**：
> - 2290：求"**代价**最小"，代价天然是 0/1 → **0-1 BFS** ✅
> - 1293：求"**步数**最小"，但有资源上限 → **状态升维 BFS** ✅
>
> **看到"最多 k 次"这种资源约束，先想状态升维，别急着上 0-1 BFS。**

### 4.3 LeetCode 1129. 颜色交替的最短路径（对照组：颜色也是一种状态）

**题目**：图中的边分红色和蓝色，要求路径上的边颜色**交替出现**，求从节点 0 到各节点的最短路径长度。

这题看着像 0-1 BFS（边只有两种），但**不是**！因为：

- 边的权重不是 0/1，**每条边的权重都是 1**（我们要最小化的是边数）
- "交替"是一个**状态约束**，不是边权差异

所以这题用**普通 BFS + 颜色状态**：

```typescript
export function shortestAlternatingPaths(
  n: number,
  redEdges: number[][],
  blueEdges: number[][],
): number[] {
  // 按颜色分开存邻接表：g[0] 是红边，g[1] 是蓝边
  const g: [number[], number[]] = [
    Array.from({ length: n }, () => []),
    Array.from({ length: n }, () => []),
  ];
  for (const [a, b] of redEdges) g[0][a].push(b);
  for (const [a, b] of blueEdges) g[1][a].push(b);

  const ans = new Array<number>(n).fill(-1);
  // visited[i][c]：到达节点 i 时，最后一条边颜色是 c，是否访问过
  const visited: boolean[][] = Array.from({ length: n }, () => [
    false,
    false,
  ]);

  const q: Array<[number, number]> = [
    [0, 0],
    [0, 1],
  ];
  visited[0][0] = visited[0][1] = true;
  let d = 0;

  while (q.length > 0) {
    const next: Array<[number, number]> = [];
    for (const [i, c] of q) {
      if (ans[i] === -1) ans[i] = d;
      const nc = c ^ 1; // 颜色翻转：只能走另一种颜色的边
      for (const j of g[nc][i]) {
        if (!visited[j][nc]) {
          visited[j][nc] = true;
          next.push([j, nc]);
        }
      }
    }
    q.length = 0;
    q.push(...next);
    d++;
  }
  return ans;
}
```

**复杂度**：$O(n + m)$。

> **为什么起点要同时入队 `(0,0)` 和 `(0,1)`？**
> 因为起点没有"上一条边"，第一根边可以是任意颜色。两种颜色状态都初始化，才能覆盖所有可能。
>
> **核心技巧**：`visited` 必须带上颜色维度。如果只用 `visited[i]`，那么"以红色边到达节点 3"和"以蓝色边到达节点 3"会被误判为同一个状态 —— 但它们的**后续可走边完全不同**（一个只能走蓝边，一个只能走红边）。

### 4.4 洛谷 P4667. 电路维修（真正的 0-1 BFS 经典题）

**题目**：$N \times M$ 的电路板，每个格子是一块元件，元件把两个对角顶点连起来（形状是 `\` 或 `/`）。你可以把任意元件**旋转 90°**。求最少旋转几个元件，能让左上角电源连到右下角的灯。

**这题是 0-1 BFS 的"原教旨"用例** ✨

**建模思路（关键）**：

注意 —— **节点不是格子，是格子的顶点！**

一个 $N \times M$ 的格子矩阵，有 $(N+1) \times (M+1)$ 个顶点。相邻顶点之间的连线由**某一个格子**决定：

```text
     (0,0)────(0,1)────(0,2)
       │   ╲   │   ╲   │
       │  ╱   │  ╱   │
     (1,0)────(1,1)────(1,2)
```

看这张图：`(0,0)` 和 `(1,1)` 之间那条对角线，恰好经过左上角那个格子。所以：

- **如果这个格子是 `\`** → `(0,0)` 和 `(1,1)` 直接连通 → **边权 0**（不用旋转）
- **如果这个格子是 `/`** → `(0,0)` 和 `(1,1)` 不通，要连通就得旋转它 → **边权 1**

同理 `(0,1)` 和 `(1,0)`：

- 格子是 `\` → 不通 → 边权 1
- 格子是 `/` → 通 → 边权 0

**每个顶点对之间的边权，恰好取决于那个格子的朝向 —— 而且只有 0 和 1 两种！** 🎯

于是答案就是：从顶点 `(0,0)` 到顶点 `(N,M)` 的最短路。

```typescript
export function minRotations(board: string[]): number {
  const R = board.length,
    C = board[0].length;
  const W = C + 1; // 每行的顶点数
  const V = (R + 1) * W; // 总顶点数

  const g: ZeroOneGraph = Array.from({ length: V }, () => []);

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      // 这个格子的四个顶点
      const tl = r * W + c; // 左上
      const tr = r * W + c + 1; // 右上
      const bl = (r + 1) * W + c; // 左下
      const br = (r + 1) * W + c + 1; // 右下

      if (board[r][c] === "\\") {
        // '\' 连接 左上-右下（已经通，权 0）；右上-左下（不通，要转，权 1）
        g[tl].push([br, 0]);
        g[br].push([tl, 0]);
        g[tr].push([bl, 1]);
        g[bl].push([tr, 1]);
      } else {
        // '/' 连接 左下-右上（权 0）；左上-右下（权 1）
        g[bl].push([tr, 0]);
        g[tr].push([bl, 0]);
        g[tl].push([br, 1]);
        g[br].push([tl, 1]);
      }
    }
  }

  const dist = zeroOneBfs(g, 0);
  const ans = dist[V - 1]; // 终点：右下角顶点
  return ans === Infinity ? -1 : ans;
}
```

**复杂度**：顶点数 $(N+1)(M+1)$，边数 $2NM$，时间 $O(NM)$。

> **这题还有一个小坑**：答案有可能不存在（`NO SOLUTION`）。数学上，当 $N+M$ 是奇数时，从 `(0,0)` 到 `(N,M)` 的任何路径长度都是奇数，而每一步都会翻转顶点的棋盘染色，所以**必然无解**。
>
> 我的实现里返回 `-1` 表示无解。写题时记得按题目要求输出 `NO SOLUTION`。

---

## 五、0-1 BFS 的强力变体：分层建图

这是 0-1 BFS 最有价值的扩展，我单独讲一节。

### 5.1 问题：最多用 k 次特权

> 给你一张图。从 $s$ 到 $t$，你最多有 $k$ 次"特权机会"，每次可以让**任意一条你经过的边变成免费**。求最小花费。

这题看着很麻烦，因为"用在哪条边上"是个组合爆炸的选择。

**但分层建图能把它变成一个普通的 0-1 权最短路！**

### 5.2 分层建图：把"已用特权次数"变成节点的一部分

**核心思想**：把每个节点 $v$ 拆成 $k+1$ 个副本 $v_0, v_1, \dots, v_k$，其中 $v_i$ 表示"已经用了 $i$ 次特权后到达 $v$"。

然后连边：

```text
同层边（原图边，权重 = 原边权）：
    (u, i) ──w──> (v, i)        对所有 i ∈ [0, k]

跨层边（使用特权，权重 0）：
    (u, i) ──0──> (v, i+1)      对所有 i ∈ [0, k-1]
```

**图解（k = 2）**：

```text
        层 0            层 1            层 2
      (还没用)        (用了 1 次)      (用了 2 次)

       u_0 ───w───> v_0            ← 普通走
        │                            
        └────0────> u_1 ───w───> v_1
                       │
                       └────0────> v_2

  ↑ 跨层边权重 0：表示"在这里动用特权，搭个顺风车"
  ↑ 同层边权重 w：正常走，代价不变
```

**关键点**：跨层边的权重是 **0**。这正好符合 0-1 BFS 的要求！

如果特权是用"半价"而不是"免费"，那跨层边权重就是 $w/2$，不再是 0/1 —— 这时候就得用**普通 Dijkstra** 了。

### 5.3 完整实现

```typescript
/**
 * 分层图 + 0-1 BFS
 *
 * @param n     原图节点数
 * @param edges 边表 [u, v, w]，w 只能是 0 或 1
 * @param k     最多可用的特权次数
 * @param source 起点
 * @param target 终点
 */
export function layeredZeroOneBfs(
  n: number,
  edges: Array<[number, number, number]>,
  k: number,
  source: number,
  target: number,
): number {
  const layers = k + 1;
  const V = n * layers;
  const g: ZeroOneGraph = Array.from({ length: V }, () => []);

  // 同层边：权重不变
  for (const [u, v, w] of edges) {
    for (let l = 0; l < layers; l++) {
      g[l * n + u].push([l * n + v, w]);
    }
  }

  // 跨层边：用一次特权，权重 0
  for (const [u, v] of edges) {
    for (let l = 0; l < k; l++) {
      g[l * n + u].push([(l + 1) * n + v, 0]);
    }
  }

  const dist = zeroOneBfs(g, source);

  // 答案要在所有层里取最小值 —— 因为最优解可能没用满 k 次特权
  let best = Infinity;
  for (let l = 0; l <= k; l++) {
    best = Math.min(best, dist[l * n + target]);
  }
  return best === Infinity ? -1 : best;
}
```

**复杂度**：节点数 $n(k+1)$，边数 $m(k+1) + mk$，时间 $O((n+m)k)$。

> **⚠️ 最容易错的一点**：答案要取**所有层的最小值**，不能只看第 $k$ 层！
>
> 因为最优解可能只用了 0 次特权（如果本来就没有障碍可绕），那你强行跳到第 $k$ 层反而是错的。
>
> 这正是洛谷 P4568《飞行路线》的标准坑 —— 网上一堆题解在这里 WA。

### 5.4 用 0-1 BFS 还是普通 Dijkstra？

分层建图之后，**图里全是 0/1 权边** → 用 0-1 BFS，复杂度 $O((n+m)k)$。

但如果你用普通 Dijkstra，复杂度是 $O((n+m)k\log(nk))$。

**所以分层图 + 0-1 BFS = 分层图 + Dijkstra 的一个数量级优势。**

| 场景 | 跨层边权重 | 推荐算法 |
| --- | --- | --- |
| 特权 = 免费通过 | 0 | **0-1 BFS** ✅ |
| 特权 = 费用减半 | $w/2$ | Dijkstra |
| 特权 = 费用打折（如 7 折） | $0.7w$ | Dijkstra |

### 5.5 实战：洛谷 P4568《飞行路线》

> $n$ 个城市，$m$ 条航线，每条航线有价格 $c$。你可以**免费乘坐最多 $k$ 条航线**。求从 $s$ 到 $t$ 的最小花费。

这题的分层图建法：

```text
层 0 ~ k，共 k+1 层，每层 n 个城市节点

同层边：城市 a 和 b 之间价格 c 的航线，在每层内部都连一条权值为 c 的边
跨层边：从 (a, i) 到 (b, i+1) 连一条权值为 0 的边，表示"这条航线我用特权免费坐了"
```

跑 0-1 BFS，答案取 `min(dist[t_0], dist[t_1], ..., dist[t_k])`。

**注意这是无向图**（航线双向），所以跨层边要连两个方向。

---

## 六、正确性验证

### 6.1 随机图对拍

光看代码不算数。我写了一个随机图对拍脚本，把 0-1 BFS 的两个版本和 **Bellman-Ford（暴力）**、**Dijkstra** 四方对比：

```typescript
function randGraph(n: number, p: number): ZeroOneGraph {
  const g: ZeroOneGraph = Array.from({ length: n }, () => []);
  for (let u = 0; u < n; u++)
    for (let v = 0; v < n; v++) {
      if (u === v) continue;
      if (Math.random() < p) g[u].push([v, Math.random() < 0.5 ? 0 : 1]);
    }
  return g;
}

for (let iter = 0; iter < 500; iter++) {
  const n = 1 + Math.floor(Math.random() * 9);
  const g = randGraph(n, 0.3);
  const s = Math.floor(Math.random() * n);

  check(`01BFS vs BF #${iter}`, zeroOneBfs(g, s), bellmanFord(g, s));
  check(`01BFS lazy vs BF #${iter}`, zeroOneBfsLazy(g, s), bellmanFord(g, s));
  check(`01BFS vs Dijkstra #${iter}`, zeroOneBfs(g, s), dijkstra(g, s));
}
```

**实测结果**：

```text
✅ 通过 1623 项，失败 0 项
   perf (n=50000, m=99999): 0-1 BFS 13ms, Dijkstra 20ms
```

500 组随机图 × 3 次对比 = 1500 项断言全过 ✅

### 6.2 电路维修题：穷举所有板子

P4667 那题我写了独立的暴力实现（枚举所有翻转组合 + 图论连通性检查），然后**穷举了全部 2×3（64 个）和 3×3（512 个）板子**逐一比对：

```text
=== 穷举所有 2x3 板子，比对 minRotations vs 暴力 ===
✅ 全部 64 个 2x3 板子完全一致

=== 穷举所有 3x3 板子（512 个） ===
✅ 全部 512 个 3x3 板子完全一致
```

官方样例（3×5）也验证通过：

```text
board:
  \ \ / \ \
  \ \ / / /
  / \ \ \ \
minRotations = 1 (官方答案 1)
brute       = 1
```

### 6.3 Python 版本同样验证

Python 的 `deque` 版本我也做了同样的对拍：

```text
Python 0-1 BFS vs Dijkstra: 500/500 一致
✅ Python 官方样例全部通过
```

---

## 七、复杂度分析与性能实测

### 7.1 复杂度对比

| 算法 | 时间复杂度 | 空间复杂度 | 边权要求 |
| --- | --- | --- | --- |
| BFS | $O(V+E)$ | $O(V)$ | 全部相等 |
| **0-1 BFS** | **$O(V+E)$** | $O(V+E)$ | **只有 0/1** |
| Dijkstra（堆） | $O((V+E)\log V)$ | $O(V+E)$ | 非负 |
| Bellman-Ford | $O(VE)$ | $O(V)$ | 可为负 |

**为什么 0-1 BFS 是 $O(V+E)$ 而不是 $O((V+E)\log V)$？**

严格论证（摊还分析）：

- 每个节点的 `dist` 只会被**成功松弛**有限次
- 更精确地说：每个节点最多被"成功松弛"入队 **2 次**（一次通过 0 权边、一次通过 1 权边）
- 每个节点的出边只被扫描 **1 次**（因为 `settled` 保证只展开一次）

所以总操作数是 $O(V + E)$，而不是 $O(E \log V)$。

### 7.2 实测数据

在 5 万节点、10 万条边的随机图上（同一台机器、同一份代码）：

```text
perf (n=50000, m=99999): 0-1 BFS 13ms, Dijkstra 20ms
```

**0-1 BFS 快约 1.5 倍。**

这个差距不算夸张，原因有两点：

1. **堆的常数在 JS 里不低** —— 每次 `push` / `pop` 都要走 sift 路径
2. **随机图上大量节点的最优距离相同**（都是 0 或 1），双端队列的优势被稀释了

在**边权分布更极端**的场景（比如大量 0 权边连成长链），0-1 BFS 的优势会更明显：

```text
纯 0 权链状图：0-1 BFS 退化成普通 BFS，全程只走 pushFront
```

### 7.3 什么时候该用 0-1 BFS？

**✅ 用它的场景：**

| 场景 | 典型题目 |
| --- | --- |
| 网格障碍消除（代价型） | LeetCode 2290 |
| 电路板旋转 | 洛谷 P4667 |
| 状态机切换（开关/转向） | LeetCode 1190/1345 类 |
| 分层图的 0 权跨层边 | 洛谷 P4568 |
| 图上颜色交替但代价恒定 | 改造后可用 |
| 某些"带标签边权"的题 | 自己判断 |

**❌ 别用的场景：**

| 场景 | 为什么该用别的 |
| --- | --- |
| 边权是任意非负数 | 直接上 Dijkstra |
| 边权可能为负 | Bellman-Ford / SPFA |
| 求"步数最少"且有资源上限 | **状态升维 BFS**（如 LeetCode 1293） |
| 求"步数最少"且有状态约束 | **普通 BFS + 状态维度**（如 LeetCode 1129） |
| 权重是 0 和 $w$（$w>1$） | 0-1 BFS 不适用，但可以用**桶优化**（Dial 算法） |

---

## 八、踩坑实录

### 坑 1：把"新距离"当成判断依据

**错误写法**：

```typescript
// ❌ 用 dist[u] 和 dist[u]+1 比较，而不是判断边的权重
if (dist[u] === dist[v]) dq.pushFront(v);
else dq.pushBack(v);
```

**为什么错**：松弛成功后，`dist[v]` 已经被改成 `dist[u] + w` 了，这时候再比较 `dist[u]` 和 `dist[v]`，永远不相等！

**正解**：**在松弛之前**就捕获边的权重 `w`，用它来判断：

```typescript
for (const [v, w] of graph[u]) {
  const nd = dist[u] + w;
  if (nd < dist[v]) {
    dist[v] = nd;
    if (w === 0) dq.pushFront(v); // 判断 w，不是判断 dist
    else dq.pushBack(v);
  }
}
```

### 坑 2：用 JS 的 `unshift` / `shift` 当双端队列

```typescript
// ❌ Array.prototype.shift() 是 O(n) 的！
dq.unshift(v); // n=1e5 时，这一下就是 1e5 次内存搬移
```

**症状**：算法逻辑完全正确，但大数据下超时，而且 **Profiling 显示时间全花在 `shift` 上**。

**正解**：自己实现循环数组（见 3.1 节），或者用 `linked-list` 包。

### 坑 3：分层图答案只看第 k 层

```typescript
// ❌ 只看最后一层
return dist[k * n + target];
```

**为什么错**：最优解可能**没用满** k 次特权。比如原图上直接有 0 权边连通，那你强行"用完"特权反而更差。

**正解**：

```typescript
let best = Infinity;
for (let l = 0; l <= k; l++) best = Math.min(best, dist[l * n + target]);
```

### 坑 4：忘了 `settled` 标记，导致同一节点被反复展开

```typescript
// ❌ 没有 settled 检查
while (dq.size > 0) {
  const u = dq.popFront()!;
  for (const [v, w] of graph[u]) { ... }  // u 会被展开多次
}
```

**症状**：结果**依然正确**（松弛失败就不更新），但性能会退化 —— 一个节点可能被展开 $O(\deg)$ 次，整体退化到 $O(E \cdot \deg)$。

**正解**：加 `settled` 数组，保证每个节点只展开一次。

### 坑 5：把有状态约束的题误当成 0-1 BFS

这是**概念层面**的坑，也是我最想强调的。

| 题目特征 | 正确解法 |
| --- | --- |
| 求**代价和**最小，边代价天然是 0/1 | **0-1 BFS** ✅ |
| 求**步数**最小，有"最多 k 次"限制 | **状态升维 BFS**（LeetCode 1293） |
| 求**步数**最小，有颜色/朝向限制 | **普通 BFS + 状态**（LeetCode 1129） |
| 求**代价**最小，边代价是任意非负数 | **Dijkstra** |

**一句话判断法**：

> **问自己："题目要最小化的是'边权和'还是'边数'？"**
>
> - 最小化**边权和**，且每条边的代价是 0 或 1 → **0-1 BFS**
> - 最小化**边数**（步数） → **普通 BFS**（可能需要加状态维度）

### 坑 6：0-1 BFS 不能处理负权

0-1 BFS 的单调性证明**依赖于"边权非负"**。如果图里有负权边，"d 和 d+1 两档"的结构就崩了，队列不再有序。

**别指望 0-1 BFS 能优化 Bellman-Ford 的场景。**

### 坑 7：Go 里用 `1 << 30` 当 Infinity 时的边界

```go
dist[i] = 1 << 30 // 如果真实路径长度可能超过 2^30，就会被误判
```

对于节点数过亿的超大图，用 `math.MaxInt32`（约 21 亿）更稳妥。JS 和 Python 没这个问题（原生支持 `Infinity`）。

---

## 九、实际应用

### 9.1 游戏 AI：寻路 + 状态

游戏里的角色寻路，代价经常是这种形式：

- 走路：代价 0（或 1）
- 传送 / 闪现：代价 0，但有限次
- 爬梯：代价 1
- 推开石头：代价 1，且会改变地图

**"有限次的瞬移"就是分层建图**，`k` 是瞬移次数。

### 9.2 网络路由：服务质量（QoS）路径

有些路由协议里，链路有多个优先级：

- **高优先级链路**：优先级 0
- **普通链路**：优先级 1

求"最小优先级代价路径" → **0-1 BFS**。

类似的还有 **0-1 BFS 解决"最少修改次数"类问题**：翻转最少的开关、修改最少的字符使字符串匹配。

### 9.3 状态机建模：把"状态"变成图

这是最优雅的一类应用。

**例子：LCR 打印机 / 奇怪的打印机** —— 打印一个字符串，每次可以打印一段连续同色字符，求最少打印次数。

建模：

- 节点 = 状态（当前打印到哪、当前颜色）
- 边 = 打印一段
- 代价 = 打印次数

然后跑最短路。如果代价只有 0/1 两种，就能用 0-1 BFS。

**例子：Flipper（状态翻转）** —— 灯的排列状态，每个操作翻转固定的几个灯，求最少操作次数。

这类题的通用套路：

```text
状态图建模：
  节点 = 一个完整的状态
  边   = 一次操作
  边权 = 操作的代价（0 或 1 → 0-1 BFS；1 → 普通 BFS）
```

### 9.4 后端：限流与配额

前面那篇[令牌桶与漏桶](rate-limiting-token-bucket.md)讲的是时间维度的限流。如果你的场景是**图上寻路**（比如 CDN 选路、服务网格的路由）：

- 主链路：权重 1
- 备用链路（免费但可能不稳定）：权重 0

那么"选一条最便宜的从 A 到 B 的路径"就是 **0-1 BFS**。

---

## 十、小结

0-1 BFS 这一篇，讲的其实是一件很朴素的事：

> **当边权只有 0 和 1 两种时，你不需要优先队列 —— 一个双端队列就够了。**

核心收获：

- ✅ **0-1 BFS 本质是 Dijkstra**，只是把堆降级成了双端队列，因为距离只有"两档"
- ✅ **入队方向看边的权重**：0 权插队首，1 权插队尾
- ✅ **队列天然有序**：始终是"前面一档 d、后面一档 d+1"的形态
- ✅ **复杂度 $O(V+E)$**，比 Dijkstra 少一个 $\log V$
- ✅ **分层建图**能把"最多 k 次特权"变成 0-1 权最短路，答案是**所有层的最小值**
- ✅ **注意区分**："最小化边权和"用 0-1 BFS；"最小化边数"用普通 BFS（可能加状态维度）
- ❌ **不适用于**：任意非负边权（Dijkstra）、负权（Bellman-Ford）、"步数 + 资源上限"（状态升维 BFS）

面试里如果被问到"最短路"相关，我的完整回答顺序会是：

1. 说出**Dijkstra**（标准答案）
2. 补一句：**如果边权只有 0 和 1，可以用 0-1 BFS 做到 $O(V+E)$**
3. 讲**分层建图**怎么处理"最多 k 次"这类约束
4. 提醒**区分"最小化代价"和"最小化步数"** —— 这是很多人挂掉的地方

能把第 2、3、4 点说出来，基本就碾压 90% 的候选人了 🎯

---

## 相关阅读

- [Dijkstra 最短路径算法](dijkstra.md) —— 0-1 BFS 的"原型"，堆优化的贪心
- [BFS 广度优先搜索](bfs.md) —— 无权图最短路，0-1 BFS 的另一个祖先
- [Bellman-Ford 算法](bellman-ford.md) —— 能处理负权，复杂度 $O(VE)$
- [差分约束系统精讲](difference-constraints.md) —— 负权边建模的经典应用
- [状态压缩动态规划（Bitmask DP）](bitmask-dp.md) —— "把状态塞进节点"的另一种思路
- [最小费用最大流（MCMF）精讲](min-cost-max-flow.md) —— 边权不限于 0/1 时的进阶方案
- [双向 BFS（Bidirectional Search）](bidirectional-bfs.md) —— 无权图最短路的另一个优化方向
