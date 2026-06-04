---
title: 跳表
description: 跳表（Skip List）—— 用随机性换来的简单高效
date: 2026-06-02 09:00:00
categories:
  - Algorithm
tags:
  - skip-list
  - data-structure
  - redis
sidebarSort: 36
---

# 跳表（Skip List）

你一定用过有序链表吧？插入 O(1)、删除 O(1)，看起来很美，但一到查找就拉胯了——得从头到尾一个个遍历，O(n) 的复杂度让人崩溃。

那有没有一种数据结构，既保留链表的灵活性（插入删除快），又能像二分查找一样快速定位呢？

你可能会说：用平衡二叉搜索树啊！AVL 树、红黑树，查找都是 O(log n)。没错，但你写过红黑树吗？光是左旋右旋、颜色翻转的那些 case 就够你 debug 一整天的 😂。

**跳表**就是来解决这个问题的。它的核心思想简单到令人发指：**在原始链表的基础上，加几层"快速通道"索引**，就像高铁和绿皮火车的关系——高铁在大站停靠，快速到达目的地附近，然后换绿皮火车到精确站台。

Redis 的有序集合（ZSet）底层就用了跳表。为什么 Redis 不用红黑树？因为跳表实现更简单，而且范围查询更方便。今天我们来彻底搞懂它。

## 先看问题：有序链表查找太慢

假设我们有一个有序链表，存了 8 个元素：

```
HEAD → 1 → 3 → 5 → 7 → 9 → 11 → 13 → 15 → NULL
```

要查找 13，你得从头开始走 7 步。如果链表有 100 万个节点，平均要走 50 万次。

问题的本质是：**链表只能线性遍历，没法跳着走**。

## 核心思想：加索引

既然线性遍历太慢，那我们**加一层索引**，每两个节点选一个"代表"：

```
第 2 层（索引层 2）: HEAD —————————————→ 9 —————————————→ NULL
第 1 层（索引层 1）: HEAD ————→ 5 ————→ 9 ————→ 13 ————→ NULL
第 0 层（原始链表）: HEAD → 1 → 3 → 5 → 7 → 9 → 11 → 13 → 15 → NULL
```

现在要查找 13：
1. 从第 2 层的 HEAD 出发，看 9，13 比 9 大 → 往右走
2. 到了 NULL，往下一层到第 1 层的 9
3. 从 9 往右看，13 → 找到了！**只走了 2 步！**

如果再加一层索引呢？每 4 个节点选一个代表：

```
第 3 层: HEAD ————————————————————————→ NULL
第 2 层: HEAD —————————————→ 9 —————————————→ NULL
第 1 层: HEAD ————→ 5 ————→ 9 ————→ 13 ————→ NULL
第 0 层: HEAD → 1 → 3 → 5 → 7 → 9 → 11 → 13 → 15 → NULL
```

层级越高，节点越稀疏，查找越快。这就是跳表的全部思想——**通过多级索引，把链表的查找变成类似二分查找的过程**。

## 时间复杂度分析

假设有 n 个节点，索引层级为 h：

```
每层索引大约是下一层节点数的一半：

第 0 层: n 个节点
第 1 层: n/2 个节点
第 2 层: n/4 个节点
...
第 h 层: n/2^h 个节点
```

索引层最高层节点数 ≈ 1，所以：

```
n / 2^h = 1
h = log₂(n)
```

**查找过程**：从最高层开始，每一层最多走常数步（最多 2 步：向右一次，向下一次），总共 h 层：

```
查找复杂度 = O(h) × O(1) = O(log n)  ✅
```

跟平衡二叉搜索树一样！但实现起来简单太多了。

## 随机化：让索引自动"生长"

你可能会问：那索引怎么建？手动维护？当然不是。跳表的精髓在于**随机化**。

当插入一个新节点时，我们用抛硬币的方式决定它"长"多高：

```
掷一枚硬币：
  - 正面 → 继续往上长一层
  - 反面 → 停止

示例：
  节点 A: 正、正、反      → 层数 3
  节点 B: 反              → 层数 1（只在原始层）
  节点 C: 正、正、正、反  → 层级 4
```

这样每个节点的层数是**随机**的，但期望上：

```
- 层数 ≥ 1 的概率: 1
- 层数 ≥ 2 的概率: 1/2
- 层数 ≥ 3 的概率: 1/4
- 层数 ≥ k 的概率: 1/2^k
```

这恰好满足了"每层节点数是下层一半"的性质！不需要显式地"每两个选一个"，靠随机化就自动实现了。漂亮！

## 代码实现

先定义节点结构：

```typescript
class SkipListNode {
  value: number;
  // forwards[i] 表示第 i 层指向的下一个节点
  forwards: SkipListNode[];
  // 方便起见记录一下最大层数
  level: number;

  constructor(value: number, level: number) {
    this.value = value;
    this.forwards = new Array(level + 1).fill(null);
    this.level = level;
  }
}
```

然后是跳表主体：

```typescript
class SkipList {
  private head: SkipListNode;
  private maxLevel: number;    // 理论最大层数
  private currentLevel: number; // 当前实际最高层数
  private size: number;

  constructor(maxLevel: number = 16) {
    this.maxLevel = maxLevel;
    this.currentLevel = 0;
    this.size = 0;
    // 头节点是一个哨兵节点，值不重要
    this.head = new SkipListNode(-1, maxLevel);
  }

  // 随机生成层数
  private randomLevel(): number {
    let level = 0;
    while (Math.random() < 0.5 && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  // ... 其他方法见下文
}
```

### 查找操作

```typescript
search(target: number): boolean {
  let current = this.head;

  // 从最高层开始往下找
  for (let i = this.currentLevel; i >= 0; i--) {
    // 在当前层向右走，直到遇到 >= target 的节点
    while (current.forwards[i] && current.forwards[i].value < target) {
      current = current.forwards[i];
    }
  }

  // 到了最底层，看右边是不是目标值
  const candidate = current.forwards[0];
  return candidate !== null && candidate.value === target;
}
```

图解查找过程（查找 9）：

```
第 2 层: HEAD —————————————→ 9 ← 到这里！找到了
           ↓                  ↑
第 1 层: HEAD ————→ 5 ————→ 9 ← 先在第 1 层找到 5
           ↓                  ↑
第 0 层: HEAD → 1 → 3 → 5 → 7 → 9 → 11 → ...

步骤：
1. 从 HEAD 的第 2 层开始
2. forwards[2] 是 9，9 == target，但 < 9 才往右走，所以不走
3. 向下到第 1 层，forwards[1] 是 5，5 < 9 → 往右走到 5
4. 5 的 forwards[1] 是 9，9 不 < 9 → 不走了
5. 向下到第 0 层，5 的 forwards[0] 是 7，7 < 9 → 往右走到 7
6. 7 的 forwards[0] 是 9，9 不 < 9 → 停
7. 检查 7 的 forwards[0] = 9 == target → 找到了！✅
```

### 插入操作

```typescript
insert(value: number): void {
  // update[i] 记录第 i 层中，新节点应该插入在哪个节点后面
  const update: SkipListNode[] = new Array(this.maxLevel + 1).fill(null);
  const current = this.head;

  // 第一步：从最高层往下，找到每层的插入位置
  for (let i = this.currentLevel; i >= 0; i--) {
    while (current.forwards[i] && current.forwards[i].value < value) {
      current = current.forwards[i];
    }
    update[i] = current; // 第 i 层中，新节点应该插在 current 后面
  }

  // 第二步：随机决定新节点的层数
  const newLevel = this.randomLevel();

  // 如果新层数超过了当前最高层数，更新一下
  if (newLevel > this.currentLevel) {
    for (let i = this.currentLevel + 1; i <= newLevel; i++) {
      update[i] = this.head;
    }
    this.currentLevel = newLevel;
  }

  // 第三步：创建新节点，并在每一层执行链表插入
  const newNode = new SkipListNode(value, newLevel);
  for (let i = 0; i <= newLevel; i++) {
    newNode.forwards[i] = update[i].forwards[i];
    update[i].forwards[i] = newNode;
  }

  this.size++;
}
```

图解插入过程（插入 6）：

```
插入前:
第 1 层: HEAD ————→ 5 ————→ 9
第 0 层: HEAD → 1 → 3 → 5 → 7 → 9

随机层数 = 1（假设掷了正面、反面）

update[1] = HEAD, update[0] = 5

插入后:
第 1 层: HEAD ————→ 5 ————→ 6 ————→ 9
第 0 层: HEAD → 1 → 3 → 5 → 6 → 7 → 9

                    ^^^^^^^^
                    新节点同时出现在两层
```

### 删除操作

```typescript
remove(value: number): boolean {
  const update: SkipListNode[] = new Array(this.maxLevel + 1).fill(null);
  const current = this.head;

  // 同样先找到每层中目标节点的前驱
  for (let i = this.currentLevel; i >= 0; i--) {
    while (current.forwards[i] && current.forwards[i].value < value) {
      current = current.forwards[i];
    }
    update[i] = current;
  }

  // 最底层中，目标节点的下一个
  const target = current.forwards[0];

  if (!target || target.value !== value) {
    return false; // 没找到
  }

  // 在每一层断开目标节点
  for (let i = 0; i <= this.currentLevel; i++) {
    if (update[i].forwards[i] !== target) break;
    update[i].forwards[i] = target.forwards[i];
  }

  // 如果删除后最高层变空了，降低 currentLevel
  while (this.currentLevel > 0 && !this.head.forwards[this.currentLevel]) {
    this.currentLevel--;
  }

  this.size--;
  return true;
}
```

### 完整代码整合

```typescript
class SkipList {
  private head: SkipListNode;
  private maxLevel: number;
  private currentLevel: number;
  private size: number;

  constructor(maxLevel: number = 16) {
    this.maxLevel = maxLevel;
    this.currentLevel = 0;
    this.size = 0;
    this.head = new SkipListNode(-1, maxLevel);
  }

  private randomLevel(): number {
    let level = 0;
    while (Math.random() < 0.5 && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  search(target: number): boolean {
    let current = this.head;
    for (let i = this.currentLevel; i >= 0; i--) {
      while (current.forwards[i] && current.forwards[i].value < target) {
        current = current.forwards[i];
      }
    }
    const candidate = current.forwards[0];
    return candidate !== null && candidate.value === target;
  }

  insert(value: number): void {
    const update: SkipListNode[] = new Array(this.maxLevel + 1).fill(null);
    let current = this.head;

    for (let i = this.currentLevel; i >= 0; i--) {
      while (current.forwards[i] && current.forwards[i].value < value) {
        current = current.forwards[i];
      }
      update[i] = current;
    }

    const newLevel = this.randomLevel();
    if (newLevel > this.currentLevel) {
      for (let i = this.currentLevel + 1; i <= newLevel; i++) {
        update[i] = this.head;
      }
      this.currentLevel = newLevel;
    }

    const newNode = new SkipListNode(value, newLevel);
    for (let i = 0; i <= newLevel; i++) {
      newNode.forwards[i] = update[i].forwards[i];
      update[i].forwards[i] = newNode;
    }

    this.size++;
  }

  remove(value: number): boolean {
    const update: SkipListNode[] = new Array(this.maxLevel + 1).fill(null);
    let current = this.head;

    for (let i = this.currentLevel; i >= 0; i--) {
      while (current.forwards[i] && current.forwards[i].value < value) {
        current = current.forwards[i];
      }
      update[i] = current;
    }

    const target = current.forwards[0];
    if (!target || target.value !== value) return false;

    for (let i = 0; i <= this.currentLevel; i++) {
      if (update[i].forwards[i] !== target) break;
      update[i].forwards[i] = target.forwards[i];
    }

    while (this.currentLevel > 0 && !this.head.forwards[this.currentLevel]) {
      this.currentLevel--;
    }

    this.size--;
    return true;
  }

  // 范围查询 —— 跳表的杀手级能力
  rangeQuery(start: number, end: number): number[] {
    const result: number[] = [];
    let current = this.head;

    // 先快速定位到 >= start 的位置
    for (let i = this.currentLevel; i >= 0; i--) {
      while (current.forwards[i] && current.forwards[i].value < start) {
        current = current.forwards[i];
      }
    }

    // 然后在最底层顺序遍历
    current = current.forwards[0];
    while (current && current.value <= end) {
      result.push(current.value);
      current = current.forwards[0];
    }

    return result;
  }

  toString(): string {
    const lines: string[] = [];
    for (let i = this.currentLevel; i >= 0; i--) {
      let line = `Level ${i}: HEAD`;
      let node = this.head.forwards[i];
      while (node) {
        line += ` → ${node.value}`;
        node = node.forwards[i];
      }
      line += ` → NULL`;
      lines.push(line);
    }
    return lines.join('\n');
  }
}
```

## 复杂度总结

```
┌────────────────┬──────────────┬──────────────┐
│     操作       │  平均时间     │  空间复杂度   │
├────────────────┼──────────────┼──────────────┤
│  查找           │  O(log n)    │              │
│  插入           │  O(log n)    │  O(n)        │
│  删除           │  O(log n)    │              │
│  范围查询       │  O(log n + k)│              │
│                │  k=结果数量   │              │
└────────────────┴──────────────┴──────────────┘
```

## 跳表 vs 红黑树：为什么 Redis 选了跳表？

这个问题面试中经常被问到，来梳理一下：

```
                    跳表                  红黑树
───────────────────────────────────────────────────
  实现难度          简单                  复杂
  查找              O(log n)             O(log n)
  插入              O(log n)             O(log n)
  删除              O(log n)             O(log n)
  范围查询          天然支持（遍历底层链表） 需要中序遍历
  并发友好          容易加锁              旋转操作复杂
  内存局部性        较差（随机化）         较差（指针多）
  代码量            ~200 行               ~500+ 行
```

Redis 选择跳表的核心原因：

1. **实现简单**：红黑树的插入删除涉及大量 case（左旋、右旋、颜色翻转），容易出 bug
2. **范围查询天然友好**：`ZRANGEBYSCORE` 这种操作，跳表只需要定位到起点然后顺序遍历底层链表，红黑树则需要中序遍历
3. **概率平衡 vs 强制平衡**：跳表靠随机化天然"大致平衡"，红黑树需要严格维护平衡性质

Antirez（Redis 作者）原话大意是：跳表足够好，实现又简单，何必搞那么复杂？

## 跳表的变体和优化

### 1. 确定性跳表

标准跳表用随机化，但有些场景需要确定性。比如**确定性跳表（Deterministic Skip List）**，用固定的规则替代随机化，保证最坏情况下的性能。

### 2. 并发跳表

跳表在并发场景下比红黑树更友好。插入一个节点时，只需要修改几个指针，不像红黑树可能需要做多次旋转。Java 的 `ConcurrentSkipListMap` 就是基于跳表实现的并发有序 Map。

```java
// Java 标准库中的并发跳表
ConcurrentSkipListMap<String, Integer> map = new ConcurrentSkipListMap<>();
map.put("apple", 1);
map.put("banana", 2);
// 支持并发读写，天然线程安全
```

### 3. 分层跳表

在分布式系统中，可以将跳表的思想扩展到多机场景——不同层级存在不同机器上，实现分布式有序索引。

## 实际应用场景

1. **Redis ZSet**：有序集合的底层实现之一（当元素较多或元素为字符串时使用跳表）
2. **LevelDB / RocksDB**：MemTable 的实现使用跳表（`skiplist.h`）
3. **Java ConcurrentSkipListMap**：并发有序 Map
4. **Lucene**：搜索引擎中的某些索引结构

## 总结

```
跳表 = 有序链表 + 多级索引（随机化生长）

核心价值：
✅ O(log n) 的查找、插入、删除
✅ 天然支持范围查询
✅ 实现简单，比红黑树友好 10 倍
✅ 随机化保证期望性能，不需要复杂的旋转操作

一句话：
跳表就是"给链表装上电梯" 🛗
```

下次面试官问你 "Redis 的 ZSet 底层是什么？为什么用它？"，你可以侃侃而谈了 😎
