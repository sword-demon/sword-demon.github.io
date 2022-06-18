---
title: go-zero环境搭建
date: 2022-06-12 09:50:15
category: go-zero
tag:
    - goctl
---

[go-zero github 地址](https://github.com/zeromicro/go-zero)

[中文介绍](https://github.com/zeromicro/go-zero/blob/master/readme-cn.md)

[文档地址](https://go-zero.dev/cn/)

<!-- more -->

## 安装 goctl 工具

```bash
# Go 1.15 及之前版本
GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero/tools/goctl@latest

# Go 1.16 及以后版本
GOPROXY=https://goproxy.cn/,direct go install github.com/zeromicro/go-zero/tools/goctl@latest

# For Mac
brew install goctl

# docker for amd64 architecture
docker pull kevinwan/goctl
# run goctl like
docker run --rm -it -v `pwd`:/app kevinwan/goctl goctl --help

# docker for arm64 (M1) architecture
docker pull kevinwan/goctl:latest-arm64
# run goctl like
docker run --rm -it -v `pwd`:/app kevinwan/goctl:latest-arm64 goctl --help
```

安装结果验证

```bash
➜ goctl -v
goctl version 1.3.8 darwin/arm64
```

:::tip windows 用户

`windows`用户需要自己添加环境变量

:::

## 安装 protoc & protoc-gen-go

安装方式文档上都有，这里搬一下

### 方式 1：goctl 一键安装

```bash
$ goctl env check -i -f --verbose
[goctl-env]: preparing to check env

[goctl-env]: looking up "protoc"
[goctl-env]: "protoc" is not found in PATH
[goctl-env]: preparing to install "protoc"
"protoc" installed from cache
[goctl-env]: "protoc" is already installed in "/Users/keson/go/bin/protoc"

[goctl-env]: looking up "protoc-gen-go"
[goctl-env]: "protoc-gen-go" is not found in PATH
[goctl-env]: preparing to install "protoc-gen-go"
"protoc-gen-go" installed from cache
[goctl-env]: "protoc-gen-go" is already installed in "/Users/keson/go/bin/protoc-gen-go"

[goctl-env]: looking up "protoc-gen-go-grpc"
[goctl-env]: "protoc-gen-go-grpc" is not found in PATH
[goctl-env]: preparing to install "protoc-gen-go-grpc"
"protoc-gen-go-grpc" installed from cache
[goctl-env]: "protoc-gen-go-grpc" is already installed in "/Users/keson/go/bin/protoc-gen-go-grpc"

[goctl-env]: congratulations! your goctl environment is ready!
```

### 方式 2：HomeBrew

```bash
$ brew install protobuf protoc-gen-go protoc-gen-go-grpc
$ protoc --version
libprotoc x.x.x
```

### 方式 3：源文件安装

#### proto 安装

-   进入[protobuf release](https://github.com/protocolbuffers/protobuf/releases) 页面，选择适合自己操作系统的压缩包文件

-   解压`protoc-x.x.x-osx-x86_64.zip`并进入`protoc-x.x.x-osx-x86_64`

    ```bash
    cd protoc-x.x.x-osx-x86_64/bin
    ```

-   将启动的`protoc`二进制文件移动到被添加到环境变量的任意 path 下，如`$GOPATH/bin`，这里不建议直接将其和系统的以下 path 放在一起。

    ```bash
    mv protoc $GOPATH/bin
    ```

    :::tip

    `$GOPATH`为你本机的实际文件夹地址

    :::

-   验证安装结果

    ```bash
    ➜ protoc --version
    libprotoc 3.15.6
    ```

#### Proto-gen-go/proto-gen-go-grpc 安装

-   下载安装`protoc-gen-go`

    ```bash
    go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
    ```

### 一些常用的`goctl`脚本

[大佬提供的地址](https://github.com/Mikaelemmmm/go-zero-looklook/blob/main/deploy/script/gencode/gen.sh)

```
# 生成api业务代码 ， 进入"服务/cmd/api/desc"目录下，执行下面命令
# goctl api go -api *.api -dir ../  --style=goZero

# 生成rpc业务代码
# 【注】 需要安装下面3个插件
#       protoc >= 3.13.0 ， 如果没安装请先安装 https://github.com/protocolbuffers/protobuf，下载解压到$GOPATH/bin下即可，前提是$GOPATH/bin已经加入$PATH中
#       protoc-gen-go ，如果没有安装请先安装 go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
#       protoc-gen-go-grpc  ，如果没有安装请先安装 go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
#
#       如果有要使用grpc-gateway，也请安装如下两个插件 , 没有使用就忽略下面2个插件
#       go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@latest
#       go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2@latest
#
# 1）goctl >= 1.3 进入"服务/cmd/rpc/pb"目录下，执行下面命令
#    goctl rpc protoc *.proto --go_out=../ --go-grpc_out=../  --zrpc_out=../ --style=goZero
#    去除proto中的json的omitempty
#    mac: sed -i "" 's/,omitempty//g' *.pb.go
#    linux: sed -i 's/,omitempty//g' *.pb.go
# 2）goctl < 1.3 进入"服务/cmd"目录下，执行下面命令
#    goctl rpc proto -src rpc/pb/*.proto -dir ./rpc --style=goZero
#    去除proto中的json的omitempty
#    mac: sed -i "" 's/,omitempty//g'  ./rpc/pb/*.pb.go
#    linux: sed -i 's/,omitempty//g'  ./rpc/pb/*.pb.go



# 创建kafka的topic
# kafka-topics.sh --create --zookeeper zookeeper:2181 --replication-factor 1 -partitions 1 --topic {topic}
# 查看消费者组情况
# kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group {group}
# 命令行消费
# ./kafka-console-consumer.sh  --bootstrap-server kafka:9092  --topic looklook-log   --from-beginning
# 命令生产
# ./kafka-console-producer.sh --bootstrap-server kafka:9092 --topic second
```

```bash
➜ goctl -h
A cli tool to generate api, zrpc, model code

Usage:
  goctl [command]

Available Commands:
  api         Generate api related files
  bug         Report a bug
  completion  Generate the autocompletion script for the specified shell
  docker      Generate Dockerfile
  env         Check or edit goctl environment
  help        Help about any command
  kube        Generate kubernetes files
  migrate     Migrate from tal-tech to zeromicro
  model       Generate model code
  quickstart  quickly start a project
  rpc         Generate rpc code
  template    Template operation
  upgrade     Upgrade goctl to latest version
```

### api 语法介绍

[官网地址](https://go-zero.dev/cn/docs/design/grammar)

`user.api`使用案例

```go
/**
 * api语法示例及语法说明
 */

// api语法版本
syntax = "v1"

info(
    author: "wxvirus"
    date:   "2022-06-12"
    desc:   "api语法示例及语法说明"
)

type (
	UserInfoReq {
		UserId int64 `json:"userId"`
	}
	UserInfoResp {
		UserId int64 `json:"userId"`
		Nickname string `json:"nickname"`
	}
)

service user-api{
    @doc "获取用户信息"
    @handler userInfo
    post /user/info (UserInfoReq) returns (UserInfoResp)
}

```

生成的话，我们那可以使用`alias`来简写

```bash
vim ~/.zshrc
```

```bash
alias apigen="goctl api go -api *.api -dir ../  --style=goZero"
```

保存之后使之生效：`source ~/.zshrc`

默认使用示例，进入到对应目录

```bash
➜ goctl api go -api *.api -dir ../  --style=goZero
Done.
```

![生成代码内容](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220612104801.png)

然后可以直接进入根目录使用命令下载依赖了

```bash
go mod tidy
```

这样会自动帮你下载`go-zero`

[最简单的 Go Dockerfile 编写姿势](https://gocn.vip/topics/xQJ3X6cbwY)

```bash
➜ goctl docker -go user.go
Hint: run "docker build ..." command in dir:
    /Users/wangxin/GolangProjects/src/github.com/sword-demon/zero-demo
Done.

```

[最简单的 K8S 部署文件编写姿势](https://gocn.vip/topics/rw8KO7cXQG)

```bash
➜ goctl kube deploy -name user-api -namespace go-zero-demo -image user-api:v1.0 -o user-api.yaml -port 1001 -nodePort 31001
Done.

```

### 编写 rpc 实例

`zero-demo/user-rpc/pb`

```protobuf
syntax = "proto3";

//  这个现在必须写 而且还得带点路径
option go_package = "./pb";

package pb;

message GetUserInfoReq {
    int64  id = 1;
}
message GetUserInfoResp {
    int64 id = 1;
    string nickname = 2;
}

//service
service usercenter {
    rpc getUserInfo(GetUserInfoReq) returns (GetUserInfoResp);
}
```

生成代码的话，我们还是使用`alias`去添加快捷方式

```bash
alias rpcgen="goctl rpc protoc *.proto --go_out=../ --go-grpc_out=../  --zrpc_out=../ --style=goZeros"
```

```bash
➜ rpcgen
Done.
```

![生成的代码](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220612112931.png)

### 快速生成模型

```shell
#!/usr/bin/env bash

# 使用方法：
# ./genModel.sh usercenter user
# ./genModel.sh usercenter user_auth
# 再将./genModel下的文件剪切到对应服务的model目录里面，记得改package


#生成的表名
tables=$2
#表生成的genmodel目录
modeldir=./genModel

# 数据库配置
host=127.0.0.1
port=3306
dbname=looklook_$1
username=root
passwd=1


echo "开始创建库：$dbname 的表：$2"
goctl model mysql datasource -url="${username}:${passwd}@tcp(${host}:${port})/${dbname}" -table="${tables}"  -dir="${modeldir}" -cache=true --style=goZero
```

```bash
➜ sh genModel.sh order homestay_order
开始创建库：looklook_order 的表：homestay_order
Done.
```

[sql 资源地址](https://github.com/Mikaelemmmm/go-zero-looklook/blob/main/deploy/sql/looklook_order.sql)

## 安装 go-zero

```bash
GO111MODULE=on GOPROXY=https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero
```
