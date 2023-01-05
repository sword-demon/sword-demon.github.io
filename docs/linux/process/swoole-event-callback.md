---
title: Swoole事件回调
date: 2023-01-05 21:02:10
category: Process
tag:
    - Swoole
    - Event
---

# Swoole 事件回调

`Swoole\Server`是事件驱动模式，所有的业务逻辑代码必须写在事件回调函数中。当特定的网络事件发生后，底层会主动回调指定的`PHP`函数。

## 事件执行顺序

文档地址：[https://wiki.swoole.com/#/server/events?id=%e4%ba%8b%e4%bb%b6](https://wiki.swoole.com/#/server/events?id=%e4%ba%8b%e4%bb%b6)

-   所有事件回调均在`Server start`后发生
-   服务器关闭终止时最后一次事件是`onShutdown`
-   服务器启动成功后，`onStart/onManagerStart/onWorkerStart`会并发执行
-   `onReceive/onConnect/onClose`在`worker`进程中触发
-   `Worker/Task`进程启动和结束会分别调用`onWorkerStart/onWorkerStop`；`onTask`事件仅在`task`进程中发生，`onFinish`事件仅在`worker`进程中发生。

```php
<?php

$serv = new Swoole\Server("0.0.0.0", 9506, SWOOLE_PROCESS, SWOOLE_SOCK_TCP);

$serv->set([
    'worker_num' => 2,
]);

$serv->on('Start', function (\Swoole\Server $server) {

});

$serv->on('ManagerStart', function (\Swoole\Server $server) {
    // 触发时说明 task 和 worker 进程已创建，master 状态不明，manager 与 master 是并行的
});

$serv->on('WorkerStart', function (\Swoole\Server $server, int $workerId) {
    // 进程全局期
    // 子进程存货周期之内，是常驻内存的，进程期 include 的文件在 reload 之后就会重新加载
});

$serv->on('ManagerStop', function (\Swoole\Server $server) {
    // 触发时说明 task 和 worker 进程已结束运行，已被 manager 进程回收
});

$serv->on('WorkerStop', function (\Swoole\Server $server, int $workerId) {
    echo "worker stop\n";
});

// worker/task 进程发生异常后会在 manager 进程中回调
$serv->on('WorkerError', function (\Swoole\Server $server, int $workerId, int $workerPid, int $exitCode, int $sign) {
    // 用于报警和监控，遇到进程异常退出提示开发者进行处理
});

// 实际开启 reload_async 之后，杀死 worker 进程并不会回调输出
$serv->on('WorkerExit', function (\Swoole\Server $server, int $workerId) {
    echo "worker exit\n";
});

$serv->on('Connect', function (\Swoole\Server $server, int $fd, int $reactorId) {
    echo "onConnect\n";
    // 3. 会话期
    // 会话期是在 onConnect 后创建，或者在第一次 onReceive 时创建，onClose 时销毁
    // 一个客户端连接进入后，创建的对象会常驻内存，直到此客户端离开才会销毁
});

// 发生在 worker 进程中
$serv->on('Receive', function (\Swoole\Server $server, int $fd, int $reactorId, string $data) {
    echo "onReceive\n";
    // 4. 请求期间
    // onReceive 收到请求开始处理请求，直到返回结果发送 response 周期内创建的对象在请求完成后销毁
});

// 发生在 worker 进程中
$serv->on('Close', function (\Swoole\Server $server, int $fd, int $reactorId) {
    // tcp 客户端连接关闭后，worker 进程中回调
    // 服务器主动关闭时，reactorId 会设为-1 可以通过判断 < 0 分辨关闭是由哪一端发起
    echo "onClose\n";
});

// 发生在 worker 进程中
$serv->on('Packet', function (\Swoole\Server $server, string $data, array $clientInfo) {
    // 接收到 UDP 数据包时回调此函数
    echo "onPacket\n";
});

// Http Server 不接受 onConnect、onReceive 事件回调，取而代之的是 onRequest事件类型
$serv->on('Request', function (Swoole\Http\Request $request, Swoole\Http\Response $response) {
    // 4. 请求期
    // 使用携程后事件回调函数将会并发地执行
    // 携程是一种用户态线程实现，没有额外的调度消耗，仅占用内存
    // 使用携程模式，可以理解为"每次事件回调函数都会创建一个新的线程去执行，事件回调函数执行完成后，线程退出"
    if ($request->server['path_info'] == '/favicon.ico' || $request->server['request_uri'] == '/favicon.ico') {
        $response->end();
        return;
    }
    var_dump($request->get, $request->post);
    $response->header('Content-Type', 'text/html; charset=utf-8');
    $response->end('<h1>Hello Swoole. #' . rand(1000, 9999) . '</h1>');
});

// worker/task进程收到由 sendMessage 发生的管道消息时会触发
$serv->on('PipeMessage', function (\Swoole\Server $server, int $srcWorkerId, $message) {

});

// 仅在 task 进程中发生
// v4.2.12起，如果开启 task_enable_coroutine 则回调函数原型是
//function (\Swoole\Server $server, \Swoole\Server\Task $task) {
//    $task->worker_id, $task->id, $task->flags, $task->data, $task->finish([123, 'hello']);
//}
$serv->on('Task', function (\Swoole\Server $server, int $taskId, int $srcWorkerId, $data) {
    // $taskID 和 $srcWorkerId 组合起来才是全局唯一的
    // 可以通过 $server->finish($response) 或者  return '' 来触发 onFinish 事件
    // 如果 worker 不关心任务执行结果，不需要 return 或 finish
});

// 仅在 worker 进程中发生
$serv->on('Finish', function (\Swoole\Server $server, int $taskId, string $data) {

});

// 调用事件前，底层已销毁所有进程、线程、监听端口
// 强制 kill 和 ctrl + c 进程不会回调，需要 kill -TERM
$serv->on('Shutdown', function (\Swoole\Server $server) {

});

$serv->start();
```
