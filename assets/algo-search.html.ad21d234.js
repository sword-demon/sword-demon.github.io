import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.90ebc455.js";const t={},p=e(`<h2 id="\u67E5\u627E" tabindex="-1"><a class="header-anchor" href="#\u67E5\u627E" aria-hidden="true">#</a> \u67E5\u627E</h2><blockquote><p>\u5728\u4E00\u4E9B\u6570\u636E\u5143\u7D20\u4E2D\uFF0C\u901A\u8FC7\u4E00\u5B9A\u7684\u65B9\u6CD5\u627E\u51FA\u4E0E\u7ED9\u5B9A\u5173\u952E\u5B57\u76F8\u540C\u7684\u6570\u636E\u5143\u7D20\u7684\u8FC7\u7A0B\u3002</p></blockquote><p>\u6848\u4F8B\uFF1A</p><p>\u5217\u8868\u67E5\u627E(\u7EBF\u6027\u8868\u67E5\u627E)\uFF1A\u4ECE\u5217\u8868\u4E2D\u67E5\u627E\u6307\u5B9A\u5143\u7D20</p><ul><li>\u8F93\u5165\uFF1A\u5217\u8868\u3001\u5F85\u67E5\u627E\u5143\u7D20</li><li>\u8F93\u51FA\uFF1A\u5143\u7D20\u4E0B\u6807(\u672A\u627E\u5230\u5143\u7D20\u65F6\u4E00\u822C\u8FD4\u56DE None \u6216-1)</li></ul><p><code>python</code>\u5185\u7F6E\u5217\u8868\u5DEE\u6C47\u603B\u554A\u51FD\u6570\uFF1A<code>index()</code></p><h2 id="\u987A\u5E8F\u67E5\u627E-linear-search" tabindex="-1"><a class="header-anchor" href="#\u987A\u5E8F\u67E5\u627E-linear-search" aria-hidden="true">#</a> \u987A\u5E8F\u67E5\u627E - Linear Search</h2><blockquote><p>\u4E5F\u53EB\u7EBF\u6027\u67E5\u627E\uFF0C\u4ECE\u5217\u8868\u7B2C\u4E00\u4E2A\u5143\u7D20\u5F00\u59CB\uFF0C\u987A\u5E8F\u8FDB\u884C\u641C\u7D22\uFF0C\u76F4\u5230\u627E\u5230\u5143\u7D20\u6216\u641C\u7D22\u5230\u5217\u8868\u6700\u540E\u4E00\u4E2A\u5143\u7D20\u4E3A\u6B62\u3002</p></blockquote><p><code>python\u5B9E\u73B0</code></p><div class="language-python ext-py line-numbers-mode"><pre class="language-python"><code><span class="token comment"># -*- coding: utf8 -*-</span>
<span class="token comment"># @Time    : 2021/10/22 22:52</span>
<span class="token comment"># @Author  : wxvirus</span>
<span class="token comment"># @File    : search.py</span>
<span class="token comment"># @Software: PyCharm</span>

<span class="token keyword">def</span> <span class="token function">linear_search</span><span class="token punctuation">(</span>li<span class="token punctuation">,</span> val<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token keyword">for</span> ind<span class="token punctuation">,</span> v <span class="token keyword">in</span> <span class="token builtin">enumerate</span><span class="token punctuation">(</span>li<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token keyword">if</span> v <span class="token operator">==</span> val<span class="token punctuation">:</span>
            <span class="token keyword">return</span> ind
    <span class="token keyword">else</span><span class="token punctuation">:</span>
        <span class="token keyword">return</span> <span class="token boolean">None</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u65F6\u95F4\u590D\u6742\u5EA6\uFF1A</p><p>\u627E n\uFF0C\u5C31\u662F\u5217\u8868\u7684\u957F\u5EA6\uFF0C\u6709\u4E00\u4E2A\u548C n \u76F8\u5173\u7684\u5FAA\u73AF\uFF0C\u6240\u4EE5\u5B83\u7684\u4E16\u95F4\u590D\u6742\u5EA6\u4E3A <code>O(n)</code></p><h2 id="\u4E8C\u5206\u67E5\u627E-binary-search" tabindex="-1"><a class="header-anchor" href="#\u4E8C\u5206\u67E5\u627E-binary-search" aria-hidden="true">#</a> \u4E8C\u5206\u67E5\u627E - Binary Search</h2><blockquote><p>\u4E8C\u5206\u67E5\u627E\uFF1A\u4E5F\u53EB\u6298\u534A\u67E5\u627E\uFF0C\u4ECE<code>\u6709\u5E8F</code>\u5217\u8868\u7684\u521D\u59CB\u5019\u9009\u533A<code>li[0:n]</code>\u5F00\u59CB\uFF0C\u901A\u8FC7\u5BF9\u5F85\u67E5\u627E\u7684\u503C\u4E0E\u5019\u9009\u533A\u4E2D\u7684\u503C\u7684\u6BD4\u8F83\uFF0C\u53EF\u4EE5\u4F7F\u5019\u9009\u533A\u51CF\u5C11\u4E00\u534A\u3002</p></blockquote><p><img src="https://sword-demon.github.io/vue-blog/assets/images/image-20211023123949042.png" alt="image-20211023123949042" loading="lazy"></p><div class="language-python ext-py line-numbers-mode"><pre class="language-python"><code><span class="token keyword">def</span> <span class="token function">binary_search</span><span class="token punctuation">(</span>li<span class="token punctuation">,</span> val<span class="token punctuation">)</span><span class="token punctuation">:</span>
	left <span class="token operator">=</span> <span class="token number">0</span>
	right <span class="token operator">=</span> <span class="token builtin">len</span><span class="token punctuation">(</span>li<span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token number">1</span>

	<span class="token keyword">while</span> left <span class="token operator">&lt;=</span> right<span class="token punctuation">:</span>
		<span class="token comment"># \u5019\u9009\u533A\u6709\u503C</span>
		mid <span class="token operator">=</span> <span class="token punctuation">(</span>left <span class="token operator">+</span> right<span class="token punctuation">)</span> <span class="token operator">//</span> <span class="token number">2</span>  <span class="token comment"># \u6574\u96642</span>
		<span class="token keyword">if</span> li<span class="token punctuation">[</span>mid<span class="token punctuation">]</span> <span class="token operator">==</span> val<span class="token punctuation">:</span>
			<span class="token comment"># \u627E\u5230\u4E86</span>
			<span class="token keyword">return</span> mid
		<span class="token keyword">elif</span> li<span class="token punctuation">[</span>mid<span class="token punctuation">]</span> <span class="token operator">&gt;</span> val<span class="token punctuation">:</span>
			<span class="token comment"># \u5019\u9009\u533A\u5728\u5DE6\u8FB9</span>
			right <span class="token operator">=</span> mid <span class="token operator">-</span> <span class="token number">1</span>
		<span class="token keyword">else</span><span class="token punctuation">:</span>
			<span class="token comment"># li[mid] &lt; val</span>
			left <span class="token operator">=</span> mid <span class="token operator">+</span> <span class="token number">1</span>
	<span class="token keyword">else</span><span class="token punctuation">:</span>
		<span class="token keyword">return</span> <span class="token boolean">None</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u4E8C\u5206\u67E5\u627E\u4E0E\u7EBF\u6027\u67E5\u627E\u7684\u6BD4\u8F83" tabindex="-1"><a class="header-anchor" href="#\u4E8C\u5206\u67E5\u627E\u4E0E\u7EBF\u6027\u67E5\u627E\u7684\u6BD4\u8F83" aria-hidden="true">#</a> \u4E8C\u5206\u67E5\u627E\u4E0E\u7EBF\u6027\u67E5\u627E\u7684\u6BD4\u8F83</h3><p>\u4E8C\u5206\u67E5\u627E\u7684\u65F6\u95F4\u590D\u6742\u5EA6\uFF1AO(logn)\`\uFF0C\u6BD4\u7EBF\u6027\u67E5\u627E\u7684\u6548\u7387\u9AD8</p><div class="language-python ext-py line-numbers-mode"><pre class="language-python"><code><span class="token comment"># -*- coding: utf8 -*-</span>
<span class="token comment"># @Time    : 2021/10/22 22:52</span>
<span class="token comment"># @Author  : wxvirus</span>
<span class="token comment"># @File    : search.py</span>
<span class="token comment"># @Software: PyCharm</span>
<span class="token keyword">import</span> time


<span class="token keyword">def</span> <span class="token function">cal_time</span><span class="token punctuation">(</span>func<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;
    \u6D4B\u8BD5\u8FD0\u884C\u65F6\u95F4\u88C5\u9970\u5668
    :param func:
    :return:
    &quot;&quot;&quot;</span>

    <span class="token keyword">def</span> <span class="token function">wrapper</span><span class="token punctuation">(</span><span class="token operator">*</span>args<span class="token punctuation">,</span> <span class="token operator">**</span>kwargs<span class="token punctuation">)</span><span class="token punctuation">:</span>
        t1 <span class="token operator">=</span> time<span class="token punctuation">.</span>time<span class="token punctuation">(</span><span class="token punctuation">)</span>
        result <span class="token operator">=</span> func<span class="token punctuation">(</span><span class="token operator">*</span>args<span class="token punctuation">,</span> <span class="token operator">**</span>kwargs<span class="token punctuation">)</span>
        t2 <span class="token operator">=</span> time<span class="token punctuation">.</span>time<span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span><span class="token string">&quot;%s running time: %s secs.&quot;</span> <span class="token operator">%</span> <span class="token punctuation">(</span>func<span class="token punctuation">.</span>__name__<span class="token punctuation">,</span> t2 <span class="token operator">-</span> t1<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> result

    <span class="token keyword">return</span> wrapper


<span class="token decorator annotation punctuation">@cal_time</span>
<span class="token keyword">def</span> <span class="token function">linear_search</span><span class="token punctuation">(</span>li<span class="token punctuation">,</span> val<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;\u7EBF\u6027\u67E5\u627E&quot;&quot;&quot;</span>
    <span class="token keyword">for</span> ind<span class="token punctuation">,</span> v <span class="token keyword">in</span> <span class="token builtin">enumerate</span><span class="token punctuation">(</span>li<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token keyword">if</span> v <span class="token operator">==</span> val<span class="token punctuation">:</span>
            <span class="token keyword">return</span> ind
    <span class="token keyword">else</span><span class="token punctuation">:</span>
        <span class="token keyword">return</span> <span class="token boolean">None</span>


<span class="token decorator annotation punctuation">@cal_time</span>
<span class="token keyword">def</span> <span class="token function">binary_search</span><span class="token punctuation">(</span>li<span class="token punctuation">,</span> val<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;\u4E8C\u5206\u67E5\u627E&quot;&quot;&quot;</span>
    left <span class="token operator">=</span> <span class="token number">0</span>
    right <span class="token operator">=</span> <span class="token builtin">len</span><span class="token punctuation">(</span>li<span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token number">1</span>

    <span class="token keyword">while</span> left <span class="token operator">&lt;=</span> right<span class="token punctuation">:</span>
        <span class="token comment"># \u5019\u9009\u533A\u6709\u503C</span>
        mid <span class="token operator">=</span> <span class="token punctuation">(</span>left <span class="token operator">+</span> right<span class="token punctuation">)</span> <span class="token operator">//</span> <span class="token number">2</span>  <span class="token comment"># \u6574\u96642</span>
        <span class="token keyword">if</span> li<span class="token punctuation">[</span>mid<span class="token punctuation">]</span> <span class="token operator">==</span> val<span class="token punctuation">:</span>
            <span class="token comment"># \u627E\u5230\u4E86</span>
            <span class="token keyword">return</span> mid
        <span class="token keyword">elif</span> li<span class="token punctuation">[</span>mid<span class="token punctuation">]</span> <span class="token operator">&gt;</span> val<span class="token punctuation">:</span>
            <span class="token comment"># \u5019\u9009\u533A\u5728\u5DE6\u8FB9</span>
            right <span class="token operator">=</span> mid <span class="token operator">-</span> <span class="token number">1</span>
        <span class="token keyword">else</span><span class="token punctuation">:</span>
            <span class="token comment"># li[mid] &lt; val</span>
            left <span class="token operator">=</span> mid <span class="token operator">+</span> <span class="token number">1</span>
    <span class="token keyword">else</span><span class="token punctuation">:</span>
        <span class="token keyword">return</span> <span class="token boolean">None</span>


li <span class="token operator">=</span> <span class="token builtin">list</span><span class="token punctuation">(</span><span class="token builtin">range</span><span class="token punctuation">(</span><span class="token number">1000000000</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
linear_search<span class="token punctuation">(</span>li<span class="token punctuation">,</span> <span class="token number">3890000</span><span class="token punctuation">)</span>
binary_search<span class="token punctuation">(</span>li<span class="token punctuation">,</span> <span class="token number">3890000</span><span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7ED3\u679C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>linear_search running time: <span class="token number">0.17320609092712402</span> secs.
binary_search running time: <span class="token number">0.0008141994476318359</span> secs.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4E8C\u5206\u67E5\u627E\u6BD4\u7EBF\u6027\u67E5\u627E\u5FEB\u7684\u4E0D\u6B62\u4E00\u4E01\u534A\u70B9\u4E86\u3002\u662F\u975E\u5E38\u5FEB\uFF01</p><div class="custom-container warning"><p class="custom-container-title">\u6CE8\u610F</p><p>\u867D\u7136\u4E8C\u5206\u67E5\u627E\u6BD4\u8F83\u5FEB\uFF0C\u4F46\u662F\u6709\u4E00\u4E2A\u524D\u63D0\uFF0C\u662F\u6392\u597D\u5E8F\u7684\u3002\u5982\u679C\u662F\u65E0\u5E8F\u7684\u4E14\u67E5\u627E\u6B21\u6570\u5F88\u5C11\uFF0C\u6392\u5E8F\u4E4B\u540E\u8FDB\u884C\u4E8C\u5206\u67E5\u627E\uFF0C\u662F\u975E\u5E38\u4E0D\u503C\u5F97\u4F7F\u7528\u7684\uFF0C\u8FD8\u4E0D\u5982\u4F7F\u7528\u7EBF\u6027\u67E5\u627E</p></div>`,23),o=[p];function i(l,c){return s(),a("div",null,o)}var d=n(t,[["render",i],["__file","algo-search.html.vue"]]);export{d as default};
