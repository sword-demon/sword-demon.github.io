import { sidebar } from 'vuepress-theme-hope'
import { go } from './go'
import { goCore } from './go-core'
import { goZero } from './go-zero'
import { posts } from './post'
import { sockets } from './socket'
import { cCore } from './c-core'
import { deploy } from './deploy'
import { dataStruct } from './data-struct'
import { qaSidebar } from './interview'
import { vueDoc } from './vue3'
import { Process } from './process'
import { rust } from './rust'

export const mySidebarConfig = sidebar({
    '/views/go/': go,
    '/views/go-zero': goZero,
    '/views/go-core': goCore,
    '/posts/': posts,
    '/views/socket/': sockets,
    '/linux/c-core/': cCore,
    '/views/deploy/': deploy,
    '/views/data-struct/': dataStruct,
    '/interview/': qaSidebar,
    '/views/vue3/': vueDoc,
    '/linux/process/': Process,
    '/views/rust': rust,
})
