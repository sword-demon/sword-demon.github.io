# gRPC 的超时机制

使用`context`包自带的`WithTimeout`函数进行设置超时时间

客户端

```go
func main() {
	conn, err := grpc.Dial("127.0.0.1:50052")
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
    // 设置 3 秒
	ctx, _ := context.WithTimeout(context.Background(), time.Second*3)

	r, err := c.SayHello(ctx, &pb.HelloRequest{
		Name: "virus",
	})
	if err != nil {
		log.Fatalln(err)
	}
	fmt.Println(r.Message)
}
```

服务端

```go
func (s *Server) SayHello(ctx context.Context, request *proto.HelloRequest) (*proto.HelloReply, error) {
    // 延迟 5 秒，肯定会超时
	time.Sleep(5 * time.Second)
	return &proto.HelloReply{Message: "hello " + request.Name}, nil
}
```

它会有一个错误信息：

```bash
context deadline exceeded
DeadlineExceed # gRPC 的一个状态码
```

# protobuf 生成的源码内容有什么

`proto`文件

```protobuf
syntax = "proto3";

option go_package = ".;proto";

service Greeter {
  rpc SayHello(HelloRequest) returns (HelloReply);
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

它生成的结构体

```go
type HelloRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
}

type HelloReply struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Message string `protobuf:"bytes,1,opt,name=message,proto3" json:"message,omitempty"`
}

// GreeterClient is the client API for Greeter service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type GreeterClient interface {
	SayHello(ctx context.Context, in *HelloRequest, opts ...grpc.CallOption) (*HelloReply, error)
}

// GreeterServer is the server API for Greeter service.
type GreeterServer interface {
	SayHello(context.Context, *HelloRequest) (*HelloReply, error)
}

func RegisterGreeterServer(s *grpc.Server, srv GreeterServer) {
	s.RegisterService(&_Greeter_serviceDesc, srv)
}
```

1.  生成对应的接口
2.  将这些方法注册到`gRPC`
3.  服务端是生成接口，我们只需要去每个接口中实现对应的业务逻辑
4.  客户端需要帮我们生成对应的方法，同时将这个方法绑定到一个结构体上，生成的时候可能需要传递参数
