---
title: channel
date: 2022-03-27 19:35:15
category: Go
tag:
    - channel
---

## channel

`goroutine`和`goroutine`之间的通道就是`channel`。

定义一个`channel`

```go
var c chan int // 此时的 c == nil 不可以进行使用
```

所以还是推荐使用`make`来进行创建`channel`

```go
c := make(chan int)
```

记住第一句话，`channel`是用于`goroutine`和`goroutine`之间的通信的，如果用在和别的地方进行发送数据，就会产生`panic`。

发送数据使用`<-`符号来进行发送。

:::danger

没有`->`这个符号！

:::

-   接收数据，变量在`<-`左边，

-   发送数据，变量或值在`<-`右边

`channel`和函数也是属于同一类级别的，既可以做参数，也可以做返回值。

```go
package main

import (
	"fmt"
	"time"
)

// 表明 此方法是用来发数据的，如果试图去收数据就不对了
func createWorker(id int) chan<- int {
	c := make(chan int)

    // 真正的worker
	go func() {
		for {
			fmt.Printf("Worker %d received %c\n", id, <-c)
		}
	}()

	// 会立刻就返回
	return c
}

func chanDemo() {
    // 只能用于收数据
	var channels [10]chan<- int
	for i := 0; i < 10; i++ {
		channels[i] = createWorker(i)
	}

	for i := 0; i < 10; i++ {
		channels[i] <- 'a' + i
	}

	for i := 0; i < 10; i++ {
		channels[i] <- 'A' + i
	}

	time.Sleep(time.Millisecond)
}

func main() {
	chanDemo()
}

```

**而且我们发数据，也必须要有一个人来收数据，否则也会报错。**

### 加缓冲区

```go
func worker(id int, c chan int)  {
	for {
		fmt.Printf("Worker %d received %d\n", id, n)
	}
}
```

```go
func bufferedChannel() {
   // 3: 缓冲区
   c := make(chan int, 3)

   go worker(0, c)

   c <- 'a'
   c <- 'b'
   c <- 'c'
   c <- 'd'

   time.Sleep(time.Millisecond)
}
```

> 不带缓冲区的 chan 线程写入时会立马发生阻塞，直到有其他线程有对该 chan 执行接收操作且接收成功后，写入的进程才会解除阻塞。
> 不带缓冲区的 chan 线程接收时也会立马发生阻塞，直到有其他线程对该 chan 执行写入操作后，接收的线程才会解除阻塞。

### 带缓冲区的 channel:

-   写入阻塞条件:缓冲区满
-   取出阻塞条件：缓冲区没有数据

### 不带缓冲区的 channel:

-   写入阻塞条件:同一时间没有另外一个线程对该 chan 进行读操作
-   取出阻塞条件:同一时间没有另外一个线程对该 chan 进行取操作

### 主动通知另外一个 goroutine 进行关闭

```go
func channelClose() {
	c := make(chan int)

	go worker(0, c)

	c <- 'a'
	c <- 'b'
	c <- 'c'
	c <- 'd'

	// 告诉接收方发完了
	close(c)

	time.Sleep(time.Millisecond)
}
```

接收方进行判断的两种方式：

```go
func worker(id int, c chan int)  {
	for {
		n, ok := <-c
		if !ok {
			break
		}
		fmt.Printf("Worker %d received %d\n", id, n)
	}
}
```

```go
func worker(id int, c chan int)  {
	// 等到c发完就跳出来
	for n:= range c {
		fmt.Printf("Worker %d received %d\n", id, n)
	}
}
```

如果发送方，不主动关闭，接收方还加判断：

```go
func chanDemo() {
	//var c chan int	// c == nil
	var channels [10]chan<- int
	for i := 0; i < 10; i++ {
		channels[i] = createWorker(i)
	}

	for i := 0; i < 10; i++ {
		channels[i] <- 'a' + i
	}

	for i := 0; i < 10; i++ {
		channels[i] <- 'A' + i
	}

	time.Sleep(time.Millisecond)
}
```

调用这个函数，接收方还是会不断的在进行打印输出，但是会在这个发送方时间到了的时候也会进行断掉。所以接收方加不加无所谓，主要还是取决于发送方。

### 理论基础

**Communication Sequentital Process**，简称 CSP 模型。

`Don't communicate by sharing memory;share memory by communicating.`

> 不要通过共享内存来通信；通过通信来共享内存。

[https://www.jianshu.com/p/36e246c6153d](https://www.jianshu.com/p/36e246c6153d)

## 使用 channel 来等待 goroutine 的结束

```go
package main

import (
	"fmt"
)

// 表明 此方法是用来发数据的，如果试图去收数据就不对了
func createWorker(id int) worker {
	w := worker{
		in:   make(chan int),
		done: make(chan bool),
	}
	go doWorker(id, w.in, w.done)

	// 会立刻就返回
	return w
}

func doWorker(id int, c chan int, done chan bool) {

	// 等到c发完就跳出来
	for n := range c {
		fmt.Printf("Worker %d received %d\n", id, n)
		// 去并行的发
		go func() {
			// 通知外面做完了
			done <- true
		}()
	}
}

type worker struct {
	in   chan int
	done chan bool
}

func chanDemo() {
	var workers [10]worker
	for i := 0; i < 10; i++ {
		workers[i] = createWorker(i)
	}

	for i := 0; i < 10; i++ {
		workers[i].in <- 'a' + i
	}

	for i := 0; i < 10; i++ {
		workers[i].in <- 'A' + i
	}

	// wait for all of theme
	// 并行的收20个done
	for _, worker := range workers {
		<-worker.done
		<-worker.done
	}
}

func main() {
	chanDemo()
}

```

上面这个可以使用`sync`包的`WaitGroup`来实现

```go
package main

import (
	"fmt"
	"sync"
)

// 表明 此方法是用来发数据的，如果试图去收数据就不对了
func createWorker(id int, wg *sync.WaitGroup) worker {
	w := worker{
		in: make(chan int),
		wg: wg,
	}
	go doWorker(id, w.in, wg)

	// 会立刻就返回
	return w
}

func doWorker(id int, c chan int, wg *sync.WaitGroup) {

	// 等到c发完就跳出来
	for n := range c {
		fmt.Printf("Worker %d received %c\n", id, n)
		// 去并行的发
		go func() {
			// 通知外面做完了
			wg.Done()
		}()
	}
}

type worker struct {
	in chan int
	wg *sync.WaitGroup
}

func chanDemo() {
	var workers [10]worker
	var wg sync.WaitGroup

	for i := 0; i < 10; i++ {
		workers[i] = createWorker(i, &wg)
	}

	// 加20个任务进行等待
	wg.Add(20)
	for i := 0; i < 10; i++ {
		workers[i].in <- 'a' + i
	}

	for i := 0; i < 10; i++ {
		workers[i].in <- 'A' + i
	}

	wg.Wait()
}

func main() {
	chanDemo()
}

```

再使用函数式编程进行优化

```go
package main

import (
	"fmt"
	"sync"
)

// 表明 此方法是用来发数据的，如果试图去收数据就不对了
func createWorker(id int, wg *sync.WaitGroup) worker {
	w := worker{
		in: make(chan int),
		done: func() {
			wg.Done()
		},
	}
	go doWorker(id, w)

	// 会立刻就返回
	return w
}

func doWorker(id int, w worker) {

	// 等到c发完就跳出来
	for n := range w.in {
		fmt.Printf("Worker %d received %c\n", id, n)
		// 去并行的发
		go func() {
			// 通知外面做完了
			w.done()
		}()
	}
}

type worker struct {
	in chan int
	done func()
}

func chanDemo() {
	var workers [10]worker
	var wg sync.WaitGroup

	for i := 0; i < 10; i++ {
		workers[i] = createWorker(i, &wg)
	}

	// 加20个任务进行等待
	wg.Add(20)
	for i := 0; i < 10; i++ {
		workers[i].in <- 'a' + i
	}

	for i := 0; i < 10; i++ {
		workers[i].in <- 'A' + i
	}

	wg.Wait()
}

func main() {
	chanDemo()
}

```

## 使用 channel 来实现树的遍历

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

func (node *Node) TraverseWithChannel() chan *Node {
	out := make(chan *Node)
	go func() {
		node.TraverseFunc(func(node *Node) {
            // 使用 out 来发送一个 node 节点
			out <- node
		})
		// 遍历完
		close(out)
	}()
	return out
}
```

```go
func main() {
    root := myTreeNode{&tree.Node{Value: 3}}
	root.Left = &tree.Node{}
	root.Right = &tree.Node{Value: 5}
	root.Right.Left = new(tree.Node)
	root.Left.Right = tree.CreateNode(2)

	root.Right.Left.SetValue(4)

	root.Node.Traverse()

    c := root.TraverseWithChannel()
	maxNode := 0
	for node := range c {
		if node.Value > maxNode {
			maxNode = node.Value
		}
	}
	fmt.Println("max node value is ", maxNode) // 5
}
```
