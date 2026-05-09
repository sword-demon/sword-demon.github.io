---
title: React 基础学习
date: 2025-05-09 20:15:11
categories:
  - React
---

# React 基础学习

## 认识 React

> React 是一个声明式,高效且灵活的用于构建用户界面的`javascript`库

- 中文官网: [https://zh-hans.react.dev](https://zh-hans.react.dev)
- 2022 年 3 月发布 18 版本
- 2022 年 6 月发布 18.2 版本

## 1.基本结构

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React</title>
    <!-- react 核心包 -->
    <script src="https://unpkg.com/react@18/umd/React.development.js"></script>
    <!-- react dom 操作相关的包-->
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Dont' use this in production -->
    <!-- 提供了对 es6 和 jsx 的支持,才能正确的去编译 es6 和 jsx -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <!-- 挂载点 -->
    <div id="app"></div>
    <script type="text/babel">
      // 获取到挂载点元素
      const app = document.getElementById("app");
      // 创建一个新的根节点,把元素对象传进去
      const root = ReactDOM.createRoot(app);
      // 调用渲染方法渲染页面
      // render 里面放的是月面内容 内容指的是 html 标签或者组件
      root.render(<h1>Hello World!</h1>); // jsx html 标签不需要加引号
    </script>
  </body>
</html>
```

如果访问这几个文件的链接比较慢,那可以下载到本地

可以直接简写为这样

```jsx
ReactDOM.createRoot(document.getElementById("app")).render(
  <h1>Hello World!</h1>,
);
```
