---
title: monorepo的开发模式
date: 2026-05-09 20:26:01
categories:
	- Monorepo
tags:
	- Monorepo
---

## 什么是 Monorepo

Monorepo（单一仓库）是一种将多个相关项目存储在同一个 Git 仓库中的代码组织策略。这些项目可能相互依赖，也可能完全独立，但共享统一的版本控制、构建流程和开发规范。

**典型 Monorepo 结构：**

```
company-repo/
├── packages/
│   ├── ui/           # UI 组件库
│   ├── utils/        # 工具函数库
│   ├── app-frontend/ # 前端应用
│   └── app-backend/  # 后端应用
├── package.json
└── pnpm-workspace.yaml
```

## Monorepo vs Multirepo

| 特性 | Monorepo | Multirepo |
|------|----------|-----------|
| 仓库数量 | 1 个 | N 个 |
| 代码共享 | 直接引用 | 需要发布包 |
| 统一提交 | 跨项目原子提交 | 分散提交 |
| 权限控制 | 仓库级别 | 仓库/目录级别 |
| 构建时间 | 较长（需优化） | 较短 |
| 学习曲线 | 较陡 | 较平 |

**Multirepo 的常见问题：**

- 跨项目修改需要多个 Pull Request
- 依赖版本不一致导致的问题
- 重复的工具配置（ESLint、TypeScript、CI）
- 难以进行原子性的跨项目重构

## 为什么选择 Monorepo

**核心收益：**

1. **原子提交** - 一次提交可以同时修改库和使用它的应用，保证代码一致性

2. **简化依赖管理** - 内部包直接引用，无需发布到 npm，版本永远同步

3. **代码可见性** - 所有代码在一个仓库，更容易发现和复用现有实现

4. **统一工具链** - 一套配置覆盖所有项目，降低维护成本

5. **简化 CI/CD** - 统一的构建和部署流程

## 核心优势

### 1. 统一工具链

在 Monorepo 中，所有项目共享同一套开发工具配置：

```yaml
# 根目录配置覆盖所有子包
├── .eslintrc.js          # 统一代码规范
├── .prettierrc           # 统一格式化规则
├── tsconfig.json         # 统一 TypeScript 配置
├── jest.config.js        # 统一测试配置
└── .github/workflows/    # 统一 CI 流程
```

**实际收益：**
- 新项目无需重复配置，继承根目录设置
- 工具升级一次完成，所有项目同步受益
- 代码审查标准统一，降低沟通成本

### 2. 便捷协作

**跨项目开发场景：**

假设你需要修改 UI 组件库的一个按钮样式，同时更新使用该组件的两个应用：

**Multirepo 方式：**
```
1. 修改 ui-lib → 发 PR → 合并 → 发布 v1.2.0
2. 修改 app-a → 升级 ui-lib@1.2.0 → 发 PR
3. 修改 app-b → 升级 ui-lib@1.2.0 → 发 PR
4. 协调三个 PR 的合并顺序
```

**Monorepo 方式：**
```
1. 一个 PR 同时修改三个包
2. 原子性合并，保证代码一致性
```

**团队协作优势：**
- 代码审查更全面，能看到完整的影响范围
- 新人上手更容易，所有代码在一处
- 跨团队协作更顺畅，减少仓库切换

### 3. 依赖共享

**内部包引用：**

```json
// packages/app-frontend/package.json
{
  "dependencies": {
    "@company/ui": "workspace:*",     // 链接到本地包
    "@company/utils": "workspace:*"
  }
}
```

**pnpm workspace 机制：**

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

安装时自动创建软链接：
```
node_modules/
├── @company/ui -> ../../packages/ui
└── @company/utils -> ../../packages/utils
```

**实际收益：**
- 无需发布到 npm 即可使用本地包
- 修改立即生效，无需重新安装
- 节省 npm 仓库流量和发布时间

## 主流工具

### pnpm workspace

**最轻量的 Monorepo 基础方案**

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**核心特性：**
- 严格的依赖管理，节省磁盘空间
- workspace 协议实现本地包链接
- 与其他工具（Turborepo、Nx）良好兼容

**适用场景：** 小型团队、简单项目结构

**示例：**
```bash
# 安装所有依赖
pnpm install

# 运行特定包的脚本
pnpm --filter @company/ui dev

# 运行所有包的脚本
pnpm -r test
```

### Turborepo

**Vercel 出品的高性能构建系统**

**核心优势：**
- **增量构建** - 只构建改变的包及其依赖者
- **远程缓存** - 团队共享构建缓存，避免重复工作
- **管道并行** - 智能调度任务，最大化并行度

**配置示例：**

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

**性能提升：**
```
传统构建: 10 分钟
Turborepo 首次: 10 分钟
Turborepo 缓存命中: 30 秒
```

**适用场景：** 中大型项目、关注构建速度

### Nx

**Google 级别的智能构建系统**

**核心特性：**
- **依赖图** - 自动分析项目间依赖关系
- **受影响的项目检测** - 只测试和构建受影响的代码
- **丰富的插件生态** - React、Next.js、Node.js 等
- **可视化依赖图** - Nx Console 图形界面

**配置示例：**

```json
// nx.json
{
  "namedInputs": {
    "default": ["{projectRoot}/**/*"]
  },
  "targetDefaults": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"]
    }
  }
}
```

**适用场景：** 大型企业项目、需要强大可视化

### Lerna + Yarn Workspaces

**经典方案，逐渐被替代**

**历史地位：**
- 早期主流 Monorepo 工具
- 现在多作为 pnpm/Turborepo 的补充

**当前建议：**
- 新项目推荐 pnpm + Turborepo/Nx
- Lerna 专注于版本管理和发布

## 工具选型建议

| 场景 | 推荐方案 |
|------|----------|
| 小型项目 (< 5 包) | pnpm workspace |
| 中型项目 (5-20 包) | pnpm + Turborepo |
| 大型项目 (> 20 包) | pnpm + Nx |
| 关注构建速度 | Turborepo |
| 需要强可视化 | Nx |

## 实践指南

### 项目结构设计

**推荐结构：**

```
monorepo/
├── apps/                      # 应用层
│   ├── web/                   # Web 应用
│   ├── admin/                 # 管理后台
│   └── mobile/                # 移动端
├── packages/                  # 共享包
│   ├── ui/                    # UI 组件库
│   ├── utils/                 # 工具函数
│   ├── types/                 # 类型定义
│   └── config/                # 共享配置
├── internal/                  # 内部工具（不发布）
│   └── scripts/               # 构建脚本
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

**命名规范：**
- 应用：简单名称 (`web`, `admin`)
- 共享包：作用域前缀 (`@company/ui`, `@company/utils`)

**依赖方向原则：**
```
apps → packages → internal
  ↑        ↑         ↑
  └────────┴─────────┘
   绝不能反向依赖
```

### 构建优化策略

**1. 增量构建**

只构建改变的包及其依赖者：

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // 先构建依赖
      "outputs": [".next/**", "dist/**"]
    }
  }
}
```

**2. 任务并行**

独立任务并行执行：

```bash
# Turborepo 自动检测并行度
turbo run build test lint

# 输出示例
┌─ UI Server ─┐     ┌─ Admin ─┐
│ Build │ Test │     │ Build │
└──────┴──────┘     └────────┘
     ↓                    ↓
  ┌──────────────────────┐
  │    Web (依赖 UI)      │
  │    Build │ Test      │
  └──────────────────────┘
```

**3. 缓存策略**

```bash
# 本地缓存
turbo run build

# 远程缓存（Vercel / 自建）
turbo run build --token=<token>

# 跳过缓存
turbo run build --force
```

### CI/CD 配置

**GitHub Actions 示例：**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm run build

      - name: Test
        run: pnpm run test

      - name: Lint
        run: pnpm run lint
```

**智能 CI（只检测受影响的项目）：**

```yaml
# 使用 Nx 或 Turborepo 的 affected 命令
- name: Build affected
  run: pnpm run build --affected

- name: Test affected
  run: pnpm run test --affected
```

### 依赖管理最佳实践

**1. 固定内部包版本**

```json
// packages/web/package.json
{
  "dependencies": {
    "@company/ui": "workspace:*",  // 始终使用最新
    "@company/utils": "workspace:^" // 允许小版本更新
  }
}
```

**2. 外部依赖集中管理**

```json
// 根目录 package.json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}

// 子包不重复声明，继承根配置
```

**3. 使用 pnpm overrides 解决冲突**

```json
{
  "pnpm": {
    "overrides": {
      "react": "18.2.0"
    }
  }
}
```

## 优缺点分析

### 优势总结

| 优势 | 说明 |
|------|------|
| 原子提交 | 跨项目变更一次提交，保证一致性 |
| 简化依赖 | 内部包直接引用，无需发布流程 |
| 代码共享 | 提高代码复用率，减少重复开发 |
| 统一工具 | 一套配置管理所有项目，降低维护成本 |
| 简化协作 | 跨团队协作更顺畅，代码审查更全面 |
| 重构友好 | 跨项目重构在一个 PR 中完成 |
| 统一版本 | 所有项目使用相同的依赖版本 |

### 潜在挑战

**1. 构建时间增长**

所有项目一起构建，时间可能变长：

```
Multirepo: 单项目构建 2 分钟
Monorepo: 全量构建 10 分钟（5个项目）
```

**解决方案：**
- 使用 Turborepo/Nx 的增量构建
- 配置远程缓存共享构建结果
- CI 中使用 affected 命令只构建变更项目

**2. 仓库体积膨胀**

Git 仓库历史会快速增长：

```
node_modules/ 被忽略
但 packages/* 的历史都在一个仓库
```

**解决方案：**
- 使用 Git Sparse Checkout 只检出需要的目录
- 定期清理不必要的分支
- 考虑使用 Bazel 等工具进行更细粒度的依赖管理

**3. 权限控制受限**

无法为不同项目设置不同的访问权限：

```
所有人对整个仓库有相同的权限
```

**解决方案：**
- 使用 CODEOWNERS 文件控制代码审查权限
- 敏感代码放在独立的私有仓库
- 使用 GitHub 的 Protected Branches 限制合并权限

**4. CI 配置复杂**

CI 需要智能判断哪些项目需要构建：

```
简单的 CI 会构建所有项目（浪费）
需要 affected 检测（复杂）
```

**解决方案：**
- 使用 Turborepo/Nx 的 affected 命令
- 配置 path filter 只在特定路径变化时触发
- 使用 Nx Cloud 或 Turborepo Remote Cache

**5. 学习曲线陡峭**

团队需要学习新的工具和工作流：

```
新成员需要理解：
- workspace 协议
- 增量构建机制
- 依赖图概念
```

**解决方案：**
- 编写详细的团队文档
- 提供常用的命令速查表
- 设置 mentor 帮助新人上手

### 何时选择 Monorepo

**适合使用 Monorepo：**

- 项目之间有紧密的代码共享
- 频繁需要进行跨项目修改
- 团队规模不大（< 50 人）
- 需要统一的代码规范和工具链
- 希望简化依赖管理

**不适合使用 Monorepo：**

- 项目完全独立，无代码共享
- 需要为不同项目设置不同权限
- 团队规模很大（> 100 人）且组织复杂
- 项目技术栈差异大
- Git 操作性能成为瓶颈

**混合方案：**

```
按业务域划分多个 Monorepo：
├── frontend-monorepo/    # 前端相关
├── backend-monorepo/     # 后端相关
└── shared-monorepo/      # 共享库
```

## 总结

Monorepo 是一种强大的代码组织策略，适合有紧密协作需求的项目。通过 pnpm workspace、Turborepo、Nx 等工具，可以构建高效的开发环境。

**核心要点：**

1. **从简单开始** - 小项目先用 pnpm workspace，需要时再引入 Turborepo
2. **关注构建性能** - 增量构建和缓存是关键
3. **编写团队文档** - 降低学习曲线，统一开发规范
4. **定期评估架构** - 随着团队增长，可能需要调整 Monorepo 策略

**快速开始建议：**

```bash
# 1. 初始化 pnpm workspace
pnpm init
echo "packages:\n  - 'packages/*'" > pnpm-workspace.yaml

# 2. 创建项目结构
mkdir -p packages/ui packages/apps/web

# 3. 配置 workspace 依赖
cd packages/web
pnpm add @company/ui

# 4. 可选：添加 Turborepo
pnpm add -D turbo
echo '{"pipeline": {"build": {"dependsOn": ["^build"]}}}' > turbo.json
```

**参考资源：**

- [pnpm workspace 官方文档](https://pnpm.io/workspaces)
- [Turborepo 官方文档](https://turbo.build/repo/docs)
- [Nx 官方文档](https://nx.dev)
- [Monorepo.tools - 工具对比](https://monorepo.tools)