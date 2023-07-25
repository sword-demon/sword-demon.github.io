---
title: 网盘系统学习
date: 2023-07-23 21:49:10
category: Java
tag:
    - SpringBoot&Vue3
---

# 网盘系统

## 开发环境配置

-   SpringBoot 2.1.9.RELEASE
-   Swagger2 2.8.0
-   MyBatis-Plus 3.3.2
-   Redis 6.2.6
-   ZooKeeper 3.4.14
-   MySQL 8.0
-   RocketMQ 4.5.1

### JDK

下载地址

[官网地址](https://www.oracle.com/java/technologies/downloads/#java8)

#### Linux 安装

上传到服务器上

```bash
yim install -y lrzsz
rz -y jdk-8u341-linux-x64.tar.gz
```

或者使用`FTP`上传

解压压缩包

```bash
cd # 对应目录
tar -zxvf jdk-8u341-linux-x64.tar.gz
cd jdk1.8.0_341
```

设置环境变量

```bash
vim /etc/profile

# 按 i 进入编辑模式
# 追加以下内容

export JAVA_HOME=你按照的 jdk 的目录
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export PATH=$PATH:$JAVA_HOME/bin

# 按 esc 退出编辑
# 退出编辑之后 输入 :wq 保存退出

# 让编辑的配置生效
source /etc/profile

# 测试
java version
# 正确的话会显示当前 JDK 的版本信息
```

> windows 下就直接百度吧。。。

#### MacOS

> 按照对应的傻瓜式安装流程完成之后就可以直接在终端进行`java version`测试，手动配置环境变量还是和`linux`的一样的，不过就是`mac os`下可能不是`/etc/profile`，有坑是`.bash_profile`或者`.zsh_profile`

### Maven

[官网地址](https://archive.apache.org/dist/maven/maven-3/3.6.3/binaries/)

在`linux/mac os`下解压安装包，在`windows`下直接复制到一个英文目录即可。

`linux/mac os`配置环境变量

```bash
vim /etc/profile
```

`/etc/profile`

```bash
export MAVEN_HOME=/home/xxx/apache-mavn-3.6.3
export PATH=$PATH:$MAVEN_HOME/bin
```

让它生效

```bash
source /etc/profile
# 测试
mvn -v

Apache Maven 3.6.3 (cecedd343002696d0abb50b32b541b8a6ba2883f)
Maven home: /Users/xxx/soft/apache-maven-3.6.3
Java version: 1.8.0_282, vendor: Azul Systems, Inc., runtime: /Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "mac os x", version: "13.3.1", arch: "aarch64", family: "mac"
```

`windows`直接在环境变量里添加对应的变量和对应的安装目录即可。

#### 配置阿里云镜像

打开`Maven`的安装目录`/conf/setting.xml`,先备份一份，然后复制一份重新改

```xml
<!-- 找到<mirros>标签添加子标签 -->

<mirror>
	<id>nexus-aliyun</id>
    <mirrorOf>central</mirrorOf>
    <name>Nexus aliyun</name>
    <url>https://maven.aliyun.com/nexus/content/groups/public</url>
</mirror>
```

### git

```bash
# 卸载掉预装的 git
yum remove -y git

# 安装
yum install git -y
```

如果是自己找安装包的方式，和上面安装`maven`和`jdk`的方式一样，把安装包解压到对应的目录，然后设置环境变量，让环境变量生效即可，最后测试命令

```bash
git --version
```

`windows`下直接`git.exe`安装一步一步走就完了

`mac os`下如果也是直接使用`dmg`直接傻瓜式安装即可，终端安装

```bash
brew install git
```

## 基于 SpringBoot 初始化项目

初始化工程之后的目录结构

```text
.
├── README.md
├── framework
│   ├── README.md
│   ├── core
│   │   ├── pom.xml
│   │   └── src
│   │       ├── main
│   │       │   ├── java
│   │       │   │   └── top
│   │       │   │       └── wjstar
│   │       │   │           └── pan
│   │       │   │               └── core
│   │       │   └── resources
│   │       └── test
│   │           └── java
│   ├── pom.xml
│   └── web
│       ├── pom.xml
│       └── src
│           ├── main
│           │   ├── java
│           │   │   └── top
│           │   │       └── wjstar
│           │   │           └── pan
│           │   │               └── web
│           │   └── resources
│           └── test
│               └── java
├── pom.xml
└── server
    ├── README.md
    ├── pom.xml
    └── src
        ├── main
        │   ├── java
        │   └── resources
        └── test
            └── java

```

父工程`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.5.RELEASE</version>
        <relativePath />
    </parent>

    <groupId>top.wjstar.pan</groupId>
    <artifactId>w-pan</artifactId>
    <version>1.0.0</version>
    <name>w-pan</name>
    <description>W Pan 项目服务端</description>
    <modules>
        <module>framework</module>
        <module>server</module>
    </modules>
    <packaging>pom</packaging>

    <properties>
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <druid.version>1.1.10</druid.version>
        <mysql-connector.version>8.0.11</mysql-connector.version>
        <mybatis-plus.version>3.3.2</mybatis-plus.version>
        <velocity.version>2.3</velocity.version>
        <jackson.version>2.10.2</jackson.version>
        <guava.version>20.0</guava.version>
        <commons-lang3.version>3.5</commons-lang3.version>
        <commons-collections.version>3.2.1</commons-collections.version>
        <fastjson.version>1.2.56</fastjson.version>
        <jjwt.version>0.7.0</jjwt.version>
        <commons-io.version>2.4</commons-io.version>
        <swagger2.version>2.8.0</swagger2.version>
        <swagger2.ui.version>1.9.3</swagger2.ui.version>
        <hutool.version>4.5.18</hutool.version>
        <reflections.version>0.9.10</reflections.version>
        <fastdfs.client.version>1.26.1-RELEASE</fastdfs.client.version>
        <oss.client.version>2.8.3</oss.client.version>
        <rocketmq.version>2.0.3</rocketmq.version>
        <org.mapstruct.version>1.5.2.Final</org.mapstruct.version>
        <projectlombok.version>1.18.20</projectlombok.version>
        <lombok-mapstruct-binding.version>0.2.0</lombok-mapstruct-binding.version>
        <spring-cloud.version>Hoxton.SR3</spring-cloud.version>
        <spring-cloud-alibaba.version>2.2.1.RELEASE</spring-cloud-alibaba.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!--reflections-->
            <dependency>
                <groupId>org.reflections</groupId>
                <artifactId>reflections</artifactId>
                <version>${reflections.version}</version>
            </dependency>
            <!--mysql-connector-java-->
            <dependency>
                <groupId>mysql</groupId>
                <artifactId>mysql-connector-java</artifactId>
                <scope>runtime</scope>
                <version>${mysql-connector.version}</version>
            </dependency>
            <!--mybatis-plus-spring-boot-starter-->
            <dependency>
                <groupId>com.baomidou</groupId>
                <artifactId>mybatis-plus-boot-starter</artifactId>
                <version>${mybatis-plus.version}</version>
            </dependency>
            <dependency>
                <groupId>com.baomidou</groupId>
                <artifactId>mybatis-plus-generator</artifactId>
                <version>${mybatis-plus.version}</version>
            </dependency>
            <dependency>
                <groupId>org.apache.velocity</groupId>
                <artifactId>velocity-engine-core</artifactId>
                <version>${velocity.version}</version>
            </dependency>
            <!--json序列化-->
            <dependency>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-annotations</artifactId>
                <version>${jackson.version}</version>
            </dependency>
            <!--guava-->
            <dependency>
                <groupId>com.google.guava</groupId>
                <artifactId>guava</artifactId>
                <version>${guava.version}</version>
            </dependency>
            <!--commons-lang3-->
            <dependency>
                <groupId>org.apache.commons</groupId>
                <artifactId>commons-lang3</artifactId>
                <version>${commons-lang3.version}</version>
            </dependency>
            <!--commons-collections-->
            <dependency>
                <groupId>commons-collections</groupId>
                <artifactId>commons-collections</artifactId>
                <version>${commons-collections.version}</version>
            </dependency>
            <!--commons-io-->
            <dependency>
                <groupId>commons-io</groupId>
                <artifactId>commons-io</artifactId>
                <version>${commons-io.version}</version>
            </dependency>
            <!--fastjson-->
            <dependency>
                <groupId>com.alibaba</groupId>
                <artifactId>fastjson</artifactId>
                <version>${fastjson.version}</version>
            </dependency>
            <!--jjwt-->
            <dependency>
                <groupId>io.jsonwebtoken</groupId>
                <artifactId>jjwt</artifactId>
                <version>${jjwt.version}</version>
            </dependency>
            <!--swagger2-->
            <dependency>
                <groupId>io.springfox</groupId>
                <artifactId>springfox-swagger2</artifactId>
                <version>${swagger2.version}</version>
            </dependency>
            <dependency>
                <groupId>io.springfox</groupId>
                <artifactId>springfox-swagger-ui</artifactId>
                <version>${swagger2.version}</version>
            </dependency>
            <dependency>
                <groupId>com.github.xiaoymin</groupId>
                <artifactId>swagger-bootstrap-ui</artifactId>
                <version>${swagger2.ui.version}</version>
            </dependency>
            <!--hutool-core-->
            <dependency>
                <groupId>cn.hutool</groupId>
                <artifactId>hutool-core</artifactId>
                <version>${hutool.version}</version>
            </dependency>
            <dependency>
                <groupId>com.github.tobato</groupId>
                <artifactId>fastdfs-client</artifactId>
                <version>${fastdfs.client.version}</version>
            </dependency>
            <dependency>
                <groupId>com.aliyun.oss</groupId>
                <artifactId>aliyun-sdk-oss</artifactId>
                <version>${oss.client.version}</version>
            </dependency>
            <dependency>
                <groupId>org.apache.rocketmq</groupId>
                <artifactId>rocketmq-spring-boot-starter</artifactId>
                <version>${rocketmq.version}</version>
            </dependency>
            <dependency>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct</artifactId>
                <version>${org.mapstruct.version}</version>
            </dependency>
            <dependency>
                <groupId>com.github.ben-manes.caffeine</groupId>
                <artifactId>caffeine</artifactId>
                <version>${caffeine.version}</version>
            </dependency>
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${projectlombok.version}</version>
            </dependency>
            <dependency>
                <groupId>org.springframework.integration</groupId>
                <artifactId>spring-integration-redis</artifactId>
                <version>${spring-integration.version}</version>
            </dependency>
            <dependency>
                <groupId>org.springframework.integration</groupId>
                <artifactId>spring-integration-zookeeper</artifactId>
                <version>${spring-integration.version}</version>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring-cloud-alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <!--编译插件-->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.7.0</version>
                <configuration>
                    <source>8</source>
                    <target>8</target>
                    <encoding>utf-8</encoding>
                    <skip>true</skip>
                </configuration>
            </plugin>
            <!--版本管理插件-->
            <!--统一修改版本号：mvn versions:set -DnewVersion=1.0.1-SNAPSHOT -->
            <!--提交版本号：mvn versions:commit-->
            <!--回退版本号：mvn versions:revert-->
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>versions-maven-plugin</artifactId>
                <version>2.7</version>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>2.6</version>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.1.2</version>
            </plugin>
        </plugins>
    </build>

    <repositories>
        <repository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/milestone</url>
        </repository>
        <repository>
            <id>spring-releases</id>
            <name>Spring Releases</name>
            <url>https://repo.spring.io/libs-release</url>
        </repository>
        <repository>
            <id>spring-lib-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/libs-milestone</url>
        </repository>
    </repositories>
</project>
```

### core 模块配置常量和公共响应类以及业务异常类

`pom.xml`文件依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>top.wjstar.pan</groupId>
        <artifactId>w-pan-framework</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>w-pan-core</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!--json序列化-->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-annotations</artifactId>
        </dependency>
        <!--guava-->
        <dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
        </dependency>
        <!--commons-lang3-->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
        </dependency>
        <!--commons-collections-->
        <dependency>
            <groupId>commons-collections</groupId>
            <artifactId>commons-collections</artifactId>
        </dependency>
        <!--commons-io-->
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
        </dependency>
        <!--fastjson-->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
        </dependency>
        <!--jjwt-->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt</artifactId>
        </dependency>
        <!--hutool-core-->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-core</artifactId>
        </dependency>
        <!--基础容器依赖-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <!--test-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
        <!--lombok-->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
        </dependency>
    </dependencies>

</project>
```

```java
package top.wjstar.pan.core.constants;

import org.apache.commons.lang3.StringUtils;

/**
 * WPan 公用基础常量类
 */
public interface WPanConstants {

    /**
     * 公用的字符串分隔符
     */
    String COMMON_SEPARATOR = "_,_";

    /**
     * 空字符串
     */
    String EMPTY_STR = StringUtils.EMPTY;

    /**
     * 点 常量
     */
    String POINT_STR = ".";

    /**
     * 斜杠字符串
     */
    String SLASH_STR = "/";

    /**
     * Long 常量 0
     */
    Long ZERO_LONG = 0L;

    /**
     * Integer 常量 0
     */
    Integer ZERO_INT = 0;

    /**
     * Integer 常量 1
     */
    Integer ONE_INT = 1;

    /**
     * Integer 常量 2
     */
    Integer TWO_INT = 2;

    /**
     * Integer 常量 -1
     */
    Integer MINUS_ONE_INT = -1;

    /**
     * true 字符串
     */
    String TRUE_STR = "true";

    /**
     * false 字符串
     */
    String FALSE_STR = "false";

    /**
     * 组件扫描基础路径
     */
    String BASE_COMPONENT_SCAN_PATH = "top.wjstar.pan";
}

```

```java
package top.wjstar.pan.core.exception;

import lombok.Data;
import top.wjstar.pan.core.response.ResponseCode;

/**
 * 自定义全局业务异常类
 */
@Data
public class WPanBusinessException extends RuntimeException {
    /**
     * 错误码
     */
    private Integer code;
    /**
     * 错误消息
     */
    private String message;

    public WPanBusinessException(ResponseCode responseCode) {
        this.code = responseCode.getCode();
        this.message = responseCode.getDesc();
    }

    public WPanBusinessException(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public WPanBusinessException(String message) {
        this.code = ResponseCode.ERROR.getCode();
        this.message = message;
    }

    public WPanBusinessException() {
        this.code = ResponseCode.ERROR.getCode();
        this.message = ResponseCode.ERROR.getDesc();
    }
}

```

```java
package top.wjstar.pan.core.response;

import com.alibaba.fastjson.annotation.JSONField;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.io.Serializable;
import java.util.Objects;

/**
 * 公共返回对象
 * <p>
 * 保证 json 序列化的时候如果属性为null，key 也就一起消失
 * </p>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
public class R<T> implements Serializable {

    /**
     * 状态码
     */
    private Integer code;

    /**
     * 状态说明文案
     */
    private String message;

    /**
     * 返回内容
     */
    private T data;

    private R(Integer code) {
        this.code = code;
    }

    private R(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    private R(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    @JsonIgnore
    @JSONField(serialize = false)
    public boolean isSuccess() {
        return Objects.equals(this.code, ResponseCode.SUCCESS.getCode());
    }

    public static <T> R<T> success() {
        return new R<>(ResponseCode.SUCCESS.getCode());
    }

    public static <T> R<T> success(String message) {
        return new R<>(ResponseCode.SUCCESS.getCode(), message);
    }

    public static <T> R<T> success(T data) {
        return new R<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getDesc(), data);
    }

    public static <T> R<T> fail() {
        return new R<>(ResponseCode.ERROR.getCode());
    }

    public static <T> R<T> fail(String message) {
        return new R<>(ResponseCode.ERROR.getCode(), message);
    }

    public static <T> R<T> fail(Integer code, String message) {
        return new R<>(code, message);
    }

    public static <T> R<T> fail(ResponseCode code) {
        return new R<>(code.getCode(), code.getDesc());
    }
}

```

```java
package top.wjstar.pan.core.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 项目公共返回状态码
 */
@AllArgsConstructor
@Getter
public enum ResponseCode {

    /**
     * 成功
     */
    SUCCESS(0, "SUCCESS"),
    /**
     * 错误
     */
    ERROR(1, "ERROR"),
    /**
     * token过期
     */
    TOKEN_EXPIRE(2, "TOKEN_EXPIRE"),
    /**
     * 参数错误
     */
    ERROR_PARAM(3, "ERROR_PARAM"),
    /**
     * 无权限访问
     */
    ACCESS_DENIED(4, "ACCESS_DENIED"),
    /**
     * 需要登录
     */
    NEED_LOGIN(10, "NEED_LOGIN"),
    ;

    /**
     * 状态码
     */
    private int code;

    /**
     * 状态描述
     */
    private String desc;
}

```

### core 模块的工具类下载地址

> 暂无

### web 模块

依赖`core`模块和`spring-boot-starter-web`

#### 跨域过滤器

```java
package top.wjstar.pan.web.filter;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.core.annotation.Order;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 支持跨域全局过滤器
 */
@WebFilter(filterName = "corsFilter")
@Order(1)
public class CorsFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        addCorsResponseHeader(response);
        filterChain.doFilter(servletRequest, servletResponse);
    }

    private void addCorsResponseHeader(HttpServletResponse response) {
        response.setHeader(CorsConfigEnum.CORS_ORIGIN.getKey(), CorsConfigEnum.CORS_ORIGIN.getValue());
        response.setHeader(CorsConfigEnum.CORS_CREDENTIALS.getKey(), CorsConfigEnum.CORS_CREDENTIALS.getValue());
        response.setHeader(CorsConfigEnum.CORS_METHODS.getKey(), CorsConfigEnum.CORS_METHODS.getValue());
        response.setHeader(CorsConfigEnum.CORS_MAX_AGE.getKey(), CorsConfigEnum.CORS_MAX_AGE.getValue());
        response.setHeader(CorsConfigEnum.CORS_HEADERS.getKey(), CorsConfigEnum.CORS_HEADERS.getValue());
    }

    @AllArgsConstructor
    @Getter
    public enum CorsConfigEnum {

        /**
         * 允许所有远程访问
         */
        CORS_ORIGIN("Access-Control-Allow-Origin", "*"),
        /**
         * 允许认证
         */
        CORS_CREDENTIALS("Access-Control-Allow-Credentials", "true"),
        /**
         * 允许远程调用的请求类型
         */
        CORS_METHODS("Access-Control-Allow-Methods", "POST, GET, PATCH, DELETE, PUT"),
        /**
         * 指定本次预检请求的有效期，单位是秒
         */
        CORS_MAX_AGE("Access-Control-Max-Age", "3600"),
        /**
         * 允许所有请求头
         */
        CORS_HEADERS("Access-Control-Allow-Headers", "*");

        private String key;
        private String value;
    }
}

```

## framework/swagger2 模块

`Swagger2ConfigProperties.java`

```java
package top.wjstar.pan.swagger2;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import top.wjstar.pan.core.constants.WPanConstants;

/**
 * swagger2配置类
 */
@Data
@Component
@ConfigurationProperties(prefix = "swagger2")
public class Swagger2ConfigProperties {

    private boolean show = true;

    private String groupName = "w-pan";

    private String basePackage = WPanConstants.BASE_COMPONENT_SCAN_PATH;

    private String title = "w-pan-server";

    private String description = "w-pan-server";

    private String termsOfServiceUrl = "http://127.0.0.1:${server.port}";

    private String contactName = "wxvirus";

    private String contactUrl = "https://wujiedeyouxi.com";

    private String contactEmail = "xxxxxx@qq.com";

    private String version = "1.0";
}

```

在`resoueces/META-INFO`下新建文件`additional-spring-configuration-metadata.json`

```json
{
    "properties": [
        {
            "name": "swagger2.show",
            "type": "java.lang.Boolean",
            "description": "是否展示接口文档",
            "defaultValue": true
        },
        {
            "name": "swagger2.group-name",
            "type": "java.lang.String",
            "description": "组名称",
            "defaultValue": "w-pan"
        },
        {
            "name": "swagger2.title",
            "type": "java.lang.String",
            "description": "接口文档标题",
            "defaultValue": "w-pan-server"
        },
        {
            "name": "swagger2.description",
            "type": "java.lang.String",
            "description": "接口文档描述",
            "defaultValue": "w-pan-server"
        },
        {
            "name": "swagger2.terms-of-service-url",
            "type": "java.lang.String",
            "description": "接口文档基础请求路径",
            "defaultValue": "http://127.0.0.1:${server.port}"
        },
        {
            "name": "swagger2.base-package",
            "type": "java.lang.String",
            "description": "接口文档基础接口扫描路径",
            "defaultValue": "top.wjstar.pan"
        },
        {
            "name": "swagger2.contact-name",
            "type": "java.lang.String",
            "description": "联系人名称",
            "defaultValue": "wxvirus"
        },
        {
            "name": "swagger2.contact-url",
            "type": "java.lang.String",
            "description": "联系人地址",
            "defaultValue": "https://www.wjstar.top"
        },
        {
            "name": "swagger2.contact-email",
            "type": "java.lang.String",
            "description": "联系人邮箱",
            "defaultValue": "无"
        },
        {
            "name": "swagger2.version",
            "type": "java.lang.String",
            "description": "项目版本",
            "defaultValue": "1.0"
        }
    ]
}
```

然后编译项目，在`server`模块中引入`swagger2`模块依赖

```xml
 <dependency>
    <groupId>top.wjstar.pan</groupId>
    <artifactId>w-pan-swagger2</artifactId>
    <version>1.0.0</version>
</dependency>
```

编译完项目之后，以及引入依赖之后，在`server`配置文件里使用

```yaml
swagger2:
    show: true
    group-name: ${spring.application.name}
    base-package: top.wjstar.pan
    title: w-pan-server docs
    description: w-pan-server docs
    terms-of-service-url: http://127.0.0.1:${server.port}
    contact-name: wxvirus
    contact-url: https://www.wjstar.top
    contact-email: xxxx@163.com
    version: 1.0
```

就会有对应的提示内容。

## 在 server 模块添加监听器

```java
package top.wjstar.pan.server.common.listener;

import lombok.extern.log4j.Log4j2;
import org.springframework.boot.ansi.AnsiColor;
import org.springframework.boot.ansi.AnsiOutput;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

/**
 * 详情启动成功时日志打印的监听器
 */
@Component
@Log4j2
public class StartedListener implements ApplicationListener<ApplicationReadyEvent> {

    /**
     * 项目启动成功将会在日志中输出对应的启动信息
     *
     * @param applicationReadyEvent
     */
    @Override
    public void onApplicationEvent(ApplicationReadyEvent applicationReadyEvent) {
        String serverPort = applicationReadyEvent.getApplicationContext().getEnvironment().getProperty("server.port");
        String serverUrl = String.format("http://%s:%s", "127.0.0.1", serverPort);
        log.info(AnsiOutput.toString(AnsiColor.BRIGHT_BLUE, "w pan server started at: ", serverUrl));

        if (checkShowServerSwaggerDoc(applicationReadyEvent.getApplicationContext())) {
            log.info(AnsiOutput.toString(AnsiColor.BRIGHT_BLUE, "w pan server's doc started at: ", serverUrl + "/doc.html"));
        }
        log.info(AnsiOutput.toString(AnsiColor.BRIGHT_YELLOW, "w pan server has started successfully!"));
    }

    /**
     * 校验是否开启了接口文档
     * 检测配置文件是否配置 swagger2.show: true
     * 检测容器中是否存在 bean 为 swagger2Config
     *
     * @param applicationContext
     * @return
     */
    private boolean checkShowServerSwaggerDoc(ConfigurableApplicationContext applicationContext) {
        return applicationContext.getEnvironment().getProperty("swagger2.show", Boolean.class, true) &&
                applicationContext.containsBean("swagger2Config");
    }
}

```

## 添加项目入参校验器-validator

```java
package top.wjstar.pan.web.validator;

import lombok.extern.log4j.Log4j2;
import org.hibernate.validator.HibernateValidator;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;
import top.wjstar.pan.core.constants.WPanConstants;

import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;

/**
 * 统一的参数校验器
 */
@SpringBootConfiguration
@Log4j2
public class WebValidatorConfig {

    private static final String FAIL_FAST_KEY = "hibernate.validator.fail_fast";

    /**
     * 参数后置处理器
     *
     * @return
     */
    @Bean
    public MethodValidationPostProcessor methodValidationPostProcessor() {
        MethodValidationPostProcessor postProcessor = new MethodValidationPostProcessor();
        postProcessor.setValidator(wPanValidator());
        log.info("The hibernate validator is loaded successfully");
        return postProcessor;
    }

    /**
     * 构造项目的方法参数校验器
     *
     * @return
     */
    private Validator wPanValidator() {
        ValidatorFactory factory = Validation.byProvider(HibernateValidator.class)
                .configure().addProperty(FAIL_FAST_KEY, WPanConstants.TRUE_STR)
                .buildValidatorFactory();
        Validator validator = factory.getValidator();
        return validator;
    }
}

```
