import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.f2989895.js";const t={},p=e(`<h2 id="\u53D8\u91CF\u5185\u5B58\u5730\u5740\u5206\u6790" tabindex="-1"><a class="header-anchor" href="#\u53D8\u91CF\u5185\u5B58\u5730\u5740\u5206\u6790" aria-hidden="true">#</a> \u53D8\u91CF\u5185\u5B58\u5730\u5740\u5206\u6790</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">//</span>
<span class="token comment">// Created by virus on 2022/5/20.</span>
<span class="token comment">//</span>

#include <span class="token string">&quot;stdio.h&quot;</span>

<span class="token builtin">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// &lt;type&gt; &lt;name&gt;</span>
    <span class="token builtin">int</span> value<span class="token punctuation">;</span> <span class="token comment">// \u4E0D\u8D4B\u503C\u9ED8\u8BA4\u4E3A0</span>

    <span class="token comment">// &lt;type&gt; &lt;name&gt; = &lt;initialized value&gt;</span>
    <span class="token builtin">int</span> value_init <span class="token operator">=</span> <span class="token number">3</span><span class="token punctuation">;</span>

    value <span class="token operator">=</span> <span class="token number">4</span><span class="token punctuation">;</span>
    value_init <span class="token operator">=</span> <span class="token number">5</span><span class="token punctuation">;</span>

    <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;value :%d\\n&quot;</span><span class="token punctuation">,</span> value<span class="token punctuation">)</span><span class="token punctuation">;</span>

    value_init <span class="token operator">=</span> value<span class="token punctuation">;</span>
    <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;size of value: %d\\n&quot;</span><span class="token punctuation">,</span> <span class="token function">sizeof</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// \u6253\u5370\u5B57\u8282\u6570</span>

    <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;address of value: %#x\\n&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// \u6253\u5370\u5341\u516D\u8FDB\u5236\u5185\u5B58\u5730\u5740</span>
    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u8BBF\u95EE\u5185\u5B58\u4E0A\u7684\u6570\u636E\u6307\u4EE4" tabindex="-1"><a class="header-anchor" href="#\u8BBF\u95EE\u5185\u5B58\u4E0A\u7684\u6570\u636E\u6307\u4EE4" aria-hidden="true">#</a> \u8BBF\u95EE\u5185\u5B58\u4E0A\u7684\u6570\u636E\u6307\u4EE4</h2><h3 id="\u901A\u8FC7\u865A\u62DF\u5730\u5740\u522B\u540D\u3010\u53D8\u91CF\u540D\u3001\u51FD\u6570\u540D\u3011\u8BBF\u95EE\u5185\u5B58\u4E0A\u7684\u6570\u636E\u548C\u6307\u4EE4" tabindex="-1"><a class="header-anchor" href="#\u901A\u8FC7\u865A\u62DF\u5730\u5740\u522B\u540D\u3010\u53D8\u91CF\u540D\u3001\u51FD\u6570\u540D\u3011\u8BBF\u95EE\u5185\u5B58\u4E0A\u7684\u6570\u636E\u548C\u6307\u4EE4" aria-hidden="true">#</a> \u901A\u8FC7\u865A\u62DF\u5730\u5740\u522B\u540D\u3010\u53D8\u91CF\u540D\u3001\u51FD\u6570\u540D\u3011\u8BBF\u95EE\u5185\u5B58\u4E0A\u7684\u6570\u636E\u548C\u6307\u4EE4</h3><div class="language-c ext-c line-numbers-mode"><pre class="language-c"><code><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;stdio.h&gt;</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;stdlib.h&gt;</span></span>

<span class="token keyword">int</span> x <span class="token operator">=</span> <span class="token number">10</span><span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">test</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
        <span class="token keyword">return</span> x<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;x=%d\\r\\n&quot;</span><span class="token punctuation">,</span> x<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;x=%p\\r\\n&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>x<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;test=%p\\r\\n&quot;</span><span class="token punctuation">,</span> test<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token keyword">char</span> <span class="token operator">*</span>test_text <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">char</span><span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span>test<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span>i<span class="token punctuation">;</span>i <span class="token operator">&lt;</span> <span class="token number">12</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;%x\\r\\n&quot;</span><span class="token punctuation">,</span> test_text<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><table><thead><tr><th>\u5730\u5740\u522B\u540D</th><th>\u5185\u5B58\u5730\u5740</th><th>\u6307\u4EE4\uFF08\u673A\u5668\u7801\u6307\u4EE4\uFF09</th></tr></thead><tbody><tr><td>test</td><td>40052d</td><td>55</td></tr><tr><td></td><td>40052e</td><td>48</td></tr><tr><td></td><td>40052f</td><td>89</td></tr><tr><td></td><td>400530</td><td>e5</td></tr><tr><td></td><td>400531</td><td>8b</td></tr><tr><td></td><td>400532</td><td>05</td></tr><tr><td></td><td>400533</td><td>fd</td></tr><tr><td></td><td>400534</td><td>0a</td></tr><tr><td></td><td>400535</td><td>20</td></tr><tr><td></td><td>400536</td><td>00</td></tr><tr><td></td><td>400537</td><td>5d</td></tr><tr><td></td><td>400538</td><td>c3</td></tr></tbody></table><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@jb51 memory<span class="token punctuation">]</span><span class="token comment"># gcc demo2.c -o demo2</span>
<span class="token punctuation">[</span>root@jb51 memory<span class="token punctuation">]</span><span class="token comment"># ./demo2</span>
<span class="token assign-left variable">x</span><span class="token operator">=</span><span class="token number">10</span>
<span class="token assign-left variable">x</span><span class="token operator">=</span>0x601034
<span class="token assign-left variable">test</span><span class="token operator">=</span>0x40052d
<span class="token number">55</span>
<span class="token number">48</span>
ffffff89
ffffffe5
ffffff8b
<span class="token number">5</span>
fffffffd
a
<span class="token number">20</span>
<span class="token number">0</span>
5d
ffffffc3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7F16\u8BD1\u5B8C\u4E4B\u540E\uFF0C\u6211\u4EEC\u4F7F\u7528<code>objdump -d demo2</code>\u67E5\u770B<code>test</code>\u51FD\u6570\u5185\u5BB9</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>000000000040052d <span class="token operator">&lt;</span>test<span class="token operator">&gt;</span>:
  40052d:       <span class="token number">55</span>                      push   %rbp
  40052e:       <span class="token number">48</span> <span class="token number">89</span> e5                mov    %rsp,%rbp
  <span class="token number">400531</span>:       8b 05 fd 0a <span class="token number">20</span> 00       mov    0x200afd<span class="token punctuation">(</span>%rip<span class="token punctuation">)</span>,%eax        <span class="token comment"># 601034 &lt;x&gt;</span>
  <span class="token number">400537</span>:       5d                      pop    %rbp
  <span class="token number">400538</span>:       c3                      retq
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u6837\u6211\u4EEC\u4E00\u770B\u5C31\u53EF\u4EE5\u8BFB\u53D6\u5185\u5B58\u4E0A\u7684\u6307\u4EE4\u3002</p><hr><p>\u8BFB\u53D6\u5185\u5B58\u4E0A\u7684\u6570\u636E</p><div class="language-c ext-c line-numbers-mode"><pre class="language-c"><code><span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;x=%d\\r\\n&quot;</span><span class="token punctuation">,</span> x<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5373\u53EF\u5F97\u5230\uFF1A<code>x = 10</code>\u7684\u5185\u5BB9</p><h2 id="\u901A\u8FC7\u865A\u62DF\u5730\u5740\u8BBF\u95EE\u5730\u5740\u4E0A\u7684\u6570\u636E" tabindex="-1"><a class="header-anchor" href="#\u901A\u8FC7\u865A\u62DF\u5730\u5740\u8BBF\u95EE\u5730\u5740\u4E0A\u7684\u6570\u636E" aria-hidden="true">#</a> \u901A\u8FC7\u865A\u62DF\u5730\u5740\u8BBF\u95EE\u5730\u5740\u4E0A\u7684\u6570\u636E</h2><div class="language-c ext-c line-numbers-mode"><pre class="language-c"><code><span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;x=%d\\r\\n&quot;</span><span class="token punctuation">,</span> x<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;x=%p\\r\\n&quot;</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>x<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;test=%p\\r\\n&quot;</span><span class="token punctuation">,</span> test<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;=====================\\r\\n&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">char</span> <span class="token operator">*</span>test_text <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">char</span><span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span>test<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span>i<span class="token punctuation">;</span>i <span class="token operator">&lt;</span> <span class="token number">12</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;%x\\r\\n&quot;</span><span class="token punctuation">,</span> test_text<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;=================\\r\\n&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;%d\\r\\n&quot;</span><span class="token punctuation">,</span> <span class="token operator">*</span><span class="token punctuation">(</span><span class="token keyword">int</span><span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token number">0x60103d</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;=================\\r\\n&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">char</span> j <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span>j <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> j <span class="token operator">&lt;</span> <span class="token number">12</span> <span class="token punctuation">;</span>j<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;%x\\r\\n&quot;</span><span class="token punctuation">,</span> <span class="token operator">*</span><span class="token punctuation">(</span><span class="token keyword">char</span><span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token number">0x40057d</span><span class="token operator">+</span>j<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@jb51 memory<span class="token punctuation">]</span><span class="token comment"># ./demo2</span>
<span class="token assign-left variable">x</span><span class="token operator">=</span><span class="token number">10</span>
<span class="token assign-left variable">x</span><span class="token operator">=</span>0x60103c
<span class="token assign-left variable">test</span><span class="token operator">=</span>0x40057d
<span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">=</span>
<span class="token number">55</span>
<span class="token number">48</span>
ffffff89
ffffffe5
ffffff8b
<span class="token number">5</span>
ffffffb5
a
<span class="token number">20</span>
<span class="token number">0</span>
5d
ffffffc3
<span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">=</span>
<span class="token number">0</span>
<span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">=</span>
<span class="token number">55</span>
<span class="token number">48</span>
ffffff89
ffffffe5
ffffff8b
<span class="token number">5</span>
ffffffb5
a
<span class="token number">20</span>
<span class="token number">0</span>
5d
ffffffc3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u901A\u8FC7<code>readelf -s demo2</code>\u6765\u67E5\u770B\u8D77\u59CB\u7684\u5730\u5740</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code> <span class="token number">50</span>: 000000000060103c     <span class="token number">4</span> OBJECT  GLOBAL DEFAULT   <span class="token number">24</span> x   <span class="token comment"># \u770B\u8FD9\u91CC\u7684\u5730\u5740</span>
    <span class="token number">51</span>: 0000000000400704     <span class="token number">0</span> FUNC    GLOBAL DEFAULT   <span class="token number">14</span> _fini
    <span class="token number">52</span>: 0000000000000000     <span class="token number">0</span> FUNC    GLOBAL DEFAULT  UND printf@@GLIBC_2.2.5
    <span class="token number">53</span>: 0000000000000000     <span class="token number">0</span> FUNC    GLOBAL DEFAULT  UND __libc_start_main@@GLIBC_
    <span class="token number">54</span>: 0000000000601038     <span class="token number">0</span> NOTYPE  GLOBAL DEFAULT   <span class="token number">24</span> __data_start
    <span class="token number">55</span>: 0000000000000000     <span class="token number">0</span> NOTYPE  WEAK   DEFAULT  UND __gmon_start__
    <span class="token number">56</span>: 0000000000400718     <span class="token number">0</span> OBJECT  GLOBAL HIDDEN    <span class="token number">15</span> __dso_handle
    <span class="token number">57</span>: 0000000000400710     <span class="token number">4</span> OBJECT  GLOBAL DEFAULT   <span class="token number">15</span> _IO_stdin_used
    <span class="token number">58</span>: 0000000000400690   <span class="token number">101</span> FUNC    GLOBAL DEFAULT   <span class="token number">13</span> __libc_csu_init
    <span class="token number">59</span>: 0000000000601048     <span class="token number">0</span> NOTYPE  GLOBAL DEFAULT   <span class="token number">25</span> _end
    <span class="token number">60</span>: 0000000000400490     <span class="token number">0</span> FUNC    GLOBAL DEFAULT   <span class="token number">13</span> _start
    <span class="token number">61</span>: 0000000000601040     <span class="token number">0</span> NOTYPE  GLOBAL DEFAULT   <span class="token number">25</span> __bss_start
    <span class="token number">62</span>: 0000000000400589   <span class="token number">255</span> FUNC    GLOBAL DEFAULT   <span class="token number">13</span> main
    <span class="token number">63</span>: 0000000000601040     <span class="token number">0</span> OBJECT  GLOBAL HIDDEN    <span class="token number">24</span> __TMC_END__
    <span class="token number">64</span>: 0000000000400418     <span class="token number">0</span> FUNC    GLOBAL DEFAULT   <span class="token number">11</span> _init
    <span class="token number">65</span>: 000000000040057d    <span class="token number">12</span> FUNC    GLOBAL DEFAULT   <span class="token number">13</span> <span class="token builtin class-name">test</span> <span class="token comment"># \u770B\u8FD9\u91CC\u7684\u5730\u5740</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>x=10</li><li>test=0x40057d</li></ul><blockquote><p>\u901A\u8FC7\u865A\u62DF\u5730\u5740\u7684\u522B\u540D\u3010\u53D8\u91CF\u540D\u3001\u51FD\u6570\u540D\u3011\u8BBF\u95EE\u5185\u5B58\u4E0A\u9762\u5B58\u50A8\u7684\u6570\u636E\u3010\u7A0B\u5E8F\u6570\u636E\u3001\u7A0B\u5E8F\u6307\u4EE4\u3011</p></blockquote><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>0
=================
55
48
ffffff89
ffffffe5
ffffff8b
5
ffffffb5
a
20
0
5d
ffffffc3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u76F4\u63A5\u901A\u8FC7\u865A\u62DF\u5730\u5740\u8FDB\u884C\u8BBF\u95EE\u5185\u5B58\u4E0A\u9762\u5B58\u50A8\u7684\u7A0B\u5E8F\u6570\u636E\u548C\u7A0B\u5E8F\u6307\u4EE4</p></blockquote><p>\u8BBF\u95EE\u5185\u5B58\u5730\u5740\u4E0A\u7684\u6570\u636E\u6D41\u7A0B\uFF1A</p><ol><li>\u5148\u6307\u5B9A\u865A\u62DF\u5730\u5740\u7684\u8D77\u59CB\u5730\u5740</li><li>\u6309\u591A\u5927\u5B57\u8282\u8FDB\u884C\u8BBF\u95EE</li></ol>`,25),o=[p];function i(l,c){return s(),a("div",null,o)}var d=n(t,[["render",i],["__file","variable-memory.html.vue"]]);export{d as default};
