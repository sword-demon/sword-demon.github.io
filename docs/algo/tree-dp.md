---
title: 树形 DP 精讲（Tree DP）
description: 从「为什么树上的问题要开两个状态」讲起，一篇打通树形 DP 的通用模板、选点型（打家劫舍 III）、路径型（树的直径 / 最大路径和）、树形背包、换根 DP 与树上差分，附 TypeScript / Go / Python 三语言实现、图解与随机对拍
date: 2026-10-31 09:00:24
categories:
  - Algorithm
tags:
  - tree-dp
  - dynamic-programming
  - rerooting
  - data-structure
  - interview
sidebarSort: 120
---

# 树形 DP 精讲（Tree DP）

先说个我面试时真实翻过的车。

题目：*一棵二叉树，每个节点有权值，选一批互不相邻的节点，最大权值和是多少？*

我脑子里的 DP 立刻就蹦出来了 —— 线性版打家劫舍嘛，`dp[i] = max(dp[i-1], dp[i-2] + nums[i])`，套上去就行了。

写完我一交，面试官盯着我的代码看了五秒钟，说：

> "你这个 `dp` 数组下标是什么？"

我说 `i` 是节点编号。

他说："**那你告诉我，`dp[2]` 代表什么？**"

……

那一刻我意识到，线性 DP 的思维惯性有多可怕。**在线性结构上，状态可以按位置排成一维数组；在树上，状态必须挂在节点上。** 我硬生生把一棵没有"顺序"的树塞进了一维数组里。

后来我把这题重做了一遍，又顺手把树形 DP 的几大分支全捋了一遍：选点型、路径型、树形背包、换根 DP、树上差分。今天咱们一次讲完 ✨

---

## 一、先把概念钉死

### 1.1 树形 DP 和线性 DP 到底差在哪

| | 线性 DP | 树形 DP |
|---|---|---|
| 结构 | 数组 / 字符串 | 树 |
| 状态存放位置 | `dp[i]`，一维数组 | 挂在**节点**上，每个节点一组状态 |
| 转移方向 | 从左到右 | 从叶子到根（**后序遍历**） |
| 依赖关系 | `dp[i]` 只依赖 `dp[i-1]`、`dp[i-2]` | `dp[u]` 依赖所有孩子 `dp[v]` |
| 状态数量 | 通常 1~2 个 | 通常 2 个起步，复杂题能到 O(n) 个 |

**核心差别就一句话：线性 DP 是一条链，状态可以顺序传递；树形 DP 是一个分叉图，状态要"向上汇总"。**

### 1.2 为什么是"后序遍历"

因为 `dp[u]` 需要**先知道所有孩子的答案**，才能算自己的答案。这天然要求一个"孩子先、父亲后"的顺序 —— 也就是后序遍历。

```
        u            遍历顺序：
       / \           1. 左子树全部算完
      v   w      →   2. 右子树全部算完
     / \   \           3. 最后才算 u 自己
    a   b   c
```

递归写法里，这个顺序是白送的：

```typescript
function dfs(u) {
  const L = dfs(u.left);   // 先算左孩子
  const R = dfs(u.right);  // 再算右孩子
  // 然后用 L、R 算 u 的答案
}
```

### 1.3 通用模板：把"两个状态"记成一对返回值

树形 DP 最容易劝退人的地方，是状态定义总是"既像又不像"——既要记录"选"，又要记录"不选"，写成两个函数就烦了。

**技巧：让 DFS 返回一个元组。** 每个节点返回一组状态，调用方拿数组下标访问。

```typescript
// 返回 [不选的答案, 选的答案]
function dfs(u: Node | null): [number, number] {
  if (!u) return [0, 0];
  const [lSkip, lTake] = dfs(u.left);
  const [rSkip, rTake] = dfs(u.right);
  // ...
}
```

这个套路在所有"选点型"树形 DP 里都是一样的，只有里面的转移公式会变。**先背模板，再填公式。**

### 1.4 树形 DP 的三大分支

| 分支 | 状态含义 | 代表题 |
|---|---|---|
| **选点型** | 节点选 / 不选 | 打家劫舍 III（LC 337） |
| **路径型** | 从子树往上传一条"链" | 树的直径（LC 543）、最大路径和（LC 124） |
| **规模型** | dp[k] = 选 k 个的最优值 | 树形背包 |
| **换根型** | 每个节点都要一个答案 | 树中距离之和（LC 834） |
| **统计型** | 统计路径覆盖次数 | 树上差分 |

分类不是为了背，是为了**帮你快速判断该写几个状态**。下面挨个拆。

---

## 二、选点型：打家劫舍 III（LeetCode 337）

### 2.1 问题描述

- 树的节点值代表金额
- 偷了某个节点，**它的直接父子节点都不能偷**
- 求最大能偷多少

```
        3
       / \
      2   3
       \   \
        3   1
```

### 2.2 状态定义与转移

**关键洞察**：节点 `u` 的答案，取决于"偷不偷 u"，而这会**改变孩子的可选集合**。所以状态必须把"偷 / 不偷"拆开。

```
dp[u] = [不偷 u 的最大值, 偷 u 的最大值]
```

转移：

```
不偷 u：孩子偷不偷都行，各取最优
  skip(u) = max(rob(left), skip(left)) + max(rob(right), skip(right))

偷 u：两个孩子必须不偷
  take(u) = u.val + skip(left) + skip(right)
```

**最终答案**：`max(skip(root), take(root))`。

### 2.3 图解：一步步推

```
        3
       / \
      2   3
       \   \
        3   1

从叶子往上算：

叶子 3（2 的右孩子）： rob=3, skip=0  → (0, 3)   ← [skip, rob]
叶子 1（3 的右孩子）： rob=1, skip=0  → (0, 1)

节点 2：
  rob  = 2 + skip(左) + skip(右) = 2 + 0 + 0 = 2
  skip = max(rob(左),skip(左)) + max(rob(右),skip(右))
       = max(0,0) + max(3,0) = 0 + 3 = 3
  → (3, 2)

节点 3（右边那个）：
  rob  = 3 + 0 + 0 = 3
  skip = max(0,0) + max(1,0) = 0 + 1 = 1
  → (1, 3)

根节点 3：
  rob  = 3 + skip(2) + skip(3) = 3 + 3 + 1 = 7
  skip = max(3,2) + max(3,1) = 3 + 3 = 6
  → (6, 7)

答案 = max(6, 7) = 7
```

拆开说人话：偷根 3 → 两个孩子都不能偷 → 只能去偷孙子辈的 3 和 1 → `3 + 3 + 1 = 7` ✅

### 2.4 ⚠️ 一个必须知道的坑

网上流传的"隔层偷"直觉是错的。看这个例子：

```
        4
       /
      1
     /
    2
   /
  3
```

如果老老实实"隔一个偷一个"，能拿到 `4 + 2 = 6` 或者 `1 + 3 = 4`。但**最优解是 `4 + 3 = 7`** —— 中间隔了两层！

因为 `4` 和 `3` 之间的唯一约束是"不能偷直接父子"，`4` 和 `3` 并没有父子关系。**所以千万别用"层数奇偶"这种贪心直觉。**

### 2.5 代码实现

#### TypeScript

```typescript
interface TreeNode {
  val: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
}

/**
 * 打家劫舍 III —— 树形 DP 的"Hello World"
 *
 * 状态：dfs(u) 返回 [不偷 u 的最大值, 偷 u 的最大值]
 * 转移：
 *   skip = max(lSkip, lTake) + max(rSkip, rTake)
 *   take = u.val + lSkip + rSkip
 * 复杂度：时间 O(n)，空间 O(h)（递归栈，h 为树高）
 */
export function rob(root: TreeNode | null): number {
  const dfs = (u: TreeNode | null): [number, number] => {
    if (!u) return [0, 0];

    const [lSkip, lTake] = dfs(u.left);
    const [rSkip, rTake] = dfs(u.right);

    const skip = Math.max(lSkip, lTake) + Math.max(rSkip, rTake);
    const take = u.val + lSkip + rSkip;
    return [skip, take];
  };

  const [skip, take] = dfs(root);
  return Math.max(skip, take);
}
```

> 为什么不是 `dfs(u.left)` 返回两个值然后解构？
> 因为**解构本身就是按位置取状态**，`[lSkip, lTake]` 里第一个是"不偷"，第二个是"偷"。这个顺序一旦写反，全盘皆错。**建议在代码里写个注释固定住顺序。**

#### Python

```python
from typing import Optional, Tuple


class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:
        def dfs(u: Optional[TreeNode]) -> Tuple[int, int]:
            """返回 (不偷 u 的最大值, 偷 u 的最大值)"""
            if not u:
                return (0, 0)
            l_skip, l_take = dfs(u.left)
            r_skip, r_take = dfs(u.right)
            skip = max(l_skip, l_take) + max(r_skip, r_take)
            take = u.val + l_skip + r_skip
            return (skip, take)

        skip, take = dfs(root)
        return max(skip, take)
```

#### Go

```go
package treedp

// TreeNode 二叉树节点
type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// rob 打家劫舍 III
// 返回值第一个元素是不偷当前节点的最优值，第二个是偷当前节点的最优值
func rob(root *TreeNode) int {
	skip, take := dfs(root)
	if take > skip {
		return take
	}
	return skip
}

// dfs 返回 [不偷 u 的最大值, 偷 u 的最大值]
func dfs(u *TreeNode) (int, int) {
	if u == nil {
		return 0, 0
	}
	lSkip, lTake := dfs(u.Left)
	rSkip, rTake := dfs(u.Right)

	skip := max(lSkip, lTake) + max(rSkip, rTake)
	take := u.Val + lSkip + rSkip
	return skip, take
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
```

---

## 三、路径型：树的直径（LeetCode 543）

### 3.1 问题与思路

**树的直径**：树上最长路径的边数。

```
        1
      /   \
     2     3
    / \   / \
   4   5 6   7
```

最长路径是 `5 → 2 → 1 → 3 → 6`，经过 **4 条边**。

### 3.2 状态定义：只往上返一条链

路径型 DP 和选点型的区别在于**返回值的语义**：

- 选点型返回"两个方案的最优值"
- 路径型返回"**从我出发向下延伸的最长链长度**"（一条，不是两条）

```
depth(u) = 以 u 为起点、向下延伸的最长链的节点数（或边数）
```

### 3.3 转移：答案在"拐弯"的那一刻产生

```
        u
       / \
      L   R

两条链在 u 处拼成一条路径：depth(L) + depth(R)
但每个节点只能出现一次，所以只能各取一条链 —— 这正是 depth 的定义
```

```
depth(u) = 1 + max(depth(L), depth(R))     ← 往上传的链
答案    = max(答案, depth(L) + depth(R))   ← 拐弯的路径
```

**两个要点：**

1. **答案要维护成一个全局变量**，而不是从 DFS 返回值里拿。因为最优路径不一定经过根节点。
2. **往上传的链只能取一边**（`max`），因为一条链不能分叉。这是路径型和选点型最本质的区别。

### 3.4 图解

```
        1
      /   \
     2     3
    / \   / \
   4   5 6   7

算 depth(4) = 1, depth(5) = 1, depth(6) = 1, depth(7) = 1

节点 2：
  往上传：1 + max(1, 1) = 2
  拐弯：  depth(4) + depth(5) = 1 + 1 = 2  → 答案 = 2

节点 3：
  往上传：1 + max(1, 1) = 2
  拐弯：  1 + 1 = 2  → 答案还是 2

节点 1：
  往上传：1 + max(2, 2) = 3
  拐弯：  depth(2) + depth(3) = 2 + 2 = 4  → 答案 = 4 ✅

答案 4 对应路径 5→2→1→3→6
```

### 3.5 代码实现

#### TypeScript

```typescript
/**
 * 树的直径 —— LeetCode 543
 *
 * 状态：depth(u) = 以 u 为起点向下延伸的最长链长度
 * 转移：depth(u) = 1 + max(depth(L), depth(R))
 *       答案更新：depth(L) + depth(R)
 *
 * 注意：答案用闭包变量维护，因为最优路径不一定经过根
 */
export function diameterOfBinaryTree(root: TreeNode | null): number {
  let best = 0;

  const depth = (u: TreeNode | null): number => {
    if (!u) return 0;
    const l = depth(u.left);
    const r = depth(u.right);
    // 在 u 处"拐弯"：左边一条链 + 右边一条链
    best = Math.max(best, l + r);
    // 往上传：只能选一边，否则路径就分叉了
    return 1 + Math.max(l, r);
  };

  depth(root);
  return best;
}
```

#### Python

```python
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        best = 0

        def depth(u: Optional[TreeNode]) -> int:
            nonlocal best
            if not u:
                return 0
            l = depth(u.left)
            r = depth(u.right)
            # 在 u 处拐弯
            if l + r > best:
                best = l + r
            # 往上传只能取一边
            return 1 + max(l, r)

        depth(root)
        return best
```

---

## 四、路径型进阶：最大路径和（LeetCode 124）

### 4.1 问题

求二叉树中任意一条路径的最大和（路径不要求过根）。

官方例题输入 `[-10,9,20,null,null,15,7]`，对应这棵树：

```
       -10
      /    \
     9      20
           /  \
          15   7
```

输出 **42**，对应路径 `15 → 20 → 7`（15 + 20 + 7 = 42）。

> 注意 LeetCode 层序数组里的 `null` 是怎么对应位置的：`[-10, 9, 20, null, null, 15, 7]` 里，根的左孩子是 9，右孩子是 20；9 的两个孩子都是 `null`（所以 9 是叶子）；20 的两个孩子是 15 和 7。
>
> 这就是层序数组的规矩：**`null` 也要占一个位置**。新手最容易在这里把树画错。

### 4.2 和直径几乎一样，只多了一个 `max(0, ...)`

```
gain(u) = u.val + max(0, gain(L)) + max(0, gain(R))     ← 更新全局答案
返回：u.val + max(max(0, gain(L)), max(0, gain(R)))      ← 往上传
```

**为什么多了 `max(0, ...)`？**

因为权值可以是负数。如果左边那条链的贡献是负的，**把它砍掉比留着更划算**。而直径不需要 —— 直径要的是长度，负长度不成立。

这是路径型 DP 的通用套路：**只要权值可能为负，就要考虑"要不要这段"。**

### 4.3 完整图解

```
       -10
      /    \
     9      20
           /  \
          15   7

叶子 15：gain(15) = 15，候选答案 = 15
叶子 7 ：gain(7)  = 7， 候选答案 = 7

节点 20：
  候选答案 = 20 + max(0,15) + max(0,7) = 20 + 15 + 7 = 42   ← 当前最优
  往上传   = 20 + max(15, 7) = 35

节点 9（叶子）：
  候选答案 = 9
  往上传   = 9

节点 -10：
  候选答案 = -10 + max(0,9) + max(0,35) = -10 + 9 + 35 = 34
  往上传   = -10 + max(9, 35) = 25

答案 = max(15, 7, 42, 9, 34) = 42  ✅
```

**关键点**：最优路径 `15 → 20 → 7` 在节点 20 处"拐弯"，**根本没经过根节点 -10**。这就是为什么答案必须用全局变量维护，不能只看根的返回值。

### 4.4 代码实现

#### TypeScript

```typescript
/**
 * 二叉树中的最大路径和 —— LeetCode 124
 *
 * 状态：gain(u) = 以 u 为起点、向下延伸的最大路径和（可只含 u 自己）
 * 转移：答案候选 = u.val + max(0, gain(L)) + max(0, gain(R))
 *       往上传   = u.val + max(max(0, gain(L)), max(0, gain(R)))
 *
 * 为什么有 max(0, ...)：权值可能为负，负贡献的分支应该砍掉
 */
export function maxPathSum(root: TreeNode | null): number {
  let best = -Infinity; // 注意不能用 0！全负数的树答案可能是 -3

  const gain = (u: TreeNode | null): number => {
    if (!u) return 0;
    const l = Math.max(0, gain(u.left));
    const r = Math.max(0, gain(u.right));
    // 在 u 处拐弯：左链 + 右链 + 自己
    best = Math.max(best, u.val + l + r);
    // 往上传：只能取一边
    return u.val + Math.max(l, r);
  };

  gain(root);
  return best;
}
```

#### Python

```python
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = float("-inf")

        def gain(u: Optional[TreeNode]) -> int:
            nonlocal best
            if not u:
                return 0
            l = max(0, gain(u.left))
            r = max(0, gain(u.right))
            best = max(best, u.val + l + r)
            return u.val + max(l, r)

        gain(root)
        return int(best)
```

---

## 五、树形背包：选 k 个点（依赖型）

### 5.1 问题模型

这是树形 DP 里最常见的**工程模型**：

- 有一棵组织架构树，每个节点是一个"资源"
- 选一个节点，必须先选它的祖先（**依赖关系**）
- 预算/名额是 k，问最多能拿到多少价值

```
        0        (根, 价值 0)
      /   \
     1     2      (价值 1, 2)
    / \    /
   3   4  5       (价值 3, 4, 5)
```

规则：选 `5` 必须先选 `2` 和 `0`；选 `3` 必须先选 `1` 和 `0`。

### 5.2 状态定义

```
dp[u][k] = 在 u 的子树里选 k 个点的最大价值，且 u 必须被选
```

**注意"u 必须被选"这个约束。** 正是它保证了"选后代必选祖先"。

### 5.3 转移：逐个合并孩子

这是背包的标准套路 —— 把每个孩子当成一个"分组"来合并。

```
初始化（只考虑 u 自己）：
  dp[u][1] = value[u]
  dp[u][0] = 0        ← 0 表示"什么都不选"，但这是另一个分支

合并孩子 v：
  new[i + j] = max(new[i + j], dp[u][i] + dp[v][j])
  条件：i >= 1 或 j == 0
```

**为什么要 `i >= 1 或 j == 0` 这个条件？**

因为如果 `i == 0`（没选 u）却选了 `j > 0` 个 v 子树里的点，就违反了"选后代必选祖先"。**这是树形背包最容易翻车的地方。**

最终答案：`max(dp[root][0..k])`。

### 5.4 代码实现

#### TypeScript

```typescript
/**
 * 树形背包 —— 祖先依赖型
 *
 * 状态：dp[u][k] = u 的子树里选 k 个点的最大价值，且 u 必须被选
 * 合并：new[i+j] = max(new[i+j], dp[u][i] + dp[v][j])，其中 i>=1 或 j==0
 *
 * 复杂度：时间 O(n · K²)，空间 O(n · K)（最坏情况下）
 */
export function treeKnapsack(root: TreeNode | null, K: number): number {
  const NEG = -Infinity;

  const dfs = (u: TreeNode | null): number[] => {
    if (!u) return [0];

    // 初始：只考虑 u 自己。dp[0]=0 表示不选任何点，dp[1]=value[u]
    let dp: number[] = [0, u.val];

    for (const child of [u.left, u.right]) {
      const cd = dfs(child);
      const maxLen = Math.min(K, dp.length - 1 + cd.length - 1);
      const next: number[] = new Array(maxLen + 1).fill(NEG);

      for (let i = 0; i < dp.length; i++) {
        for (let j = 0; j < cd.length; j++) {
          const total = i + j;
          if (total > K) continue;
          // 没选 u 却选了 u 的后代 → 非法
          if (i === 0 && j > 0) continue;
          next[total] = Math.max(next[total], dp[i] + cd[j]);
        }
      }
      dp = next;
    }
    return dp;
  };

  const res = dfs(root);
  let best = 0;
  for (let i = 0; i < Math.min(K + 1, res.length); i++) {
    best = Math.max(best, res[i]);
  }
  return best;
}
```

> **复杂度警告**：树上每个节点都做一次 O(K²) 的合并，所以是 **O(n·K²)**。当 n 和 K 都到 10⁴ 时就是 10¹² —— 跑不动。
>
> 实际工程里的优化叫**"依赖背包的 DFS 序优化"**：把树按 DFS 序展开成一条序列，问题变成"在 DFS 序上选 k 个连续段"，复杂度降到 O(n·K)。但这个技巧实现起来不简单，面试一般不会问，工程上遇到再学。

#### Python

```python
class Solution:
    def treeKnapsack(self, root: Optional[TreeNode], K: int) -> int:
        NEG = float("-inf")

        def dfs(u: Optional[TreeNode]) -> list:
            if not u:
                return [0]
            # dp[k]: 在 u 的子树里选 k 个点（u 必选）的最大价值
            dp = [0, u.val]
            for child in (u.left, u.right):
                cd = dfs(child)
                max_len = min(K, len(dp) - 1 + len(cd) - 1)
                nxt = [NEG] * (max_len + 1)
                for i in range(len(dp)):
                    for j in range(len(cd)):
                        total = i + j
                        if total > K:
                            continue
                        # 没选 u 却选了后代 → 非法
                        if i == 0 and j > 0:
                            continue
                        if dp[i] + cd[j] > nxt[total]:
                            nxt[total] = dp[i] + cd[j]
                dp = nxt
            return dp

        res = dfs(root)
        best = 0
        for i in range(min(K + 1, len(res))):
            best = max(best, res[i])
        return int(best)
```

---

## 六、换根 DP：每个节点都要一个答案（LeetCode 834）

### 6.1 问题描述

给定一棵 n 个节点的树，返回数组 `answer`，其中 `answer[i]` 是节点 i 到所有其他节点的距离之和。

```
        0
       / \
      1   2
         /|\
        3 4 5
```

答案：`[8, 12, 6, 10, 10, 10]`

### 6.2 朴素做法有多慢

对每个节点跑一次 DFS/BFS 求所有距离，复杂度 **O(n²)**。n = 3×10⁴ 时是 9×10⁸ —— 超时。

### 6.3 核心思想：相邻节点之间只差一个"挪动"

这是换根 DP 的精髓，**只推一个式子就够了**：

设 `size[v]` 是 v 的子树大小，`ans[u]` 是 u 到所有节点的距离和。

现在把"根"从 `u` 挪到它的孩子 `v`：

```
挪动前（以 u 为根）：v 子树里的 size[v] 个节点，距离都 +1（离 u 远）
                     剩下的 n - size[v] 个节点，距离都 -1（离 u 近）

所以：
  ans[v] = ans[u]
         - 1 × size[v]        （v 子树的距离各减 1）
         + 1 × (n - size[v])  （其余节点的距离各加 1）
       = ans[u] - 2 × size[v] + n
```

**这个式子就是全部。** 一句话：

> **换根一步，子树内的距离减 1，子树外的距离加 1。**

### 6.4 两趟遍历

```
第一趟（后序）：算 size[u] 和 down[u]
  down[u] = Σ (down[v] + size[v])        ← u 到其子树内所有节点的距离和
第二趟（前序）：算 ans[u]
  ans[0] = down[0]
  ans[v] = ans[u] - 2*size[v] + n
```

### 6.5 图解

边表 `[[0,1],[0,2],[2,3],[2,4],[2,5]]` 画出来是这棵树（**3、4、5 全都是 2 的孩子**）：

```
        0            n = 6
       / \
      1   2
         /|\
        3 4 5
```

先算 `size`（自底向上）：

```
size[3] = size[4] = size[5] = 1        （叶子）
size[2] = 1 + size[3] + size[4] + size[5] = 1 + 1 + 1 + 1 = 4
size[1] = 1                            （节点 1 是叶子）
size[0] = 1 + size[1] + size[2] = 1 + 1 + 4 = 6  ✅ 和 n 一致
```

再算 `down`（后序）：

```
down[3] = down[4] = down[5] = 0
down[2] = (down[3]+size[3]) + (down[4]+size[4]) + (down[5]+size[5])
       = (0+1) + (0+1) + (0+1) = 3
down[1] = 0
down[0] = (down[1]+size[1]) + (down[2]+size[2]) = (0+1) + (3+4) = 8
```

最后前序推 `ans`：

```
ans[0] = down[0] = 8                                                          ✅
ans[1] = ans[0] - 2*size[1] + n = 8 - 2*1 + 6 = 12                           ✅
ans[2] = ans[0] - 2*size[2] + n = 8 - 2*4 + 6 = 6                            ✅
ans[3] = ans[2] - 2*size[3] + n = 6 - 2*1 + 6 = 10                           ✅
ans[4] = ans[2] - 2*size[4] + n = 6 - 2*1 + 6 = 10                           ✅
ans[5] = ans[2] - 2*size[5] + n = 6 - 2*1 + 6 = 10                           ✅

最终：[8, 12, 6, 10, 10, 10] ✅
```

顺手验一下节点 0：`dist(0,1) + dist(0,2) + dist(0,3) + dist(0,4) + dist(0,5) = 1 + 1 + 2 + 2 + 2 = 8` ✅

### 6.6 ⚠️ 一个自检技巧：size[0] 必须等于 n

我第一次画这棵树的图时，把 3、4、5 同时挂在了 1 和 2 下面：

```
        0
       / \
      1   2
     / \ /|\
    3  4 3 4 5      ← 画乱了
```

结果 `size[0] = 1 + 3 + 4 = 8`，但树上只有 6 个节点 —— **对不上**。

**`size[root]` 必须恰好等于 n**，这是换根 DP 最省事的自检点。算完先看一眼这个数，对不上就是图或代码画错了，别急着往下推。

我最后是靠这个检查才发现图的锅：边表 `[2,3],[2,4],[2,5]` 明明说 3、4、5 都是 2 的孩子，我却画成了 1 也有两个。**代码是对的，图是错的。**

### 6.7 代码实现

#### TypeScript

```typescript
/**
 * 树中距离之和 —— LeetCode 834（换根 DP）
 *
 * 核心式：ans[v] = ans[u] - 2*size[v] + n
 *   含义：根从 u 挪到 v，v 子树内的距离各减 1，子树外的各加 1
 *
 * 复杂度：时间 O(n)，空间 O(n)
 */
export function sumOfDistancesInTree(n: number, edges: number[][]): number[] {
  // 1. 建邻接表
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  // 2. 定根，拿到 parent 和一个"父亲在孩子前面"的遍历序
  const parent = new Array<number>(n).fill(-1);
  const order: number[] = [];
  const stack: number[] = [0];
  parent[0] = 0;
  while (stack.length) {
    const u = stack.pop()!;
    order.push(u);
    for (const v of adj[u]) {
      if (v === parent[u]) continue;
      parent[v] = u;
      stack.push(v);
    }
  }

  // 3. 后序：算 size 和 down
  const size = new Array<number>(n).fill(1);
  const down = new Array<number>(n).fill(0);
  for (let i = order.length - 1; i >= 0; i--) {
    const u = order[i];
    for (const v of adj[u]) {
      if (v === parent[u]) continue;
      size[u] += size[v];
      down[u] += down[v] + size[v];
    }
  }

  // 4. 前序：算 ans
  const ans = new Array<number>(n).fill(0);
  ans[0] = down[0];
  for (const u of order) {
    for (const v of adj[u]) {
      if (v === parent[u]) continue;
      ans[v] = ans[u] - 2 * size[v] + n;
    }
  }
  return ans;
}
```

#### Python

```python
from typing import List


class Solution:
    def sumOfDistancesInTree(self, n: int, edges: List[List[int]]) -> List[int]:
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)

        # 定根，拿到父节点和遍历序
        parent = [-1] * n
        order = []
        stack = [0]
        parent[0] = 0
        while stack:
            u = stack.pop()
            order.append(u)
            for v in adj[u]:
                if v == parent[u]:
                    continue
                parent[v] = u
                stack.append(v)

        # 后序：算 size / down
        size = [1] * n
        down = [0] * n
        for u in reversed(order):
            for v in adj[u]:
                if v == parent[u]:
                    continue
                size[u] += size[v]
                down[u] += down[v] + size[v]

        # 前序：算 ans
        ans = [0] * n
        ans[0] = down[0]
        for u in order:
            for v in adj[u]:
                if v == parent[u]:
                    continue
                ans[v] = ans[u] - 2 * size[v] + n
        return ans
```

#### Go

```go
package treedp

// SumOfDistancesInTree 树中距离之和（换根 DP）
// 核心式：ans[v] = ans[u] - 2*size[v] + n
func SumOfDistancesInTree(n int, edges [][]int) []int {
	adj := make([][]int, n)
	for _, e := range edges {
		a, b := e[0], e[1]
		adj[a] = append(adj[a], b)
		adj[b] = append(adj[b], a)
	}

	// 定根
	parent := make([]int, n)
	for i := range parent {
		parent[i] = -1
	}
	parent[0] = 0
	order := make([]int, 0, n)
	stack := []int{0}
	for len(stack) > 0 {
		u := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		order = append(order, u)
		for _, v := range adj[u] {
			if v == parent[u] {
				continue
			}
			parent[v] = u
			stack = append(stack, v)
		}
	}

	// 后序：size / down
	size := make([]int, n)
	for i := range size {
		size[i] = 1
	}
	down := make([]int, n)
	for i := len(order) - 1; i >= 0; i-- {
		u := order[i]
		for _, v := range adj[u] {
			if v == parent[u] {
				continue
			}
			size[u] += size[v]
			down[u] += down[v] + size[v]
		}
	}

	// 前序：ans
	ans := make([]int, n)
	ans[0] = down[0]
	for _, u := range order {
		for _, v := range adj[u] {
			if v == parent[u] {
				continue
			}
			ans[v] = ans[u] - 2*size[v] + n
		}
	}
	return ans
}
```

---

## 七、树上差分：统计路径覆盖次数

### 7.1 问题模型

```
        0
      /   \
     1     2
    / \   /
   3   4  5
```

给定 m 条路径 `(a, b)`，问**每个节点被多少条路径经过**？

### 7.2 树上差分：一个漂亮的技巧

如果每条路径都走一遍，复杂度是 O(m·n)。但树上差分可以做到 **O(n + m·log n)**。

**核心操作（点计数版本）：**

```
diff[a] += 1
diff[b] += 1
diff[lca(a,b)] -= 1
diff[parent(lca(a,b))] -= 1     ← lca 是根时跳过
```

然后**自底向上累加**：

```
for u 从后序:
  diff[parent[u]] += diff[u]
```

累加完，`diff[u]` 就是经过节点 u 的路径数。

### 7.3 为什么对？

来跟一遍单条路径 `3 → 4`（`lca = 1`）：

```
diff[3] += 1  →  diff[3] = 1
diff[4] += 1  →  diff[4] = 1
diff[1] -= 1  →  diff[1] = -1
diff[0] -= 1  →  diff[0] = -1     （parent(1) = 0）
```

自底向上累加：

```
节点 3：diff[3] = 1，把 1 加到 diff[1] → diff[1] = 0
节点 4：diff[4] = 1，把 1 加到 diff[1] → diff[1] = 1
节点 1：diff[1] = 1，把 1 加到 diff[0] → diff[0] = 0
节点 0：diff[0] = 0

结果：[0, 1, 0, 1, 1, 0]
```

路径 `3 → 1 → 4` 上的节点 1、3、4 都是 1 ✅，其余是 0 ✅

**原理**：`+1` 从两端往上传，经过的节点都收到；`-1` 在 lca 处抵消一次（lca 被数了两次：a 侧传来一次、b 侧传来一次），`-1` 在 lca 的父亲处再抵消一次（因为路径不过 lca 的父亲）。

### 7.4 ⚠️ 边计数 vs 点计数

这是**最容易搞混的地方**，我第一次写就写错了：

| | 差分写法 | 累加后含义 |
|---|---|---|
| **边计数** | `diff[a]++`, `diff[b]++`, `diff[lca] -= 2` | 每条**边**被经过的次数 |
| **点计数** | `diff[a]++`, `diff[b]++`, `diff[lca] -= 1`, `diff[parent(lca)] -= 1` | 每个**节点**被经过的次数 |

我用边计数的写法去求点计数，结果每个节点的答案都少 1。**调试这类题，先用一个 6 节点的小树手推三条路径，别急着写代码。**

### 7.5 代码实现

#### TypeScript

```typescript
/**
 * 树上差分 —— 统计每个节点被多少条路径经过
 *
 * 差分操作（点计数版本）：
 *   diff[a]++, diff[b]++
 *   diff[lca]--
 *   diff[parent(lca)]--      （lca 是根时跳过）
 *
 * 复杂度：时间 O(n + m·log n)（LCA 用倍增），空间 O(n·log n)
 */
export function countPathsThroughNode(
  n: number,
  edges: number[][],
  queries: number[][],
): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  // 定根 + 遍历序
  const parent = new Array<number>(n).fill(-1);
  const order: number[] = [];
  const stack: number[] = [0];
  parent[0] = 0;
  while (stack.length) {
    const u = stack.pop()!;
    order.push(u);
    for (const v of adj[u]) {
      if (v === parent[u]) continue;
      parent[v] = u;
      stack.push(v);
    }
  }

  const diff = new Array<number>(n).fill(0);
  for (const [a, b] of queries) {
    diff[a]++;
    diff[b]++;
    const lca = lcaNaive(parent, a, b);
    diff[lca] -= 1;
    if (lca !== 0) diff[parent[lca]] -= 1;
  }

  // 自底向上累加
  for (let i = order.length - 1; i >= 0; i--) {
    const u = order[i];
    if (u !== 0) diff[parent[u]] += diff[u];
  }
  return diff;
}

/**
 * 朴素求 LCA —— 每次 O(h)，仅用于演示。
 * 生产环境请用倍增（binary lifting）或 Tarjan，见站内《树链剖分》《倍增》两篇。
 */
function lcaNaive(parent: number[], a: number, b: number): number {
  const depth = (z: number): number => {
    let d = 0,
      cur = z;
    while (cur !== 0) {
      cur = parent[cur];
      d++;
    }
    return d;
  };
  let x = a,
    y = b;
  while (depth(x) > depth(y)) x = parent[x];
  while (depth(y) > depth(x)) y = parent[y];
  while (x !== y) {
    x = parent[x];
    y = parent[y];
  }
  return x;
}
```

---

## 八、避坑清单

### ❌ 坑 1：把树塞进一维 dp 数组

```typescript
// ❌ 错误：用节点编号当下标
const dp = new Array(n).fill(0);
function dfs(u) {
  dp[u] = ...; // 编号和遍历顺序完全没关系！
}
```

**症状**：小树对，大树全错，或者同编号不同位置的节点互相污染。

**正解**：状态挂在节点对象上，或者用 Map 索引。

### ❌ 坑 2：解构顺序写反

```typescript
// ❌ 危险：返回顺序和取值顺序不一致
return [take, skip];        // 返回 [偷, 不偷]
const [skip, take] = dfs(u); // 却按 [不偷, 偷] 取
```

**症状**：答案偏小或偏大，而且**小规模测试可能刚好过**。

**正解**：要么统一用对象 `{ skip, take }`，要么在函数注释里钉死顺序。

### ❌ 坑 3：路径型忘了"答案不一定过根"

```typescript
// ❌ 错误：直接把 DFS 的返回值当答案
function depth(u) {
  ...
  return 1 + Math.max(l, r);   // ← 这只是"往上传的链"
}
```

**症状**：只算了过根的路径，最优路径不沾根就漏掉了。

**正解**：用闭包变量维护全局答案。

### ❌ 坑 4：全负数时把答案初始化成 0

```typescript
// ❌ 错误
let best = 0;

// ✅ 正确
let best = -Infinity;
```

**症状**：树里全是负数时返回 0，而正确答案可能是 `-3`。LeetCode 124 的测试用例专门卡这个。

### ❌ 坑 5：树形背包没检查祖先依赖

```typescript
// ❌ 错误：允许 i=0 且 j>0
for (let i = 0; i < dp.length; i++)
  for (let j = 0; j < cd.length; j++)
    next[i + j] = Math.max(next[i + j], dp[i] + cd[j]);
```

**症状**：能选出"跳过父节点只选孙子"的非法方案，答案偏大。

**正解**：加 `if (i === 0 && j > 0) continue;`。

### ❌ 坑 6：换根 DP 的式子记成 `+size` 而不是 `-2*size`

```typescript
// ❌ 错误
ans[v] = ans[u] - size[v] + (n - size[v]);

// ✅ 正确
ans[v] = ans[u] - 2 * size[v] + n;
```

**症状**：答案随节点深度线性漂移，肉眼看"差不多"但对不上。

**正解**：记住那句话 —— **子树内减 1，子树外加 1**，所以是 `-size[v] + (n - size[v])`，化简就是 `-2*size[v] + n`。

### ❌ 坑 7：树上差分混用了边计数和点计数

```typescript
// ❌ 点计数问题却用了边计数的差分
diff[lca] -= 2;

// ✅ 点计数
diff[lca] -= 1;
if (lca !== 0) diff[parent[lca]] -= 1;
```

**症状**：每个节点的答案恰好少 1，非常有迷惑性。

### ❌ 坑 8：递归深度爆栈

JS 的递归深度上限大约 1 万层。链状树（深度 10⁵）会直接 `RangeError: Maximum call stack size exceeded`。

```typescript
// ✅ 改成显式栈的后序遍历
const order: TreeNode[] = [];
const st: TreeNode[] = [root];
while (st.length) {
  const u = st.pop()!;
  order.push(u);
  if (u.left) st.push(u.left);
  if (u.right) st.push(u.right);
}
// order 是"根 → 叶"，倒着遍历就是"叶 → 根"，正好是后序
for (let i = order.length - 1; i >= 0; i--) {
  const u = order[i];
  // ...
}
```

### ❌ 坑 9：只推手算，不跑代码

我在这篇文章里栽了两次跟头，都是"手推"和"代码"对不上：

1. **树画错了**：写最大路径和时，我把官方的 `[-10,9,20,null,null,15,7]` 画成了 9 底下还挂着 15 和 2。手推得 41，官方答案是 42。**代码跑出来是 44，我才发现是图的问题。**
2. **公式少写一个 `2`**：换根 DP 我写成了 `ans[u] - size[v] + (n - size[v])`，少了个系数。对拍 200 棵随机树，全对不上。

**手推是理解的手段，验证才是交付的标准。** 写完一定跑一遍官方样例，最好再写个暴力版对拍。

### ❌ 坑 10：忘了 `size[root]` 必须等于 n

换根 DP 算完 `size` 数组，**第一件事是看一眼 `size[root]`**。它必须**恰好等于 n**。

我画错图的时候，`size[0]` 算出来是 8，而树只有 6 个节点 —— 数字自己会告状。**别把这一行输出淹在一堆日志里。**

### ❌ 坑 11：把 LeetCode 层序数组的 `null` 位置搞错

`[-10,9,20,null,null,15,7]` 到底是哪棵树？

```
根的左孩子 = 9，根的右孩子 = 20
9 的左孩子 = null，9 的右孩子 = null   → 9 是叶子
20 的左孩子 = 15，20 的右孩子 = 7
```

**`null` 在数组里也占位置**。数组给的是"每个位置的左右孩子"，不是"非空节点的列表"。我第一次画这棵树就是在这里错的。

自检方法：**用代码建一遍树，打印出来看**，比自己画靠谱得多。

---

## 九、复杂度分析

| 问题 | 时间 | 空间 | 备注 |
|---|---|---|---|
| 选点型（LC 337） | O(n) | O(h) | 每个节点算一次 |
| 树的直径（LC 543） | O(n) | O(h) | 递归栈深度 = 树高 |
| 最大路径和（LC 124） | O(n) | O(h) | 同上 |
| 树形背包 | O(n·K²) | O(n·K) | K 较大时需要 DFS 序优化 |
| 换根 DP（LC 834） | O(n) | O(n) | 两趟遍历 |
| 树上差分 | O(n + m·log n) | O(n·log n) | LCA 用倍增 |

**关于空间复杂度 O(h)：** 递归写法看起来是 O(n)，其实只跟**树高**有关。如果是平衡树，h = O(log n)；如果是链，h = O(n) —— 这时候就是爆栈的来源。

---

## 十、实际应用场景

### 1. 组织架构与权限分配

一棵部门树，每个节点是一级部门。要给 M 个名额分配到部门，**且不能跳过上级**（没给上级批预算，下级也没钱花）—— 这就是树形背包的依赖模型。我在一个 HR 系统里见过这个模型。

### 2. 树形依赖的构建系统

Maven / Bazel 的构建图本质上是 DAG（不是树），但很多简单场景可以用树近似：**选一个模块必须先选它的依赖**。这时"选 k 个模块的最大收益"就是树形背包。

### 3. 分布式系统的节点距离统计

换根 DP 的 `answer[i] = 到所有节点的距离和`，在真实场景里等于 **"节点 i 作为入口时的网络总跳数"**。CDN 选源站、ZooKeeper 的 leader 选举代价评估、Service Mesh 的就近路由打分，都要用到。

### 4. 监控与链路追踪

"这次请求经过了哪些服务节点？" —— 如果服务调用关系能建成树（或者用虚树压缩成小树），树上差分可以直接统计每个节点被多少条调用链覆盖。**这是我在 APM 场景里最常用的技巧。**

### 5. 基因表达 / 蛋白质结构分析

生物信息里，"两个基因在进化树上的距离"就是树上距离，"给定一组标记基因，找出它们的最近公共祖先"就是 LCA 换根家族的变形。

---

## 十一、面试题精选

### Q1：树形 DP 和普通的线性 DP 到底差在哪？

状态存放位置不同。线性 DP 的状态是一维数组，天然有顺序；树形 DP 的状态挂在节点上，每个节点一组，必须**后序遍历**（孩子先、父亲后）才能算出来。

### Q2：为什么打家劫舍 III 要开两个状态？

因为"偷不偷 u"会改变孩子的可选集合。只开一个状态无法同时表达这两种约束。

### Q3：树的直径和最大路径和，转移上有啥区别？

核心结构一样（都是"往上传一条链 + 在节点处拐弯更新答案"）。区别在于：

- 直径只有长度，没有负数问题
- 最大路径和权值可能为负，所以要 `max(0, ...)` 砍掉负贡献分支，且答案初值必须是 `-Infinity`

### Q4：树形背包的状态怎么定义？为什么必须"u 必选"？

`dp[u][k]` = u 子树里选 k 个点的最大价值。定义成"u 必选"是为了在合并时天然保证"选后代必选祖先"这个依赖约束 —— 否则合并的时候要额外检查，容易漏。

### Q5：换根 DP 的核心公式是什么？为什么？

`ans[v] = ans[u] - 2*size[v] + n`

推导：根从 u 挪到 v，v 子树里的 `size[v]` 个节点距离各减 1，其余 `n - size[v]` 个各加 1，所以 `-size[v] + (n - size[v]) = -2*size[v] + n`。

### Q6：树上差分怎么做？边计数和点计数差在哪？

差分：`diff[a]++`, `diff[b]++`，然后在 lca 处做减法，最后自底向上累加。

- **边计数**：`diff[lca] -= 2`
- **点计数**：`diff[lca] -= 1`, `diff[parent(lca)] -= 1`

### Q7：树形 DP 怎么避免递归爆栈？

改成显式栈的两趟遍历：先用栈收集一个"根 → 叶"的顺序，再倒着遍历这个数组做后序计算。把递归的返回值从"函数返回值"换成"Map 里存的状态"。

### Q8：什么时候该用树形 DP，什么时候用树的直径/换根？

判断标准是**问题的依赖方向**：

- 答案依赖子树 → 树形 DP
- 每个节点都要一个答案，且能建立"父子关系递推" → 换根 DP
- 只是求一条最长/最大路径 → 路径型树形 DP

### Q9：树形 DP 能用在 DAG 上吗？

能，但转移方程要改成"对所有入边做聚合"，且不能重复计数（每个节点只算一次）。DAG 上的 DP 叫 **拓扑 DP**，参考站内《拓扑排序》和《状态压缩 DP》两篇。

### Q10：怎么验证树形 DP 写对了？

写个暴力版对拍。比如换根 DP，用 O(n²) 的暴力（每个节点跑一次 DFS）算一遍，随机生成几百棵树比对。**我在这篇文章里就是这么抓出换根公式少写一个 `2*` 的 bug 的。**

---

## 十二、小结

树形 DP 不是什么高深算法，它就是**动态规划在树上的展开**。真正需要想清楚的只有一件事：

> **状态挂在谁身上？往哪个方向传？**

我把整篇文章收成一张图：

```
                    树形 DP
                       │
     ┌─────────┬───────┼───────┬─────────┐
   选点型    路径型   规模型   换根型    统计型
     │         │        │       │         │
  状态:     状态:    状态:   两趟遍历   树上差分
  选/不选   一条链   dp[k]   公式递推   路径覆盖
     │         │        │       │         │
  LC 337    LC 543   树形背包  LC 834    差分
            LC 124            +LCA
```

**三条必须记住的话：**

1. **状态挂在节点上，用后序遍历传递。** 这是树形 DP 和线性 DP 最本质的区别。
2. **"往上传"和"更新答案"是两件事。** 往上传的通常只能取一条链（路径型），更新答案时才可以把两边拼起来。
3. **写完一定跑代码 + 暴力对拍。** 我在这篇文章里被自己的手推错误坑了两次（树画错了、公式少写 `2*`）。**手推帮你理解，验证帮你交付。**

最后送一句我自己写在笔记本上的话：

> **树形 DP 的难度不在算法，在"状态设计"。**
> 一旦你能在纸上写出"每个节点要返回哪几个数、每个数什么意思"，
> 代码就是照抄公式而已。

---

## 相关阅读

- [打家劫舍系列（House Robber I/II/III）](house-robber.md) —— 本文 337 的线性版和环形版，打家劫舍全家桶
- [动态规划](dynamic-programming.md) —— DP 的通用框架和状态设计方法
- [区间 DP 精讲（Interval DP）](interval-dp.md) —— 另一类 DP，和树形 DP 正好构成"图上 DP"的两极
- [状态压缩动态规划（Bitmask DP）](bitmask-dp.md) —— 状态空间爆炸时的另一条路
- [二叉树的序列化与反序列化](binary-tree-serialize.md) —— 树的存储和遍历基础
- [Morris 遍历（O(1) 空间遍历二叉树）](morris-traversal.md) —— 不想用递归栈时的另一个选择
- [倍增（Binary Lifting）](binary-lifting.md) —— LCA 的标准解法，树上差分要用到
- [树链剖分（Heavy-Light Decomposition）](heavy-light-decomposition.md) —— 树上路径操作的另一套工具箱
- [最低公共祖先（LCA）](lowest-common-ancestor.md) —— 换根 DP 和树上差分的公共前置
