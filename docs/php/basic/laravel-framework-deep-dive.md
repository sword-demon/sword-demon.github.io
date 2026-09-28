---
title: Laravel 框架定向面试准备
date: 2026-09-29 16:40:00
categories: [面试，PHP]
tags: [Laravel, PHP, 服务容器, 队列, PHPUnit]
sidebarSort: 3
---

# Laravel 框架定向面试准备

简历中的主要项目使用 CodeIgniter 3，因此本篇重点准备“已有业务能力如何迁移到 Laravel”，避免只背 API 名称。

## 一、CodeIgniter 3 到 Laravel 的映射

| 已有经验 | Laravel 对应能力 | 面试表达 |
| --- | --- | --- |
| 控制器处理参数 | Form Request + Controller | 校验前置，控制器只编排输入和输出 |
| Model 查询 | Eloquent / Query Builder | 简单关联用 Eloquent，复杂报表明确写 Query Object |
| 公共基类 | Service Container + Service Provider | 依赖通过容器注入，避免静态全局状态 |
| 钩子和回调 | Middleware / Event / Listener | 认证、审计、领域副作用分层处理 |
| RocketMQ/Kafka 消费 | Queue Job / Event | Job 负责重试、超时和失败记录 |
| 手写权限判断 | Gate / Policy / Middleware | 资源授权和接口权限可测试、可复用 |
| 自建日志 | Log Channel + request ID | 结构化记录请求、业务键和外部响应 |

不要为了追求 Laravel 风格，把稳定业务一次性全部重写。迁移优先从新模块、接口边界和测试入手。

## 二、请求链路

```text
Route
  → Middleware（认证、限流、request_id）
  → FormRequest（字段和权限前置校验）
  → Controller（输入输出编排）
  → Application Service（事务和业务流程）
  → Domain/Query（规则和查询）
  → Model/Repository（持久化）
  → Resource（统一响应）
```

一个 MES 报工接口至少要在服务层完成工单状态、工序权限、设备绑定、批次和幂等校验，不能把这些规则散落在控制器和前端。

## 三、队列任务必须回答的五件事

Laravel Job 面试题不要只说“放到队列异步执行”，还要说明：

1. **唯一性**：如何避免同一个工单被重复同步。
2. **重试**：哪些异常可重试，最多几次，如何退避。
3. **超时**：外部 HTTP 超时和 Job 超时分别怎么设置。
4. **失败**：失败原因写在哪里，死信谁处理，如何安全重放。
5. **监控**：队列积压、失败率、执行时长和外部成功率怎么看。

```php
final class SyncWorkOrder implements ShouldQueue
{
    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(public readonly int $workOrderId) {}

    public function handle(ErpClient $client): void
    {
        $order = WorkOrder::query()->findOrFail($this->workOrderId);
        $client->sync($order, idempotencyKey: 'work-order:' . $order->id);
    }

    public function backoff(): array
    {
        return [10, 60, 300];
    }
}
```

示例中的具体 Job 配置要根据接口 SLA、供应商限制和业务补偿策略调整。

## 四、Laravel 权限分层

- **认证**：确认用户身份和 Token 生命周期。
- **角色/权限**：确认用户能否访问功能或执行动作。
- **数据范围**：确认只能看哪些组织、工厂、车间或批次。
- **字段权限**：确认某字段是否可见、可编辑或需要复核。
- **审计**：记录关键动作、原因、前后值和 request ID。

按钮隐藏只是体验层控制；真正的校验要在 Policy、Service 和数据库约束上完成。

## 五、MySQL 性能排查顺序

1. 先确认慢的是 SQL、锁等待、外部接口还是 PHP 序列化。
2. 用 `EXPLAIN` 查看访问类型、候选索引、实际行数和排序临时表。
3. 按过滤、关联、排序和唯一性设计联合索引，避免为每个字段盲目加索引。
4. 大列表使用基于主键的游标分页，导出使用队列和分片。
5. 事务只包住必须原子化的本地写入，不在事务中等待第三方响应。
6. 用慢查询、锁等待、队列积压和接口耗时验证优化效果。

这与简历中的 SQL 优化、主从分离、导出框架和库存行级锁经验可以直接衔接。

## 六、面试题速答

### 服务容器解决什么问题？

它负责根据绑定关系构造对象并注入依赖，让业务服务依赖接口或具体实现时不必手动 `new`。在第三方系统对接中，可以按环境绑定真实客户端、沙箱客户端或回放客户端。

### Event 和 Job 怎么选？

Event 表达“业务事实已经发生”，可由多个 Listener 订阅；Job 表达需要排队执行、重试或延迟执行的工作。一个事件可以派发多个 Job，但不要把所有业务逻辑都塞进 Listener。

### Eloquent 什么时候不适合？

复杂统计、跨库报表、超大导出和明确要求的锁查询可以使用 Query Builder 或独立查询对象。关键是保留边界、参数绑定、索引和测试，而不是为了统一风格强行使用 ORM。

### 如何测试外部接口？

用 HTTP Fake 或客户端适配器模拟成功、超时、错误码、乱序和重复响应；验证本地状态、幂等键、重试和审计记录。联调环境再用真实供应商沙箱做有限验证。
