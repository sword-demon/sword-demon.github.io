# Cargo

> 类似于 Java 的 Maven、JS 的 npm、PHP 的 composer，go 的 module

rust 的是`cargo`，就是`rust`的代码、项目组织和管理工具，提供项目的建立、构建到测试、运行直至部署。

## 使用 cargo

```bash
➜  rustworkspace cargo new mypro
     Created binary (application) `mypro` package
```

使用`cargo`来新建一个项目

```
.
├── Cargo.toml
└── src
    └── main.rs
```

还有一个隐藏的`.git`文件和`.gitignore`

## 定义变量

使用`let`定义变量，暂时先不写对应的类型，这里会自动匹配为字符串类型。

```rust
fn main() {
    let my_name = "wxvirus";
    println!("{}", my_name);
}

```

这里变量名称不推荐使用驼峰，它的定义风格和`python`类似，都喜欢小写接下划线拼接。

这里打印字符串跟别的语言来说，这个使用`"{}"`来`format`一下，别的可能是`%s`，这个是使用花括号代表即将打印的内容，和`python`里的也有点类似。

---

编译运行

```bash
➜  mypro git:(master) ✗ cargo build
   Compiling mypro v0.1.0 (/Users/wxvirus/workspace/rustworkspace/mypro)
    Finished dev [unoptimized + debuginfo] target(s) in 0.17s
➜  mypro git:(master) ✗ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
     Running `target/debug/mypro`
wxvirus
```

编译我们可以直接使用`cargo build`即可，因为我们生成了一个`src/main.rs`入口文件,`build`之后生成的可执行文件会在`target/debug/可执行文件`

这里的生成的可执行文件(ELF)名称和`Cargo.toml`里配置的`package.name`一样

```toml
[package]
name = "mypro"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]

```

运行，我们可以直接使用`cargo run`，则会直接运行`mypro`可执行文件。

## Cargo + vscode 运行 rust 程序、GDB 调试

可以在`vs code`里安装插件：`native debug`，然后点击左侧调试，添加`launch.json`文件配置,则会在文件目录下生成`.vscode/launch.json`文件，用于配置调试运行`rust`。

**先安装插件，再生产配置文件，选择`GDB`**才行

生成的配置文件需要调整`target`内容。如果是`windows`，需要在后面加上`.exe`

```json
{
    // 使用 IntelliSense 了解相关属性。
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug",
            "type": "gdb",
            "request": "launch",
            "target": "./target/debug/${workspaceFolderBasename}",
            "cwd": "${workspaceRoot}",
            "valuesFormatting": "parseText"
        }
    ]
}
```

但是这里没有`build`的过程，因此我们需要在运行程序之前有一个`build`的过程。

```json
{
    // 使用 IntelliSense 了解相关属性。
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug",
            "type": "gdb",
            "request": "launch",
            "target": "./target/debug/${workspaceFolderBasename}",
            "cwd": "${workspaceRoot}",
            "valuesFormatting": "parseText",
            "preLaunchTask": "Build"
        }
    ]
}
```

但是此时点击`vscode`的`debug`运行是找不到`Build`的

![nobuild](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/20220830222301.png)

我们选择配置任务，然后选择`Create tasks.json file from template`，然后选择`Others`，生成一个比较纯净的`tasks`

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build",
            "type": "shell",
            "command": "cargo build"
        }
    ]
}
```

:::danger 注意

这里的`label`必须和上面的`lanuch.json`里的`preLaunchTask`对应的名称一模一样，大小写也得一样。

`command`改成我们真正执行`build`的命令：`cargo build`

:::

![run](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/20220830222722.png)

尝试使用断点配合`Debug`进行调试，点击 F10 就会进行下一步，左侧本地变量就会出现`my_name`

![debug](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/20220830223017.png)

然后继续运行就结束运行。
