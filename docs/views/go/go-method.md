---
title: go函数式编程
date: 2022-03-22 21:22:15
category: Go
tag:
    - closure
---

## 函数与闭包

-   函数是一等公民：参数、变量，返回值都可以是函数
-   高阶函数
-   函数 -> 闭包

### ”正统“函数式编程

-   不可变性：不能有状态，只有常量和函数
-   函数只能有一个参数

小案例：累加器函数

```go
package main

import "fmt"

func adder() func(int) int {
	sum := 0
	return func(v int) int {
		sum += v
		return sum
	}
}

func main() {
	a := adder()
	for i := 0; i < 10; i++ {
		fmt.Println(a(i))
	}
}

```

![闭包](https://gitee.com/wxvirus/img/raw/master/img/20220323214433.png)

这里，`sum`是一个自由变量，`sum`变量会保存在这个闭包里。

稍微正统的函数式写法：

```go
type iAdder func(int) (int, iAdder)

func adder2(base int) iAdder {
	return func(v int) (int, iAdder) {
		return base + v, adder2(base + v)
	}
}

func main() {
	a := adder2(0)
	for i := 0; i < 10; i++ {
		var s int
		s, a = a(i)
		fmt.Printf("0 + 1 + ... + %d = %d\n", i, s)
	}
}
```

### python 中的闭包

```python
def adder():
    sum = 0
    def f(value):
        nonlocal sum
        sum += value
        return sum
    return f
```

-   `python`原生支持闭包
-   使用`__closure__`来查询闭包内容

### C++中的闭包

```c++
auto adder() {
    auto sum = 0;
    return [=] (int value) mutable {
        sum += value;
        return sum
    };
}
```

-   过去：`STL`或者`boost`带有类似库
-   C++11 及以后：支持闭包

### Java 中的闭包

```java
Function<Integer, Integer> adder() {
    final Holder<Integer> sum = new Holder<>(0);
    return (Integer value) -> {
        sum.value += value;
        return sum.value;
    }
}
```

-   jdk1.8 以后：使用`Function`接口和`Lambda`表达式来创建函数对象
-   匿名类或者`Lambda`表达式均支持闭包

## go 语言闭包的应用

### 斐波那契数列

```go
package main

import "fmt"

// 1, 1, 2, 3, 5, 8, 13...
// 	  a, b
//       a a+b
func fibonacci() func() int {
	a, b := 0, 1
	return func() int {
		a, b = b, a+b
		return a
	}
}

func main() {
	f := fibonacci()

	fmt.Println(f())
	fmt.Println(f())
	fmt.Println(f())
	fmt.Println(f())
	fmt.Println(f())
	fmt.Println(f())
	fmt.Println(f())
	fmt.Println(f())
	fmt.Println(f())
}

```

给函数实现接口

```go
package main

import (
	"bufio"
	"fmt"
	"io"
	"strings"
)

// 1, 1, 2, 3, 5, 8, 13...
// 	  a, b
//       a a+b
func fibonacci() intGen {
	a, b := 0, 1
	return func() int {
		a, b = b, a+b
		return a
	}
}

type intGen func() int

func (g intGen) Read(p []byte) (n int, err error) {
	// 取得下一个元素
	next := g()
	if next > 10000 {
		return 0, io.EOF
	}
	// 把下一个元素写进 p []byte
	s := fmt.Sprintf("%d\n", next)
    // TODO: incorrect if p is too small!
	return strings.NewReader(s).Read(p)
}

func printFileContents(reader io.Reader) {
	scanner := bufio.NewScanner(reader)

	for scanner.Scan() {
		fmt.Println(scanner.Text())
	}
}

func main() {
	f := fibonacci()

	printFileContents(f)
}

```

### 使用函数来遍历二叉树

```go
package tree

import "fmt"

func (node *Node) Traverse() {
	node.TraverseFunc(func(n *Node) {
		n.Print()
	})
	fmt.Println()
}

func (node *Node) TraverseFunc(f func(*Node)) {
	if node == nil {
		return
	}
	// 中序遍历 左中右
	node.Left.TraverseFunc(f)
	f(node)
	node.Right.TraverseFunc(f)
}

```

<span style="color: green;font-size: 30px;">go 语言闭包的应用</span>：

-   更为自然，不需要修饰如何访问自由变量
-   没有`Lambda`表达式，但是有匿名函数

## defer 调用

-   确保调用在函数结束时发生

-   参数在`defer`语句时计算

    ```go
    func tryDefer() {
    	for i := 0; i < 100; i++ {
    		defer fmt.Println(i)
    		if i== 30 {
    			panic("printed to many")
    		}
    	}
    }
    ```

    它只会打印`0~30`，因为是后进先出，所以是倒过来的**30~0**

-   `defer`列表为后进先出，和栈的含义类似

> 何时使用`defer`调用

-   `Open/Close`
-   `Lock/Unlock`
-   `PrintHeader/PrintFooter`

> 写文件关资源案例：

```go
func fib() func() int {
	a, b := 0, 1
	return func() int {
		a, b = b, a+b
		return a
	}
}

func writeFile(filename string) {
	// 打开一个文件
	file, err := os.Create(filename)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	// 先写到内存里
	writer := bufio.NewWriter(file)
	// 刷到硬盘里
	defer writer.Flush()

	f := fib()
	for i := 0; i < 20; i++ {
		_, err := fmt.Fprintln(writer, f())
		if err != nil {
			return
		}
	}
}
```

## 函数类型和函数签名

> 只要以`type`关键字开头的都是定义类型。

```go
type f func() // 自定义类型 类型名 f 具体是一个函数类型 没有参数没有返回值
```

## 函数作为参数

```go
func f1(x, y int) int {
    return x + y
}
```

> 现在有一个需求，不确定，这个函数是想要相加还是相减，或者相乘：
>
> 共性：都是两个参数
>
> 解决：把具体要做什么事，让调用方自己决定

```go
func f1(x, y int, op func(int, int) int) int {
    res := op(x, y)
    return res
}
```

如果嵌入的比较麻烦，看不懂，我们可以把嵌入的函数参数拿出来，使用函数签名来代替。

```go
type calcuation func(int, int) int

func f1(x, y int, op calcuation) int {
    res := op(x, y)
    return res
}

func add(x, y int) int {
    return x + y
}

func main() {
    f1(10, 20, add) // 把函数当成参数传递进来
}
```

## 函数作为返回值

函数也可以作为返回值：

```go
func do(s string) (func(int, int) int, error) {
	switch s {
	case "+":
		return add, nil
	case "-":
		return sub, nil
	default:
		err := errors.New("无法识别的操作符")
		return nil, err
	}
}
```

如果不想最后具体返回点什么可以这么写

```go
func do(x, y int, s string) (res func(int, int) int) {
	switch s {
	case "+":
		return add
	case "-":
		return sub
	}
	return
}
```

等于是提前声明了一个返回的值，相当于代码里提前声明了：`var res func(int, int) int`，此时`res = nil`，这个就是命名返回值

> 含义有这么几个：

1.  函数内部声明了变量
2.  返回值是`res`
3.  如果`return`后面不带什么，默认就是返回`res`

## 常用内置函数

|     内置函数     |                               介绍                                |
| :--------------: | :---------------------------------------------------------------: |
|      close       |                       主要用来关闭`channel`                       |
|       len        |       用来求长度，比如`string, array, slice, map, channel`        |
|       new        | 用来分配内存，主要用来分配值类型，比如`int, struct`，返回的是指针 |
|       make       |    用来分配内存，主要用来分配引用类型，比如`chan, map, slice`     |
|      append      |                   用来追加元素到数组、`slice`中                   |
| panic 和 recover |                          用来做错误处理                           |

> `panic/recover`

Go 语言目前是没有异常机制的，但是使用`panic/recover`模式来处理错误。`panic`可以在任意地方引发，但`recover`只有在`defer`调用的函数中有效。先看一个例子：

```go
func funcA()  {
	fmt.Println("funcA")
}

func funcB()  {
	fmt.Println("funcB")
}

func funC()  {
	fmt.Println("funC")
}

func main() {
	funcA()
	funcB()
	funC()
}
```

```go
func f2()  {
	defer func() {
		r := recover() // 尝试恢复崩溃的现场
		fmt.Println(r)
	}()

	var m map[string]int
	m["a"] = 1 // panic 程序就崩了
	fmt.Println("美好的周末要结束了")
}
```

```bash
assignment to entry in nil map
```

不会到打印的语句的地方。

:::warning 注意

1.  `recover()`必须搭配`defer`使用
2.  `defer`一定要在可能引发`panic`的语句之前定义

:::
