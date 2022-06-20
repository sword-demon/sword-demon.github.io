---
title: 变量内存地址分析
date: 2022-05-20 23:02:15
category: C
tag:
    - variable
    - memory
---

## 变量内存地址分析

```go
//
// Created by virus on 2022/5/20.
//

#include "stdio.h"

int main() {
    // <type> <name>
    int value; // 不赋值默认为0

    // <type> <name> = <initialized value>
    int value_init = 3;

    value = 4;
    value_init = 5;

    printf("value :%d\n", value);

    value_init = value;
    printf("size of value: %d\n", sizeof(value)); // 打印字节数

    printf("address of value: %#x\n", &value); // 打印十六进制内存地址
    return 0;
}
```

## 访问内存上的数据指令

### 通过虚拟地址别名【变量名、函数名】访问内存上的数据和指令

```c
#include <stdio.h>
#include <stdlib.h>

int x = 10;

int test()
{
        return x;
}

int main()
{
        printf("x=%d\r\n", x);
        printf("x=%p\r\n", &x);

        printf("test=%p\r\n", test);

        char *test_text = (char*)(test);

        int i = 0;
        for (i;i < 12; i++) {
                printf("%x\r\n", test_text[i]);
        }
        return 0;
}
```

| 地址别名 | 内存地址 | 指令（机器码指令） |
| -------- | -------- | ------------------ |
| test     | 40052d   | 55                 |
|          | 40052e   | 48                 |
|          | 40052f   | 89                 |
|          | 400530   | e5                 |
|          | 400531   | 8b                 |
|          | 400532   | 05                 |
|          | 400533   | fd                 |
|          | 400534   | 0a                 |
|          | 400535   | 20                 |
|          | 400536   | 00                 |
|          | 400537   | 5d                 |
|          | 400538   | c3                 |

```bash
[root@jb51 memory]# gcc demo2.c -o demo2
[root@jb51 memory]# ./demo2
x=10
x=0x601034
test=0x40052d
55
48
ffffff89
ffffffe5
ffffff8b
5
fffffffd
a
20
0
5d
ffffffc3
```

编译完之后，我们使用`objdump -d demo2`查看`test`函数内容

```bash
000000000040052d <test>:
  40052d:       55                      push   %rbp
  40052e:       48 89 e5                mov    %rsp,%rbp
  400531:       8b 05 fd 0a 20 00       mov    0x200afd(%rip),%eax        # 601034 <x>
  400537:       5d                      pop    %rbp
  400538:       c3                      retq
```

这样我们一看就可以读取内存上的指令。

---

读取内存上的数据

```c
printf("x=%d\r\n", x);
```

即可得到：`x = 10`的内容

## 通过虚拟地址访问地址上的数据

```c
int main()
{
        printf("x=%d\r\n", x);
        printf("x=%p\r\n", &x);

        printf("test=%p\r\n", test);
        printf("=====================\r\n");
        char *test_text = (char*)(test);

        int i = 0;
        for (i;i < 12; i++) {
                printf("%x\r\n", test_text[i]);
        }
        printf("=================\r\n");
        printf("%d\r\n", *(int*)(0x60103d));
        printf("=================\r\n");
        char j = 0;
        for (j = 0; j < 12 ;j++) {
                printf("%x\r\n", *(char*)(0x40057d+j));
        }
        return 0;
}
```

```bash
[root@jb51 memory]# ./demo2
x=10
x=0x60103c
test=0x40057d
=====================
55
48
ffffff89
ffffffe5
ffffff8b
5
ffffffb5
a
20
0
5d
ffffffc3
=================
0
=================
55
48
ffffff89
ffffffe5
ffffff8b
5
ffffffb5
a
20
0
5d
ffffffc3
```

通过`readelf -s demo2`来查看起始的地址

```bash
 50: 000000000060103c     4 OBJECT  GLOBAL DEFAULT   24 x   # 看这里的地址
    51: 0000000000400704     0 FUNC    GLOBAL DEFAULT   14 _fini
    52: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND printf@@GLIBC_2.2.5
    53: 0000000000000000     0 FUNC    GLOBAL DEFAULT  UND __libc_start_main@@GLIBC_
    54: 0000000000601038     0 NOTYPE  GLOBAL DEFAULT   24 __data_start
    55: 0000000000000000     0 NOTYPE  WEAK   DEFAULT  UND __gmon_start__
    56: 0000000000400718     0 OBJECT  GLOBAL HIDDEN    15 __dso_handle
    57: 0000000000400710     4 OBJECT  GLOBAL DEFAULT   15 _IO_stdin_used
    58: 0000000000400690   101 FUNC    GLOBAL DEFAULT   13 __libc_csu_init
    59: 0000000000601048     0 NOTYPE  GLOBAL DEFAULT   25 _end
    60: 0000000000400490     0 FUNC    GLOBAL DEFAULT   13 _start
    61: 0000000000601040     0 NOTYPE  GLOBAL DEFAULT   25 __bss_start
    62: 0000000000400589   255 FUNC    GLOBAL DEFAULT   13 main
    63: 0000000000601040     0 OBJECT  GLOBAL HIDDEN    24 __TMC_END__
    64: 0000000000400418     0 FUNC    GLOBAL DEFAULT   11 _init
    65: 000000000040057d    12 FUNC    GLOBAL DEFAULT   13 test # 看这里的地址
```

-   x=10
-   test=0x40057d

> 通过虚拟地址的别名【变量名、函数名】访问内存上面存储的数据【程序数据、程序指令】

```
0
=================
55
48
ffffff89
ffffffe5
ffffff8b
5
ffffffb5
a
20
0
5d
ffffffc3
```

> 直接通过虚拟地址进行访问内存上面存储的程序数据和程序指令

访问内存地址上的数据流程：

1.  先指定虚拟地址的起始地址
2.  按多大字节进行访问
