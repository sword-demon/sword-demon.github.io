---
title: 合并区间
description: 合并区间（Merge Intervals）— 排序 + 贪心的经典区间问题
date: 2026-06-11 10:00:00
categories:
  - Algorithm
tags:
  - merge-intervals
  - greedy
  - sorting
  - intervals
sidebarSort: 43
---

# 合并区间（Merge Intervals）

你做过后端对吧？一定写过这样的需求：**会议室排期系统**。给了一个会议列表，每个会议有个开始时间和结束时间，你要判断最少需要几间会议室，或者把有重叠的会议合并起来展示给用户。

再比如，你在做日志分析系统，用户访问的时间段有重叠，你想把重叠的区间合并成一段连续的时间——「小王在 10:00-10:15 和 10:10-10:30 各访问了一次，合并后就是 10:00-10:30」。

这就是经典的**合并区间**问题，LeetCode #56，面试出场率极高 🔥。思路不难，但细节不少，很多人写出来边界情况各种 bug。

## 问题定义

给你一组区间 `intervals`，其中每个区间 `intervals[i] = [start, end]`，把所有重叠的区间合并，返回不重叠的区间数组。

```
输入：[[1,3], [2,6], [8,10], [15,18]]
输出：[[1,6], [8,10], [15,18]]

解释：
[1,3] 和 [2,6] 重叠了 → 合并成 [1,6]
[8,10] 和前面不重叠 → 独立保留
[15,18] 和前面不重叠 → 独立保留
```

## 原理拆解

### 核心直觉

合并区间的套路非常固定：**先排序，再扫描合并**。

为什么排序？因为区间如果没有按起始位置排好序，你就没法按顺序处理——你不知道当前区间该和谁比。一旦排好序，按顺序扫一遍就行了。

### 图解过程

```
原始区间：[1,3] [8,10] [2,6] [15,18]

第 1 步：按 start 排序
排序后：  [1,3] [2,6] [8,10] [15,18]

第 2 步：从左到右扫描，用一个"当前合并区间"跟踪

当前合并区间: [1,3]
┌─────────┐
│  1 ~ 3  │
└─────────┘

看下一个 [2,6]：
2 <= 3（有重叠！），合并 → 取 max(3,6) = 6
┌─────────────┐
│   1 ~ 6     │
└─────────────┘

看下一个 [8,10]：
8 > 6（没重叠），把 [1,6] 存入结果，当前合并区间切换为 [8,10]
┌─────────────┐  ┌─────────┐
│   1 ~ 6     │  │  8 ~ 10 │
└─────────────┘  └─────────┘

看下一个 [15,18]：
15 > 10（没重叠），把 [8,10] 存入结果，当前合并区间切换为 [15,18]
┌─────────────┐  ┌─────────┐  ┌──────────┐
│   1 ~ 6     │  │  8 ~ 10 │  │ 15 ~ 18  │
└─────────────┘  └─────────┘  └──────────┘

扫描结束，把最后一个 [15,18] 也存入结果。

最终结果：[[1,6], [8,10], [15,18]]
```

### 关键逻辑

判断两个区间是否重叠，就一句话：

```
区间 A: [a.start, a.end]
区间 B: [b.start, b.end]  （已排好序，b.start >= a.start）

重叠条件：b.start <= a.end
```

```
重叠情况：          不重叠情况：

  a.start   a.end     a.start   a.end
  ┌───────────┐        ┌───────────┐
  │           │        │           │
──┴───────────┴────────┴───────────┴────────
           b.start  b.end
       ┌───────────┐
       │  b.start <= a.end  ✅ 重叠    │     b.start > a.end  ❌ 不重叠
       └───────────┘
```

## 代码实现

### TypeScript

```typescript
/**
 * 合并区间 — 先排序，再线性扫描
 * 时间 O(n log n)，空间 O(n)
 */
function merge(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;

  // 第 1 步：按起始位置排序
  intervals.sort((a, b) => a[0] - b[0]);

  const result: number[][] = [];
  // 当前正在合并的区间
  let current = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];

    if (next[0] <= current[1]) {
      // 有重叠 → 扩展当前区间的右边界
      current[1] = Math.max(current[1], next[1]);
    } else {
      // 没重叠 → 把当前区间存入结果，切换到新区间
      result.push(current);
      current = next;
    }
  }

  // 别忘了最后一个区间
  result.push(current);
  return result;
}
```

### Python

```python
def merge(intervals: list[list[int]]) -> list[list[int]]:
    if len(intervals) <= 1:
        return intervals

    # 按起始位置排序
    intervals.sort(key=lambda x: x[0])
    result = []
    current = intervals[0]

    for next_int in intervals[1:]:
        if next_int[0] <= current[1]:
            # 有重叠，扩展右边界
            current[1] = max(current[1], next_int[1])
        else:
            # 没重叠，存入结果
            result.append(current)
            current = next_int

    result.append(current)
    return result
```

### 测试一下

```typescript
console.log(merge([[1,3], [2,6], [8,10], [15,18]]));
// → [[1,6], [8,10], [15,18]]

console.log(merge([[1,4], [4,5]]));
// → [[1,5]]  （端点相接也算重叠）

console.log(merge([[1,4], [0,4]]));
// → [[0,4]]

console.log(merge([[1,4], [2,3]]));
// → [[1,4]]  （完全包含的情况）
```

## 常见变体

### 变体 1：插入区间（LeetCode #57）

给你一个已排好序的不重叠区间数组，再插入一个新区间，合并后返回。

```typescript
function insert(intervals: number[][], newInterval: number[]): number[][] {
  const result: number[][] = [];
  let i = 0;
  const n = intervals.length;

  // 1. 把所有在新区间左边的区间直接放入
  while (i < n && intervals[i][1] < newInterval[0]) {
    result.push(intervals[i]);
    i++;
  }

  // 2. 合并所有与新区间重叠的区间
  while (i < n && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
  }
  result.push(newInterval);

  // 3. 把剩余的区间放入
  while (i < n) {
    result.push(intervals[i]);
    i++;
  }

  return result;
}
```

### 变体 2：区间列表的交集（LeetCode #986）

两个已排序的区间列表，求所有交集。

```typescript
function intervalIntersection(
  firstList: number[][],
  secondList: number[][]
): number[][] {
  const result: number[][] = [];
  let i = 0, j = 0;

  while (i < firstList.length && j < secondList.length) {
    // 交集的左端点 = 两个区间左端点的最大值
    // 交集的右端点 = 两个区间右端点的最小值
    const lo = Math.max(firstList[i][0], secondList[j][0]);
    const hi = Math.min(firstList[i][1], secondList[j][1]);

    if (lo <= hi) {
      result.push([lo, hi]);
    }

    // 谁先结束谁往后走
    if (firstList[i][1] < secondList[j][1]) {
      i++;
    } else {
      j++;
    }
  }

  return result;
}
```

### 变体 3：最少会议室数量（LeetCode #253）

判断一组会议最少需要几间会议室。关键洞察：**重叠数量的最大值就是需要的会议室数**。

```typescript
function minMeetingRooms(intervals: number[][]): number {
  // 把所有开始和结束时间拆开，分别排序
  const starts = intervals.map(i => i[0]).sort((a, b) => a - b);
  const ends = intervals.map(i => i[1]).sort((a, b) => a - b);

  let rooms = 0;
  let endPtr = 0;

  for (let i = 0; i < starts.length; i++) {
    if (starts[i] < ends[endPtr]) {
      // 有会议开始了，但之前的还没结束 → 需要新会议室
      rooms++;
    } else {
      // 之前的会议结束了，房间可以复用
      endPtr++;
    }
  }

  return rooms;
}
```

用图来看更直观：

```
时间轴：  0    1    2    3    4    5    6    7    8
会议A:    |=========|
会议B:         |==============|
会议C:              |====|
会议D:                           |=======|

同一时刻最多有 3 个会议重叠（时刻 2-3），所以需要 3 间会议室
```

## 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 排序 | O(n log n) | O(1)（原地排序）或 O(n)（返回新数组） |
| 线性扫描合并 | O(n) | O(n)（存结果） |
| **总计** | **O(n log n)** | **O(n)** |

> 💡 瓶颈在排序。扫描合并那步其实是 O(n)，所以如果输入已经排好序了，整体就是 O(n)。

## 实际应用场景

1. **会议室排期**：判断最少需要几间会议室，或把重叠的预约合并展示
2. **日程表合并**：多个日历的事件合并，找出空闲时段
3. **IP 段合并**：防火墙规则合并，把重叠的 IP 白名单合并成最少规则
4. **数据库范围查询优化**：合并重叠的查询范围，减少查询次数
5. **游戏技能冷却**：多个 buff/debuff 的持续时间有重叠，合并后计算总效果

## 总结

合并区间问题的套路就三步：

```
1. 排序（按起始位置）
2. 遍历，判断当前区间和上一个区间是否重叠
3. 重叠就合并（取 end 的最大值），不重叠就存结果、切换
```

记住这个框架，不管面试怎么变（插入区间、求交集、求会议室），你都能在这个基础上改。面试的时候先把这个最基础的版本写对，再聊变体，面试官会觉得你思路非常清晰 ✌️。
