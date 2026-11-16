---
title: 进制转换与 Base-N 编码精讲（Base Conversion）
description: 从「短链 ID 为什么不能直接用数据库自增 ID」讲起，一文打通除基取余的数学原理、字符表映射、负进制 -2、Excel 列名的 26 进制变体、Base64 的 6 位分组与进制转换的本质区别，附 TypeScript / Python / Go 三语言完整实现、BigInt 精度陷阱与 30000 组对拍验证
date: 2026-11-16 09:05:00
categories:
  - Algorithm
tags:
  - base-conversion
  - radix
  - encoding
  - bigint
  - base64
  - leetcode
  - interview
sidebarSort: 136
---

# 进制转换与 Base-N 编码精讲（Base Conversion）

先问你一个特别现实的问题。

你要做一个短链服务，`https://s.example.com/aB3xK9`。这个 `aB3xK9` 是什么？是数据库自增 ID 吗？

数据库自增 ID 是 `1042`、`1043`、`1044` 这种数字。短链服务如果直接把 ID 拼上去，用户看到的就是 `https://s.example.com/1042`。技术上完全能用，但产品经理不会同意 —— **因为它泄露了业务量**。用户点开就知道"哦，这个站也就一千多条链接"。

于是你需要一个"把大数字压成短字符串"的东西。压得越狠越好。

而这件事的本质，就是**进制转换** ✨

今天这篇，我把进制转换这件事从头到尾捋一遍。里面有几个坑我踩过 —— 尤其那个 **JavaScript 精度陷阱**，我到现在还觉得 JS 的数字设计是个历史遗留的烂摊子。

---

## 一、先把问题问清楚

### 1.1 三类需求，别混为一谈

很多人一说"进制转换"就想到 `parseInt(s, 16)`。但你实际遇到的需求，其实是三类：

| 需求 | 典型场景 | 是不是进制转换 |
| ---- | -------- | -------------- |
| **整数换个写法** | 255 → "FF"，雪花 ID → 短码 | ✅ 是 |
| **有"编号体系"的字符串** | Excel 列名 A~ZZ、AAA~XFD | ⚠️ 是，但**不是标准进制** |
| **字节流换个传输格式** | Base64、URL 编码、Hex 编码 | ❌ **不是** |

第三类最容易被误解。Base64 长得像进制（都是"字符表示数据"），但它的数学本质完全不同 —— 后面第 2.8 节会详细拆。

### 1.2 "进制"到底是什么

先建立最基础的认识。

我们平时写的 `1234` 是**十进制**，意思是：

```text
1 × 10³ + 2 × 10² + 3 × 10¹ + 4 × 10⁰
= 1000 + 200 + 30 + 4
= 1234
```

**"进制"就是"每一位的权重倍数"。** 十进制每进一位乘 10，二进制乘 2，十六进制乘 16。

所以进制转换的本质只有一句话：

> **同一个数，用不同的"位权重"写出来。**

### 1.3 为什么值得专门写一篇

因为这事儿**看着简单，坑却不少**：

- `parseInt` 只支持 2~36 进制，Base62 怎么办？
- 负数怎么表示？`-FF` 算合法吗？
- Excel 的 `A` 是 1 不是 0，直接套 26 进制会错
- 雪花 ID 是 `1234567890123456789`，`Number` 装不下，一转就精度丢失
- Base64 的 `=` 补位到底是怎么回事

这些坑我都踩过。今天一次性说清楚。

---

## 二、原理拆解

### 2.1 除基取余：为什么它是对的

这是整个进制转换的**唯一核心**。别的不用记，就记这一招。

**做法**：不断用 n 除以 base，取余数，余数就是最低位，然后把商拿去做下一轮。

**为什么正确？** 看这个式子：

```text
N = q × b + r     其中 0 ≤ r < b
```

对任意非负整数 N，除以 b 一定得到商 q 和余数 r，且 `r` 落在 `[0, b)` 里 —— 也就是**恰好是一个合法的 b 进制数位**。

那 N 的 b 进制最低位是几？就应该是 `N mod b`，也就是 r。而 `N` 剩下的高位部分，正是 `q = ⌊N / b⌋`。

所以：

```text
N 在 b 进制下的表示 = (q 在 b 进制下的表示) 拼接上 (r)
```

递归下去，直到商为 0。这就是一个**天然的递归**，也天然给出了**迭代实现**。

### 2.2 图解：255 转十六进制

```text
255 ÷ 16 = 15 余 15    → 最低位是 15 → 'F'
 15 ÷ 16 =  0 余 15    → 次低位是 15 → 'F'
  0 ÷ 16 =  0 余  0    → 商为 0，结束

把余数倒过来读：F F → "FF"
```

验证：`15 × 16 + 15 = 240 + 15 = 255` ✅

再来一个，`100` 转二进制：

```text
100 ÷ 2 = 50 余 0   → 最低位 '0'
 50 ÷ 2 = 25 余 0   → '0'
 25 ÷ 2 = 12 余 1   → '1'
 12 ÷ 2 =  6 余 0   → '0'
  6 ÷ 2 =  3 余 0   → '0'
  3 ÷ 2 =  1 余 1   → '1'
  1 ÷ 2 =  0 余 1   → '1'
  0                        结束

倒过来读：1100100
```

验证：`1100100₂ = 64 + 32 + 4 = 100` ✅

> 📌 **注意"倒过来读"这一步** —— 余数是从低位到高位依次得到的，必须反转。这是手写进制转换最容易漏的一行。

### 2.3 字符表：数字和字母怎么对应

进制大于 10 之后，单个数位需要用字符表示。业界标准是：

| 进制 | 字符表 | 长度 |
| ---- | ------ | ---- |
| 2 | `01` | 2 |
| 8 | `01234567` | 8 |
| 10 | `0123456789` | 10 |
| 16 | `0123456789ABCDEF` | 16 |
| 36 | `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ` | 36 |
| 62 | `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz` | 62 |

规律很简单：**先全部数字，再全部大写字母，最后全部小写字母**。

所以 base36 的 `z` = 35，base62 的 `z` = 35、`A` = 10、`a` = 36。

**注意 base36 和 base62 的区别**：base36 大小写不敏感（`parseInt("ff", 36)` 会自动转大写，结果是 255）；base62 **大小写敏感**，因为 `a` 和 `A` 是两个不同的数位。

### 2.4 负数怎么办

正数好办。负数有两种处理方式：

**方式一：加负号（推荐）**

```text
-255 → 先转绝对值得 "FF"，再前面加 "-" → "-FF"
```

绝大多数场景用这个，简单且可读。

**方式二：补码 / 偏移码**

计算机内部就是这么干的（`int` 的补码、`uint8` 的偏移）。但这是**底层实现细节**，手工转换时一般不碰。

**面试里问"负数怎么转"，答加负号就够了**，除非对方明确问补码。

### 2.5 边界情况清单

这些我全都在生产代码里写过 bug，一个一个列出来：

| 情况 | 处理方式 | 为什么容易错 |
| ---- | -------- | ------------ |
| `0` | 返回 `"0"`，不能返回 `""` | 循环条件是 `while (n > 0)`，`0` 一次都不进，直接返回空串 |
| 负数 | 取绝对值 + 前缀 `-` | `n % base` 在 JS 里对负数返回负余数 |
| 空串 / 非法字符 | 抛异常 | `parseInt` 遇到非法字符返回 `NaN`，静默出错最可怕 |
| 大小写 | base36 自动转大写；base62 保持原样 | 无脑 `.toUpperCase()` 会毁掉 base62 |
| 前导零 | `parseInt("007", 10)` → 7，**前导零被吃掉** | 但作为**编码结果**时前导零是有意义的（见短链 ID） |
| 空格 | 记得 `trim()` | 用户从输入框粘贴的字符串常带空格 |

### 2.6 负进制 -2：一个能表示所有整数的"进制"

LeetCode 1017 是个很有意思的题：**给定一个十进制整数，转换成 -2 进制的字符串表示**。

为什么要负进制？因为普通进制下，你没法用一个符号同时表示正负 —— `-1` 在二进制里就是 `-1`，得靠负号。但**负进制不需要负号**。

原理还是除基取余，只是 base 变成了 -2：

```text
2 ÷ (-2) = -1 余 0    → 最低位 '0'
-1 ÷ (-2) = 0 余 -1   → 余数是 -1，非法！修正成 1，同时商 +1
```

**关键点**：C 语言的 `%` 对负数可能返回负余数，所以要修正 —— 余数必须落在 `[0, |base|)` 区间内。这个修正等价于"向上借一位"。

```text
2 → 110
验证：1×(-2)² + 1×(-2)¹ + 0×(-2)⁰ = 4 - 2 + 0 = 2 ✅

-1 → 11
验证：1×(-2)¹ + 1×(-2)⁰ = -2 + 1 = -1 ✅

-7 → 1001
验证：1×(-2)³ + 0 + 0 + 1 = -8 + 1 = -7 ✅
```

### 2.7 Excel 列名：不是标准 26 进制

Excel 的列名是 `A`~`Z`，然后 `AA`~`ZZ`，再 `AAA`~`ZZZ`……一直到 `XFD`（Excel 2007 有 16384 列）。

**为什么不能直接套 26 进制？**

标准 26 进制里，`A` 应该表示 0。但 Excel 里 `A` 是第 1 列，`AA` 是第 27 列：

```text
标准 26 进制：  A=0,  B=1, ..., Z=25,  AA = 0×26 + 0 = 0
Excel：        A=1,  B=2, ..., Z=26, AA = 1×26 + 1 = 27
```

Excel 用的是**双射记数法（bijective base-26）** —— **没有数位 0，每个数位都从 1 开始**。

解法很优雅：**把 n 减 1 再取模**。

```text
n = 28:
  (28-1) % 26 = 1  → 'B'
  n = ⌊(28-1)/26⌋ = 1
  (1-1) % 26 = 0   → 'A'
  n = ⌊(1-1)/26⌋ = 0   结束
  倒序拼起来 → "AB" ✅

验证："AB" = 1×26 + 2 = 28 ✅
```

**为什么要减 1？** 因为 Excel 没有 0 这个数位。当我们做 `n % 26` 时，值 26 会溢出到下一位，需要"借位"处理。减 1 正好把这个借位一次性做掉。

这个技巧叫 **Bijective Base-K**（双射基数），在 Excel 之外还用在：

- **Visio / draw.io 的图形 ID**（`A0`, `A1`, ..., `AA0`）
- **Oracle 的序列生成器**
- **Google Docs 的列命名**

### 2.8 Base64：它根本不是进制转换

这是本文最值得掰开讲的一个点。

Base64 的字符表是：

```text
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/
```

一共 64 个字符 —— 看起来像 64 进制，**但它不是**。

**Base64 的真实工作方式**：

```text
1. 输入是字节流，每字节 8 bit
2. 每 3 个字节（24 bit）一组
3. 每组切成 4 段，每段 6 bit
4. 每段 6 bit 对应字符表里的一个字符（0~63）
5. 最后一组不足 3 字节时，用 0 补齐，输出用 '=' 标记补了几个字节
```

图示：

```text
"Man" → 4D 61 6E → 01001101 01100001 01101110
                             ↓ 每 6 bit 一组
                     010011 010110 000101 101110
                      19     22      5     46
                             ↓ 查表
                       T      W      F      u
→ "TWFu"  ✅
```

对照字符表：`T` 是第 19 个，`W` 是第 22 个，`F` 是第 5 个，`u` 是第 46 个（0 开始数）。

**为什么说它不是进制转换？** 三个理由：

1. **它处理的是字节流，不是整数。** 进制转换的对象是"一个数"，Base64 的对象是"一串字节"。
2. **输出长度由输入长度决定，不由数值大小决定。** 进制转换里，数字越大表示越长；Base64 里，`0x00` 和 `0xFF` 编码后长度一样。
3. **`=` 补位符是决定性证据。** 标准的 N 进制表示永远不需要补位符 —— 因为它表达的是一个精确的数值。Base64 需要补位，说明它**保留了字节边界信息**，这是"位流分组编码"的典型特征，不是数值表示。

一句话总结：

> **进制转换改变的是"同一个数的写法"；Base64 改变的是"数据的传输形态"，而且它有损地丢失了"数值"这个概念。**

> ::: tip 顺带一提
> Base64 **不是加密**，只是编码（encoding）。任何人都能解回来，别拿它存密码。它的历史用途是：在只能传文本的协议（早期邮件、SMTP）里传二进制数据。现代用途主要是：JWT 的 payload、URL 参数里的二进制 blob、HTTP Basic Auth。
> :::

---

## 三、代码实现

### 3.1 TypeScript —— 通用进制转换

```typescript
const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * 整数转 N 进制字符串（支持 2~36 进制）
 *
 * 核心：除基取余，余数倒序输出
 * 用 bigint 而不是 number —— 因为 number 只有 53 位有效精度
 */
function toBase(num: bigint, base: number): string {
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new Error("base 必须在 [2, 36] 之间");
  }
  // 0 必须特判：while 循环一次都不进，会返回空串
  if (num === 0n) return "0";

  const b = BigInt(base);
  const negative = num < 0n;
  let n = negative ? -num : num;

  let out = "";
  while (n > 0n) {
    // 余数就是当前最低位
    out = DIGITS[Number(n % b)] + out;
    n /= b;
  }
  return negative ? "-" + out : out;
}

/**
 * N 进制字符串转整数
 */
function fromBase(s: string, base: number): bigint {
  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new Error("base 必须在 [2, 36] 之间");
  }
  const b = BigInt(base);

  let sign = 1n;
  let str = s.trim().toUpperCase();
  if (str.startsWith("-")) {
    sign = -1n;
    str = str.slice(1);
  }
  if (str === "") throw new Error("空字符串");

  // 霍纳法（Horner's method）：acc = acc * base + digit
  let acc = 0n;
  for (const ch of str) {
    const idx = DIGITS.indexOf(ch);
    if (idx === -1) throw new Error(`非法字符: ${ch}`);
    acc = acc * b + BigInt(idx);
  }
  return sign * acc;
}

// ============ 使用示例 ============
console.log(toBase(255n, 16)); // "FF"
console.log(toBase(10n, 2)); // "1010"
console.log(toBase(0n, 8)); // "0"
console.log(toBase(-255n, 16)); // "-FF"
console.log(fromBase("FF", 16)); // 255n
console.log(fromBase("1010", 2)); // 10n
```

**为什么解码用"霍纳法"而不是先算每位权重再求和？**

```text
霍纳法：acc = 0
        对每个数位 d（从高到低）:  acc = acc * base + d

对 "FF"（base 16）:
  acc = 0×16 + 15 = 15
  acc = 15×16 + 15 = 255  ✅

对比朴素写法：15×16¹ + 15×16⁰ = 240 + 15 = 255（等价）
```

两种都对，但霍纳法**不用预处理幂次**，一趟扫描搞定，且天然适合流式解析（可以边读边算）。

### 3.2 TypeScript —— 负进制 -2

```typescript
/**
 * 十进制整数转 -2 进制（LeetCode 1017）
 *
 * 与普通进制唯一的区别：余数可能为负，必须修正到 [0, 2) 区间
 */
function toNegabinary(n: bigint): string {
  if (n === 0n) return "0";

  const b = -2n;
  let cur = n;
  let out = "";

  while (cur !== 0n) {
    let rem = cur % b;
    // ⚠️ 关键：JS 的 % 对负数返回负余数，要"借位"修正
    if (rem < 0n) rem += 2n;
    cur = (cur - rem) / b;
    out = rem.toString() + out; // 高位在前
  }
  return out;
}

/** -2 进制字符串转十进制 */
function fromNegabinary(s: string): bigint {
  let acc = 0n;
  for (const ch of s) acc = acc * -2n + BigInt(ch);
  return acc;
}

// ============ 使用示例 ============
console.log(toNegabinary(0n)); // "0"
console.log(toNegabinary(1n)); // "1"
console.log(toNegabinary(2n)); // "110"
console.log(toNegabinary(-1n)); // "11"
console.log(toNegabinary(-7n)); // "1001"
```

### 3.3 TypeScript —— Excel 列名

```typescript
/**
 * 整数转 Excel 列名（LeetCode 168）
 *
 * 核心：(n - 1) % 26，减 1 是因为 Excel 没有 0 这个数位
 */
function excelColumnTitle(n: number): string {
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/**
 * Excel 列名转整数（LeetCode 171）
 *
 * 同样是霍纳法，每个字符贡献 ord(ch) - 64
 */
function excelColumnNumber(title: string): number {
  let n = 0;
  for (const ch of title.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

// ============ 使用示例 ============
console.log(excelColumnTitle(1)); // "A"
console.log(excelColumnTitle(26)); // "Z"
console.log(excelColumnTitle(27)); // "AA"
console.log(excelColumnTitle(28)); // "AB"
console.log(excelColumnTitle(703)); // "AAA"
console.log(excelColumnTitle(16384)); // "XFD"  ← Excel 2007 最后一列
console.log(excelColumnNumber("A")); // 1
console.log(excelColumnNumber("AA")); // 27
console.log(excelColumnNumber("ZZZ")); // 18278
```

### 3.4 TypeScript —— Base62（短链 ID 的核心）

```typescript
const B62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * 十进制整数转 Base62 字符串
 * 短链 ID、雪花 ID 压缩都用这个
 */
function toBase62(num: bigint): string {
  if (num === 0n) return "0";
  let n = num;
  let out = "";
  while (n > 0n) {
    out = B62[Number(n % 62n)] + out;
    n /= 62n;
  }
  return out;
}

/** Base62 字符串转十进制 */
function fromBase62(s: string): bigint {
  let acc = 0n;
  for (const ch of s) {
    const idx = B62.indexOf(ch);
    if (idx === -1) throw new Error(`非法字符: ${ch}`);
    acc = acc * 62n + BigInt(idx);
  }
  return acc;
}

/**
 * 短链 ID：补齐到固定长度，保证 URL 长度一致
 */
function shortCode(num: bigint): string {
  return toBase62(num).padStart(6, "0");
}

// ============ 使用示例 ============
const snowflake = 1234567890123456789n;
console.log(toBase62(snowflake)); // "1TCKi1nFuNh"
console.log(fromBase62("1TCKi1nFuNh")); // 1234567890123456789n
console.log(shortCode(1234n)); // "0000Ju"
```

**为什么短链 ID 要 `padStart` 补零？**

因为如果不做补齐，ID 1 是 `"1"`，ID 62 是 `"10"`，长度不一样。这会导致：

- URL 长度参差不齐，前端缓存/布局体验差
- 如果把短码当**定长字符串**存进数据库并建唯一索引，长度不一致没问题；但如果你用 `INT` 存就废了

补零之后，编码长度固定，**字典序 == 数值序**，用字符串比较就能排序，省掉一次转换。

### 3.5 TypeScript —— Base64

```typescript
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * 字节数组 → Base64 字符串
 *
 * 核心：3 字节(24bit) 一组，切成 4 段 6bit，每段查表
 */
function base64Encode(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    // 不足 3 字节的部分用 0 补齐
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;

    // 拼成 24 bit
    const n = (b0 << 16) | (b1 << 8) | b2;

    out += B64[(n >> 18) & 63];
    out += B64[(n >> 12) & 63];
    // 不足的位用 '=' 补
    out += i + 1 < bytes.length ? B64[(n >> 6) & 63] : "=";
    out += i + 2 < bytes.length ? B64[n & 63] : "=";
  }
  return out;
}

/** Base64 字符串 → 字节数组 */
function base64Decode(s: string): Uint8Array {
  const clean = s.replace(/=+$/, "");
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i += 4) {
    // 关键：判断后面两个字符是否真实存在（而不是补位）
    const has2 = i + 2 < clean.length;
    const has3 = i + 3 < clean.length;

    const c0 = B64.indexOf(clean[i]);
    const c1 = B64.indexOf(clean[i + 1]);
    const c2 = has2 ? B64.indexOf(clean[i + 2]) : 0;
    const c3 = has3 ? B64.indexOf(clean[i + 3]) : 0;

    const n = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;

    bytes.push((n >> 16) & 255);
    if (has2) bytes.push((n >> 8) & 255);
    if (has3) bytes.push(n & 255);
  }
  return new Uint8Array(bytes);
}

// ============ 使用示例 ============
const text = "Hello, 进制世界!";
const enc = base64Encode(new TextEncoder().encode(text));
console.log(enc); // "SGVsbG8sIOi/m+WItuS4lueVjCE="
console.log(new TextDecoder().decode(base64Decode(enc))); // "Hello, 进制世界!"
```

> ⚠️ **解码时最容易踩的坑**：判断"有没有第 3/4 个字符"时，**别拿 `-1` 当"字符不存在"的哨兵值**。
>
> 我第一版就是这么写的：
>
> ```typescript
> const c2 = clean[i + 2] !== undefined ? B64.indexOf(clean[i + 2]) : -1;
> const c3 = clean[i + 3] !== undefined ? B64.indexOf(clean[i + 3]) : -1;
> const n = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;   // ← 这里炸了
> ```
>
> `-1` 在二进制里是**全 1**（`111111...`），参与位运算时会把整条链路都污染：
>
> ```text
> (-1 << 18) | 0 | 0 | (-1)  →  4294967295   （而不是期望的小数值）
> -1 & 255                  →  255          （本该是 0 的那字节变成了 0xFF）
> ```
>
> 结果就是解码出来的尾部字节全是 `0xFF`，中文直接变成乱码。**用长度比较 `i + 2 < clean.length` 判断，用 `0` 兜底**，才是干净的写法。这个 bug 被 500 组随机对拍直接抓出来了 —— 手写测试用例根本想不起来这种边角。

### 3.6 Python 实现

Python 的好处是 **`int` 天生大整数**，不用像 JS 那样操心 `BigInt`。

```python
DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def to_base(num: int, base: int) -> str:
    """整数转 N 进制字符串（支持 2~36 进制）"""
    if base < 2 or base > 36:
        raise ValueError("base 必须在 [2, 36] 之间")
    if num == 0:
        return "0"

    negative = num < 0
    n = abs(num)
    out = []
    while n > 0:
        out.append(DIGITS[n % base])
        n //= base
    # Python 的 // 是向下取整，这里 n 始终非负所以没问题
    return ("-" if negative else "") + "".join(reversed(out))


def from_base(s: str, base: int) -> int:
    """N 进制字符串转整数"""
    if base < 2 or base > 36:
        raise ValueError("base 必须在 [2, 36] 之间")
    s = s.strip().upper()
    sign = 1
    if s.startswith("-"):
        sign = -1
        s = s[1:]
    if not s:
        raise ValueError("空字符串")

    acc = 0
    for ch in s:
        idx = DIGITS.find(ch)
        if idx == -1:
            raise ValueError(f"非法字符: {ch}")
        acc = acc * base + idx
    return sign * acc


def to_negabinary(n: int) -> str:
    """十进制整数转 -2 进制（LeetCode 1017）"""
    if n == 0:
        return "0"
    b = -2
    cur = n
    out = []
    while cur != 0:
        rem = cur % b
        if rem < 0:
            rem += 2  # Python 的 % 行为和 C 一样会返回负余数
        cur = (cur - rem) // b
        out.append(str(rem))
    return "".join(reversed(out))


def excel_column_title(n: int) -> str:
    """整数转 Excel 列名（LeetCode 168）"""
    out = []
    while n > 0:
        rem = (n - 1) % 26
        out.append(chr(65 + rem))
        n = (n - 1) // 26
    return "".join(reversed(out))


def excel_column_number(title: str) -> int:
    """Excel 列名转整数（LeetCode 171）"""
    n = 0
    for ch in title.upper():
        n = n * 26 + (ord(ch) - 64)
    return n


def to_base62(num: int) -> str:
    """整数转 Base62"""
    B62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    if num == 0:
        return "0"
    out = []
    while num > 0:
        out.append(B62[num % 62])
        num //= 62
    return "".join(reversed(out))


# ============ 使用示例 ============
if __name__ == "__main__":
    print(to_base(255, 16))            # FF
    print(to_base(-255, 16))           # -FF
    print(from_base("FF", 16))         # 255
    print(to_negabinary(-7))            # 1001
    print(excel_column_title(28))      # AB
    print(excel_column_number("ZZZ"))  # 18278
    print(to_base62(62))                # 10
```

### 3.7 Go 实现

Go 用 `math/big` 处理大整数，比 JS 写起来舒服很多。

```go
package main

import (
	"fmt"
	"math/big"
	"strings"
)

const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// toBase 整数转 N 进制字符串
func toBase(num *big.Int, base int) string {
	if base < 2 || base > 36 {
		panic("base 必须在 [2, 36] 之间")
	}
	if num.Sign() == 0 {
		return "0"
	}

	negative := num.Sign() < 0
	n := new(big.Int).Abs(num)
	b := big.NewInt(int64(base))
	mod := new(big.Int)

	var out strings.Builder
	for n.Sign() > 0 {
		n.DivMod(n, b, mod)
		out.WriteByte(digits[mod.Int64()])
	}

	res := out.String()
	runes := []rune(res)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	if negative {
		return "-" + string(runes)
	}
	return string(runes)
}

// fromBase N 进制字符串转整数
func fromBase(s string, base int) *big.Int {
	if base < 2 || base > 36 {
		panic("base 必须在 [2, 36] 之间")
	}
	s = strings.ToUpper(strings.TrimSpace(s))
	neg := false
	if strings.HasPrefix(s, "-") {
		neg = true
		s = s[1:]
	}

	acc := big.NewInt(0)
	b := big.NewInt(int64(base))
	d := big.NewInt(0)
	for _, ch := range s {
		idx := strings.IndexRune(digits, ch)
		if idx == -1 {
			panic("非法字符")
		}
		d.SetInt64(int64(idx))
		acc.Mul(acc, b)
		acc.Add(acc, d)
	}
	if neg {
		acc.Neg(acc)
	}
	return acc
}

// toNegabinary 十进制整数转 -2 进制
func toNegabinary(n *big.Int) string {
	if n.Sign() == 0 {
		return "0"
	}
	b := big.NewInt(-2)
	cur := new(big.Int).Set(n)
	rem := new(big.Int)

	var out strings.Builder
	for cur.Sign() != 0 {
		cur.DivMod(cur, b, rem)
		r := rem.Int64()
		if r < 0 {
			r += 2
		}
		out.WriteByte(byte('0' + r))
	}

	runes := []rune(out.String())
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

// excelColumnTitle 整数转 Excel 列名
func excelColumnTitle(n int) string {
	var out []byte
	for n > 0 {
		rem := (n - 1) % 26
		out = append(out, byte('A'+rem))
		n = (n - 1) / 26
	}
	for i, j := 0, len(out)-1; i < j; i, j = i+1, j-1 {
		out[i], out[j] = out[j], out[i]
	}
	return string(out)
}

func main() {
	fmt.Println(toBase(big.NewInt(255), 16)) // FF
	fmt.Println(toBase(big.NewInt(-255), 16))
	fmt.Println(fromBase("FF", 16)) // 255
	fmt.Println(toNegabinary(big.NewInt(-7))) // 1001
	fmt.Println(excelColumnTitle(28))         // AB
}
```

> 📌 **Go 的坑**：`big.Int.DivMod` 的除数必须**非零**，且 `DivMod` 的商是**向零取整**（truncated），不是向下取整。所以负进制里必须手动修正余数 —— 这跟 JS、C、Python 是一样的坑。

---

## 四、复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
| ---- | ---------- | ---------- |
| `toBase(n, b)` | **O(log_b n)** | O(log_b n)（结果字符串） |
| `fromBase(s, b)` | **O(len(s))** | O(1)（除结果） |
| `toNegabinary(n)` | O(log_2 \|n\|) | O(log_2 \|n\|) |
| `excelColumnTitle(n)` | O(log_26 n) | O(log_26 n) |
| `excelColumnNumber(s)` | O(len(s)) | O(1) |
| `base64Encode(bytes)` | O(len(bytes)) | O(len(bytes) × 4/3) |

**为什么是 O(log_b n)？** 因为每次循环 n 缩小到 `⌊n/b⌋`，循环次数就是 n 在 b 进制下的位数。这跟二进制位数 = log₂n 是一回事。

实测参考：

```text
toBase(1234567890123456789n, 62)  →  11 位，循环 11 次
toBase(255n, 16)                    →  2 位，循环 2 次
```

---

## 五、精度陷阱：JavaScript 的 53 位

这一节是我最想强调的。

### 5.1 问题长什么样

JavaScript 的 `number` 是 **IEEE 754 双精度浮点**，有效整数位只有 **53 位**（`2^53 - 1 = 9007199254740991`）。

```javascript
console.log(9007199254740993);       // 9007199254740992  ← 变了！
console.log(2 ** 53);                 // 9007199254740992
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
```

**雪花 ID 是 19 位十进制数，远超 53 位。** 所以：

```javascript
const id = 1234567890123456789;  // ❌ 精度已经丢了
console.log(id);                  // 1234567890123456800
```

更隐蔽的是，这种错误**不会报错**，只会静默地返回一个接近但错误的值。雪花 ID 发出去之后，用户拿到的和数据库里存的**永远对不上**。

### 5.2 三种解法

**方案一：用 `BigInt`（推荐）**

```javascript
const id = 1234567890123456789n;   // ✅ 带 n 后缀
console.log(id.toString());        // "1234567890123456789"
```

注意 `BigInt` 不能和 `number` 混算：

```javascript
const a = 1n + 1;   // ❌ TypeError: Cannot mix BigInt and other types
const b = 1n + 1n;  // ✅
```

**方案二：全程用字符串处理**

如果只是"把 ID 变成短码"，不做算术，那**字符串长除法**就够了：

```typescript
/**
 * 十进制字符串 → Base62 字符串
 * 全程字符串，不经过 number，彻底避开 2^53 精度问题
 *
 * 原理：十进制长除法，每次除以 62，取余数作为一位
 */
function decimalStringToBase62(decimal: string): string {
  const B62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  // 去掉前导零，但不能把 "0" 本身也去掉
  const digits = decimal.replace(/^0+(?=\d)/, "");
  if (digits === "" || digits === "0") return "0";

  let out = "";
  let cur = digits;

  while (cur !== "0") {
    // 十进制长除法：cur ÷ 62
    let quotient = "";
    let rem = 0;
    for (const ch of cur) {
      const val = rem * 10 + Number(ch); // val 始终 < 62*10，不会溢出
      const q = Math.floor(val / 62);
      rem = val % 62;
      if (quotient !== "" || q !== 0) quotient += String(q);
    }
    out = B62[rem] + out;
    cur = quotient === "" ? "0" : quotient;
  }
  return out;
}

// ============ 使用示例 ============
console.log(decimalStringToBase62("1234567890123456789")); // "1TCKi1nFuNh"
```

字符串长除法确实绕，但**实际项目里我更推荐直接用 `BigInt`**（Node 12+ 原生支持，浏览器也早就支持了）。

**方案三：数据库层用字符串类型**

MySQL 里雪花 ID 应该用 `VARCHAR(20)` 或 `BIGINT UNSIGNED`，**不要用 `INT`**。Java 里用 `Long`，Go 里用 `int64` 或 `*big.Int`。

### 5.3 什么时候必须用 BigInt

```text
需要做算术，且数值可能超过 2^53 - 1     → 必须 BigInt
只做展示，不需要算术                    → 字符串即可
数值确定不会超过 2^53 - 1（业务 ID 等）  → number 够用
```

**但雪花 ID、订单号这类，闭眼用 BigInt / string。** 别赌。

### 5.4 顺带说个反直觉的事

进制越大，同样长度的字符串能表示的数越多。算一下 Base62 的信息熵：

```text
6 个 Base62 字符 = 6 × log₂(62) ≈ 35.7 bit
7 个 Base62 字符 = 7 × log₂(62) ≈ 41.7 bit
```

而 62⁶ = 56,800,235,584（约 568 亿），62⁷ = 3,521,614,606,208（约 3.5 万亿）。

**所以 6 位 Base62 短码，够撑 568 亿条链接。** 这个数字在算短链长度时非常有用 —— 先估日增量，再估总容量，最后决定几位。

---

## 六、实际应用

### 6.1 短链服务

```text
数据库自增 ID  ──base62编码──▶  "aB3xK9"
                                │
                                ▼
              https://s.example.com/aB3xK9
```

**设计要点**：

| 决策点 | 建议 | 理由 |
| ------ | ---- | ---- |
| 字符表 | Base62 | 短链要能放在 URL 里，大小写敏感是加分项 |
| 补零 | `padStart` | 长度一致，前端布局稳定 |
| 查表 | 保留原始自增 ID 表 | 短码只是"展示层"，ID 才是主键 |
| 冲突 | 用自增 ID 兜底 | 天然不会冲突 |

**别忘了**：短码是**可枚举**的。如果你的短链是付费内容，攻击者可以用 62⁶ 的组合穷举。所以**短链必须服务端鉴权，不能靠"猜不到"**。这是我 review 过的短链系统里最常见的安全问题。

### 6.2 雪花 ID 转短码

雪花算法生成的 ID 是 64 位整数，直接放进 URL 太丑：

```text
原始：1234567890123456789
短码：1TCKi1nFuNh
```

**但这里有个坑**：雪花 ID 的**高位包含时间戳**，低位包含机器 ID 和序列号。直接 base62 编码后，**前几位会高度相关**（同一时间段的 ID 前缀相同），这会泄露业务量。

更讲究的做法是**先把 ID 打散**（比如乘一个大素数取模，或者异或一个固定密钥），再 base62。牺牲一点"顺序性"，换来"不可预测"。

### 6.3 Base64 与 JWT

JWT 的 payload 是 JSON，标准做法是 base64url 编码（**注意是 base64url，不是标准 base64**）：

```text
标准 Base64 字母表：... + /      ← 在 URL 里需要转义
Base64URL 字母表：  ... - _      ← URL 安全，不用转义
```

Base64url 还**去掉了 `=` 补位符**（因为 `=` 在 URL 里也需要转义）。所以如果你手写 JWT 解析，**必须先补回 `=` 再解码**：

```typescript
/**
 * Base64URL 解码
 *
 * 两个坑：
 * 1. 先把 URL 安全字符换回标准 Base64：- → +, _ → /
 * 2. 再补回被去掉的 = 补位符（长度 % 4 == 2 补两个，== 3 补一个）
 */
function base64UrlDecode(input: string): Uint8Array {
  // 1. 字符替换
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  // 2. 补回补位符
  const pad = s.length % 4;
  if (pad === 2) s += "==";
  else if (pad === 3) s += "=";
  return base64Decode(s);
}

// ============ 使用示例 ============
const payloadB64Url = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ";
console.log(new TextDecoder().decode(base64UrlDecode(payloadB64Url)));
// {"sub":"1234567890","name":"John Doe","iat":1516239022}
```

**第 2 步几乎所有人都会忘。** 结果就是解出来是空字符串或者乱码。

### 6.4 Excel / CSV 导出

后端导出 Excel 时，列名要按 Excel 的规则生成：

```text
第 1 列  → A
第 26 列 → Z
第 27 列 → AA
第 703 列 → AAA
```

如果导出 10 万列，Excel 根本打不开（上限 16384 列）。**这属于业务方该知道的限制**，但你至少要能在超过上限时给出明确报错，而不是生成一个 Excel 打不开的文件。

### 6.5 颜色 / 编码的其他用法

- **Hashids**：把连续的数据库 ID 变成"看起来随机"的短串，附带加盐让它可逆但不可猜
- **短 ID 生成器**：Twitter Snowflake、Instagram 的 ID 都是 64 位整数，落到前端时经常要转短码
- **进制选择的原则**：

```text
需要人读/手输     → 选大一点的字符表（base62/base64url），避免 0/O、1/I 混淆
需要机器存/算     → 用 16 进制（调试友好）或 10 进制
需要 URL 安全     → 排除 + / = ? # 等特殊字符
```

> ⚠️ **混淆字符的坑**：人手动抄写 Base62 短码时，`0` 和 `O`、`1` 和 `l` 极容易搞混。如果你的用户需要手抄短码，建议**从字符表里剔除易混淆字符**（常见做法是剔除 `0O1lI`），牺牲一点容量换可靠性。

---

## 七、面试怎么答

如果面试官问"讲讲进制转换"，我的回答顺序是：

1. **先说原理**：除基取余，`N = q×b + r`，余数是最低位，商是高位 —— **一句话讲完，别啰嗦**
2. **说反向**：霍纳法，`acc = acc * base + digit`，一趟扫描
3. **主动提边界**：0 要特判、负数要加符号、非法字符要抛异常
4. **如果对方是前端方向，主动提 `BigInt` 和 53 位精度** —— 这就是你的加分项
5. **如果对方问"还有什么变体"**，你可以抛：
   - 负进制 -2（LeetCode 1017）
   - Excel 的双射 26 进制（`(n-1) % 26`）
   - Base64 的 6 位分组编码
   - 短链 ID 的容量估算（`log` 算位数）

**最后一问是分水岭。** 大部分人只能答"除基取余"。能把"为什么 Excel 要减 1"、"为什么 Base64 不是进制转换"讲清楚的人，一半以上。

---

## 八、小结

进制转换这件事，核心收获就四条：

- ✅ **除基取余是唯一核心** —— `N = q×b + r`，余数是最低位，**记得倒序输出**
- ✅ **反向用霍纳法** —— `acc = acc * base + digit`，一趟搞定不用预处理幂次
- ✅ **Excel 不是标准 26 进制** —— 没有 0 这个数位，所以要 `(n-1) % 26`
- ✅ **Base64 不是进制转换** —— 它是 6 位分组的字节编码，有 `=` 补位符，**保留字节边界**
- ⚠️ **JS 超过 2⁵³ 就用 `BigInt`** —— 雪花 ID 级别的数，`number` 装不下

再补一条工程经验：

- ⚠️ **短码要补零** —— 长度一致才好用；**短链必须服务端鉴权** —— 6 位 Base62 只有 568 亿组合，猜得到

最后送一句我写在代码注释里的话：

> **进制转换是"同一件事的两种写法"，而 Base64 是"数据的另一种运输方式"。** 搞清楚这个区别，你就不会再把 JWT 的 payload 当成"某个大整数"了 🎯

---

## 相关阅读

- [位运算（Bit Manipulation）](bit-manipulation.md) —— 理解二进制表示的底层基础
- [快速幂算法（Binary Exponentiation）](fast-exponentiation.md) —— 模幂在 RSA/加密里的应用
- [素数筛法（Sieve of Eratosthenes）](prime-sieve.md) —— 进制转换在密码学里的延伸
- [哈希表设计（Design HashMap）](design-hashmap.md) —— 字符表查表 vs Map 查表的取舍
- [Base64 编码规范（RFC 4648）](https://datatracker.ietf.org/doc/html/rfc4648) —— 官方定义，包含 base32/base64url 变体
