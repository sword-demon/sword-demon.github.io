---
title: deepseek-harness插件推荐
date: 2026-08-20 17:40:10
---

# Deepseek-harness 插件推荐

先安装 `dsh`

```bash
npm install -g @deepseek-ai/dsh
```



## dsh-market

插件商店

```bash
dsh plugin --profile web add dshmarket
```



## dsh-better-sidebar

丰富的侧边栏

```bash
dsh plugin --profile web add @linxin666/dsh-web-ui-all
```



## dsh-usage-stats

token 预算查看、余额查看

```bash
dsh plugin --profile web add github:Make0209/dsh-usage-stats
```



modlens

视觉与多模态

此时也能直接使用插件市场来安装

![image-20260820180012626](https://virusoss.oss-cn-shanghai.aliyuncs.com/image-20260820180012626.png)

```bash
dsh plugin --profile web add @liustack/modlens
```

## dsh-context

上下文可视化插件

https://github.com/bowenliang123/dsh-context

```bash
dsh plugin --profile web add dsh-context
```



## dsh-at-file

优化版的`@`符号引用文件操作

https://github.com/omdsh-dev/dsh-at-file

```bash
dsh plugin --profile web add https://github.com/omdsh-dev/dsh-at-file/archive/refs/tags/v0.6.6.tar.gz
```

也可以直接使用插件市场里搜索进行安装，方便快捷。



## dsh-skills-manager

可视化的技能管理

```bash
dsh plugin --profile web add @michengai/dsh-skills-manager
```



## dsh-skin-market

web 界面的皮肤

```bash
dsh plugin --profile web add 'github:kingOfSoySauce/dsh-skin-market'
```



> 安装后都需要重启`web`

```bash
dsh web
```

