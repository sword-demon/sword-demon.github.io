---
title: CDN单页面以及后台数据读取
date: 2022-06-30 21:29:10
category: Vue3
tag:
    - cdn
    - vue3
---

## 文档

-   [vue3 官网](https://v3.cn.vuejs.org/guide/migration/introduction.html#%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)
-   [CDN 地址](https://www.bootcdn.cn/vue/3.2.36/)

## 使用 cdn 来练习 vue3

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.bootcdn.net/ajax/libs/vue/3.2.36/vue.global.js"></script>
        <title>vue3</title>
    </head>
    <body>
        <h1>无解的游戏</h1>
        <div id="app">
            <h1>{{title}}</h1>
        </div>
        <script src="my.js"></script>
    </body>
</html>
```

我们可以把和`vue`相关的`js`内容放到另外的单独文件里。

```js
const app = Vue.createApp({
    data() {
        return {
            title: '无解',
        }
    },
})
// 挂载到 #app 显示的地方
app.mount('#app')
```

我们可以使用`vs code`的`Live Server`的插件来实时运行该页面。

## 使用单页面如何加载后台数据

> 我们可以简单使用`window`来模拟一个假数据

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.bootcdn.net/ajax/libs/vue/3.2.36/vue.global.js"></script>
        <title>vue3</title>
    </head>
    <body>
        <h1>无解的游戏</h1>
        <div id="app">
            <h1>{{title}}</h1>
            {{lessons}}
        </div>
        <script>
            window.lessons = [{ title: '装饰器' }, { title: '泛型' }]
        </script>
        <script src="hd.js"></script>
    </body>
</html>
```

`js`里的加载数据

```js
const app = Vue.createApp({
    data() {
        return {
            title: '无解',
            lessons: window.lessons,
        }
    },
})
// 挂载到 #app 显示的地方
app.mount('#app')
```

::: vue-demo 使用 vue 来演示

```vue
<template>
    <div id="app">
        {{ lessons }}
    </div>
</template>
<script>
    export default {
        data: () => ({ lessons: ['泛型', '装饰器'] }),
    }
</script>
```

:::

## 组件和应用

-   应用：就像父亲一样，就是一个`vue`的一个根组件
-   组件：就是根组件，父亲下面的孩子

```js
// 创建应用
const app = Vue.createApp({
    data() {
        return {
            name: '根-父组件',
        }
    },
    template: `<div>{{name}} <wx/></div>`,
})

// 组件
app.component('wx', {
    data() {
        return {
            name: '孩子组件',
        }
    },
    template: `<div style="background-color: red; color: white;">{{name}}</div>`,
})

// 挂载到 #app 显示的地方 得到根组件的实例
const vm = app.mount('#app')

// 获取到根组件的name属性值
console.log(vm.name)
```

我们可以使用一个定时器来修改对应的文本数据

```js
// 创建应用
const app = Vue.createApp({
    data() {
        return {
            name: '根-父组件',
        }
    },
})
// 挂载到 #app 显示的地方
const vm = app.mount('#app')

console.log(vm.name)
console.log(vm.$data.name)

setTimeout(() => {
    vm.$data.name = '修改值'
}, 3000)
```

> 则会在 3 秒之后将`name`属性绑定的文本数据进行修改。

:::warning 注意点

我们所有的`vue`指令只能放在对应的容器里面，不能放在容器上面，比如这里的：`<div id="app"></div>`不能在这个上面进行使用`vue指令`

:::
