---
title: trellis
date: 2026-07-07 21:37:11
---

# Trellis vibe coding 使用

官网地址：[https://docs.trytrellis.app/zh](https://docs.trytrellis.app/zh)

Trellis 可以理解为给 AI 编程助手搭脚手架：把项目规范、任务状态、会话记录和检查流程写进仓库，让 Claude Code、Codex、Cursor 等工具每次打开项目时都能读到同一套约束，而不是靠你在聊天里反复解释。

## 一句话定位

```
项目规范      .trellis/spec/
任务文档      .trellis/tasks/
会话记忆      .trellis/workspace/
平台入口      .claude/、.codex/、.agents/skills/ 等
```

Trellis 不是替代 Claude 或 Codex 的编码工具，而是给这些工具补三件东西：

| 能力 | 解决的问题 |
| --- | --- |
| 规范注入 | AI 动手前先读项目约定、目录结构、测试策略 |
| 任务持久化 | 复杂需求沉淀为 `prd.md`、`design.md`、`implement.md` |
| 收尾循环 | 实现后触发 check、更新 spec、记录 journal |

## 安装

前置环境：

| 工具 | 最低版本 | 用途 |
| --- | --- | --- |
| Node.js | 18 | 运行 `trellis` CLI |
| Python | 3.9 | 运行 hook 和 `.trellis/scripts/` |
| git | 较新版本 | 记录任务、提交和工作区状态 |

```bash
# 全局安装 beta 通道
npm install -g @mindfoldhq/trellis@latest

# 进入项目目录
cd your-project
```

升级分两步：

```bash
# 1. 升级全局 CLI
trellis upgrade

# 2. 在每个 Trellis 项目里同步模板、hook、skill
trellis update

# 先看会改什么
trellis update --dry-run
```

## 初始化

首次初始化时指定开发者身份。这个名字会写入本机的 `.trellis/.developer`，并在 `.trellis/workspace/<name>/` 下创建你的个人 journal。

```bash
# Claude Code
trellis init -u wxvirus --claude

# Codex
trellis init -u wxvirus --codex

# 同一个项目同时支持 Claude Code 和 Codex
trellis init -u wxvirus --claude --codex
```

常见场景：

| 场景 | 命令 | 说明 |
| --- | --- | --- |
| 新项目第一次接入 | `trellis init -u wxvirus --claude` | 创建 `.trellis/`、平台配置和 bootstrap task |
| 已有 Trellis 项目加 Codex | `trellis init --codex` | 只补 `.codex/` 和根目录 `AGENTS.md` |
| 新成员加入项目 | `trellis init -u your-name` | 只设置本机开发者身份和 workspace |
| 使用模板 | `trellis init -u wxvirus --template electron-fullstack` | 拉官方 spec 模板 |

初始化后先跑 bootstrap，不要急着写功能。Trellis 默认生成的 spec 很多是空模板，需要让 AI 读真实代码后补成项目约定。

## Claude Code 用法

Claude Code 是 Trellis 支持最完整的平台。

初始化后会生成：

```text
.claude/
├── commands/trellis/       # /trellis:start、/trellis:continue、/trellis:finish-work
├── agents/                 # trellis-implement、trellis-check、trellis-research
├── skills/                 # brainstorm、before-dev、check、update-spec、break-loop
└── hooks/                  # session-start、workflow-state、subagent-context
```

日常流程：

```text
打开 Claude Code
  -> SessionStart hook 注入身份、git 状态、活跃任务
  -> 直接描述需求
  -> 复杂任务先创建 Trellis task
  -> review prd/design/implement
  -> /trellis:continue 推进实现和检查
  -> 代码提交后 /trellis:finish-work 归档任务并写 journal
```

推荐用法：

| 任务类型 | 做法 |
| --- | --- |
| 问答、解释、查资料 | 不建 task，直接问 |
| 小范围改动 | 让 Claude inline 做，必要时手动说明“不需要 Trellis task” |
| 多文件功能、架构调整、规范变更 | 让 Trellis 创建 task，先写 `prd.md` 再实现 |
| 棘手 bug | 修完后让 `trellis-break-loop` 复盘，沉淀到 spec |

Claude Code 的 sub-agent 上下文注入比较完整。复杂功能可以让 `trellis-implement` 写代码，再让 `trellis-check` 对照 task artifact 和 spec 做验证。

## Codex 用法

Codex 接入时运行：

```bash
trellis init -u wxvirus --codex
```

生成结构：

```text
AGENTS.md                  # Codex 每个 session 自动读取
.codex/
├── prompts/               # trellis-start、trellis-continue、trellis-finish-work
├── skills/                # 5 个 Trellis skill
├── agents/                # trellis-implement/check/research TOML
└── hooks/                 # workflow-state hook
```

### 打开 Codex hooks

Codex 要打开 hook，不然 Trellis 的 workflow 状态不会自动注入，`/` 菜单里也可能找不到 `start`、`continue`、`finish-work`。

编辑 `~/.codex/config.toml`：

```toml
[features]
hooks = true
```

如果是旧版 Codex，可能用的是：

```toml
[features]
codex_hooks = true
```

Codex 0.129+ 还需要在 TUI 里执行一次：

```text
/hooks
```

然后审批 Trellis 安装的 `UserPromptSubmit` hook。

### Codex 的工作模式

Codex 默认使用 inline 模式：主 Codex agent 直接实现和检查，不强制派发 `trellis-*` sub-agent。这是官方默认值，因为 Codex sub-agent 是隔离 turn，不能完整继承父会话上下文。

需要旧的 sub-agent 模式时，在 `.trellis/config.yaml` 里设置：

```yaml
codex:
  dispatch_mode: sub-agent
```

一般保持默认即可：

```yaml
codex:
  dispatch_mode: inline
```

### Codex 实战节奏

```text
1. 新开 Codex 会话
2. 直接描述任务，例如“给登录页补忘记密码流程”
3. 没有 active task 时，Trellis 会判断是否需要创建 task
4. 复杂任务同意创建 task，先 review prd.md
5. 输入 continue 或调用 trellis-continue 推进下一阶段
6. 实现后让 trellis-check 对照 spec 和 diff 检查
7. 有稳定经验时，让 trellis-update-spec 写回 .trellis/spec/
```

如果自动注入没生效，直接让 Codex 读取 `trellis-start` skill，或者新开会话让 `AGENTS.md` prelude 重新加载。

## 标准工作流

```text
无 active task
  -> 判断任务大小
  -> 简单问答：不建 task
  -> 小改动：可 inline
  -> 复杂任务：询问是否创建 Trellis task

planning
  -> .trellis/tasks/<task>/prd.md
  -> 复杂任务补 design.md、implement.md
  -> 需要调研时写 research/

in_progress
  -> 先读 spec
  -> 实现
  -> trellis-check 验证和自修

finish
  -> trellis-update-spec 沉淀规则
  -> 工作 commit 之后 finish-work
  -> archive task + 写 workspace journal
```

## 写 spec 的技巧

Trellis 的效果主要取决于 `.trellis/spec/` 写得够不够具体。不要写“注意代码质量”这种空话，要写可执行约束。

好的 spec：

```md
## API Error Handling

- 所有 HTTP handler 返回 `{ code, message, traceId }`
- 业务错误使用 4xx，系统错误使用 5xx
- handler 内不要直接 `throw new Error`
- 新增接口必须补充成功、参数错误、权限错误三类测试
```

差的 spec：

```md
## Quality

- Follow best practices
- Write clean code
```

经验：

| 做法 | 原因 |
| --- | --- |
| 带真实文件路径 | AI 能直接对照项目结构 |
| 写 Good / Bad 示例 | 比抽象原则更稳定 |
| 写验证矩阵 | check 阶段能逐项核对 |
| spec 走 PR review | 团队规范和代码一样重要 |
| 不预先设计整套未来系统 | 先覆盖当前项目真实模式 |

## 用 Claude 搭自己的 Trellis template

Trellis 的 template 本质是一套可复用的 `.trellis/spec/` 起点。你可以把团队常用技术栈沉淀成 Git 仓库，然后在新项目里用 `trellis init --registry ... --template ...` 拉下来。

官方规则很简单：

| 规则 | 说明 |
| --- | --- |
| template 内容 | 放未来要复制到 `.trellis/spec/` 下的文件 |
| marketplace 索引 | 用 `index.json` 声明多个模板 |
| 目录层级 | 模板目录里直接放 `backend/`、`frontend/`、`guides/`，不要再套一层 `spec/` |
| 私有仓库 | 用 `GIGET_AUTH` 放 GitHub / GitLab token |
| 已有 spec | 用 `--append` 只补缺失文件，用 `--overwrite` 覆盖重建 |

### 推荐目录结构

以 Spring Boot + Vue3 前后端分离项目为例，可以建一个单独仓库：

```text
trellis-templates/
├── marketplace/
│   ├── index.json
│   └── specs/
│       └── springboot-vue3/
│           ├── README.md
│           ├── backend/
│           │   ├── index.md
│           │   ├── springboot-architecture.md
│           │   ├── api-error-handling.md
│           │   ├── persistence-transaction.md
│           │   └── test-strategy.md
│           ├── frontend/
│           │   ├── index.md
│           │   ├── vue3-structure.md
│           │   ├── api-client-state.md
│           │   ├── routing-permission.md
│           │   └── form-table-pattern.md
│           ├── shared/
│           │   ├── index.md
│           │   ├── rest-contract.md
│           │   ├── auth-rbac.md
│           │   └── naming-conventions.md
│           └── guides/
│               ├── index.md
│               ├── task-planning.md
│               └── review-checklist.md
```

对应 `marketplace/index.json`：

```json
{
  "version": 1,
  "templates": [
    {
      "id": "springboot-vue3",
      "type": "spec",
      "name": "Spring Boot + Vue3 前后端分离",
      "description": "适合 Java Spring Boot 后端、Vue3 前端、REST API、RBAC 权限和管理后台项目的 Trellis spec 起点",
      "path": "marketplace/specs/springboot-vue3",
      "tags": ["spring-boot", "vue3", "admin", "rest-api"]
    }
  ]
}
```

### 让 Claude 生成第一版模板

在 Claude Code 里打开 `trellis-templates/` 仓库，直接给它一个结构化任务。重点是让它只写 spec，不写业务代码。

```text
我要做一个 Trellis spec marketplace。

请创建 marketplace/specs/springboot-vue3 这套 template，并创建 marketplace/index.json。

目标项目类型：
- Spring Boot 3.x + Java 17/21 后端
- Vue3 + TypeScript + Vite + Pinia + Vue Router 前端
- 前后端分离，通过 REST API 通信
- 管理后台常见能力：登录、JWT、RBAC、菜单权限、字典、分页表格、表单校验、文件上传
- 数据库默认 MySQL 或 PostgreSQL，后端使用 JPA 或 MyBatis Plus 二选一时要在 spec 里提示项目落地后必须明确

输出要求：
- 只写 Markdown spec 和 index.json，不生成业务代码
- 每个一级目录必须有 index.md
- 每条规范都要写 What / Why / Good / Bad / Check
- 不要写“遵循最佳实践”这种空话
- 文件里必须包含真实可执行的命名、目录、接口、错误码、测试和 review 规则
- 模板目录里不要再套一层 spec，内容会直接复制到 .trellis/spec/
```

Claude 生成后，让它再做一轮自检：

```text
请检查 marketplace/specs/springboot-vue3：
1. 是否每个一级目录都有 index.md
2. 是否所有 spec 都是可执行规则，不是空泛原则
3. 是否覆盖 backend、frontend、shared、guides 四类上下文
4. 是否有 Good / Bad 示例
5. 是否没有混入具体业务代码或密钥
6. 是否 index.json 的 path 能准确指向模板目录
```

### Spring Boot + Vue3 template 该写什么

不要让 template 变成大而全的“架构宝典”。它只需要覆盖 AI 最容易写偏的地方。

| spec 文件 | 应该约束什么 |
| --- | --- |
| `backend/springboot-architecture.md` | controller、service、repository、dto、mapper 的分层边界 |
| `backend/api-error-handling.md` | 统一响应体、错误码、异常映射、参数校验 |
| `backend/persistence-transaction.md` | 事务边界、分页查询、N+1 查询、批量写入 |
| `backend/test-strategy.md` | unit、slice test、integration test 的触发条件 |
| `frontend/vue3-structure.md` | views、components、stores、api、router 的目录边界 |
| `frontend/api-client-state.md` | axios/fetch 封装、token 注入、错误提示、loading 状态 |
| `frontend/routing-permission.md` | 动态路由、菜单权限、按钮权限、未授权跳转 |
| `frontend/form-table-pattern.md` | 搜索表单、分页表格、弹窗表单、校验规则 |
| `shared/rest-contract.md` | REST 命名、分页格式、日期格式、枚举、空值语义 |
| `shared/auth-rbac.md` | JWT、角色、权限点、租户/组织边界 |

一个后端错误处理 spec 可以长这样：

````md
## API Error Handling

### What

- 所有接口返回统一结构：`{ code, message, data, traceId }`
- 参数校验失败返回 `400`，权限失败返回 `401` 或 `403`
- 业务异常使用项目内的 `BizException`，不要直接抛裸 `RuntimeException`

### Why

前端需要稳定解析错误，测试也需要稳定断言。随机的异常结构会让 UI、日志和排障都变慢。

### Good

```java
throw new BizException("USER_DISABLED", "用户已停用");
```

### Bad

```java
throw new RuntimeException("user disabled");
```

### Check

- 新增 controller 时必须覆盖成功、参数错误、权限错误三种响应
- 新增错误码时必须能被前端翻译或直接展示
````

### 在新项目里使用模板

公开 GitHub 仓库：

```bash
trellis init -u wxvirus \
  --registry gh:your-org/trellis-templates/marketplace \
  --template springboot-vue3 \
  --claude
```

私有 GitHub 仓库：

```bash
export GIGET_AUTH=ghp_xxxxx

trellis init -u wxvirus \
  --registry gh:your-org/trellis-templates/marketplace \
  --template springboot-vue3 \
  --claude
```

已有项目已经有 `.trellis/spec/`，只想补缺失文件：

```bash
trellis init \
  --registry gh:your-org/trellis-templates/marketplace \
  --template springboot-vue3 \
  --append
```

如果你确定要用模板覆盖旧 spec，再用：

```bash
trellis init \
  --registry gh:your-org/trellis-templates/marketplace \
  --template springboot-vue3 \
  --overwrite
```

### 使用后的第一件事

模板只是起点，不是最终规范。拉到真实项目后，第一轮 Claude 会话应该让它读代码并收紧 spec：

```text
请读取当前 Spring Boot + Vue3 项目的真实目录、依赖、接口风格和测试命令，
然后检查 .trellis/spec/ 里的 springboot-vue3 模板。

只做必要调整：
- 删除项目没有使用的规则
- 把泛化规则改成当前项目真实路径和命令
- 补充现有代码里已经形成的约定
- 不新增未来可能用到但当前不存在的架构
```

这一步很关键。template 负责“开局不空白”，项目 spec 负责“贴合真实代码”。

## 常用命令速查

| 命令 | 用途 |
| --- | --- |
| `trellis init -u name --claude` | 初始化 Claude Code 支持 |
| `trellis init -u name --codex` | 初始化 Codex 支持 |
| `trellis init --cursor` | 给已有项目追加 Cursor 支持 |
| `trellis init --registry gh:org/repo/marketplace --template springboot-vue3` | 从自定义 template 初始化 spec |
| `trellis init --template springboot-vue3 --append` | 只补充缺失 spec 文件 |
| `trellis init --template springboot-vue3 --overwrite` | 用模板覆盖已有 spec |
| `trellis upgrade` | 升级全局 Trellis CLI |
| `trellis update --dry-run` | 预览项目模板更新 |
| `trellis update --migrate` | 执行版本迁移 |
| `trellis uninstall --dry-run` | 预览卸载会删除什么 |

## 排障

| 问题 | 处理 |
| --- | --- |
| Codex 里 `/` 找不到 Trellis 命令 | 检查 `~/.codex/config.toml` 的 hooks，并在 TUI 里跑 `/hooks` 审批 |
| AI 没按项目规范写 | 先补 `.trellis/spec/`，给出文件路径、反例和测试要求 |
| 初始化后 spec 很空 | 跑 bootstrap task，让 AI 从真实代码生成第一版规范 |
| 自定义 template 拉取后没有文件 | 检查 `index.json` 的 `path` 是否指向真正的模板目录 |
| template 被复制成 `.trellis/spec/spec/...` | 模板目录多套了一层 `spec/`，删除这一层 |
| `finish-work` 拒绝执行 | 还有未提交代码改动；先完成工作 commit，再归档和写 journal |
| 升级担心覆盖自定义 | 先跑 `trellis update --dry-run`，Trellis 会备份并保留改过的文件 |

## 我自己的使用建议

1. 先在一个真实项目里只接入一个平台，比如 Claude Code 或 Codex，不要一上来全平台铺满。
2. 第一天重点不是写功能，而是把 `.trellis/spec/` 写准。
3. 小任务别强行创建 task；Trellis 的价值在多文件、多阶段、需要复盘的工作。
4. Codex 默认用 inline 模式，除非明确需要隔离角色，否则别急着开 `sub-agent`。
5. 每次踩坑后只沉淀一条有复用价值的 spec，别把日志全文搬进规范库。
