import{_ as e}from"./plugin-vue_export-helper.21dcd24c.js";import{r as p,o as t,c as o,a as s,b as c,d as n,e as l}from"./app.9eb1cdcc.js";const i={},u=n("["),d={href:"https://www.php.net/manual/zh/book.stream.php",target:"_blank",rel:"noopener noreferrer"},r=n("https://www.php.net/manual/zh/book.stream.php"),k=n("](PHP Stream \u51FD\u6570\u6587\u6863\u5730\u5740)"),v=l(`<h2 id="ipv4-tcp-\u5957\u63A5\u5B57\u670D\u52A1" tabindex="-1"><a class="header-anchor" href="#ipv4-tcp-\u5957\u63A5\u5B57\u670D\u52A1" aria-hidden="true">#</a> IPV4 TCP \u5957\u63A5\u5B57\u670D\u52A1</h2><h3 id="unix-\u57DF\u5957\u63A5\u5B57\u8FDB\u7A0B\u95F4\u901A\u4FE1" tabindex="-1"><a class="header-anchor" href="#unix-\u57DF\u5957\u63A5\u5B57\u8FDB\u7A0B\u95F4\u901A\u4FE1" aria-hidden="true">#</a> Unix \u57DF\u5957\u63A5\u5B57\u8FDB\u7A0B\u95F4\u901A\u4FE1</h3><div class="language-php ext-php line-numbers-mode"><pre class="language-php"><code><span class="token variable">$socketFd</span> <span class="token operator">=</span> <span class="token function">socket_create</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7B2C\u4E00\u4E2A\u53C2\u6570\uFF1A</p><p><code>$domain</code>\u5957\u63A5\u5B57\u901A\u4FE1\u57DF\u53C2\u6570</p><ul><li><code>AF_INET</code>\uFF1AIPV4</li><li><code>AF_INET6</code>\uFF1A IPV6</li><li><code>AF_UNIX</code>\uFF1A\u672C\u5730\u901A\u8BAF\u534F\u8BAE\uFF0C\u5177\u6709\u9AD8\u6027\u80FD\u548C\u4F4E\u6210\u672C\u7684 IPC(\u8FDB\u7A0B\u95F4\u901A\u4FE1)</li></ul><p>\u4E3B\u8981\u4EE5 IPV4 \u4E3A\u4E3B\u3002</p><p>\u7B2C\u4E8C\u4E2A\u53C2\u6570\uFF1A</p><p><code>$type</code>\uFF1A\u5957\u63A5\u5B57\u7C7B\u578B\uFF1ATCP/UDP</p><p>\u7B2C\u4E09\u4E2A\u53C2\u6570\uFF1A\u534F\u8BAE\uFF0C\u5982\u679C\u662F TCP \u6216 UDP\uFF0C\u53EF\u4EE5\u76F4\u63A5\u4F7F\u7528<code>SOL_TCP</code>\u548C<code>SOL_UDP</code></p><p><strong>\u7B2C\u4E00\u6B65\uFF1A\u521B\u5EFA\u5957\u63A5\u5B57\uFF0C\u5B9E\u9645\u4E0A\u8FD4\u56DE\u4E00\u4E2A\u6587\u4EF6\u63CF\u8FF0\u7B26</strong></p><div class="language-php ext-php line-numbers-mode"><pre class="language-php"><code><span class="token variable">$socketFd</span> <span class="token operator">=</span> <span class="token function">socket_create</span><span class="token punctuation">(</span><span class="token constant">AF_INET</span><span class="token punctuation">,</span> <span class="token constant">SOCK_STREAM</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>\u7B2C\u4E8C\u6B65\uFF1A\u547D\u540D<code>socket</code>\u7ED1\u5B9A\uFF0C\u628A\u7AEF\u53E3\u3001IP \u7ED1\u5B9A\u5230 socket \u6587\u4EF6\u63CF\u8FF0\u7B26\u4E0A</strong></p><p>\u7B2C\u4E09\u4E2A\u53C2\u6570\u53EF\u4EE5\u5728<code>unix</code>\u8FDB\u7A0B\u95F4\u901A\u4FE1\u7684\u65F6\u5019\u53EF\u4EE5\u4E0D\u4F20</p><p>\u6210\u529F\uFF1A\u8FD4\u56DE<code>true</code></p><p>\u5931\u8D25\uFF1A\u8FD4\u56DE<code>false</code></p><div class="language-php ext-php line-numbers-mode"><pre class="language-php"><code><span class="token function">socket_bind</span><span class="token punctuation">(</span><span class="token variable">$socketFd</span><span class="token punctuation">,</span> <span class="token string double-quoted-string">&quot;0.0.0.0&quot;</span><span class="token punctuation">,</span> <span class="token string double-quoted-string">&quot;12345&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>\u7B2C\u4E09\u6B65\uFF1A\u76D1\u542C</strong></p><p>\u7B2C\u4E8C\u4E2A\u53C2\u6570\u662F\u63A5\u6536\u7684\u76D1\u542C\u961F\u5217\u7684\u4E2A\u6570</p><div class="language-php ext-php line-numbers-mode"><pre class="language-php"><code><span class="token function">socket_listen</span><span class="token punctuation">(</span><span class="token variable">$socketFd</span><span class="token punctuation">,</span> <span class="token number">5</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>\u7B2C\u56DB\u6B65\uFF1A\u63A5\u6536\u5BA2\u6237\u7AEF\u8FDE\u63A5</strong></p><div class="language-php ext-php line-numbers-mode"><pre class="language-php"><code><span class="token variable">$conn</span> <span class="token operator">=</span> <span class="token function">socket_accept</span><span class="token punctuation">(</span><span class="token variable">$socketFd</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>\u7B2C\u4E94\u6B65\uFF1A\u53D1\u9001\u6570\u636E</strong></p><div class="language-php ext-php line-numbers-mode"><pre class="language-php"><code><span class="token function">socket_send</span><span class="token punctuation">(</span><span class="token variable">$conn</span><span class="token punctuation">,</span> <span class="token string double-quoted-string">&quot;hi&quot;</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u53D1\u9001 HTTP \u5185\u5BB9</p><div class="language-php ext-php line-numbers-mode"><pre class="language-php"><code><span class="token variable">$data</span> <span class="token operator">=</span> <span class="token string double-quoted-string">&quot;HTTP/1.1 200 OK\\r\\nContent-Length: 2\\r\\n\\r\\nok&quot;</span><span class="token punctuation">;</span>
<span class="token keyword">echo</span> <span class="token function">socket_send</span><span class="token punctuation">(</span><span class="token variable">$conn</span><span class="token punctuation">,</span> <span class="token variable">$data</span><span class="token punctuation">,</span> <span class="token function">strlen</span><span class="token punctuation">(</span><span class="token variable">$data</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u6837\u5982\u679C\u4F7F\u7528 TCP \u8FDE\u63A5\uFF1A<code>127.0.0.1:12345</code>\u5373\u53EF\u83B7\u53D6\u5230\u54CD\u5E94\u7684 HTTP \u5185\u5BB9<code>ok</code></p><p><strong>\u7B2C\u516D\u6B65\uFF1A\u5173\u95ED</strong></p><div class="language-php ext-php line-numbers-mode"><pre class="language-php"><code><span class="token function">socket_close</span><span class="token punctuation">(</span><span class="token variable">$conn</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">socket_close</span><span class="token punctuation">(</span><span class="token variable">$socketFd</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,29);function h(b,m){const a=p("ExternalLinkIcon");return t(),o("div",null,[s("p",null,[u,s("a",d,[r,c(a)]),k]),v])}var f=e(i,[["render",h],["__file","ipv4-learn.html.vue"]]);export{f as default};
