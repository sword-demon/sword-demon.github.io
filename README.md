# 无解的博客 · wxvirus

> 人生就是一场无解的游戏。

基于 [VitePress](https://vitepress.dev/) + [vitepress-theme-teek](https://theme-teek.vitejs.dev/) 搭建的个人技术博客与学习笔记站点，通过 GitHub Actions 自动部署至 GitHub Pages。

线上地址：<https://sword-demon.github.io/>

## ✨ 特性

- 📖 **结构化 & 体系化**：自动生成侧边栏、归档页、分类页、标签页，构建结构化知识库
- 🎇 **文档风 & 博客风**：Teek 主题支持博客、文档站、知识库等多种风格
- 🔍 **本地全文搜索**：内置 VitePress 本地搜索，无需额外服务
- 🎨 **丰富的 Markdown 扩展**：代码行号、图片懒加载、提示容器、语言别名等
- 🚀 **CI/CD 自动部署**：推送到 `master` 分支即自动构建并发布至 `gh-pages`

## 🗂️ 内容板块

| 板块        | 说明                                       |
| ----------- | ------------------------------------------ |
| AI          | Claude Desktop 等 AI 工具使用笔记          |
| Go 语言基础 | Go 基础语法、并发、接口、指针等核心知识    |
| Go 核心     | Go 运行时、Map 原理、Web Server、gRPC 等   |
| Go-zero     | Go-zero 微服务框架环境搭建与模型操作       |
| 运维技术    | Docker、K8s、Nginx、MySQL、Redis 部署实战  |
| Java 技术   | Dubbo3、MyBatis-Plus、全局异常处理等       |
| Redis       | 缓存结构、并发读写、持久化、集群策略       |
| RabbitMQ    | 消息队列部署、交换机、生产消费者模型       |
| Rust        | 所有权、Clone/Copy、CSV CLI、面试题        |
| 前端 (Vue3) | Composition API、脚手架、React+TS 学习笔记 |
| 网络编程    | Socket、TCP/UDP、粘包、WebSocket 等        |
| Flutter     | iOS / Android Flutter 环境搭建             |
| Linux       | C 语言内核、进程信号、ELF、PHP 多进程      |
| 数据结构    | 排序、递归、查找、回文、线性表、迭代器设计 |
| 随笔 / 面试 | 分布式事务、MySQL 主从、面试真题等         |

完整导航请见站点顶栏。

## 🚀 本地开发

### 环境要求

- Node.js `>= 20`
- pnpm（推荐）

### 常用命令

```bash
# 安装依赖
pnpm install

# 本地开发（热更新）
pnpm docs:dev

# 生产构建
pnpm docs:build

# 预览构建产物
pnpm docs:preview
```

## 📁 目录结构

```
.
├── .github/workflows/deploy-docs.yml   # GitHub Pages 自动部署
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts                  # VitePress 主配置
│   │   ├── teekConfig.mts              # Teek 主题配置
│   │   └── theme/                      # 主题入口
│   ├── public/                         # 静态资源
│   ├── ai/                             # AI 工具笔记
│   ├── views/                          # 技术栈学习笔记
│   ├── linux/                          # Linux 相关
│   ├── posts/                          # 随笔
│   ├── interview/                      # 面试
│   ├── guide/                          # 指南
│   ├── index.md                        # 首页
│   ├── categories.md                   # 分类页
│   ├── tags.md                         # 标签页
│   └── @pages/archivesPage.md          # 归档页
├── package.json
└── pnpm-lock.yaml
```

## 🛠️ 技术栈

- **框架**：VitePress `^1.6.3`
- **主题**：vitepress-theme-teek
- **运行时**：Vue `^3.5.0`
- **包管理**：pnpm
- **部署**：GitHub Actions + GitHub Pages

## 🚢 部署流程

推送到 `master` 分支后，`.github/workflows/deploy-docs.yml` 会自动：

1. 拉取代码并安装 pnpm
2. 执行 `pnpm install` 安装依赖
3. 执行 `pnpm run docs:build` 构建静态站点
4. 将 `docs/.vitepress/dist` 发布到 `gh-pages` 分支

## 📄 License

[MIT](./LICENSE) © wxvirus
