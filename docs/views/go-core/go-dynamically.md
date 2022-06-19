---
title: 动态链接
date: 2022-04-24 22:27:15
category: GoCore
---

## 动态链接

```bash
[root@jb51 core]# whereis go
go: /data/work/go/bin/go
[root@jb51 core]# file /data/work/go/bin/go
/data/work/go/bin/go: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), not stripped
```

这就是一个动态链接。

简单写一个`c`语言代码

```c
#include <stdio.h>

int main()
{
        printf("hello world");
        return 0;
}
```

```bash
[root@jb51 core]# gcc demo2.c -o demo2
[root@jb51 core]# file demo2
demo2: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.32, BuildID[sha1]=753cd99f6e7eea348393e21510cb44179d765433, not stripped
[root@jb51 core]# ldd demo2
        linux-vdso.so.1 =>  (0x00007ffcfaddc000)
        libc.so.6 => /lib64/libc.so.6 (0x00007f5381f31000)
        /lib64/ld-linux-x86-64.so.2 (0x00007f53822ff000)
[root@jb51 core]# cat demo2.c
```

-   `/lib64/ld-linux-x86-64.so.2 (0x00007f53822ff000)`：动态链接文件`ld`动态链接器
-   `libc.so.6 => /lib64/libc.so.6 (0x00007f5381f31000)`：C 运行库
-   `linux-vdso.so.1 => (0x00007ffcfaddc000)`：`vsdo`虚拟的，进程启动后会映射到进程的虚拟内存空间

`go build`出来的文件，有可能会出现动态链接文件，也可能出现静态链接文件，主要取决于你写的代码。
