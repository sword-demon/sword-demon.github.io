---
title: H2内存数据库引入
date: 2026:05-16 23:55:10
---

# H2 内存数据库接入

> H2是一个开源的轻量级的`Java`内存数据库，适用于开发、 测试和嵌入式的使用场景。它具有高性能、易用性和丰富的功能特性，支持内存模式和持久化模式。

## 思维导图

<PreviewMarkmapPath />

## 使用

**引入依赖**

```xml
<dependency>
	<groupId>com.h2database</groupId>
  <artifactId>h2</artifactId>
  <version>1.4.200</version>
  <scope>test</scope>
</dependency>
```

新增`application-test.yml`在测试的`classpath`下

```yaml
spring:
	datasource:
		url: jdbc:h2:mem:xxx # 最后的是数据库名
		username: sa
		password: password
		driver-class-name: org.h2.Driver
		h2-console-setting: INIT=RUNSCRIPT FROM 'classpath:schema.sql'
```

`schema.sql`基本上就是建表语句或者初始化语句
