---
title: Spring核心
description: Spring核心
date: 2026-06-22 22:39:10
---

# Spring 核心技能解析

## IOC 控制反转 与 DI 依赖注入

### 说人话

你开了一家奶茶店。以前你要自己去菜市场买珍珠、买奶、买茶叶，然后自己组装成一杯奶茶——这就是**你自己控制依赖**。

现在你请了一个供应商（Spring 容器），你只需要跟他说："我要珍珠、奶、茶叶"，他就帮你准备好，直接送到你手上——这就是**控制反转（IOC）**。

至于供应商怎么把原料送给你（是放门口、还是直接放到你操作台上），这个"递送方式"就是**依赖注入（DI）**。

简单来说：

- **IOC**：你不再自己 `new` 对象了，Spring 帮你创建和管理
- **DI**：Spring 把你需要的对象"注入"进来（通过构造器、Setter、字段注解）

### 没有 Spring 的写法（强耦合）

```java
public class OrderService {
    // 你自己 new，跟 MySQLOrderDao 绑死了
    // 想换成 Redis 存储？改代码吧...
    private OrderDao orderDao = new MySQLOrderDao();

    public void createOrder(Order order) {
        orderDao.save(order);
    }
}
```

问题很明显：`OrderService` 直接依赖了 `MySQLOrderDao` 的具体实现。如果哪天要换成 MongoDB，你得改 `OrderService` 的代码。违反了"开闭原则"。

### 用了 Spring 之后（松耦合）

```java
@Service
public class OrderService {
    private final OrderDao orderDao;

    // 构造器注入：Spring 自动把 OrderDao 的实现塞进来
    @Autowired
    public OrderService(OrderDao orderDao) {
        this.orderDao = orderDao;
    }

    public void createOrder(Order order) {
        orderDao.save(order);
    }
}

// 只需要标记为 @Repository，Spring 就知道这是 OrderDao 的实现
@Repository
public class MySQLOrderDao implements OrderDao {
    @Override
    public void save(Order order) {
        // MySQL 存储逻辑
    }
}
```

想换成 MongoDB？加一个实现类 + 把 `@Repository` 移过去就行，`OrderService` **一行都不用改**。

### 三种注入方式对比

| 方式        | 写法                        | 推荐程度     | 原因                      |
| ----------- | --------------------------- | ------------ | ------------------------- |
| 构造器注入  | `@Autowired` 在构造方法上   | 最推荐       | 依赖不可变、方便单测 mock |
| Setter 注入 | `@Autowired` 在 setter 上   | 可选依赖时用 | 允许后续更换依赖          |
| 字段注入    | `@Autowired` 直接加在字段上 | 不推荐       | 无法 final、单测不友好    |

```java
// 字段注入（简洁但不推荐）
@Service
public class UserService {
    @Autowired
    private UserRepository userRepo; // 不能 final，反射注入
}

// 构造器注入（推荐写法）
@Service
public class UserService {
    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) { // Spring 4.3+ 单构造器可省略 @Autowired
        this.userRepo = userRepo;
    }
}
```

---

## AOP：面向切面编程

### 说人话

你写了 50 个 Service 方法，现在老板说："每个方法调用前后都要打日志"。

笨办法：挨个方法加两行 `log.info()`。50 个方法，100 行重复代码，恶心不恶心？

AOP 的思路：**你别管那 50 个方法了，我帮你"横切"一刀，所有匹配的方法调用时，自动执行你的日志逻辑**。

类比：你家小区门口有个保安（切面），不管谁进出（连接点），都要刷卡登记（通知）。住户不需要自己记录进出日志，保安统一搞定。

### 核心概念一句话

| 术语                | 一句话解释                         | 类比                       |
| ------------------- | ---------------------------------- | -------------------------- |
| Aspect（切面）      | 把增强逻辑打包成一个模块           | 保安亭                     |
| Advice（通知）      | 在什么时机执行（前/后/环绕）       | 保安的动作：检查/放行/拦截 |
| Pointcut（切点）    | 对哪些方法生效                     | 哪些人需要被检查           |
| JoinPoint（连接点） | 程序执行的某个点（通常是方法调用） | 具体某个人走到门口         |

### 实战：统一日志切面

```java
@Aspect
@Component
public class LogAspect {

    // 切点：com.example.service 包下所有类的所有方法
    @Pointcut("execution(* com.example.service..*.*(..))")
    public void serviceLayer() {}

    // 环绕通知：方法执行前后都能插手
    @Around("serviceLayer()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        log.info("[调用] {}, 参数: {}", methodName, Arrays.toString(args));

        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed(); // 执行原方法
        long cost = System.currentTimeMillis() - start;

        log.info("[返回] {}, 耗时: {}ms, 结果: {}", methodName, cost, result);
        return result;
    }
}
```

效果：`service` 包下的任何方法被调用时，自动打印入参、出参和耗时。**业务代码零侵入**。

### 实战：接口限流切面

```java
@Aspect
@Component
public class RateLimitAspect {

    private final Map<String, Long> lastCallTime = new ConcurrentHashMap<>();

    // 自定义注解作为切点
    @Around("@annotation(rateLimit)")
    public Object limit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String key = joinPoint.getSignature().toString();
        long now = System.currentTimeMillis();
        long interval = rateLimit.interval();

        Long last = lastCallTime.get(key);
        if (last != null && (now - last) < interval) {
            throw new RuntimeException("请求太频繁，请稍后再试");
        }

        lastCallTime.put(key, now);
        return joinPoint.proceed();
    }
}

// 使用：加个注解就有限流能力
@RateLimit(interval = 1000) // 1秒内只允许调用一次
@GetMapping("/sms/send")
public Result sendSms(@RequestParam String phone) {
    // 发短信逻辑...
}
```

### AOP 底层原理（面试爱问）

Spring AOP 本质是**动态代理**：

- 目标类实现了接口 → 用 **JDK 动态代理**（基于 `Proxy` + `InvocationHandler`）
- 目标类没有接口 → 用 **CGLIB**（生成目标类的子类）

```
调用流程：
客户端 → 代理对象 → 前置通知 → 目标方法 → 后置通知 → 返回结果
                  ↘ 异常通知（如果抛异常）
```

---

## 事务管理

### 说人话

你在银行转账：A 给 B 转 100 块。这里有两步操作：

1. A 账户 -100
2. B 账户 +100

如果第 1 步成功了、第 2 步挂了——A 的钱扣了但 B 没收到，钱"消失"了。

**事务就是保证这两步要么都成功，要么都回滚**。Spring 让你不用手动写 `try-catch-rollback`，一个注解搞定。

### 最简单的用法

```java
@Service
public class TransferService {

    @Autowired
    private AccountRepository accountRepo;

    @Transactional // 这一个注解 = 开启事务 + 异常自动回滚
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        Account from = accountRepo.findById(fromId).orElseThrow();
        Account to = accountRepo.findById(toId).orElseThrow();

        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));

        accountRepo.save(from);
        accountRepo.save(to); // 如果这里抛异常，from 的扣款也会回滚
    }
}
```

### @Transactional 的坑（面试高频）

#### 坑 1：自调用失效

```java
@Service
public class OrderService {

    public void createOrder(Order order) {
        // 同一个类内部调用，事务不生效！！
        // 因为没经过代理对象，直接走的 this
        this.saveOrder(order);
    }

    @Transactional
    public void saveOrder(Order order) {
        // 以为有事务保护？并没有
        orderRepo.save(order);
        // 这里抛异常，不会回滚！
    }
}
```

**解决方案**：注入自身 or 拆成两个类 or 使用 `AopContext.currentProxy()`。

#### 坑 2：异常类型不对

```java
@Transactional // 默认只回滚 RuntimeException 和 Error
public void doSomething() throws IOException {
    // 抛 IOException（checked exception）→ 不会回滚！
    throw new IOException("文件读取失败");
}

// 正确写法：指定回滚的异常类型
@Transactional(rollbackFor = Exception.class)
public void doSomething() throws IOException {
    throw new IOException("现在会回滚了");
}
```

#### 坑 3：方法不是 public

```java
@Transactional
private void internalMethod() { // 事务不生效！必须是 public
    // ...
}
```

### 事务传播行为（7 种，记住 3 种就够用）

| 传播行为         | 说人话                         | 典型场景                             |
| ---------------- | ------------------------------ | ------------------------------------ |
| REQUIRED（默认） | 有事务就加入，没有就新建       | 绝大多数业务方法                     |
| REQUIRES_NEW     | 无论如何都新建一个独立事务     | 记录操作日志（不管主业务成败都要记） |
| NOT_SUPPORTED    | 挂起当前事务，以非事务方式执行 | 查询大量数据（避免长事务）           |

```java
@Service
public class AuditService {

    // 即使外层事务回滚，审计日志也要保留
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String detail) {
        auditRepo.save(new AuditLog(action, detail, LocalDateTime.now()));
    }
}
```

---

## Bean 的生命周期（加分项）

### 说人话

一个 Bean 从出生到死亡，Spring 在各个阶段都给你"钩子"来插手：

```
实例化（new）→ 属性注入 → 初始化 → 使用 → 销毁
```

### 完整生命周期

```java
@Component
public class MyBean implements InitializingBean, DisposableBean {

    @Value("${app.name}")
    private String appName;

    // 1. 构造器（实例化）
    public MyBean() {
        System.out.println("1. 构造器执行，此时 appName = " + appName); // null！属性还没注入
    }

    // 2. 属性注入完成后
    @PostConstruct
    public void init() {
        System.out.println("2. @PostConstruct，appName = " + appName); // 有值了
    }

    // 3. InitializingBean 接口回调
    @Override
    public void afterPropertiesSet() {
        System.out.println("3. afterPropertiesSet");
    }

    // 4. 容器关闭时
    @PreDestroy
    public void cleanup() {
        System.out.println("4. @PreDestroy，释放资源");
    }

    @Override
    public void destroy() {
        System.out.println("5. DisposableBean.destroy");
    }
}
```

---

## 常见面试追问

| 问题                                 | 要点                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `@Component` 和 `@Bean` 的区别？     | `@Component` 标在类上自动扫描；`@Bean` 标在方法上手动注册（适合第三方库的类） |
| Spring 怎么解决循环依赖？            | 三级缓存：`singletonObjects` → `earlySingletonObjects` → `singletonFactories` |
| `@Autowired` 和 `@Resource` 的区别？ | `@Autowired` 按类型注入（Spring）；`@Resource` 按名称注入（JSR-250 标准）     |
| Bean 默认是单例还是多例？            | 单例（`@Scope("singleton")`），需要多例时用 `@Scope("prototype")`             |
| `@Transactional` 底层怎么实现的？    | AOP + 动态代理，代理对象在方法前后管理事务的开启/提交/回滚                    |

