---
title: go基本数据类型
date: 2022-06-19
category: Go
---

## bool 类型

布尔类型的值只可以是常量`true`或者`false`。

一个简单的例子：

```go
var gender bool = false

flag := true
```

## 数值型

### 整数型

-   int8 有符号 8 位整型(-128-127)长度：8bit 一个字节
-   int16 有符号 16 位整型(-32768-32767)
-   int32 有符号 32 位整型(-214783648 到 214783647)
-   int64 有符号 63 位整型(-922337203854775808 到 922337203854775807)
-   uint8 无符号 8 位整型(0-255)8 位都用于表示数值
-   uint16 无符号 16 位整型(0-65535)
-   uint32 无符号 32 位整型(0-4294967295)
-   uint64 无符号 63 位整型(0-184457440737095)

```
有符号数 缺陷：不能表示负数
11111111 = 257
后面就把第一位拿出来代表符号位
01111111 = 127
如果第一位是负数(第一位是1)
10000001 = -1

有符号数会拿出第一位来表示正/负数，所以它的上限就会小

无符号数，第一位就会参与计算，上限就会很高
```

:::tip 相比较 python 为啥 go 有这么多 int 类型

`python`不管你数据库设置的字段有啥上限，都是用`int`表示

但是相对于现实来说，很多都是有上限的，比如：年龄，分数都是有上限的，这些数据就不必要去用`int16`后面的。

所以在很多场景下，数字有上限，我们可以选择合适的数据类型来降低内存的占用。

在`python`中定一个`int`变量

```bash
>>> age = 18
>>> import sys
>>> print(sys.getsizeof(age))
28
>>>
```

它就占用了**28**个字节，虽然在`python`中`int`占用字节是动态的，但是它的使用我们不用担心超过上限。

:::

> 所以对应静态类型的语言的类型选择，我们必须得先做好预期，否则到了上限就很难受。

:::tip int 类型

在`go`语言中，如果定义了`int`类型的数据，它也是一个动态类型，取决于机器本身是多少位，64 位的机器上运行那么`int`就是`int64`，如果是`32`位的机器上那么就是 4 个字节 。

使用`go`语言内置的一个方法来查看

```go
var age int = 18
fmt.Println(age)
fmt.Println(unsafe.Sizeof(age))
```

```bash
18
8
```

我这里是 8 个字节。

一般情况下，我们都会指明`int`占用多少个字节

:::

### 浮点型

-   float32 32 位浮点型数
-   float64 64 位浮点型数

:::tip 注意

它没有`float`类型

`float32`最大值：`3.4028234663852886e+38`

`float64`最大值：`1.7976931348623157e+308`

> 为什么 64 位的 float 最大值远大于 int64，float 底层存储和 int 的存储是不一样的
>
> float32 和 float64 两者占用内存不一样，64 位的最大数和精度都比 32 位高

:::

```go
var age int = 18
fmt.Println(age)
fmt.Println(unsafe.Sizeof(age))

// float 类型
var weight float64 = 71.2
fmt.Println(weight)
fmt.Println(unsafe.Sizeof(weight))
fmt.Println(math.MaxFloat32)
fmt.Println(math.MaxFloat64)
fmt.Printf("%T\n", weight)
fmt.Printf("%T\n", age)
```

```bash
18
8
71.2
8
3.4028234663852886e+38
1.7976931348623157e+308
float64
int

```

### 其他

-   byte 等于 uint8 `type byte = uint8` 实际上是`uint8`的别称
-   rune 等于 int32 `type rune = int32` 和字符处理有关
-   uint 32 或 64 位 自动选择 32 位或者 64 位的

### 字符

> 字符的本质是一个数字，可以进行加减乘除

```go
b := 'b'
fmt.Println(reflect.TypeOf(b + 1))
fmt.Printf("b+1=%c", b + 1)
```

```bash
int32
b+1=c

```

:::tip 注意

1.  b + 1 可以和数字金蒜
2.  b + 1 的类型是`int32`
3.  int 类型可以直接变成字符

:::
