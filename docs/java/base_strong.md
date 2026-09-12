---
title: 基础加强
date: 2026-07-21
---

# 基础加强

## 思维导图概览内容

<PreviewMarkmapPath />

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



## 布尔型(boolean)

1. boolean 类型有 2 个常量值，true 和 false
2. 在内存中占用一个字节【布尔数组】或 4 个字节【一般时候都是 4 个字节】，不可以使用 0 或非 0的整数替代 true 和 false，这点和 C 语言不一样

```java
public class TestBoolean {
  public static void main(String[] args) {
    boolean b1 = true;
    boolean b2 = false;
    
    if (b1) {
      System.out.println("b1是true!");
    } else {
      System.out.println("b1是false!");
    }
  }
}
```

> 尽量避免写`b1 == true`来判断，虽然是正确的，但是不推荐。



## 方法的重载

> 一个类中可以定义多个名称相同，但参数列表不同的方法。

构成方法重载的条件

1. 形参列表不同的含义
   1. 形参类型不同
   2. 形参个数不同
   3. 形参顺序不同
2. 只有返回值不同，不构成方法的重载
3. 只有形参的名称不同，不构成方法的重载



## static

**静态变量/静态方法生命周期和类相同，在整个程序执行期间都有效。**

- 为该类的公共变量，属于类，被该类的所有实例共享，在类载入的时候被初始化
- `static`成员变量只有一份
- 一般用“类名.类变量/方法” 来调用
- 在`static`方法中不可直接访问非`static`的成员
