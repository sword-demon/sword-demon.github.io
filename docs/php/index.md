---
title: PHP/Laravel 开发面试指南
date: 2026-09-29 10:00:00
categories: [面试，PHP]
tags: [Laravel, MySQL, UniApp, MES, ERP, OA, AI]
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

### AI 系列：Laravel 与 PHP 生态的 AI 能力（181—260 题）

在原有 180 题之上补齐 AI 方向的专项, 面向"把大模型接进既有 MES / E-DHR 系统"以及"用 AI 辅助日常开发"两类场景. 四篇各 20 题, 合计 **80 题**, 题号接续 181—260; 同样包含参考回答与追问要点, 并区分官方文档口径与工程推导.

本轮资料核对日期为 **2026-11-26**. 涉及版本与供应商能力的部分以对应篇目的官方资料为准, 具体 API 与配置项请对照项目实际安装的版本.

| 篇目 | 题号 | 重点 |
| --- | --- | --- |
| [Laravel AI SDK 与大模型集成](./jd/laravel-ai-sdk-interview.md) | 181—200 | Agent 编排、结构化输出、工具调用、会话存储、流式协议、人工审批 |
| [PHP AI 生态与 MCP 工具协议](./jd/php-ai-ecosystem-mcp-interview.md) | 201—220 | Prism、多供应商抽象、MCP SDK、Laravel Boost、向量存储、PHP 8.3—8.5 |
| [AI 辅助 PHP/Laravel 开发](./jd/ai-assisted-php-development-interview.md) | 221—240 | 上下文供给、产出验收、供应链与合规、效率度量、团队落地 |
| [AI 功能上线的工程化与安全合规](./jd/ai-production-engineering-interview.md) | 241—260 | 注入与越权、降级与幂等、可观测与成本、灰度与回归、供应商条款 |

建议按题号顺序阅读。AI 系列的四篇互相引用, 也可以按"我在面试中被问到了什么"挑读: 投后端岗重点读 181—200, 投平台或架构岗重点读 201—220 与 241—260, 关心日常研发效率的读 221—240.

### 基础篇

- [PHP 核心面试题](./basic/php-core-questions.md) - PHP 语言特性、面向对象、内存管理
- [MySQL 必考题](./basic/mysql-fundamentals.md) - 索引优化、事务隔离、锁机制
- [Laravel 框架深入](./basic/laravel-framework-deep-dive.md) - 服务容器、中间件、事件机制

### 进阶篇

- [系统接口设计与集成](./advanced/system-integration-api.md) - ERP/OA/MES系统对接实践
- [UniApp 跨平台开发](./advanced/unibapp-mini-program-app.md) - 小程序与 APP开发最佳实践
- [生产数据一致性与追溯](./advanced/data-consistency-traceability.md) - MES系统数据完整性设计

### 实战篇

- [电商多商品订单支付技术方案设计](./jd/multi-product-order-payment-design.md) - 多商品跨店结算、库存原子预扣、父子订单与支付回调设计
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
4. **AI 专项**：大模型接入、Agent 编排、提示注入与越权防护、降级与成本控制
5. **综合素质**：沟通能力、项目管理、文档编写

::: info 提示
建议按照 "基础 → 进阶 → 实战" 的顺序逐步学习，每个模块都包含理论知识点和实战案例。
:::
