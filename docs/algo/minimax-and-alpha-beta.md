---
title: Minimax 算法与 Alpha-Beta 剪枝
description: Minimax 算法与 Alpha-Beta 剪枝
date: 2026-08-08 10:37:36
categories:
  - Algorithm
tags:
  - minimax
  - alpha-beta-pruning
  - game-theory
sidebarSort: 72
---

# Minimax 算法与 Alpha-Beta 剪枝 🧩

你有没有下过象棋？当你走一步棋的时候，你是不是会想："我走这一步，对方会怎么应对？我再怎么应对？"——脑子里其实已经在模拟整盘棋的走向了。

恭喜你，你已经在用 **Minimax 算法**的思维了！

但人的脑子只能想几步，程序却要算完整盘棋的每一种可能。问题来了——象棋的平均分支因子大约是 35，也就是说每步有 35 种走法。算到 4 层深度就有 35⁴ ≈ 150 万个节点，8 层就超过 10 亿个节点了。直接暴力搜索会把你的 CPU 烧干。

**Alpha-Beta 剪枝** 就是来解决这个问题的：不需要搜索所有节点，在搜索过程中就能把"明显没用"的分支直接剪掉，仍然保证找到最优解。今天我们就来把这个算法彻底搞懂 ✨

## 问题引入：为什么需要 Minimax？

先从一个最简单的游戏开始 —— **井字棋（Tic-Tac-Toe）**。

```
 棋盘状态：

   X | O | _
   ---------
   _ | X | _
   ---------
   _ | _ | O

 轮到 O 走。现在轮到 O（玩家）走，要怎么走才能不输？
```

如果你是个新手，你可能随便走一步。但如果想"下得聪明"，你会想：

- 我走这步之后，对方会怎么走？
- 对方走那步之后，我还能不能赢？

这个"往前看 N 步，评估最优"的思路，就是 Minimax 的核心。

### 什么是极小极大（Minimax）？

**核心思想**：把棋局看成两个人轮流做决策的过程。

- **MAX 玩家**（比如你）：选择让**自己得分最高**的走法
- **MIN 玩家**（比如对手）：选择让**你得分最低**的走法（就是让自己最有利）

Minimax 就是模拟这两个人对弈：MAX 选最大，MIN 选最小，一层一层往下递归，最终得到每个局面的"分数"。

```
        [MAX 节点]  想要分数最大化
           /  |  \
         10   5    8    ← MAX 会选 10
         /    |     \
    [MIN 节点] [MIN] [MIN]
       /|\     |    /|\
     10 5 8   5   5 8 2   ← MIN 会选最小的（让 MAX 难受）
```

看这个图：MAX 在根节点，他有三个分支，分数分别是 10、5、8。MIN 节点在下面，MIN 的目标是让 MAX 得分最低（MIN 得分最高），所以 MIN 会选最小的值。

### 零和博弈

井字棋、象棋、围棋都是**零和博弈**——你的收益等于对手的损失，双方利益完全对立。如果我赢了 +1，你就是输了 -1，加起来是 0。这就是"极小极大"名字的由来：MAX 找最大，MIN 找最小，零和。

## 原理拆解

### Minimax 的递归框架

Minimax 的实现就是一个递归函数，每层递归代表一个玩家的回合：

```
function minimax(node, depth, isMaximizing):
    if node 是叶子节点 or depth == 0:
        return 评估函数(node)

    if isMaximizing:  # MAX 的回合，找最大值
        best = -∞
        for each child of node:
            value = minimax(child, depth - 1, false)
            best = max(best, value)
        return best
    else:             # MIN 的回合，找最小值
        best = +∞
        for each child of node:
            value = minimax(child, depth - 1, true)
            best = min(best, value)
        return best
```

简单吧？MAX 层返回子树中的最大值，MIN 层返回子树中的最小值。

### Alpha-Beta 剪枝：剪掉"没用"的分支

Minimax 虽好，但搜索量太大。Alpha-Beta 就是在 Minimax 的基础上，**在递归过程中记录两个值**：

- **Alpha（α）**：MAX 目前能保证的**最低**分数（初始值 -∞）
- **Beta（β）**：MIN 目前能保证的**最高**分数（初始值 +∞）

**剪枝规则**：

1. 在 **MAX 节点**，如果发现一个分支的评估值 ≥ β，说明 MIN 在更浅的层次就能确保一个更低的分数，那这个 MAX 分支就不需要继续搜索了（**β 剪枝**）
2. 在 **MIN 节点**，如果发现一个分支的评估值 ≤ α，说明 MAX 在更浅的层次就能确保一个更高的分数，那这个 MIN 分支就不需要继续搜索了（**α 剪枝**）

```
        [MAX α=-∞ β=+∞]
           /     \
        5         [MIN α=5 β=+∞]  ← 这个 MIN 节点只需要找 ≤ 5 的值
                  /    \
               4       3         ← 搜到 3，发现 3 < α(5)，直接剪掉剩下分支！
```

### 图解 Alpha-Beta 的剪枝过程

```
深度 4 的极小极大搜索树（简化）

                    MAX (根)
                 /    |    \
               10     5     8      ← MAX 选 max，发现 10 已经很大
              /  \    |    /  \
           MIN   ... ...  MIN   ... ← MIN 选 min，MIN 不希望 MAX 赢
           /\
        10  5

如果 MIN 节点左孩子返回 10（对 MIN 不利），MIN 就会选更小的 5。
但如果 MIN 的某个孩子已经 ≤ MAX 层已知的 α，剩下孩子就不用看了——MIN 肯定会选更小的那个。

这就是 Alpha-Beta 剪枝的直觉：已经找到一个足够好的/足够坏的值，后面的搜索可以提前终止。
```

### 剪枝效率

最理想情况下，Alpha-Beta 可以把搜索量从 O(b^d) 降到 O(b^{d/2})，其中 b 是分支因子，d 是搜索深度。这意味着原来只能搜 8 层的，现在能搜 16 层——对于博弈树来说这是巨大的提升。

## 代码实现

### TypeScript — 完整的井字棋 AI

```typescript
/**
 * Minimax + Alpha-Beta 剪枝 —— TypeScript 实现
 * 以井字棋（Tic-Tac-Toe）为例，实现一个无法战胜的 AI
 */

// 棋盘大小
const BOARD_SIZE = 3;
type Player = 'X' | 'O' | null; // null 表示空位
type Board = Player[];

// 创建空棋盘
function createBoard(): Board {
  return Array(BOARD_SIZE * BOARD_SIZE).fill(null);
}

// 打印棋盘（方便调试）
function printBoard(board: Board): void {
  for (let row = 0; row < BOARD_SIZE; row++) {
    const line = board
      .slice(row * BOARD_SIZE, row * BOARD_SIZE + BOARD_SIZE)
      .map((p) => (p === null ? '.' : p))
      .join(' | ');
    console.log(line);
    if (row < BOARD_SIZE - 1) console.log('---------');
  }
}

/**
 * 检查获胜者
 * @returns 'X'、'O' 或 null（无人获胜）
 */
function checkWinner(board: Board): Player {
  const lines = [
    // 行
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // 列
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // 对角线
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

/**
 * 获取所有合法走法（空位索引列表）
 */
function getAvailableMoves(board: Board): number[] {
  return board
    .map((cell, idx) => (cell === null ? idx : -1))
    .filter((idx) => idx !== -1);
}

/**
 * 评估函数 —— 叶子节点时调用
 * 返回分数：X 赢 = +10，O 赢 = -10，平局或未结束 = 0
 * 深度越浅的胜利分数越高（更快赢比慢赢更好）
 */
function evaluate(board: Board, depth: number): number {
  const winner = checkWinner(board);
  if (winner === 'X') return 10 - depth; // X（MAX）赢了，越浅越好
  if (winner === 'O') return depth - 10; // O（MIN）赢了，越浅越糟
  return 0; // 平局或未结束
}

/**
 * Minimax + Alpha-Beta 剪枝
 *
 * @param board 当前棋盘
 * @param depth 搜索深度（越大越强，但越慢）
 * @param alpha MAX 能保证的最低分数
 * @param beta  MIN 能保证的最高分数
 * @param isMaximize 当前是否是 MAX (X) 的回合
 * @returns 最佳分数
 */
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximize: boolean
): number {
  // 叶子节点：有人赢了或者棋盘满了
  const winner = checkWinner(board);
  if (winner !== null) return evaluate(board, depth);

  const moves = getAvailableMoves(board);
  if (moves.length === 0) return 0; // 平局

  // 如果达到搜索深度，用启发式评估（这里直接返回 0）
  if (depth === 0) return evaluate(board, depth);

  if (isMaximize) {
    // MAX 节点 —— X 的回合，找最大值
    let maxEval = -Infinity;
    let localAlpha = alpha;

    for (const move of moves) {
      board[move] = 'X';
      const evalScore = minimax(board, depth - 1, localAlpha, beta, false);
      board[move] = null; // 回溯

      maxEval = Math.max(maxEval, evalScore);
      localAlpha = Math.max(localAlpha, evalScore);

      // ⭐ Alpha-Beta 剪枝：如果当前最好的已经 >= beta，说明 MIN 不会让我们走到这里
      if (beta <= localAlpha) {
        break; // β 剪枝
      }
    }
    return maxEval;
  } else {
    // MIN 节点 —— O 的回合，找最小值
    let minEval = Infinity;
    let localBeta = beta;

    for (const move of moves) {
      board[move] = 'O';
      const evalScore = minimax(board, depth - 1, alpha, localBeta, true);
      board[move] = null; // 回溯

      minEval = Math.min(minEval, evalScore);
      localBeta = Math.min(localBeta, evalScore);

      // ⭐ Alpha-Beta 剪枝：如果当前最好的（对 MIN 来说最差）已经 <= alpha，剪掉
      if (localBeta <= alpha) {
        break; // α 剪枝
      }
    }
    return minEval;
  }
}

/**
 * 找到最佳走法（供 AI 调用）
 * @param board 当前棋盘
 * @returns 最佳位置索引
 */
function findBestMove(board: Board): number {
  const moves = getAvailableMoves(board);
  let bestScore = Infinity; // AI 是 MIN 玩家
  let bestMove = moves[0];

  for (const move of moves) {
    board[move] = 'O'; // AI 扮演 MIN（O）
    const score = minimax(board, 9, -Infinity, Infinity, true);
    board[move] = null;

    if (score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// ============ 使用示例 ============

const board = createBoard();
console.log('初始棋盘：');
printBoard(board);

board[0] = 'X'; // 玩家先手走左上角
board[4] = 'O'; // AI 走中心

console.log('\n玩家 X 和 AI O 走了几步后：');
printBoard(board);

const aiMove = findBestMove(board);
console.log(`\nAI 选择了位置 ${aiMove}`);
board[aiMove] = 'O';
printBoard(board);
```

### Python — 简化版 Minimax（适合理解概念）

```python
import math


def minimax(board, depth, is_maximizing, alpha=-math.inf, beta=math.inf):
    """
    Minimax + Alpha-Beta 剪枝 —— Python 简化版

    board: list，当前棋盘状态，None=空，'X'=MAX，'O'=MIN
    depth: 搜索深度
    is_maximizing: True = MAX('X')的回合，False = MIN('O')的回合
    alpha: MAX 能保证的最低分数（初始 -∞）
    beta:  MIN 能保证的最高分数（初始 +∞）
    """

    # 叶子节点判断（这里简化了，假设 board 传入时就是终局或空）
    winner = check_winner(board)
    if winner == 'X':
        return 10 - depth  # X 赢，越浅越好
    if winner == 'O':
        return depth - 10  # O 赢，越浅越好
    if None not in board:
        return 0  # 平局

    if is_maximizing:
        # MAX 节点：找最大值
        max_eval = -math.inf
        for i, cell in enumerate(board):
            if cell is None:
                board[i] = 'X'
                eval_score = minimax(board, depth - 1, False, alpha, beta)
                board[i] = None
                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)
                # ⭐ β 剪枝
                if beta <= alpha:
                    break
        return max_eval
    else:
        # MIN 节点：找最小值
        min_eval = math.inf
        for i, cell in enumerate(board):
            if cell is None:
                board[i] = 'O'
                eval_score = minimax(board, depth - 1, True, alpha, beta)
                board[i] = None
                min_eval = min(min_eval, eval_score)
                beta = min(beta, eval_score)
                # ⭐ α 剪枝
                if beta <= alpha:
                    break
        return min_eval


def check_winner(board):
    """检查获胜者"""
    lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # 行
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # 列
        [0, 4, 8], [2, 4, 6],              # 对角线
    ]
    for a, b, c in lines:
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]
    return None


def find_best_move(board):
    """AI 找最优走法"""
    best_score = math.inf
    best_move = None

    for i, cell in enumerate(board):
        if cell is None:
            board[i] = 'O'
            score = minimax(board, 9, True)  # 深度9 = 搜完整棵树
            board[i] = None
            if score < best_score:
                best_score = score
                best_move = i

    return best_move


# 使用示例
if __name__ == "__main__":
    board = [None] * 9
    board[0] = 'X'  # 玩家走左上角
    board[4] = 'O'  # AI 走中心

    print("当前棋盘：")
    for row in range(3):
        print(" | ".join(board[row * 3 : row * 3 + 3]))
        if row < 2:
            print("-" * 9)

    move = find_best_move(board)
    print(f"\nAI 选择位置: {move}")
    board[move] = 'O'
```

## 应用场景

### 1. 棋类 AI（最经典）

从井字棋、国际象棋到围棋，Minimax + Alpha-Beta 都是核心算法。IBM 的 Deep Blue 击败卡斯帕罗夫用的就是 Alpha-Beta 搜索 + 大量人工特征。AlphaGo 则更进一步，用蒙特卡洛树搜索（MCTS）结合深度学习，但底层思想仍然是 Minimax 的扩展。

### 2. 回合制游戏的对战 AI

不只是棋类，"文明"系列、"王者荣耀"、"炉石传说"——只要是**回合制**、**零和**的游戏，都可以上 Minimax。实际工程中往往会在叶子节点用一个神经网络（棋盘评估）替代精确的终局搜索，大幅提升中盘实力。

### 3. 资源博弈与竞拍策略

两人参与的零和博弈场景，比如竞拍时的最优出价策略，也可以建模成 Minimax 树来求解（虽然实际中往往用更复杂的博弈论模型）。

### 4. 组合博弈论（Game Theory）

Minimax 是组合博弈论的基础。Sprague-Grundy 定理可以求出某些公平游戏的必胜局面，但 Minimax 仍然是面试和竞赛中最常考的博弈算法。

## 复杂度分析

| 指标 | 标准 Minimax | Alpha-Beta 剪枝（最优顺序） |
| ---- | ------------ | -------------------------- |
| 时间复杂度 | O(b^d) | O(b^{d/2}) |
| 空间复杂度 | O(d)（递归栈） | O(d)（递归栈） |

- **b** = 分支因子（每个节点平均有多少子节点）
- **d** = 搜索深度

Alpha-Beta 的关键：**搜索顺序越优，剪枝越多**。如果每次都先搜到最优分支，剪枝效率能达到理论最优的 O(b^{d/2})；如果运气差先搜到最差分支，可能剪不了多少，仍然是 O(b^d)。

所以实际应用中，往往会配合**置换表**（Transposition Table，用 hash 表记录已评估过的局面）和**走法排序**（优先搜看起来更好的走法）来提高剪枝效率。

## 扩展：为什么不直接用强化学习？

你可能会想：既然 AlphaGo 用深度学习就能下过人类，为什么还要学 Minimax？

两个原因：

1. **可解释性**：Minimax 每一步都能告诉你"为什么选这个"，因为它是显式搜索。强化学习模型是个黑盒，你不知道它为什么走这一步。
2. **数据量不够的场景**：训练一个 RL 模型需要海量数据，但 Minimax 不需要任何训练数据——只要你知道游戏规则，就能立即运行。

Minimax + Alpha-Beta 是**模型无关**的，任何规则明确的零和博弈游戏都能用。这也是面试喜欢考它的原因——它考察的是你对递归、搜索和博弈思维的理解，而不是某个特定框架的 API。

## 小结

Minimax + Alpha-Beta 剪枝是博弈论算法的"Hello World"：

- **Minimax** 的核心：**MAX 层选最大，MIN 层选最小**，递归评估每个局面的分数
- **Alpha-Beta** 的核心：**在搜索过程中记录 α 和 β**，如果一个分支不可能比已知的更好，就直接跳过
- 两者结合：**保证找到最优解的同时，大幅减少搜索量**

```
最终公式：
  Minimax  =  递归搜索  +  零和博弈假设
  Alpha-Beta =  Minimax  +  剪枝优化
```

学会了这两个算法，那些"AI 怎么下棋"的问题在你眼里就不再是黑科技，而是一棵被巧妙修剪过的搜索树而已 🎉
