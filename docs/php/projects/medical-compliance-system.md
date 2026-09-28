---
title: 医疗制造 E-DHR 系统与验证准备
date: 2026-09-29 16:10:00
categories: [面试，PHP]
tags: [E-DHR, 电子批记录, 审计追踪, 医疗器械, Laravel]
sidebarSort: 6
---

# 医疗制造 E-DHR 系统与验证准备

本文是面试准备材料，不是法规结论。实际系统应由质量、法规、生产和 IT 共同确认适用范围、风险等级和验证策略。

## 一、E-DHR 要解决什么问题

E-DHR（Electronic Device History Record，电子器械历史记录）需要把一批产品从工单释放到入库的关键事实集中起来：

| 业务环节 | 最小记录 |
| --- | --- |
| 工单 | 工单号、产品、版本、计划数量、工艺路线、状态变化 |
| 物料 | 物料编码、供应商批次、有效期、领用/退料数量、替代关系 |
| 生产 | 工序、操作员、设备、开始/结束时间、产出、报废和偏差 |
| 工艺参数 | 参数名称、目标值、上下限、实测值、单位、采集来源 |
| 质量 | 检验项目、样本、结果、判定、复核人、放行状态 |
| 入库 | 成品批次、数量、库位、放行单、关联质量记录 |
| 审计 | 谁在什么时间以什么原因创建、修改、审核或作废了什么 |

关键点是记录“发生了什么”和“为什么允许发生”，而不是只增加一个日志表。

## 二、数据完整性回答框架

面试时可以用 ALCOA+ 作为检查清单：

- **Attributable**：记录能归属到唯一用户、设备或服务账号，不使用共享账号。
- **Legible**：页面、导出和归档内容可读，单位、时区和版本明确。
- **Contemporaneous**：在业务动作发生时记录时间，区分设备时间、服务器时间和接收时间。
- **Original**：保留原始采集值、来源单号和原始文件，不只保存处理后的结果。
- **Accurate**：输入校验、范围校验、单位转换和对账结果可验证。
- **Complete、Consistent、Enduring、Available**：记录完整、顺序一致、可长期保存，并能在授权范围内检索。

FDA 的数据完整性指南把审计追踪描述为能重建电子记录创建、修改或删除过程的安全、带时间戳的记录，并建议关键数据的审计追踪随记录复核、按系统复杂度定期复核。面试中应把这些要求落成字段、权限、日志和复核流程，而不是只说“加一个 `updated_at`”。

参考：

- [FDA Data Integrity and Compliance With CGMP](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/data-integrity-and-compliance-drug-cgmp-questions-and-answers)
- [FDA Part 11 Scope and Application](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application)
- [FDA General Principles of Software Validation](https://www.fda.gov/files/medical%20devices/published/General-Principles-of-Software-Validation---Final-Guidance-for-Industry-and-FDA-Staff.pdf)

## 三、推荐的最小表结构

示例只表达设计思路，字段类型和保留周期应按公司标准确定：

```sql
CREATE TABLE dhr_records (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    record_no VARCHAR(64) NOT NULL UNIQUE,
    work_order_id BIGINT UNSIGNED NOT NULL,
    batch_no VARCHAR(64) NOT NULL,
    version_no INT UNSIGNED NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL,
    source_system VARCHAR(32) NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_dhr_batch (batch_no),
    INDEX idx_dhr_work_order (work_order_id, status)
);

CREATE TABLE audit_trails (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(32) NOT NULL,
    actor_id BIGINT UNSIGNED NOT NULL,
    reason VARCHAR(500) NOT NULL,
    before_json JSON NULL,
    after_json JSON NULL,
    request_id CHAR(36) NOT NULL,
    occurred_at DATETIME(6) NOT NULL,
    INDEX idx_audit_aggregate (aggregate_type, aggregate_id, occurred_at),
    INDEX idx_audit_actor_time (actor_id, occurred_at)
);
```

审计记录应只追加，不提供普通业务用户的更新和删除入口。查询页面要限制范围、记录查询行为，并对敏感字段做脱敏。

## 四、关键操作的服务层边界

```php
final class ApproveDhrAction
{
    public function __invoke(DhrRecord $record, User $operator, string $reason): void
    {
        DB::transaction(function () use ($record, $operator, $reason): void {
            $record = DhrRecord::query()
                ->lockForUpdate()
                ->findOrFail($record->id);

            Gate::forUser($operator)->authorize('approve', $record);

            if ($record->status !== DhrStatus::PendingReview) {
                throw new DomainException('当前状态不允许审核');
            }

            $before = $record->only(['status', 'version_no']);
            $record->update([
                'status' => DhrStatus::Approved,
                'version_no' => $record->version_no + 1,
            ]);

            AuditTrail::create([
                'aggregate_type' => 'dhr_record',
                'aggregate_id' => $record->id,
                'action' => 'approve',
                'actor_id' => $operator->id,
                'reason' => $reason,
                'before_json' => $before,
                'after_json' => $record->only(['status', 'version_no']),
                'request_id' => request()->header('X-Request-Id'),
                'occurred_at' => now(),
            ]);
        });
    }
}
```

实现时还要考虑电子签名凭证的二次认证、签名与记录版本绑定、签名失败不改变业务状态、服务器时钟同步、权限复核和备份恢复演练。不要把密码明文写入审计表，也不要把签名等同于普通的“点击确认”。

## 五、状态和权限设计

建议分别维护业务状态和审核状态，避免一个字段承载所有含义：

```text
draft -> in_progress -> pending_review -> approved -> released
                    \-> deviation_open -> deviation_closed -> pending_review
```

每次状态转换都需要：

1. 当前状态和允许动作的白名单。
2. 角色、组织、工单和批次范围校验。
3. 必填字段、附件、偏差和复核条件校验。
4. 前后值、操作者、原因、请求号和时间戳审计。
5. 失败时事务回滚，成功后发送可重试的通知或集成事件。

## 六、验证测试怎么准备

| 阶段 | 面试中应能说明的证据 |
| --- | --- |
| 需求/风险 | 用户需求、数据流、关键质量属性、风险与控制措施 |
| 单元/接口 | 状态白名单、权限边界、重复请求、字段范围、签名失败 |
| 联调 | ERP/MES/OA/设备正常、超时、重试、乱序、重复和断线场景 |
| 用户验收 | 真实角色和真实业务样例，结果、缺陷、复测记录 |
| 受控发布 | 版本、数据库变更、配置、备份、回滚和发布审批 |
| 上线后 | 审计追踪复核、告警、数据对账、权限复核和恢复演练 |

回答“怎么通过验证”时，重点讲可追踪关系：需求编号 → 风险控制 → 测试用例 → 测试证据 → 缺陷关闭 → 发布版本。FDA 对医疗器械生产或质量系统软件的验证要求强调软件的预期用途和既定协议；公司具体流程仍以质量体系和法规判断为准。

## 七、面试题

### 为什么不能直接修改已审核的批记录？

因为修改会破坏已批准记录的可追溯性。正确做法是通过受控更正或新版本补充，保留原值、修改原因、操作者、时间和审批关系，必要时重新触发审核。

### 审计日志如何防止被管理员删除？

应用层取消更新/删除入口，数据库权限拆分，审计表只追加；关键日志写入独立存储或受控归档，监控删除尝试并定期抽查。不能只依赖前端隐藏按钮。

### 时间戳应该取哪里？

服务器统一时间作为业务接收时间，设备原始时间作为来源元数据；记录时区、时间同步状态和接收延迟。发生冲突时不能静默覆盖原始时间。
