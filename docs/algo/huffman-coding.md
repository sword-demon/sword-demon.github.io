---
title: 哈夫曼编码
description: 哈夫曼编码（Huffman Coding）—— 贪心构建最优前缀编码，实现无损压缩
date: 2026-06-14 10:00:00
categories:
  - Algorithm
tags:
  - huffman-coding
  - greedy
  - tree
  - compression
sidebarSort: 46
---

# 哈夫曼编码（Huffman Coding）

你有没有想过，为什么 `.zip` 文件比原始文件小那么多？或者为什么 JPEG 图片能把一张高清照片压到几百 KB？压缩的核心秘密之一，就是**编码**——用更少的比特表示更常见的数据。

哈夫曼编码就是这个领域的经典算法。它是 1952 年 David Huffman 在读研究生时发明的（据说原本是教授布置的作业，结果他直接交了个最优解 😂）。到今天，它依然是很多压缩算法的基础组件，比如 gzip、PNG、MP3 里都能看到它的影子。

## 为什么需要哈夫曼编码？

先来聊聊问题背景。我们知道计算机里所有字符都是用二进制编码的。最简单的方案是**定长编码**——每个字符用相同长度的比特数：

```
字符:  A    B    C    D    E
定长: 000  001  010  011  100   （每个 3 位）
```

但问题来了：不同字符出现的频率差别很大。比如英文文本中 `E` 出现频率约 12.7%，而 `Z` 只有 0.07%。如果高频字符用短编码、低频字符用长编码，总长度不就缩短了吗？

```
场景：一个文件有 1000 个字符，频率如下

字符   频率    定长编码    定长总bit    变长编码    变长总bit
 A     45%     000 (3位)   1350        0 (1位)      450
 B     13%     001 (3位)    390       101 (3位)     390
 C     12%     010 (3位)    360       100 (3位)     360
 D     16%     011 (3位)    480       111 (3位)     480
 E      9%     100 (3位)    270       1101 (4位)    360
 F      5%     101 (3位)    150       1100 (4位)    200

定长总: 3000 bit
变长总: 2240 bit  ← 节省了 25%！
```

但变长编码有个麻烦：如果 `A=0`、`B=01`、`C=011`，那 `011` 到底是 `A+B` 还是 `C`？这就产生了**歧义**。

解决办法就是使用**前缀编码**（prefix code）：任何一个字符的编码都不是另一个字符编码的前缀。这样就能无歧义地解码了。而哈夫曼编码就是一种**最优前缀编码**——在所有前缀编码中，它的加权路径长度最短。

## 原理拆解

哈夫曼编码的核心思想只有一句话：**让出现频率高的字符离根近，频率低的离根远**。

怎么做到呢？用贪心策略自底向上构建一棵二叉树。

### 构建步骤

```
假设字符频率：A:5  B:9  C:12  D:13  E:16  F:45

第1步：把每个字符看作一个节点，放入最小堆（按频率排序）

   [A:5] [B:9] [C:12] [D:13] [E:16] [F:45]

第2步：取出频率最小的两个节点 A(5) 和 B(9)，合并成新节点

        (14)
       /    \
    [A:5]  [B:9]

   堆里现在：[C:12] [D:13] [E:16] [(14):14] [F:45]

第3步：取出最小的两个 C(12) 和 D(13)，合并

        (25)              (14)
       /    \            /    \
   [C:12] [D:13]      [A:5]  [B:9]

   堆里：[(14):14] [E:16] [(25):25] [F:45]

第4步：取出 (14) 和 E(16)，合并

        (30)               (25)
       /    \             /    \
    (14)   [E:16]     [C:12] [D:13]
   /    \
[A:5]  [B:9]

   堆里：[(25):25] [(30):30] [F:45]

第5步：取出 (25) 和 (30)，合并

        (55)                    [F:45]
       /    \
    (25)    (30)
   /    \   /    \
[C:12][D:13](14)[E:16]
             /    \
          [A:5]  [B:9]

   堆里：[F:45] [(55):55]

第6步：取出 F(45) 和 (55)，合并成根节点

              (100)
             /     \
         [F:45]   (55)
                  /    \
               (25)    (30)
              /    \   /    \
          [C:12][D:13](14)[E:16]
                      /    \
                   [A:5]  [B:9]
```

### 生成编码

从根节点出发，左走记 `0`，右走记 `1`，走到叶子节点就是该字符的编码：

```
              (100)
             /     \
          0/       1\
        [F:45]     (55)
                  /    \
               0/      1\
             (25)      (30)
            /    \    /    \
          0/    1\  0/    1\
       [C:12] [D:13](14) [E:16]
                   /    \
                 0/     1\
              [A:5]   [B:9]

编码结果：
  F = 0        (1位)   频率最高 → 最短编码 ✅
  C = 100      (3位)
  D = 101      (3位)
  A = 1100     (4位)
  B = 1101     (4位)
  E = 111      (3位)

总 bit = 45×1 + 12×3 + 13×3 + 5×4 + 9×4 + 16×3 = 224 bit
```

### 关键性质

1. **最优性**：哈夫曼编码是所有前缀编码中平均编码长度最短的
2. **贪心正确性**：频率最低的两个节点一定在最深层，可以安全合并
3. **满二叉树**：构建出来的树每个内部节点都恰好有两个子节点

## 代码实现

### 核心数据结构

我们需要一个优先队列（最小堆）来不断取出频率最小的节点。每次取出两个最小的，合并后放回去，直到只剩一个节点。

### TypeScript 实现

```typescript
/**
 * 哈夫曼编码 —— TypeScript 实现
 * 核心思路：用最小堆贪心合并频率最低的两个节点
 */

// 树节点
class HuffmanNode {
  char: string | null;  // 叶子节点才有字符
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;

  constructor(char: string | null, freq: number,
              left: HuffmanNode | null = null,
              right: HuffmanNode | null = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

// 简易最小堆（只展示关键方法）
class MinHeap {
  private heap: HuffmanNode[] = [];

  push(node: HuffmanNode): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): HuffmanNode | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }

  get size(): number { return this.heap.length; }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[parent].freq <= this.heap[i].freq) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].freq < this.heap[smallest].freq)
        smallest = left;
      if (right < n && this.heap[right].freq < this.heap[smallest].freq)
        smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}
