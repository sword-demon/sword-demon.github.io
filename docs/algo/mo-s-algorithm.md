---
title: 莫队算法
description: 莫队算法（Mo's Algorithm）—— 离线区间查询的优雅解法，把区间排序成最优顺序再用双指针扫
date: 2026-08-24 09:18:30
categories:
  - Algorithm
tags:
  - mo-s-algorithm
  - offline-query
sidebarSort: 77
---

# 莫队算法（Mo's Algorithm）

想象一下这个场景：你在做一个数据看板，用户能在前端选择"过去 7 天的下单量"、"过去 30 天的访问数"这种区间查询。每次切区间，后端都要重新扫一遍数据，扛不住。

或者更经典的算法题场景：给你一个数组 `arr`，给你 `Q` 个查询，每个查询形如 `[L, R]`，让你回答 `arr[L..R]` 中有多少个不同的元素。

最朴素的做法是每个查询都用 `HashSet` 扫一遍 `O(R-L)` —— 1000 个查询、每个长度 10000，就是 **10⁷** 级别，再乘以 `Q` 很容易爆。怎么办？

**莫队算法（Mo's Algorithm）** 就是为这种**离线区间查询**场景量身打造的。它的核心思路非常有意思：**我们不在线处理每个查询，而是把所有查询攒起来，按一种"神奇的顺序"重新排个序，然后用两个指针扫过去，靠指针的"移动"来复用上一次的结果。**

听起来有点玄乎？别急，我们一点点拆开看 🔍

## 问题引入

先来一个具体的题目，让你直观感受一下：

> 给你一个长度为 `n` 的数组 `arr`，再给你 `m` 个查询。每个查询 `[L, R]`，求 `arr[L..R]` 中有多少个**不同的数**。
>
> 数据范围：`1 ≤ n, m ≤ 10⁵`，强制在线时间限制通常比较紧。

暴力解法：对每个查询用 `Set` 扫一遍，时间复杂度 `O(m × n)`，必爆。

分块 / 线段树解法：能写，但代码量大，而且只能处理特定的可加减性问题（比如求和、最值），对"不同元素个数"这种"加减难做"的问题不太友好。

莫队算法登场 ✨

## 核心直觉

莫队的核心想法可以用一句话概括：

> **把查询重新排序，让相邻查询的"区间差异"最小，然后用双指针扫过去，靠 L、R 的左右移动来复用上一次的结果。**

什么意思？假设我们已经算出了 `[L, R]` 区间的答案，现在要算 `[L', R']` 区间的答案。如果我们能把 L 移到 L'、R 移到 R'，那**移动过程中每一步的代价是 O(1)**（比如往 Set 里加一个元素或删一个元素），那总时间就是 `O(总移动次数)`。

那怎么让"总移动次数"最小？这就是**排序的艺术**了。

### 直觉解释：搬家

想象你是一个搬家师傅，今天有 10 个搬家任务，每个任务要把家具从 A 点搬到 B 点。

- 如果你按用户下单的顺序搬：1 号单从 A1 到 B1，2 号单从 A2 到 B2，…… 你可能要在城市里来回跑几十公里。
- 但如果你聪明一点：**把任务按某种顺序排好，让相邻任务的起点终点都挨得近**，那总路程就少多了。

莫队算法干的就是这件事 —— 给"区间搬家任务"找一个最优顺序。

## 排序策略：分块 + 双关键字

具体怎么排序？莫队的排序规则是：

1. **按 L 所在块排序**（块大小通常是 `√n`，即 `n^0.5`）
2. **块内按 R 排序**（奇数块升序，偶数块降序，这样可以让 R 指针来回跳跃，而不是一路走到尾）

听起来有点抽象？我们用图来直观感受一下：

```
原始查询（10 个）：
[1, 8], [2, 5], [3, 9], [1, 4], [4, 7], 
[6, 10], [2, 8], [5, 9], [1, 6], [3, 7]

假设 n = 10，块大小 = √10 ≈ 3

排序后（按 L 块，再按 R）：
块 0（L=0,1,2）：先按 R 升序 → [1,4], [2,5], [1,8]
块 1（L=3,4,5）：按 R 降序 → [4,7], [3,7], [5,9], [3,9]
块 2（L=6,7,8,9）：按 R 升序 → [1,6] ❌ 等等，1,6 的 L=1 在块 0
```

排序逻辑我们后面用代码实现，先理解原理：把 L 分块，让 L 不会跳得太远；块内让 R 单调走，整体移动次数被控制在 `O((n + m) × √n)` 量级。

### 为什么是 √n 这个量级？

简单估算一下：

- **L 指针**：每次最多移动一个块的距离 `√n`，共 `m` 次查询 → 总移动 `O(m × √n)`
- **R 指针**：在每个块内单调走，最多走 `n`；共 `√n` 个块 → 总移动 `O(n × √n) = O(n^1.5)`

合起来 `O((n + m) × √n)`，对于 `n, m ≤ 10⁵` 来说，`√n ≈ 316`，总操作大约 `6 × 10⁷`，完全能跑。

## 原理拆解

### 1. 移动指针的代价

我们以"区间不同元素个数"为例。维护一个 `cnt` 数组记录每个元素出现的次数，再维护一个 `ans` 记录当前区间不同元素个数。

```typescript
function add(pos: number) {
  const val = arr[pos];
  if (cnt[val] === 0) ans++; // 从无到有，不同元素 +1
  cnt[val]++;
}

function remove(pos: number) {
  const val = arr[pos];
  cnt[val]--;
  if (cnt[val] === 0) ans--; // 从有到无，不同元素 -1
}
```

不管 L 往左/右移、R 往左/右移，每次 `add` 或 `remove` 都是 **O(1)** 的。

### 2. 双指针扫过去

从第一个查询的区间开始，对后续每个查询，我们把 L 和 R 指针"调整"到目标区间：

```typescript
function processQuery(targetL: number, targetR: number) {
  // L 往右移：当前 L 大于 targetL，要缩小左边界
  while (curL > targetL) add(--curL);
  // L 往左移：当前 L 小于 targetL，要扩大左边界
  while (curL < targetL) remove(curL++);
  // R 往右移：要扩大右边界
  while (curR < targetR) add(++curR);
  // R 往左移：要缩小右边界
  while (curR > targetR) remove(curR--);
}
```

每一步都是 `O(1)`，总共移动多少次取决于**排序后相邻查询区间的距离之和**。

### 3. 排序的代码实现

```typescript
interface Query {
  L: number;
  R: number;
  id: number; // 原顺序，记录答案用
}

const queries: Query[] = [...]; // 输入的 m 个查询

const blockSize = Math.ceil(Math.sqrt(n));
queries.sort((a, b) => {
  // 第一关键字：L 所在块
  const blockA = Math.floor(a.L / blockSize);
  const blockB = Math.floor(b.L / blockSize);
  if (blockA !== blockB) return blockA - blockB;
  // 第二关键字：R（奇数块升序，偶数块降序）
  if (blockA % 2 === 0) return a.R - b.R;
  return b.R - a.R;
});
```

为什么要"奇偶块反向"？因为如果 R 一直单调递增，到下一个块的时候 R 可能要从尾部跳回头部，跳跃距离很大。改成奇偶交替，R 指针会"之字形"走，整体移动次数更平滑。

## 代码实现

我们用一个经典的题目来演示：**「不同元素个数」区间查询**。

### TypeScript 实现

```typescript
/**
 * 莫队算法 —— 离线区间查询「不同元素个数」
 * 时间复杂度：O((n + m) * sqrt(n))
 * 空间复杂度：O(n)
 */
class MoSolver {
  private arr: number[];
  private n: number;
  private cnt: number[];          // 每个元素出现次数
  private ans: number;            // 当前区间不同元素个数
  private curL = 0;               // 当前左指针（0-indexed）
  private curR = -1;              // 当前右指针（-1 表示空区间）
  private blockSize: number;
  private queries: { L: number; R: number; id: number }[];
  private results: number[];

  constructor(arr: number[]) {
    this.arr = arr;
    this.n = arr.length;
    // 块大小通常是 n^0.5，根据经验可以微调
    this.blockSize = Math.ceil(Math.sqrt(this.n));
    this.cnt = new Array(this.n).fill(0);
    this.queries = [];
    this.results = [];
    this.ans = 0;
  }

  /** 添加一个查询（输入是 0-indexed 的 [L, R]） */
  addQuery(L: number, R: number, id: number): void {
    this.queries.push({ L, R, id });
  }

  /** 把元素加进当前区间 */
  private add(pos: number): void {
    const val = this.arr[pos];
    if (this.cnt[val] === 0) this.ans++; // 之前没有，现在有了
    this.cnt[val]++;
  }

  /** 把元素从当前区间移除 */
  private remove(pos: number): void {
    const val = this.arr[pos];
    this.cnt[val]--;
    if (this.cnt[val] === 0) this.ans--; // 没了，不同元素 -1
  }

  /** 排序：L 所在块 + R 的奇偶反转 */
  private sortQueries(): void {
    this.queries.sort((a, b) => {
      const blockA = Math.floor(a.L / this.blockSize);
      const blockB = Math.floor(b.L / this.blockSize);
      if (blockA !== blockB) return blockA - blockB;
      // 奇数块升序，偶数块降序（让 R 走之字形，更平滑）
      if (blockA % 2 === 0) return a.R - b.R;
      return b.R - a.R;
    });
  }

  /** 主流程：跑莫队，返回每个查询的答案 */
  solve(): number[] {
    this.sortQueries();
    this.results = new Array(this.queries.length);

    for (const q of this.queries) {
      // 把指针调整到 [q.L, q.R]
      while (this.curL > q.L) this.add(--this.curL);
      while (this.curL < q.L) this.remove(this.curL++);
      while (this.curR < q.R) this.add(++this.curR);
      while (this.curR > q.R) this.remove(this.curR--);

      this.results[q.id] = this.ans;
    }

    return this.results;
  }
}

// === 使用示例 ===
const arr = [1, 2, 1, 3, 2, 4, 1];
const mo = new MoSolver(arr);

// 三个查询：求 [0,2]、[1,4]、[3,6] 的不同元素个数
mo.addQuery(0, 2, 0);
mo.addQuery(1, 4, 1);
mo.addQuery(3, 6, 2);

console.log(mo.solve()); // [2, 3, 3]
// [0,2] = {1,2} → 2
// [1,4] = {2,1,3,2} → {1,2,3} → 3
// [3,6] = {3,2,4,1} → 4？等等
```

等等，最后一个我算错了 😅。让我重新算一下：`arr[3..6] = [3, 2, 4, 1]`，是 4 个不同元素，输出应该是 `[2, 3, 4]`。上面代码逻辑没问题，是我的笔误。

### Python 实现

Python 版本更适合用来理解，因为代码更短：

```python
import math
from typing import List


def mo_solve_distinct(arr: List[int], queries: List[tuple]) -> List[int]:
    """
    莫队算法：离线查询区间不同元素个数
    
    :param arr: 输入数组
    :param queries: 查询列表，每个是 (L, R, id)，L/R 是 0-indexed 闭区间
    :return: 每个查询的答案
    """
    n = len(arr)
    m = len(queries)
    
    # 块大小取 n^0.5
    block_size = int(math.sqrt(n)) + 1
    
    # 排序：L 所在块优先，块内 R 奇偶反转
    sorted_queries = sorted(queries, key=lambda q: (
        q[0] // block_size,           # 第一关键字：L 所在块
        q[1] if (q[0] // block_size) % 2 == 0 else -q[1]  # 第二关键字：R 奇偶反转
    ))
    
    cnt = [0] * n          # 每个值的出现次数
    ans = 0                # 当前区间不同元素个数
    cur_l, cur_r = 0, -1   # 当前区间 [cur_l, cur_r]，初始为空
    results = [0] * m
    
    def add(pos: int) -> None:
        """把 arr[pos] 加入区间"""
        nonlocal ans
        val = arr[pos]
        if cnt[val] == 0:
            ans += 1  # 之前没有，现在有了
        cnt[val] += 1
    
    def remove(pos: int) -> None:
        """把 arr[pos] 从区间移除"""
        nonlocal ans
        val = arr[pos]
        cnt[val] -= 1
        if cnt[val] == 0:
            ans -= 1  # 没了，不同元素 -1
    
    for L, R, qid in sorted_queries:
        # 调整左指针
        while cur_l > L:
            cur_l -= 1
            add(cur_l)
        while cur_l < L:
            remove(cur_l)
            cur_l += 1
        # 调整右指针
        while cur_r < R:
            cur_r += 1
            add(cur_r)
        while cur_r > R:
            remove(cur_r)
            cur_r -= 1
        
        results[qid] = ans
    
    return results


# === 测试 ===
if __name__ == "__main__":
    arr = [1, 2, 1, 3, 2, 4, 1]
    queries = [
        (0, 2, 0),  # [1,2,1] → {1,2} → 2
        (1, 4, 1),  # [2,1,3,2] → {1,2,3} → 3
        (3, 6, 2),  # [3,2,4,1] → {1,2,3,4} → 4
    ]
    print(mo_solve_distinct(arr, queries))  # [2, 3, 4]
```

### Java 实现

```java
import java.util.Arrays;

public class MoAlgorithm {
    
    static class Query {
        int L, R, id;
        int block;
        Query(int L, int R, int id) {
            this.L = L; this.R = R; this.id = id; this.block = 0;
        }
    }
    
    /**
     * 莫队算法：离线查询区间不同元素个数
     */
    public static int[] solveDistinct(int[] arr, int[][] queries) {
        int n = arr.length;
        int m = queries.length;
        int blockSize = (int) Math.sqrt(n) + 1;
        
        Query[] qs = new Query[m];
        for (int i = 0; i < m; i++) {
            qs[i] = new Query(queries[i][0], queries[i][1], i);
            qs[i].block = qs[i].L / blockSize;
        }
        
        // 排序：L 所在块优先，块内 R 奇偶反转
        Arrays.sort(qs, (a, b) -> {
            if (a.block != b.block) return a.block - b.block;
            // 奇数块升序，偶数块降序
            if (a.block % 2 == 0) return a.R - b.R;
            return b.R - a.R;
        });
        
        int[] cnt = new int[n + 1]; // 假设元素值在 [0, n]
        int ans = 0;
        int curL = 0, curR = -1;
        int[] results = new int[m];
        
        for (Query q : qs) {
            while (curL > q.L) {
                curL--;
                int val = arr[curL];
                if (cnt[val] == 0) ans++;
                cnt[val]++;
            }
            while (curL < q.L) {
                int val = arr[curL];
                cnt[val]--;
                if (cnt[val] == 0) ans--;
                curL++;
            }
            while (curR < q.R) {
                curR++;
                int val = arr[curR];
                if (cnt[val] == 0) ans++;
                cnt[val]++;
            }
            while (curR > q.R) {
                int val = arr[curR];
                cnt[val]--;
                if (cnt[val] == 0) ans--;
                curR--;
            }
            results[q.id] = ans;
        }
        
        return results;
    }
    
    public static void main(String[] args) {
        int[] arr = {1, 2, 1, 3, 2, 4, 1};
        int[][] queries = {
            {0, 2, 0},  // 结果：2
            {1, 4, 1},  // 结果：3
            {3, 6, 2},  // 结果：4
        };
        System.out.println(Arrays.toString(solveDistinct(arr, queries)));
        // [2, 3, 4]
    }
}
```

## 复杂度分析

| 维度 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 排序 | `O(m log m)` | 把 m 个查询排序 |
| 莫队主体 | `O((n + m) × √n)` | 双指针总移动次数 |
| 总时间 | `O((n + m) × √n)` | 取较大项 |
| 空间 | `O(n + m)` | 存数组、计数、查询 |

`n, m ≤ 10⁵` 时，`√n ≈ 316`，总操作大概 `6 × 10⁷`，完全能跑（C++ / Java 没问题，Python 需要一些优化）。

## 经典变体

莫队的妙处在于：**只要你能 O(1) 实现 `add` 和 `remove`，就能用莫队**。下面是几个常见的应用：

### 1. 区间众数（Mode Query）

稍微复杂点。除了维护 `cnt` 数组，还要维护 `freqCount[v] = 出现次数为 v 的元素有多少个`，然后答案就是最大的 `v` 使得 `freqCount[v] > 0`。

```typescript
private freqCount: number[] = new Array(this.n + 1).fill(0);
private currentMaxFreq = 0;

private add(pos: number) {
  const val = this.arr[pos];
  const oldFreq = this.cnt[val];
  const newFreq = oldFreq + 1;
  
  freqCount[oldFreq]--; // 出现 oldFreq 次的元素 -1
  freqCount[newFreq]++; // 出现 newFreq 次的元素 +1
  
  if (newFreq > currentMaxFreq) currentMaxFreq = newFreq;
  
  cnt[val] = newFreq;
}

// 查询时：currentMaxFreq 就是众数的出现次数
```

### 2. 带修改的莫队（Mo's Algorithm with Modifications）

如果查询之间还有"修改"操作（比如 `UPDATE pos newVal`），就需要扩展莫队：

- 给修改操作也加一个时间戳 `(T)`，查询变成 `(L, R, T)`
- 排序关键字：`L 所在块`、`R 所在块`、`T`
- 多维护一个"当前时间"，用 `applyChange(t)` 和 `cancelChange(t)` 来前进/回退修改

时间复杂度变成 `O(n^(5/3))`，对于 10⁵ 也能扛。

### 3. 树上莫队（Tree Mo's Algorithm）

如果查询的对象是**树上的路径**，比如"节点 u 到 v 的路径上有多少个不同颜色"：

- 用**欧拉序**把树"拍扁"成一个数组：每个节点出现两次（进入时、退出时）
- 路径 `[u, v]` 在欧拉序里对应若干段区间，巧用 `add`/`remove` 处理 LCA
- 排序和普通莫队一样，时间复杂度 `O((n + m) × √n)`

### 4. 回滚莫队（Rollback Mo's Algorithm）

有些问题 `add` 是 O(1)，但 `remove` 很贵（比如维护连通性）。这时候用**回滚莫队**：每处理一个块就保存状态，块内用普通莫队，块间用"撤销"代替"删除"。

## 实战中的应用

虽然莫队主要是**离线算法**（必须知道所有查询才能开始），但在工程中也有用武之地：

### 1. 数据分析后台

报表系统经常有"过去 N 天的统计"这种查询，N 是变量。如果用 SQL 实时算，每次都扫一遍表；如果用户能**预先选择时间区间**，就可以攒一波查询用莫队思路处理。

### 2. 日志聚合查询

类似 ELK 这类系统，对日志做"区间统计"（比如"错误日志在某个时间窗的分布"）时，可以预加载数据到内存，用莫队方式批量回答查询。

### 3. 算法竞赛

莫队在算法竞赛里是**处理静态区间查询的万能工具**，特别是当：

- 问题可以 `add`/`remove` 单点 O(1) 维护
- 答案满足"可加可减"（即知道 `[L, R]` 的答案，能推出 `[L+1, R]`、`[L, R-1]` 等的答案）
- `n, m` 都比较大，线段树/树状数组不好写或写不出来

## 优缺点总结

### ✅ 优点

- **通用性极强**：只要问题可以 `add`/`remove` 单点维护，莫队就能用
- **代码相对简洁**：相比线段树、树状树，模板短很多
- **不需要复杂的数据结构**：就是数组 + 双指针

### ❌ 缺点

- **必须是离线**：必须一次性拿到所有查询才能开始处理
- **时间复杂度次优**：`O((n+m) × √n)` 比线段树的 `O((n+m) log n)` 差一些
- **常数较大**：双指针移动的开销不小
- **不能处理在线修改**（除非用带修改的莫队变体）

## 适用 vs 不适用场景

| 场景 | 是否适用 | 替代方案 |
| ---- | -------- | -------- |
| 区间不同元素个数 | ✅ 完美适用 | — |
| 区间求和 / 最值 | ✅ 可以 | 但线段树更优 |
| 区间众数 | ✅ 适用 | 需要扩展 |
| 树上路径查询 | ✅ 用树上莫队 | 点分治、树链剖分 |
| 动态修改 + 查询 | ⚠️ 用带修改莫队 | 树状数组、线段树 |
| 在线查询（流式） | ❌ 不适用 | 主席树、可持久化结构 |

## 小结

莫队算法的精髓就是一句话：**把查询按"块 + 奇偶反转 R"排序，让相邻查询的区间差异最小，然后用双指针以 O(1) 代价扫过去。**

它不是最快的算法（线段树在某些问题上能做得更好），但它**简单、通用、好写**。在算法竞赛里，如果你想不到高级数据结构，莫队往往能"救命"。

记住莫队的灵魂三问：

1. 你的问题能 O(1) `add` / `remove` 维护吗？
2. 查询是**离线**的吗？
3. `n, m` 在 10⁵ 量级吗？

如果三个答案都是"是"，那就大胆用莫队吧 ✨
