---
title: mac搭建go语言环境
date: 2021-09-23 23:10:00
category: Go
tag:
    - mac
    - env
---

## Mac 系统 Go 开发环境搭建

### 1.1 下载 Go 编译器

https://golang.google.cn/dl/

### 1.2 点击安装

mac 默认的安装目录：`/usr/local/go`

编译器启动文件：`/usr/local/go/bin/go `

> 因为写全路径比较麻烦，所以需要将 go 加入到环境变量

### 1.3 配置环境 PATH

```bash
export PATH=/usr/local/go/bin:$PATH
```

就可以在任何目录，使用`go`关键字运行`go`程序

检验

```bash
go version
```

正确得到的内容

```
go version go1.16.2 darwin/arm64
```

### 1.4 其他配置

#### 1.4.1 创建一个任务目录

> 此目录以后放你写的所有 go 代码

```
/Users/用户名/GolangProjects/
- bin，用于存放编译后的可执行文件 go install 编译时生成的可执行文件
- pkg，用于存放编译后的包文件 go install 编译时生成的包文件
- src,放我们以后编写的所有的go代码和依赖
	- 项目1
		- app.go
	- 项目2
		- xx.go
```

bin 和 pkg 会存放 src 里的项目编译产生的文件

#### 1.4.2 配置环境变量，通知 go 解释器

-   配置 Go 的安装目录，即：Go 源码目录，用于调用 go 相关源码

    ```bash
    export GOROOT=/usr/local/go
    ```

-   配置新创建的文件夹的目录，存放我们的代码和编译的文件

    ```bash
    export GOPATH=/Users/用户名/GolangProjects
    ```

-   配置我们编译完的项目的可执行文件

    ```bash
    export GOBIN=/Users/用户名/GolangProjects/bin
    ```

### 1.5 环境变量“持久化”

```bash
vim ~/.zshrc

// 或者

vim ~/.bash_profile
```

```bash
export PATH=/usr/local/go/bin:$PATH
export GOROOT=/usr/local/go
export GOPATH=/Users/用户名/GolangProjects
export GOBIN=/Users/用户名/GolangProjects/bin
```

将上述 4 个命令追加到该文件里

> 最后还得让它生效

```bash
source ~/.zshrc

// 或者

source ~/.bash_profile
```

### 1.6 编写 go 代码

app.go

```go
// 定义了包的名字，声明当前go文件属于哪个包，
package main

// 告诉go 我需要fmt的这个包，实现了一些格式化输出的函数
import "fmt"

// 定义一个函数 main函数，程序开始执行的函数，每一个可执行的函数必须包含一个main函数
func main() {
	// 这是单行的注释

	/*
	多行注释，块注释
	 */
	fmt.Println("人生苦短，let's go")
}
```

### 1.7 运行 go 代码

本质上就是让 Go 编译器去运行写的代码

方式 1：

```bash
// 先进入项目目录
go run app.go

// 输出：
人生苦短，let's go
```

方式 2：==（推荐方式）==

```go
go build // 进行编译
// 运行
./可执行文件(项目名)

// 起别名编译
go build -o xx
// 运行
./xx
```

方式 3：

```go
// 在项目目录里
go install

// 执行步骤
// 1. 编译
// 2. 到bin目录下查看编译完成的可执行文件
// 3. 执行可执行文件
```
