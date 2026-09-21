---
title: 运维部署
date: 2026-09-21 01:28:11
---

# 服务器环境以及常用中间件搭建

- `CentOS 7.8`
- 阿里云服务商 ECS



## 安装 Docker

### 安装依赖

```bash
# 安装依赖
yum install -y yum-utils device-mapper-persistent-data lvm2
```

### 配置 yum 源

国外的比较慢，不用

```bash
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

### 使用国内的源

```bash
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

### 查看版本

```bash
yum list docker-ce --showuplicates | sort -r
```

### 安装 docker

```bash
yum -y install docker-ce-20.10.10-3.e17
```

查看 docker 版本

```bash
docker -v
```

启动 docker

```bash
systemctl start docker
systemctl stop docker
```

查看 docker 启动状态

```bash
systemctl status docker
```

检查安装结果

```bash
docker info
```

查看容器

```bash
docker ps

docker stop 容器id
```

### 修改镜像仓库

```bash
vim /etc/docker/daemon.json
```

> 改为以下内容，然后重启 docker

```json
{
  "debug": true,
  "experimental": true,
  "registry-mirrors": [
    "https"://pb5bklzr.mirror.aliyuncs.com,
    "https://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
```

重启 docker

```bash
systemctl restart docker
```

## 安装 MySQL8.0

```bash
docker run \
	-p 3306:3306 \
	-e MYSQL_ROOT_PASSWORD=admin888 \
	-v /home/data/mysql/data:/var/lib/mysql:rw \
	-v /etc/localtime:/etc/localtime:ro \
	--name my_mysql8 \
	--restart=always \
	-d mysql:8.0
```

安装完成之后可以使用`mysql`的工具进行连接测试

**连接数配置**

进入`mysql`连接之后，执行一下`sql`，为后续微服务多连接准备，提高连接数。

```sql
show variables like '%max_connections%';

set GLOBAL max_connections=5000;
set GLOBAL mysqlx_max_connections=5000;

# 可以再次执行查询一下，看看是否改没改
show variables like '%max_connections%';
```

## Redis6.x 安装

```bash
docker run -itd --name my-redis -p 6379:6379 -v /mydata/redis/data:/data redis:6.2.4 --requirepass admin888
```

进入容器

```bash
docker exec -it 容器id redis-cli
```

可以尝试一些`redis`的常用的命令来测试一下是否成功。



## Nacos2.x 安装

> 生产环境让运维人员配置，不暴露到公网。

**开源版本的 Nacos server 配置中，不会对客户端鉴权，即任何能访问 nacos server 的客户，都可以直接获取 Nacos 中存储的配置，这样肯定会有安全隐患。需要先开启 Nacos server 的鉴权，在 Nacos server 上修改 `application.properties`中的`nacos.core.auth.enabled`值为`true`即可。**

```bash
docker run -d \
-e NACOS_AUTH_ENABLE=true \
-e MODE=standalone \
-e JVM_XMS=128m \
-e JVM_XMX=128m \
-e JVM_XMN=128m \
-p 8848:8848 \
-e SPRING_DATASOURCE_PLATFORM=mysql \
-e MYSQL_SERVICE_HOST=ip \
-e MYSQL_SERVICE_PORT=3306 \
-e MYSQL_SERVICE_USER=root \
-e MYSQL_SERVICE_PASSWORD=admin888 \
-e MYSQL_SERVICE_DB_NAME=nacos_config \
-e MYSQL_SERVICE_DB_PARAM='characterEncoding=utf8&connectTimeout=10000&socketTimeout=30000&autoReconnect=true&useSSL=false' \
--restart=always \
--privileged=true \
-v /home/data/nacos/logs:/home/nacos/logs \
--name my_nacos_auth \
nacos/nacos-server:2.0.2
```

如果是服务器里，则还需要对应的网络安全组里开放对应的 8848 端口 ，如果是企业内网使用，则不需要对外暴露。

安装完成后，使用对应的`ip:8848/nacos`进行访问，默认的账号和密码都是`nacos`



## RabbitMQ 安装

```bash
docker run -d --name my_rabbit -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=password -p 15672:15672 -p 5672:5672 rabbitmq:3.8.15-management
```

**网络安全组记得开放端口**

- 4369 `erlang`发现口
- 5672 `client`通信端口
- 15672 管理界面 UI 端口
- 25672 `server`间内部通信口



访问管理界面：`ip:15672`，账号为`admin`，密码为`password` 