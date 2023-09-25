import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.879def1e.js";const p={},e=t(`<h2 id="\u6590\u6CE2\u90A3\u5951\u6570\u5217" tabindex="-1"><a class="header-anchor" href="#\u6590\u6CE2\u90A3\u5951\u6570\u5217" aria-hidden="true">#</a> \u6590\u6CE2\u90A3\u5951\u6570\u5217</h2><div class="custom-container note"><p class="custom-container-title">\u6E90\u81EA\u767E\u5EA6\u767E\u79D1</p><p>\u6590\u6CE2\u90A3\u5951\u6570\u5217\uFF08Fibonacci sequence\uFF09\uFF0C\u53C8\u79F0\u9EC4\u91D1\u5206\u5272\u6570\u5217\uFF0C\u56E0\u6570\u5B66\u5BB6\u83B1\u6602\u7EB3\u591A\xB7\u6590\u6CE2\u90A3\u5951\uFF08Leonardo Fibonacci\uFF09\u4EE5\u5154\u5B50\u7E41\u6B96\u4E3A\u4F8B\u5B50\u800C\u5F15\u5165\uFF0C\u6545\u53C8\u79F0\u4E3A\u201C\u5154\u5B50\u6570\u5217\u201D\uFF0C\u6307\u7684\u662F\u8FD9\u6837\u4E00\u4E2A\u6570\u5217\uFF1A1\u30011\u30012\u30013\u30015\u30018\u300113\u300121\u300134\u3001\u2026\u2026\u5728\u6570\u5B66\u4E0A\uFF0C\u6590\u6CE2\u90A3\u5951\u6570\u5217\u4EE5\u5982\u4E0B\u88AB\u4EE5\u9012\u63A8\u7684\u65B9\u6CD5\u5B9A\u4E49\uFF1AF(0)=1\uFF0CF(1)=1, F(n)=F(n - 1)+F(n - 2)\uFF08n \u2265 2\uFF0Cn \u2208 N*\uFF09\u5728\u73B0\u4EE3\u7269\u7406\u3001\u51C6\u6676\u4F53\u7ED3\u6784\u3001\u5316\u5B66\u7B49\u9886\u57DF\uFF0C\u6590\u6CE2\u90A3\u5951\u6570\u5217\u90FD\u6709\u76F4\u63A5\u7684\u5E94\u7528\uFF0C\u4E3A\u6B64\uFF0C\u7F8E\u56FD\u6570\u5B66\u4F1A\u4ECE 1963 \u5E74\u8D77\u51FA\u7248\u4E86\u4EE5\u300A\u6590\u6CE2\u90A3\u5951\u6570\u5217\u5B63\u520A\u300B\u4E3A\u540D\u7684\u4E00\u4EFD\u6570\u5B66\u6742\u5FD7\uFF0C\u7528\u4E8E\u4E13\u95E8\u520A\u8F7D\u8FD9\u65B9\u9762\u7684\u7814\u7A76\u6210\u679C\u3002</p></div><h2 id="\u9012\u5F52\u65B9\u5F0F" tabindex="-1"><a class="header-anchor" href="#\u9012\u5F52\u65B9\u5F0F" aria-hidden="true">#</a> \u9012\u5F52\u65B9\u5F0F</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">Fibonacci</span><span class="token punctuation">(</span>n <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	<span class="token keyword">if</span> n <span class="token operator">&lt;</span> <span class="token number">2</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token number">1</span>
	<span class="token punctuation">}</span>

	<span class="token keyword">return</span> <span class="token function">Fibonacci</span><span class="token punctuation">(</span>n<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token function">Fibonacci</span><span class="token punctuation">(</span>n<span class="token operator">-</span><span class="token number">2</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u4F7F\u7528\u95ED\u5305\u51FD\u6570" tabindex="-1"><a class="header-anchor" href="#\u4F7F\u7528\u95ED\u5305\u51FD\u6570" aria-hidden="true">#</a> \u4F7F\u7528\u95ED\u5305\u51FD\u6570</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">fibonacci</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	a<span class="token punctuation">,</span> b <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">1</span>
	<span class="token keyword">return</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
		a<span class="token punctuation">,</span> b <span class="token operator">=</span> b<span class="token punctuation">,</span> a<span class="token operator">+</span>b
		<span class="token keyword">return</span> a
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	f <span class="token operator">:=</span> <span class="token function">fibonacci</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token function">f</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u4F7F\u7528channel\u6765\u4FDD\u5B58\u7ED3\u679C" tabindex="-1"><a class="header-anchor" href="#\u4F7F\u7528channel\u6765\u4FDD\u5B58\u7ED3\u679C" aria-hidden="true">#</a> \u4F7F\u7528<code>channel</code>\u6765\u4FDD\u5B58\u7ED3\u679C</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">fib</span><span class="token punctuation">(</span>n <span class="token builtin">int</span><span class="token punctuation">,</span> c <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	a<span class="token punctuation">,</span> b <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">1</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> n<span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		a<span class="token punctuation">,</span> b <span class="token operator">=</span> b<span class="token punctuation">,</span> a<span class="token operator">+</span>b
		c <span class="token operator">&lt;-</span> a
	<span class="token punctuation">}</span>

	<span class="token function">close</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	c <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">)</span>
	<span class="token function">fib</span><span class="token punctuation">(</span><span class="token function">cap</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">,</span> c<span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token keyword">range</span> c <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,8),c=[e];function o(i,l){return s(),a("div",null,c)}var k=n(p,[["render",o],["__file","go-fib.html.vue"]]);export{k as default};