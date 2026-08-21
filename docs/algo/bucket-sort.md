---
title: 桶排序
description: 桶排序（Bucket Sort）—— 分而治之的分布式排序思想，四语言实现
date: 2026-08-17 09:33:41
categories:
  - Algorithm
tags:
  - bucket-sort
  - sorting
  - distribution
  - algorithm
  - interview
sidebarSort: 74
---

# 桶排序（Bucket Sort）

你有没有遇到过这种情况：年终奖发放完毕，你要给全公司 10000 名员工按绩效分数排序。分数范围是 0-100，分布比较均匀。你会怎么做？调用 `Array.sort()` 暴力排序当然可以，但既然你知道分数的范围和分布，有没有更快的方法？

桶排序就是这样一种"**知道数据分布特点就能加速**"的排序算法。它的核心思想很简单——把数据分散到有限数量的"桶"里，每个桶内单独排序，最后按顺序把所有桶拼接起来。如果桶的数量和元素分布配合得当，排序速度可以逼近 **O(n)**，比常规的 O(n log n) 排序快上一截。

## 原理拆解

### 核心思想

桶排序的本质是**分而治之 + 空间换时间**。它假设数据在某个范围内均匀分布，然后把整个数据范围划分成若干个等长的区间（每个区间就是一个"桶"），把元素分配到对应的桶里，最后对每个非空桶内部进行排序，再依次拼接。

用生活中的例子来理解：想象你要把一堆书按尺寸分类放到书架上。

```
书架（数据范围 0-100 英寸）：

  📚 小号桶 (0-20寸)   📚 中号桶 (21-40寸)   📚 大号桶 (41-60寸)   ...
  
  书籍1: 15寸 → 放入小号桶      书籍2: 35寸 → 放入中号桶
  书籍3: 18寸 → 放入小号桶      书籍4: 42寸 → 放入大号桶
  ...
```

### 图解过程

```python
原始数组:  [0.42, 0.65, 0.12, 0.87, 0.35, 0.21, 0.91, 0.73, 0.88, 0.55]
            假设均匀分布在 [0, 1) 区间，划分 10 个桶

桶划分过程:

桶0 [0.0-0.1):  []
桶1 [0.1-0.2):  [0.12]
桶2 [0.2-0.3):  [0.21]
桶3 [0.3-0.4):  [0.35]
桶4 [0.4-0.5):  [0.42]
桶5 [0.5-0.6):  [0.55]
桶6 [0.6-0.7):  [0.65]
桶7 [0.7-0.8):  [0.73]
桶8 [0.8-0.9):  [0.87, 0.88]
桶9 [0.9-1.0):  [0.91]

对每个桶内部排序（用快排或插入排序）:

桶1: [0.12]        桶2: [0.21]        桶3: [0.35]        桶4: [0.42]
桶5: [0.55]        桶6: [0.65]        桶7: [0.73]
桶8: [0.87, 0.88]  桶9: [0.91]

按顺序拼接所有桶 → [0.12, 0.21, 0.35, 0.42, 0.55, 0.65, 0.73, 0.87, 0.88, 0.91] ✅
```

### 关键参数选择

桶排序的效果取决于两个关键参数：

1. **桶的数量（m）**：通常取 `n`（元素个数）或某个倍数。太多桶会浪费空间，太少桶会导致每个桶内元素过多。
2. **桶的范围计算**：`range = (max - min) / bucketCount`，每个桶覆盖的数值宽度。

```typescript
// 桶范围计算的核心公式
const min = Math.min(...arr);
const max = Math.max(...arr);
const bucketCount = arr.length; // 通常取元素个数
const range = (max - min) / bucketCount; // 每个桶覆盖的宽度

// 元素落入哪个桶？
const bucketIndex = Math.floor((value - min) / range);
// 注意：最后一个桶要包含 max 值，需要特殊处理
```

### 为什么桶排序比通用排序快？

常见的 O(n log n) 排序（快排、归并、堆排）对所有输入一视同仁，无论数据分布如何都要做 log n 级别的比较。

桶排序则利用了数据的分布信息。如果数据在 [0, 1) 均匀分布，n 个元素分散到 n 个桶里，每个桶里平均只有 1 个元素——几乎不需要排序，直接拼接就完成了。**复杂度从 O(n log n) 降到了 O(n)**。

但如果数据扎堆（比如 99% 都落在同一个桶里），桶排序就退化成了对那个桶内的元素做排序，最坏情况 O(n²)。

## 代码实现

### TypeScript（推荐，贴近工程实际）

```typescript
/**
 * 桶排序 —— TypeScript 实现
 *
 * 适用场景：
 * - 数据在已知范围内均匀分布
 * - 浮点数排序（快排处理浮点数容易有精度问题，桶排序更稳定）
 * - 外排序（数据量太大放不进内存时，按桶分批处理）
 *
 * 关键点：
 * 1. 桶数量通常取元素个数或某个合理倍数
 * 2. 每个桶内部用插入排序（元素少时插入排序很快）
 * 3. 拼接时注意处理空桶
 */
function bucketSort(arr: number[], bucketCount: number = 5): number[] {
  if (arr.length === 0) return arr;

  // Step 1: 找到数据的最小值和最大值
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = (max - min) / bucketCount; // 每个桶覆盖的数值宽度

  // Step 2: 创建桶，并把元素分配到对应桶里
  // 这里用数组的数组来模拟桶
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  for (const value of arr) {
    // 计算元素应该落入哪个桶
    // 关键：最后一个桶要包含 max 值
    let index = Math.floor((value - min) / range);
    // 边界情况：如果 value === max，index 会越界，需要修正
    if (index >= bucketCount) index = bucketCount - 1;
    buckets[index].push(value);
  }

  // Step 3: 对每个桶内部进行排序
  // 桶内元素少时，插入排序 O(k²) 也很快，整体可控
  for (const bucket of buckets) {
    bucket.sort((a, b) => a - b);
  }

  // Step 4: 按顺序拼接所有桶
  const result: number[] = [];
  for (const bucket of buckets) {
    result.push(...bucket);
  }

  return result;
}

/**
 * 桶排序（更工程化的版本）
 * - 使用插入排序作为桶内排序（对小数组更稳定）
 * - 支持稳定排序
 */
function bucketSortStable(arr: number[], bucketCount: number = 5): number[] {
  if (arr.length === 0) return arr;

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = (max - min) / bucketCount;

  // 创建空桶
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  // 分配元素到桶中（稳定：相同范围的元素保持原有相对顺序）
  for (const value of arr) {
    let index = Math.floor((value - min) / range);
    if (index >= bucketCount) index = bucketCount - 1;
    buckets[index].push(value);
  }

  // 对每个桶进行插入排序（稳定排序）
  // 插入排序对接近有序的小数组效率很高，接近 O(n)
  for (const bucket of buckets) {
    insertionSort(bucket);
  }

  // 拼接结果
  return buckets.flat();
}

/**
 * 插入排序 —— 桶内排序的首选
 * 对小规模/接近有序的数据效率很高，天然稳定
 */
function insertionSort(arr: number[]): void {
  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > current) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = current;
  }
}

// 使用示例
const scores = [0.42, 0.65, 0.12, 0.87, 0.35, 0.21, 0.91, 0.73, 0.88, 0.55];
console.log(bucketSort(scores)); // [0.12, 0.21, 0.35, 0.42, 0.55, 0.65, 0.73, 0.87, 0.88, 0.91]

const ages = [25, 37, 18, 55, 62, 40, 33, 41, 54, 29];
console.log(bucketSort(ages, 5)); // [18, 25, 29, 33, 37, 40, 41, 54, 55, 62]
```

### Go

```go
package bucketsort

import "sort"

/**
 * 桶排序 —— Go 实现
 *
 * 特点：
 * - 利用 Go 的切片特性，桶用 []float64 切片表示
 * - 桶内使用 sort.Float64s()（Go 内置的浮点排序）
 * - 工程中注意处理空桶的情况
 */
func BucketSort(arr []float64, bucketCount int) []float64 {
	if len(arr) == 0 {
		return arr
	}

	// Step 1: 找到最小值和最大值
	min, max := arr[0], arr[0]
	for _, v := range arr {
		if v < min {
			min = v
		}
		if v > max {
			max = v
		}
	}

	// 避免除零错误
	range_ := (max - min) / float64(bucketCount)
	if range_ == 0 {
		range_ = 1 // 如果所有元素相同，放一个桶里
	}

	// Step 2: 创建桶并分配元素
	buckets := make([][]float64, bucketCount)
	for i := 0; i < bucketCount; i++ {
		buckets[i] = make([]float64, 0)
	}

	for _, v := range arr {
		// 计算桶索引
		index := int((v - min) / range_)
		// 边界处理：最大值应该放入最后一个桶
		if index >= bucketCount {
			index = bucketCount - 1
		}
		buckets[index] = append(buckets[index], v)
	}

	// Step 3: 对每个桶排序，并收集结果
	result := make([]float64, 0, len(arr))
	for _, bucket := range buckets {
		if len(bucket) > 0 {
			sort.Float64s(bucket) // Go 内置排序，稳定且高效
			result = append(result, bucket...)
		}
	}

	return result
}

/**
 * 整数版本的桶排序 —— 更高效
 * 直接用除法映射到桶，省去浮点计算
 */
func BucketSortInt(arr []int, bucketSize int) []int {
	if len(arr) == 0 || bucketSize <= 0 {
		return arr
	}

	min, max := arr[0], arr[0]
	for _, v := range arr {
		if v < min {
			min = v
		}
		if v > max {
			max = v
		}
	}

	// 创建桶
	bucketCount := (max-min)/bucketSize + 1
	buckets := make([][]int, bucketCount)
	for i := 0; i < bucketCount; i++ {
		buckets[i] = make([]int, 0)
	}

	// 分配到桶
	for _, v := range arr {
		index := (v - min) / bucketSize
		buckets[index] = append(buckets[index], v)
	}

	// 排序并拼接
	result := make([]int, 0, len(arr))
	for _, bucket := range buckets {
		if len(bucket) > 0 {
			sort.Ints(bucket)
			result = append(result, bucket...)
		}
	}

	return result
}
```

### Java

```java
import java.util.*;

/**
 * 桶排序 —— Java 实现
 *
 * Java 的 ArrayList + Collections.sort() 组合非常适合桶排序场景：
 * - ArrayList 动态扩容，分配元素方便
 * - Collections.sort() 对小数组使用归并排序（TimSort），性能稳定
 */
public class BucketSort {

    /**
     * 通用桶排序（浮点数版本）
     *
     * @param arr 输入数组
     * @param bucketCount 桶的数量
     * @return 排序后的数组
     */
    public static List<Double> bucketSort(double[] arr, int bucketCount) {
        if (arr == null || arr.length == 0) {
            return Collections.emptyList();
        }

        // Step 1: 找最小最大值
        double min = Double.MAX_VALUE;
        double max = Double.MIN_VALUE;
        for (double v : arr) {
            if (v < min) min = v;
            if (v > max) max = v;
        }

        if (min == max) {
            // 所有元素相同，直接返回
            List<Double> result = new ArrayList<>(arr.length);
            for (double v : arr) result.add(v);
            return result;
        }

        // Step 2: 创建桶并分配元素
        List<Double>[] buckets = new ArrayList[bucketCount];
        for (int i = 0; i < bucketCount; i++) {
            buckets[i] = new ArrayList<>();
        }

        double range = (max - min) / bucketCount;
        for (double v : arr) {
            int index = (int) Math.floor((v - min) / range);
            // 边界处理
            if (index >= bucketCount) index = bucketCount - 1;
            buckets[index].add(v);
        }

        // Step 3: 桶内排序并收集结果
        List<Double> result = new ArrayList<>(arr.length);
        for (List<Double> bucket : buckets) {
            if (bucket.isEmpty()) continue;
            // Java 的 TimSort 对小数组也很高效
            Collections.sort(bucket);
            result.addAll(bucket);
        }

        return result;
    }

    /**
     * 整数桶排序（更高效）
     * 当你知道整数范围时，可以用更简单的方式计算桶索引
     */
    public static int[] bucketSortInt(int[] arr, int maxValue) {
        if (arr == null || arr.length == 0) return arr;

        int bucketCount = maxValue / 10 + 1;
        List<Integer>[] buckets = new ArrayList[bucketCount];
        for (int i = 0; i < bucketCount; i++) {
            buckets[i] = new ArrayList<>();
        }

        // 分配到桶
        for (int v : arr) {
            int index = v / 10;
            buckets[index].add(v);
        }

        // 排序并收集
        int[] result = new int[arr.length];
        int idx = 0;
        for (List<Integer> bucket : buckets) {
            if (bucket.isEmpty()) continue;
            Collections.sort(bucket);
            for (int v : bucket) {
                result[idx++] = v;
            }
        }

        return result;
    }

    public static void main(String[] args) {
        // 浮点数排序示例
        double[] scores = {0.42, 0.65, 0.12, 0.87, 0.35, 0.21, 0.91, 0.73, 0.88, 0.55};
        List<Double> sorted = bucketSort(scores, 10);
        System.out.println(sorted);
        // [0.12, 0.21, 0.35, 0.42, 0.55, 0.65, 0.73, 0.87, 0.88, 0.91]

        // 整数排序示例
        int[] ages = {25, 37, 18, 55, 62, 40, 33, 41, 54, 29};
        int[] sortedAges = bucketSortInt(ages, 100);
        System.out.println(Arrays.toString(sortedAges));
        // [18, 25, 29, 33, 37, 40, 41, 54, 55, 62]
    }
}
```

### Python

```python
def bucket_sort(arr: list[float], bucket_count: int = 5) -> list[float]:
    """
    桶排序 —— Python 实现

    核心思想：
    1. 根据数据范围创建 N 个桶
    2. 将元素分散到对应桶中（通过计算 index = (value - min) / range）
    3. 对每个桶内部排序（Python 的 timsort 对小数组也很快）
    4. 按顺序拼接所有桶

    为什么选 Python 桶排序：
    - 代码最简洁，逻辑最清晰
    - Python 的 list + sort() 组合天然适合桶排序场景
    """
    if len(arr) <= 1:
        return arr

    # Step 1: 找到数据范围
    min_val = min(arr)
    max_val = max(arr)
    if min_val == max_val:
        return arr[:]  # 所有元素相同，无需排序

    # Step 2: 计算桶宽度，并创建空桶
    bucket_width = (max_val - min_val) / bucket_count
    buckets: list[list[float]] = [[] for _ in range(bucket_count)]

    # Step 3: 将每个元素分配到对应的桶
    for value in arr:
        # 计算桶索引：用除法映射到 [0, bucket_count-1]
        index = int((value - min_val) / bucket_width)
        # 边界处理：max_val 应该落入最后一个桶
        if index >= bucket_count:
            index = bucket_count - 1
        buckets[index].append(value)

    # Step 4: 对每个桶排序，然后拼接
    # Python 的 timsort 对小数组也很高效，不需要手动优化
    result = []
    for bucket in buckets:
        if bucket:
            bucket.sort()  # Python 内置排序（TimSort）
            result.extend(bucket)

    return result


def bucket_sort_int(arr: list[int], bucket_size: int = 10) -> list[int]:
    """
    整数版本的桶排序 —— 更高效

    适用场景：已知整数范围，比如年龄、分数等
    桶索引直接用除法：value // bucket_size
    """
    if not arr:
        return []

    max_val = max(arr)
    min_val = min(arr)
    bucket_count = (max_val - min_val) // bucket_size + 1

    # 创建桶
    buckets: list[list[int]] = [[] for _ in range(bucket_count)]

    # 分配到桶
    for value in arr:
        index = (value - min_val) // bucket_size
        buckets[index].append(value)

    # 排序并拼接
    result = []
    for bucket in buckets:
        if bucket:
            bucket.sort()
            result.extend(bucket)

    return result


# 使用示例
if __name__ == "__main__":
    # 浮点数排序
    scores = [0.42, 0.65, 0.12, 0.87, 0.35, 0.21, 0.91, 0.73, 0.88, 0.55]
    print(bucket_sort(scores, 10))
    # [0.12, 0.21, 0.35, 0.42, 0.55, 0.65, 0.73, 0.87, 0.88, 0.91]

    # 整数排序
    ages = [25, 37, 18, 55, 62, 40, 33, 41, 54, 29]
    print(bucket_sort_int(ages, bucket_size=10))
    # [18, 25, 29, 33, 37, 40, 41, 54, 55, 62]

    # 大数据量测试
    import random
    large_arr = [random.random() for _ in range(100_000)]
    sorted_arr = bucket_sort(large_arr, bucket_count=1000)
    print(f"排序了 {len(sorted_arr)} 个元素，验证: {sorted_arr == sorted(large_arr)}")
    # True
```

## 业务场景

### 1. 浮点数排序（财务/科学计算）

桶排序在浮点数排序场景中有独特优势。金融系统里经常要对利率、收益率排序，精度要求高。桶排序按数值范围直接分桶，避免了快速排序对浮点数比较的精度问题，而且可以利用数据的分布特点（比如利率通常集中在某个区间）获得接近 O(n) 的性能。

### 2. 分数排名系统（高考分数、绩效排序）

高考成绩在 0-750 分之间，分布有一定规律（中间分段人多，两端人少）。用桶排序可以为全省排名快速排序——按分数段分桶，每个桶内用插入排序，整体接近 O(n)。相比全局快排，桶排序还天然支持**稳定排序**（同分数保持原有顺序）。

### 3. 外部排序（大数据场景）

当数据量太大放不进内存时，桶排序可以优雅地做**外部排序**：把数据分批读入内存，每个批次放入对应的桶（桶是磁盘上的临时文件），每个桶单独排序后，最后合并。MapReduce 的 `GroupBy` 思想本质上就是桶排序的分布式版本 ✨。

### 4. 基数排序的前置步骤

基数排序（Radix Sort）本质上是一种特殊的桶排序——按数位分桶，从低位到高位逐轮排序。理解桶排序是理解基数排序的基础，两者结合可以处理更大范围的整数排序。

## 复杂度分析

| 指标 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 平均时间 | O(n + k) | n 个元素，k 个桶，每个桶平均 n/k 个元素，排序 O(k × (n/k)²) 优化后接近 O(n) |
| 最好时间 | O(n) | 数据均匀分布，每个桶只有 1 个元素，无需排序 |
| 最坏时间 | O(n²) | 所有元素落在同一个桶，退化成桶内排序 |
| 空间 | O(n + k) | n 个元素 + k 个桶的额外空间 |
| 稳定性 | ✅ 稳定 | 分配时保持相对顺序，桶内排序用稳定排序 |

**关键洞察**：桶排序不是一种"通用排序"，它的效果完全取决于数据分布：

```
数据均匀分布 → 每个桶元素少 → 接近 O(n) ✅
数据高度集中 → 一个桶元素多 → 退化 O(n²) ❌
```

这也是为什么说桶排序是"**以空间换时间，并依赖数据分布假设**"的算法。

## 小结

桶排序是一种"**知道数据特点才能用得好**"的排序算法。它不是万能的，但在合适的场景下，它的速度可以碾压通用排序算法：

- ✅ 平均 O(n)，接近线性排序（比快排的 O(n log n) 快）
- ✅ 天然稳定排序，同分数保持原有顺序
- ✅ 适合浮点数排序、外部排序、分布式排序
- ✅ 分桶思想在很多高级算法中都有体现（基数排序、计数排序的泛化）
- ❌ 依赖数据均匀分布假设，不满足时退化严重
- ❌ 需要预先知道数据范围

如果你在面试中被问到"**如何对一堆浮点数排序，要求 O(n) 时间**"，桶排序就是标准答案 🎯。记住它的核心公式：`桶索引 = (value - min) / range`，理解了这个，桶排序就掌握了大半。

