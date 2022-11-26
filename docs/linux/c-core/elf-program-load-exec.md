---
title: ELF 可执行文件的装载与执行
date: 2022-11-26 20:28:15
category: C
tag:
    - ELF
---

# ELF 可执行文件的装载与执行

## 程序的启动过程

案例代码：

```go
package main

import "time"

var a = 300
var b = 300

func main() {
	for {
		time.Sleep(time.Second * 10)
	}
}

```

我们将代码传到`Linux`服务器，然后对这段代码进行编译：`go build demo1.go`

我们使用`echo $$`来查看当前`Linux`的控制进程，也就是`bash`进程或者`sh`进程。

```bash
[root@VM-16-4-centos base]# echo $$
11885
```

编译后查看文件类型是一个静态链接。

```bash
[root@VM-16-4-centos base]# file demo1
demo1: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, not stripped
```

使用`strace`命令来跟踪控制进程

```bash
strace -f -s 65000 -i -t -e trace=read,clone,fork,execve,wait4 -p 11885
```

![image-20221126131438412](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221126131438412.png)

1.  控制进程调用`read`函数接收`./demo1`数据

2.  控制进程调用`clone`函数创建一个进程并分配好虚拟地址空间

3.  新子进程调用`execve`加载`demo1`程序【ELF 可执行文件，程序指令 + 程序数据】加载到内存中去执行

    > 加载时，它并不是全部加载所有的指令和数据，它在加载时，操作系统会先把进程的虚拟地址空间按页分割，同时也会把物理内存也按页分割，也把磁盘按页分割。

    1.  创建好虚拟地址空间
    2.  读取 ELF 可执行文件信息，并且建立映射关系【把 ELF 文件的 VMA 和进程的虚拟地址空间建立映射关系】
    3.  找到可执行程序的入口地址，开始执行

使用`pstree -ap`来查看进程父子关系

```bash
  ├─sshd,1112 -D
  │   ├─sshd,11857
  │   │   └─bash,11885
  │   │       └─demo1,15602
  │   │           ├─{demo1},15603
  │   │           ├─{demo1},15604
  │   │           └─{demo1},15605

```

```bash
cd /proc/15602
```

然后查看进程的虚拟地址空间【进程内存布局】

```bash
[root@VM-16-4-centos 15602]# cat maps
地址范围		   权限  dev      node                                     所映射的文件
00400000-00458000 r-xp 00000000 fd:01 797257                             /data/work/gopath/src/te/base/demo1  # 映射的文件 代码段 VMA代码段
00458000-004bf000 r--p 00058000 fd:01 797257                             /data/work/gopath/src/te/base/demo1 # 只读数据段 VMA只读
004bf000-004c4000 rw-p 000bf000 fd:01 797257                             /data/work/gopath/src/te/base/demo1 # 读写数据段 VMA读写
004c4000-004f7000 rw-p 00000000 00:00 0
c000000000-c000400000 rw-p 00000000 00:00 0
c000400000-c004000000 ---p 00000000 00:00 0
7fb351003000-7fb353374000 rw-p 00000000 00:00 0
7fb353374000-7fb3634f4000 ---p 00000000 00:00 0
7fb3634f4000-7fb3634f5000 rw-p 00000000 00:00 0
7fb3634f5000-7fb3753a4000 ---p 00000000 00:00 0
7fb3753a4000-7fb3753a5000 rw-p 00000000 00:00 0
7fb3753a5000-7fb37777a000 ---p 00000000 00:00 0
7fb37777a000-7fb37777b000 rw-p 00000000 00:00 0
7fb37777b000-7fb377bf4000 ---p 00000000 00:00 0
7fb377bf4000-7fb377bf5000 rw-p 00000000 00:00 0
7fb377bf5000-7fb377c74000 ---p 00000000 00:00 0
7fb377c74000-7fb377cd4000 rw-p 00000000 00:00 0
7fff1538f000-7fff153b0000 rw-p 00000000 00:00 0                          [stack]  # VMA 栈
7fff153f9000-7fff153fb000 r-xp 00000000 00:00 0                          [vdso] # 内核
ffffffffff600000-ffffffffff601000 r-xp 00000000 00:00 0                  [vsyscall]	# 系统调用

```

`VMA`地址范围：

-   r: read
-   w: write
-   e:execute
-   p:private
-   s: 共享 share

可以使用`man proc`去查看文档，然后输入`/maps`查找

![image-20221126132528422](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221126132528422.png)

---

使用`readelf -l demo1`来查看程序头表

```bash
[root@VM-16-4-centos base]# readelf -l demo1

Elf file type is EXEC (Executable file)
Entry point 0x454b20
There are 7 program headers, starting at offset 64

Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  PHDR           0x0000000000000040 0x0000000000400040 0x0000000000400040
                 0x0000000000000188 0x0000000000000188  R      1000
  NOTE           0x0000000000000f9c 0x0000000000400f9c 0x0000000000400f9c
                 0x0000000000000064 0x0000000000000064  R      4
  LOAD           0x0000000000000000 0x0000000000400000 0x0000000000400000
                 0x00000000000576ce 0x00000000000576ce  R E    1000
  LOAD           0x0000000000058000 0x0000000000458000 0x0000000000458000
                 0x0000000000066b20 0x0000000000066b20  R      1000
  LOAD           0x00000000000bf000 0x00000000004bf000 0x00000000004bf000
                 0x0000000000004020 0x0000000000037fa0  RW     1000
  GNU_STACK      0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000  RW     8
  LOOS+5041580   0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000         8

 Section to Segment mapping:
  Segment Sections...
   00
   01     .note.go.buildid
   02     .text .note.go.buildid
   03     .rodata .typelink .itablink .gosymtab .gopclntab
   04     .go.buildinfo .noptrdata .data .bss .noptrbss
   05
   06

```

进程的内存布局(静态链接暂时没有堆)

```mermaid
graph TD
	堆-heap
	栈-stack
	代码段
	数据段
	动态链接映射
```

当程序启动时，会创建一个虚拟地址空间【进程是有自己的虚拟地址空间】同时加载 ELF 文件并读取该文件信息，同时建立映射关系(`/proc/PID/maps`)

程序要运行，肯定是要把程序指令和程序数据加载到内存中才可以执行的

1.  我们的物理内存是有限的

2.  操作系统启动的进程数量是非常多的
3.  我们的进程使用的内存大部分情况下是会超出物理内存的
    1.  物理地址
    2.  虚拟地址

## 代码段

程序源码

```go
package main

import (
	"fmt"
)

var a = 300
var b = 300

func main() {
	fmt.Println(a, b)
	fmt.Println(&a, &b)
}

```

程序指令，只复制 2 行出来解析，太多了，使用`objdump -s demo1 > demo1.txt`即可生成

```
401000 493b6610 76384883 ec184889 6c241048  I;f.v8H...H.l$.H
401010 8d6c2410 48894424 2048895c 24286690  .l$.H.D$ H.\$(f.
```

-   `401000`go 编译器给可执行文件分配的虚拟地址【地址偏移】

-   `493b6610 76384883 ec184889 6c241048`是指令内容

-   指令大小：一堆 4 个字节，总共 16 个字节

-   指令对应的汇编语句：

    ```bash
    [root@VM-16-4-centos base]# size demo1
       text	   data	    bss	    dec	    hex	filename
    1093520	  97776	 213608	1404904	 156fe8	demo1
    ```

    大小：1093520KB，太大，不太方便看。

    可以使用

    ```bash
    [root@VM-16-4-centos base]# objdump -d demo1 > demo1go3.txt
    ```

    来查看汇编语句

    ```
      401000:       49 3b 66 10             cmp    0x10(%r14),%rsp
      401004:       76 38                   jbe    40103e <internal/cpu.Initialize+0x3e>
      401006:       48 83 ec 18             sub    $0x18,%rsp
      40100a:       48 89 6c 24 10          mov    %rbp,0x10(%rsp)
      40100f:       48 8d 6c 24 10          lea    0x10(%rsp),%rbp
      401014:       48 89 44 24 20          mov    %rax,0x20(%rsp)
      401019:       48 89 5c 24 28          mov    %rbx,0x28(%rsp)
      40101e:       66 90                   xchg   %ax,%ax
      401020:       e8 7b 06 00 00          callq  4016a0 <internal/cpu.doinit>
      401025:       48 8b 44 24 20          mov    0x20(%rsp),%rax
      40102a:       48 8b 5c 24 28          mov    0x28(%rsp),%rbx
      40102f:       e8 2c 00 00 00          callq  401060 <internal/cpu.processOptions>
      401034:       48 8b 6c 24 10          mov    0x10(%rsp),%rbp
      401039:       48 83 c4 18             add    $0x18,%rsp
      40103d:       c3                      retq
      40103e:       48 89 44 24 08          mov    %rax,0x8(%rsp)
      401043:       48 89 5c 24 10          mov    %rbx,0x10(%rsp)
      401048:       e8 b3 7b 05 00          callq  458c00 <runtime.morestack_noctxt.abi0>
      40104d:       48 8b 44 24 08          mov    0x8(%rsp),%rax
      401052:       48 8b 5c 24 10          mov    0x10(%rsp),%rbx
      401057:       eb a7                   jmp    401000 <internal/cpu.Initialize>
      401059:       cc                      int3
      40105a:       cc                      int3
      40105b:       cc                      int3
      40105c:       cc                      int3
      40105d:       cc                      int3
      40105e:       cc                      int3
      40105f:       cc                      int3
    ```

    虚拟地址：401000

    指令内容：49 3b 66 10

    指令大小：4 字节

    指令对应的汇编指令：`cmp 0x10(%r14),%rsp`

> `go`程序语句时多条
>
> 一条`go`语句：对应多条汇编语句
>
> 一条汇编语句：对应多个字节的指令
>
> 每条指令都有一个虚拟内存地址

查看程序入口地址

```bash
[root@VM-16-4-centos base]# readelf -h demo1
ELF 头：
  Magic：  7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  类别:                              ELF64
  数据:                              2 补码，小端序 (little endian)
  版本:                              1 (current)
  OS/ABI:                            UNIX - System V
  ABI 版本:                          0
  类型:                              EXEC (可执行文件)
  系统架构:                          Advanced Micro Devices X86-64
  版本:                              0x1
  入口点地址：              0x45c220
  程序头起点：              64 (bytes into file)
  Start of section headers:          456 (bytes into file)
  标志：             0x0
  本头的大小：       64 (字节)
  程序头大小：       56 (字节)
  Number of program headers:         7
  节头大小：         64 (字节)
  节头数量：         23
  字符串表索引节头： 3
```
