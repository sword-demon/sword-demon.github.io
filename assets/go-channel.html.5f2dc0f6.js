import{_ as t}from"./plugin-vue_export-helper.21dcd24c.js";import{r as e,o as p,c as o,a as n,b as c,e as s,d as i}from"./app.00e101e4.js";const l={},u=s(`<h2 id="channel" tabindex="-1"><a class="header-anchor" href="#channel" aria-hidden="true">#</a> channel</h2><p><code>goroutine</code>\u548C<code>goroutine</code>\u4E4B\u95F4\u7684\u901A\u9053\u5C31\u662F<code>channel</code>\u3002</p><p>\u5B9A\u4E49\u4E00\u4E2A<code>channel</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> c <span class="token keyword">chan</span> <span class="token builtin">int</span> <span class="token comment">// \u6B64\u65F6\u7684 c == nil \u4E0D\u53EF\u4EE5\u8FDB\u884C\u4F7F\u7528</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6240\u4EE5\u8FD8\u662F\u63A8\u8350\u4F7F\u7528<code>make</code>\u6765\u8FDB\u884C\u521B\u5EFA<code>channel</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>c <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u8BB0\u4F4F\u7B2C\u4E00\u53E5\u8BDD\uFF0C<code>channel</code>\u662F\u7528\u4E8E<code>goroutine</code>\u548C<code>goroutine</code>\u4E4B\u95F4\u7684\u901A\u4FE1\u7684\uFF0C\u5982\u679C\u7528\u5728\u548C\u522B\u7684\u5730\u65B9\u8FDB\u884C\u53D1\u9001\u6570\u636E\uFF0C\u5C31\u4F1A\u4EA7\u751F<code>panic</code>\u3002</p><p>\u53D1\u9001\u6570\u636E\u4F7F\u7528<code>&lt;-</code>\u7B26\u53F7\u6765\u8FDB\u884C\u53D1\u9001\u3002</p><div class="custom-container danger"><p class="custom-container-title">\u8B66\u544A</p><p>\u6CA1\u6709<code>-&gt;</code>\u8FD9\u4E2A\u7B26\u53F7\uFF01</p></div><ul><li><p>\u63A5\u6536\u6570\u636E\uFF0C\u53D8\u91CF\u5728<code>&lt;-</code>\u5DE6\u8FB9\uFF0C</p></li><li><p>\u53D1\u9001\u6570\u636E\uFF0C\u53D8\u91CF\u6216\u503C\u5728<code>&lt;-</code>\u53F3\u8FB9</p></li></ul><p><code>channel</code>\u548C\u51FD\u6570\u4E5F\u662F\u5C5E\u4E8E\u540C\u4E00\u7C7B\u7EA7\u522B\u7684\uFF0C\u65E2\u53EF\u4EE5\u505A\u53C2\u6570\uFF0C\u4E5F\u53EF\u4EE5\u505A\u8FD4\u56DE\u503C\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u8868\u660E \u6B64\u65B9\u6CD5\u662F\u7528\u6765\u53D1\u6570\u636E\u7684\uFF0C\u5982\u679C\u8BD5\u56FE\u53BB\u6536\u6570\u636E\u5C31\u4E0D\u5BF9\u4E86</span>
<span class="token keyword">func</span> <span class="token function">createWorker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token keyword">chan</span><span class="token operator">&lt;-</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	c <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>

    <span class="token comment">// \u771F\u6B63\u7684worker</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">for</span> <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Worker %d received %c\\n&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">,</span> <span class="token operator">&lt;-</span>c<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token comment">// \u4F1A\u7ACB\u523B\u5C31\u8FD4\u56DE</span>
	<span class="token keyword">return</span> c
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">chanDemo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// \u53EA\u80FD\u7528\u4E8E\u6536\u6570\u636E</span>
	<span class="token keyword">var</span> channels <span class="token punctuation">[</span><span class="token number">10</span><span class="token punctuation">]</span><span class="token keyword">chan</span><span class="token operator">&lt;-</span> <span class="token builtin">int</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		channels<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">createWorker</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		channels<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">&lt;-</span> <span class="token char">&#39;a&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		channels<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">&lt;-</span> <span class="token char">&#39;A&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">chanDemo</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>\u800C\u4E14\u6211\u4EEC\u53D1\u6570\u636E\uFF0C\u4E5F\u5FC5\u987B\u8981\u6709\u4E00\u4E2A\u4EBA\u6765\u6536\u6570\u636E\uFF0C\u5426\u5219\u4E5F\u4F1A\u62A5\u9519\u3002</strong></p><h3 id="\u52A0\u7F13\u51B2\u533A" tabindex="-1"><a class="header-anchor" href="#\u52A0\u7F13\u51B2\u533A" aria-hidden="true">#</a> \u52A0\u7F13\u51B2\u533A</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">worker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">,</span> c <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Worker %d received %d\\n&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">,</span> n<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">bufferedChannel</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
   <span class="token comment">// 3: \u7F13\u51B2\u533A</span>
   c <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span>

   <span class="token keyword">go</span> <span class="token function">worker</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> c<span class="token punctuation">)</span>

   c <span class="token operator">&lt;-</span> <span class="token char">&#39;a&#39;</span>
   c <span class="token operator">&lt;-</span> <span class="token char">&#39;b&#39;</span>
   c <span class="token operator">&lt;-</span> <span class="token char">&#39;c&#39;</span>
   c <span class="token operator">&lt;-</span> <span class="token char">&#39;d&#39;</span>

   time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u4E0D\u5E26\u7F13\u51B2\u533A\u7684 chan \u7EBF\u7A0B\u5199\u5165\u65F6\u4F1A\u7ACB\u9A6C\u53D1\u751F\u963B\u585E\uFF0C\u76F4\u5230\u6709\u5176\u4ED6\u7EBF\u7A0B\u6709\u5BF9\u8BE5 chan \u6267\u884C\u63A5\u6536\u64CD\u4F5C\u4E14\u63A5\u6536\u6210\u529F\u540E\uFF0C\u5199\u5165\u7684\u8FDB\u7A0B\u624D\u4F1A\u89E3\u9664\u963B\u585E\u3002 \u4E0D\u5E26\u7F13\u51B2\u533A\u7684 chan \u7EBF\u7A0B\u63A5\u6536\u65F6\u4E5F\u4F1A\u7ACB\u9A6C\u53D1\u751F\u963B\u585E\uFF0C\u76F4\u5230\u6709\u5176\u4ED6\u7EBF\u7A0B\u5BF9\u8BE5 chan \u6267\u884C\u5199\u5165\u64CD\u4F5C\u540E\uFF0C\u63A5\u6536\u7684\u7EBF\u7A0B\u624D\u4F1A\u89E3\u9664\u963B\u585E\u3002</p></blockquote><h3 id="\u5E26\u7F13\u51B2\u533A\u7684-channel" tabindex="-1"><a class="header-anchor" href="#\u5E26\u7F13\u51B2\u533A\u7684-channel" aria-hidden="true">#</a> \u5E26\u7F13\u51B2\u533A\u7684 channel:</h3><ul><li>\u5199\u5165\u963B\u585E\u6761\u4EF6:\u7F13\u51B2\u533A\u6EE1</li><li>\u53D6\u51FA\u963B\u585E\u6761\u4EF6\uFF1A\u7F13\u51B2\u533A\u6CA1\u6709\u6570\u636E</li></ul><h3 id="\u4E0D\u5E26\u7F13\u51B2\u533A\u7684-channel" tabindex="-1"><a class="header-anchor" href="#\u4E0D\u5E26\u7F13\u51B2\u533A\u7684-channel" aria-hidden="true">#</a> \u4E0D\u5E26\u7F13\u51B2\u533A\u7684 channel:</h3><ul><li>\u5199\u5165\u963B\u585E\u6761\u4EF6:\u540C\u4E00\u65F6\u95F4\u6CA1\u6709\u53E6\u5916\u4E00\u4E2A\u7EBF\u7A0B\u5BF9\u8BE5 chan \u8FDB\u884C\u8BFB\u64CD\u4F5C</li><li>\u53D6\u51FA\u963B\u585E\u6761\u4EF6:\u540C\u4E00\u65F6\u95F4\u6CA1\u6709\u53E6\u5916\u4E00\u4E2A\u7EBF\u7A0B\u5BF9\u8BE5 chan \u8FDB\u884C\u53D6\u64CD\u4F5C</li></ul><h3 id="\u4E3B\u52A8\u901A\u77E5\u53E6\u5916\u4E00\u4E2A-goroutine-\u8FDB\u884C\u5173\u95ED" tabindex="-1"><a class="header-anchor" href="#\u4E3B\u52A8\u901A\u77E5\u53E6\u5916\u4E00\u4E2A-goroutine-\u8FDB\u884C\u5173\u95ED" aria-hidden="true">#</a> \u4E3B\u52A8\u901A\u77E5\u53E6\u5916\u4E00\u4E2A goroutine \u8FDB\u884C\u5173\u95ED</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">channelClose</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	c <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>

	<span class="token keyword">go</span> <span class="token function">worker</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> c<span class="token punctuation">)</span>

	c <span class="token operator">&lt;-</span> <span class="token char">&#39;a&#39;</span>
	c <span class="token operator">&lt;-</span> <span class="token char">&#39;b&#39;</span>
	c <span class="token operator">&lt;-</span> <span class="token char">&#39;c&#39;</span>
	c <span class="token operator">&lt;-</span> <span class="token char">&#39;d&#39;</span>

	<span class="token comment">// \u544A\u8BC9\u63A5\u6536\u65B9\u53D1\u5B8C\u4E86</span>
	<span class="token function">close</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span>

	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u63A5\u6536\u65B9\u8FDB\u884C\u5224\u65AD\u7684\u4E24\u79CD\u65B9\u5F0F\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">worker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">,</span> c <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		n<span class="token punctuation">,</span> ok <span class="token operator">:=</span> <span class="token operator">&lt;-</span>c
		<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Worker %d received %d\\n&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">,</span> n<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">worker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">,</span> c <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span>
	<span class="token comment">// \u7B49\u5230c\u53D1\u5B8C\u5C31\u8DF3\u51FA\u6765</span>
	<span class="token keyword">for</span> n<span class="token operator">:=</span> <span class="token keyword">range</span> c <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Worker %d received %d\\n&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">,</span> n<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u53D1\u9001\u65B9\uFF0C\u4E0D\u4E3B\u52A8\u5173\u95ED\uFF0C\u63A5\u6536\u65B9\u8FD8\u52A0\u5224\u65AD\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">chanDemo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">//var c chan int	// c == nil</span>
	<span class="token keyword">var</span> channels <span class="token punctuation">[</span><span class="token number">10</span><span class="token punctuation">]</span><span class="token keyword">chan</span><span class="token operator">&lt;-</span> <span class="token builtin">int</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		channels<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">createWorker</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		channels<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">&lt;-</span> <span class="token char">&#39;a&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		channels<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">&lt;-</span> <span class="token char">&#39;A&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond<span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8C03\u7528\u8FD9\u4E2A\u51FD\u6570\uFF0C\u63A5\u6536\u65B9\u8FD8\u662F\u4F1A\u4E0D\u65AD\u7684\u5728\u8FDB\u884C\u6253\u5370\u8F93\u51FA\uFF0C\u4F46\u662F\u4F1A\u5728\u8FD9\u4E2A\u53D1\u9001\u65B9\u65F6\u95F4\u5230\u4E86\u7684\u65F6\u5019\u4E5F\u4F1A\u8FDB\u884C\u65AD\u6389\u3002\u6240\u4EE5\u63A5\u6536\u65B9\u52A0\u4E0D\u52A0\u65E0\u6240\u8C13\uFF0C\u4E3B\u8981\u8FD8\u662F\u53D6\u51B3\u4E8E\u53D1\u9001\u65B9\u3002</p><h3 id="\u7406\u8BBA\u57FA\u7840" tabindex="-1"><a class="header-anchor" href="#\u7406\u8BBA\u57FA\u7840" aria-hidden="true">#</a> \u7406\u8BBA\u57FA\u7840</h3><p><strong>Communication Sequentital Process</strong>\uFF0C\u7B80\u79F0 CSP \u6A21\u578B\u3002</p><p><code>Don&#39;t communicate by sharing memory;share memory by communicating.</code></p><blockquote><p>\u4E0D\u8981\u901A\u8FC7\u5171\u4EAB\u5185\u5B58\u6765\u901A\u4FE1\uFF1B\u901A\u8FC7\u901A\u4FE1\u6765\u5171\u4EAB\u5185\u5B58\u3002</p></blockquote>`,33),r={href:"https://www.jianshu.com/p/36e246c6153d",target:"_blank",rel:"noopener noreferrer"},d=i("https://www.jianshu.com/p/36e246c6153d"),k=s(`<h2 id="\u4F7F\u7528-channel-\u6765\u7B49\u5F85-goroutine-\u7684\u7ED3\u675F" tabindex="-1"><a class="header-anchor" href="#\u4F7F\u7528-channel-\u6765\u7B49\u5F85-goroutine-\u7684\u7ED3\u675F" aria-hidden="true">#</a> \u4F7F\u7528 channel \u6765\u7B49\u5F85 goroutine \u7684\u7ED3\u675F</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u8868\u660E \u6B64\u65B9\u6CD5\u662F\u7528\u6765\u53D1\u6570\u636E\u7684\uFF0C\u5982\u679C\u8BD5\u56FE\u53BB\u6536\u6570\u636E\u5C31\u4E0D\u5BF9\u4E86</span>
<span class="token keyword">func</span> <span class="token function">createWorker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">)</span> worker <span class="token punctuation">{</span>
	w <span class="token operator">:=</span> worker<span class="token punctuation">{</span>
		in<span class="token punctuation">:</span>   <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		done<span class="token punctuation">:</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">bool</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">go</span> <span class="token function">doWorker</span><span class="token punctuation">(</span>id<span class="token punctuation">,</span> w<span class="token punctuation">.</span>in<span class="token punctuation">,</span> w<span class="token punctuation">.</span>done<span class="token punctuation">)</span>

	<span class="token comment">// \u4F1A\u7ACB\u523B\u5C31\u8FD4\u56DE</span>
	<span class="token keyword">return</span> w
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">doWorker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">,</span> c <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> done <span class="token keyword">chan</span> <span class="token builtin">bool</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

	<span class="token comment">// \u7B49\u5230c\u53D1\u5B8C\u5C31\u8DF3\u51FA\u6765</span>
	<span class="token keyword">for</span> n <span class="token operator">:=</span> <span class="token keyword">range</span> c <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Worker %d received %d\\n&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">,</span> n<span class="token punctuation">)</span>
		<span class="token comment">// \u53BB\u5E76\u884C\u7684\u53D1</span>
		<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token comment">// \u901A\u77E5\u5916\u9762\u505A\u5B8C\u4E86</span>
			done <span class="token operator">&lt;-</span> <span class="token boolean">true</span>
		<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">type</span> worker <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	in   <span class="token keyword">chan</span> <span class="token builtin">int</span>
	done <span class="token keyword">chan</span> <span class="token builtin">bool</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">chanDemo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> workers <span class="token punctuation">[</span><span class="token number">10</span><span class="token punctuation">]</span>worker
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		workers<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">createWorker</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		workers<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>in <span class="token operator">&lt;-</span> <span class="token char">&#39;a&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		workers<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>in <span class="token operator">&lt;-</span> <span class="token char">&#39;A&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	<span class="token comment">// wait for all of theme</span>
	<span class="token comment">// \u5E76\u884C\u7684\u653620\u4E2Adone</span>
	<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> worker <span class="token operator">:=</span> <span class="token keyword">range</span> workers <span class="token punctuation">{</span>
		<span class="token operator">&lt;-</span>worker<span class="token punctuation">.</span>done
		<span class="token operator">&lt;-</span>worker<span class="token punctuation">.</span>done
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">chanDemo</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4E0A\u9762\u8FD9\u4E2A\u53EF\u4EE5\u4F7F\u7528<code>sync</code>\u5305\u7684<code>WaitGroup</code>\u6765\u5B9E\u73B0</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u8868\u660E \u6B64\u65B9\u6CD5\u662F\u7528\u6765\u53D1\u6570\u636E\u7684\uFF0C\u5982\u679C\u8BD5\u56FE\u53BB\u6536\u6570\u636E\u5C31\u4E0D\u5BF9\u4E86</span>
<span class="token keyword">func</span> <span class="token function">createWorker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">,</span> wg <span class="token operator">*</span>sync<span class="token punctuation">.</span>WaitGroup<span class="token punctuation">)</span> worker <span class="token punctuation">{</span>
	w <span class="token operator">:=</span> worker<span class="token punctuation">{</span>
		in<span class="token punctuation">:</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		wg<span class="token punctuation">:</span> wg<span class="token punctuation">,</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">go</span> <span class="token function">doWorker</span><span class="token punctuation">(</span>id<span class="token punctuation">,</span> w<span class="token punctuation">.</span>in<span class="token punctuation">,</span> wg<span class="token punctuation">)</span>

	<span class="token comment">// \u4F1A\u7ACB\u523B\u5C31\u8FD4\u56DE</span>
	<span class="token keyword">return</span> w
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">doWorker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">,</span> c <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> wg <span class="token operator">*</span>sync<span class="token punctuation">.</span>WaitGroup<span class="token punctuation">)</span> <span class="token punctuation">{</span>

	<span class="token comment">// \u7B49\u5230c\u53D1\u5B8C\u5C31\u8DF3\u51FA\u6765</span>
	<span class="token keyword">for</span> n <span class="token operator">:=</span> <span class="token keyword">range</span> c <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Worker %d received %c\\n&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">,</span> n<span class="token punctuation">)</span>
		<span class="token comment">// \u53BB\u5E76\u884C\u7684\u53D1</span>
		<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token comment">// \u901A\u77E5\u5916\u9762\u505A\u5B8C\u4E86</span>
			wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">type</span> worker <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	in <span class="token keyword">chan</span> <span class="token builtin">int</span>
	wg <span class="token operator">*</span>sync<span class="token punctuation">.</span>WaitGroup
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">chanDemo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> workers <span class="token punctuation">[</span><span class="token number">10</span><span class="token punctuation">]</span>worker
	<span class="token keyword">var</span> wg sync<span class="token punctuation">.</span>WaitGroup

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		workers<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">createWorker</span><span class="token punctuation">(</span>i<span class="token punctuation">,</span> <span class="token operator">&amp;</span>wg<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// \u52A020\u4E2A\u4EFB\u52A1\u8FDB\u884C\u7B49\u5F85</span>
	wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">20</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		workers<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>in <span class="token operator">&lt;-</span> <span class="token char">&#39;a&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		workers<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>in <span class="token operator">&lt;-</span> <span class="token char">&#39;A&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">chanDemo</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u518D\u4F7F\u7528\u51FD\u6570\u5F0F\u7F16\u7A0B\u8FDB\u884C\u4F18\u5316</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;sync&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u8868\u660E \u6B64\u65B9\u6CD5\u662F\u7528\u6765\u53D1\u6570\u636E\u7684\uFF0C\u5982\u679C\u8BD5\u56FE\u53BB\u6536\u6570\u636E\u5C31\u4E0D\u5BF9\u4E86</span>
<span class="token keyword">func</span> <span class="token function">createWorker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">,</span> wg <span class="token operator">*</span>sync<span class="token punctuation">.</span>WaitGroup<span class="token punctuation">)</span> worker <span class="token punctuation">{</span>
	w <span class="token operator">:=</span> worker<span class="token punctuation">{</span>
		in<span class="token punctuation">:</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
		done<span class="token punctuation">:</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span><span class="token punctuation">,</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">go</span> <span class="token function">doWorker</span><span class="token punctuation">(</span>id<span class="token punctuation">,</span> w<span class="token punctuation">)</span>

	<span class="token comment">// \u4F1A\u7ACB\u523B\u5C31\u8FD4\u56DE</span>
	<span class="token keyword">return</span> w
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">doWorker</span><span class="token punctuation">(</span>id <span class="token builtin">int</span><span class="token punctuation">,</span> w worker<span class="token punctuation">)</span> <span class="token punctuation">{</span>

	<span class="token comment">// \u7B49\u5230c\u53D1\u5B8C\u5C31\u8DF3\u51FA\u6765</span>
	<span class="token keyword">for</span> n <span class="token operator">:=</span> <span class="token keyword">range</span> w<span class="token punctuation">.</span>in <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;Worker %d received %c\\n&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">,</span> n<span class="token punctuation">)</span>
		<span class="token comment">// \u53BB\u5E76\u884C\u7684\u53D1</span>
		<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token comment">// \u901A\u77E5\u5916\u9762\u505A\u5B8C\u4E86</span>
			w<span class="token punctuation">.</span><span class="token function">done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">type</span> worker <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	in <span class="token keyword">chan</span> <span class="token builtin">int</span>
	done <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">chanDemo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> workers <span class="token punctuation">[</span><span class="token number">10</span><span class="token punctuation">]</span>worker
	<span class="token keyword">var</span> wg sync<span class="token punctuation">.</span>WaitGroup

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		workers<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">createWorker</span><span class="token punctuation">(</span>i<span class="token punctuation">,</span> <span class="token operator">&amp;</span>wg<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// \u52A020\u4E2A\u4EFB\u52A1\u8FDB\u884C\u7B49\u5F85</span>
	wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">20</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		workers<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>in <span class="token operator">&lt;-</span> <span class="token char">&#39;a&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		workers<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>in <span class="token operator">&lt;-</span> <span class="token char">&#39;A&#39;</span> <span class="token operator">+</span> i
	<span class="token punctuation">}</span>

	wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">chanDemo</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u4F7F\u7528-channel-\u6765\u5B9E\u73B0\u6811\u7684\u904D\u5386" tabindex="-1"><a class="header-anchor" href="#\u4F7F\u7528-channel-\u6765\u5B9E\u73B0\u6811\u7684\u904D\u5386" aria-hidden="true">#</a> \u4F7F\u7528 channel \u6765\u5B9E\u73B0\u6811\u7684\u904D\u5386</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> tree

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>node <span class="token operator">*</span>Node<span class="token punctuation">)</span> <span class="token function">Traverse</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	node<span class="token punctuation">.</span><span class="token function">TraverseFunc</span><span class="token punctuation">(</span><span class="token keyword">func</span><span class="token punctuation">(</span>n <span class="token operator">*</span>Node<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		n<span class="token punctuation">.</span><span class="token function">Print</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>node <span class="token operator">*</span>Node<span class="token punctuation">)</span> <span class="token function">TraverseFunc</span><span class="token punctuation">(</span>f <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token operator">*</span>Node<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">if</span> node <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	<span class="token comment">// \u4E2D\u5E8F\u904D\u5386 \u5DE6\u4E2D\u53F3</span>
	node<span class="token punctuation">.</span>Left<span class="token punctuation">.</span><span class="token function">TraverseFunc</span><span class="token punctuation">(</span>f<span class="token punctuation">)</span>
	<span class="token function">f</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span>
	node<span class="token punctuation">.</span>Right<span class="token punctuation">.</span><span class="token function">TraverseFunc</span><span class="token punctuation">(</span>f<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>node <span class="token operator">*</span>Node<span class="token punctuation">)</span> <span class="token function">TraverseWithChannel</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">chan</span> <span class="token operator">*</span>Node <span class="token punctuation">{</span>
	out <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token operator">*</span>Node<span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		node<span class="token punctuation">.</span><span class="token function">TraverseFunc</span><span class="token punctuation">(</span><span class="token keyword">func</span><span class="token punctuation">(</span>node <span class="token operator">*</span>Node<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// \u4F7F\u7528 out \u6765\u53D1\u9001\u4E00\u4E2A node \u8282\u70B9</span>
			out <span class="token operator">&lt;-</span> node
		<span class="token punctuation">}</span><span class="token punctuation">)</span>
		<span class="token comment">// \u904D\u5386\u5B8C</span>
		<span class="token function">close</span><span class="token punctuation">(</span>out<span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">return</span> out
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    root <span class="token operator">:=</span> myTreeNode<span class="token punctuation">{</span><span class="token operator">&amp;</span>tree<span class="token punctuation">.</span>Node<span class="token punctuation">{</span>Value<span class="token punctuation">:</span> <span class="token number">3</span><span class="token punctuation">}</span><span class="token punctuation">}</span>
	root<span class="token punctuation">.</span>Left <span class="token operator">=</span> <span class="token operator">&amp;</span>tree<span class="token punctuation">.</span>Node<span class="token punctuation">{</span><span class="token punctuation">}</span>
	root<span class="token punctuation">.</span>Right <span class="token operator">=</span> <span class="token operator">&amp;</span>tree<span class="token punctuation">.</span>Node<span class="token punctuation">{</span>Value<span class="token punctuation">:</span> <span class="token number">5</span><span class="token punctuation">}</span>
	root<span class="token punctuation">.</span>Right<span class="token punctuation">.</span>Left <span class="token operator">=</span> <span class="token function">new</span><span class="token punctuation">(</span>tree<span class="token punctuation">.</span>Node<span class="token punctuation">)</span>
	root<span class="token punctuation">.</span>Left<span class="token punctuation">.</span>Right <span class="token operator">=</span> tree<span class="token punctuation">.</span><span class="token function">CreateNode</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>

	root<span class="token punctuation">.</span>Right<span class="token punctuation">.</span>Left<span class="token punctuation">.</span><span class="token function">SetValue</span><span class="token punctuation">(</span><span class="token number">4</span><span class="token punctuation">)</span>

	root<span class="token punctuation">.</span>Node<span class="token punctuation">.</span><span class="token function">Traverse</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

    c <span class="token operator">:=</span> root<span class="token punctuation">.</span><span class="token function">TraverseWithChannel</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	maxNode <span class="token operator">:=</span> <span class="token number">0</span>
	<span class="token keyword">for</span> node <span class="token operator">:=</span> <span class="token keyword">range</span> c <span class="token punctuation">{</span>
		<span class="token keyword">if</span> node<span class="token punctuation">.</span>Value <span class="token operator">&gt;</span> maxNode <span class="token punctuation">{</span>
			maxNode <span class="token operator">=</span> node<span class="token punctuation">.</span>Value
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;max node value is &quot;</span><span class="token punctuation">,</span> maxNode<span class="token punctuation">)</span> <span class="token comment">// 5</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="channel-\u96F6\u503C" tabindex="-1"><a class="header-anchor" href="#channel-\u96F6\u503C" aria-hidden="true">#</a> channel \u96F6\u503C</h2><p>\u672A\u521D\u59CB\u5316\u7684\u901A\u9053\u7C7B\u578B\u53D8\u91CF\u5176\u9ED8\u8BA4\u96F6\u503C\u662F<code>nil</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> ch <span class="token keyword">chan</span> <span class="token builtin">int</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span> <span class="token comment">// nil</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u521D\u59CB\u5316 channel</p></blockquote><p>\u58F0\u660E\u7684\u901A\u9053\u7C7B\u578B\u53D8\u91CF\u9700\u8981\u4F7F\u7528\u5185\u7F6E\u7684<code>make</code>\u51FD\u6570\u521D\u59CB\u5316\u4E4B\u540E\u624D\u80FD\u4F7F\u7528</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> \u5143\u7D20\u7C7B\u578B<span class="token punctuation">.</span> \u7F13\u5B58\u5927\u5C0F<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li><code>channel</code>\u7684\u7F13\u5B58\u5927\u5C0F\u662F\u53EF\u9009\u7684</li></ul><blockquote><p>channel \u7684\u64CD\u4F5C</p><ul><li>\u53D1\u9001(send)</li><li>\u63A5\u6536(receive)</li><li>\u5173\u95ED(close)</li></ul></blockquote><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u53D1\u9001\u548C\u63A5\u6536\u90FD\u4F7F\u7528\u4E00\u4E2A\u7B26\u53F7\uFF1A<code>&lt;-</code></p></div><h3 id="\u53D1\u9001" tabindex="-1"><a class="header-anchor" href="#\u53D1\u9001" aria-hidden="true">#</a> \u53D1\u9001</h3><p>\u5C06\u4E00\u4E2A\u503C\u53D1\u9001\u5230\u901A\u9053\u4E2D</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>ch <span class="token operator">&lt;-</span> <span class="token number">10</span> <span class="token comment">// \u628A10\u53D1\u9001\u5230ch</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="\u63A5\u6536" tabindex="-1"><a class="header-anchor" href="#\u63A5\u6536" aria-hidden="true">#</a> \u63A5\u6536</h3><p>\u4ECE\u901A\u9053\u91CC\u63A5\u6536\u4E00\u4E2A\u503C</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>x <span class="token operator">:=</span> <span class="token operator">&lt;-</span> ch <span class="token comment">// \u4ECEch\u4E2D\u63A5\u6536\u503C\u5E76\u8D4B\u503C\u7ED9\u53D8\u91CFx</span>
<span class="token operator">&lt;-</span>ch <span class="token comment">// \u4ECEch\u4E2D\u63A5\u6536\u503C\uFF0C\u5FFD\u7565\u7ED3\u679C\uFF0C\u76F4\u63A5\u4E22\u5F03</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u5173\u95ED" tabindex="-1"><a class="header-anchor" href="#\u5173\u95ED" aria-hidden="true">#</a> \u5173\u95ED</h3><p>\u6211\u4EEC\u901A\u8FC7\u8C03\u7528\u5185\u7F6E\u7684<code>close</code>\u51FD\u6570\u6765\u5173\u95ED\u901A\u9053</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token function">close</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u6CE8\u610F</p><p>\u53EA\u6709\u5728\u901A\u77E5\u63A5\u6536\u65B9 goroutine \u6240\u6709\u7684\u6570\u636E\u90FD\u53D1\u9001\u5B8C\u6BD5\u7684\u65F6\u5019\uFF0C\u624D\u9700\u8981\u5173\u95ED\u901A\u9053\u3002\u4E00\u4E2A\u901A\u9053\u7684\u503C\u662F\u53EF\u4EE5\u88AB\u5783\u573E\u56DE\u6536\u673A\u5236\u56DE\u6536\u7684\uFF0C\u4ED6\u548C\u5173\u95ED\u6587\u4EF6\u4E0D\u4E00\u6837\uFF0C\u901A\u5E38\u5728\u7ED3\u675F\u64CD\u4F5C\u540E\u5173\u95ED\u6587\u4EF6\u65F6\u5FC5\u987B\u8981\u505A\u7684\uFF0C\u4F46\u5173\u95ED\u901A\u9053\u4E0D\u662F\u5FC5\u987B\u7684\u3002</p></div><p>\u5173\u95ED\u540E\u7684\u901A\u9053\u6709\u4EE5\u4E0B\u7279\u70B9\uFF1A</p><ol><li>\u5BF9\u4E00\u4E2A\u5173\u95ED\u7684\u901A\u9053\u518D\u53D1\u9001\u503C\u5C31\u4F1A\u5BFC\u81F4<code>panic</code></li><li>\u5BF9\u4E00\u4E2A\u5173\u95ED\u7684\u901A\u9053\u8FDB\u884C\u63A5\u6536\u4F1A\u4E00\u76F4\u83B7\u53D6\u503C\u76F4\u5230\u901A\u9053\u4E3A\u7A7A</li><li>\u5BF9\u4E00\u4E2A\u5173\u95ED\u7684\u4E14\u6CA1\u6709\u503C\u7684\u901A\u9053\u6267\u884C\u63A5\u6536\u64CD\u4F5C\u4F1A\u5F97\u5230\u5BF9\u5E94\u7684\u7C7B\u578B\u7684\u96F6\u503C</li><li>\u5173\u95ED\u4E00\u4E2A\u4EE5\u53CA\u5173\u95ED\u7684\u901A\u9053\u4F1A\u5BFC\u81F4<code>panic</code></li></ol><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">f3</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span>
	ch <span class="token operator">&lt;-</span> <span class="token number">1</span>
	ch <span class="token operator">&lt;-</span> <span class="token number">2</span>
	<span class="token function">close</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>
	<span class="token function">f2</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">f2</span><span class="token punctuation">(</span>ch <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		v<span class="token punctuation">,</span> ok <span class="token operator">:=</span> <span class="token operator">&lt;-</span>ch
		<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u901A\u9053\u5DF2\u5173\u95ED&quot;</span><span class="token punctuation">)</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;v:%#v ok:%#v\\n&quot;</span><span class="token punctuation">,</span> v<span class="token punctuation">,</span> ok<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">f3</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u8FD9\u4E2A<code>for</code>\u5FAA\u73AF\u63A5\u6536\u5B8C 1 \u548C 2 \u4E4B\u540E\uFF0C\u5982\u679C\u4E0D\u662F\u4EE5<code>ok</code>\u65B9\u5F0F\u6765\u5224\u65AD\u9000\u51FA\uFF0C\u5426\u5219\u4E00\u76F4\u5FAA\u73AF\u63A5\u6536\u5230\u5173\u95ED\u7684\u901A\u9053\u7684\u96F6\u503C\u3002</p><p>\u6211\u4EEC\u4E5F\u53EF\u4EE5\u4F7F\u7528<code>for range</code>\u6765\u66FF\u4EE3\uFF0C\u5F53\u901A\u9053\u5173\u95ED\u540E\uFF0C\u4F1A\u5728\u901A\u9053\u5185\u7684\u6240\u6709\u503C\u88AB\u63A5\u6536\u5B8C\u540E\u81EA\u52A8\u9000\u51FA\u5FAA\u73AF</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">f1</span><span class="token punctuation">(</span>ch <span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span>
	<span class="token keyword">for</span> v <span class="token operator">:=</span> <span class="token keyword">range</span> ch <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u4F7F\u7528<code>go range</code>\u65F6\uFF0Cgo \u8BED\u8A00\u7F16\u8BD1\u5668\u4F1A\u5E2E\u4F60\u5224\u65AD\u8FD9\u4E2A\u901A\u9053\u662F\u5426\u5173\u95ED\u6765\u7ED3\u675F\u5FAA\u73AF\u3002</p></div><h2 id="\u5355\u5411\u901A\u9053" tabindex="-1"><a class="header-anchor" href="#\u5355\u5411\u901A\u9053" aria-hidden="true">#</a> \u5355\u5411\u901A\u9053</h2><blockquote><p>\u5728\u67D0\u4E9B\u573A\u666F\u4E0B\u6211\u4EEC\u53EF\u80FD\u4F1A\u5C06\u901A\u9053\u4F5C\u4E3A\u53C2\u6570\u5728\u591A\u4E2A\u4EFB\u52A1\u51FD\u6570\u4E4B\u95F4\u8FDB\u884C\u4F20\u9012\uFF0C\u901A\u5E38\u6211\u4EEC\u4F1A\u9009\u62E9\u5728\u4E0D\u540C\u7684\u4EFB\u52A1\u51FD\u6570\u4E2D\u5BF9\u901A\u9053\u7684\u4F7F\u7528\u8FDB\u884C\u9650\u5236\uFF0C\u6BD4\u5982\u9650\u5236\u901A\u9053\u5728\u67D0\u4E2A\u51FD\u6570\u4E2D\u53EA\u80FD\u6267\u884C\u53D1\u9001\u6216\u53EA\u80FD\u6267\u884C\u63A5\u6536\u64CD\u4F5C\u3002</p><p>\u73B0\u5728\u6709\u4E00\u4E2A<code>Producer</code>\u548C<code>Consumer</code>\u4E24\u4E2A\u51FD\u6570\uFF0C\u5176\u5B9E<code>Producer</code>\u51FD\u6570\u4F1A\u8FD4\u56DE\u4E00\u4E2A\u901A\u9053\uFF0C\u5E76\u4E14\u4F1A\u6301\u7EED\u5C06\u7B26\u5408\u6761\u4EF6\u7684\u6570\u636E\u53D1\u9001\u81F3\u8BE5\u901A\u9053\uFF0C\u5E76\u5728\u53D1\u9001\u5B8C\u6210\u540E\u5C06\u8BE5\u901A\u9053\u5173\u95ED\u3002<code>Consumer</code>\u51FD\u6570\u7684\u4EFB\u52A1\u662F\u4ECE\u901A\u9053\u4E2D\u63A5\u6536\u503C\u5E76\u8FDB\u884C\u8BA1\u7B97\uFF0C\u8FD9 2 \u4E2A\u51FD\u6570\u4E4B\u95F4\u901A\u8FC7<code>Processer</code>\u51FD\u6570\u5C06\u8FD4\u56DE\u7684\u901A\u9053\u8FDB\u884C\u901A\u4FE1\u3002</p></blockquote><div class="custom-container info"><p class="custom-container-title">\u76F8\u5173\u4FE1\u606F</p><p>\u5F53\u4E00\u4E2A\u51FD\u6570\u7684\u8FD4\u56DE\u503C\u662F\u4E00\u4E2A\u901A\u9053\u65F6\uFF0C\u63A5\u6536\u7684\u65F6\u5019\u901A\u5E38\u4F7F\u7528<code>vCh</code>\u52A0\u4E0A<code>ch</code>\u540E\u7F00\u6765\u8BC6\u522B\uFF0C\u8868\u660E\u5B83\u662F\u4E00\u4E2A\u901A\u9053\u7C7B\u578B\u7684\u53D8\u91CF\u3002</p></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token comment">// \u5355\u5411\u901A\u9053</span>
<span class="token comment">// \u8981\u4E48\u63A5\u6536\u8981\u4E48\u53D1\u9001</span>

<span class="token keyword">func</span> <span class="token function">Producer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">chan</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
			<span class="token comment">// \u7B5B\u9009\u51FA\u6EE1\u8DB3\u6761\u4EF6\u7684\u503C\u53D1\u9001\u5230\u901A\u9053\u4E2D</span>
			<span class="token keyword">if</span> i<span class="token operator">%</span><span class="token number">2</span> <span class="token operator">==</span> <span class="token number">1</span> <span class="token punctuation">{</span>
				ch <span class="token operator">&lt;-</span> i
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
		<span class="token comment">// \u4EFB\u52A1\u5173\u95ED\u540E\u5173\u95ED\u901A\u9053</span>
		<span class="token function">close</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token keyword">return</span> ch
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	vCh <span class="token operator">:=</span> <span class="token function">Producer</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token comment">// \u6B64\u65F6\u5C31\u4E0D\u80FD\u9650\u5236\u5B83\u8FDB\u884C\u53D1\u9001\u6570\u636E\uFF0C\u4F46\u662F\u4E8B\u5B9E\u4E0A\u8FD9\u91CC\u4E0D\u80FD\u8FDB\u884C\u53D1\u9001</span>
	vCh <span class="token operator">&lt;-</span> <span class="token number">10</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u6211\u4EEC\u53EF\u4EE5\u7ED9\u51FD\u6570\u7684\u8FD4\u56DE\u503C\u52A0\u4E0A\u9650\u5236\u5B83\u53EA\u80FD\u63A5\u6536\u64CD\u4F5C</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">Producer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;-</span><span class="token keyword">chan</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
			<span class="token comment">// \u7B5B\u9009\u51FA\u6EE1\u8DB3\u6761\u4EF6\u7684\u503C\u53D1\u9001\u5230\u901A\u9053\u4E2D</span>
			<span class="token keyword">if</span> i<span class="token operator">%</span><span class="token number">2</span> <span class="token operator">==</span> <span class="token number">1</span> <span class="token punctuation">{</span>
				ch <span class="token operator">&lt;-</span> i
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
		<span class="token comment">// \u4EFB\u52A1\u5173\u95ED\u540E\u5173\u95ED\u901A\u9053</span>
		<span class="token function">close</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token keyword">return</span> ch
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6B64\u65F6\uFF0C\u5C31\u4E0D\u80FD\u518D\u5F80<code>ch</code>\u91CC\u53D1\u9001\u5185\u5BB9\u3002</p><p>\u4F7F\u7528\u5355\u5411\u901A\u9053\u53EF\u4EE5\u89E3\u51B3\u6211\u4EEC\u64CD\u4F5C\u4E0D\u89C4\u8303\u7684\u573A\u666F\uFF0C\u4ECE\u4EE3\u7801\u5C42\u53BB\u9650\u5236\u53EA\u80FD\u53BB\u63A5\u6536\u6216\u8005\u53D1\u9001\uFF0C\u9632\u6B62\u53D1\u9001\u65B9\u5173\u95ED\u4E86\u901A\u9053\uFF0C\u63A5\u6536\u65B9\u8FD8\u7EE7\u7EED\u5F80\u91CC\u53D1\u9001\u6570\u636E\u5BFC\u81F4<code>panic</code></p><ul><li><code>&lt;- chan int</code>\uFF1A\u53EA\u63A5\u6536\u901A\u9053\uFF0C\u53EA\u80FD\u63A5\u6536\u4E0D\u80FD\u53D1\u9001</li><li><code>chan &lt;- int</code>\uFF1A\u53EA\u53D1\u9001\u901A\u9053\uFF0C\u53EA\u80FD\u53D1\u9001\u4E0D\u80FD\u63A5\u6536</li></ul><blockquote><p>\u8FD9\u79CD\u9650\u5236\u4F1A\u5728\u7F16\u8BD1\u9636\u6BB5\u8FDB\u884C\u68C0\u6D4B</p></blockquote><div class="custom-container warning"><p class="custom-container-title">\u6CE8\u610F</p><p>\u53EF\u4EE5\u628A\u6B63\u5E38\u901A\u9053\u8F6C\u6362\u4E3A\u5355\u5411\u901A\u9053\uFF0C\u4F46\u662F\u65E0\u6CD5\u53CD\u5411\u8F6C\u6362\u3002</p></div><p>\u5B8C\u6574\u6848\u4F8B\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token comment">// \u5355\u5411\u901A\u9053</span>
<span class="token comment">// \u8981\u4E48\u63A5\u6536\u8981\u4E48\u53D1\u9001</span>

<span class="token keyword">func</span> <span class="token function">Producer</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;-</span><span class="token keyword">chan</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	ch <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span>
    <span class="token comment">// \u5F00\u4E00\u4E2Agoroutine \u540E\u53F0\u6301\u7EEDfor\u5FAA\u73AF\u53D1\u9001\u6570\u636E</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
			<span class="token comment">// \u7B5B\u9009\u51FA\u6EE1\u8DB3\u6761\u4EF6\u7684\u503C\u53D1\u9001\u5230\u901A\u9053\u4E2D</span>
			<span class="token keyword">if</span> i<span class="token operator">%</span><span class="token number">2</span> <span class="token operator">==</span> <span class="token number">1</span> <span class="token punctuation">{</span>
				ch <span class="token operator">&lt;-</span> i
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
		<span class="token comment">// \u4EFB\u52A1\u5173\u95ED\u540E\u5173\u95ED\u901A\u9053</span>
		<span class="token function">close</span><span class="token punctuation">(</span>ch<span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

    <span class="token comment">// \u51FD\u6570\u5148\u8FD4\u56DE</span>
	<span class="token keyword">return</span> ch
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">Consumer</span><span class="token punctuation">(</span>ch <span class="token operator">&lt;-</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
	sum <span class="token operator">:=</span> <span class="token number">0</span>
	<span class="token keyword">for</span> v <span class="token operator">:=</span> <span class="token keyword">range</span> ch <span class="token punctuation">{</span>
		sum <span class="token operator">+=</span> v
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> sum
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	vCh <span class="token operator">:=</span> <span class="token function">Producer</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	res <span class="token operator">:=</span> <span class="token function">Consumer</span><span class="token punctuation">(</span>vCh<span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>res<span class="token punctuation">)</span> <span class="token comment">// 25</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u7EC3\u4E60" tabindex="-1"><a class="header-anchor" href="#\u7EC3\u4E60" aria-hidden="true">#</a> \u7EC3\u4E60</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;math/rand&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">randomData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u8BBE\u7F6E\u968F\u673A\u56E0\u5B50</span>
	rand<span class="token punctuation">.</span><span class="token function">Seed</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Unix</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	v <span class="token operator">:=</span> rand<span class="token punctuation">.</span><span class="token function">Int63</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// 2\u4E2Achannel</span>
<span class="token comment">// \u4E24\u4E2A\u4EFB\u52A1\uFF1A\u751F\u6210\u968F\u673A\u6570\u7684\u3001\u8BA1\u7B97\u548C\u7684</span>

<span class="token comment">// ProduceRandomData \u751F\u4EA7int64\u7684\u968F\u673A\u6570</span>
<span class="token keyword">func</span> <span class="token function">ProduceRandomData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;-</span><span class="token keyword">chan</span> <span class="token builtin">int64</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> jobChan <span class="token operator">=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int64</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span>
	rand<span class="token punctuation">.</span><span class="token function">Seed</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Unix</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

	<span class="token comment">// \u5728\u540E\u53F0\u4E00\u76F4\u4EA7\u751F\u968F\u673A\u6570\u653E\u5165\u901A\u9053</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token comment">// \u6E90\u6E90\u4E0D\u65AD\u7684\u4EA7\u751F\u968F\u673A\u6570</span>
		<span class="token keyword">for</span> <span class="token punctuation">{</span>
			v <span class="token operator">:=</span> rand<span class="token punctuation">.</span><span class="token function">Intn</span><span class="token punctuation">(</span><span class="token number">9999</span><span class="token punctuation">)</span>
			jobChan <span class="token operator">&lt;-</span> <span class="token function">int64</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token comment">// \u6700\u540E\u8FD4\u56DE\u901A\u9053</span>
	<span class="token keyword">return</span> jobChan
<span class="token punctuation">}</span>

<span class="token keyword">type</span> result <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	number <span class="token builtin">int64</span>
	sum    <span class="token builtin">int64</span>
<span class="token punctuation">}</span>

<span class="token comment">// Sum \u4ECEjobChan\u83B7\u53D6\u6570\u636E,\u8BA1\u7B97\u548C\u53D1\u9001\u5230resultChan\u91CC</span>
<span class="token keyword">func</span> <span class="token function">Sum</span><span class="token punctuation">(</span>ch <span class="token operator">&lt;-</span><span class="token keyword">chan</span> <span class="token builtin">int64</span><span class="token punctuation">,</span> resultChan <span class="token keyword">chan</span> result<span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u5FAA\u73AF\u7684\u4ECEch\u53D6\u503C\u53BB\u8BA1\u7B97\u548C</span>
	<span class="token keyword">for</span> v <span class="token operator">:=</span> <span class="token keyword">range</span> ch<span class="token punctuation">{</span>
		r <span class="token operator">:=</span> result<span class="token punctuation">{</span>
			number<span class="token punctuation">:</span> v<span class="token punctuation">,</span> <span class="token comment">// \u539F\u59CB\u6570\u5B57\u8BB0\u5F55</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">var</span> res <span class="token builtin">int64</span> <span class="token operator">=</span> <span class="token number">0</span>
		<span class="token keyword">for</span> v <span class="token operator">&gt;</span> <span class="token number">0</span> <span class="token punctuation">{</span>
			res <span class="token operator">+=</span> v <span class="token operator">%</span> <span class="token number">10</span>
			v <span class="token operator">/=</span> <span class="token number">10</span>
		<span class="token punctuation">}</span>
		<span class="token comment">// \u628A\u7B97\u51FA\u6765\u7684\u7ED3\u679C\u8BB0\u5F55</span>
		r<span class="token punctuation">.</span>sum <span class="token operator">=</span> res
		resultChan <span class="token operator">&lt;-</span> r
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	resChan <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> result<span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">)</span>
	jobChan <span class="token operator">:=</span> <span class="token function">ProduceRandomData</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token comment">// \u5F00\u542F24\u4E2Agoroutine\u5E72\u6D3B\u6C42\u548C</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">24</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
		<span class="token keyword">go</span> <span class="token function">Sum</span><span class="token punctuation">(</span>jobChan<span class="token punctuation">,</span> resChan<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// \u4ECE resChan \u91CC\u63A5\u6536\u503C\uFF0C\u6253\u5370\u7ED3\u679C</span>
	<span class="token keyword">for</span> res <span class="token operator">:=</span> <span class="token keyword">range</span> resChan <span class="token punctuation">{</span>
		time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Second<span class="token punctuation">)</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;\u6570\u5B57: %v, \u548C: %d\\n&quot;</span><span class="token punctuation">,</span> res<span class="token punctuation">.</span>number<span class="token punctuation">,</span> res<span class="token punctuation">.</span>sum<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u603B\u7ED3" tabindex="-1"><a class="header-anchor" href="#\u603B\u7ED3" aria-hidden="true">#</a> \u603B\u7ED3</h2><p><code>channel</code>\u5F02\u5E38\u60C5\u51B5\u603B\u7ED3</p><table><thead><tr><th style="text-align:left;">channel</th><th style="text-align:center;">nil(\u6CA1\u6709 make \u521D\u59CB\u5316)</th><th style="text-align:center;">\u975E\u7A7A(\u6709\u503C)</th><th style="text-align:center;">\u7A7A\u7684</th><th style="text-align:center;">\u6EE1\u4E86</th><th style="text-align:center;">\u6CA1\u6EE1(\u7F13\u51B2\u533A\u6CA1\u6EE1)</th></tr></thead><tbody><tr><td style="text-align:left;">\u63A5\u6536</td><td style="text-align:center;">\u963B\u585E</td><td style="text-align:center;">\u63A5\u6536\u503C</td><td style="text-align:center;">\u963B\u585E</td><td style="text-align:center;">\u63A5\u6536\u503C</td><td style="text-align:center;">\u63A5\u6536\u503C</td></tr><tr><td style="text-align:left;">\u53D1\u9001</td><td style="text-align:center;">\u963B\u585E</td><td style="text-align:center;">\u53D1\u9001\u503C</td><td style="text-align:center;">\u53D1\u9001\u503C</td><td style="text-align:center;">\u963B\u585E</td><td style="text-align:center;">\u53D1\u9001\u503C</td></tr><tr><td style="text-align:left;">\u5173\u95ED</td><td style="text-align:center;">panic</td><td style="text-align:center;">\u5173\u95ED\u6210\u529F\uFF0C\u8BFB\u5B8C\u6570\u636E\u540E\u8FD4\u56DE\u96F6\u503C</td><td style="text-align:center;">\u5173\u95ED\u6210\u529F\uFF0C\u8FD4\u56DE\u96F6\u503C</td><td style="text-align:center;">\u5173\u95ED\u6210\u529F\uFF0C\u8BFB\u5B8C\u6570\u636E\u540E\u8FD4\u56DE\u96F6\u503C</td><td style="text-align:center;">\u5173\u95ED\u6210\u529F\uFF0C\u8BFB\u5B8C\u6570\u636E\u540E\u8FD4\u56DE\u96F6\u503C</td></tr></tbody></table><div class="custom-container danger"><p class="custom-container-title">\u6CE8\u610F</p><p>\u5BF9\u5DF2\u7ECF\u5173\u95ED\u7684\u901A\u9053\u518D\u6267\u884C<code>close</code>\u4E5F\u4F1A\u5F15\u53D1<code>panic</code></p></div>`,54);function v(m,b){const a=e("ExternalLinkIcon");return p(),o("div",null,[u,n("p",null,[n("a",r,[d,c(a)])]),k])}var f=t(l,[["render",v],["__file","go-channel.html.vue"]]);export{f as default};
