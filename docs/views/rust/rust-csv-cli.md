---
title: 处理csv
date: 2024-04-20
sticky: 2
tag:
 - rust
 - cli

---

# 处理 csv

## 使用 clap

```bash
cargo add clap --featres derive
```

使用`derive`方式，`features`用来调整一个项目的不同的功能内容。

[文档](https://docs.rs/clap/latest/clap/)

目标考虑: `rcli csv -i input.csv -o output.json --header -d ','`

`clap`是`rust`的命令行解析器

```rust
use clap::Parser;

[derive(Debug, Parser)]
#[command(name="rcli",version,author, about,long_about=None)]
struct Opts {
    #[command(subcommand)]
    cmd: SubCommand,
}

#[derive(Debug, Parser)]
enum SubCommand {
    #[command(name = "csv", about = "Show csv, or convert CSV to other formats")]
    Csv(CsvOpts),
}
#[derive(Debug, Parser)]
struct CsvOpts {
    #[arg(short, long)]
    input: String,
    #[arg(short, long, default_value = "output.json")]
    output: String,
    #[arg(short, long, default_value_t = ',')]
    delimiter: char,
    #[arg(short, long, default_value_t = true)]
    header: bool,
}

fn main() {
    let opts = Opts::parse();
    println!("{:?}", opts);
}
```

几个宏介绍：[文档地址](https://docs.rs/clap/latest/clap/_derive/index.html#command-attributes)

-   `arg`: 可以获取终端输入的字符串参数
-   `command`：定义对应的命令
-   `subcommand`: 将子命令解析为用户定义的枚举，所以下面的`CsvOpts`是一个枚举类型
-   `Parser`: 将命令行参数解析为`Self`

```bash
# 运行起来
cargo run

Usage: rcli <COMMAND>

Commands:
  csv   Show csv, or convert CSV to other formats
  help  Print this message or the help of the given subcommand(s)

Options:
  -h, --help     Print help
  -V, --version  Print version
```

`header`里的`short`就相当于这个`-h`的效果，我们可以去规避掉。

再次运行

```bash
cargo run -- csv -i test.csv

Opts { cmd: Csv(CsvOpts { input: "test.csv", output: "output.json", delimiter: ',', header: true }) }

```

### 验证`input`

```rust
#[derive(Debug, Parser)]
struct CsvOpts {
    #[arg(short, long, value_parser = verify_input_file)]
    input: String,
    #[arg(short, long, default_value = "output.json")]
    output: String,
    #[arg(short, long, default_value_t = ',')]
    delimiter: char,
    #[arg(long, default_value_t = true)]
    header: bool,
}
```

通过`value_parser`定义一个验证的方法

```rust
use std::path::Path;

/// 输入是一个 filename 文件地址，输出是一个 如果存在就返回文件名，不存在就返回一个错误信息
fn verify_input_file(filename: &str) -> Result<String, String> {
    if Path::new(filename).exists() {
        Ok(filename.into())
    } else {
        Err("File doesn't exist".into())
    }
}
```

此时运行`cargo run -- csv -i test.csv`则会提示文件不存在。

## 处理csv

这里引入一个工具[duckdb](https://duckdb.org/)

```bash
duckdb

select * from read_csv('assets/juventus.csv', auto_detect=true);
```

此时会给你有一个很美观的一个展示内容。



安装一个`csv`库

```bash
cargo add csv
```

在安装一个`serde`一个`rust`里神级的库

```bash
cargo add serde --features derive
```

引入`serde`

```bash
use serde::{Deserialize, Serialize};
```

如果需要处理一个`csv`内容，此时`csv`的表头是有这么几个属性，`name,position,dob,nationality,kit`，我们可以定义为一个结构体

```rust
#[allow(dead_code)]
#[derive(Debug, Deserialize, Serialize)]
pub struct Player {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Position")]
    pub position: String,
    #[serde(rename = "DOB")]
    pub dob: String,
    #[serde(rename = "Nationality")]
    pub nationality: String,
    #[serde(rename = "Kit Number")]
    pub number: u8,
}
```

`#[serde(rename = "Name")]`对字段进行`rename`符合真正的`csv`得表头内容。

使用模式匹配的方式来解析数据

```rust
fn main() {
    let opts = Opts::parse();
    match opts.cmd {
        SubCommand::Csv(opts) => {
            let mut reader = Reader::from_path(opts.input).unwrap();
            let records = reader.deserialize()
                .map(|record| record.unwrap())
                .collect::<Vec<Player>>();
            println!("{:?}", records);
        }
    }
    println!("{:?}", opts);
}
```

`record`是一个`Result`类型，所以可以使用`unwrap`方法。，我们可以使用`for`循环来改写

```rust
fn main() {
    let opts = Opts::parse();
    match opts.cmd {
        SubCommand::Csv(opts) => {
            let mut reader = Reader::from_path(opts.input).unwrap();
            for result in reader.deserialize() {
                let record: Player = result.unwrap();
                println!("{:?}", record);
            }
        }
    }
    println!("{:?}", opts);
}
```

这里还是使用`result.unwrap()`不是一个很好的处理方法，我们可以使用`anyhow`来处理

```bash
cargo add anyhow
```

此时`main`函数必须返回一个`Result<()>`，`unwrap`可以使用`?`来替代，这也是一个模式匹配的过程，相当于

```rust
match reader {
    Ok(v) => ... ,
    Err(e) => return Err(e.into())
}
```

所以这里可以改写成

```rust
use anyhow::Result;

fn main() -> Result<()> {
    let opts = Opts::parse();
    match opts.cmd {
        SubCommand::Csv(opts) => {
            let mut reader = Reader::from_path(opts.input)?;
            for result in reader.deserialize() {
                let record: Player = result?;
                println!("{:?}", record);
            }
        }
    }
    Ok(())
}
```

如果你的`Player`里面每个属性都是以没有分隔符的属性名称，那么可以对结构体进行全部`rename_all`方式，在个别属性上可以单独`rename`

```rust
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct Player {
    pub name: String,
    pub position: String,
    #[serde(rename = "DOB")]
    pub dob: String,
    pub nationality: String,
    #[serde(rename = "Kit Number")]
    pub number: u8,
}
```

现在我们已经成功的可以输出在`console`终端里显示，现在我们需要输出到`output.json`,那么我们就需要一个`serde-json`来处理

```bash
cargo add serde-json
```

不需要任何的`feature`。

`#[derive(Debug, Deserialize, Serialize)]`不仅可以`Deserialize`成这个结构体，还能使用`Serialize`序列化为别的格式。

```rust
use std::fs;

fn main() -> Result<()> {
    // 拿到文件的内容
    // let file = File::open("assets/juventus.csv")?;
    // let mut reader = csv::ReaderBuilder::new()
    //     .has_headers(true)
    //     .from_reader(file);
    // for result in reader.deserialize() {
    //     let record: Player = result?;
    //     println!("{:?}", record.to_json()?);
    // }
    let opts = Opts::parse();
    match opts.cmd {
        SubCommand::Csv(opts) => {
            let mut reader = Reader::from_path(opts.input)?;
            let mut ret = Vec::with_capacity(128);
            for result in reader.deserialize() {
                let record: Player = result?;
                ret.push(record);
            }

            let json = serde_json::to_string_pretty(&ret)?;
            // 写入输出文件
            fs::write(opts.output, json)?;
        }
    }
    Ok(())
}
```

此时纵观`main.rs`代码就显得非常臃肿，我们需要分离出一个`mod`

## 优化分离模块

将`cmd`部分抽离出来为一个`opts.rs`

```rust
use std::path::Path;
use clap::Parser;

/// Simple program to deal with csv
#[derive(Debug, Parser)]
#[command(name = "rcli", version, author, about, long_about = None)]
pub struct Opts {
    #[command(subcommand)]
    pub cmd: SubCommand,
}

/// subcommand to show how to convert csv to other file
#[derive(Debug, Parser)]
pub enum SubCommand {
    #[command(name = "csv", about = "Show csv, or convert CSV to other formats")]
    Csv(CsvOpts),
}

#[derive(Debug, Parser)]
pub struct CsvOpts {
    #[arg(short, long, value_parser = verify_input_file)]
    pub input: String,
    #[arg(short, long, default_value = "output.json")]
    pub output: String,
    #[arg(short, long, default_value_t = ',')]
    pub delimiter: char,
    #[arg(long, default_value_t = true)]
    pub header: bool,
}

fn verify_input_file(filename: &str) -> anyhow::Result<String, String> {
    if Path::new(filename).exists() {
        Ok(filename.into())
    } else {
        Err("File doesn't exist".into())
    }
}
```

将处理`csv`成为`json`的进行分离为`process.rs`

```rust
use std::fs;
use csv::Reader;
use serde::{Deserialize, Serialize};
use anyhow::Result;

#[allow(dead_code)]
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct Player {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Position")]
    pub position: String,
    #[serde(rename = "DOB")]
    pub dob: String,
    #[serde(rename = "Nationality")]
    pub nationality: String,
    #[serde(rename = "Kit Number")]
    pub number: u8,
}

pub fn process_csv(input: &str, output: &str) -> Result<()> {
    let mut reader = Reader::from_path(input)?;
    let mut ret = Vec::with_capacity(128);
    for result in reader.deserialize() {
        let record: Player = result?;
        ret.push(record);
    }

    let json = serde_json::to_string_pretty(&ret)?;
    // 写入输出文件
    fs::write(output, json)?;

    Ok(())
}
```

:::danger 注意

我们这里原先都没有加`pub`的，现在都得加上了，否则在别的地方引用的时候那就是私有的，无法使用。

:::

主要优先的还是先定义一个`lib.rs`用于引入模块

```rust
mod opts;
mod process;

pub use opts::{Opts, SubCommand};
pub use process::{process_csv};
```

最后的主代码

```rust
use clap::Parser;
use anyhow::Result;
use rcli::{Opts, process_csv, SubCommand};

fn main() -> Result<()> {
    let opts = Opts::parse();
    match opts.cmd {
        SubCommand::Csv(opts) => {
            // String 所以这里使用引用类型 去借用一下
            process_csv(&opts.input, &opts.output)?;
        }
    }
    Ok(())
}

```

## 代码检查

我们前面下载了一个`cargo-deny`

```bash
cargo install cargo-deny
```

生成一个对应的配置文件

```bash
cargo deny init
```

然后使用命令来检测

```bash
cargo deny check -d
```

我们需要将`advisories`部分的`db-path`和`db-urls`放开，然后再继续使用`cargo deny check -d`进行检测，如果提示了一些和`advisory-db`相关的无法找到的错误。

则使用一下命令

```bash
cargo deny fetch
```

或者将对应的`db-urls`的是`github`的地址换成`gitee`国内的一些地址。或者自己下下来放到对应的位置。

最后再次进行`cargo deny check -d`检测，如果有遇到一些`licenses`检测，则将对应的都添加到`[licenses]`的`allow`数组里，最后自己项目的`Cargo.toml`里也需要加上对应的`license = "MIT"`或者别的什么版权信息。

```bash
cargo deny check -d

232 │ github = [""]
    │           ^ no crate source fell under this organization

warning[unmatched-organization]: allowed 'gitlab.com' organization  was not encountered
    ┌─ /Users/xxx/RustProjects/rcli/deny.toml:234:11
    │
234 │ gitlab = [""]
    │           ^ no crate source fell under this organization

warning[unmatched-organization]: allowed 'bitbucket.org' organization  was not encountered
    ┌─ /Users/xxxx/RustProjects/rcli/deny.toml:236:14
    │
236 │ bitbucket = [""]
    │              ^ no crate source fell under this organization

advisories ok, bans ok, licenses ok, sources ok
```

最后出现这样的结果内容即可，最后提交代码。

