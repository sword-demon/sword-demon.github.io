---
title: 框架骨架
date: 2026-10-24 19:29:11
---

## 初始化项目框架

```bash
laravel new hdedu
```

选择`no kit`

前端这里选择了`React`，继续等待对应的依赖下载完成即可。



## 调整配置

调整数据库配置由`sqlite`换成`mysql`，并将对应的`mysql`相关的配置信息进行填充

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=13306
DB_DATABASE=hd_edu
DB_USERNAME=xxx
DB_PASSWORD=xxxx
```

