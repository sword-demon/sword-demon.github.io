---
title: 并查集（Union-Find）
description: 并查集（Union-Find / Disjoint Set）——从社交网络好友圈到最小生成树，搞定一切连通性问题
date: 2026-05-23 11:50:00
categories:
  - Algorithm
tags:
  - union-find
  - disjoint-set
  - graph
  - data-structure
sidebarSort: 15
---

# 并查集（Union-Find / Disjoint Set）

你刷微博的时候，有没有想过一个问题：系统是怎么知道你和某个陌生人的「关系链」的？比如它告诉你「你们有 3 个共同好友」。再比如，地图 App 怎么判断两个城市之间是否有路可走？这些问题本质上都在问同一件事——**两个元素是否在同一个"连通分量"里**。

这就是并查集（Union-Find）要解决的核心问题。它是一种专门处理**动态连通性**的数据结构，支持两个操作：

1. **Union**：把两个元素合并到同一个集合
2. **Find**：查找某个元素属于哪个集合（或者说，两个元素是否在同一个集合）

听起来很朴素对吧？但它的实现充满了工程智慧——路径压缩、按秩合并，这些优化让每次操作的时间复杂度接近 **O(1)**。不夸张地说，并查集是算法里"四两拨千斤"的典范 🏆。

## 原理拆解

### 1. 用"代表元"来标识集合

想象一个公司年会做团建游戏。主持人喊"分组！"，所有人开始自由组队。怎么标记谁和谁是一队的？

最直觉的方法：**每队选一个队长**。队长就是这队的"代表元"。想判断两个人是不是一队的？看他们的队长是不是同一个人就行了。

```
初始状态：每个人自成一队，自己就是队长

人:    [A] [B] [C] [D] [E] [F]
队长:   A   B   C   D   E   F

A 和 B 组队 → B 认 A 当队长：
人:    [A] [B] [C] [D] [E] [F]
队长:   A   A   C   D   E   F

C 和 D 组队 → D 认 C 当队长：
人:    [A] [B] [C] [D] [E] [F]
队长:   A   A   C   C   E   F

B 和 D 组队 → B 的队长 A 和 D 的队长 C 需要合并
假设 A 认 C 当队长：
人:    [A] [B] [C] [D] [E] [F]
队长:   C   A   C   C   E   F
（B→A→C，D→C，现在 A、B、C、D 都是一队的了）
```

这就是并查集的核心思想：用一棵**有根树**来表示一个集合，树的**根节点**就是集合的代表元。

### 2. Find 操作：顺藤摸瓜找队长

Find(x) 就是沿着父指针一直往上走，直到找到根节点：

```
      C ← 根节点（队长）
     / \
    A   D
    |
    B

Find(B)：B → A → C → 找到队长 C！
Find(D)：D → C → 找到队长 C！
Find(B) == Find(D) → true，B 和 D 是一队的 ✅
```

### 3. Union 操作：让两个队长合并

Union(x, y) 的逻辑很简单：先找到 x 和 y 各自的队长，然后让其中一个队长认另一个当队长。

```
Union(E, F)：
  Find(E) = E（E 自己是队长）
  Find(F) = F（F 自己是队长）
  让 F 认 E 当队长：

  E ← 新的根
  |
  F

现在 E 和 F 是一队的了
```

### 4. 问题来了：树太深怎么办？

如果每次 Union 都是"让 A 认 B 当队长"，然后"让 B 认 C 当队长"……最终可能形成一条**长链**：

```
最坏情况：
F → E → D → C → B → A

Find(F) 要走 5 步！
如果元素有 10 万个，Find 最多要走 10 万步，退化为 O(n) 😱
```

怎么优化？两大杀器：

#### 优化一：路径压缩（Path Compression）

Find 的时候，顺便把沿途的节点都**直接挂到根节点**上，让树变"矮"：

```
压缩前：           压缩后：
    A                 A
    |               / | \
    B              B  C  D
    |
    C
    |
    D

Find(D)：D → C → B → A
压缩后：D 直接指向 A，C 也直接指向 A
下次 Find(D) 只要 1 步！
```

路径压缩有两种实现方式：
- **递归式**（完全压缩）：Find 过程中把路径上所有节点都直接挂到根上
- **隔代压缩**（迭代式）：`parent[x] = parent[parent[x]]`，只往上跳一层

#### 优化二：按秩合并（Union by Rank）

Union 的时候，**让矮树的根挂到高树的根下面**。Rank 就是树的高度（或近似高度）。这样合并后树的高度不会增长太快。

```
A 树（rank=2）     C 树（rank=1）
    A                 C
   / \                |
  B   D               E
  |
  G

Union(B, E)：
  Find(B) = A，rank = 2
  Find(E) = C，rank = 1
  C 的 rank 更小，让 C 挂到 A 下面

      A
    / | \
   B  D  C
   |     |
   G     E

树的高度还是 2，没变！
```

#### 两个优化一起用会怎样？

路径压缩 + 按秩合并一起用，每次 Find/Union 的**均摊时间复杂度**是 **O(α(n))**，其中 α 是**反阿克曼函数**。这个函数增长极慢——慢到什么程度呢？n 等于宇宙中原子数量（约 10⁸⁰）时，α(n) 也不超过 **4**。

所以实际使用中，你可以把并查集的操作看作 **O(1)** 🎉。

### 5. 图解完整流程

```
初始：5 个元素，各自为战
parent: [0, 1, 2, 3, 4]

Union(0, 1)：
parent: [0, 0, 2, 3, 4]    ← 1 的父亲变成 0
   (0)
    |
   (1)

Union(2, 3)：
parent: [0, 0, 2, 2, 4]    ← 3 的父亲变成 2
   (0)    (2)
    |      |
   (1)    (3)

Union(1, 3)：
  Find(1) = 0, Find(3) = 2
  按秩合并：rank[0] == rank[2]，让 2 挂到 0 下
parent: [0, 0, 0, 2, 4]    ← 2 的父亲变成 0
      (0)
     / |
   (1) (2)
        |
       (3)

Union(4, 0)：（顺便路径压缩）
  Find(4) = 4, Find(0) = 0
  让 4 挂到 0 下
parent: [0, 0, 0, 2, 0]    ← 4 的父亲变成 0
      (0)
    / | \
  (1)(2)(4)
      |
     (3)

Find(3)：3 → 2 → 0，路径压缩后 parent[3] = 0
parent: [0, 0, 0, 0, 0]    ← 3 也直接指向 0 了
      (0)
    / | \ \
  (1)(2)(4)(3)   ← 全部在同一层，Find 都是 O(1)！
```

## 代码实现

### TypeScript

```typescript
/**
 * 并查集（Union-Find）—— TypeScript 实现
 * 带路径压缩 + 按秩合并，均摊时间复杂度 O(α(n))
 */
class UnionFind {
  private parent: number[]; // parent[i] 表示 i 的父节点
  private rank: number[];   // rank[i] 表示以 i 为根的树的高度（近似）
  private count: number;    // 当前连通分量的个数

  /**
   * @param n 元素个数，元素编号为 0 ~ n-1
   */
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i); // 初始时每个元素自己是自己的父节点
    this.rank = new Array(n).fill(0); // 初始高度都是 0
    this.count = n; // 初始有 n 个连通分量（每个元素各自为战）
  }

  /**
   * 查找 x 的根节点（代表元）
   * 路径压缩：查找过程中顺便把路径上的节点都挂到根上
   */
  find(x: number): number {
    if (this.parent[x] !== x) {
      // 递归式路径压缩：让 parent[x] 直接指向根
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  /**
   * 合并 x 和 y 所在的集合
   * 按秩合并：矮树挂到高树下面，避免树退化成链表
   */
  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return; // 已经在同一集合，不用合并

    // 按秩合并：rank 小的挂到 rank 大的下面
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      // rank 相等，随便挂，但被挂的那个 rank 要 +1
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--; // 合并后连通分量数 -1
  }

  /** 判断 x 和 y 是否在同一个集合 */
  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  /** 获取当前连通分量数 */
  getCount(): number {
    return this.count;
  }
}

// 使用示例
const uf = new UnionFind(6);

uf.union(0, 1);
uf.union(2, 3);
uf.union(1, 3); // 0,1,2,3 连通了
uf.union(4, 5); // 4,5 连通了

console.log(uf.connected(0, 3)); // true  ← 同一个集合
console.log(uf.connected(1, 4)); // false ← 不同集合
console.log(uf.getCount());      // 2 ← 两个连通分量：{0,1,2,3} 和 {4,5}

uf.union(3, 4); // 两个集合合并
console.log(uf.connected(1, 5)); // true  ← 现在全部连通了
console.log(uf.getCount());      // 1
```

### Python

```python
class UnionFind:
    """并查集（Union-Find）—— Python 实现

    带路径压缩 + 按秩合并，均摊时间复杂度 O(α(n))。
    α 是反阿克曼函数，实际中不超过 4，可以当作 O(1)。

    为什么用并查集而不是 BFS/DFS：
    并查集擅长处理「动态合并 + 快速查询连通性」的场景，
    不需要真的把整张图存下来，只需要维护 parent 数组。
    """

    def __init__(self, n: int):
        self.parent = list(range(n))  # 初始时每个人是自己的队长
        self.rank = [0] * n           # 树的高度（近似值）
        self.count = n                # 连通分量数

    def find(self, x: int) -> int:
        """查找根节点，同时做路径压缩"""
        if self.parent[x] != x:
            # 递归路径压缩：一路找到根，再把沿途节点都挂到根上
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int) -> None:
        """合并 x 和 y 所在的集合"""
        root_x = self.find(x)
        root_y = self.find(y)

        if root_x == root_y:
            return  # 已经是同一集合

        # 按秩合并：矮树挂高树
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1

        self.count -= 1

    def connected(self, x: int, y: int) -> bool:
        """判断 x 和 y 是否连通"""
        return self.find(x) == self.find(y)

    def get_count(self) -> int:
        """返回当前连通分量数"""
        return self.count


# 使用示例
if __name__ == "__main__":
    uf = UnionFind(6)
    uf.union(0, 1)
    uf.union(2, 3)
    uf.union(1, 3)
    uf.union(4, 5)

    print(uf.connected(0, 3))  # True
    print(uf.connected(1, 4))  # False
    print(uf.get_count())      # 2
```

## 进阶用法

### 1. 带权并查集（加权 Union-Find）

有时候我们不仅关心"是否连通"，还关心节点之间的**相对关系**。比如：

- A 比 B 大 3 岁
- B 比 C 大 2 岁
- 问：A 比 C 大几岁？

这就需要在并查集的边上维护一个**权重**：

```typescript
/**
 * 带权并查集 —— 每个节点到父节点有一个"距离" weight
 * find 时同步维护到根节点的总距离
 */
class WeightedUnionFind {
  private parent: number[];
  private weight: number[]; // weight[i] 表示 i 到 parent[i] 的距离
  private rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.weight = new Array(n).fill(0);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      const root = this.find(this.parent[x]);
      // 路径压缩时，累加权重
      // 为什么这么做：压缩前 weight[x] 是 x 到 parent[x] 的距离，
      // 压缩后要变成 x 到 root 的距离，所以要加上 parent[x] 到 root 的距离
      this.weight[x] += this.weight[this.parent[x]];
      this.parent[x] = root;
    }
    return this.parent[x];
  }

  /**
   * 建立 x 和 y 的关系：weight[y] - weight[x] = delta
   * 比如 union(0, 1, 3) 表示 1 比 0 大 3
   */
  union(x: number, y: number, delta: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return;

    // 按秩合并，同时计算新边的权重
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
      // 推导：weight[y] - weight[x] = delta
      // rootY 到 rootX 的距离 = weight[y] - weight[x] - delta
      this.weight[rootX] = this.weight[y] - this.weight[x] - delta;
    } else {
      this.parent[rootY] = rootX;
      this.weight[rootY] = this.weight[x] + delta - this.weight[y];
      if (this.rank[rootX] === this.rank[rootY]) {
        this.rank[rootX]++;
      }
    }
  }

  /**
   * 查询 x 和 y 的相对关系
   * 返回 weight[y] - weight[x]
   * 如果不在同一集合，返回 null
   */
  query(x: number, y: number): number | null {
    if (this.find(x) !== this.find(y)) return null;
    return this.weight[y] - this.weight[x];
  }
}

// 使用示例：食物链关系
const wuf = new WeightedUnionFind(3);
wuf.union(0, 1, 1); // 1 - 0 = 1（1 比 0 大 1）
wuf.union(1, 2, 1); // 2 - 1 = 1（2 比 1 大 1）
console.log(wuf.query(0, 2)); // 2（2 比 0 大 2，传递性）
```

### 2. 并查集 + 删除操作

标准并查集不支持删除单个元素（因为删除会破坏树结构）。一个常用的 hack 是**虚拟节点法**：

```
给每个元素分配一个"虚拟 ID"，用一个指针 map 映射真实元素到虚拟 ID。
删除元素时，只需要让它指向一个新的孤立虚拟 ID，不影响其他元素。
```

## 业务场景

### 1. 最小生成树（Kruskal 算法）

这是并查集最经典的配合场景。Kruskal 算法求最小生成树的过程：

1. 把所有边按权重从小到大排序
2. 依次取边，如果边的两个端点不在同一集合（不会形成环），就加入这条边并 Union
3. 直到选够 n-1 条边

```
图：
    A ---3--- B
    |       / |
    4     1   5
    |   /     |
    C ---2--- D

边排序：(B,C,1), (C,D,2), (A,B,3), (A,C,4), (B,D,5)

第1步：选 B-C（权重1），Union(B,C)   → 连通分量: {A}, {B,C}, {D}
第2步：选 C-D（权重2），Union(C,D)   → 连通分量: {A}, {B,C,D}
第3步：选 A-B（权重3），Union(A,B)   → 连通分量: {A,B,C,D}
选够 3 条边，最小生成树完成！

总权重 = 1 + 2 + 3 = 6
```

### 2. 社交网络的好友圈

LeetCode 547「省份数量」就是典型题目：n 个城市，给出哪些城市直接相连，问有多少个"省份"（连通分量）。

```typescript
function findCircleNum(isConnected: number[][]): number {
  const n = isConnected.length;
  const uf = new UnionFind(n);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j] === 1) {
        uf.union(i, j);
      }
    }
  }

  return uf.getCount();
}

// 示例
const grid = [
  [1, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
];
console.log(findCircleNum(grid)); // 2 ← 城市分组：{0,1} 和 {2}
```

### 3. 岛屿数量

LeetCode 200「岛屿数量」也可以用并查集解（虽然 DFS 更直觉）：

```typescript
function numIslands(grid: string[][]): number {
  if (grid.length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;

  // 多开一个位置给"水"节点，所有边界外的水都连到这个虚拟节点
  const uf = new UnionFind(rows * cols + 1);
  const waterRoot = rows * cols; // 虚拟水节点

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "0") {
        // 水节点连接到虚拟水节点
        uf.union(r * cols + c, waterRoot);
      } else {
        // 陆地：检查右边和下面的邻居
        if (c + 1 < cols && grid[r][c + 1] === "1") {
          uf.union(r * cols + c, r * cols + c + 1);
        }
        if (r + 1 < rows && grid[r + 1][c] === "1") {
          uf.union(r * cols + c, (r + 1) * cols + c);
        }
      }
    }
  }

  // 连通分量数 - 1（减去虚拟水节点那个分量）
  return uf.getCount() - 1;
}
```

### 4. 图片连通域标记

图像处理中，经常需要把相邻的同色像素归为一个连通域。用并查集扫描一遍图片，相邻像素 Union 起来，最后统计连通分量数即可。OpenCV 的 `connectedComponents` 函数底层就用了类似思路。

### 5. Git 的分支合并检测

Git 在判断两个分支是否已经合并时，本质上就是在查：这两个 commit 是否在同一个连通分量里。大型 Git 仓库的 commit 图可能有数百万节点，用并查集做连通性判断效率极高。

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
| ---- | ---------- | ---------- |
| Find | O(α(n)) ≈ O(1) | — |
| Union | O(α(n)) ≈ O(1) | — |
| 初始化 | O(n) | O(n) |

- **α(n)** 是反阿克曼函数，增长极慢。即使 n = 10⁸⁰（宇宙原子数），α(n) ≤ 4。所以工程上直接当 **O(1)** 看待。
- **空间 O(n)**：需要两个数组 `parent` 和 `rank`，每个长度为 n。
- 做 m 次 Union/Find 操作的总时间复杂度为 **O(m · α(n))**，几乎是线性时间。

## 常见面试题

| 题目 | 难度 | 核心考点 |
| ---- | ---- | -------- |
| [LeetCode 200 - 岛屿数量](https://leetcode.cn/problems/number-of-islands/) | 🟡 中等 | 基础连通分量 |
| [LeetCode 547 - 省份数量](https://leetcode.cn/problems/number-of-provinces/) | 🟡 中等 | 矩阵转并查集 |
| [LeetCode 684 - 冗余连接](https://leetcode.cn/problems/redundant-connection/) | 🟡 中等 | 检测环 |
| [LeetCode 721 - 账户合并](https://leetcode.cn/problems/accounts-merge/) | 🟡 中等 | 字符串映射 + Union |
| [LeetCode 990 - 等式方程的可满足性](https://leetcode.cn/problems/satisfiability-of-equality-equations/) | 🟡 中等 | 等式/不等式判断 |
| [LeetCode 1319 - 连通网络的操作次数](https://leetcode.cn/problems/number-of-operations-to-make-network-connected/) | 🟡 中等 | 连通分量 + 边数判断 |
| [LeetCode 1631 - 最小体力消耗路径](https://leetcode.cn/problems/path-with-minimum-effort/) | 🟡 中等 | 二分 + 并查集 / Kruskal 变体 |
| [LeetCode 1697 - 检查边长度限制的路径是否存在](https://leetcode.cn/problems/checking-existence-of-edge-length-limited-paths/) | 🔴 困难 | 离线查询 + 并查集 |

## 小结

并查集是一种"小而美"的数据结构，代码不到 50 行，却能解决一大类连通性问题：

- ✅ 代码极简，面试 5 分钟手撕
- ✅ 路径压缩 + 按秩合并后，均摊 O(1) 操作
- ✅ 天然适配动态合并场景，不需要预先知道完整图结构
- ✅ 和排序结合就是 Kruskal 最小生成树

使用口诀：**看到"连通"、"合并"、"分组"、"是否有环"这些关键词，第一时间想到并查集** 🎯

它和 DFS/BFS 的区别在于：DFS/BFS 需要把整张图存下来，适合静态查询；而并查集只需要一个 `parent` 数组，适合动态增量的连通性维护。选对工具，事半功倍 💪
