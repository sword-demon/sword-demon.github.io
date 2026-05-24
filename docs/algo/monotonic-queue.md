---
title: 单调队列
description: Monotonic Queue 详解：滑动窗口最大值到跳跃游戏 VI，四语言实现
date: 2026-05-18 04:00:00
categories:
  - Algorithm
tags:
  - monotonic-queue
  - sliding-window
  - deque
  - interview
sidebarSort: 30
---

# 单调队列（Monotonic Queue / Deque）

面试官问："给你一个数组和一个大小为 k 的滑动窗口，窗口从左滑到右，每次输出窗口内的最大值。要求 O(n)。"

暴力做法是每次遍历窗口找最大值，O(n×k)。但面试官要的是 O(n)——每个元素最多被处理一次。

这时候就需要**单调队列**：一个双端队列，里面的元素始终保持单调递减。这样**队首永远是当前窗口的最大值**，查询 O(1)。

## 原理拆解

### 核心思想

单调队列维护一个双端队列（Deque），队列中的元素**从队首到队尾单调递减**（求最大值时）。

每处理一个新元素：

```
1. 从队尾弹出所有比新元素小的（它们不可能再成为最大值了）
2. 新元素从队尾入队
3. 如果队首元素已经不在窗口内，从队首弹出
4. 队首就是当前窗口的最大值
```

```
数组 [1, 3, -1, -3, 5, 3, 6, 7]，窗口大小 k = 3

i=0, val=1:  队列 [1]                    窗口未满
i=1, val=3:  队列 [3]      (1 < 3, 弹出)  窗口未满
i=2, val=-1: 队列 [3, -1]                 窗口 [1,3,-1] 最大值 = 3 ✅
i=3, val=-3: 队列 [3, -1, -3]             窗口 [3,-1,-3] 最大值 = 3 ✅
i=4, val=5:  队列 [5]      (全部弹出)      窗口 [-1,-3,5] 最大值 = 5 ✅
i=5, val=3:  队列 [5, 3]                  窗口 [-3,5,3]  最大值 = 5 ✅
i=6, val=6:  队列 [6]      (全部弹出)      窗口 [5,3,6]   最大值 = 6 ✅
i=7, val=7:  队列 [7]      (全部弹出)      窗口 [3,6,7]   最大值 = 7 ✅
```

### 为什么是 O(n)？

每个元素**最多入队一次、出队一次**。虽然有 while 循环弹出队尾元素，但所有元素的出队次数加起来不超过 n。所以总操作次数是 O(n)。

### 单调递增 vs 单调递减

```
求窗口最大值 → 单调递减队列（队首最大）
求窗口最小值 → 单调递增队列（队首最小）
```

## 代码实现

### 经典问题一：滑动窗口最大值

> LeetCode 239. Sliding Window Maximum
> 给定数组和窗口大小 k，返回每个窗口的最大值。

#### TypeScript

```typescript
/**
 * 滑动窗口最大值 —— TypeScript 实现
 * 单调递减双端队列，队首永远是窗口最大值
 */
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  // 队列存索引（不是值！），方便判断是否在窗口内
  const deque: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    // 1. 从队尾弹出所有比当前元素小的索引
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }

    // 2. 当前索引入队
    deque.push(i);

    // 3. 如果队首索引已经不在窗口内，弹出
    if (deque[0] <= i - k) {
      deque.shift();
    }

    // 4. 窗口满了（i >= k-1），记录结果
    if (i >= k - 1) {
      result.push(nums[deque[0]]); // 队首就是最大值
    }
  }

  return result;
}

// 测试
console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3));
// [3, 3, 5, 5, 6, 7]

console.log(maxSlidingWindow([1, -1], 1));
// [1, -1]
```

#### Go

```go
package monotonic

// MaxSlidingWindow 滑动窗口最大值 —— Go 实现
func MaxSlidingWindow(nums []int, k int) []int {
	var result []int
	deque := make([]int, 0) // 存索引

	for i := 0; i < len(nums); i++ {
		// 从队尾弹出比当前小的
		for len(deque) > 0 && nums[deque[len(deque)-1]] <= nums[i] {
			deque = deque[:len(deque)-1]
		}

		deque = append(deque, i)

		// 队首超出窗口
		if deque[0] <= i-k {
			deque = deque[1:]
		}

		// 窗口满了，记录结果
		if i >= k-1 {
			result = append(result, nums[deque[0]])
		}
	}
	return result
}
```

#### Java

```java
import java.util.*;

/**
 * 滑动窗口最大值 —— Java 实现
 */
public class SlidingWindowMaximum {

    public static int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> deque = new ArrayDeque<>(); // 存索引

        for (int i = 0; i < n; i++) {
            // 弹出队尾比当前小的
            while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) {
                deque.pollLast();
            }

            deque.offerLast(i);

            // 队首超出窗口
            if (deque.peekFirst() <= i - k) {
                deque.pollFirst();
            }

            if (i >= k - 1) {
                result[i - k + 1] = nums[deque.peekFirst()];
            }
        }
        return result;
    }
}
```

#### Python

```python
"""滑动窗口最大值 —— Python 实现"""
from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    result = []
    dq = deque()  # 存索引

    for i, val in enumerate(nums):
        # 弹出队尾比当前小的
        while dq and nums[dq[-1]] <= val:
            dq.pop()

        dq.append(i)

        # 队首超出窗口
        if dq[0] <= i - k:
            dq.popleft()

        # 窗口满了
        if i >= k - 1:
            result.append(nums[dq[0]])

    return result


# 测试
print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
# [3, 3, 5, 5, 6, 7]
```

### 经典问题二：跳跃游戏 VI

> LeetCode 1696. Jump Game VI
> 从索引 0 出发，每次最多跳 k 步，到达每个位置有得分 nums[i]。求到达最后一个位置的最大得分。

**思路：动态规划 + 单调队列。`dp[i] = nums[i] + max(dp[i-k..i-1])`，用单调队列维护窗口内的最大 dp 值。**

#### TypeScript

```typescript
/**
 * 跳跃游戏 VI —— TypeScript 实现
 * DP + 单调队列优化
 */
function maxResult(nums: number[], k: number): number {
  const n = nums.length;
  const dp = new Array(n).fill(0);
  dp[0] = nums[0];

  // 单调递减队列，存索引，队首是 dp 值最大的
  const deque: number[] = [0];

  for (let i = 1; i < n; i++) {
    // 队首超出跳跃范围，弹出
    while (deque.length > 0 && deque[0] < i - k) {
      deque.shift();
    }

    // dp[i] = nums[i] + 窗口内最大的 dp 值（队首）
    dp[i] = nums[i] + dp[deque[0]];

    // 维护单调性：弹出队尾 dp 值 <= dp[i] 的
    while (deque.length > 0 && dp[deque[deque.length - 1]] <= dp[i]) {
      deque.pop();
    }

    deque.push(i);
  }

  return dp[n - 1];
}

// 测试
console.log(maxResult([1, -1, -2, 4, -7, 3], 2)); // 7
console.log(maxResult([10, -5, -2, 4, 0, 3], 3)); // 17
```

#### Go

```go
package monotonic

// MaxResult 跳跃游戏 VI —— Go 实现
func MaxResult(nums []int, k int) int {
	n := len(nums)
	dp := make([]int, n)
	dp[0] = nums[0]

	deque := []int{0}

	for i := 1; i < n; i++ {
		for len(deque) > 0 && deque[0] < i-k {
			deque = deque[1:]
		}

		dp[i] = nums[i] + dp[deque[0]]

		for len(deque) > 0 && dp[deque[len(deque)-1]] <= dp[i] {
			deque = deque[:len(deque)-1]
		}

		deque = append(deque, i)
	}
	return dp[n-1]
}
```

#### Java

```java
import java.util.*;

/**
 * 跳跃游戏 VI —— Java 实现
 */
public class JumpGameVI {

    public static int maxResult(int[] nums, int k) {
        int n = nums.length;
        int[] dp = new int[n];
        dp[0] = nums[0];

        Deque<Integer> deque = new ArrayDeque<>();
        deque.offerLast(0);

        for (int i = 1; i < n; i++) {
            while (!deque.isEmpty() && deque.peekFirst() < i - k) {
                deque.pollFirst();
            }
            dp[i] = nums[i] + dp[deque.peekFirst()];
            while (!deque.isEmpty() && dp[deque.peekLast()] <= dp[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);
        }
        return dp[n - 1];
    }
}
```

#### Python

```python
"""跳跃游戏 VI —— Python 实现"""
from collections import deque

def max_result(nums: list[int], k: int) -> int:
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]

    dq = deque([0])

    for i in range(1, n):
        while dq and dq[0] < i - k:
            dq.popleft()

        dp[i] = nums[i] + dp[dq[0]]

        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()

        dq.append(i)

    return dp[-1]
```

### 经典问题三：队列的最大值

> 剑指 Offer 59 - II / LeetCode 155 变种
> 设计一个支持 `push_back`、`pop_front`、`max_value` 的队列，三个操作都是 O(1)。

#### TypeScript

```typescript
/**
 * 队列的最大值 —— TypeScript 实现
 * 主队列 + 单调递减辅助双端队列
 */
class MaxQueue {
  private queue: number[] = []; // 主队列
  private maxDeque: number[] = []; // 单调递减，队首是最大值

  push_back(value: number): void {
    this.queue.push(value);
    // 维护单调性
    while (
      this.maxDeque.length > 0 &&
      this.maxDeque[this.maxDeque.length - 1] < value
    ) {
      this.maxDeque.pop();
    }
    this.maxDeque.push(value);
  }

  pop_front(): number {
    if (this.queue.length === 0) return -1;
    const front = this.queue.shift()!;
    if (this.maxDeque[0] === front) {
      this.maxDeque.shift();
    }
    return front;
  }

  max_value(): number {
    return this.maxDeque.length > 0 ? this.maxDeque[0] : -1;
  }
}
```

#### Python

```python
"""队列的最大值 —— Python 实现"""
from collections import deque

class MaxQueue:
    def __init__(self):
        self.queue = deque()
        self.max_deque = deque()

    def push_back(self, value: int) -> None:
        self.queue.append(value)
        while self.max_deque and self.max_deque[-1] < value:
            self.max_deque.pop()
        self.max_deque.append(value)

    def pop_front(self) -> int:
        if not self.queue:
            return -1
        front = self.queue.popleft()
        if self.max_deque[0] == front:
            self.max_deque.popleft()
        return front

    def max_value(self) -> int:
        return self.max_deque[0] if self.max_deque else -1
```

## 面试题精选

| 题号      | 题目                             | 单调队列应用          | 难度 |
| --------- | -------------------------------- | --------------------- | ---- |
| 239       | 滑动窗口最大值                   | 标准单调队列          | 困难 |
| 1696      | 跳跃游戏 VI                      | DP + 单调队列优化     | 中等 |
| 862       | 和至少为 K 的最短子数组          | 前缀和 + 单调队列     | 困难 |
| 1425      | 带限制的子序列和                 | DP + 单调队列         | 困难 |
| 1438      | 绝对差不超过限制的最长连续子数组 | 双单调队列            | 中等 |
| 剑指59    | 滑动窗口的最大值                 | 同 239                | 困难 |
| 剑指59-II | 队列的最大值                     | 主队列 + 辅助单调队列 | 中等 |
| 71        | 简化路径                         | 栈模拟（类似思想）    | 中等 |

## 业务场景

### 1. 实时数据流监控

监控系统需要在持续流入的数据中实时计算"最近 5 分钟的 CPU 使用率最大值"。这就是一个滑动窗口最大值问题。Prometheus 的 `max_over_time` 函数底层就可以用单调队列实现。

### 2. 限流器

API 限流器需要在滑动窗口内追踪最大请求时间戳或最小可用配额。单调队列可以高效地维护窗口内的极值，淘汰过期的时间戳。

### 3. 金融交易中的移动均线

股票软件上的"MA5（5 日均线）"、"MA20（20 日均线）"就是滑动窗口的平均值。而"最近 N 日最高价"就是滑动窗口最大值。在实时行情推送中，单调队列比暴力计算高效得多。

### 4. 视频编码中的运动估计

H.264/H.265 视频编码需要在参考帧中搜索与当前块最匹配的区域。搜索过程中需要计算局部区域的最小 SAD（Sum of Absolute Differences），单调队列可以加速这个滑动窗口最小值的计算。

### 5. 游戏中视野范围

RTS 游戏中单位的视野范围是一个滑动窗口——当摄像机向右移动时，左边的对象移出视野，右边的进入。用单调队列可以高效维护视野内"最远的敌人"、"最近的资源点"等信息。

## 复杂度分析

| 操作           | 时间复杂度 | 说明                       |
| -------------- | ---------- | -------------------------- |
| 入队（push）   | 摊还 O(1)  | while 循环总共弹出 n 次    |
| 出队（pop）    | O(1)       | 直接弹队首                 |
| 查询最值       | O(1)       | 队首就是答案               |
| 滑动窗口全过程 | O(n)       | 每个元素入队一次、出队一次 |
| 空间           | O(k)       | 队列最多存 k 个元素        |

## 单调队列 vs 单调栈

| 特性     | 单调队列               | 单调栈              |
| -------- | ---------------------- | ------------------- |
| 数据结构 | 双端队列（Deque）      | 栈（Stack）         |
| 弹出位置 | 两端都可以弹出         | 只从栈顶弹出        |
| 典型场景 | 滑动窗口最值           | 下一个更大/更小元素 |
| 窗口限制 | 有（需要淘汰过期元素） | 无                  |
| 核心问题 | "窗口内的极值"         | "一侧的极值"        |

简单记忆：**有窗口限制用队列，没窗口限制用栈**。

## 小结

单调队列的核心就三步：**队尾弹小的、队尾入新的、队首查最大**。

面试中记住这些要点：

1. **队列存索引**（不是值），方便判断是否在窗口内
2. **入队前从队尾弹出所有比新元素差的**，保持单调性
3. **队首超出窗口时要弹出**（`deque[0] <= i - k`）
4. **DP + 单调队列**是经典组合：当状态转移方程是 `dp[i] = f(i) + max(dp[i-k..i-1])` 时，用单调队列把 O(n×k) 优化到 O(n)

口诀：**队尾弹小入新的，队首永远最值存。窗口滑动 O(n)，DP 优化它最神** ✅
