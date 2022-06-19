import { sidebar } from 'vuepress-theme-hope'
import { go } from './go'
import { goCore } from './go-core'
import { goZero } from './go-zero'
import { posts } from './post'
import { sockets } from './socket'
import { cCore } from './c-core'
import { deploy } from './deploy'
import { dataStruct } from './data-struct'

export const mySidebarConfig = sidebar({
    '/views/go/': go,
    '/views/go-zero': goZero,
    '/views/go-core': goCore,
    '/posts/': posts,
    '/views/socket/': sockets,
    '/views/c-core/': cCore,
    '/views/deploy/': deploy,
    '/views/data-struct/': dataStruct,
})
