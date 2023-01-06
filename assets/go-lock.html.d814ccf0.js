import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.85c7af13.js";const i={},e=t(`<h2 id="go-\u4E2D\u7684\u9501" tabindex="-1"><a class="header-anchor" href="#go-\u4E2D\u7684\u9501" aria-hidden="true">#</a> Go \u4E2D\u7684\u9501</h2><blockquote><p>\u770B\u4E0B\u9762\u4E00\u6BB5\u4EE3\u7801\uFF0C\u540C\u65F6\u7ADE\u4E89\u5168\u5C40\u53D8\u91CF<code>x</code>\u6C42\u548C\u3002</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> <span class="token punctuation">(</span>
	x <span class="token builtin">int64</span>
	wg sync<span class="token punctuation">.</span>WaitGroup
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">5000</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		x <span class="token operator">+=</span> <span class="token number">1</span>
	<span class="token punctuation">}</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>

	<span class="token keyword">go</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u6837\u4E0B\u6765\uFF0C\u6BCF\u6B21\u7684\u7ED3\u679C\u591A\u4F1A\u4E0D\u4E00\u6837\uFF0C\u53EF\u80FD\u4F60\u524D\u811A\u628A<code>x</code>\u52A0\u5230 100\uFF0C\u540E\u4E00\u4E2A goroutine \u53C8\u52A0\u5230\u4E86 300\uFF0C\u6700\u7EC8\u5BFC\u81F4\u7ED3\u679C\u4E0D\u662F\u6211\u4EEC\u60F3\u8981\u7684 10000</p><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u5373\u6211\u4EEC\u6700\u7EC8\u5F97\u5BF9\u4E00\u4E2A\u516C\u5171\u7684\u8D44\u6E90\u4E0D\u80FD\u540C\u65F6\u5904\u7406\u6570\u636E\u3002\u4E0D\u7136\u5C31\u4F1A\u4EA7\u751F\u6570\u636E\u7ADE\u4E89\uFF0C\u5E76\u53D1\u4E0D\u5B89\u5168\u3002\u50CF\u6211\u4EEC\u4E0A\u5395\u6240\u4E00\u6837\uFF0C\u5F53\u6709\u4E00\u4E2A\u4EBA\u5728\u5395\u6240\uFF0C\u4F1A\u628A\u95E8\u5173\u4E0A\u52A0\u4E2A\u9501\uFF0C\u8FD9\u6837\u5176\u4F59\u7684\u4EBA\u5C31\u4E0D\u80FD\u8FDB\u53BB\uFF0C\u7B49\u4F60\u5B8C\u4E8B\u540E\u518D\u628A\u9501\u6253\u5F00\uFF0C\u522B\u4EBA\u53C8\u53EF\u4EE5\u8FDB\u53BB\u4E86\u3002</p></div><h2 id="\u4E92\u65A5\u9501" tabindex="-1"><a class="header-anchor" href="#\u4E92\u65A5\u9501" aria-hidden="true">#</a> \u4E92\u65A5\u9501</h2><blockquote><p>\u83B7\u53D6\u5230\u4E92\u65A5\u9501\u7684\u4EFB\u52A1\uFF0C\u963B\u585E\u5176\u4ED6\u4EFB\u52A1\u6765\u83B7\u53D6\u9501</p><p>\u610F\u5473\u7740\u540C\u4E00\u65F6\u95F4\u53EA\u80FD\u6709\u4E00\u4E2A\u4EFB\u52A1\u624D\u80FD\u6301\u6709\u4E92\u65A5\u9501</p></blockquote><p>\u4F7F\u7528\u4E92\u65A5\u9501\u6765\u4FEE\u6539\u4E0A\u9762\u7684\u4EE3\u7801\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> <span class="token punctuation">(</span>
	x <span class="token builtin">int64</span>
	wg sync<span class="token punctuation">.</span>WaitGroup
	lock sync<span class="token punctuation">.</span>Mutex
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">5000</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		lock<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u6539\u4E4B\u524D\u52A0\u9501</span>
		x <span class="token operator">+=</span> <span class="token number">1</span> <span class="token comment">// \u4EE3\u7801\u5230\u4E86\u8FD9\u91CC\u5C31\u53D8\u6210\u4E86\u4E32\u884C</span>
		lock<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u6539\u5B8C\u89E3\u9501</span>
	<span class="token punctuation">}</span>
	wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>

	<span class="token keyword">go</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">add</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>x<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u4F7F\u7528\u4E92\u65A5\u9501\u80FD\u591F\u4FDD\u8BC1\u540C\u4E00\u65F6\u95F4\u6709\u4E14\u53EA\u6709\u4E00\u4E2A goroutine \u8FDB\u5165\u4E34\u754C\u533A\uFF0C\u5176\u4ED6\u7684 goroutine \u5219\u5728\u7B49\u5F85\u89E3\u9501\uFF1B\u5F53\u4E92\u65A5\u9501\u91CA\u653E\u4E4B\u540E\uFF0C\u7B49\u5F85\u7684 goroutine \u624D\u53EF\u4EE5\u83B7\u53D6\u9501\u8FDB\u5165\u4E34\u754C\u533A\uFF0C\u591A\u4E2A goroutine \u540C\u65F6\u7B49\u5F85\u4E00\u4E2A\u9501\uFF0C\u5524\u9192\u7684\u7B56\u7565\u662F\u968F\u673A\u7684\u3002</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;log&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// HcMutex \u662F\u4E00\u4E2A\u4E92\u65A5\u9501</span>
<span class="token keyword">var</span> HcMutex sync<span class="token punctuation">.</span>Mutex

<span class="token keyword">func</span> <span class="token function">runMutex</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;[\u4EFB\u52A1id\uFF1A%d][\u5C1D\u8BD5\u83B7\u53D6\u9501]&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span>
	HcMutex<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;[\u4EFB\u52A1id\uFF1A%d][\u83B7\u53D6\u5230\u4E86\u9501]&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span><span class="token number">20</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span> <span class="token comment">// \u7761\u772010\u79D2\u949F</span>
	HcMutex<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;[\u4EFB\u52A1id\uFF1A%d][\u5E72\u5B8C\u6D3B\u4E86\uFF0C\u91CA\u653E\u9501]&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">runHcLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">go</span> <span class="token function">runMutex</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runMutex</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runMutex</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">runHcLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span><span class="token number">6</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Minute<span class="token punctuation">)</span>

	<span class="token comment">/*
		2021/09/02 22:15:46 [\u4EFB\u52A1id\uFF1A3][\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:15:46 [\u4EFB\u52A1id\uFF1A3][\u83B7\u53D6\u5230\u4E86\u9501]
		2021/09/02 22:15:46 [\u4EFB\u52A1id\uFF1A1][\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:15:46 [\u4EFB\u52A1id\uFF1A2][\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:15:56 [\u4EFB\u52A1id\uFF1A1][\u83B7\u53D6\u5230\u4E86\u9501]
		2021/09/02 22:15:56 [\u4EFB\u52A1id\uFF1A3][\u5E72\u5B8C\u6D3B\u4E86\uFF0C\u91CA\u653E\u9501]
		2021/09/02 22:16:06 [\u4EFB\u52A1id\uFF1A1][\u5E72\u5B8C\u6D3B\u4E86\uFF0C\u91CA\u653E\u9501]
		2021/09/02 22:16:06 [\u4EFB\u52A1id\uFF1A2][\u83B7\u53D6\u5230\u4E86\u9501]
		2021/09/02 22:16:16 [\u4EFB\u52A1id\uFF1A2][\u5E72\u5B8C\u6D3B\u4E86\uFF0C\u91CA\u653E\u9501]
	*/</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u8BFB\u5199\u9501" tabindex="-1"><a class="header-anchor" href="#\u8BFB\u5199\u9501" aria-hidden="true">#</a> \u8BFB\u5199\u9501</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;log&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// rwMutex \u662F\u4E00\u4E2A\u8BFB\u5199\u9501</span>
<span class="token keyword">var</span> rwMutex sync<span class="token punctuation">.</span>RWMutex

<span class="token keyword">func</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;[\u8BFB\u4EFB\u52A1id\uFF1A%d][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span>
	rwMutex<span class="token punctuation">.</span><span class="token function">RLock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u8BFB\u9501</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;[\u8BFB\u4EFB\u52A1id\uFF1A%d][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span><span class="token number">10</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span> <span class="token comment">// \u7761\u772010\u79D2\u949F</span>
	rwMutex<span class="token punctuation">.</span><span class="token function">RUnlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;[\u8BFB\u4EFB\u52A1id\uFF1A%d][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">runWriteLock</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;[\u5199\u4EFB\u52A1id\uFF1A%d][\u8FDB\u5165\u5199\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span>
	rwMutex<span class="token punctuation">.</span><span class="token function">Lock</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u5199\u9501</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;[\u5199\u4EFB\u52A1id\uFF1A%d][\u83B7\u53D6\u5230\u4E86\u5199\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span><span class="token number">10</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span> <span class="token comment">// \u7761\u772010\u79D2\u949F</span>
	rwMutex<span class="token punctuation">.</span><span class="token function">Unlock</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;[\u5199\u4EFB\u52A1id\uFF1A%d][\u5B8C\u6210\u5199\u4EFB\u52A1\uFF0C\u91CA\u653E\u5199\u9501]&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// \u5168\u662F\u5199\u4EFB\u52A1</span>
<span class="token keyword">func</span> <span class="token function">allWriteWorks</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">1</span><span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> <span class="token number">5</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token keyword">go</span> <span class="token function">runWriteLock</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// \u5168\u662F\u8BFB\u4EFB\u52A1</span>
<span class="token keyword">func</span> <span class="token function">allReadWorks</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">1</span><span class="token punctuation">;</span> i <span class="token operator">&lt;=</span> <span class="token number">5</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// \u5148\u542F\u52A8\u5199\u4EFB\u52A1</span>
<span class="token keyword">func</span> <span class="token function">writeFirst</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">go</span> <span class="token function">runWriteLock</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">4</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">5</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// \u5148\u542F\u52A8\u5199\u4EFB\u52A1</span>
<span class="token keyword">func</span> <span class="token function">readFirst</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">4</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runReadLock</span><span class="token punctuation">(</span><span class="token number">5</span><span class="token punctuation">)</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token function">runWriteLock</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	log<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;\u6267\u884C\u8BFB\u5199\u9501\u6548\u679C\u7684\u51FD\u6570&quot;</span><span class="token punctuation">)</span>

	<span class="token comment">// 1. \u540C\u65F6\u591A\u4E2A\u5199\u9501\u4EFB\u52A1 =&gt;  \u5982\u679C\u5E76\u53D1\u4F7F\u7528\u8BFB\u5199\u9501\u7684\u5199\u9501\u65F6\uFF0C\u9000\u5316\u6210\u4E86\u4E92\u65A5\u9501</span>
	<span class="token comment">//allWriteWorks()</span>

	<span class="token comment">/*
		2021/09/02 22:27:28 \u6267\u884C\u8BFB\u5199\u9501\u6548\u679C\u7684\u51FD\u6570
		2021/09/02 22:27:28 [\u5199\u4EFB\u52A1id\uFF1A5][\u8FDB\u5165\u5199\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:27:28 [\u5199\u4EFB\u52A1id\uFF1A5][\u83B7\u53D6\u5230\u4E86\u5199\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:27:28 [\u5199\u4EFB\u52A1id\uFF1A1][\u8FDB\u5165\u5199\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:27:28 [\u5199\u4EFB\u52A1id\uFF1A2][\u8FDB\u5165\u5199\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:27:28 [\u5199\u4EFB\u52A1id\uFF1A3][\u8FDB\u5165\u5199\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:27:28 [\u5199\u4EFB\u52A1id\uFF1A4][\u8FDB\u5165\u5199\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:27:38 [\u5199\u4EFB\u52A1id\uFF1A1][\u83B7\u53D6\u5230\u4E86\u5199\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:27:38 [\u5199\u4EFB\u52A1id\uFF1A5][\u5B8C\u6210\u5199\u4EFB\u52A1\uFF0C\u91CA\u653E\u5199\u9501]
		2021/09/02 22:27:48 [\u5199\u4EFB\u52A1id\uFF1A1][\u5B8C\u6210\u5199\u4EFB\u52A1\uFF0C\u91CA\u653E\u5199\u9501]
		2021/09/02 22:27:48 [\u5199\u4EFB\u52A1id\uFF1A2][\u83B7\u53D6\u5230\u4E86\u5199\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:27:58 [\u5199\u4EFB\u52A1id\uFF1A2][\u5B8C\u6210\u5199\u4EFB\u52A1\uFF0C\u91CA\u653E\u5199\u9501]
		2021/09/02 22:27:58 [\u5199\u4EFB\u52A1id\uFF1A3][\u83B7\u53D6\u5230\u4E86\u5199\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:28:08 [\u5199\u4EFB\u52A1id\uFF1A3][\u5B8C\u6210\u5199\u4EFB\u52A1\uFF0C\u91CA\u653E\u5199\u9501]
		2021/09/02 22:28:08 [\u5199\u4EFB\u52A1id\uFF1A4][\u83B7\u53D6\u5230\u4E86\u5199\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:28:18 [\u5199\u4EFB\u52A1id\uFF1A4][\u5B8C\u6210\u5199\u4EFB\u52A1\uFF0C\u91CA\u653E\u5199\u9501]
	*/</span>

	<span class="token comment">// 2. \u540C\u65F6\u591A\u4E2A\u8BFB\u9501\u4EFB\u52A1,\u4F7F\u7528\u8BFB\u9501\uFF0C\u53EF\u4EE5\u540C\u65F6\u52A0\u591A\u628A\u9501</span>
	<span class="token comment">//allReadWorks()</span>

	<span class="token comment">/*
		2021/09/02 22:29:16 \u6267\u884C\u8BFB\u5199\u9501\u6548\u679C\u7684\u51FD\u6570
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A5][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A2][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A4][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A2][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A4][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A5][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A1][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A1][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A3][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:29:16 [\u8BFB\u4EFB\u52A1id\uFF1A3][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:29:26 [\u8BFB\u4EFB\u52A1id\uFF1A3][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:29:26 [\u8BFB\u4EFB\u52A1id\uFF1A4][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:29:26 [\u8BFB\u4EFB\u52A1id\uFF1A2][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:29:26 [\u8BFB\u4EFB\u52A1id\uFF1A5][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:29:26 [\u8BFB\u4EFB\u52A1id\uFF1A1][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
	*/</span>

	<span class="token comment">// 3. \u5148\u542F\u52A8\u5199\u9501\uFF0C\u540E\u5E76\u53D15\u4E2A\u8BFB\u9501\u4EFB\u52A1</span>
	<span class="token comment">// \u5F53\u6709\u5199\u9501\u5B58\u5728\u65F6\uFF0C\u8BFB\u9501\u662F\u65BD\u52A0\u4E0D\u4E86\u7684\u3002\u5199\u9501\u91CA\u653E\u5B8C\uFF0C\u5199\u9501\u53EF\u4EE5\u5E76\u53D1\u7684\u65BD\u52A0\u591A\u4E2A</span>
	<span class="token comment">// \u5199\u9501\u963B\u585E\u6240\u6709\u8BFB\u9501</span>
	<span class="token comment">//writeFirst()</span>

	<span class="token comment">/*
		2021/09/02 22:31:53 \u6267\u884C\u8BFB\u5199\u9501\u6548\u679C\u7684\u51FD\u6570
		2021/09/02 22:31:53 [\u5199\u4EFB\u52A1id\uFF1A1][\u8FDB\u5165\u5199\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:31:53 [\u5199\u4EFB\u52A1id\uFF1A1][\u83B7\u53D6\u5230\u4E86\u5199\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:31:54 [\u8BFB\u4EFB\u52A1id\uFF1A2][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:31:54 [\u8BFB\u4EFB\u52A1id\uFF1A5][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:31:54 [\u8BFB\u4EFB\u52A1id\uFF1A4][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:31:54 [\u8BFB\u4EFB\u52A1id\uFF1A1][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:31:54 [\u8BFB\u4EFB\u52A1id\uFF1A3][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:32:03 [\u8BFB\u4EFB\u52A1id\uFF1A5][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:32:03 [\u8BFB\u4EFB\u52A1id\uFF1A3][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:32:03 [\u5199\u4EFB\u52A1id\uFF1A1][\u5B8C\u6210\u5199\u4EFB\u52A1\uFF0C\u91CA\u653E\u5199\u9501]
		2021/09/02 22:32:03 [\u8BFB\u4EFB\u52A1id\uFF1A2][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:32:03 [\u8BFB\u4EFB\u52A1id\uFF1A4][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:32:03 [\u8BFB\u4EFB\u52A1id\uFF1A1][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:32:13 [\u8BFB\u4EFB\u52A1id\uFF1A1][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:32:13 [\u8BFB\u4EFB\u52A1id\uFF1A2][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:32:13 [\u8BFB\u4EFB\u52A1id\uFF1A4][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:32:13 [\u8BFB\u4EFB\u52A1id\uFF1A5][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:32:13 [\u8BFB\u4EFB\u52A1id\uFF1A3][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
	*/</span>

	<span class="token comment">// 4. \u5148\u542F\u52A8\u8BFB\u9501\uFF0C\u5148\u5E76\u53D15\u4E2A\u8BFB\u9501\u4EFB\u52A1\uFF0C\u540E\u542F\u52A8\u4E00\u4E2A\u5199\u9501\u4EFB\u52A1</span>
	<span class="token comment">// \u5F53\u6709\u8BFB\u9501\u65F6\uFF0C\u963B\u585E\u5199\u9501</span>
	<span class="token function">readFirst</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token comment">/*
		2021/09/02 22:34:19 \u6267\u884C\u8BFB\u5199\u9501\u6548\u679C\u7684\u51FD\u6570
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A5][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A5][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A3][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A2][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A2][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A3][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A4][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A4][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A1][\u8FDB\u5165\u8BFB\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:34:19 [\u8BFB\u4EFB\u52A1id\uFF1A1][\u83B7\u53D6\u5230\u4E86\u8BFB\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:34:20 [\u5199\u4EFB\u52A1id\uFF1A1][\u8FDB\u5165\u5199\u65B9\u6CD5\uFF0C\u5C1D\u8BD5\u83B7\u53D6\u9501]
		2021/09/02 22:34:29 [\u8BFB\u4EFB\u52A1id\uFF1A3][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:34:29 [\u8BFB\u4EFB\u52A1id\uFF1A1][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:34:29 [\u8BFB\u4EFB\u52A1id\uFF1A4][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:34:29 [\u8BFB\u4EFB\u52A1id\uFF1A2][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:34:29 [\u8BFB\u4EFB\u52A1id\uFF1A5][\u5B8C\u6210\u8BFB\u4EFB\u52A1\uFF0C\u91CA\u653E\u8BFB\u9501]
		2021/09/02 22:34:29 [\u5199\u4EFB\u52A1id\uFF1A1][\u83B7\u53D6\u5230\u4E86\u5199\u9501][\u5F00\u59CB\u5E72\u6D3B\uFF0C\u7761\u772010\u79D2]
		2021/09/02 22:34:39 [\u5199\u4EFB\u52A1id\uFF1A1][\u5B8C\u6210\u5199\u4EFB\u52A1\uFF0C\u91CA\u653E\u5199\u9501]
	*/</span>
	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span><span class="token number">1</span> <span class="token operator">*</span> time<span class="token punctuation">.</span>Hour<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u7ED3\u8BBA" tabindex="-1"><a class="header-anchor" href="#\u7ED3\u8BBA" aria-hidden="true">#</a> <strong>\u7ED3\u8BBA</strong></h2><ol><li>\u540C\u65F6\u591A\u4E2A\u5199\u9501\u4EFB\u52A1 -&gt; \u5982\u679C\u5E76\u53D1\u4F7F\u7528\u8BFB\u5199\u9501\u7684\u5199\u9501\u65F6\uFF0C\u9000\u5316\u6210\u4E86\u4E92\u65A5\u9501</li><li>\u540C\u65F6\u591A\u4E2A\u8BFB\u9501\u4EFB\u52A1,\u4F7F\u7528\u8BFB\u9501\uFF0C\u53EF\u4EE5\u540C\u65F6\u52A0\u591A\u628A\u9501</li><li>\u5F53\u6709\u5199\u9501\u5B58\u5728\u65F6\uFF0C\u8BFB\u9501\u662F\u65BD\u52A0\u4E0D\u4E86\u7684\u3002\u5199\u9501\u91CA\u653E\u5B8C\uFF0C\u5199\u9501\u53EF\u4EE5\u5E76\u53D1\u7684\u65BD\u52A0\u591A\u4E2A</li><li>\u5148\u542F\u52A8\u8BFB\u9501\uFF0C\u5148\u5E76\u53D1 5 \u4E2A\u8BFB\u9501\u4EFB\u52A1\uFF0C\u540E\u542F\u52A8\u4E00\u4E2A\u5199\u9501\u4EFB\u52A1\uFF0C\u5F53\u6709\u8BFB\u9501\u65F6\uFF0C\u963B\u585E\u5199\u9501</li></ol>`,15),p=[e];function c(o,l){return s(),a("div",null,p)}var k=n(i,[["render",c],["__file","go-lock.html.vue"]]);export{k as default};
