---
title: 配置中心的重要性
date: 2023-01-15 21:30:10
category: Deploy
tag:
    - consul
    - raft
---

# 配置中心的重要性

## 传统配置文件的弊端

-   静态化配置，例如`.env`文件
-   配置文件无法区分环境，需要手动来维护，认为修改，容易有失误
-   配置文件过于分散，多模块配置信息不一样，甚至格式不一样，难以管理
-   历史版本无法追溯

## 微服务配置中心

-   配置信息的管理
-   配置信息的查看、读取和更新等
-   配置信息的管理界面

## 主流的配置中心

-   `Apollo`是由携程开源的分布式配置中心，实时生效，支持灰度发布，对所有配置进行版本管理和操作审计 ，提供开放平台 API，使用人较多，网上资料也会比较丰富
-   `Spring Cloud Config`能和`spring`框架能无缝集成，使用比较方便，没有可视化的操作界面，配置的生效也不是实时的，需要重启才能刷新
-   `consul`，内置了`kv`存储，追寻`cp`原则，保证数据的强一致性，所以当数据在同步时，或者领导者挂了之后，`server`在重新选举的时候是不可用的，不支持配置信息历史版本的管理，用起来会比较简单

## consul 支持配置中心的实现

可以直接在管理界面直接去`key/value`创建即可，先创建一个`demoService/`的文件夹，用于为`demoService`服务提供配置信息存储，点击进去之后，再创建环境`dev/`和`pro/`测试和生产环境的文件夹，可能会连接多个数据库，所以我们在新建一个`demo/`的数据库的文件夹，`consul`如果加上`/`则是创建文件夹，不加则是对应的配置信息的`key`

## 服务注册

相关文档地址：[https://developer.hashicorp.com/consul/api-docs/agent/service#register-service](https://developer.hashicorp.com/consul/api-docs/agent/service#register-service)
