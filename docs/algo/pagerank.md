---
title: PageRank 精讲：从「先有鸡还是先有蛋」到幂迭代求解
description: 从「被重要页面链接的页面更重要」这个循环定义讲起，一文打通 PageRank 的随机冲浪者模型、Google 矩阵、幂迭代求解法、悬挂节点陷阱、阻尼因子与收敛速度的关系、个性化 PageRank 与主题敏感 PageRank，以及 TrustRank 等反作弊思路。附 TypeScript / Python / Go 三语言完整实现，全部代码已跑通，复现 Wikipedia 官方精确解（L1 误差 4.3e-15）
date: 2026-11-26 09:30:00
categories:
  - Algorithm
tags:
  - pagerank
  - link-analysis
  - markov-chain
  - power-iteration
  - eigenvector
  - graph-algorithm
  - interview
sidebarSort: 144
---

# PageRank 精讲：从「先有鸡还是先有蛋」到幂迭代求解

我先给你看一个特别拧巴的句子：

> 一个页面的重要性，取决于有多少个页面链接到它；而那些页面的重要性，又取决于有多少个页面链接到它们……

这是**循环定义**。你没法按顺序算，因为 A 的分数要靠 B 算，B 的分数要靠 C 算，C 的分数又要绕回 A。

1998 年，Larry Page 和 Sergey Brin 在斯坦福把这团乱麻给解开了。他们的办法朴素得让人意外：**别想着一次算准，迭代着逼近**。

这篇就是把这个"迭代逼近"讲透。代码我用 TypeScript / Python / Go 各写了一份，全部跑通，而且复现了 Wikipedia 官方给出的**精确有理数解**（L1 误差 4.3e-15）。

## 为什么需要 PageRank？

先说清楚它到底解决什么问题。

假设你要给一堆网页排序。最朴素的办法是按关键词命中次数排——但这有个致命问题：**内容农场可以疯狂堆关键词**。堆一万次"最好用的手机壳"，它就排第一了。

所以得换个思路：不看内容，看**链接结构**。

```text
朴素思路：内容里出现多少次关键词 → 排名

PageRank：谁链接了我 → 排名
          而且是"重要的页面链接我"权重更高
```

这就是 PageRank 的核心洞察：**一个页面的权威度来自外部链接，而链接本身也是有分量的**。

举个小例子感受一下：

```text
页面 A  ← 被 100 个垃圾站链接
页面 B  ← 被 1 个权威站链接

只看反链数量：A 赢（100 > 1）
看链接来源权重：B 赢（那 1 个是权威站）
```

这就是为什么 PageRank 需要"递归"地算——它要问的不只是"谁链接我"，还有"链接我的那个页面自己有多重要"。

### 循环定义怎么破？

直接写方程组？N 个页面 N 个方程，理论上能解，但：

1. **N 是几十亿**——稠密矩阵根本放不进内存
2. **解出来也不稳定**——数值方法求几十亿阶线性方程组，误差会放大到没法看

所以 Brin 和 Page 选了一条路：**不求精确解，用迭代逼近**。

## 原理拆解

### 第一层：随机冲浪者模型

PageRank 最优雅的地方在于它不只是一个"打分公式"，而是一个**行为模型**。

想象有个倒霉的冲浪者（Random Surfer），他这么上网：

```text
每一步：
  以 85% 的概率 → 打开当前页面上的某个链接（随机挑一个）
  以 15% 的概率 → 烦了，随机跳到互联网上任意一个页面
```

关键洞察来了：**如果这个冲浪者傻跑一整天，他停在每个页面上的时间比例，就是那个页面的 PageRank**。

```text
PR(A) = 随机冲浪者最终停在 A 上的概率
```

为什么"时间比例"就等于"重要性"？因为一个被权威站链接的页面，冲浪者从权威站点进来后，会把"停留时间"的一部分通过链接传出去。**流量像水一样在网络里流动，汇聚的地方就是权重高的地方**。

### 第二层：公式化

把冲浪者的行为写成数学：

设 `PR(i)` 是页面 i 的权重，`Out(j)` 是页面 j 的出链集合，`L(j)` 是 j 的出链数量，`N` 是总页面数，`d` 是阻尼因子（默认 0.85）。

```text
                (1-d)      d · ⎡    PR(j)      ⎤
PR(i)  =  ───────────  +  ─── ⎢  Σ  ────────── ⎥
              N          ⎣ j→i   L(j)       ⎦
```

拆开看就两块：

| 那一项 | 含义 |
| ------ | ---- |
| `(1-d)/N` | **传送项**：15% 的概率随机跳，随机落点分摊到每个页面 |
| `d · Σ PR(j)/L(j)` | **链接项**：85% 的概率顺着链接走，j 把自己的分数**均分**给它的每条出链 |

注意"**均分**"这两个字，这是全文最容易被忽略、也最关键的一个细节。

```text
页面 X 的 PR = 0.30，它有 3 条出链 → A, B, C

那么：
  A 得到 0.30 / 3 = 0.10
  B 得到 0.30 / 3 = 0.10
  C 得到 0.30 / 3 = 0.10
```

**出链越多，分到每一家的越少。** 这就是为什么一个"什么都要链"的导航站，单个链接的含金量反而低。

### 第三层：Google 矩阵

把上面的公式写成矩阵形式：

```text
G = d · S + (1-d)/N · J
```

其中：

- `S` 是**列随机**的转移矩阵：`S[i][j] = 1/L(j)`（如果 j 链向 i），否则为 0
- `J` 是全 1 矩阵
- `G` 就是所谓的 **Google 矩阵**

PageRank 向量 `r` 满足：

```text
r = G · r      且      Σ r[i] = 1
```

**翻译成人话：`r` 是 `G` 的特征值为 1 的特征向量。**

这就是 PageRank 的数学本质——**求主特征向量**。

> 📌 关于"列随机"的约定：不同资料里矩阵方向可能写成行随机（`r = r·G`）。我这里统一用列随机（`r = G·r`），你如果看到 `r = r·G` 的资料，对应的是转置矩阵的**左**特征向量。方向搞反了，结果就是取到了左特征向量，对不上数——**这个坑我在写测试的时候踩过一次**，待会儿细说。

### 第四层：为什么用幂迭代？

因为 `G` 有三个漂亮的性质：

1. **列随机**——每列之和为 1，概率不丢
2. **不可约（irreducible）**——任意两个页面之间都能通过传送连通
3. **非周期（aperiodic）**——传送项保证了没有"只能走偶数步回去"的死循环

由 **Perron–Frobenius 定理**：`G` 的谱半径为 1，且特征值 1 是**单根**，对应唯一的正特征向量 `r`。而且其他特征值的模都 `< 1`。

这意味着——**幂迭代必然收敛**，而且收敛速度由第二特征值 `|λ₂|` 决定：

```text
r⁽ᵏ⁺¹⁾ = G · r⁽ᵏ⁾

误差每轮乘以约 |λ₂|
Haveliwala & Kamvar (2003) 证明：|λ₂| ≤ d
```

```text
所以 d=0.85 时，误差每轮至少缩小 15%
理论上界：第 k 轮的 L1 变化 ≤ 2 · d^(k-1)
需要多少轮才收敛到 eps：k ≥ 1 + log(eps/2) / log(d)
```

我拿 Wikipedia 的例图实测了一下，理论和实际对得非常准：

| d | 理论上界 | 实测轮数 | 实测残差 |
| - | -------- | -------- | -------- |
| 0.50 | 36 | 33 | 5.340e-11 |
| 0.70 | 68 | 63 | 7.993e-11 |
| 0.85 | 147 | 137 | 9.816e-11 |
| 0.90 | 227 | 212 | 9.140e-11 |
| 0.95 | 464 | 434 | 9.853e-11 |

**收敛轮数几乎跟网页数量无关**，只跟阻尼因子和精度要求有关。这正是它能撑起互联网规模的原因。

### 第五层：悬挂节点——最经典的坑

这是实现 PageRank 时**第一个会咬人的地方**。

**悬挂节点（dangling node）** = 没有出链的页面。典型代表：

- PDF 文件页
- 图片直链页
- 还没爬到内容的页面
- 各种"点我下载"的落地页

问题来了：`S` 矩阵的第 j 列全是 0（列和为 0，不是 1）。冲浪者到了这个页面，**无路可走**——概率质量凭空消失。

```text
原始 PR 总和 = 1.0
  ↓ 一轮迭代，悬挂节点把质量吃掉了
  ↓
总和 = 0.92
  ↓ 再来一轮
  ↓
总和 = 0.89
  ↓ ... 越迭代越少
```

我实测了一下"忘记处理悬挂节点"的后果（Wikipedia 例图，d=0.85）：

| 轮次 | A | B | C | **总和** |
| ---- | - | - | - | -------- |
| 1 | 0.052273 | 0.309848 | 0.090909 | **0.922727273** |
| 5 | 0.031336 | 0.369019 | 0.241269 | **0.847824229** |
| 20 | 0.027646 | 0.320133 | 0.293237 | **0.843339704** |
| 137（收敛） | 0.027646 | 0.324181 | 0.289190 | **0.843339703** |

看最后一行——**质量流失了 15.67%**，而且它**收敛到了一个错误的答案**（B 的值 0.3241 vs 正确答案 0.3844）。

更阴险的是：**它照样会"收敛"**。残差曲线漂亮地趋于平缓，你以为算完了，结果全错。这就是为什么对拍测试是必须的。

**正确做法**：把悬挂节点当成"到站下车、随机传送"。每轮迭代把所有悬挂节点的质量收集起来，按传送分布再分配回去。

```text
每轮迭代：
  1. next[i] = (1-d) × v[i]                    ← 传送项
  2. 对每个非悬挂节点 j：把 d × r[j] 均分给它的出链
  3. 收集所有悬挂节点的质量 danglingSum
  4. 把 d × danglingSum 按 v 分配回所有节点   ← 关键的一步
```

工程上**不需要真的加 N 条虚拟边**（那会让矩阵变稠密），只要每轮做一次 O(N) 的加法就行。

> ⚠️ 还有一个容易忽略的细节：**重复出链要去重**。同一页面对同一目标的多个 `<a>` 标签只算一条链接，否则那页的出链数被放大，权重分配就错了。

### 第六层：阻尼因子 d 到底在调什么？

d 有两个作用，很多人只知道其中一个。

**作用一：保证收敛**（数学上）

d < 1 让 `G` 的每个元素都严格为正，从而不可约、非周期，保证唯一解。没有 d 的话，图一旦分成几个互不连通的区域，每个区域各算各的，**方程组有无穷多解**。

**作用二：控制"链接结构"和"随机性"的比重**（工程上）

```text
d = 0.85  →  85% 看链接结构，15% 随机    ← Google 的选择
d = 0.50  →  一半一半，收敛快
d = 0.95  →  几乎纯链接结构，收敛慢
d = 0.99  →  极致慢，而且容易受垃圾站影响
```

有意思的是，**d 越大，收敛越慢**（每轮误差只缩小 1-d 而不是更多），但 d 太大又容易被链接作弊攻击（一个小圈子内部互刷就能撑起高 PR）。

从 Wikipedia 例图的实测数据看这个权衡有多明显：

| d | 迭代轮数 | 相对 d=0.85 |
| - | -------- | ----------- |
| 0.50 | 33 | 快 4 倍 |
| 0.85 | 137 | 基准 |
| 0.95 | 434 | 慢 3 倍 |
| 0.99 | 2214 | 慢 16 倍 |

**d 从 0.95 提到 0.99，收敛轮数直接翻了 5 倍。** 这就是为什么生产上大家都用 0.85。

### 第七层：个性化 PageRank

标准 PageRank 的传送项是**均匀**的——`v[i] = 1/N`。但这意味着：

> 一个和你的兴趣毫无关系的页面，只要被大量权威站链接，也会拿到高 PR。搜索"Redis 持久化"，一篇讲 Python 的老文章可能排在讲 Redis 的新文章前面。

**个性化 PageRank（Personalized PageRank, PPR）** 把传送项改成有偏好的分布：

```text
标准：  v[i] = 1/N                        （对所有页面一视同仁）
个性化：v[i] = 1/|S|，i ∈ S；否则 0        （传送只落在种子集合 S 上）
```

直觉：**"从种子页面出发随机走，能到哪儿"**。

搜索引擎里的"相关站点推荐"、社交网络里的"你可能认识的人"、推荐系统的"买了这个的人也买了"，底层都是 PPR。

我实测的个性化效果（4 节点小图）：

```text
无偏     : [0.373248, 0.206755, 0.382497, 0.037500]
种子=[B] : [0.326738, 0.288864, 0.384398, 0.000000]   ← B 从 0.2068 涨到 0.2889
种子=[D] : [0.329621, 0.182589, 0.337790, 0.150000]   ← D 从 0.0375 涨到 0.1500
```

注意种子 `[B]` 时 **D 的 PR 变成了 0**——因为 D 既没有出链，传送也不会落在它身上，**它彻底收不到任何质量**。这是个性化 PageRank 的固有特性，不是 bug。

### 第八层：主题敏感 PageRank

PPR 是"给一个具体的种子集"，粒度太细了——每个用户一套向量，存不下。

Haveliwala 等人 2003 年提出**主题敏感 PageRank（Topic-Sensitive PageRank）**，思路很聪明：

```text
离线阶段：
  预先算好 k 个"主题向量"（比如 16 个顶层类目）
  每个向量的传送分布，集中在该主题下的页面

查询阶段：
  判断查询词属于哪些主题（分类器）
  按主题概率做凸组合，得到最终的分数
```

好处是**离线算好 k 套，查询时只做加权求和**，查询延迟极低。这就是"个性化搜索"从实验室走进生产的标准做法。

## 代码实现

下面三份实现**全部跑通并互相验证过**，输出逐位一致。

### TypeScript

```typescript
/**
 * PageRank —— TypeScript 实现
 *
 * 核心思路：把网页链接图看成一条带「重启」的马尔可夫链，
 * 用幂迭代（Power Method）求 Google 矩阵 G 的主特征向量。
 *
 *   G = d * S + (1 - d) * v * 1^T
 *
 *   r = G * r,  且 sum(r) = 1
 *
 * 三个必须处理好的细节：
 *   1. 悬挂节点（dangling node）：没有出链的页面，必须把它的 PR 质量重新分配
 *   2. 阻尼因子 d：默认 0.85，它决定了收敛速度，也决定了矩阵是否不可约
 *   3. 尺度：本文统一用「概率分布」口径（sum(r) = 1）
 */

export interface PageRankOptions {
  /** 阻尼因子 d（继续沿链接走的概率），默认 0.85 */
  damping?: number;
  /** 重启（传送）分布 v，默认均匀分布 1/N */
  personalization?: number[];
  /** 悬挂节点质量的再分配分布，默认与 personalization 相同 */
  danglingWeights?: number[];
  /** L1 残差收敛阈值，默认 1e-10 */
  tolerance?: number;
  /** 最大迭代轮数，默认 200 */
  maxIterations?: number;
}

export interface PageRankResult {
  /** 各节点的 PageRank 之和为 1 */
  ranks: number[];
  /** 实际迭代轮数 */
  iterations: number;
  /** 是否在阈值内收敛 */
  converged: boolean;
  /** 最后一轮的 L1 残差 */
  residual: number;
  /** 是否存在悬挂节点 */
  hasDangling: boolean;
}

/** 归一化：保证向量非负且和为 1 */
function normalize(vec: number[], fallbackUniform: boolean): number[] {
  const n = vec.length;
  const out = new Array<number>(n).fill(0);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const v = Math.max(0, vec[i] ?? 0);
    out[i] = v;
    sum += v;
  }
  if (sum <= 0) {
    if (!fallbackUniform) {
      throw new Error("personalization 向量之和必须为正");
    }
    for (let i = 0; i < n; i++) out[i] = 1 / n;
    return out;
  }
  for (let i = 0; i < n; i++) out[i] /= sum;
  return out;
}

/**
 * 计算 PageRank
 *
 * @param n       节点总数
 * @param outLinks 每个节点的出链目标列表（outLinks[j] 是 j 指向的节点）
 */
export function pagerank(
  n: number,
  outLinks: number[][],
  opts: PageRankOptions = {},
): PageRankResult {
  if (n <= 0) throw new Error("节点数必须为正");

  const d = opts.damping ?? 0.85;
  if (d < 0 || d >= 1) throw new Error("damping 必须在 [0, 1) 区间内");

  const tol = opts.tolerance ?? 1e-10;
  const maxIter = opts.maxIterations ?? 200;

  // 重启分布 v 与悬挂节点再分配分布 dw
  const v = normalize(
    opts.personalization ?? new Array<number>(n).fill(1),
    true,
  );
  const dw = normalize(opts.danglingWeights ?? v, true);

  // ---- CSR 风格展开邻接表：避免每轮迭代都遍历嵌套数组 ----
  const offsets = new Array<number>(n + 1).fill(0);
  const targets: number[] = [];
  const outDeg = new Array<number>(n).fill(0);
  for (let j = 0; j < n; j++) {
    offsets[j] = targets.length;
    const seen = new Set<number>();
    for (const t of outLinks[j] ?? []) {
      if (t < 0 || t >= n) throw new Error(`出链目标越界: ${t}`);
      // 去重：同一页面对同一个目标的重复链接只算一条
      if (seen.has(t)) continue;
      seen.add(t);
      targets.push(t);
    }
    outDeg[j] = targets.length - offsets[j];
  }
  offsets[n] = targets.length;

  const hasDangling = outDeg.some((deg) => deg === 0);

  // 初始向量取 v（和为 1）
  let r = v.slice();
  let next = new Array<number>(n).fill(0);
  let residual = Infinity;
  let iterations = 0;
  let converged = false;

  for (let iter = 1; iter <= maxIter; iter++) {
    iterations = iter;

    // 1) 传送项：(1 - d) * v
    for (let i = 0; i < n; i++) next[i] = (1 - d) * v[i];

    // 2) 链接项 + 收集悬挂节点质量
    let danglingSum = 0;
    for (let j = 0; j < n; j++) {
      if (outDeg[j] === 0) {
        // 悬挂节点：它的质量不能沿着链接流走，单独收集起来再分配
        danglingSum += r[j];
        continue;
      }
      const share = (d * r[j]) / outDeg[j];
      for (let k = offsets[j]; k < offsets[j + 1]; k++) {
        next[targets[k]] += share;
      }
    }

    // 3) 悬挂节点质量再分配
    if (danglingSum > 0) {
      for (let i = 0; i < n; i++) next[i] += d * danglingSum * dw[i];
    }

    // 4) L1 残差
    residual = 0;
    for (let i = 0; i < n; i++) residual += Math.abs(next[i] - r[i]);

    r = next.slice();

    if (residual < tol) {
      converged = true;
      break;
    }
  }

  return { ranks: r, iterations, converged, residual, hasDangling };
}

/** 从边列表构建 PageRank，边用 [from, to] 表示 */
export function pagerankFromEdges(
  n: number,
  edges: Array<[number, number]>,
  opts: PageRankOptions = {},
): PageRankResult {
  const outLinks: number[][] = Array.from({ length: n }, () => []);
  for (const [from, to] of edges) outLinks[from].push(to);
  return pagerank(n, outLinks, opts);
}

/**
 * 个性化 PageRank：把「传送」集中到一组种子节点上。
 * 搜索引擎里的「相关站点推荐」「社交推荐」都是这个思路。
 */
export function personalizedPageRank(
  n: number,
  outLinks: number[][],
  seeds: number[],
  opts: PageRankOptions = {},
): PageRankResult {
  const v = new Array<number>(n).fill(0);
  for (const s of seeds) v[s] = 1 / seeds.length;
  return pagerank(n, outLinks, { ...opts, personalization: v });
}

/** 按 PageRank 排序，返回 [{ id, rank }]，已按 rank 降序 */
export function rankNodes(
  n: number,
  ranks: number[],
): Array<{ id: number; rank: number }> {
  return ranks
    .map((rank, id) => ({ id, rank }))
    .sort((a, b) => b.rank - a.rank);
}
```

### Python

```python
"""PageRank —— Python 实现

核心思路：把网页链接图看成一条带「重启」的马尔可夫链，
用幂迭代（Power Method）求 Google 矩阵 G 的主特征向量。

    G = d * S + (1 - d) * v * 1^T
    r = G * r,  且 sum(r) = 1

三个必须处理好的细节：
  1. 悬挂节点（dangling node）：没有出链的页面，必须把它的 PR 质量重新分配
  2. 阻尼因子 d：默认 0.85，它决定了收敛速度，也决定了矩阵是否不可约
  3. 尺度：本文统一用「概率分布」口径（sum(r) = 1）
"""

from typing import Iterable, List, Optional, Sequence, Tuple


def _normalize(vec: Sequence[float]) -> List[float]:
    """归一化：保证向量非负且和为 1"""
    n = len(vec)
    out = [max(0.0, float(x)) for x in vec]
    total = sum(out)
    if total <= 0:
        return [1.0 / n] * n
    return [x / total for x in out]


def pagerank(
    n: int,
    out_links: Sequence[Sequence[int]],
    damping: float = 0.85,
    personalization: Optional[Sequence[float]] = None,
    dangling_weights: Optional[Sequence[float]] = None,
    tolerance: float = 1e-10,
    max_iterations: int = 200,
) -> Tuple[List[float], int, bool, float, bool]:
    """计算 PageRank

    返回 (ranks, iterations, converged, residual, has_dangling)
    """
    if n <= 0:
        raise ValueError("节点数必须为正")
    if not (0.0 <= damping < 1.0):
        raise ValueError("damping 必须在 [0, 1) 区间内")

    v = _normalize(personalization if personalization is not None else [1.0] * n)
    dw = _normalize(dangling_weights if dangling_weights is not None else v)

    # 展开邻接表 + 去重（同一页面对同一目标的重复链接只算一条）
    targets: List[int] = []
    offsets: List[int] = [0] * (n + 1)
    out_deg = [0] * n
    for j in range(n):
        seen = set()
        for t in out_links[j] or []:
            if t < 0 or t >= n:
                raise ValueError(f"出链目标越界: {t}")
            if t in seen:
                continue
            seen.add(t)
            targets.append(t)
        out_deg[j] = len(targets) - offsets[j]
        offsets[j + 1] = len(targets)

    has_dangling = any(deg == 0 for deg in out_deg)

    r = list(v)
    next_r = [0.0] * n
    residual = float("inf")
    iterations = 0
    converged = False

    for iteration in range(1, max_iterations + 1):
        iterations = iteration

        # 1) 传送项：(1 - d) * v
        for i in range(n):
            next_r[i] = (1.0 - damping) * v[i]

        # 2) 链接项 + 收集悬挂节点质量
        dangling_sum = 0.0
        for j in range(n):
            if out_deg[j] == 0:
                dangling_sum += r[j]
                continue
            share = damping * r[j] / out_deg[j]
            for k in range(offsets[j], offsets[j + 1]):
                next_r[targets[k]] += share

        # 3) 悬挂节点质量再分配
        if dangling_sum > 0:
            for i in range(n):
                next_r[i] += damping * dangling_sum * dw[i]

        # 4) L1 残差
        residual = sum(abs(next_r[i] - r[i]) for i in range(n))
        r = list(next_r)

        if residual < tolerance:
            converged = True
            break

    return r, iterations, converged, residual, has_dangling


def pagerank_from_edges(
    n: int,
    edges: Iterable[Tuple[int, int]],
    **kwargs,
) -> Tuple[List[float], int, bool, float, bool]:
    """从边列表 [from, to] 计算 PageRank"""
    out_links: List[List[int]] = [[] for _ in range(n)]
    for src, dst in edges:
        out_links[src].append(dst)
    return pagerank(n, out_links, **kwargs)


def personalized_pagerank(
    n: int,
    out_links: Sequence[Sequence[int]],
    seeds: Sequence[int],
    **kwargs,
) -> Tuple[List[float], int, bool, float, bool]:
    """个性化 PageRank：把「传送」集中到一组种子节点上"""
    v = [0.0] * n
    for s in seeds:
        v[s] = 1.0 / len(seeds)
    return pagerank(n, out_links, personalization=v, **kwargs)


def rank_nodes(n: int, ranks: Sequence[float]) -> List[Tuple[int, float]]:
    """按 PageRank 降序返回 [(id, rank)]"""
    return sorted(((i, r) for i, r in enumerate(ranks)), key=lambda x: -x[1])
```

### Go

```go
package main

import (
	"fmt"
	"math"
	"sort"
)

// ---------- PageRank —— Go 实现 ----------

// Options 计算 PageRank 的可选项
type Options struct {
	// Damping 阻尼因子 d（继续沿链接走的概率），默认 0.85
	//
	// 用指针而不是 float64：Go 的零值陷阱。
	// 如果用 float64，Options{Damping: 0} 和 Options{} 长得一模一样，
	// 而 d=0 是个有意义的取值（退化成均匀分布），
	// 用 `if opts.Damping != 0` 判断就无法区分「没设置」和「设成 0」。
	// 指针的 nil 才是真正的「没设置」。
	Damping *float64
	// Personalization 重启（传送）分布，默认均匀分布 1/N
	Personalization []float64
	// DanglingWeights 悬挂节点质量的再分配分布，默认与 Personalization 相同
	DanglingWeights []float64
	// Tolerance L1 残差收敛阈值，默认 1e-10
	Tolerance float64
	// MaxIterations 最大迭代轮数，默认 200
	MaxIterations int
}

// Damping 构造一个阻尼因子指针，方便调用方设置
func Damping(d float64) *float64 { return &d }

// Result 计算结果
type Result struct {
	// Ranks 各节点的 PageRank 之和为 1
	Ranks []float64
	// Iterations 实际迭代轮数
	Iterations int
	// Converged 是否在阈值内收敛
	Converged bool
	// Residual 最后一轮的 L1 残差
	Residual float64
	// HasDangling 是否存在悬挂节点
	HasDangling bool
}

// normalize 归一化：保证向量非负且和为 1
func normalize(vec []float64) []float64 {
	n := len(vec)
	out := make([]float64, n)
	total := 0.0
	for i := 0; i < n; i++ {
		v := vec[i]
		if v < 0 {
			v = 0
		}
		out[i] = v
		total += v
	}
	if total <= 0 {
		for i := 0; i < n; i++ {
			out[i] = 1.0 / float64(n)
		}
		return out
	}
	for i := 0; i < n; i++ {
		out[i] /= total
	}
	return out
}

// Pagerank 计算 PageRank
//
//	n: 节点总数
//	outLinks: 每个节点的出链目标列表
func Pagerank(n int, outLinks [][]int, opts *Options) (*Result, error) {
	if n <= 0 {
		return nil, fmt.Errorf("节点数必须为正")
	}

	d := 0.85
	tol := 1e-10
	maxIter := 200
	var v, dw []float64

	if opts != nil {
		if opts.Damping != nil {
			d = *opts.Damping
		}
		if opts.Tolerance > 0 {
			tol = opts.Tolerance
		}
		if opts.MaxIterations > 0 {
			maxIter = opts.MaxIterations
		}
		v = opts.Personalization
		dw = opts.DanglingWeights
	}
	if d < 0 || d >= 1 {
		return nil, fmt.Errorf("damping 必须在 [0, 1) 区间内")
	}

	if len(v) != n {
		v = make([]float64, n)
		for i := range v {
			v[i] = 1
		}
	}
	v = normalize(v)
	if len(dw) != n {
		dw = v
	} else {
		dw = normalize(dw)
	}

	// 展开邻接表 + 去重
	targets := make([]int, 0, len(outLinks)*2)
	offsets := make([]int, n+1)
	outDeg := make([]int, n)
	hasDangling := false
	for j := 0; j < n; j++ {
		offsets[j] = len(targets)
		seen := make(map[int]bool)
		if j < len(outLinks) {
			for _, t := range outLinks[j] {
				if t < 0 || t >= n {
					return nil, fmt.Errorf("出链目标越界: %d", t)
				}
				if seen[t] {
					continue
				}
				seen[t] = true
				targets = append(targets, t)
			}
		}
		outDeg[j] = len(targets) - offsets[j]
		if outDeg[j] == 0 {
			hasDangling = true
		}
	}
	offsets[n] = len(targets)

	r := make([]float64, n)
	copy(r, v)
	next := make([]float64, n)

	residual := math.Inf(1)
	iterations := 0
	converged := false

	for iter := 1; iter <= maxIter; iter++ {
		iterations = iter

		// 1) 传送项：(1 - d) * v
		for i := 0; i < n; i++ {
			next[i] = (1.0 - d) * v[i]
		}

		// 2) 链接项 + 收集悬挂节点质量
		danglingSum := 0.0
		for j := 0; j < n; j++ {
			if outDeg[j] == 0 {
				danglingSum += r[j]
				continue
			}
			share := d * r[j] / float64(outDeg[j])
			for k := offsets[j]; k < offsets[j+1]; k++ {
				next[targets[k]] += share
			}
		}

		// 3) 悬挂节点质量再分配
		if danglingSum > 0 {
			for i := 0; i < n; i++ {
				next[i] += d * danglingSum * dw[i]
			}
		}

		// 4) L1 残差
		residual = 0
		for i := 0; i < n; i++ {
			residual += math.Abs(next[i] - r[i])
		}

		copy(r, next)

		if residual < tol {
			converged = true
			break
		}
	}

	return &Result{
		Ranks:       r,
		Iterations:  iterations,
		Converged:   converged,
		Residual:    residual,
		HasDangling: hasDangling,
	}, nil
}

// PagerankFromEdges 从边列表 [from, to] 计算 PageRank
func PagerankFromEdges(n int, edges [][2]int, opts *Options) (*Result, error) {
	outLinks := make([][]int, n)
	for _, e := range edges {
		outLinks[e[0]] = append(outLinks[e[0]], e[1])
	}
	return Pagerank(n, outLinks, opts)
}

// PersonalizedPagerank 个性化 PageRank：把「传送」集中到一组种子节点上
func PersonalizedPagerank(n int, outLinks [][]int, seeds []int, opts *Options) (*Result, error) {
	v := make([]float64, n)
	for _, s := range seeds {
		v[s] = 1.0 / float64(len(seeds))
	}
	o := Options{}
	if opts != nil {
		o = *opts
	}
	o.Personalization = v
	return Pagerank(n, outLinks, &o)
}

// RankedNode 排名结果
type RankedNode struct {
	ID   int
	Rank float64
}

// RankNodes 按 PageRank 降序返回
func RankNodes(ranks []float64) []RankedNode {
	out := make([]RankedNode, len(ranks))
	for i, r := range ranks {
		out[i] = RankedNode{ID: i, Rank: r}
	}
	sort.Slice(out, func(a, b int) bool { return out[a].Rank > out[b].Rank })
	return out
}
```

## 验证结果

### 权威基准：复现 Wikipedia 的精确有理数解

Wikipedia 的 PageRank 条目用了一张 11 页面的小图，并给出了 **d=0.85 时的精确解**（分数形式）：

```text
R = 1/579662461 · (19002201, 222822800, 198772220, 22657320, 46886400,
                   22657320, 9372840, 9372840, 9372840, 9372840, 9372840)
```

图的结构是：

```text
    A → (无出链，悬挂节点)
    B → C          C → B
    D → A, B
    E → B, D, F    F → B, E
    G → B, E       H → B, E       I → B, E
    J → E          K → E
```

我的三份实现跑出来的结果：

```text
=== TypeScript ===
ranks = 0.03278149, 0.38440095, 0.34291029, 0.03908709, 0.08088569, 0.03908709,
        0.01616948, 0.01616948, 0.01616948, 0.01616948, 0.01616948
迭代 194 轮, 残差 9.437e-15, 收敛=true, 有悬挂节点=true
与 Wikipedia 精确解的 L1 差异 = 4.337e-15

=== Python ===
ranks = [0.03278149, 0.38440095, 0.34291029, 0.03908709, 0.08088569, 0.03908709,
         0.01616948, 0.01616948, 0.01616948, 0.01616948, 0.01616948]
与 Wikipedia 精确解的 L1 差异 = 4.337e-15

=== Go ===
ranks = [0.03278149 0.38440095 0.34291029 0.03908709 0.08088569 0.03908709
         0.01616948 0.01616948 0.01616948 0.01616948 0.01616948]
与 Wikipedia 精确解的 L1 差异 = 4.337e-15
```

**三语言结果逐位一致**，且与官方的精确有理数解误差在 **1e-15 量级**——这已经是双精度浮点的极限了。

顺便验证了一个反直觉的结论：**C 只有 1 条入链，却排第 2；而 E 有 6 条入链，只排第 3。**

```text
C 的入链：只有 B 一条，而 B 是全图最重要的页面
         → B 的分数全给了 C（因为 B 只有 1 条出链）

E 的入链：有 6 条，但来源全是 G/H/I/J/K 这些低分页面
         → 6 条低分链接加起来，还不如 B 的一条
```

**这正是 PageRank 的灵魂：一个来自高权重页面的链接，抵得上一堆来自低权重页面的链接。**

### 三语言一致性断言

```text
TS : 0.03278149, 0.38440095, 0.34291029, 0.03908709, 0.08088569, 0.03908709, 0.01616948, ...
Py : 0.03278149, 0.38440095, 0.34291029, 0.03908709, 0.08088569, 0.03908709, 0.01616948, ...
Go : 0.03278149, 0.38440095, 0.34291029, 0.03908709, 0.08088569, 0.03908709, 0.01616948, ...

阻尼对照（Wikipedia 例图，迭代轮数）
     d       TS       Py       Go
  0.50       33       33       33
  0.70       63       63       63
  0.85      137      137      137
  0.90      212      212      212
  0.95      434      434      434

三语言结果完全一致: True
```

### 与 NetworkX / 稠密精确解对拍

除了跑基准图，我还做了两类对拍：

| 对拍对象 | 方法 | 最大 L1 差异 |
| -------- | ---- | ------------ |
| **NetworkX** `nx.pagerank()` | 18 组随机图 × 多种阻尼因子 | 2.8e-11 |
| **稠密特征值解** | 构造 G 矩阵用 `numpy.linalg.eig` 求主特征向量 | 3.0e-14 |

关于 NetworkX 那一项要说明一下：它的停止条件是 `err < N * tol`，比我们的 `err < tol` 宽松，所以它会**提前退出**，差异到 1e-11 量级属于正常。我另外用稠密特征值解当裁判，确认了**是我的实现更准**：

```text
稠密精确解 vs 我的实现 : L1 = 9.7e-13
稠密精确解 vs NetworkX : L1 = 8.5e-11     ← NetworkX 提前退出了
```

### 收敛轨迹

Wikipedia 例图上，d=0.85，逐轮观察 B 的分数怎么"晃"着收敛：

```text
轮次          A          B          C          E         L1变化
   1   0.059298   0.316873   0.097934   0.329752    9.437e-01
   2   0.037946   0.260691   0.287561   0.099413    6.402e-01
   3   0.064019   0.407292   0.238156   0.118219    3.830e-01
   5   0.038675   0.419184   0.283154   0.093960    2.273e-01
  10   0.032930   0.363236   0.362884   0.081145    9.123e-02
  20   0.032782   0.380316   0.346993   0.080886    1.778e-02
  30   0.032781   0.383597   0.343714   0.080886    3.500e-03
  50   0.032781   0.384370   0.342941   0.080886    1.357e-04
 100   0.032781   0.384401   0.342910   0.080886    4.013e-08
 194   0.032781   0.384401   0.342910   0.080886    9.437e-15
```

前几轮 B 在 0.26 ~ 0.42 之间来回晃——因为 B ↔ C 构成了一个 2 元环，权重在两者间来回荡。**振荡**是幂迭代的正常现象，它会被传送项一点点抹平。

### 性能实测

Python 实现，d=0.85，tol=1e-10：

| 节点数 | 边数 | 迭代轮数 | 耗时 | PR 总和 |
| ------ | ---- | -------- | ---- | -------- |
| 1,000 | 5,000 | 27 | 9.6 ms | 1.000000000000 |
| 10,000 | 50,000 | 27 | 109.1 ms | 1.000000000000 |
| 100,000 | 500,000 | 27 | 2350.4 ms | 1.000000000000 |

**注意迭代轮数是常数 27**——这就是幂迭代最漂亮的地方：**复杂度只跟边数线性相关，跟收敛速度无关，而收敛速度只跟图的谱结构有关**。

单轮是 O(|E| + |V|)，内存只要两个长度为 N 的向量加一张边表。**这就是它能跑互联网规模的原因**，不需要任何矩阵分解。

## 我踩过的坑

写这篇的时候，除了悬挂节点，我另外踩了两个坑，都被对拍测试抓出来了。

### 坑 1：特征向量取错了方向

我写对拍脚本时，用稠密矩阵求"标准答案"：

```python
# ❌ 错误写法
vals, vecs = np.linalg.eig(G.T)   # 取了 G 的转置
r_dense = vecs[:, idx]
```

结果 L1 差异高达 **0.72**——完全对不上。

**原因**：PageRank 向量满足 `r = G·r`，它是 `G` 的**右**特征向量。我取 `eig(G.T)` 得到的是 `G` 的**左**特征向量，对应的是 `r = r·G`（行随机约定）那一套。

```python
# ✅ 正确写法
vals, vecs = np.linalg.eig(G)     # 直接对 G 求特征分解
```

**教训**：写线性代数之前，先在纸上确认清楚"我是要左特征向量还是右特征向量"。这个不是靠试的，是靠定义推的。

### 坑 2：Go 的零值陷阱

Go 版本我最初写的是：

```go
type Options struct {
    Damping float64
}

if opts.Damping != 0 {
    d = opts.Damping
}
```

看起来没问题对吧？**但 `d = 0` 是个有意义的取值**（退化成均匀分布）。这段代码分不清"用户没设置"和"用户设成了 0"，于是 `Options{Damping: 0}` 会静默地退回 0.85。

有意思的是，我一开始的测试**没发现这个 bug**——因为我的测试图是 `0→1→2→3→0` 这样一个 4 元环，**完全对称**，d=0 和 d=0.85 的结果碰巧一样。

我改成非对称的图（`0→1, 1→2, 2→2`）之后，bug 立刻暴露：

```text
[FAIL] 回归：d=0 在非对称图上也完全均匀 — 0.333333333, 0.333333333, 0.333333333
```

修复办法是**用指针**：

```go
Damping *float64    // nil 才是真正的「没设置」

if opts.Damping != nil {
    d = *opts.Damping
}
```

**教训**：对称的测试用例会掩盖 bug。**专门构造一个"能区分这两种情况"的用例**，才算真的测到了。同一个坑，TypeScript 和 Python 用 `??` 和默认值参数天然没这个问题——语言特性救了你，但测试该写还是要写。

## 实际应用

### 1. 搜索引擎排序

这是最初的战场。现在 Google 的排序融合了 200+ 种信号，PageRank 是其中之一（而且 Google 官方文档明确说它仍是 core ranking systems 的组成部分），但已经不是唯一主角了。

### 2. 推荐系统里的图计算

不只是"推荐相关商品"——**PageRank 可以跑在任何图上**：

```text
用户-商品二部图     → 商品热度
关注关系图          → 影响力排序
知识图谱            → 实体重要性
论文引用图          → 学术影响力
```

"买了这个商品的人也买了"本质上就是 Personalized PageRank。

### 3. 反作弊：TrustRank

PageRank 有个众所周知的弱点：**链接农场**。

```text
100 个垃圾站互链 → 每个都获得大量入链 → PR 集体虚高
```

Gyöngyi 等人 2004 年提出 **TrustRank**：给每个页面打一个"可信分"，然后从**可信种子**出发做 PageRank。

```text
标准 PageRank：  所有页面的初始信任度都是 1/N
TrustRank：      人工标记一批种子页面（比如大媒体、政府、知名站点）
                 信任度从种子出发沿链接传播，传播时按比例衰减
                 离种子越远，信任度越低
```

**同一套数学，换个初始向量，就变成了反作弊武器。** 这也是"个性化 PageRank"的思路——算法框架是通用的，变的只是那个 `v`。

### 4. 分布式实现

真实场景下几十亿节点单机跑不动，工业界的做法：

- **MapReduce**：Brin & Page 1998 年就设计了并行版本，每台机器处理一部分节点
- **Pregel / Spark GraphX**：把幂迭代看成超步（superstep），每轮一轮同步
- **外推加速（Extrapolation）**：用 Aitken 加速 / 二次外推，少跑几十轮

有意思的是，虽然分布式版本复杂得多，但**核心算法跟单机的完全一样**。幂迭代天生适合并行——每轮的计算彼此独立。

## 复杂度分析

| 指标 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 单轮迭代 | **O(\|E\| + \|V\|)** | 扫一遍边表 + 一次 O(N) 的传送项累加 |
| 总时间 | O((\|E\| + \|V\|) × K) | K 是迭代轮数，**与网页总数几乎无关** |
| 空间 | **O(\|V\|)** | 两个长度为 N 的向量 + 邻接表 |
| 收敛速度 | 每轮误差 × \|λ₂\| ≤ d | 理论上界 K ≥ 1 + log(ε/2)/log(d) |

**为什么不是 O(N²)？** 因为从头到尾**从来没有显式构造过那个 N×N 的矩阵**。稠密矩阵是数学抽象，实际计算只碰边表。这是 PageRank 能工程化的关键。

## 面试怎么答？

如果面试官问"讲讲 PageRank"，我建议这么组织：

**第一层（必答）**：链接投票 + 均分给每条出链 + 阻尼因子 d=0.85 + 随机冲浪者模型。

**第二层（加分）**：写成矩阵就是求 Google 矩阵 G 的主特征向量（λ=1），用幂迭代求解；Perron–Frobenius 定理保证唯一解和收敛。

**第三层（加分）**：悬挂节点必须特殊处理，否则质量流失、收敛到错误答案。

**第四层（杀手锏）**：个性化 PageRank 与主题敏感 PageRank——同一个框架换个传送分布 v，就能做个性化和反作弊。

**第五层（工程细节）**：复杂度 O(K·(|E|+|V|))，K 约几十轮且与规模无关；不构造稠密矩阵；分布式用 MapReduce 或 Pregel。

## 小结

PageRank 用**迭代**换掉了**求解**：

- ✅ 用随机冲浪者模型把"重要性"定义得客观、可计算
- ✅ 幂迭代避免了几十亿阶线性方程组，复杂度 O(K·(|E|+|V|))
- ✅ 收敛轮数几乎与网页总数无关，天然能放大到互联网尺度
- ✅ 换个传送分布 v 就是个性化搜索、就是反作弊
- ❌ 只看链接结构，不看内容质量（所以后来需要和文本相关性融合）
- ❌ 容易被链接作弊攻击（所以后来需要 TrustRank）
- ❌ 标准 PageRank 不支持加权边

**最值得带走的一句话**：PageRank 的精妙不在公式，而在于它把一个**循环定义**变成了一个**可以稳定收敛的迭代过程**。这个思路——"把递归定义改写成不动点迭代"——远不止用在这个算法里 🎯

## 参考资料

- Brin & Page, *The Anatomy of a Large-Scale Hypertextual Web Search Engine*, WWW7 1998 — http://infolab.stanford.edu/pub/papers/google.pdf
- Page, Brin, Motwani & Winograd, *The PageRank Citation Ranking: Bringing Order to the Web*, Stanford 技术报告 1999 — https://cs.brown.edu/courses/cs253/papers/pagerank.pdf
- Haveliwala & Kamvar, *An Analytical Comparison of Approaches to Personalizing PageRank*, Stanford 技术报告 2003 — https://nlp.stanford.edu/pubs/haveliwala2003personalizing.pdf
- Haveliwala, *Topic-Sensitive PageRank*, TKDE 2003 — https://research.taherh.org/pubs/topic-sensitive-pagerank-tkde.pdf
- Langville & Meyer, *Stochastic matrices, PageRank, and the Google matrix* — https://web.maths.unsw.edu.au/~vkaarnioja/stochastic.pdf
- Wikipedia, *PageRank* — https://en.wikipedia.org/wiki/PageRank
- Wikipedia, *File:PageRanks-Example.svg*（本文验证基准的精确解出处）— https://commons.wikimedia.org/wiki/File:PageRanks-Example.svg
- Gyöngyi, Garcia-Molina & Pedersen, *Combating Web Spam with TrustRank*, VLDB 2004
- Kamvar et al., *Exploiting the Block Structure of the Web for Computing PageRank*, WWW 2003 — http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.13.42
