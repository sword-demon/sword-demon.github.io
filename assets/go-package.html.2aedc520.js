import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as i}from"./app.e1449346.js";const e={},t=i(`<h2 id="\u521D\u8BC6\u5305\u7BA1\u7406" tabindex="-1"><a class="header-anchor" href="#\u521D\u8BC6\u5305\u7BA1\u7406" aria-hidden="true">#</a> \u521D\u8BC6\u5305\u7BA1\u7406</h2><p>\u5173\u4E8E\u5305\u7BA1\u7406\u7684\u603B\u7ED3\uFF1A</p><ul><li>\u4E00\u4E2A\u6587\u4EF6\u5939\u53EF\u4EE5\u79F0\u4E3A\u4E00\u4E2A\u5305</li><li>\u5728\u6587\u4EF6\u5939\uFF08\u5305\uFF09\u4E2D\u53EF\u4EE5\u521B\u5EFA\u591A\u4E2A\u6587\u4EF6</li><li>\u5728\u540C\u4E00\u4E2A\u5305\u7684\u6BCF\u4E2A\u6587\u4EF6\u4E2D\u5FC5\u987B\u6307\u5B9A <strong>\u5305\u540D\u79F0\u4E14\u76F8\u540C</strong></li></ul><p>\u6848\u4F8B\uFF1A</p><p>\u9879\u76EE\u76EE\u5F55/app.go</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token comment">// \u82B1\u62EC\u53F7\u5FC5\u987B\u6362\u884C\uFF0C\u5426\u5219\u62A5\u9519</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u9879\u76EE\u76EE\u5F55/api/baidu.go</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> api


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>\u5173\u4E8E\u5305\u7684\u5206\u7C7B</strong></p><ul><li><code>main</code>\u5305\uFF0C\u5982\u679C\u662F main \u5305\uFF0C\u5219\u5FC5\u987B\u5199\u4E00\u4E2A main \u51FD\u6570\uFF0C\u6B64\u51FD\u6570\u5C31\u662F\u9879\u76EE\u7684\u5165\u53E3(main \u4E3B\u51FD\u6570)\uFF0C\u7F16\u8BD1\u5C31\u4F1A\u751F\u6210\u4E00\u4E2A\u53EF\u6267\u884C\u6587\u4EF6\u3002</li><li>\u975E main \u5305\uFF0C\u7528\u6765\u5C06\u4EE3\u7801\u8FDB\u884C\u5206\u95E8\u522B\u7C7B\u7684\uFF0C\u5206\u522B\u653E\u5728\u4E0D\u540C\u7684\u5305\u548C\u6587\u4EF6\u5939\u4E2D</li></ul><h3 id="\u5C5E\u4E8E\u540C\u4E00\u4E2A\u5305-\u5305\u540D\u76F8\u540C-\u76F4\u63A5\u53BB\u8C03\u7528\u5373\u53EF" tabindex="-1"><a class="header-anchor" href="#\u5C5E\u4E8E\u540C\u4E00\u4E2A\u5305-\u5305\u540D\u76F8\u540C-\u76F4\u63A5\u53BB\u8C03\u7528\u5373\u53EF" aria-hidden="true">#</a> \u5C5E\u4E8E\u540C\u4E00\u4E2A\u5305\uFF0C\u5305\u540D\u76F8\u540C\uFF0C\u76F4\u63A5\u53BB\u8C03\u7528\u5373\u53EF</h3><p>\u9879\u76EE\u76EE\u5F55/app.go</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">// \u5B9A\u4E49\u4E86\u5305\u7684\u540D\u5B57\uFF0C\u58F0\u660E\u5F53\u524Dgo\u6587\u4EF6\u5C5E\u4E8E\u54EA\u4E2A\u5305\uFF0C</span>
<span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token comment">// \u5B9A\u4E49\u4E00\u4E2A\u51FD\u6570 main\u51FD\u6570\uFF0C\u7A0B\u5E8F\u5F00\u59CB\u6267\u884C\u7684\u51FD\u6570\uFF0C\u6BCF\u4E00\u4E2A\u53EF\u6267\u884C\u7684\u51FD\u6570\u5FC5\u987B\u5305\u542B\u4E00\u4E2Amain\u51FD\u6570</span>
<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u8FD9\u662F\u5355\u884C\u7684\u6CE8\u91CA</span>

	<span class="token comment">/*
	\u591A\u884C\u6CE8\u91CA\uFF0C\u5757\u6CE8\u91CA
	 */</span>

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;hello world&quot;</span><span class="token punctuation">)</span>
	<span class="token comment">// \u8C03\u7528city.go \u7684Add\u65B9\u6CD5\uFF0C\u56E0\u4E3A\u4ED6\u4EEC\u5C5E\u4E8E\u540C\u4E00\u4E2A\u5305\uFF0C\u5305\u540D\u76F8\u540C\uFF0C\u76F4\u63A5\u53BB\u8C03\u7528\u5373\u53EF</span>
	<span class="token function">Add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u9879\u76EE\u76EE\u5F55/city.go</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">Add</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u6211\u662Fcity.go\u7684Add\u529F\u80FD&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8F93\u51FA:</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>hello world
\u6211\u662Fcity<span class="token punctuation">.</span><span class="token keyword">go</span>\u7684Add\u529F\u80FD
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u8C03\u7528\u4E0D\u540C\u5305\u7684\u65F6\u5019" tabindex="-1"><a class="header-anchor" href="#\u8C03\u7528\u4E0D\u540C\u5305\u7684\u65F6\u5019" aria-hidden="true">#</a> \u8C03\u7528\u4E0D\u540C\u5305\u7684\u65F6\u5019</h3><p>\u9879\u76EE\u76EE\u5F55/api/baidu.go</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> api

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">Baidu</span><span class="token punctuation">(</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u767E\u5EA6&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u9879\u76EE\u76EE\u5F55/app.go</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">// \u5B9A\u4E49\u4E86\u5305\u7684\u540D\u5B57\uFF0C\u58F0\u660E\u5F53\u524Dgo\u6587\u4EF6\u5C5E\u4E8E\u54EA\u4E2A\u5305\uFF0C</span>
<span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;github.com/xinwangqilin/base_learn/api&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u5B9A\u4E49\u4E00\u4E2A\u51FD\u6570 main\u51FD\u6570\uFF0C\u7A0B\u5E8F\u5F00\u59CB\u6267\u884C\u7684\u51FD\u6570\uFF0C\u6BCF\u4E00\u4E2A\u53EF\u6267\u884C\u7684\u51FD\u6570\u5FC5\u987B\u5305\u542B\u4E00\u4E2Amain\u51FD\u6570</span>
<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u8FD9\u662F\u5355\u884C\u7684\u6CE8\u91CA</span>

	<span class="token comment">/*
	\u591A\u884C\u6CE8\u91CA\uFF0C\u5757\u6CE8\u91CA
	 */</span>

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;hello world&quot;</span><span class="token punctuation">)</span>
	<span class="token comment">// \u8C03\u7528city.go \u7684Add\u65B9\u6CD5\uFF0C\u56E0\u4E3A\u4ED6\u4EEC\u5C5E\u4E8E\u540C\u4E00\u4E2A\u5305\uFF0C\u5305\u540D\u76F8\u540C\uFF0C\u76F4\u63A5\u53BB\u8C03\u7528\u5373\u53EF</span>
	<span class="token function">Add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token comment">// \u8C03\u7528api/baidu.go \u7684Baidu() \u65B9\u6CD5 \uFF0C\u53EA\u8981\u5305.\u65B9\u6CD5\u540D\u5373\u53EF</span>
	api<span class="token punctuation">.</span><span class="token function">Baidu</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u6CE8\u610F\u4E8B\u9879" tabindex="-1"><a class="header-anchor" href="#\u6CE8\u610F\u4E8B\u9879" aria-hidden="true">#</a> \u6CE8\u610F\u4E8B\u9879</h3><p>\u65B9\u6CD5\u540D\uFF1A</p><ul><li><strong>\u9996\u5B57\u6BCD\u5927\u5199\uFF0C\u7528\u4E8E\u5916\u90E8\u516C\u6709\u53EF\u4EE5\u8FDB\u884C\u8BBF\u95EE</strong></li><li><strong>\u5C0F\u5199\uFF0C\u7528\u4E8E\u79C1\u6709\uFF0C\u5916\u90E8\u65E0\u6CD5\u8BBF\u95EE</strong></li></ul><h2 id="init-\u51FD\u6570" tabindex="-1"><a class="header-anchor" href="#init-\u51FD\u6570" aria-hidden="true">#</a> init \u51FD\u6570</h2><p>\u5BFC\u5165\u5305\u7684\u65F6\u5019\uFF0C\u4F1A\u81EA\u52A8\u6267\u884C<code>init</code>\u51FD\u6570</p><p><strong>init \u51FD\u6570\u6CA1\u6709\u53C2\u6570\u4E5F\u6CA1\u6709\u8FD4\u56DE\u503C\uFF0C\u5728\u7A0B\u5E8F\u8FD0\u884C\u65F6\u81EA\u52A8\u88AB\u8C03\u7528\u6267\u884C\uFF0C\u4E0D\u80FD\u5728\u4EE3\u7801\u4E2D\u4E3B\u52A8\u8C03\u7528\u5B83</strong></p><p>\u5305\u521D\u59CB\u5316\u6267\u884C\u7684\u987A\u5E8F\u5982\u4E0B\u56FE\uFF1A</p><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/image-20210921145405183.png" alt="init" loading="lazy"></p>`,30),l=[t];function c(p,o){return s(),a("div",null,l)}var r=n(e,[["render",c],["__file","go-package.html.vue"]]);export{r as default};
