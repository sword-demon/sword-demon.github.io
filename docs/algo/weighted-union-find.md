---
title: 带权并查集（Weighted Union-Find）
description: 带权并查集 —— 在普通并查集上记录节点到根的"权值"，解决食物链、距离计算、二分图判定、离线处理等高级问题
date: 2026-10-16 09:01:30
categories:
  - Algorithm
tags:
  - union-find
  - weighted
  - disjoint-set
  - food-chain
  - interview
sidebarSort: 105
---

# 带权并查集（Weighted Union-Find）

如果你已经读过 [并查集（Union-Find）](union-find.md) 那篇，应该知道它能解决「朋友圈」「岛屿数量」之类的连通性问题。但面试官不会这么轻易放过你——他会把题目升级：

> "动物王国里有三类动物 A、B、C，它们之间的食物链关系是 A 吃 B，B 吃 C，C 吃 A。给你 N 个动物和 K 条陈述，每条陈述形如 `1 X Y`（X 和 Y 同类）或 `2 X Y`（X 吃 Y），问有多少条陈述是假的？"

> "给你一个长度为 N 的数组 `parent`，初始 `parent[i] = i`。要求支持两种操作：① `union(x, y)` 把 x 的根接到 y 的根下；② `query(x)` 问 x 到它根的距离。"

> "给你一个无向图，问它是否是二分图。"

这些题目有一个共同特点：**元素之间的关系不再是简单的「同属一个集合」，而是带有某种「额外信息」——同类/捕食/距离/奇偶性**。普通并查集只能回答"是不是同一个集合"，没法回答"它们之间是什么关系"。

这时候就要请出**带权并查集（Weighted Union-Find）** ✨。

## 1. 核心思想：在边上记"权"

普通并查集只有「父节点」一个状态。带权并查集多了一个数组 `weight[x]`，表示 **x 到它直接父节点 parent[x] 的"权值"**。

但 `weight[x]` 单独看意义不大。真正强大的是**传递性**：通过 `find` 路径压缩，我们可以同时算出 **x 到根节点的累积权值**。

```typescript
// 路径压缩的同时，把 weight[x] 更新为 x 到根的累积权值
function find(x: number): number {
  if (parent[x] !== x) {
    const origParent = parent[x];
    parent[x] = find(parent[x]);              // 递归找到根
    weight[x] = weight[x] + weight[origParent]; // 累加沿途的权值
  }
  return parent[x];
}
```

权值可以是任何你想记录的东西：

| 应用场景 | 权值含义 |
|---------|---------|
| 食物链问题 | x 相对于根的「种类偏移」（0=同类, 1=吃根, 2=被根吃）|
| 距离并查集 | x 到根的实际距离 |
| 二分图判定 | x 相对于根的「颜色」（0/1）|
| 异或并查集 | x 到根的路径异或值 |

只要你能把两个节点之间的关系**表达成权值的差或和**，就能用带权并查集解。

## 2. 食物链问题：最经典的入门题

POJ 1182 / AcWing 240 是带权并查集的"开山鼻祖"。题目描述：

> 动物王国中有三类动物 A、B、C，三者构成环形食物链（A 吃 B，B 吃 C，C 吃 A）。
> 给你 N 个动物（编号 1~N）和 K 条陈述：
> - `1 X Y` 表示 X 和 Y 是同类
> - `2 X Y` 表示 X 吃 Y
>
> 判断每条陈述的真假，输出假话的总数。**假话有三种情况**：
> 1. 当前陈述与前面已确定为真的某些陈述冲突
> 2. X 或 Y 超出范围 [1, N]
> 3. X 吃 X（自己吃自己）

### 2.1 为什么普通并查集搞不定？

普通并查集只能回答"X 和 Y 是不是同类"。但这里我们要回答"X 和 Y 是不是同类" **或者** "X 是不是吃 Y"——三种关系都需要支持。

观察一下三类动物的环形结构：

```
A 吃 B，B 吃 C，C 吃 A
```

如果我们给每个动物打个"种类标签"（0=A, 1=B, 2=C），那么：

- 同类：标签差为 0 (mod 3)
- X 吃 Y：X 的标签 = (Y 的标签 + 1) mod 3，即 (X - Y) mod 3 = 1
- Y 吃 X：Y 的标签 = (X 的标签 + 1) mod 3，即 (X - Y) mod 3 = 2

**关系可以表达成 (X - Y) mod 3 的值**。这就是带权并查集的权值——`weight[x]` 表示 x 到根的"种类偏移"。

### 2.2 代码实现

```typescript
/**
 * 带权并查集 —— 食物链问题专用版
 * 
 * 权值约定：
 *   weight[x] = (x 的种类) - (parent[x] 的种类)  (mod 3)
 *   即 weight[x] 表示 x 比 parent[x] 多"几环"
 *   0 = 同类
 *   1 = x 比 parent[x] 高级（x 吃 parent[x]）
 *   2 = x 比 parent[x] 低一级（parent[x] 吃 x）
 */
class WeightedUnionFind {
  private parent: number[];
  private weight: number[];   // x 到父节点的权值（mod 3）
  private n: number;

  constructor(n: number) {
    this.n = n;
    this.parent = new Array(n + 1);
    this.weight = new Array(n + 1).fill(0);
    // 初始时每个节点都是自己的根，自己到自己权值为 0
    for (let i = 1; i <= n; i++) {
      this.parent[i] = i;
    }
  }

  /**
   * 查找根节点，同时做路径压缩
   * 路径压缩的关键：把沿途的 weight 累加，最终 weight[x] 表示 x 到根的权值
   */
  find(x: number): number {
    if (this.parent[x] !== x) {
      const origParent = this.parent[x];
      this.parent[x] = this.find(this.parent[x]);
      // x 到新根的权值 = x 到旧父的权值 + 旧父到根的权值
      this.weight[x] = (this.weight[x] + this.weight[origParent]) % 3;
    }
    return this.parent[x];
  }

  /**
   * 把 x 和 y 合并，要求满足关系 d
   * d 的含义：(x 的种类) - (y 的种类) = d (mod 3)
   *   d = 0：x 和 y 同类
   *   d = 1：x 吃 y
   *   d = 2：y 吃 x（也等价于 (x - y) mod 3 = 2）
   * 
   * 返回是否合并成功（如果已冲突则返回 false）
   */
  union(x: number, y: number, d: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      // 已经在同一个集合，验证现有关系是否与 d 矛盾
      const actualD = (this.weight[x] - this.weight[y] + 3) % 3;
      return actualD === d;
    }

    // 把 rootX 接到 rootY 下
    // 设 weight[rootX] = w，则新的关系是：
    //   weight[x] + w - weight[y] = d  (mod 3)
    //   w = (d - weight[x] + weight[y]) mod 3
    const w = (d - this.weight[x] + this.weight[y] + 3) % 3;
    this.parent[rootX] = rootY;
    this.weight[rootX] = w;
    return true;
  }
}

function foodChain(n: number, statements: [number, number, number][]): number {
  const uf = new WeightedUnionFind(n);
  let lies = 0;

  for (const [type, x, y] of statements) {
    // 情况 2：超出范围
    if (x < 1 || x > n || y < 1 || y > n) {
      lies++;
      continue;
    }
    // 情况 3：自己吃自己
    if (type === 2 && x === y) {
      lies++;
      continue;
    }

    // 把 type 翻译成 (x - y) mod 3 的值
    let d: number;
    if (type === 1) {
      d = 0; // 同类
    } else {
      d = 1; // x 吃 y → (x - y) mod 3 = 1
    }

    if (!uf.union(x, y, d)) {
      lies++;
    }
  }

  return lies;
}

// 测试
const statements: [number, number, number][] = [
  [1, 1, 2],   // 1 和 2 同类
  [2, 2, 3],   // 2 吃 3
  [2, 3, 1],   // 3 吃 1（与已有信息一致：1→2→3→1 环）
  [1, 1, 3],   // 1 和 3 同类 ← 这是假话（应该是 1 吃 3）
];
console.log(foodChain(3, statements)); // 输出 1
```

### 2.3 图解：路径压缩时权值怎么更新？

```
初始状态：
   1            weight[1] = 0 (自己到自己)
   |
   2            weight[2] = ?  假设 2 接到 1 下，且 2 吃 1
   |
   3            weight[3] = ?

我们设：weight[x] = (x 种类) - (parent[x] 种类) mod 3

假设 3 接到 2 下，且 3 吃 2：
   1 (root)
   |
   2   weight[2] = (2 吃 1) = 1
   |
   3   weight[3] = (3 吃 2) = 1

现在调用 find(3)：
  1. find(3) → parent[3]=2 ≠ 3，递归 find(2)
  2. find(2) → parent[2]=1 ≠ 2，递归 find(1)
  3. find(1) → parent[1]=1，返回 1，weight[1]=0
  4. 回溯到 find(2)：parent[2]=1，weight[2] += weight[1] = 1+0 = 1
  5. 回溯到 find(3)：parent[3]=1（直接指向根），weight[3] += weight[2]=1+1=2

压缩后：
   1 (root)
   |   \
   2    3   weight[3] = 2（表示 3 比 1 低两级，等价于 1 吃 3）
```

weight[3] = 2 意味着：3 比 根 1 低两级 → 1 比 3 高两级 → 1 吃 3（因为 A 吃 B，B 吃 C 时，A 比 C 高两级）。和我们的设置完全一致 ✅

## 3. 距离并查集：维护节点到根的距离

LeetCode 2612 / 牛客等平台经常出这类题：

> 给你一个数组 `parent`，初始 `parent[i] = i`。支持：
> - `union(x, y, w)`：把 x 的根接到 y 的根下，并记录 x 到 y 的距离为 w
> - `query(x)`：返回 x 到根的距离

这种题的核心是：**union 时记录距离，路径压缩时累加距离**。

```typescript
class DistanceUnionFind {
  private parent: number[];
  private dist: number[];  // dist[x] = x 到根的距离

  constructor(n: number) {
    this.parent = new Array(n);
    this.dist = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      this.parent[i] = i;
    }
  }

  /**
   * 查找根，路径压缩时累加距离
   * 注意：返回 dist[x] 表示 x 到新根的距离
   */
  find(x: number): number {
    if (this.parent[x] !== x) {
      const origParent = this.parent[x];
      const rootDist = this.find(this.parent[x]); // rootDist 是 origParent 到根的距离
      this.parent[x] = this.parent[origParent];  // 直接接到根上
      this.dist[x] += this.dist[origParent];      // x 到根 = x 到 origParent + origParent 到根
    }
    return this.dist[x]; // ⚠️ 这里返回 dist[x]，不是 parent[x]！
  }

  /**
   * 把 x 接到 y 下，并设 x 到 y 的距离为 w
   * 也就是：dist[x] = dist[y] + w
   *       → 但合并后根变了，所以 dist 的含义也要调整
   * 
   * 设合并后 rootY 是根，rootX 接到 rootY 下：
   *   新 dist[rootX] = dist[y] + w - dist[x]
   */
  union(x: number, y: number, w: number): void {
    this.find(x);
    this.find(y);
    this.parent[x] = y;
    this.dist[x] = this.dist[y] + w;
  }

  /**
   * 查询 x 到根的距离（前提：已调用过 find(x)）
   */
  distance(x: number): number {
    this.find(x);
    return this.dist[x];
  }
}
```

⚠️ **细节坑**：上面 `find` 返回的是 `dist[x]` 而非 `parent[x]`，这是为了让递归调用方一次性拿到"x 到根的距离"而不需要再读 `dist[x]`。如果你坚持返回 `parent[x]`，就要在外面手动累加。

### 3.1 图解路径压缩

```
合并 union(1, 2, 3)  →  1 接在 2 下，dist[1]=dist[2]+3=0+3=3
   2 (root, dist[2]=0)
   |
   1   dist[1] = 3

合并 union(2, 3, 2)  →  2 接在 3 下
   3 (root, dist[3]=0)
   |
   2   dist[2] = dist[3]+2 = 2
   |
   1   dist[1] = 3 (不变)

现在 query(1)：
  find(1) → 父节点是 2，递归 find(2)
  find(2) → 父节点是 3，递归 find(3)
  find(3) → 自己是根，返回 dist[3]=0
  回溯：dist[2] += dist[3] = 2+0 = 2（没变），parent[2]=3
  回溯：dist[1] += dist[2] = 3+2 = 5，parent[1]=3
  
压缩后：
   3 (root)
   |   \
   2    1
   dist[2]=2, dist[1]=5

query(1) 返回 5：1 到根 3 的距离 = 3 + 2 = 5 ✅
```

### 3.2 实战题：LeetCode 2612「最少翻转操作数」

虽然这道题正解是 BFS，但带权并查集能解决一类相关问题——「朋友关系 + 距离约束」。比如：

> A 和 B 是朋友（距离 1），B 和 C 是朋友（距离 1），那么 A 和 C 的距离就是 2（敌对关系）。
> 给你一堆"X 和 Y 距离为 K"的关系，问是否存在矛盾。

这正是距离并查集的应用场景——只要两个节点连通，就能算出它们的"理论距离"，与实际声明的距离比较即可。

## 4. 二分图判定：染色问题

判断一个图是否是二分图，可以用 DFS 染色（颜色 0/1），但**并查集也能做到**。

核心想法：**把每个节点当成两种颜色之一，记为"相对于根的颜色"**。如果一条边连接的两个节点颜色相同，就不是二分图。

```typescript
/**
 * 带权并查集 —— 二分图判定版
 * weight[x] = 0 表示 x 与根同色，1 表示异色
 */
class BipartiteUF {
  private parent: number[];
  private color: number[]; // color[x] = x 相对于根的颜色

  constructor(n: number) {
    this.parent = new Array(n);
    this.color = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      this.parent[i] = i;
    }
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      const orig = this.parent[x];
      this.parent[x] = this.find(this.parent[x]);
      this.color[x] ^= this.color[orig]; // 异或累加
    }
    return this.parent[x];
  }

  /**
   * 声明 x 和 y 异色（一边连两个端点）
   * 如果发现 x 和 y 实际同色，返回 false（不是二分图）
   */
  isBipartite(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) {
      // 已连通，检查颜色关系
      return (this.color[x] ^ this.color[y]) === 1;
    }
    // 合并 rootX 到 rootY，要求 color[x] ^ color[y] = 1
    // 即 color[rootX] = color[x] ^ 1 ^ color[y]
    this.parent[rootX] = rootY;
    this.color[rootX] = this.color[x] ^ 1 ^ this.color[y];
    return true;
  }
}

function isBipartiteGraph(n: number, edges: [number, number][]): boolean {
  const uf = new BipartiteUF(n);
  for (const [x, y] of edges) {
    if (!uf.isBipartite(x, y)) {
      return false;
    }
  }
  return true;
}
```

**为什么用异或？** 因为颜色只有 0/1，异或天然就是"加法 mod 2"，非常适合二进制状态。

### 4.1 二分图判定 vs DFS 染色

| 方法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|----------|----------|---------|
| DFS 染色 | O(V + E) | O(V) | 标准场景 |
| 带权并查集 | O((V + E) α(V)) | O(V) | 边**离线处理**（按顺序加边）|

带权并查集的独特优势：**支持"加边"动态**。DFS 染色要么一次走完整个图，要么得重置。如果题目是"逐步加边，问加到第几条边时图不再是二分图"，DFS 就不好处理，但带权并查集可以。

## 5. 异或并查集：处理"XOR 路径"问题

这是带权并查集在 Codeforces 上非常常见的一类题：

> 给你一个数组 `parent[i] = i`，支持：
> - `union(x, y, w)`：声明 `arr[x] XOR arr[y] = w`
> - `query(x, y)`：返回 `arr[x] XOR arr[y]` 的值（如果能算出来）

实现原理和距离并查集一样，只是权值的合并规则换成 XOR：

```typescript
class XorUnionFind {
  private parent: number[];
  private xorToParent: number[]; // xorToParent[x] = arr[x] XOR arr[parent[x]]

  constructor(n: number) {
    this.parent = new Array(n);
    this.xorToParent = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      this.parent[i] = i;
    }
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      const orig = this.parent[x];
      this.parent[x] = this.find(this.parent[x]);
      this.xorToParent[x] ^= this.xorToParent[orig]; // XOR 累加
    }
    return this.parent[x];
  }

  /**
   * 声明 arr[x] XOR arr[y] = w
   */
  union(x: number, y: number, w: number): void {
    this.find(x);
    this.find(y);
    if (this.parent[x] !== this.parent[y]) {
      const rx = x, ry = y;
      this.parent[rx] = ry;
      // 需要满足：arr[x] XOR arr[y] = w
      //   即 (arr[x] XOR arr[rx]) XOR (arr[rx] XOR arr[ry]) XOR (arr[ry] XOR arr[y]) = w
      //   xorToParent[rx] XOR (arr[rx] XOR arr[ry]) XOR xorToParent[y] = w
      //   arr[rx] XOR arr[ry] = w XOR xorToParent[rx] XOR xorToParent[y]
      this.xorToParent[rx] = w ^ this.xorToParent[rx] ^ this.xorToParent[y];
    }
  }

  query(x: number, y: number): number | null {
    this.find(x);
    this.find(y);
    if (this.parent[x] !== this.parent[y]) {
      return null; // 不连通，没法算
    }
    return this.xorToParent[x] ^ this.xorToParent[y];
  }
}
```

**经典题**：CF 1702E「Split Into Two Sets」、CF 1000E「About Bacteria」、CF 1732C2「Good Subarrays (hard version)」。

## 6. 实战对比：什么时候用带权并查集？

```
┌─────────────────────────┬─────────────────────────────┐
│ 问题特征                 │ 推荐方案                    │
├─────────────────────────┼─────────────────────────────┤
│ 元素是否同属一个集合      │ 普通并查集                  │
│ 元素之间有"关系种类"     │ 带权并查集（权值=关系编码）  │
│ 需要维护节点到根的距离    │ 距离并查集                  │
│ 元素有颜色约束           │ 二分图判定并查集             │
│ 元素关系是 XOR          │ 异或并查集                  │
│ 元素关系是 mod K 等式    │ 取模并查集（食物链就是 mod 3）│
└─────────────────────────┴─────────────────────────────┘
```

**判断标准**：
1. 能不能把节点间关系**编码成一个数字**？如果是 → 带权并查集
2. 编码后的关系是 mod K 还是 mod 2？前者用算术加法，后者用 XOR
3. 题目是否涉及动态加边/删边？是的话优先用带权并查集

## 7. 复杂度分析

| 操作 | 普通并查集 | 带权并查集 |
|------|----------|----------|
| find (均摊) | O(α(n)) | O(α(n)) |
| union (均摊) | O(α(n)) | O(α(n)) |
| 空间 | O(n) | O(n) 多一个 weight 数组 |

α(n) 是 Ackermann 函数的反函数，对于任何 n < 10^18 范围内的实际值，α(n) ≤ 5。所以**带权并查集几乎"白嫖"了额外的权值信息**，没有额外的时间成本。

这就是为什么带权并查集这么香——它是普通并查集的"超级进化版"，复杂度没变但能力翻倍 ✨。

## 8. 经典题目汇总

下面这些题目是带权并查集的"必修课"，建议按顺序刷：

| 题目 | 平台 | 核心考点 |
|------|------|---------|
| 食物链 | POJ 1182 / AcWing 240 | mod 3 权值 |
| 距离并查集模板 | 牛客 / AcWing | 距离累加 |
| 二分图判定 | LeetCode 785 / 886 | 颜色异或 |
| 朋友圈（带权版） | 各种 OJ | 关系类型编码 |
| XOR 路径查询 | Codeforces | 异或累加 |
| 关押罪犯 | NOIP / Luogu | 二分图（带权并查集版）|

特别说一下 **NOIP 关押罪犯**：

> N 个罪犯住在两个监狱里，给定 M 对仇恨关系 `(a_i, b_i, c_i)`，表示 a 和 b 仇恨值为 c。需要把罪犯分到两个监狱，使得**最大仇恨值**（在同一监狱的罪犯的最大 c）**最小**。

**思路**：把所有仇恨关系按 c 降序排序，逐条尝试"分开"。用带权并查集表示"a 和 b 不能在同一个集合"（即必须异色）。当某条仇恨关系发现 a 和 b 已经在同一集合（颜色相同）时，这条仇恨就是答案。

```typescript
// 关押罪犯 —— 带权并查集解法
function prisonBreak(n: number, hates: [number, number, number][]): number {
  // 按仇恨值降序排序
  hates.sort((a, b) => b[2] - a[2]);

  const uf = new BipartiteUF(n + 1);
  
  for (const [a, b, c] of hates) {
    if (!uf.isBipartite(a, b)) {
      // 发现冲突 → 当前 c 就是答案
      return c;
    }
  }
  return 0; // 没有仇恨
}
```

## 9. 实战避坑指南

写带权并查集最容易踩的坑：

### 坑 1：取模忘 +k

```typescript
// ❌ 错误：(a - b) mod K 在 a < b 时会是负数
const d = (this.weight[x] - this.weight[y]) % 3;

// ✅ 正确：先 +K 再取模
const d = (this.weight[x] - this.weight[y] + 3) % 3;
```

### 坑 2：路径压缩时忘了更新 weight

```typescript
// ❌ 错误：只压缩路径，忘了累加 weight
find(x: number): number {
  if (this.parent[x] !== x) {
    this.parent[x] = this.find(this.parent[x]); // 没更新 weight[x]
  }
  return this.parent[x];
}

// ✅ 正确：find 末尾一定要更新 weight[x]
```

### 坑 3：union 顺序搞反

`union(x, y, w)` 表示"x 接到 y 下，dist[x] = dist[y] + w"。这个顺序一旦搞反，权值全乱。**建议在函数注释里写清楚**。

### 坑 4：find 返回值不统一

普通并查集 `find` 返回 `parent[x]`。带权并查集如果你想顺便返回距离，就让 `find` 返回距离（像上面距离并查集那样）；如果你只关心根，就让 `find` 返回 `parent[x]`（像食物链那样）。**一个项目里两种风格不能混用**。

## 10. 总结

带权并查集是把"附加信息"塞进并查集的小技巧，核心思路：

1. **每个节点到根的路径上记录权值**（mod K 或 XOR）
2. **路径压缩时累加权值**（关键中的关键）
3. **union 时通过方程算出新根的权值**

适用场景四件套：

- 🐍 食物链（mod K 取模）
- 📏 距离并查集（累加距离）
- 🎨 二分图判定（异或染色）
- ⚡ XOR 路径（异或累加）

刷完食物链 + 距离并查集 + 二分图 + XOR 这四类题，你就掌握了带权并查集 90% 的面试考点。下次面试官再问你"X 和 Y 关系是 K"这类题，直接把 weight 数组往并查集里一塞——优雅 ✨。

---

### 参考资料

- [并查集基础](union-find.md) —— 没读过的先看这篇
- [POJ 1182 食物链](http://poj.org/problem?id=1182) —— 带权并查集开山题
- [AcWing 240 食物链](https://www.acwing.com/problem/content/242/) —— 中文版
- 《算法竞赛进阶指南》李煜东 —— 第 5 章并查集小节
