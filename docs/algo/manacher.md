---
title: Manacher 算法
description: Manacher（马拉车）算法：O(n) 时间内求出字符串中最长回文子串，四语言实现
date: 2026-07-04 10:00:00
categories:
  - Algorithm
tags:
  - manacher
  - palindrome
  - string
  - interview
sidebarSort: 57
---

# Manacher 算法（马拉车）

面试官甩给你一道题："给定一个字符串 s，找出其中最长的回文子串。"

你可能会说：暴力枚举所有子串，对每个子串判断是否回文，O(n³)。面试官眉头一皱。

你又说：中心扩展法，以每个字符为中心往两边扩，O(n²)。面试官微微点头。

面试官追问：有没有 O(n) 的解法？

这就是 **Manacher 算法** 登场的时候了 —— 它能在 **线性时间 O(n)** 内求出最长回文子串，是字符串处理领域的经典算法。

## 原理拆解

### 什么是回文？

回文就是正着读和反着读完全一样的字符串，比如：

- 单字符：`"a"`, `"b"`
- 奇数长度：`"aba"`, `"abcba"`
- 偶数长度：`"abba"`, `"noon"`

### 中心扩展法的问题

中心扩展法的思路很直观：枚举每个位置作为回文中心，往两边扩，记录最长的那个。

```
字符串 "ababc"，以每个位置为中心扩展：

位置0('a')：   "a" → 长度1
位置1('b')：   "bab" → 长度3（回文！）center=1, r=1, l=1 → 往左1往右2扩
位置2('a')：   "aba" → 长度3
位置3('b')：   "bab" → 长度3
位置4('c')：   "c" → 长度1

最长：长度为3的回文串，有"bab"和"aba"
```

问题在哪？**每次往两边扩时，最坏情况要扩 O(n) 步，n 个中心就是 O(n²)**。而且对于偶数长度的回文（如 "abba"），中心是两个字符之间，枚举起来还要分奇偶讨论，代码容易写乱。

### Manacher 的核心思想

Manacher 的聪明之处在于 —— **利用已经计算过的信息**。

它把原字符串预处理一下，在所有字符之间（包括首尾）插入一个分隔符，把偶数回文也转化成奇数回文来处理：

```
原字符串: "ababbc"
插入 '#':  "#a#b#a#b#b#c#"

这样，任何回文都变成了奇数长度：
  原: "ababa"   → "#a#b#a#b#a#" → 长度 11（奇数）
  原: "abba"    → "#a#b#b#a#"    → 长度 9（奇数）
```

然后引入两个关键变量：

| 变量 | 含义 |
| ---- | ---- |
| `C` (center) | 当前已知的**最右回文**的中心 |
| `R` (right) | `C` 对应的回文能扩展到的最右边界（不含），即 `C + len[C] - 1` |
| `P[i]` | 以预处理后第 `i` 个字符为中心的回文半径（即能向左向右各扩展多少字符，含中心） |

### 核心代码就三行

这是 Manacher 算法最精华的部分：

```typescript
if (i < R) {
    // i 在当前最右回文范围内
    // 利用镜像对称性：P[i] 至少等于 min(P[2*C-i], R-i)
    P[i] = Math.min(P[2 * C - i], R - i);
}
// 然后以 P[i] 为基础继续扩展
while (i - P[i] >= 0 && i + P[i] < s.length && s[i - P[i]] === s[i + P[i]]) {
    P[i]++;
}
```

为什么要取 `min`？来看一个关键例子：

```
字符串: "ababa" 预处理后: "#a#b#a#b#a#"
下标:    0 1 2 3 4 5 6 7 8 9 10

假设当前 C=5（'a'），R=10（最右边界）
已计算好的 P 数组: [1,2,1,4,1,5,...]

现在计算 i=3（P[3]=4，已经很长）：
  i=3 的回文是 "#b#a#b#"，半径为4，能覆盖到 [0,6]
  镜像位置 j = 2*C - i = 2*5 - 3 = 7
  P[7] 应该和 P[3] 相等（对称）

但注意！R=10，当前 i=7 本身的位置已经越过了 R=10 了吗？
  2*C-i = 7，没越 R。但 R-i = 10-7 = 3
  P[7] 理论上是对称过来的 4，但右边界只能到 R=10，
  所以 P[7] 最多只能取 min(4, 3) = 3，再往外扩就是新的了
```

这就是 `Math.min(P[2*C-i], R-i)` 的含义 —— **对称过来的半径不能超过右边界**。

### 图解全过程

以 `"babada"` 为例，一步一步看 Manacher 是怎么算的：

```
原字符串: "b a b a d a"
预处理:   "# b # a # b # a # d # a #"
下标 i:    0 1 2 3 4 5 6 7 8 9 10 11 12

P 数组含义：P[i] = 以 i 为中心能扩展的回文半径（含中心）

i=0:  '#',  P[0]=1      （单个字符）
i=1:  'b',  P[1]=2      → "#b#"  ← 往左右各扩1步
i=2:  '#',  P[2]=1
i=3:  'a',  P[3]=2      → "#a#"
i=4:  '#',  P[4]=1
i=5:  'b',  P[5]=4      → "#b#a#b#"  ← 发现了 "bab"！
       R=9, C=5
i=6:  '#',  P[6]=1
i=7:  'a',  P[7]=2      → "#a#"
i=8:  '#',  P[8]=1
i=9:  'd',  P[9]=2      → "#d#"
i=10: '#',  P[10]=1
i=11: 'a',  P[11]=2     → "#a#"
i=12: '#',  P[12]=1

最大 P[i] = 4，对应 i=5，对应原字符串中下标：
  start = (i - P[i]) / 2 = (5 - 4) / 2 = 0
  end = start + P[i] - 1 = 0 + 4 - 1 = 3
  原字符串 [0,3] = "baba" ← 最短回文串，错了！

等等，让我重新算 start：
  start = (i - P[i]) / 2 = (5 - 4) / 2 = 0.5 ❌ 不对

正确公式：
  start = (i - P[i]) / 2  (预处理串中的中心 i，对应原串的 (i/2) 位置)
  实际原串下标 = Math.floor((i - P[i]) / 2)

i=5, P[5]=4:
  (5 - 4) / 2 = 0.5 → Math.floor = 0

但 "baba" 不是回文... 让我重新手算一下

预处理: "# b # a # b # a # d # a #"
          0 1 2 3 4 5 6 7 8 9 10 11 12

P[1]=2: "#b#" → 覆盖 [0,2]
P[3]=2: "#a#" → 覆盖 [2,4]
P[5]=4: "#b#a#b#" → 覆盖 [2,10] ✓ 正确

原字符串中：
  预处理坐标 2 对应原串 (2/2)=1 即 'a'
  预处理坐标 10 对应原串 (10/2)=5 即 'a'

P[5]=4 对应原串 "aba"：
  原串坐标 = (预处理坐标 - P) / 2 到 (预处理坐标 + P) / 2
  start = (5 - 4) / 2 = 0 (对应 'b')
  end   = (5 + 4) / 2 = 4.5 → 4 (对应 'a')
  实际上原串 "baba" 在 [0,3] 不是回文...

我发现了错误 — P[5]=4 的回文是预处理串 "#b#a#b#"，对应原串 "bab"：
  预处理: # b # a # b #
           0 1 2 3 4 5 6
  中心 5 → '#'
  往左扩 4: 5-4=1 → 'b' ✓  5-3=2 → '#' ✓  5-2=3 → 'a' ✓  5-1=4 → '#' ✓
  往右扩 4: 5+4=9 → 'd' ✗  不对！

重新算 P[5]:
  中心 = 5 = '#'
  P[5] 初始 = 1（自身）
  往左: 5-1=4='#' ✓, 扩到 2
  往右: 5+1=6='#' ✓, 扩到 2
  P[5]=2 继续扩：
  往左: 5-2=3='a' ✓, 扩到 3
  往右: 5+2=7='a' ✓, 扩到 3
  P[5]=3 继续扩：
  往左: 5-3=2='#' ✓, 扩到 4
  往右: 5+3=8='#' ✓, 扩到 4
  P[5]=4 继续扩：
  往左: 5-4=1='b' ✓, 扩到 5
  往右: 5+4=9='d' ✗  失败！

所以 P[5]=4，预处理回文 "#b#a#b#"
对应原串：从预处理坐标 (5-4)/2=0 到 (5+4)/2=4，字符 0='b', 1='a', 2='b', 3='a' = "baba" ✗

等等，预处理串中每个字符前后的 '#' 使得映射复杂了。让我换个更好的例子。

原串 "cbbd"，预处理 "#c#b#b#d#"
          i: 0 1 2 3 4 5 6 7
          c  b  b  d
P[0]=1 "#"       → 原串 ""
P[1]=2 "#c#"     → 原串 "c"
P[2]=1 "#"       → 原串 ""
P[3]=4 "#b#b#"   → 原串 "bb" ✓ 最长！
P[4]=1 "#"       → 原串 ""
P[5]=2 "#b#"     → 原串 "b"
P[6]=1 "#"       → 原串 ""
P[7]=2 "#d#"     → 原串 "d"

原串下标 = i / 2（向下取整）
"P[3]=4" 中心在 i=3（'b'），原串中心 = 3/2 = 1.5 → 1（第二个字符，左边那个）
原串回文 = s[0..1] = "cb"? 不对...

让我用更清晰的例子："abcba"
原串: a b c b a
预处理: # a # b # c # b # a #
下标:  0 1 2 3 4 5 6 7 8 9 10

P[5]=6: "#a#b#c#b#a#" → 原串 "abcba" ✓
start = (5-6)/2 = -0.5 → 0
end   = (5+6)/2 = 5.5 → 5 → s[0..4] = "abcba" ✓

好，我理解了。Manacher 的关键是：
1. P[i] 是半径（含中心）
2. 原串中的回文子串 = s[Math.floor((i-P[i])/2) .. Math.floor((i+P[i]-1)/2)]
```

## 代码实现

### TypeScript

```typescript
/**
 * Manacher 算法 —— TypeScript 实现
 *
 * 核心思路：
 * 1. 预处理字符串，在字符间插入 '#'，统一处理奇偶长度回文
 * 2. 用 P[i] 记录以 i 为中心的回文半径
 * 3. 利用已知的回文信息（对称性）减少重复扩展
 * 4. 最终取 P[i] 最大的位置，反推原字符串中的回文
 */

/**
 * 找出最长回文子串
 * @param s 原字符串
 * @returns 最长回文子串
 */
function longestPalindrome(s: string): string {
  if (s.length === 0) return "";

  // 预处理：插入分隔符，统一成奇数长度
  // "#a#b#c#" 这样的形式，原串每个字符位置都对应预处理串中的奇数位置
  const t = s.split("").join("#");
  const str = `#${t}#`;

  const n = str.length;
  const P: number[] = new Array(n).fill(0);

  // C = center，当前已知最右回文的中心
  // R = right，当前已知最右回文的最右边界（不含）
  let C = 0, R = 0;

  for (let i = 0; i < n; i++) {
    // 关键：利用对称性快速初始化 P[i]
    // i' = 2*C - i 是 i 关于 C 的镜像位置
    if (i < R) {
      // i 在当前最右回文范围内，可以利用对称性
      // R-i 是 i 到右边界的安全距离
      // 2*C-i 是镜像位置的 P 值
      // 取两者中的较小值作为初始半径（保守估计，避免越界）
      P[i] = Math.min(R - i, P[2 * C - i]);
    } else {
      // i 在边界外，只能从 1 开始（自身）
      P[i] = 1;
    }

    // 以 P[i] 为基础，继续往两边扩展
    // 注意：预处理后的字符串中，'#' 本身也可能作为回文中心
    while (i - P[i] >= 0 && i + P[i] < n && str[i - P[i]] === str[i + P[i]]) {
      P[i]++;
    }

    // 如果扩展后右边界超过了当前 R，更新 C 和 R
    if (i + P[i] - 1 > R) {
      C = i;
      R = i + P[i] - 1;
    }
  }

  // 找最大 P[i]
  let maxLen = 0;
  let center = 0;
  for (let i = 0; i < n; i++) {
    if (P[i] > maxLen) {
      maxLen = P[i];
      center = i;
    }
  }

  // 将预处理串中的位置映射回原字符串
  // 预处理串中 '#a#b#c#' 的下标对应：
  //   偶数位置 = '#'，奇数位置 = 原字符
  // 中心在 center，原串起始位置 = (center - P[center] + 1) / 2
  // 解释：预处理串的下标 2k 对应原串下标 k
  // 从预处理坐标 left = center - P[center] + 1 开始（第一个匹配的位置）
  // left 是偶数（#），所以原串起始 = left/2 = (center - P[center] + 1) / 2
  const start = Math.floor((center - maxLen + 1) / 2);
  const end = Math.floor((center + maxLen - 1) / 2);

  return s.slice(start, end);
}

/**
 * Manacher 算法 —— 返回所有回文信息（面试扩展用）
 */
interface PalindromeInfo {
  // 预处理串中的中心位置
  center: number;
  // 预处理串中的半径
  radius: number;
  // 原字符串中的起始位置（闭区间）
  start: number;
  // 原字符串中的结束位置（闭区间）
  end: number;
  // 回文串本身
  palindrome: string;
}

function manacherAll(s: string): PalindromeInfo[] {
  if (s.length === 0) return [];

  const str = `#${s.split("").join("#")}#`;
  const n = str.length;
  const P: number[] = new Array(n).fill(0);

  let C = 0, R = 0;
  for (let i = 0; i < n; i++) {
    if (i < R) {
      P[i] = Math.min(R - i, P[2 * C - i]);
    }
    while (i - P[i] >= 0 && i + P[i] < n && str[i - P[i]] === str[i + P[i]]) {
      P[i]++;
    }
    if (i + P[i] - 1 > R) {
      C = i;
      R = i + P[i] - 1;
    }
  }

  const results: PalindromeInfo[] = [];
  for (let i = 0; i < n; i++) {
    if (P[i] > 1) {
      results.push({
        center: i,
        radius: P[i],
        start: Math.floor((i - P[i] + 1) / 2),
        end: Math.floor((i + P[i] - 1) / 2),
        palindrome: s.slice(
          Math.floor((i - P[i] + 1) / 2),
          Math.floor((i + P[i] - 1) / 2),
        ),
      });
    }
  }

  return results.sort((a, b) => b.palindrome.length - a.palindrome.length);
}

// === 测试 ===
console.log(longestPalindrome("babad"));    // "bab" 或 "aba"
console.log(longestPalindrome("cbbd"));     // "bb"
console.log(longestPalindrome("a"));        // "a"
console.log(longestPalindrome("ac"));       // "a" 或 "c"
console.log(longestPalindrome("abcba"));    // "abcba"

console.log("\n--- 所有回文（按长度降序）---");
const all = manacherAll("ababbc");
console.log(all.map((p) => `"${p.palindrome}" (长度${p.palindrome.length})`));
// ["bb" (长度2), "aba" (长度3), "a" (长度1), "b" (长度1), "b" (长度1), "c" (长度1)]
```

### Go

```go
package manacher

/**
 * Manacher 算法 —— Go 实现
 * 找出字符串中最长的回文子串
 */

// longestPalindrome 返回 s 中的最长回文子串
func longestPalindrome(s string) string {
	if len(s) == 0 {
		return ""
	}

	// 预处理：插入 '#'
	// "#a#b#c#" 统一处理奇偶回文
	t := make([]byte, 0, len(s)*2+1)
	t = append(t, '#')
	for i := 0; i < len(s); i++ {
		t = append(t, s[i], '#')
	}
	str := string(t)

	n := len(str)
	P := make([]int, n)
	C, R := 0, 0

	for i := 0; i < n; i++ {
		// 利用对称性快速初始化
		if i < R {
			// 取镜像位置的 P 值和到边界的距离中的较小值
			mirror := 2*C - i
			if P[mirror] < R-i {
				P[i] = P[mirror]
			} else {
				P[i] = R - i
			}
		} else {
			P[i] = 1
		}

		// 继续扩展
		for i-P[i] >= 0 && i+P[i] < n && str[i-P[i]] == str[i+P[i]] {
			P[i]++
		}

		// 更新最右边界
		if i+P[i]-1 > R {
			C = i
			R = i + P[i] - 1
		}
	}

	// 找最大 P[i]
	maxLen, center := 0, 0
	for i := 0; i < n; i++ {
		if P[i] > maxLen {
			maxLen = P[i]
			center = i
		}
	}

	// 映射回原字符串
	// 预处理串下标 2k 对应原串下标 k
	start := (center - maxLen + 1) / 2
	end := (center + maxLen - 1) / 2

	return s[start:end]
}
```

### Java

```java
public class Manacher {

    /**
     * 找出最长回文子串
     * 时间复杂度: O(n)
     * 空间复杂度: O(n)
     */
    public static String longestPalindrome(String s) {
        if (s == null || s.isEmpty()) {
            return "";
        }

        // 预处理：字符间插入 '#'
        StringBuilder sb = new StringBuilder("#");
        for (char c : s.toCharArray()) {
            sb.append(c).append("#");
        }
        String str = sb.toString();

        int n = str.length();
        int[] P = new int[n];
        int C = 0, R = 0; // center and right boundary

        for (int i = 0; i < n; i++) {
            // 快速初始化
            if (i < R) {
                int mirror = 2 * C - i;
                P[i] = Math.min(R - i, P[mirror]);
            }

            // 扩展
            while (i - P[i] >= 0 && i + P[i] < n && str.charAt(i - P[i]) == str.charAt(i + P[i])) {
                P[i]++;
            }

            // 更新边界
            if (i + P[i] - 1 > R) {
                C = i;
                R = i + P[i] - 1;
            }
        }

        // 找最大半径
        int maxLen = 0, center = 0;
        for (int i = 0; i < n; i++) {
            if (P[i] > maxLen) {
                maxLen = P[i];
                center = i;
            }
        }

        // 映射回原串
        int start = (center - maxLen + 1) / 2;
        int end = (center + maxLen - 1) / 2;
        return s.substring(start, end);
    }

    public static void main(String[] args) {
        System.out.println(longestPalindrome("babad"));  // bab 或 aba
        System.out.println(longestPalindrome("cbbd"));   // bb
        System.out.println(longestPalindrome("abcba")); // abcba
    }
}
```

### Python

```python
"""
Manacher 算法 —— Python 实现
核心思想：预处理 + 对称性优化 + 线性扩展
"""


def longest_palindrome(s: str) -> str:
    """找出 s 中最长的回文子串

    时间复杂度: O(n)
    空间复杂度: O(n)
    """
    if not s:
        return ""

    # 预处理：在字符间插入 '#'，统一成奇数长度
    # "#a#b#a#" 这样，偶数长度的原回文也会变成奇数长度
    # 技巧：用 f"#{'#'.join(s)}#" 可以一行搞定，但效率略低
    t = "#" + "#".join(s) + "#"
    n = len(t)

    P = [0] * n
    C = R = 0  # 当前最右回文的中心和右边界
    max_len = 0
    center = 0

    for i in range(n):
        # === 1. 快速初始化：利用对称性 ===
        if i < R:
            # i' = 2*C - i 是 i 关于 C 的镜像
            # P[i] 至少等于 min(P[i'], R-i)
            #   - P[i']：对称位置已知的回文半径
            #   - R-i：i 到右边界的安全距离
            mirror = 2 * C - i
            P[i] = min(P[mirror], R - i)
        else:
            P[i] = 1

        # === 2. 继续扩展 ===
        while i - P[i] >= 0 and i + P[i] < n and t[i - P[i]] == t[i + P[i]]:
            P[i] += 1

        # === 3. 更新最右边界 ===
        if i + P[i] - 1 > R:
            C = i
            R = i + P[i] - 1

        # 顺便记录最大长度
        if P[i] > max_len:
            max_len = P[i]
            center = i

    # === 4. 映射回原字符串 ===
    # 预处理串下标 2k 对应原串下标 k
    # (center - max_len + 1) 是回文最左端（含中心能扩到的最左预处理坐标）
    # 除以 2 就是原串起始位置
    start = (center - max_len + 1) // 2
    end = (center + max_len - 1) // 2
    return s[start:end]


def manacher_verbose(s: str) -> list[dict]:
    """返回所有回文子串的信息（带调试信息）"""
    if not s:
        return []

    t = "#" + "#".join(s) + "#"
    n = len(t)
    P = [0] * n
    C = R = 0

    for i in range(n):
        if i < R:
            P[i] = min(P[2 * C - i], R - i)
        while i - P[i] >= 0 and i + P[i] < n and t[i - P[i]] == t[i + P[i]]:
            P[i] += 1
        if i + P[i] - 1 > R:
            C = i
            R = i + P[i] - 1

    results = []
    for i in range(n):
        if P[i] > 1:  # 长度 > 1 才是真正的回文子串
            start = (i - P[i] + 1) // 2
            end = (i + P[i] - 1) // 2
            results.append({
                "pre_center": i,
                "radius": P[i],
                "original": s[start:end],
                "start": start,
                "end": end,
                "length": end - start,
            })

    return sorted(results, key=lambda x: x["length"], reverse=True)


if __name__ == "__main__":
    test_cases = [
        "babad",
        "cbbd",
        "abcba",
        "a",
        "ac",
        "ababbc",
    ]

    for s in test_cases:
        result = longest_palindrome(s)
        print(f'"{s}" → longest palindrome: "{result}" (len={len(result)})')

    print("\n--- 所有回文（ababbc）---")
    for p in manacher_verbose("ababbc"):
        print(f'  "{p["original"]}" (pos {p["start"]}-{p["end"]}, len {p["length"]})')
```

## 复杂度分析

| 指标 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 时间 | **O(n)** | 每个位置的扩展最多 O(n)，但由于对称性优化，每个字符最多被"比较"常数次 |
| 空间 | O(n) | 预处理后的字符串 + P 数组 |

### 为什么是 O(n)？

关键在于 `R`（右边界）只会向右移动，最多移动 `n` 步。每个位置 `i` 的扩展最多延伸到 `R`，而 `R` 只会单调递增，不会回退。所以总的时间复杂度是线性的。

## 面试题精选

| 题号 | 题目 | 思路 | 难度 |
| ---- | ---- | ---- | ---- |
| 5 | 最长回文子串 | Manacher 标准题 | 中等 |
| 647 | 回文子串 | 改一下统计逻辑即可 | 中等 |
| 214 | 最短回文串 | Manacher 找最长回文前缀 + KMP | 困难 |
| 1312 | 让字符串成为回文串的最少插入次数 | Manacher + DP | 困难 |
| 1960 | 两个回文子串的最大乘积 | Manacher + 遍历 | 困难 |

**LeetCode 5** 是 Manacher 的入门必刷题。**647. 回文子串** 几乎就是同一个算法 —— 只要把 "最长的" 改成 "统计所有回文子串的数量"：每个 P[i] 对应的回文半径为 r，那么以该位置为中心的回文子串数量就是 r。

## 业务场景

### 1. 生物信息学 —— DNA 序列分析

生物学中，DNA 序列经常需要找反向互补的回文结构（如限制酶切位点）。Manacher 可以在毫秒级处理上百万碱基的 DNA 序列。

### 2. 文本编辑器 —— 括号匹配高亮

编辑器中高亮匹配的括号对，可以用 Manacher 的思路快速找到当前位置的"回文边界"——向左找到最后一个未匹配的 `(`，向右找到第一个 `)`，这就是某种广义回文的边界检测。

### 3. 滚动新闻 / 长文本摘要

快速找出文本中的回文模式（比如诗歌、歌词中的反复句式），可以帮助做文本相似度检测和去重。

### 4. LeetCode 日常 —— 字符串处理题

老实说，Manacher 在实际工程中用得不多（大多数场景用动态规划就够了），但在算法面试中出场率极高，是区分候选人水平的重要标志。

## 小结

Manacher 算法的核心就三步：

1. **预处理**：插入 `#`，统一奇偶回文
2. **对称初始化**：`P[i] = min(P[2C-i], R-i)`
3. **线性扩展 + 更新边界**：R 只增不减，保证 O(n)

模板代码很短，但背后的对称性思想值得细细品味——**利用已知信息避免重复计算**，这是算法优化的通用哲学，和 KMP 的 next 数组有异曲同工之妙。

> 一句话记住：**Manacher = 预处理 + 对称加速 + 右边界不回头** 🚀
