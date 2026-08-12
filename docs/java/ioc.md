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