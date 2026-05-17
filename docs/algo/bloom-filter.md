# 布隆过滤器（Bloom Filter）

你有没有遇到过这样的场景：用户疯狂请求一个根本不存在的商品 ID，你的缓存没命中，请求全部打到数据库上，数据库瞬间就被压垮了。这就是传说中的**缓存穿透**。

怎么办？你可能会想——那我把所有存在的商品 ID 都存到一个 Set 里，来一个请求就查一下 Set 不就完了？问题是，假如你有 10 亿个商品，每个 ID 按 20 字节算，光存这个 Set 就要 20GB 内存。太贵了。

这时候，布隆过滤器就闪亮登场了 ✨。它只需要大约 **几百 MB**，就能告诉你："这个 ID **一定不存在**" 或者 "**可能存在**"。注意，它允许有一定的误判——说存在可能实际不存在，但说不存在就一定不存在。对于防止缓存穿透来说，这就够用了。

## 原理拆解

布隆过滤器的核心思想非常简单：**用多个哈希函数 + 一个位数组，来判断一个元素是否存在**。

想象一个很长的黑板，上面画了很多小格子，每个格子只能是 ✓ 或留空。当你想把一个名字"登记"上去时，你不是直接写名字，而是用 3 支不同颜色的笔，分别算出这个名字对应 3 个格子位置，然后把这些格子都画上 ✓。

```
初始状态（位数组，全是 0）：

[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

插入 "apple"，3 个哈希函数算出位置：2, 7, 15

[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]

插入 "banana"，3 个哈希函数算出位置：4, 7, 11

[0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0]
```

### 查询过程

查询 "cherry"，3 个哈希算出位置：2, 9, 17。去数组一看，位置 9 是 0 → **一定不存在**！

查询 "grape"，3 个哈希算出位置：4, 11, 15。一看全是 1 → **可能存在**（但也可能是别的元素恰好把这些位都置 1 了，这就是误判的来源）。

### 为什么会有误判？

因为不同的元素经过哈希后可能映射到相同的位。当位数组中越来越多的位置被置 1，误判率就会上升。解决方法：

1. **增大位数组长度** —— 位越多，冲突越少
2. **增加哈希函数个数** —— 映射越多位置，冲突概率越低（但也不是越多越好，太多反而每个元素要置更多位）

### 误判率公式（了解即可）

```
误判率 p ≈ (1 - e^(-kn/m))^k

其中：
n = 已插入元素个数
m = 位数组长度
k = 哈希函数个数
```

一般实际使用中，我们会根据**预期元素数量**和**可接受误判率**来反算 m 和 k，所以不需要自己纠结怎么调参。

## 代码实现

### TypeScript

```typescript
/**
 * 布隆过滤器 —— TypeScript 实现
 * 核心思路：用多个哈希函数将元素映射到位数组的多个位置
 */
class BloomFilter {
  private bitArray: Uint8Array;  // 位数组，用 Uint8 模拟 bit
  private size: number;          // 位数组长度
  private hashCount: number;     // 哈希函数个数

  constructor(expectedItems: number, falsePositiveRate: number = 0.01) {
    // 根据预期元素数和误判率，算出最优位数组长度
    // 公式：m = -(n * ln(p)) / (ln(2))^2
    this.size = Math.ceil(
      -(expectedItems * Math.log(falsePositiveRate)) / (Math.LN2 ** 2)
    );
    // 根据位数组长度和元素数，算出最优哈希函数个数
    // 公式：k = (m / n) * ln(2)
    this.hashCount = Math.ceil((this.size / expectedItems) * Math.LN2);
    this.bitArray = new Uint8Array(this.size);
  }

  /**
   * 简单的双重哈希策略 —— 用两个基础哈希生成 k 个哈希值
   * 为什么这么做：不需要真的写 k 个哈希函数，用 h1 + i*h2 即可
   */
  private getHashes(item: string): number[] {
    const hashes: number[] = [];
    let h1 = 0, h2 = 0;
    // 手动计算两个基础哈希值（类似 MurmurHash 的简化版）
    for (let i = 0; i < item.length; i++) {
      h1 = (h1 * 31 + item.charCodeAt(i)) >>> 0;
      h2 = (h2 * 37 + item.charCodeAt(i)) >>> 0;
    }
    // 用线性组合生成 k 个不同的哈希值
    for (let i = 0; i < this.hashCount; i++) {
      hashes.push((h1 + i * h2) % this.size);
    }
    return hashes;
  }

  /** 插入元素：把对应的位全部置 1 */
  add(item: string): void {
    for (const pos of this.getHashes(item)) {
      this.bitArray[pos] = 1;
    }
  }

  /**
   * 查询元素：
   * 只要有一个位是 0，说明一定没插入过
   * 全是 1，则"可能"存在（有误判风险）
   */
  mightContain(item: string): boolean {
    return this.getHashes(item).every(pos => this.bitArray[pos] === 1);
  }
}

// 使用示例
const filter = new BloomFilter(10000, 0.01);
filter.add("user:10086");
console.log(filter.mightContain("user:10086")); // true —— 可能存在
console.log(filter.mightContain("user:99999")); // false —— 一定不存在
```

### Go

```go
package bloomfilter

import (
	"hash/fnv"
	"math"
)

// BloomFilter 布隆过滤器结构体
type BloomFilter struct {
	bitArray  []uint64 // 用 uint64 切片模拟位数组，每个 uint64 含 64 位
	size      uint     // 位数组总长度（bit 数）
	hashCount uint     // 哈希函数个数
}

// New 根据预期元素数和误判率创建布隆过滤器
func New(expectedItems uint, falsePositiveRate float64) *BloomFilter {
	// 计算最优位数组长度 m = -(n * ln(p)) / (ln2)^2
	size := uint(math.Ceil(-float64(expectedItems) * math.Log(falsePositiveRate) / (math.LN2 * math.LN2)))
	// 计算最优哈希函数个数 k = (m/n) * ln2
	hashCount := uint(math.Ceil(float64(size) / float64(expectedItems) * math.LN2))

	// 计算需要多少个 uint64 来装下所有 bit
	wordCount := (size + 63) / 64
	return &BloomFilter{
		bitArray:  make([]uint64, wordCount),
		size:      size,
		hashCount: hashCount,
	}
}

// getHashes 用双重哈希策略生成 k 个哈希位置
// 为什么用双重哈希：避免实现 k 个独立哈希函数，h1 + i*h2 就够了
func (bf *BloomFilter) getHashes(data []byte) []uint {
	hashes := make([]uint, bf.hashCount)

	// 用 FNV 产生两个基础哈希值
	h1 := fnv.New32a()
	h1.Write(data)
	hash1 := h1.Sum32()

	h2 := fnv.New32()
	h2.Write(data)
	hash2 := h2.Sum32()

	for i := uint(0); i < bf.hashCount; i++ {
		hashes[i] = uint((uint64(hash1) + uint64(i)*uint64(hash2)) % uint64(bf.size))
	}
	return hashes
}

// setBit 将指定位置置 1
func (bf *BloomFilter) setBit(pos uint) {
	wordIndex := pos / 64
	bitIndex := pos % 64
	bf.bitArray[wordIndex] |= 1 << bitIndex
}

// getBit 检查指定位是否为 1
func (bf *BloomFilter) getBit(pos uint) bool {
	wordIndex := pos / 64
	bitIndex := pos % 64
	return bf.bitArray[wordIndex]&(1<<bitIndex) != 0
}

// Add 插入元素
func (bf *BloomFilter) Add(item string) {
	data := []byte(item)
	for _, pos := range bf.getHashes(data) {
		bf.setBit(pos)
	}
}

// MightContain 查询元素是否可能存在
func (bf *BloomFilter) MightContain(item string) bool {
	data := []byte(item)
	for _, pos := range bf.getHashes(data) {
		// 只要有一个位是 0，说明这个元素一定没插入过
		if !bf.getBit(pos) {
			return false
		}
	}
	return true // 所有的位都是 1，"可能"存在
}
```

### Java

```java
import java.util.BitSet;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * 布隆过滤器 —— Java 实现
 * 用 BitSet 作为位数组，MessageDigest 提供哈希能力
 */
public class BloomFilter {
    private final BitSet bitSet;       // Java 自带的位数组，省心
    private final int size;            // 位数组长度
    private final int hashCount;       // 哈希函数个数

    public BloomFilter(int expectedItems, double falsePositiveRate) {
        // 根据公式算最优参数
        this.size = (int) Math.ceil(
            -(expectedItems * Math.log(falsePositiveRate)) / (Math.log(2) * Math.log(2))
        );
        this.hashCount = (int) Math.ceil(
            (double) size / expectedItems * Math.log(2)
        );
        this.bitSet = new BitSet(size);
    }

    /**
     * 用 MD5 做双重哈希，生成 k 个位置
     * 为什么用 MD5：简单易得，这里不需要密码学安全性，只追求均匀分布
     */
    private int[] getHashes(String item) {
        int[] hashes = new int[hashCount];
        try {
            // 第一次哈希
            MessageDigest md5 = MessageDigest.getInstance("MD5");
            byte[] bytes = item.getBytes(StandardCharsets.UTF_8);
            byte[] digest1 = md5.digest(bytes);
            int h1 = Math.abs(bytesToInt(digest1));

            // 第二次哈希（加盐区分）
            md5.reset();
            md5.update((byte) 0xDE);
            md5.update(bytes);
            byte[] digest2 = md5.digest(bytes);
            int h2 = Math.abs(bytesToInt(digest2));

            // 双重哈希线性组合：h(i) = h1 + i * h2
            for (int i = 0; i < hashCount; i++) {
                hashes[i] = Math.abs((h1 + i * h2) % size);
            }
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 not available", e);
        }
        return hashes;
    }

    /** 把摘要前 4 字节转成 int */
    private int bytesToInt(byte[] b) {
        return ((b[0] & 0xFF) << 24) | ((b[1] & 0xFF) << 16)
             | ((b[2] & 0xFF) << 8)  | (b[3] & 0xFF);
    }

    /** 插入元素 */
    public void add(String item) {
        for (int pos : getHashes(item)) {
            bitSet.set(pos);  // 对应位置 1
        }
    }

    /** 查询元素是否可能存在 */
    public boolean mightContain(String item) {
        for (int pos : getHashes(item)) {
            if (!bitSet.get(pos)) {
                return false; // 有位是 0 → 一定不存在
            }
        }
        return true; // 全是 1 → 可能存在
    }
}

// 使用示例
// BloomFilter bf = new BloomFilter(100000, 0.01);
// bf.add("order:12345");
// bf.mightContain("order:12345"); // true
// bf.mightContain("order:99999"); // false（大概率）
```

### Python

```python
import math
import hashlib


class BloomFilter:
    """布隆过滤器 —— Python 实现
    
    核心思路：一个元素经过 k 个哈希函数，映射到位数组的 k 个位置。
    查询时只要有一个位是 0，就说明这个元素一定没被插入过。
    """

    def __init__(self, expected_items: int, false_positive_rate: float = 0.01):
        # 根据预期元素数和误判率，计算最优参数
        # 位数组长度 m = -(n * ln(p)) / (ln2)^2
        self.size = self._optimal_size(expected_items, false_positive_rate)
        # 哈希函数个数 k = (m / n) * ln2
        self.hash_count = self._optimal_hash_count(self.size, expected_items)
        # 用 bytearray 模拟位数组（每个元素是 1 字节，但我们只存 0 或 1）
        self.bit_array = bytearray(self.size)

    @staticmethod
    def _optimal_size(n: int, p: float) -> int:
        """计算最优位数组长度，越长误判率越低"""
        return math.ceil(-(n * math.log(p)) / (math.log(2) ** 2))

    @staticmethod
    def _optimal_hash_count(m: int, n: int) -> int:
        """计算最优哈希函数个数，不是越多越好"""
        return math.ceil((m / n) * math.log(2))

    def _get_hashes(self, item: str) -> list[int]:
        """双重哈希：用两个基础哈希生成 k 个不同的哈希值
        
        为什么这么做：不用真的写 k 个哈希函数，
        h(i) = h1 + i * h2 的效果在实践中足够好
        """
        data = item.encode("utf-8")
        # 用 MD5 和 SHA1 分别产生两个基础哈希值
        h1 = int(hashlib.md5(data).hexdigest(), 16)
        h2 = int(hashlib.sha1(data).hexdigest(), 16)
        return [(h1 + i * h2) % self.size for i in range(self.hash_count)]

    def add(self, item: str) -> None:
        """插入元素：把 k 个哈希位置全部置 1"""
        for pos in self._get_hashes(item):
            self.bit_array[pos] = 1

    def might_contain(self, item: str) -> bool:
        """查询元素：只要有一个位是 0 就返回 False（一定不存在）"""
        return all(self.bit_array[pos] == 1 for pos in self._get_hashes(item))


# 使用示例
if __name__ == "__main__":
    bf = BloomFilter(expected_items=10000, false_positive_rate=0.01)
    
    # 模拟已有的商品 ID
    for i in range(1000):
        bf.add(f"product:{i}")
    
    # 查询
    print(bf.might_contain("product:100"))    # True —— 可能存在
    print(bf.might_contain("product:99999"))  # False —— 一定不存在
```

## 业务场景

### 1. 防止缓存穿透

这是布隆过滤器最经典的应用。把所有合法的商品/用户 ID 放进布隆过滤器，请求来了先过一遍布隆过滤器：

- 布隆过滤器说**不存在** → 直接返回，不查缓存也不查数据库
- 布隆过滤器说**可能存在** → 再去查缓存 → 缓存没有再查数据库

这样黑客用大量不存在的 ID 发起攻击时，99% 的请求在布隆过滤器这层就被拦住了。

### 2. 爬虫 URL 去重

搜索引擎爬虫需要记录哪些 URL 已经爬过。互联网上的 URL 数量以百亿计，用 Set 存内存吃不消。布隆过滤器用极小的空间就能完成去重判断，即使偶尔误判（把没爬过的 URL 误判为已爬过），最多就是少爬几个页面，不影响业务。

### 3. 邮箱垃圾地址过滤

邮件服务商维护一个布隆过滤器存储已知的垃圾邮箱地址。新邮件到来时检查发件人是否在黑名单中，快速过滤掉垃圾邮件。偶尔的误判也只是把一封正常邮件错标为垃圾邮件，概率极低。

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 插入 | O(k) | O(m) |
| 查询 | O(k) | — |

- **时间复杂度 O(k)**：k 是哈希函数个数，通常 3-10 个。无论你存了多少元素，插入和查询都只算 k 次哈希 + k 次位操作，跟元素总量无关。
- **空间复杂度 O(m)**：m 是位数组长度。10 亿个元素、1% 误判率，只需要约 **1.2GB**；如果误判率放宽到 5%，只要 **400MB** 左右。对比 Set 方案的 20GB，省了两个数量级。

## 小结

布隆过滤器本质上是一种**用准确率换空间**的数据结构。它不存储元素本身，只记录"痕迹"，所以：

- ✅ 空间极省，适合海量数据场景
- ✅ 插入和查询都是 O(k)，极快
- ❌ 有误判率，说"存在"不一定真存在
- ❌ 标准布隆过滤器不支持删除（删一个位可能影响其他元素）

如果你需要支持删除，可以用**计数型布隆过滤器**（每个位改成计数器），或者直接用 Guava 库里的 `BloomFilter`，Redis 4.0+ 也内置了 `BF.ADD` / `BF.EXISTS` 命令，开箱即用 🎉
