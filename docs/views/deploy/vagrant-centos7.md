---
title: vagrant创建centos7虚拟机
date: 2022-06-19 23:35:10
catgory: Deploy
tag:
    - vagrant
    - centos7
---

## 前提是必须下好 `virtual box`

## 下载安装 vagrant

-   vagrant 官方镜像仓库网址：[https://app.vagrantup.com/boxes/search](https://app.vagrantup.com/boxes/search)
-   vagrant 下载：[https://www.vagrantup.com/downloads.html](https://www.vagrantup.com/downloads.html)

## 虚拟网络设置

-   打开`windows cmd`窗口，运行`vagrant init centos/7`即可初始化一个 centos7 系统

-   运行`vagrant up`即可启动虚拟机。系统`root`用户密码是`vagrant`

-   `vagrant`其他常用的命令：

    -   `vagrant ssh`：自动使用`vagrant`用户连接虚拟机
    -   `vagrant upload source [destination][name][id]`：上传文件

-   默认虚拟机的`ip`地址不是固定`ip`，开发不方便

    -   修改`Vagrantfile`
    -   打开本地的`cmd`输入`ipconfig`查看本机`ip`
    -   修改该文件中的内容：

    config.vm.network "private network", ip: "192.168.3.10"

-   最后修改完成，`vagrant reload`，然后再次连接即可

-   在`centos`中输如`ip addr`查看`ip`是否一致。
