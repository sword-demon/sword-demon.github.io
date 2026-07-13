---
title: AC 自动机
description: AC 自动机（Aho-Corasick）—— 多模式字符串匹配利器，四语言实现
date: 2026-07-12 09:20:06
categories:
  - Algorithm
tags:
  - aho-corasick
  - string-matching
  - trie
  - automaton
  - interview
sidebarSort: 62
---

# AC 自动机（Aho-Corasick）

面试官：\"给你一个敏感词列表（比如几千个词），然后给一段文本，问你这篇文本里出现了哪些敏感词。\"\n\n你可能会想——这不就是 KMP 吗？每个词跑一遍 KMP，复杂度是 O(m×n)，其中 m 是模式串长度之和，n 是文本长度。如果有 1000 个敏感词，那就要跑 1000 次 KMP，太慢了。

更聪明的做法是：把这 1000 个敏感词**合并成一棵前缀树（Trie）**，然后在文本上只扫一遍。这就是 **AC 自动机** 的核心思想 —— 它本质上是 KMP 的多模式扩展，让你在 O(n) 时间内完成多模式匹配 ✨

## 问题引入

先来说说为什么需要 AC 自动机。假设我们有这些敏感词：

```
[\"农药\", \"杀虫剂\", \"毒药\", \"赌博\", \"涉黄\"]
```

要在一篇文章里检测出现了哪些敏感词，暴力做法：

```typescript
// 暴力做法：每个敏感词都用 KMP 匹配一次
function violentMatch(text: string, patterns: string[]): string[] {
  const found: string[] = [];
  for (const pattern of patterns) {
    if (kmp(text, pattern) !== -1) {
      found.push(pattern);
    }
  }
  return found;
}

// 时间复杂度：O(patterns.length × n) = O(m × n)
// 如果有 1000 个敏感词，那就是 1000n 次比较 💥
```

这就是典型的\"用蛮力解决问题\"。我们能不能把所有敏感词合并在一起，只扫一遍文本？

## 原理拆解

### 核心思想：Trie + 失败指针

AC 自动机是 Alfred Aho 和 Margaret Corasick 在 1975 年提出的算法。它结合了 **Trie 树** 的空间共享和 **KMP 的失败转移** 思想。

```
Trie 树结构（存储所有敏感词）：

                    [根]
                   / | \\
                  农 赌 涉
                 /   |   \\
               农    博    黄
              /
            药
           /
         剂

对应敏感词：农药、杀虫剂、毒药、赌博、涉黄
```

有了 Trie 树，我们可以用类似 KMP 的方式在文本上做匹配：
- 沿着 Trie 往下走，如果匹配就继续
- 如果匹配失败，就跳到\"失败指针\"指向的节点（类似 KMP 的 next 数组）
- 失败指针指向的是：当前串的最长后缀，同时这个后缀也是某个词的前缀

### 失败指针的作用

想象你在文本 \"农药有毒\" 中匹配。当匹配完 \"农药\" 后，下一个字符是 \"有\"，但 Trie 树根节点的子节点没有 \"有\"。这时候：

```
当前状态：已匹配 \"农药\"，停在 \"药\" 节点
遇到不匹配字符：'有'

没有失败指针的话：你只能从根重新开始匹配\"有...\"
有失败指针的话：跳到 \"农药\" 的最长后缀（同时是某词前缀）的位置

\"农药\" 的后缀：
  - \"农药\" 本身 → 是完整词，可以输出
  - \"药\" → 作为一个字符，有没有以\"药\"开头的词？没有
  - \"\" → 回到根节点

所以失败指针应该指向根节点（或者指向\"药\"，但\"药\"下面没有词）
```

但更复杂的例子更能说明问题：

```
敏感词：[\"he\", \"she\", \"his\", \"hers\"]

Trie 结构：
                    [根]
                   / | \\
                  h  i  s
                 /   |   \\
               e     s     h
              /|\\    |    |
             e i r   h    e
             |   |    |
             r   s    e

构建失败指针后：
- \"he\" 节点的失败指针 → 指向根的 'e' 子节点（如果有的话）
- \"she\" 节点的失败指针 → 指向 \"he\" 节点的失败指针的 'h' 子节点
- ...
```

### 匹配过程图解

用文本 \"ushers\" 匹配敏感词 [\"she\", \"he\"]：

```
Trie 树（带失败指针）：

                    [根]
                   / | \\
                  h  i  s
                 /   |   \\
               e     s     h
              /|     |     |
             e i     h     e
             |       |
             r       e

构建好的失败指针（简化版）：
- \"she\" 的 'e' → 指向 \"he\" 的 'e'
- \"he\" 的 'e' → 指向根

匹配 \"ushers\"：

字符 'u': 根没有 'u' → 停在根 → 无输出
字符 's': 根有 's' → 移动到 's' 节点 → 无输出
字符 'h': 's' 节点有 'h' → 移动到 \"sh\" 节点 → 无输出
字符 'e': \"she\" 节点有 'e' → 移动到 \"she\" 节点
         同时沿失败指针检查 → 发现 \"he\" 也匹配！
         输出: \"she\", \"he\"
字符 'r': \"she\" 节点有 'r' → 移动到 \"sher\" 节点 → 无输出
字符 's': \"sher\" 节点没有 's' → 沿失败指针回退
         回退到 \"she\" 的失败指针 \"he\" → 'e' 节点没有 's' 子节点
         再回退到根 → 根有 's' → 移动到 's' 节点
         → 无输出

最终输出：\"she\", \"he\"
```

关键点：**沿着失败指针回退时，要检查沿途所有节点是否对应完整匹配**。因为一个节点可能同时是多个词的后缀。

### 构建失败指针的算法

失败指针的构建用 **BFS（广度优先搜索）**，按层遍历：

```typescript
// 构建失败指针的核心代码
function buildFailurePointer(root: TrieNode): void {
  const queue: TrieNode[] = [];
  
  // 第一层：根的直接子节点的失败指针都指向根
  for (const child of Object.values(root.children)) {
    child.fail = root;
    queue.push(child);
  }
  
  // BFS 遍历
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    for (const [char, child] of Object.entries(current.children)) {
      queue.push(child);
      
      // 找到当前节点的失败指针
      let failTarget = current.fail;
      while (failTarget !== root && !failTarget.children[char]) {
        failTarget = failTarget.fail;
      }
      
      // 如果能找到匹配的，就指向它；否则指向根
      child.fail = failTarget.children[char] || root;
      
      // 标记是否为敏感词结尾（用于输出）
      if (child.fail.isEnd) {
        child.isSensitive = true;
      }
    }
  }
}
```

## 代码实现

### TypeScript

```typescript
/**
 * AC 自动机 —— TypeScript 实现
 * 核心思路：Trie 树 + 失败指针，在 O(n) 时间内完成多模式匹配
 */

interface TrieNode {
  children: Map<string, TrieNode>; // 子节点，用 Map 方便按字符查找
  fail: TrieNode;                 // 失败指针
  isEnd: boolean;                 // 是否是某个模式的结尾
  output: string[];               // 以该节点结尾的所有模式（可能有多个，如 "she" 和 "he"）
  depth: number;                 // 节点深度（用于构建失败指针）
}

class AhoCorasick {
  private root: TrieNode;

  constructor() {
    this.root = this.createNode(0);
  }

  private createNode(depth: number): TrieNode {
    return {
      children: new Map(),
      fail: this.root, // 默认为根节点
      isEnd: false,
      output: [],
      depth,
    };
  }

  /** 插入一个模式串 */
  insert(pattern: string): void {
    let node = this.root;
    for (const char of pattern) {
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode(node.depth + 1));
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
    node.output.push(pattern);
  }

  /** 构建失败指针 —— 核心算法 */
  build(): void {
    const queue: TrieNode[] = [];

    // 第一层：根的直接子节点的失败指针都指向根
    for (const child of this.root.children.values()) {
      child.fail = this.root;
      queue.push(child);
    }

    // BFS 构建失败指针
    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const [char, child] of current.children) {
        queue.push(child);

        // 1. 找到 child 的失败指针
        let failTarget = current.fail;
        // 沿着失败指针回退，直到找到有 char 子节点或者回到根
        while (failTarget !== this.root && !failTarget.children.has(char)) {
          failTarget = failTarget.fail;
        }
        // 如果能在失败路径上找到 char，就用它；否则用根
        child.fail = failTarget.children.get(char) || this.root;

        // 2. 合并 output：当前节点的输出 + 失败指针指向的节点的输出
        if (child.fail.isEnd) {
          // 如果失败指针指向的节点是某个词的结尾，这个节点也"继承"这个属性
          child.output = [...child.output, ...child.fail.output];
        }
      }
    }
  }

  /**
   * 在文本上搜索，返回所有匹配的模式串
   * @param text 待搜索的文本
   * @returns 匹配到的所有模式（可能有重复）
   */
  search(text: string): string[] {
    const results: string[] = [];
    let current = this.root;

    for (const char of text) {
      // 1. 如果当前节点的子节点没有 char，沿着失败指针回退
      while (current !== this.root && !current.children.has(char)) {
        current = current.fail;
      }

      // 2. 如果能匹配就往下走
      if (current.children.has(char)) {
        current = current.children.get(char)!;
      }

      // 3. 检查是否有匹配（可能是多个）
      for (const pattern of current.output) {
        results.push(pattern);
      }
    }

    return results;
  }

  /**
   * 在文本上搜索，返回每个匹配的位置和模式
   * @param text 待搜索的文本
   * @returns 匹配详情
   */
  searchWithIndex(text: string): Array<{ index: number; pattern: string; length: number }> {
    const results: Array<{ index: number; pattern: string; length: number }> = [];
    let current = this.root;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // 沿失败指针回退
      while (current !== this.root && !current.children.has(char)) {
        current = current.fail;
      }

      // 往下走
      if (current.children.has(char)) {
        current = current.children.get(char)!;
      }

      // 记录所有匹配
      for (const pattern of current.output) {
        results.push({
          index: i - pattern.length + 1,
          pattern,
          length: pattern.length,
        });
      }
    }

    return results;
  }
}

// 使用示例
const ac = new AhoCorasick();
const patterns = ['she', 'he', 'his', 'hers'];
patterns.forEach((p) => ac.insert(p));
ac.build();

const text = 'ushers';
console.log('文本:', text);
console.log('匹配结果:', ac.search(text)); // ['she', 'he']

// 搜索敏感词过滤
const sensitiveWords = ['农药', '杀虫剂', '毒药', '赌博', '涉黄'];
const ac2 = new AhoCorasick();
sensitiveWords.forEach((w) => ac2.insert(w));
ac2.build();

const article = '这是一篇关于农药使用的文章，有人建议用杀虫剂来处理害虫，但我们不能涉及赌博活动。';
console.log('文章:', article);
console.log('敏感词:', ac2.search(article)); // ['农药', '杀虫剂', '赌博']
```

### Go

```go
package ac

import (
	"fmt"
)

// TrieNode AC自动机的Trie节点
type TrieNode struct {
	Children map[rune]*TrieNode // 子节点
	Fail    *TrieNode           // 失败指针
	IsEnd   bool                // 是否是某个模式的结尾
	Output  []string            // 以该节点结尾的所有模式
	Depth   int                 // 深度
}

// AhoCorasick AC自动机
type AhoCorasick struct {
	root *TrieNode
}

// New 创建新的AC自动机
func New() *AhoCorasick {
	root := newNode(0)
	return &AhoCorasick{root: root}
}

func newNode(depth int) *TrieNode {
	return &TrieNode{
		Children: make(map[rune]*TrieNode),
		Fail:     nil,
		IsEnd:    false,
		Output:   []string{},
		Depth:    depth,
	}
}

// Insert 插入一个模式串
func (ac *AhoCorasick) Insert(pattern string) {
	node := ac.root
	for _, char := range pattern {
		if _, ok := node.Children[char]; !ok {
			node.Children[char] = newNode(node.Depth + 1)
		}
		node = node.Children[char]
	}
	node.IsEnd = true
	node.Output = append(node.Output, pattern)
}

// Build 构建失败指针
func (ac *AhoCorasick) Build() {
	ac.root.Fail = ac.root

	queue := []*TrieNode{}

	// 第一层子节点的失败指针指向根
	for _, child := range ac.root.Children {
		child.Fail = ac.root
		queue = append(queue, child)
	}

	// BFS 构建
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		for char, child := range current.Children {
			queue = append(queue, child)

			// 找到失败指针
			failTarget := current.Fail
			for failTarget != ac.root {
				if _, ok := failTarget.Children[char]; ok {
					break
				}
				failTarget = failTarget.Fail
			}

			if _, ok := failTarget.Children[char]; ok {
				child.Fail = failTarget.Children[char]
			} else {
				child.Fail = ac.root
			}

			// 合并输出
			if child.Fail.IsEnd {
				child.Output = append(child.Output, child.Fail.Output...)
			}
		}
	}
}

// Search 在文本上搜索
func (ac *AhoCorasick) Search(text string) []string {
	var results []string
	current := ac.root

	for _, char := range text {
		for current != ac.root {
			if _, ok := current.Children[char]; ok {
				break
			}
			current = current.Fail
		}

		if _, ok := current.Children[char]; ok {
			current = current.Children[char]
		}

		results = append(results, current.Output...)
	}

	return results
}

// SearchWithIndex 返回每个匹配的详情
func (ac *AhoCorasick) SearchWithIndex(text string) []struct {
	Index   int
	Pattern string
	Length  int
} {
	var results []struct {
		Index   int
		Pattern string
		Length  int
	}
	current := ac.root

	for i, char := range text {
		for current != ac.root {
			if _, ok := current.Children[char]; ok {
				break
			}
			current = current.Fail
		}

		if _, ok := current.Children[char]; ok {
			current = current.Children[char]
		}

		for _, pattern := range current.Output {
			results = append(results, struct {
				Index   int
				Pattern string
				Length  int
			}{
				Index:   i - len([]rune(pattern)) + 1,
				Pattern: pattern,
				Length:  len([]rune(pattern)),
			})
		}
	}

	return results
}

func main() {
	ac := New()
	patterns := []string{"she", "he", "his", "hers"}
	for _, p := range patterns {
		ac.Insert(p)
	}
	ac.Build()

	text := "ushers"
	fmt.Printf("文本: %s\\n", text)
	fmt.Printf("匹配结果: %v\\n", ac.Search(text))

	// 敏感词过滤示例
	ac2 := New()
	sensitive := []string{"农药", "杀虫剂", "毒药"}
	for _, w := range sensitive {
		ac2.Insert(w)
	}
	ac2.Build()

	article := "使用农药要小心，杀虫剂效果不错"
	fmt.Printf("文章: %s\\n", article)
	fmt.Printf("敏感词: %v\\n", ac2.Search(article))
}
```

### Java

```java
import java.util.*;

/**
 * AC 自动机 —— Java 实现
 */
public class AhoCorasick {

    private static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        TrieNode fail;               // 失败指针
        boolean isEnd;                // 是否是某个模式的结尾
        List<String> output = new ArrayList<>(); // 以该节点结尾的所有模式
        int depth;                    // 深度

        TrieNode(int depth) {
            this.depth = depth;
            this.fail = null;
            this.isEnd = false;
        }
    }

    private TrieNode root;

    public AhoCorasick() {
        this.root = new TrieNode(0);
        this.root.fail = this.root;
    }

    /** 插入一个模式串 */
    public void insert(String pattern) {
        TrieNode node = root;
        for (char c : pattern.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode(node.depth + 1));
            node = node.children.get(c);
        }
        node.isEnd = true;
        node.output.add(pattern);
    }

    /** 构建失败指针 —— BFS */
    public void build() {
        Queue<TrieNode> queue = new LinkedList<>();

        // 第一层子节点的失败指针指向根
        for (TrieNode child : root.children.values()) {
            child.fail = root;
            queue.offer(child);
        }

        // BFS 遍历
        while (!queue.isEmpty()) {
            TrieNode current = queue.poll();

            for (Map.Entry<Character, TrieNode> entry : current.children.entrySet()) {
                char c = entry.getKey();
                TrieNode child = entry.getValue();
                queue.offer(child);

                // 找失败指针
                TrieNode failTarget = current.fail;
                while (failTarget != root && !failTarget.children.containsKey(c)) {
                    failTarget = failTarget.fail;
                }

                if (failTarget.children.containsKey(c)) {
                    child.fail = failTarget.children.get(c);
                } else {
                    child.fail = root;
                }

                // 合并输出
                if (child.fail.isEnd) {
                    child.output.addAll(child.fail.output);
                }
            }
        }
    }

    /** 搜索文本，返回所有匹配的模式 */
    public List<String> search(String text) {
        List<String> results = new ArrayList<>();
        TrieNode current = root;

        for (char c : text.toCharArray()) {
            while (current != root && !current.children.containsKey(c)) {
                current = current.fail;
            }

            if (current.children.containsKey(c)) {
                current = current.children.get(c);
            }

            results.addAll(current.output);
        }

        return results;
    }

    /** 搜索文本，返回匹配详情 */
    public List<MatchResult> searchWithIndex(String text) {
        List<MatchResult> results = new ArrayList<>();
        TrieNode current = root;

        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);

            while (current != root && !current.children.containsKey(c)) {
                current = current.fail;
            }

            if (current.children.containsKey(c)) {
                current = current.children.get(c);
            }

            for (String pattern : current.output) {
                results.add(new MatchResult(
                    i - pattern.length() + 1,
                    pattern
                ));
            }
        }

        return results;
    }

    /** 匹配结果 */
    public record MatchResult(int index, String pattern) {}

    // 使用示例
    public static void main(String[] args) {
        AhoCorasick ac = new AhoCorasick();
        String[] patterns = {"she", "he", "his", "hers"};
        for (String p : patterns) {
            ac.insert(p);
        }
        ac.build();

        String text = "ushers";
        System.out.println("文本: " + text);
        System.out.println("匹配结果: " + ac.search(text));

        // 敏感词过滤
        AhoCorasick ac2 = new AhoCorasick();
        String[] sensitive = {"农药", "杀虫剂", "赌博"};
        for (String w : sensitive) {
            ac2.insert(w);
        }
        ac2.build();

        String article = "这是一篇关于农药使用的文章";
        System.out.println("文章: " + article);
        System.out.println("敏感词: " + ac2.search(article));
    }
}
```

### Python

```python
from collections import defaultdict, deque
from typing import List, Dict, Tuple, Optional


class TrieNode:
    """Trie 树的节点"""
    def __init__(self, depth: int = 0):
        self.children: Dict[str, 'TrieNode'] = defaultdict(lambda: TrieNode())
        self.fail: Optional['TrieNode'] = None  # 失败指针
        self.is_end: bool = False              # 是否是某个模式的结尾
        self.output: List[str] = []             # 以该节点结尾的所有模式
        self.depth: int = depth


class AhoCorasick:
    """AC 自动机 —— Python 实现

    核心思想：Trie 树 + 失败指针，在 O(n) 时间内完成多模式匹配。

    为什么叫 AC 自动机：因为是 Aho 和 Corasick 发明的算法，
    名字叫 Aho-Corasick automaton。
    """

    def __init__(self):
        self.root = TrieNode()

    def insert(self, pattern: str) -> None:
        """插入一个模式串"""
        node = self.root
        for char in pattern:
            node = node.children[char]
        node.is_end = True
        node.output.append(pattern)

    def build(self) -> None:
        """构建失败指针 —— BFS 遍历

        为什么用 BFS：
        - 失败指针指向的是当前串的最长后缀（同时是某词的前缀）
        - 这个后缀的长度一定比当前串短，所以可以按层遍历保证依赖关系
        """
        self.root.fail = self.root
        queue = deque()

        # 第一层：根的直接子节点的失败指针都指向根
        for child in self.root.children.values():
            child.fail = self.root
            queue.append(child)

        # BFS 构建失败指针
        while queue:
            current = queue.popleft()

            for char, child in current.children.items():
                queue.append(child)

                # 找失败指针
                fail_target = current.fail
                while fail_target != self.root and char not in fail_target.children:
                    fail_target = fail_target.fail

                # 能找到就指向它，否则指向根
                if char in fail_target.children:
                    child.fail = fail_target.children[char]
                else:
                    child.fail = self.root

                # 合并输出列表（当前节点的输出 + 失败节点的输出）
                if child.fail.is_end:
                    child.output.extend(child.fail.output)

    def search(self, text: str) -> List[str]:
        """在文本上搜索，返回所有匹配的模式

        时间复杂度：O(n + m + z)
        - n: 文本长度
        - m: 所有模式串的长度之和
        - z: 匹配结果的数量
        """
        results = []
        current = self.root

        for char in text:
            # 如果当前节点的子节点没有 char，沿失败指针回退
            while current != self.root and char not in current.children:
                current = current.fail

            # 如果能匹配就往下走
            if char in current.children:
                current = current.children[char]

            # 收集所有匹配
            results.extend(current.output)

        return results

    def search_with_index(self, text: str) -> List[Tuple[int, str]]:
        """搜索并返回匹配的位置和模式

        Returns:
            List of (start_index, pattern) tuples
        """
        results = []
        current = self.root

        for i, char in enumerate(text):
            while current != self.root and char not in current.children:
                current = current.fail

            if char in current.children:
                current = current.children[char]

            for pattern in current.output:
                start_index = i - len(pattern) + 1
                results.append((start_index, pattern))

        return results

    def replace(self, text: str, repl: str = '*') -> str:
        """将文本中所有匹配的模式替换为指定字符（用于敏感词过滤）

        Args:
            text: 原始文本
            repl: 替换字符，默认 '*'

        Returns:
            替换后的文本
        """
        results = self.search_with_index(text)
        if not results:
            return text

        # 按位置排序，从后往前替换（避免索引偏移）
        results.sort(key=lambda x: x[0], reverse=True)

        text_list = list(text)
        for start, pattern in results:
            for j in range(start, start + len(pattern)):
                text_list[j] = repl

        return ''.join(text_list)


# 使用示例
if __name__ == '__main__':
    # 基础示例
    ac = AhoCorasick()
    patterns = ['she', 'he', 'his', 'hers']
    for p in patterns:
        ac.insert(p)
    ac.build()

    text = 'ushers'
    print(f'文本: {text}')
    print(f'匹配结果: {ac.search(text)}')  # ['she', 'he']

    # 搜索带位置
    print(f'匹配详情: {ac.search_with_index(text)}')
    # [(2, 'she'), (1, 'he')]

    # 敏感词过滤
    print('\n=== 敏感词过滤示例 ===')
    ac2 = AhoCorasick()
    sensitive_words = ['农药', '杀虫剂', '毒药', '赌博', '涉黄']
    for w in sensitive_words:
        ac2.insert(w)
    ac2.build()

    article = '这是一篇关于农药使用的文章，有人建议用杀虫剂来处理害虫。'
    print(f'原文: {article}')
    print(f'敏感词: {ac2.search(article)}')
    print(f'过滤后: {ac2.replace(article)}')
    # 过滤后: 这是一篇关于**使用的文章，有人建议用**来处理害虫。
```

## 面试题精选

| 题号 | 题目 | AC 自动机应用 | 难度 |
| ---- | ---- | ------------- | ---- |
| 208 | 实现 Trie 树 | AC 自动机的基础 | 中等 |
| 1032 | 字符流 | 构建 AC 自动机 + 流式匹配 | 困难 |
| 批量匹配 | 敏感词过滤 | 标准 AC 自动机应用 | 中等 |
| 日志分析 | 多关键词检索 | AC 自动机 + 哈希聚合 | 中等 |

## 业务场景

### 1. 敏感词过滤 ⭐

这是 AC 自动机最经典的应用。社交平台、内容审核系统、广告过滤都会用到。

```typescript
// 敏感词过滤的完整流程
class ContentModerator {
  private ac: AhoCorasick;
  private sensitiveWords: string[];

  constructor(words: string[]) {
    this.sensitiveWords = words;
    this.ac = new AhoCorasick();
    words.forEach(w => this.ac.insert(w));
    this.ac.build();
  }

  // 检查文本是否包含敏感词
  hasViolation(text: string): boolean {
    return this.ac.search(text).length > 0;
  }

  // 获取所有敏感词
  getViolations(text: string): string[] {
    return this.ac.search(text);
  }

  // 过滤敏感词
  filter(text: string): string {
    return this.ac.replace(text, '*');
  }
}
```

### 2. 日志关键词检索

运维系统需要在海量日志中搜索多个关键词。AC 自动机可以一次性匹配所有关键词，比多次正则匹配高效得多。

```typescript
// 日志关键词统计
function countKeywords(logs: string[], keywords: string[]): Map<string, number> {
  const ac = new AhoCorasick();
  keywords.forEach(k => ac.insert(k));
  ac.build();

  const count = new Map<string, number>();
  keywords.forEach(k => count.set(k, 0));

  for (const log of logs) {
    const matches = ac.search(log);
    matches.forEach(m => count.set(m, (count.get(m) || 0) + 1));
  }

  return count;
}
```

### 3. DNA 序列匹配

生物信息学中，需要在 DNA 序列中查找多个模式（基因片段）。AC 自动机可以把几万条基因片段一次性构建成 AC 自动机，然后在大段 DNA 序列上只扫一遍就找出所有匹配。

### 4. 拼写检查 / 语法高亮

编辑器或浏览器的拼写检查，可以用 AC 自动机构建词典，然后在用户输入时实时匹配。语法高亮也可以用类似思路，把所有关键字插入 AC 自动机，然后一边扫描源代码一边高亮。

### 5. 入侵检测系统（IDS）

网络安全设备需要在网络流量中检测已知的攻击模式（签名）。每个攻击签名是一个模式串，构建一个大的 AC 自动机，把成千上万个签名放进去，然后实时扫描网络数据包，判断是否包含攻击特征。

## 复杂度分析

| 指标 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 构建 Trie | O(m) | m = 所有模式串的长度之和 |
| 构建失败指针 | O(m) | BFS 遍历所有节点 |
| 搜索文本 | O(n + z) | n = 文本长度，z = 匹配次数 |
| 空间 | O(m × σ) | σ = 字符集大小（ASCII 为 256） |

- **构建时间 O(m)**：把所有模式串插入 Trie 是 O(m)，BFS 构建失败指针也是 O(m)
- **搜索时间 O(n + z)**：每个文本字符最多走一步（匹配或不匹配），加上每个匹配结果的输出时间
- **空间 O(m × σ)**：Trie 树的空间，每个节点最多有 σ 个子节点指针（σ 是字符集大小）

### 和 KMP 的对比

| 特性 | KMP | AC 自动机 |
| ---- | --- | --------- |
| 适用场景 | 单模式匹配 | 多模式匹配 |
| 时间复杂度 | O(n + m) | O(n + m + z) |
| 预处理结构 | next 数组 | Trie + 失败指针 |
| 空间复杂度 | O(m) | O(m × σ) |

**什么时候用哪个：**
- 只有一个模式串 → KMP
- 多个模式串（几十到几千个） → AC 自动机
- 模式串非常多（百万级） → 可能需要 Aho-Corasick Double-Array Trie（DAT）

## 小结

AC 自动机的核心就是两句话：

1. **用 Trie 树存储所有模式串** —— 空间共享，避免重复存储公共前缀
2. **用失败指针实现类似 KMP 的跳转** —— 不匹配时跳到当前串的最长后缀（同时是某词前缀）的位置

掌握 AC 自动机，你就拥有了一把处理\"多模式字符串匹配\"问题的瑞士军刀 🎯

口诀：**Trie 树来存模式，失败指针是关键。匹配失败就跳转，沿途输出不能忘。O(n) 时间全搞定，敏感词过滤它最香** ✅

> **延伸阅读：**
> - 如果你需要更高效的 AC 自动机实现，可以了解 **Double-Array Trie (DAT)**，它用两个数组实现 Trie，查询效率更高，但构建更复杂
> - 对于超大规模模式匹配（如亿级签名库），可以结合 **分层 AC 自动机** 或 **硬件加速**（FPGA/网卡）

---

**相关算法：**
- [前缀树（Trie）](trie.md) —— AC 自动机的基础
- [KMP 字符串匹配](kmp.md) —— AC 自动机的单模式版本
- [Rabin-Karp 字符串哈希算法](rabin-karp.md) —— 另一种多模式匹配思路（基于哈希）
