---
title: go 比较好用的一些工具库
date: 2023-02-12
category: Go
---

# go 比较好的一些规范

## 规范设计：`git commit`的工具

-   [commitizen-go](https://github.com/lintingzhen/commitizen-go): 使你进入交互模式，并根据提示生成 Commit Message，然后提交。

-   [go-gitlint](https://github.com/llorllale/go-gitlint): 检查历史提交的 Commit Message 是否符合 Angular 规范，可以将该工具添加在 CI 流程中，确保 Commit Message 都是符合规范的。
-   [gsemver](https://github.com/arnaud-deprez/gsemver): 语义化版本自动生成工具。
-   [git-chglog](https://github.com/git-chglog/git-chglog): 根据 Commit Message 生成 CHANGELOG。
-   [约定式提交文档地址](https://www.conventionalcommits.org/zh-hans/v1.0.0/)
-   [https://github.com/nochso/tocenize](https://github.com/nochso/tocenize): 可以帮助我们快速生成`markdown`的`toc`索引
-   [声明版权实现自动化生成工具 addlicense](https://github.com/marmotedu/addlicense)
-   [查看其他源码的开源协议 glice](https://github.com/ribice/glice)
-   [Angular 规范](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)
-   [Effective Go](https://go.dev/doc/effective_go)
-   [CodeReviewComments](https://github.com/golang/go/wiki/CodeReviewComments)
-   [go 包文档以及包名等建议](https://rakyll.org/style-packages/)
-   [go 的 mock 工具](https://github.com/golang/mock)
-   [go 的模拟数据库连接工具](https://github.com/DATA-DOG/go-sqlmock)
-   [模拟 http 请求](https://github.com/jarcoal/httpmock)
-   [猴子补丁](https://github.com/bouk/monkey)

## Git Flow 工作流

Git Flow 工作流是一个非常成熟的方案，也是非开源项目中最常用到的工作流。它定义了一个围绕项目发布的严格分支模型，通过为代码开发、发布和维护分配独立的分支来让项目的迭代流程更加顺畅，比较适合大型的项目或者迭代速度快的项目。

> 它比较适合非开源项目的工作流

### Git Flow 的 5 种分支

定义了 5 种分支分别是：master、develop、feature、release 和 hotfix，其中 master 和 develop 为常驻分支，其他为非常驻分支，不同的研发阶段会用到不同的分支。

| 分支名  | 描述                                                                                                                                                                                                                                                                                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| master  | 该分支上的最新代码永远都是发布状态，不能直接在该分支上开发，master 分支每合并一个 hotfix/release 分支，都会打一个版本标签                                                                                                                                                                                                                                                                  |
| develop | 该分支上的代码是开发中的最新代码，该分支只做合并操作，不能直接在该分支上开发                                                                                                                                                                                                                                                                                                               |
| feature | 在研发阶段用来做功能开发。一个新功能会基于 develop 分支新建一个 feature 分支，分支名建议命名为：feature/xxxx-xxx。功能开发完成之后，会合并到 develop 分支并删除。这里有一点要注意，feature 分支在申请合并之前，最好是先 pull 一下 develop 分支，看一下有没有冲突，如果有就先解决冲突后再申请合并                                                                                           |
| release | 在发布阶段用作版本发布的预发布分支，基于 develop 分支创建，分支名建议命名为：release/xxx-xx。例如：v1.0.0 版本的功能全部开发完成测试后，提交到 develop 分支，然后基于 develop 分支创建 release/1.0.0 分支，并提交测试，测试中遇到的问题在 release 分支修改，最后通过测试后，将 release 分支合并到 master 和 develop，并在 master 分支上打上 v1.0.0 的版本标签，最后删除 release/1.0.0 分支 |
| hotfix  | 在维护阶段用作紧急 bug 修复分支，在 master 分支上创建，修复完成后合并到 master，分支名建议命名为 hotfix/xxxx-xx。例如：当线上某个版本出现 bug 后，从 master 分支检出对应版本的代码，创建 hotfix 分支 ，并在 hotfix 分支修复问题。问题修复后，将 hotfix 分支合并到 master 和 develop 分支，并在 master 分支上打上修复后的版本标签，最后删除 hotfix 分支                                     |

### Git Flow 开发流程

案例：

1.  当前版本 0.9.0
2.  需要开发一个新功能，使程序执行向标准输出输出 “hello world”字符串
3.  在开发阶段，线上有代码有 bug 需要紧急修复
4.  假设项目名称为`gitflow-demo`，现在项目下有 2 个文件分别为`README.md`和`main.go`内容如下

```go
package main

import "fmt"

func main() {
    fmt.Println("call main function")
}
```

具体的开发流程如下：

1.  创建一个常驻的分支：develop

    ```bash
    git checkout -b develop master
    ```

2.  基于 develop 分支，创建一个新功能分支：`feature/print-hello-world`

    ```bash
    git checkout -b feature/print-hello-world develop
    ```

3.  `feature/print-hello-world`分支中，在`main.go`代码中添加代码

    ```go
    package main

    import "fmt"

    func main() {
      fmt.Println("callmainfunction")
      fmt.Println("Hello")
    }
    ```

4.  紧急修复 bug

    > 我们正处于开发新功能阶段中，只完成了`fmt.Println("Hello")`而非`fmt.Println("Hello World")`，突然线上发生了一个 bug，我们要立即停止手上的工作，修复线上的 bug

    ```bash
    # 1. 开发工作只完成了一半，还不想提交，可以临时保存修改至堆栈区
    git stash
    # 2. 从 master 分支建立 hotfix 分支
    git checkout -b hotfix/print-error master
    ```

    3.  。。。修复 bug。。。

    ```bash
    # 4.提交修复
    git commit -a -m "fix print message error bug"
    # 5. 切换到 develop 分支
    git checkout develop
    # 6. 把 hotfix 分支合并到develop 分支
    git merge --no-ff hotfix/print-error
    # 7. 切换到 master 分支
    git checkout master
    # 8. 把 hotfix分支合并到 master 分支
    git merge --no-ff hotfix/print-error
    # 9. master 分支打 tag
    git tag -a v0.9.1 "fix log bug"
    ```

    ```bash
    # 10. 编译代码，php 或者 py 可能不需要，将编译好的二进制代码更新到生产环境
    go build -v .
    # 11. 修复好 bug 之后，删除 hotfix 分支
    git branch -d hotfix/print-error
    # 12. 切换到开发新功能分支下
    git checkout feature/print-hello-world
    ```

    > 此时`develop`有更新，我们需要拉一下代码，同步一下

    ```bash
    # 13. 同步更新代码
    git merge --no-ff develop
    # 14. 恢复到之前的工作状态
    git stash pop
    ```

5.  继续开发新功能

    在`main.go`中完成新功能开发

6.  提交代码到`feature/print-hello-world`分支

    ```bash
    git commit -a -m "print hello world"
    ```

7.  在`feature/print-hello-world`分支上做`code review`

    首先，我们需要将`feature/print-hello-world` 推送到代码托管平台，例如`github`

    ```bash
    git push origin feature/print-hello-world
    ```

    然后在代码托管平台上，基于`feature/print-hello-world`创建`pull request`

    创建完`pr`之后我们可以指定`Reviewers`进行`code review`

8.  `code review`通过后，由代码仓库`matainer`讲功能分支合并到`develop`分支

    ```bash
    git checkout develop
    git merge --no-ff feature/print-hello-world
    ```

9.  基于`develop`分支，创建`release`分支，测试代码

    ```bash
    git checkout -b release/1.0.0 develop
    git build -v . # 构建后， 部署二进制文件，并测试；非编译型语言可能不需要
    ```

10. 测试失败，我们要求打印`hello world`但是打印的是`Hello World`，修复的时候，我们直接在`release/1.0.0`分支修改代码，修改完成后，提交并编译部署

    ```bash
    git commit -a -m "fix bug"
    git build -v .
    ```

11. 测试通过后，将功能分支合并到`master`分支和`develop`分支

    ```bash
    git checkout develop
    git merge --no-ff release/1.0.0
    git checkout master
    git merge --no-ff release/1.0.0
    git tag -a v1.0.0 -m "add print hello world" # master分支打标签
    ```

12. 删除`feature/print-hello-world`分支，也可以选择性删除`release/v1.0.0`分支

    ```bash
    git branch -d feature/print-hello-world
    ```

> 亲自操作一遍后，就能知道`git flow`工作流的每个分支分工明确，可以最大程度减少他们之间的相互影响。因为可以创建多个分支，所以也可以并行开发多个功能。

## 单元测试覆盖率

-   使用`gotests`工具自动生成单元测试代码，减少编写单元测试用例的工作量
-   定期检查单元测试覆盖率

```bash
go test -race -cover  -coverprofile=./coverage.out -timeout=10m -short -v ./...
go tool cover -func ./coverage.out
```

## go 常用工具

![img](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/90ca527c2863fe642f9ab3d5b90fe980.png)
