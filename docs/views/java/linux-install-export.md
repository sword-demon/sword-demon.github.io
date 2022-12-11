---
title: Linux操作Java环境以及运维部署
date: 2022-12-11 22:24:10
category: Java
tag:
    - operations
---

# Linux 安装 Java 相关以及运维部署

## 安装 JDK 操作步骤

1.  下载一个`jdk`的`linux`的`x86`架构的二进制文件压缩包

2.  上传到`linux`服务器进行解压缩到`/usr/local`目录

    ```bash
    tar -zxvf jdk-8u171-linux-x86.tar.gz -C /usr/local
    ```

3.  配置环境变量，使用`vim`命令修改`/etc/profile`文件，在文件末尾添加如下配置：

    ```bash
    JAVA_HOME=/usr/local/jdk1.8.0_171
    PATH=$JAVA_HOME/bin:$PATH
    ```

4.  让上述配置文件生效

    ```bash
    source /etc/profile
    ```

5.  检查安装是否成功

    ```bash
    java -version
    ```

## 安装部署 java 项目

### 手工部署

在对应的`java`项目里，使用`maven`的`package`进行打包，就会在`target`目录下生成一个对应的项目名称的`.jar`包，我们将这个`jar`包上传到`linux`的`/usr/local/app`目录下。

在完成`jdk`的安装后，我们在`linux`上使用如下命令进行运行

```bash
java -jar helloworld-1.0-SNAPSHOT.jar
```

就等它运行起来，这样运行下，是前台运行，而不是后台运行。

---

我们还需要检查一下防火墙，确保项目运行的端口是否对外开放，比如一般都是`8080`端口

```bash
firewall-cmd --zone=public --list-ports
```

查看一下是否开放；如果都开放了，如果是虚拟机，就使用对应的外网 IP 加端口进行访问对应的路由来测试是否`OK`；如果是正式服务器，也可以拿对应的 IP 加端口去检测。

---

**改为后台运行**，并将日志输出到日志文件

使用`nohup`命令，用于不挂断地运行指定命令，退出终端不会影响程序的运行

```bash
nohup java -jar 工程.jar &> hello.log &
```

后台运行命令并将日志输出到`hello.log`文件；可以再次使用 IP 加端口的方式进行访问测试。

---

**停止服务：我们需要找到该运行的进程然后将该进程杀掉即可**

```bash
ps -ef | grep java -jar
```

找到对应的进程 ID，然后使用`kill -9 进程号`即可。

### 通过 shell 脚本自动部署项目

操作步骤：

1.  在`linux`中安装`git`
2.  在`linux`中安装`maven`
3.  编写`Shell`脚本【拉取代码、编译、打包、启动】
4.  为用户授予执行`Shell`脚本的权限
5.  执行`Shell`脚本

```flow
startID=>start: Git仓库
conditionID=>condition: pull/push
subroutineID=>subroutine: 本地开发环境push代码
endID=>end: Linux服务器拉取代码进行编译打包启动

startID->conditionID
conditionID(no)->subroutineID
conditionID(yes)->endID
```

---

在`linux`中安装`git`

```bash
yum list git # 列出git安装包
yum install git # 在线安装git
```

---

使用`git`克隆远程仓库的代码

```bash
cd /usr/local
git clone xxxx.git
```

---

将自己下载的`maven`的`linux`版上传到服务器并安装

```bash
tar -zxvf apache-maven-3.6.3-bin.tar.gz -C /usr/local
vim /etc/profile

# 加入一下内容
export MAVEN_HOME=/usr/local/apache-maven-3.6.3
export PATH=$JAVA_HOME/bin:$MAVEN_HOME/bin:$PATH

# 使之立马生效
source /etc/profile
# 检测
mvn -version

# 修改maven的配置文件
vim /usr/local/apache-maven-3.6.3/conf/settings.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <mirrors>
        <mirror>
            <id>alimaven</id>
            <mirrorOf>*</mirrorOf>
            <name>aliyun maven</name>
            <url>http://maven.aliyun.com/repository/public</url>
        </mirror>
    </mirrors>
</settings>

```

---

`shell`脚本

```shell
#!/bin/sh
echo =================================
echo  自动化部署脚本启动
echo =================================

echo 停止原来运行中的工程
APP_NAME=helloworld

tpid=`ps -ef|grep $APP_NAME|grep -v grep|grep -v kill|awk '{print $2}'`
if [ ${tpid} ]; then
    echo 'Stop Process...'
    kill -15 $tpid
fi
sleep 2
tpid=`ps -ef|grep $APP_NAME|grep -v grep|grep -v kill|awk '{print $2}'`
if [ ${tpid} ]; then
    echo 'Kill Process!'
    kill -9 $tpid
else
    echo 'Stop Success!'
fi

echo 准备从Git仓库拉取最新代码
cd /usr/local/helloworld

echo 开始从Git仓库拉取最新代码
git pull
echo 代码拉取完成

echo 开始打包
output=`mvn clean package -Dmaven.test.skip=true`

cd target

echo 启动项目
nohup java -jar helloworld-1.0-SNAPSHOT.jar &> helloworld.log &
echo 项目启动完成

```

前提你得先`clone`一遍，否则这里`git pull`是拉不到代码的。

`APP_NAME`：可改项

`nohup java -jar helloworld-1.0-SNAPSHOT.jar &> helloworld.log &`这里的生成的`jar`名称也是可改项。

刚弄上去的脚本，不一定有执行权限，所以还得为它赋予执行权限。

```bash
chmod +x xxx.sh
```

或者直接给全部权限

```bash
chmod 777 xxx.sh
```

执行脚本

```bash
./xxx.sh
```

等到它的输出完成之后，我们还需要使用 IP 加端口的方式去检测是否成功。【第一次执行的时候，需要安装下载一些`jar`包可能会比较慢】。

然后再试着修改一下程序，然后推送到`git`远程仓库，再次执行`shell`脚本检查是否修改成功。
