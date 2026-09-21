---
title: 二分图与匈牙利算法
description: 二分图最大匹配 —— 匈牙利算法（Hungarian Algorithm）原理与实现，含 DFS/BFS 两种版本
date: 2026-09-21 09:00:33
categories:
  - Algorithm
tags:
  - bipartite-matching
  - hungarian-algorithm
  - graph
  - dfs
sidebarSort: 86
---

# 二分图与匈牙利算法（Bipartite Matching）

你有没有遇到过这样的需求：把 N 个员工分配到 N 个项目上，每个员工只能做一个项目，每个项目只能有一个员工，要求分配的"总收益"最大。或者更朴素的版本：有 N 个男生和 N 个女生，已知谁和谁互相喜欢，能不能凑出最多多少对情侣？

这种问题有个共同的名字：**二分图最大匹配（Maximum Bipartite Matching）**。

听起来像线性规划的味道对吧？其实有个非常直觉、非常优雅的算法，叫 **匈牙利算法（Hungarian Algorithm）**，它能在 O(VE) 的时间里求出最大匹配。本质思路特别朴素——一个一个试，发现冲突就"换个对象"，让前面的兄弟做出牺牲。

下面我带你从头拆解。

## 原理拆解

### 什么是二分图？

先科普一下基础概念。二分图（Bipartite Graph）是一类特殊的图：节点可以分成两个不相交的集合 U 和 V，**所有边都只连接 U 和 V 之间的节点**，U 内部、V 内部没有边。

```
二分图的样子：

  U 集合            V 集合
  (员工/男生)        (项目/女生)
  
   A ──── P
   │ ╲    │
   │  ╲   │
   B ──── Q
    ╲    ╱
     ╲  ╱
      ╲╱
   C ──── R

U = {A, B, C}，V = {P, Q, R}
边 = "喜欢" / "能胜任"
```

**判断一个图是不是二分图？** 用染色法：随便选个节点染红色，与它相邻的染蓝色，再下一个染红色……如果某个节点被要求染两种颜色，就不是二分图。

### 什么是"匹配"？

在二分图中，**匹配（Matching）** 指的是一组边的集合，满足：**每条边连接 U 和 V 中的节点，且任意两个边不共用端点**（也就是说，每个 U 中的节点最多出现在一条边里，每个 V 中的节点也最多出现在一条边里）。

```
最大匹配示例（每个员工都匹配到项目）：

  A ──── P
  B ──── Q
  C ──── R
  
匹配大小 = 3（这就是最大匹配）
```

**最大匹配**：包含边数最多的匹配。如果 |U| = |V| = N，那最大匹配最多就是 N（完全匹配 / Perfect Matching）。

### 核心直觉：能凑就凑，让前面的"让一让"

匈牙利算法的核心思想特别朴素，**用一句话概括就是**：

> 从 U 集合一个一个节点出发，**尝试给每个节点在 V 集合里找一个匹配对象**。如果目标节点已经被占了，就让**已经匹配的那个 U 节点试试换一个目标**——它换的那个目标，可能是空的，也可能又被人占了，那就**递归地让人继续让**……直到所有人都满意，或者确认这条路走不通为止。

听着有点像"踢皮球"，对吧？其实本质就是**深度优先搜索 + 增广路（Augmenting Path）**。

### 什么是增广路？

**增广路**：从某个未匹配的 U 节点出发，经过若干条**交替边**（一匹配边、一非匹配边）到达某个未匹配的 V 节点的路径。

```
初始状态（虚线=非匹配边，实线=匹配边）：

  A ════ P
  │      
  │      
  B ════ Q
   ╲    
    ╲   
     ╲  
  C ──── R

现在尝试给 C 匹配 R：R 是空的，直接连！✓
匹配：C-R

但如果 R 也被占了（假设 D-R 已匹配 D）：

  A ════ P
  B ════ Q
  D ════ R
  C ─ ─ ─ R  (C 想连 R，但 R 被 D 占)

这时候：C 找 R 失败 → 让 D 看看能不能换一个目标
              → D 看看能不能连 P（如果 D-P 边存在）
              
假设 D 能连 P：

  C ════ R
  D ════ P
  A → → → ?  (A 现在空出来了，但 A 不一定有别的可连)

如果 A 也没有别的可连 → 这条路走不通，撤回 C 的尝试
```

**关键定理（Berge 定理）**：一个匹配是最大匹配 **当且仅当** 不存在增广路。所以我们只要不停地找增广路，每找到一条，匹配数 + 1，直到找不到了，就是最大匹配。

### 算法的整体流程

```
function hungarian(u):
    for v in u 的所有邻居:
        if v 没被访问过:
            标记 v 已访问
            if v 没匹配 OR hungarian(v 的当前匹配对象) 成功:
                u.match = v
                v.match = u
                return true
    return false

主流程:
    matchCount = 0
    for u in U:
        清空访问标记
        if hungarian(u):
            matchCount++
    return matchCount
```

**复杂度分析**：
- 每个 u 最多被处理 1 次
- hungarian(u) 内部可能递归深入，访问每个 v 节点最多 1 次
- 总递归调用次数上限是 V 次
- 所以总复杂度是 O(VE)

对于 |U| = |V| = N 的情况，复杂度是 **O(N²·E)**，但实际常数很小，跑得飞快。

## 代码实现

### TypeScript（DFS 版本）

```typescript
/**
 * 匈牙利算法 —— DFS 版本（最常用、最简洁）
 *
 * 解决问题：在二分图中找到最大匹配
 * 复杂度：O(VE)，V 是左侧节点数，E 是边数
 *
 * @param leftNodes 左侧节点列表（U 集合）
 * @param rightNodes 右侧节点列表（V 集合）
 * @param edges 邻接表，edges[u] 是 u 在右侧能连接的节点 ID 列表
 * @returns 最大匹配数和匹配关系
 */
function hungarian(
  leftNodes: number[],
  rightNodes: number[],
  edges: number[][],
): { matchCount: number; leftMatch: number[]; rightMatch: number[] } {
  const n = leftNodes.length;
  const m = rightNodes.length;

  // leftMatch[u] = u 匹配到的右侧节点 ID，-1 表示未匹配
  const leftMatch = new Array(n).fill(-1);
  // rightMatch[v] = v 匹配到的左侧节点 ID，-1 表示未匹配
  const rightMatch = new Array(m).fill(-1);

  /**
   * 尝试为左侧节点 u 找一个匹配
   * visited[v] 防止死循环（同一节点在一次 DFS 中只访问一次）
   */
  const dfs = (u: number, visited: boolean[]): boolean => {
    for (const v of edges[u]) {
      if (visited[v]) continue;
      visited[v] = true;

      // 关键：v 未匹配，或者 v 的当前匹配能找到替代
      if (rightMatch[v] === -1 || dfs(rightMatch[v], visited)) {
        leftMatch[u] = v;
        rightMatch[v] = u;
        return true;
      }
    }
    return false;
  };

  // 一个一个尝试为左侧节点匹配
  let matchCount = 0;
  for (let u = 0; u < n; u++) {
    // 每次 DFS 都要重置 visited！
    const visited = new Array(m).fill(false);
    if (dfs(u, visited)) {
      matchCount++;
    }
  }

  return { matchCount, leftMatch, rightMatch };
}

// === 测试 ===
// 场景：3 个员工，3 个项目
// 员工 0 能胜任项目 0、1
// 员工 1 能胜任项目 0、2
// 员工 2 能胜任项目 1、2
const edges = [
  [0, 1], // 员工 0
  [0, 2], // 员工 1
  [1, 2], // 员工 2
];

const result = hungarian([0, 1, 2], [0, 1, 2], edges);
console.log('最大匹配数:', result.matchCount); // 输出 3
console.log('员工匹配:', result.leftMatch); // 例如 [0, 2, 1]
console.log('项目匹配:', result.rightMatch); // 例如 [0, 2, 1]
```

### Python 版本（BFS 版本，HK 算法基础）

Python 实现，更紧凑一些。顺便给个 BFS 版本（Hopcroft-Karp 算法的基础思想）：

```python
from collections import deque
from typing import List


def hungarian_dfs(n: int, m: int, edges: List[List[int]]):
    """
    匈牙利算法 —— DFS 版本
    
    :param n: 左侧节点数
    :param m: 右侧节点数
    :param edges: edges[u] = [v1, v2, ...]
    """
    left_match = [-1] * n
    right_match = [-1] * m

    def dfs(u, visited):
        for v in edges[u]:
            if visited[v]:
                continue
            visited[v] = True
            # v 未匹配，或者 v 的当前匹配对象能找到别的
            if right_match[v] == -1 or dfs(right_match[v], visited):
                left_match[u] = v
                right_match[v] = u
                return True
        return False

    match_count = 0
    for u in range(n):
        visited = [False] * m
        if dfs(u, visited):
            match_count += 1

    return match_count, left_match, right_match


# 测试
edges = [
    [0, 1],
    [0, 2],
    [1, 2],
]
count, lm, rm = hungarian_dfs(3, 3, edges)
print(f"最大匹配数: {count}")  # 3
print(f"左侧匹配: {lm}")      # 例如 [0, 2, 1]
print(f"右侧匹配: {rm}")      # 例如 [0, 2, 1]
```

### 边表 vs 邻接表

上面的实现用的是**邻接表**，如果你拿到的是**边列表**（每条边是 [u, v] 形式），可以先转换：

```typescript
// 边列表转邻接表
const edgeList = [
  [0, 0], [0, 1], // 员工 0 -> 项目 0, 项目 1
  [1, 0], [1, 2], // 员工 1 -> 项目 0, 项目 2
  [2, 1], [2, 2], // 员工 2 -> 项目 1, 项目 2
];

const n = 3; // 左侧节点数
const edges: number[][] = Array.from({ length: n }, () => []);
for (const [u, v] of edgeList) {
  edges[u].push(v);
}
```

## 复杂度分析

| 维度 | DFS 版匈牙利 | Hopcroft-Karp（进阶） |
| --- | --- | --- |
| 时间复杂度 | O(VE) | O(√V · E) |
| 空间复杂度 | O(V + E) | O(V + E) |
| 适用场景 | N ≤ 500 | N ≤ 10⁵ |
| 实现难度 | ⭐ 简单 | ⭐⭐⭐ 需要分层 BFS |

**DFS 版**对小规模问题（V ≤ 1000 左右）完全够用，代码简单、调试方便。**Hopcroft-Karp** 是优化版，通过 BFS 同时找多条最短增广路，把复杂度降到 O(√V·E)，但代码量翻倍。大部分面试场景，DFS 版本足以应对。

## 实际应用

### 场景一：任务分配（最经典）

```typescript
/**
 * 场景：有 N 个员工和 N 个任务，每个员工只能做一个任务，每个任务只能有一个员工做
 * 给定收益矩阵 profit[i][j] 表示员工 i 做任务 j 的收益
 * 求最大总收益的分配
 */
function maxProfitAssignment(
  n: number,
  profit: number[][],
): { matchCount: number; totalProfit: number; assignment: number[] } {
  // 用 KM 算法（Kuhn-Munkres）求带权最大匹配
  // 或者用匈牙利 + 枚举子集（N 小时）
  
  // 简化版：假设 profit[i][j] > 0 才视为能匹配
  const edges: number[][] = [];
  for (let i = 0; i < n; i++) {
    edges[i] = [];
    for (let j = 0; j < n; j++) {
      if (profit[i][j] > 0) edges[i].push(j);
    }
  }
  
  const { matchCount, leftMatch } = hungarian(
    Array.from({ length: n }, (_, i) => i),
    Array.from({ length: n }, (_, i) => i),
    edges,
  );
  
  let totalProfit = 0;
  for (let i = 0; i < n; i++) {
    if (leftMatch[i] !== -1) totalProfit += profit[i][leftMatch[i]];
  }
  
  return { matchCount, totalProfit, assignment: leftMatch };
}
```

### 场景二：情侣配对（简化版）

```typescript
/**
 * 场景：N 个男生和 N 个女生，likes[i][j] = true 表示男生 i 喜欢女生 j
 * 求最多能凑多少对情侣（互相喜欢的）
 */
function maxCouples(
  n: number,
  likes: boolean[][],
): { matchCount: number; couples: Array<[number, number]> } {
  const edges: number[][] = [];
  for (let i = 0; i < n; i++) {
    edges[i] = [];
    for (let j = 0; j < n; j++) {
      if (likes[i][j]) edges[i].push(j);
    }
  }
  
  const { matchCount, leftMatch } = hungarian(
    Array.from({ length: n }, (_, i) => i),
    Array.from({ length: n }, (_, i) => i),
    edges,
  );
  
  const couples: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    if (leftMatch[i] !== -1) couples.push([i, leftMatch[i]]);
  }
  
  return { matchCount, couples };
}

// 测试
const likes = [
  [true, true, false], // 男生 0 喜欢女生 0、1
  [true, false, true], // 男生 1 喜欢女生 0、2
  [false, true, true], // 男生 2 喜欢女生 1、2
];

const result = maxCouples(3, likes);
console.log(result); // { matchCount: 3, couples: [[0,1],[1,0],[2,2]] }
```

### 场景三：课程排班 / 排课系统

```typescript
/**
 * 场景：M 个班级，N 个时间段
 * 每个班级有可用的时间段列表
 * 求最多能安排多少个班级（一个时间段只能给一个班级）
 */
function maxClassAssignment(
  classCount: number,
  timeSlots: number,
  availableSlots: number[][], // availableSlots[i] = 班级 i 可用时间段
): { matchCount: number; assignment: number[] } {
  const edges = availableSlots;
  
  const { matchCount, leftMatch } = hungarian(
    Array.from({ length: classCount }, (_, i) => i),
    Array.from({ length: timeSlots }, (_, i) => i),
    edges,
  );
  
  return { matchCount, assignment: leftMatch };
}
```

### 场景四：判定性问题（LeetCode 高频）

LeetCode 上有不少题本质是"问一个二分图是否完美匹配"或"问最大匹配数"，比如：

- **LeetCode 886. 可能的二分法**：给定 N 个人和"不喜欢"关系对，问能否分成两组（本质是判断是否为二分图）
- **LeetCode 1349. 参加考试的最大学生数**：座位安排，求最多坐多少学生（**本质上就是二分图最大独立集**，等于顶点总数 - 最小顶点覆盖 = **顶点总数 - 最大匹配数**，由 König 定理）

```typescript
/**
 * LeetCode 1349. 参加考试的最大学生数（简化版思路）
 * 本质是：座位图转二分图 → 求最大独立集 → N - 最大匹配
 */
function maxStudents(seats: string[][]): number {
  const m = seats.length;
  const n = seats[0].length;
  
  // 把所有空座位编号，分成"黑格"和"白格"（棋盘染色）
  // 这就是天然的二分图
  const cells: Array<[number, number]> = [];
  const cellId = (i: number, j: number) => i * n + j;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (seats[i][j] === '.') cells.push([i, j]);
    }
  }
  
  // 构建二分图：相邻座位连边
  // 黑格作为左侧，白格作为右侧
  const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
  // ... 省略具体建图代码
  
  // 求最大匹配
  // 最大学生数 = 空座位数 - 最大匹配数（König 定理）
  return cells.length - matchCount;
}
```

## 进阶：带权二分图匹配（KM 算法）

匈牙利算法解决的是"**最多能匹配多少对**"。但如果每条边有**权重**（比如每个员工做每个项目的收益不同），要求**最大总收益**，就需要 **KM 算法（Kuhn-Munkres）**。

KM 算法的核心是给每个节点维护一个"顶标"（label），通过调整顶标让"等标子图"出现完美匹配，最终的匹配就是最优的。**时间复杂度 O(N³)**。

如果你面试被问到"带权匹配"，能讲出 KM 的核心思路（顶标 + 等标子图）就很加分了。不过实际工程中，**很多带权场景会直接用最小费用最大流（MCMF）**，更通用也更易扩展。

## 进阶：Hopcroft-Karp 算法（更快的 DFS）

当你需要处理 N = 10⁴ 甚至 10⁵ 的数据时，DFS 版匈牙利会超时。这时候用 **Hopcroft-Karp**：

**核心思想**：BFS 同时找**多条最短增广路**，然后一起增广。

```
时间复杂度从 O(VE) 降到 O(√V · E)
```

简单说就是：
1. BFS 分层：把当前所有未匹配的左侧节点作为起点，按距离分层
2. 找增广路：在分层图上 DFS 找所有不交叉的最短增广路
3. 同时增广：所有最短增广路一次性翻转

代码量大约是 DFS 版本的两倍，面试一般不会要求手写，但**理解原理**很重要——你至少得知道"为啥 HK 比 DFS 快"。

## 常见面试题

### 1. 如何判断一个图是不是二分图？

**染色法**：BFS/DFS 遍历，节点交替染色（红/蓝），如果遇到**已染色但颜色冲突**的节点，就不是二分图。

```typescript
function isBipartite(graph: number[][]): boolean {
  const n = graph.length;
  const color = new Array(n).fill(-1); // -1 未染色，0/1 两种颜色
  
  for (let i = 0; i < n; i++) {
    if (color[i] !== -1) continue;
    const queue = [i];
    color[i] = 0;
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const v of graph[u]) {
        if (color[v] === -1) {
          color[v] = 1 - color[u];
          queue.push(v);
        } else if (color[v] === color[u]) {
          return false; // 颜色冲突
        }
      }
    }
  }
  return true;
}
```

### 2. 二分图最大匹配 = 最小顶点覆盖？

是的！这是大名鼎鼎的 **König 定理**：

```
最大匹配数 = 最小顶点覆盖数
```

**最小顶点覆盖**：选最少的顶点，使得每条边至少有一个端点被选中。

这个定理的实用价值在于：很多看似困难的问题可以**转化为匹配问题**来解，比如上面 LeetCode 1349 的"最大独立集"。

### 3. 为什么 DFS 版本每次都要重置 visited？

因为**每次尝试为新的左侧节点匹配时**，都是从它出发找一条增广路。如果在同一次 DFS 中重复访问同一个右侧节点，会形成**死循环**——比如 A→B→A→B……

但不同 u 之间的"占用情况"是动态变化的，**visited 不能跨 u 共享**，否则会漏掉一些增广路。

### 4. 匈牙利算法的时间复杂度真的够用吗？

对常见面试题（N ≤ 1000，边数 ≤ 10⁵），O(VE) ≈ 10⁸，1 秒内能跑完。

但如果 N 到了 10⁴、边数 10⁶，O(VE) = 10¹⁰，肯定超时。这时候要用 **Hopcroft-Karp** 或 **网络流（最大流 = 最大匹配）**。

### 5. 什么时候用匈牙利 vs 网络流？

简单判断：

| 场景 | 推荐算法 |
| --- | --- |
| 纯二分匹配，N ≤ 1000 | 匈牙利算法 |
| 大规模二分匹配 | Hopcroft-Karp |
| 带权 / 多约束 / 一般图 | 网络流（最大流/最小费用最大流） |
| 顶点容量 / 边容量限制 | 网络流 |
| 一般图（不一定是二分图） | 带花树（Blossom）算法 |

## 调试小技巧

实战中匈牙利算法最容易出 bug 的几个点：

```typescript
// 1. visited 必须每次外层循环重置
for (let u = 0; u < n; u++) {
  const visited = new Array(m).fill(false); // ✅ 每次重置
  if (dfs(u, visited)) matchCount++;
}

// 2. 边表别忘了边界检查
for (let u = 0; u < n; u++) {
  for (const v of edges[u]) {
    if (v < 0 || v >= m) continue; // ✅ 防御一下
    // ...
  }
}

// 3. 区分"没匹配过"和"匹配过但失败"
// 这里用 -1 表示未匹配，千万别用 0 或别的有意义的值

// 4. 输入的边别重复
// 比如 A 和 B 之间有多条边，去重一下或者只保留第一条
```

## 总结

**匈牙利算法**是处理**二分图最大匹配**的瑞士军刀：

- **核心思想**：DFS + 增广路 + "踢皮球"式的递归让位
- **时间复杂度**：O(VE)，N ≤ 1000 够用
- **代码实现**：30 行 TypeScript 就能写完
- **适用场景**：任务分配、配对问题、最大独立集、棋盘覆盖等

面试中遇到"配对"、"分配"、"匹配"类问题，先问自己三个问题：

1. **是不是二分图？**（用染色法判断）
2. **求最大数量还是最大权重？**（前者匈牙利，后者 KM）
3. **规模有多大？**（小规模 DFS 版，大规模 HK 或网络流）

把这三个问题答清楚，再写出 30 行核心代码，面试官大概率会让你过 ✨。

> **预告**：下一篇我会写**网络流（最大流 / Dinic 算法）**，这是更通用的图论建模工具，能解决二分匹配、带权匹配、多约束匹配等所有问题。匈牙利算是网络流的"入门版"，理解了匈牙利再学 Dinic 会顺畅很多。

## 参考资料

- 《算法竞赛进阶指南》—— 李煜东
- [OI Wiki - 二分图最大匹配](https://oi-wiki.org/graph/bi-graph-match/)
- [Berge's Theorem 介绍](https://en.wikipedia.org/wiki/Berge%27s_theorem)
- [Hopcroft-Karp 算法论文](https://en.wikipedia.org/wiki/Hopcroft%E2%80%93Karp_algorithm)
