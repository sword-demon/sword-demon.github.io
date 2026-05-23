---
title: 前缀树（Trie）
description: 前缀树/字典树（Trie）——从搜索自动补全到高性能字符串检索
date: 2026-05-21 09:30:00
categories:
  - Algorithm
tags:
  - trie
  - prefix-tree
  - string
  - hash-map
sidebarSort: 14
---

# 前缀树（Trie / Prefix Tree）

你在搜索引擎里刚敲下「herm」，下拉框就立刻弹出「hermes」「hermes bag」「hermes birkin」——这背后的核心技术之一，就是 **Trie（前缀树）**，也叫字典树。

Trie 是一种专门处理**字符串集合**的树形数据结构。它的核心能力：**按前缀快速查找**。给定一个字符串集合，你可以在 O(L) 时间内判断某个字符串是否存在（L 是字符串长度），而不依赖集合大小 N。这个特性让它在搜索补全、拼写检查、IP 路由等场景中大放异彩。

听起来很厉害？别急，我们从头拆解。

## 原理拆解

### 1. 什么是 Trie？

假设我们有一组单词：`["her", "hermes", "hi", "hit", "hello"]`。用 Trie 存储后，长这样：

```
        (root)
       /   |    \
      h    ...   ...
      |
      e    i
      |    |
      r    (end) ← "hi"
      |    |
      m    t
      |    |
      (end) (end) ← "hit"
      |
      e
      |
      s
      |
      (end) ← "hermes"

(还有 hello 分支，省略)
```

几个关键特征：

- **根节点**是空的，不代表任何字符
- 从根到某个节点的**路径**拼起来，就是一个字符串的**前缀**
- 某些节点标记为**单词结尾**（`isEnd`），表示从根到这个节点的路径是一个完整的单词
- **公共前缀共享节点**：「her」和「hermes」共享了 `h → e → r` 这条路径

### 2. 节点结构

一个 Trie 节点需要什么？

```typescript
class TrieNode {
  children: Map<string, TrieNode>;  // 子节点映射
  isEnd: boolean;                   // 是否是某个单词的结尾
}
```

为什么用 `Map` 而不是固定大小的数组？因为如果只处理小写字母，你可以用 `Array(26)` 来优化；但如果要处理 Unicode（比如中文、emoji），`Map` 更通用。

### 3. 核心操作

#### 插入（Insert）

逐字符向下走，遇到不存在的节点就创建，走完后标记最后一个节点为单词结尾。

```
插入 "cat"：
1. 根节点 → 找 'c'，不存在 → 创建
2. 'c' 节点 → 找 'a'，不存在 → 创建
3. 'a' 节点 → 找 't'，不存在 → 创建
4. 标记 't' 节点 isEnd = true
```

时间复杂度：**O(L)**，L 为插入字符串的长度。

#### 查找（Search）

逐字符向下走，如果中途某个字符不存在，直接返回 false；走完后检查最后一个节点的 `isEnd`。

```
查找 "her"：
1. 根 → 'h' ✅ → 'e' ✅ → 'r' ✅
2. 检查 'r' 节点 isEnd = true ✅ → 找到了！

查找 "he"：
1. 根 → 'h' ✅ → 'e' ✅
2. 检查 'e' 节点 isEnd = false ❌ → 不是完整单词
```

时间复杂度：**O(L)**。

#### 前缀查找（StartsWith）

和 Search 类似，但**不检查 isEnd**——只要路径存在就返回 true。这就是自动补全的基础。

#### 自动补全（Autocomplete）

先通过前缀找到对应的子树根节点，然后**遍历这棵子树**，收集所有 `isEnd = true` 的路径。

```
前缀 "her" → 找到节点 'r'
  → 遍历子树：
    - 'r' 的 isEnd = true → "her" ✅
    - 'r' → 'm' → 'e' → 's' isEnd = true → "hermes" ✅
  → 结果：["her", "hermes"]
```

## 代码实现

### TypeScript 完整实现

```typescript
class TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;

  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class Trie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  /** 插入一个单词 */
  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
  }

  /** 查找完整单词 */
  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  /** 前缀查找 */
  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }

  /** 自动补全：返回所有以 prefix 开头的单词 */
  autocomplete(prefix: string, limit: number = 10): string[] {
    const node = this.findNode(prefix);
    if (!node) return [];

    const results: string[] = [];
    this.dfs(node, prefix, results, limit);
    return results;
  }

  /** 删除一个单词 */
  delete(word: string): boolean {
    return this.deleteHelper(this.root, word, 0);
  }

  private findNode(prefix: string): TrieNode | null {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char)!;
    }
    return node;
  }

  private dfs(
    node: TrieNode,
    prefix: string,
    results: string[],
    limit: number
  ): void {
    if (results.length >= limit) return;
    if (node.isEnd) results.push(prefix);
    for (const [char, child] of node.children) {
      this.dfs(child, prefix + char, results, limit);
    }
  }

  private deleteHelper(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) {
      if (!node.isEnd) return false; // 单词不存在
      node.isEnd = false;
      return node.children.size === 0; // 如果没有子节点，可以删除这个节点
    }

    const char = word[depth];
    const child = node.children.get(char);
    if (!child) return false;

    const shouldDeleteChild = this.deleteHelper(child, word, depth + 1);

    if (shouldDeleteChild) {
      node.children.delete(char);
      return node.children.size === 0 && !node.isEnd;
    }

    return false;
  }
}
```

### TypeScript 使用示例

```typescript
const trie = new Trie();

// 插入单词
trie.insert("her");
trie.insert("hermes");
trie.insert("hello");
trie.insert("hi");

// 查找
console.log(trie.search("her"));     // true
console.log(trie.search("he"));      // false（前缀存在，但不是完整单词）
console.log(trie.search("hero"));    // false

// 前缀查找
console.log(trie.startsWith("her")); // true
console.log(trie.startsWith("xyz")); // false

// 自动补全
console.log(trie.autocomplete("he")); // ["her", "hermes", "hello"]
console.log(trie.autocomplete("hi")); // ["hi"]
```

### Java 完整实现

```java
import java.util.*;

class TrieNode {
    Map<Character, TrieNode> children;
    boolean isEnd;

    public TrieNode() {
        children = new HashMap<>();
        isEnd = false;
    }
}

class Trie {
    private final TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    /** 插入一个单词 */
    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.isEnd = true;
    }

    /** 查找完整单词 */
    public boolean search(String word) {
        TrieNode node = findNode(word);
        return node != null && node.isEnd;
    }

    /** 前缀查找 */
    public boolean startsWith(String prefix) {
        return findNode(prefix) != null;
    }

    /** 自动补全：返回所有以 prefix 开头的单词 */
    public List<String> autocomplete(String prefix) {
        return autocomplete(prefix, 10);
    }

    public List<String> autocomplete(String prefix, int limit) {
        TrieNode node = findNode(prefix);
        if (node == null) return Collections.emptyList();

        List<String> results = new ArrayList<>();
        dfs(node, prefix, results, limit);
        return results;
    }

    /** 删除一个单词 */
    public boolean delete(String word) {
        return deleteHelper(root, word, 0);
    }

    private TrieNode findNode(String prefix) {
        TrieNode node = root;
        for (char c : prefix.toCharArray()) {
            if (!node.children.containsKey(c)) return null;
            node = node.children.get(c);
        }
        return node;
    }

    private void dfs(TrieNode node, String prefix, List<String> results, int limit) {
        if (results.size() >= limit) return;
        if (node.isEnd) results.add(prefix);
        for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
            dfs(entry.getValue(), prefix + entry.getKey(), results, limit);
        }
    }

    private boolean deleteHelper(TrieNode node, String word, int depth) {
        if (depth == word.length()) {
            if (!node.isEnd) return false; // 单词不存在
            node.isEnd = false;
            return node.children.isEmpty(); // 如果没有子节点，可以删除这个节点
        }

        char c = word.charAt(depth);
        TrieNode child = node.children.get(c);
        if (child == null) return false;

        boolean shouldDeleteChild = deleteHelper(child, word, depth + 1);

        if (shouldDeleteChild) {
            node.children.remove(c);
            return node.children.isEmpty() && !node.isEnd;
        }

        return false;
    }
}
```

### Java 使用示例

```java
public class Main {
    public static void main(String[] args) {
        Trie trie = new Trie();

        // 插入单词
        trie.insert("her");
        trie.insert("hermes");
        trie.insert("hello");
        trie.insert("hi");

        // 查找
        System.out.println(trie.search("her"));     // true
        System.out.println(trie.search("he"));      // false（前缀存在，但不是完整单词）
        System.out.println(trie.search("hero"));    // false

        // 前缀查找
        System.out.println(trie.startsWith("her")); // true
        System.out.println(trie.startsWith("xyz")); // false

        // 自动补全
        System.out.println(trie.autocomplete("he")); // [her, hermes, hello]
        System.out.println(trie.autocomplete("hi")); // [hi]

        // 删除
        System.out.println(trie.delete("her"));     // true
        System.out.println(trie.search("her"));     // false
        System.out.println(trie.search("hermes"));  // true（子节点保留）
    }
}
```

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 插入 | O(L) | O(L) |
| 查找 | O(L) | O(1) |
| 前缀查找 | O(L) | O(1) |
| 自动补全 | O(L + R) | O(L + R) |
| 删除 | O(L) | O(1) |

- **L** = 字符串长度
- **R** = 匹配前缀的结果数量

注意：自动补全的复杂度取决于匹配结果的数量，最坏情况下需要遍历整棵子树。

## Trie vs HashMap vs BST

你可能会问：我用 `Set<string>` 不也能判断字符串是否存在吗？

| 场景 | Trie | HashMap/Set | BST（有序） |
|------|------|-------------|------------|
| 精确查找 | O(L) | O(L) 哈希计算 | O(L·logN) |
| 前缀查找 | O(L) ✅ | ❌ 不支持 | 部分支持 |
| 自动补全 | O(L + R) ✅ | ❌ 不支持 | 需遍历 |
| 内存占用 | 共享前缀，省空间 | 每个字符串独立存储 | 每个字符串独立存储 |
| 有序遍历 | 前序遍历即字典序 ✅ | ❌ 无序 | ✅ 中序遍历 |

**Trie 的杀手级优势**：前缀相关操作。如果你的需求涉及「以某某开头」「模糊匹配」「自动补全」，Trie 是不二之选。

## 实际应用场景

### 1. 搜索引擎自动补全

Google、百度输入时的下拉提示。用户每敲一个键，就在 Trie 里做一次前缀查找，返回最热门的补全结果。通常还会结合**优先级队列**（按搜索频率排序）来返回 Top-K 结果。

### 2. 拼写检查

把字典里的所有单词插入 Trie，用户输入的单词如果 `search()` 返回 false，就说明可能拼错了。然后可以用**编辑距离**（Levenshtein Distance）在 Trie 里找相似的单词给出建议。

### 3. IP 路由（路由器的最长前缀匹配）

路由器的路由表本质上就是一棵 Trie，每个节点代表 IP 地址的一个 bit。路由器收到一个数据包时，用目标 IP 地址在 Trie 里走，找到**最长匹配的前缀**，就是最佳路由。

### 4. 敏感词过滤

社交平台的内容审核系统，把所有敏感词建成 Trie，然后对用户输入的文本做匹配。比逐个敏感词正则匹配快得多——只需扫描一遍文本。

## 进阶：压缩 Trie（Radix Tree / Patricia Tree）

标准 Trie 有一个问题：如果集合里只有 `["a", "ab", "abc", "abcd"]`，每个节点只有一个子节点，形成了一条**链**，大量空间被浪费。

**Radix Tree** 的优化思路：把只有一个子节点的链**压缩成一条边**：

```
标准 Trie：          Radix Tree：
  (root)              (root)
    |a                  |
    (end)              "abcd" (end) ← 同时标记 a, ab, abc, abcd
    |b
    (end)
    |c
    (end)
    |d
    (end)
```

Redis 的 Stream 底层就用 Radix Tree 来存储 Consumer Group 信息。Linux 内核的路由表也用了这种结构。

## 常见面试题

| 题目 | 难度 | 核心考点 |
|------|------|---------|
| [LeetCode 208 - Implement Trie](https://leetcode.cn/problems/implement-trie-prefix-tree/) | 🟡 中等 | Trie 基本实现 |
| [LeetCode 211 - Design Add and Search Words](https://leetcode.cn/problems/design-add-and-search-words-data-structure/) | 🟡 中等 | Trie + 通配符匹配 |
| [LeetCode 212 - Word Search II](https://leetcode.cn/problems/word-search-ii/) | 🔴 困难 | Trie + DFS 回溯 |
| [LeetCode 648 - Replace Words](https://leetcode.cn/problems/replace-words/) | 🟡 中等 | 前缀替换 |
| [LeetCode 677 - Map Sum Pairs](https://leetcode.cn/problems/map-sum-pairs/) | 🟡 中等 | Trie + 值聚合 |

## 小结

- Trie 是处理字符串集合的利器，核心优势是 **O(L) 的前缀查找**
- 自动补全、拼写检查、敏感词过滤、IP 路由都是 Trie 的经典应用
- 标准实现用 `Map<string, TrieNode>` 通用性强；如果只处理小写字母，可以用 `Array(26)` 优化
- Radix Tree 是 Trie 的压缩变体，适合前缀重叠度高的场景

下次你在搜索框里打字看到下拉提示时，就知道背后有一棵 Trie 在默默工作了 (ﾉ◕ヮ◕)ﾉ
