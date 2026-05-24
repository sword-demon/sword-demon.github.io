---
title: 二分查找
description: Binary Search 详解：标准模板、边界处理、旋转数组，四语言实现
date: 2026-05-17 19:50:00
categories:
  - Algorithm
tags:
  - binary-search
  - algorithm
  - interview
sidebarSort: 19
---

# 二分查找（Binary Search）

二分查找是面试中最容易"写对思路、写错边界"的算法。核心思想：**在有序数组中，每次排除一半的搜索空间**。

## 原理拆解

```
有序数组 [1, 3, 5, 7, 9, 11, 13]，找 7：

left=0, right=6, mid=3 → arr[3]=7 → 找到了！

找 9：
left=0, right=6, mid=3 → arr[3]=7 < 9 → left=4
left=4, right=6, mid=5 → arr[5]=11 > 9 → right=4
left=4, right=4, mid=4 → arr[4]=9 → 找到了！
```

### 三种模板

**模板一：标准查找（找精确值）**

```typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0,
    right = arr.length - 1;
  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
```

**模板二：找左边界（第一个 >= target 的位置）**

```typescript
function lowerBound(arr: number[], target: number): number {
  let left = 0,
    right = arr.length;
  while (left < right) {
    const mid = left + ((right - left) >> 1);
    if (arr[mid] < target) left = mid + 1;
    else right = mid;
  }
  return left;
}
```

**模板三：找右边界（最后一个 <= target 的位置）**

```typescript
function upperBound(arr: number[], target: number): number {
  let left = 0,
    right = arr.length;
  while (left < right) {
    const mid = left + ((right - left) >> 1);
    if (arr[mid] <= target) left = mid + 1;
    else right = mid;
  }
  return left - 1;
}
```

## 代码实现

### Go

```go
package search

// BinarySearch 标准二分查找
func BinarySearch(arr []int, target int) int {
	left, right := 0, len(arr)-1
	for left <= right {
		mid := left + (right-left)/2
		if arr[mid] == target {
			return mid
		}
		if arr[mid] < target {
			left = mid + 1
		} else {
			right = mid - 1
		}
	}
	return -1
}

// LowerBound 找左边界
func LowerBound(arr []int, target int) int {
	left, right := 0, len(arr)
	for left < right {
		mid := left + (right-left)/2
		if arr[mid] < target {
			left = mid + 1
		} else {
			right = mid
		}
	}
	return left
}
```

### Java

```java
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}
```

### Python

```python
"""二分查找 —— Python 实现"""
import bisect

def binary_search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Python 内置
# bisect.bisect_left(arr, target)  左边界
# bisect.bisect_right(arr, target) 右边界
```

### 经典问题：搜索旋转排序数组

> LeetCode 33. Search in Rotated Sorted Array

```typescript
function search(nums: number[], target: number): number {
  let left = 0,
    right = nums.length - 1;
  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    if (nums[mid] === target) return mid;

    // 判断哪半边是有序的
    if (nums[left] <= nums[mid]) {
      // 左半边有序
      if (nums[left] <= target && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      // 右半边有序
      if (nums[mid] < target && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}
```

## 面试题精选

| 题号 | 题目                         | 二分变体     | 难度 |
| ---- | ---------------------------- | ------------ | ---- |
| 704  | 二分查找                     | 标准模板     | 简单 |
| 34   | 排序数组中查找元素的首尾位置 | 左右边界     | 中等 |
| 33   | 搜索旋转排序数组             | 判断有序半边 | 中等 |
| 153  | 寻找旋转排序数组中的最小值   | 二分找拐点   | 中等 |
| 875  | 爱吃香蕉的珂珂               | 二分答案     | 中等 |
| 410  | 分割数组的最大值             | 二分答案     | 困难 |
| 69   | x 的平方根                   | 二分答案     | 简单 |
| 287  | 寻找重复数                   | 二分计数     | 中等 |

## 复杂度分析

| 指标 | 值       |
| ---- | -------- |
| 时间 | O(log n) |
| 空间 | O(1)     |

## 小结

二分的难点不在思路，在**边界**。记住三种模板对应三种场景。

- `while (left <= right)` + `left = mid+1, right = mid-1` → 精确查找
- `while (left < right)` + `right = mid` → 左边界
- `while (left < right)` + `left = mid+1` → 右边界

口诀：**有序数组找目标，每次砍半效率高。边界模板要记牢，left right 别搞淆** ✅
