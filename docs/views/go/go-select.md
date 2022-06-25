---
title: select多路复用
date: 2022-06-25 21:10:21
category: Go
tag:
    - select
    - channel
---

## select 多路复用

> 在某些场景下我们可能需要同时从多个通道接收数据，通道在解说数据时，如果没有数据可以被接收那么当前的 goroutine 将会发生阻塞

你可能会这么写：

```go
for {
    // 尝试从ch1接收值
    data, ok := <- ch1
    // 再尝试从ch2接收值
    data, ok := <- ch2
}
```

虽然可以实现需求，但是程序的运行性能会非常差。Go 语言内置了`select`关键字，使用它可以同时响应多个通道操作。

```go
select {
    case <-ch1:
    // ...
    case data := <-ch:
    // ...
    case ch3 <- 10:
    // ...
    default:
    // 默认操作
}
```

特点：

-   **可处理一个或多个`channel`的发送/接收操作**

-   如果多个`case`同时满足，`select`会随机选择一个执行

-   对于没有`case`的`select`会一直阻塞，可用于阻塞`main`函数

    ```go
    func main() {
        // 程序一直在这等  阻塞
        select {}
    }
    ```

    这样就可以让一些后台的 goroutine 一直在运行。相当于一个守护进程。

```go
package main

import "fmt"

func main() {
	ch := make(chan int, 1)
	for i := 1; i <= 10; i++ {
		select {
		case x := <-ch:
			fmt.Println(x)
		case ch <- i:
		}
	}
}

```

输出内容有点意想不到：

```bash
1
3
5
7
9
```

-   第一次进来，通道没有值，第一个`case`不满足，就跑下面的`case`进行发送值，所以 1 就进入到了通道
-   第二次 for 循环，`i = 2`，此时此刻，通道里有`1`，第一个`case`就满足了，通道只有一个缓存区，所以只有第一个`case`满足，所以打印 1
-   第三次 for 循环，`i = 3`，此时此刻，通道里的值已经被取出来了，所以是空的，所以第二个`case`满足，将`3`发送给通道
-   依次如下：最终只会打印单数：`1, 3, 5, 7, 9`

## 通道错误使用示例

### 示例 1

```go
package main

import (
	"fmt"
	"sync"
)

func demo1()  {
	wg := sync.WaitGroup{}

	ch := make(chan int, 10)
	for i := 0; i < 10; i++ {
		ch <- i
	}

	close(ch)

	wg.Add(3)
	for j := 0; j < 3; j++ {
		go func() {
			for {
				task := <-ch
				fmt.Println(task)
			}
		}()
	}
	wg.Wait()
}

func main() {
	demo1()
}

```

:::warning 问题

我们这里是先`close`了通道，对于关闭的通道，我们永远都是先去把通道里的所有的值先读完，最后再去执行接收操作，返回的永远都是对应的类型的零值。所以这个程序编译没问题，会一直打印`0`

:::

:::tip 解决

处理方法：

1.  要么将`for`循环换成`for range`
2.  要么使用`v, ok := <-ch`来判断

:::

### 示例 2

```go
func demo2() {
	ch := make(chan string)
	go func() {
		time.Sleep(3 * time.Second)
		ch <- "job result"
	}()

	select {
	case result := <-ch:
		fmt.Println(result)
	case <-time.After(time.Second): // 较小的超时时间
		return
	}
}

func main() {
	demo2()
}
```

-   要么从通道里获取结果
-   要么 1 秒中之后退出

> 看着确实没啥毛病？<strong>但是事实上结果却是直接退出</strong>

:::warning 问题

因为这个是一个没有缓冲区的通道，不可能有人对它进行接收操作，那么对它做发送操作，就阻塞住了，这个函数还没有执行完，那个发送的 goroutine 就不会退出，那么这个 goroutine 就会在后台默默的放着。所以当请求越来越多的时候，goroutine 就泄露了，内存越占越高。

:::

:::tip

> 这里先记住一个东西：`channel`是可以不主动关闭的，最终会被垃圾回收的。

所以这里修改只需要给`channel`加上一个缓冲区。

下面一个`case`其实是用来做超时控制的。

:::
