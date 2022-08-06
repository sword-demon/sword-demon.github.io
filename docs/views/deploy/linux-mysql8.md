---
title: Linux安装MySQL8
date: 2022-08-06
category: Deploy
tag:
    - MySQL
    - Linux
---

## 目录

-   [下载 Linux 的 MySQL 包](#下载linux的mysql包)

-   [安装上传文件的命令](#安装上传文件的命令)

# Linux 安装 MySQL8.0

## 下载 Linux 的 MySQL 包

> 可以先在自己的 windows 或者 mac 里下载好，或者你本身就是 Linux，下载好对应的包即可

我这里是`mysql-8.0.19-el7-x86_64.tar.gz`

## 安装上传文件的命令

```bash
yum install -y lrzsz
```

-   rz：上传

-   sz：下载

我们先在 Linux 下操作如下命令

```bash
cd /usr/local/src
```

我们把文件上传到此目录下

> 我们可以使用`rz`命令，在 windows 打开文件上传的窗口选择对应下载好的文件上传即可

对压缩文件进行解压

```bash
tar zxvf mysql-8.0.19-el7-x86_64.tar.gz
```

如果此时不是`root`用户的话，记得`su`切换到`root`用户

```bash
mv mysql-8.0.19-el7-x86_64 /usr/local/mysql
```

添加`mysql`用户

```bash
useradd mysql -s /sbin/nologin
# 赋予权限
chown -R mysql.mysql /usr/local/mysql/
# 赋予可执行权限
chmod +w /usr/local/mysql
# 创建tmp和data目录
mkdir -p /usr/local/mysql/tmp
mkdir -p /usr/local/mysql/data
# 更改所属用户
chown -R mysql.mysql /usrl/local/mysql

```

初始化数据库和设置初始密码

```bash
/usr/local/mysql/bin/mysqld --initialize --user=mysql --basedir=/usr/local/mysql/ --datadir=/usr/local/mysql/data/

```

如果你出现以下问题:

> /usr/local/mysql/bin/mysqld: error while loading shared libraries: libaio.so.1: cannot open shared object file: No such file or directory

意思就是缺少`libaio`这个库，安装一下即可

```bash
yum install libaio*
```

如果是`ubuntu`

```bash
sudo apt-get install libaio-dev
```

然后继续执行上面的初始化命令即可

如果出现以下内容

```bash
2022-08-06T14:21:00.039371Z 5 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: !dblgu08h6uG

```

这个`!dblgu08h6uG`：就是它默认给你初始化的密码，我们需要先记下来，这是临时密码，不然你马上 mysql 进不去。

然后编辑`my.cnf`文件

```bash
vim /etc/my.cnf
```

```text
[mysqld]
user = mysql
port = 3306
server_id = 1
basedir = /usr/local/mysql/
datadir=/usr/local/mysql/data/
mysqlx_port = 33060
mysqlx_socket = /usr/local/mysql/mysql/mysql.sock
socket=/usr/local/mysql/tmp/mysql.sock
pid-file=/usr/local/mysql/tmp/mysqld.pid
log-error = error.log
log-bin   = bin.log
relay-log = relay.log
#服务器编码
character-set-server  = utf8
collation-server = utf8_general_ci
init_connect     = 'SET NAMES utf8'
log_timestamps   = SYSTEM
#身份验证插件
default-authentication-plugin = mysql_native_password
#默认存储引擎
default-storage-engine = INNODB
#开启慢查询日志
slow_query_log = 1
slow_query_log_file = /usr/local/mysql/txt/slow_query_log.txt
long_query_time = 3
#关闭mysql8的严格模式
sql_mode = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
# Settings user and group are ignored when systemd is used.
# If you need to run mysqld under a different user or group,
# customize your systemd unit file for mariadb according to the
# instructions in http://fedoraproject.org/wiki/Systemd

[mysqld_safe]
log-error=/usr/local/mysql/tmp/mysqld.log
pid-file=/usr/local/mysql/tmp/mysqld.pid

[client]
socket=/usr/local/mysql/tmp/mysql.sock
default-character-set=utf8
#
# include all files from the config directory
#
!includedir /etc/my.cnf.d


```

`mysql`的配置的一些性能调优

```text
#性能调休
#禁用dns解析
skip-name-resolve
wait_timeout针对非交互式连接 ，通过jdbc连接数据库是非交互式连接。
指定一个请求的最大连接时间，对于4GB左右的内存服务器来说，可以将其设置为5-10。
wait_timeout = 10
针对交互式连接，即在mysql_real_connect()函数中使用了CLIENT_INTERACTIVE选项通过mysql客户端连接数据库是交互式连接
interactive_timeout = 2880000
来限制并发线程的数量，一旦执行线程的数量达到这个限制，额外的线程在被放置到对队列中之前，会睡眠数微秒
innodb_thread_concurrency=8

为每个session 分配的内存，在事务过程中用来存储二进制日志的缓存。 提高记录bin-log的效率
binlog_cache_size = 256K
连接线程的优化
thread_stack =512K
连表缓冲大小 多表join
join_buffer_size = 8192K
用户可以创建的内存表(memory table)的大小.这个值用来计算内存表的最大行数值
max_heap_table_size = 1024M
跳过外部锁定 多进程条件下为MyISAM数据表进行锁定
skip-external-locking
控制内存最大占用
performance_schema_max_table_instances=400
代表MySQL可以缓存的表定义的数量
table_definition_cache=400
参数值的代表MySQL可以缓存的打开表时候的最大文件描述符。
table_open_cache = 1024
指定索引缓冲区的大小，它决定索引处理的速度，尤其是索引读的速度。通过检查状态值Key_read_requests和Key_reads，可以知道key_buffer_size设置是否合理
key_buffer_size = 512M
mysql根据配置文件会限制server接受的数据包大小。
有时候大的插入和更新会受max_allowed_packet 参数限制，导致写入或者更新失败。
max_allowed_packet = 100G
增加sort_buffer_size 来加速ORDER BY 或者GROUP BY 操作,不能通过查询或者索引优化的。
sort_buffer_size = 2048K
官方建议使用mysqlpump 通信时缓存数据的大小.
net_buffer_length = 8K
是MySQL读入缓冲区大小。对表进行顺序扫描的请求将分配一个读入缓冲区，MySQL会为它分配一段内存缓冲区。
read_buffer_size = 2048K
是MySQL的随机读缓冲区大小，当按任意顺序读取行时（列如按照排序顺序）将分配一个随机读取缓冲区，进行排序查询时，MySQL会首先扫描一遍该缓冲，以避免磁盘搜索，提高查询速度，如果需要大量数据可适当的调整该值
read_rnd_buffer_size = 1024K
MySQL重建索引时所允许的最大临时文件的大小
myisam_max_sort_file_size=64G
MyISAM表发生变化时重新排序所需的缓冲。一般64M足矣。
myisam_sort_buffer_size = 64M
缓存可重用的线程数 通常至少设置为16
thread_cache_size = 192
开启查询缓存 mysql8 已放弃
query_cache_type = 1
指定MySQL查询结果缓冲区的大小。如果应用程序有大量读，而且没有应用程序级别的缓存，那么这很有用。不过不要设置太大，因为维护它也需要不少开销，这会导致MySQL变慢。
query_cache_size = 256M
内部内存临时表的大小
tmp_table_size = 1024M
```

我们编辑完`my.cnf`之后进行保存，再开一个终端进来

```bash
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
vim /etc/init.d/mysqld

```

找到如下 2 句，修改成这样

```text
basedir=/usr/local/mysql
datadir=/usr/local/mysql/data
```

然后给它设置权限

```bash
chmod a+x /etc/init.d/mysqld
# 添加软链
ln -s /usr/local/mysql/bin/mysql /usr/bin

cd /usr/local/mysql/tmp/

touch mysqld.log
chown -R mysql.mysql /usr/local/mysql/

# 执行
/usr/local/mysql/bin/mysql_safe --user=mysql &
```

如果出现以下错误：

> \[root\@10 tmp]# 2022-08-06T14:36:24.675170Z mysqld_safe error: log-error set to '/var/log/mariadb/mariadb.log', however file don't exists. Create writable for user 'mysql'.

这可能是我们前面修改`my.cnf`

忘了修改如下内容的地址

```text
[mysqld_safe]
log-error=/usr/local/mysql/tmp/mysqld.log
pid-file=/usr/local/mysql/tmp/mysqld.pid

```

然后我们再继续来执行上面那一个命令

```bash
/usr/local/mysql/bin/mysql_safe --user=mysql &
```

出现如下内容即可：

> \[root\@10 tmp]# 2022-08-06T14:46:04.116955Z mysqld_safe Logging to '/usr/local/mysql/tmp/mysqld.log'.
> 2022-08-06T14:46:04.162116Z mysqld_safe Starting mysqld daemon with databases from /usr/local/mysql/data

最后我们再开一个终端来测试一下：

```bash
[root@10 vagrant]# service mysqld restart
Shutting down MySQL. SUCCESS!
Starting MySQL..... SUCCESS!
```

这就代表我们设置成功了。

然后我们使用正常的命令链接`mysql`

```bash
mysql -uroot -p
```

输入上面我们记住的一个临时密码即可

```bash
[root@10 vagrant]# mysql -uroot -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 9
Server version: 8.0.19

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>

```

```bash
mysql> ALTER user 'root'@localhost identified by 'root'
    -> ;
Query OK, 0 rows affected (0.02 sec)

```

使用上述命令来修改密码为：`root`

然后我们再退出重新使用`root`密码进行登录测试，如果成功了，就代表完美结束了。
