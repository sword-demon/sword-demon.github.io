---
title: ELF文件结构
date: 2022-04-30 14:28:15
category: GoCore
---

## 编译好的含有程序指令+程序数据的二进制文件 - ELF 文件结构

![ELF结构](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220430142800.png)

可以输入`man elf`来查看一些手册内容。

查看`go`编译出的二进制文件

```bash
[root@jb51 base]# readelf -h demo1
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
  Entry point address:               0x453b60  # 程序入口地址
  Start of program headers:          64 (bytes into file)
  Start of section headers:          456 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         7
  Size of section headers:           64 (bytes)
  Number of section headers:         23
  Section header string table index: 3
```

这个就是`ELF`文件头信息。

:::warning

程序头表(program header)只有可执行文件或动态库文件才有，目标文件【可重定位文件】是没有的。

:::

使用如下命令来查看程序头表

```bash
[root@jb51 base]# readelf -l demo1

Elf file type is EXEC (Executable file)
Entry point 0x453b60
There are 7 program headers, starting at offset 64

Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  PHDR           0x0000000000000040 0x0000000000400040 0x0000000000400040
                 0x0000000000000188 0x0000000000000188  R      1000
  NOTE           0x0000000000000f9c 0x0000000000400f9c 0x0000000000400f9c
                 0x0000000000000064 0x0000000000000064  R      4
  LOAD           0x0000000000000000 0x0000000000400000 0x0000000000400000
                 0x00000000000553f0 0x00000000000553f0  R E    1000
  LOAD           0x0000000000056000 0x0000000000456000 0x0000000000456000
                 0x0000000000061d68 0x0000000000061d68  R      1000
  LOAD           0x00000000000b8000 0x00000000004b8000 0x00000000004b8000
                 0x00000000000033a0 0x0000000000037200  RW     1000
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

有 7 段程序头表。

`R E`：可读可执行，对应的应该是代码段，只有代码能读能执行

`R W`：只有数据才能读写

程序头表：它决定了操作系统加载可执行文件时的映射方法

第三部分段表部分内容：

```bash
[root@jb51 base]# objdump -h demo1

demo1:     file format elf64-x86-64

Sections:
Idx Name          Size      VMA(段的虚拟地址)            LMA         File off  Algn
  0 .text         000543f0  0000000000401000  0000000000401000  00001000  2**5
                  CONTENTS, ALLOC, LOAD, READONLY, CODE
  1 .rodata       000224d8  0000000000456000  0000000000456000  00056000  2**5
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  2 .typelink     000002c0  0000000000478660  0000000000478660  00078660  2**5
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  3 .itablink     00000008  0000000000478920  0000000000478920  00078920  2**3
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  4 .gosymtab     00000000  0000000000478928  0000000000478928  00078928  2**0
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  5 .gopclntab    0003f428  0000000000478940  0000000000478940  00078940  2**5
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  6 .go.buildinfo 00000020  00000000004b8000  00000000004b8000  000b8000  2**4
                  CONTENTS, ALLOC, LOAD, DATA
  7 .noptrdata    00001180  00000000004b8020  00000000004b8020  000b8020  2**5
                  CONTENTS, ALLOC, LOAD, DATA
  8 .data         000021f0  00000000004b91a0  00000000004b91a0  000b91a0  2**5
                  CONTENTS, ALLOC, LOAD, DATA
  9 .bss          0002eb28  00000000004bb3a0  00000000004bb3a0  000bb3a0  2**5
                  ALLOC
 10 .noptrbss     00005320  00000000004e9ee0  00000000004e9ee0  000e9ee0  2**5
                  ALLOC
 11 .zdebug_abbrev 000001e6  00000000004f0000  00000000004f0000  000bc000  2**0
                  CONTENTS, READONLY, DEBUGGING
 12 .zdebug_line  00020a4a  00000000004f0119  00000000004f0119  000bc119  2**0
                  CONTENTS, READONLY, DEBUGGING
 13 .zdebug_frame 0000a594  000000000050346d  000000000050346d  000cf46d  2**0
                  CONTENTS, READONLY, DEBUGGING
 14 .debug_gdb_scripts 0000002a  0000000000507036  0000000000507036  000d3036  2**0
                  CONTENTS, READONLY, DEBUGGING
 15 .zdebug_info  0004fa12  0000000000507060  0000000000507060  000d3060  2**0
                  CONTENTS, READONLY, DEBUGGING
 16 .zdebug_loc   000645c3  00000000005285b2  00000000005285b2  000f45b2  2**0
                  CONTENTS, READONLY, DEBUGGING
 17 .zdebug_ranges 000237b0  0000000000539b68  0000000000539b68  00105b68  2**0
                  CONTENTS, READONLY, DEBUGGING
 18 .note.go.buildid 00000064  0000000000400f9c  0000000000400f9c  00000f9c  2**2
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
```

代码段比较长，不建议使用命令去查看。

```bash
[root@jb51 base]# size demo1
   text    data     bss     dec     hex filename
 745500   13200  212552  971252   ed1f4 demo1
```

-   `text`：是二进制文件存储程序指令的位置，下面的数字是表示指令的大小，指令越少，执行越快，速度就越快。
-   `data`：是二进制文件存储程序数据的位置，下面的数据表示数据占用内存大小
-   `bss`：也是数据段，主要存储还没有初始化的数据

可以使用`readelf -s a.o`可重定位文件去查看一些别的其他文件段。
