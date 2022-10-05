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

## redis 数据类型

-   String 字符串：底层是`Int` 简单动态字符串`sds`
-   Hash 哈希：底层是`ZipList Hashtable`
-   List 列表：底层为`Ziplist quicklist`双向循环链表
-   Set 集合：底层为`intset hashtable`
-   Zset 有序集合：底层为`Ziplist skiplist 跳表`

### String 字符串

> Redis 自己构建了一个简单动态字符串：`sds`
>
> `sds`内部又可以转换为`int、embstr、raw`

```bash
127.0.0.1:6379>set a 1
ok
127.0.0.1:6379>type a
string
127.0.0.1:6379>object encoding a
"int"
127.0.0.1:6379>set b abc
ok
127.0.0.1:6379>type b
string
127.0.0.1:6379>object encoding b
"embstr"
127.0.0.1:6379>set c aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasdasdsdsdasdasdsaddqwdqwdqwdwqdqwwqwqdqwqdwsadasdasdasdsa
127.0.0.1:6379>type c
string
127.0.0.1:6379>object encoding c
"raw"
```

-   值为`int`的时候内部编码就是`int`
-   值小于等于 44 字节的时候为`embstr`
-   大于 44 字节的时候为`raw`

`embstr`：存储结构是一块连续的内存空间，请求一次就行了

`raw`：是不连续的内存空间，是需要请求 2 次

![struct](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/20221005082518.png)

---

```c
struct sdshdr {
    unsigned int len; // buf 中已经使用的长度
    unsigned int free; // buf 中未使用的长度
    char buf[]; // 柔性数组 buf
};
```

设计原因：

-   效率，它单独保存了使用的长度，直接使用即可，复杂度为`O(1)`
-   防止数据溢出，SDS 是二进制安全的，通过`len`来判断是否结尾，来进行扩充然后再来进行修改，不会像 string 一样判断`\0`是否为结尾
-   空间预分配，会先先查未使用的空间，满足就直接使用，不满足就再去扩充空间，可以有效减少内存分配的次数
-   惰性空间释放，字符串缩短时，并不会立即回收多余的空间，防止当重新修改时再进行预分配，就增加了内存分配的次数

查看源码：

`sds.h`和`sds.c`文件

`reids`在 3 版本后面进行了修改

文件地址[https://github.com/redis/redis/blob/unstable/src/sds.h](https://github.com/redis/redis/blob/unstable/src/sds.h)

```c
typedef char *sds;

/* Note: sdshdr5 is never used, we just access the flags byte directly.
 * However is here to document the layout of type 5 SDS strings. */
struct __attribute__ ((__packed__)) sdshdr5 {
    unsigned char flags; /* 3 lsb of type, and 5 msb of string length 第三位保存头部类型，高5位代表保存字符串的长度 */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len; /* used 已存储的字符串长度 */
    uint8_t alloc; /* excluding the header and null terminator 能存储的字符串的最大容量 */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[]; // 存储字符串的数组
};
struct __attribute__ ((__packed__)) sdshdr16 {
    uint16_t len; /* used */
    uint16_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr32 {
    uint32_t len; /* used */
    uint32_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr64 {
    uint64_t len; /* used */
    uint64_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
```

设计根本：针对不同大小的数据保存为不同的类型，为了节省内存空间。

源码地址：[https://github.com/redis/redis/blob/unstable/src/sds.c](https://github.com/redis/redis/blob/unstable/src/sds.c)

redis 会对字符串长度进行判断，根据长度的不同选择不同的结构，其中`embstr`对应的就是`SDS_TYPE_8`，而`raw`则代表其他更大的数据类型。

```c
static inline char sdsReqType(size_t string_size) {
    if (string_size < 1<<5)
        return SDS_TYPE_5;
    if (string_size < 1<<8)
        return SDS_TYPE_8;
    if (string_size < 1<<16)
        return SDS_TYPE_16;
#if (LONG_MAX == LLONG_MAX)
    if (string_size < 1ll<<32)
        return SDS_TYPE_32;
    return SDS_TYPE_64;
#else
    return SDS_TYPE_32;
#endif
}
```
