---
title: Python 线程
description: Python 线程学习
date: 2026-05-09 20:37:01
---

## 思维导图

<PreviewMarkmapPath />

## 学习

- 线程是计算机可被`cpu`调度的最小单元
- 进程是计算机分配资源的最小单元，进程可以为线程提供运行资源

一个进程中可以有多个线程，同一个进程中的线程可以共享当前进程中的资源。

## 同步运行案例代码

```python
import time


def work_1():
    print('任务 1。。。')
    time.sleep(2)


def work_2():
    print('任务 2。。。')
    time.sleep(2)


if __name__ == '__main__':
    # 单线程同步程序
    work_1()
    work_2()
```

## 并发执行的案例代码

```python
import time
import threading


def work_1():
    print('任务 1。。。')
    time.sleep(2)


def work_2():
    print('任务 2。。。')
    time.sleep(2)


# 创建线程对象
# target 传递的是一个函数的引用，不能加括号
t1 = threading.Thread(target=work_1)
t2 = threading.Thread(target=work_2)

# 启动线程对象
t1.start()
t2.start()

"""
以上代码为并发任务
特点：不用等待第一个任务的返回结果，直接执行第二个任务
"""
```

---

- `threading`: 是`python`的内置的一个线程标准库
- `py`文件没有被计算机运行时是一个程序,是一个文件
- 进程是被计算机运行的程序

---

- `windows`系统中常见的任务管理器
- `macos`系统里常见的是活动监视器

> 进程比程序多了资源
