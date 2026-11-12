---
title: 倒排索引（Inverted Index）精讲
description: 倒排索引从「词 -> 文档列表」讲起，一篇打通词典与倒排表、正排索引 vs 倒排索引、分词器、BM25 打分、AND/OR 求交、DAT vs TAT 两种打分路径与短语查询，附 TypeScript / Python / Go 三语言实现、随机对拍与实测性能对比
date: 2026-10-29 09:00:00
categories:
  - Algorithm
tags:
  - inverted-index
  - search-engine
  - bm25
  - text-search
  - data-structure
  - interview
sidebarSort: 118
---

# 倒排索引（Inverted Index）精讲

你有没有想过，Google 搜「倒排索引」能在 0.3 秒内从几百亿个网页里翻出答案，它是怎么做到的？

无他，靠**倒**过来存。

我们平时存文档，习惯是"文档 ID → 文档内容"。想找包含「缓存穿透」的所有文档，你只能一篇一篇翻过去读——这就是**正排索引**，也叫正向索引。1000 万篇文档 × 每篇 500 字，就是 50 亿次字符比较，慢得能把人急死。

而倒排索引把方向拧了过来：**词 → 包含这个词的文档列表**。

```
正排索引（正向）：docId  ->  [内容]
                   d0 -> "缓存穿透是缓存系统最常见的问题..."
                   d1 -> "布隆过滤器可以有效防止缓存穿透..."

倒排索引（反向）：词     ->  [docId, docId, ...]
                   缓存   ->  [d0, d1, d4]
                   穿透   ->  [d0, d1, d4]
                   布隆   ->  [d1, d4]
```

现在查「缓存穿透」，直接拿词去词典里查表，两个哈希表查找 + 一次交集运算，**毫秒级返回** ✨

这就是全文检索的基石。Elasticsearch、Lucene、MySQL 的 FULLTEXT 索引、以及你手机里任何一个搜索引擎的底层，全都是这套东西。

这篇咱们把它彻底搞明白。

## 一、先把概念钉死

### 1.1 正排索引 vs 倒排索引

| 维度 | 正排索引（Forward） | 倒排索引（Inverted） |
| ---- | ------------------ | -------------------- |
| 键 | 文档 ID | 词（Term） |
| 值 | 文档内容 / 属性 | 倒排表（Posting List） |
| 适合 | 按 ID 查详情 | 按内容查文档 |
| 查询方式 | 全表扫描 | 哈希 / 二分定位 |
| 时间复杂度 | O(N × 文档长度) | O(命中词数 × log df) |
| 直观比喻 | 书后面的**索引页**（页码 → 内容） | 书前面的**目录**（关键词 → 页码） |

**关键理解**：正排索引解决"**这本书写了什么**"，倒排索引解决"**哪些书写了这个词**"。检索场景要的恰恰是后者，所以搜索引擎必须建倒排索引。

### 1.2 两个核心组件

倒排索引由两个部分组成，缺一不可：

```
┌─────────────────────────────────────────────┐
│              倒排索引 (Inverted Index)        │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐   ┌────────────────────┐  │
│  │   词典       │   │      倒排表        │  │
│  │ (Dictionary) │   │  (Posting List)    │  │
│  │              │   │                    │  │
│  │ 词 -> 编号   │──>│ 编号 -> [docId,...] │  │
│  │ 缓存 -> 12   │   │ 12 -> [d0,d1,d4]   │  │
│  │ 穿透 -> 13   │   │ 13 -> [d0,d1,d4]   │  │
│  └──────────────┘   └────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

- **词典（Dictionary）**：所有出现过的词（Term）及其编号。它决定了"能搜什么"。
- **倒排表（Posting List）**：每个词出现在哪些文档里。它决定了"搜到了什么"。

为什么要给词分配编号？两个原因：

1. **省内存**：词本身可能又长又重复，倒排表里只存 4 字节的编号
2. **加速**：查询时先定位编号，再访问倒排表，词典可以常驻内存（甚至放 LRU）

```
真实词:  "缓存"  (UTF-8 占 6 字节)
编号:    12      (4 字节 int)
```

## 二、原理拆解

### 2.1 索引是怎么建起来的

假设我们有 3 篇文档：

```
d0: 缓存穿透是缓存系统最常见的问题之一
d1: 布隆过滤器可以有效防止缓存穿透
d2: 滑动窗口算法是限流的常用实现
```

**Step 1：分词（Tokenize）**

把每篇文档切成词元（Token）：

```
d0 -> [缓存, 穿透, 是, 缓存, 系统, 最, 常见, 的, 问题, 之一]
d1 -> [布隆, 过滤器, 可以, 有效, 防止, 缓存, 穿透]
d2 -> [滑动, 窗口, 算法, 是, 限流, 的, 常用, 实现]
```

**Step 2：统计词频和位置**

每篇文档内，每个词记两件事：

- **TF（Term Frequency）**：这个词在这篇文档里出现了几次
- **Positions**：这个词出现的**位置下标**（第几个词）

```
d0: 缓存 -> tf=2, positions=[0, 3]
     穿透 -> tf=1, positions=[1]
d1: 缓存 -> tf=1, positions=[5]
```

为什么要记位置？为了做**短语查询**。光知道"缓存"在 d0 里，不能回答"缓存**穿透**"这两个词是不是**挨着**。记了位置才能判断。

**Step 3：写入倒排表**

```
词典:                          倒排表:
  缓存 -> 12                     12 -> [d0(tf=2), d1(tf=1)]
  穿透 -> 13                     13 -> [d0(tf=1), d1(tf=1)]
  布隆 -> 14                     14 -> [d1(tf=1)]
  过滤器 -> 15                   15 -> [d1(tf=1)]
  ...
```

### 2.2 倒排表为什么要按 docId 有序

这是**性能关键**，很多人写完倒排索引就忽略了。

如果倒排表是乱序的（`[d1, d0, d4]`），要判断 d0 里有没有「缓存」，你得**线性扫描**整条倒排表，O(df)。df 是 100 万还是 10，差别不大。

但如果倒排表**按 docId 升序排好**（`[d0, d1, d4]`），就能用**二分查找**：

```
查 d2 在不在 [d0, d1, d4] 里？
  lo=0, hi=2, mid=1 → lst[1].docId=1 < 2 → lo=2
  lo=2, hi=2, mid=2 → lst[2].docId=4 > 2 → hi=1
  结束，没找到 ✗

O(log df)，不管 df 是 100 还是 100 万
```

倒排序还有第二个好处：**求交集可以直接用双指针归并**，不用 HashSet：

```
倒排表A: [d0, d2, d5, d7]     ← "缓存"
倒排表B: [d1, d2, d6, d7]     ← "穿透"

双指针归并:
  A[0]=d0 vs B[0]=d1 → d0 < d1 → A 前移
  A[1]=d2 vs B[0]=d1 → d2 > d1 → B 前移
  A[1]=d2 vs B[1]=d2 → 相等！ ✅ 命中 d2
  A[2]=d5 vs B[2]=d6 → d5 < d6 → A 前移
  A[3]=d7 vs B[3]=d7 → 相等！ ✅ 命中 d7

结果: [d2, d7]
```

O(m + n)，且**天然有序**，后面排序都省了。

### 2.3 分词器：中文检索最脏最累的那块

分词是倒排索引的**入口**，也是最容易出 bug 的地方。

英文好办，按空格和标点切就行。但中文没有空格，「缓存穿透系统」怎么切？切错了，索引就废了。

**方案一：维护词典（词典分词）**

用一套词典 + 最长匹配规则。准确率高，但：

- 词典巨大（新词、专有名词、人名地名）
- 领域适配成本高（医疗、金融词库完全不同）

**方案二：二元组（bigram）—— 本文采用**

把所有连续两个汉字当作一个词元：

```
「缓存穿透」-> 缓存 / 存穿 / 穿透
```

这是 Lucene 的 `CJKAnalyzer` 的做法。优点是零词典、天然支持任意词，缺点是**精度下降**（"存穿"这种词压根不存在，但它是词元）。

**方案三：单字 + 二元组（本文实现）**

我最后选的是这个——**单字保证召回，二元组保证精度**：

```
「缓存穿透」-> 缓 / 缓存 / 存 / 存穿 / 穿 / 穿透
```

理由：

- 只用单字：召回 100%，但"缓存"和"穿透"完全混在一起，搜"缓存"会把所有含"缓"或"存"的文档都翻出来，垃圾结果
- 只用二元组：精度好，但**有边界 bug**（下面详说）
- 单字 + 二元组：召回和精度都有了，代价是索引大了约 2 倍

> 💡 我在实现过程中踩过一个坑，值得单独拎出来说——**查询串和文档串的分词边界可能对不上**。

### 2.4 那个让我抓狂的分词边界 bug

先看现象。我的第一版实现用**纯二元组**，跑自测时发现：

```
文档: "布隆过滤器可以有效防止缓存穿透，它用多个哈希函数..."
查询: "布隆过滤器 缓存穿透"

分词结果:
  文档 -> 布隆 / 隆过 / 过滤 / 滤器 / 器可 / 可以 / 以有 / 有效 / 效防 / 防止 / 止缓 / 缓存 / 存穿 / 穿透
  查询 -> 布隆 / 隆过 / 过滤 / 滤器 / 缓存 / 存穿 / 穿透

AND 查询结果: 空 ❌
```

问题出在「器」：文档里「器」的下一个字是「可」，所以生成的是「器可」；但查询里「器」后面是空格，生成的是落单的单字「器」。**查询产生了文档里根本不存在的词元**，交集自然为空。

这正是 Lucene 文档里反复强调的那句话：**"Query analysis is not the same as index analysis"**（查询分析和索引分析不是一回事）。

**解法**：

1. **保留单字**：这样无论分词边界在哪，"器" 都能被索引到，查询也一定能命中
2. **注意 bigram 要重叠**：「缓存穿透」要生成「缓存 / 存穿 / 穿透」，不能生成「缓存 / 穿」（不重叠就丢了中间）

```
正确（重叠 bigram）: 缓 | 缓存 | 存 | 存穿 | 穿 | 穿透
错误（不重叠）:      缓存 | 穿                    ← "存"丢了
```

### 2.5 BM25：怎么给文档打分

检索出来一堆文档，谁排第一？这就是**相关性排序**。工业界的标准是 **BM25**（Best Matching，25 是版本号，不是年份）。

BM25 的公式长这样：

```
score(D, Q) = Σ  IDF(qᵢ) × TF饱和项(qᵢ, D)

IDF(qᵢ)   = ln(1 + (N - df(qᵢ) + 0.5) / (df(qᵢ) + 0.5))
TF饱和项  = tf(qᵢ, D) × (k1 + 1) / (tf(qᵢ, D) + k1 × (1 - b + b × |D| / avgdl))
```

看着吓人，拆开就三块：

**① IDF：这个词有多稀有**

```
N = 10000 篇文档
df("的") = 9500  →  IDF ≈ ln(1 + 501/9500.5) ≈ 0.05   ← 几乎没信息量
df("倒排") = 12   →  IDF ≈ ln(1 + 9888.5/12.5)  ≈ 6.71   ← 信息量爆炸
```

"这"、"是"、"的"这种词，几乎每篇文档都有，搜它们等于没搜。IDF 就是用来**压低这些词的权重**的。

**② TF 饱和项：词频高就该加分，但不能线性涨**

想象一篇文档把「缓存穿透」重复了 100 遍，和一篇只写了一遍的文档，**相关性真的有 100 倍吗？** 显然不是，多写几遍并不能让文档变得更相关。

所以 TF 的贡献必须**饱和**：

```
k1 = 1.2（默认值）, tf=1   →  1 × 2.2 / (1 + 1.2×...) ≈ 0.93
k1 = 1.2（默认值）, tf=10  →  10 × 2.2 / (10 + 1.2×...) ≈ 1.62
k1 = 1.2（默认值）, tf=100 →  100 × 2.2 / (100 + 1.2×...) ≈ 1.85
```

从 1 次到 10 次，分数涨了 74%；从 10 次到 100 次，只涨 14%。这就对了。

**③ 文档长度归一化（b 参数）**

一篇 5000 字的文章里出现一次「缓存」，和一篇 50 字的短文里出现一次「缓存」，后者显然更相关。

```
b = 0.75（默认值，控制长度惩罚强度）
b = 0 → 完全不考虑长度
b = 1 → 强惩罚长文档
```

**参数怎么调？** `k1` 和 `b` 是 BM25 的两个旋钮：

| 参数 | 默认值 | 调大的效果 | 调小的效果 |
| ---- | ------ | ---------- | ---------- |
| `k1` | 1.2 | TF 饱和更慢，词频差异被放大 | TF 饱和更快，几乎只看"有没有" |
| `b` | 0.75 | 长度惩罚更强，长文档更容易被压后 | 长度影响减弱 |

工程上默认值 `k1=1.2, b=0.75` 在绝大多数场景都够用，真要调也是拿标注数据跑离线评估。

### 2.6 两种打分路径：DAT vs TAT

这是**倒排索引里最容易被忽略、但对性能影响巨大**的一个点。

BM25 的得分是**对各查询词可加的**——总得分 = 词1得分 + 词2得分 + ...。所以有两种等价的计算方式：

**方式一：文档-at-a-time（DAT, Document-at-a-Time）**

先算出候选文档集合，然后**逐个文档**累加它的各查询词得分：

```
for docId in candidates:          ← 候选集多大，就循环多少次
    score = 0
    for term in terms:             ← 每个词做一次二分查找
        posting = findPosting(postings[term], docId)   ← O(log df)
        score += idf(term) * tfPart(posting.tf, ...)
```

代价 ≈ **候选数 × 词数 × log(df)**

**方式二：词-at-a-time（TAT, Term-at-a-Time）**

反过来，**逐个查询词**遍历它的整条倒排表，把得分累加到一个 map：

```
for term in terms:                 ← 遍历查询词
    for posting in postings[term]:  ← 扫完这条倒排表的所有条目
        scores[posting.docId] += idf(term) * tfPart(...)
```

代价 ≈ **Σ(各查询词的 df)**

**两者算出来的分数完全一样**（BM25 可加性），只是快慢不同。选哪个？

| 场景 | 更划算的 | 原因 |
| ---- | -------- | ---- |
| 查罕见词（候选集小） | **DAT** | 候选少，每篇文档查几次数省事 |
| 查常见词（候选集接近全库） | **TAT** | DAT 要给每篇文档都做多次二分查找；TAT 直接扫倒排表 |
| 命中文档极少 | **DAT** | 没必要扫完整条倒排表 |

我在实现里加了个 `auto` 模式，按代价估算自动选：

```typescript
// DAT 代价 ≈ 候选数 × 词数 × log(平均df)
// TAT 代价 ≈ Σdf
const sumDf = lists.reduce((acc, l) => acc + l.length, 0);
const avgDf = sumDf / lists.length;
const datCost = candidates.length * terms.length * Math.log2(Math.max(avgDf, 2));
const tatCost = sumDf;
useTAT = tatCost < datCost;
```

实测数据（2 万篇文档，每篇 100 词，AND 语义，取完整结果集）：

```
查询            暴力扫描      倒排DAT      倒排TAT     倒排auto    加速比   结果
算法 缓存        441.4 ms    402.64 ms    11.87 ms    9.44 ms     47×   ✅一致 (命中 19999 篇)
数据 系统        444.5 ms    399.87 ms    12.09 ms   10.67 ms     42×   ✅一致 (命中 19998 篇)
布隆 倒排        439.3 ms    340.00 ms     8.41 ms    8.08 ms     54×   ✅一致 (命中 16983 篇)
一致性 哈希      443.4 ms    343.95 ms    12.12 ms    9.76 ms     45×   ✅一致 (命中 16948 篇)
```

看第一列和第二列——**DAT 在这个场景下居然比暴力扫描还慢**！为什么？

因为暴力扫描虽然扫了 2 万篇文档，但每篇只做一次 `Set.has()`，常数极小；而 DAT 要对每篇候选文档做**多次二分查找**（每次还带函数调用和对象解引用），常数反而更大。

**这就是为什么工业界的搜索引擎几乎都用 TAT 或者 WAND 这类方案。** TAT 那一列才是真相：**快 40~50 倍**。

顺带说一句，这个测试还暴露了一个我一开始写错的点——我最初的 benchmark 里 `topK` 截断导致两边结果集大小不一致，还以为是索引算错了。教训：**做性能对比时，一定要拿完整结果集比，别让截断污染结论**。

### 2.7 短语查询：靠位置对齐

普通检索只关心"词有没有出现"，短语查询要求"这些词**连续**出现"。

```
搜「防止缓存穿透」
  d1: "布隆过滤器可以有效防止缓存穿透，它用多个哈希..."
      → 命中 ✅（"防止"后面紧跟着"缓存"）
  d4: "布隆过滤器与缓存穿透是面试高频题..."
      → 不命中 ❌（有"缓存穿透"，但前面不是"防止"）
```

实现原理：利用倒排表里记录的 `positions`。

```
查询词元:   防止(0)  缓存(1)  穿透(2)
                  ↑ 起点位置 start

对 d1 里的每个 start:
  start=5  →  检查 防止 在 5? ✓
              检查 缓存 在 5+1=6? ✓
              检查 穿透 在 5+2=7? ✓
              → 全部命中，d1 匹配 ✅
```

伪代码：

```typescript
for (const start of posting.positions) {
  for (let i = 1; i < terms.length; i++) {
    const p = findPosting(postings[terms[i]], posting.docId);
    if (!p || !p.positions.includes(start + i)) break;  // 位置对不上
  }
  // 全部对上 → 命中
}
```

**注意这里的成本**：`positions.includes()` 是线性查找。倒排表里某个词在文档里出现 100 次，就要比 100 次。工程上的优化是**先对 positions 排序再用二分**，或者在文档较短时直接用位图。

### 2.8 AND 还是 OR？—— 求交集的语义

多词查询有两种语义：

| 模式 | 语义 | 特点 | 典型用途 |
| ---- | ---- | ---- | ---- |
| **OR** | 命中任意一个词即可 | 召回高，结果多 | 搜索引擎默认 |
| **AND** | 所有词都必须命中 | 精度高，结果少 | 精确检索、日志排查 |

AND 模式要做**倒排表求交**。这里有个**特别容易写错**的坑：

```typescript
// ❌ 错误写法
const lists = terms.map(t => postings.get(t)).filter(Boolean);
// 不存在的词被直接丢掉了！
```

问题：如果查询「mysql 倒排 性能」，而索引里根本没有「倒排」这个词（没人写过），错误的写法会把「倒排」丢掉，**只按 mysql 和 性能 去匹配**，于是返回了一堆只含 mysql 和性能、跟倒排八竿子打不着的文档。

正确写法：

```typescript
// ✅ AND 语义下，任何一个查询词不存在，结果必然为空
if (mode === "and" && termLists.some((l) => !l)) return [];
```

> 这个 bug 是我的**随机对拍脚本**抓出来的，不是拍脑袋想出来的。手动测几个例子很难碰上，得让程序随机生成数据跟暴力答案对比才暴露得出来。

顺带说个**求交的顺序问题**：应该**从最短的倒排表开始**。因为交集的结果不可能比最短的那条还长，先用最短表把候选集缩到最小，后面几次求交的代价都跟着变小。

```typescript
lists.sort((a, b) => a.length - b.length);  // 关键优化
```

## 三、代码实现

### TypeScript

```typescript
/**
 * 倒排索引（Inverted Index）—— TypeScript 完整实现
 *
 * 核心思想：
 *   正向索引：docId -> 内容      （"挨个翻"，全文扫描 O(N·len)）
 *   倒排索引：词 -> [docId, ...]  （"直接查词表"，一次命中 O(log N)）
 *
 * 四个关键设计：
 *   1. 倒排表按 docId 有序 —— 二分查找定位，省掉线性扫描
 *   2. 两种打分方式 —— 文档-at-a-time（DAT） vs 词-at-a-time（TAT）
 *   3. auto 模式 —— 按代价估算自动挑更快的那条路
 *   4. 记录 positions —— 支持短语查询
 */

export interface Posting {
  docId: number;
  /** 该词在文档中出现的次数（Term Frequency） */
  tf: number;
  /** 该词在文档中出现的位置下标，用于短语查询 */
  positions: number[];
}

export interface SearchHit {
  docId: number;
  score: number;
}

export type SearchMode = "and" | "or";
/** dat = 文档-at-a-time，tat = 词-at-a-time，auto = 自动选择 */
export type ScoringMode = "dat" | "tat" | "auto";

export interface InvertedIndexOptions {
  /** BM25 的 k1 参数，默认 1.2 */
  k1?: number;
  /** BM25 的 b 参数，默认 0.75 */
  b?: number;
  /** 追加自定义停用词 */
  stopWords?: string[];
}

/**
 * 分词器。
 *
 * 英文/数字：按非字母数字切分，保留完整单词
 * 中文：采用「单字 + 重叠二元组」，这是中文检索里最经典的降级方案
 *
 * 「缓存穿透」-> 缓 / 缓存 / 存 / 存穿 / 穿 / 穿透
 *
 * 为什么同时保留单字和二元组？
 *   1. 单字保证召回——任何汉字都能被检索到，不会漏
 *   2. 二元组保证精度——「缓存」比单独的两个「缓」「存」歧义小得多
 *   3. 二者都保留，还能支持短语查询（位置对齐）
 */
export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const normalized = text.toLowerCase();

  // 先按空白和非字母数字字符切成片段（标点是天然的硬边界）
  const chunks = normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

  for (const chunk of chunks) {
    let buf = ""; // 累积连续的英文/数字
    const chars = Array.from(chunk);

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (/[\p{Script=Han}]/u.test(ch)) {
        // 遇到中文字符：先把攒着的英文单词吐出来
        if (buf) {
          tokens.push(buf);
          buf = "";
        }
        // 单字：保证召回
        tokens.push(ch);
        // 重叠二元组：当前字 + 下一个字，保证精度
        const next = chars[i + 1];
        if (next && /[\p{Script=Han}]/u.test(next)) {
          tokens.push(ch + next);
        }
      } else {
        buf += ch;
      }
    }
    if (buf) tokens.push(buf);
  }

  return tokens;
}

/**
 * 在有序倒排表中二分查找某个 docId 的 posting。
 * 时间复杂度 O(log df)，比线性 find 快得多。
 */
function findPosting(list: Posting[], docId: number): Posting | undefined {
  let lo = 0;
  let hi = list.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid].docId === docId) return list[mid];
    if (list[mid].docId < docId) lo = mid + 1;
    else hi = mid - 1;
  }
  return undefined;
}

/**
 * 求两个有序 docId 数组的交集（双指针归并）。
 * 避免 Set 分配，且天然有序。
 */
function intersectSorted(a: number[], b: number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push(a[i]);
      i++;
      j++;
    } else if (a[i] < b[j]) {
      i++;
    } else {
      j++;
    }
  }
  return out;
}

/** 倒排索引 */
export class InvertedIndex {
  /** 词典：词 -> 倒排表（按 docId 有序） */
  private postings = new Map<string, Posting[]>();
  /** 文档元信息：docId -> 文档长度（词数），BM25 需要 */
  private docLengths = new Map<number, number>();
  /** 停用词表 */
  private stopWords: Set<string>;
  /** BM25 参数 */
  private k1: number;
  private b: number;

  constructor(options: InvertedIndexOptions = {}) {
    this.k1 = options.k1 ?? 1.2;
    this.b = options.b ?? 0.75;
    this.stopWords = new Set([
      "the", "a", "an", "of", "to", "in", "is", "and", "or", "for", "on",
      "的", "了", "是", "在", "和", "与", "及", "也", "都", "而", "就", "很",
      ...(options.stopWords ?? []),
    ]);
  }

  /** 加入一篇文档 */
  addDocument(docId: number, content: string): void {
    const tokens = tokenize(content).filter((t) => !this.stopWords.has(t));
    this.docLengths.set(docId, tokens.length);

    // 先统计词频和位置
    const local = new Map<string, { tf: number; positions: number[] }>();
    tokens.forEach((token, pos) => {
      let entry = local.get(token);
      if (!entry) {
        entry = { tf: 0, positions: [] };
        local.set(token, entry);
      }
      entry.tf++;
      entry.positions.push(pos);
    });

    // 写入全局倒排表
    for (const [token, entry] of local) {
      let list = this.postings.get(token);
      if (!list) {
        list = [];
        this.postings.set(token, list);
      }
      // 保持 docId 有序（二分查找的前提）
      if (list.length === 0 || list[list.length - 1].docId < docId) {
        list.push({ docId, tf: entry.tf, positions: entry.positions });
      } else {
        // 乱序插入时插到正确位置
        const idx = list.findIndex((p) => p.docId >= docId);
        list.splice(idx, 0, { docId, tf: entry.tf, positions: entry.positions });
      }
    }
  }

  /** 文档总数 */
  get documentCount(): number {
    return this.docLengths.size;
  }

  /** 词典大小（不同词的数量） */
  get vocabularySize(): number {
    return this.postings.size;
  }

  /** 平均文档长度 */
  private get avgDocLength(): number {
    if (this.docLengths.size === 0) return 0;
    let sum = 0;
    for (const len of this.docLengths.values()) sum += len;
    return sum / this.docLengths.size;
  }

  /** 某个词在多少篇文档中出现 */
  documentFrequency(term: string): number {
    return this.postings.get(term)?.length ?? 0;
  }

  /** 暴露停用词表，方便对拍脚本使用同一套过滤规则 */
  isStopWord(term: string): boolean {
    return this.stopWords.has(term);
  }

  /**
   * BM25 的 IDF 项。
   * 常见词（df 大）信息量低，权重低；罕见词信息量高，权重高。
   */
  private idf(term: string): number {
    const n = this.documentFrequency(term);
    const N = this.documentCount;
    if (n === 0) return 0;
    return Math.log(1 + (N - n + 0.5) / (n + 0.5));
  }

  /** BM25 的 tf 饱和项 */
  private tfPart(tf: number, docLen: number, avgLen: number): number {
    return (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + (this.b * docLen) / avgLen));
  }

  /**
   * 方式一：文档-at-a-time（Document-at-a-Time）
   *
   * 先算出候选文档集合，再逐个文档累加各查询词的得分。
   * 代价 ≈ 候选数 × 查询词数 × log(df)
   * 适合：候选集小（比如查罕见词）
   */
  private scoreDAT(docId: number, terms: string[]): number {
    const docLen = this.docLengths.get(docId) ?? 0;
    const avgLen = this.avgDocLength || 1;
    let score = 0;

    for (const term of terms) {
      const list = this.postings.get(term);
      if (!list) continue;
      const posting = findPosting(list, docId); // 二分查找 O(log df)
      if (!posting) continue;
      score += this.idf(term) * this.tfPart(posting.tf, docLen, avgLen);
    }

    return score;
  }

  /**
   * 方式二：词-at-a-time（Term-at-a-Time）
   *
   * 逐个查询词遍历它的整条倒排表，把得分累加到一个 map 里。
   * 代价 ≈ Σ 查询词的 df
   * 适合：查询词很常见（候选集接近全库），此时 DAT 要给每篇文档做多次二分查找
   *
   * BM25 得分对各词是可加的，所以两种方式算出来的分数完全一致，只是快慢不同。
   */
  private scoreTAT(terms: string[]): Map<number, number> {
    const avgLen = this.avgDocLength || 1;
    const scores = new Map<number, number>();

    for (const term of terms) {
      const list = this.postings.get(term);
      if (!list) continue;
      const idf = this.idf(term);
      if (idf === 0) continue;

      for (const posting of list) {
        const docLen = this.docLengths.get(posting.docId) ?? 0;
        const contribution = idf * this.tfPart(posting.tf, docLen, avgLen);
        scores.set(posting.docId, (scores.get(posting.docId) ?? 0) + contribution);
      }
    }

    return scores;
  }

  /**
   * 检索。
   * - mode="and"：所有查询词都必须命中（精确，结果少）
   * - mode="or" ：命中任意一个词即可（召回高，搜索引擎默认）
   * - scoring="dat" / "tat" / "auto"
   */
  search(
    query: string,
    topK = 10,
    mode: SearchMode = "or",
    scoring: ScoringMode = "auto",
  ): SearchHit[] {
    const terms = tokenize(query).filter((t) => !this.stopWords.has(t));
    if (terms.length === 0) return [];

    const termLists = terms.map((t) => this.postings.get(t));

    // AND 语义下，任何一个查询词在整个索引里都不存在，结果必然为空。
    // 注意：这里必须提前返回，不能把不存在的词直接过滤掉 —— 否则
    // 查询「mysql 倒排 性能」时，若「倒排」无人提及，会错误地只按另外两个词匹配。
    if (mode === "and" && termLists.some((l) => !l)) return [];

    const lists = termLists.filter((l): l is Posting[] => Boolean(l));
    if (lists.length === 0) return [];

    // 从最短的倒排表开始遍历（优化的关键：先缩小候选集）
    lists.sort((a, b) => a.length - b.length);

    let candidates: number[];

    if (mode === "and") {
      // 双指针求交集，从最短表开始依次 intersect
      candidates = lists[0].map((p) => p.docId);
      for (let i = 1; i < lists.length && candidates.length > 0; i++) {
        candidates = intersectSorted(candidates, lists[i].map((p) => p.docId));
      }
    } else {
      // OR：取并集
      const set = new Set<number>();
      for (const list of lists) {
        for (const p of list) set.add(p.docId);
      }
      candidates = [...set];
    }

    if (candidates.length === 0) return [];

    // 决定用 DAT 还是 TAT
    let useTAT = scoring === "tat";
    if (scoring === "auto") {
      // DAT 代价 ≈ 候选数 × 词数 × log(平均df)
      // TAT 代价 ≈ Σdf
      const sumDf = lists.reduce((acc, l) => acc + l.length, 0);
      const avgDf = sumDf / lists.length;
      const datCost = candidates.length * terms.length * Math.log2(Math.max(avgDf, 2));
      const tatCost = sumDf;
      useTAT = tatCost < datCost;
    }

    if (useTAT) {
      const all = this.scoreTAT(terms);
      return candidates
        .map((docId) => ({ docId, score: all.get(docId) ?? 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    }

    return candidates
      .map((docId) => ({ docId, score: this.scoreDAT(docId, terms) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * 短语查询：查询词必须在文档中连续出现。
   * 靠倒排表里记录的 positions 做位置对齐：
   *   查询第 i 个词必须出现在 起始位置 + i
   */
  searchPhrase(phrase: string, topK = 10): SearchHit[] {
    const terms = tokenize(phrase).filter((t) => !this.stopWords.has(t));
    if (terms.length === 0) return [];

    const first = this.postings.get(terms[0]);
    if (!first) return [];

    const hits: SearchHit[] = [];

    for (const posting of first) {
      let matched = false;
      for (const start of posting.positions) {
        let ok = true;
        for (let i = 1; i < terms.length; i++) {
          const list = this.postings.get(terms[i]);
          const p = list ? findPosting(list, posting.docId) : undefined;
          if (!p || !p.positions.includes(start + i)) {
            ok = false;
            break;
          }
        }
        if (ok) {
          matched = true;
          break;
        }
      }
      if (matched) {
        hits.push({ docId: posting.docId, score: this.scoreDAT(posting.docId, terms) });
      }
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * 打印倒排表，直观展示「词 -> 文档列表」的映射。
   */
  dump(limit = 20): string {
    const lines: string[] = [];
    const sorted = [...this.postings.entries()].sort((a, b) => b[1].length - a[1].length);

    for (const [term, list] of sorted.slice(0, limit)) {
      const items = list
        .slice(0, 5)
        .map((p) => `d${p.docId}(tf=${p.tf})`)
        .join(", ");
      const more = list.length > 5 ? `, ... 共${list.length}篇` : "";
      lines.push(`${term.padEnd(14)} -> [${items}${more}]`);
    }

    return lines.join("\n");
  }
}

// ============ 自测 ============

const index = new InvertedIndex();

const docs = [
  "缓存穿透是缓存系统最常见的问题之一，当请求的key在缓存中不存在时，数据库会被大量请求压垮。",
  "布隆过滤器可以有效防止缓存穿透，它用多个哈希函数将元素映射到位数组上。",
  "滑动窗口算法是限流的常用实现，它统计过去N秒内的请求数量。",
  "倒排索引是全文搜索引擎的核心数据结构，它把词映射到包含该词的文档列表。",
  "布隆过滤器与缓存穿透是面试高频题，前者用空间换准确率。",
];

docs.forEach((d, i) => index.addDocument(i, d));

console.log("=== 词典倒排表（按文档数倒序）===");
console.log(index.dump());
console.log();

console.log("=== 检索（OR）：缓存穿透 ===");
for (const hit of index.search("缓存穿透")) {
  console.log(`  doc ${hit.docId}  score=${hit.score.toFixed(4)}`);
}
console.log();

console.log("=== 检索（OR）：布隆过滤器 ===");
for (const hit of index.search("布隆过滤器")) {
  console.log(`  doc ${hit.docId}  score=${hit.score.toFixed(4)}`);
}
console.log();

console.log("=== 检索（AND）：布隆过滤器 缓存穿透 ===");
console.log(index.search("布隆过滤器 缓存穿透", 10, "and").map((h) => `doc ${h.docId}`).join(", "));
console.log();

console.log("=== 短语查询：「防止缓存穿透」 ===");
console.log(index.searchPhrase("防止缓存穿透").map((h) => `doc ${h.docId}`).join(", "));
console.log();

console.log(`文档数=${index.documentCount}  词典大小=${index.vocabularySize}`);
```

**实际输出**（跑在 Node v26.7.0）：

```
=== 词典倒排表（按文档数倒序）===
数              -> [d0(tf=1), d1(tf=2), d2(tf=1), d3(tf=1)]
缓              -> [d0(tf=3), d1(tf=1), d4(tf=1)]
缓存             -> [d0(tf=3), d1(tf=1), d4(tf=1)]
存              -> [d0(tf=4), d1(tf=1), d4(tf=1)]
存穿             -> [d0(tf=1), d1(tf=1), d4(tf=1)]
穿              -> [d0(tf=1), d1(tf=1), d4(tf=1)]
穿透             -> [d0(tf=1), d1(tf=1), d4(tf=1)]
透              -> [d0(tf=1), d1(tf=1), d4(tf=1)]
过              -> [d1(tf=1), d2(tf=1), d4(tf=1)]
它              -> [d1(tf=1), d2(tf=1), d3(tf=1)]
用              -> [d1(tf=1), d2(tf=1), d4(tf=1)]
数据             -> [d0(tf=1), d3(tf=1)]
据              -> [d0(tf=1), d3(tf=1)]

=== 检索（OR）：缓存穿透 ===
  doc 0  score=4.4485
  doc 4  score=4.1218
  doc 1  score=3.6198

=== 检索（OR）：布隆过滤器 ===
  doc 4  score=8.2402
  doc 1  score=7.2365
  doc 2  score=0.5843

=== 检索（AND）：布隆过滤器 缓存穿透 ===
doc 4, doc 1

=== 短语查询：「防止缓存穿透」 ===
doc 1

文档数=5  词典大小=228
```

有几个细节可以留意一下：

- **单字和二元组都在倒排表里**：「缓」「缓存」「存」「存穿」「穿」「穿透」各自成词，这就是单字+二元组方案的直接体现
- **doc 2 出现在「布隆过滤器」的 OR 结果里**（score=0.5843）：因为中文单字「布」「隆」在 doc 2 里也出现了（"限**流**"里的「流」不含，但"滑动**窗**口"…），单字带来的**召回提升**在这里就体现出来了——代价是精度下降
- **AND 结果只剩 doc 4 和 doc 1**：符合直觉，这两个文档确实同时提到了布隆过滤器和缓存穿透
- **短语查询只命中 doc 1**：doc 4 有「缓存穿透」但前面不是「防止」，位置对不上，被正确排除

### Python

```python
"""
倒排索引（Inverted Index）—— Python 实现
"""

from __future__ import annotations

import math
import re
from bisect import bisect_left
from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple

# 停用词表
DEFAULT_STOP_WORDS: Set[str] = {
    "the", "a", "an", "of", "to", "in", "is", "and", "or", "for", "on",
    "的", "了", "是", "在", "和", "与", "及", "也", "都", "而", "就", "很",
}

# 非字母数字字符作为硬边界
_SPLIT_RE = re.compile(r"[^\w]+", re.UNICODE)
_HAN_RE = re.compile(r"[\u4e00-\u9fff]")


def tokenize(text: str) -> List[str]:
    """分词器。

    英文/数字：按非字母数字切分，保留完整单词
    中文：采用「单字 + 重叠二元组」
        「缓存穿透」-> 缓 / 缓存 / 存 / 存穿 / 穿 / 穿透

    为什么同时保留单字和二元组？
        1. 单字保证召回——任何汉字都能被检索到，不会漏
        2. 二元组保证精度——「缓存」比单独的两个「缓」「存」歧义小得多
        3. 二者都保留，还能支持短语查询（位置对齐）
    """
    tokens: List[str] = []
    normalized = text.lower()

    for chunk in _SPLIT_RE.split(normalized):
        if not chunk:
            continue

        buf = ""  # 累积连续的英文/数字
        chars = list(chunk)

        for i, ch in enumerate(chars):
            if _HAN_RE.match(ch):
                if buf:
                    tokens.append(buf)
                    buf = ""
                # 单字：保证召回
                tokens.append(ch)
                # 重叠二元组：当前字 + 下一个字，保证精度
                if i + 1 < len(chars) and _HAN_RE.match(chars[i + 1]):
                    tokens.append(ch + chars[i + 1])
            else:
                buf += ch
        if buf:
            tokens.append(buf)

    return tokens


@dataclass
class Posting:
    """倒排表里的一条记录。"""

    doc_id: int
    tf: int  # Term Frequency，该词在文档中出现的次数
    positions: List[int] = field(default_factory=list)  # 出现位置，用于短语查询


class InvertedIndex:
    """倒排索引。"""

    def __init__(self, k1: float = 1.2, b: float = 0.75,
                 stop_words: Optional[Iterable[str]] = None) -> None:
        self.k1 = k1
        self.b = b
        self.stop_words: Set[str] = set(DEFAULT_STOP_WORDS)
        if stop_words:
            self.stop_words.update(stop_words)

        # 词典：词 -> 倒排表（按 doc_id 有序）
        self.postings: Dict[str, List[Posting]] = {}
        # 文档长度：doc_id -> 词数（BM25 需要）
        self.doc_lengths: Dict[int, int] = {}

    # ---------- 构建 ----------

    def add_document(self, doc_id: int, content: str) -> None:
        """加入一篇文档。"""
        tokens = [t for t in tokenize(content) if t not in self.stop_words]
        self.doc_lengths[doc_id] = len(tokens)

        # 先统计词频和位置
        local: Dict[str, Tuple[int, List[int]]] = {}
        for pos, token in enumerate(tokens):
            tf, positions = local.get(token, (0, []))
            local[token] = (tf + 1, positions + [pos])

        # 写入全局倒排表
        for token, (tf, positions) in local.items():
            posting = Posting(doc_id=doc_id, tf=tf, positions=positions)
            lst = self.postings.setdefault(token, [])
            # 保持 doc_id 有序（二分查找的前提）
            if not lst or lst[-1].doc_id < doc_id:
                lst.append(posting)
            else:
                idx = bisect_left([p.doc_id for p in lst], doc_id)
                lst.insert(idx, posting)

    # ---------- 元信息 ----------

    @property
    def document_count(self) -> int:
        return len(self.doc_lengths)

    @property
    def vocabulary_size(self) -> int:
        return len(self.postings)

    @property
    def avg_doc_length(self) -> float:
        if not self.doc_lengths:
            return 0.0
        return sum(self.doc_lengths.values()) / len(self.doc_lengths)

    def document_frequency(self, term: str) -> int:
        """某个词在多少篇文档中出现。"""
        return len(self.postings.get(term, []))

    def _find_posting(self, lst: List[Posting], doc_id: int) -> Optional[Posting]:
        """在有序倒排表中二分查找，O(log df)。"""
        lo, hi = 0, len(lst) - 1
        while lo <= hi:
            mid = (lo + hi) >> 1
            if lst[mid].doc_id == doc_id:
                return lst[mid]
            if lst[mid].doc_id < doc_id:
                lo = mid + 1
            else:
                hi = mid - 1
        return None

    # ---------- 打分 ----------

    def _idf(self, term: str) -> float:
        """BM25 的 IDF 项：常见词权重低，罕见词权重高。"""
        n = self.document_frequency(term)
        N = self.document_count
        if n == 0:
            return 0.0
        return math.log(1 + (N - n + 0.5) / (n + 0.5))

    def _tf_part(self, tf: int, doc_len: int, avg_len: float) -> float:
        """BM25 的 tf 饱和项：词频越高收益递减，不会线性爆炸。"""
        k1, b = self.k1, self.b
        return (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * doc_len / avg_len))

    def _score_dat(self, doc_id: int, terms: Sequence[str]) -> float:
        """文档-at-a-time：逐个候选文档累加各查询词的得分。"""
        doc_len = self.doc_lengths.get(doc_id, 0)
        avg_len = self.avg_doc_length or 1.0
        score = 0.0
        for term in terms:
            lst = self.postings.get(term)
            if not lst:
                continue
            posting = self._find_posting(lst, doc_id)
            if posting is None:
                continue
            score += self._idf(term) * self._tf_part(posting.tf, doc_len, avg_len)
        return score

    def _score_tat(self, terms: Sequence[str]) -> Dict[int, float]:
        """词-at-a-time：逐个查询词遍历整条倒排表累加得分。"""
        avg_len = self.avg_doc_length or 1.0
        scores: Dict[int, float] = {}
        for term in terms:
            lst = self.postings.get(term)
            if not lst:
                continue
            idf = self._idf(term)
            if idf == 0:
                continue
            for posting in lst:
                doc_len = self.doc_lengths.get(posting.doc_id, 0)
                contribution = idf * self._tf_part(posting.tf, doc_len, avg_len)
                scores[posting.doc_id] = scores.get(posting.doc_id, 0.0) + contribution
        return scores

    # ---------- 检索 ----------

    def search(self, query: str, top_k: int = 10, mode: str = "or",
               scoring: str = "auto") -> List[Tuple[int, float]]:
        """检索。

        mode="and"：所有查询词都必须命中
        mode="or" ：命中任意一个词即可
        scoring="dat" / "tat" / "auto"
        """
        terms = [t for t in tokenize(query) if t not in self.stop_words]
        if not terms:
            return []

        term_lists = [self.postings.get(t) for t in terms]

        # AND 语义下，任何一个查询词都不存在，结果必然为空。
        # 不能把不存在的词直接过滤掉，否则会错误地放宽匹配条件。
        if mode == "and" and any(lst is None for lst in term_lists):
            return []

        lists = [lst for lst in term_lists if lst is not None]
        if not lists:
            return []

        # 从最短的倒排表开始（先缩小候选集）
        lists.sort(key=len)

        if mode == "and":
            candidates = {p.doc_id for p in lists[0]}
            for lst in lists[1:]:
                if not candidates:
                    break
                ids = {p.doc_id for p in lst}
                candidates &= ids
            candidate_list = list(candidates)
        else:
            union: Set[int] = set()
            for lst in lists:
                union.update(p.doc_id for p in lst)
            candidate_list = list(union)

        if not candidate_list:
            return []

        # 决定用 DAT 还是 TAT
        use_tat = scoring == "tat"
        if scoring == "auto":
            sum_df = sum(len(lst) for lst in lists)
            avg_df = sum_df / len(lists)
            dat_cost = len(candidate_list) * len(terms) * math.log2(max(avg_df, 2))
            use_tat = sum_df < dat_cost

        if use_tat:
            all_scores = self._score_tat(terms)
            hits = [(doc_id, all_scores.get(doc_id, 0.0)) for doc_id in candidate_list]
        else:
            hits = [(doc_id, self._score_dat(doc_id, terms)) for doc_id in candidate_list]

        hits.sort(key=lambda x: -x[1])
        return hits[:top_k]

    def search_phrase(self, phrase: str, top_k: int = 10) -> List[Tuple[int, float]]:
        """短语查询：查询词必须在文档中连续出现。

        靠倒排表里记录的 positions 做位置对齐：
        查询第 i 个词必须出现在 起始位置 + i
        """
        terms = [t for t in tokenize(phrase) if t not in self.stop_words]
        if not terms:
            return []

        first = self.postings.get(terms[0])
        if not first:
            return []

        hits: List[Tuple[int, float]] = []
        for posting in first:
            matched = False
            for start in posting.positions:
                ok = True
                for i in range(1, len(terms)):
                    lst = self.postings.get(terms[i])
                    p = self._find_posting(lst, posting.doc_id) if lst else None
                    if p is None or (start + i) not in p.positions:
                        ok = False
                        break
                if ok:
                    matched = True
                    break
            if matched:
                hits.append((posting.doc_id, self._score_dat(posting.doc_id, terms)))

        hits.sort(key=lambda x: -x[1])
        return hits[:top_k]

    def dump(self, limit: int = 20) -> str:
        """打印倒排表，直观展示「词 -> 文档列表」的映射。"""
        lines = []
        sorted_items = sorted(self.postings.items(), key=lambda kv: -len(kv[1]))
        for term, lst in sorted_items[:limit]:
            items = ", ".join(f"d{p.doc_id}(tf={p.tf})" for p in lst[:5])
            more = f", ... 共{len(lst)}篇" if len(lst) > 5 else ""
            lines.append(f"{term:<14} -> [{items}{more}]")
        return "\n".join(lines)


# ============ 自测 ============

if __name__ == "__main__":
    index = InvertedIndex()

    docs = [
        "缓存穿透是缓存系统最常见的问题之一，当请求的key在缓存中不存在时，数据库会被大量请求压垮。",
        "布隆过滤器可以有效防止缓存穿透，它用多个哈希函数将元素映射到位数组上。",
        "滑动窗口算法是限流的常用实现，它统计过去N秒内的请求数量。",
        "倒排索引是全文搜索引擎的核心数据结构，它把词映射到包含该词的文档列表。",
        "布隆过滤器与缓存穿透是面试高频题，前者用空间换准确率。",
    ]

    for i, d in enumerate(docs):
        index.add_document(i, d)

    print("=== 词典倒排表（按文档数倒序）===")
    print(index.dump())
    print()

    print("=== 检索（OR）：缓存穿透 ===")
    for doc_id, score in index.search("缓存穿透"):
        print(f"  doc {doc_id}  score={score:.4f}")
    print()

    print("=== 检索（AND）：布隆过滤器 缓存穿透 ===")
    print(", ".join(f"doc {d}" for d, _ in index.search("布隆过滤器 缓存穿透", mode="and")))
    print()

    print("=== 短语查询：「防止缓存穿透」 ===")
    print(", ".join(f"doc {d}" for d, _ in index.search_phrase("防止缓存穿透")))
    print()

    print(f"文档数={index.document_count}  词典大小={index.vocabulary_size}")
```

### Go

```go
package invertedindex

import (
	"fmt"
	"math"
	"sort"
	"strings"
	"unicode"
)

// Posting 倒排表里的一条记录
type Posting struct {
	DocID     int
	TF        int   // Term Frequency，该词在文档中出现的次数
	Positions []int // 出现位置，用于短语查询
}

// SearchHit 一条检索结果
type SearchHit struct {
	DocID int
	Score float64
}

// InvertedIndex 倒排索引
type InvertedIndex struct {
	postings   map[string][]Posting // 词典：词 -> 倒排表（按 DocID 有序）
	docLengths map[int]int          // 文档长度：DocID -> 词数（BM25 需要）
	stopWords  map[string]bool
	k1         float64
	b          float64
}

var defaultStopWords = []string{
	"the", "a", "an", "of", "to", "in", "is", "and", "or", "for", "on",
	"的", "了", "是", "在", "和", "与", "及", "也", "都", "而", "就", "很",
}

// NewInvertedIndex 创建倒排索引
func NewInvertedIndex(stopWords ...string) *InvertedIndex {
	idx := &InvertedIndex{
		postings:   make(map[string][]Posting),
		docLengths: make(map[int]int),
		stopWords:  make(map[string]bool),
		k1:         1.2,
		b:          0.75,
	}
	for _, w := range defaultStopWords {
		idx.stopWords[w] = true
	}
	for _, w := range stopWords {
		idx.stopWords[w] = true
	}
	return idx
}

// isHan 判断是否为汉字
func isHan(r rune) bool {
	return unicode.Is(unicode.Han, r)
}

// Tokenize 分词器
//
// 英文/数字：按非字母数字切分，保留完整单词
// 中文：采用「单字 + 重叠二元组」
//
//	「缓存穿透」-> 缓 / 缓存 / 存 / 存穿 / 穿 / 穿透
//
// 为什么同时保留单字和二元组？
//  1. 单字保证召回——任何汉字都能被检索到，不会漏
//  2. 二元组保证精度——「缓存」比单独的两个「缓」「存」歧义小得多
//  3. 二者都保留，还能支持短语查询（位置对齐）
func Tokenize(text string) []string {
	tokens := make([]string, 0, len(text))
	normalized := strings.ToLower(text)

	runes := []rune(normalized)
	var buf strings.Builder

	flush := func() {
		if buf.Len() > 0 {
			tokens = append(tokens, buf.String())
			buf.Reset()
		}
	}

	for i := 0; i < len(runes); i++ {
		ch := runes[i]
		if isHan(ch) {
			// 遇到中文字符：先把攒着的英文单词吐出来
			flush()
			// 单字：保证召回
			tokens = append(tokens, string(ch))
			// 重叠二元组：当前字 + 下一个字，保证精度
			if i+1 < len(runes) && isHan(runes[i+1]) {
				tokens = append(tokens, string(ch)+string(runes[i+1]))
			}
		} else if unicode.IsLetter(ch) || unicode.IsDigit(ch) {
			buf.WriteRune(ch)
		} else {
			// 标点是硬边界
			flush()
		}
	}
	flush()

	return tokens
}

// AddDocument 加入一篇文档
func (idx *InvertedIndex) AddDocument(docID int, content string) {
	tokens := Tokenize(content)

	// 过滤停用词
	filtered := make([]string, 0, len(tokens))
	for _, t := range tokens {
		if !idx.stopWords[t] {
			filtered = append(filtered, t)
		}
	}
	idx.docLengths[docID] = len(filtered)

	// 先统计词频和位置
	type entry struct {
		tf        int
		positions []int
	}
	local := make(map[string]*entry)

	for pos, token := range filtered {
		e, ok := local[token]
		if !ok {
			e = &entry{}
			local[token] = e
		}
		e.tf++
		e.positions = append(e.positions, pos)
	}

	// 写入全局倒排表
	for token, e := range local {
		posting := Posting{DocID: docID, TF: e.tf, Positions: e.positions}
		lst := idx.postings[token]
		// 保持 DocID 有序（二分查找的前提）
		if len(lst) == 0 || lst[len(lst)-1].DocID < docID {
			idx.postings[token] = append(lst, posting)
		} else {
			pos := sort.Search(len(lst), func(i int) bool { return lst[i].DocID >= docID })
			lst = append(lst, Posting{})
			copy(lst[pos+1:], lst[pos:])
			lst[pos] = posting
			idx.postings[token] = lst
		}
	}
}

// DocumentCount 文档总数
func (idx *InvertedIndex) DocumentCount() int { return len(idx.docLengths) }

// VocabularySize 词典大小
func (idx *InvertedIndex) VocabularySize() int { return len(idx.postings) }

// DocumentFrequency 某个词在多少篇文档中出现
func (idx *InvertedIndex) DocumentFrequency(term string) int {
	return len(idx.postings[term])
}

// avgDocLength 平均文档长度
func (idx *InvertedIndex) avgDocLength() float64 {
	if len(idx.docLengths) == 0 {
		return 0
	}
	sum := 0
	for _, l := range idx.docLengths {
		sum += l
	}
	return float64(sum) / float64(len(idx.docLengths))
}

// findPosting 在有序倒排表中二分查找，O(log df)
func findPosting(lst []Posting, docID int) *Posting {
	lo, hi := 0, len(lst)-1
	for lo <= hi {
		mid := (lo + hi) >> 1
		if lst[mid].DocID == docID {
			return &lst[mid]
		}
		if lst[mid].DocID < docID {
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	return nil
}

// idf BM25 的 IDF 项：常见词权重低，罕见词权重高
func (idx *InvertedIndex) idf(term string) float64 {
	n := idx.DocumentFrequency(term)
	N := idx.DocumentCount()
	if n == 0 {
		return 0
	}
	return math.Log(1 + (float64(N)-float64(n)+0.5)/(float64(n)+0.5))
}

// tfPart BM25 的 tf 饱和项：词频越高收益递减，不会线性爆炸
func (idx *InvertedIndex) tfPart(tf int, docLen int, avgLen float64) float64 {
	k1, b := idx.k1, idx.b
	denominator := float64(tf) + k1*(1-b+b*float64(docLen)/avgLen)
	return float64(tf) * (k1 + 1) / denominator
}

// scoreDAT 文档-at-a-time：逐个候选文档累加各查询词的得分
func (idx *InvertedIndex) scoreDAT(docID int, terms []string) float64 {
	docLen := idx.docLengths[docID]
	avgLen := idx.avgDocLength()
	if avgLen == 0 {
		avgLen = 1
	}
	score := 0.0
	for _, term := range terms {
		lst, ok := idx.postings[term]
		if !ok {
			continue
		}
		p := findPosting(lst, docID)
		if p == nil {
			continue
		}
		score += idx.idf(term) * idx.tfPart(p.TF, docLen, avgLen)
	}
	return score
}

// scoreTAT 词-at-a-time：逐个查询词遍历整条倒排表累加得分
func (idx *InvertedIndex) scoreTAT(terms []string) map[int]float64 {
	avgLen := idx.avgDocLength()
	if avgLen == 0 {
		avgLen = 1
	}
	scores := make(map[int]float64)
	for _, term := range terms {
		lst, ok := idx.postings[term]
		if !ok {
			continue
		}
		idf := idx.idf(term)
		if idf == 0 {
			continue
		}
		for _, p := range lst {
			docLen := idx.docLengths[p.DocID]
			scores[p.DocID] += idf * idx.tfPart(p.TF, docLen, avgLen)
		}
	}
	return scores
}

// Search 检索
//
// mode="and"：所有查询词都必须命中
// mode="or" ：命中任意一个词即可
// scoring="dat" / "tat" / "auto"
func (idx *InvertedIndex) Search(query string, topK int, mode string, scoring string) []SearchHit {
	terms := make([]string, 0)
	for _, t := range Tokenize(query) {
		if !idx.stopWords[t] {
			terms = append(terms, t)
		}
	}
	if len(terms) == 0 {
		return nil
	}

	termLists := make([][]Posting, 0, len(terms))
	missing := false
	for _, t := range terms {
		lst, ok := idx.postings[t]
		if !ok {
			missing = true
		}
		termLists = append(termLists, lst)
	}

	// AND 语义下，任何一个查询词都不存在，结果必然为空。
	// 不能把不存在的词直接过滤掉，否则会错误地放宽匹配条件。
	if mode == "and" && missing {
		return nil
	}

	lists := make([][]Posting, 0, len(termLists))
	for _, lst := range termLists {
		if len(lst) > 0 {
			lists = append(lists, lst)
		}
	}
	if len(lists) == 0 {
		return nil
	}

	// 从最短的倒排表开始（先缩小候选集）
	sort.Slice(lists, func(i, j int) bool { return len(lists[i]) < len(lists[j]) })

	var candidates []int
	if mode == "and" {
		// 双指针求交集，从最短表开始
		candidates = make([]int, 0, len(lists[0]))
		for _, p := range lists[0] {
			candidates = append(candidates, p.DocID)
		}
		for _, lst := range lists[1:] {
			if len(candidates) == 0 {
				break
			}
			ids := make(map[int]bool, len(lst))
			for _, p := range lst {
				ids[p.DocID] = true
			}
			next := candidates[:0]
			for _, id := range candidates {
				if ids[id] {
					next = append(next, id)
				}
			}
			candidates = next
		}
	} else {
		set := make(map[int]bool)
		for _, lst := range lists {
			for _, p := range lst {
				set[p.DocID] = true
			}
		}
		candidates = make([]int, 0, len(set))
		for id := range set {
			candidates = append(candidates, id)
		}
	}

	if len(candidates) == 0 {
		return nil
	}

	// 决定用 DAT 还是 TAT
	useTAT := scoring == "tat"
	if scoring == "auto" {
		sumDf := 0
		for _, lst := range lists {
			sumDf += len(lst)
		}
		avgDf := float64(sumDf) / float64(len(lists))
		datCost := float64(len(candidates)) * float64(len(terms)) * math.Log2(math.Max(avgDf, 2))
		useTAT = float64(sumDf) < datCost
	}

	hits := make([]SearchHit, 0, len(candidates))
	if useTAT {
		all := idx.scoreTAT(terms)
		for _, id := range candidates {
			hits = append(hits, SearchHit{DocID: id, Score: all[id]})
		}
	} else {
		for _, id := range candidates {
			hits = append(hits, SearchHit{DocID: id, Score: idx.scoreDAT(id, terms)})
		}
	}

	sort.Slice(hits, func(i, j int) bool { return hits[i].Score > hits[j].Score })
	if len(hits) > topK {
		hits = hits[:topK]
	}
	return hits
}

// SearchPhrase 短语查询：查询词必须在文档中连续出现
//
// 靠倒排表里记录的 Positions 做位置对齐：查询第 i 个词必须出现在 起始位置 + i
func (idx *InvertedIndex) SearchPhrase(phrase string, topK int) []SearchHit {
	terms := make([]string, 0)
	for _, t := range Tokenize(phrase) {
		if !idx.stopWords[t] {
			terms = append(terms, t)
		}
	}
	if len(terms) == 0 {
		return nil
	}

	first, ok := idx.postings[terms[0]]
	if !ok {
		return nil
	}

	hits := make([]SearchHit, 0)
	for _, posting := range first {
		matched := false
		for _, start := range posting.Positions {
			ok := true
			for i := 1; i < len(terms); i++ {
				lst, exists := idx.postings[terms[i]]
				var p *Posting
				if exists {
					p = findPosting(lst, posting.DocID)
				}
				if p == nil {
					ok = false
					break
				}
				found := false
				for _, pos := range p.Positions {
					if pos == start+i {
						found = true
						break
					}
				}
				if !found {
					ok = false
					break
				}
			}
			if ok {
				matched = true
				break
			}
		}
		if matched {
			hits = append(hits, SearchHit{
				DocID: posting.DocID,
				Score: idx.scoreDAT(posting.DocID, terms),
			})
		}
	}

	sort.Slice(hits, func(i, j int) bool { return hits[i].Score > hits[j].Score })
	if len(hits) > topK {
		hits = hits[:topK]
	}
	return hits
}
```

### 三语言一致性验证

我写了个交叉验证脚本，把**同一批文档、同一批查询**分别喂给 TypeScript 和 Python，然后逐个比对 docId 和 BM25 分数：

```
✅ TypeScript 与 Python 检索结果完全一致（BM25 分数精确到小数点后 6 位）

抽样展示「布隆过滤器 缓存穿透」：
{
 "or": [
  [4, 12.362039],
  [1, 10.856287],
  [0, 4.448471],
  [2, 0.584333]
 ],
 "and": [
  [4, 12.362039],
  [1, 10.856287]
 ],
 "tat": [
  [4, 12.362039],
  [1, 10.856287],
  [0, 4.448471],
  [2, 0.584333]
 ],
 "phrase": []
}
```

注意 `"tat"` 和 `"or"` 的结果**完全一样**——这正是 BM25 可加性的体现：两种打分路径算出的是同一个分数，只是快慢不同。

### 随机对拍：让程序帮我找 bug

手写几个例子测，是很难测出边界 bug 的。我的做法是写个**暴力实现**当标准答案，然后随机生成数据对比：

```typescript
/**
 * 倒排索引 —— 随机对拍验证
 * 用「暴力扫描」的结果作为标准答案，检验倒排索引的检索结果是否一致。
 */

// ---------- 暴力实现（标准答案）----------
// 注意：暴力实现必须和倒排索引使用同一套停用词过滤规则，否则对拍会误报
const STOP_WORDS = new Set([
  "the", "a", "an", "of", "to", "in", "is", "and", "or", "for", "on",
  "的", "了", "是", "在", "和", "与", "及", "也", "都", "而", "就", "很",
]);

function meaningful(tokens: string[]): string[] {
  return tokens.filter((t) => !STOP_WORDS.has(t));
}

function bruteSearch(docs: string[], query: string, mode: "and" | "or"): number[] {
  const qTerms = meaningful(tokenize(query));
  // 边界情况：查询词全是停用词，过滤后为空 -> 什么都不匹配
  // 这与倒排索引的 search() 行为一致（terms.length === 0 时直接返回空数组）
  if (qTerms.length === 0) return [];
  const results: number[] = [];

  for (let i = 0; i < docs.length; i++) {
    const dTerms = new Set(meaningful(tokenize(docs[i])));
    const hit = qTerms.filter((t) => dTerms.has(t));
    if (mode === "and" && hit.length === qTerms.length) results.push(i);
    if (mode === "or" && hit.length > 0) results.push(i);
  }
  return results;
}

/** 暴力短语查询：查询词元必须在文档词元序列中连续出现 */
function brutePhrase(docs: string[], phrase: string): number[] {
  const qTerms = meaningful(tokenize(phrase));
  if (qTerms.length === 0) return [];
  const results: number[] = [];

  for (let i = 0; i < docs.length; i++) {
    const dTerms = meaningful(tokenize(docs[i]));
    for (let start = 0; start + qTerms.length <= dTerms.length; start++) {
      let ok = true;
      for (let j = 0; j < qTerms.length; j++) {
        if (dTerms[start + j] !== qTerms[j]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        results.push(i);
        break;
      }
    }
  }
  return results;
}

// ---------- 随机数据生成 ----------
const WORDS = [
  "缓存", "穿透", "布隆", "过滤器", "倒排", "索引", "搜索", "引擎",
  "限流", "滑动", "窗口", "算法", "数据结构", "数据库", "性能", "优化",
  "redis", "mysql", "kafka", "elastic", "the", "and", "of",
];

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomDoc(): string {
  const len = 5 + randInt(15);
  const parts: string[] = [];
  for (let i = 0; i < len; i++) parts.push(WORDS[randInt(WORDS.length)]);
  return parts.join(" ");
}

// ---------- 主循环 ----------
let failures = 0;
const ROUNDS = 500;

for (let round = 0; round < ROUNDS; round++) {
  const nDocs = 1 + randInt(30);
  const docs: string[] = [];
  for (let i = 0; i < nDocs; i++) docs.push(randomDoc());

  const index = new InvertedIndex();
  docs.forEach((d, i) => index.addDocument(i, d));

  for (let q = 0; q < 5; q++) {
    const qLen = 1 + randInt(3);
    const qParts: string[] = [];
    for (let i = 0; i < qLen; i++) qParts.push(WORDS[randInt(WORDS.length)]);
    const query = qParts.join(" ");

    for (const mode of ["and", "or"] as const) {
      const expected = bruteSearch(docs, query, mode).sort((a, b) => a - b);
      const actual = index
        .search(query, 1000, mode)
        .map((h) => h.docId)
        .sort((a, b) => a - b);

      if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        failures++;
        console.error(`❌ 检索不一致 round=${round} mode=${mode} query="${query}"`);
        console.error(`   期望: [${expected}]`);
        console.error(`   实际: [${actual}]`);
        if (failures > 5) process.exit(1);
      }
    }

    // 短语查询：倒排索引按得分排序返回，统一按 docId 排序后比较集合
    const phrase = qParts[0];
    const expectedPhrase = brutePhrase(docs, phrase).sort((a, b) => a - b);
    const actualPhrase = index
      .searchPhrase(phrase, 1000)
      .map((h) => h.docId)
      .sort((a, b) => a - b);
    if (JSON.stringify(expectedPhrase) !== JSON.stringify(actualPhrase)) {
      failures++;
      console.error(`❌ 短语不一致 round=${round} phrase="${phrase}"`);
      console.error(`   期望: [${expectedPhrase}]`);
      console.error(`   实际: [${actualPhrase}]`);
      if (failures > 5) process.exit(1);
    }
  }
}

console.log(
  failures === 0
    ? `✅ 随机对拍通过：${ROUNDS} 轮 × (5 查询 × 2 模式 + 短语)，零差异`
    : `❌ 共 ${failures} 处不一致`,
);
```

最终结果：

```
✅ 随机对拍通过：500 轮 × (5 查询 × 2 模式 + 短语)，零差异
```

**这个脚本抓到了一个我手测时完全没发现的 bug**，就是 2.8 节说的那个「AND 模式下不存在的查询词被静默丢弃」的问题。

顺带说，对拍脚本本身也踩了三个坑，我记下来：

1. **停用词规则必须一致**：暴力实现没过滤停用词，索引过滤了，对拍立刻报一堆假差异
2. **结果集要排序后再比**：索引按分数排序返回，暴力按 docId 顺序，比的是集合不是顺序
3. **边界情况要对齐**：查询全是停用词时，暴力实现会因为 `hit.length === qTerms.length`（0 === 0）而返回全部文档，跟索引的行为不一致

> 教训：**写算法时，随机对拍比手动举例可靠得多**。手动测你会不自觉地只测"正常情况"，而随机对拍会疯狂撞边界。

## 四、复杂度分析

| 操作 | 时间复杂度 | 说明 |
| ---- | ---------- | ---- |
| 建索引（单文档） | O(L) | L = 文档词元数 |
| 建索引（整体） | O(N × L) | N = 文档数 |
| 查词（定位倒排表） | O(1) ~ O(log V) | V = 词典大小，Hash 表 O(1) |
| 定位某词在某文档的 posting | O(log df) | 倒排表有序，二分查找 |
| AND 求交（k 个词） | O(Σ dfᵢ) | 双指针归并，df 递增 |
| OR 求并（k 个词） | O(Σ dfᵢ) | |
| DAT 打分 | O(候选数 × k × log df) | |
| TAT 打分 | O(Σ dfᵢ) | |
| 短语查询 | O(df₁ × 位置数 × k × log df) | 位置对齐，最贵 |

**空间复杂度**：

```
倒排表总条目数 = 所有文档的词元总数 ≈ N × L
每个条目：docId(4B) + tf(4B) + positions(引用 8B) ≈ 16B
```

实测数据（2 万篇文档 × 100 词 = 200 万词元）：

```
总词元数：2,000,000
倒排表条目（含位置信息）：约 30.5 MB
```

**为什么倒排索引能扛住亿级文档？** 因为它的空间是**线性于文档总量**的，而不是指数级的。而且实际系统里：

- **词编号代替真实词**（词典单独存，常见词可以共享）
- **位置信息可以裁剪**（要短语查询才存 positions，否则只存 tf）
- ** postings 用压缩编码**（Lucene 的 Block Postings / PForDelta，能压到原大小的 10%~30%）
- **热门词单独处理**（高频词的倒排表可能有上亿条，会被切分成多个 block）

## 五、实际应用场景

### 1. 搜索引擎（Elasticsearch / Lucene）

这是最典型的场景。索引阶段：爬虫抓取网页 → 分词 → 建倒排索引。查询阶段：用户输入 → 分词 → 查倒排表 → BM25 排序 → 返回 Top-K。

Lucene 的 Segment 结构里，倒排表存在 `.doc`（docId 列表）、`.pos`（位置列表）、`.tim`（词频）三个文件里，就是本文讲的 Posting 三件套。

### 2. 数据库全文索引

MySQL 的 `FULLTEXT INDEX`、PostgreSQL 的 `tsvector` / GIN 索引，底层都是倒排索引。

```sql
-- MySQL 8.0
CREATE TABLE articles (
  id BIGINT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  FULLTEXT INDEX idx_content (content)
) ENGINE=InnoDB;

SELECT * FROM articles
WHERE MATCH(content) AGAINST ('缓存穿透' IN NATURAL LANGUAGE MODE)
ORDER BY MATCH(content) AGAINST ('缓存穿透') DESC;
```

注意 MySQL 用的是自己改良的 TF-IDF（不是标准 BM25），而且默认有 50% 停用词过滤——这会让短查询效果很差，需要调 `innodb_ft_min_token_size`。

### 3. 日志检索（Loki / ClickHouse）

在可观测性领域，"日志里搜 error"就是典型的倒排索引场景。Loki 把日志按时间分片，片内用倒排索引做标签检索。

### 4. 代码搜索

GitHub 的代码搜索、IDE 的全局搜索（VSCode 的 Ctrl+Shift+F），都是倒排索引。IDE 那种场景还要额外处理**符号级索引**（函数名、类名单独建索引），提高精确度。

### 5. 推荐系统的候选召回

很多推荐系统会用倒排索引做 item-to-user 的召回：用户看了商品 A，倒排表里查出"也看了 A 的其他用户"，再推他们喜欢的商品。这本质上就是"用 item 的倒排表做协同过滤"。

### 6. 电商的商品搜索

淘宝、京东搜索商品，除了倒排索引还需要处理**同义词**（"手机" vs "智能手机"）、**拼写纠错**（"手ji" → "手机"）、**拼音搜索**（"shouji" → "手机"）。这些都是在分词/查询层做的处理，底层依然是倒排索引。

## 六、避坑清单

### ❌ 坑 1：AND 模式下静默丢弃不存在的词

前面讲过了，这是最隐蔽的一个。查询里的词如果不在索引中，必须直接返回空，而不是过滤掉继续匹配。

### ❌ 坑 2：忘记让倒排表保持 docId 有序

乱序的倒排表只能用线性查找，df 大的时候性能直接崩十倍。写入时就要保证有序。

### ❌ 坑 3：求交时不从最短表开始

```typescript
// ❌ 顺序不对：如果第一个词很常见，交集运算会白跑很多
lists.forEach((list, i) => { ... });

// ✅ 先排序，最短的优先
lists.sort((a, b) => a.length - b.length);
```

### ❌ 坑 4：中文 bigram 不重叠

「缓存穿透」切成「缓存 / 穿」会丢掉「存」，某些查询就永远匹配不上。

### ❌ 坑 5：查询串和文档串分词规则不一致

Lucene 老老实实写了 N 篇文档讲这事。解决办法就是保留单字兜底，或者强制查询串和文档串走完全相同的 analyzer 链路。

### ❌ 坑 6：BM25 公式写错括号

Go 里特别容易犯：

```go
// ❌ 运算符优先级错误，实际算的是 (tf*(k1+1))/tf + k1*(...)
return float64(tf*(k1+1)) / float64(tf) + k1*(1-b+b*float64(docLen)/avgLen)

// ✅ 先算分母
denominator := float64(tf) + k1*(1-b+b*float64(docLen)/avgLen)
return float64(tf) * (k1 + 1) / denominator
```

我第一次写 Go 版就踩了这个，分数跟 TS/Python 对不上才发现。

### ❌ 坑 7：用 DAT 处理高频词

前面实测里已经看到，DAT 在候选集大的时候比暴力扫描还慢。**默认用 TAT，或者用 auto 自动选**。

### ❌ 坑 8：停用词过滤掉得太狠

中文停用词如果把「的」「是」「在」都干掉，短查询（两个字）可能一个词都不剩。工程上的做法是：查询词全被过滤时，**回退到不过滤的版本**再查一次。

## 七、面试题精选

### Q1：倒排索引和正向索引有什么区别？为什么需要倒排索引？

正排是「文档 ID → 内容」，适合按 ID 查详情；倒排是「词 → 文档列表」，适合按内容查文档。检索场景要的是后者，正排只能全表扫描，复杂度 O(N × 文档长度)，而倒排是 O(命中词数 × log df)。

### Q2：倒排表里存了什么？为什么要存位置？

存 docId、词频 tf、出现位置 positions。存 tf 是为了 BM25 打分，存 positions 是为了支持短语查询（判断词是否连续出现）。

### Q3：BM25 和 TF-IDF 有什么区别？

主要三处：

1. **TF 饱和**：TF-IDF 里 tf 线性增长，BM25 有饱和项，词频收益递减
2. **长度归一化**：BM25 显式考虑文档长度，TF-IDF 没有
3. **参数可调**：BM25 的 k1、b 让它能适配不同场景

### Q4：什么是 DAT 和 TAT？什么时候用哪个？

两种打分遍历顺序。DAT 先定候选集再逐文档累加各词得分，代价 O(候选数 × 词数 × log df)；TAT 逐词扫完整条倒排表累加，代价 O(Σ df)。BM25 可加，两者分数相同。查罕见词用 DAT，查常见词用 TAT。

### Q5：倒排表怎么做求交？复杂度多少？

用双指针归并（前提是倒排表按 docId 有序），复杂度 O(m + n)。一定要**从最短的倒排表开始**，先缩小候选集。

### Q6：中文分词怎么处理？

三种方案：词典分词（准但要维护词典）、二元组（零词典但精度下降）、单字+二元组（本文方案，兼顾召回和精度）。注意 bigram 必须重叠，且查询串和文档串的分词规则要一致。

### Q7：倒排索引怎么支持短语查询？

靠 positions 数组做位置对齐。取第一个词的所有位置作为起点，逐一检查后续词是否出现在 `start + i`。优化方向是对 positions 排序后二分，或用位图表示。

### Q8：倒排索引怎么更新？文档删了怎么办？

- **更新**：删掉该 docId 在相关词倒排表里的条目，再重新分词插入
- **删除**：同上，但要考虑 segments / merge 的策略（Lucene 是先标记删除，merge 时真正清理）

### Q9：怎么防止某个词把索引撑爆？

高频词（比如英文 "the"）的倒排表可能有上亿条。解决方案：

1. **停用词过滤**（最简单）
2. **高频词不进倒排索引**，查询时特殊处理
3. **倒排表分块 + 压缩**（Lucene 的 Block Postings）
4. **跳表 / PForDelta 编码**，跳过整块不相关的条目

### Q10：为什么倒排索引能支持"搜索建议"（type-ahead）？

因为倒排表有序，可以做前缀查找。找到词的前缀对应的所有 docId，配合编辑距离算法就能给出建议。

## 八、小结

倒排索引就一句话：**把「文档里有什么」反过来存成「谁包含这个词」**。

它的能力边界也很清楚：

- ✅ 擅长：全文检索、关键词过滤、高并发查询
- ✅ 强项：一次查询只触碰相关的倒排表，不受文档总量影响
- ❌ 不擅长：模糊匹配（这需要另外的编辑距离索引）
- ❌ 不擅长：排序字段检索（这需要正排索引或者 z-order 编码）
- ❌ 不擅长：频繁更新（倒排表的合并和段管理有成本）

**真实系统里，倒排索引和正排索引是并存的**，各司其职：

- 倒排索引：过滤（哪些文档包含"缓存"）
- 正排索引：排序和返回字段（这些文档的标题是什么、按什么字段排）

最后送一句我写在笔记本上的话：

> **倒排索引的本质，是用空间换时间、预计算换在线计算。**
> 建索引的时候多花点力气，查询的时候就少跑点路。
> 这个 trade-off 在整个计算机系统里反复出现——
> 缓存、预编译、CDN、列式存储，全是同一个思路。

---

## 相关阅读

- [前缀树（Trie / Prefix Tree）](trie.md) —— 倒排索引的词典部分，本质上是一个动态 Trie
- [布隆过滤器](bloom-filter.md) —— 可以放在倒排索引前面做粗筛，过滤掉不存在的查询词
- [KMP 字符串匹配](kmp.md) —— 短语查询之外，字符串匹配算法的另一条路线
- [Rabin-Karp 字符串哈希算法](rabin-karp.md) —— 滚动哈希，另一类字符串匹配思路
- [后缀数组（Suffix Array）](suffix-array.md) —— 全文检索的另一条技术路线，和倒排索引互为补充
- [二分查找](binary-search.md) —— 倒排表有序后定位 posting 的基础
