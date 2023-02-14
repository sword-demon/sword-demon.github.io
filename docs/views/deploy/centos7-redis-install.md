---
title: Redis 安装
date: 2023-02-14 22:44:10
category: Deploy
tag:
    - redis
    - gcc
---

# Redis 安装

## 下载安装包

下载地址：[https://redis.io/download](https://redis.io.download)，一般下载稳定版(Stable)

```bash
yum install -y wget
```

```bash
wget -P /usr/local/src/ https://download.redis.io/releases/redis-6.0.17.tar.gz
```

## 安装 C 语言依赖

```bash
yum install -y gcc-c++ autoconf automake
```

:::tip
在编译`Redis6`之前需要升级`gcc`的版本，默认`yum`安装的`gcc`版本是`4.8.5`，由于版本过低，在编译时会报错，我们需要升级`gcc`
:::

```bash
# 安装 scl 源
yum install -y centos-release-scl scl-utils-build
# 安装 9 版本的 gcc、gcc-c++ gdb工具链
yum install -y devtoolset-9-toolchain
# 临时覆盖系统原因的 gcc 引用
scl enable devtoolset-9 bash
# 查看 gcc 的版本
gcc -v
```

```bash
[root@VM-16-4-centos redis-6.0.17]# gcc -v
Using built-in specs.
COLLECT_GCC=gcc
COLLECT_LTO_WRAPPER=/opt/rh/devtoolset-9/root/usr/libexec/gcc/x86_64-redhat-linux/9/lto-wrapper
Target: x86_64-redhat-linux
Configured with: ../configure --enable-bootstrap --enable-languages=c,c++,fortran,lto --prefix=/opt/rh/devtoolset-9/root/usr --mandir=/opt/rh/devtoolset-9/root/usr/share/man --infodir=/opt/rh/devtoolset-9/root/usr/share/info --with-bugurl=http://bugzilla.redhat.com/bugzilla --enable-shared --enable-threads=posix --enable-checking=release --enable-multilib --with-system-zlib --enable-__cxa_atexit --disable-libunwind-exceptions --enable-gnu-unique-object --enable-linker-build-id --with-gcc-major-version-only --with-linker-hash-style=gnu --with-default-libstdcxx-abi=gcc4-compatible --enable-plugin --enable-initfini-array --with-isl=/builddir/build/BUILD/gcc-9.3.1-20200408/obj-x86_64-redhat-linux/isl-install --disable-libmpx --enable-gnu-indirect-function --with-tune=generic --with-arch_32=x86-64 --build=x86_64-redhat-linux
Thread model: posix
gcc version 9.3.1 20200408 (Red Hat 9.3.1-2) (GCC)
```

## 解压

```bash
tar -zxvf redis-6.0.17.tar.gz
```

## 编译安装

```bash
cd redis-6.0.17
make
```

![image-20230214221720589](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230214221720589.png)

传统方式下面就是`make install`，但是呢这样会执行默认安装，我们以后找对应的东西都是四散而开的，就和`windows`下默认安装到 C 盘一样的；我们可以自己定义目录存储

```bash
mkdir -p /usr/local/redis
make PREFIX=/usr/local/redis/ install

# 执行效果
cd src && make install
make[1]: 进入目录“/usr/local/src/redis-6.0.17/src”

Hint: It's a good idea to run 'make test' ;)

    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
    INSTALL install
make[1]: 离开目录“/usr/local/src/redis-6.0.17/src”
```

查看目录内容

```bash
[root@VM-16-4-centos bin]# ll
总用量 38208
-rwxr-xr-x 1 root root 4746312 2月  14 22:22 redis-benchmark
-rwxr-xr-x 1 root root 9765104 2月  14 22:22 redis-check-aof
-rwxr-xr-x 1 root root 9765104 2月  14 22:22 redis-check-rdb
-rwxr-xr-x 1 root root 5069752 2月  14 22:22 redis-cli
lrwxrwxrwx 1 root root      12 2月  14 22:22 redis-sentinel -> redis-server
-rwxr-xr-x 1 root root 9765104 2月  14 22:22 redis-server
[root@VM-16-4-centos bin]# pwd
/usr/local/redis/bin
```

安装成功后的几个文件解释

-   `redis-benchmark` 性能测试工具
-   `redis-check-aof` AOF 文件修复工具
-   `redis-check-rdb` RDB 文件修复工具
-   `redis-cli` 客户端命令行
-   `redis-sentinal` 集群管理工具
-   `redis-server` 服务进程指令

---

启动`redis-server`

```bash
./redis-server
```

![image-20230214222405130](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230214222405130.png)

这样运行我们就不能离开终端了，所以我们还需配置守护运行

我们进入`redis`源码目录中，拷贝一份`redis.conf`到我们安装的目录中

```bash
[root@VM-16-4-centos redis-6.0.17]# cp redis.conf /usr/local/redis/bin/
```

```bash
vim redis.conf
```

:::note
找到`daemonize no`改成`daemonize yes`让它以守护进程的方式启动，我们再次启动的时候需要加上对应的配置文件。
:::

```bash
./redis-server ./redis.conf
```

```bash
[root@VM-16-4-centos bin]# ./redis-server ./redis.conf
[root@VM-16-4-centos bin]# ps -ef | grep redis
root     25910     1  0 22:30 ?        00:00:00 ./redis-server 127.0.0.1:6379
root     25950 22234  0 22:30 pts/0    00:00:00 grep --color=auto redis
```

可以使用`kill`命令进行关闭进程

## 配置开启自启(centos7 以上)

在系统服务目录中创建`redis.service`文件

```bash
vim /etc/systemd/system/redis.service
```

写入以下内容

```bash
[Unit]
Description=redis-server
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/redis/bin/redis-server /usr/local/redis/bin/redis.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

:::tip
配置描述：

> Description:描述服务
> After:描述服务类别
> [Service]服务运行参数的设置
> Type=forking 是后台运行的形式
> ExecStart 为服务的具体运行命令
> ExecReload 为重启命令
> ExecStop 为停止命令
> PrivateTmp=True 表示给服务分配独立的临时空间

:::

:::danger
**注意：[Service]的启动和重启以及停止命令全部都要求使用绝对路径**

配置完之后需要重启系统服务：`systemctl daemon-reload`
:::

---

测试并加入开机自启

-   关闭`redis-server`: `systemctl stop redis.service`
-   开启`redis-server`: `systemctl start redis.service`
-   查看`redis-server状态`: `systemctl status redis.service`

测试成功，将服务加入开机自启

```bash
systemctl enable redis.service
```

最后测试查看

```bash
[root@VM-16-4-centos ~]# systemctl start redis.service
[root@VM-16-4-centos ~]# ps -ef | grep redis
root     29176     1  0 22:42 ?        00:00:00 /usr/local/redis/bin/redis-server 127.0.0.1:6379
root     29204 22234  0 22:42 pts/0    00:00:00 grep --color=auto redis
```
