---
title: 打家劫舍
description: 打家劫舍系列（House Robber I/II/III）—— 从线性 DP 到环形数组到二叉树的完整演化
date: 2026-10-13 09:01:05
categories:
  - Algorithm
tags:
  - dynamic-programming
  - house-robber
  - tree-dp
sidebarSort: 104
---

# 打家劫舍系列（House Robber I / II / III）

面试官问你："今晚去打家劫舍，每家都有一些钱，但相邻的两家不能同时进，否则会触发报警。你能偷到的最大金额是多少？"

你脑子里立刻开始建模：第一家偷不偷？如果偷了，第二家就不能偷；如果不偷，第二家随便。哦，这不就是「选或不选」的 DP 问题吗？

这就是 LeetCode 第 198 题——**打家劫舍**。这道题之所以经典，不是因为它难，而是因为它**像一棵树的种子**：198 是种子，213 是环形变体，337 是二叉树变体。把这三道题一起刷完，你会彻底搞懂"状态转移方程"到底是什么东西 ✨。

## 为什么这道题值得专门讲？

可能你会问：「线性 DP 不是 5 分钟就能写完？」没错，198 题确实几行代码就完事。但是，**它隐藏着 DP 最核心的两个思维**：

1. **状态定义**：你需要在脑子里清楚「我这一步**是什么状态**」。很多人写不出 DP，不是因为不会递推，而是因为**压根不知道该定义几个状态、每个状态代表什么**。
2. **转移方程**：从前一步的状态，推导出这一步可以选哪些动作，每个动作会进入什么新状态。

把这三个变体放一起讲，是因为它们的**状态定义在不断进化**：

| 题目 | 状态维度 | 难度 | 核心考点 |
|------|---------|------|---------|
| House Robber (198) | 一维数组 | 中等 | 线性 DP 入门 |
| House Robber II (213) | 环形数组 | 中等 | 拆环 + 复用 198 |
| House Robber III (337) | 二叉树 | 中等 | 树形 DP + 后序遍历 |

我们一题一题拆开看 👇

---

## 一、House Robber（线性版）—— LeetCode 198

### 问题描述

给你一个非负整数数组 `nums`，表示每家有多少钱。相邻的两家不能同时偷，求**最大可偷金额**。

```
输入：nums = [2, 7, 9, 3, 1]
输出：12
解释：偷第 1、3、5 家 → 2 + 9 + 1 = 12
```

### 第一步：定义状态

DP 最关键的一步是**定义清楚状态**。我把它叫做"思考坐标系"——坐标系没建好，后面所有推导都是乱的。

对第 `i` 家房子，我能做什么决策？要么偷，要么不偷。**而我决定偷不偷的前提是：当前能拿到的最大金额是多少**。

所以定义：

```
dp[i] = 偷前 i+1 家房子（nums[0..i]），能拿到的最大金额
```

注意：这里的 `i` 是下标，对应的就是 `nums[i]` 这一家。

### 第二步：推导转移方程

到了第 `i` 家，我有两个选择：

1. **偷第 `i` 家** → 那第 `i-1` 家一定不能偷，金额 = `dp[i-2] + nums[i]`
2. **不偷第 `i` 家** → 那第 `i-1` 家可以随便，金额 = `dp[i-1]`

取两者最大值：

```
dp[i] = max(dp[i-1], dp[i-2] + nums[i])
```

是不是很简洁？一句话：**要么保留不偷这家得到的最大值，要么加上偷这家 + 隔一家的最大值**。

### 第三步：初始化边界

```
dp[0] = nums[0]              // 只偷第一家
dp[1] = max(nums[0], nums[1]) // 前两家取较大者
```

### 图解（手把手走一遍）

```
nums: [2, 7, 9, 3, 1]

i=0: dp[0] = 2                  (只偷第一家)
i=1: dp[1] = max(2, 7) = 7     (偷第二家更划算)
i=2: dp[2] = max(7, 2+9) = 11  (偷第一+第三家 = 11)
i=3: dp[3] = max(11, 7+3) = 14 (偷第二+第四家 = 10) ⭐️
                                  等等，这里 dp[3] = max(11, 7+3=10) = 11 才对
                                  我重新算：
i=3: dp[3] = max(dp[2]=11, dp[1]+3) = max(11, 7+3=10) = 11
i=4: dp[4] = max(dp[3]=11, dp[2]+1) = max(11, 11+1=12) = 12

最终：dp[4] = 12 ✓
```

实操过程：

```
i   nums[i]   dp[i-2]   dp[i-1]   dp[i-2]+nums[i]   dp[i]
────────────────────────────────────────────────────────
0   2         -         -         -                 2
1   7         -         2         -                 7
2   9         2         7         2+9=11            11
3   3         7         11        7+3=10            11
4   1         11        11        11+1=12           12  ✓
```

### 第四步：空间优化

仔细看转移方程：`dp[i]` 只依赖 `dp[i-1]` 和 `dp[i-2]`。完全不需要存整个数组，用两个变量滚动就行。

```
设 a = dp[i-2], b = dp[i-1]
每次循环：new_dp = max(b, a + nums[i])
然后 a, b = b, new_dp
```

把 O(n) 空间压到 O(1)——这是 DP 题常用的"滚动变量"优化套路。

### 代码实现

```typescript
/**
 * 打家劫舍 I —— 线性 DP + 滚动变量
 *
 * 思路：dp[i] = max(不偷i, 偷i) = max(dp[i-1], dp[i-2] + nums[i])
 * 为什么用滚动变量：只依赖前两个状态，O(1) 空间就够
 */
function rob(nums: number[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  // a 是 dp[i-2]，b 是 dp[i-1]
  let a = 0; // 初始化为 0，相当于 dp[0] 之前的"空状态"
  let b = nums[0]; // 对应 dp[0]

  for (let i = 1; i < nums.length; i++) {
    const cur = Math.max(b, a + nums[i]);
    a = b;
    b = cur;
  }

  return b; // b 就是最终的 dp[n-1]
}

// 验证
console.log(rob([2, 7, 9, 3, 1])); // 12
console.log(rob([2, 1, 1, 2]));    // 4（偷第1家 + 第4家）
```

```go
package houserobber

// Rob 打家劫舍 I —— 线性 DP
// 为什么用滚动变量：状态只依赖前两步，O(1) 空间搞定
func rob(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	if len(nums) == 1 {
		return nums[0]
	}

	// a = dp[i-2], b = dp[i-1]
	a, b := 0, nums[0]
	for i := 1; i < len(nums); i++ {
		cur := max(b, a+nums[i])
		a, b = b, cur
	}
	return b
}
```

```python
def rob(nums: list[int]) -> int:
    """打家劫舍 I —— 线性 DP + 滚动变量

    思路：dp[i] = max(不偷i, 偷i) = max(dp[i-1], dp[i-2] + nums[i])
    """
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]

    a, b = 0, nums[0]  # a=dp[i-2], b=dp[i-1]
    for i in range(1, len(nums)):
        a, b = b, max(b, a + nums[i])
    return b


# 测试
print(rob([2, 7, 9, 3, 1]))  # 12
print(rob([2, 1, 1, 2]))     # 4
```

```java
public class HouseRobber {
    /**
     * 打家劫舍 I —— 线性 DP
     * 为什么用滚动变量：状态只依赖前两步，O(1) 空间
     */
    public static int rob(int[] nums) {
        if (nums.length == 0) return 0;
        if (nums.length == 1) return nums[0];

        int a = 0;            // dp[i-2]
        int b = nums[0];      // dp[i-1]
        for (int i = 1; i < nums.length; i++) {
            int cur = Math.max(b, a + nums[i]);
            a = b;
            b = cur;
        }
        return b;
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 9, 3, 1};
        System.out.println(rob(nums)); // 12
    }
}
```

---

## 二、House Robber II（环形版）—— LeetCode 213

### 问题描述

这次的约束升级了：**房子排成环形**（第 1 家和最后一家相邻）。同样，相邻的两家不能同时偷。求最大可偷金额。

```
输入：nums = [2, 3, 2]
输出：3
解释：你不能偷第 1 和第 3 家（相邻），只能偷第 2 家，金额 = 3
```

### 直觉：环怎么处理？

很多人一看到「环形」就懵。其实有个非常简单的技巧——**拆环成链**。

环形意味着第 1 家和最后一家是相邻的。所以有两种"合法"的偷法：

- **方案 A**：第 1 家偷，最后一家不偷 → 偷 `nums[0..n-2]`
- **方案 B**：第 1 家不偷，最后一家可以偷 → 偷 `nums[1..n-1]`

最终答案是两者的较大值。

为什么要"分两种情况"？因为在环形里，**首尾是耦合的**：要么你决定首偷，要么你决定尾偷，**两者只能有一个**。把这个耦合解开，问题就退化成了上一题的线性版本。

```
环形数组: [2, 3, 2]
             ↘____________↗
              首尾相邻，矛盾

方案 A：偷 nums[0..1] = [2, 3]   → max = 3（偷第2家）
方案 B：偷 nums[1..2] = [3, 2]   → max = 3（偷第2家）
答案：max(3, 3) = 3 ✓
```

### 边界条件别忘了

如果数组长度是 1 怎么办？比如 `nums = [5]`。这时候方案 A 和方案 B 是同一个东西（都是 `[5]`），代码可能会重复计算。需要单独处理 `n == 1` 的情况，直接返回 `nums[0]`。

### 代码实现

```typescript
/**
 * 打家劫舍 II —— 环形 DP
 *
 * 核心技巧：拆环成链。
 * 环形约束意味着第1家和最后一家不能同时偷，
 * 所以分两种情况：
 *   情况1：偷第1家 → nums[0..n-2]（线性版）
 *   情况2：不偷第1家 → nums[1..n-1]（线性版）
 * 答案取两者最大值。
 */
function rob(nums: number[]): number {
  if (nums.length === 1) return nums[0];
  if (nums.length === 2) return Math.max(nums[0], nums[1]);

  // 复用打家劫舍 I 的解法
  const robRange = (start: number, end: number): number => {
    let a = 0,
      b = nums[start];
    for (let i = start + 1; i <= end; i++) {
      const cur = Math.max(b, a + nums[i]);
      a = b;
      b = cur;
    }
    return b;
  };

  // 情况1：偷 nums[0..n-2]
  // 情况2：偷 nums[1..n-1]
  return Math.max(robRange(0, nums.length - 2), robRange(1, nums.length - 1));
}

// 测试
console.log(rob([2, 3, 2]));        // 3
console.log(rob([1, 2, 3, 1]));     // 4（偷第2和第4家）
console.log(rob([0]));              // 0
console.log(rob([5]));              // 5（边界：只有一家）
```

```go
package houserobber

// robRange 闭区间 [start, end] 上的线性打家劫舍
func robRange(nums []int, start, end int) int {
	a, b := 0, nums[start]
	for i := start + 1; i <= end; i++ {
		cur := max(b, a+nums[i])
		a, b = b, cur
	}
	return b
}

// Rob 打家劫舍 II —— 环形拆解
// 为什么拆环：首尾相邻约束导致要么不偷首、要么不偷尾
func rob(nums []int) int {
	n := len(nums)
	if n == 1 {
		return nums[0]
	}
	if n == 2 {
		return max(nums[0], nums[1])
	}
	// 情况1：偷 nums[0..n-2]，情况2：偷 nums[1..n-1]
	return max(robRange(nums, 0, n-2), robRange(nums, 1, n-1))
}
```

```python
def rob_ii(nums: list[int]) -> int:
    """打家劫舍 II —— 环形 DP

    核心技巧：拆环成链，分两种情况。
    为什么这样拆：环形约束意味着首尾不能同时偷。
    """
    if len(nums) == 1:
        return nums[0]
    if len(nums) == 2:
        return max(nums)

    def rob_range(start: int, end: int) -> int:
        """闭区间 [start, end] 上的线性打家劫舍"""
        a, b = 0, nums[start]
        for i in range(start + 1, end + 1):
            a, b = b, max(b, a + nums[i])
        return b

    return max(rob_range(0, len(nums) - 2), rob_range(1, len(nums) - 1))


# 测试
print(rob_ii([2, 3, 2]))     # 3
print(rob_ii([1, 2, 3, 1]))  # 4
print(rob_ii([5]))           # 5
```

```java
public class HouseRobberII {
    /**
     * 打家劫舍 II —— 环形 DP
     * 为什么拆成两种情况：首尾相邻，要么不偷首、要么不偷尾
     */
    public static int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        if (nums.length == 2) return Math.max(nums[0], nums[1]);

        return Math.max(robRange(nums, 0, nums.length - 2),
                        robRange(nums, 1, nums.length - 1));
    }

    private static int robRange(int[] nums, int start, int end) {
        int a = 0, b = nums[start];
        for (int i = start + 1; i <= end; i++) {
            int cur = Math.max(b, a + nums[i]);
            a = b;
            b = cur;
        }
        return b;
    }

    public static void main(String[] args) {
        System.out.println(rob(new int[]{2, 3, 2}));        // 3
        System.out.println(rob(new int[]{1, 2, 3, 1}));     // 4
    }
}
```

### 这一题的本质

环形数组的处理思路其实是一个非常重要的范式**——遇到环形，先想能不能"强行枚举一次破环点"**。同样的思路还可以用来处理：

- **环形数组的连续子序列最大和**（Kadane 算法变种）
- **环形链表**的处理（找到破环点拆成链）
- **约瑟夫问题**（从环上找安全位置）

---

## 三、House Robber III（二叉树版）—— LeetCode 337

### 问题描述

这次偷的不是一排房子，而是一棵**二叉树**。规则如下：

- 树的节点值代表那家房子的金额
- 如果你偷了某个节点，**它的所有直接父子节点都不能偷**
- 问：最大能偷多少？

```
        3
       / \
      2   3
       \   \
        3   1

合法偷法：偷根节点3 + 右子树的右孩子3 + 左子树的右孩子3 = 9
（注意：偷了根节点，就不能再偷它的两个直接子节点2和3）
```

### 思维升级：从线性到树形

这是**思维层面的一次跃迁**。

- 在线性版里，`dp[i]` 是「前 i 家」的最大值，状态定义在一维数组上。
- 在树形版里，状态定义要放在**树的节点**上。每个节点都要回答：「**以我为根的子树，偷我或者不偷我，分别能拿到的最大值**」。

所以每个节点需要返回**两个值**：

```
rob(node)  = 偷当前节点能拿到的最大值
skip(node) = 不偷当前节点能拿到的最大值
```

### 转移方程怎么写？

到了节点 `node`，两种情况：

**情况 1：偷 `node`**

那 `node` 的左右孩子都不能偷。但孙子们可以随便。

```
rob(node) = node.val + skip(node.left) + skip(node.right)
```

**情况 2：不偷 `node`**

那 `node` 的左右孩子可以偷也可以不偷——**取它们各自的最优值**。

```
skip(node) = max(rob(node.left),  skip(node.left))
           + max(rob(node.right), skip(node.right))
```

**最终答案**：`max(rob(root), skip(root))`。

### 图解

```
        3            ← root
       / \
      2   3
       \   \
        3   1

从叶子开始算：

节点 3（左叶子的右孩子）：
  rob = 3
  skip = 0
  → (3, 0)

节点 2（左子树根）：
  rob = 2 + skip(左) + skip(右) = 2 + 0 + 0 = 2
  skip = max(rob(左), skip(左)) + max(rob(右), skip(右))
       = max(0, 0) + max(3, 0) = 0 + 3 = 3
  → (2, 3)

节点 1（右叶子的右孩子）：
  rob = 1, skip = 0 → (1, 0)

节点 3（右子树根）：
  rob = 3 + skip(左) + skip(右) = 3 + 0 + 0 = 3
  skip = max(0, 0) + max(1, 0) = 0 + 1 = 1
  → (3, 1)

根节点 3：
  rob = 3 + skip(2) + skip(3) = 3 + 3 + 1 = 7
  skip = max(rob(2), skip(2)) + max(rob(3), skip(3))
       = max(2, 3) + max(3, 1) = 3 + 3 = 6
  → (7, 6)

答案：max(7, 6) = 7
```

等等，我重算一下。原题给的例子答案是 **9**，我算出来是 7。哪里错了？

让我重新看题目给的树：

```
        3
       / \
      4   5
     / \   \
    1   3   1
```

哦，我刚才把树抄错了。正确的树应该是这样：

```
        3
       / \
      4   5
     / \   \
    1   3   1
```

最大偷法：偷 4 + 1 + 3 + 1 = 9（或者偷 3 + 4 + 5 = 12？让我重算）

不，应该是偷 4（根的左孩子）+ 5（根的右孩子）+ 1（左孩子的左孩子）+ 1（右孩子的右孩子）= 4 + 5 + 1 + 1 = 11？还是 4 + 5 = 9？

让我把原题的真实树画出来：

```
        3
       / \
      4   5
     / \   \
    1   3   1
```

合法偷法的选择：
- 不偷根（3），那 4 和 5 都可以偷：4 + 5 = 9（各自子树随便）
- 偷根（3），那 4 和 5 不能偷。4 的两个子 1、3 可以偷；5 的子 1 可以偷：1 + 3 + 1 = 5
- 答案：max(9, 3 + 5) = max(9, 8) = 9 ✓

OK，是我之前抄错树了。用正确的树：

```
节点 1（叶子）：
  rob = 1, skip = 0 → (1, 0)

节点 3（左下的）：
  rob = 3, skip = 0 → (3, 0)

节点 4（中间）：
  rob = 4 + 0 + 0 = 4
  skip = max(1, 0) + max(3, 0) = 1 + 3 = 4
  → (4, 4)

节点 1（右下的）：
  rob = 1, skip = 0 → (1, 0)

节点 5（中间）：
  rob = 5 + 0 + 0 = 5
  skip = max(0, 0) + max(1, 0) = 0 + 1 = 1
  → (5, 1)

根节点 3：
  rob = 3 + skip(4) + skip(5) = 3 + 4 + 1 = 8
  skip = max(4, 4) + max(5, 1) = 4 + 5 = 9
  → (8, 9)

答案：max(8, 9) = 9 ✓
```

这才对。**所以我们从叶子开始 DFS，每层向上返回 (rob, skip) 两个值**。

### 关键：这是后序遍历

仔细看递归的顺序：

```
dfs(node):
  dfs(node.left)   ← 先把子树算完
  dfs(node.right)  ← 再把右子树算完
  然后算 node 的 (rob, skip)
```

**这是后序遍历**（先子后父）。这告诉我们：**树形 DP 的本质就是后序遍历 + 状态聚合**。

### 代码实现

```typescript
/**
 * 二叉树节点定义
 */
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * 打家劫舍 III —— 树形 DP + 后序遍历
 *
 * 思路：每个节点返回 [偷我的最大值, 不偷我的最大值] 两个状态。
 * 这是"后序遍历 + 状态聚合"的经典套路。
 *
 * 状态定义：
 *   rob  = 偷当前节点能拿到的最大金额
 *   skip = 不偷当前节点能拿到的最大金额
 *
 * 转移方程：
 *   rob  = node.val + skip(left) + skip(right)
 *   skip = max(rob(left),  skip(left))
 *        + max(rob(right), skip(right))
 */
function rob(root: TreeNode | null): number {
  if (!root) return 0;

  const dfs = (node: TreeNode | null): [number, number] => {
    if (!node) return [0, 0];
    const [lRob, lSkip] = dfs(node.left);
    const [rRob, rSkip] = dfs(node.right);

    // 偷当前节点：左右孩子都不能偷，只能拿它们的 skip
    const robCur = node.val + lSkip + rSkip;
    // 不偷当前节点：左右孩子可以偷也可以不偷，取各自最大值
    const skipCur = Math.max(lRob, lSkip) + Math.max(rRob, rSkip);

    return [robCur, skipCur];
  };

  const [rootRob, rootSkip] = dfs(root);
  return Math.max(rootRob, rootSkip);
}

// 测试
const root = new TreeNode(3,
  new TreeNode(4,
    new TreeNode(1),
    new TreeNode(3)
  ),
  new TreeNode(5,
    null,
    new TreeNode(1)
  )
);
console.log(rob(root)); // 9
```

```go
package houserobber

// TreeNode 二叉树节点
type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// robHelper 返回 [偷当前节点的最大值, 不偷当前的最大值]
//
// 状态定义：
//   rob  = 偷当前节点能拿到的最大金额
//   skip = 不偷当前节点能拿到的最大金额
func robHelper(node *TreeNode) [2]int {
	if node == nil {
		return [2]int{0, 0}
	}
	left := robHelper(node.Left)
	right := robHelper(node.Right)

	// 偷我：左右孩子都不能偷，只取它们的 skip
	robCur := node.Val + left[1] + right[1]
	// 不偷我：左右孩子取各自最大值
	skipCur := max(left[0], left[1]) + max(right[0], right[1])
	return [2]int{robCur, skipCur}
}

// Rob 打家劫舍 III —— 树形 DP
func rob(root *TreeNode) int {
	if root == nil {
		return 0
	}
	res := robHelper(root)
	if res[0] > res[1] {
		return res[0]
	}
	return res[1]
}
```

```python
from typing import Optional


class TreeNode:
    def __init__(self, val: int = 0,
                 left: 'Optional[TreeNode]' = None,
                 right: 'Optional[TreeNode]' = None):
        self.val = val
        self.left = left
        self.right = right


def rob_iii(root: Optional[TreeNode]) -> int:
    """打家劫舍 III —— 树形 DP + 后序遍历

    思路：每个节点返回 (偷我, 不偷我) 两个最大值。
    为什么用后序遍历：必须先把子树的状态算完，才能聚合当前节点。
    """
    def dfs(node: Optional[TreeNode]) -> tuple[int, int]:
        if node is None:
            return (0, 0)
        l_rob, l_skip = dfs(node.left)
        r_rob, r_skip = dfs(node.right)

        # 偷我：左右孩子都不能偷，只取 skip
        rob_cur = node.val + l_skip + r_skip
        # 不偷我：左右孩子取各自最优
        skip_cur = max(l_rob, l_skip) + max(r_rob, r_skip)
        return (rob_cur, skip_cur)

    root_rob, root_skip = dfs(root)
    return max(root_rob, root_skip)


# 测试
root = TreeNode(3,
    TreeNode(4, TreeNode(1), TreeNode(3)),
    TreeNode(5, None, TreeNode(1))
)
print(rob_iii(root))  # 9
```

```java
public class HouseRobberIII {
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
        TreeNode(int val, TreeNode left, TreeNode right) {
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }

    /**
     * 打家劫舍 III —— 树形 DP + 后序遍历
     * 每个节点返回 {偷我, 不偷我} 两个状态
     */
    public static int rob(TreeNode root) {
        if (root == null) return 0;
        int[] res = dfs(root);
        return Math.max(res[0], res[1]);
    }

    /**
     * @return [偷当前节点的最大值, 不偷当前节点的最大值]
     */
    private static int[] dfs(TreeNode node) {
        if (node == null) return new int[]{0, 0};

        int[] l = dfs(node.left);
        int[] r = dfs(node.right);

        int robCur = node.val + l[1] + r[1];
        int skipCur = Math.max(l[0], l[1]) + Math.max(r[0], r[1]);
        return new int[]{robCur, skipCur};
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3,
            new TreeNode(4, new TreeNode(1), new TreeNode(3)),
            new TreeNode(5, null, new TreeNode(1))
        );
        System.out.println(rob(root)); // 9
    }
}
```

---

## 思维升华：这三题反映的 DP 通法

把三道题放一起，你会发现一个**通用的 DP 套路**：

### 套路一：定义清楚"状态"

每道 DP 题的第一步都是想清楚：**我的状态是什么？**

| 题 | 状态定义 |
|---|---|
| 198 | `dp[i]` = 前 `i` 家最大金额 |
| 213 | 同上，只是数组被拆成两段 |
| 337 | `(rob, skip)` = 偷或不偷当前节点的最大值 |

**状态可以是一维、多元、树形——但每一步都要明确"我的状态是什么"**。

### 套路二：从"选择"出发推导转移

每道题都要想：**当前这一步，我能做哪些选择？每个选择会进入什么新状态？**

```
198：选偷或不偷 → dp[i-1] 或 dp[i-2] + nums[i]
213：拆环变成两个 198 选择 → 偷首不偷尾，或偷尾不偷首
337：选偷或不偷 → (rob, skip) 二元状态聚合
```

### 套路三：自底向上 / 自顶向下 + 记忆化

198 是自底向上（从 `dp[0]` 推到 `dp[n-1]`）。
337 是自顶向下 + 记忆化（递归 + 每个节点只算一次）。

两种方式各有适用场景。**树形结构天然适合递归，自底向上通常需要反向遍历**。

### 套路四：滚动变量优化空间

198 题只要 O(1) 空间，因为 `dp[i]` 只依赖前两个状态。这种"滚动"思路在很多 DP 题里都能用：

- **爬楼梯**（依赖前 2 个）
- **打家劫舍**（依赖前 2 个）
- **最长上升子序列**（不能滚动，因为要查前面所有）
- **最长公共子序列**（不能滚动，因为二维）

判断能不能滚动的关键：**当前状态依赖的"过去"是否有限**。

---

## 复杂度分析

| 题目 | 时间复杂度 | 空间复杂度 | 说明 |
|------|----------|-----------|------|
| 198 | O(n) | O(1) | 滚动变量优化后 |
| 213 | O(n) | O(1) | 调用两次 198 的解法 |
| 337 | O(n) | O(h) | n 是节点数，h 是树高（最坏 O(n)） |

**为什么 337 空间是 O(h)**：递归栈的深度等于树高 `h`。平衡树 `h = O(log n)`，链状树 `h = O(n)`。

**为什么 198 空间能从 O(n) 优化到 O(1)**：状态只向前看两步，无需保留历史。

---

## 业务场景

### 1. 资源调度问题（198 模型）

机房有 N 台机器，每台机器有不同收益。但相邻两台机器同时运行会过热。最优调度方案就是 198 模型——线性、动资源、不能动相邻机器。

### 2. 环形值班表（213 模型）

员工排成环值班，相邻两位不能同时值班（避免沟通混乱），求最大覆盖时长。这就是 213 的"环形"模型。

### 3. 组织架构中的权限分配（337 模型）

公司组织架构是树形结构，每个部门都有一些预算，但上下级部门不能同时使用同一笔预算（防止资金冲突）。这就是 337 的树形 DP 模型。

---

## 变体与扩展

### 变体 1：House Robber IV（LeetCode 2560）

「至少偷 k 家，且不能相邻，求最小能力值」。用**二分查找 + 滑动窗口**搞定，跟打家劫舍不太一样，但思想可以借鉴。

### 变体 2：在二叉树上加一条父子边

如果树中**某些节点之间存在非树边的冲突**（不只是父子），问题变成「一般图的最大独立集」——那是 NP-hard 问题，启发式算法或近似算法上场。

### 变体 3：状态维度扩展

如果在 198 的基础上，加一个"今天是否连续工作了"的维度（防止过度劳累），状态从一维变成二维：`dp[i][0/1]`。

---

## 小结

打家劫舍系列三个变体，其实是**同一思想的三个演化方向**：

- 🧱 **线性版**：DP 的"hello world"，建立状态转移的思维方式
- ⭕ **环形版**：拆环成链，**遇到环形问题先想能不能枚举一次"破环点"**
- 🌲 **树形版**：状态从一维升级到多元，**树形 DP 的本质就是后序遍历 + 状态聚合**

刷完这三道题，你应该能回答这些问题：

- ✅ **状态怎么定义**：明确每一步的"思考坐标系"
- ✅ **转移怎么推导**：从"我能做什么选择"出发
- ✅ **空间怎么优化**：看依赖的范围决定能不能滚动
- ✅ **递归的本质**：把问题拆成更小的同类子问题，向上聚合答案

**面试官再问 DP，他问的是你脑子里的"状态空间"长什么样**。这三道题刷明白了，面试 DP 题基本都能套模板 🎉。