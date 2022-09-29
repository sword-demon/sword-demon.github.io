const e=JSON.parse('{"key":"v-40f5d68c","path":"/views/go/go-module-unit.html","title":"\u5355\u5143\u6D4B\u8BD5","lang":"zh-CN","frontmatter":{"title":"\u5355\u5143\u6D4B\u8BD5","date":"2021-09-24T11:10:39.000Z","category":["Go"],"tag":["unit"],"summary":"# Go Package \u7BA1\u7406\u53D1\u5C55\u53F2\\nGo \u4F9D\u8D56\u7BA1\u7406\u662F\u901A\u8FC7 Git \u4ED3\u5E93\u6A21\u5F0F\u5B9E\u73B0\uFF0C\u5E76\u968F\u7740\u7248\u672C\u7684\u66F4\u8FED\u5DF2\u7ECF\u9010\u6E10\u5B8C\u5584\u3002\\n\\n\\nGOPAHT \u6A21\u5F0F\\n\\nGOPATH \u76EE\u5F55\u662F\u6240\u6709\u5DE5\u7A0B\u7684\u516C\u5171\u4F9D\u8D56\u5305\u76EE\u5F55\uFF0C\u6240\u6709\u9700\u8981\u7F16\u8BD1\u7684 go \u5DE5\u7A0B\u7684\u4F9D\u8D56\u5305\u90FD\u653E\u5728 GOPATH \u76EE\u5F55\u4E0B\u3002\\n\\n\\n\\nVendor \u7279\u6027\\n\\n\u4E3A\u4E86\u89E3\u51B3 GOPATH \u6A21\u5F0F\u4E0B\uFF0C\u591A\u4E2A\u5DE5\u7A0B\u9700\u8981\u5171\u4EAB GOPATH \u76EE\u5F55\uFF0C\u65E0\u6CD5\u9002\u7528\u4E8E\u591A\u4E2A\u5DE5\u7A0B\u5BF9\u4E8E\u4E0D\u540C\u7248\u672C\u7684\u4F9D\u8D56\u5305\u7684\u4F7F\u7528\uFF0C\u4E0D\u4FBF\u4E8E\u66F4\u65B0\u67D0\u4E2A\u4F9D\u8D56\u5305\u3002go1.6 \u4E4B\u540E\u5F00\u542F\u4E86 vendor \u76EE\u5F55\u3002\\n\\n\\n\\nGo Module \u5305\u7BA1\u7406\\n\\n\u4ECE go1.11 \u4EE5\u540E\u5F00\u59CB\u652F\u6301 Module \u4F9D\u8D56\u7BA1\u7406\u5DE5\u5177\uFF0C\u4ECE\u800C\u5B9E\u73B0\u4E86\u4F9D\u8D56\u5305\u7684\u8FDB\u884C\u5347\u7EA7\u66F4\u65B0\uFF0C\u5728 go1.13 \u7248\u672C\u540E\u9ED8\u8BA4\u6253\u5F00\\n\\n\\n\\n","head":[["meta",{"property":"og:url","content":"https://sword-demon.github.io/views/go/go-module-unit.html"}],["meta",{"property":"og:site_name","content":"wxvirus"}],["meta",{"property":"og:title","content":"\u5355\u5143\u6D4B\u8BD5"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:updated_time","content":"2022-06-19T08:36:49.000Z"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"article:tag","content":"unit"}],["meta",{"property":"article:published_time","content":"2021-09-24T11:10:39.000Z"}],["meta",{"property":"article:modified_time","content":"2022-06-19T08:36:49.000Z"}]]},"excerpt":"<h2 id=\\"go-package-\u7BA1\u7406\u53D1\u5C55\u53F2\\" tabindex=\\"-1\\"><a class=\\"header-anchor\\" href=\\"#go-package-\u7BA1\u7406\u53D1\u5C55\u53F2\\" aria-hidden=\\"true\\">#</a> Go Package \u7BA1\u7406\u53D1\u5C55\u53F2</h2>\\n<p>Go \u4F9D\u8D56\u7BA1\u7406\u662F\u901A\u8FC7 Git \u4ED3\u5E93\u6A21\u5F0F\u5B9E\u73B0\uFF0C\u5E76\u968F\u7740\u7248\u672C\u7684\u66F4\u8FED\u5DF2\u7ECF\u9010\u6E10\u5B8C\u5584\u3002</p>\\n<ul>\\n<li>\\n<p>GOPAHT \u6A21\u5F0F</p>\\n<blockquote>\\n<p>GOPATH \u76EE\u5F55\u662F\u6240\u6709\u5DE5\u7A0B\u7684\u516C\u5171\u4F9D\u8D56\u5305\u76EE\u5F55\uFF0C\u6240\u6709\u9700\u8981\u7F16\u8BD1\u7684 go \u5DE5\u7A0B\u7684\u4F9D\u8D56\u5305\u90FD\u653E\u5728 GOPATH \u76EE\u5F55\u4E0B\u3002</p>\\n</blockquote>\\n</li>\\n<li>\\n<p>Vendor \u7279\u6027</p>\\n<blockquote>\\n<p>\u4E3A\u4E86\u89E3\u51B3 GOPATH \u6A21\u5F0F\u4E0B\uFF0C\u591A\u4E2A\u5DE5\u7A0B\u9700\u8981\u5171\u4EAB GOPATH \u76EE\u5F55\uFF0C\u65E0\u6CD5\u9002\u7528\u4E8E\u591A\u4E2A\u5DE5\u7A0B\u5BF9\u4E8E\u4E0D\u540C\u7248\u672C\u7684\u4F9D\u8D56\u5305\u7684\u4F7F\u7528\uFF0C\u4E0D\u4FBF\u4E8E\u66F4\u65B0\u67D0\u4E2A\u4F9D\u8D56\u5305\u3002go1.6 \u4E4B\u540E\u5F00\u542F\u4E86 vendor \u76EE\u5F55\u3002</p>\\n</blockquote>\\n</li>\\n<li>\\n<p>Go Module \u5305\u7BA1\u7406</p>\\n<blockquote>\\n<p>\u4ECE go1.11 \u4EE5\u540E\u5F00\u59CB\u652F\u6301 Module \u4F9D\u8D56\u7BA1\u7406\u5DE5\u5177\uFF0C\u4ECE\u800C\u5B9E\u73B0\u4E86\u4F9D\u8D56\u5305\u7684\u8FDB\u884C\u5347\u7EA7\u66F4\u65B0\uFF0C\u5728 go1.13 \u7248\u672C\u540E\u9ED8\u8BA4\u6253\u5F00</p>\\n</blockquote>\\n</li>\\n</ul>\\n","headers":[{"level":2,"title":"Go Package \u7BA1\u7406\u53D1\u5C55\u53F2","slug":"go-package-\u7BA1\u7406\u53D1\u5C55\u53F2","children":[]},{"level":2,"title":"Using Go Module","slug":"using-go-module","children":[]},{"level":2,"title":"Go Modules Checksum","slug":"go-modules-checksum","children":[{"level":3,"title":"Go Modules Proxy","slug":"go-modules-proxy","children":[]}]},{"level":2,"title":"GOPROXY \u7F16\u8BD1\u90E8\u7F72","slug":"goproxy-\u7F16\u8BD1\u90E8\u7F72","children":[]},{"level":2,"title":"GoPROXY \u8BBF\u95EE\u5185\u7F51\u4ED3\u5E93","slug":"goproxy-\u8BBF\u95EE\u5185\u7F51\u4ED3\u5E93","children":[]},{"level":2,"title":"Unittest","slug":"unittest","children":[]}],"git":{"createdTime":1655627809000,"updatedTime":1655627809000,"contributors":[{"name":"wxvirus","email":"1418667580@qq.com","commits":1}]},"readingTime":{"minutes":5.73,"words":1720},"filePathRelative":"views/go/go-module-unit.md","localizedDate":"2021\u5E749\u670824\u65E5","copyright":"\u8457\u4F5C\u6743\u5F52wxvirus\u6240\u6709\\n\u57FA\u4E8EMIT\u534F\u8BAE\\n\u539F\u6587\u94FE\u63A5\uFF1Ahttps://sword-demon.github.io/views/go/go-module-unit.html"}');export{e as data};
