---
title: java运行机制
date: 2026-08-26 15:03:01
categories:
  - Java
tags:
  - java
  - jvm
---

# Java 程序的运行机制

Java 和 C 不一样：源码不会直接变成机器码可执行文件，而是先编译成与平台无关的字节码，再交给 JVM 加载、链接、初始化，最后由执行引擎跑起来。

> 一句话：`.java` → `javac` → `.class` → JVM（加载 / 链接 / 初始化）→ 解释执行 + JIT → 结束退出。

## 运行机制流程图

```mermaid
flowchart TB
    %% 源码编写：程序员产出 .java 文件
    A["编写 Hello.java"] --> B["javac 编译"]
    %% javac 把源码翻译成平台无关的字节码
    B --> C["生成 Hello.class 字节码"]
    %% java 命令拉起 JVM 进程
    C --> D["java Hello 启动 JVM"]

    %% 类加载阶段：按双亲委派把字节码读进内存
    D --> E["类加载器 ClassLoader"]
    E --> E1["Bootstrap 引导类加载器"]
    E --> E2["Platform 平台类加载器"]
    E --> E3["App 应用类加载器"]
    E1 --> F["加载 Loading：读字节码，生成 Class 对象"]
    E2 --> F
    E3 --> F

    %% 链接阶段：验证、准备、解析
    F --> G["链接 Linking"]
    G --> G1["验证 Verify：格式 / 语义 / 字节码合法"]
    G --> G2["准备 Prepare：为静态变量分配内存并赋默认值"]
    G --> G3["解析 Resolve：符号引用转直接引用"]
    G1 --> H["初始化 Initialization"]
    G2 --> H
    G3 --> H

    %% 初始化后找到入口，创建主线程开始跑
    H --> I["执行 clinit：静态变量赋值 + static 块"]
    I --> J["定位 public static void main"]
    J --> K["创建主线程，进入执行引擎"]

    %% 执行引擎：解释器跑冷代码，JIT 编译热点
    K --> L{"是否热点代码？"}
    L -->|否| M["解释器逐条解释字节码"]
    L -->|是| N["JIT 编译成本地机器码"]
    M --> O["CPU 真正执行指令"]
    N --> O

    %% 运行时数据区配合执行
    O --> P["读写运行时数据区"]
    P --> P1["程序计数器 PC"]
    P --> P2["Java 虚拟机栈"]
    P --> P3["本地方法栈"]
    P --> P4["堆 Heap：对象实例"]
    P --> P5["方法区 / 元空间：类元数据"]
    P4 --> Q["GC 回收不可达对象"]

    %% 主线程结束则 JVM 退出
    O --> R{"主线程是否结束？"}
    R -->|否| L
    R -->|是| S["JVM 卸载类、释放内存并退出"]
```

## 和 C 程序对比

| 阶段     | C                                   | Java                       |
| -------- | ----------------------------------- | -------------------------- |
| 编译产物 | 机器码可执行文件                    | `.class` 字节码            |
| 谁来执行 | 操作系统直接加载                    | 必须先启动 JVM             |
| 跨平台   | 换平台要重新编译                    | 同一份字节码，换 JVM 即可  |
| 内存     | 进程自己的代码段 / 数据段 / 堆 / 栈 | JVM 再切出堆、栈、方法区等 |

## 三个必须记住的点

1. **编译一次，到处运行**：`javac` 只负责产出字节码，真正跑起来靠各平台自己的 JVM。
2. **类不是一下子就能用**：必须经过加载 → 链接（验证 / 准备 / 解析）→ 初始化，才能执行 `main`。
3. **执行不是纯解释**：冷代码走解释器，热点代码会被 JIT 编译成本地机器码，所以 Java 后期性能可以接近 C。

## JVM、JRE 和 JDK

**JVM (Java Virtual Machine)** Java 虚拟机，用于执行 `bytecode`字节码的虚拟计算机。

不同的操作系统有不同的版本JVM，屏蔽了底层运行平台的差别，是实现**跨平台**的核心。

**JRE**(Java Runtime Environment)包含：Java 虚拟机、库函数

Java Development Kit （JDK）包含 JRE ，编译器和调试器等。

> 如果只是要运行 java 程序或者玩 Minecraft 这样的 Java 游戏，只需要 JRE 即可。

## 收费的问题

自 2019 年后，JDK8 后续更新的版本就开始收费了，但是，主要针对的是企业用户，对于个人学习者没有影响。

由于 Java 虚拟机的规范是开放的，任何人都可以去实现它。常见的 JDK 有如下几种

1. oracle JDK
2. open JDK
3. IBM、亚马逊等大公司有自己的 JDK

> 十万行代码 = 三十万年薪

## 第一个代码

```java
public class Welcome {
  public static void main(String args[]) {
    System.out.println("hello world");
  }
}
```

```bash
javac Welcome.java

java Welcome
hello world

```

1. Java 对大小写敏感
2. 关键字`class`的意思是类。Java 是面向对象的语言，所有的代码都必须位于类里面
3. 源文件编译后，得到相应的字节码文件`.class`文件，编译器为每个类生成独立的字节码文件
4. `main`方法是 java 应用程序的入口方法，格式固定：`public static void main(String args[]){...}`。
5. 一个源文件可以包含多个类。
6. 每个语句必须以分号结束，回车不是语句的结束标志，所以一个语句可以跨多行。
7. 编程时，注意缩进规范。
8. 在写括号、引号时，一定是成对编写，然后再往里面插入内容。

## 常用的 DOS 命令

磁盘操作系统缩写，是早期个人计算机上的一类操作系统

常用命令

1. `cd 目录路径`，进入一个目录
2. `cd ..`，进入父目录
3. `dir`查看本目录下的文件和子目录列表
4. `cls`清屏
5. `上下键`查找敲过的命令
6. `tab`自动补齐命令
