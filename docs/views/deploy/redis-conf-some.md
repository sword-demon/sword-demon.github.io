---
title: Redis 的配置
date: 2023-02-19 22:52:10
category: Deploy
tag:
    - redis
---

# Redis 的配置

## 配置文件

`Redis`支持很多的参数，但都有默认值

-   `daemonize`默认情况下，`redis`不是在后台运行的，如果需要在后台运行，把该项的值改为`yes`
-   `bind`指定`Redis`只接受来自于该 IP 地址的请求，学习阶段就默认设置为`0.0.0.0`，放到正式服务器上的时候就需要更改。
-   `port`监听端口，默认为 6379
-   `databases`设置数据库的个数，有 16 个，默认使用的数据库是 0
-   `save`设置`Redis`进行数据库镜像的频率，即是否进行数据持久化
-   `dbfilename`镜像备份文件的文件名
-   `dir`数据库镜像备份的文件存放的路径，持久化存储的位置
-   `requirepass`设置客户端连接后进行热虐其他指定前需要使用的密码
-   `maxclients`限制同时连接的客户端数
-   `maxmemory`设置`redis`能够使用的最大内存

## 客户端访问

可以使用几个客户端工具

-   redis-desktop-manager
-   Another-redis-desktop-manager
-   quickredis
-   等工具

---

-   安装完后去建立连接，会提示失败，原因是`redis`默认只能本地访问
-   修改配置文件`redis.conf`
-   注释掉`bind 127.0.0.1`可以使所有`ip`访问`redis`；也可以自己设置多个`ip`可以进行访问
-   修改后`kill -9 xxx`杀死`redis`进程，重启`redis`：重启命令：`systemctl restart redis.service`
-   再次连接就会成功
