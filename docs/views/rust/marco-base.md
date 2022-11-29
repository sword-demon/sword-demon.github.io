# 宏入门

`Rust`提供了一个强大的宏，可进行元编程(`metaprogramming`)。看起来和函数很想，只不过名称末尾有一个感叹号

之前使用过的一些`println!`、`vec!`和`format!`等是。

> 元编程：用代码生成代码、控制代码、扩展代码
>
> 案例：
>
> 1.  `Java`的注解
> 2.  `php`的`eval`

## 最简单的宏

```rust
macro_rules! me {
    () => {
        println!("无解");
    };
}

fn main() {
    me!();
}

```

在`src`下和`main.rs`同级宏

```rust
macro_rules! echo {
    () => {
        println!("无解");
    };
}
```

```rust
#[macro_use]
mod mymacros;
fn main() {
    echo!();
}

```

:::tip 注意

使用`mod`引用之后，还得加上`#[macro_use]`来使用宏这个注解。

:::

---

加入参数，前面写前缀，后面加上冒号，再加上表达式或者别的

```rust
macro_rules! echo {
    () => {
        println!("无解");
    };
    // 前缀: 表达式
    ($exp: expr) => {
        println!("{}", $exp);
    };
}

```

多个以分号隔开。

```rust
#[macro_use]
mod mymacros;
fn main() {
    echo!();
    echo!("abc");
    let a = 3;
    echo!(a == 3);
}

```

```bash
cargo run
无解
abc
true  # 表达式的结果
```

---

改成使用`stringify!`包裹直接打印出表达式的内容

```rust
macro_rules! echo {
    () => {
        println!("无解");
    };
    // 前缀: 表达式
    // ($exp: expr) => {
    //     println!("{}", $exp);
    // };
    ($exp: expr) => {
        println!("{}", stringify!($exp));
    };
}

```

## 可变参数的基本定义

我们可以看一下`println!`的源码来看一看

```rust
#[macro_export]
#[stable(feature = "rust1", since = "1.0.0")]
#[cfg_attr(not(test), rustc_diagnostic_item = "println_macro")]
#[allow_internal_unstable(print_internals, format_args_nl)]
macro_rules! println {
    () => {
        $crate::print!("\n")
    };
    ($($arg:tt)*) => {{
        $crate::io::_print($crate::format_args_nl!($($arg)*));
    }};
}
```

可以使用`$(包裹)后面加内容`

```rust
macro_rules! echo {
    () => {
        println!("无解");
    };
    // 前缀: 表达式
    // ($exp: expr) => {
    //     println!("{}", $exp);
    // };
    ($exp: expr) => {
        println!("{}", stringify!($exp));
    };
    ($($exp: expr), +) => {
        $(
            println!("{}", stringify!($exp));
        )+
    };
}

```

`+`代表的意思是可以传一个或者多个

> 测试

```rust
#[macro_use]
mod mymacros;
fn main() {
    echo!();
    echo!("abc");
    let a = 3;
    echo!(a == 3);
    println!("{}", a);

    echo!("a", "b", "c");
}

```

但是这样，是至少得有一个参数，我们其实是可以不传参数的，我们可以把`+`换成`*`

```rust
macro_rules! echo {
    () => {
        println!("无解");
    };
    // 前缀: 表达式
    // ($exp: expr) => {
    //     println!("{}", $exp);
    // };
    ($exp: expr) => {
        println!("{}", stringify!($exp));
    };
    ($($exp: expr), *) => {
        $(
            println!("{}", stringify!($exp));
        )*
    };
}

```

## 使用宏来创建自定义函数

前面的`expr`的含义是表达式，指传入的参数是表达式类型，其实他的类型有很多：

`ident`：指示符，常用于函数名和变量名。

```rust
macro_rules! func {
    ($fn_name: ident) => {
        fn $fn_name() {
            println!("my func name is {}", stringify!($fn_name));
        }
    };
}
```

调用测试

```rust
#[macro_use]
mod mymacros;
fn main() {
    func!(php);
    php();
}
```

```bash
warning: `mypro` (bin "mypro") generated 1 warning
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
     Running `target/debug/mypro`
my func name is php
```
