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

## channel 零值

未初始化的通道类型变量其默认零值是`nil`

```go
var ch chan int
fmt.Println(ch) // nil
```

> 初始化 channel

声明的通道类型变量需要使用内置的`make`函数初始化之后才能使用

```go
make(chan 元素类型. 缓存大小)
```

-   `channel`的缓存大小是可选的

> channel 的操作
>
> -   发送(send)
> -   接收(receive)
> -   关闭(close)

:::tip

发送和接收都使用一个符号：`<-`

:::

### 发送

将一个值发送到通道中

```go
ch <- 10 // 把10发送到ch
```

### 接收

从通道里接收一个值

```go
x := <- ch // 从ch中接收值并赋值给变量x
<-ch // 从ch中接收值，忽略结果，直接丢弃
```

### 关闭

我们通过调用内置的`close`函数来关闭通道

```go
close(ch)
```

:::tip 注意

只有在通知接收方 goroutine 所有的数据都发送完毕的时候，才需要关闭通道。一个通道的值是可以被垃圾回收机制回收的，他和关闭文件不一样，通常在结束操作后关闭文件时必须要做的，但关闭通道不是必须的。

:::

关闭后的通道有以下特点：

1.  对一个关闭的通道再发送值就会导致`panic`
2.  对一个关闭的通道进行接收会一直获取值直到通道为空
3.  对一个关闭的且没有值的通道执行接收操作会得到对应的类型的零值
4.  关闭一个以及关闭的通道会导致`panic`

```go
package main

import "fmt"

func f3() {
	ch := make(chan int, 2)
	ch <- 1
	ch <- 2
	close(ch)
	f2(ch)
}

func f2(ch chan int) {
	for {
		v, ok := <-ch
		if !ok {
			fmt.Println("通道已关闭")
			break
		}
		fmt.Printf("v:%#v ok:%#v\n", v, ok)
	}
}

func main() {
	f3()
}

```

如果这个`for`循环接收完 1 和 2 之后，如果不是以`ok`方式来判断退出，否则一直循环接收到关闭的通道的零值。

我们也可以使用`for range`来替代，当通道关闭后，会在通道内的所有值被接收完后自动退出循环

```go
func f1(ch chan int)  {
	for v := range ch {
		fmt.Println(v)
	}
}
```

:::tip

使用`go range`时，go 语言编译器会帮你判断这个通道是否关闭来结束循环。

:::

## 单向通道

> 在某些场景下我们可能会将通道作为参数在多个任务函数之间进行传递，通常我们会选择在不同的任务函数中对通道的使用进行限制，比如限制通道在某个函数中只能执行发送或只能执行接收操作。
>
> 现在有一个`Producer`和`Consumer`两个函数，其实`Producer`函数会返回一个通道，并且会持续将符合条件的数据发送至该通道，并在发送完成后将该通道关闭。`Consumer`函数的任务是从通道中接收值并进行计算，这 2 个函数之间通过`Processer`函数将返回的通道进行通信。

:::info

当一个函数的返回值是一个通道时，接收的时候通常使用`vCh`加上`ch`后缀来识别，表明它是一个通道类型的变量。

:::

```go
package main

// 单向通道
// 要么接收要么发送

func Producer() chan int {
	ch := make(chan int, 2)
	go func() {
		for i := 0; i < 10; i++ {
			// 筛选出满足条件的值发送到通道中
			if i%2 == 1 {
				ch <- i
			}
		}
		// 任务关闭后关闭通道
		close(ch)
	}()

	return ch
}

func main() {
	vCh := Producer()
    // 此时就不能限制它进行发送数据，但是事实上这里不能进行发送
	vCh <- 10
}

```

> 我们可以给函数的返回值加上限制它只能接收操作

```go
func Producer() <-chan int {
	ch := make(chan int, 2)
	go func() {
		for i := 0; i < 10; i++ {
			// 筛选出满足条件的值发送到通道中
			if i%2 == 1 {
				ch <- i
			}
		}
		// 任务关闭后关闭通道
		close(ch)
	}()

	return ch
}
```

此时，就不能再往`ch`里发送内容。

使用单向通道可以解决我们操作不规范的场景，从代码层去限制只能去接收或者发送，防止发送方关闭了通道，接收方还继续往里发送数据导致`panic`

-   `<- chan int`：只接收通道，只能接收不能发送
-   `chan <- int`：只发送通道，只能发送不能接收

> 这种限制会在编译阶段进行检测

:::warning 注意

可以把正常通道转换为单向通道，但是无法反向转换。

:::

完整案例：

```go
package main

import "fmt"

// 单向通道
// 要么接收要么发送

func Producer() <-chan int {
	ch := make(chan int, 2)
    // 开一个goroutine 后台持续for循环发送数据
	go func() {
		for i := 0; i < 10; i++ {
			// 筛选出满足条件的值发送到通道中
			if i%2 == 1 {
				ch <- i
			}
		}
		// 任务关闭后关闭通道
		close(ch)
	}()

    // 函数先返回
	return ch
}

func Consumer(ch <-chan int) int {
	sum := 0
	for v := range ch {
		sum += v
	}
	return sum
}

func main() {
	vCh := Producer()

	res := Consumer(vCh)
	fmt.Println(res) // 25
}

```

## 练习

```go
package main

import (
	"fmt"
	"math/rand"
	"time"
)

func randomData() {
	// 设置随机因子
	rand.Seed(time.Now().Unix())
	v := rand.Int63()
	fmt.Println(v)
}

// 2个channel
// 两个任务：生成随机数的、计算和的

// ProduceRandomData 生产int64的随机数
func ProduceRandomData() <-chan int64 {
	var jobChan = make(chan int64, 100)
	rand.Seed(time.Now().Unix())

	// 在后台一直产生随机数放入通道
	go func() {
		// 源源不断的产生随机数
		for {
			v := rand.Intn(9999)
			jobChan <- int64(v)
		}
	}()

	// 最后返回通道
	return jobChan
}

type result struct {
	number int64
	sum    int64
}

// Sum 从jobChan获取数据,计算和发送到resultChan里
func Sum(ch <-chan int64, resultChan chan result) {
	// 循环的从ch取值去计算和
	for v := range ch{
		r := result{
			number: v, // 原始数字记录
		}
		var res int64 = 0
		for v > 0 {
			res += v % 10
			v /= 10
		}
		// 把算出来的结果记录
		r.sum = res
		resultChan <- r
	}
}

func main() {
	resChan := make(chan result, 10)
	jobChan := ProduceRandomData()

	// 开启24个goroutine干活求和
	for i := 0; i < 24; i++ {
		go Sum(jobChan, resChan)
	}

	// 从 resChan 里接收值，打印结果
	for res := range resChan {
		time.Sleep(time.Second)
		fmt.Printf("数字: %v, 和: %d\n", res.number, res.sum)
	}
}

```

## 总结

`channel`异常情况总结

| channel | nil(没有 make 初始化) |          非空(有值)          |        空的        |             满了             |       没满(缓冲区没满)       |
| :------ | :-------------------: | :--------------------------: | :----------------: | :--------------------------: | :--------------------------: |
| 接收    |         阻塞          |            接收值            |        阻塞        |            接收值            |            接收值            |
| 发送    |         阻塞          |            发送值            |       发送值       |             阻塞             |            发送值            |
| 关闭    |         panic         | 关闭成功，读完数据后返回零值 | 关闭成功，返回零值 | 关闭成功，读完数据后返回零值 | 关闭成功，读完数据后返回零值 |

:::danger 注意

对已经关闭的通道再执行`close`也会引发`panic`

:::
