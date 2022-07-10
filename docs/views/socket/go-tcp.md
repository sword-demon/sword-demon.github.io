---
title: Go语言实现TCP通信
date: 2022-07-10 17:26:10
category: Socket
tag:
    - TCP
---

## TCP 服务端

一个 TCP 服务端可以同时连接很多个客户端，因为 go 语言创建多个 goroutine 实现并发非常方便和高效，所以我们可以每建立一次链接就创建一个 goroutine 去处理。

TCP 服务端程序的处理流程：

1.  监听端口
2.  接收客户端请求建立链接
3.  创建 goroutine 处理链接

```go
package main

import (
	"bufio"
	"fmt"
	"net"
)

// 对每个链接做处理
func process(conn net.Conn) {
	// 关闭连接
	defer conn.Close()
	for {
		// 基于网络连接创建一个reader对象
		reader := bufio.NewReader(conn)
		// 每次读取128字节
		var buf [128]byte
		// 读取数据
		n, err := reader.Read(buf[:])
		if err != nil {
			fmt.Println("read from client failed, err:", err)
			break
		}
		// 把收到的内容转换为字符串
		recvStr := string(buf[:n])
		fmt.Println("收到client发来的数据: ", recvStr)
		conn.Write([]byte(recvStr)) // 发送数据
	}
}

func main() {
	listen, err := net.Listen("tcp", "127.0.0.1:12345")
	if err != nil {
		fmt.Println("listen failed, err: ", err)
		return
	}
	for {
		conn, err := listen.Accept() // 建立连接
		if err != nil {
			fmt.Println("accept failed, err: ", err)
			continue
		}
		go process(conn) // 启动一个goroutine处理链接
	}
}

```

## 客户端

1.  连接服务端
2.  进行数据收发
3.  关闭链接

```go
package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strings"
)

func main() {
	conn, err := net.Dial("tcp", "127.0.0.1:12345")
	if err != nil {
		fmt.Println("err: ", err)
		return
	}
	defer conn.Close()
	// 从标准输入获取用户输入的内容
	inputReader := bufio.NewReader(os.Stdin)
	for {
		// 读取用户输入
		input, _ := inputReader.ReadString('\n')
		inputInfo := strings.Trim(input, "\r\n")
		// 如果输入q|Q就退出
		if strings.ToUpper(inputInfo) == "Q" {
			break
		}
		// 发送数据
		_, err = conn.Write([]byte(inputInfo))
		if err != nil {
			break
		}
		buf := [512]byte{}
		n, err := conn.Read(buf[:])
		if err != nil {
			fmt.Println("recv failed, err: ", err)
			break
		}
		fmt.Println(string(buf[:n]))
	}
}

```

## TCP 粘包

使用上面的案例，我们可以分别编译后启动服务端再启动客户端，如果客户端分 10 次连续发送数据，但是在副端没有成功的输出 10 次，而是多余数据”粘“到了一起。

> 为什么会出现粘包

主要原因是 TCP 数据传递模式是**流模式**，在保持长连接的时候可以进行多次的收和发。

”粘包“可发生在发送端也可以发生在接收端：

1.  由`Nagle`算法造成的发送端的粘包：`Nagle`算法是一种改善网络传输效率的算法。简单来说就是当我们提交一段数据给 TCP 发送时，TCP 并不立刻发送此段数据，而是等待一小段时间看看在等待期间是否还有要发送的数据，若有则会一次把这两段数据发送出去。
2.  接收端接收不及时造成的接收端粘包：TCP 会把接收到的数据存在自己的缓冲区，然后通知应用取数据。当应用层由于某些原因不能及时地把 TCP 的数据取出来，就会造成 TCP 缓冲区中存放了好几段数据。

> 解决办法

出现粘包的关键在于接收方不确定将要传输的数据包的大小，因此我们可以对数据包进行封包和拆包的操作。

封包：封包就是给一段数据加上包头，这样一来数据包就分为了包头和包体的两部分内容（过滤非法包时封包会加入”包尾“内容）。包头部分的长度是固定的，并且它存储了包体的长度，根据包头长度固定以及包头中含有包体的长度的变量就能正确的拆分出一个完整的数据包。

我们可以自己定义一个协议，比如数据包前 4 个字节为包头，里面存储的是发生的数据的长度

```go
package proto

import (
	"bufio"
	"bytes"
	"encoding/binary"
)

// Encode 将消息编码
func Encode(message string) ([]byte, error) {
	// 读取消息的长度，转换为int32类型 占4个字节
	var length = int32(len(message))
	var pkg = new(bytes.Buffer)
	// 写入消息头
	err := binary.Write(pkg, binary.LittleEndian, length)
	if err != nil {
		return nil, err
	}
	// 写入消息实体
	err = binary.Write(pkg, binary.LittleEndian, []byte(message))
	if err != nil {
		return nil, err
	}
	return pkg.Bytes(), nil
}

// Decode 解码消息
func Decode(reader *bufio.Reader) (string, error) {
	// 读取消息的长度
	lengthByte, _ := reader.Peek(4) // 读取前4个字节的数据
	lengthBuff := bytes.NewBuffer(lengthByte)
	var length int32
	err := binary.Read(lengthBuff, binary.LittleEndian, &length)
	if err != nil {
		return "", err
	}
	// Buffered 返回缓冲中现有的可读取的字节数
	if int32(reader.Buffered()) < length+4 {
		return "", err
	}

	// 读取真正的消息数据
	pack := make([]byte, int(4+length))
	_, err = reader.Read(pack)
	if err != nil {
		return "", err
	}
	return string(pack[4:]), nil
}

```

接下来可以再服务端和客户端分别使用上面定义的`Decode`和`Encode`的函数来处理数据。

服务端调整

```go
package main

import (
	"bufio"
	"fmt"
	"io"
	"net"
)

// 对每个链接做处理
func process(conn net.Conn) {
	// 关闭连接
	defer conn.Close()
	// 基于网络连接创建一个reader对象
	reader := bufio.NewReader(conn)
	for {
		msg, err := Decode(reader)
		if err == io.EOF {
			break
		}
		if err != nil {
			fmt.Println("decode msg from client failed, err:", err)
			break
		}
		fmt.Println("收到client发来的数据: ", msg)
	}
}

func main() {
	listen, err := net.Listen("tcp", "127.0.0.1:12345")
	if err != nil {
		fmt.Println("listen failed, err: ", err)
		return
	}
	defer listen.Close()
	for {
		conn, err := listen.Accept() // 建立连接
		if err != nil {
			fmt.Println("accept failed, err: ", err)
			continue
		}
		go process(conn) // 启动一个goroutine处理链接
	}
}

```

客户端调整

```go
package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strings"
)

func main() {
	conn, err := net.Dial("tcp", "127.0.0.1:12345")
	if err != nil {
		fmt.Println("err: ", err)
		return
	}
	defer conn.Close()
	// 从标准输入获取用户输入的内容
	inputReader := bufio.NewReader(os.Stdin)
	for {
		// 读取用户输入
		input, _ := inputReader.ReadString('\n')
		inputInfo := strings.Trim(input, "\r\n")
		// 如果输入q|Q就退出
		if strings.ToUpper(inputInfo) == "Q" {
			break
		}
		// 发送数据
		data, err := Encode(inputInfo)
		if err != nil {
			fmt.Println("encode msg failed, err: ", err)
			return
		}
		_, err = conn.Write(data)
		if err != nil {
			break
		}
		buf := [512]byte{}
		n, err := conn.Read(buf[:])
		if err != nil {
			fmt.Println("recv failed, err: ", err)
			break
		}
		fmt.Println(string(buf[:n]))
	}
}

```
