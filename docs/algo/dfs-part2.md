
## 代码实战

### 实战一：二叉树的前中后序遍历（递归 + 这是最经典的 DFS 入门）

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

// 前序遍历：根 → 左 → 右
function preorder(root: TreeNode | null): number[] {
  const result: number[] = [];
  function dfs(node: TreeNode | null) {
    if (!node) return;
    result.push(node.val);   // 先访问根
    dfs(node.left);           // 再左子树
    dfs(node.right);          // 最后右子树
  }
  dfs(root);
  return result;
}

// 中序遍历：左 → 根 → 右（BST 中序就是有序的！）
function inorder(root: TreeNode | null): number[] {
  const result: number[] = [];
  function dfs(node: TreeNode | null) {
    if (!node) return;
    dfs(node.left);
    result.push(node.val);
    dfs(node.right);
  }
  dfs(root);
  return result;
}

// 后序遍历：左 → 右 → 根（常用于"先处理子树再处理父节点"的场景）
function postorder(root: TreeNode | null): number[] {
  const result: number[] = [];
  function dfs(node: TreeNode | null) {
    if (!node) return;
    dfs(node.left);
    dfs(node.right);
    result.push(node.val);
  }
  dfs(root);
  return result;
}
```

> 💡 **小技巧**：三种遍历的递归代码几乎一模一样，区别只是 `result.push` 的位置。记住口诀：前序在最前，中序在中间，后序在最后。

### 实战二：图的 DFS 遍历（连通分量计数）

面试中经常问："给你一个图，判断有多少个连通分量"。DFS 一行搞定。

```typescript
function countComponents(n: number, edges: [number, number][]): number {
  // 1. 建邻接表
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u); // 无向图
  }

  // 2. DFS 遍历
  const visited = new Set<number>();
  let count = 0;

  function dfs(node: number) {
    visited.add(node);
    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }

  // 3. 遍历所有节点，每次从一个未访问的节点开始就是一个新连通分量
  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      dfs(i);
      count++;
    }
  }

  return count;
}

// 测试
const edges: [number, number][] = [[0, 1], [1, 2], [3, 4]];
console.log(countComponents(5, edges)); // 2（0-1-2 一组，3-4 一组）
```
