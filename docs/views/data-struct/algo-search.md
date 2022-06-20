---
title: 查找算法
date: 2021-10-22 22:14:15
category: DataStruct
tag:
    - search
---

## 查找

> 在一些数据元素中，通过一定的方法找出与给定关键字相同的数据元素的过程。

案例：

列表查找(线性表查找)：从列表中查找指定元素

-   输入：列表、待查找元素
-   输出：元素下标(未找到元素时一般返回 None 或-1)

`python`内置列表差汇总啊函数：`index()`

## 顺序查找 - Linear Search

> 也叫线性查找，从列表第一个元素开始，顺序进行搜索，直到找到元素或搜索到列表最后一个元素为止。

`python实现`

```python
# -*- coding: utf8 -*-
# @Time    : 2021/10/22 22:52
# @Author  : wxvirus
# @File    : search.py
# @Software: PyCharm

def linear_search(li, val):
    for ind, v in enumerate(li):
        if v == val:
            return ind
    else:
        return None

```

时间复杂度：

找 n，就是列表的长度，有一个和 n 相关的循环，所以它的世间复杂度为 `O(n)`

## 二分查找 - Binary Search

> 二分查找：也叫折半查找，从`有序`列表的初始候选区`li[0:n]`开始，通过对待查找的值与候选区中的值的比较，可以使候选区减少一半。

![image-20211023123949042](https://sword-demon.github.io/vue-blog/assets/images/image-20211023123949042.png)

```python
def binary_search(li, val):
	left = 0
	right = len(li) - 1

	while left <= right:
		# 候选区有值
		mid = (left + right) // 2  # 整除2
		if li[mid] == val:
			# 找到了
			return mid
		elif li[mid] > val:
			# 候选区在左边
			right = mid - 1
		else:
			# li[mid] < val
			left = mid + 1
	else:
		return None
```

### 二分查找与线性查找的比较

二分查找的时间复杂度：O(logn)`，比线性查找的效率高

```python
# -*- coding: utf8 -*-
# @Time    : 2021/10/22 22:52
# @Author  : wxvirus
# @File    : search.py
# @Software: PyCharm
import time


def cal_time(func):
    """
    测试运行时间装饰器
    :param func:
    :return:
    """

    def wrapper(*args, **kwargs):
        t1 = time.time()
        result = func(*args, **kwargs)
        t2 = time.time()
        print("%s running time: %s secs." % (func.__name__, t2 - t1))
        return result

    return wrapper


@cal_time
def linear_search(li, val):
    """线性查找"""
    for ind, v in enumerate(li):
        if v == val:
            return ind
    else:
        return None


@cal_time
def binary_search(li, val):
    """二分查找"""
    left = 0
    right = len(li) - 1

    while left <= right:
        # 候选区有值
        mid = (left + right) // 2  # 整除2
        if li[mid] == val:
            # 找到了
            return mid
        elif li[mid] > val:
            # 候选区在左边
            right = mid - 1
        else:
            # li[mid] < val
            left = mid + 1
    else:
        return None


li = list(range(1000000000))
linear_search(li, 3890000)
binary_search(li, 3890000)

```

结果

```bash
linear_search running time: 0.17320609092712402 secs.
binary_search running time: 0.0008141994476318359 secs.
```

二分查找比线性查找快的不止一丁半点了。是非常快！

:::warning

虽然二分查找比较快，但是有一个前提，是排好序的。如果是无序的且查找次数很少，排序之后进行二分查找，是非常不值得使用的，还不如使用线性查找

:::
