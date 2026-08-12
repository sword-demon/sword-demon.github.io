---
title: JavaWeb核心
date: 2026-08-08 21:30:10
---

## 一、XML配置方式

### 1.1 XML 简介

> `xml`是`EXtensible Markup Language`的缩写，翻译过来就是可扩展标记语言。基本语法都是标签。

- 可扩展：`XML`允许自定义标签。但这不代表你可以随便写；在`xml`语法规范的基础上，你是要的那些第三方应用程序、框架会通过`xml`约束的方式强制规定配置文件中可以怎么写和写什么。
- `xml`这个知识点的定位：**我们不需要从 0 开始，从头到尾一行一行编写`xml`文档，而是在第三方应用程序、框架已提供的配置文件的基础上修改。**

### 1.2 常见的配置文件类型

1. `properties`
2. `xml`
3. `yaml/yml`
4. `json`

#### 1.2.1 properties 配置文件

> 示例

```properties
xxx.jdbc.url=jdbc:mysql://localhost:3306/xxx
xxx.jdbc.driver=com.mysql.cj.jdbc.Driver
xxx.jdbc.username=root
xxx.jdbc.password=root
```

> 语法规范

- 由键值对组成
- 键和值之间的符号是等号`=`
- 每一行都必须顶格写，前面不能有空格之类的其他的符号
- `properties`支持的注释语法`# 注释`
- 多层`key`使用`.`分开

```properties
# 注释内容
key=value
user.name=张三
user.age=29
user.height=192
```

`.`在`yml/yaml`格式下，可以做缩进省略

```yaml
user:
	name: 张三
	age: 29
	height: 192
```



### 1.2.2 xml 配置文件

> 基本`xml`示例

```xml
<?xml version="1.0" encoding="UTF-8">
<students>
	<student>
	  <name>张三</name>
	  <age>18</age>
	<student>
</students>
```

> xml 的基本语法

1. 必须要有第一行的内容。`<?xml version="1.0" encoding="UTF-8">`这一部分是固定格式内容
2. 根标签：根标签有且只能有一个
3. 标签关闭：开始标签和结束标签必须成对出现，单标签在标签内关闭
4. 标签嵌套：标签可以嵌套，但是不能交叉嵌套，注释不能嵌套
5. 标签名、属性名建议使用小写字母
6. 属性：属性必须有值，属性值必须加引号，单双都行

### 1.2.3 XML 约束和引入

为了确保`xml`的正确性，需要引入特定的语法，限制 `xml`的编写内容，例如：标签、属性名、文本内容等。这些语法就是`xml`约束，他们是在特定应用下为`xml`编写的规则，用于检测`xml`是否符合规范。

> 我们只需要理解作用、基本解读和导入`xml`即可！

$$
HTML = XML + DTD 约束
$$

有了约束之后，标签就固化了，就方便进行解析和读取，对于我们来说，我们**读取约束文件和导入约束文件**；框架的设计值，会编写约束文件。



> 约束的作用

1. 限制标签规则，方便解读
2. `xml`配置文件带有约束，开发工具就会带有提示
3. 框架更方便传递配置规则



> 约束语法的种类

1. `dtd`引入，语法简单，约束力差。只能约束标签的命名、顺序和数量，不能约束内容
2. `schema`引入：约束语法复杂，能约束一切，一般框架使用



**DTD 语法简单说明：**

1. 元素声明：用于定义`xml`文档中的元素，格式为 `<!ELEMENT 元素名 内容模型>`。内容模型可分为：
   1. 空元素：`<!ELEMENT 元素名 EMPTY>`，表示该元素没有内容
   2. 文本元素：`<!ELEMENT 元素名 (#PCDATA)>`,`#PCDATA`表示元素内容为可解析的字符数据
   3. 包含子元素：`<!ELEMENT 元素名(子元素 1，子元素 2...)>`，子元素之间用逗号分隔表示顺序，用竖线`|`表示或的关系；还可以通过(0次或多次)、(1次或多次)、?(0 次或 1 次)指定子元素出现的次数，如`<!ELEMENT 元素名（子元素）>`
2. 属性声明：定义元素的熟悉的，格式为`<!ATTLIST 元素名 属性名 属性类型 默认值>`属性类型常见的有`CDATA`（字符数据）、枚举类型等。默认值可设为`#REQUIRED`（必须存在）、`#IMPLIED`（可选）、`#FIXED`（固定值）或具体默认值  



### 1.2.3 约束引入语法

> #### DTD 约束引入

```xml
<!DOCTYPE note SYSTEM "note.dtd">
```

约束文件`note.dtd`一般都放在相对位置下，直接引入即可。

然后下面输入`<`就会有提示，根标签为`note`



> 约束文件`note.dtd`内容

```dtd
<!-- 定义 note 元素，它包含 to、from、heading、body 四个子元素，且子元素必须按次顺序出现 -->
<!ELEMENT note (to, from, heading, body)>
<!-- 定义 to 元素， #PCDATA 表示该元素的内容为可解析的字符数据 文本 -->
<!ELEMENT to (#PCDATA)>

<!ELEMENT from (#PCDATA)>

<!ELEMENT heading (#PCDATA)>

<!ELEMENT body (#PCDATA)>
```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE note SYSTEM "note.dtd">

<note>
	<to>xxx</to>
  <from>xxx</from>
  <heading>dwqdqwdqw</heading>
  <body>dwqdqwdqwdwq</body>
</note>
```

> 一个`xml`文件只能导入一个`dtd`约束



#### schema 约束

> 一个`xml`文件可以导入多个`schema`约束

`schema`约束导入的位置是在根标签中，利用根标签的属性导入

`xmlns:xsi:"http://www.w3.org/2001/XMLSchema-instance"`这句话是官方约束，提供导入`schema`约束的属性。

`xsi:schemaLocation=`从这里开始导入的是自定义的约束。

格式为：`url`地址 + 约束文件名，`url`地址是命名空间的概念

`xmlns`-> `name space`

就是将标签分成不同的类别，`schema`约束限制的是某一个类别某一个空间的标签

`foo-schema.xsd` -> 约束命名空间 -> `foo`空间 ，那么里面的标签得这么写：`<foo:标签名 >`

命名空间的表现：命名空间就是一个唯一的字符串，一般情况下我们都使用`URL`地址

`xsi:schemaLocation="约束的命名空间(url我们使用对应的域名 url 地址来当做命名空间) 约束文件"`

给命名空间起别名：`xmlns:别名(别名要短一点)="导入约束的命名空间的地址 url地址"`





> 配置文件的作用

1. 分离可变参数，避免硬编码
2. 适配多环境开发和部署
3. 管理框架和第三方框架的功能调整
4. 存储业务配置相关