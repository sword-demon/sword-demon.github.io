---
title: 贪心算法
description: 贪心算法详解：从区间调度到跳跃游戏，四语言实现
date: 2026-05-17 20:00:00
categories:
  - Algorithm
tags:
  - greedy
  - algorithm
  - interview
sidebarSort: 22
---

# 贪心算法（Greedy Algorithm）

想象你是一个出租车调度员，面前有 20 个乘客的订单，每个订单有出发时间和到达时间。你的车只能一单一单跑，怎么安排才能**接到最多的订单**？

直觉告诉你：每次挑那个**最早结束的订单**，这样剩下的时间最多，能接更多单。恭喜你，这就是贪心算法的核心思想——**每一步都选当前最优的方案，期望最终结果也是全局最优的**。

但这里有个关键问题：**贪心并不总是对的**。如果你每次挑的是"最短的订单"而不是"最早结束的"，结果可能完全不同。贪心算法的难点不在于写代码，而在于**证明你的贪心策略是对的**。

## 原理拆解

贪心算法的本质是一种**分步决策**策略：

```
问题 → 第一步选最优 → 剩余子问题 → 第二步选最优 → ... → 最终解
```

它和动态规划的区别在于：

| 特性       | 贪心算法                  | 动态规划                 |
| ---------- | ------------------------- | ------------------------ |
| 决策方式   | 每步选局部最优，不回头    | 枚举所有可能，选全局最优 |
| 正确性     | 需要证明贪心策略正确      | 天然正确（穷举了）       |
| 时间复杂度 | 通常 O(n log n) 排序      | 通常 O(n²) 或更高        |
| 适用条件   | 贪心选择性质 + 最优子结构 | 最优子结构 + 重叠子问题  |

### 贪心算法的两个必要条件

**1. 贪心选择性质**：全局最优解可以通过一系列局部最优选择得到。

**2. 最优子结构**：问题的最优解包含子问题的最优解。

简单说就是：**你选了当前最优之后，剩下的问题用同样的策略继续选，最终结果还是最优的**。

### 经典反例：贪心失效的场景

不是所有问题都能贪心。看这个例子：

```
找零钱问题：面值 [1, 5, 10, 25]，要找 41 分
贪心策略：每次选最大面值
25 + 10 + 5 + 1 = 41（4 枚）✅ 这是最优的

但如果面值是 [1, 5, 10, 21, 25]，要找 63 分
贪心：25 + 25 + 10 + 1 + 1 + 1 = 63（6 枚）
最优：21 + 21 + 21 = 63（3 枚）❌ 贪心翻车了
```

所以贪心不是万能的，关键在于**问题是否具有贪心选择性质**。

## 代码实现

### 经典问题一：区间调度（最多不重叠区间）

> LeetCode 435. Non-overlapping Intervals
> 给定一组区间，问至少移除多少个区间，使得剩余区间互不重叠？

**贪心策略：按结束时间排序，每次选结束最早的且不与前一个重叠的区间。**

#### TypeScript

```typescript
/**
 * 区间调度 —— TypeScript 实现
 * 贪心策略：按右端点排序，贪心选结束最早的区间
 */
function eraseOverlapIntervals(intervals: number[][]): number {
  if (intervals.length <= 1) return 0;

  // 按结束时间升序排序
  intervals.sort((a, b) => a[1] - b[1]);

  let count = 1; // 至少能选一个区间
  let end = intervals[0][1]; // 记录上一个选中区间的结束时间

  for (let i = 1; i < intervals.length; i++) {
    // 当前区间的开始时间 >= 上一个选中区间的结束时间 → 不重叠，选中它
    if (intervals[i][0] >= end) {
      count++;
      end = intervals[i][1];
    }
    // 否则重叠了，跳过（移除）这个区间
  }

  // 总区间数 - 最多不重叠区间数 = 最少移除数
  return intervals.length - count;
}

// 测试
console.log(
  eraseOverlapIntervals([
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 3],
  ]),
); // 1（移除 [1,3]）
console.log(
  eraseOverlapIntervals([
    [1, 2],
    [1, 2],
    [1, 2],
  ]),
); // 2（移除两个 [1,2]）
console.log(
  eraseOverlapIntervals([
    [1, 2],
    [2, 3],
  ]),
); // 0（不重叠）
```

#### Go

```go
package greedy

import "sort"

// EraseOverlapIntervals 区间调度 —— Go 实现
// 贪心策略：按右端点排序，贪心选结束最早的区间
func EraseOverlapIntervals(intervals [][]int) int {
	if len(intervals) <= 1 {
		return 0
	}

	// 按结束时间升序排序
	sort.Slice(intervals, func(i, j int) bool {
		return intervals[i][1] < intervals[j][1]
	})

	count := 1                // 至少能选一个区间
	end := intervals[0][1]    // 上一个选中区间的结束时间

	for i := 1; i < len(intervals); i++ {
		if intervals[i][0] >= end {
			// 不重叠，选中这个区间
			count++
			end = intervals[i][1]
		}
		// 重叠了就跳过
	}

	return len(intervals) - count
}
```

#### Java

```java
import java.util.Arrays;

/**
 * 区间调度 —— Java 实现
 * 贪心策略：按右端点排序，贪心选结束最早的区间
 */
public class IntervalScheduling {

    public static int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length <= 1) return 0;

        // 按结束时间升序排序
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));

        int count = 1;                  // 至少选一个
        int end = intervals[0][1];      // 上一个选中区间的结束时间

        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] >= end) {
                // 不重叠，选中
                count++;
                end = intervals[i][1];
            }
        }

        return intervals.length - count;
    }

    public static void main(String[] args) {
        System.out.println(eraseOverlapIntervals(
            new int[][]{{1,2},{2,3},{3,4},{1,3}})); // 1
    }
}
```

#### Python

```python
"""区间调度 —— Python 实现
贪心策略：按右端点排序，贪心选结束最早的区间
"""

def erase_overlap_intervals(intervals: list[list[int]]) -> int:
    if len(intervals) <= 1:
        return 0

    # 按结束时间升序排序
    intervals.sort(key=lambda x: x[1])

    count = 1               # 至少选一个区间
    end = intervals[0][1]   # 上一个选中区间的结束时间

    for i in range(1, len(intervals)):
        if intervals[i][0] >= end:
            # 不重叠，选中这个区间
            count += 1
            end = intervals[i][1]

    return len(intervals) - count


# 测试
print(erase_overlap_intervals([[1,2],[2,3],[3,4],[1,3]]))  # 1
print(erase_overlap_intervals([[1,2],[1,2],[1,2]]))        # 2
```

### 经典问题二：跳跃游戏

> LeetCode 55. Jump Game
> 给定一个数组，每个元素表示你能跳跃的最大步数，问能否到达最后一个位置？

**贪心策略：维护一个"最远可达位置"，遍历数组不断更新，如果某一步最远可达 >= 终点，就能到。**

#### TypeScript

```typescript
/**
 * 跳跃游戏 —— TypeScript 实现
 * 贪心策略：维护最远可达位置
 */
function canJump(nums: number[]): boolean {
  let maxReach = 0; // 当前能跳到的最远位置

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // 当前位置已经跳不到了
    maxReach = Math.max(maxReach, i + nums[i]); // 更新最远可达
    if (maxReach >= nums.length - 1) return true; // 已经能到终点了
  }

  return true;
}

// 测试
console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false（卡在索引 3）
```

#### Go

```go
package greedy

// CanJump 跳跃游戏 —— Go 实现
func CanJump(nums []int) bool {
	maxReach := 0

	for i := 0; i < len(nums); i++ {
		if i > maxReach {
			return false
		}
		if i+nums[i] > maxReach {
			maxReach = i + nums[i]
		}
		if maxReach >= len(nums)-1 {
			return true
		}
	}
	return true
}
```

#### Java

```java
/**
 * 跳跃游戏 —— Java 实现
 */
public class JumpGame {

    public static boolean canJump(int[] nums) {
        int maxReach = 0;

        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false;
            maxReach = Math.max(maxReach, i + nums[i]);
            if (maxReach >= nums.length - 1) return true;
        }
        return true;
    }
}
```

#### Python

```python
"""跳跃游戏 —— Python 实现"""

def can_jump(nums: list[int]) -> bool:
    max_reach = 0

    for i, num in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + num)
        if max_reach >= len(nums) - 1:
            return True
    return True
```

### 经典问题三：跳跃游戏 II（最少跳跃次数）

> LeetCode 45. Jump Game II
> 保证能到终点的前提下，最少需要跳几次？

**贪心策略：在当前跳跃能覆盖的范围内，找到下一步能跳到的最远位置。到达当前范围边界时，必须跳一次。**

#### TypeScript

```typescript
/**
 * 跳跃游戏 II —— TypeScript 实现
 * 贪心策略：BFS 式分层跳跃
 */
function jump(nums: number[]): number {
  let jumps = 0; // 跳跃次数
  let currentEnd = 0; // 当前跳跃能到达的最远边界
  let farthest = 0; // 在当前范围内，下一步能跳到的最远位置

  // 注意：不需要遍历最后一个元素
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);

    // 到达当前跳跃的边界，必须再跳一次
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
      if (currentEnd >= nums.length - 1) break; // 已经能到终点了
    }
  }

  return jumps;
}

// 测试
console.log(jump([2, 3, 1, 1, 4])); // 2（跳 1 步到索引 1，再跳 3 步到终点）
console.log(jump([2, 3, 0, 1, 4])); // 2
```

#### Go

```go
package greedy

// Jump 跳跃游戏 II —— Go 实现
func Jump(nums []int) int {
	jumps := 0
	currentEnd := 0
	farthest := 0

	for i := 0; i < len(nums)-1; i++ {
		if i+nums[i] > farthest {
			farthest = i + nums[i]
		}
		if i == currentEnd {
			jumps++
			currentEnd = farthest
			if currentEnd >= len(nums)-1 {
				break
			}
		}
	}
	return jumps
}
```

#### Java

```java
/**
 * 跳跃游戏 II —— Java 实现
 */
public class JumpGameII {

    public static int jump(int[] nums) {
        int jumps = 0, currentEnd = 0, farthest = 0;

        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);
            if (i == currentEnd) {
                jumps++;
                currentEnd = farthest;
                if (currentEnd >= nums.length - 1) break;
            }
        }
        return jumps;
    }
}
```

#### Python

```python
"""跳跃游戏 II —— Python 实现"""

def jump(nums: list[int]) -> int:
    jumps = 0
    current_end = 0
    farthest = 0

    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
            if current_end >= len(nums) - 1:
                break
    return jumps
```

## 面试题精选

| 题号 | 题目                   | 贪心策略                   | 难度 |
| ---- | ---------------------- | -------------------------- | ---- |
| 435  | 无重叠区间             | 按右端点排序，选结束最早的 | 中等 |
| 452  | 用最少数量的箭引爆气球 | 按右端点排序，合并重叠区间 | 中等 |
| 55   | 跳跃游戏               | 维护最远可达位置           | 中等 |
| 45   | 跳跃游戏 II            | BFS 式分层跳跃             | 中等 |
| 122  | 买卖股票的最佳时机 II  | 收集所有正差价             | 中等 |
| 376  | 摆动序列               | 统计峰谷交替次数           | 中等 |
| 134  | 加油站                 | 累计油量最低点后面出发     | 中等 |
| 763  | 划分字母区间           | 记录每个字母最后出现位置   | 中等 |
| 56   | 合并区间               | 按左端点排序，合并重叠     | 中等 |
| 406  | 根据身高重建队列       | 先按身高降序，再按位置插入 | 中等 |

## 业务场景

### 1. 任务调度与资源分配

操作系统中的**活动选择问题**就是区间调度的翻版：多个任务竞争同一个 CPU 核心，每个任务有开始和结束时间，怎么安排能跑最多任务？贪心策略就是每次选最早结束的任务。

Kubernetes 的 Pod 调度也是类似的思路——优先把 Pod 调度到资源最充裕（或最快能空出来）的 Node 上。

### 2. 广告投放

广告平台要在有限的广告位中展示广告，每个广告有投放时间段和收益。要最大化收益，本质上就是**加权区间调度问题**。虽然加权版本需要动态规划，但基础的"最多展示多少个广告"就是贪心。

### 3. 网络路由中的最短路径

Dijkstra 算法的核心思想就是贪心——每次选距离起点最近的未访问节点。OSPF、IS-IS 等路由协议都基于这个思想。只不过贪心策略在这里被严格证明了正确性。

### 4. 文件压缩

Huffman 编码就是贪心算法的经典应用——每次合并频率最低的两个节点，构造最优前缀编码树。GZIP、ZIP 等压缩格式都用到了这个算法。

### 5. 找零与支付

虽然一般性的找零问题需要动态规划，但在大多数实际货币系统中（比如人民币、美元），贪心策略（优先用大面额）恰好能得到最优解。这也是为什么收银机的找零逻辑通常用贪心实现——简单且正确。

## 复杂度分析

| 问题        | 时间复杂度 | 空间复杂度       | 瓶颈     |
| ----------- | ---------- | ---------------- | -------- |
| 区间调度    | O(n log n) | O(1) 或 O(log n) | 排序     |
| 跳跃游戏    | O(n)       | O(1)             | 一次遍历 |
| 跳跃游戏 II | O(n)       | O(1)             | 一次遍历 |

- **排序类贪心**通常是 O(n log n)，瓶颈在排序
- **遍历类贪心**通常是 O(n)，只需一遍扫描
- 空间复杂度通常是 O(1)，因为贪心不需要额外存储子问题结果（这是它比 DP 省空间的原因）

## 贪心 vs 动态规划：如何判断用哪个？

```
            ┌─────────────────────┐
            │ 问题有最优子结构？   │
            └──────────┬──────────┘
                  是 │         否 → 考虑其他方法
                     ▼
            ┌─────────────────────┐
            │ 有贪心选择性质？     │
            │（局部最优 → 全局最优）│
            └──────────┬──────────┘
               是 │         否 │
                  ▼            ▼
             用贪心       用动态规划
           O(n log n)     O(n²)
```

**实用判断方法**：先猜一个贪心策略，然后试着找反例。找不到反例，大概率就是对的；找到反例，就用动态规划。

## 小结

贪心算法的核心就八个字：**每步最优，期望全局最优**。

面试中遇到贪心题，记住这几个套路：

1. **区间类问题** → 按结束时间排序，贪心选最早结束的
2. **跳跃/覆盖类问题** → 维护"最远可达"，一步步扩展
3. **分配/匹配类问题** → 排序后贪心匹配
4. **不确定能不能贪心** → 先举反例，举不出来就贪

最后记住：**贪心算法写起来简单，难的是证明正确性**。面试中除了写出代码，最好能简单解释"为什么这个贪心策略是对的"——比如区间调度可以用"交换论证法"证明：假设最优解不选最早结束的区间，把它替换成最早结束的那个，不会使结果变差 ✅
