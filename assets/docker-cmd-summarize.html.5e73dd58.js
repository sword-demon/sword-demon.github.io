import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as e,e as a}from"./app.ad3af615.js";const i={},c=a(`<h1 id="\u547D\u4EE4\u603B\u7ED3" tabindex="-1"><a class="header-anchor" href="#\u547D\u4EE4\u603B\u7ED3" aria-hidden="true">#</a> \u547D\u4EE4\u603B\u7ED3</h1><h2 id="docker-\u73AF\u5883" tabindex="-1"><a class="header-anchor" href="#docker-\u73AF\u5883" aria-hidden="true">#</a> Docker \u73AF\u5883</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u67E5\u770B\u7248\u672C</span>
<span class="token function">docker</span> version

<span class="token comment"># \u66F4\u52A0\u5177\u4F53\u7684\u4FE1\u606F</span>
<span class="token function">docker</span> info
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="docker-\u7684\u751F\u547D\u5468\u671F" tabindex="-1"><a class="header-anchor" href="#docker-\u7684\u751F\u547D\u5468\u671F" aria-hidden="true">#</a> Docker \u7684\u751F\u547D\u5468\u671F</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u521B\u5EFA\u5BB9\u5668</span>
<span class="token comment"># \u4EA4\u4E92\u5F0F\u542F\u52A8</span>
<span class="token comment"># \u8D77\u540D\u4E3A nginx</span>
<span class="token comment"># \u4F7F\u7528 nginx:1.14 \u955C\u50CF</span>
<span class="token function">docker</span> create -it --name nginx nginx:1.14

<span class="token comment"># \u76F4\u63A5\u5C31\u542F\u52A8</span>
<span class="token comment"># \u4F7F\u7528\u65B9\u5F0F\u8F83\u591A</span>
<span class="token function">docker</span> run -it --name nginx nginx:1.14
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u67E5\u770B\u5BB9\u5668</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u67E5\u770B\u6240\u6709\u7684</span>
<span class="token function">docker</span> <span class="token function">ps</span> -a

<span class="token comment"># \u67E5\u770B\u542F\u52A8\u7684</span>
<span class="token function">docker</span> <span class="token function">ps</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u542F\u52A8\u5BB9\u5668</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u542F\u52A8\u521A\u624D\u521B\u5EFA\u7684\u5BB9\u5668\u540D\u79F0</span>
<span class="token comment"># \u6216\u8005\u4F7F\u7528\u5BF9\u5E94\u7684\u5BB9\u5668 id</span>
<span class="token function">docker</span> start nginx

<span class="token comment"># \u505C\u6B62\u5BB9\u5668</span>
<span class="token function">docker</span> stop nginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5F3A\u5236\u6740\u6389\u8FDB\u7A0B\u505C\u6B62\u5BB9\u5668</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u76F4\u63A5\u628A\u5BB9\u5668\u4E3B\u8FDB\u7A0B\u5E72\u6389</span>
<span class="token function">docker</span> <span class="token function">kill</span> nginx

<span class="token comment"># \u505C\u6B62\u5BB9\u5668\u7684\u5B50\u8FDB\u7A0B \u6CA1\u6709\u505C\u6B62\u5BB9\u5668\u7684\u4E3B\u8FDB\u7A0B</span>
<span class="token function">docker</span> pause nginx

<span class="token comment"># \u4F7F\u7528 pause \u7684\u8FD8\u53EF\u4EE5\u4F7F\u7528 unpause \u91CD\u65B0\u542F\u52A8</span>
<span class="token function">docker</span> unpause nginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u5BB9\u5668\u8FD0\u7EF4" tabindex="-1"><a class="header-anchor" href="#\u5BB9\u5668\u8FD0\u7EF4" aria-hidden="true">#</a> \u5BB9\u5668\u8FD0\u7EF4</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u67E5\u770B\u5BB9\u5668\u7684\u8BE6\u7EC6\u4FE1\u606F</span>
<span class="token function">docker</span> inspect nginx

<span class="token comment"># \u8FDB\u5165\u5BB9\u5668\u5185\u90E8 \u4EE5 bash \u7EC8\u7AEF\u8FDB\u7A0B</span>
<span class="token function">docker</span> <span class="token builtin class-name">exec</span> -it nginx <span class="token function">bash</span>

<span class="token comment"># \u67E5\u770B\u6B63\u5728\u8FD0\u884C\u7684\u5BB9\u5668\u91CC\u7684\u8FDB\u7A0B</span>
<span class="token function">docker</span> <span class="token function">top</span>

<span class="token comment"># \u76F4\u89C2\u5730\u67E5\u770B\u6B63\u5728\u8FD0\u884C\u7684\u5BB9\u5668\u7684  CPU \u8FD0\u884C\u60C5\u51B5 \u5185\u5B58\u7B49\u4FE1\u606F</span>
<span class="token function">docker</span> status nginx

<span class="token comment"># \u5217\u4E3E\u6B63\u5728\u8FD0\u884C\u7684\u5BB9\u5668</span>
<span class="token function">docker</span> <span class="token function">ps</span>

<span class="token comment"># \u4FEE\u6539\u5BB9\u5668\u7684\u540D\u79F0</span>
<span class="token function">docker</span> <span class="token function">rename</span> nginx nginx2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u5BB9\u5668-rootfs" tabindex="-1"><a class="header-anchor" href="#\u5BB9\u5668-rootfs" aria-hidden="true">#</a> \u5BB9\u5668 rootfs</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u62F7\u8D1D\u6587\u4EF6</span>
<span class="token comment"># \u5148\u521B\u5EFA\u4E00\u4E2A\u6587\u4EF6</span>
<span class="token function">touch</span> test.txt

<span class="token comment"># \u5C06\u6587\u4EF6\u62F7\u8D1D\u5230\u5BB9\u5668\u7684\u6839\u76EE\u5F55\u4E0B</span>
<span class="token function">docker</span> <span class="token function">cp</span> test.txt nginx /

<span class="token comment"># \u67E5\u770B\u5BB9\u5668\u5B9E\u9645\u4FEE\u6539\u4E86\u4EC0\u4E48</span>
<span class="token function">docker</span> <span class="token function">diff</span> nginx

<span class="token comment"># \u5BB9\u5668\u63D0\u4EA4\u5230\u4ED3\u5E93 \u53EF\u4EE5\u8BA9\u522B\u4EBA\u4F7F\u7528\u8FD9\u4E2A\u955C\u50CF</span>
<span class="token function">docker</span> commit -m <span class="token string">&quot;test nginx commit&quot;</span> nginx

<span class="token comment"># \u53EF\u4EE5\u6307\u5B9A repository \u548C tag</span>
<span class="token function">docker</span> commit -m <span class="token string">&quot;test nginx commit&quot;</span> nginx-test:1.14

<span class="token comment"># \u5220\u9664\u955C\u50CF</span>
<span class="token function">docker</span> rmi \u5BB9\u5668\u955C\u50CF <span class="token function">id</span> \u6216\u8005\u5BB9\u5668\u540D

<span class="token comment"># \u6279\u91CF\u6E05\u9664\u6240\u6709\u7684\u955C\u50CF</span>
<span class="token function">docker</span> image prune

<span class="token comment"># \u4F1A\u5220\u9664\u6CA1\u6709\u8FD0\u884C\u7684\u6240\u6709\u5BB9\u5668</span>
<span class="token function">docker</span> container prune
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,15),l=[c];function d(o,t){return s(),e("div",null,l)}var v=n(i,[["render",d],["__file","docker-cmd-summarize.html.vue"]]);export{v as default};
