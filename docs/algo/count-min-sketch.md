---
title: Count-Min Sketch 频率估计
description: Count-Min Sketch 算法 —— 用极小空间估算海量数据流的元素出现频率（Heavy Hitters），广告与流量监控常用
date: 2026-10-11 09:01:19
categories:
  - Algorithm
tags:
  - count-min-sketch
  - frequency-estimation
  - probability
  - streaming
sidebarSort: 102
---

# Count-Min Sketch 频率估计

你有没有遇到过这种需求：老板扔过来一份 100 亿条 nginx 访问日志，问你"过去 1 小时访问量排名前 10 的 URL 是哪几个？"或者广告系统想实时统计"过去 5 分钟点击率最高的 100 个广告位"。

最直觉的方案：用 `HashMap<string, long>` 累计每个 URL 的访问次数，然后排序。但 100 亿条 URL，就算只有 1000 万个独立 URL，每个 key 就算 50 字节，加上冲突开销，HashMap 也要吃 **几 GB 内存**——一台普通服务器扛不住，更别说 Redis 集群了。

退一步，用 [HyperLogLog](/algo/hyperloglog.md)？可惜，HLL 只能告诉你"有多少个不同的 URL"，回答不了"哪个 URL 出现最多"。

这正是 **Count-Min Sketch（CMS）** 的战场 ✨。它跟布隆过滤器是"亲戚"——都用多个哈希 + 位数组，但 CMS 关心的是**频率**（元素出现了多少次），而布隆过滤器只关心**存在性**。CMS 在广告系统、网络监控、推荐引擎里几乎是标配，今天我们来拆解它的原理和实战 💪。

## 为什么需要 Count-Min Sketch？

先看一下几种方案在"统计 TOP 10 URL"任务上的对比：

| 方案 | 内存占用 | 精度 | 适用场景 |
| --- | --- | --- | --- |
| HashMap 全量计数 | O(n) 唯一元素 × 50B | 精确 | 数据量小、能接受大内存 |
| 排序后截取 | O(n) × 元素大小 | 精确 | 离线批处理 |
| Count-Min Sketch | 几 KB ~ 几 MB（可调） | 近似，**只可能高估** | 海量流式数据、内存敏感 |
| Top-K 数据结构 | O(K) + 少量元数据 | 精确 K 个 | 已知 K 大小 |

CMS 的核心承诺：**给你固定的内存预算（比如 1MB），就能在亿级数据流上给出误差可控的频率估计**。误差的方向是"单向的"——它只会把频率**估高**，绝不会低估。这个特性在很多业务里反而是优点（比如风控，宁可多查不要漏查）。

一句话总结：**Count-Min Sketch 是用极小空间、可控误差换取频率统计的数据流结构**。

## 原理拆解

CMS 的核心思想非常朴素：**多个哈希函数 + 多个计数器数组，对每个元素在每行都做一次计数，查询时取所有行里的最小值**。

### 核心结构

```
Count-Min Sketch 本质是一个 w 列、d 行的二维计数器数组：

            列索引:  0    1    2    3    4    ...   w-1
                       ┌────┬────┬────┬────┬────┬─────┐
       第 1 行（hash1） │  0 │  0 │  0 │  0 │  0 │ ... │
                       ├────┼────┼────┼────┼────┼─────┤
       第 2 行（hash2） │  0 │  0 │  0 │  0 │  0 │ ... │
                       ├────┼────┼────┼────┼────┼─────┤
                       │    │    │    │    │    │     │
       第 d 行（hashd） │  0 │  0 │  0 │  0 │  0 │ ... │
                       └────┴────┴────┴────┴────┴─────┘

- 列数 w：每一行的"桶"个数（越大冲突越少）
- 行数 d：哈希函数个数（越多估计越准，但写入成本也高）
- 总内存 = w × d × sizeof(counter)，可以非常小
```

### 插入过程

想象一个事件流：用户依次访问 `["home", "about", "home", "contact", "home", ...]`。

每个 URL 进来时：
1. 用 d 个不同的哈希函数分别算出列下标 `j1, j2, ..., jd`
2. 在每一行的对应列上**加 1**

```
初始状态（全 0）：
     0   1   2   3   4   5   6   7   8   9
R1: [0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
R2: [0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
R3: [0,  0,  0,  0,  0,  0,  0,  0,  0,  0]

插入 "home" → hash1=2, hash2=5, hash3=7
     0   1   2   3   4   5   6   7   8   9
R1: [0,  0,  1,  0,  0,  0,  0,  0,  0,  0]
R2: [0,  0,  0,  0,  0,  1,  0,  0,  0,  0]
R3: [0,  0,  0,  0,  0,  0,  0,  1,  0,  0]

插入 "about" → hash1=4, hash2=1, hash3=7
     0   1   2   3   4   5   6   7   8   9
R1: [0,  0,  1,  0,  1,  0,  0,  0,  0,  0]
R2: [0,  1,  0,  0,  0,  1,  0,  0,  0,  0]
R3: [0,  0,  0,  0,  0,  0,  0,  2,  0,  0]  ← 注意 hash3(about) 和 hash3(home) 都到 7，+1

插入 "home" → hash1=2, hash2=5, hash3=7
     0   1   2   3   4   5   6   7   8   9
R1: [0,  0,  2,  0,  1,  0,  0,  0,  0,  0]  ← R1.home 列 +1
R2: [0,  1,  0,  0,  0,  2,  0,  0,  0,  0]  ← R2.home 列 +1
R3: [0,  0,  0,  0,  0,  0,  0,  3,  0,  0]  ← R3.home 列 +1（撞了 about）
```

看到了吗？**列上的计数会被多个元素共享**，这是 CMS 误差的根源。

### 查询过程

查询 `"home"` 的频率：

1. 同样算出 `hash1=2, hash2=5, hash3=7`
2. 读出每一行对应列的计数：`R1[2]=2, R2[5]=2, R3[7]=3`
3. 取最小值：`min(2, 2, 3) = 2`

直觉：因为 hash 冲突会让计数"虚高"，取最小值能最大限度剔除冲突噪声。这就是为什么 CMS **永远只可能高估，不可能低估**。

```
查询 "home"   → min(R1[2], R2[5], R3[7]) = min(2, 2, 3) = 2  ✓
查询 "about"  → min(R1[4], R2[1], R3[7]) = min(1, 1, 3) = 1  ✓
查询 "contact"→ min(R1[6], R2[8], R3[2]) = min(0, 0, 0) = 0  ✓
```

### 为什么是"多行 + 取最小值"？

直觉解释：单个哈希 + 单行计数器，冲突太频繁，估计偏差大。多个独立哈希相当于"多角度观察"：
- 每行的估计都是"真实值 + 那一行的冲突噪声"
- 真实值是固定的，**每行的噪声是独立随机变量**
- 取最小值，相当于选择"最幸运（冲突最少）的那一行"的估计

数学上可以证明：当用 d 行、w 列时，**估计误差不超过 `N/w` 的概率至少为 `1 - (1/2)^d`**（N 是总流量，假设哈希均匀）。这也是为什么工业实现常取 `d=4~7`。

### 参数怎么选？

CMS 的参数选择有一个非常简洁的公式：

```
总内存 M、误差上限 ε、失败概率 δ：

w = ⌈e / ε⌉    （每行需要的列数，e ≈ 2.718）
d = ⌈ln(1/δ)⌉  （需要的行数）

反过来说，给定内存 M：
- 总计数器数 = M / sizeof(counter)
- 分配到 d 行后，每行 w = M / (d × sizeof(counter))
- 对应的 ε ≈ e × d × sizeof(counter) / M
```

实际工程里常用的经验值：

| 场景 | 内存预算 | d | w | 误差 ε | 失败率 δ |
| --- | --- | --- | --- | --- | --- |
| 广告点击实时监控 | 1 MB | 5 | ~55K | 0.00005 | 3% |
| nginx TOP URL 统计 | 4 MB | 4 | ~274K | 0.00001 | 2% |
| 嵌入式设备流量统计 | 64 KB | 3 | ~7.8K | 0.0003 | 5% |

注意 CMS 的 counter 一般用 `uint32` 或 `uint64`——如果数据量极大（超过 2^32），用 uint64 或考虑 Count-Min-Log（CMS 的对数版本，能区分"没出现过"和"出现次数很少"）。

## 代码实现

### TypeScript

```typescript
/**
 * Count-Min Sketch —— TypeScript 实现
 *
 * 适用场景：
 *   - 海量数据流上的元素频率统计（"过去 1 小时访问量 TOP 10"）
 *   - 内存受限，但可以接受近似结果
 *   - 需要"高估无害、低估致命"的场景（如风控、广告反作弊）
 *
 * 核心特性：
 *   - 内存固定：w × d × sizeof(counter)
 *   - 误差单向：永远只可能高估，绝不低估
 *   - 不可删除：经典 CMS 没有减法操作（如果要减，得用 Count-Min-Log 或带负值的变体）
 */
class CountMinSketch {
  private width: number;   // 每行的列数 w
  private depth: number;   // 行数 d（哈希函数个数）
  private table: Uint32Array[]; // 二维计数器数组
  private totalCount: number;   // 总流量（用于查询时算相对频率）
  private seeds: number[];      // 每行的哈希种子（生成不同的哈希函数）

  constructor(epsilon: number = 0.001, delta: number = 0.01) {
    // w = ⌈e / ε⌉，d = ⌈ln(1/δ)⌉
    this.width = Math.ceil(Math.E / epsilon);
    this.depth = Math.ceil(Math.log(1 / delta));

    // 初始化 d 行、每行 w 列的计数器数组
    this.table = [];
    for (let i = 0; i < this.depth; i++) {
      this.table.push(new Uint32Array(this.width));
    }

    // 给每行一个独立的种子，生成 d 个不同的哈希函数
    // 为什么要不同种子：行间哈希不相关，独立性是误差保证的前提
    this.seeds = [];
    for (let i = 0; i < this.depth; i++) {
      // 简单起见用 1, 2, 3...，实战可以用更大的随机质数
      this.seeds.push((i + 1) * 2654435761);
    }

    this.totalCount = 0;
  }

  /**
   * 哈希函数：基于 FNV-1a，加 seed 实现 d 个变体
   * 为什么用 FNV：简单、快、分布足够均匀
   */
  private hash(item: string, seed: number): number {
    let h = seed >>> 0;
    for (let i = 0; i < item.length; i++) {
      // FNV-1a: 先 XOR 再乘
      h ^= item.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /**
   * 插入一个元素（add 操作）
   * 对每一行 hash 出列下标，然后 +1
   */
  add(item: string, count: number = 1): void {
    for (let i = 0; i < this.depth; i++) {
      const col = this.hash(item, this.seeds[i]) % this.width;
      this.table[i][col] += count;
    }
    this.totalCount += count;
  }

  /**
   * 查询元素的估计频率
   * 取所有行对应列的最小值 —— 这是误差最小化的关键
   */
  estimate(item: string): number {
    let min = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const col = this.hash(item, this.seeds[i]) % this.width;
      const v = this.table[i][col];
      if (v < min) min = v;
    }
    // 没出现过就是 0（理论上下界是 0）
    return min === Infinity ? 0 : min;
  }

  /**
   * 获取结构占用的内存（字节数）
   * 调试和调参时很有用
   */
  memoryBytes(): number {
    return this.depth * this.width * 4; // Uint32Array 每个元素 4 字节
  }
}

// ===== 使用示例：统计 nginx 访问日志 TOP URL =====
const cms = new CountMinSketch(0.001, 0.01); // 误差 0.1%，失败率 1%
console.log(`预估内存：${(cms.memoryBytes() / 1024).toFixed(1)} KB`);

// 模拟一千万条访问日志
const urls = ["home", "about", "product", "blog", "contact", "home", "home", "product"];
for (let i = 0; i < 1000; i++) {
  cms.add(urls[Math.floor(Math.random() * urls.length)]);
}

// 查询各 URL 的估计频率
console.log(`home   估计访问次数: ${cms.estimate("home")}`);     // ≈ 真实值附近
console.log(`about  估计访问次数: ${cms.estimate("about")}`);
console.log(`blog   估计访问次数: ${cms.estimate("blog")}`);
console.log(`notfound 估计访问次数: ${cms.estimate("notfound")}`); // 应该是 0
```

### Go

```go
package cms

import (
	"hash/fnv"
	"math"
)

/**
 * Count-Min Sketch —— Go 实现
 *
 * 设计要点：
 *   - 用 []uint32 模拟计数器，溢出风险需要监控
 *   - 用 FNV-1a + 不同 seed 生成多个独立哈希
 *   - 核心操作 Add / Estimate 都是 O(d) 时间
 */

// CountMinSketch 主体结构
type CountMinSketch struct {
	width     uint      // 每行列数 w
	depth     uint      // 行数 d
	table     [][]uint32 // d 行 w 列计数器
	total     uint64    // 总流量
	seeds     []uint32  // 每行的哈希种子
}

// New 根据误差和失败概率创建 CMS
// epsilon: 单次估计的相对误差上限
// delta:   估计超过误差上限的概率
func New(epsilon float64, delta float64) *CountMinSketch {
	w := uint(math.Ceil(math.E / epsilon))
	d := uint(math.Ceil(math.Log(1 / delta)))

	table := make([][]uint32, d)
	for i := range table {
		table[i] = make([]uint32, w)
	}

	seeds := make([]uint32, d)
	for i := range seeds {
		// 每个 seed 间隔一个大质数，确保哈希之间相互独立
		seeds[i] = uint32((i + 1) * 2654435761)
	}

	return &CountMinSketch{
		width: w,
		depth: d,
		table: table,
		seeds: seeds,
	}
}

// hash 基于 FNV-1a 的简单哈希，加 seed 实现变体
func (c *CountMinSketch) hash(item string, seed uint32) uint32 {
	h := seed
	for i := 0; i < len(item); i++ {
		h ^= uint32(item[i])
		h *= 16777619
	}
	return h
}

// Add 插入一个元素，count 默认 1
func (c *CountMinSketch) Add(item string, count uint32) {
	for i := uint(0); i < c.depth; i++ {
		col := c.hash(item, c.seeds[i]) % uint32(c.width)
		c.table[i][col] += count
	}
	c.total += uint64(count)
}

// Estimate 查询元素的估计频率
// 关键：取所有行的最小值，最大程度消除哈希冲突带来的高估
func (c *CountMinSketch) Estimate(item string) uint32 {
	var min uint32 = math.MaxUint32
	for i := uint(0); i < c.depth; i++ {
		col := c.hash(item, c.seeds[i]) % uint32(c.width)
		if c.table[i][col] < min {
			min = c.table[i][col]
		}
	}
	return min
}

// MemoryBytes 返回结构占用的内存（字节）
// 调参时打印一下，心里有数
func (c *CountMinSketch) MemoryBytes() int {
	return int(c.depth * c.width * 4)
}

/**
 * 实战用法：广告点击监控
 *
 *   cms := cms.New(0.001, 0.01)
 *   for _, click := range clickStream {
 *       cms.Add(click.AdID, 1)
 *   }
 *   // 每分钟查一次热点广告
 *   hotAds := cms.Estimate("ad_12345")
 */
```

### Java

```java
import java.util.Random;

/**
 * Count-Min Sketch —— Java 实现
 *
 * 核心思想：多个哈希函数 + 多个计数器数组
 *          查询时取所有行的最小值，过滤掉哈希冲突带来的高估
 */
public class CountMinSketch {
    private final int width;       // 每行列数 w
    private final int depth;       // 行数 d
    private final long[][] table;  // d 行 w 列计数器（用 long 防止溢出）
    private final int[] seeds;     // 每行哈希种子
    private long total;            // 总流量

    public CountMinSketch(double epsilon, double delta) {
        this.width = (int) Math.ceil(Math.E / epsilon);
        this.depth = (int) Math.ceil(Math.log(1.0 / delta));

        this.table = new long[depth][width];
        this.seeds = new int[depth];
        Random rng = new Random(42);
        for (int i = 0; i < depth; i++) {
            this.seeds[i] = rng.nextInt();
        }
    }

    /**
     * FNV-1a 哈希，加 seed 生成多个变体
     */
    private int hash(String item, int seed) {
        long h = seed & 0xFFFFFFFFL;
        for (int i = 0; i < item.length(); i++) {
            h ^= item.charAt(i);
            h *= 16777619L;
        }
        return (int) (h % width);
    }

    /**
     * 插入元素
     * 复杂度：O(d)
     */
    public void add(String item) {
        for (int i = 0; i < depth; i++) {
            int col = hash(item, seeds[i]);
            table[i][col]++;
        }
        total++;
    }

    /**
     * 批量插入（某些场景下能减少哈希计算次数）
     */
    public void add(String item, long count) {
        for (int i = 0; i < depth; i++) {
            int col = hash(item, seeds[i]);
            table[i][col] += count;
        }
        total += count;
    }

    /**
     * 查询元素的估计频率
     * 取所有行最小值，是误差控制的核心
     */
    public long estimate(String item) {
        long min = Long.MAX_VALUE;
        for (int i = 0; i < depth; i++) {
            int col = hash(item, seeds[i]);
            if (table[i][col] < min) {
                min = table[i][col];
            }
        }
        return min == Long.MAX_VALUE ? 0 : min;
    }

    /**
     * 结构占用字节数
     */
    public long memoryBytes() {
        return (long) depth * width * 8; // long 占 8 字节
    }
}

/**
 * 实战用法：实时监控 TOP URL
 *
 *   CountMinSketch cms = new CountMinSketch(0.001, 0.01);
 *   for (String url : accessLog) {
 *       cms.add(url);
 *   }
 *   // 查询特定 URL 的访问次数（近似值）
 *   long count = cms.estimate("/api/users");
 */
```

### Python

```python
import math
import hashlib


class CountMinSketch:
    """
    Count-Min Sketch —— Python 实现

    适用场景：
      - 海量数据流上的元素频率估计
      - 内存有限，但可以接受近似结果
      - 风控、广告反作弊这类"宁可错杀不可放过"的场景

    核心特性：
      - 内存固定：w × d × 4 字节（counter 用 uint32 模拟）
      - 误差单向：只可能高估，不可能低估
    """

    def __init__(self, epsilon: float = 0.001, delta: float = 0.01):
        # w = ⌈e / ε⌉，d = ⌈ln(1/δ)⌉
        self.width = int(math.ceil(math.e / epsilon))
        self.depth = int(math.ceil(math.log(1 / delta)))

        # 用嵌套 list 模拟二维计数器数组
        self.table = [[0] * self.width for _ in range(self.depth)]

        # 给每行一个独立的种子，生成 d 个不同的哈希
        self.seeds = [(i + 1) * 2654435761 for i in range(self.depth)]
        self.total = 0

    def _hash(self, item: str, seed: int) -> int:
        """
        FNV-1a 哈希 + seed 变体
        为什么用 FNV：简单、Python 标准库没有，但手写起来也就几行
        """
        h = seed & 0xFFFFFFFF
        for ch in item:
            h ^= ord(ch)
            h = (h * 16777619) & 0xFFFFFFFF
        return h

    def add(self, item: str, count: int = 1) -> None:
        """
        插入一个元素（或多个）
        对每一行 hash 出列下标，counter +count
        """
        for i in range(self.depth):
            col = self._hash(item, self.seeds[i]) % self.width
            self.table[i][col] += count
        self.total += count

    def estimate(self, item: str) -> int:
        """
        查询元素的估计频率
        关键：取所有行的最小值，最大程度剔除哈希冲突带来的高估
        """
        min_val = min(
            self.table[i][self._hash(item, self.seeds[i]) % self.width]
            for i in range(self.depth)
        )
        return min_val

    def memory_bytes(self) -> int:
        """结构占用内存（字节数）"""
        return self.depth * self.width * 4  # int 按 4 字节估算（实际 CPython 是 28 字节/对象）


# ===== 使用示例：实时统计搜索热词 =====
if __name__ == "__main__":
    cms = CountMinSketch(epsilon=0.001, delta=0.01)
    print(f"预估内存：{cms.memory_bytes() / 1024:.1f} KB")

    # 模拟搜索日志流
    queries = ["python 教程", "go 语言", "rust 学习", "python 教程", "java 面试"]
    for _ in range(1000):
        cms.add(queries[hash(queries[__import__('random').randint(0, 4)]) % 5])

    # 查询各搜索词的估计次数
    for q in queries:
        print(f"{q:15s} 估计次数: {cms.estimate(q)}")
```

## 业务场景

### 1. 广告系统：实时点击率监控

广告投放引擎每秒处理上百万次点击事件，需要实时知道哪些广告位被点击最多，以便动态调整出价（CTR 高的广告加价，CTR 低的降价）。如果用 `HashMap<adID, count>`，1 亿次点击后内存轻松破 10GB。

**CMS 方案**：用 1MB 的 CMS，d=5 行、w≈55K 列，误差控制在 0.01% 以内。每分钟用 `cms.estimate(adID)` 查各个广告的点击量，排序出 TOP 100。Redis 内置的 CMS 模块甚至能直接 `CMS.INCRBY` / `CMS.QUERY`。

```bash
# Redis CMS 命令示例
CMS.INCRBY ad_clicks ad_12345 1
CMS.QUERY ad_clicks ad_12345
# → 1 (estimated)
```

### 2. 网络监控：异常流量检测

DDoS 检测需要实时识别"哪些 IP 在过去 1 分钟访问次数突然飙升"。用 CMS 维护一个滑动窗口（结合时间分片），每秒一次的流量打到不同的 CMS 实例，1 分钟后切换。

```typescript
// 滑动窗口 + CMS 识别异常流量
class TrafficMonitor {
  private windows: CountMinSketch[] = []; // 每个时间窗口一个 CMS

  recordRequest(ip: string) {
    const idx = Math.floor(Date.now() / 1000) % 60;
    this.windows[idx].add(ip);
  }

  isSuspicious(ip: string, threshold: number): boolean {
    // 累加过去 60 秒的访问次数
    let total = 0;
    for (const w of this.windows) {
      total += w.estimate(ip);
    }
    return total > threshold;
  }
}
```

### 3. 推荐系统：候选集频率采样

推荐引擎从百万级候选池召回 5000 个商品，需要按"近期热度"加权采样。把候选商品 ID 喂给 CMS，查询时用 `estimate(item)` 作为采样权重。这样高频候选获得更高曝光，但又不会完全压制长尾商品。

### 4. 数据库查询优化：Heavy Hitters 索引

数据库在做查询优化时，可以用 CMS 维护"哪些值在某一列出现频率最高"。查询时优先用 CMS 找出高频值生成统计信息，比全表扫描快几个数量级。PostgreSQL 的 `pg_stat_statements`、ClickHouse 的查询统计都用了类似思想。

## 复杂度分析

| 指标 | 复杂度 | 说明 |
| --- | --- | --- |
| 插入 | O(d) | d 行，每行一次哈希 + 一次自增 |
| 查询 | O(d) | d 行，每行一次哈希 + 取最小值 |
| 空间 | O(w × d) | 跟数据总量 N 完全无关 |
| 误差 | ε × N（高估） | 失败概率 ≤ δ |

- **插入 O(d)**：d 一般取 3~7，常数极小，亿级流量毫无压力。
- **查询 O(d)**：跟插入同阶，做到 O(1) 不可能（除非用 GPU 批处理）。
- **空间 O(w × d)**：**这是 CMS 最大的卖点**——不管数据量是 1 亿还是 1000 亿，内存占用都一样。
- **误差**：CMS 给出的频率 `f̂` 满足 `f ≤ f̂ ≤ f + εN` 的概率至少 `1 - δ`。其中 f 是真实频率，ε、δ 是构造时指定的参数。

## CMS 的局限与变体

经典 CMS 有几个常见痛点，工程上一般用变体解决：

### 1. 不能删除元素
经典 CMS 的计数器只加不减。如果数据流里有"撤销"事件（用户取消点赞、消息撤回），需要用 **Count-Min-Log**（用对数量化）或 **Conservative Update**（只在估计值能严格增大时才 +1）。

### 2. 冷启动偏差大
数据量小时（< w 列数），哈希冲突概率很高，估计偏差大。**Hydrogen CMS** 或 **Conservative CMS** 通过减少不必要的写入能缓解这个问题。

### 3. 长尾分布下表现差
如果数据极度偏斜（少数 URL 占 99% 流量），短时间内的估计噪声可能让低频元素看起来比实际更"热"。生产环境一般配合 **Lossy Counting** 或 **HeavyKeeper** 等专门处理长尾的结构。

### 4. 无法回答"出现过几次"
经典 CMS 无法区分"出现过 0 次"和"出现过但被噪声淹没"。**Count-Min-Log** 通过对数量化能让 0 值和低频值清晰区分，代价是实现稍复杂。

### 5. 冷数据淘汰
如果想实现"最近 1 小时"的滑动窗口，传统 CMS 无法直接做。可以结合**时间分桶**（每分钟一个 CMS 实例）或者使用**滑动窗口 CMS 变体**。

## 小结

Count-Min Sketch 是一个工程味很浓的算法——它的数学证明相对简单（不像 HyperLogLog 那么花哨），但**工程上的应用价值巨大**：

- ✅ **固定内存**：跟数据总量完全解耦，适合无限数据流
- ✅ **误差单向**：只高估不低估，正好契合很多风控/广告业务
- ✅ **实现简单**：核心就是"多哈希 + 多计数器 + 取最小值"
- ✅ **生态成熟**：Redis、ClickHouse、Apache Spark 都有现成实现
- ❌ **不能删除**：经典 CMS 不支持减法操作
- ❌ **冷启动偏差**：数据量小时估计不太准
- ❌ **无法回答零频**：分不清"没见过"和"见过但被淹没"

**面试常见考点**：
- LeetCode 上没有直接考 CMS 的题，但**设计题**里经常出现（"设计一个热搜系统"）
- 概率数据结构三剑客：**布隆过滤器（存在性）** + **HyperLogLog（去重数）** + **Count-Min Sketch（频率）**，掌握这个组合能应付绝大多数海量数据问题

下次再遇到"在亿级数据流上做 TOP K"的面试题，你就有了一个远比 `HashMap` 更优雅的答案 🎯。
