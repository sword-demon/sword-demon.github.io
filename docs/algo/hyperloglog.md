---
title: HyperLogLog 基数估计
description: HyperLogLog 基数估计算法，用极小空间估算海量数据的去重数量
date: 2026-10-08 09:26:04
categories:
  - Algorithm
tags:
  - hyperloglog
  - cardinality-estimation
  - probability
sidebarSort: 99
---

# HyperLogLog 基数估计

想象一个真实的场景：你的网站每天有 1000 万用户访问，老板让你实时统计"今天有多少独立用户访问过"。最简单的办法：用 `Set` 把每个用户 ID 都存起来，到晚上数 `Set.size()` 就行。但问题是，1000 万个 ID × 每个 20 字节 ≈ 200MB，Redis 跑一天光这一项就要吃几 G 内存。一个月下来账单吓人 💸。

退一步，你可能想到用 BitMap（位图）—— 给每个用户分配一个位，1 亿用户也只要 12MB 左右。但前提是你知道用户 ID 的范围。如果用户 ID 是字符串（比如 UUID、邮箱、手机号），BitMap 也没法直接用。

有没有一种**不依赖 ID 范围、又能用极小空间估算出独立用户数**的方法？

有，这就是 **HyperLogLog（HLL）**。它的核心卖点：**不管数据量是 1 万还是 10 亿，内存占用始终是 12KB 左右**，误差不超过 1%。Redis 的 `PFADD` / `PFCOUNT` 命令就是 HyperLogLog 的工业级实现，BigQuery、Spark、Flink 也都内置了类似算法。今天我们就来扒一扒这个"看似魔法"的数据结构 ✨。

## 为什么需要 HyperLogLog？

先看看"精确去重"和"近似去重"各自的代价：

| 数据量 | HashSet | BitMap（ID 范围已知） | HyperLogLog |
| ------ | ------- | --------------------- | ----------- |
| 100 万 | ~50MB   | ~1.2MB                | **12KB**    |
| 1 亿   | ~5GB    | ~120MB                | **12KB**    |
| 10 亿  | ~50GB   | ~1.2GB                | **12KB**    |

HyperLogLog 用 **固定 12KB** 的内存就能搞定任何量级的数据。代价是：它给出的不是精确数字，而是一个**有误差的估计值**（标准误差约 0.81%）。但对 UV 统计、IP 去重、搜索词去重这类业务来说，1% 的误差完全可接受。

一句话总结：**HyperLogLog 是用极小空间换可接受精度的去重计数器**。

## 原理拆解

HyperLogLog 的原理不复杂，但要理解它需要先搞懂几个直觉。我会一层层拆解，保证你能看明白 👇。

### 第一层直觉：哈希后看前导零

先看一个简化版的思路——**LogLog** 算法：

把每个元素都哈希成一个二进制串，然后看这个二进制串**从左到右第一次出现 1 的位置**。

```
元素 A → 哈希后: 00101011... → 第一个 1 在第 3 位
元素 B → 哈希后: 00001110... → 第一个 1 在第 5 位
元素 C → 哈希后: 00000101... → 第一个 1 在第 6 位
```

直觉：如果哈希函数是均匀分布的，那么出现"第 k 位才是第一个 1"的概率是 2^(-k)。

比如：第一个 1 在第 1 位的概率是 1/2；在第 2 位的概率是 1/4；在第 k 位的概率是 1/(2^k)。

这就引出一个关键观察：**如果我观察到的最大前导零数是 k，那么数据量大概就是 2^k**。

```
观察到最大前导零数 = 5 → 估计数据量 ≈ 2^5 = 32
观察到最大前导零数 = 10 → 估计数据量 ≈ 2^10 = 1024
观察到最大前导零数 = 20 → 估计数据量 ≈ 2^20 ≈ 100 万
```

是不是很巧妙？用一个数字就能估出总量 ✨。

### 第二层直觉：LogLog 为什么误差大

但上面的简单方法误差非常大。原因：**样本太少**。你只看了"最大前导零数"这一个极值，相当于用一次抽奖的结果去推断总人数，运气成分太大。

假设哈希是均匀的，那么出现最大前导零数 ≥ k 的概率约为 1/2^k。所以：

- 数据量 N ≈ 100 时，出现最大前导零数 ≥ 7 的概率是 1/128，看起来很稀有——但总会有一个元素撞上
- 数据量 N ≈ 1000 时，最长前导零数大概率是 10（因为 2^10 ≈ 1024）

**问题**：单次极值的方差很大。可能数据量只有 100，但运气好出了一个 12 位前导零的，估算就偏到 4096 了。

### 第三层直觉：用"分桶平均"降低方差

LogLog 的改进：**把数据分到 m 个桶里，分别记录每个桶的最大前导零数，最后用调和平均数合并**。

```
假设分 64 个桶（m = 64）：

桶 0:  max_zeros = 5
桶 1:  max_zeros = 8
桶 2:  max_zeros = 3
...
桶 63: max_zeros = 6

用调和平均数估计总量
```

为什么是调和平均数而不是普通平均数？因为最大前导零数的分布是偏斜的，用调和平均数能更好抑制极端值的影响。

**误差分析**：分桶数 m 越大，误差越小。具体来说，标准误差约为 **1.04 / √m**：

- m = 64（6 位哈希） → 误差约 13%
- m = 1024（10 位哈希） → 误差约 3.2%
- m = 16384（14 位哈希） → 误差约 0.81%（HyperLogLog 的典型配置）

### 第四层直觉：HyperLogLog 的精妙修正

LogLog 用调和平均已经够好了，但有个小问题：当某些桶的最大前导零数是 0（很常见，比如数据量小时），调和平均会被拉低，导致高估。

HyperLogLog 做了一个分段修正：

- 当估计值比较小时，用一种修正公式
- 当估计值比较大时，用另一种
- 数据量极小时（< 2.5 × m），用**线性计数**算法（Linear Counting）补位

这套组合拳让 HyperLogLog 在不同数据规模下都能保持稳定精度。

### 图解全过程

```
输入流: [user_1, user_5, user_3, user_9, user_5, ...]
                              ↓ 哈希函数（SHA-256 等）

           ┌──────────────────────────┐
           │   哈希值二进制串          │
           │   00010110 01011100 ...  │
           └──────────────────────────┘
                       ↓
        ┌──────────────┴──────────────┐
        ↓                             ↓
   前 14 位（桶号）                后 50 位（前导零观察）
   11001011100100                  0001011001011100...
        ↓                             ↓
     桶号 = 12345              最大前导零数 = 3
        ↓                             ↓
   ┌─────────────────────────────────────┐
   │  registers[12345] = max(当前值, 3)   │
   └─────────────────────────────────────┘

最终：
┌─────┬─────┬─────┬─────┬─────┬─────┐
│  5  │  8  │  3  │  6  │  2  │ ... │  ← 16384 个寄存器，每个 6 位
└─────┴─────┴─────┴─────┴─────┴─────┘
       ↓
   调和平均 + 偏差修正
       ↓
   估计基数 N ≈ ?
```

## 代码实现

下面我们从零实现一个简化版 HyperLogLog（用 14 位桶号 + 6 位前导零寄存器），让你彻底理解原理。

### TypeScript

```typescript
/**
 * HyperLogLog —— TypeScript 实现
 * 核心思想：用哈希 + 桶 + 最大前导零数估计基数
 *
 * 为什么 14 位桶号：2^14 = 16384 桶，标准误差约 0.81%
 * 为什么 6 位寄存器：能存 0-63 的最大前导零数，够用
 */
class HyperLogLog {
  // 桶的数量：2^p（p = bucketBits）
  private readonly m: number;
  // 每个桶的最大前导零数（0-63），用 Uint8Array 节省内存
  private readonly registers: Uint8Array;
  // 用于分桶的位数（前 p 位）
  private readonly bucketBits: number;
  // 哈希函数（用 SHA-256 模拟，32 字节 = 256 位）
  private readonly hashBits: number;

  constructor(bucketBits: number = 14) {
    this.bucketBits = bucketBits;
    this.m = 1 << bucketBits; // 2^p
    this.registers = new Uint8Array(this.m).fill(0);
    this.hashBits = 256; // SHA-256 输出 256 位
  }

  /**
   * 把任意输入映射成 32 字节的哈希值
   * 为什么用 SHA-256：分布足够均匀，工业级标准选择
   */
  private async hash(input: string): Promise<Uint8Array> {
    const data = new TextEncoder().encode(input);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(buffer);
  }

  /**
   * 计算一个字节二进制表示中前导零的个数（从最高位开始）
   * 为什么从最高位开始：和"第一个 1 在第几位"语义一致
   */
  private countLeadingZerosInByte(byte: number): number {
    if (byte === 0) return 8; // 全 0 算 8 个前导零
    let count = 0;
    // 一个字节最高位是 128 (10000000)，从高位到低位依次检查
    for (let i = 7; i >= 0; i--) {
      if ((byte >> i) & 1) break;
      count++;
    }
    return count;
  }

  /**
   * 添加一个元素到 HLL
   */
  async add(item: string): Promise<void> {
    const hashBytes = await this.hash(item);

    // 步骤 1：从哈希值前 bucketBits 位取出桶号
    // 用前两个字节（共 16 位）取前 14 位，足够 bucketBits = 14 的情况
    let bucket = 0;
    const bitsNeeded = this.bucketBits;
    for (let i = 0; i < bitsNeeded; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = 7 - (i % 8);
      const bit = (hashBytes[byteIndex] >> bitIndex) & 1;
      bucket = (bucket << 1) | bit;
    }

    // 步骤 2：从哈希剩余位中找最大前导零数
    // 跳过已经用过的 bucketBits 位，从下一个字节开始数
    const skipBytes = Math.ceil(bitsNeeded / 8);
    let maxZeros = 0;
    let foundOne = false;

    for (let i = skipBytes; i < hashBytes.length; i++) {
      const byte = hashBytes[i];
      if (!foundOne) {
        const leadingZeros = this.countLeadingZerosInByte(byte);
        maxZeros += leadingZeros;
        if (leadingZeros < 8) {
          // 这一字节里有 1，停止
          foundOne = true;
        }
        // 否则继续看下一个字节（全 0 时加 8）
      }
      // 一旦找到第一个 1，剩下的位就不数了
      if (foundOne) break;
    }

    // 步骤 3：更新对应桶的最大值
    // 为什么要 max：保留历史最大值，新元素前导零更多才更新
    if (maxZeros > this.registers[bucket]) {
      this.registers[bucket] = Math.min(maxZeros, 63); // 上限 63，6 位能存
    }
  }

  /**
   * 估算基数（去重后的元素数量）
   * 公式：E = alpha(m) × m² × (Σ 2^(-R_j))^(-1)
   * 其中 R_j 是第 j 个桶的最大前导零数
   */
  estimate(): number {
    // 调和平均数的倒数（乘以 m）
    let sumInversePow = 0;
    let zeroBuckets = 0;

    for (let i = 0; i < this.m; i++) {
      const r = this.registers[i];
      sumInversePow += Math.pow(2, -r);
      if (r === 0) zeroBuckets++;
    }

    // alpha(m) 是常数：m=16384 时 alpha ≈ 0.7213
    // 简化版：alpha = 1 / (2 * ln(2)) ≈ 0.7213（m 较大时的极限值）
    const alpha = 0.7213 / (1 + 1.079 / this.m);

    // 原始估计值
    let estimate = (alpha * this.m * this.m) / sumInversePow;

    // 小数据量修正：如果有大量空桶，用线性计数公式
    if (estimate <= 2.5 * this.m && zeroBuckets > 0) {
      estimate = this.m * Math.log(this.m / zeroBuckets);
    }

    return Math.round(estimate);
  }

  /**
   * 合并另一个 HLL（用于分布式场景）
   * 核心：每个桶取最大值
   */
  merge(other: HyperLogLog): void {
    if (this.m !== other.m) {
      throw new Error("两个 HLL 的桶数必须相同才能合并");
    }
    for (let i = 0; i < this.m; i++) {
      this.registers[i] = Math.max(this.registers[i], other.registers[i]);
    }
  }
}

// 使用示例
async function demo() {
  const hll = new HyperLogLog(14);

  // 模拟 10000 个不同用户访问
  for (let i = 0; i < 10000; i++) {
    await hll.add(`user_${i}`);
  }

  console.log(`真实去重数: 10000`);
  console.log(`HLL 估计数: ${hll.estimate()}`);
  // 通常会输出 9900~10100 之间的数字，误差在 1% 左右

  // 重复添加不影响结果
  for (let i = 0; i < 5000; i++) {
    await hll.add(`user_${i}`);
  }
  console.log(`重复添加后估计: ${hll.estimate()}`);
  // 仍然是 10000 左右，证明是去重计数
}

// demo();
```

### Go

```go
package hyperloglog

import (
	"crypto/sha256"
	"encoding/binary"
	"math"
)

// HyperLogLog 基数估计结构体
// 为什么用 14 位桶号：2^14 = 16384 桶，标准误差约 0.81%
type HyperLogLog struct {
	m         uint32   // 桶的数量 = 2^p
	p         uint32   // 用于分桶的位数
	registers []uint8  // 每个桶的最大前导零数（0-63）
}

// New 创建 HLL 实例
// 为什么默认 p = 14：工业级标准，误差和内存的最佳平衡点
func New(p uint32) *HyperLogLog {
	m := uint32(1) << p
	return &HyperLogLog{
		m:         m,
		p:         p,
		registers: make([]uint8, m),
	}
}

// Add 添加一个元素
func (h *HyperLogLog) Add(item string) {
	// SHA-256 哈希
	hash := sha256.Sum256([]byte(item))

	// 步骤 1：取前 p 位作为桶号
	// 用前 4 个字节（32 位），从中取前 p 位
	first4 := binary.BigEndian.Uint32(hash[:4])
	bucket := first4 >> (32 - h.p) // 右移把目标位段移到最低位

	// 步骤 2：从剩余位中找最大前导零数
	// 跳过已经用过的位，从第 p 位的下一个字节开始
	skipBits := h.p
	skipBytes := (skipBits + 7) / 8 // 向上取整

	maxZeros := uint8(0)
	for i := skipBytes; i < len(hash); i++ {
		b := hash[i]
		if b == 0 {
			maxZeros += 8 // 整个字节都是 0，加 8
			continue
		}
		// 找到第一个 1，数前导零
		for j := 7; j >= 0; j-- {
			if (b>>j)&1 == 1 {
				break
			}
			maxZeros++
		}
		break
	}

	// 步骤 3：更新桶的最大值
	// 为什么用 max：保留历史最大前导零，新元素更多才覆盖
	if maxZeros > h.registers[bucket] {
		if maxZeros > 63 {
			maxZeros = 63
		}
		h.registers[bucket] = maxZeros
	}
}

// Estimate 估算基数
func (h *HyperLogLog) Estimate() uint64 {
	// 调和平均 + 偏差修正
	sumInversePow := 0.0
	zeroBuckets := 0

	for _, r := range h.registers {
		// pow(2, -r) 计算每个桶的倒数权重
		sumInversePow += math.Pow(2, -float64(r))
		if r == 0 {
			zeroBuckets++
		}
	}

	// alpha 常数：根据桶数 m 选择
	// m = 16384 时，alpha ≈ 0.7213
	alpha := 0.7213 / (1.0 + 1.079/float64(h.m))

	estimate := alpha * float64(h.m) * float64(h.m) / sumInversePow

	// 小数据量修正：线性计数
	if estimate <= 2.5*float64(h.m) && zeroBuckets > 0 {
		estimate = float64(h.m) * math.Log(float64(h.m)/float64(zeroBuckets))
	}

	return uint64(math.Round(estimate))
}

// Merge 合并另一个 HLL
// 为什么用 max：每个桶保留两个 HLL 中观察到的最大前导零数
func (h *HyperLogLog) Merge(other *HyperLogLog) {
	if h.m != other.m {
		panic("两个 HLL 的桶数必须相同")
	}
	for i := range h.registers {
		if other.registers[i] > h.registers[i] {
			h.registers[i] = other.registers[i]
		}
	}
}
```

### Python

```python
import hashlib
import math


class HyperLogLog:
    """HyperLogLog —— Python 实现

    核心思想：用哈希 + 桶 + 最大前导零数估计基数
    空间复杂度：O(m)，m 通常是 16384（12KB 内存）
    时间复杂度：添加 O(k)，k 是哈希计算时间
    """

    def __init__(self, bucket_bits: int = 14):
        # 桶的数量 = 2^bucket_bits
        # 为什么 14：工业标准，16384 桶对应 12KB 内存
        self.p = bucket_bits
        self.m = 1 << bucket_bits
        # 每个桶的最大前导零数
        # 为什么用 bytearray：紧凑存储，每个桶只占 1 字节
        self.registers = bytearray(self.m)

    @staticmethod
    def _hash(item: str) -> bytes:
        """SHA-256 哈希"""
        return hashlib.sha256(item.encode("utf-8")).digest()

    def _count_leading_zeros(self, hash_bytes: bytes, start_byte: int) -> int:
        """从 start_byte 开始数前导零"""
        zeros = 0
        for i in range(start_byte, len(hash_bytes)):
            b = hash_bytes[i]
            if b == 0:
                zeros += 8
                continue
            # 数这个字节里的前导零
            for j in range(7, -1, -1):
                if (b >> j) & 1:
                    return zeros
                zeros += 1
            return zeros
        return zeros

    def add(self, item: str) -> None:
        """添加一个元素到 HLL"""
        h = self._hash(item)

        # 步骤 1：取前 p 位作为桶号
        # 把前几个字节转成整数，再右移取出高位
        # 简化版：用前 (p+7)//8 个字节
        needed_bytes = (self.p + 7) // 8
        first_val = int.from_bytes(h[:needed_bytes], "big")
        bucket = first_val >> (needed_bytes * 8 - self.p)

        # 步骤 2：找最大前导零数
        # 跳过已经用过的字节
        max_zeros = self._count_leading_zeros(h, needed_bytes)

        # 步骤 3：更新桶的最大值
        if max_zeros > self.registers[bucket]:
            self.registers[bucket] = min(max_zeros, 63)

    def estimate(self) -> int:
        """估算基数

        公式：E = alpha(m) × m² / Σ(2^(-R_j))
        其中 R_j 是第 j 个桶的最大前导零数
        """
        sum_inv = 0.0
        zero_buckets = 0

        for r in self.registers:
            sum_inv += 2 ** (-r)  # 调和平均的倒数
            if r == 0:
                zero_buckets += 1

        # alpha(m) 是常数，m = 16384 时 ≈ 0.7213
        alpha = 0.7213 / (1.0 + 1.079 / self.m)

        estimate = alpha * self.m * self.m / sum_inv

        # 小数据量修正：用线性计数公式
        # 为什么：当数据很少时很多桶都是 0，原始公式会高估
        if estimate <= 2.5 * self.m and zero_buckets > 0:
            estimate = self.m * math.log(self.m / zero_buckets)

        return round(estimate)

    def merge(self, other: "HyperLogLog") -> None:
        """合并另一个 HLL（分布式场景）"""
        if self.m != other.m:
            raise ValueError("两个 HLL 的桶数必须相同")

        for i in range(self.m):
            if other.registers[i] > self.registers[i]:
                self.registers[i] = other.registers[i]


# 使用示例
if __name__ == "__main__":
    hll = HyperLogLog(bucket_bits=14)

    # 模拟 100000 个不同用户访问
    for i in range(100000):
        hll.add(f"user_{i}")

    print(f"真实去重数: 100000")
    print(f"HLL 估计数: {hll.estimate()}")
    # 通常输出 99200 ~ 100800 之间，误差 < 1%

    # 重复添加：验证去重特性
    for i in range(50000):
        hll.add(f"user_{i}")
    print(f"重复添加后: {hll.estimate()}")  # 仍然是 ~100000
```

## 业务场景

### 1. 网站 UV 统计（最经典）

每个互联网公司都要做 UV（独立访客）统计。传统的 `Set` 方案在 Redis 里跑一个月可能要几十 GB，而用 `PFADD` / `PFCOUNT`：

```bash
# 用户访问时记录
PFADD uv:2026-10-08 user_10086
PFADD uv:2026-10-08 user_10087
PFADD uv:2026-10-08 user_10086  # 重复，无影响

# 查询当天 UV
PFCOUNT uv:2026-10-08
# → 输出估计值，比如 8932
```

**为什么 HLL 适合 UV**：

- 用户 ID 可能是 UUID、邮箱、手机号，没法用 BitMap
- 数据量大（上亿 DAU 很常见）
- 误差 1% 完全可接受（运营看趋势，不是要绝对准确）

### 2. 搜索词去重

搜索引擎每天处理几亿次查询，需要统计"独立搜索词数量"。用 HLL 可以用极小空间快速估算：

```python
# 每条搜索记录都加到同一个 HLL
hll = HyperLogLog()
for query in search_log_stream:
    hll.add(query.lower().strip())

print(f"独立搜索词数: {hll.estimate()}")
```

### 3. 广告投放去重

广告平台需要统计"某广告被多少独立用户看过"。同样可以用 HLL，比传统 Set 节省 99% 以上内存。

### 4. 数据库查询优化器

PostgreSQL、ClickHouse 的查询优化器会用 HLL 估算 JOIN 结果的基数，决定用 Hash Join 还是 Nested Loop Join。

### 5. 分布式 UV 合并

每个机房维护自己的 HLL，定期把多个 HLL 合并（取每个桶的最大值）即可得到全局 UV：

```
机房 A 的 HLL: registers = [3, 5, 2, 8, 0, ...]
机房 B 的 HLL: registers = [4, 2, 2, 6, 7, ...]
合并后:       registers = [4, 5, 2, 8, 7, ...]  ← 每个位置取 max
```

## 复杂度分析

| 操作       | 时间复杂度 | 空间复杂度 |
| ---------- | ---------- | ---------- |
| 添加元素   | O(k)       | —          |
| 估算基数   | O(m)       | O(m)       |
| 合并两个 HLL | O(m)     | O(m)       |

- **添加 O(k)**：k 是计算哈希的时间（SHA-256 通常几微秒）。无论数据量多大，每次添加都是常数级时间。
- **估算 O(m)**：m 是桶数（16384），遍历一次 registers 数组而已。
- **空间 O(m)**：固定 16384 个字节（p=14），约 12KB。这个空间**和数据量完全无关**，无论你是 1 千还是 100 亿用户，都是 12KB。

### 误差公式

HyperLogLog 的标准误差是：

```
标准误差 = 1.04 / √m

m = 2^10 = 1024   → 误差 ≈ 3.2%
m = 2^14 = 16384  → 误差 ≈ 0.81%  ← Redis 默认
m = 2^16 = 65536  → 误差 ≈ 0.4%
```

误差和 √m 成反比，要更小的误差就要更多桶（更多内存）。但实际业务中 1% 误差已经够用，所以 16384 桶是最常见的配置。

## 小结

HyperLogLog 是一个"用概率换空间"的经典算法 🎯：

- ✅ **空间极省**：固定 12KB，不管数据量多大
- ✅ **速度快**：添加 O(k)，估算 O(m)，都是常数级
- ✅ **可合并**：多个 HLL 可以 merge，适合分布式场景
- ✅ **足够准**：误差 < 1%，对 UV/去重类业务完全够用
- ❌ **不能精确**：只能给出估计值，差几百几千对不上账
- ❌ **不能删除元素**：和布隆过滤器一样，删一个会影响其他元素的判断
- ❌ **不能查询单个元素是否存在**：HLL 不是过滤器，只是计数器

**和布隆过滤器的对比**：

| 特性 | 布隆过滤器 | HyperLogLog |
| ---- | ---------- | ----------- |
| 主要用途 | 判断元素是否存在 | 估算去重数量 |
| 空间 | 几百 MB~几 GB | **固定 12KB** |
| 误差类型 | 误判（说存在但实际不存在） | 数值误差（±1%） |
| 是否能查询 | ✅ 能查询单个元素 | ❌ 只能估算总数 |
| 工业实现 | Redis BF, Guava | Redis PF, BigQuery |

**实际工程建议**：

- 需要"判断 X 是否存在" → 布隆过滤器
- 需要"估算去重后的数量" → HyperLogLog
- 两个都用很常见：先过布隆过滤器挡无效请求，再用 HLL 算 UV

Redis 的 `PFADD` / `PFCOUNT` / `PFMERGE` 三个命令基本覆盖了所有使用场景，开箱即用 🎉。如果你在大数据栈里用 Spark / Flink，也可以用 `DataFrame.approxCountDistinct()`，底层就是 HLL 类的算法。

面试中被问到"如何用最少内存做 UV 统计"，直接甩 HyperLogLog 就是满分答案 💯。
