---
title: 回溯算法
description: Backtracking 详解：排列、组合、子集、N 皇后，四语言实现
date: 2026-05-17 19:40:00
categories:
  - Algorithm
tags:
  - backtracking
  - recursion
  - combinatorics
  - interview
sidebarSort: 18
---

# 回溯算法（Backtracking）

回溯算法本质上是一种**系统化的穷举**——通过递归尝试所有可能的选择，当发现某条路走不通时，退回来（回溯）换一条路继续走。

## 原理拆解

```
回溯模板：
  def backtrack(路径, 选择列表):
    if 满足结束条件:
      收集结果
      return
    for 选择 in 选择列表:
      做选择（加入路径）
      backtrack(路径, 新的选择列表)
      撤销选择（回溯）
```

核心三问：

1. **路径**：已经做的选择
2. **选择列表**：当前可以做的选择
3. **结束条件**：何时收集结果

## 代码实现

### 全排列

> LeetCode 46. Permutations

#### TypeScript

```typescript
function permute(nums: number[]): number[][] {
  const result: number[][] = [];
  const used = new Array(nums.length).fill(false);

  function backtrack(path: number[]) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      backtrack(path);
      path.pop(); // 撤销选择
      used[i] = false; // 撤销标记
    }
  }

  backtrack([]);
  return result;
}
```

#### Go

```go
package backtracking

func Permute(nums []int) [][]int {
	var result [][]int
	used := make([]bool, len(nums))

	var backtrack func(path []int)
	backtrack = func(path []int) {
		if len(path) == len(nums) {
			temp := make([]int, len(path))
			copy(temp, path)
			result = append(result, temp)
			return
		}
		for i := 0; i < len(nums); i++ {
			if used[i] { continue }
			used[i] = true
			backtrack(append(path, nums[i]))
			used[i] = false
		}
	}
	backtrack(nil)
	return result
}
```

#### Java

```java
import java.util.*;

public class Permutations {
    public static List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(nums, new ArrayList<>(), used, result);
        return result;
    }

    private static void backtrack(int[] nums, List<Integer> path,
                                  boolean[] used, List<List<Integer>> result) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, path, used, result);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}
```

#### Python

```python
"""全排列 —— Python 实现"""

def permute(nums: list[int]) -> list[list[int]]:
    result = []
    used = [False] * len(nums)

    def backtrack(path):
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i, num in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            path.append(num)
            backtrack(path)
            path.pop()
            used[i] = False

    backtrack([])
    return result
```

### 组合总和

> LeetCode 39. Combination Sum

```typescript
function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, path: number[], remaining: number) {
    if (remaining === 0) {
      result.push([...path]);
      return;
    }
    if (remaining < 0) return;

    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(i, path, remaining - candidates[i]); // i 不 +1 表示可重复选
      path.pop();
    }
  }

  backtrack(0, [], target);
  return result;
}
```

### N 皇后

> LeetCode 51. N-Queens

```typescript
function solveNQueens(n: number): string[][] {
  const result: string[][] = [];
  const board: number[] = []; // board[row] = col

  function isValid(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      if (board[r] === col || Math.abs(board[r] - col) === row - r)
        return false;
    }
    return true;
  }

  function backtrack(row: number) {
    if (row === n) {
      result.push(
        board.map((col) => ".".repeat(col) + "Q" + ".".repeat(n - 1 - col)),
      );
      return;
    }
    for (let col = 0; col < n; col++) {
      if (!isValid(row, col)) continue;
      board.push(col);
      backtrack(row + 1);
      board.pop();
    }
  }

  backtrack(0);
  return result;
}
```

## 面试题精选

| 题号 | 题目        | 回溯类型         | 难度 |
| ---- | ----------- | ---------------- | ---- |
| 46   | 全排列      | 排列             | 中等 |
| 47   | 全排列 II   | 去重排列         | 中等 |
| 78   | 子集        | 子集             | 中等 |
| 39   | 组合总和    | 组合（可重复选） | 中等 |
| 40   | 组合总和 II | 组合（去重）     | 中等 |
| 51   | N 皇后      | 棋盘类           | 困难 |
| 37   | 解数独      | 棋盘类           | 困难 |
| 79   | 单词搜索    | 网格 DFS         | 中等 |
| 131  | 分割回文串  | 切割类           | 中等 |

## 复杂度分析

| 问题   | 时间复杂度 | 说明                     |
| ------ | ---------- | ------------------------ |
| 全排列 | O(n × n!)  | n! 个排列，每个复制 O(n) |
| 子集   | O(n × 2ⁿ)  | 2ⁿ 个子集                |
| 组合   | 取决于剪枝 | 剪枝后远小于理论值       |

## 小结

回溯 = DFS + 撤销选择。记住三问：**路径、选择列表、结束条件**。

去重技巧：

- 先排序
- 同一层中跳过重复元素：`if (i > start && nums[i] === nums[i-1]) continue`

口诀：**选择路径递归深，不满足时往回退。做选择后记得撤，穷举剪枝效率升** ✅
