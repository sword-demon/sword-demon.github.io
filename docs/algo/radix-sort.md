---
title: 基数排序
description: 基数排序（Radix Sort）—— 按位分桶的线性排序算法，从原理到 LSD/MSD 实现再到工程应用
date: 2026-09-24 09:00:24
categories:
  - Algorithm
tags:
  - radix-sort
  - sorting
  - linear-sort
sidebarSort: 88
---

# 基数排序（Radix Sort）

你有没有想过这个问题——为什么 Java 的 `Arrays.sort()` 对 `int[]` 用的是 **Dual-Pivot QuickSort**，但某些数据库（比如 PostgreSQL）对纯数字排序时反而用了一种"按位分桶"的诡异算法？

这就是 **基数排序（Radix Sort）**。它能在 **O(n)** 时间内排完 n 个数，比任何基于比较的排序（O(n log n)）都快一个量级。听起来违反常识对吧？比较排序不是有个 **Ω(n log n) 的下界**吗？没错，但基数排序压根不是基于比较的——它利用了"整数可以用二进制/十进制表示"这个性质，直接绕过比较下界 ✨。

今天我们就来聊聊这个"非比较排序之王"。

## 原理拆解

### 核心直觉：先排个位，再排十位

想象你有一堆扑克牌要排序，牌面是数字 0~99（两位数）。最直觉的办法是从左到右比大小，但有个更巧妙的办法：

1. **先按个位数**把所有牌分成 10 堆（0~9），每堆内部顺序无所谓
2. 把 10 堆按 0→9 的顺序**收成一摞**
3. **再按十位数**把这一摞牌分成 10 堆（0~9）
4. 再按 0→9 的顺序收成一摞

收完之后，整摞牌就是有序的！为什么？因为低位先排保证了个位的相对顺序，高位再排时高位相同的元素之间，相对顺序由低位的排决定——这就是**稳定排序（Stable Sort）**的关键作用。

```
初始乱序：[13, 25, 9, 38, 41, 6, 52, 17]

按个位分桶（桶号 = num % 10）：
  桶0:
  桶1:  41
  桶2:
  桶3:  13
  桶4:
  桶5:  25
  桶6:  6
  桶7:  17
  桶8:  38
  桶9:  9

按桶号 0→9 收集：[41, 13, 25, 6, 17, 38, 9]

按十位分桶（桶号 = Math.floor(num / 10)）：
  桶0:  6, 9
  桶1:  13, 17
  桶2:  25
  桶3:  38
  桶4:  41
  桶5:  52
  桶6~9: (空)

按桶号 0→9 收集：[6, 9, 13, 17, 25, 38, 41, 52]  ✅ 排好啦！
```

你看，两轮分桶就完成了排序。这就是**LSD（Least Significant Digit，最低位优先）基数排序**的精髓。

### 为什么稳定排序这么重要？

来，我给你看个反例。如果分桶时用**不稳定**的排序（比如用 `Array.sort` 默认实现），高位相同的元素之间的顺序会被打乱，结果就乱了：

```
按个位分桶：13 和 33 都进桶3
如果桶内顺序被打乱：[33, 13] → 收集后变成 [33, 13]
按十位分桶：两者都进桶3，桶内顺序是 [33, 13]
最后收集：[..., 33, 13, ...] ❌ 13 和 33 顺序反了！
```

所以**每一位的分桶过程必须是稳定的**——这就是为什么基数排序几乎总是配合**计数排序（Counting Sort）**使用，因为计数排序天然稳定。

### 从十进制到二进制：为什么基数排序在计算机里更快

你可能注意到上面的例子里我用的是十进制（基数 = 10）。但在计算机里，我们其实更常用 **基数 = 256 或 65536**（一个字节或两个字节），为啥？

- **基数越大**，需要的位数越少（log₂₅₆(2³²) = 4 轮就够了）
- **基数越小**，每轮桶操作越快（2 个桶 32 轮也行）

实测下来，**基数 = 256**（按字节分桶）通常是甜点级选择。这也是大多数工业级基数排序库的默认选择。

```
32 位整数 [0x4A3F, 0x1234, 0x4A2B, 0x1234]

按最低字节（基 = 256）：
  0x4A3F → 桶 0x3F
  0x1234 → 桶 0x34
  0x4A2B → 桶 0x2B
  0x1234 → 桶 0x34
  → 桶 0x34 里两个 0x1234 的相对顺序必须保留！

按次低字节：0x4A3F → 桶 0x4A；0x1234 → 桶 0x23；0x4A2B → 桶 0x4A

按次高字节：0x4A3F → 桶 0x00；0x1234 → 桶 0x01；0x4A2B → 桶 0x00

按最高字节：0x4A3F → 桶 0x00；0x1234 → 桶 0x00；0x4A2B → 桶 0x00

收集 → [0x1234, 0x4A2B, 0x4A3F]  ✅（两个 0x1234 顺序保留）
```

### LSD vs MSD：两种方向

基数排序有两种走向：

| 方式 | 简称 | 优势 | 劣势 |
|------|------|------|------|
| **从最低位开始** | LSD（Least Significant Digit） | 实现简单、天然稳定、适合定长数据 | 哪怕高位相同也要走完全部轮次 |
| **从最高位开始** | MSD（Most Significant Digit） | 高位不同的数据可以提前结束、对**字符串**特别友好 | 实现复杂、需要递归和稳定性处理 |

工程中：
- **LSD** 主要用于排序定长整数（`uint32`、`int64`）
- **MSD** 主要用于排序**字符串**（字典序天然就是从最高位开始比），很多语言的字符串排序底层就是 MSD 基数排序

### 复杂度分析

```
设 n = 数据量，k = 数据范围（最大数值的位数），b = 基数（每桶大小）

时间复杂度:
      LSD:    O(k × (n + b))   ← k 轮，每轮计数排序 O(n + b)
      MSD:    O(k × n)         ← 平均情况，最坏仍为 O(k × n)
空间复杂度:    O(n + b)         ← 需要 b 个桶 + n 个临时空间

举个例子:
  排 100 万个 32 位整数（基 = 256）:
    k = 4 (4 个字节)
    b = 256
    总操作 = 4 × (1,000,000 + 256) ≈ 4,001,024 ≈ 4n
    ≈ 4 倍数据量的操作次数,完全线性!
```

对比一下:
- 快速排序: 100 万 × log₂(100 万) ≈ 2000 万次比较
- 基数排序: 4 × 100 万 = 400 万次操作

**快了 5 倍**,这就是非比较排序的魅力。

## 代码实现

### TypeScript 实现（LSD + 计数排序子程序）

```typescript
/**
 * 基数排序（LSD 版本）—— TypeScript 实现
 * 核心思路：从低位到高位，每一位都做一次稳定的计数排序
 * 为什么用计数排序做子程序：天然稳定 + O(n + b) 时间
 */
function radixSortLSD(nums: number[]): number[] {
  if (nums.length <= 1) return nums;

  const n = nums.length;
  // 为了让负数也能正确排序，统一偏移到非负区间
  // 技巧：把所有数减去最小值,排序完再加回来
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const offset = -min;

  // 拷贝到缓冲区（计数排序需要额外的输出数组）
  const buffer = nums.map((x) => x + offset);
  const output = new Array(n);

  // 选择基数 = 256（按字节分桶，32 位整数只需 4 轮）
  const BASE = 256;
  const passes = 4; // 32 位整数 = 4 个字节

  for (let pass = 0; pass < passes; pass++) {
    const shift = pass * 8;
    // count[i] = 第 i 桶的元素个数
    const count = new Array(BASE).fill(0);

    // 第一步：统计每个桶有多少个元素
    for (let i = 0; i < n; i++) {
      const digit = (buffer[i] >>> shift) & 0xff;
      count[digit]++;
    }

    // 第二步：把 count 转成前缀和,得到每个桶在 output 中的起始位置
    // 关键技巧：这样写天然保证了稳定性（相同 digit 的元素按原顺序进入 output）
    let sum = 0;
    for (let i = 0; i < BASE; i++) {
      const c = count[i];
      count[i] = sum;
      sum += c;
    }

    // 第三步：把元素按 digit 放到 output 数组
    for (let i = 0; i < n; i++) {
      const digit = (buffer[i] >>> shift) & 0xff;
      output[count[digit]] = buffer[i];
      count[digit]++;
    }

    // 第四步：把 output 拷回 buffer,准备下一轮
    for (let i = 0; i < n; i++) {
      buffer[i] = output[i];
    }
  }

  // 还原偏移量
  return output.map((x) => x - offset);
}

// 使用示例
const arr = [170, 45, 75, 90, 802, 24, 2, 66];
console.log(radixSortLSD(arr));
// [2, 24, 45, 66, 75, 90, 170, 802]

// 验证一下负数
console.log(radixSortLSD([-3, -100, 5, 0, 22, -1]));
// [-100, -3, -1, 0, 5, 22]
```

### 几个关键细节解释

1. **为什么用 `>>> 0` 而不是 `>>`？**  `>>` 是有符号右移，最高位会补符号位，导致负数出问题。`>>>` 是无符号右移，固定补 0，正好用来取字节。
2. **为什么用前缀和而不是直接覆盖？**  前缀和保证"先来的元素进前面的位置"，天然实现稳定排序。
3. **负数处理**用偏移量技巧；如果只排非负数可以省掉这一步。

### Go 实现（更贴近工业级代码）

```go
package radixsort

import (
	"math"
	"sort"
)

// LSDRadixSort LSD 基数排序，仅支持非负整数
// 这是 Go 标准库 sort 包内部对 []int 排序的备选方案之一
func LSDRadixSort(nums []int) []int {
	if len(nums) <= 1 {
		return nums
	}

	// 找到最大值，决定要排多少位
	max := nums[0]
	for _, v := range nums {
		if v > max {
			max = v
		}
	}

	// 按十进制每一位排序（这里为了可读性用 base=10）
	// 工业实践一般用 base=256（二进制位）来减少轮次
	for exp := 1; max/exp > 0; exp *= 10 {
		countingSortByDigit(nums, exp)
	}
	return nums
}

// countingSortByDigit 按某一位做稳定的计数排序
func countingSortByDigit(nums []int, exp int) {
	n := len(nums)
	output := make([]int, n)
	// base=10,桶索引 = (nums[i] / exp) % 10
	const base = 10
	count := make([]int, base)

	// 统计每个桶的元素个数
	for i := 0; i < n; i++ {
		digit := (nums[i] / exp) % base
		count[digit]++
	}

	// 转成前缀和
	for i := 1; i < base; i++ {
		count[i] += count[i-1]
	}

	// 反向遍历:从后往前填,天然稳定
	// 为什么反向：保证相同 digit 的元素保持原顺序
	for i := n - 1; i >= 0; i-- {
		digit := (nums[i] / exp) % base
		output[count[digit]-1] = nums[i]
		count[digit]--
	}

	// 拷回原数组
	copy(nums, output)
}

// 使用示例
// nums := []int{170, 45, 75, 90, 802, 24, 2, 66}
// LSDRadixSort(nums)
// fmt.Println(nums) // [2 24 45 66 75 90 170 802]
```

### Python 实现（最简洁版本）

```python
from typing import List

def radix_sort(nums: List[int]) -> List[int]:
    """LSD 基数排序，处理负数的版本"""
    if not nums:
        return nums

    # 负数偏移到非负区间
    min_val = min(nums)
    offset = -min_val
    nums = [n + offset for n in nums]

    max_val = max(nums)
    base = 256  # 按字节分桶
    passes = (max_val.bit_length() + 7) // 8  # 自动计算需要几轮

    for shift in range(0, passes * 8, 8):
        # 用字典模拟桶,简化实现
        buckets: List[List[int]] = [[] for _ in range(base)]
        for n in nums:
            digit = (n >> shift) & 0xff
            buckets[digit].append(n)
        # 按桶 0→255 顺序拼接（bucket 天然稳定）
        nums = [n for bucket in buckets for n in bucket]

    return [n - offset for n in nums]


# 测试
print(radix_sort([170, 45, 75, 90, 802, 24, 2, 66]))
# [2, 24, 45, 66, 75, 90, 170, 802]
```

## 进阶话题

#### 1. MSD 基数排序（更适合字符串）

LSD 必须走完全部轮次才能确定顺序，对定长数据无所谓，但**对变长字符串**就太浪费了——比如排一堆 URL，大部分按前 4 个字符就能分开了，何必一个字符一个字符排？

MSD 的思路是：从最高位开始分桶，如果某个桶里只剩 1 个元素（或者桶内已经相同），就可以提前结束递归。这让 MSD 排序字符串时**平均复杂度接近 O(n)**。

```typescript
/**
 * MSD 基数排序 —— 适合字符串
 * 思路：递归地对每一位分桶,小桶提前结束
 */
function msdRadixSort(strs: string[]): string[] {
  if (strs.length <= 1) return strs.slice();
  return msdSort(strs, 0);
}

function msdSort(strs: string[], charIndex: number): string[] {
  // 桶：按当前字符分(0=a, 1=b, ..., 25=z, 26=空字符串结束)
  const buckets: string[][] = Array.from({ length: 27 }, () => []);
  const CHAR_CODE_A = "a".charCodeAt(0);

  for (const s of strs) {
    if (charIndex >= s.length) {
      // 字符串已经遍历完,放进"结束桶"
      buckets[26].push(s);
    } else {
      const bucketIndex = s.charCodeAt(charIndex) - CHAR_CODE_A;
      buckets[bucketIndex].push(s);
    }
  }

  const result: string[] = [];
  for (let i = 0; i < 27; i++) {
    if (buckets[i].length > 1 && i < 26) {
      // 桶内有多个元素且还有字符没排,递归下一位
      result.push(...msdSort(buckets[i], charIndex + 1));
    } else {
      // 桶内只有 0 或 1 个元素,或者都是空串,直接收集
      result.push(...buckets[i]);
    }
  }
  return result;
}

// 测试
console.log(msdRadixSort(["banana", "apple", "cherry", "apricot", "blueberry", "avocado"]));
// ["apple", "apricot", "avocado", "banana", "blueberry", "cherry"]
```

#### 2. 实际应用：IP 地址排序

排序 IPv4 地址就是个超棒的实战例子。IP 地址本质上是 4 个字节，传统字符串排序会把 `"10.0.0.1"` 和 `"9.255.255.255"` 排错（因为字符串 `"10..."` < `"9..."`）。但用基数排序直接按字节排就完美：

```typescript
/**
 * IPv4 地址排序 —— 基数排序的经典应用
 * 思路：把 "10.0.0.1" 转成 4 个字节的整数数组,逐字节 LSD
 */
function sortIpAddresses(ips: string[]): string[] {
  // 把 IP 转成 4 字节整数数组,方便按字节排
  const asNumbers = ips.map((ip) => {
    const parts = ip.split(".").map(Number);
    // 每个 part 转成一个字节,合并成 32 位整数
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  });

  // 复用前面的 radixSortLSD,基=256,4 轮搞定
  const sortedNumbers = radixSortLSD(asNumbers);

  // 转回字符串格式
  return sortedNumbers.map((num) => {
    return [
      (num >>> 24) & 0xff,
      (num >>> 16) & 0xff,
      (num >>> 8) & 0xff,
      num & 0xff,
    ].join(".");
  });
}

console.log(sortIpAddresses(["192.168.1.1", "10.0.0.1", "172.16.0.1", "8.8.8.8"]));
// ["8.8.8.8", "172.16.0.1", "10.0.0.1", "192.168.1.1"]
```

如果用字符串字典序排,你会得到 `["10.0.0.1", "172.16.0.1", "192.168.1.1", "8.8.8.8"]` —— `8.8.8.8` 被排到了最后,完全错误!基数排序直接按数值排,完美解决。

## 实际应用

#### 1. 数据库 ORDER BY

PostgreSQL 在排序纯整数或浮点数时,如果数据量特别大,会用基数排序而不是快速排序。原因是当 n 很大时,n log n 和 n 的差距会非常显著。

#### 3. 基数树（Radix Tree / Patricia Trie）

LRU 缓存里的 key 排序、IP 路由表最长前缀匹配、文件系统目录索引,底层很多都用基数树实现。基数树本质上就是"用基数排序思想组织的多叉 Trie 树"。

#### 4. 字符串排序的标准方案

C++ 标准库的 `std::sort` 对 `std::string` 在某些场景下会用 MSD 基数排序;Java 的字符串排序底层也是混合策略(短字符串用插入排序,长字符串用 MSD 基数排序)。

#### 5. 计数排序 vs 基数排序的适用边界

```
数据范围 k vs 数据量 n:

  k ≤ n: 计数排序效率最高,直接一次搞定
  k > n: 计数排序浪费空间,基数排序更划算
  k 极大且定长(比如 64 位整数): 基数排序几乎是无脑最优解
```

## 总结

基数排序的核心要点:

1. **核心思想**:利用"整数可以按位拆解"的性质,逐位分桶+收集,绕过比较下界
2. **稳定性是命脉**:每一位必须用稳定排序,否则最终结果会乱
3. **LSD vs MSD**:定长整数用 LSD,变长字符串用 MSD
4. **复杂度优势**:O(k × (n + b)),对定长整数接近 O(n),比快排快数倍
5. **工程应用广**:数据库排序、IP 地址排序、字符串排序、基数树底层

**面试高频考点**:
- 能不能说出"为什么基数排序能突破 n log n 下界" → 因为它不是基于比较的
- 能不能解释"为什么必须用稳定排序" → 高位相同时低位顺序保留
- 能不能在白板上 10 分钟写出 LSD + 计数排序的代码 → 看我上面的 TypeScript 实现就行

最后留个思考题给你:如果数据是 **浮点数**,基数排序还能直接用吗?提示一下,负数和指数怎么办?下篇文章我们聊聊"浮点数的非比较排序",敬请期待 👋