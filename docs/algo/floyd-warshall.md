---
title: Floyd-Warshall 全源最短路径算法
description: Floyd-Warshall（弗洛伊德）算法——用动态规划求解图中所有顶点对之间的最短路径
date: 2026-06-24 09:00:00
categories:
  - Algorithm
tags:
  - floyd-warshall
  - shortest-path
  - dynamic-programming
  - graph
sidebarSort: 53
---

# Floyd-Warshall 全源最短路径算法

你打开高德地图，输入"从家到公司"，它秒回一条最优路线。但如果老板突然问你："咱们公司到所有分部之间，两两之间的最短距离是多少？"你总不能一个个去查吧？如果有 100 个分部，就要查 100 × 99 = 9900 次。

这就是**全源最短路径**问题：给定一个带权图，求出**每一对顶点之间的最短路径**。

之前我们聊过 [Dijkstra 算法](dijkstra.md)，它擅长解决**单源最短路径**——从一个点出发到其他所有点的最短距离。跑 n 次 Dijkstra 当然能搞定全源最短路径，但 Floyd-Warshall 给了我们一个更优雅的选择：**核心代码只有 5 行**，而且还能处理负权边 🎉

## 原理拆解

### 1. 核心直觉

想象你在公司里问路：从 A 栋到 D 栋怎么走最近？

- 你可以**直达**：A → D，距离 10
- 你也可以**绕路**：A → B → D，可能更近也可能更远
- 或者更复杂的：A → B → C → D

Floyd-Warshall 的想法非常朴素：**逐个尝试"经过每个中间点"，看能不能找到更短的路**。

```
核心思想：三重循环

for 每个可能的中间点 k:
    for 每个起点 i:
        for 每个终点 j:
            如果 i → k → j 比 i → j 更短，就更新距离

就这么简单，真的只有这么点东西。
```

### 2. 为什么这么做是对的？

关键在于循环顺序：**k 在最外层**。

这保证了当我们用 `k` 作为中间点时，`i → k` 和 `k → j` 的最短路径已经确定（只经过 0 到 k-1 这些中间点）。这其实就是**动态规划**的思路。

```
状态定义：dp[k][i][j] = 从 i 到 j，只经过 [0, 1, ..., k] 这些中间点的最短距离

状态转移：
    dp[k][i][j] = min(
        dp[k-1][i][j],          // 不经过 k（走之前的最优解）
        dp[k-1][i][k] + dp[k-1][k][j]  // 经过 k（看看绕路是否更短）
    )

初始状态：dp[-1][i][j] = 直接相连的边权，不相连则为 ∞
```

因为 `dp[k]` 只依赖 `dp[k-1]`，我们可以把三维压成二维，直接在原数组上改。这就是为什么最终代码只需要一个二维数组。

### 3. 图解全过程

用一个 4 个顶点的小图来演示：

```
初始图（邻接矩阵）：

         D
    ① ------→ ③
    |  \       ↑
  3 |   \ 5    | 1
    |    \     |
    ↓     ↘   |
    ② ------→ ④
         2

邻接矩阵（∞ 表示不直接相连）：

      ①    ②    ③    ④
①  [  0,   3,   5,   ∞ ]
②  [ ∞,    0,   ∞,   2 ]
③  [ ∞,    ∞,   0,   1 ]
④  [ ∞,    ∞,   ∞,   0 ]
```

**k=0（尝试经过顶点①）**：

```
检查所有 (i,j) 对，看 i→①→④ 是否更短：
- (②,④): 当前 ∞，试试 ②→①→④ = ∞+5 = ∞，不行
- (③,④): 当前 ∞，试试 ③→①→④ = ∞+5 = ∞，不行

本轮没有更新（因为①的入边都是∞）
```

**k=1（尝试经过顶点②）**：

```
- (①,④): 当前 ∞，试试 ①→②→④ = 3+2 = 5 ✨ 更新！
- (③,④): 当前 1，试试 ③→②→④ = ∞+2 = ∞，不更新

更新后：
      ①    ②    ③    ④
①  [  0,   3,   5,   5 ]  ← ④列从∞变成5
②  [ ∞,    0,   ∞,   2 ]
③  [ ∞,    ∞,   0,   1 ]
④  [ ∞,    ∞,   ∞,   0 ]
```

**k=2（尝试经过顶点③）**：

```
- (①,④): 当前 5，试试 ①→③→④ = 5+1 = 6，不更新（5 < 6）
- (②,④): 当前 2，试试 ②→③→④ = ∞+1 = ∞，不更新

本轮没有更新
```

**k=3（尝试经过顶点④）**：

```
④ 没有出边到其他顶点，所以也不会有更新。

最终结果：
      ①    ②    ③    ④
①  [  0,   3,   5,   5 ]
②  [ ∞,    0,   ∞,   2 ]
③  [ ∞,    ∞,   0,   1 ]
④  [ ∞,    ∞,   ∞,   0 ]
```

**结论**：从①到④的最短距离是 5（路径：①→②→④），而直连①→③→④要 6，果然绕路更短！

### 4. 负权边和负环检测

Floyd-Warshall 有一个 Dijkstra 做不到的事：**处理负权边**。

Dijkstra 的贪心策略依赖"已确定的最短路径不会再变"，但负权边会打破这个假设。而 Floyd-Warshall 用的是动态规划，不依赖这个性质，所以天然支持负权边。

但要注意：**如果图中存在负环（总权值为负的环），最短路径就是负无穷**——你可以无限绕圈把距离拉到负无穷。Floyd-Warshall 能帮你检测这种情况：跑完之后，如果某个顶点到自身的距离 `dist[i][i] < 0`，说明存在负环。

```
负环示例：

    A → B（权 -2）
    B → C（权 -3）
    C → A（权 1）

    环的总权值 = -2 + (-3) + 1 = -4 < 0 → 负环！
    每走一圈距离就少 4，无限循环 → 最短路径 = -∞
```

## 代码实现

### TypeScript

```typescript
/**
 * Floyd-Warshall 全源最短路径算法
 *
 * 核心思路：三重循环，逐个尝试"经过每个顶点作为中间点"，
 * 看能不能找到更短的路径。
 *
 * 时间复杂度 O(n³)，空间复杂度 O(n²)
 * 适合顶点数 < 1000 的稠密图
 */

const INF = Number.MAX_SAFE_INTEGER;

function floydWarshall(graph: number[][]): number[][] {
  const n = graph.length;

  // 初始化距离矩阵：拷贝一份原图的邻接矩阵
  // 为什么拷贝：我们会在 dist 上原地修改，不想改变原图
  const dist: number[][] = graph.map((row) => [...row]);

  // 核心代码：真的只有 5 行
  // k = 中间点（必须在最外层！这是正确性的关键）
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // 如果 i→k 和 k→j 都可达，且经过 k 更短
        if (dist[i][k] !== INF && dist[k][j] !== INF) {
          dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
        }
      }
    }
  }

  return dist;
}

/**
 * 判断图中是否存在负环
 * 跑完 Floyd-Warshall 后，如果 dist[i][i] < 0，说明存在负环
 */
function hasNegativeCycle(dist: number[][]): boolean {
  for (let i = 0; i < dist.length; i++) {
    if (dist[i][i] < 0) return true;
  }
  return false;
}

/**
 * 重建最短路径（不只是距离，还能输出具体路径）
 *
 * 思路：额外维护一个 next 矩阵，next[i][j] 记录 i→j 最短路上的第一个中转点
 * 每次更新距离时，同步更新 next
 */
function floydWarshallWithPath(graph: number[][]): {
  dist: number[][];
  next: number[][];
} {
  const n = graph.length;
  const dist: number[][] = graph.map((row) => [...row]);

  // next[i][j] = 从 i 出发到 j，第一个要经过的顶点
  // 初始化：如果 i→j 直连，next[i][j] = j；否则 -1
  const next: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (graph[i][j] !== INF ? j : -1)),
  );

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] !== INF && dist[k][j] !== INF) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            next[i][j] = next[i][k]; // 路径经过 k，更新中转点
          }
        }
      }
    }
  }

  return { dist, next };
}

/**
 * 查询从 start 到 end 的具体最短路径
 */
function getPath(
  next: number[][],
  start: number,
  end: number,
): number[] {
  if (next[start][end] === -1) return []; // 不可达
  const path = [start];
  let current = start;
  while (current !== end) {
    current = next[current][end];
    path.push(current);
  }
  return path;
}

// ===== 使用示例 =====

//       ① --3-- ②
//       |  \     |
//      10   5    2
//       |     \  |
//       ③ --6-- ④

const graph = [
  //  ①         ②         ③         ④
  [0, 3, 10, 5],       // ① 到各点
  [INF, 0, INF, 2],    // ② 到各点
  [INF, INF, 0, 6],    // ③ 到各点
  [INF, INF, INF, 0],  // ④ 到各点
];

const result = floydWarshall(graph);
console.log("最短距离矩阵：");
result.forEach((row, i) => {
  console.log(`从①②③④[i] → `, row.map((d) => (d === INF ? "∞" : d)));
});
// 从①→④最短距离是 5（直连），从①→③最短距离是 10（直连或经④更远）

const { dist, next } = floydWarshallWithPath(graph);
const path = getPath(next, 0, 3);
console.log(`从①到④的最短路径：${path.map((p) => p + 1).join(" → ")}`);
// 输出：1 → 4
```

### Python

```python
"""
Floyd-Warshall 全源最短路径算法 —— Python 实现

核心思路：三重循环，逐个尝试经过每个顶点作为中转点
k 必须在最外层！这是正确性的关键——保证用 k 做中转时，
i→k 和 k→j 的最短路径已经确定。
"""

INF = float("inf")


def floyd_warshall(graph: list[list[float]]) -> list[list[float]]:
    """求所有顶点对之间的最短距离"""
    n = len(graph)
    # 拷贝一份，不在原图上改
    dist = [row[:] for row in graph]

    # 核心代码，真的只有 5 行
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] != INF and dist[k][j] != INF:
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])

    return dist


def has_negative_cycle(dist: list[list[float]]) -> bool:
    """检查是否存在负环：对角线有负值就说明存在"""
    return any(dist[i][i] < 0 for i in range(len(dist)))


def floyd_warshall_with_path(graph: list[list[float]]):
    """不仅算距离，还能重建具体路径"""
    n = len(graph)
    dist = [row[:] for row in graph]

    # next[i][j] = 从 i 到 j 最短路上的第一个中转点
    next_matrix = [
        [j if graph[i][j] != INF else -1 for j in range(n)]
        for i in range(n)
    ]

    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] != INF and dist[k][j] != INF:
                    if dist[i][k] + dist[k][j] < dist[i][j]:
                        dist[i][j] = dist[i][k] + dist[k][j]
                        next_matrix[i][j] = next_matrix[i][k]

    return dist, next_matrix


def get_path(next_matrix: list[list[int]], start: int, end: int) -> list[int]:
    """查询从 start 到 end 的具体最短路径"""
    if next_matrix[start][end] == -1:
        return []  # 不可达
    path = [start]
    current = start
    while current != end:
        current = next_matrix[current][end]
        path.append(current)
    return path


# ===== 使用示例 =====
if __name__ == "__main__":
    #       ① --3-- ②
    #       |  \     |
    #      10   5    2
    #       |     \  |
    #       ③ --6-- ④

    graph = [
        [0, 3, 10, 5],
        [INF, 0, INF, 2],
        [INF, INF, 0, 6],
        [INF, INF, INF, 0],
    ]

    result = floyd_warshall(graph)
    for row in result:
        print([d if d != INF else "∞" for d in row])
    # [0, 3, 10, 5] —— 从①到④最短距离 5

    dist, next_m = floyd_warshall_with_path(graph)
    path = get_path(next_m, 0, 3)
    print(f"①→④ 最短路径: {' → '.join(str(p+1) for p in path)}")
```
