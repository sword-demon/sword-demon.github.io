import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.4201b0c3.js";const t={},i=e(`<h2 id="go-\u9690\u5F0F\u63A5\u53E3\u7684\u7279\u70B9" tabindex="-1"><a class="header-anchor" href="#go-\u9690\u5F0F\u63A5\u53E3\u7684\u7279\u70B9" aria-hidden="true">#</a> Go \u9690\u5F0F\u63A5\u53E3\u7684\u7279\u70B9</h2><ul><li>\u53EA\u8981\u5B9E\u73B0\u4E86\u63A5\u53E3\u7684\u5168\u90E8\u65B9\u6CD5\uFF0C\u5C31\u662F\u81EA\u52A8\u5B9E\u73B0\u63A5\u53E3</li><li>\u53EF\u4EE5\u5728\u4E0D\u4FEE\u6539\u4EE3\u7801\u7684\u60C5\u51B5\u4E0B\u62BD\u8C61\u51FA\u65B0\u7684\u63A5\u53E3</li></ul><p>\u4E00\u4E2A\u7B80\u5355\u7684\u63A5\u53E3\u793A\u4F8B</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">type</span> Car <span class="token keyword">interface</span> <span class="token punctuation">{</span>
	<span class="token function">Driver</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">type</span> Truck <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	Model <span class="token builtin">string</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>t Truck<span class="token punctuation">)</span> <span class="token function">Driver</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>t<span class="token punctuation">.</span>Model<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> c Car <span class="token operator">=</span> Truck<span class="token punctuation">{</span>Model<span class="token punctuation">:</span> <span class="token string">&quot;\u5361\u8F66\u7C7B\u578B&quot;</span><span class="token punctuation">}</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4E00\u4E2A\u63A5\u53E3\u7684\u503C\u7684\u5E95\u5C42\u8868\u793A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">type</span> iface <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	tab  <span class="token operator">*</span>itab
	data unsafe<span class="token punctuation">.</span>Pointer
<span class="token punctuation">}</span>

<span class="token keyword">type</span> itab <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	inter <span class="token operator">*</span>interfacetype <span class="token comment">// \u5F53\u524D\u63A5\u53E3\u7684\u7C7B\u578B</span>
	_type <span class="token operator">*</span>_type <span class="token comment">// \u5F53\u524D\u63A5\u53E3\u88C5\u9970\u7684\u7C7B\u578B</span>
	hash  <span class="token builtin">uint32</span> <span class="token comment">// copy of _type.hash. Used for type switches.</span>
	<span class="token boolean">_</span>     <span class="token punctuation">[</span><span class="token number">4</span><span class="token punctuation">]</span><span class="token builtin">byte</span>
	fun   <span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token builtin">uintptr</span> <span class="token comment">// variable sized. fun[0]==0 means _type does not implement inter. \u5B9E\u73B0\u4E86\u54EA\u4E9B\u65B9\u6CD5</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>\u63A5\u53E3\u6570\u636E\u4F7F\u7528<code>runtime.iface</code>\u8868\u793A</li><li><code>iface</code>\u8BB0\u5F55\u4E86\u6570\u636E\u7684\u5730\u5740</li><li><code>iface</code>\u8BB0\u5F55\u4E86\u63A5\u53E3\u7684\u7C7B\u578B\u4FE1\u606F\u548C\u5B9E\u73B0\u7684\u65B9\u6CD5(\u53EF\u4EE5\u7528\u4E8E\u7C7B\u578B\u65AD\u8A00)</li></ul><h3 id="\u7C7B\u578B\u65AD\u8A00" tabindex="-1"><a class="header-anchor" href="#\u7C7B\u578B\u65AD\u8A00" aria-hidden="true">#</a> \u7C7B\u578B\u65AD\u8A00</h3><ul><li>\u7C7B\u578B\u65AD\u8A00\u662F\u4E00\u4E2A\u4F7F\u7528\u5728\u63A5\u53E3\u503C\u4E0A\u7684\u64CD\u4F5C</li><li>\u53EF\u4EE5\u5C06\u63A5\u53E3\u503C\u8F6C\u6362\u4E3A\u5176\u4ED6\u7C7B\u578B\u503C(\u5B9E\u73B0\u6216\u8005\u517C\u5BB9\u63A5\u53E3)</li><li>\u53EF\u4EE5\u914D\u5408<code>switch</code>\u8FDB\u884C\u7C7B\u578B\u5224\u65AD</li></ul><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> c Car <span class="token operator">=</span> Truck<span class="token punctuation">{</span>Model<span class="token punctuation">:</span> <span class="token string">&quot;\u5361\u8F66\u7C7B\u578B&quot;</span><span class="token punctuation">}</span>
    <span class="token comment">// \u4F7F\u7528\u7C7B\u578B\u65AD\u8A00\u8FDB\u884C\u8F6C\u6362\u7C7B\u578B</span>
	t <span class="token operator">:=</span> c<span class="token punctuation">.</span><span class="token punctuation">(</span>Truck<span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>t<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,10),p=[i];function c(o,l){return s(),a("div",null,p)}var r=n(t,[["render",c],["__file","interface-type.html.vue"]]);export{r as default};
