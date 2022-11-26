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

## 第一个比较正常的程序

使用`cargo new scrape_url`生成一个新项目，入口在`src/main.rs`，我们可以再`Cargo.toml`文件里加入项目依赖

```toml
[dependencies]
reqwest = { version = "0.11", features = ["blocking"] }
html2md = "0.2"
```

`Cargo.toml` 是 Rust 项目的配置管理文件，我们添加了 2 个依赖，[reqwest](https://github.com/seanmonstar/reqwest) 是一个 HTTP 客户端，它的使用方式和 Python 下的 request 类似；html2md 顾名思义，把 HTML 文本转换成 Markdown。

在`src/main.rs`编写代码

```rust
use std::fs;

fn main() {
  let url = "https://www.rust-lang.org/";
  let output = "rust.md";

  println!("Fetching url: {}", url);
  let body = reqwest::blocking::get(url).unwrap().text().unwrap();

  println!("Converting html to markdown...");
  let md = html2md::parse_html(&body);

  fs::write(output, md.as_bytes()).unwrap();
  println!("Converted markdown has been saved in {}.", output);
}
```

保存后，在命令行下执行`cargo build && cargo run`在漫长的编译后，程序开始运行，就会看到如下输出：

```bash
Fetching url: https://www.rust-lang.org/
Converting html to markdown...
Converted markdown has been saved in rust.md.
```

还会附带生成一个`rust.md`文件，这个就是将`rust`官网的`html`转换为了一个`markdown`文件。

---

基础类型和一些练习

```rust
use std::fs;

fn apply(value: i32, f: fn(i32) -> i32) -> i32 {
    f(value)
}

fn square(value: i32) -> i32 {
    value * value
}

fn cube(value: i32) -> i32 {
    value * value * value
}

fn pi() -> f64 {
    3.141592653
}

fn not_pi() {
    3.1415;
}

fn main() {
    let url = "https://www.rust-lang.org/";
    let output = "rust.md";

    println!("Fetching url: {}", url);
    let body = reqwest::blocking::get(url).unwrap().text().unwrap();

    println!("Converting html to markdown");
    let md = html2md::parse_html(&body);

    fs::write(output, md.as_bytes()).unwrap();
    println!("Converted to Markdown: {}", output);

    println!("apply square: {}", apply(2, square));
    println!("apply cube: {}", apply(2, cube));

    let is_pi = pi();
    let is_unit1 = not_pi();
    let is_unit2 = {
        pi();
    };

    println!(
        "is_pi: {:?}, is_unit1: {:?}, is_unit2: {:?}",
        is_pi, is_unit1, is_unit2
    );
}

```

```bash
➜  scrape_url git:(master) ✗ cargo build && cargo run
   Compiling scrape_url v0.1.0 (/Users/wujie/workspace/rustworkspace/scrape_url)
    Finished dev [unoptimized + debuginfo] target(s) in 0.53s
    Finished dev [unoptimized + debuginfo] target(s) in 0.06s
     Running `target/debug/scrape_url`
Fetching url: https://www.rust-lang.org/
Converting html to markdown
Converted to Markdown: rust.md
apply square: 4
apply cube: 8
is_pi: 3.141592653, is_unit1: (), is_unit2: ()
```

## 数据结构

> 数据结构是程序的核心组成部分，在对复杂的问题进行建模时，我们就要自定义数据结构。Rust 非常强大，可以用 struct 定义结构体，用 enum 定义标签联合体（tagged union），还可以像 Python 一样随手定义元组（tuple）类型。

定义一个聊天服务的数据结构

```rust
#[derive(Debug)]
enum Gender {
    Unspecified = 0,
    Female = 1,
    Male = 2,
}

#[derive(Debug, Copy, Clone)]
struct UserId(u64);
#[derive(Debug, Copy, Clone)]
struct TopicId(u64);

#[derive(Debug)]
struct User {
    id: UserId,
    name: String,
    gender: Gender,
}

#[derive(Debug)]
struct Topic {
    id: TopicId,
    name: String,
    owner: UserId,
}

// 定义聊天室中可能发生的事件
#[derive(Debug)]
enum Event {
    Join((UserId, TopicId)),
    Leave((UserId, TopicId)),
    Message((UserId, TopicId, String)),
}

fn main() {
    let alice = User {
        id: UserId(1),
        name: "Alice".into(),
        gender: Gender::Female,
    };
    let bob = User {
        id: UserId(2),
        name: "Bob".into(),
        gender: Gender::Male,
    };

    let topic = Topic {
        id: TopicId(1),
        name: "rust".into(),
        owner: UserId(1),
    };
    let event1 = Event::Join((alice.id, topic.id));
    let event2 = Event::Join((bob.id, topic.id));
    let event3 = Event::Message((alice.id, topic.id, "Hello world!".into()));
    println!(
        "event1: {:?}, event2: {:?}, event3: {:?}",
        event1, event2, event3
    );
}

```
