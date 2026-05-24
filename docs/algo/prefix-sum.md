---
title: 前缀和与差分数组
description: Prefix Sum 和 Difference Array 详解：区间查询与区间修改，四语言实现
date: 2026-05-18 01:00:00
categories:
  - Algorithm
tags:
  - prefix-sum
  - difference-array
  - array
  - interview
sidebarSort: 27
---

# 前缀和与差分数组（Prefix Sum & Difference Array）

面试官问："给你一个数组，多次查询某个区间的元素之和，怎么做到每次 O(1)？"

你的第一反应可能是：遍历区间求和呗，O(n) 每次。但如果查询 10 万次呢？10 万 × n 就超时了。

答案是：**预处理一个前缀和数组，之后每次查询 O(1) 搞定**。这就是前缀和的核心思想——**用 O(n) 的预处理换取 O(1) 的查询**。

而它的"对偶"数据结构——**差分数组**——解决的是相反的问题：**多次对某个区间做加减操作，最后查询结果**。两者一正一反，覆盖了区间操作的大部分场景。

## 原理拆解

### 前缀和

给定数组 `arr`，前缀和数组 `prefix` 的定义：

```
prefix[i] = arr[0] + arr[1] + ... + arr[i-1]

即：prefix[i] 是 arr 前 i 个元素的和
```

```
原数组 arr：     [3,  1,  4,  1,  5,  9,  2,  6]
前缀和 prefix：  [0,  3,  4,  8,  9, 14, 23, 25, 31]
                  ↑  ↑  ↑  ↑  ↑   ↑   ↑   ↑   ↑
                  0个 1个 2个 3个 4个 5个  6个  7个  8个
```

**区间查询**：求 `arr[i..j]` 的和 → `prefix[j+1] - prefix[i]`

```
例：求 arr[2..5] 的和 = 4 + 1 + 5 + 9 = 19
    prefix[6] - prefix[2] = 23 - 4 = 19 ✅
```

### 差分数组

差分数组是前缀和的**逆操作**。给定数组 `arr`，差分数组 `diff` 的定义：

```
diff[0] = arr[0]
diff[i] = arr[i] - arr[i-1]   (i > 0)
```

```
原数组 arr：    [3,  1,  4,  1,  5,  9]
差分数组 diff： [3, -2,  3, -3,  4,  4]
```

**关键性质**：对原数组 `arr[i..j]` 区间内的每个元素都加上 `v`，等价于在差分数组上只修改两个位置：

```
diff[i] += v       （从 i 开始，后面的前缀和都会增加 v）
diff[j+1] -= v     （从 j+1 开始抵消，后面的不受影响）
```

**为什么有用**：如果要做 10 万次"对区间 [i, j] 加 v"的操作，暴力方法每次 O(n)，总共 O(n × k)。用差分数组，每次操作只改两个位置 O(1)，最后做一次前缀和还原 O(n)，总共 O(n + k)。

### 前缀和 vs 差分数组

```
场景                          最佳工具
─────────────────────────────────────────
多次查询区间和            →  前缀和
多次修改区间值            →  差分数组
两者都有（查询+修改）     →  线段树 / 树状数组
```

## 代码实现

### 经典问题一：区域和检索

> LeetCode 303. Range Sum Query - Immutable
> 给定数组，多次查询 `arr[i..j]` 的和。

#### TypeScript

```typescript
/**
 * 区域和检索 —— TypeScript 实现
 * 预处理前缀和数组，查询 O(1)
 */
class NumArray {
  private prefix: number[];

  constructor(nums: number[]) {
    // prefix[i] = nums[0] + ... + nums[i-1]
    this.prefix = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
      this.prefix[i + 1] = this.prefix[i] + nums[i];
    }
  }

  /** 查询 arr[i..j] 的和 */
  sumRange(left: number, right: number): number {
    return this.prefix[right + 1] - this.prefix[left];
  }
}

// 测试
const na = new NumArray([-2, 0, 3, -5, 2, -1]);
console.log(na.sumRange(0, 2)); // 1（-2 + 0 + 3）
console.log(na.sumRange(2, 5)); // -1（3 + -5 + 2 + -1）
console.log(na.sumRange(0, 5)); // -3
```

#### Go

```go
package prefixsum

// NumArray 区域和检索 —— Go 实现
type NumArray struct {
	prefix []int
}

// ConstructorNumArray 构建前缀和数组
func ConstructorNumArray(nums []int) NumArray {
	prefix := make([]int, len(nums)+1)
	for i, v := range nums {
		prefix[i+1] = prefix[i] + v
	}
	return NumArray{prefix: prefix}
}

// SumRange 查询区间和 O(1)
func (na *NumArray) SumRange(left, right int) int {
	return na.prefix[right+1] - na.prefix[left]
}
```

#### Java

```java
/**
 * 区域和检索 —— Java 实现
 */
public class NumArray {
    private final int[] prefix;

    public NumArray(int[] nums) {
        prefix = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }
    }

    public int sumRange(int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
}
```

#### Python

```python
"""区域和检索 —— Python 实现"""

class NumArray:
    def __init__(self, nums: list[int]):
        self.prefix = [0] * (len(nums) + 1)
        for i, v in enumerate(nums):
            self.prefix[i + 1] = self.prefix[i] + v

    def sum_range(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]


# 测试
na = NumArray([-2, 0, 3, -5, 2, -1])
print(na.sum_range(0, 2))  # 1
print(na.sum_range(2, 5))  # -1
```

### 经典问题二：二维前缀和

> LeetCode 304. Range Sum Query 2D - Immutable
> 给定二维矩阵，多次查询子矩阵的元素之和。

**思路：二维前缀和。`prefix[i][j]` 表示从 `(0,0)` 到 `(i-1,j-1)` 的矩形和。**

```
prefix[i][j] = prefix[i-1][j] + prefix[i][j-1] - prefix[i-1][j-1] + matrix[i-1][j-1]
                                    ↑ 减去重叠部分，避免重复计算
```

#### TypeScript

```typescript
/**
 * 二维区域和检索 —— TypeScript 实现
 */
class NumMatrix {
  private prefix: number[][];

  constructor(matrix: number[][]) {
    const rows = matrix.length,
      cols = matrix[0].length;
    // prefix[i][j] = 从 (0,0) 到 (i-1,j-1) 的矩形和
    this.prefix = Array.from({ length: rows + 1 }, () =>
      new Array(cols + 1).fill(0),
    );

    for (let i = 1; i <= rows; i++) {
      for (let j = 1; j <= cols; j++) {
        this.prefix[i][j] =
          this.prefix[i - 1][j] +
          this.prefix[i][j - 1] -
          this.prefix[i - 1][j - 1] +
          matrix[i - 1][j - 1];
      }
    }
  }

  /** 查询 (r1,c1) 到 (r2,c2) 的子矩阵和 */
  sumRegion(r1: number, c1: number, r2: number, c2: number): number {
    return (
      this.prefix[r2 + 1][c2 + 1] -
      this.prefix[r1][c2 + 1] -
      this.prefix[r2 + 1][c1] +
      this.prefix[r1][c1]
    );
  }
}
```

#### Python

```python
"""二维区域和检索 —— Python 实现"""

class NumMatrix:
    def __init__(self, matrix: list[list[int]]):
        rows, cols = len(matrix), len(matrix[0])
        self.prefix = [[0] * (cols + 1) for _ in range(rows + 1)]

        for i in range(1, rows + 1):
            for j in range(1, cols + 1):
                self.prefix[i][j] = (self.prefix[i-1][j] + self.prefix[i][j-1]
                                    - self.prefix[i-1][j-1] + matrix[i-1][j-1])

    def sum_region(self, r1: int, c1: int, r2: int, c2: int) -> int:
        return (self.prefix[r2+1][c2+1] - self.prefix[r1][c2+1]
              - self.prefix[r2+1][c1]   + self.prefix[r1][c1])
```

### 经典问题三：差分数组 —— 区间加法

> LeetCode 370. Range Addition (Plus)
> 给定数组长度 n 和一组操作 `[i, j, val]`（把 arr[i..j] 都加 val），返回最终数组。

#### TypeScript

```typescript
/**
 * 区间加法 —— TypeScript 实现（差分数组）
 * 每次区间修改 O(1)，最后还原 O(n)
 */
function getModifiedArray(length: number, updates: number[][]): number[] {
  // 差分数组，初始全 0（原数组也全 0）
  const diff = new Array(length + 1).fill(0);

  // 每次区间修改：只改两个位置
  for (const [i, j, val] of updates) {
    diff[i] += val;
    diff[j + 1] -= val;
  }

  // 还原：差分数组的前缀和就是原数组
  const result = new Array(length);
  result[0] = diff[0];
  for (let i = 1; i < length; i++) {
    result[i] = result[i - 1] + diff[i];
  }

  return result;
}

// 测试
console.log(
  getModifiedArray(5, [
    [1, 3, 2],
    [2, 4, 3],
    [0, 2, -2],
  ]),
);
// 原数组:  [0, 0, 0, 0, 0]
// +[1,3,2]: [0, 2, 2, 2, 0]
// +[2,4,3]: [0, 2, 5, 5, 3]
// +[0,2,-2]: [-2, 0, 3, 5, 3]
```

#### Go

```go
package prefixsum

// GetModifiedArray 区间加法 —— Go 实现（差分数组）
func GetModifiedArray(length int, updates [][]int) []int {
	diff := make([]int, length+1)

	for _, update := range updates {
		i, j, val := update[0], update[1], update[2]
		diff[i] += val
		if j+1 < length {
			diff[j+1] -= val
		}
	}

	result := make([]int, length)
	result[0] = diff[0]
	for i := 1; i < length; i++ {
		result[i] = result[i-1] + diff[i]
	}
	return result
}
```

#### Java

```java
/**
 * 区间加法 —— Java 实现（差分数组）
 */
public class RangeAddition {

    public static int[] getModifiedArray(int length, int[][] updates) {
        int[] diff = new int[length + 1];

        for (int[] update : updates) {
            diff[update[0]] += update[2];
            diff[update[1] + 1] -= update[2];
        }

        int[] result = new int[length];
        result[0] = diff[0];
        for (int i = 1; i < length; i++) {
            result[i] = result[i - 1] + diff[i];
        }
        return result;
    }
}
```

#### Python

```python
"""区间加法 —— Python 实现（差分数组）"""

def get_modified_array(length: int, updates: list[list[int]]) -> list[int]:
    diff = [0] * (length + 1)

    for i, j, val in updates:
        diff[i] += val
        diff[j + 1] -= val

    result = [0] * length
    result[0] = diff[0]
    for i in range(1, length):
        result[i] = result[i - 1] + diff[i]
    return result
```

### 经典问题四：和为 K 的子数组

> LeetCode 560. Subarray Sum Equals K
> 给定数组和整数 k，返回和为 k 的连续子数组的个数。

**思路：前缀和 + 哈希表。`prefix[j] - prefix[i] = k` → 查找之前有多少个 `prefix[i] = prefix[j] - k`。**

#### TypeScript

```typescript
/**
 * 和为 K 的子数组 —— TypeScript 实现
 * 前缀和 + 哈希表，一次遍历 O(n)
 */
function subarraySum(nums: number[], k: number): number {
  const prefixCount = new Map<number, number>();
  prefixCount.set(0, 1); // 前缀和为 0 的出现 1 次（空前缀）

  let count = 0,
    prefixSum = 0;

  for (const num of nums) {
    prefixSum += num;

    // 看之前有没有前缀和 = prefixSum - k 的
    const target = prefixSum - k;
    count += prefixCount.get(target) || 0;

    // 记录当前前缀和
    prefixCount.set(prefixSum, (prefixCount.get(prefixSum) || 0) + 1);
  }

  return count;
}

// 测试
console.log(subarraySum([1, 1, 1], 2)); // 2
console.log(subarraySum([1, 2, 3], 3)); // 2
```

#### Go

```go
package prefixsum

// SubarraySum 和为 K 的子数组 —— Go 实现
func SubarraySum(nums []int, k int) int {
	prefixCount := map[int]int{0: 1}
	count, prefixSum := 0, 0

	for _, num := range nums {
		prefixSum += num
		target := prefixSum - k
		count += prefixCount[target]
		prefixCount[prefixSum]++
	}
	return count
}
```

#### Java

```java
import java.util.*;

/**
 * 和为 K 的子数组 —— Java 实现
 */
public class SubarraySumEqualsK {

    public static int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> prefixCount = new HashMap<>();
        prefixCount.put(0, 1);

        int count = 0, prefixSum = 0;
        for (int num : nums) {
            prefixSum += num;
            count += prefixCount.getOrDefault(prefixSum - k, 0);
            prefixCount.merge(prefixSum, 1, Integer::sum);
        }
        return count;
    }
}
```

#### Python

```python
"""和为 K 的子数组 —— Python 实现"""
from collections import defaultdict

def subarray_sum(nums: list[int], k: int) -> int:
    prefix_count = defaultdict(int)
    prefix_count[0] = 1

    count, prefix_sum = 0, 0
    for num in nums:
        prefix_sum += num
        count += prefix_count[prefix_sum - k]
        prefix_count[prefix_sum] += 1
    return count
```

## 面试题精选

| 题号 | 题目                  | 考点              | 难度 |
| ---- | --------------------- | ----------------- | ---- |
| 303  | 区域和检索            | 一维前缀和        | 简单 |
| 304  | 二维区域和检索        | 二维前缀和        | 中等 |
| 560  | 和为 K 的子数组       | 前缀和 + 哈希     | 中等 |
| 523  | 连续的子数组和        | 前缀和 + 同余     | 中等 |
| 974  | 和可被 K 整除的子数组 | 前缀和 + 取模     | 中等 |
| 370  | 区间加法              | 差分数组          | 中等 |
| 1109 | 航班预订统计          | 差分数组          | 中等 |
| 1094 | 拼车                  | 差分数组          | 中等 |
| 238  | 除自身以外数组的乘积  | 前缀积 + 后缀积   | 中等 |
| 1248 | 统计「优美子数组」    | 前缀和 + 奇偶计数 | 中等 |

## 业务场景

### 1. 数据统计与报表

Dashboard 上的"最近 7 天活跃用户"、"本月累计销售额"——这些区间求和操作如果每次实时计算就很慢。用前缀和预处理后，任意时间段的数据汇总都是 O(1)。ClickHouse、Elasticsearch 等分析引擎内部大量使用前缀和。

### 2. 图片积分图（Integral Image）

计算机视觉中的 Haar 特征提取需要快速计算图片任意矩形区域的像素和。积分图（也叫 Summed Area Table）就是二维前缀和在图像处理中的应用。OpenCV 的人脸检测器底层就用了这个技术。

### 3. 航班预订 / 会议室预订

"航班在每个航段上有多少预订"、"每个时间段有多少会议室被占用"——这些都是差分数组的典型场景。对每个预订 [i, j] 做 diff[i] += val, diff[j+1] -= val，最后前缀和就是每个位置的值。

### 4. 负载均衡中的权重分配

加权轮询负载均衡需要知道每个服务器的权重占比。用前缀和把权重累积起来，生成一个随机数，通过二分查找确定落在哪个区间，就选中了哪台服务器。Nginx 的 weighted round-robin 就用了类似的思路。

### 5. 游戏伤害计算

回合制游戏中，一个"持续 3 回合的中毒效果"就是对区间 [当前回合, 当前回合+2] 加上固定伤害。多个效果叠加时，差分数组可以 O(1) 处理每个效果，最后 O(n) 还原出每回合的实际伤害。

## 复杂度分析

| 操作     | 前缀和 | 差分数组       |
| -------- | ------ | -------------- |
| 预处理   | O(n)   | O(n)           |
| 区间查询 | O(1)   | O(n)（需还原） |
| 区间修改 | O(n)   | O(1)           |
| 空间     | O(n)   | O(n)           |

- **前缀和擅长查询**：预处理 O(n) 后，每次查询 O(1)
- **差分数组擅长修改**：每次修改 O(1)，但查询需要 O(n) 还原
- 如果既要频繁查询又要频繁修改，就需要更高级的数据结构：**树状数组（BIT）** 或 **线段树**，两者都是 O(log n)

## 小结

前缀和与差分数组是一对**互补**的工具：

- **前缀和**：区间求和 → `prefix[right+1] - prefix[left]`，查询 O(1)
- **差分数组**：区间加法 → `diff[i] += v, diff[j+1] -= v`，修改 O(1)

面试中的套路：

1. **看到"区间和"** → 先想前缀和
2. **看到"区间修改"** → 先想差分数组
3. **看到"和为 K 的子数组"** → 前缀和 + 哈希表
4. **二维版本** → 二维前缀和（容斥原理：`+ 左上 - 右上 - 左下`）
5. **注意前缀和的开闭区间**：推荐 `prefix[i]` 表示前 i 个元素的和（prefix[0] = 0），查询 `sum[i..j]` = `prefix[j+1] - prefix[i]`，不容易搞混

口诀：**前缀求和减两端，差分修改改两关。区间问题别蛮干，预处理后全 O(1)** ✅
