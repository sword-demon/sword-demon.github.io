---
title: 岛屿问题
description: 岛屿的个数与最大面积（BFS/DFS 在矩阵上的经典应用）
date: 2026-10-20 09:01:33
categories:
  - Algorithm
tags:
  - bfs
  - dfs
  - flood-fill
  - matrix
sidebarSort: 109
---

# 岛屿问题（Number of Islands & Max Area of Island）

你有没有刷 LeetCode 时见过这种题：给你一个二维网格，里面 `1` 是陆地、`0` 是水，让你数一下有几块连在一起的陆地？或者问最大那块陆地有多大？

这种题看着简单，但几乎**所有大厂的算法面试都会考一遍**，而且它会衍生出十几道变种题——比如封闭岛屿、被围绕的区域、岛屿的周长、单词搜索、最短路径…… 这些题背后的本质都是同一个东西：**Flood Fill（泛洪填充）+ 网格搜索**。

掌握了这套模板，碰到任何"在二维网格上找连通块"的问题，你都能 30 秒内给出正确思路。今天我们就来一次讲透它 ✨。

## 问题引入

### LeetCode 200：岛屿的数量

> 给你一个二维网格，1 代表陆地、0 代表水。岛屿是由相邻（上下左右）陆地组成的连通块。求岛屿的数量。

```
输入：
[
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1]
]

图示：
🟩🟩⬜⬜⬜
🟩🟩⬜⬜⬜
⬜⬜🟩⬜⬜
⬜⬜⬜🟩🟩

输出：3
```

### LeetCode 695：岛屿的最大面积

> 同上，求面积最大的岛屿包含多少格子。

```
输入上面那个网格，输出：4（左上角的岛屿是 2x2 = 4 个格子）
```

## 原理拆解

### 核心直觉：把陆地"染色"

想象一片被水包围的群岛。无人机从空中扫描，发现一块陆地就把它的所有相连格子都"染色"成同一种颜色（标记成 `0` 或加个 visited 标记），然后继续找下一块没染过色的陆地。

```text
🟩🟩⬜⬜⬜      染色 #1      ⬛⬛⬜⬜⬜
🟩🟩⬜⬜⬜    ─────────►    ⬛⬛⬜⬜⬜
⬜⬜🟩⬜⬜                  ⬜⬜🟩⬜⬜
⬜⬜⬜🟩🟩                  ⬜⬜⬜🟩🟩

这次染色完，岛屿数 = 1，再继续：

                              ⬛⬛⬜⬜⬜      ⬛⬛⬜⬜⬜
                              ⬛⬬⬜⬜⬜      ⬛⬛⬜⬜⬜
                              ⬜⬜🟩⬜⬜  ──► ⬜⬜⬛⬜⬜
                              ⬜⬜⬜🟩🟩      ⬜⬜⬜🟩🟩

染色 #2，岛屿数 = 2，继续：

                              ⬛⬛⬜⬜⬜      ⬛⬛⬜⬜⬜
                              ⬛⬛⬜⬜⬜      ⬛⬛⬜⬜⬜
                              ⬜⬜⬛⬜⬜      ⬜⬜⬛⬜⬜
                              ⬜⬜⬜🟩🟩  ──► ⬜⬜⬜⬛⬛

染色 #3，岛屿数 = 3 ✅
```

### 两种实现思路

这个染色过程有两种写法，本质上都是遍历连通块：

1. **DFS（深度优先搜索）**：从一块陆地出发，一条路走到黑（递归或栈），把所有相连的格子都标记
2. **BFS（广度优先搜索）**：从一块陆地出发，用队列一圈圈扩散，把所有相连格子标记

两种写法都能解决这道题，**BFS 在网格上更不容易爆栈**，是面试中更推荐的写法。

### 一个关键陷阱：不要忘记"是岛屿"的边界判断

每次你想走到 `(r, c)` 这个格子，必须检查 4 件事：

```
1. r 在范围内吗？(0 ≤ r < rows)
2. c 在范围内吗？(0 ≤ c < cols)
3. 这个格子是陆地吗？(grid[r][c] === 1)
4. 这个格子还没访问过吗？(没被标记成 0 或 visited)
```

四个条件都满足才能继续走。漏掉任何一个都会导致越界访问或死循环 💀。

### 时间复杂度：O(m × n)

每个格子最多被访问一次（访问完就标记成 0），所以总操作次数就是网格的格子数 m×n。

### 标记技巧：原地修改 vs 额外 visited 数组

直接修改 `grid[r][c] = 0` 标记访问过是最省事的做法。但如果题目要求"不能修改原网格"（比如用 BFS 染色那种用 `2` 区分陆地/水域的），就需要用一个单独的 `visited` 数组。

## 代码实现

### TypeScript

```typescript
/**
 * 岛屿的数量 —— TypeScript 实现（DFS）
 *
 * 核心思路：遍历网格，每遇到一块没访问过的陆地，
 * 就用 DFS 把所有相连的陆地都"染色"成 0。
 * 启动了 DFS 几次，就有几个岛屿。
 */
function numIslands(grid: number[][]): number {
  if (grid.length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  // DFS 函数：把所有相连的陆地都染色成 0
  // 为什么用闭包捕获 rows/cols/grid：避免函数间传参
  const dfs = (r: number, c: number): void => {
    // 递归终止条件：越界、或不是陆地
    if (r < 0 || c < 0 || r >= rows || c >= cols) return;
    if (grid[r][c] !== 1) return;

    // 关键：标记为已访问（原地修改为 0）
    // 为什么这么做：避免重复访问，且不需要额外 visited 数组
    grid[r][c] = 0;

    // 四个方向继续 DFS
    dfs(r - 1, c); // 上
    dfs(r + 1, c); // 下
    dfs(r, c - 1); // 左
    dfs(r, c + 1); // 右
  };

  // 遍历整个网格
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 找到一块没访问过的陆地，启动 DFS
      if (grid[r][c] === 1) {
        count++;
        dfs(r, c);
      }
    }
  }

  return count;
}

/**
 * 岛屿的最大面积 —— TypeScript 实现（BFS）
 *
 * 核心思路：同样遍历网格，每遇到陆地就 BFS 把它和所有相连陆地访问一遍，
 * 同时计算访问到的格子数，作为这块岛屿的面积。
 */
function maxAreaOfIsland(grid: number[][]): number {
  if (grid.length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let maxArea = 0;

  // BFS 函数：返回这块岛屿的面积
  const bfs = (startR: number, startC: number): number => {
    let area = 0;
    // 用数组模拟队列，存 [r, c] 对
    // 为什么不用真正的 Queue 类：避免引入依赖，简单场景直接数组就行
    const queue: [number, number][] = [[startR, startC]];

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      // 越界 / 非陆地 / 已访问 都跳过
      if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
      if (grid[r][c] !== 1) continue;

      grid[r][c] = 0; // 标记已访问
      area++;

      // 四个方向加入队列
      queue.push([r - 1, c]);
      queue.push([r + 1, c]);
      queue.push([r, c - 1]);
      queue.push([r, c + 1]);
    }

    return area;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        // BFS 返回当前岛屿面积，与最大值比较
        maxArea = Math.max(maxArea, bfs(r, c));
      }
    }
  }

  return maxArea;
}

// 测试用例
const grid = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1],
];

console.log(numIslands(grid));       // 3
console.log(maxAreaOfIsland(grid));  // 4
```

### Go

```go
package islands

// NumIslands 岛屿的数量 —— DFS 实现
func NumIslands(grid [][]byte) int {
	if len(grid) == 0 {
		return 0
	}

	rows := len(grid)
	cols := len(grid[0])
	count := 0

	// dfsHelper 用闭包共享 grid/rows/cols
	var dfsHelper func(r, c int)
	dfsHelper = func(r, c int) {
		// 终止条件：越界 或 不是陆地
		if r < 0 || c < 0 || r >= rows || c >= cols {
			return
		}
		if grid[r][c] != '1' {
			return
		}

		// 标记为已访问（原地修改为 0）
		grid[r][c] = '0'

		// 四个方向继续 DFS
		dfsHelper(r-1, c)
		dfsHelper(r+1, c)
		dfsHelper(r, c-1)
		dfsHelper(r, c+1)
	}

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if grid[r][c] == '1' {
				count++
				dfsHelper(r, c)
			}
		}
	}
	return count
}

// MaxAreaOfIsland 岛屿的最大面积 —— BFS 实现
// 为什么用 BFS 不用 DFS：避免深度递归爆栈，网格大时 BFS 更安全
func MaxAreaOfIsland(grid [][]int) int {
	if len(grid) == 0 {
		return 0
	}

	rows := len(grid)
	cols := len(grid[0])
	maxArea := 0

	// 四个方向偏移量：上、下、左、右
	// 为什么用数组存：循环遍历比写 4 个 if 更优雅
	dirs := [][]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}

	bfs := func(sr, sc int) int {
		area := 0
		// 用切片模拟队列
		queue := [][]int{{sr, sc}}

		for len(queue) > 0 {
			// 出队（从头部取出）
			cell := queue[0]
			queue = queue[1:]

			r, c := cell[0], cell[1]

			// 越界或非陆地，跳过
			if r < 0 || c < 0 || r >= rows || c >= cols {
				continue
			}
			if grid[r][c] != 1 {
				continue
			}

			grid[r][c] = 0 // 标记已访问
			area++

			// 四个方向加入队列
			for _, d := range dirs {
				queue = append(queue, []int{r + d[0], c + d[1]})
			}
		}

		return area
	}

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if grid[r][c] == 1 {
				area := bfs(r, c)
				if area > maxArea {
					maxArea = area
				}
			}
		}
	}
	return maxArea
}
```

### Java

```java
import java.util.LinkedList;
import java.util.Queue;

public class IslandProblems {

    /**
     * 岛屿的数量 —— BFS 实现
     *
     * 推荐面试用 BFS 的两个原因：
     * 1. 避免递归爆栈（DFS 在大网格上很危险）
     * 2. 思路接近"广度扩散"，符合人的直觉
     */
    public static int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;

        int rows = grid.length;
        int cols = grid[0].length;
        int count = 0;

        // 四个方向偏移
        // 为什么按上、右、下、左：经典顺序，没有特别的理由
        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    bfs(grid, r, c, rows, cols, dr, dc);
                }
            }
        }
        return count;
    }

    /**
     * BFS 把所有相连的陆地标记为 0
     */
    private static void bfs(char[][] grid, int sr, int sc,
                            int rows, int cols, int[] dr, int[] dc) {
        Queue<int[]> queue = new LinkedList<>();
        queue.offer(new int[]{sr, sc});
        grid[sr][sc] = '0'; // 立即标记，防止重复入队

        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            int r = cell[0], c = cell[1];

            // 四个方向尝试扩展
            for (int i = 0; i < 4; i++) {
                int nr = r + dr[i];
                int nc = c + dc[i];

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
                    && grid[nr][nc] == '1') {
                    grid[nr][nc] = '0'; // 入队前标记
                    queue.offer(new int[]{nr, nc});
                }
            }
        }
    }

    /**
     * 岛屿的最大面积 —— DFS 实现
     */
    public static int maxAreaOfIsland(int[][] grid) {
        if (grid == null || grid.length == 0) return 0;

        int rows = grid.length;
        int cols = grid[0].length;
        int[] maxArea = {0}; // 用数组包装，让 lambda 能修改

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 1) {
                    int area = dfs(grid, r, c, rows, cols);
                    maxArea[0] = Math.max(maxArea[0], area);
                }
            }
        }
        return maxArea[0];
    }

    private static int dfs(int[][] grid, int r, int c, int rows, int cols) {
        // 终止条件：越界 或 不是陆地
        if (r < 0 || c < 0 || r >= rows || c >= cols) return 0;
        if (grid[r][c] != 1) return 0;

        grid[r][c] = 0; // 标记已访问
        int area = 1; // 当前格子算 1

        // 递归遍历四个方向，累加面积
        area += dfs(grid, r - 1, c, rows, cols);
        area += dfs(grid, r + 1, c, rows, cols);
        area += dfs(grid, r, c - 1, rows, cols);
        area += dfs(grid, r, c + 1, rows, cols);

        return area;
    }
}
```

### Python

```python
from collections import deque
from typing import List


class IslandProblems:
    """岛屿问题模板集合

    核心套路：
    1. 双层循环遍历网格
    2. 遇到没访问的陆地，启动搜索（DFS/BFS）
    3. 搜索过程中把所有相连陆地标记为已访问
    4. 每次启动搜索 = 发现一个新岛屿；累加的格子数 = 岛屿面积
    """

    # 四个方向：上、下、左、右
    # 为什么写在外面：避免在循环里重复创建列表
    _DIRS = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    @staticmethod
    def num_islands(grid: List[List[str]]) -> int:
        """岛屿的数量 —— BFS 实现"""
        if not grid or not grid[0]:
            return 0

        rows, cols = len(grid), len(grid[0])
        count = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    count += 1
                    IslandProblems._bfs_mark(grid, r, c, rows, cols)

        return count

    @staticmethod
    def _bfs_mark(grid, sr, sc, rows, cols) -> None:
        """BFS 把所有相连的陆地标记为 0"""
        queue = deque([(sr, sc)])
        grid[sr][sc] = "0"  # 标记起点已访问

        while queue:
            r, c = queue.popleft()

            for dr, dc in IslandProblems._DIRS:
                nr, nc = r + dr, c + dc
                # 关键：四个边界条件都要检查
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                    grid[nr][nc] = "0"  # 标记后再入队，防止重复
                    queue.append((nr, nc))

    @staticmethod
    def max_area_of_island(grid: List[List[int]]) -> int:
        """岛屿的最大面积 —— DFS 实现"""
        if not grid or not grid[0]:
            return 0

        rows, cols = len(grid), len(grid[0])
        max_area = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    area = IslandProblems._dfs_area(grid, r, c, rows, cols)
                    max_area = max(max_area, area)

        return max_area

    @staticmethod
    def _dfs_area(grid, r, c, rows, cols) -> int:
        """DFS 返回这块岛屿的面积"""
        # 终止条件：越界 或 不是陆地
        if not (0 <= r < rows and 0 <= c < cols):
            return 0
        if grid[r][c] != 1:
            return 0

        grid[r][c] = 0  # 标记已访问
        area = 1  # 当前格子算 1

        # 递归四个方向
        for dr, dc in IslandProblems._DIRS:
            area += IslandProblems._dfs_area(grid, r + dr, c + dc, rows, cols)

        return area


# === 测试 ===
if __name__ == "__main__":
    grid = [
        ["1", "1", "0", "0", "0"],
        ["1", "1", "0", "0", "0"],
        ["0", "0", "1", "0", "0"],
        ["0", "0", "0", "1", "1"],
    ]

    print(IslandProblems.num_islands(grid))        # 3
    # 注意 max_area_of_island 会修改传入的 grid，做测试时注意复制
    grid2 = [
        [1, 1, 0, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1],
    ]
    print(IslandProblems.max_area_of_island(grid2))  # 4
```

## 同系列变种题（拿下一打）

### 1. LeetCode 1254：封闭岛屿的数目

> 区别在于，"封闭岛屿"是连不到边界的岛屿。

```text
🟩⬜⬜⬜🟩    ← 这块岛屿在边界，所以不算封闭岛屿
⬜🟩🟩🟩⬜
⬜🟩🟩🟩⬜
⬜🟩🟩🟩⬜
🟩⬜⬜⬜🟩    ← 这块也在边界

思路：
1. 先把边界上的所有 1 通过 DFS 全部"染色"成 0
2. 然后用标准的 numIslands 数剩下的 1，就是封闭岛屿数
```

### 2. LeetCode 130：被围绕的区域

> 把所有被 X 包住的 O 都改成 X。

```text
初始：
🟩🟩⬜⬜⬜
⬜🟩🟩⬜⬜

最终：所有被 1 包围的 0 都变成 1
🟩🟩🟩🟩⬜
🟩🟩🟩🟩⬜

（第一行和最右列的 0 是连到边界的，所以保留）

思路：从边界出发，把所有连到边界的 0 标记成另一种符号（比如 #），
遍历结束后统一把剩下的 0 改成 X、把 # 改回 0
```

### 3. LeetCode 463：岛屿的周长

> 给一个网格，里面只有一块岛屿。求它的周长。

```text
🟩🟩⬜
⬜🟩🟩

思路：遍历每个陆地格子，检查它的上、右、下、左四个相邻格子，
- 如果相邻格子是水（0）或越界 → 周长 +1
- 如果相邻格子是陆地（1）→ 不增加

周长 = 4 × 陆地数 - 2 × 相邻对数
或者直接按格子逐个计算上、右、下、左的边界情况，更直观
```

### 4. LeetCode 79：单词搜索

> 给一个网格和一个单词，判断单词能不能由网格中的相邻格子路径拼出。

```text
board =
[
  ['A','B','C','E'],
  ['S','F','C','S']
]
word = "ABCCED"

┌─────────┬─────────┬─────────┬─────────┐
│   A     │   B     │   C     │   E     │
├─────────┼─────────┼─────────┼─────────┤
│   S     │   F     │   C     │   S     │
└─────────┴─────────┴─────────┴─────────┘

A → B → C → C → E → D ✅

思路：DFS + 回溯
1. 遍历找单词的起点字符
2. 从起点开始 DFS，上下左右尝试下一个字符
3. 标记当前格子已访问（避免同一格子被复用）
4. 不匹配就回溯，恢复现场
```

### 5. LeetCode 1091：二进制矩阵中的最短路径

> 从左上角到右下角，0 是通路、1 是墙，求最短路径（8 个方向都可走，包括斜线）。

```text
难度升级，但套路完全一样：
- BFS 而非 DFS（BFS 天然适合求最短路）
- 8 个方向偏移
- 边界 + 访问过判断
```

### 6. LeetCode 542：01 矩阵

> 给一个 0/1 矩阵，求每个 1 到最近 0 的距离。

```text
思路 1：多源 BFS 从所有 0 出发扩散，一次搞定
思路 2：DP 两次扫描，先左上→右下、再右下→左上
```

你看，是不是所有题本质上都是 **"遍历网格 + 标记访问 + 四方向探索"** 这套模板？👉

## 业务场景

### 1. 图像处理：Flood Fill 填充

Photoshop、Paint 工具里的"油漆桶"功能，本质就是：在二维像素阵列上找到与点击位置相连的同色像素，把它们改成新颜色。这跟岛屿问题**完全是一回事**。

```text
点击 🟩 的位置后，整个连通区域都被填充成新的颜色：

🟩🟩🟩⬜⬜       🟪🟪🟪⬜⬜
🟩🟩⬜⬜⬜       🟪🟪⬜⬜⬜
⬜⬜🟩⬜⬜  ──►  ⬜⬜🟩⬜⬜
⬜⬜⬜🟩🟩       ⬜⬜⬜🟩🟩
```

### 2. 棋盘游戏：连通区域识别

围棋、五子棋、俄罗斯方块消消乐等游戏，需要识别"连成一片"的相同色块来做消除判定。暴雪、Supercell 等大厂的棋盘/消除类游戏服务端判定都会用到 BFS/DFS 在网格上做连通块分析。

### 3. 社交网络：好友圈数量

给定"谁关注谁"的二维关系矩阵（或者邻接表转邻接矩阵），求朋友圈的数量。这是经典的"联通分量"问题，岛屿问题的数据结构版本。LeetCode 547 朋友圈就是这道。

### 4. 地理信息系统：相邻地块合并

GIS 系统需要识别"地块归属同一所有者"或者"湖泊是连通的"这类问题，本质上都是 Flood Fill 算法的延伸。

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度       |
| ---- | ---------- | ---------------- |
| 遍历 | O(m × n)   | O(1)（除队列外） |
| DFS  | O(m × n)   | O(m × n)（递归栈）|
| BFS  | O(m × n)   | O(m × n)（队列最坏情况）|

- **时间 O(m × n)**：每个格子最多入队/出队/被访问一次。
- **空间 DFS**：递归栈最深可能 m×n（最坏情况整张网格都是陆地，DFS 会沿一个方向一路走到头）。所以**网格大时（比如 1000×1000），DFS 容易爆栈**，这时推荐用 BFS。
- **空间 BFS**：队列最坏情况是整个网格的所有边界格子同时入队，比如 m+n 量级。但如果递归栈没事，DFS 在 JavaScript 这种没有栈大小限制的环境里也安全。Python 默认递归深度 1000，网格大时也得用 BFS 或手动加 `sys.setrecursionlimit`。

## 小结

岛屿问题本质上是**网格上的图论基本功**，套路极其固定：

1. **双层循环遍历网格**，定位"没访问过的陆地"
2. **启动搜索**（DFS 或 BFS）把所有相连的陆地标记为已访问
3. **每次启动搜索 = 一个新岛屿**，或者累加的格子数就是这块岛屿的面积

掌握了这个模板，下面这些题都能秒杀：

| LeetCode 题号 | 题目                    | 核心变化                |
| ------------- | ----------------------- | ----------------------- |
| 200           | 岛屿的数量              | 计数                    |
| 695           | 岛屿的最大面积          | 计数 + 累加             |
| 463           | 岛屿的周长              | 边界判断                |
| 1254          | 封闭岛屿的数目          | 先染色边界              |
| 130           | 被围绕的区域            | 边界保护 + 反向标记     |
| 79            | 单词搜索                | DFS + 回溯              |
| 1091          | 二进制矩阵中的最短路径  | BFS + 8 方向            |
| 542           | 01 矩阵                  | 多源 BFS                |
| 547           | 朋友圈                  | 邻接矩阵上的连通分量    |
| 1102          | 得分最高的路径          | 排序 + BFS              |

面试中如果遇到网格题，**先在脑子里背一遍这套模板**，90% 的情况都能 30 秒内给出思路，剩下的就是根据题目细节调整方向数、染色方式、终止条件。

最后一条小建议：**优先用 BFS 不用 DFS**。一来不容易爆栈，二来 BFS 天然适合求最短路，三来代码读起来更直观。实在喜欢 DFS 的，也记住调整一下 `sys.setrecursionlimit`，别在大测试用例上一脚踩到爆栈的红线 💥。
