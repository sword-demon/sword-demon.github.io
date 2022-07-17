---
title: 解决map并发的问题
date: 2022-07-17 17:36:10
category: GoCore
tag:
    - sync
    - dirty
---

## 示例代码

```go
package main

func main() {
	m := make(map[int]int)

	go func() {
        // 起一个协程不断的读取键值为1的值
		for {
			_ = m[1]
		}
	}()

	go func() {
        // 起一个协程不断的往键为2的里面写值为2
		for {
			m[2] = 2
		}
	}()

    // 阻塞住 前面的协程就不会退出
	select {}
}

```

:::danger 报错

```bash
fatal error: concurrent map read and map write
```

并发的读和写，遇到这种它就会给你报错，一点余地都不给你留。

:::

## map 的并发问题

-   `map`的读写有并发问题
-   A 协程在桶中读取数据时，B 协程驱逐了这个桶，它就有并发问题；A 协程就会读到错误的数据或者找不到数据

### 解决方案

-   给`map`加锁(`mutex`)，如果加了锁，就表示同一时刻就只能有一个协程去访问它，所以这样也会减少一个性能
-   我们可以使用`sync.Map`这个数据结构，可以做到并发的读写，而且能做到性能的损失是可控的

```go
type Map struct {
	mu Mutex

	read atomic.Value // readOnly

	dirty map[interface{}]*entry // 万能的map

	misses int // 是否命中
}

// readOnly is an immutable struct stored atomically in the Map.read field.
type readOnly struct {
	m       map[interface{}]*entry
	amended bool // true if the dirty map contains some key not in m.
}

type entry struct {

	p unsafe.Pointer // *interface{}
}
```

-   相对于查询、修改、新增，删除会比较麻烦
-   删除可以分为正常删除和追加后删除
-   提升后，被删`key`还需特殊处理

## 总结

-   `map`在扩容时会有并发问题
-   `sync.Map`使用了 2 个`map`，分离了扩容问题
-   不会引发扩容的操作(查询和修改)，使用`read map`
-   可能引发扩容的操作(新增)使用`dirty map`
-   追加的情况少的时候`sync.Map`的性能是比较好的
