---
title: gRPC和protobuf
date: 2022-07-10 21:58:10
category: Go
tag:
    - gRPC
    - protobuf
---

## gRPC

> gRPC 是一个高性能的、开源和通用的 RPC 框架，面向移动和 HTTP/2 设计。目前提供 C、Java 和 Go 语言版本，分别是：grpc、grpc-java、grpc-go，其中 C 版本支持 C、C++、Nodejs、Python、Ruby、Objective-C、PHP 和 C#。

grpc 网址：https://grpc.io/

比如：java 中的`dubbo`使用了`dubbo/rmi/hessian`各种协议，但是它们压缩比都会比`json`和`xml`高，甚至某些场景和`protobuf`差不多，**如果懂了协议，完全有能力自己实现一个性能比较高的协议。**

## protobuf

它全称为：`protocol buffer`，是一种数据存储格式

-   它是谷歌出品的一种轻量、高效的结构化数据存储格式，性能比`json`、`xml`真的强很多
-   `protobuf`经历了`protobuf2`和`protobuf3`，`pb3`比`pb2`简化了很多，目前主流的版本是`pb3`

优点：

1.  性能
    1.  压缩性好
    2.  序列化和反序列化快，比`json`和`xml`快 2-100 倍
    3.  传输速度快
2.  便捷性
    1.  使用简单：可以自动生成序列化和反序列化的代码
    2.  维护成本地，我们只需要维护`proto`文件即可
    3.  向后兼容好，不破坏旧的格式
    4.  加密性好，它的代码会变成二进制的，就算别人拿到也不一定知道
3.  跨语言
    1.  跨平台
    2.  支持各种主流语言

缺点：

1.  通用性差：`json`可以任何语言都支持，但是`protobuf`需要专门的解析库
2.  自解释性差：只有通过`proto`文件才能了解数据结构，源自于它加密性好，所以有的时候不是必须使用`protobuf`

## python 下体验 protobuf

[文档地址](https://grpc.io/docs/languages/python/quickstart/)

生成代码的工具代码编写，可以和`proto`文件卸载同一目录下，便于代码生成

```python
# -*- coding: utf8 -*-
# @Time    : 2022/7/10 21:47
# @Author  : wxvirus
# @File    : tools.py
# @Software: PyCharm

import pkg_resources
from grpc_tools import _protoc_compiler


def main(command_arguments):
    """Run the protocol buffer compiler with the given command-line arguments.
  Args:
    command_arguments: a list of strings representing command line arguments to
        `protoc`.
  """
    command_arguments = [argument.encode() for argument in command_arguments]
    return _protoc_compiler.run_main(command_arguments)


proto_include = pkg_resources.resource_filename('grpc_tools', '_proto')

argv = ['', '-I.', '--python_out=.', '--grpc_python_out=.', './hello.proto']
main(argv + ['-I{}'.format(proto_include)])

```

`proto`文件

```protobuf
syntax = "proto3";

message HelloRequest {
    string name = 1;
}
```

测试代码

```python
# -*- coding: utf8 -*-
# @Time    : 2022/7/10 21:40
# @Author  : wxvirus
# @File    : client.py
# @Software: PyCharm
from protobuf_test.proto import hello_pb2

# 生成的pb文件不要去改
request = hello_pb2.HelloRequest()
request.name = "wujie"
res_str = request.SerializeToString()
print(res_str)

# 如果通过字符串反向生成对象
request2 = hello_pb2.HelloRequest()
request2.ParseFromString(res_str)
print(request2.name)

```

```bash
b'\n\x05wujie'
wujie
```

这里的`name`属性是编号 1，`\n\x`是一个可变长编码

## python 下使用 gRPC

`grpc_hello/proto/helloworld.proto`

```protobuf
syntax = "proto3";

package helloworld;

message HelloRequest {
    string name = 1;
}

message HelloReply {
    string message = 1;
}

service Greeter {
    rpc SayHello(HelloRequest) returns (HelloReply);
}
```

进入到上面的目录里之后使用命令来生成代码

```bash
python -m grpc_tools.protoc --python_out=. --grpc_python_out=. -I. Helloworld.proto

```

`server.py`

```python
# -*- coding: utf8 -*-
# @Time    : 2022/7/11 22:09
# @Author  : wxvirus
# @File    : server.py
# @Software: PyCharm
from concurrent import futures
import grpc
from grpc_hello.proto import Helloworld_pb2_grpc, Helloworld_pb2


class Greeter(Helloworld_pb2_grpc.GreeterServicer):

    def SayHello(self, request, context):
        return Helloworld_pb2.HelloReply(message=f"ni hao, {request.name}")


if __name__ == '__main__':
    # 启动grpc
    # 1. 实例化 server
    # 设置10个线程池
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    # 2. 注册逻辑到server中
    Helloworld_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)
    # 3. 启动server
    # 可以不配证书之类的
    server.add_insecure_port(':50051')
    server.start()
    # 必须加上这个，防止别的线程没执行到
    server.wait_for_termination()

```

客户端

```python
# -*- coding: utf8 -*-
# @Time    : 2022/7/11 22:45
# @Author  : wxvirus
# @File    : client.py
# @Software: PyCharm
import grpc
from grpc_hello.proto import Helloworld_pb2, Helloworld_pb2_grpc

if __name__ == '__main__':
    with grpc.insecure_channel("127.0.0.1:12345") as channel:
        stub = Helloworld_pb2_grpc.GreeterStub(channel)
        # 返回值指明类型
        resp: Helloworld_pb2.HelloReply = stub.SayHello(Helloworld_pb2.HelloRequest(name="wxvirus"))
        # 打印proto定义的返回体的message属性
        print(resp.message)

```

```bash
# 运行结果
ni hao, wxvirus
```

## go 下 gRPC 开发体验

### 下载`protoc`工具

首先还是得先安装`protoc`可执行文件用来生成代码。

-   Linux, using `apt` or `apt-get`, for example:

    ```sh
    $ apt install -y protobuf-compiler
    $ protoc --version  # Ensure compiler version is 3+
    ```

-   MacOS, using [Homebrew](https://brew.sh/):

    ```sh
    $ brew install protobuf
    $ protoc --version  # Ensure compiler version is 3+
    ```

如果上述操作没有直接给你添加到环境变量 ，还得自己手动去加一下到环境变量里，否则执行`protoc --version`会不成功。

### 下载 go 的依赖包

```bash
go get github.com/golang/protobuf/protoc-gen-go
```

### proto 文件

```protobuf
syntax = "proto3";

package helloworld;

option go_package = ".;proto";

message HelloRequest {
    string name = 1;
}

message HelloReply {
    string message = 1;
}

service Greeter {
    rpc SayHello(HelloRequest) returns (HelloReply);
}
```

在当前目录查找当前`xxx.proto`生成文件到当前目录

```bash
protoc -I ./ --go_out=./ --go-grpc_out=. helloworld.proto
```

服务端代码

```go
package server

import (
	"context"
	"fmt"
	"google.golang.org/grpc"
	"grpc_demo/proto"
	"net"
)

type Server struct{
	proto.UnimplementedGreeterServer
}

func (s *Server) SayHello(ctx context.Context, req *proto.HelloRequest) (*proto.HelloReply, error) {
	return &proto.HelloReply{
		Message: "你好" + req.Name,
	}, nil
}

func main()  {
	g := grpc.NewServer()
	proto.RegisterGreeterServer(g, &Server{})
	lis, err := net.Listen("tcp", "0.0.0.0:8080")
	if err != nil {
		fmt.Printf("failed to listen: %v", err)
		return
	}
	err = g.Serve(lis)
	if err != nil {
		fmt.Printf("failed to serve: %v", err)
		return
	}
}
```
