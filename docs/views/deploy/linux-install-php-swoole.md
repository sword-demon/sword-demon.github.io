---
title: Linux编译安装PHP7.4和Swoole扩展
date: 2022-08-14 21:04:10
category: Deploy
tag:
    - PHP
    - Swoole
---

# PHP7.4 编译安装

## 目录

-   [下载安装 yum 源(centos7)](#下载安装yum源centos7)

-   [安装 sl 命令(小火车)](#安装sl命令小火车)

-   [安装 ipython 命令](#安装ipython命令)

-   [安装 PHP7.4](#安装php74)

-   [安装 cmake-3.17.0-rc1](#安装cmake-3170-rc1)

-   [安装 libzip-1.6.1](#安装libzip-161)

-   [安装 zip-1.17.1 扩展](#安装zip-1171扩展)

-   [配置 PHP7.4](#配置php74)

    -   [测试](#测试)

        -   [zip](#zip)

        -   [mysqli](#mysqli)

        -   [pdo_mysql](#pdo_mysql)

-   [PHP7.4 性能调优](#php74性能调优)

-   [关于 opache 的一些配置](#关于opache的一些配置)

-   [ThinkPHP 开启二级域名](#thinkphp开启二级域名)

-   [调整 PHP7.4 配置的一些内容](#调整php74配置的一些内容)

    -   [pdo_mysql](#pdo_mysql-1)

-   [PHP7.4 安装 swoole 扩展](#php74安装swoole扩展)

-   [安装 composer](#安装composer)

## 下载安装 yum 源(centos7)

```bash
wget http://mirror.centos.org/centos/7/extras/x86_64/Packages/epel-release-7-11.noarch.rpm

yum install -y epel-release-7-11.noarch.rpm
```

## 安装 sl 命令(小火车)

```bash
yum install -y sl
```

## 安装 ipython 命令

```bash
yum install -y ipython
```

## 安装 PHP7.4

首先准备一个 7.4 的源码包上传到`/usr/local/src`目录下，进行解压

然后查看 PHP7.4 需要安装的一些依赖

```bash
./configure --prefix=/usr/local/php7 --with-config-file-path=/usr/local/php7/etc  --with-mysqli   --with-pdo-mysql --with-xmlrpc --with-openssl --with-openssl-dir --with-zlib --with-zlib-dir  --with-freetype --enable-gd --with-jpeg  --enable-short-tags --enable-sockets --enable-soap --enable-mbstring --enable-static --with-curl  --with-xsl --enable-ftp --with-libxml  --enable-fpm --with-pdo-sqlite  --with-gettext --with-iconv-dir --with-kerberos --with-libdir=lib64  --with-pear --with-mhash  --enable-gd-jis-conv --enable-bcmath --with-expat --enable-inline-optimization --enable-mbregex --enable-opcache  --enable-sysvsem --enable-xml --enable-maintainer-zts  --enable-simplexml --disable-rpath --disable-fileinfo

```

​ 如果出现以下错误

> No package 'sqlite3' found

安装一下这个库即可

```bash
yum install libsqlite3x-devel -y
```

如果出现以下错误：

> error: Package requirements (oniguruma) were not met

安装如下依赖

```bash
yum install oniguruma-devel -y
```

然后再重更新运行上面配置代码

```bash
+--------------------------------------------------------------------+
| License:                                                           |
| This software is subject to the PHP License, available in this     |
| distribution in the file LICENSE. By continuing this installation  |
| process, you are bound by the terms of this license agreement.     |
| If you do not agree with the terms of this license, you must abort |
| the installation process at this point.                            |
+--------------------------------------------------------------------+

Thank you for using PHP.

```

最终出现这个，就代表成功了。

下面就可以`make && make intall`进行编译安装了

```bash
Installing shared extensions:     /usr/local/php7/lib/php/extensions/no-debug-zts-20190902/
Installing PHP CLI binary:        /usr/local/php7/bin/
Installing PHP CLI man page:      /usr/local/php7/php/man/man1/
Installing PHP FPM binary:        /usr/local/php7/sbin/
Installing PHP FPM defconfig:     /usr/local/php7/etc/
Installing PHP FPM man page:      /usr/local/php7/php/man/man8/
Installing PHP FPM status page:   /usr/local/php7/php/php/fpm/
Installing phpdbg binary:         /usr/local/php7/bin/
Installing phpdbg man page:       /usr/local/php7/php/man/man1/
Installing PHP CGI binary:        /usr/local/php7/bin/
Installing PHP CGI man page:      /usr/local/php7/php/man/man1/
Installing build environment:     /usr/local/php7/lib/php/build/
Installing header files:          /usr/local/php7/include/php/
Installing helper programs:       /usr/local/php7/bin/
  program: phpize
  program: php-config
Installing man pages:             /usr/local/php7/php/man/man1/
  page: phpize.1
  page: php-config.1
Installing PEAR environment:      /usr/local/php7/lib/php/
[PEAR] Archive_Tar    - installed: 1.4.8
[PEAR] Console_Getopt - installed: 1.4.3
[PEAR] Structures_Graph- installed: 1.1.1
[PEAR] XML_Util       - installed: 1.4.3
[PEAR] PEAR           - installed: 1.10.10
Wrote PEAR system config file at: /usr/local/php7/etc/pear.conf
You may want to add: /usr/local/php7/lib/php to your php.ini include_path
/usr/local/src/php-7.4.2/build/shtool install -c ext/phar/phar.phar /usr/local/php7/bin
ln -s -f phar.phar /usr/local/php7/bin/phar
Installing PDO headers:           /usr/local/php7/include/php/ext/pdo/

```

出现上述内容，表示编译安装完成了。

## 安装 cmake-3.17.0-rc1

将下载好的包传到服务器`/usr/local/src`目录下进行解压

解压完进入目录中使用如下命令

```bash
[root@10 cmake-3.17.0-rc1]# ./bootstrap
```

```bash
-- Build files have been written to: /usr/local/src/cmake-3.17.0-rc1
---------------------------------------------
CMake has bootstrapped.  Now run gmake.

```

出现上述内容，根据它的提示运行`gmake`，等到`gmake`运行完了，再继续运行`make install`命令，这个速度会比较快。

然后我们就可以安装`libzip`组件

## 安装 libzip-1.6.1

我们先去找资源下载一个这个包，然后上传到`/usr/local/src`目录中并解压

```bash
[root@10 src]# cd libzip-1.6.1/
[root@10 libzip-1.6.1]# mkdir build
[root@10 libzip-1.6.1]# cd build/
[root@10 build]# cmake ..

```

最后出现以下内容即可

```bash
-- Configuring done
-- Generating done
-- Build files have been written to: /usr/local/src/libzip-1.6.1/build
```

然后就在`build`目录中进行`make && make install`，这个速度也会挺快的。

安装成功出现下面的部分内容

```bash
-- Installing: /usr/local/bin/zipcmp
-- Set runtime path of "/usr/local/bin/zipcmp" to ""
-- Installing: /usr/local/bin/zipmerge
-- Set runtime path of "/usr/local/bin/zipmerge" to ""
-- Installing: /usr/local/bin/ziptool
-- Set runtime path of "/usr/local/bin/ziptool" to ""

```

```bash
vim /etc/ld.so.conf
```

添加内容

```纯文本
include ld.so.conf.d/*.conf

/usr/local/lib64
/usr/local/lib
/usr/lib
/usr/lib64
```

然后使用`lbconfig -v`查看一下即可

## 安装 zip-1.17.1 扩展

我们先去找资源下载一个这个包，然后上传到`/usr/local/src`目录中并解压

```bash
[root@10 zip-1.17.1]# /usr/local/php7/bin/phpize
Configuring for:
PHP Api Version:         20190902
Zend Module Api No:      20190902
Zend Extension Api No:   320190902

```

```bash
[root@10 zip-1.17.1]# ./configure --with-php-config=/usr/local/php7/bin/php-config
```

出现以下内容即可

```bash
creating libtool
appending configuration tag "CXX" to libtool
configure: patching config.h.in
configure: creating ./config.status
config.status: creating config.h

```

然后编译安装

```bash
[root@10 zip-1.17.1]# make && make install

```

就会出现以下结果

```bash
Build complete.
Don't forget to run 'make test'.

Installing shared extensions:     /usr/local/php7/lib/php/extensions/no-debug-zts-20190902/

```

## 配置 PHP7.4

```bash
[root@10 php-7.4.2]# cd /usr/local/php7/
[root@10 php7]# cp etc/php-fpm.conf.default etc/php-fpm.conf
[root@10 php7]# cp /usr/local/src/php-7.4.2/php.ini-development /usr/local/php7/etc/php.ini
```

```bash
[root@10 php7]# cd /usr/local/php7/etc/php-fpm.d/
[root@10 php-fpm.d]# cp www.conf.default www.conf

```

编辑`php.ini`加入`zip.so`扩展生效

```ini
;extension=soap
;extension=sockets
;extension=sodium
;extension=sqlite3
;extension=tidy
;extension=xmlrpc
;extension=xsl
extension=zip.so

```

使用`php-fpm`来启动

```bash
[root@10 php-fpm.d]# /usr/local/php7/sbin/php-fpm
```

```bash
[root@10 php-fpm.d]# netstat -tpln
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      706/sshd
tcp        0      0 127.0.0.1:9000          0.0.0.0:*               LISTEN      14896/php-fpm: mast
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      357/rpcbind
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      3295/nginx: master
tcp6       0      0 :::22                   :::*                    LISTEN      706/sshd
tcp6       0      0 :::33060                :::*                    LISTEN      1634/mysqld
tcp6       0      0 :::3306                 :::*                    LISTEN      1634/mysqld
tcp6       0      0 :::111                  :::*                    LISTEN      357/rpcbind
```

然后我们将`php-fpm`加入到开机自启

```bash
[root@10 php-fpm.d]# cd /usr/local/src/php-7.4.2/sapi/fpm/
[root@10 fpm]# cp init.d.php-fpm /etc/init.d/php-fpm7
[root@10 fpm]# chmod a+x /etc/init.d/php-fpm7
[root@10 fpm]# chkconfig php-fpm
php-fpm             php-fpm.8.in        php-fpm.conf.in     php-fpm.service.in
php-fpm.8           php-fpm.conf        php-fpm.service
[root@10 fpm]# chkconfig php-fpm
php-fpm             php-fpm.8.in        php-fpm.conf.in     php-fpm.service.in
php-fpm.8           php-fpm.conf        php-fpm.service
[root@10 fpm]# chkconfig php-fpm7 on

```

```bash
[root@10 fpm]# ps -ef | grep php-fpm
root     14896     1  0 15:59 ?        00:00:00 php-fpm: master process (/usr/local/php7/etc/php-fpm.conf)
nobody   14897 14896  0 15:59 ?        00:00:00 php-fpm: pool www
nobody   14898 14896  0 15:59 ?        00:00:00 php-fpm: pool www
root     15035  3378  0 16:06 pts/1    00:00:00 grep --color=auto php-fpm
[root@10 fpm]# kill -9 14896
[root@10 fpm]# kill -9 14897
[root@10 fpm]# kill -9 14898
[root@10 fpm]# ps -ef | grep php-fpm
root     15037  3378  0 16:06 pts/1    00:00:00 grep --color=auto php-fpm
[root@10 fpm]# service php-fpm7 restart
Gracefully shutting down php-fpm warning, no pid file found - php-fpm is not running ?
Starting php-fpm  done

```

查看是否进入开机启动项

```bash
[root@10 fpm]# chkconfig php-fpm7 --list

Note: This output shows SysV services only and does not include native
      systemd services. SysV configuration data might be overridden by native
      systemd configuration.

      If you want to list systemd services use 'systemctl list-unit-files'.
      To see services enabled on particular target use
      'systemctl list-dependencies [target]'.

php-fpm7         0:off  1:off  2:on  3:on  4:on  5:on  6:off

```

只要 3，4，5 是`on`即可。

然后我们还需要配置`nginx.conf`可以使用`php`

```bash
[root@10 fpm]# vim /usr/local/nginx/conf/nginx.conf
```

```nginx
location ~ \.php$ {
    fastcgi_pass   127.0.0.1:9000;
    fastcgi_index  index.php;
    fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    include        fastcgi_params;
}

```

```nginx
root   /home/web/;
location / {
    index  index.php index.html index.htm;
}
```

修改上述内保存之后，重启以下`nginx`

### 测试

简单编写一个`index.php`，加入`phpinfo()`函数

```bash
[root@10 fpm]# vim /home/web/index.php
[root@10 fpm]# chown -R nginx.nginx /home/web/

```

然后再次更新它的权限，再次访问我们的虚拟机的`ip`地址就会显示对应的`phpinfo`的内容

就可以看到下面几个依赖库的内容

#### zip

| Zip                    | enabled |
| ---------------------- | ------- |
| Zip version            | 1.17.1  |
| Libzip headers version | 1.6.1   |
| Libzip library version | 1.6.1   |

#### mysqli

| MysqlI Support             | enabled       |
| -------------------------- | ------------- |
| Client API library version | mysqlnd 7.4.2 |
| Active Persistent Links    | 0             |
| Inactive Persistent Links  | 0             |
| Active Links               | 0             |

#### pdo_mysql

| PDO Driver for MySQL | enabled       |
| -------------------- | ------------- |
| Client API version   | mysqlnd 7.4.2 |

我们还要设置以下安装`nginx`的时候设置的`home/web/php7`目录下的一个`php7.conf`

```nginx
location ~ \.php$ {
    fastcgi_pass   127.0.0.1:9000;
    fastcgi_index  index.php;
    fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
    include        fastcgi_params;
}
```

也加上上述内容即可。

完整内容

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
        location ~ \.php$ {
                fastcgi_pass   127.0.0.1:9000;
                fastcgi_index  index.php;
                fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
                 include        fastcgi_params;
        }
        access_log /usr/local/nginx/logs/php7_access.log;
        error_log /usr/local/nginx/logs/php7_error.log;
}

```

然后接着还是要重启以下`nginx`

对应也对`php7`目录下新增一个`index.php`加入`phpinfo()`函数来测试以下是否成功。

## PHP7.4 性能调优

给`php-fpm`添加日志文件目录

```bash
[root@10 nginx]# mkdir -p /usr/local/php7/log
[root@10 nginx]# chown -R nginx.nginx /usr/local/php7/

```

然后编辑

```bash
#性能调优
vim /usr/local/php7/etc/php-fpm.conf

# 将以下内容注释去掉
pid = run/php-fpm.pid
error_log = log/php-fpm.log
```

```bash
vim /usr/local/php7/etc/php-fpm.d/www.conf

# 将下面内容进行替换为nginx用户
user = nginx
group = nginx

# 如果 listen 监听的是9000那就不用管  暂时保存，下面还要设置内容
```

```bash
[root@10 nginx]# ps -ef | grep php-fpm
root     15049     1  0 16:06 ?        00:00:00 php-fpm: master process (/usr/local/php7/etc/php-fpm.conf)
nobody   15050 15049  0 16:06 ?        00:00:00 php-fpm: pool www
nobody   15051 15049  0 16:06 ?        00:00:00 php-fpm: pool www

```

可以看到这边还是`nobody`，我们需要重启以下`php-fpm7`

```bash
[root@10 nginx]# service php-fpm7 restart
Gracefully shutting down php-fpm . done
Starting php-fpm  done
[root@10 nginx]# ps -ef | grep php-fpm
root     15428  3378  0 16:26 pts/1    00:00:00 vim /usr/local/php7/etc/php-fpm.d/www.conf
root     15455     1  0 16:28 ?        00:00:00 php-fpm: master process (/usr/local/php7/etc/php-fpm.conf)
nginx    15456 15455  0 16:28 ?        00:00:00 php-fpm: pool www
nginx    15457 15455  0 16:28 ?        00:00:00 php-fpm: pool www

```

---

继续配置`vim /usr/local/php7/etc/php-fpm.d/www.conf`

```nginx
pm = dynamic; # 表示使用哪种进程数量管理方式
```

-   `dynamic`表示`php-fpm`进程数是动态的，最开始是`pms.start_servers`指定的数量，如果请求较多 ，则会自动增加，保证空闲的进程数不小于`pm.min_spare_servers`，如果进程数较多，也会进行相应清理，保证多余的进程数不多于`pm.max_spare_servers`

-   `static`表示`php-fpm`进程数是静态的, 进程数自始至终都是`pm.max_children`指定的数量，不再增加或减少

此时`pm.max_children = 5`，我们可以先修改`pm`为`static`，重启`php-fpm7`来查看启动了多少个进程

```bash
[root@10 nginx]# service php-fpm7 restart
Gracefully shutting down php-fpm . done
Starting php-fpm  done
[root@10 nginx]# ps -ef | grep php-fpm
root     15428  3378  0 16:26 pts/1    00:00:00 vim /usr/local/php7/etc/php-fpm.d/www.conf
root     15475     1  0 16:31 ?        00:00:00 php-fpm: master process (/usr/local/php7/etc/php-fpm.conf)
nginx    15476 15475  0 16:31 ?        00:00:00 php-fpm: pool www
nginx    15477 15475  0 16:31 ?        00:00:00 php-fpm: pool www
nginx    15478 15475  0 16:31 ?        00:00:00 php-fpm: pool www
nginx    15479 15475  0 16:31 ?        00:00:00 php-fpm: pool www
nginx    15480 15475  0 16:31 ?        00:00:00 php-fpm: pool www
root     15482 29045  0 16:31 pts/0    00:00:00 grep --color=auto php-fpm

```

> 所以`pm.max_children`这个参数只对静态模式下起作用。
> 静态模式下，我们最好设置为 100 个。

我们最后还是改回动态模式，动态模式可以动态节省资源

```nginx
; The number of child processes created on startup.
; Note: Used only when pm is set to 'dynamic'
; Default Value: (min_spare_servers + max_spare_servers) / 2
pm.start_servers = 10

; The desired minimum number of idle server processes.
; Note: Used only when pm is set to 'dynamic'
; Note: Mandatory when pm is set to 'dynamic'
pm.min_spare_servers = 5

; The desired maximum number of idle server processes.
; Note: Used only when pm is set to 'dynamic'
; Note: Mandatory when pm is set to 'dynamic'
pm.max_spare_servers = 35

```

重启后观察效果

```bash
[root@10 nginx]# ps -ef | grep php-fpm
root     15428  3378  0 16:26 pts/1    00:00:00 vim /usr/local/php7/etc/php-fpm.d/www.conf
root     15652     1  0 16:40 ?        00:00:00 php-fpm: master process (/usr/local/php7/etc/php-fpm.conf)
nginx    15653 15652  0 16:40 ?        00:00:00 php-fpm: pool www
nginx    15654 15652  0 16:40 ?        00:00:00 php-fpm: pool www
nginx    15655 15652  0 16:40 ?        00:00:00 php-fpm: pool www
nginx    15656 15652  0 16:40 ?        00:00:00 php-fpm: pool www
nginx    15657 15652  0 16:40 ?        00:00:00 php-fpm: pool www
nginx    15658 15652  0 16:40 ?        00:00:00 php-fpm: pool www
nginx    15659 15652  0 16:40 ?        00:00:00 php-fpm: pool www
nginx    15660 15652  0 16:40 ?        00:00:00 php-fpm: pool www
nginx    15661 15652  0 16:40 ?        00:00:00 php-fpm: pool www
nginx    15662 15652  0 16:40 ?        00:00:00 php-fpm: pool www
root     15664 29045  0 16:40 pts/0    00:00:00 grep --color=auto php-fpm

```

我们最后给`pm.start_servers = 20`设置为 20 个

---

> `pm.max_requests`是发送多少个请求后会重启该线程，我们需要适当降低这个值，用以让`php-fpm`自动的释放内存

```nginx
; The number of requests each child process should execute before respawning.
; This can be useful to work around memory leaks in 3rd party libraries. For
; endless request processing specify '0'. Equivalent to PHP_FCGI_MAX_REQUESTS.
; Default Value: 0
pm.max_requests = 10240
```

---

开启慢查询

```nginx
slowlog = log/$pool.log.slow
```

设置超时时间 2 秒钟

```nginx
request_slowlog_timeout = 2
```

设置最大执行时间

```nginx
request_terminate_timeout = 30
```

在`php.ini`中也可以进行配置(`max_execution_time`)

增加`php-fpm`打开文件描述符的限制

```nginx
rlimit_files = 65535
```

## 关于 opache 的一些配置

> 测试环境或者开发环境不建议开，线上环境可以开

```nginx
zend_extension=opcache.so
;开启opcache
opcache.enable=1

;CLI环境下，PHP启用OPcache
opcache.enable_cli=1

;OPcache共享内存存储大小,单位MB
opcache.memory_consumption=128

;PHP使用了一种叫做字符串驻留（string interning）的技术来改善性能。例如，如果你在代码中使用了1000次字符串“foobar”，在PHP内部只会在第一使用这个字符串的时候分配一个不可变的内存区域来存储这个字符串，其他的999次使用都会直接指向这个内存区域。这个选项则会把这个特性提升一个层次——默认情况下这个不可变的内存区域只会存在于单个php-fpm的进程中，如果设置了这个选项，那么它将会在所有的php-fpm进程中共享。在比较大的应用中，这可以非常有效地节约内存，提高应用的性能。
这个选项的值是以兆字节（megabytes）作为单位，如果把它设置为16，则表示16MB，默认是4MB
opcache.interned_strings_buffer=8

;这个选项用于控制内存中最多可以缓存多少个PHP文件。这个选项必须得设置得足够大，大于你的项目中的所有PHP文件的总和。
设置值取值范围最小值是 200，最大值在 PHP 5.5.6 之前是 100000，PHP 5.5.6 及之后是 1000000。也就是说在200到1000000之间。
opcache.max_accelerated_files=10000

;设置缓存的过期时间（单位是秒）,为0的话每次都要检查
opcache.revalidate_freq=60

;从字面上理解就是“允许更快速关闭”。它的作用是在单个请求结束时提供一种更快速的机制来调用代码中的析构器，从而加快PHP的响应速度和PHP进程资源的回收速度，这样应用程序可以更快速地响应下一个请求。把它设置为1就可以使用这个机制了。
opcache.fast_shutdown=1

;如果启用（设置为1），OPcache会在opcache.revalidate_freq设置的秒数去检测文件的时间戳（timestamp）检查脚本是否更新。
如果这个选项被禁用（设置为0），opcache.revalidate_freq会被忽略，PHP文件永远不会被检查。这意味着如果你修改了你的代码，然后你把它更新到服务器上，再在浏览器上请求更新的代码对应的功能，你会看不到更新的效果
强烈建议你在生产环境中设置为0，更新代码后，再平滑重启PHP和web服务器。
opcache.validate_timestamps=0

;开启Opcache File Cache(实验性), 通过开启这个, 我们可以让Opcache把opcode缓存缓存到外部文件中, 对于一些脚本, 会有很明显的性能提升.
这样PHP就会在/tmp目录下Cache一些Opcode的二进制导出文件, 可以跨PHP生命周期存在.
opcache.file_cache=/tmp
```

## ThinkPHP 开启二级域名

在`nginx`对应的设置的`php的项目的conf`文件加上

```nginx
if (!-e $request_filename) {
    rewrite  ^(.*)$  /index.php?s=$1  last;
    break;
}
```

开启二级域名

```nginx
location /youdomain/ {
  if (!-e $request_filename){
       rewrite  ^/youdomain/(.*)$  /youdomain/index.php?s=$1  last;
  }
}
```

完整内容

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
  location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9000;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
  }
  # nginx 开启rewrite
  if (!-e $request_filename) {
        rewrite  ^(.*)$  /index.php?s=$1  last;
        break;
  }
  # nginx开启二级域名
  location /youdomain/ {
      if (!-e $request_filename){
             rewrite  ^/youdomain/(.*)$  /youdomain/index.php?s=$1  last;
      }
  }
  access_log /usr/local/nginx/logs/php7_access.log;
  error_log /usr/local/nginx/logs/php7_error.log;
}

```

或者在`ThinkPHP`的`public`目录下的`htaccess.conf`文件里设置

```nginx
#开启压缩
gzip on;
gzip_buffers 32 4K;
gzip_comp_level 6;
gzip_min_length 200;
gzip_types text/css  application/x-javascript;
gzip_vary on;
if (!-e $request_filename) {
    rewrite  ^(.*)$  /index.php?s=$1  last;
    break;
}
location /youdomain/ {
  if (!-e $request_filename){
       rewrite  ^/youdomain/(.*)$  /youdomain/index.php?s=$1  last;
  }
}
    #设置缓存
    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
    {
      expires      30d;
    }
    location ~ .*\.(js|css)?$
    {
      expires      1h;
    }

```

## 调整 PHP7.4 配置的一些内容

### pdo_mysql

| PDO Driver for MySQL | enabled       |
| -------------------- | ------------- |
| Client API version   | mysqlnd 7.4.2 |

| Directive                | Local Value     | Master Value    |
| ------------------------ | --------------- | --------------- |
| pdo_mysql.default_socket | /tmp/mysql.sock | /tmp/mysql.sock |

可以看到它的`socket`文件是在`/tmp/mysql.sock`下，我们需要配置以下`php.ini`里的存储位置

修改`php.ini`

```ini
[Pdo_mysql]
; Default socket name for local MySQL connects.  If empty, uses the built-in
; MySQL defaults.
pdo_mysql.default_socket=/usr/local/mysql/tmp/mysql.sock
```

然后重启`php-fpm7`

## PHP7.4 安装 swoole 扩展

这里 swoole 的版本我选的是`4.4.15`，反正只要是`x86`架构的 LInux 环境下安装，一般都没啥毛病了。

还是老样子，下载源码包上传到`/usr/local/src`目录下并解压

然后使用`phpize`打包

```bash
[root@10 swoole-4.4.15]# /usr/local/php7/bin/phpize
Configuring for:
PHP Api Version:         20190902
Zend Module Api No:      20190902
Zend Extension Api No:   320190902

```

```bash
[root@10 swoole-4.4.15]# ./configure --enable-openssl --enable-http2 --enable-sockets --enable-mysqlnd --with-php-config=/usr/local/php7/bin/php-config
```

然后就是编译安装

```bash
make && make install
```

安装完了，我们可以选择`make test`一下看看。

然后就是将`swoole.so`扩展加入到`php.ini`文件中

```bash
 [root@10 swoole-4.4.15]# vim /usr/local/php7/etc/php.ini
```

```ini
# 我们可与i找到 zip.so 在下面添加一下即可

extension=swoole.so
```

检测

```bash
[root@10 swoole-4.4.15]# /usr/local/php7/bin/php --ri swoole


swoole

Swoole => enabled
Author => Swoole Team <team@swoole.com>
Version => 4.4.15
Built => Aug 14 2022 18:15:59
coroutine => enabled
epoll => enabled
eventfd => enabled
signalfd => enabled
cpu_affinity => enabled
spinlock => enabled
rwlock => enabled
sockets => enabled
openssl => OpenSSL 1.0.2k-fips  26 Jan 2017
http2 => enabled
pcre => enabled
zlib => 1.2.7
mutex_timedlock => enabled
pthread_barrier => enabled
futex => enabled
mysqlnd => enabled
async_redis => enabled

Directive => Local Value => Master Value
swoole.enable_coroutine => On => On
swoole.enable_library => On => On
swoole.enable_preemptive_scheduler => Off => Off
swoole.display_errors => On => On
swoole.use_shortname => On => On
swoole.unixsock_buffer_size => 8388608 => 8388608

```

## 安装 composer

```bash
[root@10 src]# curl -sS https://getcomposer.org/installer | /usr/local/php7/bin/php
All settings correct for using Composer
Downloading...

Composer (version 2.3.10) successfully installed to: /usr/local/src/composer.phar
Use it: php composer.phar
```

移动到`/usr/local/bin`下，并为`php7`添加软链接

```bash
[root@10 src]# mv composer.phar /usr/local/bin/composer
[root@10 src]# ln -s /usr/local/php7/bin/php /usr/local/bin/php
```

配置阿里云镜像

```bash
composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/
```

如果有安装一些`swoole`框架，可能会需要开放`9501`端口或别的端口

```bash
firewall-cmd --zone=public --add-port=9501/tcp --permanent
systemctl restart firewalld.service
```
