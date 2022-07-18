---
title: 接口的隐式和显式
date: 2022-07-18 22:50:15
category: GoCore
tag:
    - interface
---

## Go 隐式接口的特点

-   只要实现了接口的全部方法，就是自动实现接口
-   可以在不修改代码的情况下抽象出新的接口

一个简单的接口示例

```go
package main

import "fmt"

type Car interface {
	Driver()
}

type Truck struct {
	Model string
}

func (t Truck) Driver() {
	fmt.Println(t.Model)
}

func main() {
	var c Car = Truck{Model: "卡车类型"}
	fmt.Println(c)
}

```

一个接口的值的底层表示

```go
type iface struct {
	tab  *itab
	data unsafe.Pointer
}

type itab struct {
	inter *interfacetype // 当前接口的类型
	_type *_type // 当前接口装饰的类型
	hash  uint32 // copy of _type.hash. Used for type switches.
	_     [4]byte
	fun   [1]uintptr // variable sized. fun[0]==0 means _type does not implement inter. 实现了哪些方法
}
```

-   接口数据使用`runtime.iface`表示
-   `iface`记录了数据的地址
-   `iface`记录了接口的类型信息和实现的方法(可以用于类型断言)

### 类型断言

-   类型断言是一个使用在接口值上的操作
-   可以将接口值转换为其他类型值(实现或者兼容接口)
-   可以配合`switch`进行类型判断

```go
func main() {
	var c Car = Truck{Model: "卡车类型"}
    // 使用类型断言进行转换类型
	t := c.(Truck)
	fmt.Println(c)
	fmt.Println(t)
}
```
