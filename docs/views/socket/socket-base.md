---
title: PHP Socket练习
date: 2022-06-24 00:39:20
category: Socket
tag:
    - socket
---

## TCP 服务端使用 select 支持多路复用

```php
<?php

// 创建套接字
$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);

// 设置 ip 被释放后立即可使用
socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, true);

// 绑定ip与端口
socket_bind($socket, 0, 8888);

// 开始监听
socket_listen($socket);

// 存储多个连接套接字
$sockets[] = $socket;

while (true) {
    $tmp_sockets = $sockets;
    socket_select($tmp_sockets, $write, $except, null);

    foreach ($tmp_sockets as $sock) {
        // 如果当前套接字等于 socket_create 创建的套接字，说明是有新的连接或有新的断开连接
        if ($sock == $socket) {
            $conn_sock = socket_accept($socket);
            $sockets[] = $conn_sock;
        } else { // 否则说明是之前连接的客户端发来消息
            $msg = socket_read($sock, 10240);
            var_dump($msg);
            if ($msg == '') {
                return;
            }

            $output = '<h1>this is php worker不知道能不能显示中文</h1>';
            $output = doEncoding($output);
            $len = strlen($output);

            $response = "HTTP/1.1 200 OK\r\n";
            $response .= "content-type: text/html\r\n";
            $response .= "server: php socket\r\n";
            $response .= "Content-Length: {$len}\r\n\r\n";

            $response .= $output;

            socket_write($sock, $response);
        }
    }
}

/**
 * @Desc: 编码转换
 * @param $str
 * @return string
 * @author: Administrator - virus
 * @Time: 2022/6/23 9:59
 */
function doEncoding($str)
{
    $encode = strtoupper(mb_detect_encoding($str, ["ASCII", 'UTF-8', "GB2312", "GBK", 'BIG5']));
    if ($encode != 'UTF-8') {
        $str = mb_convert_encoding($str, 'UTF-8', $encode);
    }
    return $str;
}
```

## TCP WebSocket

```php
<?php

$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, true);
socket_bind($socket, 0, 8888);
socket_listen($socket);

while (true) {
    $conn_sock = socket_accept($socket);
    $request = socket_read($conn_sock, 102400);

    $new_key = getShaKey($request);

    $response = "HTTP/1.1 101 Switching Protocols\r\n";
    $response .= "Upgrade: websocket\r\n";
    $response .= "Sec-WebSocket-Version: 13\r\n";
    $response .= "Connection: Upgrade\r\n";
    $response .= "Sec-WebSocket-Accept: {$new_key}\r\n\r\n";

    // 发送握手数据
    socket_write($conn_sock, $response);

    // 新增内容，获取客户端发送的消息并转为大写还给客户端
    $msg = socket_read($conn_sock, 102400);
    socket_write($conn_sock, encode(strtoupper(decode($msg))));
}

function getShaKey($request)
{
    // 获取 Sec-WebSocket-key
    preg_match("/Sec-WebSocket-Key: (.*)\r\n/", $request, $match);

    // 拼接 key + 258EAFA5-E914-47DA-95CA-C5AB0DC85B11
    $new_key = trim($match[1]).'258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    // 对字符串做 `SHA1` 计算，再把得到的结果通过 `base64` 加密
    return base64_encode(sha1($new_key, true));
}

/**
 * @Desc: websocket 解密内容
 * @param $buffer
 * @return int
 * @author: Administrator - virus
 * @Time: 2022/6/23 10:39
 */
function decode($buffer)
{
    $len = \ord($buffer[1]) & 127;
    if ($len === 126) {
        $masks = \substr($buffer, 4, 4);
        $data = \substr($buffer, 8);
    } else {
        if ($len === 127) {
            $masks = \substr($buffer, 10, 4);
            $data = \substr($buffer, 14);
        } else {
            $masks = \substr($buffer, 2, 4);
            $data = \substr($buffer, 6);
        }
    }
    $dataLength = \strlen($data);
    $masks = \str_repeat($masks, \floor($dataLength / 4)).\substr($masks, 0, $dataLength % 4);

    return $data ^ $masks;
}

/**
 * @Desc: websocket 加密内容
 * @param $buffer
 * @return string
 * @throws Exception
 * @author: Administrator - virus
 * @Time: 2022/6/23 10:39
 */
function encode($buffer)
{
    if (!is_scalar($buffer)) {
        throw new \Exception("You can't send(".\gettype($buffer).") to client, you need to convert it to a string. ");
    }
    $len = \strlen($buffer);

    $first_byte = "\x81";

    if ($len <= 125) {
        $encode_buffer = $first_byte.\chr($len).$buffer;
    } else {
        if ($len <= 65535) {
            $encode_buffer = $first_byte.\chr(126).\pack("n", $len).$buffer;
        } else {
            $encode_buffer = $first_byte.\chr(127).\pack("xxxxN", $len).$buffer;
        }
    }

    return $encode_buffer;
}
```
