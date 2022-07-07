---
title: stream-socket-api函数介绍
date: 2022-07-07 23:52:10
category: Socket
tag:
    - stream
    - socket
---

## Stream socket api 函数介绍

> PHP 对 socket 的封装提供了很多函数，但是其内部使用的 socket api 函数和别的语言都是一样的。

-   stream
-   event：PHP 里的一个扩展【libevent 网络库】，它是用 C 语言开发的，内部使用的 socket api 函数都是一样的，不过 PHP 再封装了一层，让 PHP 来进行使用。
-   swoole
-   等。。。

[stream_socket_server 函数文档地址](https://www.php.net/manual/zh/function.stream-socket-server.php)

```php
stream_socket_server(
    string $address,
    int &$error_code = null,
    string &$error_message = null,
    int $flags = STREAM_SERVER_BIND | STREAM_SERVER_LISTEN,
    ?resource $context = null
): resource|false
```

```php
<?php

// socket()
// bind()
// listen
// 内部调用使用了上面3个函数
$sock = stream_socket_server("tcp://0.0.0.0:12345");

// 接收一个客户端连接
// -1 超时时间，等到有连接为止
$conn = stream_socket_accept($sock, -1, $ip);

print_r($conn);
print_r($ip);
```

内部调用函数：`strace -f -s 6550 php stream1.php`

```bash
socket(AF_INET, SOCK_STREAM, IPPROTO_IP) = 3
setsockopt(3, SOL_SOCKET, SO_REUSEADDR, [1], 4) = 0
bind(3, {sa_family=AF_INET, sin_port=htons(12345), sin_addr=inet_addr("0.0.0.0")}, 16) = 0
listen(3, 32)
```

-   setsockopt：设置套接字的一些属性
-   htons：把主机字节序转换为网络字节序
-   listen：默认监听队列最大长度为 32
-   还使用了`poll` IO 多路复用函数：`oll([{fd=3, events=POLLIN|POLLERR|POLLHUP}], 1, 1271309319`

使用`curl`来连接服务端测试调用的内容

```bash
curl 127.0.0.1:12345
```

```bash
accept(3, {sa_family=AF_INET, sin_port=htons(47412), sin_addr=inet_addr("127.0.0.1")}, [128->16]) = 4
write(1, "Resource id #6", 14Resource id #6)          = 14
write(1, "127.0.0.1:47412", 15127.0.0.1:47412)         = 15
close(4)                                = 0
close(3)                                = 0
close(0)                                = 0
```

---

客户端

```php
<?php

// 连接服务端程序
$client = stream_socket_client("tcp://127.0.0.1:12345");

// php 封装为一个资源

echo fwrite($client, "hello world");

// 直接关闭
fclose($client);

```

然后再配合服务端进行运行

```bash
socket(AF_INET, SOCK_STREAM, IPPROTO_IP) = 3
fcntl(3, F_GETFL)                       = 0x2 (flags O_RDWR)
fcntl(3, F_SETFL, O_RDWR|O_NONBLOCK)    = 0
connect(3, {sa_family=AF_INET, sin_port=htons(12345), sin_addr=inet_addr("127.0.0.1")}, 16) = -1 EINPROGRESS (Operation now in progress)
poll([{fd=3, events=POLLIN|POLLOUT|POLLERR|POLLHUP}], 1, 60000) = 1 ([{fd=3, revents=POLLOUT}])
getsockopt(3, SOL_SOCKET, SO_ERROR, [0], [4]) = 0
fcntl(3, F_SETFL, O_RDWR)               = 0
sendto(3, "hello world", 11, MSG_DONTWAIT, NULL, 0) = 11
write(1, "11", 211)                       = 2
close(3)                                = 0
close(0)
```

-   fcntl(3, F_SETFL, O_RDWR|O_NONBLOCK) = 0：设置为非阻塞方式
-   内部使用`connect`系统调用函数连接`12345`的端口的地址
-   使用`sendto`发送"hello world"
-   服务端在使用`read`函数来获取内容，11 个字节，且不阻塞了：`MSG_DONTWAIT`

```bash
recvfrom(4, "hello world", 8192, MSG_DONTWAIT, NULL, NULL) = 11
write(1, "hello world", 11hello world)
```
