import { hopeTheme } from 'vuepress-theme-hope'
import navbar from './navbar'
import { mySidebarConfig } from './sidebar'

export default hopeTheme({
    hostname: 'https://sword-demon.github.io',

    author: {
        name: 'wxvirus',
        url: 'https://sword-demon.github.io',
    },

    iconAssets: 'iconfont',

    logo: 'https://sword-demon.github.io/vue-blog/logo.jpg',

    repo: 'sword-demon/sword-demon.github.io',

    docsDir: 'docs',

    // navbar
    navbar: navbar,

    // sidebar
    sidebar: mySidebarConfig,

    footer: '无解的游戏',

    displayFooter: true,

    pageInfo: ['Author', 'Original', 'Date', 'Category', 'Tag', 'ReadingTime'],

    blog: {
        description: '一个后端开发者',
        intro: '/about/',
        medias: {
            Gitee: 'https://gitee.com/wxvirus',
            GitHub: 'https://github.com/sword-demon',
        },
        avatar: 'https://www.wjstar.top/img/avatar.jpeg',
        roundAvatar: true,
    },

    encrypt: {
        config: {
            '/guide/encrypt.html': ['1234'],
        },
    },

    plugins: {
        blog: {
            autoExcerpt: true,
        },
        copyCode: {
            showInMobile: true,
        },
        copyright: true,

        // 如果你不需要评论，可以直接删除 comment 配置，
        // 以下配置仅供体验，如果你需要评论，请自行配置并使用自己的环境，详见文档。
        // 为了避免打扰主题开发者以及消耗他的资源，请不要在你的正式环境中直接使用下列配置!!!!!
        comment: {
            /**
             * Using Giscus
             */
            provider: 'Giscus',
            repo: 'sword-demon/image_store',
            repoId: 'R_kgDOGPk2RA',
            category: 'Announcements',
            categoryId: 'DIC_kwDOGPk2RM4CPwQc',

            /**
             * Using Twikoo
             */
            // provider: "Twikoo",
            // envId: "https://twikoo.ccknbc.vercel.app",

            /**
             * Using Waline
             */
            // provider: "Waline",
            // serverURL: "https://vuepress-theme-hope-comment.vercel.app",
        },

        mdEnhance: {
            enableAll: true,
            presentation: {
                plugins: ['highlight', 'math', 'search', 'notes', 'zoom'],
            },
        },
    },
})
