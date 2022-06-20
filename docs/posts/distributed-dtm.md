---
title: 分布式事务
date: 2021-10-24 23:37:15
category: Note
tag:
    - dtm
    - distirbuted
---

## 分布式事务

讲到事务，基本就是经典的转账问题

支付宝账户表：`A(id, user_id, amount)`

余额宝账户表：`B(id, user_id, amount)`

用户的`user_id = 1`，从支付宝转账 1 万到余额宝分为 2 个步骤：

1.  支付宝表扣除 1 万：

    ```sql
    update A set amount = amount - 10000 where user_id = 1;
    ```

2.  余额宝表增加 1 万：

    ```sql
    update B set amount = amount + 10000 where user_id = 1;
    ```

**如何保证一致性呢？**

> 单个数据库，我们保证`ACID`使用数据库事务

---

随着系统变大，进行了微服务架构的改造，因为每个微服务独占了一个数据库实例，从`user_id = 1`发起的转账动作，跨越了两个微服务：`pay`和`balance`服务。

我们需要保证，跨多个服务的步骤数据一致性：

1.  微服务`pay`的支付宝表扣除 1 万
2.  微服务`balance`的余额宝的表增加 1 万

> 每个系统都对应一个独立的数据源，且可能位于不同机房，同时调用多个服务很难保证同时成功，这就是跨服务分布式事务的问题。

:::tip

我们系统应该能保证每个服务自身的`ACID`，基于这个假设，我们事务消息解决分布式事务的问题。

:::

### 事务消息

:::tip

在很多的麻辣烫的店，你点了份麻辣烫并付了钱，他们并不会直接把你点的东西给你，而是给你一个类似号码的手串给你，然后让你拿着号码牌到出货区排队去取。

为什么餐饮店要将付钱和取货 2 个动作分开呢？原因很多，其中一个很重要的原因是为了使他们的接待能力增加(程序里的说法就是并发量更高)。

只要这张号码牌在，你最终是能拿到麻辣烫的。同理，转账服务也是如此。

:::

> 当支付宝账户扣除 1 万元后，我们只要生成一个凭证(消息)即可，这个凭证(消息)上写着要余额宝增加 1 万，只要这个消息能可靠的保存，我们最终是可以拿到这个凭证(消息)让余额宝账号增加 1 万的，即我们能依靠这个凭证(消息)完成最终一致性。

### 如何保存可靠的消息凭证

> 要解决消息可靠存储，实际上需要解决的是本地的`mysql`存储和`message`存储的一致性问题。

解决办法：

-   `Transactional outbox`
-   `Polling publisher`
-   `Transaction log tailing`
-   `2PC Message Queue`

**事务消息一旦被可靠的持久化，我们整个分布式事务，便完成了最终一致性，消息的消费才能保障最终业务数据的完整性，所以我们要尽最大努力，把消息送达到下游的业务消费方，成为`Best Effort`。只有消息被消费，整个交易才能算是完整完结。**

### Best Effort

即尽最大努力交付，主要用于这样一种场景：

不同的服务凭条之间的事务性保证。

比如我们使用电商购物时，使用的第三方的支付平台进行支付的时候。

> 做过支付宝交易接口的都知道，我们一般会在支付宝的回调页面和接口里，解密参数，然后调用系统中更新交易状态相关的业务，将订单更新为付款成功。
>
> 同时，只有当我们回调页面中输出了`success`字样或者标识业务处理成功相应状态码时，支付宝才会停止回调请求。否则，它会轮训来向客户方发起回调请求，知道输出成功标识为止。

:::danger

在对于这样的一个有重试或者回调的业务，如果对方至少调一次，意味着可能会调很多次 ，一定要处理好同一笔交易如何避免多次加钱或者发放多次道具，这就是一个业务幂等的一个问题。

:::

### Transactional outbox

`Transactional outbox`，支付宝在完成扣款的同时，同时记录消息数据，这个消息数据与业务数据保存在同一数据库实例里(消息记录表表名为`msg`)。

```sql
begin transaction
update A set amount = amount - 10000 where user_id = 1;

insert into msg(user_id, amount, status) values (1, 10000, 1);

end transaction
commit;
```

上述事务能保证只要支付宝账户里面扣了钱，消息一定能保存下来。当上述事务提交成功后，我们想办法将此消息通知余额宝，余额宝处理成功后发送回复成功消息，支付宝收到回复后删除该消息数据。

### Polling publisher

`Polling publisher`，我们定时的轮训`msg`表，把`status = 1`的消息统统拿出来消费，可以按照自增`id`排序，保证顺序消费。独立建立了一个`pay_task`的任务，把拖出来的消息`publish`给我们的消息队列，`balance`服务自己来消费队列，或者直接`rpc`发送给`balance`服务。

:::warning

`Pull`的模型，从延迟来说不够好，`Pull`太猛对`Database`有一定的压力，`Pull`频次太低了，延迟比较高。

:::

### Transaction log tailing

> 上述保存消息的方式，使得消息数据和业务数据紧耦合在一起，从架构上来看不够优雅，而且容易诱发其他问题。
>
> 有一些业务场景，可以直接使用主表被`canal`订阅使用，有一些业务场景自带这类`message`表，比如订单或者交易流水，可以直接使用这类流水表作为`message`表使用。

:::tip

使用`canal`订阅后，是实时流式消费数据，在消费者`balance`或者`balance-job`必须努力送达到。

发现所有努力送达的模型，必须是先预扣款(预占资源)的做法。

**一定是先付钱，后发道具；一定是先扣钱，后加钱**

:::

### 幂等

还有一个比较严重的问题就是消息重复投递，如果相同的消息被重复投递了两次，name 我们余额宝账户里将会增加 2 万而不是 1 万了。

为什么会这样呢？当余额宝处理完消息`msg`后，发送了处理成功的消息给支付宝，正常情况下支付宝应该要删除消息`msg`，但如果支付宝这个时候悲剧的挂了，重启后一看消息`msg`还在，就会继续发送消息`msg`。

解决办法：

-   全局唯一 ID + 去重表

    > 在余额宝这边增加消息应用状态表`message_apply`，通俗的来说就是个账本，用于记录消息的消费情况，每次来一个消息，在真正执行前，先去消费应用状态表中查询一番，如果找到说明是重复消息，丢弃即可，如果没找到才执行，同时插入到消息应用状态表(同一事务下)。

    ```sql
    for each msg in queue

    	begin transaction
            select count(*) as cnt from message_apply where msg_id = msg.msg_id;
            if cn == 0 then
            update B set amount = amount + 10000 where user_id = 1;
            insert into message_apply(msg_id) values (msg.msg_id);
    	end transaction
    	commit;
    ```

-   版本号

### 2PC

> 两阶段提交协议（Two Phase Commitment Protocol）中，涉及两种角色

-   一个事务协调者(coordinator)：负责协调多个参与者进行事务投票及提交(回滚)
-   多个事务参与者(participants)：即本地事务执行者

总共处理步骤有 2 个：

1.  投票阶段(votine phase)：协调者将通知事务参与者准备提交或取消事务，然后进入表决过程。参与者将告知协调者自己的决策：同意(事务参与者本地事务执行成功，但未提交)或取消(本地事务执行故障)。
2.  提交阶段(comimt phase)：受到参与者的通知后，协调者再向参与者发出通知，根据反馈的情况决定各参与者是否要提交还是回滚。

![image-20211025222336214](https://sword-demon.github.io/vue-blog/assets/images/image-20211025222336214.png)

:::tip

这是一个从数据库层面看到的二阶段提交，其实这种不符合微服务所谓的每人独占数据库的这种模型，但是这种思路是可以借鉴的。

:::

### 2PC Message Queue

![image-20211025222928607](https://sword-demon.github.io/vue-blog/assets/images/image-20211025222928607.png)

### Seata 2PC

> 阿里开源的。多说无益。牛逼就是了。

### TCC

TCC 是`try confirm cancel`三个词语的缩写，TCC 要求每个分支事务实现三个操作：预处理 Try、确认 Confirm、撤销 Cancel。

> Try 操作做业务检查及资源预留，Confirm 做业务确认操作，Cancel 实现一个与 Try 相反的操作即回滚操作。
>
> TM 首先发起所有的分支事务的 Try 操作，任何一个认知事务的 Try 的操作执行失败，TM 将会发起所有分支事务的 Cancel 操作，若 Try 操作全部成功，TM 将会发起所有分支事务的 Confrim 操作，其中 Comfrim/Cancel 操作若执行失败，TM 会进行重试。

:::danger

需要注意：

-   空回滚
-   防悬挂

:::

同样还是我们支付转账的场景：

第一步是`check & try`

给 A 表加了一个`frozen_amount`的字段，它是一个冻结的金额，也就是第一步的资源预留。比较好理解的场景：去银行预授权，然后钱要先冻结，比如财产证明，证明我有 30 万，先做一个证明，然后会把这笔钱冻结了，然后你的资产证明上面有一个时间戳，到了时间戳结束了以后呢，这个钱又可以给你还回来。

```
# 支付宝表
id
user_id
amount			-10000 扣钱
frozen_amount	+10000 加钱
```

`Cancel`和这是反的，就是让上面的加和减换一下。

```
# 余额宝表
id
user_id
amount
frozen_amount   +10000
```

余额宝的`try`操作，加钱，给冻结的字段加钱。

**任何一个分支的事务 try 操作失败，事务控制器 TM(transaction manager)会发起所有的分支事务回滚，也就是 Cancel 操作，会发生如下操作：**

```
# 支付宝表
id
user_id
amount			+10000 加钱
frozen_amount	-10000 减钱
```

```
# 余额宝表
id
user_id
amount
frozen_amount   -10000 减钱
```

**如果所有分支操作都成功了，就会发起 Confirm 操作，如果 Confirm 操作发生失败，它会进行重试直到成功。**

最终状态为:

```
# 支付宝表
id
user_id
amount
frozen_amount	-10000 减钱
```

```
# 余额宝表
id
user_id
amount			+10000 加钱
frozen_amount   -10000 减钱
```

## Reference

[https://blog.csdn.net/hosaos/article/details/89136666](https://blog.csdn.net/hosaos/article/details/89136666)

[https://zhuanlan.zhihu.com/p/183753774](https://zhuanlan.zhihu.com/p/183753774)

[https://www.cnblogs.com/dyzcs/p/13780668.html](https://www.cnblogs.com/dyzcs/p/13780668.html)

[https://blog.csdn.net/bjweimengshu/article/details/79607522](https://blog.csdn.net/bjweimengshu/article/details/79607522)

[https://microservices.io/patterns/data/event-sourcing.html](https://microservices.io/patterns/data/event-sourcing.html)

[https://microservices.io/patterns/data/saga.html](https://microservices.io/patterns/data/saga.html)

[https://microservices.io/patterns/data/polling-publisher.html](https://microservices.io/patterns/data/polling-publisher.html)

[https://microservices.io/patterns/data/polling-publisher.html](https://microservices.io/patterns/data/polling-publisher.html)

[https://microservices.io/patterns/data/transaction-log-tailing.html](https://microservices.io/patterns/data/transaction-log-tailing.html)
