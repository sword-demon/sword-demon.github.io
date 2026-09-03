---
title: 摩尔投票算法
description: 摩尔投票（Boyer-Moore Voting）算法详解 —— LeetCode 高频面试题，四语言实现
date: 2026-09-02 09:28:03
categories:
  - Algorithm
tags:
  - boyer-moore
  - majority-vote
  - leetcode
  - interview
sidebarSort: 79
---

# 摩尔投票算法（Boyer-Moore Voting）

你有没有遇到过这样的面试题：给你一个超长的数组，怎么在 **O(1) 额外空间**、**一遍扫描**的情况下，找出里面出现次数超过一半的那个元素？

LeetCode 第 169 题（多数元素）就是这个。原题大概长这样：

```text
输入: [2, 2, 1, 1, 1, 2, 2]
输出: 2

因为 2 出现了 4 次，超过数组长度 7 的一半。
```

很多人第一反应是"用 `Map` 计数"，但 `Map` 是 O(n) 空间；进阶一点的会说"先排序再取中间"，但排序是 O(n log n)。有没有更狠的？

有，**摩尔投票算法（Boyer-Moore Majority Vote Algorithm）** 就是为这种场景而生的 ✨。它只需要 O(1) 空间、一遍扫描就能搞定。1981 年由 Boyer 和 Moore 提出，至今仍是面试中的"明星选手"。

## 原理拆解

### 1. 从生活场景说起

想象你是个班长，组织全班同学（n 个人）投票选"班花"。规则是：**只有票数过半的人才能当选**。

现在给你一个超长的选票序列，比如 `["小美", "小王", "小美", "小李", "小美", "小美", "小王", "小美"...]`，你怎么只用一个计数器就找到那个过半的人？

直觉告诉你：**把不同的票两两抵消**。

```text
规则:
- 手里拿着一张"候选人卡片"，初始为 none
- 遇到一个名字:
  - 如果和当前候选人相同 → 计数器 +1
  - 如果和当前候选人不同 → 计数器 -1（相当于抵消一票）
  - 如果计数器变成 0 → 换人！把当前名字设为新候选人，计数器重置为 1
```

听起来像在玩"消消乐"？没错，本质就是消消乐。

### 2. 为什么这样一定对？

假设真的存在一个过半的元素 `target`，它出现了超过 n/2 次。剩下的所有"非 target"加起来都不到 n/2。

```text
数组: [A, B, C, A, D, A, E, A, F, A, A]  ← 共 11 个，A 出现 6 次 > 5.5
      ↑                                   ↑
     第一轮配对（A vs 任何非A，最多消掉 5 个 A）
     最后还剩至少 1 个 A，没人能和它抵消 → A 必然胜出！
```

数学证明也很简单：

```text
设 target 出现 m 次, m > n/2
其余元素出现 n - m 次, n - m < m

每次"抵消"消耗 1 个 target 和 1 个非 target
最多消耗 min(m, n-m) = n-m 次抵消
target 剩余 m - (n-m) = 2m - n > 0

所以 target 一定有票存活下来 ✓
```

### 3. 图解全过程

以 `[2, 2, 1, 1, 1, 2, 2]` 为例：

```text
初始: candidate = ?, count = 0

读 2:
  2 ≠ ?(空) → candidate = 2, count = 1

读 2:
  2 == 2 → count = 2

读 1:
  1 ≠ 2 → count = 1 (2 和 1 抵消一票)

读 1:
  1 ≠ 2 → count = 0 (再抵消一票)

读 1:
  1 ≠ ?(空，因为count=0) → candidate = 1, count = 1

读 2:
  2 ≠ 1 → count = 0 (抵消)

读 2:
  2 ≠ ?(空) → candidate = 2, count = 1

扫描结束，candidate = 2 ✓
```

**等等，最终 candidate 不一定是结果！**

如果题目**保证**存在过半元素，那 candidate 就是答案。但如果**不一定存在**（比如 `[1, 2, 3]`），candidate 可能是 3（最后胜出的），但 3 没有过半。

所以严谨的写法是：**摩尔投票找候选 + 第二轮验证**。

```text
第一轮: 摩尔投票找 candidate（O(n), O(1) 空间）
第二轮: 遍历数组确认 candidate 真的过半（O(n), O(1) 空间）

总: O(n) 时间, O(1) 空间 ✓
```

## 代码实现

### TypeScript

```typescript
/**
 * 摩尔投票算法 —— TypeScript 实现
 * 核心思路：不同元素两两抵消，最后留下的一定是过半元素（如果存在）
 *
 * 应用场景：
 * 1. LeetCode 169 多数元素（保证存在）
 * 2. LeetCode 229 求众数 II（推广到 n/3）
 * 3. 选举系统中"绝对多数"的快速判定
 */
class BoyerMooreVoting {
  /**
   * 第一轮：找出候选元素
   * 时间 O(n), 空间 O(1)
   */
  static findCandidate<T>(nums: T[]): T | null {
    if (nums.length === 0) return null;

    let candidate: T | null = null;
    let count = 0;

    for (const num of nums) {
      if (count === 0) {
        // 票数为 0，换个候选人
        candidate = num;
        count = 1;
      } else if (num === candidate) {
        // 票数 +1
        count++;
      } else {
        // 不同票，抵消
        count--;
      }
    }

    return candidate;
  }

  /**
   * 第二轮：验证候选元素是否真的过半
   * 严谨场景必须验证，否则 candidate 不保证正确
   */
  static majorityElement<T>(nums: T[]): T | null {
    const candidate = BoyerMooreVoting.findCandidate(nums);
    if (candidate === null) return null;

    // 统计候选元素真实出现次数
    let realCount = 0;
    for (const num of nums) {
      if (num === candidate) realCount++;
    }

    return realCount > nums.length / 2 ? candidate : null;
  }
}

// 使用示例
const nums = [2, 2, 1, 1, 1, 2, 2];
console.log(BoyerMooreVoting.majorityElement(nums)); // 2

// 不存在过半元素的情况
const nums2 = [1, 2, 3, 4];
console.log(BoyerMooreVoting.majorityElement(nums2)); // null（验证失败）

// 简化版：LeetCode 169 明确保证存在过半元素，可以省掉第二轮
function majorityElementSimple(nums: number[]): number {
  let candidate = 0;
  let count = 0;
  for (const num of nums) {
    if (count === 0) candidate = num;
    count += num === candidate ? 1 : -1;
  }
  return candidate;
}
```

### Go

```go
package boyermoore

// FindCandidate 第一轮投票：找出候选元素
//
// 为什么 candidate 和 count 的更新必须分开处理：
// 抵消一票后 count 可能变成 0，下一次必须重新选择候选人，
// 而不能直接在原 candidate 上"减一"——这模拟了消消乐的逻辑。
//
// 时间复杂度 O(n)，空间复杂度 O(1)
func FindCandidate(nums []int) (int, bool) {
	if len(nums) == 0 {
		return 0, false
	}

	candidate := 0
	count := 0

	for _, num := range nums {
		if count == 0 {
			candidate = num
			count = 1
		} else if num == candidate {
			count++
		} else {
			count--
		}
	}

	return candidate, true
}

// MajorityElement 第二轮验证：返回真的过半元素
//
// 为什么需要第二轮：
// 当数组不存在过半元素时（比如 [1,2,3,4]），
// 摩尔投票的输出可能是最后胜出的任何元素，需要二次验证。
func MajorityElement(nums []int) (int, bool) {
	candidate, ok := FindCandidate(nums)
	if !ok {
		return 0, false
	}

	realCount := 0
	for _, num := range nums {
		if num == candidate {
			realCount++
		}
	}

	if realCount > len(nums)/2 {
		return candidate, true
	}
	return 0, false
}

// MajorityElementSimple 简化版：适用于保证存在过半元素的场景
func MajorityElementSimple(nums []int) int {
	candidate := 0
	count := 0
	for _, num := range nums {
		if count == 0 {
			candidate = num
		}
		if num == candidate {
			count++
		} else {
			count--
		}
	}
	return candidate
}
```

### Java

```java
import java.util.List;

/**
 * 摩尔投票算法 —— Java 实现
 *
 * 核心思想：
 * 不同元素之间相互"抵消"，存活下来的就是候选元素。
 * 严谨场景下需要第二轮验证（因为可能不存在过半元素）。
 *
 * 应用：LeetCode 169（多数元素）、229（求众数 II）等
 */
public class BoyerMooreVoting {

    /**
     * 第一轮投票：找出候选元素
     *
     * 关键点：count == 0 时必须换人
     * 这模拟了"两两配对抵消"的过程
     */
    public static <T> T findCandidate(List<T> nums) {
        if (nums == null || nums.isEmpty()) return null;

        T candidate = null;
        int count = 0;

        for (T num : nums) {
            if (count == 0) {
                candidate = num;
                count = 1;
            } else if (num.equals(candidate)) {
                count++;
            } else {
                count--;
            }
        }

        return candidate;
    }

    /**
     * 第二轮验证：确认候选元素真的过半
     *
     * 为什么需要第二轮：
     * 摩尔投票只能保证"如果存在过半元素，它一定是 candidate"，
     * 但不能保证 candidate 一定过半（例如 [1,2,3,4] 的输出可能是任何值）。
     */
    public static <T> T majorityElement(List<T> nums) {
        T candidate = findCandidate(nums);
        if (candidate == null) return null;

        int realCount = 0;
        for (T num : nums) {
            if (num.equals(candidate)) realCount++;
        }

        return realCount > nums.size() / 2 ? candidate : null;
    }

    /**
     * 简化版：题目保证存在过半元素时，可以省掉第二轮
     * LeetCode 169 直接用这个版本即可
     */
    public static int majorityElementSimple(int[] nums) {
        int candidate = 0;
        int count = 0;
        for (int num : nums) {
            if (count == 0) {
                candidate = num;
            }
            count += (num == candidate) ? 1 : -1;
        }
        return candidate;
    }

    public static void main(String[] args) {
        int[] nums1 = {2, 2, 1, 1, 1, 2, 2};
        System.out.println(majorityElementSimple(nums1)); // 2

        int[] nums2 = {1, 2, 3, 4};
        System.out.println(majorityElement(java.util.Arrays.stream(nums2).boxed().toList())); // null
    }
}
```

### Python

```python
from typing import List, Optional, TypeVar

T = TypeVar("T")


class BoyerMooreVoting:
    """
    摩尔投票算法 —— Python 实现

    核心思想：把数组中的元素想象成"票数"，
    不同候选人的票两两抵消，最后存活下来的就是过半元素的候选。

    严谨场景：必须第二轮验证（如果可能不存在过半元素）。
    """

    @staticmethod
    def find_candidate(nums: List[T]) -> Optional[T]:
        """
        第一轮投票：找出候选元素

        时间复杂度 O(n)，空间复杂度 O(1)
        """
        if not nums:
            return None

        candidate: Optional[T] = None
        count = 0

        for num in nums:
            if count == 0:
                # 票数为 0，换个候选人
                candidate = num
                count = 1
            elif num == candidate:
                count += 1
            else:
                # 不同票，抵消
                count -= 1

        return candidate

    @staticmethod
    def majority_element(nums: List[T]) -> Optional[T]:
        """
        第二轮验证：返回真的过半元素

        如果候选元素没过半，返回 None
        """
        candidate = BoyerMooreVoting.find_candidate(nums)
        if candidate is None:
            return None

        # 统计候选元素的真实出现次数
        real_count = sum(1 for num in nums if num == candidate)
        return candidate if real_count > len(nums) / 2 else None

    @staticmethod
    def majority_element_simple(nums: List[int]) -> int:
        """
        简化版：题目保证存在过半元素时使用
        LeetCode 169 可以直接用这个
        """
        candidate = 0
        count = 0
        for num in nums:
            if count == 0:
                candidate = num
            count += 1 if num == candidate else -1
        return candidate


# 使用示例
if __name__ == "__main__":
    # 保证存在过半元素的情况
    nums1 = [2, 2, 1, 1, 1, 2, 2]
    print(BoyerMooreVoting.majority_element_simple(nums1))  # 2

    # 不保证的情况，用严谨版本
    nums2 = [1, 2, 3, 4]
    print(BoyerMooreVoting.majority_element(nums2))  # None

    # 字符串数组也能用
    votes = ["Alice", "Bob", "Alice", "Alice", "Bob", "Alice"]
    print(BoyerMooreVoting.majority_element(votes))  # Alice
```

## 进阶：推广到 n/3 问题（LeetCode 229）

摩尔投票还能升级版 —— 找出所有出现次数**超过 n/3**的元素。

为什么是 n/3？因为**最多只能有 2 个元素超过 n/3**（反证法：如果有 3 个都超过 n/3，总数就超过 n 了）。

```text
思路：维护 2 个 candidate 和 2 个 count
- 每次遇到元素:
  1. 等于 candidate1 → count1++
  2. 等于 candidate2 → count2++
  3. count1 == 0 → 换 candidate1, count1 = 1
  4. count2 == 0 → 换 candidate2, count2 = 1
  5. 否则 → count1--, count2-- （三元素同归于尽）
```

```typescript
function majorityElementTwo(nums: number[]): number[] {
  // 候选 1 和候选 2，以及它们的票数
  let candidate1 = 0, candidate2 = 0;
  let count1 = 0, count2 = 0;

  // 第一轮：投票阶段
  for (const num of nums) {
    if (num === candidate1) {
      count1++;
    } else if (num === candidate2) {
      count2++;
    } else if (count1 === 0) {
      candidate1 = num;
      count1 = 1;
    } else if (count2 === 0) {
      candidate2 = num;
      count2 = 1;
    } else {
      count1--;
      count2--;
    }
  }

  // 第二轮：验证阶段
  count1 = 0;
  count2 = 0;
  for (const num of nums) {
    if (num === candidate1) count1++;
    else if (num === candidate2) count2++;
  }

  const result: number[] = [];
  if (count1 > nums.length / 3) result.push(candidate1);
  if (count2 > nums.length / 3) result.push(candidate2);
  return result;
}

// 测试
console.log(majorityElementTwo([3, 2, 3]));           // [3]
console.log(majorityElementTwo([1, 2, 3, 4, 5, 6])); // []（没有超过 n/3 的）
console.log(majorityElementTwo([1, 1, 1, 3, 3, 2, 2, 2])); // [1, 2]
```

推广到 n/k 同理：**维护 k-1 个候选人和 k-1 个计数器**。但超过 n/3 之后实用性下降（候选空间变大），面试也基本只考到 n/3。

## 业务场景

### 1. 选举系统中的"绝对多数"判定

议会选举中，如果某党派得票超过半数，叫"绝对多数"。计票时如果用 Map 统计，千万级选票要占用几百 MB 内存；用摩尔投票只用一个计数器，**内存 O(1)** 就能实时判定。

```text
实时开票流: [党A, 党B, 党A, 党A, 党C, 党B, 党A, ...]
                          ↓ 摩尔投票实时计算
当前领先者: 党A（是否过半需要第二轮验证）
```

### 2. 大数据流找"最热门"标签

假设你在做推荐系统，用户实时点击流的 tag 数据从 Kafka 涌过来，你想找当前最热门的标签。完整计数成本太高，用摩尔投票的"近似版"——窗口式摩尔投票——可以在 O(1) 空间内给出实时估算。

### 3. 分布式系统中的 Leader 选举

Raft、Paxos 这类分布式一致性算法在某些优化路径中会用类似"少数服从多数 + 局部抵消"的策略来判断 Leader 的合法性。摩尔投票的思想也是很多分布式投票协议的灵感来源。

### 4. 监控告警的"异常检测"

监控系统每秒产生上百万条指标，正常情况下 99% 的指标都平稳。当某个异常指标出现频率超过一半时，触发熔断/告警。摩尔投票适合这种**高频数据流 + O(1) 空间**的场景。

## 复杂度分析

| 指标     | 复杂度 | 说明                                  |
| -------- | ------ | ------------------------------------- |
| 时间     | O(n)   | 第一轮投票 + 第二轮验证，两次遍历     |
| 空间     | O(1)   | 只用 1~2 个变量（candidate + count）  |
| 适用规模 | 任意   | 内存与数据量无关，可处理流式/超大数据 |

对比一下其他方案：

| 方案                | 时间       | 空间  | 一遍扫描 | 流式 |
| ------------------- | ---------- | ----- | -------- | ---- |
| 排序取中间          | O(n log n) | O(1)* | ❌       | ❌   |
| HashMap 计数        | O(n)       | O(n)  | ✅       | ❌   |
| 分治法（递归统计）| O(n log n) | O(log n) | ❌     | ❌   |
| **摩尔投票**        | **O(n)**   | **O(1)** | **✅** | **✅** |

> *排序的 O(1) 空间是 in-place 排序的理想情况，实际工程中快排递归栈还是要 O(log n)

**摩尔投票的优势一目了然**：

- ✅ 时间 O(n)，最优
- ✅ 空间 O(1)，比 HashMap 强太多
- ✅ 一遍扫描就能完成，适合流式数据
- ✅ 实现简单，10 行代码搞定

## 局限性

但摩尔投票也不是万能的：

1. **需要先扫描找 candidate，再扫描验证**（如果不能保证过半）。两遍扫描对纯流式场景不友好——数据读一遍就丢的话，第二轮验证就做不了。
2. **不能处理"求所有超过阈值的元素"** 之类的复杂查询，它只擅长"最多 1~2 个候选"的场景。
3. **candidate 不一定存在** 时必须验证，否则会返回错误答案（很多初学者栽在这里）。

## 小结

摩尔投票算法的精髓就一句话：**用抵消代替计数**。

```text
核心思想: 不同元素两两抵消，活下来的就是 candidate
适用场景: 找出现次数超过一半（或 n/3）的元素
时间复杂度: O(n)
空间复杂度: O(1)
面试高频题: LeetCode 169（多数元素）、229（求众数 II）
```

面试中遇到"找过半元素"的问题，**优先考虑摩尔投票**，因为它最能体现你对**时间和空间权衡**的理解。比起上来就 Map 计数，面试官一定会对 O(1) 空间的方案刮目相看 ✨。

最后留个小练习：你能用摩尔投票的思想解决 LeetCode 1157 吗？（在线多数查询）提示：把它和随机化 + 线段树结合，做出一个支持单点修改的版本 🎯