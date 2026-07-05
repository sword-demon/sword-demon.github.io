---
title: 深度优先搜索（DFS）回溯实战
description: DFS 回溯实战：全排列与子集问题，TypeScript 实现
date: 2026-06-05 09:20:00
categories:
  - Algorithm
tags:
  - dfs
  - backtracking
  - recursion
  - interview
sidebarSort: 39
---

### 实战三：全排列（经典回溯）

这道题是 LeetCode 46，面试出场率极高。用回溯框架一行行对应着写：

```typescript
function permute(nums: number[]): number[][] {
  const result: number[][] = [];
  const path: number[] = [];
  const used = new Set<number>();

  function backtrack() {
    // 结束条件：路径长度等于数组长度
    if (path.length === nums.length) {
      result.push([...path]); // 注意要拷贝！
      return;
    }

    for (const num of nums) {
      if (used.has(num)) continue; // 跳过已使用的

      // 做选择
      path.push(num);
      used.add(num);

      backtrack(); // 递归

      // 撤销选择（回溯）
      path.pop();
      used.delete(num);
    }
  }

  backtrack();
  return result;
}

console.log(permute([1, 2, 3]));
// [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

对照回溯框架看：

- **选择列表**：所有数字
- **约束条件**：不能重复使用
- **结束条件**：路径长度够了
- **做选择 / 撤销选择**：`push/pop` 一对一对出现

### 实战四：岛屿数量（LeetCode 200）

这道题堪称 DFS 的"名片题"。给你一个 0/1 组成的二维矩阵，1 表示陆地，0 表示水，求有多少个岛屿。

```typescript
function numIslands(grid: string[][]): number {
  if (grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number) {
    // 边界检查 + 只处理陆地
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === "0") {
      return;
    }

    grid[r][c] = "0"; // 标记为已访问（沉岛思想）

    // 向四个方向扩展
    dfs(r - 1, c); // 上
    dfs(r + 1, c); // 下
    dfs(r, c - 1); // 左
    dfs(r, c + 1); // 右
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c); // 把整个岛"沉掉"
      }
    }
  }

  return count;
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

> 🔑 **沉岛思想**：访问过的陆地直接改成 '0'，省去了额外的 visited 数组。这是 DFS 在矩阵问题中的常用技巧。
