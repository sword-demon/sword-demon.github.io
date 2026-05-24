---
title: 位运算
description: 位运算详解：从基础操作到经典面试题，四语言实现
date: 2026-05-17 23:00:00
categories:
  - Algorithm
tags:
  - bit-manipulation
  - xor
  - algorithm
  - interview
sidebarSort: 25
---

# 位运算（Bit Manipulation）

面试官问："不用加减乘除，怎么做加法？"、"怎么判断一个数是不是 2 的幂？"、"一个数组里除了一个数字出现一次，其他都出现两次，怎么找出来？"

这些题的共同点是：**答案都用位运算**。位运算直接在二进制位上操作，速度极快（CPU 原生支持，比加减法还快），而且经常能把 O(n) 空间优化到 O(1)。

## 原理拆解

### 六种基本位运算

| 运算 | 符号 | 规则                           | 示例                  |
| ---- | ---- | ------------------------------ | --------------------- |
| 与   | `&`  | 两位都为 1 才是 1              | `1010 & 1100 = 1000`  |
| 或   | `\|` | 有一位为 1 就是 1              | `1010 \| 1100 = 1110` |
| 异或 | `^`  | 两位不同为 1，相同为 0         | `1010 ^ 1100 = 0110`  |
| 取反 | `~`  | 0 变 1，1 变 0                 | `~1010 = 0101`        |
| 左移 | `<<` | 所有位左移，低位补 0           | `1010 << 1 = 10100`   |
| 右移 | `>>` | 所有位右移（算术右移补符号位） | `1010 >> 1 = 0101`    |

### 异或（XOR）的三个重要性质

异或是位运算面试题的**绝对核心**，记住这三条：

```
1. a ^ a = 0        任何数异或自己等于 0
2. a ^ 0 = a        任何数异或 0 等于自己
3. a ^ b = b ^ a    异或满足交换律和结合律
```

由这三条性质可以推出：**一堆数异或在一起，成对出现的都会抵消为 0，最后剩下的就是那个"落单"的数**。

### 常用位操作技巧

```
判断奇偶：      n & 1 == 0        （最低位为 0 是偶数）
除以 2：        n >> 1            （右移一位）
乘以 2：        n << 1            （左移一位）
清除最低位 1：  n & (n - 1)       （Brian Kernighan 算法）
获取最低位 1：  n & (-n)          （lowbit 操作）
判断 2 的幂：   n > 0 && (n & (n-1)) == 0
切换第 i 位：   n ^ (1 << i)
设置第 i 位：   n | (1 << i)
清除第 i 位：   n & ~(1 << i)
检查第 i 位：   (n >> i) & 1
```

## 代码实现

### 经典问题一：只出现一次的数字

> LeetCode 136. Single Number
> 数组中除了某个元素只出现一次，其余都出现两次。找出那个只出现一次的元素。要求 O(n) 时间、O(1) 空间。

**核心思路：全部异或在一起，成对的抵消为 0，剩下的就是答案。**

#### TypeScript

```typescript
/**
 * 只出现一次的数字 —— TypeScript 实现
 * 异或：a ^ a = 0，a ^ 0 = a
 */
function singleNumber(nums: number[]): number {
  let result = 0;
  for (const num of nums) {
    result ^= num; // 全部异或
  }
  return result; // 成对的都抵消了，剩下就是答案
}

// 测试
console.log(singleNumber([2, 2, 1])); // 1
console.log(singleNumber([4, 1, 2, 1, 2])); // 4
```

#### Go

```go
package bitops

// SingleNumber 只出现一次的数字 —— Go 实现
func SingleNumber(nums []int) int {
	result := 0
	for _, num := range nums {
		result ^= num
	}
	return result
}
```

#### Java

```java
/**
 * 只出现一次的数字 —— Java 实现
 */
public class SingleNumber {
    public static int singleNumber(int[] nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;
        }
        return result;
    }
}
```

#### Python

```python
"""只出现一次的数字 —— Python 实现"""
from functools import reduce
from operator import xor

def single_number(nums: list[int]) -> int:
    return reduce(xor, nums)
```

### 经典问题二：只出现一次的数字 III

> LeetCode 260. Single Number III
> 数组中有**两个**元素只出现一次，其余都出现两次。找出这两个元素。

**核心思路：先全部异或得到 `diff = a ^ b`，找到 diff 中任意一个为 1 的位，用这一位把数组分成两组，每组各包含一个落单元素。**

#### TypeScript

```typescript
/**
 * 只出现一次的数字 III —— TypeScript 实现
 * 分两组异或，把两个落单元素分到不同组
 */
function singleNumberIII(nums: number[]): number[] {
  // 第一步：全部异或，得到 diff = a ^ b
  let diff = 0;
  for (const num of nums) {
    diff ^= num;
  }

  // 第二步：找到 diff 中最右边的 1（lowbit）
  // 这个位上 a 和 b 一定不同（一个是 0，一个是 1）
  const lowbit = diff & -diff;

  // 第三步：按 lowbit 位分成两组，分别异或
  let a = 0,
    b = 0;
  for (const num of nums) {
    if (num & lowbit) {
      a ^= num; // 这一组包含 a
    } else {
      b ^= num; // 这一组包含 b
    }
  }

  return [a, b];
}

// 测试
console.log(singleNumberIII([1, 2, 1, 3, 2, 5])); // [3, 5]
```

#### Go

```go
package bitops

// SingleNumberIII 只出现一次的数字 III —— Go 实现
func SingleNumberIII(nums []int) []int {
	diff := 0
	for _, num := range nums {
		diff ^= num
	}

	lowbit := diff & (-diff)

	a, b := 0, 0
	for _, num := range nums {
		if num&lowbit != 0 {
			a ^= num
		} else {
			b ^= num
		}
	}
	return []int{a, b}
}
```

#### Java

```java
/**
 * 只出现一次的数字 III —— Java 实现
 */
public class SingleNumberIII {
    public static int[] singleNumber(int[] nums) {
        int diff = 0;
        for (int num : nums) diff ^= num;

        int lowbit = diff & (-diff);
        int a = 0, b = 0;

        for (int num : nums) {
            if ((num & lowbit) != 0) {
                a ^= num;
            } else {
                b ^= num;
            }
        }
        return new int[]{a, b};
    }
}
```

#### Python

```python
"""只出现一次的数字 III —— Python 实现"""

def single_number_iii(nums: list[int]) -> list[int]:
    diff = 0
    for num in nums:
        diff ^= num

    lowbit = diff & (-diff)

    a, b = 0, 0
    for num in nums:
        if num & lowbit:
            a ^= num
        else:
            b ^= num
    return [a, b]
```

### 经典问题三：不用加减乘除做加法

> 面试题：实现两个整数的加法，不使用 `+`、`-`、`*`、`/`。

**核心思路：用位运算模拟加法器。`a ^ b` 是不进位加法，`(a & b) << 1` 是进位。循环直到进位为 0。**

```
例：3 + 5

二进制：011 + 101

第 1 轮：
  不进位加法：011 ^ 101 = 110（6）
  进位：(011 & 101) << 1 = 001 << 1 = 010（2）

第 2 轮：a = 110, b = 010
  不进位加法：110 ^ 010 = 100（4）
  进位：(110 & 010) << 1 = 010 << 1 = 100（4）

第 3 轮：a = 100, b = 100
  不进位加法：100 ^ 100 = 000（0）
  进位：(100 & 100) << 1 = 100 << 1 = 1000（8）

第 4 轮：a = 000, b = 1000
  不进位加法：000 ^ 1000 = 1000（8）
  进位：(000 & 1000) << 1 = 0

进位为 0，结果 = 1000 = 8 ✅
```

#### TypeScript

```typescript
/**
 * 不用加减乘除做加法 —— TypeScript 实现
 */
function add(a: number, b: number): number {
  while (b !== 0) {
    const carry = (a & b) << 1; // 进位
    a = a ^ b; // 不进位加法
    b = carry; // 下一轮处理进位
  }
  return a;
}

console.log(add(3, 5)); // 8
console.log(add(-1, 1)); // 0
```

#### Go

```go
package bitops

// Add 不用加减乘除做加法 —— Go 实现
func Add(a, b int) int {
	for b != 0 {
		carry := (a & b) << 1
		a = a ^ b
		b = carry
	}
	return a
}
```

#### Java

```java
/**
 * 不用加减乘除做加法 —— Java 实现
 */
public class BitAdd {
    public static int add(int a, int b) {
        while (b != 0) {
            int carry = (a & b) << 1;
            a = a ^ b;
            b = carry;
        }
        return a;
    }
}
```

#### Python

```python
"""不用加减乘除做加法 —— Python 实现
注意：Python 整数是任意精度的，需要模拟 32 位溢出
"""

def add(a: int, b: int) -> int:
    MASK = 0xFFFFFFFF
    while b != 0:
        a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK
    # 处理负数（补码转换）
    return a if a <= 0x7FFFFFFF else ~(a ^ MASK)
```

### 经典问题四：统计二进制中 1 的个数

> LeetCode 191. Number of 1 Bits
> 写一个函数，返回二进制表示中 '1' 的位数（汉明重量）。

#### TypeScript

```typescript
/**
 * 统计 1 的个数 —— TypeScript 实现
 * Brian Kernighan 算法：n & (n-1) 清除最低位的 1
 */
function hammingWeight(n: number): number {
  let count = 0;
  while (n !== 0) {
    n &= n - 1; // 每次清除最低位的 1
    count++;
  }
  return count;
}

// 测试
console.log(hammingWeight(11)); // 3（1011 有 3 个 1）
console.log(hammingWeight(128)); // 1（10000000 只有 1 个 1）
```

#### Go

```go
package bitops

// HammingWeight 统计 1 的个数 —— Go 实现
func HammingWeight(n uint32) int {
	count := 0
	for n != 0 {
		n &= n - 1
		count++
	}
	return count
}
```

#### Java

```java
/**
 * 统计 1 的个数 —— Java 实现
 */
public class HammingWeight {
    public static int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= n - 1;
            count++;
        }
        return count;
    }
}
```

#### Python

```python
"""统计 1 的个数 —— Python 实现"""

def hamming_weight(n: int) -> int:
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count
```

## 面试题精选

| 题号 | 题目                 | 位运算技巧                 | 难度 |
| ---- | -------------------- | -------------------------- | ---- |
| 136  | 只出现一次的数字     | 全部异或                   | 简单 |
| 137  | 只出现一次的数字 II  | 统计每位出现次数 mod 3     | 中等 |
| 260  | 只出现一次的数字 III | 分组异或 + lowbit          | 中等 |
| 191  | 位 1 的个数          | `n & (n-1)` 清最低位       | 简单 |
| 231  | 2 的幂               | `n & (n-1) == 0`           | 简单 |
| 338  | 比特位计数           | `dp[i] = dp[i>>1] + (i&1)` | 简单 |
| 371  | 两整数之和           | 异或 + 与 + 左移           | 中等 |
| 461  | 汉明距离             | 异或后统计 1 的个数        | 简单 |
| 1486 | 数组异或操作         | 直接模拟                   | 简单 |
| 1720 | 解码异或后的数组     | `a ^ b = c → a = c ^ b`    | 简单 |

## 业务场景

### 1. 权限系统（位掩码）

Linux 文件权限 `rwx` 就是用位表示的：`r=4(100)`, `w=2(010)`, `x=1(001)`。`chmod 755` 就是 `111 101 101`。判断有没有某个权限用 `&`，添加权限用 `|`，删除权限用 `& ~`。

```
权限 = READ | WRITE       // 0b110 = 6
hasRead = 权限 & READ     // 0b110 & 0b100 = 0b100 ✅
权限 &= ~WRITE            // 移除写权限 → 0b100
```

Redis、Nginx 的配置项也大量使用位掩码。

### 2. 网络掩码与路由

IP 地址 `192.168.1.100` 和子网掩码 `255.255.255.0` 做 `&` 运算，就能得到网络地址 `192.168.1.0`。路由器用这个原理判断目标 IP 是否在同一个子网内。CIDR 表示法 `192.168.1.0/24` 里的 `/24` 就是子网掩码中 1 的位数。

### 3. 数据压缩与编码

Huffman 编码、Base64 编码、Varint 编码都涉及大量位运算。Protocol Buffers 用 Varint 编码整数：每个字节只用 7 位存数据，最高位表示"后面还有没有字节"，小整数只需要 1 个字节就能表示。

### 4. 游戏开发中的碰撞检测

2D 游戏中用位图（bitmask）做碰撞检测：每个精灵的碰撞区域用一个整数表示，两个整数 `&` 一下就知道有没有重叠。Roguelike 游戏中的地图视野、墙壁碰撞都用位运算实现，速度极快。

### 5. 数据库位索引

一些数据库引擎用位图索引（Bitmap Index）加速查询。每个不同的值对应一个位向量，`AND`、`OR` 操作直接在位向量上完成，比遍历快几个数量级。Redis 的 `BITCOUNT`、`BITOP` 命令就是为这种场景设计的。

## 复杂度分析

| 操作            | 时间复杂度 | 说明          |
| --------------- | ---------- | ------------- |
| 单次位运算      | O(1)       | CPU 原生指令  |
| 遍历所有位      | O(log n)   | n 的位数      |
| Brian Kernighan | O(k)       | k 是 1 的个数 |
| 异或找落单数    | O(n)       | 一次遍历      |

位运算的最大优势是**常数极小**。同样的逻辑，位运算版本通常比算术版本快 2-10 倍。在对性能敏感的场景（内核、驱动、嵌入式、游戏引擎）中，位运算是基本功。

## 小结

位运算的本质就是**直接在二进制位上操作数据**，绕过了高级语言的抽象层，跟 CPU 对话。

面试中最常考的就两类：

1. **异或类**：找落单数、不用加减做加法、交换两个数
2. **位操作类**：统计 1 的个数、判断 2 的幂、lowbit 操作

记住这几个**万能公式**：

- 找唯一落单数 → 全部异或
- 清除最低位 1 → `n & (n - 1)`
- 获取最低位 1 → `n & (-n)`
- 判断 2 的幂 → `n > 0 && (n & (n-1)) == 0`
- 交换两个数 → `a ^= b; b ^= a; a ^= b`

位运算口诀：**异或消对找落单，与减一清最低位。移位乘除快如电，位掩权限一行完** ✅
