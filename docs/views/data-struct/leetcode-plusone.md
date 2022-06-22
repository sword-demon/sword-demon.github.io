---
title: leetcode算法题加一
date: 2022-06-22 23:29:10
category: DataStruct
tag:
    - leetcode
---

## 加一

> 给定一个由 整数 组成的 非空 数组所表示的非负整数，在该数的基础上加一。

最高位数字存放在数组的首位， 数组中每个元素只存储单个数字。

你可以假设除了整数 0 之外，这个整数不会以零开头。

示例 1：

> 输入：digits = [1,2,3]
> 输出：[1,2,4]
> 解释：输入数组表示数字 123。

示例 2：

> 输入：digits = [4,3,2,1]
> 输出：[4,3,2,2]
> 解释：输入数组表示数字 4321。

示例 3：

> 输入：digits = [0]
> 输出：[1]

提示：

-   `1 <= digits.length <= 100`
-   `0 <= digits[i] <= 9`

```go
func plusOne(digits []int) []int {
    for i := len(digits) - 1; i >= 0; i-- {
    // 找到一个不为9的数+1
    if digits[i] != 9 {
      digits[i]++
      break
    } else {
      digits[i] = 0
    }
  }
  // 如果都是0了,在首位加上一个1
  if digits[0] == 0 {
    digits = append(digits, 0)
    copy(digits[1:], digits[:0])
    digits[0] = 1
  }
  return digits
}
```
