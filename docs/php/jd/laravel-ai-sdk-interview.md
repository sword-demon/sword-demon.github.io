---
title: 制造业 PHP 面试题：Laravel AI SDK 与大模型集成（181—200）
date: 2026-11-26 10:30:00
categories: [面试, PHP, AI]
tags: [PHP, Laravel, AI, LLM, RAG, Agent, 面试题]
sidebarSort: 8
---

# 制造业 PHP 面试题：Laravel AI SDK 与大模型集成（181—200）

本篇承接前六篇 180 题, 聚焦 Laravel 13 + PHP 8.3+ 环境下把大模型接进既有 MES / E-DHR / ERP / OA 系统的工程问题. 官方的 `laravel/ai` 包是当前 Laravel 生态里最贴合本岗位的一等公民方案, 本篇以它的真实 API 为主线, 覆盖 Agent 编排、结构化输出、工具调用、会话存储、流式协议与人工审批.

::: tip 阅读说明
示例基于 `laravel/ai` v1.x 系列 (命名空间 `Laravel\Ai\`) 与 Laravel 13.x 编写, 并标注了 12.x 上的差异. 涉及金额、审批、扣料的动作都保留人工确认环节, 不建议让模型直接写生产数据. 本文中的场景为面试设计案例, 不代表本人已交付的项目经历.
:::

## 一、SDK 选型与工程边界

### 181. Laravel 项目要接大模型, 为什么优先考虑官方 `laravel/ai` 而不是自己封 HTTP 客户端?

**参考回答:** 官方 SDK 把"提示编排 + 多供应商适配 + 结构化输出 + 工具调用 + 会话存储 + 流式协议"这些横切能力收进 Laravel 的既有概念里: 服务容器、配置、队列、事件、中间件、模型都能复用. 自己用 `Illuminate\Http\Client` 裸封装也能跑, 但要自己处理多供应商字段差异、重试、流式分块、工具调用协议与 usage 统计, 长期维护成本高. [L1][L1]

**追问要点:** 官方 SDK 底层封装了 Prism, 通过 `PrismGateway` 把调用转给 Prism 的供应商实现, 因此"用官方 SDK"和"用 Prism"并不冲突. 若需要官方 SDK 尚未覆盖的第三方供应商, 可在 Prism 层扩展, 但要注意第三方 Prism 驱动在 `laravel/ai` 的 Agent 路径上未必立即可用, 属于需要实测确认的边界. [L2][L2]

**场景追问:** 面试官会问"你怎么保证不被单一供应商锁死". 回答方向是: 应用层只依赖 `Agent` 抽象和 `Lab` 枚举, 切换供应商只改配置或 `provider:` 参数; 同时保留 HTTP 层的原始响应 (`$response->raw`), 便于对账与排障.

### 182. `laravel/ai` 支持哪些能力, 选型时该划哪条边界?

**参考回答:** 官方文档列出的能力线包括: 文本生成、结构化输出、嵌入 (Embeddings)、图像生成、语音合成 (TTS)、语音转写 (STT)、文件处理、工具调用、流式输出与重排 (Reranking). 文本方向覆盖 OpenAI、Anthropic、Gemini、Azure、Groq、xAI、DeepSeek、Mistral、Ollama 等; 嵌入方向另有一组供应商; 图像与语音的供应商范围更窄, 需按实际使用核对. [L1][L1]

**边界判断:** 这套 SDK 解决的是"你的业务系统里有一个 AI 能力", 而不是"你的业务系统就是一个通用 Agent 平台". 判断标准是: AI 是不是主流程的一环. 如果 AI 只是偶发地帮忙写一段文案, 用一次 HTTP 调用就够; 如果 AI 参与判断、调用内部工具、维护会话、要被审计和审批, 就该上 Agent + 工具 + 审批的完整链路.

### 183. 版本上该锁 Laravel 12 还是 Laravel 13? 对 AI 功能有影响吗?

**参考回答:** 官方支持政策是 18 个月 Bug 修复 + 2 年安全修复, Laravel 11 的安全修复已于 2026 年 3 月 12 日结束; Laravel 12 的 Bug 修复截止 2026 年 8 月 13 日、安全修复截止 2027 年 2 月 24 日; Laravel 13 于 2026 年 3 月 17 日发布, 需要 PHP 8.3–8.5, Bug 修复到 2027 年第三季度, 安全修复到 2028 年 3 月 17 日. [L3][L3]

**对 AI 的实际影响:** Laravel 13 强化了与 AI 的原生集成方向, 例如数据库层的向量能力 (`Schema::ensureVectorExtensionExists()`、`whereVectorSimilarTo()`、`orderByVectorDistance()`) 与 `Str::of(...)->toEmbeddings()` 这类便捷入口; 若项目要做 RAG, 优先评估 13.x 的原生路径, 避免同时维护"原生实现"和"第三方包实现"两套. [L1][L1]

**追问要点:** 存量 MES 项目通常短期无法升级大版本, 此时应把 AI 层做成独立模块, 通过接口隔离 SDK 版本差异, 而不是让 AI 调用散落在 Controller 里.

### 184. 多供应商切换和故障转移 (failover) 在 SDK 里怎么落地?

**参考回答:** `prompt()` 等方法接受 provider 数组即可启用故障转移, 既可以传枚举数组, 也可以传以枚举值为键的关联数组指定每个供应商的模型:

```php
use Laravel\Ai\Enums\Lab;

$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: [
        Lab::Gemini->value => 'gemini-3-flash-preview',
        Lab::DeepSeek->value => 'deepseek-v4-pro',
    ],
);
```

注意 PHP 的数组键不能直接用枚举实例, 必须用 `->value`. [L1][L1]

**关键边界:** 故障转移只在抛出 `FailoverableException` 家族异常时触发, 包括 `RateLimitedException` (限流)、`ProviderOverloadedException` (过载或不可用)、`InsufficientCreditsException` (额度不足); 普通错误如参数校验失败、请求非法不会触发转移. 这条边界决定了重试策略要分层: 可转移异常交给 SDK, 不可转移异常应该立即失败并告警. [L1][L1]

### 185. 怎么统计 token 消耗和调用成本?

**参考回答:** 响应对象上有 `usage` 信息, 每个步骤 (step) 也有各自的 `usage`; 原始 HTTP 响应通过 `$response->raw` 拿到, 是 `Illuminate\Http\Client\Response`, 可以读取响应头 (如限流余量) 和 JSON 字段. 嵌入接口的原始响应里也可能带 `usage.cost` 这类供应商自定义字段, 需要按供应商核对. [L1][L1]

**追问要点:** 成本控制上, 官方提供 `UseCheapestModel` 与 `UseSmartestModel` 两个属性做自动选型——摘要、分类这类任务挂便宜模型, 复杂推理挂强模型. 更进一步的做法是按业务线拆成不同的 Agent 类, 而不是在一个 Agent 里靠运行时判断. 生产上要把 token 用量打到日志或指标系统, 否则成本上涨是事后才发现的.

## 二、Agent 设计与提示编排

### 186. 一个 Agent 到底由哪几部分组成?

**参考回答:** 以官方示例的 `SalesCoach` 为准, 一个 Agent 由四块组成: (1) `instructions()` 说明这个 Agent 的角色与约束; (2) `messages()` 提供上下文历史; (3) `tools()` 暴露可调用的内部能力; (4) `schema()` 约定结构化输出的形状. 类层面实现 `Agent` 契约并 `use Promptable`, 需要时再叠加 `HasTools`、`HasStructuredOutput`、`Conversational`、`HasMiddleware`、`HasProviderOptions` 等契约. [L1][L1]

**工程建议:** 制造企业场景里, "判断这张 E-DHR 记录是否合规" 适合做成有工具、有结构化输出的 Agent——工具负责查数据库和规则, 输出结构负责把结论和依据一起落库. 纯问答型功能才用只写 `instructions()` 的最小 Agent.

### 187. `prompt()` 和临时 `agent()` 辅助函数怎么选?

**参考回答:** `agent()` 用于一次性、无需复用的场景, 直接传 instructions / messages / tools / schema:

```php
use function Laravel\Ai\agent;

$response = agent(
    instructions: 'You are an expert at software development.',
    messages: [],
    tools: [],
)->prompt('Tell me about Laravel');
```

长期维护的能力应当做成独立的 Agent 类, 便于加属性、加中间件、写测试. 一次性 `agent()` 的好处是短, 坏处是无法版本化、无法单独测试、无法统一注入中间件. [L1][L1]

### 188. 构造器需要参数时, Agent 怎么创建?

**参考回答:** 用 `make()` 传具名参数, 容器负责解析其余依赖:

```php
$agent = SalesCoach::make(user: $user);
```

也可以直接 `new SalesCoach($user)`. 面试常问"为什么不能把 user 存成静态属性", 答案是 Octane 常驻 worker 下静态属性会跨请求残留, 造成 A 工厂的数据被 B 工厂读到——这与本系列第一篇讲的常驻进程上下文泄漏是同一个问题. [L1][L1]

### 189. 怎么在运行时覆盖模型、供应商和超时?

**参考回答:** `prompt()` 支持具名参数直接覆盖:

```php
$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: Lab::Anthropic,
    model: 'claude-sonnet-5',
    timeout: 120,
);
```

类级别可以用属性声明默认值: `#[Provider]`, `#[Model]`, `#[MaxSteps]`, `#[MaxTokens]`, `#[Temperature]`, `#[TopP]`, `#[Timeout]`, 以及 `#[UseCheapestModel]` / `#[UseSmartestModel]`. [L1][L1]

**边界:** 不同供应商对温度、最大步数等参数的支持程度不同, 官方说明不支持的属性会被忽略, 因此同一份 Agent 定义可以安全地配故障转移. 但"被忽略"意味着行为不一致, 跨供应商验收时要用实际响应确认.

### 190. 提示里塞了完整会话历史, 会不会又慢又贵? 有哪些控制手段?

**参考回答:** 会话历史是典型的上下文膨胀源. 控制手段有四类: (1) 截断——`messages()` 里自己 `limit()` 并倒序取最近 N 条, 或者用官方提供的按参与者取最近会话的能力; (2) 摘要压缩——把早期轮次压成一段摘要再作为系统消息; (3) 缓存——`#[CacheInstructions]` 与 `#[CacheToolDefinitions]` 属性可以复用提示前缀缓存, 默认保留 5 分钟, Anthropic 可通过属性传 `'1h'` 延长到 1 小时; (4) 用 `#[MaxSteps]` 限制单次运行的最大步骤数, 防止工具调用循环失控. [L1][L1]

**重要边界:** 缓存指令和缓存工具定义必须同时生效——官方说明因为供应商按"工具 → 指令 → 消息"的顺序拼装请求, 只缓存其中一个会抛 `InvalidArgumentException`. 如果 `instructions()` 每次都带当前日期这类变化内容, 缓存前缀每次都不同, 只会白白付出写入缓存的成本, 这种场景应该只缓存工具定义. [L1][L1]

## 三、结构化输出与工具调用

### 191. 结构化输出怎么写? 拿到结果后还需要自己校验吗?

**参考回答:** 实现 `HasStructuredOutput` 并定义 `schema()`, 用 `Illuminate\Contracts\JsonSchema\JsonSchema` 构造类型:

```php
public function schema(JsonSchema $schema): array
{
    return [
        'feedback' => $schema->string()->required(),
        'score' => $schema->integer()->min(1)->max(10)->required(),
    ];
}
```

结果可以按数组访问: `$response['score']`. 支持嵌套对象 (`$schema->object(...)`)、对象数组 (`$schema->array()->items(...)`) 和 `anyOf` 多态结构. [L1][L1]

**追问要点:** 结构化输出解决的是"形状", 不是"正确性". 模型给出的 `score => 9` 依然可能是错的. 落到数据库前仍要用 Laravel 的验证规则校验取值范围和业务约束, 例如"判定不合格的结论必须附带至少一条依据编号". 这是把不确定输出接回确定性系统的关键一步.

### 192. 工具 (Tool) 怎么定义? 怎么防止模型乱传参数?

**参考回答:** 实现 `Laravel\Ai\Contracts\Tool`, 提供 `description()`、`schema()`、`handle()` 三个方法. `description()` 决定模型何时调用它, 写得含糊模型就会乱用; `schema()` 决定参数形状; `handle()` 接收 `Laravel\Ai\Tools\Request` 并返回结果. 参数在 `handle()` 里仍要用 Laravel 规则校验:

```php
public function handle(Request $request): Stringable|string
{
    $validated = $request->validate([
        'city' => 'required|string',
        'days' => 'required|integer|max:7',
    ]);

    return $this->forecast($validated['city'], $validated['days']);
}
```

[L1][L1]

**场景追问:** 面试官爱问"模型会不会把 path 传成 `../../etc/passwd`". 正确回答是: `schema()` 里的字符串类型约束不等于路径白名单校验, 工具内部必须自己做路径规范化与归属校验, 越权防护不能只靠模型.

### 193. 工具太多导致选错, 有哪些官方手段?

**参考回答:** 三种. (1) 运行时替换工具集: `withTools([...])` 直接指定, 或 `withTools(fn (array $tools) => [...$tools, new LookupOrder])` 追加; (2) 延迟加载: `ToolSearch` 把一组工具包起来, 让模型按需检索, 减少每步都带上全部工具定义的开销:

```php
use Laravel\Ai\Providers\Tools\ToolSearch;

public function tools(): iterable
{
    return [
        new Weather,
        new ToolSearch(tools: [
            new SearchInvoices,
            new RefundOrder,
        ]),
    ];
}
```

(3) 中间件在第一步之后摘掉昂贵工具, 例如 `if (! $step->isFirstStep()) { $step = $step->withoutTools('SearchDocumentation'); }`. [L1][L1]

**追问要点:** 工具定义本身占提示词, 工具一多既贵又容易选错. 工具数量应该按"一个 Agent 只服务一个明确场景"来控制, 而不是把所有内部 API 都塞进一个万能 Agent.

### 194. 模型返回了不存在的工具名或参数不对, 怎么办?

**参考回答:** 官方提供 `#[RepairToolCalls]` 属性, 让 SDK 在工具调用不匹配时尝试修复再执行. 这是兜底手段, 不是免责手段——修复逻辑本身也可能把错误参数"修"成一个更危险的值. [L1][L1]

**工程建议:** 关键路径仍要自己断言. 涉及金额、数量、状态变更的工具, 应当把"模型决定的参数"和"系统校验后的参数"分开记录, 落库时以系统校验结果为准, 并保留原始参数便于追溯.

### 195. RAG 场景怎么接向量检索?

**参考回答:** 官方提供 `SimilaritySearch` 工具, 直接以模型类和列名做相似度检索:

```php
use Laravel\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        SimilaritySearch::usingModel(Document::class, 'embedding'),
    ];
}
```

支持附加过滤条件与相似度阈值:

```php
SimilaritySearch::usingModel(
    model: Document::class,
    column: 'embedding',
    minSimilarity: 0.7,
    limit: 10,
    query: fn ($query) => $query->where('published', true),
);
```

[L1][L1]

**追问要点:** 阈值不是越小越好, 阈值过低会把不相关片段塞进上下文, 既增加成本又引入幻觉; 过滤条件必须包含租户/工厂维度, 否则跨工厂检索会构成数据越权.

### 196. 嵌入向量怎么生成和存储?

**参考回答:** 嵌入通过 `Laravel\Ai\Embeddings` 构造:

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for(['Hello world'])
    ->generate(provider: 'openrouter');
```

也可以对字符串链式调用 `Str::of(...)->toEmbeddings()`. 存储侧, Laravel 13 提供原生向量列支持, `pgvector/pgvector` 包则提供 `vector` / `halfvec` / `bit` / `sparsevec` 列类型与 `nearestNeighbors()` 查询, 支持 HNSW 与 IVFFlat 索引以及内积、余弦、L2 等距离度量. [L1][L1] [L4][L4]

**必须确认的点:** 换 embedding 模型意味着维度变化, 老向量不能直接混用; 换模型必须整表重算并切换, 这是 RAG 里最容易踩的"静默错误"——维度不匹配时报错还好, 维度相同但语义空间不同的模型混用会静默返回错误结果.

## 四、会话、流式与人工审批

### 197. 多轮会话怎么持久化? 怎么防止越权读取别人的会话?

**参考回答:** 实现 `Conversational` 并 `use RemembersConversations` 即可获得会话存储; 参与者模型 `use HasConversations` 后可拥有 `$user->conversations()` 关联. 发起用 `forUser($user)` 或 `forParticipant($team)`, 继续用 `continue($conversationId, as: $user)`、`continueOrStart(...)`、`continueLastConversation(...)`. 响应里会带 `conversationId`、`userMessageId`、`assistantMessageId`. [L1][L1]

**安全要点:** 前端传来的 `conversationId` 必须校验归属, 官方给出的做法是 `abort_unless($store->conversationBelongsTo($conversationId, $user->getMorphClass(), $user->getKey()), 403)`. 少这一步就是典型的越权读取. 消息读取通过 `ConversationStore::paginateConversationMessages()` 分页获取, 消息对象上能看到 `steps`、`toolCalls()`、`toolResults()`、`usage`、`status`. [L1][L1]

### 198. 流式输出怎么接前端? 中途怎么拿到完整结果?

**参考回答:** 路由里直接返回 stream:

```php
Route::get('/coach', function () {
    return (new SalesCoach)->stream('Analyze this sales transcript...');
});
```

流结束后做后处理用 `then()`:

```php
->then(function (StreamedAgentResponse $response) {
    // $response->text, $response->events, $response->usage
});
```

需要逐事件处理就 `foreach ($stream as $event)`. 协议层支持 Vercel AI SDK 数据协议 (`->usingVercelDataProtocol()`)、AG-UI 协议 (`->usingAgentUserInteractionProtocol()`) 和自定义协议 (`->usingProtocol(new CustomProtocol)`), 前端请求可以用 `Vercel::chat($request)` 与 `AgentUserInteraction::chat($request)` 做适配器解析. [L1][L1]

**工程要点:** 流式响应必须配超时与断线清理; 流中出错不能只写日志, 要让前端拿到可识别的错误事件, 否则用户看到的是"卡住不动". 流式场景的审计要在 `then()` 里落库, 因为中途的 token 事件不等于最终结果.

### 199. 高风险动作必须人工确认, 官方怎么支持?

**参考回答:** 工具实现 `Approvable` 契约并 `use InteractsWithApprovals` 后即为"可审批工具", 默认就需要审批. 可以按参数决定是否需要审批:

```php
use Laravel\Ai\Approvals\Approval;

protected function needsApproval(Request $request): Approval|bool
{
    return str_starts_with($request['path'], 'temporary/')
        ? false
        : Approval::required('This will permanently delete a file.');
}
```

也可以在 Agent 的 `tools()` 里用 `withoutApproval()` / `requireApproval('...')` 覆盖. 运行时模型发起调用后, Agent 暂停, 响应上可读 `hasPendingApprovals()` 和 `pendingApprovals` (含 `id`、`tool`、`arguments`、`reason`). [L1][L1]

**恢复流程:** 继续会话时把决策传回去:

```php
use Laravel\Ai\Approvals\Decision;
use Laravel\Ai\Approvals\Decisions;

$response = (new FileAssistant)
    ->continue($conversationId, as: $user)
    ->prompt(Decisions::from([
        'call_abc' => Decision::approve(),
        'call_ghi' => Decision::reject('The invoice must be retained.'),
    ]));
```

布尔值 `true`/`false` 是批准与拒绝的简写; `approveRemaining()` / `rejectRemaining()` 可以给未显式决策的调用兜底; 未知、缺失或已解决的调用 ID 会抛 `ApprovalMismatchException`. 带结果的拒绝 (如 `Decision::reject('原因')`) 会把结果回传给模型继续回答, 不带结果的拒绝则终止生成循环. [L1][L1]

**边界:** 审批恢复要求暂停那一轮的历史可被取回, 因此 Agent 必须是对话型 (使用 `RemembersConversations`) 或由前端通过 `withMessages` 提供历史, 否则会抛 `ApprovalNotResumableException`. 暂停的轮次按会话和待审批调用匹配, 而不是按发起人匹配, 所以恢复前必须先校验会话归属. [L1][L1]

### 200. AI 功能怎么写测试?

**参考回答:** 官方提供 fake 能力. Agent 可以 `SalesCoach::fake()` 返回固定响应, `fake([...])` 返回一组响应, 或 `fake(fn (AgentPrompt $prompt) => ...)` 按输入动态返回; 结构化输出的 Agent 可以直接 fake 数组 (如 `[['score' => 87]]`); 处于等待审批状态的响应可以用 `AgentResponse::fakeWithPendingApprovals([...])` 构造. 队列化的生成任务在 fake 时仍会调用 `then` 回调, 若不希望回调执行可同时 `Queue::fake()`. [L1][L1]

**面试升级问题:** "fake 之后还能信吗?" 回答方向: fake 只证明编排逻辑 (选了什么工具、传了什么参数、拿到结果怎么落库) 是对的, 不证明模型行为; 模型侧质量要靠离线评测集和线上采样人工复核, 这部分不能用 fake 替代. 另外要测失败路径——限流、超时、工具抛异常、流中断, 这些恰恰是 fake 默认覆盖不到的.

## 五、把一次 AI 辅助质检讲成完整实现

**教学场景：** A 工厂质检员上传一张 E-DHR 批记录照片, 系统要给出"是否合格"的判定和依据, 判定涉及金额与放行时必须人工确认. 目标是"结论可解释、动作不可越权、过程可追溯".

1. **输入边界:** 图片上传走既有附件服务, 校验格式与大小; 图片本身不直接进 prompt, 由工具按路径读取并做归属校验后再传给模型, 避免模型拿到任意文件系统路径.
2. **上下文装配:** Agent 的 `instructions()` 写明判定标准与"证据不足时必须回答不确定"的约束; `messages()` 只带最近若干轮; 批记录正文通过 `SimilaritySearch` 带阈值和工厂过滤检索, 不把整库内容塞进上下文.
3. **结构化输出:** `schema()` 约定 `verdict` (合格 / 不合格 / 不确定)、`reasons` 数组、`needReview` 布尔. 输出经 Laravel 规则二次校验, `verdict` 为"不合格"但 `reasons` 为空时判定为无效输出并走兜底.
4. **危险动作:** 涉及放行/扣减的动作封装为 `Approvable` 工具, 默认需要审批; 审批页展示工具名、参数和理由, 审批人通过 `Decisions` 恢复会话. 未审批前不产生任何写操作.
5. **落库与留痕:** 保存本次输入摘要、检索到的片段 ID、模型原始输出、校验后结论、审批人与决策时间. 审批恢复时把"审批决定"与"最终动作"关联到同一条记录, 保证可从记录反查完整链路.

::: tip 特别解释：模型判断与系统判断的分界
模型可以给出"倾向不合格"这样的判断, 但"放行/扣减"必须由系统依据确定性规则和人的授权决定. 把模型输出直接写进生产表, 等于把一个概率性组件接进了合规链路.
:::

**自测与预期:** 输入一张缺少检测值的批记录, 系统应返回"不确定"而不是编造不合格结论; 审批人拒绝后, 工具不执行且记录里能看到拒绝原因; 检索请求里始终带工厂过滤条件。以上是验收设计, 不是已执行的测试结果.

## 关键术语与专业解释

下列定义为官方概念的中文概括; 场景建议是工程推导, 不是框架的绝对保证.

| 术语 | 专业解释 | 容易混淆的边界 |
| --- | --- | --- |
| Agent | 把角色指令、上下文、工具与输出结构打包在一起的可复用单元 | 不是"更长的 prompt"; 它的价值在于可测试、可审批、可版本化 |
| Promptable | 提供 `prompt()` / `stream()` 等调用入口的 trait | 提供了调用方式, 不代表自动具备会话或工具能力 |
| Tool | 暴露给模型的函数能力, 由 description / schema / handle 三部分组成 | 模型决定"调不调、传什么", 真正的权限校验必须在 handle 里 |
| Structured Output | 按 JSON Schema 约束模型返回形状 | 保证形状合法, 不保证取值正确或业务合规 |
| Embedding | 把文本映射为向量的表示, 用于相似度检索 | 换模型即换语义空间, 维度相同不代表兼容 |
| RAG | 先检索相关片段再交给模型作答 | 检索不到时模型仍会作答, 所以需要"不确定"出口与阈值 |
| Provider Failover | 限流、过载、额度不足时自动切到备用供应商 | 不会在参数错误等普通异常上切换 |
| Human Tool Approval | 高风险工具执行前暂停, 人工决策后恢复运行 | 恢复前必须校验会话归属, 否则可越权批准他人操作 |
| Context Window | 单次请求能携带的 token 上限 | 塞满不等于塞得多, 无关上下文会降低质量 |
| Prompt Caching | 复用相同前缀的计费与计算 | 前缀每轮都变时缓存只会产生成本 |
| Max Steps | 单次 Agent 运行允许的最大步骤数 | 与工具调用次数相关, 是防止死循环的闸门 |

### 基础关键词补充：先理解，再记缩写

| 关键词 | 通俗解释与本篇场景 | 必须区分的概念 |
| --- | --- | --- |
| LLM | 大语言模型, 本篇的调用对象 | 模型输出是概率性的, 不能直接当作事实 |
| Token | 模型计费与长度单位 | token 数不等于字符数, 中英文差异很大 |
| Hallucination（幻觉） | 模型自信地给出不存在的信息 | 结构化输出无法消除幻觉, 只能暴露它 |
| RAG | 检索增强生成 | 是"先查资料再回答", 不是训练模型 |
| Agent 循环 | 模型 → 工具 → 结果 → 模型 的多步过程 | 每步都可能失败, 必须有步数上限与超时 |
| MCP | 让 AI 以标准协议访问外部工具与数据源 | 与 AI SDK 是不同层次, 见下一篇 |
| Slash Command / Skill | 开发者给 AI 的工作流约定 | 是提示与流程约定, 不改变模型能力边界 |
| Token 预算 | 给单次任务设定的成本上限 | 与 Max Steps 不同, 一个限钱一个限步数 |

## 官方资料与核查口径

- [L1. Laravel AI SDK 文档 (13.x)](https://laravel.com/docs/13.x/ai-sdk).
- [L2. Prism: Laravel 的多供应商 LLM 抽象层](https://prismphp.com/getting-started/introduction.html).
- [L3. Laravel Release Notes: 版本与支持政策](https://laravel.com/framework/docs/13.x/releases).
- [L4. pgvector/pgvector: PHP 与 Laravel 的向量类型支持](https://github.com/pgvector/pgvector-php).
- [L5. Laravel AI SDK v1 公告: 会话存储、流式与工具审批](https://laravel.com/blog/introducing-laravel-ai-sdk-v1).
- [L6. Laravel Boost: 面向 AI 编码代理的 MCP 工具集](https://laravel.com/framework/docs/boost).

## 延伸阅读

- [下一篇：PHP AI 生态与 MCP 工具协议（201—220）](./php-ai-ecosystem-mcp-interview.md)
- [上一篇：测试、上线与需求协作（151—180）](./delivery-troubleshooting-interview.md)
- [返回 PHP 面试指南](../index.md)
- [Laravel AI SDK](https://laravel.com/docs/13.x/ai-sdk)
- [Laravel Boost](https://laravel.com/framework/docs/boost)
