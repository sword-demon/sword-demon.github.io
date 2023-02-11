---
title: TCP 粘包
date: 2023-02-11 18:27:20
category: Socket
tag:
    - tcp
---

# TCP 粘包

## 栈

> 操作系统分配给进程/线程的一块连续的内存区域【专用内存】

栈的主要内容：函数的参数、函数里的局部变量、函数的返回值【隐形的返回地址】

在进程里，CPU 的执行受程序计数器控制【它的寄存器名称为 IP(`instruction pointer`) 8 位的古董级】

32 位的 EIP 64 位的 RIP 【寄存器上面存储了下一个条要执行的指令的地址】

CPU 取出寄存器上的指令去执行，本身是顺序执行的，如果需要有条件判断，则会进行有条件的跳转执行

栈顶由 RSP 寄存器 来管

栈底由 RBP 寄存器 来管

代码解析

```c
#include <stdio.h>
#include <stdlib.h>

void C() {
    printf("i am c func");
    exit(0);
}
void B(){
    long *p=0;
    p=(long*)&p;
    *(p+2) = (long)C;
}

void A(){
    B();
}


int main(){
    A();
    return 0;
}
```

```
0x4005d9 <main+9>               callq  0x4005c0 <A>
```

`callq`是`x86_64`架构的一个指令

地址 <函数的名字>

```bash
│0x4005c4 <A+4>          mov    $0x0,%eax                                        │
│0x4005c9 <A+9>          callq  0x40059a <B>        # 准备要进入B函数                              │
│0x4005ce <A+14>         pop    %rbp  # 程序的返回地址 隐形的
```

寄存器 rax 的地址

```bash
│rax            0x0      0
```

```bash
│0x40059e <B+4>  movq   $0x0,-0x8(%rbp)    long *p = 0                                      │
   │0x4005a6 <B+12> lea(取地址)    -0x8(%rbp),%rax     p = (long*)&p                                   │
   │0x4005aa <B+16> mov    %rax,-0x8(%rbp)                                            │
   │0x4005ae <B+20> mov    -0x8(%rbp),%rax                                          │
   │0x4005b2 <B+24> lea    0x10(%rax),%rdx                                          │
   │0x4005b6 <B+28> mov    $0x40057d,%eax    此时返回地址已经改成了C函数的地址                                       │
   │0x4005bb <B+33> mov    %rax,(%rdx)                                              │
  >│0x4005be <B+36> pop    %rbp                                                     │
   │0x4005bf <B+37> retq 返回指令，从栈空间里取出返回地址【地址已经变成了C函数的地址】，并且修改RIP，CPU只管取指令运行
```

通过赋值地址之后`rax`变成如下内容：

```bash
│rax            0x7fffffffe438   140737488348216
```

`p`的地址存的是一个 0

`*(p+2)`：表示 地址 + 2\*8 跳转了 16 个字节

```bash
(gdb) si
(gdb) p $rsp 打印栈的内存地址
$14 = (void *) 0x7fffffffe448 此时的地址存储的是C函数的地址
(gdb) si
C () at a.c:5
```

## 程序的跳转

1.  有条件的跳转
    1.  `ifelse while for`等
2.  无条件的跳转
    1.  函数调用
