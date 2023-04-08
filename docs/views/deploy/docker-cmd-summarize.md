---
title: Docker命令总结
date: 2023-04-09 00:25:10
category: Deploy
tag:
    - Docker
---

# 命令总结

## Docker 环境

```bash
# 查看版本
docker version

# 更加具体的信息
docker info
```

## Docker 的生命周期

```bash
# 创建容器
# 交互式启动
# 起名为 nginx
# 使用 nginx:1.14 镜像
docker create -it --name nginx nginx:1.14

# 直接就启动
# 使用方式较多
docker run -it --name nginx nginx:1.14
```

查看容器

```bash
# 查看所有的
docker ps -a

# 查看启动的
docker ps
```

启动容器

```bash
# 启动刚才创建的容器名称
# 或者使用对应的容器 id
docker start nginx

# 停止容器
docker stop nginx
```

强制杀掉进程停止容器

```bash
# 直接把容器主进程干掉
docker kill nginx

# 停止容器的子进程 没有停止容器的主进程
docker pause nginx

# 使用 pause 的还可以使用 unpause 重新启动
docker unpause nginx
```

## 容器运维

```bash
# 查看容器的详细信息
docker inspect nginx

# 进入容器内部 以 bash 终端进程
docker exec -it nginx bash

# 查看正在运行的容器里的进程
docker top

# 直观地查看正在运行的容器的  CPU 运行情况 内存等信息
docker status nginx

# 列举正在运行的容器
docker ps

# 修改容器的名称
docker rename nginx nginx2
```

## 容器 rootfs

```bash
# 拷贝文件
# 先创建一个文件
touch test.txt

# 将文件拷贝到容器的根目录下
docker cp test.txt nginx /

# 查看容器实际修改了什么
docker diff nginx

# 容器提交到仓库 可以让别人使用这个镜像
docker commit -m "test nginx commit" nginx

# 可以指定 repository 和 tag
docker commit -m "test nginx commit" nginx-test:1.14

# 删除镜像
docker rmi 容器镜像 id 或者容器名

# 批量清除所有的镜像
docker image prune

# 会删除没有运行的所有容器
docker container prune
```
