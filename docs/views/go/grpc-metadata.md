---
title: go控制gRPC的metadata
date: 2023-01-24 20:01:15
category: Go
tag:
    - gRPC
    - metadata
---

# go 控制 gRPC 的 metadata

> gRPC 让我们可以像本地调用一样实现远程调用，对于每一次的 RPC 调用中，都可能会有一些有用的数据，而这些数据就可以通过`metadata`来传递。`metadata`是以`key-value`的形式存储数据的，其中`key`是`string`类型，而`value`是`[]string`。`metadata`使得`client`和`server`能够为对方提供关于本次调用的一些信息，就像一次`http`请求的`RequestHeader`和`ResponseHeader`一样。`http`中`header`的生命周期是一次`http`请求，那么`metadata`的生命周期就是一次`RPC`调用。

## go 中使用 metadata

1.  新建`metadata`

    ```go
    type MD map[string][]string
    ```

    类型是`map`,`key`是`string`，`value`是`string`类型的切片

    创建的时候可以像创建普通的`map`类型一样使用`new`关键字进行创建

    ```go
    // 第一种方式
    md := metadata.New(map[string]string{"key1": "val1"})

    // 第二种方式
    md := metadata.Pairs (
        "key1", "val1",
        "key2", "val2"
    )
    ```

2.  发送`metadata`

    ```go
    md := metadata.Pairs("key", "val")

    // 新建一个有 metadata 的 context
    ctx := metadata.NewOutgoingContext(context.Background())

    // 单向 RPC
    response, err := client.SomeRPC(ctx, someRequest)x
    ```

3.  接收`metadata`

    ```go
    func (s *server) SomeRPC(ctx context.Context, in *pb.SomeRequest) (*pb.SomeResponse, error) {
        md, ok := metadata.FromIncomingContext(ctx)
        // do something with metadata
    }
    ```

### gRPC 中使用`metadata`

客户端

```go
package main

import (
	"context"
	"fmt"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
	"grpcandprotobuf/pb"
	"log"
	"time"
)

func main() {
	conn, err := grpc.Dial("127.0.0.1:8080", grpc.WithInsecure())
	if err != nil {
		log.Fatalln(err)
	}
	defer func(conn *grpc.ClientConn) {
		err := conn.Close()
		if err != nil {
			log.Fatalln(err)
		}
	}(conn)

	c := pb.NewGreeterClient(conn)

	md := metadata.New(map[string]string{
		"name": "wujie",
		"password": "123456",
	})

	ctx := metadata.NewOutgoingContext(context.Background(), md)

	r, err := c.SayHello(ctx, &pb.HelloRequest{
		Name: "wujie",
		Url:  "https",
		G:    pb.Gender_MALE,
		Mp: map[string]string{
			"name":    "wujie",
			"company": "无解的游戏",
		},
		AddTime: timestamppb.New(time.Now()),
	})
	if err != nil {
		log.Fatalln(err)
	}
	fmt.Println(r.Message)
}

```

服务端的代码

```go
func (s *Server) SayHello(ctx context.Context, request *proto.HelloRequest) (*proto.HelloReply, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		fmt.Println("get metadata error")
	}
	for key, val := range md {
		fmt.Println(key, val)
	}
	return &proto.HelloReply{Message: "hello " + request.Name}, nil
}
```
