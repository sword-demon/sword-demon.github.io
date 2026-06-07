---
title: 深度优先搜索（DFS）
description: DFS 详解：从递归思维到回溯实战，TypeScript 全面实现
date: 2026-06-05 09:00:00
categories:
  - Algorithm
tags:
  - dfs
  - graph
  - tree
  - recursion
  - backtracking
  - interview
sidebarSort: 37
---

# 深度优先搜索（Depth-First Search）

上一篇我们聊了 BFS——像水波纹一样一层一层往外扩散。今天来聊聊它的"孪生兄弟"：**DFS（深度优先搜索）**。

想象你在走迷宫，BFS 的策略是"先把所有一步能到的地方都看一遍"，而 DFS 的策略完全不同——**一条路走到黑**，撞墙了就退回来，换一条路继续走。听起来有点"莽"对吧？但这种"莽"的策略，在很多场景下反而是最优解。

## 为什么需要 DFS？

DFS 和 BFS 解决的问题有时候很像，但各有擅长：

| 场景 | BFS | DFS |
|------|-----|-----|
| 无权图最短路径 | ✅ 天然保证 | ❌ 不保证 |
| 遍历所有路径/组合 | ❌ 空间爆炸 | ✅ 递归天然回溯 |
| 树的前/中/后序遍历 | ❌ 不自然 | ✅ 递归天然适配 |
| 判断图连通性 | ✅ 可以 | ✅ 可以 |
| 拓扑排序 | ✅ Kahn 算法 | ✅ DFS 实现更直观 |
| 迷宫求解（有无解） | ✅ 可以 | ✅ 更省内存 |

简单记：**求最短路用 BFS，遍历所有可能用 DFS**。

## 原理拆解

### 1. DFS 的核心：栈（Stack）

BFS 用队列（先进先出），DFS 用栈（先进后出）。递归调用本身就是一个隐式的函数调用栈。

```
DFS 遍历过程（以二叉树为例）：

        1
       / \
      2   3
     / \   \
    4   5   6

DFS 前序遍历：1 → 2 → 4 → 5 → 3 → 6

执行过程（调用栈变化）：
┌─ dfs(1)           # 访问 1
│  ├─ dfs(2)        # 访问 2
│  │  ├─ dfs(4)     # 访问 4，左空右空，返回
│  │  └─ dfs(5)     # 访问 5，左空右空，返回
│  └─ dfs(3)        # 访问 3
│     └─ dfs(6)     # 访问 6，左空右空，返回
└─ 栈空，结束
```

### 2. 递归版 vs 迭代版

DFS 有两种写法：

- **递归版**：代码简洁，直觉自然，但可能栈溢出
- **迭代版**：手动维护栈，控制更精细

```
递归版（伪代码）：
function dfs(node):
    if node is null: return
    visit(node)              ← 先处理当前节点（前序）
    for each neighbor of node:
        if neighbor not visited:
            dfs(neighbor)

迭代版（伪代码）：
function dfs(start):
    stack = [start]
    while stack is not empty:
        node = stack.pop()
        if node not visited:
            visit(node)
            for each neighbor of node:
                stack.push(neighbor)
```

注意：迭代版压栈顺序和递归版的遍历顺序可能不同，因为栈是后进先出。

### 3. 回溯：DFS 的灵魂

DFS 最强大的应用是**回溯算法**——在搜索过程中"走一步看一步"，发现走不通就"退一步换条路"。

```
经典回溯框架：

function backtrack(路径, 选择列表):
    if 满足结束条件:
        收集结果
        return
    
    for each 选择 in 选择列表:
        做选择           ← 把选择加入路径
        backtrack(路径, 选择列表)  ← 递归进入下一层
        撤销选择         ← 回溯，把选择从路径中移除
```

```
以 [1, 2, 3] 的全排列为例：

                    []
              /      |      \
            [1]     [2]     [3]
           /   \   /   \   /   \
        [1,2] [1,3] [2,1] [2,3] [3,1] [3,2]
         |     |     |     |     |     |
      [1,2,3][1,3,2][2,1,3][2,3,1][3,1,2][3,2,1]

每一层做选择 → 递归 → 回溯 → 换一个选择继续
```
