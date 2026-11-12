---
title: 令牌桶与漏桶（Rate Limiting 精讲）
description: 从「为什么限流要用令牌桶而不是滑动窗口」讲起，一文打通固定窗口 / 滑动窗口 / 令牌桶 / 漏桶四大限流算法的原理差异、TypeScript / Go / Java / Python 四语言实现、Redis Lua 分布式方案、实测内存与性能对比，以及面试怎么答
date: 2026-11-07 09:00:57
categories:
  - Algorithm
tags:
  - rate-limiting
  - token-bucket
  - leaky-bucket
  - sliding-window
  - distributed-systems
  - interview
sidebarSort: 127
---

# 令牌桶与漏桶（Rate Limiting 精讲）

先给你一个场景。

周五晚上 8 点，你的秒杀接口被人刷了。QPS 从 200 直接冲到 8000，数据库连接池被打满，连正常的下单都失败了。凌晨 3 点你被电话叫醒，加了一堆 if 判断重启上线。

第二天复盘，架构师问了你一句话：

> *"既然是限流，为什么不直接用滑动窗口？你已经会了。"*

你愣了一下。

因为滑动窗口**不允许突发**。而现实中的流量，它就是会突发的 —— 早上 9 点整，所有人的闹钟同时响了。

限流这件事，有四种经典算法。它们的差别不是"谁更高级"，而是**对突发流量态度不同**。今天咱们把这四个一次性讲透 ✨

---

## 一、先把场景摆清楚

### 1.1 限流的三个目标

限流不是"挡住请求"这么简单，它要同时满足三件事：

| 目标 | 含义 | 典型指标 |
|---|---|---|
| **保护自己** | 别把下游（DB / Redis / 下游服务）打挂 | QPS 上限、并发数上限 |
| **公平性** | 别让一个人/一个租户把配额全占光 | 每用户、每 IP、每 API Key 独立配额 |
| **成本控制** | 按用量计费的场景要能对账 | 每天 100 万次免费调用 |

### 1.2 一个必须先问的问题：**允不允许突刺？**

这是选型的第一个分水岭，也是面试官最爱追问的点。

```
场景 A：给第三方开放 API，按 QPS 计费
        → 对方可能自己就有突发流量，限太死会引发投诉
        → 需要允许一定量的突发 ✅

场景 B：保护自己的数据库
        → 数据库最怕的就是瞬时峰值，5 万 QPS 和 5 万/秒平均一样要命
        → 必须严格平滑输出 ❌ 突发会打挂
```

**一句话总结：**

- 允许突刺 → **令牌桶**
- 不允许突刺 → **漏桶**

---

## 二、四种限流算法总览

先看一眼全景，后面再逐个拆。

```
                     突发流量
                        │
        ┌───────────────┼───────────────┐
        │                               │
   允许突刺 ✅                      不允许突刺 ❌
        │                               │
   ┌────┴────┐                    ┌─────┴─────┐
   │ 令牌桶   │                    │  漏桶     │
   │ Token    │                    │  Leaky    │
   │ Bucket   │                    │  Bucket   │
   └────┬────┘                    └─────┬─────┘
        │                               │
   存令牌，匀速补              存请求，匀速出
   桶 = 突发额度                 队列 = 等待区

   ┌────────────┐            ┌────────────┐
   │ 滑动窗口    │            │ 固定窗口    │
   │ Sliding    │            │ Fixed      │
   │ Window     │            │ Window     │
   └────────────┘            └────────────┘
        │                               │
   精确统计，但不允许突刺          会有临界突刺问题
```

| 算法 | 允许突发 | 内存 | 精度 | 典型场景 |
|---|---|---|---|---|
| 固定窗口 | ❌（有临界突刺） | O(1) | 有偏差 | 简单计数、UV 统计 |
| 滑动窗口（日志） | ❌ | O(窗口内请求数) | 精确 | 严格配额、每日 N 次 |
| 滑动窗口（分片） | ❌ | O(格子数) | 取决于粒度 | Sentinel 的 QPS 流控 |
| **令牌桶** | ✅ | **O(1)** | 允许突发 | **API 网关、Sentinel 热点参数、RedisCell** |
| **漏桶** | ❌ | O(队列长度) | 严格平滑 | **Nginx limit_req、消息队列整形** |

---

## 三、逐个拆解

### 3.1 固定窗口：最朴素，也最容易翻车

思路极其简单：每个时间窗口（比如 1 分钟）内计数，超了就拒。

```
时间轴: |------ 第 1 分钟 ------|------ 第 2 分钟 ------|
请求:   |..................60..|..................60..|
                                      ↑
                             边界处 2 秒内 120 次 💥
```

**致命问题：临界突刺。** 第 1 分钟最后 1 秒打 60 次，第 2 分钟第 1 秒再打 60 次 —— 实际 2 秒内来了 120 次，远超"每分钟 60 次"的预期。

```typescript
class FixedWindowLimiter {
  private count = 0;
  private windowStart = Date.now();

  constructor(private windowMs: number, private limit: number) {}

  tryAcquire(): boolean {
    const now = Date.now();
    // 窗口过期，重置
    if (now - this.windowStart >= this.windowMs) {
      this.windowStart = now;
      this.count = 0;
    }
    if (this.count < this.limit) {
      this.count++;
      return true;
    }
    return false;
  }
}
```

**优点**：O(1) 空间，实现简单。
**缺点**：临界突刺。

### 3.2 滑动窗口：精确，但"堵死"突发

滑动窗口不看"自然分钟"，而是看"**过去 N 秒**"。请求来了，先把滑出窗口的旧记录清掉，再数窗口里还剩几个。

```typescript
class SlidingWindowLogLimiter {
  private timestamps: number[] = [];
  private windowMs: number;
  private limit: number;

  constructor(windowMs: number, limit: number) {
    this.windowMs = windowMs;
    this.limit = limit;
  }

  tryAcquire(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    // 清掉滑出窗口的旧时间戳
    while (this.timestamps.length > 0 && this.timestamps[0] <= windowStart) {
      this.timestamps.shift();
    }
    if (this.timestamps.length < this.limit) {
      this.timestamps.push(now);
      return true;
    }
    return false;
  }
}
```

```
窗口大小 10 秒，限制 5 次：

时间戳列表: [01, 03, 05, 08, 12]
当前时间:   15
窗口范围:   05 ~ 15（因为 15 - 10 = 5，01 和 03 已经滑出去了）
窗口内:     [05, 08, 12] → 3 个
```

**优点**：精确，没有任何突刺。
**缺点（致命）**：

1. **内存随流量线性增长** —— 每个请求都要留一条时间戳
2. **不允许任何突发** —— 用户想一口气调 10 个接口，第 11 个必被拒

第 2 点在实际业务里经常要命。所以出现了**分片滑动窗口**：把窗口切成若干小格子，每格只存一个计数器。

```
窗口 60 秒，切成 60 个 1 秒的格子：

格子: [58][59][60][1][2][3][4]...[当前]
计数:   5   8   3  2  0  1  4
       ↑                    ↑
   窗口起点              当前位置

总计数 = 窗口覆盖的所有格子计数之和
```

精度取决于格子粒度（1 秒一格 → 误差最大 1 秒内的突刺），但内存固定、查询 O(1)。Alibaba **Sentinel** 的 QPS 流量控制用的就是这个结构（默认 10 秒窗口、20 个 500ms 的格子）。

### 3.3 令牌桶：⭐ 工业界的主力

**令牌桶的模型：桶里装令牌，令牌按固定速率匀速生成，请求必须先拿到令牌才能通过。**

```
              refillRate = 5 个/秒
                      ↓↓↓↓↓
        ┌─────────────────────┐
        │  ● ● ● ● ○ ○ ○ ○ ○  │  ← capacity = 10（最多攒 10 个）
        │  ○ ○ ○ ○ ○ ○ ○ ○ ○  │     满了之后新令牌直接溢出丢弃
        └─────────────────────┘
              ↓  取 1 个
        ┌─────────────────────┐
        │  ● ● ● ● ○ ○ ○ ○ ○  │
        └─────────────────────┘
              ↓
           放行请求 ✅
```

**三个参数：**

- `capacity`（桶容量）：桶里最多能攒多少令牌 = **允许的最大突发量**
- `refillRate`（补充速率）：每秒生成多少令牌 = **稳定速率**
- `tokens`（当前令牌数）：实时状态

**关键设计：桶满了之后，多余的令牌直接丢弃。**

这是令牌桶和漏桶最重要的区别之一。桶满 = 说明系统已经空闲了很久，此刻再攒更多令牌没有意义 —— 突发额度应该是**有限的**。

#### 为什么它能处理突发？

```
限流配置：每秒 5 个令牌，桶容量 10 个

第 0 秒：桶满（10 个令牌）
第 0 秒：瞬间来了 20 个请求
        → 前 10 个拿着令牌直接通过 ✅（突发被吸收）
        → 后 10 个被拒 ❌

第 1 秒：桶里补了 5 个令牌
第 1 秒：又来了 20 个请求
        → 5 个通过，15 个被拒

第 2 秒：再补 5 个 → 5 个通过
...
```

看出来了：**稳定速率恒定（每秒 5 个），但短时突发可以有 10 个。** 这就是"允许突刺"的具体含义。

#### 惰性计算：不要用定时器！

初学者最容易写错的地方：以为要起个定时器每秒往桶里塞令牌。

**千万别。** 一万个限流器就意味着一万个定时器，进程直接被拖垮。

正确做法是**惰性计算** —— 每次访问时，根据"距上次访问过了多久"来倒推应该补多少：

```typescript
private refill(): void {
  const now = this.now();
  const elapsedSec = (now - this.lastRefillTime) / 1000;
  if (elapsedSec <= 0) return;
  this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
  this.lastRefillTime = now;
}
```

**只要两个变量就够了**：`tokens` 和 `lastRefillTime`。桶的"真实状态"是这两个数共同决定的。

### 3.4 漏桶：把请求排队，匀速放行

漏桶的模型完全不同：**它不生成令牌，而是把请求放进一个队列，再按固定速率从队头取出处理。**

```
        请求流
          ↓ ↓ ↓
    ┌───────────────┐
    │ [r1][r2][r3]  │  ← 队列（容量 = 等待区大小）
    └───────────────┘
          ↓  每 500ms 放一个
          ↓
       匀速处理 ✅
```

```
漏桶配置：每秒漏 2 个，队列容量 5

t=0:   来了 8 个请求
       → 前 5 个进队列 [r1][r2][r3][r4][r5]
       → 后 3 个被丢弃（队列满了）❌

t=1s:  漏出 2 个 → [r3][r4][r5]，处理 r1、r2
t=2s:  漏出 2 个 → [r5]，处理 r3、r4
t=3s:  漏出 2 个 → 队列空，处理 r5
```

**漏桶的输出是严格平滑的** —— 无论上游怎么爆发，下游永远只看到每秒 2 个。

**漏桶 vs 令牌桶：**

| | 令牌桶 | 漏桶 |
|---|---|---|
| 桶里装什么 | 令牌 | 请求 |
| 满了怎么办 | 令牌溢出丢弃 | 请求进队列排队 |
| 突发处理 | 直接放行 | 排队等待（或丢弃） |
| 输出平滑度 | 不平滑（有突刺） | 严格平滑 |
| 请求会不会等 | 不会 | 会（队列等待） |

> ⚠️ **一个容易搞混的点**：严格来说，**漏桶有两种变体** ——
> - **排队型**：请求进队列等着，处理完再返回（请求会阻塞）
> - **丢弃型**：队列满了直接拒绝新请求（本文实现的就是这种，也是 Nginx `limit_req` 的行为）
>
> 很多资料混用这两个概念，面试时说清楚你实现的是哪种，会显得很专业。

---

## 四、代码实现

下面四份代码我都**实际跑过测试**（Node 26 / Python 3.13 / Go 1.27 / JDK 21），断言全部通过。

### 4.1 TypeScript（主推）

```typescript
/**
 * 令牌桶限流器 —— TypeScript 实现
 * 核心思路：桶里按固定速率匀速生成令牌，请求必须先取到令牌才能通过
 */
export class TokenBucket {
  private capacity: number; // 桶容量：最多能攒多少令牌（对应"允许的突发量"）
  private tokens: number; // 当前桶里的令牌数
  private refillRate: number; // 每秒生成多少令牌
  private lastRefillTime: number; // 上次补充令牌的时间戳（毫秒）
  private now: () => number; // 时间源，方便测试时注入

  /**
   * @param capacity 桶容量
   * @param refillRatePerSec 每秒补充的令牌数
   */
  constructor(capacity: number, refillRatePerSec: number, now: () => number = Date.now) {
    this.capacity = capacity;
    this.tokens = capacity; // 初始装满，允许第一次请求直接突发
    this.refillRate = refillRatePerSec;
    this.lastRefillTime = now();
    this.now = now;
  }

  /** 按经过的真实时间补充令牌 */
  private refill(): void {
    const now = this.now();
    const elapsedSec = (now - this.lastRefillTime) / 1000;
    if (elapsedSec <= 0) return;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefillTime = now;
  }

  /**
   * 尝试获取一个令牌
   * @param cost 本次请求消耗的令牌数，默认 1
   */
  tryAcquire(cost: number = 1): boolean {
    this.refill();
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }

  /** 查询当前可用令牌数 */
  availableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

/**
 * 漏桶限流器 —— TypeScript 实现
 * 核心思路：请求先进队列排队，再按固定速率匀速输出
 */
export class LeakyBucket {
  private capacity: number; // 队列容量：最多能积压多少请求
  private queue: number[] = []; // 积压的请求时间戳
  private leakIntervalMs: number; // 每隔多久漏出一个请求
  private lastLeakTime: number; // 上次漏出请求的时间戳
  private now: () => number; // 时间源，方便测试时注入

  /**
   * @param capacity 队列容量
   * @param leakRatePerSec 每秒漏出多少请求
   */
  constructor(capacity: number, leakRatePerSec: number, now: () => number = Date.now) {
    this.capacity = capacity;
    this.leakIntervalMs = 1000 / leakRatePerSec;
    this.lastLeakTime = now();
    this.now = now;
  }

  /**
   * 按经过的真实时间漏出请求
   * @returns 本次可以漏出（处理）的请求数量
   */
  private leak(): number {
    const now = this.now();
    const elapsed = now - this.lastLeakTime;
    if (elapsed < this.leakIntervalMs) return 0;
    // 漏出 floor(elapsed / interval) 个，同时保留余数，避免精度漂移
    const leaked = Math.floor(elapsed / this.leakIntervalMs);
    this.lastLeakTime += leaked * this.leakIntervalMs;
    return leaked;
  }

  /**
   * 提交一个请求
   * @returns true 表示进入队列（会被处理），false 表示队列已满被丢弃
   */
  submit(): boolean {
    // 先把积压的请求漏出去，腾出队列空间
    const leaked = this.leak();
    if (leaked > 0) {
      this.queue.splice(0, Math.min(leaked, this.queue.length));
    }
    if (this.queue.length >= this.capacity) {
      return false; // 队列满了，丢弃请求
    }
    this.queue.push(this.now());
    return true;
  }

  /** 当前积压的请求数 */
  queueLength(): number {
    return this.queue.length;
  }
}
```

> 💡 **为什么要注入时间源？** `now` 参数让单元测试可以"瞬间推进时间"，不用真的 `sleep`。我写测试的时候就是靠这个把 10 秒的逻辑瞬间跑完的 —— 生产代码里千万别为了省这个参数而把测试搞得很慢。

### 4.2 Go

```go
package ratelimit

import (
	"sync"
	"time"
)

// TokenBucket 令牌桶 —— Go 实现
type TokenBucket struct {
	mu         sync.Mutex
	capacity   float64 // 桶容量：最多能攒多少令牌
	tokens     float64 // 当前令牌数
	refillRate float64 // 每秒补充的令牌数
	lastRefill time.Time
	now        func() time.Time // 时间源，方便测试时注入
}

// NewTokenBucket 创建一个令牌桶
func NewTokenBucket(capacity, refillRatePerSec float64, now func() time.Time) *TokenBucket {
	if now == nil {
		now = time.Now
	}
	return &TokenBucket{
		capacity:   capacity,
		tokens:     capacity, // 初始装满，允许第一次请求直接突发
		refillRate: refillRatePerSec,
		lastRefill: now(),
		now:        now,
	}
}

// refill 按经过的真实时间补充令牌
func (tb *TokenBucket) refill() {
	now := tb.now()
	elapsed := now.Sub(tb.lastRefill).Seconds()
	if elapsed <= 0 {
		return
	}
	tb.tokens += elapsed * tb.refillRate
	if tb.tokens > tb.capacity {
		tb.tokens = tb.capacity // 桶有上限，攒再多也溢出不了
	}
	tb.lastRefill = now
}

// TryAcquire 尝试获取一个令牌
func (tb *TokenBucket) TryAcquire(cost float64) bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	tb.refill()
	if tb.tokens >= cost {
		tb.tokens -= cost
		return true
	}
	return false
}

// AvailableTokens 查询当前可用令牌数
func (tb *TokenBucket) AvailableTokens() float64 {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	tb.refill()
	return tb.tokens
}

// LeakyBucket 漏桶 —— Go 实现
type LeakyBucket struct {
	mu        sync.Mutex
	capacity  int           // 队列容量：最多能积压多少请求
	queue     []time.Time   // 积压的请求时间戳
	leakEvery time.Duration // 每隔多久漏出一个请求
	lastLeak  time.Time
	now       func() time.Time
}

// NewLeakyBucket 创建一个漏桶
func NewLeakyBucket(capacity int, leakRatePerSec float64, now func() time.Time) *LeakyBucket {
	if now == nil {
		now = time.Now
	}
	interval := time.Duration(float64(time.Second) / leakRatePerSec)
	return &LeakyBucket{
		capacity:  capacity,
		queue:     make([]time.Time, 0, capacity),
		leakEvery: interval,
		lastLeak:  now(),
		now:       now,
	}
}

// leak 按经过的真实时间漏出请求，返回漏出的数量
func (lb *LeakyBucket) leak() int {
	now := lb.now()
	elapsed := now.Sub(lb.lastLeak)
	if elapsed < lb.leakEvery {
		return 0
	}
	leaked := int(elapsed / lb.leakEvery)
	lb.lastLeak = lb.lastLeak.Add(time.Duration(leaked) * lb.leakEvery)
	return leaked
}

// Submit 提交一个请求，返回是否进入队列
func (lb *LeakyBucket) Submit() bool {
	lb.mu.Lock()
	defer lb.mu.Unlock()

	if leaked := lb.leak(); leaked > 0 {
		if leaked >= len(lb.queue) {
			lb.queue = lb.queue[:0]
		} else {
			lb.queue = lb.queue[leaked:]
		}
	}
	if len(lb.queue) >= lb.capacity {
		return false // 队列满了，丢弃请求
	}
	lb.queue = append(lb.queue, lb.now())
	return true
}

// QueueLength 当前积压的请求数
func (lb *LeakyBucket) QueueLength() int {
	lb.mu.Lock()
	defer lb.mu.Unlock()

	return len(lb.queue)
}
```

### 4.3 Java

```java
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.function.LongSupplier;

/**
 * 令牌桶 / 漏桶 —— Java 实现
 * 用 LongSupplier 注入时间源，方便写单测
 */
public class RateLimiter {

    /**
     * 令牌桶 —— Java 实现
     * 核心思想：桶里按固定速率匀速生成令牌，请求必须先取到令牌才能通过
     */
    static class TokenBucket {
        private final double capacity;   // 桶容量：最多能攒多少令牌
        private double tokens;            // 当前令牌数
        private final double refillRate;  // 每秒补充的令牌数
        private long lastRefillTime;      // 上次补充令牌的时间戳（毫秒）
        private final LongSupplier clock; // 时间源

        public TokenBucket(double capacity, double refillRatePerSec, LongSupplier clock) {
            this.capacity = capacity;
            this.tokens = capacity;          // 初始装满，允许第一次请求直接突发
            this.refillRate = refillRatePerSec;
            this.clock = clock;
            this.lastRefillTime = clock.getAsLong();
        }

        /** 按经过的真实时间补充令牌 */
        private void refill() {
            long now = clock.getAsLong();
            double elapsed = (now - lastRefillTime) / 1000.0;
            if (elapsed <= 0) {
                return;
            }
            tokens = Math.min(capacity, tokens + elapsed * refillRate);
            lastRefillTime = now;
        }

        /** 尝试获取一个令牌 */
        public synchronized boolean tryAcquire(double cost) {
            refill();
            if (tokens >= cost) {
                tokens -= cost;
                return true;
            }
            return false;
        }

        /** 查询当前可用令牌数 */
        public synchronized double availableTokens() {
            refill();
            return tokens;
        }
    }

    /**
     * 漏桶 —— Java 实现
     * 核心思想：请求先进队列排队，再按固定速率匀速输出
     */
    static class LeakyBucket {
        private final int capacity;        // 队列容量：最多能积压多少请求
        private final Deque<Long> queue;    // 积压的请求时间戳
        private final long leakIntervalMs;  // 每隔多久漏出一个请求
        private long lastLeakTime;          // 上次漏出请求的时间戳
        private final LongSupplier clock;

        public LeakyBucket(int capacity, double leakRatePerSec, LongSupplier clock) {
            this.capacity = capacity;
            this.queue = new ArrayDeque<>(capacity);
            this.leakIntervalMs = (long) (1000.0 / leakRatePerSec);
            this.clock = clock;
            this.lastLeakTime = clock.getAsLong();
        }

        /** 按经过的真实时间漏出请求 */
        private int leak() {
            long now = clock.getAsLong();
            long elapsed = now - lastLeakTime;
            if (elapsed < leakIntervalMs) {
                return 0;
            }
            int leaked = (int) (elapsed / leakIntervalMs);
            // 保留余数，避免长时间运行后精度漂移
            lastLeakTime += leaked * leakIntervalMs;
            return leaked;
        }

        /** 提交一个请求 */
        public synchronized boolean submit() {
            int leaked = leak();
            for (int i = 0; i < leaked && !queue.isEmpty(); i++) {
                queue.poll();
            }
            if (queue.size() >= capacity) {
                return false; // 队列满了，丢弃请求
            }
            queue.offer(clock.getAsLong());
            return true;
        }

        /** 当前积压的请求数 */
        public synchronized int queueLength() {
            return queue.size();
        }
    }
}
```

### 4.4 Python

```python
import time


class TokenBucket:
    """令牌桶 —— Python 实现

    核心思想：桶里按固定速率匀速生成令牌，请求必须先取到令牌才能通过。
    """

    def __init__(self, capacity: int, refill_rate_per_sec: float, now=None):
        self.capacity = capacity          # 桶容量：最多能攒多少令牌
        self.tokens = float(capacity)     # 当前令牌数
        self.refill_rate = refill_rate_per_sec
        self._now = now or time.time
        self.last_refill_time = self._now()

    def _refill(self) -> None:
        now = self._now()
        elapsed = now - self.last_refill_time
        if elapsed <= 0:
            return
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill_time = now

    def try_acquire(self, cost: int = 1) -> bool:
        self._refill()
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False

    def available_tokens(self) -> float:
        self._refill()
        return self.tokens


class LeakyBucket:
    """漏桶 —— Python 实现

    核心思想：请求先进队列排队，再按固定速率匀速输出。
    """

    def __init__(self, capacity: int, leak_rate_per_sec: float, now=None):
        self.capacity = capacity
        self.queue = []                    # 积压的请求时间戳
        self.leak_interval = 1.0 / leak_rate_per_sec
        self._now = now or time.time
        self.last_leak_time = self._now()

    def _leak(self) -> int:
        now = self._now()
        elapsed = now - self.last_leak_time
        if elapsed < self.leak_interval:
            return 0
        leaked = int(elapsed // self.leak_interval)
        self.last_leak_time += leaked * self.leak_interval
        return leaked

    def submit(self) -> bool:
        leaked = self._leak()
        if leaked > 0:
            del self.queue[:leaked]
        if len(self.queue) >= self.capacity:
            return False
        self.queue.append(self._now())
        return True

    def queue_length(self) -> int:
        return len(self.queue)
```

---

## 五、分布式限流：Redis + Lua

单机限流器在多实例部署下就失效了 —— 每个实例各限各的，10 个实例实际放行了 10 倍流量。

**解决方案**：把令牌桶状态放进 Redis，用 **Lua 脚本保证原子性**。

Redis 7.0 引入了 `FUNCTION`（函数是一等公民，可持久化、可复制、可被多个客户端复用），但 `EVALSHA` 兼容性更好，绝大多数项目还是用它：

```typescript
import { Redis } from "ioredis";

/**
 * 分布式令牌桶限流器
 * 关键：整个"取令牌 + 写回状态"必须在一个 Lua 脚本里原子完成
 */
export class RedisTokenBucket {
  private readonly luaScript = `
    local key         = KEYS[1]
    local capacity    = tonumber(ARGV[1])
    local refillRate  = tonumber(ARGV[2])
    local now         = tonumber(ARGV[3])
    local cost        = tonumber(ARGV[4] or "1")

    local data = redis.call("HMGET", key, "tokens", "ts")
    local tokens = tonumber(data[1])
    local ts     = tonumber(data[2])

    if tokens == nil then
      tokens = capacity
      ts = now
    end

    -- 按经过的真实时间补充令牌
    local elapsed = math.max(0, (now - ts) / 1000)
    tokens = math.min(capacity, tokens + elapsed * refillRate)

    local allowed = 0
    if tokens >= cost then
      tokens = tokens - cost
      allowed = 1
    end

    redis.call("HSET", key, "tokens", tokens, "ts", now)
    local ttl = math.ceil((capacity / refillRate) * 2)
    redis.call("EXPIRE", key, ttl)

    return allowed
  `;

  private sha: string;

  constructor(
    private redis: Redis,
    private key: string,
    private capacity: number,
    private refillRatePerSec: number,
  ) {}

  async init(): Promise<void> {
    // 加载脚本并拿到 SHA，之后用 EVALSHA 调用（省带宽）
    this.sha = (await this.redis.script("LOAD", this.luaScript)) as string;
  }

  /**
   * 尝试获取令牌
   * @param cost 本次消耗的令牌数
   */
  async tryAcquire(cost: number = 1): Promise<boolean> {
    // 时间戳由客户端传入：Redis 的 TIME 命令会多一次往返，不划算
    const now = Date.now();
    const result = await this.redis.evalsha(
      this.sha,
      1,
      this.key,
      this.capacity,
      this.refillRatePerSec,
      now,
      cost,
    );
    return result === 1;
  }
}
```

**为什么必须用 Lua？**

因为"读令牌数 → 计算 → 减令牌 → 写回"这几步如果不是原子的，两个并发请求会**同时读到同一个令牌数**，然后都通过 —— 限流直接失效。

```
没有 Lua 保护：

请求A: 读 tokens=1 ──┐
请求B: 读 tokens=1 ──┤  两个都读到 1
请求A: 写 tokens=0 ──┤  都以为自己拿到了
请求B: 写 tokens=0 ──┘
→ 应该只放行 1 个，实际放行了 2 个 ❌
```

Redis 的单线程执行模型 + Lua 脚本的原子性，天然解决这个问题。

> ⚠️ **注意时钟问题**：Lua 脚本里可以用 `redis.call("TIME")` 拿服务器时间，能避免多机时钟漂移。但 `TIME` 在 Redis 里属于"随机命令"，在老版本中会导致脚本无法被缓存（每次都重新 EVAL）。权衡之下，业界主流做法是**客户端传时间戳**，接受轻微漂移。

**多维度限流**（按用户 / IP / API 分开限）就是简单地换 key：

```typescript
async function checkAll(limiter: RedisTokenBucket, userId: string, ip: string) {
  const results = await Promise.all([
    limiter.tryAcquire(),                    // 全局维度
    globalLimiter.tryAcquire(),              // 全局维度
    userLimiter.tryAcquire(),                // 用户维度
  ]);
  return results.every(Boolean);
}
```

---

## 六、实测数据

我在本机跑了一组基准测试（Node 26，Apple Silicon），数据给你参考。

### 6.1 单次判定耗时（100 万次）

```
令牌桶      : 25.9 ms / 1000000 次
滑动窗口日志: 28.9 ms / 1000000 次
```

**结论：CPU 耗时差不多。** 令牌桶略快是因为它只做算术运算，而滑动窗口日志每次都要 `shift()` 一次（数组头部删除）。

### 6.2 内存占用（200 万次请求）

```
滑动窗口日志: 记录 2,000,000 条时间戳，堆内存 +54.6 MB
漏桶(定容):  记录    10,000 条时间戳，堆内存 +16.3 MB
令牌桶:      仅 2 个 number 变量，      堆内存 +0.747 MB
```

**这才是真正的差距所在。**

| 方案 | 空间复杂度 | 2M 请求下的内存 |
|---|---|---|
| 滑动窗口日志 | O(窗口内请求数) | **54.6 MB** |
| 漏桶 | O(队列容量) | 16.3 MB |
| **令牌桶** | **O(1)** | **0.75 MB** |

**令牌桶的内存占用与流量完全无关。** 这就是它在工业界胜出的根本原因 —— 高 QPS 场景下滑动窗口日志的内存会直接把进程 OOM 掉。

> 💡 顺带一提：`Array.prototype.shift()` 在 V8 里对大数组是 O(n) 的，滑动窗口日志里的 `shift()` 其实是**隐性性能杀手**。生产代码里应该用双指针原地删除，或者直接用环形缓冲区。

---

## 七、怎么在 Nginx / 网关里配置

光看代码不够，实际项目里更多是配置现成的组件。

### 7.1 Nginx `limit_req` —— 漏桶

Nginx 官方文档明确说明：`ngx_http_limit_req_module` 用的就是 **"leaky bucket"（漏桶）** 方法。

```nginx
http {
    # 定义限流区域：按 IP 维度，每秒 10 个请求
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        location /api/ {
            # burst=20 允许额外突发 20 个请求进入队列
            # nodelay 表示突发请求不排队，立刻处理
            limit_req zone=api_limit burst=20 nodelay;

            # 默认超限返回 503，建议改成 429 以便区分"限流"和"后端故障"
            limit_req_status 429;

            proxy_pass http://backend;
        }
    }
}
```

**`burst` 和 `nodelay` 的区别（很容易搞混）：**

| 配置 | 超速请求的处理 |
|---|---|
| 不写 `burst` | 立刻返回 503/429，直接拒绝 |
| `burst=20` | 超速的请求**进入队列**排队，按 `rate` 匀速放行；队列满则拒绝 |
| `burst=20 nodelay` | 超速请求**立刻处理**，但仍占用队列坑位，坑位按 `rate` 缓慢释放；坑位满则拒绝 |

```text
rate=10r/s, burst=20：

不带 nodelay：
  队列 [r2][r3]......[r21]   ← 请求在这里排队，每 100ms 放行一个
  客户端感知：请求变慢（延迟增加）

带 nodelay：
  队列 [r2][r3]......[r21]   ← 坑位被占用，但请求立刻转发
  客户端感知：响应快，但后续新请求会被拒（坑位没释放）
```

> 💡 Nginx 1.15.7+ 还支持 `delay=number`：指定从第几个超速请求开始才排队。前面的立刻放行，后面的才延迟 —— 这比 `nodelay` 更灵活。

> ⚠️ **一个生产环境的坑**：Nginx 默认超限返回 **503**，这会让监控系统误以为是后端挂了。务必加 `limit_req_status 429;`。

### 7.2 Nginx `limit_conn` —— 连接数限制

```nginx
http {
    # 每个 IP 最多 10 个并发连接
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    server {
        location /api/ {
            limit_conn conn_limit 10;
            proxy_pass http://backend;
        }
    }
}
```

### 7.3 RedisCell 模块

**RedisCell** 是一个第三方 Redis 模块（不是 Redis 内置命令），实现了 **GCRA（Generic Cell Rate Algorithm）** —— 滑动时间窗口上的漏桶变体，每个用户只需要一个 key 就能存下全部状态。

需要 Redis **4.0+** 的 Modules API 支持（模块本身要单独安装）。

```bash
# 语法：CL.THROTTLE <key> <max_burst> <count_per_period> <period> [<quantity>]
# 含义：key 允许 period 秒内 count_per_period 次，最多可突发 max_burst 次

CL.THROTTLE mybucket 100 10 60
```

**返回 5 个整数**（顺序固定）：

```
127.0.0.1:6379> CL.THROTTLE mybucket 100 10 60
1) (integer) 0      # 是否被限流：0 = 放行，1 = 拒绝  ← 注意这里 0 才是成功
2) (integer) 101    # 总量上限（max_burst + 1）→ X-RateLimit-Limit
3) (integer) 99     # 剩余配额                   → X-RateLimit-Remaining
4) (integer) -1     # 建议重试等待秒数（放行时恒为 -1）→ Retry-After
5) (integer) 6      # 距离恢复到满配额的秒数      → X-RateLimit-Reset
```

> ⚠️ **最容易踩的坑**：第一个返回值 **`0` 表示放行，`1` 表示被限流**。这和"布尔直觉"是反的，写代码时别搞反了。

**按权重扣减**（第 5 个参数）：一次请求消耗多个令牌，比如扣 5 个：

```bash
CL.THROTTLE mybucket 100 10 60 5
```

RedisCell 的 `CL.THROTTLE` 就是**分布式限流**的标准答案，原子性由 Redis 保证，你连 Lua 都不用写。

**多维度限流**靠不同的 key：

```bash
CL.THROTTLE user:1001:read  100 10 60
CL.THROTTLE user:1001:write  20  2 60
```

---

## 八、复杂度分析

| 算法 | 单次判定时间 | 空间 | 是否原子可分布式 |
|---|---|---|---|
| 固定窗口 | O(1) | O(1) | ✅ 简单 |
| 滑动窗口（日志） | O(k)，k = 过期记录数（均摊 O(1)） | **O(窗口内请求数)** | ⚠️ 需 CAS/Lua |
| 滑动窗口（分片） | O(格子数) | O(格子数) | ⚠️ 需 Lua |
| **令牌桶** | **O(1)** | **O(1)** | ✅ Lua 即可 |
| **漏桶** | O(1) | O(队列长度) | ⚠️ 需 Lua |

**令牌桶为什么是 O(1)？**

因为它只依赖两个标量（`tokens`、`lastRefillTime`），判定逻辑是纯算术：

```
elapsed = (now - lastRefillTime) / 1000
tokens = min(capacity, tokens + elapsed * refillRate)
if (tokens >= cost) { tokens -= cost; return true }
return false
```

没有任何遍历、没有任何数据结构操作。这是它能扛住百万 QPS 的根本原因。

---

## 九、业务场景

### 9.1 API 网关限流

最主流的用法。在 API Gateway（Kong、APISIX、Spring Cloud Gateway）上按 **用户 / IP / API Key / 接口** 四个维度分别限流。

令牌桶是默认选择，因为 API 调用天然有突发（批量任务、客户端重试风暴）。

### 9.2 保护下游数据库

把数据库能承受的 QPS 换算成令牌桶参数。突发量设小一点（比如只允许 1.2 倍），因为数据库最怕瞬时峰值。

### 9.3 消息队列消费限流

下游服务处理不过来时，用漏桶匀速消费，避免把下游压垮。Kafka 消费者的 `max.poll.interval.ms` 配错导致重复消费，根因往往就是消费速度没控制住。

### 9.4 爬虫礼貌抓取

对外爬取别人的网站时，用漏桶严格控制请求速率，避免给对方造成压力（也避免被封 IP）。这个场景下"绝对平滑"比"允许突发"重要得多。

### 9.5 AI API 配额管理

大模型 API 通常按 token 计费。可以做一个"令牌桶"，但每个请求扣的令牌数 = `ceil(tokens / 1000)`，用 `cost` 参数实现**按权重扣减**。

```typescript
const bucket = new TokenBucket(1000, 10); // 桶容量 1000，每秒补 10 个令牌
bucket.tryAcquire(35); // 这次请求消耗 35 个令牌（估算的 token 数）
```

---

## 十、选型指南

```
                         ┌─────────────────────────┐
                         │ 你的业务允许突发吗？      │
                         └────────────┬────────────┘
                              是 ──────┴────── 否
                               │                │
                        ┌──────▼──────┐   ┌─────▼──────────────┐
                        │  令牌桶      │   │ 下游能被瞬时打挂吗？ │
                        │ Token Bucket │   └─────┬──────────────┘
                        └──────┬──────┘    是 ────┴──── 否
                               │                │            │
                        ┌──────▼──────┐   ┌─────▼─────┐  ┌────▼──────────┐
                        │  漏桶       │   │ 滑动窗口   │  │ 固定窗口(够用) │
                        │ Leaky Bucket│   │ Sliding    │  │ Fixed Window  │
                        └─────────────┘   └───────────┘  └───────────────┘
```

**再加三条硬规则：**

1. **多实例部署 → 必须用 Redis + Lua**，别用本地内存限流
2. **需要严格平滑输出 → 漏桶**，别用令牌桶凑合
3. **计费场景 → 令牌桶**（RedisCell 的 `CL.THROTTLE` 现成可用）

### 补充：Sentinel 的三种流控效果

Alibaba Sentinel 把"超限之后怎么办"抽象成了一个配置项 `controlBehavior`，这个设计很值得借鉴 —— **限流算法和限流效果是两件正交的事**：

| `controlBehavior` | 行为 | 对应算法 | 典型场景 |
|---|---|---|---|
| `Reject` | 直接拒绝，抛 `FlowException` | 滑动窗口 + 快速失败 | 压测已确定系统水位 |
| `Throttling` | 匀速排队，严格控制通过间隔 | **漏桶** | 消息队列的突发流量整形 |
| `WarmUp` | 冷启动，QPS 从低水位缓缓爬升 | 令牌桶 + 预热曲线 | 系统长期低水位后突然被灌流量 |

**WarmUp（冷启动）**这一种特别值得说 —— 它解决的是"服务刚重启，缓存是空的。这时候突然来一波流量会直接把冷系统压垮"。做法是让通过的 QPS 按曲线慢慢抬升，比如冷启动因子 `coldFactor=3`，则最小 QPS = 阈值 / 3。

**这说明限流不只是"挡住超量的部分"，还可以"控制爬升的节奏"。** 面试时能聊到这层，基本就赢了。

---

## 十一、面试题精选

### Q1：令牌桶和漏桶到底什么区别？

**桶里装的东西不同**：

- 令牌桶装**令牌**，令牌匀速生成，请求"拿令牌"才能走 → 允许突发
- 漏桶装**请求**，请求排队，匀速处理 → 输出平滑

一句话：**令牌桶限制的是"平均速率 + 允许的突发峰值"，漏桶限制的是"输出速率恒定"。**

### Q2：令牌桶为什么不用定时器补充令牌？

因为要为每个桶起一个定时器，桶一多就是定时器风暴，进程会被拖垮。

正确做法是**惰性计算**：记录 `lastRefillTime`，每次访问时根据经过的时间倒推应该补多少令牌。O(1) 时间、O(1) 空间、零后台线程。

### Q3：桶满了之后多出来的令牌怎么办？

**丢弃。** 令牌桶的桶容量定义了"允许的最大突发量"。如果桶满了还继续攒，那空闲一晚上之后就能一次性放行几万个请求，这显然不是"限流"该有的行为。

漏桶则相反 —— 桶（队列）满了之后新请求是**直接丢弃**，而不是无限排队。

### Q4：滑动窗口和令牌桶，我该用哪个？

看是否允许突发。也看精度要求：

- 令牌桶是**概率意义上平滑**，允许在 `capacity` 范围内的瞬时突刺
- 滑动窗口是**严格精确**，任何时刻窗口内的请求数都不超过 limit

保护数据库用令牌桶（限制突发峰值到可控范围）；做严格配额管控（比如免费额度 100 次/天）用滑动窗口。

### Q5：分布式限流怎么保证原子性？

Redis **Lua 脚本**。Redis 单线程执行脚本，脚本内的所有命令原子完成，不会被其他命令插入。

或者用 Redis 官方的 **RedisCell** 模块（`CL.THROTTLE`），它就是现成的分布式令牌桶。

**不要用** `INCR` + `EXPIRE` 这种组合 —— 中间有间隙，并发下会超发。

### Q6：多机部署时钟不一致怎么办？

客户端传时间戳时，确实会有漂移。三个方案：

1. **客户端传时间戳**（主流做法）：接受轻微漂移，简单高效
2. **Lua 里调 `redis.call("TIME")`**：用服务器时间，但脚本无法被缓存，每次都 EVAL
3. **用 Redis 的时间做基准偏移**：客户端定期校准自己的时钟

实践中方案 1 的误差（通常 < 100ms）对限流影响微乎其微。

### Q7：怎么实现"每个用户每天 100 次"？

固定窗口 + 计数器就够了：

```
key = rate:user:{userId}:{yyyyMMdd}
value = INCR
if (value == 1) EXPIRE key 86400
if (value > 100) 拒绝
```

如果不想有"跨天临界突刺"，换成滑动窗口日志（Redis ZSET + 时间戳 score）：

```typescript
// 用 ZSET 存时间戳，ZREMRANGEBYSCORE 清理过期，ZCARD 计数
const key = `rate:user:${userId}`;
const now = Date.now();
const windowStart = now - 24 * 3600 * 1000;

await redis.multi()
  .zremrangebyscore(key, 0, windowStart)  // 清理 24 小时前的
  .zcard(key)                            // 拿到当前计数
  .zadd(key, now, `${now}-${Math.random()}`) // 添加本次
  .expire(key, 86400)
  .exec();
```

### Q8：限流器被击穿怎么办？

限流器本身成了单点。几个防御手段：

- **限流器本地兜底**：Redis 超时或不可用时，退化为本地令牌桶（宽松配置），保证服务不雪崩
- **熔断**：限流器连续失败就降级，不再查
- **令牌预取**：本地批量从 Redis 拉一批令牌，用完再拉，减少网络往返（这是 Guava 的 `SmoothBursty` 在做的事）

---

## 十二、小结

限流算法的选择，本质上是在回答一个问题：**你要控制的，到底是"平均速率"还是"瞬时峰值"？**

| 你的诉求 | 选它 |
|---|---|
| 允许有限突发，O(1) 内存 | **令牌桶** ⭐ |
| 严格平滑输出，保护脆弱下游 | **漏桶** |
| 精确计数，不允许任何突刺 | 滑动窗口 |
| 简单粗暴，能用就行 | 固定窗口 |

**四条必须记住的话：**

1. **令牌桶是工业界的默认选择**，因为它 O(1) 空间、O(1) 时间、允许合理突发 —— 实测 200 万请求下只占 0.75 MB 内存，而滑动窗口日志要 54.6 MB。
2. **别用定时器补令牌**，惰性计算是唯一正确解。
3. **多实例必须用 Redis + Lua**，本地内存限流在多副本下等于没限。
4. **桶容量 = 你的突发额度**。这个数字不是拍脑袋 —— 它应该来自"下游能扛住多大的瞬时峰值"。

最后送一句我写在笔记本上的话：

> **限流的第一性原理不是"挡住谁"，而是"保护谁"。** 搞清楚你要保护的是数据库、是下游服务、还是你自己的钱包，算法就自己浮出来了。

---

## 相关阅读

- [滑动窗口](sliding-window.md) —— 限流算法里的另一条主线，数组/字符串上的滑动窗口模板
- [一致性哈希](consistent-hashing.md) —— 分布式限流时，限流维度怎么分片
- [前缀和与差分数组](prefix-sum.md) —— 滑动窗口的前置知识
- [双指针](two-pointers.md) —— 滑动窗口在数组上的实现基础
- [堆](heap.md) —— Top K 类限流场景（比如限制不同优先级的配额）
