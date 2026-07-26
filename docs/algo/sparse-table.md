---
title: 稀疏表
description: 稀疏表（Sparse Table）：O(n log n) 构建、O(1) 查询的静态区间最值查询神器
date: 2026-07-26 08:00:00
categories:
  - Algorithm
tags:
  - sparse-table
  - rmq
  - range-query
  - static
  - interview
sidebarSort: 69
---

# 稀疏表（Sparse Table）

想象一下这个场景：你是某个大数据平台的工程师，数据库里存了一张表，有 100 万行数据。用户频繁发来这样的查询请求："第 5 万行到第 10 万行之间的最小值是多少？"每天可能要处理几十万次。

如果每次查询都去扫描一遍区间，O(n) 的复杂度在 100 万的数据量下就是一场灾难。但如果数据是**静态的**（不会频繁更新），有一种数据结构可以在 **O(1) 时间内**回答任意区间最值查询，而且代码出奇地简单。这就是今天要讲的 **稀疏表（Sparse Table）** ✨

## 为什么需要稀疏表？

先来看看常见方案的痛点：

| 方案 | 查询复杂度 | 更新复杂度 | 适用场景 |
| ---- | ---------- | ---------- | -------- |
| 暴力扫描 | O(n) | O(1) | 小数据、单次查询 |
| 线段树 | O(log n) | O(log n) | 动态数据 |
| 稀疏表 | **O(1)** | O(n log n) | **静态数据** |

线段树我们之前聊过（docs/algo/segment-tree.md），支持动态更新，但查询还是要 O(log n)。稀疏表的优势在于：**数据不变时，查询就是 O(1)**——这是目前静态 RMQ 问题能做到的最优复杂度。

## 原理拆解

### 什么是 RMQ？

RMQ 全称是 **Range Minimum/Maximum Query**，即"区间最小/最大查询"。给定一个数组，回答"区间 [L, R] 内的最小/最大值是多少？"

### 稀疏表的核心思想

稀疏表本质上是**倍增DP**的应用。核心思路就一句话：**预处理每个元素开始的 2^k 长度的最值，查询时把区间分成两段重叠的 2^k 块**。

#### Step 1: 预处理

令 `table[k][i]` 表示从数组第 i 个位置开始、长度为 `2^k` 的区间内的最值（即 `arr[i]` 到 `arr[i + 2^k - 1]` 的最小值）。

状态转移方程：

```
table[0][i] = arr[i]                          // 长度 2^0 = 1，自己就是最小值
table[k][i] = min(table[k-1][i], table[k-1][i + 2^(k-1)])
               // 长度为 2^k 的区间 = 两段长度为 2^(k-1) 的区间拼接
```

这就是典型的**倍增DP**——从长度为 1 开始，逐级合并出更长的区间。

```
数组: [3, 2, 5, 7, 1, 4, 6, 3]

table[0] (长度1):  [3, 2, 5, 7, 1, 4, 6, 3]
table[1] (长度2):  [2, 2, 5, 1, 1, 4, 3]     // min(3,2)=2, min(2,5)=2, ...
table[2] (长度4):  [2, 1, 1, 1, 1, 3]        // min(3,2,5,7)=2, min(2,5,7,1)=1, ...
table[3] (长度8):  [1]                        // min(整个数组)=1
```

构建复杂度分析：
- 一共有 O(n log n) 个状态
- 每个状态 O(1) 计算
- 总时间：O(n log n)，总空间：O(n log n)

#### Step 2: O(1) 查询

假设要查询区间 [L, R] 的最小值：

```
设 k = floor(log2(R - L + 1))   // 区间长度的二进制下最高位
查询区间长度 = 2^k（这个 k 确保了两段都完全落在 [L, R] 内）
```

图示：

```
查询区间 [L, R]，长度 = R - L + 1

位置:   L        L+2^k-1    R-2^k+1    R
        |----------|----------|----------|
        ← 2^k →   ← 重叠 →   ← 2^k →

区间1: 从 L 开始，长度 2^k   → table[k][L]
区间2: 从 R-2^k+1 开始，长度 2^k → table[k][R-2^k+1]

两个区间覆盖了整个 [L,R]，取 min 就是答案
```

为什么要取两段？
- 区间1: `[L, L+2^k-1]`
- 区间2: `[R-2^k+1, R]`
- 因为 `2^k ≤ 区间长度`，所以这两个区间都完全落在 `[L,R]` 内
- 两段可能有重叠，但**重叠不影响最值结果**（两个区间各自包含正确答案）

代码实现：

```typescript
function rmq(arr: number[], L: number, R: number): number {
  const len = R - L + 1;
  const k = Math.floor(Math.log2(len)); // 区间长度的最高位
  return Math.min(table[k][L], table[k][R - (1 << k) + 1]);
}
```

### 关键细节：为什么 O(1) 是可行的？

这是稀疏表最妙的地方。传统数据结构（如线段树）查询需要沿着树往下走 O(log n) 步，是因为信息没有冗余存储。而稀疏表在预处理时**把 O(n log n) 的空间换来了 O(1) 的查询时间**。

查询区间 [L, R] 为什么要用两段而不是一段？

```
假设 len = 13 (十进制) = 1101 (二进制)

我们取 k = floor(log2(13)) = 3（因为 2^3 = 8 ≤ 13 < 16 = 2^4）

如果只取一段: [L, L+8)，只覆盖了部分区间 ❌
用两段: [L, L+8) + [R-8+1, R+1)，正好覆盖整个区间 ✅

两段之间有重叠（重叠 8+8-13=3 个元素），但 min 操作不怕重叠
```

### 局限性：为什么稀疏表只适合静态数据？

因为预处理是基于**固定数组**的。一旦数组某个位置的值变了，所有包含这个位置的 `table[k][i]` 都需要更新，而影响范围是 O(n log n)——这还不如重新建表。

所以：
- ✅ 静态数组 + 大量查询 → 稀疏表
- ❌ 需要频繁单点更新 → 线段树 / 树状数组
- ❌ 需要频繁区间更新 → 线段树（Lazy Propagation）

## 代码实现

### TypeScript

```typescript
/**
 * 稀疏表（Sparse Table）—— 静态区间最值查询
 *
 * 核心思想：预处理所有 2^k 长度的最值，查询时 O(1) 合并两段
 * 适用场景：数组静态、查询频繁
 */

class SparseTable {
  private table: number[][]; // table[k][i] = min/max of arr[i..i+2^k-1]
  private n: number;
  private isRMQ = true; // true=最小值查询，false=最大值查询

  constructor(arr: number[], type: 'min' | 'max' = 'min') {
    this.n = arr.length;
    this.isRMQ = type === 'min';
    this.build(arr);
  }

  private build(arr: number[]): void {
    // 预处理 log2(n) 向上取整的层数
    const maxK = Math.floor(Math.log2(this.n)) + 1;
    this.table = Array.from({ length: maxK }, () => new Array(this.n).fill(0));

    // 第 0 层：长度为 1 的区间，就是元素本身
    for (let i = 0; i < this.n; i++) {
      this.table[0][i] = arr[i];
    }

    // 第 k 层：合并两个长度为 2^(k-1) 的区间
    for (let k = 1; k < maxK; k++) {
      for (let i = 0; i + (1 << k) <= this.n; i++) {
        const left = this.table[k - 1][i];
        const right = this.table[k - 1][i + (1 << (k - 1))];
        this.table[k][i] = this.isRMQ
          ? Math.min(left, right)
          : Math.max(left, right);
      }
    }
  }

  /**
   * 查询区间 [L, R] 的最值
   * 时间复杂度: O(1)
   */
  query(L: number, R: number): number {
    if (L > R || L < 0 || R >= this.n) {
      throw new Error('Invalid range');
    }

    const len = R - L + 1;
    const k = Math.floor(Math.log2(len)); // 区间长度对应的最大 2^k

    const left = this.table[k][L];
    const right = this.table[k][R - (1 << k) + 1];

    return this.isRMQ ? Math.min(left, right) : Math.max(left, right);
  }
}

// 使用示例
const arr = [3, 2, 5, 7, 1, 4, 6, 3];
const st = new SparseTable(arr, 'min');

// 单次查询
console.log(st.query(1, 4)); // 区间 [2,5,7,1] → 最小值 1
console.log(st.query(0, 7)); // 整个数组 → 最小值 1

// 批量查询模拟
const queries = [
  [0, 3], [2, 5], [1, 6], [4, 7], [0, 0]
];
queries.forEach(([L, R]) => {
  console.log(`RMQ(${L}, ${R}) = ${st.query(L, R)}`);
});
```

### Go

```go
package sparsetable

import (
	"math"
)

// SparseTable 稀疏表 —— 静态区间最值查询
type SparseTable struct {
	table  [][]int // table[k][i] = 从 arr[i] 开始，长度为 2^k 的区间最值
	isMin  bool    // true=查最小值，false=查最大值
	length int     // 数组长度
}

// NewMin 创建查最小值的稀疏表
func NewMin(arr []int) *SparseTable {
	return newSparseTable(arr, true)
}

// NewMax 创建查最大值的稀疏表
func NewMax(arr []int) *SparseTable {
	return newSparseTable(arr, false)
}

func newSparseTable(arr []int, isMin bool) *SparseTable {
	n := len(arr)
	maxK := int(math.Log2(float64(n))) + 1

	// table[k] 存储长度为 2^k 的区间最值
	// table[0] 长度为 1，table[1] 长度为 2...
	table := make([][]int, maxK)
	for k := 0; k < maxK; k++ {
		table[k] = make([]int, n)
	}

	// 第 0 层：长度 1 = 元素本身
	copy(table[0], arr)

	// 动态规划：从已知的小区间合并出更大的区间
	for k := 1; (1 << k) <= n; k++ {
		for i := 0; i+(1<<k) <= n; i++ {
			left := table[k-1][i]
			right := table[k-1][i+(1<<(k-1))]
			if isMin {
				if left < right {
					table[k][i] = left
				} else {
					table[k][i] = right
				}
			} else {
				if left > right {
					table[k][i] = left
				} else {
					table[k][i] = right
				}
			}
		}
	}

	return &SparseTable{
		table:  table,
		isMin:  isMin,
		length: n,
	}
}

// Query 查询区间 [L, R] 的最值，O(1) 时间
func (st *SparseTable) Query(L, R int) int {
	if L < 0 || R >= st.length || L > R {
		panic("invalid range")
	}

	// 取 k = floor(log2(R-L+1))，即满足 2^k <= len < 2^(k+1)
	len := R - L + 1
	k := int(math.Log2(float64(len)))

	left := st.table[k][L]
	right := st.table[k][R-(1<<k)+1]

	if st.isMin {
		if left < right {
			return left
		}
		return right
	}
	if left > right {
		return left
	}
	return right
}

// RMQ 测试用例
func ExampleRMQ() {
	arr := []int{3, 2, 5, 7, 1, 4, 6, 3}

	stMin := NewMin(arr)
	stMax := NewMax(arr)

	queries := [][2]int{
		{0, 3}, // [3,2,5,7] → min=2, max=7
		{2, 5}, // [5,7,1,4] → min=1, max=7
		{1, 6}, // [2,5,7,1,4,6] → min=1, max=7
	}

	for _, q := range queries {
		L, R := q[0], q[1]
		min := stMin.Query(L, R)
		max := stMax.Query(L, R)
		println("Range", L, "-", R, ": min =", min, ", max =", max)
	}
}
```

### Java

```java
import java.util.Arrays;

/**
 * 稀疏表（Sparse Table）—— 静态区间最值查询
 *
 * 预处理时间 O(n log n)，查询时间 O(1)
 * 适用于：数组元素固定不变，查询极其频繁的场景
 */
public class SparseTable {
    private final int[][] table; // table[k][i] = 从 arr[i] 开始，长度 2^k 的区间最值
    private final boolean isMin; // true = 查最小值
    private final int n;         // 数组长度

    /**
     * @param arr   原始数组
     * @param isMin true=查最小值，false=查最大值
     */
    public SparseTable(int[] arr, boolean isMin) {
        this.isMin = isMin;
        this.n = arr.length;

        // 最大需要 log2(n) + 1 层
        int maxK = (int) (Math.log(n) / Math.log(2)) + 1;
        this.table = new int[maxK][n];

        // 第 0 层：长度为 1
        table[0] = Arrays.copyOf(arr, n);

        // DP 构建：合并两个长度为 2^(k-1) 的子区间
        for (int k = 1; (1 << k) <= n; k++) {
            for (int i = 0; i + (1 << k) <= n; i++) {
                int left = table[k - 1][i];
                int right = table[k - 1][i + (1 << (k - 1))];
                table[k][i] = isMin ? Math.min(left, right) : Math.max(left, right);
            }
        }
    }

    /**
     * O(1) 查询区间 [L, R] 的最值
     */
    public int query(int L, int R) {
        if (L < 0 || R >= n || L > R) {
            throw new IllegalArgumentException("Invalid range");
        }

        int len = R - L + 1;
        // 取 k = floor(log2(len))，确保 2^k <= len < 2^(k+1)
        int k = (int) (Math.log(len) / Math.log(2));

        int left = table[k][L];
        int right = table[k][R - (1 << k) + 1];

        return isMin ? Math.min(left, right) : Math.max(left, right);
    }

    // 使用示例
    public static void main(String[] args) {
        int[] arr = {3, 2, 5, 7, 1, 4, 6, 3};

        SparseTable minTable = new SparseTable(arr, true);
        SparseTable maxTable = new SparseTable(arr, false);

        // 批量查询
        int[][] queries = {
            {0, 3},
            {2, 5},
            {1, 6},
            {4, 7}
        };

        for (int[] q : queries) {
            int L = q[0], R = q[1];
            System.out.printf("RMQ(%d, %d) → min=%d, max=%d%n",
                L, R, minTable.query(L, R), maxTable.query(L, R));
        }
    }
}
```

### Python

```python
import math
from typing import List


class SparseTable:
    """稀疏表（Sparse Table）—— 静态区间最值查询

    预处理: O(n log n) 时间 + O(n log n) 空间
    查询:   O(1) 时间

    核心思想：用 DP 预处理所有 2^k 长度的最值，
    查询时把区间分成两段 2^k 块（可能有重叠），合并结果。

    为什么重叠也没关系：因为取最值的操作具有幂等性，
    重叠区间里相同的元素不会影响最终结果。
    """

    def __init__(self, arr: List[int], type_: str = 'min'):
        """
        Args:
            arr: 原始数组
            type_: 'min' 查最小值，'max' 查最大值
        """
        self.arr = arr
        self.n = len(arr)
        self.is_min = (type_ == 'min')

        # maxK = floor(log2(n)) + 1，最多 log2(n) + 1 层
        max_k = int(math.log2(self.n)) + 1
        # table[k][i] = arr[i..i+2^k-1] 的最值
        self.table = [[0] * self.n for _ in range(max_k)]

        # 第 0 层：长度 1 = 元素本身
        self.table[0] = arr.copy()

        # DP 构建：从小区间合并出大区间
        for k in range(1, max_k):
            for i in range(self.n - (1 << k) + 1):
                left = self.table[k - 1][i]
                right = self.table[k - 1][i + (1 << (k - 1))]
                self.table[k][i] = min(left, right) if self.is_min else max(left, right)

    def query(self, L: int, R: int) -> int:
        """O(1) 查询区间 [L, R] 的最值

        为什么用两段 2^k：只要 2^k <= 区间长度，两段就完全落在区间内，
        它们各自包含正确答案，min/max 操作不怕重叠。
        """
        if L < 0 or R >= self.n or L > R:
            raise ValueError(f"Invalid range [{L}, {R}]")

        # 区间长度对应的最大 2^k
        length = R - L + 1
        k = int(math.log2(length))

        left = self.table[k][L]
        right = self.table[k][R - (1 << k) + 1]

        return min(left, right) if self.is_min else max(left, right)

    def __repr__(self) -> str:
        return f"SparseTable(n={self.n}, type={'min' if self.is_min else 'max'})"


if __name__ == "__main__":
    arr = [3, 2, 5, 7, 1, 4, 6, 3]

    min_table = SparseTable(arr, 'min')
    max_table = SparseTable(arr, 'max')

    # 模拟多次查询
    queries = [(0, 3), (2, 5), (1, 6), (4, 7), (0, 7)]

    print(f"数组: {arr}")
    print("-" * 40)
    for L, R in queries:
        min_val = min_table.query(L, R)
        max_val = max_table.query(L, R)
        print(f"RMQ[{L}, {R}] = [最小值: {min_val}, 最大值: {max_val}]")

    # 验证：对比暴力法
    print("\n验证（对比暴力法）:")
    for L, R in queries:
        expected_min = min(arr[L:R+1])
        expected_max = max(arr[L:R+1])
        assert min_table.query(L, R) == expected_min
        assert max_table.query(L, R) == expected_max
    print("✅ 所有查询验证通过！")
```

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
| ---- | ---------- | ---------- |
| 预处理 | O(n log n) | O(n log n) |
| 单次查询 | **O(1)** | O(1) |
| 单点更新 | O(n log n)（不建议用） | — |

为什么空间是 O(n log n)？
- 共有 log(n) 层
- 第 k 层有 n - 2^k + 1 个元素
- 总和约为 n * (log(n) + 1) = O(n log n)

不过实际实现时，可以用**笛卡尔树**把空间优化到 O(n)——这是另一个有趣的算法，但面试中 O(n log n) 的空间完全够用。

## 实际应用场景

### 1. LCP（最长公共前缀）查询

字符串的后缀数组排序后，相邻后缀的 LCP 可以用 RMQ 来回答：

```typescript
// 给定后缀数组 SA 和 rank 表，查第 i 和第 j 个后缀的 LCP
function lcpQuery(SA: number[], rank: number[], i: number, j: number): number {
  if (i === j) return arr.length - SA[i]; // 同一个后缀
  const L = rank[i], R = rank[j];
  return sparseTable.query(Math.min(L, R) + 1, Math.max(L, R));
}
```

这是后缀数组的经典应用，搜索引擎的字符串处理经常用到。

### 2. 实时监控系统

传感器每秒采集一次温度/延迟数据，数据量很大且通常不会修改历史数据。查询"过去 1 小时内最低/最高温度"时，O(1) 的稀疏表查询比线段树的 O(log n) 快了 log n 倍，在高频查询场景下优势明显。

### 3. ST 表与 LCA 的转换

树上两个节点的最近公共祖先（LCA）问题，可以通过欧拉 tour + RMQ 在 O(1) 时间内解决。把树遍历成 Euler 序列， LCA 就是 Euler 序列中两个节点首次出现位置之间的深度最小值。Sparse Table 完美契合这个需求。

## 稀疏表 vs 线段树 vs 树状数组

| 特性 | 稀疏表 | 线段树 | 树状数组 |
| ---- | ------ | ------ | -------- |
| 预处理 | O(n log n) | O(n) | O(n log n) |
| 查询 | **O(1)** | O(log n) | O(log n) |
| 点更新 | O(n log n) | O(log n) | O(log n) |
| 区间更新 | O(n log n) | O(log n) | O(log n) |
| 空间 | O(n log n) | O(n) | O(n) |
| 适用场景 | 静态数据 | 动态数据 | 动态数据（单点为主） |

面试时如果被问到"静态 RMQ"，直接上稀疏表。如果是动态 RMQ（需要更新），就讲线段树。

## 小结

稀疏表的核心就是**倍增DP预处理 + O(1) 区间合并**：

- ✅ 查询 O(1)，静态数据下这是理论最优
- ✅ 代码极简，状态转移就一行 `min(table[k-1][i], table[k-1][i+2^(k-1)])`
- ✅ 是 RMQ 问题的经典解法，跟后缀数组、LCA 都有紧密联系
- ❌ 不支持动态更新，更新一个元素需要 O(n log n)
- ❌ 空间 O(n log n)，大数据量时注意内存

掌握 Sparse Table，你就在 RMQ 问题上达到了理论最优——面试时能跟面试官聊到倍增DP、预处理的时空交换思维，说明你对算法思想的理解已经到了一个不错的层次 🎯
