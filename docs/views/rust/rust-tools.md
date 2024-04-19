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


## tokei

统计代码行数的工具

[https://github.com/XAMPPRocky/tokei](https://github.com/XAMPPRocky/tokei)

```bash
# 我使用 cargo 安装
cargo install tokei
```



## rustc

-   查看版本

    ```bash
    rustc --version
    ```

-   编译生成二进制文件

    ```bash
    rustc -o output_filename filename.rs
    ```

-   编译生成库文件

    ```bash
    rustc --crate-type lib filename.rs
    ```

    

## 开发环境

-   推荐: `vscode`

-   `vscode`插件

    -   `rust-analyzer`
    -   `Error Lens`

-   隐式的使用`rustc`进行编译

-   命令

    -   创建

        ```bash
        cargo new project_name
        
        # 创建一个新的 rust 库项目
        cargo new --lib project_name
        ```

    -   构建项目（生成二进制可执行文件或库文件）

        -   `cargo build`
        -   `cargo build --release`为生成优化的可执行文件，常用于生产环境

    -   检测

        -   `cargo check`

    -   运行、测试

        -   `cargo run / cargo test`



### 项目结构

-   库
-   `project_name/`
    -   `Cargo.toml`
    -   `src/`
        -   `lib.rs`
-   可执行二进制
-   `project_name/`
    -   `Cargo.toml`
    -   `src/`
        -   `main.rs`



`Cargo.toml`文件

-   `package`
    -   设置项目名
    -   版本等
-   `dependencies`
    -   设置依赖
    -   `[build-dependencies]`列出了在构建项目时需要的依赖项
    -   `[dev-dependencies]`列出了只在开发时需要的依赖项



## 官方库

[https://crates.io](https://crates.io)



## cargo-edit

安装

```bash
cargo install cargo-edit
```

添加库

```bash
cargo add dependency_name
```

安装指定版本

```bash
cargo add dependency_name@1.2.3
```

添加开发时用的依赖库

```bash
cargo add --dev dev_dependency_name
```

添加构建时使用的依赖库

```bash
cargo add --build build_dependency_name
```

删除库

```bash
cargo rm dependency_name

# 删除开发时的
cargo rm --dev dependency_name
```



## 设置国内源

推荐`rsproxy.cn` [https://rsproxy.cn/](https://rsproxy.cn/)

文件: `~/.cargo/config`

```text
[source.crates-io]
replace-with = 'rsproxy-sparse'
[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"
[source.rsproxy-sparse]
registry = "sparse+https://rsproxy.cn/index/"
[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"
[net]
git-fetch-with-cli = true
```

按照这个网站的介绍使用就行

