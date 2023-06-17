import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.8b4fdfbe.js";const e={},p=t(`<div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u5E76\u53D1\u662F\u7F16\u7A0B\u91CC\u6BD4\u8F83\u91CD\u8981\u7684\u6982\u5FF5\u3002Go \u8BED\u8A00\u5728\u8BED\u8A00\u5C42\u9762\u4E0A\u5929\u751F\u652F\u6301\u5E76\u53D1\uFF0C\u8FD9\u4E5F\u662F Go \u8BED\u8A00\u6D41\u884C\u7684\u91CD\u8981\u539F\u56E0</p></div><h2 id="\u8FDB\u7A0B\u548C\u7EBF\u7A0B" tabindex="-1"><a class="header-anchor" href="#\u8FDB\u7A0B\u548C\u7EBF\u7A0B" aria-hidden="true">#</a> \u8FDB\u7A0B\u548C\u7EBF\u7A0B</h2><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u8FDB\u7A0B\u662F\u8BA1\u7B97\u673A\u4E2D\u8D44\u6E90\u5206\u914D\u7684\u6700\u5C0F\u5355\u5143(\u76F8\u5F53\u4E8E\u4E00\u4E2A\u8F66\u95F4),\u4E00\u4E2A\u8FDB\u7A0B\u4E2D\u53EF\u4EE5\u6709\u591A\u4E2A\u7EBF\u7A0B(\u8F66\u95F4\u91CC\u7684\u5458\u5DE5),\u540C\u4E00\u4E2A\u8FDB\u7A0B\u4E2D\u7684\u7EBF\u7A0B\u5171\u4EAB\u8FDB\u7A0B\u4E2D\u7684\u8D44\u6E90\u3002\uFF08\u8F66\u95F4\u91CC\u7684\u5458\u5DE5\u53EF\u4EE5\u4F7F\u7528\u8BE5\u8F66\u95F4\u7684\u5171\u4EAB\u8D44\u6E90\uFF09\u3002</p></div><div class="custom-container danger"><p class="custom-container-title">\u8B66\u544A</p><p><strong>\u6CE8\u610F\uFF1A\u8FDB\u7A0B\u4E0E\u8FDB\u7A0B\u4E4B\u95F4\u662F\u76F8\u4E92\u9694\u79BB\u7684\uFF0C\u6BCF\u4E2A\u8FDB\u7A0B\u4E2D\u90FD\u7EF4\u62A4\u81EA\u5DF1\u72EC\u7ACB\u7684\u6570\u636E\uFF0C\u4E0D\u8FDB\u884C\u5171\u4EAB\uFF1B\u5982\u679C\u60F3\u8BA9\u4ED6\u4EEC\u4E4B\u95F4\u8FDB\u884C\u5171\u4EAB\uFF0C\u9700\u8981\u501F\u52A9\u4E00\u4E9B\u7279\u6B8A\u7684\u529E\u6CD5\u53BB\u5B9E\u73B0</strong></p></div><h2 id="\u5E76\u53D1\u4E0E\u5E76\u884C" tabindex="-1"><a class="header-anchor" href="#\u5E76\u53D1\u4E0E\u5E76\u884C" aria-hidden="true">#</a> \u5E76\u53D1\u4E0E\u5E76\u884C</h2><p>\u5E76\u53D1\uFF1A\u540C\u4E00\u65F6\u95F4\u6BB5\u5185\u6267\u884C\u591A\u4E2A\u4EFB\u52A1</p><p>\u5E76\u884C\uFF1A\u540C\u4E00\u65F6\u95F4\u6BB5\u5185\u591A\u4E2A CPU \u6267\u884C\u540C\u4E00\u4EF6\u4EFB\u52A1</p><p>Go \u8BED\u8A00\u7684\u5E76\u53D1\u901A\u8FC7<code>goroutine</code>\u5B9E\u73B0\u3002<code>goroutine</code>\u7C7B\u4F3C\u4E8E\u7EBF\u7A0B\uFF0C\u5C5E\u4E8E\u7528\u6237\u6001\u7684\u7EBF\u7A0B\uFF0C\u4E5F\u53EB<code>\u534F\u7A0B</code>\uFF0C\u662F\u7A0B\u5E8F\u5458\u81EA\u5DF1\u5F04\u51FA\u6765\u7684\u3002<code>goroutine</code>\u662F\u7531 Go \u8BED\u8A00\u7684\u8FD0\u884C\u65F6<code>runtime</code>\u8C03\u5EA6\u5B8C\u6210\u7684\uFF0C\u800C\u7EBF\u7A0B\u662F\u7531\u64CD\u4F5C\u7CFB\u7EDF\u5185\u6838\u8C03\u5EA6\u5B8C\u6210\u7684\u3002</p><p>Go \u8BED\u8A00\u63D0\u4F9B<code>channel</code>\u5728\u591A\u4E2A<code>goroutine</code>\u95F4\u8FDB\u884C\u901A\u4FE1\u3002<code>goroutine</code>\u548C<code>channel</code>\u662F Go \u8BED\u8A00\u79C9\u627F\u7684 CSP(Communicating Sequential Process)\u5E76\u53D1\u6A21\u5F0F\u7684\u91CD\u8981\u5B9E\u73B0\u57FA\u7840\u3002</p><h3 id="\u534F\u7A0B" tabindex="-1"><a class="header-anchor" href="#\u534F\u7A0B" aria-hidden="true">#</a> \u534F\u7A0B</h3><p>\u534F\u7A0B\u7684\u4F18\u52BF\uFF1A</p><ol><li>\u534F\u7A0B\u7684\u5185\u5B58\u6D88\u8017\u66F4\u5C0F <ul><li>\u4E00\u4E2A\u7EBF\u7A0B\u53EF\u4EE5\u5305\u542B\u591A\u4E2A\u534F\u7A0B</li><li>\u7EBF\u7A0B\u5927\u7EA6 2MB \u7684\u5185\u5B58\u7533\u8BF7\u91CF</li><li>\u534F\u7A0B\u5927\u6982 2KB \u7684\u5185\u5B58\u7533\u8BF7\u91CF\uFF0C\u6700\u5927\u53EF\u4EE5\u6269\u5927\u7684\u5230 1G</li></ul></li><li>\u4E0A\u4E0B\u6587\u5207\u6362\u66F4\u5FEB <ul><li>\u534F\u7A0B\u5C11\u4E00\u9053\u624B\u7EED</li><li>\u7EBF\u7A0B\u7533\u8BF7\u5185\u5B58\uFF0C\u9700\u8981\u8D70\u8FC7\u5185\u6838</li><li>\u534F\u7A0B\u7533\u8BF7\u5185\u5B58\uFF0C\u4E0D\u9700\u8981\u8D70\u8FC7\u5185\u6838</li></ul></li></ol><blockquote><p>Goroutine \u5B9E\u8D28\u4E0A\u662F\u4E00\u79CD\u534F\u7A0B</p></blockquote><ol><li>\u53BB\u6389\u4E86\u5197\u4F59\u7684\u534F\u7A0B\u751F\u547D\u5468\u671F\u7BA1\u7406 <ol><li>\u534F\u7A0B\u521B\u5EFA</li><li>\u534F\u7A0B\u5B8C\u6210</li><li>\u534F\u7A0B\u91CD\u7528</li></ol></li><li>\u964D\u4F4E\u989D\u5916\u7684\u5EF6\u8FDF\u548C\u5F00\u9500 <ol><li>\u7531\u4E8E\u534F\u7A0B\u95F4\u9891\u7E41\u4EA4\u4E92\u5BFC\u81F4\u7684</li></ol></li><li>\u964D\u4F4E\u52A0\u9501\u3001\u89E3\u9501\u7684\u6548\u7387 <ol><li>\u964D\u4F4E\u4E00\u90E8\u5206\u989D\u5916\u7684\u5F00\u9500</li></ol></li></ol><h3 id="\u901A\u4FE1" tabindex="-1"><a class="header-anchor" href="#\u901A\u4FE1" aria-hidden="true">#</a> \u901A\u4FE1</h3><p>\u5E76\u53D1\u7F16\u7A0B\u7684\u96BE\u5EA6\u5728\u4E8E\u534F\u8C03\uFF0C\u800C\u534F\u8C03\u9700\u8981\u901A\u8FC7\u4EA4\u6D41\uFF0C\u5E76\u53D1\u5355\u5143\u95F4\u7684\u901A\u4FE1\u662F\u6700\u5927\u7684\u95EE\u9898\u3002</p><p>\u5728\u5DE5\u7A0B\u4E0A\u6709\u4E24\u79CD\u6700\u5E38\u89C1\u7684\u5E76\u53D1\u901A\u4FE1\u6A21\u578B\uFF1A\u5171\u4EAB\u6570\u636E\u548C\u6D88\u606F</p><p>Go \u8BED\u8A00\u662F\u5728<code>csp</code>\u6A21\u578B\u57FA\u7840\u4E0A\u8FDB\u884C\u5B9E\u73B0\u7684\u3002</p><div class="custom-container danger"><p class="custom-container-title">\u8B66\u544A</p><p>\u4E00\u4E2A<code>channel</code>\u53EA\u80FD\u4F20\u9012\u4E00\u79CD\u7C7B\u578B\u7684\u503C\uFF1B\u53EF\u4EE5\u8BA4\u4E3A\u662F\u4E00\u79CD\u7C7B\u578B\u5B89\u5168\u7684\u7BA1\u9053\u3002\u7C7B\u578B\u5B89\u5168\u5C31\u662F\u4E00\u79CD\u7EBF\u7A0B\u5B89\u5168</p></div><h2 id="\u4F7F\u7528-goroutine" tabindex="-1"><a class="header-anchor" href="#\u4F7F\u7528-goroutine" aria-hidden="true">#</a> \u4F7F\u7528 goroutine</h2><p>Go \u8BED\u8A00\u4E2D\u4F7F\u7528<code>goroutine</code>\u975E\u5E38\u7B80\u5355\uFF0C\u53EA\u9700\u8981\u5728\u8C03\u5EA6\u51FD\u6570\u7684\u65F6\u5019\u5728\u524D\u9762\u52A0\u4E0A<code>go</code>\u5173\u952E\u5B57\uFF0C\u5C31\u53EF\u4EE5\u4E3A\u4E00\u4E2A\u51FD\u6570\u521B\u5EFA\u4E00\u4E2A<code>goroutine</code></p><p>\u4E00\u4E2A<code>goroutine</code>\u5FC5\u5B9A\u5BF9\u5E94\u4E00\u4E2A\u51FD\u6570\uFF0C\u53EF\u4EE5\u521B\u5EFA\u591A\u4E2A<code>goroutine</code>\u53BB\u6267\u884C\u76F8\u540C\u7684\u51FD\u6570\u3002</p><h3 id="\u542F\u52A8\u5355\u4E2A-goroutine" tabindex="-1"><a class="header-anchor" href="#\u542F\u52A8\u5355\u4E2A-goroutine" aria-hidden="true">#</a> \u542F\u52A8\u5355\u4E2A goroutine</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;hello goroutine&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">// \u542F\u52A8\u7684\u65F6\u5019\u4F1A\u5F00\u542F\u4E00\u4E2A main \u7684goroutine\u53BB\u6267\u884Cmain\u51FD\u6570</span>
	<span class="token keyword">go</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u5F00\u542F\u4E86\u4E00\u4E2A\u72EC\u7ACB\u7684goroutine\u53BB\u6267\u884Chello\u51FD\u6570</span>

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;main goroutine done!&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u4E00\u6B21\u7684\u6267\u884C\u7ED3\u679C\u53EA\u6253\u5370\u4E86<code>main goroutine done</code>\uFF0C<code>hello()</code>\u51FD\u6570\u8FD8\u6CA1\u6765\u5F97\u53CA\u6267\u884C\u5C31\u7ED3\u675F\u4E86\u3002\u6240\u4EE5\u9700\u8981\u5728\u7ED3\u5C3E\u52A0\u4E0A\u5EF6\u8FDF\u51E0\u79D2\u8FDB\u884C\u7B49\u5F85\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;hello goroutine&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">go</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;main goroutine done!&quot;</span><span class="token punctuation">)</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span> <span class="token comment">// \u8BA9\u4E3B\u7684goroutine \u7B49\u5F851\u79D2\u949F</span>
<span class="token punctuation">}</span>


<span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span>\u8F93\u51FA
hello goroutine
main goroutine done<span class="token operator">!</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>main</code>\u51FD\u6570\u6267\u884C\u5B8C\u4E86\uFF0C\u5C31\u4EE3\u8868\u6574\u4E2A\u5C31\u7ED3\u675F\u4E86\uFF0C\u6240\u4EE5\u6CA1\u52A0\u4E0A\u5EF6\u8FDF\u963B\u585E\uFF0C\u522B\u7684<code>goroutine</code>\u6839\u672C\u6765\u4E0D\u53CA\u53BB\u6267\u884C\uFF0C\u7A0B\u5E8F\u5360\u7528\u7684\u8D44\u6E90\u4E5F\u5C31\u5173\u95ED\u4E86\u3002</p><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u4F46\u662F\u8FD9\u91CC\u5E76\u4E0D\u5EFA\u8BAE\u5728\u751F\u4EA7\u73AF\u5883\u4E2D\u4F7F\u7528<code>time.Sleep</code>\uFF0C\u53EF\u4EE5\u4F7F\u7528<code>sync</code>\u5305\u7684<code>WaigGroup</code>\u6765\u5B9E\u73B0</p></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> wg sync<span class="token punctuation">.</span>WaitGroup

<span class="token keyword">func</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;hello goroutine&quot;</span><span class="token punctuation">)</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u544A\u8BC9 main \u51FD\u6570 \u6267\u884C\u5B8C\u4E86  \u901A\u77E5 wg\u628A\u8BA1\u6570\u5668-1</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

	wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token comment">// \u6280\u6570\u724C+1</span>
	<span class="token keyword">go</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;main goroutine done!&quot;</span><span class="token punctuation">)</span>
	<span class="token comment">//time.Sleep(time.Second)</span>

	<span class="token comment">// \u7B49\u5F85\u522B\u7684goroutine\u5E72\u5B8C\u6D3B\u624D\u7ED3\u675F</span>
	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u963B\u585E\uFF0C\u7B49\u5230\u8BA1\u6570\u5668\u5F52\u96F6\uFF0C\u5C31\u4F1A\u7ED3\u675F</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4E0A\u8FF0\u662F\u5F00\u542F\u4E86\u4E00\u4E2A<code>goroutine</code>\uFF0C\u5982\u679C\u5F00\u542F\u591A\u4E2A\u5462</p><h3 id="\u542F\u52A8\u591A\u4E2A-goroutine" tabindex="-1"><a class="header-anchor" href="#\u542F\u52A8\u591A\u4E2A-goroutine" aria-hidden="true">#</a> \u542F\u52A8\u591A\u4E2A goroutine</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> wg sync<span class="token punctuation">.</span>WaitGroup

<span class="token keyword">func</span> <span class="token function">hello</span><span class="token punctuation">(</span>i <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;hello goroutine&quot;</span><span class="token punctuation">,</span> i<span class="token punctuation">)</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u544A\u8BC9 main \u51FD\u6570 \u6267\u884C\u5B8C\u4E86  \u901A\u77E5 wg\u628A\u8BA1\u6570\u5668-1</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

	<span class="token comment">//wg.Add(1) // \u6280\u6570\u724C+1</span>

	wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span> <span class="token comment">// \u4E00\u6B21\u5168\u52A0\u6EE1</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10000</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token comment">//wg.Add(1) // \u6216\u8005\u6BCF\u6709\u4E00\u4E2Agoroutine\u52A0\u4E00\u4E2A</span>
		<span class="token keyword">go</span> <span class="token function">hello</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;main goroutine done!&quot;</span><span class="token punctuation">)</span>
	<span class="token comment">//time.Sleep(time.Second)</span>

	<span class="token comment">// \u7B49\u5F85\u522B\u7684goroutine\u5E72\u5B8C\u6D3B\u624D\u7ED3\u675F</span>
	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u963B\u585E\uFF0C\u7B49\u5230\u8BA1\u6570\u5668\u5F52\u96F6\uFF0C\u5C31\u4F1A\u7ED3\u675F</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4F7F\u7528\u533F\u540D\u51FD\u6570\u95ED\u5305\u51FA\u73B0\u7684\u95EE\u9898\u4EE5\u53CA\u89E3\u51B3\u529E\u6CD5</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> wg2 sync<span class="token punctuation">.</span>WaitGroup

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	wg2<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span> <span class="token comment">// \u4E00\u6B21\u5168\u52A0\u6EE1</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10000</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token comment">// wg2.Add(1) // \u6216\u8005\u6BCF\u6709\u4E00\u4E2Agoroutine\u52A0\u4E00\u4E2A</span>
		<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span>i <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token comment">// \u6362\u6210\u533F\u540D\u51FD\u6570(\u95ED\u5305) \u5305\u542B\u4E86\u4E00\u4E2A\u5916\u90E8\u51FD\u6570\u7684\u4E00\u4E2A\u53D8\u91CF\u7684\u5F15\u7528</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;hello&quot;</span><span class="token punctuation">,</span> i<span class="token punctuation">)</span>
			wg2<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u90FD\u6267\u884C\u5B8C\u4E86\uFF0C\u901A\u77E5\u7ED3\u675F</span>
		<span class="token punctuation">}</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span> <span class="token comment">// \u6B64\u65F6\u7684i\u662F\u6BCF\u6B21for\u5FAA\u73AF\u7684i\u4F20\u8FDB\u6765\u7684 \u526F\u672C</span>
	<span class="token punctuation">}</span>

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;main goroutine done!&quot;</span><span class="token punctuation">)</span>

	<span class="token comment">// \u7B49\u5F85\u522B\u7684goroutine\u5E72\u5B8C\u6D3B\u624D\u7ED3\u675F</span>
	wg2<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u963B\u585E\uFF0C\u7B49\u5230\u8BA1\u6570\u5668\u5F52\u96F6\uFF0C\u5C31\u4F1A\u7ED3\u675F</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="goroutine-\u7684\u8C03\u5EA6" tabindex="-1"><a class="header-anchor" href="#goroutine-\u7684\u8C03\u5EA6" aria-hidden="true">#</a> goroutine \u7684\u8C03\u5EA6</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;runtime&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> wg3 sync<span class="token punctuation">.</span>WaitGroup

<span class="token keyword">func</span> <span class="token function">a</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;a&quot;</span><span class="token punctuation">,</span> i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	wg3<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">b</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;b&quot;</span><span class="token punctuation">,</span> i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	wg3<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">c</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;c&quot;</span><span class="token punctuation">,</span> i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	wg3<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	runtime<span class="token punctuation">.</span><span class="token function">GOMAXPROCS</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token comment">// \u53EA\u5360\u7528\u4E00\u4E2ACPU\u6838\u5FC3</span>

	wg3<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">a</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">b</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	wg3<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token comment">//time.Sleep(time.Second)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6B64\u65F6\u53EA\u4F1A\u4E13\u95E8\u5B8C\u6210\u5176\u4E2D\u4E00\u4E2A\uFF0C\u518D\u53BB\u6267\u884C\u53E6\u5916\u4E00\u4E2A\u3002</p><p>Go \u8BED\u8A00\u4E2D\u7684\u64CD\u4F5C\u7CFB\u7EDF\u7EBF\u7A0B\u548C goroutine \u7684\u5173\u7CFB\uFF1A</p><ol><li>\u4E00\u4E2A\u64CD\u4F5C\u7CFB\u7EDF\u7EBF\u7A0B\u5BF9\u5E94\u7528\u6237\u6001\u591A\u4E2A goroutine</li><li>go \u7A0B\u5E8F\u53EF\u4EE5\u540C\u65F6\u4F7F\u7528\u591A\u4E2A\u64CD\u4F5C\u7CFB\u7EDF\u7EBF\u7A0B</li><li>goroutine \u548C OS \u7EBF\u7A0B\u662F\u591A\u5BF9\u591A\u5173\u7CFB\uFF0C\u5373<code>m:n</code></li></ol><h2 id="channel-\u7684\u4F7F\u7528" tabindex="-1"><a class="header-anchor" href="#channel-\u7684\u4F7F\u7528" aria-hidden="true">#</a> channel \u7684\u4F7F\u7528</h2><p>Go \u8BED\u8A00\u7684\u5E76\u53D1\u6A21\u578B<code>CSP</code>\u63D0\u5021<strong>\u901A\u8FC7\u901A\u4FE1\u5171\u4EAB\u5185\u5B58</strong>\u800C\u4E0D\u662F\u901A<strong>\u8FC7\u5171\u4EAB\u5185\u5B58\u800C\u5B9E\u73B0\u901A\u4FE1</strong>\u3002</p><p>\u5982\u679C goroutine \u662F Go \u7A0B\u5E8F\u5E76\u53D1\u7684\u6267\u884C\u4F53\uFF0C<code>channel</code>\u5C31\u662F\u5B83\u4EEC\u4E4B\u95F4\u7684\u8FDE\u63A5\u3002<code>channel</code>\u662F\u53EF\u4EE5\u8BA9\u4E00\u4E2A<code>goroutine</code>\u53D1\u9001\u7279\u5B9A\u7684\u503C\u5230\u53E6\u4E00\u4E2A<code>goroutine</code>\u7684\u901A\u4FE1\u673A\u5236\u3002</p><p>Go \u8BED\u8A00\u7684\u901A\u9053 <code>channel</code>\u662F\u4E00\u79CD \u7279\u6B8A\u7684\u7C7B\u578B\uFF0C\u603B\u662F\u9075\u5FAA\u5148\u5165\u5148\u51FA\u7684\u89C4\u5219\uFF0C\u4FDD\u8BC1\u6536\u53D1\u6570\u636E\u7684\u987A\u5E8F\u3002\u6BCF\u4E2A\u901A\u9053\u90FD\u662F\u4E00\u4E2A\u5177\u4F53\u7C7B\u578B\u7684\u7BA1\u9053\u3002</p><h3 id="channel-\u7C7B\u578B" tabindex="-1"><a class="header-anchor" href="#channel-\u7C7B\u578B" aria-hidden="true">#</a> channel \u7C7B\u578B</h3><p><code>channel</code>\u662F\u4E00\u79CD\u7C7B\u578B\uFF0C\u800C\u4E14\u662F\u4E00\u79CD\u5F15\u7528\u7C7B\u578B\uFF0C<strong>\u4F7F\u7528\u65F6\u9700\u8981\u521D\u59CB\u5316</strong>\u3002\u58F0\u660E\u683C\u5F0F\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> \u53D8\u91CF <span class="token keyword">chan</span> \u5143\u7D20\u7C7B\u578B
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> ch1 <span class="token keyword">chan</span> <span class="token builtin">int</span> <span class="token comment">// \u58F0\u660E\u4E00\u4E2A\u4F20\u9012int\u7C7B\u578B\u7684\u901A\u9053</span>
<span class="token keyword">var</span> ch2 <span class="token keyword">chan</span> <span class="token builtin">bool</span> <span class="token comment">// \u58F0\u660E\u4E00\u4E2A\u4F20\u9012\u5E03\u5C14\u7C7B\u578B\u7684\u901A\u9053</span>
<span class="token keyword">var</span> ch3 <span class="token keyword">chan</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">int</span> <span class="token comment">// \u58F0\u660E\u4E00\u4E2A\u4F20\u9012int\u5207\u7247\u7684\u901A\u9053</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u521B\u5EFA-channel" tabindex="-1"><a class="header-anchor" href="#\u521B\u5EFA-channel" aria-hidden="true">#</a> \u521B\u5EFA channel</h3><p>\u5B83\u662F\u5F15\u7528\u7C7B\u578B\uFF0C\u8BE5\u7C7B\u578B\u7684\u7A7A\u503C\u662F<code>nil</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> ch <span class="token keyword">chan</span> <span class="token builtin">int</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span> <span class="token comment">// &lt;nil&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container danger"><p class="custom-container-title">\u8B66\u544A</p><p>\u58F0\u660E<code>channel</code>\u540E\u9700\u8981\u4F7F\u7528<code>make</code>\u8FDB\u884C\u521D\u59CB\u5316\u540E\u624D\u80FD\u4F7F\u7528</p></div><p><code>channel</code>\u7684\u7F13\u51B2\u5927\u5C0F\u662F\u53EF\u9009\u7684\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>ch3 <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>
ch4 <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">bool</span><span class="token punctuation">)</span>
ch5 <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">int</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="channel-\u64CD\u4F5C" tabindex="-1"><a class="header-anchor" href="#channel-\u64CD\u4F5C" aria-hidden="true">#</a> channel \u64CD\u4F5C</h3><ul><li>\u53D1\u9001 send</li><li>\u63A5\u6536 receive</li><li>\u5173\u95ED close</li></ul><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u53D1\u9001\u548C\u63A5\u6536\u90FD\u4F7F\u7528<code>&lt;-</code>\u7B26\u53F7</p><ol><li><code>channel</code>\u5728<code>&lt;-</code>\u5DE6\u8FB9\u5C31\u662F\u53D1\u9001</li><li><code>channel</code>\u5728<code>&lt;-</code> \u53F3\u8FB9\u5C31\u662F\u63A5\u6536</li></ol></div><p>\u5148\u5B9A\u4E49\u4E00\u4E2A channel</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="\u53D1\u9001" tabindex="-1"><a class="header-anchor" href="#\u53D1\u9001" aria-hidden="true">#</a> \u53D1\u9001</h4><p>\u5C06\u4E00\u4E2A\u503C\u53D1\u9001\u5230<code>channel</code>\u4E2D</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>ch <span class="token operator">&lt;-</span> <span class="token number">10</span> <span class="token comment">// \u628A10 \u53D1\u9001\u5230 ch \u4E2D</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="\u63A5\u6536" tabindex="-1"><a class="header-anchor" href="#\u63A5\u6536" aria-hidden="true">#</a> \u63A5\u6536</h4><p>\u4ECE\u4E00\u4E2A<code>channel</code>\u4E2D\u63A5\u6536\u503C</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>x <span class="token operator">:=</span> <span class="token operator">&lt;-</span> ch <span class="token comment">// \u4ECEch\u4E2D\u63A5\u6536\u503C\u5E76\u8D4B\u503C\u7ED9\u53D8\u91CFx</span>
<span class="token operator">&lt;-</span>ch <span class="token comment">// \u4ECEch\u4E2D\u63A5\u6536\u503C \u5FFD\u7565\u7ED3\u679C</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="\u5173\u95ED" tabindex="-1"><a class="header-anchor" href="#\u5173\u95ED" aria-hidden="true">#</a> \u5173\u95ED</h4><p>\u901A\u8FC7\u8C03\u7528\u5185\u7F6E\u7684<code>close</code>\u51FD\u6570\u6765\u8FDB\u884C\u5173\u95ED<code>channel</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token function">close</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="custom-container danger"><p class="custom-container-title">\u8B66\u544A</p><p>\u5173\u4E8E\u5173\u95ED<code>channel</code>\u9700\u8981\u6CE8\u610F\uFF1A\u53EA\u6709\u5728\u901A\u77E5\u63A5\u6536\u65B9<code>goroutine</code>\u6240\u6709\u7684\u6570\u636E\u90FD\u53D1\u9001\u5B8C\u6BD5\u7684\u65F6\u5019\u624D\u9700\u8981\u5173\u95ED\u3002<code>channel</code>\u662F\u53EF\u4EE5\u88AB\u5783\u573E\u56DE\u6536\u673A\u5236\u56DE\u6536\u7684\uFF0C\u5B83\u548C\u5173\u95ED\u6587\u4EF6\u662F\u4E0D\u4E00\u6837\u7684\uFF0C\u5728\u7ED3\u675F\u64CD\u4F5C\u540E\u5173\u95ED\u6587\u4EF6\u65F6\u5FC5\u987B\u8981\u505A\u7684\uFF0C\u4F46\u662F\u5173\u95ED<code>channel</code>\u4E0D\u662F\u5FC5\u987B\u7684\u3002</p></div><p><strong>\u5173\u95ED\u540E\u7684<code>channel</code>\u6709\u4EE5\u4E0B\u7279\u70B9</strong></p><ol><li>\u5BF9\u4E00\u4E2A\u5173\u95ED\u7684<code>channel</code>\u5728\u53D1\u9001\u6570\u636E\u5C31\u4F1A\u5BFC\u81F4<code>panic</code></li><li>\u5BF9\u4E00\u4E2A\u5173\u95ED\u7684<code>channel</code>\u8FDB\u884C\u63A5\u6536\u4F1A\u4E00\u76F4\u83B7\u53D6\u503C\u76F4\u5230<code>channel</code>\u4E3A\u7A7A</li><li>\u5BF9\u4E00\u4E2A\u5173\u95ED\u7684<code>channel</code>\u7684\u5E76\u4E14\u6CA1\u6709\u503C\u7684<code>channel</code>\u6267\u884C\u63A5\u6536\u64CD\u4F5C\u4F1A\u5F97\u5230\u5BF9\u5E94\u7C7B\u578B\u7684\u96F6\u503C</li><li>\u5173\u95ED\u4E00\u4E2A\u5DF2\u7ECF\u5173\u95ED\u7684<code>channel</code>\u4F1A\u5BFC\u81F4<code>panic</code></li></ol><h3 id="\u65E0\u7F13\u51B2\u7684-channel" tabindex="-1"><a class="header-anchor" href="#\u65E0\u7F13\u51B2\u7684-channel" aria-hidden="true">#</a> \u65E0\u7F13\u51B2\u7684 channel</h3><p>\u65E0\u7F13\u51B2\u7684<code>channel</code>\u53C8\u79F0\u4E4B\u4E3A\u963B\u585E\u7684\u901A\u9053\uFF0C\u4E5F\u53EB\u540C\u6B65<code>channel</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>
  ch <span class="token operator">&lt;-</span> <span class="token number">10</span> <span class="token comment">// \u5F80ch\u53D1\u9001\u503C\uFF0C\u6CA1\u6709\u7F13\u51B2\u533A\uFF0C\u5B83\u4E0D\u80FD\u6682\u5B58\u503C\uFF0C\u4E00\u76F4\u963B\u585E\uFF0C\u9664\u975E\u6709\u53E6\u5916\u4E00\u4E2Agoroutine\u4ECE\u91CC\u9762\u8FDB\u884C\u53D6\u503C</span>
  fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u53D1\u9001\u6210\u529F&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container danger"><p class="custom-container-title">\u8B66\u544A</p><p>\u4E0A\u8FF0\u4EE3\u7801\u80FD\u591F\u901A\u8FC7\u7F16\u8BD1\uFF0C\u4F46\u662F\u6267\u884C\u4F1A\u62A5\u9519</p><p><code>fatal error: all goroutines are asleep - deadlock!</code></p><p>\u6B7B\u9501\u4E86\uFF01</p><p><strong>\u4E5F\u5C31\u662F\u8BF4\uFF0C\u53D1\u9001\u6570\u636E\u5FC5\u987B\u6709\u4E00\u4E2A\u63A5\u53D7\u8005\uFF0C\u5426\u5219\u5C31\u662F\u963B\u585E</strong></p></div><p>\u4E00\u79CD\u65B9\u6CD5\u662F\u542F\u7528\u4E00\u4E2A<code>goroutine</code>\u53BB\u63A5\u6536\u503C\uFF0C\u4F8B\u5982\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">recv</span><span class="token punctuation">(</span>c <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ret <span class="token operator">:=</span> <span class="token operator">&lt;-</span>c
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u63A5\u6536\u6210\u529F&quot;</span><span class="token punctuation">,</span> ret<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">recv</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span> <span class="token comment">// \u542F\u7528goroutine\u4ECE\u901A\u9053\u63A5\u6536\u503C</span>
	ch <span class="token operator">&lt;-</span> <span class="token number">10</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u53D1\u9001\u6210\u529F&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u65E0\u7F13\u51B2\u901A\u9053\u4E0A\u7684\u53D1\u9001\u64CD\u4F5C\u4F1A\u963B\u585E\uFF0C\u76F4\u5230\u53E6\u4E00\u4E2A<code>goroutine</code>\u5728\u8BE5\u901A\u9053\u4E0A\u6267\u884C\u63A5\u6536\u64CD\u4F5C\uFF0C\u8FD9\u65F6\u503C\u624D\u80FD\u53D1\u9001\u6210\u529F\uFF0C\u4E24\u4E2A<code>goroutine</code>\u5C06\u7EE7\u7EED\u6267\u884C\u3002\u76F8\u53CD\uFF0C\u5982\u679C\u63A5\u6536\u64CD\u4F5C\u5148\u6267\u884C\uFF0C\u63A5\u6536\u65B9\u7684 goroutine \u5C06\u963B\u585E\uFF0C\u76F4\u5230\u53E6\u4E00\u4E2A<code>goroutine</code>\u5728\u8BE5\u901A\u9053\u4E0A\u53D1\u9001\u4E00\u4E2A\u503C\u3002</p><p>\u4F7F\u7528\u65E0\u7F13\u51B2\u901A\u9053\u8FDB\u884C\u901A\u4FE1\u5C06\u5BFC\u81F4\u53D1\u9001\u548C\u63A5\u6536\u7684<code>goroutine</code>\u540C\u6B65\u5316\u3002\u56E0\u6B64\uFF0C\u65E0\u7F13\u51B2\u901A\u9053\u4E5F\u88AB\u79F0\u4E3A<code>\u540C\u6B65\u901A\u9053</code>\u3002</p><h3 id="\u5E26\u7F13\u51B2\u533A\u7684-channel" tabindex="-1"><a class="header-anchor" href="#\u5E26\u7F13\u51B2\u533A\u7684-channel" aria-hidden="true">#</a> \u5E26\u7F13\u51B2\u533A\u7684 channel</h3><p>\u53C8\u79F0\u4E4B\u4E3A\u5F02\u6B65<code>channel</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token comment">// \u521B\u5EFA\u4E00\u4E2A\u5BB9\u91CF\u4E3A1\u7684\u6709\u7F13\u51B2\u533A\u901A\u9053</span>
	ch <span class="token operator">&lt;-</span> <span class="token number">10</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u53D1\u9001\u6210\u529F&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u901A\u9053\u7684\u5BB9\u91CF\u8868\u793A\u901A\u9053\u4E2D\u80FD\u5B58\u653E\u5143\u7D20\u7684\u6570\u91CF\u3002\u5C31\u50CF\u4F60\u5C0F\u533A\u7684\u5FEB\u9012\u67DC\u53EA\u6709\u90A3\u4E48\u4E2A\u591A\u683C\u5B50\uFF0C\u683C\u5B50\u6EE1\u4E86\u5C31\u88C5\u4E0D\u4E0B\u4E86\uFF0C\u5C31\u963B\u585E\u4E86\uFF0C\u7B49\u5230\u522B\u4EBA\u53D6\u8D70\u4E00\u4E2A\u5FEB\u9012\u5458\u5C31\u80FD\u5F80\u91CC\u9762\u653E\u4E00\u4E2A\u3002</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">sender</span><span class="token punctuation">(</span>ch <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">100</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		ch <span class="token operator">&lt;-</span> i <span class="token comment">// \u53D1\u9001i</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// \u53D1\u9001\u73A9\u5C31\u5173\u95ED ch</span>
	<span class="token function">close</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">receiver</span><span class="token punctuation">(</span>ch1<span class="token punctuation">,</span> ch2 <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u4ECEchannel\u4E2D\u53D6\u503C\u7684\u65B9\u5F0F1</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		tmp<span class="token punctuation">,</span> ok <span class="token operator">:=</span> <span class="token operator">&lt;-</span>ch1
		<span class="token comment">// 100\u4E2A\u503C\u53D6\u5B8C\u4E86\uFF0Cok =&gt; false \u5C31\u4EE3\u8868\u53D6\u5B8C\u4E86</span>
		<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		ch2 <span class="token operator">&lt;-</span> tmp <span class="token operator">*</span> tmp
	<span class="token punctuation">}</span>
	<span class="token function">close</span><span class="token punctuation">(</span>ch2<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ch1 <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span>
	ch2 <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">200</span><span class="token punctuation">)</span>

	<span class="token keyword">go</span> <span class="token function">sender</span><span class="token punctuation">(</span>ch1<span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">receiver</span><span class="token punctuation">(</span>ch1<span class="token punctuation">,</span> ch2<span class="token punctuation">)</span>

	<span class="token comment">// \u4ECEchannel\u4E2D\u53D6\u503C\u7684\u65B9\u5F0F2</span>
	<span class="token keyword">for</span> ret <span class="token operator">:=</span> <span class="token keyword">range</span> ch2 <span class="token punctuation">{</span>
		<span class="token comment">// \u5185\u90E8\u4F1A\u5224\u65AD\u53D6\u503C\u9047\u5230\u4E86false\u5C31\u4F1A\u9000\u51FA</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>ret<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token comment">// \u53EA\u80FD\u5F80\u91CC\u9762\u53D1</span>
<span class="token keyword">func</span> <span class="token function">sender</span><span class="token punctuation">(</span>ch <span class="token keyword">chan</span><span class="token operator">&lt;-</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">100</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		ch <span class="token operator">&lt;-</span> i <span class="token comment">// \u53D1\u9001i</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// \u53D1\u9001\u73A9\u5C31\u5173\u95ED ch</span>
	<span class="token function">close</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// \u4ECEch1\u53D6\u503C\uFF0C\u628A\u7ED3\u679C\u53D1\u9001\u4E2Ach2</span>
<span class="token comment">// ch1 \u53EA\u80FD\u53D6</span>
<span class="token comment">// ch2 \u53EA\u80FD\u53D1</span>
<span class="token keyword">func</span> <span class="token function">receiver</span><span class="token punctuation">(</span>ch1 <span class="token operator">&lt;-</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> ch2 <span class="token keyword">chan</span><span class="token operator">&lt;-</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u4ECEchannel\u4E2D\u53D6\u503C\u7684\u65B9\u5F0F1</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		tmp<span class="token punctuation">,</span> ok <span class="token operator">:=</span> <span class="token operator">&lt;-</span>ch1
		<span class="token comment">// 100\u4E2A\u503C\u53D6\u5B8C\u4E86\uFF0Cok =&gt; false \u5C31\u4EE3\u8868\u53D6\u5B8C\u4E86</span>
		<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		ch2 <span class="token operator">&lt;-</span> tmp <span class="token operator">*</span> tmp
	<span class="token punctuation">}</span>
	<span class="token function">close</span><span class="token punctuation">(</span>ch2<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ch1 <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span>
	ch2 <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">200</span><span class="token punctuation">)</span>

	<span class="token keyword">go</span> <span class="token function">sender</span><span class="token punctuation">(</span>ch1<span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">receiver</span><span class="token punctuation">(</span>ch1<span class="token punctuation">,</span> ch2<span class="token punctuation">)</span>

	<span class="token comment">// \u4ECEchannel\u4E2D\u53D6\u503C\u7684\u65B9\u5F0F2</span>
	<span class="token keyword">for</span> ret <span class="token operator">:=</span> <span class="token keyword">range</span> ch2 <span class="token punctuation">{</span>
		<span class="token comment">// \u5185\u90E8\u4F1A\u5224\u65AD\u53D6\u503C\u9047\u5230\u4E86false\u5C31\u4F1A\u9000\u51FA</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>ret<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p><code>chan&lt;- int</code>\u662F\u4E00\u4E2A\u53EA\u5199\u5355\u5411\u901A\u9053\uFF08\u53EA\u80FD\u5BF9\u5176\u5199\u5165 int \u7C7B\u578B\u503C\uFF09\uFF0C\u53EF\u4EE5\u5BF9\u5176\u6267\u884C\u53D1\u9001\u64CD\u4F5C\u4F46\u662F\u4E0D\u80FD\u6267\u884C\u63A5\u6536\u64CD\u4F5C</p><p><code>&lt;-chan int</code>\u662F\u4E00\u4E2A\u53EA\u8BFB\u5355\u5411\u901A\u9053\uFF08\u53EA\u80FD\u4ECE\u5176\u8BFB\u53D6 int \u7C7B\u578B\u503C\uFF09\uFF0C\u53EF\u4EE5\u5BF9\u5176\u6267\u884C\u63A5\u6536\u64CD\u4F5C\u4F46\u662F\u4E0D\u80FD\u6267\u884C\u53D1\u9001\u64CD\u4F5C\u3002</p></div><h3 id="worker-pool-goroutine-\u6C60" tabindex="-1"><a class="header-anchor" href="#worker-pool-goroutine-\u6C60" aria-hidden="true">#</a> worker pool(goroutine \u6C60)</h3><p>\u5728\u5DE5\u4F5C\u4E2D\u901A\u5E38\u4F1A\u4F7F\u7528<code>workerpool</code>\u6A21\u5F0F\uFF0C\u63A7\u5236<code>goroutine</code>\u7684\u6570\u91CF\uFF0C\u9632\u6B62<code>goroutine</code>\u6CC4\u9732\u548C\u66B4\u6DA8</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">worker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">,</span> jobs <span class="token operator">&lt;-</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> results <span class="token keyword">chan</span><span class="token operator">&lt;-</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> j <span class="token operator">:=</span> <span class="token keyword">range</span> jobs <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;worker:%d start job:%d\\n&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">,</span> j<span class="token punctuation">)</span>
		time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;worker:%d end job: %d\\n&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">,</span> j<span class="token punctuation">)</span>
		results <span class="token operator">&lt;-</span> j <span class="token operator">*</span> <span class="token number">2</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	jobs <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span>
	results <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span>

	<span class="token comment">// \u5F00\u542F3\u4E2Agoroutine</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">1</span><span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> <span class="token number">3</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token keyword">go</span> <span class="token function">worker</span><span class="token punctuation">(</span>i<span class="token punctuation">,</span> jobs<span class="token punctuation">,</span> results<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// 5\u4E2A\u4EFB\u52A1</span>
	<span class="token keyword">for</span> j <span class="token operator">:=</span> <span class="token number">1</span><span class="token punctuation">;</span> j <span class="token operator">&lt;=</span> <span class="token number">5</span><span class="token punctuation">;</span> j<span class="token operator">++</span> <span class="token punctuation">{</span>
		jobs <span class="token operator">&lt;-</span> j
	<span class="token punctuation">}</span>

	<span class="token function">close</span><span class="token punctuation">(</span>jobs<span class="token punctuation">)</span>

	<span class="token comment">// \u8F93\u51FA\u7ED3\u679C</span>
	<span class="token keyword">for</span> a <span class="token operator">:=</span> <span class="token number">1</span><span class="token punctuation">;</span> a <span class="token operator">&lt;=</span> <span class="token number">5</span><span class="token punctuation">;</span> a<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token operator">&lt;-</span>results
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>worker:3 start job:1
worker:1 start job:2
worker:2 start job:3
worker:2 end job: 3
worker:2 start job:4
worker:1 end job: 2
worker:1 start job:5
worker:3 end job: 1
worker:2 end job: 4
worker:1 end job: 5

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="select-\u591A\u8DEF\u590D\u7528" tabindex="-1"><a class="header-anchor" href="#select-\u591A\u8DEF\u590D\u7528" aria-hidden="true">#</a> select \u591A\u8DEF\u590D\u7528</h3><p>select \u7684\u4F7F\u7528\u7C7B\u4F3C\u4E8E<code>switch</code>\u8BED\u53E5\uFF0C\u6BCF\u4E2A<code>case</code>\u5BF9\u5E94\u4E00\u4E2A\u901A\u9053\u7684\u901A\u4FE1(\u63A5\u6536\u6216\u53D1\u9001)\u7684\u8FC7\u7A0B\u3002<code>select</code>\u4F1A\u4E00\u76F4\u7B49\u5F85\uFF0C\u77E5\u9053\u67D0\u4E2A<code>case</code>\u7684\u901A\u4FE1\u64CD\u4F5C\u5B8C\u6210\u65F6\uFF0C\u5C31\u4F1A\u6267\u884C<code>case </code>\u5206\u652F\u5BF9\u5E94\u7684\u8BED\u53E5</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span>
  <span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
    <span class="token keyword">select</span> <span class="token punctuation">{</span>
      <span class="token keyword">case</span> x <span class="token operator">:=</span> <span class="token operator">&lt;-</span>ch<span class="token punctuation">:</span>
      	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span>
      <span class="token keyword">case</span> ch <span class="token operator">&lt;-</span> i<span class="token punctuation">:</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4F7F\u7528<code>select</code>\u80FD\u63D0\u9AD8\u4EE3\u7801\u7684\u53EF\u8BFB\u6027</p><ul><li>\u53EF\u5904\u7406\u4E00\u4E2A\u6216\u591A\u4E2A<code>channel</code>\u7684\u53D1\u9001/\u63A5\u6536\u64CD\u4F5C</li><li>\u5982\u679C\u591A\u4E2A<code>case</code>\u540C\u65F6\u6EE1\u8DB3\uFF0C<code>select</code>\u4F1A\u968F\u673A\u9009\u62E9\u4E00\u4E2A</li><li>\u5BF9\u4E8E\u6CA1\u6709<code>case</code>\u7684<code>select {}</code>\u4F1A\u4E00\u76F4\u7B49\u5F85\uFF0C\u53EF\u7528\u4E8E\u963B\u585E<code>main</code>\u51FD\u6570</li></ul><h4 id="\u706B\u7BAD\u53D1\u5C04\u8FDB\u884C\u5012\u8BA1\u65F6\u6848\u4F8B" tabindex="-1"><a class="header-anchor" href="#\u706B\u7BAD\u53D1\u5C04\u8FDB\u884C\u5012\u8BA1\u65F6\u6848\u4F8B" aria-hidden="true">#</a> \u706B\u7BAD\u53D1\u5C04\u8FDB\u884C\u5012\u8BA1\u65F6\u6848\u4F8B</h4><p><code>time.Tick</code>\u51FD\u6570\u8FD4\u56DE\u4E00\u4E2A\u901A\u9053\uFF0C\u5B83\u5B9A\u671F\u53D1\u9001\u4E8B\u4EF6\uFF0C\u50CF\u4E00\u4E2A\u8282\u62CD\u5668\u4E00\u6837\u3002\u6BCF\u4E2A\u4E8B\u4EF6\u7684\u503C\u662F\u4E00\u4E2A\u65F6\u95F4\u6233\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;Commencing countdown&quot;</span><span class="token punctuation">)</span>
	tick <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Tick</span><span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span>
	<span class="token keyword">for</span> countdown <span class="token operator">:=</span> <span class="token number">10</span><span class="token punctuation">;</span> countdown <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">;</span> countdown<span class="token operator">--</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>countdown<span class="token punctuation">)</span>
		<span class="token operator">&lt;-</span>tick
	<span class="token punctuation">}</span>
	<span class="token function">launch</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6211\u4EEC\u60F3\u8981\u5728\u5012\u8BA1\u65F6\u8FDB\u884C\u65F6\u6309\u4E0B\u56DE\u8F66\u952E\u6765\u53D6\u6D88\u53D1\u5C04\u8FC7\u7A0B\u7684\u80FD\u529B</p><ul><li>\u542F\u52A8\u4E00\u4E2A<code>goroutine</code>\u4ECE\u6807\u51C6\u8F93\u5165\u4E2D\u8BFB\u53D6\u4E00\u4E2A\u5B57\u7B26</li><li>\u53D1\u9001\u4E00\u4E2A\u503C\u5230<code>abort</code>\u901A\u9053</li></ul><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>abort <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  os<span class="token punctuation">.</span>Stdin<span class="token punctuation">.</span><span class="token function">Read</span><span class="token punctuation">(</span><span class="token function">make</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token comment">// \u8BFB\u53D6\u5355\u4E2A\u5B57\u8282</span>
  abort <span class="token operator">&lt;-</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u73B0\u5728\u6BCF\u6B21\u5012\u8BA1\u65F6\u8FED\u4EE3\u9700\u8981\u7B49\u5F85\u4E8B\u4EF6\u8FBE\u5230\u4E24\u4E2A\u901A\u9053\u4E2D\u7684\u4E00\u4E2A\uFF1B</p><p>\u8BA1\u65F6\u5668\u901A\u9053\uFF0C\u524D\u63D0\u662F\u4E00\u5207\u987A\u5229\uFF1B\u6216\u8005\u4E2D\u6B62\u4E8B\u4EF6\u524D\u63D0\u662F\u6709&quot;\u5F02\u5E38&quot;\u3002</p><p>\u4E0D\u80FD\u53EA\u4ECE\u4E00\u4E2A\u901A\u9053\u4E0A\u6765\u63A5\u6536\uFF0C\u56E0\u4E3A\u54EA\u4E00\u4E2A\u64CD\u4F5C\u90FD\u4F1A\u5728\u5B8C\u6210\u524D\u963B\u585E\u3002\u6240\u4EE5\u9700\u8981\u591A\u8DEF\u590D\u7528\u90A3\u4E9B\u64CD\u4F5C\u8FC7\u7A0B\uFF0C\u5C31\u9700\u8981\u4F7F\u7528<code>select</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">select</span> <span class="token punctuation">{</span>
  <span class="token keyword">case</span> <span class="token operator">&lt;-</span>ch1<span class="token punctuation">:</span>
  <span class="token comment">// ...</span>
  <span class="token keyword">case</span> x <span class="token operator">:=</span> <span class="token operator">&lt;-</span> ch2<span class="token punctuation">:</span>
  <span class="token comment">// ...use x</span>
  <span class="token keyword">default</span><span class="token punctuation">:</span>
  <span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;Commencing countdown, Press return to abort&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">select</span> <span class="token punctuation">{</span>
  <span class="token keyword">case</span> <span class="token operator">&lt;-</span>time<span class="token punctuation">.</span><span class="token function">After</span><span class="token punctuation">(</span><span class="token number">10</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span><span class="token punctuation">:</span>
  <span class="token comment">// \u4E0D\u6267\u884C\u4EFB\u4F55\u64CD\u4F5C</span>
  <span class="token keyword">case</span> <span class="token operator">&lt;-</span>abort<span class="token punctuation">:</span>
  fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;Launch aborted!&quot;</span><span class="token punctuation">)</span>
  <span class="token keyword">return</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>time.After</code>\u51FD\u6570\u7ACB\u5373\u8FD4\u56DE\u4E00\u4E2A\u901A\u9053\uFF0C\u7136\u540E\u542F\u52A8\u4E00\u4E2A\u65B0\u7684<code>goroutine</code>\u5728\u95F4\u9694\u6307\u5B9A\u65F6\u95F4\u540E\uFF0C\u53D1\u9001\u4E00\u4E2A\u503C\u5230\u5B83\u4E0A\u9762\u3002\u4E0B\u9762\u7684<code>select</code>\u8BED\u53E5\u7B49\u4E24\u4E2A\u4E8B\u4EF6\u4E2D\u7B2C\u4E00\u4E2A\u5230\u8FBE\u7684\u4E8B\u4EF6\uFF0C\u4E2D\u6B62\u4E8B\u4EF6\u6216\u8005\u6307\u793A\u4E8B\u4EF6\u8FC7\u53BB 10s \u7684\u4E8B\u60C5\u3002\u5982\u679C\u8FC7\u4E86 10s \u8FD8\u6CA1\u6709\u4E2D\u6B62\uFF0C\u5F00\u59CB\u53D1\u5C04\u3002</p><h4 id="\u5076\u6570\u65F6\u53D1\u5C04-\u5947\u6570\u65F6\u63A5\u6536" tabindex="-1"><a class="header-anchor" href="#\u5076\u6570\u65F6\u53D1\u5C04-\u5947\u6570\u65F6\u63A5\u6536" aria-hidden="true">#</a> \u5076\u6570\u65F6\u53D1\u5C04\uFF0C\u5947\u6570\u65F6\u63A5\u6536</h4><p>\u901A\u9053<code>ch</code>\u7684\u7F13\u51B2\u533A\u5927\u5C0F\u4E3A 1\uFF0C\u5B83\u8981\u4E48\u662F\u7A7A\u7684\uFF0C\u8981\u4E48\u662F\u6EE1\u7684\uFF0C\u53EA\u6709\u5728\u4E00\u79CD\u60C5\u51B5\u4E0B\u53EF\u4EE5\u6267\u884C\uFF0C\u8981\u4E48<code>i</code>\u662F\u5076\u6570\u65F6\u53D1\u9001\uFF0C\u5947\u6570\u65F6\u63A5\u6536\uFF0C\u5B83\u603B\u662F\u8F93\u51FA<code>0 2 4 6 8</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> x <span class="token operator">:=</span> <span class="token operator">&lt;-</span>ch<span class="token punctuation">:</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span> <span class="token comment">// 0 2 4 6 8</span>
		<span class="token keyword">case</span> ch <span class="token operator">&lt;-</span> i<span class="token punctuation">:</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="\u5E76\u53D1\u76EE\u5F55\u904D\u5386" tabindex="-1"><a class="header-anchor" href="#\u5E76\u53D1\u76EE\u5F55\u904D\u5386" aria-hidden="true">#</a> \u5E76\u53D1\u76EE\u5F55\u904D\u5386</h4><blockquote><p>\u6784\u5EFA\u4E00\u4E2A\u7A0B\u5E8F\uFF0C\u6839\u636E\u547D\u4EE4\u884C\u6307\u5B9A\u7684\u8F93\u5165\uFF0C\u62A5\u544A\u4E00\u4E2A\u6216\u591A\u4E2A\u76EE\u5F55\u7684\u78C1\u76D8\u4F7F\u7528\u60C5\u51B5</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;flag&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;io/ioutil&quot;</span>
	<span class="token string">&quot;os&quot;</span>
	<span class="token string">&quot;path/filepath&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// walkDir \u9012\u5F52\u5730\u904D\u5386\u4EE5 dir \u4E3A\u6839\u76EE\u5F55\u7684\u6574\u4E2A\u6587\u4EF6\u6811</span>
<span class="token comment">// \u5E76\u5728fileSizes\u4E0A\u53D1\u9001\u6BCF\u4E00\u4E2A\u5DF2\u627E\u5230\u7684\u6587\u4EF6\u7684\u5927\u5C0F</span>
<span class="token keyword">func</span> <span class="token function">walkDir</span><span class="token punctuation">(</span>dir <span class="token builtin">string</span><span class="token punctuation">,</span> fileSizes <span class="token keyword">chan</span><span class="token operator">&lt;-</span> <span class="token builtin">int64</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> entry <span class="token operator">:=</span> <span class="token keyword">range</span> <span class="token function">dirents</span><span class="token punctuation">(</span>dir<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">if</span> entry<span class="token punctuation">.</span><span class="token function">IsDir</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			subdir <span class="token operator">:=</span> filepath<span class="token punctuation">.</span><span class="token function">Join</span><span class="token punctuation">(</span>dir<span class="token punctuation">,</span> entry<span class="token punctuation">.</span><span class="token function">Name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
			<span class="token function">walkDir</span><span class="token punctuation">(</span>subdir<span class="token punctuation">,</span> fileSizes<span class="token punctuation">)</span>
		<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
			fileSizes <span class="token operator">&lt;-</span> entry<span class="token punctuation">.</span><span class="token function">Size</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// dirents \u8FD4\u56DE dir \u76EE\u5F55\u4E2D\u7684\u6761\u76EE</span>
<span class="token keyword">func</span> <span class="token function">dirents</span><span class="token punctuation">(</span>dir <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>os<span class="token punctuation">.</span>FileInfo <span class="token punctuation">{</span>
	entries<span class="token punctuation">,</span> err <span class="token operator">:=</span> ioutil<span class="token punctuation">.</span><span class="token function">ReadDir</span><span class="token punctuation">(</span>dir<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Fprintf</span><span class="token punctuation">(</span>os<span class="token punctuation">.</span>Stderr<span class="token punctuation">,</span> <span class="token string">&quot;du1: %v\\n&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> entries
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u786E\u5B9A\u521D\u59CB\u76EE\u5F55</span>
	flag<span class="token punctuation">.</span><span class="token function">Parse</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	roots <span class="token operator">:=</span> flag<span class="token punctuation">.</span><span class="token function">Args</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> <span class="token function">len</span><span class="token punctuation">(</span>roots<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span> <span class="token punctuation">{</span>
		roots <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">{</span><span class="token string">&quot;.&quot;</span><span class="token punctuation">}</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// \u904D\u5386\u6587\u4EF6\u6811</span>
	fileSizes <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int64</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> root <span class="token operator">:=</span> <span class="token keyword">range</span> roots <span class="token punctuation">{</span>
			<span class="token function">walkDir</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> fileSizes<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
		<span class="token function">close</span><span class="token punctuation">(</span>fileSizes<span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token comment">// \u8F93\u51FA\u7ED3\u679C</span>
	<span class="token keyword">var</span> nfiles<span class="token punctuation">,</span> nbytes <span class="token builtin">int64</span>
	<span class="token keyword">for</span> size <span class="token operator">:=</span> <span class="token keyword">range</span> fileSizes <span class="token punctuation">{</span>
		nfiles<span class="token operator">++</span>
		nbytes <span class="token operator">+=</span> size
	<span class="token punctuation">}</span>
	<span class="token function">printDiskUsage</span><span class="token punctuation">(</span>nfiles<span class="token punctuation">,</span> nbytes<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">printDiskUsage</span><span class="token punctuation">(</span>nfiles<span class="token punctuation">,</span> nbytes <span class="token builtin">int64</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;%d files %.1f GB\\n&quot;</span><span class="token punctuation">,</span> nfiles<span class="token punctuation">,</span> <span class="token function">float64</span><span class="token punctuation">(</span>nbytes<span class="token punctuation">)</span><span class="token operator">/</span><span class="token number">1e9</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6539\u8FDB</p><p>\u53D8\u6210\u5468\u671F\u6027\u8F93\u51FA\u603B\u6570\uFF0C\u53EA\u6709\u5728 <code>-v</code>\u6807\u8BC6\u6307\u5B9A\u7684\u65F6\u5019\u624D\u8F93\u51FA\uFF0C\u4E3B<code>goroutine</code>\u4F7F\u7528\u4E00\u4E2A\u8BA1\u65F6\u5668\u6BCF 500ms \u5B9A\u671F\u4EA7\u751F\u4E8B\u4EF6\uFF0C\u4F7F\u7528\u4E00\u4E2A<code>select</code>\u8BED\u53E5\u6216\u8005\u7B49\u5F85\u4E00\u4E2A\u5173\u4E8E\u6587\u4EF6\u5927\u5C0F\u7684\u6D88\u606F\uFF0C\u8FD9\u65F6\u8FDB\u884C\u66F4\u65B0\u5B83\u7684\u603B\u6570\uFF0C\u6216\u8005\u7B49\u5F85\u4E00\u4E2A\u8BA1\u65F6\u4E8B\u4EF6\uFF0C\u8FD9\u65F6\u8F93\u51FA\u5B83\u7684\u603B\u6570\u3002\u5982\u679C<code>-v</code>\u6CA1\u6709\u6307\u5B9A\uFF0C<code>tick</code>\u901A\u9053\u4F9D\u7136\u662F<code>nil</code>\uFF0C\u5B83\u5BF9\u5E94\u7684\u60C5\u51B5\u5728<code>select</code>\u4E2D\u5B9E\u9645\u4E0A\u88AB\u7981\u7528\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u542F\u52A8\u540E\u53F0goroutine..</span>

	<span class="token comment">// \u786E\u5B9A\u521D\u59CB\u76EE\u5F55</span>
	flag<span class="token punctuation">.</span><span class="token function">Parse</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	roots <span class="token operator">:=</span> flag<span class="token punctuation">.</span><span class="token function">Args</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> <span class="token function">len</span><span class="token punctuation">(</span>roots<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span> <span class="token punctuation">{</span>
		roots <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">{</span><span class="token string">&quot;.&quot;</span><span class="token punctuation">}</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// \u904D\u5386\u6587\u4EF6\u6811</span>
	fileSizes <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int64</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> root <span class="token operator">:=</span> <span class="token keyword">range</span> roots <span class="token punctuation">{</span>
			<span class="token function">walkDir</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> fileSizes<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
		<span class="token function">close</span><span class="token punctuation">(</span>fileSizes<span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token comment">// \u8F93\u51FA\u7ED3\u679C</span>
	<span class="token keyword">var</span> nfiles<span class="token punctuation">,</span> nbytes <span class="token builtin">int64</span>
	<span class="token comment">//for size := range fileSizes {</span>
	<span class="token comment">//	nfiles++</span>
	<span class="token comment">//	nbytes += size</span>
	<span class="token comment">//}</span>
	<span class="token comment">//printDiskUsage(nfiles, nbytes)</span>

	<span class="token comment">// \u5B9A\u671F\u8F93\u51FA\u7ED3\u679C</span>
	<span class="token keyword">var</span> tick <span class="token operator">&lt;-</span><span class="token keyword">chan</span> time<span class="token punctuation">.</span>Time
	<span class="token keyword">if</span> <span class="token operator">*</span>verbose <span class="token punctuation">{</span>
		tick <span class="token operator">=</span> time<span class="token punctuation">.</span><span class="token function">Tick</span><span class="token punctuation">(</span><span class="token number">500</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
loop<span class="token punctuation">:</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> size<span class="token punctuation">,</span> ok <span class="token operator">:=</span> <span class="token operator">&lt;-</span>fileSizes<span class="token punctuation">:</span>
			<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
				<span class="token keyword">break</span> loop <span class="token comment">// fileSizes \u5173\u95ED</span>
			<span class="token punctuation">}</span>
			nfiles<span class="token operator">++</span>
			nbytes <span class="token operator">+=</span> size
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>tick<span class="token punctuation">:</span>
			<span class="token function">printDiskUsage</span><span class="token punctuation">(</span>nfiles<span class="token punctuation">,</span> nbytes<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
	<span class="token function">printDiskUsage</span><span class="token punctuation">(</span>nfiles<span class="token punctuation">,</span> nbytes<span class="token punctuation">)</span> <span class="token comment">// \u6700\u7EC8\u603B\u6570</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container danger"><p class="custom-container-title">\u8B66\u544A</p><p>\u5B83\u4F9D\u7136\u6BD4\u8F83\u8017\u65F6\u95F4\uFF0C\u8FD9\u91CC\u53EF\u4EE5\u5E76\u53D1\u8C03\u7528<code>walkDir</code>\u4ECE\u800C\u5145\u5206\u5229\u7528\u78C1\u76D8\u7CFB\u7EDF\u7684\u5E76\u884C\u673A\u5236\u3002\u4E3A\u6BCF\u4E00\u4E2A<code>walkDir</code>\u7684\u8C03\u7528\u521B\u5EFA\u4E00\u4E2A<code>goroutine</code>\uFF0C\u4F7F\u7528<code>sync.WaitGroup</code>\u6765\u4E3A\u5F53\u524D\u5B58\u6D3B\u7684<code>walkDir</code>\u8C03\u7528\u8BA1\u6570\uFF0C\u4E00\u4E2A\u5173\u95ED\u8005<code>goroutine</code>\u5728\u8BA1\u6570\u5668\u51CF\u5C11\u4E3A 0 \u7684\u65F6\u5019\u8FDB\u884C\u5173\u95ED<code>fileSizes</code>\u901A\u9053</p></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;flag&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;io/ioutil&quot;</span>
	<span class="token string">&quot;os&quot;</span>
	<span class="token string">&quot;path/filepath&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// walkDir \u9012\u5F52\u5730\u904D\u5386\u4EE5 dir \u4E3A\u6839\u76EE\u5F55\u7684\u6574\u4E2A\u6587\u4EF6\u6811</span>
<span class="token comment">// \u5E76\u5728fileSizes\u4E0A\u53D1\u9001\u6BCF\u4E00\u4E2A\u5DF2\u627E\u5230\u7684\u6587\u4EF6\u7684\u5927\u5C0F</span>
<span class="token comment">//func walkDir(dir string, fileSizes chan&lt;- int64) {</span>
<span class="token comment">//	for _, entry := range dirents(dir) {</span>
<span class="token comment">//		if entry.IsDir() {</span>
<span class="token comment">//			subdir := filepath.Join(dir, entry.Name())</span>
<span class="token comment">//			walkDir(subdir, fileSizes)</span>
<span class="token comment">//		} else {</span>
<span class="token comment">//			fileSizes &lt;- entry.Size()</span>
<span class="token comment">//		}</span>
<span class="token comment">//	}</span>
<span class="token comment">//}</span>

<span class="token keyword">func</span> <span class="token function">walkDir</span><span class="token punctuation">(</span>dir <span class="token builtin">string</span><span class="token punctuation">,</span> n <span class="token operator">*</span>sync<span class="token punctuation">.</span>WaitGroup<span class="token punctuation">,</span> fileSizes <span class="token keyword">chan</span><span class="token operator">&lt;-</span> <span class="token builtin">int64</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">defer</span> n<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> entry <span class="token operator">:=</span> <span class="token keyword">range</span> <span class="token function">dirents</span><span class="token punctuation">(</span>dir<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">if</span> entry<span class="token punctuation">.</span><span class="token function">IsDir</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			n<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
			subdir <span class="token operator">:=</span> filepath<span class="token punctuation">.</span><span class="token function">Join</span><span class="token punctuation">(</span>dir<span class="token punctuation">,</span> entry<span class="token punctuation">.</span><span class="token function">Name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
			<span class="token function">walkDir</span><span class="token punctuation">(</span>subdir<span class="token punctuation">,</span> n<span class="token punctuation">,</span> fileSizes<span class="token punctuation">)</span>
		<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
			fileSizes <span class="token operator">&lt;-</span> entry<span class="token punctuation">.</span><span class="token function">Size</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// \u662F\u4E00\u4E2A\u7528\u4E8E\u9650\u5236\u76EE\u5F55\u5E76\u53D1\u6570\u7684\u8BA1\u6570\u4FE1\u53F7\u91CF</span>
<span class="token keyword">var</span> sema <span class="token operator">=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">)</span>

<span class="token comment">// dirents \u8FD4\u56DE dir \u76EE\u5F55\u4E2D\u7684\u6761\u76EE</span>
<span class="token keyword">func</span> <span class="token function">dirents</span><span class="token punctuation">(</span>dir <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>os<span class="token punctuation">.</span>FileInfo <span class="token punctuation">{</span>
	sema <span class="token operator">&lt;-</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">{</span><span class="token punctuation">}</span> <span class="token comment">// \u83B7\u53D6\u4EE4\u724C</span>
	<span class="token keyword">defer</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token operator">&lt;-</span>sema <span class="token comment">// \u91CA\u653E\u4EE4\u724C</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	entries<span class="token punctuation">,</span> err <span class="token operator">:=</span> ioutil<span class="token punctuation">.</span><span class="token function">ReadDir</span><span class="token punctuation">(</span>dir<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Fprintf</span><span class="token punctuation">(</span>os<span class="token punctuation">.</span>Stderr<span class="token punctuation">,</span> <span class="token string">&quot;du1: %v\\n&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> entries
<span class="token punctuation">}</span>

<span class="token keyword">var</span> verbose <span class="token operator">=</span> flag<span class="token punctuation">.</span><span class="token function">Bool</span><span class="token punctuation">(</span><span class="token string">&quot;v&quot;</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token string">&quot;show verbose progress messages&quot;</span><span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u542F\u52A8\u540E\u53F0goroutine..</span>

	<span class="token comment">// \u786E\u5B9A\u521D\u59CB\u76EE\u5F55</span>
	flag<span class="token punctuation">.</span><span class="token function">Parse</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	roots <span class="token operator">:=</span> flag<span class="token punctuation">.</span><span class="token function">Args</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> <span class="token function">len</span><span class="token punctuation">(</span>roots<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span> <span class="token punctuation">{</span>
		roots <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">{</span><span class="token string">&quot;.&quot;</span><span class="token punctuation">}</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// \u904D\u5386\u6587\u4EF6\u6811</span>
	<span class="token comment">// \u5E76\u884C\u904D\u5386\u6BCF\u4E00\u4E2A\u6587\u4EF6\u6811</span>
	fileSizes <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int64</span><span class="token punctuation">)</span>
	<span class="token keyword">var</span> n sync<span class="token punctuation">.</span>WaitGroup
	<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> root <span class="token operator">:=</span> <span class="token keyword">range</span> roots <span class="token punctuation">{</span>
		n<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
		<span class="token keyword">go</span> <span class="token function">walkDir</span><span class="token punctuation">(</span>root<span class="token punctuation">,</span> <span class="token operator">&amp;</span>n<span class="token punctuation">,</span> fileSizes<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		n<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token function">close</span><span class="token punctuation">(</span>fileSizes<span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token comment">//go func() {</span>
	<span class="token comment">//	for _, root := range roots {</span>
	<span class="token comment">//		walkDir(root, fileSizes)</span>
	<span class="token comment">//	}</span>
	<span class="token comment">//	close(fileSizes)</span>
	<span class="token comment">//}()</span>

	<span class="token comment">// \u8F93\u51FA\u7ED3\u679C</span>
	<span class="token keyword">var</span> nfiles<span class="token punctuation">,</span> nbytes <span class="token builtin">int64</span>
	<span class="token comment">//for size := range fileSizes {</span>
	<span class="token comment">//	nfiles++</span>
	<span class="token comment">//	nbytes += size</span>
	<span class="token comment">//}</span>
	<span class="token comment">//printDiskUsage(nfiles, nbytes)</span>

	<span class="token comment">// \u5B9A\u671F\u8F93\u51FA\u7ED3\u679C</span>
	<span class="token keyword">var</span> tick <span class="token operator">&lt;-</span><span class="token keyword">chan</span> time<span class="token punctuation">.</span>Time
	<span class="token keyword">if</span> <span class="token operator">*</span>verbose <span class="token punctuation">{</span>
		tick <span class="token operator">=</span> time<span class="token punctuation">.</span><span class="token function">Tick</span><span class="token punctuation">(</span><span class="token number">500</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
loop<span class="token punctuation">:</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> size<span class="token punctuation">,</span> ok <span class="token operator">:=</span> <span class="token operator">&lt;-</span>fileSizes<span class="token punctuation">:</span>
			<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
				<span class="token keyword">break</span> loop <span class="token comment">// fileSizes \u5173\u95ED</span>
			<span class="token punctuation">}</span>
			nfiles<span class="token operator">++</span>
			nbytes <span class="token operator">+=</span> size
		<span class="token keyword">case</span> <span class="token operator">&lt;-</span>tick<span class="token punctuation">:</span>
			<span class="token function">printDiskUsage</span><span class="token punctuation">(</span>nfiles<span class="token punctuation">,</span> nbytes<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
	<span class="token function">printDiskUsage</span><span class="token punctuation">(</span>nfiles<span class="token punctuation">,</span> nbytes<span class="token punctuation">)</span> <span class="token comment">// \u6700\u7EC8\u603B\u6570</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">printDiskUsage</span><span class="token punctuation">(</span>nfiles<span class="token punctuation">,</span> nbytes <span class="token builtin">int64</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;%d files %.1f GB\\n&quot;</span><span class="token punctuation">,</span> nfiles<span class="token punctuation">,</span> <span class="token function">float64</span><span class="token punctuation">(</span>nbytes<span class="token punctuation">)</span><span class="token operator">/</span><span class="token number">1e9</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u7A0B\u5E8F\u5728\u6700\u9AD8\u5CF0\u65F6\u521B\u5EFA\u6570\u5343\u4E2A<code>goroutine</code>\uFF0C\u6240\u4EE5\u6211\u4EEC\u5F97\u4FEE\u6539<code>dirents</code>\u51FD\u6570\u6765\u4F7F\u7528\u8BA1\u6570\u4FE1\u53F7\u91CF\uFF0C\u4EE5\u9632\u6B62\u5B83\u540C\u65F6\u6253\u5F00\u592A\u591A\u7684\u6587\u4EF6</p></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C  ch_dir git:<span class="token punctuation">(</span>master<span class="token punctuation">)</span> \u2717 ./ch_dir -v <span class="token variable">$GOPATH</span>/
<span class="token number">26161</span> files <span class="token number">0.6</span> GB
<span class="token number">57231</span> files <span class="token number">1.3</span> GB
<span class="token number">59426</span> files <span class="token number">1.3</span> GB

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u7B80\u5355\u5B9E\u73B0\u804A\u5929\u670D\u52A1\u5668" tabindex="-1"><a class="header-anchor" href="#\u7B80\u5355\u5B9E\u73B0\u804A\u5929\u670D\u52A1\u5668" aria-hidden="true">#</a> \u7B80\u5355\u5B9E\u73B0\u804A\u5929\u670D\u52A1\u5668</h2><blockquote><p>\u6458\u81EA Go \u7A0B\u5E8F\u8BBE\u8BA1\u8BED\u8A00 8.10</p></blockquote><blockquote><p>\u5B83\u53EF\u4EE5\u518D\u51E0\u4E2A\u7528\u6237\u4E4B\u95F4\u4E92\u76F8\u5E7F\u64AD\u6587\u672C\u6D88\u606F\u3002\u6709 4 \u4E2A<code>goroutine</code>\uFF0C\u4E3B<code>goroutine</code>\u548C\u5E7F\u64AD<code>broadcaster goroutine</code>\uFF0C\u6BCF\u4E00\u4E2A\u8FDE\u63A5\u91CC\u9762\u6709\u4E00\u4E2A\u8FDE\u63A5\u5904\u7406(<code>handleConn</code>)<code>goroutine</code>\u548C\u4E00\u4E2A\u5BA2\u6237\u5199\u5165(<code>clientWriter</code>)<code>goroutine</code>\u3002\u5E7F\u64AD\u5668\u662F\u4E00\u4E2A\u5173\u4E8E\u5982\u4F55\u4F7F\u7528<code>select</code>\u7684\u4E00\u4E2A\u89C4\u8303\u8BF4\u660E</p></blockquote><p>\u4E3B<code>goroutine</code>\u7684\u5DE5\u4F5C\u662F\u76D1\u542C\u7AEF\u53E3\uFF0C\u63A5\u53D7\u8FDE\u63A5\u5BA2\u6237\u7AEF\u7684\u7F51\u7EDC\u8FDE\u63A5\u3002\u5BF9\u6BCF\u4E00\u4E2A\u8FDE\u63A5\uFF0C\u5B83\u521B\u5EFA\u4E00\u4E2A\u65B0\u7684<code>handleConn goroutine</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;bufio&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;log&quot;</span>
	<span class="token string">&quot;net&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">type</span> client <span class="token keyword">chan</span><span class="token operator">&lt;-</span> <span class="token builtin">string</span> <span class="token comment">// \u5BF9\u5916\u53D1\u9001\u6D88\u606F\u7684\u901A\u9053</span>

<span class="token keyword">var</span> <span class="token punctuation">(</span>
	entering <span class="token operator">=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> client<span class="token punctuation">)</span>
	leaving  <span class="token operator">=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> client<span class="token punctuation">)</span>
	messages <span class="token operator">=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token comment">// \u6240\u6709\u63A5\u6536\u7684\u5BA2\u6237\u6D88\u606F</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">broadcaster</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	clients <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">map</span><span class="token punctuation">[</span>client<span class="token punctuation">]</span><span class="token builtin">bool</span><span class="token punctuation">)</span> <span class="token comment">// \u6240\u6709\u8FDE\u63A5\u7684\u5BA2\u6237\u7AEF</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> msg <span class="token operator">:=</span> <span class="token operator">&lt;-</span>messages<span class="token punctuation">:</span>
			<span class="token comment">// \u628A\u6240\u6709\u63A5\u6536\u7684\u6D88\u606F\u5E7F\u64AD\u7ED9\u6240\u6709\u7684\u5BA2\u6237</span>
			<span class="token comment">// \u53D1\u9001\u6D88\u606F\u901A\u9053</span>
			<span class="token keyword">for</span> cli <span class="token operator">:=</span> <span class="token keyword">range</span> clients <span class="token punctuation">{</span>
				cli <span class="token operator">&lt;-</span> msg
			<span class="token punctuation">}</span>
		<span class="token keyword">case</span> cli <span class="token operator">:=</span> <span class="token operator">&lt;-</span>entering<span class="token punctuation">:</span>
			clients<span class="token punctuation">[</span>cli<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token boolean">true</span>
		<span class="token keyword">case</span> cli <span class="token operator">:=</span> <span class="token operator">&lt;-</span>leaving<span class="token punctuation">:</span>
			<span class="token function">delete</span><span class="token punctuation">(</span>clients<span class="token punctuation">,</span> cli<span class="token punctuation">)</span>
			<span class="token function">close</span><span class="token punctuation">(</span>cli<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">handleConn</span><span class="token punctuation">(</span>conn net<span class="token punctuation">.</span>Conn<span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token comment">// \u5BF9\u5916\u53D1\u9001\u5BA2\u6237\u6D88\u606F\u7684\u901A\u9053</span>
	<span class="token keyword">go</span> <span class="token function">clientWriter</span><span class="token punctuation">(</span>conn<span class="token punctuation">,</span> ch<span class="token punctuation">)</span>

	who <span class="token operator">:=</span> conn<span class="token punctuation">.</span><span class="token function">RemoteAddr</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">String</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	ch <span class="token operator">&lt;-</span> <span class="token string">&quot;You are &quot;</span> <span class="token operator">+</span> who
	messages <span class="token operator">&lt;-</span> who <span class="token operator">+</span> <span class="token string">&quot; has arrived&quot;</span>
	entering <span class="token operator">&lt;-</span> ch

	input <span class="token operator">:=</span> bufio<span class="token punctuation">.</span><span class="token function">NewScanner</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span>
	<span class="token keyword">for</span> input<span class="token punctuation">.</span><span class="token function">Scan</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		messages <span class="token operator">&lt;-</span> who <span class="token operator">+</span> <span class="token string">&quot;: &quot;</span> <span class="token operator">+</span> input<span class="token punctuation">.</span><span class="token function">Text</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// \u6CE8\u610F\uFF0C\u5FFD\u7565 input.Err() \u4E2D\u53EF\u80FD\u51FA\u73B0\u7684\u9519\u8BEF</span>

	leaving <span class="token operator">&lt;-</span> ch
	messages <span class="token operator">&lt;-</span> who <span class="token operator">+</span> <span class="token string">&quot; has left&quot;</span>
	conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">clientWriter</span><span class="token punctuation">(</span>conn net<span class="token punctuation">.</span>Conn<span class="token punctuation">,</span> ch <span class="token operator">&lt;-</span><span class="token keyword">chan</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> msg <span class="token operator">:=</span> <span class="token keyword">range</span> ch <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Fprintln</span><span class="token punctuation">(</span>conn<span class="token punctuation">,</span> msg<span class="token punctuation">)</span> <span class="token comment">// \u6CE8\u610F\uFF0C\u5FFD\u7565\u7F51\u7EDC\u5C42\u9762\u7684\u9519\u8BEF</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	listener<span class="token punctuation">,</span> err <span class="token operator">:=</span> net<span class="token punctuation">.</span><span class="token function">Listen</span><span class="token punctuation">(</span><span class="token string">&quot;tcp&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;localhost:8000&quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatal</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">go</span> <span class="token function">broadcaster</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> listener<span class="token punctuation">.</span><span class="token function">Accept</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			log<span class="token punctuation">.</span><span class="token function">Print</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
			<span class="token keyword">continue</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">go</span> <span class="token function">handleConn</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,124),o=[p];function c(i,l){return s(),a("div",null,o)}var r=n(e,[["render",c],["__file","go-concurrent-base.html.vue"]]);export{r as default};
