---
title: rust常用工具
date: 2024-03-23
tag:
 - rust
 - tool
---

# 常用工具



## pre-commit

```bash
pip install pre-commit
```

安装成功后运行`pre-commit install`





## cargo deny

>   用于检查依赖的安全性

```bash
cargo install --locked cargo-deny
```



## typos

>   拼写检查工具

```bash
cargo install typos-cli
```



## git cliff

>   生产一个`changelog`的工具

```bash
cargo install git-cliff
```



## nextest

>   rust 的增强测试工具

```bash
cargo install cargo-nextest --locked
```


## cargo-generate

```bash
cargo install cargo-generate
```

:::danger 问题
如果遇到一个

```text
使用 cargo generate 会出现 unknown http scheme 'socks5'; class=Http (34)
```
:::

可能是你的`git`设置了`proxy`

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

这样之后再次尝试即可