# redis

![redisepoll](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/20220928222928.png)

> `redis`是单线程的，一堆客户端的链接都是先到内核的，`redis`和内核之间使用`epoll`，也就是非阻塞的 IO 多路复用，`redis`就可以用一个线程使用`epoll`遍历很多客户端连接，哪个客户端有数据就来处理谁，左边是 IO 操作，右边是内存操作，内存操作的速度是远大于 IO 的操作的，所以`redis`线程对应很多连接是没有问题的。这里的处理的而且是`redis`的`worker`线程，`redis`还有别的线程去处理别的事情，比如持久化、异步删除等。

**基本数据结构**

```c
typedef struct redisObject {
    unsigned type:4;
    unsigned encoding:4;
    unsigned lru:LRU_BITS;

    int refcount;
    void *ptr;
} robj;
```

-   `type`：对外的数据类型，`string、hash、list、set、zset`，通过`type`命令看到的类型
-   `encoding`内部实际保存类型数据类型，很重要，例如`list`其实分为`ziplist quicklist`
-   `lru`缓存淘汰机制时使用
-   `refcount`：引用计数，主要用于内存回收
-   `ptr`：指向真实的数据存储
