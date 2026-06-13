---
title: A* 搜索算法
description: A* 搜索算法（A Star）—— 从游戏寻路到 GPS 导航的最短路径利器
date: 2026-06-13 08:00:00
categories:
  - Algorithm
tags:
  - a-star
  - graph
  - shortest-path
sidebarSort: 44
---

# A* 搜索算法（A Star）

你玩过《王者荣耀》或者《英雄联盟》吧？你点一下地图上的某个位置，英雄就会自动绕开障碍物，走一条看起来"最聪明"的路到达目的地。这个"自动寻路"背后，最经典的算法就是 **A***。

再想想你打开高德地图，输入起点和终点，它秒秒钟给你规划出一条最优路线。这也是 A* 或者它的变体在发挥作用。

你可能会问——前面不是已经讲过 [Dijkstra](dijkstra.md) 了吗？Dijkstra 确实能找到最短路径，但它有个"缺点"：**无脑搜索**。它像一个没有方向感的人，会把起点周围一圈一圈地全部探索一遍，直到找到终点。如果你只需要从 A 到 B，干嘛要去探索完全相反方向的节点呢？

A* 就是 Dijkstra 的"开窍版" 🧠——它加了一个**启发函数**（Heuristic），告诉算法"终点大概在那个方向"，从而大幅减少搜索范围，效率直接起飞。

## 原理拆解

### 1. 从 Dijkstra 到 A*

先回顾一下 Dijkstra 的核心逻辑：每次从未访问的节点中，选一个**距离起点最近**的节点，然后更新它的邻居。

```
Dijkstra 选节点的依据：
  f(n) = g(n)
  
  g(n) = 从起点到节点 n 的实际距离（已知的）
```

A* 在此基础上加了一个"魔法"：

```
A* 选节点的依据：
  f(n) = g(n) + h(n)
  
  g(n) = 从起点到节点 n 的实际距离（已知的）
  h(n) = 从节点 n 到终点的估算距离（启发函数，猜测的）
  f(n) = 总的预估代价
```

核心思想：**优先探索 f(n) 最小的节点**——也就是"已经走过的路 + 预估还剩的路"最小的那个。

### 2. 启发函数 h(n) 的选取

启发函数是 A* 的灵魂。选得好，搜索飞快；选得不好，可能退化成 Dijkstra。

#### 常见启发函数

```
地图类型          启发函数                    公式
─────────────────────────────────────────────────────
网格地图（可8方向）  对角线距离（Chebyshev）    h = max(|dx|, |dy|)
网格地图（仅4方向）  曼哈顿距离（Manhattan）    h = |dx| + |dy|
连续平面 / 地图     欧几里得距离（Euclidean）   h = sqrt(dx² + dy²)
```

其中 `dx = |当前x - 终点x|`，`dy = |当前y - 终点y|`。

#### 关键性质：可采纳性（Admissible）

启发函数必须满足：**h(n) 永远不会高估到达终点的实际距离**。

```
✅ 好的 h：实际距离是 10，你估了 8（低估了，没事）
❌ 坏的 h：实际距离是 10，你估了 12（高估了，可能错过最优路径！）
```

为什么？因为如果 h 高估了，A* 可能会认为"这条路太远了，不走了"，结果错过了一条其实更短的路径。只要 h 不高估，A* 就**保证找到最优解**。

### 3. 图解搜索过程

假设我们在一个 5×5 的网格上，`S` 是起点，`E` 是终点，`#` 是障碍物：

```
网格地图：
  0   1   2   3   4
0 [S] [.] [.] [.] [.]
1 [.] [#] [#] [.] [.]
2 [.] [.] [.] [.] [.]
3 [.] [.] [#] [#] [.]
4 [.] [.] [.] [.] [E]

A* 搜索过程（曼哈顿距离）：

第1步：从 S(0,0) 出发
  g(S) = 0, h(S) = |0-4| + |0-4| = 8, f(S) = 0 + 8 = 8
  邻居：(0,1) 和 (1,0)

第2步：选 f 最小的展开
  (0,1): g = 1, h = |0-4| + |1-4| = 7, f = 1 + 7 = 8
  (1,0): g = 1, h = |1-4| + |0-4| = 7, f = 1 + 7 = 8
  
  相同 f 值，任选一个。A* 会朝着终点方向优先展开，
  不像 Dijkstra 那样无差别地向四周扩散。

... 持续展开直到到达 E
```

### 4. 与 Dijkstra 的对比

```
Dijkstra 搜索范围（示意）：      A* 搜索范围（示意）：

  [✓] [✓] [✓] [✓] [✓]           [.] [.] [.] [.] [.]
  [✓] [#] [#] [✓] [✓]           [.] [#] [#] [✓] [.]
  [✓] [✓] [✓] [✓] [✓]           [.] [✓] [✓] [✓] [.]
  [✓] [✓] [#] [#] [✓]           [.] [✓] [#] [#] [✓]
  [✓] [✓] [✓] [✓] [✓]           [.] [.] [.] [✓] [✓]

  探索了几乎全部节点 😅           只探索了关键路径附近的节点 🎯
```

## 代码实现

### TypeScript 实现（网格地图版）

这是面试和实际开发中最常见的版本——在网格地图上找最短路径：

```typescript
interface Point {
  x: number;
  y: number;
}

interface Node {
  point: Point;
  g: number;  // 起点到当前节点的实际代价
  h: number;  // 当前节点到终点的估算代价
  f: number;  // g + h
  parent: Node | null;
}

function heuristic(a: Point, b: Point): number {
  // 曼哈顿距离（适用于4方向移动的网格）
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function aStar(
  grid: number[][],   // 0 = 通路, 1 = 障碍
  start: Point,
  end: Point
): Point[] | null {
  const rows = grid.length;
  const cols = grid[0].length;

  // 四个方向：上、下、左、右
  const directions = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
  ];

  // 用数组模拟优先队列（生产环境建议用最小堆）
  const openList: Node[] = [];
  // closedList 记录已访问的节点
  const closedSet = new Set<string>();

  const key = (p: Point) => `${p.x},${p.y}`;

  const startNode: Node = {
    point: start,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
    parent: null,
  };
  openList.push(startNode);

  while (openList.length > 0) {
    // 选 f 值最小的节点
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    // 到达终点，回溯路径
    if (current.point.x === end.x && current.point.y === end.y) {
      const path: Point[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift(node.point);
        node = node.parent;
      }
      return path;
    }

    closedSet.add(key(current.point));

    // 遍历邻居
    for (const dir of directions) {
      const nx = current.point.x + dir.x;
      const ny = current.point.y + dir.y;
      const neighbor: Point = { x: nx, y: ny };

      // 边界检查
      if (nx < 0 || nx >= rows || ny < 0 || ny >= cols) continue;
      // 障碍物检查
      if (grid[nx][ny] === 1) continue;
      // 已访问检查
      if (closedSet.has(key(neighbor))) continue;

      const g = current.g + 1;
      const h = heuristic(neighbor, end);
      const f = g + h;

      // 如果这个邻居已经在 openList 中且新的 g 更小，更新它
      const existing = openList.find(
        (n) => n.point.x === nx && n.point.y === ny
      );
      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        }
      } else {
        openList.push({
          point: neighbor,
          g,
          h,
          f,
          parent: current,
        });
      }
    }
  }

  return null; // 无解
}
```

### 使用示例

```typescript
const grid = [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0],
];

const path = aStar(grid, { x: 0, y: 0 }, { x: 4, y: 4 });
console.log(path);
// 输出路径：[{0,0}, {0,1}, {0,2}, {0,3}, {1,3}, {2,3}, {2,4}, {3,4}, {4,4}]
// 或者类似的一条最优路径
```

### Python 实现（图版本）

如果是带权图而非网格，只需要调整邻居获取方式和代价计算：

```python
import heapq

def a_star(graph, start, end, h):
    """
    graph: 邻接表 {node: [(neighbor, weight), ...]}
    h: 启发函数 h(node) -> 估算到终点的距离
    """
    # 优先队列：(f, g, node, path)
    open_list = [(h(start), 0, start, [start])]
    visited = set()

    while open_list:
        f, g, current, path = heapq.heappop(open_list)

        if current == end:
            return path, g  # 返回路径和实际距离

        if current in visited:
            continue
        visited.add(current)

        for neighbor, weight in graph[current]:
            if neighbor in visited:
                continue
            new_g = g + weight
            new_f = new_g + h(neighbor)
            heapq.heappush(open_list, (new_f, new_g, neighbor, path + [neighbor]))

    return None, float('inf')  # 无解
```

### 性能优化提示

上面的实现用数组 `sort` 来模拟优先队列，时间复杂度不够好。实际项目中建议：

```typescript
// 使用最小堆替换 openList
// 推荐库：
// - ts-datastructures（自带 MinHeap）
// - 自己实现一个简单的二叉堆

// 最小堆版本的取最小值操作：
// 从 O(n log n) 优化到 O(log n)
```

## 复杂度分析

| 维度 | 复杂度 | 说明 |
|------|--------|------|
| **时间** | O(b^d) | b = 分支因子，d = 最优解的深度。最坏情况跟 Dijkstra 一样 |
| **空间** | O(b^d) | 需要维护 openList 和 closedSet |
| **最优性** | ✅ 保证 | 前提是 h(n) 是可采纳的（不高估） |
| **完备性** | ✅ 保证 | 只要存在解，一定能找到 |

但实际上，由于启发函数的引导，A* 展开的节点数远少于 Dijkstra。启发函数越精准（越接近实际距离），搜索效率越高。

```
启发函数质量对搜索效率的影响：

h(n) = 0           → 退化为 Dijkstra（无启发）
h(n) = 精确距离     → 直接沿最优路径走（一步到位，但通常不可能提前知道）
h(n) = 曼哈顿距离   → 大幅剪枝，效率很高 ✅
h(n) = 欧几里得距离  → 比较保守，但安全 ✅
h(n) > 实际距离     → ❌ 可能找不到最优解！
```

## 实际应用场景

### 1. 游戏寻路

这是 A* 最经典的应用。几乎所有有 NPC 移动的游戏都用到了 A*：

- 《星际争霸》《魔兽争霸》等 RTS 游戏的单位寻路
- 《王者荣耀》《LOL》的英雄自动寻路
- 棋类游戏（象棋、围棋的早期 AI）

### 2. 地图导航

高德地图、Google Maps 的路线规划底层就是 A* 的变体（如 Contraction Hierarchies + A*）：

```
导航中的 A*：
  g(n) = 已行驶的距离
  h(n) = 直线距离到目的地（不可能比直线更短，所以是可采纳的）
```

### 3. 机器人路径规划

扫地机器人、工业机器人在已知地图中的路径规划，很多都基于 A* 或其变体（如 D*、Lifelong Planning A*）。

### 4. 网络路由

在某些网络协议中，数据包的路由选择也可以用 A* 来优化，把带宽、延迟等因素综合进代价函数。

## A* 的变体

| 变体 | 特点 | 适用场景 |
|------|------|----------|
| **IDA*** | 迭代加深版 A*，空间复杂度 O(d) | 内存受限场景 |
| **D*** | 动态 A*，支持地图实时变化 | 机器人在线规划 |
| **Jump Point Search** | 网格地图专用，跳过大量中间节点 | 均匀网格上的超快寻路 |
| **Theta*** | 允许任意角度路径（不限于网格方向） | 更自然的路径 |
| **ARA*** | Anytime A*，先快速给次优解再逐步优化 | 有时间限制的场景 |

## 常见面试问题

**Q：A* 和 Dijkstra 的区别？**
> A* = Dijkstra + 启发函数。Dijkstra 是 A* 在 h(n)=0 时的特例。A* 因为有方向性引导，通常效率更高。

**Q：A* 一定能找到最短路径吗？**
> 能，前提是启发函数是"可采纳的"（admissible），即 h(n) ≤ 实际最短距离。

**Q：如果 h(n) 估高了会怎样？**
> 搜索速度可能更快，但不再保证最优解。变成了一种"贪心搜索"。

**Q：怎么选择启发函数？**
> 网格地图用曼哈顿距离（4方向）或对角线距离（8方向）。带权图可以考虑欧几里得距离。关键是不能高估。

## 总结

A* 算法是 Dijkstra 的"升级版"，通过启发函数引导搜索方向，在保证最优解的前提下大幅提升效率。它的核心公式 **f(n) = g(n) + h(n)** 简洁优美，理解了这个公式就理解了 A* 的灵魂。

记住三个要点：
1. **g(n)** 保证了不会因为贪心而错过最优路径
2. **h(n)** 保证了不会像无头苍蝇一样乱搜
3. **h(n) 必须可采纳**（不高估），否则最优性无法保证

下次面试被问到"最短路径"相关的问题，别只说 Dijkstra 了——提一嘴 A*，面试官会觉得你是真懂的人 😎。
