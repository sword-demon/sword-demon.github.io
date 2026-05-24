---
title: 单调栈
description: Monotonic Stack 详解：下一个更大元素、每日温度、接雨水，四语言实现
date: 2026-05-17 19:00:00
categories:
  - Algorithm
tags:
  - monotonic-stack
  - stack
  - interview
sidebarSort: 16
---

# 单调栈（Monotonic Stack）

面试官问："给你一个数组，对每个元素找出它**右边第一个比它大的元素**。要求 O(n)。"

暴力做法是对每个元素往右遍历，O(n²)。但有一种巧妙的数据结构可以一次遍历搞定——**单调栈**。

## 原理拆解

单调栈就是一个普通的栈，只是我们保证栈内元素从栈底到栈顶保持**单调递增（或递减）**。当新元素破坏单调性时，就弹出栈顶元素——而弹出的元素的答案就是当前新元素。

```
数组 [2, 1, 2, 4, 3]，找每个元素右边第一个更大的：

遍历：
  i=0, val=2: 栈空，入栈 → 栈 [2]
  i=1, val=1: 1 < 2（栈顶），入栈 → 栈 [2, 1]
  i=2, val=2: 2 > 1（栈顶），弹出 1 → 1 的右边第一个更大是 2
              2 == 2，入栈 → 栈 [2, 2]
  i=3, val=4: 4 > 2，弹出 2 → 2 的右边第一个更大是 4
              4 > 2，弹出 2 → 2 的右边第一个更大是 4
              栈空，入栈 → 栈 [4]
  i=4, val=3: 3 < 4，入栈 → 栈 [4, 3]

遍历结束，栈中剩余元素没有右边更大的 → 答案为 -1
```

## 代码实现

### 经典问题一：下一个更大元素

> LeetCode 739. Daily Temperatures / 496. Next Greater Element

#### TypeScript

```typescript
/**
 * 每日温度 —— TypeScript 实现
 * 单调递减栈：找每个元素右边第一个更大的
 */
function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const result = new Array(n).fill(0);
  const stack: number[] = []; // 存索引，栈底到栈顶温度递减

  for (let i = 0; i < n; i++) {
    // 当前温度比栈顶高 → 栈顶找到了"更暖的一天"
    while (
      stack.length > 0 &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      const j = stack.pop()!;
      result[j] = i - j; // 等待天数
    }
    stack.push(i);
  }
  return result;
}

console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]));
// [1, 1, 4, 2, 1, 1, 0, 0]
```

#### Go

```go
package monotonicstack

// DailyTemperatures 每日温度 —— Go 实现
func DailyTemperatures(temperatures []int) []int {
	n := len(temperatures)
	result := make([]int, n)
	stack := []int{} // 存索引

	for i := 0; i < n; i++ {
		for len(stack) > 0 && temperatures[i] > temperatures[stack[len(stack)-1]] {
			j := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			result[j] = i - j
		}
		stack = append(stack, i)
	}
	return result
}
```

#### Java

```java
import java.util.*;

public class DailyTemperatures {
    public static int[] solve(int[] temperatures) {
        int n = temperatures.length;
        int[] result = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();

        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
                int j = stack.pop();
                result[j] = i - j;
            }
            stack.push(i);
        }
        return result;
    }
}
```

#### Python

```python
"""每日温度 —— Python 实现"""

def daily_temperatures(temperatures: list[int]) -> list[int]:
    n = len(temperatures)
    result = [0] * n
    stack = []  # 存索引

    for i, temp in enumerate(temperatures):
        while stack and temp > temperatures[stack[-1]]:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result
```

### 经典问题二：接雨水

> LeetCode 42. Trapping Rain Water

#### TypeScript

```typescript
/**
 * 接雨水 —— TypeScript 实现（单调栈）
 * 栈中存索引，栈底到栈顶高度递减
 */
function trap(height: number[]): number {
  const stack: number[] = [];
  let water = 0;

  for (let i = 0; i < height.length; i++) {
    while (stack.length > 0 && height[i] > height[stack[stack.length - 1]]) {
      const bottom = stack.pop()!; // 凹槽底部
      if (stack.length === 0) break;
      const left = stack[stack.length - 1]; // 左边界
      const width = i - left - 1;
      const h = Math.min(height[i], height[left]) - height[bottom];
      water += width * h;
    }
    stack.push(i);
  }
  return water;
}

console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
```

#### Python

```python
"""接雨水 —— Python 实现"""

def trap(height: list[int]) -> int:
    stack = []
    water = 0

    for i, h in enumerate(height):
        while stack and h > height[stack[-1]]:
            bottom = stack.pop()
            if not stack:
                break
            left = stack[-1]
            width = i - left - 1
            water += width * (min(h, height[left]) - height[bottom])
        stack.append(i)
    return water
```

## 面试题精选

| 题号 | 题目               | 单调栈思路         | 难度 |
| ---- | ------------------ | ------------------ | ---- |
| 739  | 每日温度           | 找右边第一个更大   | 中等 |
| 496  | 下一个更大元素 I   | 单调栈 + 哈希      | 简单 |
| 503  | 下一个更大元素 II  | 环形数组，遍历两遍 | 中等 |
| 42   | 接雨水             | 单调栈计算凹槽     | 困难 |
| 84   | 柱状图中最大的矩形 | 单调栈找左右边界   | 困难 |
| 85   | 最大矩形           | 逐行转化为 84 题   | 困难 |
| 901  | 股票价格跨度       | 单调递减栈         | 中等 |
| 402  | 移掉 K 位数字      | 单调栈删数字       | 中等 |

## 业务场景

### 1. 股票价格分析

找"某只股票上一次高于当前价格是哪天"——就是单调栈的"上一个更大元素"。技术分析中的支撑位、阻力位计算也用这个思路。

### 2. 浏览器历史记录

"前进/后退"按钮用栈实现。如果要实现"跳到最近访问的更高级别页面"，可以用单调栈。

### 3. 编译器括号匹配

检查代码中的括号是否匹配——虽然用普通栈就行，但如果要处理嵌套层级的优先级（比如运算符优先级），单调栈就派上用场了。

## 复杂度分析

| 操作   | 时间复杂度 | 空间复杂度 |
| ------ | ---------- | ---------- |
| 全过程 | O(n)       | O(n)       |

每个元素最多入栈一次、出栈一次，所以总时间 O(n)。

## 小结

单调栈的核心：**维护单调性，新元素破坏单调性时弹出的元素就找到了答案**。

- **找右边第一个更大** → 单调递减栈
- **找右边第一个更小** → 单调递增栈
- **找左边** → 从右往左遍历，或者栈中就是"左边第一个"

口诀：**栈内单调别乱加，破坏单调就弹它。弹出元素找答案，右边首个就是它** ✅
