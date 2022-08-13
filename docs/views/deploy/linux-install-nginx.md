---
title: Linux安装Nginx和配置
date: 2022-08-13 22:06:10
category: Deploy
tag:
    - nginx
    - linux
---

# Linux 安装 Nginx 和配置

## 目录

-   [Nginx 安装](#nginx安装)

    -   [gcc 安装](#gcc安装)
    -   [添加一个 nginx 用户](#添加一个nginx用户)
    -   [配置](#配置)
    -   [配置 vhost](#配置vhost)

-   [nginx 参数优化](#nginx-参数优化)

    -   [配置优化](#配置优化)
    -   [最终配置内容](#最终配置内容)

-   [负载均衡](#负载均衡)

# nginx 安装和配置

## Nginx 安装

下载安装包：我这里使用的是：`nginx-1.17.8.tar.gz`

下载完了，然后上传到服务器之后，我们得下载一些需要得依赖包。

### gcc 安装

```bash
yum -y install unzip zip  ncurses-devel zlib libxml libjpeg freetype libpng gd curl libiconv zlib-devel libxml2-devel libjpeg-devel freetype-devel libpng-devel gd-devel curl-devel libxslt-devel  zlib-devel openssl-devel gcc gcc-c++ autoconf libjpeg libjpeg-devel libpng-devel  freetype-devel libxml2 libxml2-devel zlib zlib-devel glibc glibc-devel glib2 glib2-devel bzip2 bzip2-devel ncurses ncurses-devel curl-devel openssl-devel expat expat-devel make gcc g++ gcc-c++ libtool autoconf automake imake mysql-devel libxm2-devel expat-devel  net-snmp-devel  libcurl-deve libevent libevent-devel openldap openldap-devel
```

### 添加一个 nginx 用户

```bash
useradd nginx -s /sbin/nologin
```

配置

```bash
[root@10 nginx-1.17.8]# ./configure --prefix=/usr/local/nginx --user=nginx --group=nginx --with-http_ssl_module --with-http_stub_status_module --with-http_realip_module

```

```bash
Configuration summary
  + using system PCRE library
  + using system OpenSSL library
  + using system zlib library

  nginx path prefix: "/usr/local/nginx"
  nginx binary file: "/usr/local/nginx/sbin/nginx"
  nginx modules path: "/usr/local/nginx/modules"
  nginx configuration prefix: "/usr/local/nginx/conf"
  nginx configuration file: "/usr/local/nginx/conf/nginx.conf"
  nginx pid file: "/usr/local/nginx/logs/nginx.pid"
  nginx error log file: "/usr/local/nginx/logs/error.log"
  nginx http access log file: "/usr/local/nginx/logs/access.log"
  nginx http client request body temporary files: "client_body_temp"
  nginx http proxy temporary files: "proxy_temp"
  nginx http fastcgi temporary files: "fastcgi_temp"
  nginx http uwsgi temporary files: "uwsgi_temp"
  nginx http scgi temporary files: "scgi_temp"

```

然后进行编译安装

```bash
make && make install
```

编译安装完之后我们进行启动一下

```bash
[root@10 nginx-1.17.8]# /usr/local/nginx/sbin/nginx

```

然后给`nginx`添加防火墙端口

```bash
firewall-cmd --zone=public --add-port=80/tcp --permanent
```

再进行重启防火墙

```bash
systemctl restart firewalld.service
```

![](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220813221453.png)

然后使用我们虚拟机的`ip`地址到浏览器里去访问，就可以看到`nginx`安装和启动成功了。

### 配置

```bash
cd /usr/local/nginx/conf
mv nginx.conf nginx_当前日期.conf # 备份一下
vim nginx.conf
```

```nginx
server {
        listen       80;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location / {
            root   /home/web/;
            index  index.html index.htm;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }

```

具体也没改啥，就是改了一个`root`的指向的目录。

然后进行语法检测和配置重载

```bash
[root@10 conf]# /usr/local/nginx/sbin/nginx -t
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
[root@10 conf]# /usr/local/nginx/sbin/nginx -s reload
```

然后我们创建对应的`/home/web`目录

```bash
mkdir -p /home/web/
# 配置nginx权限
chown -R nginx.nginx /home/web/

# 简单编写一个 index.html
vim /home/web/index.html
```

然后查看我们浏览器访问的时候，是否变成了对应的输入的`index.html`的内容即可。

**配置开启自启**

```bash
cd /etc/init.d/

```

我们编写一个脚本文件名称为`nginx`不带任何后缀

```bash
#!/bin/bash
#
# Startup script for Nginx - this script starts and stops the nginx daemon
#
# chkconfig:   - 85 15
# description:  Nginx is an HTTP(S) server, HTTP(S) reverse proxy and IMAP/POP3 proxy server
# processname: nginx
# config:      /usr/local/nginx/conf/nginx.conf
pidfile="/usr/local/nginx/logs/nginx.pid"

# Source function library.
. /etc/rc.d/init.d/functions

# Source networking configuration.
. /etc/sysconfig/network

# Check that networking is up.
[ "$NETWORKING" = "no" ] && exit 0

nginx="/usr/local/nginx/sbin/nginx"
prog=$(basename $nginx)

NGINX_CONF_FILE="/usr/local/nginx/conf/nginx.conf"

[ -f /etc/sysconfig/nginx ] && . /etc/sysconfig/nginx

lockfile=/var/lock/subsys/nginx

start() {
    [ -x $nginx ] || exit 5
    [ -f $NGINX_CONF_FILE ] || exit 6
    echo -n $"Starting $prog: "
    daemon $nginx -c $NGINX_CONF_FILE
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $lockfile
    return $retval
}

stop() {
    echo -n $"Stopping $prog: "
    killproc $prog -QUIT
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $lockfile
    return $retval
}

restart() {
    configtest || return $?
    stop
    sleep 1
    start
}

reload() {
    configtest || return $?
    echo -n $"Reloading $prog: "
    killproc $nginx -HUP
    RETVAL=$?
    echo
}

force_reload() {
    restart
}

configtest() {
  $nginx -t -c $NGINX_CONF_FILE
}

rh_status() {
    status $prog
}

rh_status_q() {
    rh_status >/dev/null 2>&1
}

case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart|configtest)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
            ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}"
        exit 2
esac


```

编写完毕之后上传到刚才的目录中，并且设置一些权限

```bash
chmod a+x nginx
```

再进行使用命令

```bash
service nginx restart
```

如果遇到什么`can not open directory因为nginx.pid没了`

我们就在上述的`nginx`里配置一个

`pidfile="/usr/local/nginx/logs/nginx.pid"`这一行，设置你的`nginx.pid`文件位置即可，一般给的这里是注释掉的。

然后使用`chkconfig`命令加入开机启动

```bash
chkconfig nginx on
chkconfig nginx --list
```

只要看到 3，4，5 是开的即`on`状态即可

### 配置 vhost

进入`nginx`的配置文件目录，新建一个`vhost`目录，里面以后存放别的一些站点的配置文件，然后主要的`nginx.conf`还得包含一下

```bash
vim nginx.conf
```

在最下面一行添加

```nginx
include vhost/*.conf
```

然后我们在`vhost`目录下新建一个简单的站点配置文件进行测试

```nginx
server {
  # 监听端口号
  listen 80;
  # 域名
  server_name www.php7.tt;
  # 网站目录
  root /home/web/php7/;
  location /{
    ssi on;
    ssi_silent_errors on;
    index index.php index.html index.htm;
  }
  access_log /usr/local/nginx/logs/php7_access.log;
  error_log /usr/local/nginx/logs/php7_error.log;
}

```

我们配置的是`www.php7.tt`网址，所以我们必须在本机上进行`hosts`设置才能进行访问。

然后配置完了，我们创建一个对应的存放目录

```bash
mkdir -p /home/web/php7
vim /home/web/php7/index.html
```

简单写一点内容，然后重启`nginx`在本地浏览器进行查看内容即可

```纯文本
192.168.33.10 www.php7.tt
```

`hosts`文件里得配置上你对应得虚拟机的`ip`

## nginx 参数优化

1.  开启`gzip`压缩
    开启标志

    ```nginx
    gzip on;
    ```

    文件大小未达到该值，不压缩，文件已达到该值，压缩

    ```nginx
    gzip_min_length 1k;
    ```

    设置`gzip`压缩文件使用缓存空间的大小

    -   `number`: 向系统申请换租空间的个数

    -   `size`: 指定每个缓存空间的大小，一般取系统内存页一页的大小

    ```nginx
    gzip_buffers 4 16k;
    ```

    ```nginx
    gzip_http_version 1.0;
    ```

    用于压缩响应所需要的最小`http`协议版本。注意参数值：`1.0 | 1.1`，此处只能是`1.0`或者`1.1`

    设置压缩`gzip`压缩程度，包括 1~9 及，1 最低，9 最高，默认为 1

    ```nginx
    gzip_com_level 2;
    ```

    参数值：响应报文数据格式，或者说类型，对应`http`响应头中的`Content-type`字段，如常见的有`text/html`、`text/css`、`application/json`、`application/javaScript`等。用于指定要压缩的响应报文类型。” \*”表示压缩所有格式的响应报文，多种格式用空格隔开。如`text/html text/css`。默认值：text/html

    ```nginx
    gzip_types       text/plain application/x-javascript text/css application/xml;
    ```

    用于设置在进行 gzip 压缩时是否发送带有 Vary:Accept-Encoding 头域的响应头部

    ```nginx
    gzip_vary on;
    ```

    根据不同的客户端请求选择性的开启或关闭 gzip 指令 gzip_disable MSIE \[4-6]. 对 IE4-6 不开启 gzip 压缩

    ```nginx
    gzip_disable msie6;
    ```

2.  配置日志格式

    ```nginx
    log_format '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    ```

    -   `$remote_addr` 客户端地址 219.227.111.255

    -   `$remote_user` 客户端用户名称 —

    -   `$time_local` 访问时间和时区 18/Jul/2014:17:00:01 +0800

    -   `$request` 请求的 URI 和 HTTP 协议 “GET /article-10000.html HTTP/1.1”

    -   `$http_host` 请求地址，即浏览器中你输入的地址（IP 或域名） [www.ha97.com](http://www.ha97.com 'www.ha97.com')

    -   `$status` HTTP 请求状态 200

    -   `$upstream_status` upstream 状态 200

    -   `$body_bytes_sent` 发送给客户端文件内容大小 1547

    -   `$http_referer` url 跳转来源 [https://www.google.com/](https://www.google.com/ 'https://www.google.com/')

    -   `$http_user_agent` 用户终端浏览器等信息 “Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; SV1; GTB7.0; .NET4.0C;

    -   `$ssl_protocol` SSL 协议版本 TLSv1

    -   `$ssl_cipher` 交换数据中的算法 RC4-SHA

    -   `$upstream_addr` 后台 upstream 的地址，即真正提供服务的主机地址 10.36.10.80:80

    -   `$request_time` 整个请求的总时间 0.165

    -   `$upstream_response_time` 请求过程中，upstream 响应时间 0.002

    -   `$remote_addr` 与`$http_x_forwarded_for` 用以记录客户端的 ip 地址

        > 112.31.97.44 - - \[08/Dec/2019:11:36:07 +0800] "GET /goods/1.html HTTP/1.1" 200 9898 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"

3.  参数调优

    ```纯文本
    user是主模块指令，定义Nginx运行的用户和用户组
        user nginx nginx;
        工作进程数 设置为自动
        worker_processes auto;
        nginx默认是没有开启利用多核cpu的配置的。需要通过增加worker_cpu_affinity配置参数来充分利用多核cpu，cpu是任务处理，当计算最费时的资源的时候，cpu核使用上的越多，性能就越好
        worker_cpu_affinity 0001 0100 1000 0010;
        单个工作进程可以允许同时建立外部连接的数量 一是内存，二是操作系统级进程最大可打开文件数
        worker_connections  65535;
        进程最大可打开文件数
        worker_rlimit_nofile 65535;
      events {
          worker_connections 65535;
          性能优化-nginx事件处理模型优化use epoll;
          use epoll;
          网络连接的优化同一时刻只有一个请求而避免多个睡眠进程被唤醒的设置，on为防止被同时唤醒，默认为off，因此nginx刚安装完以后要进行适当的优化。
          accept_mutex on;
          打开同时接受多个新网络连接请求的功能。
        multi_accept on;
      }
      设置ulimits：ulimit -SHn 65535
      #服务器名字的hash表大小
      server_names_hash_bucket_size 128;
      #用于指定来自客户端请求头headerbuffer大小，对于大多数请求，1KB的缓冲区大小已经足够，如果自定义了消息头或有更大的cookie，可以增加缓冲区大小。这里设置为32KB
      client_header_buffer_size 32k;
      #用来指定客户端请求中较大的消息头的缓存最大数量和大小，“4”为个数，“128”为大小，最大缓存为4个128KB。
      large_client_header_buffers 4 128k;
      #允许客户端请求的最大单文件字节数
      client_max_body_size 10m;

         它可以配置一次发送数据的包大小。也就是说，它不是按时间累计  0.2 秒后发送包，而是当包累计到一定大小后就发送 在 nginx 中，tcp_nopush 必须和 sendfile 搭配使用。
        tcp_nopush     on;
        参数是一个请求完成之后还要保持连接多久，不是请求时间多久，目的是保持长连接，减少创建连接过程给系统带来的性能损耗，类似于线程池，数据库连接池
        keepalive_timeout  15;
        on 会增加由tcp协议数据小包的数量，但是可以提高响应速度。在及时性高的通信场景中应该会有不错的效果
        off 会增加由tcp协议通信的延时，但是会提高带宽利用率。在高延时、数据量大的通信场景中应该会有不错的效果
        tcp_nodelay on;

        Nginx-->进阶-->原理-->Nginx+php+fastcgi的原理与关系  https://www.cnblogs.com/mangguoxiansheng/p/5967745.html
        fastcgi优化性能调优 http 层加上fastcgi参数如下：

        #连接到后端fastcgi超时时间
        fastcgi_connect_timeout 300;
        #向fastcgi请求超时时间(这个指定值已经完成两次握手后向fastcgi传送请求的超时时间
        fastcgi_send_timeout 300;
        #接收fastcgi应答超时时间，同理也是2次握手后
        fastcgi_read_timeout 300;
        #读取fastcgi应答第一部分需要多大缓冲区，该值表示使用1个64kb的缓冲区读取应答第一部分(应答头),可以设置为fastcgi_buffers选项缓冲区大小
        fastcgi_buffer_size 64k;
        #指定本地需要多少和多大的缓冲区来缓冲fastcgi应答请求，假设一个php或java脚本所产生页面大小为256kb,那么会为其分配4个64kb的缓冲来缓存；若页面大于256kb,那么大于的256kb的部分会缓存到fastcgi_temp指定路径中，这并非是个好办法，内存数据处理快于硬盘，一般该值应该为站点中php/java脚本所产生页面大小中间值，如果站点大部分脚本所产生的页面大小为256kb，那么可把值设置为16 16k,4 64k等
        fastcgi_buffers 4 64k;
        #默认值是fastcgi_buffer的2倍
        fastcgi_busy_buffers_size 128k;
        #写入缓存文件使用多大的数据块，默认值是fastcgi_buffer的2倍
        fastcgi_temp_file_write_size 128k;

        #缓存路径文件，目录结构等级，关键字区域实际和非活动时间
        fastcgi_cache_path  /usr/local/nginx/fastcgi_cache levels=1:2 keys_zone=TEST:10m inactive=5m;
        #缓存的地址
        fastcgi_cache_key "$request_method://$host$request_uri";
        #该指令用于设置缓存哪些HTTP方法，默认缓存HTTP GET/HEAD方法
        fastcgi_cache_methods GET HEAD;
        #开启fastcgi缓存并为其指定为TEST名称，降低cpu负载,防止502错误发生.
        fastcgi_cache TEST;
        #应答代码缓存时间，200和302应答缓存为1个小时，301一天,其他1分钟
        fastcgi_cache_valid 200 302 1h;
        fastcgi_cache_valid 301 1d;
        fastcgi_cache_valid any 1m;
    ```

4.  隐藏`nginx`版本号
    在`http`模块中配置

    ```nginx
    server_tokens off;
    ```

### 配置优化

`nginx.conf`

```nginx
#1.开启gzip压缩
#开启标志
gzip on;
#文件大小未达到该值，不压缩 文件已达到该值，压缩
gzip_min_length  1k;
#用于设置Gzip压缩文件使用缓存空间的大小 number:向系统申请换粗空间的个数，size：指定每个缓存空间的大小，一般取系统内存页一页的大小
gzip_buffers     4 16k;
#参数值：1.0 | 1.1，注意，此处只能是1.0，或者1.1。设置压缩响应所需的最小http协议版本
gzip_http_version 1.0;
#设置gzip压缩程度，包括1~9级别，1最低，9最高，默认为1
gzip_comp_level 2;
#参数值：响应报文数据格式，或者说类型，对应http响应头中的Content-type字段，如常见的有text/html、text/css、application/json、application/javaScript等。用于指定要压缩的响应报文类型。”*”表示压缩所有格式的响应报文，多种格式用空格隔开。如text/html text/css。默认值：text/html
gzip_types       text/plain application/x-javascript text/css application/xml;
#用于设置在进行gzip压缩时是否发送带有Vary:Accept-Encoding头域的响应头部；gzip_vary on | off
gzip_vary on;
#根据不同的客户端请求选择性的开启或关闭gzip指令gzip_disable MSIE [4-6]\. 对IE4-6不开启gzip压缩
gzip_disable msie6;

include vhost/*.conf;
```

我们在`include vhost/*.conf;`这一行上面添加上述优化配置然后进行`nginx -t`检测

```bash
[root@10 sbin]# ./nginx -t
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful

```

查看`nginx`日志

```bash
[root@10 logs]# tail -F access.log
192.168.33.1 - - [13/Aug/2022:08:32:16 +0000] "GET / HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47"
192.168.33.1 - - [13/Aug/2022:08:32:16 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://192.168.33.10/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47"
192.168.33.1 - - [13/Aug/2022:08:39:50 +0000] "GET / HTTP/1.1" 200 14 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47"
192.168.33.1 - - [13/Aug/2022:08:48:42 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47"
192.168.33.1 - - [13/Aug/2022:10:02:27 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47"
192.168.33.1 - - [13/Aug/2022:11:00:08 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47"
192.168.33.1 - - [13/Aug/2022:11:00:14 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47"

```

添加日志记录配置

```nginx
# nginx日志记录格式
log_format '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';
```

然后在`nginx.conf`头部分替换原先的内容

```nginx
#user是主模块指令，定义Nginx运行的用户和用户组
user nginx nginx;
#工作进程数 设置为自动
worker_processes auto;
#nginx默认是没有开启利用多核cpu的配置的。需要通过增加worker_cpu_affinity配置参数来充分利用多核cpu，cpu是任务处理，当计算最费时的资源的时候，cpu核使用上的越多，性能就越好
worker_cpu_affinity 1;
#进程最大可打开文件数
worker_rlimit_nofile 65535;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
  #单个工作进程可以允许同时建立外部连接的数量
  worker_connections 65535;
  #性能优化-nginx事件处理模型优化use epoll;
  use epoll;
  #网络连接的优化同一时刻只有一个请求而避免多个睡眠进程被唤醒的设置，on为防止被同时唤醒，默认为off，因此nginx刚安装完以后要进行适当的优化。
  accept_mutex on;
  #打开同时接受多个新网络连接请求的功能。
  multi_accept on;
}
```

再次语法检测

```bash
[root@10 ~]# /usr/local/nginx/sbin/nginx -t
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful

```

再次重启一下`nginx`服务

设置`ulimits`的最大配置，也就是最大打开文件的数量

```bash
[root@10 ~]# ulimit -SHn 65535

```

继续配置，主要设置在`http`模块中

```nginx
http {
    include       mime.types;
    default_type  application/octet-stream;

  #服务器名字的hash表大小
  server_names_hash_bucket_size 128;
  #用于指定来自客户端请求头headerbuffer大小，对于大多数请求，1KB的缓冲区大小已经足够，如果自定义了消息头或有更大的cookie，可以增加缓冲区大小。这里设置为32KB
  client_header_buffer_size 32k;
  #用来指定客户端请求中较大的消息头的缓存最大数量和大小，“4”为个数，“128”为大小，最大缓存为4个128KB。
  large_client_header_buffers 4 128k;
  #允许客户端请求的最大单文件字节数
  client_max_body_size 10m;
}
```

接下来还是继续在`http`模块里配置

```nginx
sendfile        on;
#它可以配置一次发送数据的包大小。也就是说，它不是按时间累计  0.2 秒后发送包，而是当包累计到一定大小后就发送 在 nginx 中，tcp_nopush 必须和 sendfile 搭配使用。
tcp_nopush     on;
```

设置`keepalive_timeout`的值 为 15

> 保持长连接，减少创建连接过程给系统带来的性能损耗

```nginx
keepalive_timeout  15;
```

设置`TCP延迟处理`，也是在`http`模块中

```nginx
#on 会增加由tcp协议数据小包的数量，但是可以提高响应速度。在及时性高的通信场景中应该会有不错的效果
#off 会增加由tcp协议通信的延时，但是会提高带宽利用率。在高延时、数据量大的通信场景中应该会有不错的效果
tcp_nodelay on;
```

设置`fastcgi`配置，也是在`http`模块中

```nginx
#连接到后端fastcgi超时时间
fastcgi_connect_timeout 300;
#向fastcgi请求超时时间(这个指定值已经完成两次握手后向fastcgi传送请求的超时时间
fastcgi_send_timeout 300;
#接收fastcgi应答超时时间，同理也是2次握手后
fastcgi_read_timeout 300;
#读取fastcgi应答第一部分需要多大缓冲区，该值表示使用1个64kb的缓冲区读取应答第一部分(应答头),可以设置为fastcgi_buffers选项缓冲区大小
fastcgi_buffer_size 64k;
#指定本地需要多少和多大的缓冲区来缓冲fastcgi应答请求，假设一个php或java脚本所产生页面大小为256kb,那么会为其分配4个64kb的缓冲来缓存；若页面大于256kb,那么大于的256kb的部分会缓存到fastcgi_temp指定路径中，这并非是个好办法，内存数据处理快于硬盘，一般该值应该为站点中php/java脚本所产生页面大小中间值，如果站点大部分脚本所产生的页面大小为256kb，那么可把值设置为16 16k,4 64k等
fastcgi_buffers 4 64k;
#默认值是fastcgi_buffer的2倍
fastcgi_busy_buffers_size 128k;
#写入缓存文件使用多大的数据块，默认值是fastcgi_buffer的2倍
fastcgi_temp_file_write_size 128k;

#缓存路径文件，目录结构等级，关键字区域实际和非活动时间
fastcgi_cache_path  /usr/local/nginx/fastcgi_cache levels=1:2 keys_zone=TEST:10m inactive=5m;
#缓存的地址
fastcgi_cache_key "$request_method://$host$request_uri";
#该指令用于设置缓存哪些HTTP方法，默认缓存HTTP GET/HEAD方法
fastcgi_cache_methods GET HEAD;
#开启fastcgi缓存并为其指定为TEST名称，降低cpu负载,防止502错误发生.
fastcgi_cache TEST;
#应答代码缓存时间，200和302应答缓存为1个小时，301一天,其他1分钟
fastcgi_cache_valid 200 302 1h;
fastcgi_cache_valid 301 1d;
fastcgi_cache_valid any 1m;
```

上面的缓存`fastcgi_cache`目录需要我们提前创建一下

```bash
mkdir -p /usr/local/nginx/fastcgi_cache

# 权限
chown -R nginx.nginx /usr/local/nginx
```

开启`fascgi_cache`之后会多几个进程启动

```bash
[root@10 ~]# ps -ef | grep nginx
root     19828     1  0 19:18 ?        00:00:00 nginx: master process /usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
nginx    19860 19828  1 19:38 ?        00:00:00 nginx: worker process
nginx    19861 19828  0 19:38 ?        00:00:00 nginx: worker process
nginx    19862 19828  0 19:38 ?        00:00:00 nginx: cache manager process
nginx    19863 19828  0 19:38 ?        00:00:00 nginx: cache loader process
root     19865 19695  0 19:38 pts/0    00:00:00 grep --color=auto nginx

```

所以下次你改页面【PHP】的时候，不一定会即时生效，因为有缓存

设置隐藏版本号

![](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220813221425.png)

```nginx
# 隐藏版本号
server_tokens off;
```

再次验证重载配置之后，刷新页面，此时版本号就会消失

```纯文本
Server: nginx
```

### 最终配置内容

```nginx
#user是主模块指令，定义Nginx运行的用户和用户组
user nginx nginx;
#工作进程数 设置为自动
worker_processes auto;
#nginx默认是没有开启利用多核cpu的配置的。需要通过增加worker_cpu_affinity配置参数来充分利用多核cpu，cpu是任务处理，当计算最费时的资源的时候，cpu核使用上的越多，性能就越好
worker_cpu_affinity 1;
#进程最大可打开文件数
worker_rlimit_nofile 65535;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
  #单个工作进程可以允许同时建立外部连接的数量
  worker_connections 65535;
  #性能优化-nginx事件处理模型优化use epoll;
  use epoll;
  #网络连接的优化同一时刻只有一个请求而避免多个睡眠进程被唤醒的设置，on为防止被同时唤醒，默认为off，因此nginx刚安装完以后要进行适当的优化。
  accept_mutex on;
  #打开同时接受多个新网络连接请求的功能。
  multi_accept on;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

  #服务器名字的hash表大小
  server_names_hash_bucket_size 128;
  #用于指定来自客户端请求头headerbuffer大小，对于大多数请求，1KB的缓冲区大小已经足够，如果自定义了消息头或有更大的cookie，可以增加缓冲区大小。这里设置为32KB
  client_header_buffer_size 32k;
  #用来指定客户端请求中较大的消息头的缓存最大数量和大小，“4”为个数，“128”为大小，最大缓存为4个128KB。
  large_client_header_buffers 4 128k;
  #允许客户端请求的最大单文件字节数
  client_max_body_size 10m;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #它可以配置一次发送数据的包大小。也就是说，它不是按时间累计  0.2 秒后发送包，而是当包累计到一定大小后就发送 在 nginx 中，tcp_nopush 必须和 sendfile 搭配使用。
    tcp_nopush     on;

    #keepalive_timeout  0;
  #参数是一个请求完成之后还要保持连接多久，不是请求时间多久，目的是保持长连接，减少创建连接过程给系统带来的性能损耗，类似于线程池，数据库连接池
    keepalive_timeout  15;

  #on 会增加由tcp协议数据小包的数量，但是可以提高响应速度。在及时性高的通信场景中应该会有不错的效果
    #off 会增加由tcp协议通信的延时，但是会提高带宽利用率。在高延时、数据量大的通信场景中应该会有不错的效果
    tcp_nodelay on;

    #gzip  on;

  #连接到后端fastcgi超时时间
  fastcgi_connect_timeout 300;
  #向fastcgi请求超时时间(这个指定值已经完成两次握手后向fastcgi传送请求的超时时间
  fastcgi_send_timeout 300;
  #接收fastcgi应答超时时间，同理也是2次握手后
  fastcgi_read_timeout 300;
  #读取fastcgi应答第一部分需要多大缓冲区，该值表示使用1个64kb的缓冲区读取应答第一部分(应答头),可以设置为fastcgi_buffers选项缓冲区大小
  fastcgi_buffer_size 64k;
  #指定本地需要多少和多大的缓冲区来缓冲fastcgi应答请求，假设一个php或java脚本所产生页面大小为256kb,那么会为其分配4个64kb的缓冲来缓存；若页面大于256kb,那么大于的256kb的部分会缓存到fastcgi_temp指定路径中，这并非是个好办法，内存数据处理快于硬盘，一般该值应该为站点中php/java脚本所产生页面大小中间值，如果站点大部分脚本所产生的页面大小为256kb，那么可把值设置为16 16k,4 64k等
  fastcgi_buffers 4 64k;
  #默认值是fastcgi_buffer的2倍
  fastcgi_busy_buffers_size 128k;
  #写入缓存文件使用多大的数据块，默认值是fastcgi_buffer的2倍
  fastcgi_temp_file_write_size 128k;

  #缓存路径文件，目录结构等级，关键字区域实际和非活动时间
    fastcgi_cache_path  /usr/local/nginx/fastcgi_cache levels=1:2 keys_zone=TEST:10m inactive=5m;
    #缓存的地址
    fastcgi_cache_key "$request_method://$host$request_uri";
    #该指令用于设置缓存哪些HTTP方法，默认缓存HTTP GET/HEAD方法
    fastcgi_cache_methods GET HEAD;
    #开启fastcgi缓存并为其指定为TEST名称，降低cpu负载,防止502错误发生.
    fastcgi_cache TEST;
    #应答代码缓存时间，200和302应答缓存为1个小时，301一天,其他1分钟
    fastcgi_cache_valid 200 302 1h;
    fastcgi_cache_valid 301 1d;
    fastcgi_cache_valid any 1m;

  # 隐藏版本号
  server_tokens off;

    server {
        listen       80;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location / {
            root   /home/web/;
            index  index.html index.htm;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
    }


    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}


    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}

  #1.开启gzip压缩
    #开启标志
    gzip on;
    #文件大小未达到该值，不压缩 文件已达到该值，压缩
    gzip_min_length  1k;
    #用于设置Gzip压缩文件使用缓存空间的大小 number:向系统申请换粗空间的个数，size：指定每个缓存空间的大小，一般取系统内存页一页的大小
    gzip_buffers     4 16k;
    #参数值：1.0 | 1.1，注意，此处只能是1.0，或者1.1。设置压缩响应所需的最小http协议版本
    gzip_http_version 1.0;
    #设置gzip压缩程度，包括1~9级别，1最低，9最高，默认为1
    gzip_comp_level 2;
    #参数值：响应报文数据格式，或者说类型，对应http响应头中的Content-type字段，如常见的有text/html、text/css、application/json、application/javaScript等。用于指定要压缩的响应报文类型。”*”表示压缩所有格式的响应报文，多种格式用空格隔开。如text/html text/css。默认值：text/html
    gzip_types       text/plain application/x-javascript text/css application/xml;
    #用于设置在进行gzip压缩时是否发送带有Vary:Accept-Encoding头域的响应头部；gzip_vary on | off
    gzip_vary on;
    #根据不同的客户端请求选择性的开启或关闭gzip指令gzip_disable MSIE [4-6]\. 对IE4-6不开启gzip压缩
    gzip_disable msie6;
  # nginx日志记录格式
  log_format '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';

    include vhost/*.conf;
}

```

## 负载均衡

<http://tengine.taobao.org/book/chapter_05.html>

`weight`权重越高，出现频率越高

> 指定轮询几率，weight 和访问比率成正比，用于后端服务器性能不均的情况。
> 如果后端服务器 down 掉，能自动剔除。
> 比如以下配置，则 1.11 服务器的访问量为 1.10 服务器的两倍。

```nginx
upstream easyswoole_server {
  server 127.0.0.1:9501 weight=1;
  server 127.0.0.1:9502 weight=2;
  server 127.0.0.1:9503 weight=3;
}
server {
     listen       80;
     server_name  www.easyswoole.tt;
     root /home/web/easyswoole/;
     location / {
          ssi on;
          ssi_silent_errors on;
          index  index.php index.html index.htm;
          proxy_http_version 1.1;
          proxy_set_header Connection "keep-alive";
          proxy_set_header X-Real-IP $remote_addr;
          if (!-f $request_filename) {
            #proxy_pass http://127.0.0.1:9501;
             proxy_pass http://easyswoole_server;
          }

     }
     location ~ \.php$ {
          fastcgi_pass   127.0.0.1:9000;
          fastcgi_index  index.php;
          fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
          include        fastcgi_params;
     }
     access_log  /usr/local/nginx/logs/php7_access.log;
     error_log /usr/local/nginx/logs/php7_error.log;
}


```
