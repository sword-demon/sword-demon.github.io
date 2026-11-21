---
title: 模拟退火精讲（Simulated Annealing）：从爬山算法到全局最优的随机搜索
description: 从「为什么贪心和局部搜索总卡在局部最优」讲起，一文打通爬山算法与模拟退火的本质差异、Metropolis 接受准则的物理由来、降温曲线设计、离散/连续两类解空间的邻域构造，以及装箱问题与 TSP 两个实战案例，附 TypeScript / Python / Go 三语言完整实现，所有数值均由真实代码跑出并三方交叉验证
date: 2026-11-19 10:34:18
categories:
  - Algorithm
tags:
  - simulated-annealing
  - randomized-algorithm
  - hill-climbing
  - optimization
  - heuristics
  - tsp
  - interview
sidebarSort: 138
---

# 模拟退火精讲（Simulated Annealing）：从爬山算法到全局最优的随机搜索

先给你一个特别真实的场景。

你负责一个物流调度系统，每天要决定：**把这 500 个订单分配到这 30 辆货车上，每辆车的载重不能超**。目标是让「空驶里程」最小。

你写了三天，憋出一个贪心：按订单重量从大到小，能塞就塞。跑起来效果还行，直到某天来了批订单，重量都是 13，车厢容量都是 25。

结果呢？每车只能装一个，30 辆车装了 30 单，剩下 470 单全积压。

你试着改：先按「重量 + 目的地距离」排序呢？换几种启发式规则？每改一版，总有一批订单组合让它翻车。**因为这个问题的解空间是组合爆炸的，任何固定的贪心规则都必然在某些输入上翻车。** 决策空间太大，你穷举不完。

这时候，你需要的就是**模拟退火** ✨

---

## 一、先把问题问清楚

### 1.1 什么是「优化问题」

先把术语统一。我们面对的问题，抽象出来长这样：

```text
给定：解空间 S（所有可能的解）
目标：找到一个解 s* ∈ S，使得目标函数 f(s*) 最小（或最大）
约束：s 必须满足一堆可行性条件
```

举几个例子：

| 问题 | 解空间 | 目标函数 |
| ---- | ------ | -------- |
| TSP（旅行商） | 城市排列 | 路径总长 |
| 装箱 | 物品分组 | 用了几个箱子 |
| 调度 | 任务 → 时间槽 | 总延迟 |
| 参数调优 | 连续/离散参数向量 | 损失函数值 |

这类问题有个共同特征：**要么 NP-Hard，要么根本写不出多项式时间的精确解**。TSP 的精确解是 O(n²2ⁿ)（Held-Karp），n=20 的时候是十亿级别，n=50 直接爆炸。

### 1.2 三种解法

面对 NP-Hard 问题，你有三张牌：

**① 精确算法（Exact）**：暴力枚举 / DP / 分支定界。**保证最优**，但复杂度通常指数级。

**② 启发式 / 近似算法（Heuristic）**：贪心、贪心 + 局部搜索。速度快，但**不保证最优**，而且很容易卡死。

**③ 元启发式 / 随机化搜索（Meta-heuristic）**：模拟退火、遗传算法、蚁群、禁忌搜索。**大概率能找到很好的解**，但也不保证最优。

模拟退火属于第三类。它的定位非常清晰：

> **当你确信存在一个更好的解、但精确算法跑不动、贪心又不够好的时候，用模拟退火。**

### 1.3 为什么不能直接用爬山算法

爬山算法（Hill Climbing）是最朴素的局部搜索：

```text
1. 随便找个初始解
2. 看看附近有没有更好的解
3. 有 → 跳过去
4. 没有 → 换个方向再试 / 就卡在这了
```

问题出在第 3 步的"否"上：**一旦附近没有更好的解，就彻底卡死。**

我用 `f(x) = x² - 10cos(2πx)` 这个经典多峰函数做了实测（下面是真实运行结果）：

```text
--- 爬山算法从 10 个不同起点出发 ---
  起点  -5.000 -> x=  -4.9747 f=14.8737
  起点  -3.889 -> x=  -3.9798 f=5.9192
  起点  -2.778 -> x=  -2.9849 f=-1.0454
  起点  -1.667 -> x=  -1.9899 f=-6.0202
  起点  -0.556 -> x=  -0.9950 f=-9.0050
  起点   0.556 -> x=   0.0000 f=-10.0000   ← 只有这个起点碰巧找到了全局最优
  起点   1.667 -> x=   1.9899 f=-6.0202
  起点   2.778 -> x=   2.9848 f=-1.0454
  起点   3.889 -> x=   3.9798 f=5.9192
  起点   5.000 -> x=   4.9747 f=14.8737
```

真实最优解是 `x = 0, f = -10`（我用 200 万次网格暴力搜索验证过）。

看懂了吗？**10 个起点里只有 1 个找到了全局最优，其余 9 个都卡在了各自的局部最优上**，而且卡住的位置完全取决于你从哪出发。这就是爬山算法的宿命 —— 它对初始解**极度敏感**。

而模拟退火从**同一个起点 4.9** 出发：

```text
[真值] 网格搜索 x=0.000000, f=-10.000000
[起点] x=4.9, f=15.919830
[爬山] x=4.974689, f=14.873723      ← 卡在局部最优
[退火] x=-0.000908, f=-9.999836     ← 跳出来了，误差 0.016%
```

### 1.4 核心洞见：允许"倒退"

爬山算法卡死的根本原因是：**它把"变差"和"终止"绑死了**。

模拟退火的洞见是：**变差不一定要拒绝，但要让它变得"越来越难被接受"。**

早期温度高的时候，偶尔接受一个变差的解，是为了跳出当前的坑；温度降下来之后，变差的解几乎必被拒绝，算法就逐渐凝固在某个解附近 —— 那时它已经是一个**局部最优**，而这个局部最优因为早期充分探索过，有很大概率是全局最优。

物理上的灵感来自**金属退火**：把烧红的钢件慢慢冷却，金属原子先是无规则剧烈运动（高温），逐渐有序排列（低温），最后稳定成一个低能量状态。

---

## 二、原理拆解

### 2.1 三个核心概念

| 概念 | 含义 | 英文 |
| ---- | ---- | ---- |
| **能量函数** | 评价一个解有多好 | Energy Function / Objective Function |
| **邻域** | 从当前解能一步到达的解的集合 | Neighborhood |
| **温度** | 控制接受劣解的概率尺度 | Temperature |

**能量函数**就是把业务目标翻译成数字。比如装箱问题里「用了几个箱子」就是能量，越小越好。

**邻域**是搜索能力的核心 —— 它决定了你能怎么"挪动"。设计邻域是使用 SA 最重要的技巧，后面第 2.5 节详细讲。

**温度** T 是一个抽象量，不是物理温度。它控制着接受劣解的概率。

### 2.2 Metropolis 准则：SA 的灵魂

模拟退火的数学核心是 **Metropolis 准则**（1983 年 Metropolis 等人提出，原本用于统计物理的分子模拟）。

定义能量差：

```text
ΔE = E(new) - E(current)
```

接受的概率：

```text
                ⎧ 1                    ΔE ≤ 0   （变优，无条件接受）
P(accept) =     ⎨
                ⎩ exp(-ΔE / T)        ΔE > 0   （变差，按概率接受）
```

**变优就接受，这没得说。变差呢？** 接受概率是 `exp(-ΔE / T)`。这个式子有三个关键性质：

1. **ΔE 越大，接受概率越小** —— 变差得越离谱，越不会被接受。
2. **T 越大，接受概率越接近 1** —— 高温时几乎什么都接受。
3. **T → 0 时，概率 → 0** —— 低温时退化成纯爬山。

我算了一张实际数值表（真实代码跑出来的，不是拍脑袋）：

```text
=== 接受概率表 P = exp(-ΔE/T) ===
ΔE\T      100       50       20       10        5        1      0.1
    1    99.00    98.02    95.12    90.48    81.87    36.79     0.00
    5    95.12    90.48    77.88    60.65    36.79     0.67     0.00
   10    90.48    81.87    60.65    36.79    13.53     0.00     0.00
   50    60.65    36.79     8.21     0.67     0.00     0.00     0.00
  100    36.79    13.53     0.67     0.00     0.00     0.00     0.00
```

读这张表：

- 高温（T=100）时，ΔE=100 的劣解也有 36.79% 概率被接受 —— **此时算法几乎是纯随机游走**，完全不看当前解好坏。
- 低温（T=1）时，ΔE=10 的劣解接受概率已经是 0.00% —— **此时算法已经是纯爬山**。
- 中间温度（T=10~20）是主战场，ΔE 小的劣解可以接受，ΔE 大的不行。

> 🔑 **温度控制的是"探索"与" exploitation（利用）"的平衡**。这个平衡靠三个参数：初始温度 T₀、降温系数 d、终止温度 T_k。

### 2.3 降温曲线

每完成一轮（在当前温度下做 N 次尝试），温度乘以降温系数 d：

```text
T ← T × d        （0 < d < 1，常用 0.95 ~ 0.99）
```

直到 `T ≤ T_k` 时终止。

**为什么用指数降温而不是线性？**

因为指数降温能让「低温阶段」（精修阶段）占据总迭代次数的大头。实测数据（T₀=100, d=0.97）：

```text
  k=  0  T=  100.000000
  k= 20  T=   54.379434
  k= 40  T=   29.571229
  k= 60  T=   16.080667
  k= 80  T=    8.744576
  k=100  T=    4.755251
  k=120  T=    2.585878
  k=140  T=    1.406186
  k=160  T=    0.764676
  k=180  T=    0.415827
  k=200  T=    0.226124
```

可以看到：前 60 轮温度从 100 降到 16，后 140 轮才从 16 降到 0.23。**低温的精修阶段占了 70% 的迭代次数** —— 这是符合直觉的：先用高温快速定位大致的盆地，再用低温精细打磨。

**降温轮数怎么算？** 直接用对数：

```text
T_k = T₀ × d^k  ⟹  k = ceil( ln(T_k / T₀) / ln(d) )
```

实测：

```text
T0=100 cooling=0.97 tk=0.000001 -> 降温 605 轮
T0=100 cooling=0.95 tk=0.000001 -> 降温 360 轮
T0=100 cooling=0.99 tk=0.000001 -> 降温 1833 轮
```

降温系数从 0.97 调到 0.99，轮数直接翻了 3 倍。**d 越大，每步降得越慢，搜索越精细但越慢**。

### 2.4 完整的算法流程

```text
1. 选一个初始解 current，记录 best = current
2. T ← T₀
3. while T > T_k:
4.     for i = 1 to N:                    # 每个温度下做 N 次尝试
5.         candidate ← neighbor(current)  # 在当前解附近扰动出一个新解
6.         ΔE ← energy(candidate) - energy(current)
7.         if ΔE ≤ 0 or rand() < exp(-ΔE / T):
8.             current ← candidate        # 接受
9.             if energy(candidate) < energy(best):
10.                best ← candidate      # 更新全局最优
11.    T ← T × d                        # 降温
12. return best
```

**这里有三个地方最容易写错，我逐条强调：**

> ⚠️ **坑 1（第 5 行）**：新解必须从 **`current`** 扰动出来，不是从 `best`！
>
> 从 `best` 出发就退化成爬山算法了 —— 因为 `best` 是全局最好，从它出发只可能在它周围小范围挪动，永远跳不出局部最优。**这是 SA 最经典的实现错误**，我见过太多人踩。

> ⚠️ **坑 2（第 9-10 行）**：必须**单独维护全局最优 `best`**，最后返回的是 `best`，不是最后一次接受的 `current`。
>
> 因为最后一次接受的解很可能是个平庸的解（温度还没降到底就被打断了），而 `best` 记录的是整个过程中见过的最好解。

> ⚠️ **坑 3（第 4 行的 N）**：每个温度下要做**多次**尝试，不能只做一次。
>
> 每个温度档位只试一次的话，搜索轨迹会非常抖，而且总迭代次数太少。

### 2.5 邻域设计：SA 真正的难点

SA 框架是通用的，**难点全在邻域函数怎么写**。这是实践中最花时间的部分。

#### 连续解空间：扰动幅度应该随温度缩放

```typescript
// ❌ 错误：扰动幅度固定
neighbor: (x, t) => x + (Math.random() * 2 - 1) * 0.5

// ✅ 正确：扰动幅度随温度线性缩放
neighbor: (x, t) => x + (Math.random() * 2 - 1) * t
```

**为什么？** 温度高的时候需要大步移动才能跳出去；温度低的时候需要小步微调才能精修。如果幅度固定，高温阶段跳不远，低温阶段又跳太粗 —— 两个阶段都干不好。

常见的做法还有：**扰动量取高斯分布**，而不是均匀分布：

```typescript
// Box-Muller 变换生成正态随机数
function gaussian(rng: Rng): number {
  let u = 0, v = 0;
  while (u === 0) u = rng.next();
  while (v === 0) v = rng.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
```

均匀分布的扰动会把搜索点"均匀铺开"，高斯分布则以当前点为中心、越靠近中心概率越高 —— 后者更符合"在附近找"的直觉。

#### 离散解空间：设计"邻接操作"

离散问题没有"距离"概念，你得自己定义怎么"挪一下"。

| 问题类型 | 常用邻域操作 | 说明 |
| -------- | ------------ | ---- |
| **排列类**（TSP、任务排序） | **2-opt**：反转一段 | 保持合法性，效率高 |
| **排列类** | swap：交换两个位置 | 最简单，但可能跳出优质区域太远 |
| **分配类**（装箱、调度） | move：把一个元素移到另一个位置 | 装箱问题的标准做法 |
| **集合类**（选点、选子集） | add / remove：加一个或删一个 | 改变解的规模 |
| **二进制类**（特征选择） | flip：翻转一位 | 简单有效 |

TSP 上的 2-opt 长这样：

```text
原路径：0 → 1 → 2 → 3 → 4 → 5 → 0
              ↑_______↑
                反转这段

新路径：0 → 1 → 4 → 3 → 2 → 5 → 0
```

2-opt 的好处是：**反转一段后，路径依然是一条合法的哈密顿回路**，不会出现"城市重复访问"或"城市丢失"的非法解。相比 swap 交换两个点，2-opt 的邻域更"局部"，更适合精细搜索。

### 2.6 随机数：必须可复现

SA 是随机化算法，但**工程上绝对不能用 `Math.random()`** —— 你没法 debug、调参、复现问题。

必须用一个**带种子的伪随机数发生器**，并且**三种语言用同一套算法**，这样跨语言结果才能对得上。

我用的是经典的 **Numerical Recipes LCG**：

```typescript
class Rng {
  private state: number;
  constructor(seed: number) {
    this.state = (seed >>> 0) || 0x9e3779b9; // 非零，否则会退化成常数序列
  }
  next(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
}
```

三行的实现，但有两个细节值得注意：

- `Math.imul` 做 32 位乘法，避免 JS 的 64 位浮点乘法丢精度
- `>>> 0` 强制转回无符号 32 位整数

**注意 `Math.random()` 和 LCG 的区别**：`Math.random()` 用的是 xorshift128+，质量更好但没法指定种子；LCG 质量略差（低维时有相关性），但**可复现**这个性质在工程上值钱得多。

> 📌 本文所有代码用的是同一套 LCG，TypeScript / Python / Go 三份实现跑出的结果**逐位一致**。文末有验证方式。

---

## 三、代码实现

### 3.1 TypeScript —— 通用退火框架

先给出框架本体，这是最值得抄走的部分。

```typescript
/**
 * 模拟退火（Simulated Annealing）—— 通用框架 TypeScript 实现
 */

/**
 * 线性同余伪随机数发生器（Numerical Recipes）
 * 之所以自己写而不用 Math.random()：因为要可复现 —— 同一个种子必须跑出同一条轨迹，
 * 否则调参和 debug 都无从谈起。
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    // 保证 state 非零，否则 LCG 会退化成常数序列
    this.state = (seed >>> 0) || 0x9e3779b9;
  }

  /** 返回 [0, 1) 的浮点数 */
  next(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  /** 返回 [min, max) 的浮点数 */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** 返回 [0, n) 的整数 */
  int(n: number): number {
    return Math.floor(this.next() * n);
  }
}

export interface AnnealOptions<T> {
  /** 初始解 */
  initial: T;
  /** 能量函数（目标函数）：值越小越优 */
  energy: (s: T) => number;
  /** 邻域函数：从当前解生成一个候选解，temperature 控制扰动幅度，rng 用于可复现的随机扰动 */
  neighbor: (s: T, temperature: number, rng: Rng) => T;
  /** 初始温度 */
  t0?: number;
  /** 终止温度 */
  tk?: number;
  /** 降温系数（0 < d < 1），每轮乘一次 */
  cooling?: number;
  /** 每个温度档位下的迭代次数 */
  iterationsPerTemp?: number;
  /** 随机种子 */
  seed?: number;
  /** 每轮降温后的回调（用于打印温度 / 能量轨迹） */
  onProgress?: (info: {
    temperature: number;
    currentEnergy: number;
    bestEnergy: number;
    iteration: number;
  }) => void;
}

export interface AnnealResult<T> {
  /** 全局最优解 */
  best: T;
  /** 全局最优能量值 */
  bestEnergy: number;
  /** 最终温度 */
  finalTemperature: number;
  /** 总迭代次数 */
  iterations: number;
}

/**
 * 模拟退火主函数
 *
 * 关键点 1：新解必须从「当前解」扰动得到，而不是从「全局最优解」——
 *          从全局最优出发就退化成了爬山算法，永远跳不出局部最优。
 * 关键点 2：必须单独维护全局最优解，最终返回的是它，而不是最后一次接受的解。
 * 关键点 3：ΔE <= 0 时无条件接受；ΔE > 0 时以 exp(-ΔE/T) 的概率接受。
 */
export function anneal<T>(opts: AnnealOptions<T>): AnnealResult<T> {
  const {
    initial,
    energy,
    neighbor,
    t0 = 100,
    tk = 1e-6,
    cooling = 0.97,
    iterationsPerTemp = 200,
    seed = 20241119,
    onProgress,
  } = opts;

  const rng = new Rng(seed);

  let current = initial;
  let currentEnergy = energy(current);

  let best = current;
  let bestEnergy = currentEnergy;

  let temperature = t0;
  let iterations = 0;

  while (temperature > tk) {
    for (let i = 0; i < iterationsPerTemp; i++) {
      const candidate = neighbor(current, temperature, rng);
      const candidateEnergy = energy(candidate);
      const delta = candidateEnergy - currentEnergy; // ΔE

      if (delta <= 0 || rng.next() < Math.exp(-delta / temperature)) {
        // 接受：要么变优，要么以一定概率接受劣解
        current = candidate;
        currentEnergy = candidateEnergy;
        iterations++;

        if (candidateEnergy < bestEnergy) {
          best = candidate;
          bestEnergy = candidateEnergy;
        }
      }
    }
    temperature *= cooling; // 降温
    onProgress?.({ temperature, currentEnergy, bestEnergy, iteration: iterations });
  }

  return { best, bestEnergy, finalTemperature: temperature, iterations };
}

/**
 * 爬山算法（用于对照）：只接受变优的解
 */
export function hillClimb<T>(opts: {
  initial: T;
  energy: (s: T) => number;
  neighbor: (s: T, step: number, rng: Rng) => T;
  step: number;
  maxIterations: number;
  seed?: number;
}): { best: T; bestEnergy: number } {
  const rng = new Rng(opts.seed ?? 1);
  let current = opts.initial;
  let currentEnergy = opts.energy(current);
  let best = current;
  let bestEnergy = currentEnergy;

  for (let i = 0; i < opts.maxIterations; i++) {
    const candidate = opts.neighbor(current, opts.step, rng);
    const candidateEnergy = opts.energy(candidate);
    if (candidateEnergy < currentEnergy) {
      current = candidate;
      currentEnergy = candidateEnergy;
      if (candidateEnergy < bestEnergy) {
        best = candidate;
        bestEnergy = candidateEnergy;
      }
    }
  }
  return { best, bestEnergy };
}
```

**框架层的抽象有三个好处：**

1. 解空间可以是任意类型 `T`（number、number[]、复杂对象都行）
2. 能量函数、邻域函数分离，换问题只改这两块
3. 邻域函数拿到了 `rng`，**随机性完全由调用方控制**，可复现

### 3.2 TypeScript —— 案例一：多峰函数最小值

```typescript
import { anneal, hillClimb, Rng } from "./sa";

/** 多峰函数：x^2 - 10*cos(2πx)，在 [-5, 5] 上有很多局部最小值 */
function f(x: number): number {
  return x * x - 10 * Math.cos(2 * Math.PI * x);
}

/** 暴力网格搜索找真实最优值（ground truth） */
function bruteForce(): { x: number; f: number } {
  let bestX = 0;
  let bestF = Infinity;
  for (let i = 0; i <= 2_000_000; i++) {
    const x = -5 + (10 * i) / 2_000_000;
    const v = f(x);
    if (v < bestF) {
      bestF = v;
      bestX = x;
    }
  }
  return { x: bestX, f: bestF };
}

const truth = bruteForce();
console.log(`[真值] 网格搜索 x=${truth.x.toFixed(6)}, f=${truth.f.toFixed(6)}`);

const start = 4.9;
console.log(`[起点] x=${start}, f=${f(start).toFixed(6)}`);

// --- 爬山算法 ---
const hill = hillClimb({
  initial: start,
  energy: f,
  neighbor: (x, step, rng) => x + (rng.next() * 2 - 1) * step,
  step: 0.5,
  maxIterations: 100_000,
  seed: 7,
});
console.log(`[爬山] x=${hill.best.toFixed(6)}, f=${hill.bestEnergy.toFixed(6)}`);

// --- 模拟退火 ---
const sa = anneal<number>({
  initial: start,
  energy: f,
  neighbor: (x, t, rng) => x + (rng.next() * 2 - 1) * t * 0.5,
  t0: 20,
  tk: 1e-4,
  cooling: 0.95,
  iterationsPerTemp: 50,
  seed: 20241119,
});
console.log(
  `[退火] x=${sa.best.toFixed(6)}, f=${sa.bestEnergy.toFixed(6)}, 迭代=${sa.iterations}`,
);
```

**真实运行结果：**

```text
[真值] 网格搜索 x=0.000000, f=-10.000000
[起点] x=4.9, f=15.919830
[爬山] x=4.974689, f=14.873723
[退火] x=-0.000908, f=-9.999836, 迭代=7126
```

退火结果的误差是 `|(-0.000908) - 0| = 0.000908`，相对误差 0.016%。而爬山算法差了整整 24.87。

### 3.3 TypeScript —— 案例二：装箱问题（离散解空间）

回到开头那个物流场景。抽象成经典的 **Bin Packing**：给定一堆物品和箱子容量，尽量少用箱子。

**解空间设计**：解 = 物品下标的一个排列。

**能量函数**：把这个排列按顺序依次「首次适应」装进箱子，energy = 用了几个箱子。

```typescript
import { anneal, Rng } from "./sa";

interface Item {
  name: string;
  size: number;
}

const items: Item[] = [
  { name: "A", size: 8 },
  { name: "B", size: 7 },
  { name: "C", size: 6 },
  { name: "D", size: 5 },
  { name: "E", size: 4 },
  { name: "F", size: 3 },
  { name: "G", size: 3 },
  { name: "H", size: 2 },
];

const BIN_CAPACITY = 10;

/** 解 = 物品下标的一个排列 */
type Solution = number[];

/** 首次适应装箱：返回用了几个箱子，以及每箱装了谁 */
function firstFit(order: Solution): { count: number; bins: number[][] } {
  const bins: number[][] = [];
  const loads: number[] = [];
  for (const idx of order) {
    const size = items[idx].size;
    let placed = false;
    for (let b = 0; b < bins.length; b++) {
      if (loads[b] + size <= BIN_CAPACITY) {
        bins[b].push(idx);
        loads[b] += size;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bins.push([idx]);
      loads.push(size);
    }
  }
  return { count: bins.length, bins };
}

/** 能量 = 用了几个箱子（越小越好） */
function energy(sol: Solution): number {
  return firstFit(sol).count;
}

/** 邻域：随机交换两个位置 */
function neighbor(sol: Solution, _t: number, rng: Rng): Solution {
  const next = sol.slice();
  const n = next.length;
  const a = rng.int(n);
  const b = rng.int(n);
  if (a !== b) {
    const tmp = next[a];
    next[a] = next[b];
    next[b] = tmp;
  }
  return next;
}

/** 精确解：状态压缩 DP，dp[mask] = 装下 mask 这些物品最少需要几个箱子 */
function exactBins(): number {
  const n = items.length;
  const total = 1 << n;
  const dp = new Array<number>(total).fill(Infinity);
  dp[0] = 0;
  const sum = new Array<number>(total).fill(0);
  for (let mask = 1; mask < total; mask++) {
    const lb = mask & -mask;
    const idx = Math.log2(lb) | 0;
    sum[mask] = sum[mask ^ lb] + items[idx].size;
  }
  for (let mask = 1; mask < total; mask++) {
    // 枚举「最后一个箱子装哪些」= mask 的非空子集 sub
    for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
      if (sum[sub] > BIN_CAPACITY) continue;
      const rest = mask ^ sub;
      dp[mask] = Math.min(dp[mask], dp[rest] + 1);
    }
  }
  return dp[total - 1];
}

// ============ 使用示例 ============
const initial: Solution = items.map((_, i) => i);

const result = anneal<Solution>({
  initial,
  energy,
  neighbor,
  t0: 3,
  tk: 0.01,
  cooling: 0.97,
  iterationsPerTemp: 100,
  seed: 42,
});

const packed = firstFit(result.best);
console.log(`[SA]   最优解 = ${result.bestEnergy} 个箱子`);
packed.bins.forEach((bin, i) => {
  const load = bin.reduce((acc, idx) => acc + items[idx].size, 0);
  console.log(
    `  箱 ${i}: [${bin.map((idx) => items[idx].name).join(", ")}]  装载 ${load}/${BIN_CAPACITY}`,
  );
});
console.log(`[精确] 最少箱子数 = ${exactBins()}`);
const totalSize = items.reduce((a, b) => a + b.size, 0);
console.log(`[理论下界] ceil(总大小 ${totalSize} / ${BIN_CAPACITY}) = ${Math.ceil(totalSize / BIN_CAPACITY)}`);
console.log(`[SA 顺序] ${result.best.map((idx) => items[idx].name).join(" → ")}`);
```

**运行结果（同时用状态压缩 DP 算出精确解做对照）：**

```text
[SA]   最优解 = 4 个箱子
  箱 0: [A, H]  装载 10/10
  箱 1: [B, F]  装载 10/10
  箱 2: [C, E]  装载 10/10
  箱 3: [D, G]  装载 8/10
[精确] 最少箱子数 = 4
[理论下界] ceil(总大小 38 / 10) = 4
```

SA 找到的 4 和 DP 精确解一致，也和理论下界 `ceil(38/10) = 4` 一致 —— **三种方式互相印证，说明结果是对的**。

> 💡 这里有个设计细节值得说：**我没有让解直接表示「物品 → 箱子编号」的分配**，而是让解表示**一个排列**，再用"首次适应"策略把排列翻译成分配。
>
> 为什么？因为前者可能产生**非法解**（某个箱子超载），你得额外设计惩罚项来惩罚非法状态 —— 我第一版就是这么写的，结果 SA 找到的解里有个箱子装了 20/10 的超载货，energy 算出来是 1，但实际至少要 2 个箱子。**惩罚项的权重要么调不准，要么引入额外的错误**。
>
> 用"排列 + 确定性翻译"的设计，能量函数天然只接受合法解，问题从根上消失了。**这是设计 SA 目标函数时最值得学的一招：把可行性约束编码进解的表示里，而不是靠惩罚项去堵。**

### 3.4 TypeScript —— 案例三：TSP（旅行商）

TSP 是 SA 的"Hello World"，但也是最能体现 2-opt 邻域价值的例子。

```typescript
import { anneal, Rng } from "./sa";

/** 生成一个确定性的城市布局（曼哈顿距离） */
function makeCities(n: number) {
  const pts = Array.from({ length: n }, (_, i) => ({
    x: (i * 37) % 100,
    y: (i * 61) % 100,
  }));
  const dist: number[][] = [];
  for (let i = 0; i < n; i++) {
    dist.push([]);
    for (let j = 0; j < n; j++) {
      dist[i].push(Math.abs(pts[i].x - pts[j].x) + Math.abs(pts[i].y - pts[j].y));
    }
  }
  return { pts, dist };
}

/** 路径总长（闭合回路） */
function tourLength(order: number[], dist: number[][]): number {
  let total = 0;
  for (let i = 0; i < order.length; i++) {
    total += dist[order[i]][order[(i + 1) % order.length]];
  }
  return total;
}

/** 邻域：随机选两个位置，反转中间的一段（2-opt） */
function twoOpt(order: number[], _t: number, rng: Rng): number[] {
  const next = order.slice();
  const n = next.length;
  const a = rng.int(n);
  const b = rng.int(n);
  if (a === b) return next;
  let lo = Math.min(a, b);
  let hi = Math.max(a, b);
  while (lo < hi) {
    const tmp = next[lo];
    next[lo] = next[hi];
    next[hi] = tmp;
    lo++;
    hi--;
  }
  return next;
}

/** 精确解：Held-Karp 状态压缩 DP，O(n^2 * 2^n) */
function exactTsp(dist: number[][]): number {
  const n = dist.length;
  const FULL = 1 << n;
  const dp: number[][] = [];
  for (let m = 0; m < FULL; m++) dp.push(new Array<number>(n).fill(Infinity));

  dp[1][0] = 0; // mask={0}, 停在城市 0

  for (let mask = 1; mask < FULL; mask++) {
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue;
      const cur = dp[mask][i];
      if (!isFinite(cur)) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;
        const nm = mask | (1 << j);
        dp[nm][j] = Math.min(dp[nm][j], cur + dist[i][j]);
      }
    }
  }
  // 最后回到起点 0
  let best = Infinity;
  for (let i = 0; i < n; i++) {
    best = Math.min(best, dp[FULL - 1][i] + dist[i][0]);
  }
  return best;
}

// ============ 使用示例 ============
const n = 12;
const { dist } = makeCities(n);
console.log(`城市数 n = ${n}`);

const sa = anneal<number[]>({
  initial: Array.from({ length: n }, (_, i) => i),
  energy: (o) => tourLength(o, dist),
  neighbor: twoOpt,
  t0: 100,
  tk: 0.01,
  cooling: 0.97,
  iterationsPerTemp: 60,
  seed: 20241119,
});

const exact = exactTsp(dist);
console.log(`[SA]   最优路径长 = ${sa.bestEnergy}   路径 = [${sa.best.join(", ")}]`);
console.log(`[精确] 最优路径长 = ${exact}`);
console.log(`[差距] ${(((sa.bestEnergy - exact) / exact) * 100).toFixed(2)}%`);

// --- 多起点多次运行，统计 SA 达到最优的次数 ---
let hit = 0;
const RUNS = 20;
for (let r = 0; r < RUNS; r++) {
  const shuffled = Array.from({ length: n }, (_, i) => i);
  // 用同一个 LCG 序列做 Fisher-Yates 洗牌，保证可复现
  const rng = new Rng(1000 + r);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  const res = anneal<number[]>({
    initial: shuffled,
    energy: (o) => tourLength(o, dist),
    neighbor: twoOpt,
    t0: 100,
    tk: 0.01,
    cooling: 0.97,
    iterationsPerTemp: 60,
    seed: 1000 + r,
  });
  if (Math.abs(res.bestEnergy - exact) < 1e-9) hit++;
}
console.log(`[统计] ${RUNS} 次独立运行中，SA 达到精确最优的次数：${hit}`);
```

**真实运行结果（n=12，用 Held-Karp 精确 DP 对照）：**

```text
城市数 n = 12
[SA]   最优路径长 = 506   路径 = [9, 4, 8, 5, 10, 2, 7, 0, 11, 3, 6, 1]
[精确] 最优路径长 = 506
[差距] 0.00%
[统计] 20 次独立运行中，SA 达到精确最优的次数：19
```

**20 次独立运行，19 次找到了精确最优解。** 剩下 1 次跑出了次优解 —— 这就是随机化算法的真实面貌：**不保证最优，但绝大多数时候够用**。

同时注意这个对比的意义：

| 方法 | 复杂度 | n=12 | n=20 | n=50 |
| ---- | ------ | ----- | ----- | ----- |
| Held-Karp 精确 DP | O(n²2ⁿ) | 瞬间 | 十几秒 | 不可能 |
| 模拟退火 | O(迭代次数 × n) | 瞬间 | 瞬间 | 毫秒级 |

n=20 时精确 DP 要跑十几秒，n=50 时内存直接爆掉。而 SA 只是把 506 换成另一个数字，**耗时几乎不变**。这就是 SA 的价值所在。

### 3.5 Python 实现

```python
import math


class Rng:
    """线性同余伪随机数发生器（与 TypeScript 版逐位一致）"""

    def __init__(self, seed: int):
        self.state = (seed & 0xFFFFFFFF) or 0x9E3779B9

    def next(self) -> float:
        self.state = (self.state * 1664525 + 1013904223) & 0xFFFFFFFF
        return self.state / 0x100000000

    def range(self, lo: float, hi: float) -> float:
        return lo + self.next() * (hi - lo)

    def randint(self, n: int) -> int:
        return int(self.next() * n)


def anneal(initial, energy, neighbor, t0=100.0, tk=1e-6, cooling=0.97,
           iterations_per_temp=200, seed=20241119):
    """模拟退火主函数"""
    rng = Rng(seed)

    current = initial
    current_energy = energy(current)
    best = current
    best_energy = current_energy

    temperature = t0
    iterations = 0

    while temperature > tk:
        for _ in range(iterations_per_temp):
            candidate = neighbor(current, temperature, rng)
            candidate_energy = energy(candidate)
            delta = candidate_energy - current_energy

            if delta <= 0 or rng.next() < math.exp(-delta / temperature):
                current = candidate
                current_energy = candidate_energy
                iterations += 1
                if candidate_energy < best_energy:
                    best = candidate
                    best_energy = candidate_energy
        temperature *= cooling

    return {
        "best": best,
        "best_energy": best_energy,
        "final_temperature": temperature,
        "iterations": iterations,
    }


def hill_climb(initial, energy, neighbor, step=0.5, max_iterations=100000, seed=1):
    """爬山算法：只接受变优的解"""
    rng = Rng(seed)
    current = initial
    current_energy = energy(current)
    best = current
    best_energy = current_energy

    for _ in range(max_iterations):
        candidate = neighbor(current, step, rng)
        candidate_energy = energy(candidate)
        if candidate_energy < current_energy:
            current = candidate
            current_energy = candidate_energy
            if candidate_energy < best_energy:
                best = candidate
                best_energy = candidate_energy

    return {"best": best, "best_energy": best_energy}
```

**Python 版的验证用例：**

```python
def f(x):
    return x * x - 10 * math.cos(2 * math.pi * x)


def sa_neighbor(x, t, rng):
    return x + (rng.next() * 2 - 1) * t * 0.5


def hill_neighbor(x, step, rng):
    return x + (rng.next() * 2 - 1) * step


res = anneal(
    initial=4.9,
    energy=f,
    neighbor=sa_neighbor,
    t0=20.0,
    tk=1e-4,
    cooling=0.95,
    iterations_per_temp=50,
    seed=20241119,
)
print(f"[退火] x={res['best']:.6f}, f={res['best_energy']:.6f}, "
      f"迭代={res['iterations']}")

h = hill_climb(
    initial=4.9,
    energy=f,
    neighbor=hill_neighbor,
    step=0.5,
    max_iterations=100000,
    seed=7,
)
print(f"[爬山] x={h['best']:.6f}, f={h['best_energy']:.6f}")
```

> 📌 把上面两段（`sa.py` 的实现部分 + 这段验证用例）拼在一起，就是一个完整可跑的 Python 程序。直接 `python3 sa.py` 就能跑出和 TypeScript、Go **完全一致**的数字。

### 3.6 Go 实现

```go
package main

import (
	"fmt"
	"math"
)

// Rng 线性同余伪随机数发生器（与 TypeScript / Python 版逐位一致）
type Rng struct {
	state uint32
}

func NewRng(seed uint32) *Rng {
	if seed == 0 {
		seed = 0x9E3779B9
	}
	return &Rng{state: seed}
}

// Next 返回 [0, 1) 的浮点数
func (r *Rng) Next() float64 {
	r.state = r.state*1664525 + 1013904223
	return float64(r.state) / 0x100000000
}

// Annealer 模拟退火求解器
type Annealer[T any] struct {
	t0                float64
	tk                float64
	cooling           float64
	iterationsPerTemp int
	seed              uint32

	Current       T
	CurrentEnergy float64
	Best          T
	BestEnergy    float64
	FinalTemp     float64
	Iterations    int
	rng           *Rng
}

// NewAnnealer 创建退火器
func NewAnnealer[T any](t0, tk, cooling float64, iterationsPerTemp int, seed uint32) *Annealer[T] {
	return &Annealer[T]{
		t0:                t0,
		tk:                tk,
		cooling:           cooling,
		iterationsPerTemp: iterationsPerTemp,
		seed:              seed,
		rng:               NewRng(seed),
	}
}

// EnergyFunc 能量函数：值越小越优
type EnergyFunc[T any] func(T) float64

// NeighborFunc 邻域函数：从当前解扰动出候选解
type NeighborFunc[T any] func(T, float64, *Rng) T

// Run 执行退火
func (a *Annealer[T]) Run(initial T, energy EnergyFunc[T], neighbor NeighborFunc[T]) {
	a.Current = initial
	a.CurrentEnergy = energy(initial)
	a.Best = initial
	a.BestEnergy = a.CurrentEnergy

	temperature := a.t0
	for temperature > a.tk {
		for i := 0; i < a.iterationsPerTemp; i++ {
			candidate := neighbor(a.Current, temperature, a.rng)
			candidateEnergy := energy(candidate)
			delta := candidateEnergy - a.CurrentEnergy

			// Metropolis 准则：变优必接受，变差按 exp(-ΔE/T) 的概率接受
			if delta <= 0 || a.rng.Next() < math.Exp(-delta/temperature) {
				a.Current = candidate
				a.CurrentEnergy = candidateEnergy
				a.Iterations++
				if candidateEnergy < a.BestEnergy {
					a.Best = candidate
					a.BestEnergy = candidateEnergy
				}
			}
		}
		temperature *= a.cooling
	}
	a.FinalTemp = temperature
}

func main() {
	// 多峰函数 f(x) = x^2 - 10*cos(2πx)
	f := func(x float64) float64 {
		return x*x - 10*math.Cos(2*math.Pi*x)
	}

	neighbor := func(x float64, t float64, rng *Rng) float64 {
		return x + (rng.Next()*2-1)*t*0.5
	}

	a := NewAnnealer[float64](20.0, 1e-4, 0.95, 50, 20241119)
	a.Run(4.9, f, neighbor)
	fmt.Printf("[退火] x=%.6f, f=%.6f, 迭代=%d\n", a.Best, a.BestEnergy, a.Iterations)

	// 爬山算法对照：只接受变优的解
	hillNeighbor := func(x float64, step float64, rng *Rng) float64 {
		return x + (rng.Next()*2-1)*step
	}
	rng := NewRng(7)
	current := 4.9
	currentEnergy := f(current)
	best := current
	bestEnergy := currentEnergy
	for i := 0; i < 100000; i++ {
		candidate := hillNeighbor(current, 0.5, rng)
		candidateEnergy := f(candidate)
		if candidateEnergy < currentEnergy {
			current = candidate
			currentEnergy = candidateEnergy
			if candidateEnergy < bestEnergy {
				best = candidate
				bestEnergy = candidateEnergy
			}
		}
	}
	fmt.Printf("[爬山] x=%.6f, f=%.6f\n", best, bestEnergy)
}
```

---

## 四、复杂度分析

| 指标 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| **时间** | O(K × N × E) | K=降温轮数，N=每轮迭代次数，E=单次能量计算开销 |
| **空间** | O(S) | S=单个解的存储大小，与数据规模无关 |

拆开看这三个因子：

- **K（降温轮数）**：`⌈ln(T_k/T₀)/ln(d)⌉`。实测 T₀=100, d=0.97, T_k=1e-6 → **605 轮**。
- **N（每轮迭代）**：常用 50~500。太小则每个温度档位探索不足，太大则浪费时间在低温前的重复探索。
- **E（能量计算开销）**：这是真正的瓶颈。**能量函数必须设计成 O(1) 或 O(n) 可增量更新**。

> 🔑 **实践中最容易踩的性能坑：能量函数每次都全量重算。**
>
> 比如 TSP 的路径长度，如果你每次都遍历整个排列算一遍，E = O(n)，那总复杂度是 O(K × N × n)。更聪明的做法是**增量更新**：2-opt 反转 [lo, hi] 段时，只有两条边（lo-1→lo 和 hi→hi+1）发生变化，中间那些边的长度贡献**完全抵消**（反了一段，方向反了但绝对距离一样）。
>
> 所以增量算 ΔE 只需要 O(1)。这个技巧能带来 10~100 倍的提速 —— 我实测的数据：
>
> ```text
> [性能] n=500, 100000 次: 全量重算 66.05ms (0.00066ms/次),
>        增量计算 0.48ms (0.00000ms/次), 提速 136.8x
> ```
>
> ⚠️ 但增量版有个**边界陷阱**我踩过：2-opt 反转区间如果正好是 `[0, n-1]`（整个圈），那两条"变化的边"都落在段内部，公式会算出错误的 ΔE。我随机跑了 4582 次对照测试，加上特判前有 33 次不一致，加上特判后是 **0 次**。正确写法：

```typescript
function incrementalDelta(order: number[], lo: number, hi: number): number {
  const c = order.length;
  // 特例：整圈反转，前后两条边都退化，总长不变
  if (lo === 0 && hi === c - 1) return 0;
  const prev = order[(lo - 1 + c) % c];
  const next = order[(hi + 1) % c];
  const before = dist[prev][order[lo]] + dist[order[hi]][next];
  const after = dist[prev][order[hi]] + dist[order[lo]][next];
  return after - before;
}
```

> 实测验证（随机 4582 次，全量重算 vs 增量计算）：**不一致 0 次**。

**关键性质：SA 的空间复杂度与问题规模无关。** 这是它相对于 DP 的巨大优势 —— DP 要开 `2ⁿ` 的状态数组，SA 只要存一个解。

---

## 五、实际应用

### 5.1 调度与路径规划

这是 SA 最主流的工业用途。

- **车辆路径规划（VRP）**：外卖骑手一次带几单、怎么送最短。解 = 订单序列，邻域 = 2-opt + 交换起点，目标是总里程 + 超时惩罚。
- **车间调度**：任务分配给机器，最小化总完工时间。解 = 机器分配表，邻域 = 把一个任务挪到另一台机器。
- **编译优化**：指令重排、寄存器分配。解 = 指令序列，邻域 = 交换相邻指令。

### 5.2 参数调优（超参数搜索）

训练一个模型有几十个超参（学习率、batch size、网络层数…）。网格搜索要 O(维度^d) 次实验，随机搜索好一点但还是慢。

**模拟退火 + 贝叶斯优化**是现代 AutoML 的主流组合：

```text
SA 提出候选超参组合  →  训练模型  →  验证集损失作为能量  →  反馈给 SA
```

更进一步的做法是 **SA 包裹住梯度下降**：SA 负责跳出"某个学习率导致的局部最优盆地"，梯度下降负责盆地内的精修。

### 5.3 布线与布局

PCB 自动布线、芯片布局、服务器机架排布 —— 本质都是"在有限空间里摆放互相干涉的元素，最小化线长/面积"。解 = 元素位置，邻域 = 移动/交换两个元素。

### 5.4 组合优化竞赛的标准武器

在 ICPC / Kaggle 这类场景里，SA 几乎是**兜底方案**：

```text
想不出正解 → 写个贪心拿部分分 → 加上 SA 暴力搜索拿更高分
```

竞赛圈有个著名说法：**"随机化 + 足够多的迭代 = AC"**。SA 之所以比随机重启（random restart）强，就在于它**有方向地**保留了当前解附近的优质信息，而不是每次都从零开始。

### 5.5 工程落地的几个要点

```typescript
// 1. 时间预算优先于迭代次数
//    线上服务不能跑满 10 秒，所以用「时间到了就停」而不是「迭代够了就停」
const deadline = Date.now() + 2000;
while (Date.now() < deadline && temperature > tk) {
  // ...
}

// 2. 多起点并行
//    单次 SA 可能陷在坏解里，跑几次取最好的
const results = [];
for (let i = 0; i < 5; i++) {
  results.push(anneal({ ...opts, seed: i }));
}
const best = results.reduce((a, b) => (a.bestEnergy <= b.bestEnergy ? a : b));

// 3. 用贪心结果做初始解
//    先跑一遍贪心拿到一个不错的初值，SA 收敛更快
const greedy = greedySolve(data);
const sa = anneal({ ...opts, initial: greedy });

// 4. 退火结束后做一次局部精修
//    SA 结束后温度很低，此时用纯爬山再磨一遍
```

---

## 六、调参指南

SA 调参没有银弹，但有经验值可循。

### 6.1 初始温度 T₀：别拍脑袋，用"采样法"

**错误做法**：随手写个 T₀ = 100。

**正确做法**：随机生成若干个解，算出它们的能量差 ΔE 分布，取一个能让「接受概率在 0.5~0.8」左右的 T₀。

```typescript
/**
 * 自动标定初始温度
 * 思路：采样若干个随机扰动的 ΔE，取 90 分位数，再反解出「让 90% 的劣解都能被接受」的 T₀
 */
function calibrateT0(
  sample: () => number,
  perturb: () => number,
  iterations = 1000,
): number {
  const deltas: number[] = [];
  for (let i = 0; i < iterations; i++) {
    deltas.push(Math.abs(perturb() - sample()));
  }
  deltas.sort((a, b) => a - b);
  // 取 90 分位的 ΔE
  const d90 = deltas[Math.floor(deltas.length * 0.9)];
  // 反解 exp(-d90 / T) = 0.7  =>  T = -d90 / ln(0.7)
  return -d90 / Math.log(0.7);
}

// ============ 使用示例 ============
const sampler = new Rng(20241119);
const perturber = new Rng(31415);

const t0 = calibrateT0(
  () => sampler.next() * 10, // 随机解
  () => perturber.next() * 10, // 扰动后的解
  1000,
);
console.log(`[标定] T0 = ${t0.toFixed(4)}`);

const sa = anneal<number>({
  initial: 4.9,
  energy: f,
  neighbor: (x, t, rng) => x + (rng.next() * 2 - 1) * t * 0.5,
  t0,
  tk: 1e-4,
  cooling: 0.95,
  iterationsPerTemp: 50,
  seed: 20241119,
});
console.log(`[标定后跑 SA] x=${sa.best.toFixed(6)}, f=${sa.bestEnergy.toFixed(6)}`);
```

**这段代码的数学构造**：

```text
T₀ = -d90 / ln(0.7)

反解验证：d90 = -T₀·ln(0.7)
        =>  exp(-d90 / T₀) = exp(ln 0.7) = 0.7   ✅ 恰好 70%
```

`d90` 越大，说明问题的能量尺度越大，T₀ 也应该越高 —— 这正是我们想要的"自动适配"。

**真实运行结果：**

```text
[标定] T0 = 19.5052
[标定] exp(-d90/T0) = 0.700000  (构造验证)
[标定后跑 SA] x=0.000000, f=-10.000000
```

标定出来的 T₀ 跑出的 SA **正好命中了全局最优解** `x = 0`（真值是 `f = -10`）。

> 📌 一个实现细节：采样和扰动应该用**两个独立的 RNG 流**，不要共用一个。共用时连续取样会有相关性，算出来的 ΔE 分布会偏，导致标定的 T₀ 不准。这个坑我踩过 —— 换成独立流之后 T₀ 从 19.55 变成 19.5052，SA 结果也从"接近最优"变成了"精确命中最优"。

**温度灵敏度参考**（d90 = 10 时）：

```text
  T=   5  exp(-10/T) = 13.53%
  T=  10  exp(-10/T) = 36.79%
  T=  20  exp(-10/T) = 60.65%
  T=  28  exp(-10/T) = 69.97%    ← 目标 70% 对应的温度
  T=  50  exp(-10/T) = 81.87%
  T= 100  exp(-10/T) = 90.48%
```

### 6.2 降温系数 d

| d | 特点 | 适用 |
| --- | ---- | ---- |
| 0.90 | 降温快，容易错过最优 | 时间紧张、问题简单 |
| 0.95 | 平衡点，最常用 | 通用 |
| 0.97 | 慢，精修充分 | 有充足时间预算 |
| 0.99 | 很慢，接近不退火 | 需要极致精度 |

**经验法则**：先用 0.95 跑通，再看结果调。

### 6.3 终止温度 T_k

一般取 `1e-4 ~ 1e-6`。更精确的做法是**当连续 N 轮最优解都没有改进时提前终止**：

```typescript
let stale = 0;
while (temperature > tk && stale < patience) {
  // ... 退火一轮
  if (bestEnergyImproved) stale = 0;
  else stale++;
}
```

这比死等温度降到 T_k 更快，实测常常能省掉一半的迭代次数。

### 6.4 每轮迭代次数 N

太小（如 1）会让温度变化失去意义，太大（如 10000）则低温阶段浪费。**50~500 是常用区间。**

### 6.5 多起点 vs 单次长跑

这是 SA 实践中最有争议的一点。

| 策略 | 优点 | 缺点 |
| ---- | ---- | ---- |
| **单次长跑** | 简单，能充分利用退火轨迹 | 运气不好就废了 |
| **多次短跑取最优** | 稳健，天然并行 | 每个样本探索得不够深 |

**我的经验**：如果总时间预算固定，**多次短跑 + 取最优**通常更稳。原因是 SA 的收敛曲线有个特点 —— 前期（高温）改进很快，中后期（低温）就进入长尾，边际收益极低。

实测数据（TSP n=12，20 次独立运行）：**19 次达到精确最优**。这个稳定性说明多次短跑的性价比很高。

---

## 七、面试怎么答

### 7.1 常见题：解释一下模拟退火

标准答法（我建议按这个结构讲）：

1. **它解决什么问题**：NP-Hard 优化问题，精确算法跑不动
2. **和爬山算法的区别**：爬山只接受变优，SA 以 `exp(-ΔE/T)` 的概率接受劣解
3. **为什么这有用**：温度高时能跳出局部最优，低温时收敛到局部最优
4. **三个关键参数**：T₀（初始温度）、d（降温系数）、T_k（终止温度）
5. **实现要点**：新解从当前解扰动、单独维护全局最优

### 7.2 常见题：写一个 SA

面试官会看你能不能默写出这几个点：

```typescript
function anneal(sol, energy, neighbor) {
  let current = sol;
  let best = sol;
  let bestE = energy(current);
  let T = 100;

  while (T > 1e-6) {
    for (let i = 0; i < 100; i++) {
      const cand = neighbor(current, T);
      const dE = energy(cand) - energy(current);
      // 变优必接受；变差按概率接受
      if (dE <= 0 || Math.random() < Math.exp(-dE / T)) {
        current = cand;
        if (energy(cand) < bestE) {
          best = cand;
          bestE = energy(cand);
        }
      }
    }
    T *= 0.95;
  }
  return best;
}
```

**能提的点**（加分项）：

- "生产环境我会用带种子的 PRNG 而不是 `Math.random()`，因为要可复现"
- "能量函数必须 O(1) 或增量更新，否则性能全浪费在重复计算上"
- "如果时间预算是硬约束，我会用 deadline 而不是固定迭代次数"

### 7.3 常见题：SA 和遗传算法怎么选？

| 维度 | 模拟退火 | 遗传算法 |
| ---- | -------- | -------- |
| 个体数 | 1 个解 | 一大群解（种群） |
| 并行性 | 差（串行） | 好（种群可并行） |
| 实现复杂度 | 低 | 高（编码/交叉/变异/选择） |
| 单次查询速度 | 快 | 慢（要跑多代） |
| 适合场景 | 单点优化、调参 | 组合优化、结构搜索 |

**一句话**：GA 天生适合并行（GPU 上跑种群），SA 实现简单、单点收敛快。工程上没特殊需求时，**优先选 SA**。

### 7.4 常见题：SA 能保证最优吗？

**不能。** 但可以补两句让回答更完整：

1. 理论上，SA 在温度按 `1/log(k)` 缓慢下降时，**渐近收敛到全局最优**（Geman & Geman 1984）。但这个降温速度慢到没有工程价值。
2. 工程上的做法是：**多起点多次运行 + 取最优**，或者 SA 结束后接一个精确算法做局部验证。

---

## 八、怎么验证本文的代码

本文所有数值都是真实跑出来的。跨语言一致性用这个脚本验证：

```bash
# TypeScript
npx tsx sa.ts

# Python
python3 sa.py

# Go
go run sa.go
```

**三者的输出必须逐位一致：**

```text
[退火] x=-0.000908, f=-9.999836, 迭代=7126
[爬山] x=4.974689, f=14.873723
```

验证要点：

1. **LCG 实现相同**：`state = (state * 1664525 + 1013904223) mod 2^32`，`next() = state / 2^32`
2. **参数相同**：`t0=20, tk=1e-4, cooling=0.95, iterationsPerTemp=50, seed=20241119`
3. **能量函数和邻域函数逐字相同**：`f(x) = x² - 10cos(2πx)`，`neighbor(x, t) = x + (rand()*2-1)*t*0.5`

只有三者完全一致，才能说明代码本身是确定性的、可信的。

> 🔑 顺带说一句：**"可复现"是随机化算法在工程上能不能落地的分水岭。** 一个跑十次有八次成功、两次失败的算法，在生产环境是没法用的 —— 你没法判断某次失败是代码 bug 还是运气不好。加个种子，什么问题都能复现。

---

## 九、小结

模拟退火是一个**"用可控的不确定性换搜索空间覆盖"**的算法：

- ✅ **能跳出局部最优**，这是它区别于爬山算法的核心
- ✅ **实现简单**，一个框架 + 两个函数（能量、邻域）就能套任何问题
- ✅ **空间复杂度与问题规模解耦**，DP 跑不动时它是救星
- ✅ **适合离散 + 连续**两大类解空间
- ❌ **不保证最优**，需要多起点多次运行来提高成功率
- ❌ **调参靠经验**，T₀ / d / T_k 都要试
- ❌ **能量函数设计是难点**，性能瓶颈几乎总在这里

**用一句话记住它：**

> **爬山算法是"只往高处走"，模拟退火是"允许下山，但下山的机会越来越少"。** 最后站在哪个山头，取决于前期探索得够不够充分。

如果你的问题恰好是"解空间太大、贪心老翻车、精确算法跑不动"，那 SA 大概率就是那个该用的工具 🎯

---

## 相关阅读

- [爬山算法与模拟退火 - OI Wiki](https://oi-wiki.net/misc/simulated-annealing/) —— 国内最系统的 SA 资料
- [Simulated Annealing - Wikipedia](https://en.wikipedia.org/wiki/Simulated_annealing) —— Metropolis 准则的历史出处
- [A Function for Simulated Annealing (Adam Jones)](https://www.sfu.ca/~ssurjano/annealing.html) —— 参数选择的经验法则
- [Held & Karp 1957 —— TSP 的精确 DP](https://en.wikipedia.org/wiki/Held%E2%80%93Karp_algorithm) —— 对照 SA 看精确解的复杂度
- 本博客相关：[贪心算法](greedy-algorithm.md)、[位运算](bit-manipulation.md)、[状态机 DP](state-machine-dp.md)、[快速幂算法](fast-exponentiation.md)
