---
title: 并发基础
date: 2021-09-26 22:44:15
category: Go
---

:::tip

并发是编程里比较重要的概念。Go 语言在语言层面上天生支持并发，这也是 Go 语言流行的重要原因

:::

## 进程和线程

:::tip

进程是计算机中资源分配的最小单元(相当于一个车间),一个进程中可以有多个线程(车间里的员工),同一个进程中的线程共享进程中的资源。（车间里的员工可以使用该车间的共享资源）。

:::

::: danger
**注意：进程与进程之间是相互隔离的，每个进程中都维护自己独立的数据，不进行共享；如果想让他们之间进行共享，需要借助一些特殊的办法去实现**
:::

<!-- more -->

## 并发与并行

并发：同一时间段内执行多个任务

并行：同一时间段内多个 CPU 执行同一件任务

Go 语言的并发通过`goroutine`实现。`goroutine`类似于线程，属于用户态的线程，也叫`协程`，是程序员自己弄出来的。`goroutine`是由 Go 语言的运行时`runtime`调度完成的，而线程是由操作系统内核调度完成的。

Go 语言提供`channel`在多个`goroutine`间进行通信。`goroutine`和`channel`是 Go 语言秉承的 CSP(Communicating Sequential Process)并发模式的重要实现基础。

### 协程

协程的优势：

1.  协程的内存消耗更小
    -   一个线程可以包含多个协程
    -   线程大约 2MB 的内存申请量
    -   协程大概 2KB 的内存申请量，最大可以扩大的到 1G
2.  上下文切换更快
    -   协程少一道手续
    -   线程申请内存，需要走过内核
    -   协程申请内存，不需要走过内核

> Goroutine 实质上是一种协程

1.  去掉了冗余的协程生命周期管理
    1.  协程创建
    2.  协程完成
    3.  协程重用
2.  降低额外的延迟和开销
    1.  由于协程间频繁交互导致的
3.  降低加锁、解锁的效率
    1.  降低一部分额外的开销

### 通信

并发编程的难度在于协调，而协调需要通过交流，并发单元间的通信是最大的问题。

在工程上有两种最常见的并发通信模型：共享数据和消息

Go 语言是在`csp`模型基础上进行实现的。

:::danger

一个`channel`只能传递一种类型的值；可以认为是一种类型安全的管道。类型安全就是一种线程安全

:::

## 使用 goroutine

Go 语言中使用`goroutine`非常简单，只需要在调度函数的时候在前面加上`go`关键字，就可以为一个函数创建一个`goroutine`

一个`goroutine`必定对应一个函数，可以创建多个`goroutine`去执行相同的函数。

### 启动单个 goroutine

```go
package main

import "fmt"

func hello() {
	fmt.Println("hello goroutine")
}

func main() { // 启动的时候会开启一个 main 的goroutine去执行main函数
	go hello() // 开启了一个独立的goroutine去执行hello函数

	fmt.Println("main goroutine done!")
}

```

这一次的执行结果只打印了`main goroutine done`，`hello()`函数还没来得及执行就结束了。所以需要在结尾加上延迟几秒进行等待。

```go
package main

import (
	"fmt"
	"time"
)

func hello() {
	fmt.Println("hello goroutine")
}

func main() {
	go hello()

	fmt.Println("main goroutine done!")
	time.Sleep(time.Second) // 让主的goroutine 等待1秒钟
}


>>>输出
hello goroutine
main goroutine done!

```

`main`函数执行完了，就代表整个就结束了，所以没加上延迟阻塞，别的`goroutine`根本来不及去执行，程序占用的资源也就关闭了。

:::tip

但是这里并不建议在生产环境中使用`time.Sleep`，可以使用`sync`包的`WaigGroup`来实现

:::

```go
package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup

func hello() {
	fmt.Println("hello goroutine")
	wg.Done() // 告诉 main 函数 执行完了  通知 wg把计数器-1
}

func main() {

	wg.Add(1) // 技数牌+1
	go hello()

	fmt.Println("main goroutine done!")
	//time.Sleep(time.Second)

	// 等待别的goroutine干完活才结束
	wg.Wait() // 阻塞，等到计数器归零，就会结束
}

```

上述是开启了一个`goroutine`，如果开启多个呢

### 启动多个 goroutine

```go
package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup

func hello(i int) {
	fmt.Println("hello goroutine", i)
	wg.Done() // 告诉 main 函数 执行完了  通知 wg把计数器-1
}

func main() {

	//wg.Add(1) // 技数牌+1

	wg.Add(10000) // 一次全加满
	for i := 0; i < 10000; i++ {
		//wg.Add(1) // 或者每有一个goroutine加一个
		go hello(i)
	}

	fmt.Println("main goroutine done!")
	//time.Sleep(time.Second)

	// 等待别的goroutine干完活才结束
	wg.Wait() // 阻塞，等到计数器归零，就会结束
}

```

使用匿名函数闭包出现的问题以及解决办法

```go
package main

import (
	"fmt"
	"sync"
)

var wg2 sync.WaitGroup

func main() {
	wg2.Add(10000) // 一次全加满
	for i := 0; i < 10000; i++ {
		// wg2.Add(1) // 或者每有一个goroutine加一个
		go func(i int) {
			// 换成匿名函数(闭包) 包含了一个外部函数的一个变量的引用
			fmt.Println("hello", i)
			wg2.Done() // 都执行完了，通知结束
		}(i) // 此时的i是每次for循环的i传进来的 副本
	}

	fmt.Println("main goroutine done!")

	// 等待别的goroutine干完活才结束
	wg2.Wait() // 阻塞，等到计数器归零，就会结束
}

```

### goroutine 的调度

```go
package main

import (
	"fmt"
	"runtime"
	"sync"
)

var wg3 sync.WaitGroup

func a() {
	for i := 0; i < 10; i++ {
		fmt.Println("a", i)
	}
	wg3.Done()
}

func b() {
	for i := 0; i < 10; i++ {
		fmt.Println("b", i)
	}
	wg3.Done()
}

func c() {
	for i := 0; i < 10; i++ {
		fmt.Println("c", i)
	}
	wg3.Done()
}

func main() {
	runtime.GOMAXPROCS(1) // 只占用一个CPU核心

	wg3.Add(2)
	go a()
	go b()

	wg3.Wait()
	//time.Sleep(time.Second)
}

```

此时只会专门完成其中一个，再去执行另外一个。

Go 语言中的操作系统线程和 goroutine 的关系：

1.  一个操作系统线程对应用户态多个 goroutine
2.  go 程序可以同时使用多个操作系统线程
3.  goroutine 和 OS 线程是多对多关系，即`m:n`

## channel 的使用

Go 语言的并发模型`CSP`提倡**通过通信共享内存**而不是通**过共享内存而实现通信**。

如果 goroutine 是 Go 程序并发的执行体，`channel`就是它们之间的连接。`channel`是可以让一个`goroutine`发送特定的值到另一个`goroutine`的通信机制。

Go 语言的通道 `channel`是一种 特殊的类型，总是遵循先入先出的规则，保证收发数据的顺序。每个通道都是一个具体类型的管道。

### channel 类型

`channel`是一种类型，而且是一种引用类型，**使用时需要初始化**。声明格式：

```go
var 变量 chan 元素类型
```

```go
var ch1 chan int // 声明一个传递int类型的通道
var ch2 chan bool // 声明一个传递布尔类型的通道
var ch3 chan []int // 声明一个传递int切片的通道
```

### 创建 channel

它是引用类型，该类型的空值是`nil`

```go
var ch chan int
fmt.Println(ch) // <nil>
```

:::danger

声明`channel`后需要使用`make`进行初始化后才能使用

:::

`channel`的缓冲大小是可选的。

```go
ch3 := make(chan int)
ch4 := make(chan bool)
ch5 := make(chan []int)
```

### channel 操作

-   发送 send
-   接收 receive
-   关闭 close

:::tip

发送和接收都使用`<-`符号

1.  `channel`在`<-`左边就是发送
2.  `channel`在`<-` 右边就是接收

:::

先定义一个 channel

```go
ch := make(chan int)
```

#### 发送

将一个值发送到`channel`中

```go
ch <- 10 // 把10 发送到 ch 中
```

#### 接收

从一个`channel`中接收值

```go
x := <- ch // 从ch中接收值并赋值给变量x
<-ch // 从ch中接收值 忽略结果
```

#### 关闭

通过调用内置的`close`函数来进行关闭`channel`

```go
close(ch)
```

:::danger

关于关闭`channel`需要注意：只有在通知接收方`goroutine`所有的数据都发送完毕的时候才需要关闭。`channel`是可以被垃圾回收机制回收的，它和关闭文件是不一样的，在结束操作后关闭文件时必须要做的，但是关闭`channel`不是必须的。

:::

**关闭后的`channel`有以下特点**

1.  对一个关闭的`channel`在发送数据就会导致`panic`
2.  对一个关闭的`channel`进行接收会一直获取值直到`channel`为空
3.  对一个关闭的`channel`的并且没有值的`channel`执行接收操作会得到对应类型的零值
4.  关闭一个已经关闭的`channel`会导致`panic`

### 无缓冲的 channel

无缓冲的`channel`又称之为阻塞的通道，也叫同步`channel`

```go
func main() {
  ch := make(chan int)
  ch <- 10 // 往ch发送值，没有缓冲区，它不能暂存值，一直阻塞，除非有另外一个goroutine从里面进行取值
  fmt.Println("发送成功")
}
```

:::danger

上述代码能够通过编译，但是执行会报错

`fatal error: all goroutines are asleep - deadlock!`

死锁了！

**也就是说，发送数据必须有一个接受者，否则就是阻塞**

:::

一种方法是启用一个`goroutine`去接收值，例如：

```go
func recv(c chan int) {
	ret := <-c
	fmt.Println("接收成功", ret)
}
func main() {
	ch := make(chan int)
	go recv(ch) // 启用goroutine从通道接收值
	ch <- 10
	fmt.Println("发送成功")
}
```

无缓冲通道上的发送操作会阻塞，直到另一个`goroutine`在该通道上执行接收操作，这时值才能发送成功，两个`goroutine`将继续执行。相反，如果接收操作先执行，接收方的 goroutine 将阻塞，直到另一个`goroutine`在该通道上发送一个值。

使用无缓冲通道进行通信将导致发送和接收的`goroutine`同步化。因此，无缓冲通道也被称为`同步通道`。

### 带缓冲区的 channel

又称之为异步`channel`

```go
func main() {
	ch := make(chan int, 1) // 创建一个容量为1的有缓冲区通道
	ch <- 10
	fmt.Println("发送成功")
}
```

> 通道的容量表示通道中能存放元素的数量。就像你小区的快递柜只有那么个多格子，格子满了就装不下了，就阻塞了，等到别人取走一个快递员就能往里面放一个。

```go
package main

import "fmt"

func sender(ch chan int) {
	for i := 0; i < 100; i++ {
		ch <- i // 发送i
	}
	// 发送玩就关闭 ch
	close(ch)
}

func receiver(ch1, ch2 chan int) {
	// 从channel中取值的方式1
	for {
		tmp, ok := <-ch1
		// 100个值取完了，ok => false 就代表取完了
		if !ok {
			break
		}
		ch2 <- tmp * tmp
	}
	close(ch2)
}

func main() {
	ch1 := make(chan int, 100)
	ch2 := make(chan int, 200)

	go sender(ch1)
	go receiver(ch1, ch2)

	// 从channel中取值的方式2
	for ret := range ch2 {
		// 内部会判断取值遇到了false就会退出
		fmt.Println(ret)
	}
}

```

```go
package main

import "fmt"

// 只能往里面发
func sender(ch chan<- int) {
	for i := 0; i < 100; i++ {
		ch <- i // 发送i
	}
	// 发送玩就关闭 ch
	close(ch)
}

// 从ch1取值，把结果发送个ch2
// ch1 只能取
// ch2 只能发
func receiver(ch1 <-chan int, ch2 chan<- int) {
	// 从channel中取值的方式1
	for {
		tmp, ok := <-ch1
		// 100个值取完了，ok => false 就代表取完了
		if !ok {
			break
		}
		ch2 <- tmp * tmp
	}
	close(ch2)
}

func main() {
	ch1 := make(chan int, 100)
	ch2 := make(chan int, 200)

	go sender(ch1)
	go receiver(ch1, ch2)

	// 从channel中取值的方式2
	for ret := range ch2 {
		// 内部会判断取值遇到了false就会退出
		fmt.Println(ret)
	}
}

```

:::tip

`chan<- int`是一个只写单向通道（只能对其写入 int 类型值），可以对其执行发送操作但是不能执行接收操作

`<-chan int`是一个只读单向通道（只能从其读取 int 类型值），可以对其执行接收操作但是不能执行发送操作。

:::

### worker pool(goroutine 池)

在工作中通常会使用`workerpool`模式，控制`goroutine`的数量，防止`goroutine`泄露和暴涨

```go
package main

import (
	"fmt"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		fmt.Printf("worker:%d start job:%d\n", id, j)
		time.Sleep(time.Second)
		fmt.Printf("worker:%d end job: %d\n", id, j)
		results <- j * 2
	}
}

func main() {
	jobs := make(chan int, 100)
	results := make(chan int, 100)

	// 开启3个goroutine
	for i := 1; i <= 3; i++ {
		go worker(i, jobs, results)
	}
	// 5个任务
	for j := 1; j <= 5; j++ {
		jobs <- j
	}

	close(jobs)

	// 输出结果
	for a := 1; a <= 5; a++ {
		<-results
	}
}

```

```
worker:3 start job:1
worker:1 start job:2
worker:2 start job:3
worker:2 end job: 3
worker:2 start job:4
worker:1 end job: 2
worker:1 start job:5
worker:3 end job: 1
worker:2 end job: 4
worker:1 end job: 5

```

### select 多路复用

select 的使用类似于`switch`语句，每个`case`对应一个通道的通信(接收或发送)的过程。`select`会一直等待，知道某个`case`的通信操作完成时，就会执行`case `分支对应的语句

```go
func main() {
  ch := make(chan int, 1)
  for i := 0; i < 10; i++ {
    select {
      case x := <-ch:
      	fmt.Println(x)
      case ch <- i:
    }
  }
}
```

使用`select`能提高代码的可读性

-   可处理一个或多个`channel`的发送/接收操作
-   如果多个`case`同时满足，`select`会随机选择一个
-   对于没有`case`的`select {}`会一直等待，可用于阻塞`main`函数

#### 火箭发射进行倒计时案例

`time.Tick`函数返回一个通道，它定期发送事件，像一个节拍器一样。每个事件的值是一个时间戳。

```go
func main() {
  fmt.Println("Commencing countdown")
	tick := time.Tick(1 * time.Second)
	for countdown := 10; countdown > 0; countdown-- {
		fmt.Println(countdown)
		<-tick
	}
	launch()
}
```

我们想要在倒计时进行时按下回车键来取消发射过程的能力

-   启动一个`goroutine`从标准输入中读取一个字符
-   发送一个值到`abort`通道

```go
abort := make(chan struct{})
go func() {
  os.Stdin.Read(make([]byte, 1)) // 读取单个字节
  abort <- struct{}{}
}()
```

现在每次倒计时迭代需要等待事件达到两个通道中的一个；

计时器通道，前提是一切顺利；或者中止事件前提是有"异常"。

不能只从一个通道上来接收，因为哪一个操作都会在完成前阻塞。所以需要多路复用那些操作过程，就需要使用`select`

```go
select {
  case <-ch1:
  // ...
  case x := <- ch2:
  // ...use x
  default:
  // ...
}
```

```go
fmt.Println("Commencing countdown, Press return to abort")
select {
  case <-time.After(10 * time.Second):
  // 不执行任何操作
  case <-abort:
  fmt.Println("Launch aborted!")
  return
}
```

`time.After`函数立即返回一个通道，然后启动一个新的`goroutine`在间隔指定时间后，发送一个值到它上面。下面的`select`语句等两个事件中第一个到达的事件，中止事件或者指示事件过去 10s 的事情。如果过了 10s 还没有中止，开始发射。

#### 偶数时发射，奇数时接收

通道`ch`的缓冲区大小为 1，它要么是空的，要么是满的，只有在一种情况下可以执行，要么`i`是偶数时发送，奇数时接收，它总是输出`0 2 4 6 8`

```go
package main

import "fmt"

func main() {
	ch := make(chan int, 1)
	for i := 0; i < 10; i++ {
		select {
		case x := <-ch:
			fmt.Println(x) // 0 2 4 6 8
		case ch <- i:
		}
	}
}
```

#### 并发目录遍历

> 构建一个程序，根据命令行指定的输入，报告一个或多个目录的磁盘使用情况

```go
package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

// walkDir 递归地遍历以 dir 为根目录的整个文件树
// 并在fileSizes上发送每一个已找到的文件的大小
func walkDir(dir string, fileSizes chan<- int64) {
	for _, entry := range dirents(dir) {
		if entry.IsDir() {
			subdir := filepath.Join(dir, entry.Name())
			walkDir(subdir, fileSizes)
		} else {
			fileSizes <- entry.Size()
		}
	}
}

// dirents 返回 dir 目录中的条目
func dirents(dir string) []os.FileInfo {
	entries, err := ioutil.ReadDir(dir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "du1: %v\n", err)
		return nil
	}
	return entries
}

func main() {
	// 确定初始目录
	flag.Parse()
	roots := flag.Args()
	if len(roots) == 0 {
		roots = []string{"."}
	}

	// 遍历文件树
	fileSizes := make(chan int64)
	go func() {
		for _, root := range roots {
			walkDir(root, fileSizes)
		}
		close(fileSizes)
	}()

	// 输出结果
	var nfiles, nbytes int64
	for size := range fileSizes {
		nfiles++
		nbytes += size
	}
	printDiskUsage(nfiles, nbytes)
}

func printDiskUsage(nfiles, nbytes int64) {
	fmt.Printf("%d files %.1f GB\n", nfiles, float64(nbytes)/1e9)
}

```

改进

变成周期性输出总数，只有在 `-v`标识指定的时候才输出，主`goroutine`使用一个计时器每 500ms 定期产生事件，使用一个`select`语句或者等待一个关于文件大小的消息，这时进行更新它的总数，或者等待一个计时事件，这时输出它的总数。如果`-v`没有指定，`tick`通道依然是`nil`，它对应的情况在`select`中实际上被禁用。

```go
func main() {
	// 启动后台goroutine..

	// 确定初始目录
	flag.Parse()
	roots := flag.Args()
	if len(roots) == 0 {
		roots = []string{"."}
	}

	// 遍历文件树
	fileSizes := make(chan int64)
	go func() {
		for _, root := range roots {
			walkDir(root, fileSizes)
		}
		close(fileSizes)
	}()

	// 输出结果
	var nfiles, nbytes int64
	//for size := range fileSizes {
	//	nfiles++
	//	nbytes += size
	//}
	//printDiskUsage(nfiles, nbytes)

	// 定期输出结果
	var tick <-chan time.Time
	if *verbose {
		tick = time.Tick(500 * time.Millisecond)
	}
loop:
	for {
		select {
		case size, ok := <-fileSizes:
			if !ok {
				break loop // fileSizes 关闭
			}
			nfiles++
			nbytes += size
		case <-tick:
			printDiskUsage(nfiles, nbytes)
		}
	}
	printDiskUsage(nfiles, nbytes) // 最终总数
}
```

:::danger

它依然比较耗时间，这里可以并发调用`walkDir`从而充分利用磁盘系统的并行机制。为每一个`walkDir`的调用创建一个`goroutine`，使用`sync.WaitGroup`来为当前存活的`walkDir`调用计数，一个关闭者`goroutine`在计数器减少为 0 的时候进行关闭`fileSizes`通道

:::

```go
package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// walkDir 递归地遍历以 dir 为根目录的整个文件树
// 并在fileSizes上发送每一个已找到的文件的大小
//func walkDir(dir string, fileSizes chan<- int64) {
//	for _, entry := range dirents(dir) {
//		if entry.IsDir() {
//			subdir := filepath.Join(dir, entry.Name())
//			walkDir(subdir, fileSizes)
//		} else {
//			fileSizes <- entry.Size()
//		}
//	}
//}

func walkDir(dir string, n *sync.WaitGroup, fileSizes chan<- int64) {
	defer n.Done()
	for _, entry := range dirents(dir) {
		if entry.IsDir() {
			n.Add(1)
			subdir := filepath.Join(dir, entry.Name())
			walkDir(subdir, n, fileSizes)
		} else {
			fileSizes <- entry.Size()
		}
	}
}

// 是一个用于限制目录并发数的计数信号量
var sema = make(chan struct{}, 20)

// dirents 返回 dir 目录中的条目
func dirents(dir string) []os.FileInfo {
	sema <- struct{}{} // 获取令牌
	defer func() {
		<-sema // 释放令牌
	}()
	entries, err := ioutil.ReadDir(dir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "du1: %v\n", err)
		return nil
	}
	return entries
}

var verbose = flag.Bool("v", false, "show verbose progress messages")

func main() {
	// 启动后台goroutine..

	// 确定初始目录
	flag.Parse()
	roots := flag.Args()
	if len(roots) == 0 {
		roots = []string{"."}
	}

	// 遍历文件树
	// 并行遍历每一个文件树
	fileSizes := make(chan int64)
	var n sync.WaitGroup
	for _, root := range roots {
		n.Add(1)
		go walkDir(root, &n, fileSizes)
	}
	go func() {
		n.Wait()
		close(fileSizes)
	}()
	//go func() {
	//	for _, root := range roots {
	//		walkDir(root, fileSizes)
	//	}
	//	close(fileSizes)
	//}()

	// 输出结果
	var nfiles, nbytes int64
	//for size := range fileSizes {
	//	nfiles++
	//	nbytes += size
	//}
	//printDiskUsage(nfiles, nbytes)

	// 定期输出结果
	var tick <-chan time.Time
	if *verbose {
		tick = time.Tick(500 * time.Millisecond)
	}
loop:
	for {
		select {
		case size, ok := <-fileSizes:
			if !ok {
				break loop // fileSizes 关闭
			}
			nfiles++
			nbytes += size
		case <-tick:
			printDiskUsage(nfiles, nbytes)
		}
	}
	printDiskUsage(nfiles, nbytes) // 最终总数
}

func printDiskUsage(nfiles, nbytes int64) {
	fmt.Printf("%d files %.1f GB\n", nfiles, float64(nbytes)/1e9)
}


```

:::tip

程序在最高峰时创建数千个`goroutine`，所以我们得修改`dirents`函数来使用计数信号量，以防止它同时打开太多的文件

:::

```bash
➜  ch_dir git:(master) ✗ ./ch_dir -v $GOPATH/
26161 files 0.6 GB
57231 files 1.3 GB
59426 files 1.3 GB

```

## 简单实现聊天服务器

> 摘自 Go 程序设计语言 8.10

> 它可以再几个用户之间互相广播文本消息。有 4 个`goroutine`，主`goroutine`和广播`broadcaster goroutine`，每一个连接里面有一个连接处理(`handleConn`)`goroutine`和一个客户写入(`clientWriter`)`goroutine`。广播器是一个关于如何使用`select`的一个规范说明

主`goroutine`的工作是监听端口，接受连接客户端的网络连接。对每一个连接，它创建一个新的`handleConn goroutine`

```go
package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
)

type client chan<- string // 对外发送消息的通道

var (
	entering = make(chan client)
	leaving  = make(chan client)
	messages = make(chan string) // 所有接收的客户消息
)

func broadcaster() {
	clients := make(map[client]bool) // 所有连接的客户端
	for {
		select {
		case msg := <-messages:
			// 把所有接收的消息广播给所有的客户
			// 发送消息通道
			for cli := range clients {
				cli <- msg
			}
		case cli := <-entering:
			clients[cli] = true
		case cli := <-leaving:
			delete(clients, cli)
			close(cli)
		}
	}
}

func handleConn(conn net.Conn) {
	ch := make(chan string) // 对外发送客户消息的通道
	go clientWriter(conn, ch)

	who := conn.RemoteAddr().String()
	ch <- "You are " + who
	messages <- who + " has arrived"
	entering <- ch

	input := bufio.NewScanner(conn)
	for input.Scan() {
		messages <- who + ": " + input.Text()
	}
	// 注意，忽略 input.Err() 中可能出现的错误

	leaving <- ch
	messages <- who + " has left"
	conn.Close()
}

func clientWriter(conn net.Conn, ch <-chan string) {
	for msg := range ch {
		fmt.Fprintln(conn, msg) // 注意，忽略网络层面的错误
	}
}

func main() {
	listener, err := net.Listen("tcp", "localhost:8000")
	if err != nil {
		log.Fatal(err)
	}
	go broadcaster()
	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Print(err)
			continue
		}
		go handleConn(conn)
	}
}

```
