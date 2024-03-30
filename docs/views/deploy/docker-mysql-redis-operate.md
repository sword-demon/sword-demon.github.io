---
title: Docker配置redis和mysql的操作记录
date: 2024-03-30
tag:
 - docker
 - mysql
 - redis
---

## MySQL8 容器

```bash
docker run -p 13306:3306 --name java-mysql8 \
-v /Users/xxx/IDEAProjects/java-mysql8/log:/var/log/mysql \
-v /Users/xxx/IDEAProjects/java-mysql8/data:/var/lib/mysql \
-v /Users/xxx/IDEAProjects/java-mysql8/mysql-files:/var/lib/mysql-files \
-e MYSQL_ROOT_PASSWORD=root \
-d mysql:8.0.30 \
--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

>   进入容器

```bash
docker exec -it java-mysql8 bash
```

修改密码

```bash
use mysql;

alter user 'root'@'localhost' identified with mysql_native_password by '新密码';

flush privileges;

# 退出 ctrl d 重新登录

# 保证root的密码永不过期
alter user 'root'@'%' identified by '新密码' password expire never;

update user set host='%' where user = 'root';
```

如果出现

`ERROR 1062 (23000): Duplicate entry '%-root' for key 'user.PRIMARY'`说明已经设置过了，就不用管了，直接刷新下权限即可。



## 生产环境 Docker 部署 mysql？

-   云平台可以动态扩展`mysql`，通常中小企业的应用基本不会频繁对`mysql`进行扩容的
-   数据共享，是不能做的
-   使用`docker`之后会发生内存独占，可能会发生性能影响
-   “不要把鸡蛋放在一个篮子里”，其他中间件一般不要放在一个容器里面，尽量要规避这种一个容器挂了的风险，尽量数据库单独部署，或者直接使用云数据库，对于技术来讲，高可用，高并发，高性能，三高，是绝对没有问题的，也支持弹性扩缩容，运维成本也较低，唯一缺点就是贵。

>   MySQL 自重启

```bash
docker update java-mysql8 --restart=always
```



## 安装redis

```bash
docker search redis
```

```bash
docker pull redis:6.2.7
```

```bash
docker run -p 26379:6379 --name java-redis6 \
-v /Users/xxx/IDEAProjects/redis6/data:/data \
-v /Users/xxx/IDEAProjects/redis6/conf/redis.conf:/etc/redis/redis.conf \
-d redis:6.2.7 \
redis-server /etc/redis/redis.conf
```

```bash
docker update java-redis6 --restart=always
```

在`redis.conf`里配置内容

```text
requirepass root
appendonly yes
```

然后重启

```bash
docker restart java-redis6
```



## reids 持久化策略

上面配置采用的是`aof`

-   快照`RDB`
-   日志`AOF`

假设现在是凌晨 1 点开始备份，由于有时间损耗，01 点钟 05 分产生了 RDB 文件保存到了磁盘，那么会有如下问题：

-   这个 RDB 文件的内容是凌晨 1 点的数据？✅
-   这个 RDB 文件内容是01 点钟 05 分的数据？
-   这个 RDB 文件内容是凌晨 1 点的数据，并且记录开始备份到结束（1 点到 1 点 05 分之间）的数据？

>   RDB 的保存方式

-   `save`：备份`RDB`的时候会阻塞当前进程，备份的时候是不允许再次写入了。
-   `bgsave`：`background save`后台形式保存，`fork`一个新的进程，子进程会写数据，父进程接受新的写入操作写入到磁盘，两者进行隔离。

>   既然`bgsave`这么好用，为什么还要一个`save`

`RDB`自动保存

-   `save 900 1`: 如果 900 秒发生 1 次更新，则备份`RDB`
-   `save 300 10`：如果 300 秒内发生 10 次更新，则备份`RDB`
-   `save 60 1000`: 如果 60 秒内发生 1000 次更新，则备份`RDB`

---

`RDB`优点

-   全量备份，适合做冷备
-   灾备简单
-   父子进程相互隔离
-   相对`AOF`，大文件的启动、恢复会更快

缺点

-   故障丢失数据，可能会丢失最后一批时间的备份数据
-   子进程内存损耗 `copy-on-write`
-   全量实时备份不适用

### AOF持久化模式

>   追加式的一个日志备份，`append`追加，不是修改；先恢复`AOF`，后恢复`RDB`，它是从头到尾恢复 `AOF`

`AOF`引发的问题

-   `AOF`经历多年，有多大？最大占用空间会不会超过磁盘？
-   恢复 10 个 T 的文件，会不会内存溢出？我们可以通过相应的命令去压缩`AOF`
-   假设真有一个 10T 的文件需要恢复，需要多久？

```text
# AOF 默认关闭，yes 可以开启
appendonly no

# AOF 的文件名
appendfilename "appendonly.aof"

# no: 不同步
# everysec: 每秒备份，推荐使用
# always: 每次操作都会备份，安全并且数据完整，但是慢性能差
appendfsync everysec

# 重写的时候是否要同步，no可以保证数据安全
no-appendfsync-on-rewrite no

# 重写机制，避免文件越来越大，自动优化压缩指令，会 fork 一个新的子进程去完成新的动作，此时旧的 aof 文件不会被读取使用，类似 rdb
# 当前 aof 文件的大小是上次 aof大小的 100%并且文件体积达到 64m，，慢粗两者则触发重写
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

### AOF&RDB 混合持久化

```text
aof-use-rdb-preamble yes
```

### AOF 优点

-   耐用性高，秒级别备份
-   `log`日志追加，不惧怕磁盘大小限制，体积可以压缩
-   `aof`过大重写
-   日志形式更加有利于`redis`解析和恢复

缺点

-   相同数据量，`AOF`比`RDB`大，恢复时更耗时
-   同步比`RDB`慢
-   `AOF`数据不完整
    -   `redis-check-aof --fix [aof文件名]` 修复
    -   `aof-load-truncated yes`

## Docker 镜像改变

```bash
docker diff java-redis6
C /root
A /root/.rediscli_history
A /root/.bash_history
C /etc
A /etc/redis
A /etc/redis/redis.conf
C /tmp
A /tmp/tmp.DDgAWngiFi
A /tmp/tmp.dZpHD3eVh8
```

`A = ADD`创建的意思

`C = CHANGE`更改的意思

`D = DELETE`删除的意思，上面我们并没有操作什么

`docker commit`可以保存当前快照的信息。

```bash
docker commit --help

Usage:  docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]

Create a new image from a container's changes

Aliases:
  docker container commit, docker commit

Options:
  -a, --author string    Author (e.g., "John Hannibal Smith <hannibal@a-team.com>")
  -c, --change list      Apply Dockerfile instruction to the created image
  -m, --message string   Commit message
  -p, --pause            Pause container during commit (default true)
```

```bash
docker commit -a xxx -m "init new another redis" java-redis6 java-redis6:myRedis

# 提交过后

docker images 就会发现本地多了一个全新的镜像
```

```bash
docker images | grep redis
java-redis6                        myRedis   25335c1e46d8   7 seconds ago   107MB
bitnami/redis                      latest    07652f42c464   5 weeks ago     167MB
redis                              6.2.7     f52430d22479   15 months ago   107MB
```

>   如果当前的镜像有很多的`REPOSITORY`是`<none>`，可以使用
>
>   ```bash
>   docker image prune
>   ```
>
>   去除游离镜像

修改`tag`

```bash
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
```

```bash
docker tag java-redis6:myRedis java-redis6:myRedis-1.0.10
```

又会增加一个镜像，镜像 ID 是一样，他们只会占用一份的空间，只是做了一个标记，本质上还是原来的那一个。



## 转存 Docker 镜像

```bash
docker export -o myRedis.tar java-redis6
```

如果需要导入

```bash
docker import 文件地址 redis:myRedis-another

# 在另外的机器查看
docker images
```

保存镜像

```bash
docker save -o 要保存的文件名的绝对地址.tar IMAGEID

# 如果 IMAGEID 换成 tag，如果能匹配到多个 tag 相似的都会一起打包
```

```bash
docker load -i 保存的文件名.tar
```

