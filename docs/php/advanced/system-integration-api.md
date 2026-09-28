---
title: 系统接口设计与集成实战
date: 2026-09-29 11:00:00
categories: [面试，PHP]
tags: [Laravel, API, ERP, MES, OA, 系统集成]
sidebarSort: 4
---

# 系统接口设计与集成实战（编号 51-80）

## 整体架构说明

```mermaid
flowchart TB
    subgraph "前端层"
        Web[Web 管理端<br/>Vue3]
        Mobile[移动端<br/>UniApp]
        PDA[PDA 设备<br/>扫码枪]
    end

    subgraph "API 网关层"
        Auth[OAuth2 认证]
        RateLimit[限流熔断]
        Router[路由分发]
        Gateway[Laravel API Gateway]
    end

    subgraph "业务服务层"
        OrderSvc[订单服务]
        ProductionSvc[生产服务]
        QualitySvc[质量服务]
        InventorySvc[库存服务]
        DeviceSvc[设备服务]
    end

    subgraph "数据持久层"
        MySQL[(MySQL 主库)]
        Redis[(Redis 集群)]
        Mongo[(MongoDB 日志)]
    end

    subgraph "消息队列"
        RabbitMQ[RabbitMQ]
        Kafka[Kafka 大数据]
    end

    subgraph "外部系统集成"
        SAP[SAP ERP]
        OA[泛微 OA]
        WMS[WMS 仓储]
        MES[MES 制造执行]
        PLC[PLC 设备采集]
    end

    Web --> Gateway
    Mobile --> Gateway
    PDA --> Gateway

    Gateway --> OrderSvc
    Gateway --> ProductionSvc
    Gateway --> QualitySvc

    OrderSvc --> MySQL
    ProductionSvc --> MySQL
    QualitySvc --> MySQL

    OrderSvc --> Redis
    ProductionSvc --> Redis

    OrderSvc --> RabbitMQ
    ProductionSvc --> RabbitMQ

    OrderSvc --> SAP
    ProductionSvc --> PLC
    QualitySvc --> MES
    InventorySvc --> WMS

    style Web fill:#e1f5ff
    style Mobile fill:#d4edda
    style Gateway fill:#fff3cd
    style OrderSvc fill:#f8d7da
    style SAP fill:#ffeaa7
    style PLC fill:#fd79a8
```

### 51. ERP 订单同步完整流程

```mermaid
graph TB
    OrderSource[客户下单] --> OrderCreate[创建订单]
    OrderCreate --> ValidateData{数据校验？}
    ValidateData -->|失败 | ReturnError[返回错误提示]
    ValidateData -->|成功 | MapFormat[数据格式转换]
    MapFormat --> CreateTask[创建同步任务]
    CreateTask --> Queue[Redis 消息队列]
    Queue --> DispatchWorker[Worker 异步处理]

    subgraph Laravel Application
        DispatchWorker --> TransformData[数据映射转换]
        TransformData --> CallAPI[调用 ERP API]
        CallAPI --> CheckResult{同步结果？}
    end

    CheckResult -->|成功 | UpdateStatus[更新状态 + 记录日志]
    CheckResult -->|失败 | RetryCount{重试次数？}
    RetryCount -->|<3| DelayRetry[延迟重试]
    RetryCount -->|>=3| DeadLetter[加入死信队列]

    DelayRetry --> CallAPI

    subgraph ERP System
        SAP[SAP ERP]
    end

    UpdateStatus --> Success[✅ 同步完成]
    DeadLetter --> Alert[人工干预告警]

    style OrderSource fill:#e1f5ff
    style ValidateData fill:#fff3cd
    style Success fill:#d4edda
    style Alert fill:#f8d7da
```

```php
class ErpOrderSyncService {
    public function __construct(
        private OrderRepository $orderRepo,
        private ErpClient $erpClient,
        private SyncLogRepository $logRepo,
    ) {}

    /**
     * 将订单同步到 ERP 系统
     */
    public function sync(Order $order): SyncResult {
        // ✅ 步骤 1: 数据校验
        if (!$this->validateOrder($order)) {
            return SyncResult::failed('订单数据不完整');
        }

        // ✅ 步骤 2: 准备 ERP 所需数据格式
        $erpData = $this->mapToErpFormat($order);

        // ✅ 步骤 3: 异步队列发送
        SyncOrderToERP::dispatch($order->id);

        // ✅ 步骤 4: 记录同步日志
        $this->logRepo->create([
            'order_id' => $order->id,
            'action' => 'sync_to_erp',
            'status' => 'pending',
            'payload' => json_encode($erpData),
        ]);

        return SyncResult::success();
    }

    private function mapToErpFormat(Order $order): array {
        return [
            'sales_order_no' => $order->order_code,
            'customer_code' => $order->customer->erp_customer_code,
            'order_date' => $order->created_at->format('Y-m-d'),
            'lines' => $order->items->map(fn($item) => [
                'material_code' => $item->product->erp_sku,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'tax_rate' => 0.13,  // 13%增值税
            ])->toArray(),
            'delivery_date' => $order->delivery_date?->format('Y-m-d'),
        ];
    }

    private function validateOrder(Order $order): bool {
        return $order->status === 'confirmed'
            && $order->customer->erp_customer_code !== null
            && $order->items->where('quantity', 0)->isEmpty();
    }
}
```

**关键设计说明：**

::: details 点击查看时序图

```mermaid
sequenceDiagram
    participant Web as Web 前端
    participant Service as ErpOrderSyncService
    participant Queue as RabbitMQ
    participant Worker as SyncOrderToERP
    participant ERP as SAP ERP
    participant Log as SyncLog
    participant Alert as 告警服务

    Web->>Service: 提交订单
    Service->>Service: validateOrder()
    Service-->>Web: 立即返回（准实时）

    Note over Service,Log: 后台异步处理

    Service->>Queue: 发送 SyncOrderToERP 消息
    Queue->>Worker: 消费消息
    Worker->>Worker: 数据格式转换
    Worker->>ERP: 调用 createSalesOrder API

    alt ERP 处理成功
        ERP-->>Worker: 返回销售订单号
        Worker->>Worker: 更新同步状态为 SUCCESS
        Worker->>Log: 写入详细日志
        Worker-->>Web: 推送 WebSocket 通知
    else ERP 连接超时
        Worker->>Worker: 记录失败原因
        Worker->>Queue: 重新入队（延迟重试）
    else 连续失败 3 次
        Worker->>Worker: 标记为 DEPLOY_DEADLETTER
        Worker->>Alert: 发送告警通知管理员
    end
```

### 52. 物料主数据同步

```mermaid
flowchart LR
    subgraph MES_System
        MES[MES 物料管理模块]
        MESQuery[查询物料信息]
    end

    subgraph Integration_Layer
        Adapter[适配层]
        Validator[数据验证器]
        Mapper[字段映射器]
    end

    subgraph MySQL_DB
        MainTable[(Material 主表)]
        VersionTbl[(版本历史表)]
    end

    subgraph Notify_Engine
        Event[触发 MaterialUpdated 事件]
        Listeners[多个监听器]
    end

    MES --> MESQuery
    MESQuery --> Adapter
    Adapter --> Validator
    Validator --> Mapper
    Mapper --> DBInsert{数据库操作}

    DBInsert -->|exists | UpdateData[UPDATE 现有记录]
    DBInsert -->|new | InsertData[INSERT 新记录]

    UpdateData --> StoreVersion[保存版本历史]
    InsertData --> StoreVersion

    StoreVersion --> Event
    Event --> Listeners

    Listeners --> Inventory[库存系统更新]
    Listeners --> Price[价格体系更新]
    Listeners --> WMS[WMS 系统同步]

    style MES fill:#e1f5ff
    style Adapter fill:#fff3cd
    style DBInsert fill:#d4edda
    style Listeners fill:#f8d7da
```

```php
class MaterialMasterSync {
    public function syncFromMES(string $materialCode): Material {
        // 从 MES 拉取物料主数据
        $mesMaterial = $this->mesClient->getMaterial($materialCode);

        return DB::transaction(function () use ($mesMaterial) {
            // ✅ 更新或创建
            $material = Material::firstOrCreate(
                ['code' => $mesMaterial->code],
                [
                    'name' => $mesMaterial->name,
                    'specification' => $mesMaterial->spec,
                    'unit' => $mesMaterial->unit,
                    'weight' => $mesMaterial->weight,
                    'volume' => $mesMaterial->volume,
                    'erp_material_code' => $mesMaterial->erp_code,
                ]
            );

            // ✅ 触发事件通知其他系统
            event(new MaterialUpdated($material));

            return $material;
        });
    }
}

// Laravel Event Listener
class UpdateInventoryAfterMaterialUpdate {
    public function handle(MaterialUpdated $event): void {
        $material = $event->material;

        // 更新库存系统的物料信息
        InventoryService::updateMaterial([
            'material_code' => $material->erp_material_code,
            'specification' => $material->specification,
        ]);
    }
}
```

### 53. BOM（Bill of Materials）同步

```mermaid
flowchart LR
    subgraph Source_Systems
        MES[MES 工艺系统]
        PLM[PLM 设计系统]
    end

    subgraph Transformation_Layer
        Mapper[BOM 映射器]
        Validator[校验规则]
        Calculator[标准成本计算]
    end

    subgraph Target_Systems
        ErpCost[SAP 成本核算]
        MesPlanning[MES 生产计划]
    end

    MES --> ProductInfo[产品信息]
    PLM --> BillOfMaterial[物料清单]

    ProductInfo --> Mapper
    BillOfMaterial --> Mapper

    Mapper --> Transform{结构转换}

    Transform -->|材料费 | CalculateStandardCost
    Transform -->|工艺路线 | ValidateProcess

    CalculateStandardCost --> CalcFormula[∑材料 + 人工 + 制造费]
    ValidateProcess --> CalcFormula

    CalcFormula --> ErpCost
    CalcFormula --> MesPlanning

    style MES fill:#e1f5ff
    style PLM fill:#d4edda
    style Transform fill:#fff3cd
    style ErpCost fill:#f8d7da
```

```php
class BomSyncService {
    /**
     * 工艺路线和 BOM 表同步
     */
    public function syncBom(int $productId): void {
        $product = Product::with('bomOperations')->find($productId);

        $bomData = [
            'product_code' => $product->code,
            'version' => $product->bom_version,
            'components' => $product->bom->map(fn($comp) => [
                'component_code' => $comp->material->code,
                'quantity' => $comp->quantity,
                'unit' => $comp->material->unit,
                'yield_rate' => $comp->yield_rate,  // 良品率
                'operation_seq' => $comp->operationSequence,
            ])->toArray(),
        ];

        // 发送到 MES 系统
        $this->mesClient->syncBom($bomData);

        // 发送到 ERP 成本核算
        $this->erpClient->updateBomCost([
            'product_code' => $product->code,
            'standard_cost' => $this->calculateStandardCost($product->bom),
        ]);
    }

    private function calculateStandardCost(Collection $bom): float {
        $total = 0;
        foreach ($bom as $comp) {
            $total += $comp->material->cost * $comp->quantity;
        }
        return $total * (1 + $this->laborRate);  // 加上人工费
    }
}
```

### 54. 工单状态回传

```mermaid
stateDiagram-v2
    [*] --> DRAFT: 创建工单
    DRAFT --> RELEASED: 释放工单
    RELEASED --> IN_PROGRESS: 开始生产
    IN_PROGRESS --> PAUSED: 暂停
    PAUSED --> IN_PROGRESS: 恢复生产
    IN_PROGRESS --> COMPLETED: 报工完成
    IN_PROGRESS --> CANCELLED: 取消
    PAUSED --> CANCELLED: 取消
    COMPLETED --> CLOSED: 归档
    CANCELLED --> CLOSED

    note right of IN_PROGRESS
        实时数据推送给 MES
        触发物料扣减
        通知下游工序
    end note

    note left of RELEASED
        同步状态到 SAP
        更新计划排程
        准备工装夹具
    end note

    state "Laravel State Machine" as SM
    state "ERP Notification" as ERP

    RELEASED --> ERP: notifyWorkOrderStatus()
    IN_PROGRESS --> ERP: notifyWorkOrderStatus()
    COMPLETED --> ERP: notifyWorkOrderStatus()

    style DRAFT fill:#e1f5ff
    style IN_PROGRESS fill:#fff3cd
    style COMPLETED fill:#d4edda
    style CLOSED fill:#6c757d
```

```php
class WorkOrderStatusCallback {
    public function notifyWorkOrderStatus(WorkOrder $workOrder): void {
        $statusMapping = [
            'created' => 'RELEASED',
            'in_progress' => 'EXECUTING',
            'completed' => 'CLOSED',
            'cancelled' => 'CANCELLED',
        ];

        $erpStatus = $statusMapping[$workOrder->status] ?? null;

        if ($erpStatus) {
            $this->erpClient->updateWorkOrderStatus([
                'work_order_no' => $workOrder->erp_work_order_no,
                'status' => $erpStatus,
                'completion_rate' => $workOrder->progress_percentage,
                'actual_start_time' => $workOrder->actual_start_time,
                'actual_end_time' => $workOrder->actual_end_time,
            ]);
        }
    }
}

// 使用观察者模式
class WorkOrder extends Model {
    protected static function boot() {
        parent::boot();

        static::updated(function (WorkOrder $wo) {
            if ($wo->isDirty('status')) {
                app(WorkOrderStatusCallback::class)->notifyWorkOrderStatus($wo);
            }
        });
    }
}
```

### 55-60. ERP 快速问答

**55. ERP 接口异常如何处理？**  
重试机制 + 死信队列 + 人工干预界面 + 详细错误日志

**56. 如何保证数据一致性？**  
分布式事务（TCC）、最终一致性补偿、对账机制

**57. ERP 订单数量巨大怎么优化？**  
分批处理（chunk）、消息队列、批量 API、压缩传输

**58. 如何处理字段映射冲突？**  
建立映射配置表、版本化转换规则、数据清洗层

**59. 实时 vs 异步同步？**  
关键业务实时（如库存变更），非关键批量（如报表）

**60. ERP 对接常见坑？**  
编码不一致、时区差异、主键冲突、数据字典映射

## MES 系统集成（61-70）

### 61. 生产报工数据采集

```mermaid
sequenceDiagram
    participant Worker as 工人 (PDA)
    participant API as Laravel API Gateway
    participant Validation as 校验服务
    participant DB as ProductionDB
    participant Progress as 进度更新器
    participant Notify as 通知中心
    participant TeamLead as 班组长

    Worker->>API: POST /api/production/report
    Note over Worker,API: {work_order_no, operation_code,<br/>produced_qty, defect_qty}

    API->>Validation: 验证操作工身份
    Validation-->>API: employee_id → assigned?

    alt 未分配到此工单
        API-->>Worker: 403 Unauthorized
        Worker->>Worker: 显示错误提示
    else 已分配
        API->>Validation: 验证工位匹配
        Validation-->>API: deviceId match?

        alt 工位不匹配
            API-->>Worker: 400 Bad Request
            Worker->>Worker: 请确认工位
        else 工位正确
            API->>Validation: GPS 位置校验
            Validation-->>API: isWithinRange?

            alt 超出范围
                API-->>Worker: 403 LocationError
            else 在范围内
                API->>DB: 创建报工记录

                par 并行处理
                    DB->>Progress: updateWorkOrderProgress()
                    Progress-->>DB: 更新工单进度百分比

                    DB->>Notify: triggerMaterialDeduction
                    Notify-->>DB: 扣减库存

                    DB->>Notify: 发送班组长通知
                    Notify->>TeamLead: WebSocket 推送新报工
                end

                API-->>Worker: 201 Created + reportRecord
            end
        end
    end
```

```php
class ProductionReportingService {
    public function submitReport(ReportRequest $request): ReportRecord {
        // 验证工序和机台
        if (!$this->validateOperation($request->operationCode, $request->deviceId)) {
            throw new BusinessException('工序机台不匹配');
        }

        // 防作弊：操作员不能代打卡
        $worker = auth()->user();
        if (!$this->workerIsOnStation($worker->id, $request->deviceId)) {
            throw new BusinessException('操作员不在指定工位');
        }

        // 创建报工记录
        $report = ReportRecord::create([
            'work_order_no' => $request->workOrderNo,
            'operation_code' => $request->operationCode,
            'operator_id' => $worker->employee_id,
            'device_id' => $request->deviceId,
            'produced_qty' => $request->producedQty,
            'defect_qty' => $request->defectQty,
            'scrap_rate' => $this->calculateScrapRate($request),
            'process_params' => $request->processParams,  // 温度、压力等
            'reported_at' => now(),
        ]);

        // 实时更新工单进度
        $workOrder = WorkOrder::where('work_order_no', $request->workOrderNo)->first();
        $this->updateWorkOrderProgress($workOrder);

        return $report;
    }

    private function updateWorkOrderProgress(WorkOrder $wo): void {
        $totalReported = $wo->reports->sum('produced_qty');
        $plannedQty = $wo->planned_quantity;

        $wo->update([
            'progress_percentage' => min(100, round($totalReported / $plannedQty * 100)),
            'actual_output' => $totalReported,
        ]);
    }
}
```

### 62. 设备参数采集

```mermaid
sequenceDiagram
    participant PLC as PLC 设备<br/>西门子/三菱
    participant Collector as DeviceDataCollector
    participant Redis as Redis Stream
    participant Worker as 数据处理器
    participant DB as ProductionDB
    participant WebSocket as WebSocket Server
    participant Frontend as 实时监控看板

    loop 每 100ms 采集一次
        PLC->>Collector: Modbus TCP 请求
        Collector->>PLC: 读取寄存器地址
        PLC-->>Collector: 返回温度、压力等数据

        Collector->>Redis: XADD production_data_stream
        Collector->>DB: insert Batch (异步)

        alt 数据超限告警
            Redis->>Worker: trigger AlarmCheck
            Worker->>AlertSystem: 发送报警通知
        end
    end

    Note over Redis,Worker: 高吞吐量数据处理

    Worker->>WebSocket: broadcast device.{id}.parameters
    WebSocket-->>Frontend: 实时更新图表

```

```php
class DeviceParameterCollector {
    public function collectFromPLC(string $deviceId, array $parameterCodes): array {
        // Modbus TCP通信
        $socket = $this->getConnection($deviceId);

        $results = [];
        foreach ($parameterCodes as $code) {
            $address = $this->getParameterAddress($code);
            $value = socket_read($socket, $address, 2);  // 读取寄存器

            $results[] = [
                'param_code' => $code,
                'param_name' => $this->getParamName($code),
                'value' => $value,
                'timestamp' => now(),
            ];
        }

        // 保存到数据库
        ProductionParameter::insert(collection($results)->map(fn($r) => [
            'device_id' => $deviceId,
            'parameter_code' => $r['param_code'],
            'parameter_value' => $r['value'],
            'collected_at' => $r['timestamp'],
        ])->toArray());

        return $results;
    }
}

// WebSocket推送实时数据到前端
class ParameterWebSocket {
    public function pushParameterChange(string $deviceId, float $temperature): void {
        Broadcast::channel("device.{$deviceId}.parameters", [
            'device_id' => $deviceId,
            'temperature' => $temperature,
            'timestamp' => now()->toIso8601ZonedDateTimeString(),
        ]);
    }
}
```

### 63. 质量检验记录

```php
class QualityInspectionService {
    public function createInspection(QualityInspectionRequest $request): InspectionRecord {
        $inspection = InspectionRecord::create([
            'order_id' => $request->orderId,
            'batch_no' => $request->batchNo,
            'inspection_type' => $request->type,  // INCOMING/FINAL
            'inspector_id' => auth()->id(),
            'sample_size' => $request->sampleSize,
            'passed_count' => $request->passedCount,
            'failed_count' => $request->failedCount,
            'defect_types' => $request->defects,  // JSON数组
            'dimensional_data' => $request->measurements,  // 尺寸数据
            'result' => $request->passed ? 'PASS' : 'FAIL',
            'remark' => $request->remark,
        ]);

        // 不合格品自动触发 NCR 流程
        if (!$request->passed) {
            NotConformanceReport::create([
                'related_inspection_id' => $inspection->id,
                'defect_summary' => $this->summarizeDefects($request->defects),
                'severity' => $this->classifySeverity($request->failedCount),
            ]);
        }

        return $inspection;
    }
}
```

### 64. 追溯码管理

```php
class TraceabilityCodeManager {
    public function assignTraceCode(string $workOrderNo): string {
        // SN 码生成规则：批次年月 + 流水号 + 校验位
        $prefix = now()->format('Ymd') . substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 3);
        $serial = $this->getNextSerial($workOrderNo, $prefix);

        $traceCode = $prefix . str_pad($serial, 6, '0', STR_PAD_LEFT) . $this->checkDigit($prefix.$serial);

        TraceCode::create([
            'trace_code' => $traceCode,
            'work_order_no' => $workOrderNo,
            'product_id' => $this->getProductFromWorkOrder($workOrderNo),
            'assigned_at' => now(),
            'status' => 'ASSIGNED',
        ]);

        return $traceCode;
    }

    public function traceBack(string $traceCode): TracebackResult {
        $code = TraceCode::where('trace_code', $traceCode)->firstOrFail();

        // 向上追溯：原材料批次
        $materials = $this->getUsedMaterials($code->work_order_no);

        // 向下追溯：使用情况
        $usage = $this->getUsageRecords($code->product_id);

        return new TracebackResult($code, $materials, $usage);
    }
}
```

### 65-70. MES 快速问答

**65. 如何防止报工作弊？**  
GPS 定位 + NFC 打卡 + 人脸识别 + 随机验证码

**66. 设备停机时间如何统计？**  
PLC 信号监控 + 状态轮询 + 异常告警 + 停机原因代码

**67. OEE（设备综合效率）计算？**  
OEE = 可用率 × 表现性 × 质量率

**68. 如何实现无纸化车间？**  
PDA 扫码 + 电子看板 + 移动终端 + 云端同步

**69. 良率分析怎么做？**  
SPC统计过程控制 + Pareto 分析 + 鱼骨图 + 趋势监控

**70. 防错（Poka-Yoke）系统设计？**  
扫码核对 + 工装夹具检测 + 视觉识别 + 逻辑校验

## OA 系统集成（71-75）

### 71. 审批流引擎

```php
class ApprovalWorkflowEngine {
    public function submitApproval(ApprovalRequest $request): ApprovalNode {
        // 获取审批流定义
        $workflow = WorkflowDefinition::where('type', $request->type)->first();

        // 创建审批实例
        $approval = ApprovalNode::create([
            'workflow_id' => $workflow->id,
            'business_type' => $request->type,
            'business_id' => $request->businessId,
            'applicant_id' => $request->applicantId,
            'current_node' => $workflow->startNodeId,
            'status' => 'PENDING',
            'data' => $request->payload,
        ]);

        // 自动审批节点
        $this->routeToApprovers($approval);

        return $approval;
    }

    private function routeToApprovers(ApprovalNode $approval): void {
        $nextNode = $approval->workflow->getNode($approval->current_node);

        // 串行审批
        foreach ($nextNode->approvers as $approver) {
            Notification::send(User::findOrFail($approver->user_id),
                new ApprovalPending($approval)
            );
        }
    }
}
```

### 72. 组织架构同步

```php
class OrgStructureSync {
    public function syncFromOA(): void {
        // 从 OA 系统拉取部门和员工数据
        $oaDepartments = $this->oaClient->getDepartments();

        foreach ($oaDepartments as $oaDept) {
            $dept = Department::updateOrCreate(
                ['oa_dept_code' => $oaDept->code],
                [
                    'name' => $oaDept->name,
                    'parent_id' => $this->getParentDeptId($oaDept->parentId),
                    'manager_id' => $this->getManagerId($oaDept->managerCode),
                    'level' => $oaDept->level,
                    'path' => $oaDept->path,  // 部门路径
                ]
            );
        }

        // 同步员工
        $oaEmployees = $this->oaClient->getEmployees();
        foreach ($oaEmployees as $oaEmp) {
            Employee::updateOrCreate(
                ['oa_employee_code' => $oaEmp->code],
                [
                    'name' => $oaEmp->name,
                    'department_id' => $oaEmp->departmentId,
                    'position' => $oaEmp->position,
                    'email' => $oaEmp->email,
                    'phone' => $oaEmp->phone,
                    'status' => $oaEmp->status,
                ]
            );
        }
    }
}
```

### 73. 权限账号同步

```php
class UserAccountSync {
    public function syncUserToOA(User $user): void {
        // 创建或更新 OA 账号
        $oaResponse = $this->oaClient->upsertEmployee([
            'employee_code' => $user->employee_id,
            'name' => $user->name,
            'email' => $user->email,
            'password' => $this->hashPassword($user->password),
            'departments' => [$user->department->oa_dept_code],
            'roles' => $user->getRoleNames(),
        ]);

        // 记录同步状态
        UserOASync::create([
            'user_id' => $user->id,
            'oa_user_id' => $oaResponse->userId,
            'sync_status' => 'SUCCESS',
            'synced_at' => now(),
        ]);
    }
}
```

### 74. 消息互通

```php
class MessageIntegration {
    public function sendToOANotification(string $title, string $content, array $recipients): void {
        $this->oaClient->sendNotification([
            'message_type' => 'WORKFLOW',
            'title' => $title,
            'content' => $content,
            'recipients' => $recipients,
            'callback_url' => route('oa.message.callback'),
        ]);
    }

    public function webhookHandler(Request $request): Response {
        // 处理 OA 消息回调
        $webhook = $request->json()->all();

        if ($webhook['type'] === 'APPROVAL_COMPLETE') {
            $this->handleApprovalComplete($webhook);
        }

        return response()->json(['status' => 'OK']);
    }
}
```

### 75-75. OA 快速问答

**75. 如何处理多系统用户账号一致性问题？**  
统一身份认证（SSO）、LDAP/AD集成、账号中间表、定时对账

## UniApp 开发（76-80）

### 76. 微信小程序与 APP 统一开发

```mermaid
graph TD
    subgraph "UniApp 跨平台框架"
        VueCode[Vue 代码<br/>*.vue]
        API[uni-app API]
        Runtime[运行时适配层]
    end

    subgraph "目标平台编译"
        WeChat[小程序编译]
        Android[Android APK]
        iOS[iOS IPA]
        H5[H5 Web]
    end

    subgraph "原生能力调用"
        Camera[摄像头]
        GPS[GPS 定位]
        Bluetooth[蓝牙打印]
        Barcode[扫码模块]
    end

    subgraph "后端服务"
        Laravel[Laravel API]
        WebSocket[WebSocket 推送]
        Redis[(Redis 缓存)]
        SQLite[(本地存储)]
    end

    VueCode --> API
    API --> Runtime

    Runtime --> WeChat
    Runtime --> Android
    Runtime --> iOS
    Runtime --> H5

    API -.-> Camera
    API -.-> GPS
    API -.-> Bluetooth
    API -.-> Barcode

    Laravel --> API
    WebSocket --> API
    Redis --> API
    SQLite --> OfflineStorage
    API --> OfflineStorage

    style VueCode fill:#e1f5ff
    style Runtime fill:#fff3cd
    style Laravel fill:#d4edda
    style SQLite fill:#f8d7da
```

### 76. 微信小程序开发要点

```vue
<!-- pages/work-report/index.vue -->
<template>
  <view class="container">
    <!-- 表单验证 -->
    <form @submit="onSubmit">
      <input v-model="formData.workOrderNo" placeholder="工单号" />

      <!-- 扫码功能 -->
      <button @tap="scanQRCode">扫码报工</button>

      <!-- 提交按钮 -->
      <button type="primary" formType="submit">提交报工</button>
    </form>

    <!-- 实时位置 -->
    <button @tap="getLocation">当前位置</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        workOrderNo: "",
        producedQty: 0,
        defectQty: 0,
        devicePosition: null,
      },
    };
  },

  methods: {
    async scanQRCode() {
      const res = await uni.scanCode({
        type: "qr",
        resultType: "string",
      });

      this.formData.workOrderNo = res.result;
    },

    getLocation() {
      uni.getLocation({
        type: "gcj02",
        success: (res) => {
          this.formData.devicePosition = {
            latitude: res.latitude,
            longitude: res.longitude,
          };
        },
      });
    },

    onSubmit(e) {
      const { detail } = e.detail;

      // 防重复提交
      if (this.submitting) return;

      this.submitting = true;

      wx.request({
        url: "/api/production/report",
        method: "POST",
        data: this.formData,
        success: (res) => {
          if (res.data.code === 0) {
            uni.showToast({ title: "报工成功" });
            setTimeout(() => wx.navigateBack(), 1500);
          }
        },
        fail: (err) => {
          uni.showToast({ title: "提交失败", icon: "none" });
        },
        complete: () => {
          this.submitting = false;
        },
      });
    },
  },
};
</script>
```

### 77. APP跨平台开发策略

```javascript
// manifest.json 配置
{
  "name": "工厂助手",
  "appid": "__UNI__FactoryApp",
  "description": "工厂生产管理系统",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "app-plus": {
    "usingComponents": true,
    "nvue": true,  // 支持原生 UI
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true
    },
    "orientation": ["portrait"],
    "modules": {
      "Barcode": {},  // 条码扫描
      "Location": {},  // GPS定位
      "Push": {}  // 推送通知
    }
  }
}

// 混合开发：NVue 页面
// pages/scanner.nvue
<template>
  <view class="scanner">
    <barcode v-model="scanResult" @scan="onScan"></barcode>
    <text>{{ scanResult }}</text>
  </view>
</template>

<script>
export default {
  data() {
    return {
      scanResult: ''
    }
  },
  methods: {
    onScan(e) {
      console.log('扫描结果:', e.content);
      this.scanResult = e.content;

      // 自动提交
      this.submitScanResult(e.content);
    }
  }
}
</script>
```

### 78. 离线数据存储

```javascript
// 使用 SQLite 本地缓存
import db from "@/common/sqlite.js";

class OfflineStorage {
  constructor() {
    this.initDB();
  }

  async initDB() {
    await db.open({ name: "factory-db" });

    // 创建表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        work_order_no TEXT,
        produced_qty INTEGER,
        status TEXT,
        created_at DATETIME
      )
    `);
  }

  async saveReportLocally(report) {
    // 离线保存报工数据
    await db.run(
      "INSERT INTO reports (work_order_no, produced_qty, status, created_at) VALUES (?, ?, ?, ?)",
      [report.workOrderNo, report.producedQty, "PENDING_SYNC", new Date()],
    );

    uni.showToast({ title: "已离线保存" });
  }

  async getOfflineReports() {
    return db.select("SELECT * FROM reports WHERE status = ?", [
      "PENDING_SYNC",
    ]);
  }

  async syncOfflineData() {
    const reports = await this.getOfflineReports();

    for (const report of reports) {
      try {
        await api.submitReport(report);

        // 同步成功后更新状态
        await db.run("UPDATE reports SET status = ? WHERE id = ?", [
          "SYNCED",
          report.id,
        ]);
      } catch (error) {
        console.error("同步失败:", error);
      }
    }
  }
}
```

### 79. 离线数据存储方案

```mermaid
sequenceDiagram
    participant App as UniApp 客户端
    participant Sync as 同步管理器
    participant Server as Laravel 服务器
    participant DB as SQLite 本地数据库

    Note over App,DB: 无网络环境下的操作

    App->>App: 工人扫码报工
    App->>DB: INSERT 离线记录
    Note over DB: status='PENDING_SYNC'
    App-->>App: 显示"已保存，等待同步"

    Note over App,Server: 网络恢复后自动触发

    loop 定时轮询网络状态
        App->>Sync: checkNetworkStatus()
        alt 有网络连接
            Sync->>DB: SELECT * WHERE status='PENDING_SYNC'

            loop 逐条同步
                DB-->>Sync: 获取待同步记录
                Sync->>Server: POST /api/reports/batch

                par 并行处理
                    Server->>Server: 校验业务逻辑
                    Server->>Server: 写入 MySQL 主库
                    Server-->>Sync: 返回成功 IDs
                end

                Sync->>DB: UPDATE status='SYNCED'
            end

            Server-->>App: 推送实时进度更新
        else 无网络连接
            Sync->>App: continue waiting...
        end
    end

```

```javascript
// 懒加载列表
<scroll-view scroll-y @scrolltolower="loadMore" :style="{ height: windowHeight }">
  <view v-for="item in list" :key="item.id">{{ item.name }}</view>
</scroll-view>

<script>
export default {
  data() {
    return {
      list: [],
      page: 1,
      loading: false
    }
  },

  onLoad() {
    this.loadData();
  },

  onReachBottom() {
    this.loadMore();
  },

  methods: {
    async loadData() {
      if (this.loading) return;

      this.loading = true;

      const res = await api.getReports({
        page: this.page,
        limit: 20
      });

      this.list.push(...res.data);
      this.page++;
      this.loading = false;
    },

    loadMore() {
      this.loadData();
    }
  }
}
</script>
```

### 80. 原生模块调用

```javascript
// 调用原生蓝牙打印小票打印机
async function printWorkOrder Slip(workOrderNo) {
  const scannerModule = plus.os.modules('com.factory.barcode.Scanner');

  const barcode = await scannerModule.scan();

  // 打印标签
  const bluetoothModule = plus.os.modules('com.factory.bluetooth.Printer');

  await bluetoothModule.connect(PRINTER_ADDRESS);

  const content = \`
    工单号：${workOrderNo}
    产品：${productName}
    数量：${quantity}
  \`;

  await bluetoothModule.print(content);

  await bluetoothModule.disconnect();
}
```

## 附录：典型集成架构图

```mermaid
flowchart LR
    subgraph Frontend[前端应用层]
        WebApp[Web 管理端]
        MobileApp[移动端 APP]
        IoT[IoT 设备]
    end

    subgraph Auth[统一认证中心]
        IAM[OAuth2 与 JWT]
        RBAC[RBAC 权限控制]
    end

    subgraph Core[核心业务平台]
        APIGW[API Gateway]
        OrderSvc[订单服务]
        ProdSvc[生产服务]
        QualitySvc[质量服务]
        InvSvc[库存服务]
        MsgSvc[消息服务]
    end

    subgraph Data[数据与消息层]
        MySQL[(MySQL 业务数据)]
        Redis[(Redis 缓存与队列)]
        Mongo[(MongoDB 日志与时序数据)]
        ES[(Elasticsearch 搜索)]
        Kafka[Kafka]
    end

    subgraph External[外部系统集成]
        SAP[SAP ERP 财务与采购]
        MES[MES 制造执行]
        OA[泛微 OA 审批流]
        WMS[WMS 仓储]
        PLM[PLM 与 CAD 设计数据]
        PLC[PLC 与 SCADA 实时采集]
    end

    WebApp --> APIGW
    MobileApp --> APIGW
    IoT --> APIGW
    IAM -.-> APIGW
    RBAC -.-> APIGW

    APIGW --> OrderSvc
    APIGW --> ProdSvc
    APIGW --> QualitySvc
    APIGW --> InvSvc
    APIGW --> MsgSvc

    OrderSvc --> MySQL
    ProdSvc --> MySQL
    QualitySvc --> MySQL
    InvSvc --> MySQL
    OrderSvc --> Redis
    ProdSvc --> Redis
    QualitySvc --> Mongo
    OrderSvc --> ES
    MsgSvc --> Kafka

    OrderSvc <--> SAP
    ProdSvc <--> MES
    MsgSvc <--> OA
    InvSvc <--> WMS
    ProdSvc <--> PLC
    OrderSvc <--> PLM

    style WebApp fill:#e1f5ff
    style MobileApp fill:#d4edda
    style APIGW fill:#fff3cd
    style OrderSvc fill:#f8d7da
    style SAP fill:#ffeaa7
    style MES fill:#fd79a8
    style PLC fill:#00b894
    style MySQL fill:#74b9ff
    style Redis fill:#a29bfe
    style Mongo fill:#6c5ce7
```

::: tip
本文档覆盖了系统集成面试的核心理论与实战案例，重点展示了 Laravel 在企业级应用开发中的集成能力。
:::
