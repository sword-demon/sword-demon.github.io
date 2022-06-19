---
title: go语言常量
date: 2021-10-12 23:10:15
category: Go
---

## 常量概述

> 指的是在整个程序运行期间，它的值都不会发生改变。

<!-- more -->

### 定义和使用

常量的关键字：`const`

```go
const constVariables1 float64 = 3.1415926

const constVariables2, constVariables3 = 100, "无解" // 编辑器编译期的一个行为
```

特殊的常量`iota`

```go
const (
	iota1 = iota // 0
    iota2 = iota // 1
    iota3 = iota // 2
)

const iota4 = iota // 0
```

:::tip

`iota`在每次 const 出现的第一次的时候被重置为 0，后续的连续的会进行+1

:::

## 常量的作用与应用场景

> 传统的编程语言中都有枚举类型，`enum`关键字用来声明枚举类型。go 语言中可以使用 const 来定义一个常用的枚举的内容

```go
const (
	Monday = iota
    Tuesday
    Wednesday
    Thursday
    Friday
    Saturday
    Sunday
)

// 0 1 2 3 4 5 6  可以很好的用来表现星期对应的数字
```

```go
const (
	iota1, iota2, iota3 = iota, iota, iota // 都是0
)
```

```go
const (
	iota1 = iota // 0
    iota2 = "wujie" // wujie
    iota3 = iota // 2
)
```

:::tip

如果第二个不是 iota 的连续下去的，它会跳过那个数字

:::

## fmt 标准库

这里插入一个`fmt`标准库的记录。。。

使用`fmt.Printf`的通用占位符

| 占位符 |                说明                |
| :----: | :--------------------------------: |
|   %v   |          值的默认格式表示          |
|  %+v   | 类似%v，但输出结构体是会添加字段名 |
|  %#v   |          值的 Go 语法表示          |
|   %T   |            打印值的类型            |
|   %%   |               百分号               |

```go
fmt.Printf("%v\n", 100)
fmt.Printf("%v\n", false)
o := struct{name string}{"无解"}
fmt.Printf("%v\n", o)
fmt.Printf("%#v\n", o)
fmt.Printf("%+v\n", 100)
fmt.Printf("%T\n", 100)
```

## bufio.NewReader

> 有时候我们想完整获取输入的内容，而输入的内容可能包含空格，这种情况下可以使用`bufio`包来实现

```go
func bufioDemo() {
    reader := bufio.NewReader(os.Stdin) // 从标准输入生成读对象
    fmt.Print("请输入内容: ")
    text, _ := reader.ReadString('\n') // 读到换行
    text = strings.TrimSpace(text)
    fmt.Printf("%#v\n", text)
}
```
