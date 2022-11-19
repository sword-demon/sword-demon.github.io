import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as a,c as s,e as t}from"./app.bbed4eea.js";const e={},o=t(`<h2 id="map-\u4E3A\u4EC0\u4E48\u8981\u6269\u5BB9" tabindex="-1"><a class="header-anchor" href="#map-\u4E3A\u4EC0\u4E48\u8981\u6269\u5BB9" aria-hidden="true">#</a> map \u4E3A\u4EC0\u4E48\u8981\u6269\u5BB9</h2><p>\u6E90\u7801\u4F4D\u7F6E\uFF1A<code>runtime</code>\u5305\u4E0B\u7684<code>map.go</code>\u91CC\u7684<code>mapassign</code>\u65B9\u6CD5</p><ul><li><p><code>map</code>\u6EA2\u51FA\u6876\u592A\u591A\u65F6\u4F1A\u5BFC\u81F4\u4E25\u91CD\u7684\u6027\u80FD\u4E0B\u964D</p></li><li><p><code>runtime.mapassign()</code>\u53EF\u80FD\u4F1A\u89E6\u53D1\u6269\u5BB9</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">// If we hit the max load factor or we have too many overflow buckets,</span>
<span class="token comment">// and we&#39;re not already in the middle of growing, start growing.</span>
<span class="token keyword">if</span> <span class="token operator">!</span>h<span class="token punctuation">.</span><span class="token function">growing</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span><span class="token function">overLoadFactor</span><span class="token punctuation">(</span>h<span class="token punctuation">.</span>count<span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">,</span> h<span class="token punctuation">.</span>B<span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token function">tooManyOverflowBuckets</span><span class="token punctuation">(</span>h<span class="token punctuation">.</span>noverflow<span class="token punctuation">,</span> h<span class="token punctuation">.</span>B<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">hashGrow</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> h<span class="token punctuation">)</span>
    <span class="token keyword">goto</span> again <span class="token comment">// Growing the table invalidates everything, so try again</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>\u88C5\u8F7D\u56E0\u5B50\u8D85\u8FC7 6.5(\u5E73\u5747\u6BCF\u4E2A\u69FD 6.5 \u4E2A<code>key</code>)</li><li>\u4F7F\u7528\u4E86\u592A\u591A\u6EA2\u51FA\u6876(\u6EA2\u51FA\u6876\u8D85\u8FC7\u4E86\u666E\u901A\u6876\u7684\u6570\u91CF\u5C31\u8981\u5F00\u59CB\u8003\u8651\u6269\u5BB9)</li></ul></li></ul><h2 id="map-\u6269\u5BB9\u7684\u7C7B\u578B" tabindex="-1"><a class="header-anchor" href="#map-\u6269\u5BB9\u7684\u7C7B\u578B" aria-hidden="true">#</a> map \u6269\u5BB9\u7684\u7C7B\u578B</h2><ul><li>\u7B49\u91CF\u6269\u5BB9\uFF1A\u6570\u636E\u4E0D\u591A\u4F46\u662F\u6EA2\u51FA\u6876\u592A\u591A\u4E86</li><li>\u7FFB\u500D\u6269\u5BB9\uFF1A\u6570\u636E\u592A\u591A\u4E86</li></ul><h2 id="map-\u6269\u5BB9\u6B65\u9AA4" tabindex="-1"><a class="header-anchor" href="#map-\u6269\u5BB9\u6B65\u9AA4" aria-hidden="true">#</a> map \u6269\u5BB9\u6B65\u9AA4</h2><h3 id="\u6B65\u9AA4\u4E00" tabindex="-1"><a class="header-anchor" href="#\u6B65\u9AA4\u4E00" aria-hidden="true">#</a> \u6B65\u9AA4\u4E00</h3><ol><li>\u521B\u5EFA\u4E00\u7EC4\u65B0\u6876</li><li><code>oldbuckets</code>\u6307\u5411\u539F\u6709\u7684\u6876\u6570\u7EC4</li><li><code>buckets</code>\u6307\u5411\u65B0\u7684\u6876\u6570\u7EC4</li><li><code>map</code>\u6807\u8BB0\u4E3A\u6269\u5BB9\u72B6\u6001</li></ol><p>\u6E90\u7801\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">hashGrow</span><span class="token punctuation">(</span>t <span class="token operator">*</span>maptype<span class="token punctuation">,</span> h <span class="token operator">*</span>hmap<span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// If we&#39;ve hit the load factor, get bigger.</span>
	<span class="token comment">// Otherwise, there are too many overflow buckets,</span>
	<span class="token comment">// so keep the same number of buckets and &quot;grow&quot; laterally.</span>
	bigger <span class="token operator">:=</span> <span class="token function">uint8</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> <span class="token operator">!</span><span class="token function">overLoadFactor</span><span class="token punctuation">(</span>h<span class="token punctuation">.</span>count<span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">,</span> h<span class="token punctuation">.</span>B<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		bigger <span class="token operator">=</span> <span class="token number">0</span>
		h<span class="token punctuation">.</span>flags <span class="token operator">|=</span> sameSizeGrow
	<span class="token punctuation">}</span>
	oldbuckets <span class="token operator">:=</span> h<span class="token punctuation">.</span>buckets
	newbuckets<span class="token punctuation">,</span> nextOverflow <span class="token operator">:=</span> <span class="token function">makeBucketArray</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> h<span class="token punctuation">.</span>B<span class="token operator">+</span>bigger<span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>

	flags <span class="token operator">:=</span> h<span class="token punctuation">.</span>flags <span class="token operator">&amp;^</span> <span class="token punctuation">(</span>iterator <span class="token operator">|</span> oldIterator<span class="token punctuation">)</span>
	<span class="token keyword">if</span> h<span class="token punctuation">.</span>flags<span class="token operator">&amp;</span>iterator <span class="token operator">!=</span> <span class="token number">0</span> <span class="token punctuation">{</span>
		flags <span class="token operator">|=</span> oldIterator
	<span class="token punctuation">}</span>
	<span class="token comment">// commit the grow (atomic wrt gc)</span>
	h<span class="token punctuation">.</span>B <span class="token operator">+=</span> bigger
	h<span class="token punctuation">.</span>flags <span class="token operator">=</span> flags
	h<span class="token punctuation">.</span>oldbuckets <span class="token operator">=</span> oldbuckets
	h<span class="token punctuation">.</span>buckets <span class="token operator">=</span> newbuckets
	h<span class="token punctuation">.</span>nevacuate <span class="token operator">=</span> <span class="token number">0</span>
	h<span class="token punctuation">.</span>noverflow <span class="token operator">=</span> <span class="token number">0</span>

	<span class="token keyword">if</span> h<span class="token punctuation">.</span>extra <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token operator">&amp;&amp;</span> h<span class="token punctuation">.</span>extra<span class="token punctuation">.</span>overflow <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token comment">// Promote current overflow buckets to the old generation.</span>
		<span class="token keyword">if</span> h<span class="token punctuation">.</span>extra<span class="token punctuation">.</span>oldoverflow <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			<span class="token function">throw</span><span class="token punctuation">(</span><span class="token string">&quot;oldoverflow is not nil&quot;</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
		h<span class="token punctuation">.</span>extra<span class="token punctuation">.</span>oldoverflow <span class="token operator">=</span> h<span class="token punctuation">.</span>extra<span class="token punctuation">.</span>overflow
		h<span class="token punctuation">.</span>extra<span class="token punctuation">.</span>overflow <span class="token operator">=</span> <span class="token boolean">nil</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">if</span> nextOverflow <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">if</span> h<span class="token punctuation">.</span>extra <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			h<span class="token punctuation">.</span>extra <span class="token operator">=</span> <span class="token function">new</span><span class="token punctuation">(</span>mapextra<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
		h<span class="token punctuation">.</span>extra<span class="token punctuation">.</span>nextOverflow <span class="token operator">=</span> nextOverflow
	<span class="token punctuation">}</span>

	<span class="token comment">// the actual copying of the hash table data is done incrementally</span>
	<span class="token comment">// by growWork() and evacuate().</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220717142728.png" alt="grow" loading="lazy"></p><h3 id="\u6B65\u9AA4\u4E8C" tabindex="-1"><a class="header-anchor" href="#\u6B65\u9AA4\u4E8C" aria-hidden="true">#</a> \u6B65\u9AA4\u4E8C</h3><ul><li>\u5C06\u6240\u6709\u7684\u6570\u636E\u4ECE\u65E7\u6876\u9A71\u9010\u5230\u65B0\u6876</li><li>\u91C7\u7528\u6E10\u8FDB\u5F0F\u9A71\u9010</li><li>\u6BCF\u6B21\u64CD\u4F5C\u4E00\u4E2A\u65E7\u6876\u65F6\uFF0C\u5C06\u65E7\u6876\u6570\u636E\u9A71\u9010\u5230\u65B0\u6876</li><li>\u8BFB\u53D6\u65F6\u4E0D\u8FDB\u884C\u9A71\u9010\uFF0C\u53EA\u5224\u65AD\u8BFB\u53D6\u65B0\u6876\u8FD8\u662F\u65E7\u6876</li></ul><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">// \u9A71\u9010\u65B9\u6CD5</span>
<span class="token keyword">func</span> <span class="token function">growWork</span><span class="token punctuation">(</span>t <span class="token operator">*</span>maptype<span class="token punctuation">,</span> h <span class="token operator">*</span>hmap<span class="token punctuation">,</span> bucket <span class="token builtin">uintptr</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// make sure we evacuate the oldbucket corresponding</span>
	<span class="token comment">// to the bucket we&#39;re about to use</span>
	<span class="token function">evacuate</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> h<span class="token punctuation">,</span> bucket<span class="token operator">&amp;</span>h<span class="token punctuation">.</span><span class="token function">oldbucketmask</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

	<span class="token comment">// evacuate one more oldbucket to make progress on growing</span>
	<span class="token keyword">if</span> h<span class="token punctuation">.</span><span class="token function">growing</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token function">evacuate</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> h<span class="token punctuation">,</span> h<span class="token punctuation">.</span>nevacuate<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u6B65\u9AA4\u4E09" tabindex="-1"><a class="header-anchor" href="#\u6B65\u9AA4\u4E09" aria-hidden="true">#</a> \u6B65\u9AA4\u4E09</h3><ul><li>\u6240\u6709\u65E7\u6876\u9A71\u9010\u5B8C\u6210\u540E</li><li><code>oldbuckets</code>\u56DE\u6536</li></ul><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220717144128.png" alt="\u56DE\u6536" loading="lazy"></p><h2 id="\u603B\u7ED3" tabindex="-1"><a class="header-anchor" href="#\u603B\u7ED3" aria-hidden="true">#</a> \u603B\u7ED3</h2><ul><li>\u88C5\u8F7D\u7CFB\u6570\u6216\u8005\u6EA2\u51FA\u6876\u7684\u589E\u52A0\uFF0C\u4F1A\u89E6\u53D1<code>map</code>\u6269\u5BB9</li><li>\u6269\u5BB9\u53EF\u80FD\u5E76\u4E0D\u662F\u589E\u52A0\u6876\u6570\u3001\u800C\u662F\u6574\u7406</li><li><code>map</code>\u7684\u6269\u5BB9\u91C7\u7528\u6E10\u8FDB\u5F0F\uFF0C\u800C\u4E0D\u662F\u4E00\u6B21\u6027\u5B8C\u6210\uFF1B\u6876\u88AB\u64CD\u4F5C\u65F6\u624D\u4F1A\u91CD\u65B0\u5206\u914D</li></ul>`,19),p=[o];function c(l,i){return a(),s("div",null,p)}var d=n(e,[["render",c],["__file","map-grow.html.vue"]]);export{d as default};