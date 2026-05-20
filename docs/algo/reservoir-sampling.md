---
title: 水塘抽样
description: 水塘抽样（Reservoir Sampling）
date: 2026-05-17 23:45:00
categories:
  - Algorithm
tags:
  - reservoir-sampling
sidebarSort: 13
---

# 水塘抽样（Reservoir Sampling）

你有没有遇到过这样的面试题："给你一个长度未知的数据流，如何等概率地随机抽取一个元素？"

听起来不难——如果数据量不大，全部读进数组，然后用 `rand()` 随机取一个就行了。但如果数据量是 **10 亿条日志**呢？你不可能全部加载到内存里。甚至数据还在源源不断地涌来（比如 Kafka 消息流），你根本不知道总共有多少条。

水塘抽样就是为这种场景而生的。它只需要 **O(1) 的额外空间**，在数据流过的时候就能完成等概率采样，不管数据总量是 1 万还是 10 亿，效果完全一样 ✨。

## 原理拆解

### 核心直觉

想象你在河边钓鱼。河里的鱼一条接一条游过来，你要从中等概率地选一条带走。但你没法回头——鱼游过去就没了，而且你也不知道后面还有多少条。

怎么办？一个巧妙的策略：

- **第 1 条鱼**来了 → 放进桶里（桶里现在有 1 条鱼）
- **第 2 条鱼**来了 → 以 1/2 的概率用新鱼替换桶里的鱼
- **第 3 条鱼**来了 → 以 1/3 的概率替换
- ...
- **第 i 条鱼**来了 → 以 1/i 的概率替换

这样下来，每条鱼最终留在桶里的概率都是 1/n。为什么？往下看 👇

### 数学证明（不用怕，很简单）

假设一共来了 n 条鱼，我们看第 i 条鱼最终被选中的概率：

```
P(第 i 条被选中) = P(第 i 条放入时被选中) × P(之后没被替换)

= 1/i × (1 - 1/(i+1)) × (1 - 1/(i+2)) × ... × (1 - 1/n)

= 1/i × i/(i+1) × (i+1)/(i+2) × ... × (n-1)/n

= 1/n
```

看到了吗？所有的中间项都约掉了，最终结果就是 **1/n**，跟 i 无关。也就是说，每条鱼被选中的概率完全相等，完美！

### 图解过程

```
数据流：[A, B, C, D, E]

第1步：A 来了 → 桶 = [A]，选中概率 = 1/1 = 100%
第2步：B 来了 → 以 1/2 概率替换 → 桶 = [B]，A 被替换的概率 1/2
第3步：C 来了 → 以 1/3 概率替换 → 桶 = [C]
第4步：D 来了 → 以 1/4 概率替换 → 桶 = [D]
第5步：E 来了 → 以 1/5 概率替换 → 桶 = [E]

最终：A 被选中的概率 = 1 × 1/2 × 2/3 × 3/4 × 4/5 = 1/5 ✅
      B 被选中的概率 = 1/2 × 2/3 × 3/4 × 4/5 = 1/5 ✅
      ...
      每个元素都是 1/5，等概率！
```

### 推广：抽 k 个样本

实际业务中往往需要抽多个样本，比如随机选 10 条日志做分析。这就是 **Algorithm R**（水塘抽样的经典版本）：

1. 把前 k 个元素放进"水塘"（一个大小为 k 的数组）
2. 从第 k+1 个元素开始，对于第 i 个元素：
   - 生成随机数 j ∈ [0, i)
   - 如果 j < k，则用水塘中第 j 个位置替换为当前元素
3. 最终水塘里的 k 个元素就是等概率抽样的结果

每个元素被选入水塘的概率都是 **k/n**。

## 代码实现

### TypeScript

```typescript
/**
 * 水塘抽样 —— TypeScript 实现
 * 适用场景：数据流式到达，总量未知，需要等概率随机抽样
 */
class ReservoirSampling<T> {
  private reservoir: T[]; // 水塘：存放最终抽样的结果
  private readonly k: number; // 要抽取的样本数
  private count: number; // 当前已处理的元素计数

  constructor(k: number) {
    this.k = k;
    this.reservoir = [];
    this.count = 0;
  }

  /**
   * 逐个喂入数据流中的元素
   * 为什么用 count 而不是 reservoir.length 判断：
   * 因为水塘填满后长度不变，但 count 始终反映真实进度
   */
  feed(item: T): void {
    this.count++;

    if (this.count <= this.k) {
      // 前 k 个元素直接放进水塘，填满为止
      this.reservoir.push(item);
    } else {
      // 从第 k+1 个元素开始，以 k/count 的概率决定是否替换
      const j = Math.floor(Math.random() * this.count);
      if (j < this.k) {
        // 命中了！用当前元素替换水塘中第 j 个位置
        this.reservoir[j] = item;
      }
      // 没命中就丢弃当前元素，水塘不变
    }
  }

  /** 获取抽样结果 */
  getSamples(): T[] {
    return this.reservoir;
  }

  /** 重置状态，可以复用同一个实例 */
  reset(): void {
    this.reservoir = [];
    this.count = 0;
  }
}

// 使用示例
const sampler = new ReservoirSampling<string>(3);
const dataStream = [
  "log:err:500",
  "log:info:200",
  "log:warn:301",
  "log:err:404",
  "log:info:200",
];
dataStream.forEach((item) => sampler.feed(item));
console.log(sampler.getSamples()); // 等概率抽出的 3 条日志
```

### Go

```go
package reservoir

import "math/rand"

// ReservoirSampling 水塘抽样 —— Go 实现
type ReservoirSampling[T any] struct {
	reservoir []T   // 水塘：存放抽样结果
	k         int   // 目标样本数
	count     int   // 已处理元素计数
}

// New 创建一个容量为 k 的水塘抽样器
func New[T any](k int) *ReservoirSampling[T] {
	return &ReservoirSampling[T]{
		reservoir: make([]T, 0, k),
		k:         k,
		count:     0,
	}
}

// Feed 逐个喂入元素
// 核心逻辑：第 i 个元素以 k/i 的概率被选中
func (rs *ReservoirSampling[T]) Feed(item T) {
	rs.count++

	if rs.count <= rs.k {
		// 前 k 个元素直接入池，无条件接纳
		rs.reservoir = append(rs.reservoir, item)
	} else {
		// 随机生成 [0, count) 的整数，如果落在 [0, k) 就替换
		j := rand.Intn(rs.count)
		if j < rs.k {
			// 为什么直接替换第 j 个：保证水塘中每个位置被替换的概率均等
			rs.reservoir[j] = item
		}
	}
}

// GetSamples 返回抽样结果
func (rs *ReservoirSampling[T]) GetSamples() []T {
	return rs.reservoir
}
```

### Java

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * 水塘抽样 —— Java 实现
 *
 * 用途：对流式数据做等概率随机抽样，无需知道总量
 * 原理：每个元素以 k/i 的概率进入水塘，保证最终每个元素被选中的概率相等
 */
public class ReservoirSampling<T> {
    private final List<T> reservoir; // 水塘
    private final int k;             // 目标样本数
    private int count;               // 已处理的元素数
    private final Random random;     // 随机数生成器

    public ReservoirSampling(int k) {
        this.k = k;
        this.reservoir = new ArrayList<>(k);
        this.count = 0;
        this.random = new Random();
    }

    /**
     * 向水塘中喂入一个元素
     *
     * 关键点：当 count > k 时，元素以 k/count 的概率被保留
     * 这保证了无论数据流多长，每个元素最终被抽中的概率都是 k/n
     */
    public void feed(T item) {
        count++;

        if (count <= k) {
            // 前 k 个元素直接加入水塘
            reservoir.add(item);
        } else {
            // 生成 [0, count) 的随机下标
            int j = random.nextInt(count);
            if (j < k) {
                // 命中水塘范围，替换对应位置的元素
                // 为什么是替换第 j 个而不是追加：保持水塘大小恒定为 k
                reservoir.set(j, item);
            }
        }
    }

    /** 获取抽样结果 */
    public List<T> getSamples() {
        return new ArrayList<>(reservoir);
    }

    /** 重置状态，方便复用 */
    public void reset() {
        reservoir.clear();
        count = 0;
    }
}

// 使用示例
// ReservoirSampling<String> sampler = new ReservoirSampling<>(5);
// for (String log : kafkaStream) {
//     sampler.feed(log);
// }
// List<String> samples = sampler.getSamples(); // 等概率抽出的 5 条日志
```

### Python

```python
import random


class ReservoirSampling:
    """水塘抽样 —— Python 实现

    核心思想：在不知道数据总量的情况下，对数据流进行等概率随机抽样。
    每个元素被选入最终样本的概率完全相等 (k/n)。

    为什么叫"水塘"：想象一个容量为 k 的小池塘，
    新来的水滴（数据）以一定概率替换掉池塘里的水，
    最终池塘里留下的就是等概率抽样的结果。
    """

    def __init__(self, k: int):
        self.k = k              # 水塘容量（目标样本数）
        self.reservoir = []     # 水塘
        self.count = 0          # 已处理元素计数

    def feed(self, item) -> None:
        """逐个喂入数据流中的元素

        前 k 个元素无条件入池；
        之后每个元素以 k/count 的概率替换池中元素。
        """
        self.count += 1

        if self.count <= self.k:
            # 水塘还没满，直接放进去
            self.reservoir.append(item)
        else:
            # 水塘已满，随机决定是否替换
            # 随机选 [0, count) 的整数，落进 [0, k) 就替换
            j = random.randint(0, self.count - 1)
            if j < self.k:
                self.reservoir[j] = item

    def get_samples(self) -> list:
        """返回抽样结果"""
        return self.reservoir.copy()

    def reset(self) -> None:
        """重置，可以复用同一个实例处理新的数据流"""
        self.reservoir.clear()
        self.count = 0


# 使用示例
if __name__ == "__main__":
    sampler = ReservoirSampling(k=3)

    # 模拟数据流：可能是日志、用户行为、交易记录等
    data_stream = [f"event:{i}" for i in range(100)]

    for item in data_stream:
        sampler.feed(item)

    print(sampler.get_samples())  # 等概率抽出的 3 个事件
```

## 业务场景

### 1. 大数据日志采样

线上服务每天产生几十亿条日志，全部存储成本太高。运维系统可以用水塘抽样从日志流中随机抽取 1000 条，用于实时监控面板展示。每条日志被选中的概率完全相等，不会因为到达时间的先后而产生偏差。

### 2. 推荐系统候选集随机打散

推荐引擎先召回 5000 个候选商品，但最终只能展示 30 个。在经过粗排、精排之后，可以用水塘抽样从剩余候选中随机选几个"冷门"商品插入结果，增加推荐多样性，避免信息茧房。

### 3. 数据库随机采样（Bonus Query）

PostgreSQL 的 `TABLESAMPLE` 机制在底层就运用了类似水塘抽样的思想。当你执行：

```sql
SELECT * FROM orders TABLESAMPLE BERNOULLI(1);
```

数据库不需要全表扫描，而是按 1% 的概率逐行决定是否选入结果集。对于百亿级大表，这种方式比先 `COUNT(*)` 再 `OFFSET` 随机取要高效得多。

## 复杂度分析

| 指标 | 复杂度 | 说明                                                    |
| ---- | ------ | ------------------------------------------------------- |
| 时间 | O(n)   | 每个元素只处理一次，常数级操作（一个随机数 + 一次比较） |
| 空间 | O(k)   | 只需要存 k 个样本，跟数据总量 n 无关                    |

- **时间 O(n)**：每个元素到达时只做一次随机数生成和一次条件判断，这是你能做到的最优了——至少得把数据过一遍吧。
- **空间 O(k)**：不管数据流是 1 万还是 100 亿，你只需要 k 个位置的数组。这就是水塘抽样最大的优势：**空间与数据量解耦**。

## 小结

水塘抽样是一个"看起来像魔法，证明确实成立"的算法：

- ✅ 只需 O(k) 额外空间，完美应对海量数据流
- ✅ 单遍扫描，不需要回头，天然适配流式处理
- ✅ 每个元素被选中的概率严格相等，数学可证
- ❌ 只能做随机抽样，不能做按条件筛选（筛选需要先知道数据长啥样）

它经常作为各大厂面试的算法题出现（LeetCode 382. 链表随机节点 就是一道经典的水塘抽样题），但更重要的是它在真实工程中的实用性——任何需要"从海量数据中公平地随机选几个"的场景，都可以直接上水塘抽样 🎯
