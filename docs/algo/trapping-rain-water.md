---
title: 接雨水问题
description: 接雨水问题（Trapping Rain Water）- LeetCode 高频面试题
date: 2026-07-10 08:00:00
categories:
  - Algorithm
tags:
  - two-pointers
  - stack
  - dynamic-programming
sidebarSort: 60
---

# 接雨水问题（Trapping Rain Water）

上周五下午，产品经理兴冲冲地跑过来找你：\"我们要在首页加一个天气主题的 banner，用这种积水的视觉效果——你看这个图，下完雨之后，低洼的地方会存水，水量怎么算来着？\"

你一看那个设计稿，一排高低不齐的柱子，中间凹下去的地方确实能存水。这不就是 LeetCode 经典 Hard 题——**接雨水**吗？

面试造火箭，工作拧螺丝。但这次，火箭真的上天了 🚀

## 问题定义

先来看一下题目长啥样：

```
给定 n 个非负整数，表示一个高度图，每个柱子的宽度是 1，计算下雨之后能接多少雨水。

        ┌─────────────────────────────────────┐
  高度:  │ 0  1  0  2  1  0  1  3  2  1  2  1  │
        │ ┌──┐  ┌──────────┐  ┌──┐           │
  柱子:  │ █  █  █  ██  █  █  █  ███  █  ██  █ │
        │ █  █  █  ██  █  █  █  ███  █  ██  █ │
        └─────────────────────────────────────┘
  能接的水:        ▲      ▲▲▲      ▲      (答案是 6)
```

换句话说，每个位置能存多少水，取决于它**左边最高的柱子**和**右边最高的柱子**，取两者中较矮的那个，减去当前柱子的高度，就是这个位置能存的水量。

```typescript
// 每个位置能接的水量
water[i] = min(maxLeft[i], maxRight[i]) - height[i]
// 如果结果是负数，说明没有水坑，接 0 单位
```

### 为什么这个问题有难度？

暴力法很简单——对于每个位置，往左扫描找最大，往右扫描找最大，然后算差值。但这样是 **O(n²)** 的时间复杂度。

面试官会说：\"有没有更好的方法？\"

有，而且有三种经典解法，层层递进 👇

## 解法一：双指针（最优解）

这是面试官最喜欢的答案，时间 O(n)，空间 O(1)，直接秒杀！

### 核心思路

我们换个角度想：对于位置 i，它能存多少水，其实取决于**短板**——左边最高的柱子和右边最高的柱子，哪个更矮。

问题在于，我们需要同时知道左右两边的最大值。如果用两次遍历分别算出 leftMax 和 rightMax 数组，确实能解，但空间复杂度是 O(n)。

能不能**边走边算**？可以！

关键洞察：**当我们站在位置 i 时，我们其实不需要知道右边柱子的完整信息，只需要知道「当前见过的右边最高柱子」就够了。**

```typescript
        i
        ↓
  █  █     █  █
  █  █  █  █  █
  █  █  █  █  █

  ← 左边的最高 █  █  █
  
  我们只需要比较：leftMax[i] 和 rightMax[i]
  取较小的那一个，减去 height[i]
```

双指针的精髓在于：**哪边的高度更小，就移动哪边的指针**。

为什么？因为能存多少水，是由短板决定的。如果 leftMax < rightMax，说明左边的短板决定了水量，我们只需要处理左边，右边再高也没用——反正水量由左边决定。

### 图解过程

```
输入: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]

初始:
left=0, right=11
leftMax=0, rightMax=0
result=0

        i                          j
        ↓                          ↓
  █  █     █  █     █  █  █  █  █  █
  
  leftMax(0) < rightMax(0)? 
  不，leftMax == rightMax == 0，所以不接水
  
步骤 1: height[left]=0, height[right]=1
        leftMax=0, rightMax=1
        leftMax < rightMax → 移动 left
        result += 0 - 0 = 0

步骤 2: left=1, height[1]=1
        leftMax=1, rightMax=1
        leftMax == rightMax → 移动 left
        result += 0（1-1=0）

步骤 3: left=2, height[2]=0
        leftMax=1, rightMax=1
        leftMax < rightMax → 移动 left
        result += 1 - 0 = 1  ← 接了 1 单位水！

        █  █  █
        █  █  █  ← 水在这里
        █  █  █

步骤 4: left=3, height[3]=2
        leftMax=2, rightMax=1
        leftMax > rightMax → 移动 right
        
... 继续，直到 left 和 right 相遇
```

### 代码实现

```typescript
/**
 * 接雨水 —— 双指针解法
 * 
 * 时间复杂度: O(n) - 每个元素最多被访问两次
 * 空间复杂度: O(1) - 只用几个变量
 * 
 * 核心思想：能存多少水由短板决定，哪边更矮就处理哪边
 */
function trap(height: number[]): number {
  if (height.length === 0) return 0;

  let left = 0;              // 左指针
  let right = height.length - 1;  // 右指针
  let leftMax = 0;            // 左边最高的柱子
  let rightMax = 0;           // 右边最高的柱子
  let result = 0;

  // 当左右指针相遇时结束
  while (left < right) {
    // 为什么先处理 left？因为 leftMax 更小（如果更小的话）
    // 我们处理更小的那个边界，因为水量由短板决定
    if (height[left] < height[right]) {
      // 左边更矮，水量由左边决定
      if (height[left] >= leftMax) {
        // 当前柱子比左边最高的还高，更新最高值，但不接水
        leftMax = height[left];
      } else {
        // 当前柱子矮于左边最高，能接水
        result += leftMax - height[left];
      }
      left++; // 左边指针右移
    } else {
      // 右边更矮或一样高，水量由右边决定
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        result += rightMax - height[right];
      }
      right--; // 右边指针左移
    }
  }

  return result;
}

// 测试
console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5])); // 9
console.log(trap([])); // 0
console.log(trap([2, 0, 2])); // 2
```

### Go 版本

```go
package trapping

// trap 双指针解法 —— O(n) 时间，O(1) 空间
func trap(height []int) int {
    if len(height) == 0 {
        return 0
    }

    left, right := 0, len(height)-1
    leftMax, rightMax := 0, 0
    result := 0

    for left < right {
        if height[left] < height[right] {
            // 左边更矮，由左边决定
            if height[left] >= leftMax {
                leftMax = height[left]
            } else {
                result += leftMax - height[left]
            }
            left++
        } else {
            // 右边更矮或相等，由右边决定
            if height[right] >= rightMax {
                rightMax = height[right]
            } else {
                result += rightMax - height[right]
            }
            right--
        }
    }

    return result
}
```

### Python 版本

```python
def trap(height: list[int]) -> int:
    """
    接雨水 —— 双指针解法
    
    核心思路：能存多少水由短板决定
    - 如果 height[left] < height[right]，说明左边是短板
    - 如果 height[right] <= height[left]，说明右边是短板（或一样高）
    
    时间复杂度: O(n)
    空间复杂度: O(1)
    """
    if not height:
        return 0
    
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    result = 0
    
    while left < right:
        if height[left] < height[right]:
            # 左边是短板，处理左边
            left_max = max(left_max, height[left])
            result += left_max - height[left]
            left += 1
        else:
            # 右边是短板，处理右边
            right_max = max(right_max, height[right])
            result += right_max - height[right]
            right -= 1
    
    return result


# 测试
if __name__ == "__main__":
    print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))  # 6
    print(trap([4, 2, 0, 3, 2, 5]))  # 9
```

## 解法二：动态规划（预处理）

如果你没想到双指针，动态规划是一个更直觉的解法——先预处理，再查表。

### 思路

对于每个位置 i：
- `leftMax[i]` = max(height[0..i]) — 从左到右遍历时不断更新
- `rightMax[i]` = max(height[i..n-1]) — 从右到左遍历时不断更新

然后每个位置的水量 = min(leftMax[i], rightMax[i]) - height[i]

```
输入: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]

预处理后的数组:
height:    [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
leftMax:   [0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3]
rightMax:  [3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1]
water:     [0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0]
                        ↑  ↑  ↑  ↑  ↑  ↑
                       这里的水量分别是 1,1,1,1,1,1 → 总和 = 6
```

### 代码实现

```typescript
/**
 * 接雨水 —— 动态规划解法
 * 
 * 时间复杂度: O(n) - 三次遍历
 * 空间复杂度: O(n) - 需要额外数组存储 leftMax 和 rightMax
 */
function trap(height: number[]): number {
  const n = height.length;
  if (n === 0) return 0;

  // 预处理：计算每个位置左边最高的柱子
  const leftMax: number[] = new Array(n);
  leftMax[0] = height[0];
  for (let i = 1; i < n; i++) {
    leftMax[i] = Math.max(leftMax[i - 1], height[i]);
  }

  // 预处理：计算每个位置右边最高的柱子
  const rightMax: number[] = new Array(n);
  rightMax[n - 1] = height[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    rightMax[i] = Math.max(rightMax[i + 1], height[i]);
  }

  // 计算总水量
  let result = 0;
  for (let i = 0; i < n; i++) {
    const water = Math.min(leftMax[i], rightMax[i]) - height[i];
    result += Math.max(0, water); // 确保非负
  }

  return result;
}
```

### Python 版本

```python
def trap(height: list[int]) -> int:
    """接雨水 —— 动态规划"""
    n = len(height)
    if n == 0:
        return 0
    
    # 预处理：leftMax[i] 表示位置 i 左边最高的柱子
    left_max = [0] * n
    left_max[0] = height[0]
    for i in range(1, n):
        left_max[i] = max(left_max[i - 1], height[i])
    
    # 预处理：rightMax[i] 表示位置 i 右边最高的柱子
    right_max = [0] * n
    right_max[-1] = height[-1]
    for i in range(n - 2, -1, -1):
        right_max[i] = max(right_max[i + 1], height[i])
    
    # 计算每个位置能接的水量
    total = 0
    for i in range(n):
        water = min(left_max[i], right_max[i]) - height[i]
        total += max(0, water)
    
    return total
```

## 解法三：单调栈（扩展思维）

单调栈是接雨水的另一种经典解法，虽然不如双指针简洁，但在处理**柱状图中最大矩形**等变形题时更有用。

### 思路

维护一个**单调递减栈**。当遇到比栈顶更高的柱子时，说明找到了一个\"水坑\"的右边界。

```
栈中存的是柱子的索引，栈底到栈顶对应的柱子高度是递减的

      当前高度: 1
            ↓
  █  █  █  █
  █  █  █  █
  █  █  █  █
      ↑
      栈顶

遇到一个更高的柱子时，可以计算一个凹槽的水量
```

### 代码实现

```typescript
/**
 * 接雨水 —— 单调栈解法
 * 
 * 时间复杂度: O(n) - 每个柱子最多入栈出栈各一次
 * 空间复杂度: O(n) - 栈最坏情况下存储所有柱子
 * 
 * 思路：维护一个单调递减栈，当遇到比栈顶更高的柱子时，形成一个\"水坑\"
 */
function trap(height: number[]): number {
  const stack: number[] = []; // 存索引
  let result = 0;

  for (let i = 0; i < height.length; i++) {
    // 当遇到比栈顶更高的柱子时，计算水坑
    while (stack.length > 0 && height[i] > height[stack[stack.length - 1]]) {
      const bottomIdx = stack.pop()!; // 水坑底部

      // 如果栈空了，说明左边没有更高的柱子，跳过
      if (stack.length === 0) continue;

      // 左边是栈顶，右边是当前柱子
      const leftIdx = stack[stack.length - 1];
      const leftHeight = height[leftIdx];
      const rightHeight = height[i];
      const bottomHeight = height[bottomIdx];

      // 水坑宽度和高度
      const width = i - leftIdx - 1;
      const height_diff = Math.min(leftHeight, rightHeight) - bottomHeight;

      result += width * height_diff;
    }

    // 当前柱子的索引入栈（保持单调递减）
    stack.push(i);
  }

  return result;
}
```

### 图解单调栈过程

```
输入: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]

步骤:
i=0, h=0: stack=[], 入栈 [0]
i=1, h=1: stack=[0], 1>0, 弹出0计算
          width = 1-0-1=0, 不计水, 入栈 [1]
i=2, h=0: stack=[1], 0<1, 入栈 [1,2]
i=3, h=2: stack=[1,2], 2>0, 弹出2
          width = 3-1-1=1, height=min(1,2)-0=1, result+=1
          继续: 2>1, 弹出1
          width = 3-?-1, stack空, 跳过
          入栈 [3]
i=4, h=1: stack=[3], 1<2, 入栈 [3,4]
i=5, h=0: stack=[3,4], 0<1, 入栈 [3,4,5]
i=6, h=1: stack=[3,4,5], 1>0, 弹出5
          width = 6-4-1=1, height=min(1,1)-0=1, result+=1 (累计2)
          继续: 1=1 不大于, 入栈 [3,4,6]
... 继续处理，最后 result = 6
```

## 三种解法对比

| 解法 | 时间复杂度 | 空间复杂度 | 推荐指数 |
| ---- | ---------- | ---------- | -------- |
| 双指针 | O(n) | O(1) | ⭐⭐⭐⭐⭐ 面试首选 |
| 动态规划 | O(n) | O(n) | ⭐⭐⭐⭐ 容易想到 |
| 单调栈 | O(n) | O(n) | ⭐⭐⭐ 扩展思维 |

## 进阶变形

### 变形 1：求最大水量矩形

给定高度数组，找出能接水最多的矩形区域（LeetCode 84）。

```
输入: [0,1,0,2,1,0,1,3,2,1,2,1]

最大的矩形区域:
      ┌─────────────────┐
      │ ████████████████│ ← 高度 = 3 (最右边的3)
      │ ████████████████│
      │ ████████████████│
      └─────────────────┘
宽度 = 8 (从 index 2 到 index 9)
面积 = 3 × 8 = 24
```

这题用单调栈的思路解决，跟接雨水类似。

### 变形 2：逐行计算（更直观）

想象把二维的高度图逐行拆解，每行计算能填充的水量：

```typescript
/**
 * 逐行计算 —— 更直观但效率较低
 * 
 * 对于每个高度 level，从左到右扫描：
 * - 遇到柱子 → 重新开始计算
 * - 遇到空白 → 累积可能的水量
 * - 遇到另一根柱子 → 确认水量，累加到结果
 */
function trapByLevel(height: number[]): number {
  let level = 1;
  let totalWater = 0;

  while (true) {
    let started = false;  // 是否开始了计数
    let width = 0;        // 当前层的水量
    
    for (const h of height) {
      if (h >= level) {
        // 遇到柱子，确认水量
        totalWater += width;
        width = 0;
        started = true;
      } else if (started) {
        // 已经开始计数，遇到空白可以蓄水
        width++;
      }
    }
    
    // 如果整行没有遇到任何柱子，说明已经到顶了
    if (width === 0) break;
    
    level++;
  }

  return totalWater;
}
```

## 复杂度分析

### 双指针（最优解）

```
时间复杂度: O(n)
  - 解释: 左右指针各遍历数组一次，每个元素最多访问两次

空间复杂度: O(1)
  - 解释: 只用几个变量（left, right, leftMax, rightMax, result）
  - 不管输入数组多长，额外空间都是常数
```

### 动态规划

```
时间复杂度: O(n)
  - 解释: 三次线性遍历（算leftMax、算rightMax、算结果）

空间复杂度: O(n)
  - 解释: 需要两个额外数组存储 leftMax 和 rightMax
```

### 单调栈

```
时间复杂度: O(n)
  - 解释: 每个柱子最多入栈一次、出栈一次

空间复杂度: O(n)
  - 解释: 栈最坏情况是单调递减时，存所有柱子
```

## 真实业务场景

### 1. 地势积水模拟

游戏开发中的地形系统，需要计算下雨后各低洼地区的积水情况。可以用接雨水的思路快速估算。

### 2. 容器水量计算

工程中计算容器能装多少水，比如水坝设计、储液罐容量规划等。

### 3. 数据可视化

天气/水文应用中，将降雨数据可视化，需要计算各监测点之间的积水分布。

### 4. 交易区间分析（变形）

股票价格曲线中，计算\"水塘\"形态——价格下跌后回升，形成一个潜在的价值区间。类似的思想可以用于识别支撑位。

## 小结

接雨水是一道典型的**看起来复杂，其实套路清晰**的题目：

1. **核心公式**：`water[i] = min(maxLeft[i], maxRight[i]) - height[i]`
2. **最优解是双指针**：时间 O(n)，空间 O(1)，面试必备
3. **为什么双指针有效**：能存多少水由短板决定，处理短板就行了
4. **单调栈是扩展**：虽然这题用不上，但可以用来解决类似问题（最大矩形）

刷题不是目的，理解思想才是 ✨。下次产品经理让你算 banner 上的\"水坑\"面积，你可以自信地说：\"给我五分钟！\"

---

**推荐练习**：
- [LeetCode 42. Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) — 原题
- [LeetCode 84. Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/) — 单调栈进阶
- [LeetCode 407. Trapping Rain Water II](https://leetcode.com/problems/trapping-rain-water-ii/) — 二维版本，用 BFS + 堆

有任何问题欢迎留言，咱们下期见！👋
