import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.50152c4e.js";const e={},p=t(`<h2 id="go\u8BED\u8A00\u5B9E\u73B0\u56DE\u6587\u68C0\u6D4B" tabindex="-1"><a class="header-anchor" href="#go\u8BED\u8A00\u5B9E\u73B0\u56DE\u6587\u68C0\u6D4B" aria-hidden="true">#</a> Go\u8BED\u8A00\u5B9E\u73B0\u56DE\u6587\u68C0\u6D4B</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;strings&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">/**
\u56DE\u6587\u68C0\u6D4B\uFF0C\u6B63\u5E8F\u548C\u9006\u5E8F\u8BFB\u662F\u4E00\u6837\u7684
*/</span>

<span class="token keyword">func</span> <span class="token function">Prime</span><span class="token punctuation">(</span>s <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token builtin">bool</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> temp <span class="token operator">=</span> strings<span class="token punctuation">.</span><span class="token function">Split</span><span class="token punctuation">(</span>s<span class="token punctuation">,</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i<span class="token punctuation">,</span> j <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token function">len</span><span class="token punctuation">(</span>temp<span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> j<span class="token punctuation">;</span> <span class="token punctuation">{</span>
		<span class="token keyword">if</span> temp<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">!=</span> temp<span class="token punctuation">[</span>j<span class="token punctuation">]</span> <span class="token punctuation">{</span>
			<span class="token keyword">return</span> <span class="token boolean">false</span>
		<span class="token punctuation">}</span>
		i<span class="token operator">++</span>
		j<span class="token operator">--</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">print</span><span class="token punctuation">(</span><span class="token function">Prime</span><span class="token punctuation">(</span><span class="token string">&quot;\u4E0A\u6D77\u81EA\u6765\u6C34\u6765\u81EA\u6D77\u4E0A&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2),o=[p];function i(c,l){return s(),a("div",null,o)}var d=n(e,[["render",i],["__file","algo-palindrome.html.vue"]]);export{d as default};
