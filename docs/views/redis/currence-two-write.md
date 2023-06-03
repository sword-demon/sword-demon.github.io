---
title: 如何避免高并发场景下数据不一致性
date: 2023-01-08 14:54:10
category: Redis
tag:
    - cocurrence
---

# 如何避免高并发场景下数据不一致性

## 双写一致性

```mermaid
graph TD;
	A(a = 2)
	B(Redis a = 1)
	C(MySQL a = 1)
	A --> B
	A --> C
```

当我们更新数据库的时候同时也把`redis`中的数据更新，这是正常情况。

```mermaid
graph TD
	A((开始))
	B{redis中是否存在}
	C(MySQL获取数据)
	D{MySQL中是否存在}
	E(同步redis)
	F(返回数据)
	G((结束))
	A --> B
	B -- 不存在 --> C
	B -- 存在 --> F
	F --> G
	C --> D
	D -- 不存在 --> F
	D -- 存在 --> E
	E --> F

```

假如在写入`redis`有延迟，就会造成数据不一致

### 解决

-   不考虑高并发时，使用锁就可以彻底解决问题，锁会把高并发串行化，但是效率就达不到了
-   先更新数据库，后更新缓存
-   先更新缓存，后更新数据库
-   先删除缓存，后更新数据库
-   先更新数据库，后删除缓存
-   更新数据库效率远远大于读取数据库 s，发生概率大

**cache aside pattern** + 延迟双删