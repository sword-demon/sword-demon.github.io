---
title: ThreadLocal 介绍
date: 2026-05-16 11:10:10
description: 用大白话讲清楚 ThreadLocal 是什么、怎么用、以及内存泄漏问题
top: true
sidebarSort: 2
---

# ThreadLocal 介绍

## 思维导图

<PreviewMarkmapPath />

## 一句话理解

`ThreadLocal` 就像**每个线程的专属储物柜**——同一个变量名，每个线程拿到的值互不相同，互不干扰。

## 生活类比

想象公司有一排公共储物柜（`ThreadLocal`），每个员工（线程）都有自己的格子：

- 张三打开 3 号柜 → 拿出自己的手机
- 李四打开 3 号柜 → 拿出自己的钱包

**同一个柜号，每个人存的东西不一样**，这就是 `ThreadLocal` 的核心思想。

## 代码里长什么样

```java
// 创建一个 ThreadLocal 变量
private static final ThreadLocal<String> userIdHolder = new ThreadLocal<>();

// 线程 A 存值
userIdHolder.set("user_1001");

// 线程 B 存值（同一个变量！）
userIdHolder.set("user_2002");

// 线程 A 取值 → "user_1001"
// 线程 B 取值 → "user_2002"
```

## 在登录鉴权里的实际用途

在 Web 项目中，常用流程是这样的：

1. 用户请求进来，过滤器从 Cookie 中解析出 `token`
2. 查 Redis 拿到 `userId`
3. 把 `userId` 塞进 `ThreadLocal`
4. **后面任何代码**想获取当前登录用户，直接 `SessionHelper.getUserId()` 即可
5. 请求结束，在 `finally` 里 `remove()` 清理

```java
// 过滤器里设置
try {
    String userId = redis.get(token);
    userIdHolder.set(userId);
    // 执行业务逻辑...
} finally {
    // 必须清理！否则线程复用时数据会串！
    userIdHolder.remove();
}
```

## 为什么要 `finally` 里清理？

### 原因一：线程复用导致数据串台

Web 服务器（如 Tomcat）使用**线程池**，一个线程处理完请求 A 后，会被分配给请求 B。

如果不清理：

- 请求 A：`userIdHolder.set("张三")`
- 请求 A 结束，没清理
- 请求 B 进来，线程复用，直接拿到 `"张三"` → **数据串台了！**

### 原因二：内存泄漏（重点）

`ThreadLocal` 内部是一个 `ThreadLocalMap`，结构类似这样：

```
ThreadLocalMap = {
    ThreadLocal对象(弱引用) → userId值(强引用)
}
```

| 引用类型 | 对象                 | 后果                           |
| -------- | -------------------- | ------------------------------ |
| 弱引用   | `ThreadLocal` 的 key | GC 时会被回收，key 变成 `null` |
| 强引用   | `userId` 的 value    | **永远不会被回收！**           |

key 变成 `null` 后，value 就成了**无人认领的垃圾**，线程一直活着，value 一直占内存，最终可能导致 **OOM**。

![ThreadLocal 内存泄漏：key 被回收，value 成孤儿](/webchat/assets/03-infographic-threadlocal-leak.png)

## 最佳实践

| 做法                     | 说明                                |
| ------------------------ | ----------------------------------- |
| ✅ 用完必 `remove()`     | 在 `finally` 块中清理，确保一定执行 |
| ✅ 定义为 `static final` | 节省内存，避免重复创建              |
| ❌ 不要存大对象          | 线程池长期持有，容易撑爆内存        |
| ❌ 不要跨线程传递        | `ThreadLocal` 只在当前线程有效      |

## 源码探秘：ThreadLocalMap 和 Entry

上面说了 `ThreadLocal` 内部是个 `ThreadLocalMap`，现在拆开看看它到底长什么样。

### 先记住一个关系图

```
Thread（线程）
  └── threadLocals（ThreadLocalMap 实例）
        ├── Entry[] table（数组，存数据的地方）
        │     ├── Entry（key=ThreadLocal 弱引用, value=你的值）
        │     ├── Entry
        │     └── ...
        └── size（当前存了多少个）
```

**一句话：每个线程自带一个「小仓库」（ThreadLocalMap），仓库里有一排格子（Entry 数组），每个格子里贴着标签（ThreadLocal）和存的货（value）。**

### Entry 是什么？

```java
// 简化版源码
static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;  // 你真正存的数据，比如 userId

    Entry(ThreadLocal<?> k, Object v) {
        super(k);     // 把 ThreadLocal 包装成弱引用
        value = v;    // 值是强引用
    }
}
```

| 概念                            | 大白话解释                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `WeakReference<ThreadLocal<?>>` | **弱引用标签** —— 只要外面没人用这个 `ThreadLocal` 了，GC 就可以直接把这个标签撕掉 |
| `Object value`                  | **强引用的货物** —— 就算标签没了，货还在，没人来清理就一直占着地方                 |
| `Entry`                         | 一个「标签+货物」的组合，放在仓库格子里                                            |

### 为什么 key 要用弱引用？

这是 JDK 设计者的**无奈之举**：

- **如果用强引用**：`Thread` → `ThreadLocalMap` → `Entry` → `ThreadLocal`，这条链全是强引用。就算你的代码里 `userIdHolder = null` 了，线程还活着，就永远回收不了。—— **100% 内存泄漏**
- **用弱引用**：`ThreadLocal` 只被 `Entry` 弱引用挂着，外面没人用的话 GC 就回收它，key 变成 `null`。至少给了清理的机会。

> 但注意：key 变成 `null` 后，value 还是强引用，**货还在**！这就是泄漏的根源。

### ThreadLocalMap 怎么存取？

#### set() 的过程

```java
// 伪代码，帮你理解流程
void set(ThreadLocal key, Object value) {
    Entry[] tab = table;
    int len = tab.length;

    // 1. 根据 ThreadLocal 的哈希值，算出在数组里的位置
    int i = key.threadLocalHashCode & (len - 1);

    // 2. 如果这个位置已经有 Entry 了
    for (Entry e = tab[i]; e != null; e = tab[i = nextIndex(i, len)]) {
        ThreadLocal<?> k = e.get();

        if (k == key) {
            // 2a. key 相同，直接覆盖 value
            e.value = value;
            return;
        }

        if (k == null) {
            // 2b. key 为 null（ThreadLocal 被 GC 了）
            // 替换这个「脏格子」，顺便清理附近的其他脏格子
            replaceStaleEntry(key, value, i);
            return;
        }
    }

    // 3. 找到空位，新建 Entry 放进去
    tab[i] = new Entry(key, value);
    size++;
}
```

**小白翻译：**

1. 根据标签的编号，找到仓库里对应的格子号
2. 格子有人？看看标签是不是同一个：
   - 是同一个 → 旧货扔掉，放新货
   - 标签已经烂了（`null`）→ 把烂标签连附近的烂标签一起清理，再放进去
3. 格子空着 → 直接新建一个「标签+货物」放进去

#### get() 的过程

```java
// 伪代码
Object get(ThreadLocal key) {
    Entry[] tab = table;
    int len = tab.length;

    // 1. 同样先算格子号
    int i = key.threadLocalHashCode & (len - 1);

    // 2. 顺着格子找
    for (Entry e = tab[i]; e != null; e = tab[i = nextIndex(i, len)]) {
        ThreadLocal<?> k = e.get();

        if (k == key) {
            // 找到了！返回货物
            return e.value;
        }

        if (k == null) {
            // 发现烂标签，顺手清理一下
            expungeStaleEntry(i);
        }
    }

    // 3. 没找到，返回 null
    return null;
}
```

**小白翻译：**

1. 按标签编号找到格子
2. 格子有东西？看看标签对不对：
   - 标签对 → 拿货走人
   - 标签烂了 → 喊人来清理（`expungeStaleEntry`），继续找下一个
3. 找了一圈没有 → 返回 null

### 那内存泄漏到底怎么解决？

JDK 其实做了**被动清理**：

| 触发时机                     | 做了什么                                                |
| ---------------------------- | ------------------------------------------------------- |
| `set()` 时遇到 `key == null` | 调用 `replaceStaleEntry`，清理附近的脏 Entry            |
| `get()` 时遇到 `key == null` | 调用 `expungeStaleEntry`，清理并重新排列数组            |
| `remove()` 时                | 直接找到对应 Entry，key 和 value 都置为 null，size 减 1 |

**但这些都是「被动」的！** 如果某个 `ThreadLocal` 用了一次后不再 `get/set`，那它的脏 Entry 就永远没人去碰，value 一直占着内存。

所以：**主动调用 `remove()` 才是最靠谱的！**

### 再画一张图帮你记住

```
线程池里的线程 Thread-1
├─ threadLocals（ThreadLocalMap）
│   ├─ Entry[0]: key=ThreadLocal@userIdHolder(弱引用), value="user_1001" ✅ 正常
│   ├─ Entry[1]: key=null(已被GC), value="user_2002" ❌ 内存泄漏！
│   └─ Entry[2]: key=ThreadLocal@tenantHolder(弱引用), value="tenant_A" ✅ 正常
│
└─ 线程一直活着（线程池复用）→ Entry[1] 的 value 永远无法回收
```

## 常见面试题

### Q1：ThreadLocal 和 synchronized 有什么区别？

| 对比项       | ThreadLocal                          | synchronized                             |
| ------------ | ------------------------------------ | ---------------------------------------- |
| 解决什么问题 | 线程间**数据隔离**                   | 线程间**数据共享**时的互斥               |
| 核心思想     | 每个线程各有一份副本，互不干扰       | 多个线程排队访问同一份数据               |
| 类比         | 每人一个独立储物柜                   | 大家共用一个卫生间，一次只能进一个       |
| 性能         | 无锁，性能高                         | 需要加锁，有上下文切换开销               |
| 适用场景     | 保存用户会话、数据库连接、请求上下文 | 计数器累加、库存扣减等需要原子操作的场景 |

**一句话：ThreadLocal 是「各玩各的」，synchronized 是「排队来」。**

---

### Q2：ThreadLocal 的 key 为什么要用弱引用？用强引用行不行？

**用强引用的问题：**

```
Thread（线程池复用，长期存活）
  └── ThreadLocalMap
        └── Entry
              ├── key（强引用 ThreadLocal）
              └── value（强引用 userId）
```

这条引用链全是强引用，即使你的代码里 `userIdHolder = null`，`ThreadLocal` 对象依然被 `Entry` 强引用着，**永远回收不了**。线程池里的线程又长期存活 → **100% 内存泄漏**。

**用弱引用的好处：**

```
Entry
  ├── key（弱引用 ThreadLocal）← 外面没强引用时，GC 直接回收
  └── value（强引用 userId）
```

`ThreadLocal` 只被弱引用挂着，外部引用一断，GC 就回收它，key 变成 `null`。虽然 value 还是泄漏，但至少给了清理的机会（`expungeStaleEntry`）。

> 这是 JDK 设计者的**折中方案**，不是完美方案，所以还是要手动 `remove()`。

---

### Q3：父子线程之间能共享 ThreadLocal 吗？

**默认不能。** `ThreadLocal` 只在当前线程有效，子线程创建时不会自动继承父线程的 `ThreadLocal`。

**如果确实需要共享，用 `InheritableThreadLocal`：**

```java
// 父线程设置
InheritableThreadLocal<String> inheritable = new InheritableThreadLocal<>();
inheritable.set("父线程的值");

// 子线程能直接拿到
new Thread(() -> {
    System.out.println(inheritable.get());  // 输出：父线程的值
}).start();
```

**原理：** 子线程创建时，会拷贝父线程的 `inheritableThreadLocals` 到自己的线程里。

**但要注意：** 线程池里的线程是复用的，子线程不会重新创建，`InheritableThreadLocal` 在线程池场景下会失效。这时候要用 **TransmittableThreadLocal**（阿里开源）。

---

### Q4：一个线程里可以创建多个 ThreadLocal 吗？会冲突吗？

**可以，不会冲突。**

每个 `ThreadLocal` 对象都有一个唯一的 `threadLocalHashCode`，就像每个人的身份证号。多个 `ThreadLocal` 放在同一个 `ThreadLocalMap` 里，靠这个哈希码区分：

```java
static final ThreadLocal<String> userId = new ThreadLocal<>();
static final ThreadLocal<String> tenantId = new ThreadLocal<>();

// 同一个线程里，两个互不影响
userId.set("1001");
tenantId.set("tenant_A");

userId.get();    // "1001"
tenantId.get();  // "tenant_A"
```

**类比：** 同一个仓库（ThreadLocalMap）里，不同货物贴不同标签（ThreadLocal），不会拿错。

---

### Q5：ThreadLocalMap 的哈希冲突怎么解决？

`ThreadLocalMap` 用的是**开放寻址法**（线性探测），不是链表。

```java
// 哈希定位
int i = key.threadLocalHashCode & (len - 1);

// 如果位置被占了，就往后找下一个空位
e = tab[i = nextIndex(i, len)];
```

**为什么不用链表？**

- `ThreadLocalMap` 的 Entry 数量通常很少（一个线程就几个 ThreadLocal）
- 开放寻址法在数据量小时，缓存友好，效率更高
- 节省指针开销，结构更简单

**类比：** 停车场找车位，发现 3 号位被占了，就看 4 号位，4 号位也占了就看 5 号位……直到找到空位。

---

### Q6：ThreadLocal 用完不 remove() 会有什么后果？

**场景一：数据串台（业务 bug）**

```java
// 请求 A：用户张三登录
userIdHolder.set("张三");
// ... 业务处理，忘了 remove

// 请求 B：线程复用，用户李四进来
// 过滤器没走到 set（比如某些接口免登录）
String userId = userIdHolder.get();  // 拿到 "张三"！串台了！
```

**场景二：内存泄漏（系统风险）**

```
线程池 100 个线程
每个线程的 ThreadLocalMap 里堆积 1000 个脏 Entry
每个 value 占用 1KB
= 100 × 1000 × 1KB = 100MB 泄漏内存
```

**正确写法：**

```java
try {
    userIdHolder.set(userId);
    // 执行业务...
} finally {
    userIdHolder.remove();  // 必须清理！
}
```

---

### Q7：Spring 的 @Transactional 事务和 ThreadLocal 有关系吗？

**有关系。** Spring 的事务管理器 `DataSourceTransactionManager` 内部用 `ThreadLocal` 来保存数据库连接：

```java
// 简化版源码
private static final ThreadLocal<Map<Object, Object>> resources =
    new NamedThreadLocal<>("Transactional resources");
```

**流程：**

1. 方法加上 `@Transactional`，Spring 开启事务
2. 从连接池拿一个 `Connection`，塞进 `ThreadLocal`
3. 同一个线程里，后续所有数据库操作都复用这个 `Connection`
4. 事务提交或回滚后，从 `ThreadLocal` 取出 `Connection` 归还连接池
5. **清理 `ThreadLocal`**

**如果事务没正确关闭（比如异常没处理），`Connection` 一直挂在 `ThreadLocal` 里，连接池很快就耗尽。**

---

### Q8：ThreadLocal 在哪些开源框架里用到了？

| 框架            | 用途                                                             |
| --------------- | ---------------------------------------------------------------- |
| **Spring**      | 事务管理（保存数据库连接）、请求上下文（`RequestContextHolder`） |
| **MyBatis**     | `SqlSession` 的线程隔离                                          |
| **Log4j/SLF4J** | `MDC`（Mapped Diagnostic Context），打印日志时带上 traceId       |
| **Dubbo**       | 隐式传参，`RpcContext` 用 ThreadLocal 存上下文                   |
| **Hystrix**     | 请求上下文传递                                                   |

**最经典的例子 —— MDC 打印 traceId：**

```java
// 过滤器里设置
MDC.put("traceId", UUID.randomUUID().toString());

// logback 配置里用 %X{traceId}
// 输出：[traceId=abc-123] 用户登录成功
```

一次请求的所有日志都带同一个 traceId，排查问题非常方便。

---

### Q9：ThreadLocalMap 的扩容机制了解吗？

`ThreadLocalMap` 的扩容条件比较特殊：

```java
// 扩容阈值：table 长度的 2/3
int threshold = len * 2 / 3;

// 但还有一个更严格的条件：
// 如果 Entry 数组里「脏 Entry」（key 为 null）的比例太高，会先清理而不是扩容
```

**流程：**

1. `size` 达到 `threshold` → 触发 `rehash()`
2. `rehash()` 先扫描一遍，清理所有脏 Entry（`key == null`）
3. 清理后 `size` 还超过 `threshold` 的 3/4 → 才真正扩容（数组长度 × 2）

**设计意图：** 优先清理垃圾，避免不必要的扩容，节省内存。

---

### Q10：如果让你设计一个 ThreadLocal，你会怎么做？

**核心思路：** 每个线程绑定一个独立的 Map，Key 是 ThreadLocal 本身，Value 是用户存的值。

```java
// 极简版实现
public class MyThreadLocal<T> {
    // 每个线程一个 Map
    private static final ThreadLocal<Map<MyThreadLocal<?>, Object>>
        holder = ThreadLocal.withInitial(HashMap::new);

    public void set(T value) {
        holder.get().put(this, value);
    }

    @SuppressWarnings("unchecked")
    public T get() {
        return (T) holder.get().get(this);
    }

    public void remove() {
        holder.get().remove(this);
    }
}
```

**JDK 实际更优的地方：**

| 我的极简版             | JDK 实际实现                                      |
| ---------------------- | ------------------------------------------------- |
| 每个线程一个 `HashMap` | 每个线程一个定制的 `ThreadLocalMap`，用数组更高效 |
| 用 `HashMap` 的哈希    | 用黄金分割数计算的哈希，分布更均匀                |
| 没处理内存泄漏         | `Entry` 用弱引用 + `expungeStaleEntry` 清理       |
| 直接扩容               | 先清理脏 Entry，再决定是否扩容                    |

## 总结

| 概念             | 一句话                                                     |
| ---------------- | ---------------------------------------------------------- |
| `ThreadLocal`    | 线程专属变量的「入口」                                     |
| `ThreadLocalMap` | 每个线程自带的「小仓库」                                   |
| `Entry`          | 仓库里的「格子」，包含弱引用标签 + 强引用货物              |
| 弱引用 key       | 让 GC 有机会回收 ThreadLocal，但 value 还是泄漏            |
| 内存泄漏根因     | key 被 GC 成 null，value 强引用还在，线程不死 value 不释放 |
| 解决方案         | **用完主动 `remove()`**，不要靠运气                        |
