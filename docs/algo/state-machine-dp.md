---
title: 状态机 DP 精讲（股票买卖系列）
description: 从「为什么贪心在股票问题上会翻车」讲起，一文打通状态机 DP 的状态建模、转移方程、滚动数组优化，附 TypeScript / Python / Go 三语言完整实现、LeetCode 121 / 122 / 188 / 309 / 714 五题实战、通用状态机引擎与 2609 项暴力对拍验证
date: 2026-11-14 09:01:19
categories:
  - Algorithm
tags:
  - state-machine
  - dynamic-programming
  - stock
  - leetcode
  - interview
  - dp
sidebarSort: 134
---

# 状态机 DP 精讲（股票买卖系列）

先问你一个挺实际的问题。

你打开券商 App，看见了这只股票过去 30 天的价格：

```text
[1, 2, 3, 0, 2]
```

规则是这样的：**每天只能做一个动作** —— 买入一股、卖出一股、或者什么都不做。问：**最多能赚多少钱？**

大部分人第一反应是："找最低点买、最高点卖啊。" 那好，1 买 3 卖，赚 2。

但这里有个坑：如果你**只在最低点买、最高点卖**，你就永远只有一笔交易。而实际上，**可以交易多次**才是这类题的真正难点。

而且规则还会变：

- 只能交易 **1 次** → LeetCode 121
- 可以交易**无限次** → LeetCode 122
- 最多交易 **k 次** → LeetCode 188
- 卖出后要**冷冻 1 天**才能再买 → LeetCode 309
- 每笔交易要交**手续费** → LeetCode 714

**五个变体，五个答案。** 如果每个都单独想一遍，你会发现自己一直在重复思考同一件事：

> "我现在处于什么状态？在这个状态下，我今天能做哪些动作？"

想明白这句话，这五道题就全通了 ✨。

这就是**状态机 DP**。

---

## 一、先说清楚：为什么需要状态机 DP

### 1.1 从暴力枚举说起

最直接的想法：每天三个选择（买 / 卖 / 不动），`n` 天就是 `3^n` 种组合，暴力枚举所有组合，取收益最大的。

```text
n = 10 天 → 3^10 = 59049 种
n = 20 天 → 3^20 ≈ 34.8 亿种  💥
n = 30 天 → 直接爆炸
```

LeetCode 的数据范围是 `5 × 10^4` 天。暴力？做梦。

但暴力有它的价值 —— **它是最好的验证工具**。我后面所有的代码都会跟它对拍。

### 1.2 贪心的失败现场

很多人会想用贪心："每次都买在最低点、卖在最高点。"

我们来验证一下这个想法有多脆弱。考虑这个价格序列：

```text
价格： [1, 5, 2, 8]
```

贪心会怎么做？

```text
第 0 天 1 元  → 买
第 1 天 5 元  → 卖，赚 4
第 2 天 2 元  → 买
第 3 天 8 元  → 卖，赚 6
合计 = 10 ✅
```

这题贪心是对的。但换个数据：

```text
价格： [1, 2, 3, 0, 2]
```

如果用**"一笔交易"**的贪心（找全局最低买、最高卖）：1 买 3 卖 = 2。

但如果**允许多笔交易**，最优是：

```text
第 0 天 1 元 → 买
第 1 天 2 元 → 卖        赚 1
（冷冻期 or 不冷冻，看题目）
第 3 天 0 元 → 买
第 4 天 2 元 → 卖        赚 2
合计 = 3 ✅
```

**同样的价格序列，贪心给出 2，DP 给出 3。**

问题的本质在于：**"我今天要不要买"这个决策，取决于我当前手上有没有股票。** 贪心只看价格，不看状态，所以它必然丢信息。

### 1.3 关键洞察：把"处境"显式地建模出来

这就是状态机 DP 的核心思想：

> **不要问"今天做什么"，要问"我今天处于什么状态，在这个状态下我能做什么"。**

"处境"（比如：我现在持股 / 空仓 / 刚卖出）就是**状态**。把每个可能的处境列出来，把每种处境下允许的动作列出来 —— 这就构成了一个**状态机**。

一旦状态机画出来了，DP 就是水到渠成的：**用 DP 数组记录"到达每个状态的最大收益"**，然后一天一天往前推。

### 1.4 状态机 DP vs 状态压缩 DP

站内已经有一篇[状态压缩动态规划（Bitmask DP）](bitmask-dp.md)。这两个东西容易混，我这里划清楚：

| | 状态压缩 DP | 状态机 DP |
| --- | --- | --- |
| 状态是什么 | 一个整数的二进制位（子集） | 一个具名的处境（持股/空仓/冷冻） |
| 状态数量 | 最多 `2^n` | 通常 2 ~ 10 个 |
| 转移方式 | 子集枚举 | 显式的边 |
| 典型题 | TSP、集合覆盖 | 股票、状态机建模 |

**关系**是：状态压缩 DP 其实是状态机 DP 的一个特例 —— 只不过它的状态"没有名字"，只能用二进制位表示。状态机 DP 的状态是**人话能读懂**的，这也是它更好推广的原因。

---

## 二、原理拆解

### 2.1 状态机 DP 的三件套

任何一道状态机 DP 题，你只需要搞清楚三件事：

```text
┌─────────────────────────────────────────────────────────┐
│  1. 状态（State）  —— 我可能处于哪些处境？               │
│     例：hold（持股）/ sold（刚卖出）/ rest（空仓待命）    │
├─────────────────────────────────────────────────────────┤
│  2. 动作/边（Edge）—— 在状态 A 下，做什么会到状态 B？    │
│     例：rest --买入(-price)--> hold                     │
│         hold --卖出(+price)--> sold                     │
│         sold --冷冻一天--> rest                         │
├─────────────────────────────────────────────────────────┤
│  3. 收益（Gain） —— 执行这个动作，今天的账变了多少？      │
│     例：买入 = -price，卖出 = +price                    │
└─────────────────────────────────────────────────────────┘
```

搞清这三样，代码就是照着抄。

### 2.2 图解：冷冻期版本的状态机

以 LeetCode 309（冷冻期 1 天）为例，三个状态：

```text
                        买入 (-price)
              ┌──────────────────────────┐
              │                          ▼
        ┌───────────┐              ┌───────────┐
        │   rest    │              │   hold    │
        │ (空仓待命) │              │  (持股中)  │
        └───────────┘              └───────────┘
              ▲                          │
              │        卖出 (+price)      │
              │                          ▼
              │        冷冻 1 天       ┌───────────┐
              └────────────────────────│   sold    │
                     (不能停留)        │ (刚卖出)  │
                                       └───────────┘
```

**关键在 `sold` 这个状态**：它**不能停留**。卖出之后必须经过一个"冷冻日"才能回到 `rest`。这就是"冷冻期"的全部实现 —— **多加一个状态，让"刚卖出"这个信息能被 DP 记住**。

很多人在这里卡住，是因为他们只设了 `hold` / `rest` 两个状态，然后试图在 `rest` 里记录"还剩几天才能买"，结果写出一堆 if-else。**加一个状态，比加一堆标志位干净得多。**

### 2.3 DP 定义与转移方程

定义：

```text
dp[i][s] = 第 i 天结束时，处于状态 s 时的最大收益
```

转移：**新状态的值 = 从所有能到达它的前驱状态转移过来，取最大值**。

以冷冻期为例（`p_i` 表示第 `i` 天价格）：

```text
dp[i][hold] = max(dp[i-1][hold], dp[i-1][rest] - p_i)
dp[i][sold] = dp[i-1][hold] + p_i
dp[i][rest] = max(dp[i-1][rest], dp[i-1][sold])
```

逐条翻译成人话：

- **hold**（今天结束还持股）：要么昨天就持股，今天啥也不干；要么昨天空仓，今天买入（花掉 `p_i`）
- **sold**（今天刚卖出）：只能从昨天的 `hold` 卖过来，收入 `p_i`
- **rest**（今天空仓且不是刚卖出）：要么昨天就 `rest`；要么昨天刚 `sold`，今天冷冻结束

### 2.4 滚动数组：为什么只要 O(1) 空间

注意上面三个式子，**`dp[i]` 只依赖 `dp[i-1]`**。也就是说，我根本不需要存一整个二维数组！

```text
第 i 天的 dp  ← 只需要第 i-1 天的 dp
```

用一个长度为 3 的数组滚动就行：

```typescript
// 今天算出的新值
const nHold = Math.max(hold, rest - p);
const nSold = hold + p;
const nRest = Math.max(rest, sold);

// 一次性全部更新（注意：先算完再赋值）
hold = nHold;
sold = nSold;
rest = nRest;
```

⚠️ **这里有个大坑**：必须**先算完所有新值，再统一赋值**。如果你写成：

```typescript
hold = Math.max(hold, rest - p);  // ❌ 先更新了 hold
sold = hold + p;                   // ❌ 这里用的是新 hold！
```

那就等于**同一天买入又卖出**，凭空多出一笔交易。这种 bug 很隐蔽，因为结果往往"看起来对"，只是偏大。

正确写法要么用临时变量（像上面那样），要么倒序更新（LC 188 那题就是靠倒序保证顺序）。

### 2.5 初始化：负无穷（`-Infinity`）是灵魂

初始状态（还没开始，第一天之前）：

| 状态 | 初值 | 为什么 |
| --- | --- | --- |
| `hold` | `-Infinity` | 没买过股票，持股状态**不可能**存在 |
| `sold` | `-Infinity` | 同理，今天不可能"刚卖出" |
| `rest` | `0` | 什么都不做，收益 0 |

**为什么 `hold` 必须是 `-Infinity` 而不是 0？**

如果你把 `hold` 初始化成 0，那么第一天就会变成"免费获得一股股票"，后面全是错的。

这就是 DP 里的经典技巧：**不可达状态用 `-Infinity` 表示**，这样 `max` 会自动忽略它。如果你用 `0` 表示不可达，那 `max` 就分不清"收益是 0"和"根本到不了"。

### 2.6 答案从哪个状态取？

最后一天结束时，你**肯定不能还持股**（没卖出的股票算亏损，不能算收益）。所以答案应该是：

```typescript
answer = Math.max(sold, rest);   // 冷冻期：rest 和 sold 都合法
```

而不是 `Math.max(hold, sold, rest)`。

不同题目的合法终态不一样：

| 题目 | 合法终态 |
| --- | --- |
| LC 121 / 122 / 714 | `rest`（只有空仓这一个状态） |
| LC 309 | `sold` 或 `rest` |
| LC 188 | `sell[k]` |

**终态选错，答案会莫名偏大。** 比如 LC 309 里如果把 `hold` 也算进去，就等于允许"最后一天买入还没卖"，这显然不合法。

---

## 三、代码实现

### 3.1 先写一个通用状态机引擎

我发现五道题的 DP 结构惊人地相似，那干脆抽象出一个引擎：**状态 + 边 + 收益**，配置好就出答案。

```typescript
/**
 * 通用状态机 DP 引擎
 *
 * 抽象出来的三件套：
 *   states —— 我可能处于哪些处境
 *   edges  —— 在某个处境下做什么动作，会到哪个处境
 *   gain   —— 做这个动作，今天的账变了多少
 */
export interface MachineState {
  name: string;
  /** 今天「什么都不做」能否继续保持该状态 */
  canStay: boolean;
}

export interface MachineEdge {
  from: string;
  to: string;
  /** 今天执行这个动作带来的收益 */
  gain: (price: number) => number;
}

export interface MachineOptions {
  states: MachineState[];
  edges: MachineEdge[];
  /** 第 0 天开始前的初始状态值 */
  init: Record<string, number>;
  /** 哪些状态可以作为最终答案 */
  terminal: string[];
}

export function runMachine(
  prices: number[],
  opts: MachineOptions,
): { best: number; trace: Record<string, number>[] } {
  const names = opts.states.map((s) => s.name);
  const NEG = -Infinity;

  let dp: Record<string, number> = {};
  for (const n of names) dp[n] = opts.init[n] ?? NEG;

  const trace: Record<string, number>[] = [];

  for (const price of prices) {
    // ① 先算新值：一个状态可以从「原地停留」或「某条边的终点」到达
    const next: Record<string, number> = {};
    for (const s of opts.states) {
      next[s.name] = s.canStay ? dp[s.name] : NEG;
    }

    // ② 枚举所有边做转移
    for (const e of opts.edges) {
      const from = dp[e.from];
      if (from === NEG) continue; // 前驱不可达，跳过
      const cand = from + e.gain(price);
      if (cand > next[e.to]) next[e.to] = cand;
    }

    // ③ 统一赋值（绝不能边算边赋！）
    dp = next;
    trace.push({ ...dp });
  }

  let best = NEG;
  for (const t of opts.terminal) best = Math.max(best, dp[t]);
  return { best, trace };
}
```

这个引擎的复杂度是 `O(n × (|S| + |E|))`，其中 `n` 是天数，`|S|` 是状态数，`|E|` 是边数。

### 3.2 用引擎跑五道题

```typescript
// ---------- LC 122. 买卖股票的最佳时机 II（可以交易多次） ----------
export function machineUnlimited(prices: number[]): number {
  return runMachine(prices, {
    states: [
      { name: "hold", canStay: true },
      { name: "rest", canStay: true },
    ],
    edges: [
      { from: "rest", to: "hold", gain: (p) => -p },  // 买入
      { from: "hold", to: "rest", gain: (p) => p },   // 卖出
    ],
    init: { hold: -Infinity, rest: 0 },
    terminal: ["rest"],
  }).best;
}

// ---------- LC 714. 买卖股票的最佳时机 IV（每笔手续费） ----------
export function machineFee(prices: number[], fee: number): number {
  return runMachine(prices, {
    states: [
      { name: "hold", canStay: true },
      { name: "rest", canStay: true },
    ],
    edges: [
      { from: "rest", to: "hold", gain: (p) => -p },
      // 手续费是「一笔交易」只收一次，所以只在卖出时扣
      { from: "hold", to: "rest", gain: (p) => p - fee },
    ],
    init: { hold: -Infinity, rest: 0 },
    terminal: ["rest"],
  }).best;
}

// ---------- LC 309. 最佳买卖股票时机 III（冷冻期 1 天） ----------
export function machineCooldown(prices: number[]): number {
  return runMachine(prices, {
    states: [
      { name: "hold", canStay: true },
      { name: "sold", canStay: false }, // 刚卖出，不能停留
      { name: "rest", canStay: true },
    ],
    edges: [
      { from: "rest", to: "hold", gain: (p) => -p },
      { from: "hold", to: "sold", gain: (p) => p },
      { from: "sold", to: "rest", gain: () => 0 }, // 冷冻一天后恢复
    ],
    init: { hold: -Infinity, sold: -Infinity, rest: 0 },
    terminal: ["sold", "rest"],
  }).best;
}
```

看这三段代码，是不是感觉特别清爽？**状态机建模的价值就在这儿** —— 逻辑和代码一一对应，几乎不会写错。

### 3.3 但工程上还是手写更快

引擎很优雅，但每次转移都要走对象属性查找，实测比手写慢一个数量级。**面试和生产环境，手写特化版本。**

```typescript
// ---------- LC 121. 买卖股票的最佳时机（只能交易一次） ----------
export function maxProfitOnce(prices: number[]): number {
  let minPrice = Infinity; // 历史最低价
  let best = 0; // 最大利润
  for (const p of prices) {
    minPrice = Math.min(minPrice, p);
    best = Math.max(best, p - minPrice);
  }
  return best;
}

// ---------- LC 122. 买卖股票的最佳时机 II（可以交易多次） ----------
export function maxProfitUnlimited(prices: number[]): number {
  let best = 0;
  for (let i = 1; i < prices.length; i++) {
    best += Math.max(0, prices[i] - prices[i - 1]);
  }
  return best;
}

// ---------- LC 309. 最佳买卖股票时机 III（冷冻期 1 天） ----------
export function maxProfitCooldown(prices: number[]): number {
  // hold：持股中
  // sold：今天刚卖出
  // rest：空仓且今天没有卖出（明天可以买）
  let hold = -Infinity;
  let sold = -Infinity;
  let rest = 0;
  for (const p of prices) {
    const nHold = Math.max(hold, rest - p);
    const nSold = hold + p;
    const nRest = Math.max(rest, sold);
    hold = nHold; // 先算完再统一赋值
    sold = nSold;
    rest = nRest;
  }
  return Math.max(sold, rest);
}

// ---------- LC 714. 买卖股票的最佳时机 IV（每笔手续费 fee） ----------
// 关键：手续费是「一笔交易」（买入 + 卖出）只收一次，所以只在卖出时扣
export function maxProfitWithFee(prices: number[], fee: number): number {
  let hold = -Infinity;
  let rest = 0;
  for (const p of prices) {
    const nHold = Math.max(hold, rest - p);
    const nRest = Math.max(rest, hold + p - fee);
    hold = nHold;
    rest = nRest;
  }
  return rest;
}

// ---------- LC 188. 买卖股票的最佳时机 IV（最多 k 次交易） ----------
export function maxProfitK(prices: number[], k: number): number {
  const n = prices.length;
  if (n < 2 || k <= 0) return 0;
  // 快捷分支：n 天最多做 floor(n/2) 笔交易，k 够大就等于不限次数
  if (k >= Math.floor(n / 2)) return maxProfitUnlimited(prices);

  // buy[j]：已买入第 j 笔（持有中）时的最大收益
  // sell[j]：已完成 j 笔交易（空仓）时的最大收益
  const buy = new Array<number>(k + 1).fill(-Infinity);
  const sell = new Array<number>(k + 1).fill(0);

  for (const p of prices) {
    // 必须倒序！这样 sell[j-1] 还是「昨天」的值，不会用到今天的数据
    for (let j = k; j >= 1; j--) {
      sell[j] = Math.max(sell[j], buy[j] + p);
      buy[j] = Math.max(buy[j], sell[j - 1] - p);
    }
  }
  return sell[k];
}
```

### 3.4 LC 188 的倒序为什么关键

LC 188 是这五道题里最容易写错的。核心就一句话：

> **`j` 必须从大到小遍历**，这样 `sell[j - 1]` 读到的还是**前一天**的值。

```text
正序遍历 j = 1, 2, 3:
  j=1: sell[1] = max(sell[1], buy[1] + p)   // 用的是今天的 buy[1]？不一定
  j=2: sell[2] = max(sell[2], buy[2] + p)
       buy[2] = max(buy[2], sell[1] - p)   // ⚠️ sell[1] 已经被今天更新过了！
       → 同一天完成「卖出第 1 笔」又「买入第 2 笔」，凭空多一笔交易 ❌

倒序遍历 j = k, k-1, ..., 1:
  j=3: sell[3] = max(sell[3], buy[3] + p)   // buy[3] 昨天就更新好了
       buy[3] = max(buy[3], sell[2] - p)   // sell[2] 还没被今天碰过 ✅
  j=2: sell[2] = ...
       buy[2] = max(buy[2], sell[1] - p)   // sell[1] 依然是昨天的值 ✅
  j=1: ...
```

**规律和 2.4 节说的一样：先算后赋，或者倒序。** 二选一，别混着来。

### 3.5 状态流转表（真实运行结果）

我写了个小工具把每一步的 DP 值打出来。冷冻期版本，`prices = [1, 2, 3, 0, 2]`：

```text
day  price |   hold   sold   rest
-----+-------+-----------------------
  0  |     1 |  -1.00    -∞    0.00
  1  |     2 |  -1.00   1.00   0.00
  2  |     3 |  -1.00   2.00   1.00
  3  |     0 |   1.00  -1.00   2.00
  4  |     2 |   1.00   3.00   2.00
```

**逐行读一遍**，你就能感受到状态机 DP 在干什么：

- **day 0**（价 1）：`hold = -1`（花 1 块买了），`rest = 0`（啥也没干），`sold = -∞`（不可能）
- **day 1**（价 2）：`sold = 1`（昨天买的今天 2 块卖了，赚 1），`rest` 还是 0（昨天的 hold 没法直接变 rest，必须经过 sold）
- **day 2**（价 3）：`sold = 2`（继续持有到 3 块卖，赚 2），`rest = 1`（昨天的 sold 到今天解冻，变成空仓）
- **day 3**（价 0）：`hold = 1`（用 `rest=1` 减去 0 买入，白嫖一个坑位），`sold = -1`（0 块卖出是亏的）
- **day 4**（价 2）：**`sold = 3`** ✅ 这就是答案

答案的来源路径：**day 0 买（-1）→ day 1 卖（+2，净赚 1）→ day 3 买（0）→ day 4 卖（+2，净赚 2），合计 3**。

手续费版本，`prices = [1, 3, 2, 8, 4, 9]`，`fee = 2`：

```text
day  price |   hold   rest
-----+-------+---------------
  0  |     1 |  -1.00   0.00
  1  |     3 |  -1.00   0.00
  2  |     2 |  -1.00   0.00
  3  |     8 |  -1.00   5.00
  4  |     4 |   1.00   5.00
  5  |     9 |   1.00   8.00
```

day 3 那行 `rest = 5` 是关键：1 买 8 卖，减去 2 手续费，净赚 5。day 5 的 `rest = 8` = 上一笔的 5 + (4 买 9 卖 - 2 手续费 = 3) = 8 ✅。

---

## 四、Python 实现

```python
from typing import List


def max_profit_once(prices: List[int]) -> int:
    """LC 121：只能交易一次"""
    min_price = float("inf")
    best = 0
    for p in prices:
        min_price = min(min_price, p)
        best = max(best, p - min_price)
    return best


def max_profit_unlimited(prices: List[int]) -> int:
    """LC 122：可以交易多次"""
    best = 0
    for i in range(1, len(prices)):
        best += max(0, prices[i] - prices[i - 1])
    return best


def max_profit_cooldown(prices: List[int]) -> int:
    """LC 309：冷冻期 1 天"""
    hold = float("-inf")
    sold = float("-inf")
    rest = 0
    for p in prices:
        n_hold = max(hold, rest - p)
        n_sold = hold + p
        n_rest = max(rest, sold)
        hold, sold, rest = n_hold, n_sold, n_rest
    return int(max(sold, rest))


def max_profit_with_fee(prices: List[int], fee: int) -> int:
    """LC 714：每笔交易手续费（买入+卖出算一笔，只收一次）"""
    hold = float("-inf")
    rest = 0
    for p in prices:
        n_hold = max(hold, rest - p)
        n_rest = max(rest, hold + p - fee)
        hold, rest = n_hold, n_rest
    return int(rest)


def max_profit_k(prices: List[int], k: int) -> int:
    """LC 188：最多 k 次交易"""
    n = len(prices)
    if n < 2 or k <= 0:
        return 0
    if k >= n // 2:
        return max_profit_unlimited(prices)

    buy = [float("-inf")] * (k + 1)
    sell = [0] * (k + 1)
    for p in prices:
        for j in range(k, 0, -1):  # 倒序！
            sell[j] = max(sell[j], buy[j] + p)
            buy[j] = max(buy[j], sell[j - 1] - p)
    return sell[k]
```

Python 版和 TS 版是**逐行对应的**，这正是状态机建模的好处：**思路可以 1:1 翻译，不会有"翻译走样"的问题。**

---

## 五、Go 实现

```go
package main

import (
	"fmt"
	"math"
)

// maxProfitOnce LC 121：只能交易一次
func maxProfitOnce(prices []int) int {
	minPrice := math.MaxInt32
	best := 0
	for _, p := range prices {
		if p < minPrice {
			minPrice = p
		}
		if v := p - minPrice; v > best {
			best = v
		}
	}
	return best
}

// maxProfitUnlimited LC 122：可以交易多次
func maxProfitUnlimited(prices []int) int {
	best := 0
	for i := 1; i < len(prices); i++ {
		if prices[i] > prices[i-1] {
			best += prices[i] - prices[i-1]
		}
	}
	return best
}

// maxProfitCooldown LC 309：冷冻期 1 天
func maxProfitCooldown(prices []int) int {
	hold := math.Inf(-1)
	sold := math.Inf(-1)
	rest := 0.0
	for _, p := range prices {
		nHold := math.Max(hold, rest-float64(p))
		nSold := hold + float64(p)
		nRest := math.Max(rest, sold)
		hold, sold, rest = nHold, nSold, nRest
	}
	return int(math.Max(sold, rest))
}

// maxProfitWithFee LC 714：每笔交易手续费
func maxProfitWithFee(prices []int, fee int) int {
	hold := math.Inf(-1)
	rest := 0.0
	for _, p := range prices {
		nHold := math.Max(hold, rest-float64(p))
		nRest := math.Max(rest, hold+float64(p)-float64(fee))
		hold, rest = nHold, nRest
	}
	return int(rest)
}

// maxProfitK LC 188：最多 k 次交易
func maxProfitK(prices []int, k int) int {
	n := len(prices)
	if n < 2 || k <= 0 {
		return 0
	}
	if k >= n/2 {
		return maxProfitUnlimited(prices)
	}
	buy := make([]float64, k+1)
	sell := make([]float64, k+1)
	for i := range buy {
		buy[i] = math.Inf(-1)
	}
	for _, p := range prices {
		for j := k; j >= 1; j-- {
			sell[j] = math.Max(sell[j], buy[j]+float64(p))
			buy[j] = math.Max(buy[j], sell[j-1]-float64(p))
		}
	}
	return int(sell[k])
}
```

Go 里有个小细节：不可达状态要用 `math.Inf(-1)` 而不是 `0`。另外 `math.MaxInt32` 做初始最小值时，要留意题目里价格可能为 0 的情况 —— 严格点可以直接用 `prices[0]` 初始化。

---

## 六、LeetCode 实战

### 6.1 五题速查表

| 题号 | 题目 | 关键约束 | 状态设计 | 终态 |
| --- | --- | --- | --- | --- |
| 121 | 买卖股票的最佳时机 | 只能交易 1 次 | 贪心 / `hold`+`rest` | `rest` |
| 122 | 买卖股票的最佳时机 II | 不限次数 | `hold`+`rest` | `rest` |
| 188 | 买卖股票的最佳时机 IV | 最多 k 次 | `buy[j]`+`sell[j]` | `sell[k]` |
| 309 | 最佳买卖股票时机 III | 冷冻期 1 天 | `hold`+`sold`+`rest` | `sold`, `rest` |
| 714 | 买卖股票的最佳时机 IV | 手续费 | `hold`+`rest` | `rest` |

### 6.2 一个进阶组合：手续费 + 冷冻期

如果两个限制同时存在呢？状态机引擎直接加一条边就行：

```typescript
function maxProfitFeeAndCooldown(prices: number[], fee: number): number {
  return runMachine(prices, {
    states: [
      { name: "hold", canStay: true },
      { name: "sold", canStay: false },
      { name: "rest", canStay: true },
    ],
    edges: [
      { from: "rest", to: "hold", gain: (p) => -p },
      { from: "hold", to: "sold", gain: (p) => p - fee },
      { from: "sold", to: "rest", gain: () => 0 },
    ],
    init: { hold: -Infinity, sold: -Infinity, rest: 0 },
    terminal: ["sold", "rest"],
  }).best;
}
```

**状态机建模的能力就在这里** —— 约束变一个，就是加一个状态或改一条边，不用重新推导。

### 6.3 变体练习

同一套框架还能扩展出这些题：

| 题目 | 状态改动 |
| --- | --- |
| 最多 k 次交易 + 冷冻期 | `buy[j]` / `sell[j]` / `frozen[j]` |
| 允许做空 | 加 `short` 状态 |
| 杠杆交易（可借股票） | `hold` 状态允许负成本 |
| 每日最多交易 t 次 | 状态加"当日已交易次数"维度 |
| 带印花税（按成交额百分比） | `gain` 改成非线性函数 |

**试着加一个"允许做空"的状态**，你就会发现 —— 状态机的状态数线性增长，而 DP 的复杂度只是 `O(n × |S|)`，依然轻松。

---

## 七、正确性验证

### 7.1 与暴力枚举对拍

光看代码不算数。我写了一个**暴力枚举**：递归遍历每一天的所有动作（买 / 卖 / 不动），穷举全部合法路径，取收益最大值。

```typescript
/**
 * 暴力：枚举所有买卖动作序列
 * 官方语义：手续费是「一笔交易」（买入 + 卖出）只收一次，因此在卖出时扣
 */
function brute(
  prices: number[],
  opts: { maxTrades: number; fee: number; cooldown: number },
): number {
  const { maxTrades, fee, cooldown } = opts;
  let best = 0;

  const dfs = (
    i: number,
    holding: boolean,
    cash: number,
    trades: number,
    cooldownLeft: number,
  ): void => {
    if (i === prices.length) {
      if (!holding) best = Math.max(best, cash);
      return;
    }
    const p = prices[i];
    dfs(i + 1, holding, cash, trades, Math.max(0, cooldownLeft - 1)); // 不动
    if (holding) {
      dfs(i + 1, false, cash + p - fee, trades + 1, cooldown); // 卖出
    } else if (cooldownLeft === 0 && trades < maxTrades) {
      dfs(i + 1, true, cash - p, trades, 0); // 买入
    }
  };

  dfs(0, false, 0, 0, 0);
  return best;
}
```

然后跑随机对拍：

```typescript
let seed = 42;
function rand(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

for (let iter = 0; iter < 300; iter++) {
  const prices = Array.from({ length: 1 + Math.floor(rand() * 12) },
    () => Math.floor(rand() * 20));

  // LC 121
  check(`LC121 #${iter}`, maxProfitOnce(prices),
    brute(prices, { maxTrades: 1, fee: 0, cooldown: 0 }));

  // LC 122 + 引擎版
  check(`LC122 #${iter}`, maxProfitUnlimited(prices),
    brute(prices, { maxTrades: 99, fee: 0, cooldown: 0 }));
  check(`engine-unlimited #${iter}`, machineUnlimited(prices),
    brute(prices, { maxTrades: 99, fee: 0, cooldown: 0 }));

  // LC 309 + 引擎版
  check(`LC309 #${iter}`, maxProfitCooldown(prices),
    brute(prices, { maxTrades: 99, fee: 0, cooldown: 1 }));
  check(`engine-cooldown #${iter}`, machineCooldown(prices),
    brute(prices, { maxTrades: 99, fee: 0, cooldown: 1 }));

  // LC 714 + 引擎版
  const fee = Math.floor(rand() * 5);
  check(`LC714 #${iter}`, maxProfitWithFee(prices, fee),
    brute(prices, { maxTrades: 99, fee, cooldown: 0 }));
  check(`engine-fee #${iter}`, machineFee(prices, fee),
    brute(prices, { maxTrades: 99, fee, cooldown: 0 }));

  // LC 188
  const k = Math.floor(rand() * 5);
  check(`LC188 #${iter}`, maxProfitK(prices, k),
    brute(prices, { maxTrades: k, fee: 0, cooldown: 0 }));
}
```

**实测结果**：

```text
=== 官方样例 ===
通过 2609 项，失败 0 项
✅ 全部一致
```

覆盖了 5 道题的特化实现 + 引擎实现 + 官方样例，一共 **2609 项断言全过** ✅

### 7.2 LC 188 专项压测

LC 188 的快捷分支（`k >= floor(n/2)` 时退化成不限次数）是最容易出错的地方，我单独压测了 2 万组：

```text
通过 20000 项，失败 0 项（其中快捷分支命中 13801 次）
```

13801 次快捷分支全部正确，说明 `k >= floor(n/2)` 这个等价关系是成立的。

### 7.3 三语言一致性

Python 和 Go 的版本也跑了同样的官方样例：

```text
✅ Python 官方样例全部通过
✅ Python 200 组随机数据性质校验通过

maxProfitOnce       4 want 4
maxProfitUnlimited  7 want 7
maxProfitCooldown   3 want 3
maxProfitWithFee    8 want 8
maxProfitK          7 want 7
maxProfitK(decline) 0 want 0
```

---

## 八、复杂度分析与性能实测

### 8.1 复杂度

| 版本 | 时间 | 空间 |
| --- | --- | --- |
| LC 121（贪心） | `O(n)` | `O(1)` |
| LC 122（贪心） | `O(n)` | `O(1)` |
| LC 309（3 状态 DP） | `O(n)` | `O(1)` |
| LC 714（2 状态 DP） | `O(n)` | `O(1)` |
| LC 188（k 维 DP） | `O(nk)` | `O(k)` |
| 通用引擎 | `O(n × (|S| + |E|))` | `O(|S|)` |

**为什么状态机 DP 的空间是 `O(1)`？** 因为滚动数组 —— 每一层只依赖上一层。`n` 层 DP 被压成了常数个变量。

### 8.2 实测数据

5 万天随机价格，同一台机器同一份代码：

```text
LC121 一次交易                   0.242 ms
LC122 不限次数                   0.043 ms
LC309 冷冻期                     0.273 ms
LC714 手续费                     0.379 ms
LC188 k=10                       0.937 ms
LC188 k=1000                    58.596 ms
通用状态机引擎(2状态)             5.635 ms
通用状态机引擎(3状态)             6.602 ms
```

几个观察：

1. **LC 188 的 `k` 是复杂度瓶颈**。`k=10` 时 0.9ms，`k=1000` 时 58ms，**差 60 倍**，因为复杂度是 `O(nk)`。所以那个 `k >= n/2` 的快捷分支很重要 —— 它把 `O(nk)` 直接压成 `O(n)`。

2. **引擎比手写慢 10~20 倍**。2 状态引擎 5.6ms vs 手写 LC 714 的 0.38ms。原因是引擎每次转移都要做对象属性查找（`dp[e.from]`、`next[e.to]`），还有 `Math.max` 的多态调用。**引擎适合教学和原型，手写适合生产。**

3. **引擎随状态数线性增长**，验证了 `O(n × (|S| + |E|))`：

```text
引擎 2 状态 / 2 边      3.326 ms
引擎 4 状态 / 4 边      6.015 ms
引擎 8 状态 / 8 边     13.615 ms
引擎 16 状态 / 16 边   34.981 ms
引擎 32 状态 / 32 边   80.115 ms
```

状态数翻倍，时间也基本翻倍 —— 线性关系，非常干净。

### 8.3 什么时候用状态机 DP？

**✅ 适合：**

| 特征 | 例子 |
| --- | --- |
| 每天/每步只能做有限几个动作 | 股票交易、任务调度 |
| 当前决策依赖"历史留下的处境" | 持股状态、剩余冷却期 |
| 状态数量少（< 20） | 订单状态、限流器状态 |
| 需要求"最优收益"而非"是否可行" | 最大化利润、最小成本 |

**❌ 不适合：**

| 特征 | 该用什么 |
| --- | --- |
| 状态数会指数增长 | 状态压缩 DP / 状压枚举 |
| 只需判断"能不能"而非"最优多少" | BFS / DFS |
| 连续数值区间上的最优划分 | 斜率优化 / CHT（见 [DP 优化精讲](dp-optimization.md)） |
| 状态之间有"包含"关系 | 树形 DP / 状压 DP |

---

## 九、踩过的坑

### 坑 1：手续费到底扣几次？

这个坑我自己踩过。

第一次写 LC 714，我在**买入时扣了 fee，卖出时又扣了一次**：

```typescript
// ❌ 错误：手续费被扣了两次
const nHold = Math.max(hold, rest - p - fee);
const nRest = Math.max(rest, hold + p - fee);
```

跑官方样例 `[1,3,2,8,4,9], fee=2`，我得到 **4**，官方答案是 **8**。

查了题面才发现，LeetCode 714 的原文写得很清楚：

> The transaction fee is only charged once for each stock purchase and sale.

**手续费是"一笔交易"（买入 + 卖出配成一对）只收一次。** 正确写法是**只在卖出时扣**：

```typescript
// ✅ 正确：只在卖出时扣
const nHold = Math.max(hold, rest - p);
const nRest = Math.max(rest, hold + p - fee);
```

有意思的是，如果手续费**改成每次动作都收**（买卖各一次），那是一个**不同的问题**，答案确实会变。这提醒我们：**做算法题一定要读清题面的语义，别凭直觉。**

### 坑 2：原地更新导致同一天买又卖

```typescript
// ❌ 错误
hold = Math.max(hold, rest - p);
sold = hold + p;      // 用的是「今天刚更新的 hold」！
rest = Math.max(rest, sold);
```

这样写等于允许同一天买入再卖出，凭空多一笔交易。**症状是答案偏大，而且小数据上可能看不出来。**

正确做法：**用临时变量先算完所有新值，再统一赋值。**

### 坑 3：LC 188 正序遍历

```typescript
// ❌ 错误：正序
for (let j = 1; j <= k; j++) {
  sell[j] = Math.max(sell[j], buy[j] + p);
  buy[j] = Math.max(buy[j], sell[j - 1] - p);
}
```

`sell[j-1]` 已经被今天更新过了，导致同一天"卖出上一笔 + 买入下一笔"。**改成倒序就对了。**

### 坑 4：不可达状态初始化成 0

```typescript
// ❌ 错误
let hold = 0;   // 第一天就"免费"获得一股股票
```

必须用 `-Infinity`。用 0 的话，`Math.max` 分不清"收益是 0"和"这个状态根本到不了"，结果整个 DP 崩掉。

### 坑 5：终态选错，把 `hold` 也算进答案

```typescript
// ❌ 错误：LC 309 的答案
return Math.max(hold, sold, rest);
```

最后一天还持股，等于允许"没卖出的股票"也算收益。**答案必须只在"空仓"的终态里取。**

### 坑 6：`-Infinity` 的序列化问题

如果你的 DP 结果要存进 Redis 或者返回给前端，`JSON.stringify(-Infinity)` 会得到 **`null`**，不是 `-Infinity`！

```typescript
JSON.stringify({ v: -Infinity });  // '{"v":null}'
```

要么在边界处转成 `null` 并在读取时转回来，要么直接用 `Number.NEGATIVE_INFINITY` 加显式的 `isFinite` 判断。**这是个真实踩过的坑** —— 前端拿到 `null` 一脸茫然。

### 坑 7：手续费版的 `rest` 初值

手续费版的 `rest` 初值是 0（什么都不做），但 `hold` 必须是 `-Infinity`。如果你两个都写 0，那么第一天的 `hold = max(0, 0 - p) = 0`，相当于白送一股股票。

### 坑 8：以为冷冻期是"卖出后不能卖"

错。**冷冻期的语义是"卖出后不能再买"**，而且通常是**冷冻 1 天**（即卖出当天不能买、第二天可以买）。

我第一次做 LC 309，把冷冻期理解成"卖出后 1 天内不能做任何操作"，答案就变成了 2 而不是 3。

记住状态机图里的那条边：`sold --(不能停留)--> rest`，**冷冻期就是"多了一个必须经过的中间状态"**。

---

## 十、实际应用

说真的，股票只是状态机 DP 的"入门练习题"。这个思想在工程里到处都是。

### 10.1 订单状态机（电商 / 支付）

```text
待支付 --支付--> 待发货 --发货--> 已发货 --确认--> 已完成
   |                                  |
   |超时                              |退款
   v                                  v
已取消                             退款中 --到账--> 已退款
```

**每个状态下的允许操作不一样**，于是可以建一张转移表：

```typescript
const ORDER_TRANSITIONS: Record<OrderState, OrderState[]> = {
  待支付: [待发货, 已取消],
  待发货: [已发货],
  已发货: [已完成, 退款中],
  已完成: [退款中],
  已取消: [],
  退款中: [已退款],
  已退款: [],
};
```

如果再问"**从下单到完成，最多能拿多少积分，每种状态停留一天扣多少分**" —— 这就是状态机 DP。

### 10.2 熔断器状态机（后端高可用）

熔断器（Sentinel / Resilience4j）的经典三态：

```text
       失败率超阈值
CLOSED ──────────▶ OPEN
  ▲                  │
  │                  │ 冷却时间到
  │                  ▼
  └──────────── HALF_OPEN
                  │
                  │ 试探请求成功
                  └──────▶ CLOSED
```

如果要给"熔断器挂掉多久"这种问题算期望值，那就是状态机 DP + 概率转移。

### 10.3 任务调度器

一个任务在生命周期里会经历"排队 → 运行 → 成功/失败/重试 → 完成"。

要算"**给定任务依赖和并发度，总完成时间最短**" —— 这是 DAG 调度问题；但如果加一个"任务在某个状态下会占用资源"的条件，就变成状态机 DP。

### 10.4 TCP 状态机

```text
CLOSED → LISTEN → SYN_RCVD → ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED
```

每一个状态迁移都是一条"边"。如果你要计算"**经过有限次网络故障后，连接最终落到哪个状态的概率分布**" —— 那就是把状态机 DP 的"取最大"换成"概率转移矩阵乘法"。

**DP 和马尔可夫链，数学上是同一件事。**

### 10.5 编译器的词法分析（DFA）

DFA（确定有限自动机）本质上就是一个状态机。**状态压缩 DP 处理字符串匹配，本质上是在 DFA 上做路径 DP** —— 站内那篇[AC 自动机（Aho-Corasick）](aho-corasick.md)就是这个思路的经典应用。

### 10.6 游戏角色状态机

Idle → Walk → Run → Jump → Attack → Hurt → Dead。

每个状态的动画时长不同、要消耗的资源不同。**"给角色设计一套动作表，让它在 3 秒内打出最高伤害"** —— 典型的状态机 DP。

---

## 十一、小结

状态机 DP 这一篇，讲的其实是一件特别朴素的事：

> **当你发现"今天的决策取决于我当前处于什么处境"时，就把那些处境显式地列成状态，把处境之间的跳转画成边，然后让 DP 沿着边一天天往前推。**

核心收获：

- ✅ **状态机 DP = 状态 + 边 + 收益**，三件套定下来，代码就是照着抄
- ✅ **状态数少是它的最大优势** —— 3~5 个状态就能表达复杂约束
- ✅ **滚动数组把空间压到 `O(1)`** —— 因为 `dp[i]` 只依赖 `dp[i-1]`
- ✅ **不可达状态必须用 `-Infinity`**，否则 `max` 会把"到不了"和"收益 0"混为一谈
- ✅ **要么先算后赋，要么倒序更新** —— 绝不能原地改，这是最容易犯的错
- ✅ **终态只取"合法的结束状态"** —— 不能持股结束
- ✅ **手续费这类"每笔交易收一次"的约束，要在卖出时收** —— 一次买入+卖出算一笔
- ✅ **通用引擎适合教学和原型，手写特化适合生产** —— 实测差 10~20 倍

面试里如果被问到"股票买卖"系列，我的完整回答顺序会是：

1. 先把题目约束**翻译成状态**（持股 / 空仓 / 冷冻）
2. 画出**状态转移图**
3. 写出**转移方程**，强调"先算后赋"
4. 提一句**初值用 `-Infinity`**、**终态只取空仓**
5. 如果对方追问变体（k 次 / 手续费 / 冷冻期），直接说"**加状态或改边就行**"

能把第 3、4、5 点讲清楚，基本就碾压 90% 的候选人了 🎯

---

## 相关阅读

- [动态规划](dynamic-programming.md) —— DP 的通用框架，这一篇的"母体"
- [状态压缩动态规划（Bitmask DP）](bitmask-dp.md) —— 状态机 DP 的"二进制版"
- [Kadane 算法（最大子数组和）](kadane.md) —— 股票问题的"一次交易"版本，其实就是最大子数组和
- [贪心算法](greedy-algorithm.md) —— 对比看：为什么股票问题不能贪心
- [0-1 BFS 精讲（双端队列最短路）](zero-one-bfs.md) —— 另一种"状态建模"思路：把状态变成图上的节点
- [DP 优化精讲（斜率优化 / 分治优化 / Knuth 优化）](dp-optimization.md) —— 当 `O(n²)` 太慢时的进阶武器
- [滑动窗口](sliding-window.md) —— 另一个"双指针维护区间"的经典套路
