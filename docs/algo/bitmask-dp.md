---
title: 状态压缩动态规划
description: 状态压缩动态规划（Bitmask DP）—— 用位运算处理集合状态的算法技巧
date: 2026-07-13 08:30:00
categories:
  - Algorithm
tags:
  - dynamic-programming
  - bitmask
  - state-compression
  - bitmask-dp
  - interview
sidebarSort: 63
---

# 状态压缩动态规划（Bitmask DP）

你有没有遇到过这种面试题：**"给一个 4x4 的棋盘，放 4 个皇后，要求她们互不攻击，有多少种摆法？"** 或者 **" salesman 要访问 n 个城市，每个城市之间有距离，找出最短路径"**。

这种问题的特点是：**每个元素的状态只有两种——选或不选、访问过或没访问过、在这个集合里或不在**。当 n ≤ 20 左右时，我们可以用一个整数的二进制位来表示这种"集合状态"，然后结合 DP 或 BFS 来求解。这就是 **状态压缩动态规划**，也叫 **Bitmask DP** ✨

## 问题引入

先来看一个经典问题——**最短哈密顿路径**：

> 给定 n 个点的有权无向图（n ≤ 20），求从 0 到 n-1 的最短路径，要求每个点**恰好访问一次**。

为什么不能用 Dijkstra？因为 Dijkstra 不保证每个点只访问一次。

暴力做法是枚举所有排列，时间复杂度 O(n!)——20! 简直是天文数字。

但如果我们用二进制来表示"已经访问过哪些点"：

```typescript
// 用二进制位表示已访问的节点集合
// 例如：mask = 0b00101 表示已访问节点 0 和节点 2

// state: 当前已访问的节点集合（用 bit 表示）
// last: 当前停在哪个节点
// dp[state][last] = 从 0 出发，经过 state 中的所有节点，最后停在 last 的最短路径

console.log("节点数量: 4");
console.log("状态 mask 的含义:");
for (let mask = 0; mask < 16; mask++) {
  const visited = [];
  for (let i = 0; i < 4; i++) {
    if (mask & (1 << i)) visited.push(i);
  }
  console.log(`  mask = ${mask.toString(2).padStart(4, '0')} (${mask}) → 已访问节点: [${visited.join(', ') || '无'}]`);
}
```

这就是状态压缩的核心思想：**用二进制位代替集合**，让状态变得可枚举、可转移。

## 原理拆解

### 1. 为什么可以用位运算表示集合？

因为每个元素只有两种状态，正好对应二进制的 0 和 1：

```typescript
// 假设有 5 个元素，用 5 个 bit 表示

// 初始状态：什么都没选
let mask = 0b00000; // 十进制: 0

// 选择元素 2（从右往左数，bit 2）
mask |= (1 << 2); // 0b00100

// 再选择元素 0
mask |= (1 << 0); // 0b00101

// 检查元素 3 是否被选中
const has3 = (mask & (1 << 3)) !== 0; // false

// 检查元素 0 是否被选中
const has0 = (mask & (1 << 0)) !== 0; // true

// 移除元素 2
mask &= ~(1 << 2); // 0b00001

console.log(`最终状态: ${mask.toString(2).padStart(5, '0')}`);
console.log(`选中的元素: ${[0, 1, 2, 3, 4].filter(i => mask & (1 << i))}`);
```

### 2. 常用位运算技巧

```typescript
// ========== 基础操作 ==========

// 添加元素 i 到集合
const add = (mask: number, i: number) => mask | (1 << i);

// 删除元素 i（从集合中移除）
const remove = (mask: number, i: number) => mask & ~(1 << i);

// 检查元素 i 是否在集合中
const contains = (mask: number, i: number) => (mask & (1 << i)) !== 0;

// 集合大小（popcount）
const count = (mask: number) => {
  let cnt = 0;
  while (mask) {
    mask &= mask - 1; // 消除最低位的 1
    cnt++;
  }
  return cnt;
};

// ========== 遍历子集 ==========

// 遍历 mask 的所有子集
function iterateSubsets(mask: number) {
  let sub = mask;
  while (true) {
    console.log(sub.toString(2).padStart(5, '0'));
    if (sub === 0) break;
    sub = (sub - 1) & mask; // 关键：生成下一个子集
  }
}

// ========== 枚举集合中的元素 ==========

// 遍历 mask 中所有被选中的元素
function forEachBit(mask: number, callback: (i: number) => void) {
  let i = 0;
  while (mask) {
    if (mask & 1) callback(i);
    mask >>= 1;
    i++;
  }
}

// ========== 常见技巧 ==========

// 求补集（在 n 个元素中）
const complement = (mask: number, n: number) => (~mask) & ((1 << n) - 1);

// 合并两个集合（并集）
const union = (a: number, b: number) => a | b;

// 取交集
const intersect = (a: number, b: number) => a & b;

// 取差集（a 中有但 b 中没有）
const difference = (a: number, b: number) => a & ~b;
```

### 3. 状态压缩 DP 的通用框架

```typescript
/**
 * 状态压缩 DP 的典型结构
 *
 * @param n - 元素个数（通常 ≤ 20）
 * @param init - 初始状态，通常是只有起点被访问
 * @param isEnd - 判断是否到达终止状态
 * @param transitions - 状态转移函数
 *
 * 核心思想：
 * 1. 状态：dp[mask][i] 表示在 mask 状态下，当前在位置 i 的最优值
 * 2. 转移：dp[nextMask][j] = min(dp[nextMask][j], dp[mask][i] + cost(i, j))
 * 3. 答案：从终止状态中取最优
 */

interface DPState {
  mask: number; // 已访问的节点集合
  last: number; // 当前停在哪个节点
  value: number; // 到达此状态的最优值
}

function bitmaskDP(
  n: number,
  init: number,
  isEnd: (mask: number) => boolean,
  getTransitions: (mask: number, last: number) => Array<{ nextMask: number; nextLast: number; cost: number }>
): number {
  // dp[mask][last] = 到达 (mask, last) 状态的最小代价
  const dp: number[][] = Array.from({ length: 1 << n }, () =>
    Array(n).fill(Infinity)
  );
  
  dp[init][init] = 0;
  
  // 枚举所有状态
  for (let mask = 0; mask < (1 << n); mask++) {
    for (let last = 0; last < n; last++) {
      if (dp[mask][last] === Infinity) continue;
      
      // 尝试转移到下一个状态
      for (const { nextMask, nextLast, cost } of getTransitions(mask, last)) {
        dp[nextMask][nextLast] = Math.min(
          dp[nextMask][nextLast],
          dp[mask][last] + cost
        );
      }
    }
  }
  
  // 从终止状态中找答案
  let answer = Infinity;
  for (let last = 0; last < n; last++) {
    if (isEnd(1 << n) - 1) { // 全都访问完的状态
      answer = Math.min(answer, dp[(1 << n) - 1][last]);
    }
  }
  
  return answer;
}
```

## 经典例题

### 例题 1：最短哈密顿路径

```typescript
/**
 * LeetCode 847. 访问所有节点的最短路径
 * 
 * 题目：给定一个 n 个节点的图（0 到 n-1），找到从 0 开始访问所有节点至少一次的最短路径长度
 * 
 * 思路：状态压缩 DP
 * - dp[mask][i] = 从 0 出发，经过 mask 中的所有节点，最后停在 i 的最短路径
 * - mask 的第 j 位为 1 表示节点 j 已被访问
 * 
 * 时间复杂度：O(n² × 2^n)，空间复杂度：O(n × 2^n)
 */

function shortestPathLength(graph: number[][]): number {
  const n = graph.length;
  const targetMask = (1 << n) - 1; // 所有位都是 1
  
  // dp[mask][i] = 最短路径长度
  // 用数组存储，初始化为 Infinity
  const dp: number[][] = Array.from({ length: 1 << n }, () =>
    Array(n).fill(Infinity)
  );
  
  // 初始状态：从每个节点出发，mask 只包含自己
  const queue: Array<{ mask: number; node: number }> = [];
  for (let i = 0; i < n; i++) {
    const mask = 1 << i;
    dp[mask][i] = 0;
    queue.push({ mask, node: i });
  }
  
  // BFS + DP
  // 为什么用 BFS？因为每条边权重相同，最先到达的状态一定是最短的
  while (queue.length > 0) {
    const { mask, node } = queue.shift()!;
    const dist = dp[mask][node];
    
    // 如果已经访问了所有节点，这就是一个答案
    if (mask === targetMask) {
      return dist;
    }
    
    // 尝试走到相邻的节点
    for (const next of graph[node]) {
      const nextMask = mask | (1 << next);
      
      // 如果这个状态更优，就更新
      if (dp[nextMask][next] > dist + 1) {
        dp[nextMask][next] = dist + 1;
        queue.push({ mask: nextMask, node: next });
      }
    }
  }
  
  return -1; // 不可能到达这里
}

// 测试
const graph = [[1, 2, 3], [0], [0], [0]];
console.log(shortestPathLength(graph)); // 4
```

### 例题 2：旅行商问题（TSP）

```typescript
/**
 * 旅行商问题的简化版：求访问所有城市的最短路径
 * 
 * 给定 n 个城市，以及任意两城市间的距离 dist[i][j]（对称）
 * 求从城市 0 出发，访问所有城市恰好一次，回到城市 0 的最短路径
 */

function travelingSalesman(dist: number[][]): number {
  const n = dist.length;
  const fullMask = (1 << n) - 1;
  
  // dp[mask][i] = 从 0 出发，访问了 mask 中的所有城市，最后停在 i 的最短路径
  // 注意：mask 不包含 0（因为 0 总是起点）
  const dp: number[][] = Array.from({ length: 1 << n }, () =>
    Array(n).fill(Infinity)
  );
  
  // 初始状态：只访问了城市 0，停在城市 0
  dp[1][0] = 0; // mask = 1 表示只有 bit 0 被访问
  
  // 枚举所有状态
  for (let mask = 1; mask <= fullMask; mask++) {
    // 尝试扩展到下一个城市
    for (let last = 0; last < n; last++) {
      if (dp[mask][last] === Infinity) continue;
      
      // 尝试添加一个新城市 next
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue; // next 已经在 mask 中了
        
        const nextMask = mask | (1 << next);
        dp[nextMask][next] = Math.min(
          dp[nextMask][next],
          dp[mask][last] + dist[last][next]
        );
      }
    }
  }
  
  // 最后一步：回到城市 0
  const full = (1 << n) - 1;
  let answer = Infinity;
  for (let last = 1; last < n; last++) {
    if (dp[full][last] !== Infinity) {
      answer = Math.min(answer, dp[full][last] + dist[last][0]);
    }
  }
  
  return answer;
}

// 示例：4 个城市的距离矩阵
const dist = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0]
];

console.log("最短旅行路径长度:", travelingSalesman(dist)); // 80
// 路径: 0 -> 1 -> 3 -> 2 -> 0，距离: 10 + 25 + 30 + 15 = 80
```

### 例题 3：玉米田种植问题

```typescript
/**
 * LeetCode 1301. 最大得分的路径数量
 * 
 * 题目：给定一个 m×n 的网格，每个格子可以放玉米（得 1 分）或不放。相邻格子不能同时放玉米。
 * 网格中某些格子是贫瘠的，不能放玉米。求最大得分和达到最大得分的方式数。
 * 
 * 这是一个经典的"棋盘放棋子"问题，用状态压缩处理每一行
 */

function waysToPlaceCorn(rows: number, cols: number, fertile: number[][]): number {
  const MOD = 1e9 + 7;
  
  // 判断一个状态是否合法（没有相邻的 1）
  const isValid = (state: number): boolean => {
    return (state & (state << 1)) === 0;
  };
  
  // 判断状态与贫瘠格子是否冲突
  const isCompatible = (state: number, row: number[]): boolean => {
    for (let col = 0; col < cols; col++) {
      if (row[col] === 0 && (state & (1 << col))) {
        return false; // 贫瘠格子不能放玉米
      }
    }
    return true;
  };
  
  // 预处理：生成所有合法的状态
  const validStates: number[] = [];
  for (let state = 0; state < (1 << cols); state++) {
    if (isValid(state) && isCompatible(state, fertile[0])) {
      validStates.push(state);
    }
  }
  
  // dp[row][state] = 到达第 row 行、状态为 state 的最大得分
  // cnt[row][state] = 达到该最大得分的方式数
  const dp: number[][] = Array.from({ length: rows }, () =>
    Array(1 << cols).fill(-1)
  );
  const cnt: number[][] = Array.from({ length: rows }, () =>
    Array(1 << cols).fill(0)
  );
  
  // 第一行初始化
  for (const state of validStates) {
    const score = countBits(state);
    dp[0][state] = score;
    cnt[0][state] = 1;
  }
  
  // 逐行 DP
  for (let row = 1; row < rows; row++) {
    // 当前行所有合法状态
    const rowStates: number[] = [];
    for (let state = 0; state < (1 << cols); state++) {
      if (isValid(state) && isCompatible(state, fertile[row])) {
        rowStates.push(state);
      }
    }
    
    for (const curState of rowStates) {
      const curScore = countBits(curState);
      
      // 枚举上一行的状态
      for (const prevState of validStates) {
        if (dp[row - 1][prevState] === -1) continue;
        
        // 检查两行状态是否兼容（同一列不能同时放玉米）
        if (curState & prevState) continue;
        
        const totalScore = dp[row - 1][prevState] + curScore;
        
        if (totalScore > dp[row][curState]) {
          dp[row][curState] = totalScore;
          cnt[row][curState] = cnt[row - 1][prevState];
        } else if (totalScore === dp[row][curState]) {
          cnt[row][curState] = (cnt[row][curState] + cnt[row - 1][prevState]) % MOD;
        }
      }
    }
  }
  
  // 汇总最后一行
  let maxScore = 0;
  let totalWays = 0;
  for (const state of validStates) {
    if (dp[rows - 1][state] > maxScore) {
      maxScore = dp[rows - 1][state];
      totalWays = cnt[rows - 1][state];
    } else if (dp[rows - 1][state] === maxScore) {
      totalWays = (totalWays + cnt[rows - 1][state]) % MOD;
    }
  }
  
  return totalWays;
}

function countBits(n: number): number {
  let cnt = 0;
  while (n) {
    n &= n - 1;
    cnt++;
  }
  return cnt;
}
```

### 例题 4：蒙德里安的梦想

```typescript
/**
 * 蒙德里安的梦想 - 铺砖问题
 * 
 * 题目：把 N×M 的棋盘用 1×2 的多米诺骨牌铺满，求方案数
 * 
 * 思路：逐列处理，用状态压缩表示当前列的填充状态
 * - state[i] = 1 表示第 i 行当前位置已经被上面的骨牌占用
 * - 转移时，要确保当前列和下一列的状态组合能放下骨牌
 */

function countDominoTilings(N: number, M: number): number {
  // 为了方便，通常 N ≤ M
  if (N > M) [N, M] = [M, N];
  
  const fullMask = (1 << N) - 1;
  
  // 预处理：哪些状态可以在一列内填满（不考虑纵向骨牌）
  const canFillColumn = (state: number): boolean => {
    // 连续 0 的个数必须是偶数（才能用横着的骨牌填满）
    let cnt = 0;
    for (let i = 0; i < N; i++) {
      if (state & (1 << i)) {
        if (cnt % 2 === 1) return false; // 有奇数个连续空位，填不满
        cnt = 0;
      } else {
        cnt++;
      }
    }
    return cnt % 2 === 0;
  };
  
  // 预处理：哪些状态对 (cur, next) 可以转移
  // 条件：cur | next = fullMask（整列填满）且两者内部都没有奇数段
  const validTransitions: number[][] = [];
  for (let cur = 0; cur <= fullMask; cur++) {
    if (!canFillColumn(cur)) continue;
    for (let next = 0; next <= fullMask; next++) {
      if (!canFillColumn(next)) continue;
      if ((cur | next) === fullMask) {
        validTransitions.push([cur, next]);
      }
    }
  }
  
  // dp[col][state] = 到第 col 列、状态为 state 的方案数
  const dp: number[][] = Array.from({ length: M + 1 }, () =>
    Array(1 << N).fill(0)
  );
  dp[0][0] = 1; // 第 0 列之前，状态为 0（空）
  
  for (let col = 0; col < M; col++) {
    for (const [curState, nextState] of validTransitions) {
      dp[col + 1][nextState] += dp[col][curState];
    }
  }
  
  return dp[M][0]; // 最后一列状态为 0（完全填满）
}

// 示例
console.log("2×2 棋盘铺法:", countDominoTilings(2, 2)); // 2
console.log("2×3 棋盘铺法:", countDominoTilings(2, 3)); // 3
console.log("3×3 棋盘铺法:", countDominoTilings(3, 3)); // 0
```

## 代码实现

### TypeScript

```typescript
/**
 * 状态压缩 DP 的通用工具类
 */
class BitmaskDP {
  /**
   * 计算一个整数的 popcount（1 的个数）
   */
  static popcount(x: number): number {
    let cnt = 0;
    while (x) {
      x &= x - 1;
      cnt++;
    }
    return cnt;
  }

  /**
   * 遍历整数的所有子集
   */
  static *subsets(mask: number): Generator<number> {
    let sub = mask;
    while (true) {
      yield sub;
      if (sub === 0) break;
      sub = (sub - 1) & mask;
    }
  }

  /**
   * 遍历 mask 的所有非空真子集（高效版）
   */
  static *properSubsets(mask: number): Generator<number> {
    // 从 mask-1 开始，然后不断 (sub-1) & mask
    for (let sub = (mask - 1) & mask; sub; sub = (sub - 1) & mask) {
      yield sub;
    }
  }

  /**
   * 检查 mask 是否有相邻的 1
   * 返回 true 表示有相邻的 1（不合法）
   */
  static hasAdjacentOnes(mask: number): boolean {
    return (mask & (mask << 1)) !== 0;
  }

  /**
   * 检查 mask 的所有 1 是否连续（中间没有 0）
   */
  static isContiguous(mask: number): boolean {
    // 如果 mask 是连续的，那么 mask | (mask << 1) + 1 会变成全 1
    // 更简单：提取出所有 1 的位置，检查最大间隔
    const ones: number[] = [];
    for (let i = 0; mask; i++) {
      if (mask & 1) ones.push(i);
      mask >>= 1;
    }
    if (ones.length <= 1) return true;
    for (let i = 1; i < ones.length; i++) {
      if (ones[i] !== ones[i - 1] + 1) return false;
    }
    return true;
  }
}

/**
 * 旅行商问题的完整实现
 */
function tsp(dist: number[][]): number {
  const n = dist.length;
  const dp: number[][] = Array.from({ length: 1 << n }, () =>
    Array(n).fill(Infinity)
  );
  
  dp[1][0] = 0; // 从城市 0 出发，只有城市 0 被访问
  
  for (let mask = 1; mask < (1 << n); mask++) {
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i)) || dp[mask][i] === Infinity) continue;
      
      // 尝试去下一个城市 j
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue; // j 已经被访问过
        
        const nextMask = mask | (1 << j);
        dp[nextMask][j] = Math.min(
          dp[nextMask][j],
          dp[mask][i] + dist[i][j]
        );
      }
    }
  }
  
  const fullMask = (1 << n) - 1;
  return Math.min(...dp[fullMask]);
}
```

### Python

```python
from typing import List


def popcount(x: int) -> int:
    """计算 x 的二进制表示中 1 的个数"""
    cnt = 0
    while x:
        x &= x - 1
        cnt += 1
    return cnt


def subsets(mask: int) -> List[int]:
    """生成 mask 的所有子集"""
    sub = mask
    result = []
    while True:
        result.append(sub)
        if sub == 0:
            break
        sub = (sub - 1) & mask
    return result


def tsp(dist: List[List[int]]) -> int:
    """
    旅行商问题（TSP）
    
    dp[mask][i] = 从城市 0 出发，访问 mask 中的所有城市，最后停在 i 的最短路径
    """
    n = len(dist)
    INF = float('inf')
    
    # dp[mask][i]
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0  # mask=1 表示只有城市 0 被访问
    
    for mask in range(1 << n):
        for i in range(n):
            if not (mask & (1 << i)) or dp[mask][i] == INF:
                continue
            
            # 尝试去下一个城市 j
            for j in range(n):
                if mask & (1 << j):
                    continue  # j 已经被访问
                
                next_mask = mask | (1 << j)
                dp[next_mask][j] = min(
                    dp[next_mask][j],
                    dp[mask][i] + dist[i][j]
                )
    
    full_mask = (1 << n) - 1
    return min(dp[full_mask])


def count_domino_tilings(N: int, M: int) -> int:
    """
    蒙德里安的梦想 - 铺砖问题
    
    N × M 的棋盘用 1×2 的骨牌铺满的方案数
    """
    if N > M:
        N, M = M, N  # 保证 N <= M
    
    full_mask = (1 << N) - 1
    
    # 哪些状态可以填满一列
    def can_fill(state: int) -> bool:
        cnt = 0
        for i in range(N):
            if state & (1 << i):
                if cnt % 2 == 1:
                    return False
                cnt = 0
            else:
                cnt += 1
        return cnt % 2 == 0
    
    # 预处理所有合法状态
    valid_states = [s for s in range(1 << N) if can_fill(s)]
    
    # 预处理转移
    transitions = [
        (cur, next_)
        for cur in valid_states
        for next_ in valid_states
        if (cur | next_) == full_mask
    ]
    
    # dp[col][state]
    dp = [[0] * (1 << N) for _ in range(M + 1)]
    dp[0][0] = 1
    
    for col in range(M):
        for cur, nxt in transitions:
            dp[col + 1][nxt] += dp[col][cur]
    
    return dp[M][0]


if __name__ == "__main__":
    # TSP 测试
    dist = [
        [0, 10, 15, 20],
        [10, 0, 35, 25],
        [15, 35, 0, 30],
        [20, 25, 30, 0]
    ]
    print(f"TSP 最短路径: {tsp(dist)}")  # 80
    
    # 铺砖测试
    print(f"2×2 铺法: {count_domino_tilings(2, 2)}")  # 2
    print(f"2×3 铺法: {count_domino_tilings(2, 3)}")  # 3
```

## 复杂度分析

| 维度 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 时间复杂度 | O(n² × 2ⁿ) | n 个状态，每个状态枚举 n 个转移 |
| 空间复杂度 | O(n × 2ⁿ) | dp 数组的大小 |

为什么是 O(n² × 2ⁿ)？

- 状态数：2ⁿ（每个元素有选/不选两种状态）
- 每个状态的转移：最多 O(n)（尝试加入一个新元素）
- 总计：O(n × 2ⁿ)，再乘以处理每个转移的 O(n)，就是 O(n² × 2ⁿ)

这个复杂度告诉我们：**状态压缩 DP 只能处理 n ≤ 20 左右的问题**。当 n > 20 时，状态数会爆炸式增长。

## 业务场景

### 1. 路径规划

在物流、地图、机器人路径规划中，当需要访问的地点不超过 20 个时，可以用状态压缩 DP 求精确最优解；超过这个数量则需要用近似算法（如贪心、遗传算法）。

### 2. 游戏 AI

很多棋类游戏可以用状态压缩表示当前局面，然后搜索最优策略。比如 2048 游戏的 AI，就是在状态空间中进行搜索。

### 3. 组合优化

装箱问题、背包问题、任务调度等 NP-hard 问题，当规模较小时可以用状态压缩 DP 求精确解，作为对比基准。

## 小结

状态压缩 DP 的核心就三步：

1. **用二进制表示集合**：每个 bit 代表一个元素是否在集合中
2. **枚举状态转移**：从当前状态尝试加入或移除元素
3. **DP 求最优**：dp[mask] = min/max(dp[prev] + cost)

记住这些常见模式：

```
棋盘放棋子 → 检查同行/同列不冲突
旅行商问题 → 从起点出发，加入新城市
铺砖问题   → 检查列的填充状态能转移
```

🎯 **技巧总结**：

- 看到"每个元素有两种状态" → 考虑状态压缩
- 看到 n ≤ 20 + 组合优化 → 基本就是状态压缩 DP
- 位运算要熟练：`|, &, ^, <<, >>, ~, popcount`

状态压缩 DP 是面试中的高频考点，理解了它，很多看似复杂的题目都会变得清晰起来！
