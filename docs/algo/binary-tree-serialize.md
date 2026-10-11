---
title: 二叉树的序列化与反序列化
description: 二叉树的序列化与反序列化（Serialize & Deserialize Binary Tree）：前序/BFS/层序三种方案深度剖析
date: 2026-10-10 09:00:27
categories:
  - Algorithm
tags:
  - binary-tree
  - serialize
  - deserialize
  - bfs
  - dfs
  - interview
sidebarSort: 101
---

# 二叉树的序列化与反序列化（Serialize & Deserialize Binary Tree）

你有没有遇到过这样的需求:把内存里的一个对象"打包"成字符串存到 Redis,下次启动时再"解包"出来?或者前端要保存后端返回的树形菜单数据,关闭页面后重新打开还能恢复?再比如 RPC 调用要把参数对象编码成字节流传过去,接收方再还原?

这背后就是**序列化(Serialize)** 和**反序列化(Deserialize)** 的活儿。它看着像是工程问题,实际上面试里有一道经典题把它变成了算法题 —— **LeetCode 297**:把一棵二叉树编码成一个字符串,再从这个字符串还原成**结构完全一致**的二叉树。

这道题为什么这么受欢迎?因为它同时考察了:
- 树的遍历(前序/BFS/层序)
- 递归与迭代的相互转换
- 空指针(null)的处理 —— 这是关键!
- 边界条件(nil、负数、特殊字符)

今天我就跟你彻底聊透它 ✨。

## 为什么需要序列化?

先说点虚的 —— 你可能会问:为什么要序列化一棵二叉树?

现实场景里,树这种结构很常见:

```typescript
// 后端返回的菜单/权限树
{
  id: 1,
  name: '系统管理',
  children: [
    { id: 11, name: '用户管理', children: [] },
    { id: 12, name: '角色管理', children: [] }
  ]
}
```

或者前端组件树、AST 树、区块链里的 Merkle 树、机器学习里的决策树……

**问题来了**:这些树本质上是内存里的指针结构(每个节点有 `left`、`right` 指针),而 Redis、文件、HTTP 请求体只能存字符串/字节流。怎么把"指针森林"变成"扁平的字符串",再还原回去,就是序列化要做的事。

核心难点有三个:

1. **结构要完整保留** —— 节点之间的关系不能丢
2. **空指针要明确表达** —— `null` 必须有占位符,不然还原的时候分不清"没孩子"和"该位置是孩子"
3. **数值要能区分边界** —— 比如节点值是字符串、负数、多位数,得有明确的分隔符

## 三种主流方案

### 方案概览

| 方案 | 序列化结果示例 | 优点 | 缺点 |
|------|---------------|------|------|
| 前序 DFS | `1,2,N,N,3,4,N,N,5,N,N,` | 简洁、递归自然 | 长链状树深度可能爆栈 |
| BFS 层序 | `1,2,3,N,N,4,5,N,N,N,N,` | 直观,跟 LeetCode 官方解一致 | 字符串稍长 |
| 后序/中序 | 不推荐单独使用 | - | 还原时无法确定根 |

### 为什么不能只用"前序遍历"然后按逗号分隔?

很多人第一直觉是:把树前序遍历一遍,值用逗号连起来不就完事了?

```typescript
// 错误示范 ❌
function serializeBad(root: TreeNode | null): string {
  if (!root) return '';
  return root.val + ',' + serializeBad(root.left) + ',' + serializeBad(root.right);
}
```

跑一下上面那棵树:

```
        1
       / \
      2   3
         / \
        4   5

输出: "1,2,3,4,5"
```

看起来没问题?但是反序列化的时候,`5` 怎么知道自己是叶子?前面那个 `3` 怎么知道它的左孩子是 `4` 而不是空?

**问题就出在:前序遍历丢失了"空"的信息**。序列化时 `null` 不写出来,反序列化就没法判断哪里该停。

所以正确做法是:**遇到 `null` 必须输出占位符**(比如大写 `N` 或者 `null`)。

## 方案一:前序 DFS + 空指针占位符

这是最经典、最简洁的方案,也是大部分面试官想听到的答案。

### 序列化

```typescript
/**
 * 二叉树节点定义
 */
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(val: number) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

/**
 * 前序 DFS 序列化
 * 核心思想:根 → 左 → 右,空节点用 "N" 占位,值之间用逗号分隔
 */
function serialize(root: TreeNode | null): string {
  const parts: string[] = [];

  const dfs = (node: TreeNode | null): void => {
    if (node === null) {
      // 空节点必须有占位符,不能省略!
      parts.push('N');
      return;
    }
    parts.push(String(node.val)); // 输出根
    dfs(node.left);               // 递归左
    dfs(node.right);              // 递归右
  };

  dfs(root);
  return parts.join(',');
}
```

以这棵树为例:

```
        1
       / \
      2   3
         / \
        4   5
```

序列化结果:`1,2,N,N,3,4,N,N,5,N,N`

ASCII 图示整个过程:

```
原始树:
            1
           / \
          2   3
             / \
            4   5

前序遍历序列(带空节点标记):
1 → 进入左子树 → 2 → 进入左子树 → null → null → 回溯
→ 进入右子树 → 3 → 进入左子树 → 4 → null → null
→ 进入右子树 → 5 → null → null

最终字符串:"1,2,N,N,3,4,N,N,5,N,N"
```

### 反序列化

反序列化才是这道题的**真正难点**。前序遍历有个特点:**第一个值一定是根**。抓住这个,就能递归还原整棵树。

```typescript
/**
 * 前序 DFS 反序列化
 * 思路:用 index 指针追踪当前处理到哪个位置,递归还原
 */
function deserialize(data: string): TreeNode | null {
  const parts = data.split(',');
  let index = 0; // 全局索引,指向当前要处理的节点

  const dfs = (): TreeNode | null => {
    if (index >= parts.length) return null;

    const val = parts[index++];
    if (val === 'N') {
      // 遇到占位符,返回 null,不创建节点
      return null;
    }

    // 一定是数字,创建节点
    const node = new TreeNode(Number(val));
    node.left = dfs();  // 递归构建左子树
    node.right = dfs(); // 递归构建右子树
    return node;
  };

  return dfs();
}
```

**关键点**:`index` 必须是全局共享的(用闭包或类成员),不能每次递归传参 —— 因为反序列化要顺序消费 tokens,左子树处理完后 index 已经停在右子树的起点,这个状态必须带回上层。

我用刚才那棵树走一遍反序列化的过程:

```
输入字符串:"1,2,N,N,3,4,N,N,5,N,N"
                ↑ index

步骤1:读 "1" → 创建节点1,index=1
步骤2:递归左子树 → 读 "2" → 创建节点2,index=2
步骤3:递归左子树 → 读 "N" → 返回 null,index=3
步骤4:递归右子树 → 读 "N" → 返回 null,index=4
步骤5:回到节点2,左右都为 null ✓
步骤6:回到节点1,递归右子树 → 读 "3" → 创建节点3,index=5
步骤7:递归左子树 → 读 "4" → 创建节点4,index=6
步骤8:递归左子树 → 读 "N" → 返回 null,index=7
步骤9:递归右子树 → 读 "N" → 返回 null,index=8
步骤10:回到节点4 ✓
步骤11:回到节点3,递归右子树 → 读 "5" → 创建节点5,index=9
步骤12:递归左子树 → 读 "N" → 返回 null,index=10
步骤13:递归右子树 → 读 "N" → 返回 null,index=11
步骤14:回到节点5 ✓
步骤15:回到节点3,左右都完成 ✓
步骤16:回到节点1,返回整棵树 ✓
```

### Python 版本(更简洁)

Python 因为有 `None` 和元组,在面试白板上写起来更快:

```python
class TreeNode:
    def __init__(self, val: int):
        self.val = val
        self.left = None
        self.right = None

class Codec:
    def serialize(self, root: TreeNode) -> str:
        """前序 DFS 序列化"""
        parts = []

        def dfs(node):
            if node is None:
                parts.append('N')
                return
            parts.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ','.join(parts)

    def deserialize(self, data: str) -> TreeNode:
        """前序 DFS 反序列化"""
        parts = data.split(',')
        self.index = 0  # 用 self 共享状态

        def dfs() -> TreeNode:
            if self.index >= len(parts):
                return None
            val = parts[self.index]
            self.index += 1
            if val == 'N':
                return None
            node = TreeNode(int(val))
            node.left = dfs()
            node.right = dfs()
            return node

        return dfs()
```

## 方案二:BFS 层序序列化(LeetCode 官方解)

这种方案的序列化结果最直观,逐层扫描,一眼就能看出树的形状。

### 序列化

```typescript
function serializeBFS(root: TreeNode | null): string {
  if (root === null) return '';

  const parts: string[] = [];
  const queue: (TreeNode | null)[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node === null) {
      parts.push('N');
      continue;
    }
    parts.push(String(node.val));
    // 即使是 null 也要入队,这样下一层才知道这里没有子节点
    queue.push(node.left);
    queue.push(node.right);
  }

  return parts.join(',');
}
```

跑一下:

```
        1
       / \
      2   3
         / \
        4   5

队列过程:
初始: [1]
出队 1 → 输出 "1", 入队 2, 3
出队 2 → 输出 "2", 入队 N, N
出队 3 → 输出 "3", 入队 4, 5
出队 N → 输出 "N"
出队 N → 输出 "N"
出队 4 → 输出 "4", 入队 N, N
出队 5 → 输出 "5", 入队 N, N
出队 N → 输出 "N"
出队 N → 输出 "N"

结果:"1,2,3,N,N,4,5,N,N,N,N"
```

注意:最后那串 `N,N,N,N` 是必须的!因为如果不输出末尾的空节点,反序列化时无法判断树的"边界"。比如上面的字符串如果截断成 `"1,2,3,N,N,4,5"`,就分不清节点 5 下面有没有孩子了。

### 反序列化

BFS 反序列化的关键是:**用队列维护"待挂子节点的父节点"**。

```typescript
function deserializeBFS(data: string): TreeNode | null {
  if (data === '') return null;

  const parts = data.split(',');
  const root = new TreeNode(Number(parts[0]));
  const queue: TreeNode[] = [root];
  let i = 1; // 指向 parts 中下一个要处理的 token

  while (i < parts.length) {
    const parent = queue.shift()!;

    // 处理左孩子
    const leftVal = parts[i++];
    if (leftVal !== 'N') {
      parent.left = new TreeNode(Number(leftVal));
      queue.push(parent.left);
    }

    // 处理右孩子
    if (i < parts.length) {
      const rightVal = parts[i++];
      if (rightVal !== 'N') {
        parent.right = new TreeNode(Number(rightVal));
        queue.push(parent.right);
      }
    }
  }

  return root;
}
```

### BFS vs DFS,该怎么选?

| 维度 | 前序 DFS | BFS 层序 |
|------|---------|---------|
| 代码量 | 少(递归天然) | 多(手动维护队列) |
| 直观性 | 一般(脑子要转一下) | 高(可视化好) |
| 极端树性能 | 链状树可能爆栈 | 安全 |
| 字符串长度 | 较短 | 略长 |
| 面试官接受度 | 高(经典答案) | 高(LeetCode 官方) |

**实战建议**:
- 面试时优先写前序 DFS(代码短、好讲清楚)
- 如果面试官追问"有没有更好的",再写 BFS 版本
- 链状树(每个节点只有一个孩子)会爆栈,可以提一下这个边界

## 方案三:中序/后序行不行?

很多同学会好奇:为什么不能用中序或后序?

**答:不行,因为单独使用无法唯一确定根节点。**

举个例子:

```
树 A:   1        树 B:   1
       /                \
      2                  3
```

- 前序:A 是 `1,2`,B 是 `1,3` → **能区分**
- 后序:A 是 `2,1`,B 是 `3,1` → **能区分**
- 中序:A 是 `2,1`,B 是 `1,3` → **也能区分** ✅

但如果是更复杂的情况:

```
树 A:        1         树 B:        2
            / \                    / \
           2   3                  1   3
```

- 中序:A 是 `2,1,3`,B 是 `1,2,3` → **不一样,可以区分** ✓

但是下面这种就行不通:

```
树 A:    1     树 B:    1
           \           /
            2         2
```

- 中序:A 是 `1,2`,B 是 `1,2` → **完全一样!无法区分根和子树**

这就是为什么中序不行 —— 它的根节点不固定在序列开头或结尾。

后序也不行,虽然根在末尾,但你得知道右子树的边界才能切分。

**结论:序列化二叉树只能用前序或层序(或它们的变体)**,中序和后序单独用无法还原。

## 复杂度分析

| 方案 | 序列化时间 | 反序列化时间 | 空间复杂度 |
|------|----------|------------|----------|
| 前序 DFS | O(n) | O(n) | O(n) 字符串 + O(h) 栈深,h 最坏 O(n) |
| BFS 层序 | O(n) | O(n) | O(n) 字符串 + O(w) 队列,w 是最大宽度,最坏 O(n) |

`h` 是树的高度,`n` 是节点数。
**链状树**时 h = n,所以递归可能爆栈;**平衡树**时 h = log n,完全没问题。

面试时如果面试官问"链状树会爆栈怎么办",你可以说:

> "可以用迭代的前序遍历替代递归,用显式栈模拟调用栈,把空间复杂度从 O(h) 变成可控的 O(h) 但不会爆栈。实际上 LeetCode 的 n 一般是 10^5,JS 的栈深度大概 10^4,链状树确实会栈溢出,这时候换 BFS 更稳。"

## 实际工程中的序列化方案

面试题归面试题,工程里的方案远比字符串逗号分隔复杂。

### 1. JSON(最常用)

```typescript
// 把树转成普通对象数组
const tree = {
  val: 1,
  left: { val: 2, left: null, right: null },
  right: { val: 3, left: { val: 4, left: null, right: null }, right: null }
};

// 序列化为 JSON 字符串
const json = JSON.stringify(tree);
// '{"val":1,"left":{"val":2,"left":null,"right":null},"right":{"val":3,"left":{"val":4,"left":null,"right":null},"right":null}}'

// 反序列化
const restored = JSON.parse(json);
```

JSON 的优点是**通用、自描述、跨语言**。缺点是**冗余大**(字段名每次都重复)、**不能存函数/Symbol**。

### 2. Protocol Buffers / FlatBuffers(高性能场景)

```protobuf
message TreeNode {
  int32 val = 1;
  TreeNode left = 2;
  TreeNode right = 3;
}
```

二进制格式,体积小、速度快,但需要预先定义 schema。gRPC、Thrift 都用类似的。

### 3. MessagePack(折中方案)

类似 JSON 但用二进制,体积比 JSON 小 30%-50%,速度更快,大多数语言都有库支持。

### 4. 自定义协议(嵌入式/游戏/前端组件)

比如 React 的 `ReactDOMServer.renderToString`、Vue 的 `renderToString` 都是把虚拟 DOM 树序列化成 HTML 字符串,本质上和二叉树序列化是一回事 —— 用特定格式编码指针关系。

## 扩展:序列化带父指针的树

经典题里没有父指针,但工程中常见。给每个节点加一个 `parent` 字段,要保留双向引用。

### 方案一:两次遍历

```typescript
function serializeWithParent(root: TreeNode | null): string {
  if (root === null) return '';

  // 第一遍:序列化节点值
  const values: string[] = [];
  const indexMap = new Map<TreeNode, number>();

  const dfs1 = (node: TreeNode | null) => {
    if (node === null) return;
    indexMap.set(node, values.length);
    values.push(String(node.val));
    dfs1(node.left);
    dfs1(node.right);
  };
  dfs1(root);

  // 第二遍:序列化每个节点的子节点索引
  const children: string[] = [];
  const dfs2 = (node: TreeNode | null) => {
    if (node === null) return;
    const leftIdx = node.left !== null ? indexMap.get(node.left)! : -1;
    const rightIdx = node.right !== null ? indexMap.get(node.right)! : -1;
    children.push(`${leftIdx},${rightIdx}`);
    dfs2(node.left);
    dfs2(node.right);
  };
  dfs2(root);

  return values.join(',') + '|' + children.join(',');
}
```

### 方案二:用对象引用代替索引

在 Node.js 环境里,可以直接用 `WeakMap` 缓存引用,但这种方案不能跨进程传输 —— 因为另一台机器的内存地址毫无意义。

工程中常用方案是**给每个节点发一个 ID**(可以基于值,也可以基于全局计数器),序列化时记录 ID 和子节点的 ID 列表。

## 常见陷阱与边界情况

### 1. 节点值是负数

```typescript
// val 可能是 -100,不能简单地 split(',') 后当 number 解析就完事
// 需要约定:负号保留,数字连续,只有遇到 'N' 才是空节点
// "N,-100,5" → split 后是 ["N", "-100", "5"],Number("-100") = -100 ✅
```

实际上现在的实现已经天然支持负数,因为 `Number()` 能解析负号。

### 2. 节点值含逗号

如果业务里节点值是字符串,直接用逗号分隔会冲突。

```typescript
// 节点值: "hello,world"
const bad = "hello,world,N,foo"; // 完全乱套了
```

**解决方案**:
- **方案 A**:转义(`Base64Value("hello,world")` → `"aGVsbG8sd29ybGQ="`)
- **方案 B**:用不常出现的字符作分隔符(比如 `|` 或 `\u0001`)
- **方案 C**:用 JSON(整个树转成 JSON 字符串,本身就是带引号的)

### 3. 极深链状树(栈溢出)

```typescript
// 10000 层深的链状树,递归会爆栈
// const deep = buildChainTree(10000);
// serialize(deep); // RangeError: Maximum call stack size exceeded
```

**解决方案**:改用 BFS,或者把递归改成显式栈的迭代版本。

### 4. 空树

```typescript
serialize(null);   // "N" 或 "" 都可以,但要前后一致
deserialize("N");  // null
deserialize("");   // null (取决于约定)
```

**约定很重要** —— 工程里要明确:空树序列化成什么,反序列化空字符串怎么处理。

### 5. 重复节点值

```typescript
//    1
//   / \
//  1   1
// "1,1,N,N,1,N,N,N" — 仍然能正确还原,因为有 N 做分隔
```

这个没问题,序列化方案天然支持重复值,只要 N 占位符在就行。

## 总结

| 关键点 | 内容 |
|--------|------|
| 核心难点 | 空指针必须用占位符,否则无法还原 |
| 推荐方案 | 前序 DFS(简洁)+ BFS 层序(直观),两者都要会 |
| 不推荐 | 中序/后序单独用(无法确定根) |
| 复杂度 | 时间 O(n),空间 O(n) |
| 工程延伸 | JSON/Protobuf/MessagePack,根据场景选 |
| 边界条件 | 负数、特殊字符、极深链、空树、重复值 |

### 面试回答模板

> "序列化二叉树的核心是用前序遍历加空指针占位符,反序列化时用全局索引追踪位置,递归还原左子树和右子树。如果面试官追问,可以再加 BFS 层序方案作为对比。最后提一下中序后序不行,因为无法唯一确定根节点。"

### 一句话记忆

> **前序序列化,BFS 序列化,空节点必占位,索引必共享** ✨

---

今天这篇把"序列化"这个看起来像工程、实则是算法的高频题讲透了。下次再遇到类似"把内存里的复杂结构编码成字符串"的场景,你就知道背后的原理都是相通的:选对遍历方式 + 明确空指针 + 统一分隔符。Go ahead and build it!

> 📚 推荐练习:LeetCode 297、LeetCode 449(序列化和反序列化二叉搜索树)、LeetCode 428(序列化和反序列化 N 叉树)。其中 449 因为是 BST,可以利用大小关系省掉占位符,代码更简洁 —— 但本质思路是一致的。