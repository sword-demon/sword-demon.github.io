---
title: LFU 缓存
description: LFU（最不经常使用）缓存策略，手把手实现 O(1) 复杂度的 LFU Cache
date: 2026-05-29 09:00:00
categories:
  - Algorithm
tags:
  - lfu
  - cache
  - hash-map
  - linked-list
  - design
sidebarSort: 32
---

# LFU 缓存（Least Frequently Used）

上一篇我们聊了 [LRU 缓存](lru-cache.md)，淘汰的是「最久没用」的那个。但你有没有想过一个问题——如果某个数据被疯狂访问了 1000 次，然后安静了 5 分钟；另一个数据只被访问了 1 次，但就在刚才。LRU 会把那个被访问 1000 次的数据淘汰掉，因为它是「最近最少使用」的。但直觉上，被访问 1000 次的数据明显更重要，对吧？

这就是 LFU（Least Frequently Used）要解决的问题：**淘汰使用频率最低的数据**。如果频率相同，再淘汰最久没用的那个（退化成 LRU 的逻辑）。

听起来好像比 LRU 难一点？没错，LFU 是 LeetCode 460，一道 **Hard** 题。但别怕，今天我们把它拆碎了讲 ✌️

## 为什么需要 LFU？

先来搞清楚什么时候该用 LFU，什么时候该用 LRU。

| 场景 | 推荐策略 | 原因 |
|------|---------|------|
| 网页缓存、API 限流 | LRU | 最近访问的大概率还会访问（时间局部性） |
| 热门商品、热搜词缓存 | LFU | 真正热门的数据不应该因为「安静了一会儿」就被淘汰 |
| 数据库查询缓存 | 看情况 | 如果访问频率分布不均匀，LFU 更好 |

举个实际的例子：你在做一个电商系统，缓存商品详情页。iPhone 的详情页每天被访问 100 万次，某个小众耳机每天只被访问 50 次。如果用 LRU，当缓存满了、刚好有人搜了 100 个小众商品，iPhone 的缓存就被挤出去了——这显然不合理。用 LFU 的话，iPhone 的频率远高于小众商品，永远不会被淘汰。

## 原理拆解

LFU 缓存要支持两个操作：

1. **`get(key)`**：查找 key，命中后该 key 的频率 +1
2. **`put(key, value)`**：插入或更新 key，频率初始化为 1。如果缓存满了，淘汰频率最低的 key（频率相同则淘汰最久没用的）

关键难点：**所有操作都要 O(1)**。这意味着我们不能遍历所有 key 去找频率最低的。

### 数据结构设计

我们需要三个东西配合：

```
1. keyTable: Map<key, Node>
   - 通过 key 直接找到节点，O(1) 查找

2. freqTable: Map<freq, DoublyLinkedList>
   - 通过频率找到对应的双向链表
   - 同一频率的所有 key 按访问时间排序（最近访问的在前）

3. minFreq: number
   - 记录当前最小频率，淘汰时直接定位到 freqTable[minFreq]
```

画个图你就明白了：

```
假设缓存容量为 4，当前状态：

keyTable (HashMap):
┌──────────┬──────────────────┐
│  key "A" │ ──► Node(A, f=2) │
│  key "B" │ ──► Node(B, f=1) │
│  key "C" │ ──► Node(C, f=2) │
│  key "D" │ ──► Node(D, f=1) │
└──────────┴──────────────────┘

freqTable (HashMap):
┌─────────────────────────────────────────────────┐
│ freq 1: ┌───┐    ┌───┐                          │
│         │ B │◄──►│ D │   (B 比 D 更近访问过)      │
│         └───┘    └───┘                          │
│ freq 2: ┌───┐    ┌───┐                          │
│         │ A │◄──►│ C │   (A 比 C 更近访问过)      │
│         └───┘    └───┘                          │
└─────────────────────────────────────────────────┘

minFreq = 1

如果要淘汰 → 去 freqTable[1] 的链表尾部删掉 → 淘汰 D
```

### get 操作流程

```
get("A"):
  1. keyTable 里找到 A → Node(A, f=2)
  2. 把 A 从 freq=2 的链表中移除
  3. A 的频率变成 3
  4. 把 A 插入 freq=3 的链表头部
  5. 检查：如果 freq=2 的链表空了，且 minFreq==2 → minFreq = 3
  6. 返回 A 的 value
```

### put 操作流程

```
put("E", 42)  [缓存未满]:
  1. 创建 Node(E, f=1)
  2. 放入 keyTable
  3. 插入 freq=1 的链表头部
  4. minFreq = 1

put("F", 99)  [缓存已满]:
  1. 淘汰：去 freqTable[minFreq] 的链表尾部删除
  2. 从 keyTable 中也删除对应 key
  3. 创建 Node(F, f=1)，插入
  4. minFreq = 1
```

## 代码实现

先定义双向链表节点：

```typescript
class DLinkedNode {
  key: number;
  value: number;
  freq: number = 1;
  prev: DLinkedNode | null = null;
  next: DLinkedNode | null = null;

  constructor(key: number, value: number) {
    this.key = key;
    this.value = value;
  }
}
```

然后定义双向链表（用于维护同一频率下按访问时间排序的 key）：

```typescript
class DLinkedList {
  head: DLinkedNode; // 哨兵头
  tail: DLinkedNode; // 哨兵尾
  size: number = 0;

  constructor() {
    this.head = new DLinkedNode(0, 0);
    this.tail = new DLinkedNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // 在头部插入（最近访问的放前面）
  addFirst(node: DLinkedNode): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
    this.size++;
  }

  // 删除节点
  remove(node: DLinkedNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    this.size--;
  }

  // 删除并返回尾部节点（最久没用的）
  removeLast(): DLinkedNode | null {
    if (this.size === 0) return null;
    const last = this.tail.prev!;
    this.remove(last);
    return last;
  }
}
```

最后是 LFU 缓存的完整实现：

```typescript
class LFUCache {
  private capacity: number;
  private minFreq: number = 0;
  private keyTable: Map<number, DLinkedNode> = new Map();
  private freqTable: Map<number, DLinkedList> = new Map();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): number {
    if (!this.keyTable.has(key)) return -1;

    const node = this.keyTable.get(key)!;
    // 提升频率
    this.increaseFreq(node);
    return node.value;
  }

  put(key: number, value: number): void {
    if (this.capacity === 0) return;

    if (this.keyTable.has(key)) {
      // 已存在，更新值并提升频率
      const node = this.keyTable.get(key)!;
      node.value = value;
      this.increaseFreq(node);
      return;
    }

    // 缓存满了，淘汰频率最低的
    if (this.keyTable.size >= this.capacity) {
      const minFreqList = this.freqTable.get(this.minFreq)!;
      const victim = minFreqList.removeLast()!;
      this.keyTable.delete(victim.key);
    }

    // 新建节点
    const newNode = new DLinkedNode(key, value);
    this.keyTable.set(key, newNode);

    // 加入 freq=1 的链表
    if (!this.freqTable.has(1)) {
      this.freqTable.set(1, new DLinkedList());
    }
    this.freqTable.get(1)!.addFirst(newNode);

    // 新节点频率一定是 1
    this.minFreq = 1;
  }

  private increaseFreq(node: DLinkedNode): void {
    const oldFreq = node.freq;
    const newFreq = oldFreq + 1;
    node.freq = newFreq;

    // 从旧频率链表中移除
    const oldList = this.freqTable.get(oldFreq)!;
    oldList.remove(node);

    // 如果旧链表空了，且刚好是最小频率 → 更新 minFreq
    if (oldList.size === 0 && this.minFreq === oldFreq) {
      this.minFreq = newFreq;
    }

    // 加入新频率链表头部
    if (!this.freqTable.has(newFreq)) {
      this.freqTable.set(newFreq, new DLinkedList());
    }
    this.freqTable.get(newFreq)!.addFirst(node);
  }
}
```

### 验证一下

```typescript
const cache = new LFUCache(2);

cache.put(1, 1);      // keyTable: {1: f=1}
cache.put(2, 2);      // keyTable: {1: f=1, 2: f=1}
cache.get(1);          // 返回 1，key=1 频率变 2  → {1: f=2, 2: f=1}
cache.put(3, 3);       // 容量满了！minFreq=1，淘汰 key=2 → {1: f=2, 3: f=1}
cache.get(2);          // 返回 -1（已被淘汰）
cache.get(3);          // 返回 3，key=3 频率变 2  → {1: f=2, 3: f=2}
cache.put(4, 4);       // 容量满了！minFreq=2，淘汰 key=1（更久没访问）→ {3: f=2, 4: f=1}
cache.get(1);          // 返回 -1（已被淘汰）
cache.get(3);          // 返回 3
cache.get(4);          // 返回 4
```

## 复杂度分析

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| `get(key)` | O(1) | HashMap 查找 + 链表操作都是 O(1) |
| `put(key, value)` | O(1) | HashMap 插入 + 链表插入都是 O(1) |

空间复杂度：**O(capacity)**，最多存储 capacity 个节点。

为什么是 O(1)？每个操作的核心就是：
- HashMap 的 get/set → O(1)
- 双向链表的 add/remove → O(1)（因为我们有节点的直接引用）

## 和 LRU 的对比

```
┌─────────────┬──────────────────────┬──────────────────────────┐
│             │         LRU          │          LFU             │
├─────────────┼──────────────────────┼──────────────────────────┤
│ 淘汰策略     │ 最久没用的            │ 频率最低的               │
│ 数据结构     │ HashMap + 双向链表    │ HashMap + 频率分组链表    │
│ 实现难度     │ Medium (LC 146)      │ Hard (LC 460)            │
│ 适用场景     │ 时间局部性强          │ 频率分布不均匀            │
│ 冷启动问题   │ 无                   │ 新数据频率=1，容易被淘汰   │
│ 频率衰减     │ 天然支持（靠时间顺序） │ 需要额外处理              │
└─────────────┴──────────────────────┴──────────────────────────┘
```

### LFU 的「冷启动」问题

LFU 有一个著名的缺陷：**新加入的数据频率为 1，而老数据可能已经积累了很高的频率。如果新数据真的是热点，它需要很长时间才能把频率追上来。**

解决方案：

```typescript
// 方案一：频率衰减（老化）
// 定期把所有频率减半，或者按时间窗口重置
// Redis 的 LFU 实现就用了这种方式

// 方案二：新数据初始频率不为 1
// 比如初始频率设为当前平均频率的一半
```

Redis 的 LFU 实现用了一个很巧妙的方式：不是精确计数，而是用**概率递增**——每次访问时，以一定概率增加计数器。这样老数据的计数器不会无限增长，新数据也有机会追上来。

## 实际应用场景

### 1. 数据库查询缓存

MySQL 的 Query Cache（虽然 8.0 已废弃）和很多 ORM 框架的二级缓存都用了 LFU 策略。热点 SQL 查询频率远高于冷查询，用 LFU 可以保留最有效的缓存。

### 2. CDN 内容缓存

CDN 节点缓存热门视频/图片。那些真正热门的内容不应该因为「刚好有人访问了一堆冷门内容」就被淘汰。

### 3. DNS 缓存

浏览器和操作系统的 DNS 缓存。常用域名（google.com）的解析结果应该长期保留，而不是被偶尔访问的长尾域名挤掉。

### 4. 操作系统页面置换

操作系统在物理内存不够时，需要决定把哪些页面换出到磁盘。Linux 内核就使用了类似 LFU 的策略（具体是 Clock-Pro，混合了 LRU 和 LFU 的思想）。

## 进阶：O(1) 实现的其他思路

上面用的是「频率分组 + 双向链表」的经典解法。还有一些有趣的替代方案：

### 思路一：用 Skip List（跳表）

```typescript
// 每个频率对应一个跳表节点，节点上挂一个 Set<key>
// 跳表天然有序，可以 O(logN) 找到最小频率
// 但 get/put 就不再是严格 O(1) 了
```

### 思路二：TimerWheel（时间轮）

```typescript
// 结合时间和频率，用多级时间轮来近似实现 LFU
// 适合流式数据场景，不需要精确淘汰
```

面试的时候，能写出上面那个经典解法就足够优秀了。如果还能提到 Redis 的概率递增方案，面试官会觉得你不仅会做题，还了解工程实现，加分！

## 总结

```
LFU = Least Frequently Used，淘汰频率最低的

核心数据结构：
  keyTable:  key → Node          （O(1) 找节点）
  freqTable: freq → LinkedList   （O(1) 找到某个频率下的所有 key）
  minFreq:   当前最小频率          （O(1) 定位淘汰目标）

关键技巧：
  1. 双向链表 + 哨兵节点 → O(1) 插入/删除
  2. 同频率内按访问时间排序 → 频率相同时退化为 LRU
  3. minFreq 的维护：只在最小频率链表清空时才需要更新

面试要点：
  - LeetCode 460，Hard 难度
  - 能手写出来已经打败 95% 的候选人
  - 能聊 Redis 的概率递增实现更是加分项
```

LFU 虽然比 LRU 复杂一些，但核心思想是相通的：**用 HashMap 换查找速度，用链表维护顺序**。把这两招吃透了，LRU、LFU、甚至以后遇到什么 XXU 缓存，都能举一反三 (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧
