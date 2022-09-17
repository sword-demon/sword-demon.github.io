---
title: swoole 进程基础
date: 2022-09-17 22:20:10
category: Process
tag:
    - process
    - swoole
---

# swoole 进程基础

## 认识进程和设置进程名称

在`php-cli`模式运行下，如果没有设置死循环，对应的代码执行完进程就结束了。所以我们可以加个死循环，短暂查看一下进程的信息。

```php
<?php

echo "当前进程ID: ".posix_getpid();

while (1) {
    sleep(1);
}
```

```bash
[root@jb51 process]# php c1.php
当前进程ID: 13965

```

```bash
[root@jb51 process]# ps -ef | grep php
root     13965 11931  0 15:04 pts/1    00:00:00 php c1.php
root     14065 12165  0 15:04 pts/2    00:00:00 grep --color=auto php

```

通过`ps`命令也可以看到对应的进程存在，进程`pid`就是`13965`，进程名称就是它执行的名称：`php c1.php`，我们也可以对它进行改名称。

```php
<?php

echo "当前进程ID: ".posix_getpid();
cli_set_process_title("my_process");

while (1) {
    sleep(1);
}
```

使用`php`内置的设置进程名称的函数，虽然`swoole`也有

-   `php`内置函数文档地址：[https://www.php.net/manual/zh/function.cli-set-process-title.php](https://www.php.net/manual/zh/function.cli-set-process-title.php)
-   `swoole`设置进程名称的文档地址：[https://wiki.swoole.com/#/functions?id=swoole_set_process_name](https://wiki.swoole.com/#/functions?id=swoole_set_process_name)

:::danger 注意

`swoole`文档说此函数与 PHP5.5 提供的 [cli_set_process_title](https://www.php.net/manual/zh/function.cli-set-process-title.php) 功能是相同的。但 `swoole_set_process_name` 可用于 PHP5.2 之上的任意版本。`swoole_set_process_name` 兼容性比 `cli_set_process_title` 要差，如果存在 `cli_set_process_title` 函数则优先使用 `cli_set_process_title`。

:::

所以我们一般还是使用`php`内置的函数`cli_set_process_title`

```bash
[root@jb51 process]# php c1.php
当前进程ID: 14988

```

```bash
[root@jb51 process]# ps -ef | grep my_process
root     14988 11931  0 15:08 pts/1    00:00:00 my_process
root     15020 12165  0 15:08 pts/2    00:00:00 grep --color=auto my_process
```

这里的`11931`是它对应的父进程，就是这个我们可以看到的终端`bash`的进程

```bash
[root@jb51 process]# ps -ef | grep 11931
root     11931 11785  0 14:55 pts/1    00:00:00 -bash
root     14988 11931  0 15:08 pts/1    00:00:00 my_process
root     15348 12165  0 15:09 pts/2    00:00:00 grep --color=auto 11931

```

不过有的时候也不一定是`bash`有的时候使用`docker`环境的话，进入的终端设备可能是`sh`，不过这个看情况可以自己看到。

## 创建子进程、获取子进程 PID 和回收子进程

`swoole`文档地址：[https://wiki.swoole.com/#/process/process?id=process](https://wiki.swoole.com/#/process/process?id=process)

```php
<?php

echo "当前进程ID: ".posix_getpid().PHP_EOL;
cli_set_process_title("my_process");

$child = new \Swoole\Process(function () {
    echo "我是一个子进程, PID=".posix_getpid().PHP_EOL;
});

$child->start();

// 死循环：主进程肯定不会退出的
while (1) {
    sleep(1);
}
```

```bash
[root@jb51 process]# php c1.php
当前进程ID: 17924
我是一个子进程, PID=17925

```

```bash
[root@jb51 process]# ps -ef | grep my_process
root     17924 11931  0 15:20 pts/1    00:00:00 my_process
root     17980 12165  0 15:20 pts/2    00:00:00 grep --color=auto my_process
[root@jb51 process]# ps -ef | grep php
root     17925 17924  0 15:20 pts/1    00:00:00 [php] <defunct>

```

第一个查看主进程的信息，第二个查看子进程的信息，`[php] <defunct>`这个子进程已经变成了僵尸进程，因为在上面代码里，一句话就执行完成了，没有进行回收，我们需要使用`Process::wait()`函数去回收结束运行的子进程。

代码改进

```php
<?php

echo "当前进程ID: ".posix_getpid().PHP_EOL;
cli_set_process_title("my_master");

$child = new \Swoole\Process(function () {
    cli_set_process_title("my_child");
    echo "我是一个子进程, PID=".posix_getpid().PHP_EOL;
});

$child->start();

\Swoole\Process::wait();

// 死循环：主进程肯定不会退出的
while (1) {
    sleep(1);
}
```

此时再次运行的时候，你是看不到子进程的信息了，因为已经运行结束被主进程回收掉了。

```bash
[root@jb51 process]# php c1.php
当前进程ID: 18905
我是一个子进程, PID=18906


[root@jb51 process]# ps -ef | grep my_process
root     18931 12165  0 15:24 pts/2    00:00:00 grep --color=auto my_process
[root@jb51 process]# ps -ef | grep php
root     18975 12165  0 15:24 pts/2    00:00:00 grep --color=auto php

```

当然父进程依然是可以看到的。

---

如果想看到子进程的消息，我们还是写一个死循环，让子进程不退出即可。

```php
<?php

echo "当前进程ID: ".posix_getpid().PHP_EOL;
cli_set_process_title("my_master");

// 进程创建成功会执行里面的回调函数
$child = new \Swoole\Process(function () {
    cli_set_process_title("my_child");
    echo "我是一个子进程, PID=".posix_getpid().PHP_EOL;
    // 写个死循环，让进程不退出
    while (1) {
        sleep(1);
    }
});

$child->start();

\Swoole\Process::wait();

// 死循环：主进程肯定不会退出的
while (1) {
    sleep(1);
}
```

```bash
[root@jb51 process]# php c1.php
当前进程ID: 19599
我是一个子进程, PID=19600

```

```bash
[root@jb51 process]# ps -ef | grep my_child
root     19600 19599  0 15:26 pts/1    00:00:00 my_child
root     19726 12165  0 15:27 pts/2    00:00:00 grep --color=auto my_child

```

这里可以看到子进程`my_child`的父 PID`19599`就是上面输出的主进程的 PID。

## 重定向子进程的标准输入输出，父进程获取子进程的数据

这一步需要使用到`swoole`的`Process`类的构造方法里的第二个参数

-   **`bool $redirect_stdin_stdout`**
    -   **功能**：重定向子进程的标准输入和输出。【启用此选项后，在子进程内输出内容将不是打印屏幕，而是写入到主进程管道。读取键盘输入将变为从管道中读取数据。默认为阻塞读取。参考 [exec()](https://wiki.swoole.com/#/process/process?id=exec) 方法内容】
    -   **默认值**：无
    -   **其它值**：无

可以在主进程里使用对应的`read`方法到主进程的管道内进行读取数据。

```php
<?php

echo "当前进程ID: ".posix_getpid().PHP_EOL;
cli_set_process_title("my_master");

$child = new \Swoole\Process(function () {
    cli_set_process_title("my_child");
    echo "my name is: ";
    // 写个死循环，让进程不退出
    while (1) {
        sleep(1);
    }
}, true);

$child->start();

echo $child->read()."无解";

\Swoole\Process::wait();

// 死循环：主进程肯定不会退出的
while (1) {
    sleep(1);
}
```

```bash
[root@jb51 process]# php c1.php
当前进程ID: 22878
my name is: 无解
```

如果把输出内容放到循环里去输出，下面`read`只能获取到一次

```php
<?php

echo "当前进程ID: ".posix_getpid().PHP_EOL;
cli_set_process_title("my_master");

$child = new \Swoole\Process(function () {
    cli_set_process_title("my_child");
//    echo "我是一个子进程, PID=".posix_getpid().PHP_EOL;
    // 写个死循环，让进程不退出
    while (1) {
        echo "my name is: ";
        sleep(1);
    }
}, true);

$child->start();

echo $child->read()."无解";

\Swoole\Process::wait();

// 死循环：主进程肯定不会退出的
while (1) {
    sleep(1);
}
```

```bash
[root@jb51 process]# php c1.php
当前进程ID: 23014
my name is: 无解

```

如果将读取内容放到`wait`下方，那就什么内容都读取不到

```php
\Swoole\Process::wait();
echo $child->read()."无解";
```

可以查看我们的`wait`文档：[https://wiki.swoole.com/#/process/process?id=wait](https://wiki.swoole.com/#/process/process?id=wait)

`wait`函数参数：`Swoole\Process::wait(bool $blocking = true): array|false`，默认是阻塞的，注意文档的提示内容

> 每个子进程结束后，父进程必须都要执行一次 `wait()` 进行回收，否则子进程会变成僵尸进程，会浪费操作系统的进程资源。
> 如果父进程有其他任务要做，没法阻塞 `wait` 在那里，父进程必须注册信号 `SIGCHLD` 对退出的进程执行 `wait`。
> SIGCHILD 信号发生时可能同时有多个子进程退出；必须将 `wait()` 设置为非阻塞，循环执行 `wait` 直到返回 `false`。

```php
<?php

echo "当前进程ID: ".posix_getpid().PHP_EOL;
cli_set_process_title("my_master");

$child = new \Swoole\Process(function () {
    cli_set_process_title("my_child");
//    echo "我是一个子进程, PID=".posix_getpid().PHP_EOL;
    // 写个死循环，让进程不退出
    while (1) {
        echo "my name is: ";
        sleep(1);
    }
}, true);

$child->start();

\Swoole\Process::wait(false);

// 死循环：主进程肯定不会退出的
while (1) {
    echo $child->read()."无解".PHP_EOL;
    sleep(1);
}
```

读取代码放到`wait`上方是无所谓的，此时将`wait`方法设置为不阻塞，放到下方会接收到一个值，如果放到循环里，则会不断的读取数据。

```bash
[root@jb51 process]# php c1.php
当前进程ID: 23990
my name is: 无解
my name is: 无解
my name is: 无解
^C

```

## 多个子进程的回收以及信号入门

> SIGCHILD 信号发生时可能同时有多个子进程退出；必须将 `wait()` 设置为非阻塞，循环执行 `wait` 直到返回 `false`。

简单造 2 个子进程进行运行，第二个子进程没有设置死循环，运行后会直接结束，直接结束，会导致主进程的退出，所以第一个子进程就会变成僵尸进程，父进程就成了系统的进程 ID 为 0

```php
<?php

use Swoole\Process;

echo "当前进程ID: ".posix_getpid().PHP_EOL;
cli_set_process_title("my_master");

$child1 = new Process(function () {
    cli_set_process_title("my_child1");
    while (1) {
        sleep(1);
    }
}, true);

$child1->start();

$child2 = new Process(function () {
    cli_set_process_title("my_child2");
}, true);

$child2->start();

Process::wait();

```

```bash
[root@jb51 process]# php c1.php
当前进程ID: 26098

# 主进程运行完有子进程退出导致父进程也直接退出
```

```bash
[root@jb51 process]# ps -ef
UID        PID  PPID  C STIME TTY          TIME CMD
root     26099     1  0 15:53 pts/1    00:00:00 my_child1
root     26214 26040  0 15:53 pts/2    00:00:00 ps -ef

```

### 解决方式

1.  循环处理

    ```php
    <?php

    use Swoole\Process;

    echo "当前进程ID: ".posix_getpid().PHP_EOL;
    cli_set_process_title("my_master");

    $child1 = new Process(function () {
        cli_set_process_title("my_child1");
        while (1) {
            sleep(1);
        }
    });

    $child1->start();

    $child2 = new Process(function () {
        cli_set_process_title("my_child2");
    });

    $child2->start();

    // 多少个子进程就多少次循环去回收子进程
    for ($i = 0; $i < 2; $i++) {
        Process::wait();
    }

    ```

2.  使用`swoole`文档提供的信号进行处理

    文档示例：

    ```php
    Swoole\Process::signal(SIGCHLD, function ($sig) {
        // 必须为false，非阻塞模式
        while ($ret = Swoole\Process::wait(false)) {
            echo "PID={$ret['pid']}\n";
        }
    });

    ```

    信号最简单的例子：就是我们不是守护进程运行的程序死循环一直运行的时候，我们按下`ctrl + c`就可以停止进程；这就是信号。

    > 信号是进程间通信机制中唯一的异步通信机制，一个进程不必通过任何操作来等待信号的到达，事实上，进程也不知道信号到底什么时候到达。进程之间可以互相通过系统调用`kill`发送软中断信号。

    Linux 信号列表：[https://wiki.swoole.com/#/other/signal](https://wiki.swoole.com/#/other/signal)

    `ctrl + c `对应了信号值为 2，即来自键盘的中断信号。

    ```php
    <?php

    use Swoole\Process;

    echo "当前进程ID: ".posix_getpid().PHP_EOL;
    cli_set_process_title("my_master");

    $child1 = new Process(function () {
        cli_set_process_title("my_child1");
        while (1) {
            sleep(1);
        }
    });

    $child1->start();

    $child2 = new Process(function () {
        cli_set_process_title("my_child2");
    });

    $child2->start();

    Process::signal(SIGCHLD, function ($sig) {
        // 必须为false，非阻塞模式
        while ($ret = Process::wait(false)) {
            var_dump($ret);
        }
    });


    ```

    这里子进程 2 可能会退出的比较快，可能看不到打印的内容。

## 在子进程中运行 httpserver 并修改对应的进程名称

`swoole`文档地址：[https://wiki.swoole.com/#/http_server](https://wiki.swoole.com/#/http_server)

服务端事件[https://wiki.swoole.com/#/server/events](https://wiki.swoole.com/#/server/events)

```php
<?php

use Swoole\Process;

echo "当前进程ID: ".posix_getpid().PHP_EOL;
cli_set_process_title("my_main");

$child1 = new Process(function () {
    $http = new \Swoole\Http\Server("0.0.0.0", "8081");
    $http->set([
        'worker_num' => 1, // 1个进程
    ]);
    $http->on('request', function ($req, $resp) {
        $resp->end('myhttp');
    });
    $http->on('start', function ($server) {
        cli_set_process_title("my_master");
    });
    $http->on('managerstart', function ($server) {
        cli_set_process_title("my_managerstart");
    });
    $http->on('workerstart', function ($server) {
        cli_set_process_title("my_workerstart");
    });
    $http->start();
});

$child1->start();

Process::signal(SIGCHLD, function ($sig) {
    // 必须为false，非阻塞模式
    while ($ret = Process::wait(false)) {
        var_dump($ret);
    }
});


```

```bash
[root@jb51 process]# php c1.php
当前进程ID: 6300

```

```bash
[root@jb51 process]# ps -ef | grep my_
root      5994     1  0 18:56 pts/1    00:00:00 my_workerstart
root      6301     1  0 18:58 pts/1    00:00:00 my_master
root      6302  6301  0 18:58 pts/1    00:00:00 my_managerstart
root      6309  6302  0 18:58 pts/1    00:00:00 my_workerstart
root      6398  5905  0 18:58 pts/0    00:00:00 grep --color=auto my_

```

## 场景练习：监控文件变动

```php
<?php

use Swoole\Process;

echo "当前进程ID: " . posix_getpid() . PHP_EOL;
cli_set_process_title("my_main");

$child1 = new Process(function () {
    cli_set_process_title("my_child");
    $watchFile = __DIR__ . '/tmp/db.conf';
    $watchFile_md5 = md5_file($watchFile); // 计算文件的MD5值
    while (1) {
        sleep(3);
        $getMd5File = md5_file($watchFile);
        if (strcmp($watchFile_md5, $getMd5File) !== 0) {
            // 代表文件被修改了
            echo "文件被修改了".date("Y-m-d H:i:s", time()).PHP_EOL;
            $watchFile_md5 = $getMd5File;
        }
    }
});

$child1->start();

Process::signal(SIGCHLD, function ($sig) {
    // 必须为false，非阻塞模式
    while ($ret = Process::wait(false)) {
        var_dump($ret);
    }
});

```

```bash
[root@jb51 process]# php c1.php
当前进程ID: 23891
[root@jb51 process]# 文件被修改了2022-09-17 20:10:12
文件被修改了2022-09-17 20:10:21

```

## 场景练习：MySQL 建议巡检监控

简易监控指标：

1.  连接是否正常(`select 1`)
2.  查询连接数(`show PROCESSLIST`、`select count(*) from information_schema.processlist`)
3.  查询线程使用情况(`select * from information_schema.GLOBAL_STATUS where Variable_name like 'Thread%'`)
    1.  `Thread_cached`：线程池中还有多少可以被复用的线程
    2.  `Thread_connected`：和`show processlist`一样
    3.  `Thread_created`：新创建的线程
    4.  `Thread_running`：正在运行的连接(非`sleep`)

需要`swoole=4.3.x`

> 从 MySQL5.7.6 开始`information_schema.GLOBAL_STATUS`已经开始被舍弃，为了兼容性，此时需要打开`show_compatibility_56`

```sql
mysql>  show variables like '%show_compatibility_56%';  # 查看show_compatibility_56%的开关
+-----------------------+-------+
| Variable_name         | Value |
+-----------------------+-------+
| show_compatibility_56 | OFF   |
+-----------------------+-------+
1 row in set (0.01 sec)
mysql> set global show_compatibility_56=on;  # 打开show_compatibility_56的开关
Query OK, 0 rows affected (0.00 sec)

mysql>  show variables like '%show_compatibility_56%';
+-----------------------+-------+
| Variable_name         | Value |
+-----------------------+-------+
| show_compatibility_56 | ON    |
+-----------------------+-------+
1 row in set (0.01 sec)
```

`set global show_compatibility_56=on;`需要以`root`权限最大的进行设。

代码实现：

```php
<?php

use Swoole\Process;
use Swoole\Coroutine\MySQL;

echo "当前进程ID: " . posix_getpid() . PHP_EOL;
cli_set_process_title("my_main");

$child1 = new Process(function () {
    cli_set_process_title("my_child");
    $mysql = new MySQL();
    $conn = $mysql->connect(['host' => '127.0.0.1', 'user' => 'user', 'password' => '自己的数据库密码', 'database' => 'information_schema']);
    $checkConnection = "select 1";
    $checkProcessCheck = "select count(*) as c from information_schema.processlist";
    $checkThread = "select * from information_schema.GLOBAL_STATUS where Variable_name like 'Thread%'";

    while (true) {
        $checkResult[] = date('Y-m-d H:i:s');
        try {
            $mysql->query($checkConnection);
            $checkResult[] = "检查连接正常";
            $res = $mysql->query($checkProcessCheck);
            $checkResult[] = "当前连接数:" . $res[0]['c'];
            $res = $mysql->query($checkThread);
            $checkResult[] = "检查线程情况";
            foreach ($res as $row) {
                foreach ($row as $key => $value) {
                    $checkResult[] = $key . ":" . $value;
                }
            }
            $checkResult[] = "-------------------------------";

            echo implode(PHP_EOL, $checkResult);
        } catch (\Exception $e) {
            echo $e->getMessage().PHP_EOL;
        }
        sleep(5);
    }
}, false, 0, true);

$child1->start();

Process::signal(SIGCHLD, function ($sig) {
    // 必须为false，非阻塞模式
    while ($ret = Process::wait(false)) {
        var_dump($ret);
    }
});

```

```bash
-------------------------------
2022-09-17 20:39:27
检查连接正常
当前连接数:1
检查线程情况
VARIABLE_NAME:THREADS_CACHED
VARIABLE_VALUE:2
VARIABLE_NAME:THREADS_CONNECTED
VARIABLE_VALUE:1
VARIABLE_NAME:THREADS_CREATED
VARIABLE_VALUE:3
VARIABLE_NAME:THREADS_RUNNING
VARIABLE_VALUE:1
-------------------------------2022-09-17 20:39:17

```

运行完了，别忘了杀掉这个子进程。

## 多进程监控 x 表数据，父子进程通信

旧版文档有`write`和`read`的相关文档内容：[https://wiki.swoole.com/wiki/page/216.html](https://wiki.swoole.com/wiki/page/216.html)

```php
<?php

use Swoole\Process;
use Swoole\Coroutine\MySQL;

echo "当前进程ID: " . posix_getpid() . PHP_EOL;
cli_set_process_title("my_main");

$child1 = new Process(function (Process $p) {
    cli_set_process_title("my_child");
    $mysql = new MySQL();
    $conn = $mysql->connect(['host' => '127.0.0.1', 'user' => 'user', 'password' => 'yourpassword', 'database' => 'yourdatabase']);

    while (true) {
        $sql = "select * from orders where status = 0 order by id desc limit 0, 1";
        $rows = $mysql->query($sql);
        if ($rows && count($rows) == 1) {
            // 向主进程发送一个消息
            $p->write($rows[0]['order_user']);
        }
        sleep(3);
    }
    // 需要设置流类型管道 pipe_type: 1 不然无法和主进程发送消息
}, false, 1, true);

$child1->start();

$child2 = new Process(function (Process $p) {
    while (true) {
        usleep(0.5 * 1000 * 1000);
        $getMsg = $p->read();
        if ($getMsg) {
            echo "进程2得到报警消息: " . $getMsg . PHP_EOL;
        }
    }
});

$child2->start();

while (true) {
    // 每次读取不超过64k
    $getMsg = $child1->read();
    if ($getMsg) {
        $child2->write($getMsg); // 向子进程 child2 发送消息
    }
    usleep(0.5 * 1000 * 1000);
}

Process::signal(SIGCHLD, function ($sig) {
    // 必须为false，非阻塞模式
    while ($ret = Process::wait(false)) {
        var_dump($ret);
    }
});


```

## 多进程监控 x 表数据，队列通信

还是使用旧版的文档里有相关函数介绍：[https://wiki.swoole.com/wiki/page/289.html](https://wiki.swoole.com/wiki/page/289.html)

```php
<?php

use Swoole\Process;
use Swoole\Coroutine\MySQL;

echo "当前进程ID: " . posix_getpid() . PHP_EOL;
cli_set_process_title("my_main");

$child1 = new Process(function (Process $p) {
    cli_set_process_title("my_child");
    $mysql = new MySQL();
    $conn = $mysql->connect(['host' => '127.0.0.1', 'user' => '', 'password' => '', 'database' => '']);

    while (true) {
        $sql = "select order_user from orders where status = 0 order by id desc limit 0, 1";
        $rows = $mysql->query($sql);
        if ($rows && count($rows) == 1) {
            // 向主进程发送一个消息
            $p->push($rows[0]['order_user']);
        }
        sleep(3);
    }
    // 需要设置流类型管道 pipe_type: 1 不然无法和主进程发送消息
}, false, 1, true);

$child1->useQueue(2);
$child1->start();

$child2 = new Process(function (Process $p) {
    while (true) {
        usleep(0.5 * 1000 * 1000);
        $getMsg = $p->pop(); // 从队列里弹出一个消息 没有数据会阻塞
        if ($getMsg) {
            echo "进程2队列得到报警消息: " . $getMsg . PHP_EOL;
        }
    }
});
// key 一样
$child2->useQueue(2);
$child2->start();

Process::signal(SIGCHLD, function ($sig) {
    // 必须为false，非阻塞模式
    while ($ret = Process::wait(false)) {
        var_dump($ret);
    }
});

```

```bash
[root@jb51 process]# php c1.php
当前进程ID: 17515
[root@jb51 process]# 进程2队列得到报警消息: 没有收到设备数据大于60分钟
进程2队列得到报警消息: 没有收到设备数据大于60分钟
进程2队列得到报警消息: 没有收到设备数据大于60分钟
进程2队列得到报警消息: 没有收到设备数据大于60分钟
进程2队列得到报警消息: 没有收到设备数据大于60分钟

```

再添加一个进程来查看是否争抢消息；这里其实还是不安全的，如果取数据之后处理的业务比较耗时，下一个消息又发过来了，就会出现问题，还是需要加上一个`redis`锁来保证消费数据业务的时候安全。

```php
<?php

use Swoole\Process;
use Swoole\Coroutine\MySQL;

echo "当前进程ID: " . posix_getpid() . PHP_EOL;
cli_set_process_title("my_main");

$child1 = new Process(function (Process $p) {
    cli_set_process_title("my_child");
    $mysql = new MySQL();
    $conn = $mysql->connect(['host' => '127.0.0.1', 'user' => '', 'password' => '', 'database' => '']);

    $offset = 0;
    while (true) {
        $sql = "select order_user from orders where status = 0 order by id desc limit $offset, 1";
        $rows = $mysql->query($sql);
        if ($rows && count($rows) == 1) {
            // 向主进程发送一个消息
            $p->push($rows[0]['order_user']);
            $offset++;
        }
        sleep(3);
    }
    // 需要设置流类型管道 pipe_type: 1 不然无法和主进程发送消息
}, false, 1, true);

$child1->useQueue(2);
$child1->start();

$child2 = new Process(function (Process $p) {
    while (true) {
        usleep(0.5 * 1000 * 1000);
        $getMsg = $p->pop(); // 从队列里弹出一个消息 没有数据会阻塞
        if ($getMsg) {
            echo "进程2从队列得到报警消息: " . $getMsg . PHP_EOL;
        }
    }
});
// key 一样
$child2->useQueue(2);
$child2->start();

$child3 = new Process(function (Process $p) {
    while (true) {
        usleep(0.5 * 1000 * 1000);
        $getMsg = $p->pop(); // 从队列里弹出一个消息 没有数据会阻塞
        if ($getMsg) {
            echo "进程3从队列得到报警消息: " . $getMsg . PHP_EOL;
        }
    }
});
// key 一样
$child3->useQueue(2);
$child3->start();

Process::signal(SIGCHLD, function ($sig) {
    // 必须为false，非阻塞模式
    while ($ret = Process::wait(false)) {
        var_dump($ret);
    }
});

```

```bash
程3从队列得到报警消息: 没有收到设备数据大于60分钟
进程2从队列得到报警消息: 没有收到设备数据大于30分钟
进程3从队列得到报警消息: 治疗事件报警
进程2从队列得到报警消息: 除颤完成警告
进程3从队列得到报警消息: 未绑定患者大于20分钟
进程2从队列得到报警消息: 除颤完成警告
进程3从队列得到报警消息: 未绑定患者大于20分钟
进程2从队列得到报警消息: 除颤完成警告
进程3从队列得到报警消息: 未绑定患者大于20分钟
...
```
