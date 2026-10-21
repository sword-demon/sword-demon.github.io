---
title: 置换与轮换（Permutation Cycles）
description: 用 O(1) 额外空间原地还原数组 —— 置换循环思想与工程实战
date: 2026-10-19 09:01:25
categories:
  - Algorithm
tags:
  - permutation
  - cycle-sort
  - in-place
  - interview
sidebarSort: 108
---

# 置换与轮换（Permutation Cycles）

你有没有遇到过这种需求：给你一个数组 `nums = [3, 1, 4, 2, 0]`，要求你把它"原地"还原成 `[0, 1, 2, 3, 4]`，**不能用额外数组**？

又或者：你在做配置中心的版本号轮换，要把一批服务实例按权重重新打散，但又不允许引入新的数据结构。再比如：解密一份被"打乱顺序"加密过的文件，解密过程必须做到**零拷贝**……

这些场景的共同点是什么？都是**置换（Permutation）**问题。看起来简单，做起来却容易写错 —— 不信你试试不用额外空间、只用 O(1) 内存把 `[3, 1, 4, 2, 0]` 还原成 `[0, 1, 2, 3, 4]`，很多人第一次写都会写出 bug 来。

今天我们就来扒一扒这个看似冷门、实际超高频的算法 —— **置换循环（Cycle Decomposition / Cycle Sort）**。掌握它之后，你看待"数组原地重排"类问题会有一种全新的视角 ✨。

## 为什么需要置换循环？

### 一个真实的业务场景

假设你做了个配置中心，里面维护了一份服务列表，每个服务有一个权重。某天老板说："按权重轮换一下，让流量更均匀。"

最直觉的写法：

```typescript
const newOrder = oldOrder.slice().sort((a, b) => b.weight - a.weight);
```

但这样会引入一个 O(n) 的额外数组。在百万级服务列表下，内存瞬间吃紧 💸。

能不能 **O(1) 空间** 做到同样的事？置换循环就是答案。

### LeetCode 上的高频面试题

- [LeetCode 765. 情侣牵手](https://leetcode.cn/problems/couples-holding-hands/) —— 经典置换循环题
- [LeetCode 60. 排列序列](https://leetcode.cn/problems/permutation-sequence/) —— 第 k 个排列
- [LeetCode 186. 反转字符串中的单词 II](https://leetcode.cn/problems/reverse-words-in-a-string-ii/) —— 局部置换循环
- [LeetCode 396. 旋转函数](https://leetcode.cn/problems/rotate-function/) —— 环形置换

可以说，**凡是要求"原地" + "O(1) 空间"的数组题，背后几乎都有置换循环的影子**。

## 原理拆解

### 什么是置换？

数学上，**置换（Permutation）** 就是把 n 个元素重新打乱顺序的一种映射。每个置换都可以拆成若干个**不相交的轮换（Cycle）**。

举个例子，假设你有一个数组：

```
原数组:   [A, B, C, D, E]
置换后:   [B, A, D, C, E]   ← A↔B 互换，C↔D 互换，E 不动
```

这个置换可以拆成 3 个轮换：
- (A → B → A)：A 和 B 互换，构成一个长度为 2 的轮换
- (C → D → C)：C 和 D 互换，构成一个长度为 2 的轮换
- (E → E)：E 不动，是长度为 1 的"平凡轮换"

任何置换都可以这样拆 —— 这是群论（Group Theory）里的基本定理。**Cycle Decomposition Theorem** 保证了这一点。

### 什么是置换循环（Cycle Sort）？

Cycle Sort 就是利用"每个元素最终都会回到它应该在的位置"这个事实，沿着轮换一步步走，把元素一个个挪到正确位置。

举个具体例子：要把 `[3, 1, 4, 2, 0]` 还原成 `[0, 1, 2, 3, 4]`：

```
原数组:  [3, 1, 4, 2, 0]
位置:     0  1  2  3  4

位置 0 应该有 0，但现在放的是 3
→ 找 3 应该去的位置：位置 3
→ 把 3 放到位置 3，但是位置 3 现在放的是 2
→ 把 2 放到位置 2，但是位置 2 现在放的是 4
→ 把 4 放到位置 4，但是位置 4 现在放的是 0
→ 把 0 放到位置 0，闭合！

整个过程: 0 → 3 → 2 → 4 → 0，构成一个长度为 4 的轮换
```

走完一轮后，`[3, 1, 4, 2, 0]` 变成 `[0, 1, 2, 3, 4]` ✅。**只用了 1 个临时变量**，时间 O(n)，完美 ✨。

### 图解轮换过程

```
初始状态:
位置:    0    1    2    3    4
内容:   [3]  [1]  [4]  [2]  [0]

第 1 步: 当前处理位置 0
  位置 0 应该是 0，但放的是 3
  → 把 3 放到它应该在的位置（位置 3）
  → 位置 3 现在空出来了，先把它的旧值（2）存起来

位置:    0    1    2    3    4
内容:   [3]  [1]  [4]  [?]  [0]
                       ↑
                    暂存 2

第 2 步: 当前待处理元素是 2
  2 应该去位置 2
  → 把 2 放到位置 2
  → 位置 2 的旧值（4）暂存起来

位置:    0    1    2    3    4
内容:   [3]  [1]  [?]  [?]  [0]
                    ↑
                 暂存 4

第 3 步: 当前待处理元素是 4
  4 应该去位置 4
  → 把 4 放到位置 4
  → 位置 4 的旧值（0）暂存起来

位置:    0    1    2    3    4
内容:   [3]  [1]  [?]  [?]  [?]
                                ↑
                             暂存 0

第 4 步: 当前待处理元素是 0
  0 应该去位置 0
  → 把 0 放到位置 0
  → 位置 0 的旧值（3）暂存起来
  → 但等等，3 是我们最开始放进去的，说明这个轮换闭合了！

位置:    0    1    2    3    4
内容:   [0]  [1]  [4]  [2]  [3]

第 5 步: 回到位置 0，发现已经处理过，继续往下走
  位置 1 已经是 1，跳过
  位置 2 已经是 4，正确，跳过
  位置 3 已经是 2，正确，跳过
  位置 4 已经是 3，正确，跳过

最终结果: [0, 1, 2, 3, 4] ✅
```

整个过程只用了 1 个临时变量，这就是 Cycle Sort 的精髓。

### 为什么每个轮换最多访问一次？

这是 Cycle Sort 最巧妙的地方。**每个位置在每个轮换中最多被访问一次**，所以总的时间复杂度是 O(n)。

直觉理解：每当你把一个元素放到正确位置，这个位置就被"锁定了"，永远不会再被改动（除非这个位置本身就在这个轮换里，那就走一圈回来又处理一次 —— 但整体还是每个元素只挪动一次）。

### 一个更复杂的例子

数组 `[2, 0, 1, 4, 5, 3]` 还原成 `[0, 1, 2, 3, 4, 5]`：

```
原数组:  [2, 0, 1, 4, 5, 3]

轮换 1（从位置 0 开始）:
  0 → 2 → 1 → 0（闭合）
  涉及位置: 0, 2, 1
  涉及元素: 0, 1, 2

轮换 2（从位置 3 开始，因为 3 还没访问过）:
  3 → 4 → 5 → 3（闭合）
  涉及位置: 3, 4, 5
  涉及元素: 3, 4, 5

总共 2 个轮换，每个轮换最多访问 3 个位置。
```

## 代码实现

### TypeScript

```typescript
/**
 * 置换循环 —— TypeScript 实现
 * 核心思路：沿着每个轮换走一圈，把元素放到它该在的位置
 * 时间复杂度：O(n)
 * 空间复杂度：O(1)
 */

/**
 * 还原一个被打乱的 0~n-1 排列
 * 例如：[3, 1, 4, 2, 0] → [0, 1, 2, 3, 4]
 */
function restorePermutation(nums: number[]): void {
  const n = nums.length;

  for (let i = 0; i < n; i++) {
    // 如果当前位置的元素已经在正确位置，就跳过
    // 比如 nums[1] = 1，已经是最终状态
    while (nums[i] !== i) {
      // 把当前位置的元素 nums[i] 放到它应该在的位置
      // 注意：这里一定要用临时变量，不能原地交换！
      // 否则会把还没处理的元素"提前"处理掉，破坏轮换结构
      const targetIdx = nums[i];
      const temp = nums[targetIdx];
      nums[targetIdx] = nums[i];
      nums[i] = temp;
      // 现在 nums[targetIdx] 已经是正确的元素了
      // nums[i] 里装的是 temp，需要继续处理
    }
  }
}

// 测试
const nums = [3, 1, 4, 2, 0];
restorePermutation(nums);
console.log(nums); // [0, 1, 2, 3, 4] ✅

/**
 * 带访问标记的版本 —— 防止死循环
 *
 * 为什么需要标记？
 * 上面那个写法能正常工作的前提是：nums[i] !== i 时一定会发生交换。
 * 但如果数组里有重复元素或者范围不对，就可能死循环。
 *
 * 技巧：用符号位（正负）作为"是否访问过"的标记
 */
function restorePermutationSafe(nums: number[]): void {
  const n = nums.length;

  for (let i = 0; i < n; i++) {
    // 跳过已经处理过的位置（用符号位标记）
    while (nums[i] !== i && nums[i] >= 0) {
      // 先把当前位置的元素 nums[i] 的"目的地"标记为已访问（变成负数）
      const targetIdx = nums[i];
      nums[i] = nums[targetIdx]; // 把目标位置的元素搬过来
      nums[targetIdx] = -targetIdx - 1; // 用 -idx-1 表示"idx 已经处理过"
    }
    // 如果当前位置存的是负数（说明之前已经处理过），还原为正确值
    if (nums[i] < 0) {
      nums[i] = -nums[i] - 1;
    }
  }
}

/**
 * 更通用的版本：根据给定的置换规则还原
 *
 * 例如：perm = [3, 1, 4, 2, 0] 意味着
 * 新位置 i 的元素 = 原位置 perm[i] 的元素
 */
function applyPermutation(arr: number[], perm: number[]): void {
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    // 从位置 i 出发，沿着轮换走一圈
    let next = perm[i];
    while (next !== i) {
      // 交换 arr[i] 和 arr[next]
      const temp = arr[i];
      arr[i] = arr[next];
      arr[next] = temp;
      // 更新 next，继续沿着置换走下去
      [arr[i], arr[next]] = [arr[next], arr[i]];
      next = perm[next];
    }
  }
}
```

### Python

```python
def restore_permutation(nums: list[int]) -> None:
    """还原一个被打乱的 0~n-1 排列

    思路：从每个位置出发，沿着轮换走一圈，把元素放到正确位置。
    整个过程只用 1 个临时变量。
    """
    n = len(nums)

    i = 0
    while i < n:
        # 如果当前位置已经是正确的，就跳过
        if nums[i] == i:
            i += 1
            continue

        # 否则，把 nums[i] 放到它应该在的位置（nums[nums[i]]）
        target_idx = nums[i]
        nums[i], nums[target_idx] = nums[target_idx], nums[i]
        # 注意这里不要 i += 1，因为 nums[i] 现在装的是新元素，需要继续处理


def restore_permutation_marked(nums: list[int]) -> None:
    """带访问标记的版本 —— 用符号位记录是否处理过"""
    n = len(nums)

    for i in range(n):
        # 当前位置已经是正确的，跳过
        while 0 <= nums[i] < n and nums[i] != i:
            # 把目标位置标记为"已处理"，然后把元素搬过来
            target_idx = nums[i]
            nums[i], nums[target_idx] = nums[target_idx], nums[i]
            # 但是 nums[i] 现在可能已经被标记过了，所以要还原
            if nums[i] < 0:
                nums[i] = -nums[i] - 1

        # 还原标记位
        if nums[i] < 0:
            nums[i] = -nums[i] - 1


# 测试
if __name__ == "__main__":
    nums = [3, 1, 4, 2, 0]
    restore_permutation(nums.copy())
    print(nums)  # [0, 1, 2, 3, 4]

    nums2 = [2, 0, 1, 4, 5, 3]
    restore_permutation(nums2.copy())
    print(nums2)  # [0, 1, 2, 3, 4, 5]
```

### Go

```go
package permcycle

// RestorePermutation 还原一个被打乱的 0~n-1 排列
// 时间复杂度 O(n)，空间复杂度 O(1)
func RestorePermutation(nums []int) {
	n := len(nums)
	i := 0
	for i < n {
		// 当前位置已经正确，跳过
		if nums[i] == i {
			i++
			continue
		}
		// 把 nums[i] 放到它应该在的位置（nums[nums[i]]）
		// 这里用 Go 的多重赋值特性，清晰又不会出错
		nums[i], nums[nums[i]] = nums[nums[i]], nums[i]
		// 注意不要 i++，因为 nums[i] 现在装的是新元素
	}
}

// RestorePermutationSafe 带访问标记的版本
// 适用于包含负数或越界值的复杂场景
func RestorePermutationSafe(nums []int) {
	n := len(nums)

	for i := 0; i < n; i++ {
		// 跳过已处理的（用负数标记）
		for nums[i] >= 0 && nums[i] != i && nums[i] < n {
			targetIdx := nums[i]
			// 把目标位置标记为"已处理"
			nums[i] = nums[targetIdx]
			nums[targetIdx] = -targetIdx - 1
		}
		// 还原标记
		if nums[i] < 0 {
			nums[i] = -nums[i] - 1
		}
	}
}
```

### Java

```java
import java.util.Arrays;

public class PermutationCycles {

    /**
     * 还原一个被打乱的 0~n-1 排列
     */
    public static void restorePermutation(int[] nums) {
        int i = 0;
        while (i < nums.length) {
            if (nums[i] == i) {
                i++;
                continue;
            }
            // 把 nums[i] 放到 nums[nums[i]]
            int targetIdx = nums[i];
            int temp = nums[targetIdx];
            nums[targetIdx] = nums[i];
            nums[i] = temp;
        }
    }

    /**
     * 根据置换规则还原数组
     * 例如 perm = [3, 1, 4, 2, 0] 表示新位置 i 放原位置 perm[i] 的元素
     */
    public static void applyPermutation(int[] arr, int[] perm) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            int next = perm[i];
            // 沿着轮换走一圈
            while (next != i) {
                swap(arr, i, next);
                next = perm[next];
            }
        }
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    public static void main(String[] args) {
        int[] nums = {3, 1, 4, 2, 0};
        restorePermutation(nums);
        System.out.println(Arrays.toString(nums)); // [0, 1, 2, 3, 4]
    }
}
```

## LeetCode 实战：情侣牵手

这是 LeetCode 765，是置换循环最经典的实战题：

> 2n 个人坐在一排，情侣编号是 (0,1), (2,3), ..., (2n-2, 2n-1)。
> 给你一个数组 rowers，表示当前座位顺序。每次可以交换任意两个人。最少交换多少次能让情侣坐到相邻位置？

**思路：建立映射 + 找轮换**

```typescript
/**
 * LeetCode 765. 情侣牵手
 * 核心思路：把"情侣对"看作一个节点，"错位"看作边，连通分量数 - 1 就是最少交换次数
 */
function minSwapsCouples(row: number[]): number {
  const n = row.length;
  const N = n / 2;

  // unionFind[i] 表示第 i 对情侣的"根"
  const unionFind: number[] = new Array(N);
  for (let i = 0; i < N; i++) unionFind[i] = i;

  const find = (x: number): number => {
    while (unionFind[x] !== x) {
      unionFind[x] = unionFind[unionFind[x]]; // 路径压缩
      x = unionFind[x];
    }
    return x;
  };

  const union = (x: number, y: number): void => {
    const rootX = find(x);
    const rootY = find(y);
    if (rootX !== rootY) unionFind[rootX] = rootY;
  };

  // 遍历每对相邻座位
  for (let i = 0; i < n; i += 2) {
    const a = Math.floor(row[i] / 2);
    const b = Math.floor(row[i + 1] / 2);
    union(a, b); // 它们应该在同一个情侣组
  }

  // 数连通分量
  const components = new Set<number>();
  for (let i = 0; i < N; i++) components.add(find(i));

  return N - components.size; // 公式：交换次数 = 节点数 - 连通分量数
}
```

这个解法的妙处：**把情侣错位问题转化为"轮换个数"问题**。每个轮换内部的元素需要 `length - 1` 次交换才能理顺，所有轮换加起来 = `总节点数 - 轮换个数` 🎯。

## 实际工程应用

### 1. 配置中心的服务权重轮换

```typescript
/**
 * 按权重轮换服务实例（O(1) 空间）
 */
class ServiceRotator {
  private services: string[];

  constructor(services: string[]) {
    this.services = services;
  }

  /**
   * 把权重最低的服务挪到最前面，其他依次后移
   * 用置换循环实现，避免创建新数组
   */
  rotateToFront(weights: number[]): void {
    if (this.services.length !== weights.length) {
      throw new Error("服务数和权重数必须一致");
    }

    // 找到权重最小的那一个
    let minIdx = 0;
    for (let i = 1; i < weights.length; i++) {
      if (weights[i] < weights[minIdx]) minIdx = i;
    }

    // 把最小权重的服务挪到开头（轮换移动）
    if (minIdx === 0) return;
    const temp = this.services[0];
    let curr = 0;
    let next = minIdx;
    while (next !== 0) {
      this.services[curr] = this.services[next];
      curr = next;
      next = (next + 1) % this.services.length;
    }
    this.services[curr] = temp;
  }
}
```

### 2. 数据库加密列的解密

```typescript
/**
 * 解密一个被"列置换"加密过的字符串
 *
 * 加密原理：把明文按列写入矩阵，再按行读出来
 * 解密原理：建立"行 → 列"的置换映射，用置换循环还原
 */
function decryptColumnar(cipher: string, numCols: number): string {
  const numRows = Math.ceil(cipher.length / numCols);
  const plain = new Array(cipher.length);
  let cipherIdx = 0;

  // 建立位置映射：cipher 的第 i 个字符对应 plain 的哪个位置
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      const plainIdx = row * numCols + col;
      if (plainIdx < cipher.length) {
        plain[plainIdx] = cipher[cipherIdx++];
      }
    }
  }

  return plain.join("");
}
```

### 3. 数组的"原地洗牌"

Fisher-Yates 洗牌我们已经写过（参考 [fisher-yates-shuffle.md](./fisher-yates-shuffle.md)），但如果你拿到的是一个**已经洗好的结果**（比如持久化的随机种子生成的乱序），想还原成有序，又不允许新数组 —— 置换循环就是唯一的选择。

## 常见陷阱与避坑指南

### 陷阱 1：写成原地交换会死循环

```typescript
// ❌ 错误写法：原地交换两个元素
function restoreWrong(nums: number[]): void {
  for (let i = 0; i < nums.length; i++) {
    while (nums[i] !== i) {
      // 这样做会把 nums[i] 和 nums[nums[i]] 互换，但 nums[i] 可能还是错的
      const target = nums[i];
      [nums[i], nums[target]] = [nums[target], nums[i]]; // 这里交换完后 nums[i] 是新元素
      // 但内层 while 的判断 nums[i] !== i 是看新元素，
      // 如果新元素恰好是 i，就会跳出 while，但其他位置还是乱的
    }
  }
}
```

### 陷阱 2：忘记处理"已经处理过的位置"

如果你的输入可能含有不在 `[0, n-1]` 范围内的值（比如负数、大于 n 的数），上面那个版本就会死循环或者数组越界。

**解决办法**：用访问标记。可以借用元素本身的符号位（正负），或者用一个额外的 `visited` 数组 —— 但这就不是 O(1) 空间了。

### 陷阱 3：忘记轮换闭合条件

判断"轮换是否闭合"的标志是：**你处理过的元素最终回到了起点**。比如从位置 0 出发，沿轮换走一圈后回到位置 0，就说明这个轮换处理完了。代码里通常是 `nums[i] === i` 时自然终止。

## 复杂度分析

| 指标     | 复杂度 | 说明                                                                      |
| -------- | ------ | ------------------------------------------------------------------------- |
| 时间     | O(n)   | 每个元素最多被访问常数次（沿轮换走一圈）                                  |
| 空间     | O(1)   | 只用 1 个临时变量（不需要 visited 数组）                                  |
| 最坏情况 | O(n²)  | 如果用 visited 数组来标记，空间会变成 O(n) —— 但时间还是 O(n)            |

注意：**时间永远是 O(n)**，因为每个位置最多被每个轮换访问一次；轮换之间不重叠，所以总访问次数 ≤ n。

## 与其他算法对比

| 场景               | 置换循环 | 额外数组法 | HashMap 辅助 |
| ------------------ | -------- | ---------- | ------------ |
| 数组原地还原       | ✅ 最优  | O(n) 空间  | O(n) 空间    |
| 找错位情侣         | ✅ 必选  | 太慢       | 可用         |
| 通用排序           | ❌ 不行  | 不行       | 排序算法     |
| 按权重轮换         | ✅ 最优  | O(n) 空间  | O(n) 空间    |

置换循环的**适用场景非常窄**：只能处理"已知目标位置"的场景。如果你不确定每个元素最终要去哪里（比如普通的排序），置换循环就帮不上忙了。

## 小结

置换循环是一个"**知道的人秒懂，不知道的人写 bug**"的算法：

- ✅ 核心思想：把置换分解成不相交的轮换，沿轮换走一圈
- ✅ 时间 O(n)，空间 O(1) —— 这是它最大的价值
- ✅ 工程上：配置轮换、解密、错位纠正都能用
- ❌ 适用面窄：必须知道目标位置，否则不如直接用 HashMap
- ⚠️ 易错点：原地交换 vs 临时变量、轮换闭合条件、访问标记

面试中如果遇到"**原地 + O(1) 空间**"的数组题，先想想：**每个元素的最终位置已知吗？** 如果是 —— 大概率就是置换循环。

下次见到 `[1, 0, 3, 2]` 要还原，或者情侣错位问题，记得今天这篇文章 ✨。
