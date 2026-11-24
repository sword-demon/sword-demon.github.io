---
title: 别等服务启动才看 SQL, 这个 IDEA 插件能帮你少走几步
description: 结合官方文档和作者介绍, 认识 MyBatis SQL Visualizer 的 Wrapper 静态预览, XML 动态 SQL, 运行期日志捕获与 MCP 工具, 也讲清版本要求, 执行前提和数据安全边界.
date: 2026-11-24
categories:
  - 开发工具
tags:
  - IntelliJ IDEA
  - MyBatis-Plus
  - SQL
  - MCP
---

# 别等服务启动才看 SQL, 这个 IDEA 插件能帮你少走几步

写 Java 后端, 经常会碰到这样一个小问题.

Wrapper 的条件改好了, 但你想确认的不是 Java 代码有没有语法错误, 而是另一件事:

**这段代码, 最后到底会拼出什么 SQL?**

某个可选条件有没有生效? `AND` 和 `OR` 的组合是不是预期的分组? 逻辑删除条件有没有带上? XML 里几个动态分支组合后, 会不会多出一个条件?

为了看清它, 往往还得启动服务, 调用接口, 翻日志, 再把 `Preparing:` 和 `Parameters:` 两行对起来.

今天介绍的 **MyBatis SQL Visualizer**, 就是在缩短这条路径. 官方文档和部分界面中也使用 **SQL Visualizer** 这个名称, 安装时搜索前者即可.

它不只是一个日志美化器. 更值得关注的是, 它把写代码时的 SQL 预览和运行后的 SQL 排查, 放进了同一套 IDEA 工作流.

> 说明: 本文根据官方文档及作者公众号文章整理, 信息核对于 2026-11-24. 配图均为官方文档站的真实演示图片, 不是本文在本机安装后的实测截图. 功能与默认设置可能随版本变化, 请以所安装版本为准.

## 01. 先分清楚: 预览出来的 SQL, 不等于执行过的 SQL

这是理解这个插件最重要的一点.

**第一条路径, 是静态预览.**

插件分析项目里的 Wrapper, mapper XML, 注解或 JPA 查询, 生成可以查看, 填参和复制的 SQL. 这一步不要求启动 Spring 容器, 也不要求连接数据库.

它回答的是: 在当前源码, 映射配置和你提供的参数条件下, SQL 会是什么形态?

**第二条路径, 是运行期捕获.**

应用真正启动并执行 SQL 后, 插件再捕获语句, 参数等信息, 展示到 SQL 日志列表里.

它回答的是: 这次运行实际执行了什么, 带了什么参数, 执行过程有没有报错?

两条路径可以互相对照, 但不能互相冒充. 尤其是运行时由数据权限拦截器追加的条件, 静态预览不能天然知道.

## 02. 装好之后, 先拿一段 Wrapper 看效果

根据官方兼容说明, 插件要求 **IntelliJ IDEA 2024.3 及以上**, Community 和 Ultimate 均可使用基础能力. 预览面板内的 SQL 执行与 EXPLAIN, 则需要 **Ultimate + Database 插件 + 已配置的数据源**.

安装路径很直接:

1. 打开 `Settings / Preferences > Plugins > Marketplace`.
2. 搜索 `MyBatis SQL Visualizer`.
3. 核对作者为 `SongRenShuo`, 点击安装.
4. 首次安装后若没有看到入口, 重启一次 IDEA.

![官方安装截图: Marketplace 中的 MyBatis SQL Visualizer, 作者为 SongRenShuo](https://sql-visualizer.jvtools.cn/demo/install-marketplace.webp?v=20261123)

*图源: 官方快速开始文档. 插件搜索名, 作者和安装入口可在图中对照.*

无法使用在线市场时, 也可以从文末的 Gitee Releases 下载插件包, 在 `Plugins > 齿轮菜单 > Install Plugin from Disk...` 中选择安装, 不需要解压.

下面沿用官方快速开始里的例子. 前提是项目中实体的表名, 字段映射与文档示例一致:

```java
LambdaQueryWrapper<DeviceInfoEntity> wrapper = new LambdaQueryWrapper<DeviceInfoEntity>()
    .eq(DeviceInfoEntity::getId, 1001L)
    .isNotNull(DeviceInfoEntity::getStationId);
```

官方给出的对应 SQL 是:

```sql
SELECT id, station_id, share_scheme_id
FROM device_info_entity
WHERE id = 1001
    AND station_id IS NOT NULL
```

触发方式有两个:

- 点击 **Wrapper 变量声明行左侧** 的 gutter 图标.
- 把光标放到变量名或方法名等具体标识符上, 按 `Alt+Shift+Q`, macOS 对应 `Option+Shift+Q`.

一个容易踩的小坑: 光标停在行首空白处, 可能提示找不到可预览的 SQL 源. 链中间的 `.eq()`, `.ge()` 行也不是每行都有图标. 第一次使用, 直接点变量声明行的图标更省事.

![官方 Wrapper 预览界面: 左侧为动态条件, 右侧为生成的 SQL](https://sql-visualizer.jvtools.cn/demo/wrapper-preview.webp)

*图源: 官方 Wrapper 演示. 图中展示的是另一个查询, 用于说明条件面板与 SQL 预览的布局, 并非上面代码的运行结果.*

预览面板不只是展示文本. 对支持的布尔重载条件, 可以勾选或取消, 观察 SQL 如何变化; 对参数可以填值, LIKE 参数会按相应语义处理通配符. 项目使用 `@TableLogic` 时, 插件也有逻辑删除条件的预览支持.

这些功能最实用的场景, 是改完一条复杂查询后, **先核对 SQL 的形状, 再进入运行验证**.

## 03. 不写 Wrapper, XML 和 JPA 也有入口

不少项目并不是清一色的 MyBatis-Plus. 复杂查询留在 XML, 一部分模块使用 JPA, 都很常见.

对 mapper XML, 可以在 `<select>`, `<update>`, `<delete>`, `<insert>` 等语句标签所在行点击 gutter 图标, 打开动态 SQL 预览.

![官方 XML 动态 SQL 预览: 左侧切换条件并填写参数, 右侧显示 SQL](https://sql-visualizer.jvtools.cn/demo/xml-preview.webp)

*图源: 官方 XML 预览演示. 图中的参数框尚未填值, SQL 保留了问号占位符.*

与其在脑子里拼接几个动态分支, 不如在面板里切换条件, 补上参数, 直接检查组合后的语句. 注意, 手动选择的条件和填写的值是一次模拟输入, 不是插件读到了尚未运行的接口请求.

JPA / Hibernate 方面, 官方文档列出的入口包括 Repository 派生方法, `@Query`, HQL, Criteria 等. 例如看到 `findBy...` 这样的方法名时, 可以从方法声明处进入预览, 不必先启动容器才能理解查询形态.

JdbcTemplate 字符串 SQL, MPJ 联表等也有对应支持. 至于更多 ORM 写法, 官方有些明确标注为 MVP 阶段, 不宜把支持列表理解成所有边缘语法都能完整还原.

## 04. 服务跑起来后, 关键不是美化日志, 而是信息从哪里来

SQL 日志功能有两种捕获通道, 区别值得在安装前就知道.

### 增强捕获: 默认开启, 会介入本机应用 JVM

按当前官方说明, 增强捕获通过 Java agent 和字节码增强, 在本机应用的 JDBC 层采集信息.

因此, 它不依赖应用先把 SQL 和参数完整打印出来, 可以获取真实参数, 执行耗时, 影响行数, 报错信息及调用栈等结构化数据. 具体覆盖仍受驱动和挂载状态等条件影响.

**这里的关键前提是: 它不是完全不碰应用进程的纯文本工具.**

官方当前默认开启增强捕获, 无须逐次确认注入. 如果团队不允许对应用 JVM 做增强, 应先到设置页关闭, 再选择控制台捕获路线. 不要把不需要添加项目依赖, 理解成运行机制毫无介入.

### 控制台捕获: 不注入应用, 但依赖日志内容

这条路线监听运行控制台的日志输出, 例如 MyBatis 的 `Preparing:` / `Parameters:`, 再还原 SQL.

它的边界也很直观: 应用没有输出参数, 或参数被日志级别过滤, 插件就无法凭空补齐. 参数日志常需要开启相应 TRACE 级别; 日志只写入独立文件而不进入运行控制台, 也不能直接按这条路径捕获.

精确源码跳转同样要区分通道: 增强捕获可以使用真实调用栈, 控制台路线若要获得同样精度, 还需要按文档配置源码捕获拦截器.

![官方 SQL 日志演示: 运行控制台与 SQL Visualizer 日志列表](https://sql-visualizer.jvtools.cn/demo/sql-log.webp)

*图源: 官方 SQL 日志演示, 为官方示例工程界面. 不代表本文对驱动兼容性或采集完整性做过实测.*

使用时, 启动应用, 打开侧边栏 `SQL Visualizer > SQL 日志`, 点击工具栏的捕捉按钮, 再触发一次业务查询. 若已开启项目启动时自动监听, 则可自动开始捕捉.

当前文档还提供了几项实用能力:

- 按耗时排序或筛选慢查询, 默认慢查询阈值为 `1000 ms`, 可调整.
- 同结构 SQL 达到 3 条时出现聚类徽章, 可作为排查重复查询, N+1 问题的线索.
- 复制完整 SQL, 屏蔽心跳语句, 或按请求聚焦查看.
- 可选开启 SQL 历史保存, 便于后续检索和对比.

这些都是排查入口, 不是诊断结论. 出现同结构 SQL, 不一定就是 N+1; 没出现慢查询标记, 也不代表整体请求就快.

## 05. 从看见 SQL 到判断 SQL, 中间仍然隔着数据库

插件可以对 SQL 给出静态性能建议, 比如提醒缺少 WHERE, 前导通配符 LIKE, 过大的 OFFSET 等可疑形态.

但静态规则没有数据库统计信息, 也不知道当前数据分布. **提示可能有问题, 和证明存在性能问题, 是两回事.**

需要进一步判断时, 可以在预览面板点击执行计划入口, 按方言生成 EXPLAIN 请求, 交给数据库返回真实计划. 这一步需要前面提到的 Ultimate, Database 插件与可用数据源, 不再是离线预览.

对 UPDATE / DELETE, 官方还提供了预估影响行数能力, 通过只读 COUNT 查询试算. 它不是任何写语句都能算, JOIN 多表写, 无 WHERE 等形态会明确拒绝试算. 即使是只读查询, 也可能消耗数据库资源, 应优先在开发或测试数据源上验证.

最重要的是, 缺少有效过滤条件时的警告, **不是生产操作的安全兜底**. 插件提示之外, 仍然要自己确认目标库, 作用范围, 权限和备份.

顺带一提, 它也支持 SQL 反向转换为 MyBatis-Plus Java 代码: 可以选中 SQL 按 `Alt+Shift+J`, 或在 `SQL → Java` 页签粘贴. 这适合把已验证的语句带回代码, 但生成后仍需检查实体映射, 项目依赖与查询语义, 不能省略编译和测试.

## 06. 放到 AI 编程里, 它提供的是事实入口

这个工具出现在 AI 工具栏目里, 还有一个原因: 它提供 MCP 能力.

根据官方文档, 在 **IDEA 2025.2 及以上** 的内置 MCP Server 环境中, 插件注册了 **11 个 `sqlv_*` 工具**, 供支持 MCP 的 AI 编程客户端调用.

不必把工具名全部记下来, 先理解几个用途:

- `sqlv_render_sql`: 按源码位置或 XML 片段渲染 SQL, 不是证明这条 SQL 已执行过.
- `sqlv_schema_context`: 获取数据源中的表结构, 字段类型与注释.
- `sqlv_explain`: 对受支持的 SELECT 获取执行计划.
- `sqlv_check_sql`: 做静态写风险与类型核查.
- `sqlv_rollback_plan`: 生成回滚预案, 不代替你执行回滚.

这样, AI 不必只盯着源码猜表名和字段, 而是有机会拿到渲染结果, 真实元数据和数据库返回的计划, 再提出修改建议.

不过, 工具返回未发现风险, 不能翻译成操作安全. 作者原文就举过类似例子: `id > 0` 不属于恒真条件, 但对某些表来说, 它仍可能覆盖几乎全部记录. 静态规则没有业务数据分布, 人仍要判断范围.

还有一个容易混淆的边界:

**插件本地处理 SQL, 不等于接入外部 AI 后, 这些信息仍然只留在本机.**

一旦客户端把工具返回的 SQL, 表结构或参数送入模型上下文, 后续处理就取决于客户端和模型服务的配置与数据政策. 接入前应核对权限与允许外发的数据范围, 不要直接把生产敏感参数交出去.

## 07. 真正使用前, 还有三件事别误会

**第一, 静态预览不能完全复刻运行时.**

常量内联, 集合展开, 分页参数的表达形式可能与运行日志不同. 数据权限这类运行期改写, 更要回到实际捕获结果核对. 作者原文也明确指出, 当前 Kotlin Wrapper 还不能可靠还原, 不应据此承诺同等预览能力.

**第二, 参数看得见, 就要考虑脱敏和存储.**

当前文档说明, 增强捕获的真实参数默认不脱敏, 可在设置中开启采集侧打码. 展示与导出脱敏是另一个层面的开关, **不会改掉历史文件里已经保存的原值**. 开启历史保存, 截图或分享日志前, 都要检查敏感信息.

**第三, 这不是生产 APM.**

它主要服务于本机开发过程中的预览和排查, 不能替代服务端监控, 链路追踪, 数据库慢日志和团队的变更审核流程.

按作者原文介绍, 插件免费开源, 采用 Apache-2.0 协议. 官方隐私说明称, 插件不上传代码与 SQL 内容. 这些是作者对产品的说明, 不是本文做过网络审计后的结论.

## 最后, 先拿一条你最熟悉的查询试试

不必一开始就研究全部功能.

找一段你熟悉的 Wrapper 或 mapper XML, 先静态预览, 看条件和参数是否符合预期; 再在开发环境运行一次, 对照捕获到的 SQL; 如果发现性能疑点, 再连接测试数据源看执行计划.

这条使用顺序, 比单纯记住几个快捷键更重要:

**先看清会生成什么, 再核对实际执行什么, 最后判断为什么慢或为什么错.**

它能减少为了看一眼 SQL 而做的重复操作. 至于 SQL 是否正确, 权限是否合适, 数据能不能改, 最终仍然需要代码, 数据库和业务事实共同回答.

## 参考资料与入口

- [官方快速开始](https://sql-visualizer.jvtools.cn/guide/getting-started)
- [作者原文: 服务未启, SQL 先知: 一个把 Wrapper 变成 SQL 的 IDEA 插件](https://mp.weixin.qq.com/s/qlWxXJrMr1nD_NWyrCHfBg), 作者 SongRenShuo, 公众号 "编程路上的小宋同学", 发布于 2026-11-23.
- [官方版本兼容说明](https://sql-visualizer.jvtools.cn/guide/compatibility)
- [Wrapper 预览](https://sql-visualizer.jvtools.cn/features/wrapper-preview) / [XML 预览](https://sql-visualizer.jvtools.cn/features/xml-preview) / [JPA 预览](https://sql-visualizer.jvtools.cn/features/jpa-preview)
- [SQL 日志与捕获机制](https://sql-visualizer.jvtools.cn/features/sql-log)
- [SQL 反向转换](https://sql-visualizer.jvtools.cn/features/sql-to-java)
- [MCP 工具说明](https://sql-visualizer.jvtools.cn/features/mcp)
- [官方 FAQ](https://sql-visualizer.jvtools.cn/guide/faq) / [隐私说明](https://sql-visualizer.jvtools.cn/about/privacy)
- [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/33633-mybatis-sql-visualizer)
- [Gitee 源码与 Releases](https://gitee.com/songrenshuo/mybatis-plus-sql-visualizer)

本文为基于公开资料重新组织的工具介绍, 不冒充插件作者, 也未复刻原文全文. 图片版权归原作者所有, 均通过官方文档站原图链接引用; 正文示例取自官方快速开始, 发布时请保留来源说明.
