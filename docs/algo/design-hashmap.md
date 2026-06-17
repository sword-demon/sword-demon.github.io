---
title: 手写 HashMap（设计哈希表）
description: 从零实现一个哈希表，深入理解哈希函数、冲突解决与扩容机制
date: 2026-06-17 09:00:00
categories:
  - Algorithm
tags:
  - hash-map
  - design
  - data-structure
sidebarSort: 47
---

# 手写 HashMap（设计哈希表）

面试官："你天天用 `Map`、`dict`、`HashMap`，能不能从零手写一个？"

听起来简单对吧？不就是 key-value 存取嘛。但一写起来你会发现——问题全来了：**哈希冲突怎么办？什么时候扩容？扩容的时候旧数据怎么迁移？** 这些问题搞不清楚，面试直接 GG。

今天我们就来拆解 HashMap 的核心原理，然后用 TypeScript 从零实现一个支持 O(1) 增删查的哈希表 💪

## 为什么需要 HashMap？

假设你有一个用户列表，需要根据用户 ID 快速查用户信息。最朴素的想法是用数组遍历：

```
users = [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}, ...]

查 id=999 的用户 → 遍历数组 → O(n) 😭
```

1 万个用户还行，100 万个用户就要命了。如果能让 **查找速度变成 O(1)**，该多好？

这就是 HashMap 诞生的原因——它通过一个**哈希函数**把 key 转换成数组下标，直接跳到对应位置取数据，不遍历。

```
key "user:999" → hash("user:999") → 37 → buckets[37] → 直接拿到 value

时间复杂度：O(1) ✅
```

## 核心概念

### 1. 哈希函数

哈希函数的核心任务是：**把任意类型的 key 映射成一个非负整数（数组下标）**。

一个好的哈希函数需要：

- **确定性**：同一个 key 每次哈希的结果必须一样
- **均匀性**：不同 key 尽量均匀分布在各个位置，减少冲突
- **高效性**：计算速度快，O(1) 或接近 O(1)

```typescript
// 一个简单的字符串哈希函数（DJB2 算法）
function hash(key: string, capacity: number): number {
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    // hash * 33 + charCode，经典的 DJB2 哈希
    hash = ((hash << 5) + hash + key.charCodeAt(i)) >>> 0;
  }
  return hash % capacity;
}
```

> 为什么要 `>>> 0`？JavaScript 的位运算会把数字转成 32 位有符号整数，`>>> 0` 强制转成无符号，保证结果非负。

### 2. 哈希冲突

不管哈希函数设计得多好，只要 key 的数量大于桶的数量（或者 key 空间无穷大），**冲突不可避免**。比如：

```
hash("cat") % 8 = 3
hash("dog") % 8 = 3   ← 冲突了！两个 key 落到同一个桶
```

怎么解决？主流方案有两种：

#### 方案一：链地址法（Chaining）

每个桶不直接存数据，而是存一个**链表**（或数组）。冲突的元素追加到链表末尾。

```
buckets[0] → null
buckets[1] → [key1, val1] → null
buckets[2] → null
buckets[3] → [cat, "🐱"] → [dog, "🐕"] → null  ← 冲突元素串在链表里
buckets[4] → null
...
```

- ✅ 实现简单，负载因子可以大于 1
- ❌ 链表太长时退化成 O(n)
- 📌 Java 的 `HashMap`、JavaScript 的 V8 引擎用的就是这种

#### 方案二：开放寻址法（Open Addressing）

所有元素都直接存在桶数组里。冲突时按照某种探测策略找下一个空位：

```
插入 "cat" → hash = 3 → buckets[3] 为空 → 放进去 ✅
插入 "dog" → hash = 3 → buckets[3] 已占用 → 探测下一个
                      → buckets[4] 为空 → 放进去 ✅
```

常见的探测策略：
- **线性探测**：冲突了就往后找（+1, +2, +3...），简单但容易"聚集"
- **二次探测**：按平方步长找（+1, +4, +9...），缓解聚集
- **双重哈希**：用第二个哈希函数算步长，分布最均匀

- ✅ 数据存在连续内存，缓存友好
- ❌ 负载因子必须控制在 0.7 以下，否则性能急剧下降
- 📌 Python 的 `dict`、Go 的 `map` 用的是开放寻址的变体

### 3. 负载因子与扩容

**负载因子（Load Factor）** = 已存元素数 / 桶的数量

```
capacity = 8, size = 6
load factor = 6 / 8 = 0.75
```

负载因子越大，冲突概率越高，查找越慢。当负载因子超过阈值（通常 0.75），就需要**扩容（resize）**：

```
扩容前：capacity = 8, size = 6, loadFactor = 0.75
触发扩容！
扩容后：capacity = 16, 重新哈希所有元素到新桶数组
新 loadFactor = 6 / 16 = 0.375 ✅ 冲突率大幅下降
```

容量为什么要翻倍？因为翻倍后每个元素的新位置 = 要么在原位，要么在原位 + 旧容量，方便计算。

## 代码实现

接下来我们用 TypeScript 手写一个完整的 HashMap。采用**链地址法**，支持：
- `put(key, value)` —— 插入/更新
- `get(key)` —— 查找
- `delete(key)` —— 删除
- 自动扩容
