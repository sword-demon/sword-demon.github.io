---
title: 扩展欧几里得算法
description: 扩展欧几里得算法（Extended Euclidean Algorithm）
date: 2026-07-24 09:00:00
categories:
  - Algorithm
tags:
  - extended-euclidean
  - number-theory
  - gcd
sidebarSort: 67
---

# 扩展欧几里得算法（Extended Euclidean Algorithm）

你有没有遇到过这种面试题："求两个整数 a 和 b 的最大公约数，顺便求出整数 x 和 y，使得 `a*x + b*y = gcd(a, b)`"？

第一问你会——辗转相除法嘛，秒了。但第二问...好像有点超纲？

这就是**扩展欧几里得算法**（Extended Euclidean Algorithm）要解决的问题。它其实是初中数学一个定理的工程化实现，那个定理叫做 **裴蜀定理**（Bezout's Lemma）。

别慌，这玩意儿没有听起来那么吓人。看完这篇文章，你会：
1. 理解裴蜀定理在说什么（生活场景类比）
2. 掌握扩展欧几里得算法的核心思路和代码实现
3. 搞懂它在实际工程中有什么用（尤其是密码学）

## 裴蜀定理：先说"为什么"

在说算法之前，我们先搞清楚一件事——为什么 `a*x + b*y = gcd(a, b)` 这个等式一定有解？

裴蜀定理说的是：**对于任意两个整数 a 和 b，一定存在整数 x 和 y，使得 `a*x + b*y = gcd(a, b)`**。

用人话来说就是：两个数的最大公约数，一定能"表示成"这两个数的线性组合。这是数论里一个非常基础但极其重要的结论。

举几个例子验证一下：

```
a = 12, b = 8
gcd(12, 8) = 4
12 × 1 + 8 × (-1) = 4  ✓ (x=1, y=-1)

a = 35, b = 15
gcd(35, 15) = 5
35 × 1 + 15 × (-2) = 5  ✓ (x=1, y=-2)

a = 7, b = 5
gcd(7, 5) = 1
7 × 3 + 5 × (-4) = 1  ✓ (x=3, y=-4)
```

验证完了，你可能会想——这东西有什么用啊？

用处大了去了。`a*x + b*y = 1` 意味着 a 和 b 互质，也就是说 a 在模 b 下的**乘法逆元**存在：`a⁻¹ ≡ x (mod b)`。这就是 RSA 加密算法的数学基石之一。没有扩展欧几里得，你连 RSA 都写不出来（当然实际上用的是现成库，但面试要考 😏）。

## 原理拆解

### 普通欧几里得算法（辗转相除法）

扩展欧几里得是普通欧几里得的"升级版"。先快速过一下普通版：

```typescript
/**
 * 普通欧几里得算法 —— 求最大公约数
 * 核心公式：gcd(a, b) = gcd(b, a % b)
 * 终止条件：b = 0 时，gcd(a, 0) = a
 */
function gcd(a: number, b: number): number {
  if (b === 0) return a;
  return gcd(b, a % b);
}

// 迭代版本（用得多，实际写代码建议用这个）
function gcdIter(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}
```

这是基础中的基础，没啥好说的。

### 扩展欧几里得：怎么求 x 和 y？

扩展欧几里得的核心思想是：**在用辗转相除法求 gcd 的过程中，顺手把 x 和 y 就算出来**。

我们来看递归版本的推导过程。假设：

```
gcd(a, b) = gcd(b, a % b)
```

如果我们已经知道：

```
b*x1 + (a % b)*y1 = gcd(b, a % b) = gcd(a, b)
```

把 `(a % b)` 拆开：

```
a % b = a - floor(a / b) * b
```

代入：

```
b*x1 + (a - floor(a / b) * b)*y1 = gcd(a, b)
      = a*y1 + b*(x1 - floor(a / b)*y1)
```

所以：
- `x = y1`
- `y = x1 - floor(a / b) * y1`

这就是递归的递推公式！加上终止条件：当 `b = 0` 时，`gcd(a, 0) = a`，此时 `a*1 + 0*0 = a`，所以 `x = 1, y = 0`。

### 图解递归过程

```
求 gcd(12, 8) 和对应的 x, y

Step 1: gcd(12, 8)
        12 % 8 = 4，递归求 gcd(8, 4)

Step 2: gcd(8, 4)
        8 % 4 = 0，递归求 gcd(4, 0)

Step 3: gcd(4, 0) ← 终止！
        x = 1, y = 0，因为 4*1 + 0*0 = 4

Step 4: 回代到 gcd(8, 4)
        a=8, b=4, floor(a/b)=2
        x1=1, y1=0 (从下层来的)
        x = y1 = 0
        y = x1 - floor(a/b)*y1 = 1 - 2*0 = 1
        验证：8*0 + 4*1 = 4 ✓

Step 5: 回代到 gcd(12, 8)
        a=12, b=8, floor(a/b)=1
        x1=0, y1=1 (从下层来的)
        x = y1 = 1
        y = x1 - floor(a/b)*y1 = 0 - 1*1 = -1
        验证：12*1 + 8*(-1) = 4 ✓
```

最终结果：`x = 1, y = -1`，即 `12*1 + 8*(-1) = 4`。

## 代码实现

### TypeScript

```typescript
/**
 * 扩展欧几里得算法 —— TypeScript 实现
 *
 * 返回值：{ gcd, x, y }，满足 a*x + b*y = gcd(a, b)
 *
 * 核心思路：在辗转相除的过程中递推 x 和 y
 * 递推公式：
 *   当 b = 0 时：gcd = a, x = 1, y = 0
 *   否则：gcd(b, a % b) = b*x1 + (a % b)*y1
 *        其中 x = y1, y = x1 - floor(a/b) * y1
 */
function extendedGcd(a: number, b: number): { gcd: number; x: number; y: number } {
  if (b === 0) {
    // 终止条件：gcd(a, 0) = a，此时 x=1, y=0
    return { gcd: a, x: 1, y: 0 };
  }

  // 递归求下一层：gcd(b, a % b) = b*x1 + (a % b)*y1
  const { gcd, x: x1, y: y1 } = extendedGcd(b, a % b);

  // 根据递推公式，从 (x1, y1) 推导出 (x, y)
  const x = y1;
  const y = x1 - Math.floor(a / b) * y1;

  return { gcd, x, y };
}

// === 求模逆的便捷封装 ===
/**
 * 求 a 在模 m 下的乘法逆元
 * 即找到一个 x，使得 a*x ≡ 1 (mod m)
 *
 * 前提：gcd(a, m) = 1（a 和 m 互质，否则逆元不存在）
 *
 * 为什么这能用扩展欧几里得：
 * gcd(a, m) = 1 ⇒ a*x + m*y = 1
 * 两边对 m 取模：a*x ≡ 1 (mod m)
 * 所以 x 就是 a 的模逆！
 */
function modInverse(a: number, m: number): number {
  const { gcd, x } = extendedGcd(a, m);

  if (gcd !== 1) {
    throw new Error(`模逆不存在：gcd(${a}, ${m}) = ${gcd} ≠ 1`);
  }

  // 扩展欧几里得返回的 x 可能是负数，需要调整到 [0, m) 范围
  return ((x % m) + m) % m;
}

// 使用示例
console.log(extendedGcd(12, 8));   // { gcd: 4, x: 1, y: -1 }
console.log(extendedGcd(35, 15));  // { gcd: 5, x: 1, y: -2 }
console.log(extendedGcd(7, 5));    // { gcd: 1, x: 3, y: -4 }

console.log(modInverse(3, 11));    // 4，因为 3*4 = 12 ≡ 1 (mod 11)
console.log(modInverse(2, 7));     // 4，因为 2*4 = 8 ≡ 1 (mod 7)
```

### Go

```go
package extended

import "fmt"

/*
扩展欧几里得算法 —— Go 实现

返回 gcd(a, b) 以及满足 a*x + b*y = gcd(a, b) 的 x 和 y
*/
func ExtendedGcd(a, b int64) (gcd, x, y int64) {
	if b == 0 {
		// 终止条件
		return a, 1, 0
	}

	// 递归求下一层
	gcd, x1, y1 := ExtendedGcd(b, a%b)

	// 递推公式
	x = y1
	y = x1 - (a/b)*y1

	return gcd, x, y
}

// 求 a 在模 m 下的乘法逆元
// 要求 a 和 m 互质（即 gcd(a, m) = 1）
func ModInverse(a, m int64) (int64, error) {
	gcd, x, _ := ExtendedGcd(a, m)
	if gcd != 1 {
		return 0, fmt.Errorf("模逆不存在：gcd(%d, %d) = %d", a, m, gcd)
	}
	// 确保结果在 [0, m) 范围内
	return ((x % m) + m) % m, nil
}
```

```go
// 使用示例
package main

import (
	"fmt"
	"extended"
)

func main() {
	gcd, x, y := extended.ExtendedGcd(12, 8)
	fmt.Printf("gcd(12, 8) = %d, x = %d, y = %d\n", gcd, x, y)
	// 输出：gcd(12, 8) = 4, x = 1, y = -1
	// 验证：12*1 + 8*(-1) = 4 ✓

	inv, err := extended.ModInverse(3, 11)
	if err != nil {
		panic(err)
	}
	fmt.Printf("3 在模 11 下的逆元是：%d\n", inv)
	// 输出：4，验证：3*4 = 12 ≡ 1 (mod 11) ✓
}
```

### Java

```java
/**
 * 扩展欧几里得算法 —— Java 实现
 */
public class ExtendedGcd {

    /**
     * 递归求解：返回 int[]{gcd, x, y}，满足 a*x + b*y = gcd
     */
    public static long[] extendedGcd(long a, long b) {
        if (b == 0) {
            // 终止条件：gcd(a, 0) = a，此时 x=1, y=0
            return new long[]{a, 1, 0};
        }

        // 递归求下一层
        long[] next = extendedGcd(b, a % b);
        long gcd = next[0];
        long x1 = next[1];
        long y1 = next[2];

        // 递推公式
        long x = y1;
        long y = x1 - (a / b) * y1;

        return new long[]{gcd, x, y};
    }

    /**
     * 求 a 在模 m 下的乘法逆元
     * 即找到一个 x，使得 (a * x) % m == 1
     *
     * @throws IllegalArgumentException 当 gcd(a, m) != 1 时（逆元不存在）
     */
    public static long modInverse(long a, long m) {
        long[] result = extendedGcd(a, m);
        long gcd = result[0];

        if (gcd != 1) {
            throw new IllegalArgumentException(
                "模逆不存在：gcd(" + a + ", " + m + ") = " + gcd);
        }

        // 调整到 [0, m) 范围
        long x = result[1];
        return ((x % m) + m) % m;
    }

    // 使用示例
    public static void main(String[] args) {
        long[] r1 = extendedGcd(12, 8);
        System.out.printf("gcd(12, 8) = %d, x = %d, y = %d%n", r1[0], r1[1], r1[2]);
        // 验证：12*1 + 8*(-1) = 4 ✓

        System.out.printf("3 的模 11 逆元：%d%n", modInverse(3, 11)); // 4
        System.out.printf("7 的模 26 逆元：%d%n", modInverse(7, 26)); // 15
    }
}
```

### Python

```python
def extended_gcd(a: int, b: int) -> tuple[int, int, int]:
    """扩展欧几里得算法

    返回：(gcd, x, y)，满足 a*x + b*y = gcd(a, b)

    递归终止：b = 0 时，gcd = a, x = 1, y = 0
    递推公式：
        从下一层得到 (x1, y1)：b*x1 + (a % b)*y1 = gcd
        推到当前层：x = y1, y = x1 - (a // b) * y1
    """
    if b == 0:
        return (a, 1, 0)

    gcd, x1, y1 = extended_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return (gcd, x, y)


def mod_inverse(a: int, m: int) -> int:
    """求 a 在模 m 下的乘法逆元

    原理：gcd(a, m) = 1 ⇒ 存在 x 使得 a*x + m*y = 1
          两边对 m 取模得 a*x ≡ 1 (mod m)
          所以 x 就是 a 的模逆
    """
    gcd, x, _ = extended_gcd(a, m)
    if gcd != 1:
        raise ValueError(f"模逆不存在：gcd({a}, {m}) = {gcd}")
    return (x % m + m) % m


if __name__ == "__main__":
    # 基本示例
    print(extended_gcd(12, 8))   # (4, 1, -1)
    print(extended_gcd(35, 15))  # (5, 1, -2)
    print(extended_gcd(7, 5))    # (1, 3, -4)

    # 模逆示例
    print(mod_inverse(3, 11))   # 4，因为 3*4 = 12 ≡ 1 (mod 11)
    print(mod_inverse(7, 26))   # 15，因为 7*15 = 105 ≡ 1 (mod 26)

    # 验证
    a, b = 35, 15
    gcd, x, y = extended_gcd(a, b)
    print(f"{a}*{x} + {b}*{y} = {gcd}")  # 35*1 + 15*(-2) = 5 ✓
```

## 迭代版本（面试能写出来加分）

递归版本的扩展欧几里得清晰易懂，但面试时如果能写出迭代版本，会让面试官眼前一亮。迭代版本的核心是把递归过程中的中间值存下来，不用递归调用栈。

```typescript
/**
 * 扩展欧几里得算法 —— 迭代版本
 *
 * 思路：模拟递归回代的过程
 * 用数组存储每一步的 (a, b, floor(a/b))，最后从底往上回代
 */
function extendedGcdIter(a: number, b: number): { gcd: number; x: number; y: number } {
  if (b === 0) {
    return { gcd: a, x: 1, y: 0 };
  }

  // 存储每一步的系数，用于回代
  const coefficients: [number, number, number][] = [];

  // 模拟递归的"压栈"，记录每一层的 (a, b, a/b)
  let oldR = a, r = b;
  let oldS = 1, s = 0;
  let oldT = 0, t = 1;

  while (r !== 0) {
    const quotient = Math.floor(oldR / r);
    coefficients.push([oldR, r, quotient]);

    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
    [oldT, t] = [t, oldT - quotient * t];
  }

  // oldR 就是最终 gcd，oldS 和 oldT 就是我们要的 x 和 y
  return { gcd: oldR, x: oldS, y: oldT };
}

// 验证
console.log(extendedGcdIter(12, 8));   // { gcd: 4, x: 1, y: -1 }
console.log(extendedGcdIter(35, 15)); // { gcd: 5, x: 1, y: -2 }
console.log(extendedGcdIter(7, 5));   // { gcd: 1, x: 3, y: -4 }
```

## 实际应用场景

### 1. RSA 加密（最重要的应用！）

RSA 是目前最广泛使用的非对称加密算法。它的数学基础就是：**给定两个大质数 p 和 q，n = p*q，已知 n 和 e，求 d 使得 e*d ≡ 1 (mod φ(n))**。

其中 φ(n) = (p-1)(q-1) 是欧拉函数。而求 d 的过程，本质上就是求 e 在模 φ(n) 下的乘法逆元——这就要用扩展欧几里得。

```python
# RSA 密钥生成的简化演示（实际用的是大整数，这里用小数字）
p, q = 61, 53  # 两个质数
n = p * q      # 3233，公开
phi = (p-1)*(q-1)  # 3120，私有

e = 17  # 公开指数，通常选 65537 或 17

# 求 d：e * d ≡ 1 (mod phi)
# 也就是求 e 在模 phi 下的乘法逆元
d = mod_inverse(e, phi)  # 用扩展欧几里得算出来 d = 2753

# 验证：e * d = 17 * 2753 = 46801
# 46801 % 3120 = 1 ✓

print(f"公钥：(n={n}, e={e})")
print(f"私钥：(n={n}, d={d})")
# 加密：c = m^e mod n
# 解密：m = c^d mod n
```

### 2. 中国剩余定理（CRT）

中国剩余定理是求解一类同余方程组的方法：

```
x ≡ a1 (mod m1)
x ≡ a2 (mod m2)
...
x ≡ ak (mod mk)
```

扩展欧几里得在其中负责求"构造解"的关键系数。密码学里的 CRT 加速解密（RSA 使用 CRT 可以快 4 倍）、分布式计算中的余数协调，都离不开它。

### 3. 求解二元一次不定方程

像 `a*x + b*y = c` 这样的方程，当 `gcd(a, b) | c` 时有整数解。扩展欧几里得先求出 `a*x0 + b*y0 = gcd(a, b)`，然后两边乘以 `c/gcd(a, b)` 就能得到通解。

这在竞赛算法里经常出现，比如某些数论题的推导步骤。

### 4. 贝祖定理验证（面试用途）

面试时如果遇到需要证明两个数互质、或者需要用裴蜀定理的题目，扩展欧几里得的代码可以直接拿来用，证明你"不仅会用工具，还知道原理"。

## 复杂度分析

| 指标 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 时间 | O(log min(a, b)) | 等同于普通欧几里得算法，每一步让参数规模至少减半 |
| 空间 | O(log min(a, b)) | 递归版本的调用栈深度，最多 O(log n) |

## 小结

扩展欧几里得算法本质上就做了两件事：

1. **继承普通欧几里得的框架**：gcd(a, b) = gcd(b, a % b)
2. **在递归回代的过程中，顺手把 x 和 y 递推出来**

核心递推公式：
```
x = y_prev
y = x_prev - floor(a / b) * y_prev
```

它的应用场景：

- 🔐 **RSA 密钥生成**：求模逆是 RSA 的核心步骤
- 🧮 **中国剩余定理**：CRT 加速解密
- 📐 **不定方程求解**：a*x + b*y = c 的整数解
- 🧮 **数论推导**：证明互质关系、计算乘法逆元

面试中考扩展欧几里得，通常不会直接让你"实现这个算法"（太简单了），而是：
1. 在考察 RSA / 密码学的时候，顺带问你"RSA 里怎么求私钥 d"
2. 在数论题里，用裴蜀定理做推导
3. 在某些 DP 或数学题的推导过程中用到

所以理解它的原理比背代码更重要。希望看完这篇文章，下次遇到这类题你能自信地说："扩展欧几里得嘛，我会！" ✨
