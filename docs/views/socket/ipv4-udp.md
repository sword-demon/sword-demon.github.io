---
title: IPV4 UDP
date: 2022-07-03 22:43:10
category: Socket
tag:
    - UDP
---

## IPV4 UDP 服务端

> UDP 是数据报服务，传输的数据长度是固定的、不可靠的，也就是说发送端写数据，如果服务端没有及时接收或者说接收端缓冲区不够，也会造成数据丢失。
>
> TCP 是字节流服务、传输是可靠的、有序的、数据没有边界

```php
$socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);

socket_bind($socket, "0.0.0.0", "12345");

while (1) {
    socket_recvfrom($socket, $buf, 1024, 0, $ip, $port);
    fprintf(STDOUT, "recv from client: %s, ip: %s, port=%d\n", $buf, $ip, $port);

    socket_sendto($socket, "socket", 6, 0, $ip, $port);
}

socket_close($socket);
```

![测试图片](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220703204304.png)

## IPV4 UDP 客户端

```php
<?php

$socket_fd = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);

while (1) {
    // 从终端接收数据
    $data = fread(STDIN, 128);
    if ($data) {
        socket_sendto($socket_fd, $data, strlen($data), 0, "127.0.0.1", "12345");
    }

    // 接收服务端返回的数据
    if (socket_recvfrom($socket_fd, $buf, 1024, 0, $ip, $port)) {
        fprintf(STDOUT, "recv from server：%s, ip=%s, port=%d\n", $buf, $ip, $port);
    }
}

socket_close($socket_fd);
```

![服务端和客户端调试](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220703205735.png)

而且这里我们再继续开别的客户端进行连接服务端，也是可以进行发送消息的。但是这里是无法进行客户端之间的消息发送和接收。

### 多个客户端之间的消息发送

**客户端代码**

```php
<?php

$socket_fd = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);

// 启动一个子进程
$pid = pcntl_fork();
if ($pid == 0) {
    while (1) {
        // 接收服务端返回的数据
        if (socket_recvfrom($socket_fd, $buf, 1024, 0, $ip, $port)) {
            fprintf(STDOUT, "recv from server：%s, ip=%s, port=%d\n", $buf, $ip, $port);
        }
    }
}

while (1) {
    // 从终端接收数据
    $data = fread(STDIN, 128);
    if ($data) {
        socket_sendto($socket_fd, $data, strlen($data), 0, "127.0.0.1", "12345");
    }
}


socket_close($socket_fd);
```

**服务端代码调整**

```php
<?php

$socket = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);

socket_bind($socket, "0.0.0.0", "12345");

$connections = [];

while (1) {
    socket_recvfrom($socket, $buf, 1024, 0, $ip, $port);
    $connections[$port] = $ip;
    fprintf(STDOUT, "recv from client: %s, ip: %s, port=%d\n", $buf, $ip, $port);

    foreach ($connections as $port => $ip) {
        socket_sendto($socket, $buf, strlen($buf), 0, $ip, $port);
    }
}

socket_close($socket);

```

![测试客户端间通信](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220703230042.png)
