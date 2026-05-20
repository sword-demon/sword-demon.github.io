---
title: 滑动窗口
description: 滑动窗口（Sliding Window）
date: 2026-05-17 23:30:00
categories:
  - Algorithm
tags:
  - sliding-window
sidebarSort: 12
---

# 滑动窗口（Sliding Window）

你打开了一个外卖 App，疯狂刷新页面——1 秒钟刷了 50 次。如果后端不加以限制，每台服务器可能同时收到几万个请求，直接被打爆。怎么办？最直觉的办法：**每分钟最多允许你请求 60 次**。但问题来了——如果用户在第 1 分钟的最后 1 秒刷了 60 次，第 2 分钟的第 1 秒又刷了 60 次，实际上 2 秒内就刷了 120 次，远超预期。

这就是固定窗口的"临界突刺"问题。**滑动窗口**就是为了解决这个问题的：它不是按固定的分钟切割，而是始终看"过去 N 秒"这个时间窗口，窗口随着时间往前滑动，所以叫"滑动窗口"。听起来像是一个很简单的东西对吧？但它的变体和应用场景远比你想象的丰富。

## 原理拆解

### 1. 固定窗口 vs 滑动窗口

```
固定窗口（每分钟重置计数）：

时间轴: |------ 第1分钟 ------|------ 第2分钟 ------|
请求:    .....................60次                    60次...
                                    ↑
                              第59秒: 60次 + 第61秒: 60次 = 2秒内120次！💥

滑动窗口（始终看过去60秒）：

时间轴: ──────────────────────────────────────────────►
             [======== 窗口 ========]
                                    ↑ 当前时刻
                        窗口始终跟着当前时刻滑动
                    只统计窗口内的请求数，超过阈值就拒绝
```

### 2. 滑动窗口限流的两种实现

#### 方案一：基于时间戳的精确窗口

记录每次请求的时间戳，查询时只保留窗口内的记录，统计数量。

```
请求时间戳列表：[10:00:01, 10:00:03, 10:00:05, 10:00:08, 10:00:12]
当前时间：10:00:15
窗口大小：10 秒
有效窗口：10:00:05 ~ 10:00:15
窗口内请求数：3（05、08、12 这三个）
```

优点：精确。缺点：每次请求都要遍历历史记录，内存占用和请求量成正比。

#### 方案二：基于分片的滑动窗口（Sentinel / Guava RateLimiter 思路）

把大窗口切成多个小格子（比如 1 秒一个格子），每个格子维护一个计数器。查询时把窗口覆盖的格子计数加起来。

```
窗口大小：60秒，格子粒度：1秒，限流：60次/分

格子：  [58][59][60][1][2][3][4][5]...[当前秒]
计数：   5   8   3  2  0  1  4  2       7
         ↑                         ↑
      窗口起点                  当前位置

总计数 = 窗口内所有格子的计数之和
超过阈值就拒绝，没超过就当前格子 +1 放行
```

优点：内存固定（只维护 N 个格子），查询 O(1)。缺点：精度取决于格子粒度。

### 3. 滑动窗口在数组/字符串上的应用

限流是滑动窗口在**时间维度**的应用。在算法题中，滑动窗口更多出现在**数组/字符串**上：用两个指针维护一个"窗口"，右指针扩展窗口，左指针收缩窗口，在 O(n) 时间内完成原本需要 O(n²) 的操作。

```
数组：[1, 3, 2, 6, 4, 5, 9]
目标：找和 ≥ 10 的最短子数组

步骤：
[1]          和=1  < 10  → 右指针扩展
[1, 3]       和=4  < 10  → 右指针扩展
[1, 3, 2]    和=6  < 10  → 右指针扩展
[1, 3, 2, 6] 和=12 ≥ 10  → 记录长度4，左指针收缩
   [3, 2, 6] 和=11 ≥ 10  → 记录长度3，左指针收缩
      [2, 6] 和=8  < 10  → 右指针扩展
      [2, 6, 4] 和=12 ≥ 10 → 记录长度3，左指针收缩
         [6, 4] 和=10 ≥ 10 → 记录长度2 ✓ 最优解！
```

## 代码实现

### TypeScript

```typescript
/**
 * 滑动窗口限流器 —— 基于时间戳的精确实现
 * 核心思路：用一个数组记录每次请求的时间戳，
 * 来新请求时先把过期的旧时间戳清理掉，再判断窗口内请求数是否超限
 */
class SlidingWindowRateLimiter {
  private timestamps: number[] = []; // 存储每次请求的时间戳
  private windowMs: number; // 窗口大小（毫秒）
  private maxRequests: number; // 窗口内允许的最大请求数

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * 尝试通过一个请求
   * 返回 true 表示放行，false 表示被限流
   */
  tryAcquire(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 清理过期的时间戳：只保留窗口内的记录
    // 为什么这么做：避免数组无限增长，老数据已经没用了
    while (this.timestamps.length > 0 && this.timestamps[0] <= windowStart) {
      this.timestamps.shift();
    }

    // 判断窗口内的请求数是否超限
    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return true; // 放行
    }

    return false; // 被限流
  }
}

// === 滑动窗口求最小长子数组（算法题经典应用） ===

/**
 * 给定一个正整数数组和目标值 s，找出和 ≥ s 的最短连续子数组长度
 * 为什么用滑动窗口：双指针各只遍历一次数组，O(n) 搞定
 */
function minSubArrayLen(nums: number[], target: number): number {
  let left = 0; // 窗口左边界
  let sum = 0; // 当前窗口内元素之和
  let minLen = Infinity; // 记录最短长度

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]; // 右指针扩展：把新元素纳入窗口

    // 当窗口内之和已经 ≥ target，尝试收缩左边界
    // 为什么用 while 不用 if：收缩一次可能还不够，要缩到不能再缩
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left]; // 左边界收缩：把最左边的元素移出窗口
      left++;
    }
  }

  return minLen === Infinity ? 0 : minLen;
}

// 使用示例
const limiter = new SlidingWindowRateLimiter(1000, 3); // 1秒内最多3次
console.log(limiter.tryAcquire()); // true
console.log(limiter.tryAcquire()); // true
console.log(limiter.tryAcquire()); // true
console.log(limiter.tryAcquire()); // false —— 被限流了

console.log(minSubArrayLen([2, 3, 1, 2, 4, 3], 7)); // 2 → [4,3]
```

### Go

```go
package slidingwindow

import "sync"

// RateLimiter 基于时间戳的滑动窗口限流器
type RateLimiter struct {
	mu          sync.Mutex // 保护 timestamps 的并发安全
	timestamps  []int64    // 每次请求的时间戳（毫秒）
	windowMs    int64      // 窗口大小（毫秒）
	maxRequests int        // 窗口内最大请求数
}

// NewRateLimiter 创建限流器
func NewRateLimiter(windowMs int64, maxRequests int) *RateLimiter {
	return &RateLimiter{
		timestamps:  make([]int64, 0),
		windowMs:    windowMs,
		maxRequests: maxRequests,
	}
}

// TryAcquire 尝试通过请求，返回 true 表示放行
func (r *RateLimiter) TryAcquire() bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := currentTimeMillis()
	windowStart := now - r.windowMs

	// 清理过期时间戳：用双指针技巧原地删除
	// 为什么这么做：避免每次创建新切片，复用底层数组
	validIdx := 0
	for i, ts := range r.timestamps {
		if ts > windowStart {
			r.timestamps[i-validIdx] = ts
		} else {
			validIdx++
		}
	}
	r.timestamps = r.timestamps[:len(r.timestamps)-validIdx]

	// 判断是否超限
	if len(r.timestamps) < r.maxRequests {
		r.timestamps = append(r.timestamps, now)
		return true
	}
	return false
}

// MinSubArrayLen 求和 ≥ target 的最短子数组长度
// 为什么用滑动窗口：所有元素都是正整数，窗口扩大 sum 一定增大，满足单调性
func MinSubArrayLen(nums []int, target int) int {
	left := 0
	sum := 0
	minLen := len(nums) + 1 // 初始化为一个不可能的大值

	for right := 0; right < len(nums); right++ {
		sum += nums[right] // 右指针扩展窗口

		// 窗口满足条件时，尽量收缩左边界
		for sum >= target {
			if right-left+1 < minLen {
				minLen = right - left + 1
			}
			sum -= nums[left]
			left++
		}
	}

	if minLen == len(nums)+1 {
		return 0
	}
	return minLen
}

// 获取当前时间戳（毫秒），方便测试时可替换
var currentTimeMillis = func() int64 {
	// 实际项目中用 time.Now().UnixMilli()
	return 0
}
```

### Java

```java
import java.util.LinkedList;
import java.util.Queue;

/**
 * 滑动窗口限流器 —— 基于时间戳的精确实现
 * 核心思路：用队列记录每次请求的时间戳，过期就出队，队列长度就是窗口内请求数
 */
public class SlidingWindowRateLimiter {
    private final Queue<Long> timestamps; // 请求时间戳队列
    private final long windowMs;          // 窗口大小（毫秒）
    private final int maxRequests;        // 窗口内最大请求数

    public SlidingWindowRateLimiter(long windowMs, int maxRequests) {
        this.timestamps = new LinkedList<>();
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    /**
     * 尝试通过请求
     * 为什么用 synchronized：多线程环境下 timestamps 队列需要线程安全
     */
    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long windowStart = now - windowMs;

        // 清理过期时间戳：队头的最老，如果过期了就出队
        // 为什么用 while：可能一次性过期好几个
        while (!timestamps.isEmpty() && timestamps.peek() <= windowStart) {
            timestamps.poll();
        }

        // 判断窗口内请求数
        if (timestamps.size() < maxRequests) {
            timestamps.offer(now);
            return true; // 放行
        }
        return false; // 限流
    }
}

// === 滑动窗口求最短子数组 ===

class SlidingWindowArray {

    /**
     * 给定正整数数组和 target，求和 ≥ target 的最短连续子数组长度
     *
     * 为什么用滑动窗口而不是暴力法：
     * 暴力法要枚举所有子数组，O(n²)；滑动窗口左右指针各走一遍，O(n)
     * 关键性质：元素都是正整数 → 窗口扩大 sum 一定增大，满足单调性
     */
    public static int minSubArrayLen(int[] nums, int target) {
        int left = 0;
        int sum = 0;
        int minLen = Integer.MAX_VALUE;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right]; // 右指针扩展：纳入新元素

            // 窗口内之和已满足条件，尝试收缩
            while (sum >= target) {
                minLen = Math.min(minLen, right - left + 1);
                sum -= nums[left]; // 左指针收缩：移除最左元素
                left++;
            }
        }

        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }

    public static void main(String[] args) {
        // 限流器示例
        SlidingWindowRateLimiter limiter = new SlidingWindowRateLimiter(1000, 3);
        System.out.println(limiter.tryAcquire()); // true
        System.out.println(limiter.tryAcquire()); // true
        System.out.println(limiter.tryAcquire()); // true
        System.out.println(limiter.tryAcquire()); // false

        // 最短子数组示例
        int[] nums = {2, 3, 1, 2, 4, 3};
        System.out.println(minSubArrayLen(nums, 7)); // 2 → 子数组 [4,3]
    }
}
```

### Python

```python
import time
from collections import deque


class SlidingWindowRateLimiter:
    """滑动窗口限流器 —— 基于时间戳的精确实现

    核心思路：用双端队列记录每次请求的时间戳，
    来新请求时先清理过期的老时间戳，再判断是否超限。
    为什么用 deque 不用 list：deque 的 popleft 是 O(1)，list 的 pop(0) 是 O(n)。
    """

    def __init__(self, window_seconds: float, max_requests: int):
        self.timestamps: deque[float] = deque()
        self.window_seconds = window_seconds
        self.max_requests = max_requests

    def try_acquire(self) -> bool:
        """尝试通过请求，返回 True 表示放行"""
        now = time.time()
        window_start = now - self.window_seconds

        # 清理过期时间戳：从左边弹出所有过期的
        # 为什么用 while：可能有多个连续过期的，一次性清干净
        while self.timestamps and self.timestamps[0] <= window_start:
            self.timestamps.popleft()

        # 判断窗口内请求数是否超限
        if len(self.timestamps) < self.max_requests:
            self.timestamps.append(now)
            return True
        return False


def min_sub_array_len(nums: list[int], target: int) -> int:
    """滑动窗口求和 ≥ target 的最短连续子数组长度

    为什么用滑动窗口：
    所有元素都是正整数，窗口扩大 sum 一定增大（单调性），
    所以可以用双指针一次遍历搞定，O(n) 时间复杂度。
    """
    left = 0
    window_sum = 0
    min_len = float("inf")

    for right in range(len(nums)):
        window_sum += nums[right]  # 右指针扩展：纳入新元素

        # 窗口内之和已满足条件，尽量收缩左边界找更短的子数组
        while window_sum >= target:
            min_len = min(min_len, right - left + 1)
            window_sum -= nums[left]  # 左指针收缩：移出最左元素
            left += 1

    return 0 if min_len == float("inf") else min_len


if __name__ == "__main__":
    # 限流器示例：1秒内最多允许5次请求
    limiter = SlidingWindowRateLimiter(window_seconds=1.0, max_requests=5)
    for i in range(8):
        result = limiter.try_acquire()
        print(f"请求 {i + 1}: {'✅ 通过' if result else '❌ 被限流'}")

    # 最短子数组示例
    nums = [2, 3, 1, 2, 4, 3]
    print(f"和 ≥ 7 的最短子数组长度: {min_sub_array_len(nums, 7)}")  # 2
```

## 业务场景

### 1. API 接口限流

这是滑动窗口最经典的业务场景。几乎所有公开 API 都需要限流，防止恶意调用把服务打挂。比如 GitHub API 限制每小时 5000 次请求，微信小程序接口限制每分钟调用次数。Alibaba Sentinel 就是基于滑动窗口实现的流量控制组件，它把窗口切成更细的格子来实现高性能的统计。

### 2. 实时数据统计

"过去 5 分钟的平均响应时间"、"最近 1 小时的错误率"、"每分钟的 UV 数"——这些指标都是滑动窗口在时间序列数据上的应用。Prometheus、InfluxDB 等监控系统的 `rate()`、`avg_over_time()` 函数本质上就是在做滑动窗口聚合。

### 3. 字符串/数组的子串问题

算法面试的高频考点：无重复字符的最长子串、最小覆盖子串、找到字符串中所有字母异位词等。这类问题的共性是——在连续区间上找满足条件的子区间，暴力法 O(n²)，滑动窗口 O(n)。LeetCode 上"滑动窗口"标签下有上百道题，掌握模板就能批量秒杀。

## 复杂度分析

| 操作                 | 时间复杂度 | 空间复杂度      |
| -------------------- | ---------- | --------------- |
| 限流判定（时间戳法） | O(过期数)  | O(窗口内请求数) |
| 限流判定（分片法）   | O(1)       | O(窗口格子数)   |
| 数组上的滑动窗口     | O(n)       | O(1)            |

- **限流时间复杂度**：时间戳法需要清理过期记录，均摊下来每次请求接近 O(1)；分片法直接加格子计数，严格 O(1)。
- **数组滑动窗口 O(n)**：左右指针各最多遍历数组一次，不会回退，所以总操作次数不超过 2n。
- **空间复杂度 O(1)**：数组滑动窗口只用到几个变量，不需要额外空间（不计算输出）。

## 小结

滑动窗口的核心思想就一句话：**维护一个满足条件的区间，根据情况决定扩展还是收缩**。

- 🔒 **限流场景**：窗口大小固定（时间），滑动的是时间轴，统计窗口内的请求量
- 📊 **统计场景**：窗口大小固定（时间），滑动的是数据流，做实时聚合
- 🧮 **算法场景**：窗口大小可变，左右指针各走一遍数组，O(n) 搞定子串问题

它不只是一个算法模板，更是一种思维方式：**当问题涉及"连续区间"和"满足条件"时，想想能不能用滑动窗口**。
