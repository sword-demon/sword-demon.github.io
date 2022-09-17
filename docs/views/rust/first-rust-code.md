# rust 第一个程序

## 第一个 rust 代码

```rust
fn main() {
	println!("hi wxvirus")
}

```

这里的`println!`，是一个宏

使用`rustc`进行编译

```bash
➜  rustworkspace rustc main.rs
➜  rustworkspace ./main
hi wxvirus
➜  rustworkspace
```

## 安装源码

```bash
rustup component add rust-src
```

然后使用`vs code`安装一些插件，重新打开上述文件目录，就可以点击进入`println!`这个宏里面去查看源码了。
