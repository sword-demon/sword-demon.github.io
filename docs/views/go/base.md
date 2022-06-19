---
title: 基础学习
date: 2022-06-19
category: Go
---

## 输出

在终端将想要的展示的数据显示出来的一个过程。

-   内置函数
    -   print
    -   println
-   fmt 包（推荐使用）
    -   fmt.Print
    -   fmt.Println

扩展：进程里有`stdout stdin stderr`。

<!-- more -->

案例：

```go
package main

import "fmt"

func main() {
  fmt.Println("hello world")
}
```

fmt 包扩展：格式化输出

```go
fmt.Printf("无解的%s", "游戏")
```

用于替换一个字符串

```
%d 用于替换一个整数
%f 用于替换一个带小数的，也就是浮点数
%s 占位符 "字符串"
百分比：用于百分比则需要在写一个%
```

保留小数点后几位

```go
fmt.Printf("无解的%.2f", 2221.2121212)
```

想保留几位写数字几。

百分比案例：

```go
fmt.Printf("包你100%%满意")

// 输出： 包你100%满意
```

## 变量

使用`var`关键字来定义变量

声明和赋值写在同一行

```go
var sd string = "沙雕"
fmt.Println(sd)

var age int = 18
fmt.Println(age)

var flag bool = true
fmt.Println(flag)
```

先声明一个变量，后赋值

```go
var sd string // 字符串类型的变量
sd = "沙雕" // 后进行赋值
fmt.Println(sd)
// 和上面本质上是相同的
```

> 注意，变量声明和定义了，如果不进行使用，则会报错。这是`go`的一个特点。

### 变量名要求

-   变量名必须只包含：字母、数字、下划线

-   数字不能开头

-   **不能使用 go 语言内置的关键字**

    ```go
    var var string = "无解" // var 是关键字就报错
    ```

    关键字如下

    ```go
    break default func interface select case defer go map struct chan else goto package switch const fallthrough if range type continue for import return var
    ```

-   建议

    -   变量名见名知意：name/age/num 都知道这是啥意思
    -   驼峰式命名：`myBossName/startDate`，第一个单词的字母是小写的，后面的单词的首字母是大写的

### 变量的简写

原来的写法

-   声明 + 赋值

    ```go
    var name string = "wujie"

    // 可以简写为
    var name = "wujie" // go可以内部根据你的赋的值推断它为字符串类型

    // 或者
    name := "wujie" // 推荐使用此方式简写
    ```

-   先声明再赋值

    ```go
    var name string
    var message string
    var data string
    name = "wujie"

    // 简写
    // 创建多个变量的时候
    var name, message, data string // 将声明放在一行
    name = "wujie"
    message = "hello"
    data = "中奖了"
    ```

#### 因式分解

例如：声明 5 个变量，分别有字符串、整型，有的是赋值的，有的是不赋值的

```go
var (
	name = "wujie"
  age = 18
  gender string // 只声明，不赋值，有一个默认值：""
  length int 		// 只声明，不赋值，有一个默认值：0
  sb bool 		  // 只声明，不赋值，哟一个默认值：false
  hobby = "大保健"
  salary = 100000
)
```

### 作用域

如果我们定义了大括号，我们在里面定义了变量

-   不能被它的上级使用
-   可以在同级使用

```go
if true {
		age3 := 12
		fmt.Println(age3)
	}

	fmt.Println(age3) // 报错 undefined: age3
```

-   可以在子级别使用
-   父级和子级有一个同名称的变量，大括号内的变量如果定义了，不和上级的变量进行冲突，互相独立
-   优先会从自己的级别的开始找，慢慢往上找，最终都找不到就会报错

#### 全局变量和局部变量

-   全局变量：在一个`go`文件不在函数里定义的变量，是项目中寻找变量的最后一环
-   局部变量：在一个函数里，大括号里的都叫局部变量，可以使用任意方式简化

**全局变量里，不可以使用简写方式`:=`**，另外两种方式都可以，也可以基于因式分解方式。

### 赋值及内存相关

```go
name := "wujie" // name的变量指向了内存里存储wujie的位置

nickname := name // 会再重新拷贝一份数据，让nickname指向拷贝后的地址
```

**这一点与 Python 不同**

输出下内存地址来对比一下

```go
package main

import "fmt"

func main() {
	name := "wujie"
	nickname := name

	fmt.Println(name, &name)
	fmt.Println(nickname, &nickname)
}

```

```go
// 输出结果
wujie 0x14000104220
wujie 0x14000104230
```

**两者的内存地址是不一样的**

---

```go
name := "wujie"
nickname := name
name = "666"
```

> name 原先指向的地址不变，但是其地址对应的值会被覆盖

```go
package main

import "fmt"

func main() {
	name := "wujie"
	nickname := name

	fmt.Println(name, &name)
	fmt.Println(nickname, &nickname)

	name = "666"

	fmt.Println(name, &name)
	fmt.Println(nickname, &nickname)
}

```

```go
// 输出结果
wujie 0x14000010240
wujie 0x14000010250
666 0x14000010240		// 内存地址不会改，值会进行覆盖
wujie 0x14000010250

```

**注意事项：**

> 使用 int、string、bool 这三种数据类型时，如果遇到变量的赋值则会拷贝一份。【值类型】

## 常量

> 不可修改的值

关键字`const`

```go
const age int = 98 // 定义常量,不能被修改

// 或者
const age = 98 // 没有冒号的简写方式
```

因式分解

```go
const (
	age = 18
  v1 = 123
  v2 = "dqwdwq"
  v3 int // 错误，要求在定义常量的时候必须把值赋上
)
```

常量基本都放在全局。

### iota

可有可无，可以当做在声明常量时的一个计数器

```go
const (
	v1 = 1
	v2 = 3
	v3 = 4
	v4 = 5
)
```

简写方式

```go
const (
	v1 = iota
	v2
	v3
	v4
)
```

默认会从 0 开始计数，下面+1

```go
const (
	v1 = iota + 1 // 会从1开始往下计数
	v2
	v3
	v4
)
```

隔断一个值

```go
const (
	v1 = iota + 2
  _ // 下划线
	v2
	v3
	v4
)

// 输出： 2 4 5 6 7
```

```go
const (
	v1 = iota
	v2
	v3
	v4
)

const (
	n1 = iota // 不会和上一个iota继续，会重新从0开始
  n2
  n3
)
```

## 输入

用户输入数据，完成项目交互。

-   fmt.Scan
-   fmt.Scanln(用的比较多)
-   fmt.Scanf

示例 1：

```go
package main

import "fmt"

func main() {
	var name string
	fmt.Println("请输入用户名:")

	fmt.Scan(&name) // 把name变量的内存地址放进来，给内存地址指向的空间赋值的过程
	fmt.Println(name)
}

```

```go
请输入用户名:
wujie
wujie

```

---

示例 2：

在编辑器里会清楚地看到 Scan 泛黄，其实 Scan 还有 2 个返回值

当使用 Scan 时，会提示用户输入，用户输入完之后，会得到两个值：

-   count，用户输入了几个值
-   err，当用户输入的过程中出现错误了，就包含了错误信息

```go
package main

import "fmt"

func main() {
	var name string
	fmt.Println("请输入用户名:")

	count, err := fmt.Scan(&name) // 把name变量的内存地址放进来，给内存地址指向的空间赋值的过程
	fmt.Println(count, err)
	fmt.Println(name)
}

```

```go
请输入用户名:
ddqwd
1 <nil>
ddqwd

```

> nil 代表没有错误

```go
package main

import "fmt"

func main() {
	var name string
	fmt.Println("请输入用户名:")

	//count, err := fmt.Scan(&name) // 把name变量的内存地址放进来，给内存地址指向的空间赋值的过程
	_, err := fmt.Scan(&name) // 使用下划线来代替不使用的变量
	if err == nil { // 错误信息为空，代表没错，这里容易被单词误解
		fmt.Println(name)
	} else {
		fmt.Println("用户输入错误", err)
	}
}

```

**特别说明：fmt.Scan 要求你输入 2 个值，就必须输入 2 个值，否则会一直等待**

---

```go
var name string
_, err := fmt.Scanln(&name)
fmt.Println(err)
fmt.Println(name)
```

> 效果上和 Scan 差不多

**差别：Scan 必须都输完，Scanln 等待回车，只要一按下回车，就算你输入完了；其他全都是一样的。**

---

> Scanf 就是格式化输入，第一个输入一个带占位符的格式，第二个和上面一样；支持有模板的方式让用户输入。

```go
var name string
fmt.Println("请输入用户名")
fmt.Scanf("我叫%s", &name)
fmt.Println(name)
```

```go
var name string
fmt.Println("请输入用户名")
fmt.Scanf("我叫%s今年18岁", &name)
fmt.Println(name)

// 如果输入：我叫XXX今年18岁
// 输出：xxx今年18岁 此时name = xxx今年18岁
// go官方让我们使用空格隔开进行输入
// 输入：我叫xxx 今年18岁

var age int
fmt.Scanf("我叫%s 今年%d 岁", &name, &age)
// 如果%d后面也有数字，会将数字也带着输出，所以这里都主动加上括号
```

如果返回的两个变量都不想要

```go
var name string
_, _ = fmt.Scanln(&name) // 这里直接使用 = ，不用 := ,因为:= 会有相当于声明了2个同名的变量的错误
```

---

**无法解决的问题**

```go
var message string

fmt.Scanln(&message)
fmt.Println(message)
```

> 假如你输入：带我去多无群多的去 "空格手动描述" 带我带我群多前端去
>
> 此时，就只会输出空格之前的内容

**解决办法，使用`os.Stdin`**获取终端输入，获取包含空格的内容。

```go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
  reader := bufio.NewReader(os.Stdin)
  // reader默认一次能读4096个字节 (4096 / 3)个汉字，如果一次读完了，isPrefix = false；读不完，先读一部分，isPrefix=true，再去读一行，如果读完了，isPrefix=false
	// line, isPrefix, err := reader.ReadLine() // 读一行
  line, _, _ := reader.ReadLine() // 所有的都一样才需要去掉冒号
	fmt.Println(line, isPrefix, err)
  data := string(line) // 转换成功后的字符串
  fmt.Println(data)
}

```

-   line：从 stdin 中读取的一行的数据(字节集合，可以转化成为字符串)
-   isPrefix: 只有一次读完了，isPrefix 才为 false，读不完都是 true

## 条件语句

### 最基本

```go
if 条件 {
  成立后代码执行
} else {
  不成立，此代码执行
}
```

## for 循环

```go
package main

import "fmt"

// for 循环
func main() {
	// 1. 基本for循环
	//for i := 0; i < 10; i++ {
	//	fmt.Println(i)
	//}

	// 2. 省略初始语句，必须保留初始语句后面的分号
	//var i = 0
	//for ; i < 10; i++ {
	//	fmt.Println(i)
	//}

	// 3. 省略初始语句和结束语句
	//var i = 10
	//for i > 0 {
	//	fmt.Println(i)
	//	i--
	//}

	// 4. 死循环
	//for {
	//	fmt.Println("hello world")
	//}

	// 5. break跳出循环
	for i := 0; i < 5; i++ {

		if i == 3 {
			//break
			continue // 继续下一次循环
		}
		fmt.Println(i)
	}
}

```

对 for 进行打标签，然后通过 break 和 continue 就可以实现多层循环的跳出和终止。

```go
f1:
		for i := 0; i < 3; i++ {
			for j := 1; j < 5; j++ {
				if j == 3 {
					continue f1
				}
				fmt.Println(i, j)
			}
		}

>>> 输出:
0 1
0 2
1 1
1 2
2 1
2 2
```

```go
f1:
		for i := 0; i < 3; i++ {
			for j := 1; j < 5; j++ {
				if j == 3 {
					break f1
				}
				fmt.Println(i, j)
			}
		}


>>> 输出：
1 1
1 2
```

## 数值类型范围

范围

**有符号位**

```go
int8  // 1个字节	-2^7 ~ 2^7-1
int16  // 2个字节	-2^15 ~ 2^15-1
int32 // 4个字节	-2^31 ~ 2^31-1
int64 // 8个字节	-2^63 ~ 2^63-1
```

**无符号位**

```go
uint8 	// 1
uint16	// 2
uint32	// 4
uint64	// 8
```

:::tip

快速记忆，一个字节占 8 位，就按照第一个 int8 的来进行记忆，后面`int16`就使用 16/8 的方式来算占多少个字节。这个范围，也是按照第一个来算，找规律。

无符号的范围，都是从 0 开始，到对应的 `2^多少次方-1`，`uint多少`就是多少次方。

:::

**打印数据类型的方法**

```go
fmt.Printf("变量名: %T\n", 变量)
```

**打印占用空间大小的方法**

```go
fmt.Println(unsafe.Sizeof(变量))
```
