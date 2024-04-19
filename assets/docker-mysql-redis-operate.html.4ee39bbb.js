import{_ as e}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as n,e as a}from"./app.90ebc455.js";const i={},d=a(`<h2 id="mysql8-\u5BB9\u5668" tabindex="-1"><a class="header-anchor" href="#mysql8-\u5BB9\u5668" aria-hidden="true">#</a> MySQL8 \u5BB9\u5668</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> run -p <span class="token number">13306</span>:3306 --name java-mysql8 <span class="token punctuation">\\</span>
-v /Users/xxx/IDEAProjects/java-mysql8/log:/var/log/mysql <span class="token punctuation">\\</span>
-v /Users/xxx/IDEAProjects/java-mysql8/data:/var/lib/mysql <span class="token punctuation">\\</span>
-v /Users/xxx/IDEAProjects/java-mysql8/mysql-files:/var/lib/mysql-files <span class="token punctuation">\\</span>
-e <span class="token assign-left variable">MYSQL_ROOT_PASSWORD</span><span class="token operator">=</span>root <span class="token punctuation">\\</span>
-d mysql:8.0.30 <span class="token punctuation">\\</span>
--character-set-server<span class="token operator">=</span>utf8mb4 --collation-server<span class="token operator">=</span>utf8mb4_unicode_ci
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u8FDB\u5165\u5BB9\u5668</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token builtin class-name">exec</span> -it java-mysql8 <span class="token function">bash</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u4FEE\u6539\u5BC6\u7801</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>use mysql<span class="token punctuation">;</span>

alter user <span class="token string">&#39;root&#39;</span>@<span class="token string">&#39;localhost&#39;</span> identified with mysql_native_password by <span class="token string">&#39;\u65B0\u5BC6\u7801&#39;</span><span class="token punctuation">;</span>

flush privileges<span class="token punctuation">;</span>

<span class="token comment"># \u9000\u51FA ctrl d \u91CD\u65B0\u767B\u5F55</span>

<span class="token comment"># \u4FDD\u8BC1root\u7684\u5BC6\u7801\u6C38\u4E0D\u8FC7\u671F</span>
alter user <span class="token string">&#39;root&#39;</span>@<span class="token string">&#39;%&#39;</span> identified by <span class="token string">&#39;\u65B0\u5BC6\u7801&#39;</span> password expire never<span class="token punctuation">;</span>

update user <span class="token builtin class-name">set</span> <span class="token assign-left variable">host</span><span class="token operator">=</span><span class="token string">&#39;%&#39;</span> where user <span class="token operator">=</span> <span class="token string">&#39;root&#39;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u51FA\u73B0</p><p><code>ERROR 1062 (23000): Duplicate entry &#39;%-root&#39; for key &#39;user.PRIMARY&#39;</code>\u8BF4\u660E\u5DF2\u7ECF\u8BBE\u7F6E\u8FC7\u4E86\uFF0C\u5C31\u4E0D\u7528\u7BA1\u4E86\uFF0C\u76F4\u63A5\u5237\u65B0\u4E0B\u6743\u9650\u5373\u53EF\u3002</p><h2 id="\u751F\u4EA7\u73AF\u5883-docker-\u90E8\u7F72-mysql" tabindex="-1"><a class="header-anchor" href="#\u751F\u4EA7\u73AF\u5883-docker-\u90E8\u7F72-mysql" aria-hidden="true">#</a> \u751F\u4EA7\u73AF\u5883 Docker \u90E8\u7F72 mysql\uFF1F</h2><ul><li>\u4E91\u5E73\u53F0\u53EF\u4EE5\u52A8\u6001\u6269\u5C55<code>mysql</code>\uFF0C\u901A\u5E38\u4E2D\u5C0F\u4F01\u4E1A\u7684\u5E94\u7528\u57FA\u672C\u4E0D\u4F1A\u9891\u7E41\u5BF9<code>mysql</code>\u8FDB\u884C\u6269\u5BB9\u7684</li><li>\u6570\u636E\u5171\u4EAB\uFF0C\u662F\u4E0D\u80FD\u505A\u7684</li><li>\u4F7F\u7528<code>docker</code>\u4E4B\u540E\u4F1A\u53D1\u751F\u5185\u5B58\u72EC\u5360\uFF0C\u53EF\u80FD\u4F1A\u53D1\u751F\u6027\u80FD\u5F71\u54CD</li><li>\u201C\u4E0D\u8981\u628A\u9E21\u86CB\u653E\u5728\u4E00\u4E2A\u7BEE\u5B50\u91CC\u201D\uFF0C\u5176\u4ED6\u4E2D\u95F4\u4EF6\u4E00\u822C\u4E0D\u8981\u653E\u5728\u4E00\u4E2A\u5BB9\u5668\u91CC\u9762\uFF0C\u5C3D\u91CF\u8981\u89C4\u907F\u8FD9\u79CD\u4E00\u4E2A\u5BB9\u5668\u6302\u4E86\u7684\u98CE\u9669\uFF0C\u5C3D\u91CF\u6570\u636E\u5E93\u5355\u72EC\u90E8\u7F72\uFF0C\u6216\u8005\u76F4\u63A5\u4F7F\u7528\u4E91\u6570\u636E\u5E93\uFF0C\u5BF9\u4E8E\u6280\u672F\u6765\u8BB2\uFF0C\u9AD8\u53EF\u7528\uFF0C\u9AD8\u5E76\u53D1\uFF0C\u9AD8\u6027\u80FD\uFF0C\u4E09\u9AD8\uFF0C\u662F\u7EDD\u5BF9\u6CA1\u6709\u95EE\u9898\u7684\uFF0C\u4E5F\u652F\u6301\u5F39\u6027\u6269\u7F29\u5BB9\uFF0C\u8FD0\u7EF4\u6210\u672C\u4E5F\u8F83\u4F4E\uFF0C\u552F\u4E00\u7F3A\u70B9\u5C31\u662F\u8D35\u3002</li></ul><blockquote><p>MySQL \u81EA\u91CD\u542F</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> update java-mysql8 --restart<span class="token operator">=</span>always
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="\u5B89\u88C5redis" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5redis" aria-hidden="true">#</a> \u5B89\u88C5redis</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> search redis
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> pull redis:6.2.7
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> run -p <span class="token number">26379</span>:6379 --name java-redis6 <span class="token punctuation">\\</span>
-v /Users/xxx/IDEAProjects/redis6/data:/data <span class="token punctuation">\\</span>
-v /Users/xxx/IDEAProjects/redis6/conf/redis.conf:/etc/redis/redis.conf <span class="token punctuation">\\</span>
-d redis:6.2.7 <span class="token punctuation">\\</span>
redis-server /etc/redis/redis.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> update java-redis6 --restart<span class="token operator">=</span>always
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5728<code>redis.conf</code>\u91CC\u914D\u7F6E\u5185\u5BB9</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>requirepass root
appendonly yes
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u91CD\u542F</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> restart java-redis6
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="reids-\u6301\u4E45\u5316\u7B56\u7565" tabindex="-1"><a class="header-anchor" href="#reids-\u6301\u4E45\u5316\u7B56\u7565" aria-hidden="true">#</a> reids \u6301\u4E45\u5316\u7B56\u7565</h2><p>\u4E0A\u9762\u914D\u7F6E\u91C7\u7528\u7684\u662F<code>aof</code></p><ul><li>\u5FEB\u7167<code>RDB</code></li><li>\u65E5\u5FD7<code>AOF</code></li></ul><p>\u5047\u8BBE\u73B0\u5728\u662F\u51CC\u6668 1 \u70B9\u5F00\u59CB\u5907\u4EFD\uFF0C\u7531\u4E8E\u6709\u65F6\u95F4\u635F\u8017\uFF0C01 \u70B9\u949F 05 \u5206\u4EA7\u751F\u4E86 RDB \u6587\u4EF6\u4FDD\u5B58\u5230\u4E86\u78C1\u76D8\uFF0C\u90A3\u4E48\u4F1A\u6709\u5982\u4E0B\u95EE\u9898\uFF1A</p><ul><li>\u8FD9\u4E2A RDB \u6587\u4EF6\u7684\u5185\u5BB9\u662F\u51CC\u6668 1 \u70B9\u7684\u6570\u636E\uFF1F\u2705</li><li>\u8FD9\u4E2A RDB \u6587\u4EF6\u5185\u5BB9\u662F01 \u70B9\u949F 05 \u5206\u7684\u6570\u636E\uFF1F</li><li>\u8FD9\u4E2A RDB \u6587\u4EF6\u5185\u5BB9\u662F\u51CC\u6668 1 \u70B9\u7684\u6570\u636E\uFF0C\u5E76\u4E14\u8BB0\u5F55\u5F00\u59CB\u5907\u4EFD\u5230\u7ED3\u675F\uFF081 \u70B9\u5230 1 \u70B9 05 \u5206\u4E4B\u95F4\uFF09\u7684\u6570\u636E\uFF1F</li></ul><blockquote><p>RDB \u7684\u4FDD\u5B58\u65B9\u5F0F</p></blockquote><ul><li><code>save</code>\uFF1A\u5907\u4EFD<code>RDB</code>\u7684\u65F6\u5019\u4F1A\u963B\u585E\u5F53\u524D\u8FDB\u7A0B\uFF0C\u5907\u4EFD\u7684\u65F6\u5019\u662F\u4E0D\u5141\u8BB8\u518D\u6B21\u5199\u5165\u4E86\u3002</li><li><code>bgsave</code>\uFF1A<code>background save</code>\u540E\u53F0\u5F62\u5F0F\u4FDD\u5B58\uFF0C<code>fork</code>\u4E00\u4E2A\u65B0\u7684\u8FDB\u7A0B\uFF0C\u5B50\u8FDB\u7A0B\u4F1A\u5199\u6570\u636E\uFF0C\u7236\u8FDB\u7A0B\u63A5\u53D7\u65B0\u7684\u5199\u5165\u64CD\u4F5C\u5199\u5165\u5230\u78C1\u76D8\uFF0C\u4E24\u8005\u8FDB\u884C\u9694\u79BB\u3002</li></ul><blockquote><p>\u65E2\u7136<code>bgsave</code>\u8FD9\u4E48\u597D\u7528\uFF0C\u4E3A\u4EC0\u4E48\u8FD8\u8981\u4E00\u4E2A<code>save</code></p></blockquote><p><code>RDB</code>\u81EA\u52A8\u4FDD\u5B58</p><ul><li><code>save 900 1</code>: \u5982\u679C 900 \u79D2\u53D1\u751F 1 \u6B21\u66F4\u65B0\uFF0C\u5219\u5907\u4EFD<code>RDB</code></li><li><code>save 300 10</code>\uFF1A\u5982\u679C 300 \u79D2\u5185\u53D1\u751F 10 \u6B21\u66F4\u65B0\uFF0C\u5219\u5907\u4EFD<code>RDB</code></li><li><code>save 60 1000</code>: \u5982\u679C 60 \u79D2\u5185\u53D1\u751F 1000 \u6B21\u66F4\u65B0\uFF0C\u5219\u5907\u4EFD<code>RDB</code></li></ul><hr><p><code>RDB</code>\u4F18\u70B9</p><ul><li>\u5168\u91CF\u5907\u4EFD\uFF0C\u9002\u5408\u505A\u51B7\u5907</li><li>\u707E\u5907\u7B80\u5355</li><li>\u7236\u5B50\u8FDB\u7A0B\u76F8\u4E92\u9694\u79BB</li><li>\u76F8\u5BF9<code>AOF</code>\uFF0C\u5927\u6587\u4EF6\u7684\u542F\u52A8\u3001\u6062\u590D\u4F1A\u66F4\u5FEB</li></ul><p>\u7F3A\u70B9</p><ul><li>\u6545\u969C\u4E22\u5931\u6570\u636E\uFF0C\u53EF\u80FD\u4F1A\u4E22\u5931\u6700\u540E\u4E00\u6279\u65F6\u95F4\u7684\u5907\u4EFD\u6570\u636E</li><li>\u5B50\u8FDB\u7A0B\u5185\u5B58\u635F\u8017 <code>copy-on-write</code></li><li>\u5168\u91CF\u5B9E\u65F6\u5907\u4EFD\u4E0D\u9002\u7528</li></ul><h3 id="aof\u6301\u4E45\u5316\u6A21\u5F0F" tabindex="-1"><a class="header-anchor" href="#aof\u6301\u4E45\u5316\u6A21\u5F0F" aria-hidden="true">#</a> AOF\u6301\u4E45\u5316\u6A21\u5F0F</h3><blockquote><p>\u8FFD\u52A0\u5F0F\u7684\u4E00\u4E2A\u65E5\u5FD7\u5907\u4EFD\uFF0C<code>append</code>\u8FFD\u52A0\uFF0C\u4E0D\u662F\u4FEE\u6539\uFF1B\u5148\u6062\u590D<code>AOF</code>\uFF0C\u540E\u6062\u590D<code>RDB</code>\uFF0C\u5B83\u662F\u4ECE\u5934\u5230\u5C3E\u6062\u590D <code>AOF</code></p></blockquote><p><code>AOF</code>\u5F15\u53D1\u7684\u95EE\u9898</p><ul><li><code>AOF</code>\u7ECF\u5386\u591A\u5E74\uFF0C\u6709\u591A\u5927\uFF1F\u6700\u5927\u5360\u7528\u7A7A\u95F4\u4F1A\u4E0D\u4F1A\u8D85\u8FC7\u78C1\u76D8\uFF1F</li><li>\u6062\u590D 10 \u4E2A T \u7684\u6587\u4EF6\uFF0C\u4F1A\u4E0D\u4F1A\u5185\u5B58\u6EA2\u51FA\uFF1F\u6211\u4EEC\u53EF\u4EE5\u901A\u8FC7\u76F8\u5E94\u7684\u547D\u4EE4\u53BB\u538B\u7F29<code>AOF</code></li><li>\u5047\u8BBE\u771F\u6709\u4E00\u4E2A 10T \u7684\u6587\u4EF6\u9700\u8981\u6062\u590D\uFF0C\u9700\u8981\u591A\u4E45\uFF1F</li></ul><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code># AOF \u9ED8\u8BA4\u5173\u95ED\uFF0Cyes \u53EF\u4EE5\u5F00\u542F
appendonly no

# AOF \u7684\u6587\u4EF6\u540D
appendfilename &quot;appendonly.aof&quot;

# no: \u4E0D\u540C\u6B65
# everysec: \u6BCF\u79D2\u5907\u4EFD\uFF0C\u63A8\u8350\u4F7F\u7528
# always: \u6BCF\u6B21\u64CD\u4F5C\u90FD\u4F1A\u5907\u4EFD\uFF0C\u5B89\u5168\u5E76\u4E14\u6570\u636E\u5B8C\u6574\uFF0C\u4F46\u662F\u6162\u6027\u80FD\u5DEE
appendfsync everysec

# \u91CD\u5199\u7684\u65F6\u5019\u662F\u5426\u8981\u540C\u6B65\uFF0Cno\u53EF\u4EE5\u4FDD\u8BC1\u6570\u636E\u5B89\u5168
no-appendfsync-on-rewrite no

# \u91CD\u5199\u673A\u5236\uFF0C\u907F\u514D\u6587\u4EF6\u8D8A\u6765\u8D8A\u5927\uFF0C\u81EA\u52A8\u4F18\u5316\u538B\u7F29\u6307\u4EE4\uFF0C\u4F1A fork \u4E00\u4E2A\u65B0\u7684\u5B50\u8FDB\u7A0B\u53BB\u5B8C\u6210\u65B0\u7684\u52A8\u4F5C\uFF0C\u6B64\u65F6\u65E7\u7684 aof \u6587\u4EF6\u4E0D\u4F1A\u88AB\u8BFB\u53D6\u4F7F\u7528\uFF0C\u7C7B\u4F3C rdb
# \u5F53\u524D aof \u6587\u4EF6\u7684\u5927\u5C0F\u662F\u4E0A\u6B21 aof\u5927\u5C0F\u7684 100%\u5E76\u4E14\u6587\u4EF6\u4F53\u79EF\u8FBE\u5230 64m\uFF0C\uFF0C\u6162\u7C97\u4E24\u8005\u5219\u89E6\u53D1\u91CD\u5199
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="aof-rdb-\u6DF7\u5408\u6301\u4E45\u5316" tabindex="-1"><a class="header-anchor" href="#aof-rdb-\u6DF7\u5408\u6301\u4E45\u5316" aria-hidden="true">#</a> AOF&amp;RDB \u6DF7\u5408\u6301\u4E45\u5316</h3><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>aof-use-rdb-preamble yes
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="aof-\u4F18\u70B9" tabindex="-1"><a class="header-anchor" href="#aof-\u4F18\u70B9" aria-hidden="true">#</a> AOF \u4F18\u70B9</h3><ul><li>\u8010\u7528\u6027\u9AD8\uFF0C\u79D2\u7EA7\u522B\u5907\u4EFD</li><li><code>log</code>\u65E5\u5FD7\u8FFD\u52A0\uFF0C\u4E0D\u60E7\u6015\u78C1\u76D8\u5927\u5C0F\u9650\u5236\uFF0C\u4F53\u79EF\u53EF\u4EE5\u538B\u7F29</li><li><code>aof</code>\u8FC7\u5927\u91CD\u5199</li><li>\u65E5\u5FD7\u5F62\u5F0F\u66F4\u52A0\u6709\u5229\u4E8E<code>redis</code>\u89E3\u6790\u548C\u6062\u590D</li></ul><p>\u7F3A\u70B9</p><ul><li>\u76F8\u540C\u6570\u636E\u91CF\uFF0C<code>AOF</code>\u6BD4<code>RDB</code>\u5927\uFF0C\u6062\u590D\u65F6\u66F4\u8017\u65F6</li><li>\u540C\u6B65\u6BD4<code>RDB</code>\u6162</li><li><code>AOF</code>\u6570\u636E\u4E0D\u5B8C\u6574 <ul><li><code>redis-check-aof --fix [aof\u6587\u4EF6\u540D]</code> \u4FEE\u590D</li><li><code>aof-load-truncated yes</code></li></ul></li></ul><h2 id="docker-\u955C\u50CF\u6539\u53D8" tabindex="-1"><a class="header-anchor" href="#docker-\u955C\u50CF\u6539\u53D8" aria-hidden="true">#</a> Docker \u955C\u50CF\u6539\u53D8</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token function">diff</span> java-redis6
C /root
A /root/.rediscli_history
A /root/.bash_history
C /etc
A /etc/redis
A /etc/redis/redis.conf
C /tmp
A /tmp/tmp.DDgAWngiFi
A /tmp/tmp.dZpHD3eVh8
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>A = ADD</code>\u521B\u5EFA\u7684\u610F\u601D</p><p><code>C = CHANGE</code>\u66F4\u6539\u7684\u610F\u601D</p><p><code>D = DELETE</code>\u5220\u9664\u7684\u610F\u601D\uFF0C\u4E0A\u9762\u6211\u4EEC\u5E76\u6CA1\u6709\u64CD\u4F5C\u4EC0\u4E48</p><p><code>docker commit</code>\u53EF\u4EE5\u4FDD\u5B58\u5F53\u524D\u5FEB\u7167\u7684\u4FE1\u606F\u3002</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> commit --help

Usage:  <span class="token function">docker</span> commit <span class="token punctuation">[</span>OPTIONS<span class="token punctuation">]</span> CONTAINER <span class="token punctuation">[</span>REPOSITORY<span class="token punctuation">[</span>:TAG<span class="token punctuation">]</span><span class="token punctuation">]</span>

Create a new image from a container&#39;s changes

Aliases:
  <span class="token function">docker</span> container commit, <span class="token function">docker</span> commit

Options:
  -a, --author string    Author <span class="token punctuation">(</span>e.g., <span class="token string">&quot;John Hannibal Smith &lt;hannibal@a-team.com&gt;&quot;</span><span class="token punctuation">)</span>
  -c, --change list      Apply Dockerfile instruction to the created image
  -m, --message string   Commit message
  -p, --pause            Pause container during commit <span class="token punctuation">(</span>default <span class="token boolean">true</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> commit -a xxx -m <span class="token string">&quot;init new another redis&quot;</span> java-redis6 java-redis6:myRedis

<span class="token comment"># \u63D0\u4EA4\u8FC7\u540E</span>

<span class="token function">docker</span> images \u5C31\u4F1A\u53D1\u73B0\u672C\u5730\u591A\u4E86\u4E00\u4E2A\u5168\u65B0\u7684\u955C\u50CF
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> images <span class="token operator">|</span> <span class="token function">grep</span> redis
java-redis6                        myRedis   25335c1e46d8   <span class="token number">7</span> seconds ago   107MB
bitnami/redis                      latest    07652f42c464   <span class="token number">5</span> weeks ago     167MB
redis                              <span class="token number">6.2</span>.7     f52430d22479   <span class="token number">15</span> months ago   107MB
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u5982\u679C\u5F53\u524D\u7684\u955C\u50CF\u6709\u5F88\u591A\u7684<code>REPOSITORY</code>\u662F<code>&lt;none&gt;</code>\uFF0C\u53EF\u4EE5\u4F7F\u7528</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> image prune
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u53BB\u9664\u6E38\u79BB\u955C\u50CF</p></blockquote><p>\u4FEE\u6539<code>tag</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> tag SOURCE_IMAGE<span class="token punctuation">[</span>:TAG<span class="token punctuation">]</span> TARGET_IMAGE<span class="token punctuation">[</span>:TAG<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> tag java-redis6:myRedis java-redis6:myRedis-1.0.10
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u53C8\u4F1A\u589E\u52A0\u4E00\u4E2A\u955C\u50CF\uFF0C\u955C\u50CF ID \u662F\u4E00\u6837\uFF0C\u4ED6\u4EEC\u53EA\u4F1A\u5360\u7528\u4E00\u4EFD\u7684\u7A7A\u95F4\uFF0C\u53EA\u662F\u505A\u4E86\u4E00\u4E2A\u6807\u8BB0\uFF0C\u672C\u8D28\u4E0A\u8FD8\u662F\u539F\u6765\u7684\u90A3\u4E00\u4E2A\u3002</p><h2 id="\u8F6C\u5B58-docker-\u955C\u50CF" tabindex="-1"><a class="header-anchor" href="#\u8F6C\u5B58-docker-\u955C\u50CF" aria-hidden="true">#</a> \u8F6C\u5B58 Docker \u955C\u50CF</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token builtin class-name">export</span> -o myRedis.tar java-redis6
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5982\u679C\u9700\u8981\u5BFC\u5165</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token function">import</span> \u6587\u4EF6\u5730\u5740 redis:myRedis-another

<span class="token comment"># \u5728\u53E6\u5916\u7684\u673A\u5668\u67E5\u770B</span>
<span class="token function">docker</span> images
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4FDD\u5B58\u955C\u50CF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> save -o \u8981\u4FDD\u5B58\u7684\u6587\u4EF6\u540D\u7684\u7EDD\u5BF9\u5730\u5740.tar IMAGEID

<span class="token comment"># \u5982\u679C IMAGEID \u6362\u6210 tag\uFF0C\u5982\u679C\u80FD\u5339\u914D\u5230\u591A\u4E2A tag \u76F8\u4F3C\u7684\u90FD\u4F1A\u4E00\u8D77\u6253\u5305</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> load -i \u4FDD\u5B58\u7684\u6587\u4EF6\u540D.tar
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,68),l=[d];function c(o,r){return s(),n("div",null,l)}var p=e(i,[["render",c],["__file","docker-mysql-redis-operate.html.vue"]]);export{p as default};