---
title: 按键修饰符
date: 2024-01-25 22:47:10
category: Vue3
tag:
  - KeyBoard
  - vue3
---

# 按键修饰符

> 格式：`v-on:keyup.按键名`或`@keyup.按键名`

## 常用按键名

- `.enter`回车键
- `.tab`
- `.delete`（捕获`Delete`和`Backspace`两个按键）
- `.esc`
- `.space`
- `.up`
- `.down`
- `.left`
- `.right`

## 系统按键修饰符

> 用来触发鼠标或键盘监听器，只有当按键按下时才会触发

- `.ctrl`
- `.alt`
- `.shift`
- `.meta`:
  - 在`mac`键盘上，`meta`是`Command`键
  - 在`windows`键盘上就是`那个类似田字的键(windows键)`
