---
title: Ghostty 美化
date: 2026-07-05
---

# Ghostty 美化

> MacOS 版本



## ghostty 的主题配置

[https://github.com/catppuccin/ghostty](https://github.com/catppuccin/ghostty)

- 下载下来，放到`~/.config/ghostty/themes/`下
- 打开`ghostty`的设置，进行编辑配置



主要配置如下

> 前提你得下载安装一些`Nerd Font`的字体
>
> [https://www.nerdfonts.com/font-downloads](https://www.nerdfonts.com/font-downloads)

```
# --- Typography ---
font-family = "0xProto Nerd Font Mono Bold"
font-size = 16
adjust-cell-height = 2

# --- Theme and Colors ---
theme = Catppuccin Mocha
mouse-hide-while-typing = true

window-padding-x = 12
window-padding-y = 12
window-padding-balance = true
```

需要保存配置后重启`ghostty`

## 安装starship 彩虹状态栏

> 注意了，如果你已经安装了`oh-my-zsh`之类的，那就别弄这个了，基本上就是美化效果。

官网地址：[https://starship.rs/zh-CN/](https://starship.rs/zh-CN/)

使用`homebrew`安装

```bash
brew install starship
```

使用`winget`安装

```bash
winget install starship
```

### 配置初始化脚本

#### zsh配置

在`~/.zshrc`文件末尾添加以下内容

```sh
# ~/.zshrc

eval "$(starship init zsh)"
```

#### bash 配置

在`~/.bashrc`文件末尾添加以下内容

```sh
# ~/.bashrc

eval "$(starship init bash)"
```

> 其他的可以按照官网的配置步骤来，我主要使用的还是`zsh`

配置完成之后，重启终端。

### 配置和 Catppuccin 的预设配置

```bash
starship preset catppuccin-powerline -o ~/.config/starship.toml --force
```

