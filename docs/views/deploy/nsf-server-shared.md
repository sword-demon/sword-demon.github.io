---
title: 部署 nsf 服务进行跨主机文件共享
date: 2023-02-19 22:52:10
category: Deploy
tag:
    - nsf
---

# 部署 nsf 服务进行跨主机文件共享

## 主机安装

1.  安装

```bash
sudo yum -y install nfs-utils
```

2.  配置

    ```bash
    sudo vim /etc/sysconfig/nfs
    ```

    ```
    LOCKD_TCPPORT=30001 # TCP 锁使用端口
    LOCKD_UDPPORT=30002 # udp 锁使用端口
    MOUNTD_PORT=30003 # 挂载使用端口
    STATD_PORT=30004 # 状态使用端口
    ```

3.  启动、重启服务

    ```bash
    sudo systemctl restart rpcbind.service
    sudo systemctl restart nfs-server.service
    ```

4.  配置开机启动

    ```bash
    sudo systemctl enable rpcbind.service
    sudo systemctl enable nfs-server.service
    ```

## 编辑共享目录

在`home`用户目录下新建一个`goapi`或者叫别的名字的目录

```bash
sudo vim /etc/exports
```

写入以下内容

```
/home/wxvirus/goapi 内网网段/24(rw,async)
```

查看挂载的点是否有

```bash
showmount -e localhost
```

> 会发现没有

于是需要重启`nfs`服务

```bash
sudo systemctl restart nfs-server.service
```

然后再次查看挂载就会有了。

## 来到另外一台服务器上

也需要安装一下

```bash
sudo yum -y install nfs-utils
```

这样就好了，不需要重启`nfs`服务

直接执行

```bash
showmount -e 上一台主机内网 ip
```

尝试进行挂载

```bash
mount -t nfs 主机1内网 ip:/home/wxvirus/goapi /home/wxvirus/goapi
```

```bash
[root@k8s-node1 wxvirus]# mkdir goapi
[root@k8s-node1 wxvirus]# cd ~
[root@k8s-node1 ~]# mount -t nfs 主机1内网 ip:/home/wxvirus/goapi /home/wxvirus/goapi
[root@k8s-node1 ~]# cd /home/wxvirus/goapi/
[root@k8s-node1 goapi]# ls
test.txt
[root@k8s-node1 goapi]# cat test.txt
abc
```

然后我们再回到上一个服务器，修改`test.txt`内容

```bash
[root@k8s-master1 goapi]# echo "bcd" >> test.txt
[root@k8s-master1 goapi]# cat test.txt
abc
bcd
```

```bash
[root@k8s-node1 goapi]# cat test.txt
abc
bcd
```

就完成了同步文件。

## 卸载

回到根目录

```bash
sudo unmount /home/wxvirus/goapi

# 查看
df -h
```
