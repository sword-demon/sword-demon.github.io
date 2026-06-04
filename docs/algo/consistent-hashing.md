---
title: 一致性哈希
description: 一致性哈希（Consistent Hashing）
date: 2026-06-01 09:00:00
categories:
  - Algorithm
tags:
  - consistent-hashing
  - distributed-systems
  - hash-ring
sidebarSort: 35
---

# 一致性哈希（Consistent Hashing）

假设你是一个电商后端工程师，系统里有 3 台 Redis 缓存服务器。用户请求来了，你要决定把数据存到哪台机器上。最直觉的做法：取 hash(key) % 3，结果是 0 就存第 1 台，1 存第 2 台，2 存第 3 台。简单粗暴，对吧？

一开始运行得很好。直到有一天，流量暴涨，你加了一台服务器变成 4 台。问题来了——hash(key) % 3 变成了 hash(key) % 4，**几乎所有的 key 都会映射到新的机器上**。也就是说，原来存在 3 台机器上的缓存大面积失效，请求瞬间全部打到数据库上 💥。

这就是**取模哈希**的致命缺陷：**节点数一变，几乎所有数据都要重新映射**。

一致性哈希就是为了解决这个问题的：当节点增减时，只影响少量数据的映射，大部分数据纹丝不动。

## 原理拆解

### 核心思想：哈希环

一致性哈希的核心思路是**把整个哈希空间首尾相连，形成一个环**。

```
            0 (2^32 - 1)
           / \
          /   \
    节点A ●     ● 节点B
        /       \
       /         \
      |           |
       \         /
        \       /
         ●     ●
    节点D       节点C

    哈希环：0 ────────────────── 2^32 - 1
```

1. **节点映射**：对每个节点的标识（比如 IP 或名称）做哈希，映射到环上的某个位置
2. **数据映射**：对数据的 key 做哈希，也映射到环上
3. **顺时针查找**：数据从自己在环上的位置出发，**顺时针找到的第一个节点**，就是它应该存储的位置

```
哈希环（简化为 0~100）：

    位置: 0   10   20   30   40   50   60   70   80   90   100
          |    |    |    |    |    |    |    |    |    |    |
          └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘

    节点 A 在位置 10，节点 B 在位置 40，节点 C 在位置 70

    key = "user:1001"  → hash = 25  → 顺时针找 → 存到 B（位置 40）
    key = "user:1002"  → hash = 55  → 顺时针找 → 存到 C（位置 70）
    key = "user:1003"  → hash = 85  → 顺时针找 → 存到 A（位置 10，绕回来了）
```

### 为什么节点增减时影响小？

假设我们新增一个节点 D，映射到位置 55：

```
    节点: A(10)  B(40)  D(55)  C(70)

    key = "user:1001"  → hash = 25  → 还是存到 B ✅ 不受影响
    key = "user:1002"  → hash = 55  → 现在存到 D（原来是 C）⚠️ 受影响
    key = "user:1003"  → hash = 85  → 还是存到 A ✅ 不受影响
```

只有一小段区间（40~55 范围内的 key，原来属于 C，现在归 D）受影响。**大部分数据的映射关系完全没有变化**。这就是一致性哈希的精髓。

### 数据倾斜问题与虚拟节点

上面的例子看起来很美好，但实际生产中会遇到一个问题：**数据分布不均匀**。

如果 3 个节点在环上的位置恰好挤在一起，那某一台机器可能分到 80% 的数据，另外两台只分到 20%。极端情况下，所有数据都堆在一台机器上 😅。

解决方案就是**虚拟节点（Virtual Nodes）**：

- 每个物理节点不再只映射一个点，而是映射**多个虚拟节点**（比如 150 个）
- 物理节点 A 在环上变成 A#0, A#1, A#2, ..., A#149
- 数据先找到虚拟节点，再通过映射表找到真实物理节点

```
没有虚拟节点：                    有虚拟节点（每个物理节点 3 个虚拟节点）：

  A●                              A#0●    B#1●
                                    A#1●  C#0●
  B●                                 B#0●  A#2●
                                          C#1●  C#2●
  C●                                   B#2●

分布极不均匀！                     分布变得均匀多了 ✅
```

虚拟节点越多，数据分布越均匀。一般实际生产中设 **100~200 个虚拟节点**就足够了。

## 代码实现

### TypeScript 实现

```typescript
import { createHash } from "crypto";

/**
 * 一致性哈希环
 * 核心思路：用排序数组模拟哈希环，二分查找顺时针第一个节点
 */
class ConsistentHash {
  private ring: Map<number, string> = new Map(); // 哈希值 → 虚拟节点名
  private sortedKeys: number[] = [];              // 排序后的哈希值（模拟环）
  private replicas: number;                       // 每个物理节点的虚拟节点数
  private nodes: Set<string> = new Set();         // 物理节点集合

  constructor(replicas: number = 150) {
    this.replicas = replicas;
  }

  /**
   * 对字符串做哈希，返回一个 32 位无符号整数
   * 用 MD5 取前 4 字节，分布比较均匀
   */
  private hash(key: string): number {
    return createHash("md5").update(key).digest().readUInt32BE(0);
  }

  /**
   * 添加一个物理节点
   * 会创建 replicas 个虚拟节点分布在环上
   */
  addNode(node: string): void {
    if (this.nodes.has(node)) return;
    this.nodes.add(node);

    for (let i = 0; i < this.replicas; i++) {
      const virtualKey = `${node}#v${i}`;
      const hash = this.hash(virtualKey);
      this.ring.set(hash, node);
      this.sortedKeys.push(hash);
    }

    // 每次添加后重新排序，保持二分查找可用
    this.sortedKeys.sort((a, b) => a - b);
  }

  /**
   * 移除一个物理节点
   * 同时移除其所有虚拟节点
   */
  removeNode(node: string): void {
    if (!this.nodes.has(node)) return;
    this.nodes.delete(node);

    for (let i = 0; i < this.replicas; i++) {
      const virtualKey = `${node}#v${i}`;
      const hash = this.hash(virtualKey);
      this.ring.delete(hash);
    }

    // 重建排序数组
    this.sortedKeys = [...this.ring.keys()].sort((a, b) => a - b);
  }

  /**
   * 核心方法：给定一个 key，找到它应该映射到哪个物理节点
   * 思路：二分查找环上第一个 >= hash(key) 的位置
   *       如果没有（到环尾了），就绕回环的第一个节点
   */
  getNode(key: string): string {
    if (this.sortedKeys.length === 0) {
      throw new Error("No nodes in the hash ring");
    }

    const hash = this.hash(key);

    // 二分查找：找到第一个 >= hash 的位置
    let lo = 0;
    let hi = this.sortedKeys.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.sortedKeys[mid] < hash) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    // 如果找到了末尾，说明绕环一圈，回到第一个节点
    const idx = lo % this.sortedKeys.length;
    return this.ring.get(this.sortedKeys[idx])!;
  }

  /** 获取环上节点数量（含虚拟节点） */
  get size(): number {
    return this.sortedKeys.length;
  }
}

// ---- 使用示例 ----

const ch = new ConsistentHash(150);

// 添加 3 台服务器
ch.addNode("redis-01");
ch.addNode("redis-02");
ch.addNode("redis-03");

// 数据映射
console.log("user:1001 →", ch.getNode("user:1001")); // redis-02
console.log("user:1002 →", ch.getNode("user:1002")); // redis-01
console.log("user:1003 →", ch.getNode("user:1003")); // redis-03

// 模拟添加第 4 台服务器
ch.addNode("redis-04");

// 再次查询——大部分 key 的映射不变！
console.log("user:1001 →", ch.getNode("user:1001")); // 还是 redis-02 ✅
console.log("user:1002 →", ch.getNode("user:1002")); // 还是 redis-01 ✅
console.log("user:1003 →", ch.getNode("user:1003")); // 可能变了，也可能没变
```

### Python 实现

```python
import hashlib
from bisect import bisect_right
from typing import List, Optional


class ConsistentHash:
    """一致性哈希环"""

    def __init__(self, replicas: int = 150):
        self.replicas = replicas
        self.ring: dict[int, str] = {}        # 哈希值 → 物理节点名
        self.sorted_keys: List[int] = []       # 排序后的哈希值
        self.nodes: set[str] = set()           # 物理节点集合

    def _hash(self, key: str) -> int:
        """用 MD5 算哈希，取前 4 字节作为 32 位整数"""
        digest = hashlib.md5(key.encode()).digest()
        return int.from_bytes(digest[:4], "big")

    def add_node(self, node: str) -> None:
        """添加物理节点，创建 replicas 个虚拟节点"""
        if node in self.nodes:
            return
        self.nodes.add(node)

        for i in range(self.replicas):
            virtual_key = f"{node}#v{i}"
            h = self._hash(virtual_key)
            self.ring[h] = node
            self.sorted_keys.append(h)

        self.sorted_keys.sort()

    def remove_node(self, node: str) -> None:
        """移除物理节点及其所有虚拟节点"""
        if node not in self.nodes:
            return
        self.nodes.discard(node)

        for i in range(self.replicas):
            virtual_key = f"{node}#v{i}"
            h = self._hash(virtual_key)
            self.ring.pop(h, None)

        self.sorted_keys = sorted(self.ring.keys())

    def get_node(self, key: str) -> Optional[str]:
        """给定 key，顺时针找到最近的节点"""
        if not self.sorted_keys:
            return None

        h = self._hash(key)
        idx = bisect_right(self.sorted_keys, h)
        if idx == len(self.sorted_keys):
            idx = 0  # 绕回环首

        return self.ring[self.sorted_keys[idx]]


# ---- 使用示例 ----
ch = ConsistentHash(150)
ch.add_node("redis-01")
ch.add_node("redis-02")
ch.add_node("redis-03")

for uid in ["user:1001", "user:1002", "user:1003"]:
    print(f"{uid} → {ch.get_node(uid)}")

# 加一台服务器
ch.add_node("redis-04")
print("\n--- 加入 redis-04 后 ---")
for uid in ["user:1001", "user:1002", "user:1003"]:
    print(f"{uid} → {ch.get_node(uid)}")
```

## 复杂度分析

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| `addNode` | O(R log(N×R)) | R = 虚拟节点数，N = 物理节点数。每次插入 R 个虚拟节点并排序 |
| `removeNode` | O(N×R) | 需要重建 sortedKeys 数组 |
| `getNode` | O(log(N×R)) | 二分查找，很快 |

**空间复杂度**：O(N×R)，存储所有虚拟节点到环上。

在实际生产中，节点数 N 通常很小（几台到几十台），虚拟节点 R 设 150，所以总节点数也就几千个，查找非常快。

## 实际应用

### 1. 分布式缓存

最经典的应用场景。Memcached 集群、Redis Cluster 都用一致性哈希来做数据分片：

```
请求 → 负载均衡器 → 一致性哈希计算 → 路由到具体 Redis 节点
```

扩缩容时只迁移一小部分数据，不会"缓存雪崩"。

### 2. 分布式数据库分片

Cassandra、DynamoDB 等分布式数据库的**分区策略**底层就是一致性哈希。每个节点负责环上的一段区间，数据按 key 的哈希值落到对应的分区。

### 3. CDN 节点调度

当用户请求一个资源时，CDN 需要决定从哪个边缘节点拉取。一致性哈希可以保证同一个用户的请求总是打到同一个（或少数几个）节点，提高缓存命中率。

### 4. 负载均衡

Nginx 的 `hash` 负载均衡策略本质上就是一致性哈希的思想——同一个客户端 IP 总是路由到同一台后端服务器，适合需要 session 保持的场景。

## 取模哈希 vs 一致性哈希 vs 哈希槽

面试中经常会被问到这三者的区别，一张表讲清楚：

| 特性 | 取模哈希 (hash % N) | 一致性哈希 | 哈希槽 (Hash Slot) |
|------|-------------------|-----------|-------------------|
| 节点增减时 | 几乎全部 key 重新映射 | 只影响 1/N 的 key | 只影响迁移槽对应的 key |
| 数据均匀性 | 依赖哈希函数 | 需要虚拟节点 | 天然均匀（固定 16384 槽） |
| 实现复杂度 | 极简 | 中等 | 较复杂 |
| 代表系统 | 早期 Memcached | Cassandra, Dynamo | Redis Cluster |

Redis Cluster 用的就是**哈希槽**方案——固定 16384 个槽，每个节点负责一部分槽，扩缩容时只需迁移槽。它比一致性哈希更可控，但需要一个中心化的元数据服务来管理槽的分配。

## 注意事项与常见坑

### 1. 虚拟节点数的选择

虚拟节点太少 → 数据分布不均匀；太多 → 浪费内存和查找时间。经验值：

- 节点性能一致：每节点 **100~200** 个虚拟节点
- 节点性能不一：性能强的节点多分配虚拟节点（比如 4 核给 200 个，8 核给 400 个）

### 2. 哈希函数要够"散"

一致性哈希的效果高度依赖哈希函数的质量。如果哈希函数分布不均匀，再怎么加虚拟节点也没用。推荐用 **MD5、MurmurHash3** 等成熟方案。

### 3. 节点故障处理

一个节点挂了，它负责的区间会顺时针合并到下一个节点。如果那个节点也过载了，可能引发**雪崩**。解决方案：

- 设置**备份数**（每个 key 映射到环上连续的 N 个不同物理节点）
- 节点故障时自动将流量切到备用节点

## 总结

一致性哈希的核心思想可以浓缩成一句话：**把哈希空间做成一个环，让节点增减时只影响相邻区间**。

```
传统取模哈希：  hash % N     → N 变了 → 天翻地覆
一致性哈希：    hash ring    → N 变了 → 只动一点点
```

面试时记住三个关键点：

1. 🔵 **哈希环**：节点和数据都映射到环上，数据顺时针找最近节点
2. 🟢 **虚拟节点**：解决数据倾斜，让分布更均匀
3. 🟡 **最小迁移**：节点增减时只迁移 1/N 的数据，避免缓存雪崩

下次面试官问你"分布式缓存怎么做数据分片"的时候，你就可以自信地把一致性哈希讲出来了 ✌️
