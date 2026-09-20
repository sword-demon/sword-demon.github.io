---
title: 快速幂算法
description: 快速幂（Binary Exponentiation）—— 用 O(log n) 计算 x^n，含矩阵快速幂与模运算应用
date: 2026-09-20 09:01:25
categories:
  - Algorithm
tags:
  - fast-exponentiation
  - math
  - recursion
  - bit-manipulation
sidebarSort: 85
---

# 快速幂算法（Binary Exponentiation）

面试官抛过来一道题："实现一个函数，计算 x 的 n 次幂。"

你心想：这不简单？写个循环累乘不就完了：

```typescript
function pow(x: number, n: number): number {
  let result = 1;
  for (let i = 0; i < n; i++) {
    result *= x;
  }
  return result;
}
```

看起来没毛病，对吧？但面试官微微一笑："如果 n 是 10 亿呢？"

这时候你才意识到——**O(n) 的暴力乘压根就不行**。10 亿次乘法要算多久先不说，JavaScript 里 Number 精度根本撑不住，连结果都算不对。

这就是 **快速幂（Binary Exponentiation）** 出场的时刻。它用**二进制拆分**的思路，把计算 x^n 的复杂度从 O(n) 降到 **O(log n)**。n = 10 亿？只要 30 次乘法就算完了 ✨。

## 原理拆解

### 朴素方法为什么慢？

暴力乘法的本质是：把 n 个 x 一个个乘起来。问题是 n 越大，步骤越多，且和指数线性相关。

但你有没有想过：**乘法其实可以"跳着算"**？

### 核心直觉：二进制拆分

指数 n 用二进制表示，比如 13 = 1101₂。

```
13 = 1×2³ + 1×2² + 0×2¹ + 1×2⁰
    = 8 + 4 + 0 + 1
```

那 x^13 就可以拆成：

```
x^13 = x^(8+4+1)
     = x^8 × x^4 × x^1
```

关键洞察来了：**x^8 可以由 x^4 自乘得到，x^4 可以由 x^2 自乘得到，x^2 可以由 x 自乘得到**。也就是说，我们只需要知道 x^1、x^2、x^4、x^8……这 log₂(n) 项，就可以通过查表+相乘算出结果。

**每一步都"翻倍"，指数从 1 → 2 → 4 → 8 → 16……只需要 log n 步就能覆盖到 x^n。**

### 图示过程

```
计算 x^13：

指数 n:  13 = 1101₂ (二进制)
           ↓    ↓    ↓
对应位:    1    1    0    1

从最低位开始处理每一位：

第1位（bit=1, 当前项=x^1=2）：
  result = 1 × 2 = 2
  当前项自乘：x^1 → x^2 = 4

第2位（bit=0, 当前项=x^2=4）：
  bit=0, result 不变 = 2
  当前项自乘：x^2 → x^4 = 16

第3位（bit=1, 当前项=x^4=16）：
  result = 2 × 16 = 32
  当前项自乘：x^4 → x^8 = 256

第4位（bit=1, 当前项=x^8=256）：
  result = 32 × 256 = 8192
  当前项自乘：x^8 → x^16

最终 result = 8192 = 2^13 ✅
```

注意看：**每一轮"当前项"都自乘翻倍**，而 result 只在对应 bit 位为 1 时才乘进去。

### 递归视角：分而治之

从另一个角度看，x^n 可以拆成两个规模减半的子问题：

```
x^n = x^(n/2) × x^(n/2)            （n 为偶数）
x^n = x^((n-1)/2) × x^((n-1)/2) × x   （n 为奇数）
```

这不就是**递归分治**嘛！把 n 一路除以 2 直到变成 1，递归深度只有 log n。

```
pow(2, 13)
├── pow(2, 6) × pow(2, 6) × 2  ← 奇数，需要多乘一个 x
│   ├── pow(2, 3) × pow(2, 3)
│   │   ├── pow(2, 1) × pow(2, 1) × 2
│   │   └── pow(2, 1) × pow(2, 1) × 2
│   └── pow(2, 3) × pow(2, 3)
└── pow(2, 6) × pow(2, 6) × 2

递归深度：log₂(13) ≈ 4 层
总计算量：O(log n) 次乘法
```

两种视角（迭代 / 递归）本质上是同一回事，下面都会给出代码。

### 数学正确性

为什么 x^(n/2) × x^(n/2) = x^n？因为指数相加等于底数相乘：

```
x^a × x^b = x^(a+b)
```

所以当 n 是偶数时，n = n/2 + n/2，自然就成立。奇数时多出来一个 x，单独乘上去就行。

## 代码实现

### TypeScript 迭代版（推荐）

迭代版是面试中最常见的写法，思路对应上面的"二进制拆分"。

```typescript
/**
 * 快速幂 —— TypeScript 迭代版
 * 时间复杂度：O(log n)
 * 空间复杂度：O(1)
 */
function myPow(x: number, n: number): number {
  // 处理 n 为负数的情况：x^(-n) = 1 / x^n
  // 同时把 n 转成正数，用 Long 类型避免溢出
  let exp = n;
  if (exp < 0) {
    x = 1 / x;
    exp = -exp;
  }

  let result = 1;

  // 循环直到 exp 变成 0
  while (exp > 0) {
    // 当前最低位是 1 吗？是的话就乘进去
    if (exp & 1) {
      result *= x;
    }
    // 当前项自乘翻倍：x → x² → x⁴ → x⁸ ...
    x *= x;
    // 指数右移一位（等价于除以 2 取整）
    exp >>>= 1; // 无符号右移，避免负数问题
  }

  return result;
}

// 测试
console.log(myPow(2, 10));    // 1024
console.log(myPow(2, -2));    // 0.25
console.log(myPow(2, 0));     // 1
console.log(myPow(0.00001, 2147483647)); // 极小精度但能在 O(log n) 内算完
```

几个关键点解释一下：

1. **`exp & 1`** —— 取当前最低位。这比 `exp % 2 === 1` 略快，是位运算的经典用法。
2. **`x *= x`** —— 当前项每次循环都翻倍，正好对应二进制位权重的递增。
3. **`exp >>>= 1`** —— 无符号右移。如果用 `exp >>= 1`（有符号），对负数会有问题；用无符号更安全。
4. **负数处理** —— x^(-n) = 1/x^n，先把 x 取倒数、把 n 取反即可。

### TypeScript 递归版

递归版代码更短，更能体现"分治"思想。

```typescript
/**
 * 快速幂 —— TypeScript 递归版
 */
function myPowRecursive(x: number, n: number): number {
  if (n === 0) return 1;
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }

  // n 是奇数：x^n = x^((n-1)/2) × x^((n-1)/2) × x
  // n 是偶数：x^n = x^(n/2) × x^(n/2)
  if (n % 2 === 1) {
    const half = myPowRecursive(x, (n - 1) / 2);
    return half * half * x;
  } else {
    const half = myPowRecursive(x, n / 2);
    return half * half;
  }
}
```

**递归版要注意的坑**：

- 递归深度 = log₂(n)，n 最大约 2³¹ ≈ 21 亿 → 递归深度最多 31 层，远低于 JavaScript 默认栈深度（几千层），所以是安全的。
- 整数除法要小心。在 JS 里，`(n - 1) / 2` 当 n = 奇数时一定是整数，但如果写成 `(n - 1) >> 1`（位运算）会更快。也可以传 Math.floor 兜底。

### Python 版

```python
def my_pow(x: float, n: int) -> float:
    """
    快速幂 —— Python 递归版
    时间复杂度：O(log n)
    """
    if n == 0:
        return 1.0
    if n < 0:
        x = 1 / x
        n = -n

    if n % 2 == 1:
        half = my_pow(x, (n - 1) // 2)
        return half * half * x
    else:
        half = my_pow(x, n // 2)
        return half * half


# 迭代版
def my_pow_iter(x: float, n: int) -> float:
    if n < 0:
        x = 1 / x
        n = -n

    result = 1.0
    while n > 0:
        if n & 1:
            result *= x
        x *= x
        n >>= 1
    return result


# 测试
print(my_pow(2.0, 10))        # 1024.0
print(my_pow_iter(2.0, -2))   # 0.25
```

## 复杂度分析

| 维度 | 朴素乘法 | 快速幂 |
|------|----------|--------|
| 时间复杂度 | O(n) | O(log n) |
| 空间复杂度 | O(1) | O(1) 迭代 / O(log n) 递归 |
| n = 10⁹ 时乘法次数 | 10⁹ 次 | ~30 次 |

**为什么是 O(log n)？**

循环（或递归）每执行一次，指数 n 就除以 2（`exp >>>= 1` 或 `n / 2`）。从 n 到 1 的过程中，n 减半的次数就是 log₂(n)。所以无论 n 是 1000 还是 10 亿，最多只要 ~30 次循环。

**递归版为什么空间是 O(log n)？**

因为递归调用栈的深度是 log n，每一层保存一份局部变量（x、n、half）。

## 实际应用

快速幂远不止"算 x 的 n 次方"这么简单。下面三个应用场景，都是面试和工程中的常客。

### 应用 1：矩阵快速幂 —— 让 Fibonacci 达到 O(log n)

Fibonacci 大家都知道：F(n) = F(n-1) + F(n-2)。如果直接递归算，F(100) 就要算半天。但用**矩阵快速幂**，F(10¹⁸) 都能秒算 ✨。

核心观察：Fibonacci 可以写成矩阵形式：

```
[ F(n)   ]   [ 1 1 ]^n-1   [ F(1) ]
[ F(n-1) ] = [ 1 0 ]      × [ F(0) ]
```

也就是说：

```
[F(n), F(n-1)]ᵀ = M^(n-1) × [F(1), F(0)]ᵀ
其中 M = [[1,1],[1,0]]
```

那矩阵的 n 次方怎么算？—— **快速幂**！把 n 用二进制拆分，O(log n) 次矩阵乘法搞定。

```typescript
/**
 * 矩阵快速幂 —— 求 Fibonacci 第 n 项
 * 时间复杂度：O(log n)（矩阵乘法本身是 O(1)，因为是 2×2）
 */
type Matrix2x2 = [[number, number], [number, number]];

function multiply(A: Matrix2x2, B: Matrix2x2): Matrix2x2 {
  return [
    [
      A[0][0] * B[0][0] + A[0][1] * B[1][0],
      A[0][0] * B[0][1] + A[0][1] * B[1][1],
    ],
    [
      A[1][0] * B[0][0] + A[1][1] * B[1][0],
      A[1][0] * B[0][1] + A[1][1] * B[1][1],
    ],
  ];
}

function matrixPow(M: Matrix2x2, n: number): Matrix2x2 {
  // 单位矩阵：任何矩阵 × I = 自身
  let result: Matrix2x2 = [[1, 0], [0, 1]];
  let base = M;

  while (n > 0) {
    if (n & 1) {
      result = multiply(result, base);
    }
    base = multiply(base, base);
    n >>>= 1;
  }

  return result;
}

function fib(n: number): number {
  if (n <= 1) return n;
  // M^(n-1) × [F(1), F(0)]ᵀ = [F(n), F(n-1)]ᵀ
  const M: Matrix2x2 = [[1, 1], [1, 0]];
  const result = matrixPow(M, n - 1);
  return result[0][0]; // F(n)
}

// 测试
console.log(fib(10));     // 55
console.log(fib(50));     // 12586269025
console.log(fib(1000));   // 很大的数，但 O(log n) 算完
```

**为什么这很牛？** 普通递归 fib(100) 要算很久（哪怕记忆化也要 O(n)），而矩阵快速幂只要 O(log n) 次矩阵乘法。fib(10¹⁸) 也是秒出。

### 应用 2：模幂运算 —— RSA 加密的基石

RSA 是最常用的非对称加密算法，核心运算就是：

```
c = m^e mod n    （加密）
m = c^d mod n    （解密）
```

其中 m、c、e、d、n 都是几百到几千位的**大整数**。直接算 m^e 再取模？数大到连表示都表示不了，更别说算了。

但用**模快速幂**，每次乘法后立刻取模，问题就解决了：

```typescript
/**
 * 模快速幂（用于大数模幂运算）
 * 关键技巧：每次乘法后立刻 % mod，避免溢出
 */
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod; // 先取模一次

  while (exp > 0n) {
    if (exp & 1n) {
      result = (result * base) % mod;
    }
    base = (base * base) % mod;
    exp >>= 1n;
  }

  return result;
}

// 测试：2^10 mod 1000
console.log(modPow(2n, 10n, 1000n)); // 24n
// 因为 2^10 = 1024, 1024 % 1000 = 24

// RSA 中常见的超大数据
const m = 12345678901234567890n;
const e = 65537n;
const n = 98765432109876543219n;
const encrypted = modPow(m, e, n);
console.log(encrypted);
```

为什么 JS 整数不够用？因为 JS 的 Number 只有 53 位精度，超过就丢精度。`bigint` 才是大数运算的正确选择——Python 原生支持，Go 有 math/big，Rust 有 num-bigint。

### 应用 3：LeetCode 高频题

#### 例题 1：Pow(x, n)（LeetCode 50）

就是上面的 `myPow`，直接套用即可。

#### 例题 2：超级次方（LeetCode 372）

"计算 a^b mod 1337，其中 b 是一个非常大的正整数，以数组形式给出。"

比如 a=2, b=[1,2,3,4] 实际就是算 2^1234 mod 1337。

关键公式：

```
a^(b[k-1]...b[1]b[0]) = (a^b[0]) × ((a^10)^(b[1]...b[0])) mod 1337
                       = (a^b[0]) × ((a^10)^(下一轮递归)) mod 1337
```

```typescript
const MOD = 1337;

function superPow(a: number, b: number[]): number {
  if (b.length === 0) return 1;

  // 取出最低位
  const last = b.pop()!;

  // a^last * (a^10)^(剩下的部分) mod 1337
  const part1 = modPowInt(a, last, MOD);
  const part2 = modPowInt(superPow(a, b) % MOD, 10, MOD);

  return (part1 * part2) % MOD;
}

function modPowInt(base: number, exp: number, mod: number): number {
  let result = 1;
  base %= mod;
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>>= 1;
  }
  return result;
}
```

#### 例题 3：Count Good Numbers（LeetCode 1922）

"长度为 n 的数字字符串，每位是偶数（0/2/4/6/8）或质数（2/3/5/7），求合法个数 mod 10⁹+7。"

偶数位 5 种，质数位 4 种。长度 n 中，偶数位有 ⌈n/2⌉ 个，质数位有 ⌊n/2⌋ 个。

答案 = 5^⌈n/2⌉ × 4^⌊n/2⌋ mod 10⁹+7。

```typescript
function countGoodNumbers(n: number): number {
  const MOD = 1_000_000_007n;
  const even = BigInt(Math.ceil(n / 2)); // 偶数位个数
  const odd = BigInt(Math.floor(n / 2)); // 质数位个数
  const five = 5n;
  const four = 4n;

  return Number((modPow(five, even, MOD) * modPow(four, odd, MOD)) % MOD);
}
```

## 一些工程上的坑

虽然快速幂逻辑简单，但工程中还是有几个坑需要绕开：

### 坑 1：n = -2³¹ 的情况

JavaScript 里 `Math.abs(-2147483648)` 仍然返回 -2147483648（因为超出了 32 位正数范围）。

```typescript
function myPow(x: number, n: number): number {
  let exp = n;
  if (exp < 0) {
    x = 1 / x;
    exp = -exp; // ⚠️ 当 n = -2³¹ 时，这里 -exp 还是 -2³¹
  }
  // ...
}
```

**正确写法**：用 long 类型（C++/Java），或者在 JS 里改成 `exp = -n; x = 1/x;`，避免 `exp = -exp` 的二次否定。

### 坑 2：浮点数精度

JS 的 Number 是 IEEE 754 双精度浮点数，2^53 之后的整数就不能精确表示了。所以 LeetCode 50 用 Number 一般够用，但**生产环境的大数运算必须用 BigInt**。

```typescript
// ❌ 不精确
console.log(2 ** 53);             // 9007199254740992
console.log(2 ** 53 + 1);         // 还是 9007199254740992，丢失精度！

// ✅ 用 BigInt
console.log(2n ** 53n + 1n);      // 9007199254740993n，精确
```

### 坑 3：模运算和负数

JS 里 `-5 % 3 = -2`，不是数学意义上的 1。如果你的快速幂要支持负数模运算，记得做修正：

```typescript
function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}
```

## 总结

快速幂的本质就一句话：**把指数 n 用二进制拆开，每一位单独贡献一个 x^(2^i)，然后把这些贡献相乘**。

```
x^n = Π x^(2^i)   (遍历 n 的所有 set bit)
```

记住这几个关键点，应对面试就稳了：

1. **核心公式**：`result *= x` 当且仅当当前 bit 位是 1；`x *= x` 每轮都执行。
2. **时间复杂度**：O(log n)，n = 10⁹ 也只要 30 次乘法。
3. **常见变种**：矩阵快速幂（Fibonacci O(log n)）、模快速幂（RSA 加密）。
4. **位运算技巧**：`n & 1` 取最低位，`n >>>= 1` 无符号右移。

面试中如果被问到"如何高效计算 x^n"，答出快速幂只是及格线。如果你能顺便讲一下**矩阵快速幂**和**模幂在加密中的应用**，那就是高分答案。

最后留一道思考题给你：**能不能把快速幂和分治思想结合，做出一个能同时算 x^n 和 y^n 的"批量快速幂"？** （提示：复数乘法 + 旋转矩阵）。如果你想出来了，欢迎留言讨论 👋
