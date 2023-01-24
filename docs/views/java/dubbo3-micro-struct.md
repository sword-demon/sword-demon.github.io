---
title: Dubbo3 微服务架构概述
date: 2023-01-24 19:56:10
category: Java
tag:
    - Dubbo3
---

# Dubbo3 微服务架构概述

![image-20230122153212860](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230122153212860.png)

![image-20230122153455049](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230122153455049.png)

-   注册中心：接收注册服务配置、输送订阅服务配置
-   配置中心：读取启动配置数据信息 + 监听配置实时变化
-   元数据中心：接收服务提供者配置数据 + 传输消费者配置数据
