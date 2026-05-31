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

