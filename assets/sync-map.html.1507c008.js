import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.d55bb37b.js";const t={},i=e(`<h2 id="\u793A\u4F8B\u4EE3\u7801" tabindex="-1"><a class="header-anchor" href="#\u793A\u4F8B\u4EE3\u7801" aria-hidden="true">#</a> \u793A\u4F8B\u4EE3\u7801</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	m <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">int</span><span class="token punctuation">]</span><span class="token builtin">int</span><span class="token punctuation">)</span>

	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// \u8D77\u4E00\u4E2A\u534F\u7A0B\u4E0D\u65AD\u7684\u8BFB\u53D6\u952E\u503C\u4E3A1\u7684\u503C</span>
		<span class="token keyword">for</span> <span class="token punctuation">{</span>
			<span class="token boolean">_</span> <span class="token operator">=</span> m<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// \u8D77\u4E00\u4E2A\u534F\u7A0B\u4E0D\u65AD\u7684\u5F80\u952E\u4E3A2\u7684\u91CC\u9762\u5199\u503C\u4E3A2</span>
		<span class="token keyword">for</span> <span class="token punctuation">{</span>
			m<span class="token punctuation">[</span><span class="token number">2</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token number">2</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

    <span class="token comment">// \u963B\u585E\u4F4F \u524D\u9762\u7684\u534F\u7A0B\u5C31\u4E0D\u4F1A\u9000\u51FA</span>
	<span class="token keyword">select</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container danger"><p class="custom-container-title">\u62A5\u9519</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>fatal error: concurrent map <span class="token builtin class-name">read</span> and map <span class="token function">write</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5E76\u53D1\u7684\u8BFB\u548C\u5199\uFF0C\u9047\u5230\u8FD9\u79CD\u5B83\u5C31\u4F1A\u7ED9\u4F60\u62A5\u9519\uFF0C\u4E00\u70B9\u4F59\u5730\u90FD\u4E0D\u7ED9\u4F60\u7559\u3002</p></div><h2 id="map-\u7684\u5E76\u53D1\u95EE\u9898" tabindex="-1"><a class="header-anchor" href="#map-\u7684\u5E76\u53D1\u95EE\u9898" aria-hidden="true">#</a> map \u7684\u5E76\u53D1\u95EE\u9898</h2><ul><li><code>map</code>\u7684\u8BFB\u5199\u6709\u5E76\u53D1\u95EE\u9898</li><li>A \u534F\u7A0B\u5728\u6876\u4E2D\u8BFB\u53D6\u6570\u636E\u65F6\uFF0CB \u534F\u7A0B\u9A71\u9010\u4E86\u8FD9\u4E2A\u6876\uFF0C\u5B83\u5C31\u6709\u5E76\u53D1\u95EE\u9898\uFF1BA \u534F\u7A0B\u5C31\u4F1A\u8BFB\u5230\u9519\u8BEF\u7684\u6570\u636E\u6216\u8005\u627E\u4E0D\u5230\u6570\u636E</li></ul><h3 id="\u89E3\u51B3\u65B9\u6848" tabindex="-1"><a class="header-anchor" href="#\u89E3\u51B3\u65B9\u6848" aria-hidden="true">#</a> \u89E3\u51B3\u65B9\u6848</h3><ul><li>\u7ED9<code>map</code>\u52A0\u9501(<code>mutex</code>)\uFF0C\u5982\u679C\u52A0\u4E86\u9501\uFF0C\u5C31\u8868\u793A\u540C\u4E00\u65F6\u523B\u5C31\u53EA\u80FD\u6709\u4E00\u4E2A\u534F\u7A0B\u53BB\u8BBF\u95EE\u5B83\uFF0C\u6240\u4EE5\u8FD9\u6837\u4E5F\u4F1A\u51CF\u5C11\u4E00\u4E2A\u6027\u80FD</li><li>\u6211\u4EEC\u53EF\u4EE5\u4F7F\u7528<code>sync.Map</code>\u8FD9\u4E2A\u6570\u636E\u7ED3\u6784\uFF0C\u53EF\u4EE5\u505A\u5230\u5E76\u53D1\u7684\u8BFB\u5199\uFF0C\u800C\u4E14\u80FD\u505A\u5230\u6027\u80FD\u7684\u635F\u5931\u662F\u53EF\u63A7\u7684</li></ul><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">type</span> Map <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	mu Mutex

	read atomic<span class="token punctuation">.</span>Value <span class="token comment">// readOnly</span>

	dirty <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token keyword">interface</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token operator">*</span>entry <span class="token comment">// \u4E07\u80FD\u7684map</span>

	misses <span class="token builtin">int</span> <span class="token comment">// \u662F\u5426\u547D\u4E2D</span>
<span class="token punctuation">}</span>

<span class="token comment">// readOnly is an immutable struct stored atomically in the Map.read field.</span>
<span class="token keyword">type</span> readOnly <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	m       <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token keyword">interface</span><span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token operator">*</span>entry
	amended <span class="token builtin">bool</span> <span class="token comment">// true if the dirty map contains some key not in m.</span>
<span class="token punctuation">}</span>

<span class="token keyword">type</span> entry <span class="token keyword">struct</span> <span class="token punctuation">{</span>

	p unsafe<span class="token punctuation">.</span>Pointer <span class="token comment">// *interface{}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>\u76F8\u5BF9\u4E8E\u67E5\u8BE2\u3001\u4FEE\u6539\u3001\u65B0\u589E\uFF0C\u5220\u9664\u4F1A\u6BD4\u8F83\u9EBB\u70E6</li><li>\u5220\u9664\u53EF\u4EE5\u5206\u4E3A\u6B63\u5E38\u5220\u9664\u548C\u8FFD\u52A0\u540E\u5220\u9664</li><li>\u63D0\u5347\u540E\uFF0C\u88AB\u5220<code>key</code>\u8FD8\u9700\u7279\u6B8A\u5904\u7406</li></ul><h2 id="\u603B\u7ED3" tabindex="-1"><a class="header-anchor" href="#\u603B\u7ED3" aria-hidden="true">#</a> \u603B\u7ED3</h2><ul><li><code>map</code>\u5728\u6269\u5BB9\u65F6\u4F1A\u6709\u5E76\u53D1\u95EE\u9898</li><li><code>sync.Map</code>\u4F7F\u7528\u4E86 2 \u4E2A<code>map</code>\uFF0C\u5206\u79BB\u4E86\u6269\u5BB9\u95EE\u9898</li><li>\u4E0D\u4F1A\u5F15\u53D1\u6269\u5BB9\u7684\u64CD\u4F5C(\u67E5\u8BE2\u548C\u4FEE\u6539)\uFF0C\u4F7F\u7528<code>read map</code></li><li>\u53EF\u80FD\u5F15\u53D1\u6269\u5BB9\u7684\u64CD\u4F5C(\u65B0\u589E)\u4F7F\u7528<code>dirty map</code></li><li>\u8FFD\u52A0\u7684\u60C5\u51B5\u5C11\u7684\u65F6\u5019<code>sync.Map</code>\u7684\u6027\u80FD\u662F\u6BD4\u8F83\u597D\u7684</li></ul>`,11),c=[i];function p(l,o){return s(),a("div",null,c)}var r=n(t,[["render",p],["__file","sync-map.html.vue"]]);export{r as default};