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
                children: ['/views/go/'],
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
        text: '百度',
        prefix: '/posts/',
        link: 'https://www.baidu.com',
    },
    {
        text: 'Google',
        prefix: '/posts/',
        link: 'https://www.google.com',
    },
])
