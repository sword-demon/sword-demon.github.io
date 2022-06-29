---
title: IPV4 TCP 套接字客户端
date: 2022-06-29 23:54:10
category: Socket
tag:
    - TCP
---

## IPV4 TCP 套接字客户端

```php
<?php

$socket_fd = socket_create(AF_INET, SOCK_STREAM, 0);

if (socket_connect($socket_fd, "127.0.0.1", "12345")) {
    fprintf(STDOUT, "connect ok\n");

    echo "write len: " . socket_write($socket_fd, "hello", 5);
    echo "recv from server: " . socket_read($socket_fd, 1024);
} else {
    $errno = socket_last_error($socket_fd);
    fprintf(STDOUT, "connect fail: %d, %s\n", $errno, socket_strerror($errno));
}

socket_close($socket_fd);
```

先运行前面写好的服务端，再运行这个客户端会得到如下结果：

```bash
➜ php tcp_client.php
connect ok
write len: 5recv from server: hi%
```

可以使用命令：

`strace -f -s 65500 php tcp_client.php`来跟踪其内部使用的是什么系统函数来完成的。

大致如下：

-   `socket`函数创建套接字
-   `connect`：连接服务端
-   `write`：写内容，发送内容
-   `recvfrom`：接收值
