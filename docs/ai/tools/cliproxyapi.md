---
title: cliproxyapi
date: 2026-07-09 23:50:10
---

# cli-proxy-api

你是否已经购买了`gemini pro`或者`ultra`，但是却无法使用Antigravity，他们对中国区域做了一些限制使用的方案，那么你就可以使用`cliproxyapi`来使用到它的模型【还是不能使用 gemini 系列的模型】，不过它的`claude-4.6-thinking`倒是可以使用，不就是消耗感觉很快，仅供参考哦。



## 安装

官方文档地址：[https://help.router-for.me/cn/](https://help.router-for.me/cn/)

### MacOS

```bash
brew install cliproxyapi
brew services start cliproxyapi
```

不建议按照官网文档推荐的使用软链的方式处理，我这样试过它还是会读取的`homebrew`下的配置文件，所以还是记住`brew`安装的位置，去修改`/opt/homebrew/etc/cliproxyapi.conf`即可。

当然，启动服务和重启服务的命令要记得的

```bash
# 启动服务
brew services start cliproxyapi
# 关闭服务
brew services stop cliproxyapi
# 重启服务
brew services restart cliproxyapi
```

### Windows

我建议你去`github`的地址，下载源码，使用`go`语言编译运行，我下过`github`的`release`的提供的`exe`可执行文件，闪退以及很多问题，我看过`github`的很多`issues`里面都有这样的问题，且都没有解决的。

推荐的方式就是：

- 下源码，使用`go build`之后运行
- 或者使用`docker`运行



## 配置

这里不要看文档的会有`./cli-proxy-api`这样的命令出现，你是通过`brew install cliproxyapi`安装的，所以前面的这个命令是没有用的。

老实的编辑原来的`/opt/homebrew/etc/cliproxyapi.conf`

**主要设置内容**：`remote-management`下的`secret-key`，这里随便填一个你喜欢的密码，你要自己能记得住，这里文档里会说明，明文即可，会自动哈希。其他的基本保持默认即可。

然后就能适应`web-ui`的方式打开：`http://localhost:8317/management.html`管理界面

![image-20260710000039016](https://virusoss.oss-cn-shanghai.aliyuncs.com/image-20260710000039016.png)

刚才设置的`secret-key`其实就是这里登录的时候你要输入的管理密钥，最后登录即可。后面其他的方式都可以通过这个`web-ui`的界面的方式来进行配置。

---

**网络配置**：打开左侧菜单栏配置面板，点击网络配置，如果你有那啥，可以配置上，比如`socks5://127.0.0.1:your port`



## 使用OAuth登录

如果你有正版的付费订阅的，就登录对应的一些平台即可



## 添加 AI 提供商

或者你有自己的渠道的，可以使用这个方式添加



## 最终使用

`cliproxyapi`最终会暴露一个兼容`api`

它的调用链为

```
本地客户端 / SDK / Codex / Claude Code
  -> http://127.0.0.1:8317
  -> CLIProxyAPI
  -> Antigravity OAuth 凭证
  -> Antigravity 可用模型
```

### 最小使用方式

> 注意：`/v1`是`openai`系列的方式，如果是使用`Anthropic`模式的，把`/v1`去掉接口，且不能留最后一个是`/`结尾。

```
Base URL: http://127.0.0.1:8317/v1
API Key: 你在 CLIProxyAPI cliproxyapi.conf 的 api-keys 里配置的 key
Model: 先用 /v1/models 看可用模型
```

你在 CLIProxyAPI cliproxyapi.conf 的 api-keys 里配置的 key，可以通过配置面板里的接入与凭证里，点击添加`API 密钥`，随机生成即可，你只需复制粘贴。

### 测试

这里你可以使用以下方式来测试一下获取模型列表

```bash
curl "http://127.0.0.1:8317/v1/models" \
  -H "Authorization: Bearer sk-dummy"
```

如果看到

```json
{
    "data": [
        {
            "id": "gemini-3.1-flash-image",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "gemini-3.1-flash-lite",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "gemini-pro-agent",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "gemini-3.1-pro-low",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "gpt-oss-120b-medium",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "gemini-3.5-flash-low",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "gemini-3.5-flash-extra-low",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "claude-opus-4-6-thinking",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "claude-sonnet-4-6",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "gemini-3-flash",
            "object": "model",
            "owned_by": "antigravity"
        },
        {
            "id": "gemini-3-flash-agent",
            "object": "model",
            "owned_by": "antigravity"
        }
    ],
    "object": "list"
}
```

即代表成功了，你可以尝试着在`cc-switch`里面配置，然后使用了。

如果你要测聊天接口

```bash
curl "http://127.0.0.1:8317/v1/chat/completions" \
  -H "Authorization: Bearer sk-dummy" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [
      { "role": "user", "content": "你好，简单介绍一下你自己" }
    ]
  }'
```

这里最好换成`claude`的模型，`gemini`的还是国内不能使用。

![image-20260710001932215](https://virusoss.oss-cn-shanghai.aliyuncs.com/image-20260710001932215.png)

测试过程中你可以打开配置面板里的日志与诊断，将写入日志文件打开，后续可以看看调用的日志。

---

> 仅供学习参考！