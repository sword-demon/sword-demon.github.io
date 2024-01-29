---
title: 选项式API和组合式API
date: 2024-01-29 22:02:10
category: Vue3
tag:
    - composition
    - vue3
---

# 选项式API和组合式 API 的区别

## 选项式 API

```js
<script lang="ts">
export default {
  data() {
    return {
      msg: '这是一个无解的游戏',
      count: 0,
    }
  },
  methods: {
    addOne() {
      this.count++
    },
  },
}
</script>

<template>
  <div>
    <h3>无解的游戏</h3>
    <p>{{ msg }}</p>
    <p>count 的值为: {{ count }}</p>
    <button @click="addOne">click +1</button>
  </div>
</template>
```

## 组合式 API

```js
<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('hello world')
const count = ref(0)

const addOne = () => {
  count.value++
  console.log(count.value)
}
</script>

<template>
  <div>
    <h3>无解的游戏</h3>
    <p>{{ msg }}</p>
    <p>count 的值为: {{ count }}</p>
    <button @click="addOne">click +1</button>
  </div>
</template>
```

-   `setup`函数中没有`this`
-   `setup`函数只会在组件初始化的时候执行一次

或者

```js
export default {
    setup() {
        const msg = ref('hello world')
        const count = ref(0)

        const addOne = () => {
          count.value++
          console.log(count.value)
        }
        
        // 需要返回
        return {
            msg,
            count,
            addOne
        }
    }
}
```

-   通过`ref`声明响应式变量，`ref`的值就是初始值
-   引用`ref`声明的变量后面必须加`.value`才能用到，但是在`template`里不能使用



## data 选项式声明状态

```js
export default {
    data() {
        return {}
    }
}
```

此选项的值必须返回一个对象，`Vue`在创建组件实例的时候会调用此函数，并将函数返回的对象用响应式系统进行包装。此对象的所有顶层属性都会被代理到组件实例，即方法和生命周期钩子中的`this`上；

>   属性名不能以`$`和`_`开头，内置使用保留，不让我们声明

## reactive 函数声明状态-组合式 API

-   使用`reactive`函数创建一个响应式对象或数组
-   仅对对象类型有效（对象、数组、`Map`、`set`这样的集合类型），对`string`，`number`和`boolean`这样的原始类型无效。
-   它返回的是一个原始对象的`Proxy`代理对象，其行为表现与一般对象相似，不同之处在于`Vue`能够跟踪对响应式对象属性的访问和更改操作

```js
<script lang="ts" setup>
import { reactive } from 'vue'

const state = reactive({
  id: 1,
  name: '张三',
})

const hobbies = reactive(['篮球', '足球', '游泳'])

const addHobby = () => {
  hobbies.push('新爱好')
}
</script>

<template>
  <div>
    <p>{{ state.id }}</p>
    <p>{{ state.name }}</p>
    <p v-for="(item, index) in hobbies" :key="index">{{ item }}</p>
    <button @click="addHobby">新增爱好</button>
  </div>
</template>
```

打印`state`是一个`Proxy`代理对象

```
state 
Proxy(Object)
[[Handler]]
: 
MutableReactiveHandler
[[Target]]
: 
Object
[[IsRevoked]]
: 
false
```

>   原始对象和`Proxy`是不相等的

```js
const obj = { salary: 90 }
const state2 = reactive(obj)
console.log('obj===state', obj === state2) // false
console.log('是否为同一对象: ', reactive(obj) === state2) // true
```

## reactive + Typescript 标注类型

-   `<script>`上加上`lang="ts"`，加了这个就会进行类型的校验

```js
interface user {
  id: number
  name: string
}

const state = reactive<user>({
  id: 1,
  name: '张三',
})

const user2: user = reactive({
  id: 2,
  name: '李四',
})
```

## ref 函数声明状态：支持任意类型

>   内部维护一个对象: `{value: xxx}`

```js
import { ref } from 'vue'

const ok = ref(false)
const count = ref(0)
const age = ref(18)

// 对象类型
const user = ref({
    name: '张三',
    salary: 10000
})
```

即一个`count: {value: 0}`他的类型是`RefImpl`

模板中不需要加上`.value`获取值，因为会将`ref`声明的状态自动解包，从而不需要加。

示例代码:

```js
<script lang="ts" setup>
import { reactive, ref } from 'vue'
// 要加上 type 表示导入的是一个数据类型: Ref 接口类型
import type { Ref } from 'vue'

interface user {
  id: number
  name: string
}

const state = reactive<user>({
  id: 1,
  name: '张三',
})

const user2: user = reactive({
  id: 2,
  name: '李四',
})

const hobbies = reactive(['篮球', '足球', '游泳'])

const user3 = ref({
  name: '张三',
  salary: 10000,
})

const addHobby = () => {
  // 修改响应式变量模板会更新
  hobbies.push('新爱好')
  // ref 的变量需要先调用 value 才能继续使用
  user3.value.salary += 10000
}

// 多种类型
const count: Ref<number | string> = ref('hello world')
count.value = 100

// 在调用 ref 时传入一个泛型，来覆盖默认推导的行为
const salary = ref(10000)
</script>

<template>
  <div>
    <p>{{ state.id }}</p>
    <p>{{ state.name }}</p>
    <p v-for="(item, index) in hobbies" :key="index">{{ item }}</p>
    <button @click="addHobby">新增爱好</button>
    <p>{{ user2.id }} - {{ user2.name }}</p>
    <p>{{ user3.name }} - {{ user3.salary }}</p>
    <p>{{ count }}</p>
  </div>
</template>
```

## $ref响应性语法糖（实验功能）

`ref`需要到处使用`.value`则感觉很繁琐，并且一不小心就很容易漏掉`.value`，使用`$ref`响应式变量，可以像普通变量那样被访问和重新赋值，但这些操作在编译后都会变成`.value`的`ref`

[官方文档](https://cn.vuejs.org/guide/extras/reactivity-transform.html#reactivity-transform)

>   支持的版本
>
>   -   `vue`版本大于等于`3.2.25`，小于等于`3.3`，将在`3.4`及以上版本中移除
>   -   `vitejs/plugin-vue`版本大于等于`2.0.0`

每一个会返回`ref` 的响应式`API`都有一个相对应的、以`$`为前缀的宏函数

-   `ref` => `$ref`
-   `computed` => `$computed`
-   `shallowRef` => `$shallowRef`



## shallowReactive 和 shallowRef 浅层响应式对象

`reactive`和`ref`是深层响应式对象：也就是说声明的对象属性不管是多少层级的，会深度监听其所有属性，从而所有属性都是响应式的

`shallowReactive`是浅层的响应式对象：只有根级别的属性是响应式的，嵌套子属性都不是响应式的

`shallowReactive`注意：如果只修改了子属性的值不会影响响应式，但是一旦修改了根属性的值，对其所有属性的新值都会更新到视图中

`shallowReactive`的应用场景：可以把需要展现在视图层的数据，放置在第一层。而把内部数据放置第二层及以下。

`shallowRef`是浅层响应式对象

-   只处理原始类型的响应式，对象类型是浅层监听不进行响应式处理 
-   浅层监听不是监听状态的对象属性值的变化，是监听`.value`的值的对象的变化，如`shallowRefState.value = {}`，重新赋值一个新的对象才会是响应式的



**应用场景**

>   一般还是使用`reactive`和`ref`，但是如果数据量比较大，则选择上面 2 个;
>
>   一般`reactive`是用来声明对象的，`ref`是用来声明基本类型
>
>   如果只针对第一层属性值修改，且此修改的值要达到响应式更新到视图，则选择`shallowReactive`
>
>   当声明的状态的某属性改变后，视图不变；或者希望当赋值一个对象后才更新视图，则选择`shallowRef`

```js
<script lang="ts" setup>
import { reactive, shallowReactive } from 'vue'

const state = reactive({
  id: 1,
  name: '张三',
  car: {
    price: 70000,
    color: 'red',
  },
})

const updateState = () => {
  // state.id++
  state.car.price++
}

// 浅层响应式对象
const shallowState = shallowReactive({
  id: 10,
  name: '无解',
  car: {
    price: 899999,
    color: '蓝色',
  },
})

const testShallowReactive = () => {
  // 子属性没有发生改变 视图不更新也就是多层级的数据是非响应式的
  // 状态数据实际会变化，视图不会显示，存起来的数据是变更的
  shallowState.car.price++
  shallowState.car.color = '红色'

  // 根属性变更会变更，这块会触发视图更新，是同一个对象，会把整个对象的数据都更新到视图里
  shallowState.id++
}
</script>

<template>
  <div>
    <p>{{ state.id }} - {{ state.name }} - {{ state.car }}</p>
    <button @click="updateState">深层响应式更新</button>
    <p>{{ shallowState.id }} - {{ shallowState.name }} - {{ shallowState.car }}</p>
    <button @click="testShallowReactive">浅层响应式更新</button>
  </div>
</template>

```

## 只读代理 readonly 和 shallowReadonly

### `readonly`深层次只读代理

>   根属性以及所有的子属性都是不允许修改的

### `shallowReadonly` 浅层次只读代理

>   浅层次只读代码：只有根层级的属性变为只读，子层级的属性可修改

```js
<script lang="ts" setup>
import { reactive, readonly, shallowReadonly } from 'vue'

// readonly 接收一个对象(响应式对象，普通对象)或者是一个ref声明的状态
const original = reactive({
  id: 1,
  user: {
    name: 'wujie',
    age: 19,
  },
})

// 构建一个只读代理
// 拷贝出来一个只读对象
const copy = readonly(original)

// 修改原对象
const add = () => {
  // 源属性可修改
  original.id++
  // 浅层次
  original.user.age++
}

// const updateReadonly = () => {
//   copy.count++
//   copy.user.age++
// }

// 将响应式对象转成只读代理对象
const shallowCopy = shallowReadonly(original)
// 对象的根属性是只读的，不允许修改
// shallowCopy.id++
// 子层级属性是可以修改的，并且是可读的
shallowCopy.user.age++
console.log('shallowCopy.user.age', shallowCopy.user.age)
</script>

<template>
  <div>
    <p>origin.id => {{ original }}</p>
    <p>copy => {{ copy }}</p>
    <button @click="add">新增</button>
    <!-- <button @click="updateReadonly">会编译警告，无法修改</button> -->
  </div>
</template>
```

## toRef

针对响应式对象的某个属性，创建一个对应的`ref`，这样创建的`ref`与其源属性保持同步，改变源属性的值会更新`ref`的值，反之亦然。

应用场景：处理子组件的可选`props`的时候，如果未传递数据就是空的，我们可以使用`toRef`创建出一个`ref`来进入下一步操作.

```js
<script lang="ts" setup>
import { reactive, toRef, unref } from 'vue'

const state = reactive({
  name: '张三',
  age: 18,
})
console.log('state.age', state.age)

// 针对 state.age 属性创建一个对应的 ref
const ageRef = toRef(state, 'age')
console.log('ageRef', ageRef)

ageRef.value = 21
console.log('state.age', state.age)

state.age = 22
console.log('ageRef', ageRef.value)

// 合理的应用场景
// 如果第二个参数指定的属性在 state 中不存在，那么会创建一个 可用的 ref 对象
const salary = toRef(state, 'salary')
salary.value = 1000
console.log(salary.value)
</script>
```

## toRefs

>   将一个响应式对象转换为一个普通对象，这个普通对象的每个属性都是指向源对象相应属性的`ref`

```js
<script lang="ts" setup>
import { reactive, toRef, toRefs, unref } from 'vue'

const user = reactive({
  name: '张三',
  age: 18,
})

const toUserRefs = toRefs(user)
// toUserRefs 是一个普通对象
// 每个属性是对应源对象的属性的ref
console.log('toUserRefs', toUserRefs)

toUserRefs.name.value = '李四'
console.log('user.name', user.name) // 李四

// 改变源对象的属性值，对应的ref的值也会同步
toUserRefs.age.value++
console.log('user.age', user.age) // 19

// 解构
// let { name, age } = { ...user }
// console.log('name', name)
// console.log('age', age)

const { name, age } = { ...toUserRefs }
// ref
console.log('name', name)
console.log('age', age)

function testToRefs() {
  // 修改结构出来的值，响应式会失效
  age.value++
}
</script>

<template>
  <div>
    <p>{{ name }} - {{ age }}</p>
    <button @click="testToRefs">toRefs</button>
  </div>
</template>
```

