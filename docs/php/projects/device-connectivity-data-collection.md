---
title: 医疗制造设备联网与数据采集准备
date: 2026-09-29 16:30:00
categories: [面试，PHP]
tags: [PLC, Modbus TCP, OPC UA, MQTT, MES, 设备联网]
sidebarSort: 7
---

# 医疗制造设备联网与数据采集准备

## 一、先区分设备协议和业务接口

设备联网通常分两层：

```text
PLC / 传感器 → 设备网关 → 采集服务 → 消息队列/时序存储 → MES 业务服务
                                      └→ 实时看板/告警
```

- **设备协议层**：Modbus TCP、OPC UA、厂商 SDK、串口或网关私有协议，负责读写寄存器和获取原始数据。
- **业务接口层**：REST、消息队列或文件交换，负责把设备数据关联到工单、工序、批次和质量记录。

PHP/Laravel 适合做设备数据接收、校验、入库、业务关联和告警编排；对严格实时的协议轮询，优先由专门的采集服务或设备网关承担，避免让 Web 请求直接阻塞在 PLC 连接上。

## 二、采集数据的最小字段

| 字段 | 作用 |
| --- | --- |
| `device_id` | 设备主数据唯一标识 |
| `point_code` | 参数点位和单位的版本化编码 |
| `raw_value` | 原始值，便于复核转换问题 |
| `value` | 转换后的业务值 |
| `unit` | 当前值单位 |
| `source_timestamp` | 设备或网关产生时间 |
| `received_at` | 平台接收时间 |
| `quality` | good、bad、uncertain 或供应商质量码 |
| `sequence_no` | 网关序号，用于去重和乱序检测 |
| `work_order_no` | 采集时关联的工单 |
| `batch_no` | 采集时关联的批次 |
| `request_id` | 采集链路追踪标识 |

原始值和转换值都要保留。单位换算、倍率、偏移量和参数版本应来自配置，不要散落在控制器代码中。

## 三、采集服务的处理顺序

1. 校验设备是否启用、点位是否存在、协议版本是否匹配。
2. 校验数据类型、单位、时间和质量码。
3. 根据设备、工单和批次关联规则补充业务上下文。
4. 使用 `device_id + point_code + sequence_no` 去重。
5. 写入原始采样和业务快照；关键参数超限则创建告警事件。
6. 通过队列异步更新 MES、看板和通知渠道。
7. 采集失败记录错误类型、重试次数和最后一次成功时间。

## 四、异常值和断线处理

```text
连接失败       → 指数退避重连，超过阈值产生设备离线告警
读取超时       → 单点超时隔离，不阻塞其他点位
质量码 bad     → 保存原始值但不作为放行依据
数值超范围     → 保存样本并产生工艺参数告警
时间倒退       → 标记乱序，按来源时间和接收时间分别查询
重复序号       → 幂等丢弃，并保留重复计数指标
网关断网       → 本地缓冲，恢复后按序补传
```

告警要有确认、恢复和关闭状态，不能每次轮询都重复发通知。短信、企业微信或 OA 通知应通过异步任务发送，避免拖慢采集链路。

## 五、Laravel 接收层示例

```php
final class DeviceSampleController
{
    public function store(DeviceSampleRequest $request, DeviceSampleIngestor $ingestor): Response
    {
        $accepted = $ingestor->ingest(
            $request->validated(),
            $request->header('X-Request-Id')
        );

        return response()->json([
            'accepted' => $accepted,
        ], 202);
    }
}

final class DeviceSampleIngestor
{
    public function ingest(array $payload, string $requestId): bool
    {
        return DB::transaction(function () use ($payload, $requestId): bool {
            $key = implode(':', [
                $payload['device_id'],
                $payload['point_code'],
                $payload['sequence_no'],
            ]);

            if (DeviceSample::query()->where('dedupe_key', $key)->exists()) {
                return false;
            }

            DeviceSample::create([
                'dedupe_key' => $key,
                'device_id' => $payload['device_id'],
                'point_code' => $payload['point_code'],
                'raw_value' => $payload['raw_value'],
                'value' => $payload['value'],
                'quality' => $payload['quality'],
                'source_timestamp' => $payload['source_timestamp'],
                'received_at' => now(),
                'request_id' => $requestId,
            ]);

            return true;
        });
    }
}
```

`dedupe_key` 必须有唯一索引；否则多个消费者并发时，先查询再插入仍可能重复。

## 六、设备接入联调清单

- 设备台账：设备编号、型号、IP、端口、协议、固件和点位版本。
- 网络：VLAN、防火墙、白名单、连接超时和证书/密钥管理。
- 点位：地址、类型、字节序、倍率、单位、质量码和上下限。
- 场景：开机、停机、换型、断网、重启、批次切换、跨天和夏令时边界。
- 数据：重复、乱序、缺失、异常值、补传、采集延迟和时钟漂移。
- 业务：工单绑定、操作员、批次、报工、质量判定、放行和入库。
- 运维：连接数、采集延迟、成功率、队列积压、离线时长和告警闭环。

## 七、面试中如何结合简历

可以这样回答：

> 我过去主要做的是业务系统和第三方接口，没有把 PLC 采集写成已经交付的项目。我的可迁移经验是统一 HTTP 客户端、重试和日志追踪、Kafka/RocketMQ 异步处理、订单库存并发控制和数据权限。设备接入时我会把协议采集与 MES 业务解耦：网关负责稳定采集，平台负责幂等、质量码、批次关联、告警和追溯。联调时先拿点位表和异常场景清单，再用真实报文做回放测试。

这比只回答“会 Modbus”更容易让面试官判断你的落地能力。
