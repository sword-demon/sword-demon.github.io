---
title: go语言字符串
category: Go
date: 2021-10-12 23:40:15
---

## 字符串

> 整点实操类型的吧。go 语言里的字符串都是以`utf8`的编码形式存在的。

**定义很长一串字符串的方式：**

```go
var toolongstring = `
dwqdqwqwbalabdqwdqwd
dqwdqw
dqwd
qwd
qw
`
```

可以使用反引号进行输出换行的一个很长的一个字符串

**字符串为中文的一些处理：**

```go
fmt.Println("hello" + "无解")
```

遍历上述字符串

```go
var strings = "hello, i am 无解"

// 使用len方法获取字符串的长度
stringLen := len(strings)

for index := 0; index < stringLen; index++ {
    fmt.Printf("%s--编码值=%d,值=%c\n", strings, strings[index], strings[index])
}
```

**有中文时，输出就会出现乱码**

使用另一种遍历的方式进行遍历，别的语言里称谓`foreach`

```go
for _, value := range strings {
    fmt.Printf("%s--编码值=%d,值=%c\n", strings, value, value)
}
```

:::tip

此时的`value`其实是`rune`类型，是`int32`类型

:::

## 字符串底层原理

先来打印看一下下面这 2 个字符串的在内存中的长度

```go
func main() {
	fmt.Println(unsafe.Sizeof("无解"))
	fmt.Println(unsafe.Sizeof("无解wujie"))
}
```

结果打印出来两个 16 字节，为何 2 个不一样的内容都占 16 字节，我们前面接触过 8 个字节的长度的数据就是指针，我们可以大胆怀疑 ，这个数据是不是里面包含了 2 个指针，而不是包含字符数据本身。

字符串在`runtime`里面是以`stringStruct`结构体形式

```go
type stringStruct struct {
	str unsafe.Pointer
	len int
}
```

第一个成员是一个`unsafe.Pointer`可以指向任意数据类型的

第二个成员普通的`int`也是 8 个字节

> 所以不管多少都是 16 个字节。

-   字符串本质是个结构体
-   `Data`指针指向底层`Byte`数组
-   `len`表示`Byte`数组的长度

我们可以使用一个反射包下的一个`StringHeader`来测试里面的`Len`变量大小

```go
type StringHeader struct {
	Data uintptr // 指针的最底层表示 原始的数字指针
	Len  int
}
```

案例：

```go
func main() {
	x := "无解"
	// 将字符串的指针取出来
	sh := (*reflect.StringHeader)(unsafe.Pointer(&x)) // 万能指针
	fmt.Println(sh.Len)
}

// 结果：6
```

所以底层的`len`表示的是`Byte`数组的长度，和`Unicode`编码有关。

```go
func main() {
	x := "无解wujie"
	// 将字符串的指针取出来
	sh := (*reflect.StringHeader)(unsafe.Pointer(&x)) // 万能指针
	fmt.Println(sh.Len)
}

// 结果：11
```

<span style="color: red;font-size: 22px;">这里的使用的是`UTF8`变长编码，有可能 3 个字节表示的是中文字符，有可能 1 个字节表示的是英文字符</span>

最终，其实我们可以直接使用`len(x)`来获得底层`Byte`数组的长度。

如果我们以角标访问底层数组的每个字节：

```go
func main() {
	x := "无解wujie"
	for i := 0; i < len(x); i++ {
		fmt.Println(x[i])
	}
}
```

```bash
230
151
160
232
167
163
119
117
106
105
101

```

这样其实是不行的，不能获得到中文，我们应该使用`for range`来遍历

```go
func main() {
	x := "无解wujie"
	for _, char := range x {
		fmt.Printf("%c\n", char)
	}
}

```

```bash
无
解
w
u
j
i
e

```

这样就能打印出来，就会发现很神奇，它会自动解码，前 3 个自动变成中文，这是怎么做到的呢？

> 在`runtime`包下有一个`utf8.go`文件，可以把多个字节解码成 1 个字符，也可以把一个字符解码成多个字节

### 字符串的访问

-   对字符串使用`len()`方法得到的是<kbd>字节数</kbd>而不是<kbd>字符数</kbd>
-   对字符串直接使用下标访问，得到的是<kbd>字节</kbd>
-   字符串被`range`遍历时，被解码成`rune`类型的字符

### 字符串的切分

需要切分时：

-   转为`rune`数组
-   切片
-   转为`string`

```go
s = string([]rune(s)[:3]) // 取前3个字
```
