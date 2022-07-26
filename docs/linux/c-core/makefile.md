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

3 种定义格式：

```makefile
OBJ = xxx
OBJ := xxx # 一旦这样定义，后面没法改，不能追加
OBJ += xxx # 追加
```

取值：`${OBJ}`

上面的`makefile`使用变量之后的优化

```makefile
OBJ = output.o

# 后面如果换平台编译，只改这边一个就行
CC := gcc

target:${OBJ}
	${CC} ${OBJ} -o target

${OBJ}:output.c
	${CC} output.c -o ${OBJ}
```

:::tip 注意

`${}`，如果第一次就是有花括号，后面就都得使用一样的格式的，不能前面使用花括号的，后面使用圆括号的。

:::

使用脚本去识别当前系统的平台

```bash
uname -a
Linux jb51.net 3.10.0-1160.45.1.el7.x86_64 #1 SMP Wed Oct 13 17:20:51 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
```

然后自己去修改变量`CC`的编译指令

---

伪目标：

> 仅仅想让下面的进行执行一下，不用去写一些依赖关系，可以使用伪目标

```makefile
# 定义要编译的目标变量名称
target := talnet_client
OBJ = output.o
# 后面如果换平台编译，只改这边一个就行
CC := gcc

# 定义变量
RM := rm -rf

${target}:${OBJ}
	${CC} ${OBJ} -o ${target}

${OBJ}:output.c
	${CC} output.c -o ${OBJ}

# 修饰下面的都是伪目标
.PHONY:
clean:
	${RM} ${OBJ} ${target}
	# 在终端打印表示清除完毕
	echo "clean up"
```

> 如何使用？

```bash
make clean
```

使用上面命令之后就会先识别到当前目录下的`makefile`文件，然后找到这个伪类修饰的`clean`命令去执行删除目标文件。

> `rm -rf`命令

-   `rm`：删除命令
-   `-rf`可以分成：`-r -f`
-   `-r`: 递归删除
-   `-f`: 强制删除

**谨慎使用！！！**

---

`CFLAGS`：源于`gcc`有很多命令，用于给`gcc`添加参数

```makefile
DEFPS = -D_POSIX_SOURCE -DDEBUG # 会在你的代码里宏定义一个 _POSIX_SOURCE 和一个 DEBUG的宏定义
CFLAGS = -g ${DEFS} ${INCLUDE}
```

-   `-g`：是用于`gdb`调试相关。

-   `-l`选项：我们可能还要加上一个动态链接库

```makefile
DEFPS = -D_POSIX_SOURCE -DDEBUG # 会在你的代码里宏定义一个 _POSIX_SOURCE 和一个 DEBUG的宏定义
CFLAGS = -g ${DEFS}
LIB = -ltermcap # 后面想加什么库，继续往后面加即可

${target}:${OBJ}
	${CC} ${CFLAGS} ${OBJ} -o ${target} ${LIB}
```

-   `-I`选项: 是用于头文件的引入比如定义变量：`INCLUDE = xxx.h`，引用: `CFLAGS = -g ${DEFS} ${INCLUDE}`

## 通配符

-   %: 任意一个
-   \*: 所有
-   ?: 不知道，匹配任意字母
-   $@: 代表目标文件
-   $^: 代表依赖文件
-   $<: 代表第一个依赖文件

使用：`*.o`来匹配所有生成的`.o`文件来代替原先的`OBJ`变量

```makefile
.PHONY:
clean:
	${RM} *.o ${target}
```

使用`$@`代表生成的目标文件，因为它始终就是代表你的目标，这是自动变量。

```makefile
${target}:${OBJ}
	${CC} ${CFLAGS} $^ -o $@
```

潜规则里，`make`编译的时候会帮你识别的。

## 隐式规则

> 编译器会帮你做一些常规的操作

```makefile
target := talnet_client
OBJ = output.o
CC := gcc
RM := rm -rf
DEFPS = -D_POSIX_SOURCE -DDEBUG # 会在你的代码里宏定义一个 _POSIX_SOURCE 和一个 DEBUG的宏定义
CFLAGS = -g ${DEFS}
LIB = -ltermcap # 后面想加什么库，继续往后面加即可

${target}:${OBJ}
	${CC} ${CFLAGS} $^ -o $@

# 隐藏规则：自动匹配所有.c 生成对应的 .o
%.o:%.c
	${CC} $^ -o $@

.PHONY:
clean:
	${RM} *.o ${target}
```

## 函数

用法：`$(函数名 参数1 参数2 参数3 ...)`

:::tip

函数时使用圆括号的！！

:::

上面还有痛点：因为这里我写的 demo 里的`OBJ`变量的`.o`文件很少，可能看不出来，当很多的时候，就会比较麻烦，所以我们使用函数的规则来优化。

-   `wildcard`：取你当前目录下的第一个参数类型的文件列表

```makefile
SRC = $(wildcard *.c) # SRC 源文件里都是 .c 文件列表
```

```makefile
OBJ = $(patsubst %.c,%.o,${SRC})
```

把你第三个参数列表里的所有的第一个参数替换成第二个参数

即：把`.c`列表里的文件替换成任意一个的`.o`文件

最终的简洁以及通用性代码：

```makefile
target := talnet_client
CC := gcc
RM := rm -rf

SRC = $(wildcard *.c)
OBJ = $(patsubst %.c,%.o,${SRC})

DEFPS = -D_POSIX_SOURCE -DDEBUG # 会在你的代码里宏定义一个 _POSIX_SOURCE 和一个 DEBUG的宏定义
CFLAGS = -g ${DEFS}
LIB = -ltermcap # 后面想加什么库，继续往后面加即可

${target}:${OBJ}
	${CC} ${CFLAGS} $^ -o $@ ${LIB}

# 隐藏规则：自动匹配所有.c 生成对应的 .o 想加就加，不加就不加
%.o:%.c
	${CC} $^ -o $@

.PHONY:
clean:
	${RM} *.o ${target}
```

通杀版：

```makefile
target := hello
CC := gcc
RM := rm -rf

SRC = $(wildcard *.c)
OBJ = $(patsubst %.c,%.o,${SRC})

DEFS = -D_POSIX_SOURCE
FLAGS = -g -o

${target}:${OBJ}
	${CC} ${DEFS} ${FLAGS} $@ $^ ${LIB}

.PHONY:
clean:
	${RM} ${OBJ} ${target}
```

:::tip 后面使用

我们只需要调整：`target`和`DEFS`以及可能会有第三方的库，我们需要加上`LIB`

:::

## 测试

新建目录：`testc`

新建代码：`hello.c`

```c
#include <stdio.h>

int main()
{
        printf("hello world\n");
        return 0;
}
```

将上面的`makefile`添加进去，使用`make`命令进行编译

```bash
[root@jb51 testc]# ls
hello.c  makefile
```

```bash
[root@jb51 testc]# make
gcc    -c -o hello.o hello.c
gcc -D_POSIX_SOURCE -g -o hello hello.o
[root@jb51 testc]# ls
hello  hello.c  hello.o  makefile
[root@jb51 testc]# ./hello
hello world
[root@jb51 testc]#
```

```bash
[root@jb51 testc]# make clean
rm -rf hello.o hello
echo "clean up"
clean up
[root@jb51 testc]#
```
