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



> 配置文件的作用

1. 分离可变参数，避免硬编码
2. 适配多环境开发和部署
3. 管理框架和第三方框架的功能调整
4. 存储业务配置相关