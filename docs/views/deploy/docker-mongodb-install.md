---
title: Docker安装MongoDB
date: 2023-06-17 23:36:10
category: Deploy
tag:
    - docker
    - MongoDB
---

## 安装 mongo 镜像

可以搜索一下有什么适合你的版本的我这里下的是<kbd>4.4.7</kbd>

```bash
docker search mongo
```

```bash
docker pull mongo:4.4.7
```

## 配置本地卷

在你们合适的目录新建对应的进行映射的目录，我是在用户目录下新建了一个`mydata/mongo`文件夹，用于存储映射的一些相关的文件。

需要在目录下新建一个配置文件：`mongod.conf`

```conf
net:
   port: 27017
   bindIp: "0.0.0.0"

storage:
   dbPath: "/data/db"

security:
   authorization: enabled

```

:::tip

MacOS 无法使用`root`目录，所以我们需要换成其他的目录，别的系统的就算了。

:::

## 创建容器运行

> 创建容器，为 MongoDB 分配 500M 内存

```bash
docker run -it -d --name mongo -p 27017:27017 \
-v /Users/yourname/mydata/mongo:/etc/mongo -m 500m \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=admin \
-e TZ=Asia/Shanghai \
mongo:4.4.7 --config /etc/mongo/mongod.conf

```

-   MONGO_INITDB_ROOT_USERNAME: 设置用户名
-   MONGO_INITDB_ROOT_PASSWORD: 设置密码

## 本地连接测试

> 使用 navicate 进行连接测试

:::warning 注意主机名

先前我默认是`localhost`，出现错误，后来也换了我本机的`ip`地址进行测试，谁知道最后直接`127.0.0.1`就可以。

:::

## Mongo 语法

> MySQL 和 Mongo 的对比

| SQL              | Mongo            |
| ---------------- | ---------------- |
| 表 Table         | 集合 Collection  |
| 行 Row           | 文档 Document    |
| 列 Col           | 字段 Field       |
| 主键 Primary Key | 对象 ID ObjectId |

> 数据库操作

| 创建数据库 |     Use demo      |
| :--------: | :---------------: |
| 查看数据库 |     show dbs      |
| 删除数据库 | db.dropDatabase() |

> 集合操作

| 创建集合 | db.createCollection(name) |
| -------- | ------------------------- |
| 查看集合 | show collections          |
| 删除集合 | db.collection.drop()      |

> 文档操作

| 创建文档 | db.collection.insertOne({}) db.collection.insertMany([]) |
| -------- | -------------------------------------------------------- |
| 查看文档 | db.collections.find({})                                  |
| 删除文档 | db.collection.deleteOne() db.collection.deleteMany()     |
| 更新文档 | db.collection.update({}, {}, false, true)                |

> 条件操作

| 大于     | $gt  |
| -------- | ---- |
| 小于     | $lt  |
| 大于等于 | $gte |
| 小于等于 | $lte |
