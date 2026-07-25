---
title: 分数背包
description: 分数背包（Fractional Knapsack）
date: 2026-07-25 08:00:00
categories:
  - Algorithm
tags:
  - fractional-knapsack
  - greedy
sidebarSort: 68
---

# 分数背包（Fractional Knapsack）

你有没有遇到过这种纠结的选择困境 —— 明天要搬家，你的行李箱只能装 20kg，但你有好多东西想带：旧笔记本（15kg不值钱）、刚买的金项链（1kg很值钱）、几本书（3kg中等）、还有一堆衣服（10kg不值钱）。

你的脑子会怎么想？肯定是先挑最值钱的——金项链必须带，然后看看还有什么空间能塞点别的。**这就是分数背包的核心思想**：只要背包还有空间，就优先装性价比最高的东西，装不下就掰开来装一半。

等等，这里有个有趣的点 —— **0-1 背包问题你没法掰东西**（要么全带要么不带），所以得用动态规划；但分数背包可以"掰开"，所以用贪心就够了，而且能线性时间求解。今天我们就来好好聊聊这个看起来简单、但面试频率超高的分数背包问题 ✨

## 分数背包 vs 0-1 背包：别搞混了

很多人一开始会把这两个问题搞混，觉得"都是背包嘛，方法应该差不多"。但实际上，解法差异巨大：

| 特征 | 0-1 背包 | 分数背包 |
|------|----------|----------|
| 物品状态 | 只能整个拿，不能掰开 | 可以掰开，拿任意分数 |
| 最优解算法 | 动态规划 O(nW) | 贪心 O(n log n) |
| 时间复杂度 | 取决于背包容量 W | 取决于排序 |
| 是否能部分装 | ❌ 不能 | ✅ 能 |
| 适用场景 | 离散物品，完整性约束 | 可分割资源分配 |

> **W** 是背包容量（最大承重），**n** 是物品数量。

为什么分数背包能用贪心？因为**物品可以无限细分**——当你选择性价比最高的物品时，装不满背包就继续装次高的，直到装满为止。这个过程没有"后悔"的可能，贪心选择始终是安全的。

0-1 背包不行：性价比最高的东西可能很重，你整个装进去反而把空间占满了，导致其他轻质高价值物品装不进去。最优解需要权衡全局。

## 原理拆解

### 贪心策略

分数背包的贪心策略很简单：**按单位重量价值（性价比）从高到低排序，然后依次装入**。

```
性价比公式：value(i) / weight(i)

步骤：
1. 计算每个物品的性价比
2. 按性价比降序排序
3. 依次选择：能全装就全装，装不下就装剩余容量的部分
4. 直到背包装满
```

### 图解过程

```
背包容量：15 kg

物品列表：
┌──────────┬────────┬─────────┬─────────────┐
│  物品     │ 重量(kg) │ 价值(¥) │  性价比      │
├──────────┼────────┼─────────┼─────────────┤
│  金项链   │   1    │   900   │   900/kg ✓✓  │
│  书本     │   3    │   150   │   50/kg      │
│  旧衣服   │   8    │   80    │   10/kg      │
│  破鞋子   │   5    │   25    │   5/kg       │
└──────────┴────────┴─────────┴─────────────┘

排序后：[金项链(900), 书本(50), 旧衣服(10), 破鞋子(5)]

选择过程：

Step 1: 背包容量 15kg
  → 装金项链 1kg，装完剩余 14kg，价值 900

Step 2: 背包容量 14kg
  → 装书本 3kg，装完剩余 11kg，价值 1050

Step 3: 背包容量 11kg
  → 装旧衣服 8kg，装完剩余 3kg，价值 1280

Step 4: 背包容量 3kg（只能装 3kg 了）
  → 装破鞋子 5kg 的 3/5 = 0.6，装完价值 += 25 * (3/5) = 15
  → 最终价值 = 1295

最终选择：1kg 金项链 + 3kg 书本 + 8kg 旧衣服 + 3kg 破鞋子（的60%）
```

### 为什么贪心一定正确？（严格证明）

这是关键问题 —— 为什么分数背包一定能用贪心，而且贪心一定最优？

**核心思路：交换论证（Exchange Argument）**

假设我们有一个最优解 O，和贪心解 G。

1. 两者都按性价比排序，贪心 G 按顺序装，O 可能装了不同组合
2. 找第一个 G 和 O 不同的位置 i（性价比排名第 i 的物品）
3. 在 O 中，物品 i 只装了一部分（因为后面物品性价比更低）
4. 在 G 中，物品 i 装了更多（或全装）
5. 把 O 中物品 i 补满，用后面更便宜的物品填补空出来的重量
6. 这样 O 的总价值不会降低
7. 重复这个过程，最终能把 O 变成 G
8. 所以 G 一定是最优的 ✅

简单说：**性价比高的先装，不会吃亏**，因为后面再装什么都不如它"值钱"。

## 代码实现

### TypeScript

```typescript
/**
 * 分数背包 —— TypeScript 实现
 * 核心思路：按性价比排序后依次装入，能全装就全装，装不下就装部分
 */

/** 物品结构 */
interface Item {
  id: string;       // 物品名称
  weight: number;   // 重量
  value: number;    // 价值
}

/** 排序后的可装入单位 */
interface TakeUnit {
  item: Item;
  weightToTake: number; // 本次要装的重量
  unitValue: number;    // 性价比
}

/**
 * 分数背包求解
 * @param items 物品列表
 * @param capacity 背包容量
 * @returns 最大价值
 */
function fractionalKnapsack(items: Item[], capacity: number): number {
  // Step 1: 计算每个物品的性价比，按降序排序
  const sortedItems = [...items]
    .map((item) => ({
      ...item,
      unitValue: item.value / item.weight, // 性价比：每kg值多少钱
    }))
    .sort((a, b) => b.unitValue - a.unitValue); // 性价比高的排前面

  let currentWeight = 0; // 当前已装重量
  let totalValue = 0;    // 当前总价值

  // Step 2: 依次装入，直到背包装满
  for (const item of sortedItems) {
    if (currentWeight >= capacity) break; // 背包已经满了

    // 剩余容量
    const remainingCapacity = capacity - currentWeight;

    // 最多能装多少这个物品
    const weightCanTake = Math.min(item.weight, remainingCapacity);

    // 装入！性价比 × 重量 = 新增价值
    totalValue += weightCanTake * item.unitValue;
    currentWeight += weightCanTake;

    // 调试输出（可选）
    const takeRatio =
      weightCanTake === item.weight
        ? "100%"
        : `${((weightCanTake / item.weight) * 100).toFixed(1)}%`;
    console.log(
      `📦 装入 ${item.id}: ${weightCanTake}/${item.weight}kg (${takeRatio}), ` +
        `累计价值: ${totalValue.toFixed(2)}`
    );
  }

  return totalValue;
}

// ==================== 完整封装版本 ====================

/**
 * 分数背包 —— 封装成类，方便复用
 * 同时返回选择方案（不只是最大值）
 */
class FractionalKnapsack {
  private items: Item[];
  private capacity: number;

  constructor(items: Item[], capacity: number) {
    this.items = items;
    this.capacity = capacity;
  }

  /**
   * 求解分数背包，返回详细选择方案
   */
  solve(): {
    maxValue: number;
    selection: { item: Item; weightTaken: number; valueContributed: number }[];
  } {
    // 按性价比排序
    const sorted = [...this.items].sort(
      (a, b) => b.value / b.weight - a.value / a.weight
    );

    const selection: {
      item: Item;
      weightTaken: number;
      valueContributed: number;
    }[] = [];
    let remainingCapacity = this.capacity;
    let maxValue = 0;

    for (const item of sorted) {
      if (remainingCapacity <= 0) break;

      // 能全装就全装，否则只装剩余容量能装下的部分
      const weightTaken = Math.min(item.weight, remainingCapacity);
      const valueContributed = weightTaken * (item.value / item.weight);

      maxValue += valueContributed;
      remainingCapacity -= weightTaken;

      selection.push({ item, weightTaken, valueContributed });
    }

    return { maxValue, selection };
  }

  /** 打印选择方案 */
  printPlan(): void {
    const { maxValue, selection } = this.solve();
    console.log(`\n背包容量: ${this.capacity}`);
    console.log("=".repeat(50));
    console.log("选择方案:");
    for (const { item, weightTaken, valueContributed } of selection) {
      const pct = ((weightTaken / item.weight) * 100).toFixed(
        weightTaken === item.weight ? 0 : 1
      );
      console.log(
        `  ${item.id}: ${weightTaken}/${item.weight}kg (${pct}%) → ` +
          `贡献价值 ¥${valueContributed.toFixed(2)}`
      );
    }
    console.log("=".repeat(50));
    console.log(`最大价值: ¥${maxValue.toFixed(2)}`);
  }
}

// ==================== 使用示例 ====================

const items: Item[] = [
  { id: "金项链", weight: 1, value: 900 },
  { id: "书本", weight: 3, value: 150 },
  { id: "旧衣服", weight: 8, value: 80 },
  { id: "破鞋子", weight: 5, value: 25 },
  { id: "银戒指", weight: 2, value: 400 },
];

const capacity = 15;

// 简单版
console.log("===== 简单版 =====");
const result = fractionalKnapsack(items, capacity);
console.log(`\n🎯 最大价值: ¥${result.toFixed(2)}`);

// 完整版（带方案）
console.log("\n===== 完整版 =====");
const solver = new FractionalKnapsack(items, capacity);
solver.printPlan();
```

### Python

```python
"""
分数背包 —— Python 实现
核心思路：贪心 + 排序。按性价比从高到低依次装入。
"""

from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class Item:
    """物品：名称、重量、价值"""
    name: str
    weight: float
    value: float

    @property
    def unit_value(self) -> float:
        """性价比：每单位重量值多少钱"""
        return self.value / self.weight


def fractional_knapsack(items: List[Item], capacity: float) -> Tuple[float, List[Tuple[str, float, float]]]:
    """
    分数背包求解

    Args:
        items: 物品列表
        capacity: 背包容量

    Returns:
        (最大价值, 选择方案列表)
        选择方案: [(物品名, 装入重量, 贡献价值), ...]
    """
    # Step 1: 按性价比降序排序（sorted 返回新列表，不修改原列表）
    sorted_items = sorted(items, key=lambda x: x.unit_value, reverse=True)

    remaining_capacity = capacity
    total_value = 0.0
    selection = []

    for item in sorted_items:
        if remaining_capacity <= 0:
            break  # 背包已满

        # 本次最多能装的重量
        weight_taken = min(item.weight, remaining_capacity)
        value_contributed = weight_taken * item.unit_value

        total_value += value_contributed
        remaining_capacity -= weight_taken

        selection.append((item.name, weight_taken, value_contributed))

        print(f"📦 装入 {item.name}: {weight_taken}/{item.weight}kg "
              f"→ 贡献价值 ¥{value_contributed:.2f}")

    return total_value, selection


def fractional_knapsack_v2(items: List[Item], capacity: float) -> dict:
    """
    分数背包 —— 完整版（返回详细方案和数据）
    """
    # 按性价比排序
    sorted_items = sorted(items, key=lambda x: x.value / x.weight, reverse=True)

    remaining = capacity
    max_value = 0.0
    plan = []

    for item in sorted_items:
        if remaining <= 0:
            break

        weight_take = min(item.weight, remaining)
        value_contrib = weight_take * (item.value / item.weight)

        max_value += value_contrib
        remaining -= weight_take

        plan.append({
            "item": item,
            "weight_taken": weight_take,
            "value_contributed": value_contrib,
            "fraction": weight_take / item.weight if item.weight > 0 else 0
        })

    return {
        "max_value": max_value,
        "plan": plan,
        "remaining_capacity": remaining
    }


# ==================== 使用示例 ====================

if __name__ == "__main__":
    items = [
        Item("金项链", weight=1, value=900),
        Item("银戒指", weight=2, value=400),
        Item("书本", weight=3, value=150),
        Item("旧衣服", weight=8, value=80),
        Item("破鞋子", weight=5, value=25),
    ]

    capacity = 15

    print("===== 简单版 =====")
    max_val, selection = fractional_knapsack(items, capacity)
    print(f"\n🎯 最大价值: ¥{max_val:.2f}\n")

    print("===== 完整版 =====")
    result = fractional_knapsack_v2(items, capacity)
    print(f"\n背包容量: {capacity} kg")
    print("=" * 50)
    print("选择方案:")
    for entry in result["plan"]:
        item = entry["item"]
        fraction = entry["fraction"] * 100
        print(f"  {item.name}: {entry['weight_taken']}/{item.weight}kg "
              f"({fraction:.1f}%) → ¥{entry['value_contributed']:.2f}")
    print("=" * 50)
    print(f"最大价值: ¥{result['max_value']:.2f}")
    print(f"剩余容量: {result['remaining_capacity']:.2f} kg")
```

### Go

```go
package knapsack

import (
	"fmt"
	"sort"
)

// Item 物品结构体
type Item struct {
	Name   string
	Weight float64 // 重量（支持小数）
	Value  float64 // 价值
}

// unitValue 性价比：每单位重量值多少钱
func (i Item) unitValue() float64 {
	if i.Weight == 0 {
		return 0
	}
	return i.Value / i.Weight
}

// Selection 选择方案中的一项
type Selection struct {
	Item           Item
	WeightTaken    float64
	ValueContrib   float64
}

// FractionalKnapsack 分数背包求解
// 返回最大价值和一个切片的选择方案
func FractionalKnapsack(items []Item, capacity float64) (float64, []Selection) {
	// Step 1: 按性价比降序排序（Go 的 sort 需要自定义排序逻辑）
	sorted := make([]Item, len(items))
	copy(sorted, items)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].unitValue() > sorted[j].unitValue()
	})

	remaining := capacity
	var totalValue float64
	var selection []Selection

	for _, item := range sorted {
		if remaining <= 0 {
			break // 背包已满
		}

		// 本次最多能装的重量
		weightTaken := item.Weight
		if weightTaken > remaining {
			weightTaken = remaining
		}

		valueContrib := weightTaken * item.unitValue()
		totalValue += valueContrib
		remaining -= weightTaken

		selection = append(selection, Selection{
			Item:         item,
			WeightTaken:  weightTaken,
			ValueContrib: valueContrib,
		})

		fmt.Printf("📦 装入 %s: %.2f/%.2fkg → 贡献价值 ¥%.2f\n",
			item.Name, weightTaken, item.Weight, valueContrib)
	}

	return totalValue, selection
}

// PrintPlan 打印完整选择方案
func PrintPlan(items []Item, capacity float64) {
	maxValue, selection := FractionalKnapsack(items, capacity)

	fmt.Printf("\n背包容量: %.2f kg\n", capacity)
	fmt.Println("=" + strings.Repeat("=", 48))
	fmt.Println("选择方案:")

	for _, s := range selection {
		pct := (s.WeightTaken / s.Item.Weight) * 100
		fmt.Printf("  %s: %.2f/%.2fkg (%.1f%%) → ¥%.2f\n",
			s.Item.Name, s.WeightTaken, s.Item.Weight, pct, s.ValueContrib)
	}

	fmt.Println("=" + strings.Repeat("=", 48))
	fmt.Printf("🎯 最大价值: ¥%.2f\n", maxValue)
}
```

### Java

```java
import java.util.*;
import java.util.stream.Collectors;

/**
 * 分数背包 —— Java 实现
 */
public class FractionalKnapsack {

    /** 物品结构 */
    static class Item {
        String name;
        double weight;  // 重量
        double value;   // 价值

        Item(String name, double weight, double value) {
            this.name = name;
            this.weight = weight;
            this.value = value;
        }

        /** 性价比 */
        double unitValue() {
            return weight == 0 ? 0 : value / weight;
        }

        @Override
        public String toString() {
            return String.format("%s(%.2fkg, ¥%.2f, %.2f/kg)",
                    name, weight, value, unitValue());
        }
    }

    /** 选择方案中的一项 */
    static class Selection {
        Item item;
        double weightTaken;
        double valueContributed;

        Selection(Item item, double weightTaken, double valueContributed) {
            this.item = item;
            this.weightTaken = weightTaken;
            this.valueContributed = valueContributed;
        }
    }

    /**
     * 分数背包求解
     *
     * 核心思路：按性价比排序后依次装入
     * 时间复杂度：O(n log n) —— 主要花在排序上
     * 空间复杂度：O(n) —— 存储排序后的结果
     */
    public static Result solve(List<Item> items, double capacity) {
        // Step 1: 按性价比降序排序（Java 8 stream + comparator）
        List<Item> sorted = items.stream()
                .sorted(Comparator.comparingDouble(Item::unitValue).reversed())
                .collect(Collectors.toList());

        double remaining = capacity;
        double totalValue = 0.0;
        List<Selection> selection = new ArrayList<>();

        // Step 2: 依次装入
        for (Item item : sorted) {
            if (remaining <= 0) break;

            double weightTaken = Math.min(item.weight, remaining);
            double valueContrib = weightTaken * item.unitValue();

            totalValue += valueContrib;
            remaining -= weightTaken;

            selection.add(new Selection(item, weightTaken, valueContrib));

            System.out.printf("📦 装入 %s: %.2f/%.2fkg → 贡献价值 ¥%.2f%n",
                    item.name, weightTaken, item.weight, valueContrib);
        }

        return new Result(totalValue, selection);
    }

    /** 结果封装 */
    static class Result {
        double maxValue;
        List<Selection> selection;

        Result(double maxValue, List<Selection> selection) {
            this.maxValue = maxValue;
            this.selection = selection;
        }
    }

    // ==================== 使用示例 ====================

    public static void main(String[] args) {
        List<Item> items = Arrays.asList(
                new Item("金项链", 1, 900),
                new Item("银戒指", 2, 400),
                new Item("书本", 3, 150),
                new Item("旧衣服", 8, 80),
                new Item("破鞋子", 5, 25)
        );

        double capacity = 15;

        System.out.println("===== 分数背包求解 =====");
        Result result = solve(items, capacity);

        System.out.println();
        System.out.println("=".repeat(50));
        System.out.println("选择方案:");
        for (Selection s : result.selection) {
            double pct = (s.weightTaken / s.item.weight) * 100;
            System.out.printf("  %s: %.2f/%.2fkg (%.1f%%) → ¥%.2f%n",
                    s.item.name, s.weightTaken, s.item.weight, pct, s.valueContributed);
        }
        System.out.println("=".repeat(50));
        System.out.printf("🎯 最大价值: ¥%.2f%n", result.maxValue);
    }
}
```

## LeetCode 实战

分数背包虽然是"贪心类"问题，但在 LeetCode 上直接以背包形式出现的题目不多。更多是在资源分配、切割问题的变体中出现。以下是一道经典变形：

### LeetCode 870. 优势洗牌（田忌赛马）

这道题虽然名字不叫背包，但思路非常像分数背包的贪心思想：**用最小的代价换取最大的优势**。

```typescript
/**
 * LeetCode 870: 优势洗牌
 *
 * 给定两个等长数组 nums1 和 nums2，用 nums1 的排列去"赢" nums2，
 * 返回一个 nums1 的排列，使得对应位置赢得的次数最多。
 *
 * 贪心思路（类似分数背包的性价比思维）：
 * - 最大的 nums1 数字去赢最大的 nums2 数字（如果能赢）
 * - 如果赢不了，就用最小的 nums1 数字去"送人头"
 *
 * 田忌赛马思想：让劣马去消耗敌方的上等马，我方上等马赢中等马
 */
function advantageCount(nums1: number[], nums2: number[]): number[] {
  const n = nums1.length;
  const indexedNums2 = nums2.map((val, idx) => ({ val, idx }));

  // 按 nums2 的值降序排列，记录原始位置
  indexedNums2.sort((a, b) => b.val - a.val);

  // nums1 升序排列（从小到大拿）
  const sortedNums1 = [...nums1].sort((a, b) => a - b);

  const result: number[] = new Array(n);
  let left = 0;
  let right = n - 1; // 最大的 nums1

  for (const { val, idx } of indexedNums2) {
    // 用最大的 nums1 去pk当前的 nums2[val]
    if (sortedNums1[right] > val) {
      result[idx] = sortedNums1[right];
      right--;
    } else {
      // 赢不了，用最小的去送人头
      result[idx] = sortedNums1[left];
      left++;
    }
  }

  return result;
}

// 测试
console.log(advantageCount([2, 7, 11, 4], [1, 10, 5, 8]));
// 输出: [11, 4, 7, 2]  (优势次数: 2/4)
// nums1[11] > nums2[10] ✓
```

## 复杂度分析

|| 指标 | 复杂度 | 说明 |
|------|------|--------|
| 时间 | O(n log n) | 排序是主导因素，遍历是 O(n) |
| 空间 | O(n) | 排序需要额外空间（或原地排序 O(1)）|

- **时间 O(n log n)**：相比 0-1 背包的 O(nW) 要好很多，尤其当 W（容量）很大时优势明显。
- **空间 O(n)**：只需要存储排序后的数组，或者原地排序可以做到 O(1) 额外空间。
- 分数背包能这么快，正是因为**贪心选择 + 物品可分割**这两个条件同时满足。

## 业务场景

### 1. 投资组合优化

你手里有 10 万块要投资，有多个理财产品可选（年化收益率不同，起投金额也不同）。在允许"部分投资"的前提下，用分数背包的思路，按年化收益率排序依次投入，最优解就是把最高收益的产品买满，然后次高的，直到 10 万块全投出去。

### 2. 货车装载优化

物流公司的货车载重有限，有多个订单的货物要运。每个订单重量不同、运费不同（利润不同）。在允许只运部分订单的前提下（可以拆分订单），按"每吨运费"从高到低运，最大化运输利润。这就是分数背包的直接应用。

### 3. 切割原材料问题

木材厂有一根 10 米的原材料，客户需要多种规格的木材（长度不同、价格不同）。在允许切割、拼凑的前提下，按"每米价格"从高到低切，先满足高价的客户需求，剩下的材料再给低价客户。这本质上就是分数背包的思路。

### 4. 带宽/时间片分配

CDN 服务器有 100 Gbps 带宽要分配给多个客户，每个客户的付费不同、需求带宽不同。在允许部分满足需求的情况下，按"每单位带宽的付费"从高到低分配，先满足大客户。这个思路和分数背包完全一致。

## 小结

分数背包虽然是个经典老题，但它的核心思想——**按性价比排序依次选择**——在实际工作中的应用非常广泛，从资源分配到投资组合，都能看到它的影子：

- ✅ **核心策略**：按单位价值（性价比）降序排序，依次装入
- ✅ **时间复杂度**：O(n log n)，瓶颈在排序
- ✅ **贪心正确性**：可分割性保证了交换论证成立
- ❌ **注意区分**：0-1 背包需要 DP，分数背包才用贪心

下次面试遇到类似"有限资源怎么分配最划算"的问题，先问一句：**能不能掰开/分割？** 如果能，分数背包的贪心思路就是你最好的武器 🎯
