---
title: web框架核心-Server
date: 2023-04-09 00:31:15
category: GoCore
---

# web 核心-Server

## web 核心

对于一个`web`框架来说，至少要提供三个抽象：

-   **代表服务器的抽象**，这里称之为`Server`
-   **代表上下文的抽象**，这里称之为`Context`
-   **路由树**

## Server

> 整体代表服务器的一个抽象，至少提供 3 部分功能

-   生命周期控制：启动、关闭，或者有回调特性
-   路由注册接口：提供路由注册功能
-   作为`http`包到`web`框架的桥梁

### `http.Handler`接口

`http`包暴露了一个接口：`Handler`,它是我们引入自定义`web`框架相关的连接点。

```go
func ListenAndServe(addr string, handler Handler) error {
    server := &Server{Addr: addr, Handler: handler}
    return server.ListenAndServe()
}
```

#### 定义版本一：只组合`http.Handler`

优点：

-   用户在使用的时候只需要调用`http.ListenAndServer`就可以
-   和`HTTPS`协议完全无缝连接
-   极简设计

缺点：

-   难以控制生命周期，并且在控制生命周期的时候增加回调支持
-   缺乏控制力：如果将来希望支持优雅退出的功能，将难以支持

```go
type Server interface {
    http.Handler
}

// .....

var h Server
http.ListenAndServe(":8081", h)
```

#### 定义版本二：组合`http.Handler`并且增加`Start`方法

```go
type Server interface {
    http.Handler
    Start(addr string) error
}
```

优点：

-   `Server`既可以使用版本一的方法，又可以自己管理生命周期，自己启动
-   完全的控制

缺点：

-   如果用户需要支持`HTTPS`，就还需要`Server`提供`HTTPS`的支持

> 版本一和版本二都直接耦合了`Go`自带的`http`包，如果我们希望切换为`fasthttp`或者别的类似的包，就会非常困难。

> 在实现`Server`的接口的时候我们可以在最上面写一个
>
> `var _ Server = &HTTPServer{}`
>
> 确保`HTTPServer`都实现了`Server`的接口；如果下面实现方法改了名字，则编译会不通过，会确保一定实现了`Server`的接口的功效。

## Server-注册路由的 API 设计

大体上有两类方法：

-   针对任意方法的：如`gin`和`iris`的`Handle`方法，`Echo`的`Add`方法
-   针对不同`HTTP`方法的，这一类方法基本上都是委托给前一类的方法实现

> 所以实际上核心方法只有一个：`Handle`，名称可以自己定义

```go
var _ Server = &HTTPServer{}

type HandleFunc func(ctx Context) // 可以单独定义一个 Context

type Server interface {
    http.Handler
    Start(addr string) error
    AddRoute(method string, path string, handleFunc HandleFunc)
}
```

`AddRoute`方法：

-   `method`: 是`HTTP`方法
-   `path`: 是路由
-   `handleFunc`：是你的业务逻辑

加完了这个方法，我们就得去实现。

### Context

```go
type Context struct {
    Req *http.Request
    Resp http.ResponseWriter
}
```

```go
// ServerHTTP 处理请求的入口
func (h *HTTPServer) ServerHTTP(writer http.ResponseWriter, request *http.Request) {
    ctx := &Context {
        Req: request,
        Resp: writer,
    }

    h.serve(ctx)
}

func (h *HTTPServer) serve(ctx *Context) {
    // 下面就是查找路由，并且执行命中的业务逻辑
}
```

## 要点

-   HTTP 服务器的生命周期：启动、运行和关闭，在这三个阶段的前后都可以插入生命周期回调，一般面试都会问这个。比如如何实现`web`服务的服务发现？就是利用生命周期回调的启动后回调，将`web`服务注册到服务中心
-   `HTTP Server`功能：在不同的框架里有不同的叫法，但是基本功能都是**提供路由注册、生命周期控制以及与`http`包结合的桥梁**
