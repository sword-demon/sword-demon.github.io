---
title: B+树
description: B+树——数据库索引的秘密武器，详细图解插入、删除、查找操作
date: 2026-10-06 09:06:51
categories:
  - Algorithm
tags:
  - b-plus-tree
  - database-index
  - balanced-tree
  - disk-based-structure
  - interview
sidebarSort: 98
---

# B+树

你有没有想过，MySQL 的 `WHERE id = 12345` 为什么能在一张几千万行的表里，几毫秒就定位到那一条记录？光靠遍历的话，这得查到天荒地老。

答案就是 **B+树**——几乎所有关系型数据库（MySQL、PostgreSQL、Oracle）默认的索引结构。它专为磁盘设计，能在海量数据中快速定位目标，同时把磁盘 I/O 次数压到最低。

今天我们就来扒一扒 B+树的里里外外，看看它是怎么做到的 🪵

## 1. 为什么 MySQL 不用二叉树？

在聊 B+树之前，先回答一个问题：既然二叉搜索树（Binary Search Tree）查找是 O(log n)，而且实现简单，为什么数据库不用它？

**答案：磁盘 I/O。**

内存访问和磁盘访问的速度差了几万倍。一次磁盘 I/O 的耗时，大约能读 4 万条内存数据。所以数据库索引设计的核心目标，不是减少比较次数，而是**减少磁盘 I/O 次数**。

二叉树的每个节点最多只有两个子节点，树高 = log₂(n)。100 万条记录，树高大约 20。查询一条记录要访问 20 个节点 = 20 次磁盘 I/O。

而 B+树每个节点可以有很多子节点（比如 100 个），100 万条记录，树高只需要 **log₁₀₀(100万) ≈ 3**。查询只需要 3 次磁盘 I/O，性能直接起飞。

这就是 B+树的核心思想：**用更大的\"叉数\"换取更低的树高，从而减少磁盘访问**。

## 2. B+树的结构

### 2.1 一张图看明白

B+树是一种多路平衡查找树，每个节点可以有多个子节点和多个键值。结构如下：

```
                        [17 | 35 | 50]
                       /    |    |     \
            [5|10|13]  [17|28]  [35|42]  [50|60|80]
             /    \      |     /    \       |      \
          ...     ...   ...   ...   ...    ...     ...
```

实际上，B+树分为**内部节点**（只存键和指针）和**叶子节点**（存所有数据）两部分：

```
                         根节点/内部节点
                    [30]            [60]            [90]
                   /    \          /    \          /    \
          [10|20]  [30|40|50]  [60|70|80]  [90|100|120]   ...
             |        |    |      |     |       |      |
         叶子节点   叶子节点  叶子节点  叶子节点  叶子节点 ...
            ||        ||      ||      ||       ||
          数据页    数据页   数据页   数据页    数据页
```

### 2.2 B+树的两个关键规则

1. **所有数据都存在叶子节点中**，内部节点只存索引（键）
2. **叶子节点之间用双向链表连接**，便于范围查询

对比 B 树的区别：

| 特征 | B 树 | B+树 |
|------|------|------|
| 内部节点存数据 | ✅ 是 | ❌ 否 |
| 叶子节点存全部数据 | ❌ 否 | ✅ 是 |
| 叶子节点链表 | ❌ 无 | ✅ 有 |
| 查询稳定性 | 可能在内部节点命中 | 每次都要查到叶子 |

B+树的查询永远是 O(log n) 到根节点 + O(1) 到叶子 = 稳定的 O(log n)，不会像 B 树那样有时候在浅层就找到。

## 3. 查找过程

### 3.1 单值查询：`WHERE id = 42`

```
目标：在根节点找 42

步骤：
1. 根节点：[30 | 60 | 90]
   42 > 30，不大于 60 → 走第二个子节点（中间那个）
   
2. 中间节点：[30|40|50|60|70|80]（假设是内部节点）
   42 在 40 和 50 之间 → 走 42 对应的子节点

3. 叶子节点：找到 42，对应数据在磁盘页 7
4. 加载页 7，返回完整行数据
```

### 3.2 范围查询：`WHERE id BETWEEN 30 AND 60`

这才是 B+树的秀场！借助叶子节点的链表：

```
1. 先找到 30 所在的叶子节点（定位入口）
2. 从该叶子节点开始，沿着链表往后遍历：
   叶子节点1: 30 ✓ → 继续
   叶子节点1: 35 ✓ → 继续
   叶子节点1: 42 ✓ → 继续
   叶子节点2: 55 ✓ → 继续
   叶子节点2: 60 ✓ → 范围终点，停止
   
整个过程不需要回溯到父节点，纯链表遍历！
```

这就是 B+树在关系型数据库中如此重要的原因——**范围查询是数据库的 main use case，而 B+树的链表结构让范围查询几乎零成本**。

## 4. 插入操作

### 4.1 插入过程

B+树的插入稍微复杂一点，因为涉及到节点分裂。

**规则**：当节点满（超过 capacity）时，分裂成两个节点。

假设每个节点最多存 4 个键（实际通常是 1200 左右，这里用小数字方便图示）。

**初始状态**（一个空 B+树，插入顺序：10, 20, 30, 50, 60, 70, 80, 90）

```
步骤 1-2：插入 10, 20 → 叶子节点: [10, 20]
步骤 3：插入 30 → 叶子节点: [10, 20, 30]
步骤 4：插入 50 → 叶子节点: [10, 20, 30, 50]  ← 满了
步骤 5：插入 60 → 触发分裂！
```

**分裂过程**：

```
分裂前叶子节点: [10, 20, 30, 50, 60]  （5个键，假设max=4）
分裂后:
  左节点: [10, 20, 30]        （前一半）
  右节点: [50, 60]            （后一半）
  中间值 50 升级到父节点

结果:
              [50]
             /    \
    [10,20,30]    [50,60]
```

### 4.2 递归分裂

如果父节点也满了呢？继续分裂，递归向上。这会导致树高增加，但保证了平衡性。

```
分裂传播:
叶子节点满 → 分裂 → 中间值上浮父节点
         ↓
    父节点满 → 分裂 → 中间值上浮祖父节点
         ↓
    根节点满 → 分裂 → 树高+1，根节点换成两个节点的父节点
```

根节点分裂是树高增加的唯一方式。所以 B+树总是从底部向上生长，不会像 AVL 树那样频繁旋转。

## 5. 删除操作

删除比插入更麻烦，因为可能触发节点合并。

**规则**：当节点低于最小填充度（通常 50%）时，需要合并或借用。

### 5.1 直接删除

如果删除后节点仍然 >= 最小填充度，直接删除即可。

### 5.2 借节点（Borrow）

相邻兄弟节点有富余，从兄弟那里借一个键过来，同时父节点的键要下来一个。

```
删除前:
              [30|50]
             /    |    \
    [10,20]    [30,40]    [50,60,70]
    
删除 20（叶子节点 [10] 低于最小填充度）:
              [30|50]
             /    |    \
    [10]        [30,40]    [50,60,70]
                  
向左兄弟借 10（父节点 30 下沉）:
              [30|50]
             /    |    \
    [10,30]    [40]    [50,60,70]
```

### 5.3 合并节点

如果左右兄弟都不够借，就把当前节点和其中一个兄弟合并，父节点相应地下来一个键。

```
合并前:
              [50]
             /    \
    [10,20,30]    [50,60,80]
    
删除 50 之后（叶子节点 [50,60] 低于最小填充度）:
              [50]              ← 删除后变空
             /    \
    [10,20,30]    [60,80]
    
合并: 把 [50] 和 [60,80] 合并成 [50,60,80]
最终:
         [10,20,30,50,60,80]  ← 变成新的叶子节点（根节点下移一层）
```

## 6. 代码实现

### TypeScript

```typescript
/**
 * B+树 —— TypeScript 实现（简化版，便于理解核心逻辑）
 * 
 * 核心设计：
 * - 每个节点最多 MAX_KEYS 个键，最多 MAX_KEYS+1 个子节点指针
 * - 内部节点存键（索引）和子节点指针
 * - 叶子节点存键和数据指针，叶子节点之间用双向链表连接
 */
class BPlusTree {
  private readonly MAX_KEYS: number;      // 每个节点最大键数
  private readonly MIN_KEYS: number;      // 每个节点最小键数（用于判断合并/借用）
  private root: BPlusNode;                // 根节点

  constructor(maxKeys: number = 4) {
    this.MAX_KEYS = maxKeys;
    this.MIN_KEYS = Math.ceil(maxKeys / 2) - 1; // 50% 填充度
    this.root = new LeafNode(maxKeys);
  }

  /** 插入键值对 */
  insert(key: number, value: string): void {
    const [newKey, leftNode, rightNode] = this.root.insert(key, value);
    
    // 如果返回值不为空，说明根节点分裂了，需要创建新根
    if (newKey !== null) {
      const newRoot = new InternalNode(this.MAX_KEYS);
      newRoot.children = [leftNode, rightNode];
      newRoot.keys = [newKey];
      this.root = newRoot;
    }
  }

  /** 查找单个键对应的值 */
  search(key: number): string | null {
    return this.root.search(key);
  }

  /** 范围查询：返回 [start, end] 区间内的所有值 */
  rangeQuery(start: number, end: number): string[] {
    return this.root.rangeQuery(start, end);
  }
}

/** B+树节点基类 */
abstract class BPlusNode {
  protected keys: number[];      // 键（有序）
  protected maxKeys: number;

  constructor(maxKeys: number) {
    this.maxKeys = maxKeys;
    this.keys = [];
  }

  /** 插入键值对，返回值用于处理分裂 */
  abstract insert(key: number, value: string): [number | null, BPlusNode | null, BPlusNode | null];

  /** 查找单个键 */
  abstract search(key: number): string | null;

  /** 范围查询 */
  abstract rangeQuery(start: number, end: number): string[];

  /** 键数量是否超过最大 */
  protected isFull(): boolean {
    return this.keys.length >= this.maxKeys;
  }

  /** 键数量是否低于最小 */
  protected isUnderfilled(): boolean {
    return this.keys.length < this.MIN_KEYS;
  }
}

/** 内部节点（存索引键和子节点指针） */
class InternalNode extends BPlusNode {
  children: BPlusNode[];  // 子节点指针，比键多一个

  constructor(maxKeys: number) {
    super(maxKeys);
    this.children = [];
  }

  insert(key: number, value: string): [number | null, BPlusNode | null, BPlusNode | null] {
    // 找到 key 应该落在哪个子节点区间
    let childIndex = this.findChildIndex(key);
    const [newKey, leftChild, rightChild] = this.children[childIndex].insert(key, value);

    // 如果子节点没分裂，直接返回
    if (newKey === null) {
      return [null, null, null];
    }

    // 子节点分裂了，需要把 newKey 插入到当前节点
    this.keys.splice(childIndex, 0, newKey);
    this.children[childIndex] = leftChild!;
    this.children.splice(childIndex + 1, 0, rightChild!);

    // 检查是否需要分裂当前节点
    if (this.isFull()) {
      return this.split();
    }

    return [null, null, null];
  }

  /** 找到 key 应该落在 children 的哪个区间 */
  private findChildIndex(key: number): number {
    let i = 0;
    while (i < this.keys.length && key >= this.keys[i]) {
      i++;
    }
    return i;
  }

  /** 分裂当前节点 */
  private split(): [number, BPlusNode, BPlusNode] {
    const mid = Math.floor(this.keys.length / 2);
    const midKey = this.keys[mid];

    // 左半部分
    const leftNode = new InternalNode(this.maxKeys);
    leftNode.keys = this.keys.slice(0, mid);
    leftNode.children = this.children.slice(0, mid + 1);

    // 右半部分
    const rightNode = new InternalNode(this.maxKeys);
    rightNode.keys = this.keys.slice(mid + 1);
    rightNode.children = this.children.slice(mid + 1);

    return [midKey, leftNode, rightNode];
  }

  search(key: number): string | null {
    const childIndex = this.findChildIndex(key);
    return this.children[childIndex].search(key);
  }

  rangeQuery(start: number, end: number): string[] {
    const childIndex = this.findChildIndex(start);
    return this.children[childIndex].rangeQuery(start, end);
  }
}

/** 叶子节点（存键值对，用双向链表连接） */
class LeafNode extends BPlusNode {
  private values: string[];    // 与 keys 一一对应的值
  next: LeafNode | null;        // 下一个叶子节点（链表）
  prev: LeafNode | null;        // 前一个叶子节点（链表）

  constructor(maxKeys: number) {
    super(maxKeys);
    this.values = [];
    this.next = null;
    this.prev = null;
  }

  insert(key: number, value: string): [number | null, BPlusNode | null, BPlusNode | null] {
    // 找到插入位置（保持 keys 有序）
    let insertIndex = 0;
    while (insertIndex < this.keys.length && this.keys[insertIndex] < key) {
      insertIndex++;
    }

    // 如果 key 已存在，更新值
    if (insertIndex < this.keys.length && this.keys[insertIndex] === key) {
      this.values[insertIndex] = value;
      return [null, null, null];
    }

    // 插入新键值对
    this.keys.splice(insertIndex, 0, key);
    this.values.splice(insertIndex, 0, value);

    // 检查是否需要分裂
    if (this.isFull()) {
      return this.split();
    }

    return [null, null, null];
  }

  /** 分裂叶子节点 */
  private split(): [number, BPlusNode, BPlusNode] {
    const mid = Math.floor(this.keys.length / 2);

    // 左半部分
    const leftNode = new LeafNode(this.maxKeys);
    leftNode.keys = this.keys.slice(0, mid);
    leftNode.values = this.values.slice(0, mid);

    // 右半部分
    const rightNode = new LeafNode(this.maxKeys);
    rightNode.keys = this.keys.slice(mid);
    rightNode.values = this.values.slice(mid);

    // 维护链表指针
    rightNode.next = this.next;
    rightNode.prev = leftNode;
    if (this.next) {
      (this.next as LeafNode).prev = rightNode;
    }
    leftNode.next = rightNode;

    // 中间键上浮（但叶子节点的键是重复的，父节点只存一份）
    return [rightNode.keys[0], leftNode, rightNode];
  }

  search(key: number): string | null {
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i] === key) {
        return this.values[i];
      }
    }
    return null;
  }

  rangeQuery(start: number, end: number): string[] {
    const result: string[] = [];
    let current: LeafNode | null = this;

    while (current !== null) {
      for (let i = 0; i < current.keys.length; i++) {
        if (current.keys[i] >= start && current.keys[i] <= end) {
          result.push(current.values[i]);
        } else if (current.keys[i] > end) {
          return result; // 已经超出范围，链表继续往后只会更大
        }
      }
      current = current.next;
    }

    return result;
  }
}

// 使用示例
const bpt = new BPlusTree(4);

// 插入一些数据
bpt.insert(10, "用户10");
bpt.insert(20, "用户20");
bpt.insert(30, "用户30");
bpt.insert(50, "用户50");
bpt.insert(60, "用户60");
bpt.insert(70, "用户70");
bpt.insert(80, "用户80");
bpt.insert(90, "用户90");

// 单值查询
console.log(bpt.search(30)); // "用户30"
console.log(bpt.search(40)); // null

// 范围查询
console.log(bpt.rangeQuery(25, 65)); // ["用户30", "用户50", "用户60"]
```

### Python

```python
"""
B+树 —— Python 实现（简化版）
核心：每个节点最多 MAX_KEYS 个键，内部节点存键和子节点指针，
      叶子节点存键值对，叶子节点之间用双向链表连接
"""
from __future__ import annotations
from typing import List, Optional, Tuple, Any


class BPlusTree:
    """B+树主类"""

    def __init__(self, max_keys: int = 4):
        self.MAX_KEYS = max_keys
        self.MIN_KEYS = max_keys // 2  # 最小键数（实际实现中通常是 ceil(max/2)-1）
        self.root: BPlusNode = LeafNode(max_keys)

    def insert(self, key: int, value: Any) -> None:
        """插入键值对"""
        new_key, left_node, right_node = self.root.insert(key, value)

        # 根节点分裂 → 创建新根
        if new_key is not None:
            new_root = InternalNode(self.MAX_KEYS)
            new_root.keys = [new_key]
            new_root.children = [left_node, right_node]
            self.root = new_root

    def search(self, key: int) -> Optional[Any]:
        """单值查询"""
        return self.root.search(key)

    def range_query(self, start: int, end: int) -> List[Any]:
        """范围查询 [start, end]"""
        return self.root.range_query(start, end)


class BPlusNode:
    """B+树节点基类"""

    def __init__(self, max_keys: int):
        self.max_keys = max_keys
        self.keys: List[int] = []

    def is_full(self) -> bool:
        return len(self.keys) >= self.max_keys

    def insert(self, key: int, value: Any) -> Tuple[Optional[int], Optional[BPlusNode], Optional[BPlusNode]]:
        raise NotImplementedError

    def search(self, key: int) -> Optional[Any]:
        raise NotImplementedError

    def range_query(self, start: int, end: int) -> List[Any]:
        raise NotImplementedError


class InternalNode(BPlusNode):
    """内部节点（存索引键和子节点指针）"""

    def __init__(self, max_keys: int):
        super().__init__(max_keys)
        self.children: List[BPlusNode] = []

    def insert(self, key: int, value: Any) -> Tuple[Optional[int], Optional[BPlusNode], Optional[BPlusNode]]:
        # 找到 key 应该落在哪个子节点
        child_idx = self._find_child_index(key)
        new_key, left_child, right_child = self.children[child_idx].insert(key, value)

        # 子节点没分裂
        if new_key is None:
            return None, None, None

        # 把从子节点带上来的 new_key 插入当前节点
        self.keys.insert(child_idx, new_key)
        self.children[child_idx] = left_child
        self.children.insert(child_idx + 1, right_child)

        # 检查是否需要分裂当前节点
        if self.is_full():
            return self._split()

        return None, None, None

    def _find_child_index(self, key: int) -> int:
        """二分查找 key 应该落在哪个子节点区间"""
        lo, hi = 0, len(self.keys)
        while lo < hi:
            mid = (lo + hi) // 2
            if self.keys[mid] <= key:
                lo = mid + 1
            else:
                hi = mid
        return lo

    def _split(self) -> Tuple[int, BPlusNode, BPlusNode]:
        """分裂当前节点，返回 (上浮键, 左节点, 右节点)"""
        mid = len(self.keys) // 2
        mid_key = self.keys[mid]

        # 左半部分
        left = InternalNode(self.max_keys)
        left.keys = self.keys[:mid]
        left.children = self.children[:mid + 1]

        # 右半部分
        right = InternalNode(self.max_keys)
        right.keys = self.keys[mid + 1:]
        right.children = self.children[mid + 1:]

        return mid_key, left, right

    def search(self, key: int) -> Optional[Any]:
        child_idx = self._find_child_index(key)
        return self.children[child_idx].search(key)

    def range_query(self, start: int, end: int) -> List[Any]:
        child_idx = self._find_child_index(start)
        return self.children[child_idx].range_query(start, end)


class LeafNode(BPlusNode):
    """叶子节点（存键值对，双向链表连接）"""

    def __init__(self, max_keys: int):
        super().__init__(max_keys)
        self.values: List[Any] = []
        self.next: Optional[LeafNode] = None
        self.prev: Optional[LeafNode] = None

    def insert(self, key: int, value: Any) -> Tuple[Optional[int], Optional[BPlusNode], Optional[BPlusNode]]:
        # 找到插入位置
        insert_idx = 0
        while insert_idx < len(self.keys) and self.keys[insert_idx] < key:
            insert_idx += 1

        # key 已存在，更新值
        if insert_idx < len(self.keys) and self.keys[insert_idx] == key:
            self.values[insert_idx] = value
            return None, None, None

        # 插入新键值对
        self.keys.insert(insert_idx, key)
        self.values.insert(insert_idx, value)

        # 检查是否需要分裂
        if self.is_full():
            return self._split()

        return None, None, None

    def _split(self) -> Tuple[int, BPlusNode, BPlusNode]:
        """分裂叶子节点"""
        mid = len(self.keys) // 2

        # 左叶子
        left = LeafNode(self.max_keys)
        left.keys = self.keys[:mid]
        left.values = self.values[:mid]

        # 右叶子
        right = LeafNode(self.max_keys)
        right.keys = self.keys[mid:]
        right.values = self.values[mid:]

        # 维护双向链表
        right.next = self.next
        right.prev = left
        if self.next:
            self.next.prev = right
        left.next = right

        # 叶子分裂时，把右叶子的第一个键上浮到父节点
        return right.keys[0], left, right

    def search(self, key: int) -> Optional[Any]:
        for i, k in enumerate(self.keys):
            if k == key:
                return self.values[i]
        return None

    def range_query(self, start: int, end: int) -> List[Any]:
        result = []
        current: Optional[LeafNode] = self

        while current is not None:
            for i, k in enumerate(current.keys):
                if start <= k <= end:
                    result.append(current.values[i])
                elif k > end:
                    return result  # 链表后面只会更大
            current = current.next

        return result


# 使用示例
if __name__ == "__main__":
    bpt = BPlusTree(max_keys=4)

    # 插入数据
    for i in [10, 20, 30, 50, 60, 70, 80, 90]:
        bpt.insert(i, f"value_{i}")

    # 单值查询
    print(bpt.search(30))   # value_30
    print(bpt.search(40))   # None

    # 范围查询
    print(bpt.range_query(25, 65))  # ['value_30', 'value_50', 'value_60']
```

## 7. 复杂度分析

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 单值查询 | O(log n) | 树高 = log_{m}(n)，m 是叉数 |
| 范围查询 | O(log n + k) | log n 定位起点，k 是结果数量 |
| 插入 | O(log n) | 查找位置 + 可能触发节点分裂 |
| 删除 | O(log n) | 查找位置 + 可能触发合并/借节点 |

**空间复杂度**：O(n)，n 是键值对数量。每个键值对只存在一个地方（叶子节点）。

**磁盘 I/O 次数**：B+树的真正优势所在！

假设：
- 磁盘页大小 = 16KB
- 每个键占 8 字节，每个指针占 8 字节
- 每个内部节点最多可存：16KB / 16B = 1024 个条目
- 根节点常驻内存

| 数据量 | 树高（m=1024） | 最坏磁盘 I/O |
|--------|---------------|-------------|
| 1 万条 | 2 | 2 次 |
| 100 万条 | 3 | 3 次 |
| 10 亿条 | 4 | 4 次 |

4 次磁盘 I/O 就能在 10 亿条记录里定位到任意一行，这就是 B+树被数据库选中的核心原因。

## 8. 实际应用场景

### 8.1 数据库索引

MySQL InnoDB 的主键索引就是一颗 B+树。叶节点存储完整的行数据（聚簇索引）。辅助索引（如 `WHERE age = 25`）的叶子节点存主键值，查询时需要先在辅助索引树找到主键，再去主键索引树回表。

这就是为什么 **主键越短越好**——同样的页大小，能装更多键，树高更低，I/O 更少。

### 8.2 文件系统索引

NTFS、XFS、ext4 等文件系统都用 B+树（或其变体）来管理元数据，实现文件的快速定位。

### 8.3 键值存储

LevelDB、RocksDB 等 LSM 树存储引擎的 SSTable 内部也用 B+树做索引层。

## 9. 小结

B+树是一个为**磁盘量身定制**的数据结构，它的每一步设计都在权衡 CPU 计算和磁盘 I/O：

- **多叉设计** → 降低树高 → 减少磁盘访问
- **数据只在叶子** → 查询稳定 → 不会有中间节点命中导致的额外 I/O  
- **叶子链表** → 范围查询极快 → 数据库的 main use case 完美适配

面试时如果你能说清楚 B+树 vs B树、B+树为什么适合磁盘、MySQL InnoDB 索引结构，我敢说面试官会对你刮目相看 👍

下篇文章见！
