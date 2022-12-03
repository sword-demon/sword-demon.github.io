---
title: 统一异常拦截
date: 2022-12-03 23:14:10
category: Java
tag:
    - RestControllerAdvice
---

# 统一异常拦截

使用`@RestControllerAdvice`或者`@ControllerAdvice`注解来实现

> 同样使用前面定义的统一的响应实体来进行返回内容

## 实现代码

先在控制器层，简单使用 2 个异常来来抛出测试

```java
@GetMapping("/test")
public String test(HttpServletRequest request) throws ClassNotFoundException {
    String t = request.getParameter("t");
    if (t.equals("1")) {
        throw new ClassNotFoundException("exception 1");
    } else {
        throw new ClassFormatException("exception 2");
    }
}
```

### 实现拦截

```java
import org.apache.tomcat.util.bcel.classfile.ClassFormatException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import top.wjstar.model.Result;

@RestControllerAdvice
public class ExceptionHandle {

    @ExceptionHandler(ClassNotFoundException.class)
    public Result handler(Exception e) {
        return new Result("error", e.getMessage() + " " + e.getClass().getName());
    }

    @ExceptionHandler(ClassFormatException.class)
    public Result handler2(Exception e) {
        return new Result("error", e.getMessage() + " " + e.getClass().getName());
    }
}

```

这里可以写多个或者一个，一个就直接写`Exception`就可以【懒惰写法】。

![image-20221203224739477](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221203224739477.png)
