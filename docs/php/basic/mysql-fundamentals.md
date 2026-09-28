---
title: MySQL 必考题与实战优化
date: 2026-09-29 14:30:00
categories: [面试，PHP]
tags: [MySQL, 索引优化，事务，锁机制]
sidebarSort: 2
---

# MySQL 必考题与实战优化（编号 81-110）

## 索引优化实战（81-90）

### 81. EXPLAIN 分析慢查询

```sql
-- 示例慢查询
SELECT o.*, c.name as customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.created_at >= '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;

-- EXPLAIN 分析
EXPLAIN SELECT o.*, c.name as customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.created_at >= '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;

-- 预期输出关键指标：
type: ref (非 ALL)
rows: <10000 (越少越好)
Extra: Using index condition (避免 filesort)
```

**优化方案**：

```sql
-- 建立复合索引
CREATE INDEX idx_created_customer ON orders(created_at, customer_id);

-- 利用覆盖索引减少回表
SELECT o.id, o.total_amount
FROM orders o
WHERE o.created_at >= '2024-01-01';
```

### 82. 最左前缀原则实战

```sql
-- 索引定义
CREATE INDEX idx_abc ON table_a(a, b, c);

-- ✅ 命中索引的情况
SELECT * FROM table_a WHERE a = 1;              -- 命中
SELECT * FROM table_a WHERE a = 1 AND b = 2;   -- 命中
SELECT * FROM table_a WHERE a = 1 AND b = 2 AND c = 3; -- 命中

-- ❌ 未命中或 partial 命中的情况
SELECT * FROM table_a WHERE b = 2;             -- 不命中（缺少 a）
SELECT * FROM table_a WHERE b = 2 AND c = 3;  -- 不命中
SELECT * FROM table_a WHERE c = 3;            -- 不命中

-- ⚠️ 范围查询后失效
SELECT * FROM table_a WHERE a > 1 AND b = 2;  -- b 索引失效
```

### 83. 索引下推（Index Condition Pushdown）

```sql
-- MySQL 5.6+ 特性
CREATE INDEX idx_name ON users(last_name, first_name);

-- 查询条件
SELECT * FROM users WHERE last_name = '张' AND first_name LIKE '小%';

-- 优化前：存储引擎返回所有 last_name='张'的记录，MySQL Server 层过滤
-- 优化后：存储引擎层直接过滤 first_name LIKE '小%'，减少回表次数
```

### 84. 覆盖索引设计

```php
// ❌ 回表查询（需要查主键索引）
SELECT user_id, name FROM users WHERE email = 'test@test.com';
-- 先查唯一索引，再回主键索引取 user_id 和 name

// ✅ 覆盖索引（无需回表）
CREATE INDEX idx_email_covering ON users(email, user_id, name);

SELECT user_id, name FROM users WHERE email = 'test@test.com';
-- 只需查 idx_email_covering 一个索引即可
```

### 85. 前缀索引节省空间

```sql
-- 长文本字段建索引
ALTER TABLE articles ADD INDEX idx_title_prefix (title(50));

-- 适用场景：
✅ 字符串很长但区分度足够（如 name、description）
❌ 区分度低的字段（如 sex、status）

-- 检查索引选择性
SELECT COUNT(DISTINCT LEFT(email, 10)) / COUNT(*) AS selectivity
FROM users;
-- > 0.7 才值得建索引
```

### 86. 隐式类型转换坑

```sql
-- ❌ 字符串加引号导致索引失效
SELECT * FROM users WHERE phone = '13800138000';  -- phone 是 INT 类型

-- ✅ 正确写法
SELECT * FROM users WHERE phone = 13800138000;

-- 其他常见陷阱
user_id = '123'          -- user_id BIGINT → OK
created_at > '2024-01-01' -- DATETIME 会隐式转换 → ❌慢查询
price BETWEEN 10 AND 100 -- 数值范围 → ✅ OK
```

### 87. OR 条件优化

```sql
-- ❌ 低效：OR 导致全表扫描
SELECT * FROM users
WHERE email = 'a@test.com' OR phone = '13800138000';

-- ✅ 优化方案 1：UNION ALL
SELECT * FROM users WHERE email = 'a@test.com'
UNION ALL
SELECT * FROM users WHERE phone = '13800138000';

-- ✅ 优化方案 2：联合索引
CREATE INDEX idx_email_phone ON users(email, phone);
```

### 88. LIMIT 优化

```sql
-- ❌ 深分页问题
SELECT * FROM orders LIMIT 1000000, 20;  -- 扫描 100 万 + 行

-- ✅ 延迟关联优化
SELECT o.*
FROM orders o
INNER JOIN (
    SELECT id FROM orders LIMIT 1000000, 20
) tmp ON o.id = tmp.id;

-- ✅ 游标法（更高效）
SELECT * FROM orders
WHERE id > 1234567  -- 上次最大 ID
LIMIT 20;
```

### 89. GROUP BY 优化

```sql
-- ❌ 低效：临时表 + filesort
SELECT department_id, COUNT(*)
FROM employees
GROUP BY department_id;

-- ✅ 索引分组
CREATE INDEX idx_dept ON employees(department_id);

-- ✅ SQL_MODE=ONLY_FULL_GROUP_BY 时明确聚合
SELECT department_id, COUNT(id) as cnt, MAX(salary)
FROM employees
GROUP BY department_id;

-- ✅ 使用窗口函数替代（MySQL 8.0+）
SELECT *, COUNT(*) OVER (PARTITION BY department_id) as total
FROM employees;
```

### 90. ORDER BY optimization

```sql
-- ❌ 排序字段无索引导致 filesort
SELECT * FROM products ORDER BY created_at DESC;

-- ✅ 添加索引
CREATE INDEX idx_created ON products(created_at DESC);

-- ✅ 利用索引顺序避免排序
SELECT * FROM products
WHERE category_id = 10
ORDER BY created_at DESC;
-- 如果有个索引是 (category_id, created_at)，就可以直接利用顺序
```

---

## 事务与锁（91-100）

### 91. 隔离级别对比

```php
// MySQL 默认：READ COMMITTED
DB::connection()->getPDO()->setAttribute(
    PDO::ATTR_ISOLATION_LEVEL,
    PDO::TRANSACTION_READ_COMMITTED
);

// 可重复读（RR） - InnoDB 默认
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

// 隔离级别对比表：
//           | RC       | RR       | SERIALIZABLE
// 脏读      | 不允许   | 不允许   | 不允许
// 不可重复读 | 允许     | 不允许   | 不允许
// 幻读      | 允许     | 部分阻止 | 阻止
```

### 92. 悲观锁 vs 乐观锁

```php
// 悲观锁（行锁）
$order = Order::lockForUpdate()
    ->where('id', $orderId)
    ->first();

if ($order->status === 'pending') {
    $order->update(['status' => 'processing']);
}

// 乐观锁（版本号）
class Order extends Model {
    public $timestamps = false;
    protected $versionColumn = 'version';
}

// 更新逻辑
DB::table('orders')
    ->where('id', $orderId)
    ->where('version', $oldVersion)  // 携带版本
    ->increment('stock', $quantity); // 同时增加版本
```

### 93. 死锁排查实战

```sql
-- 查看最近死锁信息
SHOW ENGINE INNODB STATUS\G

-- 关键字段：
*** (1) TRANSACTION:
Trx id counter 1234567
...
*** (1) HOLDS THE LOCK AND WAITS FOR A LOCK:
Lock wait: record lock before ...

*** (2) TRANSACTION:
Trx id counter 1234568
...
*** (2) HOLDS THE LOCK AND WAITS FOR A LOCK:
...

*** (1) DEADLOCK FOUND
```

**解决方案**：

```php
// 1. 统一访问顺序
DB::table('accounts')->lockForUpdate()->where('id', 1)->first();
DB::table('accounts')->lockForUpdate()->where('id', 2)->first();
// 永远按相同顺序锁资源

// 2. 缩短事务时间
DB::transaction(function () {
    $order = Order::find($id);
    // ✅ 只操作必要的数据库
    $order->update(['status' => 'paid']);
}); // 尽快提交

// 3. 索引优化避免间隙锁
```

### 94. 间隙锁（Gap Lock）理解

```sql
-- RR 隔离级别下的间隙锁
SELECT * FROM users WHERE id = 5 FOR UPDATE;
-- 不仅锁 id=5 这条记录，还锁住 (id<5, id>5) 的间隙

-- 影响：防止插入幻读
INSERT INTO users (id, name) VALUES (3, 'test');  -- 阻塞！
```

### 95. MVCC（多版本并发控制）

```markdown
MVCC 实现原理：
• Read View（读视图）：事务启动时生成的快照
• Undo Log：每个行的历史版本链表
• Next-Key Lock：临键锁（记录锁 + 间隙锁）

工作过程：

1. 开始事务 T1
2. 读取行 A，生成 Read View
3. 其他事务 T2 修改行 A（新版本可见，旧版本隐藏）
4. T1 仍然能看到旧版本的数据
```

### 96. 大事务问题处理

```php
// ❌ 错误：事务中包含 HTTP 请求
DB::transaction(function () {
    $order = Order::create($data);

    // 耗时操作！
    response()->fromExternalSystem($order->id); // 可能超时

    NotificationService::send($order); // 又耗时
});

// ✅ 正确：拆分事务
$order = Order::create($data);

// 异步队列处理
OrderCreated::dispatch($order->id);
```

### 97. 批量插入优化

```php
// ❌ 逐条插入（慢）
foreach ($users as $user) {
    User::create($user);
}

// ✅ 批量插入（快）
User::insert($users);  // Laravel ORM

// ✅ 更优：分批次
chunkById(User::query(), 1000, function ($users) {
    User::insert($users->toArray());
});

// 参数调优（my.cnf）
innodb_flush_log_at_trx_commit = 2  # 性能优先
innodb_buffer_pool_size = 70% RAM   # 缓存池
```

### 98. 锁等待超时设置

```sql
-- 查看当前配置
SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';

-- 调整超时时间（秒）
SET GLOBAL innodb_lock_wait_timeout = 50;

-- 应用层捕获异常
try {
    DB::transaction(function () {
        // 可能死锁的代码
    });
} catch (\Illuminate\Database\QueryException $e) {
    if ($e->getCode() == 1205) {  // Lock wait timeout
        Log::error('锁定超时，稍后重试');
        return retry(3, fn() => processAgain());
    }
}
```

### 99. 读写分离实践

```php
// Laravel 配置
'connections' => [
    'mysql' => [
        'read' => [
            'host' => ['slave1', 'slave2'],
        ],
        'write' => ['master'],
        'pdo' => [...],
    ],
],

// 使用
DB::connection('mysql')->statement('UPDATE ...');  // 走 master
$data = DB::connection('mysql')->select('SELECT ...'); // 自动走 slave
```

### 100. 主从复制延迟解决

```php
// 强制走主库的关键代码
$user = DB::connection('mysql')->enableReadOnly(false)
    ->selectOne('SELECT * FROM users WHERE id = ?', [$id]);

// 写操作后立即读
DB::transaction(function () use ($data) {
    $user = User::create($data);
    return $this->forceMaster()->getUser($user->id);
});

// 检测延迟
$sql = "SHOW SLAVE STATUS";
$delay = $result['Seconds_Behind_Master'];
if ($delay > 5) {
    // 触发告警
}
```

---

## 性能调优（101-110）

### 101. 慢查询定位

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  # 超过 1 秒的查询

-- 查看慢查询
SHOW FULL PROCESSLIST;  # 当前正在执行的查询

-- 分析工具
mysqldumpslow /var/log/mysql/slow.log  # 汇总分析
pt-query-digest /var/log/mysql/slow.log  # Percona 工具
```

### 102. 表结构设计规范

```php
// ✅ 推荐
Schema::create('orders', function (Blueprint $table) {
    $table->bigIncrements('id');                    // 自增主键
    $table->string('order_code', 32)->unique();     // 定长字符串
    $table->decimal('amount', 10, 2);               // 金额精确
    $table->dateTimeTz('created_at');               // 带时区
    $table->unsignedTinyInteger('status')->index(); // 状态字段
});

// ❌ 避免
Schema::create('users', function (Blueprint $table) {
    $table->string('bio', 1000);  // 太长应该放扩展表
    $table->json('preferences');  // JSON 无法索引
});
```

### 103. 字符集选择

```sql
-- ✅ 推荐使用 utf8mb4
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- emoji 支持
INSERT INTO messages (content) VALUES ('❤️🔥🎉');

-- 索引长度控制
CREATE INDEX idx_name (name(191));  -- utf8mb4 单字符 3 字节，191*3≈576<767
```

### 104. 连接池配置

```ini
# my.cnf
max_connections = 500                # 最大连接数
connect_timeout = 10                 # 连接超时
wait_timeout = 28800                 # 空闲超时
interactive_timeout = 28800
thread_cache_size = 100              # 线程池缓存
```

```php
// Laravel .env
DB_CONNECTION=mysql
DB_HOST=db.example.com
DB_PORT=3306
DB_DATABASE=myapp
DB_USERNAME=root
DB_PASSWORD=secret

# PDO 连接参数
DB_PERSISTENT=true  # 持久连接
```

### 105. 缓冲池优化

```ini
# 核心参数
innodb_buffer_pool_size = 物理内存的 70%
innodb_buffer_pool_instances = 8  # 越大并发越好
innodb_log_file_size = 512M       # 重做日志大小
innodb_flush_log_at_trx_commit = 2  # 性能优先（牺牲安全性）
```

### 106. 分区表策略

```sql
-- Range 分区（按时间）
CREATE TABLE orders (
    id INT NOT NULL,
    order_date DATE NOT NULL,
    amount DECIMAL(10,2)
) PARTITION BY RANGE (YEAR(order_date)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 好处：查询自动剪枝，删除历史数据只需 DROP PARTITION
```

### 107. 全文索引

```sql
-- MyISAM 或 InnoDB
ALTER TABLE articles ADD FULLTEXT INDEX ft_content (title, content);

-- 查询
SELECT * FROM articles
WHERE MATCH(title, content) AGAINST ('Laravel 教程' IN NATURAL LANGUAGE MODE);

-- MySQL 8.0+ 虚拟列全文索引
ALTER TABLE articles
ADD COLUMN full_content TEXT GENERATED ALWAYS AS (CONCAT(title, ' ', content));

ALTER TABLE articles ADD FULLTEXT INDEX ft_full (full_content);
```

### 108. 统计信息与执行计划

```sql
-- 更新统计信息
ANALYZE TABLE orders;

-- 估算行数
SHOW TABLE STATUS LIKE 'orders';

-- 重置优化器统计
RESET QUERY CACHE;
```

### 109. 在线 DDL 改进

```sql
-- MySQL 5.6+ 在线修改表结构
ALTER TABLE users ADD COLUMN avatar VARCHAR(255) ALGORITHM=INPLACE, LOCK=NONE;

-- 大表添加索引（异步）
ALTER TABLE orders ADD INDEX idx_status (status) ALGORITHM=INPLACE, LOCK=NONE;

-- 注意：DROP COLUMN 在旧版本会锁表，MySQL 8.0 已优化
```

### 110. 备份与恢复

```bash
# 逻辑备份
mysqldump --single-transaction --quick --routines --triggers \
  mydb > backup.sql

# 物理备份（Percona XtraBackup）
xtrabackup --backup --target-dir=/backup/full

# 恢复演练
# 定期测试备份文件的完整性
mysql < backup.sql
```

---

## 面试常见问题速查

| 问题                 | 关键词               | 参考答案要点                                        |
| -------------------- | -------------------- | --------------------------------------------------- |
| 什么是聚簇索引？     | 叶子节点存数据       | InnoDB 主键索引即聚簇索引，数据文件和索引文件一体   |
| B+ 树 vs B 树？      | 层次、查询稳定性     | B+ 树非叶子仅存索引，查询稳定；磁盘 IO 更少         |
| 如何优化慢查询？     | EXPLAIN、索引、改写  | 先分析执行计划，其次看索引覆盖，最后考虑改 SQL      |
| 什么是幻读？         | 同一查询两次结果不同 | RR 级别通过 MVCC+Next-Key Lock 基本解决             |
| Redo Log vs Binlog？ | 崩溃恢复/归档        | Redo 是物理日志保证 ACID，Binlog 是逻辑日志用于复制 |
| 什么时候不该建索引？ | 低频查询、写多读少   | 数据量少、频繁更新、低区分度的字段                  |

::: tip 记忆口诀
"索引三要素：最左原则、覆盖不要回表、OR 要慎用"
"事务四特性：原子一致性隔离持久性"
"锁四形态：共享排他间隙临键"

持续学习这些基础，遇到任何复杂问题都能快速定位！
:::
