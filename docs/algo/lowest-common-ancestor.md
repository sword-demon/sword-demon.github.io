---
title: 最近公共祖先（Lowest Common Ancestor）
description: 最近公共祖先（LCA）—— 二叉树的经典问题，四种解法从暴力到进阶，面试高频！
date: 2026-08-20 09:01:48
categories:
  - Algorithm
tags:
  - lca
  - binary-tree
  - lowest-common-ancestor
  - tree-traversal
  - interview
sidebarSort: 75
---

# 最近公共祖先（Lowest Common Ancestor）

你做项目的时候有没有遇到过这种场景：做一个权限系统，用户 A 和用户 B 各自属于不同的部门，你要找出他们**最顶层公共的管理者**是谁。再比如，你们公司的组织架构是一棵树（CEO → CTO → 部门经理 → 员工），问你员工 A 和员工 B 共同汇报到的最高级别 leader 是谁。

这个问题在二叉树里就叫 **LCA（Lowest Common Ancestor）**——最近公共祖先。LeetCode #236，面试出场率极高 🔥。

## 问题定义

给定一棵二叉树 root，和两个节点 p 和 q，找出 p 和 q 的**最近公共祖先**。

> 节点的"祖先"包括它自己。比如节点 5 的祖先有 [5, 3, 1]（假设 1 是根）。
>
> 最近公共祖先就是 p 和 q 两个节点的公共祖先中，深度最大的那个（即离两个节点最近的）。

```
示例：

        1
       / \
      2   3
     / \   \
    4   5   6
           /
          7

节点 4 和 节点 5 的 LCA = 2
节点 5 和 节点 6 的 LCA = 1（因为 5 在 2 的子树，6 在 3 的子树，只有根 1 是公共的）
节点 5 和 节点 7 的 LCA = 1
```

## 原理拆解

LCA 有好几种解法，从暴力到高效都有，我们一个一个来看。

### 解法一：暴力枚举（理解用，生产别用）

最直接的思路：先找到从根到 p 的路径，再找到从根到 q 的路径，然后找两条路径上最后一个公共节点。

```
从根到 4 的路径：1 → 2 → 4
从根到 5 的路径：1 → 2 → 5

路径 1: [1, 2, 4]
路径 2: [1, 2, 5]

从前往后对齐，最后一个公共节点是 2，所以 LCA = 2 ✓
```

怎么找路径？DFS 遍历记录路径，遇到目标节点就停止。

```typescript
function getPath(root: TreeNode, target: TreeNode): TreeNode[] | null {
  const path: TreeNode[] = [];

  function dfs(node: TreeNode): boolean {
    if (!node) return false;
    path.push(node);
    if (node === target) return true;
    if (dfs(node.left) || dfs(node.right)) return true;
    path.pop(); // 回溯
    return false;
  }

  dfs(root);
  return path;
}

function lcaBruteForce(root: TreeNode, p: TreeNode, q: TreeNode): TreeNode | null {
  const pathP = getPath(root, p);
  const pathQ = getPath(root, q);

  let lca: TreeNode | null = null;
  const minLen = Math.min(pathP!.length, pathQ!.length);

  for (let i = 0; i < minLen; i++) {
    if (pathP![i] === pathQ![i]) {
      lca = pathP![i];
    }
  }

  return lca;
}
```

**问题**：两次 DFS，时间 O(n)，空间 O(n)。路径还要存两遍，内存开销大。

### 解法二：递归法（面试首选）

这是面试官最想看到的解法，利用递归的特性巧妙求解。

**核心思想**：

对任意节点 root，去它的左子树和右子树分别找 p 和 q：

```
情况 1：root 本身是 p 或 q
        → LCA 可能是 root 本身

情况 2：p 在左子树，q 在右子树（或反之）
        → root 就是 LCA，因为 p 和 q 分别在两侧

情况 3：p 和 q 都在左子树
        → LCA 在左子树里

情况 4：p 和 q 都在右子树
        → LCA 在右子树里
```

递归返回的逻辑很清晰：

```typescript
/**
 * 递归求解 LCA
 *
 * 对于当前节点 root：
 * - 如果 root 是 null 或者等于 p 或 q，直接返回 root
 * - 否则递归左子树和右子树
 * - 根据左右子树的返回值决定：
 *     左右都有值 → p、q 分别在两侧，LCA 是 root
 *     只有左边有值 → LCA 在左子树
 *     只有右边有值 → LCA 在右子树
 *     都没值 → 不可能（题目保证 p、q 都在树里）
 */
function lcaRecursive(root: TreeNode, p: TreeNode, q: TreeNode): TreeNode | null {
  // 基本情况：空节点或者找到了其中一个节点
  if (!root || root === p || root === q) {
    return root;
  }

  // 去左右子树找
  const left = lcaRecursive(root.left, p, q);
  const right = lcaRecursive(root.right, p, q);

  // 根据左右子树的返回值判断
  if (left && right) {
    // p 和 q 分别在两侧，当前节点就是 LCA
    return root;
  }

  // 只有一边找到了，返回那边的结果（可能是 null，也可能是 LCA 或目标节点）
  return left ?? right;
}
```

为什么能 work？关键在于**后序遍历**的特性：先处理子树，再处理根，所以能知道左右子树是否都找到了目标节点。

```typescript
// 用图来理解：

        1
       / \
      2   3
     / \   \
    4   5   6

找 4 和 5 的 LCA：

递归过程（后序遍历）：

  dfs(1):
    left = dfs(2):
      left = dfs(4):
        left = null, right = null
        root === 4 → 返回 4
      right = dfs(5):
        left = null, right = null
        root === 5 → 返回 5
      left=4, right=5 → 左右都有，返回 2
    right = dfs(3):
      ... → null
    left=2, right=null → 返回 2

最终返回 2 ✓
```

### 解法三：记录父节点 + 哈希集合（好理解，O(n)）

思路：

1. 先用一个 HashMap 记录每个节点的父节点
2. 从 p 出发，把 p 及其所有祖先都放入一个集合
3. 从 q 出发往上走，第一个在集合里出现的就是 LCA

```typescript
function lcaWithParent(
  root: TreeNode,
  p: TreeNode,
  q: TreeNode
): TreeNode | null {
  const parentMap = new Map<TreeNode, TreeNode | null>();

  // DFS 记录每个节点的父节点
  function dfs(node: TreeNode, parent: TreeNode | null) {
    if (!node) return;
    parentMap.set(node, parent);
    dfs(node.left, node);
    dfs(node.right, node);
  }
  dfs(root, null);

  // 把 p 及其祖先都放进集合
  const ancestors = new Set<TreeNode>();
  let curr: TreeNode | null = p;
  while (curr) {
    ancestors.add(curr);
    curr = parentMap.get(curr) ?? null;
  }

  // 从 q 往上走，第一个在集合里的就是 LCA
  curr = q;
  while (curr) {
    if (ancestors.has(curr)) {
      return curr;
    }
    curr = parentMap.get(curr) ?? null;
  }

  return null; // 理论上不会走到这里
}
```

**复杂度**：O(n) 时间（遍历一次建哈希表），O(n) 空间（存父节点哈希表 + 祖先集合）。

### 解法四：Tarjan 离线算法（高级用法）

如果你需要一次查询多个 LCA（比如 Many Queries），可以用 **Tarjan 的离线 LCA 算法**，只需要一次 DFS 就能回答所有查询，时间 O(n + q)。

原理基于**并查集**：DFS 遍历过程中，用一个"已访问"的标记，遍历完一个子树后，把子树节点合并到父节点。当一个节点的两个子树都访问完后，这个节点就是它所有待查询后代的 LCA。

```typescript
/**
 * Tarjan 离线 LCA 算法
 *
 * 思路：DFS + 并查集
 * 1. 标记节点为"正在访问"
 * 2. 递归访问左右子树
 * 3. 访问完子树后，用并查集合并子树到当前节点
 * 4. 如果 p 和 q 都被访问过了，它们的 LCA 就是
 *    它们所在并查集的根节点
 */
class TarjanLCA {
  private parent: Map<TreeNode, TreeNode>;
  private rank: Map<TreeNode, number>;
  private visited: Set<TreeNode>;
  private queries: Map<TreeNode, TreeNode[]>; // node -> 等待回答的查询节点列表
  private answers: Map<string, TreeNode | null>;

  constructor() {
    this.parent = new Map();
    this.rank = new Map();
    this.visited = new Set();
    this.queries = new Map();
    this.answers = new Map();
  }

  // 并查集 Find（带路径压缩）
  find(x: TreeNode): TreeNode {
    const p = this.parent.get(x);
    if (!p || p === x) return x;
    const root = this.find(p);
    this.parent.set(x, root);
    return root;
  }

  // 并查集 Union（按秩合并）
  union(x: TreeNode, y: TreeNode) {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return;

    const rankX = this.rank.get(rx) ?? 0;
    const rankY = this.rank.get(ry) ?? 0;

    if (rankX < rankY) {
      this.parent.set(rx, ry);
    } else if (rankX > rankY) {
      this.parent.set(ry, rx);
    } else {
      this.parent.set(ry, rx);
      this.rank.set(rx, rankX + 1);
    }
  }

  // 添加一个查询：node 和 other 的 LCA
  addQuery(node: TreeNode, other: TreeNode) {
    if (!this.queries.has(node)) {
      this.queries.set(node, []);
    }
    this.queries.get(node)!.push(other);
  }

  // Tarjan DFS
  dfs(node: TreeNode) {
    if (!node) return;

    // 初始化自己为独立集合
    this.parent.set(node, node);
    this.rank.set(node, 0);

    // 递归左子树
    this.dfs(node.left);
    // 递归右子树
    this.dfs(node.right);

    // 左右子树都访问完了，把左右子树合并到当前节点
    if (node.left) this.union(node.left, node);
    if (node.right) this.union(node.right, node);

    // 标记为已访问
    this.visited.add(node);

    // 回答与这个节点相关的所有查询
    const others = this.queries.get(node) ?? [];
    for (const other of others) {
      if (this.visited.has(other)) {
        const key = this.queryKey(node, other);
        this.answers.set(key, this.find(other));
      }
    }
  }

  queryKey(a: TreeNode, b: TreeNode): string {
    // 保证 a <= b 的顺序，这样 query(a, b) 和 query(b, a) 结果一样
    const [x, y] = a.val < b.val ? [a, b] : [b, a];
    return `${x.val}-${y.val}`;
  }

  // 查询两个节点的 LCA
  query(a: TreeNode, b: TreeNode): TreeNode | null {
    const key = this.queryKey(a, b);
    return this.answers.get(key) ?? null;
  }
}

// 使用示例
function lcaTarjan(
  root: TreeNode,
  queries: [TreeNode, TreeNode][]
): (TreeNode | null)[] {
  const tarjan = new TarjanLCA();

  for (const [a, b] of queries) {
    tarjan.addQuery(a, b);
    tarjan.addQuery(b, a); // 双向添加
  }

  tarjan.dfs(root);

  return queries.map(([a, b]) => tarjan.query(a, b));
}
```

**Tarjan 算法的核心思想**：

1. 遍历到一个节点时，初始化它为独立的集合
2. 遍历完子树后，把子树的根合并到当前节点（Union）
3. 当一个节点被完全访问后，它所在集合的根就是所有以它为 LCA 的查询的答案

为什么能 work？有点反直觉——不是先找 LCA 再合并，而是**先合并，再回答**。关键是并查集合并的方向：**始终把子树合并到父节点**。这样当两个节点都被标记为已访问时，它们的并查集根就是它们的最近公共祖先。

## 代码实现

### TypeScript（递归法）

```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val ?? 0;
    this.left = left ?? null;
    this.right = right ?? null;
  }
}

/**
 * LCA 递归解法
 * 时间 O(n)，空间 O(h)，h 为树高
 *
 * 为什么空间是 O(h)：递归调用栈的深度等于树的高度。
 * 最坏情况（链表状树）空间 O(n)，平衡树空间 O(log n)。
 */
function lca(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode
): TreeNode | null {
  if (!root || root === p || root === q) return root;

  const left = lca(root.left, p, q);
  const right = lca(root.right, p, q);

  if (left && right) return root; // p、q 在两侧
  return left ?? right; // 只有一个非空
}

// 测试
const root = new TreeNode(1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3, null, new TreeNode(6, new TreeNode(7)))
);

console.log(lca(root, root.left.left!, root.left.right!).val); // 2
console.log(lca(root, root.left!, root.right!).val); // 1
console.log(lca(root, root.left.right!, root.right.left!.left!).val); // 1
```

### Python

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def lca_recursive(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
    """递归法求 LCA
    时间 O(n)，空间 O(h)
    """
    if not root or root is p or root is q:
        return root

    left = lca_recursive(root.left, p, q)
    right = lca_recursive(root.right, p, q)

    if left and right:
        return root  # 左右各找到一个，LCA 是当前节点
    return left if left else right


def lca_with_parent(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
    """父节点哈希表法"""
    parent = {root: None}

    # BFS/DFS 建立父子关系
    stack = [root]
    while p not in parent or q not in parent:
        node = stack.pop()
        if node.left:
            parent[node.left] = node
            stack.append(node.left)
        if node.right:
            parent[node.right] = node
            stack.append(node.right)

    # 把 p 到根的路径收集到集合
    ancestors = set()
    while p:
        ancestors.add(p)
        p = parent[p]

    # 从 q 往上找第一个在集合里的
    while q not in ancestors:
        q = parent[q]
    return q
```

### Go

```go
package lca

// TreeNode 二叉树节点
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

/**
 * 递归法求 LCA
 * 时间 O(n)，空间 O(h)
 */
func LCA(root, p, q *TreeNode) *TreeNode {
    if root == nil || root == p || root == q {
        return root
    }

    left := LCA(root.Left, p, q)
    right := LCA(root.Right, p, q)

    if left != nil && right != nil {
        return root // p、q 在两侧
    }

    if left != nil {
        return left
    }
    return right
}

/**
 * 父节点哈希表法
 */
func LCAWithParent(root, p, q *TreeNode) *TreeNode {
    parent := map[*TreeNode]*TreeNode{root: nil}

    // BFS 建立父子关系
    queue := []*TreeNode{root}
    for len(queue) > 0 && (parent[p] == nil || parent[q] == nil) {
        node := queue[0]
        queue = queue[1:]
        if node.Left != nil {
            parent[node.Left] = node
            queue = append(queue, node.Left)
        }
        if node.Right != nil {
            parent[node.Right] = node
            queue = append(queue, node.Right)
        }
    }

    // p 的所有祖先放进集合
    ancestors := make(map[*TreeNode]bool)
    for p != nil {
        ancestors[p] = true
        p = parent[p]
    }

    // 从 q 往上找
    for q != nil {
        if ancestors[q] {
            return q
        }
        q = parent[q]
    }
    return nil
}
```

### Java

```java
public class LCA {

    public static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    /**
     * 递归法 —— 最简洁的写法
     * 时间 O(n)，空间 O(h)
     */
    public static TreeNode lca(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) {
            return root;
        }

        TreeNode left = lca(root.left, p, q);
        TreeNode right = lca(root.right, p, q);

        if (left != null && right != null) {
            return root; // 两侧都找到了
        }
        return left != null ? left : right;
    }

    /**
     * 父节点哈希表法
     */
    public static TreeNode lcaWithParent(TreeNode root, TreeNode p, TreeNode q) {
        Map<TreeNode, TreeNode> parent = new HashMap<>();
        parent.put(root, null);

        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.push(root);

        // BFS/DFS 建立父子关系
        while (!parent.containsKey(p) || !parent.containsKey(q)) {
            TreeNode node = stack.pop();
            if (node.left != null) {
                parent.put(node.left, node);
                stack.push(node.left);
            }
            if (node.right != null) {
                parent.put(node.right, node);
                stack.push(node.right);
            }
        }

        Set<TreeNode> ancestors = new HashSet<>();
        while (p != null) {
            ancestors.add(p);
            p = parent.get(p);
        }

        while (q != null) {
            if (ancestors.contains(q)) {
                return q;
            }
            q = parent.get(q);
        }
        return null;
    }
}
```

## 复杂度分析

| 解法 | 时间复杂度 | 空间复杂度 | 适用场景 |
| ---- | ---------- | ---------- | -------- |
| 暴力枚举（路径） | O(n) | O(n) | 理解用，不推荐 |
| 递归法 | O(n) | O(h) | **面试首选** |
| 父节点哈希表 | O(n) | O(n) | 简单直接 |
| Tarjan 离线 | O(n + q) | O(n) | 多次查询时最优 |

> **h = 树高**。平衡树 O(log n)，最差 O(n)（链表状树）。

## 面试题精选

| 题号 | 题目 | 解法 | 难度 |
| ---- | ---- | ---- | ---- |
| 236 | 二叉树的最近公共祖先 | 递归法 | 中等 |
| 235 | 二叉搜索树的最近公共祖先 | 利用 BST 性质，O(log n) | 简单 |
| 1650 | 删除得到最小树高度的子树 | 父节点哈希表 | 中等 |
| 1123 | 最深叶节点的最近公共祖先 | 递归（变体） | 中等 |
| 1676 | 二叉树的最近公共祖先 IV | 递归多节点版本 | 中等 |

### 变体：二叉搜索树（BST）的 LCA

BST 有一个额外的性质：**左子树节点 < 根 < 右子树节点**。所以可以直接利用值的大小关系 O(log n) 搞定。

```typescript
/**
 * BST 的 LCA —— 利用 BST 的性质
 * 时间 O(h)，空间 O(1)（不含递归栈）
 */
function lcaBST(root: TreeNode, p: TreeNode, q: TreeNode): TreeNode {
  const minVal = Math.min(p.val, q.val);
  const maxVal = Math.max(p.val, q.val);

  while (root) {
    if (root.val < minVal) {
      // p、q 都在右子树
      root = root.right;
    } else if (root.val > maxVal) {
      // p、q 都在左子树
      root = root.left;
    } else {
      // minVal <= root.val <= maxVal，说明 root 在 p、q 之间，就是 LCA
      return root;
    }
  }
  return root;
}
```

## 实际应用场景

1. **权限系统 / 组织架构查询**：找两个用户的最近公共主管
2. **Git 版本控制**：找两个 commit 的最近公共祖先（合并分支时会用到）
3. **HTML DOM 树**：找两个元素的最近公共父元素（前端框架里很常见）
4. **XML/JSON 层级结构**：找两个节点的最近公共祖先节点
5. **游戏技能树**：天赋树中两个已点亮天赋的最近公共先祖天赋

## 小结

LCA 问题的核心就两种思路：

**第一种：递归（面试必会）**

```
对于节点 root：
- 如果 root 是 p 或 q → 返回 root
- 如果 p、q 在 root 的左右两侧 → root 就是 LCA
- 否则 LCA 在左子树或右子树里
```

**第二种：记录父节点 + 哈希集合**

```
1. 建一个 parent Map
2. 把 p 到根的路径都放入集合
3. q 往上走，第一个在集合里出现的就是 LCA
```

Tarjan 算法属于进阶内容，当你有**大量 LCA 查询**需要一次性回答时才值得用。面试里递归法能 cover 99% 的场景，代码又短又优雅，背就完事了 🎯。

记住递归法里那个巧妙的返回值设计：**左右都有值说明在两侧，否则返回非空的那个**——这是整个算法的灵魂。
