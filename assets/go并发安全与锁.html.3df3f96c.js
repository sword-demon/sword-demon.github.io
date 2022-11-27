import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.50152c4e.js";const p={},e=t(`<h2 id="\u5E76\u53D1\u5B89\u5168\u548C\u9501" tabindex="-1"><a class="header-anchor" href="#\u5E76\u53D1\u5B89\u5168\u548C\u9501" aria-hidden="true">#</a> \u5E76\u53D1\u5B89\u5168\u548C\u9501</h2><p>\u6848\u4F8B</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u591A\u4E2Agoroutine\u5E76\u53D1\u64CD\u4F5C\u5168\u5C40\u53D8\u91CFx</span>

<span class="token keyword">var</span> <span class="token punctuation">(</span>
	x  <span class="token builtin">int64</span>
	wg sync<span class="token punctuation">.</span>WaitGroup
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">5000</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token comment">// 1. \u62FF\u5230\u5168\u5C40\u53D8\u91CFx</span>
		<span class="token comment">// 2. \u7ED9\u8FD9\u4E2A\u503C+1</span>
		<span class="token comment">// 3. \u52A01\u540E\u5728\u8D4B\u503C\u7ED9\u5168\u5C40\u53D8\u91CFx</span>
		x<span class="token operator">++</span> <span class="token comment">// \u5BF9\u5168\u5C40\u53D8\u91CF\u8FDB\u884C\u6BCF\u6B21+1</span>
	<span class="token punctuation">}</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span> <span class="token comment">// 7180 5285 \u5404\u79CD\u503C</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u4E92\u65A5\u9501" tabindex="-1"><a class="header-anchor" href="#\u4E92\u65A5\u9501" aria-hidden="true">#</a> \u4E92\u65A5\u9501</h2><p>\u4F7F\u7528\u4E92\u65A5\u9501\u6765\u89E3\u51B3\u4E0A\u8FF0\u7684\u95EE\u9898\u3002\u4E92\u65A5\u9501\u662F\u4E00\u79CD\u5E38\u7528\u6765\u63A7\u5236\u5171\u4EAB\u8D44\u6E90\u8BBF\u95EE\u7684\u65B9\u6CD5\uFF0C\u5B83\u80FD\u591F\u4FDD\u8BC1\u540C\u65F6\u53EA\u6709\u4E00\u4E2A<code>goroutine</code>\u53EF\u4EE5\u8BBF\u95EE\u5171\u4EAB\u8D44\u6E90\u3002Go \u8BED\u8A00\u4E2D\u4F7F\u7528<code>sync</code>\u5305\u91CC\u7684<code>Mutex</code>\u7C7B\u578B\u6765\u5B9E\u73B0\u4E92\u65A5\u9501\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u591A\u4E2Agoroutine\u5E76\u53D1\u64CD\u4F5C\u5168\u5C40\u53D8\u91CFx</span>

<span class="token keyword">var</span> <span class="token punctuation">(</span>
	x  <span class="token builtin">int64</span>
	wg sync<span class="token punctuation">.</span>WaitGroup
	lock sync<span class="token punctuation">.</span>Mutex
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">5000</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token comment">// 1. \u62FF\u5230\u5168\u5C40\u53D8\u91CFx</span>
		<span class="token comment">// 2. \u7ED9\u8FD9\u4E2A\u503C+1</span>
		<span class="token comment">// 3. \u52A01\u540E\u5728\u8D4B\u503C\u7ED9\u5168\u5C40\u53D8\u91CFx</span>
		lock<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u52A0\u9501</span>
		x<span class="token operator">++</span> <span class="token comment">// \u5BF9\u5168\u5C40\u53D8\u91CF\u8FDB\u884C\u6BCF\u6B21+1</span>
		lock<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u91CA\u653E\u9501</span>
	<span class="token punctuation">}</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span> <span class="token comment">// 10000 \u8FD9\u4E2A\u65F6\u5019\u4E0D\u7BA1\u6267\u884C\u591A\u5C11\u6B21\u90FD\u662F10000</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u4F7F\u7528\u4E00\u4E2A\u5BB9\u91CF\u4E3A-1-\u7684\u901A\u9053\u6765\u4FDD\u8BC1\u540C\u4E00\u65F6\u95F4\u6700\u591A\u6709\u4E00\u4E2A-goroutine-\u80FD\u8BBF\u95EE\u5171\u4EAB\u53D8\u91CF" tabindex="-1"><a class="header-anchor" href="#\u4F7F\u7528\u4E00\u4E2A\u5BB9\u91CF\u4E3A-1-\u7684\u901A\u9053\u6765\u4FDD\u8BC1\u540C\u4E00\u65F6\u95F4\u6700\u591A\u6709\u4E00\u4E2A-goroutine-\u80FD\u8BBF\u95EE\u5171\u4EAB\u53D8\u91CF" aria-hidden="true">#</a> \u4F7F\u7528\u4E00\u4E2A\u5BB9\u91CF\u4E3A 1 \u7684\u901A\u9053\u6765\u4FDD\u8BC1\u540C\u4E00\u65F6\u95F4\u6700\u591A\u6709\u4E00\u4E2A goroutine \u80FD\u8BBF\u95EE\u5171\u4EAB\u53D8\u91CF</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">var</span> <span class="token punctuation">(</span>
	sema    <span class="token operator">=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token comment">// \u7528\u6765\u4FDD\u62A4  balance\u7684\u4E8C\u8FDB\u5236\u4FE1\u53F7\u91CF</span>
	balance <span class="token builtin">int</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">Deposit</span><span class="token punctuation">(</span>amount <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	sema <span class="token operator">&lt;-</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">{</span><span class="token punctuation">}</span> <span class="token comment">// \u83B7\u53D6\u4EE4\u724C</span>
	balance <span class="token operator">=</span> balance <span class="token operator">+</span> amount
	<span class="token operator">&lt;-</span>sema <span class="token comment">// \u91CA\u653E\u4EE4\u724C</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">Balance</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	sema <span class="token operator">&lt;-</span> <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">{</span><span class="token punctuation">}</span> <span class="token comment">// \u83B7\u53D6\u4EE4\u724C</span>
	b <span class="token operator">:=</span> balance
	<span class="token operator">&lt;-</span>sema <span class="token comment">// \u91CA\u653E\u4EE4\u724C</span>
	<span class="token keyword">return</span> b
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u4F7F\u7528<code>sync.Mutext</code></p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;sync&quot;</span>

<span class="token keyword">var</span> <span class="token punctuation">(</span>
	<span class="token comment">//sema    = make(chan struct{}, 1) // \u7528\u6765\u4FDD\u62A4  balance\u7684\u4E8C\u8FDB\u5236\u4FE1\u53F7\u91CF</span>
	mu sync<span class="token punctuation">.</span>Mutex
	balance <span class="token builtin">int</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">Deposit</span><span class="token punctuation">(</span>amount <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">//sema &lt;- struct{}{} // \u83B7\u53D6\u4EE4\u724C</span>
	mu<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	balance <span class="token operator">=</span> balance <span class="token operator">+</span> amount
	<span class="token comment">//&lt;-sema // \u91CA\u653E\u4EE4\u724C</span>
	mu<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">Balance</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	<span class="token comment">//sema &lt;- struct{}{} // \u83B7\u53D6\u4EE4\u724C</span>
	mu<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	b <span class="token operator">:=</span> balance
	<span class="token comment">//&lt;-sema // \u91CA\u653E\u4EE4\u724C</span>
	mu<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">return</span> b
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u8BFB\u5199\u4E92\u65A5\u9501" tabindex="-1"><a class="header-anchor" href="#\u8BFB\u5199\u4E92\u65A5\u9501" aria-hidden="true">#</a> \u8BFB\u5199\u4E92\u65A5\u9501</h2><p>\u5F88\u591A\u5B9E\u9645\u573A\u666F\u8BFB\u7684\u6BD4\u5199\u7684\u591A\uFF0C\u8BFB\u4E0D\u6D89\u53CA\u4E00\u4E2A\u8D44\u6E90\u7684\u66F4\u6539\u548C\u53D8\u5E7B\uFF0C\u662F\u6CA1\u6709\u5FC5\u8981\u52A0\u9501\u7684\uFF0C\u8FD9\u6837\u4F7F\u7528\u8BFB\u5199\u4E92\u65A5\u9501\u6BD4\u8F83\u9002\u5408\u3002\u8BFB\u5199\u9501\u5728 Go \u8BED\u8A00\u91CC\u4F7F\u7528<code>sync</code>\u5305\u7684<code>RWMutex</code>\u7C7B\u578B\u3002</p><p>\u8BFB\u5199\u9501\uFF1A</p><ul><li>\u5F53\u4E00\u4E2A<code>goroutine</code>\u83B7\u5F97\u8BFB\u9501\u53EA\u6709\uFF0C\u5176\u4ED6\u7684<code>goroutine</code>\u5982\u679C\u662F\u83B7\u53D6\u8BFB\u9501\u4F1A\u7EE7\u7EED\u83B7\u53D6\u8BFB\u9501\uFF0C\u5982\u679C\u662F\u5199\u9501\u5C31\u4F1A\u7B49\u5F85\u3002</li><li>\u5F53\u4E00\u4E2A<code>goroutine</code>\u83B7\u53D6\u5199\u9501\u65F6\uFF0C\u5176\u4ED6\u7684<code>goroutine</code>\u65E0\u8BBA\u662F\u8BFB\u8FD8\u662F\u5199\u9501\u90FD\u4F1A\u7B49\u5F85\u3002</li></ul><p>\u6848\u4F8B\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">// \u4F7F\u7528\u4E92\u65A5\u9501\u7684\u65F6\u95F4</span>

<span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> <span class="token punctuation">(</span>
	x    <span class="token builtin">int64</span>
	wg   sync<span class="token punctuation">.</span>WaitGroup
	lock sync<span class="token punctuation">.</span>Mutex
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	lock<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span>
	lock<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">write</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	lock<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	x<span class="token operator">++</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond <span class="token operator">*</span> <span class="token number">10</span><span class="token punctuation">)</span>
	lock<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	start <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">1000</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
		<span class="token keyword">go</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
		<span class="token keyword">go</span> <span class="token function">write</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Sub</span><span class="token punctuation">(</span>start<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span>\u8F93\u51FA
<span class="token number">1</span><span class="token punctuation">.</span>387438292s

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">// \u4F7F\u7528\u8BFB\u5199\u9501</span>

<span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> <span class="token punctuation">(</span>
	x    <span class="token builtin">int64</span>
	wg   sync<span class="token punctuation">.</span>WaitGroup
	rwLock sync<span class="token punctuation">.</span>RWMutex
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	rwLock<span class="token punctuation">.</span><span class="token function">RLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u8BFB\u9501</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span>
	rwLock<span class="token punctuation">.</span><span class="token function">RUnlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u662F\u5426\u8BFB\u9501</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">write</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	rwLock<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	x<span class="token operator">++</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond <span class="token operator">*</span> <span class="token number">10</span><span class="token punctuation">)</span>
	rwLock<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	start <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">1000</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
		<span class="token keyword">go</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
		<span class="token keyword">go</span> <span class="token function">write</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Sub</span><span class="token punctuation">(</span>start<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span>\u8F93\u51FA
<span class="token number">122</span><span class="token punctuation">.</span>424125ms

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container danger"><p class="custom-container-title">\u8B66\u544A</p><p><strong>\u8BFB\u5199\u9501\u662F\u975E\u5E38\u9002\u5408\u8BFB\u591A\u5199\u5C11\u7684\u573A\u666F\uFF0C\u5982\u679C\u8BFB\u548C\u5199\u7684\u64CD\u4F5C\u5DEE\u522B\u4E0D\u5927\uFF0C\u8BFB\u5199\u9501\u7684\u4F18\u52BF\u5C31\u53D1\u6325\u4E0D\u51FA\u6765</strong></p></div><h2 id="sync-waitgroup" tabindex="-1"><a class="header-anchor" href="#sync-waitgroup" aria-hidden="true">#</a> sync.WaitGroup</h2><table><thead><tr><th>\u65B9\u6CD5\u540D</th><th>\u529F\u80FD</th></tr></thead><tbody><tr><td><code>func(wg *WaitGroup) Add(delta int)</code></td><td>\u8BA1\u6570\u5668+delta</td></tr><tr><td><code>(wg *WaitGroup) Done()</code></td><td>\u8BA1\u6570\u5668-1</td></tr><tr><td><code>(wg *WaitGroup) Wait()</code></td><td>\u963B\u585E\u77E5\u9053\u8BA1\u6570\u5668\u4E3A 0</td></tr></tbody></table><p>\u5B83\u5185\u90E8\u7EF4\u62A4\u4E86\u4E00\u4E2A\u8BA1\u6570\u5668\uFF0C\u8BA1\u6570\u5668\u7684\u503C\u53EF\u4EE5\u589E\u52A0\u548C\u51CF\u5C11\uFF0C\u6BCF\u4E2A\u4EFB\u52A1\u5B8C\u6210\u65F6\uFF0C\u901A\u8FC7\u8C03\u7528<code>Done</code>\u65B9\u6CD5\u5C06\u8BA1\u6570\u5668\u51CF 1\uFF0C\u901A\u8FC7<code>Wait</code>\u65B9\u6CD5\u6765\u7B49\u5F85\u5E76\u53D1\u4EFB\u52A1\u6267\u884C\u5B8C\u6210\uFF0C\u5F53\u8BA1\u6570\u5668\u4E3A 0 \u65F6\u8868\u793A\u6240\u6709\u5E76\u53D1\u4EFB\u52A1\u5DF2\u7ECF\u5B8C\u6210\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> wg sync<span class="token punctuation">.</span>WaitGroup

<span class="token keyword">func</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">defer</span> wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;hello world&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token keyword">go</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;main goroutine&quot;</span><span class="token punctuation">)</span>
    wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="sync-once" tabindex="-1"><a class="header-anchor" href="#sync-once" aria-hidden="true">#</a> sync.Once</h2><p>\u5728\u67D0\u4E9B\u573A\u666F\u4E0B\uFF0C\u67D0\u4E9B\u64CD\u4F5C\u53EA\u9700\u8981\u6267\u884C\u4E00\u6B21\uFF0C\u4F8B\u5982\u53EA\u52A0\u8F7D\u4E00\u6B21\u914D\u7F6E\u6587\u4EF6\uFF0C\u53EA\u5173\u95ED\u4E00\u6B21\u901A\u9053\u7B49\u3002</p><p>Go \u8BED\u8A00\u4E2D\u4F7F\u7528<code>sync</code>\u5305\u4E2D\u7684<code>Once</code>\u7C7B\u578B</p><p>\u5B83\u53EA\u6709\u4E00\u4E2A<code>Do</code>\u65B9\u6CD5</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>o <span class="token operator">*</span>Once<span class="token punctuation">)</span> Do <span class="token punctuation">(</span>f <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="\u52A0\u8F7D\u914D\u7F6E\u6587\u4EF6\u6848\u4F8B" tabindex="-1"><a class="header-anchor" href="#\u52A0\u8F7D\u914D\u7F6E\u6587\u4EF6\u6848\u4F8B" aria-hidden="true">#</a> \u52A0\u8F7D\u914D\u7F6E\u6587\u4EF6\u6848\u4F8B</h3><p>\u5EF6\u8FDF\u4E00\u4E2A\u5F00\u9500\u5F88\u5927\u7684\u521D\u59CB\u5316\u64CD\u4F5C\u5230\u771F\u6B63\u7528\u5230\u5B83\u7684\u65F6\u5019\u518D\u6267\u884C\u662F\u4E00\u4E2A\u5F88\u597D\u7684\u65F6\u95F4\u3002\u56E0\u4E3A\u9884\u5148\u521D\u59CB\u5316\u4E00\u4E2A\u53D8\u91CF(\u6BD4\u5982\u4F7F\u7528<code>init</code>\u51FD\u6570\u4E2D\u5B8C\u6210\u7684\u521D\u59CB\u5316)\u4F1A\u589E\u52A0\u7A0B\u5E8F\u7684\u542F\u52A8\u8017\u65F6\uFF0C\u800C\u4E14\u8FD9\u4E2A\u53D8\u91CF\u53EF\u80FD\u540E\u9762\u90FD\u6CA1\u7528\u4E0A\uFF0C\u90A3\u4E48\u8FD9\u4E2A\u521D\u59CB\u5316\u5C31\u4E0D\u662F\u5FC5\u8981\u7684\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> icons <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span>image<span class="token punctuation">.</span>Image

<span class="token keyword">func</span> <span class="token function">loadIcons</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	icons <span class="token operator">=</span> <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span>image<span class="token punctuation">.</span>Image<span class="token punctuation">{</span>
		<span class="token string">&quot;left&quot;</span><span class="token punctuation">:</span>  <span class="token function">loadIcon</span><span class="token punctuation">(</span><span class="token string">&quot;left.png&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		<span class="token string">&quot;up&quot;</span><span class="token punctuation">:</span>    <span class="token function">loadIcon</span><span class="token punctuation">(</span><span class="token string">&quot;up.png&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		<span class="token string">&quot;right&quot;</span><span class="token punctuation">:</span> <span class="token function">loadIcon</span><span class="token punctuation">(</span><span class="token string">&quot;right.png&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		<span class="token string">&quot;down&quot;</span><span class="token punctuation">:</span>  <span class="token function">loadIcon</span><span class="token punctuation">(</span><span class="token string">&quot;down.png&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">Icon</span><span class="token punctuation">(</span>name <span class="token builtin">string</span><span class="token punctuation">)</span> image<span class="token punctuation">.</span>Image <span class="token punctuation">{</span>
	<span class="token keyword">if</span> icons <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token function">loadIcons</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> icons<span class="token punctuation">[</span>name<span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u591A\u4E2A<code>goroutine</code>\u5E76\u53D1\u540C\u65F6\u8C03\u7528 Icon \u51FD\u6570\u65F6\u5E76\u4E0D\u662F\u5E76\u53D1\u5B89\u5168\u7684\u3002</p><p>\u4F7F\u7528<code>sync.Once</code>\u6539\u9020</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> icons <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span>image<span class="token punctuation">.</span>Image

<span class="token keyword">var</span> loadIconsOnce sync<span class="token punctuation">.</span>Once

<span class="token keyword">func</span> <span class="token function">loadIcons</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	icons <span class="token operator">=</span> <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span>image<span class="token punctuation">.</span>Image<span class="token punctuation">{</span>
		<span class="token string">&quot;left&quot;</span><span class="token punctuation">:</span>  <span class="token function">loadIcon</span><span class="token punctuation">(</span><span class="token string">&quot;left.png&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		<span class="token string">&quot;up&quot;</span><span class="token punctuation">:</span>    <span class="token function">loadIcon</span><span class="token punctuation">(</span><span class="token string">&quot;up.png&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		<span class="token string">&quot;right&quot;</span><span class="token punctuation">:</span> <span class="token function">loadIcon</span><span class="token punctuation">(</span><span class="token string">&quot;right.png&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		<span class="token string">&quot;down&quot;</span><span class="token punctuation">:</span>  <span class="token function">loadIcon</span><span class="token punctuation">(</span><span class="token string">&quot;down.png&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">Icon</span><span class="token punctuation">(</span>name <span class="token builtin">string</span><span class="token punctuation">)</span> image<span class="token punctuation">.</span>Image <span class="token punctuation">{</span>
  loadIconsOnce <span class="token function">Do</span><span class="token punctuation">(</span>loadIcons<span class="token punctuation">)</span>
	<span class="token keyword">return</span> icons<span class="token punctuation">[</span>name<span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u5E76\u53D1\u5B89\u5168\u7684\u5355\u4F8B\u6A21\u5F0F" tabindex="-1"><a class="header-anchor" href="#\u5E76\u53D1\u5B89\u5168\u7684\u5355\u4F8B\u6A21\u5F0F" aria-hidden="true">#</a> \u5E76\u53D1\u5B89\u5168\u7684\u5355\u4F8B\u6A21\u5F0F</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">type</span> singleton <span class="token keyword">struct</span><span class="token punctuation">{</span><span class="token punctuation">}</span>

<span class="token keyword">var</span> instance <span class="token operator">*</span>singleton
<span class="token keyword">var</span> once sync<span class="token punctuation">.</span>Once

<span class="token keyword">func</span> <span class="token function">GetInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span>singleton <span class="token punctuation">{</span>
    once<span class="token punctuation">.</span><span class="token function">Do</span><span class="token punctuation">(</span><span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        instance <span class="token operator">=</span> <span class="token operator">&amp;</span>singleton<span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token keyword">return</span> instance
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>sync.Once</code>\u5176\u5B9E\u5185\u90E8\u5305\u542B\u4E00\u4E2A\u4E92\u65A5\u9501\u548C\u4E00\u4E2A\u5E03\u5C14\u503C\uFF0C\u4E92\u65A5\u8BF4\u4FDD\u8BC1\u5E03\u5C14\u503C\u548C\u6570\u636E\u7684\u5B89\u5168\uFF0C\u800C\u5E03\u5C14\u503C\u7528\u6765\u8BB0\u5F55\u521D\u59CB\u5316\u7684\u64CD\u4F5C\u662F\u5426\u5B8C\u6210\u3002\u8FD9\u6837\u8BBE\u8BA1\u5C31\u80FD\u4FDD\u8BC1\u521D\u59CB\u5316\u64CD\u4F5C\u7684\u65F6\u5019\u662F\u5E76\u53D1\u5B89\u5168\u7684\uFF0C\u5E76\u4E14\u521D\u59CB\u5316\u64CD\u4F5C\u4E5F\u4E0D\u4F1A\u88AB\u6267\u884C\u591A\u6B21\u3002</p><h2 id="sync-map" tabindex="-1"><a class="header-anchor" href="#sync-map" aria-hidden="true">#</a> sync.Map</h2><blockquote><p>Go \u8BED\u8A00\u5185\u7F6E\u7684 map \u4E0D\u662F\u5E76\u53D1\u5B89\u5168\u7684</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;strconv&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> m <span class="token operator">=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span><span class="token builtin">int</span><span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">get</span><span class="token punctuation">(</span>key <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	<span class="token keyword">return</span> m<span class="token punctuation">[</span>key<span class="token punctuation">]</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">set</span><span class="token punctuation">(</span>key <span class="token builtin">string</span><span class="token punctuation">,</span> value <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	m<span class="token punctuation">[</span>key<span class="token punctuation">]</span> <span class="token operator">=</span> value
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	wg <span class="token operator">:=</span> sync<span class="token punctuation">.</span>WaitGroup<span class="token punctuation">{</span><span class="token punctuation">}</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
		<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span>n <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			key <span class="token operator">:=</span> strconv<span class="token punctuation">.</span><span class="token function">Itoa</span><span class="token punctuation">(</span>n<span class="token punctuation">)</span>
			<span class="token function">set</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> n<span class="token punctuation">)</span>
			fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;k=%v, v=%v\\n&quot;</span><span class="token punctuation">,</span> key<span class="token punctuation">,</span> <span class="token function">get</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">)</span>
			wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>fatal error: concurrent map writes

goroutine <span class="token number">13</span> <span class="token punctuation">[</span>running<span class="token punctuation">]</span>:
runtime.throw<span class="token punctuation">(</span><span class="token punctuation">{</span>0x10441c719, 0x15<span class="token punctuation">}</span><span class="token punctuation">)</span>
        /usr/local/go/src/runtime/panic.go:1198 +0x54 <span class="token assign-left variable">fp</span><span class="token operator">=</span>0x140000726b0 <span class="token assign-left variable">sp</span><span class="token operator">=</span>0x14000072680 <span class="token assign-left variable">pc</span><span class="token operator">=</span>0x1043b9914
runtime.mapassign_faststr<span class="token punctuation">(</span>0x1044464e0, 0x14000058180, <span class="token punctuation">{</span>0x10441f462, 0x1<span class="token punctuation">}</span><span class="token punctuation">)</span>
        /usr/local/go/src/runtime/map_faststr.go:211 +0x3e8 <span class="token assign-left variable">fp</span><span class="token operator">=</span>0x14000072720 <span class="token assign-left variable">sp</span><span class="token operator">=</span>0x140000726b0 <span class="token assign-left variable">pc</span><span class="token operator">=</span>0x104398238
main.set<span class="token punctuation">(</span><span class="token punctuation">..</span>.<span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container warning"><p class="custom-container-title">\u6CE8\u610F</p><p>\u5728\u591A\u4E2A goroutine \u91CC\uFF0C\u53C8\u7ED9 map \u8BBE\u7F6E\u503C\uFF0C\u53C8\u53D6\u503C\uFF0C\u5BF9 map \u8FDB\u884C\u5E76\u53D1\u64CD\u4F5C\uFF0C\u4F1A\u9020\u6210\u5E76\u53D1\u4E0D\u5B89\u5168\u95EE\u9898\u3002</p><blockquote><p>\u5E94\u7528\u573A\u666F</p></blockquote><p>\u5F53\u4E00\u4E2A map \u53D8\u91CF\u6216\u8005\u7ED3\u6784\u4F53\u91CC\u7684\u4E00\u4E2A map \u7C7B\u578B\u7684\u5B57\u6BB5\u53EF\u80FD\u4F1A\u88AB\u591A\u4E2A goroutine \u8BBF\u95EE\u7684\u65F6\u5019\uFF0C\u4F60\u8981\u6CE8\u610F\u4F7F\u7528\u5E76\u53D1\u5B89\u5168\u7684\u65B9\u6CD5\uFF1A</p><ol><li>\u81EA\u5DF1\u52A0\u9501</li><li>\u4F7F\u7528<code>sync.Map</code></li></ol></div><p><code>sync.Map</code>\u7684\u5E38\u89C1\u4F7F\u7528\u51FD\u6570\uFF1A</p><table><thead><tr><th>\u65B9\u6CD5\u540D</th><th>\u529F\u80FD</th></tr></thead><tbody><tr><td>func(m *Map) Store(key, value interface{})</td><td>\u5B58\u50A8 key-value \u6570\u636E</td></tr><tr><td>func(m *Map) Load(key interface{}) (value interface{}, ok bool)</td><td>\u67E5\u8BE2 key \u5BF9\u5E94\u7684 value</td></tr><tr><td>func(m *Map) LoadOrStore(key, value interface{}) (actual interface{}, loaded bool)</td><td>\u67E5\u8BE2\u6216\u5B58\u50A8 key \u5BF9\u5E94\u7684 value</td></tr><tr><td>func(m *Map) LoadAndDelete(key interface{}) (value interface{}, loaded bool)</td><td>\u67E5\u8BE2\u5E76\u5220\u9664 key</td></tr><tr><td>func(m *Map) delete(key interface{})</td><td>\u5220\u9664 key</td></tr><tr><td>func(m *Map) Range(f func(key, value interface{}) bool)</td><td>\u5BF9 map \u4E2D\u7684\u6BCF\u4E2A key-value \u4E00\u6B21\u8C03\u7528 f</td></tr></tbody></table><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;strconv&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u5E76\u53D1\u5B89\u5168\u7684map</span>
<span class="token keyword">var</span> syncMap <span class="token operator">=</span> sync<span class="token punctuation">.</span>Map<span class="token punctuation">{</span><span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	wg <span class="token operator">:=</span> sync<span class="token punctuation">.</span>WaitGroup<span class="token punctuation">{</span><span class="token punctuation">}</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
		<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span>n <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			key <span class="token operator">:=</span> strconv<span class="token punctuation">.</span><span class="token function">Itoa</span><span class="token punctuation">(</span>n<span class="token punctuation">)</span>
			syncMap<span class="token punctuation">.</span><span class="token function">Store</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> n<span class="token punctuation">)</span>         <span class="token comment">// \u5B58\u50A8key-value</span>
			value<span class="token punctuation">,</span> <span class="token boolean">_</span> <span class="token operator">:=</span> syncMap<span class="token punctuation">.</span><span class="token function">Load</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span> <span class="token comment">// \u6839\u636Ekey\u83B7\u53D6\u503C</span>
			fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;k=%v, v=%v\\n&quot;</span><span class="token punctuation">,</span> key<span class="token punctuation">,</span> value<span class="token punctuation">)</span>
			wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u539F\u5B50\u64CD\u4F5C" tabindex="-1"><a class="header-anchor" href="#\u539F\u5B50\u64CD\u4F5C" aria-hidden="true">#</a> \u539F\u5B50\u64CD\u4F5C</h2><blockquote><p>\u9488\u5BF9\u6574\u6570\u6570\u636E\u7C7B\u578B(int32, uint32, int64, uint64)\u6211\u4EEC\u8FD8\u53EF\u4EE5\u4F7F\u7528\u539F\u5B50\u64CD\u4F5C\u6765\u4FDD\u8BC1\u5E76\u53D1\u5B89\u5168\uFF0C\u901A\u5E38\u76F4\u63A5\u4F7F\u7528\u539F\u5B50\u64CD\u4F5C\u6BD4\u4F7F\u7528\u9501\u64CD\u4F5C\u6548\u7387\u66F4\u9AD8\u3002Go \u8BED\u8A00\u4E2D\u539F\u5B50\u64CD\u4F5C\u7531\u5185\u7F6E\u7684\u6807\u51C6\u5E93<code>sync/atomic</code>\u63D0\u4F9B\u3002</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
	<span class="token string">&quot;sync/atomic&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">type</span> Counter <span class="token keyword">interface</span> <span class="token punctuation">{</span>
	<span class="token function">Inc</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token function">Load</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">int64</span>
<span class="token punctuation">}</span>

<span class="token keyword">type</span> CommonCounter <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	counter <span class="token builtin">int64</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>c <span class="token operator">*</span>CommonCounter<span class="token punctuation">)</span> <span class="token function">Inc</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	c<span class="token punctuation">.</span>counter<span class="token operator">++</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>c <span class="token operator">*</span>CommonCounter<span class="token punctuation">)</span> <span class="token function">Load</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">int64</span> <span class="token punctuation">{</span>
	<span class="token keyword">return</span> c<span class="token punctuation">.</span>counter
<span class="token punctuation">}</span>

<span class="token comment">// \u4E92\u65A5\u9501\u7248</span>

<span class="token keyword">type</span> MutexCounter <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	counter <span class="token builtin">int64</span>
	lock    sync<span class="token punctuation">.</span>Mutex
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>m <span class="token operator">*</span>MutexCounter<span class="token punctuation">)</span> <span class="token function">Inc</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	m<span class="token punctuation">.</span>lock<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">defer</span> m<span class="token punctuation">.</span>lock<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	m<span class="token punctuation">.</span>counter<span class="token operator">++</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>m <span class="token operator">*</span>MutexCounter<span class="token punctuation">)</span> <span class="token function">Load</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">int64</span> <span class="token punctuation">{</span>
	m<span class="token punctuation">.</span>lock<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">defer</span> m<span class="token punctuation">.</span>lock<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">return</span> m<span class="token punctuation">.</span>counter
<span class="token punctuation">}</span>

<span class="token comment">// \u539F\u5B50\u64CD\u4F5C\u7248</span>

<span class="token keyword">type</span> AutomicCounter <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	counter <span class="token builtin">int64</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>a <span class="token operator">*</span>AutomicCounter<span class="token punctuation">)</span> <span class="token function">Inc</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	atomic<span class="token punctuation">.</span><span class="token function">AddInt64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>a<span class="token punctuation">.</span>counter<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token comment">// \u6700\u5C0F\u7C92\u5EA6\u7684\u64CD\u4F5C</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>a <span class="token operator">*</span>AutomicCounter<span class="token punctuation">)</span> <span class="token function">Load</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">int64</span> <span class="token punctuation">{</span>
	<span class="token keyword">return</span> atomic<span class="token punctuation">.</span><span class="token function">LoadInt64</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>a<span class="token punctuation">.</span>counter<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">test</span><span class="token punctuation">(</span>c Counter<span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> wg sync<span class="token punctuation">.</span>WaitGroup
	start <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">1000</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
		<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			c<span class="token punctuation">.</span><span class="token function">Inc</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
			wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	end <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>c<span class="token punctuation">.</span><span class="token function">Load</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> end<span class="token punctuation">.</span><span class="token function">Sub</span><span class="token punctuation">(</span>start<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u975E\u5E76\u53D1\u5B89\u5168</span>
	c1 <span class="token operator">:=</span> CommonCounter<span class="token punctuation">{</span><span class="token punctuation">}</span>
	<span class="token function">test</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>c1<span class="token punctuation">)</span>

	<span class="token comment">// \u4F7F\u7528\u4E92\u65A5\u9501\u5B9E\u73B0\u5E76\u53D1\u5B89\u5168</span>
	c2 <span class="token operator">:=</span> MutexCounter<span class="token punctuation">{</span><span class="token punctuation">}</span>
	<span class="token function">test</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>c2<span class="token punctuation">)</span>

	<span class="token comment">// \u5E76\u53D1\u5B89\u5168\u4E14\u6BD4\u4E92\u65A5\u9501\u6548\u7387\u66F4\u9AD8</span>
	c3 <span class="token operator">:=</span> AutomicCounter<span class="token punctuation">{</span><span class="token punctuation">}</span>
	<span class="token function">test</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>c3<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">963</span> <span class="token number">465.75</span>\xB5s
<span class="token number">1000</span> <span class="token number">382.583</span>\xB5s
<span class="token number">1000</span> <span class="token number">365.458</span>\xB5s

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7B2C\u4E00\u4E2A\u7684\u503C\u5C31\u4F1A\u7ECF\u5E38\u53D1\u751F\u53D8\u5316\uFF0C\u5C31\u662F\u4E0D\u5B89\u5168\u7684\u8868\u73B0\u3002</p>`,49),c=[e];function o(i,l){return s(),a("div",null,c)}var d=n(p,[["render",o],["__file","go\u5E76\u53D1\u5B89\u5168\u4E0E\u9501.html.vue"]]);export{d as default};
