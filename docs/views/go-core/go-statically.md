---
title: 静态链接
date: 2022-04-17 23:27:15
category: GoCore
---

## 静态链接

```bash
[root@jb51 core]# vim demo1.go
[root@jb51 core]# go build demo1.go
[root@jb51 core]# ls
demo1  demo1.go
[root@jb51 core]# file demo1
demo1: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, not stripped
```

可以看的出来，编译过后的`demo1`文件，是一个可执行文件，而且是静态链接的。而我们熟悉的`c`语言通过`gcc`编译之后是动态链接的。`c`语言如何实现静态链接呢？

`b.c`

```c
int x = 300;

int test(int v) {
    return v;
}
```

`a.c`

```c
extern int x;

int main()
{
    test(x);
    return 0;
}
```

```bash
[root@jb51 core]# gcc -c b.c -o b.o
[root@jb51 core]# gcc -c a.c -o a.o
[root@jb51 core]# ld a.o b.o -e main -o ab
```

先编译 ，得到`.o`目标文件，`ld`将两个`.o`进行链接，并指定入口函数为`main`，得到一个`ab`文件，`ld`这里是一个静态链接器，可以使用命令`man ld`

```bash
[root@jb51 core]# file ab
ab: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, not stripped
```

此时通过`ld`之后的`ab`就是静态链接。

> 1.  静态链接器[`ld`]会将输入的目标文件`a.o`、`b.o`进行合并，把【`.text、.data`等段】进行合并，会重新计算段的大小和偏移位置。
>
> 2.  同时，静态链接器还给输出的可执行文件分配了虚拟内存空间【`vma和lma`】，它给程序指令和程序数据分配的虚拟地址空间，这个地址空间就是程序启动时进程的虚拟地址空间，并且完成了重定位操作，还完成了符号地址绑定【符号决议、符号解析】
> 3.  静态链接器还会将段`section(.text .data .bss .rodata)按相同权限合并`得到段`segment`【程序头表】，它决定了操作系统加载程序时如何将`elf`文件以进程的虚拟地址空间进行映射【涉及到进程的内存布局】

符号表：就是指函数名、变量名

就有符合名：符号值、符号类型、符号大小和符号范围

![符号表](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220501111048.png)

就可以看到上述的有`main`函数之类的就是符号表的内容。
