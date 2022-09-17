# windows 开发环境部署

## 下载

[https://www.rust-lang.org/zh-CN/](https://www.rust-lang.org/zh-CN/)

找到`rustup-init.exe`

需要一些`vc++`的一些库，如果你不想使用微软这些东西，可以使用`MSYS2`

### MSYS2

> 集成了`pacman`和`Mingw-w64`的`Cygwin`升级版，提供了`bash shell`等`linux`环境、版本控制软件`git/hg`和`MinGW-w64`工具链。

-   下载：[https://www.msys2.org/](https://www.msys2.org/)

-   如果太慢，到这里：[https://mirrors.tuna.tsinghua.edu.cn/msys2/distrib/x86_64/](https://mirrors.tuna.tsinghua.edu.cn/msys2/distrib/x86_64/)

下载好之后进行解压，目录内容如下

![jieya](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/20220913215323.png)

使用编辑器打开`msys2_shell.cmd`

```cmd
# 找到 rem set MSYS2_PATH_TYPE=inherit
# 去掉rem
set MSYS2_PATH_TYPE=inherit
```

保存之后退出，双击它运行。

## 创建比较合适的目录

比如在 D 盘创建一个`rust`目录，将下载好的`rustup-init.exe`可执行文件放到目录中，确保目录地址没有中文。

如果你不配置，默认会都安装到 C 盘，后面如果有些库会装的很大，所以尽可能的不要安装在 C 盘，可以在 D 盘里安装。

新建目录

-   `D:\rust\cargo`
-   `D:\rust\rustup`

和`rustup-init.exe`同级

### 配置环境变量

在环境变量里添加系统变量：

1.  `CARGO_HOME`：`D:\rust\cargo`

2.  `RUSTUP_HOME`：`D:\rust\rustup`

然后在`PATH`环境变量中加入：

`%CARGO_HOME%\bin;`前面原有的内容千万不能删掉，这是紧挨着后面添加的，一定要有分号进行分隔。

### 设置中科大的源

再加入 2 个环境变量

1.  `RUSTUP_DIST_SERVER`：`https://mirrors.ustc.edu.cn/rust-static`
2.  `RUSTUP_UPDATE_ROOT`：`https://mirrors.ustc.edu.cn/rust-static/rustup`

## 运行安装

打开刚在打开的`msys2_shell.cmd`命令窗口，进入`d:\rust`目录

```bash
./rustup-init.exe
```

我们这里是不使用微软的那套的，所以不用介意出现的内容，继续输入`y`即可。

到了有选项的地方，会有一个默认的安装选项，所以我们需要改一下，如果你微软的相关的软件装好了，那就默认往下吧，这里我们不默认，需要修改，所以选 2

![](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/20220913220611.png)

然后可以把上面选中的内容`copy`一份到下面进行修改输入内容为

`x86_64-pc-windows-gnu`，这就是为啥要装`MSYS2`的原因，然后直接回车，直到出现：`Modify PATH variable?`，这里写`n`，不需要它帮我们设置环境变量 ，因为我们已经设置好了，然后出现下面的选项界面。

![](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/20220913220823.png)

最后再按下回车，等他下载完成。

如果装成功，使用命令进行测试

```bash
rustc -V
rustc 1.40.0
```

会出现对应的版本

```bash
cargo -V
cargo 1.40.0
```

```bash
rustup -V
rustup 1.21.1
```
