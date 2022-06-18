import { defineUserConfig } from 'vuepress'
import theme from './theme'

export default defineUserConfig({
    lang: 'zh-CN',
    title: 'wxvirus',
    description: 'wxvirus blog and note',

    base: '/',

    theme,
})
