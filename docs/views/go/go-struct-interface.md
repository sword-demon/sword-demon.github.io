---
title: go结构体与接口
category: Go
date: 2022-05-24
tag:
    - struct
    - interface
---

## 类型别名和自定义类型

### 自定义类型

> 在 Go 语言中有一些基本的数据类型，如`string`、`int`、浮点型、布尔等数据类型，Go 语言中可以使用`type`关键字来定义自定义类型。

自定义类型是定义了一个全新的类型。我们可以基于内置的基本类型定义，也可以通过`struct`定义

```go
// 将MyInt定义为int类型
type MyInt int
```

通过`type`关键字的定义，`MyInt`就是一种新的类型，它具有`int`的特性

```go
var x MyInt = 100
fmt.Printf("x=%T\n", x) // x:main.MyInt
```

> 自定义类型是程序员根据自己的需要创造的新类型

### 类型别名

```go
type NewInt = int
```

这个实际上本质还是原来的`int`无非就是起了一个小名，别名。比如类型`rune`其实就是`int32`，还有`byte`就是`uint8`类型。

实际上就是为了方便理解而存在。

```go
var x NewInt = 100
fmt.Printf("x=%T\n", x) // x:int
```

> 类型别名只在源文件中生效，编译完之后，还是会以被替换成原始的`int`类型

<!-- more -->

## 结构体

> 结构体是一个复合类型，用于表示一组数据。
>
> 结构体由一系列属性组成，每个属性都有自己的类型和值
>
> Go 语言通过`struct`来实现面向对象

```go
// 定义一个结构体
type Person struct {
  name string
  age int
  email string
}

// 初始化结构体
var p1 = Person{"wujie", 19, "wyujui@qq.com"}

// 结构体中取值
fmt.Println(p1.name, p1.age, p1.email)

p1.age = 20 // 修改值
```

```go
type 结构体名称 struct {
  字段 类型
  ...
}
```

### 定义

```go
type Person struct {
  name string
  age int
  hobby []string
}
```

```go
type Address struct {
  city, state string
  age int
}
```

```go
type Address struct {
  city, state string
}

type Person struct {
  name string
  age int
  address Address
}
```

```go
type Address struct {
  city, state string
}

type Person struct {
  name string
  age int
  Address // 匿名字段，默认Person就包含了Address所有的字段
}
```

### 注意：

-   类型名：标识自定义结构体的名称，在同一个包内不能重复
-   字段名：标识结构体字段名。结构体中的字段名必须唯一
-   字段类型：标识结构体字段的具体类型

### 初始化、实例化

或根据结构体创建一个对象，只有当结构体实例化时，才会真正地分配内存。也就是实例化后才能使用结构体内的字段

```go
var 结构体实例 结构体类型
```

```go
type Person struct {
  name string
  age int
  hobby []string
}

// 1. 按照字段的先后顺序
var p1 = Person{"wujie", 19, []string{"篮球"}}

// 2. 关键字
var p2 = Person{name: "wujie", age: 19, hobby: []string{"饺子"}}

// 3. 先声明再赋值
var p3 Person
p3.name = "wujie"
p3.age = 19
p3.hobby = []string{"女人"}
```

```go
type Address struct {
  city, state string // 同一类型的可以写在一行
}

type Person struct {
  name string
  age int
  address Address
}

var p1 = Person{"wujie", 19, Address{"北京", "中国"}}

var p2 = Person{name: "wujie", age: 19, address: Address{"北京", "上海"}}

var p3 = Person
p3.name = "wujie"
p3.age = 19
p3.address = Address{
  city: "北京",
  state: "BJ"
}
```

```go
type Address struct {
  city, state string
}

type Person struct {
  name string
  age int
  Address // 匿名字段，默认Person就包含了Address所有的字段
}

p1 := Person{"wujie", 19, Address{"北京", "上海"}}

// 关键字字段名，如果没写，默认会生成一个和类型同名的字段
p2 := Person{name: "wujie", age: 19, Address: Address{"北京", "BH"}}
// 获取值可以直接去city和state
fmt.Println(p2.city, p2.state)
// 或者可以带上Address
fmt.Println(p2.Address.city, p2.Address.state)

// 先声明后赋值同上，也可以忽略字段名称
```

> 写的时候建议加上匿名字段的值，不加也可以。加上比较清晰

### 结构体指针

#### 创建

```go
type Person struct {
  name string
  age int
}

// 初始化结构体
p1 := Person{"wujie", 19}
fmt.Println(p1.name, p1.age)

// 初始化结构体指针
p2 := &Person{"无解", 18}
// 写全
// var p2 *Person = &Person{"无解", 18}
fmt.Println(p2.name, p2.age)

var p3 *Person = new(Person) // 显声明后赋值
p3.name = "wujie"
p3.age = 20

fmt.Println(p3.name, p3.age)
```

#### 内存管理

```go
type Person struct {
  name string
  age int
}

// 初始化结构体
p1 := Person{"wujie", 19}
fmt.Println(p1.name, p1.age)

// 初始化结构体指针
p2 := Person{"wujie", 20}
fmt.Println(p2.name, p2.age)
```

### 赋值

#### 赋值拷贝

```go
type Person struct {
  name string
  age int
}

// 初始化结构体
p1 := Person{"wujie", 19}

p2 := p1 // 内部将p1重新拷贝一份

fmt.Println(p1) // wujie 19
fmt.Println(p2) // wujie 19

p1.name = "123"

fmt.Println(p1) // 123 19
fmt.Println(p2) // wujie 19

// p1和p2是两份不同的数据，所以p1会改，p2和p1的改动无关
```

#### 结构体指针赋值

不会拷贝一份

```go
type Person struct {
  name string
  age int
}

p1 := &Person{"wujie", 19}
p2 := p1 // p2和p1的内存里存储的指针的地址是一样的

fmt.Println(p1)
fmt.Println(p2)

p1.name = "123"

fmt.Println(p1)
fmt.Println(p2)

// 都会发生变化

// 输出
&{wujie 19}
&{wujie 19}
&{123 19}
&{123 19}
```

基于结合结构体和结构体指针的特性，基于指针实现数据变化后同步遍布

```go
type Person struct {
  name string
  age int
}

// 创建了一个结构体
p1 := Person{"wujie", 12}

// 取了p1的地址赋给p2 p2是结构体指针类型
p2 := &p1

fmt.Println(p1) // {wujie 19}
fmt.Println(p2) // &{wujie 19}

p1.name = "123"

fmt.Println(p1) // {123 19}
fmt.Println(p2) // &{123 19}
```

#### 嵌套赋值拷贝

在存在结构体嵌套时，赋值会拷贝一份所有的数据

```go
type Address struct {
  city, state string
}

type Person struct {
  name string
  age int
  address Address
}

p1 := Person{name: "wujie", age: 10, address: Address{"北京", "bg"}}

p2 := p1

fmt.Println(p1.address) // {"北京"， "bg"}
fmt.Println(p2.address) // {"北京"， "bg"}

p1.address.city = "上海"

fmt.Println(p1.address) // {"上海"， "bg"}
fmt.Println(p2.address) // {"北京"， "bg"}
```

#### 谁不拷贝?

其实本质上都拷贝了，只不过由于数据存储方式的不同，导致拷贝的有些是数据，有些是内存地址(指针)。

-   感觉拷贝：字符串、数组、整型等
-   感觉不拷贝：map、切片

```go
package main

import "fmt"

type Person1 struct {
	name   string
	age    int
	hobby  [2]string
	num    []int
	parent map[string]string
}

func main() {
	p1 := Person1{
		name:   "二狗子",
		age:    12,
		hobby:  [2]string{"裸奔", "大保健"},                                   // 拷贝了一份
    num:    []int{69, 19, 99, 38},                                    // 未拷贝 (内部维护指针指向数据存储的地方)
		parent: map[string]string{"father": "wujie", "mother": "dwqdqw"}, // 未拷贝 (内部维护指针指向数据存储的地方)
	}

	// 实际在底层都拷贝了 主要是因为切片和map的存储结构不一样

	p2 := p1

	fmt.Println(p1)
	fmt.Println(p2)
	fmt.Println("")

	//p1.hobby[0] = "搓澡"
	//p1.num[0] = 12
	p1.parent["father"] = "我"
	fmt.Println(p1)
	fmt.Println(p2)

}

```

**注意：对于那些默认拷贝的情况，可以改变为指针类型，让数据实现同步修改**

```go
package main

import "fmt"

type Person1 struct {
	name   string
	age    int
	hobby  *[2]string // 指针 不想让他在拷贝加指针
	num    []int
	parent map[string]string
}

func main() {
	p1 := Person1{
		name:   "二狗子",
		age:    12,
		hobby:  &[2]string{"裸奔", "大保健"},
    num:    []int{69, 19, 99, 38},
		parent: map[string]string{"father": "wujie", "mother": "dwqdqw"},
	}

	p2 := p1

	fmt.Println(p1)
	fmt.Println(p2)
	fmt.Println("")

	p1.hobby[0] = "洗澡"
	//p1.num[0] = 12
	//p1.parent["father"] = "我"
  fmt.Println(p1.hobby) // &{洗澡 大保健}
	fmt.Println(p2.hobby) // &{洗澡 大保健}

}

```

### 结构体标签

```go
import "reflect" // 需要这个包

type Person struct {
  name string "姓名" // 标签，实际上没有啥实际的作用
}

p1 := Person{"wujie"}

// 方式1
p1Type := reflect.TypeOf(p1)
// 获取标签
field := p1Type.Field(0) // 姓名

// 方式2
field2, _ := p1Type.FieldByName("name") // 通过字段查找标签
fmt.Println(field2) // 姓名

// 循环获取
fieldNum := p1Type.NumFile()
for index :=0; index < fieldNum; index++ {
  field := p1Type.Field(index)
  fmt.Println(field.Name, field.Tag) // name 姓名
}
```

## 结构体的内存布局

结构体占用一块连续的内存

```go
package main

import "fmt"

type test struct {
	a int8
	b int8
	c int8
	d int8
}

func main() {
	n := test{
		1, 2, 3, 4,
	}
	fmt.Printf("n.a %p\n", &n.a)
	fmt.Printf("n.b %p\n", &n.b)
	fmt.Printf("n.c %p\n", &n.c)
	fmt.Printf("n.d %p\n", &n.d)
}

```

输出：

```bash
n.a 0x14000134004
n.b 0x14000134005
n.c 0x14000134006
n.d 0x14000134007
```

空结构体不占内存空间

```go
var t = test
fmt.Println(unsafe.Sizeof(t)) // 0
```

使用空结构体来省内存空间的案例：得到去重后的名称

```go
nameList := []string{"张三", "李四", "王五", "张三"}

var nameMap = make(map[string]struct{})
for _, name := range nameList {
    nameMap[name] = struct{}{}
}

for key := range nameMap {
    fmt.Println(key)
}
```

### 方法和接收者

> Go 语言中的方法，是一种作用于特定类型的变量的函数。这种特定类型变量叫做`接收者(receiver)`。接收者的概念就类似于其他语言中的`this`或者`self`。

方法定义格式如下：

```go
func (接收者变量 接收者类型) 方法名 (参数列表) (返回参数) {
    函数体
}
```

-   接收者变量：接收者中的参数变量名在命名时，官方建议使用接收者类型名称首字母的小写，而不是`self`、`this`之类的命名。例如：`Person`类型的接收者变量应该命名为`p`等。
-   接收者类型：接收者类型和参数类似，可以是指针类型和非指针类型
-   方法名、参数列表、返回参数：具体格式与函数定义相同

```go
type Person struct {
	name string
	age  int
}

func NewPerson(name string, age int) *Person {
	return &Person{name: name, age: age}
}

func main() {
	p := NewPerson("张三", 20)
	p.dream("吃喝拉撒")
}

func (p Person) dream(d string) {
	fmt.Printf("%s的梦想是%s\n", p.name, d)
}
```

### 结构体与 JSON 序列化

`JSON`是一种轻量级的数据交换格式。易与人阅读和编写。同时也利于机器解析和生成。`JSON`键值对是用来保存`JS`对象的一种方式，键值对的组合中的键名写在前面并用双引号`""`包裹，使用冒号`:`来分隔，然后紧接着值；多个键值之间使用`,`分隔。

结构体转换为`JSON`的包

`json.Marshal`方法

```go
package main

import (
	"encoding/json"
	"fmt"
)

// Student1 学生
type Student1 struct {
	ID     int
	Gender string
	Name   string
}

//Class 班级
type Class struct {
	Title    string
	Students []*Student1
}

func main() {
	c := &Class{
		Title:    "101",
		Students: make([]*Student1, 0, 200),
	}
	for i := 0; i < 10; i++ {
		stu := &Student1{
			Name:   fmt.Sprintf("stu%02d", i),
			Gender: "男",
			ID:     i,
		}
		c.Students = append(c.Students, stu)
	}
	//JSON序列化：结构体-->JSON格式的字符串
	data, err := json.Marshal(c)
	if err != nil {
		fmt.Println("json marshal failed")
		return
	}
	fmt.Printf("json:%s\n", data)
	//JSON反序列化：JSON格式的字符串-->结构体
	str := `{"Title":"101","Students":[{"ID":0,"Gender":"男","Name":"stu00"},{"ID":1,"Gender":"男","Name":"stu01"},{"ID":2,"Gender":"男","Name":"stu02"},{"ID":3,"Gender":"男","Name":"stu03"},{"ID":4,"Gender":"男","Name":"stu04"},{"ID":5,"Gender":"男","Name":"stu05"},{"ID":6,"Gender":"男","Name":"stu06"},{"ID":7,"Gender":"男","Name":"stu07"},{"ID":8,"Gender":"男","Name":"stu08"},{"ID":9,"Gender":"男","Name":"stu09"}]}`
	c1 := &Class{}
	err = json.Unmarshal([]byte(str), c1)
	if err != nil {
		fmt.Println("json unmarshal failed!")
		return
	}
	fmt.Printf("%#v\n", c1)
}

```

```bash
json:{"Title":"101","Students":[{"ID":0,"Gender":"男","Name":"stu00"},{"ID":1,"Gender":"男","Name":"stu01"},{"ID":2,"Gender":"男","Name":"stu02"},{"ID":3,"Gende"男","Name":"stu03"},{"ID":4,"Gender":"男","Name":"stu04"},{"ID":5,"Gender":"男","Name":"stu05"},{"ID":6,"Gender":"男","Name":"stu06"},{"ID":7,"Gender":"男","Nastu07"},{"ID":8,"Gender":"男","Name":"stu08"},{"ID":9,"Gender":"男","Name":"stu09"}]}
&main.Class{Title:"101", Students:[]*main.Student1{(*main.Student1)(0x140001066c0), (*main.Student1)(0x140001066f0), (*main.Student1)(0x14000106720), (*main.Student1)(0x14000106750), (*main.Student1)(0x140001067b0), (*main.Student1)(0x140001067e0), (*main.Student1)(0x14000106810), (*main.Student1)(0x14000106840), (*main.Student1)(0x14000106870), (*main.Student1)(0x140001068a0)}}

```

**注意：反序列化一定要传入一个指针类型**

> 如果需要解析出来的键为别的名称，我们需要在结构体的字段后面加上`tag`，即结构体标签，就是告诉对应的包或函数这个字段的名字

```go
//Class 班级
type Class struct {
	Title    string
	Students []*Student1 `json:"student_list"`
}
```

当你用`json`包里的函数访问到这个结构体的时候，就可以读取到这个`json`里的双引号的值来代替返回的属性值。

如果是和`java`的传`xml`格式，就再加一个：`xml:"student_list"`即可，标签统一写到<kbd>`</kbd>反引号里，多个**tag**之间用空格分开，每组是用冒号分割的键值对。

```bash
json:{"Title":"101","student_list":[{"ID":0,"Gender":"男","Name":"stu00"},{"ID":1,"Gender":"男","Name":"stu01"},{"ID":2,"Gender":"男","Name":"stu02"},{"ID":3,"Ger":"男","Name":"stu03"},{"ID":4,"Gender":"男","Name":"stu04"},{"ID":5,"Gender":"男","Name":"stu05"},{"ID":6,"Gender":"男","Name":"stu06"},{"ID":7,"Gender":"男"e":"stu07"},{"ID":8,"Gender":"男","Name":"stu08"},{"ID":9,"Gender":"男","Name":"stu09"}]}
&main.Class{Title:"101", Students:[]*main.Student1(nil)}

```

### 结构体方法补充

因为`slice`和`map`这两种数据类型都包含了指向底层数组的指针，因此我们在需要复制它们时需要特别注意。

```go
type Person struct {
	name   string
	age    int8
	dreams []string
}

func (p *Person) SetDreams(dreams []string) {
	p.dreams = dreams
}

func main() {
	p1 := Person{name: "小王子", age: 18}
	data := []string{"吃饭", "睡觉", "打豆豆"}
	p1.SetDreams(data)

	// 你真的想要修改 p1.dreams 吗？
	data[1] = "不睡觉" // 修改切片变量 = 修改了底层数组
	fmt.Println(p1.dreams) // 会影响到 p1.dreams
}
```

正确的做法是在方法中使用传入的`slice`的拷贝进行结构体赋值

```go
func (p *Person) SetDreams(dreams []string) {
    tmp := make([]string, len(dreams))
	copy(tmp, dreams)
    p.dreams = tmp
}
```

> 同样的问题也存在于返回值 slice 和 map 的情况，在实际编码过程中一定要注意这个问题。

## 接口

Go 语言中`interface`接口是一种类型，一种抽象的类型。

是一组方法的集合，是`鸭子类型`的一种体现。接口做的事情就是定义一种协议(规则)。不关心属性，只关心行为和方法。

```go
package main

import "fmt"

type dog struct {
}

type cat struct {
}

func (d *dog) say() {
	fmt.Println("汪汪汪")
}

func (c *cat) say() {
	fmt.Println("喵喵喵")
}

// 接口不管你是什么类型，它只管你要实现什么方法
// 定义一个类型，一个抽象的类型，只要实现了say方法 这个方法的类型都可以称之为sayer类型
type sayer interface {
	say()
}

type person struct {
	name string
}

func (p *person) say() {
	fmt.Println("啊啊啊啊啊")
}

func click(arg sayer) {
	arg.say() // 不管传进来的是什么，都要调用say方法
}

func main() {
	d1 := &dog{}
	click(d1)

	c1 := &cat{}
	click(c1)

	p1 := &person{
		name: "无解",
	}
	click(p1)
}

```

### 接口的定义

```go
type 接口类型名 interface {
  方法名1(参数列表1) 返回值列表1
  ...
}
```

-   接口名：一般定义为接口的类型名，都会在单词后面加上`er`
-   方法名：首字母是大写且这个接口类型名首字母也是大写，可有对外访问
-   参数列表、返回值列表：都可以进行省略

```go
type writer interface {
  Write([]byte) error
}
```

```go
package main

import "fmt"

type xxx interface {
	// 空接口
	// 可以存储任意值
	// 空接口一般不需要提前定义
}

// 接口的嵌套
type animal interface {
	mover
	sayer
}

type mover interface {
	move()
}

type sayer interface {
	say()
}

type person struct {
	name string
	age  int
}

// 使用值接受者实现接口：类型的值和类型的指针都能保存到接口变量中
//func (p person) move() {
//	fmt.Printf("%s在炮...\n", p.name)
//}

// 使用指针接收者实现接口 只有类型指针能够保存到接口变量中
func (p *person) move() {
	fmt.Printf("%s在跑...\n", p.name)
}

func (p *person) say() {
	fmt.Printf("%s在叫...\n", p.name)
}

// 空接口的应用
// 1. 作为函数的参数
// 2. 空接口的类型可以作为map的value


func main() {
	var m mover
	//p1 := person{
	//	name: "无解",
	//	age:  12,
	//}
	p2 := &person{
		name: "带我去多无群",
		age:  18,
	}
	//m = p1 // 无法保存，因为p1是值类型，没有实现mover接口
	m = p2
	m.move()
	fmt.Println(m)

	// 定义一个空接口变量x x可以存储任意类型
	var x interface{}

	x = "hello"
	x = 100
	x=  false
	fmt.Println(x)
}

```

> 类型断言
>
> 想要判断空接口中的值这个时候就可以使用类型断言，语法格式为：
>
> `x.(T)`

-   x: 表示类型为 `interface{}`的变量
-   T：表示断言 x 可能是的类型

该语法返回两个参数，第一个参数是 x 转化为 T 类型后的变量，第二个值是一个布尔值，若为`true`则表示断言成功，为`false`则表示断言失败。

```go
var x interface{}

x = 100

ret, isTrue := x.(bool)
if isTrue {
  fmt.Println(ret)
} else {
  fmt.Println("false")
}
```

**编译的时候是没问题的，执行的时候会报错，提示不是 int 类型，所以需要第二个参数来进行判断。false 时，返回的值是该类型的零值**
