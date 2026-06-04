---
title: 验证码生成服务需求分析与设计
date: 2026-05-30 15:01
---

# 验证码生成服务需求分析与设计

## 需求

- 仅提供生成随机验证码的接口`gRPC`，供内部服务使用
- 验证码不需要再该服务中进行存储
- 不需要对外提供服务
- 参数：输入`length`的长度，得到一个对应的长度的验证码

```json
{
  "length": 10,
  "type": 2
}
```

- `type`：
  - 1：纯数字，默认状况
  - 2：字符串
  - 3：混合

## 初始化 kratos 项目

你`github`访问没啥问题的话，可以直接

```bash
kratos new verifyCode
```

如果有问题，则使用国内的`gitee`的源

```bash
kratos new verifyCode -r https://gitee.com/go-kratos/kratos-layout.git
```

选择`service`进行生成

```
├── .gitignore
├── api
│   └── helloworld
├── cmd
│   └── verifyCode
├── configs
│   └── config.yaml
├── Dockerfile
├── go.mod
├── go.sum
├── internal
│   ├── biz
│   ├── conf
│   ├── data
│   ├── server
│   └── service
├── LICENSE
├── Makefile
├── openapi.yaml
├── README.md
└── third_party
    ├── errors
    ├── google
    ├── openapi
    ├── README.md
    └── validate

17 directories, 10 files
```

下载依赖，前提是要到对应的目录下执行

```bash
go mod tidy
```

构建代码

```bash
$ cd verifyCode
$ go generate ./...
$ go build -o ./bin/ ./...
$ ./bin/verifyCode -conf ./configs
```

要先安装`wire`

```bash
go get github.com/google/wire/cmd/wire
go: upgraded github.com/google/wire v0.6.0 => v0.7.0
go: upgraded golang.org/x/mod v0.17.0 => v0.20.0
go: upgraded golang.org/x/tools v0.21.1-0.20240508182429-e35e4ccd0d2d => v0.24.1
> go generate ./...
wire: verifyCode/cmd/verifyCode: wrote /Volumes/MOVESPEED/ai-coding/kratos-dj/backend/verifyCode/cmd/verifyCode/wire_gen.go
```

> 运行起来

```bash
kratos run
2026/05/30 15:14:51 maxprocs: Leaving GOMAXPROCS=10: CPU quota undefined
DEBUG msg=config loaded: config.yaml format: yaml
INFO ts=2026-05-30T15:14:51+08:00 caller=http/server.go:330 service.id=wujiedeMac-mini-2.local service.name= service.version= trace.id= span.id= msg=[HTTP] server listening on: [::]:8000
INFO ts=2026-05-30T15:14:51+08:00 caller=grpc/server.go:231 service.id=wujiedeMac-mini-2.local service.name= service.version= trace.id= span.id= msg=[gRPC] server listening on: [::]:9000
```

- 监听了一个`8000`的`HTTP`服务
- 监听了一个`9000`的`gRPC`服务

> 在浏览器里访问`http://localhost:8000/helloworld/dwqdqw`

```json
{
  "message": "Hello dwqdqw"
}
```

## 使用Protobuf 定义验证码接口

步骤：

1. 定义`protobuf`文件说明接口
2. 利用`protoc`基于`protobuf`生成必要代码
3. 将生成的代码整合到项目中
4. 完善业务逻辑

### 增加proto文件模版

命令`kratos proto add`用于添加`.proto`文件

```bash
kratos proto add api/verifyCode/verifyCode.proto
```

```bash
tree -L 3 -a
.
├── .gitignore
├── Dockerfile
├── LICENSE
├── Makefile
├── README.md
├── api
│   ├── helloworld
│   │   └── v1
│   └── verifyCode
│       └── verifyCode.proto
├── cmd
│   └── verifyCode
│       ├── main.go
│       ├── wire.go
│       └── wire_gen.go
├── configs
│   └── config.yaml
├── go.mod
├── go.sum
├── internal
│   ├── biz
│   │   ├── README.md
│   │   ├── biz.go
│   │   └── greeter.go
│   ├── conf
│   │   ├── conf.pb.go
│   │   └── conf.proto
│   ├── data
│   │   ├── README.md
│   │   ├── data.go
│   │   └── greeter.go
│   ├── server
│   │   ├── grpc.go
│   │   ├── http.go
│   │   └── server.go
│   └── service
│       ├── README.md
│       ├── greeter.go
│       └── service.go
├── openapi.yaml
└── third_party
    ├── README.md
    ├── errors
    │   └── errors.proto
    ├── google
    │   ├── api
    │   └── protobuf
    ├── openapi
    │   └── v3
    └── validate
        ├── README.md
        └── validate.proto

22 directories, 31 files
```

```protobuf
syntax = "proto3";

package api.verifyCode;

option go_package = "verifyCode/api/verifyCode;verifyCode";
option java_multiple_files = true;
option java_package = "api.verifyCode";

service VerifyCode {
	rpc GetVerifyCode (GetVerifyCodeRequest) returns (GetVerifyCodeReply);
}

// 类型常量
enum Type {
	DEFAULT = 0;
	DIGIT = 1;
	LEFTER = 2;
	MIXED = 3;
}

message GetVerifyCodeRequest {
	// 验证码长度
	uint32 length = 1;
	// 验证码类型
	Type type = 2;
}
message GetVerifyCodeReply {
	// 生成的验证码字符串
	string code = 1;
}

```

### 基于 proto 文件，生成对应的客户端pb代码和gRPC 代码

```bash
kratos proto client api/verifyCode/verifyCode.proto
```

### 基于 proto 文件，生成对应的 gRPC 服务代码

```bash
kratos proto server api/verifyCode/verifyCode.proto -t internal/service
```

更新`internal/service/service.go`文件

```go
package service

import "github.com/google/wire"

// ProviderSet is service providers.
var ProviderSet = wire.NewSet(NewGreeterService, NewVerifyCodeService)
```

在以上的`wire.NewSet()`调用中，添加第二个参数，是函数名，不能添加括号，意思是告知依赖注入，如果需要使用`VerifyCodeService`的话，则使用`NewVerifyCodeService`函数来构建。

---

更新`internal/server/grpc.go`

在`NewGPRCServer`函数中：

1. 新增一个参数
2. 在函数体中，增加一行代码

用于将`VerifyCodeService`注册到`gRPC`服务中

```go
package server

import (
	v1 "verifyCode/api/helloworld/v1"
	vc "verifyCode/api/verifyCode" // 起的别名
	"verifyCode/internal/conf"
	"verifyCode/internal/service"

	"github.com/go-kratos/kratos/v2/log"
	"github.com/go-kratos/kratos/v2/middleware/recovery"
	"github.com/go-kratos/kratos/v2/transport/grpc"
)

// NewGRPCServer new a gRPC server.
func NewGRPCServer(c *conf.Server,
	greeter *service.GreeterService,
                   // 参数加进来
	verifyCodeService *service.VerifyCodeService,
	logger log.Logger) *grpc.Server {
	var opts = []grpc.ServerOption{
		grpc.Middleware(
			recovery.Recovery(),
		),
	}
	if c.Grpc.Network != "" {
		opts = append(opts, grpc.Network(c.Grpc.Network))
	}
	if c.Grpc.Addr != "" {
		opts = append(opts, grpc.Address(c.Grpc.Addr))
	}
	if c.Grpc.Timeout != nil {
		opts = append(opts, grpc.Timeout(c.Grpc.Timeout.AsDuration()))
	}
	srv := grpc.NewServer(opts...)
	v1.RegisterGreeterServer(srv, greeter)
	// 完成验证码服务的注册: verifyCodeService
	vc.RegisterVerifyCodeServer(srv, verifyCodeService)
	return srv
}

```

```bash
> go generate ./...
wire: verifyCode/cmd/verifyCode: wrote /Volumes/MOVESPEED/ai-coding/kratos-dj/backend/verifyCode/cmd/verifyCode/wire_gen.go
```

每当`ProviderSet`代码有改动的时候，都需要重新生成代码，内部使用了`wire`依赖注入工具。

## 验证码业务逻辑——简单实现

```go
package service

import (
	"context"
	"math/rand"

	pb "verifyCode/api/verifyCode"
)

type VerifyCodeService struct {
	pb.UnimplementedVerifyCodeServer
}

func NewVerifyCodeService() *VerifyCodeService {
	return &VerifyCodeService{}
}

func (s *VerifyCodeService) GetVerifyCode(ctx context.Context, req *pb.GetVerifyCodeRequest) (*pb.GetVerifyCodeReply, error) {
	return &pb.GetVerifyCodeReply{
		Code: RandCode(req.Length, req.Type),
	}, nil
}

func RandCode(length uint32, t pb.Type) string {
	switch t {
	default:
	case pb.Type_DEFAULT:
		fallthrough
	case pb.Type_DIGIT:
		return randCode("0123456789", length)
	case pb.Type_LEFTER:
		return randCode("qwertyuiopasdfghjklzxcvbnm", length)
	case pb.Type_MIXED:
		return randCode("0123456789qwertyuiopasdfghjklzxcvbnm", length)
	}
	return ""
}

func randCode(chars string, length uint32) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = chars[rand.Intn(len(chars))]
	}
	return string(b)
}

```
