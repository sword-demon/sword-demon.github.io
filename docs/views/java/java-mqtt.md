---
title: java对接 mqtt
date: 2023-06-12 00:03:10
category: Java
tag:
    - MQTT
---

## 依赖

```xml
<dependency>
	<groupId>org.eclipse.paho</groupId>
	<artifactId>org.eclipse.paho.client.mqttv3</artifactId>
	<version>1.2.2</version>
</dependency>
```

配置

```yml
emq:
	mqttServerUrl: tcp://xxx.xxx.xxx:1883
```

在`config`包下定义配置`emq`配置类

```java
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("emq")
@Data
public class EmqConfig {
	private String mqttServerUrl;
}
```

## 编写客户端连接类和发送消息

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.eclipse.paho.client.mqttv3.MqttClient;

import java.util.UUID;

@Component
@Slf4j
public class EmqClient {
	@Autowired
	private EmqConfig emqConfig;

	private MqttClient mqttClient;

	/**
	 * 链接 emq
	 */
	public void connect() {
		// 服务器 url
		// clientid
		try {
			mqttClient = new MqttClient(emqConfig.getMqttServerUrl(), "monitor." + UUID.randomUUID());
			mqttClient.connect();
		} catch(MqttException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 发送消息
	 * @param topic 主题
	 * @param msg 消息
	 */
	public void publish(String topic, String msg) {
		MqttMessage mqttMessage = new MqttMessage(msg.getBytes());
		try {
			mqttClient.getTopic(topic).publish(mqttMessage);
		} catch (MqttException e) {
			e.printStackTrace();
			log.error('发送消息异常')
		}
	}
}
```

## 订阅消息

```java
/**
 * 订阅消息
 */
public void subscribe(String topic) throws MqttException {
	mqttClient.subscribe(topic);
}
```

> 回调类，来处理接收数据的消息

新建一个类：`EmqMsgProcess`

```java
@Component
@Slf4j
public class EmqMsgProcess implements MqttCallback {

	/**
	 * 链接丢失的时候会触发
	 */
	@Override
	public void connectionLost(Throwable throwable) {}

	/**
	 * 接收到消息的时候触发
	 */
	@Override
	public void messageArrived(String topic, MqttMessage msg) throws Exception {
		// 接收到消息
		String payload = new String(msg.getPayload());
		log.info("接收到消息: {}", payload);
	}

	// 传送完成的时候触发
	@Override
	public void deliveryComplete(IMqttDeliveryToken token) {}
}
```

> 我们需要在连接之前，把回调函数注册进来

```java

@Autowired
private EmqMsgProcess emqMsgProcess;
public void connect() {
		// 服务器 url
		// clientid
		try {
			mqttClient = new MqttClient(emqConfig.getMqttServerUrl(), "monitor." + UUID.randomUUID());
			mqttClient.setCallback(emqMsgProcess);
			mqttClient.connect();
		} catch(MqttException e) {
			e.printStackTrace();
		}
	}
```

## 编写监听类

新建一个包`core`，新建一个类`Monitor`

```java
@Component
@Slf4j
public class Monitor {

	@Autowired
	private EmqClient client;

	// 保证程序启动后必然会调用
	@PostConstruct
	public void init() {
		log.info("初始化方法，订阅主题")
		// 调用连接和订阅方法
		client.connect()
		try {
			client.subscribe("测试 topic")
		} catch(MqttException e) {
			e.printStackTrace();
		}
	}
}
```

> 测试应用程序启动是否会触发，启动后就处于一个监听的状态

---

调整为共享订阅

```java
client.subscribe("$queue/" + "测试 topic")
```
