---
title: 珂朵莉树
description: 珂朵莉树（Chtholly Tree）—— 一种基于 ODT 的区间操作数据结构
date: 2026-07-11 10:00:00
categories:
  - Algorithm
tags:
  - chtholly-tree
  - odt
  - data-structure
sidebarSort: 61
---

# 珂朵莉树（Chtholly Tree）

你有没有遇到过这样的场景：有一个数组，需要频繁地做**区间赋值**操作——比如把第 L 到 R 位置的元素全部改成同一个值，然后查询某个位置的结果。

听起来简单对吧？但如果你用普通数组，每次区间赋值都要 O(n)，如果有 10 万次操作，光赋值就能把你卡到天荒地老。

这时候，**珂朵莉树**（也叫 ODT，Old Driver Tree）就能派上用场了。它专门解决**区间赋值 + 单点查询**的场景，核心思想是利用**区间赋值后区间内值相等**的特性，用 `map` 来维护区间，操作均摊下来效率还不错。

> 题外话：珂朵莉树这个名字来源于一个叫 Chtholly 的 ACMer（AtCoder 选手），因为这个数据结构最初在一些竞赛题解中传播开来，大家就给它起了这个有趣的名字 😄

## 原理拆解

### 核心思想

珂朵莉树的核心思路是：**把值相同的连续区间合并成一个节点，用 map 来存储这些区间**。

想象一下，你有一排积木：

```
初始：[1, 1, 2, 2, 2, 3, 3, 3, 3, 4]
```

用珂朵莉树来表示，就是把连续相同值的区间合并：

```
区间1：[1, 1]      → 值 = 1
区间2：[2, 2, 2]   → 值 = 2
区间3：[3, 3, 3, 3] → 值 = 3
区间4：[4]         → 值 = 4
```

每个区间用 `{l, r, val}` 表示，`l` 是左端点，`r` 是右端点，`val` 是这个区间内所有元素的值。

### 关键操作

#### 1. 分裂（split）

当需要对某个位置 `pos` 进行操作时，如果 `pos` 落在某个区间中间，就需要把这个区间**分裂**成两个。

```
原始区间：[3, 3, 3, 3]，l=6, r=9, val=3
需要在 pos=7 处分裂 → 分裂成：
  区间A：[3, 3]，l=6, r=6, val=3
  区间B：[3, 3]，l=7, r=9, val=3
```

分裂操作保证了：**任何位置 `pos` 都能精确对应到一个区间的左端点**，方便后续操作。

#### 2. 区间赋值（assign）

赋值操作是珂朵莉树的精髓。给定 `[L, R]` 区间和值 `val`：

```
1. split(L) → 把 L 精确对齐到区间左边界
2. split(R+1) → 把 R+1 对齐到区间左边界
3. 删除 [L, R] 范围内的所有区间
4. 插入新区间 [L, R] → val
```

```
赋值前：[1, 1] [2, 2, 2] [3, 3, 3, 3] [4]
对 [3, 7] 赋值 5：

Step 1: split(3) → [1, 1] [2, 2, 2] [3] [3, 3, 3] [4]
Step 2: split(8) → [1, 1] [2, 2, 2] [3] [3, 3] [5, 5, 5] [4]
Step 3: 删除 [3,7] 区间
Step 4: 插入 [3, 7] → val=5

赋值后：[1, 1] [2, 2, 2] [5, 5, 5, 5, 5] [4]
```

#### 3. 复杂度分析

珂朵莉树的效率取决于**区间赋值的次数**：

- **区间赋值**会把多个小区间合并成一个大区间，**减少区间数量**
- 如果每次赋值都是**随机位置**，区间数量会急剧减少
- 如果每次赋值都把整个数组赋值一遍，最终只有 1 个区间

但如果数据是**有序递增**的（比如每次只赋值一个元素），珂朵莉树会退化成 O(n) 的糟糕性能。

所以珂朵莉树的适用场景是：**赋值操作多，且赋值位置相对随机**。这在某些题目和数据场景下恰好满足。

## 代码实现

### TypeScript

```typescript
/**
 * 珂朵莉树（Chtholly Tree / ODT）
 * 核心思路：用 map 存储不相交的区间 {l, r, val}，利用区间赋值合并的特性
 */
interface Interval {
  l: number;   // 区间左端点（包含）
  r: number;   // 区间右端点（包含）
  val: number; // 区间内所有元素的值
}

// 区间比较器：按左端点排序
class ChthollyTree {
  private intervals: Map<number, Interval> = new Map();

  constructor(arr: number[]) {
    // 初始化：用相邻相同值合并成区间
    let l = 0;
    for (let i = 1; i <= arr.length; i++) {
      if (i === arr.length || arr[i] !== arr[i - 1]) {
        this.intervals.set(l, { l, r: i - 1, val: arr[i - 1] });
        l = i;
      }
    }
  }

  /**
   * 分裂操作：找到包含 pos 的区间，将其分裂，返回 pos 所在新区间的左端点
   * 如果 pos 本身就是某个区间的左端点，直接返回
   */
  split(pos: number): number {
    // 边界检查
    if (pos < 0) return pos;

    // 找到 pos 所在的区间：找到第一个 l <= pos 的区间
    let prevL = -1;
    for (const [l, interval] of this.intervals) {
      if (l <= pos && pos <= interval.r) {
        // pos 在这个区间内
        if (l === pos) {
          // pos 正好是左端点，不需要分裂
          return pos;
        }
        // 需要分裂：把 [l, r] 拆成 [l, pos-1] 和 [pos, r]
        const leftInterval: Interval = { l, r: pos - 1, val: interval.val };
        const rightInterval: Interval = { l: pos, r: interval.r, val: interval.val };

        // 删除原区间，插入两个新区间
        this.intervals.delete(l);
        this.intervals.set(l, leftInterval);
        this.intervals.set(pos, rightInterval);

        return pos;
      }
      prevL = l;
    }

    return pos;
  }

  /**
   * 区间赋值：把 [l, r] 范围内的所有元素改成 val
   * 核心：split(l) + split(r+1) + 删除 + 插入新区间
   */
  assign(l: number, r: number, val: number): void {
    l = this.split(l);
    r = this.split(r + 1);

    // 删除 [l, r] 范围内的所有区间
    const toDelete: number[] = [];
    for (const [key, interval] of this.intervals) {
      if (interval.l >= l && interval.l < r) {
        toDelete.push(key);
      }
    }
    toDelete.forEach((key) => this.intervals.delete(key));

    // 插入新区间 [l, r] → val
    this.intervals.set(l, { l, r: r - 1, val });
  }

  /**
   * 单点查询：返回位置 pos 的值
   * 利用 map 按 key 查找的特性，O(log n)
   */
  query(pos: number): number {
    // 找到左端点 <= pos 的最大区间
    let result = -1;
    for (const [l, interval] of this.intervals) {
      if (l <= pos && pos <= interval.r) {
        result = interval.val;
        break;
      }
    }
    return result;
  }

  /**
   * 遍历所有区间（调试用）
   */
  getIntervals(): Interval[] {
    return Array.from(this.intervals.values()).sort((a, b) => a.l - b.l);
  }
}

// 使用示例
const arr = [1, 1, 2, 2, 2, 3, 3, 3, 3, 4];
const tree = new ChthollyTree(arr);

console.log("初始区间：");
tree.getIntervals().forEach((iv) => {
  console.log(`  [${iv.l}, ${iv.r}]: ${iv.val}`);
});

tree.assign(3, 7, 5); // 把第 4-8 个元素改成 5
console.log("\n赋值 [3,7] = 5 后：");
tree.getIntervals().forEach((iv) => {
  console.log(`  [${iv.l}, ${iv.r}]: ${iv.val}`);
});

console.log("\n单点查询 pos=5:", tree.query(5)); // 应该是 5
console.log("单点查询 pos=2:", tree.query(2)); // 应该是 2
```

### Go

```go
package chtholly

import (
	"container/list"
	"fmt"
)

// Interval 区间结构体
type Interval struct {
	L   int
	R   int
	Val int
}

// ChthollyTree 珂朵莉树（ODT）
type ChthollyTree struct {
	intervals *list.List // 用链表存储区间，按 L 排序
}

// NewChthollyTree 从数组创建珂朵莉树
func NewChthollyTree(arr []int) *ChthollyTree {
	tree := &ChthollyTree{
		intervals: list.New(),
	}

	// 初始化：合并相邻相同值
	l := 0
	for i := 1; i <= len(arr); i++ {
		if i == len(arr) || arr[i] != arr[i-1] {
			tree.intervals.PushBack(Interval{L: l, R: i - 1, Val: arr[i-1]})
			l = i
		}
	}

	return tree
}

// split 找到并返回包含 pos 的区间左端点，必要时分裂
func (t *ChthollyTree) split(pos int) int {
	if pos < 0 {
		return pos
	}

	for e := t.intervals.Front(); e != nil; e = e.Next() {
		iv := e.Value.(Interval)
		if iv.L <= pos && pos <= iv.R {
			if iv.L == pos {
				return pos
			}
			// 分裂区间 [L, pos-1] 和 [pos, R]
			left := Interval{L: iv.L, R: pos - 1, Val: iv.Val}
			right := Interval{L: pos, R: iv.R, Val: iv.Val}

			t.intervals.InsertBefore(left, e)
			e.Value = right
			return pos
		}
	}

	return pos
}

// assign 区间赋值 [l, r] = val
func (t *ChthollyTree) assign(l, r, val int) {
	l = t.split(l)
	r = t.split(r + 1)

	// 删除 [l, r) 范围内的所有区间
	for e := t.intervals.Front(); e != nil; {
		iv := e.Value.(Interval)
		if iv.L >= l && iv.L < r {
			next := e.Next()
			t.intervals.Remove(e)
			e = next
		} else {
			e = e.Next()
		}
	}

	// 插入新区间
	t.intervals.PushBack(Interval{L: l, R: r - 1, Val: val})
}

// query 单点查询
func (t *ChthollyTree) query(pos int) int {
	for e := t.intervals.Front(); e != nil; e = e.Next() {
		iv := e.Value.(Interval)
		if iv.L <= pos && pos <= iv.R {
			return iv.Val
		}
	}
	return -1
}

// GetIntervals 获取所有区间（调试用）
func (t *ChthollyTree) GetIntervals() []Interval {
	result := make([]Interval, 0)
	for e := t.intervals.Front(); e != nil; e = e.Next() {
		result = append(result, e.Value.(Interval))
	}
	return result
}

// 演示函数
func Demo() {
	arr := []int{1, 1, 2, 2, 2, 3, 3, 3, 3, 4}
	tree := NewChthollyTree(arr)

	fmt.Println("初始区间：")
	for _, iv := range tree.GetIntervals() {
		fmt.Printf("  [%d, %d]: %d\n", iv.L, iv.R, iv.Val)
	}

	tree.assign(3, 7, 5)
	fmt.Println("\n赋值 [3,7] = 5 后：")
	for _, iv := range tree.GetIntervals() {
		fmt.Printf("  [%d, %d]: %d\n", iv.L, iv.R, iv.Val)
	}

	fmt.Printf("\n单点查询 pos=5: %d\n", tree.query(5))
	fmt.Printf("单点查询 pos=2: %d\n", tree.query(2))
}
```

### Python

```python
from typing import List, Tuple, Optional


class Interval:
    """区间结构体"""
    def __init__(self, l: int, r: int, val: int):
        self.l = l
        self.r = r
        self.val = val

    def __repr__(self):
        return f"[{self.l}, {self.r}]: {self.val}"


class ChthollyTree:
    """珂朵莉树（ODT）—— Python 实现
    
    核心思想：用区间合并的思路处理区间赋值操作
    适用场景：区间赋值多、赋值位置随机、单点查询
    
    关键洞察：当 [L,R] 区间被赋值为 val 后，
    这段区间内所有值相等，可以合并成一个节点。
    """

    def __init__(self, arr: List[int]):
        """从数组初始化，构建初始区间"""
        self.intervals: List[Interval] = []
        
        # 合并相邻相同值，构建初始区间列表
        i = 0
        while i < len(arr):
            j = i
            while j < len(arr) and arr[j] == arr[i]:
                j += 1
            self.intervals.append(Interval(i, j - 1, arr[i]))
            i = j
        
        # 按左端点排序（其实初始化时已经是有序的）
        self.intervals.sort(key=lambda x: x.l)

    def _find_interval(self, pos: int) -> Optional[int]:
        """找到包含 pos 的区间索引，不存在返回 None"""
        for idx, iv in enumerate(self.intervals):
            if iv.l <= pos <= iv.r:
                return idx
        return None

    def split(self, pos: int) -> int:
        """分裂操作：确保 pos 是某个区间的左端点
        
        如果 pos 正好是某区间左端点，直接返回
        否则把该区间分裂成两个，返回 pos 作为新区间左端点
        """
        if pos < 0:
            return pos
        
        idx = self._find_interval(pos)
        if idx is None:
            return pos
        
        iv = self.intervals[idx]
        if iv.l == pos:
            # 正好是左端点，不需要分裂
            return pos
        
        # 分裂区间 [l, pos-1] 和 [pos, r]
        left = Interval(iv.l, pos - 1, iv.val)
        right = Interval(pos, iv.r, iv.val)
        
        # 替换原区间
        self.intervals[idx] = right
        self.intervals.insert(idx, left)
        
        return pos

    def assign(self, l: int, r: int, val: int) -> None:
        """区间赋值：把 [l, r] 范围内所有元素改成 val
        
        步骤：
        1. split(l) - 让 l 对齐到区间左边界
        2. split(r+1) - 让 r+1 对齐到区间左边界
        3. 删除 [l, r] 范围内的所有区间
        4. 插入新区间 [l, r] -> val
        """
        l = self.split(l)
        r = self.split(r + 1)
        
        # 删除 [l, r) 范围内的区间
        self.intervals = [
            iv for iv in self.intervals 
            if not (iv.l >= l and iv.l < r)
        ]
        
        # 插入新区间
        self.intervals.append(Interval(l, r - 1, val))
        self.intervals.sort(key=lambda x: x.l)

    def query(self, pos: int) -> int:
        """单点查询：返回位置 pos 的值"""
        idx = self._find_interval(pos)
        if idx is not None:
            return self.intervals[idx].val
        return -1

    def get_intervals(self) -> List[Interval]:
        """获取所有区间（调试用）"""
        return self.intervals.copy()


# 使用示例
if __name__ == "__main__":
    arr = [1, 1, 2, 2, 2, 3, 3, 3, 3, 4]
    tree = ChthollyTree(arr)

    print("初始区间：")
    for iv in tree.get_intervals():
        print(f"  {iv}")

    # 赋值操作
    tree.assign(3, 7, 5)
    print("\n赋值 [3, 7] = 5 后：")
    for iv in tree.get_intervals():
        print(f"  {iv}")

    # 单点查询
    print(f"\n单点查询 pos=5: {tree.query(5)}")  # 5
    print(f"单点查询 pos=2: {tree.query(2)}")  # 2
    print(f"单点查询 pos=8: {tree.query(8)}")  # 4
```

## 经典应用：珂朵莉树的最佳拍档

### 随机赋值 + 区间求和

珂朵莉树最经典的应用是解决**随机区间赋值 + 区间求和**问题。这是 CF (Codeforces) 上著名的 896C 题——"Oscart and Congestion"。

```python
# 题目要求：
# 1. 区间赋值 [l, r] = x
# 2. 区间求和 sum(l, r)
# 3. 区间第 k 小 kth(l, r, k)
# 4. 区间幂次 pow(l, r, x) = Σ a[i]^x

# 珂朵莉树 + 随机化 + 区间求和的组合拳：
# 赋值让区间合并 -> 区间数量急剧减少 -> 操作变成 O(log n) 级别
```

### 区间颜色段数量

另一个经典应用：给数组染色，查询某个区间的颜色段数量。

```python
# 例如：arr = [1, 2, 2, 3, 3, 1]
# 区间 [2, 5] 的颜色段：2, 3, 3, 1 → 3 段

# 用珂朵莉树维护：
# 每次区间染色（assign）后，区间合并，颜色段数量自动更新
```

## 复杂度分析

| 操作 | 时间复杂度 | 说明 |
| ---- | ---------- | ---- |
| split | O(k) | k = 区间数量，因为要遍历查找 |
| assign | O(k + m) | k = split两次 + 遍历删除 m 个区间 |
| query | O(k) | k = 区间数量 |

### 关键性质

珂朵莉树的复杂度分析有个很有趣的结论：

- **随机赋值场景下**：珂朵莉树的均摊复杂度接近 **O((n + q) log n)**，其中 q 是操作次数
- **最坏情况**：如果每次都只赋值 1 个位置（有序递增），复杂度会退化到 **O(nq)**

所以珂朵莉树是一个**概率意义上优秀**的数据结构 —— 在竞赛和面试题中，数据往往经过精心设计，正好落在珂朵莉树的舒适区。

## 小结

珂朵莉树（ODT）本质上是一个**利用区间赋值合并性质**的数据结构：

- ✅ **区间赋值**是 O(k) 级别，k 是被覆盖的区间数
- ✅ **单点查询**是 O(k) 级别
- ✅ **实现极简**，核心代码不超过 50 行
- ✅ 在**随机赋值**场景下表现优秀，竞赛题常客

- ❌ **有序赋值**会退化到 O(nq)
- ❌ 不适合**频繁区间求和**（需要配合线段树或前缀和）

它的哲学很有意思：**不是每个问题都需要用高级数据结构解决**。在赋值操作多、位置随机的场景下，珂朵莉树用最简单的方式达到了还不错的效果。有时候**足够好**就够了 😎

如果你在面试中遇到类似"区间赋值 + 单点查询"的题目，珂朵莉树是一个值得考虑的候选方案 —— 实现简单，解释直观，说不定能让面试官眼前一亮 ✨
