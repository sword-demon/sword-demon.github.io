---
title: 文件包含
date: 2022-05-28 15:50:15
category: C
tag:
    - include
---

## 文件包含

**C 语言的编译过程**

![C语言的编译过程](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220528155152.png)

<!-- more -->

> 预处理就是宏的事情，常见的就是以小博大的事情，最常见的就是文件包含：`include`，这些头文件非常的多。

```c
#include <stdio.h>

int main() {
    puts("hello world");
    return 0;
}
```

一个简单的例子，`puts`函数就在`stdio`头文件中进行了声明和函数原型。我们可以替换为：

```c
//
// Created by virus on 2022/5/28.
//

int __cdecl puts(char const*);

int main() {
    puts("hello world");
    return 0;
}

```

所以这里，我们引用头文件只是为了方便，就是为了引用我们需要的一些函数原型，导入一个头文件，最后编译会展开对应的内容都引入进来来代替头文件部分，<span style="color: green;">最后展开的内容还是根据自己的编译器有关</span>。

## 自定义头文件

这里会有一个注意点：

使用双引号导入头文件的特点：

`#include "xxx.h"`

1.  首先查找当前源文件所在路径
2.  查找工程的头文件搜索路径

使用`<>`会直接查找工程的头文件搜索路径,如果此时在`CMakeLists.txt`文件中设置

```txt
cmake_minimum_required(VERSION 3.19)

get_filename_component(ProjectId ${CMAKE_CURRENT_SOURCE_DIR} NAME)
string(REPLACE " " "_" ProjectId ${ProjectId})
project(${ProjectId} C)

set(CMAKE_C_STANDARD 11)

# 这一行
include_directories("include")

file(GLOB files "${CMAKE_CURRENT_SOURCE_DIR}/*.c")
foreach(file ${files})
    get_filename_component(name ${file} NAME)
    add_executable(${name} ${file} src/factorial.c)
endforeach()
```

即可使用`<>`来进行引用

---

自定义两个目录：`include`和`src`，`include`放头文件，`src`放源文件

新建阶乘的头文件：

```c
//
// Created by virus on 2022/5/29.
//

#ifndef HELLOWORLDC_INCLUDE_FACTORIAL_H_
#define HELLOWORLDC_INCLUDE_FACTORIAL_H_

// 在中间部分写对应的实现方法的原型
unsigned int Factorial(unsigned int n);

unsigned int FactorialByIteration(unsigned int n);

#endif //HELLOWORLDC_INCLUDE_FACTORIAL_H_

```

新建阶乘的源文件

```c
//
// Created by virus on 2022/5/29.
//

// 引入路径必须使用双引号，尖括号不行
#include "../include/factorial.h"

unsigned int Factorial(unsigned int n) {
    if (n == 0) {
        return 1;
    } else {
        return n * Factorial(n - 1);
    }
}

unsigned int FactorialByIteration(unsigned int n) {
    unsigned int result = 1;
    unsigned int i = n;
    for (; i > 0; i--) {
        result *= i;
    }
    return result;
}
```

最后是使用的示例

```c
//
// Created by virus on 2022/5/29.
//

#include "stdio.h"
#include "include/factorial.h"

int main(void) {
    printf("3!=%d\n", Factorial(3));
    return 0;
}
```

如果这里设置了`CMakeLists.txt`的`include_directories("include")`，这里引入的头文件可以使用尖括号来代替：`#include <factorial.h>`

:::tip 注意点

所以说，双引号是兼容的，但是呢，使用双引号，编译的时候会首先在本地查一遍，会有一个资源的开销，也正因为如此，如果你知道这个头文件在搜索路径下，就使用`<>`进行引入。

:::
