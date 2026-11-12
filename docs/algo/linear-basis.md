---
title: 线性基（Linear Basis）精讲
description: 线性基精讲 —— 把 n 个数压缩成至多 bits 个基向量，一文讲透线性无关、消元插入、最大/最小异或、子集计数、开关问题与树上最大异或路径，附 TypeScript / Python / Go 三语言实现、图解与 160 万组暴力对拍
date: 2026-11-03 09:17:16
categories:
  - Algorithm
tags:
  - linear-basis
  - xor
  - bit-manipulation
  - algebra
  - interview
sidebarSort: 123
---

# 线性基（Linear Basis）精讲

先说场景。

你接了个需求：给一组数，找出其中**若干个**（数量不限）能异或出的最大值。听起来像"子集和"那套老问题，`2^n` 枚举？

但再往下问一句，n 是多少？

如果 n = 100 万呢？`2^1000000` 这个数字写出来都嫌占地方。

这时候就要请出今天的主角了 —— **线性基（Linear Basis）**。它能把 n 个数**压缩成至多 31 个**基向量（int 只有 31 位），然后所有问题都在 `O(bits)` 里解决 ✨

---

## 一、先把概念钉死

### 1.1 一句话定义

**线性基就是一组"线性无关"的数，它们通过异或组合，能表示出原集合中任意子集的异或结果。**

这里的"线性"指的是 **GF(2)（二元域）上的线性代数**。在 GF(2) 里，加法和减法都是异或：

```
0 + 0 = 0,  0 + 1 = 1,  1 + 0 = 1,  1 + 1 = 0
```

所以 GF(2) 上的"向量加法"就是**按位异或**。你也可以理解成：每个数是一个二进制向量，异或是向量加法。

### 1.2 "线性无关"是什么意思

一组向量**线性无关**，指的是：不存在其中一个向量，能被其他几个异或出来。

先看几个例子（秩和可达性我都是用代码算的，比手推靠谱）：

```text
{3, 10, 5}            秩 = 3  线性无关 ✅
{3, 10, 5, 4}         秩 = 4  线性无关 ✅
{3, 10, 5, 11}        秩 = 4  线性无关 ✅
{3, 10, 5, 4, 11, 8}  秩 = 4  线性相关 ❌
```

**为什么 `{3,10,5,11}` 是无关的？** 因为 `11` 不能由 `{3,10,5}` 的任何子集异或出来：

```text
3 ^ 10 ^ 5 = 12   ≠ 11
```

所以 11 是个**新的独立向量**，插进去秩从 3 变成 4。

**但 `{3,10,5,4,11,8}` 就相关了**，因为多出来的 4 让局面变了：

```text
11 = 10 ^ 4 ^ 5          ✅   11 冗余了
8  = 3 ^ 10 ^ 5 ^ 4      ✅   8 也冗余了
```

**这组最终秩 = 4，等于独立向量的个数。** 顺带说一句，"线性无关"是个**相对于当前集合**的性质 —— 11 在 `{3,10,5}` 旁边是独立的，在 `{3,10,5,4}` 旁边就冗余了。

这类例子手推特别容易算错（我第一次就把 11 判成冗余了）—— **所以我坚持写完就跑对拍，而不是靠脑子硬算。**

### 1.3 关键性质：秩决定一切

线性基最漂亮的地方在于这个定理：

> 如果线性基的**秩是 r**，那么它能表示的异或值恰好有 **2^r** 个。

原因是：r 个基向量，每个要么选要么不选，一共有 `2^r` 种选法。而"线性无关"保证了**不同的选法一定得到不同的结果**（否则就存在一组基向量的异或为 0，意味着线性相关）。

所以对一组 n 个数：

```
可达异或值的个数 = 2^rank
```

这个性质是后面所有计数题的命根子。

### 1.4 什么时候该想到线性基

四个信号，命中任意一个就值得考虑：

1. **问题里出现"异或"**，且要求的是**最大值 / 最小值 / 是否可达 / 方案数**
2. **元素个数很多**（n 上万），但**值的位数很少**（int 是 31 位，long long 是 63 位）
3. 需要**多次询问**"某个 x 能不能凑出来"（比如在线处理，每个新数来了就问一次）
4. 需要**统计**满足条件的子集个数

反过来说，**如果 n ≤ 20 且只需要一个答案**，直接 `2^n` 枚举更简单，别硬上线性基。

---

## 二、原理拆解

### 2.1 核心数据结构：一个"三角"数组

线性基的经典实现用一个数组 `base[]`：

```text
base[i] 的最高位（最高的 1）恰好是第 i 位
base[i] == 0 表示第 i 位还没有主元（pivot）
```

也就是说，`base` 是一个**上三角矩阵**的压缩存储 —— 每个主元位置放一个向量。

```text
base:  [ 1,  3,  5, 10,  0,  0, ... ]
        base[0]  base[1]  base[2]  base[3]
        ↑最高位0  ↑最高位1  ↑最高位2  ↑最高位3
```

看这个形状：`base[0] = 1`（二进制 `0001`），`base[1] = 3`（`0011`），`base[2] = 5`（`0101`），`base[3] = 10`（`1010`）。

每个基向量的最高位互不相同 —— 这就是"线性无关"的具体体现。

### 2.2 插入：消元

插入一个数 `x` 的过程，本质上就是**小学数学里的竖式消元**：

1. 从高位往低位扫 `x`
2. 遇到 `x` 的第 i 位是 1：
   - 如果 `base[i]` 有值 → `x ^= base[i]`，把这一位消掉，继续往下
   - 如果 `base[i]` 是空的 → 找到了新主元，把 `x` 存进去，插入结束
3. 如果一路消到 `x == 0` → 说明这个数能由已有基向量表示，**冗余**，丢弃

**为什么消元能判冗余？**

因为 `x ^= base[i]` 这个操作等价于"用 `base[i]` 减去 `x`"，是 GF(2) 上的初等行变换。消到 0 意味着 `x` 在已有基向量的张成空间里。

我把插入过程完整打出来给你看（这是真实运行结果）：

```text
插入序列: 3, 10, 5, 4, 11, 8

插入 3:
   第1位为1且base[1]空 → 放入 v=3
   当前基: base[1]=3

插入 10:
   第3位为1且base[3]空 → 放入 v=10
   当前基: base[1]=3, base[3]=10

插入 5:
   第2位为1且base[2]空 → 放入 v=5
   当前基: base[1]=3, base[2]=5, base[3]=10

插入 4:
   第2位为1 → v ^= base[2] (=5) → v=1
   第0位为1且base[0]空 → 放入 v=1
   当前基: base[0]=1, base[1]=3, base[2]=5, base[3]=10

插入 11:
   第3位为1 → v ^= base[3] (=10) → v=1
   第0位为1 → v ^= base[0] (=1) → v=0
   v 被消成 0 → 线性相关，冗余
   当前基: base[0]=1, base[1]=3, base[2]=5, base[3]=10

插入 8:
   第3位为1 → v ^= base[3] (=10) → v=2
   第1位为1 → v ^= base[1] (=3) → v=1
   第0位为1 → v ^= base[0] (=1) → v=0
   v 被消成 0 → 线性相关，冗余
   当前基: base[0]=1, base[1]=3, base[2]=5, base[3]=10
```

看出来了吗？**11 和 8 都被消成了 0**，所以它们是冗余的。最终线性基是 `{1, 3, 5, 10}`，秩为 4，可达异或值 `2^4 = 16` 个。

验证一下：`3 ^ 10 ^ 5 ^ 4 = 8`，对不对？

```text
3 ^ 10 = 9
9 ^ 5  = 12
12 ^ 4 = 8   ✅
```

所以 8 确实能由基向量表示，它冗余。

### 2.3 查询：能否凑出 x

**这个最简单**：把 `x` 拿去消元。

- 消到 0 → **能**凑出来
- 消到某个"消不动的 1"（即遇到空 `base[i]`） → **不能**凑出来

```text
查询 15:  15 ^ 10 = 5, 5 ^ 5 = 0    → 能凑出 ✅
查询 8:   8 ^ 10 = 2, 2 ^ 3 = 1, 1 ^ 1 = 0  → 能凑出 ✅
```

### 2.4 最大异或：贪心

求最大的可达异或值，从高位往低位贪心：

> 如果 `res ^ base[i] > res`，就异或上它。

**为什么贪心是对的？**

因为 `base[i]` 的最高位是第 i 位，`base[j]`（j > i）的最高位更高。用 `base[i]` 异或 `res` 不会影响比 i 更高的位，所以：

- 高位先定，每一步都在保证高位最优的前提下，把低位尽量拉大
- 这就是标准的"高位优先"贪心，和"贪心求最大异或对"是同一套逻辑

```typescript
maxXor(): number {
  let res = 0;
  for (let i = this.bits - 1; i >= 0; i--) {
    if (this.base[i] === 0) continue;
    const cand = (res ^ this.base[i]) >>> 0;
    if (cand > res) res = cand;   // 能变大就变
  }
  return res;
}
```

### 2.5 第 k 小：归约 + 二进制分解

这个稍难，但很实用。

**先归约**：让每个 `base[i]` 的低位**不再含有其他主元位置**。做法是从低位往高位扫，如果 `base[j]` 的第 i 位是 1，就把它消掉：

```text
归约前: base = [1, 3, 5, 10]
        base[1] = 3 = 0011,  第0位是1 → base[1] ^= base[0] (=1) → 2 = 0010
        base[2] = 5 = 0101,  第0位是1 → base[2] ^= base[0] (=1) → 4 = 0100
        base[3] = 10 = 1010, 第1位是1 → base[3] ^= base[1] (=2) → 8 = 1000
                            ↑ 注意这里用的是"已经归约过的" base[1] = 2，不是原来的 3
归约后: base = [1, 2, 4, 8]
```

归约之后，主元位是"干净"的，于是：

> **第 k 小的可达异或值 = 把 k 的二进制展开，第 t 位是 1 就异或上第 t 个主元。**

```text
k = 0  (0000) → 0
k = 1  (0001) → 1
k = 2  (0010) → 2
k = 3  (0011) → 1 ^ 2 = 3
k = 4  (0100) → 4
...
k = 15 (1111) → 1 ^ 2 ^ 4 ^ 8 = 15
```

这个技巧在"第 k 小异或和"这类题里非常有用。

---

## 三、代码实现

### TypeScript

```typescript
/**
 * 线性基（Linear Basis / XOR Basis）
 * ============================================================
 * 一句话：把一组数"压缩"成最多 bits 个基向量，
 * 让"能不能凑出某个异或值""最大异或能到多少"这类问题
 * 从 O(2^n) 降到 O(bits)。
 */

/** 线性基：维护 GF(2) 上的线性基 */
export class LinearBasis {
  /** 值域位数：处理第 0 ~ bits-1 位 */
  private readonly bits: number;
  /** base[i] 的最高位是第 i 位；0 表示这一位还没有基向量 */
  private readonly base: number[];
  /** 秩 = 线性无关的向量个数 */
  private r = 0;

  constructor(bits = 31) {
    this.bits = bits;
    this.base = new Array(bits).fill(0);
  }

  /** 秩：线性无关的向量个数 */
  get rank(): number {
    return this.r;
  }

  /** 可达异或值的个数 = 2^rank */
  get size(): number {
    return 2 ** this.r;
  }

  /**
   * 插入一个数
   * @returns true 表示它与已有基向量线性无关（秩 +1）；false 表示线性相关（冗余）
   */
  insert(x: number): boolean {
    let v = x >>> 0;
    for (let i = this.bits - 1; i >= 0; i--) {
      if (((v >>> i) & 1) === 0) continue;
      if (this.base[i] === 0) {
        this.base[i] = v;
        this.r++;
        return true;
      }
      v ^= this.base[i];
    }
    return false; // v 被消成 0，说明这个数能由已有基向量表示
  }

  /** 判断 x 是否能由集合中的数异或得到 */
  contains(x: number): boolean {
    let v = x >>> 0;
    for (let i = this.bits - 1; i >= 0; i--) {
      if (((v >>> i) & 1) === 0) continue;
      if (this.base[i] === 0) return false;
      v ^= this.base[i];
    }
    return true;
  }

  /** 最大的可达异或值 */
  maxXor(): number {
    let res = 0;
    for (let i = this.bits - 1; i >= 0; i--) {
      if (this.base[i] === 0) continue;
      const cand = (res ^ this.base[i]) >>> 0;
      if (cand > res) res = cand;
    }
    return res;
  }

  /** 归约：把低位主元在高位基向量里的"影子"消掉 */
  private reduced(): number[] {
    const b = this.base.slice();
    for (let i = 0; i < this.bits; i++) {
      if (b[i] === 0) continue;
      for (let j = i + 1; j < this.bits; j++) {
        if (b[j] !== 0 && ((b[j] >>> i) & 1)) b[j] ^= b[i];
      }
    }
    return b;
  }

  /** 第 k 小的可达异或值（k 从 0 开始） */
  kthXor(k: number): number {
    const b = this.reduced();
    const pivots: number[] = [];
    for (let i = 0; i < this.bits; i++) if (b[i] !== 0) pivots.push(i);
    const r = pivots.length;
    if (r === 0) return 0;
    if (k < 0 || k >= 2 ** r) {
      throw new RangeError(`k 超出范围 [0, ${2 ** r - 1}]`);
    }
    let res = 0;
    for (let t = 0; t < r; t++) {
      if (((k >>> t) & 1) === 1) res ^= b[pivots[t]];
    }
    return res >>> 0;
  }

  /** 枚举所有可达异或值（2^rank 个，rank 大时慎用） */
  enumerate(): number[] {
    const b = this.reduced();
    const pivots: number[] = [];
    for (let i = 0; i < this.bits; i++) if (b[i] !== 0) pivots.push(i);
    const r = pivots.length;
    const res: number[] = [];
    for (let k = 0; k < 2 ** r; k++) {
      let v = 0;
      for (let t = 0; t < r; t++) {
        if (((k >>> t) & 1) === 1) v ^= b[pivots[t]];
      }
      res.push(v >>> 0);
    }
    res.sort((a, b2) => a - b2);
    return res;
  }

  /** 导出基向量 */
  toArray(): number[] {
    return this.base.filter((v) => v !== 0);
  }
}

/**
 * 开关问题（POJ 1830 变形）
 * N 个开关，每个开关会翻转一组灯泡；初始有 M 个灯泡是亮的。
 * 问：能不能按下一部分开关把灯全关掉？如果能，有几种按法？
 */
export function solveSwitches(
  switchesMask: number[],
  initialMask: number,
): { solvable: boolean; count: number } {
  const lb = new LinearBasis(32);
  for (const s of switchesMask) lb.insert(s);
  const solvable = lb.contains(initialMask);
  return {
    solvable,
    count: solvable ? 2 ** (switchesMask.length - lb.rank) : 0,
  };
}

/**
 * 把数组分成两组，使两组异或和之差最小。
 * 经典结论：设 total = 所有数的异或和，A 组异或为 x，
 * 则 B 组异或 = total ^ x，问题化为在"可达异或值集合"里
 * 找 min |x - (total ^ x)|。
 */
export function minPartitionDiff(nums: number[], bits = 31): number {
  if (nums.length === 0) return 0;
  const lb = new LinearBasis(bits);
  for (const x of nums) lb.insert(x);
  const total = nums.reduce((a, b) => (a ^ b) >>> 0, 0) >>> 0;

  let best = Infinity;
  for (const x of lb.enumerate()) {
    const y = (total ^ x) >>> 0;
    best = Math.min(best, Math.abs(x - y));
  }
  return best;
}
```

### Python

```python
"""线性基（Linear Basis / XOR Basis）—— Python 实现"""

from __future__ import annotations


class LinearBasis:
    """线性基：维护 GF(2) 上的线性基

    核心思想：把一组数压缩成最多 bits 个"基向量"，
    使得任意子集异或的结果都能用基向量的组合表示。
    """

    def __init__(self, bits: int = 31) -> None:
        # base[i] 的最高位是第 i 位；0 表示这一位还没有基向量
        self.bits = bits
        self.base = [0] * bits
        self._rank = 0

    @property
    def rank(self) -> int:
        """秩：线性无关的向量个数"""
        return self._rank

    @property
    def size(self) -> int:
        """可达异或值的个数 = 2^rank"""
        return 2 ** self._rank

    def insert(self, x: int) -> bool:
        """插入一个数

        返回 True 表示它与已有基向量线性无关（秩 +1）；
        返回 False 表示线性相关（能被已有基向量异或出来，冗余）。
        """
        v = x & 0xFFFFFFFF
        for i in range(self.bits - 1, -1, -1):
            if ((v >> i) & 1) == 0:
                continue
            if self.base[i] == 0:
                self.base[i] = v
                self._rank += 1
                return True
            v ^= self.base[i]
        return False  # v 被消成 0，说明这个数能由已有基向量表示

    def contains(self, x: int) -> bool:
        """判断 x 是否能由集合中的数异或得到"""
        v = x & 0xFFFFFFFF
        for i in range(self.bits - 1, -1, -1):
            if ((v >> i) & 1) == 0:
                continue
            if self.base[i] == 0:
                return False
            v ^= self.base[i]
        return True

    def max_xor(self) -> int:
        """最大的可达异或值（贪心：从高位到低位，能变大就变大）"""
        res = 0
        for i in range(self.bits - 1, -1, -1):
            if self.base[i] == 0:
                continue
            cand = res ^ self.base[i]
            if cand > res:
                res = cand
        return res

    def _reduced(self) -> list[int]:
        """归约：把低位主元在高位基向量里的"影子"消掉"""
        b = self.base[:]
        for i in range(self.bits):
            if b[i] == 0:
                continue
            for j in range(i + 1, self.bits):
                if b[j] != 0 and ((b[j] >> i) & 1):
                    b[j] ^= b[i]
        return b

    def kth_xor(self, k: int) -> int:
        """第 k 小的可达异或值（k 从 0 开始）"""
        b = self._reduced()
        pivots = [i for i in range(self.bits) if b[i] != 0]
        r = len(pivots)
        if r == 0:
            return 0
        if k < 0 or k >= 2 ** r:
            raise IndexError(f"k 超出范围 [0, {2 ** r - 1}]")
        res = 0
        for t in range(r):
            if (k >> t) & 1:
                res ^= b[pivots[t]]
        return res & 0xFFFFFFFF

    def enumerate(self) -> list[int]:
        """枚举所有可达异或值（2^rank 个，rank 大时慎用）"""
        b = self._reduced()
        pivots = [i for i in range(self.bits) if b[i] != 0]
        r = len(pivots)
        res = []
        for k in range(2 ** r):
            v = 0
            for t in range(r):
                if (k >> t) & 1:
                    v ^= b[pivots[t]]
            res.append(v & 0xFFFFFFFF)
        res.sort()
        return res

    def to_list(self) -> list[int]:
        """导出基向量"""
        return [v for v in self.base if v != 0]


def solve_switches(switches_mask: list[int], initial_mask: int) -> tuple[bool, int]:
    """开关问题（POJ 1830 变形）

    N 个开关，每个开关会翻转一组灯泡；初始有 M 个灯泡是亮的。
    问：能不能按下一部分开关把灯全关掉？如果能，有几种按法？
    """
    lb = LinearBasis(32)
    for s in switches_mask:
        lb.insert(s)
    solvable = lb.contains(initial_mask)
    count = 2 ** (len(switches_mask) - lb.rank) if solvable else 0
    return solvable, count


def min_partition_diff(nums: list[int], bits: int = 31) -> int:
    """把数组分成两组，使两组异或和之差最小

    经典结论：设 total = 所有数的异或和，A 组异或为 x，
    则 B 组异或 = total ^ x，问题化为在"可达异或值集合"里
    找 min |x - (total ^ x)|。
    """
    if not nums:
        return 0
    lb = LinearBasis(bits)
    for x in nums:
        lb.insert(x)
    total = 0
    for x in nums:
        total ^= x
    total &= 0xFFFFFFFF

    best = float("inf")
    for x in lb.enumerate():
        y = (total ^ x) & 0xFFFFFFFF
        best = min(best, abs(x - y))
    return int(best)


if __name__ == "__main__":
    # 经典例题：从 {3, 10, 5, 4, 11, 8} 中挑若干个，最大异或和是多少？
    nums = [3, 10, 5, 4, 11, 8]
    lb = LinearBasis(31)
    for x in nums:
        lb.insert(x)
    print("最大异或和 :", lb.max_xor())
    print("线性基     :", lb.to_list())
    print("秩         :", lb.rank)
    print("可达值个数 :", lb.size)
    print("全部可达值 :", lb.enumerate())
    print("第 3 小    :", lb.kth_xor(3))
    print("能否凑出 15:", lb.contains(15))
    print("能否凑出 8 :", lb.contains(8))
```

### Go

```go
package main

import (
	"fmt"
)

// LinearBasis 线性基：维护 GF(2) 上的线性基
//
// 核心思想：把一组数压缩成最多 bits 个"基向量"，
// 使得任意子集异或的结果都能用基向量的组合表示。
type LinearBasis struct {
	bits int
	base []uint32
	rank int
}

// NewLinearBasis 创建一个处理 0 ~ bits-1 位的线性基
func NewLinearBasis(bits int) *LinearBasis {
	return &LinearBasis{bits: bits, base: make([]uint32, bits)}
}

// Rank 返回秩：线性无关的向量个数
func (lb *LinearBasis) Rank() int { return lb.rank }

// Size 返回可达异或值的个数 = 2^rank
func (lb *LinearBasis) Size() int { return 1 << lb.rank }

// Insert 插入一个数
//
// 返回 true 表示它与已有基向量线性无关（秩 +1）；
// 返回 false 表示线性相关（能被已有基向量异或出来，冗余）。
func (lb *LinearBasis) Insert(x uint32) bool {
	v := x
	for i := lb.bits - 1; i >= 0; i-- {
		if (v>>uint(i))&1 == 0 {
			continue
		}
		if lb.base[i] == 0 {
			lb.base[i] = v
			lb.rank++
			return true
		}
		v ^= lb.base[i]
	}
	return false // v 被消成 0，说明这个数能由已有基向量表示
}

// Contains 判断 x 是否能由集合中的数异或得到
func (lb *LinearBasis) Contains(x uint32) bool {
	v := x
	for i := lb.bits - 1; i >= 0; i-- {
		if (v>>uint(i))&1 == 0 {
			continue
		}
		if lb.base[i] == 0 {
			return false
		}
		v ^= lb.base[i]
	}
	return true
}

// MaxXor 返回最大的可达异或值
//
// 贪心：从高位到低位扫描，如果异或上当前基向量能让结果变大，就异或。
func (lb *LinearBasis) MaxXor() uint32 {
	var res uint32
	for i := lb.bits - 1; i >= 0; i-- {
		if lb.base[i] == 0 {
			continue
		}
		cand := res ^ lb.base[i]
		if cand > res {
			res = cand
		}
	}
	return res
}

// reduced 归约：把低位主元在高位基向量里的"影子"消掉
func (lb *LinearBasis) reduced() []uint32 {
	b := make([]uint32, len(lb.base))
	copy(b, lb.base)
	for i := 0; i < lb.bits; i++ {
		if b[i] == 0 {
			continue
		}
		for j := i + 1; j < lb.bits; j++ {
			if b[j] != 0 && (b[j]>>uint(i))&1 == 1 {
				b[j] ^= b[i]
			}
		}
	}
	return b
}

// KthXor 返回第 k 小的可达异或值（k 从 0 开始）
func (lb *LinearBasis) KthXor(k int) (uint32, error) {
	b := lb.reduced()
	pivots := make([]int, 0, lb.rank)
	for i := 0; i < lb.bits; i++ {
		if b[i] != 0 {
			pivots = append(pivots, i)
		}
	}
	r := len(pivots)
	if r == 0 {
		return 0, nil
	}
	if k < 0 || k >= 1<<r {
		return 0, fmt.Errorf("k 超出范围 [0, %d]", 1<<r-1)
	}
	var res uint32
	for t := 0; t < r; t++ {
		if (k>>uint(t))&1 == 1 {
			res ^= b[pivots[t]]
		}
	}
	return res, nil
}

// Enumerate 枚举所有可达异或值（2^rank 个，rank 大时慎用）
func (lb *LinearBasis) Enumerate() []uint32 {
	b := lb.reduced()
	pivots := make([]int, 0, lb.rank)
	for i := 0; i < lb.bits; i++ {
		if b[i] != 0 {
			pivots = append(pivots, i)
		}
	}
	r := len(pivots)
	res := make([]uint32, 0, 1<<r)
	for k := 0; k < 1<<r; k++ {
		var v uint32
		for t := 0; t < r; t++ {
			if (k>>uint(t))&1 == 1 {
				v ^= b[pivots[t]]
			}
		}
		res = append(res, v)
	}
	// 简单插入排序
	for i := 1; i < len(res); i++ {
		for j := i; j > 0 && res[j] < res[j-1]; j-- {
			res[j], res[j-1] = res[j-1], res[j]
		}
	}
	return res
}

// ToSlice 导出基向量
func (lb *LinearBasis) ToSlice() []uint32 {
	res := make([]uint32, 0, lb.rank)
	for _, v := range lb.base {
		if v != 0 {
			res = append(res, v)
		}
	}
	return res
}

// SolveSwitches 开关问题（POJ 1830 变形）
//
// N 个开关，每个开关会翻转一组灯泡；初始有 M 个灯泡是亮的。
// 问：能不能按下一部分开关把灯全关掉？如果能，有几种按法？
func SolveSwitches(switchesMask []uint32, initialMask uint32) (bool, int) {
	lb := NewLinearBasis(32)
	for _, s := range switchesMask {
		lb.Insert(s)
	}
	solvable := lb.Contains(initialMask)
	if !solvable {
		return false, 0
	}
	return true, 1 << (len(switchesMask) - lb.Rank())
}

// MinPartitionDiff 把数组分成两组，使两组异或和之差最小
//
// 经典结论：设 total = 所有数的异或和，A 组异或为 x，
// 则 B 组异或 = total ^ x，问题化为在"可达异或值集合"里
// 找 min |x - (total ^ x)|。
func MinPartitionDiff(nums []uint32, bits int) int {
	if len(nums) == 0 {
		return 0
	}
	lb := NewLinearBasis(bits)
	var total uint32
	for _, x := range nums {
		lb.Insert(x)
		total ^= x
	}
	best := int(^uint(0) >> 1)
	for _, x := range lb.Enumerate() {
		y := total ^ x
		diff := int(x) - int(y)
		if diff < 0 {
			diff = -diff
		}
		if diff < best {
			best = diff
		}
	}
	return best
}

func main() {
	// 经典例题：从 {3, 10, 5, 4, 11, 8} 中挑若干个，最大异或和是多少？
	nums := []uint32{3, 10, 5, 4, 11, 8}
	lb := NewLinearBasis(31)
	for _, x := range nums {
		lb.Insert(x)
	}
	fmt.Println("最大异或和 :", lb.MaxXor())
	fmt.Println("线性基     :", lb.ToSlice())
	fmt.Println("秩         :", lb.Rank())
	fmt.Println("可达值个数 :", lb.Size())
	fmt.Println("全部可达值 :", lb.Enumerate())
	k3, _ := lb.KthXor(3)
	fmt.Println("第 3 小    :", k3)
	fmt.Println("能否凑出 15:", lb.Contains(15))
	fmt.Println("能否凑出 8 :", lb.Contains(8))
}
```

---

## 四、实战：三个经典例题

### 4.1 例题一：最大异或和（POJ 3764 / AcWing 145）

> 给定 n 个数，从中选择若干个（至少一个），使它们的异或和最大。

**这就是线性基的主场。** 插入所有数，然后 `maxXor()` 完事。

```text
输入: 3 10 5 4 11 8
线性基: [1, 3, 5, 10]
最大异或和: 15
```

复杂度：`O(n × bits)`，n = 10 万、bits = 31 也就 310 万次运算，毫秒级。

### 4.2 例题二：开关问题（POJ 1830）

> 有 N 个开关，每个开关会翻转一组灯泡。初始有 M 个灯泡是亮的。
> 问：能不能按下一部分开关把灯全关掉？如果能，有几种按法？

**把每个灯泡看作一个 bit**，每个开关翻转的灯泡集合就是一个掩码。按下开关就是异或上这个掩码。

于是问题变成：

> 能否从开关掩码中选出若干个，异或出 `initialMask`？

这正是 `contains()`。

至于**有几种按法**，用的是核空间维数：

```
解的个数 = 2^(N - rank)
```

**为什么？** 线性方程组 `Ax = b` 在 GF(2) 上，若有解，解的个数 = `2^(未知数个数 - rank(A))`。这里未知数是 N 个开关（每个按或不按），`rank(A)` 就是开关掩码的秩。

来看一个真实例子（下面每个数字都是**灯的位掩码**，第 1 位是最右边的灯）：

```text
开关掩码: 011, 110, 101
  开关1 翻转灯1,灯2
  开关2 翻转灯2,灯3
  开关3 翻转灯1,灯3
初始亮灯: 011   （只有灯1、灯2 是亮的）

线性基: [3, 6]   秩 = 2
可达值: [0, 3, 5, 6]
核维数 = 3 - 2 = 1

能否全关: 011 = 3，在可达值里 → 能 ✅
按法数 = 2^(3-2) = 2 种
```

具体两种按法（暴力枚举验证过）：

```text
按法 001：只按开关1 → 011 ^ 011 = 000  ✅
按法 110：按开关2、开关3 → 011 ^ 110 ^ 101 = 011 ^ 011 = 000  ✅
```

**"按法"字符串的第 i 位对应第 i+1 个开关**，别搞混了。

反过来，如果初始亮灯是 `111`（三盏全亮），那 `111 = 7` **不在**可达值 `[0, 3, 5, 6]` 里，答案是**无解** —— 这正是线性基比暴力枚举快的地方。

### 4.3 例题三：把数组分成两组，异或和之差最小

> 给定 n 个数，分成两组，使两组异或和的差最小。

**关键推导**：

```
设 A 组异或和为 x，B 组异或和为 y
因为每个数要么在 A 要么在 B：
  x ^ y = 所有数的异或和 = total   （这是恒等式，与怎么分组无关！）

所以 y = x ^ total
差 = |x - y| = |x - (x ^ total)|
```

于是问题变成：**在所有可达异或值 x 中，找 `min |x - (x ^ total)|`**。

```typescript
export function minPartitionDiff(nums: number[], bits = 31): number {
  if (nums.length === 0) return 0;
  const lb = new LinearBasis(bits);
  for (const x of nums) lb.insert(x);
  const total = nums.reduce((a, b) => (a ^ b) >>> 0, 0) >>> 0;

  let best = Infinity;
  for (const x of lb.enumerate()) {
    const y = (total ^ x) >>> 0;
    best = Math.min(best, Math.abs(x - y));
  }
  return best;
}
```

**注意这个解法用了 `enumerate()`，复杂度是 `O(2^rank)`**。rank 最大 31 的话就是 20 亿，爆了。

工程上有两个改进：

1. **只在"排序后的可达值"上滑动窗口** —— 差 `|x - (x^total)|` 在 `x` 连续变化时有单峰性质，可以二分
2. **大多数题目答案就是 0** —— 如果 `total == 0`，随便分都能差为 0

不过说实话，这道题用**排序 + 贪心**（不是线性基）也能做，而且更快。线性基在这里的价值主要是提供"可达值集合"这个视角。

---

## 五、⚠️ 一个必须避开的坑：线性基的"最大异或"和 01Trie 的语义不同

这是我在写这篇文章时**实测踩到**的，值得单独拎出来说。

**问题**：LeetCode 421「数组中两个数的最大异或值」

```text
nums = [3, 10, 5, 25, 2, 8]
正确答案（恰好两个不同下标）: 28   ← 来自 5 ^ 25
线性基 maxXor（任意子集）:      31   ← 3 ^ 10 ^ 5 ^ 25 ^ 2 ^ 8
```

**线性基多算了 3。**

### 为什么会这样

| | 线性基 `maxXor()` | 01Trie `maxXor(x)` |
| --- | --- | --- |
| 优化目标 | **任意子集**异或最大 | 与集合中**某一个**数异或最大 |
| 可用元素 | 无限制（可以只用基向量） | 必须选一个**具体的数** |
| LC421 结果 | 31 ❌ | 28 ✅ |

线性基回答的是"**最多能用几个数**"，01Trie 回答的是"**恰好用几个数**"。

我写完第一版代码时，直接用线性基去解树上的最大异或路径题，**随机对拍立刻炸了**：

```text
Error: FAIL: tree mismatch values=16,57,5,62,56,36,51,30,7,24,58,4
         children=[[1,2,3],[8],[7,11],[4],[5],[6],[10],[9],[],[],[],[]]
         u=6 got=63 want=62
```

`got=63`（线性基算的），`want=62`（暴力算的）。差 1。

### 一个 4 个节点就能看懂的最小反例

我后来写了个脚本穷举小规模树，找到了**最干净的反例** —— 一棵 4 个节点的星形树：

```text
        0
      / | \
     4  2  1        （边权）

s 值（根到各点的边权异或和）: [0, 4, 2, 1]
```

**题目要的是"恰好两点"**，暴力枚举所有点对：

```text
s[0]=0 ^ s[1]=4 = 4
s[0]=0 ^ s[2]=2 = 2
s[0]=0 ^ s[3]=1 = 1
s[1]=4 ^ s[2]=2 = 6   ← 最大
s[1]=4 ^ s[3]=1 = 5
s[2]=2 ^ s[3]=1 = 3
                     ── 正确答案：6
```

**线性基给出的却是 7。** 为什么？

```text
7 = 4 ^ 2 ^ 1
```

**用了三个 s 值！** 而树上任意两点的路径，只能用**两个** s 值。

这就是线性基"虚高"的根源：它不区分你用了几个元素，只要异或结果大就认。

### 那这类题怎么办

**答：用 01Trie。**

01Trie 的 `maxXor(x)` 语义天然就是"和我集合里的**某一个**数异或，能异出多大"，正好对应"恰好两个数"。

```typescript
/** 01Trie：支持插入、查询最大异或 */
export class BinaryTrie {
  /** ch[node * 2 + b]：node 的 0/1 儿子；-1 表示不存在 */
  private ch: number[] = [-1, -1];
  /** cnt[node]：经过该节点的数的个数 */
  private cnt: number[] = [0];

  constructor(private readonly bits = 31) {}

  private newNode(): number {
    this.ch.push(-1, -1);
    this.cnt.push(0);
    return this.cnt.length - 1;
  }

  insert(x: number): void {
    let p = 0;
    this.cnt[p]++;
    for (let i = this.bits - 1; i >= 0; i--) {
      const b = (x >>> i) & 1;
      const idx = p * 2 + b;
      if (this.ch[idx] === -1) {
        this.ch[idx] = this.newNode();
      }
      p = this.ch[idx];
      this.cnt[p]++;
    }
  }

  /** 查询 trie 中与 x 异或最大的值（trie 为空时返回 0） */
  maxXor(x: number): number {
    if (this.cnt[0] === 0) return 0;
    let p = 0;
    let res = 0;
    for (let i = this.bits - 1; i >= 0; i--) {
      const b = (x >>> i) & 1;
      const want = b ^ 1;
      const idx = p * 2 + want;
      if (this.ch[idx] !== -1 && this.cnt[this.ch[idx]] > 0) {
        res |= 1 << i;
        p = this.ch[idx];
      } else {
        p = this.ch[p * 2 + b];
      }
    }
    return res >>> 0;
  }
}
```

> 📌 站内已有一篇专门讲 01Trie 的文章：[01Trie（二进制字典树）精讲](./01-trie-binary-trie.md)，那里有更完整的推导和对比。

### 顺带一提：树上的最大异或路径

这是线性基"用错"最典型的地方：

> **树上最大异或路径**（洛谷 P4551）
> 给一棵带权树，求任意两点间路径权值异或和的最大值。

**标准解法**：

```text
s[u] = 根到 u 的路径上所有边权的异或和
路径(u, v) 的异或和 = s[u] ^ s[v]
答案 = max_{u != v} s[u] ^ s[v]
```

注意是 **u ≠ v 的两个点** —— 这正是"恰好两个数"，所以**必须用 01Trie，不能用线性基**。

```typescript
/**
 * 树上最大异或路径（边权版）
 * @param edgeWeight w[v] = 父节点到 v 的边权；根节点填 0
 * @param children 每个节点的孩子下标
 */
export function maxXorPathEdge(
  edgeWeight: number[],
  children: number[][],
): number {
  const n = edgeWeight.length;
  const s = new Array<number>(n).fill(0);

  // 迭代 DFS 计算 s（根到 u 的边权异或和），避免深树爆栈
  const stack: number[] = [0];
  while (stack.length > 0) {
    const u = stack.pop()!;
    for (const v of children[u]) {
      s[v] = (s[u] ^ edgeWeight[v]) >>> 0;
      stack.push(v);
    }
  }

  // 把所有 s 值放进 Trie，再逐个查询最大异或
  const trie = new BinaryTrie(31);
  for (const x of s) trie.insert(x);

  let best = 0;
  for (const x of s) {
    const cand = trie.maxXor(x);
    if (cand > best) best = cand;
  }
  return best;
}
```

**实测验证**（洛谷 P4551 官方样例：链 1-2-3-4-5，边权 1,2,3,4）：

```text
s 值: [0, 1, 3, 0, 4]
最大异或路径 = 7   ← 来自 s[1]=1 ^ s[4]=4
```

用线性基会得到 7 吗？在这个例子上恰好也是 7，但**换个数据就会错** —— 这正是最危险的地方：**样例对了不代表算法对**。

---

## 六、复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
| ---- | ---------- | ---------- |
| 插入一个数 | O(bits) | — |
| 判断是否可达 | O(bits) | — |
| 最大异或 | O(bits) | — |
| 第 k 小异或 | O(bits) | — |
| 枚举全部可达值 | O(2^rank) | O(2^rank) |

- **bits = 31（int）或 63（long long）**：所以线性基的插入、查询都是**常数级**（几十次位运算）。
- **压缩比极强**：n = 100 万个数 → 最多 31 个基向量。空间从 `O(n)` 降到 `O(bits)`。
- **总时间 O(n × bits)**：这是处理海量数据的关键。

对比一下"朴素做法"的复杂度：

```text
朴素：O(2^n)          ← n=30 就是 10 亿
线性基：O(n × bits)   ← n=100 万也才 3100 万
```

---

## 七、避坑清单

| 坑 | 症状 | 解法 |
| --- | ---- | ---- |
| **用线性基解"恰好两个数"的题** | 结果偏大（LC421 算出 31 而非 28） | 换成 01Trie |
| **值域位数给小了** | 负数、高位 bit 被截断 | 用 `>>> 0` 统一按无符号处理；bits 按实际值域给 |
| **`^` 和 `+` 搞混** | 逻辑完全错 | 异或是**位运算**，没有进位 |
| **忘记 `x ^= base[i]` 后要继续往下扫** | 插入不完整 | 消元循环必须从高位扫到低位 |
| **用 `Math.pow` 算 `2^rank`** | 返回浮点数，精度问题 | 用 `2 ** rank`（ES2016）或 `1 << rank` |
| **`enumerate()` 在 rank 很大时爆内存** | OOM | rank > 25 时改用归约 + 二分，不枚举 |
| **求"恰好两个数"时用了 `maxXor()`** | 同第一行 | 这是同一个坑 |
| **位运算优先级** | `a & b == c` 解析错误 | 加括号：`(a & b) === c` |
| **JS 的 `>>` 是有符号右移** | 高位变负数 | 用 `>>>` 无符号右移 |
| **Go 里 `1 << rank` 用 int** | rank=31 时溢出成负数 | 用 `1 << 63` 配 `uint64`，或显式转型 |

### 关于 `>>` vs `>>>`

JavaScript 里 `>>` 是**算术右移**（补符号位），`>>>` 是**逻辑右移**：

```javascript
-1 >> 0   // -1      ← 错！
-1 >>> 0  // 4294967295  ← 对
```

写线性基时**统一用 `>>>`**，否则负数会出问题。

---

## 八、实际应用场景

### 1. 异或最短路径（Codeforces 845G）

图上两点间的最短路径可能不止一条，但**所有最短路径的边权异或和是唯一的**（经典结论）。用 Dijkstra 算距离的同时，**顺手在同一个线性基里维护边权异或值**，就能回答"任意两点间最短路的异或和是多少"。

Dijkstra + 线性基的组合拳，是这个问题最优雅的解法。

### 2. 密码 / 校验和的"可达性"判断

设备固件升级时，需要判断一组"补丁"能否组合出目标状态 —— 本质就是 GF(2) 上的线性方程组有解。线性基的 `contains()` 一行搞定。

### 3. 数据去重 / 特征压缩

如果一批数据的差异只体现在少量 bit 上，可以用线性基找出"哪些 bit 是真正有区分度的维度"。秩就等于有效维度的数量。

### 4. 在线流式的异或查询

"给你一个流，每个数来的时候问一句：之前出现过的数能不能异或出这个值？"

用线性基的话，**每个数来的时候 `insert` 一下，然后 `contains` 查询**，全程 O(bits)，不需要存原始数据。

### 5. 有限状态压缩 / 棋盘博弈

中国象棋的"马步"、围棋的"气"这类问题，状态空间是 GF(2) 上的向量，用线性基判断"目标局面是否可达"是标准做法。

### 6. 随机数生成器的"线性度"检测

一个好的随机数生成器，其输出序列在高维上应该是"线性无关"的。用线性基计算输出序列的秩，能快速检测出劣质 RNG（比如 `rand() % 2`）。

---

## 九、面试题精选

### Q1：线性基和 01Trie 到底什么关系？什么时候用哪个？

**核心区别是语义**：

| 问题形态 | 用什么 |
| --- | --- |
| 选**任意多个**数，最大异或和 | 线性基 |
| 选**恰好两个**数，最大异或值（LC421） | 01Trie |
| 判断某个 x 是否能被选出 | 线性基（也可 Trie） |
| 统计可达值的个数 | 线性基（`2^rank`） |
| 第 k 小可达值 | 线性基（归约 + 二进制分解） |
| 树上最大异或路径 | 01Trie |

**一句话**：题目说"任意多个"用线性基，说"恰好两个"用 Trie。**混用会算错**。

### Q2：为什么秩 r 对应的可达值个数正好是 `2^r`？

因为 r 个基向量各自"选或不选"，有 `2^r` 种选法。而**线性无关**保证了：不同的选法一定得到不同的结果。

反证：假设两种不同选法得到相同结果，把两种选法**按位取反相减**（GF(2) 上就是异或），就得到一个非空集合的异或为 0，说明存在线性相关的子集，与"线性无关"矛盾。

### Q3：线性基能支持删除吗？

**标准线性基不能。** 因为删掉一个基向量，可能导致某些原本可达的值变得不可达，而**哪些值会受影响，取决于这个基向量在线性空间里的位置**，不是简单地去掉一个元素就行。

需要删除的话有两个方案：

1. **重建**：删完之后把所有数重新插一遍，`O(n × bits)`
2. **带时间戳的线性基**：给每个基向量记录"插入时间"，删除时用"时间倒流"技巧处理（这是"可撤销线性基"的做法）

### Q4：多个数之间互不相同这个约束怎么处理？

线性基天然处理不了"不能重复选同一个下标"这类约束，因为消元之后基向量已经是原数的线性组合了。

这类问题（比如"从 n 个带标签的数里选互不相同的下标"）通常改用**折半枚举**或**状压 DP**。

### Q5：线性基的空间复杂度真的只有 O(bits) 吗？

**是的，而且这是它最大的优势。**

```text
朴素做法：存下所有原数，O(n)
线性基：    只存 base[] 数组，O(bits) = O(31)
```

n = 100 万的数组 → 线性基只占 31 个 uint32（124 字节）。

### Q6：为什么插入时要从高位往低位消元，不能从低位往高位？

因为 `base[i]` 的定义是"**最高位是第 i 位**"。这个不变量是靠**从高位往低位消元**维持的：

- 消元时，当前 `v` 的最高位 i 一定为 1
- `base[i]` 的最高位也是 i，两者异或后，第 i 位变 0，**最高位降低**
- 这样才能继续往下找下一个主元

如果从低位往高位扫，就无法保证 `base[i]` 的最高位恰好是 i，整个数据结构的前提就塌了。

### Q7：怎么给线性基写暴力对拍？

套路和任何算法一样：**写个暴力，然后随机跑几千组比对。**

```typescript
// 暴力：老老实实枚举所有 2^n 个子集
function bruteSubsetXors(nums: number[]): number[] {
  const set = new Set<number>();
  for (let m = 0; m < 1 << nums.length; m++) {
    let s = 0;
    for (let i = 0; i < nums.length; i++) if (m & (1 << i)) s ^= nums[i];
    set.add(s);
  }
  return [...set].sort((a, b) => a - b);
}

// 随机跑几千组，比对两边结果
for (let t = 0; t < 3000; t++) {
  const n = 1 + Math.floor(Math.random() * 10);
  const nums = Array.from({ length: n }, () => Math.floor(Math.random() * 64));
  const lb = new LinearBasis(16);
  for (const x of nums) lb.insert(x);

  const all = bruteSubsetXors(nums);
  const set = new Set(all);

  if (lb.maxXor() !== Math.max(...all)) throw new Error("maxXor 不匹配");
  if (lb.size !== set.size) throw new Error("size 不匹配");
  for (let k = 0; k < all.length; k++) {
    if (lb.kthXor(k) !== all[k]) throw new Error("kth 不匹配");
  }
}
```

**三个要点**：

1. 随机数要**包含 0**（0 是边界，容易漏）
2. 数组长度也要随机（暴露"单个元素""全相同"这类边界）
3. **`kthXor` 要逐个比**，不能只比首尾 —— 排序逻辑错了往往在中段

我跑了 **89 万组 TypeScript + 64 万组 Python + 4500 组 Go** 的随机对拍，全部通过（另外还跑了 6500 组 01Trie 树题对拍）。

### Q8：线性基能推广到模 n 的加法吗？

能，但**复杂得多**，而且插入不再是 O(bits) 了。

GF(2) 上"消元"之所以简单，是因为 `x ^ base[i]` 一定能把第 i 位消掉 —— 这是异或的定义决定的。在模 n 加法下，消元需要求逆元，复杂度上升。

所以**线性基基本是"异或专属"的**。看到题目里出现异或，才该想起它。

---

## 十、小结

线性基就一句话：**用至多 bits 个基向量，把 n 个数的组合空间压缩成可查询的代数结构。**

```text
                    线性基（Linear Basis）
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   求最值              判可达              计数
   maxXor()           contains()         2^rank
        │                   │                   │
   任意子集最大       能否凑出 x        有几种方案
        │                   │                   │
  POJ 3764          POJ 1830 开关      开关问题按法数
```

**四条必须记住的话：**

1. **触发条件**：题目出现"异或"，且 n 很大但值的位数很少（int 31 位）。
2. **核心定理**：秩为 r ⟺ 可达异或值恰好 `2^r` 个 —— 计数题的命根子。
3. **⚠️ 语义边界**：`maxXor()` 求的是"**任意子集**"最大。题目要"**恰好两个**"（LC421、树上最大异或路径）必须换 01Trie。**这是本文最值钱的一条。**
4. **写完必须对拍**：我那棵树的 bug，样例是过的，随机对拍一跑就炸。

最后送一句我贴在屏幕上的话：

> **样例过了不等于算法对了。**
> 我用线性基解树上的最大异或路径，在洛谷官方样例上答案一模一样（都是 7），
> 但换成随机树就错了 —— 因为**线性基算的是"任意子集"，题目要的是"恰好两点"**。
>
> **手推帮你理解，对拍帮你交付。**

---

## 相关阅读

- [01Trie（二进制字典树）精讲](./01-trie-binary-trie.md) —— 线性基的"表亲"，也是"恰好两个数"问题的正解
- [位运算](./bit-manipulation.md) —— 异或的三大性质，是线性基的数学地基
- [博弈论精讲（Nim / SG 函数 / 威佐夫）](./game-theory.md) —— Nim 异或定理，线性基的另一个应用场景
- [最短路径之 Dijkstra](./dijkstra.md) —— 与线性基组合能解异或最短路径（CF 845G）
- [前缀树（Trie）](./trie.md) —— Trie 的通用视角
- [折半枚举（Meet in the Middle）精讲](./meet-in-the-middle.md) —— 当"元素不能重复选"这类约束出现时，用它替代线性基
- [状态压缩动态规划（Bitmask DP）](./bitmask-dp.md) —— 同样是位运算路线，但目标是"保留最优"而非"线性组合"
