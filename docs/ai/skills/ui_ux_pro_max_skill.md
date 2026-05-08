---
title: ui-ux-pro-max-skill
description: Learn about the advanced UI/UX skills that can elevate your design projects to the next level.
date: 2026-05-09 02:14:02
---

# UI UX Pro Max Skill 使用教程（偏 Claude/Codex 实操）

很多全栈在用 AI 写 UI 时会踩同一个坑：同一句“做个落地页/管理后台”，输出的风格、字号、间距、对比度和交互细节不稳定，最后变成“靠运气抽卡”。UI UX Pro Max 的定位很明确：把 UI/UX 决策做成可搜索的结构化知识库，让 AI 先检索再生成，从“随机发挥”变成“有依据的实现”。

官网：https://ui-ux-pro-max-skill.nextlevelbuilder.io/

## 它解决什么问题（全栈视角）

- 你想要“专业一致”的 UI，而不是每次重写设计系统。
- 你需要能复用的设计决策：风格、配色、字体搭配、落地页结构、图表选型、UX 规则、不同技术栈最佳实践。
- 你希望 AI 在生成代码前，先拿到“设计依据”，避免反复打补丁。

UI UX Pro Max 的数据被拆成多个域（domain），常用包括：`product/style/color/typography/landing/chart/ux/prompt`，并提供 `html-tailwind/react/nextjs/vue/.../shadcn` 等栈级指导。其检索脚本使用本地 Python 来搜索 CSV 数据（BM25），AI 负责把结果综合进你的代码与组件结构中。

## 安装（推荐 uipro-cli）

仓库提供 `uipro-cli` 用于把 skill/workflow 安装到你当前项目里（对应 Claude/Codex 的目录结构）。

```bash
npm install -g uipro-cli

cd "/path/to/your/project"

# Claude Code
uipro init --ai claude

# Codex CLI（Skills）
uipro init --ai codex

# 或者全装
uipro init --ai all
```

### 安装后你应该看到的目录（重点看 Claude/Codex）

- Claude Code：`.claude/skills/ui-ux-pro-max/SKILL.md`
- Codex CLI：`.codex/skills/ui-ux-pro-max/SKILL.md`

如果你想手动安装，也可以直接从仓库把对应目录复制到项目根目录（具体映射见仓库 README）。

## 前置条件：Python 3

检索脚本依赖 Python 3（用于搜索 CSV 数据库）。先确认：

```bash
python3 --version || python --version
```

## 用法 1：让 Claude/Codex 自动启用（最省心）

安装完成后，你可以像平时一样描述 UI 需求即可。建议你在 prompt 里明确 4 个要素，能显著提高命中率：

- 产品类型：SaaS / e-commerce / dashboard / portfolio / admin
- 风格关键词：minimal / bento / brutalism / glassmorphism / dark mode
- 目标页面：landing / settings / auth / onboarding / analytics
- 技术栈：Next.js / React / Tailwind / shadcn/ui（不写通常默认到 html-tailwind）

Codex CLI 里你也可以显式调用：

```text
$ui-ux-pro-max 为一个 B2B SaaS 做一个带暗黑模式的 landing page，技术栈 Next.js + Tailwind
```

官网提供了一些很多案例站点的`prompt`模版,你可以直接去复制拿来修改使用

## 用法 2：你先检索，再把结果“喂给”AI（更可控、更适合团队协作）

当你不希望 UI 方向被模型随机带偏时，推荐先用脚本把“设计依据”检索出来，然后让 Claude/Codex 严格按依据实现。

### 1）定位脚本（Codex 安装形态）

通常在：

- `.codex/skills/ui-ux-pro-max/scripts/search.py`

（如果你装的是共享形态，也可能在 `.shared/ui-ux-pro-max/scripts/search.py`。）

### 2）按域检索（建议顺序）

下面是一套可复用的检索顺序：先定产品与风格，再补齐字体/配色/结构/UX/栈最佳实践。

```bash
# 1) 产品类型 → 推荐主风格/落地页模式
python3 ".codex/skills/ui-ux-pro-max/scripts/search.py" "fintech saas dashboard" --domain product -n 3

# 2) 风格细则 → 颜色、效果、复杂度、可访问性等
python3 ".codex/skills/ui-ux-pro-max/scripts/search.py" "minimal dark mode bento" --domain style -n 3

# 3) 字体搭配 → Google Fonts URL / CSS Import / Tailwind Config
python3 ".codex/skills/ui-ux-pro-max/scripts/search.py" "professional modern" --domain typography -n 2

# 4) 配色 → primary/cta/background/text/border 的 hex
python3 ".codex/skills/ui-ux-pro-max/scripts/search.py" "fintech saas" --domain color -n 1

# 5) 落地页结构（如果你在做 landing page）
python3 ".codex/skills/ui-ux-pro-max/scripts/search.py" "hero pricing testimonials" --domain landing -n 2

# 6) UX 指南 → a11y、交互、反模式
python3 ".codex/skills/ui-ux-pro-max/scripts/search.py" "accessibility focus contrast" --domain ux -n 3

# 7) 栈级最佳实践（根据你的真实栈选择）
python3 ".codex/skills/ui-ux-pro-max/scripts/search.py" "forms validation" --stack nextjs -n 3
```

### 3）把检索输出拼成“可执行需求”

把你上面的搜索输出原样粘贴给 Claude/Codex，并加上这段约束模板，能减少“看起来很对但细节不落地”的情况：

1. 背景与目标
   - 产品：`[...]`
   - 页面：`[...]`
   - 技术栈：`[...]`（例如 Next.js + Tailwind + shadcn/ui）
2. 必须满足
   - 响应式、暗黑模式、键盘可达、可见 focus 状态、文本/背景对比度达标
3. 禁止事项
   - 不用 emoji 当图标，统一用 SVG icon（Lucide/Heroicons 等）
4. 输入依据
   - 贴上 `product/style/typography/color/ux/stack` 的检索结果
5. 输出要求
   - 先给设计系统摘要（颜色 token、字体、间距、圆角、阴影、组件语气）
   - 再输出代码（按职责拆文件，避免单文件巨石）
   - 最后给自检清单（a11y、对比度、hover/focus、布局稳定性）

## Claude 与 Codex 的实操差异（建议）

- Claude Code：更适合“边对话边改代码”，你可以让它先跑检索，再按检索结果逐个组件落地。
- Codex CLI：更适合把检索结果固化成“可追溯依据”（例如放到 PR 描述/任务卡），再让模型按依据实现，减少返工。

## 常见问题排查

- 找不到脚本：在项目根目录搜索 `scripts/search.py`，常见路径是 `.codex/skills/ui-ux-pro-max/scripts/search.py` 或 `.shared/ui-ux-pro-max/scripts/search.py`。
- Python 报错/命令不存在：先确认 `python3 --version`，Windows 需要重开终端让 PATH 生效。
- 输出风格仍不稳定：用“先检索再实现”的方式，并在 prompt 里明确“必须严格按检索结果执行，不要自行发挥”。

## 参考链接

- GitHub：[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- CLI：[ui-ux-pro-max-skill/cli](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/cli)
- 官网：[ui-ux-pro-max-skill.nextlevelbuilder.io](https://ui-ux-pro-max-skill.nextlevelbuilder.io/)
