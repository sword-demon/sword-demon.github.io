---
title: 切片原理常问
date: 2022-11-23 00:10:10
category: Interview
tag:
    - go
    - slice
---

# 切片常问

## go 的 slice 在函数传参的时候是值传递还是引用传递

> 严格意义上是值传递，效果又呈现出引用传递的效果。

```go
func printSlice(data []string) {
    data[0] = "java"
}

func main() {
    course := []string{"go", "slice", "gin"}
    printSlice(courses)
    fmt.Println(courses)
}
```

上述代码，将切片使用打印函数更改第一个元素的时候，再次打印会显示更改了元素；

```go
func printSlice(data []string) {
    data[0] = "java"
    for i := 0; i < 10; i++ {
        data = append(data, strconv.Itoa(i))
    }
}

func main() {
    course := []string{"go", "slice", "gin"}
    printSlice(courses)
    fmt.Println(courses)
}
```

但是这里，你往里面添加数据，下面打印的时候又不会新增元素；这里又表现出不像个引用传递。

:::tip

其实，它是值传递；`go`的切片本质上是一个结构体

```go
type slice struct {
    array unsafe.Pointer // 切片中实际存储数据的数组指针，指向一块连续的内存
    len int // 切片中的元素的数量
    cap int // 切片中的容量
}
```

`go`语言中结构体是值传递，在编译的`course := []string{"go", "slice", "gin"}`时候会变成，如果使用`make`来定义，则都可以指定切片的结构体的 3 个属性。

```go
myslice := slice {
    len: 3,
    cap: 3,
    array // 真正指向数据的数组指针
}
```

切片在进行`append`的时候极有可能会触发扩容机制，因为是值传递，复制了一份，如果遇到扩容情况，底层指向的数字也会进行复制，两者修改的内容就会不一样，就产生不了交集，所以一般使用`append`都需要有一个参数来接收。

:::

```go
func main() {
    data := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
    s1 := data[1:6]
    s2 := data[2:7]
    s2[0] = 22
    fmt.Println(s2) // [22 4 5 6 7]
    fmt.Println(s1) // [2 22 4 5 6]
}
```

```go
func main() {
    data := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
    s1 := data[1:6]
    s2 := data[2:7]
    s2 = append(s2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10) // 加到它扩容为止
    s2[0] = 22 // 底层指向的数组的是一个新的地址
    fmt.Println(s2) // [22 4 5 6 7 1 2 3 4 5 6 7 8 9 10]
    fmt.Println(s1) // [2 3 4 5 6]
}
```

这样一看，对应的`s1`就没有被修改掉值。

可以通过以下代码来观察容量的变化

```go
func main() {
	var data []int
	for i := 0; i < 2000; i++ {
		data = append(data, i)
		fmt.Printf("len: %d, cap: %d\r\n", len(data), cap(data))
	}
}
```

-   大部分都是以成倍的增长
-   增长到了 1024 的时候，就只增长前面的 1/4

源码位置：`runtime/slice.go`

```go
newcap := old.cap
doublecap := newcap + newcap
if cap > doublecap {
    newcap = cap
} else {
    if old.cap < 1024 {
        newcap = doublecap
    } else {
        // Check 0 < newcap to detect overflow
        // and prevent an infinite loop.
        for 0 < newcap && newcap < cap {
            newcap += newcap / 4
        }
        // Set newcap to the requested cap when
        // the newcap calculation overflowed.
        if newcap <= 0 {
            newcap = cap
        }
    }
}
```

![image-20221123000237608](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221123000237608.png)

如图所示：`1280 = 1024 + 1024 / 4`正好对上`newcap += newcap / 4`这一段代码。

## 总结

1. 如果当前所需容量 （`cap`） 大于原先容量的两倍 （`doublecap`），则最终申请容量（`newcap`）为当前所需容量（`cap`）；

2. 如果==条件 1== 不满足，表示当前所需容量（`cap`）不大于原容量的两倍（`doublecap`），则进行如下判断；

3. 如果原切片长度（`old.len`）小于 1024，则最终申请容量（newcap）等于原容量的两倍（`doublecap`）；

4. 否则，最终申请容量（`newcap`，初始值等于 `old.cap`）每次增加 `newcap/4`，直到大于所需容量（`cap`）为止，然后，判断最终申请容量（`newcap`）是否溢出，如果溢出，最终申请容量（`newcap`）等于所需容量（`cap`）

## 切片自定义实现新增元素和删除元素

```go
func Add(s []int, index int, value int) []int {
	// 先把长度+1
	s = append(s, 0)
	copy(s[index+1:], s[index:])
	s[index] = value
	return s
}

func Delete(s []int, index int) []int {
	return append(s[:index], s[index+1:]...)
}

func TestAppendSlice(t *testing.T) {
	a := make([]int, 6, 10)
	a[1] = 12
	a[2] = 13
	fmt.Println(a)
	Add(a, 1, 10)
	Add(a, 2, 11)
	fmt.Println(a)
	fmt.Println(len(a))
}

func TestDeleteSlice(t *testing.T) {
	a := []int{1, 2, 3, 4}
	fmt.Println(a)
	fmt.Println(a[2:])
	Delete(a, 1)
	fmt.Println(a)
}

func TestFibonacci(t *testing.T) {
	t.Log(Fibonacci(4))
	f := fibonacci()
	for i := 0; i < 10; i++ {
		fmt.Println(f())
	}
	c := make(chan int, 10)
	fib(cap(c), c)
	for i := range c {
		fmt.Println(i)
	}
}
```
