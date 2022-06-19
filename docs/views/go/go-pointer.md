---
title: go指针
date: 2021-10-13 22:49:15
category: Go
tag:
    - pointer
---

:::tip

指针，存储的是一个变量的内存地址。任何程序数据载入内存后， 在内存都有他们的地址，这就是指针。而为了保存一个数据在内存中的地址，我们就需要指针变量。

Go 语言中的指针不能进行偏移量和运算，因此 Go 语言中的指针操作非常简单，我们只需要记住两个符号：`&`取地址符和`*`根据地址取值。

:::

## 指针的作用

1.  节省内存空间，提高程序执行效率
2.  间接访问与修改变量的值

## 指针的运算和多级指针

修改变量的值

```go
package main

import "fmt"

func main() {
	var intVariables int = 100

	fmt.Printf("intVariables的值=%d,地址=%v\n", intVariables, &intVariables)

	var pointerVariables *int = &intVariables
	fmt.Printf("pointerVariables=%d,地址=%v\n", pointerVariables, &pointerVariables)

	// 修改变量的值
	*pointerVariables = 200

	fmt.Println(*pointerVariables)
}

```

### 值类型

-   整型
-   浮点型
-   bool
-   数组
-   string

:::tip

值类型在栈中进行分配

:::

### 引用类型

-   指针
-   slice
-   map
-   chan
-   interface

:::tip

引用类型在堆中进行分配

:::

> 当我们定义一个指针的时候，并未分配任何变量，它的默认值是`nil`，如果通过`*变量 = 10`来赋值，会报错。

## 指针 1

```go
var c int = 2
var pc *int = &c // 定义一个指针 指向 c变量的地址
*pc = 3 // 将c的指向的内容更改为3
fmt.Println(c) // 最后输出值为3
```

> go 的指针不能运算

## go 的参数传递

> go 语言仅仅是只有值传递这样的。但是我们可以通过指针的方式来进行引用传递。

下面通过一个`C`的一个代码来进行分析

```c 
void pass_by_val(int a) {
    a++;
}

void pass_by_ref(int& a) {
    a++;
}

int main() {
    int a = 3;

    pass_by_val(a);
    printf("After pass_by_val: %d\n", a); // 3

    pass_by_ref(a);
    printf("After pass_by_ref: %d\n", a); // 4
}
```

`pass_by_val`是进行了值传递，将`main`函数内的`a`变量重新拷贝了一份传给函数。所以哪怕在函数中进行了改变，那也只是改变了拷贝的一个`a`的变量。

`pass_by_ref`是进行引用传递，将`main`函数内的`a`变量的地址赋给了函数 ，所以在函数中对`a`的操作都会影响到原来的`a`变量。

在 Go 语言中，它仅仅只有**一种值传递**的方式

但是呢，值传递意味着需要重新拷贝一份资源，是否会影响性能呢？所以就需要使用值传递和指针来进行配合。

### 参数传递

值传递

```go
var a int

func f(a int)
```

指针来实现引用传递的效果

```go
var a int

func f(pa *int)
```

![指针传递实现引用传递效果](https://gitee.com/wxvirus/img/raw/master/img/20220129123430.png)

传递对象

```go
var cache Cache

func f(cache Cache)
```

![对象包裹指针值传递](https://gitee.com/wxvirus/img/raw/master/img/20220129123604.png)

这样也是一种值传递的方式，只不过`cache`数据包含了一个指针，拷贝了一份指针的数据，指针都是指向一个数据包。

下面我们看一个，两个变量交换值的案例：

```go
func swap(a, b int) {
	b, a = a, b
}

func main() {
    a, b := 3, 4
    swap(a, b)
    fmt.Println(a, b) // 3, 4
}
```

很明显，这是值传递，就是将`a和b`拷贝了一份，并不会影响原来的值，所以最后还是 3 和 4。

使用指针

```go
func swap(a, b *int) {
	*b, *a = *a, *b
}

func main() {
    a, b := 3, 4
	swap(&a, &b)
    fmt.Println(a, b) // 4, 3
}
```

这里将变量的地址传参，就可以进行替换。

但是对于此，我们何必要写成使用指针呢，我们直接使用函数将对应的两个值换个位置返回不就得了

```go
func swap(a, b int) (int ,int) {
	return b, a
}

func main() {
    a, b := 3, 4
    a, b = swap(a, b)
    fmt.Println(a, b) // 4, 3
}
```

这样定义才是更好的。

### Go 的指针就 2 个操作

-   取变量`x`的内存地址：`&x`得到的是指针
-   有了指针变量`p`，`*p`根据内存地址去找值

## `new`和`make`

> 都是用来申请和开辟内存的。

下面有一个代码：

```go
func a() {
    var a *int // 此时a是 nil
    *a = 10 // *a 是根据内存去取值，它本身就是nil 就取不了
    fmt.Println(*a)
}
```

上述代码有没有啥问题？是有的，会提示：`invalid memory address of nil pointer dereference`。这个时候就需要使用到`new`函数

```go
func a() {
    var a *int // 此时a是 nil
    a = new(int)
    fmt.Println(a) // 此时会有一个内存地址
    *a = 10
    fmt.Println(*a)
}
```

> 经过`new`函数之后，就会有一个内存地址，而且它的值默存储了一个 0，然后就可以去进行赋值操作。

同样的还有一个`map`的初始化，它是需要使用`make`来进行初始化，否则直接去进行赋值操作也会报错。

### new 和 make 的区别

`new`用的较少

1.  两者都是用来做内存分配的
2.  `make`只用于`slice、map以及channel`的初始化，返回的还是这 3 个引用类型本身
3.  `new`用于类型的内存分配，并且内存对应的值为该类型的零值，返回的是指向该类型的指针
