---
title: 排序算法
date: 2021-11-03 20:27:15
category: DataStruct
tag:
    - sort
---

## 冒泡排序

时间复杂度：O(n^2^)

```java
package com.array;

import java.util.Arrays;

public class Bubble {
    public static void main(String[] args) {
        int[] arr = {1, 2, 233, 43334, 54454, 56656, 7676, 121};
        int[] sort = sort(arr);
        System.out.println(Arrays.toString(sort));
    }

    public static int[] sort(int[] array) {
        for (int i = 0; i < array.length - 1; i++) {
            for (int j = 0; j < array.length - i - 1; j++) {
                if (array[j + 1] < array[j]) {
                    int temp = array[j + 1];
                    array[j + 1] = array[j];
                    array[j] = temp;
                }
            }
        }
        return array;
    }
}

```

### 优化

如果是顺序的，就减少一次循环

```java
package com.array;

import java.util.Arrays;

public class Bubble {
    public static void main(String[] args) {
        int[] arr = {1, 2, 233, 43334, 54454, 56656, 7676, 121};
        int[] sort = sort(arr);
        System.out.println(Arrays.toString(sort));
    }

    public static int[] sort(int[] array) {
        for (int i = 0; i < array.length - 1; i++) {
            boolean flag = false; // 减少没有意义的比较
            for (int j = 0; j < array.length - i - 1; j++) {
                if (array[j + 1] < array[j]) {
                    int temp = array[j + 1];
                    array[j + 1] = array[j];
                    array[j] = temp;
                    flag = true;
                }
            }

            if (!flag) {
                break;
            }
        }
        return array;
    }
}

```

## 选择排序思路

1. 先从列表中遍历得到一个最小的，拿出来备用
2. 再在剩下的列表里再继续遍历得到一个最小的，依次拿出来，但是存放在哪里呢，可以放到一个新的列表

### 关键步骤

-   一趟排序记录最小的数，放到第一个位置
-   再一趟排序记录列表无序区最小的数，放到第二个位置
-   。。。依次类推
-   算法的关键点：有序区和无序区、无序区最小数的位置

### 简单版选择排序

```Python
def select_sort_simple(li):
    li_new = []
    for i in range(len(li)):
        min_val = min(li)
        li_new.append(min_val)
        li.remove(min_val)
    return li_new


li = [3, 2, 4, 1, 7, 8, 87, 76]
print(select_sort_simple(li))

// [1, 2, 3, 4, 7, 8, 76, 87]
```

不推荐使用

致命缺点：

-   生产了 2 个列表，需要更大的内存，数据量大了就炸裂
-   复杂度：
    -   这里可不是 `On` 的复杂度，因为这里还使用了`min` 和`remove` 方法，两个方法都会去遍历一次列表，所以`min` 本身就是`On` ，`remove` 也是`On`
    -   随意最终复杂度是：`On²`

### 比较好的代码

```Python
[3, 2, 4, 1, 7, 8, 87, 76]
```

> 我们首先还是遍历，获取第一个最小的数和第一个位置进行交换 ，交换后，从第二个往后的是无序的，从无序 里继续找再继续换位置。

```Python
def select_sort(li):
    for i in range(len(li) - 1):
        # 记录最小值的位置
        # 假定最小值的位置就是第一个,后面进行比较进行交换
        min_loc = i
        # 偷一次懒，下面没必要从i开始，从i+1开始，自己和自己没必要比
        for j in range(i + 1, len(li)):
            if li[j] < li[min_loc]:
                # 得到新的最小值的下标
                min_loc = j
        li[i], li[min_loc] = li[min_loc], li[i]
```

### 复杂度

```
On²
```

:::tabs

@tab:active Go

### Go 语言实现的选择排序

```go
package main

import (
	"fmt"
)

func main() {
    a := []int{3, 2, 4, 1, 7, 8, 87, 76}
    for i := 0; i < len(a) - 1; i++ {
        min := i
        for j := i + 1; j < len(a); j++ {
            if (a[j] < a[min]) {
                min = j
            }
        }
        // 交换位置
        arr[i], arr[min] = arr[min], arr[i]
    }

    fmt.Println(a)
}
```

@tab C

### C 语言实现选择排序

```c
//
// Created by virus on 2022/5/23.
//

#include "stdio.h"

int main() {
    int arr[] = {1, 2, 3, 10, 9, 12, 2100, 12, 4};
    // 得到数组的长度
    int length = sizeof(arr) / sizeof(arr[0]);
//    printf("%d\n", length);
    for (int i = 0; i < length - 1; i++) {
        int min = i;
        for (int j = i + 1; j < length; j++) {
            if (arr[j] < arr[min]) {
                min = j;
            }
        }
        int tmp = arr[i];
        arr[i] = arr[min];
        arr[min] = tmp;
    }

    for (int i = 0; i < length; ++i) {
        printf("%d\t", arr[i]);
    }
}
```

@tab Python

```python
def select_sort(li):
    for i in range(len(li) - 1):
        # 记录最小值的位置
        # 假定最小值的位置就是第一个,后面进行比较进行交换
        min_loc = i
        # 偷一次懒，下面没必要从i开始，从i+1开始，自己和自己没必要比
        for j in range(i + 1, len(li)):
            if li[j] < li[min_loc]:
                # 得到新的最小值的下标
                min_loc = j
        li[i], li[min_loc] = li[min_loc], li[i]
```

:::
