---
title: go面试题积攒
date: 2022-06-30 00:12:10
category: Interview
tag:
    - go
    - interview
---

## 以下 go 代码输出什么

```go
package main

import (
    "fmt"
)

func main() {
    var nums1 []interface{}
    nums2 := []int{1, 3, 4}
    nums3 := append(nums1, nums2...)
    fmt.Println(len(nums3))
}
```

-   A：3；
-   B：1；
-   C：4；
-   D：编译失败

> 答案: D

```bash
cannot use nums2 (type [] int) as type [] interface {} in append
```

:::info 解答
int 属于 interface {}，[] int 不属于 [] interface {}
:::
