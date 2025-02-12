---
title: RocketMQ安装编译启动
date: 2025-02-12
---

## RocketMQ2.8.0安装编译启动

## 文档地址

[文档地址](https://rocketmq.apache.org/zh/docs/4.x/quickstart/01quickstart)

### 编译

```bash
mvn -Prelease-all -DskipTests -Dspotbugs.skip=true clean install -U
```

直到出现这个

```
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary for Apache RocketMQ 4.8.0 4.8.0:
[INFO] 
[INFO] Apache RocketMQ 4.8.0 .............................. SUCCESS [02:41 min]
[INFO] rocketmq-logging 4.8.0 ............................. SUCCESS [ 16.859 s]
[INFO] rocketmq-remoting 4.8.0 ............................ SUCCESS [  3.946 s]
[INFO] rocketmq-common 4.8.0 .............................. SUCCESS [  3.565 s]
[INFO] rocketmq-client 4.8.0 .............................. SUCCESS [  4.962 s]
[INFO] rocketmq-store 4.8.0 ............................... SUCCESS [  3.426 s]
[INFO] rocketmq-srvutil 4.8.0 ............................. SUCCESS [  0.170 s]
[INFO] rocketmq-filter 4.8.0 .............................. SUCCESS [  1.597 s]
[INFO] rocketmq-acl 4.8.0 ................................. SUCCESS [  2.034 s]
[INFO] rocketmq-broker 4.8.0 .............................. SUCCESS [  1.628 s]
[INFO] rocketmq-tools 4.8.0 ............................... SUCCESS [  1.027 s]
[INFO] rocketmq-namesrv 4.8.0 ............................. SUCCESS [  0.370 s]
[INFO] rocketmq-logappender 4.8.0 ......................... SUCCESS [  0.936 s]
[INFO] rocketmq-test 4.8.0 ................................ SUCCESS [  3.514 s]
[INFO] rocketmq-openmessaging 4.8.0 ....................... SUCCESS [  1.315 s]
[INFO] rocketmq-example 4.8.0 ............................. SUCCESS [  0.428 s]
[INFO] rocketmq-distribution 4.8.0 ........................ SUCCESS [01:26 min]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  04:53 min
```

成功为止

编译完成后会出现一个`target`目录



## 启动NameServer

```bash
cd distribution/target/rocketmq-4.8.0/rocketmq-4.8.0/
nohup sh bin/mqnamesrv &
```

>   注意这里要切换环境变量 java 的版本为 1.8
>
>   否则不适配

`tail -f nohup.out`

看到

```
OpenJDK 64-Bit Server VM warning: Using the DefNew young collector with the CMS collector is deprecated and will likely be removed in a future release
OpenJDK 64-Bit Server VM warning: UseCMSCompactAtFullCollection is deprecated and will likely be removed in a future release.
The Name Server boot success. serializeType=JSON
```

就算启动成功了

```bash
jps
63397 RemoteMavenServer36
64906 Jps
64813 NamesrvStartup
63262 
```

## 启动 Broker

```bash
nohup sh bin/mqbroker -n localhost:9876 &

tail -f nohup.out
```

出现

```
The broker[wxvirus, 192.168.0.107:10911] boot success. serializeType=JSON and name server is localhost:9876
```

也算成功了

```bash
jps
66640 BrokerStartup
66741 Jps
63397 RemoteMavenServer36
64813 NamesrvStartup
```



## 验证

```bash
export NAMESRV_ADDR=localhost:9876
sh bin/tools.sh org.apache.rocketmq.example.quickstart.Producer


出现 SendResult [sendStatus=SEND_OK, msgId= ... 字样的就算成功了

```

```bash
sh bin/tools.sh org.apache.rocketmq.example.quickstart.Consumer

出现 ConsumeMessageThread_%d Receive New Messages: [MessageExt... 字样的就算成功了
```

