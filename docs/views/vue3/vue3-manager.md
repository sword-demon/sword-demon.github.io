---
title: Vue 3 + Vite 后台管理系统
date: 2023-06-15 21:44:10
category: Vue3
tag:
    - vite4
    - vue3
---

# Vue 3 + Vite 后台管理系统

## 初始化项目

```bash
yarn create vite manager-fe

# 下面选 Vue 选 JavaScript

# 直到出现
cd manager-fe
yarn
yarn dev
```

即可

## 旧版本升级

```bash
# 更新语法
cd 项目
yarn vite -S
```

## vscode 插件

```text
Eslint
Vetur
TypeScript
Prettier
```

## 项目初始化

### 安装项目所需要的插件

```bash
# -s 开发依赖
yarn add vue-router@next vuex@next element-plus axios -s

# -D 生产依赖
yarn add sass -D
```

### Vue 全家桶升级(如果不是最新版)

更新项目主要插件

```bash
yarn add element-plus vue vue-router vuex -S

yarn add vite @vitejs/plugin-vue -D
```

修改`element-plus`引用方式

```js
// 以前写法
import 'element-plus/lib/theme-chalk/index.css'
// 更新以后得写法
import 'element-plus/dist/index.css'
```

修改菜单组件语法

```vue
el-submenu 改成 el-sub-menu
```

## 目录结构

```text
dist
node_modules
public
src
    api
    assets
    components
    config
    router
    store
    utils
    views
    App.vue
    main.js
.gitignore
.env.dev
.env.test
.env.prod
index.html
package.json
vite.config.js
yarn.lock
```

### vite.config.js

官方文档: [https://vitejs.dev/config](https://vitejs.dev/config)

> 更改这个配置需要重启

```bash
$ yarn dev
yarn run v1.22.10
$ vite

  VITE v4.3.9  ready in 178 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 获取环境变量

以前是

```js
console.log(process.env)
```

文档地址: [https://vitejs.dev/guide/env-and-mode.html](https://vitejs.dev/guide/env-and-mode.html)
现在需要改成

```js
console.log(import.meta.env)
```

如果要切换环境，需要修改`package.json`改成开发环境

```json
{
    "scripts": {
        "dev": "vite --mode dev",
        "build": "vite build",
        "preview": "vite preview"
    }
}
```

---

### 自定义环境变量

> 只有前缀变量为`VITE_`的才能自定义变量
> 在项目根目录创建一个`.env.dev`

在`.env.dev`中配置

```dotenv
NODE_ENV=development
VITE_NAME=wxvirus
```

再次启动打印之后

```json
{
    "VITE_NAME": "wxvirus",
    "VITE_USER_NODE_ENV": "development",
    "BASE_URL": "/",
    "MODE": "dev",
    "DEV": true,
    "PROD": false,
    "SSR": false
}
```

就可以看到自己自定义的环境变量

## 路由封装

```js
import { createRouter, createWebHashHistory } from 'vue-router'
// hash 路由是井号 不需要 nginx 配置
// history 是直接斜杠

import Home from './../components/Home.vue'
import Welcome from './../components/Welcome.vue'
import Login from './../components/Login.vue'

const routes = [
    {
        name: 'home',
        path: '/',
        meta: {
            title: '首页',
        },
        component: Home,
        redirect: '/welcome',
        children: [
            {
                name: 'welcome',
                path: '/welcome',
                component: Welcome,
                meta: {
                    title: '欢迎页',
                },
            },
            {
                name: 'login',
                path: '/login',
                component: Login,
                meta: {
                    title: '登录',
                },
            },
        ],
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
```

跳转的三种方式：

1. 使用`router-link`
2. 使用`Options API`的定义事件方法跳转
3. 使用`Composition API`使用`useRouter`来进行跳转

纯钩子函数

```vue
<script setup>
    import { useRouter } from 'vue-router'
    const router = useRouter()
    const goHome = () => {
        router.push('/')
    }
</script>

<template>
    <h1>欢迎来到登录页面</h1>
    <el-button type="primary" @click="goHome">回首页</el-button>
</template>
```

```vue
<script>
    export default {
        name: 'login',
        methods: {
            goHome() {
                this.$router.push('/')
            },
        },
    }
</script>
```

```vue
<template>
    <h1>欢迎来到欢迎界面</h1>
    <router-link to="/login">去登录</router-link>
</template>
```

## 环境配置

`config/index.js`

```js
/**
 * 环境配置封装
 */

// 是一个对象
// 取出环境 默认是生产环境
// dev test prod
const env = import.meta.env.MODE || 'prod'
const EnvConfig = {
    dev: {
        baseApi: '/',
        mockApi: '',
    },
    test: {
        baseApi: '/test.future.com/api',
        mockApi: '',
    },
    prod: {
        baseApi: '/future.com/api',
        mockApi: '',
    },
}
export default {
    // 开发环境
    env: env,
    // 当前接口是否支持 mock 开关
    mock: true,
    ...EnvConfig[env],
}
```

-   在线 mock 的网站[https://fastmock.site](https://fastmock.site)
-   mockjs 文档: [https://mockjs.com](https://mocjs.com)

## Koa2 后端项目初始化

### koa-generator 快速生成 koa 服务的脚手架工具

全局安装：

```bash
npm install -g koa-generator
# or
yarn global add koa-generator
```

生成项目：

```bash
koa2 manager-server
```

> 如果无法使用命令，则代表没有配置环境变量，配置一下环境变量即可

### 安装依赖

```bash
yarn
# or
npm install
# or
cnpm install
```

### 启动服务

```bash
yarn start
# or
npm start
```

出现：

```bash
node .bin/www
```

就可以使用默认的访问地址: [http://localhost:3000](http://localhost:3000)

### koa2 的框架目录

```text
|-- koa-server
   |-- app.js             #根入口
   |-- package-lock.json
   |-- package.json			 #项目依赖包文件
   |-- bin
   |   |-- www					 #运行启动文件
   |-- public            #公共资源
   |   |-- images
   |   |-- javascripts
   |   |-- stylesheets
   |       |-- style.css
   |-- routes
   |   |-- index.js      #定义了localhost:3000/之下的路由
   |   |-- users.js      #定义了localhost:3000/users/之下的路由
   |-- views             #视图Pug是一款HTML模板引擎，专门为 Node.js 平台开发
       |-- error.pug
       |-- index.pug
       |-- layout.pug
```
