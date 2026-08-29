import { defineTeekConfig } from "vitepress-theme-teek/config";
import { vitepressPluginLegend } from "vitepress-plugin-legend";

export const teekConfig = defineTeekConfig({
  sidebarTrigger: true,
  teekHome: true,
  vpHome: false,
  backTop: {
    enabled: true,
  },
  markdown: {
    config: (md) => {
      vitepressPluginLegend(md, {
        markmap: {
          showToolbar: true,
        },
        mermaid: true,
        infographic: {
          showToolbar: false,
        },
      });
    },
  },
  comment: {
    provider: "giscus",
    options: {
      repo: "sword-demon/image_store",
      repoId: "R_kgDOGPk2RA",
      category: "Announcements",
      categoryId: "DIC_kwDOGPk2RM4CPwQc",
    },
  },
  author: {
    name: "wxvirus",
    link: "https://github.com/sword-demon",
  },
  blogger: {
    avatar: "https://sword-demon.github.io/vue-blog/logo.jpg",
    slogan: "无解的游戏，哈哈哈哈哈哈",
    shape: "circle-rotate",
    name: "wxvirus",
    description: "一个后端开发者",
    color: "#ffffff",
    circleSize: 120,
    status: {
      icon: "😪",
      size: 28,
      title: "困",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/sword-demon" }],
  },
  footerInfo: {
    copyright: {
      createYear: 2026,
      suffix: "Virus",
    },
  },
  codeBlock: {
    copiedDone: (TkMessage) => TkMessage.success("复制成功！"),
  },
  post: {
    showCapture: true,
  },
  articleBanner: {
    enabled: true,
  },
  articleShare: { enabled: true },
  vitePlugins: {
    sidebarOption: {
      initItems: false,
      ignoreIndexMd: true,
      ignoreList: ["assets"],
    },
  },
  friend: {
    list: [
      {
        name: "林阿三",
        desc: "前端大佬",
        avatar: "",
        link: "https://www.linasan.cn/",
      },
      {
        name: "CrazyCodeBoy",
        desc: "移动开发",
        avatar: "",
        link: "https://devio.org/",
      },
      {
        name: "Siam 博客",
        desc: "Siam",
        avatar: "",
        link: "https://blog.siammm.cn/",
      },
      {
        name: "老苗博客",
        desc: "多数笔记，少数牢骚",
        avatar: "",
        link: "https://miaoqiang.top/",
      },
      {
        name: "烨哥儿",
        desc: "前端同事",
        avatar: "",
        link: "https://yezhang24.github.io/",
      },
    ],
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // 将第三方库拆分到单独的 chunk
            vendor: ["vuepress-theme-teek", "vitepress"],
            // 将标记图渲染库单独拆分
            legend: ["vitepress-plugin-legend"],
            // Giscus 评论组件单独拆分
            giscus: ["@giscus/client"],
          },
        },
      },
      // 调整 chunk size 警告限制，避免这些警告干扰开发
      chunkSizeWarningLimit: 1000, // 从默认 500KB 调整为 1000KB
    },
  },
});
