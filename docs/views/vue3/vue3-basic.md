---
title: vue3基础学习
date: 2023-09-24 09:33:10
category: Vue3
tag:
    - vue3
---

# Vue3 学习

## 使用`vite`

> 使用`vite`创建项目

```bash
pnpm create vite@latest vue3-basic --template vue-ts
```

> 文件了解

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

> 是一个开源的`JavaScript`的`linting`工具，使用`espree`将代码解析成抽象语法树(AST)，然后通过`AST`来分析我们的代码。

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

> Rules

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

> Extends

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
    env: {
        browser: true,
        es2021: true,
        // 把 node 加上 保存之后要有输入的内容才能重新验证
        node: true,
    },
};
```

把对应的`parser`和`plugins`删掉，把`extends`提前

---

此时只能对`js`进行验证，对`vue`文件无法验证，我们还需要在`vscode`里配置，可以新建一个`.vscode`目录

`settings.json`

```json
{
    "eslint.validate": ["javascript", "javascriptreact", "vue", "typescript", "typescriptreact"]
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

-   plugin:vue/vue3-essential 少
-   plugin:vue/vue3-strongly-recommeded 强规则
-   plugin:vue/vue3-recommended 最多

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

### ref 的自动解包

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
                increase,
            };
        },
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
        name: string;
        age: number;
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
                increase,
            };
        },
    });
</script>
```

**ref 和 reactive 的区别**

-   `reactive`参数只能是`object`，ref 都是可以的
-   `ref`需要使用`.value`来访问其中的值，`reactive`不需要
-   `ref`在 Vue 源码内部是一种特殊的`reactive`

简单假设这样的一个模型

```ts
const myRef = reactive({
    value: "i'am ref!",
});

myRef.value;
```

**怎么选择？**

-   没有特殊的规则，个人喜好
-   个人更加喜欢原始类型使用`ref`，`Object`使用`reactive`

```ts
const a = 1;
const a = ref(1);

const user = { name: 'dwqdwq' };
const user = reactive({ name: 'dwqdwq' });
```

## computed - 计算属性

文档地址: [https://cn.vuejs.org/guide/essentials/computed.html](https://cn.vuejs.org/guide/essentials/computed.html)

为`computed`标注类型

```ts
const double = computed<number>(() => {
    return 1;
});
```

**特点**

-   计算属性值会基于其他响应式依赖被缓存
-   计算属性默认是只读的

案例

```vue
... script 内容和上面一样

<template>
    <button type="button" :disabled="user.age < 10">
        {{ user.age >= 10 ? '可以参与' : '未满 10 岁不可以参加' }}
    </button>
</template>
```

这样确实能实现效果，但是我们每次都要使用三元表达式这种长串内容，就会显得很臃肿，然后就可以使用计算属性来替代

```vue
<script lang="ts">
    import { defineComponent, ref, reactive, computed } from 'vue';

    interface Person {
        name: string;
        age: number;
    }

    export default defineComponent({
        name: 'App',
        setup() {
            const count = ref<string | number>(0);
            const user: Person = reactive({
                name: 'virus',
                age: 8,
            });
            const buttonStatus = computed(() => {
                return {
                    text: user.age >= 10 ? '可以参与' : '未满 10 岁不可以参与',
                    disabled: user.age < 10,
                };
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
                increase,
                buttonStatus,
            };
        },
    });
</script>

<template>
    <div>
        <h1>{{ count }}</h1>
        <h2>{{ user.age }}</h2>
        <button type="button" @click="increase">新增</button>
        <button type="button" :disabled="buttonStatus.disabled">
            {{ buttonStatus.text }}
        </button>
    </div>
</template>
```

## watch 监听器

文档地址: [https://cn.vuejs.org/guide/essentials/watchers.html](https://cn.vuejs.org/guide/essentials/watchers.html)

-   直接监听一个对象
-   监听一个`getter function`
-   直接监听一个`reactive`对象

监听案例

```vue
<script lang="ts">
    import { defineComponent, ref, reactive, computed, watch } from 'vue';

    interface Person {
        name: string;
        age: number;
    }

    export default defineComponent({
        name: 'App',
        setup() {
            const count = ref<string | number>(0);
            const user: Person = reactive({
                name: 'virus',
                age: 8,
            });
            const buttonStatus = computed(() => {
                return {
                    text: user.age >= 10 ? '可以参与' : '未满 10 岁不可以参与',
                    disabled: user.age < 10,
                };
            });

            watch(count, (newValue, oldValue) => {
                console.log(newValue, oldValue);
                document.title = `目前点击数是: ${newValue}`;
            });

            // getter function 监听响应式对象的属性
            watch(
                () => user.age,
                (newValue, oldValue) => {
                    console.log(newValue, oldValue);
                    document.title = `目前点击的年龄数: ${newValue}`;
                }
            );

            watch(user, (newValue, oldValue) => {
                console.log('new user', newValue);
                console.log('old user', oldValue);
            });

            // 监听数组内容
            watch([count, () => user.age], (newValue, oldValue) => {
                console.log('new arr', newValue);
                console.log('old arr', oldValue);
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
                increase,
                buttonStatus,
            };
        },
    });
</script>
```

**立即执行的监听器**

```ts
watch(
    source,
    (newValue, oldValue) => {
        // 立即执行，且当 source 改变时再次执行
    },
    { immediate: true }
);
```

**回调的触发时机**

> 默认是在`DOM`更新之前触发的，如果想改变触发时机：

```ts
watch(count, (newValue, oldValue) => {
    console.log(newValue, oldValue);
    document.title = `目前点击数是: ${newValue}`;
    // 返回的是之前的值
    console.log('the dom age', document.getElementById('age')?.innerHTML);
});
```

```ts
watch(
    count,
    (newValue, oldValue) => {
        console.log(newValue, oldValue);
        document.title = `目前点击数是: ${newValue}`;
        console.log('the dom age', document.getElementById('age')?.innerHTML);
    },
    { flush: 'post' }
);
```

## 生命周期和模板引用

文档地址: [https://cn.vuejs.org/guide/essentials/lifecycle.html](https://cn.vuejs.org/guide/essentials/lifecycle.html)

生命周期所有 API 钩子函数地址: [https://cn.vuejs.org/api/options-lifecycle.html](https://cn.vuejs.org/api/options-lifecycle.html)

模板引用: [https://cn.vuejs.org/guide/essentials/template-refs.html](https://cn.vuejs.org/guide/essentials/template-refs.html)

```vue
<script lang="ts">
    import { defineComponent, ref, reactive, computed, watch, onMounted, onUpdated } from 'vue';

    interface Person {
        name: string;
        age: number;
    }

    export default defineComponent({
        name: 'App',
        setup() {
            const count = ref<string | number>(0);
            const user: Person = reactive({
                name: 'virus',
                age: 8,
            });
            const headline = ref<null | HTMLElement>(null);
            console.log('in setup', headline.value?.innerHTML);
            const buttonStatus = computed(() => {
                return {
                    text: user.age >= 10 ? '可以参与' : '未满 10 岁不可以参与',
                    disabled: user.age < 10,
                };
            });

            watch(
                count,
                (newValue, oldValue) => {
                    console.log(newValue, oldValue);
                    document.title = `目前点击数是: ${newValue}`;
                    // 返回的是之前的值
                    console.log('the dom age', document.getElementById('age')?.innerHTML);
                },
                { flush: 'post' }
            );

            const increase = () => {
                if (typeof count.value === 'number') {
                    count.value++;
                }
                user.age++;
            };

            onMounted(() => {
                console.log('mounted', headline.value);
            });

            onUpdated(() => {
                console.log('updated');
            });

            return {
                count,
                user,
                headline,
                increase,
                buttonStatus,
            };
        },
    });
</script>
```

## 组件基础

文档地址: [https://cn.vuejs.org/guide/essentials/component-basics.html](https://cn.vuejs.org/guide/essentials/component-basics.html)

`props`: [https://cn.vuejs.org/guide/components/props.html](https://cn.vuejs.org/guide/components/props.html)

### 组件属性

```vue
<template>
    <div class="profile-component">
        <h1>{{ name }}</h1>
        <h1>{{ age }}</h1>
        <h1>{{ doubleAge }}</h1>
    </div>
</template>
<script lang="ts">
    import { computed, defineComponent } from 'vue';

    export default defineComponent({
        name: 'MyProfile',
        props: {
            name: {
                type: String,
                required: true,
            },
            age: {
                type: Number,
                required: true,
            },
        },
        setup(props) {
            const doubleAge = computed(() => props.age * 2);
            return {
                doubleAge,
            };
        },
    });
</script>

<style scoped></style>
```

复杂的类型，使用`PropType`

```vue
<template>
    <div class="profile-component">
        <h1>姓名: {{ user.name }}</h1>
        <h1>年龄: {{ user.age }}</h1>
        <h1>年龄双倍: {{ doubleAge }}</h1>
    </div>
</template>
<script lang="ts">
    import { computed, defineComponent, PropType } from 'vue';

    interface Person {
        name: string;
        age: number;
    }

    export default defineComponent({
        name: 'MyProfile',
        props: {
            user: {
                // 标注一个复杂的属性类型
                type: Object as PropType<Person>,
                required: true,
            },
        },
        setup(props) {
            const doubleAge = computed(() => props.user.age * 2);
            return {
                doubleAge,
            };
        },
    });
</script>

<style scoped></style>
```

### 事件

在组件中自定义事件，以及父组件触发子组件的事件改变标题内容

```vue
<template>
    <div class="profile-component">
        <h1>姓名: {{ user.name }}</h1>
        <h1 v-if="!isHidden">年龄: {{ user.age }}</h1>
        <h1 v-if="!isHidden">年龄双倍: {{ doubleAge }}</h1>
        <button type="button" @click="toggleHide">{{ isHidden ? '显示' : '隐藏' }}</button>
    </div>
</template>
<script lang="ts">
    import { computed, defineComponent, PropType, ref } from 'vue';

    interface Person {
        name: string;
        age: number;
    }

    export default defineComponent({
        name: 'MyProfile',
        props: {
            user: {
                type: Object as PropType<Person>,
                required: true,
            },
        },
        // 事件
        emits: ['change'],
        setup(props, ctx) {
            const doubleAge = computed(() => props.user.age * 2);

            const isHidden = ref(false);
            // 切换是否隐藏的值
            const toggleHide = () => {
                isHidden.value = !isHidden.value;
                // 发送事件
                // 填入事件名称
                ctx.emit('change', isHidden.value);
            };
            return {
                doubleAge,
                isHidden,
                toggleHide,
            };
        },
    });
</script>

<style scoped></style>
```

`App.vue`

```vue
<script lang="ts">
    import { defineComponent, ref, reactive, computed, watch, onMounted, onUpdated } from 'vue';
    import MyProfile from './components/MyProfile.vue';

    interface Person {
        name: string;
        age: number;
    }

    export default defineComponent({
        name: 'App',
        // 注册组件
        components: {
            MyProfile,
        },
        setup() {
            const user: Person = reactive({
                name: 'virus',
                age: 8,
            });

            const onChange = (isHidden: boolean) => {
                document.title = isHidden ? '年龄被隐藏了~' : '年龄显示出来了';
            };

            return {
                count,
                user,
                headline,
                increase,
                buttonStatus,
                onChange,
            };
        },
    });
</script>

<template>
    <div>
        <!-- 以前的代码 -->

        <!-- 静态属性 -->
        <!-- : 动态属性 满足 age 是一个 number 类型 -->
        <!-- 调用子组件的事件 -->
        <MyProfile :user="user" @change="onChange" />
    </div>
</template>
```

## 组合式函数

> 场景：
>
> 在页面追责鼠标的位置，捕捉到当前的鼠标的位置坐标

我们先直接在`App.vue`里操作

```vue
<script lang="ts">
    import { defineComponent, ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';

    export default defineComponent({
        name: 'App',
        setup() {
            const updateMouse = (e: MouseEvent) => {
                x.value = e.pageX;
                y.value = e.pageY;
            };

            onMounted(() => {
                // 监听事件方法
                document.addEventListener('click', updateMouse);
            });

            onUnmounted(() => {
                // 生命周期结束移除事件
                document.removeEventListener('click', updateMouse);
            });

            const x = ref(0);
            const y = ref(0);

            return {
                x,
                y,
            };
        },
    });
</script>

<template>
    <div>
        <h1>x: {{ x }}</h1>
        <h1>y: {{ y }}</h1>
    </div>
</template>
```

然后我们在`composables`或者叫`hooks`目录下集成一个组合式函数

```ts
import { onMounted, onUnmounted, ref } from 'vue';

const useMousePosition = () => {
    const x = ref(0);
    const y = ref(0);

    const updateMouse = (e: MouseEvent) => {
        x.value = e.pageX;
        y.value = e.pageY;
    };

    onMounted(() => {
        // 监听事件方法
        document.addEventListener('click', updateMouse);
    });

    onUnmounted(() => {
        // 生命周期结束移除事件
        document.removeEventListener('click', updateMouse);
    });

    return {
        x,
        y,
    };
};

export default useMousePosition;
```

重构之后把`App.vue`中的逻辑去掉

```vue
<script lang="ts">
    import useMousePosition from './hooks/useMousePosition';
    import { defineComponent, ref, reactive, computed, watch } from 'vue';

    export default defineComponent({
      name: 'App',
      setup() {
          const { x, y } = useMousePosition();
          return {x,y}
      }
    }
</script>

<template>
    <h1>x: {{ x }}</h1>
    <h1>y: {{ y }}</h1>
</template>
```

**和`Mixin`比较的优势**

-   清晰的数据来源
-   避免命名冲突
-   脱离组件像正常函数一样存在

---

`VueUse`库: [https://vueuse.org](https://vueuse.org)

#### 案例实现

安装`axios`

```bash
pnpm add axios
```

`useURLLoader.ts`

```ts
import { reactive } from 'vue';
import axios from 'axios';

interface IResult {
    result: any;
    loading: boolean;
    error: any;
}

const useURLLoader = (url: string) => {
    const data: IResult = reactive({
        result: null,
        loading: true,
        error: null,
    });

    axios
        .get(url)
        .then(rawData => {
            data.result = rawData.data;
        })
        .catch(e => {
            data.error = e;
        })
        .finally(() => {
            data.loading = false;
        });

    return data;
};

export default useURLLoader;
```

**Reactive 可能出现的问题**： 丢失响应性

```ts
const state = reactive({ count: 0 });

// n 是一个局部变量，同 state.count
// 失去响应性连接
let n = state.count;
// 不影响原始的 state
n++;
```

如果使用`useURLLoader`的函数的返回值进行结构赋值就会出现以上的问题，所以这里就会使用到`toRefs`,将多个`reactive`转换为多个`ref`

[https://cn.vuejs.org/api/reactivity-utilities.html#torefs](https://cn.vuejs.org/api/reactivity-utilities.html#torefs)

```ts
import { reactive, toRefs } from 'vue';
import axios from 'axios';

interface IResult {
    result: any;
    loading: boolean;
    error: any;
}

const useURLLoader = (url: string) => {
    const data: IResult = reactive({
        result: null,
        loading: true,
        error: null,
    });

    axios
        .get(url)
        .then(rawData => {
            data.result = rawData.data;
        })
        .catch(e => {
            data.error = e;
        })
        .finally(() => {
            data.loading = false;
        });

    return toRefs(data);
};

export default useURLLoader;
```

之后使用解构赋值获取函数的响应内容的时候，里面的都变成了`ref`的响应式变量，使用的时候就必须使用`.value`

---

以上都是基于`ts`自己类型推论，我们需要使用泛型

```ts
import { reactive, toRefs } from 'vue';
import axios from 'axios';

interface IResult<T> {
    result: null | T;
    loading: boolean;
    error: any;
}

// T 默认值 any
const useURLLoader = <T = any>(url: string) => {
    const data: IResult<T> = reactive({
        result: null,
        loading: true,
        error: null,
    });

    axios
        .get(url)
        .then(rawData => {
            data.result = rawData.data;
        })
        .catch(e => {
            data.error = e;
        })
        .finally(() => {
            data.loading = false;
        });

    return toRefs(data);
};

export default useURLLoader;
```

```ts
interface TodoResult {
    title: string;
}

const { loading, result } = useURLLoader<TodoResult>('https://jsonplaceholder.typicode.com/todos/1');
```

## setup 语法

版本：必须在 3.2 以上，是`composition API`的语法糖

**优点**

-   更少的样板内容，更简洁的代码
-   能够使用纯`typescript`声明`props`和抛出事件
-   更好的运行时性能
-   更好的 IDE 类型推断性能

> 使用`setup`之后把原先`setup`函数以上的内容都删掉就行，顶层的一些属性就自动可以使用

使用`setup`和`defineProps`和`defineEmits`改造后的`MyProfile`组件

```vue
<template>
    <div class="profile-component">
        <h1>姓名: {{ user.name }}</h1>
        <h1 v-if="!isHidden">年龄: {{ user.age }}</h1>
        <h1 v-if="!isHidden">年龄双倍: {{ doubleAge }}</h1>
        <button type="button" @click="toggleHide">{{ isHidden ? '显示' : '隐藏' }}</button>
    </div>
</template>
<script lang="ts" setup>
    import { computed, PropType, ref } from 'vue';

    interface Person {
        name: string;
        age: number;
    }

    const props = defineProps({
        user: {
            type: Object as PropType<Person>,
            required: true,
        },
    });

    const emits = defineEmits(['change']);

    const doubleAge = computed(() => props.user?.age * 2);

    const isHidden = ref(false);
    // 切换是否隐藏的值
    const toggleHide = () => {
        isHidden.value = !isHidden.value;
        // 发送事件
        // 填入事件名称
        emits('change', isHidden.value);
    };
</script>

<style scoped></style>
```

使用类型声明来替换

```vue
<template>
    <div class="profile-component">
        <h1>姓名: {{ user.name }}</h1>
        <h1 v-if="!isHidden">年龄: {{ user.age }}</h1>
        <h1 v-if="!isHidden">年龄双倍: {{ doubleAge }}</h1>
        <button type="button" @click="toggleHide">{{ isHidden ? '显示' : '隐藏' }}</button>
    </div>
</template>
<script lang="ts" setup>
    import { computed, ref } from 'vue';

    interface Person {
        name: string;
        age: number;
    }

    const props = withDefaults(defineProps<{ user?: Person }>(), {
        user: () => ({
            name: 'wujie',
            age: 19,
        }),
    });

    interface IEvents {
        (e: 'change', hidden: boolean): void;
    }
    const emits = defineEmits<IEvents>();
    const doubleAge = computed(() => props.user.age * 2);
    const isHidden = ref(false);
    // 切换是否隐藏的值
    const toggleHide = () => {
        isHidden.value = !isHidden.value;
        // 发送事件
        // 填入事件名称
        emits('change', isHidden.value);
    };
</script>

<style scoped></style>
```

## 依赖注入

[https://cn.vuejs.org/api/composition-api-dependency-injection.html](https://cn.vuejs.org/api/composition-api-dependency-injection.html)

父组件里使用`provide`注入，在子组件里使用`inject`获取内容，案例使用`string`，但是实际使用还是使用`Symbol`保证`key`的唯一性。

```ts
export const langKey = Symbol();
```

在`HelloWorld.vue`子组件中使用

```vue
<script setup lang="ts">
    import { ref, inject } from 'vue';
    import { langKey } from '../keys';

    defineProps<{ msg: string }>();

    const count = ref(0);

    const lang = inject(langKey);
    console.log('hello world', lang);
</script>
```

在`App.vue`父组件中注入

```ts
const lang = ref('en');

const changelanguage = (type: string) => {
    lang.value = type;
};

provide(langKey, lang);
```

加入泛型提示

```ts
import { InjectionKey, Ref } from 'vue';
export const langKey = Symbol() as InjectionKey<Ref<string>>;
```

## Button 按钮组件设计以及需求分析

### 任务

-   需求分析
-   初始化项目
-   确定项目文件结构
-   规范基础写法
-   样式解决方案以及色彩系统

#### 需求分析

`Button`组件大部分关注样式，没有交互

根据分析可以得到具体的属性列表：

-   `type`：不同的样式(Default, Primary, Danger, Info, Success, Warning)
-   `plain`: 样式的不同展现模式 `boolean`
-   `round`: 圆角 `boolean`
-   `circle`: 圆形按钮，适合图标 `boolean`
-   `size`: 不同的大小(small/normal/large)
-   `disabled`: 禁止的状态 `boolean`
-   图标
-   `loading`: `boolean`

> Button 组件的本质就是`class`名称的组合

```html
class="xx-button--primary xx-button--large is-plain is-round is-disabled"
```

#### 初始化项目

> 和前面差不多。

```bash
npm create vue@3
```

```bash
✔ Project name: … v-element
✔ Add TypeScript? … No / Yes
✔ Add JSX Support? … No / Yes
✔ Add Vue Router for Single Page Application development? … No / Yes
✔ Add Pinia for state management? … No / Yes
✔ Add Vitest for Unit Testing? … No / Yes
✔ Add an End-to-End Testing Solution? › No
✔ Add ESLint for code quality? … No / Yes
✔ Add Prettier for code formatting? … No / Yes
```

#### 文件项目结构

-   简单即可
-   没有必要的过度设计
-   `components`
    -   `Button`
        -   Button.vue - 组件
        -   style.css - 样式
        -   types.ts - 辅助的`ts`类型
        -   Button.test.tsx - 测试文件
-   `hooks`
    -   `useMousePosition.ts` - 组合式函数等
    -   ...

### 编码

定义类型和字面量

`types.ts`

```ts
export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ButtonSize = 'large' | 'small';

export interface ButtonProps {
    type?: ButtonType;
    size?: ButtonSize;
    plain?: boolean;
    round?: boolean;
    circle?: boolean;
    disabled?: boolean;
}
```

关闭`eslint`组件单词名称规则

```js
rules: {
        'vue/multi-word-component-names': 'off',
    },
```

动态样式绑定: [https://cn.vuejs.org/guide/essentials/class-and-style.html](https://cn.vuejs.org/guide/essentials/class-and-style.html)

[https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props)

```ts
import type { PropType } from 'vue';

export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ButtonSize = 'large' | 'small';

export interface ButtonProps {
    type?: ButtonType;
    size?: ButtonSize;
    plain?: boolean;
    round?: boolean;
    circle?: boolean;
    disabled?: boolean;
}

export const buttonProps = {
    type: {
        type: String as PropType<ButtonType>,
    },
    size: {
        type: String as PropType<ButtonSize>,
    },
    plain: {
        type: Boolean,
    },
    round: {
        type: Boolean,
    },
    circle: {
        type: Boolean,
    },
    disabled: {
        type: Boolean,
    },
};
```

> 组件需要单独写一个`script`

```vue
<template>
    <button
        class="vs-button"
        :class="{
            [`vs-button--${type}`]: type,
            [`vs-button--${size}`]: size,
            'is-plain': plain,
            'is-round': round,
            'is-circle': circle,
            'is-disabled': disabled,
        }"
        :disabled="disabled"
    >
        <span>
            <slot />
        </span>
    </button>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    export default defineComponent({
        name: 'VsButton',
    });
</script>

<script setup lang="ts">
    import type { ButtonProps } from './types';
    defineProps<ButtonProps>();
</script>

<style scoped></style>
```

---
