---
title: 并查集（Union-Find）
description: 并查集（Union-Find）—— 处理"连接"问题的神器，朋友圈数量、岛屿数量、等式方程求解一网打尽
date: 2026-07-19 09:01:37
categories:
  - Algorithm
tags:
  - union-find
  - disjoint-set
  - connected-components
  - interview
sidebarSort: 66
---

# 并查集（Union-Find）

你有没有遇到过这样的问题：**"朋友圈"**

> 假设有 n 个人，如果两个人是朋友关系，我们就说他们属于同一个朋友圈。已知若干对朋友关系，问一共有多少个朋友圈？

或者 **"岛屿数量"**：

> 给一个二维网格地图（'1' 表示陆地，'0' 表示水域），统计有多少个独立的岛屿（相邻的陆地上下左右相连算一个岛屿）。

这两个看起来风马牛不相及的问题，其实都可以用 **并查集（Union-Find）** 来秒解 ✨

再比如 **"等式方程可满足性"**：

> 给定一组形如 `a == b` 或 `a != b` 的方程，问这些方程能否同时成立？

这题也是并查集的经典应用。

## 原理拆解

### 1. 从生活中理解

想象你是一个班主任，要统计班级里有多少个"小团体"。

一开始，每个学生都是独立的个体，各自为营：

```
学生1  学生2  学生3  学生4  学生5
 ①      ②      ③      ④      ⑤
```

老师告诉你：小明和小红是好朋友 → 合并他俩
```
学生1  学生2  学生3  学生4  学生5
 ①←②   ③      ④      ⑤
```

老师又告诉你：小刚和小明是好朋友 → 合并小刚和小明所在的小团体
```
学生1  学生2  学生3  学生4  学生5
 ①←②←④  ③      ⑤
```

这样，通过不断"合并"小团体，我们能快速知道：
- 任意两个学生是否在同一个朋友圈？
- 总共有多少个独立的小团体？

这就是并查集干的事情 —— **维护一堆不相交的集合，支持"合并"和"查询"两个操作**。

### 2. 数据结构设计

并查集本质上是一个**森林**（多棵树），每棵树代表一个集合。树根节点就是整个集合的"代表元"。

```
初始状态（每个元素都是自己的根）：

parent: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        0  1  2  3  4  5  6  7  8  9
        ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑
       各自指向自己（根节点的 parent 指向自己）

合并 0-1, 3-8, 2-5 后：

parent: [1, 1, 5, 8, 4, 5, 6, 7, 8, 9]
        0  1  2  3  4  5  6  7  8  9
        ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓
        1→1  1  5→5  8→8  4  5  6  7  8  9

树结构：
  {0, 1}     {2, 5}    {3, 8}    {4}  {6}  {7}  {9}
    ①           ⑤        ⑧       ④    ⑥    ⑦    ⑨
   ↗ ↳                      ↗
  0   1                      3
```

### 3. 核心操作

#### Find（查）：找元素的根节点

递归地沿着 `parent` 指针往上找，直到找到根节点。

```typescript
// 朴素版 Find
function find(x: number): number {
  if (parent[x] !== x) {
    return find(parent[x]); // 递归找根
  }
  return x;
}
```

#### Union（并）：合并两个集合

把一个集合的根节点的 parent 指向另一个集合的根节点。

```typescript
function union(x: number, y: number): void {
  const rootX = find(x);
  const rootY = find(y);
  if (rootX !== rootY) {
    parent[rootX] = rootY; // 把 X 的根接到 Y 的根下面
  }
}
```

### 4. 性能优化：路径压缩 + 按秩合并

上面的朴素实现有一个问题：如果树长得很深（类似链表），find 操作会退化到 O(n)。

#### 优化一：路径压缩（Path Compression）

在 find 的过程中，把路径上所有的节点都直接指向根节点：

```typescript
// 路径压缩版本
function find(x: number): number {
  if (parent[x] !== x) {
    parent[x] = find(parent[x]); // 递归返回时顺带压缩路径
  }
  return parent[x];
}
```

```
压缩前：  1 → 2 → 3 → 4 → 5（根）
压缩后：  1 → 5
         2 ↗
         3 ↗
         4 ↗
所有节点都直接指向根节点！
```

#### 优化二：按秩合并（Union by Rank）

合并时，把较短的树接到较长的树下，避免头重脚轻：

```typescript
// 用 rank 数组记录每棵树的"高度"（秩）
function union(x: number, y: number): void {
  const rootX = find(x);
  const rootY = find(y);
  if (rootX !== rootY) {
    // 把秩小的接到秩大的下面
    if (rank[rootX] < rank[rootY]) {
      parent[rootX] = rootY;
    } else if (rank[rootX] > rank[rootY]) {
      parent[rootY] = rootX;
    } else {
      // 秩相同，合并后秩 +1
      parent[rootY] = rootX;
      rank[rootX]++;
    }
  }
}
```

加上这两个优化后，并查集的均摊时间复杂度可以做到 **α(n)** —— Ackermann 函数的反函数，增长极慢，**实际可以认为是 O(1)**。

## 代码实现

### TypeScript

```typescript
/**
 * 并查集 —— TypeScript 实现
 * 
 * 支持操作：
 * - union(a, b): 合并 a 和 b 所在的集合
 * - find(x): 找到 x 所在的集合根节点
 * - connected(a, b): 判断 a 和 b 是否在同一个集合
 * - count(): 返回当前有多少个独立的集合
 */
class UnionFind {
  private parent: number[];   // 父节点数组
  private rank: number[];      // 树的秩（高度上界）
  private sets: number;        // 当前独立集合的数量

  constructor(n: number) {
    this.parent = new Array(n);
    this.rank = new Array(n);
    this.sets = n;

    // 初始化：每个元素都是独立的集合，父节点指向自己
    for (let i = 0; i < n; i++) {
      this.parent[i] = i;
      this.rank[i] = 0;
    }
  }

  /**
   * 查找根节点（带路径压缩）
   * 
   * 为什么用递归：路径压缩需要在回溯时修改路径上所有节点的父指针
   * 递归天然适合这种"自底向上"的处理
   */
  find(x: number): number {
    if (this.parent[x] !== x) {
      // 路径压缩：直接把父节点指向根节点
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  /**
   * 合并两个元素所在的集合（按秩合并）
   * 
   * 为什么要按秩合并：避免合并后树的高度增长过快
   * 秩小（矮树）接到秩大（高树）下面，合并后高度不变或+1
   */
  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return; // 已经在同一个集合，不需要合并
    }

    if (this.rank[rootX] < this.rank[rootY]) {
      // X 的树矮，接入 Y 的根
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      // Y 的树矮，接入 X 的根
      this.parent[rootY] = rootX;
    } else {
      // 高度相同，随便选一个作为根，并增加秩
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.sets--; // 合并后集合数 -1
  }

  /** 判断两个元素是否相连 */
  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  /** 返回当前独立集合的数量 */
  count(): number {
    return this.sets;
  }
}

// ============================================================
// LeetCode 547. 朋友圈（Number of Provinces）
// ============================================================
/**
 * 题目：给定一个 n x n 的矩阵 isConnected，表示城市之间的连接关系。
 *       isConnected[i][j] = 1 表示第 i 座城市和第 j 座城市直接相连。
 *       返回省份（朋友圈）的数量。
 * 
 * 思路：把相邻的城市合并到同一个集合，最后数有多少个独立集合
 */
function findCircleNum(isConnected: number[][]): number {
  const n = isConnected.length;
  const uf = new UnionFind(n);

  // 遍历矩阵的上三角，合并相邻的城市
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j] === 1) {
        uf.union(i, j);
      }
    }
  }

  return uf.count();
}

// ============================================================
// LeetCode 200. 岛屿数量
// ============================================================
/**
 * 题目：给定一个二维网格地图，'1' 是陆地，'0' 是水域。
 *       上下左右相邻的陆地算同一个岛屿。
 *       返回岛屿的数量。
 * 
 * 思路：把相邻的陆地合并到同一个集合，最后数有多少个独立岛屿
 */
function numIslands(grid: char[][]): number {
  if (!grid || grid.length === 0) return 0;

  const m = grid.length;
  const n = grid[0].length;
  
  // 给每个格子一个编号：id = i * n + j
  const uf = new UnionFind(m * n);
  
  // 方向数组：上下左右
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === '1') {
        const idx = i * n + j;
        
        // 检查右边和下边的邻居，合并相邻的陆地
        if (j + 1 < n && grid[i][j + 1] === '1') {
          uf.union(idx, idx + 1);
        }
        if (i + 1 < m && grid[i + 1][j] === '1') {
          uf.union(idx, idx + n);
        }
      }
    }
  }

  // 统计所有陆地格子有多少个独立的根
  let islands = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === '1') {
        const root = uf.find(i * n + j);
        // 只统计根节点（代表元），避免重复计数
        if (uf.find(i * n + j) === i * n + j) {
          islands++;
        }
      }
    }
  }

  return islands;
}

// ============================================================
// LeetCode 990. 等式方程的可满足性
// ============================================================
/**
 * 题目：给定一个字符串数组 equations，表示若干变量之间的关系。
 *       格式如 "a==b" 或 "a!=b"。
 *       判断所有方程能否同时成立。
 * 
 * 思路：分两遍处理
 *       1. 先把所有 "==" 的变量合并到同一个集合
 *       2. 再检查所有 "!=" 的变量对，它们必须在不同的集合中
 */
function equationsPossible(equations: string[]): boolean {
  const uf = new UnionFind(26); // 26 个小写字母

  // 第一遍：合并所有相等的变量
  for (const eq of equations) {
    if (eq.includes('==')) {
      const [a, , b] = eq;
      uf.union(a.charCodeAt(0) - 97, b.charCodeAt(0) - 97);
    }
  }

  // 第二遍：检查所有不相等的变量
  for (const eq of equations) {
    if (eq.includes('!=')) {
      const [a, , b] = eq;
      // 如果两个变量在同一个集合，却声明了不相等，矛盾！
      if (uf.connected(a.charCodeAt(0) - 97, b.charCodeAt(0) - 97)) {
        return false;
      }
    }
  }

  return true;
}

// 测试用例
console.log("\n=== 并查集基础测试 ===");
const uf = new UnionFind(5);
console.log("初始集合数:", uf.count()); // 5

uf.union(0, 1);
uf.union(2, 3);
console.log("合并 0-1, 2-3 后集合数:", uf.count()); // 3

console.log("0 和 1 是否连通:", uf.connected(0, 1)); // true
console.log("0 和 2 是否连通:", uf.connected(0, 2)); // false

uf.union(1, 2);
console.log("合并 1-2 后集合数:", uf.count()); // 2
console.log("0 和 2 是否连通:", uf.connected(0, 2)); // true

console.log("\n=== 朋友圈测试 ===");
const isConnected = [
  [1, 1, 0],
  [1, 1, 0],
  [0, 0, 1]
];
console.log("朋友圈数量:", findCircleNum(isConnected)); // 2

console.log("\n=== 岛屿数量测试 ===");
const grid = [
  ['1', '1', '0', '0', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '0'],
  ['0', '0', '0', '1', '1']
];
console.log("岛屿数量:", numIslands(grid)); // 3

console.log("\n=== 等式方程测试 ===");
const equations = ["a==b", "b!=c", "c==d", "b==d"];
console.log("方程是否可满足:", equationsPossible(equations)); // false
```

### Python

```python
from typing import List


class UnionFind:
    """并查集 —— Python 实现

    核心思想：用森林（多棵树）表示不相交的集合，
    每棵树的根节点是集合的"代表元"，通过 parent 数组维护父子关系。

    优化策略：
    1. 路径压缩（Path Compression）：find 时把路径上的节点都指向根
    2. 按秩合并（Union by Rank）：把矮树接到高树下，均摊 O(α(n))
    """

    def __init__(self, n: int):
        self.parent = list(range(n))  # 父节点数组
        self.rank = [0] * n           # 树的秩（高度上界）
        self.sets = n                 # 独立集合数量

    def find(self, x: int) -> int:
        """查找根节点（带路径压缩）

        路径压缩的原理：递归返回时，让路径上每个节点直接指向根
        这样下次查找会快很多
        """
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> None:
        """合并两个元素所在的集合（按秩合并）"""
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return  # 已经在同一个集合

        # 按秩合并：把秩小的接到秩大的下面
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1

        self.sets -= 1

    def connected(self, x: int, y: int) -> bool:
        """判断两个元素是否在同一个集合"""
        return self.find(x) == self.find(y)

    def count(self) -> int:
        """返回独立集合的数量"""
        return self.sets


# ============================================================
# LeetCode 547. 朋友圈
# ============================================================
def find_circle_num(is_connected: List[List[int]]) -> int:
    """朋友圈数量

    思路：把所有相邻的城市合并，最后数有多少个独立集合
    """
    n = len(is_connected)
    uf = UnionFind(n)

    for i in range(n):
        for j in range(i + 1, n):
            if is_connected[i][j] == 1:
                uf.union(i, j)

    return uf.count()


# ============================================================
# LeetCode 200. 岛屿数量
# ============================================================
def num_islands(grid: List[List[str]]) -> int:
    """岛屿数量

    思路：把相邻的陆地合并到同一个集合，最后数有多少个独立的岛屿
    """
    if not grid or not grid[0]:
        return 0

    m, n = len(grid), len(grid[0])
    uf = UnionFind(m * n)

    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                idx = i * n + j
                # 只检查右边和下边的邻居（避免重复）
                if j + 1 < n and grid[i][j + 1] == '1':
                    uf.union(idx, idx + 1)
                if i + 1 < m and grid[i + 1][j] == '1':
                    uf.union(idx, idx + n)

    # 统计有多少个独立的岛屿
    roots = set()
    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                roots.add(uf.find(i * n + j))
    return len(roots)


# ============================================================
# LeetCode 990. 等式方程的可满足性
# ============================================================
def equations_possible(equations: List[str]) -> bool:
    """等式方程可满足性

    思路：
    1. 先把所有 "==" 的变量合并到同一个集合
    2. 再检查所有 "!=" 的变量对是否真的在不同集合
    """
    uf = UnionFind(26)

    # 第一遍：合并所有相等的变量
    for eq in equations:
        if '==' in eq:
            a, b = eq.split('==')
            uf.union(ord(a) - ord('a'), ord(b) - ord('a'))

    # 第二遍：检查所有不相等的变量
    for eq in equations:
        if '!=' in eq:
            a, b = eq.split('!=')
            if uf.connected(ord(a) - ord('a'), ord(b) - ord('a')):
                return False

    return True


if __name__ == "__main__":
    print("=== 朋友圈测试 ===")
    is_connected = [
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 1]
    ]
    print(f"朋友圈数量: {find_circle_num(is_connected)}")  # 2

    print("\n=== 岛屿数量测试 ===")
    grid = [
        ['1', '1', '0', '0', '0'],
        ['1', '1', '0', '0', '0'],
        ['0', '0', '1', '0', '0'],
        ['0', '0', '0', '1', '1']
    ]
    print(f"岛屿数量: {num_islands(grid)}")  # 3

    print("\n=== 等式方程测试 ===")
    equations = ["a==b", "b!=c", "c==d", "b==d"]
    print(f"方程是否可满足: {equations_possible(equations)}")  # False
```

### Go

```go
package unionfind

import "fmt"

/**
 * 并查集 —— Go 实现
 *
 * 核心数据结构：
 * - parent: 父节点数组，parent[i] 表示 i 的父节点
 * - rank: 树的秩，用于按秩合并优化
 * - sets: 当前独立集合的数量
 */
type UnionFind struct {
	parent []int
	rank   []int
	sets   int
}

// New 创建一个大小为 n 的并查集
func New(n int) *UnionFind {
	uf := &UnionFind{
		parent: make([]int, n),
		rank:   make([]int, n),
		sets:   n,
	}
	// 初始化：每个元素的父节点指向自己
	for i := 0; i < n; i++ {
		uf.parent[i] = i
	}
	return uf
}

// find 查找根节点（带路径压缩）
func (uf *UnionFind) Find(x int) int {
	if uf.parent[x] != x {
		// 路径压缩：递归返回时把父节点指向根
		uf.parent[x] = uf.Find(uf.parent[x])
	}
	return uf.parent[x]
}

// union 合并两个元素所在的集合（按秩合并）
func (uf *UnionFind) Union(x, y int) {
	rootX := uf.Find(x)
	rootY := uf.Find(y)

	if rootX == rootY {
		return // 已经在同一个集合
	}

	// 按秩合并
	if uf.rank[rootX] < uf.rank[rootY] {
		uf.parent[rootX] = rootY
	} else if uf.rank[rootX] > uf.rank[rootY] {
		uf.parent[rootY] = rootX
	} else {
		uf.parent[rootY] = rootX
		uf.rank[rootX]++
	}

	uf.sets--
}

// Connected 判断两个元素是否相连
func (uf *UnionFind) Connected(x, y int) bool {
	return uf.Find(x) == uf.Find(y)
}

// Count 返回独立集合的数量
func (uf *UnionFind) Count() int {
	return uf.sets
}

// ============================================================
// LeetCode 547. 朋友圈
// ============================================================
// FindCircleNum 朋友圈数量
func FindCircleNum(isConnected [][]int) int {
	n := len(isConnected)
	uf := New(n)

	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			if isConnected[i][j] == 1 {
				uf.Union(i, j)
			}
		}
	}

	return uf.Count()
}

// ============================================================
// LeetCode 990. 等式方程可满足性
// ============================================================
// EquationsPossible 判断等式方程是否可满足
func EquationsPossible(equations []string) bool {
	uf := New(26)

	// 第一遍：合并所有相等的变量
	for _, eq := range equations {
		if len(eq) >= 4 && eq[1] == '=' && eq[2] == '=' {
			a := int(eq[0] - 'a')
			b := int(eq[3] - 'a')
			uf.Union(a, b)
		}
	}

	// 第二遍：检查所有不相等的变量
	for _, eq := range equations {
		if len(eq) >= 4 && eq[1] == '!' && eq[2] == '=' {
			a := int(eq[0] - 'a')
			b := int(eq[3] - 'a')
			if uf.Connected(a, b) {
				return false
			}
		}
	}

	return true
}

// ============================================================
// 简单测试
// ============================================================
func main() {
	// 朋友圈测试
	isConnected := [][]int{
		{1, 1, 0},
		{1, 1, 0},
		{0, 0, 1},
	}
	fmt.Printf("朋友圈数量: %d\n", FindCircleNum(isConnected)) // 2

	// 等式方程测试
	equations := []string{"a==b", "b!=c", "c==d", "b==d"}
	fmt.Printf("方程是否可满足: %v\n", EquationsPossible(equations)) // false
}
```

### Java

```java
import java.util.*;

/**
 * 并查集 —— Java 实现
 *
 * 关键点：
 * 1. parent 数组维护每棵树的父子关系
 * 2. rank 数组记录树的"高度"（上界），用于按秩合并
 * 3. 路径压缩 + 按秩合并 -> 均摊 O(α(n))，实际近似 O(1)
 */
public class UnionFind {
    private final int[] parent;  // 父节点数组
    private final int[] rank;    // 树的秩
    private int sets;           // 独立集合数量

    public UnionFind(int n) {
        this.parent = new int[n];
        this.rank = new int[n];
        this.sets = n;

        for (int i = 0; i < n; i++) {
            this.parent[i] = i;
            this.rank[i] = 0;
        }
    }

    /**
     * 查找根节点（带路径压缩）
     *
     * 递归实现：顺着 parent 指针一直往上找，直到找到根节点
     * 回溯时把路径上每个节点的父节点都指向根，实现路径压缩
     */
    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // 路径压缩
        }
        return parent[x];
    }

    /**
     * 合并两个集合（按秩合并）
     *
     * 秩小的树接到秩大的树下，避免树的高度增长过快
     */
    public void union(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);

        if (rootX == rootY) {
            return;
        }

        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }

        sets--;
    }

    /** 判断两个元素是否相连 */
    public boolean connected(int x, int y) {
        return find(x) == find(y);
    }

    /** 返回独立集合数量 */
    public int count() {
        return sets;
    }

    // ============================================================
    // LeetCode 547. 朋友圈
    // ============================================================
    public static int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        UnionFind uf = new UnionFind(n);

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (isConnected[i][j] == 1) {
                    uf.union(i, j);
                }
            }
        }

        return uf.count();
    }

    // ============================================================
    // LeetCode 200. 岛屿数量
    // ============================================================
    public static int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;

        int m = grid.length;
        int n = grid[0].length;
        UnionFind uf = new UnionFind(m * n);

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == '1') {
                    int idx = i * n + j;
                    // 只检查右边和下边
                    if (j + 1 < n && grid[i][j + 1] == '1') {
                        uf.union(idx, idx + 1);
                    }
                    if (i + 1 < m && grid[i + 1][j] == '1') {
                        uf.union(idx, idx + n);
                    }
                }
            }
        }

        Set<Integer> roots = new HashSet<>();
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == '1') {
                    roots.add(uf.find(i * n + j));
                }
            }
        }

        return roots.size();
    }

    // ============================================================
    // LeetCode 990. 等式方程可满足性
    // ============================================================
    public static boolean equationsPossible(String[] equations) {
        UnionFind uf = new UnionFind(26);

        // 第一遍：合并所有相等的变量
        for (String eq : equations) {
            if (eq.contains("==")) {
                char a = eq.charAt(0);
                char b = eq.charAt(3);
                uf.union(a - 'a', b - 'a');
            }
        }

        // 第二遍：检查所有不相等的变量
        for (String eq : equations) {
            if (eq.contains("!=")) {
                char a = eq.charAt(0);
                char b = eq.charAt(3);
                if (uf.connected(a - 'a', b - 'a')) {
                    return false;
                }
            }
        }

        return true;
    }

    public static void main(String[] args) {
        // 朋友圈测试
        int[][] isConnected = {
            {1, 1, 0},
            {1, 1, 0},
            {0, 0, 1}
        };
        System.out.printf("朋友圈数量: %d%n", findCircleNum(isConnected)); // 2

        // 岛屿数量测试
        char[][] grid = {
            {'1', '1', '0', '0', '0'},
            {'1', '1', '0', '0', '0'},
            {'0', '0', '1', '0', '0'},
            {'0', '0', '0', '1', '1'}
        };
        System.out.printf("岛屿数量: %d%n", numIslands(grid)); // 3

        // 等式方程测试
        String[] equations = {"a==b", "b!=c", "c==d", "b==d"};
        System.out.printf("方程是否可满足: %b%n", equationsPossible(equations)); // false
    }
}
```

## 业务场景

### 1. 社交网络中的朋友圈数量

当产品经理问："我们平台的 100 万用户，可以分成多少个'圈子'？"——这就是并查集的典型应用。把互相关注/互为好友的用户合并到同一个集合，最后数一下有多少个独立的集合就行了。

### 2. 图的连通分量检测

在分布式系统中，可以用并查集检测节点之间的连通性。比如 Kubernetes 集群中的服务发现：如果 Pod A 和 Pod B 需要互相通信，我们需要知道它们是否在同一个 NetworkPolicy 组内。

### 3. 迷宫/网格的连通性判断

游戏开发中，判断从起点到终点是否可达，或者统计有多少个独立的封闭区域——这些都可以用并查集秒解。把相邻的可达格子合并，最后看起点和终点是否相连即可。

### 4. Kruskal 最小生成树算法

最小生成树算法中，Kruskal 算法的核心就是：把所有边按权重排序，然后依次加入——如果这条边连接的两个顶点已经在同一个集合中（会形成环），就跳过；否则加入并合并集合。这就是一个不断 `union` 和 `connected` 的过程 🎯

```
Kruskal 伪代码：

sort all edges by weight
for each edge (u, v) in sorted edges:
    if not connected(u, v):  // 并查集查询
        add edge to MST
        union(u, v)            // 并查集合并
```

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 | 说明 |
| ---- | ---------- | ---------- | ---- |
| 初始化 | O(n) | O(n) | 需要初始化 n 个元素的 parent 和 rank |
| Find | O(α(n)) | - | α(n) 是 Ackermann 函数的反函数，实际 ≈ O(1) |
| Union | O(α(n)) | - | 需要两次 Find + 一次合并 |
| Connected | O(α(n)) | - | 两次 Find |

**为什么是 α(n) 而不是 O(1)？**

Ackermann 函数是一个增长极快的函数，它的反函数 α(n) 对于 n 的一切实际应用值都 ≤ 4。比如：
- α(10^6) = 3
- α(10^1000) = 4

所以业界通常说并查集的时间复杂度是 **近似 O(1)**，这是有数学依据的 💪

## 小结

并查集是解决"连接问题"的瑞士军刀 🔧

- ✅ 支持快速合并（union）和查询（connected）
- ✅ 路径压缩 + 按秩合并 → 均摊 O(α(n))，实际 O(1)
- ✅ 空间 O(n)，简单高效
- ✅ 应用广泛：朋友圈、岛屿数量、方程可满足性、Kruskal MST...

记住一个口诀：**"查根、合并、按秩优化、路径压缩"** —— 面试写出来，面试官都得点头 👍

> 补充：如果你不想手写并查集，Python 的 `scipy.sparse.csgraph.connected_components`、Java 的 Apache Commons Collections 都提供了现成实现。但面试/手撕代码的时候，还是要能默写的 😎
