---
title: go接口
date: 2022-03-22
category: Go
tag:
    - interface
---

## 接口概念

> 接口定义了一个对象的行为规范，只定义规范不实现 ，由具体的对象来实现规范的细节。接口类型更注重”我能做什么“的问题。在 Go 语言中提倡使用面向接口的编程方式实现解耦。

> 接口定义

每个接口类型由任意个方法签名组成，接口的定义格式如下：

```go
type 接口类型名 interface {
    方法名1(参数列表1) 返回值列表1
    方法名2(参数列表2) 返回值列表2
}
```

```go
package main

import "fmt"

// 定一个学生结构体类型 --> 我是谁
type student struct {
	name string
	age  int
}

// 定义一个dreamer接口类型 --> 我能干什么
type dreamer interface {
	dream()
}

type writer interface {
	write()
}

func (s student) dream() {
	fmt.Printf("%s的梦想是学好Go语言\n", s.name)
}

func main() {
	var s = student{name: "无解", age: 12} // 声明一个student类型的变量
	var x dreamer // 声明一个dreamer接口类型的变量

	// 接口是一种抽象的类型
	// 把student变量当成dreamer接口类型的变量
	x = s

	x.dream() // 无解的梦想是学好Go语言
}

```

引入一个段子：《小孩才分对错，大人只看利弊》

案例：写了一个下载器：

```go
package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
)

func retrieve(url string) string {
	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}

	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			panic(err)
		}
	}(resp.Body)

	bytes, _ := ioutil.ReadAll(resp.Body)
	return string(bytes)
}

func main() {
	fmt.Println(retrieve("https://www.baidu.com"))
}

```

表面上这段代码其实确实没啥问题，但是，`main`函数和`retrieve`函数之间产生了耦合，`main`函数必须调用这个方法才会生效。

假设我们有一个团队，专门处理网络请求或磁盘读写的功能的，我们可以进行模拟：

现在建立了一个`infra`小组

```go
package infra

import (
	"io"
	"io/ioutil"
	"net/http"
)

type Retriever struct {
}

func (Retriever) Get(url string) string {
	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}

	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			panic(err)
		}
	}(resp.Body)

	bytes, _ := ioutil.ReadAll(resp.Body)
	return string(bytes)
}

```

专门用于处理网络请求。

再次对下载器进行改写：

```go
package main

import (
	"fmt"
	"learngo/infra"
)

func getRetriever() infra.Retriever {
	return infra.Retriever{}
}

func main() {
	var retriever infra.Retriever = getRetriever()
	fmt.Println(retriever.Get("https://www.baidu.com"))
}

```

但是呢，此时，我们还是需要使用`infra.Retriever`它来进行调用，我们不能换么？

假如现在又有一个测试的目录，也有一个对应的测试的网络请求方法，返回一个假的字符串：

```go
package testing

type Retriever struct {
}

func (Retriever) Get(url string) string {
	return ""
}

```

此时我们在下载器代码中想要更换调用，更改的力度就很大

```go
package main

import (
	"fmt"
	"learngo/testing"
)

func getRetriever() testing.Retriever {
	return testing.Retriever{}
}

func main() {
	var retriever = getRetriever()
	fmt.Println(retriever.Get("https://www.baidu.com"))
}

```

**近乎全改。**

> 为什么会造成这样的我们不满意的情况？
>
> **我们直观的觉得这两个`retriever`都是做的同样的事情，应该换起来是很容易的，为什么会改这么多地方？**
>
> 对于静态语言来说，我们会有一些类型概念，在编译期就会知道传入的是什么类型。当我们改`retriever`，就是再换类型就会换的很麻烦。

:::tip 换个想法

```go
var retriever ? = getRetriever()
```

我们其实就是需要一个可以使用`Get`方法去请求地址。

:::

```go
package main

import (
	"fmt"
	"learngo/testing"
)

func getRetriever() retriever {
	return testing.Retriever{}
}

// ?: Something that can "Get"
type retriever interface {
	Get(string) string
}

func main() {
	var r retriever = getRetriever()
	fmt.Println(r.Get("https://www.baidu.com"))
}

```

此时我们换回原先的方法调用，就很简单，只有换调用方即可。

```go
func getRetriever() retriever {
	return infra.Retriever{}
}
```

:::tip 疑问点 ❓

从`Java`语言来的小伙伴，看到这个会很懵逼，照理说写了一个`interface`我们需要去实现一个它这样的接口方法，但是我们这里并没有去实现它，还能继续调用。这个就是`duck typing`，即《鸭子模型》。

:::

### 大黄鸭是鸭子吗？

-   传统类型系统：脊索动物们、脊椎动物亚门、鸟纲雁形目，不是鸭子
-   `duck typing`：是鸭子
-   ”像鸭子走路，像鸭子叫（长得像鸭子），那么就是鸭子“
-   描述事物的外部行为而非内部结构
-   严格说`go`属于结构化类型系统，类似`duck typing`

### python 的`duck typing`

```python
def download(retriever):
    return retriever.get("www.baidu.com")
```

-   运行时才知道传入的`retriever`有没有`get`方法
-   需要注释来说明接口

### C++中的`duck typing`

```c++
template <class R> string download(const R& retriever) {
    return retriever.get("www.baidu.com")
}
```

-   编译时才知道传入的`retriever`有没有`get`方法，写的时候并不知道
-   需要注释来说明接口

### java 中的类似代码

```java
<R extends Retriever> String download(R r) {
    return r.get("www.baidu.com")
}
```

-   `Java`逼着我们必须实现`Retriever`接口
-   **但是它不是`duck typing`**
-   不在需要注释来说明

### go 语言的`duck typing`

-   同时具有`python、C++`的`duck typing`的灵活性
-   又具有`java`的类型检查

## 定义

-   使用者：`downloader`
-   实现者：`retriever`

> -   接口由`使用者`定义
> -   接口的实现是隐式的
> -   只要实现接口里的方法就可以了

```go
package real

import (
	"net/http"
	"net/http/httputil"
	"time"
)

type Retriever struct {
	UserAgent string
	TimeOut   time.Duration
}

func (r Retriever) Get(url string) string {
	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}

	result, err := httputil.DumpResponse(resp, true)

	defer resp.Body.Close()

	if err != nil {
		panic(err)
	}

	return string(result)
}

```

接口一般”肚子“里有它的类型

![接口](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220322210633.png)

-   接口变量自带指针
-   接口变量同样采用值传递，几乎不需要使用接口的指针
-   指针接收者只能使用指针方式使用；值接收者两者都可以

### 查看接口变量的三种方式

-   表示任何类型：`interface{}`
-   `Type Assertion`
-   `Type Switch`

## 接口的组合

> 一个类型实现多个接口

一个类型可以同时实现多个接口，而接口间彼此独立，不知道对方的实现。例如狗不仅可以叫还可以动，我们完全可以分别定义`Sayer`和`Mover`接口

```go
type Sayer interface {
    Say()
}

type Mover interface {
    Move()
}
```

`Dog`既可以实现`Sayer`接口，也可以实现`Mover`接口。

```go
type Dog struct {
    Name string
}

func (d Dog) Say() {
    fmt.Println("实现say方法")
}

func (d Dog) Move() {
    fmt.Println("实现move方法")
}
```

> 接口组合

常见的案例就是`io.WriteCloser`一类的接口，他们里面包含了写读和关闭文件等多个接口。

```go
type Retriever interface {
	Get(url string) string
}

type Poster interface {
	Post(url string, form map[string]string) string
}


// RetrieverPoster 接口的组合
type RetrieverPoster interface {
	Retriever
	Poster
}
```

### 接口也可以作为结构体的字段，我们来看一段 Go 标准库`sort`的源码示例

```go
// An implementation of Interface can be sorted by the routines in this package.
// The methods refer to elements of the underlying collection by integer index.
type Interface interface {
	Len() int
	Less(i, j int) bool
	Swap(i, j int)
}

// reverse 中嵌入了 Interface 接口
type reverse struct {
    Interface // 匿名字段
}
```

> 通过在结构体中嵌入一个接口类型，从而让该结构体类型实现了该接口类型，并且还可以改写接口的方法。

```go
// Less 重写原Interface接口类型的Less方法
func (r reverse) Less(i, j int) bool {
    return r.Interface.Less(i, j)
}
```

### 结构体内部包含匿名接口类型

1.  默认就实现了该接口类型
2.  可以重写接口的方法
3.  但是一定要确保各个接口的字段被正确初始化，没有初始化，它就是`nil`
4.  接口类型的初始化 -> 找一个实现了该接口类型的变量赋值过去

### 空接口

> 空接口是指没有定义任何方法的接口类型。因此任意类型都可以视为实现了空接口。正因为这个特性，空接口类型的变量可以存储任意类型的值。

### 接口值

接口值除了需要记录具体值之外，还需要记录这个值属于的类型，即接口值由<kbd>类型</kbd>和<kbd>值</kbd>组成，且这两部分内容会根据存储的值不同而变化，我们称之为接口的`动态类型`和`动态值`

```go
type Car struct {}
var m interface{}
m = new(Car)
```

接口值的动态类型是`*Car`，动态值为`nil`，此时的接口变量`m`与`nil`并不相等。

## 常用的系统接口

1.  类似`java`的`toString`：`Stringer`接口，里面有一个`string()`函数
2.  `Reader/Writer`

## 指针接收者和值接收者的区别

使用指针接收者实现接口：

接口变量可以接收结构体指针但不能接收结构体类型(不是任何值都能取地址)

使用值接收者实现接口：

接口变量既可以接收指针类型又能接收结构体类型(有了地址就能取值)

> 字面量如果使用：`变量 := 字面量类型(值)` 之后，得到的变量也可以进行取地址

## 类型断言

接口值可能赋值为任意类型的值，那么如何从接口获取其存储的具体数据呢

我们可以借助标准库`fmt`包的格式化打印获取到接口值的动态类型

```go
var m Mover

m = &Dog{Name: "无解"}
fmt.Printf("%T\n", m) // *main.Dog

m = new(Car)
fmt.Printf("%T\n", m) // *main.Car
```

> `fmt`包内部其实是使用反射的机制在程序运行时获取到动态类型的名称。

想要从接口值中获取到对应的实际值需要使用类型断言，语法格式如下：

```go
x.(T)
```

-   x: 接口类型的变量
-   T：表示断言的类型

案例：

```go
b, ok := x.(bool)
```

如果`ok`，就把接口变量转换为对应的类型，否则`ok`为`false`

:::tip 小技巧 下面的代码可以在程序编译阶段验证某一结构体是否满足特定的接口类型

```go
// gin框架的routergroup.go

type IRouter interface {}

type RouterGroup struct {}

var _ IRouter = &RouterGroup{} // 确保 RouterGroup 实现了接口 IRouter
```

:::
