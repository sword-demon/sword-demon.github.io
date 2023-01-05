import{_ as a}from"./plugin-vue_export-helper.21dcd24c.js";import{r as d,o as i,c,a as e,b as r,e as s,d as o}from"./app.6c46ef91.js";const t={},l=s(`<h2 id="\u4E0B\u8F7D\u5B89\u88C5-redis-\u955C\u50CF" tabindex="-1"><a class="header-anchor" href="#\u4E0B\u8F7D\u5B89\u88C5-redis-\u955C\u50CF" aria-hidden="true">#</a> \u4E0B\u8F7D\u5B89\u88C5 redis \u955C\u50CF</h2><p>\u9996\u5148\u5207\u6362\u5230<code>root</code>\u7528\u6237\uFF0C\u4E0D\u7136\u6BCF\u6B21\u90FD\u8981<code>sudo</code></p><p>\u4E0B\u8F7D<code>redis</code>\u7684\u6700\u65B0\u955C\u50CF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> pull redis
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u9ED8\u8BA4\u62C9\u53D6<code>latest</code>\u7248\u672C</p><h2 id="\u542F\u52A8-redis-\u5B9E\u4F8B" tabindex="-1"><a class="header-anchor" href="#\u542F\u52A8-redis-\u5B9E\u4F8B" aria-hidden="true">#</a> \u542F\u52A8 redis \u5B9E\u4F8B</h2><blockquote><p>\u8FD0\u884C redis \u5B9E\u4F8B\u5E76\u6620\u5C04\u7AEF\u53E3\u548C\u6302\u8F7D\u76EE\u5F55</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> run -p <span class="token number">6379</span>:6379 --name redis -v /mydata/redis/data:/data <span class="token punctuation">\\</span>
-v /mydata/redis/conf/redis.conf:/etc/redis/redis.conf <span class="token punctuation">\\</span>
-d redis redis-server /etc/redis/redis.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u914D\u7F6E\u6587\u4EF6</p><p>\u542F\u52A8<code>redis</code>\u5BB9\u5668\u8BFB\u53D6\u8BE5\u914D\u7F6E\u6587\u4EF6\u8FD0\u884C\u7684\u65F6\u5019\uFF0C\u6709\u65F6\u5019\uFF0C\u5BB9\u5668\u5185\u90E8<code>/etc/redis</code>\u53EA\u4F1A\u5230\u8FD9\u4E2A\u76EE\u5F55\uFF0C\u6240\u4EE5\u6211\u4EEC\u9700\u8981\u5728\u672C\u673A\u521B\u5EFA\u51FA\u6302\u8F7D\u76EE\u5F55\u91CC\u7684\u5BF9\u5E94<code>redis.conf</code>\u6587\u4EF6\uFF0C\u4EE5\u4FBF\u4E8E\u5BB9\u5668\u91CC\u4E5F\u5BF9\u5E94\u540C\u6B65\u914D\u7F6E\u6587\u4EF6\u5B58\u5728\u3002</p></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">mkdir</span> -p /mydata/redis/conf
<span class="token function">touch</span> /mydata/redis/conf/redis.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container danger"><p class="custom-container-title">\u5EFA\u8BAE</p><p><strong>\u5148\u521B\u5EFA\u6587\u4EF6\uFF0C\u518D\u53BB\u6267\u884C\u8FD0\u884C\u547D\u4EE4</strong></p></div><h2 id="\u6D4B\u8BD5\u4F7F\u7528" tabindex="-1"><a class="header-anchor" href="#\u6D4B\u8BD5\u4F7F\u7528" aria-hidden="true">#</a> \u6D4B\u8BD5\u4F7F\u7528</h2><p>\u4F7F\u7528<code>docker</code>\u547D\u4EE4\u6267\u884C<code>redis-cli</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token builtin class-name">exec</span> -it redis redis-cli
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u8FD9\u6837\u53EF\u4EE5\u8FDB\u5165<code>redis-cli</code>\u7684\u547D\u4EE4\u884C</p><div class="custom-container warning"><p class="custom-container-title">\u6301\u4E45\u5316</p><p>\u8FD9\u6837\u8FDB\u5165<code>redis-cli</code>\uFF0C<code>set</code>\u4E00\u4E2A\u5B57\u7B26\u4E32\u4E4B\u540E\uFF0C\u91CD\u542F\u6570\u636E\u5C31\u4F1A\u6D88\u5931\uFF0C\u6240\u4EE5\u6211\u4EEC\u8FD8\u9700\u8981\u914D\u7F6E\u6301\u4E45\u5316\u3002</p></div><blockquote><p>\u8BA9<code>redis</code>\u542F\u52A8<code>aof</code>\u7684\u6301\u4E45\u5316\u65B9\u5F0F</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> /mydata/redis/conf/redis.conf

<span class="token comment"># \u627E\u5230 appendonly \u9ED8\u8BA4\u4E3A\u6CE8\u91CA\u7684</span>

<span class="token comment"># \u4FEE\u6539\u4E3A\u5982\u4E0B\u5185\u5BB9</span>
appendonly <span class="token function">yes</span>

<span class="token comment"># \u6700\u540E\u8FDB\u884C\u4FDD\u5B58\u9000\u51FA</span>
esc :wq
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u914D\u7F6E\u5B8C\u6BD5\u4E4B\u540E\uFF0C\u91CD\u542F<code>redis</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> restart redis
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u91CD\u65B0\u8FDE\u63A5<code>redis-cli</code>\u6D4B\u8BD5\u6570\u636E\u3002</p><h2 id="redis-\u7684\u6574\u4E2A\u914D\u7F6E\u6587\u4EF6\u53EF\u4EE5\u914D\u7F6E\u4EC0\u4E48" tabindex="-1"><a class="header-anchor" href="#redis-\u7684\u6574\u4E2A\u914D\u7F6E\u6587\u4EF6\u53EF\u4EE5\u914D\u7F6E\u4EC0\u4E48" aria-hidden="true">#</a> redis \u7684\u6574\u4E2A\u914D\u7F6E\u6587\u4EF6\u53EF\u4EE5\u914D\u7F6E\u4EC0\u4E48</h2>`,22),p={href:"https://raw.githubusercontent.com/antirez/redis/4.0/redis.conf",target:"_blank",rel:"noopener noreferrer"},u=o("https://raw.githubusercontent.com/antirez/redis/4.0/redis.conf"),v=s(`<h2 id="\u914D\u7F6E\u81EA\u52A8\u542F\u52A8" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E\u81EA\u52A8\u542F\u52A8" aria-hidden="true">#</a> \u914D\u7F6E\u81EA\u52A8\u542F\u52A8</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sudo</span> <span class="token function">docker</span> update redis --restart<span class="token operator">=</span>always
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,2);function m(h,b){const n=d("ExternalLinkIcon");return i(),c("div",null,[l,e("p",null,[e("a",p,[u,r(n)])]),v])}var g=a(t,[["render",m],["__file","docker-install-redis.html.vue"]]);export{g as default};