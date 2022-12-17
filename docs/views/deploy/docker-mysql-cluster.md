---
title: Docker部署MySQL集群
date: 2022-12-17 22:05:10
category: Deploy
tag:
    - docker
    - mysql
---

# Docker 部署 MySQL 集群

## 拉取镜像

```bash
docker pull mysql:8.0.23
```

## 设置开放端口

通常都是 3306 的，我们如果设置集群，就可以随意一点，比如五个节点，分别为

-   12001
-   12002
-   12003
-   12004
-   12005

## 创建 5 个 MySQL 节点

为了给 Docker 中容器分配固定的 Docker 内网 IP 地址，而且还跟其他的现在有的容器 IP 不冲突，创建一个新的 Docker 内网的网段，网络名称随意，网段是`172.17.0.X`，**注意：172.17.0.1 是网关的 IP，不能使用。**

```bash
docker network create --subnet=172.18.0.0/18 mynet
```

创建容器

`lower_case_table_names`：不区分表名大小写

```bash
docker run -it -d --name mysql_1 -p 12001:3306 \
--net mynet --ip 172.18.0.2 \
-m 400m -v /root/mysql_1/data:/var/lib/mysql \
-v /root/mysql_1/config:/etc/mysql/conf.d \
-e MYSQL_ROOT_PASSWORD=abc123456 \
-e TZ=Asia/Shanghai --privileged=true \
mysql:8.0.23 \
--lower_case_table_names=1
```

等个间隔 10s 再执行下一次的

```bash
docker run -it -d --name mysql_2 -p 12002:3306 \
--net mynet --ip 172.18.0.3 \
-m 400m -v /root/mysql_2/data:/var/lib/mysql \
-v /root/mysql_2/config:/etc/mysql/conf.d \
-e MYSQL_ROOT_PASSWORD=abc123456 \
-e TZ=Asia/Shanghai --privileged=true \
mysql:8.0.23 \
--lower_case_table_names=1
```

```bash
docker run -it -d --name mysql_3 -p 12003:3306 \
--net mynet --ip 172.18.0.4 \
-m 400m -v /root/mysql_3/data:/var/lib/mysql \
-v /root/mysql_3/config:/etc/mysql/conf.d \
-e MYSQL_ROOT_PASSWORD=abc123456 \
-e TZ=Asia/Shanghai --privileged=true \
mysql:8.0.23 \
--lower_case_table_names=1
```

```bash
docker run -it -d --name mysql_4 -p 12004:3306 \
--net mynet --ip 172.18.0.5 \
-m 400m -v /root/mysql_4/data:/var/lib/mysql \
-v /root/mysql_4/config:/etc/mysql/conf.d \
-e MYSQL_ROOT_PASSWORD=abc123456 \
-e TZ=Asia/Shanghai --privileged=true \
mysql:8.0.23 \
--lower_case_table_names=1
```

最好间隔个 10s 再执行下一次，否则容易出现崩溃问题。

第五个容器给事务中间件使用，并不存储业务数据

```bash
docker run -it -d --name mysql_5 -p 12005:3306 \
--net mynet --ip 172.18.0.6 \
-m 400m -v /root/mysql_5/data:/var/lib/mysql \
-v /root/mysql_5/config:/etc/mysql/conf.d \
-e MYSQL_ROOT_PASSWORD=abc123456 \
-e TZ=Asia/Shanghai --privileged=true \
mysql:8.0.23 \
--lower_case_table_names=1
```

:::danger 踩坑

```bash
2020-08-10T08:24:49.653807Z 0 [System] [MY-013169] [Server] /usr/sbin/mysqld (mysqld 8.0.21) initializing of server in progress as process 44
2020-08-10T08:24:49.664010Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2020-08-10T08:24:52.877117Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2020-08-10T08:24:57.629900Z 6 [Warning] [MY-010453] [Server] root@localhost is created with an empty password ! Please consider switching off the --initialize-insecure option.
2020-08-10T08:25:03.057763Z 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.21) starting as process 91
2020-08-10T08:25:03.106631Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2020-08-10T08:25:04.594295Z 0 [ERROR] [MY-011065] [Server] Unable to determine if daemon is running: Inappropriate ioctl for device (rc=0).
2020-08-10T08:25:04.594313Z 0 [ERROR] [MY-010946] [Server] Failed to start mysqld daemon. Check mysqld error log.
2020-08-10 08:25:04+00:00 [ERROR] [Entrypoint]: Unable to start server.
```

原因是 300m 不够大，又把`mysql_5`的容量加上去了。

:::

最后测试

![image-20221217205245292](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221217205245292.png)
