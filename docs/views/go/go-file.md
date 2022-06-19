---
title: go文件操作
date: 2022-06-05 14:56:15
category: Go
tag:
    - file
---

## 打开和关闭文件

`os.Open`函数可以打开一个文件，返回一个`*File`和一个`err`，对得到的文件实例可以调用`Close()`方法去关闭文件。

通常为了防止忘记关闭文件，使用`defer`函数来关闭文件

```go
package main

import (
	"fmt"
	"os"
)

func demo1() {
	// 默认以读的方式打开文件
    f, err := os.Open("../../fib.txt")
	if err != nil {
		fmt.Println(err)
		return
	}
    // 使用defer防止忘记关闭文件
	defer f.Close()
	// 读取文件内容
}

func main() {
	demo1()
}

```

**注意：这里需要注意点严谨，防止打开文件报错而导致空指针去调用 Close()方法带来问题，最好卸载判断之后，保证`f`是一个合法的对象**

## file.Read

`Read`方法定义如下：

```go
func (f *File) Read(b []byte) (n int, err error)
```

它接收一个字节切片，返回读取的字节数和可能的具体错误，读到文件末尾时会返回`0`和`io.EOF`

```go
func demo1() {
	// 默认以读的方式打开文件
	f, err := os.Open("./fib.txt")
	// 使用defer防止忘记关闭文件
	defer f.Close()
	if err != nil {
		fmt.Println(err)
		return
	}
	// 读取文件内容
	var data [4096]byte // 数组
	f.Read(data[:]) // 传入字节切片
	fmt.Println(data)
}
```

如果不确定有多少内容，这里写的确切的 4k 数据，我们可以使用返回值来的字节数来打印

```go
func demo1() {
	// 默认以读的方式打开文件
	f, err := os.Open("./fib.txt")
	// 使用defer防止忘记关闭文件
	defer f.Close()
	if err != nil {
		fmt.Println(err)
		return
	}
	// 读取文件内容
	var data [4096]byte
	l, err := f.Read(data[:])
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(data[:l])
	fmt.Printf("%s\n", data[:l])
}
```

如果文件实在很大，需要循环去读，需要注意一个`io.EOF`代表文件读完了。

## bufio 读取文件

```go
func bufioRead() {
	f, err := os.Open("./fib.txt")
	if err != nil {
		fmt.Println(err)
		return
	}
	// 使用defer防止忘记关闭文件
	defer f.Close()
	reader := bufio.NewReader(f)
	for {
		// 每次读取到换行符 = 一行一行的读
		readString, err := reader.ReadString('\n')
		if err != nil {
			return
		}
		if err == io.EOF {
			// 读完了
			fmt.Println(readString)
			return
		}
		fmt.Println(readString)
	}
}
```

## ioutil 读取整个文件

只需要将文件名作为参数传入，比较适合大文件

```go
func ioutilRead()  {
	content, err := ioutil.ReadFile("./fib.txt")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(content))
}
```

## 写入操作

`os.OpenFile`函数传入第二个参数`flag`来保证

```go
func writeDemo() {
	f, err := os.OpenFile("./xx.txt", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0666)
	if err != nil {
		fmt.Println(err)
		return
	}
	// 使用defer防止忘记关闭文件
	defer f.Close()
	f.Write([]byte("\nhello world"))
	f.WriteString("hello world你好世界")
}
```

使用`bufio`来写入

```go
func bufioWrite() {
	f, err := os.OpenFile("./xx.txt", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0666)
	if err != nil {
		fmt.Println(err)
		return
	}
	// 使用defer防止忘记关闭文件
	defer f.Close()
	writer := bufio.NewWriter(f)
	for i := 0; i < 10; i++ {
		writer.WriteString("hello world\n") // 将数据写入缓存
	}
	writer.Flush() // 将缓存中的内容写入文件
}
```

使用`ioutil`写入

```go
func ioutilWrite()  {
	err := ioutil.WriteFile("./xx.txt", []byte("hello world\n"), 0666)
	if err != nil {
		fmt.Println(err)
		return
	}
}
```

## 拷贝文件函数

```go
func CopyFile(dstName, srcName string) (written int64, err error) {
   // 以读的方式打开
   src, err := os.Open(srcName)
   if err != nil {
      fmt.Printf("open %s failed, err:%v\n", srcName, err)
      return
   }
   defer src.Close()
   // 以写|创建的方式打开目标文件
   dst, err := os.OpenFile(dstName, os.O_WRONLY|os.O_CREATE, 0644)
   if err != nil {
      fmt.Printf("open %s failed, err:%v\n", dstName, err)
      return
   }
   defer dst.Close()
   // 调用io.Copy拷贝内容
   return io.Copy(dst, src)
}
```

## 模拟实现一个`cat`命令

```go
func cat(r *bufio.Reader) {
	for {
		buf, err := r.ReadBytes('\n')
		if err == io.EOF {
			// 退出之前将已读到的内容输出
			fmt.Fprintf(os.Stdout, "%s", buf)
			break
		}
		fmt.Fprintf(os.Stdout, "%s", buf)
	}
}

func main() {
	// 解析命令行参数
	flag.Parse()
	if flag.NArg() == 0 {
		// 没有默认参数从标准输入获取内容
		cat(bufio.NewReader(os.Stdin))
	}
	// 依次读取每个指定文件的内容并打印到终端
	for i := 0; i < flag.NArg(); i++ {
		f, err := os.Open(flag.Arg(i))
		if err != nil {
			fmt.Fprintf(os.Stdout, "reading from %s failed, err:%v\n", flag.Arg(i), err)
			continue
		}
		cat(bufio.NewReader(f))
	}
}
```
