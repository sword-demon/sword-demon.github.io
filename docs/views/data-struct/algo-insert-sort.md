---
title: 插入排序
date: 2022-07-20 23:54:10
category: DataStruct
tag:
    - insert-sort
---

## 插入排序

:::tip 小例子

比如我们打牌的时候，总会将摸到的一张牌自动的插到一个有序的排列的组合里面

1.  初始时手里只有一张牌，且有序
2.  每次(从无序区)摸一张牌，插入到手里已经有牌的正确位置

:::

**动画学习**

[插入排序动画链接](https://visualgo.net/zh/sorting)

伪代码步骤描述

```
将第一个元素标记为已排序

对于每一个未排序的元素 X

  “提取” 元素 X

  i = 最后排序过元素的索引 到 0 的遍历

    如果当前元素 j > X

      将排序过的元素向右移一格

    跳出循环并在此插入 X
```

-   需要摸`n-1`次牌
-   从摸出来的牌的右侧位置开始循环，判断右侧的是否比自己大，大则往后移，知道找到前面没有比自己大的为止退出循环

## python 代码

```python
# -*- coding: utf8 -*-
# @Time    : 2022/7/20 23:32
# @Author  : wxvirus
# @File    : insert_sort.py
# @Software: PyCharm
# 插入排序

def insert_sort(li):
    # i 表示摸到的牌的下标
    for i in range(1, len(li)):
        # 摸到的牌
        tmp = li[i]
        # j指的是手里的牌的下标
        j = i - 1
        # 循环只要j位置的牌比摸到的牌小，就停止循环 已经j到了最左边的位置也退出循环
        while j >= 0 and li[j] > tmp:
            # 找插入的位置
            li[j + 1] = li[j]
            j -= 1
        # j一直往左
        li[j + 1] = tmp
        print(li)


li = [3, 2, 3, 4, 44, 5, 6, 7, 90]
print("原列表: ")
print(li)
insert_sort(li)
print("排序后的列表")
print(li)

```

```bash
原列表:
[3, 2, 3, 4, 44, 5, 6, 7, 90]
[2, 3, 3, 4, 44, 5, 6, 7, 90]
[2, 3, 3, 4, 44, 5, 6, 7, 90]
[2, 3, 3, 4, 44, 5, 6, 7, 90]
[2, 3, 3, 4, 44, 5, 6, 7, 90]
[2, 3, 3, 4, 5, 44, 6, 7, 90]
[2, 3, 3, 4, 5, 6, 44, 7, 90]
[2, 3, 3, 4, 5, 6, 7, 44, 90]
[2, 3, 3, 4, 5, 6, 7, 44, 90]
排序后的列表
[2, 3, 3, 4, 5, 6, 7, 44, 90]
```

**时间复杂度：`O(n²)`**

## 总结

和冒泡、选择排序一样

-   时间复杂度都是`O(n²)`
-   都是在原地排序

## 效率

我们先写一个装饰器来获取运行时间

```python
# -*- coding: utf8 -*-
# @Time    : 2022/7/20 23:49
# @Author  : wxvirus
# @File    : cal_time.py
# @Software: PyCharm

import time


def cal_time(func):
    def wrapper(*args, **kwargs):
        t1 = time.perf_counter()
        result = func(*args, **kwargs)
        t2 = time.perf_counter()
        print("%s running time: %s sec." % (func.__name__, t2 - t1))
        return result

    return wrapper

```

然后再随机生成 10000 个数的列表

```python
# -*- coding: utf8 -*-
# @Time    : 2022/7/20 23:32
# @Author  : wxvirus
# @File    : insert_sort.py
# @Software: PyCharm
# 插入排序
import random
from cal_time import *


@cal_time
def insert_sort(li):
    # i 表示摸到的牌的下标
    for i in range(1, len(li)):
        # 摸到的牌
        tmp = li[i]
        # j指的是手里的牌的下标
        j = i - 1
        # 循环只要j位置的牌比摸到的牌小，就停止循环 已经j到了最左边的位置也退出循环
        while j >= 0 and li[j] > tmp:
            li[j + 1] = li[j]
            j -= 1
        # j一直往左
        li[j + 1] = tmp
        # print(li)


li = list(range(10000))
random.shuffle(li)
# print("原列表: ")
# print(li)
insert_sort(li)
# print("排序后的列表")
print(li)

```

:::tip 注意

需要将循环里的打印去掉，这也会影响效率

:::

```bash
insert_sort running time: 2.083077084 sec.
```

这里比较快的原因可能是我电脑比较好，一般来说可能会 10 秒，觉得快的可以再继续加大生成的列表的数值来测试。
