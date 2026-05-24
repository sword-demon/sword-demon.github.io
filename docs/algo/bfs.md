---
title: 广度优先搜索（BFS）
description: BFS 详解：从层序遍历到最短路径，四语言实现
date: 2026-05-17 21:00:00
categories:
  - Algorithm
tags:
  - bfs
  - graph
  - tree
  - queue
  - interview
sidebarSort: 23
---

# 广度优先搜索（Breadth-First Search）

想象你站在一个巨大的迷宫入口，需要找到出口。有两种策略：

- **一条路走到黑**，撞墙了再回头换路 —— 这是 DFS（深度优先搜索）
- **像水波纹一样一层一层往外扩散**，先检查所有离你 1 步远的地方，再检查 2 步远的 —— 这就是 **BFS（广度优先搜索）**

BFS 的核心优势在于：**在无权图中，它找到的第一条路径一定是最短路径**。这是 DFS 做不到的。

## 原理拆解

BFS 的核心数据结构是**队列（Queue）**——先进先出。

```
起点入队 → 出队一个节点 → 把它所有未访问的邻居入队 → 重复直到队列为空
```

用一张图来演示。假设从节点 A 开始 BFS：

```
图结构：
    A
   / \
  B   C
 / \   \
D   E   F

BFS 访问顺序：

第 0 层：  队列 [A]           → 访问 A
第 1 层：  队列 [B, C]        → 访问 B、C
第 2 层：  队列 [D, E, F]     → 访问 D、E、F

访问顺序：A → B → C → D → E → F（一层一层往下）
```

对比 DFS 的顺序是 A → B → D → E → C → F（先往深处钻）。

### 为什么 BFS 能保证最短路径？

```
假设从起点 S 到目标 T：

BFS 第 1 层：检查所有距 S 为 1 步的节点
BFS 第 2 层：检查所有距 S 为 2 步的节点
BFS 第 3 层：检查所有距 S 为 3 步的节点
...
BFS 第 k 层：发现 T！→ 最短距离就是 k

因为在第 k 层之前，1 ~ k-1 步能到的节点都已经检查过了，
T 不在其中，所以 k 一定是最短距离。
```

这就是 BFS 求最短路径的**正确性证明**——它按距离从近到远逐层扩展，第一个到达目标的路径就是最短的。

### BFS 模板

几乎所有 BFS 题都可以套这个模板：

```
1. 创建队列，起点入队
2. 创建 visited 集合，标记起点
3. while 队列不为空：
   a. 记录当前队列长度 size（当前层的节点数）
   b. for i = 0 to size-1：
      - 出队一个节点
      - 如果是目标 → 返回结果
      - 遍历它的所有邻居
      - 如果邻居未访问 → 标记 + 入队
   c. 层数 +1
```

## 代码实现

### 经典问题一：二叉树层序遍历

> LeetCode 102. Binary Tree Level Order Traversal
> 按层返回二叉树节点的值，每一层一个数组。

#### TypeScript

```typescript
/**
 * 二叉树层序遍历 —— TypeScript 实现
 * 核心：用队列，每层处理 size 个节点
 */
class TreeNode {
  val: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(val: number) {
    this.val = val;
  }
}

function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];

  const result: number[][] = [];
  const queue: TreeNode[] = [root]; // 用数组模拟队列

  while (queue.length > 0) {
    const size = queue.length; // 当前层的节点数
    const level: number[] = [];

    // 一次处理一整层
    for (let i = 0; i < size; i++) {
      const node = queue.shift()!; // 出队
      level.push(node.val);

      // 左右孩子入队（下一层的节点）
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level); // 一层处理完毕
  }

  return result;
}

// 测试：构建二叉树 [3,9,20,null,null,15,7]
//       3
//      / \
//     9  20
//       / \
//      15  7
const root = new TreeNode(3);
root.left = new TreeNode(9);
root.right = new TreeNode(20);
root.right.left = new TreeNode(15);
root.right.right = new TreeNode(7);

console.log(levelOrder(root));
// [[3], [9, 20], [15, 7]]
```

#### Go

```go
package bfs

// TreeNode 二叉树节点
type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// LevelOrder 二叉树层序遍历 —— Go 实现
func LevelOrder(root *TreeNode) [][]int {
	if root == nil {
		return nil
	}

	var result [][]int
	queue := []*TreeNode{root}

	for len(queue) > 0 {
		size := len(queue)
		level := make([]int, 0, size)

		for i := 0; i < size; i++ {
			node := queue[0]
			queue = queue[1:] // 出队
			level = append(level, node.Val)

			if node.Left != nil {
				queue = append(queue, node.Left)
			}
			if node.Right != nil {
				queue = append(queue, node.Right)
			}
		}
		result = append(result, level)
	}
	return result
}
```

#### Java

```java
import java.util.*;

/**
 * 二叉树层序遍历 —— Java 实现
 */
public class LevelOrderTraversal {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();

            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);

                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }
}
```

#### Python

```python
"""二叉树层序遍历 —— Python 实现"""
from collections import deque

class TreeNode:
    def __init__(self, val: int):
        self.val = val
        self.left = None
        self.right = None

def level_order(root: TreeNode | None) -> list[list[int]]:
    if not root:
        return []

    result = []
    queue = deque([root])

    while queue:
        size = len(queue)
        level = []

        for _ in range(size):
            node = queue.popleft()  # O(1) 出队
            level.append(node.val)

            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

        result.append(level)
    return result


# 测试
root = TreeNode(3)
root.left = TreeNode(9)
root.right = TreeNode(20)
root.right.left = TreeNode(15)
root.right.right = TreeNode(7)
print(level_order(root))  # [[3], [9, 20], [15, 7]]
```

### 经典问题二：岛屿数量

> LeetCode 200. Number of Islands
> 给定一个 `'1'`（陆地）和 `'0'`（水）组成的二维网格，计算岛屿数量。

**BFS 策略：遍历每个格子，遇到 `'1'` 就从它开始 BFS 把整座岛"淹没"，岛屿计数 +1。**

#### TypeScript

```typescript
/**
 * 岛屿数量 —— TypeScript 实现
 * 遍历每个格子，遇到 '1' 就 BFS 把相连的陆地全标记为 '0'
 */
function numIslands(grid: string[][]): number {
  if (!grid.length) return 0;
  const rows = grid.length,
    cols = grid[0].length;
  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        bfs(grid, r, c, rows, cols); // 把整座岛淹掉
      }
    }
  }
  return count;
}

function bfs(
  grid: string[][],
  startR: number,
  startC: number,
  rows: number,
  cols: number,
) {
  const queue: [number, number][] = [[startR, startC]];
  grid[startR][startC] = "0"; // 标记已访问

  // 四个方向：上、下、左、右
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;

    for (const [dr, dc] of dirs) {
      const nr = r + dr,
        nc = c + dc;
      // 边界内 + 是陆地 → 入队 + 标记
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        grid[nr][nc] === "1"
      ) {
        grid[nr][nc] = "0";
        queue.push([nr, nc]);
      }
    }
  }
}

// 测试
const grid = [
  ["1", "1", "0", "0", "0"],
  ["1", "1", "0", "0", "0"],
  ["0", "0", "1", "0", "0"],
  ["0", "0", "0", "1", "1"],
];
console.log(numIslands(grid)); // 3
```

#### Go

```go
package bfs

// NumIslands 岛屿数量 —— Go 实现
func NumIslands(grid [][]byte) int {
	if len(grid) == 0 {
		return 0
	}
	rows, cols := len(grid), len(grid[0])
	count := 0

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if grid[r][c] == '1' {
				count++
				bfsIsland(grid, r, c, rows, cols)
			}
		}
	}
	return count
}

// 四个方向偏移量
var dirs = [4][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}

func bfsIsland(grid [][]byte, startR, startC, rows, cols int) {
	type point struct{ r, c int }
	queue := []point{{startR, startC}}
	grid[startR][startC] = '0'

	for len(queue) > 0 {
		p := queue[0]
		queue = queue[1:]

		for _, d := range dirs {
			nr, nc := p.r+d[0], p.c+d[1]
			if nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1' {
				grid[nr][nc] = '0'
				queue = append(queue, point{nr, nc})
			}
		}
	}
}
```

#### Java

```java
import java.util.*;

/**
 * 岛屿数量 —— Java 实现
 */
public class NumberOfIslands {

    private static final int[][] DIRS = {{-1,0},{1,0},{0,-1},{0,1}};

    public static int numIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        int count = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    bfs(grid, r, c, rows, cols);
                }
            }
        }
        return count;
    }

    private static void bfs(char[][] grid, int startR, int startC, int rows, int cols) {
        Queue<int[]> queue = new LinkedList<>();
        queue.offer(new int[]{startR, startC});
        grid[startR][startC] = '0';

        while (!queue.isEmpty()) {
            int[] cur = queue.poll();
            for (int[] d : DIRS) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
                    grid[nr][nc] = '0';
                    queue.offer(new int[]{nr, nc});
                }
            }
        }
    }
}
```

#### Python

```python
"""岛屿数量 —— Python 实现"""
from collections import deque

def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                _bfs(grid, r, c, rows, cols)
    return count

def _bfs(grid, start_r, start_c, rows, cols):
    queue = deque([(start_r, start_c)])
    grid[start_r][start_c] = "0"
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    while queue:
        r, c = queue.popleft()
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                grid[nr][nc] = "0"
                queue.append((nr, nc))
```

### 经典问题三：二叉树最小深度

> LeetCode 111. Minimum Depth of Binary Tree
> 从根节点到最近叶子节点的最短路径上的节点数。

**BFS 策略：层序遍历，第一个遇到的叶子节点所在的层数就是最小深度。**

#### TypeScript

```typescript
/**
 * 二叉树最小深度 —— TypeScript 实现
 * BFS 遇到第一个叶子节点就返回当前层数
 */
function minDepth(root: TreeNode | null): number {
  if (!root) return 0;

  const queue: TreeNode[] = [root];
  let depth = 1;

  while (queue.length > 0) {
    const size = queue.length;

    for (let i = 0; i < size; i++) {
      const node = queue.shift()!;

      // 叶子节点！第一个遇到的就是最近的
      if (!node.left && !node.right) return depth;

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    depth++;
  }
  return depth;
}
```

#### Go

```go
package bfs

// MinDepth 二叉树最小深度 —— Go 实现
func MinDepth(root *TreeNode) int {
	if root == nil {
		return 0
	}

	queue := []*TreeNode{root}
	depth := 1

	for len(queue) > 0 {
		size := len(queue)
		for i := 0; i < size; i++ {
			node := queue[0]
			queue = queue[1:]

			if node.Left == nil && node.Right == nil {
				return depth
			}
			if node.Left != nil {
				queue = append(queue, node.Left)
			}
			if node.Right != nil {
				queue = append(queue, node.Right)
			}
		}
		depth++
	}
	return depth
}
```

#### Java

```java
import java.util.*;

/**
 * 二叉树最小深度 —— Java 实现
 */
public class MinDepthTree {

    public static int minDepth(TreeNode root) {
        if (root == null) return 0;

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int depth = 1;

        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                if (node.left == null && node.right == null) return depth;
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            depth++;
        }
        return depth;
    }
}
```

#### Python

```python
"""二叉树最小深度 —— Python 实现"""
from collections import deque

def min_depth(root: TreeNode | None) -> int:
    if not root:
        return 0

    queue = deque([root])
    depth = 1

    while queue:
        for _ in range(len(queue)):
            node = queue.popleft()
            if not node.left and not node.right:
                return depth
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        depth += 1
    return depth
```

## 面试题精选

| 题号 | 题目                | BFS 思路                     | 难度 |
| ---- | ------------------- | ---------------------------- | ---- |
| 102  | 二叉树的层序遍历    | 标准 BFS 分层                | 中等 |
| 107  | 二叉树的层序遍历 II | 层序遍历后反转结果           | 中等 |
| 111  | 二叉树的最小深度    | BFS 遇到第一个叶子即返回     | 简单 |
| 200  | 岛屿数量            | 多源 BFS，遇到 '1' 就扩散    | 中等 |
| 286  | 墙与门              | 多源 BFS，从所有门同时出发   | 中等 |
| 127  | 单词接龙            | BFS 求最短转换序列           | 困难 |
| 752  | 打开转盘锁          | BFS 在状态空间中搜索         | 中等 |
| 994  | 腐烂的橘子          | 多源 BFS，每分钟扩散一层     | 中等 |
| 199  | 二叉树的右视图      | 层序遍历取每层最后一个       | 中等 |
| 429  | N 叉树的层序遍历    | 把左右孩子换成 children 列表 | 中等 |

## BFS vs DFS：什么时候用哪个？

```
                    ┌──────────────────────────┐
                    │       问题类型            │
                    └────────────┬─────────────┘
                 最短路径/最少步数 │       存在性/所有路径
                                 ▼               ▼
                            用 BFS           用 DFS
                    ┌────────────┴────────────────┐
                    │                             │
              无权图 BFS               有权图 Dijkstra
              （队列实现）              （优先队列实现）
```

| 场景              | 推荐              | 原因                 |
| ----------------- | ----------------- | -------------------- |
| 无权图最短路径    | BFS               | BFS 天然保证最短     |
| 二叉树层序遍历    | BFS               | 按层处理就是 BFS     |
| 连通分量/岛屿问题 | BFS 或 DFS 都行   | 只是遍历，不涉及最短 |
| 路径存在性        | DFS               | DFS 代码更短（递归） |
| 所有路径/排列组合 | DFS               | 回溯更方便           |
| 拓扑排序          | BFS（Kahn）或 DFS | 两种都行             |

## 业务场景

### 1. 社交网络推荐

"你可能认识的人"功能本质上就是 BFS：从你的好友列表出发（第 1 层），找到好友的好友（第 2 层），推荐那些跟你共同好友最多但你还没加的人。LinkedIn 和 Facebook 的好友推荐系统就是基于 BFS 的变种。

### 2. 网络爬虫

搜索引擎的爬虫从一个种子 URL 出发，解析页面中的所有链接，把新链接加入队列继续爬取。这就是标准的 BFS——先爬离种子近的重要页面，再慢慢往外扩散。保证高优先级页面优先被抓取。

### 3. 最短路径导航

地图应用中的步行/驾车导航，底层就是把路网建模成图，用 BFS（或更复杂的 Dijkstra/A\*）来找最短路径。地铁站之间的换乘查询就是典型的无权图最短路径问题。

### 4. 游戏中的 AI 寻路

NPC 要从 A 点走到 B 点，游戏引擎把地图网格化后，用 BFS 找最短路径。更复杂的场景会用 A\* 算法（BFS + 启发式函数），但核心思想不变。

### 5. 版本控制系统的 Diff

Git 在合并分支时，需要找到两个提交的最近公共祖先（LCA）。这个过程就是在提交历史形成的 DAG 上做 BFS。

## 复杂度分析

| 操作       | 时间复杂度 | 空间复杂度 | 说明             |
| ---------- | ---------- | ---------- | ---------------- |
| 二叉树 BFS | O(n)       | O(w)       | w 是树的最大宽度 |
| 图的 BFS   | O(V + E)   | O(V)       | V 节点数，E 边数 |
| 网格 BFS   | O(m × n)   | O(m × n)   | m 行 n 列        |

- **时间复杂度**：每个节点最多入队一次、出队一次，每条边最多被遍历一次，所以是 O(V + E)
- **空间复杂度**：最坏情况下队列中存的节点数 = 图的最大宽度。对于满二叉树，最后一层有 n/2 个节点，所以空间 O(n)

## 小结

BFS 的核心就三句话：**用队列、一层一层扩、先到的就是最短的**。

面试中遇到 BFS 题，记住这几个要点：

1. **模板要熟**：队列 + visited + 分层处理（`size = queue.length`）
2. **最短路径用 BFS**：无权图中 BFS 第一次到达目标就是最短路径
3. **多源 BFS**：多个起点同时入队（如腐烂的橘子、墙与门）
4. **标记时机**：入队时标记 visited，不是出队时（避免重复入队）
5. **网格题的四个方向**：用 `dirs = [[-1,0],[1,0],[0,-1],[0,1]]` 偏移量，比写四个 if 优雅得多

BFS 口诀：**一层一层往外扩，队列先进先出忙。最短路径它最强，到达即是最优解** ✅
