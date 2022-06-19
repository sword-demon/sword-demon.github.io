---
title: go结构体内存对齐
date: 2022-06-04 16:02:15
category: Go
star: true
tag:
    - struct
    - memory
---

## go 结构体内存对齐

结构体是占用一块连续的内存，一个结构体变量的大小是由结构体中的字段决定的

```go
type MyStruct struct {
	a int8 // 1 byte
	b int8 // 1 byte
	c int8 // 1 byte
	d int8 // 1 byte
}

var my MyStruct
fmt.Println(unsafe.Sizeof(my)) // 4
```

> 内存对齐

如下代码的内存大小

```go
type MyStruct3 struct {
	a int8  // 1 byte
	b int32 // 4 bytes
	c int8  // 1 byte
	d int64 // 8 bytes
}

func main() {
	demo2()
}

func demo2() {
	var v3 MyStruct3
	fmt.Println(unsafe.Sizeof(v3)) // 24???
}
```

结构体内存是连续的，肯定是一次把它都读完，每个结构体的大小都是不固定的，结构体的内存大小又不完全由结构体的字段决定的。

为了保证 CPU 读取的是一整块的，处理的时候会按照规则对齐，比如这里第一个字段占 1 个字节，下个字段占 4 个字节，那么第一个字段就会加一段`padding`进行填充到达 4 字节大小的对齐，但是最后面有一个 8 字节的，我们所有的都得进行对齐，前面 2 个 4 字节的可以凑成 8 字节，中间 1 个字节的再加上 7 个`padding`填充，保证和最后一个也进行对齐，所以现在是 3 个 8 字节的，最终是 24 个字节。

> 编译器会自动帮助我们做内存对齐，我们可以合理的利用这个规则来减小结构体的体积。
>
> 之所以这么设计是为了减少 CPU 访问内存的次数，加大 CPU 访问内存的吞吐量。如果不进行内存对齐的话，很可能会增加 CPU 访问内存的次数。

我们对上面的代码进行优化内存空间

```go
type MyStruct3 struct {
	a int8  // 1 byte
	c int8  // 1 byte
	b int32 // 4 bytes
	d int64 // 8 bytes
}

func main() {
	demo2()
}

func demo2() {
	var v3 MyStruct3
	fmt.Println(unsafe.Sizeof(v3)) // 16
}
```

调换一下两个小的顺序，现在就占 16 个字节，对下面的使用的代码没有变化，后面每一个结构体变量就少了 8 个字节，很大限度上进行了一次优化。

## 总结

-   结构体占用连续的内存空间
-   结构体占用的内存大小是由每个属性的大小和内存对齐来决定的
-   内存对齐是编译器帮我们根据 CPU 和平台来自动处理的
-   我们可以利用对齐的规则合理的减小结构的体积
-   内存对齐的原理：CPU 读取内存是以`word size`字长为单位，避免出现一个属性 CPU 分多次读取的问题
-   对齐系数：
    -   对于任意类型的变量`x`，`unsafe.Alignof(x)`至少为 1
    -   对于`struct`类型的变量`x`，计算`x`每一个字段`f`的`unsafe.Alignof(x.f)`，`unsafe.Alignof(x)`等于其中的最大值
    -   对于`array`类型的变量`x`，`unsafe.Alignof(x)`等于构成数组的元素类型的对齐倍数
-   由于空结构体`struct{}`的大小为 0，所以当一个结构体重包含孔结构体类型的字段时，通常不需要进行内存对齐
-   **但是当空结构体作为结构体的最后一个字段时，如果有指向该字段的指针，那么就会返回结构体之外的地址。为了避免内存泄露会额外进行一次内存对齐。**

```go
type MyStruct4 struct {
	m int8 // 1 byte
	n struct{} // 0
}

func main() {
	demo3()
}

func demo3()  {
	var v4 MyStruct4
	fmt.Println(unsafe.Sizeof(v4)) // 2字节
}
```

如果是

```go
type MyStruct4 struct {
	n struct{} // 0
	m int8 // 1 byte
}
```

则内存占用为 1 字节。

> hot path

`hot path`是指非常频繁的指令序列。

在访问结构体的第一个字段时，我们可以直接使用结构体的指针来访问第一个字段，结构体变量的内存地址就是第一个字段的内存地址。

第一个访问的字段的机器代码更紧凑，速度更快；通常将常用的字段位置放在结构体的第一个位置上减少 CPU 要执行的指令数量，从而达到更快的访问效果。

## 练习内容

下面的代码执行内容是什么？为什么？

```go
type student struct {
	name string
	age int
}

func main() {
	demo4()
}

func demo4()  {
	m := make(map[string]*student)
	stus := []student{
		{name: "张三", age: 20},
		{name: "李四", age: 21},
		{name: "王五", age: 22},
	}
	for _, stu := range stus {
		m[stu.name] = &stu
	}
	for k, v := range m {
		fmt.Println(k, "=>", v.name)
	}
}
```

执行内容：

```bash
张三 => 王五
李四 => 王五
王五 => 王五
```

![debug](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220604171140.png)

我们通过调试可以看到，`m`的`value`的内存地址都是一样的。每次`&stu`取地址都会进行更新为这一次循环的对应的内存地址。所以最终都指向”王五“。
