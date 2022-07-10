---
title: 并发安全与锁
date: 2021-09-27 21:33:15
category: Go
tag:
    - goroutine
    - channel
---

## 并发安全和锁

案例

```go
package main

import (
	"fmt"
	"sync"
)

// 多个goroutine并发操作全局变量x

var (
	x  int64
	wg sync.WaitGroup
)

func add() {
	for i := 0; i < 5000; i++ {
		// 1. 拿到全局变量x
		// 2. 给这个值+1
		// 3. 加1后在赋值给全局变量x
		x++ // 对全局变量进行每次+1
	}
	wg.Done()
}

func main() {
	wg.Add(2)
	go add()
	go add()
	wg.Wait()
	fmt.Println(x) // 7180 5285 各种值
}

```

<!-- more -->

## 互斥锁

使用互斥锁来解决上述的问题。互斥锁是一种常用来控制共享资源访问的方法，它能够保证同时只有一个`goroutine`可以访问共享资源。Go 语言中使用`sync`包里的`Mutex`类型来实现互斥锁。

```go
package main

import (
	"fmt"
	"sync"
)

// 多个goroutine并发操作全局变量x

var (
	x  int64
	wg sync.WaitGroup
	lock sync.Mutex
)

func add() {
	for i := 0; i < 5000; i++ {
		// 1. 拿到全局变量x
		// 2. 给这个值+1
		// 3. 加1后在赋值给全局变量x
		lock.Lock() // 加锁
		x++ // 对全局变量进行每次+1
		lock.Unlock() // 释放锁
	}
	wg.Done()
}

func main() {
	wg.Add(2)
	go add()
	go add()
	wg.Wait()
	fmt.Println(x) // 10000 这个时候不管执行多少次都是10000
}

```

### 使用一个容量为 1 的通道来保证同一时间最多有一个 goroutine 能访问共享变量

```go
package main

var (
	sema    = make(chan struct{}, 1) // 用来保护  balance的二进制信号量
	balance int
)

func Deposit(amount int) {
	sema <- struct{}{} // 获取令牌
	balance = balance + amount
	<-sema // 释放令牌
}

func Balance() int {
	sema <- struct{}{} // 获取令牌
	b := balance
	<-sema // 释放令牌
	return b
}

```

> 使用`sync.Mutext`

```go
package main

import "sync"

var (
	//sema    = make(chan struct{}, 1) // 用来保护  balance的二进制信号量
	mu sync.Mutex
	balance int
)

func Deposit(amount int) {
	//sema <- struct{}{} // 获取令牌
	mu.Lock()
	balance = balance + amount
	//<-sema // 释放令牌
	mu.Unlock()
}

func Balance() int {
	//sema <- struct{}{} // 获取令牌
	mu.Lock()
	b := balance
	//<-sema // 释放令牌
	mu.Unlock()
	return b
}

```

## 读写互斥锁

很多实际场景读的比写的多，读不涉及一个资源的更改和变幻，是没有必要加锁的，这样使用读写互斥锁比较适合。读写锁在 Go 语言里使用`sync`包的`RWMutex`类型。

读写锁：

-   当一个`goroutine`获得读锁只有，其他的`goroutine`如果是获取读锁会继续获取读锁，如果是写锁就会等待。
-   当一个`goroutine`获取写锁时，其他的`goroutine`无论是读还是写锁都会等待。

案例：

```go
// 使用互斥锁的时间

package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	x    int64
	wg   sync.WaitGroup
	lock sync.Mutex
)

func read() {
	lock.Lock()
	time.Sleep(time.Millisecond)
	lock.Unlock()
	wg.Done()
}

func write() {
	lock.Lock()
	x++
	time.Sleep(time.Millisecond * 10)
	lock.Unlock()
	wg.Done()
}

func main() {
	start := time.Now()
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go read()
	}

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go write()
	}

	wg.Wait()
	fmt.Println(time.Now().Sub(start))
}

>>>输出
1.387438292s

```

```go
// 使用读写锁

package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	x    int64
	wg   sync.WaitGroup
	rwLock sync.RWMutex
)

func read() {
	rwLock.RLock() // 读锁
	time.Sleep(time.Millisecond)
	rwLock.RUnlock() // 是否读锁
	wg.Done()
}

func write() {
	rwLock.Lock()
	x++
	time.Sleep(time.Millisecond * 10)
	rwLock.Unlock()
	wg.Done()
}

func main() {
	start := time.Now()
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go read()
	}

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go write()
	}

	wg.Wait()
	fmt.Println(time.Now().Sub(start))
}

>>>输出
122.424125ms

```

:::danger

**读写锁是非常适合读多写少的场景，如果读和写的操作差别不大，读写锁的优势就发挥不出来**

:::

## sync.WaitGroup

| 方法名                               | 功能               |
| ------------------------------------ | ------------------ |
| `func(wg *WaitGroup) Add(delta int)` | 计数器+delta       |
| `(wg *WaitGroup) Done()`             | 计数器-1           |
| `(wg *WaitGroup) Wait()`             | 阻塞知道计数器为 0 |

它内部维护了一个计数器，计数器的值可以增加和减少，每个任务完成时，通过调用`Done`方法将计数器减 1，通过`Wait`方法来等待并发任务执行完成，当计数器为 0 时表示所有并发任务已经完成。

```go
var wg sync.WaitGroup

func hello() {
    defer wg.Done()
    fmt.Println("hello world")
}

func main() {
    wg.Add(1)
    go hello()
    fmt.Println("main goroutine")
    wg.Wait()
}
```

## sync.Once

在某些场景下，某些操作只需要执行一次，例如只加载一次配置文件，只关闭一次通道等。

Go 语言中使用`sync`包中的`Once`类型

它只有一个`Do`方法

```go
func (o *Once) Do (f func()) {}
```

### 加载配置文件案例

延迟一个开销很大的初始化操作到真正用到它的时候再执行是一个很好的时间。因为预先初始化一个变量(比如使用`init`函数中完成的初始化)会增加程序的启动耗时，而且这个变量可能后面都没用上，那么这个初始化就不是必要的。

```go
var icons map[string]image.Image

func loadIcons() {
	icons = map[string]image.Image{
		"left":  loadIcon("left.png"),
		"up":    loadIcon("up.png"),
		"right": loadIcon("right.png"),
		"down":  loadIcon("down.png"),
	}
}

func Icon(name string) image.Image {
	if icons == nil {
		loadIcons()
	}
	return icons[name]
}
```

多个`goroutine`并发同时调用 Icon 函数时并不是并发安全的。

使用`sync.Once`改造

```go
var icons map[string]image.Image

var loadIconsOnce sync.Once

func loadIcons() {
	icons = map[string]image.Image{
		"left":  loadIcon("left.png"),
		"up":    loadIcon("up.png"),
		"right": loadIcon("right.png"),
		"down":  loadIcon("down.png"),
	}
}

func Icon(name string) image.Image {
  loadIconsOnce Do(loadIcons)
	return icons[name]
}
```

### 并发安全的单例模式

```go
type singleton struct{}

var instance *singleton
var once sync.Once

func GetInstance() *singleton {
    once.Do(func() {
        instance = &singleton{}
    })
    return instance
}
```

`sync.Once`其实内部包含一个互斥锁和一个布尔值，互斥说保证布尔值和数据的安全，而布尔值用来记录初始化的操作是否完成。这样设计就能保证初始化操作的时候是并发安全的，并且初始化操作也不会被执行多次。

## sync.Map

> Go 语言内置的 map 不是并发安全的

```go
package main

import (
	"fmt"
	"strconv"
	"sync"
)

var m = make(map[string]int)

func get(key string) int {
	return m[key]
}

func set(key string, value int) {
	m[key] = value
}

func main() {
	wg := sync.WaitGroup{}
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(n int) {
			key := strconv.Itoa(n)
			set(key, n)
			fmt.Printf("k=%v, v=%v\n", key, get(key))
			wg.Done()
		}(i)
	}
	wg.Wait()
}

```

```bash
fatal error: concurrent map writes

goroutine 13 [running]:
runtime.throw({0x10441c719, 0x15})
        /usr/local/go/src/runtime/panic.go:1198 +0x54 fp=0x140000726b0 sp=0x14000072680 pc=0x1043b9914
runtime.mapassign_faststr(0x1044464e0, 0x14000058180, {0x10441f462, 0x1})
        /usr/local/go/src/runtime/map_faststr.go:211 +0x3e8 fp=0x14000072720 sp=0x140000726b0 pc=0x104398238
main.set(...)

```

:::warning

在多个 goroutine 里，又给 map 设置值，又取值，对 map 进行并发操作，会造成并发不安全问题。

> 应用场景

当一个 map 变量或者结构体里的一个 map 类型的字段可能会被多个 goroutine 访问的时候，你要注意使用并发安全的方法：

1.  自己加锁
2.  使用`sync.Map`

:::

`sync.Map`的常见使用函数：

| 方法名                                                                              | 功能                                 |
| ----------------------------------------------------------------------------------- | ------------------------------------ |
| func(m \*Map) Store(key, value interface{})                                         | 存储 key-value 数据                  |
| func(m \*Map) Load(key interface{}) (value interface{}, ok bool)                    | 查询 key 对应的 value                |
| func(m \*Map) LoadOrStore(key, value interface{}) (actual interface{}, loaded bool) | 查询或存储 key 对应的 value          |
| func(m \*Map) LoadAndDelete(key interface{}) (value interface{}, loaded bool)       | 查询并删除 key                       |
| func(m \*Map) delete(key interface{})                                               | 删除 key                             |
| func(m \*Map) Range(f func(key, value interface{}) bool)                            | 对 map 中的每个 key-value 一次调用 f |

```go
package main

import (
	"fmt"
	"strconv"
	"sync"
)

// 并发安全的map
var syncMap = sync.Map{}

func main() {
	wg := sync.WaitGroup{}
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(n int) {
			key := strconv.Itoa(n)
			syncMap.Store(key, n)         // 存储key-value
			value, _ := syncMap.Load(key) // 根据key获取值
			fmt.Printf("k=%v, v=%v\n", key, value)
			wg.Done()
		}(i)
	}
	wg.Wait()
}

```

## 原子操作

> 针对整数数据类型(int32, uint32, int64, uint64)我们还可以使用原子操作来保证并发安全，通常直接使用原子操作比使用锁操作效率更高。Go 语言中原子操作由内置的标准库`sync/atomic`提供。

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

type Counter interface {
	Inc()
	Load() int64
}

type CommonCounter struct {
	counter int64
}

func (c *CommonCounter) Inc() {
	c.counter++
}

func (c *CommonCounter) Load() int64 {
	return c.counter
}

// 互斥锁版

type MutexCounter struct {
	counter int64
	lock    sync.Mutex
}

func (m *MutexCounter) Inc() {
	m.lock.Lock()
	defer m.lock.Unlock()
	m.counter++
}

func (m *MutexCounter) Load() int64 {
	m.lock.Lock()
	defer m.lock.Unlock()
	return m.counter
}

// 原子操作版

type AutomicCounter struct {
	counter int64
}

func (a *AutomicCounter) Inc() {
	atomic.AddInt64(&a.counter, 1) // 最小粒度的操作
}

func (a *AutomicCounter) Load() int64 {
	return atomic.LoadInt64(&a.counter)
}

func test(c Counter) {
	var wg sync.WaitGroup
	start := time.Now()
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			c.Inc()
			wg.Done()
		}()
	}
	wg.Wait()
	end := time.Now()
	fmt.Println(c.Load(), end.Sub(start))
}

func main() {
	// 非并发安全
	c1 := CommonCounter{}
	test(&c1)

	// 使用互斥锁实现并发安全
	c2 := MutexCounter{}
	test(&c2)

	// 并发安全且比互斥锁效率更高
	c3 := AutomicCounter{}
	test(&c3)
}

```

```bash
963 465.75µs
1000 382.583µs
1000 365.458µs

```

第一个的值就会经常发生变化，就是不安全的表现。
