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
            {
                text: '运维技术',
                children: ['/views/deploy/'],
            },
            {
                text: 'Rust',
                children: ['/views/rust/'],
            },
        ],
    },
    {
        text: 'Linux',
        link: '/linux/',
        children: [
            {
                text: 'Linux',
                icon: 'code',
                link: '/linux/',
                activeMatch: '^/code/$',
            },
            {
                text: 'Linux C Core',
                link: '/linux/c-core/',
            },
            {
                text: 'Linux PHP 多进程',
                link: '/linux/process/',
            },
        ],
    },
    {
        text: '网络编程',
        link: '/views/socket/',
    },
    {
        text: '数据结构与算法',
        link: '/views/data-struct/',
    },
    {
        text: '随笔',
        link: '/posts/',
    },
    {
        text: '面试',
        link: '/interview/',
    },
    {
        text: 'Vue3',
        link: '/views/vue3/',
    },
])
