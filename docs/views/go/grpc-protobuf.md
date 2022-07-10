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
