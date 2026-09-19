---
title: 后缀自动机（Suffix Automaton）
description: 后缀自动机（SAM）详解：endpos 集合、link 树、增量构建 O(n)、不同子串计数、最长公共子串与多串匹配，TypeScript/Python 多语言实现
date: 2026-09-19 09:01:08
categories:
  - Algorithm
tags:
  - suffix-automaton
  - string
  - sam
  - pattern-matching
  - substring
  - interview
sidebarSort: 84
---

# 后缀自动机（Suffix Automaton）

上一篇我们聊了[后缀数组](suffix-array.md)，它可以把所有后缀排好序，做二分查找，配合 LCP 数组能回答一堆字符串问题。但你有没有发现一个问题：**后缀数组建好之后，如果文本串追加了一个字符，怎么办？** 不好意思，整个数组得重新建一遍——O(n log n) 又来一次。

更狠的场景：你正在做一个在线聊天系统的敏感词检测，消息是**一个字符一个字符地敲出来的**。每多打一个字，你都要问一次"当前前缀是不是敏感词"。这种"边输入边查询"的场景，后缀数组扛不住。

这时候就该 **后缀自动机（Suffix Automaton，简称 SAM）** 登场了。它有个杀手锏：**可以在线追加字符，每次追加 O(1) 均摊复杂度** ✨。也就是说，不管你打 100 个字还是 1000 万个字，平均每个字符的处理成本都是常数级。

而且 SAM 不止"追加字符"这一个优点——它还能：

- 统计一个字符串里**有多少个不同的子串**
- 求两个串的**最长公共子串**
- 判断一个串是不是另一个串的子串（比 KMP 还简洁）
- 求一个串的**最小循环移位**

是不是很香？这篇我们就把它彻底讲清楚 🚀

## 为什么需要后缀自动机？

直接列场景，让你感受到 SAM 的威力：

- 🔍 **在线搜索引擎的"前缀提示"**：你输入 `auto`，立刻提示 `autocomplete` / `automobile` —— 这种"边输入边查"的场景，SAM 是天然契合的
- 🧬 **DNA 序列比对**：生物信息学里经常要在不断追加测序结果的同时做模式匹配
- 💬 **聊天敏感词过滤**：用户打字过程中就要实时判断有没有敏感词
- 📊 **子串个数统计**：给定 `s = "ababa"`，不同子串有 `a, b, ab, ba, aba, bab, abab, baba, ababa` 共 9 个。SAM 能在 O(n) 时间内给你答案

后缀自动机这个名字听起来很吓人，但它其实就是一个**很精巧的有向无环自动机**，加上一些巧妙的性质。下面我们从直觉出发，一步步把它建出来。

## 原理拆解

### 1. 一个核心概念：endpos 集合

要理解 SAM，你必须先吃透一个概念 —— **endpos（等价类）**。

对于字符串 `s` 的任意一个子串 `t`，定义 `endpos(t)` 为 `t` 在 `s` 中所有出现位置的**结尾下标**集合。

举例：`s = "aababa"`，所有子串 `t = "aba"` 的出现位置：

```
s =  a  a  b  a  b  a
     0  1  2  3  4  5
              ↑
"aba" 出现在 s[1..3] 和 s[3..5]
所以 endpos("aba") = {3, 5}
```

为什么要定义这个？因为 SAM 的核心思想是：**把所有 endpos 相同的子串，归到同一个状态里**。这就是 SAM 的"等价类"划分。

### 3. 一个神奇的等式：状态数 ≤ 2n - 1

别急着往下看，先记住这个结论：

> 对于长度为 `n` 的字符串 `s`，它的 SAM 的状态数**最多 `2n - 1` 个**。

也就是说，建一个 10 万字符的串的 SAM，最多也就 20 万个状态。**是线性的，不是指数爆炸**。

这是 SAM 最重要的"理论保证"，也是它能高效使用的根本原因。为什么是这个数字？我们后面讲构造的时候你会明白。

### 2. SAM 长什么样？先看个例子

`s = "aabbab"` 的 SAM（先记住这个图，待会儿讲怎么建出来）：

```
         ┌── a ──► (B) ── b ──► (D) ── b ──► (F)
(root,A) │          │
         │          b
         │          ▼
         └── b ──► (C) ── a ──► (E) ── b ──► (G)
                  │                ▲
                  a                │
                  └────────────────┘
```

（为了简明，省略了 link 边和部分转移，看个大致形状就行。）

- 每个**状态**表示一组 endpos 相同的子串
- 每条**转移边**（带字符标签）表示在某个状态读入字符后跳到下一个状态
- 沿着根节点出发的任意一条路径，就是 `s` 的某个子串

### 3. 三种边的含义

SAM 里其实有三种边，搞清楚它们就懂了 80%：

| 边类型 | 作用 | 类比 |
| --- | --- | --- |
| **转移边 (transition)** | 读入一个字符跳到下一个状态 | KMP 里的状态转移 |
| **后缀链接 (suffix link / link)** | 当前状态的最长真后缀所在的状态 | AC 自动机里的 fail 指针 |
| **父链 (沿着 link 一路向上)** | 状态对应的所有真后缀 | trie 里的失败回退 |

**后缀链接（link）** 这个东西是 SAM 的灵魂。如果你能把它理解透，SAM 的构造算法就是水到渠成。

### 4. 关键性质：`len(v) - len(link(v))` = 该状态表示的不同子串数

记状态 `v` 表示的所有子串中，最长串的长度是 `len(v)`，那么：

> 状态 `v` 表示的不同子串的数量 = `len(v) - len(link(v))`

为什么？因为 `v` 表示的所有子串恰好是：

```
len(link(v)) + 1, len(link(v)) + 2, ..., len(v)
```

这些就是"以 `v` 的最长表示串为后缀、长度各不相同"的所有子串。**它们的个数正好是 `len(v) - len(link(v))`**。

这条性质是 SAM 计数神器，下面的"不同子串计数"题目直接秒杀。

### 5. SAM 的增量构造（核心算法）

好了，到这一步开始上硬菜。SAM 的构造算法是**在线**的：每读入一个新字符，就把当前 SAM 扩展一步。整个过程只需要 O(1) **均摊**复杂度（虽然单步最坏是 O(1) 摊到 n 次）。

#### 状态定义

```typescript
interface State {
  link: number;                  // 后缀链接（fail 指针）
  len: number;                   // 该状态表示的最长子串长度
  next: Map<string, number>;     // 字符转移
}
```

#### 扩展过程

设当前已经处理到 `s[0..i-1]`，现在要追加字符 `c`。步骤如下：

1. **新建状态 `cur`**，长度 `len(cur) = len(last) + 1`，其中 `last` 是上一个状态
2. 从 `last` 开始，沿着 link 链往上爬，找**第一个**有 `c` 转移的状态 `p`。这一路上所有没有 `c` 转移的状态，都补上 `cur`
3. 如果爬到根节点还没找到 `c` 转移，说明 `c` 是全新的字符：`link(cur) = root`，结束
4. 如果找到了状态 `p`，且 `p` 通过 `c` 转移到 `q`：
   - 如果 `len(p) + 1 == len(q)`：直接 `link(cur) = q`，结束（最理想的情况）
   - 否则需要**克隆** `q`：复制一份 `clone`，`len(clone) = len(p) + 1`，把 `p` 和其他指向 `q` 的状态的 `c` 转移改成指向 `clone`，然后 `link(cur) = clone`，`link(q) = clone`

是不是有点懵？没事，我们下面用一个具体例子**逐步推演**，看完了你就懂。

### 6. 图解构造 `s = "aabbab"`

我们一步步来：

```
初始：root (len=0, link=-1)
SA = {0: {link: -1, len: 0, next: {}}}
last = 0
```

#### 第 1 步：追加 'a'

```
- cur = 1, len = 1
- 从 last=0 找 'a' 转移：root 没有 'a' → 一直没找到
- link(cur) = root(0)
- root.next['a'] = 1

last = 1
```

状态：

```
(0) root, len=0, link=-1
  └─ a ─► (1), len=1, link=0
```

#### 第 2 步：追加 'a'

```
- cur = 2, len = 2
- 从 last=1 找 'a' 转移：状态 1 没有 'a'
- 沿 link 回到 root(0)，root 也没有 'a'
- link(cur) = root(0)
- root.next['a'] 已经是 1，不变

last = 2
```

状态：

```
(0) root, len=0, link=-1
  └─ a ─► (1), len=1, link=0
              └─ a ─► (2), len=2, link=0
```

#### 第 3 步：追加 'b'

```
- cur = 3, len = 3
- 从 last=2 找 'b'：状态 2 没有 → 沿 link 回到 root → root 也没有
- link(cur) = root(0)
- root.next['b'] = 3

last = 3
```

状态：

```
(0) root, len=0, link=-1
  ├─ a ─► (1), len=1, link=0
  │          └─ a ─► (2), len=2, link=0
  └─ b ─► (3), len=3, link=0
```

#### 第 4 步：追加 'b'

```
- cur = 4, len = 4
- 从 last=3 找 'b'：状态 3 没有 → 沿 link 回到 root → root 也没有
- link(cur) = root(0)
- root.next['b'] 已经是 3，不变

last = 4
```

#### 第 5 步：追加 'a' ← 重点！

```
- cur = 5, len = 5
- 从 last=4 找 'a'：状态 4 没有 → 沿 link 回到 root(0) → root 有 'a' 转移 → p = root, q = 1
- 检查 len(p) + 1 == len(q)：0 + 1 == 1 ✓ 成立
- 直接 link(cur) = q = 1，结束
- 不用克隆 🎉
```

#### 第 6 步：追加 'b'

```
- cur = 6, len = 6
- 从 last=5 找 'b'：状态 5 没有 → link(5)=1 没有 → link(1)=0 (root) 没有
- 一直没找到！
- link(cur) = root(0)
- root.next['b'] 已经是 3，不变

last = 6
```

最终 SAM 状态数：**7 个**（含 root）。`n = 6`，确实 ≤ `2n - 1 = 11` ✅

### 7. 为什么这么构造是对的？

很多人卡在这一步。我用一句话总结 SAM 构造的不变量：

> **构造完成后，SAM 恰好接受 `s` 的所有子串，且每个状态表示一组 endpos 等价的子串。**

具体来说：

- **"接受所有子串"**：从 root 出发任意走，得到的字符串一定是 `s` 的某个子串（反之也成立）
- **"endpos 等价"**：每个状态 `v` 表示的所有子串在 `s` 中的出现位置集合都相同（所以可以合并）
- **"len(v) - len(link(v))"**：因为 link(v) 的子串是 v 的子串的**真后缀**，所以 v"新增"的子串长度就是这两者的最长长度差

如果你把以上三句话吃透，SAM 构造算法就不再神秘了。

## 代码实现

### TypeScript

```typescript
/**
 * 后缀自动机 —— TypeScript 实现
 *
 * 用途：
 *  1. 在线追加字符，每次 O(1) 均摊复杂度
 *  2. 统计字符串中不同子串的个数
 *  3. 判断某个串是否是另一个串的子串
 *  4. 求两个串的最长公共子串
 */
class SuffixAutomaton {
  // 状态结构：link(后缀链接) / len(最长串长度) / next(字符转移)
  private states: Array<{
    link: number;
    len: number;
    next: Map<string, number>;
  }> = [];
  private last: number = 0; // 上一次扩展时最后到达的状态

  constructor() {
    // 状态 0 是 root，len=0，link=-1（表示没有后缀链接）
    this.states.push({ link: -1, len: 0, next: new Map() });
  }

  /**
   * 在线追加一个字符到 SAM
   * 时间复杂度：O(1) 均摊
   */
  extend(c: string): void {
    const cur = this.states.length;
    this.states.push({
      link: 0,
      len: this.states[this.last].len + 1,
      next: new Map(),
    });

    let p = this.last;
    // 从 last 沿 link 链往上爬，给所有没有 c 转移的状态补上到 cur 的转移
    while (p !== -1 && !this.states[p].next.has(c)) {
      this.states[p].next.set(c, cur);
      p = this.states[p].link;
    }

    if (p === -1) {
      // 一直爬到 root 上方（-1）都没找到 c，说明 c 是全新的字符
      this.states[cur].link = 0;
    } else {
      const q = this.states[p].next.get(c)!;
      if (this.states[p].len + 1 === this.states[q].len) {
        // 理想情况：len(q) 恰好是 len(p) + 1
        this.states[cur].link = q;
      } else {
        // 需要克隆 q
        const clone = this.states.length;
        this.states.push({
          link: this.states[q].link,
          len: this.states[p].len + 1,
          next: new Map(this.states[q].next), // 深拷贝 next 表
        });

        // 把原来指向 q 的状态（p 和其他有 c 转移指向 q 的）改指向 clone
        while (p !== -1 && this.states[p].next.get(c) === q) {
          this.states[p].next.set(c, clone);
          p = this.states[p].link;
        }

        this.states[q].link = clone;
        this.states[cur].link = clone;
      }
    }

    this.last = cur;
  }

  /**
   * 构造完整 SAM：把整个字符串一次性塞进去
   */
  build(s: string): void {
    for (const c of s) {
      this.extend(c);
    }
  }

  /** 获取状态总数（用于调试） */
  size(): number {
    return this.states.length;
  }

  /**
   * 统计不同子串的数量
   * 原理：对每个状态 v，贡献 = len(v) - len(link(v))
   * 时间复杂度：O(|SAM状态数|) = O(n)
   */
  countDistinctSubstrings(): number {
    let total = 0;
    for (let i = 1; i < this.states.length; i++) {
      // 跳过 root（i=0）
      total += this.states[i].len - this.states[this.states[i].link].len;
    }
    return total;
  }

  /**
   * 判断 pattern 是不是 s 的子串
   * 时间复杂度：O(|pattern|)
   */
  contains(pattern: string): boolean {
    let v = 0;
    for (const c of pattern) {
      if (!this.states[v].next.has(c)) {
        return false; // 没找到对应转移，肯定不是子串
      }
      v = this.states[v].next.get(c)!;
    }
    return true;
  }

  /**
   * 计算每个状态表示的 endpos 集合大小（出现次数）
   * 通过 link 树自底向上累加
   * 应用：求每个子串的出现次数（具体是 len 在 [len(link)+1, len] 范围内的子串）
   */
  computeEndposSize(): number[] {
    const sz = new Array(this.states.length).fill(0);
    // 初始化：每个状态表示的"最长串"出现 1 次
    for (let i = 1; i < this.states.length; i++) {
      sz[i] = 1;
    }
    // 按 len 降序遍历（拓扑序：len 大的状态排在前面）
    const order = Array.from({ length: this.states.length }, (_, i) => i)
      .sort((a, b) => this.states[b].len - this.states[a].len);
    // 自底向上把 endpos 累加到 link 上
    for (const v of order) {
      const link = this.states[v].link;
      if (link !== -1) {
        sz[link] += sz[v];
      }
    }
    return sz;
  }
}

// ===== 使用示例 =====

const sam = new SuffixAutomaton();
sam.build("aabbab");
console.log("状态数:", sam.size()); // 7
console.log("不同子串数:", sam.countDistinctSubstrings()); // s="aabbab" 有 14 个不同子串
console.log("包含 'ab'?", sam.contains("ab")); // true
console.log("包含 'abc'?", sam.contains("abc")); // false
console.log("包含 'bba'?", sam.contains("bba")); // true
```

### Python

```python
class SuffixAutomaton:
    """
    后缀自动机 —— Python 实现

    核心操作：
      extend(c)            : 在线追加一个字符，O(1) 均摊
      count_distinct()     : 统计不同子串个数
      contains(pattern)    : 判断 pattern 是否为子串
    """

    def __init__(self):
        # states[i] = {'link': int, 'len': int, 'next': dict}
        self.states = [{"link": -1, "len": 0, "next": {}}]
        self.last = 0

    def extend(self, c: str) -> None:
        """在线追加一个字符"""
        cur = len(self.states)
        self.states.append({"link": 0, "len": self.states[self.last]["len"] + 1, "next": {}})

        p = self.last
        # 沿 link 链向上爬，给所有没有 c 转移的状态补转移
        while p != -1 and c not in self.states[p]["next"]:
            self.states[p]["next"][c] = cur
            p = self.states[p]["link"]

        if p == -1:
            # 一直爬到根上方都没找到
            self.states[cur]["link"] = 0
        else:
            q = self.states[p]["next"][c]
            if self.states[p]["len"] + 1 == self.states[q]["len"]:
                self.states[cur]["link"] = q
            else:
                # 克隆 q
                clone = len(self.states)
                self.states.append({
                    "link": self.states[q]["link"],
                    "len": self.states[p]["len"] + 1,
                    "next": dict(self.states[q]["next"]),  # 深拷贝
                })
                # 把指向 q 的转移改为指向 clone
                while p != -1 and self.states[p]["next"].get(c) == q:
                    self.states[p]["next"][c] = clone
                    p = self.states[p]["link"]
                self.states[q]["link"] = clone
                self.states[cur]["link"] = clone

        self.last = cur

    def build(self, s: str) -> None:
        """构造完整 SAM"""
        for c in s:
            self.extend(c)

    def count_distinct_substrings(self) -> int:
        """统计不同子串数量：Σ (len(v) - len(link(v)))，跳过 root"""
        return sum(
            self.states[i]["len"] - self.states[self.states[i]["link"]]["len"]
            for i in range(1, len(self.states))
        )

    def contains(self, pattern: str) -> bool:
        """判断 pattern 是否为子串"""
        v = 0
        for c in pattern:
            if c not in self.states[v]["next"]:
                return False
            v = self.states[v]["next"][c]
        return True


# ===== 使用示例 =====
if __name__ == "__main__":
    sam = SuffixAutomaton()
    sam.build("aabbab")
    print("状态数:", len(sam.states))  # 7
    print("不同子串数:", sam.count_distinct_substrings())
    print("包含 'ab'? ", sam.contains("ab"))
    print("包含 'abc'? ", sam.contains("abc"))
```

## 实战演练

SAM 学会之后，最常见的几道题你都能秒杀了。

### 1. 不同子串计数（模板题）

**题目**：给定字符串 `s`，求 `s` 的所有不同子串的数量。`1 ≤ |s| ≤ 10⁵`。

**思路**：上面 `countDistinctSubstrings` 就是答案。`Σ (len(v) - len(link(v)))`，v 是所有非 root 状态。

**复杂度**：O(n) 建 SAM + O(n) 统计 = **O(n)**

```typescript
function countDistinct(s: string): number {
  const sam = new SuffixAutomaton();
  sam.build(s);
  return sam.countDistinctSubstrings();
}
```

LeetCode 上对应题目：[1698. 字符串的不同子串个数](https://leetcode.cn/problems/number-of-distinct-substrings-in-a-string/) — 用后缀数组做也行，但 SAM 更直接。

### 2. 最长公共子串（多串）

**题目**：给定两个串 `s` 和 `t`，求它们的最长公共子串。`1 ≤ |s|, |t| ≤ 10⁵`。

**思路**：用 `s` 建 SAM，然后拿 `t` 在 SAM 上"喂"，同时维护当前匹配长度：

1. 从 root 出发，在 SAM 上逐字符喂 `t`
2. 如果当前字符 `c` 在当前状态有转移 → 走过去，`len++`
3. 否则沿 link 链往上爬，直到能走 `c`（或爬到 -1）
4. 记录全程的 `len` 最大值

```typescript
function longestCommonSubstring(s: string, t: string): number {
  const sam = new SuffixAutomaton();
  sam.build(s);

  // 这里需要访问内部状态，所以单独写一个函数
  // 也可以把 states 暴露为 public 属性
  const states = (sam as any).states as Array<{
    link: number;
    len: number;
    next: Map<string, number>;
  }>;

  let v = 0;
  let l = 0;
  let best = 0;
  for (const c of t) {
    while (v !== 0 && !states[v].next.has(c)) {
      v = states[v].link;
      l = states[v].len;
    }
    if (states[v].next.has(c)) {
      v = states[v].next.get(c)!;
      l++;
    }
    best = Math.max(best, l);
  }
  return best;
}

console.log(longestCommonSubstring("ababc", "babca")); // 3 ("abc" 或 "bab")
```

**复杂度**：O(|s|) 建 SAM + O(|t|) 匹配 = **O(|s| + |t|)**

### 3. 出现次数 ≥ k 的最长子串

**题目**：给定字符串 `s` 和整数 `k`，求 `s` 中出现次数至少 `k` 次的最长子串。

**思路**：

1. 建 SAM
2. 计算每个状态的 `endpos` 大小（即该子串表示的"最长串"在 `s` 中出现次数）
3. 遍历所有状态，找 `sz[v] >= k` 且 `len(v)` 最大的

```typescript
function longestFrequentSubstring(s: string, k: number): number {
  const sam = new SuffixAutomaton();
  sam.build(s);
  const sz = sam.computeEndposSize();

  const states = (sam as any).states as Array<{ len: number }>;
  let best = 0;
  for (let v = 1; v < states.length; v++) {
    if (sz[v] >= k) {
      best = Math.max(best, states[v].len);
    }
  }
  return best;
}

console.log(longestFrequentSubstring("ababa", 2)); // 4 ("abab" 出现 1 次, "baba" 1 次，"aba" 2 次长度为 3, "bab" 不存在)
// 实际最长: "aba" 出现 2 次，长度 3
```

**复杂度**：O(n) 建 SAM + O(n log n) 拓扑排序 = **O(n log n)**（用基数排序可以到 O(n)）

### 4. 判断子串（比 KMP 简洁）

如果只判断 pattern 是不是 s 的子串，**SAM 反而比 KMP 还好写**。不需要预处理 failure function，直接顺着 SAM 走即可。

```typescript
function isSubstring(s: string, pattern: string): boolean {
  const sam = new SuffixAutomaton();
  sam.build(s);
  return sam.contains(pattern);
}

// 时间：O(|s|) 建 + O(|pattern|) 查 = O(|s| + |pattern|)
// 空间：O(|s|)
```

> 不过需要注意：单次子串查询 KMP 是 O(n+m) 不用预处理，SAM 必须先花 O(n) 建索引。所以**单次查询用 KMP，多次查询用 SAM**。

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 | 说明 |
| --- | --- | --- | --- |
| 构造 SAM | O(n) | O(n) | 状态数 ≤ 2n-1，每步 O(1) 均摊 |
| 子串计数 | O(n) | O(1) | Σ (len(v) - len(link(v))) |
| 子串判定 | O(m) | O(1) | 沿 SAM 走 m 步 |
| 两串最长公共子串 | O(n + m) | O(n) | 一次走完 t |
| 出现次数统计 | O(n log n) | O(n) | 需要拓扑排序（基数排序可达 O(n)） |

**为什么是 O(n)？** 这是 SAM 最重要的理论保证。证明思路：

- 每次 `extend` 要么新建 1 个状态（cur），要么额外克隆 1 个状态（clone）
- 沿 link 链向上爬时，每一步都会让 `last` 跳到一个**更短**的状态
- 由于 `len` 单调递减，总的"向上爬"次数被均摊到 O(n)
- 所以总状态数 ≤ `2n - 1`，总操作数 ≤ `O(n)`

## 实际应用

### 1. 在线聊天敏感词检测

每敲一个字，就往 SAM 里塞一个字符，然后用敏感词词典建一个"反向"判断——是不是被敏感词包含。

### 2. 全文检索的子串索引

Elasticsearch / Lucene 在做子串匹配时，底层用 FST（Finite State Transducer），而 FST 本质上就是 SAM 的最小化版本。

### 3. DNA 序列比对

基因组测序是流式追加的，每测出一段碱基就追加到 SAM，可以实时做"已知基因片段"匹配。

### 4. LeetCode 相关题目

- [1698. 字符串的不同子串个数](https://leetcode.cn/problems/number-of-distinct-substrings-in-a-string/)
- [727. 最小窗口子序列](https://leetcode.cn/problems/minimum-window-subsequence/)
- [1392. 最长快乐前缀](https://leetcode.cn/problems/longest-happy-prefix/)（SAM + 找最长 border）
- [后缀自动机专题 - OI Wiki](https://oi-wiki.org/string/sam/)（国内最权威的 SAM 资料）

## SAM vs 后缀数组 vs KMP：怎么选？

| 场景 | 推荐算法 | 理由 |
| --- | --- | --- |
| 单次子串匹配 | KMP / Z 函数 | 简单，O(n+m)，不需要预处理 |
| 多次不同子串查询 | 后缀数组 / SAM | 预处理一次，多次查询复用 |
| **在线追加字符** | **SAM** | 唯一支持增量构造 |
| 字符串"循环移位"问题 | 后缀数组 / SAM | 后缀数组配 LCP 比较方便 |
| 最长公共子串（两串） | SAM | 代码量比后缀数组少一半 |
| AC 自动机搞不定的"任意子串查询" | SAM | SAM = 全文检索的近似物 |

**一句话决策**：

- 单串 + 单模式匹配 → KMP
- 单串 + 多种子串查询 + 静态 → 后缀数组
- 流式 + 在线追加 + 多查询 → **后缀自动机** 🎯

## 小结

后缀自动机是字符串领域的"全能选手"：

- ✅ **O(n) 状态数**：理论保证的线性复杂度，不会指数爆炸
- ✅ **在线追加字符**：每次 O(1) 均摊，天然支持流式场景
- ✅ **多场景通用**：子串计数、最长公共子串、出现次数统计一站式搞定
- ✅ **结构优雅**：状态 + 转移边 + 后缀链接，理解清楚后非常自然
- ❌ **概念门槛较高**：endpos 抽象、link 链、克隆操作，需要时间消化
- ❌ **常数较大**：相比后缀数组，实测常数大约 2-3 倍

学 SAM 的建议路径：

1. **先吃透 endpos 概念** —— 这是整个理论的支点
2. **理解 link 链的含义** —— 把它当成"AC 自动机的 fail 指针"
3. **手推 `aabbab` 的构造过程** —— 把每个步骤画出来
4. **做几道模板题** —— 不同子串计数、最长公共子串
5. **尝试挑战综合性题目** —— 比如最长重复子串 k 次出现

等你把它彻底掌握，字符串类问题基本就没有能难住你的了 💪

**口诀**：看到"流式"、"在线追加"、"任意子串查询"，条件反射想到后缀自动机。看到"静态文本 + 多查询"，后缀数组更香。看到"单次匹配"，KMP 走起。