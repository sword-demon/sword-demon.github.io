---
title: 双指针(有序数组找两数之和)
date: 2026-05-15 23:15:10
categories:
  - Interview
---

# 🌅 今日算法：双指针（有序数组找两数之和）

1. 它解决什么问题：在有序数组里快速找满足条件的一对数，避免暴力两层循环。
2. 最好记的方法：像两个人从队伍两头往中间走；和太小，左边往右挪；和太大，右边往左挪。
3. 核心套路：① `left=0,right=n-1`；② 算两端之和；③ 小了左移，大了右移，刚好就返回。
4. 小例子：`[1,2,4,6,9]`，目标 `8`：`1+9` 太大 → 右移；`1+6` 太小 → 左移；`2+6=8`。
5. 今日练习：LeetCode 167「两数之和 II」，建议用 TypeScript 写，先别用 Map。
6. 睡前复盘问题：为什么数组无序时，这个左右夹逼就不可靠了？

## typescript 实现

```ts
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const current = nums[i];
    const need = target - current;

    if (map.has(need)) {
      return [map.get(need)!, i];
    }

    map.set(current, i);
  }

  return [];
}
```

## Java 实现（HashMap）

```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();

    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];

        if (map.containsKey(need)) {
            return new int[]{map.get(need), i};
        }

        map.put(nums[i], i);
    }

    return new int[0];
}
```

## Go 实现（HashMap）

```go
func twoSum(nums []int, target int) []int {
    m := make(map[int]int)

    for i, num := range nums {
        need := target - num

        if idx, ok := m[need]; ok {
            return []int{idx, i}
        }

        m[num] = i
    }

    return nil
}
```

## 核心逻辑：

```ts
map: 数字 -> 下标
```

遍历数组时：

1. 当前数是 `current`
2. 需要的另一个数是：

```ts
need = target - current;
```

3. 如果 `map` 里已经有 `need`，说明之前出现过配对数字：

```ts
return [map.get(need)!, i];
```

4. 否则记录当前数字和下标：

```ts
map.set(current, i);
```

比如：

```ts
nums = [2, 7, 11, 15];
target = 9;
```

遍历到 `7` 时，需要 `2`，而 `2` 已经在 map 里，所以返回：

```ts
[0, 1];
```

复杂度：

- 时间复杂度：`O(n)`
- 空间复杂度：`O(n)`

有个关键点是这句放在后面：

```ts
map.set(current, i);
```

这样可以避免同一个元素被使用两次。比如 `target = 6`，当前数字是 `3` 时，不会自己匹配自己。

---

## 🎯 双指针解法（有序数组专用）

这才是真正的左右夹逼，专治**有序数组**：

```ts
function twoSumSorted(nums: number[], target: number): number[] {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++; // 和太小 → 左指针右移，增大和
    } else {
      right--; // 和太大 → 右指针左移，减小和
    }
  }

  return [];
}
```

## Java 实现（双指针）

```java
public int[] twoSumSorted(int[] nums, int target) {
    int left = 0, right = nums.length - 1;

    while (left < right) {
        int sum = nums[left] + nums[right];

        if (sum == target) {
            return new int[]{left, right};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }

    return new int[0];
}
```

## Go 实现（双指针）

```go
func twoSumSorted(nums []int, target int) []int {
    left, right := 0, len(nums)-1

    for left < right {
        sum := nums[left] + nums[right]

        if sum == target {
            return []int{left, right}
        } else if sum < target {
            left++
        } else {
            right--
        }
    }

    return nil
}
```

### 双指针执行过程

以 `nums = [1, 2, 4, 6, 9]`, `target = 8` 为例：

```
left=0, right=4  →  1 + 9 = 10 > 8  →  right--
left=0, right=3  →  1 + 6 =  7 < 8  →  left++
left=1, right=3  →  2 + 6 =  8 ✅    →  返回 [1, 3]
```

### 复杂度

- 时间复杂度：**`O(n)`** — 最多遍历整个数组一次
- 空间复杂度：**`O(1)`** — 只用了两个指针，不占额外空间

### 双指针 vs HashMap 对比

| 维度       | 双指针               | HashMap             |
| ---------- | -------------------- | ------------------- |
| 适用场景   | 有序数组             | 有序/无序均可       |
| 空间复杂度 | O(1)                 | O(n)                |
| 时间复杂度 | O(n)                 | O(n)                |
| 代码简洁度 | 极简，循环内三行     | 略复杂，含 Map 操作 |
| 需要排序   | 是（本篇已验证有序） | 否                  |

**划重点**：面试时先问面试官"数组是否有序"——有序就秀双指针 O(1) 空间，无序再转 HashMap。这就是本题的终极套路。

## 🙋 为什么数组无序时左右夹逼就不可靠？

核心原因在于**双指针左右夹逼依赖数组的有序性**：

- 当 `nums[left] + nums[right] < target` 时，我们敢把 `left++`，是因为有序保证 `nums[left+1] >= nums[left]`，和一定会变大
- 当 `nums[left] + nums[right] > target` 时，我们敢把 `right--`，是因为有序保证 `nums[right-1] <= nums[right]`，和一定会变小

**数组无序时：**

- `left++` 后，新值可能比旧值**大**也可能**小**，无法预测和的变化方向
- 左右指针的每一步移动都变成了"盲猜"，算法失去了确定性收敛的依据
- 极端情况下可能永远找不到解，或者错过正确解

所以无序数组只能用 HashMap 或暴力两重循环 —— 用 O(n) 空间或 O(n²) 时间，换取对顺序无依赖的确定性。
