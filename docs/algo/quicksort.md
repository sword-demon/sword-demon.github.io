---
title: 快速排序与快速选择
description: QuickSort 和 QuickSelect 详解：从排序到第 K 大元素，四语言实现
date: 2026-05-17 22:00:00
categories:
  - Algorithm
tags:
  - quicksort
  - quickselect
  - sort
  - divide-and-conquer
  - interview
sidebarSort: 24
---

# 快速排序与快速选择（QuickSort & QuickSelect）

面试官最爱问的排序算法是哪个？不是冒泡，不是归并，而是**快速排序**。

为什么？因为快排的平均时间复杂度是 O(n log n)，常数因子极小，实际运行速度碾压其他 O(n log n) 排序。几乎所有语言的标准库排序底层都是快排的变体（C 的 `qsort`、Go 的 `sort`、Java 的 `Dual-Pivot QuickSort`）。

更有意思的是，快排的核心思想——**分区（Partition）**——还能直接解决另一个经典面试题：**"找出数组中第 K 大的元素"**。这就是快速选择（QuickSelect），它把"排序再取值"的 O(n log n) 优化到了 **O(n)**。

## 原理拆解

### 快速排序的核心思想：分治

```
选一个基准值（pivot）
     ↓
把数组分成三部分：
  [ < pivot ]  [ pivot ]  [ > pivot ]
     ↓              ↓           ↓
  递归排序      位置已确定    递归排序
     ↓              ↓           ↓
  合并结果 → 有序数组
```

### 一次 Partition 的过程

以数组 `[3, 6, 8, 10, 1, 2, 1]` 为例，选最后一个元素 `1` 作为基准：

```
初始：  [3, 6, 8, 10, 1, 2, 1]        pivot = 1（最后元素）
                                        i 指向"下一个该放小值的位置"

遍历：
  3 > 1 → 不动
  6 > 1 → 不动
  8 > 1 → 不动
  10 > 1 → 不动
  1 <= 1 → 交换 arr[i] 和 1 → [1, 6, 8, 10, 3, 2, 1]  i++
  2 > 1 → 不动

最后：  交换 pivot 到 i 的位置 → [1, 6, 8, 10, 3, 2, 1]
        pivot 在索引 0，左边都 <= 1，右边都 > 1
```

**Lomuto 分区方案**（以最后一个元素为 pivot）的核心代码：

```
partition(arr, low, high):
    pivot = arr[high]
    i = low          // i 指向"下一个该放 <= pivot 元素的位置"
    for j = low to high-1:
        if arr[j] <= pivot:
            swap(arr[i], arr[j])
            i++
    swap(arr[i], arr[high])   // 把 pivot 放到正确位置
    return i                   // pivot 的最终位置
```

### 为什么快排是 O(n log n)？

```
第 1 层：  分 1 次，处理 n 个元素    → O(n)
第 2 层：  分 2 次，共处理 n 个元素  → O(n)
第 3 层：  分 4 次，共处理 n 个元素  → O(n)
...
共 log n 层，每层 O(n) → 总计 O(n log n)
```

最坏情况（每次 pivot 都选到最大/最小值）退化为 O(n²)。解决方案：**随机选 pivot**。

### 快速选择：找第 K 大/小元素

快排的 Partition 操作有一个性质：**每次分区后，pivot 会放到它的最终位置**。

所以找第 K 大元素时，不需要排完整个数组，只需要不断 Partition 直到 pivot 恰好落在第 K 个位置上：

```
目标：找第 K 大 → 转换为找索引 target = n - K

Partition 后 pivot 在索引 p：
  p == target → 找到了！arr[p] 就是答案
  p > target  → 答案在左半部分，递归左边
  p < target  → 答案在右半部分，递归右边
```

为什么是 O(n)？

```
第 1 次 Partition：处理 n 个元素
第 2 次：处理 n/2 个（期望）
第 3 次：处理 n/4 个
...
总计：n + n/2 + n/4 + ... = 2n = O(n)
```

## 代码实现

### 快速排序 —— TypeScript

```typescript
/**
 * 快速排序 —— TypeScript 实现
 * Lomuto 分区 + 随机 pivot
 */
function quickSort(arr: number[], low = 0, high = arr.length - 1): void {
  if (low >= high) return;

  const pivotIndex = partition(arr, low, high);
  quickSort(arr, low, pivotIndex - 1); // 排左半部分
  quickSort(arr, pivotIndex + 1, high); // 排右半部分
}

function partition(arr: number[], low: number, high: number): number {
  // 随机选 pivot，避免最坏情况
  const randomIndex = low + Math.floor(Math.random() * (high - low + 1));
  [arr[randomIndex], arr[high]] = [arr[high], arr[randomIndex]];

  const pivot = arr[high];
  let i = low; // i 指向"下一个该放小值的位置"

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }

  [arr[i], arr[high]] = [arr[high], arr[i]]; // pivot 归位
  return i;
}

// 测试
const arr = [3, 6, 8, 10, 1, 2, 1];
quickSort(arr);
console.log(arr); // [1, 1, 2, 3, 6, 8, 10]
```

### 快速排序 —— Go

```go
package sort

import "math/rand"

// QuickSort 快速排序 —— Go 实现
func QuickSort(arr []int) {
	quickSort(arr, 0, len(arr)-1)
}

func quickSort(arr []int, low, high int) {
	if low >= high {
		return
	}
	pivotIndex := partition(arr, low, high)
	quickSort(arr, low, pivotIndex-1)
	quickSort(arr, pivotIndex+1, high)
}

func partition(arr []int, low, high int) int {
	// 随机 pivot
	randIdx := low + rand.Intn(high-low+1)
	arr[randIdx], arr[high] = arr[high], arr[randIdx]

	pivot := arr[high]
	i := low

	for j := low; j < high; j++ {
		if arr[j] <= pivot {
			arr[i], arr[j] = arr[j], arr[i]
			i++
		}
	}
	arr[i], arr[high] = arr[high], arr[i]
	return i
}
```

### 快速排序 —— Java

```java
import java.util.Random;

/**
 * 快速排序 —— Java 实现
 */
public class QuickSort {

    private static final Random rand = new Random();

    public static void quickSort(int[] arr, int low, int high) {
        if (low >= high) return;

        int pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }

    private static int partition(int[] arr, int low, int high) {
        // 随机 pivot
        int randIdx = low + rand.nextInt(high - low + 1);
        swap(arr, randIdx, high);

        int pivot = arr[high];
        int i = low;

        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                swap(arr, i, j);
                i++;
            }
        }
        swap(arr, i, high);
        return i;
    }

    private static void swap(int[] arr, int a, int b) {
        int tmp = arr[a];
        arr[a] = arr[b];
        arr[b] = tmp;
    }

    public static void main(String[] args) {
        int[] arr = {3, 6, 8, 10, 1, 2, 1};
        quickSort(arr, 0, arr.length - 1);
        // [1, 1, 2, 3, 6, 8, 10]
    }
}
```

### 快速排序 —— Python

```python
"""快速排序 —— Python 实现"""
import random

def quick_sort(arr: list[int], low: int = 0, high: int = None) -> None:
    if high is None:
        high = len(arr) - 1
    if low >= high:
        return

    pivot_index = _partition(arr, low, high)
    quick_sort(arr, low, pivot_index - 1)
    quick_sort(arr, pivot_index + 1, high)

def _partition(arr: list[int], low: int, high: int) -> int:
    # 随机 pivot
    rand_idx = random.randint(low, high)
    arr[rand_idx], arr[high] = arr[high], arr[rand_idx]

    pivot = arr[high]
    i = low

    for j in range(low, high):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1

    arr[i], arr[high] = arr[high], arr[i]
    return i


# 测试
arr = [3, 6, 8, 10, 1, 2, 1]
quick_sort(arr)
print(arr)  # [1, 1, 2, 3, 6, 8, 10]
```

### 快速选择：找第 K 大元素

> LeetCode 215. Kth Largest Element in an Array

#### TypeScript

```typescript
/**
 * 快速选择 —— TypeScript 实现
 * 找数组中第 K 大的元素，平均 O(n)
 */
function findKthLargest(nums: number[], k: number): number {
  const target = nums.length - k; // 第 K 大 = 索引 n-k
  return quickSelect(nums, 0, nums.length - 1, target);
}

function quickSelect(
  arr: number[],
  low: number,
  high: number,
  target: number,
): number {
  const pivotIndex = partition(arr, low, high);

  if (pivotIndex === target) return arr[pivotIndex];
  if (pivotIndex > target) return quickSelect(arr, low, pivotIndex - 1, target);
  return quickSelect(arr, pivotIndex + 1, high, target);
}

function partition(arr: number[], low: number, high: number): number {
  const randomIndex = low + Math.floor(Math.random() * (high - low + 1));
  [arr[randomIndex], arr[high]] = [arr[high], arr[randomIndex]];

  const pivot = arr[high];
  let i = low;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[high]] = [arr[high], arr[i]];
  return i;
}

// 测试
console.log(findKthLargest([3, 2, 1, 5, 6, 4], 2)); // 5
console.log(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)); // 4
```

#### Go

```go
package sort

import "math/rand"

// FindKthLargest 快速选择找第 K 大 —— Go 实现
func FindKthLargest(nums []int, k int) int {
	target := len(nums) - k
	return quickSelect(nums, 0, len(nums)-1, target)
}

func quickSelect(arr []int, low, high, target int) int {
	pivotIndex := qsPartition(arr, low, high)

	if pivotIndex == target {
		return arr[pivotIndex]
	}
	if pivotIndex > target {
		return quickSelect(arr, low, pivotIndex-1, target)
	}
	return quickSelect(arr, pivotIndex+1, high, target)
}

func qsPartition(arr []int, low, high int) int {
	randIdx := low + rand.Intn(high-low+1)
	arr[randIdx], arr[high] = arr[high], arr[randIdx]

	pivot := arr[high]
	i := low
	for j := low; j < high; j++ {
		if arr[j] <= pivot {
			arr[i], arr[j] = arr[j], arr[i]
			i++
		}
	}
	arr[i], arr[high] = arr[high], arr[i]
	return i
}
```

#### Java

```java
import java.util.Random;

/**
 * 快速选择找第 K 大 —— Java 实现
 */
public class QuickSelect {

    private static final Random rand = new Random();

    public static int findKthLargest(int[] nums, int k) {
        int target = nums.length - k;
        return quickSelect(nums, 0, nums.length - 1, target);
    }

    private static int quickSelect(int[] arr, int low, int high, int target) {
        int pivotIndex = partition(arr, low, high);

        if (pivotIndex == target) return arr[pivotIndex];
        if (pivotIndex > target) return quickSelect(arr, low, pivotIndex - 1, target);
        return quickSelect(arr, pivotIndex + 1, high, target);
    }

    private static int partition(int[] arr, int low, int high) {
        int randIdx = low + rand.nextInt(high - low + 1);
        swap(arr, randIdx, high);

        int pivot = arr[high], i = low;
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                swap(arr, i++, j);
            }
        }
        swap(arr, i, high);
        return i;
    }

    private static void swap(int[] arr, int a, int b) {
        int tmp = arr[a]; arr[a] = arr[b]; arr[b] = tmp;
    }
}
```

#### Python

```python
"""快速选择找第 K 大 —— Python 实现"""
import random

def find_kth_largest(nums: list[int], k: int) -> int:
    target = len(nums) - k
    return _quick_select(nums, 0, len(nums) - 1, target)

def _quick_select(arr: list[int], low: int, high: int, target: int) -> int:
    pivot_index = _partition(arr, low, high)

    if pivot_index == target:
        return arr[pivot_index]
    if pivot_index > target:
        return _quick_select(arr, low, pivot_index - 1, target)
    return _quick_select(arr, pivot_index + 1, high, target)

def _partition(arr: list[int], low: int, high: int) -> int:
    rand_idx = random.randint(low, high)
    arr[rand_idx], arr[high] = arr[high], arr[rand_idx]

    pivot = arr[high]
    i = low
    for j in range(low, high):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[high] = arr[high], arr[i]
    return i


# 测试
print(find_kth_largest([3,2,1,5,6,4], 2))           # 5
print(find_kth_largest([3,2,3,1,2,4,5,5,6], 4))     # 4
```

### 三路快排：处理大量重复元素

当数组中有大量重复元素时，标准快排会退化。三路快排把数组分成**三部分**：`[< pivot] [== pivot] [> pivot]`，中间的等于区直接跳过，不再递归。

#### TypeScript

```typescript
/**
 * 三路快排 —— TypeScript 实现
 * 适用于大量重复元素的场景
 */
function quickSort3Way(arr: number[], low = 0, high = arr.length - 1): void {
  if (low >= high) return;

  // 随机 pivot
  const randIdx = low + Math.floor(Math.random() * (high - low + 1));
  [arr[randIdx], arr[low]] = [arr[low], arr[randIdx]];

  const pivot = arr[low];
  let lt = low; // arr[low..lt-1] < pivot
  let gt = high; // arr[gt+1..high] > pivot
  let i = low + 1; // arr[lt..i-1] == pivot

  while (i <= gt) {
    if (arr[i] < pivot) {
      [arr[i], arr[lt]] = [arr[lt], arr[i]];
      lt++;
      i++;
    } else if (arr[i] > pivot) {
      [arr[i], arr[gt]] = [arr[gt], arr[i]];
      gt--;
    } else {
      i++;
    }
  }

  // 现在 arr[lt..gt] 都等于 pivot，跳过不排
  quickSort3Way(arr, low, lt - 1);
  quickSort3Way(arr, gt + 1, high);
}
```

#### Python

```python
"""三路快排 —— Python 实现"""
import random

def quick_sort_3way(arr: list[int], low: int = 0, high: int = None) -> None:
    if high is None:
        high = len(arr) - 1
    if low >= high:
        return

    rand_idx = random.randint(low, high)
    arr[rand_idx], arr[low] = arr[low], arr[rand_idx]

    pivot = arr[low]
    lt, gt, i = low, high, low + 1

    while i <= gt:
        if arr[i] < pivot:
            arr[i], arr[lt] = arr[lt], arr[i]
            lt += 1
            i += 1
        elif arr[i] > pivot:
            arr[i], arr[gt] = arr[gt], arr[i]
            gt -= 1
        else:
            i += 1

    quick_sort_3way(arr, low, lt - 1)
    quick_sort_3way(arr, gt + 1, high)
```

## 面试题精选

| 题号 | 题目                    | 考点                | 难度 |
| ---- | ----------------------- | ------------------- | ---- |
| 912  | 排序数组                | 手写快排            | 中等 |
| 215  | 数组中的第 K 个最大元素 | 快速选择 O(n)       | 中等 |
| 347  | 前 K 个高频元素         | 快速选择 + 频率映射 | 中等 |
| 973  | 最接近原点的 K 个点     | 按距离快速选择      | 中等 |
| 75   | 颜色分类                | 三路分区思想        | 中等 |
| 23   | 合并 K 个升序链表       | 分治（快排思想）    | 困难 |
| 703  | 数据流中的第 K 大元素   | 最小堆 / 快速选择   | 简单 |
| 414  | 第三大的数              | 快速选择或维护 Top3 | 简单 |

## 业务场景

### 1. 数据库排序与 TopK 查询

`SELECT * FROM orders ORDER BY amount DESC LIMIT 10`——数据库引擎在做排序和 TopK 查询时，底层就用了快速选择的思想。MySQL 在 `filesort` 阶段用的就是快排变体。不需要完全排序就能拿到前 K 条记录，O(n) 比 O(n log n) 快得多。

### 2. 日志分析中的 TopN

分析服务器日志，找出访问量最大的 Top 100 IP。先统计每个 IP 的访问次数，然后用快速选择找出频率最高的 100 个。这在 ELK Stack、Splunk 等日志平台中是基础操作。

### 3. 推荐系统中的召回排序

推荐系统从百万候选中召回几千条，再用模型打分排序。最终展示给用户的只有 Top 20。这最后一步"从几千条中取 Top 20"就可以用快速选择，比全排序节省大量计算。

### 4. 操作系统调度

进程调度器需要维护一个优先级队列。Linux 的 O(1) 调度器和 CFS 调度器内部都有排序和选择操作。快速排序的分区思想也用于任务的分桶调度。

### 5. 中位数查找

"找出 100 万个数字的中位数"——不需要排序，用快速选择找到第 n/2 大的元素就行，O(n) 搞定。这在统计学、数据分析中非常常见。

## 复杂度分析

| 算法     | 平均时间   | 最坏时间 | 空间            |
| -------- | ---------- | -------- | --------------- |
| 快速排序 | O(n log n) | O(n²)    | O(log n) 递归栈 |
| 快速选择 | O(n)       | O(n²)    | O(log n) 递归栈 |
| 三路快排 | O(n log n) | O(n²)    | O(log n) 递归栈 |

- **快排平均 O(n log n)**：每次 Partition 把数组大致对半分，递归 log n 层
- **快排最坏 O(n²)**：每次 pivot 恰好是最值（已排序数组 + 固定选最后元素为 pivot）。随机化 pivot 后概率极低
- **快速选择 O(n)**：每次只递归一半（期望），n + n/2 + n/4 + ... = 2n
- **空间 O(log n)**：递归调用栈的深度，不是额外数组
- **三路快排**：有大量重复元素时，等于区跳过不排，实际更快

## 小结

快排家族的核心就一个操作：**Partition 分区**。

面试中记住这些要点：

1. **快排三步走**：选 pivot → 分区 → 递归左右
2. **一定要随机 pivot**：避免 O(n²) 最坏情况，面试不写随机 pivot 会被追问
3. **快速选择找第 K 大**：Partition 后只看一边，O(n) 秒杀排序后的 O(n log n)
4. **三路分区**：大量重复元素时用 `[< pivot] [== pivot] [> pivot]` 三路划分
5. **Partition 是万能的**：快排、快速选择、颜色分类、TopK 问题都用它

快排口诀：**选个基准分两边，小的左边大右边。递归排序各一半，n log n 就排完** ✅
