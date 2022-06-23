---
title: 多协程执行收集结果的技巧
date: 2022-06-24 00:39:10
category: Note
tag:
    - goroutine
    - skill
---

## 多协程的好处

比如，此时有一个任务

```go
func job(index int) int {
  time.Sleep(time.Millisecond * 500)
  return index
}
```

我们手动加了耗时操作，我们使用正常的方式来进行获取。

```go
func main() {
  start := time.Now()
  num := 5
  for i := 0; i < num; i++ {
      fmt.Println(job(param))
  }
  end := time.Since(start)
  fmt.Println("耗时: ", end.String())
}
```

这样下来运行的耗时是需要 2s 多一点的。

## 初级版本

我们接下来使用`sync.WaitGroup + goroutine` 来优化

```go
func main() {
  start := time.Now()
  num := 5

  wg := sync.WaitGroup{}
  for i := 0; i < num; i++ {
    wg.Add(1)
    go func(param int) {
      defer wg.Done()
      fmt.Println(job(param))
    }(i)
  }
  wg.Wait()

  end := time.Since(start)
  fmt.Println("耗时: ", end.String())
}
```

这样，使用了协程 来处理之后，耗时变成了`501.338458ms `

再次优化，我们可以加上`channel `

```go
func main() {
  start := time.Now()
  num := 5
  result := make(chan int) // 结果chan
  //wg := sync.WaitGroup{}
  for i := 0; i < num; i++ {
    //wg.Add(1)
    go func(param int) {
      //defer wg.Done()
      result <- job(param)
      //fmt.Println(job(param))
    }(i)
  }
  //wg.Wait()

  // low 写法
  count := 0

  for item := range result {
    count++
    fmt.Println("收到结果:", item)

    if count == num {
      // 关闭channel 不出现死锁
      close(result)
      break
    }
  }
  end := time.Since(start)
  fmt.Println("耗时: ", end.String())
}

```

这样也会得到以下结果

```bash
➜ go run 1.multi_co.go
收到结果: 3
收到结果: 0
收到结果: 1
收到结果: 4
收到结果: 2
耗时:  501.338458ms
```

## 优雅版本

优雅的关闭`channel `

```go
package main

import (
  "fmt"
  "sync"
  "time"
)

func job(index int) int {
  time.Sleep(time.Millisecond * 500)
  return index
}

func main() {
  start := time.Now()
  num := 5
  result := make(chan int) // 结果chan
  wg := sync.WaitGroup{}
  for i := 0; i < num; i++ {
    wg.Add(1)
    go func(param int) {
      defer wg.Done()
      result <- job(param)
    }(i)
  }

  go func() {
    defer close(result)
    // 等到上面结束才会执行close
    wg.Wait()
  }()

  // 没有值会阻塞，直至channel被close掉
  for item := range result {
    fmt.Println("收到结果:", item)
  }
  end := time.Since(start)
  fmt.Println("耗时: ", end.String())
}

```
