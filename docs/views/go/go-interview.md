---
title: go面试题
date: 2022-05-12 22:03:41
category: Go
tag:
    - interview
---

# 面试题

## 题目 1：

```go
package main

import "fmt"

func main()
    s := []string{"a", "b", "c"}

    copy(s[1:], s)

    fmt.Println(s)
}
```

-   A: [a a a]
-   B: [a a b]
-   C: [a a b c]
-   D: [b c c]
-   E: panic

> 答案为：B

:::tip

`copy`函数主要是切片的拷贝，不支持数组。将第二个切片的元素拷贝到第一个切片里，拷贝的长度为两个切片中长度较小的长度值。

一个特殊的用法，将字符串当成`[]byte`类型的切片

```go
bytes := []byte("hello world")
copy(bytes, "ha ha")
```

会一个字符一个字符的复制：`ha ha world`，即将`hello`五个字符替换为`ha ha`

:::

## 题目 2：

```go
package main

import "fmt"

func main() {
    a := make([]int, 20)

    b := a[18:]
    b = append(b, 2022)

    fmt.Println(len(b), cap(b))
}
```

-   A: 1 2
-   B: 3 4
-   C: 3 33
-   D: 3 40

> 答案：B

**考点**

1.  切片冒号截取操作的底层机制
2.  切片的扩容原理
