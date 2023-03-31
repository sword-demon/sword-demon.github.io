---
title: go实现斐波那契数列多种方式
date: 2023-03-31 23:48:10
category: Interview
tag:
    - go
    - interview
---

## 斐波那契数列

:::note 源自百度百科
斐波那契数列（Fibonacci sequence），又称黄金分割数列，因数学家莱昂纳多·斐波那契（Leonardo Fibonacci）以兔子繁殖为例子而引入，故又称为“兔子数列”，指的是这样一个数列：1、1、2、3、5、8、13、21、34、……在数学上，斐波那契数列以如下被以递推的方法定义：F(0)=1，F(1)=1, F(n)=F(n - 1)+F(n - 2)（n ≥ 2，n ∈ N\*）在现代物理、准晶体结构、化学等领域，斐波那契数列都有直接的应用，为此，美国数学会从 1963 年起出版了以《斐波那契数列季刊》为名的一份数学杂志，用于专门刊载这方面的研究成果。
:::

## 递归方式

```go
func Fibonacci(n int) int {
	if n < 2 {
		return 1
	}

	return Fibonacci(n-1) + Fibonacci(n-2)
}
```

## 使用闭包函数

```go
func fibonacci() func() int {
	a, b := 0, 1
	return func() int {
		a, b = b, a+b
		return a
	}
}

func main() {
	f := fibonacci()
	for i := 0; i < 10; i++ {
		fmt.Println(f())
	}
}
```

## 使用`channel`来保存结果

```go
func fib(n int, c chan int) {
	a, b := 0, 1
	for i := 0; i < n; i++ {
		a, b = b, a+b
		c <- a
	}

	close(c)
}

func main() {
	c := make(chan int, 10)
	fib(cap(c), c)
	for i := range c {
		fmt.Println(i)
	}
}
```
