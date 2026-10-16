---
title: 数位 DP（Digit DP）
description: 数位 DP —— 把"区间内满足数位性质的数字个数"问题一网打尽，从模板到 LeetCode 233/600/1012 真题串讲
date: 2026-10-14 09:01:21
categories:
  - Algorithm
tags:
  - digit-dp
  - dynamic-programming
  - leetcode
sidebarSort: 100
---

# 数位 DP（Digit DP）

想象这样一个场景：你的老板突然扔过来一个需求——"统计 2024 年所有用户交易订单号里，**数字 1 出现的总次数**"。你打开数据库一看，单号从 `0000001` 到 `9999999`，瞬间 1000 万条。直接 `for` 循环遍历？天真，当范围变成 `[1, 10^12]` 时，你电脑能跑到下辈子。

再换个题目："统计 `[1, n]` 之间，**二进制表示中不含连续两个 1** 的正整数有多少个"。或者："统计 `[1, n]` 之间，**至少有一位数字重复** 的数字有多少个"。

这类问题的共同特征是：**给一个数字 n，问 [1, n] 区间内满足某种"数位相关性质"的数字个数**（再求差就能扩展到任意区间）。暴力遍历会 TLE，普通的数学技巧又不好想——这就是**数位 DP** 出场的时刻 ✨。

数位 DP 不是什么新发明的算法，它就是**在数字的每一位上做动态规划**，配合"是否贴上界"的状态剪枝，把 O(n) 的遍历变成 O(位数 × 状态数)，把 10^12 的问题降到 10^4 量级。

## 原理拆解

### 1. 为什么需要数位 DP？

最朴素的做法：写一个 `for (let i = 1; i <= n; i++)`，判断每个数是否满足条件。n = 10^12 时，这个循环能跑到天荒地老。

我们观察一下数字 `n = 5316`。它的每一位可以拆成：

```
千位: 5
百位: 3
十位: 1
个位: 6
```

如果我们能**从高位到低位逐位填数字**，并且在每一步记录"前面已经填了什么"，那么到第 4 位填完时，所有 1-5316 之间的数都被枚举了一遍。这种"按位枚举"的方式，本质上就是多叉树的遍历——而 DP 正是树的剪枝利器。

### 2. 数位 DP 的核心思想

把数字 `n` 拆成一个数组 `digits = [5, 3, 1, 6]`，然后从第 0 位开始 DFS，每一步决定"这一位填几"。两个关键状态：

| 状态 | 含义 | 取值 |
| ---- | ---- | ---- |
| `pos`   | 当前处理到第几位 | 0 到 digits.length |
| `tight` | 前缀是否紧贴 n 的前缀 | true / false |

**为什么需要 `tight`？** 因为如果前面几位已经"小于"了 n 的前缀，那后面每一位都可以从 0 填到 9，非常自由。但如果前面几位严格等于 n 的前缀，那当前位置最多只能填到 `digits[pos]`。这两个分支的转移方式完全不同，所以必须分开存。

```
n = 5316
要枚举 1 ~ 5316 的所有数

第0位（千位）：
  紧贴 n：d ∈ [0, 5]  （填 6 就会爆）
  已松绑：d ∈ [0, 9]  （只有填 5 才需要紧贴）

第1位（百位）：
  若第0位填 < 5（松绑）：百位随便 0~9
  若第0位填 5（仍紧贴）：百位只能 0~3
```

### 3. 模板代码

几乎所有的数位 DP 都可以套这个模板：

```typescript
/**
 * 数位 DP 通用模板
 * 求解：count(n) = 满足条件的数在 [1, n] 中的个数
 */
function digitDP(n: number, isValid: (state: any) => boolean, update: (state: any, digit: number) => any, initState: any): number {
  const digits = String(n).split('').map(Number);
  const memo = new Map<string, number>();

  function dfs(pos: number, tight: boolean, state: any, leadingZero: boolean): number {
    // 递归终止：所有位都填完了
    if (pos === digits.length) {
      // 一个完整的数已经形成，看它是否符合条件
      return isValid(state) ? 1 : 0;
    }

    // 记忆化：松绑状态下（tight=false）才缓存，紧贴状态下不能缓存
    // 为什么紧贴状态不能缓存？因为 pos 的范围依赖 n，不同 n 紧贴位置不同
    const key = `${pos}|${state}|${leadingZero}`;
    if (!tight && !leadingZero && memo.has(key)) {
      return memo.get(key)!;
    }

    let res = 0;
    const limit = tight ? digits[pos] : 9;

    for (let d = 0; d <= limit; d++) {
      const nextTight = tight && d === limit;
      const nextLeadingZero = leadingZero && d === 0;
      const nextState = nextLeadingZero ? state : update(state, d);
      res += dfs(pos + 1, nextTight, nextState, nextLeadingZero);
    }

    if (!tight && !leadingZero) memo.set(key, res);
    return res;
  }

  // 注意：从最高位开始，且一开始是"紧贴"状态
  return dfs(0, true, initState, true);
}
```

### 4. 关键状态：除 tight 外的题目相关变量

`tight` 和 `pos` 是几乎所有数位 DP 都有的，但**真正决定题目变化的是第三个状态**。举几个例子：

| 题目 | 第三个状态 | 状态值 |
| ---- | ---------- | ------ |
| 数字 1 的个数（LeetCode 233） | 当前已经数了多少个 1 | `count` |
| 不含连续 1（LeetCode 600） | 上一位是否是 1 | `prevIsOne` |
| 至少有 1 位重复（LeetCode 1012） | 已使用过的数字位图 | `bitmask` |
| 最大为 N 的数字组合（LeetCode 902） | 已使用的数字集合 | `used` |

状态设计是数位 DP 最核心的部分。**一个好的状态应该满足两点**：

1. **够用**：能从初始状态一路推到 `isValid` 判断
2. **够小**：状态空间越小，DP 越快（10 × 状态数就是总时间）

### 5. 图解递归树

以 `n = 123` 为例，求 `[1, 123]` 中所有数字"数字 1 出现次数之和"：

```
                    dfs(0, tight=T, count=0, lead=T)
                    │
       ┌────────────┼────────────┬────────────┐
       │            │            │            │
    d=0           d=1         d=2..9       (继续递归...)
   (lead→F)    (lead→F)
       │            │
  dfs(1,T,F,0)  dfs(1,T,F,1)
       │            │
  ┌────┼────┐      ┌────┼────┐
  0    1..9  2..9  0    1    2
       ...       (紧贴,只能填0~2)

关键点：当 d=0, lead=T 时，下一层的 lead 仍为 T（说明还在前导零阶段）
       当 d≠0, lead=T 时，下一层的 lead 变 F（开始"真正"的数字）
```

记忆化发挥作用的地方：所有 `tight=F` 的分支，下一次再遇到同样的 `pos + count`，可以直接返回结果，不用再算一次。

## 代码实现

### TypeScript：LeetCode 233 数字 1 的个数

**问题**：给定一个整数 `n`，计算所有小于等于 `n` 的非负整数中数字 1 出现的次数。

```typescript
/**
 * LeetCode 233: 数字 1 的个数
 * 思路：数位 DP，每一位上维护"已经数过多少个 1"
 */
function countDigitOne(n: number): number {
  if (n < 0) return 0;
  const digits = String(n).split('').map(Number);
  const memo = new Map<string, number>();

  // dfs 返回值：在当前状态下，从这一位开始能"新增"的 1 的个数
  function dfs(pos: number, tight: boolean, count: number, leadingZero: boolean): number {
    if (pos === digits.length) {
      // 所有位都填完了，"新增"的 1 就是前面累计的 count
      return count;
    }

    const key = `${pos}|${count}`;
    if (!tight && memo.has(key)) {
      return memo.get(key)!;
    }

    let res = 0;
    const limit = tight ? digits[pos] : 9;

    for (let d = 0; d <= limit; d++) {
      const nextTight = tight && (d === limit);
      const nextLeadingZero = leadingZero && (d === 0);
      // 关键：只有在"非前导零"时才累计 1 的个数
      // 为什么这样设计：前导零不算数，0001 不算"有 4 位"
      const nextCount = nextLeadingZero ? count : count + (d === 1 ? 1 : 0);
      res += dfs(pos + 1, nextTight, nextCount, nextLeadingZero);
    }

    if (!tight) memo.set(key, res);
    return res;
  }

  return dfs(0, true, 0, true);
}

// 验证
console.log(countDigitOne(13));  // 6  （1,10,11,12,13 各有一个 1，加 11 那个，共 6 个）
console.log(countDigitOne(0));   // 0
```

### TypeScript：LeetCode 600 不含连续 1 的非负整数

**问题**：给定正整数 `n`，求 `[0, n]` 中二进制表示中**不含连续两个 1** 的数的个数。

```typescript
/**
 * LeetCode 600: 不含连续 1 的非负整数
 * 状态：上一位是否是 1（用来约束"不能连续两个 1"）
 */
function findIntegers(n: number): number {
  const binaryDigits = n.toString(2).split('').map(Number);
  const memo = new Map<string, number>();

  function dfs(pos: number, tight: boolean, prevIsOne: boolean): number {
    if (pos === binaryDigits.length) {
      return 1; // 构造出一个合法数，计数 +1
    }

    const key = `${pos}|${prevIsOne}`;
    if (!tight && memo.has(key)) {
      return memo.get(key)!;
    }

    let res = 0;
    const limit = tight ? binaryDigits[pos] : 1;

    for (let d = 0; d <= limit; d++) {
      // 核心约束：如果上一位是 1，那这一位就不能填 1
      if (prevIsOne && d === 1) continue;

      const nextTight = tight && (d === limit);
      const nextPrevIsOne = (d === 1);
      res += dfs(pos + 1, nextTight, nextPrevIsOne);
    }

    if (!tight) memo.set(key, res);
    return res;
  }

  return dfs(0, true, false);
}

// 验证：5 的二进制是 101，区间 [0,5] 中合法的有 0,1,10,11(不合法),100,101 → 5 个
console.log(findIntegers(5)); // 5
```

### TypeScript：LeetCode 1012 至少有 1 位重复的数字

**问题**：给定 `n`，求 `[1, n]` 中**至少有 1 位数字重复出现**的正整数的个数。

```typescript
/**
 * LeetCode 1012: 至少有 1 位重复的数字
 * 状态：用 10 位 bitmask 表示"哪些数字已经出现过"
 * 这是数位 DP 里比较经典的"位图状态"用法
 */
function numDupDigitsAtMostN(n: number): number {
  const digits = String(n).split('').map(Number);
  const memo = new Map<string, number>();

  // dfs 返回：合法且各位数字都不重复的数有几个
  function dfs(pos: number, tight: boolean, used: number, leadingZero: boolean): number {
    if (pos === digits.length) {
      // 所有位都填完了。一个"全前导零"也算合法的 0（题目要求正整数，不影响）
      return 1;
    }

    const key = `${pos}|${used}|${leadingZero}`;
    if (!tight && memo.has(key)) {
      return memo.get(key)!;
    }

    let res = 0;
    const limit = tight ? digits[pos] : 9;

    for (let d = 0; d <= limit; d++) {
      const nextLeadingZero = leadingZero && (d === 0);
      // 前导零阶段：used 不变，d 不参与去重判断
      if (nextLeadingZero) {
        res += dfs(pos + 1, tight && (d === limit), used, true);
        continue;
      }

      // 已经填过的数字不能再用
      if ((used >> d) & 1) continue;

      const nextTight = tight && (d === limit);
      const nextUsed = used | (1 << d);
      res += dfs(pos + 1, nextTight, nextUsed, false);
    }

    if (!tight) memo.set(key, res);
    return res;
  }

  // 减去"全是 0"那个边界值
  const total = dfs(0, true, 0, true);
  return n - (total - 1); // n+1 总数 - 不重复的数 = 至少重复 1 个的数
}
```

### Python：另一种风格的迭代写法

如果你觉得递归太绕，**自底向上的迭代写法**也是可以的。Python 版本：

```python
def count_digit_one(n: int) -> int:
    """LeetCode 233 Python 迭代版"""
    if n < 0:
        return 0
    s = str(n)
    # dp[i][count] = 处理到第 i 位、累计 count 个 1、松绑状态下的解
    # 状态维度：位数 × 累计的 1 的个数（最多 i 个）
    length = len(s)
    dp = [[0] * (length + 1) for _ in range(length + 1)]
    dp[0][0] = 1  # 边界：0 位，0 个 1

    for pos in range(length):
        # 处理每一位，先看紧贴状态
        cur_digit = int(s[pos])
        for cnt in range(pos + 1):
            # 第 pos 位填 d = cur_digit（紧贴）
            if cnt <= pos + 1:
                dp[pos + 1][cnt + (1 if cur_digit == 1 else 0)] += dp[pos][cnt]
            # 第 pos 位填 d < cur_digit（松绑）
            for d in range(cur_digit):
                dp[pos + 1][cnt + (1 if d == 1 else 0)] += dp[pos][cnt]

    # 求和：所有 cnt 的 dp[length][cnt]
    return sum(dp[length])


# 验证
print(count_digit_one(13))  # 6
```

> 实际工程里更常用递归 + 记忆化，因为代码量小、好理解；迭代版适合面试白板上硬写，避免栈深。

### Go：并发安全版

实际生产中，`n` 可能跨线程访问。我们用一个 sync.Map 来做记忆化：

```go
package digitdp

import (
	"fmt"
	"strconv"
	"sync"
)

// CountDigitOne 求解 LeetCode 233: 数字 1 的个数
// 用 sync.Map 做记忆化，并发安全
func CountDigitOne(n int64) int64 {
	if n < 0 {
		return 0
	}
	s := strconv.FormatInt(n, 10)
	digits := make([]int, len(s))
	for i, c := range s {
		digits[i] = int(c - '0')
	}

	var memo sync.Map // key: string, value: int64

	var dfs func(pos int, tight bool, count int64) int64
	dfs = func(pos int, tight bool, count int64) int64 {
		if pos == len(digits) {
			return count
		}

		key := fmt.Sprintf("%d|%d|%v", pos, count, tight)
		// 只有松绑状态才缓存
		if !tight {
			if v, ok := memo.Load(key); ok {
				return v.(int64)
			}
		}

		var res int64
		limit := 9
		if tight {
			limit = digits[pos]
		}

		for d := 0; d <= limit; d++ {
			nextTight := tight && d == limit
			nextCount := count
			if d == 1 {
				nextCount++
			}
			res += dfs(pos+1, nextTight, nextCount)
		}

		if !tight {
			memo.Store(key, res)
		}
		return res
	}

	return dfs(0, true, 0)
}
```

### Java：POJO 风格

```java
import java.util.HashMap;
import java.util.Map;

/**
 * LeetCode 233: 数字 1 的个数 —— Java 完整实现
 */
public class DigitDP233 {

    private int[] digits;
    private Map<String, Long> memo = new HashMap<>();

    public long countDigitOne(int n) {
        if (n < 0) return 0;
        digits = String.valueOf(n).chars().map(c -> c - '0').toArray();
        return dfs(0, true, 0);
    }

    private long dfs(int pos, boolean tight, long count) {
        if (pos == digits.length) {
            return count;
        }
        String key = pos + "|" + count + "|" + tight;
        if (!tight && memo.containsKey(key)) {
            return memo.get(key);
        }

        long res = 0;
        int limit = tight ? digits[pos] : 9;

        for (int d = 0; d <= limit; d++) {
            boolean nextTight = tight && d == limit;
            long nextCount = count + (d == 1 ? 1 : 0);
            res += dfs(pos + 1, nextTight, nextCount);
        }

        if (!tight) memo.put(key, res);
        return res;
    }

    // 测试
    public static void main(String[] args) {
        DigitDP233 solver = new DigitDP233();
        System.out.println(solver.countDigitOne(13));  // 6
        System.out.println(solver.countDigitOne(0));   // 0
    }
}
```

## 复杂度分析

设 `L = digits.length`（即 n 的十进制位数），`S` 为题目相关的状态数（比如 LeetCode 1012 的位图状态最多 2^10 = 1024 种）。

| 指标 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 时间 | O(L × S × 10) | 每一位、每个状态、每位最多尝试 10 个 digit |
| 空间 | O(L × S) | 记忆化表 + 递归栈 |

具体到几道题：

- **LeetCode 233**：状态只有 `count`（最多 L 个），所以 O(L² × 10)，n = 10^12 时大约 10^3 量级。
- **LeetCode 600**：状态 `prevIsOne` 只有 2 种，O(L × 20)，飞快。
- **LeetCode 1012**：位图状态最多 2^10 = 1024 种，O(L × 1024 × 10)，在 L=10 时大约 10^5，依然是毫秒级。

**为什么紧贴状态不能记忆化？** 因为紧贴状态依赖 `n`。比如 `n = 5316` 和 `n = 6321` 在紧贴 `tight=true` 时的递归结果完全不同，所以不能共用。松绑状态下 `tight=false`，意味着前缀已经比 n 小了，后面的位都是 0~9 自由填，跟 n 没关系，**这才能缓存**。

## 实战技巧

### 1. 前导零的坑

很多人写数位 DP 翻车就翻在前导零上。`000123` 和 `123` 是同一个数，但如果你不区分，会重复计数或者多算位数。

```typescript
// 推荐写法：用 leadingZero 标记
const nextLeadingZero = leadingZero && (d === 0);
// 只有结束前导零之后才累计"有意义的状态"
const nextCount = nextLeadingZero ? count : count + (d === 1 ? 1 : 0);
```

### 2. 区间 [L, R] 的处理

数位 DP 通常求 `[1, R]`。要算 `[L, R]`，用**容斥**：

```
count(L, R) = count(1, R) - count(1, L - 1)
```

所以把模板写成 `count(n)`，外面再套一层减法即可。

### 3. 状态设计的"够小"原则

比如 LeetCode 1012，理论上"已使用过的数字"需要记录"是哪些数字用过"，所以用位图。但 10 个数字就是 2^10 = 1024 种状态——这是合理的。如果题目涉及 26 个字母，那位图就 2^26 = 6700 万种，DP 反而变慢了。这时就要思考**能不能用更小的状态**（比如"已使用字母的数量"）。

### 4. 调试技巧

数位 DP 经常"算多"或"算少"。最快的调试方式是：

```typescript
// 拿暴力版本对比小数据
function bruteForce(n: number): number {
  let cnt = 0;
  for (let i = 1; i <= n; i++) {
    // 检查每个数是否满足题目条件
    cnt++;
  }
  return cnt;
}

// n=100 时对比
for (let n = 1; n <= 100; n++) {
  const dp = countDigitOne(n);
  const bf = bruteForce(n);
  if (dp !== bf) {
    console.log(`n=${n}: dp=${dp}, brute=${bf}`);
  }
}
```

## 业务场景

### 1. 银行账号、订单号审计

银行要统计所有订单号里"数字 0 出现的总次数"、"数字 6 出现的总次数"，用来评估密码强度策略。这本质就是数位 DP 的批量版本——遍历不同 `n` 的上界。

### 2. 验证码防爆破

设计 6 位数字验证码，要预估"有多少种可能包含至少一个连续重复"。这就是 LeetCode 1012 的同款问题——业务上能用数位 DP 在毫秒级算出答案，避开暴力遍历 10^6 种组合。

### 3. 数字锁密码生成器

有些安全系统需要生成"不含连续 4 位升序"的 PIN 码（比如 1234、2345 容易被猜）。用数位 DP 可以精确算出"满足规则的 6 位 PIN 码有多少个"，决定 PIN 码空间大小。

### 4. 数据脱敏验证

脱敏系统要把身份证号里所有数字替换成 `*`，但要保证"原来包含 8 的身份证号有多少"以评估覆盖率。这种"区间内满足某数位性质的数字计数"场景，全是数位 DP 的菜。

## 小结

数位 DP 不是一个新算法，**它就是"按位枚举 + 记忆化"**：

- ✅ **万能模板**：`dfs(pos, tight, state, leadingZero)`，掌握这个就能套大部分题
- ✅ **极高效率**：O(位数 × 状态数 × 10)，把 10^12 问题降到 10^5 以内
- ✅ **题型稳定**：面试高频、LeetCode 上有专门的题单（233、600、902、1012、1067 等）
- ❌ **状态设计靠经验**：模板好写，但怎么抽象出"最小够用"的状态需要刷题积累
- ❌ **容易在前导零上翻车**：边界条件多，要靠小数据暴力对比验证

一句话总结：**遇到"区间 [L, R] 内满足某种数位性质的数字个数"类题目，第一反应就应该是数位 DP**。把模板背下来，遇到具体题再设计状态变量，剩下的就是递归和记忆化的体力活了 🎯

下次遇到 LeetCode 233、600、1012 之类的题，直接套这个模板，秒杀。
