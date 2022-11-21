---
title: MybatisPlus 公共字段自动填充
date: 2022-11-20 21:39:10
category: Java
tag:
    - MyBatisPlus
---

# MybatisPlus 公共字段自动填充

::: info
在插入或者更新的时候为指定字段赋值，使用它的好处是可以统一对这些字段进行处理，避免了重复代码。
:::

## 实现步骤

1.  在实体类的属性上加上`@TableField`注解，指定自动填充的策略
2.  按照框架要求编写元数据对象处理器，在此类中统一为公共字段赋值，此类需要实现`MetaObjectHandler`接口

```java
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 员工实体类
 */
@Data
public class Employee implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String username;

    private String name;

    private String password;

    private String phone;

    private String sex;

    private String idNumber; // 身份证号码 表里是 id_number

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createUser;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateUser;
}
```

自定义元数据处理器

```java
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

/**
 * 自定义元数据对象处理器
 */
@Component
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("insertFill: {}", metaObject.toString());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("updateFill: {}", metaObject.toString());
    }
}

```

我们还需要获取额外的一个创建者的数据，所以我们需要先确认一件事情，就是客户端每次发送的`http`请求，对应的在服务端都会分配一个新的线程来处理，在处理过程中涉及到过滤器、控制器、以及元数据处理器等类中的方法都属于同一个线程，可以分别在几个内容里中加上获取线程 id 的代码

```java
long id = Thread.currentThread().getId();
log.info("线程id为: {}", id);
```

执行编辑或者插入操作，观察控制台输出可以发现，一次请求对应的线程 id 是相同的。

![image-20221120210601523](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221120210601523.png)

`ThreadLocal`并不是一个`Thread`，而是`Thread`的局部变量。当使用`ThreadLocal`维护变量时，`ThreadLocal`为每个使用该变量的线程提供独立的变量副本，所以每个线程都可以独立地改变自己的副本，而不影响其他线程所对应的副本。`ThreadLocal`为每个线程提供单独一份存储空间，具有线程隔离的效果，只有在线程内才能获取到对应的值，线程外则不能访问。

`ThreadLocal`常用方法：

-   `public void set(T value)`：设置当前线程的线程局部变量的值
-   `public T get()`：返回当前线程所对应的线程局部变量的值

::: tip
所以我们可以在登录过滤器的`doFilter`方法中获取当前登录用户的`id`，并调用`ThreadLocal`的`set`方法来设置当前线程的局部变量的值，因为他们是属于同一个线程，然后最终在元数据处理器中的`updateFill`方法中使用`ThreadLocal`的`get`方法来获取当前线程所对应的线程局部变量的值
:::

### 功能完善

1.  编写`BseContext`工具类，基于`ThreadLocal`封装的工具类
2.  在登录过滤器中的`doFilter`方法中调用`BaseContext`来设置当前登录用户的 id
3.  在元数据处理器的方法中调用`BaseContext`获取登录用户的 id

```java
/**
 * 基于ThreadLocal封装的工具类，用于保存和获取当前登录的用户id
 */
public class BaseContext {
    private static ThreadLocal<Long> threadLocal = new ThreadLocal<>();

    public static void setCurrentId(Long id) {
        threadLocal.set(id);
    }

    public static Long getCurrentId() {
        return threadLocal.get();
    }
}

```

```java
@Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 1. 获取本次请求的URI
        String requestURI = request.getRequestURI();

        log.info("当前请求: {}", requestURI);

        // 不需要处理的请求
        String[] urls = new String[]{
                "/backend/**",
                "/employee/login",
                "/employee/logout",
                "/front/**"
        };
        // 2. 判断本次请求是否需要处理
        boolean check = check(urls, requestURI);
        // 3. 如果不需要处理，则直接放行
        if (check) {
            log.info("本次请求{}不需要处理", requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        // 4. 判断登录状态，如果已登录，则直接放行
        if (request.getSession().getAttribute("employee") != null) {
            log.info("用户已登录, 用户id为: {}", request.getSession().getAttribute("employee"));

            Long empId = (Long) request.getSession().getAttribute("employee");
            BaseContext.setCurrentId(empId);

            filterChain.doFilter(request, response);
            return;
        }

        log.info("用户未登录");
        // 5. 如果未登录，则返回未登录结果
        response.getWriter().write(JSON.toJSONString(R.error("NOTLOGIN")));
        return;
    }
```

```java
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 自定义元数据对象处理器
 */
@Component
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {

    /**
     * 插入操作自动填充
     *
     * @param metaObject
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("insertFill: {}", metaObject.toString());
        metaObject.setValue("createTime", LocalDateTime.now());
        metaObject.setValue("updateTime", LocalDateTime.now());
        metaObject.setValue("createUser", BaseContext.getCurrentId());
        metaObject.setValue("updateUser", BaseContext.getCurrentId());
    }

    /**
     * 更新修改操作自动填充
     *
     * @param metaObject
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("updateFill: {}", metaObject.toString());
        long id = Thread.currentThread().getId();
        log.info("线程id为: {}", id);
        metaObject.setValue("updateTime", LocalDateTime.now());
        metaObject.setValue("updateUser", BaseContext.getCurrentId());
    }
}

```

## mybatis-plus 配置分页插件

```java
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 配置MP的分页插件
 */
@Configuration
public class MyBatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        return interceptor;
    }
}

```
