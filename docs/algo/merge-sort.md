---
title: 归并排序
description: Merge Sort 详解：分治思想、逆序对统计、四语言实现
date: 2026-05-18 03:00:00
categories:
  - Algorithm
tags:
  - mergesort
  - divide-and-conquer
  - sort
  - interview
sidebarSort: 29
---

# 归并排序（Merge Sort）

面试官说："写一个**稳定**的 O(n log n) 排序算法。"

快排不稳定（相等元素可能交换位置），堆排序也不稳定。唯一一个既稳定又是 O(n log n) 的经典排序算法，就是**归并排序**。

更厉害的是，归并排序的"合并"步骤可以被巧妙利用，解决一系列看似跟排序无关的问题——**逆序对计数**、**区间和的范围查询**、**翻转对**等等。这些题在面试中属于"Hard"级别，但一旦你理解了归并的合并过程，就能看出它们本质上就是归并排序的变体。

## 原理拆解

### 分治三步走

```
1. 分（Divide）：  把数组从中间分成两半
2. 治（Conquer）： 递归排序左右两半
3. 合（Merge）：   把两个有序数组合并成一个有序数组
```

```
          [38, 27, 43, 3, 9, 82, 10]
                 ↓ 分
        [38, 27, 43, 3]    [9, 82, 10]
            ↓ 分                ↓ 分
      [38, 27]  [43, 3]   [9, 82]  [10]
        ↓ 分      ↓ 分      ↓ 分
    [38] [27]  [43] [3]  [9] [82] [10]
        ↓ 合      ↓ 合      ↓ 合
    [27, 38]   [3, 43]   [9, 82]  [10]
            ↓ 合                ↓ 合
      [3, 27, 38, 43]     [9, 10, 82]
                 ↓ 合
        [3, 9, 10, 27, 38, 43, 82]
```

### 合并（Merge）过程

合并两个有序数组是归并排序的核心操作：

```
左数组：[3, 27, 38, 43]
右数组：[9, 10, 82]

比较 3 和 9 → 3 小，取 3
比较 27 和 9 → 9 小，取 9
比较 27 和 10 → 10 小，取 10
比较 27 和 82 → 27 小，取 27
比较 38 和 82 → 38 小，取 38
比较 43 和 82 → 43 小，取 43
右边剩余 → 取 82

结果：[3, 9, 10, 27, 38, 43, 82]
```

### 为什么归并排序是稳定的？

在合并时，当左右两个元素相等时，**优先取左边的**。这样就保证了相等元素的相对顺序不变。

```
左：[3, 5a]    右：[5b, 7]

合并：5a 和 5b 相等 → 先取 5a（左边的）→ 结果 [3, 5a, 5b, 7]
5a 仍在 5b 前面 → 稳定 ✅
```

## 代码实现

### TypeScript

```typescript
/**
 * 归并排序 —— TypeScript 实现
 * 分治 + 合并，稳定排序，O(n log n)
 */
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

/** 合并两个有序数组 */
function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0,
    j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      // <= 保证稳定性
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  // 剩余元素直接追加
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);

  return result;
}

// 测试
console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]
```

### 原地归并（优化空间）

上面的实现每次 merge 都创建新数组，空间开销大。优化版本用一个全局临时数组：

```typescript
/**
 * 原地归并排序 —— TypeScript 优化版
 * 用全局临时数组避免反复分配
 */
function mergeSortInPlace(arr: number[]): void {
  const temp = new Array(arr.length);
  sort(arr, 0, arr.length - 1, temp);
}

function sort(
  arr: number[],
  left: number,
  right: number,
  temp: number[],
): void {
  if (left >= right) return;

  const mid = left + Math.floor((right - left) / 2);
  sort(arr, left, mid, temp);
  sort(arr, mid + 1, right, temp);
  mergeInPlace(arr, left, mid, right, temp);
}

function mergeInPlace(
  arr: number[],
  left: number,
  mid: number,
  right: number,
  temp: number[],
): void {
  // 复制到临时数组
  for (let i = left; i <= right; i++) {
    temp[i] = arr[i];
  }

  let i = left,
    j = mid + 1,
    k = left;

  while (i <= mid && j <= right) {
    if (temp[i] <= temp[j]) {
      arr[k++] = temp[i++];
    } else {
      arr[k++] = temp[j++];
    }
  }
  while (i <= mid) arr[k++] = temp[i++];
  // j 的剩余元素已经在 arr 的正确位置，不需要拷贝
}
```

### Go

```go
package sort

// MergeSort 归并排序 —— Go 实现
func MergeSort(arr []int) []int {
	if len(arr) <= 1 {
		return arr
	}

	mid := len(arr) / 2
	left := MergeSort(arr[:mid])
	right := MergeSort(arr[mid:])

	return merge(left, right)
}

func merge(left, right []int) []int {
	result := make([]int, 0, len(left)+len(right))
	i, j := 0, 0

	for i < len(left) && j < len(right) {
		if left[i] <= right[j] {
			result = append(result, left[i])
			i++
		} else {
			result = append(result, right[j])
			j++
		}
	}

	result = append(result, left[i:]...)
	result = append(result, right[j:]...)
	return result
}
```

### Java

```java
import java.util.Arrays;

/**
 * 归并排序 —— Java 实现
 */
public class MergeSort {

    public static void mergeSort(int[] arr, int left, int right, int[] temp) {
        if (left >= right) return;

        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid, temp);
        mergeSort(arr, mid + 1, right, temp);
        merge(arr, left, mid, right, temp);
    }

    private static void merge(int[] arr, int left, int mid, int right, int[] temp) {
        System.arraycopy(arr, left, temp, left, right - left + 1);

        int i = left, j = mid + 1, k = left;
        while (i <= mid && j <= right) {
            if (temp[i] <= temp[j]) {
                arr[k++] = temp[i++];
            } else {
                arr[k++] = temp[j++];
            }
        }
        while (i <= mid) arr[k++] = temp[i++];
    }

    public static void main(String[] args) {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(arr, 0, arr.length - 1, new int[arr.length]);
        System.out.println(Arrays.toString(arr));
    }
}
```

### Python

```python
"""归并排序 —— Python 实现"""

def merge_sort(arr: list[int]) -> list[int]:
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return _merge(left, right)

def _merge(left: list[int], right: list[int]) -> list[int]:
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result


# 测试
print(merge_sort([38, 27, 43, 3, 9, 82, 10]))
# [3, 9, 10, 27, 38, 43, 82]
```

### 经典应用：逆序对计数

> LeetCode 剑指 Offer 51 / 493 变种
> 数组中的逆序对：如果 `i < j` 且 `arr[i] > arr[j]`，则 `(i, j)` 是一个逆序对。求总数。

**核心思路：在归并排序的合并步骤中，当右边的元素更小时，左边剩余的所有元素都比它大，直接计入逆序对数。**

```
合并 [3, 27, 38] 和 [9, 10]

3 < 9 → 取 3
27 > 9 → 取 9，逆序对 += 2（27 和 38 都比 9 大）
27 > 10 → 取 10，逆序对 += 2（27 和 38 都比 10 大）
取 27, 38

总逆序对 = 2 + 2 = 4 ✅
```

#### TypeScript

```typescript
/**
 * 逆序对计数 —— TypeScript 实现（基于归并排序）
 */
function countInversions(arr: number[]): number {
  const temp = new Array(arr.length);
  return mergeAndCount(arr, 0, arr.length - 1, temp);
}

function mergeAndCount(
  arr: number[],
  left: number,
  right: number,
  temp: number[],
): number {
  if (left >= right) return 0;

  const mid = left + Math.floor((right - left) / 2);
  let count = 0;

  count += mergeAndCount(arr, left, mid, temp);
  count += mergeAndCount(arr, mid + 1, right, temp);

  // 合并 + 计数
  for (let i = left; i <= right; i++) temp[i] = arr[i];

  let i = left,
    j = mid + 1,
    k = left;
  while (i <= mid && j <= right) {
    if (temp[i] <= temp[j]) {
      arr[k++] = temp[i++];
    } else {
      arr[k++] = temp[j++];
      count += mid - i + 1; // 关键：左边从 i 到 mid 的所有元素都 > temp[j]
    }
  }
  while (i <= mid) arr[k++] = temp[i++];

  return count;
}

// 测试
console.log(countInversions([7, 5, 6, 4])); // 5
// 逆序对：(7,5), (7,6), (7,4), (5,4), (6,4)
```

#### Go

```go
package sort

// CountInversions 逆序对计数 —— Go 实现
func CountInversions(arr []int) int {
	temp := make([]int, len(arr))
	return mergeAndCount(arr, 0, len(arr)-1, temp)
}

func mergeAndCount(arr []int, left, right int, temp []int) int {
	if left >= right {
		return 0
	}

	mid := left + (right-left)/2
	count := 0
	count += mergeAndCount(arr, left, mid, temp)
	count += mergeAndCount(arr, mid+1, right, temp)

	copy(temp[left:right+1], arr[left:right+1])

	i, j, k := left, mid+1, left
	for i <= mid && j <= right {
		if temp[i] <= temp[j] {
			arr[k] = temp[i]
			i++
		} else {
			arr[k] = temp[j]
			j++
			count += mid - i + 1
		}
		k++
	}
	for i <= mid {
		arr[k] = temp[i]
		i++
		k++
	}
	return count
}
```

#### Java

```java
/**
 * 逆序对计数 —— Java 实现
 */
public class CountInversions {

    public static long count(int[] arr) {
        return mergeAndCount(arr, 0, arr.length - 1, new int[arr.length]);
    }

    private static long mergeAndCount(int[] arr, int left, int right, int[] temp) {
        if (left >= right) return 0;

        int mid = left + (right - left) / 2;
        long count = 0;
        count += mergeAndCount(arr, left, mid, temp);
        count += mergeAndCount(arr, mid + 1, right, temp);

        System.arraycopy(arr, left, temp, left, right - left + 1);

        int i = left, j = mid + 1, k = left;
        while (i <= mid && j <= right) {
            if (temp[i] <= temp[j]) {
                arr[k++] = temp[i++];
            } else {
                arr[k++] = temp[j++];
                count += mid - i + 1;
            }
        }
        while (i <= mid) arr[k++] = temp[i++];
        return count;
    }
}
```

#### Python

```python
"""逆序对计数 —— Python 实现"""

def count_inversions(arr: list[int]) -> int:
    temp = [0] * len(arr)
    return _merge_and_count(arr, 0, len(arr) - 1, temp)

def _merge_and_count(arr, left, right, temp):
    if left >= right:
        return 0

    mid = (left + right) // 2
    count = 0
    count += _merge_and_count(arr, left, mid, temp)
    count += _merge_and_count(arr, mid + 1, right, temp)

    temp[left:right+1] = arr[left:right+1]

    i, j, k = left, mid + 1, left
    while i <= mid and j <= right:
        if temp[i] <= temp[j]:
            arr[k] = temp[i]
            i += 1
        else:
            arr[k] = temp[j]
            j += 1
            count += mid - i + 1
        k += 1

    while i <= mid:
        arr[k] = temp[i]
        i += 1
        k += 1
    return count
```

## 面试题精选

| 题号   | 题目                       | 归并排序应用                   | 难度 |
| ------ | -------------------------- | ------------------------------ | ---- |
| 912    | 排序数组                   | 标准归并排序                   | 中等 |
| 剑指51 | 数组中的逆序对             | 归并时计数                     | 困难 |
| 493    | 翻转对                     | 归并时统计 `arr[i] > 2*arr[j]` | 困难 |
| 315    | 计算右侧小于当前元素的个数 | 归并时统计                     | 困难 |
| 327    | 区间和的个数               | 归并 + 前缀和                  | 困难 |
| 23     | 合并 K 个升序链表          | 分治合并（归并思想）           | 困难 |
| 148    | 排序链表                   | 链表归并排序                   | 中等 |
| 88     | 合并两个有序数组           | 从后往前合并                   | 简单 |

## 业务场景

### 1. 大规模数据外部排序

当数据量大到内存装不下时（比如 100GB 日志文件排序），归并排序是唯一选择：

1. 把数据分成小块，每块读入内存用快排排序，写回磁盘
2. 多路归并：同时打开多个有序文件，用最小堆做 K 路合并

MySQL 的 `ORDER BY` 在数据量大时就用外部归并排序。Hadoop/Spark 的 Shuffle 阶段也是多路归并。

### 2. 链表排序

链表不适合快排（随机访问效率低），但非常适合归并排序：

- 找中点：快慢指针 O(n)
- 合并：链表合并 O(n)，不需要额外空间（改指针就行）

所以**链表排序的标准解法就是归并排序**，空间 O(1)（不算递归栈）。

### 3. 逆序对分析

逆序对的数量可以衡量数组的"有序程度"：

- 完全有序 → 0 个逆序对
- 完全逆序 → n(n-1)/2 个逆序对

在推荐系统中，可以用逆序对来衡量推荐列表与用户偏好的偏离程度。在统计学中，Kendall tau 距离就是基于逆序对定义的。

### 4. Java Collections.sort 底层

Java 的 `Arrays.sort()` 对对象数组用的是 **TimSort**（归并排序 + 插入排序的混合）。TimSort 利用了现实数据中已有的有序片段（run），先对每个 run 做插入排序，再归并所有 run。对于近乎有序的数据，TimSort 接近 O(n)。

Python 的 `list.sort()` 也是 TimSort。

## 复杂度分析

| 指标         | 值         | 说明                  |
| ------------ | ---------- | --------------------- |
| 时间（最好） | O(n log n) | 无论如何都要分治到底  |
| 时间（平均） | O(n log n) | 跟输入无关            |
| 时间（最坏） | O(n log n) | 没有快排的 O(n²) 问题 |
| 空间         | O(n)       | 合并需要临时数组      |
| 稳定性       | ✅ 稳定    | 相等元素保持原顺序    |

归并排序的优势：**时间复杂度始终是 O(n log n)，不受输入影响**。快排在最坏情况下会退化到 O(n²)，但归并不会。

代价是需要 O(n) 额外空间（合并用的临时数组）。快排只需要 O(log n) 的递归栈空间。

## 小结

归并排序的核心就三步：**对半切、递归排、双指针合**。

面试中记住这些要点：

1. **稳定性**：合并时 `<=` 保证左边相等的先取，这是归并排序稳定的原因
2. **逆序对计数**：合并时如果右边更小，左边剩余元素数就是新增的逆序对数
3. **链表排序**：快慢指针找中点 + 归并，不需要额外空间
4. **分治思想**：归并排序的分治模式是很多 Hard 题的解题框架

归并口诀：**对半切分治排，双指针合并来。稳定 n log n，逆序对也能猜** ✅
