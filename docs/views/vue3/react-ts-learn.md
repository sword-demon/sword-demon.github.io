---
title: React和TS学习
date: 2023-07-15 22:43:10
category: Vue3
tag:
    - React
    - Typescript
---

# React + Ts 学习

## 准备工作

-   安装`nodejs`，16 往上都是可以的

-   使用国内的`npm`镜像,[镜像地址](https://npmmirror.com/)

    使用方式：

    ```bash
    $ npm install -g cnpm --registry=https://registry.npmmirror.com
    ```

-   编辑器使用`vscode`

-   安装`git`进行代码版本管理

## 创建项目

### 资料

[create-react-app 中文官网](https://create-react-app.bootcss.com/)

[vitejs 官网](https://vitejs.dev/)

### 使用 create-react-app 创建项目

```bash
npx create-react-app my-app
```

加上`--template typescript`使用`typescript`语言模板。

启动项目

```bash
npm start
```

停止项目

```bash
ctrl c
```

### 使用 vite 创建项目

```bash
npm create vite@latest my-vue-app --template vue
```

默认使用模板为`vue`,可以改成`react-ts`

```bash
npm create vite@latest react-demo-vite --template react-ts
```

-   选择`React`框架
-   选择`Typescript`
-   进入项目目录，`npm install`
-   启动项目: `npm run dev`

### 最终选择

选择`create-react-app`

-   是`React`官网推荐
-   时间更久，可查找资源更多
-   稳定性较强，求稳不求新

## 使用 prettier 来规范代码的风格

### 安装插件

进入项目控制台

```bash
npm install prettier eslint-config-prettier eslint-plugin-prettier eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react --save-dev
```

### 创建配置文件

创建一个`.eslintrc.js`文件进行配置

```js
module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    overrides: [],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        esmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {},
};
```

在`vscode`里安装`prettier`格式化插件

配置`.vscode/settings.json`在代码保存的时候自动格式化

```json
{
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

最后配置`.prettierrc.js`

```js
module.exports = {
    // 箭头函数只有一个参数的时候可以忽略括号
    arrowParens: 'avoid',
    // 括号内部不要出现空格
    bracketSpacing: true,
    // 行结束符使用 unix 格式
    endOfLine: 'lf',
    jsxBracketSameLine: false,
    // 行宽
    printWidth: 100,
    // 换行方式
    proseWrap: 'preserve',
    // 分号
    semi: false,
    // 使用单引号
    singleQuote: true,
    // 缩进
    tabWidth: 2,
    // 使用 tab 缩进
    useTabs: false,
    // 后置逗号，多行对象，数组在最后一行加逗号
    trailingComma: 'es5',
    parser: 'typescript',
};
```

**如果遇到啥无效的时候，重启 vscode 尝试**

### 创建命令并使用

```json
"scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject",
        "lint": "eslint 'src/**/*.+(ts|ts|jsx|tsx)' ",
        "format": " prettier --write 'src/**/*.+(ts|ts|jsx|tsx)' "
    }
```

```bash
# 这样就可以直接格式化对应的代码
npm run format
```

## 提交到 git 仓库

### 选择仓库

-   工作中：使用公司内部`git`仓库
-   正式的开源项目，需要积累`star`，使用`github`
-   个人学习项目，建议选择国内平台，`coding.net`
-   配置好仓库之后将本地代码添加并推送到远程仓库

### 使用 husky 来规范流程

-   一个`git hook`工具
-   在`git commit`之前执行自定义的命令
-   在提交代码之前执行代码风格的检查，避免提交非规范代码
-   [github 地址](https://github.com/typicode/husky)

---

#### 安装 husky

```bash
npm install husky -D
```

使用

```bash
npm pkg set scripts.prepare="husky install"
npm run prepare
```

添加一个 hook

我们使用`npm run lint`来检测代码风格，使用`npm run format`来将上一步检测的代码进行重新格式化，最后如果上一步成功了，然后将代码添加到本地仓库。

```bash
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/pre-commit "npm run format"
npx husky add .husky/pre-commit "git add ."
```

可以看到`.husky/pre-commit`文件内容

```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run format
git add .

```

## commit-lint

**前提是安装了 husky**

[github 地址](https://github.com/conventional-changelog/commitlint)

安装(我是 mac，对应的 github 官网地址又对应的文档区分)

```bash
npm install --save-dev @commitlint/{config-conventional,cli}
```

配置

```bash
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

添加 hook

```bash
npx husky add .husky/commit-msg  'npx --no -- commitlint --edit ${1}'
```

`.husky/commit-msg`

```shell
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}

```

此时会在提交的`commit -m` 里的描述进行检测是否规范。

这样提交的信息例如：

```bash
git commit -m "chore: commit-lint"
```

这样才能通过规范。

主要有这么些可选`type`

```
'build',
'chore',
'ci',
'docs',
'feat',
'fix',
'perf',
'refactor',
'revert',
'style',
'test',
```

## vite 和 webpack 的区别

-   webpack 是一个非常流行的前端打包工具
-   Create-React-App 内部使用的是 webpack 进行打包
-   Vite 即是构建工具，又是打包工具
-   webpack 会把目录下的 js 都合并到一个文件里进行打包

### Vite 的特点

-   Vite 比 Create-React-App 打包项目更快（启动、代码更新）
-   Vite 使用了 ES Module 的语法（仅开发环境）
-   打包方式，可以在`script`引入的地方加上一个`type="module"`，`<script src="./js/main.js" type="module"></script>`

## JSX 和组件

### JSX 语法

-   JSX- JS 的扩展，卸载 JS 代码里，组件的 UI 结构
-   语法和 HTML 很相似
-   已成为 ES 规范（非 React 独有），可用于其他框架，如 Vu3

文件格式：

-   js
-   jsx
-   ts
-   tsx

#### 标签

基本和 HTML 的标签差不多，区别如下：

-   大小写，小写就是 HTML 标签，大写是自定义组件
-   标签必须要闭合，如`<input>` 没有`/`在`jsx`中是非法的
-   每一片段只能有一个根节点，避免多个组合到一起回产生垃圾标签，还有一个`<></>`这种方式来替换

#### 属性

也和 HTML 的属性差不多，也有一些区别：

-   `class`要换成`className`，因为在`ts或js`语法中`class`都是一个类关键字，这个时候就不能使用`class`

-   `style`要使用 JS 对象，不能是`string`，而且`key`要使用驼峰写法，例如：`<a style={{backgroundColor: "red"}}></a>`

-   `for`要改为`htmlFor`，因为还是关键字，不是很常用，例如：

    ```jsx
    <div>
        <label htmlFor='username'>姓名</label>
        <input id='username' />
    </div>
    ```

#### 事件

-   使用`onXxx`的形式
-   **必须传入一个函数(是`fn`而非`fn()`)**
-   注意`Typescript`类型（初学不深究）

```tsx
import React from 'react';
import type { MouseEvent } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const fn = (event: MouseEvent<HTMLButtonElement>) => {
        // 阻止默认行为
        event.preventDefault();
        // 阻止冒泡
        event.stopPropagation();
        console.log('clicked');
    };
    return (
        <div className='App'>
            <header className='App-header'>
                <img src={logo} className='App-logo' alt='logo' />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer' style={{ backgroundColor: 'red' }}>
                    Learn React edit
                </a>
                <div>
                    <button onClick={fn}>click</button>
                </div>
            </header>
        </div>
    );
}

export default App;
```

`Typescript`类型

[练习官网](https://www.tslang.cn/play/index.html)

```typescript
function print<T>(info: T) {
    console.log(info);
}

// 给这个 T 传了一个 string info 就是 string 类型
print<String>('hello');
```

对于学习 Java 的后端来说，这个在 Java 里是泛型的意思。看使用这个函数的人传递什么类型的。

```ts
class Foo {
    info: string;
    setInfo(newInfo: string) {
        this.info = newInfo;
    }
}

const f1: Foo = new Foo();
f1.setInfo('hello world');
```

在`react`中可以使用`import type {} from 'react'`来获取类型，内置的不用获取。

---

多参数传递调用

```tsx
import React from 'react';
import type { MouseEvent } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const fn = (event: MouseEvent<HTMLButtonElement>, name: string) => {
        // 阻止默认行为
        event.preventDefault();
        // 阻止冒泡
        event.stopPropagation();
        console.log(name);
    };
    return (
        <div className='App'>
            <header className='App-header'>
                <img src={logo} className='App-logo' alt='logo' />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer' style={{ backgroundColor: 'red' }}>
                    Learn React edit
                </a>
                <div>
                    <button
                        onClick={event => {
                            fn(event, '无解'); // 里面还是函数
                        }}
                    >
                        click
                    </button>
                </div>
            </header>
        </div>
    );
}

export default App;
```

#### 插入 JS 变量

前面的代码`demo`里都有一个外置的大括号

```tsx
<a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer' style={{ backgroundColor: 'red' }}></a>
```

`{ backgroundColor: 'red' }`这一段本身是 JS 对象，而外面的大括号就是用于可插入 JS 函数以及其他内容。

-   使用`{xxx}`可以插入 JS 变量、函数、表达式
-   可插入普通文本、属性
-   可用于注释：` {/* <p>{logo}</p> */}`，注释必须闭合的

#### 条件判断

通常都是使用`if else elseif`来判断；在`jsx/tsx`里使用方式：

-   使用 `&&`
-   使用三元表达式
-   使用函数

```tsx
const flag = true;

function Hello() {
    if (flag) {
        return <p>Hello</p>;
    } else {
        return <p>你好</p>;
    }
}

return (
    <div>
        <div>
            {flag && <p>Hello</p>}
            {flag ? <p>Hello</p> : <p>你好</p>}
            <Hello></Hello> {/* 标签首字母大写，自定义组件 */}
        </div>
    </div>
);
```

#### 循环

-   使用数组
-   每个`item`元素需要`key`属性
-   `key`在同级别需要唯一性

```tsx
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
    const list = [
        { username: '无解', name: 'wujie' },
        { username: '张三', name: 'zhangsan' },
        { username: '李四', name: 'lisi' },
    ];
    return (
        <div className='App'>
            <header className='App-header'>
                <ul>
                    {list.map((user, index) => {
                        const { username, name } = user;
                        return (
                            <li key={username} data-index={index}>
                                {name}
                            </li>
                        );
                    })}
                </ul>
            </header>
        </div>
    );
}

export default App;
```

**注意不能使用`index`作为`key`，虽然简短的代码看不出问题，后续修改的时候可能不会唯一**

### 代码演练：开发列表页

```tsx
import React from 'react';
import './App.css';

function App() {
    // 列表页

    // 问卷列表数组
    const questionList = [
        { id: 1, title: '问卷 1', isPublished: true },
        { id: 2, title: '问卷 2', isPublished: false },
        { id: 3, title: '问卷 3', isPublished: true },
        { id: 4, title: '问卷 4', isPublished: false },
    ];

    function edit(id: number) {
        console.log('edit', id);
    }
    return (
        <div>
            <h1>问卷列表页</h1>
            <div>
                {questionList.map(question => {
                    const { id, title, isPublished } = question;
                    return (
                        <div key={id}>
                            <strong>{title}</strong> &nbsp;
                            {/* 条件判断 */}
                            {isPublished ? <span style={{ color: 'green' }}>已发布</span> : <span>未发布</span>}
                            &nbsp;
                            <button
                                onClick={() => {
                                    edit(id);
                                }}
                            >
                                编辑问卷
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default App;
```

## 组件

> React 一切皆是组件

-   组件就是一个 UI 片段
-   拥有独立的逻辑和显示
-   组件可大可小，可嵌套

> 组件的价值和意义

-   组件嵌套来组织 UI 结构，和 HTML 一样，无学习成本
-   组件拆分，利于代码维护，和多人协作开发
-   可封装公共组件（或第三方组件）复用代码，提高开发效率

> 组件形式

-   `class`组件
-   函数组件
-   React16 之后比较推崇函数组件和 `Hooks`

> 将前面的列表代码封装成一个组件独立出去

`List1.tsx`

```tsx
import React, { FC } from 'react';
import './List1.css';

const List1: FC = () => {
    // 问卷列表数组
    const questionList = [
        { id: 1, title: '问卷 1', isPublished: true },
        { id: 2, title: '问卷 2', isPublished: false },
        { id: 3, title: '问卷 3', isPublished: true },
        { id: 4, title: '问卷 4', isPublished: false },
    ];

    function edit(id: number) {
        console.log('edit', id);
    }
    return (
        <div>
            <h1>问卷列表页</h1>
            <div>
                {questionList.map(question => {
                    const { id, title, isPublished } = question;
                    return (
                        <div key={id} className='list-item'>
                            <strong>{title}</strong> &nbsp;
                            {/* 条件判断 */}
                            {isPublished ? <span style={{ color: 'green' }}>已发布</span> : <span>未发布</span>}
                            &nbsp;
                            <button
                                onClick={() => {
                                    edit(id);
                                }}
                            >
                                编辑问卷
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default List1;
```

`App.tsx`

```tsx
import React from 'react';
import List1 from './List1';

function App() {
    return (
        <>
            <List1 />
        </>
    );
}

export default App;
```

## React 开发者工具，chrome 插件

百度搜索：`chrome react dev tools`

[谷歌下载地址](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi/related)

国内访问可以通过`bing`去搜索，如果有资源可以上网，那就使用谷歌搜索出来的

## JSX 和 Vue 模板的区别

-   判断，Vue 模板中使用`v-if`指令，JSX 使用三元表达式，函数和`&&`
-   循环，Vue 模板中使用的是`v-for`指令，JSX 使用`map`函数
-   React - 能用 JS 的就用 JS 的，需要 JS 基础比较扎实的使用
-   Vue - 简单使用`if`、`for`就可以方便初学者使用和记忆
-   现在 Vue3 也能很好的支持 JSX 语法，同时还是继承前面的指令

## React Hooks

-   React 内置的 Hooks
    -   useState
    -   useEffect
    -   其他内置
-   自定义 Hooks （复用代码）
-   使用第三方 Hooks（提高效率）

**注意事项**

-   Hooks 是 React 最重要的内容
-   必须练习，练习，练习！
-   Hooks 有很对规则，遇到错误时，先查看是否违反规则

### useState

> 需求：让页面“动”起来
>
> -   点击一个`button`，累加数量
> -   用普通变量，无法实现
> -   使用`useState`实现

-   用普通的 JS 变量无法触发组件的更新

```tsx
import React, { useState } from 'react';

function App() {
    // let count = 0
    const [count, setCount] = useState(0);

    function add() {
        setCount(count + 1);
    }
    return (
        <>
            <div>
                <button onClick={add}>add {count}</button>
            </div>
        </>
    );
}

export default App;
```

`useState`设置返回的结果是一个数组，第一个元素是这个变量，第二个是改变这个变量的函数，必须传入的是一个新值。

> `state`一个组件的“独家记忆”

-   `props`父组件传递过来的信息
-   `state`组件内部的状态信息，不对外
-   `state`变化，触发组件更新，重新渲染`rerender`页面

上面代码中,`count`相当于`state`，`state`的变化就相当于`setCount`方法。

> `state`的几个特点

-   异步更新: 无法拿到最新的`state`的值

    ```tsx
    import React, { FC, useState } from 'react';

    const Demo: FC = () => {
        const [count, setCount] = useState(0);

        function add() {
            // setCount(count + 1)
            setCount(count => count + 1);
            console.log('cur count', count);
        }

        return (
            <div>
                <button onClick={add}>add {count}</button>
            </div>
        );
    };

    export default Demo;
    ```

-   注意，如果设置的一个变量没有在`tsx/jsx`里引用，按理说就不需要使用`setstate`来管理它，使用`useRef`

-   可能会被合并

    ```tsx
    import React, { FC, useState } from 'react';

    const Demo: FC = () => {
        const [count, setCount] = useState(0);

        function add() {
            setCount(count + 1);
            setCount(count + 1);
            setCount(count + 1);
            setCount(count + 1);
            setCount(count + 1);
            console.log('cur count', count);
        }

        return (
            <div>
                <button onClick={add}>add {count}</button>
            </div>
        );
    };

    export default Demo;
    ```

    上面每次都是`0+1`，所以不会打印 5，也可以使用函数的方式来更新，就会是 5

    ```tsx
    import React, { FC, useState } from 'react';

    const Demo: FC = () => {
        const [count, setCount] = useState(0);

        function add() {
            setCount(count => count + 1);
            setCount(count => count + 1);
            setCount(count => count + 1);
            setCount(count => count + 1);
            setCount(count => count + 1);
            console.log('cur count', count);
        }

        return (
            <div>
                <button onClick={add}>add {count}</button>
            </div>
        );
    };

    export default Demo;
    ```

    使用函数更新 `state` 不会被合并
