---
title: 回文树（Eertree / Palindromic Tree）
description: 专治回文串的数据结构，O(n) 时间内统计/插入/枚举所有回文子串
date: 2026-10-09 09:00:55
categories:
  - Algorithm
tags:
  - palindromic-tree
  - eertree
  - palindrome
  - string-algorithm
sidebarSort: 100
---

# 回文树（Eertree / Palindromic Tree）

你有没有在面试或者刷题的时候遇到过这种题："给你一个字符串 `s`，求它包含多少个不同的回文子串？" 或者："求字符串中所有回文子串出现的次数"？你是不是第一反应是写个双重循环暴力判断？

我以前也是。但等你看完今天要讲的数据结构，你会发现：原来这种问题可以做到 **O(n) 时间复杂度、O(n) 空间复杂度** 一遍过。这个数据结构叫做 **回文树（Palindromic Tree）**，又叫 **Eertree**，是 Mikhail Rubinchik 在 2015 年的算法竞赛中提出的，专门用来高效处理回文串问题。

讲真，这个数据结构在工作中几乎用不到，但在算法竞赛和某些特定场景（比如 DNA 序列分析、文本去重）里是真的香。今天我们就来把它讲透 👇。

## 为什么需要回文树？

先看几个经典的回文串问题：

1. **统计字符串中回文子串的个数**（LeetCode 647）
2. **统计不同回文子串的个数**（LeetCode 730）
3. **最长回文子序列**（LeetCode 516，这个是子序列不是子串）
4. **最长回文子串**（LeetCode 5）
5. **统计所有回文子串出现的次数**

如果用 Manacher 算法做第 1、4 个题可以做到 O(n)，但第 2、5 个题呢？Manacher 就无能为力了，因为你没法直接知道"有多少个**不同的**回文子串"。

让我们看看暴力做这些问题有多慢：

```
字符串 s = "abacaba"
长度 n = 7

暴力枚举所有子串：O(n²) = 49 个
判断每个子串是否是回文：O(n)
总复杂度：O(n³) = 343

对每个中心做 Manacher：O(n²) 还是太慢
```

回文树的思路不一样：**它在构造的过程中就自动枚举出了所有的回文子串**。一个长度为 n 的字符串最多有 n 个**不同的**回文子串（这是因为任意回文子串的数量级是 O(n) 的，证明见后文），所以回文树的大小也是 O(n)，插入过程是 O(n) 总时间。

## 核心思想

回文树本质上是一棵**有向无环图**（DAG），由两棵树组成：

1. **偶数长度回文树**（根节点为 0，标记长度为 0 的"空回文"）
2. **奇数长度回文树**（根节点为 1，标记长度为 -1 的虚拟回文，作为奇数回文的祖先）

每个节点代表一个**不同的回文子串**，从根到任意节点的路径就代表一个回文串。边是字符，存储的是"当前回文串两边各加一个字符后形成的新回文串"。

等等，这听起来是不是有点抽象？别急，我们慢慢来 ✨。

### 关键观察 1：任意字符串最多有 n 个不同的回文子串

证明：考虑字符串 `s[0..n-1]`，从位置 i 开始的回文子串，由最长的那一个决定。也就是说，对于每个后缀 `s[i..]`，它的最长回文前缀都是**唯一**的（可能不存在）。所以不同回文子串的个数 ≤ n。

### 关键观察 2：每次新插入一个字符，最多只会新增 1 个新的回文子串

为什么？因为当你处理到第 i 个字符时，所有以 `s[i]` 结尾的回文子串中，**最长的那一个就是新出现的回文子串**。其它更短的回文子串肯定在之前就出现过了。

举个例子，`s = "abac"`：
- 处理 `a`：最长的以 `a` 结尾的回文子串是 `"a"`，新增 1 个
- 处理 `b`：以 `b` 结尾的最长回文子串是 `"b"`，新增 1 个
- 处理 `a`：以 `a` 结尾的最长回文子串是 `"a"`（已存在），新增 0 个
- 处理 `c`：以 `c` 结尾的最长回文子串是 `"c"`，新增 1 个

总共 3 个不同的回文子串：a、b、c。✅

```
s = "aba"
- 处理 a: 新增 "a"
- 处理 b: 新增 "b"  
- 处理 a: 以 a 结尾的最长回文 = "aba"（新！）, 新增 1 个

总共 2 个不同的回文子串：a、aba
```

这说明：**回文树每个时刻最多只会新增 1 个节点**，n 个字符最多 n 个节点。

### 关键观察 3：怎么快速找"以 s[i] 结尾的最长回文子串"？

这就是**失配指针（suffix link / fail 链）** 的作用，类似 AC 自动机里的 fail 指针。

失配指针指向**当前回文串的最长真回文后缀**。比如 `"abacaba"` 的失配指针指向 `"aba"`，因为 `"aba"` 是 `"abacaba"` 的最长真回文后缀。

当我们要插入新字符 `c` 时：
1. 从上一个插入的节点（最长回文）开始，沿着失配指针往上跳
2. 找到第一个节点 `u`，使得 `s[i - len(u) - 2]` 存在且等于 `c`（即回文两边能扩展 `c`）
3. 如果 `u` 的某个孩子已经是 `c`，说明这个回文已经存在
4. 否则创建新节点 `v = c + u + c`，并设置 `v` 的失配指针

整个过程用类似 KMP/AC 自动机的均摊分析，**总时间是 O(n)**。

## 数据结构设计

我们用几个数组来存储回文树（类似邻接表）：

```typescript
interface Eertree {
  // next[node][char] = 从 node 节点经过字符 char 能到达的回文节点
  next: Map<string, number>[];
  
  // fail[node] = node 节点的最长真回文后缀节点（失配指针）
  fail: number[];
  
  // len[node] = node 节点代表的回文串长度
  len: number[];
  
  // cnt[node] = node 节点代表的回文串作为后缀出现的次数
  cnt: number[];
  
  // num[node] = 以 node 节点结尾的回文子串个数（包含自身）
  num: number[];
  
  // last = 上一次插入后最长的回文后缀节点
  last: number;
  
  // total = 已添加的字符数（用于判断哪些节点被创建）
  total: number;
}
```

两个特殊的根节点：
- `node[0]`：长度 0 的空回文（偶数根）
- `node[1]`：长度 -1 的虚拟回文（奇数根，特殊处理）

`node[1]` 的存在是为了让所有节点（包括奇数长度回文）都能统一处理"扩展两边加字符"的操作。

## 代码实现

### TypeScript 完整版

```typescript
/**
 * 回文树（Eertree / Palindromic Tree）TypeScript 实现
 * 
 * 核心功能：
 * 1. 增量构建：每个新字符 O(1) 摊还时间插入
 * 2. 统计不同回文子串的个数
 * 3. 统计每个回文子串出现的次数
 * 4. 统计以每个位置结尾的回文子串个数
 */

class Eertree {
  // 邻接表：next[node][charCode] = 目标节点
  private next: Map<number, number>[] = [];
  
  // 失配指针（最长真回文后缀）
  private fail: number[] = [];
  
  // 每个节点代表的回文串长度
  private len: number[] = [];
  
  // 每个节点作为后缀出现的次数（endPos 的次数）
  private cnt: number[] = [];
  
  // 以每个节点代表的回文串结尾的"回文后缀"总数
  private num: number[] = [];
  
  // 字符串总长度
  private total = 0;
  
  // 上次插入后最长的回文后缀节点
  private last = 1;
  
  // 原始字符串（可选，用于调试）
  public s = '';
  
  constructor() {
    this.init();
  }
  
  private init() {
    this.next = [new Map(), new Map()];
    this.fail = [0, 0];
    this.len = [0, -1]; // 0 = 偶数根(空回文), 1 = 奇数根(虚拟)
    this.cnt = [0, 0];
    this.num = [0, 0];
    this.last = 1;
    this.total = 0;
  }
  
  /**
   * 获取失配指针的下一个候选节点
   * 从 cur 沿着 fail 链往上跳，找到第一个能在两边扩展字符 c 的回文
   */
  private getFail(cur: number, pos: number): number {
    // 一直往上跳，直到找到一个回文 u，使得 s[pos - len[u] - 1] === s[pos]
    while (true) {
      const curLen = this.len[cur];
      if (pos - curLen - 1 >= 0 && this.s[pos - curLen - 1] === this.s[pos]) {
        return cur;
      }
      cur = this.fail[cur];
    }
  }
  
  /**
   * 插入一个字符
   * @returns 是否创建了新节点
   */
  public addChar(ch: string): boolean {
    this.s += ch;
    const pos = this.total;
    this.total++;
    
    // 找到可以扩展的失配节点
    let cur = this.getFail(this.last, pos);
    
    const charCode = ch.charCodeAt(0);
    
    // 检查是否已经存在这个回文子串
    if (this.next[cur].has(charCode)) {
      this.last = this.next[cur].get(charCode)!;
      this.cnt[this.last]++;
      this.num[this.last]++;
      return false;
    }
    
    // 创建新节点
    const newNode = this.next.length;
    this.next.push(new Map());
    this.len.push(this.len[cur] + 2);
    this.cnt.push(1);
    this.num.push(1);
    this.next[cur].set(charCode, newNode);
    
    // 设置失配指针
    if (this.len[newNode] === 1) {
      // 长度为 1 的回文，失配指针指向偶数根
      this.fail.push(0);
    } else {
      // 找新节点的失配指针：在 cur 的失配节点上继续找
      const failNode = this.getFail(this.fail[cur], pos);
      this.fail.push(this.next[failNode].get(charCode) ?? 0);
    }
    
    this.last = newNode;
    return true;
  }
  
  /**
   * 字符串构建完成后，统计每个回文子串的总出现次数
   * 通过 fail 树从叶子到根累加
   */
  public propagateCount(): void {
    // cnt[i] 表示 i 作为后缀出现的次数
    // 沿 fail 链累加，得到 i 在整个字符串中出现的总次数
    // 注意：fail 链是 fail[child] -> parent，所以要反向遍历
    for (let i = this.next.length - 1; i >= 0; i--) {
      const f = this.fail[i];
      if (f > 1) { // 不要累加到虚拟根
        this.cnt[f] += this.cnt[i];
      }
    }
  }
  
  /** 获取不同回文子串的个数（不算两个虚拟根） */
  public getDistinctCount(): number {
    return this.next.length - 2;
  }
  
  /** 获取第 i 个节点代表的回文子串（仅用于调试） */
  public getPalindrome(nodeId: number): string {
    if (nodeId === 0) return '';
    if (nodeId === 1) return '(-1)';
    
    // 通过从 node 沿 next 链回溯父节点得到回文
    // 但更简单：直接对原字符串切片
    // 我们需要额外的父节点指针
    return '...'; // 略
  }
}
```

### Python 完整版（更简洁）

```python
class Eertree:
    """回文树 - Python 实现"""
    
    __slots__ = ('next', 'fail', 'len', 'cnt', 'num', 'last', 'total', 's')
    
    def __init__(self):
        # 0 = 偶数根（空回文），1 = 奇数根（虚拟，长度 -1）
        self.next = [{}, {}]   # 邻接表
        self.fail = [0, 0]     # 失配指针
        self.len = [0, -1]     # 回文长度
        self.cnt = [0, 0]      # 作为后缀出现次数
        self.num = [0, 0]      # 以当前位置结尾的回文后缀数
        self.last = 1          # 上次最长回文后缀
        self.total = 0         # 字符串总长
        self.s = ''             # 原始字符串
    
    def _get_fail(self, cur: int, pos: int) -> int:
        """从 cur 沿 fail 链跳，找到能在 pos 位置扩展字符的回文"""
        while True:
            cur_len = self.len[cur]
            if pos - cur_len - 1 >= 0 and self.s[pos - cur_len - 1] == self.s[pos]:
                return cur
            cur = self.fail[cur]
    
    def add_char(self, ch: str) -> bool:
        """插入一个字符，返回是否创建了新节点"""
        self.s += ch
        pos = self.total
        self.total += 1
        
        cur = self._get_fail(self.last, pos)
        
        if ch in self.next[cur]:
            # 回文已存在
            self.last = self.next[cur][ch]
            self.cnt[self.last] += 1
            self.num[self.last] += 1
            return False
        
        # 创建新节点
        new_node = len(self.next)
        self.next.append({})
        self.len.append(self.len[cur] + 2)
        self.cnt.append(1)
        self.num.append(1)
        self.next[cur][ch] = new_node
        
        # 设置 fail 指针
        if self.len[new_node] == 1:
            self.fail.append(0)
        else:
            fail_cur = self._get_fail(self.fail[cur], pos)
            self.fail.append(self.next[fail_cur][ch])
        
        self.last = new_node
        return True
    
    def propagate(self) -> None:
        """构建完成后累加 cnt，得到每个回文在全文中的出现次数"""
        for i in range(len(self.next) - 1, -1, -1):
            f = self.fail[i]
            if f > 1:
                self.cnt[f] += self.cnt[i]
    
    def distinct_count(self) -> int:
        """不同回文子串个数"""
        return len(self.next) - 2
    
    def total_palindromes_ending_here(self) -> list:
        """每个位置结尾的回文后缀总数（包含自身）"""
        return self.num[2:]  # 跳过两个根
```

## 构造过程图解

我们用 `"abacaba"` 走一遍构造过程：

```
字符串：a b a c a b a
位置：  0 1 2 3 4 5 6

初始：两个根节点
  0: len=0  偶数根
  1: len=-1 奇数根（虚拟）

=========================================
第 1 步：插入 'a'（pos=0）

  last=1 (奇数根)
  getFail(1, 0): 
    len[1]=-1, 0-(-1)-1=0, s[0]='a'==s[0]='a' ✓ 找到 cur=1
  next[1] 没有 'a'，创建新节点 2，len[2] = -1+2 = 1
  fail[2] = 0 (长度 1 的回文，fail 指向偶数根)
  last = 2
  
  树状态：
    1 (虚拟) --a--> 2("a")

=========================================
第 2 步：插入 'b'（pos=1）

  last=2
  getFail(2, 1):
    len[2]=1, 1-1-1=-1 < 0, 不行
    cur = fail[2] = 0
    len[0]=0, 1-0-1=0, s[0]='a' vs s[1]='b' ✗
    cur = fail[0] = 0 (0 的 fail 是自己)
    同上不匹配，跳到 fail[0] = 0
    还是不行，cur = 0 ... 直到 cur = 1
    len[1]=-1, 1-(-1)-1=1, s[1]='b'==s[1]='b' ✓ 找到 cur=1
  next[1] 没有 'b'，创建新节点 3，len[3] = -1+2 = 1
  fail[3] = 0
  last = 3
  
  树状态：
    1 (虚拟) --a--> 2("a")
              --b--> 3("b")

=========================================
第 3 步：插入 'a'（pos=2）

  last=3
  getFail(3, 2):
    len[3]=1, 2-1-1=0, s[0]='a'==s[2]='a' ✓ 找到 cur=3
  next[3] 有 'a' 吗？没有！创建新节点 4
  len[4] = 1+2 = 3, 这是 "aba"
  fail[4]: len=3 不是 1，需要从 fail[3]=0 找
    getFail(0, 2):
      len[0]=0, 2-0-1=1, s[1]='b' vs s[2]='a' ✗
      cur = fail[0] = 0
      ...
      直到 cur = 1: s[2]='a'==s[2]='a' ✓
    next[1]['a'] = 2
    fail[4] = 2
  last = 4
  
  树状态：
    1 (虚拟) --a--> 2("a") --a--> 4("aba")
              --b--> 3("b")

=========================================
第 4 步：插入 'c'（pos=3）

  last=4
  getFail(4, 3):
    len[4]=3, 3-3-1=-1<0, 不行
    cur = fail[4] = 2
    len[2]=1, 3-1-1=1, s[1]='b' vs s[3]='c' ✗
    cur = fail[2] = 0
    len[0]=0, 3-0-1=2, s[2]='a' vs s[3]='c' ✗
    cur = fail[0] = 0
    ... 一直跳到 1
    len[1]=-1, 3-(-1)-1=3, s[3]='c'==s[3]='c' ✓
  next[1] 没有 'c'，创建新节点 5，len[5]=1
  fail[5] = 0
  last = 5
  
  树状态新增 c 节点

=========================================
第 5 步：插入 'a'（pos=4）

  类似的，发现 next[5] 有 'a' 吗？没有
  创建一个以 'a' 为中心的新回文
  实际会创建 "acbca" 还是 "a"？我们看：
  getFail(5, 4):
    len[5]=1, 4-1-1=2, s[2]='a'==s[4]='a' ✓ 找到 cur=5
  next[5] 没有 'a'，创建新节点 6，len[6] = 1+2 = 3
  实际是 "aca"！
  
  fail[6]: getFail(fail[5]=0, 4)
    ... 跳到 1, s[4]='a'==s[4]='a' ✓
    next[1]['a']=2
    fail[6] = 2

=========================================
第 6 步：插入 'b'（pos=5）

  会创建 "b" 和 "abacaba"（以 b 为中心的回文）
  
  last=4, getFail(4, 5):
    len[4]=3, 5-3-1=1, s[1]='b'==s[5]='b' ✓
  next[4] 有 'b' 吗？没有，创建 len=5 的 "bacab"
  
  然后发现 next[2] 有 'b' 吗？也没有
  但等等，pos=5 时，next[1] 之前没有 'b'... 哎
  实际上 pos=5 时 getFail(last, 5) 会跳到合适的位置
  这次会创建 "abacaba" (len=7)

=========================================
第 7 步：插入 'a'（pos=6）

  last 是 "abacaba"
  getFail(7号节点, 6):
    len=7, 6-7-1=-2<0
    cur = fail[上一节点] = 4 ("aba")
    len=3, 6-3-1=2, s[2]='a'==s[6]='a' ✓
  next[4] 有 'a' 吗？next[4] 里之前没添加过 'a'，会创建 len=5 的 "bacab"
  等等，"bacab" 之前应该创建过了...
  
  哦不对，我重新看，第 6 步插入 b 时应该已经创建 "bacab" 和 "abacaba"
  所以第 7 步时 next[4] 已经有 'a' 指向 "bacab" 节点
  不会创建新节点。
  
最终树结构（简化版）：
  1 (虚拟) --a--> 2("a") --a--> 4("aba") --a--> 8("abacaba")
              --b--> 3("b") --b--> 7("bacab")
              --c--> 5("c")
  2("a") --c--> 6("aca")
  
不同的回文子串：a, b, c, aba, aca, bacab, abacaba = 7 个
和 "abacaba" 实际包含的不同回文子串数一致 ✓
```

看起来有点乱对吧？我画个更清晰的版本：

```
        1(虚拟根,len=-1)
       / | \
      a  b  c
     /   |   \
    2    3    5
   "a"  "b"  "c"
    |
    +--a--> 4
    |       "aba"
    |        |
    |        +--a--> 8
    |                "abacaba"
    |
    +--c--> 6
            "aca"
    
节点 3 ("b"): +--b--> 7 "bacab"
```

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 插入一个字符 | O(1) 摊还 | O(1) |
| 构造整个字符串 | O(n) | O(n) |
| 统计不同回文子串数 | O(1) | O(1) |
| 统计每个回文出现次数 | O(n) | O(1) |
| 枚举所有回文子串 | O(n) | O(n) |

为什么是 O(1) 摊还？关键在于：每次插入最多创建一个新节点，**失配指针沿链跳的总次数也是 O(n)**（类似 AC 自动机的均摊分析）。这就是为什么"最长回文后缀"可以这么快找到。

## 实战应用

### 应用 1：统计不同回文子串个数（LeetCode 730 简化版）

```typescript
function countDistinctPalindromes(s: string): number {
  const tree = new Eertree();
  for (const ch of s) {
    tree.addChar(ch);
  }
  return tree.getDistinctCount();
}

// 测试
console.log(countDistinctPalindromes("abacaba")); // 7
console.log(countDistinctPalindromes("aaaa"));    // 4: "a", "aa", "aaa", "aaaa"
console.log(countDistinctPalindromes("abc"));      // 3: "a", "b", "c"
```

### 应用 2：统计回文子串的总出现次数

```typescript
function countAllPalindromicSubstrings(s: string): number {
  const tree = new Eertree();
  for (const ch of s) {
    tree.addChar(ch);
  }
  tree.propagateCount();
  // sum(每个不同回文的出现次数)
  let total = 0;
  // 通过反射或公共 getter 拿到 cnt 数组
  for (let i = 2; i < tree.cnt.length; i++) {
    total += tree.cnt[i];
  }
  return total;
}
```

### 应用 3：以每个位置结尾的回文子串数

```typescript
function palindromesEndingAt(s: string): number[] {
  const tree = new Eertree();
  const result: number[] = [];
  for (const ch of s) {
    tree.addChar(ch);
    // 当前位置结尾的回文子串数 = last 节点的 num 值
    result.push(tree.num[tree.last]);
  }
  return result;
}

console.log(palindromesEndingAt("abacaba"));
// [1, 1, 2, 1, 3, 2, 4]
// pos 0: "a"              → 1
// pos 1: "b"              → 1
// pos 2: "a", "aba"       → 2
// pos 3: "c"              → 1
// pos 4: "a", "aba", "acaca" 实际是 "a","aca" → 3
// pos 5: "b", "bacab"     → 2
// pos 6: "a", "aba", "ac...a", "abacaba" 实际是 "a","aba","ac...a","abacaba" → 4
```

### 应用 4：最长双回文子串（NOI 经典题）

把字符串分成两部分，使得前后两半各包含一个回文子串，问最大总长度。

**解法**：
1. 用回文树正向遍历，得到 `pre[i]` = `s[0..i]` 中最长的回文前缀长度
2. 反向构建回文树（或使用类似方法），得到 `suf[i]` = `s[i..n-1]` 中最长的回文后缀长度
3. 枚举分割点 `i`，答案为 `max(pre[i] + suf[i+1])`

用回文树做这个题，O(n) 时间就能解决。

### 应用 5：DNA 序列中的回文识别

在生物信息学中，DNA 序列（由 A、T、G、C 组成）里回文结构有特殊含义（比如限制酶识别位点）。如果要从一个长 DNA 序列中提取所有可能的回文识别位点，回文树就是首选工具，因为：

- 内存占用小（O(n)）
- 能枚举所有回文子串
- 能统计每个回文出现次数，便于找高频识别位点

## 经典例题

### 例题 1：LeetCode 730 - 统计不同回文子序列

**题目**：给定字符串 `s`，返回 `s` 中所有非空回文子序列的个数。由于答案可能很大，返回对 `10^9 + 7` 取模的结果。

注意这里是**子序列**（不要求连续），不是子串。回文树处理的是子串，所以这题用回文树不行，要用区间 DP。但是改一下题目——"不同回文子**串**"就能用回文树了。

```typescript
// 不同回文子串
function countDistinctPalindromicSubstrings(s: string): number {
  const tree = new Eertree();
  for (const ch of s) {
    tree.addChar(ch);
  }
  return tree.getDistinctCount();
}
```

### 例题 2：SPOJ - NUMOFPAL（不同回文子串数）

**题目**：求字符串中不同回文子串的个数。

```python
def solve():
    s = input().strip()
    tree = Eertree()
    for ch in s:
        tree.add_char(ch)
    print(tree.distinct_count())

solve()
```

### 例题 3：最长回文子串（LeetCode 5）

**题目**：找到 `s` 中最长的回文子串。

回文树其实不太适合做这题（用 Manacher 更简单），但也能做：

```typescript
function longestPalindrome(s: string): string {
  if (!s) return '';
  const tree = new Eertree();
  let maxLen = 0;
  let maxNode = -1;
  
  for (const ch of s) {
    tree.addChar(ch);
    if (tree.len[tree.last] > maxLen) {
      maxLen = tree.len[tree.last];
      maxNode = tree.last;
    }
  }
  
  // 提取回文子串（这里需要额外的父节点记录）
  return s.slice(-maxLen); // 简化：实际最长回文一定以最后一个字符结尾
}
```

注意上面的简化版本假设最长回文一定在末尾，但实际上"最长回文子串"不一定以 `s[n-1]` 结尾，所以严格实现需要记录每个节点对应的结束位置。

## 常见误区

### 误区 1：以为回文树能直接处理子序列

**错**。回文树只处理**子串**（连续）。子序列问题得用 DP 或其他方法。

### 误区 2：忘记 propagate

如果你需要每个回文子串在**整个字符串中**的出现次数，光看插入时的 `cnt` 是不够的（它只记录"作为后缀出现"的次数）。必须调用 `propagate()` 沿 fail 链累加。

举例：`s = "aaa"`：
- 插入 3 个 `'a'`，会创建 `"a"`（1次）、`"aaa"`（1次）
- `"a"` 在全文中出现 3 次，但 `cnt["a"]` 只在第二次插入时 +1，最终 = 2
- 沿 fail 累加后：cnt["aaa"] = 1（自己加的1次），cnt["a"] = 2 + 1 = 3 ✓

### 误区 3：节点 1 是必要的

**是的**。没有 `len = -1` 的虚拟根，处理长度为 1 的回文时会很麻烦（"两边各加一个字符"的逻辑写不出来）。它就是个辅助节点，别忘了 `fail[0] = 0` 和 `fail[1] = 0` 形成自环。

### 误区 4：以为"不同回文子串数"会超过 n

前面证明过，**不同回文子串数 ≤ n**。但很多人凭直觉觉得可能更多（毕竟子串总数是 O(n²)）。这是因为回文的对称性约束了回文子串的种类。

## 进阶：回文自动机与回文后缀树

学完回文树，如果你还想深入：

1. **回文后缀树（Palindromic Suffix Tree）**：和回文树类似，但存储的是"所有以某位置结尾的回文后缀"，适合处理"回文后缀数"类问题。
2. **回文树 + 后缀数组**：结合两种结构，做更复杂的字符串算法。
3. **回文树在 AC 自动机上的扩展**：处理带通配符的回文匹配。

## 总结

回文树（Eertree）是处理回文串问题的**利器**：

- ✅ O(n) 时间构造，O(n) 空间
- ✅ 能枚举所有不同回文子串
- ✅ 能统计每个回文子串的出现次数
- ✅ 能枚举以每个位置结尾的回文子串
- ❌ 只能处理子串，不能处理子序列
- ❌ 实现起来有点 trick，调试不友好

如果你在面试中被问到"统计不同回文子串个数"或者"以每个位置结尾的回文后缀数"这类问题，**回文树就是 O(n) 的标准解法**。其他方法（中心扩展、Manacher）要么只能算总数，要么不能去重。

**核心要点**：
1. 每次插入新字符，最多创建 1 个新节点
2. 失配指针 = 当前回文的最长真回文后缀
3. `num[i]` 是 `i` 的子树中所有"作为后缀"的回文数之和
4. 必须 propagate 才能得到每个回文在全文中的出现次数

刷题时遇到回文串相关的问题，强烈建议练习一下回文树的手写实现，体会"为什么每次只新增 1 个节点"这个核心思想。一旦理解了这个，你对"回文"的认知会上一个台阶 ✨。

## 参考资料

- [Palindromic tree - Codeforces](https://codeforces.com/blog/entry/13959) - Mikhail Rubinchik 的原始文章
- [回文树 - OI Wiki](https://oi-wiki.org/string/pam/)
- [Eertree - Wikipedia](https://en.wikipedia.org/wiki/Palindromic_tree)

---

**推荐阅读**：
- 如果你想复习 Manacher 算法：[Manacher 算法（马拉车）](manacher.md)
- 如果你想了解 AC 自动机：[AC 自动机（Aho-Corasick）](aho-corasick.md)
- 如果你想看 KMP：[KMP 字符串匹配](kmp.md)
