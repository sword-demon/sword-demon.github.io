---
title: mac m1 安装laradock
date: 2022-06-19 23:39:10
category: Deploy
tag:
    - mac m1
    - laradock
---

## 安装配置

github 地址：[https://github.com/laradock/laradock](https://github.com/laradock/laradock)

文档、官网地址：[http://laradock.io/](http://laradock.io/)

1.  克隆代码

    ```bash
    git clone https://github.com/Laradock/laradock.git
    ```

2.  复制配置文件

    ```bash
    cp .env.example .env
    ```

3.  因为是 M1 系统，所以需要在`docker-compose.yml`中的`mysql`部分进行修改

    ```yaml
    mysql:
        image: mysql:8.0.19
        platform: 'linux/x86_64'
        build:
            context: ./mysql
            args:
                - MYSQL_VERSION=${MYSQL_VERSION}
        environment:
            - MYSQL_DATABASE=${MYSQL_DATABASE}
            - MYSQL_USER=${MYSQL_USER}
            - MYSQL_PASSWORD=${MYSQL_PASSWORD}
            - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
            - TZ=${WORKSPACE_TIMEZONE}
        volumes:
            - ${DATA_PATH_HOST}/mysql:/var/lib/mysql
            - ${MYSQL_ENTRYPOINT_INITDB}:/docker-entrypoint-initdb.d
        ports:
            - '${MYSQL_PORT}:3306'
        networks:
            - backend
        user: mysql
    ```

4.  后面还可能因为网络问题，导致`Service php-fpm build failed`，修改`docker-compose.yml`

    ```yaml
    WORKSPACE_TIMEZONE=UTC # 换成 PRC
    ```

    如果没有很好的访问国外`raw.github.com`类似的网址的，建议去`hosts`文件添加，如果有，那就另当别论。

5.  启动容器 ，根据自己需要的镜像来启动

    ```bash
    docker-compose up -d redis mysql nginx workspace
    ```

    进行等待漫长的下载过程即可。

如果最后都有一个绿色的`done`显示，并且没有`error`，再使用`docker ps`查看运行的容器是否运行成功。

因为我们使用这个，仅仅需要一个`workspace`，所以我们需要进入`workspace`的控制台。

```bash
docker-compose up exec workspace bash
```

克隆一个 laravel 代码，默认克隆下来是最新的版本，我们需要切换到我们支持的版本上去。

![](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220221211556.png)

我这里目录放的有点草率了，导致当前上一级目录都被映射到容器内部去了，浪费了。所以你们需要找一个当前`laradock`目录上一级是个除了`laradock`以外没啥东西的地方去弄比较合适。

## Laravel 配置

我们需要配置`composer`使用阿里云镜像

```bash
composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/
```

复制一份环境配置文件

```bash
cp .env.example .env
```

安装 Laravel 需要的依赖

```bash
composer install -vvv
```

等待下载安装完成即可。

还需要对`.env`的`key`进行配置，因为我们是直接拉取的一个代码，而不是使用`Laravel`的命令或者`composer`安装的

```bash
cd laravel
php artisan key:generate
```

配置完成之后，我们最终还是需要在网页进行访问的，所以还需要配置`nginx`

> 到我们的`laradock`目录下的`nginx`下的`sites`目录里有一个`laravel.conf.example`文件，我们进行复制一份，去除后面的`.example`即可。

**注意：**

此时我们的`nginx`配置文件中的案例，是指向的是对的，

```nginx
#server {
#    listen 80;
#    server_name laravel.com.co;
#    return 301 https://laravel.com.co$request_uri;
#}

server {

    listen 80;
    listen [::]:80;

    # For https
    # listen 443 ssl;
    # listen [::]:443 ssl ipv6only=on;
    # ssl_certificate /etc/nginx/ssl/default.crt;
    # ssl_certificate_key /etc/nginx/ssl/default.key;

    # 配置虚拟域名
    server_name laravel.test;
    # 主要是这里，必须指向我们真确的目录
    root /var/www/laravel/public;
    index index.php index.html index.htm;

    location / {
         try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        try_files $uri /index.php =404;
        fastcgi_pass php-upstream;
        fastcgi_index index.php;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        #fixes timeouts
        fastcgi_read_timeout 600;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt/;
        log_not_found off;
    }

    error_log /var/log/nginx/laravel_error.log;
    access_log /var/log/nginx/laravel_access.log;
}

```

要想使得`nginx`生效，我们还得重新启动一下`nginx`

重启`nginx`的几种方式

```bash
# 进入到laradock目录
docker-compose exec nginx bash

# 或者使用docker ps 查看容器的id
docker-compose exec 容器id bash

# 或者直接在任意目录下使用docker重启
docker restart 容器id
```

## 配置虚拟域名

如上所述，我们配置了`http://laravel.test`的虚拟域名

我们在`Mac`中有一个软件：`SwitchHosts`可以轻松做到。`Windows`下你们可以自己去找到`hosts`文件进行修改即可。

![](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220221215315.png)

配置完成之后，我们尝试`ping`通一下

```bash
ping laravel.test
```

![](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220221215419.png)

我们在浏览器上访问是否可以

![](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220221215526.png)
