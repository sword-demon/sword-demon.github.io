---
title: gRPC拦截器
date: 2023-01-24 20:00:15
category: Go
tag:
    - gRPC
    - intereceptor
---

# gRPC 拦截器

`intereceptor.go`源码内容

```go
type UnaryServerInterceptor func(ctx context.Context, req interface{}, info *UnaryServerInfo, handler UnaryHandler) (resp interface{}, err error)

```

我们只需要去实现这个后面的函数即可

服务端代码

```go
func main() {
	interceptor := func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
		fmt.Println("接收到了一个新的请求")
		// 继续往下执行
		return handler(ctx, req)
	}
	lis, err := net.Listen("tcp", PORT)
	if err != nil {
		log.Fatalln(err)
	}
	opt := grpc.UnaryInterceptor(interceptor)
	s := grpc.NewServer(opt)
	proto.RegisterStreamGreeterServer(s, &StreamStruct{})
	err = s.Serve(lis)
	if err != nil {
		log.Fatalln(err)
	}
}
```

```go
interceptor := func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
		fmt.Println("接收到了一个新的请求")
		// 继续往下执行
		res, err := handler(ctx, req)
		fmt.Println("请求已经完成")
		return res, err
	}
```

客户端

客户端的源码实现内容

```go
type UnaryClientInterceptor func(ctx context.Context, method string, req, reply interface{}, cc *ClientConn, invoker UnaryInvoker, opts ...CallOption) error
```

所以，客户端只要去实现这个函数即可

```go
interceptor := func(ctx context.Context, method string, req,
		reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker,
		opts ...grpc.CallOption) error {
		start := time.Now()
		err := invoker(ctx, method, req, reply, cc, opts...)
		fmt.Printf("耗时: %s", time.Since(start))
		return err
	}

	opt := grpc.WithUnaryInterceptor(interceptor)
	conn, err := grpc.Dial("127.0.0.1:8080", grpc.WithInsecure(), opt)
```

或者源码部分这个是可变参数

```go
// Dial creates a client connection to the given target.
func Dial(target string, opts ...DialOption) (*ClientConn, error) {
	return DialContext(context.Background(), target, opts...)
}
```

可以额外自己定义一个切片来存储后面的参数

```go
func main() {
   interceptor := func(ctx context.Context, method string, req,
      reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker,
      opts ...grpc.CallOption) error {
      start := time.Now()
      err := invoker(ctx, method, req, reply, cc, opts...)
      fmt.Printf("耗时: %s", time.Since(start))
      return err
   }
   var opts []grpc.DialOption
   opts = append(opts, grpc.WithInsecure())
   opts = append(opts, grpc.WithUnaryInterceptor(interceptor))
   conn, err := grpc.Dial("127.0.0.1:8080", opts...)
   // ...其他代码
}
```

## 拦截器的应用场景

[https://github.com/grpc-ecosystem/go-grpc-middleware](https://github.com/grpc-ecosystem/go-grpc-middleware)

-   日志
-   监控
-   客户端重试
-   验证器
-   限流
-   等组件

## 通过 metadata 和烂机器实现`Auth`认证

服务端

```go
package main

import (
	"context"
	"fmt"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	proto "grpcandprotobuf/grpc_token_auth_test/proto"
	"log"
	"net"
)

const PORT = ":50052"

type Server struct {
}

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

func main() {
	interceptor := func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
		fmt.Println("接收到了一个新的请求")
		md, ok := metadata.FromIncomingContext(ctx)
		fmt.Println(md)
		if !ok {
			// grpc 的错误处理
			return resp, status.Errorf(codes.Unauthenticated, "无token认证信息")
		}
		var (
			appid  string
			appkey string
		)
		// 从md里提取值
		if v, ok := md["appid"];ok{
			appid = v[0]
		}
		if v, ok := md["appkey"];ok{
			appkey = v[0]
		}
		if appid != "1010" || appkey != "i am key" {
			return resp, status.Errorf(codes.Unauthenticated, "appid key 错误")
		}

		// 继续往下执行
		res, err := handler(ctx, req)
		fmt.Println("请求已经完成")
		return res, err
	}
	lis, err := net.Listen("tcp", PORT)
	if err != nil {
		log.Fatalln(err)
	}
	opt := grpc.UnaryInterceptor(interceptor)
	s := grpc.NewServer(opt)
	proto.RegisterGreeterServer(s, &Server{})
	err = s.Serve(lis)
	if err != nil {
		log.Fatalln(err)
	}
}

```

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
	interceptor := func(ctx context.Context, method string, req,
		reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker,
		opts ...grpc.CallOption) error {
		start := time.Now()
		md := metadata.New(map[string]string{
			"appid":  "1010",
			"appkey": "i am key",
		})
		ctx = metadata.NewOutgoingContext(context.Background(), md)
		err := invoker(ctx, method, req, reply, cc, opts...)
		fmt.Printf("耗时: %s\n", time.Since(start))
		return err
	}
	var opts []grpc.DialOption
	opts = append(opts, grpc.WithInsecure())
	opts = append(opts, grpc.WithUnaryInterceptor(interceptor))
	conn, err := grpc.Dial("127.0.0.1:50052", opts...)
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
	r, err := c.SayHello(context.Background(), &pb.HelloRequest{
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

服务端运行效果：

```bash
接收到了一个新的请求
map[:authority:[127.0.0.1:50052] appid:[1010] appkey:[i am key] content-type:[application/grpc] user-agent:[grpc-go/1.51.0]]
user-agent [grpc-go/1.51.0]
appid [1010]
appkey [i am key]
:authority [127.0.0.1:50052]
content-type [application/grpc]
请求已经完成

```

客户端运行效果

```bash
➜  client go run client_token.go
耗时: 2.289875ms
hello wujie
```

### 简化写法

```go
func WithPerRPCCredentials(creds credentials.PerRPCCredentials) DialOption {
	return newFuncDialOption(func(o *dialOptions) {
		o.copts.PerRPCCredentials = append(o.copts.PerRPCCredentials, creds)
	})
}
```

```go
// PerRPCCredentials defines the common interface for the credentials which need to
// attach security information to every RPC (e.g., oauth2).
type PerRPCCredentials interface {
	// GetRequestMetadata gets the current request metadata, refreshing tokens
	// if required. This should be called by the transport layer on each
	// request, and the data should be populated in headers or other
	// context. If a status code is returned, it will be used as the status for
	// the RPC (restricted to an allowable set of codes as defined by gRFC
	// A54). uri is the URI of the entry point for the request.  When supported
	// by the underlying implementation, ctx can be used for timeout and
	// cancellation. Additionally, RequestInfo data will be available via ctx
	// to this call.  TODO(zhaoq): Define the set of the qualified keys instead
	// of leaving it as an arbitrary string.
	GetRequestMetadata(ctx context.Context, uri ...string) (map[string]string, error)
	// RequireTransportSecurity indicates whether the credentials requires
	// transport security.
	RequireTransportSecurity() bool
}
```

我们自己定义结构体来实现上面 2 个方法即可

修改客户端代码

```go
package main

import (
	"context"
	"fmt"
	"google.golang.org/grpc"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
	"grpcandprotobuf/pb"
	"log"
	"time"
)

type customCredential struct {
}

func (c *customCredential) GetRequestMetadata(ctx context.Context, uri ...string) (map[string]string, error) {
    // 这里我们只需要关注返回的 metadata数据
	return map[string]string{
		"appid":  "1010",
		"appkey": "i am key",
	}, nil
}

// RequireTransportSecurity indicates whether the credentials requires
// transport security.
func (c *customCredential) RequireTransportSecurity() bool {
	return false
}

func main() {
	//interceptor := func(ctx context.Context, method string, req,
	//	reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker,
	//	opts ...grpc.CallOption) error {
	//	start := time.Now()
	//	md := metadata.New(map[string]string{
	//		"appid":  "1010",
	//		"appkey": "i am key",
	//	})
	//	ctx = metadata.NewOutgoingContext(context.Background(), md)
	//	err := invoker(ctx, method, req, reply, cc, opts...)
	//	fmt.Printf("耗时: %s\n", time.Since(start))
	//	return err
	//}
	grpc.WithPerRPCCredentials(&customCredential{})
	var opts []grpc.DialOption
	opts = append(opts, grpc.WithInsecure())
	opts = append(opts, grpc.WithPerRPCCredentials(&customCredential{}))
	conn, err := grpc.Dial("127.0.0.1:50052", opts...)
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
	r, err := c.SayHello(context.Background(), &pb.HelloRequest{
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
