---
title: codex配置国内模型
date: 2026-06-08 21:49:21
---

## 配置连接deepseek

> 前提：你先去 [https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)获取自己的`api key`

## 安装cc-switch

[https://github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch)

1. 安装完成之后，点击设置
2. 点击路由，展开，选择`Codex`把开关打开，服务地址就保持默认即可，如果和你本地什么端口冲突了，那就换一个端口即可。

![image-20260608215623927](https://virusoss.oss-cn-shanghai.aliyuncs.com/image-20260608215623927.png)

3. 回到首页选择`codex`，添加供应商，选择`deepseek`其他的和`claude`配置都差不多，就是这里会有一个**需要本地路由映射**的开关，把它打开，然后可以尝试点击获取模型列表，如果有模型列表展示出来，且提示成功的，那基本上就是可以了。

   ![image-20260608215810131](https://virusoss.oss-cn-shanghai.aliyuncs.com/image-20260608215810131.png)

![image-20260608215841113](https://virusoss.oss-cn-shanghai.aliyuncs.com/image-20260608215841113.png)

然后点击启用即可。注意这里提示你要重启`codex`才会生效。而不是缩小在图标栏里，是要完整的退出才行。然后就能使用了。

