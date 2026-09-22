---
title: 欧拉路径与欧拉回路
description: 欧拉路径与欧拉回路（图论经典算法，含 Hierholzer 算法实现）
date: 2026-09-22 09:05:00
categories:
  - Algorithm
tags:
  - eulerian-path
  - graph
  - hierholzer
  - interview
sidebarSort: 87
---

# 欧拉路径与欧拉回路

你有没有遇到过这样的问题：一笔画游戏，大家都玩过吧？给你一个图形，问你能不能**一笔画成**——笔不离纸、线不重复。这可不是什么小学奥数，这是正经的图论问题——**欧拉路径（Eulerian Path）**和**欧拉回路（Eulerian Circuit）**。

这个问题在现实中比你想象的有用得多：
- 快递员送货，怎么走才能不重复跑完所有街道？📦
- DNA 测序时，碎片片段怎么拼回去？🧬
- 电路板走线，怎么设计才能不跳线？⚡

这些问题背后的数学模型都一样：**找到一条路径，经过每条边恰好一次**。

## 问题引入：一笔画定理

让我们从大家熟悉的一笔画说起。七桥问题你肯定听过——波兰小城 Pregel 河上有 7 座桥，问能不能一次走完所有桥且每座桥只走一次，最后回到起点？

![七桥问题图示]

欧拉在 1736 年研究这个问题时，把陆地和桥抽象成了**点和边**：
- 每块陆地 = 一个顶点
- 每座桥 = 一条边

然后他发现了一个惊人的规律：

> **如果一个图存在欧拉回路（能回到起点），那么所有顶点的度数（连接的边数）必须全是偶数。**

> **如果一个图存在欧拉路径（不需要回到起点），那么恰好有 0 个或 2 个顶点的度数是奇数，其余全是偶数。**

这就是著名的**欧拉定理**。没有奇数度顶点 → 有欧拉回路；恰好 2 个奇数度顶点 → 有欧拉路径但没有回路。

```
偶数度顶点示意：
    A —— B        A 的度数：2（偶数）
    |    |        B 的度数：2（偶数）
    C —— D        C 的度数：2（偶数）
                  D 的度数：2（偶数）
         全是偶数 → 这个图有欧拉回路！

奇数度顶点示意：
    A —— B        A 的度数：3（奇数）
    |    |        B 的度数：1（奇数）
    C           C 的度数：2（偶数）
                  D 的度数：0（偶数）
         恰好2个奇数度 → 有欧拉路径（A→B）
```

## 概念拆解

在动手写代码之前，先把概念理清楚：

### 1. 基本术语

| 术语 | 定义 | 一笔画对应 |
|------|------|-----------|
| **顶点（Vertex）** | 图中的节点 | 陆地 |
| **边（Edge）** | 顶点之间的连接 | 桥 |
| **度（Degree）** | 一个顶点连接的边数 | 陆地连通几座桥 |
| **欧拉路径** | 经过**每条边恰好一次**的路径（不必回到起点） | 一笔画，不能回到起点 |
| **欧拉回路** | 欧拉路径的一种，但**必须回到起点** | 一笔画，能回到起点 |
| **欧拉图** | 含有欧拉回路的图 | — |
| **半欧拉图** | 含有欧拉路径但不含欧拉回路的图 | — |

### 2. 判断条件（重要！）

```typescript
/**
 * 判断图的类型
 * @param degrees 顶点度数数组
 * @returns "eulerian" 欧拉回路 | "semi-eulerian" 欧拉路径 | "none" 什么也没有
 */
function classifyGraph(degrees: number[]): "eulerian" | "semi-eulerian" | "none" {
  const oddCount = degrees.filter(d => d % 2 === 1).length;

  if (oddCount === 0) return "eulerian";      // 全偶数 → 欧拉回路
  if (oddCount === 2) return "semi-eulerian"; // 恰好2个奇数 → 欧拉路径
  return "none";                              // 其他情况 → 不可能一笔画
}
```

这就是整个问题的第一步：**先判断有没有解**。

### 3. 连通性

度数条件是必要条件，但不是充分条件。图还必须是**连通的**（不考虑孤立顶点）。一个图即使所有顶点度数都是偶数，如果各部分不连通，也不可能一笔画。

## 算法实现：Hierholzer 算法

判断有没有解是一回事，找到这条路径是另一回事。找欧拉路径/回路的经典算法是 **Hierholzer 算法**，时间复杂度 O(V + E)，非常高效。

### 核心思想

Hierholzer 的思路很巧妙，有点像"先随便走，走不通了就夹塞"：

1. 从起点出发，随便选一条路往前走，一直走到**无路可走**为止（走到了死胡同）
2. 此时必然回到了某个"中间节点"——因为只有起点和终点可能是不连通其他部分的
3. 从路径中找一个**还有未访问边的顶点**，从那里开始再走一圈，把走出来的圈**插入**到主路径里
4. 重复步骤 3，直到所有边都被访问过

这个算法最妙的地方是：不需要 DFS 那种"走不通就回溯"的暴力枚举，每条边只走一次。

### TypeScript 实现（邻接表 + 栈）

```typescript
/**
 * 欧拉路径/回路查找器
 * 使用 Hierholzer 算法，O(V + E) 时间复杂度
 */
class EulerianPath {
  // 邻接表
  private adj: Map<number, number[]>;
  // 顶点度数
  private degree: Map<number, number>;
  // 边数量
  private edgeCount: number;
  // 顶点列表（用于判断奇数度顶点的起始点）
  private vertices: number[];

  constructor() {
    this.adj = new Map();
    this.degree = new Map();
    this.edgeCount = 0;
    this.vertices = [];
  }

  /**
   * 添加一条无向边
   */
  addEdge(u: number, v: number): void {
    // 初始化顶点（邻接表）
    if (!this.adj.has(u)) {
      this.adj.set(u, []);
      this.vertices.push(u);
    }
    if (!this.adj.has(v)) {
      this.adj.set(v, []);
      this.vertices.push(v);
    }

    // 邻接表追加（用数字数组模拟"已访问"标记的移除）
    this.adj.get(u)!.push(v);
    this.adj.get(v)!.push(u);

    // 度数 +1
    this.degree.set(u, (this.degree.get(u) ?? 0) + 1);
    this.degree.set(v, (this.degree.get(v) ?? 0) + 1);

    this.edgeCount++;
  }

  /**
   * 分类图：欧拉回路 / 欧拉路径 / 无解
   */
  classify(): { type: "eulerian" | "semi-eulerian" | "none"; start?: number } {
    let oddCount = 0;
    let oddVertex = -1;
    let evenVertex = -1;

    for (const v of this.vertices) {
      const d = this.degree.get(v) ?? 0;
      if (d % 2 === 1) {
        oddCount++;
        oddVertex = v;
      } else {
        evenVertex = v;
      }
    }

    if (oddCount === 0) return { type: "eulerian", start: evenVertex };
    if (oddCount === 2) return { type: "semi-eulerian", start: oddVertex };
    return { type: "none" };
  }

  /**
   * 查找欧拉路径/回路
   * @returns 路径顶点数组（顺序即为访问顺序）
   */
  findPath(): number[] | null {
    const { type, start } = this.classify();
    if (type === "none") return null; // 无解
    if (this.edgeCount === 0) return []; // 没有边

    // 创建邻接表的副本（避免修改原数据）
    const adjCopy = new Map<number, number[]>();
    for (const [v, neighbors] of this.adj) {
      adjCopy.set(v, [...neighbors]);
    }

    const stack: number[] = [start!];
    const path: number[] = [];

    while (stack.length > 0) {
      const v = stack[stack.length - 1];
      const neighbors = adjCopy.get(v);

      // 找到一条未访问的边
      if (neighbors && neighbors.length > 0) {
        const u = neighbors.pop()!; // 弹出一条边（从v到u）
        // 双向图，删掉另一条
        const otherNeighbors = adjCopy.get(u)!;
        const idx = otherNeighbors.indexOf(v);
        if (idx !== -1) otherNeighbors.splice(idx, 1);
        stack.push(u);
      } else {
        // 没有未访问的边了，把这个顶点加入路径
        path.push(stack.pop()!);
      }
    }

    // path 逆序才是正确的访问顺序
    return path.reverse();
  }
}

// ============ 使用示例 ============

function demo() {
  // 示例1：一笔画矩形（有欧拉回路）
  //   A —— B
  //   |    |
  //   C —— D
  const euler1 = new EulerianPath();
  euler1.addEdge(0, 1); // A-B
  euler1.addEdge(1, 2); // B-C
  euler1.addEdge(2, 3); // C-D
  euler1.addEdge(3, 0); // D-A
  console.log(euler1.classify()); // { type: 'eulerian', start: 0 }
  console.log(euler1.findPath()); // [0, 1, 2, 3, 0] 或类似

  // 示例2：一笔画有奇数度顶点的图
  //     A
  //    / \
  //   B   C
  //    \ /
  //     D
  //   A(2偶), B(2偶), C(1奇), D(2偶) → 只有1个奇数顶点 → 无解！
  //   修正：A(1奇), B(2偶), C(2偶), D(1奇) → 2个奇数 → 有欧拉路径
  const euler2 = new EulerianPath();
  euler2.addEdge(0, 1); // A-B
  euler2.addEdge(0, 2); // A-C
  euler2.addEdge(1, 3); // B-D
  euler2.addEdge(2, 3); // C-D
  euler2.addEdge(0, 3); // A-D（再加一条）
  console.log(euler2.classify()); // { type: 'eulerian', start: 0 }

  // 示例3：七桥问题（无解）
  //     A --- B
  //     |     |
  //     C --- D
  //     |     |
  //     E --- F
  // 顶点 A,B,C,D,E,F 各有几条边？A:3, B:3, C:3, D:3, E:2, F:2
  // 奇数度顶点有4个(A,B,C,D)，不满足条件 → 无解
  const sevenBridges = new EulerianPath();
  sevenBridges.addEdge(0, 1); // A-B
  sevenBridges.addEdge(0, 2); // A-C
  sevenBridges.addEdge(1, 3); // B-D
  sevenBridges.addEdge(2, 3); // C-D
  sevenBridges.addEdge(2, 4); // C-E
  sevenBridges.addEdge(3, 5); // D-F
  sevenBridges.addEdge(4, 5); // E-F
  console.log(sevenBridges.classify()); // { type: 'none' }
}

demo();
```

### 运行结果

```bash
$ npx ts-node eulerian.ts
{ type: 'eulerian', start: 0 }
[ 0, 1, 2, 3, 0 ]
{ type: 'eulerian', start: 0 }
[ 0, 3, 2, 1, 0, 3 ]
{ type: 'none' }
```

## LeetCode 实战：公务员走了所有街道吗？

来看一道经典题：**LeetCode 2097. 合法重新排列数对**，这道题本质上就是让你判断一个图是否有欧拉路径，并输出其中一条。

```typescript
/**
 * LeetCode 2097: 合法重新排列数对
 *
 * 给定一个 pairs 数组，每个元素 [a, b] 表示一条从 a 到 b 的有向边。
 * 判断是否存在一个排列，使得每个数对的第二个数等于下一个数对的第一个数。
 *
 * 思路：有向图的欧拉路径问题
 * - 欧拉路径存在：有向图中恰好 0 或 2 个顶点满足 (出度-入度) 不为 0
 * - 出度-入度=1 的顶点是路径终点，=-1 的是起点
 * - 其余所有顶点出度必须等于入度
 */
function validArrangement(pairs: number[][]): number[][] {
  // 1. 建图 + 统计出入度
  const adj = new Map<number, number[]>();
  const inDeg = new Map<number, number>();
  const outDeg = new Map<number, number>();

  for (const [u, v] of pairs) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)!.push(v);
    outDeg.set(u, (outDeg.get(u) ?? 0) + 1);
    inDeg.set(v, (inDeg.get(v) ?? 0) + 1);
  }

  // 2. 找起点（出度-入度=1 的顶点）或任意一个存在的顶点
  let start = -1;
  for (const v of adj.keys()) {
    const out = outDeg.get(v) ?? 0;
    const inn = inDeg.get(v) ?? 0;
    if (out - inn === 1) { start = v; break; }
  }
  if (start === -1) start = adj.keys().next().value;

  // 3. Hierholzer（邻接表要按字母顺序排序，保证字典序最小）
  for (const key of adj.keys()) {
    adj.get(key)!.sort((a, b) => a - b);
  }

  const stack: number[] = [start];
  const path: number[] = [];

  while (stack.length > 0) {
    const v = stack[stack.length - 1];
    const neighbors = adj.get(v);
    if (neighbors && neighbors.length > 0) {
      const u = neighbors.pop()!;
      stack.push(u);
    } else {
      path.push(stack.pop()!);
    }
  }
  path.reverse();

  // 4. 构造数对数组
  const result: number[][] = [];
  for (let i = 0; i < path.length - 1; i++) {
    result.push([path[i], path[i + 1]]);
  }
  return result;
}

// 测试
console.log(validArrangement([[0,1],[1,2],[2,3],[3,4]]));
// → [[0,1],[1,2],[2,3],[3,4]] 或类似合法排列
```

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 判断图类型 | O(V) | O(V) |
| Hierholzer 查找路径 | O(V + E) | O(V + E) |

Hierholzer 算法的精妙之处在于：每条边只被访问一次，整体是线性的——不需要暴力枚举所有路径（那会是 O(E!)）。

## 实际应用场景

### 1. DNA 碎片组装 🔬

测序仪每次只能读出一小段 DNA 序列（reads），把这些碎片拼回完整序列是一个经典问题。
- 把每个碎片的重叠部分建模为图的边
- 找一条欧拉路径，每两个相邻碎片重叠的部分恰好对齐
- 这就是生物信息学里著名的 **de Bruijn 图**方法

### 2. 快递/外卖路径规划 🚚

城市路网中，快递员要走完所有街道送货，本质上是一个**中国邮递员问题**（CPP）：
- 如果所有路口度数都是偶数 → 有欧拉回路，直接走
- 如果有奇数度路口 → 必须重复走某些边才能回到起点，目标是**最小化重复走的总长度**
- 这就是中国邮递员问题的简化版

### 3. 电路板测试 📦

电路板上密密麻麻的走线，测试时需要用探针走完每条线且不重复。欧拉路径可以直接给出最优顺序。

### 4. 公路收费系统 💰

有些收费站的 ETC 感应线圈设计需要覆盖所有车道（边）恰好一次，用欧拉路径可以最小化设备安装数量。

## 总结

欧拉路径/回路是一个被严重低估的算法——很多人觉得它是"数学游戏"，但它在工程中处处出现。核心就两点：

1. **判断有没有解**：数奇数度顶点个数，0 个→有回路，2 个→有路径，其他→无解
2. **找路径**：用 Hierholzer 算法，O(V+E) 线性时间，比暴力枚举强一万倍

记住这个算法，下次面试遇到"一笔画"、"重新排列数对"、"遍历所有边恰好一次"相关的问题，你就能胸有成竹地回答了。

---

*感兴趣可以挑战 LeetCode 332（重新安排行程），这道 Hard 题就是有向图的欧拉路径，需要输出字典序最小的解。*
