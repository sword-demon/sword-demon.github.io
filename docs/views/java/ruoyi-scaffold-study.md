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
