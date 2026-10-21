---
title: Spring核心是IOC容器
date: 2026-08-10 00:00:00
---

# Spring 核心 IOC 容器

> 面向对象的软件设计是由`x`个对象组成，且对象之间彼此合作来完成某个功能。

`IOC`将对象的创建、依赖关系的管理和生命周期的控制从应用程序代码中解耦出来。



## 核心设计：依赖注入

- 对象 A 有 2 个属性(依赖)对象，需要 `setD、E`
- 依赖注入式基于反射实现的

## IOC 容器的设计

### Spring IOC 容器使用的是什么数据结构来存储`Bean(Object)`？

找到源码：`BeanDefinitionRegistry.java`的方法`getBeanDefinitionCount()`

打开任意一个实现类：`DefaultListableBeanFactory.java`，然后可以点击`beanDefinitionMap`，就可以清晰的看到它是用一个`ConcurrentHashMap`来存储的

### 如何获取 Spring 容器

定义一个`IStorageService`接口，存储服务接口定义

```java
public interface IStorageService {
  Object findAccountByUsername(String username);
}
```

再定义一个`IAccountService.java`，账户服务接口定义

```java
public interface IAccountService {
  void queryAccountInfo(String username);
}
```

然后再定义他们的实现代码

```java
@Slf4j
@Service
public class StorageServiceImpl implements IStorageService {
  	
  @Override
  public Object findAccountByUsername(String username) {
    return "无解的游戏";
  }
}
```

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements IAccountService {
  
  /** 注入存储服务 bean */
  private final IStorageService storageService;
  
  @Override
  public void queryAccountInfo(String username) {
    storageService.findAccountByUsername(username);
  }
}
```

`@RequiredArgsConstructor`注解可以替换`@Autowired`或者`@Resource`注解。

再编写一个代码来获取容器

方式 A：

```java
@Component
public class XxxApplicationContextUtilsA implements ApplicationContextAware {
  
  private static ApplicationContext context;
  
  @Override
  public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
    if (Objects.isNull(context)) {
      context = applicationContext;
      // TODO: 做一些其他的事情
    }
  }
  
  public static ApplicationContext getContext() {
    return context;
  }
}
```

方式 B：实现一个监听器，监听容器的刷新事件，容器在启动完成之后会有一个刷新事件

```java
@Component // 标注为 IOC 的 bean
public class XxxApplicationContextUtilsB implements ApplicationListener<ContextRefreshedEvent> {
  
  private static ApplicationContext context;
  
  @Override
  public void onApplicationEvent(ContextRefreshedEvent event) {
    if (Objects.isNull(context)) {
      context = event.getApplicationContext();
    }
  }
  
  // 可以再定义一个静态方法，返回获取到的 context 对象
}
```

## 启发

1. 工程业务开发需要合适的数据结构
2. 学会代码封装，把一类信息放在一个`java`类中



## Spring Security 技能解析

### 认证与授权

#### 认证

- 验证用户的身份，判断用户是否合法
- 支持多种认证方式，如表单登录、HTTP 基本认证、OAuth2 认证等

#### 授权

- 根据用户的角色和权限，决定用户是否有权限访问某个资源
- 使用基于角色的访问控制 RBAC模型来实现授权管理

### 核心组件

- SecurityFilterChain
  - 定义了 Spring Security 的过滤器链，对请求进行拦截和处理
- AuthenticationManager
  - 负责用户的认证操作，调用`UserDetailService`加载用户信息
- `UserDetailService`
  - 用于加载用户信息，实现该接口可以自定义用户信息的加载方式

### 密码加密

使用`Spring Security`提供的密码编码器，如`BCryptPasswordEncoder`对用户密码进行加密，提高密码的安全性。

### 防止 CSRF 攻击

Spring Security 提供了内置的 CSRF 的保护机制

### 

## SpringBoot 技能解析

### 自动配置原理

- 解释 SpringBoot 如何通过自动配置机制，根据项目的依赖和配置文件，自动配置`spring`应用的各种组件

### 起步依赖

各种起步依赖，如：

- spring-boot-starter-web
- `spring-boot-starter-data-jpa`

方便快速搭建项目

### 配置文件管理

- 使用`application.properties`或者`application.yml`配置文件来配置`SpringBoot`应用的各种属性
- 支持多环境配置，如开发环境、测试环境、生产环境

### 嵌入式服务器

SpringBoot 支持嵌入式服务器，如`Tomcat`、`Jetty`等，可以将应用打包成可执行的`JAR`文件，方便部署和运行。

### Actuator 监控

使用`SpringBoot Actuator`对应用的运行状态进行监控，如查看应用的监控状态、内存使用情况、线程信息等。



