---
title: 字典序下一个排列（Next Permutation）
description: 字典序下一个排列（Next Permutation）算法详解 —— LeetCode 高频面试题，四语言实现
date: 2026-07-15 08:00:00
categories:
  - Algorithm
tags:
  - next-permutation
  - lexicographic
  - permutation
  - leetcode
  - interview
sidebarSort: 62
---

# 字典序下一个排列（Next Permutation）

你有没有玩过"下一个更大的数字"的游戏？给你一组数字，比如 `[1, 2, 3]`，你能按字典序列出它的所有排列吗？

```
[1, 2, 3]
[1, 3, 2]
[2, 1, 3]
[2, 3, 1]
[3, 1, 2]
[3, 2, 1]
```

这就是字典序（Lexicographic Order）排列 —— 像字典排序一样，先看第一位，再看第二位，依此类推。

**下一个排列**就是给定一个排列，找出字典序中紧接着它的下一个排列。比如 `[1, 2, 3]` 的下一个排列是 `[1, 3, 2]`。

听起来挺简单的？但面试官经常追问："你能不用库函数，自己实现一个 `next_permutation` 吗？"

这就是今天要聊的 ✨

## 原理拆解

### 1. 从生活中理解

想象你有一副扑克牌，按顺序排列是：`[红桃A, 红桃2, 红桃3, 红桃4]`

你想找到"下一个更大的排列"——也就是在所有可能的排列中，比当前排列大、但又最接近的一个。

直观的想法是：从右往左看，找到第一个"可以变大"的位置，然后调整后面的数字让它尽可能小。

```
扑克牌: [A, 2, 4, 3]   ← 当前排列

从右往左找"峰值"：
位置3: 3
位置2: 4  ← 比右边的 3 大！
位置1: 2  ← 比右边的 4 小 ✓ 找到了！

找到了！位置1的数字是 2，它右边有一个比它大的数字（4）。
我们要把这个 2 换成右边比它大的最小数字。
```

### 2. 算法三步走

这就是经典的 **"从右往左找峰值，然后交换，最后反转"** 三步法：

```
Step 1: 从右往左找到第一个降序的位置 i
        即 nums[i] < nums[i+1]
        如果找不到，说明当前是最大排列 → 返回最小排列

Step 2: 从右往左找到第一个比 nums[i] 大的位置 j
        即 nums[j] > nums[i]
        然后交换 nums[i] 和 nums[j]

Step 3: 反转 i+1 到末尾的所有元素
        让这部分变成最小的升序排列
```

### 3. 图解全过程

以 `[1, 2, 3, 6, 5, 4]` 为例：

```
原始数组: [1, 2, 3, 6, 5, 4]

Step 1: 从右往左找第一个"降序点"
        4 ← 5 ← 6 ← 3 ← 2 ← 1
              ↑ 这里 3 < 6，是降序！
        i = 3（值为 3）

Step 2: 从右往左找第一个比 nums[i] 大的数
        4 ← 5 ← 6 ← ↑ (3)
              ↑ 这里 4 > 3，是第一个比 3 大的
        j = 5（值为 4）

        交换 nums[i] 和 nums[j]:
        [1, 2, 3, 4, 5, 6]
                  ↑ ↑ 交换位置

Step 3: 反转 i+1 到末尾
        [1, 2, 3, 4, [5, 6]]
        反转后: [1, 2, 3, 4, 6, 5]

结果: [1, 2, 3, 4, 6, 5]
```

再做一个例子 `[3, 2, 1]`：

```
Step 1: 从右往左找降序点
        1 ← 2 ← 3
        ↑ 找不到！整个数组是降序的（最大排列）

Step 2: 找不到？直接返回升序排列
        结果: [1, 2, 3]
```

### 4. 为什么这样是对的？

让我们理解一下三步法的数学原理：

**为什么找"从右往左的第一个降序点"？**

```
假设数组是: [a1, a2, ..., ai-1, ai, ai+1, ..., an]
从右往左第一个降序点意味着: ai < ai+1

这意味着:
- ai+1 到 an 是一个降序序列（最大的子序列）
- ai 是右边所有元素中最后一个"还有提升空间"的位置

如果找不到这样的 i，说明整个数组都是降序的，就是最大排列。
```

**为什么反转 i+1 到末尾就能得到最小排列？**

```
交换后，ai+1 到 an 仍然是降序的（只是少了 ai，多了原来的 ai）。

反转降序序列会得到升序序列 —— 这就是这部分能取到的最小值。

所以我们做了两件事:
1. 让第 i 位变大（换成右边比它大的最小值）
2. 让 i 之后的部分尽可能小

这就是字典序"下一个"的精确定义！
```

## 代码实现

### TypeScript

```typescript
/**
 * 下一个排列 —— TypeScript 实现
 *
 * 核心思想：
 * 1. 从右往左找第一个降序点 i（nums[i] < nums[i+1]）
 * 2. 从右往左找第一个比 nums[i] 大的数 j，交换
 * 3. 反转 i+1 到末尾的部分
 *
 * 时间复杂度: O(n) - 最多遍历两遍数组
 * 空间复杂度: O(1) - 原地操作
 */
function nextPermutation(nums: number[]): number[] {
  const n = nums.length;
  if (n <= 1) return nums;

  // Step 1: 从右往左找到第一个降序点
  // 即找到 nums[i] < nums[i+1] 的位置 i
  let i = n - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) {
    i--;
  }

  if (i >= 0) {
    // Step 2: 从右往左找到第一个比 nums[i] 大的数
    // 为什么从右往左：因为右边的序列是降序的，第一个遇到的比 nums[i] 大的就是最小的那个
    let j = n - 1;
    while (j >= 0 && nums[j] <= nums[i]) {
      j--;
    }

    // 交换 nums[i] 和 nums[j]
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  // Step 3: 反转 i+1 到末尾的部分
  // 即使 i = -1（最大排列），反转整个数组也会得到最小排列
  // 所以这一步对所有情况都适用
  let left = i + 1;
  let right = n - 1;
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }

  return nums;
}

/**
 * 生成数组的全排列（利用 nextPermutation）
 */
function generateAllPermutations(nums: number[]): number[][] {
  const result: number[][] = [];
  const arr = [...nums].sort((a, b) => a - b); // 先排序确保字典序起点

  do {
    result.push([...arr]);
  } while (!isLastPermutation(arr) && nextPermutation(arr));

  return result;
}

/**
 * 检查是否是最后一个排列（完全降序）
 */
function isLastPermutation(nums: number[]): boolean {
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] < nums[i + 1]) {
      return false;
    }
  }
  return true;
}

// === 测试 ===
console.log("基本测试:");
console.log(nextPermutation([1, 2, 3]));        // [1, 3, 2]
console.log(nextPermutation([3, 2, 1]));        // [1, 2, 3]
console.log(nextPermutation([1, 1, 5]));        // [1, 5, 1]
console.log(nextPermutation([1, 3, 2]));        // [2, 1, 3]

console.log("\n复杂测试:");
console.log(nextPermutation([1, 2, 3, 6, 5, 4])); // [1, 2, 4, 3, 5, 6]
console.log(nextPermutation([1, 5, 1]));          // [5, 1, 1]

console.log("\n全排列生成:");
const perms = generateAllPermutations([1, 2, 3]);
console.log(perms);
// [
//   [1, 2, 3],
//   [1, 3, 2],
//   [2, 1, 3],
//   [2, 3, 1],
//   [3, 1, 2],
//   [3, 2, 1]
// ]
```

### Python

```python
from typing import List


def next_permutation(nums: List[int]) -> List[int]:
    """下一个排列 —— Python 实现

    核心思想三步走：
    1. 从右往左找第一个降序点 i (nums[i] < nums[i+1])
    2. 从右往左找第一个比 nums[i] 大的数 j，交换
    3. 反转 i+1 到末尾的部分

    为什么从右往左找：
    - 右边的序列是降序的，第一个遇到的比 nums[i] 大的就是右边最小的那个
    - 这样交换后能得到"下一个"字典序
    """
    n = len(nums)
    if n <= 1:
        return nums

    # Step 1: 从右往左找到第一个降序点
    i = n - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1

    if i >= 0:
        # Step 2: 从右往左找第一个比 nums[i] 大的数
        j = n - 1
        while j >= 0 and nums[j] <= nums[i]:
            j -= 1

        # 交换
        nums[i], nums[j] = nums[j], nums[i]

    # Step 3: 反转 i+1 到末尾（通用处理：i=-1 时反转整个数组）
    left, right = i + 1, n - 1
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1

    return nums


def generate_all_permutations(nums: List[int]) -> List[List[int]]:
    """生成数组的全排列（字典序）"""
    result = []
    arr = sorted(nums)  # 先排序确保从最小的排列开始

    while True:
        result.append(arr.copy())
        if not next_permutation(arr):
            break

    return result


def is_last_permutation(nums: List[int]) -> bool:
    """检查是否是最后一个排列（完全降序）"""
    return all(nums[i] >= nums[i + 1] for i in range(len(nums) - 1))


# === 测试 ===
if __name__ == "__main__":
    print("基本测试:")
    print(next_permutation([1, 2, 3]))        # [1, 3, 2]
    print(next_permutation([3, 2, 1]))        # [1, 2, 3]
    print(next_permutation([1, 1, 5]))        # [1, 5, 1]
    print(next_permutation([1, 3, 2]))        # [2, 1, 3]

    print("\n复杂测试:")
    print(next_permutation([1, 2, 3, 6, 5, 4])) # [1, 2, 4, 3, 5, 6]
    print(next_permutation([1, 5, 1]))          # [5, 1, 1]

    print("\n全排列生成:")
    perms = generate_all_permutations([1, 2, 3])
    for p in perms:
        print(p)
    # 1 2 3
    # 1 3 2
    # 2 1 3
    # 2 3 1
    # 3 1 2
    # 3 2 1
```

### Go

```go
package permutation

/**
 * 下一个排列 —— Go 实现
 *
 * 三步走：
 * 1. 从右往左找第一个降序点 i (nums[i] < nums[i+1])
 * 2. 从右往左找第一个比 nums[i] 大的数 j，交换
 * 3. 反转 i+1 到末尾的部分
 */

// nextPermutation 原地修改数组，返回下一个排列
// 返回 false 表示已经是最大排列（会重置为最小排列）
func nextPermutation(nums []int) bool {
	n := len(nums)
	if n <= 1 {
		return false
	}

	// Step 1: 从右往左找第一个降序点
	i := n - 2
	for i >= 0 && nums[i] >= nums[i+1] {
		i--
	}

	if i >= 0 {
		// Step 2: 从右往左找第一个比 nums[i] 大的数
		j := n - 1
		for j >= 0 && nums[j] <= nums[i] {
			j--
		}

		// 交换
		nums[i], nums[j] = nums[j], nums[i]
	}

	// Step 3: 反转 i+1 到末尾
	left := i + 1
	right := n - 1
	for left < right {
		nums[left], nums[right] = nums[right], nums[left]
		left++
		right--
	}

	// 如果 i < 0，说明已经是最大排列，重置为最小排列
	return i >= 0
}

// GenerateAllPermutations 生成全排列（字典序）
func GenerateAllPermutations(nums []int) [][]int {
	result := make([][]int, 0)

	// 复制并排序
	arr := make([]int, len(nums))
	copy(arr, nums)
	sort.Ints(arr)

	for {
		// 复制当前排列
		perm := make([]int, len(arr))
		copy(perm, arr)
		result = append(result, perm)

		// 找下一个排列
		if !nextPermutation(arr) {
			break
		}
	}

	return result
}

// IsLastPermutation 检查是否是最后一个排列
func IsLastPermutation(nums []int) bool {
	for i := 0; i < len(nums)-1; i++ {
		if nums[i] < nums[i+1] {
			return false
		}
	}
	return true
}

// 注意：需要 import "sort"
```

### Java

```java
import java.util.Arrays;

/**
 * 下一个排列 —— Java 实现
 *
 * 三步走：
 * 1. 从右往左找第一个降序点 i
 * 2. 从右往左找第一个比 nums[i] 大的数 j，交换
 * 3. 反转 i+1 到末尾的部分
 */
public class NextPermutation {

    /**
     * 原地修改数组为下一个排列
     * @param nums 输入数组
     * @return true 表示成功找到下一个排列，false 表示已经是最大排列
     */
    public static boolean nextPermutation(int[] nums) {
        int n = nums.length;
        if (n <= 1) {
            return false;
        }

        // Step 1: 从右往左找第一个降序点
        int i = n - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) {
            i--;
        }

        if (i >= 0) {
            // Step 2: 从右往左找第一个比 nums[i] 大的数
            int j = n - 1;
            while (j >= 0 && nums[j] <= nums[i]) {
                j--;
            }

            // 交换
            swap(nums, i, j);
        }

        // Step 3: 反转 i+1 到末尾
        reverse(nums, i + 1, n - 1);

        return i >= 0;
    }

    private static void swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }

    private static void reverse(int[] nums, int left, int right) {
        while (left < right) {
            swap(nums, left, right);
            left++;
            right--;
        }
    }

    /**
     * 生成全排列（字典序）
     */
    public static int[][] generateAllPermutations(int[] nums) {
        java.util.ArrayList<int[]> result = new java.util.ArrayList<>();

        // 复制并排序
        int[] arr = nums.clone();
        Arrays.sort(arr);

        do {
            int[] perm = arr.clone();
            result.add(perm);
        } while (nextPermutation(arr));

        return result.toArray(new int[0][]);
    }

    /**
     * 检查是否是最后一个排列
     */
    public static boolean isLastPermutation(int[] nums) {
        for (int i = 0; i < nums.length - 1; i++) {
            if (nums[i] < nums[i + 1]) {
                return false;
            }
        }
        return true;
    }

    // === 测试 ===
    public static void main(String[] args) {
        System.out.println("基本测试:");
        int[] test1 = {1, 2, 3};
        nextPermutation(test1);
        System.out.println(Arrays.toString(test1)); // [1, 3, 2]

        int[] test2 = {3, 2, 1};
        nextPermutation(test2);
        System.out.println(Arrays.toString(test2)); // [1, 2, 3]

        System.out.println("\n全排列生成:");
        int[][] perms = generateAllPermutations(new int[]{1, 2, 3});
        for (int[] perm : perms) {
            System.out.println(Arrays.toString(perm));
        }
    }
}
```

## LeetCode 实战

### 题目 31: 下一个排列

这是 LeetCode 第 31 题，考察的就是 next_permutation：

```typescript
/**
 * LeetCode 31. 下一个排列
 *
 * 给你一个整数数组 nums，按字典序找出下一个排列。
 * 如果下一个排列不存在，就把它重排为最小的排列。
 *
 * 示例：
 * 输入: [1, 2, 3]     → 输出: [1, 3, 2]
 * 输入: [3, 2, 1]     → 输出: [1, 2, 3]
 * 输入: [1, 1, 5]     → 输出: [1, 5, 1]
 */
function nextPermutation(nums: number[]): void {
  // 直接用上面的实现...
  // 这里省略，因为实现完全一样
}
```

### 题目 60: 排列序列（Hard）

这道题稍微难一点：给定 n 和 k，找出第 k 个字典序排列。

**思路**：用 next_permutation 循环 k-1 次？太慢了。

**更好的思路**：数学方法，按位确定。

```typescript
/**
 * LeetCode 60. 排列序列
 *
 * 给出集合 [1, 2, 3, ..., n]，所有排列按字典序排列。
 * 返回第 k 个排列。
 *
 * 示例：
 * n = 3, k = 3 → "213"
 * n = 4, k = 9 → "2314"
 *
 * 数学思路：
 * - 第 1 位可以是 1, 2, 3, 4
 * - 每个数字开头的排列有 (n-1)! = 6 个
 * - 所以第 1 位 = k / 6 的商 + 1（调整）
 */
function getPermutation(n: number, k: number): string {
  // 数字列表
  const nums = Array.from({ length: n }, (_, i) => i + 1);

  // 阶乘表
  const factorial: number[] = [1];
  for (let i = 1; i <= n; i++) {
    factorial[i] = factorial[i - 1] * i;
  }

  // 转成 0-indexed
  k = k - 1;

  const result: number[] = [];

  for (let i = n; i > 0; i--) {
    // 阶乘值
    const fact = factorial[i - 1];

    // 当前位置应该选哪个数字（0-indexed）
    const index = Math.floor(k / fact);

    result.push(nums.splice(index, 1)[0]);

    // 更新 k
    k = k % fact;
  }

  return result.join("");
}

// 测试
console.log(getPermutation(3, 3));  // "213"
console.log(getPermutation(4, 9)); // "2314"
console.log(getPermutation(3, 1)); // "123"
console.log(getPermutation(3, 6)); // "321"
```

### 题目 31 变体：上一个排列

如果面试官问："那怎么找上一个排列呢？"

思路完全对称：**从右往左找升序点，然后交换，再反转**。

```typescript
/**
 * 上一个排列
 * 三步走（与 next 相反）：
 * 1. 从右往左找第一个升序点 i（nums[i] > nums[i+1]）
 * 2. 从右往左找第一个比 nums[i] 小的数 j，交换
 * 3. 反转 i+1 到末尾
 */
function previousPermutation(nums: number[]): number[] {
  const n = nums.length;
  if (n <= 1) return nums;

  // Step 1: 从右往左找第一个升序点
  // 即 nums[i] > nums[i+1] 的位置
  let i = n - 2;
  while (i >= 0 && nums[i] <= nums[i + 1]) {
    i--;
  }

  if (i >= 0) {
    // Step 2: 从右往左找第一个比 nums[i] 小的数
    let j = n - 1;
    while (j >= 0 && nums[j] >= nums[i]) {
      j--;
    }

    // 交换
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  // Step 3: 反转 i+1 到末尾
  let left = i + 1;
  let right = n - 1;
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }

  return nums;
}

// 测试
console.log(previousPermutation([1, 3, 2])); // [1, 2, 3]
console.log(previousPermutation([1, 2, 3])); // [3, 2, 1]
```

## 业务场景

### 1. 密码学中的密钥生成

密码学算法经常需要按字典序遍历所有可能的密钥组合。使用 next_permutation 可以系统地生成所有可能的组合。

### 2. 游戏中的排列求解

数独求解、魔方复原、八皇后问题等，都涉及大量排列操作。字典序排列提供了一种"系统性搜索"的框架。

### 3. 测试用例生成

软件测试中需要生成所有可能的输入组合来覆盖边界情况。字典序排列确保了测试的有序性和可重复性。

### 4. 组合数学教学

next_permutation 是理解组合数学中"字典序"概念的绝佳例子。从 `[1, 1, 2]` 这样的重复元素排列，到 `[1, 2, 3, ..., n]` 的全排列，都能用同样的框架处理。

## 复杂度分析

| 指标 | 复杂度 | 说明 |
| ---- | ------ | ---- |
| 时间 | O(n) | 最多遍历两遍数组：找降序点 + 找交换点 |
| 空间 | O(1) | 原地操作，只用常数级额外空间 |

- **为什么是 O(n)**：虽然有三步操作，但每一步最多遍历数组一遍。第一步从右往左找降序点，最坏情况是整个数组；第二步也是从右往左找；第三步反转也是遍历后半部分。总共不超过 2n 次操作。
- **为什么是 O(1)**：只用到了几个指针变量，没有申请额外空间。

## 小结

next_permutation 看起来简单，但里面有几个精妙的地方：

1. **从右往左找**：因为字典序的比较是从高位到低位，右边的变化空间最大
2. **找"最小的大"**：从右往左第一个比 nums[i] 大的，就是右侧能取到的最小值
3. **反转而非排序**：反转是 O(n)，排序是 O(nlogn)，这一步是 O(n) 的关键

面试中经常考，不是因为它难，而是因为它考察了你对"字典序"这个概念的深刻理解。理解了原理，代码就是三五行的事儿 🎯
