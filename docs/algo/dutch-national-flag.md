---
title: 荷兰国旗问题（三向分区）
description: 荷兰国旗问题（Dutch National Flag Problem）—— 用三个指针在 O(n) 时间内完成三向分区
date: 2026-06-25 10:00:00
categories:
  - Algorithm
tags:
  - dutch-national-flag
  - two-pointers
  - partition
  - quicksort
sidebarSort: 54
---

# 荷兰国旗问题（Dutch National Flag Problem）

面试官："给你一个数组，里面只有 0、1、2 三种值，请你在 O(n) 时间内把它们排好序，只能遍历一次数组。"

你第一反应可能是——这不就是计数排序嘛？先扫一遍统计 0、1、2 各有多少个，然后再扫一遍填回去。确实可以，但需要两次遍历。有没有更优雅的方式？

有。这就是今天要讲的**荷兰国旗问题**——它不只是一道排序题，更是理解**三向分区**（3-way Partitioning）的钥匙。掌握了它，你会更深入地理解快速排序的优化、Dijkstra 三色标记法、甚至垃圾回收器的工作原理 🎯

## 问题引入

先来理解这个问题的背景。为什么叫"荷兰国旗"？

荷兰国旗有三种颜色的横条：红、白、蓝。假设你有一排乱序的彩色球，只有红、白、蓝三种颜色，你要把它们按"红色 → 白色 → 蓝色"的顺序排列，怎么做？

```
输入：🔴 🔵 ⚪ 🔴 ⚪ 🔵 🔴 ⚪ 🔵
输出：🔴 🔴 🔴 ⚪ ⚪ ⚪ 🔵 🔵 🔵

等价于数组：
输入：[2, 0, 1, 2, 1, 0, 2, 1, 0]
输出：[0, 0, 0, 1, 1, 1, 2, 2, 2]
```

如果你用排序算法，最快也是 O(n log n)。但题目只有三种值，我们能不能利用这个"有限值域"的特性做到 O(n)？

## 原理拆解

### 核心思路：三指针分区

想象把数组分成三个区域，用三个指针来维护边界：

```
[  0 区域  |  1 区域  |  未处理  |  2 区域  ]
           ↑         ↑         ↑
          low       mid      high
```

- `low` 指向 0 区域的右边界（下一个 0 应该放的位置）
- `mid` 指向当前正在检查的元素
- `high` 指向 2 区域的左边界（下一个 2 应该放的位置）

**规则很简单，就三条：**

1. 如果 `nums[mid] == 0`：把它和 `low` 位置交换，然后 `low++`，`mid++`
2. 如果 `nums[mid] == 1`：不用动，`mid++` 就行
3. 如果 `nums[mid] == 2`：把它和 `high` 位置交换，然后 `high--`（注意 mid 不动！因为换过来的元素还没检查过）

### 图解过程

用 `[2, 0, 1, 2, 1, 0]` 来走一遍：

```
初始状态：low=0, mid=0, high=5
[2, 0, 1, 2, 1, 0]
 ↑              ↑
low/mid       high

第1步：nums[mid]=2 → 和 high 交换 → high--
[0, 0, 1, 2, 1, 2]
 ↑           ↑
low/mid    high
（mid 不动，因为换过来的 0 还没检查）

第2步：nums[mid]=0 → 和 low 交换 → low++, mid++
[0, 0, 1, 2, 1, 2]
    ↑        ↑
   low/mid  high

第3步：nums[mid]=0 → 和 low 交换 → low++, mid++
[0, 0, 1, 2, 1, 2]
       ↑     ↑
      low/mid/high

第4步：nums[mid]=1 → 不动 → mid++
[0, 0, 1, 2, 1, 2]
       ↑  ↑
      low mid
         high

第5步：nums[mid]=2 → 和 high 交换 → high--
[0, 0, 1, 1, 2, 2]
       ↑  ↑
      low mid
         high
（mid 不动，换过来的 1 还没检查）

第6步：nums[mid]=1 → 不动 → mid++
[0, 0, 1, 1, 2, 2]
       ↑     ↑
      low   mid
            high

mid > high → 结束！✅
```

**为什么交换后 mid 不一定都要 ++？**

这是最容易搞混的地方。关键在于：从 `high` 换过来的元素是什么？你不知道！它可能是 0、1 或 2，所以必须留在原地再检查一次。而从 `low` 换过来的，要么是 1（之前检查过的），要么是 mid 自己（自己和自己换），所以可以安全地 ++。

## 代码实现

### TypeScript

```typescript
/**
 * 荷兰国旗问题（三向分区）
 * 核心思路：用 low、mid、high 三个指针，把数组分成三段
 * - [0, low)       → 全是 0
 * - [low, mid)     → 全是 1
 * - [mid, high]    → 未处理（待检查）
 * - (high, n-1]    → 全是 2
 */
function sortColors(nums: number[]): void {
  let low = 0;   // 0 区域的右边界
  let mid = 0;   // 当前检查位置
  let high = nums.length - 1; // 2 区域的左边界

  // 循环条件：mid <= high，因为 mid 指向的元素都是待处理的
  while (mid <= high) {
    if (nums[mid] === 0) {
      // 情况1：当前是 0，放到前面去
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
      // 为什么 mid 也要 ++？因为从 low 换过来的元素一定是 1
      // （low 之前的区域已经被处理过了，只有 0 和 1）
    } else if (nums[mid] === 1) {
      // 情况2：当前是 1，本来就在中间，不用动
      mid++;
    } else {
      // 情况3：当前是 2，放到后面去
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
      // 为什么 mid 不 ++？因为从 high 换过来的元素还没检查过！
      // 它可能是 0、1、2 中的任何一个，必须留在原地再判断一次
    }
  }
}

// 使用示例
const arr = [2, 0, 1, 2, 1, 0, 2, 1, 0];
sortColors(arr);
console.log(arr); // [0, 0, 0, 1, 1, 1, 2, 2, 2]
```

### Python

```python
from typing import List


def sort_colors(nums: List[int]) -> None:
    """荷兰国旗问题 —— 原地三向分区

    把数组分成三段：[0...low-1] 全是 0，[low...mid-1] 全是 1，[high+1...n-1] 全是 2
    中间 [mid...high] 是还没处理的区域
    """
    low, mid, high = 0, 0, len(nums) - 1

    while mid <= high:
        if nums[mid] == 0:
            # 0 放前面，交换后 low 和 mid 都往前走
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            # 1 就在中间，mid 往前走就行
            mid += 1
        else:
            # 2 放后面，交换后 high 往前走，但 mid 不动（换来的还没检查）
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1


# 使用示例
arr = [2, 0, 1, 2, 1, 0, 2, 1, 0]
sort_colors(arr)
print(arr)  # [0, 0, 0, 1, 1, 1, 2, 2, 2]
```

## 复杂度分析

| 指标 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 时间 | O(n)   | 每个元素最多被访问一次（mid 从左到右，high 从右到左） |
| 空间 | O(1)   | 只用了三个指针变量，原地操作 |

- **时间 O(n)**：看起来有 while 循环，但 `mid` 和 `high` 相向而行，`mid` 只增不减，`high` 只减不增，两者相遇就结束。所以总的移动次数是 n，时间复杂度就是 O(n)。
- **空间 O(1)**：没有用额外数组，所有的交换都是原地完成的。
