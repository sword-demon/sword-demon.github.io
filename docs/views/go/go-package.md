---
title: go包管理
date: 2021-09-23 21:48
category: Go
tag:
    - package
    - mod
---

## 初识包管理

关于包管理的总结：

-   一个文件夹可以称为一个包
-   在文件夹（包）中可以创建多个文件
-   在同一个包的每个文件中必须指定 **包名称且相同**

<!-- more -->

案例：

项目目录/app.go

```go
package main

func main() {
  // 花括号必须换行，否则报错
}
```

项目目录/api/baidu.go

```go
package api


```

**关于包的分类**

-   `main`包，如果是 main 包，则必须写一个 main 函数，此函数就是项目的入口(main 主函数)，编译就会生成一个可执行文件。
-   非 main 包，用来将代码进行分门别类的，分别放在不同的包和文件夹中

### 属于同一个包，包名相同，直接去调用即可

项目目录/app.go

```go
// 定义了包的名字，声明当前go文件属于哪个包，
package main

import "fmt"

// 定义一个函数 main函数，程序开始执行的函数，每一个可执行的函数必须包含一个main函数
func main() {
	// 这是单行的注释

	/*
	多行注释，块注释
	 */

	fmt.Println("hello world")
	// 调用city.go 的Add方法，因为他们属于同一个包，包名相同，直接去调用即可
	Add()
}
```

项目目录/city.go

```go
package main

import "fmt"

func Add() {
	fmt.Println("我是city.go的Add功能")
}

```

输出:

```go
hello world
我是city.go的Add功能
```

### 调用不同包的时候

项目目录/api/baidu.go

```go
package api

import "fmt"

func Baidu()  {
	fmt.Println("百度")
}

```

项目目录/app.go

```go
// 定义了包的名字，声明当前go文件属于哪个包，
package main

import (
	"fmt"
	"github.com/xinwangqilin/base_learn/api"
)

// 定义一个函数 main函数，程序开始执行的函数，每一个可执行的函数必须包含一个main函数
func main() {
	// 这是单行的注释

	/*
	多行注释，块注释
	 */

	fmt.Println("hello world")
	// 调用city.go 的Add方法，因为他们属于同一个包，包名相同，直接去调用即可
	Add()

	// 调用api/baidu.go 的Baidu() 方法 ，只要包.方法名即可
	api.Baidu()
}
```

### 注意事项

方法名：

-   **首字母大写，用于外部公有可以进行访问**
-   **小写，用于私有，外部无法访问**

## init 函数

导入包的时候，会自动执行`init`函数

**init 函数没有参数也没有返回值，在程序运行时自动被调用执行，不能在代码中主动调用它**

包初始化执行的顺序如下图：

![init](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/image-20210921145405183.png)
