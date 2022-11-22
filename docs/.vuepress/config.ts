import { defineUserConfig } from 'vuepress'
import theme from './theme'
import { copyrightPlugin } from 'vuepress-plugin-copyright2'
import { searchPlugin } from '@vuepress/plugin-search'
import { componentsPlugin } from 'vuepress-plugin-components'

export default defineUserConfig({
    lang: 'zh-CN',
    title: '无解的游戏',
    description: 'wxvirus blog and note',

    base: '/',

    theme,
    plugins: [
        copyrightPlugin({
            author: 'wxvirus',
            license: 'MIT',
            hostname: 'https://sword-demon.github.io',
            global: true,
        }),
        searchPlugin({
            // 你的选项
        }),
        componentsPlugin({
            backToTop: true,
            components: ['Badge', 'CodePen', 'FontIcon', 'PDF', 'StackBlitz', 'YouTube'],
            iconAssets: 'iconfont',
        }),
    ],
})
