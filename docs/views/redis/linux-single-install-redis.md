---
title: 单机安装redis
date: 2022-11-21 22:47:10
category: Redis
tag:
    - redis
---

# 单机安装 redis

:::info
以`centos7`系统为例
:::

## 安装 redis 依赖

`Redis`是基于 C 语言编写的，因此首先需要安装`Redis`所需要的`gcc`依赖

```bash
yum install -y gcc tcl
```

## 下载安装

如果是`windows`本机，去下载`.tar.gz`的去上传到`Linux`服务器上，或者虚拟机上；如果是直接在`Linux`里操作，可以使用`wget`去下载对应的包，下载完了解压即可；放到`/usr/local/src`目录。

> 解压命令

```bash
tar -zxvf redis-6.2.6.tar.gz

# 进入redis的安装目录 运行编译安装命令

cd redis-6.2.6

make && make install

## 等待一段时间
```

如果没有出错，应该就安装成功，默认的安装路径就在`/usr/local/bin`目录下，进入该目录，其中就会发现`redis-server`和`redis-cli`以及`redis-sentinel`

-   `redis-server`：是`redis`服务端的启动脚本
-   `redis-cli`：是`redis`提供的命令行客户端
-   `redis-sentinel`：是`redis`的哨兵启动脚本

## 启动

`redis`的启动方式有很多，比如：

-   默认启动
-   指定配置启动
-   开机自启

### 默认启动

安装完成之后，如果实在`/usr/local/bin`目录下，那可以在任意目录中使用`redis-server`等命令来启动

```bash
redis-server
```

![image-20221121222151667](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221121222151667.png)

这种启动属于`前台启动`，会阻塞整个会话窗口，窗口关闭或者按下`ctrl + c`就会停止`redis`，不推荐使用。

### 指定配置启动

如果要让`redis`以`后台`方式启动，则必须修改 `redis` 配置文件 ，就在安装目录下的`redis-6.2.6`下，名字叫`redis.conf`

我们在修改之前，先备份一份

```bash
cp redis.conf redis.conf.bak
```

然后修改`redis.conf`文件中的一些配置

```properties
# 监听的地址，默认是 127.0.0.1 会导致只能再本地访问，修改为0.0.0.0 可以在任意IP访问，生产环境不建议修改
bind 0.0.0.0
# 守护进程 修改为 yes 之后即可后台运行
daemonize yes
# 密码 设置后访问redis需要输入密码
requirepass 123456
```

其他常见配置

```properties
# 监听的端口
port 6379
# 工作目录 默认是当前目录 也就是运行redis-server时的命令，日志、持久化等文件都会保存到这个目录
dir .
# 数据库数量，设置为1，代表只使用一个库，默认有16个库，编号0~15
database 1
# 设置redis能够使用最大的内存
maxmemory 512mb
# 日志文件，默认为空，不记录日志，可以指定日志文件名
logfile "redis.log"
```

启动，进入当前目录执行命令

```bash
redis-server redis.conf
```

查看是否有进程启动

```bash
ps -ef | grep redis
501  8355     1   0 六12上午 ??  1:57.04 redis-server 0.0.0.1:6379
```

就可以看到有进程启动了

> 停止服务

可以使用`kill`命令找到刚才的进程 ID，杀死进程即可，或者可以使用`redis-cli`来执行`shutdown`命令

```bash
redis-cli -u 密码 shutdown
```

### 设置开机自启

首先新建一个系统服务文件

```bash
vim /etc/systemd/system/redis.service
```

```ini
[Unit]
Description=redis-server
After=network.target

[Service]
Type=foking
ExecStart=/usr/local/bin/redis-server /usr/local/src/redis-6.2.6/redis.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

保存之后让它生效，然后重载系统服务

```bash
systemctl daemon-reload
```

来启动`redis`服务

```bash
systemctl start redis
```

通过

```bash
systemctl status redis
```

来查看`redis`的启动状态。

通过`systemctl stop redis`停止服务，通过`systemctl restart redis`重启服务

通过

```bash
systemctl enable redis
```

来设置开机自启。

<BiliBili bvid="BV1cr4y1671t" />
