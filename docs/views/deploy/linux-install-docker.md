---
title: Linux安装docker
date: 2022-06-19 23:44:10
category: Deploy
tag:
    - linux
    - docker
---

## 安装 docker

Docker 安装文档：[https://docs.docker.com/install/linux/docker-ce/centos](https://docs.docker.com/install/linux/docker-ce/centos)

1. 卸载系统之前的`docker`

    ```bash
    sudo yum remove docker \
     docker-client \
     docker-client-latest \
     docker-common \
     docker-latest \
     docker-latest-logrotate \
     docker-logrotate \
     docker-engine
    ```

2. 下载必须依赖的一些包

```bash
sudo yum install -y yum-utils \
device-mapper-persistent-data \
lvm2
```

3. 设置下载地址

```bash
sudo yum-config-manager \
--add-repo \
https://download.docker.com/linux/centos/docker-ce.repo
```

4. 安装 docker

```bash
sudo yum install docker-ce docker-ce-cli containerd.io
```

5. 启动 docker 服务：`sudo systemctl start docker`

6. 查看 docker 版本：`docker -v`

7. 查看 docker 镜像：`docker images`会出现权限不足的问题，因为你现在`vagrant ssh`登录的是`vagrant`默认用户，需要加上`sudo`

8. 设置 docker 开启自启：`sudo systemctl enable docker`

## 配置阿里云镜像加速

-   首先进入阿里云网站
-   进入控制台，找到产品与服务，里面有容器与镜像服务，找到镜像加速器，找到 centos
-   按照操作文档说的配置镜像加速器即可

```bash
sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json <<-'EOF'
{
     "registry-mirrors": ["https://82m9ar63.mirror.aliyuncs.com"]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```
