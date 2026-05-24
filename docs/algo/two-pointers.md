---
title: 双指针
description: Two Pointers 详解：对撞指针、快慢指针、滑动窗口，四语言实现
date: 2026-05-17 20:30:00
categories:
  - Algorithm
tags:
  - two-pointers
  - sliding-window
  - algorithm
  - interview
sidebarSort: 21
---

# 双指针（Two Pointers）

双指针是一种用两个变量在数组/链表上同向或相向移动的技巧，可以把很多 O(n²) 的暴力解法优化到 O(n)。

## 三种模式

### 1. 对撞指针（首尾双指针）

两个指针分别从数组首尾向中间靠拢。适用于**有序数组**。

```
left →                    ← right
[1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### 2. 快慢指针

两个指针从同一起点出发，一个走得快一个走得慢。适用于**链表找环、找中点**。

```
slow:   → → → →
fast:   → → → → → → → →
```

### 3. 同向双指针（滑动窗口）

两个指针同向移动，形成一个"窗口"。适用于**连续子数组/子串问题**。

```
left     right
  ↓        ↓
  [a b c d e f g]
   └─ 窗口 ─┘
```

## 代码实现

### 对撞指针：两数之和 II

> LeetCode 167. Two Sum II（有序数组）

#### TypeScript

```typescript
function twoSum(numbers: number[], target: number): number[] {
  let left = 0,
    right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  return [];
}
```

#### Go

```go
package twopointers

func TwoSum(numbers []int, target int) []int {
	left, right := 0, len(numbers)-1
	for left < right {
		sum := numbers[left] + numbers[right]
		if sum == target { return []int{left + 1, right + 1} }
		if sum < target { left++ } else { right-- }
	}
	return nil
}
```

#### Java

```java
public class TwoSumII {
    public static int[] solve(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) return new int[]{left + 1, right + 1};
            if (sum < target) left++;
            else right--;
        }
        return new int[0];
    }
}
```

#### Python

```python
"""两数之和 II —— Python 实现"""
def two_sum(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    while left < right:
        s = numbers[left] + numbers[right]
        if s == target: return [left + 1, right + 1]
        if s < target: left += 1
        else: right -= 1
    return []
```

### 快慢指针：判断链表是否有环

> LeetCode 141. Linked List Cycle

#### TypeScript

```typescript
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number) {
    this.val = val;
    this.next = null;
  }
}

function hasCycle(head: ListNode | null): boolean {
  let slow = head,
    fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

#### Go

```go
package twopointers

type ListNode struct {
	Val  int
	Next *ListNode
}

func HasCycle(head *ListNode) bool {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
		if slow == fast { return true }
	}
	return false
}
```

#### Python

```python
"""判断链表是否有环 —— Python 实现"""
class ListNode:
    def __init__(self, val): self.val = val; self.next = None

def has_cycle(head: ListNode | None) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast: return True
    return False
```

### 滑动窗口：无重复字符的最长子串

> LeetCode 3. Longest Substring Without Repeating Characters

#### TypeScript

```typescript
function lengthOfLongestSubstring(s: string): number {
  const seen = new Map<string, number>();
  let maxLen = 0,
    left = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (seen.has(ch) && seen.get(ch)! >= left) {
      left = seen.get(ch)! + 1;
    }
    seen.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
```

#### Python

```python
"""无重复字符的最长子串 —— Python 实现"""
def length_of_longest_substring(s: str) -> int:
    seen = {}
    max_len = left = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
        seen[ch] = right
        max_len = max(max_len, right - left + 1)
    return max_len
```

### 盛水最多的容器

> LeetCode 11. Container With Most Water

#### TypeScript

```typescript
function maxArea(height: number[]): number {
  let left = 0,
    right = height.length - 1,
    maxWater = 0;
  while (left < right) {
    const water = Math.min(height[left], height[right]) * (right - left);
    maxWater = Math.max(maxWater, water);
    // 移动较矮的那一边（只有变高才可能增大面积）
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxWater;
}
```

## 面试题精选

| 题号 | 题目                 | 指针类型        | 难度 |
| ---- | -------------------- | --------------- | ---- |
| 167  | 两数之和 II          | 对撞指针        | 中等 |
| 11   | 盛最多水的容器       | 对撞指针        | 中等 |
| 15   | 三数之和             | 排序 + 对撞指针 | 中等 |
| 141  | 环形链表             | 快慢指针        | 简单 |
| 142  | 环形链表 II          | 快慢指针找入口  | 中等 |
| 3    | 无重复字符的最长子串 | 滑动窗口        | 中等 |
| 76   | 最小覆盖子串         | 滑动窗口        | 困难 |
| 27   | 移除元素             | 快慢指针        | 简单 |
| 75   | 颜色分类             | 三指针          | 中等 |
| 283  | 移动零               | 快慢指针        | 简单 |

## 复杂度分析

所有双指针解法的时间复杂度都是 **O(n)**——每个元素最多被两个指针各访问一次。空间通常是 O(1)（不含哈希表辅助的情况）。

## 小结

- **有序数组求和** → 对撞指针
- **链表找环/找中点** → 快慢指针
- **子数组/子串问题** → 滑动窗口（同向双指针）
- **原地修改数组** → 快慢指针（快指针遍历，慢指针写入）

口诀：**有序首尾对撞走，链表环中快慢追。窗口滑动左右移，双指一出 O(n) 归** ✅
