---
title: 脚手架项目的基本搭建
date: 2025-02-09 21:29:10
category: Vue3
---

## 配置项目基础结构

>   Vite + TS + Vue3 初始化项目

### 项目的目录结构


```txt
.husky/ # git 钩子配置
dist/ # 打包后的目录
mock/ # mock 数据
public/ # 不经过打包的静态资源
type/ # ts类型定义
directive/ # 自定义指令
src/ # 项目资源
    api/ # ajax http 请求管理
    assets/ # 经过打包的静态资源
    components/ # 通用组件
    hooks/ # 通用组件状态逻辑函数
    router/ # 路由管理
    store/ # 组件状态管理
    styles/ # 项目通用样式
    utils/ # 工具函数
        request/ # axios 封装
    views/ # 页面组件
```



### 安装依赖

```bash
npm init
# 一路 enter，下一步即可
```

一个纯净的项目，里面就一个`package.json`文件，然后按照上述目录结构创建对应的目录结构

安装依赖

```bash
pnpm install axios pinia vue vue-router nprogress pinia-plugin-persistedstate
```

```bash
pnpm install element-plus
```

```bash
pnpm install -D typescript less
```



### 创建对应的文件

创建主文件`src/main.ts`，创建主组件`src/App.vue`，并在根目录下创建`index.html`

`index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AdminPro</title>
</head>
<body>
    <!-- 令 id="app" 便于 vue 进行挂载 -->
    <div id="app"></div>
    <!-- 引入 main.ts 文件 -->
    <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

`src/App.vue`

```vue
<template>
    <router-view></router-view>
</template>

<script setup></script>
```

设置基础`styles/reset.css`样式，默认样式的重置

[minireset.css](https://github.com/jgthms/minireset.css/blob/master/minireset.css)

```css
/*! minireset.css v0.0.6 | MIT License | github.com/jgthms/minireset.css */
html,
body,
p,
ol,
ul,
li,
dl,
dt,
dd,
blockquote,
figure,
fieldset,
legend,
textarea,
pre,
iframe,
hr,
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  padding: 0;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: 100%;
  font-weight: normal;
}

ul {
  list-style: none;
}

button,
input,
select {
  margin: 0;
}

html {
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}

img,
video {
  height: auto;
  max-width: 100%;
}

iframe {
  border: 0;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

td,
th {
  padding: 0;
}
```

`src/main.ts`

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import './styles/index.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

### 配置路由文件`src/router/index.ts`

```ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置路由
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: () => '../views/home/index.vue',
        meta: {},
        children: []
    }
]
const router = createRouter({
    // 哈希路由
    history: createWebHashHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    NProgress.start()
    next()
})

router.afterEach(() => {
    NProgress.done()
})


export default router;
```

对应的`main.ts`也要进行修改

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import './styles/index.css'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

### 配置 store

`src/store/index.ts`

```ts
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
// 使用 pinia 数据持久化插件
pinia.use(piniaPluginPersistedstate);
export default pinia;

```

对应的`main.ts`也需要修改

```ts
// ... 其他省略
import pinia from './store'

const app = createApp(App)
app.use(pinia)
app.mount('#app')
```



### axios简单封装

`src/http/request.ts`

```ts
// 封装 axios 请求
import axios from "axios";

const service = axios.create({
    baseURL: '/',
    timeout: 15000,
})

// axios 实例的拦截请求
service.interceptors.request.use(config => {
    return config
}, error => {
    return Promise.reject(error)
})

// axios 实例的拦截响应
service.interceptors.response.use(response => {
    return response.data
}, error => {
    return Promise.reject(error)
})

export default service;
```



### 配置 vite

```bash
pnpm install -D vite @vitejs/plugin-vue @vitejs/plugin-vue-jsx
pnpm install -D @types/node @types/nprogress vue-tsc
```

>   环境变量
>
>   `Vite`在一个特殊的`import.meta.env`对象上暴露环境变量
>
>   常见的内建变量

-   `import.meta.env.MODE`: {string} 应用的运行的模式
-   `import.meta.env.BASE_URL`: {string} 部署应用时的基本 URL，他由`base`配置项决定
-   `import.meta.env.PROD`: {boolean} 应用是否允许在生成环境
-   `imoprt.meta.env.DEV`: {boolean} 应用是否运行在开发环境 永远与上一个相反
-   `import.meta.env.SSR`: {boolean} 应用是否运行在 `server` 上



在根目录下创建 3 个文件

-   `.env.development`
-   `.env.production`
-   `.env`

`.env.development`

```txt
# axios 请求的 baseURL
# 以 VITE_ 开头的
VITE_APP_API_BASEURL = /api
```

