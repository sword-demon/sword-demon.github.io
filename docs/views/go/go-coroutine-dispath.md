# 简述 Go 协程调度机制

## 参考文章

-   [x] [https://medium.com/@ankur_anand/illustrated-tales-of-go-runtime-scheduler-74809ef6d19b(需要科学上网)](https://medium.com/@ankur_anand/illustrated-tales-of-go-runtime-scheduler-74809ef6d19b)
-   [x] [https://lessisbetter.site/2019/03/10/golang-scheduler-1-history/(这个不错)](https://lessisbetter.site/2019/03/10/golang-scheduler-1-history/)
-   [x] [https://zhuanlan.zhihu.com/p/27056944(知乎的一篇文章)](https://zhuanlan.zhihu.com/p/27056944)

## 真正干活的是线程 M

> OS 提供的线程：`M`

## 协程

是用户态的线程，是“用户”创建的，通常用`G`表示，协程自己不会运行，Go 有一个协程调度机制。

-   G(goroutine)：代表携程
-   M（Work Thread）：代表线程
-   P(Processor)，代表处理器核(CPU 核)，又称上下文，不超过机器本身的`GOMAXPROCS`

1.  运行的 M 都必须绑定一个 P，一次只能绑定一个
2.  P 保存着一个协程 G 的队列【本地队列】
3.  调度器还拥有一个全局的 G 队列【全局队列】
4.  M 从队列中提取 G，并执行

## 找 G 的顺序

1.  `1/61`的几率在全局队列中找 G，`60/61`的几率在本地队列找 G

2.  如果全局队列找不到 G，就从 P 的本地队列里找 G

3.  如果找不到，就从其他 P 的本地队列里“窃取”P

4.  如果找不到，则从全局队列中拿取一部分 G 到本地队列，这里拿取的“一部分”满足一个公式：
    $$
    n = min(len(GQ)/GOMAXPROCS + 1, len(GQ/2))
    $$

## 阻塞过程

> 假设 G1 阻塞，从而造成 M1 阻塞

1.  P1 第一件事就是和 M1 解绑
2.  然后 M1 和 G1 依然保持关系
3.  阻塞结束，M1 寻找 P【不一定是原来的 P1】来接收 G1，如果找不到，扔给全局队列

## 自旋

M 在本地队列、全局队列都找不到 G，则会进入自旋【有条件：如 2M < 繁忙的 P，即当 M 的数量的 2 倍小于繁忙的 P 就会进入自旋】

> 自旋：可以理解为循环执行某个代码块，从而不仅如此休眠，当然会耗费一些 CPU；
>
> **但是比起反复启动新的 M 要性能高**

## 总结

> Go 的协程调度就是：P 将 G 合理的分配给某个 M 的过程。
