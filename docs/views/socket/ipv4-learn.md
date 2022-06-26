---
title: IPV4 TCP套接字服务端
date: 2022-06-26 16:50:10
category: Socket
tag:
    - IPV4
    - TCP
---

[https://www.php.net/manual/zh/book.stream.php](PHP Stream 函数文档地址)

## IPV4 TCP 套接字服务

### Unix 域套接字进程间通信

```php
$socketFd = socket_create();
```

第一个参数：

`$domain`套接字通信域参数

-   `AF_INET`：IPV4
-   `AF_INET6`： IPV6
-   `AF_UNIX`：本地通讯协议，具有高性能和低成本的 IPC(进程间通信)

主要以 IPV4 为主。

第二个参数：

`$type`：套接字类型：TCP/UDP

第三个参数：协议，如果是 TCP 或 UDP，可以直接使用`SOL_TCP`和`SOL_UDP`

**第一步：创建套接字，实际上返回一个文件描述符**

```php
$socketFd = socket_create(AF_INET, SOCK_STREAM, 0);
```

**第二步：命名`socket`绑定，把端口、IP 绑定到 socket 文件描述符上**

第三个参数可以在`unix`进程间通信的时候可以不传

成功：返回`true`

失败：返回`false`

```php
socket_bind($socketFd, "0.0.0.0", "12345");
```

**第三步：监听**

第二个参数是接收的监听队列的个数

```php
socket_listen($socketFd, 5);
```

**第四步：接收客户端连接**

```php
$conn = socket_accept($socketFd);
```

**第五步：发送数据**

```php
socket_send($conn, "hi", 2, 0);
```

发送 HTTP 内容

```php
$data = "HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nok";
echo socket_send($conn, $data, strlen($data), 0);
```

这样如果使用 TCP 连接：`127.0.0.1:12345`即可获取到响应的 HTTP 内容`ok`

**第六步：关闭**

```php
socket_close($conn);
socket_close($socketFd);
```
