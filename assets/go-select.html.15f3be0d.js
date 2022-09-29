import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.9eb1cdcc.js";const t={},p=e(`<h2 id="select-\u591A\u8DEF\u590D\u7528" tabindex="-1"><a class="header-anchor" href="#select-\u591A\u8DEF\u590D\u7528" aria-hidden="true">#</a> select \u591A\u8DEF\u590D\u7528</h2><blockquote><p>\u5728\u67D0\u4E9B\u573A\u666F\u4E0B\u6211\u4EEC\u53EF\u80FD\u9700\u8981\u540C\u65F6\u4ECE\u591A\u4E2A\u901A\u9053\u63A5\u6536\u6570\u636E\uFF0C\u901A\u9053\u5728\u89E3\u8BF4\u6570\u636E\u65F6\uFF0C\u5982\u679C\u6CA1\u6709\u6570\u636E\u53EF\u4EE5\u88AB\u63A5\u6536\u90A3\u4E48\u5F53\u524D\u7684 goroutine \u5C06\u4F1A\u53D1\u751F\u963B\u585E</p></blockquote><p>\u4F60\u53EF\u80FD\u4F1A\u8FD9\u4E48\u5199\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">for</span> <span class="token punctuation">{</span>
    <span class="token comment">// \u5C1D\u8BD5\u4ECEch1\u63A5\u6536\u503C</span>
    data<span class="token punctuation">,</span> ok <span class="token operator">:=</span> <span class="token operator">&lt;-</span> ch1
    <span class="token comment">// \u518D\u5C1D\u8BD5\u4ECEch2\u63A5\u6536\u503C</span>
    data<span class="token punctuation">,</span> ok <span class="token operator">:=</span> <span class="token operator">&lt;-</span> ch2
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u867D\u7136\u53EF\u4EE5\u5B9E\u73B0\u9700\u6C42\uFF0C\u4F46\u662F\u7A0B\u5E8F\u7684\u8FD0\u884C\u6027\u80FD\u4F1A\u975E\u5E38\u5DEE\u3002Go \u8BED\u8A00\u5185\u7F6E\u4E86<code>select</code>\u5173\u952E\u5B57\uFF0C\u4F7F\u7528\u5B83\u53EF\u4EE5\u540C\u65F6\u54CD\u5E94\u591A\u4E2A\u901A\u9053\u64CD\u4F5C\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">select</span> <span class="token punctuation">{</span>
    <span class="token keyword">case</span> <span class="token operator">&lt;-</span>ch1<span class="token punctuation">:</span>
    <span class="token comment">// ...</span>
    <span class="token keyword">case</span> data <span class="token operator">:=</span> <span class="token operator">&lt;-</span>ch<span class="token punctuation">:</span>
    <span class="token comment">// ...</span>
    <span class="token keyword">case</span> ch3 <span class="token operator">&lt;-</span> <span class="token number">10</span><span class="token punctuation">:</span>
    <span class="token comment">// ...</span>
    <span class="token keyword">default</span><span class="token punctuation">:</span>
    <span class="token comment">// \u9ED8\u8BA4\u64CD\u4F5C</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7279\u70B9\uFF1A</p><ul><li><p><strong>\u53EF\u5904\u7406\u4E00\u4E2A\u6216\u591A\u4E2A<code>channel</code>\u7684\u53D1\u9001/\u63A5\u6536\u64CD\u4F5C</strong></p></li><li><p>\u5982\u679C\u591A\u4E2A<code>case</code>\u540C\u65F6\u6EE1\u8DB3\uFF0C<code>select</code>\u4F1A\u968F\u673A\u9009\u62E9\u4E00\u4E2A\u6267\u884C</p></li><li><p>\u5BF9\u4E8E\u6CA1\u6709<code>case</code>\u7684<code>select</code>\u4F1A\u4E00\u76F4\u963B\u585E\uFF0C\u53EF\u7528\u4E8E\u963B\u585E<code>main</code>\u51FD\u6570</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// \u7A0B\u5E8F\u4E00\u76F4\u5728\u8FD9\u7B49  \u963B\u585E</span>
    <span class="token keyword">select</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u6837\u5C31\u53EF\u4EE5\u8BA9\u4E00\u4E9B\u540E\u53F0\u7684 goroutine \u4E00\u76F4\u5728\u8FD0\u884C\u3002\u76F8\u5F53\u4E8E\u4E00\u4E2A\u5B88\u62A4\u8FDB\u7A0B\u3002</p></li></ul><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">1</span><span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token keyword">select</span> <span class="token punctuation">{</span>
		<span class="token keyword">case</span> x <span class="token operator">:=</span> <span class="token operator">&lt;-</span>ch<span class="token punctuation">:</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span>
		<span class="token keyword">case</span> ch <span class="token operator">&lt;-</span> i<span class="token punctuation">:</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8F93\u51FA\u5185\u5BB9\u6709\u70B9\u610F\u60F3\u4E0D\u5230\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">1</span>
<span class="token number">3</span>
<span class="token number">5</span>
<span class="token number">7</span>
<span class="token number">9</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>\u7B2C\u4E00\u6B21\u8FDB\u6765\uFF0C\u901A\u9053\u6CA1\u6709\u503C\uFF0C\u7B2C\u4E00\u4E2A<code>case</code>\u4E0D\u6EE1\u8DB3\uFF0C\u5C31\u8DD1\u4E0B\u9762\u7684<code>case</code>\u8FDB\u884C\u53D1\u9001\u503C\uFF0C\u6240\u4EE5 1 \u5C31\u8FDB\u5165\u5230\u4E86\u901A\u9053</li><li>\u7B2C\u4E8C\u6B21 for \u5FAA\u73AF\uFF0C<code>i = 2</code>\uFF0C\u6B64\u65F6\u6B64\u523B\uFF0C\u901A\u9053\u91CC\u6709<code>1</code>\uFF0C\u7B2C\u4E00\u4E2A<code>case</code>\u5C31\u6EE1\u8DB3\u4E86\uFF0C\u901A\u9053\u53EA\u6709\u4E00\u4E2A\u7F13\u5B58\u533A\uFF0C\u6240\u4EE5\u53EA\u6709\u7B2C\u4E00\u4E2A<code>case</code>\u6EE1\u8DB3\uFF0C\u6240\u4EE5\u6253\u5370 1</li><li>\u7B2C\u4E09\u6B21 for \u5FAA\u73AF\uFF0C<code>i = 3</code>\uFF0C\u6B64\u65F6\u6B64\u523B\uFF0C\u901A\u9053\u91CC\u7684\u503C\u5DF2\u7ECF\u88AB\u53D6\u51FA\u6765\u4E86\uFF0C\u6240\u4EE5\u662F\u7A7A\u7684\uFF0C\u6240\u4EE5\u7B2C\u4E8C\u4E2A<code>case</code>\u6EE1\u8DB3\uFF0C\u5C06<code>3</code>\u53D1\u9001\u7ED9\u901A\u9053</li><li>\u4F9D\u6B21\u5982\u4E0B\uFF1A\u6700\u7EC8\u53EA\u4F1A\u6253\u5370\u5355\u6570\uFF1A<code>1, 3, 5, 7, 9</code></li></ul><h2 id="\u901A\u9053\u9519\u8BEF\u4F7F\u7528\u793A\u4F8B" tabindex="-1"><a class="header-anchor" href="#\u901A\u9053\u9519\u8BEF\u4F7F\u7528\u793A\u4F8B" aria-hidden="true">#</a> \u901A\u9053\u9519\u8BEF\u4F7F\u7528\u793A\u4F8B</h2><h3 id="\u793A\u4F8B-1" tabindex="-1"><a class="header-anchor" href="#\u793A\u4F8B-1" aria-hidden="true">#</a> \u793A\u4F8B 1</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">demo1</span><span class="token punctuation">(</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span>
	wg <span class="token operator">:=</span> sync<span class="token punctuation">.</span>WaitGroup<span class="token punctuation">{</span><span class="token punctuation">}</span>

	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		ch <span class="token operator">&lt;-</span> i
	<span class="token punctuation">}</span>

	<span class="token function">close</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>

	wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> j <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> j <span class="token operator">&lt;</span> <span class="token number">3</span><span class="token punctuation">;</span> j<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token keyword">for</span> <span class="token punctuation">{</span>
				task <span class="token operator">:=</span> <span class="token operator">&lt;-</span>ch
				fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span>
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">demo1</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container warning"><p class="custom-container-title">\u95EE\u9898</p><p>\u6211\u4EEC\u8FD9\u91CC\u662F\u5148<code>close</code>\u4E86\u901A\u9053\uFF0C\u5BF9\u4E8E\u5173\u95ED\u7684\u901A\u9053\uFF0C\u6211\u4EEC\u6C38\u8FDC\u90FD\u662F\u5148\u53BB\u628A\u901A\u9053\u91CC\u7684\u6240\u6709\u7684\u503C\u5148\u8BFB\u5B8C\uFF0C\u6700\u540E\u518D\u53BB\u6267\u884C\u63A5\u6536\u64CD\u4F5C\uFF0C\u8FD4\u56DE\u7684\u6C38\u8FDC\u90FD\u662F\u5BF9\u5E94\u7684\u7C7B\u578B\u7684\u96F6\u503C\u3002\u6240\u4EE5\u8FD9\u4E2A\u7A0B\u5E8F\u7F16\u8BD1\u6CA1\u95EE\u9898\uFF0C\u4F1A\u4E00\u76F4\u6253\u5370<code>0</code></p></div><div class="custom-container tip"><p class="custom-container-title">\u89E3\u51B3</p><p>\u5904\u7406\u65B9\u6CD5\uFF1A</p><ol><li>\u8981\u4E48\u5C06<code>for</code>\u5FAA\u73AF\u6362\u6210<code>for range</code></li><li>\u8981\u4E48\u4F7F\u7528<code>v, ok := &lt;-ch</code>\u6765\u5224\u65AD</li></ol></div><h3 id="\u793A\u4F8B-2" tabindex="-1"><a class="header-anchor" href="#\u793A\u4F8B-2" aria-hidden="true">#</a> \u793A\u4F8B 2</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">demo2</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">string</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span><span class="token number">3</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span>
		ch <span class="token operator">&lt;-</span> <span class="token string">&quot;job result&quot;</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token keyword">select</span> <span class="token punctuation">{</span>
	<span class="token keyword">case</span> result <span class="token operator">:=</span> <span class="token operator">&lt;-</span>ch<span class="token punctuation">:</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span>
	<span class="token keyword">case</span> <span class="token operator">&lt;-</span>time<span class="token punctuation">.</span><span class="token function">After</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span><span class="token punctuation">:</span> <span class="token comment">// \u8F83\u5C0F\u7684\u8D85\u65F6\u65F6\u95F4</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">demo2</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>\u8981\u4E48\u4ECE\u901A\u9053\u91CC\u83B7\u53D6\u7ED3\u679C</li><li>\u8981\u4E48 1 \u79D2\u4E2D\u4E4B\u540E\u9000\u51FA</li></ul><blockquote><p>\u770B\u7740\u786E\u5B9E\u6CA1\u5565\u6BDB\u75C5\uFF1F<strong>\u4F46\u662F\u4E8B\u5B9E\u4E0A\u7ED3\u679C\u5374\u662F\u76F4\u63A5\u9000\u51FA</strong></p></blockquote><div class="custom-container warning"><p class="custom-container-title">\u95EE\u9898</p><p>\u56E0\u4E3A\u8FD9\u4E2A\u662F\u4E00\u4E2A\u6CA1\u6709\u7F13\u51B2\u533A\u7684\u901A\u9053\uFF0C\u4E0D\u53EF\u80FD\u6709\u4EBA\u5BF9\u5B83\u8FDB\u884C\u63A5\u6536\u64CD\u4F5C\uFF0C\u90A3\u4E48\u5BF9\u5B83\u505A\u53D1\u9001\u64CD\u4F5C\uFF0C\u5C31\u963B\u585E\u4F4F\u4E86\uFF0C\u8FD9\u4E2A\u51FD\u6570\u8FD8\u6CA1\u6709\u6267\u884C\u5B8C\uFF0C\u90A3\u4E2A\u53D1\u9001\u7684 goroutine \u5C31\u4E0D\u4F1A\u9000\u51FA\uFF0C\u90A3\u4E48\u8FD9\u4E2A goroutine \u5C31\u4F1A\u5728\u540E\u53F0\u9ED8\u9ED8\u7684\u653E\u7740\u3002\u6240\u4EE5\u5F53\u8BF7\u6C42\u8D8A\u6765\u8D8A\u591A\u7684\u65F6\u5019\uFF0Cgoroutine \u5C31\u6CC4\u9732\u4E86\uFF0C\u5185\u5B58\u8D8A\u5360\u8D8A\u9AD8\u3002</p></div><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><blockquote><p>\u8FD9\u91CC\u5148\u8BB0\u4F4F\u4E00\u4E2A\u4E1C\u897F\uFF1A<code>channel</code>\u662F\u53EF\u4EE5\u4E0D\u4E3B\u52A8\u5173\u95ED\u7684\uFF0C\u6700\u7EC8\u4F1A\u88AB\u5783\u573E\u56DE\u6536\u7684\u3002</p></blockquote><p>\u6240\u4EE5\u8FD9\u91CC\u4FEE\u6539\u53EA\u9700\u8981\u7ED9<code>channel</code>\u52A0\u4E0A\u4E00\u4E2A\u7F13\u51B2\u533A\u3002</p><p>\u4E0B\u9762\u4E00\u4E2A<code>case</code>\u5176\u5B9E\u662F\u7528\u6765\u505A\u8D85\u65F6\u63A7\u5236\u7684\u3002</p></div>`,23),c=[p];function o(i,l){return s(),a("div",null,c)}var r=n(t,[["render",o],["__file","go-select.html.vue"]]);export{r as default};
