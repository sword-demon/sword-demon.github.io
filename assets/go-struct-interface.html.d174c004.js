const e=JSON.parse('{"key":"v-e2a82f40","path":"/views/go/go-struct-interface.html","title":"go\u7ED3\u6784\u4F53\u4E0E\u63A5\u53E3","lang":"zh-CN","frontmatter":{"title":"go\u7ED3\u6784\u4F53\u4E0E\u63A5\u53E3","category":["Go"],"date":"2022-05-24T00:00:00.000Z","tag":["struct","interface"],"summary":"# \u7C7B\u578B\u522B\u540D\u548C\u81EA\u5B9A\u4E49\u7C7B\u578B\\n# \u81EA\u5B9A\u4E49\u7C7B\u578B\\n\\n\u5728 Go \u8BED\u8A00\u4E2D\u6709\u4E00\u4E9B\u57FA\u672C\u7684\u6570\u636E\u7C7B\u578B\uFF0C\u5982string\u3001int\u3001\u6D6E\u70B9\u578B\u3001\u5E03\u5C14\u7B49\u6570\u636E\u7C7B\u578B\uFF0CGo \u8BED\u8A00\u4E2D\u53EF\u4EE5\u4F7F\u7528type\u5173\u952E\u5B57\u6765\u5B9A\u4E49\u81EA\u5B9A\u4E49\u7C7B\u578B\u3002\\n\\n\u81EA\u5B9A\u4E49\u7C7B\u578B\u662F\u5B9A\u4E49\u4E86\u4E00\u4E2A\u5168\u65B0\u7684\u7C7B\u578B\u3002\u6211\u4EEC\u53EF\u4EE5\u57FA\u4E8E\u5185\u7F6E\u7684\u57FA\u672C\u7C7B\u578B\u5B9A\u4E49\uFF0C\u4E5F\u53EF\u4EE5\u901A\u8FC7struct\u5B9A\u4E49\\n// \u5C06MyInt\u5B9A\u4E49\u4E3Aint\u7C7B\u578B\\ntype MyInt int\\n\u901A\u8FC7type\u5173\u952E\u5B57\u7684\u5B9A\u4E49\uFF0CMyInt\u5C31\u662F\u4E00\u79CD\u65B0\u7684\u7C7B\u578B\uFF0C\u5B83\u5177\u6709int\u7684\u7279\u6027\\nvar x MyInt = 100\\nfmt.Printf(\\"x=%T\\\\n\\", x) // x:main.MyInt\\n\\n\u81EA\u5B9A\u4E49\u7C7B\u578B\u662F\u7A0B\u5E8F\u5458\u6839\u636E\u81EA\u5DF1\u7684\u9700\u8981\u521B\u9020\u7684\u65B0\u7C7B\u578B\\n\\n# \u7C7B\u578B\u522B\u540D\\ntype NewInt = int\\n\u8FD9\u4E2A\u5B9E\u9645\u4E0A\u672C\u8D28\u8FD8\u662F\u539F\u6765\u7684int\u65E0\u975E\u5C31\u662F\u8D77\u4E86\u4E00\u4E2A\u5C0F\u540D\uFF0C\u522B\u540D\u3002\u6BD4\u5982\u7C7B\u578Brune\u5176\u5B9E\u5C31\u662Fint32\uFF0C\u8FD8\u6709byte\u5C31\u662Fuint8\u7C7B\u578B\u3002\\n\u5B9E\u9645\u4E0A\u5C31\u662F\u4E3A\u4E86\u65B9\u4FBF\u7406\u89E3\u800C\u5B58\u5728\u3002\\nvar x NewInt = 100\\nfmt.Printf(\\"x=%T\\\\n\\", x) // x:int\\n\\n\u7C7B\u578B\u522B\u540D\u53EA\u5728\u6E90\u6587\u4EF6\u4E2D\u751F\u6548\uFF0C\u7F16\u8BD1\u5B8C\u4E4B\u540E\uFF0C\u8FD8\u662F\u4F1A\u4EE5\u88AB\u66FF\u6362\u6210\u539F\u59CB\u7684int\u7C7B\u578B\\n\\n","head":[["meta",{"property":"og:url","content":"https://sword-demon.github.io/views/go/go-struct-interface.html"}],["meta",{"property":"og:site_name","content":"wxvirus"}],["meta",{"property":"og:title","content":"go\u7ED3\u6784\u4F53\u4E0E\u63A5\u53E3"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:updated_time","content":"2022-06-19T06:06:53.000Z"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"article:tag","content":"struct"}],["meta",{"property":"article:tag","content":"interface"}],["meta",{"property":"article:published_time","content":"2022-05-24T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2022-06-19T06:06:53.000Z"}]]},"excerpt":"<h2 id=\\"\u7C7B\u578B\u522B\u540D\u548C\u81EA\u5B9A\u4E49\u7C7B\u578B\\" tabindex=\\"-1\\"><a class=\\"header-anchor\\" href=\\"#\u7C7B\u578B\u522B\u540D\u548C\u81EA\u5B9A\u4E49\u7C7B\u578B\\" aria-hidden=\\"true\\">#</a> \u7C7B\u578B\u522B\u540D\u548C\u81EA\u5B9A\u4E49\u7C7B\u578B</h2>\\n<h3 id=\\"\u81EA\u5B9A\u4E49\u7C7B\u578B\\" tabindex=\\"-1\\"><a class=\\"header-anchor\\" href=\\"#\u81EA\u5B9A\u4E49\u7C7B\u578B\\" aria-hidden=\\"true\\">#</a> \u81EA\u5B9A\u4E49\u7C7B\u578B</h3>\\n<blockquote>\\n<p>\u5728 Go \u8BED\u8A00\u4E2D\u6709\u4E00\u4E9B\u57FA\u672C\u7684\u6570\u636E\u7C7B\u578B\uFF0C\u5982<code v-pre>string</code>\u3001<code v-pre>int</code>\u3001\u6D6E\u70B9\u578B\u3001\u5E03\u5C14\u7B49\u6570\u636E\u7C7B\u578B\uFF0CGo \u8BED\u8A00\u4E2D\u53EF\u4EE5\u4F7F\u7528<code v-pre>type</code>\u5173\u952E\u5B57\u6765\u5B9A\u4E49\u81EA\u5B9A\u4E49\u7C7B\u578B\u3002</p>\\n</blockquote>\\n<p>\u81EA\u5B9A\u4E49\u7C7B\u578B\u662F\u5B9A\u4E49\u4E86\u4E00\u4E2A\u5168\u65B0\u7684\u7C7B\u578B\u3002\u6211\u4EEC\u53EF\u4EE5\u57FA\u4E8E\u5185\u7F6E\u7684\u57FA\u672C\u7C7B\u578B\u5B9A\u4E49\uFF0C\u4E5F\u53EF\u4EE5\u901A\u8FC7<code v-pre>struct</code>\u5B9A\u4E49</p>\\n<div class=\\"language-go ext-go line-numbers-mode\\"><pre v-pre class=\\"language-go\\"><code><span class=\\"token comment\\">// \u5C06MyInt\u5B9A\u4E49\u4E3Aint\u7C7B\u578B</span>\\n<span class=\\"token keyword\\">type</span> MyInt <span class=\\"token builtin\\">int</span>\\n</code></pre><div class=\\"line-numbers\\" aria-hidden=\\"true\\"><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div></div></div><p>\u901A\u8FC7<code v-pre>type</code>\u5173\u952E\u5B57\u7684\u5B9A\u4E49\uFF0C<code v-pre>MyInt</code>\u5C31\u662F\u4E00\u79CD\u65B0\u7684\u7C7B\u578B\uFF0C\u5B83\u5177\u6709<code v-pre>int</code>\u7684\u7279\u6027</p>\\n<div class=\\"language-go ext-go line-numbers-mode\\"><pre v-pre class=\\"language-go\\"><code><span class=\\"token keyword\\">var</span> x MyInt <span class=\\"token operator\\">=</span> <span class=\\"token number\\">100</span>\\nfmt<span class=\\"token punctuation\\">.</span><span class=\\"token function\\">Printf</span><span class=\\"token punctuation\\">(</span><span class=\\"token string\\">\\"x=%T\\\\n\\"</span><span class=\\"token punctuation\\">,</span> x<span class=\\"token punctuation\\">)</span> <span class=\\"token comment\\">// x:main.MyInt</span>\\n</code></pre><div class=\\"line-numbers\\" aria-hidden=\\"true\\"><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div></div></div><blockquote>\\n<p>\u81EA\u5B9A\u4E49\u7C7B\u578B\u662F\u7A0B\u5E8F\u5458\u6839\u636E\u81EA\u5DF1\u7684\u9700\u8981\u521B\u9020\u7684\u65B0\u7C7B\u578B</p>\\n</blockquote>\\n<h3 id=\\"\u7C7B\u578B\u522B\u540D\\" tabindex=\\"-1\\"><a class=\\"header-anchor\\" href=\\"#\u7C7B\u578B\u522B\u540D\\" aria-hidden=\\"true\\">#</a> \u7C7B\u578B\u522B\u540D</h3>\\n<div class=\\"language-go ext-go line-numbers-mode\\"><pre v-pre class=\\"language-go\\"><code><span class=\\"token keyword\\">type</span> NewInt <span class=\\"token operator\\">=</span> <span class=\\"token builtin\\">int</span>\\n</code></pre><div class=\\"line-numbers\\" aria-hidden=\\"true\\"><div class=\\"line-number\\"></div></div></div><p>\u8FD9\u4E2A\u5B9E\u9645\u4E0A\u672C\u8D28\u8FD8\u662F\u539F\u6765\u7684<code v-pre>int</code>\u65E0\u975E\u5C31\u662F\u8D77\u4E86\u4E00\u4E2A\u5C0F\u540D\uFF0C\u522B\u540D\u3002\u6BD4\u5982\u7C7B\u578B<code v-pre>rune</code>\u5176\u5B9E\u5C31\u662F<code v-pre>int32</code>\uFF0C\u8FD8\u6709<code v-pre>byte</code>\u5C31\u662F<code v-pre>uint8</code>\u7C7B\u578B\u3002</p>\\n<p>\u5B9E\u9645\u4E0A\u5C31\u662F\u4E3A\u4E86\u65B9\u4FBF\u7406\u89E3\u800C\u5B58\u5728\u3002</p>\\n<div class=\\"language-go ext-go line-numbers-mode\\"><pre v-pre class=\\"language-go\\"><code><span class=\\"token keyword\\">var</span> x NewInt <span class=\\"token operator\\">=</span> <span class=\\"token number\\">100</span>\\nfmt<span class=\\"token punctuation\\">.</span><span class=\\"token function\\">Printf</span><span class=\\"token punctuation\\">(</span><span class=\\"token string\\">\\"x=%T\\\\n\\"</span><span class=\\"token punctuation\\">,</span> x<span class=\\"token punctuation\\">)</span> <span class=\\"token comment\\">// x:int</span>\\n</code></pre><div class=\\"line-numbers\\" aria-hidden=\\"true\\"><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div></div></div><blockquote>\\n<p>\u7C7B\u578B\u522B\u540D\u53EA\u5728\u6E90\u6587\u4EF6\u4E2D\u751F\u6548\uFF0C\u7F16\u8BD1\u5B8C\u4E4B\u540E\uFF0C\u8FD8\u662F\u4F1A\u4EE5\u88AB\u66FF\u6362\u6210\u539F\u59CB\u7684<code v-pre>int</code>\u7C7B\u578B</p>\\n</blockquote>\\n","headers":[{"level":2,"title":"\u7C7B\u578B\u522B\u540D\u548C\u81EA\u5B9A\u4E49\u7C7B\u578B","slug":"\u7C7B\u578B\u522B\u540D\u548C\u81EA\u5B9A\u4E49\u7C7B\u578B","children":[{"level":3,"title":"\u81EA\u5B9A\u4E49\u7C7B\u578B","slug":"\u81EA\u5B9A\u4E49\u7C7B\u578B","children":[]},{"level":3,"title":"\u7C7B\u578B\u522B\u540D","slug":"\u7C7B\u578B\u522B\u540D","children":[]}]},{"level":2,"title":"\u7ED3\u6784\u4F53","slug":"\u7ED3\u6784\u4F53","children":[{"level":3,"title":"\u5B9A\u4E49","slug":"\u5B9A\u4E49","children":[]},{"level":3,"title":"\u6CE8\u610F\uFF1A","slug":"\u6CE8\u610F","children":[]},{"level":3,"title":"\u521D\u59CB\u5316\u3001\u5B9E\u4F8B\u5316","slug":"\u521D\u59CB\u5316\u3001\u5B9E\u4F8B\u5316","children":[]},{"level":3,"title":"\u7ED3\u6784\u4F53\u6307\u9488","slug":"\u7ED3\u6784\u4F53\u6307\u9488","children":[]},{"level":3,"title":"\u8D4B\u503C","slug":"\u8D4B\u503C","children":[]},{"level":3,"title":"\u7ED3\u6784\u4F53\u6807\u7B7E","slug":"\u7ED3\u6784\u4F53\u6807\u7B7E","children":[]}]},{"level":2,"title":"\u7ED3\u6784\u4F53\u7684\u5185\u5B58\u5E03\u5C40","slug":"\u7ED3\u6784\u4F53\u7684\u5185\u5B58\u5E03\u5C40","children":[{"level":3,"title":"\u65B9\u6CD5\u548C\u63A5\u6536\u8005","slug":"\u65B9\u6CD5\u548C\u63A5\u6536\u8005","children":[]},{"level":3,"title":"\u7ED3\u6784\u4F53\u4E0E JSON \u5E8F\u5217\u5316","slug":"\u7ED3\u6784\u4F53\u4E0E-json-\u5E8F\u5217\u5316","children":[]},{"level":3,"title":"\u7ED3\u6784\u4F53\u65B9\u6CD5\u8865\u5145","slug":"\u7ED3\u6784\u4F53\u65B9\u6CD5\u8865\u5145","children":[]}]},{"level":2,"title":"\u63A5\u53E3","slug":"\u63A5\u53E3","children":[{"level":3,"title":"\u63A5\u53E3\u7684\u5B9A\u4E49","slug":"\u63A5\u53E3\u7684\u5B9A\u4E49","children":[]}]}],"git":{"createdTime":1655618813000,"updatedTime":1655618813000,"contributors":[{"name":"wxvirus","email":"1418667580@qq.com","commits":1}]},"readingTime":{"minutes":12.86,"words":3859},"filePathRelative":"views/go/go-struct-interface.md","localizedDate":"2022\u5E745\u670824\u65E5","copyright":"\u8457\u4F5C\u6743\u5F52wxvirus\u6240\u6709\\n\u57FA\u4E8EMIT\u534F\u8BAE\\n\u539F\u6587\u94FE\u63A5\uFF1Ahttps://sword-demon.github.io/views/go/go-struct-interface.html"}');export{e as data};