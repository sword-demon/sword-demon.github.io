---
title: Workerman Websocket Demo
date: 2022-06-29 23:58:10
category: Socket
tag:
    - workerman
    - Websocket
---

```php
<?php

date_default_timezone_set("PRC");

use Workerman\Connection\TcpConnection;
use Workerman\Worker;
use Workerman\Timer;

require_once __DIR__.'/workerman/vendor/autoload.php';

use Workerman\Crontab\Crontab;

function curl($url, $post = [], $type = 1, $header = [])
{
    $ch = curl_init();
    $_header = [];
    if ($header) {
        foreach ($header as $key => $val) {
            $_header[] = "{$key}:{$val}";
        }
    }
    if ($_header) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $_header);               // 加入header
    }
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, FALSE);
    if (strpos($url, 'https') !== FALSE) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    }
    if (!empty($post)) {
        curl_setopt($ch, CURLOPT_POST, TRUE);
        if ($type == 1) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        } else {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
        }
    }
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $output = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);//获取http返回值,最后一个收到的HTTP代码
    if ($output == false) {
        echo "status: ".$status.PHP_EOL;
        echo "curl error no: ".curl_errno($ch).PHP_EOL;
        echo "curl_error".curl_errno($ch).PHP_EOL;
    }
    curl_close($ch);
    return $output;
}

$ws_worker = new Worker('websocket://0.0.0.0:8080');
$ws_worker->count = 1;

// 连接建立时给对应连接设置定时器
$ws_worker->onConnect = function (TcpConnection $connection) {
    // 每10秒执行一次
    $connection->send(json_encode(['status' => 1, 'msg' => '连接成功']));
};

$ws_worker->onMessage = function (TcpConnection $connection, $data) {
    $recv_data = json_decode($data, true);
    $connection->send(json_encode(['status' => 1, 'msg' => $recv_data['switch'] == 1 ? '开启发送消息': '关闭发送消息']));
    if (isset($recv_data['switch']) && $recv_data['switch'] == 2) {
        // 删除定时器
        Timer::del($connection->timer_id);
    } else {
        $time_interval = 1;
        // 给connection对象临时添加一个timer_id属性保存定时器id
        $connection->timer_id = Timer::add(
            $time_interval,
            function ($connection) {
                $res = curl("http://127.0.0.1/Auto/autoSend");
                $connection->send(json_encode(['status' => 1, 'msg' => $res]));
            },
            array($connection)
        );
    }
};

// 连接关闭时，删除对应连接的定时器
$ws_worker->onClose = function (TcpConnection $connection) {
    // 删除定时器
    Timer::del($connection->timer_id);
};

// 运行worker
Worker::runAll();


```

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>websocket</title>
        <link rel="stylesheet" href="tailwind.min.css" />
        <style>
            body {
                font-family: 'SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
                padding: 20px 20px 60px;
                max-width: 680px;
                margin: 0 auto;
            }
        </style>
    </head>
    <body>
        <h1 class="text-4xl text-green-700 text-center font-semibold">WebSocket 管理定时任务的启动和关闭</h1>
        <div id="app" class="mt-5">
            <form>
                <button class="bg-indigo-700 font-semibold text-white py-2 px-4 rounded" @click.prevent="connect" type="button">连接</button>
                <button class="bg-indigo-700 font-semibold text-white py-2 px-4 rounded mt-3" @click.prevent="startSendData" type="button">
                    开启服务端消息发送
                </button>
                <button class="bg-indigo-700 font-semibold text-white py-2 px-4 rounded mt-3" @click.prevent="closeSendData" type="button">
                    关闭服务端消息发送
                </button>
            </form>

            <ul class="bg-blue-200 mt-3 h-screen">
                <li v-for="item in messages" :key="item.index">{{item.msg}}</li>
            </ul>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
        <script type="text/javascript">
            function get(key) {}

            function set(key, value, expire) {}

            var app = new Vue({
                el: '#app',
                data: {
                    websocket: null,
                    messages: [
                        {
                            status: 0,
                            msg: '',
                        },
                    ],
                },
                created() {
                    // this.initWebSocket();
                },
                destroyed() {
                    this.websocket.close()
                },
                methods: {
                    initWebSocket() {
                        //初始化weosocket
                        const url = 'ws://127.0.0.1:8080'
                        this.websock = new WebSocket(url)
                        this.websock.onopen = this.websocketOnOpen
                        this.websock.onmessage = this.websocketOnMessage
                        this.websock.onerror = this.websocketOnError
                        this.websock.onclose = this.websocketClose
                    },
                    websocketOnOpen() {
                        //连接建立之后执行send方法发送数据
                        this.messages.push({
                            status: 1,
                            msg: '连接成功',
                        })
                    },
                    websocketOnError() {
                        //连接建立失败重连
                        this.initWebSocket()
                    },
                    websocketOnMessage(e) {
                        //数据接收
                        const recv_data = JSON.parse(e.data)
                        console.log(recv_data)
                        if (recv_data.status === 1) {
                            this.messages.push(recv_data)
                        }
                    },
                    websocketSend(Data) {
                        //数据发送
                        this.websock.send(Data)
                    },
                    websocketClose(e) {
                        //关闭
                        console.log('断开连接', e)
                        this.messages = []
                        this.messages.push({
                            status: 0,
                            msg: '暂无连接',
                        })
                    },
                    closeSendData() {
                        let message = { switch: 2 }
                        this.websocketSend(JSON.stringify(message))
                    },
                    startSendData() {
                        let message = { switch: 1 }
                        this.websocketSend(JSON.stringify(message))
                    },
                    connect() {
                        this.initWebSocket()
                    },
                },
            })
        </script>
    </body>
</html>
```
