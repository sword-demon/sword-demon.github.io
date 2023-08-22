---
title: Redis的Java 客户端
date: 2023-08-22 23:20:10
category: Redis
tag:
    - client
---

# Redis 的 Java 客户端

## redis 客户端

redis 支持多种语言的客户端

`redis`可以通过自带的`redis-cli`进行连接

```bash
./redis-cli -h ip -p port -a 密码

# 案例
./redis-cli -h 192.168.0.100 -p 6379 -a 123456

# 退出
quit
```

如果就是连接的本机服务，以及端口没有改变，`-h`和`-p`都是可以省略的，最终就只需要输入密码即可，如果没有设置密码，那也不需要了，即：

```shell
./redis-cli -a 123456
```

### 常用命令

设置插入一条数据，默认插入`0`号库里

```shell
127.0.0.1:6379> set username zhangsan
```

通过`get`来获取数据

```shell
127.0.0.1:6379> get username
"zhangsan"
```

选择不同的库

```shell
127.0.0.1:6379> select 2
```

存入层级存储的数据用来替换关系数据库中“表”的概念: 设置某项目中用户主键为 1 的为“zhangsan”

```shell
127.0.0.1:6379> set xxx:users:1 zhangsan
```

获取的时候，怎么设置的就怎么获取，如果在桌面客户端里查看会有一个很明显的层级关系

```shell
127.0.0.1:6379> get xxx:users:1
"zhangsan"
```

查询当前所在的库有多少`key`

```shell
127.0.0.1:6379> keys *
```

`info`命令来查看一些信息，可以查看当前 CPU 使用率，或者查看主从模式和集群，也可以直接查看一个详细的`info`

```shell
127.0.0.1:6379> info [section]
```

**清除所有的`key`**，**注意：一般实际项目中谨慎使用**

```shell
127.0.0.1:6379> FLUSHALL
```

## java 客户端

[https://redis.io/resources/clients/#java](https://redis.io/resources/clients/#java)

比较受欢迎的是`Jedis`和`Lettuce`

-   `Jedis`在实现上是直接连接`redis server`，如果在多线程环境下是非线程安全的，这个时候只有使用连接池，为每个`Jedis`实例增加物理连接
-   `Lettuce`的连接是基于`Netty`的，连接实例可以在多个线程并发访问，因为`StatefulRdisConnection`是线程安全的，锁一个连接实例就可以满足多线程环境下的并发访问，这个也是可伸缩的设计，一个连接实例不够的情况下也可以按需增加实例连接。
-   在`SpringBoot Dta Redis 1.x`之前默认使用的是`Jedis`，但目前最新版的修改成了`Lettuce`
-   总得来说,`Jedis`性能会优于`Lettuce`，因为他是直接连接`redis server`的

### Jedis 客户端

[maven 库](https://mvnrepository.com/artifact/redis.clients/jedis)

> 使用`IDEA`创建一个简单的`maven`项目引入对应的`jedis`依赖
