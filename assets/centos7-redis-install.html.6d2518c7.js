import{_ as a}from"./plugin-vue_export-helper.21dcd24c.js";import{r as i,o as l,c,a as s,b as o,d as n,e as t}from"./app.bc88c74d.js";const r={},d=s("h1",{id:"redis-\u5B89\u88C5",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#redis-\u5B89\u88C5","aria-hidden":"true"},"#"),n(" Redis \u5B89\u88C5")],-1),p=s("h2",{id:"\u4E0B\u8F7D\u5B89\u88C5\u5305",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#\u4E0B\u8F7D\u5B89\u88C5\u5305","aria-hidden":"true"},"#"),n(" \u4E0B\u8F7D\u5B89\u88C5\u5305")],-1),u=n("\u4E0B\u8F7D\u5730\u5740\uFF1A"),m={href:"https://redis.io.download",target:"_blank",rel:"noopener noreferrer"},v=n("https://redis.io/download"),b=n("\uFF0C\u4E00\u822C\u4E0B\u8F7D\u7A33\u5B9A\u7248(Stable)"),k=t(`<div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>yum <span class="token function">install</span> -y <span class="token function">wget</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">wget</span> -P /usr/local/src/ https://download.redis.io/releases/redis-6.0.17.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="\u5B89\u88C5-c-\u8BED\u8A00\u4F9D\u8D56" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-c-\u8BED\u8A00\u4F9D\u8D56" aria-hidden="true">#</a> \u5B89\u88C5 C \u8BED\u8A00\u4F9D\u8D56</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>yum <span class="token function">install</span> -y gcc-c++ autoconf automake
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u5728\u7F16\u8BD1<code>Redis6</code>\u4E4B\u524D\u9700\u8981\u5347\u7EA7<code>gcc</code>\u7684\u7248\u672C\uFF0C\u9ED8\u8BA4<code>yum</code>\u5B89\u88C5\u7684<code>gcc</code>\u7248\u672C\u662F<code>4.8.5</code>\uFF0C\u7531\u4E8E\u7248\u672C\u8FC7\u4F4E\uFF0C\u5728\u7F16\u8BD1\u65F6\u4F1A\u62A5\u9519\uFF0C\u6211\u4EEC\u9700\u8981\u5347\u7EA7<code>gcc</code></p></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u5B89\u88C5 scl \u6E90</span>
yum <span class="token function">install</span> -y centos-release-scl scl-utils-build
<span class="token comment"># \u5B89\u88C5 9 \u7248\u672C\u7684 gcc\u3001gcc-c++ gdb\u5DE5\u5177\u94FE</span>
yum <span class="token function">install</span> -y devtoolset-9-toolchain
<span class="token comment"># \u4E34\u65F6\u8986\u76D6\u7CFB\u7EDF\u539F\u56E0\u7684 gcc \u5F15\u7528</span>
scl <span class="token builtin class-name">enable</span> devtoolset-9 <span class="token function">bash</span>
<span class="token comment"># \u67E5\u770B gcc \u7684\u7248\u672C</span>
gcc -v
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos redis-6.0.17<span class="token punctuation">]</span><span class="token comment"># gcc -v</span>
Using built-in specs.
<span class="token assign-left variable">COLLECT_GCC</span><span class="token operator">=</span>gcc
<span class="token assign-left variable">COLLECT_LTO_WRAPPER</span><span class="token operator">=</span>/opt/rh/devtoolset-9/root/usr/libexec/gcc/x86_64-redhat-linux/9/lto-wrapper
Target: x86_64-redhat-linux
Configured with: <span class="token punctuation">..</span>/configure --enable-bootstrap --enable-languages<span class="token operator">=</span>c,c++,fortran,lto --prefix<span class="token operator">=</span>/opt/rh/devtoolset-9/root/usr --mandir<span class="token operator">=</span>/opt/rh/devtoolset-9/root/usr/share/man --infodir<span class="token operator">=</span>/opt/rh/devtoolset-9/root/usr/share/info --with-bugurl<span class="token operator">=</span>http://bugzilla.redhat.com/bugzilla --enable-shared --enable-threads<span class="token operator">=</span>posix --enable-checking<span class="token operator">=</span>release --enable-multilib --with-system-zlib --enable-__cxa_atexit --disable-libunwind-exceptions --enable-gnu-unique-object --enable-linker-build-id --with-gcc-major-version-only --with-linker-hash-style<span class="token operator">=</span>gnu --with-default-libstdcxx-abi<span class="token operator">=</span>gcc4-compatible --enable-plugin --enable-initfini-array --with-isl<span class="token operator">=</span>/builddir/build/BUILD/gcc-9.3.1-20200408/obj-x86_64-redhat-linux/isl-install --disable-libmpx --enable-gnu-indirect-function --with-tune<span class="token operator">=</span>generic --with-arch_32<span class="token operator">=</span>x86-64 --build<span class="token operator">=</span>x86_64-redhat-linux
Thread model: posix
gcc version <span class="token number">9.3</span>.1 <span class="token number">20200408</span> <span class="token punctuation">(</span>Red Hat <span class="token number">9.3</span>.1-2<span class="token punctuation">)</span> <span class="token punctuation">(</span>GCC<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u89E3\u538B" tabindex="-1"><a class="header-anchor" href="#\u89E3\u538B" aria-hidden="true">#</a> \u89E3\u538B</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">tar</span> -zxvf redis-6.0.17.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="\u7F16\u8BD1\u5B89\u88C5" tabindex="-1"><a class="header-anchor" href="#\u7F16\u8BD1\u5B89\u88C5" aria-hidden="true">#</a> \u7F16\u8BD1\u5B89\u88C5</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> redis-6.0.17
<span class="token function">make</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230214221720589.png" alt="image-20230214221720589" loading="lazy"></p><p>\u4F20\u7EDF\u65B9\u5F0F\u4E0B\u9762\u5C31\u662F<code>make install</code>\uFF0C\u4F46\u662F\u5462\u8FD9\u6837\u4F1A\u6267\u884C\u9ED8\u8BA4\u5B89\u88C5\uFF0C\u6211\u4EEC\u4EE5\u540E\u627E\u5BF9\u5E94\u7684\u4E1C\u897F\u90FD\u662F\u56DB\u6563\u800C\u5F00\u7684\uFF0C\u5C31\u548C<code>windows</code>\u4E0B\u9ED8\u8BA4\u5B89\u88C5\u5230 C \u76D8\u4E00\u6837\u7684\uFF1B\u6211\u4EEC\u53EF\u4EE5\u81EA\u5DF1\u5B9A\u4E49\u76EE\u5F55\u5B58\u50A8</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">mkdir</span> -p /usr/local/redis
<span class="token function">make</span> <span class="token assign-left variable">PREFIX</span><span class="token operator">=</span>/usr/local/redis/ <span class="token function">install</span>

<span class="token comment"># \u6267\u884C\u6548\u679C</span>
<span class="token builtin class-name">cd</span> src <span class="token operator">&amp;&amp;</span> <span class="token function">make</span> <span class="token function">install</span>
make<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span>: \u8FDB\u5165\u76EE\u5F55\u201C/usr/local/src/redis-6.0.17/src\u201D

Hint: It<span class="token string">&#39;s a good idea to run &#39;</span><span class="token function">make</span> test&#39; <span class="token punctuation">;</span><span class="token punctuation">)</span>

    INSTALL <span class="token function">install</span>
    INSTALL <span class="token function">install</span>
    INSTALL <span class="token function">install</span>
    INSTALL <span class="token function">install</span>
    INSTALL <span class="token function">install</span>
make<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span>: \u79BB\u5F00\u76EE\u5F55\u201C/usr/local/src/redis-6.0.17/src\u201D
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u67E5\u770B\u76EE\u5F55\u5185\u5BB9</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos bin<span class="token punctuation">]</span><span class="token comment"># ll</span>
\u603B\u7528\u91CF <span class="token number">38208</span>
-rwxr-xr-x <span class="token number">1</span> root root <span class="token number">4746312</span> <span class="token number">2</span>\u6708  <span class="token number">14</span> <span class="token number">22</span>:22 redis-benchmark
-rwxr-xr-x <span class="token number">1</span> root root <span class="token number">9765104</span> <span class="token number">2</span>\u6708  <span class="token number">14</span> <span class="token number">22</span>:22 redis-check-aof
-rwxr-xr-x <span class="token number">1</span> root root <span class="token number">9765104</span> <span class="token number">2</span>\u6708  <span class="token number">14</span> <span class="token number">22</span>:22 redis-check-rdb
-rwxr-xr-x <span class="token number">1</span> root root <span class="token number">5069752</span> <span class="token number">2</span>\u6708  <span class="token number">14</span> <span class="token number">22</span>:22 redis-cli
lrwxrwxrwx <span class="token number">1</span> root root      <span class="token number">12</span> <span class="token number">2</span>\u6708  <span class="token number">14</span> <span class="token number">22</span>:22 redis-sentinel -<span class="token operator">&gt;</span> redis-server
-rwxr-xr-x <span class="token number">1</span> root root <span class="token number">9765104</span> <span class="token number">2</span>\u6708  <span class="token number">14</span> <span class="token number">22</span>:22 redis-server
<span class="token punctuation">[</span>root@VM-16-4-centos bin<span class="token punctuation">]</span><span class="token comment"># pwd</span>
/usr/local/redis/bin
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5B89\u88C5\u6210\u529F\u540E\u7684\u51E0\u4E2A\u6587\u4EF6\u89E3\u91CA</p><ul><li><code>redis-benchmark</code> \u6027\u80FD\u6D4B\u8BD5\u5DE5\u5177</li><li><code>redis-check-aof</code> AOF \u6587\u4EF6\u4FEE\u590D\u5DE5\u5177</li><li><code>redis-check-rdb</code> RDB \u6587\u4EF6\u4FEE\u590D\u5DE5\u5177</li><li><code>redis-cli</code> \u5BA2\u6237\u7AEF\u547D\u4EE4\u884C</li><li><code>redis-sentinal</code> \u96C6\u7FA4\u7BA1\u7406\u5DE5\u5177</li><li><code>redis-server</code> \u670D\u52A1\u8FDB\u7A0B\u6307\u4EE4</li></ul><hr><p>\u542F\u52A8<code>redis-server</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>./redis-server
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230214222405130.png" alt="image-20230214222405130" loading="lazy"></p><p>\u8FD9\u6837\u8FD0\u884C\u6211\u4EEC\u5C31\u4E0D\u80FD\u79BB\u5F00\u7EC8\u7AEF\u4E86\uFF0C\u6240\u4EE5\u6211\u4EEC\u8FD8\u9700\u914D\u7F6E\u5B88\u62A4\u8FD0\u884C</p><p>\u6211\u4EEC\u8FDB\u5165<code>redis</code>\u6E90\u7801\u76EE\u5F55\u4E2D\uFF0C\u62F7\u8D1D\u4E00\u4EFD<code>redis.conf</code>\u5230\u6211\u4EEC\u5B89\u88C5\u7684\u76EE\u5F55\u4E2D</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos redis-6.0.17<span class="token punctuation">]</span><span class="token comment"># cp redis.conf /usr/local/redis/bin/</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> redis.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="custom-container note"><p class="custom-container-title">\u6CE8</p><p>\u627E\u5230<code>daemonize no</code>\u6539\u6210<code>daemonize yes</code>\u8BA9\u5B83\u4EE5\u5B88\u62A4\u8FDB\u7A0B\u7684\u65B9\u5F0F\u542F\u52A8\uFF0C\u6211\u4EEC\u518D\u6B21\u542F\u52A8\u7684\u65F6\u5019\u9700\u8981\u52A0\u4E0A\u5BF9\u5E94\u7684\u914D\u7F6E\u6587\u4EF6\u3002</p></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>./redis-server ./redis.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos bin<span class="token punctuation">]</span><span class="token comment"># ./redis-server ./redis.conf</span>
<span class="token punctuation">[</span>root@VM-16-4-centos bin<span class="token punctuation">]</span><span class="token comment"># ps -ef | grep redis</span>
root     <span class="token number">25910</span>     <span class="token number">1</span>  <span class="token number">0</span> <span class="token number">22</span>:30 ?        00:00:00 ./redis-server <span class="token number">127.0</span>.0.1:6379
root     <span class="token number">25950</span> <span class="token number">22234</span>  <span class="token number">0</span> <span class="token number">22</span>:30 pts/0    00:00:00 <span class="token function">grep</span> --color<span class="token operator">=</span>auto redis
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u53EF\u4EE5\u4F7F\u7528<code>kill</code>\u547D\u4EE4\u8FDB\u884C\u5173\u95ED\u8FDB\u7A0B</p><h2 id="\u914D\u7F6E\u5F00\u542F\u81EA\u542F-centos7-\u4EE5\u4E0A" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E\u5F00\u542F\u81EA\u542F-centos7-\u4EE5\u4E0A" aria-hidden="true">#</a> \u914D\u7F6E\u5F00\u542F\u81EA\u542F(centos7 \u4EE5\u4E0A)</h2><p>\u5728\u7CFB\u7EDF\u670D\u52A1\u76EE\u5F55\u4E2D\u521B\u5EFA<code>redis.service</code>\u6587\u4EF6</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> /etc/systemd/system/redis.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5199\u5165\u4EE5\u4E0B\u5185\u5BB9</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>Unit<span class="token punctuation">]</span>
<span class="token assign-left variable">Description</span><span class="token operator">=</span>redis-server
<span class="token assign-left variable">After</span><span class="token operator">=</span>network.target

<span class="token punctuation">[</span>Service<span class="token punctuation">]</span>
<span class="token assign-left variable">Type</span><span class="token operator">=</span>forking
<span class="token assign-left variable">ExecStart</span><span class="token operator">=</span>/usr/local/redis/bin/redis-server /usr/local/redis/bin/redis.conf
<span class="token assign-left variable">PrivateTmp</span><span class="token operator">=</span>true

<span class="token punctuation">[</span>Install<span class="token punctuation">]</span>
<span class="token assign-left variable">WantedBy</span><span class="token operator">=</span>multi-user.target
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u914D\u7F6E\u63CF\u8FF0\uFF1A</p><blockquote><p>Description:\u63CF\u8FF0\u670D\u52A1 After:\u63CF\u8FF0\u670D\u52A1\u7C7B\u522B [Service]\u670D\u52A1\u8FD0\u884C\u53C2\u6570\u7684\u8BBE\u7F6E Type=forking \u662F\u540E\u53F0\u8FD0\u884C\u7684\u5F62\u5F0F ExecStart \u4E3A\u670D\u52A1\u7684\u5177\u4F53\u8FD0\u884C\u547D\u4EE4 ExecReload \u4E3A\u91CD\u542F\u547D\u4EE4 ExecStop \u4E3A\u505C\u6B62\u547D\u4EE4 PrivateTmp=True \u8868\u793A\u7ED9\u670D\u52A1\u5206\u914D\u72EC\u7ACB\u7684\u4E34\u65F6\u7A7A\u95F4</p></blockquote></div><div class="custom-container danger"><p class="custom-container-title">\u8B66\u544A</p><p><strong>\u6CE8\u610F\uFF1A[Service]\u7684\u542F\u52A8\u548C\u91CD\u542F\u4EE5\u53CA\u505C\u6B62\u547D\u4EE4\u5168\u90E8\u90FD\u8981\u6C42\u4F7F\u7528\u7EDD\u5BF9\u8DEF\u5F84</strong></p><p>\u914D\u7F6E\u5B8C\u4E4B\u540E\u9700\u8981\u91CD\u542F\u7CFB\u7EDF\u670D\u52A1\uFF1A<code>systemctl daemon-reload</code></p></div><hr><p>\u6D4B\u8BD5\u5E76\u52A0\u5165\u5F00\u673A\u81EA\u542F</p><ul><li>\u5173\u95ED<code>redis-server</code>: <code>systemctl stop redis.service</code></li><li>\u5F00\u542F<code>redis-server</code>: <code>systemctl start redis.service</code></li><li>\u67E5\u770B<code>redis-server\u72B6\u6001</code>: <code>systemctl status redis.service</code></li></ul><p>\u6D4B\u8BD5\u6210\u529F\uFF0C\u5C06\u670D\u52A1\u52A0\u5165\u5F00\u673A\u81EA\u542F</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>systemctl <span class="token builtin class-name">enable</span> redis.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6700\u540E\u6D4B\u8BD5\u67E5\u770B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos ~<span class="token punctuation">]</span><span class="token comment"># systemctl start redis.service</span>
<span class="token punctuation">[</span>root@VM-16-4-centos ~<span class="token punctuation">]</span><span class="token comment"># ps -ef | grep redis</span>
root     <span class="token number">29176</span>     <span class="token number">1</span>  <span class="token number">0</span> <span class="token number">22</span>:42 ?        00:00:00 /usr/local/redis/bin/redis-server <span class="token number">127.0</span>.0.1:6379
root     <span class="token number">29204</span> <span class="token number">22234</span>  <span class="token number">0</span> <span class="token number">22</span>:42 pts/0    00:00:00 <span class="token function">grep</span> --color<span class="token operator">=</span>auto redis
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,44);function h(g,f){const e=i("ExternalLinkIcon");return l(),c("div",null,[d,p,s("p",null,[u,s("a",m,[v,o(e)]),b]),k])}var y=a(r,[["render",h],["__file","centos7-redis-install.html.vue"]]);export{y as default};
