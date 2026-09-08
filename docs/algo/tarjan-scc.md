---
title: Tarjan 强连通分量算法
description: Tarjan 算法求解强连通分量 —— 图论经典，DFS + 时间戳 + 栈，一遍搞定
date: 2026-09-06 09:01:14
categories:
  - Algorithm
tags:
  - tarjan
  - strongly-connected-components
  - graph
  - dfs
  - leetcode
sidebarSort: 80
---

# Tarjan 强连通分量算法

你有没有遇到过这样的面试题：给你一个有向图，怎么把里面"互相能到达"的节点归成一类？

举个真实场景：你做电商系统的优惠券发放模块，需要分析用户行为图——用户 A 关注了 B，B 又关注了 A，他们其实是同一个"圈子"里的人；C 关注了 D，但 D 没回关，C 和 D 是不同圈子。如果两个用户能通过"关注链"互相触达，他们就在同一个**强连通分量**里。

听起来像社交网络里的"连通块"，但有向图比无向图复杂得多——同样是"连通"，有向图里的环要怎么识别？标准答案就是 **Tarjan 算法** ✨。

## 为什么需要 Tarjan？

### 先说清楚"强连通分量"是什么

一个有向图里，如果任意两个顶点 `u`、`v` 之间都存在 `u → v` 和 `v → u` 的路径，那它们就是**强连通**的。一个图的**强连通分量（SCC, Strongly Connected Component）** 就是满足这个性质的"最大子图"。

```text
无向图的"连通分量"很直观：
   A - B       C - D
   |              |
   E              F

A-B-E 是一个，C-D-F 是另一个（孤立的就不算）

有向图的"强连通分量"更复杂 —— 必须双向可达！
       A → B
       ↑   ↓
       D ← C

{A, B, C, D} 构成一个 SCC，因为任意两个点都能互相到达
如果把 B → C 这条边删掉，就变成 {A, B} 和 {C, D} 两个 SCC
```

### 朴素思路的问题

最直观的想法：对每个节点 `u` 做一次 DFS，看能到达哪些点；如果 `u` 能到 `v`，`v` 也能到 `u`，就归为一类。

**时间复杂度 O(V × (V+E))**，节点一多直接爆炸。

Tarjan 算法只需要 **一次 DFS** 就能找出所有强连通分量，时间 O(V+E)，空间 O(V)。发明者 Robert Tarjan 因为图论算法拿过 1986 年图灵奖（顺便提一句，他发明的还有 LCA 算法、并查集的按秩合并等，老爷子真的牛）。

## 原理拆解

### 核心直觉：用 DFS 树捕捉"环"

想象你从节点 1 出发 DFS，遍历到的每个节点都按访问顺序打上"时间戳"：

```text
图：
        1 → 2 → 3 → 4
        ↑       ↓
        └───────┘

DFS 顺序（从 1 开始）：
访问 1 → 访问 2 → 访问 3 → 访问 4
发现 4 → 1 这条回边！形成环！

时间戳：dfn[1]=1, dfn[2]=2, dfn[3]=3, dfn[4]=4
```

Tarjan 的精髓就是：**DFS 进入一个节点时打两个标记**：

- `dfn[u]`：节点 `u` 被首次访问的时间戳（DFS 序）
- `low[u]`：`u` 和它的子孙能通过最多一条非树边（"回边"）回到的**最早时间戳**

`low[u]` 的含义可以理解为：**从 `u` 出发，我能"追溯"到的最古老的祖先**。如果发现 `low[u] == dfn[u]`，说明 `u` 就是一个强连通分量的"根"。

### 为什么 `low[u] == dfn[u]` 就是 SCC 的根？

直觉上，`low[u]` 是从 `u` 出发能追溯到的最老的祖先。如果它和 `u` 自己一样老，说明 `u` 的子树**没法通过回边连到比 `u` 更老的祖先**——也就是说 `u` 是这个 SCC 中最早被发现的节点，它就是根。

栈里所有在 `u` 之后入栈、`u` 出栈前还在栈里的节点，都属于以 `u` 为根的这个 SCC。

### 图解全过程

来个稍微复杂点的例子：

```text
图（有向图，7 个节点，10 条边）：
        1 → 2    3 → 4
        ↑   ↓    ↑   ↓
        └── 5 ──→└───┘
        ↑        ↘
        └───────── 6 → 7
                     ↑   |
                     └───┘

边：1→2, 2→5, 5→1, 1→5, 5→3, 3→4, 4→6, 6→3, 6→7, 7→6
```

我们用 Tarjan 算法走一遍：

```text
DFS 过程（左边是 dfn，右边是 low）：

调用 dfs(1):
  dfn[1] = 1, low[1] = 1
  push 1 to stack: [1]
  │
  ├─ dfs(2):
  │    dfn[2] = 2, low[2] = 2
  │    push 2 to stack: [1, 2]
  │    │
  │    └─ dfs(5):
  │         dfn[5] = 3, low[5] = 3
  │         push 5 to stack: [1, 2, 5]
  │         │
  │         ├─ 5 → 1（回边，1 已在栈中）
  │         │  low[5] = min(low[5], dfn[1]) = min(3, 1) = 1
  │         │
  │         ├─ 5 → 3（前向边，进入新节点）
  │         │  dfs(3):
  │         │     dfn[3] = 4, low[3] = 4
  │         │     push 3: [1, 2, 5, 3]
  │         │     │
  │         │     └─ dfs(4):
  │         │          dfn[4] = 5, low[4] = 5
  │         │          push 4: [1, 2, 5, 3, 4]
  │         │          │
  │         │          └─ 4 → 6（进入新节点）
  │         │               dfs(6):
  │         │                    dfn[6] = 6, low[6] = 6
  │         │                    push 6: [1, 2, 5, 3, 4, 6]
  │         │                    │
  │         │                    ├─ 6 → 3（回边，3 在栈中）
  │         │                    │  low[6] = min(6, dfn[3]) = min(6, 4) = 4
  │         │                    │
  │         │                    └─ 6 → 7（前向边，进入新节点）
  │         │                         dfs(7):
  │         │                              dfn[7] = 7, low[7] = 7
  │         │                              push 7: [..., 6, 7]
  │         │                              │
  │         │                              └─ 7 → 6（回边，6 在栈中）
  │         │                                   low[7] = min(7, dfn[6]) = min(7, 6) = 6
  │         │                              │
  │         │                              ← dfs(7) 返回
  │         │                              low[6] = min(low[6], low[7]) = min(4, 6) = 4
  │         │                         │
  │         │                    ← dfs(7) 返回，6 的邻接表遍历完
  │         │
  │         │          ← dfs(6) 返回
  │         │          low[4] = min(low[4], low[6]) = min(5, 4) = 4
  │         │
  │         │     ← dfs(4) 返回
  │         │     low[3] = min(low[3], low[4]) = min(4, 4) = 4
  │         │
  │         │   ← dfs(3) 返回
  │         │   low[5] = min(low[5], low[5]) = 1（5 的邻接点都处理完了）
  │         │
  │         │ 关键判断：low[5] = 1, dfn[5] = 3，不等 → 不是根
  │         │ 关键判断：low[3] = 4, dfn[3] = 4，相等！→ 3 是 SCC 根
  │         │   弹出 3、4、6、7（直到弹出 3），形成一个 SCC
  │         │   SCC = {3, 4, 6, 7} ✓
  │         │
  │         │  ← 回到 dfs(5) 的下一条边 5→1
  │         │     1 在栈中，已经处理过了
  │         │
  │         │  dfs(5) 结束
  │         │  low[5] = 1（没变化）
  │         │
  │      ← 回到 dfs(2)
  │      low[2] = min(low[2], low[5]) = min(2, 1) = 1
  │      dfs(2) 结束，low[2] = 1
  │
  ← 回到 dfs(1)
  low[1] = min(low[1], low[2]) = min(1, 1) = 1
  关键判断：low[1] = 1, dfn[1] = 1，相等！→ 1 是 SCC 根
  弹出 1、5、2（直到弹出 1），形成另一个 SCC
  SCC = {1, 2, 5} ✓

最终结果：2 个强连通分量
- SCC #1 = {1, 2, 5}
- SCC #2 = {3, 4, 6, 7}
```

是不是看晕了？别急，先有个整体印象，下面代码部分会一步步拆解。

### `low[u]` 的更新规则

`low[u]` 在 DFS 中要按以下规则更新（这是 Tarjan 算法的核心）：

```text
初始：low[u] = dfn[u]

对每条边 u → v：
1. v 未访问过（树边）：递归 dfs(v)
   递归返回后：low[u] = min(low[u], low[v])
2. v 正在栈中（回边）：low[u] = min(low[u], dfn[v])
3. v 已访问且不在栈中（横叉边）：跳过，不更新 low

最后，u 出栈前，如果 low[u] == dfn[u]，说明 u 是 SCC 根
弹出栈中所有 ≥ u 的节点，构成一个 SCC
```

关键点：**横叉边不更新 `low`**——横叉边不能用来"回溯"到更老的祖先，否则会把两个不相干的 SCC 错误地合并。这是 Tarjan 算法正确性的核心。

## 代码实现

### TypeScript

```typescript
/**
 * Tarjan 强连通分量算法 —— TypeScript 实现
 *
 * 核心思路：
 * 1. DFS 时给每个节点打 dfn（访问时间戳）和 low（能追溯到的最早祖先）
 * 2. 用一个栈记录当前路径上的节点
 * 3. 当 low[u] == dfn[u] 时，u 是某个 SCC 的根，弹出栈中节点形成 SCC
 *
 * 时间复杂度：O(V + E)
 * 空间复杂度：O(V)
 *
 * 应用场景：
 * - LeetCode 1192. 查找集群内的关键连接
 * - 编译器中的死代码消除
 * - 社交网络中的圈子挖掘
 * - 2-SAT 问题求解
 */
class TarjanSCC {
  private dfn: Map<number, number> = new Map(); // 节点首次访问时间戳
  private low: Map<number, number> = new Map(); // 节点能追溯到的最老时间戳
  private onStack: Set<number> = new Set();      // 当前 DFS 路径上的节点
  private stack: number[] = [];                  // DFS 路径栈
  private time = 0;                              // 时间戳计数器
  private sccs: number[][] = [];                 // 收集所有 SCC

  /**
   * 主入口：返回所有强连通分量
   * @param graph 邻接表，graph[u] 是 u 的所有出边邻居
   * @param n 节点总数（节点编号 0 ~ n-1）
   */
  findSCCs(graph: Map<number, number[]>, n: number): number[][] {
    // 初始化
    this.dfn.clear();
    this.low.clear();
    this.onStack.clear();
    this.stack = [];
    this.time = 0;
    this.sccs = [];

    // 图可能是非连通的，需要从每个未访问节点启动 DFS
    for (let u = 0; u < n; u++) {
      if (!this.dfn.has(u)) {
        this.dfs(u, graph);
      }
    }

    return this.sccs;
  }

  /**
   * DFS 递归过程
   *
   * 三个核心动作：
   * 1. 入栈时打 dfn 和 low
   * 2. 遍历邻接点时按规则更新 low
   * 3. 回溯时判断是否弹出 SCC
   */
  private dfs(u: number, graph: Map<number, number[]>): void {
    // 1. 初始化 dfn 和 low，节点入栈
    this.dfn.set(u, this.time);
    this.low.set(u, this.time);
    this.time++;
    this.stack.push(u);
    this.onStack.add(u);

    // 2. 遍历 u 的所有邻居
    const neighbors = graph.get(u) || [];
    for (const v of neighbors) {
      if (!this.dfn.has(v)) {
        // 情况1：v 未访问，树边 → 递归
        this.dfs(v, graph);
        // 递归回来后，更新 low[u]
        this.low.set(u, Math.min(this.low.get(u)!, this.low.get(v)!));
      } else if (this.onStack.has(v)) {
        // 情况2：v 在栈中 → 回边
        // 用 dfn[v] 更新 low[u]（注意是 dfn[v] 不是 low[v]）
        // 为什么不能用 low[v]：v 还在栈里没弹出，low[v] 是它子树内的最老，
        // 但回边指向 v 意味着我们能从 u 直接到 v，v 的 dfn 就是"祖先时间戳"
        this.low.set(u, Math.min(this.low.get(u)!, this.dfn.get(v)!));
      }
      // 情况3：v 已访问但不在栈中 → 横叉边，跳过
      // 为什么跳过：横叉边连接的节点不属于当前 SCC，回溯不到更老的祖先
    }

    // 3. 回溯前判断：如果 low[u] == dfn[u]，u 就是某个 SCC 的根
    if (this.low.get(u) === this.dfn.get(u)) {
      const scc: number[] = [];
      // 不断弹出栈顶，直到弹出 u 自身
      while (true) {
        const node = this.stack.pop()!;
        this.onStack.delete(node);
        scc.push(node);
        if (node === u) break;
      }
      this.sccs.push(scc);
    }
  }
}

// ===== 使用示例 =====

// 构造一个有向图（前面示例里的那个）
// 边：1→2, 2→5, 5→1, 1→5, 5→3, 3→4, 4→6, 6→3, 6→7, 7→6
const graph = new Map<number, number[]>();
const edges = [
  [1, 2], [2, 5], [5, 1], [1, 5],
  [5, 3], [3, 4], [4, 6], [6, 3], [6, 7], [7, 6],
];
for (const [u, v] of edges) {
  if (!graph.has(u)) graph.set(u, []);
  graph.get(u)!.push(v);
}

const tarjan = new TarjanSCC();
const sccs = tarjan.findSCCs(graph, 8);

console.log("强连通分量：");
sccs.forEach((scc, idx) => {
  console.log(`SCC #${idx + 1}: [${scc.sort().join(", ")}]`);
});
// 输出：
// SCC #1: [1, 2, 5]
// SCC #2: [3, 4, 6, 7]
```

### Go

```go
package tarjan

// SCC 强连通分量求解（Tarjan 算法）
//
// 时间复杂度：O(V + E)
// 空间复杂度：O(V)
//
// 关键变量：
//   - dfn[u]: 节点 u 首次被访问的时间戳
//   - low[u]: 节点 u 能追溯到的最老时间戳
//   - onStack[u]: 节点 u 当前是否在 DFS 路径栈上
//
// 适用场景：
//   - 社交网络圈子挖掘
//   - 2-SAT 问题
//   - 编译器优化（死代码消除）
//   - LeetCode 1192（关键连接）
type SCC struct {
	dfn     []int   // 节点首次访问时间戳，0 表示未访问
	low     []int   // 节点能追溯到的最早时间戳
	onStack []bool  // 节点是否在栈中
	stack   []int   // DFS 路径栈
	time    int     // 时间戳计数器
	result  [][]int // 收集所有 SCC
}

// NewSCC 创建一个 SCC 求解器
func NewSCC(n int) *SCC {
	return &SCC{
		dfn:     make([]int, n),
		low:     make([]int, n),
		onStack: make([]bool, n),
	}
}

// FindSCC 找出图的所有强连通分量
// graph: 邻接表，graph[u] 是 u 的所有出边邻居
// n: 节点数（节点编号 0 ~ n-1）
func (s *SCC) FindSCC(graph [][]int, n int) [][]int {
	// 重置状态
	for i := 0; i < n; i++ {
		s.dfn[i] = 0
		s.low[i] = 0
		s.onStack[i] = false
	}
	s.stack = s.stack[:0]
	s.time = 0
	s.result = s.result[:0]

	// 从每个未访问节点启动 DFS（处理非连通图）
	for u := 0; u < n; u++ {
		if s.dfn[u] == 0 {
			s.dfs(u, graph, n)
		}
	}

	return s.result
}

// dfs 递归 DFS 过程
func (s *SCC) dfs(u int, graph [][]int, n int) {
	// 1. 初始化：打 dfn/low，入栈
	s.time++
	s.dfn[u] = s.time
	s.low[u] = s.time
	s.stack = append(s.stack, u)
	s.onStack[u] = true

	// 2. 遍历 u 的所有邻居
	for _, v := range graph[u] {
		if s.dfn[v] == 0 {
			// 树边：递归 + 回溯后更新 low
			s.dfs(v, graph, n)
			// low[u] = min(low[u], low[v])
			if s.low[v] < s.low[u] {
				s.low[u] = s.low[v]
			}
		} else if s.onStack[v] {
			// 回边：用 dfn[v] 更新 low[u]
			// 为什么是 dfn[v] 不是 low[v]：因为 v 还在栈中没弹出，
			// dfn[v] 才是真正的"祖先时间戳"
			if s.dfn[v] < s.low[u] {
				s.low[u] = s.dfn[v]
			}
		}
		// 横叉边（已访问但不在栈中）：跳过
	}

	// 3. 回溯前：low[u] == dfn[u] 说明 u 是 SCC 根，弹出栈
	if s.low[u] == s.dfn[u] {
		var scc []int
		for {
			node := s.stack[len(s.stack)-1]
			s.stack = s.stack[:len(s.stack)-1]
			s.onStack[node] = false
			scc = append(scc, node)
			if node == u {
				break
			}
		}
		s.result = append(s.result, scc)
	}
}

// ===== 使用示例 =====
//
// 边：1→2, 2→5, 5→1, 1→5, 5→3, 3→4, 4→6, 6→3, 6→7, 7→6
// 期望输出：[{1,2,5}, {3,4,6,7}]
//
// func main() {
//     const n = 8
//     graph := make([][]int, n)
//     edges := [][2]int{
//         {1, 2}, {2, 5}, {5, 1}, {1, 5},
//         {5, 3}, {3, 4}, {4, 6}, {6, 3}, {6, 7}, {7, 6},
//     }
//     for _, e := range edges {
//         graph[e[0]] = append(graph[e[0]], e[1])
//     }
//
//     scc := NewSCC(n)
//     result := scc.FindSCC(graph, n)
//     for i, component := range result {
//         fmt.Printf("SCC #%d: %v\n", i+1, component)
//     }
// }
```

### Python

```python
from typing import List, Dict, Set


class TarjanSCC:
    """
    Tarjan 强连通分量算法 —— Python 实现

    核心思想：
    1. DFS 给每个节点打 dfn 和 low 两个时间戳
    2. 用一个栈维护当前 DFS 路径
    3. low[u] == dfn[u] 时弹出栈，形成一个 SCC

    应用：社交圈子挖掘、2-SAT、编译器优化、LeetCode 1192

    时间复杂度：O(V + E)
    空间复杂度：O(V)
    """

    def __init__(self):
        self.dfn: Dict[int, int] = {}    # 节点首次访问时间戳
        self.low: Dict[int, int] = {}    # 节点能追溯到的最早时间戳
        self.on_stack: Set[int] = set()  # 当前在栈中的节点
        self.stack: List[int] = []       # DFS 路径栈
        self.time = 0                    # 时间戳计数器
        self.sccs: List[List[int]] = []   # 收集所有 SCC

    def find_sccs(self, graph: Dict[int, List[int]], n: int) -> List[List[int]]:
        """
        找出图的所有强连通分量

        :param graph: 邻接表，graph[u] 是 u 的所有出边邻居
        :param n: 节点总数（节点编号 0 ~ n-1）
        :return: SCC 列表，每个 SCC 是一个节点列表
        """
        # 重置状态（支持多次调用）
        self.dfn.clear()
        self.low.clear()
        self.on_stack.clear()
        self.stack = []
        self.time = 0
        self.sccs = []

        # 处理非连通图：从每个未访问节点启动 DFS
        for u in range(n):
            if u not in self.dfn:
                self._dfs(u, graph)

        return self.sccs

    def _dfs(self, u: int, graph: Dict[int, List[int]]) -> None:
        """DFS 递归过程"""
        # 1. 初始化：打 dfn 和 low，入栈
        self.time += 1
        self.dfn[u] = self.time
        self.low[u] = self.time
        self.stack.append(u)
        self.on_stack.add(u)

        # 2. 遍历 u 的所有邻居
        for v in graph.get(u, []):
            if v not in self.dfn:
                # 树边：递归 + 回溯后更新 low
                self._dfs(v, graph)
                self.low[u] = min(self.low[u], self.low[v])
            elif v in self.on_stack:
                # 回边：用 dfn[v] 更新 low[u]
                # 为什么是 dfn[v] 不是 low[v]：
                # v 还在栈里没弹出，dfn[v] 才是真正的祖先时间戳
                self.low[u] = min(self.low[u], self.dfn[v])
            # 横叉边：已访问但不在栈中，跳过

        # 3. 回溯前：low[u] == dfn[u] 说明 u 是 SCC 根
        if self.low[u] == self.dfn[u]:
            scc = []
            while True:
                node = self.stack.pop()
                self.on_stack.discard(node)
                scc.append(node)
                if node == u:
                    break
            self.sccs.append(scc)


# ===== 使用示例 =====
if __name__ == "__main__":
    # 构造有向图
    # 边：1→2, 2→5, 5→1, 1→5, 5→3, 3→4, 4→6, 6→3, 6→7, 7→6
    graph = {
        1: [2, 5],
        2: [5],
        5: [1, 3],
        3: [4],
        4: [6],
        6: [3, 7],
        7: [6],
    }

    tarjan = TarjanSCC()
    sccs = tarjan.find_sccs(graph, 8)

    print("强连通分量：")
    for idx, scc in enumerate(sccs, 1):
        print(f"SCC #{idx}: {sorted(scc)}")
    # 输出：
    # SCC #1: [1, 2, 5]
    # SCC #2: [3, 4, 6, 7]
```

## LeetCode 实战

### LeetCode 1192. 查找集群内的关键连接

这是 Tarjan 算法的"官方代言题"，题目说：

> 给你一个无向图的边列表，问哪些边是"关键连接"——移除后会增加连通分量的边。Tarjan 的桥算法能直接求解，桥就是无向图里的"关键连接"。

```typescript
/**
 * LeetCode 1192. 查找集群内的关键连接
 *
 * 思路：用 Tarjan 算法找桥（bridge）
 * 一条边 u-v 是桥，当且仅当 low[v] > dfn[u]（v 无法通过其他路径回到 u）
 *
 * 这里是无向图，所以边要存两份（u→v 和 v→u），
 * 但 DFS 时要通过"父节点"判断，避免把无向边当成"回边"
 */
function criticalConnections(
  n: number,
  connections: number[][]
): number[][] {
  // 构邻接表
  const graph: Map<number, number[]> = new Map();
  for (let i = 0; i < n; i++) graph.set(i, []);
  for (const [u, v] of connections) {
    graph.get(u)!.push(v);
    graph.get(v)!.push(u);
  }

  const dfn: number[] = new Array(n).fill(0);
  const low: number[] = new Array(n).fill(0);
  const bridges: number[][] = [];
  let time = 0;

  function dfs(u: number, parent: number): void {
    dfn[u] = low[u] = ++time;

    for (const v of graph.get(u) || []) {
      if (v === parent) continue;  // 跳过父节点（关键！避免把树边当回边）
      if (dfn[v] === 0) {
        // 树边
        dfs(v, u);
        low[u] = Math.min(low[u], low[v]);
        // 判断桥：v 无法通过其他路径回到 u 或 u 的祖先
        if (low[v] > dfn[u]) {
          bridges.push([u, v]);
        }
      } else {
        // 回边：用 dfn[v] 更新
        low[u] = Math.min(low[u], dfn[v]);
      }
    }
  }

  dfs(0, -1);
  return bridges;
}

// 测试
console.log(criticalConnections(4, [[0,1],[1,2],[2,0],[1,3]]));
// 输出 [[1, 3]] —— 边 1-3 是桥，移除后会形成 {3} 这个孤立点
```

注意几点：

1. **无向图要存双向边**，但 DFS 时要通过 `parent` 跳过父节点，否则会把树边当成回边
2. **判断桥的条件是 `low[v] > dfn[u]`**，意思是 `v` 子树内的节点无法通过任何边回到 `u` 或 `u` 的祖先——那 `u-v` 就是唯一的连接，移除后会断开图
3. 这题还有一道姊妹题 **LeetCode 1568**，是**关键边**（删除后会让图变成"最少有两个连通分量"），也可以用 Tarjan 思路

### 衍生题：2-SAT 问题

Tarjan 求 SCC 后，可以在线性时间内判断 2-SAT 是否有解。

```text
2-SAT 问题：每个变量有两种取值（true/false），有一堆形如
"x1 = true OR x2 = false" 的约束，问是否存在一组赋值满足所有约束

解法：
1. 把每个变量 x 拆成两个节点：x_true 和 x_false
2. 对每个约束 a ∨ b，构造蕴含图：
   - 边 (¬a → b)：若 a 不成立则 b 必须成立
   - 边 (¬b → a)：若 b 不成立则 a 必须成立
3. 求 SCC，如果 x_true 和 x_false 在同一个 SCC 里 → 无解
4. 否则按 SCC 拓扑逆序给变量赋值 → 有解
```

这个套路在编译器验证（SAT 求解器）、逻辑电路设计里都是基础工具。

## 业务场景

### 1. 社交网络圈子挖掘

微博、朋友圈的"互相关注"关系天然是有向图（A 关注 B 不代表 B 关注 A）。运营想做"明星粉丝团"分析，把**互相关注的小圈子**识别出来，就是求 SCC。

```text
用户：明星 A、B、C，素人 D、E、F
关系：
  A ← → C（互关）
  C ← → B（互关）
  A ← → B（互关）
  D → A（单方面关注）
  E → F（单方面关注）

SCC1 = {A, B, C} —— 互关圈子，可能是"三人小团体"
SCC2 = {D}, {E}, {F} —— 单独的节点，不是圈子
```

运营拿到 SCC 后可以针对性地做"三人小团体"的裂变活动。

### 2. 编译器优化：死代码消除

现代编译器在编译时会构建"控制流图"（CFG），如果某个代码块无法到达出口（"汇点"），那它就是死代码，可以安全删除。

Tarjan 求 SCC 的副产品就是**汇点**（出度为 0 的 SCC），识别出来直接干掉。

### 3. 推荐系统候选过滤

假设你做视频推荐，用户看了 A → 推荐 B → 推荐 C → 又回到 A 的推荐链。这种"推荐环"会让用户体验变差（一直推荐同一类内容）。用 Tarjan 找出 SCC，把 SCC 内的推荐路径切断，就能打破循环。

### 4. 分布式系统中的死锁检测

数据库的事务等待图是有向图（事务 A 等 B 的锁，B 等 C 的锁，...）。如果形成环，就死锁了。Tarjan 求 SCC 后，找到大小 > 1 或自环的 SCC，就是死锁环，可以回滚其中一个事务解锁。

## 复杂度分析

| 指标     | 复杂度 | 说明                                                  |
| -------- | ------ | ----------------------------------------------------- |
| 时间     | O(V+E) | 每个节点和每条边都只访问一次（DFS 是线性的）          |
| 空间     | O(V)   | `dfn`/`low`/`onStack`/`stack` 都是 O(V)               |
| 适用规模 | 百万级 | 内存与边数线性，10^6 节点 + 10^7 边也能秒出           |
| 缺点     | 递归栈 | 深图会爆栈，需要改成显式栈或用 Kosaraju 算法替代      |

跟其他 SCC 算法的对比：

| 算法                | 时间     | 空间     | 优点                       | 缺点                            |
| ------------------- | -------- | -------- | -------------------------- | ------------------------------- |
| 朴素法（每个点 DFS）| O(V×(V+E)) | O(V)   | 简单直观                   | 太慢，节点多了直接超时          |
| Kosaraju            | O(V+E)   | O(V)     | 思路清晰，两遍 DFS         | 需要做转置图，多一次扫描        |
| **Tarjan**          | **O(V+E)** | **O(V)** | **一遍 DFS 搞定**          | **递归栈深，大图需要非递归实现**|

**Tarjan 的核心优势：只需要一遍 DFS**。Kosaraju 需要两遍（先原图 DFS，再转置图 DFS），Tarjan 在一遍 DFS 中就搞定了所有信息。

### 递归栈溢出问题

Tarjan 用 DFS 递归实现，深度为 V 的链状图（退化为线性）会触发栈溢出。生产环境大图推荐两种替代方案：

1. **改成显式栈**：用数组手动模拟 DFS 栈，多花点代码换稳定
2. **用 Kosaraju 算法**：天然非递归（两次 BFS/DFS 都用显式栈），更适合极端规模

但面试手写代码 Tarjan 就够了，几行递归清晰明了 ✨。

## 局限性

虽然 Tarjan 很牛，但也不是万能的：

1. **递归深度问题**：上面已经说了，深图爆栈。生产环境大图要手动改写成显式栈。
2. **不能处理动态图**：如果图在算法运行时变化（边插入/删除），Tarjan 失效。这时用**增量 SCC 算法**（但实现复杂得多）。
3. **横叉边不更新 low**：这点必须记牢！初学者最容易栽在这里——遇到已访问节点就更新 `low[u]`，会把不同 SCC 错误合并。
4. **栈模拟细节**：用 `onStack` 标记栈中的节点，是因为递归调用栈和显式栈需要区分——"访问过" ≠ "还在栈中"。

## 小结

Tarjan 算法的精髓就一句话：**用 DFS 时间戳 + 显式栈捕捉"回溯最老点"**。

```text
核心思想: dfn 标记访问顺序，low 标记能追溯到的最老祖先
判断根: low[u] == dfn[u] → u 是 SCC 根，弹出栈
关键规则: 横叉边不更新 low（避免错误合并 SCC）
时间复杂度: O(V + E)
空间复杂度: O(V)
面试高频题: LeetCode 1192（关键连接）、Tarjan 桥、2-SAT
```

面试中遇到"图里找环"、"找连通块"、"拓扑相关"的问题，可以先想想是不是 SCC 问题。比起 BFS 多次扫描，Tarjan 的 O(V+E) 一遍搞定绝对是加分项。

最后留个小练习：你能用 Tarjan 求 SCC 后，判断 2-SAT 问题是否有解吗？提示：求 SCC 后看每个变量的 true 节点和 false 节点是否在同一 SCC 🎯。