---
title: go的web框架Context设计
date: 2023-10-25 22:05:15
category: GoCore
---

# Context - 处理内容

## 处理输入要解决的问题

-   反序列化输入：将`body`字节流转换成一个具体的类型
-   处理表单输入：可以看做是一个和`json`或者`xml`差不多的一种特殊的序列化方式
-   处理查询参数：指从`URL`中的查询参数中读取值，并且转化为对应的类型
-   处理路径参数：读取路径参数的值，并且转化为具体的类型
-   重复读取`body`：`http.Request`里的`Body`默认是只能读取一次，不能重复读取的
-   读取`Header`：从`Header`里面读取出来特定的值，并且转化为对应的类型
-   模糊读取：按照一定的顺序，尝试从`Body`、`Header`、路径参数或者`Cookie`里面读取值，并且转化为特定的类型

## 处理输出要解决的问题

-   序列化输出：按照某种特定的格式输出数据，例如`json`或者`xml`
-   渲染页面：要考虑模板定位、命名和渲染的问题
-   处理状态码：允许用户返回特定的状态码的响应，例如`HTTP 404`
-   错误页面：特定`HTTP Status`或者`error`的时候，能够重定向到一个错误页面，例如`404`被重定向到首页
-   设置`COokie`：设置`Cookie`的值
-   设置`Header`：往`Heeader`里面放一些东西

## 处理输入 - Body 输入

> `JSON`作为最场景的输入格式，可以率先支持。其余的类似`XML`或者`protobuf`都可以按照类似的思路支持。

```go
//go:build v2

package v2

import (
	"encoding/json"
	"errors"
	"net/http"
)

type Context struct {
	Req        *http.Request
	Resp       http.ResponseWriter
	PathParams map[string]string
}

func (c *Context) BindJSON(val any) error {
	if val == nil {
		return errors.New("web: 输入为 nil")
	}

	if c.Req.Body == nil {
		return errors.New("web: Body 为 nil")
	}

	decoder := json.NewDecoder(c.Req.Body)
	return decoder.Decode(val)
}
```

其实上面一部分验证可以注释，因为`Decode`会处理。

**注意**

-   `decoder.UserNumber()`，数字就是用`Number`类型来表示，否则默认就是`float64`
-   `decoder.DisallowUnknownFields`：要是有一个未知的数据字段，就会报错
    -   比如`User`只有`Name`和`Email`两个字段
    -   但是`JSON`里额外多了一个`Age`字段，那么就会报错
-   大部分用户不会有这些需求，如果有，那么就是在整个应用级别上的需求
    -   不同情况下框架支持的方式也不一样：
        -   整个应用级别：维持 2 个全局变量
        -   `HTTPServer`级别：在`HTTPServer`里面定义 2 个字段
        -   引入类似`BindJSONOpt`的方法，用户来灵活控制，函数里加 2 个参数
-   【主要还是解决大多数人的需求】**不让小众需求污染大部分的核心**

## 处理输入 - 表单输入

表单在`Go`的`http.Request`里面有 2 个

-   `Form`: 一个是`URL`里面的查询参数和`PATCH`、`POST`、`PUT`的表单数据
-   `PostForm`：`PATCH`、`POST`或者`PUT body`参数，只有`body`里的内容

> 但是不管哪个，都要先使用`ParseForm`解析表单数据

```go
h.Post("/form", func(ctx *Context) {
    ctx.Req.ParseForm()
})
```

> 区别

-   `Form`：基本可以认为，所有的表单数据都能拿到
-   `PostForm`：在编码是`x-www-form-urlencoded`的时候才能拿到

实际使用中，现在都是前后端分离下，都是在`body`里面使用`JSON`通信，或者`protobuf`通信。

```go
func (c *Context) FormValue(key string) (string, error) {
	err := c.Req.ParseForm()
	if err != nil {
		return "", err
	}
	values, ok := c.Req.Form[key]
	if !ok {
		return "", errors.New("web: key不存在")
	}

	// 注意这里的 values 的类型是 []string
	return values[0], nil
}
```

> 每次都调用`ParseForm`，是否会引起重复解析

**不会，它代码里加了判断如果是`nil`才会再次解析**

## 处理输入 - 查询参数

查询参数就是在`URL 问号之后的部分`，例如：`http://localhost:8081/form?name=xxx&age=12`

那么查询参数有 2 个，`name=xxx`和`age=12`，前面表单里面有一个`ParseForm`，那么这部分数据也可以在`Form`里面找到。

```go
type Context struct {
	Req        *http.Request
	Resp       http.ResponseWriter
	PathParams map[string]string

	// cacheQueryValues url.Values 引入URL 查询参数缓存
	cacheQueryValues url.Values
}
```

```go
// QueryValue 获取 url 中的 query 参数解析
func (c *Context) QueryValue(key string) (string, error) {
	if c.cacheQueryValues == nil {
		c.cacheQueryValues = c.Req.URL.Query()
	}
	values, ok := c.cacheQueryValues[key]
	if !ok {
		return "", errors.New("web: key不存在")
	}
	// 用户区别不出来真的有值，但是值恰好是空字符串还是没有值
	// 每次都 ParseForm 都要重新解析，所以这里直接使用 Get
	// 和表单比起来，它是没有缓存的，所以每次都要解析
	// 避免多次解析, 稍微缓存一下
	return values[0], nil
}
```

## 处理输入 - 路径参数

```go
// PathValue 路径参数解析
func (c *Context) PathValue(key string) (string, error) {
	val, ok := c.PathParams[key]
	if !ok {
		return "", errors.New("web: key不存在")
	}
	return val, nil
}
```

> 类似上述的，我们如果需要处理返回的内容作为其他类型，这里一般都是字符串，我们不能在`Context`上面去加东西，我们可以自己定义一个返回值类型，再针对返回值类型进行添加额外的扩展方法

```go
func (c *Context) PathValueV1(key string) StringValue {
	val, ok := c.PathParams[key]
	if !ok {
		return StringValue{
			err: errors.New("web: key不存在"),
		}
	}
	return StringValue{val: val}
}

type StringValue struct {
	val string
	err error
}

// AsInt64 扩展性函数 将字符串转为 int64
func (s StringValue) AsInt64() (int64, error) {
	if s.err != nil {
		return 0, s.err
	}
	return strconv.ParseInt(s.val, 10, 64)
}

```

这样我们在使用的时候就很方便

```go
func TestServer(t *testing.T) {
	h := NewHTTPServer()

	h.Get("/values/:id", func(ctx *Context) {
		// 使用 StringValue 返回值可以进行链式调用来解析数据
		id, err := ctx.PathValueV1("id").AsInt64()
		if err != nil {
			ctx.Resp.WriteHeader(400)
			ctx.Resp.Write([]byte("id 输入不对"))
			return
		}

		ctx.Resp.Write([]byte(fmt.Sprintf("hello id: %d", id)))
	})

	err := h.Start(":8081")
	if err != nil {
		return
	}
}
```
