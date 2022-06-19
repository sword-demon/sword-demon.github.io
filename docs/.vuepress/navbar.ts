import { navbar } from 'vuepress-theme-hope'

export default navbar([
    '/',
    // '/home',
    {
        text: '后端笔记',
        icon: 'creative',
        link: '/views/',
        children: [
            {
                text: '后端学习',
                icon: 'code',
                link: '/views/',
                activeMatch: '^/code/$',
            },
            {
                text: 'Go',
                children: [
                    {
                        text: 'go语言基础',
                        link: '/views/go/',
                    },
                    {
                        text: 'go核心',
                        link: '/views/go-core/',
                    },
                ],
            },
            {
                text: 'Go-zero',
                children: ['/views/go-zero/'],
            },
        ],
    },
    // {
    //     text: '博文',
    //     icon: 'edit',
    //     prefix: '/posts/',
    //     children: [],
    // },
    {
        text: '随笔',
        link: '/posts/',
    },
    {
        text: 'Google',
        prefix: '/posts/',
        link: 'https://www.google.com',
    },
])
