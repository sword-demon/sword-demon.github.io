---
title: PHP 核心面试题
date: 2026-09-29 10:30:00
categories: [面试，PHP]
tags: [Laravel, PHP8, 面向对象，内存管理]
sidebarSort: 1
---

# PHP 核心面试题 (编号 1-50)

## 语言特性（1-15）

### 1. PHP 7 和 PHP 8 的主要新特性有哪些？

```php
// PHP 7.x
- Return type declarations (返回值类型声明)
- Scalar type declarations (标量类型声明)
- Nullable types (?string $name)
- Null coalescing operator ($value ?? 'default')

// PHP 8.x (重点)
- Typed properties in class (类属性类型提示)
- Constructor property promotion
- Named arguments (命名参数)
- Match expression (match 表达式)
- Union types (联合类型): function foo(int|string $data)
- Readonly classes/properties (只读类/属性)
- Attributes (注解): #[Route('/api/users')]
```

### 2. `__construct` 中能否调用其他方法？注意什么？

**正确示例**:

```php
class UserService {
    private UserRepository $repository;

    public function __construct(UserRepository $repository) {
        $this->repository = $repository;
        // ✅ 可以，但避免复杂逻辑
        $this->initializeCache();
    }

    private function initializeCache(): void {
        // 初始化缓存
    }
}
```

**⚠️ 注意事项**:

- 避免在构造函数中调用可能被 override 的方法
- 不要抛出异常（影响依赖注入容器）
- 避免复杂业务逻辑（违反单一职责原则）

### 3. Trait 的使用场景和潜在问题？

```php
trait Loggable {
    public function log(string $message): void {
        app('logger')->info($message);
    }
}

trait Timestampable {
    public static function bootTimestampable() {
        static::created(function ($model) {
            $model->updated_at = now();
        });
    }
}

class Order {
    use Loggable, Timestampable;

    // 方法冲突处理
    public function log(string $message): void {
        // 优先使用自己的实现
        parent::log('[Order] ' . $message);
    }
}
```

**潜在问题**:

- 同名方法冲突
- `$this` 上下文混淆
- 难以追踪方法来源

### 4. PHP 的类型系统详解

```php
// 标量类型
function process(int $id, string $name, bool $active, float $price): void {}

// 数组类型 (PHP 7.1+)
/** @return array<int, User> */
public function getUsers(): array {}

// 联合类型 (PHP 8.0+)
function sendEmail(string|MailObject $recipient): void {}

// 伪类型
/** @param mixed ...$args */
/** @template T */
class Repository {
    /** @return T|null */
    public function find(int $id): ?Model {}
}
```

### 5. 解释 PHP 的变量作用域和引用

```php
$var = 'global';

function test() {
    global $var;  // ❌ 不推荐
    // 或
    &$var = &${'var'};  // 引用全局变量

    $local = 'local';
}

// 引用传递
function increment(&$number): void {
    $number++;
}

$arr = [1, 2, 3];
array_walk($arr, function(&$item, $key) {
    $item *= 2;  // ✅ 修改原数组
});
```

### 6. 魔术方法实战

```php
class Model {
    protected array $attributes = [];

    public function __get(string $name): mixed {
        return $this->attributes[$name] ?? null;
    }

    public function __set(string $name, mixed $value): void {
        $this->attributes[$name] = $value;
    }

    public function __isset(string $name): bool {
        return isset($this->attributes[$name]);
    }

    public function __call(string $method, array $params): mixed {
        // 动态查询：User::findByEmail('test@test.com')
        if (str_starts_with($method, 'findBy')) {
            $field = lcfirst(substr($method, 6));
            return $this->queryByField($field, $params[0]);
        }
    }

    public function __invoke(...$params): mixed {
        // 使对象可调用：$user()
        return $this->execute();
    }
}
```

### 7. 闭包与匿名函数性能

```php
// ❌ 性能差：每次循环创建闭包
$items = collect([1, 2, 3]);
$result = $items->map(function($item) {
    return $item * 2;
});

// ✅ 推荐使用原生函数
$result = $items->map(fn($item) => $item * 2);

// 闭包性能优化
$closure = fn($data) => strtoupper($data);
for ($i = 0; $i < 1000; $i++) {
    $closure('test');  // 复用闭包实例
}
```

### 8. 生成器 (Generator) 的内存优势

```php
// ❌ 占用大量内存
function loadAllUsers() {
    return User::all();  // 一次性加载所有数据
}

// ✅ 惰性加载，节省内存
function loadUsersStream(): Generator {
    $users = User::cursor();  // 游标方式
    foreach ($users as $user) {
        yield $user;  // 逐个返回
        if (rand(1, 100) === 1) {
            gc_collect_cycles();  // 手动清理
        }
    }
}

// 使用
foreach (loadUsersStream() as $user) {
    processUser($user);
}
```

### 9. SplStack、SplQueue等标准类库

```php
// LIFO - 后进先出
$stack = new SplStack();
$stack->push(1);
$stack->push(2);
echo $stack->pop(); // 2

// FIFO - 先进先出
$queue = new SplQueue();
$queue->enqueue('first');
$queue->enqueue('second');
echo $queue->dequeue(); // first

// 有序集合
$sorted = new SplFixedArray(10);
```

### 10. Error Handling 最佳实践

```php
// PHP 7+: Throwable interface
try {
    $result = riskyOperation();
} catch (InvalidArgumentException $e) {
    logger()->error($e->getMessage());
    throw $e;  // 重新抛出
} catch (Throwable $e) {
    // 捕获所有未处理的异常
    report($e);
    abort(500);
}

// declare(strict_types=1);  // 启用严格类型检查
```

### 11. Type Hinting完整清单

```php
class UserService {
    // 类类型
    public function setUser(UserRepository $repo): void {}

    // 联合类型
    public function process(InputType|int|string $input): void {}

    // 回调类型
    /** @var callable(User): bool */
    public function filter(callable $callback): void {}

    // self/static
    public function clone(): static {
        return new static();
    }

    // Iterable (PHP 7.1+)
    /** @param iterable<User> $items */
    public function batch(iterable $items): void {}
}
```

### 12. 接口设计与实现

```php
interface PaymentInterface {
    public function pay(float $amount, array $options): PaymentResult;
    public function refund(string $transactionId): bool;
}

interface RepositoryInterface {
    /** @template T of Model */
    /** @return class-string<T> */
    public function model(): string;

    /** @param array<string, mixed> $where */
    public function where(array $conditions): QueryBuilder;

    public function create(array $data): Model;
}
```

### 13. 命名空间与自动加载

```php
namespace App\Services;

use App\Models\User;
use Psr\Container\ContainerInterface;

// PSR-4 自动加载规则:
// Composer.json
// "autoload": {
//     "psr-4": {
//         "App\\": "src/"
//     }
// }
```

### 14. 常量 vs 静态属性

```php
class Config {
    // 编译时常量
    const CACHE_TTL = 3600;
    public const API_VERSION = 'v1';

    // 运行时属性
    protected static array $settings = [];

    public static function getSetting(string $key): mixed {
        return self::$settings[$key] ?? null;
    }
}
```

### 15. 预处理与 JIT 编译

```bash
# 查看配置
php -i | grep jit

# PHP 8.0+ 开启 JIT (性能提升 10-20%)
# php.ini
opcache.jit_buffer_size = 128M
opcache.jit = 1255
```

## 面向对象（16-30）

### 16. 设计模式在 Laravel 中的应用

```php
// 🎯 工厂模式 - Factory
class OrderFactory extends BaseModelFactory {
    protected $model = Order::class;

    public function definition(): array {
        return [
            'user_id' => User::factory(),
            'total_amount' => rand(100, 10000),
        ];
    }
}

// 🎯 单例模式 - Service Provider
class PaymentServiceProvider extends ServiceProvider {
    public function register(): void {
        $this->app->singleton(PaymentGateway::class, function ($app) {
            return new AlipayGateway();
        });
    }
}

// 🎯 策略模式 - Payment Strategy
interface PaymentStrategy {
    public function execute(PaymentRequest $request): PaymentResponse;
}

class WechatPayStrategy implements PaymentStrategy {
    public function execute(PaymentRequest $request): PaymentResponse {
        // 微信支付逻辑
    }
}
```

### 17. 抽象类 vs 接口

```php
// 抽象类 - 提供通用实现
abstract class BaseController extends Controller {
    protected function success($data = null, string $message = 'success'): JsonResponse {
        return response()->json(['code' => 0, 'data' => $data, 'msg' => $message]);
    }
}

// 接口 - 定义契约
interface AuditInterface {
    public function audit(User $user, string $action, array $changes): void;
}
```

### 18. 依赖注入与容器绑定

```php
// 显式绑定
$this->app->bind(
    UserRepositoryInterface::class,
    EloquentUserRepository::class
);

// 单例绑定
$this->app->singleton(Logger::class, function ($app) {
    return new FileLogger();
});

// 方法注入
public function store(Request $request, UserRepository $repo) {
    // $repo 由容器自动注入
}
```

### 19. 委托与代理模式

```php
class OrderService {
    public function __construct(
        private OrderRepository $repo,
        private InventoryService $inventory,
        private NotificationService $notify,
    ) {}

    // 委托：将调用转发给其他服务
    public function createOrder(array $data): Order {
        $order = $this->repo->create($data);
        $this->inventory->reserve($order);  // 委托
        $this->notify->sendConfirmation($order);
        return $order;
    }
}
```

### 20. 组合拳：Repository + Service

```php
// Repository层（数据访问）
class OrderRepository {
    public function withRelations(): Builder {
        return Order::with(['user', 'items.product']);
    }

    public function findByCode(string $code): ?Order {
        return Order::where('order_code', $code)->first();
    }
}

// Service 层（业务逻辑）
class OrderProcessingService {
    public function __construct(
        private OrderRepository $repo,
        private PaymentGateway $payment,
    ) {}

    public function processPayment(Order $order): Result {
        $response = $this->payment->charge($order->total);
        if ($response->success()) {
            $order->update(['status' => 'paid']);
            return Result::success($order);
        }
        return Result::failed($response->message());
    }
}
```

### 21-30. （快速问答）

**21. Laravel Service Provider的作用？**  
注册服务到容器、绑定接口实现、配置路由中间件

**22. 如何实现依赖注入？**  
构造函数注入、方法注入、接口绑定

**23. Laravel Facade的原理？**  
Facade是静态代理，底层调用容器中的真实实例

**24. Trait 和Interface的区别？**  
Trait用于代码复用，Interface定义契约

**25. 私有属性和公共属性的区别？**  
private: 类内部；protected: 类及子类；public: 任意

**26. 魔法方法 `__clone`何时触发？**  
对对象使用 clone 关键字时

**27. 如何防止序列化安全漏洞？**  
不要反序列化不可信的数据，使用 JSON 替代serialize

**28. Final 关键字的作用？**  
阻止类被继承或方法被重写

**29. 命名空间的好处？**  
避免命名冲突、组织代码结构

**30. 如何实现一个简单的事件驱动？**  
使用 EventDispatcher 接口，定义事件和监听器

## MySQL 相关（31-45）

### 31. 索引优化实战

```sql
-- 建立复合索引
CREATE INDEX idx_user_status ON orders(user_id, status);

-- 最左前缀原则
-- (user_id, status) 可以查询 user_id 和 (user_id, status)
-- 但不能单独查询 status

-- 覆盖索引查询（避免回表）
SELECT id, status FROM orders WHERE user_id = 1;

-- EXPLAIN分析
EXPLAIN SELECT * FROM orders WHERE user_id = 1;
-- 关注：type(必须>=ref), rows, Extra(avoid filesort)
```

### 32. 事务隔离级别

```php
// 默认：READ COMMITTED (MySQL)
DB::connection()->getPDO()->setAttribute(
    PDO::ATTR_ISOLATION_LEVEL,
    PDO::TRANSACTION_READ_COMMITTED
);

// 读写已提交 vs 可重复读
BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;
-- 其他事务能看到此修改（READ COMMITTED）
COMMIT;
```

### 33. 悲观锁 vs 乐观锁

```php
// 悲观锁（行锁）
$order = Order::lockForUpdate()
    ->where('id', $id)
    ->first();

if ($order->status === 'pending') {
    $order->update(['status' => 'processing']);
}

// 乐观锁（版本号）
class Order extends Model {
    public $timestamps = false;
    protected $versionColumn = 'version';
}

// 更新时携带版本
DB::table('orders')
    ->where('id', $id)
    ->where('version', $oldVersion)
    ->update(['version' => $newVersion]);
```

### 34. 分库分表策略

```php
// 按用户 ID 哈希分表
class OrderSplitRepository {
    public function tableForOrderId(int $orderId): string {
        $shard = $orderId % 10;  // 10 个分表
        return "orders_{$shard}";
    }

    public function findById(int $id): ?Order {
        $table = $this->tableForOrderId($id);
        return DB::table($table)->find($id);
    }
}
```

### 35-45. （快速问答）

**35. B+ 树索引原理？**  
非叶子节点存索引，叶子节点存数据，范围查询高效

**36. Cluster 索引 vs 非聚簇索引？**  
Cluster: 数据按主键排序存储；Non-clustered: 二级索引

**37. MyISAM vs InnoDB?**  
InnoDB支持事务、外键、行锁；MyISAM仅适合只读

**38. 慢查询优化？**  
添加索引、优化 JOIN、避免 SELECT \*、使用 EXPLAIN

**39. 如何防止 SQL 注入？**  
使用 PDO 预处理、避免字符串拼接、Laravel ORM 天然防注入

**40. GROUP BY优化技巧？**  
使用索引、SQL_MODE=ONLY_FULL_GROUP_BY、最小化字段选择

**41. UNION vs UNION ALL?**  
UNION 去重（慢），UNION ALL保留重复（快）

**42. 数据库连接池？**  
PDO persistent connections，Redis 缓存连接信息

**43. 死锁检测？**  
SHOW ENGINE INNODB STATUS查看死锁信息

**44. 读写分离？**  
主从复制，主库写，从库读，Laravel Read/Write 通道

**45. 分库分表后的序列号？**  
自增 ID 改为分布式序列（Snowflake 算法）

## 系统集成题（46-50）

### 46. ERP-OA-MES 系统集成

```php
// 统一 API Gateway
class IntegrationGateway {
    public function syncOrderToERP(Order $order): SyncResult {
        try {
            return $this->erpClient->createOrder([
                'order_code' => $order->code,
                'customer_id' => $order->customer->erp_id,
                'items' => $order->items->map(fn($i) => [
                    'product_code' => $i->product->erp_sku,
                    'quantity' => $i->quantity,
                ]),
            ]);
        } catch (Exception $e) {
            Log::error("ERP同步失败：{$e->getMessage()}");
            return SyncResult::failed($e->getMessage());
        }
    }

    public function syncMaterialToMES(Material $material): void {
        // 物料同步到 MES
        $this->mesClient->syncMaterial([
            'material_code' => $material->code,
            'specification' => $material->spec,
        ]);
    }
}
```

### 47. 设备数据采集

```php
class DeviceDataCollector {
    public function collectFromPLC(string $deviceId): DeviceReading {
        // 通过 Modbus/TCP读取 PLC 数据
        $socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
        socket_connect($socket, $ip, $port);

        $command = $this->buildReadCommand($deviceId);
        socket_write($socket, $command);

        $response = socket_read($socket, 1024);
        return $this->parseResponse($response);
    }

    public function saveWithRetry(DeviceReading $reading): bool {
        // 带重试机制
        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                ProductionData::insert([
                    'device_id' => $reading->deviceId,
                    'temperature' => $reading->temperature,
                    'pressure' => $reading->pressure,
                    'collected_at' => now(),
                ]);
                return true;
            } catch (Exception $e) {
                if ($attempt === 3) throw $e;
                sleep(2 ** $attempt);  // 指数退避
            }
        }
    }
}
```

### 48. 审计日志实现（E-DHR合规）

```php
class AuditLog {
    public function log(AuditAction $action): void {
        AuditLogEntry::create([
            'user_id' => auth()->id(),
            'action' => $action->action,
            'entity_type' => $action->entityType,
            'entity_id' => $action->entityId,
            'old_values' => $action->oldValues,
            'new_values' => $action->newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}

// Laravel Model Observer
class OrderObserver {
    public function updating(Order $order): void {
        $this->audit->log(new AuditAction(
            'update',
            'order',
            $order->id,
            $order->getOriginal(),
            $order->getChanges()
        ));
    }
}
```

### 49. 权限控制设计

```php
// RBAC + 领域权限
class OrderPolicy {
    public function canView(User $user, Order $order): bool {
        if ($user->isAdmin()) return true;

        // 部门权限
        if ($user->department_id === $order->department_id) {
            return true;
        }

        // 数据归属
        return $user->id === $order->created_by;
    }

    public function canApprove(User $user, Order $order): bool {
        return $user->hasRole('approver')
            && $order->status === 'pending_approval';
    }
}
```

### 50. 消息队列与异步任务

```php
class OrderCreatedHandler implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable;

    public function handle(): void {
        $this->syncToERP();
        $this->notifyCustomer();
        $this->generateInvoice();
    }

    private function syncToERP(): void {
        $order = $this->job->payload()['data'];
        app(IntegrationGateway::class)->syncOrderToERP($order);
    }

    // 失败重试
    public function failed(Throwable $exception): void {
        Log::error("订单同步任务失败：{$exception->getMessage()}");
    }
}
```
