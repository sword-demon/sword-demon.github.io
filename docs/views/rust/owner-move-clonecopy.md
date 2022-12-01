---
title: 所有权以及所有权转移
date: 2022-12-01 23:30:10
category: Rust
tag:
    - Clone
---

# 所有权以及所有权转移

`let a = xxx;`

`xxx`是值，对应的变量是`a`，那么`a`就是`xxx`（值）的所有者。

## 基本口诀

-   值在任意时刻有且只有一个所有者
-   当所有者离开作用域，这个值将被销毁

## 案例

```rust
let a = String::from("a");
let b = a; // 所有者转移
println!("a: {}", a);
```

这里字符串的所有者发生了转移，到了最后一步，就会报错。

变量`a`原本是指向一个字符串`a`，此时再讲所有者转移给了`b`，此时`a`就跟未初始化的变量一样，是不能进行打印的。

文档：[https://doc.rust-lang.org/std/marker/trait.Copy.html](https://doc.rust-lang.org/std/marker/trait.Copy.html)

为什么使用`i32`类型的就可以编译通过且不报错，`i32`类型已经实现了`Copy`这个`trait`方法。

1.  `Copy`和`Move`很类似，拷贝后，并不会销毁原变量
2.  一个类型所有属性都实现了`Copy`，那么它本身就可以实现`Copy`
3.  常见数字类型、`bool`类型都已经实现了`Copy`
4.  凡是实现`Drop trait`的不能再实现`Copy`【`String`就是】
5.  `Copy`好比是一个浅拷贝，`Clone`实现了深拷贝
6.  `Copy`告诉编译器这个类型默认采用`copy`语义，而不是`move`语义【`clone`是面向程序员的，是需要自己来实现的】

---

自定义一个结构体

```rust
struct User {
    id: i32,
}

fn main() {

    let a = User { id: 123 };
    let b = a;
    println!("a: {}, b: {}", a, b);
}
```

上面这样是会报错的，我们可以使用`#[derive]`来自动实现，可以加一个`Debug`以及`Clone`和`Copy`，通常这 2 个是一起的

```rust
#[derive(Debug, Clone, Copy)]
struct User {
    id: i32,
}

fn main() {

    let a = User { id: 123 };
    let b = a;
    println!("a: {:?}, b: {:?}", a, b);
}
```

这个过程不会把`a`给“废掉”，还可以继续使用。

---

我们也可以自己实现`Copy`

```rust
#[derive(Debug)]
struct User {
    id: i32,
}

impl Copy for User {} // 这是空的impl 这是面向编译器的，告诉编译器这个情况不使用 move 语义，使用 copy 语义

impl Clone for User {
    // 抄的文档里的代码 官方搞的示例
    fn clone(&self) -> Self {
        *self
    }
}

fn main() {
    let a = User { id: 123 };
    let b = a;
    println!("a: {:?}, b: {:?}", a, b);
}

```

一般还是采用`#[derive(Debug, Clone, Copy)]`比较方便。

---

此时：我们在`User`结构体里加一个`String`类型的`name`，就应证了 **上面的第四点** ，`String`是没法被`Copy`的

### 实现 Clone 以及自动默认值

```rust
#[derive(Debug, Default)]
struct User {
    id: i32,
    name: String,
    age: i32,
}

impl Clone for User {
    fn clone(&self) -> Self {
        User {
            id: self.id, // i32 实现了 Copy 可以直接写
            name: self.name.clone() + "被克隆", // 没有实现就得加上 .clone() 方法
            age: self.age, // i32 直接使用
        }
    }
}

fn main() {
    let a = User {
        id: 123,
        ..Default::default()
    };
    let b = a.clone();
    println!("a: {:?}, b: {:?}", a, b);
}

```

加上`Default`，下面实例化结构体的时候可以使用`..Default::default()`来给对应的字段赋初值。

运行：

```bash
cargo build && cargo run
warning: `mypro` (bin "mypro") generated 1 warning
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
     Running `target/debug/mypro`
a: User { id: 123, name: "", age: 0 }, b: User { id: 123, name: "被克隆", age: 0 }
```
