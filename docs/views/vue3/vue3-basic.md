---
title: vue3基础学习
date: 2023-09-24 09:33:10
category: Vue3
tag:
    - vue3
---

# Vue3学习

## 使用`vite`

>   使用`vite`创建项目

```bash
pnpm create vite@latest vue3-basic --template vue-ts
```



>   文件了解

`tsconfig.json`和`tsconfig.node.js`区别，一个是浏览器环境一个是`node`环境

`vite.config.ts`整个项目的一个配置文件，默认插件`@vitejs/plugin-vue`

根文件: `index.html`，有一个`<div id="app"></div>`根节点，处理代码: `<script type="module" src="/src/main.ts"></script>`

如果点击`main.ts`到了对应的代码页面，会发现一个`./App.vue`有一个爆红

组件内容在`components`目录

`vite-env.d.ts`这个安装在`node_modules/vite/client.d.ts`，有了这些定义，我们可以在`main.ts`中可以加载对应的文件和一些类型



## 推荐插件安装

-   官方推荐`Volar`，先禁用`vetur`，两个会冲突
-   `volar typescript vue plugin`，这个安装之后，上面的`./App.vue`爆红的就消失了
-   浏览器插件: `devtools`



## 代码规范

### ESLint

[https://eslint.org]

>   是一个开源的`JavaScript`的`linting`工具，使用`espree`将代码解析成抽象语法树(AST)，然后通过`AST`来分析我们的代码。

安装

```bash
pnpm add eslint --D
```

查看版本

```bash
npx eslint --version
v8.50.0
```

使用命令来生成配置文件

```bash
npx eslint --init

1. 目的是什么？检测语法就行
2. 使用 esm
3. 在 vue.js 使用
3. 使用 ts
4. code 在 Node 运行
5. 配置文件格式 javascript
6. 选择 yes
7. 可以选择你使用的包管理器
```

```bash
npx eslint --init
You can also run this command directly using 'npm init @eslint/config'.
npm WARN cli npm v10.1.0 does not support Node.js v17.6.0. This version of npm supports the following node versions: `^18.17.0 || >=20.5.0`. You can find the latest version at https://nodejs.org/.
Need to install the following packages:
@eslint/create-config@0.4.6
Ok to proceed? (y)
✔ How would you like to use ESLint? · problems
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · vue
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser
✔ What format do you want your config file to be in? · JavaScript
The config that you've selected requires the following dependencies:

@typescript-eslint/eslint-plugin@latest eslint-plugin-vue@latest @typescript-eslint/parser@latest
✔ Would you like to install them now? · No / Yes
✔ Which package manager do you want to use? · pnpm
Installing @typescript-eslint/eslint-plugin@latest, eslint-plugin-vue@latest, @typescript-eslint/parser@latest
Packages: +34
++++++++++++++++++++++++++++++++++
Progress: resolved 199, reused 167, downloaded 11, added 34, done

devDependencies:
+ @typescript-eslint/eslint-plugin 6.7.2
+ @typescript-eslint/parser 6.7.2
+ eslint-plugin-vue 9.17.0

The integrity of 1212 files was checked. This might have caused installation to take longer.
Done in 2.3s
Successfully created .eslintrc.cjs file in /Users/xxx/WebstormProjects/vue3-basic
```

>   Rules

在`.eslintrc.cjs`里有一个`rules`配置

[ESLint 可用的 Rules](https://eslint.org/docs/latest/rules)

一个`rule`有 3 个等级

-   0：关闭，单词: `off`
-   1：`warning`输出警告，但是不是错误， 单词: `warn`
-   2：代表错误，会直接抛出错误, 单词: `error`

配置一个分号必须存在的规则

```js
rules: {
        semi: 2,
    },
```

使用命令来检测

```bash
npx eslint src/main.ts
```

>   Extends

一系列的规则作为一组

`eslint`推荐的规则合集

```js
"extends": "eslint:recommended"
```

[https://eslint.org/docs/latest/rules](https://eslint.org/docs/latest/rules)里面有绿色勾的就是启用的设置



### 添加 Vue 官方的`ESLINT`插件

[https://eslint.vuejs.org](https://eslint.vuejs.org)

安装

```bash
pnpm add -D vite-plugin-eslint
```

如果你是`pnpm create vite@latest --template vue-ts`的基本不用下载安装，因为默认就给你集成了，如果是`npm create vite@latest -- --template vue-ts`就需要安装

对应的`.eslintrc.cjs`文件修改

```js
extends: ["plugin:vue/vue3-essential"],
```

`pnpm`创建的项目里的内容是这样的

```js
extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:vue/vue3-essential'],
```

---

`npm`创建项目之后安装完插件之后在`vite.config.ts`中引入插件

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), eslint()],
});

```

此时`.eslintrc.cjs`的`module`会报错

```js
module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        // 把 node 加上 保存之后要有输入的内容才能重新验证
        "node": true
    }
}
```

把对应的`parser`和`plugins`删掉，把`extends`提前

---

此时只能对`js`进行验证，对`vue`文件无法验证，我们还需要在`vscode`里配置，可以新建一个`.vscode`目录

`settings.json`

```json
{
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "vue",
        "typescript",
        "typescriptreact"
    ]
}
```



安装`eslint-plugin-vue`验证`vue`语法

```bash
pnpm add -D eslint-plugin-vue
```

修改配置文件

```js
"extends": ["plugin:vue/vue3-essential"],
```

一些规则组

-   plugin:vue/vue3-essential   少
-   plugin:vue/vue3-strongly-recommeded  强规则
-   plugin:vue/vue3-recommended  最多



### 添加 Typescript 的特殊规则

`@vue/eslint-config-typescript` [https://github.com/vuejs/eslint-config-typescript](https://github.com/vuejs/eslint-config-typescript)

```bash
pnpm add -D @vue/eslint-config-typescript
```

```bash
npm install @vue/eslint-config-typescript --save-dev
```

添加新的规则组

```js
extends: ['eslint:recommended', '@vue/eslint-config-typescript', 'plugin:vue/vue3-essential'],
```

如果是`pnpm`创建的项目，用的是别的

```js
extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:vue/vue3-essential'],
```



## 响应式基础

`defineComponent`

[https://cn.vuejs.org/guide/typescript/overview.html#defineComponent](https://cn.vuejs.org/guide/typescript/overview.html#defineComponent)



响应式基础

[https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html)



### ref的自动解包

-   当`ref`在模板中作为顶层属性被访问时，它们会被自动“解包”，所以不需要使用`.value`

我们先把`script`里的`setup`去掉换成`defineComponent`的写法



```vue
<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';

export default defineComponent({
  name: 'App',
  setup() {
      const count = ref(0);
      const user = reactive({
        name: 'virus',
        age: 20,
      });
      const increase = () => {
          count.value++;
          user.age++;
      };

      return {
        count,
        user,
        increase
      };
  }
});
</script>

<template>
  <div>
    <h1>{{ count }}</h1>
    <h2>{{ user.age }}</h2>
    <button type="button" @click="increase">新增</button>
  </div>
</template>
```

加入类型

```vue
<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';

interface Person {
  name: string
  age: number
}

export default defineComponent({
  name: 'App',
  setup() {
      const count = ref<string | number>(0);
      const user: Person = reactive({
        name: 'virus',
        age: 20,
      });
      const increase = () => {
        if (typeof count.value === 'number') {
          count.value++;
        }
        user.age++;
      };

      return {
        count,
        user,
        increase
      };
  }
});
</script>
```



**ref和 reactive 的区别**

-   `reactive`参数只能是`object`，ref 都是可以的
-   `ref`需要使用`.value`来访问其中的值，`reactive`不需要
-   `ref`在 Vue 源码内部是一种特殊的`reactive`

简单假设这样的一个模型

```ts
const myRef = reactive({
    value: "i'am ref!"
})

myRef.value
```



**怎么选择？**

-   没有特殊的规则，个人喜好
-   个人更加喜欢原始类型使用`ref`，`Object`使用`reactive`

```ts
const a = 1;
const a = ref(1)

const user = {name: 'dwqdwq'}
const user = reactive({name: 'dwqdwq'})
```
