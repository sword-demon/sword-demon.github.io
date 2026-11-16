---
title: PHP/Laravel 开发面试指南
date: 2026-09-29 10:00:00
categories: [面试，PHP]
tags: [Laravel, MySQL, UniApp, MES, ERP, OA]
sidebar: auto
---

# PHP/Laravel 全栈开发面试指南

本文档针对**MES、E-DHR、ERP、OA 系统集成**方向的 PHP 开发岗位，整理相关面试知识点和实战题目。

## 核心技能要求

### 技术栈

- **后端**: PHP 8.x + Laravel 框架. JD 专项以 Laravel 12 文档为核查基线, 具体兼容范围与维护日期见后端篇; 旧版本仅作为存量系统迁移背景.
- **数据库**: MySQL 8.x (优化、事务、锁机制). JD 专项区分 MySQL 8.0 的功能引入版本与 8.4 的行为说明, 不将旧版本兼容性等同于仍受维护.
- **前端/移动端**: UniApp（微信小程序、APP开发）
- **系统集成**: RESTful API、第三方系统对接
- **运维**: Linux、Docker、Nginx

### 业务领域

- MES（制造执行系统）
- ERP（企业资源计划）
- E-DHR（电子批记录）
- OA（办公自动化）
- 设备联网与数据采集

## 文档导航

### 本次 JD 专项：180 道面试题与参考回答

围绕 Laravel + MySQL + UniApp, 以及 MES、E-DHR、ERP 对接、OA 流程、设备联网、测试上线和技术文档整理. 六篇各 30 题, 合计 **180 题**; 每题包含参考回答与追问或场景要点, 适合先自答再核对. 场景案例不代表已经交付的个人经历, 教学计算不作为企业实测数据.

本轮资料核对日期为 **2026-11-16**. 每篇附可核查事实表、5 道进阶题、**专业术语表**和来源链接; 区分官方定义、工程建议及法规适用边界, 版本与维护日期以对应篇目的说明为准.

| 篇目 | 题号 | 重点 |
| --- | --- | --- |
| [Laravel 与后端开发](./jd/laravel-php-interview.md) | 01—30 | 请求链路、权限、事务、队列互斥、版本维护、Octane 生命周期 |
| [MySQL、并发与报表](./jd/mysql-concurrency-interview.md) | 31—60 | 索引、扣料防重、约束、锁超时、长事务、持久性与恢复 |
| [系统集成与设备联网](./jd/integration-device-interview.md) | 61—90 | ERP/OA/MES 对接、幂等对账、Modbus、MQTT 会话、OPC UA、重试预算 |
| [MES、E-DHR 与 OA](./jd/mes-edhr-oa-interview.md) | 91—120 | 生产质量、电子记录、签名审批、QMSR、CSA、OEE 与数据完整性 |
| [UniApp、小程序与 APP](./jd/uniapp-mobile-interview.md) | 121—150 | 登录扫码、离线队列、存储配额、附件持久化、请求取消、跨端性能 |
| [测试、上线与需求协作](./jd/delivery-troubleshooting-interview.md) | 151—180 | 验证排障、受控发布、DORA、SLO、分位数、兼容迁移、恢复演练 |

建议按题号顺序阅读。时间有限时，可先查看[自测与复习安排](./jd/delivery-troubleshooting-interview.md#自测与复习安排)，再针对薄弱部分补习下方原有专题。

### 基础篇

- [PHP 核心面试题](./basic/php-core-questions.md) - PHP 语言特性、面向对象、内存管理
- [MySQL 必考题](./basic/mysql-fundamentals.md) - 索引优化、事务隔离、锁机制
- [Laravel 框架深入](./basic/laravel-framework-deep-dive.md) - 服务容器、中间件、事件机制

### 进阶篇

- [系统接口设计与集成](./advanced/system-integration-api.md) - ERP/OA/MES系统对接实践
- [UniApp 跨平台开发](./advanced/unibapp-mini-program-app.md) - 小程序与 APP开发最佳实践
- [生产数据一致性与追溯](./advanced/data-consistency-traceability.md) - MES系统数据完整性设计

### 实战篇

- [工厂数字化项目实战](./projects/factory-digitalization-case-study.md) - MES系统从需求到上线全流程
- [医疗器械合规系统设计](./projects/medical-compliance-system.md) - E-DHR 系统审计追踪实现
- [设备联网与数据采集](./projects/device-connectivity-data-collection.md) - PLC/SCADA 设备对接方案

### 软技能篇

- [自我介绍模板](./soft/self-introduction-templates.md) - 针对不同阶段的表达策略
- [简历突出要点](./soft/resume-key-points.md) - PHP 开发简历优化指南
- [技术沟通与需求转化](./soft/requirement-translation.md) - 业务需求转技术方案技巧
- [医疗制造业岗位定向准备](./soft/medical-manufacturing-interview-guide.md) - 基于个人简历和岗位职责的面试回答与补强清单

## 面试流程建议

1. **技术笔试**：PHP 语法、SQL 优化、Laravel 使用
2. **专业面试**：系统设计、问题排查、性能优化
3. **业务理解**：MES/ERP/OA业务流程、设备对接场景
4. **综合素质**：沟通能力、项目管理、文档编写

::: info 提示
建议按照 "基础 → 进阶 → 实战" 的顺序逐步学习，每个模块都包含理论知识点和实战案例。
:::
