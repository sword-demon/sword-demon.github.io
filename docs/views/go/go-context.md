---
title: context上下文
date: 2022-08-03
category: Go
tag:
    - context
---

## 引入

在 Go 的 http 包的`server`中，每一个请求都有一个对应的`goroutine`去处理，通常需要访问一些请求特定的数据，比如终端用户的身份认证信息、验证相关的 token、请求的截止时间，当一个请求被取消或超时时，所有用来处理请求的 goroutine 都应该迅速的退出，然后系统才能释放这些 goroutine 占用的资源。

## 为什么需要 Context

> 基本示例：如何优雅的退出 goroutine

### 使用全局变量方式

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var wg sync.WaitGroup
var exit bool

func worker() {
	for {
		fmt.Println("worker")
		time.Sleep(time.Second)
		if exit {
			break
		}
	}
	wg.Done()
}

func main() {
	wg.Add(1)
	go worker()
	time.Sleep(time.Second * 3)
	exit = true
	wg.Wait()
	fmt.Println("over")
}

```

:::warning 问题

1.  全局变量在跨包调用时不容易统一
2.  如果`worker`中再启动 goroutine，就不好控制了

:::

### 通道方式

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var wg sync.WaitGroup

func worker(exitChan chan struct{}) {
    // label 标签 搭配 goto break 比较适用多层嵌套退出
LOOP:
	for {
		fmt.Println("worker")
		time.Sleep(time.Second)
		select {
		case <-exitChan: // 等待接收上级通知
			break LOOP
		}
	}
	wg.Done()
}

func main() {
	var exitChan = make(chan struct{})
	wg.Add(1)
	go worker(exitChan)
	time.Sleep(time.Second * 3)
	// 给goroutine发送信号
	exitChan <- struct{}{}
	close(exitChan)
	wg.Wait()
	fmt.Println("over")
}

```

:::warning 问题

1.  使用全局变量在跨包调用时不容易实现规范和统一，需要维护一个共用的`channel`

:::

### 实现目标

:::tip 目标

如何在 goroutine 外部通知 goroutine 退出

-   全局变量
-   通道变量

上面 2 个都不是那么完美。**Go1.7 之前都是程序员自己实现的**

:::

使用`context`

```go
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

var wg sync.WaitGroup

func worker(ctx context.Context) {
	go worker2(ctx)
LOOP:
	for {
		fmt.Println("worker")
		time.Sleep(time.Second)
		select {
		case <-ctx.Done(): // 等待接收上级通知
			break LOOP
		default:
		}
	}
	wg.Done()
}

func worker2(ctx context.Context) {
LOOP:
	for {
		fmt.Println("worker2")
		time.Sleep(time.Second)
		select {
		case <-ctx.Done():
			break LOOP
		default:

		}
	}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	wg.Add(1)
	go worker(ctx)
	time.Sleep(time.Second * 3)
	cancel() // 通知子 goroutine 结束
	wg.Wait()
	fmt.Println("over")
}

```

## Context 熟悉

> 它是用来专门简化对于处理单个请求的多个 goroutine 之间与请求域的数据、取消信号、截止时间等相关操作，这些操作可能涉及多个 API 调用。

`context.Context`是一个接口，该接口定义了四个需要实现的方法：

```go
type Context interface {
	Deadline() (deadline time.Time, ok bool) // 截止时间
	Done() <-chan struct{}
	Err() error
	Value(key interface{}) interface{}
}
```

-   `Deadline`方法需要返回当前`Context`被取消的时间，也就是完成工作的截止时间
-   `Done`方法需要返回一个`channel`，这个`channel`会在当前工作完成或者上下文取消之后关闭，多次调用`Done`方法会返回同一个`channel`
-   `Err`方法会返回当前`Context`结束的原因，**它只会在`Done`返回的`channel`被关闭时才会返回非空的值**
    -   如果当前`Context`被取消就返回`Canceled`错误
    -   如果当前`Context`超时就会返回`DeadlineExceeded`错误
-   `Value`方法会从`Context`中返回键对应的值，对于同一个上下文来说，多次调用`Value`并传入相同的`Key`会返回相同的结果，**该方法仅用于传递跨`API`和进程间跟请求域的数据**

## Background()和 TODO()

因为`context.Context`是一个接口，不能实例一个对象，只能使用实现接口的方法。所以就得借助这两种方法来生成`context`。

```go
var (
	background = new(emptyCtx)
	todo       = new(emptyCtx)
)

func Background() Context {
	return background
}

func TODO() Context {
	return todo
}
```

```go
context.Background() // emptyCtx != nil
context.TODO() // emptyCtx != nil
```

-   `Background`表示所有请求的`context`的顶层`context`，相当于很多个请求的”带头大哥“，主要用于`main`函数、初始化以及测试代码中，作为`Context`最顶层的`Context`
-   `TODO`：等下游接口，目前还不知道具体的使用场景，如果我们不知道该怎么使用 Context 的时候可以使用它

> Background 和 TODO 本质上都是`emptyCtx`结构体类型，是一个不可取消，没有设置截止时间，没有携带任何值的`Context`。

:::tip

想要从零开始创建`Context`，就可以借助这 2 个函数

:::
