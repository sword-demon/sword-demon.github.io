---
title: 栈与队列设计题精讲（MinStack/用栈实现队列/用队列实现栈/循环队列）
description: 面试超高频的栈与队列设计题合集：LeetCode 155 最小栈、232 用栈实现队列、225 用队列实现栈、622 循环队列
date: 2026-10-15 09:00:50
categories:
  - Algorithm
tags:
  - stack
  - queue
  - design
  - data-structure
sidebarSort: 104
---

# 栈与队列设计题精讲

面试官拿出 LeetCode 题库，啪一下翻到「设计题」分类，第一个就是 **155. 最小栈（Min Stack）**：要求你能 O(1) 拿到栈里的最小值。一看 O(1)，你立刻就知道是「空间换时间」。再翻一下：**232. 用栈实现队列**、**225. 用队列实现栈**——这是字节、阿里、腾讯、美团面试出现率最高的几道题，几乎所有候选人都会被问到。再翻：**622. 设计循环队列**——经典的环形数组/链表题。

这几道题单独抽出来都不难，但面试官的**真实意图**不是让你把 LeetCode 答案背一遍——他想看你能不能把「栈」和「队列」这两种最基础的数据结构理解到骨子里，能不能在 O(1) 时间复杂度约束下灵活设计辅助结构，能不能写出干净的代码。

今天这一篇，我把四道高频题一次性讲透。读完你能在 30 分钟内手写出来，再也不怕面试官问「设计一个数据结构」。

## 一、为什么面试官偏爱这类题？

你可能会想：栈和队列这么简单，有什么好考的？这其实是误解。栈和队列本身确实简单，但**用它们衍生出来的设计题**，考察的是这几个能力：

1. **对基础数据结构的深入理解**：你真的知道栈和队列的区别吗？为什么栈能用数组实现，队列通常用链表？
2. **空间换时间的工程思维**：O(1) getMin 怎么做？辅助栈是标配。
3. **对边界的敏感度**：空栈弹出怎么处理？循环队列满和空怎么区分？
4. **编码能力**：能不能在十几分钟内写出无 bug 的代码？

所以这类题往往是面试的**筛选题**——答得出来不代表能进下一轮，答不出来基本就挂了。

## 二、最小栈（Min Stack，LeetCode 155）

### 题目描述

设计一个栈，支持 push、pop、top 操作，并能**在常数时间内**检索到栈中的最小元素。

```
MinStack minStack = new MinStack();
minStack.push(-2);
minStack.push(0);
minStack.push(-3);
minStack.getMin();   // 返回 -3
minStack.pop();
minStack.top();      // 返回 0
minStack.getMin();   // 返回 -2
```

### 思路拆解

你第一反应可能是：用一个变量 `minVal` 记录最小值，每次 push 时更新。问题是：**pop 出去之后怎么办？** 你不知道新的最小值是啥了。

所以单变量不行，**需要一个辅助栈**专门记录「每一层对应的最小值」。栈的每一层 push 一个值，辅助栈对应位置就 push 一个「当前所有元素里的最小值」。这样无论怎么 pop，主栈弹出的同时辅助栈也跟着弹出，最小值始终在辅助栈的栈顶。

```
主栈:    [ -2, 0, -3, -5 ]
辅助栈:  [ -2,-2,-3, -5 ]   ← 栈顶就是当前栈的最小值

弹出 -5 → 主栈 [-2,0,-3], 辅助栈 [-2,-2,-3]，最小值变 -3 ✅
弹出 -3 → 主栈 [-2,0],   辅助栈 [-2,-2],   最小值变 -2 ✅
```

### 代码实现

#### TypeScript

```typescript
/**
 * 最小栈 —— 用辅助栈记录每一层对应的最小值
 * 核心思路：主栈正常 push/pop，辅助栈的栈顶始终是当前主栈的最小值
 * 为什么用辅助栈：因为 pop 后单变量 min 无法回退
 */
class MinStack {
  private stack: number[] = [];      // 主栈，存所有元素
  private minStack: number[] = [];   // 辅助栈，存每层对应的最小值

  /** 压栈：主栈直接压，辅助栈压「当前值 vs 当前最小」的较小者 */
  push(val: number): void {
    this.stack.push(val);
    // 如果辅助栈为空，或者当前值 ≤ 辅助栈栈顶，压入当前值
    // 为什么用 ≤ 不是 <：避免重复最小值时栈不一致（虽然本题不影响，但习惯写 ≤）
    if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {
      this.minStack.push(val);
    } else {
      // 否则再次压入当前最小值，让辅助栈长度永远等于主栈
      this.minStack.push(this.minStack[this.minStack.length - 1]);
    }
  }

  /** 出栈：主栈和辅助栈同时弹 */
  pop(): void {
    this.stack.pop();
    this.minStack.pop();
  }

  /** 获取栈顶 */
  top(): number {
    return this.stack[this.stack.length - 1];
  }

  /** 获取最小值：辅助栈栈顶就是 */
  getMin(): number {
    return this.minStack[this.minStack.length - 1];
  }
}

// === 使用示例 ===
const minStack = new MinStack();
minStack.push(-2);
minStack.push(0);
minStack.push(-3);
console.log(minStack.getMin()); // -3
minStack.pop();
console.log(minStack.top());    // 0
console.log(minStack.getMin()); // -2
```

#### Python

```python
class MinStack:
    """最小栈 —— 辅助栈思路

    关键技巧：辅助栈的栈顶始终保存当前主栈的最小值。
    入栈时主栈压当前值；辅助栈压 min(当前值, 原栈顶)。
    """

    def __init__(self):
        self.stack = []        # 主栈
        self.min_stack = []    # 辅助栈

    def push(self, val: int) -> None:
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
        else:
            # 再次压入当前最小值，保持两个栈等高
            self.min_stack.append(self.min_stack[-1])

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def get_min(self) -> int:
        return self.min_stack[-1]
```

### 复杂度分析

- **时间复杂度**：所有操作都是 O(1)
- **空间复杂度**：O(n)，n 是栈深度，辅助栈和主栈等大

> 💡 **进阶优化**：如果想省空间，可以只在**出现新的最小值**时才压辅助栈（用 `val <=` 条件），弹栈时判断是不是等于辅助栈顶再弹。但代价是 getMin 还得判断辅助栈是否空。空间能从 O(n) 省到 O(k)，k 是最小值变更次数。本题没必要，普通写法更直观。

## 三、用栈实现队列（LeetCode 232）

### 题目描述

**仅使用两个栈**实现先入先出队列。队列应当支持 push、pop、peek、empty 等操作。

### 思路拆解

栈是后进先出（LIFO），队列是先进先出（FIFO）。怎么把 LIFO 变成 FIFO？

**经典思路：双栈协作——输入栈 + 输出栈**

- push 全部压到「输入栈」
- pop / peek 都从「输出栈」取
- 输出栈空了，就把输入栈的所有元素**逐个弹出并压入输出栈**，这个过程会**反转顺序**

```
push 1: [1]     →  输入栈: [1]        输出栈: []
push 2: [1,2]   →  输入栈: [1,2]      输出栈: []
push 3: [1,2,3] →  输入栈: [1,2,3]    输出栈: []

pop():  输出栈空 → 把输入栈倒进输出栈
                    输入栈: []           输出栈: [3,2,1]   ← 顺序反转了！
        返回输出栈顶：1 ✅

pop():  输出栈非空 → 直接返回输出栈顶
        返回：2 ✅

push 4: 输入栈: [4]                       输出栈: [3]
pop(): 输出栈非空 → 直接返回 3
```

为什么要这么设计？因为输入栈和输出栈之间的「倒序」操作**只会发生一次**——倒完一次之后，只要输出栈没空，就能直接拿。所以**均摊时间复杂度是 O(1)**。

### 代码实现

#### TypeScript

```typescript
/**
 * 用栈实现队列 —— 双栈协作
 * 核心思路：输入栈管 push，输出栈管 pop/peek
 * 关键：当输出栈空时，才把输入栈倒进输出栈（顺序反转）
 */
class MyQueue {
  private inStack: number[] = [];   // 输入栈
  private outStack: number[] = [];  // 输出栈

  /** 入队：全部压到输入栈 */
  push(x: number): void {
    this.inStack.push(x);
  }

  /** 出队：从输出栈弹，如果输出栈空就先把输入栈倒过来 */
  pop(): number {
    // 注意：peek 必须放在 pop 之前，且要复用同一个 lazy transfer 逻辑
    if (this.outStack.length === 0) {
      this.transfer();
    }
    return this.outStack.pop()!;
  }

  /** 查看队首 */
  peek(): number {
    if (this.outStack.length === 0) {
      this.transfer();
    }
    return this.outStack[this.outStack.length - 1];
  }

  /** 是否为空：两个栈都空才算空 */
  empty(): boolean {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }

  /** 倒序转移：把输入栈的元素逐个弹出并压入输出栈 */
  private transfer(): void {
    while (this.inStack.length > 0) {
      this.outStack.push(this.inStack.pop()!);
    }
  }
}
```

#### Go

```go
package main

// MyQueue 用两个栈实现队列
type MyQueue struct {
    inStack  []int // 输入栈
    outStack []int // 输出栈
}

// NewMyQueue 构造函数
func NewMyQueue() *MyQueue {
    return &MyQueue{
        inStack:  make([]int, 0),
        outStack: make([]int, 0),
    }
}

// Push 入队
func (q *MyQueue) Push(x int) {
    q.inStack = append(q.inStack, x)
}

// Pop 出队
func (q *MyQueue) Pop() int {
    q.ensureOutStack()
    // pop from outStack
    n := len(q.outStack)
    val := q.outStack[n-1]
    q.outStack = q.outStack[:n-1]
    return val
}

// Peek 查看队首
func (q *MyQueue) Peek() int {
    q.ensureOutStack()
    return q.outStack[len(q.outStack)-1]
}

// Empty 是否为空
func (q *MyQueue) Empty() bool {
    return len(q.inStack) == 0 && len(q.outStack) == 0
}

// ensureOutStack 懒转移：当输出栈空时把输入栈倒进输出栈
func (q *MyQueue) ensureOutStack() {
    if len(q.outStack) > 0 {
        return
    }
    for len(q.inStack) > 0 {
        n := len(q.inStack)
        val := q.inStack[n-1]
        q.inStack = q.inStack[:n-1]
        q.outStack = append(q.outStack, val)
    }
}
```

### 复杂度分析

- **push**：O(1)
- **pop / peek**：均摊 O(1)。最坏 O(n)（触发 transfer），但每个元素最多被 transfer 一次，所以均摊下来还是 O(1)
- **空间复杂度**：O(n)

> 💡 **为什么叫「懒转移」**：transfer 只在「输出栈空」时才执行，这是一种延迟处理的策略。类似的还有「懒删除」「懒加载」。工程上很常见。

## 四、用队列实现栈（LeetCode 225）

### 题目描述

**仅使用两个队列**实现后入先出栈。

### 思路拆解

队列是 FIFO，要实现栈（LIFO），关键是**让最后入队的元素先出来**。两种思路：

#### 思路 A：交换队首队尾（推荐，最优雅）

每次 push 时，把新元素入队后，**把前面所有元素逐个出队再入队**，这样新元素就跑到队首了。

```
push 1: 队列 [1]
push 2: 入队 [1, 2] → 把 1 出队再入队 → [2, 1]
push 3: 入队 [2, 1, 3] → 依次把 2、1 出队再入队 → [3, 2, 1]

pop(): 队首 3，模拟栈顶 ✅
```

#### 思路 B：双队列（同用栈实现队列，但反过来）

push 时压到主队列，pop 时把主队列前 n-1 个元素搬到辅助队列，取出最后一个，再交换主辅。

每个元素 push 时被搬运 n 次，时间复杂度略差。

**今天我们用思路 A**——更简洁，只用一个队列。

### 代码实现

#### TypeScript

```typescript
/**
 * 用队列实现栈 —— 单队列 + 旋转法
 * 核心思路：每次 push 完新元素后，把前面所有元素出队再入队，
 * 这样新元素永远在队首（栈顶）
 */
class MyStack {
  private queue: number[] = [];

  /** 入栈：先 push 到队尾，然后把前面所有元素出队再入队 */
  push(x: number): void {
    const n = this.queue.length;
    this.queue.push(x);
    // 把新元素之前的所有元素旋转到它后面
    // 旋转次数 = n（旋转后新元素到队首）
    for (let i = 0; i < n; i++) {
      const front = this.queue.shift()!; // 队首出队
      this.queue.push(front);            // 再入队尾
    }
  }

  /** 出栈：直接弹出队首（这就是旋转法的好处） */
  pop(): number {
    return this.queue.shift()!;
  }

  /** 查看栈顶：队首 */
  top(): number {
    return this.queue[0];
  }

  /** 是否为空 */
  empty(): boolean {
    return this.queue.length === 0;
  }
}
```

#### Java

```java
import java.util.LinkedList;
import java.util.Queue;

public class MyStack {
    private Queue<Integer> queue;

    public MyStack() {
        queue = new LinkedList<>();
    }

    /**
     * 入栈：每次 push 后旋转前面所有元素到队尾
     */
    public void push(int x) {
        int n = queue.size();
        queue.offer(x);
        // 把 x 之前的 n 个元素逐个移动到队尾
        for (int i = 0; i < n; i++) {
            queue.offer(queue.poll());
        }
    }

    public int pop() {
        return queue.poll();
    }

    public int top() {
        return queue.peek();
    }

    public boolean empty() {
        return queue.isEmpty();
    }
}
```

### 复杂度分析

- **push**：O(n)，把前面元素都搬运一遍
- **pop / top**：O(1)
- **空间复杂度**：O(n)

> 💡 **为啥不用 push O(1) 的双队列方案**：双队列方案也可以，push 是 O(1)，pop 是 O(n)。看起来 push 多了更划算，但其实栈的语义下 push 和 pop 的调用频率都高，**总操作数是 O(n²)**。而单队列旋转法总操作数是 **O(n)**（n 个元素的总搬运次数 ≈ n²/2 + n/2，看似 O(n²)，但这就是 push 操作本身需要 O(n) 的代价），在 LeetCode 上也能过。这题的工程意义大于实际意义——面试时能讲清楚两种思路就够了。

## 五、循环队列（LeetCode 622）

### 题目描述

设计一个循环队列，支持 enQueue、deQueue、Front、Rear、isEmpty、isFull 操作。容量为 k。

### 为什么需要循环队列？

普通队列用数组实现有个**致命问题**：前面出队的元素位置空着，新的元素只能往队尾一直加，等数组满了就扩容。但如果业务是「生产者-消费者」轮转使用，**前面的空位完全浪费**。

**循环队列 = 把数组的首尾接起来**。用 head 和 tail 两个指针在数组里循环游走，满了就把 tail 重新指到 0。这样一来，**容量固定的场景下零浪费**。

```
普通队列（出队后位置空着浪费）：
[_ , _, _, _, _, _]
 ↑                       ↑
head                    tail
空位浪费

循环队列（tail 满了回到 0）：
[5, 6, _, _, 3, 4]
 ↑           ↑
tail        head
容量 k=6，存了 5 个元素 3,4,5,6，tail 指向下一个空位
```

### 关键难题：怎么区分「空」和「满」？

数组下标用模运算循环，那 head == tail 时是空还是满？两种方案：

1. **多浪费一个位置**：容量实际 k+1，判满条件是 `(tail+1) % (k+1) == head`，判空还是 `head == tail`
2. **加个 size 变量**：每次操作顺手维护 size，size == 0 是空，size == k 是满

我们用方案 1——更纯粹，体现「用数据结构本身区分状态」的思想。

```
容量声明 k = 3，实际数组大小 k+1 = 4

空状态：head == tail == 0
[_ , _ , _ , _]
 ↑
h/t

enQueue 1: tail = (0+1)%4 = 1
[1 , _ , _ , _]
 ↑ ↑
 h  t

enQueue 2: tail = 2
[1 , 2 , _ , _]
 ↑     ↑
 h     t

enQueue 3: tail = 3
[1 , 2 , 3 , _]
 ↑        ↑
 h        t

enQueue 4 (满了!): tail 应为 (3+1)%4 = 0，正好等于 head → 满
[1 , 2 , 3 , _]
 ↑  ↑
 h  t 满了
```

### 代码实现

#### TypeScript

```typescript
/**
 * 循环队列 —— 基于固定大小数组 + 模运算
 * 核心思路：用 head 和 tail 两个指针在数组里循环
 * 空判断：head === tail
 * 满判断：(tail + 1) % capacity === head
 * 关键：浪费一个位置用于区分空和满
 */
class MyCircularQueue {
  private queue: number[];      // 底层数组
  private head: number = 0;     // 队首指针（指向第一个元素）
  private tail: number = 0;     // 队尾指针（指向下一个入队的空位）
  private capacity: number;     // 数组容量（用户声明的 k + 1）

  constructor(k: number) {
    this.capacity = k + 1; // 多一格用于区分空/满
    this.queue = new Array(this.capacity).fill(0);
  }

  /** 入队：成功返回 true，满了返回 false */
  enQueue(value: number): boolean {
    if (this.isFull()) return false;
    this.queue[this.tail] = value;
    // 模运算：到末尾就回到 0
    this.tail = (this.tail + 1) % this.capacity;
    return true;
  }

  /** 出队：成功返回 true，空了返回 false */
  deQueue(): boolean {
    if (this.isEmpty()) return false;
    // 出队不用真的清理数据，只要移动 head 就行
    this.head = (this.head + 1) % this.capacity;
    return true;
  }

  /** 查看队首 */
  Front(): number {
    if (this.isEmpty()) return -1;
    return this.queue[this.head];
  }

  /**
   * 查看队尾
   * 注意：tail 指向的是「下一个空位」，所以真正的队尾是 tail-1 的位置
   * 还要处理 tail=0 的边界（应该取 capacity-1）
   */
  Rear(): number {
    if (this.isEmpty()) return -1;
    // tail - 1 可能是 -1，需要 + capacity 再取模
    return this.queue[(this.tail - 1 + this.capacity) % this.capacity];
  }

  /** 是否为空 */
  isEmpty(): boolean {
    return this.head === this.tail;
  }

  /** 是否已满：tail 的下一个位置等于 head */
  isFull(): boolean {
    return (this.tail + 1) % this.capacity === this.head;
  }
}

// === 使用示例 ===
const cq = new MyCircularQueue(3); // 容量 3
console.log(cq.enQueue(1)); // true
console.log(cq.enQueue(2)); // true
console.log(cq.enQueue(3)); // true
console.log(cq.enQueue(4)); // false —— 满了
console.log(cq.Rear());     // 3
console.log(cq.isFull());   // true
console.log(cq.deQueue());  // true
console.log(cq.enQueue(4)); // true —— 完美！原来 1 的位置被复用了
console.log(cq.Rear());     // 4
```

#### Python

```python
class MyCircularQueue:
    """循环队列 —— 浪费一格策略"""

    def __init__(self, k: int):
        """
        :param k: 用户指定的容量上限
        """
        self.capacity = k + 1  # 多一格，用于区分空/满
        self.queue = [0] * self.capacity
        self.head = 0  # 队首指针
        self.tail = 0  # 队尾指针（下一个入队位置）

    def en_queue(self, value: int) -> bool:
        """入队：满了返回 False"""
        if self.is_full():
            return False
        self.queue[self.tail] = value
        self.tail = (self.tail + 1) % self.capacity
        return True

    def de_queue(self) -> bool:
        """出队：空了返回 False"""
        if self.is_empty():
            return False
        self.head = (self.head + 1) % self.capacity
        return True

    def front(self) -> int:
        if self.is_empty():
            return -1
        return self.queue[self.head]

    def rear(self) -> int:
        if self.is_empty():
            return -1
        # tail-1 可能是 -1，处理一下
        return self.queue[(self.tail - 1) % self.capacity]

    def is_empty(self) -> bool:
        return self.head == self.tail

    def is_full(self) -> bool:
        return (self.tail + 1) % self.capacity == self.head
```

### 复杂度分析

- **所有操作**：O(1)
- **空间复杂度**：O(k)，用户指定 k，数组实际 k+1

> 💡 **链表的替代方案**：循环队列也可以用链表实现，把 tail 的 next 指向 head。但链表实现有「节点对象开销大」「GC 压力大」的问题。生产环境如果容量固定且不大，**首选数组实现**——内存连续、缓存友好。

## 六、常见易错点（踩坑实录）

写完代码别高兴太早，这几类题有非常容易踩坑的地方：

### 1. 最小栈的辅助栈条件：`<` vs `<=`

- 用 `<`：重复的最小值会出现**辅助栈和主栈数量不一致**的情况。比如 push 两个 0 进栈，pop 一次，辅助栈已经空了，但主栈还有一个 0，这会让 getMin 异常。
- 用 `<=`：能让两个栈保持等高，最稳。

LeetCode 官方解法两种都行，但**用 `<=` 是工程习惯**，避免边界陷阱。

### 2. 用栈实现队列：peek 之前别忘了 transfer

很多人写 peek 时忘了在 pop 里已经 transfer 过，结果两次 transfer 之后队列乱序。**正确做法是把 transfer 抽成私有方法**，peek 和 pop 都先调一下。

```typescript
// ❌ 错误：pop 里 transfer 了，peek 又 transfer 一次
pop(): number {
  this.transfer();  // 转移
  return this.outStack.pop()!;
}
peek(): number {
  this.transfer();  // 又转移！这时 outStack 已经空了，相当于空操作，但代码异味
  return this.outStack[this.outStack.length - 1];
}

// ✅ 正确：transfer 抽方法，判空后再决定要不要 transfer
pop(): number {
  if (this.outStack.length === 0) this.transfer();
  return this.outStack.pop()!;
}
```

### 3. 用队列实现栈：选单队列还是双队列？

这个问题面试会被追问到：

- **单队列**：push O(n)，pop O(1)。n 次操作总时间 O(n²)。
- **双队列**：push O(1)，pop O(n)。n 次操作总时间还是 O(n²)。

两个方案的**总复杂度其实一样**，但代码风格不同。双队列更「对偶」（跟「用栈实现队列」完全对称），单队列更简洁。**面试时建议先写单队列，然后主动提一句「也可以用双队列，对偶性更好」**——展示你的灵活性。

### 4. 循环队列的 tail 指针语义

很多人一开始会以为 tail 指向队尾元素，结果 `Rear()` 的实现就错了。**tail 必须指向「下一个要入队的空位」**，这样 `(tail - 1 + cap) % cap` 才是真正的队尾。这种「指针指向下一个位置」的约定在队列、栈、deque 里都很常见，要熟练。

## 七、实际工程中的应用

这些题不只是 LeetCode 面试——它们在真实项目里都用得上。

### 1. 最小栈 → 数据库的「最近最少使用」缓存

Redis 的 `ZRANGEBYSCORE`、Java 的 `LinkedHashMap`、操作系统页面置换算法……都用了**栈 + 辅助结构** 的设计思想。**最小栈是这种「双结构追踪极值」模式的鼻祖**，理解了它，再看缓存淘汰算法就容易多了。

### 2. 用栈实现队列 → 浏览器历史记录

浏览器后退功能、IDE 的 undo/redo、命令行的 Ctrl+Z——这些看似栈的题，实际上内部经常用**队列+栈的复合结构**模拟，避免误操作后丢失最早的状态。

### 3. 循环队列 → Kafka / 日志系统

Kafka 的消费者缓冲、Linux 的 `kmsg`、日志写入的 ring buffer——大量生产者-消费者场景都用循环队列做缓冲。**固定容量 + 不浪费 + 线程安全写** 是关键，循环队列完美契合。

```java
// Kafka ProducerRecordBatch 内部就用了类似循环队列的结构
// 生产者批量写入、日志批量刷盘、内存池管理都依赖它
```

### 4. 队列实现栈 → 任务调度系统

Linux 内核的任务调度、LeetCode 「设计任务调度器」(LeetCode 621) 这类题，本质上是「用 FIFO 模拟某种优先级调度」。理解了队列实现栈，再看调度算法就豁然开朗。

## 八、复杂度对比表

| 题目                  | 操作       | 时间复杂度 | 空间复杂度 | 关键技巧               |
| --------------------- | ---------- | ---------- | ---------- | ---------------------- |
| **最小栈**            | 全部       | O(1)       | O(n)       | 辅助栈记录每层最小值   |
| **用栈实现队列**      | push       | O(1)       | O(n)       | 输入栈 + 输出栈懒转移  |
| 用栈实现队列          | pop/peek   | 均摊 O(1)  | O(n)       | 每次 transfer 摊销后 O(1) |
| **用队列实现栈**      | pop/top    | O(1)       | O(n)       | 单队列旋转法           |
| 用队列实现栈          | push       | O(n)       | O(n)       | 前面元素全部搬运       |
| **循环队列**          | 全部       | O(1)       | O(k)       | 浪费一格区分空/满      |

## 九、小结

栈与队列的设计题，表面是考察基础数据结构，实际上是考察**对边界的敏感度**和**空间换时间的工程思维**。今天讲到的四道题，每一道都是面试高频：

- 🔒 **最小栈（155）**：辅助栈套路，任何「O(1) 极值」问题都用这个
- 🔁 **用栈实现队列（232）**：懒转移思想，所有「延迟处理」场景的原型
- 🔀 **用队列实现栈（225）**：单队列旋转法，理解 FIFO 与 LIFO 的本质区别
- 💍 **循环队列（622）**：环形数组 + 模运算，工程里 ring buffer 的基础

把这四道题吃透，再加上你已经掌握的 LRU/LFU 缓存（本站 lru-cache.md 和 lfu-cache.md），**「设计题」这一类基本不会栽**。面试时遇到类似题，按这个模板去设计辅助结构：先想清楚要追踪什么状态，再决定用什么结构去记，最后把所有状态变更封装成方法。

最后送一句：**算法面试从来不是考你会不会，而是考你想不想得清楚、写不写得干净**。能讲清楚「为什么这么设计」比直接给代码重要十倍。

---

📚 **推荐练习顺序**：

1. **最小栈** → 5 分钟手写
2. **用栈实现队列** → 10 分钟手写，注意懒转移
3. **用队列实现栈** → 15 分钟，两种方案都试试
4. **循环队列** → 20 分钟，重点是 `Rear()` 的边界处理

刷完之后回头看 LeetCode 评论区，你会发现所有题解都在重复这几个套路。**面试没有银弹，但有套路**。
