import{_ as d}from"./plugin-vue_export-helper.21dcd24c.js";import{r,o,c,a as e,b as n,e as i,d as s}from"./app.f9bf5a07.js";const l={},t=i(`<h1 id="redis-\u7684-java-\u5BA2\u6237\u7AEF" tabindex="-1"><a class="header-anchor" href="#redis-\u7684-java-\u5BA2\u6237\u7AEF" aria-hidden="true">#</a> Redis \u7684 Java \u5BA2\u6237\u7AEF</h1><h2 id="redis-\u5BA2\u6237\u7AEF" tabindex="-1"><a class="header-anchor" href="#redis-\u5BA2\u6237\u7AEF" aria-hidden="true">#</a> redis \u5BA2\u6237\u7AEF</h2><p>redis \u652F\u6301\u591A\u79CD\u8BED\u8A00\u7684\u5BA2\u6237\u7AEF</p><p><code>redis</code>\u53EF\u4EE5\u901A\u8FC7\u81EA\u5E26\u7684<code>redis-cli</code>\u8FDB\u884C\u8FDE\u63A5</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>./redis-cli -h <span class="token function">ip</span> -p port -a \u5BC6\u7801

<span class="token comment"># \u6848\u4F8B</span>
./redis-cli -h <span class="token number">192.168</span>.0.100 -p <span class="token number">6379</span> -a <span class="token number">123456</span>

<span class="token comment"># \u9000\u51FA</span>
quit
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u5C31\u662F\u8FDE\u63A5\u7684\u672C\u673A\u670D\u52A1\uFF0C\u4EE5\u53CA\u7AEF\u53E3\u6CA1\u6709\u6539\u53D8\uFF0C<code>-h</code>\u548C<code>-p</code>\u90FD\u662F\u53EF\u4EE5\u7701\u7565\u7684\uFF0C\u6700\u7EC8\u5C31\u53EA\u9700\u8981\u8F93\u5165\u5BC6\u7801\u5373\u53EF\uFF0C\u5982\u679C\u6CA1\u6709\u8BBE\u7F6E\u5BC6\u7801\uFF0C\u90A3\u4E5F\u4E0D\u9700\u8981\u4E86\uFF0C\u5373\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>./redis-cli -a <span class="token number">123456</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="\u5E38\u7528\u547D\u4EE4" tabindex="-1"><a class="header-anchor" href="#\u5E38\u7528\u547D\u4EE4" aria-hidden="true">#</a> \u5E38\u7528\u547D\u4EE4</h3><p>\u8BBE\u7F6E\u63D2\u5165\u4E00\u6761\u6570\u636E\uFF0C\u9ED8\u8BA4\u63D2\u5165<code>0</code>\u53F7\u5E93\u91CC</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> <span class="token builtin class-name">set</span> username zhangsan
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u901A\u8FC7<code>get</code>\u6765\u83B7\u53D6\u6570\u636E</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> get username
<span class="token string">&quot;zhangsan&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u9009\u62E9\u4E0D\u540C\u7684\u5E93</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> <span class="token keyword">select</span> <span class="token number">2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5B58\u5165\u5C42\u7EA7\u5B58\u50A8\u7684\u6570\u636E\u7528\u6765\u66FF\u6362\u5173\u7CFB\u6570\u636E\u5E93\u4E2D\u201C\u8868\u201D\u7684\u6982\u5FF5: \u8BBE\u7F6E\u67D0\u9879\u76EE\u4E2D\u7528\u6237\u4E3B\u952E\u4E3A 1 \u7684\u4E3A\u201Czhangsan\u201D</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> <span class="token builtin class-name">set</span> xxx:users:1 zhangsan
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u83B7\u53D6\u7684\u65F6\u5019\uFF0C\u600E\u4E48\u8BBE\u7F6E\u7684\u5C31\u600E\u4E48\u83B7\u53D6\uFF0C\u5982\u679C\u5728\u684C\u9762\u5BA2\u6237\u7AEF\u91CC\u67E5\u770B\u4F1A\u6709\u4E00\u4E2A\u5F88\u660E\u663E\u7684\u5C42\u7EA7\u5173\u7CFB</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> get xxx:users:1
<span class="token string">&quot;zhangsan&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u67E5\u8BE2\u5F53\u524D\u6240\u5728\u7684\u5E93\u6709\u591A\u5C11<code>key</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> keys *
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><code>info</code>\u547D\u4EE4\u6765\u67E5\u770B\u4E00\u4E9B\u4FE1\u606F\uFF0C\u53EF\u4EE5\u67E5\u770B\u5F53\u524D CPU \u4F7F\u7528\u7387\uFF0C\u6216\u8005\u67E5\u770B\u4E3B\u4ECE\u6A21\u5F0F\u548C\u96C6\u7FA4\uFF0C\u4E5F\u53EF\u4EE5\u76F4\u63A5\u67E5\u770B\u4E00\u4E2A\u8BE6\u7EC6\u7684<code>info</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> info <span class="token punctuation">[</span>section<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>\u6E05\u9664\u6240\u6709\u7684<code>key</code></strong>\uFF0C<strong>\u6CE8\u610F\uFF1A\u4E00\u822C\u5B9E\u9645\u9879\u76EE\u4E2D\u8C28\u614E\u4F7F\u7528</strong></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">127.0</span>.0.1:637<span class="token operator"><span class="token file-descriptor important">9</span>&gt;</span> FLUSHALL
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="java-\u5BA2\u6237\u7AEF" tabindex="-1"><a class="header-anchor" href="#java-\u5BA2\u6237\u7AEF" aria-hidden="true">#</a> java \u5BA2\u6237\u7AEF</h2>`,25),p={href:"https://redis.io/resources/clients/#java",target:"_blank",rel:"noopener noreferrer"},u=s("https://redis.io/resources/clients/#java"),v=i('<p>\u6BD4\u8F83\u53D7\u6B22\u8FCE\u7684\u662F<code>Jedis</code>\u548C<code>Lettuce</code></p><ul><li><code>Jedis</code>\u5728\u5B9E\u73B0\u4E0A\u662F\u76F4\u63A5\u8FDE\u63A5<code>redis server</code>\uFF0C\u5982\u679C\u5728\u591A\u7EBF\u7A0B\u73AF\u5883\u4E0B\u662F\u975E\u7EBF\u7A0B\u5B89\u5168\u7684\uFF0C\u8FD9\u4E2A\u65F6\u5019\u53EA\u6709\u4F7F\u7528\u8FDE\u63A5\u6C60\uFF0C\u4E3A\u6BCF\u4E2A<code>Jedis</code>\u5B9E\u4F8B\u589E\u52A0\u7269\u7406\u8FDE\u63A5</li><li><code>Lettuce</code>\u7684\u8FDE\u63A5\u662F\u57FA\u4E8E<code>Netty</code>\u7684\uFF0C\u8FDE\u63A5\u5B9E\u4F8B\u53EF\u4EE5\u5728\u591A\u4E2A\u7EBF\u7A0B\u5E76\u53D1\u8BBF\u95EE\uFF0C\u56E0\u4E3A<code>StatefulRdisConnection</code>\u662F\u7EBF\u7A0B\u5B89\u5168\u7684\uFF0C\u9501\u4E00\u4E2A\u8FDE\u63A5\u5B9E\u4F8B\u5C31\u53EF\u4EE5\u6EE1\u8DB3\u591A\u7EBF\u7A0B\u73AF\u5883\u4E0B\u7684\u5E76\u53D1\u8BBF\u95EE\uFF0C\u8FD9\u4E2A\u4E5F\u662F\u53EF\u4F38\u7F29\u7684\u8BBE\u8BA1\uFF0C\u4E00\u4E2A\u8FDE\u63A5\u5B9E\u4F8B\u4E0D\u591F\u7684\u60C5\u51B5\u4E0B\u4E5F\u53EF\u4EE5\u6309\u9700\u589E\u52A0\u5B9E\u4F8B\u8FDE\u63A5\u3002</li><li>\u5728<code>SpringBoot Dta Redis 1.x</code>\u4E4B\u524D\u9ED8\u8BA4\u4F7F\u7528\u7684\u662F<code>Jedis</code>\uFF0C\u4F46\u76EE\u524D\u6700\u65B0\u7248\u7684\u4FEE\u6539\u6210\u4E86<code>Lettuce</code></li><li>\u603B\u5F97\u6765\u8BF4,<code>Jedis</code>\u6027\u80FD\u4F1A\u4F18\u4E8E<code>Lettuce</code>\uFF0C\u56E0\u4E3A\u4ED6\u662F\u76F4\u63A5\u8FDE\u63A5<code>redis server</code>\u7684</li></ul><h3 id="jedis-\u5BA2\u6237\u7AEF" tabindex="-1"><a class="header-anchor" href="#jedis-\u5BA2\u6237\u7AEF" aria-hidden="true">#</a> Jedis \u5BA2\u6237\u7AEF</h3>',3),h={href:"https://mvnrepository.com/artifact/redis.clients/jedis",target:"_blank",rel:"noopener noreferrer"},m=s("maven \u5E93"),b=e("blockquote",null,[e("p",null,[s("\u4F7F\u7528"),e("code",null,"IDEA"),s("\u521B\u5EFA\u4E00\u4E2A\u7B80\u5355\u7684"),e("code",null,"maven"),s("\u9879\u76EE\u5F15\u5165\u5BF9\u5E94\u7684"),e("code",null,"jedis"),s("\u4F9D\u8D56")])],-1);function g(k,f){const a=r("ExternalLinkIcon");return o(),c("div",null,[t,e("p",null,[e("a",p,[u,n(a)])]),v,e("p",null,[e("a",h,[m,n(a)])]),b])}var j=d(l,[["render",g],["__file","redis-java-client.html.vue"]]);export{j as default};
