---
title: go交叉编译
date: 2022-01-03 13:48:15
category: Go
tag:
    - compile
---

## Mac 编译 Linux 可执行文件

Mac 电脑编译得到 Linux 平台 64 位可以执行程序

```bash
CGO_ENABLE=0 GOOS=linux GOARCH=amd64 go build
```

## Mac 编译 Windows 可执行文件

Mac 电脑编译得到 Windows 平台 64 位可执行程序

```bash
CGO_ENABLE=0 GOOS=windows GOARCH=amd64 go build
```

## Linux 编译 Mac 可执行文件

Linux 平台下编译 Mac 平台 64 位可执行程序

```bash
CGO_ENABLE=0 GOOS=darwin GOARCH=amd64 go build
```

## Linux 编译 Windows 可执行文件

Linux 平台下编译 Windows 平台 64 位可执行程序

```bash
CGO_ENABLE=0 GOOS=windows GOARCH=amd64 go build
```

## Windows 用户

如果使用的是`cmd`，那么请按照如下方式指定环境变量

```bash
SET CGO_ENABLE=0	// 禁用CGO
SET GOOS=linux		// 目标平台为linux
SET GOARCH=amd64	// 目标处理器架构师amd64
```

如果使用的是`powershell`终端，则语法为：

```bash
$ENV:CGO_ENABLE=0
$ENV:GOOS="linux"
$ENV:GOARCH="amd64"
```

在你的`windows`终端下执行完上述命令后，再执行以下命令，得到的就是能够在 Linux 平台运行的可执行文件了

```bash
go build
```

如果需要编译 Mac 可执行文件，就是把`GOOS`换成`drawin`即可。
