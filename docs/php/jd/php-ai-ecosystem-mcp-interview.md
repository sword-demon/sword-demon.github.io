---
title: 制造业 PHP 面试题：PHP AI 生态与 MCP 工具协议（201—220）
date: 2026-11-26 11:00:00
categories: [面试, PHP, AI]
tags: [PHP, Laravel, MCP, Prism, Composer, AI, 面试题]
sidebarSort: 9
---

# 制造业 PHP 面试题：PHP AI 生态与 MCP 工具协议（201—220）

上一篇讲的是在业务系统里怎么用 `laravel/ai` 建 AI 功能. 本篇往外扩一层: PHP 生态里还有哪些可用的 AI 组件, MCP 这套协议解决了什么问题, 以及 PHP 语言本身在 8.3–8.5 这几个版本里为 AI 应用铺了哪些路.

::: tip 阅读说明
示例涉及 `laravel/ai` v1.x、`prism-php/prism`、`laravel/boost`、`laravel/mcp`、`mcp/sdk`、`openai-php/client` 与 `pgvector/pgvector`, 版本号以 Packagist 与官方仓库为准. 本文中的场景为面试设计案例, 不代表本人已交付的项目经历.
:::

## 一、PHP 生态里有哪些 AI 组件, 怎么分工

### 201. PHP 的 AI 生态大致分几层? 各自的代表是什么?

**参考回答:** 可以分四层来记. (1) 官方应用层 SDK——`laravel/ai`, 直接在 Laravel 应用里建 Agent, 是本岗位最相关的一层; (2) 多供应商抽象层——`prism-php/prism`, 把不同厂商的请求/响应统一成一套值对象与 Pending Request 链式调用, `laravel/ai` 底层就封装了它; (3) 厂商官方客户端——`openai-php/client` (OpenAI 官方 PHP SDK, 覆盖 Responses / Chat / Audio / Embeddings / Files / Images / Vector Stores / Batches / Fine-tuning, 流式用 `createStreamed` / `retrieveStreamed`), 需要精细控制原始 API 时直接用; (4) 社区套件——LLPhant、Embedder 这类面向 PHP 的 AI 工具库, 以及 `openai-php/laravel` 这类框架适配包. [L1][L1] [L2][L2] [L3][L3]

**选型口诀:** 要框架集成和 Agent 能力用官方 SDK, 要跨供应商统一抽象用 Prism, 要完全贴合厂商 API 特性用官方客户端, 要现成的社区轮子才看社区包. 三者并不互斥, 但同一功能不要同时维护两套实现.

### 202. Prism 解决了什么问题? 它的调用风格是什么样的?

**参考回答:** Prism 定位是"Laravel 原生的统一 LLM 接口", 借鉴了 Vercel AI SDK 的抽象思路. 核心是 `PrismManager` 作为注册表/工厂, 用 Provider 枚举或字符串标识解析具体供应商, 提供 `resolve()`、`extend()` 和 `create{Name}Provider()` 等扩展点. 风格上是 Pending Request 模式——先拿到构建器, 链式设置参数, 最后才发起调用:

```php
Prism::text()->using('openai', ['model' => 'gpt-5'])->withPrompt('...')->generate();
```

门面与辅助函数覆盖 `Prism::text()`、`Prism::structured()`、`Prism::embeddings()`、`Prism::image()`、`Prism::audio()`, 另有 `prism()` 辅助函数. [L4][L4]

**边界:** Prism 与 `laravel/ai` 的关系是"底层被封装", 不是二选一. 用 Prism 而不用官方 SDK 的典型理由是需要官方 SDK 尚未覆盖的供应商, 此时可以在 Prism 层 `extend()` 注册自定义驱动; 但第三方 Prism 驱动在 `laravel/ai` 的 Agent 路径上并不必然可用, 官方仓库仍有相关议题待收敛, 这属于必须实测的边界而不是可以照抄的结论. [L4][L4]

### 203. 第三方供应商要接入, 在哪一层扩展?

**参考回答:** 在 Prism 层扩展最直接: 通过 `PrismManager::extend()` 注册自定义 Provider 实现, 之后用 `Prism::text()->using('bedrock', ...)` 之类的字符串标识调用. 官方也提到 Prism Relay 可以把 Prism 支持的模型以 MCP 服务器形式对外暴露, Prism Server 则可以把模型包装成 OpenAI 兼容接口, 方便内部其他系统接入. [L4][L4]

**工程建议:** 扩展点要收在网关层, 不要让业务代码里散落 `using('xxx')` 字符串. 建议应用层只依赖自己定义的 `AiProvider` 抽象, 由一个网关类把具体供应商映射过去, 换供应商时只改这一处.

### 204. 用原生 HTTP 客户端调大模型 API, 有哪些坑?

**参考回答:** Laravel 自带 `Illuminate\Http\Client`, 配合 `Http::withToken()->timeout()->retry()->post()` 足以完成绝大多数调用. 坑集中在几处: (1) 超时与重试——模型响应可能几十秒, 必须显式设超时, 且重试要区分幂等与限流, 盲目重试会撞限流; (2) 流式响应——`Http` 的普通请求会把响应体一次性读完, 真流式要落到 cURL 的 `CURLOPT_WRITEFUNCTION` 或用支持流的客户端; (3) usage 统计——要自己从响应 JSON 里取 `usage` 再落库; (4) 错误分类——供应商的错误体各不相同, 需要自己归一化成可重试与不可重试两类; (5) 密钥管理——不要进代码库, 放 `.env` 并用 `php artisan config:cache` 前确认环境隔离.

**判断标准:** 这类"自己封装"的做法在只做一次性的文本生成时完全合理; 一旦进入多供应商、结构化输出、工具调用、流式、会话这些场景, 维护成本会迅速超过直接用官方 SDK.

## 二、MCP：把工具变成标准服务

### 205. MCP 是什么? 它解决的问题和 SDK 解决的问题有什么不同?

**参考回答:** MCP (Model Context Protocol) 是一套让 AI 应用以统一方式发现和调用外部工具、资源与提示的开放协议. 它的作用是把"工具接入"从每个 AI 应用各写一套适配, 变成一套可复用的服务契约. 和 `laravel/ai` 的关系是: 官方 Laravel 的博客专门讨论了"AI SDK、Boost 还是 MCP, 你需要哪个"——三者职责不同, AI SDK 面向业务系统内的 AI 功能, Boost 面向 AI 编码代理读取项目上下文, MCP 面向把工具标准化地暴露出去. [L5][L5]

**面试表达:** 这三个不是竞品也不是替代关系. 同一个系统里三者可以共存: 用 AI SDK 写业务里的 Agent, 用 Boost 让编码助手理解项目, 用 MCP 把内部系统 (工单查询、设备台账) 作为标准服务暴露给任意 AI 客户端.

### 206. PHP 生态里 MCP 的官方 SDK 是什么?

**参考回答:** 是 `modelcontextprotocol/php-sdk`, Composer 包名 `mcp/sdk`, 要求 PHP 8.2+, 由 PHP Foundation 与 Symfony 团队共同维护, 遵循 Symfony 编码规范并承诺向后兼容. 在首个主版本发布前官方仍标注为实验性. 服务端用属性声明能力:

```php
Server::builder()
    ->setServerInfo('Calculator', '1.0.0')
    ->setDiscovery(__DIR__, ['.'], excludeDirs: ['vendor'])
    ->run(new StdioTransport());
```

属性包括 `#[McpTool]`、`#[McpResource]`、`#[McpResourceTemplate]`、`#[McpPrompt]`, 属性发现依赖 `symfony/finder`. 支持 STDIO 与 Streamable HTTP 两种传输, 以及会话与授权. 客户端侧为 `Client::builder()`, 通过 `connect(new StdioTransport(command: 'php', args: [...]))` 建立连接, 再 `listTools()`、`callTool('add', [...])`、`listResources()`、`readResource()`、`disconnect()`. [L6][L6]

**注意区分:** 早期的社区项目 `php-mcp/server` / `php-mcp/client` 是官方 SDK 的前身, 仓库已迁移合并, 搜索时两者名字常混在一起, 回答时要说清"现在应选 `mcp/sdk`".

### 207. 在 Laravel 里写 MCP 服务器, 用哪个包?

**参考回答:** `laravel/mcp` 是 Laravel 官方的 MCP 实现, Laravel Boost 也构建在它之上. 基本流程是 `composer require laravel/mcp`, 然后 `php artisan vendor:publish --tag=ai-routes` 发布路由, 用 `php artisan make:mcp-server InvoiceServer` 生成服务器骨架. 服务器有两种形态: HTTP 形态可对外访问, 鉴权可以用 Laravel Passport 的 OAuth 或 Sanctum 的令牌; 本地形态则作为一个 Artisan 命令运行, 供桌面端 AI 客户端通过 STDIO 拉起. [L7][L7]

**选型判断:** 要让外部 AI 客户端连自己的 MES 系统, 就做 HTTP 形态并挂标准鉴权; 要让本机的 AI 编码工具访问内部脚本, 就做本地 Artisan 形态, 好处是不需要暴露网络端口.

### 208. Laravel Boost 是什么? 它和 MCP 是什么关系?

**参考回答:** Boost 是 Laravel 官方的 AI 编码代理工具包, 本质上是一个 Laravel 专属的 MCP 服务器, 让 Claude Code、Cursor、GitHub Copilot、Codex、Junie 这类编码代理直接读取项目上下文. 安装方式是 `composer require laravel/boost --dev` 后执行 `php artisan boost:install`. 它暴露的工具覆盖应用信息、路由列表、配置项、环境变量、Artisan 命令清单、日志读取、最后一条错误、数据库连接与 schema 查询、浏览器日志、文档检索等, 让代理不必靠猜来了解项目. Boost 2.x 起要求 PHP 8.2+ 与 Laravel 11.x+, 并把 `CodeEnvironment` 概念改名为 `Agent`, 配置键从 `code_environment` 改为 `agents`, Tinker 工具默认关闭 (需通过 `boost.tinker_tool_enabled` 打开). [L8][L8]

**关键工程点:** Boost 提供的 Laravel 专属 AI 指南会按项目实际安装的框架版本与组件 (Livewire、Filament、Pest、PHPUnit 等) 调整, 避免代理按旧版本写法生成代码. 这比"给代理一份通用 PHP 规范"有效得多.

### 209. Boost 的 MCP 服务器怎么接入 AI 客户端?

**参考回答:** 通过项目的 `.mcp.json` 配置, 启动命令是项目自身的 Artisan:

```json
{
  "mcpServers": {
    "laravel": {
      "command": "php",
      "args": ["artisan", "boost:mcp"]
    }
  }
}
```

[L8][L8]

**追问要点:** Boost 以开发依赖安装, MCP 服务器进程跑在开发者本地, 拿的是本地环境的配置与数据库连接. 因此代理"查到"的数据可能与线上不一致, 用于生产判断时必须由人复核; 也不要因为 Boost 能查数据库就允许代理在生产库上执行写操作.

### 210. 自己写 MCP 工具时, 安全上要注意什么?

**参考回答:** 与 Web API 同源, 但攻击面更大——工具往往直接连着数据库和内部系统. 要点: (1) 工具描述要写清楚"什么时候该用", 否则模型会乱调; (2) 工具入参必须用 schema 约束并在实现里二次校验, 不能信任模型给的路径、ID、SQL 片段; (3) 身份透传要显式——MCP 客户端的身份不等于最终用户身份, 涉及用户数据的工具必须把最终用户标识作为参数并在服务端校验归属; (4) 写操作与不可逆操作要设审批或只读模式; (5) 工具返回内容要做长度限制, 避免把整库结果塞回上下文.

**一句话总结:** MCP 解决的是"怎么接得上", 不解决"接上之后安不安全"; 权限边界仍要自己在业务层实现.

## 三、向量检索与数据层

### 211. PHP 里怎么存向量? 有哪几种选择?

**参考回答:** 三种主流路径. (1) PostgreSQL + pgvector: `pgvector/pgvector` 包提供 `vector` / `halfvec` / `bit` / `sparsevec` 列类型, Eloquent 侧可转成 `Pgvector\Laravel\Vector`, 用 `HasNeighbors` 拿到 `nearestNeighbors('embedding', Distance::L2)` 等能力, 距离度量支持内积、余弦、L2、L1、Hamming、Jaccard, 索引可用 HNSW 与 IVFFlat; 安装后需 `php artisan vendor:publish --tag="pgvector-migrations"` 再迁移. (2) Laravel 13 原生向量支持: 提供 `Schema::ensureVectorExtensionExists()`、`whereVectorSimilarTo()`、`selectVectorDistance()`、`whereVectorDistanceLessThan()`、`orderByVectorDistance()` 等入口. (3) 专用向量数据库 (如 Qdrant、Milvus) 通过自建或社区客户端接入. [L4][L4] [L9][L9]

**选型判断:** 数据量在百万级以下、且业务表本身在 PG 里, 用 pgvector 最省事, 少一套数据同步; 已有 MySQL 存量系统要上向量, 优先评估 Laravel 13 原生路径与 MariaDB 的向量能力, 而不是硬把业务库迁到 PG.

### 212. 维度、模型和索引, 哪些必须在设计阶段定死?

**参考回答:** 三件事必须在上线前定: (1) embedding 模型与维度——换模型意味着整表重算, 老向量混用会静默返回错误结果, 比维度不匹配报错更危险; (2) 距离度量——余弦适合归一化文本向量, 内积适合已归一化后比较, 选错会让排序失真; (3) 索引类型与参数——HNSW 召回高、构建慢、内存占用大, IVFFlat 需要在有代表性数据上训练, `lists` 参数直接影响召回. [L4][L4]

**追问要点:** 还要定"是否降维". 高维向量存储成本高, 部分模型支持指定维度参数 (如 1024 而非 1536), 但降维会损失精度, 必须用真实业务查询集验证召回后再定.

### 213. 检索效果怎么评估? 光看 top-k 命中够吗?

**参考回答:** 不够. 至少要分开看三段指标: (1) 检索段——召回率 (相关文档有没有进 top-k) 与排名质量; (2) 生成段——拿到片段后模型是否用对了证据, 是否编造; (3) 业务段——工单分类准确率、质检判定误判率、客服转人工率等. 只测第一段会出现"召回很好但答案错"的情况, 因为片段顺序、数量或指令噪声都会影响生成.

**工程做法:** 建一个几十到几百条的黄金集, 每条含问题、期望命中的文档 ID 和期望结论; 每次换模型、改切分策略、改 top-k 都跑一遍. 这套回归集也是后面讲 AI 功能上线的核心资产.

## 四、语言与运行时

### 214. PHP 8.3–8.5 为 AI 应用带来了什么?

**参考回答:** 按版本记重点. 8.3 有类型化类常量、`json_validate()` (不抛异常地校验 JSON, 很适合校验模型返回)、`#[\Override]` 属性. 8.4 有 property hooks 与非对称可见性, 让 DTO 与只读模型的写法更接近其他语言的习惯. 8.5 (2025 年 11 月 20 日发布) 有管道操作符 `|>` (把嵌套调用改写成从左到右的链式传递)、`clone` 接受关联数组实现 "clone with" 模式 (对 readonly 类尤其有用)、内置 URI 扩展、 `#[\NoDiscard]` 属性、`array_first()` / `array_last()`、常量表达式支持闭包与一等可调用对象、持久化 cURL share handle、致命错误信息自带 backtrace. [L10][L10]

**对 AI 应用的直接价值:** `json_validate()` 适合"模型输出先判断是否合法 JSON 再决定走不走解析分支"; property hooks 与 clone-with 适合写不可变的提示对象与响应 DTO; `#[\NoDiscard]` 可以标出必须被使用的返回值; 管道操作符让长链式的数据处理更易读. 注意 Laravel 13 的最低要求是 PHP 8.3, 8.5 的特性需要自己确认生态依赖是否已兼容.

### 215. AI 调用是同步的, 会拖垮 PHP-FPM 吗?

**参考回答:** 会, 而且是最常见的坑. 模型调用是典型的 IO 密集且耗时不可控 (数秒到数十秒), 若在 HTTP 请求里同步等待, 会长时间占用 PHP-FPM worker, 并发一上来就排队甚至雪崩. 正确姿势是把 AI 调用放进队列: 请求只负责受理与返回任务 ID, worker 负责调用模型, 结果通过 WebSocket/SSE 推送或轮询获取. 官方 SDK 也提供 `queue()` 与 `then()` 回调, 以及 `broadcast` / `broadcastNow` / `broadcastOnQueue` 等异步形态. [L1][L1]

**配套措施:** (1) 给 AI 队列单独设队列名与 worker 数量, 避免与普通业务任务互相饿死; (2) 设超时上限, 超时后按幂等规则决定重试还是降级; (3) 监控队列等待时长与积压, 而不是只看处理时长; (4) 长任务要考虑 worker 被杀死后的恢复, 关键写操作要有幂等键.

### 216. 怎么接本地模型 (Ollama 或自建推理服务)?

**参考回答:** Ollama 提供 OpenAI 兼容端点, 因此可以走 OpenAI 兼容驱动, 在配置里指定 url、key 与模型默认值. 官方 SDK 的配置形态支持 `openai-compatible` 驱动下的 `models.embeddings.default` 与 `dimensions` 等字段, 也支持 `local` 这类自定义键名. 收益是数据不出内网、调用成本固定、延迟稳定; 代价是效果与维护能力弱于前沿模型, 需要自己承担显卡与运维.

**面试判断:** 常见策略是"分级路由"——敏感数据与高频简单任务走本地模型, 复杂推理走外部 API. 但要注意这个策略会引入行为不一致, 评测集必须覆盖两个档位分别验收.

### 217. 提示词要不要版本管理? 怎么管理?

**参考回答:** 要. 提示词是代码, 会直接影响生产行为, 却常被藏在控制器或数据库配置里, 无法回溯"上周和这周为什么结果不同". 可行的做法: (1) 把提示词放进 Agent 类的 `instructions()` 与工具描述里, 与代码一起走 Git 版本控制——这是 Laravel AI SDK 的天然优势; (2) 需要不发布代码就调整的场景, 用数据库或配置中心存提示词, 但必须带版本号与生效时间; (3) 无论哪种方式, 响应落库时都要记录本次使用的提示词版本与模型标识, 否则出了问题无法定位.

**追问要点:** 提示词版本与模型版本要一起记录. 模型升级后效果变化, 提示词没变, 但换模型这件事本身就是变量, 不记下来就无法做归因.

### 218. 怎么控制 token 成本?

**参考回答:** 五个杠杆. (1) 选模型——摘要、分类、路由这类任务用便宜模型, 官方提供 `#[UseCheapestModel]` / `#[UseSmartestModel]` 属性做自动选型, 也可以按业务拆成不同 Agent; (2) 控上下文——限制历史轮数、检索片段数量与长度, 用 `#[MaxSteps]` 限制步骤数; (3) 用缓存——`#[CacheInstructions]` / `#[CacheToolDefinitions]` 复用前缀缓存, Anthropic 可通过属性传 `'1h'` 延长 TTL, 但前缀必须稳定, 每次都变的内容要留在后面; (4) 结果缓存——相同输入直接返回已算结果, 用业务键而不是 prompt 全文做键; (5) 观测——把 usage 落库按功能、用户、模型维度聚合, 否则优化没有依据. [L1][L1]

**注意:** 缓存指令与缓存工具定义必须同时开启, 否则官方实现会抛 `InvalidArgumentException`.

### 219. AI 应用怎么监控? 该看哪些指标?

**参考回答:** 分四类. 效果类: 任务成功率、校验失败率、人工改写率、误判率; 成本类: 单次请求 token、单任务成本、按功能的月度成本; 性能类: 首 token 延迟 (流式场景尤其关键)、总耗时、队列等待时长; 稳定性类: 各类异常占比 (限流 / 过载 / 超时 / 工具异常)、故障转移触发率. 落到工程上, 官方提供中间件机制可以在每一步拦截并记录: 实现 `handle(PendingStep $step, Closure $next)`, 通过 `$step->usage`、`$step->number`、`$step->isFirstStep()` 拿到上下文, 也能用 `withModel` / `withTools` / `withoutTools` / `withMaxTokens` 在中途改写请求. [L1][L1]

**追问要点:** 只看成功率会掩盖成本问题, 只看成本会掩盖质量问题; 两张表必须一起看.

### 220. 什么情况下不该用 AI?

**参考回答:** 三类场景要谨慎: (1) 强确定性要求且规则可穷举的——比如税率计算、库存扣减、权限判定, 规则系统更可靠也更便宜; (2) 错误代价不可逆且无兜底的——直接改写生产数据、删记录、发不可撤销的指令, 必须有审批与可回滚设计; (3) 数据不能出网但又只能用外部模型的——此时要么换本地模型, 要么放弃这个功能. 面试时把这三条讲清楚, 比只讲"AI 很强"更能体现工程判断力.

## 五、把一次"接入 MCP 工具"讲成完整实现

**教学场景：** A 工厂的 MES 需要让外部 AI 客户端查询工单状态. 目标是"协议标准、身份可追溯、权限不下放".

1. **工具边界:** 只暴露只读工具——`query_work_order` 与 `list_devices`, 不提供写操作. 工具描述写清适用场景与参数含义 (工单号、单号、状态枚举), 减少模型乱用.
2. **参数约束:** schema 限定工单号为定长字符串、状态为枚举, 实现内部再校验格式与长度, 不把参数直接拼进 SQL.
3. **身份与归属:** MCP 连接本身只说明"哪个客户端", 不代表最终用户. 工具实现要求传入最终用户标识, 服务端按用户查其可见工厂与工单范围, 超出范围返回空结果而不是报错 (报错会诱导模型不断重试).
4. **传输与鉴权:** 对外暴露的 HTTP 形态走标准鉴权 (OAuth 或令牌), 本地 Artisan 形态只允许本机 STDIO 拉起, 不开放网络端口.
5. **留痕与限流:** 每次调用记录调用方、参数摘要、返回条数与耗时; 对高频调用限流, 防止一个客户端把工单表拖一遍.

::: tip 特别解释：只读是工具设计的第一原则
把工具限定在只读, 可以在协议层就用最小权限保护数据; 写操作留给有审批的业务流程. 这比在写工具里逐个加校验更可靠.
:::

**自测与预期:** 用不同工厂的两个用户各查一次同一工单, 只能各自看到范围内的那条; 用越界参数查询应返回空结果而不是报错; 调用记录里能看到调用方与参数摘要。以上是验收设计, 不是已执行的测试结果.

## 关键术语与专业解释

下列定义为官方概念的中文概括; 场景建议是工程推导, 不是框架的绝对保证.

| 术语 | 专业解释 | 容易混淆的边界 |
| --- | --- | --- |
| MCP | AI 客户端访问工具、资源与提示的开放协议 | 是"怎么接得上", 不自带业务权限模型 |
| MCP Server | 对外提供工具的一方, 可用 STDIO 或 Streamable HTTP | 与 AI SDK 不冲突, 前者对外暴露能力, 后者在应用内编排 |
| MCP Client | 连接并调用 MCP Server 的一方 | 客户端身份不等于最终用户身份 |
| STDIO 传输 | 由客户端拉起子进程并通过标准输入输出通信 | 适合本地工具, 不适合跨机调用 |
| Streamable HTTP | 通过 HTTP 承载 MCP 会话的传输方式 | 需要自行处理鉴权与会话保持 |
| Prism | Laravel 生态的多供应商 LLM 抽象层 | 与 `laravel/ai` 是封装关系, 不是竞争关系 |
| Provider | 具体的大模型服务方 | 换 provider 不等于模型能力等价 |
| Embedding 向量 | 文本的稠密数值表示 | 维度相同不代表语义空间相同 |
| HNSW / IVFFlat | 两类向量索引结构 | 召回、构建速度与内存占用此消彼长 |
| Laravel Boost | 面向 AI 编码代理的 Laravel MCP 工具包 | 是开发期工具, 不等于生产环境的 AI 能力 |

### 基础关键词补充：先理解，再记缩写

| 关键词 | 通俗解释与本篇场景 | 必须区分的概念 |
| --- | --- | --- |
| Composer | PHP 的依赖管理器, 用 `composer require` 装包 | 装了包不代表该包在生产路径上被正确使用 |
| PSR-4 | 类命名空间到目录的映射约定 | 与包版本管理无关 |
| Attribute（PHP 特性） | 写在类/方法上的元数据标记 | 框架靠它做声明式注册, 与运行时反射是两回事 |
| STDIN / STDOUT | 进程的标准输入输出 | MCP 本地传输靠它通信, 不能混入调试输出 |
| JSON Schema | 描述 JSON 数据结构的规范 | 约束形状, 不保证语义正确 |
| Rerank | 对检索结果二次精排 | 与初始召回是两步, 不能相互替代 |
| Fallback 驱动 | 主供应商不可用时的备用实现 | 与 failover 的触发条件是不同维度 |
| Dead Letter | 失败任务最终落地的隔离队列 | 没有它, 失败任务会无限重试 |

## 官方资料与核查口径

- [L1. Laravel AI SDK 文档 (13.x)](https://laravel.com/docs/13.x/ai-sdk).
- [L2. openai-php/client: OpenAI 官方 PHP SDK](https://github.com/openai-php/client).
- [L3. openai-php/laravel: OpenAI PHP SDK 的 Laravel 封装](https://github.com/openai-php/laravel).
- [L4. Prism 文档: Laravel 的统一 LLM 接口](https://prismphp.com/getting-started/introduction.html).
- [L5. Laravel 官方博客: AI SDK、Boost 还是 MCP](https://laravel.com/blog/laravel-ai-sdk-boost-or-mcp-which-tool-do-you-need).
- [L6. modelcontextprotocol/php-sdk: 官方 MCP PHP SDK](https://github.com/modelcontextprotocol/php-sdk).
- [L7. laravel/mcp: 在 Laravel 中构建 MCP 服务器](https://github.com/laravel/mcp).
- [L8. Laravel Boost 文档](https://laravel.com/framework/docs/boost).
- [L9. Laravel 13 Release Notes: 含原生向量能力](https://laravel.com/framework/docs/13.x/releases).
- [L10. PHP 8.5 发布说明](https://www.php.net/releases/8.5/en.php).
- [L11. PHP 支持版本与维护周期](https://www.php.net/supported-versions.php).
- [L12. pgvector/pgvector: PHP 与 Laravel 的向量类型支持](https://github.com/pgvector/pgvector-php).

## 延伸阅读

- [下一篇：AI 辅助 PHP/Laravel 开发（221—240）](./ai-assisted-php-development-interview.md)
- [上一篇：Laravel AI SDK 与大模型集成（181—200）](./laravel-ai-sdk-interview.md)
- [返回 PHP 面试指南](../index.md)
- [Laravel Boost](https://laravel.com/framework/docs/boost)
- [MCP PHP SDK 文档](https://php.sdk.modelcontextprotocol.io/)
