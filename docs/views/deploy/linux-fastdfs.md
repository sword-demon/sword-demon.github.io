---
title: FastDFS
date: 2023-09-23 12:40:10
category: Deploy
tag:
    - fastdfs
    - linux
---

# 中小文件最流行的分布式文件服务-FastDFS

## 什么是 FastDFS

FastDFS 是用 C 语言编写的一款开源的轻量级分布式文件系统。它对文件进行管理，功能包括:文件存储、文件同步、文件访问(
文件上传、文件下载)等，解决了大容量存储和负载均衡的问题。特别适合以文件为载体的在线服务，如**相册**网站、**短视频**网站等等。
FastDFS 为互联网量身定制，充分考虑了冗余备份、负载均衡、线性扩容等机制，并注重高可用、高性
能等指标，使用 FastDFS 很容易搭建一套高性能的文件服务器集群提供文件上传、下载等服务。

## FastDFS 特性

-   分组存储，灵活简洁、对等结构，不存在单点
-   文件不分块存储，上传的文件和 OS 文件系统中的文件一一对应
-   文件 ID 由 FastDFS 生成，作为文件访问凭证，FastDFS 不需要传统的 name server
-   和流行的 web server 无缝衔接，FastDFS 已提供 apache 和 nginx 扩展模块
-   中、小文件均可以很好支持，支持海量小文件存储
-   支持多块磁盘，支持单盘数据恢复
-   支持相同内容的文件只保存一份，节约磁盘空间

-   支持在线扩容
-   支持主从文件 存储服务器上可以保存文件属性(meta-data)V2.0 网络通信采用 libevent，支持大并发访问，整 体性能更好
-   下载文件支持多线程方式，支持断点续传

## FastDFS 构成

FastDFS 由**客户端(Client)**、 **跟踪服务器(Tracker Server)**和**存储服务器(Storage Server)**构成。

### 客户端（Client）

FastDFS 的客户端使我们任意的连接调用的应用程序，一般指我们自己开发的应用程序。两者之间通过 TCP/IP 协议做数据交换。

FastDFS 的安装包也提供了一个上传指令，通过配置文件也可以达到上传、下载的作用。

### 跟踪服务器（Tracker Server）

Trackerserver 作用是负载均衡和调度。

通过 Tracker server 在文件上传时可以根据一些策略找到 Storage Server 提供文件上传服务。

### 存储服务器（Storage Server）

Storageserver 作用是文件存储，客户端上传的文件最终存储在 Storage 服务器上，Storage server 没有实现自己的文件系统而是利用操作系统的文件系统来管理文件。

## Linux 安装 FastDFS

### 软件包下载

### 软件安装

#### 安装依赖

```bash
yum install git gcc gcc-c++ make automake vim wget libevent unzip lrzsz -y
```

#### 安装 libfastcommon 基础库

上传、解压、安装基础库软件：

```bash
cd ~
mkdir fdfs
rz -y
unzip libfastcommon-master.zip
cd libfastcommon-master
sh make.sh clean && sh make.sh && sh make.sh install
```

#### 安装 FastDFS

上传、解压、安装软件：

```bash
cd ~/fdfs
unzip fastdfs-master.zip
cd fastdfs-master
sh make.sh clean && sh make.sh && sh make.sh install
```

拷贝配置文件：

```bash
cp /etc/fdfs/tracker.conf.sample /etc/fdfs/tracker.conf
cp /etc/fdfs/storage.conf.sample /etc/fdfs/storage.conf
cp /etc/fdfs/client.conf.sample /etc/fdfs/client.conf
cp /root/fdfs/fastdfs-master/conf/http.conf /etc/fdfs
cp /root/fdfs/fastdfs-master/conf/mime.types /etc/fdfs
```

修改配置文件：

```bash
vim /etc/fdfs/tracker.conf
#需要修改的内容如下
port=22122
base_path=/home/fastdfs
```

```bash
vim /etc/fdfs/storage.conf
#需要修改的内容如下
port=23000
base_path=/home/fastdfs
store_path0=/home/fastdfs
tracker_server=172.26.107.191:22122
```

```bash
vim /etc/fdfs/client.conf
#需要修改的内容如下
base_path=/home/fastdfs
tracker_server=172.26.107.191:22122
```

#### 启动服务

```bash
mkdir /home/fastdfs -p
/usr/bin/fdfs_trackerd /etc/fdfs/tracker.conf restart
/usr/bin/fdfs_storaged /etc/fdfs/storage.conf restart
netstat -ntlp
```

#### 测试服务

```bash
/usr/bin/fdfs_upload_file /etc/fdfs/client.conf /root/fdfs/fastdfs-master/COPYING-3_0.txt
```
