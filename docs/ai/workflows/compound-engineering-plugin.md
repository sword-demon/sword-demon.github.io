---
title: Compound Engineering：把 AI 编程从“能写”变成“能交付”
date: 2026-09-11 20:00:00
cover: /ai/workflows/assets/cover-compound-engineering.png
tags:
  - AI 编程
  - Codex
  - Claude Code
  - 工程实践
categories:
  - AI
---

这几天我一直在用 [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) 做开发。它给我的最大变化，不是多了几个命令，而是把“问 AI 写代码”改成了一条可以重复的工程流程：先把问题想清楚，再实现，最后把这次踩过的坑留下来。

![Compound Engineering 六步闭环](./assets/01-framework-loop.png)

插件官方把这条流程概括为六步：`brainstorm`、`plan`、`work`、`simplify`、`code-review`、`compound`。仓库目前提供 35 个技能，能运行在 Codex、Claude Code、Cursor 等多个 Agent 宿主上。它的目标很朴素：这次改动完成后，下一次改动应该更容易。

## 它解决的不是“不会写代码”

普通的 AI 编程对小改动很有效：贴一段报错，让模型给出补丁，运行测试，结束。但项目一旦涉及多个服务、数据库迁移、异步任务和产品规则，真正困难的通常是下面几件事：

* 需求里有哪些边界还没说清楚？
* 现有代码为什么这样写，哪些约束不能破坏？
* 改完后应该验证什么，哪些“看起来成功”其实不算成功？
* 这次排查得到的知识，下次能不能直接复用？

Compound Engineering 把这些容易被跳过的步骤变成了显式产物。`ce-brainstorm` 先整理需求，`ce-plan` 把它变成可执行计划，`ce-work` 执行计划，`ce-code-review` 独立检查，`ce-compound` 再把结论写进项目文档。这样做的价值不在仪式感，而在于每一步都有东西可以阅读和复核。

## 我实际使用的一条路径

我现在更常用下面这条路径，而不是直接把一句模糊需求丢给模型：

```text
$ce-brainstorm 描述问题和目标
$ce-plan
$ce-work
$ce-simplify-code
$ce-code-review
$ce-compound
```

遇到已经发生的故障，就从 `$ce-debug` 开始；只是想比较技术方向，可以用 `$ce-pov`；需要理解旧代码时，先用 `$ce-explain`。如果需求、计划和风险都已经明确，也可以使用 `$lfg` 让它自动跑完整流程，但我更愿意把它当成“明确范围后的自动执行器”，而不是需求分析器。

在 Codex 里，技能调用使用 `$skill-name`。第一次在项目里使用时，可以先运行 `$ce-setup`，让插件检查能力并生成项目配置。我的博客仓库把文章放在 `docs/`，因此会特别关注插件产物目录是否和现有文档结构冲突，必要时通过 `docs_root` 统一位置。

## 这几天最有用的几个经验

### 先让模型画出问题边界

在支付、退款或订单状态这类需求里，直接让模型“加一个接口”通常会漏掉回调、补偿和最终状态。我会先让 `brainstorm` 把参与者、状态变化、失败路径和验收条件列出来，再进入计划阶段。

![从问题到证据的排查路径](./assets/02-debug-evidence.png)

最近排查 Z-Pay 退款流程时，一个很容易误判的地方是：后台 `act=order` 返回成功，并不能证明退款已经完成。真正的闭环还包括 `act=refund`、异步 finalize worker，以及查询接口对最终状态的校验。把这些写进计划后，代码改动反而更小，因为实现不需要靠猜。

### 把“启动失败”当成约束来读

有一次开发服务卡在 migration `00049_course_chapter_groups.sql`，数据库报错指向 `paid_course_release_chapters` 的 append-only 约束。模型如果只看最后一行错误，很容易建议直接放开更新。沿着 `ce-debug` 的路径回看迁移、触发器和数据关系后，结论是先保留 append-only 不变量，再改成合法的关系写入路径，并在数据库里验证迁移。

这类问题说明，AI 的第一版修复建议只能算假设。真正有价值的是让它继续追到约束的来源，并留下可重复的验证命令。

### Review 要审模式，不只审这一行

`ce-code-review` 对我帮助最大的一点，是会把局部修复放回调用链里看。比如订单过期扫描，不能只修当前找到的一条记录；提醒任务也不能只在单元测试里证明“能发出”，还要确认重复执行、锁和勿扰边界。

我在学习行动闭环里遇到过提醒非重入、进度排序和过期订单扫描的问题。最后保留了每条 pending order 独立检查和 `timeoutMinutes`，并用数据库锁保证并发下不会重复处理。Review 的作用不是增加抽象，而是提醒我去检查兄弟调用方和失败分支。

### `simplify` 值得保留

模型很容易为了“以后扩展”加接口、工厂和配置项。实现完成后先跑一次 `ce-simplify-code`，常常能删掉这些还没有真实需求的东西。它和 code review 的关注点不同：前者问“能不能更简单”，后者问“有没有错误和回归”。

我的经验是，简单化应该发生在测试通过之后。这样删代码有证据，遇到行为变化也容易定位。

### 经验沉淀要写成下一次能用的规则

`ce-compound` 不是工作总结，而是把“下次遇到同类问题该先检查什么”写下来。例如：

* 迁移涉及 append-only 表时，先检查触发器和已有 release 行；
* 退款流程中，`act=order` 不能作为退款完成证据；
* 文档构建被 pnpm 11 的 `ERR_PNPM_IGNORED_BUILDS` 卡住时，使用项目已有的 VitePress 二进制做内容验证；
* 只修改目标文件，提交前检查 staged 文件名、统计和 `git diff --check`。

![一次修复如何沉淀成可复用规则](./assets/03-compound-knowledge.png)

这些规则比“今天修了一个 bug”更有复用价值。下一次 brainstorm 读取到它们后，模型会更早问出正确的问题。

## 我不会把所有事情都交给插件

这套流程也有边界。它不能替代产品取舍、真实环境验证和最终责任判断。尤其是支付、权限、数据迁移这类路径，模型给出的“测试通过”只说明某个检查通过，不能等同于线上闭环完成。

我通常把交付拆成三层：代码是否改对，测试和运行是否真实通过，Git 或外部发布是否完成。每层都单独报告，不把局部自动化结果包装成完整交付。

另外，`$lfg` 虽然可以自动执行计划、修复 review 问题、跑浏览器测试并提交代码，但它仍可能在预算耗尽时留下未解决项。范围不清楚时，自动化只会更快地产生返工；范围清楚、验证条件明确时，它才真正省时间。

## 适合什么时候用

小修小补直接改更快。下面这些场景值得走完整或半完整闭环：

* 跨多个模块的功能；
* 涉及数据库迁移、并发、支付或权限的改动；
* 需要多人或多个 Agent 接力的任务；
* 反复出现、希望变成项目规则的问题；
* 准备合并或发布前，需要独立 review 的改动。

我现在把它理解成一套“带记忆的工作方法”，不是一个更会补全代码的插件。AI 负责加速调查、实现和检查，人负责确认目标、约束和证据。两者配合起来，才有可能让每一轮开发真的比上一轮轻松。

## 参考

* [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin)
* [Compound Engineering 文档目录](https://github.com/EveryInc/compound-engineering-plugin/tree/main/docs/guides)
