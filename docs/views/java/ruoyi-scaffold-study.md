---
title: 若依脚手架
date: 2023-05-25 00:00:05
category: Java
tag:
    - RuoYi
---

# 若依脚手架

## 项目修改

1.  全局查找替换：`com.ruoyi`替换成你自己的一个名称，例如：`xxx.xxx`；选择`scope`范围会大一点,然后点击`replace all`

2.  全体查找替换：`3.8.*（后面可能是别的版本了）` 是一个脚手架的版本号，改成自己的版本号

3.  全局查找替换：`ruoyi`改成自己的项目名，**注意：这里要勾选上匹配大小写，将小写的`ruoyi`进行替换**

4.  若依中文改成自己的项目名

5.  按下`shift F6`重命名模块名，选择出现的弹框的第三个，`rename module and directory`

6.  `shift F6`修改项目名改成自己的

7.  修改包名，只修改根包就行，选择修改所有的，此时会出现一堆`com`包，可以将之删除

8.  全局搜索一些你现在修改的包的`xxx.xxx.common`，可能还会有漏掉的一些没改掉，这里还会有一个`xxx.xxx.项目.common`这样的格式

9.  搜索“验证码文本生成器”，这里的验证码的配置的包也要改一下

    ```java
    properties.setProperty(KAPTCHA_TEXTPRODUCER_IMPL, "xxx.xxx.项目名.framework.config.KaptchaTextCreator");
    ```

10. 修改`xxx-common`模块下的`config/RuoYiConfig`改成自己的名称【可选】

11. 修改启动类的名称【可选】

12. 若依启动的图标修改【可选】

13. 最后退出`idea`，打开项目目录修改目录名称为项目名

14. 把`.iml`和`target`以及`.idea`文件都删了

15. 重新打开后，发现还有未改的，全局搜索`xxx.xxx.system`改成`xxx.xxx.项目.system`

16. 再次启动之后，配合着若依的前端查看是否有用

17. `banner`调整：[https://bootschool.net/ascii](https://bootschool.net/ascii) 【可选】

18. 因为是全局修改的，所以里面自带的一些 SQL 的里面的内容也被修改了，如果已经生成表数据了，也可以选择重新执行一下

## 前端调整(RuoYi-Vue3)

-   你可以选择改项目名和文件夹名

-   以及`src/utils/ruoyi.js`改成`src/utils/youwant.js`

    这就得全局搜索`@/utils/ruoyi`进行批量替换

-   `src/assets/styles/ruoyi.scss`你也可以选择修改，但是同时也得修改引用它的地方

## 项目结构分析

-   依赖链最底层的是`common`，主要提供一些工具方法和一些依赖
-   上一层是`framework`主打配置相关
-   `system`是系统管理
-   `generator`是代码生成
-   `quartz`是做定时任务
-   `admin`统一入口，`controller`基本在这个里面写的，会调用上面 3 个各自的`service`

## 验证码响应结果分析

```json
{
    "msg": "操作成功",
    "img": "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",
    "code": 200,
    "captchaEnabled": true,
    "uuid": "39858fa857894f69a43a5f27ae71675b"
}
```

-   captchaEnabled：验证码开启
-   `img`：`base64`编码图片
-   `base64`转图片地址: [https://tool.jisuapi.com/base642pic.html](https://tool.jisuapi.com/base642pic.html)
-   `uuid`：相当于一个会话 id，使用`redis`存储验证码信息

-   验证码通过配置信息获取验证码是选用数学计算模式还是字符验证
-   存储验证码结果到 `redis` 里 2 分钟
-   使用的验证码的库是`github.com/penggle/kaptcha` [https://github.com/penggle/kaptcha](https://github.com/penggle/kaptcha)
-   在`framework`层进行配置

`xxx-framework/src/main/java/xxx.xxx.项目.framework.config.CaptchaConfig.java`还有一个`KaptchaTextCreator.java`

---

槽点：

```java
// KAPTCHA_SESSION_KEY
// 字面意思：将来生产验证码的时候，会自动将验证码的文本存储到 session 中
properties.setProperty(KAPTCHA_SESSION_CONFIG_KEY, "kaptchaCodeMath");
```

我们从`session`里获取的时候，却是`null`；确实是配置到`session`里的，上面是自定义接口返回的内容，如果不自定义的话，直接使用`kaptcha`提供的一个`controller`，有一个`Servlet`注册的`Bean`：`ServletRegistrationBean`

```java
@Configuration
public class CaptchaConfig {
    ServletRegistrationBean<HttpServlet> captchaServlet() {
        ServletRegistrationBean<HttpServlet> bean = new ServletRegistrationBean<HttpServlet>();
        bean.setServlet(new KaptchaServlet());
        bean.addUrlMapping("/image");
        bean.addInitParameter(KAPTCHA_BORDER, "yes");
        Properties properties = new Properties();
        // 是否有边框 默认为true 我们可以自己设置yes，no
        properties.setProperty(KAPTCHA_BORDER, "yes");
        // 边框颜色 默认为Color.BLACK
        properties.setProperty(KAPTCHA_BORDER_COLOR, "105,179,90");
        // 验证码文本字符颜色 默认为Color.BLACK
        properties.setProperty(KAPTCHA_TEXTPRODUCER_FONT_COLOR, "blue");
        // 验证码图片宽度 默认为200
        properties.setProperty(KAPTCHA_IMAGE_WIDTH, "160");
        // 验证码图片高度 默认为50
        properties.setProperty(KAPTCHA_IMAGE_HEIGHT, "60");
        // 验证码文本字符大小 默认为40
        properties.setProperty(KAPTCHA_TEXTPRODUCER_FONT_SIZE, "35");
        // KAPTCHA_SESSION_KEY
        properties.setProperty(KAPTCHA_SESSION_CONFIG_KEY, "kaptchaCodeMath");
        // 验证码文本生成器
        properties.setProperty(KAPTCHA_TEXTPRODUCER_IMPL, "top.wjstar.tienchin.framework.config.KaptchaTextCreator");
        // 验证码文本字符间距 默认为2
        properties.setProperty(KAPTCHA_TEXTPRODUCER_CHAR_SPACE, "3");
        // 验证码文本字符长度 默认为5
        properties.setProperty(KAPTCHA_TEXTPRODUCER_CHAR_LENGTH, "6");
        // 验证码文本字体样式 默认为new Font("Arial", 1, fontSize), new Font("Courier", 1, fontSize)
        properties.setProperty(KAPTCHA_TEXTPRODUCER_FONT_NAMES, "Arial,Courier");
        // 验证码噪点颜色 默认为Color.BLACK
        properties.setProperty(KAPTCHA_NOISE_COLOR, "white");
        // 干扰实现类
        properties.setProperty(KAPTCHA_NOISE_IMPL, "com.google.code.kaptcha.impl.NoNoise");
        // 图片样式 水纹com.google.code.kaptcha.impl.WaterRipple 鱼眼com.google.code.kaptcha.impl.FishEyeGimpy 阴影com.google.code.kaptcha.impl.ShadowGimpy
        properties.setProperty(KAPTCHA_OBSCURIFICATOR_IMPL, "com.google.code.kaptcha.impl.ShadowGimpy");
        bean.setInitParameters(new HashMap<>((Map)properties));
        return bean;
    }
}
```

如果使用`kaptcha`它提供的，这样配置，`session`里获取就是有效的;如果是自己写的接口，这个文本需要自己手动写到`session`里。所以这一行配置可以不需要，一方面这个接口是自定义的，另一方面这里是前后端分离，没有使用`session`。
