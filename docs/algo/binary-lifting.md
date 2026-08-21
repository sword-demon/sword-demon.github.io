---
title: 倍增算法
description: 倍增算法（Binary Lifting）—— 翻倍思维，把线性变对数的经典技巧
date: 2026-08-21 09:26:43
categories:
  - Algorithm
tags:
  - binary-lifting
  - 倍增
sidebarSort: 76
---

# 倍增算法（Binary Lifting）

你有没有遇到过这种场景：产品经理跑过来跟你说，"我们要给消息系统加一个功能——查看某条消息是'多少天前'发送的，比如'3天前'、'2小时前'、'刚刚'。"

你的第一反应是：存一个时间戳，然后计算差值，这不难。但是如果 PM 接着说，"对了，还要能支持**查看某条消息的父消息**——就是它回复的上一条消息，层层往上追溯到根消息。"

这下有意思了。如果每往上追溯一层都要查一次数据库，那追溯 10 层就要查 10 次，追溯 100 层就要查 100 次 —— 性能直接崩掉。

有没有一种方法，可以**一次查询就跳到任意层级**？

倍增算法（Binary Lifting）就是来解决这个问题的。**它的核心思想是：预处理出"跳 2^k 步"的结果，然后用二进制的视角来合并跳跃，最终实现 O(log n) 的查询**。

## 什么是倍增？

在说倍增算法之前，我们先来看一个简单的例子 —— **快速幂**（Exponentiation by Squaring）。

假设要计算 2^13：

```
13 的二进制是 1101

2^13 = 2^8 × 2^4 × 2^1
     = 256 × 16 × 2
     = 8192
```

我们把指数拆成二进制表示，然后**翻倍累乘**。13 = 8 + 4 + 1，所以只需要 3 次乘法就能算出 2^13。如果是普通做法，要做 12 次乘法。这就是"倍增"的力量 —— 用对数级别的操作替代线性操作。

```typescript
/**
 * 快速幂 —— 倍增思想的经典应用
 * 计算 base^exp，时间复杂度 O(log exp)
 */
function power(base: number, exp: number): number {
  let result = 1;
  let currentBase = base;

  while (exp > 0) {
    // 如果当前二进制位是 1，就把当前 base 乘进结果
    if (exp & 1) {
      result *= currentBase;
    }
    // base 翻倍，准备处理下一位
    currentBase *= currentBase;
    // exp 右移一位，处理下一个二进制位
    exp >>= 1;
  }

  return result;
}

console.log(power(2, 13)); // 8192
```

快速幂只是倍增思想的一个小应用。下面我们来看更重磅的。

## 树上 K 级祖先问题

假设你有这么一棵评论树：

```
                    [根消息]
                        │
            ┌───────────┼───────────┐
         [消息1]    [消息2]     [消息3]
            │           │
        [消息1-1]   [消息2-1]
            │
        [消息1-1-1]
```

每条消息只知道自己指向哪条父消息。现在要你回答：**给定任意一条消息 X，以及一个数字 K，求 X 的第 K 级祖先是谁。**

朴素的解法：从 X 开始，沿着父指针走 K 步，每次走一步。**时间复杂度 O(K)**，K 最大可能是树的高度（几十甚至几百）。

用倍增思想怎么做？

### 预处理阶段

我们先跑一遍 DFS/BFS，建立一个**倍增表** `ancestor[node][k]`：

```
ancestor[node][k] = node 往上跳 2^k 步到达的节点
```

怎么填这个表？

```
ancestor[node][0] = node 的直接父节点
ancestor[node][1] = ancestor[node][0] 往上跳 2^1 = 2 步
                  = ancestor[ ancestor[node][0] ][0]
                  
ancestor[node][k] = ancestor[ ancestor[node][k-1] ][k-1]
```

翻译成代码就是：

```typescript
// 预处理：建立倍增表
// parent[node] = node 的父节点，根节点的父节点设为自己或 -1
const LOG = Math.floor(Math.log2(N)) + 1; // N 是节点总数
const ancestor: number[][] = Array.from({ length: N }, () => new Array(LOG).fill(0));

// 第一步：填 ancestor[node][0]，即直接父节点
for (let node = 0; node < N; node++) {
  ancestor[node][0] = parent[node];
}

// 动态规划：从 2^0 推导 2^1，再推导 2^2，...
for (let k = 1; k < LOG; k++) {
  for (let node = 0; node < N; node++) {
    const mid = ancestor[node][k - 1];
    // 如果 mid 存在（非根节点），则跳 2^k = 2^(k-1) + 2^(k-1)
    ancestor[node][k] = mid === -1 ? -1 : ancestor[mid][k - 1];
  }
}
```

### 查询阶段

假设要从节点 `node` 往上跳 `K` 步。把 `K` 转成二进制：

```
K = 13 = 1101 (二进制) = 8 + 4 + 1

从 node 开始：
1. 如果第 0 位是 1（是的，13 的二进制是 1101，第 0 位是 1）→ 往上跳 2^0 = 1 步
2. 如果第 1 位是 0（13 的第 1 位是 0）→ 不跳
3. 如果第 2 位是 1 → 往上跳 2^2 = 4 步
4. 如果第 3 位是 1 → 往上跳 2^3 = 8 步

总共跳：1 + 4 + 8 = 13 步 ✅
```

这就是为什么叫"倍增"——把目标距离拆成二进制，然后**用已经预处理好的 2^k 跳跃来拼接**。

```typescript
/**
 * 查询 node 的第 k 级祖先
 * 时间复杂度：O(log k)，因为只需检查 O(log k) 个二进制位
 */
function getKthAncestor(node: number, k: number): number {
  for (let i = 0; i < LOG; i++) {
    if (k & (1 << i)) {
      node = ancestor[node][i];
      if (node === -1) break; // 已经到根了
    }
  }
  return node;
}
```

整个查询只需要 O(log K) 次操作 —— 不管 K 有多大（比如 1000），都只需要大约 10 次查表。

### 复杂度分析

```
预处理：O(N log N) 时间 + O(N log N) 空间
查询：  O(log K) 时间，O(1) 空间
```

对于一个社交系统来说，用户的评论最多几十层，用这个方案简直是杀鸡用牛刀 —— 但如果用在**文件系统、权限树、组织架构树**等深度可能上百的场景，效果就很明显了。

## 跳跃游戏：一步跳多远？

看一道经典的 LeetCode 题：

> 给定一个整数数组 `nums`，每个元素表示从该位置能向前跳的最远距离。起始位置在索引 0，判断能否到达数组最后一个位置。
>
> 例如：`nums = [2, 3, 1, 1, 4]` → 能跳到最后（2→3→4）

这是一道可以用贪心做的题。但如果换一个问题：**从位置 0，最少要跳几步才能到达最后？** 这就是 LeetCode 45 - Jump Game II。

朴素 BFS 思路：每次扩展一层 BFS，复杂度 O(n²)。用倍增思想可以把每层的扩展变成 O(1) 查表：

```typescript
/**
 * 跳跃游戏 II —— 使用倍增/跳跃表的优化解法
 * 
 * 思路：预处理 nextJump[i] = 从 i 位置往后跳，能跳到的最远位置
 * 然后用"倍增"的思想来模拟多步跳跃
 */

interface JumpTable {
  // jump[i][k] = 从位置 i 跳 2^k 次能到达的最远位置
  jump: number[][];
  n: number;
  logN: number;
}

function buildJumpTable(nums: number[]): JumpTable {
  const n = nums.length;
  const logN = Math.floor(Math.log2(n)) + 1;
  const jump: number[][] = Array.from({ length: n }, () => new Array(logN).fill(-1));

  // jump[i][0] = i 位置能跳到的最远位置
  for (let i = 0; i < n; i++) {
    jump[i][0] = Math.min(n - 1, i + nums[i]);
  }

  // jump[i][k] = jump[jump[i][k-1]][k-1]
  // 从 i 跳 2^k 步 = 从 i 跳 2^(k-1) 步，再从那个位置跳 2^(k-1) 步
  for (let k = 1; k < logN; k++) {
    for (let i = 0; i < n; i++) {
      const mid = jump[i][k - 1];
      if (mid !== -1 && mid !== n - 1) {
        jump[i][k] = jump[mid][k - 1];
      }
    }
  }

  return { jump, n, logN };
}

/**
 * 使用倍增表计算从 0 到达末尾的最少跳跃次数
 * 
 * 核心思路：从位置 0 出发，用二进制拆解来尽量跳远
 * 每次尝试用最大的 2^k 步来跳跃，直到跳不动为止
 */
function minJumpsWithTable(nums: number[]): number {
  const n = nums.length;
  if (n <= 1) return 0;

  const { jump, logN } = buildJumpTable(nums);

  let position = 0;
  let steps = 0;

  // 从当前位置出发，一直往前跳
  while (position < n - 1) {
    // 尝试用尽可能大的步幅跳，但不超过末尾
    let nextPos = position;
    for (let k = logN - 1; k >= 0; k--) {
      if (jump[position][k] > nextPos) {
        nextPos = jump[position][k];
      }
    }
    steps++;
    position = nextPos;
  }

  return steps;
}
```

不过坦率说，跳跃游戏 II 用贪心 O(n) 就能做到最优。但如果你要**查询"从某位置跳恰好 2^k 步会落在哪里"**，或者**在跳跃过程中做复杂的路径规划**，倍增表就非常有用了。

## 实际问题：消息系统的消息追溯

回到文章开头提到的消息系统场景。用倍增算法来实现：

```typescript
/**
 * 消息树 —— 使用倍增表快速查询祖先消息
 */
class MessageTree {
  private ancestor: number[][]; // 倍增表
  private readonly LOG: number;
  private readonly messages: Message[];

  constructor(messages: Message[]) {
    // messages[i] = 索引 i 的消息内容，parentId = 父消息 ID（-1 表示根）
    this.messages = messages;
    const n = messages.length;
    this.LOG = Math.floor(Math.log2(n)) + 1;
    this.ancestor = Array.from({ length: n }, () => new Array(this.LOG).fill(-1));

    // 建立 id -> index 的映射，方便查找
    const idToIndex = new Map<number, number>();
    messages.forEach((msg, idx) => idToIndex.set(msg.id, idx));

    // 填充 parent 信息
    for (let i = 0; i < n; i++) {
      const parentId = messages[i].parentId;
      this.ancestor[i][0] = parentId === -1 ? -1 : (idToIndex.get(parentId) ?? -1);
    }

    // 构建倍增表
    for (let k = 1; k < this.LOG; k++) {
      for (let i = 0; i < n; i++) {
        const mid = this.ancestor[i][k - 1];
        this.ancestor[i][k] = mid === -1 ? -1 : this.ancestor[mid][k - 1];
      }
    }
  }

  /**
   * 查询消息 id 的第 k 级祖先
   */
  getKthAncestor(messageId: number, k: number): Message | null {
    const idx = this.messages.findIndex(m => m.id === messageId);
    if (idx === -1) return null;

    let pos = idx;
    for (let i = 0; i < this.LOG; i++) {
      if (k & (1 << i)) {
        pos = this.ancestor[pos][i];
        if (pos === -1) return null;
      }
    }

    return pos === -1 ? null : this.messages[pos];
  }

  /**
   * 查找两个消息的最近公共祖先
   * 结合倍增表，可以 O(log n) 完成
   */
  findLCA(messageIdA: number, messageIdB: number): Message | null {
    const idxA = this.messages.findIndex(m => m.id === messageIdA);
    const idxB = this.messages.findIndex(m => m.id === messageIdB);
    if (idxA === -1 || idxB === -1) return null;

    // 先把两个节点拉到同一深度
    if (this.depth(idxA) < this.depth(idxB)) {
      [idxA, idxB] = [idxB, idxA];
    }

    // idxA 上跳到和 idxB 同一深度
    const depthDiff = this.depth(idxA) - this.depth(idxB);
    let posA = idxA;
    for (let i = 0; i < this.LOG; i++) {
      if (depthDiff & (1 << i)) {
        posA = this.ancestor[posA][i];
      }
    }

    if (posA === idxB) return this.messages[posA];

    // 两个节点一起往上跳，从大到小尝试
    for (let i = this.LOG - 1; i >= 0; i--) {
      if (this.ancestor[posA][i] !== this.ancestor[idxB][i]) {
        posA = this.ancestor[posA][i];
        idxB = this.ancestor[idxB][i];
      }
    }

    return this.messages[this.ancestor[posA][0]];
  }

  private depth(node: number): number {
    let d = 0;
    for (let i = 0; i < this.LOG; i++) {
      if (node === -1) break;
      // 实际上需要额外存储 depth 信息，这里简化处理
    }
    return d;
  }
}

// 定义消息类型
interface Message {
  id: number;
  parentId: number; // -1 表示根消息
  content: string;
  timestamp: number;
}

// 使用示例
const messages: Message[] = [
  { id: 1, parentId: -1, content: "根消息", timestamp: Date.now() - 10000 },
  { id: 2, parentId: 1, content: "回复根", timestamp: Date.now() - 9000 },
  { id: 3, parentId: 1, content: "另一个回复", timestamp: Date.now() - 8000 },
  { id: 4, parentId: 2, content: "回复回复", timestamp: Date.now() - 7000 },
  { id: 5, parentId: 4, content: "深层回复", timestamp: Date.now() - 6000 },
];

const tree = new MessageTree(messages);
const ancestor = tree.getKthAncestor(5, 2); // 消息5往上跳2级，应该到消息2
console.log("消息5的2级祖先:", ancestor?.content); // "回复根"
```

## 扩展：倍增 + DP 优化

倍增思想还有一个非常优雅的应用 —— **优化动态规划的转移**。

假设有一个 DP：`dp[i] = max(dp[i-1], dp[i-2], ..., dp[i-k])`，每次要取前 k 个的最大值。朴素做法是 O(k) 遍历，复杂度 O(nk)。

用**单调队列**可以做到 O(n)，但如果 k 非常大（比如 k = n），单调队列也不够快。

另一个思路：**倍增 + Sparse Table**（稀疏表）。对于可重复贡献的DP（如 max），我们可以用 RMQ 的思路在 O(n log n) 预处理后做到 O(1) 查询：

```typescript
/**
 * 倍增法构建 Sparse Table —— 用于快速区间查询
 * 适用于：区间最大值、区间最小值、区间 gcd 等"可重复贡献"的操作
 */
class SparseTable<T> {
  private st: T[][]; // st[i][k] = 区间 [i, i+2^k) 的最大值
  private readonly n: number;
  private readonly LOG: number;
  private readonly op: (a: T, b: T) => T; // 结合函数（满足结合律和幂等性）

  constructor(arr: T[], op: (a: T, b: T) => T) {
    this.n = arr.length;
    this.LOG = Math.floor(Math.log2(n)) + 1;
    this.op = op;
    this.st = Array.from({ length: this.n }, () => new Array(this.LOG));

    // 初始化：2^0 区间就是自己
    for (let i = 0; i < this.n; i++) {
      this.st[i][0] = arr[i];
    }

    // DP 构建：st[i][k] = op(st[i][k-1], st[i + 2^(k-1)][k-1])
    for (let k = 1; k < this.LOG; k++) {
      for (let i = 0; i + (1 << k) <= this.n; i++) {
        this.st[i][k] = this.op(this.st[i][k - 1], this.st[i + (1 << (k - 1))][k - 1]);
      }
    }
  }

  /**
   * 查询区间 [l, r] 的最大值（或其他可重复贡献的操作）
   * 利用二进制拆分：r - l + 1 = 2^a + 2^b + ...
   */
  query(l: number, r: number): T {
    const len = r - l + 1;
    let k = Math.floor(Math.log2(len));
    return this.op(this.st[l][k], this.st[r - (1 << k) + 1][k]);
  }
}

// 使用示例：快速求区间最大值
const arr = [1, 3, 2, 6, 4, 5, 9];
const st = new SparseTable(arr, Math.max);
console.log(st.query(1, 4)); // 6，最大值在区间 [3, 2, 6, 4] 中
console.log(st.query(0, 6)); // 9，整个数组的最大值
```

Sparse Table 的核心思想和倍增完全一致：**预处理 2^k 长度的区间答案，查询时用二进制的视角拼接**。

## 复杂度总结

| 应用场景 | 预处理复杂度 | 查询复杂度 | 空间复杂度 |
|---------|-------------|-----------|-----------|
| 快速幂 | O(log exp) | - | O(1) |
| K 级祖先 | O(N log N) | O(log K) | O(N log N) |
| 跳跃表 | O(N log N) | O(log N) | O(N log N) |
| Sparse Table（RMQ）| O(N log N) | O(1) | O(N log N) |

**核心规律**：只要问题的转移满足"可组合性"（即从 A 到 B、从 B 到 C 的结果可以直接组合成从 A 到 C 的结果），就有可能用倍增来优化。

## 总结

倍增算法的本质是**用二进制拆解来加速跳跃**：

1. **预处理阶段**：用 DP 思想建立 `dp[i][k]` = "从 i 出发，跳 2^k 步的结果"
2. **查询阶段**：把目标距离拆成二进制，从大到小尝试累加

它的应用范围非常广：
- 🏛️ **最近公共祖先（LCA）**：树上两点间距离、祖先查询
- 📊 **Sparse Table / RMQ**：区间最值查询
- 🎮 **跳跃游戏**：路径规划中的多步跳跃
- 🔢 **快速幂**：指数运算的 O(log n) 算法
- 📨 **消息/评论追溯**：O(log n) 的祖先查询

下一次当你遇到"要快速跳很多步"的问题时，别忘了倍增这把瑞士军刀 —— 把线性变对数，性能提升杠杠的 ✨。
