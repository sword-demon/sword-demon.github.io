---
title: go错误处理
date: 2022-06-13 22:01:15
category: Go
tag:
    - error
---

## error 处理一

我们先来造出来一个`error`

```go
func writeFile(filename string) {
	// 打开一个文件
	file, err := os.OpenFile(filename, os.O_EXCL|os.O_CREATE, 0666)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	// 先写到内存里
	writer := bufio.NewWriter(file)
	// 刷到硬盘里
	defer writer.Flush()

	f := fib()
	for i := 0; i < 20; i++ {
		_, err := fmt.Fprintln(writer, f())
		if err != nil {
			return
		}
	}
}
```

`O_EXCL`如果存在这个文件，我们现在会打开不了

```bash
panic: open fib.txt: file exists

goroutine 1 [running]:
main.writeFile({0x10a3f0d, 0xc0000001a0})

```

程序会挂掉。

加一段处理代码

```go
func writeFile(filename string) {
	// 打开一个文件
	file, err := os.OpenFile(filename, os.O_EXCL|os.O_CREATE, 0666)
	if err != nil {
		fmt.Println("file already exist")
        // 程序挂掉，这里就应该结束 return 返回
		return
	}
	defer file.Close()

	// 先写到内存里
	writer := bufio.NewWriter(file)
	// 刷到硬盘里
	defer writer.Flush()

	f := fib()
	for i := 0; i < 20; i++ {
		_, err := fmt.Fprintln(writer, f())
		if err != nil {
			return
		}
	}
}
```

我们可以点开`OpenFile`源码，查看返回值类型，为`(*File, error)`，我们再点击`error`进去找到源码：`builtin.go`

```go
// The error built-in interface type is the conventional interface for
// representing an error condition, with the nil value representing no error.
type error interface {
	Error() string
}
```

它会获得一个错误的字符串消息

```go
if err != nil {
    fmt.Println("Error: ",err.Error())
    return
}
```

他会帮我们打印出错误信息。

我们再回过头看`OpenFile`的一些源码信息：

```go
// If there is an error, it will be of type *PathError.
func OpenFile(name string, flag int, perm FileMode) (*File, error) {
	testlog.Open(name)
	f, err := openFileNolog(name, flag, perm)
	if err != nil {
		return nil, err
	}
	f.appendMode = flag&O_APPEND != 0

	return f, nil
}
```

看到注释的地方，它如果出错，会变成`*PathError`类型，我们再针对这个错误进行处理错误

```go
if err != nil {
    if pathError, ok := err.(*os.PathError); !ok {
        panic(err)
    } else {
        fmt.Println(pathError.Op, pathError.Path, pathError.Err)
    }
    return
}
```

我们也可以自己定义`error`的内容

```go
err = errors.New("this is a custom error")
```

如果程序没有匹配到`pathError`，则会`panic`出这个信息。

当然，因为`error`的源码为`interface`，我们可以自己去实现接口，我们可以自己定义一些`error`的类型。

## 错误处理二

写一个`web`获取文件的案例代码

```go
package main

import (
	"io/ioutil"
	"net/http"
	"os"
)

func main() {
	http.HandleFunc("/list/",
		func(writer http.ResponseWriter, request *http.Request) {
			path := request.URL.Path[len("/list/"):] // /list/fib.txt
			file, err := os.Open(path)
			if err != nil {
				panic(err)
			}
			defer file.Close()

			all, err := ioutil.ReadAll(file)
			if err != nil {
				panic(err)
			}

			writer.Write(all)
		})

	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		panic(err)
	}
}

```

我们输入:`localhost:8888/list/fib.txt`进行访问

![结果](https://raw.githubusercontent.com/sword-demon/img/master/img/20220325221705.png)

结果：

```
1
1
2
3
5
8
13
21
34
55
89
144
233
377
610
987
1597
2584
4181
6765
```

但是我们总归是会出现输入错误的链接的时候，我们假装输入错误一下，就会出现错误。

```bash
2022/03/25 22:46:04 http: panic serving [::1]:56670: open fib.txta: no such file or directory
goroutine 43 [running]:
net/http.(*conn).serve.func1()

```

但是，这边`http`服务还没`die`掉，这边会有一个保护措施。

我们进行改进

```go
func main() {
	http.HandleFunc("/list/",
		func(writer http.ResponseWriter, request *http.Request) {
			path := request.URL.Path[len("/list/"):] // /list/fib.txt
			file, err := os.Open(path)
			if err != nil {
				http.Error(writer, err.Error(), http.StatusInternalServerError)
				return
			}
			defer file.Close()

			all, err := ioutil.ReadAll(file)
			if err != nil {
				panic(err)
			}

			writer.Write(all)
		})

	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		panic(err)
	}
}

```

再次访问错误链接，出现以下结果：

```
open fib.txta: no such file or directory
```

但是这种很明显的这种错误信息，我们不应该暴露给外部看到，我们应该有一个地方进行包装一下这些错误消息。

我们将这段业务逻辑分离出来。

`/filelisting/handler.go`

```go
package filelisting

import (
	"io/ioutil"
	"net/http"
	"os"
)

func HandlerFileList(writer http.ResponseWriter, request *http.Request) error {
	path := request.URL.Path[len("/list/"):] // /list/fib.txt
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	all, err := ioutil.ReadAll(file)
	if err != nil {
		return err
	}

	writer.Write(all)
	return nil
}

```

这里业务逻辑专注于进行业务逻辑的处理，我们只要将错误进行返回，抛给别人去处理即可。

我们为了方便处理，我们定义一个该方法的类型的结构体

`main.go`

```go
type appHandler func(writer http.ResponseWriter, request *http.Request) error
```

封装一个处理错误的函数，这个是一个函数式编程，输入也是函数，输出也是函数。

```go
func errWrapper(handler appHandler) func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		err := handler(writer, request)
		if err != nil {
			code := http.StatusOK
			switch  {
			// 文件不存在的错
			case os.IsNotExist(err):
				// 向 writer 汇报错误 你的东西 找不到
				code = http.StatusNotFound
			default:
				code = http.StatusInternalServerError
			}
			http.Error(writer, http.StatusText(code), code)
		}
	}
}
```

```go
func main() {
	http.HandleFunc("/list/", errWrapper(filelisting.HandlerFileList))

	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		panic(err)
	}
}
```

此时再重新运行服务，再次输入错误链接，页面出现`Not Found`简单的提示信息，这个就是一个非常普通的一个错误。

![结果](https://raw.githubusercontent.com/sword-demon/image_store/master/blog/20220325233032.png)

我们还是有必要进行加上日志记录，仅仅是页面上提示，我们最终还是要知道发生什么错误的

```go
log.Printf("Err Handling request: %s", err.Error())
```

```
2022/03/25 23:27:07 Err Handling request: open fib.txta: no such file or directory

```

最后我们还加了一个文件是否有权限访问的判断：

```go
package main

import (
	"learngo/errhandling/filelisteningserver/filelisting"
	"log"
	"net/http"
	"os"
)

type appHandler func(writer http.ResponseWriter, request *http.Request) error

func errWrapper(handler appHandler) func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		err := handler(writer, request)
		if err != nil {
			log.Printf("Err Handling request: %s", err.Error())
			code := http.StatusOK
			switch  {
			// 文件不存在的错
			case os.IsNotExist(err):
				// 向 writer 汇报错误 你的东西 找不到
				code = http.StatusNotFound
			case os.IsPermission(err):
				code = http.StatusForbidden
			default:
				code = http.StatusInternalServerError
			}
			http.Error(writer, http.StatusText(code), code)
		}
	}
}

func main() {
	http.HandleFunc("/list/", errWrapper(filelisting.HandlerFileList))

	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		panic(err)
	}
}

```

## 统一出错处理 3

当前，我们和约定处理逻辑的函数写的都是`/list/`下的内容，假如，主函数不按套路出牌，不写`/list/`，会出现什么样的问题？

```go
func main() {
	http.HandleFunc("/", errWrapper(filelisting.HandlerFileList))

	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		panic(err)
	}
}
```

当然我们继续访问`/list/fib.txt`还是可以的。但是随便输入一个不是`/list/`的就会报错。

```
2022/03/26 14:17:17 http: panic serving [::1]:57403: runtime error: slice bounds out of range [6:4]
goroutine 53 [running]:
net/http.(*conn).serve.func1()

```

```
/usr/local/go/src/net/http/server.go:1802 +0xb9
```

出错后，我们可以点击查看这个源码：

```go
defer func() {
    if err := recover(); err != nil && err != ErrAbortHandler {
        const size = 64 << 10
        buf := make([]byte, size)
        buf = buf[:runtime.Stack(buf, false)]
        c.server.logf("http: panic serving %v: %v\n%s", c.remoteAddr, err, buf)
    }
    if !c.hijacked() {
        c.close()
        c.setState(c.rwc, StateClosed, runHooks)
    }
}()
```

这边有一个`recover`用于保护`http`服务。

所以，我们在处理错误的时候也要进行一个保护，我们进行`recover`之后，就不会让源码去进行`recover`

```go
func errWrapper(handler appHandler) func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {

		defer func() {
			r := recover()
			http.Error(writer, http.StatusText(http.StatusInternalServerError),
				http.StatusInternalServerError)
			log.Printf("Panic: %v", r)
		}()

		err := handler(writer, request)

		if err != nil {
			log.Printf("Err Handling request: %s", err.Error())
			code := http.StatusOK
			switch  {
			// 文件不存在的错
			case os.IsNotExist(err):
				// 向 writer 汇报错误 你的东西 找不到
				code = http.StatusNotFound
			case os.IsPermission(err):
				code = http.StatusForbidden
			default:
				code = http.StatusInternalServerError
			}
			http.Error(writer, http.StatusText(code), code)
		}
	}
}
```

![访问结果](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220326142536.png)

我们再次访问，出现以上结果，日志也对应进行打印：

```
2022/03/26 14:25:09 Panic: runtime error: slice bounds out of range [6:4]

```

---

这边我们是在主函数去掉了`/list/`，但是处理逻辑那边，现在也进行了变化，

上面的保护代码，我们需要进行修改，因为我们是直接认为是有错误的，但是`r`不一定的是都是有错误的，不然前面的成功的也不能执行了。

```go
func errWrapper(handler appHandler) func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {

		defer func() {
            // 判断一下 r 是否有错误
			if r := recover(); r != nil {
				http.Error(writer, http.StatusText(http.StatusInternalServerError),
					http.StatusInternalServerError)
				log.Printf("Panic: %v", r)
			}
		}()

		err := handler(writer, request)

		if err != nil {
			log.Printf("Err Handling request: %s", err.Error())
			code := http.StatusOK
			switch  {
			// 文件不存在的错
			case os.IsNotExist(err):
				// 向 writer 汇报错误 你的东西 找不到
				code = http.StatusNotFound
			case os.IsPermission(err):
				code = http.StatusForbidden
			default:
				code = http.StatusInternalServerError
			}
			http.Error(writer, http.StatusText(code), code)
		}
	}
}
```

接着我们在逻辑处理的地方进行调整

```go
const prefix = "/list/"

func HandlerFileList(writer http.ResponseWriter, request *http.Request) error {

    // 判断请求的地址是否有这个前缀的
	if strings.Index(request.URL.Path, prefix) != 0 {
		return errors.New("path must start with " + prefix)
	}

	path := request.URL.Path[len(prefix):] // /list/fib.txt
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	all, err := ioutil.ReadAll(file)
	if err != nil {
		return err
	}

	writer.Write(all)
	return nil
}
```

我们再次进行访问几个链接进行测试：

```
2022/03/26 14:32:18 Err Handling request: path must start with /list/
2022/03/26 14:32:21 Err Handling request: path must start with /list/
2022/03/26 14:32:25 Err Handling request: path must start with /list/

```

页面上还是出现

```
Internal Server Error
```

但是考虑到，上面的这个错误信息完全可以让用户看到，我们就得改一下代码，我们需要区分一下可以给用户看的信息和不能给用户看的错误信息。

> 所以我们就需要另外定义一些可以让用户看到错误信息

我们自己定义一个自定义处理错误消息的接口

```go
type userError interface {
	error            // 给系统看的
	Message() string // 给用户看的
}
```

然后我们需要在包装错误的时候进行错误类型判断是否是自定义的错误，我们进行抛出用户信息错误。

```go
func errWrapper(handler appHandler) func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {

		defer func() {
			if r := recover(); r != nil {
				http.Error(writer, http.StatusText(http.StatusInternalServerError),
					http.StatusInternalServerError)
				log.Printf("Panic: %v", r)
			}
		}()

		err := handler(writer, request)

		if err != nil {
			log.Printf("Err Handling request: %s", err.Error())
			// 判断是否是用户自定义错误信息
			if userError, ok := err.(userError); ok {
				http.Error(writer, userError.Message(), http.StatusBadRequest)
				return
			}
			code := http.StatusOK
			switch {
			// 文件不存在的错
			case os.IsNotExist(err):
				// 向 writer 汇报错误 你的东西 找不到
				code = http.StatusNotFound
			case os.IsPermission(err):
				code = http.StatusForbidden
			default:
				code = http.StatusInternalServerError
			}
			http.Error(writer, http.StatusText(code), code)
		}
	}
}
```

包装错误的处理好之后，我们还需要在逻辑处理的地方，是真正抛出错误的地方，也需要抛出对应的错误信息。

我们需要在当前文件里实现上面的用户自定义错误消息接口

```go
type userError string

func (e userError) Error() string {
	return e.Message()
}

func (e userError) Message() string {
	return string(e)
}
```

```go
func HandlerFileList(writer http.ResponseWriter, request *http.Request) error {

   if strings.Index(request.URL.Path, prefix) != 0 {
       // 使用上述实现的方法进行抛出错误信息
      return userError("path must start with " + prefix)
   }

   path := request.URL.Path[len(prefix):] // /list/fib.txt
   file, err := os.Open(path)
   if err != nil {
      return err
   }
   defer file.Close()

   all, err := ioutil.ReadAll(file)
   if err != nil {
      return err
   }

   writer.Write(all)
   return nil
}
```

![再次查看结果](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220326144356.png)

这样这句话就给用户看到了。

## error vs panic

-   意料之中的：使用`error`，如：文件打不开
-   意料之外的：使用`panic`，如：数组越界

## 错误综合处理方法

-   `defer + panic + recover`
-   `Type Assertion`
-   函数式编程的应用

## error 接口和错误处理

```go
f, err := os.Open("a.txt")
if err != nil {
    // 说明有错误
    fmt.Println(err)
    return
}
// 代码能执行到这里说明打开文件成功，f 是个正经文件对象，下面就可以进行读写操作
defer f.Close() // 程序退出前关闭文件
```

`error`接口类型默认零值为`nil`，所以使用`if err != nil`来判断是否有错误

如果有错误，会提示：`open a.txt: no such file or directory`，是这个接口自己定义的错误信息，会调用`err.Error()`拿到错误描述信息。

> 创建错误

我们可以根据需求自定义错误。最简单的方式是使用`errors`包提供的`New`函数创建一个错误

```go
func New(text string) error
```

```go
// 全局变量
var (
    ErrInvalidOp = errors.New("无效的操作")
)
```

如果调用`ErrInvalidOp.Error()`返回的就是我们的描述信息。

> 基于一个已有的错误包装得到一个新的`error`

使用`fmt.Errorf`搭配特殊的格式化动词`%w`就可以得到一个新的错误【包含原始的错误】

```go
fmt.Errorf("连接数据库失败, err: %w", err)
```

但是，此时又包了一点内容，我们如何判断是否等于原来的错误呢？

```go
oErr := errors.Unwrap(err) // 解包 得到原始的错误

// 拿原始的错误去进行判断
```

```go
if ok := errors.Is(err, ErrInvalidOp); ok {
    fmt.Println("是订单数据错误")
} // 是否包含了后面的一个错误，自动去判断
```

```go
type DBError struct {
    msg string
}

func (e *DBError) Error() string {
    return e.msg
}

func ConnectDB(username, password string) error {
    if password == "123" {
        return DBError {
            msg: "弱密码",
        }
	}
}
// ---------------------------------------------------------------------

var nErr *DBError
// 判断这个错误是不是你自定义的错误，就会自动做error的类型转换
if ok := errors.As(err, &nErr); ok {
    // 这个整合了上面2个步骤
}
```
