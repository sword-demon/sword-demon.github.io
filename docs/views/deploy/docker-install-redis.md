---
title: Docker安装Redis
date: 2022-06-19 23:48:10
category: Deploy
tag:
    - docker
    - redis
---

## 下载安装 redis 镜像

首先切换到`root`用户，不然每次都要`sudo`

下载`redis`的最新镜像

```bash
docker pull redis
```

默认拉取`latest`版本

## 启动 redis 实例

> 运行 redis 实例并映射端口和挂载目录

```bash
docker run -p 6379:6379 --name redis -v /mydata/redis/data:/data \
-v /mydata/redis/conf/redis.conf:/etc/redis/redis.conf \
-d redis redis-server /etc/redis/redis.conf
```

:::tip 配置文件

启动`redis`容器读取该配置文件运行的时候，有时候，容器内部`/etc/redis`只会到这个目录，所以我们需要在本机创建出挂载目录里的对应`redis.conf`文件，以便于容器里也对应同步配置文件存在。

:::

```bash
mkdir -p /mydata/redis/conf
touch /mydata/redis/conf/redis.conf
```

:::danger 建议

**先创建文件，再去执行运行命令**

:::

## 测试使用

使用`docker`命令执行`redis-cli`

```bash
docker exec -it redis redis-cli
```

这样可以进入`redis-cli`的命令行

:::warning 持久化

这样进入`redis-cli`，`set`一个字符串之后，重启数据就会消失，所以我们还需要配置持久化。

:::

> 让`redis`启动`aof`的持久化方式

```bash
vim /mydata/redis/conf/redis.conf

# 找到 appendonly 默认为注释的

# 修改为如下内容
appendonly yes

# 最后进行保存退出
esc :wq
```

配置完毕之后，重启`redis`

```bash
docker restart redis
```

重新连接`redis-cli`测试数据。

## redis 的整个配置文件可以配置什么

[https://raw.githubusercontent.com/antirez/redis/4.0/redis.conf](https://raw.githubusercontent.com/antirez/redis/4.0/redis.conf)

## 配置自动启动

```bash
sudo docker update redis --restart=always
```
