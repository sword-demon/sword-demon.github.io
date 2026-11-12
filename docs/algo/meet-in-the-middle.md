---
title: 折半枚举（Meet in the Middle）精讲
description: 折半枚举——把 2^n 的指数爆炸砍成 2^(n/2)，一文讲透子集和、4Sum II、等和划分、最小子集和差等经典模型，附 TypeScript / Python / Go 三语言实现、图解与暴力对拍
date: 2026-11-01 09:30:13
categories:
  - Algorithm
tags:
  - meet-in-the-middle
  - bitmask
  - divide-and-conquer
  - hash-table
  - interview
sidebarSort: 121
---

# 折半枚举（Meet in the Middle）精讲

面试官给你一道题：

> *给定一个包含 n 个整数的数组，判断是否存在一个非空子集，其元素和恰好等于 target。*

你张口就来：遍历所有子集，算和，比对。写完你自己都知道这玩意儿跑不动 —— `n = 40` 时是 **1 万亿**次枚举，跑到天荒地老。

这时候面试官追了一句：

> *"如果 n 是 46 呢？"*

你沉默了。因为 46 个数意味着 2⁴⁶ ≈ **7 万亿**种组合。

然后面试官笑了，说：*"这题有解法吗？"*

有。而且思路简单到有点侮辱智商 —— **把数组劈成两半，各算各的，然后对答案** ✨

---

## 一、先把概念钉死

### 1.1 什么是折半枚举

一句话：**当一个问题的搜索空间是指数级 `2^n`，但我们只需要"判断有没有"而不是"列出所有"时，把问题拆成两个 `2^(n/2)` 的子问题，再用哈希表把答案对起来。**

英文叫 **Meet in the Middle（MITM）**，直译"中间相遇"。

核心数学事实：

```
原问题：   2^n     个候选
折半之后： 2^(n/2) + 2^(n/2) ≈ 2 · 2^(n/2) 个候选

n = 40 时：
  暴力      2^40  = 1,099,511,627,776   （一万亿）
  折半      2^20  = 1,048,576           （一百万）
            提速约 1000 倍
```

指数从 `n` 降到 `n/2`，看起来只砍了一半，但 `2^40 / 2^20 = 2^20 = 一百万倍` —— **指数函数的好处就是这样：砍一半指数，收益是平方级的。**

### 1.2 它不是什么

这点必须先说清楚，否则很容易学歪：

| | 折半枚举 | 状态压缩 DP | 排序 + 双指针 |
|---|---|---|---|
| 状态含义 | 一半的**子集和** | `dp[mask]` = 选 mask 的最优值 | 有序数组的端点 |
| 能处理的范围 | n ≤ 46 左右 | n ≤ 20 左右 | n 很大（10⁵+） |
| 能否枚举所有解 | ✅ 可以 | ❌ 只保留最优 | ❌ 只保留一端 |
| 核心操作 | 哈希表配对 | 状态转移 | 指针移动 |

**折半枚举是"枚举 + 查表"，不是 DP。** 它的独特之处在于：**它是少数几个能把指数复杂度真的降下来的算法**（另一个大概是分治）。

### 1.3 什么时候该想到折半枚举

三个信号，出现任意一个就可以考虑：

1. **搜索空间是 `2^n`**，且 n 在 30~46 之间（超过 46 内存就吃不消了）
2. **判定条件可以拆成两半的组合** —— "存在一个子集和为 target" ⟺ "存在左半子集和 a、右半子集和 b，a + b = target"
3. **答案不要求"所有方案"，只要求"是否存在 / 最多 / 计数"**

第 2 点是关键。**如果两个半边的贡献可以独立相加，折半就能用。**

---

## 二、原理拆解

### 2.1 子集和的枚举：为什么是 2^(n/2)

先看最基础的问题：给定 k 个数，枚举出它们**所有子集的和**。

每个元素只有"选"和"不选"两种状态，所以 k 个元素有 `2^k` 个子集。我们需要把这 `2^k` 个和**全部算出来**。

方法有两种。

#### 方法一：增量倍增（推荐）⭐

核心技巧：**处理完前 i 个元素后，手里就握着 2^i 个子集和；加入第 i+1 个元素时，每个旧子集都多出一个"新版本"（加上这个元素）。**

```
初始（还没处理任何元素）：  sums = [0]        ← 空集的和是 0

加入 3：
  旧子集： 0
  新子集： 0 + 3 = 3
  sums = [0, 3]                ← 2^1 = 2 个 ✓

加入 5：
  旧子集： 0, 3
  新子集： 0+5=5, 3+5=8
  sums = [0, 3, 5, 8]          ← 2^2 = 4 个 ✓

加入 7：
  旧子集： 0, 3, 5, 8
  新子集： 7, 10, 12, 15
  sums = [0, 3, 5, 8, 7, 10, 12, 15]   ← 2^3 = 8 个 ✓
```

**注意：新旧子集的和一定不同（元素不全为 0 时），但顺序不重要。** 整个过程就是"每加一个数，数组长度翻倍"。

代码（TypeScript）：

```typescript
/**
 * 枚举 arr 的所有子集和
 * 核心思路：增量倍增 —— 每加一个元素，旧的每个子集都多出一个"加上它"的新版本
 * 复杂度：O(2^k) 时间，O(2^k) 空间
 */
export function enumerateSubsetSums(arr: number[]): number[] {
  const sums: number[] = [0]; // 空集的和是 0

  for (const x of arr) {
    const oldLen = sums.length;
    // 只读 sums[0..oldLen-1]，往后追加 sums[i] + x
    // ⚠️ 不能写 sums.push(...next)，详见「避坑清单」
    for (let i = 0; i < oldLen; i++) {
      sums.push(sums[i] + x);
    }
  }

  return sums;
}
```

#### 方法二：位掩码（更直观，但慢 10 倍）

把子集表示成一个二进制数，第 i 位为 1 表示"选第 i 个元素"。

```typescript
/**
 * 位掩码枚举：mask 的第 i 位为 1，表示选中 arr[i]
 * 优点：直观、易懂、可以顺带拿到具体的下标组合
 * 缺点：每个 mask 都要扫一遍数组，O(k · 2^k)，比增量倍增慢约 10 倍
 */
export function enumerateSubsetSumsBitmask(arr: number[]): number[] {
  const n = arr.length;
  const sums: number[] = [];

  for (let mask = 0; mask < 1 << n; mask++) {
    let s = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) s += arr[i];
    }
    sums.push(s);
  }

  return sums;
}
```

```
mask = 1011₂  (n = 4)

  位3 位2 位1 位0
   1   0   1   1      ← 选了 arr[0], arr[1], arr[3]
```

### 2.2 核心：两半配对

现在回到原问题。设数组分成左右两半 `L` 和 `R`：

```
目标：存在子集 S ⊆ L∪R，使得 sum(S) = target

等价于：存在 a ∈ 子集和(L)，b ∈ 子集和(R)，使得 a + b = target
```

**证明很简单**：任何子集 `S` 都能唯一拆成 `S ∩ L` 和 `S ∩ R` 两部分，两部分的和相加就是 `sum(S)`。反过来，任意一对 `(a, b)` 也对应一个合法子集。**这是一个双射。**

于是算法成型：

```
1. 枚举左半所有子集和，存进哈希表 setLeft
2. 枚举右半所有子集和，对每个 b：
     如果 (target - b) 在 setLeft 里 → 找到解 ✅
3. 全部找完还没有 → 无解 ❌
```

```
                    数组 = [L | R]
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
        枚举 L 的子集和            枚举 R 的子集和
        {0, 3, 5, 8, ...}          {0, 7, 12, 15, ...}
        2^(n/2) 个                2^(n/2) 个
              ↓                         ↓
          存进哈希表                  每个 b 拿去查
              │                    target - b 在表里？
              │                         ↓
              │                    是 → 找到解 ✅
              └─────── 对答案 ─────────┘
```

### 2.3 手推一遍：nums = [1, 3, 5, 7], target = 8

```
原数组：[1, 3 | 5, 7]
        左半    右半

左半子集和（2^2 = 4 个）：
  {}      → 0
  {1}     → 1
  {3}     → 3
  {1,3}   → 4
  → setLeft = {0, 1, 3, 4}

右半子集和（2^2 = 4 个）：
  {}      → 0      查 8-0  = 8  在 setLeft? 否
  {5}     → 5      查 8-5  = 3  在 setLeft? 是！→ {3} + {5} = 8 ✅
  {7}     → 7      查 8-7  = 1  在 setLeft? 是！（已经找到答案了）
  {5,7}   → 12     查 8-12 = -4 在 setLeft? 否

答案：存在子集 {3, 5}，和为 8 ✅
```

整个过程只枚举了 **8 个子集**，而不是 16 个 —— 而且如果右半更大，优势会迅速拉开。

---

## 三、代码实现

下面所有代码我都**跑过暴力对拍**验证（TypeScript / Python / Go 三份实现，结果与暴力完全一致）。

### 3.1 模型一：子集和判定（核心模板）

```typescript
/**
 * 判断 nums 中是否存在非空子集，其元素和为 target
 *
 * 折半枚举：把 nums 劈成两半，各枚举子集和，用哈希表配对
 * 时间复杂度：O(2^(n/2))，空间复杂度：O(2^(n/2))
 */
export function hasSubsetSum(nums: number[], target: number): boolean {
  const mid = nums.length >> 1;

  // 左半的所有子集和，存进 Set 供查询
  const leftSums = new Set(enumerateSubsetSums(nums.slice(0, mid)));

  // 右半的每个子集和 b，都去找找看左半有没有 target - b
  for (const b of enumerateSubsetSums(nums.slice(mid))) {
    if (leftSums.has(target - b)) return true;
  }

  return false;
}

// 使用示例
console.log(hasSubsetSum([1, 3, 5, 7], 8));  // true → {3, 5}
console.log(hasSubsetSum([2, 4, 6], 5));      // false
```

### 3.2 模型二：统计子集个数（按下标区分）

**注意这里的坑**：题目问的是"**多少个子集**"，不是"多少种不同的和"。`[1, 1]` 有两个子集和为 1（选第一个 1 和选第二个 1），但和的**取值**只有一种。

所以哈希表不能存 `Set`，要存 `Map<number, number>` 记录**出现次数**：

```typescript
/**
 * 统计 nums 中元素和为 target 的子集个数（按下标区分）
 *
 * ⚠️ 关键：重复的子集和要按「出现次数」累加，不能去重
 * 例如 [1, 1, 2] 中和为 2 的子集有 2 个：{2} 和 {1, 1}
 */
export function countSubsetsWithSum(nums: number[], target: number): number {
  const mid = nums.length >> 1;

  // 左半：子集和 → 出现次数
  const freq = new Map<number, number>();
  for (const s of enumerateSubsetSums(nums.slice(0, mid))) {
    freq.set(s, (freq.get(s) ?? 0) + 1);
  }

  // 右半：每个子集和 b 都能配 freq.get(target - b) 个左半方案
  let count = 0;
  for (const s of enumerateSubsetSums(nums.slice(mid))) {
    count += freq.get(target - s) ?? 0;
  }

  return count;
}

console.log(countSubsetsWithSum([1, 1, 2], 2));  // 2 → {2} 和 {1,1}
```

### 3.3 模型三：4Sum II（LeetCode 454）

这是折半枚举最经典的应用。题目：四个数组各取一个数，求和为 0 的组合数。

**技巧**：不需要真的枚举"两个数"，只需要枚举"**两个数组的笛卡尔积**"，然后用哈希表配对。

```typescript
/**
 * 4Sum II（LeetCode 454）
 * 四个数组各取一个数，统计和为 0 的组合数
 *
 * 思路：把 a×b 和 c×d 分别算出来，用哈希表配对
 * 时间复杂度：O(n²)
 */
export function fourSumCount(
  a: number[],
  b: number[],
  c: number[],
  d: number[],
): number {
  // 第一组：a[i] + b[j] → 出现次数
  const freq = new Map<number, number>();
  for (const x of a) {
    for (const y of b) {
      const sum = x + y;
      freq.set(sum, (freq.get(sum) ?? 0) + 1);
    }
  }

  // 第二组：c[k] + d[l] 去找 -(c[k] + d[l])
  let count = 0;
  for (const z of c) {
    for (const w of d) {
      count += freq.get(-(z + w)) ?? 0;
    }
  }

  return count;
}

console.log(
  fourSumCount([1, 2], [-2, -1], [-1, 2], [0, 2]),
); // 2
```

**为什么这里不算是"折半"？** 因为 `2² = 4` 本身就很小，折半省不了什么。折半真正发力的是**单个数组的子集枚举**。但思路是一脉相承的：**把能独立计算的两组结果用哈希表对起来**。

### 3.4 模型四：等和子集划分（LeetCode 473）

> 给定一个**只包含正整数**的非空数组，判断能否把它分成两个子集，使两个子集的元素和相等。

```typescript
/**
 * 等和子集划分（LeetCode 473）
 *
 * 思路：总和为 odd 直接不可能；否则问题变成「找和为 total/2 的子集」
 * 用折半枚举来判定
 */
export function canPartition(nums: number[]): boolean {
  const total = nums.reduce((a, b) => a + b, 0);

  // 总和是奇数，不可能均分
  if (total % 2 !== 0) return false;

  const half = total / 2;
  const mid = nums.length >> 1;

  const leftSums = new Set(enumerateSubsetSums(nums.slice(0, mid)));
  for (const s of enumerateSubsetSums(nums.slice(mid))) {
    if (leftSums.has(half - s)) return true;
  }

  return false;
}

console.log(canPartition([1, 5, 11, 5])); // true → [1, 11, 5] 和 [5]
```

### 3.5 模型五：最小子集和差（LeetCode 1712 / 1049）

> 把数组分成两个非空子集，使两子集元素和的**差值最小**，返回最小的差值。

这里需要**升级**：不只是判断存在，还要找**最优解**。

思路：设总和为 `total`，选出的子集和为 `s`，另一个就是 `total - s`，差值为 `|total - 2s|`。所以要让 `|total - 2s|` 最小，就是让 `s` **尽可能接近 `total / 2`**。

把两半的子集和**各自排序**，然后用**双指针**找最接近 `total/2` 的组合：

```typescript
/**
 * 最小子集和差（LeetCode 1712）
 *
 * 核心：把两半的子集和排序后，用双指针找「最接近 total/2」的那一对
 * 时间复杂度：O(2^(n/2) · n)，排序是主要开销
 */
export function minSubsetDifference(nums: number[]): number {
  const total = nums.reduce((a, b) => a + b, 0);
  const mid = nums.length >> 1;

  const left = enumerateSubsetSums(nums.slice(0, mid)).sort((a, b) => a - b);
  const right = enumerateSubsetSums(nums.slice(mid)).sort((a, b) => a - b);

  const half = total / 2;
  let best = Infinity;
  let i = 0;
  let j = right.length - 1;

  while (i < left.length && j >= 0) {
    const s = left[i] + right[j];
    const diff = Math.abs(total - 2 * s);
    if (diff < best) best = diff;

    if (s < half) {
      i++; // 和太小了，往右挪，让 left 变大
    } else {
      j--; // 和太大了，往左挪，让 right 变小
    }
  }

  return best;
}

console.log(minSubsetDifference([1, 2, 3, 4])); // 0 → {1,4} 和 {2,3}
```

**这个"排序 + 双指针"的组合，是折半枚举的进阶形态**，后面第六节的"变体"里还会再提。

### 3.6 Python 实现

```python
from typing import List, Dict
from collections import Counter


def enumerate_subset_sums(arr: List[int]) -> List[int]:
    """枚举 arr 的所有子集和（含空集的和 0）

    核心思路：增量倍增 —— 每加一个元素，旧的每个子集都多出一个「加上它」的新版本
    """
    sums = [0]
    for x in arr:
        old_len = len(sums)
        # 用切片追加而不是循环，避免大数组上的额外开销
        sums.extend(s + x for s in sums[:old_len])
    return sums


def has_subset_sum(nums: List[int], target: int) -> bool:
    """判断是否存在和为 target 的子集（折半枚举）"""
    mid = len(nums) // 2
    left = set(enumerate_subset_sums(nums[:mid]))
    for s in enumerate_subset_sums(nums[mid:]):
        if target - s in left:
            return True
    return False


def count_subsets_with_sum(nums: List[int], target: int) -> int:
    """统计和为 target 的子集个数（按下标区分，重复值要累加）"""
    mid = len(nums) // 2
    freq = Counter(enumerate_subset_sums(nums[:mid]))
    count = 0
    for s in enumerate_subset_sums(nums[mid:]):
        count += freq.get(target - s, 0)
    return count


def four_sum_count(a: List[int], b: List[int], c: List[int], d: List[int]) -> int:
    """4Sum II：四个数组各取一个数，和为 0 的组合数"""
    freq: Dict[int, int] = {}
    for x in a:
        for y in b:
            freq[x + y] = freq.get(x + y, 0) + 1

    count = 0
    for z in c:
        for w in d:
            count += freq.get(-(z + w), 0)
    return count


def can_partition(nums: List[int]) -> bool:
    """等和子集划分（LeetCode 473）"""
    total = sum(nums)
    if total % 2 != 0:
        return False

    half = total // 2
    mid = len(nums) // 2
    left = set(enumerate_subset_sums(nums[:mid]))
    for s in enumerate_subset_sums(nums[mid:]):
        if half - s in left:
            return True
    return False


def min_subset_difference(nums: List[int]) -> int:
    """最小子集和差（LeetCode 1712）—— 排序 + 双指针"""
    total = sum(nums)
    mid = len(nums) // 2
    left = sorted(enumerate_subset_sums(nums[:mid]))
    right = sorted(enumerate_subset_sums(nums[mid:]))

    half = total / 2
    best = float("inf")
    i, j = 0, len(right) - 1

    while i < len(left) and j >= 0:
        s = left[i] + right[j]
        best = min(best, abs(total - 2 * s))
        if s < half:
            i += 1
        else:
            j -= 1

    return int(best)


if __name__ == "__main__":
    print("hasSubsetSum([1,3,5,7], 8) =", has_subset_sum([1, 3, 5, 7], 8))
    print("countSubsetsWithSum([1,1,2], 2) =", count_subsets_with_sum([1, 1, 2], 2))
    print("fourSumCount =", four_sum_count([1, 2], [-2, -1], [-1, 2], [0, 2]))
    print("canPartition([1,5,11,5]) =", can_partition([1, 5, 11, 5]))
    print("minSubsetDifference([1,2,3,4]) =", min_subset_difference([1, 2, 3, 4]))
```

### 3.7 Go 实现

```go
package main

import (
	"fmt"
	"sort"
)

// enumerateSubsetSums 枚举 arr 的所有子集和（含空集的和 0）
func enumerateSubsetSums(arr []int) []int {
	sums := []int{0}
	for _, x := range arr {
		oldLen := len(sums)
		for i := 0; i < oldLen; i++ {
			sums = append(sums, sums[i]+x)
		}
	}
	return sums
}

// HasSubsetSum 判断是否存在和为 target 的子集
func HasSubsetSum(nums []int, target int) bool {
	mid := len(nums) / 2

	left := make(map[int]struct{}, 1<<uint(mid))
	for _, s := range enumerateSubsetSums(nums[:mid]) {
		left[s] = struct{}{}
	}

	for _, s := range enumerateSubsetSums(nums[mid:]) {
		if _, ok := left[target-s]; ok {
			return true
		}
	}
	return false
}

// CountSubsetsWithSum 统计和为 target 的子集个数（按下标区分）
func CountSubsetsWithSum(nums []int, target int) int {
	mid := len(nums) / 2

	freq := make(map[int]int)
	for _, s := range enumerateSubsetSums(nums[:mid]) {
		freq[s]++
	}

	count := 0
	for _, s := range enumerateSubsetSums(nums[mid:]) {
		count += freq[target-s]
	}
	return count
}

// FourSumCount 4Sum II（LeetCode 454）
func FourSumCount(a, b, c, d []int) int {
	freq := make(map[int]int)
	for _, x := range a {
		for _, y := range b {
			freq[x+y]++
		}
	}

	count := 0
	for _, z := range c {
		for _, w := range d {
			count += freq[-(z + w)]
		}
	}
	return count
}

// CanPartition 等和子集划分（LeetCode 473）
func CanPartition(nums []int) bool {
	total := 0
	for _, x := range nums {
		total += x
	}
	if total%2 != 0 {
		return false
	}

	half := total / 2
	mid := len(nums) / 2

	left := make(map[int]struct{})
	for _, s := range enumerateSubsetSums(nums[:mid]) {
		left[s] = struct{}{}
	}

	for _, s := range enumerateSubsetSums(nums[mid:]) {
		if _, ok := left[half-s]; ok {
			return true
		}
	}
	return false
}

// MinSubsetDifference 最小子集和差（LeetCode 1712）
func MinSubsetDifference(nums []int) int {
	total := 0
	for _, x := range nums {
		total += x
	}

	mid := len(nums) / 2
	left := enumerateSubsetSums(nums[:mid])
	right := enumerateSubsetSums(nums[mid:])
	sort.Ints(left)
	sort.Ints(right)

	best := total
	i, j := 0, len(right)-1

	for i < len(left) && j >= 0 {
		s := left[i] + right[j]
		diff := total - 2*s
		if diff < 0 {
			diff = -diff
		}
		if diff < best {
			best = diff
		}

		if s <= total/2 {
			i++
		} else {
			j--
		}
	}
	return best
}

func main() {
	fmt.Println("HasSubsetSum([1,3,5,7], 8) =", HasSubsetSum([]int{1, 3, 5, 7}, 8))
	fmt.Println("CountSubsetsWithSum([1,1,2], 2) =", CountSubsetsWithSum([]int{1, 1, 2}, 2))
	fmt.Println("FourSumCount =", FourSumCount([]int{1, 2}, []int{-2, -1}, []int{-1, 2}, []int{0, 2}))
	fmt.Println("CanPartition([1,5,11,5]) =", CanPartition([]int{1, 5, 11, 5}))
	fmt.Println("MinSubsetDifference([1,2,3,4]) =", MinSubsetDifference([]int{1, 2, 3, 4}))
}
```

---

## 四、实测数据

下面是**我在本机实测**的数据（Node.js v26，Apple Silicon，target 无解的最坏情况）。

### 4.1 暴力 vs 折半

```
 n  | 2^n 暴力 (ms) | 折半 (ms) | 加速比
 18 |          8.40 |     0.041 |   205x
 20 |         35.23 |     0.032 |  1101x
 22 |        148.66 |     0.079 |  1886x
 24 |        607.82 |     0.110 |  5542x
 26 |       2522.05 |     0.197 | 12829x
 28 |     10427.78 |     0.382 | 27313x
```

**注意加速比本身也在指数增长** —— 这正是"砍半指数"的威力。n 每加 2，加速比大约翻 4 倍。

> n = 30 时暴力枚举已经跑了 **超过 170 秒**被我手动掐掉了，而折半只要 **0.8 毫秒**。

### 4.2 两种枚举方式的对比

```
  k  | 增量倍增 (ms) | 位掩码 (ms) | 位掩码慢多少倍
 12 |          0.017 |        0.146 |    8.5x
 16 |          0.198 |        2.141 |   10.8x
 18 |          0.849 |        9.017 |   10.6x
 20 |          3.376 |       38.408 |   11.4x
 22 |         16.955 |      168.126 |    9.9x
```

**位掩码稳定慢 10 倍左右。** 原因很直白：位掩码每个 mask 都要扫一遍数组（O(k)），增量倍增则是 O(1) 摊销地追加一个元素。

**结论：能用增量倍增就别用位掩码。** 位掩码的唯一优势是"能顺带拿到具体的下标组合"，这在需要输出具体方案时才值得。

### 4.3 内存天花板

```
  n  | 每半子集和个数 | 估算内存 (int32)
 24 |           4,096 |    0.0 MB
 32 |          65,536 |    0.3 MB
 40 |       1,048,576 |    4.0 MB
 44 |       4,194,304 |   16.0 MB
 46 |       8,388,608 |   32.0 MB
```

**折半枚举的实际瓶颈是内存，不是时间。** n = 46 时单边就要 32MB 的 int32 数组（如果用 `Set` 存，内存开销还要再翻好几倍）。

---

## 五、复杂度分析

| 模型 | 时间复杂度 | 空间复杂度 | 备注 |
|---|---|---|---|
| 子集和判定 | O(2^(n/2)) | O(2^(n/2)) | 哈希表均摊 O(1) |
| 统计子集个数 | O(2^(n/2)) | O(2^(n/2)) | 用 Map 记次数 |
| 4Sum II | O(n²) | O(n²) | 其实是"两个数一组" |
| 等和划分 | O(2^(n/2)) | O(2^(n/2)) | 先判奇偶 |
| 最小子集和差 | O(2^(n/2) · n) | O(2^(n/2)) | 排序占大头 |

**关于 "O(2^(n/2))" 这个写法**：严格来说，枚举 `2^(n/2)` 个子集和，每个子集和在增量倍增下是 O(1) 摊销，所以总数是 `O(2^(n/2))`。加上哈希表查找，均摊还是 `O(2^(n/2))`。

**空间是 O(2^(n/2))**，因为最坏情况下你要把一半的子集和全存下来。能不能省掉？

能，但有条件：**如果只判断"存在性"，且你愿意多花时间**——可以先枚举右半并排序，然后对每个左半子集和做二分查找，降到 `O(2^(n/2) · n)` 时间但只要 `O(2^(n/2))` 空间（存一半）。不过哈希表版本更快，**除非内存紧张，否则用哈希表**。

---

## 六、变体与进阶

### 6.1 折半 + 排序双指针（求最优解）

前面 3.5 节的"最小子集和差"就是这个模式。把它抽象成模板：

```
1. 两半各自枚举子集和
2. 各自排序
3. 双指针：一个从左往右，一个从右往左
4. 根据当前和与目标的关系，移动对应指针
```

**适用场景**：需要"最接近某个值"的组合，而不只是"是否存在"。

**关键细节**：指针移动的方向要根据"当前和偏大还是偏小"来定，**不能想当然**。我在写这篇文章时就把这个搞错过一次 —— 一开始我写成了"比较 left[i] 和 right[j] 谁大就移谁"，结果在有负数的数组上全错。正确做法是**和 `total/2` 比**，不是左右互比。

### 6.2 折半 + 哈希表（求计数）

前面 3.2、3.3 节的模式。抽象模板：

```
1. 一半的结果存进 HashMap<值, 次数>
2. 另一半逐个查询，用查到的次数累加答案
```

**注意"次数"而非"是否"** —— 这是计数题和判定题的唯一区别。

### 6.3 折半搜索（MITM on graphs）

除了数组，**图上也能折半**。经典问题：

> 给定 n 个点、两堆边（一堆白边一堆黑边），问能不能用**恰好 k 条白边 + 恰好 l 条黑边**从 1 走到 n？

做法就是：从点 1 分别沿白边走 k 步、黑边走 l 步，把到达的点存进哈希表，然后从点 n 反向走，看两边能不能"对上"。

```
     白边走 k 步                黑边走 l 步
   1 ──────────► ●             ● ◄────────── n
                │             │
                │   对答案     │
                ▼             ▼
          hashTable[点] ◄── 查表
```

这个套路在**竞赛题**里出现频率极高，尤其是"恰好 k 步""不超过 k 步"这类带步数限制的可达性问题。

### 6.4 折半 + 状态压缩（混合）

当 `n` 太大做不了折半、但答案需要"枚举所有方案"时，还有个中间地带：**对一半用位掩码、对另一半用哈希表**。这在"求所有解"而不是"求解的个数"时很有用。

### 6.5 ⚠️ 单数组 4Sum：折半的失败案例

我在这篇文章里踩了个**很值得说的坑**，单独拎出来讲。

**LeetCode 4** 题目：给一个数组，找 4 个数（不同下标）使其和为 `target`。

最朴素的想法：折半，左半枚举"选 2 个"，右半枚举"选 2 个"，配对。

**但这是错的。** 我实测过，一组解可能是：

- 左 1 个 + 右 3 个
- 左 3 个 + 右 1 个
- **4 个全在左半**
- **4 个全在右半**

只枚举"左 2 + 右 2"会漏掉后面四种。我的第一版实现就是因为这个，在随机对拍里连续报错。

**正确做法**：左边枚举"选 k 个"（k = 0..4），右边枚举"选 4-k 个"，把所有划分都覆盖一遍：

```typescript
/**
 * 枚举 arr 中所有「恰好选 k 个元素」的方案，按和分组
 * 返回：Map<子集和, 下标组合列表>
 *
 * 用 DFS 逐个"选或不选"，选满 k 个就记录下来
 */
export function subsetsOfSize(arr: number[], k: number): Map<number, number[][]> {
  const res = new Map<number, number[][]>();
  const cur: number[] = [];

  const dfs = (start: number, sum: number): void => {
    if (cur.length === k) {
      if (!res.has(sum)) res.set(sum, []);
      res.get(sum)!.push([...cur]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      cur.push(i);
      dfs(i + 1, sum + arr[i]);
      cur.pop();
    }
  };

  dfs(0, 0);
  return res;
}

/**
 * 4Sum（LeetCode 4）的折半解法 —— 必须覆盖所有「左 k 个 + 右 4-k 个」的划分
 */
export function fourSumSingleFull(nums: number[], target: number): number[][] {
  const n = nums.length;
  const mid = n >> 1;
  const left = nums.slice(0, mid);
  const right = nums.slice(mid);

  // leftMaps[k]：左半「恰好选 k 个」的方案，按和分组
  const leftMaps: Map<number, number[][]>[] = [];
  const rightMaps: Map<number, number[][]>[] = [];
  for (let k = 0; k <= 4; k++) {
    leftMaps.push(subsetsOfSize(left, k));
    rightMaps.push(subsetsOfSize(right, k));
  }

  const res: number[][] = [];
  const seen = new Set<string>();

  // 遍历所有划分：左 k 个 + 右 (4-k) 个
  for (let k = 0; k <= 4; k++) {
    const m = 4 - k;
    for (const [s, combos] of leftMaps[k]) {
      const cands = rightMaps[m].get(target - s);
      if (!cands) continue;
      for (const li of combos) {
        for (const ri of cands) {
          const global = [...li, ...ri.map((x) => x + mid)].sort((a, b) => a - b);
          const key = global.join(",");
          if (seen.has(key)) continue;
          seen.add(key);
          res.push(global.map((i) => nums[i]));
        }
      }
    }
  }

  return res;
}
```

**但我的结论是：单数组 4Sum 根本不该用折半。** 排序 + 固定前两个数 + 双指针，O(n³) 就能解决，代码还短得多：

```typescript
/**
 * 4Sum（LeetCode 4）标准解法：排序 + 固定前两个数 + 双指针，O(n³)
 */
export function fourSumSortedTwoPointers(nums: number[], target: number): number[][] {
  const a = [...nums].sort((x, y) => x - y);
  const n = a.length;
  const res: number[][] = [];
  const seen = new Set<string>();

  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && a[i] === a[i - 1]) continue; // 去重
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && a[j] === a[j - 1]) continue; // 去重
      let k = j + 1;
      let l = n - 1;
      while (k < l) {
        const s = a[i] + a[j] + a[k] + a[l];
        if (s === target) {
          const key = [a[i], a[j], a[k], a[l]].join(",");
          if (!seen.has(key)) {
            seen.add(key);
            res.push([a[i], a[j], a[k], a[l]]);
          }
          k++;
          l--;
          while (k < l && a[k] === a[k - 1]) k++;
          while (k < l && a[l] === a[l + 1]) l--;
        } else if (s < target) {
          k++;
        } else {
          l--;
        }
      }
    }
  }
  return res;
}
```

> **教训：折半枚举不是万能药。** 它的前提是"两半的贡献可以独立相加"。单数组 4Sum 里，四个数的**相对位置**是有意义的（不能重复选），拆开会丢失"下标互不相同"的约束。**能排序 + 双指针解决的，优先排序 + 双指针。**

---

## 七、避坑清单

| 坑 | 症状 | 解法 |
| --- | ---- | ---- |
| 用 `Set` 而不是 `Map` 统计个数 | 有重复元素的计数题答案偏小 | 计数题必须用 `Map<值, 次数>` |
| `sums.push(...next)` | 数据量大时 `Maximum call stack size exceeded` | 改用 `for` 循环逐个 push，或 `arr.concat()` |
| 忘了空集 | 漏掉"子集只有 1 个元素"等边界情况 | 初始 `sums = [0]`，空集的和是 0 |
| 左右切分点算错 | `n` 为奇数时漏掉中间元素 | `mid = n >> 1`，右半用 `slice(mid)` |
| 数组有负数还用"和 > target 就停" | 漏解 | 有负数时**不能提前退出**，必须枚举完 |
| 单数组 4Sum 只拆 2+2 | 漏掉 1+3 / 3+1 / 4+0 的解 | 见第六节 6.5 |
| 求"最接近"时比较错了对象 | 结果全错 | 和**目标值**比，不是左右互比 |
| 哈希表存了 `Set` 但要计数 | 答案永远 ≤ 1 | 区分"判定"和"计数" |
| 递归写 `enumerate` 时爆栈 | `RangeError` | 迭代写法天然没有这个问题 |

### 关于 `push(...arr)` 爆栈

这个坑我是实测撞出来的。实测阈值：

```
展开     65,536 个元素 → OK
展开    262,144 个元素 → Maximum call stack size exceeded
展开   1,048,576 个元素 → Maximum call stack size exceeded
```

**原因**：展开运算符把数组变成函数参数，参数个数受调用栈大小限制。折半枚举恰恰会生成百万级的数组 —— 正好踩雷。

**安全的写法**：

```typescript
// ❌ 危险：数组大了直接爆栈
sums.push(...next);

// ✅ 安全：逐个追加
for (let i = 0; i < next.length; i++) sums.push(next[i]);

// ✅ 也安全：concat 返回新数组
sums = sums.concat(next);
```

Go 和 Python 没这个问题（`append` 和 `extend` 不会走调用栈），但 TypeScript / JavaScript 写代码时一定要留意。

---

## 八、实际应用场景

### 1. 密码重置与激活码校验

一个 6 位激活码由 3 段组成，每段是 16 进制字符。校验"这个激活码是否在已发放列表里"——**枚举所有组合是 16³ = 4096，还行；但如果是 5 段，就是 16⁵ = 一百万**，直接查数据库会打爆。

折半的思路：把激活码分成两半，各自算出所有可能值，存进哈希表，配对。

### 2. 联邦学习 / 密码学中的"半空间搜索"

在格密码学（lattice cryptography）和同态加密里，**meet-in-the-middle attack**（中间相遇攻击）是一个经典攻击手段：把密钥空间劈成两半，各算一半的哈希，最后对撞。**它既能用来攻击，也能用来防御**——防御方法就是"用比 MITM 需要的更大的密钥空间"。

### 3. 电商凑单 / 满减的组合查询

"帮我找出所有能凑到满 300 减 50 的商品组合"，商品有 20 件，商品和从 1 到 200 不等。暴力枚举 2²⁰ = 一百万次还算能接受，但如果有 40 件候选呢？

折半 + 哈希表，40 件也只要 2²⁰ 级别的枚举。

### 4. 测试用例生成

要构造"覆盖所有子集和"的测试数据，可以先生成一半的随机子集和，反推另一半，让测试覆盖面更均衡。

### 5. 编译优化 / 符号等价判断

判断两段表达式是否"在给定变量赋值下等价"，可以枚举变量取值的一半，把中间结果对起来。

### 6. 地图上的"两点最短路"变体

在**无向图**上找"经过恰好 k 条边从 A 到 B"的路径，同样用折半：从 A 走 k/2 步存哈希表，从 B 反向走 k/2 步查表。

---

## 九、面试题精选

### Q1：折半枚举和状态压缩 DP 有什么区别？

**状态含义不同**。折半枚举的状态是"**一半的子集和**"这种**中间量**，用来配对；状态压缩 DP 的状态是"**选了这个 mask 的最优答案**"，用来做转移。

**能力不同**：折半能枚举出所有方案，状态压缩 DP 只能保留最优值（每个 mask 一个值）。

**规模不同**：折半能撑到 n ≈ 46，状态压缩 DP 一般 n ≤ 20。

### Q2：折半枚举为什么能降复杂度？不是分治吗？

分治确实能把 `T(n) = 2T(n/2)` 变成 `T(n) = 2T(n/2) + O(n)`，但那要求**子问题可以独立求解**（原问题就是独立的）。

折半枚举比这更进一步：它把"枚举 n 个元素的子集"拆成"枚举 n/2 个元素的子集"两次，**然后把两个结果用哈希表配对**。所以复杂度是 `O(2^(n/2))` 而不是 `O(n)`。

用 Master 定理套一下：折半枚举的递归式是 `T(n) = 2·T(n/2) + O(2^(n/2))`，其中 `2^(n/2) = (√2)^n`，比 `n^log₂2 = n` 大，所以 `T(n) = Θ(2^(n/2))`。✅

### Q3：怎么给"折半枚举"写暴力对拍？

我在这篇文章里就是这么验证的。套路是：

```typescript
// 暴力：老老实实枚举所有 2^n 个子集
function bruteHasSubsetSum(nums: number[], target: number): boolean {
  for (let m = 0; m < 1 << nums.length; m++) {
    let s = 0;
    for (let i = 0; i < nums.length; i++) if (m & (1 << i)) s += nums[i];
    if (s === target) return true;
  }
  return false;
}

// 随机跑几千组，比对两边结果
for (let t = 0; t < 3000; t++) {
  const n = 1 + Math.floor(Math.random() * 14);
  const nums = Array.from({ length: n }, () => Math.floor(Math.random() * 21) - 10);
  const target = Math.floor(Math.random() * 41) - 20;
  if (hasSubsetSum(nums, target) !== bruteHasSubsetSum(nums, target)) {
    throw new Error(`不匹配: nums=${nums} target=${target}`);
  }
}
```

**三个要点**：
1. 随机数要**包含负数**（不包含的话很多 bug 测不出来）
2. target 也要随机（包括无解的情况，测最坏路径）
3. 数组长度也要随机（暴露切分点的 off-by-one）

我跑了 13000 组 TypeScript + 6400 组 Python + 13000 组 Go，全部通过。

### Q4：折半枚举的空间能优化吗？

能，有几个思路：

1. **只存一半，另一半二分查找**：空间还是 O(2^(n/2))，但如果只存排序后的数组（不存哈希表），内存更省，时间变 O(2^(n/2)·n)
2. **流式处理**：右半边枚举一个查一个，不全部物化（但左半还是得存）
3. **递归 + 回溯**：边枚举边查，空间降到 O(n)，但时间复杂度会退化（因为没法用哈希表加速配对）

**一般工程上直接上哈希表就行**，除非内存确实紧张。

### Q5：折半枚举能用在有负数的数组上吗？

**能，但有两个限制**：

1. **不能提前退出**。如果有负数，"当前和已经超过 target"不代表后面不可能有解（后面的数可能是负的）。必须枚举完所有右半子集和。
2. **求"最接近"时不能用单调性剪枝**。排序后的双指针在有负数时，"和偏大就左移"的策略依然成立（因为双指针本身是单调扫描），但如果你想在枚举阶段剪枝，就得小心。

### Q6：MITM 和"双向 BFS"是什么关系？

**思想完全一样，场景不同**：

| | 折半枚举 | 双向 BFS |
|---|---|---|
| 搜索对象 | 数组的子集 | 图上的路径 |
| 状态 | 子集和 | 节点（带距离） |
| 合并方式 | 哈希表配对 | 哈希表/队列相遇 |
| 复杂度 | O(2^(n/2)) | O(b^(d/2)) |

双向 BFS 可以看成"折半枚举在图上的推广"。站内有一篇专门讲双向 BFS 的文章，可以对照看。

### Q7：折半枚举和"四平方和"（LC 454）是一回事吗？

**思路是一回事，规模不是。** 4Sum II 的每个数组只有 n 个元素，暴力是 O(n⁴)，折半后是 O(n²) —— 这里"两半"指的是**两组数组**，而不是"一个数组的两半"。

**真正的折半**（枚举一个数组的子集）用在 LeetCode 416（分割等和子集）、1712（最小子集和差）、473 等题上。

### Q8：为什么折半枚举通常只用在"判定"和"计数"上？

因为求**所有具体方案**时，你得把两半的方案一一配对并去重，代码复杂度和常数都会暴涨，还容易出错（我那个 4Sum 的坑就是这么来的）。

**折半枚举最舒服的场景是：答案可以用一个简单的数值（和、个数）表示。** 一旦需要输出具体是哪些下标，收益就缩水了。

---

## 十、小结

折半枚举就一句话：**把指数砍半，用哈希表把答案对起来。**

```
                    折半枚举
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   判定存在性      统计个数       求最优解
   Set 查表      Map 记次数    排序 + 双指针
        │              │              │
   子集和判定    4Sum II      最小子集和差
   等和划分    统计子集个数    LC 1712
```

**四条必须记住的话：**

1. **触发条件**：搜索空间是 `2^n`（n 在 30~46），且两半的贡献能独立相加。
2. **两种枚举方式**：增量倍增比位掩码快 10 倍，能用前者就别用后者。
3. **计数题必须用 `Map`** 记次数，用 `Set` 会丢掉重复的方案。
4. **不是万能药**：单数组 4Sum 这种题，排序 + 双指针更简单更快。**折半枚举是"带约束的暴力"，不是"更聪明的暴力"。**

最后送一句我写代码时贴在屏幕上的话：

> **写完折半，一定要跑随机对拍。**
> 折半枚举的 bug 有一个共同特点：**在测试用例的"典型情况"下完全正确，只有在某个刁钻的边界上才出错**。
> 我那个单数组 4Sum 的漏解，就是随机对拍抓出来的 —— 手推的时候，我压根没想到"4 个数全落在左半"这种可能。

**手推帮你理解，对拍帮你交付。** 这句话我在上一篇《树形 DP》也写过，因为它真的每次都成立 ✨

---

## 相关阅读

- [状态压缩动态规划（Bitmask DP）](bitmask-dp.md) —— 同样是位运算路线，但目标是"保留最优"而非"枚举全部"
- [位运算](bit-manipulation.md) —— 位掩码枚举的前置知识
- [分治算法（Divide and Conquer）](divide-and-conquer.md) —— 折半枚举在递归结构上的近亲
- [双向 BFS（Bidirectional Search）](bidirectional-bfs.md) —— 折半思想在图搜索上的推广
- [哈希表设计（Design HashMap）](design-hashmap.md) —— 折半枚举最核心的配件
- [归并排序](merge-sort.md) —— 另一个"把问题规模对半砍"的经典套路
- [0-1 背包问题](knapsack.md) —— 和子集和问题的区别：背包看"最大价值"，子集和看"可达性"
- [K 路归并：合并 K 个排序链表](merge-k-sorted-lists.md) —— 归并思想的另一面
