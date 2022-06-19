import { sidebar } from 'vuepress-theme-hope'

export default sidebar([
    '/',
    {
        text: 'Go',
        icon: 'note',
        prefix: '/views/go/',
        children: 'structure',
    },
    {
        text: 'Go-zero',
        icon: 'note',
        prefix: '/views/go-zero/',
        children: 'structure',
    },
    // {
    //     text: '文章',
    //     icon: 'note',
    //     prefix: '/posts/',
    //     children: 'structure',
    // },
])
