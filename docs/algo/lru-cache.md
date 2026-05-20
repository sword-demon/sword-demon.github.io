---
title: LRU 缓存
description: LRU（最近最少使用）缓存策略
date: 2026-05-21 00:05:00
categories:
  - Algorithm
tags:
  - lru
  - cache
  - linked-list
  - hash-map
sidebarSort: 13
---

# LRU 缓存（Least Recently Used）

你有一个书架，上面最多放 10 本书。每当你拿到一本新书，就往书架上放。但书架满了怎么办？最自然的做法就是——**把最久没翻过的那本书拿走，给新书腾地方**。这就是 LRU（Least Recently Used）的核心思想：当空间不够时，淘汰最近最少使用的那个。

听起来很简单对吧？但如果我告诉你，每次「放进去」和「查一下」这两个操作，都得是 **O(1)** 的时间复杂度呢？这就不是随便拿个数组能搞定的了。Google 面试经典题 LeetCode 146，就是让你手写一个这样的数据结构。

## 为什么需要 LRU？

缓存这个东西，本质上就是**用空间换时间**。你不可能把所有数据都放进缓存（太贵了），所以缓存一定有容量上限。那满了之后淘汰谁？这就需要一个**淘汰策略**：

- **LRU**（Least Recently Used）：淘汰最久没用的 —— 最通用、最常用
- **LFU**（Least Frequently Used）：淘汰使用频率最低的
- **FIFO**（First In First Out）：淘汰最早放进去的
- **Random**：随机淘汰（真有人这么干，Redis 3.0 之前就有这个策略）

LRU 之所以最流行，是因为它很好地利用了**时间局部性**原理：最近被访问过的数据，接下来大概率还会被访问。反过来，很久没碰过的数据，接下来大概率也不会被用到。所以淘汰它，合理。

## 原理拆解

LRU 缓存需要支持两个核心操作：

1. **`get(key)`**：查找 key 对应的 value。如果命中，把这个 key 标记为「最近使用过」。
2. **`put(key, value)`**：插入或更新。如果缓存满了，先淘汰最久没用的，再插入。

关键难点在于：**怎么在 O(1) 时间内知道谁是最久没用的？** 答案是 **哈希表 + 双向链表** 的组合拳。

### 数据结构组合

```
哈希表（Map）：key → 链表节点的引用
    O(1) 查找节点位置

双向链表（Doubly Linked List）：按访问时间排序
    头部（最近使用） ←→ ... ←→ 尾部（最久没用）
    O(1) 移动节点到头部
    O(1) 删除尾部节点
```

来看一张完整的结构图：

```
哈希表                        双向链表（按访问时间从新到旧）
┌──────────┐
│ key: "A" │──────────────► ┌───┐    ┌───┐    ┌───┐    ┌───┐
├──────────┤                │ A │◄──►│ C │◄──►│ B │◄──►│ D │
│ key: "B" │───────────┐    │val│    │val│    │val│    │val│
├──────────┤           │    └───┘    └───┘    └───┘    └───┘
│ key: "C" │──────┐    │      ▲                         ▲
├──────────┤      │    │      │                         │
│ key: "D" │─┐    │    │    head（最近用）           tail（最久没用）
└──────────┘  │    │    │
              │    └────┘
              └─────────┘

操作规则：
  get(key) → 命中后把节点移到 head
  put(key) → 新节点插到 head；满了就删 tail
```

### 操作流程演示

假设缓存容量为 3，依次执行：`put(A,1)`、`put(B,2)`、`put(C,3)`、`get(A)`、`put(D,4)`

```
步骤1: put(A, 1)
  链表: [A] ← head/tail
  哈希: {A → nodeA}

步骤2: put(B, 2)
  链表: [B] ←→ [A]
         head   tail

步骤3: put(C, 3)
  链表: [C] ←→ [B] ←→ [A]
         head          tail

步骤4: get(A) → 返回 1，A 被移到头部
  链表: [A] ←→ [C] ←→ [B]
         head          tail

步骤5: put(D, 4) → 缓存已满！淘汰 tail（B），D 插入头部
  链表: [D] ←→ [A] ←→ [C]
         head          tail
  哈希: 移除 B，加入 D
```

可以看到，链表的**头部永远是最近使用的，尾部永远是最久没用的**。淘汰的时候只需要删尾节点，O(1) 搞定。

### 为什么一定要双向链表？

单向链表行不行？不太行。因为当你需要删除或移动一个节点时，你需要知道它的**前驱节点**。单向链表找前驱要 O(n)，双向链表直接 `node.prev` 就是 O(1)。在这个场景下，O(1) 是硬性要求，所以双向链表是唯一选择。

## 代码实现

### TypeScript 完整实现

```typescript
/**
 * LRU 缓存 —— TypeScript 实现
 * 核心思路：哈希表负责 O(1) 查找，双向链表负责 O(1) 维护访问顺序
 */

/** 双向链表节点 */
class ListNode<K, V> {
  key: K;
  value: V;
  prev: ListNode<K, V> | null = null;
  next: ListNode<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

class LRUCache<K, V> {
  private capacity: number;                    // 缓存容量
  private cache: Map<K, ListNode<K, V>>;      // 哈希表：key → 节点引用
  private head: ListNode<K, V>;               // 哨兵头节点（虚拟节点，不存数据）
  private tail: ListNode<K, V>;               // 哨兵尾节点（虚拟节点，不存数据）

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();

    // 初始化哨兵节点，避免边界判断的麻烦
    // 为什么用哨兵：有了它们，插入和删除操作永远不需要判断 null，代码简洁很多
    this.head = new ListNode(null as K, null as V);
    this.tail = new ListNode(null as K, null as V);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * 查询缓存
   * 命中：返回 value 并把节点移到头部（标记为最近使用）
   * 未命中：返回 undefined
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;

    // 命中了，先移到头部，再返回值
    this.moveToHead(node);
    return node.value;
  }

  /**
   * 插入/更新缓存
   * key 已存在：更新 value 并移到头部
   * key 不存在：创建新节点插入头部，如果超容量就淘汰尾部
   */
  put(key: K, value: V): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      // key 已存在，更新值 + 移到头部
      existingNode.value = value;
      this.moveToHead(existingNode);
    } else {
      // 新节点
      const newNode = new ListNode(key, value);
      this.cache.set(key, newNode);
      this.addToHead(newNode);

      // 超容量了，淘汰尾部节点
      if (this.cache.size > this.capacity) {
        const removed = this.removeTail();
        if (removed) {
          this.cache.delete(removed.key);
        }
      }
    }
  }

  /** 将节点移到头部 = 先删除原位置 + 再插入头部 */
  private moveToHead(node: ListNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  /** 在头部插入节点（head 哨兵之后） */
  private addToHead(node: ListNode<K, V>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  /** 从链表中移除节点（只改指针，不回收内存） */
  private removeNode(node: ListNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  /** 移除尾部节点（tail 哨兵之前那个，即最久没用的） */
  private removeTail(): ListNode<K, V> | null {
    const node = this.tail.prev;
    if (node === this.head) return null; // 空链表，只有哨兵
    this.removeNode(node);
    return node;
  }

  /** 调试用：打印当前链表顺序 */
  debug(): void {
    const items: string[] = [];
    let current = this.head.next;
    while (current !== this.tail) {
      items.push(`${current!.key}:${current!.value}`);
      current = current!.next;
    }
    console.log(`LRU [${items.join(" ←→ ")}]`);
  }
}

// 使用示例
const cache = new LRUCache<string, number>(3);

cache.put("a", 1);
cache.put("b", 2);
cache.put("c", 3);
cache.debug(); // LRU [c:3 ←→ b:2 ←→ a:1]

cache.get("a"); // 访问 a，a 移到头部
cache.debug(); // LRU [a:1 ←→ c:3 ←→ b:2]

cache.put("d", 4); // 满了，淘汰最久没用的 b
cache.debug(); // LRU [d:4 ←→ a:1 ←→ c:3]

console.log(cache.get("b")); // undefined —— b 已被淘汰
console.log(cache.get("a")); // 1 —— a 还在
```

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
| ---- | ---------- | ---------- |
| get  | O(1)       | —          |
| put  | O(1)       | O(capacity) |

- **时间复杂度 O(1)**：哈希表的 `get`/`set` 是 O(1)，双向链表的插入、删除、移动也都是 O(1)（因为我们持有节点引用，不需要遍历）。两者组合起来，`get` 和 `put` 都是严格的 O(1)。
- **空间复杂度 O(capacity)**：哈希表和链表各存一份节点引用，总量跟缓存容量成正比。

这也是为什么 LRU 面试题会特别强调"O(1)"——它考查的就是你能不能想到**哈希表 + 双向链表**这个组合。

## LeetCode 146 实战

[LeetCode 146. LRU Cache](https://leetcode.cn/problems/lru-cache/) 是这道题的标准版本。题目要求 key 和 value 都是整数，接口如下：

```typescript
// LeetCode 146 题的接口要求
// constructor(capacity: number)
// get(key: number): number  —— 存在返回 value，不存在返回 -1
// put(key: number, value: number): void
```

直接把我们上面的泛型版本改成 `number` 类型，再调整一下 `get` 的返回值（未命中返回 -1），就能直接提交了：

```typescript
class LRUCacheLeetCode {
  private capacity: number;
  private cache: Map<number, ListNode<number, number>>;
  private head: ListNode<number, number>;
  private tail: ListNode<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = new ListNode(0, 0);
    this.tail = new ListNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    const node = this.cache.get(key);
    if (!node) return -1; // 未命中返回 -1
    this.moveToHead(node);
    return node.value;
  }

  put(key: number, value: number): void {
    const existingNode = this.cache.get(key);
    if (existingNode) {
      existingNode.value = value;
      this.moveToHead(existingNode);
    } else {
      const newNode = new ListNode(key, value);
      this.cache.set(key, newNode);
      this.addToHead(newNode);
      if (this.cache.size > this.capacity) {
        const removed = this.removeTail();
        if (removed) this.cache.delete(removed.key);
      }
    }
  }

  private moveToHead(node: ListNode<number, number>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private addToHead(node: ListNode<number, number>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: ListNode<number, number>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private removeTail(): ListNode<number, number> | null {
    const node = this.tail.prev;
    if (node === this.head) return null;
    this.removeNode(node);
    return node;
  }
}

// LeetCode 测试用例
const lru = new LRUCacheLeetCode(2);
lru.put(1, 1); // cache is {1=1}
lru.put(2, 2); // cache is {2=2, 1=1}
console.log(lru.get(1)); // 1 → cache is {1=1, 2=2}
lru.put(3, 3); // 淘汰 key=2 → cache is {3=3, 1=1}
console.log(lru.get(2)); // -1（已淘汰）
lru.put(4, 4); // 淘汰 key=1 → cache is {4=4, 3=3}
console.log(lru.get(1)); // -1（已淘汰）
console.log(lru.get(3)); // 3
console.log(lru.get(4)); // 4
```

### 有没有更简洁的写法？

如果你用 **Java**，可以直接用 `LinkedHashMap`，它内置了 LRU 的支持（设置 `accessOrder=true`，重写 `removeEldestEntry`），几行代码就搞定了。但面试官让你手写，就是想看你对底层数据结构的理解，所以别偷懒 😏。

在 JavaScript/TypeScript 中，`Map` 本身就保持插入顺序，并且可以用 `delete` + `set` 来模拟"移到最近"的效果。所以有一个**取巧的纯 Map 实现**：

```typescript
/**
 * 利用 Map 的有序性实现 LRU —— 代码更短，面试加分项
 * 原理：Map 的迭代顺序就是插入顺序，delete + set 等于"移到末尾"
 *       最老的元素就是 for...of 迭代的第一个
 */
class LRUCacheSimple {
  private cache = new Map<number, number>();
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key)!;
    // delete + set = 把 key 移到"最近使用"的位置（Map 迭代顺序的末尾）
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 淘汰最老的（Map 迭代器的第一个）
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}
```

这个写法在面试中可以提一下，展示你了解语言特性。但面试官大概率会让你再写一遍「哈希表 + 双向链表」的版本，因为那才是考察重点。

## 实际应用场景

### 1. 数据库查询缓存

MySQL 的 Buffer Pool 就用了 LRU 的变体。当查询需要读取磁盘上的数据页时，先把页缓存到内存中。内存有限，所以用 LRU 决定淘汰哪些页。不过 MySQL 用的是**改进型 LRU**（冷热分区，也叫 LRU-K），防止全表扫描一次性把热数据冲掉。

### 2. 操作系统页面置换

你电脑的内存是有限的，但进程需要的虚拟内存可能远大于物理内存。操作系统把不常用的内存页换到磁盘（swap），腾出来的空间给正在用的页。Linux 内核的页面置换就用到了 LRU 的思想（实际是更复杂的 Active/Inactive 双链表）。

### 3. Web 浏览器缓存

浏览器缓存图片、CSS、JS 等资源。当缓存空间满了，浏览器会优先淘汰最久没访问的资源。Chrome 的磁盘缓存就采用了 LRU 策略。这也是为什么你经常访问的网站加载很快——资源都在缓存里。

### 4. CDN 边缘节点

CDN 节点的存储空间有限，不可能缓存全网的内容。当用户请求的资源不在缓存中时，CDN 会回源拉取并缓存。淘汰策略通常就是 LRU：最近没人访问的资源优先被清理，腾地方给新热点内容。

### 5. Redis 近似 LRU

Redis 从 2.8 开始支持 LRU 淘汰策略（`maxmemory-policy` 设为 `allkeys-lru`）。不过 Redis 并没有用双向链表来维护顺序——那太耗内存了。它用的是**随机采样**：随机取 N 个 key，淘汰其中最久没用的。采样数越大越接近真实 LRU，但越慢。这是一个经典的**精度换性能**的取舍。

## 小结

LRU 缓存的本质就是一句话：**最近用过的优先保留，最久没用的优先淘汰**。

要实现 O(1) 的 `get` 和 `put`，核心是两个数据结构的配合：

- 🗂️ **哈希表**：O(1) 查找 key 对应的节点
- 🔗 **双向链表**：O(1) 完成节点插入、删除、移动（维护访问顺序）

记住这个组合，因为它不只用在 LRU 上——LFU（最不经常使用）缓存、LRU-K 等变体都离不开这个基本骨架。

最后总结一下要点：

- ✅ `get` 命中后要把节点移到头部，标记为"最近使用"
- ✅ `put` 时如果满了，淘汰尾部节点（最久没用）
- ✅ 用哨兵节点（dummy head / tail）简化边界判断
- ✅ 双向链表是必须的，单向链表找前驱要 O(n)
- ✅ JavaScript 的 `Map` 有序性可以简化实现，但面试建议写标准版
