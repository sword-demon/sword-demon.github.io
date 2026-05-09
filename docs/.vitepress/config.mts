import { defineConfig } from "vitepress";
import { teekConfig } from "./teekConfig.mts";

const descriptionTxt = "wxvirus blog and note";

export default defineConfig({
  extends: teekConfig,
  lang: "zh-CN",
  title: "无解的博客",
  description: descriptionTxt,
  base: "/",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "author", content: "wxvirus" }],
    ["meta", { property: "og:description", descriptionTxt }],
    ["meta", { name: "description", descriptionTxt }],
    ["meta", { name: "keywords", descriptionTxt }],
  ],
  markdown: {
    languageAlias: {
      flow: "bash",
      conf: "ini",
      m: "objc",
      纯文本: "bash",
    },
    // 开启行号
    lineNumbers: true,
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true,
    },
    // 更改容器默认值标题
    container: {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    },
  },
  themeConfig: {
    logo: "/logo.png",
    nav: [
      { text: "首页", link: "/" },
      {
        text: "AI",
        link: "/ai/tools/ccdesktop",
        activeMatch: "/ai/",
      },
      {
        text: "Python",
        items: [
          {
            text: "基础",
            link: "/python/base/",
          },
        ],
      },
      {
        text: "技术栈学习",
        items: [
          { text: "Go语言基础", link: "/views/go/" },
          { text: "Go核心", link: "/views/go-core/" },
          { text: "Go-zero框架", link: "/views/go-zero/" },
          { text: "运维技术", link: "/views/deploy/" },
          { text: "Rust语言", link: "/views/rust/" },
          { text: "Java技术", link: "/views/java/" },
          { text: "Redis", link: "/views/redis/" },
          { text: "RabbitMQ", link: "/views/rabbitmq/" },
          { text: "Vue3", link: "/views/vue3/" },
          { text: "React", link: "/views/react/" },
          { text: "AdonisJS", link: "/views/adonisjs/" },
          { text: "网络编程", link: "/views/socket/" },
          { text: "数据结构与算法", link: "/views/data-struct/" },
        ],
      },
      {
        text: "Linux",
        items: [
          { text: "Linux基础", link: "/linux/" },
          { text: "Linux C Core", link: "/linux/c-core/" },
          { text: "Linux PHP多进程", link: "/linux/process/" },
        ],
      },
      { text: "随笔", link: "/posts/" },
      { text: "面试", link: "/interview/" },
      {
        text: "功能页",
        items: [
          { text: "归档页", link: "/archives" },
          { text: "分类页", link: "/categories" },
          { text: "标签页", link: "/tags" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/sword-demon" }],
    search: {
      provider: "local",
    },
    sidebar: {
      "/python/base/": [
        {
          text: "Python 基础",
          collapsed: false,
          items: [
            { text: "概览", link: "/python/base/" },
            { text: "Python 线程", link: "/python/base/thread" },
          ],
        },
      ],
    },
  },
});
