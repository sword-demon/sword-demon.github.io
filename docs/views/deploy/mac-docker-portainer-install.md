---
title: Portainer 的安装
date: 2023-02-05 16:12:10
category: Deploy
tag:
    - Portainer
---

# Portainer 的安装

官网：[https://www.portainer.io](https://www.portainer.io)

文档地址：[https://docs.portainer.io/v/ce-2.9/start/install/server/docker/linux](https://docs.portainer.io/v/ce-2.9/start/install/server/docker/linux)

## 安装运行

```bash
docker run -d -p 8000:8000 -p 9000:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer

```

如果本地有`php`，就会占据`9000`端口，需要另改一下映射端口。我本地有，所以改成

```bash
docker run -d -p 7678:8000 -p 9093:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v /Users/wangxin/soft/portainer/data:/data portainer/portainer
```

访问地址：本机`ip`加上端口`9093`，如果是上面的就是`9000`

然后设置用户名和密码即可登录

> 注意`-v`的`/var/run/docker.sock`是你本地运行的`docker`的`sock`地址，否则进进入之后无法显示对应的`local`环境，也就是本地环境

![image-20230205152909043](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230205152909043.png)

:::danger
当然我这个图是比较失败的那种，没有显示出`Local`的环境选项
:::
