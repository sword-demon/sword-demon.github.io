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
-   设置`Header`：往`Header`里面放一些东西

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

## 处理输出 - JSON 响应

这种设计就是将用户的值进行转换一下，其他格式的输出也是类似的写法。

```go
func (c *Context) RespJSON(code int, val any) error {
	bs, err := json.Marshal(val)
	if err != nil {
		return err
	}
	c.Resp.WriteHeader(code)
	// 不设置也能正常
	c.Resp.Header().Set("Content-Type", "application/json")
	// n 返回的处理的数据的长度
	n, err := c.Resp.Write(bs)
	if n != len(bs) {
		// 说明写入的长度和 val 的长度不一致
		// 一般来说不需要处理，但是如果是自定义的类型，那么就需要处理
		return errors.New("web: 写入长度和 val 长度不一致")
	}
	return err
}
```

测试

```go
type User struct {
    Name string `json:"name"`
}

h.Get("/user/:id", func(ctx *Context) {
    ctx.RespJSON(200, User{Name: "张三"})
})
```

> 如果`val`已经是`string`或者`[]byte`，那么用户不需要调用这个，直接自己操作`Resp`即可。

## 处理输出 - 设置 cookie

```go
type Context struct {
	Req        *http.Request
	Resp       http.ResponseWriter
	PathParams map[string]string

	// cacheQueryValues url.Values 引入URL 查询参数缓存
	cacheQueryValues url.Values

	// cookie 的默认配置 不推荐
	// cookieSameSite http.SameSite
}

// SetCookie 设置 cookie
func (c *Context) SetCookie(ck *http.Cookie) {
	// 不推荐
	// ck.SameSite = c.cookieSameSite
	http.SetCookie(c.Resp, ck)
}
```

## 处理输出 - 错误页面？

如果有一个需求，如果请求了一个不存在的接口，响应了 404，那么应该重定向到一个默认页面，比如说重定向到首页，或者自定义一个 404 页面。

但是不是所有的 404 都是需要重定向的，比如你是异步加载数据的`restful`请求，例如在打开页面之后异步加载用户详情，即便 404 了也不应该重定向。

> 所以一般不支持在`Context`层做处理，用户每次都得检测是不是 404 或者 500，这样不是很好。
>
> 一般我们可以在`AOP`里设计解决方案。

> TODO

## Context 总结 - Context 是线程安全的吗？

> 不是线程安全的！

```go
type Context struct {
	Req        *http.Request
	Resp       http.ResponseWriter
	PathParams map[string]string

	// cacheQueryValues url.Values 引入URL 查询参数缓存
	cacheQueryValues url.Values
}
```

没有锁，很明显不是线程安全的。

> `Context`不需要保证线程安全，是因为在我们的预期里面，这个`Context`只会被用户在一个方法里面使用，**而且不应该被多个`goroutine`操作**。
>
> 对于绝大多数人来说，他们不需要一个线程安全的`Context`。即便真的要线程安全，我们可以**提供一个装饰器**，让用户在使用前手动创建装饰器来转换一下。

```go
type SafeContext struct {
	Context
	mutex sync.RWMutex
}

func (c *SafeContext) RespJSON1(val any) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	return c.Context.RespJSONOK(val)
}

```

然后使用前可以这样

```go
h.Get("/user/:id", func(ctx *Context) {
    safeCtx := SafeContext {
        Context: *ctx
    }
    safeCtx.RespJSON(200, User{Name: "张三"})
})
```

## Context 总结 - Context 为什么不设计为接口？

> 目前看来，看不出来设计为接口的必要性。
>
> `Echo`设计为接口，但只有一个实现，有点过度设计的感觉

## Context 总结 - Context 能不能使用泛型？

> 不能，因为`Go`的泛型有一个限制，结构体本身可以是泛型的，但是它不能声明泛型方法。
>
> 即：`StringValue`也不能声明为泛型，因为我们在结构体上设计了之后，在创建的时候我们不知道用户需要什么作为`T`

## 面试要点

-   **能不能重复读取`HTTP`协议的`Body`内容？**，原生`API`是不可以的。但是我们可以封装来允许重复读取，核心步骤就是将`Body`的内容读取之后存到一个地方，后续都从这个地方读取。

-   能不能修改`HTTP`协议的响应？,原生`API`不可以。但是我们可以使用`RespData`机制，在最后再把数据刷新到网络中，在刷新之前，都是可以修改的。

-   `Form`和`PostForm`的区别：前者包揽后者，正常情况下你的`API`优先使用`Form`就不太可能出错。

-   `Web`框架是怎么支持路径参数的？`Web`框架在发现匹配上了某个路径参数之后，将这段路径记录下来作为路径参数的值，这个值默认是`string`类型，用户自己有需要就可以转化为不同的类型。

    -   路由核心代码

    -   ```go
        func (r *router) findRoute(method string, path string) (*matchInfo, bool) {
        	// 沿着树深度遍历查找下去
        	root, ok := r.trees[method]
        	if !ok {
        		return nil, false
        	}
        	// 如果是根节点直接返回
        	if path == "/" {
        		return &matchInfo{n: root}, true
        	}
        	// 把前置和后置的 / 去掉
        	path = strings.Trim(path, "/")
        	// 按照 / 切割
        	segs := strings.Split(path, "/")
        	// 构造 pathParams
        	var pathParams map[string]string
        	for _, seg := range segs {
        		child, paramChild, found := root.childOf(seg)
        		if !found {
        			return nil, false
        		}
        		// 命中了路径参数
        		if paramChild {
        			if pathParams == nil {
        				pathParams = make(map[string]string)
        			}
        			// path 是 :id 这种形式
        			pathParams[child.path[1:]] = seg
        		}
        		root = child
        	}

        	// 代表我确实有这个节点
        	// 但是节点是不是用户注册的业务逻辑 有 handler 的 就不一定了
        	//return root, root.handler != nil
        	return &matchInfo{
        		n:          root,
        		pathParams: pathParams,
        	}, true
        }
        ```
