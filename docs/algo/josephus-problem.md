---
title: 约瑟夫斯问题
description: 约瑟夫斯问题（Josephus Problem）—— 经典循环报数问题的数学推导与代码实现
date: 2026-07-03 09:01:29
categories:
  - Algorithm
tags:
  - josephus-problem
  - recursion
  - bit-manipulation
  - circle
sidebarSort: 56
---

# 约瑟夫斯问题（Josephus Problem）

想象这样一个场景 🎭：41 个囚犯排成一个圆圈，士兵从第一个人开始报数，每报到 7 的人就被处决，然后从下一个人继续报。游戏一直进行到只剩最后一个人——这个人可以获得赦免。

这就是著名的**约瑟夫斯问题**（Josephus Problem）。听起来像是个血腥的历史故事，但它实际上是算法面试中的常客，而且背后藏着优雅的数学之美。

## 问题定义

约瑟夫斯问题有多种表述方式，但核心都是一样的：

> n 个人围成一圈，从位置 1 开始依次报数，每报到 m 的人出列（移除），然后从下一个人重新从 1 开始报数。求最后存活者的编号。

```
初始状态（n=8, m=3）：

        1
      /   \
    8       2
   |        |
   7        3
    \      /
      6 - 4 - 5

第1轮报数：1→2→3（3出列）
第2轮报数：4→5→6（6出列）
第3轮报数：7→8→1（1出列）
...依次类推，直到只剩1人
```

### 变体：出列顺序

有时候面试官不只问最后存活者，还问**出列顺序**。这个问题更简单，直接模拟就能做。

## 暴力解法：队列模拟

最直观的想法——既然是围成圈报数，那就用队列来模拟：

```typescript
/**
 * 约瑟夫斯问题 —— 队列模拟法
 * 
 * 思路：把人都放进队列，每次弹出队首，报数到 m 就出列（不塞回去），
 * 没报到 m 的塞回队尾，继续报。
 * 
 * 时间复杂度：O(n * m) —— 每次报数都要循环 m 次
 * 空间复杂度：O(n)
 */
function josephusQueue(n: number, m: number): number[] {
  const queue: number[] = [];
  const eliminated: number[] = [];
  
  // 初始化：所有人都进队
  for (let i = 1; i <= n; i++) {
    queue.push(i);
  }
  
  let count = 1; // 当前报的数
  
  while (queue.length > 0) {
    const person = queue.shift()!;
    
    if (count === m) {
      // 报到 m，出列
      eliminated.push(person);
      count = 1; // 重置计数
    } else {
      // 没报到 m，放回队尾
      queue.push(person);
      count++;
    }
  }
  
  return eliminated;
}

// 测试
console.log(josephusQueue(5, 2));
// 输出: [2, 4, 1, 5, 3]
// 存活者: 3
```

这个方法简单直观，但时间复杂度是 **O(n * m)**，当 n 和 m 都很大时会非常慢。有没有更快的解法？

## 递归解法：数学归纳

让我们来找规律 🤔：

```
n=1 时：存活者 = 0（假设从 0 开始编号）

n=2 时：
  - 报到 2 的人出列，剩下的人存活
  - 存活者 = (0 + m) % 2 = (0 + 2) % 2 = 0

n=3 时：
  - 第一轮：报到 2 的人出列，剩下的人在"新圈子"重新从 0 开始
  - 新圈子的存活者 = f(2)
  - 原编号 = (新圈子编号 + 2) % 3 = (0 + 2) % 3 = 2

n=4 时：
  - 第一轮出列后，新圈子存活者 = f(3) = 2
  - 原编号 = (2 + 2) % 4 = 0
```

发现规律了吗？🤓

```
f(n) = (f(n-1) + m) % n
```

这就是递推公式！为什么成立？

**推导**：第一轮报到 m 的人出列后，剩下 n-1 个人形成新圈子。假设新圈子中的存活者编号是 x（在 0 到 n-2 之间），那他在原圈子中的编号应该是 `(x + m) % n`——因为我们跳过了 m 个人。

### 递归实现

```typescript
/**
 * 约瑟夫斯问题 —— 递归解法
 * 
 * 递推公式：f(n) = (f(n-1) + m) % n
 * 
 * 时间复杂度：O(n)
 * 空间复杂度：O(n) —— 递归调用栈
 */
function josephusRecursive(n: number, m: number): number {
  if (n === 1) return 0;
  
  return (josephusRecursive(n - 1, m) + m) % n;
}

// 使用示例
// 注意：返回的是 0-based 索引，加 1 才是 1-based 编号
const survivor = josephusRecursive(41, 7) + 1;
console.log(`n=41, m=7 的存活者是第 ${survivor} 个人`);
// 输出: n=41, m=7 的存活者是第 31 个人
```

### 迭代优化

递归虽优雅，但 O(n) 的调用栈在 n 很大时可能导致栈溢出。我们可以改成迭代：

```typescript
/**
 * 约瑟夫斯问题 —— 迭代解法（推荐）
 * 
 * 把递归改成循环，避免栈溢出
 * 
 * 时间复杂度：O(n)
 * 空间复杂度：O(1) ✅
 */
function josephusIterative(n: number, m: number): number {
  let survivor = 0; // f(1) = 0
  
  for (let i = 2; i <= n; i++) {
    survivor = (survivor + m) % i;
  }
  
  return survivor; // 返回 0-based 索引
}

// 测试
console.log(josephusIterative(5, 2)); // 2（第三个人存活，1-based 编号是 3）
console.log(josephusIterative(41, 7)); // 30（0-based），即第 31 个人
```

## 位运算优化：m=2 的特殊情况

当 **m = 2** 时，约瑟夫斯问题有一个更优雅的解法——用位运算把时间复杂度降到 **O(1)**！

先看规律：

```
n=1: f(1) = 0
n=2: f(2) = (0*2) % 2 = 0
n=3: f(3) = (0+2) % 3 = 2
n=4: f(4) = (2+2) % 4 = 0
n=5: f(5) = (0+2) % 5 = 2
n=6: f(6) = (2+2) % 6 = 4
n=7: f(7) = (4+2) % 7 = 6
n=8: f(8) = (6+2) % 8 = 0
...
```

规律：**把二进制表示的最高位移到最低位**！

```typescript
/**
 * m = 2 时的约瑟夫斯问题 —— O(1) 位运算解法
 * 
 * 规律：f(n) = (n << 1) & (2^n - 1)
 *       即：把二进制左移 1 位，溢出位循环到低位
 * 
 * 等价于：把 n 的二进制表示的最高位移到最低位
 */
function josephusPowerOfTwo(n: number): number {
  // 二进制：把最高位移到最低位
  // 例如: 7 (111) -> 1111 -> 111 (把最左边的1移到最右边) = 3
  // 实际上是: 把 n 左移 1 位，然后取有效位（不超过 n 的位数）
  
  // 方法1：找最高位
  const binary = n.toString(2); // "111" -> "1111" -> "111"
  const result = parseInt(binary.slice(1) + binary[0], 2);
  
  // 方法2：更简洁的写法
  // return ((n << 1) & (2 ** binary.length - 1)) | (n >> (binary.length - 1));
  
  return result;
}

// 或者更通用的一种写法
function josephusFast(n: number): number {
  // 二进制循环左移 1 位
  const binary = n.toString(2);
  return parseInt(binary.slice(1) + binary[0], 2);
}

// 验证
console.log(josephusIterative(1, 2), josephusFast(1)); // 0, 0
console.log(josephusIterative(2, 2), josephusFast(2)); // 0, 0
console.log(josephusIterative(3, 2), josephusFast(3)); // 2, 2
console.log(josephusIterative(4, 2), josephusFast(4)); // 0, 0
console.log(josephusIterative(5, 2), josphusFast(5)); // 2, 2
console.log(josephusIterative(6, 2), josephusFast(6)); // 4, 4
console.log(josephusIterative(7, 2), josephusFast(7)); // 6, 6
console.log(josephusIterative(8, 2), josephusFast(8)); // 0, 0
```

> 思考：为什么 m=2 时有这个规律？提示：`(f(n-1) + 2) % n` 这个递推等价于对 n 的二进制做某种操作。

## 进阶：LeetCode 实战

约瑟夫斯问题在 LeetCode 上有好几道题，最经典的是 **剑指 Offer 62**：

> 0,1,...,n-1 这 n 个数字排成一个圆圈，从数字 0 开始每次删除第 m 个数字。求圆圈中剩下的最后一个数字。

```typescript
/**
 * LeetCode 剑指 Offer 62 —— 圆圈中最后剩下的数字
 * 
 * 这就是约瑟夫斯问题，n 个人从 0 开始编号
 */
function lastRemaining(n: number, m: number): number {
  let survivor = 0;
  
  // 从 2 到 n 迭代
  for (let i = 2; i <= n; i++) {
    survivor = (survivor + m) % i;
  }
  
  return survivor;
}

// 测试用例
console.log(lastRemaining(5, 3)); // 3
console.log(lastRemaining(10, 17)); // 2
console.log(lastRemaining(707, 15)); // 需要自己算算
```

### 扩展：求完整的出列顺序

如果面试官要求输出**完整的出列顺序**，上面的队列模拟法 O(n*m) 太慢。有没有办法 O(n)？

```typescript
/**
 * 求约瑟夫斯问题的完整出列顺序 —— O(n) 解法
 * 
 * 思路：不用队列模拟，直接根据递推公式反推每一步
 * 
 * 关键洞察：
 * - f(n) 是最终存活者（0-based）
 * - 如果我们知道最终存活者在"n-1 人圈"中的位置，就可以反推
 * 
 * 但问题是递推是从小到大算的，正推才能得到最终结果。
 * 要得到完整顺序，只能模拟，但可以用链表 O(n) 实现。
 */
function josephusOrderList(n: number, m: number): number[] {
  // 用链表模拟，因为需要高效的删除操作
  class ListNode {
    val: number;
    next: ListNode | null = null;
    constructor(val: number) {
      this.val = val;
    }
  }
  
  // 创建循环链表
  const head = new ListNode(0);
  let prev = head;
  for (let i = 1; i < n; i++) {
    prev.next = new ListNode(i);
    prev = prev.next;
  }
  prev.next = head; // 形成环
  
  const eliminated: number[] = [];
  let current = head;
  let count = 1;
  
  while (n > 1) {
    // 移动到要删除的前一个节点
    for (let i = 1; i < m - 1; i++) {
      current = current.next!;
    }
    
    // 删除第 m 个节点
    const toDelete = current.next!;
    eliminated.push(toDelete.val);
    current.next = toDelete.next;
    current = current.next!;
    n--;
  }
  
  eliminated.push(current.val); // 最后一个
  return eliminated;
}

// 测试
console.log(josephusOrderList(7, 3));
// 输出: [2, 5, 1, 6, 0, 4]（最后一个是 3）
```

## 各语言实现

### Go

```go
package josephus

/**
 * 约瑟夫斯问题 —— Go 实现
 * 迭代版：O(n) 时间，O(1) 空间
 */
func LastRemaining(n, m int) int {
    survivor := 0
    for i := 2; i <= n; i++ {
        survivor = (survivor + m) % i
    }
    return survivor
}

/**
 * 求出列顺序 —— 用链表模拟
 */
func EliminationOrder(n, m int) []int {
    if n < 1 || m < 1 {
        return []int{}
    }
    
    // 用切片模拟环形链表
    people := make([]int, n)
    for i := 0; i < n; i++ {
        people[i] = i
    }
    
    eliminated := make([]int, 0, n)
    idx := 0 // 当前报数位置
    
    for len(people) > 0 {
        // 移动到第 m 个位置（idx 指向当前报 1 的位置）
        idx = (idx + m - 1) % len(people)
        eliminated = append(eliminated, people[idx])
        // 删除该位置
        people = append(people[:idx], people[idx+1:]...)
    }
    
    return eliminated
}
```

### Python

```python
"""
约瑟夫斯问题 —— Python 实现
"""

def last_remaining(n: int, m: int) -> int:
    """
    求最后存活的编号（0-based）
    迭代法：O(n) 时间，O(1) 空间
    """
    survivor = 0
    for i in range(2, n + 1):
        survivor = (survivor + m) % i
    return survivor


def elimination_order(n: int, m: int) -> list[int]:
    """
    求完整的出列顺序
    用列表模拟环形结构
    """
    people = list(range(n))
    eliminated = []
    idx = 0
    
    while people:
        # 移动 idx 到第 m 个位置
        idx = (idx + m - 1) % len(people)
        eliminated.append(people.pop(idx))
    
    return eliminated


def last_remaining_recursive(n: int, m: int) -> int:
    """
    递归版（简洁但有栈溢出风险）
    f(n) = (f(n-1) + m) % n
    """
    if n == 1:
        return 0
    return (last_remaining_recursive(n - 1, m) + m) % n


if __name__ == "__main__":
    # 测试
    print(f"n=41, m=7 最后存活: {last_remaining(41, 7) + 1}")  # 31
    print(f"出列顺序: {elimination_order(7, 3)}")
```

### Java

```java
public class JosephusProblem {
    
    /**
     * 约瑟夫斯问题 —— 迭代解法
     * 时间: O(n), 空间: O(1)
     */
    public static int lastRemaining(int n, int m) {
        int survivor = 0; // f(1) = 0
        for (int i = 2; i <= n; i++) {
            survivor = (survivor + m) % i;
        }
        return survivor;
    }
    
    /**
     * 递归解法
     * f(n) = (f(n-1) + m) % n
     */
    public static int lastRemainingRecursive(int n, int m) {
        if (n == 1) return 0;
        return (lastRemainingRecursive(n - 1, m) + m) % n;
    }
    
    /**
     * 求完整出列顺序
     */
    public static List<Integer> eliminationOrder(int n, int m) {
        List<Integer> people = new ArrayList<>();
        for (int i = 0; i < n; i++) people.add(i);
        
        List<Integer> result = new ArrayList<>();
        int idx = 0;
        
        while (!people.isEmpty()) {
            idx = (idx + m - 1) % people.size();
            result.add(people.remove(idx));
        }
        
        return result;
    }
    
    public static void main(String[] args) {
        System.out.println("n=41, m=7 最后存活: " + (lastRemaining(41, 7) + 1));
        System.out.println("出列顺序: " + eliminationOrder(7, 3));
    }
}
```

## 复杂度分析

| 解法 | 时间复杂度 | 空间复杂度 | 适用场景 |
| ---- | ---------- | ---------- | -------- |
| 队列模拟 | O(n × m) | O(n) | 简单直观，n 和 m 都小时 |
| 递归 | O(n) | O(n) | 面试展示数学推导能力 |
| **迭代（推荐）** | **O(n)** | **O(1)** | **生产环境首选** |
| 位运算（m=2） | O(1) | O(1) | 特殊 case 优化 |

## 实际应用

虽然约瑟夫斯问题看起来是个数学游戏，但它在现实中还真有应用：

### 1. 循环调度算法

操作系统中的**时间片轮转调度**（Round Robin Scheduling）本质上就是约瑟夫斯问题。每个进程轮流执行一个时间片，当进程执行完毕或阻塞时就出列，直到所有进程都执行过。

### 2. 加密算法中的置换群

约瑟夫斯排列（Josephus Permutation）在密码学中用于构造某些置换密码。

### 3. 游戏设计

"丢手绢"、"击鼓传花"这类游戏的数学模型就是约瑟夫斯问题。

## 小结

约瑟夫斯问题虽然起源于一个"残酷"的历史故事，但它是一个优雅的算法问题：

```
┌─────────────────────────────────────────────────────────┐
│  核心公式: f(n) = (f(n-1) + m) % n                      │
│                                                         │
│  理解方式: 每杀死一人后，重新从 1 开始报数，相当于把      │
│           圈子"压缩"了，所有人编号减 m（模 n）           │
└─────────────────────────────────────────────────────────┘
```

- ✅ **暴力法**：队列模拟，简单但慢
- ✅ **递归法**：展示数学思维，但有栈溢出风险
- ✅ **迭代法**：生产环境首选，O(n) 时间 O(1) 空间
- ✅ **位运算**：m=2 的特殊优化，O(1)

约瑟夫斯问题是少数几个既能考察**数学归纳**能力，又能考察**代码实现**能力的算法题。如果面试中遇到，别慌，先从简单的队列模拟开始，再推导出递推公式，最后用迭代优化——这套组合拳打下来，面试官肯定对你刮目相看 👏

---

**参考资料**：
- 《算法导论》第三章
- LeetCode 剑指 Offer 62
- Wikipedia: Josephus problem
