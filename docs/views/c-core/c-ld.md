---
title: C编译链接的过程
date: 2022-05-12 21:59:15
category: C
tag:
    - ld
---

# C 编译、链接过程

## `extern`和`static`的作用

### `static`

#### 1. 修饰函数

> `static`修饰函数时表示，该函数只在本文件有效，也就是只能被本文件的其他函数调，其他文件不能调用(引用)。

`a.c`

```c
int func1(void)
{
    func(100); // 不能引用
}
```

`b.c`

```c
static void func(int stu_num)
{
    // .....
}
```

`static`就像是一把锁，把函数`func`的有效范围锁在了`b.c`其他`.c`看不见这个函数 ，自然无法调用。

:::tip

因为`static`将函数名这个符号变成了“本地符号”，“本地符号”只在本文件可见，其他文件是看不见的。

:::

#### 2. 修饰变量

1.  `static`修饰局部变量

    > 改变的是局部变量的存储位置，从栈变为静态存储区，与“本地符号”什么的没有关系

    ```c
    int func(int va)
    {
        int a;
        int b = 10;

        // ...
    }
    ```

    `a、b`为“自动局部变量”，空间开辟于栈中。

    加了`static`修饰

    ```c
    int func(int va)
    {
        static int a;
        static int b = 10;

        // ...
    }
    ```

    `a、b`变为了“静态局部变量”，`a、b`的空间开辟于静态存储区，而不再是栈。

    -   如果没有初始化的话，比如`a`就没有初始化，`a`的空间在静态区中的`.bss`区
    -   如果有初始化的话，比如`b`就有初始化，`b`的空间在静态区中的`.data`区

2.  `static`修饰全局变量

    > 与修饰函数一样，让全局变量只在本文件有效，其它文件无法引用。
    >
    > `static`修饰全局变量的时候，与全局变量的存储位置无关，全局变量的空间本来就是在静态存储区，加不加`static`并不能改变存储位置，`static`只是改变了符号的属性，变成了本地符号。

### `extern`

#### 1. 修饰函数

> `extern`修饰的函数，表示除了能被本文件引用外，还可以被其他的文件引用，在其他文件中是可见的，只不过在其他文件中引用时，需要做声明。刚好与`static`相反。

`a.c`

```c
extern void func(int stu_num);

extern int a_fun(void)
{
    fun(100);
}
```

`b.c`

```c
extern void fun(int stu_num)
{
    // ...
}
```

事实上，`extern`不需要明确写出，因为默认是`extern`的，也就是说定义和声明可以写出如下格式：

```c
void func(int stu_num);

int a_fun(void)
{
    fun(100);
}
```

```c
void fun(int stu_num)
{
    // ...
}
```

## 编译过程

编译原理可以去看一本书：《现代编译原理》，有词法分析、语法分析、优化、生成中间代码

```c
#include "stdio.h"

int main()
{
    printf("hello world\n");
}
```

源码文件 --> gcc 处理 --> `elf`可执行文件

有这样的一个过程：预处理、编译、汇编、链接

使用`gcc`命令文档[https://man7.org/linux/man-pages/man1/gcc.1.html](https://man7.org/linux/man-pages/man1/gcc.1.html)

### 预处理：`gcc -E`操作,使用预处理器

> -E Stop after the preprocessing stage; do not run the compiler
> proper. The output is in the form of preprocessed source
> code, which is sent to the standard output.

预处理后的文件也是一个源码文件

```bash
gcc -E demo1.c -o demo1.i

# 查看文件内容
cat demo1.i
```

会发现有很多头文件和一些代码插入进来。

### 编译：`gcc -S`，使用编译器

> -S Stop after the stage of compilation proper; do not assemble.
> The output is in the form of an assembler code file for each
> non-assembler input file specified.
>
> ​
>
> ​ By default, the assembler file name for a source file is made
> ​ by replacing the suffix .c, .i, etc., with .s.
>
> ​ Input files that don't require compilation are ignored.

```bash
gcc -S demo1.i -o demo1.s

# 生成汇编代码文件
```

```bash
➜ file demo1.s
demo1.s: assembler source text, ASCII text
```

### 汇编：`gcc -c`，使用汇编器，将汇编源码转换为机器指令

> -c Compile or assemble the source files, but do not link. The
> linking stage simply is not done. The ultimate output is in
> the form of an object file for each source file.
>
> ​ By default, the object file name for a source file is made by
> ​ replacing the suffix .c, .i, .s, etc., with .o.
>
> ​ Unrecognized input files, not requiring compilation or
>
> ​ assembly, are ignored.

翻译：

> 编译或组装源文件，但不要链接的
> 连系阶段还没有完成。最终的输出是 in
> 每个源文件的目标文件的形式。默认情况下，源文件的对象文件名由
> 将后缀.c， .i， .s 等替换为.o。
>
> 无法识别的输入文件，不需要编译或
>
> 大会,将被忽略。

```bash
gcc -c demo1.s -o demo1.o

➜ file demo1.o
demo1.o: Mach-O 64-bit object arm64

```

我这边用的是`mac unix`编译的，如果是 linux 则是`elf`可重定向文件

```bash
file demo1.o
demo1.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped
```

经过上述 3 个操作之后生成的文件是`ELF`可重定向文件，顺带介绍一下`elf`文件的类型

-   REL(Relocatable file)
-   EXEC(Executable file)

### 链接：使用链接器

> 主要功能：把各个模块链接起来组织成为可执行文件
>
> 如果是直接`gcc demo1.c`，会直接把你上述几个过程都做了直接生成可执行文件，包括现在的编辑器点击的`Run`运行也是这样的一个过程。

例如：

```
a.c b.c 源码文件
a.o b.o 目标文件
a.o b.o 一些库文件[运行库]
最后一起链接得到可执行文件
```

为什么要链接：因为我们某些文件里的，使用的比如：`printf`就是标准库提供的，链接的时候会去链接它所在的库文件。

```bash
gcc demo1.o -o demo1

➜ file demo1
demo1: Mach-O 64-bit executable arm64

```

现在这个文件就是一个可执行文件。

直接执行

```bash
./demo1
hello world
```

符号：`Symbol`

> 在链接中，把函数的名字，变量【全局变量】的名字都称为符号

在开发大型项目时，会把系统拆分成各个模块，去开发编写，在编译时，是单独编译成各个目标文件得到`.o`文件，这些模块会涉及到函数以及变量的调用【访问】，如果`a.c 调用foo函数`没有声明也没有定义，在`b.c重定义好的foo函数`，链接器会帮它去找到对应的函数地址，将各个模块链接起来。

实际上我们可以直接使用`gcc demo1.c`生成`demo1`可执行文件，加上`-o`可以指定对应的文件名称。

### 步骤总结

demo.c

1.  `gcc -E demo1.c -o demo1.i` 源码文件
2.  `gcc -S demo1.i -0 demo1.o` 源码文件
3.  `gcc -c demo1.s -o demo1.o` 目标文件 ELF 格式存储
4.  `gcc demo1.o -o demo1` 可执行文件 是程序 ELF 格式存储

直接步骤：`gcc demo1.c`直接得到可执行文件。

### 目标文件/可执行文件里面的内容

使用`objdump -h`来查看目标文件段内容

```bash
objdump -h demo1.o
```

![section header](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220503175419.png)

-   `.bss`：未初始化数据段
-   `.rodata`：只读数据段
-   `.text`：表示的就是程序的代码段【程序指令】，就是程序的代码保存在`.text`段里。

> 简单总结：这个文件内容就是程序指令 + 程序数据构成。

使用`objdump -s -d demo1.o`查看指令内容

```bash
demo1.o:     file format elf64-x86-64

Contents of section .text:
 0000 554889e5 bf000000 00e80000 00005dc3  UH............].
Contents of section .rodata:
 0000 68656c6c 6f20776f 726c642c 63206c61  hello world,c la
 0010 6e677561 67652063 6f726500           nguage core.
Contents of section .comment:
 0000 00474343 3a202847 4e552920 342e382e  .GCC: (GNU) 4.8.
 0010 35203230 31353036 32332028 52656420  5 20150623 (Red
 0020 48617420 342e382e 352d3434 2900      Hat 4.8.5-44).
Contents of section .eh_frame:
 0000 14000000 00000000 017a5200 01781001  .........zR..x..
 0010 1b0c0708 90010000 1c000000 1c000000  ................
 0020 00000000 10000000 00410e10 8602430d  .........A....C.
 0030 064b0c07 08000000                    .K......

Disassembly of section .text:


# 下面是程序代码段【程序指令】的内容以及对应的汇编代码
0000000000000000 <main>:
   0:	55                   	push   %rbp
   1:	48 89 e5             	mov    %rsp,%rbp
   4:	bf 00 00 00 00       	mov    $0x0,%edi
   9:	e8 00 00 00 00       	callq  e <main+0xe>
   e:	5d                   	pop    %rbp
   f:	c3                   	retq
```

-   file format elf64-x86-64：文件类型
-   `554889e5 bf000000 00e80000 00005dc3`：程序指令的内容以 16 进制的形式显示出来，对应的十六进制`0x55`就是开头的部分的，对应的是程序指令的内容，它反汇编后对应的汇编指令是`push %rbp`
-   `UH............].`：这部分是程序指令对应的`ASCII`码文本

![汇编指令内容](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220505111234.png)
