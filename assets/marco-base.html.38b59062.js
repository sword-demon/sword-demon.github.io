import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as p}from"./app.f9e217eb.js";const t={},e=p(`<h1 id="\u5B8F\u5165\u95E8" tabindex="-1"><a class="header-anchor" href="#\u5B8F\u5165\u95E8" aria-hidden="true">#</a> \u5B8F\u5165\u95E8</h1><p><code>Rust</code>\u63D0\u4F9B\u4E86\u4E00\u4E2A\u5F3A\u5927\u7684\u5B8F\uFF0C\u53EF\u8FDB\u884C\u5143\u7F16\u7A0B(<code>metaprogramming</code>)\u3002\u770B\u8D77\u6765\u548C\u51FD\u6570\u5F88\u60F3\uFF0C\u53EA\u4E0D\u8FC7\u540D\u79F0\u672B\u5C3E\u6709\u4E00\u4E2A\u611F\u53F9\u53F7</p><p>\u4E4B\u524D\u4F7F\u7528\u8FC7\u7684\u4E00\u4E9B<code>println!</code>\u3001<code>vec!</code>\u548C<code>format!</code>\u7B49\u662F\u3002</p><blockquote><p>\u5143\u7F16\u7A0B\uFF1A\u7528\u4EE3\u7801\u751F\u6210\u4EE3\u7801\u3001\u63A7\u5236\u4EE3\u7801\u3001\u6269\u5C55\u4EE3\u7801</p><p>\u6848\u4F8B\uFF1A</p><ol><li><code>Java</code>\u7684\u6CE8\u89E3</li><li><code>php</code>\u7684<code>eval</code></li></ol></blockquote><h2 id="\u6700\u7B80\u5355\u7684\u5B8F" tabindex="-1"><a class="header-anchor" href="#\u6700\u7B80\u5355\u7684\u5B8F" aria-hidden="true">#</a> \u6700\u7B80\u5355\u7684\u5B8F</h2><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token macro property">macro_rules!</span> me <span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;\u65E0\u89E3&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">fn</span> <span class="token function-definition function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token macro property">me!</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5728<code>src</code>\u4E0B\u548C<code>main.rs</code>\u540C\u7EA7\u5B8F</p><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token macro property">macro_rules!</span> echo <span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;\u65E0\u89E3&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token attribute attr-name">#[macro_use]</span>
<span class="token keyword">mod</span> <span class="token module-declaration namespace">mymacros</span><span class="token punctuation">;</span>
<span class="token keyword">fn</span> <span class="token function-definition function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token macro property">echo!</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u6CE8\u610F</p><p>\u4F7F\u7528<code>mod</code>\u5F15\u7528\u4E4B\u540E\uFF0C\u8FD8\u5F97\u52A0\u4E0A<code>#[macro_use]</code>\u6765\u4F7F\u7528\u5B8F\u8FD9\u4E2A\u6CE8\u89E3\u3002</p></div><hr><p>\u52A0\u5165\u53C2\u6570\uFF0C\u524D\u9762\u5199\u524D\u7F00\uFF0C\u540E\u9762\u52A0\u4E0A\u5192\u53F7\uFF0C\u518D\u52A0\u4E0A\u8868\u8FBE\u5F0F\u6216\u8005\u522B\u7684</p><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token macro property">macro_rules!</span> echo <span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;\u65E0\u89E3&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token comment">// \u524D\u7F00: \u8868\u8FBE\u5F0F</span>
    <span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">:</span> expr<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;{}&quot;</span><span class="token punctuation">,</span> <span class="token variable">$exp</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u591A\u4E2A\u4EE5\u5206\u53F7\u9694\u5F00\u3002</p><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token attribute attr-name">#[macro_use]</span>
<span class="token keyword">mod</span> <span class="token module-declaration namespace">mymacros</span><span class="token punctuation">;</span>
<span class="token keyword">fn</span> <span class="token function-definition function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token macro property">echo!</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token macro property">echo!</span><span class="token punctuation">(</span><span class="token string">&quot;abc&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">let</span> a <span class="token operator">=</span> <span class="token number">3</span><span class="token punctuation">;</span>
    <span class="token macro property">echo!</span><span class="token punctuation">(</span>a <span class="token operator">==</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo run
\u65E0\u89E3
abc
<span class="token boolean">true</span>  <span class="token comment"># \u8868\u8FBE\u5F0F\u7684\u7ED3\u679C</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><p>\u6539\u6210\u4F7F\u7528<code>stringify!</code>\u5305\u88F9\u76F4\u63A5\u6253\u5370\u51FA\u8868\u8FBE\u5F0F\u7684\u5185\u5BB9</p><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token macro property">macro_rules!</span> echo <span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;\u65E0\u89E3&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token comment">// \u524D\u7F00: \u8868\u8FBE\u5F0F</span>
    <span class="token comment">// ($exp: expr) =&gt; {</span>
    <span class="token comment">//     println!(&quot;{}&quot;, $exp);</span>
    <span class="token comment">// };</span>
    <span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">:</span> expr<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;{}&quot;</span><span class="token punctuation">,</span> <span class="token macro property">stringify!</span><span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u53EF\u53D8\u53C2\u6570\u7684\u57FA\u672C\u5B9A\u4E49" tabindex="-1"><a class="header-anchor" href="#\u53EF\u53D8\u53C2\u6570\u7684\u57FA\u672C\u5B9A\u4E49" aria-hidden="true">#</a> \u53EF\u53D8\u53C2\u6570\u7684\u57FA\u672C\u5B9A\u4E49</h2><p>\u6211\u4EEC\u53EF\u4EE5\u770B\u4E00\u4E0B<code>println!</code>\u7684\u6E90\u7801\u6765\u770B\u4E00\u770B</p><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token attribute attr-name">#[macro_export]</span>
<span class="token attribute attr-name">#[stable(feature = <span class="token string">&quot;rust1&quot;</span>, since = <span class="token string">&quot;1.0.0&quot;</span>)]</span>
<span class="token attribute attr-name">#[cfg_attr(not(test), rustc_diagnostic_item = <span class="token string">&quot;println_macro&quot;</span>)]</span>
<span class="token attribute attr-name">#[allow_internal_unstable(print_internals, format_args_nl)]</span>
<span class="token macro property">macro_rules!</span> println <span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token variable">$crate</span><span class="token punctuation">::</span><span class="token macro property">print!</span><span class="token punctuation">(</span><span class="token string">&quot;\\n&quot;</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token punctuation">(</span>$<span class="token punctuation">(</span><span class="token variable">$arg</span><span class="token punctuation">:</span><span class="token fragment-specifier punctuation">tt</span><span class="token punctuation">)</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span><span class="token punctuation">{</span>
        <span class="token variable">$crate</span><span class="token punctuation">::</span><span class="token namespace">io<span class="token punctuation">::</span></span><span class="token function">_print</span><span class="token punctuation">(</span><span class="token variable">$crate</span><span class="token punctuation">::</span><span class="token macro property">format_args_nl!</span><span class="token punctuation">(</span>$<span class="token punctuation">(</span><span class="token variable">$arg</span><span class="token punctuation">)</span><span class="token operator">*</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u53EF\u4EE5\u4F7F\u7528<code>$(\u5305\u88F9)\u540E\u9762\u52A0\u5185\u5BB9</code></p><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token macro property">macro_rules!</span> echo <span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;\u65E0\u89E3&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token comment">// \u524D\u7F00: \u8868\u8FBE\u5F0F</span>
    <span class="token comment">// ($exp: expr) =&gt; {</span>
    <span class="token comment">//     println!(&quot;{}&quot;, $exp);</span>
    <span class="token comment">// };</span>
    <span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">:</span> expr<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;{}&quot;</span><span class="token punctuation">,</span> <span class="token macro property">stringify!</span><span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token punctuation">(</span>$<span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">:</span> expr<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token operator">+</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        $<span class="token punctuation">(</span>
            <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;{}&quot;</span><span class="token punctuation">,</span> <span class="token macro property">stringify!</span><span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">)</span><span class="token operator">+</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>+</code>\u4EE3\u8868\u7684\u610F\u601D\u662F\u53EF\u4EE5\u4F20\u4E00\u4E2A\u6216\u8005\u591A\u4E2A</p><blockquote><p>\u6D4B\u8BD5</p></blockquote><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token attribute attr-name">#[macro_use]</span>
<span class="token keyword">mod</span> <span class="token module-declaration namespace">mymacros</span><span class="token punctuation">;</span>
<span class="token keyword">fn</span> <span class="token function-definition function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token macro property">echo!</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token macro property">echo!</span><span class="token punctuation">(</span><span class="token string">&quot;abc&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">let</span> a <span class="token operator">=</span> <span class="token number">3</span><span class="token punctuation">;</span>
    <span class="token macro property">echo!</span><span class="token punctuation">(</span>a <span class="token operator">==</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;{}&quot;</span><span class="token punctuation">,</span> a<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token macro property">echo!</span><span class="token punctuation">(</span><span class="token string">&quot;a&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;b&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;c&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4F46\u662F\u8FD9\u6837\uFF0C\u662F\u81F3\u5C11\u5F97\u6709\u4E00\u4E2A\u53C2\u6570\uFF0C\u6211\u4EEC\u5176\u5B9E\u662F\u53EF\u4EE5\u4E0D\u4F20\u53C2\u6570\u7684\uFF0C\u6211\u4EEC\u53EF\u4EE5\u628A<code>+</code>\u6362\u6210<code>*</code></p><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token macro property">macro_rules!</span> echo <span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;\u65E0\u89E3&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token comment">// \u524D\u7F00: \u8868\u8FBE\u5F0F</span>
    <span class="token comment">// ($exp: expr) =&gt; {</span>
    <span class="token comment">//     println!(&quot;{}&quot;, $exp);</span>
    <span class="token comment">// };</span>
    <span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">:</span> expr<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;{}&quot;</span><span class="token punctuation">,</span> <span class="token macro property">stringify!</span><span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token punctuation">(</span>$<span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">:</span> expr<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token operator">*</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        $<span class="token punctuation">(</span>
            <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;{}&quot;</span><span class="token punctuation">,</span> <span class="token macro property">stringify!</span><span class="token punctuation">(</span><span class="token variable">$exp</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">)</span><span class="token operator">*</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u4F7F\u7528\u5B8F\u6765\u521B\u5EFA\u81EA\u5B9A\u4E49\u51FD\u6570" tabindex="-1"><a class="header-anchor" href="#\u4F7F\u7528\u5B8F\u6765\u521B\u5EFA\u81EA\u5B9A\u4E49\u51FD\u6570" aria-hidden="true">#</a> \u4F7F\u7528\u5B8F\u6765\u521B\u5EFA\u81EA\u5B9A\u4E49\u51FD\u6570</h2><p>\u524D\u9762\u7684<code>expr</code>\u7684\u542B\u4E49\u662F\u8868\u8FBE\u5F0F\uFF0C\u6307\u4F20\u5165\u7684\u53C2\u6570\u662F\u8868\u8FBE\u5F0F\u7C7B\u578B\uFF0C\u5176\u5B9E\u4ED6\u7684\u7C7B\u578B\u6709\u5F88\u591A\uFF1A</p><p><code>ident</code>\uFF1A\u6307\u793A\u7B26\uFF0C\u5E38\u7528\u4E8E\u51FD\u6570\u540D\u548C\u53D8\u91CF\u540D\u3002</p><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token macro property">macro_rules!</span> func <span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token variable">$fn_name</span><span class="token punctuation">:</span> ident<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        <span class="token keyword">fn</span> <span class="token variable">$fn_name</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token macro property">println!</span><span class="token punctuation">(</span><span class="token string">&quot;my func name is {}&quot;</span><span class="token punctuation">,</span> <span class="token macro property">stringify!</span><span class="token punctuation">(</span><span class="token variable">$fn_name</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8C03\u7528\u6D4B\u8BD5</p><div class="language-rust ext-rs line-numbers-mode"><pre class="language-rust"><code><span class="token attribute attr-name">#[macro_use]</span>
<span class="token keyword">mod</span> <span class="token module-declaration namespace">mymacros</span><span class="token punctuation">;</span>
<span class="token keyword">fn</span> <span class="token function-definition function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token macro property">func!</span><span class="token punctuation">(</span>php<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">php</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>warning: <span class="token variable"><span class="token variable">\`</span>mypro<span class="token variable">\`</span></span> <span class="token punctuation">(</span>bin <span class="token string">&quot;mypro&quot;</span><span class="token punctuation">)</span> generated <span class="token number">1</span> warning
    Finished dev <span class="token punctuation">[</span>unoptimized + debuginfo<span class="token punctuation">]</span> target<span class="token punctuation">(</span>s<span class="token punctuation">)</span> <span class="token keyword">in</span> <span class="token number">0</span>.00s
     Running <span class="token variable"><span class="token variable">\`</span>target/debug/mypro<span class="token variable">\`</span></span>
my func name is php
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,36),o=[e];function c(i,l){return s(),a("div",null,o)}var d=n(t,[["render",c],["__file","marco-base.html.vue"]]);export{d as default};
