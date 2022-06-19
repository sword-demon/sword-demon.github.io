---
title: go语言数据类型转换
date: 2022-01-22 20:38:15
category: Go
tag:
    - convert
---

## 简单的案例

一段`C++`代码案例

```c++
#include <iostream>
using namespace std;

int main() {
    int a = 5;
    float b = 6.2;
    a = b; // 这里做了隐式的类型转换
    count << a << endl;
}
```

输出：

```bash
输出：6
```

> 但是在 go 语言中不支持这样的转换。
>
> 但是常量到变量之间还是会进行隐式转换的

```go
// b是一个变量 5.0是一个常量
// 这两者之间是支持隐式转换的
var b int = 5.0
// 能够执行成功，且做了转换
fmt.Println(b)

c := 5.0
// 输出 float64
fmt.Printf("%T\n", c)
```

但是这边也是非常严格的，比如常量：`5.1`就不能进行赋值

```go
c := 5.0
// 输出 float64
fmt.Printf("%T\n", c)

var d int = c
```

`Cannot use 'c' (type float64) as the type int`

> 变量赋值给另外一个类型的变量，类型不一致，这样是不支持隐式转换的。

## 简单的转换操作

## 简单的转换操作

```go
valueOfTypeB= typeB(valueOfTypeA)
```

**在 go 语言中不支持`变量`间的隐式类型转换**

显示类型转换：

```go
c := 5.1
// 输出 float64
fmt.Printf("%T\n", c)

var d int = int(c)
fmt.Println(d) // 5
```

:::warning 不是所有的都能转换

`Cannot convert an expression of the type 'string' to the type 'int'`

例如字母格式的`string`类型`abcd`就不能转换为`int`。

低精度转换为高精度是安全的，高精度的值转换为低精度的值时会丢失数据，例如`int32`转换为`int16`

这种简单的转换方式不能对`int(float)`和`string`进行互转，要跨大类型转换，可以使用`strconv`包提供的函数。

:::

## strconv

### Itoa 和 Atoi

**int 转换为字符串：`Itoa()`**

```go
fmt.Println("a" + strconv.Itoa(32)) // a32
```

:::details 源码

```go
// Itoa is equivalent to FormatInt(int64(i), 10).
func Itoa(i int) string {
   return FormatInt(int64(i), 10)
}
```

:::

字符串转`int`：`Atoi()`

```go
// 字符串转 int
fmt.Println(strconv.Atoi("12"))
```

输出

```bash
12 <nil>
```

注意它的返回值有 2 个，一个是`int`类型，一个是`error`类型

```go
// 字符串转 int
data, err := strconv.Atoi("12")
if err != nil {
    // 转换失败
    fmt.Println(err)
}
fmt.Println(data)
```

### Parse 类函数

> Parse 类函数用于转换字符串为给定的类型的值：`ParseBool()`、`ParseFloat()`、`ParseInt()`、`ParseUint()`。

```go
b, _ := strconv.ParseBool("true") // 这里可以写 True 或者 False 可以接收大写开头
fmt.Println(b) // true

b, err := strconv.ParseBool("q")
fmt.Println(err) // strconv.ParseBool: parsing "q": invalid syntax
fmt.Println(b) // false 实际上这里是转换失败的
```

```go
b, err := strconv.ParseFloat("3.1435", 64)
fmt.Println(err) // <nil>
fmt.Println(b) // 3.1435 且类型为 float64
```

> 第二个参数是用来指明转换为：`float64`还是`float32`

```go
b, err := strconv.ParseFloat("3.1435", 32)
fmt.Println(err) // <nil>
fmt.Println(b) // 3.1435000896453857
fmt.Printf("%T\n", b) // float64
```

:::tip 这里还是转换为`float64`

```go
func ParseFloat(s string, bitSize int) (float64, error) {
	f, n, err := parseFloatPrefix(s, bitSize)
	if n != len(s) && (err == nil || err.(*NumError).Err != ErrSyntax) {
		return 0, syntaxError(fnParseFloat, s)
	}
	return f, err
}

func parseFloatPrefix(s string, bitSize int) (float64, int, error) {
	if bitSize == 32 {
		f, n, err := atof32(s)
		return float64(f), n, err
	}
	return atof64(s)
}
```

可以看到源码第 12 行，返回的还是`float64`，它会不会后面改掉就不知道了。

:::

`ParseInt()`和`ParseUint()`有 3 个参数

1.  `bitSize`参数标识转换为什么位的`int/uint`，有效值为`0,8,16,32,64`。当`bitSize = 0`的时候，标识转换为`int`或者`uint`类型，例如`bitSize=8`表示转换为`int8/uint8`
2.  `base`参数标识以什么进制的方式去解析给定的字符串，有效值为：`0,2-36`。当`base = 0`的时候，表示根据`string`的前缀来判断以什么进制去解析：`0x`开头的以 16 进制的方式去解析，`0`开头的以 8 进制的方式去解析，其他的以 10 进制的方式解析。

```go
b, err := strconv.ParseInt("3", 10, 0)
fmt.Println(err) // <nil>
fmt.Println(b) // 3
fmt.Printf("%T\n", b) // int64
```

> 当`bitSize = 0`的时候会按照下面的方式去获取返回的类型
>
> `const intSize = 32 << (^uint(0) >> 63)`

:::details 源码

```go
func ParseInt(s string, base int, bitSize int) (i int64, err error) {
   const fnParseInt = "ParseInt"

   if s == "" {
      return 0, syntaxError(fnParseInt, s)
   }

   // Pick off leading sign.
   s0 := s
   neg := false
   if s[0] == '+' {
      s = s[1:]
   } else if s[0] == '-' {
      neg = true
      s = s[1:]
   }

   // Convert unsigned and check range.
   var un uint64
   un, err = ParseUint(s, base, bitSize)
   if err != nil && err.(*NumError).Err != ErrRange {
      err.(*NumError).Func = fnParseInt
      err.(*NumError).Num = s0
      return 0, err
   }

   if bitSize == 0 {
      bitSize = IntSize
   }

   cutoff := uint64(1 << uint(bitSize-1))
   if !neg && un >= cutoff {
      return int64(cutoff - 1), rangeError(fnParseInt, s0)
   }
   if neg && un > cutoff {
      return -int64(cutoff), rangeError(fnParseInt, s0)
   }
   n := int64(un)
   if neg {
      n = -n
   }
   return n, nil
}
```

可以看到`bitSize = 0`的时候，最终还是会以 `int64`转换返回

:::

## Format 类函数

> 将给定的类型格式化为`string`类型：`FormatBool()`、`FormatFloat()`、`FormatInt()、FormatUint()`

```go
s := strconv.FormatBool(true)
fmt.Println(s) // true
fmt.Printf("%T\n", s) // string
```

```go
s := strconv.FormatFloat(3.1415, 'E', -1,64)

fmt.Println(s) // 3.1415E+00
fmt.Printf("%T\n", s) // string
```

```go
func FormatFloat(f float64, fmt byte, prec, bitSize int) string {
	return string(genericFtoa(make([]byte, 0, max(prec+4, 24)), f, fmt, prec, bitSize))
}
```

`FormatFloat`参数众多：

`bitSize`：表示`f`的来源类型(`float32`,`float64`)，会据此进行舍入。

`fmt`表示格式：

```go
'b' (-ddddp±ddd, a binary exponent), 指数为二进制
'e' (-d.dddde±dd, a decimal exponent), 十进制指数
'E' (-d.ddddE±dd, a decimal exponent), 十进制指数
'f' (-ddd.dddd, no exponent),
'g' ('e' for large exponents, 'f' otherwise), 指数很大是用它，否则 f 格式
'G' ('E' for large exponents, 'f' otherwise), 同上
'x' (-0xd.ddddp±ddd, a hexadecimal fraction and binary exponent), or
'X' (-0Xd.ddddP±ddd, a hexadecimal fraction and binary exponent).
```

`prec`控制精度(排除指数部分)，对`f、e、E`，它表示小数点后面的数字个数；对`g、G`它控制总的数字个数。如果`prec`为-1，则代表使用最少量的，但又必须的数字来表示`f`

```go
// 将-42转换为16进制
s := strconv.FormatInt(-42, 16)

fmt.Println(s) // -2a
fmt.Printf("%T\n", s) // string
```

```go
s := strconv.FormatUint(42, 16)

fmt.Println(s) // 2a
fmt.Printf("%T\n", s) // string
```
