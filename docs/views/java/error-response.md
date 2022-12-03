---
title: Error统一处理
date: 2022-12-03 23:15:10
category: Java
tag:
    - ErrorController
---

# Error 统一处理

`SpringBoot`为我们实现了一个统一的一个错误页面，就是大家常见的那个页面，我们可以自己实现，写成自己想要的样子。

## 自己实现错误页面

首先先定义一个统一响应的模型，简陋的写一下

```java
public class Result {

    private String status;
    private Object result;

    public Result(String status, Object result) {
        this.status = status;
        this.result = result;
    }

    public Result() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Object getResult() {
        return result;
    }

    public void setResult(Object result) {
        this.result = result;
    }
}

```

然后定义一个`ErrorHandler`去实现`ErrorController`它里面的方法

```java
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import top.wjstar.model.Result;

import javax.servlet.http.HttpServletResponse;

@RestController
public class ErrorHandler implements ErrorController {

    @RequestMapping("/error")
    public Result error(HttpServletResponse response) {
        return new Result("error", "http code: " + response.getStatus());
    }

    /**
     * @deprecated
     */
    @Override
    public String getErrorPath() {
        return "/error";
    }
}

```

简单运行效果如下：

![image-20221203223647803](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221203223647803.png)
