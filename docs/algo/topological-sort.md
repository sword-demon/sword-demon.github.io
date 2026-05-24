---
title: 拓扑排序
description: 拓扑排序详解：从课程表到编译顺序，BFS 与 DFS 双解法，四语言实现
date: 2026-05-18 00:00:00
categories:
  - Algorithm
tags:
  - topological-sort
  - graph
  - bfs
  - dfs
  - interview
sidebarSort: 26
---

# 拓扑排序（Topological Sort）

你打开一个大型项目准备编译，发现模块 A 依赖模块 B，模块 B 依赖模块 C，模块 C 又依赖模块 A……等一下，这不就死循环了吗？编译器怎么知道先编译谁？

再想一个场景：大学选课，"数据结构"需要先修"离散数学"，"算法设计"需要先修"数据结构"，"编译原理"需要先修"算法设计"。你该怎么安排选课顺序？

这些问题的共同特点是：**任务之间有先后依赖关系，而且不能成环**。在图论中，这种结构叫做**有向无环图（DAG）**，而找到一个合法的任务执行顺序，就是**拓扑排序**。

## 原理拆解

### 什么是拓扑排序？

给定一个有向无环图（DAG），拓扑排序是将所有节点排成一个线性序列，使得**对于每条有向边 (u, v)，u 都排在 v 的前面**。

```
课程依赖图：
  离散数学 → 数据结构 → 算法设计 → 编译原理
                ↗
  程序设计基础

合法的拓扑排序：
  程序设计基础 → 离散数学 → 数据结构 → 算法设计 → 编译原理

不合法的排序：
  算法设计 → 数据结构 → ...（算法设计在数据结构前面，违反了依赖）
```

注意：**拓扑排序的结果不唯一**，只要满足所有依赖关系就行。

### 两种经典算法

**1. BFS（Kahn 算法）**—— 基于入度

```
1. 统计每个节点的入度（有多少条边指向它）
2. 把入度为 0 的节点加入队列（它们没有前置依赖，可以先执行）
3. 出队一个节点，把它加入结果
4. 把它指向的所有节点的入度 -1（模拟"完成这个前置任务"）
5. 如果某个邻居入度变为 0，入队
6. 重复直到队列为空
7. 如果结果包含所有节点 → 排序成功；否则 → 图中有环
```

**2. DFS（后序遍历）**—— 基于递归

```
1. 对每个未访问的节点做 DFS
2. DFS 中先递归访问所有邻居
3. 邻居都访问完后，把当前节点压入栈
4. 最终栈从顶到底就是拓扑排序

为什么后序遍历反过来就是拓扑序？
因为对于边 u → v，v 一定比 u 先完成 DFS（v 先入栈），
所以 u 后入栈，栈顶到栈底就是 u 在 v 前面 ✅
```

### 图解 BFS 过程

```
图：  0 → 1 → 3
      ↓       ↑
      2 ──────┘

入度统计：
  0: 0  （没有前置）
  1: 1  （0 → 1）
  2: 1  （0 → 2）
  3: 2  （1 → 3, 2 → 3）

BFS 过程：
  队列 [0]           → 出 0，结果 [0]，入度 1:0, 2:0
  队列 [1, 2]        → 出 1，结果 [0,1]，入度 3:1
  队列 [2]           → 出 2，结果 [0,1,2]，入度 3:0
  队列 [3]           → 出 3，结果 [0,1,2,3]

拓扑排序：0 → 1 → 2 → 3 ✅
```

### 检测环

如果排序结果的长度 < 节点总数，说明图中**存在环**，拓扑排序不可能完成。这在编译系统中就意味着**循环依赖**。

## 代码实现

### 经典问题一：课程表（检测能否完成所有课程）

> LeetCode 207. Course Schedule
> 给定课程数和先修关系，判断是否能完成所有课程（即图中是否有环）。

#### TypeScript

```typescript
/**
 * 课程表 —— TypeScript 实现（BFS / Kahn 算法）
 * 判断拓扑排序是否包含所有节点 → 无环
 */
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  // 建图 + 统计入度
  const inDegree = new Array(numCourses).fill(0);
  const graph: number[][] = Array.from({ length: numCourses }, () => []);

  for (const [course, pre] of prerequisites) {
    graph[pre].push(course); // pre → course
    inDegree[course]++;
  }

  // 入度为 0 的先入队
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let count = 0;
  while (queue.length > 0) {
    const node = queue.shift()!;
    count++;

    // 完成后继节点的入度 -1
    for (const next of graph[node]) {
      inDegree[next]--;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  // 所有课程都完成了 → 无环
  return count === numCourses;
}

// 测试
console.log(canFinish(2, [[1, 0]])); // true（先修 0，再修 1）
console.log(
  canFinish(2, [
    [1, 0],
    [0, 1],
  ]),
); // false（循环依赖）
```

#### Go

```go
package graph

// CanFinish 课程表 —— Go 实现（BFS）
func CanFinish(numCourses int, prerequisites [][]int) bool {
	inDegree := make([]int, numCourses)
	graph := make([][]int, numCourses)

	for _, pre := range prerequisites {
		course, prereq := pre[0], pre[1]
		graph[prereq] = append(graph[prereq], course)
		inDegree[course]++
	}

	queue := []int{}
	for i := 0; i < numCourses; i++ {
		if inDegree[i] == 0 {
			queue = append(queue, i)
		}
	}

	count := 0
	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		count++

		for _, next := range graph[node] {
			inDegree[next]--
			if inDegree[next] == 0 {
				queue = append(queue, next)
			}
		}
	}
	return count == numCourses
}
```

#### Java

```java
import java.util.*;

/**
 * 课程表 —— Java 实现（BFS）
 */
public class CourseSchedule {

    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        int[] inDegree = new int[numCourses];
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }

        for (int[] pre : prerequisites) {
            graph.get(pre[1]).add(pre[0]);
            inDegree[pre[0]]++;
        }

        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) queue.offer(i);
        }

        int count = 0;
        while (!queue.isEmpty()) {
            int node = queue.poll();
            count++;
            for (int next : graph.get(node)) {
                if (--inDegree[next] == 0) {
                    queue.offer(next);
                }
            }
        }
        return count == numCourses;
    }
}
```

#### Python

```python
"""课程表 —— Python 实现（BFS）"""
from collections import deque

def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    in_degree = [0] * num_courses
    graph = [[] for _ in range(num_courses)]

    for course, pre in prerequisites:
        graph[pre].append(course)
        in_degree[course] += 1

    queue = deque(i for i in range(num_courses) if in_degree[i] == 0)
    count = 0

    while queue:
        node = queue.popleft()
        count += 1
        for nxt in graph[node]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:
                queue.append(nxt)

    return count == num_courses
```

### 经典问题二：课程表 II（输出排序结果）

> LeetCode 210. Course Schedule II
> 返回一个合法的课程学习顺序。如果不可能完成，返回空数组。

#### TypeScript

```typescript
/**
 * 课程表 II —— TypeScript 实现（BFS 输出拓扑序）
 */
function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const inDegree = new Array(numCourses).fill(0);
  const graph: number[][] = Array.from({ length: numCourses }, () => []);

  for (const [course, pre] of prerequisites) {
    graph[pre].push(course);
    inDegree[course]++;
  }

  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order: number[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);

    for (const next of graph[node]) {
      if (--inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  return order.length === numCourses ? order : [];
}

// 测试
console.log(
  findOrder(4, [
    [1, 0],
    [2, 0],
    [3, 1],
    [3, 2],
  ]),
);
// [0, 1, 2, 3] 或 [0, 2, 1, 3]（合法即可）
```

#### Go

```go
package graph

// FindOrder 课程表 II —— Go 实现
func FindOrder(numCourses int, prerequisites [][]int) []int {
	inDegree := make([]int, numCourses)
	graph := make([][]int, numCourses)

	for _, pre := range prerequisites {
		graph[pre[1]] = append(graph[pre[1]], pre[0])
		inDegree[pre[0]]++
	}

	queue := []int{}
	for i := 0; i < numCourses; i++ {
		if inDegree[i] == 0 {
			queue = append(queue, i)
		}
	}

	order := []int{}
	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		order = append(order, node)

		for _, next := range graph[node] {
			inDegree[next]--
			if inDegree[next] == 0 {
				queue = append(queue, next)
			}
		}
	}

	if len(order) == numCourses {
		return order
	}
	return nil
}
```

#### Java

```java
import java.util.*;

/**
 * 课程表 II —— Java 实现
 */
public class CourseScheduleII {

    public static int[] findOrder(int numCourses, int[][] prerequisites) {
        int[] inDegree = new int[numCourses];
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());

        for (int[] pre : prerequisites) {
            graph.get(pre[1]).add(pre[0]);
            inDegree[pre[0]]++;
        }

        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) queue.offer(i);
        }

        int[] order = new int[numCourses];
        int idx = 0;
        while (!queue.isEmpty()) {
            int node = queue.poll();
            order[idx++] = node;
            for (int next : graph.get(node)) {
                if (--inDegree[next] == 0) queue.offer(next);
            }
        }
        return idx == numCourses ? order : new int[0];
    }
}
```

#### Python

```python
"""课程表 II —— Python 实现"""
from collections import deque

def find_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    in_degree = [0] * num_courses
    graph = [[] for _ in range(num_courses)]

    for course, pre in prerequisites:
        graph[pre].append(course)
        in_degree[course] += 1

    queue = deque(i for i in range(num_courses) if in_degree[i] == 0)
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:
                queue.append(nxt)

    return order if len(order) == num_courses else []
```

### DFS 解法

拓扑排序也可以用 DFS 后序遍历实现，代码更短：

#### TypeScript

```typescript
/**
 * 拓扑排序 DFS 版 —— TypeScript 实现
 * 后序遍历 + 反转 = 拓扑序
 */
function topologicalSortDFS(
  numCourses: number,
  prerequisites: number[][],
): number[] {
  const graph: number[][] = Array.from({ length: numCourses }, () => []);
  for (const [course, pre] of prerequisites) {
    graph[pre].push(course);
  }

  // 0=未访问, 1=访问中, 2=已完成
  const state = new Array(numCourses).fill(0);
  const stack: number[] = [];
  let hasCycle = false;

  function dfs(node: number) {
    if (hasCycle) return;
    state[node] = 1; // 标记为"访问中"

    for (const next of graph[node]) {
      if (state[next] === 1) {
        // 遇到了"访问中"的节点 → 有环！
        hasCycle = true;
        return;
      }
      if (state[next] === 0) {
        dfs(next);
      }
    }

    state[node] = 2; // 标记为"已完成"
    stack.push(node); // 后序入栈
  }

  for (let i = 0; i < numCourses; i++) {
    if (state[i] === 0) dfs(i);
  }

  if (hasCycle) return [];
  return stack.reverse(); // 反转得到拓扑序
}
```

#### Python

```python
"""拓扑排序 DFS 版 —— Python 实现"""

def topological_sort_dfs(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    graph = [[] for _ in range(num_courses)]
    for course, pre in prerequisites:
        graph[pre].append(course)

    state = [0] * num_courses  # 0=未访问, 1=访问中, 2=已完成
    stack = []
    has_cycle = False

    def dfs(node: int):
        nonlocal has_cycle
        if has_cycle:
            return
        state[node] = 1
        for nxt in graph[node]:
            if state[nxt] == 1:
                has_cycle = True
                return
            if state[nxt] == 0:
                dfs(nxt)
        state[node] = 2
        stack.append(node)

    for i in range(num_courses):
        if state[i] == 0:
            dfs(i)

    return stack[::-1] if not has_cycle else []
```

## 面试题精选

| 题号 | 题目                 | 考点                         | 难度 |
| ---- | -------------------- | ---------------------------- | ---- |
| 207  | 课程表               | 拓扑排序判环                 | 中等 |
| 210  | 课程表 II            | 输出拓扑序                   | 中等 |
| 269  | 火星词典             | 从排序中推导图 + 拓扑排序    | 困难 |
| 310  | 最小高度树           | 逐层剥离叶子（逆向拓扑排序） | 中等 |
| 329  | 矩阵中的最长递增路径 | 记忆化 DFS + DAG 上 DP       | 困难 |
| 444  | 序列重建             | 验证拓扑序唯一性             | 中等 |
| 1136 | 平行课程             | 拓扑排序 + 层数              | 中等 |
| 1203 | 项目管理             | 组间 + 组内双重拓扑排序      | 困难 |
| 802  | 找到最终的安全状态   | 反向图 + 拓扑排序            | 中等 |
| 1591 | 奇怪的打印机 II      | 颜色依赖建图 + 拓扑排序      | 困难 |

## 业务场景

### 1. 编译器与构建工具

`make`、`webpack`、`bazel`、`gradle` 等构建工具的核心就是拓扑排序。每个源文件是一个节点，文件之间的依赖关系是边。构建工具做拓扑排序确定编译顺序，同时检测循环依赖（如果有就报错）。Go 编译器在编译包时也是先做拓扑排序。

### 2. 任务调度与工作流

Airflow、Prefect、Argo Workflow 等工作流引擎用 DAG 描述任务依赖。拓扑排序确定哪些任务可以并行执行（入度为 0 的任务可以并发），哪些必须串行。Kubernetes 的 Pod 启动顺序、初始化容器也是这个原理。

### 3. 数据库外键约束

数据库在创建表时如果有外键引用，删除表的顺序必须是拓扑逆序（先删没有外键依赖的表，最后删被引用的表）。`pg_dump` 导出 PostgreSQL 数据库时就用拓扑排序确定表和约束的导出顺序。

### 4. 包管理器

npm、pip、cargo 等包管理器在安装依赖时需要拓扑排序。先安装没有依赖的包，再安装依赖已安装包的包。如果出现循环依赖（A 依赖 B，B 依赖 A），就报错或者用特殊策略处理。

### 5. Excel 公式计算

Excel 单元格之间有引用关系：`A1 = B1 + C1`。当你修改 B1 的值时，Excel 需要做拓扑排序来确定哪些单元格需要重新计算，以及计算的先后顺序。如果出现循环引用（A1 引用 B1，B1 引用 A1），Excel 会弹窗报错。

## 复杂度分析

| 算法       | 时间复杂度 | 空间复杂度 | 说明             |
| ---------- | ---------- | ---------- | ---------------- |
| BFS (Kahn) | O(V + E)   | O(V + E)   | V 节点数，E 边数 |
| DFS 后序   | O(V + E)   | O(V + E)   | 递归栈 + 图存储  |

- **时间 O(V + E)**：建图 O(E) + 遍历所有节点和边 O(V + E)
- **空间 O(V + E)**：邻接表存图 O(E) + 入度数组/状态数组 O(V) + 队列/栈 O(V)
- 两种算法复杂度相同，**BFS 更适合需要逐层处理的场景，DFS 代码更简洁**

## 小结

拓扑排序就三句话：**有向无环图、先做没依赖的、做完减入度**。

面试中记住这些要点：

1. **BFS (Kahn)**：统计入度 → 入度 0 入队 → 出队减邻居入度 → 检查是否全部完成
2. **DFS 后序**：递归访问邻居 → 全部完成后当前节点入栈 → 反转得到拓扑序
3. **判环**：BFS 看结果长度是否等于节点数；DFS 看有没有遇到"访问中"的节点
4. **三色标记**：0=未访问，1=访问中（灰色），2=已完成（黑色）——遇到灰色节点就是有环

拓扑排序口诀：**入度为零先执行，完成后继减一成。队列空了看结果，少了节点就有环** ✅
