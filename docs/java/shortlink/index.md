---
title: ShortLink 短链平台技术笔记
date: 2026-09-21 01:30:00
layout: page
catalogue: true
path: java/shortlink
desc: ShortLink 短链平台技术栈学习笔记，涵盖微服务架构、分布式系统、海量数据处理、实时计算与 DevOps 部署等核心技术
sidebar: true
article: false
sidebarSort: 2
---

# ShortLink 短链平台技术笔记

本目录收录 ShortLink 短链平台的完整技术栈学习笔记，涵盖从微服务架构到生产环境部署的全链路技术要点。

## 📚 目录

- [运维部署](./deploy.md) - 服务器环境搭建与中间件配置
  - Docker 安装与配置
  - MySQL8.0 数据库部署
  - Redis6.x 缓存服务

## 🎯 技术栈概览

### 微服务技术

- Spring Cloud Alibaba 全家桶
- SpringBoot 2.5 + Nacos2.x + MyBatisPlus

### 分布式系统

- 分布式缓存
- MQ 消息中间件
- 分布式调度

### 海量数据处理

- MySQL8.0 + ShardingSphere 分库分表
- 阿里云 OSS + ElasticSearch7.x

### 实时计算与数据分析

- Flink1.13 实时计算
- ClickHouse 分析型数据库
- HDFS 分布式存储
- 数据清洗分层架构
- ECharts 数据可视化

### 监控与链路追踪

- Apache Skywalking 分布式追踪
- 监控报警推送
- ElasticSearch7.x 持久化存储

### DevOps 全链路部署

- Jenkins CI/CD
- Rancher2.5 容器编排
- 阿里云 Git 仓库
- Jmeter5.x 性能压测

## 📌 核心模块

### 账号模块

- 图像验证码防刷
- 短信验证码接入
- 高并发下新用户流量包处理
- OSS 分布式文件存储

### 流量包模块

- 海量数据下流量包过期处理
- 每日流量包自动更新
- 高并发扣减处理
- 冷热数据归档策略

### 商品和订单模块

- AOP 自定义注解防重提交
- ShardingSphere 分库分表实战
- 订单数据快照 + 分库分表
- C/B端查询解决方案

### 多渠道支付模块

- 微信扫码支付 v3 对接
- 支付宝扫码支付集成
- 多渠道支付回调通知
- 异步 MQ 消息承接

### 短链服务

- 多案例短链码设计方案
- 高性能短链解析
- 数据上报方案设计
- 分库分表 CRUD 优化

## 💡 特色亮点

- **免迁移扩容方案** - 分库分表后无缝扩容
- **冗余双写分布式事务** - 保证数据一致性
- **单一 Partition Key 设计** - 优化分片键策略
- **C/B端分离查询** - 提升查询性能

---

> **提示**: 本文档体系持续更新中，欢迎点击侧边栏查看详细内容。
