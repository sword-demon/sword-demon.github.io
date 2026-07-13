---
title: Fisher-Yates 洗牌算法
description: Fisher-Yates 洗牌算法：教你写出真正公平的随机打乱，四语言实战实现
date: 2026-07-06 09:00:00
categories:
  - Algorithm
tags:
  - shuffle
  - random
  - fisher-yates
  - interview
sidebarSort: 58
---

# Fisher-Yates 洗牌算法

你有没有想过，音乐播放器的"随机播放"是怎么实现的？每次切歌，是真的随机吗？抽奖系统怎么保证每个人被抽中的概率是相等的？

很多人会这么写洗牌代码：

```typescript
// ❌ 错误示范：看起来对，实际上有问题
function shuffle(arr: number[]): number[] {
    return arr.sort(() => Math.random() - 0.5);
}
```

看起来挺对的，用 `sort` 的比较函数返回随机值。但实际上，**这种写法是不公平的**。具体原因我们后面细说。

今天我们来聊聊真正正确的洗牌算法 —— **Fisher-Yates Shuffle**，也叫 **Knuth Shuffle**。这可是面试官问"如何随机打乱一个数组"时的标准答案。

## 为什么需要洗牌算法？

先问自己一个问题：**什么是"公平"的洗牌？**

假设我们有一副牌 n 张，公平的洗牌意味着这 n! 种排列，每一种出现的概率都应该相等，都是 1/n!。

听起来很简单对吧？但实际操作起来很容易出错。

### 常见错误写法

**错误 1：随机交换位置**

```typescript
function shuffleWrong(arr: number[]): number[] {
    for (let i = 0; i < arr.length; i++) {
        // 随机选一个位置交换
        const j = Math.floor(Math.random() * arr.length);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
```

这个看起来也没毛病，但实际上有**偏差**。为什么？因为每次交换可能把已经排好序的元素又打乱了。

**错误 2：sort + random**

```typescript
function shuffleWrong2(arr: number[]): number[] {
    return [...arr].sort(() => Math.random() - 0.5);
}
```

这是最常见的错误写法。问题在于：`Array.sort()` 在大多数实现中使用的是**快速排序或其变体**，而不是基于比较的归并排序。快速排序是**不稳定**的，而且当元素相同时，比较函数返回 0 会导致这些元素之间的相对顺序不可预测。更重要的是，`sort` 方法并不能保证 n! 种排列的概率相等。

实际上，由于排序算法本身的特点，这种方法会让某些排列出现的概率明显高于其他排列。

**错误 3：Math.random() 概率不均匀**

有些同学会自己实现随机选择，但如果 `Math.random()` 的范围设置不对，也会导致概率不均匀。

## Fisher-Yates 算法原理

Fisher-Yates 洗牌算法的核心思想非常优雅：**从后往前，每次从未处理的元素中随机选一个，与当前位置交换**。

```
原始数组: [1, 2, 3, 4, 5]

步骤 1: 从位置 0-4 中随机选一个，与位置 4 交换
        假设选到 2 → 交换 [4] 和 [1]
        结果: [1, 4, 3, 2, 5]
        位置 4 已确定，不再参与后续操作

步骤 2: 从位置 0-3 中随机选一个，与位置 3 交换
        假设选到 1 → 交换 [3] 和 [0]
        结果: [2, 4, 3, 1, 5]
        位置 3 已确定，不再参与后续操作

步骤 3: 从位置 0-2 中随机选一个，与位置 2 交换
        假设选到 3 → 交换 [2] 和 [2]
        结果: [2, 4, 3, 1, 5]
        位置 2 已确定

步骤 4: 从位置 0-1 中随机选一个，与位置 1 交换
        假设选到 4 → 交换 [1] 和 [1]
        结果: [2, 4, 3, 1, 5]
        位置 1 已确定

最终结果: [2, 4, 3, 1, 5]（随机排列）
```

### 为什么这是公平的？

关键在于**概率分析**。对于 n 个元素的数组：

- 第 n 个位置被选中某特定元素的概率 = 1/n
- 第 n-1 个位置被选中剩余某特定元素的概率 = 1/(n-1)
- ...

由于每一步的选择都是独立的（或者更准确地说，是条件独立的），最终每种排列出现的概率都是 1/n!。

**核心不变量**：从未处理的部分中，**等概率**选择一个元素放到当前位置。

## 代码实现

### TypeScript

```typescript
/**
 * Fisher-Yates 洗牌算法 —— TypeScript 实现
 *
 * 核心思想：从后往前遍历，每次从未处理的元素中随机选一个与当前位置交换
 * 时间复杂度: O(n)
 * 空间复杂度: O(1) —— 原地洗牌
 */
function fisherYatesShuffle<T>(arr: T[]): T[] {
    const result = [...arr]; // 复制一份，避免修改原数组
    const n = result.length;

    // 从后往前遍历
    for (let i = n - 1; i > 0; i--) {
        // 在 [0, i] 范围内等概率选择一个位置
        // 为什么是 [0, i] 而不是 [0, n-1]？
        // 因为 i+1 到 n-1 的位置已经确定过了，不能再动
        const j = Math.floor(Math.random() * (i + 1));

        // 交换 result[i] 和 result[j]
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

// === 验证公平性 ===
function testFairness() {
    const arr = [1, 2, 3, 4];
    const count: Record<string, number> = {};
    const total = 100000;

    for (let i = 0; i < total; i++) {
        const shuffled = fisherYatesShuffle(arr);
        const key = shuffled.join(',');
        count[key] = (count[key] || 0) + 1;
    }

    console.log('各排列出现次数（理论上应该都是 100000/24 ≈ 4167）：');
    Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .forEach(([key, cnt]) => {
            const expected = total / 24;
            const deviation = ((cnt - expected) / expected * 100).toFixed(2);
            console.log(`  ${key}: ${cnt} (偏差 ${deviation}%)`);
        });
}

// 使用示例
console.log(fisherYatesShuffle([1, 2, 3, 4, 5]));
// 输出类似：[3, 1, 5, 2, 4]（每次运行结果不同）

testFairness();
```

### Go

```go
package shuffle

import (
	"math/rand"
	"time"
)

/**
 * Fisher-Yates 洗牌算法 —— Go 实现
 *
 * 为什么用 rand.Intn(i+1) 而不是 rand.Intn(n)？
 * 因为 i+1 到 n-1 的位置已经处理过了，这些元素已经被"固定"了
 * 剩余可选的只有 [0, i] 范围内的元素
 */
func FisherYatesShuffle[T any](arr []T) []T {
	// 复制切片，避免修改原切片
	result := make([]T, len(arr))
	copy(result, arr)

	// 初始化随机数生成器（实际项目中最好全局初始化一次）
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	// 从后往前遍历
	for i := len(result) - 1; i > 0; i-- {
		// 在 [0, i] 范围内等概率选择
		j := r.Intn(i + 1)
		// 交换
		result[i], result[j] = result[j], result[i]
	}

	return result
}

// IntSlice 版本 —— 针对 []int 的便捷方法
func ShuffleInt(arr []int) []int {
	return FisherYatesShuffle(arr)
}

// StringSlice 版本 —— 针对 []string 的便捷方法
func ShuffleString(arr []string) []string {
	return FisherYatesShuffle(arr)
}

// 测试公平性
func TestFairness() {
	arr := []int{1, 2, 3, 4}
	count := make(map[string]int)
	total := 100000

	for i := 0; i < total; i++ {
		shuffled := FisherYatesShuffle(arr)
		key := ""
		for _, v := range shuffled {
			if key != "" {
				key += ","
			}
			key += string(rune('0' + v))
		}
		count[key]++
	}

	expected := float64(total) / 24
	println("各排列出现次数（理论上应该都是", int(expected), "）：")
	for key, cnt := range count {
		deviation := float64(cnt)/expected*100 - 100
		println(" ", key, ":", cnt, "(偏差", deviation, "%)")
	}
}
```

### Java

```java
import java.util.*;

/**
 * Fisher-Yates 洗牌算法 —— Java 实现
 */
public class FisherYatesShuffle {

    /**
     * 对任意类型数组进行洗牌
     * 时间复杂度: O(n)
     * 空间复杂度: O(1) —— 原地洗牌
     */
    public static <T> List<T> shuffle(T[] arr) {
        List<T> result = new ArrayList<>(Arrays.asList(arr));
        Random random = new Random();

        // 从后往前遍历
        for (int i = result.size() - 1; i > 0; i--) {
            // 在 [0, i] 范围内等概率选择
            int j = random.nextInt(i + 1);

            // 交换
            T temp = result.get(i);
            result.set(i, result.get(j));
            result.set(j, temp);
        }

        return result;
    }

    /**
     * 对 int 数组进行洗牌（使用 Collections.shuffle）
     * 这是 Java 标准库的实现，底层用的就是 Fisher-Yates
     */
    public static void shuffleInPlace(int[] arr) {
        Random random = new Random();

        for (int i = arr.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);

            // 交换
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    /**
     * 验证公平性
     */
    public static void testFairness() {
        Integer[] arr = {1, 2, 3, 4};
        Map<String, Integer> count = new HashMap<>();
        int total = 100000;

        for (int i = 0; i < total; i++) {
            List<Integer> shuffled = shuffle(arr);
            String key = shuffled.toString();
            count.put(key, count.getOrDefault(key, 0) + 1);
        }

        double expected = total / 24.0;
        System.out.println("各排列出现次数（理论上应该都是 " + (int) expected + "）：");

        count.entrySet().stream()
            .sorted((a, b) -> b.getValue() - a.getValue())
            .forEach(e -> {
                double deviation = (e.getValue() / expected - 1) * 100;
                System.out.printf("  %s: %d (偏差 %.2f%%)%n",
                    e.getKey(), e.getValue(), deviation);
            });
    }

    public static void main(String[] args) {
        // 基本使用
        String[] arr = {"A", "B", "C", "D", "E"};
        List<String> shuffled = shuffle(arr);
        System.out.println("洗牌结果: " + shuffled);

        // 测试公平性
        testFairness();
    }
}
```

### Python

```python
import random
from typing import TypeVar, List

T = TypeVar('T')


def fisher_yates_shuffle(arr: List[T]) -> List[T]:
    """Fisher-Yates 洗牌算法 —— Python 实现

    核心思想：从后往前遍历，每次从未处理的元素中随机选一个与当前位置交换
    时间复杂度: O(n)
    空间复杂度: O(1) —— 原地洗牌
    """
    result = arr.copy()  # 复制一份，避免修改原数组
    n = len(result)

    # 从后往前遍历
    for i in range(n - 1, 0, -1):
        # 在 [0, i] 范围内等概率选择一个位置
        j = random.randint(0, i)

        # 交换
        result[i], result[j] = result[j], result[i]

    return result


def test_fairness():
    """验证 Fisher-Yates 的公平性"""
    arr = [1, 2, 3, 4]
    count = {}
    total = 100000

    for _ in range(total):
        shuffled = fisher_yates_shuffle(arr)
        key = ','.join(map(str, shuffled))
        count[key] = count.get(key, 0) + 1

    expected = total / 24
    print(f'各排列出现次数（理论上应该都是 {int(expected)}）：')

    for key, cnt in sorted(count.items(), key=lambda x: -x[1]):
        deviation = (cnt - expected) / expected * 100
        print(f'  {key}: {cnt} (偏差 {deviation:+.2f}%)')


# === Python 标准库的做法 ===
def shuffle_with_builtin(arr: List[T]) -> List[T]:
    """Python 的 random.shuffle() 底层就是 Fisher-Yates"""
    result = arr.copy()
    random.shuffle(result)  # 原地洗牌
    return result


if __name__ == '__main__':
    # 基本使用
    arr = [1, 2, 3, 4, 5]
    print(f'原数组: {arr}')
    print(f'洗牌结果: {fisher_yates_shuffle(arr)}')
    print(f'标准库: {random.sample(arr, len(arr))}')

    # 测试公平性
    test_fairness()

    # 抽奖模拟
    participants = ['张三', '李四', '王五', '赵六', '钱七']
    print(f'\n抽奖环节！参与者: {participants}')
    winner = random.choice(fisher_yates_shuffle(participants))
    print(f'恭喜 {winner} 中奖！🎉')
```

## 变体：Inside-Out 洗牌

有时候我们不想修改原数组，而是创建一个新数组。可以用 **Inside-Out** 变体：

```typescript
/**
 * Inside-Out 洗牌 —— 原地洗牌的逆过程
 *
 * 适用于需要同时保留原数组顺序的场景
 * 比如：需要原始数据用于其他目的，同时需要洗牌后的副本
 */
function insideOutShuffle<T>(arr: T[]): T[] {
    const result: T[] = new Array(arr.length);
    const n = arr.length;

    for (let i = 0; i < n; i++) {
        // j 是在 [0, i] 范围内等概率选择
        const j = Math.floor(Math.random() * (i + 1));

        if (j === i) {
            // 如果 j == i，直接复制
            result[i] = arr[i];
        } else {
            // j < i 的情况
            result[i] = result[j];  // 把 result[j] 移到 i
            result[j] = arr[i];     // 把 arr[i] 放到 j
        }
    }

    return result;
}
```

这个算法的特点是：**前 i 个元素是原数组前 i 个元素的随机排列**。

## 算法可视化

```
原数组: [1, 2, 3, 4, 5]

┌─────────────────────────────────────────────────────┐
│  Step 1: i = 4, 从 [0,4] 选 j = 1                   │
│                                                     │
│  [1, 2, 3, 4, 5]  ← 选 j=1                         │
│       ↑                                            │
│  交换 [4] 和 [2]                                   │
│  [1, 4, 3, 2, 5]  ← 位置 4 已确定                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Step 2: i = 3, 从 [0,3] 选 j = 3                   │
│                                                     │
│  [1, 4, 3, 2, 5]  ← 选 j=3（自己）                 │
│          ↑                                         │
│  交换 [3] 和 [3]（不变）                            │
│  [1, 4, 3, 2, 5]  ← 位置 3 已确定                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Step 3: i = 2, 从 [0,2] 选 j = 0                   │
│                                                     │
│  [1, 4, 3, 2, 5]  ← 选 j=0                         │
│  ↑                                                 │
│  交换 [3] 和 [1]                                   │
│  [3, 4, 1, 2, 5]  ← 位置 2 已确定                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Step 4: i = 1, 从 [0,1] 选 j = 0                   │
│                                                     │
│  [3, 4, 1, 2, 5]  ← 选 j=0                         │
│  ↑                                                 │
│  交换 [4] 和 [3]                                   │
│  [4, 3, 1, 2, 5]  ← 位置 1 已确定                   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  最终结果: [4, 3, 1, 2, 5]                          │
│                                                     │
│  特点：位置 0-3 全部随机，位置 4 固定为之前的随机    │
└─────────────────────────────────────────────────────┘
```

## 复杂度分析

| 指标 | 复杂度 | 说明 |
|------|--------|------|
| 时间复杂度 | O(n) | 遍历一次数组，每次交换 O(1) |
| 空间复杂度 | O(1) | 原地洗牌，只需要常数个临时变量 |
| 随机数调用次数 | n-1 次 | 第 i 次循环调用一次 `random()` |

## 业务场景

### 1. 音乐播放器随机播放 🎵

很多音乐 App 的"随机播放"功能底层用的就是 Fisher-Yates：

```typescript
function shufflePlaylist(tracks: Track[]): Track[] {
    // 复制一份，避免修改原始播放列表
    const shuffled = fisherYatesShuffle(tracks);

    // 移除当前正在播放的歌曲，插入到随机位置
    const currentIndex = tracks.findIndex(t => t.id === currentTrackId);
    if (currentIndex !== -1) {
        shuffled.splice(currentIndex, 1);
        const insertPos = Math.floor(Math.random() * shuffled.length);
        shuffled.splice(insertPos, 0, currentTrack);
    }

    return shuffled;
}
```

### 2. 在线抽奖系统 🎰

```typescript
interface PrizeConfig {
    name: string;
    count: number;
}

function drawPrizes(participants: string[], prizes: PrizeConfig[]): Map<string, string[]> {
    const shuffled = fisherYatesShuffle(participants);
    const winners = new Map<string, string[]>();

    let idx = 0;
    for (const prize of prizes) {
        const prizeWinners = shuffled.slice(idx, idx + prize.count);
        winners.set(prize.name, prizeWinners);
        idx += prize.count;
    }

    return winners;
}

// 使用示例
const participants = ['用户A', '用户B', '用户C', ...];
const prizes = [
    { name: '一等奖', count: 1 },
    { name: '二等奖', count: 5 },
    { name: '三等奖', count: 10 },
];

const winners = drawPrizes(participants, prizes);
console.log(winners);
```

### 3. 随机抽样（不放回）

之前在 [水塘抽样](./reservoir-sampling.md) 里讲过放回抽样，不放回抽样直接用 Fisher-Yates 更简单：

```typescript
/**
 * 从数组中随机抽取 k 个不重复的元素
 * 时间复杂度: O(k)
 */
function sampleWithoutReplacement<T>(arr: T[], k: number): T[] {
    const result: T[] = [];
    const pool = [...arr];  // 复制一份

    for (let i = pool.length - 1; i >= 0 && result.length < k; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        result.push(pool[j]);
        pool[j] = pool[i];  // 用最后一个元素"覆盖"被选中的位置
        pool.pop();         // 删除最后一个元素
    }

    return result;
}
```

### 4. 洗牌做数据增强（机器学习）

训练模型时经常需要数据增强：

```python
def data_augmentation(images, labels, shuffle_ratio=0.5):
    """随机打乱部分数据"""
    combined = list(zip(images, labels))
    
    # Fisher-Yates 洗牌
    for i in range(len(combined) - 1, 0, -1):
        j = random.randint(0, i)
        combined[i], combined[j] = combined[j], combined[i]
    
    # 随机决定哪些需要打乱
    for i in range(len(combined)):
        if random.random() < shuffle_ratio:
            # 交换图片位置
            combined[i] = swap_augmentation(combined[i])
    
    return zip(*combined)
```

## 小结

Fisher-Yates 洗牌算法的精髓就一句话：**从未处理的元素中，等概率选一个放到当前位置**。

记住这几个要点：

| 要点 | 说明 |
|------|------|
| 遍历方向 | 从后往前（也可以从前往后，原理一样） |
| 随机范围 | `[0, i]`（i 是当前遍历的位置） |
| 核心不变性 | 已处理的位置不再变动 |
| 时间复杂度 | O(n)，原地洗牌 |

以后面试官问你"如何随机打乱一个数组"，直接给出 Fisher-Yates，稳稳的 👍

> 💡 **提示**：如果你在项目里需要洗牌，直接用各语言的标准库就行：
> - TypeScript/JavaScript: `array.sort(() => Math.random() - 0.5)` 是**错的**，用 Fisher-Yates
> - Python: `random.shuffle(arr)` 底层就是 Fisher-Yates ✅
> - Java: `Collections.shuffle(list)` 底层也是 Fisher-Yates ✅
> - Go: 需要自己实现，或者用 `math/rand.Shuffle()`（Go 1.10+）
