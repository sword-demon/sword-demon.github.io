import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.5ef0c9f0.js";const t={},i=e(`<h2 id="\u8F93\u51FA" tabindex="-1"><a class="header-anchor" href="#\u8F93\u51FA" aria-hidden="true">#</a> \u8F93\u51FA</h2><p>\u5728\u7EC8\u7AEF\u5C06\u60F3\u8981\u7684\u5C55\u793A\u7684\u6570\u636E\u663E\u793A\u51FA\u6765\u7684\u4E00\u4E2A\u8FC7\u7A0B\u3002</p><ul><li>\u5185\u7F6E\u51FD\u6570 <ul><li>print</li><li>println</li></ul></li><li>fmt \u5305\uFF08\u63A8\u8350\u4F7F\u7528\uFF09 <ul><li>fmt.Print</li><li>fmt.Println</li></ul></li></ul><p>\u6269\u5C55\uFF1A\u8FDB\u7A0B\u91CC\u6709<code>stdout stdin stderr</code>\u3002</p><p>\u6848\u4F8B\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;hello world&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>fmt \u5305\u6269\u5C55\uFF1A\u683C\u5F0F\u5316\u8F93\u51FA</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;\u65E0\u89E3\u7684%s&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;\u6E38\u620F&quot;</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7528\u4E8E\u66FF\u6362\u4E00\u4E2A\u5B57\u7B26\u4E32</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>%d \u7528\u4E8E\u66FF\u6362\u4E00\u4E2A\u6574\u6570
%f \u7528\u4E8E\u66FF\u6362\u4E00\u4E2A\u5E26\u5C0F\u6570\u7684\uFF0C\u4E5F\u5C31\u662F\u6D6E\u70B9\u6570
%s \u5360\u4F4D\u7B26 &quot;\u5B57\u7B26\u4E32&quot;
\u767E\u5206\u6BD4\uFF1A\u7528\u4E8E\u767E\u5206\u6BD4\u5219\u9700\u8981\u5728\u5199\u4E00\u4E2A%
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4FDD\u7559\u5C0F\u6570\u70B9\u540E\u51E0\u4F4D</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;\u65E0\u89E3\u7684%.2f&quot;</span><span class="token punctuation">,</span> <span class="token number">2221.2121212</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u60F3\u4FDD\u7559\u51E0\u4F4D\u5199\u6570\u5B57\u51E0\u3002</p><p>\u767E\u5206\u6BD4\u6848\u4F8B\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;\u5305\u4F60100%%\u6EE1\u610F&quot;</span><span class="token punctuation">)</span>

<span class="token comment">// \u8F93\u51FA\uFF1A \u5305\u4F60100%\u6EE1\u610F</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u53D8\u91CF" tabindex="-1"><a class="header-anchor" href="#\u53D8\u91CF" aria-hidden="true">#</a> \u53D8\u91CF</h2><p>\u4F7F\u7528<code>var</code>\u5173\u952E\u5B57\u6765\u5B9A\u4E49\u53D8\u91CF</p><p>\u58F0\u660E\u548C\u8D4B\u503C\u5199\u5728\u540C\u4E00\u884C</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> sd <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&quot;\u6C99\u96D5&quot;</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>sd<span class="token punctuation">)</span>

<span class="token keyword">var</span> age <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">18</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>age<span class="token punctuation">)</span>

<span class="token keyword">var</span> flag <span class="token builtin">bool</span> <span class="token operator">=</span> <span class="token boolean">true</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>flag<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5148\u58F0\u660E\u4E00\u4E2A\u53D8\u91CF\uFF0C\u540E\u8D4B\u503C</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> sd <span class="token builtin">string</span> <span class="token comment">// \u5B57\u7B26\u4E32\u7C7B\u578B\u7684\u53D8\u91CF</span>
sd <span class="token operator">=</span> <span class="token string">&quot;\u6C99\u96D5&quot;</span> <span class="token comment">// \u540E\u8FDB\u884C\u8D4B\u503C</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>sd<span class="token punctuation">)</span>
<span class="token comment">// \u548C\u4E0A\u9762\u672C\u8D28\u4E0A\u662F\u76F8\u540C\u7684</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u6CE8\u610F\uFF0C\u53D8\u91CF\u58F0\u660E\u548C\u5B9A\u4E49\u4E86\uFF0C\u5982\u679C\u4E0D\u8FDB\u884C\u4F7F\u7528\uFF0C\u5219\u4F1A\u62A5\u9519\u3002\u8FD9\u662F<code>go</code>\u7684\u4E00\u4E2A\u7279\u70B9\u3002</p></blockquote><h3 id="\u53D8\u91CF\u540D\u8981\u6C42" tabindex="-1"><a class="header-anchor" href="#\u53D8\u91CF\u540D\u8981\u6C42" aria-hidden="true">#</a> \u53D8\u91CF\u540D\u8981\u6C42</h3><ul><li><p>\u53D8\u91CF\u540D\u5FC5\u987B\u53EA\u5305\u542B\uFF1A\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF</p></li><li><p>\u6570\u5B57\u4E0D\u80FD\u5F00\u5934</p></li><li><p><strong>\u4E0D\u80FD\u4F7F\u7528 go \u8BED\u8A00\u5185\u7F6E\u7684\u5173\u952E\u5B57</strong></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> <span class="token keyword">var</span> <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&quot;\u65E0\u89E3&quot;</span> <span class="token comment">// var \u662F\u5173\u952E\u5B57\u5C31\u62A5\u9519</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5173\u952E\u5B57\u5982\u4E0B</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">break</span> <span class="token keyword">default</span> <span class="token keyword">func</span> <span class="token keyword">interface</span> <span class="token keyword">select</span> <span class="token keyword">case</span> <span class="token keyword">defer</span> <span class="token keyword">go</span> <span class="token keyword">map</span> <span class="token keyword">struct</span> <span class="token keyword">chan</span> <span class="token keyword">else</span> <span class="token keyword">goto</span> <span class="token keyword">package</span> <span class="token keyword">switch</span> <span class="token keyword">const</span> <span class="token keyword">fallthrough</span> <span class="token keyword">if</span> <span class="token keyword">range</span> <span class="token keyword">type</span> <span class="token keyword">continue</span> <span class="token keyword">for</span> <span class="token keyword">import</span> <span class="token keyword">return</span> <span class="token keyword">var</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>\u5EFA\u8BAE</p><ul><li>\u53D8\u91CF\u540D\u89C1\u540D\u77E5\u610F\uFF1Aname/age/num \u90FD\u77E5\u9053\u8FD9\u662F\u5565\u610F\u601D</li><li>\u9A7C\u5CF0\u5F0F\u547D\u540D\uFF1A<code>myBossName/startDate</code>\uFF0C\u7B2C\u4E00\u4E2A\u5355\u8BCD\u7684\u5B57\u6BCD\u662F\u5C0F\u5199\u7684\uFF0C\u540E\u9762\u7684\u5355\u8BCD\u7684\u9996\u5B57\u6BCD\u662F\u5927\u5199\u7684</li></ul></li></ul><h3 id="\u53D8\u91CF\u7684\u7B80\u5199" tabindex="-1"><a class="header-anchor" href="#\u53D8\u91CF\u7684\u7B80\u5199" aria-hidden="true">#</a> \u53D8\u91CF\u7684\u7B80\u5199</h3><p>\u539F\u6765\u7684\u5199\u6CD5</p><ul><li><p>\u58F0\u660E + \u8D4B\u503C</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> name <span class="token builtin">string</span> <span class="token operator">=</span> <span class="token string">&quot;wujie&quot;</span>

<span class="token comment">// \u53EF\u4EE5\u7B80\u5199\u4E3A</span>
<span class="token keyword">var</span> name <span class="token operator">=</span> <span class="token string">&quot;wujie&quot;</span> <span class="token comment">// go\u53EF\u4EE5\u5185\u90E8\u6839\u636E\u4F60\u7684\u8D4B\u7684\u503C\u63A8\u65AD\u5B83\u4E3A\u5B57\u7B26\u4E32\u7C7B\u578B</span>

<span class="token comment">// \u6216\u8005</span>
name <span class="token operator">:=</span> <span class="token string">&quot;wujie&quot;</span> <span class="token comment">// \u63A8\u8350\u4F7F\u7528\u6B64\u65B9\u5F0F\u7B80\u5199</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>\u5148\u58F0\u660E\u518D\u8D4B\u503C</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> name <span class="token builtin">string</span>
<span class="token keyword">var</span> message <span class="token builtin">string</span>
<span class="token keyword">var</span> data <span class="token builtin">string</span>
name <span class="token operator">=</span> <span class="token string">&quot;wujie&quot;</span>

<span class="token comment">// \u7B80\u5199</span>
<span class="token comment">// \u521B\u5EFA\u591A\u4E2A\u53D8\u91CF\u7684\u65F6\u5019</span>
<span class="token keyword">var</span> name<span class="token punctuation">,</span> message<span class="token punctuation">,</span> data <span class="token builtin">string</span> <span class="token comment">// \u5C06\u58F0\u660E\u653E\u5728\u4E00\u884C</span>
name <span class="token operator">=</span> <span class="token string">&quot;wujie&quot;</span>
message <span class="token operator">=</span> <span class="token string">&quot;hello&quot;</span>
data <span class="token operator">=</span> <span class="token string">&quot;\u4E2D\u5956\u4E86&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li></ul><h4 id="\u56E0\u5F0F\u5206\u89E3" tabindex="-1"><a class="header-anchor" href="#\u56E0\u5F0F\u5206\u89E3" aria-hidden="true">#</a> \u56E0\u5F0F\u5206\u89E3</h4><p>\u4F8B\u5982\uFF1A\u58F0\u660E 5 \u4E2A\u53D8\u91CF\uFF0C\u5206\u522B\u6709\u5B57\u7B26\u4E32\u3001\u6574\u578B\uFF0C\u6709\u7684\u662F\u8D4B\u503C\u7684\uFF0C\u6709\u7684\u662F\u4E0D\u8D4B\u503C\u7684</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> <span class="token punctuation">(</span>
	name <span class="token operator">=</span> <span class="token string">&quot;wujie&quot;</span>
  age <span class="token operator">=</span> <span class="token number">18</span>
  gender <span class="token builtin">string</span> <span class="token comment">// \u53EA\u58F0\u660E\uFF0C\u4E0D\u8D4B\u503C\uFF0C\u6709\u4E00\u4E2A\u9ED8\u8BA4\u503C\uFF1A&quot;&quot;</span>
  length <span class="token builtin">int</span> 		<span class="token comment">// \u53EA\u58F0\u660E\uFF0C\u4E0D\u8D4B\u503C\uFF0C\u6709\u4E00\u4E2A\u9ED8\u8BA4\u503C\uFF1A0</span>
  sb <span class="token builtin">bool</span> 		  <span class="token comment">// \u53EA\u58F0\u660E\uFF0C\u4E0D\u8D4B\u503C\uFF0C\u54DF\u4E00\u4E2A\u9ED8\u8BA4\u503C\uFF1Afalse</span>
  hobby <span class="token operator">=</span> <span class="token string">&quot;\u5927\u4FDD\u5065&quot;</span>
  salary <span class="token operator">=</span> <span class="token number">100000</span>
<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u4F5C\u7528\u57DF" tabindex="-1"><a class="header-anchor" href="#\u4F5C\u7528\u57DF" aria-hidden="true">#</a> \u4F5C\u7528\u57DF</h3><p>\u5982\u679C\u6211\u4EEC\u5B9A\u4E49\u4E86\u5927\u62EC\u53F7\uFF0C\u6211\u4EEC\u5728\u91CC\u9762\u5B9A\u4E49\u4E86\u53D8\u91CF</p><ul><li>\u4E0D\u80FD\u88AB\u5B83\u7684\u4E0A\u7EA7\u4F7F\u7528</li><li>\u53EF\u4EE5\u5728\u540C\u7EA7\u4F7F\u7528</li></ul><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">if</span> <span class="token boolean">true</span> <span class="token punctuation">{</span>
		age3 <span class="token operator">:=</span> <span class="token number">12</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>age3<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>age3<span class="token punctuation">)</span> <span class="token comment">// \u62A5\u9519 undefined: age3</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>\u53EF\u4EE5\u5728\u5B50\u7EA7\u522B\u4F7F\u7528</li><li>\u7236\u7EA7\u548C\u5B50\u7EA7\u6709\u4E00\u4E2A\u540C\u540D\u79F0\u7684\u53D8\u91CF\uFF0C\u5927\u62EC\u53F7\u5185\u7684\u53D8\u91CF\u5982\u679C\u5B9A\u4E49\u4E86\uFF0C\u4E0D\u548C\u4E0A\u7EA7\u7684\u53D8\u91CF\u8FDB\u884C\u51B2\u7A81\uFF0C\u4E92\u76F8\u72EC\u7ACB</li><li>\u4F18\u5148\u4F1A\u4ECE\u81EA\u5DF1\u7684\u7EA7\u522B\u7684\u5F00\u59CB\u627E\uFF0C\u6162\u6162\u5F80\u4E0A\u627E\uFF0C\u6700\u7EC8\u90FD\u627E\u4E0D\u5230\u5C31\u4F1A\u62A5\u9519</li></ul><h4 id="\u5168\u5C40\u53D8\u91CF\u548C\u5C40\u90E8\u53D8\u91CF" tabindex="-1"><a class="header-anchor" href="#\u5168\u5C40\u53D8\u91CF\u548C\u5C40\u90E8\u53D8\u91CF" aria-hidden="true">#</a> \u5168\u5C40\u53D8\u91CF\u548C\u5C40\u90E8\u53D8\u91CF</h4><ul><li>\u5168\u5C40\u53D8\u91CF\uFF1A\u5728\u4E00\u4E2A<code>go</code>\u6587\u4EF6\u4E0D\u5728\u51FD\u6570\u91CC\u5B9A\u4E49\u7684\u53D8\u91CF\uFF0C\u662F\u9879\u76EE\u4E2D\u5BFB\u627E\u53D8\u91CF\u7684\u6700\u540E\u4E00\u73AF</li><li>\u5C40\u90E8\u53D8\u91CF\uFF1A\u5728\u4E00\u4E2A\u51FD\u6570\u91CC\uFF0C\u5927\u62EC\u53F7\u91CC\u7684\u90FD\u53EB\u5C40\u90E8\u53D8\u91CF\uFF0C\u53EF\u4EE5\u4F7F\u7528\u4EFB\u610F\u65B9\u5F0F\u7B80\u5316</li></ul><p><strong>\u5168\u5C40\u53D8\u91CF\u91CC\uFF0C\u4E0D\u53EF\u4EE5\u4F7F\u7528\u7B80\u5199\u65B9\u5F0F<code>:=</code></strong>\uFF0C\u53E6\u5916\u4E24\u79CD\u65B9\u5F0F\u90FD\u53EF\u4EE5\uFF0C\u4E5F\u53EF\u4EE5\u57FA\u4E8E\u56E0\u5F0F\u5206\u89E3\u65B9\u5F0F\u3002</p><h3 id="\u8D4B\u503C\u53CA\u5185\u5B58\u76F8\u5173" tabindex="-1"><a class="header-anchor" href="#\u8D4B\u503C\u53CA\u5185\u5B58\u76F8\u5173" aria-hidden="true">#</a> \u8D4B\u503C\u53CA\u5185\u5B58\u76F8\u5173</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>name <span class="token operator">:=</span> <span class="token string">&quot;wujie&quot;</span> <span class="token comment">// name\u7684\u53D8\u91CF\u6307\u5411\u4E86\u5185\u5B58\u91CC\u5B58\u50A8wujie\u7684\u4F4D\u7F6E</span>

nickname <span class="token operator">:=</span> name <span class="token comment">// \u4F1A\u518D\u91CD\u65B0\u62F7\u8D1D\u4E00\u4EFD\u6570\u636E\uFF0C\u8BA9nickname\u6307\u5411\u62F7\u8D1D\u540E\u7684\u5730\u5740</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>\u8FD9\u4E00\u70B9\u4E0E Python \u4E0D\u540C</strong></p><p>\u8F93\u51FA\u4E0B\u5185\u5B58\u5730\u5740\u6765\u5BF9\u6BD4\u4E00\u4E0B</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	name <span class="token operator">:=</span> <span class="token string">&quot;wujie&quot;</span>
	nickname <span class="token operator">:=</span> name

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>name<span class="token punctuation">,</span> <span class="token operator">&amp;</span>name<span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>nickname<span class="token punctuation">,</span> <span class="token operator">&amp;</span>nickname<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">// \u8F93\u51FA\u7ED3\u679C</span>
wujie <span class="token number">0x14000104220</span>
wujie <span class="token number">0x14000104230</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>\u4E24\u8005\u7684\u5185\u5B58\u5730\u5740\u662F\u4E0D\u4E00\u6837\u7684</strong></p><hr><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>name <span class="token operator">:=</span> <span class="token string">&quot;wujie&quot;</span>
nickname <span class="token operator">:=</span> name
name <span class="token operator">=</span> <span class="token string">&quot;666&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>name \u539F\u5148\u6307\u5411\u7684\u5730\u5740\u4E0D\u53D8\uFF0C\u4F46\u662F\u5176\u5730\u5740\u5BF9\u5E94\u7684\u503C\u4F1A\u88AB\u8986\u76D6</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	name <span class="token operator">:=</span> <span class="token string">&quot;wujie&quot;</span>
	nickname <span class="token operator">:=</span> name

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>name<span class="token punctuation">,</span> <span class="token operator">&amp;</span>name<span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>nickname<span class="token punctuation">,</span> <span class="token operator">&amp;</span>nickname<span class="token punctuation">)</span>

	name <span class="token operator">=</span> <span class="token string">&quot;666&quot;</span>

	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>name<span class="token punctuation">,</span> <span class="token operator">&amp;</span>name<span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>nickname<span class="token punctuation">,</span> <span class="token operator">&amp;</span>nickname<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">// \u8F93\u51FA\u7ED3\u679C</span>
wujie <span class="token number">0x14000010240</span>
wujie <span class="token number">0x14000010250</span>
<span class="token number">666</span> <span class="token number">0x14000010240</span>		<span class="token comment">// \u5185\u5B58\u5730\u5740\u4E0D\u4F1A\u6539\uFF0C\u503C\u4F1A\u8FDB\u884C\u8986\u76D6</span>
wujie <span class="token number">0x14000010250</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>\u6CE8\u610F\u4E8B\u9879\uFF1A</strong></p><blockquote><p>\u4F7F\u7528 int\u3001string\u3001bool \u8FD9\u4E09\u79CD\u6570\u636E\u7C7B\u578B\u65F6\uFF0C\u5982\u679C\u9047\u5230\u53D8\u91CF\u7684\u8D4B\u503C\u5219\u4F1A\u62F7\u8D1D\u4E00\u4EFD\u3002\u3010\u503C\u7C7B\u578B\u3011</p></blockquote><h2 id="\u5E38\u91CF" tabindex="-1"><a class="header-anchor" href="#\u5E38\u91CF" aria-hidden="true">#</a> \u5E38\u91CF</h2><blockquote><p>\u4E0D\u53EF\u4FEE\u6539\u7684\u503C</p></blockquote><p>\u5173\u952E\u5B57<code>const</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">const</span> age <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">98</span> <span class="token comment">// \u5B9A\u4E49\u5E38\u91CF,\u4E0D\u80FD\u88AB\u4FEE\u6539</span>

<span class="token comment">// \u6216\u8005</span>
<span class="token keyword">const</span> age <span class="token operator">=</span> <span class="token number">98</span> <span class="token comment">// \u6CA1\u6709\u5192\u53F7\u7684\u7B80\u5199\u65B9\u5F0F</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u56E0\u5F0F\u5206\u89E3</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">const</span> <span class="token punctuation">(</span>
	age <span class="token operator">=</span> <span class="token number">18</span>
  v1 <span class="token operator">=</span> <span class="token number">123</span>
  v2 <span class="token operator">=</span> <span class="token string">&quot;dqwdwq&quot;</span>
  v3 <span class="token builtin">int</span> <span class="token comment">// \u9519\u8BEF\uFF0C\u8981\u6C42\u5728\u5B9A\u4E49\u5E38\u91CF\u7684\u65F6\u5019\u5FC5\u987B\u628A\u503C\u8D4B\u4E0A</span>
<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5E38\u91CF\u57FA\u672C\u90FD\u653E\u5728\u5168\u5C40\u3002</p><h3 id="iota" tabindex="-1"><a class="header-anchor" href="#iota" aria-hidden="true">#</a> iota</h3><p>\u53EF\u6709\u53EF\u65E0\uFF0C\u53EF\u4EE5\u5F53\u505A\u5728\u58F0\u660E\u5E38\u91CF\u65F6\u7684\u4E00\u4E2A\u8BA1\u6570\u5668</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">const</span> <span class="token punctuation">(</span>
	v1 <span class="token operator">=</span> <span class="token number">1</span>
	v2 <span class="token operator">=</span> <span class="token number">3</span>
	v3 <span class="token operator">=</span> <span class="token number">4</span>
	v4 <span class="token operator">=</span> <span class="token number">5</span>
<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7B80\u5199\u65B9\u5F0F</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">const</span> <span class="token punctuation">(</span>
	v1 <span class="token operator">=</span> <span class="token boolean">iota</span>
	v2
	v3
	v4
<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u9ED8\u8BA4\u4F1A\u4ECE 0 \u5F00\u59CB\u8BA1\u6570\uFF0C\u4E0B\u9762+1</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">const</span> <span class="token punctuation">(</span>
	v1 <span class="token operator">=</span> <span class="token boolean">iota</span> <span class="token operator">+</span> <span class="token number">1</span> <span class="token comment">// \u4F1A\u4ECE1\u5F00\u59CB\u5F80\u4E0B\u8BA1\u6570</span>
	v2
	v3
	v4
<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u9694\u65AD\u4E00\u4E2A\u503C</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">const</span> <span class="token punctuation">(</span>
	v1 <span class="token operator">=</span> <span class="token boolean">iota</span> <span class="token operator">+</span> <span class="token number">2</span>
  <span class="token boolean">_</span> <span class="token comment">// \u4E0B\u5212\u7EBF</span>
	v2
	v3
	v4
<span class="token punctuation">)</span>

<span class="token comment">// \u8F93\u51FA\uFF1A 2 4 5 6 7</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">const</span> <span class="token punctuation">(</span>
	v1 <span class="token operator">=</span> <span class="token boolean">iota</span>
	v2
	v3
	v4
<span class="token punctuation">)</span>

<span class="token keyword">const</span> <span class="token punctuation">(</span>
	n1 <span class="token operator">=</span> <span class="token boolean">iota</span> <span class="token comment">// \u4E0D\u4F1A\u548C\u4E0A\u4E00\u4E2Aiota\u7EE7\u7EED\uFF0C\u4F1A\u91CD\u65B0\u4ECE0\u5F00\u59CB</span>
  n2
  n3
<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u8F93\u5165" tabindex="-1"><a class="header-anchor" href="#\u8F93\u5165" aria-hidden="true">#</a> \u8F93\u5165</h2><p>\u7528\u6237\u8F93\u5165\u6570\u636E\uFF0C\u5B8C\u6210\u9879\u76EE\u4EA4\u4E92\u3002</p><ul><li>fmt.Scan</li><li>fmt.Scanln(\u7528\u7684\u6BD4\u8F83\u591A)</li><li>fmt.Scanf</li></ul><p>\u793A\u4F8B 1\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> name <span class="token builtin">string</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u8BF7\u8F93\u5165\u7528\u6237\u540D:&quot;</span><span class="token punctuation">)</span>

	fmt<span class="token punctuation">.</span><span class="token function">Scan</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>name<span class="token punctuation">)</span> <span class="token comment">// \u628Aname\u53D8\u91CF\u7684\u5185\u5B58\u5730\u5740\u653E\u8FDB\u6765\uFF0C\u7ED9\u5185\u5B58\u5730\u5740\u6307\u5411\u7684\u7A7A\u95F4\u8D4B\u503C\u7684\u8FC7\u7A0B</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>name<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>\u8BF7\u8F93\u5165\u7528\u6237\u540D<span class="token punctuation">:</span>
wujie
wujie

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><p>\u793A\u4F8B 2\uFF1A</p><p>\u5728\u7F16\u8F91\u5668\u91CC\u4F1A\u6E05\u695A\u5730\u770B\u5230 Scan \u6CDB\u9EC4\uFF0C\u5176\u5B9E Scan \u8FD8\u6709 2 \u4E2A\u8FD4\u56DE\u503C</p><p>\u5F53\u4F7F\u7528 Scan \u65F6\uFF0C\u4F1A\u63D0\u793A\u7528\u6237\u8F93\u5165\uFF0C\u7528\u6237\u8F93\u5165\u5B8C\u4E4B\u540E\uFF0C\u4F1A\u5F97\u5230\u4E24\u4E2A\u503C\uFF1A</p><ul><li>count\uFF0C\u7528\u6237\u8F93\u5165\u4E86\u51E0\u4E2A\u503C</li><li>err\uFF0C\u5F53\u7528\u6237\u8F93\u5165\u7684\u8FC7\u7A0B\u4E2D\u51FA\u73B0\u9519\u8BEF\u4E86\uFF0C\u5C31\u5305\u542B\u4E86\u9519\u8BEF\u4FE1\u606F</li></ul><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> name <span class="token builtin">string</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u8BF7\u8F93\u5165\u7528\u6237\u540D:&quot;</span><span class="token punctuation">)</span>

	count<span class="token punctuation">,</span> err <span class="token operator">:=</span> fmt<span class="token punctuation">.</span><span class="token function">Scan</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>name<span class="token punctuation">)</span> <span class="token comment">// \u628Aname\u53D8\u91CF\u7684\u5185\u5B58\u5730\u5740\u653E\u8FDB\u6765\uFF0C\u7ED9\u5185\u5B58\u5730\u5740\u6307\u5411\u7684\u7A7A\u95F4\u8D4B\u503C\u7684\u8FC7\u7A0B</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>count<span class="token punctuation">,</span> err<span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>name<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>\u8BF7\u8F93\u5165\u7528\u6237\u540D<span class="token punctuation">:</span>
ddqwd
<span class="token number">1</span> <span class="token operator">&lt;</span><span class="token boolean">nil</span><span class="token operator">&gt;</span>
ddqwd

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>nil \u4EE3\u8868\u6CA1\u6709\u9519\u8BEF</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">var</span> name <span class="token builtin">string</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u8BF7\u8F93\u5165\u7528\u6237\u540D:&quot;</span><span class="token punctuation">)</span>

	<span class="token comment">//count, err := fmt.Scan(&amp;name) // \u628Aname\u53D8\u91CF\u7684\u5185\u5B58\u5730\u5740\u653E\u8FDB\u6765\uFF0C\u7ED9\u5185\u5B58\u5730\u5740\u6307\u5411\u7684\u7A7A\u95F4\u8D4B\u503C\u7684\u8FC7\u7A0B</span>
	<span class="token boolean">_</span><span class="token punctuation">,</span> err <span class="token operator">:=</span> fmt<span class="token punctuation">.</span><span class="token function">Scan</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>name<span class="token punctuation">)</span> <span class="token comment">// \u4F7F\u7528\u4E0B\u5212\u7EBF\u6765\u4EE3\u66FF\u4E0D\u4F7F\u7528\u7684\u53D8\u91CF</span>
	<span class="token keyword">if</span> err <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span> <span class="token comment">// \u9519\u8BEF\u4FE1\u606F\u4E3A\u7A7A\uFF0C\u4EE3\u8868\u6CA1\u9519\uFF0C\u8FD9\u91CC\u5BB9\u6613\u88AB\u5355\u8BCD\u8BEF\u89E3</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>name<span class="token punctuation">)</span>
	<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u7528\u6237\u8F93\u5165\u9519\u8BEF&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>\u7279\u522B\u8BF4\u660E\uFF1Afmt.Scan \u8981\u6C42\u4F60\u8F93\u5165 2 \u4E2A\u503C\uFF0C\u5C31\u5FC5\u987B\u8F93\u5165 2 \u4E2A\u503C\uFF0C\u5426\u5219\u4F1A\u4E00\u76F4\u7B49\u5F85</strong></p><hr><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> name <span class="token builtin">string</span>
<span class="token boolean">_</span><span class="token punctuation">,</span> err <span class="token operator">:=</span> fmt<span class="token punctuation">.</span><span class="token function">Scanln</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>name<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>name<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u6548\u679C\u4E0A\u548C Scan \u5DEE\u4E0D\u591A</p></blockquote><p><strong>\u5DEE\u522B\uFF1AScan \u5FC5\u987B\u90FD\u8F93\u5B8C\uFF0CScanln \u7B49\u5F85\u56DE\u8F66\uFF0C\u53EA\u8981\u4E00\u6309\u4E0B\u56DE\u8F66\uFF0C\u5C31\u7B97\u4F60\u8F93\u5165\u5B8C\u4E86\uFF1B\u5176\u4ED6\u5168\u90FD\u662F\u4E00\u6837\u7684\u3002</strong></p><hr><blockquote><p>Scanf \u5C31\u662F\u683C\u5F0F\u5316\u8F93\u5165\uFF0C\u7B2C\u4E00\u4E2A\u8F93\u5165\u4E00\u4E2A\u5E26\u5360\u4F4D\u7B26\u7684\u683C\u5F0F\uFF0C\u7B2C\u4E8C\u4E2A\u548C\u4E0A\u9762\u4E00\u6837\uFF1B\u652F\u6301\u6709\u6A21\u677F\u7684\u65B9\u5F0F\u8BA9\u7528\u6237\u8F93\u5165\u3002</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> name <span class="token builtin">string</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u8BF7\u8F93\u5165\u7528\u6237\u540D&quot;</span><span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Scanf</span><span class="token punctuation">(</span><span class="token string">&quot;\u6211\u53EB%s&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>name<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>name<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> name <span class="token builtin">string</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u8BF7\u8F93\u5165\u7528\u6237\u540D&quot;</span><span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Scanf</span><span class="token punctuation">(</span><span class="token string">&quot;\u6211\u53EB%s\u4ECA\u5E7418\u5C81&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>name<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>name<span class="token punctuation">)</span>

<span class="token comment">// \u5982\u679C\u8F93\u5165\uFF1A\u6211\u53EBXXX\u4ECA\u5E7418\u5C81</span>
<span class="token comment">// \u8F93\u51FA\uFF1Axxx\u4ECA\u5E7418\u5C81 \u6B64\u65F6name = xxx\u4ECA\u5E7418\u5C81</span>
<span class="token comment">// go\u5B98\u65B9\u8BA9\u6211\u4EEC\u4F7F\u7528\u7A7A\u683C\u9694\u5F00\u8FDB\u884C\u8F93\u5165</span>
<span class="token comment">// \u8F93\u5165\uFF1A\u6211\u53EBxxx \u4ECA\u5E7418\u5C81</span>

<span class="token keyword">var</span> age <span class="token builtin">int</span>
fmt<span class="token punctuation">.</span><span class="token function">Scanf</span><span class="token punctuation">(</span><span class="token string">&quot;\u6211\u53EB%s \u4ECA\u5E74%d \u5C81&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>name<span class="token punctuation">,</span> <span class="token operator">&amp;</span>age<span class="token punctuation">)</span>
<span class="token comment">// \u5982\u679C%d\u540E\u9762\u4E5F\u6709\u6570\u5B57\uFF0C\u4F1A\u5C06\u6570\u5B57\u4E5F\u5E26\u7740\u8F93\u51FA\uFF0C\u6240\u4EE5\u8FD9\u91CC\u90FD\u4E3B\u52A8\u52A0\u4E0A\u62EC\u53F7</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u8FD4\u56DE\u7684\u4E24\u4E2A\u53D8\u91CF\u90FD\u4E0D\u60F3\u8981</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> name <span class="token builtin">string</span>
<span class="token boolean">_</span><span class="token punctuation">,</span> <span class="token boolean">_</span> <span class="token operator">=</span> fmt<span class="token punctuation">.</span><span class="token function">Scanln</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>name<span class="token punctuation">)</span> <span class="token comment">// \u8FD9\u91CC\u76F4\u63A5\u4F7F\u7528 = \uFF0C\u4E0D\u7528 := ,\u56E0\u4E3A:= \u4F1A\u6709\u76F8\u5F53\u4E8E\u58F0\u660E\u4E862\u4E2A\u540C\u540D\u7684\u53D8\u91CF\u7684\u9519\u8BEF</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><hr><p><strong>\u65E0\u6CD5\u89E3\u51B3\u7684\u95EE\u9898</strong></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> message <span class="token builtin">string</span>

fmt<span class="token punctuation">.</span><span class="token function">Scanln</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>message<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>message<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u5047\u5982\u4F60\u8F93\u5165\uFF1A\u5E26\u6211\u53BB\u591A\u65E0\u7FA4\u591A\u7684\u53BB &quot;\u7A7A\u683C\u624B\u52A8\u63CF\u8FF0&quot; \u5E26\u6211\u5E26\u6211\u7FA4\u591A\u524D\u7AEF\u53BB</p><p>\u6B64\u65F6\uFF0C\u5C31\u53EA\u4F1A\u8F93\u51FA\u7A7A\u683C\u4E4B\u524D\u7684\u5185\u5BB9</p></blockquote><p>**\u89E3\u51B3\u529E\u6CD5\uFF0C\u4F7F\u7528<code>os.Stdin</code>**\u83B7\u53D6\u7EC8\u7AEF\u8F93\u5165\uFF0C\u83B7\u53D6\u5305\u542B\u7A7A\u683C\u7684\u5185\u5BB9\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;bufio&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;os&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  reader <span class="token operator">:=</span> bufio<span class="token punctuation">.</span><span class="token function">NewReader</span><span class="token punctuation">(</span>os<span class="token punctuation">.</span>Stdin<span class="token punctuation">)</span>
  <span class="token comment">// reader\u9ED8\u8BA4\u4E00\u6B21\u80FD\u8BFB4096\u4E2A\u5B57\u8282 (4096 / 3)\u4E2A\u6C49\u5B57\uFF0C\u5982\u679C\u4E00\u6B21\u8BFB\u5B8C\u4E86\uFF0CisPrefix = false\uFF1B\u8BFB\u4E0D\u5B8C\uFF0C\u5148\u8BFB\u4E00\u90E8\u5206\uFF0CisPrefix=true\uFF0C\u518D\u53BB\u8BFB\u4E00\u884C\uFF0C\u5982\u679C\u8BFB\u5B8C\u4E86\uFF0CisPrefix=false</span>
	<span class="token comment">// line, isPrefix, err := reader.ReadLine() // \u8BFB\u4E00\u884C</span>
  line<span class="token punctuation">,</span> <span class="token boolean">_</span><span class="token punctuation">,</span> <span class="token boolean">_</span> <span class="token operator">:=</span> reader<span class="token punctuation">.</span><span class="token function">ReadLine</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u6240\u6709\u7684\u90FD\u4E00\u6837\u624D\u9700\u8981\u53BB\u6389\u5192\u53F7</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>line<span class="token punctuation">,</span> isPrefix<span class="token punctuation">,</span> err<span class="token punctuation">)</span>
  data <span class="token operator">:=</span> <span class="token function">string</span><span class="token punctuation">(</span>line<span class="token punctuation">)</span> <span class="token comment">// \u8F6C\u6362\u6210\u529F\u540E\u7684\u5B57\u7B26\u4E32</span>
  fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>line\uFF1A\u4ECE stdin \u4E2D\u8BFB\u53D6\u7684\u4E00\u884C\u7684\u6570\u636E(\u5B57\u8282\u96C6\u5408\uFF0C\u53EF\u4EE5\u8F6C\u5316\u6210\u4E3A\u5B57\u7B26\u4E32)</li><li>isPrefix: \u53EA\u6709\u4E00\u6B21\u8BFB\u5B8C\u4E86\uFF0CisPrefix \u624D\u4E3A false\uFF0C\u8BFB\u4E0D\u5B8C\u90FD\u662F true</li></ul><h2 id="\u6761\u4EF6\u8BED\u53E5" tabindex="-1"><a class="header-anchor" href="#\u6761\u4EF6\u8BED\u53E5" aria-hidden="true">#</a> \u6761\u4EF6\u8BED\u53E5</h2><h3 id="\u6700\u57FA\u672C" tabindex="-1"><a class="header-anchor" href="#\u6700\u57FA\u672C" aria-hidden="true">#</a> \u6700\u57FA\u672C</h3><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">if</span> \u6761\u4EF6 <span class="token punctuation">{</span>
  \u6210\u7ACB\u540E\u4EE3\u7801\u6267\u884C
<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
  \u4E0D\u6210\u7ACB\uFF0C\u6B64\u4EE3\u7801\u6267\u884C
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="for-\u5FAA\u73AF" tabindex="-1"><a class="header-anchor" href="#for-\u5FAA\u73AF" aria-hidden="true">#</a> for \u5FAA\u73AF</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token comment">// for \u5FAA\u73AF</span>
<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// 1. \u57FA\u672Cfor\u5FAA\u73AF</span>
	<span class="token comment">//for i := 0; i &lt; 10; i++ {</span>
	<span class="token comment">//	fmt.Println(i)</span>
	<span class="token comment">//}</span>

	<span class="token comment">// 2. \u7701\u7565\u521D\u59CB\u8BED\u53E5\uFF0C\u5FC5\u987B\u4FDD\u7559\u521D\u59CB\u8BED\u53E5\u540E\u9762\u7684\u5206\u53F7</span>
	<span class="token comment">//var i = 0</span>
	<span class="token comment">//for ; i &lt; 10; i++ {</span>
	<span class="token comment">//	fmt.Println(i)</span>
	<span class="token comment">//}</span>

	<span class="token comment">// 3. \u7701\u7565\u521D\u59CB\u8BED\u53E5\u548C\u7ED3\u675F\u8BED\u53E5</span>
	<span class="token comment">//var i = 10</span>
	<span class="token comment">//for i &gt; 0 {</span>
	<span class="token comment">//	fmt.Println(i)</span>
	<span class="token comment">//	i--</span>
	<span class="token comment">//}</span>

	<span class="token comment">// 4. \u6B7B\u5FAA\u73AF</span>
	<span class="token comment">//for {</span>
	<span class="token comment">//	fmt.Println(&quot;hello world&quot;)</span>
	<span class="token comment">//}</span>

	<span class="token comment">// 5. break\u8DF3\u51FA\u5FAA\u73AF</span>
	<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">5</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>

		<span class="token keyword">if</span> i <span class="token operator">==</span> <span class="token number">3</span> <span class="token punctuation">{</span>
			<span class="token comment">//break</span>
			<span class="token keyword">continue</span> <span class="token comment">// \u7EE7\u7EED\u4E0B\u4E00\u6B21\u5FAA\u73AF</span>
		<span class="token punctuation">}</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5BF9 for \u8FDB\u884C\u6253\u6807\u7B7E\uFF0C\u7136\u540E\u901A\u8FC7 break \u548C continue \u5C31\u53EF\u4EE5\u5B9E\u73B0\u591A\u5C42\u5FAA\u73AF\u7684\u8DF3\u51FA\u548C\u7EC8\u6B62\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>f1<span class="token punctuation">:</span>
		<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">3</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
			<span class="token keyword">for</span> j <span class="token operator">:=</span> <span class="token number">1</span><span class="token punctuation">;</span> j <span class="token operator">&lt;</span> <span class="token number">5</span><span class="token punctuation">;</span> j<span class="token operator">++</span> <span class="token punctuation">{</span>
				<span class="token keyword">if</span> j <span class="token operator">==</span> <span class="token number">3</span> <span class="token punctuation">{</span>
					<span class="token keyword">continue</span> f1
				<span class="token punctuation">}</span>
				fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>i<span class="token punctuation">,</span> j<span class="token punctuation">)</span>
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>

<span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span> \u8F93\u51FA<span class="token punctuation">:</span>
<span class="token number">0</span> <span class="token number">1</span>
<span class="token number">0</span> <span class="token number">2</span>
<span class="token number">1</span> <span class="token number">1</span>
<span class="token number">1</span> <span class="token number">2</span>
<span class="token number">2</span> <span class="token number">1</span>
<span class="token number">2</span> <span class="token number">2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>f1<span class="token punctuation">:</span>
		<span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">3</span><span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
			<span class="token keyword">for</span> j <span class="token operator">:=</span> <span class="token number">1</span><span class="token punctuation">;</span> j <span class="token operator">&lt;</span> <span class="token number">5</span><span class="token punctuation">;</span> j<span class="token operator">++</span> <span class="token punctuation">{</span>
				<span class="token keyword">if</span> j <span class="token operator">==</span> <span class="token number">3</span> <span class="token punctuation">{</span>
					<span class="token keyword">break</span> f1
				<span class="token punctuation">}</span>
				fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>i<span class="token punctuation">,</span> j<span class="token punctuation">)</span>
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>


<span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span> \u8F93\u51FA\uFF1A
<span class="token number">1</span> <span class="token number">1</span>
<span class="token number">1</span> <span class="token number">2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u6570\u503C\u7C7B\u578B\u8303\u56F4" tabindex="-1"><a class="header-anchor" href="#\u6570\u503C\u7C7B\u578B\u8303\u56F4" aria-hidden="true">#</a> \u6570\u503C\u7C7B\u578B\u8303\u56F4</h2><p>\u8303\u56F4</p><p><strong>\u6709\u7B26\u53F7\u4F4D</strong></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token builtin">int8</span>  <span class="token comment">// 1\u4E2A\u5B57\u8282	-2^7 ~ 2^7-1</span>
<span class="token builtin">int16</span>  <span class="token comment">// 2\u4E2A\u5B57\u8282	-2^15 ~ 2^15-1</span>
<span class="token builtin">int32</span> <span class="token comment">// 4\u4E2A\u5B57\u8282	-2^31 ~ 2^31-1</span>
<span class="token builtin">int64</span> <span class="token comment">// 8\u4E2A\u5B57\u8282	-2^63 ~ 2^63-1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>\u65E0\u7B26\u53F7\u4F4D</strong></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token builtin">uint8</span> 	<span class="token comment">// 1</span>
<span class="token builtin">uint16</span>	<span class="token comment">// 2</span>
<span class="token builtin">uint32</span>	<span class="token comment">// 4</span>
<span class="token builtin">uint64</span>	<span class="token comment">// 8</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u5FEB\u901F\u8BB0\u5FC6\uFF0C\u4E00\u4E2A\u5B57\u8282\u5360 8 \u4F4D\uFF0C\u5C31\u6309\u7167\u7B2C\u4E00\u4E2A int8 \u7684\u6765\u8FDB\u884C\u8BB0\u5FC6\uFF0C\u540E\u9762<code>int16</code>\u5C31\u4F7F\u7528 16/8 \u7684\u65B9\u5F0F\u6765\u7B97\u5360\u591A\u5C11\u4E2A\u5B57\u8282\u3002\u8FD9\u4E2A\u8303\u56F4\uFF0C\u4E5F\u662F\u6309\u7167\u7B2C\u4E00\u4E2A\u6765\u7B97\uFF0C\u627E\u89C4\u5F8B\u3002</p><p>\u65E0\u7B26\u53F7\u7684\u8303\u56F4\uFF0C\u90FD\u662F\u4ECE 0 \u5F00\u59CB\uFF0C\u5230\u5BF9\u5E94\u7684 <code>2^\u591A\u5C11\u6B21\u65B9-1</code>\uFF0C<code>uint\u591A\u5C11</code>\u5C31\u662F\u591A\u5C11\u6B21\u65B9\u3002</p></div><p><strong>\u6253\u5370\u6570\u636E\u7C7B\u578B\u7684\u65B9\u6CD5</strong></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;\u53D8\u91CF\u540D: %T\\n&quot;</span><span class="token punctuation">,</span> \u53D8\u91CF<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>\u6253\u5370\u5360\u7528\u7A7A\u95F4\u5927\u5C0F\u7684\u65B9\u6CD5</strong></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>unsafe<span class="token punctuation">.</span><span class="token function">Sizeof</span><span class="token punctuation">(</span>\u53D8\u91CF<span class="token punctuation">)</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,121),p=[i];function o(l,c){return s(),a("div",null,p)}var r=n(t,[["render",o],["__file","base.html.vue"]]);export{r as default};
