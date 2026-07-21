---
title: 基础加强
date: 2026-07-21
---

# 基础加强

## 异常机制

**异常机制的本质**

> 当程序出现错误，程序安全的、继续执行的机制。

案例代码

```java
try {
  copyFile("d:/a.txt", "e:/a.txt")
} catch (Exception e) {
  e.printStackTrace();
}
```

### Exception 概念

所谓异常处理，就是指程序在出现问题时依然可以正确的执行完。

异常的分析

```java
public class Test {
  public static void main(String[] args) {
    System.out.println("111");
    int a = 1 / 0;
    System.out.println("222");
  }
}
```

```
Exception in thread "main" java.lang.ArithmeticException: / by zero  # 算数异常
```

当前代码只能执行到输出`"111"`，如果添加`try catch`，则能继续往前走，输出`"222"`

```java
public class Test {
  public static void main(String[] args) {
    System.out.println("111");
    try {
      int a = 1 / 0;
    } catch (Exception e) {
      e.printStackTrace();
    }
    System.out.println("222");
  }
}
```

**捕获异常：**JRE 得到该 异常之后，寻找相应的代码来处理该异常。JRE 在方法的调用栈中查找，从生成异常的方法开始回溯，直到找到相应的异常处理代码为止。

### 异常分类

所有的异常对象都是派生于`Throwable`类的一个实例。如果内置的异常类不能够满足需要，还可以创建自己的异常类。

所有的异常的根类是`java.lang.Throwable`，它下面又派生了 2 个子类：`Error`和`Exception`，我们通常只能管`Exception`。