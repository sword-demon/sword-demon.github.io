---
title: Kadane 算法（最大子数组和）
description: Kadane 算法（Maximum Subarray）—— 用动态规划在一维数组上找最大连续子数组和
date: 2026-06-06 20:00:00
categories:
  - Algorithm
tags:
  - kadane
  - dynamic-programming
  - greedy
sidebarSort: 38
---

# Kadane 算法（最大子数组和）

你打开股票 App，看到某只股票过去 30 天的每日涨跌：

```
[-2, 1, -3, 4, -1, 2, 1, -5, 4]
```

你心里盘算：如果我在某一天买入，之后某一天卖出，**哪段时间买入赚得最多？** 换句话说，哪段连续日子的涨跌总和最大？

这个问题本质上就是经典的 **最大子数组和（Maximum Subarray）** 问题，解法叫 **Kadane 算法**。它是 LeetCode 第 53 题，也是面试中被问到频率最高的 DP 入门题之一。简单到只有几行代码，但思想却非常精妙。

## 为什么需要它？

暴力法当然能解决——枚举所有子数组，算和，取最大值。但枚举所有子数组是 O(n²)，对于百万级数组就太慢了。

Kadane 算法只需要 **一次遍历**，时间 O(n)，空间 O(1)。而且它的核心思想是动态规划的一个经典范式：**"前面的结果能不能为我所用？"**

## 原理拆解

### 核心问题

给定一个整数数组 `nums`（可能有负数），找到一个**连续子数组**，使得它的元素之和最大。

### 暴力思路 vs Kadane 思路

```
暴力法：枚举所有子数组

nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

子数组 [-2]            和 = -2
子数组 [-2, 1]         和 = -1
子数组 [-2, 1, -3]     和 = -4
...
子数组 [4, -1, 2, 1]   和 = 6  ← 最大！
...总共 n*(n+1)/2 个子数组，O(n²)
```

Kadane 的思路：**走到每个位置时，我只关心一件事——"以当前位置结尾的最大子数组和是多少？"**

### 状态定义

```
dp[i] = 以 nums[i] 结尾的最大子数组和
```

注意关键词："以 nums[i] **结尾**"。我们不问"到目前为止全局最大是多少"，而是问"以我结尾的最长是多少"。

### 状态转移

走到 `nums[i]` 时，我有两个选择：

1. **接在前面的子数组后面**：`dp[i-1] + nums[i]`
2. **自己重新开始**：`nums[i]`（如果前面的和是负数，不如不要）

哪个大选哪个：

```
dp[i] = max(dp[i-1] + nums[i], nums[i])
```

### 图解过程

```
nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

i=0: nums=-2  dp=-2   接前面？没前面。自己开始。         max_so_far=-2
i=1: nums= 1  dp= 1   接前面(-2+1=-1) vs 自己(1) → 1   max_so_far=1
i=2: nums=-3  dp=-2   接前面(1-3=-2) vs 自己(-3) → -2   max_so_far=1
i=3: nums= 4  dp= 4   接前面(-2+4=2) vs 自己(4) → 4    max_so_far=4
i=4: nums=-1  dp= 3   接前面(4-1=3) vs 自己(-1) → 3    max_so_far=4
i=5: nums= 2  dp= 5   接前面(3+2=5) vs 自己(2) → 5     max_so_far=5
i=6: nums= 1  dp= 6   接前面(5+1=6) vs 自己(1) → 6     max_so_far=6  ✅
i=7: nums=-5  dp= 1   接前面(6-5=1) vs 自己(-5) → 1    max_so_far=6
i=8: nums= 4  dp= 5   接前面(1+4=5) vs 自己(4) → 5     max_so_far=6

答案：6，对应子数组 [4, -1, 2, 1]
```

### 关键洞察

为什么"以当前位置结尾"就够了？因为全局最大子数组一定以**某个位置结尾**。我们枚举了所有可能的结尾位置，取最大值，就覆盖了全局最优。

这就是动态规划的精髓：**定义好状态，局部最优自然推出全局最优**。

## 代码实现

### TypeScript

```typescript
/**
 * Kadane 算法 —— 求最大子数组和
 * 核心思想：dp[i] = max(dp[i-1] + nums[i], nums[i])
 * 空间优化：dp[i] 只依赖 dp[i-1]，用一个变量就够了
 */
function maxSubArray(nums: number[]): number {
  let currentSum = nums[0]; // 以当前位置结尾的最大子数组和
  let maxSum = nums[0];     // 全局最大子数组和

  for (let i = 1; i < nums.length; i++) {
    // 核心决策：接前面的，还是自己重新开始？
    currentSum = Math.max(currentSum + nums[i], nums[i]);
    // 更新全局最大值
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// === 进阶：返回子数组的起止位置 ===
function maxSubArrayWithRange(nums: number[]): {
  maxSum: number;
  start: number;
  end: number;
} {
  let currentSum = nums[0];
  let maxSum = nums[0];
  let tempStart = 0; // 当前子数组的临时起点
  let start = 0;     // 最终子数组的起点
  let end = 0;       // 最终子数组的终点

  for (let i = 1; i < nums.length; i++) {
    if (currentSum + nums[i] < nums[i]) {
      // 前面的和拖后腿了，从当前位置重新开始
      currentSum = nums[i];
      tempStart = i;
    } else {
      // 接在前面的子数组后面
      currentSum += nums[i];
    }

    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }
  }

  return { maxSum, start, end };
}

// 使用示例
const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log(maxSubArray(nums)); // 6

const result = maxSubArrayWithRange(nums);
console.log(result); // { maxSum: 6, start: 3, end: 6 }
console.log(nums.slice(result.start, result.end + 1)); // [4, -1, 2, 1]
```

### Go

```go
package kadane

// MaxSubArray Kadane 算法求最大子数组和
// 核心思想：每个位置只做一个决策——"接前面"还是"自己开始"
func MaxSubArray(nums []int) int {
	currentSum := nums[0] // 以当前位置结尾的最大子数组和
	maxSum := nums[0]     // 全局最大

	for i := 1; i < len(nums); i++ {
		// 接前面 (currentSum+nums[i]) vs 自己开始 (nums[i])
		if currentSum+nums[i] > nums[i] {
			currentSum = currentSum + nums[i]
		} else {
			currentSum = nums[i]
		}
		// 更新全局最大
		if currentSum > maxSum {
			maxSum = currentSum
		}
	}

	return maxSum
}

// MaxSubArrayWithRange 返回最大子数组和及起止位置
func MaxSubArrayWithRange(nums []int) (maxSum, start, end int) {
	currentSum := nums[0]
	maxSum = nums[0]
	tempStart := 0
	start = 0
	end = 0

	for i := 1; i < len(nums); i++ {
		if currentSum+nums[i] < nums[i] {
			currentSum = nums[i]
			tempStart = i
		} else {
			currentSum += nums[i]
		}

		if currentSum > maxSum {
			maxSum = currentSum
			start = tempStart
			end = i
		}
	}

	return
}
```

### Java

```java
/**
 * Kadane 算法 —— 最大子数组和
 * LeetCode 53. Maximum Subarray
 *
 * 核心思想：dp[i] = max(dp[i-1] + nums[i], nums[i])
 * 空间优化后只需要一个变量
 */
public class Kadane {

    /**
     * 求最大子数组和
     * 为什么用 Math.max 而不是 if-else：代码更简洁，逻辑更清晰
     */
    public static int maxSubArray(int[] nums) {
        int currentSum = nums[0]; // 以当前位置结尾的最大子数组和
        int maxSum = nums[0];     // 全局最大子数组和

        for (int i = 1; i < nums.length; i++) {
            // 核心决策：接前面的 vs 自己重新开始
            currentSum = Math.max(currentSum + nums[i], nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }

        return maxSum;
    }

    /**
     * 进阶版：同时返回子数组的起止位置
     * 为什么需要 tempStart：当前位置可能开启一个新的子数组
     */
    public static int[] maxSubArrayWithRange(int[] nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        int tempStart = 0, start = 0, end = 0;

        for (int i = 1; i < nums.length; i++) {
            if (currentSum + nums[i] < nums[i]) {
                currentSum = nums[i];
                tempStart = i;
            } else {
                currentSum += nums[i];
            }

            if (currentSum > maxSum) {
                maxSum = currentSum;
                start = tempStart;
                end = i;
            }
        }

        return new int[]{maxSum, start, end};
    }

    public static void main(String[] args) {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println(maxSubArray(nums)); // 6

        int[] result = maxSubArrayWithRange(nums);
        System.out.printf("maxSum=%d, range=[%d, %d]%n", result[0], result[1], result[2]);
        // maxSum=6, range=[3, 6]
    }
}
```

### Python

```python
from typing import NamedTuple


class SubArrayResult(NamedTuple):
    """子数组结果，包含最大和及起止位置"""
    max_sum: int
    start: int
    end: int


def max_sub_array(nums: list[int]) -> int:
    """Kadane 算法 —— 求最大子数组和

    核心思想：走到每个位置，决定"接在前面的子数组后面"还是"从自己开始"。
    为什么这样做有效：全局最大子数组一定以某个位置结尾，
    我们枚举了所有结尾位置，取最大值就覆盖了全局最优。

    Args:
        nums: 整数数组（可能包含负数）

    Returns:
        最大连续子数组和
    """
    current_sum = nums[0]  # 以当前位置结尾的最大子数组和
    max_sum = nums[0]      # 全局最大

    for i in range(1, len(nums)):
        # 核心决策：接前面 vs 自己开始
        current_sum = max(current_sum + nums[i], nums[i])
        max_sum = max(max_sum, current_sum)

    return max_sum


def max_sub_array_with_range(nums: list[int]) -> SubArrayResult:
    """进阶版：返回最大子数组和及起止位置

    为什么需要 temp_start：当"自己重新开始"时，记录新的起点。
    只有找到更大的和时才更新最终的 start 和 end。
    """
    current_sum = nums[0]
    max_sum = nums[0]
    temp_start = 0
    start = 0
    end = 0

    for i in range(1, len(nums)):
        if current_sum + nums[i] < nums[i]:
            current_sum = nums[i]
            temp_start = i
        else:
            current_sum += nums[i]

        if current_sum > max_sum:
            max_sum = current_sum
            start = temp_start
            end = i

    return SubArrayResult(max_sum, start, end)


if __name__ == "__main__":
    nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
    print(max_sub_array(nums))  # 6

    result = max_sub_array_with_range(nums)
    print(result)  # SubArrayResult(max_sum=6, start=3, end=6)
    print(nums[result.start : result.end + 1])  # [4, -1, 2, 1]
```

## 变体：环形数组的最大子数组和

面试官可能会追问：**如果数组是环形的呢？**（LeetCode 918）

环形数组意味着子数组可以从尾部绕到头部，比如 `[1, -2, 3, -2]` 环形后，`[3, -2, 1]` 也是合法子数组。

### 思路

环形数组的最大子数组和 = max(情况一, 情况二)：

```
情况一：最大子数组不跨首尾 → 直接用 Kadane 算法

情况二：最大子数组跨首尾 → 首尾相连的部分
  跨首尾的部分 = 总和 - 中间连续子数组
  中间的连续子数组是"最小子数组和"
  所以：跨首尾最大 = 总和 - 最小子数组和
```

```
数组：[A, B, C, D, E]

情况一（不跨）：  [... B C D ...]    → 正常 Kadane
情况二（跨）：  [E ... A] [B C D] [E ... A]
                ↑ 跨首尾的那部分 = 总和 - 中间最小和
```

```typescript
/**
 * 环形数组的最大子数组和
 * 关键洞察：跨首尾 = 总和 - 中间最小子数组
 * 特殊情况：如果所有元素都是负数，最小子数组就是整个数组，
 *           此时总和 - 最小和 = 0，但答案不能是空子数组，
 *           所以要取 maxSum 作为兜底
 */
function maxSubarraySumCircular(nums: number[]): number {
  let currentMax = nums[0];
  let maxSum = nums[0];
  let currentMin = nums[0];
  let minSum = nums[0];
  let totalSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // 正常 Kadane：求最大子数组和
    currentMax = Math.max(currentMax + nums[i], nums[i]);
    maxSum = Math.max(maxSum, currentMax);

    // 反向 Kadane：求最小子数组和
    currentMin = Math.min(currentMin + nums[i], nums[i]);
    minSum = Math.min(minSum, currentMin);

    totalSum += nums[i];
  }

  // 如果 maxSum < 0，说明全是负数，直接返回 maxSum（不能取空子数组）
  if (maxSum < 0) return maxSum;

  // 否则取正常 Kadane 和"环形情况"的较大值
  return Math.max(maxSum, totalSum - minSum);
}
```

## 变体：买卖股票的最佳时机

最大子数组和的思想可以直接用到股票问题上。LeetCode 121：给定每天的股价，只能买卖一次，求最大利润。

**技巧**：把股价数组转成**差价数组**（今天比昨天涨了多少），然后对差价数组求最大子数组和，就是最大利润。

```typescript
function maxProfit(prices: number[]): number {
  if (prices.length < 2) return 0;

  // 转成差价数组，然后用 Kadane
  let maxProfit = 0;
  let currentProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    // 这就是 Kadane：接前面的差价 vs 自己重新开始
    currentProfit = Math.max(currentProfit + diff, diff);
    maxProfit = Math.max(maxProfit, currentProfit);
  }

  return maxProfit;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5（第2天买，第5天卖）
```

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
| ---- | ---------- | ---------- |
| Kadane 算法 | O(n) | O(1) |
| 带位置追踪 | O(n) | O(1) |
| 环形数组变体 | O(n) | O(1) |

- **时间 O(n)**：一次遍历，每个位置只做一次比较和一次加法。
- **空间 O(1)**：状态压缩后只用 `currentSum` 和 `maxSum` 两个变量。如果要回溯子数组位置，再加几个变量，仍然是 O(1)。

## 实际应用

### 1. 股票交易分析

如上所述，最大子数组和直接对应"一次买卖的最大利润"。量化交易系统中，快速找出最佳买卖窗口是基础功能。

### 2. 图像处理中的最大矩形

在图像分析中，求直方图中的最大矩形面积问题可以转化为一维最大子数组问题的变体。Kadane 算法的思想（"接前面还是自己开始"）在二维问题上也有类似的推广。

### 3. 信号处理

在信号分析中，找出连续时间段内信号强度最大的区间，就是最大子数组和问题。这在语音识别、地震检测等领域有直接应用。

### 4. 生物信息学

DNA 序列分析中，给碱基打分后（比如 GC 含量高给正分，AT 含量高给负分），找出得分最高的连续片段，帮助识别基因编码区域。

## 相关 LeetCode 题目

| 题号 | 题目 | 难度 | 说明 |
| ---- | ---- | ---- | ---- |
| 53 | Maximum Subarray | Medium | Kadane 原版 |
| 918 | Maximum Sum Circular Subarray | Medium | 环形数组变体 |
| 121 | Best Time to Buy and Sell Stock | Easy | 差价数组 + Kadane |
| 152 | Maximum Product Subarray | Medium | 需要同时维护最大和最小值 |
| 1749 | Maximum Absolute Sum of Any Subarray | Medium | 求最大绝对值和 |

## 小结

Kadane 算法的精髓就一句话：**"接前面，还是自己开始？"**

- ✅ 时间 O(n)，空间 O(1)，效率极致
- ✅ 思路简洁，代码只有几行，面试非常好写
- ✅ 变体丰富：环形数组、股票问题、乘积最大子数组都能复用核心思想
- ✅ 体现动态规划的本质——**最优子结构 + 重叠子问题**

它是我最推荐先掌握的 DP 入门题。理解了"以当前位置结尾"这个状态定义方式，后面学背包问题、区间 DP 都会轻松很多 💪
