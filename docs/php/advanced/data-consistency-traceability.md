---
title: MES 生产数据一致性与追溯设计
date: 2026-09-29 16:20:00
categories: [面试，PHP]
tags: [MES, 生产追溯, 数据一致性, MySQL, Laravel]
sidebarSort: 3
---

# MES 生产数据一致性与追溯设计

## 一、核心链路

医疗制造场景可以先画出一条最小可追溯链：

```text
工单 → 工序 → 生产批次 → 报工 → 物料消耗 → 工艺参数 → 质量检验 → 放行 → 入库
  │       │        │          │         │           │          │
  └───────┴────────┴──────────┴─────────┴───────────┴──────────┴→ 审计与接口事件
```

每个节点都要有稳定的业务编号和来源信息。数据库自增 ID 只用于内部关联，不能作为跨系统对账的唯一业务键。

## 二、字段设计清单

| 对象 | 必要字段 | 设计要点 |
| --- | --- | --- |
| 工单 | `work_order_no`、产品版本、计划量、状态 | 工单号唯一；发布后产品和工艺版本不可静默替换 |
| 批次 | `batch_no`、父批次、数量、状态 | 支持拆分、合并和报废原因；保留来源批次 |
| 报工 | 工单、工序、操作员、设备、产出、报废 | 幂等键由工单+工序+设备+终端流水号组成 |
| 物料消耗 | 物料批次、数量、单位、来源单号 | 先校验可用量，再在事务中扣减；记录退料和替代 |
| 质量 | 检验项、实测值、上下限、判定、复核人 | 保存原始值、单位、规则版本和复核记录 |
| 入库 | 成品批次、数量、库位、放行单 | 只有满足放行条件的批次才能进入可用库存 |

## 三、幂等与状态机

### 幂等键

外部请求必须携带 `Idempotency-Key` 或来源流水号。服务端保存请求摘要和处理结果：

```text
第一次请求：创建业务记录，保存 key、payload_hash、result
重复请求：payload_hash 相同，返回第一次 result
冲突请求：key 相同但 payload_hash 不同，返回 409 并告警
处理中：返回 202 或明确的处理中状态，避免重复扣料
```

幂等键要有唯一索引，不能只用 Redis 短期锁。Redis 可以减少瞬时重复，但最终约束必须由数据库保证。

### 状态白名单

```php
final class WorkOrderStateMachine
{
    private const TRANSITIONS = [
        'draft' => ['released', 'cancelled'],
        'released' => ['in_progress', 'cancelled'],
        'in_progress' => ['paused', 'completed', 'cancelled'],
        'paused' => ['in_progress', 'cancelled'],
        'completed' => ['closed'],
        'cancelled' => ['closed'],
    ];

    public static function can(string $from, string $to): bool
    {
        return in_array($to, self::TRANSITIONS[$from] ?? [], true);
    }
}
```

状态转换和业务副作用应在同一个应用服务中编排，避免控制器、队列消费者和定时任务各自修改状态。

## 四、报工和扣料的事务边界

推荐流程：

1. 校验用户、工单、工序、设备和批次权限。
2. 用唯一键检查报工是否已处理。
3. `SELECT ... FOR UPDATE` 锁定工单进度和物料库存行。
4. 校验数量、单位、库存和质量条件。
5. 写入报工、物料消耗、进度快照和审计记录。
6. 在同一事务中写入 outbox 事件。
7. 提交后由消费者同步 ERP、WMS、OA 或消息中心。

不要在数据库事务内等待外部 ERP HTTP 响应；外部系统超时不应让本地行锁长期占用。outbox 消费失败时按退避策略重试，超过次数进入死信并产生可处理告警。

## 五、Outbox 最小结构

```sql
CREATE TABLE integration_outbox (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    event_id CHAR(36) NOT NULL UNIQUE,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id BIGINT UNSIGNED NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSON NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    attempts INT UNSIGNED NOT NULL DEFAULT 0,
    next_attempt_at DATETIME(6) NULL,
    last_error VARCHAR(1000) NULL,
    created_at DATETIME(6) NOT NULL,
    processed_at DATETIME(6) NULL,
    INDEX idx_outbox_poll (status, next_attempt_at, id)
);
```

消费者要用 `event_id` 做下游幂等键，记录每次尝试和最后错误。成功后保留事件记录，按归档策略迁移，不能为了“清理表”直接删除全部历史。

## 六、对账和追溯查询

每天至少准备三类对账：

- **数量对账**：工单计划量、报工产出、报废、在制和入库数量是否守恒。
- **状态对账**：本地和 ERP/WMS 的工单、批次、入库状态是否一致。
- **事件对账**：本地 outbox、接口响应、下游确认和死信数量是否一致。

追溯查询按批次反查：

```text
成品批次
  → 入库单/放行记录
  → 质量检验与工艺参数
  → 报工与设备
  → 物料消耗与供应商批次
  → 工单、操作员和审计轨迹
```

查询接口要限制时间范围和批次范围，超大范围使用异步导出；导出文件记录申请人、筛选条件、生成时间和下载审计。

## 七、接口异常排查顺序

1. 用 `request_id` 或 `event_id` 关联入口日志、数据库事件和外部响应。
2. 确认请求是否到达、是否重复、payload 是否发生变化。
3. 检查本地事务是否提交、outbox 是否写入、消费者是否领取。
4. 区分超时、连接失败、鉴权失败、业务拒绝、数据映射错误和下游处理中。
5. 检查重试次数、退避时间、死信和人工处理结果。
6. 修复后重放单个事件，并重新对账，不直接批量修改业务表。

这套排查方式可以复用简历中的统一 HTTP 客户端、重试和日志追踪经验，也能自然过渡到 MES/ERP/OA 的生产集成问题。
