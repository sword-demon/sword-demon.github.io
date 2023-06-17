import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.4f95672f.js";const t={},c=e(`<h2 id="\u6587\u4EF6\u5305\u542B" tabindex="-1"><a class="header-anchor" href="#\u6587\u4EF6\u5305\u542B" aria-hidden="true">#</a> \u6587\u4EF6\u5305\u542B</h2><p><strong>C \u8BED\u8A00\u7684\u7F16\u8BD1\u8FC7\u7A0B</strong></p><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220528155152.png" alt="C\u8BED\u8A00\u7684\u7F16\u8BD1\u8FC7\u7A0B" loading="lazy"></p><blockquote><p>\u9884\u5904\u7406\u5C31\u662F\u5B8F\u7684\u4E8B\u60C5\uFF0C\u5E38\u89C1\u7684\u5C31\u662F\u4EE5\u5C0F\u535A\u5927\u7684\u4E8B\u60C5\uFF0C\u6700\u5E38\u89C1\u7684\u5C31\u662F\u6587\u4EF6\u5305\u542B\uFF1A<code>include</code>\uFF0C\u8FD9\u4E9B\u5934\u6587\u4EF6\u975E\u5E38\u7684\u591A\u3002</p></blockquote><div class="language-c ext-c line-numbers-mode"><pre class="language-c"><code><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;stdio.h&gt;</span></span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">puts</span><span class="token punctuation">(</span><span class="token string">&quot;hello world&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4E00\u4E2A\u7B80\u5355\u7684\u4F8B\u5B50\uFF0C<code>puts</code>\u51FD\u6570\u5C31\u5728<code>stdio</code>\u5934\u6587\u4EF6\u4E2D\u8FDB\u884C\u4E86\u58F0\u660E\u548C\u51FD\u6570\u539F\u578B\u3002\u6211\u4EEC\u53EF\u4EE5\u66FF\u6362\u4E3A\uFF1A</p><div class="language-c ext-c line-numbers-mode"><pre class="language-c"><code><span class="token comment">//</span>
<span class="token comment">// Created by virus on 2022/5/28.</span>
<span class="token comment">//</span>

<span class="token keyword">int</span> __cdecl <span class="token function">puts</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token keyword">const</span><span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">puts</span><span class="token punctuation">(</span><span class="token string">&quot;hello world&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6240\u4EE5\u8FD9\u91CC\uFF0C\u6211\u4EEC\u5F15\u7528\u5934\u6587\u4EF6\u53EA\u662F\u4E3A\u4E86\u65B9\u4FBF\uFF0C\u5C31\u662F\u4E3A\u4E86\u5F15\u7528\u6211\u4EEC\u9700\u8981\u7684\u4E00\u4E9B\u51FD\u6570\u539F\u578B\uFF0C\u5BFC\u5165\u4E00\u4E2A\u5934\u6587\u4EF6\uFF0C\u6700\u540E\u7F16\u8BD1\u4F1A\u5C55\u5F00\u5BF9\u5E94\u7684\u5185\u5BB9\u90FD\u5F15\u5165\u8FDB\u6765\u6765\u4EE3\u66FF\u5934\u6587\u4EF6\u90E8\u5206\uFF0C<span style="color:green;">\u6700\u540E\u5C55\u5F00\u7684\u5185\u5BB9\u8FD8\u662F\u6839\u636E\u81EA\u5DF1\u7684\u7F16\u8BD1\u5668\u6709\u5173</span>\u3002</p><h2 id="\u81EA\u5B9A\u4E49\u5934\u6587\u4EF6" tabindex="-1"><a class="header-anchor" href="#\u81EA\u5B9A\u4E49\u5934\u6587\u4EF6" aria-hidden="true">#</a> \u81EA\u5B9A\u4E49\u5934\u6587\u4EF6</h2><p>\u8FD9\u91CC\u4F1A\u6709\u4E00\u4E2A\u6CE8\u610F\u70B9\uFF1A</p><p>\u4F7F\u7528\u53CC\u5F15\u53F7\u5BFC\u5165\u5934\u6587\u4EF6\u7684\u7279\u70B9\uFF1A</p><p><code>#include &quot;xxx.h&quot;</code></p><ol><li>\u9996\u5148\u67E5\u627E\u5F53\u524D\u6E90\u6587\u4EF6\u6240\u5728\u8DEF\u5F84</li><li>\u67E5\u627E\u5DE5\u7A0B\u7684\u5934\u6587\u4EF6\u641C\u7D22\u8DEF\u5F84</li></ol><p>\u4F7F\u7528<code>&lt;&gt;</code>\u4F1A\u76F4\u63A5\u67E5\u627E\u5DE5\u7A0B\u7684\u5934\u6587\u4EF6\u641C\u7D22\u8DEF\u5F84,\u5982\u679C\u6B64\u65F6\u5728<code>CMakeLists.txt</code>\u6587\u4EF6\u4E2D\u8BBE\u7F6E</p><div class="language-txt ext-txt line-numbers-mode"><pre class="language-txt"><code>cmake_minimum_required(VERSION 3.19)

get_filename_component(ProjectId \${CMAKE_CURRENT_SOURCE_DIR} NAME)
string(REPLACE &quot; &quot; &quot;_&quot; ProjectId \${ProjectId})
project(\${ProjectId} C)

set(CMAKE_C_STANDARD 11)

# \u8FD9\u4E00\u884C
include_directories(&quot;include&quot;)

file(GLOB files &quot;\${CMAKE_CURRENT_SOURCE_DIR}/*.c&quot;)
foreach(file \${files})
    get_filename_component(name \${file} NAME)
    add_executable(\${name} \${file} src/factorial.c)
endforeach()
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5373\u53EF\u4F7F\u7528<code>&lt;&gt;</code>\u6765\u8FDB\u884C\u5F15\u7528</p><hr><p>\u81EA\u5B9A\u4E49\u4E24\u4E2A\u76EE\u5F55\uFF1A<code>include</code>\u548C<code>src</code>\uFF0C<code>include</code>\u653E\u5934\u6587\u4EF6\uFF0C<code>src</code>\u653E\u6E90\u6587\u4EF6</p><p>\u65B0\u5EFA\u9636\u4E58\u7684\u5934\u6587\u4EF6\uFF1A</p><div class="language-c ext-c line-numbers-mode"><pre class="language-c"><code><span class="token comment">//</span>
<span class="token comment">// Created by virus on 2022/5/29.</span>
<span class="token comment">//</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">ifndef</span> <span class="token expression">HELLOWORLDC_INCLUDE_FACTORIAL_H_</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">HELLOWORLDC_INCLUDE_FACTORIAL_H_</span></span>

<span class="token comment">// \u5728\u4E2D\u95F4\u90E8\u5206\u5199\u5BF9\u5E94\u7684\u5B9E\u73B0\u65B9\u6CD5\u7684\u539F\u578B</span>
<span class="token keyword">unsigned</span> <span class="token keyword">int</span> <span class="token function">Factorial</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">int</span> n<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">unsigned</span> <span class="token keyword">int</span> <span class="token function">FactorialByIteration</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">int</span> n<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span> <span class="token comment">//HELLOWORLDC_INCLUDE_FACTORIAL_H_</span></span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u65B0\u5EFA\u9636\u4E58\u7684\u6E90\u6587\u4EF6</p><div class="language-c ext-c line-numbers-mode"><pre class="language-c"><code><span class="token comment">//</span>
<span class="token comment">// Created by virus on 2022/5/29.</span>
<span class="token comment">//</span>

<span class="token comment">// \u5F15\u5165\u8DEF\u5F84\u5FC5\u987B\u4F7F\u7528\u53CC\u5F15\u53F7\uFF0C\u5C16\u62EC\u53F7\u4E0D\u884C</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&quot;../include/factorial.h&quot;</span></span>

<span class="token keyword">unsigned</span> <span class="token keyword">int</span> <span class="token function">Factorial</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">int</span> n<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>n <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> n <span class="token operator">*</span> <span class="token function">Factorial</span><span class="token punctuation">(</span>n <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">unsigned</span> <span class="token keyword">int</span> <span class="token function">FactorialByIteration</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">int</span> n<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">unsigned</span> <span class="token keyword">int</span> result <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token keyword">unsigned</span> <span class="token keyword">int</span> i <span class="token operator">=</span> n<span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span> i <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">;</span> i<span class="token operator">--</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        result <span class="token operator">*=</span> i<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> result<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6700\u540E\u662F\u4F7F\u7528\u7684\u793A\u4F8B</p><div class="language-c ext-c line-numbers-mode"><pre class="language-c"><code><span class="token comment">//</span>
<span class="token comment">// Created by virus on 2022/5/29.</span>
<span class="token comment">//</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&quot;stdio.h&quot;</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&quot;include/factorial.h&quot;</span></span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;3!=%d\\n&quot;</span><span class="token punctuation">,</span> <span class="token function">Factorial</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u8FD9\u91CC\u8BBE\u7F6E\u4E86<code>CMakeLists.txt</code>\u7684<code>include_directories(&quot;include&quot;)</code>\uFF0C\u8FD9\u91CC\u5F15\u5165\u7684\u5934\u6587\u4EF6\u53EF\u4EE5\u4F7F\u7528\u5C16\u62EC\u53F7\u6765\u4EE3\u66FF\uFF1A<code>#include &lt;factorial.h&gt;</code></p><div class="custom-container tip"><p class="custom-container-title">\u6CE8\u610F\u70B9</p><p>\u6240\u4EE5\u8BF4\uFF0C\u53CC\u5F15\u53F7\u662F\u517C\u5BB9\u7684\uFF0C\u4F46\u662F\u5462\uFF0C\u4F7F\u7528\u53CC\u5F15\u53F7\uFF0C\u7F16\u8BD1\u7684\u65F6\u5019\u4F1A\u9996\u5148\u5728\u672C\u5730\u67E5\u4E00\u904D\uFF0C\u4F1A\u6709\u4E00\u4E2A\u8D44\u6E90\u7684\u5F00\u9500\uFF0C\u4E5F\u6B63\u56E0\u4E3A\u5982\u6B64\uFF0C\u5982\u679C\u4F60\u77E5\u9053\u8FD9\u4E2A\u5934\u6587\u4EF6\u5728\u641C\u7D22\u8DEF\u5F84\u4E0B\uFF0C\u5C31\u4F7F\u7528<code>&lt;&gt;</code>\u8FDB\u884C\u5F15\u5165\u3002</p></div>`,26),i=[c];function p(o,l){return s(),a("div",null,i)}var r=n(t,[["render",p],["__file","file-include.html.vue"]]);export{r as default};
