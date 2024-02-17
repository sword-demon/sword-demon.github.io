---
title: tov-ui工程目录初始化
date: 2024-02-17 23:01:10
category: Vue3
tag:
  - tov-ui
  - vue3
---

# tov-ui工程目录初始化

```text
➜  tov-ui git:(main) tree -L 1
.
├── ESLint.md
├── Git.md
├── Husky.md
├── README.md
├── eslint.config.js
├── node_modules
├── package.json
├── packages
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

打开终端

```bash
pnpm create vite

# 输入项目名称

# 选择 Vue

# 选择 Typescript

# 安装依赖
pnpm install
```

进入项目目录

```bash
touch pnpm-workspace.yaml
```

或者如果是`windows`下就直接右键新建文件即可，注意文件名称后缀`yaml`

```yaml
packages:
  - packages/*
```

并在根目录中创建`packages`目录，并继续创建`tov-ui`目录，再次打开终端进入`tov-ui`命令初始化项目

```bash
cd packages/tov-ui
pnpm init
```

就会产生一个`package.json`文件。

最后在清理一些用不到的文件

-   根目录下的`src`目录
-   根目录下的`public`目录
-   根目录下的`index.html`

修改根目录下的`tsconfig.json`将里面的`include`一行删除，根目录下的`package.json`里的`name`以及`scripts`里的内容删除，以及`private`也删除



在`packages/tov-ui`下新建`tsconfig.json`进行配置

```json
{
    // 继承根目录下的一些配置
    "extends": ["../../tsconfig.json"],
    "compilerOptions": {},
    "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
}
```

> 最终目录结构

```text
.
├── ESLint.md
├── Git.md
├── Husky.md
├── README.md
├── eslint.config.js
├── node_modules
|-- node_modules下的子集....
├── package.json
├── packages
│   └── tov-ui
│       ├── package.json
│       ├── src
│       └── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```