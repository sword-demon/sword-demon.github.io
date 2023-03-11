import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.26aaa587.js";const p={},e=t(`<h2 id="tcp-\u670D\u52A1\u7AEF" tabindex="-1"><a class="header-anchor" href="#tcp-\u670D\u52A1\u7AEF" aria-hidden="true">#</a> TCP \u670D\u52A1\u7AEF</h2><p>\u4E00\u4E2A TCP \u670D\u52A1\u7AEF\u53EF\u4EE5\u540C\u65F6\u8FDE\u63A5\u5F88\u591A\u4E2A\u5BA2\u6237\u7AEF\uFF0C\u56E0\u4E3A go \u8BED\u8A00\u521B\u5EFA\u591A\u4E2A goroutine \u5B9E\u73B0\u5E76\u53D1\u975E\u5E38\u65B9\u4FBF\u548C\u9AD8\u6548\uFF0C\u6240\u4EE5\u6211\u4EEC\u53EF\u4EE5\u6BCF\u5EFA\u7ACB\u4E00\u6B21\u94FE\u63A5\u5C31\u521B\u5EFA\u4E00\u4E2A goroutine \u53BB\u5904\u7406\u3002</p><p>TCP \u670D\u52A1\u7AEF\u7A0B\u5E8F\u7684\u5904\u7406\u6D41\u7A0B\uFF1A</p><ol><li>\u76D1\u542C\u7AEF\u53E3</li><li>\u63A5\u6536\u5BA2\u6237\u7AEF\u8BF7\u6C42\u5EFA\u7ACB\u94FE\u63A5</li><li>\u521B\u5EFA goroutine \u5904\u7406\u94FE\u63A5</li></ol><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;bufio&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;net&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u5BF9\u6BCF\u4E2A\u94FE\u63A5\u505A\u5904\u7406</span>
<span class="token keyword">func</span> <span class="token function">process</span><span class="token punctuation">(</span>conn net<span class="token punctuation">.</span>Conn<span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u5173\u95ED\u8FDE\u63A5</span>
	<span class="token keyword">defer</span> conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token comment">// \u57FA\u4E8E\u7F51\u7EDC\u8FDE\u63A5\u521B\u5EFA\u4E00\u4E2Areader\u5BF9\u8C61</span>
		reader <span class="token operator">:=</span> bufio<span class="token punctuation">.</span><span class="token function">NewReader</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span>
		<span class="token comment">// \u6BCF\u6B21\u8BFB\u53D6128\u5B57\u8282</span>
		<span class="token keyword">var</span> buf <span class="token punctuation">[</span><span class="token number">128</span><span class="token punctuation">]</span><span class="token builtin">byte</span>
		<span class="token comment">// \u8BFB\u53D6\u6570\u636E</span>
		n<span class="token punctuation">,</span> err <span class="token operator">:=</span> reader<span class="token punctuation">.</span><span class="token function">Read</span><span class="token punctuation">(</span>buf<span class="token punctuation">[</span><span class="token punctuation">:</span><span class="token punctuation">]</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;read from client failed, err:&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		<span class="token comment">// \u628A\u6536\u5230\u7684\u5185\u5BB9\u8F6C\u6362\u4E3A\u5B57\u7B26\u4E32</span>
		recvStr <span class="token operator">:=</span> <span class="token function">string</span><span class="token punctuation">(</span>buf<span class="token punctuation">[</span><span class="token punctuation">:</span>n<span class="token punctuation">]</span><span class="token punctuation">)</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u6536\u5230client\u53D1\u6765\u7684\u6570\u636E: &quot;</span><span class="token punctuation">,</span> recvStr<span class="token punctuation">)</span>
		conn<span class="token punctuation">.</span><span class="token function">Write</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token function">byte</span><span class="token punctuation">(</span>recvStr<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token comment">// \u53D1\u9001\u6570\u636E</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	listen<span class="token punctuation">,</span> err <span class="token operator">:=</span> net<span class="token punctuation">.</span><span class="token function">Listen</span><span class="token punctuation">(</span><span class="token string">&quot;tcp&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;127.0.0.1:12345&quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;listen failed, err: &quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> listen<span class="token punctuation">.</span><span class="token function">Accept</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u5EFA\u7ACB\u8FDE\u63A5</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;accept failed, err: &quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
			<span class="token keyword">continue</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">go</span> <span class="token function">process</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span> <span class="token comment">// \u542F\u52A8\u4E00\u4E2Agoroutine\u5904\u7406\u94FE\u63A5</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u5BA2\u6237\u7AEF" tabindex="-1"><a class="header-anchor" href="#\u5BA2\u6237\u7AEF" aria-hidden="true">#</a> \u5BA2\u6237\u7AEF</h2><ol><li>\u8FDE\u63A5\u670D\u52A1\u7AEF</li><li>\u8FDB\u884C\u6570\u636E\u6536\u53D1</li><li>\u5173\u95ED\u94FE\u63A5</li></ol><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;bufio&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;net&quot;</span>
	<span class="token string">&quot;os&quot;</span>
	<span class="token string">&quot;strings&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> net<span class="token punctuation">.</span><span class="token function">Dial</span><span class="token punctuation">(</span><span class="token string">&quot;tcp&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;127.0.0.1:12345&quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;err: &quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">defer</span> conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token comment">// \u4ECE\u6807\u51C6\u8F93\u5165\u83B7\u53D6\u7528\u6237\u8F93\u5165\u7684\u5185\u5BB9</span>
	inputReader <span class="token operator">:=</span> bufio<span class="token punctuation">.</span><span class="token function">NewReader</span><span class="token punctuation">(</span>os<span class="token punctuation">.</span>Stdin<span class="token punctuation">)</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token comment">// \u8BFB\u53D6\u7528\u6237\u8F93\u5165</span>
		input<span class="token punctuation">,</span> <span class="token boolean">_</span> <span class="token operator">:=</span> inputReader<span class="token punctuation">.</span><span class="token function">ReadString</span><span class="token punctuation">(</span><span class="token char">&#39;\\n&#39;</span><span class="token punctuation">)</span>
		inputInfo <span class="token operator">:=</span> strings<span class="token punctuation">.</span><span class="token function">Trim</span><span class="token punctuation">(</span>input<span class="token punctuation">,</span> <span class="token string">&quot;\\r\\n&quot;</span><span class="token punctuation">)</span>
		<span class="token comment">// \u5982\u679C\u8F93\u5165q|Q\u5C31\u9000\u51FA</span>
		<span class="token keyword">if</span> strings<span class="token punctuation">.</span><span class="token function">ToUpper</span><span class="token punctuation">(</span>inputInfo<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token string">&quot;Q&quot;</span> <span class="token punctuation">{</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		<span class="token comment">// \u53D1\u9001\u6570\u636E</span>
		<span class="token boolean">_</span><span class="token punctuation">,</span> err <span class="token operator">=</span> conn<span class="token punctuation">.</span><span class="token function">Write</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token function">byte</span><span class="token punctuation">(</span>inputInfo<span class="token punctuation">)</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		buf <span class="token operator">:=</span> <span class="token punctuation">[</span><span class="token number">512</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">{</span><span class="token punctuation">}</span>
		n<span class="token punctuation">,</span> err <span class="token operator">:=</span> conn<span class="token punctuation">.</span><span class="token function">Read</span><span class="token punctuation">(</span>buf<span class="token punctuation">[</span><span class="token punctuation">:</span><span class="token punctuation">]</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;recv failed, err: &quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token function">string</span><span class="token punctuation">(</span>buf<span class="token punctuation">[</span><span class="token punctuation">:</span>n<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="tcp-\u7C98\u5305" tabindex="-1"><a class="header-anchor" href="#tcp-\u7C98\u5305" aria-hidden="true">#</a> TCP \u7C98\u5305</h2><p>\u4F7F\u7528\u4E0A\u9762\u7684\u6848\u4F8B\uFF0C\u6211\u4EEC\u53EF\u4EE5\u5206\u522B\u7F16\u8BD1\u540E\u542F\u52A8\u670D\u52A1\u7AEF\u518D\u542F\u52A8\u5BA2\u6237\u7AEF\uFF0C\u5982\u679C\u5BA2\u6237\u7AEF\u5206 10 \u6B21\u8FDE\u7EED\u53D1\u9001\u6570\u636E\uFF0C\u4F46\u662F\u5728\u526F\u7AEF\u6CA1\u6709\u6210\u529F\u7684\u8F93\u51FA 10 \u6B21\uFF0C\u800C\u662F\u591A\u4F59\u6570\u636E\u201D\u7C98\u201C\u5230\u4E86\u4E00\u8D77\u3002</p><blockquote><p>\u4E3A\u4EC0\u4E48\u4F1A\u51FA\u73B0\u7C98\u5305</p></blockquote><p>\u4E3B\u8981\u539F\u56E0\u662F TCP \u6570\u636E\u4F20\u9012\u6A21\u5F0F\u662F<strong>\u6D41\u6A21\u5F0F</strong>\uFF0C\u5728\u4FDD\u6301\u957F\u8FDE\u63A5\u7684\u65F6\u5019\u53EF\u4EE5\u8FDB\u884C\u591A\u6B21\u7684\u6536\u548C\u53D1\u3002</p><p>\u201D\u7C98\u5305\u201C\u53EF\u53D1\u751F\u5728\u53D1\u9001\u7AEF\u4E5F\u53EF\u4EE5\u53D1\u751F\u5728\u63A5\u6536\u7AEF\uFF1A</p><ol><li>\u7531<code>Nagle</code>\u7B97\u6CD5\u9020\u6210\u7684\u53D1\u9001\u7AEF\u7684\u7C98\u5305\uFF1A<code>Nagle</code>\u7B97\u6CD5\u662F\u4E00\u79CD\u6539\u5584\u7F51\u7EDC\u4F20\u8F93\u6548\u7387\u7684\u7B97\u6CD5\u3002\u7B80\u5355\u6765\u8BF4\u5C31\u662F\u5F53\u6211\u4EEC\u63D0\u4EA4\u4E00\u6BB5\u6570\u636E\u7ED9 TCP \u53D1\u9001\u65F6\uFF0CTCP \u5E76\u4E0D\u7ACB\u523B\u53D1\u9001\u6B64\u6BB5\u6570\u636E\uFF0C\u800C\u662F\u7B49\u5F85\u4E00\u5C0F\u6BB5\u65F6\u95F4\u770B\u770B\u5728\u7B49\u5F85\u671F\u95F4\u662F\u5426\u8FD8\u6709\u8981\u53D1\u9001\u7684\u6570\u636E\uFF0C\u82E5\u6709\u5219\u4F1A\u4E00\u6B21\u628A\u8FD9\u4E24\u6BB5\u6570\u636E\u53D1\u9001\u51FA\u53BB\u3002</li><li>\u63A5\u6536\u7AEF\u63A5\u6536\u4E0D\u53CA\u65F6\u9020\u6210\u7684\u63A5\u6536\u7AEF\u7C98\u5305\uFF1ATCP \u4F1A\u628A\u63A5\u6536\u5230\u7684\u6570\u636E\u5B58\u5728\u81EA\u5DF1\u7684\u7F13\u51B2\u533A\uFF0C\u7136\u540E\u901A\u77E5\u5E94\u7528\u53D6\u6570\u636E\u3002\u5F53\u5E94\u7528\u5C42\u7531\u4E8E\u67D0\u4E9B\u539F\u56E0\u4E0D\u80FD\u53CA\u65F6\u5730\u628A TCP \u7684\u6570\u636E\u53D6\u51FA\u6765\uFF0C\u5C31\u4F1A\u9020\u6210 TCP \u7F13\u51B2\u533A\u4E2D\u5B58\u653E\u4E86\u597D\u51E0\u6BB5\u6570\u636E\u3002</li></ol><blockquote><p>\u89E3\u51B3\u529E\u6CD5</p></blockquote><p>\u51FA\u73B0\u7C98\u5305\u7684\u5173\u952E\u5728\u4E8E\u63A5\u6536\u65B9\u4E0D\u786E\u5B9A\u5C06\u8981\u4F20\u8F93\u7684\u6570\u636E\u5305\u7684\u5927\u5C0F\uFF0C\u56E0\u6B64\u6211\u4EEC\u53EF\u4EE5\u5BF9\u6570\u636E\u5305\u8FDB\u884C\u5C01\u5305\u548C\u62C6\u5305\u7684\u64CD\u4F5C\u3002</p><p>\u5C01\u5305\uFF1A\u5C01\u5305\u5C31\u662F\u7ED9\u4E00\u6BB5\u6570\u636E\u52A0\u4E0A\u5305\u5934\uFF0C\u8FD9\u6837\u4E00\u6765\u6570\u636E\u5305\u5C31\u5206\u4E3A\u4E86\u5305\u5934\u548C\u5305\u4F53\u7684\u4E24\u90E8\u5206\u5185\u5BB9\uFF08\u8FC7\u6EE4\u975E\u6CD5\u5305\u65F6\u5C01\u5305\u4F1A\u52A0\u5165\u201D\u5305\u5C3E\u201C\u5185\u5BB9\uFF09\u3002\u5305\u5934\u90E8\u5206\u7684\u957F\u5EA6\u662F\u56FA\u5B9A\u7684\uFF0C\u5E76\u4E14\u5B83\u5B58\u50A8\u4E86\u5305\u4F53\u7684\u957F\u5EA6\uFF0C\u6839\u636E\u5305\u5934\u957F\u5EA6\u56FA\u5B9A\u4EE5\u53CA\u5305\u5934\u4E2D\u542B\u6709\u5305\u4F53\u7684\u957F\u5EA6\u7684\u53D8\u91CF\u5C31\u80FD\u6B63\u786E\u7684\u62C6\u5206\u51FA\u4E00\u4E2A\u5B8C\u6574\u7684\u6570\u636E\u5305\u3002</p><p>\u6211\u4EEC\u53EF\u4EE5\u81EA\u5DF1\u5B9A\u4E49\u4E00\u4E2A\u534F\u8BAE\uFF0C\u6BD4\u5982\u6570\u636E\u5305\u524D 4 \u4E2A\u5B57\u8282\u4E3A\u5305\u5934\uFF0C\u91CC\u9762\u5B58\u50A8\u7684\u662F\u53D1\u751F\u7684\u6570\u636E\u7684\u957F\u5EA6</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> proto

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;bufio&quot;</span>
	<span class="token string">&quot;bytes&quot;</span>
	<span class="token string">&quot;encoding/binary&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// Encode \u5C06\u6D88\u606F\u7F16\u7801</span>
<span class="token keyword">func</span> <span class="token function">Encode</span><span class="token punctuation">(</span>message <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u8BFB\u53D6\u6D88\u606F\u7684\u957F\u5EA6\uFF0C\u8F6C\u6362\u4E3Aint32\u7C7B\u578B \u53604\u4E2A\u5B57\u8282</span>
	<span class="token keyword">var</span> length <span class="token operator">=</span> <span class="token function">int32</span><span class="token punctuation">(</span><span class="token function">len</span><span class="token punctuation">(</span>message<span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token keyword">var</span> pkg <span class="token operator">=</span> <span class="token function">new</span><span class="token punctuation">(</span>bytes<span class="token punctuation">.</span>Buffer<span class="token punctuation">)</span>
	<span class="token comment">// \u5199\u5165\u6D88\u606F\u5934</span>
	err <span class="token operator">:=</span> binary<span class="token punctuation">.</span><span class="token function">Write</span><span class="token punctuation">(</span>pkg<span class="token punctuation">,</span> binary<span class="token punctuation">.</span>LittleEndian<span class="token punctuation">,</span> length<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>
	<span class="token comment">// \u5199\u5165\u6D88\u606F\u5B9E\u4F53</span>
	err <span class="token operator">=</span> binary<span class="token punctuation">.</span><span class="token function">Write</span><span class="token punctuation">(</span>pkg<span class="token punctuation">,</span> binary<span class="token punctuation">.</span>LittleEndian<span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token function">byte</span><span class="token punctuation">(</span>message<span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> pkg<span class="token punctuation">.</span><span class="token function">Bytes</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>

<span class="token comment">// Decode \u89E3\u7801\u6D88\u606F</span>
<span class="token keyword">func</span> <span class="token function">Decode</span><span class="token punctuation">(</span>reader <span class="token operator">*</span>bufio<span class="token punctuation">.</span>Reader<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token builtin">string</span><span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u8BFB\u53D6\u6D88\u606F\u7684\u957F\u5EA6</span>
	lengthByte<span class="token punctuation">,</span> <span class="token boolean">_</span> <span class="token operator">:=</span> reader<span class="token punctuation">.</span><span class="token function">Peek</span><span class="token punctuation">(</span><span class="token number">4</span><span class="token punctuation">)</span> <span class="token comment">// \u8BFB\u53D6\u524D4\u4E2A\u5B57\u8282\u7684\u6570\u636E</span>
	lengthBuff <span class="token operator">:=</span> bytes<span class="token punctuation">.</span><span class="token function">NewBuffer</span><span class="token punctuation">(</span>lengthByte<span class="token punctuation">)</span>
	<span class="token keyword">var</span> length <span class="token builtin">int32</span>
	err <span class="token operator">:=</span> binary<span class="token punctuation">.</span><span class="token function">Read</span><span class="token punctuation">(</span>lengthBuff<span class="token punctuation">,</span> binary<span class="token punctuation">.</span>LittleEndian<span class="token punctuation">,</span> <span class="token operator">&amp;</span>length<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>
	<span class="token comment">// Buffered \u8FD4\u56DE\u7F13\u51B2\u4E2D\u73B0\u6709\u7684\u53EF\u8BFB\u53D6\u7684\u5B57\u8282\u6570</span>
	<span class="token keyword">if</span> <span class="token function">int32</span><span class="token punctuation">(</span>reader<span class="token punctuation">.</span><span class="token function">Buffered</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> length<span class="token operator">+</span><span class="token number">4</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>

	<span class="token comment">// \u8BFB\u53D6\u771F\u6B63\u7684\u6D88\u606F\u6570\u636E</span>
	pack <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">,</span> <span class="token function">int</span><span class="token punctuation">(</span><span class="token number">4</span><span class="token operator">+</span>length<span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token boolean">_</span><span class="token punctuation">,</span> err <span class="token operator">=</span> reader<span class="token punctuation">.</span><span class="token function">Read</span><span class="token punctuation">(</span>pack<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> <span class="token string">&quot;&quot;</span><span class="token punctuation">,</span> err
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> <span class="token function">string</span><span class="token punctuation">(</span>pack<span class="token punctuation">[</span><span class="token number">4</span><span class="token punctuation">:</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u63A5\u4E0B\u6765\u53EF\u4EE5\u518D\u670D\u52A1\u7AEF\u548C\u5BA2\u6237\u7AEF\u5206\u522B\u4F7F\u7528\u4E0A\u9762\u5B9A\u4E49\u7684<code>Decode</code>\u548C<code>Encode</code>\u7684\u51FD\u6570\u6765\u5904\u7406\u6570\u636E\u3002</p><p>\u670D\u52A1\u7AEF\u8C03\u6574</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;bufio&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;io&quot;</span>
	<span class="token string">&quot;net&quot;</span>
<span class="token punctuation">)</span>

<span class="token comment">// \u5BF9\u6BCF\u4E2A\u94FE\u63A5\u505A\u5904\u7406</span>
<span class="token keyword">func</span> <span class="token function">process</span><span class="token punctuation">(</span>conn net<span class="token punctuation">.</span>Conn<span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u5173\u95ED\u8FDE\u63A5</span>
	<span class="token keyword">defer</span> conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token comment">// \u57FA\u4E8E\u7F51\u7EDC\u8FDE\u63A5\u521B\u5EFA\u4E00\u4E2Areader\u5BF9\u8C61</span>
	reader <span class="token operator">:=</span> bufio<span class="token punctuation">.</span><span class="token function">NewReader</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		msg<span class="token punctuation">,</span> err <span class="token operator">:=</span> <span class="token function">Decode</span><span class="token punctuation">(</span>reader<span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">==</span> io<span class="token punctuation">.</span>EOF <span class="token punctuation">{</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;decode msg from client failed, err:&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u6536\u5230client\u53D1\u6765\u7684\u6570\u636E: &quot;</span><span class="token punctuation">,</span> msg<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	listen<span class="token punctuation">,</span> err <span class="token operator">:=</span> net<span class="token punctuation">.</span><span class="token function">Listen</span><span class="token punctuation">(</span><span class="token string">&quot;tcp&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;127.0.0.1:12345&quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;listen failed, err: &quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">defer</span> listen<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> listen<span class="token punctuation">.</span><span class="token function">Accept</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u5EFA\u7ACB\u8FDE\u63A5</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;accept failed, err: &quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
			<span class="token keyword">continue</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">go</span> <span class="token function">process</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span> <span class="token comment">// \u542F\u52A8\u4E00\u4E2Agoroutine\u5904\u7406\u94FE\u63A5</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5BA2\u6237\u7AEF\u8C03\u6574</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;bufio&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;net&quot;</span>
	<span class="token string">&quot;os&quot;</span>
	<span class="token string">&quot;strings&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> net<span class="token punctuation">.</span><span class="token function">Dial</span><span class="token punctuation">(</span><span class="token string">&quot;tcp&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;127.0.0.1:12345&quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;err: &quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">defer</span> conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token comment">// \u4ECE\u6807\u51C6\u8F93\u5165\u83B7\u53D6\u7528\u6237\u8F93\u5165\u7684\u5185\u5BB9</span>
	inputReader <span class="token operator">:=</span> bufio<span class="token punctuation">.</span><span class="token function">NewReader</span><span class="token punctuation">(</span>os<span class="token punctuation">.</span>Stdin<span class="token punctuation">)</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		<span class="token comment">// \u8BFB\u53D6\u7528\u6237\u8F93\u5165</span>
		input<span class="token punctuation">,</span> <span class="token boolean">_</span> <span class="token operator">:=</span> inputReader<span class="token punctuation">.</span><span class="token function">ReadString</span><span class="token punctuation">(</span><span class="token char">&#39;\\n&#39;</span><span class="token punctuation">)</span>
		inputInfo <span class="token operator">:=</span> strings<span class="token punctuation">.</span><span class="token function">Trim</span><span class="token punctuation">(</span>input<span class="token punctuation">,</span> <span class="token string">&quot;\\r\\n&quot;</span><span class="token punctuation">)</span>
		<span class="token comment">// \u5982\u679C\u8F93\u5165q|Q\u5C31\u9000\u51FA</span>
		<span class="token keyword">if</span> strings<span class="token punctuation">.</span><span class="token function">ToUpper</span><span class="token punctuation">(</span>inputInfo<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token string">&quot;Q&quot;</span> <span class="token punctuation">{</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		<span class="token comment">// \u53D1\u9001\u6570\u636E</span>
		data<span class="token punctuation">,</span> err <span class="token operator">:=</span> <span class="token function">Encode</span><span class="token punctuation">(</span>inputInfo<span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;encode msg failed, err: &quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
			<span class="token keyword">return</span>
		<span class="token punctuation">}</span>
		<span class="token boolean">_</span><span class="token punctuation">,</span> err <span class="token operator">=</span> conn<span class="token punctuation">.</span><span class="token function">Write</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		buf <span class="token operator">:=</span> <span class="token punctuation">[</span><span class="token number">512</span><span class="token punctuation">]</span><span class="token builtin">byte</span><span class="token punctuation">{</span><span class="token punctuation">}</span>
		n<span class="token punctuation">,</span> err <span class="token operator">:=</span> conn<span class="token punctuation">.</span><span class="token function">Read</span><span class="token punctuation">(</span>buf<span class="token punctuation">[</span><span class="token punctuation">:</span><span class="token punctuation">]</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;recv failed, err: &quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
			<span class="token keyword">break</span>
		<span class="token punctuation">}</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token function">string</span><span class="token punctuation">(</span>buf<span class="token punctuation">[</span><span class="token punctuation">:</span>n<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,24),o=[e];function c(i,l){return s(),a("div",null,o)}var r=n(p,[["render",c],["__file","go-tcp.html.vue"]]);export{r as default};
