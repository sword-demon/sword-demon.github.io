---
title: Makefile修炼
date: 2022-7-25 22:14:10
category: C
tag:
    - makefile
---

# Linux 中的编译脚本 Makefile 的讲解设计

## 概念

说明了组成程序的各模块之间的相互`make`按照这些说明自动地维护这些模块。

> `Makefile`最终要的是要清晰编译链接的整个过程。

我们最终只需要输入一个`make`命令即可完成整个项目的编译

### 编译链接的过程

`hello.c`

```c
#include <stdio.h>

int a;
int b = 100;
int main()
{
    printf("hello world\n");
    return 0;
}
```

从`.c` --> `.i` --> `.s汇编` --> `.o`

1.  预编译：加载头文件，加载动态链接库

2.  汇编：`gcc -S hello.i -o hello.s`产生了我们的汇编代码

    ```c
    [root@jb51 c]# cat hello.s
            .file   "hello.c"
            .comm   a,4,4
            .globl  b
            .data
            .align 4
            .type   b, @object
            .size   b, 4
    b:
            .long   100
            .section        .rodata
    .LC0:
            .string "hello world"
            .text
            .globl  main
            .type   main, @function
    main:
    .LFB0:
            .cfi_startproc
            pushq   %rbp
            .cfi_def_cfa_offset 16
            .cfi_offset 6, -16
            movq    %rsp, %rbp
            .cfi_def_cfa_register 6
            movl    $.LC0, %edi
            call    puts
            movl    $0, %eax
            popq    %rbp
            .cfi_def_cfa 7, 8
            ret
            .cfi_endproc
    .LFE0:
            .size   main, .-main
            .ident  "GCC: (GNU) 4.8.5 20150623 (Red Hat 4.8.5-44)"
            .section        .note.GNU-stack,"",@progbits
    ```

    即刚才的 C 语言解析成了汇编语言，这里有几个段

    `text`代码段：存放的是你的代码

    `data`数据段：存的是一些字符串、const 变量或者 static 变量，还有一些赋了初值的全局变量，就会放到`data`段里。

    `bss`段：变量`a`存放在这里，这里是不占内存的，最后是在你使用的时候帮你分配内存

    rodata：只读数据段

3.  编译：`.s`到`.o`的过程，将汇编编程机器码，就变成一个可执行的二进制文件

    ```bash
    gcc -c hello.s -o hello.o
    ```

    这个就不能使用记事本或者别的编辑器打开了，如果打开都是些乱码，我们如果是 windows 平台可以使用`WinkHex`软件去打开看一看。

    我们还可以去执行一下，但是得给它赋予执行权限

    ```bash
    chmod +x hello.o
    ./hello.o
    # 会提示如下即可
    -bash: ./hello.o: cannot execute binary file
    ```

4.  链接：有几个`.c`文件，就可以生成多少个`.o`文件，最后要将这 3 个文件编译成`ELF`二进制可执行文件

    ```bash
    [root@jb51 c]# gcc hello.o -o hello
    [root@jb51 c]# ./hello
    hello world
    [root@jb51 c]# file hello
    hello: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.32, BuildID[sha1]=115b58fd30dcfc21a6e0aa445fa72a10f2f318ea, not stripped
    ```

### `gcc`命令

`gcc`、`g++`或者`arm-linux-gcc`等编译工具

多数 UNIX 平台都通过 CC 调用它们的 C 编译程序.除标准和 CC 以外,LINUX 和 FREEBSD 还支持 gcc.
基本的编译命令有以下几种:

1.  `-c`

    > 编译产生对象文件(\*.obj)而不链接成可执行文件,当编译几个独立的模块,而待以后由链接程序把它们链接在一起时,就可以使用这个选项,如:

    ```bash
    gcc -c hello.c ===> hello.o   // 控制你的编译的过程
    ```

2.  -o

    > 允许用户指定输出文件名,如

    ```bash
    gcc hello.c -o hello.o
        or
    gcc hello.c -o hello
    ```

3.  -g: `gdb`选项，用于调试

    > 指明编译程序在编译的输出中应产生调试信息.这个调试信息使源代码和变量名引用在调试程序中或者当程序异常退出后在分析 core 文件时可被使用.

    ```bash
    gcc -c -g hello.c
    ```

4.  -D

    > 允许从编译程序命令行定义宏符号
    > 一共有两种情况:一种是用-D MACRO,相当于在程序中使用`#define MACRO`,另一种是用-`DMACRO=A`,相当于程序中的`#define MACRO A`.如对下面这代码:
    >
    > ```c
    > #ifdefine DEBUG
    > printf("debug message\n");
    > #endif
    > ```
    >
    > 编译时可加上-D DEBUG 参数,执行程序则打印出编译信息

5.  -I

    > 可指定查找 include 文件的其他位置.例如,如果有些 include 文件位于比较特殊的地方,比如/usr/local/include,就可以增加此选项如下:
    > gcc -c -I/usr/local/include -I/opt/include hello.c 此时目录搜索会按给出的次序进行.

6.  -E：预编译

    -   加载头文件
    -   加载动态链接库

    ```bash
    gcc -E hello.c -o hello.i

    # 最终会加载头文件和动态链接库，然后最下面是你的代码
    ```

    > 这个选项是相对标准的,它允许修改命令行以使编译程序把预先处理的 C 文件发到标准输出,而不实际编译代码.在查看 C 预处理伪指令和 C 宏时,这是很有用的.可能的编译输出可重新定向到一个文件,然后用编辑程序来分析:

    ```bash
    gcc -c -E hello.c
    # 生成 cpp.out
    # 此命令使include文件和程序被预先处理并重定向到文件cpp.out.以后可以用编辑程序或者分页命令分析这个文件,并确定最终的C语言代码看起来如何.
    ```

7.  -O：编译选项，去编译优化

    > 输出 优化选项, 这个选项不是标准的
    > -O 和 -O1 指定 1 级优化
    > -O2 指定 2 级优化
    > -O3 指定 3 级优化
    > -O0 指定不优化
    > gcc -c O3 -O0 hello.c 当出现多个优化时,以最后一个为准!!

8.  -Wall

    > 以最高级别使用 GNU 编译程序,专门用于显示警告用!!
    > gcc -Wall hello.c

9.  -L：指定连接库的搜索目录,-l(小写 L)指定连接库的名字

    ```bash
    gcc main.o -L/usr/lib -lqt -o hello
    ```

    > 上面的命令把目标文件 main.o 与库 qt 相连接,连接时会到/usr/lib 查找这个库文件.也就是说-L 与-l 一般要成对出现.

### 简单`Makefile`示例

```makefile
CC=gcc
RM = rm -rf
FLAGS= -g -o
OBJGEN = linklist

# 获取当前目录下的所有c文件
SRC = $(wildcard *.c)
# 将所有的.c文件换成.o
OBJS = $(patsubst %.c,%.o,$(SRC))

$(OBJGEN):$(OBJS)
	$(CC) $(FLAGS) $@ $^
# 规定所有.c --> .o 的具体规则，为了在生成.o文件的时候加入 -g 选项 帮助调试 $< 第一个依赖文件
%.o:%.c
	$(CC) -c $(FLAGS) $@ $<
.PHONY:clean
clean:
	$(RM) $(OBJS) $(OBJGEN)
```

## 依赖关系（显示规则）

```
target:dep
	command

生成目标:生成目标所需要的依赖文件
	执行的命令
```

```
# 当前目录
output.c
Makefile
```

对应的`Makefile`的显示规则编写：

```M
target:output.o
	gcc output.o -o target # 依赖关系 会从这里向下去找

ouput.o:output.c
	gcc output.c -o output.o
```

如果`.c`文件很多的情况下，持续这么写下去，会很伤元气，写的人难受，复制粘贴都难受。

如果有链接，最好写在最上面，因为当你执行`make`命令时，会找到你的`Makefile`文件，从第一个目标文件开始识别。

## 变量

## 通配符

## 隐式规则

## 函数
