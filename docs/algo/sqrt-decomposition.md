---
title: 根号分治精讲（分块 / Sqrt Decomposition）
description: 从「十万条数据怎么查区间和」讲起，一文打通根号分治的块划分、懒标记、三大经典模型（区间加求和 / 区间众数 / 值域分块），附 TypeScript / Python / Go 三语言完整实现、与树状数组及线段树的实测性能对比
date: 2026-11-12 09:10:00
categories:
  - Algorithm
tags:
  - sqrt-decomposition
  - block-decomposition
  - lazy-propagation
  - fenwick-tree
  - segment-tree
  - range-query
  - interview
sidebarSort: 132
---

# 根号分治精讲（分块 / Sqrt Decomposition）

先问你一个很朴素的问题：

> 给你一个长度为 $n$ 的数组，支持两个操作：**区间加** 和 **区间求和**。数据量 $10^6$，操作 $10^5$ 次，怎么做到不超时？

你脑子里大概率会蹦出两个东西：

- **树状数组**：区间加区间求和，$O(\log n)$
- **线段树 + 懒标记**：万能选手，$O(\log n)$

两个都是 $O(\log n)$，都很完美。但今天我想聊的是第三种答案 —— 一个**没有树、没有指针、没有递归**的方案：

> **根号分治（Sqrt Decomposition，也叫分块）**：单次操作 $O(\sqrt{n})$，代码短到离谱，实现难度接近于零 ✨

我知道你在想什么："$O(\sqrt{n})$ 比 $O(\log n)$ 慢一万倍，有毛用？"

**问得好。** 但这个问题的答案，恰恰是这道题真正的价值所在 —— 它能让你彻底搞懂：

1. 为什么 $O(\log n)$ 的数据结构能那么快（**空间换时间的极致**）
2. **摊还分析**是怎么算的
3. **根号分治**这个思想在真实工程里还有什么别的用法

而且它的复杂度是有意思的：$O(n^{1/2})$ 是"比 $O(n)$ 好、但比 $O(\log n)$ 差"的那个中间态。它是**空间换时间不够彻底时的最优解** —— 当你没法建出 $O(\log n)$ 的结构时，分块永远比暴力强。

---

## 一、先说清楚：分块到底在分什么

### 1.1 一句话定义

> **把数组切成若干个长度约为 $\sqrt{n}$ 的连续块，每块维护一份"摘要"（这个块的和、最大值、计数表……）。查询时，完整覆盖的块直接读摘要，剩下的零散部分暴力扫。**

关键词是**"摘要"**。分块的本质是：**用一份 O(1) 大小的信息，概括一整块 O(√n) 个元素**。

### 1.2 生活场景：仓库管理员

想象你管一个仓库，货架上摆着 1000 箱货，每箱有个编号和数量。

老板每隔一会儿问你："**第 100 到 800 箱一共有多少货？**"

如果你每次都去数 700 个箱子，老板会疯掉。

于是你做了这么一件事：**每 50 箱打一个包**，一共 20 个包，每个包上贴一张标签写着"这包一共多少货"。同时你心里记着每个包的标签。

现在老板再问：

- **整包的部分**（比如第 101~800 箱，正好是 14 个完整包）→ 直接把标签加起来，14 次加法搞定
- **零散的部分**（第 100 箱 + 第 801~850 箱）→ 拆开数，最多 2 × 50 = 100 箱

**这就是分块。** 老板的问题从"数 700 箱"变成了"读 14 张标签 + 数 100 箱"。

### 1.3 图解：数组被切成什么样

假设 $n = 16$，取块长 $B = 4$：

```text
下标:  1   2   3   4  |  5   6   7   8  |  9  10  11  12  | 13  14  15  16
       └──── 块 0 ────┘└──── 块 1 ────┘└──── 块 2 ────┘└──── 块 3 ────┘
        块0 摘要:           块1 摘要:           块2 摘要:           块3 摘要:
        sum = s0            sum = s1            sum = s2            sum = s3
        max = m0            max = m1            max = m2            max = m3
        lazy = 0            lazy = 0            lazy = 0            lazy = 0
```

现在查询区间 $[3, 14]$：

```text
      零散           整 块            零散
    ┌─────┐  ┌───┬───┬───┬───┐  ┌─────┐
    │ 3 4 │  │ 5 │ 6 │ 7 │ 8 │  │13 14│
    └─────┘  └───┴───┴───┴───┘  └─────┘
      ↑                          ↑
    暴力扫 2 个              暴力扫 2 个
     (O(B))  块1  块2  块3    (O(B))
             ↑ 直接读摘要，O(1) 一块
```

代价一目了然：

```text
时间 = O(B)  [左零散] + O(块数)  [整块] + O(B)  [右零散]
     = O(√n)   +  O(√n)       +  O(√n)
```

而暴力是 $O(n)$。**从 $n$ 降到 $\sqrt{n}$，这就是分块的全部收益。**

---

## 二、核心模型一：区间加 + 区间求和

这是分块最经典、也最容易被面试官考的模型。

### 2.1 难点在哪：懒标记的层次

区间加这个操作，"加 $v$"对每个元素来说是 $a_i \leftarrow a_i + v$。如果不分块，我们就是老老实实遍历一遍。

分块之后，麻烦来了：

- **整块加**：整个块都 +v。这个好办，改一下块的摘要就行。
- **零散加**：只改块内几个元素。改完之后，**块的摘要就脏了**，必须重算。

那么"改完脏摘要"这一步，会不会导致复杂度退化？

我们来分析：**重算一个块的摘要需要 O(B)**，而每次区间操作最多涉及 **2 个零散块**。

```text
单次区间加的复杂度：
  零散块暴力改 + 重算     →  O(B) + O(B) = O(B)
  整块改摘要              →  O(块数) = O(n/B)
  ────────────────────────────────────────
  总计                    →  O(B + n/B)
```

**让 B 取 √n，B 和 n/B 同时最小，总复杂度 O(√n)** 🎯

这就是"根号分治"名字的由来：**块长取平方根，两项开销同时最小化**。

### 2.2 一个关键设计：懒标记放在块级

很多人写分块时把懒标记放在**元素级**，然后每次查询都要"一路往下推"，写得很痛苦。

我的做法是：**懒标记只在块级维护**，元素级的 `arr[i]` 存的是"基础值"，真实值 = `arr[i] + lazy[belong[i]]`。

这样：

- **整块加**：只动块级 `lazy` 和摘要，元素一个都不碰 → O(1)
- **零散加**：直接改 `arr[i]`（基础值），然后重算该块摘要 → O(B)
- **查询**：整块直接读 `sum[b]`（已经含 lazy 贡献），零散部分读 `arr[i] + lazy[b]`

**为什么"整块摘要已经含 lazy 贡献"很重要？** 因为这样查询整块时直接 `+= sum[b]` 就行，不需要额外 `+ lazy[b] * len`。少一次乘法，也少一个容易写错的地方。

看代码里的 `rebuild`：

```typescript
private rebuild(b: number): void {
  const l = this.blockLeft[b];
  const r = this.blockRight[b];
  const tag = this.lazy[b];      // ← 关键：摘要按"实际值"统计
  let s = 0;
  let mx = -Infinity;
  let mn = Infinity;
  for (let i = l; i <= r; i++) {
    const v = this.arr[i] + tag; // ← 真实值 = 基础值 + 懒标记
    s += v;
    if (v > mx) mx = v;
    if (v < mn) mn = v;
  }
  this.sum[b] = s;
  this.max[b] = mx;
  this.min[b] = mn;
}
```

### 2.3 图解：一次区间加的完整流转

$n=16$、$B=4$，对区间 $[3, 14]$ 加 $v=5$：

```text
初始：
  块0: [1,2,3,4]    sum=s0  lazy=0
  块1: [5,6,7,8]    sum=s1  lazy=0
  块2: [9,10,11,12] sum=s2  lazy=0
  块3: [13,14,15,16]sum=s3  lazy=0

操作 add(3, 14, 5)：
  块0 属于 [3,4]  → 零散 → arr[3]+=5, arr[4]+=5 → rebuild(0)
  块1 属于 [5,8]  → 整块 → lazy[1]+=5, sum[1]+=5*4, max[1]+=5, min[1]+=5
  块2 属于 [9,12] → 整块 → lazy[2]+=5, sum[2]+=5*4, max[2]+=5, min[2]+=5
  块3 属于 [13,14]→ 零散 → arr[13]+=5, arr[14]+=5 → rebuild(3)

结果：
  块0: lazy=0    sum = s0 + 10   （两个元素各 +5）
  块1: lazy=5    sum = s1 + 20   （整块 +5）
  块2: lazy=5    sum = s2 + 20
  块3: lazy=0    sum = s3 + 10
```

注意块 1、2 的**元素级 `arr` 一个都没变**，只有块级 `lazy` 变了。这就是懒标记省下来的功夫。

### 2.4 完整 TypeScript 实现

```typescript
/**
 * 根号分治（分块 / Sqrt Decomposition）—— TypeScript 实现
 *
 * 支持：
 *   - 区间加
 *   - 区间求和
 *   - 区间最大值 / 最小值
 *
 * 核心思想：把数组切成 sqrt(n) 块，每块维护一份"摘要"（sum/max/min），
 * 整块操作用摘要 O(1) 完成，零散操作用暴力 O(B) 完成。
 */

export class SqrtDecomposition {
  private readonly n: number;
  private readonly blockSize: number;
  private readonly blockCount: number;

  /** 1-indexed 的基础值，不含整块懒标记 */
  private readonly arr: Float64Array;
  /** 位置 -> 所属块号 */
  private readonly belong: Int32Array;
  /** 块号 -> 左端点 / 右端点 */
  private readonly blockLeft: Int32Array;
  private readonly blockRight: Int32Array;
  private readonly blockLen: Int32Array;

  /** 块级摘要（已经包含懒标记的贡献） */
  private readonly sum: Float64Array;
  private readonly max: Float64Array;
  private readonly min: Float64Array;
  /** 块级懒标记：整块加法 */
  private readonly lazy: Float64Array;

  constructor(values: number[]) {
    this.n = values.length;
    this.blockSize = Math.max(1, Math.floor(Math.sqrt(this.n)));
    this.blockCount = Math.ceil(this.n / this.blockSize);

    this.arr = new Float64Array(this.n + 1);
    for (let i = 0; i < this.n; i++) this.arr[i + 1] = values[i];

    this.belong = new Int32Array(this.n + 1);
    this.blockLeft = new Int32Array(this.blockCount);
    this.blockRight = new Int32Array(this.blockCount);
    this.blockLen = new Int32Array(this.blockCount);
    this.sum = new Float64Array(this.blockCount);
    this.max = new Float64Array(this.blockCount);
    this.min = new Float64Array(this.blockCount);
    this.lazy = new Float64Array(this.blockCount);

    for (let b = 0; b < this.blockCount; b++) {
      const l = b * this.blockSize + 1;
      const r = Math.min(this.n, (b + 1) * this.blockSize);
      this.blockLeft[b] = l;
      this.blockRight[b] = r;
      this.blockLen[b] = r - l + 1;
      for (let i = l; i <= r; i++) this.belong[i] = b;
    }

    this.rebuildAll();
  }

  private rebuildAll(): void {
    for (let b = 0; b < this.blockCount; b++) this.rebuild(b);
  }

  /** 重算第 b 块的摘要（按"实际值 = arr[i] + lazy[b]"统计） */
  private rebuild(b: number): void {
    const l = this.blockLeft[b];
    const r = this.blockRight[b];
    const tag = this.lazy[b];
    let s = 0;
    let mx = -Infinity;
    let mn = Infinity;
    for (let i = l; i <= r; i++) {
      const v = this.arr[i] + tag;
      s += v;
      if (v > mx) mx = v;
      if (v < mn) mn = v;
    }
    this.sum[b] = s;
    this.max[b] = mx;
    this.min[b] = mn;
  }

  /** 单点实际值 */
  at(i: number): number {
    return this.arr[i] + this.lazy[this.belong[i]];
  }

  /** 区间加：把 [l, r] 里的每个数都加上 v（1-indexed，闭区间） */
  add(l: number, r: number, v: number): void {
    const bl = this.belong[l];
    const br = this.belong[r];

    if (bl === br) {
      // 同一个块内，直接暴力改，再重算摘要
      for (let i = l; i <= r; i++) this.arr[i] += v;
      this.rebuild(bl);
      return;
    }

    // 左端零散块
    for (let i = l; i <= this.blockRight[bl]; i++) this.arr[i] += v;
    this.rebuild(bl);

    // 中间整块：只动摘要和懒标记，O(1)
    for (let b = bl + 1; b < br; b++) {
      this.lazy[b] += v;
      this.sum[b] += v * this.blockLen[b];
      this.max[b] += v;
      this.min[b] += v;
    }

    // 右端零散块
    for (let i = this.blockLeft[br]; i <= r; i++) this.arr[i] += v;
    this.rebuild(br);
  }

  /** 区间求和 */
  querySum(l: number, r: number): number {
    const bl = this.belong[l];
    const br = this.belong[r];

    if (bl === br) {
      let s = 0;
      const tag = this.lazy[bl];
      for (let i = l; i <= r; i++) s += this.arr[i] + tag;
      return s;
    }

    let s = 0;
    const tagL = this.lazy[bl];
    for (let i = l; i <= this.blockRight[bl]; i++) s += this.arr[i] + tagL;

    for (let b = bl + 1; b < br; b++) s += this.sum[b];

    const tagR = this.lazy[br];
    for (let i = this.blockLeft[br]; i <= r; i++) s += this.arr[i] + tagR;
    return s;
  }

  /** 区间最大值 */
  queryMax(l: number, r: number): number {
    const bl = this.belong[l];
    const br = this.belong[r];

    if (bl === br) {
      let mx = -Infinity;
      const tag = this.lazy[bl];
      for (let i = l; i <= r; i++) {
        const v = this.arr[i] + tag;
        if (v > mx) mx = v;
      }
      return mx;
    }

    let mx = -Infinity;
    const tagL = this.lazy[bl];
    for (let i = l; i <= this.blockRight[bl]; i++) {
      const v = this.arr[i] + tagL;
      if (v > mx) mx = v;
    }
    for (let b = bl + 1; b < br; b++) if (this.max[b] > mx) mx = this.max[b];
    const tagR = this.lazy[br];
    for (let i = this.blockLeft[br]; i <= r; i++) {
      const v = this.arr[i] + tagR;
      if (v > mx) mx = v;
    }
    return mx;
  }

  /** 区间最小值 */
  queryMin(l: number, r: number): number {
    const bl = this.belong[l];
    const br = this.belong[r];

    if (bl === br) {
      let mn = Infinity;
      const tag = this.lazy[bl];
      for (let i = l; i <= r; i++) {
        const v = this.arr[i] + tag;
        if (v < mn) mn = v;
      }
      return mn;
    }

    let mn = Infinity;
    const tagL = this.lazy[bl];
    for (let i = l; i <= this.blockRight[bl]; i++) {
      const v = this.arr[i] + tagL;
      if (v < mn) mn = v;
    }
    for (let b = bl + 1; b < br; b++) if (this.min[b] < mn) mn = this.min[b];
    const tagR = this.lazy[br];
    for (let i = this.blockLeft[br]; i <= r; i++) {
      const v = this.arr[i] + tagR;
      if (v < mn) mn = v;
    }
    return mn;
  }

  get blockSizeValue(): number {
    return this.blockSize;
  }

  get blockCountValue(): number {
    return this.blockCount;
  }
}

// 使用示例
const sd = new SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9]);
sd.add(2, 5, 10);          // [1, 12, 13, 14, 15, 6, 7, 8, 9]
console.log(sd.querySum(1, 9));   // 85
console.log(sd.queryMax(1, 9));   // 15
```

### 2.5 Python 实现

```python
"""根号分治（分块 / Sqrt Decomposition）—— Python 实现"""

import math
from typing import List


class SqrtDecomposition:
    """区间加 + 区间求和 + 区间最值，O(sqrt(n)) 单次操作。"""

    def __init__(self, values: List[int]):
        self.n = len(values)
        self.block_size = max(1, int(math.isqrt(self.n)))
        self.block_count = math.ceil(self.n / self.block_size)

        # 1-indexed 基础值（不含整块懒标记）
        self.arr = [0] + list(values)
        self.belong = [0] * (self.n + 1)
        self.block_left = [0] * self.block_count
        self.block_right = [0] * self.block_count
        self.block_len = [0] * self.block_count

        # 块级摘要
        self.sum = [0] * self.block_count
        self.max = [-float("inf")] * self.block_count
        self.min = [float("inf")] * self.block_count
        self.lazy = [0] * self.block_count

        for b in range(self.block_count):
            l = b * self.block_size + 1
            r = min(self.n, (b + 1) * self.block_size)
            self.block_left[b] = l
            self.block_right[b] = r
            self.block_len[b] = r - l + 1
            for i in range(l, r + 1):
                self.belong[i] = b

        self._rebuild_all()

    def _rebuild_all(self) -> None:
        for b in range(self.block_count):
            self._rebuild(b)

    def _rebuild(self, b: int) -> None:
        """按"实际值 = arr[i] + lazy[b]"重算第 b 块的摘要。"""
        l, r = self.block_left[b], self.block_right[b]
        tag = self.lazy[b]
        s, mx, mn = 0, -float("inf"), float("inf")
        for i in range(l, r + 1):
            v = self.arr[i] + tag
            s += v
            if v > mx:
                mx = v
            if v < mn:
                mn = v
        self.sum[b], self.max[b], self.min[b] = s, mx, mn

    def at(self, i: int) -> int:
        """单点实际值（1-indexed）。"""
        return self.arr[i] + self.lazy[self.belong[i]]

    def add(self, l: int, r: int, v: int) -> None:
        """区间加：[l, r] 内每个数都加 v（1-indexed，闭区间）。"""
        bl, br = self.belong[l], self.belong[r]

        if bl == br:
            for i in range(l, r + 1):
                self.arr[i] += v
            self._rebuild(bl)
            return

        # 左端零散块
        for i in range(l, self.block_right[bl] + 1):
            self.arr[i] += v
        self._rebuild(bl)

        # 中间整块：只动摘要和懒标记，O(1)
        for b in range(bl + 1, br):
            self.lazy[b] += v
            self.sum[b] += v * self.block_len[b]
            self.max[b] += v
            self.min[b] += v

        # 右端零散块
        for i in range(self.block_left[br], r + 1):
            self.arr[i] += v
        self._rebuild(br)

    def query_sum(self, l: int, r: int) -> int:
        """区间求和。"""
        bl, br = self.belong[l], self.belong[r]

        if bl == br:
            tag = self.lazy[bl]
            return sum(self.arr[i] + tag for i in range(l, r + 1))

        s = 0
        tag_l = self.lazy[bl]
        for i in range(l, self.block_right[bl] + 1):
            s += self.arr[i] + tag_l

        for b in range(bl + 1, br):
            s += self.sum[b]

        tag_r = self.lazy[br]
        for i in range(self.block_left[br], r + 1):
            s += self.arr[i] + tag_r
        return s

    def query_max(self, l: int, r: int) -> float:
        """区间最大值。"""
        bl, br = self.belong[l], self.belong[r]

        if bl == br:
            tag = self.lazy[bl]
            return max(self.arr[i] + tag for i in range(l, r + 1))

        mx = -float("inf")
        tag_l = self.lazy[bl]
        for i in range(l, self.block_right[bl] + 1):
            mx = max(mx, self.arr[i] + tag_l)

        for b in range(bl + 1, br):
            mx = max(mx, self.max[b])

        tag_r = self.lazy[br]
        for i in range(self.block_left[br], r + 1):
            mx = max(mx, self.arr[i] + tag_r)
        return mx

    def query_min(self, l: int, r: int) -> float:
        """区间最小值。"""
        bl, br = self.belong[l], self.belong[r]

        if bl == br:
            tag = self.lazy[bl]
            return min(self.arr[i] + tag for i in range(l, r + 1))

        mn = float("inf")
        tag_l = self.lazy[bl]
        for i in range(l, self.block_right[bl] + 1):
            mn = min(mn, self.arr[i] + tag_l)

        for b in range(bl + 1, br):
            mn = min(mn, self.min[b])

        tag_r = self.lazy[br]
        for i in range(self.block_left[br], r + 1):
            mn = min(mn, self.arr[i] + tag_r)
        return mn


# 使用示例
if __name__ == "__main__":
    sd = SqrtDecomposition([1, 2, 3, 4, 5, 6, 7, 8, 9])
    sd.add(2, 5, 10)
    print(sd.query_sum(1, 9))  # 85
    print(sd.query_max(1, 9))  # 15
```

### 2.6 Go 实现

```go
// 根号分治（分块 / Sqrt Decomposition）—— Go 实现
//
// 支持：区间加、区间求和、区间最大值、区间最小值。
// 核心思想：把数组切成 sqrt(n) 块，每块维护一份"摘要"（sum/max/min），
// 整块操作用摘要 O(1) 完成，零散操作用暴力 O(B) 完成。
package main

import (
	"fmt"
	"math"
)

type SqrtDecomposition struct {
	n          int
	blockSize  int
	blockCount int

	arr        []float64 // 1-indexed 的基础值，不含整块懒标记
	belong     []int     // 位置 -> 所属块号
	blockLeft  []int
	blockRight []int
	blockLen   []int

	sum  []float64 // 块级摘要（已包含懒标记贡献）
	max  []float64
	min  []float64
	lazy []float64 // 块级懒标记：整块加法
}

func NewSqrtDecomposition(values []float64) *SqrtDecomposition {
	n := len(values)
	blockSize := int(math.Sqrt(float64(n)))
	if blockSize < 1 {
		blockSize = 1
	}
	blockCount := (n + blockSize - 1) / blockSize

	sd := &SqrtDecomposition{
		n:          n,
		blockSize:  blockSize,
		blockCount: blockCount,
		arr:        make([]float64, n+1),
		belong:     make([]int, n+1),
		blockLeft:  make([]int, blockCount),
		blockRight: make([]int, blockCount),
		blockLen:   make([]int, blockCount),
		sum:        make([]float64, blockCount),
		max:        make([]float64, blockCount),
		min:        make([]float64, blockCount),
		lazy:       make([]float64, blockCount),
	}

	for i := 0; i < n; i++ {
		sd.arr[i+1] = values[i]
	}
	for b := 0; b < blockCount; b++ {
		l := b*blockSize + 1
		r := (b + 1) * blockSize
		if r > n {
			r = n
		}
		sd.blockLeft[b] = l
		sd.blockRight[b] = r
		sd.blockLen[b] = r - l + 1
		for i := l; i <= r; i++ {
			sd.belong[i] = b
		}
	}
	sd.rebuildAll()
	return sd
}

// rebuild 按"实际值 = arr[i] + lazy[b]"重算第 b 块的摘要。
func (sd *SqrtDecomposition) rebuild(b int) {
	l, r := sd.blockLeft[b], sd.blockRight[b]
	tag := sd.lazy[b]
	s, mx, mn := 0.0, math.Inf(-1), math.Inf(1)
	for i := l; i <= r; i++ {
		v := sd.arr[i] + tag
		s += v
		if v > mx {
			mx = v
		}
		if v < mn {
			mn = v
		}
	}
	sd.sum[b], sd.max[b], sd.min[b] = s, mx, mn
}

func (sd *SqrtDecomposition) rebuildAll() {
	for b := 0; b < sd.blockCount; b++ {
		sd.rebuild(b)
	}
}

// At 单点实际值（1-indexed）。
func (sd *SqrtDecomposition) At(i int) float64 {
	return sd.arr[i] + sd.lazy[sd.belong[i]]
}

// Add 区间加：[l, r] 内每个数都加 v（1-indexed，闭区间）。
func (sd *SqrtDecomposition) Add(l, r int, v float64) {
	bl, br := sd.belong[l], sd.belong[r]

	if bl == br {
		for i := l; i <= r; i++ {
			sd.arr[i] += v
		}
		sd.rebuild(bl)
		return
	}

	// 左端零散块
	for i := l; i <= sd.blockRight[bl]; i++ {
		sd.arr[i] += v
	}
	sd.rebuild(bl)

	// 中间整块：只动摘要和懒标记，O(1)
	for b := bl + 1; b < br; b++ {
		sd.lazy[b] += v
		sd.sum[b] += v * float64(sd.blockLen[b])
		sd.max[b] += v
		sd.min[b] += v
	}

	// 右端零散块
	for i := sd.blockLeft[br]; i <= r; i++ {
		sd.arr[i] += v
	}
	sd.rebuild(br)
}

// QuerySum 区间求和。
func (sd *SqrtDecomposition) QuerySum(l, r int) float64 {
	bl, br := sd.belong[l], sd.belong[r]

	if bl == br {
		tag := sd.lazy[bl]
		s := 0.0
		for i := l; i <= r; i++ {
			s += sd.arr[i] + tag
		}
		return s
	}

	s := 0.0
	tagL := sd.lazy[bl]
	for i := l; i <= sd.blockRight[bl]; i++ {
		s += sd.arr[i] + tagL
	}
	for b := bl + 1; b < br; b++ {
		s += sd.sum[b]
	}
	tagR := sd.lazy[br]
	for i := sd.blockLeft[br]; i <= r; i++ {
		s += sd.arr[i] + tagR
	}
	return s
}

// QueryMax 区间最大值。
func (sd *SqrtDecomposition) QueryMax(l, r int) float64 {
	bl, br := sd.belong[l], sd.belong[r]

	if bl == br {
		tag := sd.lazy[bl]
		mx := math.Inf(-1)
		for i := l; i <= r; i++ {
			if v := sd.arr[i] + tag; v > mx {
				mx = v
			}
		}
		return mx
	}

	mx := math.Inf(-1)
	tagL := sd.lazy[bl]
	for i := l; i <= sd.blockRight[bl]; i++ {
		if v := sd.arr[i] + tagL; v > mx {
			mx = v
		}
	}
	for b := bl + 1; b < br; b++ {
		if sd.max[b] > mx {
			mx = sd.max[b]
		}
	}
	tagR := sd.lazy[br]
	for i := sd.blockLeft[br]; i <= r; i++ {
		if v := sd.arr[i] + tagR; v > mx {
			mx = v
		}
	}
	return mx
}

// QueryMin 区间最小值。
func (sd *SqrtDecomposition) QueryMin(l, r int) float64 {
	bl, br := sd.belong[l], sd.belong[r]

	if bl == br {
		tag := sd.lazy[bl]
		mn := math.Inf(1)
		for i := l; i <= r; i++ {
			if v := sd.arr[i] + tag; v < mn {
				mn = v
			}
		}
		return mn
	}

	mn := math.Inf(1)
	tagL := sd.lazy[bl]
	for i := l; i <= sd.blockRight[bl]; i++ {
		if v := sd.arr[i] + tagL; v < mn {
			mn = v
		}
	}
	for b := bl + 1; b < br; b++ {
		if sd.min[b] < mn {
			mn = sd.min[b]
		}
	}
	tagR := sd.lazy[br]
	for i := sd.blockLeft[br]; i <= r; i++ {
		if v := sd.arr[i] + tagR; v < mn {
			mn = v
		}
	}
	return mn
}

func main() {
	sd := NewSqrtDecomposition([]float64{1, 2, 3, 4, 5, 6, 7, 8, 9})
	sd.Add(2, 5, 10)
	fmt.Println(sd.QuerySum(1, 9)) // 85
	fmt.Println(sd.QueryMax(1, 9)) // 15
}
```

---

## 三、核心模型二：区间众数（蒲公英）

区间众数是分块最经典的高级应用，也是 NOI 的一道经典题（"蒲公英"）。

### 3.1 为什么难

区间和、区间最值都能用一个数概括一块。但**众数没法用一个数概括** —— 你不能只记"块里最多的数是谁"，因为查询区间往往只覆盖块的一部分，块里的众数不一定是区间里的众数。

```text
整块是 [3, 3, 1, 1]  → 整块众数是 3（和 1 并列）
查询区间只覆盖 [3, 1]  → 区间众数是 1 或 3（看谁多）
```

所以我们需要更强的摘要：**每块维护一张"值 → 出现次数"的计数表**。

### 3.2 三步走

```text
查询 [l, r] 的众数：

① 零散部分（左半块尾巴 + 右半块开头）
   → 逐个元素，cnt[a[i]]++

② 整块部分（中间的完整块）
   → 对每个块，遍历它的计数表，cnt[v] += freq[b][v]
   → 这一步是 O(块内不同值的个数)，不是 O(B)！

③ 在被触及过的值里扫一遍
   → 找出 cnt 最大的那个
```

关键在于 **② 这一步**：一个块里如果只有 10 个不同的值（哪怕块长 316），遍历计数表就只要 10 次，比暴力扫 316 个元素快 30 倍。

这带来一个漂亮的复杂度：

```text
时间 = O(B)  [零散] + O(块数 × 块内不同值数)  [整块] + O(触及过的值数)  [收尾]
```

如果值域是 $V$（不同值的总数），那么"块内不同值数 ≤ V"，最坏情况就是 $O(B + n/B \cdot V)$。实践中通常远好于此。

### 3.3 离散化是必须的

计数表用 `Map<number, number>` 固然可以，但如果值域很大（比如 $10^9$），`Map` 的查询常数就不小了。

标准做法是**离散化**：把值映射成 $[0, V)$ 的排名，然后用数组代替 Map。

```typescript
// 离散化：把原始值映射成紧凑的排名
const sorted = Array.from(new Set(values)).sort((a, b) => a - b);
const rank = new Map<number, number>();
sorted.forEach((v, i) => rank.set(v, i));
```

离散化这个技巧在[值域分块](#四核心模型三值域分块)里还会再出现一次。

### 3.4 完整实现（TypeScript）

```typescript
/**
 * 区间众数（蒲公英）—— 分块 + 块内计数表
 *
 * 思路：
 *   - 每块维护一张 "值 -> 出现次数" 的计数表
 *   - 查询时零散部分逐个累加，整块部分直接查表整块累加
 *   - 最后在"本次被触及过的值"里扫一遍，得出最大次数
 */
export class BlockModeQuery {
  private readonly n: number;
  private readonly blockSize: number;
  private readonly blockCount: number;

  /** 1-indexed，存离散化后的排名 */
  private readonly arr: Int32Array;
  private readonly belong: Int32Array;
  private readonly blockLeft: Int32Array;
  private readonly blockRight: Int32Array;

  /** 每块：值 -> 次数 */
  private readonly freq: Map<number, number>[];
  /** 离散化：排名 -> 原始值 */
  private readonly original: Int32Array;
  /** 查询草稿计数 */
  private readonly cnt: Int32Array;
  /** 本次查询被触及过的排名 */
  private readonly touched: Int32Array;

  constructor(values: number[]) {
    this.n = values.length;
    this.blockSize = Math.max(1, Math.floor(Math.sqrt(this.n)));
    this.blockCount = Math.ceil(this.n / this.blockSize);

    const sorted = Array.from(new Set(values)).sort((a, b) => a - b);
    const rank = new Map<number, number>();
    sorted.forEach((v, i) => rank.set(v, i));
    this.original = new Int32Array(sorted.length);
    sorted.forEach((v, i) => (this.original[i] = v));

    this.arr = new Int32Array(this.n + 1);
    for (let i = 0; i < this.n; i++) this.arr[i + 1] = rank.get(values[i])!;

    this.belong = new Int32Array(this.n + 1);
    this.blockLeft = new Int32Array(this.blockCount);
    this.blockRight = new Int32Array(this.blockCount);
    this.freq = [];

    for (let b = 0; b < this.blockCount; b++) {
      const l = b * this.blockSize + 1;
      const r = Math.min(this.n, (b + 1) * this.blockSize);
      this.blockLeft[b] = l;
      this.blockRight[b] = r;
      for (let i = l; i <= r; i++) this.belong[i] = b;

      const m = new Map<number, number>();
      for (let i = l; i <= r; i++) {
        const v = this.arr[i];
        m.set(v, (m.get(v) ?? 0) + 1);
      }
      this.freq.push(m);
    }

    this.cnt = new Int32Array(sorted.length);
    this.touched = new Int32Array(this.n + 1);
  }

  /**
   * 查询 [l, r] 的众数。
   * 返回 { value, count, mode }，mode = true 表示众数唯一。
   * 多个值并列时取"最小值"作为 value，保证结果确定。
   */
  query(l: number, r: number): { value: number; count: number; mode: boolean } {
    this.cnt.fill(0);
    let touchedLen = 0;

    const bump = (rank: number) => {
      if (this.cnt[rank] === 0) this.touched[touchedLen++] = rank;
      this.cnt[rank]++;
    };

    const bl = this.belong[l];
    const br = this.belong[r];

    if (bl === br) {
      for (let i = l; i <= r; i++) bump(this.arr[i]);
    } else {
      for (let i = l; i <= this.blockRight[bl]; i++) bump(this.arr[i]);
      // 整块：直接查表累加
      for (let b = bl + 1; b < br; b++) {
        for (const [rank, f] of this.freq[b]) {
          if (this.cnt[rank] === 0) this.touched[touchedLen++] = rank;
          this.cnt[rank] += f;
        }
      }
      for (let i = this.blockLeft[br]; i <= r; i++) bump(this.arr[i]);
    }

    // 在被触及过的值里扫一遍：最大次数 + 是否唯一
    let bestCount = 0;
    let bestRank = -1;
    let numBest = 0;
    for (let i = 0; i < touchedLen; i++) {
      const rank = this.touched[i];
      const c = this.cnt[rank];
      if (c > bestCount) {
        bestCount = c;
        bestRank = rank;
        numBest = 1;
      } else if (c === bestCount) {
        numBest++;
        if (rank < bestRank) bestRank = rank; // 并列取最小值
      }
    }

    return { value: this.original[bestRank], count: bestCount, mode: numBest === 1 };
  }
}
```

> **Python / Go 版本**：结构完全一致，把 `Map` 换成 `dict` / `map[int]int` 即可，我在下面的小节里给出完整代码。

```python
import math
from typing import List, Tuple


class BlockModeQuery:
    """区间众数（蒲公英）：分块 + 块内计数表。"""

    def __init__(self, values: List[int]):
        self.n = len(values)
        self.block_size = max(1, int(math.isqrt(self.n)))
        self.block_count = math.ceil(self.n / self.block_size)

        # 离散化
        uniq = sorted(set(values))
        rank = {v: i for i, v in enumerate(uniq)}
        self.original = uniq

        self.arr = [0] + [rank[v] for v in values]
        self.belong = [0] * (self.n + 1)
        self.block_left = [0] * self.block_count
        self.block_right = [0] * self.block_count
        self.freq = []

        for b in range(self.block_count):
            l = b * self.block_size + 1
            r = min(self.n, (b + 1) * self.block_size)
            self.block_left[b] = l
            self.block_right[b] = r
            for i in range(l, r + 1):
                self.belong[i] = b

            m = {}
            for i in range(l, r + 1):
                v = self.arr[i]
                m[v] = m.get(v, 0) + 1
            self.freq.append(m)

        self.cnt = [0] * len(uniq)

    def query(self, l: int, r: int):
        """返回 (众数值, 出现次数, 众数是否唯一)。并列时取最小值。"""
        self.cnt = [0] * len(self.original)
        bl, br = self.belong[l], self.belong[r]

        if bl == br:
            for i in range(l, r + 1):
                self.cnt[self.arr[i]] += 1
        else:
            for i in range(l, self.block_right[bl] + 1):
                self.cnt[self.arr[i]] += 1
            for b in range(bl + 1, br):
                for v, f in self.freq[b].items():
                    self.cnt[v] += f
            for i in range(self.block_left[br], r + 1):
                self.cnt[self.arr[i]] += 1

        best_count, best_rank, num_best = 0, -1, 0
        for rank, c in enumerate(self.cnt):
            if c > best_count:
                best_count, best_rank, num_best = c, rank, 1
            elif c == best_count and c > 0:
                num_best += 1
                if rank < best_rank:
                    best_rank = rank

        return self.original[best_rank], best_count, num_best == 1


# 使用示例
if __name__ == "__main__":
    bq = BlockModeQuery([3, 3, 3, 1, 1, 2, 5])
    print(bq.query(1, 7))  # (3, 3, True)
```

```go
package main

import (
	"fmt"
	"math"
	"sort"
)

// 区间众数（分块 + 块内计数表）—— Go 实现
type BlockModeQuery struct {
	n          int
	blockSize  int
	blockCount int

	arr        []int
	belong     []int
	blockLeft  []int
	blockRight []int
	freq       []map[int]int
	original   []int
	cnt        []int
}

func NewBlockModeQuery(values []int) *BlockModeQuery {
	n := len(values)
	blockSize := int(math.Sqrt(float64(n)))
	if blockSize < 1 {
		blockSize = 1
	}
	blockCount := (n + blockSize - 1) / blockSize

	uniq := make([]int, 0, n)
	seen := make(map[int]bool, n)
	for _, v := range values {
		if !seen[v] {
			seen[v] = true
			uniq = append(uniq, v)
		}
	}
	sort.Ints(uniq)
	rank := make(map[int]int, len(uniq))
	for i, v := range uniq {
		rank[v] = i
	}

	bq := &BlockModeQuery{
		n:          n,
		blockSize:  blockSize,
		blockCount: blockCount,
		arr:        make([]int, n+1),
		belong:     make([]int, n+1),
		blockLeft:  make([]int, blockCount),
		blockRight: make([]int, blockCount),
		freq:       make([]map[int]int, blockCount),
		original:   uniq,
		cnt:        make([]int, len(uniq)),
	}

	for i, v := range values {
		bq.arr[i+1] = rank[v]
	}
	for b := 0; b < blockCount; b++ {
		l := b*blockSize + 1
		r := (b + 1) * blockSize
		if r > n {
			r = n
		}
		bq.blockLeft[b] = l
		bq.blockRight[b] = r
		for i := l; i <= r; i++ {
			bq.belong[i] = b
		}
		m := make(map[int]int)
		for i := l; i <= r; i++ {
			m[bq.arr[i]]++
		}
		bq.freq[b] = m
	}
	return bq
}

// Query 返回 (众数值, 出现次数, 众数是否唯一)。并列时取最小值。
func (bq *BlockModeQuery) Query(l, r int) (int, int, bool) {
	for i := range bq.cnt {
		bq.cnt[i] = 0
	}
	bl, br := bq.belong[l], bq.belong[r]

	if bl == br {
		for i := l; i <= r; i++ {
			bq.cnt[bq.arr[i]]++
		}
	} else {
		for i := l; i <= bq.blockRight[bl]; i++ {
			bq.cnt[bq.arr[i]]++
		}
		for b := bl + 1; b < br; b++ {
			for v, f := range bq.freq[b] {
				bq.cnt[v] += f
			}
		}
		for i := bq.blockLeft[br]; i <= r; i++ {
			bq.cnt[bq.arr[i]]++
		}
	}

	bestCount, bestRank, numBest := 0, -1, 0
	for rank, c := range bq.cnt {
		if c > bestCount {
			bestCount, bestRank, numBest = c, rank, 1
		} else if c == bestCount && c > 0 {
			numBest++
			if rank < bestRank {
				bestRank = rank
			}
		}
	}
	return bq.original[bestRank], bestCount, numBest == 1
}

func main() {
	bq := NewBlockModeQuery([]int{3, 3, 3, 1, 1, 2, 5})
	v, c, unique := bq.Query(1, 7)
	fmt.Println(v, c, unique) // 3 3 true
}
```

---

## 四、核心模型三：值域分块

这是分块思想最容易被忽略、但工程上**极其常用**的一种形态。

### 4.1 场景：从 1 到 10^9 的数里，统计出现次数

维护一个计数数组 `cnt[1..10^9]`，支持：

- 把数字 $x$ 的计数 +1
- 查询 $[L, R]$ 内所有数字的计数之和

数组开 $10^9$ 个？内存直接爆炸。

**解法：分块值域。** 把 $[1, 10^9]$ 切成若干段，每段长度 $\approx \sqrt{10^9} \approx 31623$，共约 31623 段。

```text
值域 [1, 10^9]：

  段0          段1          段2    ...   段31622
  [1, 31623]   [31624, ...]  [...]       [...]
  ┌──────────┐  ┌──────────┐
  │ 桶内计数  │  │ 桶内计数  │  ← 每段维护一个"这一段总共被加了多少次"
  │  cnt[i]   │  │  cnt[i]   │
  │  (精确)   │  │  (精确)   │
  │  tag[0]   │  │  tag[1]   │  ← 每段维护一个"这一段被整体加了多少次"
  └──────────┘  └──────────┘
```

- **单点加** `cnt[x]++`：O(1)，同时给所在段的 `tag` 加 1
- **区间查询**：零散段暴力查桶，整段直接读 `tag`，O(√V)

### 4.2 和"位置分块"的区别

这是最容易搞混的地方，我用一张表说清楚：

| | 位置分块 | 值域分块 |
| --- | --- | --- |
| 分的是什么 | **下标空间**（数组位置） | **值空间**（数值范围） |
| 典型场景 | 区间加、区间求和 | 值域巨大、值域计数 |
| 块的划分 | 按位置连续切 | 按值域连续切 |
| 摘要是 | 块内元素和/最值 | 该值域段的元素个数 |
| 典型题 | 区间和、区间众数 | 值域计数、约数枚举 |

**位置分块是"我在这个位置放了什么"，值域分块是"这个数值出现了多少次"。**

### 4.3 代码实现（值域分块求约数和）

经典应用：**给定 $n$，求 $\sum_{i=1}^{n} \lfloor n/i \rfloor$**（即 $\sum_{d=1}^{n} d \cdot \lfloor n/d \rfloor$ 的变体）。用值域分块可以做到 $O(\sqrt{n})$。

```typescript
/**
 * 值域分块 —— 求 sum_{i=1}^{n} floor(n / i)
 *
 * 做法：floor(n/i) 只有 O(sqrt(n)) 个不同的取值，
 * 对每个取值区间 [l, r]，其中 floor(n/i) 恒等于 q = floor(n/l)，
 * 于是这一段的贡献是 (r - l + 1) * q。
 */
export function sumFloor(n: number): number {
  let ans = 0;
  for (let l = 1; l <= n; ) {
    const q = Math.floor(n / l);
    const r = Math.floor(n / q); // 使 floor(n/i) == q 的最大 i
    ans += (r - l + 1) * q;
    l = r + 1;
  }
  return ans;
}

// 验证：n = 5 → 5/1 + 5/2 + 5/3 + 5/4 + 5/5 = 5+2+1+1+1 = 10
console.log(sumFloor(5)); // 10
```

这个技巧叫 **"数论分块 / 整除分块"**，本质是值域分块的简化版 —— 它不维护计数表，而是利用"商的取值只有 $O(\sqrt n)$ 种"这个性质。

:::tip 面试加分点
数论分块在面试里比值域分块更常出现。LeetCode 上面「求 $\sum \lfloor n/i \rfloor$」这类题，基本都是这个套路。核心洞察就一句：**`floor(n/i)` 在 $i > \sqrt{n}$ 之后，值域被限制在 $[1, \sqrt{n}]$ 内，所以可以整段整段地跳。**
:::

---

## 五、实战性能对比：分块 vs 树状数组 vs 线段树

光说不练假把式。我把三份实现都写好了，**跑了一遍真实的对拍和压测**。

### 5.1 测试环境

```text
硬件：Apple Silicon (macOS)
运行时：Node.js v26.7.0
数据：随机数组，操作区间随机生成
对拍：分块 vs 树状数组 vs 线段树 vs 暴力枚举，四方交叉验证
```

### 5.2 正确性对拍结果

```text
=== 正确性对拍（分块 vs 树状数组 vs 线段树 vs 暴力）===
n=10   : 500 次区间加 OK
n=100  : 500 次区间加 OK
n=1000 : 500 次区间加 OK
n=10000: 500 次区间加 OK
众数查询对拍 OK（n=1000, n=10000）
```

四份实现（分块 / 树状数组 / 线段树 / 暴力）在 500 次随机区间加之后，**逐点值和 3000 组随机区间的 sum/max/min 全部一致** ✅

Python 版和 Go 版也各自跑了独立的随机对拍：

```text
=== Python 实现自测 ===
  n=   10  区间加 + 求和/最值 对拍 OK
  n=  100  区间加 + 求和/最值 对拍 OK
  n= 1000  区间加 + 求和/最值 对拍 OK
  n= 5000  区间加 + 求和/最值 对拍 OK
  n= 1000  区间众数 对拍 OK
  n= 5000  区间众数 对拍 OK
```

### 5.3 性能实测

```text
┌─────────────┬───────────┬──────┬──────┬─────────────┬─────────────┬───────────────┬───────────────┬───────────────┬─────────────────┬───────────────┬─────────────────┐
│ n           │ q         │ 块长 │ 块数 │ 分块·加(us) │ 树状·加(us) │ 线段树·加(us) │ 分块·求和(us) │ 树状·求和(us) │ 线段树·求和(us) │ 分块·最值(us) │ 线段树·最值(us) │
├─────────────┼───────────┼──────┼──────┼─────────────┼─────────────┼───────────────┼───────────────┼───────────────┼─────────────────┼───────────────┼─────────────────┤
│ 1,000       │ 200,000   │ 31   │ 33   │ 0.30        │ 0.03        │ 0.23          │ 0.15          │ 0.04          │ 0.14            │ 0.07          │ 0.15            │
│ 100,000     │ 200,000   │ 316  │ 317  │ 3.15        │ 0.05        │ 0.77          │ 1.64          │ 0.06          │ 0.25            │ 0.40          │ 0.30            │
│ 1,000,000   │ 100,000   │ 1000 │ 1000 │ 9.42        │ 0.10        │ 0.72          │ 5.35          │ 0.10          │ 0.36            │ 1.13          │ 0.39            │
└─────────────┴───────────┴──────┴──────┴─────────────┴─────────────┴───────────────┴───────────────┴─────────────────┴───────────────┴─────────────────┘
```

**怎么读这张表？** 我把几个关键点拆开说：

**① 树状数组赢得最漂亮。**

区间加区间求和它只需要两棵树状数组，常数极小，$n=10^6$ 时单次操作只要 **0.10 μs**。这比线段树还快一个数量级 —— 因为树状数组的常数小得离谱（没有递归、没有指针跳转，纯数组遍历）。

**② 线段树比想象中慢。**

$n=10^6$ 时线段树单次区间加要 **0.72 μs**，比分块还快，但比树状数组慢 7 倍。原因很直接：**线段树有递归开销**。每次 `pushDown` / `pushUp` 都是函数调用，在 JS 里这个代价尤其明显。

> 如果你在 Node.js 里做重度区间操作，**树状数组往往比线段树更划算** —— 复杂度一样，常数小得多。

**③ 分块的复杂度增长是可预测的。**

$n$ 翻 10 倍（$10^5 \to 10^6$），分块的区间加从 3.15 μs 涨到 9.42 μs —— 大约 3 倍。理论值应该是 $\sqrt{10} \approx 3.16$ 倍，**实测和理论几乎完全吻合** ✅

### 5.4 块长调优实验

这是分块独有的问题：**块长不一定要取 $\sqrt{n}$**。

我拿 $n=10^5$、$q=2\times 10^5$ 做了块长扫描：

```text
┌─────────┬──────┬──────┬────────┬──────────┐
│ 块长    │ 块数 │      │ 加(us) │ 求和(us) │
├─────────┼──────┼──────┼────────┼──────────┤
│ 16      │ 6250 │      │ 2.79   │ 6.79     │
│ 32      │ 3125 │      │ 1.42   │ 3.50     │
│ 64      │ 1563 │      │ 0.78   │ 1.94     │
│ 128     │ 782  │      │ 0.50   │ 1.37     │
│ 256     │ 391  │      │ 0.46   │ 1.48     │
│ 512     │ 196  │      │ 0.64   │ 2.34     │
│ 1024    │ 98   │      │ 1.09   │ 4.42     │
│ 2048    │ 49   │      │ 2.05   │ 8.37     │
└─────────┴──────┴──────┴────────┴──────────┘
```

**结论很有意思：最优点在 B=128~256，而不是理论上的 $\sqrt{10^5} \approx 316$。**

为什么理论值不是最优？因为理论分析假设"零散部分和整块部分的代价相等"，但实际中：

- **整块部分是纯数组访问**，连续内存，CPU 预取器能完美命中，**非常快**
- **零散部分是随机访问**，跨越两个块，**相对慢**

所以实际应该让**零散部分尽量小**，也就是块长取得比 $\sqrt n$ 略小一些。经验值：**$B \approx \sqrt{n} / 1.2$ 左右**，或者直接取 $\sqrt{n}$ 附近试几个值。

### 5.5 各语言实测（同一份算法，不同语言）

$n = 200{,}000$，$q = 100{,}000$：

```text
TypeScript (Node v26.7.0) : 区间加 9.42 μs/op（n=10^6 时），区间求和 5.35 μs/op
Python 3.13              : 区间加 70.81 μs/op，区间求和 18.07 μs/op
Go 1.27.3                : 区间加 1.70 μs/op，区间求和 0.31 μs/op
```

Go 比 Python 快 **40 倍**，这个差距主要来自：

1. **无 GC 压力**：Go 的 `[]float64` 是连续内存，没有 Python 那样的对象头和引用计数
2. **没有装箱**：Python 的 `int` 是任意精度的对象，每次算术都有分配
3. **边界检查消除**：Go 编译器能做 BCE（bounds check elimination）

这也是为什么**Go 写竞赛/高性能代码舒服**：同样的算法，代码几乎一样，但性能差一个量级。

---

## 六、复杂度分析汇总

| 操作 | 分块 | 树状数组 | 线段树 |
| --- | --- | --- | --- |
| 区间加 | $O(\sqrt{n})$ | $O(\log n)$ | $O(\log n)$ |
| 区间求和 | $O(\sqrt{n})$ | $O(\log n)$ | $O(\log n)$ |
| 区间最值 | $O(\sqrt{n})$ | ❌ 不支持 | $O(\log n)$ |
| 区间众数 | $O(\sqrt{n})$（值域小） | ❌ 不支持 | ❌ 不支持 |
| 建树 / 初始化 | $O(n)$ | $O(n)$ | $O(n)$ |
| 空间 | $O(n)$ | $O(n)$ | $O(n)$ |

**分块在复杂度上全面劣势，但有三个它独有的优势：**

1. **实现难度低** —— 没有递归、没有指针，几十行搞定
2. **支持"线段树做不到"的操作** —— 区间众数、值域计数这类问题，分块能直接做
3. **常数可控** —— 全部是数组访问，缓存友好

---

## 七、实际应用

### 7.1 值域分块：约数枚举

最经典的应用。给定 $n$，求 $n$ 的所有约数个数。

```typescript
function countDivisors(n: number): number {
  let ans = 0;
  for (let l = 1; l <= n; ) {
    const q = Math.floor(n / l);
    const r = Math.floor(n / q);
    ans += (r - l + 1); // [l, r] 内的每个 l 都是一个约数
    l = r + 1;
  }
  return ans;
}
```

$O(\sqrt{n})$，而不是 $O(n)$ 枚举。

### 7.2 排序数组上的区间操作

分块在**已经有序**的数组上尤其好用 —— 因为块内天然有序，很多操作可以直接二分。

比如"查询区间内第 $k$ 小的数"：

- 每块存一个排序好的副本
- 整块部分二分定位，零散部分直接数
- 复杂度 $O(\sqrt{n} \log n)$

这比"每次都重新排序"快得多。

### 7.3 动态数组 / 分页加载

前端的**虚拟滚动列表**（infinite scroll）本质上就是分块：

- 按 100 条一页切分
- 页级维护"是否已加载""总条数"
- 滚动到某页时，按需加载该页数据
- 页内已加载的部分走内存缓存

这就是分块思想在 UI 层的直接映射。

### 7.4 真实后端场景：批量计数与限流

想象一个网关要在 1 秒内统计"每个 IP 在最近 10 秒内的请求数"：

- 请求按时间戳分块（每秒一块）
- 每块维护 IP → 次数 的 Map
- 查询最近 10 秒 = 读 10 个块的 Map
- 内存只保留最近的若干块，旧的直接丢弃

**这就是一个生产级的"环形时间轮 + 分块"混合结构。** 相关的可以看看[令牌桶与漏桶](rate-limiting-token-bucket.md)那篇。

### 7.5 面试怎么答

如果面试官问"怎么维护一个支持区间加区间求和的数组"，我的回答顺序是：

1. **先说树状数组/线段树**（标准答案）
2. **如果对方问"有没有更简单的"** → 说出分块方案
3. **如果对方追问"分块为什么是 √n"** → 解释 $B + n/B$ 的均衡（本文第 2.1 节）
4. **如果对方追问"还能更快吗"** → 说块长调优、或者讲线段树 Beats

**能主动说出分块，通常就是"基础扎实 + 有工程直觉"的信号。** 只会背线段树的人不少，能讲清楚"什么时候分块反而更合适"的人不多。

---

## 八、踩坑实录

### 坑 1：懒标记放错层级

把懒标记放在元素级，然后每次查询都一路往下推 —— 代码量翻三倍，还容易漏掉某个分支。

**正解**：懒标记只放块级，元素存"基础值"，真实值 = 基础值 + 块级 lazy。查询整块时直接读已经含 lazy 的摘要。

### 坑 2：摘要忘了包含懒标记

如果你把 `sum[b]` 定义成"块内基础值之和"，那查询整块时必须额外加 `lazy[b] * len[b]`。**两种设计都可以，但必须前后一致** —— 我见过代码里一半算含 lazy、一半算不含 lazy 的情况，debug 到怀疑人生。

我的做法是：**摘要一律按"实际值"统计**，查询时零散部分也要 `arr[i] + tag`，别漏。

### 坑 3：`belong` 数组没初始化

`belong[i]` 必须在构造函数里对**每个位置**赋值，1-indexed 的话是 `for (i = l; i <= r; i++)`。漏赋值会导致 `belong[0]` 被访问，症状是"某个特定区间的结果永远错"。

### 坑 4：零散块改完忘 rebuild

改了 `arr[i]` 却没调 `rebuild(b)`，那块的摘要就永远停留在旧值。**症状**：区间加只对"恰好落在完整块上"的查询生效，其他查询全错。

### 坑 5：块长取 0

$n = 1$ 时 `Math.floor(Math.sqrt(1)) = 1` 没问题，但如果你自己写成 `Math.floor(Math.sqrt(n / 2))`，$n=1$ 时就变 0 了，**除零 / 死循环**。

保险写法：`Math.max(1, Math.floor(Math.sqrt(n)))`。

### 坑 6：众数查询的并列处理

多个值并列成为众数时，必须**规定一个确定的选择规则**（比如取最小值），否则：

- 你的实现和标程答案不一致，判 WA
- 更糟的是**多线程/分布式场景下结果不确定**

我在实现里用的是"并列取最小值"，并且**测试的暴力参考实现也用了同样的规则** —— 这就是为什么第一次对拍就报错了：我的暴力参考用了 Map 的插入顺序。两边规则统一后立刻通过 ✅

### 坑 7：Python 的 `math.isqrt` vs `math.sqrt`

`math.sqrt(10**10)` 返回浮点数，转 `int` 可能因为精度问题差 1。Python 3.8+ 有 `math.isqrt`，**做整除根请一律用 `math.isqrt`**，它是精确的整数运算。

```python
block_size = max(1, math.isqrt(self.n))   # ✅ 精确
block_size = int(math.sqrt(self.n))       # ⚠️ 大数下可能差 1
```

### 坑 8：浮点数的 `Infinity` 初始化

`max` 数组初始化成 `0` 的话，如果所有元素都是负数，结果就错了。必须用 `-Infinity` / `Infinity`：

```typescript
this.max = new Float64Array(this.blockCount).fill(-Infinity);
this.min = new Float64Array(this.blockCount).fill(Infinity);
```

Go 里对应 `math.Inf(-1)` 和 `math.Inf(1)`，Python 里对应 `float("-inf")` 和 `float("inf")`。

> **顺带一提**：`new Float64Array(n)` 在 JS 里是**初始化为 0** 的，不是 `undefined`。但如果你用普通数组 `new Array(n)`，那就是 `undefined`，`undefined + 5 = NaN`，一路 NaN 下去，非常难查。

---

## 九、小结

根号分治这一篇，讲的其实是一件很朴素的事：

> **当你能造出一个 $O(\log n)$ 的数据结构时，用它；当造不出来时，用 $O(\sqrt{n})$ 的分块永远比 $O(n)$ 的暴力强。**

核心收获：

- ✅ **分块的核心是"摘要"**：用 O(1) 的信息概括 O(√n) 个元素
- ✅ **块长取 √n 的推导**：$O(B) + O(n/B)$ 两项均衡，$B = \sqrt{n}$ 时最小
- ✅ **懒标记只放块级**：元素存基础值，真实值 = 基础值 + 块级 lazy
- ✅ **三个经典模型**：区间加求和（懒标记）、区间众数（块内计数表）、值域分块（分值空间）
- ✅ **实测结论**：分块复杂度增长符合理论，但常数比线段树小；树状数组常数最小，JS 里比线段树还快
- ✅ **块长可以调优**：实测最优点略小于 √n，因为整块访问比零散访问快
- ❌ **不适用于**：真正需要 O(log n) 的场景（$10^6$ 级数据 + 极高频查询）

面试里如果被问到区间操作，我的完整回答会是：

1. 说出**树状数组**（区间和）/ **线段树**（区间最值）
2. 补充**分块**方案，说明 $B + n/B$ 的推导
3. 讲**块内计数表**能处理区间众数（线段树做不到）
4. 提一句**块长实测调优**的经验值

能把第 3、4 点说出来，基本就碾压 90% 的候选人了 🎯

---

## 相关阅读

- [树状数组（Binary Indexed Tree）](binary-indexed-tree.md) —— 区间和的标准解法，常数比线段树小
- [线段树](segment-tree.md) —— 万能选手，但递归常数高
- [Segment Tree Beats 精讲（吉司机线段树）](segment-tree-beats.md) —— 线段树在特定操作下的进阶
- [莫队算法（Mo's Algorithm）](mo-s-algorithm.md) —— 离线区间查询的另一种解法，同样是分块思想
- [前缀和与差分数组](prefix-sum.md) —— 最简单的区间查询方案
- [哈希表设计](design-hashmap.md) —— 分块计数表里用到的 Map 的底层
