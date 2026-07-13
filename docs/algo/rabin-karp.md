---
title: Rabin-Karp 字符串哈希算法
description: Rabin-Karp 字符串哈希算法详解 —— 用哈希实现高效字符串匹配
date: 2026-07-10 08:00:00
categories:
  - Algorithm
tags:
  - rabin-karp
  - string-hash
  - rolling-hash
  - pattern-matching
sidebarSort: 59
---

# Rabin-Karp 字符串哈希算法（滚动哈希）

你有没有遇到过这种场景：在一个 10 万字的文章里，找出所有包含某个关键词的位置？或者在一堆代码文件里，搜索某个函数名？

最直觉的做法是一个字符一个字符地比对 —— 朴素匹配（Naive String Matching）。但这太慢了，最坏情况要 O(n×m)，n 是文本长度，m 是模式串长度。如果是 10 万字的文章搜一个 1000 字的关键词，用朴素算法可能卡到你怀疑人生。

有没有更聪明的办法？有！**Rabin-Karp** 就是其中之一，它用哈希的思路把字符比对变成整数比对，效率直接起飞 ✈️

## 原理拆解

### 1. 朴素匹配的痛点

先来看看朴素匹配为什么慢：

```typescript
// 朴素字符串匹配 —— 逐字符比对
function naiveSearch(text: string, pattern: string): number[] {
  const result: number[] = [];
  const n = text.length;
  const m = pattern.length;

  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    // 从位置 i 开始，逐个字符比对
    while (j < m && text[i + j] === pattern[j]) {
      j++;
    }
    // 如果完全匹配，记录位置
    if (j === m) {
      result.push(i);
    }
  }
  return result;
}

// 问题在哪？
// 文本: "AAAAAAAAAAAAAAAAAAAAAB"
// 模式: "AAAAAB"
//
// 每次比对都要比较 6 个字符
// 大多数情况下前 5 个都匹配了，第 6 个不匹配
// 白白浪费了大量比较操作
```

假设文本长度 n=10000，模式串长度 m=100，最坏情况要做 **100 万次字符比较**。

### 2. 哈希的降维打击

Rabin-Karp 的核心思想很简单：**如果两个字符串的哈希值相等，那这两个字符串大概率相等**。

> 这里说"大概率"是因为哈希冲突的存在，哈希值相等不代表字符串真的相等，所以最后还需要逐字符验证。

```
文本: "ABABABAB"
模式: "ABA"

朴素匹配：
位置 0: A B A B A B A B   ← 逐字符比对 3 次
位置 1: A B A B A B A B   ← 逐字符比对 3 次
...

Rabin-Karp：
1. 先算出模式的哈希值: hash("ABA") = 1234
2. 依次算出文本每个长度为 3 的子串的哈希值
3. 哈希值相等的，再逐字符验证

文本子串哈希值：
位置 0: hash("ABA") = 1234 ← 与模式哈希相等！验证通过 ✓
位置 1: hash("BAB") = 2345
位置 2: hash("ABA") = 1234 ← 与模式哈希相等！验证通过 ✓
位置 3: hash("BAB") = 2345
...
```

问题来了：**怎么快速算文本每个子串的哈希值？**

### 3. 滚动哈希：O(1) 计算滑动窗口哈希

这是 Rabin-Karp 的精髓！利用数学公式，可以从上一个子串的哈希值，直接算出下一个子串的哈希值：

```
假设哈希函数：hash(s) = s[0]×d^(m-1) + s[1]×d^(m-2) + ... + s[m-1]×d^0
其中 d 是基数（通常选质数，如 31、37）

以文本 "ABAB"、模式 "ABA" 为例：

hash("ABA") = A×d² + B×d¹ + A×d⁰

hash("BAB") = B×d² + A×d¹ + B×d⁰

它们之间的关系：
hash("BAB") = (hash("ABA") - A×d²) × d + B
             ─────────  去掉首字符  ──────── 乘 d补位 ──── 加尾字符
```

```
初始状态：
文本:    A  B  A  B
索引:    0  1  2  3
窗口1: [A, B, A] → hash₁
窗口2:    [B, A, B] → hash₂

滚动公式：
hash₂ = (hash₁ - s[0]×d^(m-1)) × d + s[m]

直观理解：
1. 去掉最左边字符的贡献
2. 把剩下的数字左移一位（乘 d）
3. 加上最右边新字符的值
```

### 4. 取模与哈希冲突

因为哈希值可能很大（比如字符串很长），所以通常会取模：

```typescript
// 取模后的滚动公式
hash2 = ((hash1 - s[0] * pow(d, m-1) % mod + mod) % mod * d + s[m]) % mod;
```

为什么要加 `+mod` 再 `%mod`？因为 `hash1 - s[0] * pow(...)` 可能是负数，负数取模在不同语言里结果不一样，加 `mod` 再取模能保证结果非负。

### 5. 完整流程图解

```
文本: "ABABCABABCAB"
模式: "ABAB"

Step 1: 预处理
├── 计算模式的哈希值: hash(ABAB) = 2083
└── 设定基数 d=31, 模数 mod=1000000007

Step 2: 滑动窗口扫描
        ↓ ←─ 滑动方向
文本: A B A B C A B A B C A B
索引: 0 1 2 3 4 5 6 7 8 9 10 11
      ├─────┤              ← 窗口1: hash=2083 = 模式! 验证✓
          ├─────┤          ← 窗口2: hash=3105 ≠ 模式
              ├─────┤      ← 窗口3: hash=2083 = 模式! 验证✓
                  ├─────┤  ← 窗口4: hash=3105 ≠ 模式
...

Step 3: 验证
        哈希相等的子串，还需要逐字符验证，防止哈希冲突

结果: 在位置 0、4、6、10 找到匹配！
```

## 代码实现

### TypeScript

```typescript
/**
 * Rabin-Karp 字符串匹配算法
 *
 * 核心思想：
 * 1. 用多项式哈希把字符串映射成整数
 * 2. 用滚动哈希 O(1) 计算滑动窗口的哈希值
 * 3. 哈希相等的再用逐字符验证（防止哈希冲突）
 */
class RabinKarp {
  private base: number;      // 基数，通常选质数
  private mod: number;       // 模数，防止整数溢出
  private powBase: number[]; // base^i % mod 的预计算

  constructor(base: number = 31, mod: number = 1_000_000_007) {
    this.base = base;
    this.mod = mod;
    this.powBase = [];
  }

  /**
   * 预计算 base^i % mod，减少重复计算
   * 为什么预计算：避免每次计算幂运算，典型的空间换时间
   */
  private precompute(maxLen: number): void {
    // 确保数组足够长
    while (this.powBase.length <= maxLen) {
      const i = this.powBase.length;
      if (i === 0) {
        this.powBase.push(1);
      } else {
        // base^i = base^(i-1) * base % mod
        this.powBase.push((this.powBase[i - 1] * this.base) % this.mod);
      }
    }
  }

  /**
   * 计算字符串的哈希值
   * hash(s) = s[0]*base^(n-1) + s[1]*base^(n-2) + ... + s[n-1]*base^0
   */
  private hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      // 从左到右累加，类似于把字符串当成 base 进制的数字
      h = (h * this.base + str.charCodeAt(i)) % this.mod;
    }
    return h;
  }

  /**
   * 滚动计算：从旧哈希推出新窗口的哈希
   * 公式：newHash = ((oldHash - oldChar * base^(m-1)) * base + newChar) % mod
   */
  private rollHash(oldHash: number, oldChar: string, newChar: string, patternLen: number): number {
    // 去掉最左边字符的贡献
    let newHash = (oldHash - (oldChar.charCodeAt(0) * this.powBase[patternLen - 1]) % this.mod);
    if (newHash < 0) newHash += this.mod; // 处理负数

    // 乘以 base（相当于左移一位）
    newHash = (newHash * this.base) % this.mod;

    // 加上最右边新字符
    newHash = (newHash + newChar.charCodeAt(0)) % this.mod;

    return newHash;
  }

  /**
   * 搜索所有匹配位置
   *
   * @param text 文本
   * @param pattern 模式串
   * @returns 所有匹配位置的索引数组
   */
  search(text: string, pattern: string): number[] {
    const n = text.length;
    const m = pattern.length;

    if (m > n) return []; // 模式串比文本长，不可能匹配

    // 预计算幂次
    this.precompute(m);

    // 计算模式串的哈希值
    const patternHash = this.hash(pattern);

    // 计算文本第一个窗口的哈希值
    let currentHash = this.hash(text.substring(0, m));

    const result: number[] = [];

    // 依次检查每个窗口
    for (let i = 0; i <= n - m; i++) {
      // 哈希值相等？先假设匹配
      if (currentHash === patternHash) {
        // 逐字符验证，防止哈希冲突
        let j = 0;
        while (j < m && text[i + j] === pattern[j]) {
          j++;
        }
        // 完全匹配才记录
        if (j === m) {
          result.push(i);
        }
      }

      // 计算下一个窗口的哈希值（i 还没到末尾时）
      if (i < n - m) {
        currentHash = this.rollHash(
          currentHash,
          text[i],      // 要移除的字符
          text[i + m],  // 要添加的字符
          m
        );
      }
    }

    return result;
  }

  /**
   * 查找第一个匹配位置
   */
  findFirst(text: string, pattern: string): number {
    const positions = this.search(text, pattern);
    return positions.length > 0 ? positions[0] : -1;
  }
}

// 使用示例
const rk = new RabinKarp();

const text = "ABABABABA";
const pattern = "ABA";

console.log("文本:", text);
console.log("模式:", pattern);
console.log("匹配位置:", rk.search(text, pattern)); // [0, 2, 4, 6]

// 更复杂的例子
const longText = "AAAAAAABAAAAAAAB";
const longPattern = "AAAAB";
console.log("\n长文本匹配:");
console.log("文本:", longText);
console.log("模式:", longPattern);
console.log("匹配位置:", rk.search(longText, longPattern)); // [4, 12]
```

### Python

```python
class RabinKarp:
    """Rabin-Karp 字符串匹配算法 —— Python 实现"""

    def __init__(self, base: int = 31, mod: int = 10**9 + 9):
        self.base = base
        self.mod = mod
        self.power = []  # 预计算的幂次

    def _precompute(self, length: int) -> None:
        """预计算 base^i % mod"""
        while len(self.power) <= length:
            if len(self.power) == 0:
                self.power.append(1)
            else:
                self.power.append((self.power[-1] * self.base) % self.mod)

    def _hash(self, s: str) -> int:
        """计算字符串的哈希值"""
        h = 0
        for ch in s:
            h = (h * self.base + ord(ch)) % self.mod
        return h

    def _roll(self, old_hash: int, out_ch: str, in_ch: str, m: int) -> int:
        """滚动哈希：移除 out_ch，加入 in_ch"""
        # 移除最左边字符的贡献
        new_hash = old_hash - (ord(out_ch) * self.power[m - 1]) % self.mod
        if new_hash < 0:
            new_hash += self.mod

        # 乘 base 左移一位
        new_hash = (new_hash * self.base) % self.mod

        # 加上新字符
        new_hash = (new_hash + ord(in_ch)) % self.mod

        return new_hash

    def search(self, text: str, pattern: str) -> list[int]:
        """搜索所有匹配位置"""
        n, m = len(text), len(pattern)
        if m > n:
            return []

        self._precompute(m)
        pattern_hash = self._hash(pattern)

        # 初始窗口哈希
        current_hash = self._hash(text[:m])

        result = []
        for i in range(n - m + 1):
            # 哈希相等？验证！
            if current_hash == pattern_hash:
                if text[i:i + m] == pattern:  # 逐字符验证
                    result.append(i)

            # 滚动到下一个窗口
            if i < n - m:
                current_hash = self._roll(
                    current_hash,
                    text[i],
                    text[i + m],
                    m
                )

        return result

    def find_first(self, text: str, pattern: str) -> int:
        """找第一个匹配位置"""
        positions = self.search(text, pattern)
        return positions[0] if positions else -1


# 使用示例
if __name__ == "__main__":
    rk = RabinKarp()

    # 基本测试
    text = "ABABABABA"
    pattern = "ABA"
    print(f"文本: {text}")
    print(f"模式: {pattern}")
    print(f"匹配位置: {rk.search(text, pattern)}")  # [0, 2, 4, 6]

    # 多次匹配
    text2 = "AAAAAAAAA"
    pattern2 = "AAA"
    print(f"\n长串测试:")
    print(f"文本: {text2}")
    print(f"模式: {pattern2}")
    print(f"匹配位置: {rk.search(text2, pattern2)}")  # [0, 1, 2, 3, 4, 5, 6]

    # 找第一个
    print(f"第一个匹配位置: {rk.find_first(text2, pattern2)}")  # 0
```

### Go

```go
package rabinkarp

import "fmt"

// RabinKarp 字符串匹配算法
type RabinKarp struct {
	base int64 // 基数
	mod  int64 // 模数
	pow  []int64 // 预计算的幂次
}

// New 创建 Rabin-Karp 实例
func New(base int64, mod int64) *RabinKarp {
	return &RabinKarp{
		base: base,
		mod:  mod,
		pow:  []int64{1}, // pow[0] = 1
	}
}

// precompute 预计算幂次
func (rk *RabinKarp) precompute(length int) {
	for len(rk.pow) <= length {
		n := len(rk.pow)
		rk.pow = append(rk.pow, (rk.pow[n-1]*rk.base)%rk.mod)
	}
}

// hash 计算字符串哈希
func (rk *RabinKarp) hash(s string) int64 {
	var h int64 = 0
	for i := 0; i < len(s); i++ {
		h = (h*rk.base + int64(s[i])) % rk.mod
	}
	return h
}

// roll 滚动哈希
func (rk *RabinKarp) roll(oldHash int64, outChar, inChar byte, m int) int64 {
	// 移除首字符贡献
	newHash := oldHash - (int64(outChar)*rk.pow[m-1])%rk.mod
	if newHash < 0 {
		newHash += rk.mod
	}

	// 左移
	newHash = (newHash * rk.base) % rk.mod

	// 加入新字符
	newHash = (newHash + int64(inChar)) % rk.mod

	return newHash
}

// Search 搜索所有匹配位置
func (rk *RabinKarp) Search(text, pattern string) []int {
	n, m := len(text), len(pattern)
	if m > n {
		return nil
	}

	rk.precompute(m)
	patternHash := rk.hash(pattern)
	currentHash := rk.hash(text[:m])

	var result []int
	for i := 0; i <= n-m; i++ {
		// 哈希相等？验证！
		if currentHash == patternHash {
			match := true
			for j := 0; j < m; j++ {
				if text[i+j] != pattern[j] {
					match = false
					break
				}
			}
			if match {
				result = append(result, i)
			}
		}

		// 滚动到下一个窗口
		if i < n-m {
			currentHash = rk.roll(currentHash, text[i], text[i+m], m)
		}
	}

	return result
}

// FindFirst 找第一个匹配
func (rk *RabinKarp) FindFirst(text, pattern string) int {
	positions := rk.Search(text, pattern)
	if len(positions) == 0 {
		return -1
	}
	return positions[0]
}

// 使用示例
func Example() {
	rk := New(31, 1_000_000_007)

	text := "ABABABABA"
	pattern := "ABA"

	positions := rk.Search(text, pattern)
	fmt.Printf("文本: %s\n", text)
	fmt.Printf("模式: %s\n", pattern)
	fmt.Printf("匹配位置: %v\n", positions) // [0 2 4 6]
}
```

## 进阶应用

### 1. 多模式匹配：Rabin-Karp + 分桶

传统的 Rabin-Karp 是单模式匹配，但稍微改造一下就可以支持多模式：

```typescript
/**
 * 多模式 Rabin-Karp
 * 思路：把所有模式串分组，按哈希值分桶
 * 文本哈希落在哪个桶，就只验证那个桶里的模式串
 */
class MultiPatternRabinKarp {
  private rk: RabinKarp;
  private buckets: Map<number, string[]>; // 按哈希值分桶

  constructor(patterns: string[]) {
    this.rk = new RabinKarp();
    this.buckets = new Map();

    // 把相同哈希值的模式串放一个桶里
    for (const p of patterns) {
      const h = this.rk.hash(p); // 这里用简化版
      if (!this.buckets.has(h)) {
        this.buckets.set(h, []);
      }
      this.buckets.get(h)!.push(p);
    }
  }

  search(text: string): Map<string, number[]> {
    const results = new Map<string, number[]>();

    for (const [hash, patterns] of this.buckets) {
      // 只需要验证这个哈希值对应的模式串
      // 这里简化了，实际需要遍历文本的每个窗口
      for (const p of patterns) {
        const positions = this.rk.search(text, p);
        if (positions.length > 0) {
          results.set(p, positions);
        }
      }
    }

    return results;
  }
}
```

### 2. 字符串相似度检测：滚动哈希的另一个妙用

Rabin-Karp 的滚动哈希还可以用来检测字符串的相似度：

```typescript
/**
 * 用滚动哈希检测字符串相似度
 * 思路：把字符串分成 k 段，计算每段的哈希值
 * 如果两个字符串的段落哈希有超过 threshold% 相同，就认为相似
 */
function similarityWithRollingHash(s1: string, s2: string, k: number = 3, threshold: number = 0.6): boolean {
  const rk = new RabinKarp();

  // 把 s1 分成 k 段
  const segmentLen = Math.ceil(s1.length / k);
  const s1Segments = new Set<number>();

  for (let i = 0; i < k; i++) {
    const start = i * segmentLen;
    const end = Math.min(start + segmentLen, s1.length);
    s1Segments.add(rk.hash(s1.substring(start, end)));
  }

  // 检查 s2 的每段是否在 s1 的段集合中
  let matchCount = 0;
  for (let i = 0; i < k; i++) {
    const start = i * segmentLen;
    const end = Math.min(start + segmentLen, s2.length);
    if (s1Segments.has(rk.hash(s2.substring(start, end)))) {
      matchCount++;
    }
  }

  return matchCount / k >= threshold;
}
```

### 3. 论文查重系统

Rabin-Karp 的变体广泛应用于论文查重：

```
原文: "This is a sample text for plagiarism detection."
参考库: ["This is a sample.", "Plagiarism detection is important.", ...]

1. 把原文分成句子
2. 对每个句子计算哈希
3. 查找参考库中哈希匹配的句子
4. 对匹配句子做更细粒度的比较（词语级别的编辑距离）
```

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 | 说明 |
|------|-----------|------------|------|
| 预处理 | O(m) | O(m) | 计算模式串哈希和幂次预计算 |
| 搜索（平均） | O(n + m) | O(1) | 滚动哈希 O(1)，总 O(n) |
| 最坏情况 | O(n×m) | O(1) | 每次哈希都冲突，需要逐字符验证 |

**关键点解释：**

- **预处理 O(m)**：计算模式串哈希值，以及 `base^i % mod` 的预计算
- **搜索平均 O(n)**：每个窗口的哈希值 O(1) 算出，总共 n-m+1 个窗口
- **最坏 O(n×m)**：当哈希冲突非常严重时（比如模式串全是 'A'，文本也是 'AAAA...'），每次都要逐字符验证

**如何避免最坏情况？**

1. **选择好的模数**：用大质数（如 2^61-1 用位运算实现），减少冲突
2. **双哈希**：同时用两组 (base, mod)，两个哈希都相等才验证，冲突概率从 1/m 降到 1/m²
3. **随机化 base**：每次运行时随机选 base，让对手无法构造最坏情况

## 业务场景

### 1. 论文查重 / 代码相似度检测

高校的论文查重系统、程序员的代码相似度检测（如检测抄袭作业）：

- 将代码按行或按函数分块
- 用 Rabin-Karp 快速找出相同或相似的代码段
- 再用更精确的算法（如编辑距离）计算相似度百分比

### 2. 病毒特征码匹配

杀毒软件扫描文件时：

- 病毒的二进制特征是固定的字节序列
- 用 Rabin-Karp 在文件二进制流中搜索特征码
- 比朴素匹配快很多，特别适合大文件扫描

### 3. DNA 序列比对

生物信息学中：

- DNA 序列可以编码成字符串（A, C, G, T）
- 在庞大的 DNA 数据库中搜索特定模式
- Rabin-Karp 的滚动哈希特别适合这种连续数据的模式匹配

### 4. 拼写检查 / 模糊搜索

搜索引擎的拼写纠错：

- 用户输入 "algoritm"
- 用 Rabin-Karp 在词典中快速找出编辑距离 <= 2 的词
- 虽然不是直接匹配，但结合编辑距离算法可以高效实现

### 5. 日志分析 / 大数据grep

在海量日志文件中搜索关键词：

- 日志通常是结构化的文本流
- Rabin-Karp 比传统的 grep（BM算法）更简单，易于实现和定制
- 可以结合多模式匹配，同时搜索多个关键词

## 小结

Rabin-Karp 是一种**基于哈希的字符串匹配算法**，核心思想是把字符比较变成整数比较：

- 🎯 **核心思想**：用多项式哈希把字符串映射成整数，相同哈希的子串再做逐字符验证
- 🔄 **滚动哈希**：利用数学公式，从上一个窗口的哈希 O(1) 推出下一个窗口的哈希
- ⚡ **平均 O(n+m)**：比朴素匹配的 O(n×m) 快很多，特别适合长文本搜索
- ⚠️ **哈希冲突**：无法完全避免，需要在哈希相等时做逐字符验证

**什么时候用 Rabin-Karp？**

- ✅ 文本很长（10KB+），模式串中等长度（100-10000 字符）
- ✅ 需要多次在同一个文本中搜索不同模式
- ✅ 需要同时搜索多个模式（多模式变体）
- ✅ 对实现简单性有要求（比 KMP、BM 容易理解）

**什么时候不用？**

- ❌ 模式串很短（10 个字符以内），直接朴素匹配可能更快
- ❌ 极度追求最坏情况性能，用 KMP 或 Boyer-Moore 更稳妥
- ❌ 需要找最长匹配，Rabin-Karp 适合找所有匹配

Rabin-Karp 的价值不仅在于它本身的实用，更在于它展示了**哈希思维**在算法中的应用 —— 用随机性和空间换时间，是算法设计中非常优雅的思路。理解了这个，以后遇到"连续子串"的统计问题，都可以尝试用滚动哈希来优化！🚀
