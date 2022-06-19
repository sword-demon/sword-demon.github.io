import { sidebar } from 'vuepress-theme-hope'
import { go } from './go'
import { goCore } from './go-core'
import { goZero } from './go-zero'
import { posts } from './post'

export const mySidebarConfig = sidebar({
    '/views/go/': go,
    '/views/go-zero': goZero,
    '/views/go-core': goCore,
    '/posts/': posts,
})
