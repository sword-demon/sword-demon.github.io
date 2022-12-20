# Consul 的 PHP 的服务注册与发现

## 下载安装

下载地址：[https://developer.hashicorp.com/consul/downloads](https://developer.hashicorp.com/consul/downloads)

## 服务注册和服务发现

-   服务注册`consul`的接口地址：`agent/service/register`
-   服务发现`consul`的接口地址：`health/service/{serviceId}`

> 简单使用`ThinkPHP6.0`来实现服务注册和服务发现

先配置`consul`的一些内容

```php
<?php

return [
    'consul' => [
        'host' => 'localhost',
        'port' => 8500 // web ui 的端口地址
    ]
];
```

接着我们在一个`service`目录下新建`Consul`服务类

```php
<?php


namespace app\service;


use think\facade\Config;

class Consul
{
    private $httpUrl;

    public function __construct()
    {
        $consulConfig = Config::get('common.consul');
        $this->httpUrl ='http://'.$consulConfig['host'].':'.$consulConfig['port'] . '/';
    }

    // 服务注册
    // agent/service/register
    public function registerService($data)
    {
        $url = $this->httpUrl . 'v1/agent/service/register';
        // 请求这个接口
        return $this->curlPUT($url, $data);
    }

    // 服务信息
    public function serviceInfo($serviceId) {
        $url = $this->httpUrl . 'v1/health/service/'.$serviceId;
        $res = $this->curlGET($url);
        echo $res;
    }

    public function curlPUT($httpUrl, $data)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $httpUrl);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $res = curl_exec($ch);
        if ($res === false) {
            var_dump(curl_errno($ch));
        }
        curl_close($ch);
        return $res;
    }

    public function curlGET($httpUrl)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $httpUrl);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $res = curl_exec($ch);
        if ($res === false) {
            var_dump(curl_errno($ch));
        }
        curl_close($ch);
        return $res;
    }
}
```

编写一个控制器来进行测试

```php
<?php


namespace app\controller;


use app\BaseController;
use app\service\Consul;

class ConsulDemo extends BaseController
{
    // 注册服务
    public function registerDemo()
    {
        $data = [
            // 服务id
            'ID' => 'demoService',
            'Name' => 'demoService', // 服务名称
            'Tags' => ['core.demo'],
            'Address' => '192.168.0.101', // 本机的ip
            'Port' => 8087,
            // 健康检查回调地址
            'Check' => [
                'HTTP' => 'http://192.168.0.101:8087',
                'Interval' => '5s'
            ]
        ];
        $consul = new Consul();
        $rs = $consul->registerService($data);
        var_dump($rs);
    }

    // 服务发现
    public function serviceInfo()
    {
        $serviceId = 'demoService';
        $consul = new Consul();
        $rs = $consul->serviceInfo($serviceId);
        var_dump($rs);
    }
}
```

配置`tp`的路由

```php
<?php
use think\facade\Route;


// Consul
Route::get('consul/reg/demo', 'ConsulDemo/registerDemo');
Route::get('consul/service/info', 'ConsulDemo/serviceInfo');
```

## 测试

```bash
consul agent -dev
```

使用上面的命令来本地开发运行`consul`，然后到浏览器输入`localhost:8500`即可访问对应的`web ui`页面。

再启动`ThinkPHP`加上上面代码里设置的对应的端口运行

```bash
php think run -p8087
```

![image-20221220220151138](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221220220151138.png)

我们依次在浏览器访问控制器里的接口

-   [http://127.0.0.1:8087/consul/service/info](http://127.0.0.1:8087/consul/service/info)

    这个访问，使用`json`方式查看内容

    ```json
    [
        {
            "Node": {
                "ID": "cef7b229-831c-c1b4-9f71-81a7f9035b80",
                "Node": "wujie",
                "Address": "127.0.0.1",
                "Datacenter": "dc1",
                "TaggedAddresses": {
                    "lan": "127.0.0.1",
                    "lan_ipv4": "127.0.0.1",
                    "wan": "127.0.0.1",
                    "wan_ipv4": "127.0.0.1"
                },
                "Meta": {
                    "consul-network-segment": ""
                },
                "CreateIndex": 13,
                "ModifyIndex": 14
            },
            "Service": {
                "ID": "demoService",
                "Service": "demoService",
                "Tags": ["core.demo"],
                "Address": "192.168.0.101",
                "TaggedAddresses": {
                    "lan_ipv4": {
                        "Address": "192.168.0.101",
                        "Port": 8087
                    },
                    "wan_ipv4": {
                        "Address": "192.168.0.101",
                        "Port": 8087
                    }
                },
                "Meta": null,
                "Port": 8087,
                "Weights": {
                    "Passing": 1,
                    "Warning": 1
                },
                "EnableTagOverride": false,
                "Proxy": {
                    "Mode": "",
                    "MeshGateway": {},
                    "Expose": {}
                },
                "Connect": {},
                "PeerName": "",
                "CreateIndex": 30,
                "ModifyIndex": 30
            },
            "Checks": [
                {
                    "Node": "wujie",
                    "CheckID": "serfHealth",
                    "Name": "Serf Health Status",
                    "Status": "passing",
                    "Notes": "",
                    "Output": "Agent alive and reachable",
                    "ServiceID": "",
                    "ServiceName": "",
                    "ServiceTags": [],
                    "Type": "",
                    "Interval": "",
                    "Timeout": "",
                    "ExposedPort": 0,
                    "Definition": {},
                    "CreateIndex": 13,
                    "ModifyIndex": 13
                },
                {
                    "Node": "wujie",
                    "CheckID": "service:demoService",
                    "Name": "Service 'demoService' check",
                    "Status": "passing",
                    "Notes": "",
                    "Output": "HTTP GET http://192.168.0.101:8087: 200 OK Output: <style type=\"text/css\">*{ padding: 0; margin: 0; } div{ padding: 4px 48px;} a{color:#2E5CD5;cursor: pointer;text-decoration: none} a:hover{text-decoration:underline; } body{ background: #fff; font-family: \"Century Gothic\",\"Microsoft yahei\"; color: #333;font-size:18px;} h1{ font-size: 100px; font-weight: normal; margin-bottom: 12px; } p{ line-height: 1.6em; font-size: 42px }</style><div style=\"padding: 24px 48px;\"> <h1>:) </h1><p> ThinkPHP V6.1.0<br/><span style=\"font-size:30px;\">16载初心不改 - 你值得信赖的PHP框架</span></p><span style=\"font-size:25px;\">[ V6.0 版本由 <a href=\"https://www.yisu.com/\" target=\"yisu\">亿速云</a> 独家赞助发布 ]</span></div><script type=\"text/javascript\" src=\"https://e.topthink.com/Public/static/client.js\"></script><think id=\"ee9b1aa918103c4fc\"></think>",
                    "ServiceID": "demoService",
                    "ServiceName": "demoService",
                    "ServiceTags": ["core.demo"],
                    "Type": "http",
                    "Interval": "5s",
                    "Timeout": "",
                    "ExposedPort": 0,
                    "Definition": {},
                    "CreateIndex": 30,
                    "ModifyIndex": 31
                }
            ]
        }
    ]
    ```

-   [http://127.0.0.1:8087/consul/reg/demo](http://127.0.0.1:8087/consul/reg/demo)

    > 这个会打印一个空的字符串，然后再去`consul`里查看是否有上面图中的`demoService`注册，有就代表成功了

![image-20221220220610387](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221220220610387.png)

`consul`也会进行健康检查。
