---
title: 程序与进程
date: 2022-07-17 11:43:10
category: Process
tag:
    - process
    - programe
---

## 程序 Program

### 程序

> `Program`一般是指可执行文件，在`Linux`系统中它按`ELF`格式进行存储，并没后缀可标识其文件类型，需要统计`file`命令来查看`ELF`文件的具体类型。

### ELF

> 全称是`Executable Linkable Format`在`Linux`中。

#### ELF 文件种类

1.  `EXEC`：可执行文件
2.  `REL`：可重定位文件
3.  `Shared Object File`：共享目标文件
4.  `core dump`文件（进程中出现程序的崩溃或异常会产生）

> REL 在`Linux`中为`xx.o、xx.a`也称为静态库文件；
>
> 其中`xx.o`称为目标文件可被链接器链接称为可执行文件，静态库文件，动态库文件

示例：`php`扩展中常用的动态库文件如：`curl`，网络框架库如：`event.so`，`socket`扩展库：`sockets.so`

`C/C++`项目程序员一般引用第三方的库函数都是使用第三方编译好的动态库或者静态库文件`.so、.a`。

![使用file命令](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220330203812.png)

使用`file`命令查看不同的文件的类型，发现都是`ASCII text`类型的文件。

再来尝试查看`c`文件编译的一些文件：

```c
#include <stdio.h>
#include <stdlib.h>

void hello()
{
    int a = 10;
}

int glob_var;
int glob_var1 = 10;

int main()
{
    static int x = 10;
    printf("%#x\n", &x);
    printf("hello world\n");
    return 100;
}
```

我们使用如下命令进行编译

```bash
gcc -E demo1.c -o demo1.i
```

生成一个`demo1.i`文件，再次查看其文件类型

```bash
[root@VM-16-4-centos process]# file demo1.i
demo1.i: C source, ASCII text
```

我们在进行一个编译命令

```bash
gcc -S demo1.i -o demo1.s
```

它现在就变成了汇编源码，查看其文件类型：

```
[root@VM-16-4-centos process]# file demo1.s
demo1.s: ASCII text

```

```c
[root@VM-16-4-centos process]# file demo1.s
demo1.s: ASCII text
[root@VM-16-4-centos process]# cat demo1.s
        .file   "demo1.c"
        .text
        .globl  hello
        .type   hello, @function
hello:
.LFB2:
        .cfi_startproc
        pushq   %rbp
        .cfi_def_cfa_offset 16
        .cfi_offset 6, -16
        movq    %rsp, %rbp
        .cfi_def_cfa_register 6
        movl    $10, -4(%rbp)
        popq    %rbp
        .cfi_def_cfa 7, 8
        ret
        .cfi_endproc
.LFE2:
        .size   hello, .-hello
        .comm   glob_var,4,4
        .globl  glob_var1
        .data
        .align 4
        .type   glob_var1, @object
        .size   glob_var1, 4
glob_var1:
        .long   10
        .section        .rodata
.LC0:
        .string "%#x\n"
.LC1:
        .string "hello world"
        .text
        .globl  main
        .type   main, @function
main:
.LFB3:
        .cfi_startproc
        pushq   %rbp
        .cfi_def_cfa_offset 16
        .cfi_offset 6, -16
        movq    %rsp, %rbp
        .cfi_def_cfa_register 6
        movl    $x.2688, %esi
        movl    $.LC0, %edi
        movl    $0, %eax
        call    printf
        movl    $.LC1, %edi
        call    puts
        movl    $100, %eax
        popq    %rbp
        .cfi_def_cfa 7, 8
        ret
        .cfi_endproc
.LFE3:
        .size   main, .-main
        .data
        .align 4
        .type   x.2688, @object
        .size   x.2688, 4
x.2688:
        .long   10
        .ident  "GCC: (GNU) 4.8.5 20150623 (Red Hat 4.8.5-44)"
        .section        .note.GNU-stack,"",@progbits

```

最后再进行汇编，可以生成一个目标文件`.o`

```bash
gcc -c demo1.s -o demo1.o
```

```bash
[root@VM-16-4-centos process]# gcc -c demo1.s -o demo1.o
[root@VM-16-4-centos process]# file demo1.o
demo1.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped

```

可以看出，它此时的文件类型已经发生了变化。已经变成了`可重定位文件`

我们可以使用`readelf`命令查看其头文件类型

```bash
readelf -h demo1.o
```

```bash
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              REL (Relocatable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x0
  Start of program headers:          0 (bytes into file)
  Start of section headers:          1000 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           0 (bytes)
  Number of program headers:         0
  Size of section headers:           64 (bytes)
  Number of section headers:         13
  Section header string table index: 12

```

可以看到`Type`一栏，类型为：`REL (Relocatable file)`可重定位文件。

我们还可以将这个目标文件生成一个可执行文件：

```bash
gcc demo1.o -o demo1
```

此时会生成一个真正的可执行文件

```bash
[root@VM-16-4-centos process]# file demo1
demo1: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.32, BuildID[sha1]=186f29b85aea3233bd7c77e9d27a910649262531, not stripped
```

```bash
[root@VM-16-4-centos process]# readelf -h demo1
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x400490
  Start of program headers:          64 (bytes into file)
  Start of section headers:          6624 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         9
  Size of section headers:           64 (bytes)
  Number of section headers:         30
  Section header string table index: 29

```

此时看它的文件类型：`EXEC (Executable file)`可执行文件，那么就可以再终端进行运行

```bash
[root@VM-16-4-centos process]# ./demo1
0x601040
hello world

```

我们去安装`php`的扩展目录下查看文件：

```bash
opcache.so  zip.so
```

```bash
[root@VM-16-4-centos no-debug-non-zts-20200930]# readelf -h zip.so
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              DYN (Shared object file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x6030
  Start of program headers:          64 (bytes into file)
  Start of section headers:          248488 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         7
  Size of section headers:           64 (bytes)
  Number of section headers:         36
  Section header string table index: 35
[root@VM-16-4-centos no-debug-non-zts-20200930]# file zip.so
zip.so: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, BuildID[sha1]=963be8e479de4cb95b19fffb9f0d909ea2cfe2e8, not stripped

```

最好推荐使用`readelf`去查看具体的类型。

我们查看一下`php`的解释器的文件

```bash
[root@VM-16-4-centos bin]# readelf -h php
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x446473
  Start of program headers:          64 (bytes into file)
  Start of section headers:          15757992 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         9
  Size of section headers:           64 (bytes)
  Number of section headers:         31
  Section header string table index: 30

```

可以看到它的种类也是`ELF`文件，是可执行文件，它就有自己的代码段和数据段。

#### ELF 文件内容

> 目标文件`.o`【内有代码段+数据段】用来生成目标共享文件，静态库，动态库文件，可执行文件；
>
> 共享目标文件也叫动态库文件`.so`【代码段+ 数据段】
>
> 可执行文件【代码段+数据段】直接运行的可执行文件
>
> 其他`ELF`文件如`core dump`文件只是存储进程产生的异常信息

### ELF 文件结构

**可通过`objdump / readelf`查看`ELF`相关信息**

> ELF 头部分

`Magic`：魔数，代表`ELF`标识码

```
7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
```

每一个都表示一个字节。

`7F`对应的`ASCII`码是`DEL`

[ascii 码对照表](https://www.habaijian.com/)

> `02`第五个字节表示的是`ELF`文件的位，是 32 位的还是 64 位的，一般是两种，`02`就是 64 位的，`01`是 32 位的。
>
> 第六个字节`01`表示的是`ELF`文件的字节序，有两种情况，`01`是小端字节序，`02`是大端字节序，
>
> 这里的`Data`字段就告诉我们是小端字节序了：`2's complement, little endian`
>
> 第七个字节`01`表示的是`ELF`的主版本号 ，一般都是`01`，一般不用管。
>
> 后面的`0`也不用管，没啥特殊的含义。

` Entry point address`：可执行文件的入口地址，虚拟内存地址的入口，从这个地方开始执行。

---

`ELF`文件的信息是以 节 `Section` 或是 段 `segment` 来存储的

-   程序指令，或是正文段，代码段，就是`.text`

-   程序数据，数据段，就是`.data`

-   其他的还有`.bss`，主要存储一些未初始化的变量，也是数据段

-   `.rodata`也是数据段，主要放一些只读的数据

```bash
[root@VM-16-4-centos process]# objdump -h demo1.o

demo1.o:     file format elf64-x86-64

Sections:
Idx Name          Size      VMA               LMA               File off  Algn
  0 .text         00000036  0000000000000000  0000000000000000  00000040  2**0
                  CONTENTS, ALLOC, LOAD, RELOC, READONLY, CODE
  1 .data         00000008  0000000000000000  0000000000000000  00000078  2**2
                  CONTENTS, ALLOC, LOAD, DATA
  2 .bss          00000000  0000000000000000  0000000000000000  00000080  2**0
                  ALLOC
  3 .rodata       00000011  0000000000000000  0000000000000000  00000080  2**0
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  4 .comment      0000002e  0000000000000000  0000000000000000  00000091  2**0
                  CONTENTS, READONLY
  5 .note.GNU-stack 00000000  0000000000000000  0000000000000000  000000bf  2**0
                  CONTENTS, READONLY
  6 .eh_frame     00000058  0000000000000000  0000000000000000  000000c0  2**3
                  CONTENTS, ALLOC, LOAD, RELOC, READONLY, DATA

```

## 进程

`Process`一个正被执行的程序就是一个进程，系统会给进程一个唯一的标识符，进程 ID。上述类型为`EXEC`才会真正认为是一个程序。

### Linux 如何启动一个进程

程序加载器`Program Loader`调用`exec`系列函数如`execve`来加载一个可执行文件，同时它会给新程序传递命令行参数和环境参数表。

在终端中输入：`./demo1`(正在打开的终端也是一个正在执行的进程，`echo`是`shell`的内置命令)

```bash
[root@VM-16-4-centos process]# type echo
echo is a shell builtin

```

可以查看一下当前终端的一个进程

```bash
[root@VM-16-4-centos process]# echo $$
29338

```

两个美元符号其实是一个特殊变量

[shell 特殊变量](https://www.cnblogs.com/wangzxblog/p/11835051.html)

我们可以通过一个命令：`strace`用来查看系统调用

:::tip 系统调用

应用程序是调用系统的函数库（静态库或动态库），也能直接调用函数，也就是`systeml call`，最近接操作系统的内核；这些函数是`C`定义好的函数，可以直接调用。

:::

```bash
strace -f -s 6550 ./demo1
```

```bash
[root@VM-16-4-centos process]# strace -f -s 6550 ./demo1
# 函数(可执行文件 数组元素     环境参数表)
execve("./demo1", ["./demo1"], 0x7fff4a282df8 /* 25 vars */) = 0
brk(NULL)                               = 0x186f000
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f96cdfab000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
open("/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=51367, ...}) = 0
mmap(NULL, 51367, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f96cdf9e000
close(3)                                = 0
open("/lib64/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0`&\2\0\0\0\0\0@\0\0\0\0\0\0\0p\325 \0\0\0\0\0\0\0\0\0@\08\0\n\0@\0K\0J\0\6\0\0\0\5\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0000\2\0\0\0\0\0\0000\2\0\0\0\0\0\0\10\0\0\0\0\0\0\0\3\0\0\0\4\0\0\0`\354\30\0\0\0\0\0`\354\30\0\0\0\0\0`\354\30\0\0\0\0\0\34\0\0\0\0\0\0\0\34\0\0\0\0\0\0\0\20\0\0\0\0\0\0\0\1\0\0\0\5\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0203\34\0\0\0\0\0\0203\34\0\0\0\0\0\0\0 \0\0\0\0\0\1\0\0\0\6\0\0\0\3606\34\0\0\0\0\0\3606<\0\0\0\0\0\3606<\0\0\0\0\0\260Q\0\0\0\0\0\0\20\233\0\0\0\0\0\0\0\0 \0\0\0\0\0\2\0\0\0\6\0\0\0`k\34\0\0\0\0\0`k<\0\0\0\0\0`k<\0\0\0\0\0\360\1\0\0\0\0\0\0\360\1\0\0\0\0\0\0\10\0\0\0\0\0\0\0\4\0\0\0\4\0\0\0p\2\0\0\0\0\0\0p\2\0\0\0\0\0\0p\2\0\0\0\0\0\0D\0\0\0\0\0\0\0D\0\0\0\0\0\0\0\4\0\0\0\0\0\0\0\7\0\0\0\4\0\0\0\3606\34\0\0\0\0\0\3606<\0\0\0\0\0\3606<\0\0\0\0\0\20\0\0\0\0\0\0\0\240\0\0\0\0\0\0\0\20\0\0\0\0\0\0\0P\345td\4\0\0\0|\354\30\0\0\0\0\0|\354\30\0\0\0\0\0|\354\30\0\0\0\0\0\374j\0\0\0\0\0\0\374j\0\0\0\0\0\0\4\0\0\0\0\0\0\0Q\345td\6\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\20\0\0\0\0\0\0\0R\345td\4\0\0\0\3606\34\0\0\0\0\0\3606<\0\0\0\0\0\3606<\0\0\0\0\0\209\0\0\0\0\0\0\209\0\0\0\0\0\0\1\0\0\0\0\0\0\0\4\0\0\0\24\0\0\0\3\0\0\0GNU\0\215\251p}Q\216\210\27\233\33)\3\315\204l\202\20-\204\301\4\0\0\0\20\0\0\0\1\0\0\0GNU\0\0\0\0\0\2\0\0\0\6\0\0\0 \0\0\0\0\0\0\0\363\3\0\0\7\0\0\0\0\1\0\0\16\0\0\0\0000\20D\240 \2\1\210\3\346\220\305E\214\0\300\0\10\0\5\200\0`\300\200\0\r\212\f\0\4\20\0\210D2\10.@\210T<, \0162H&\204\300\214\4\10\0\2\2\16\241\254\32\4f\300\0\3002\0\300\0P\1 \201\10\204\v  ($\0\4 Z\0\20X\200\312DB(\0\6\200\20\30B\0 @\200\0\tP\0Q\212@\20\0\0\0\0\10\0\0\21\20", 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=2156592, ...}) = 0
mmap(NULL, 3985920, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f96cd9bd000
mprotect(0x7f96cdb81000, 2093056, PROT_NONE) = 0
mmap(0x7f96cdd80000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1c3000) = 0x7f96cdd80000
mmap(0x7f96cdd86000, 16896, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f96cdd86000
close(3)                                = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f96cdf9d000
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f96cdf9b000
arch_prctl(ARCH_SET_FS, 0x7f96cdf9b740) = 0
access("/etc/sysconfig/strcasecmp-nonascii", F_OK) = -1 ENOENT (No such file or directory)
access("/etc/sysconfig/strcasecmp-nonascii", F_OK) = -1 ENOENT (No such file or directory)
mprotect(0x7f96cdd80000, 16384, PROT_READ) = 0
mprotect(0x600000, 4096, PROT_READ)     = 0
mprotect(0x7f96cdfac000, 4096, PROT_READ) = 0
munmap(0x7f96cdf9e000, 51367)           = 0
fstat(1, {st_mode=S_IFCHR|0620, st_rdev=makedev(136, 0), ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f96cdfaa000
# 向终端打印字符串
# 1 文件描述符是1 fd
write(1, "0x601040\n", 90x601040
)               = 9
write(1, "hello world\n", 12hello world
)           = 12
# 100 进程的中止状态码
exit_group(100)                         = ?
+++ exited with 100 +++

# 最后可能会关掉一些标准输入和输出
```

## 进程的终止

代码运行到最后一行，或者遇到`exit`、`return`就是正常的退出，还有异常的退出，都有各自的状态码。

PHP：中断信号的退出

C/C++：中断退出、`abort`

> 进程退出之后，可以使用`echo $?`可以查看一个退出的状态码

```bash
[root@VM-16-4-centos ~]# echo $?
0
```
