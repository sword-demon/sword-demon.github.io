import { sidebar } from 'vuepress-theme-hope'
import { go } from './go'
import { goZero } from './go-zero'

export const mySidebarConfig = sidebar({
    '/views/go/': go,
    '/views/go-zero': goZero,
})
