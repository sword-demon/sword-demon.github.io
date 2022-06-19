---
title: 单元测试
date: 2021-09-24 11:10:39
category: Go
tag:
    - unit
---

## Go Package 管理发展史

Go 依赖管理是通过 Git 仓库模式实现，并随着版本的更迭已经逐渐完善。

-   GOPAHT 模式

    > GOPATH 目录是所有工程的公共依赖包目录，所有需要编译的 go 工程的依赖包都放在 GOPATH 目录下。

-   Vendor 特性

    > 为了解决 GOPATH 模式下，多个工程需要共享 GOPATH 目录，无法适用于多个工程对于不同版本的依赖包的使用，不便于更新某个依赖包。go1.6 之后开启了 vendor 目录。

-   Go Module 包管理

    > 从 go1.11 以后开始支持 Module 依赖管理工具，从而实现了依赖包的进行升级更新，在 go1.13 版本后默认打开

<!-- more -->

GOPATH 为 go 的开发环境时设置的一个环境变量。

历史版本的 go 语言开发时，会将代码放在 GOPATH 目录的 src 文件下，使用`go get`命令获取依赖，也会自动下载到 GOPATH 的 src 下。

`go get github.com/foo/bar`

会将代码下载到`$GOPATH/src/github.com/foo/bar`

```
- bin，用于存放编译后的可执行文件 go install 编译时生成的可执行文件
- pkg，用于存放编译后的包文件 go install 编译时生成的包文件
- src,放我们以后编写的所有的go代码和依赖
	- 项目1
		- app.go
	- 项目2
		- xx.go
```

## Using Go Module

主要公共`go.mod`和`go.sum`组成，主要包含依赖模块路径定义，以及通过`checksum`方式进行保证包的安全性。并且可以在 GOPATH 外进行创建和编译项目。

::: tip
通过 go mod init 初始化一个项目
:::

```bash
$ 目录 go mod init example.com/hello
go: creating new go.mod: module example.com/hello
```

```go
package main

import log "github.com/sirupsen/logrus"

func main() {
  log.Info("hello")
}
```

通过`go get github.com/sirupsen/logrus`可以下载或者更新依赖包，也可以指定版本`path@v1.8.1`

```go
module example.com/hello

go 1.16

require github.com/sirupsen/logrus v1.8.1
```

几个关键语法关键字和含义：

-   module：定义当前项目的模块路径
-   go：标识当前模块的 go 语言版本，仅仅是标识作用
-   require：说明 module 需要什么版本的依赖
-   exclude：用于从使用中排除一个特定的模块版本
-   replace：替换 require 中声明的依赖，使用另外的依赖及其版本号

::: details 点击查看代码

```go
module example.com/hello

go 1.16

require github.com/sirupsen/logrus v1.8.1

exclude github.com/sirupsen/logrus v1.8.0

replace github.com/sirupsen/logrus => github.com/sirupsen/logrus v1.8.2
```

:::

## Go Modules Checksum

> 为了解决 Go Modules 的包被篡改安全隐患，Go 开发团队在引入`go.mod`的同时也引入了`go.sum`文件，用于记录每个依赖包的哈希值，在构建时，如果本地的依赖包`hash`值与`go.sum`文件中记录得不一致，则会拒绝构建。

-   go.sum 文件中每行记录由 module 名、版本和哈希组成，并由空格分开；
-   在引入新的依赖时，通常会使用`go get`命令获取该依赖，将会下载该依赖包下载到本地缓存目录`$GOPATH/pkg/mod/cache/download`，该依赖包为一个后缀为`.zip`的压缩包，并且把哈希运算同步到`go.sum`文件中；
-   在构建应用时，会从本地缓存中查找所有的`go.mod`中记录的依赖包，并计算本地依赖包的哈希值，然后与`go.sum`中的记录进行对比，当校验失败，go 命令将拒绝构建。

### Go Modules Proxy

Go1.13 将 GOPROXY 默认成了中国大陆无法访问的`https://proxy.golang.org`，所以在国内需要配置代理进行使用。

GOPROXY 可以解决一些公司内部的使用问题：

-   访问公司内网的`git server`
-   防止公网仓库变更或者消失，导致线上编译失败或者紧急回退失败
-   公司审计和安全需要
-   防止公司内部开发人员配置不当造成`import path`泄露
-   cache 热点依赖，降低公司公网出口宽带

```bash
# 配置GOPROXY环境变量
export GOPROXY=https://goproxy.io,direct
# 还可以设置不走 proxy 的私有仓库，多个用逗号相隔(可选)
export GOPRIVATE=git.mycompany.com,github.com/my/private
```

`GOPRIVATE`用来控制 go 命令把哪些仓库看做是私有的仓库，这样的话，可以跳过`proxy server`的校验检查。

当配置`GOPRIVATE`时，它的值同时也将作为`GONOPROXY`和`GONOSUMDB`的默认值，所以当配置`GOPRIVATE`后将会跳过代理，以及`checksum`的校验检查。

::: tip
通常推荐配置`GOPROXY`和`GOPRIVATE`进行使用，`GOPRIVATE`也可以识别`git ssh key`进行权限校验。
:::

## GOPROXY 编译部署

`goproxy.io`是一个 Go Modules 开源代理，也可以作为公司内部代理。

> 下载及编译

```bash
git clone https://github.com/goproxyio/goproxy.git
cd goproxy
go build
```

> 运行 goproxy 代理

```bash
./goproxy -listen=0.0.0.0:8081 -cacheDir=/tmp/cache -proxy https://goproxy.io -exclude "github.com/private"
```

goproxy 运行配置信息：

-   `-cacheDir string`

    go modules cache dir [指定 Go 模块的缓存目录]

-   `-exclude string`

    exclude host pattern [proxy 模式下指定哪些 path 不经过上游服务器]

-   `-listen string`

    service listen address [服务监听端口，默认 8081]

-   `-proxy string`

    next hop proxy for go modules [指定上游 proxy server, 推荐 goproxy.io]

## GoPROXY 访问内网仓库

goproxy 配置访问公司内网的`git server`

-   用户本地配置`GONOSUMDB=github.com/private`
-   goproxy server 配置 exclude 进行排除掉所有的代理仓库
-   goproxy server 配置 ssh key 并且在仓库添加只读权限
-   goproxy server 配置 .gitconfig 把 ssh 替换成 http 方式访问

```
[url "git@github.com:"]
	insteadOf = https://github.com/
[url “git@gitlab.com:”]
	insteadOf = https://gitlab.com/
```

## Unittest

-   小型测试带来的优秀的代码质量、良好的异常处理、优雅的错误报告；大中型测试会带来整体产品质量和数据验证。
-   不同的类型的项目，对测试的需求不同，总体上有一个经验法则，即 70/20/10 原则：70%是小型测试，20%是中型测试，10%是大型测试。
-   如果一个项目是面向用户的，拥有较高的集成度，或者用户接口比较复杂，他们就应该有更多的中型和大型测试，例如索引或网络爬虫，则最好有大量的小型测试，中型测试和大型测试的数量要求会少很多。

单元测试的基本要求：

-   快速
-   环境一致
-   任意顺序
-   并行

基于`docker-compose`实现跨平台语言环境的容器依赖管理方案，以解决运行 unittest 场景下的(mysql、redis、mc)容器依赖问题：

-   本地安装 Docker
-   无侵入式的环境初始化
-   快速重置环境
-   随时随地运行(不依赖外部服务)
-   语义式 API 声明资源
-   真实外部依赖，而非`in-process`模拟
-   正确对容器内服务进行健康检测，避免 unittest 启动时资源还未 ready
-   应该交由 app 自己来初始化数据，比如 db 的 schema，初始的 sql 数据等，为了满足测试的一致性，在每次结束后，都会销毁容器。
