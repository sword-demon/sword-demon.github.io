import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.75f63fbd.js";const p={},e=t(`<h2 id="\u591A\u534F\u7A0B\u7684\u597D\u5904" tabindex="-1"><a class="header-anchor" href="#\u591A\u534F\u7A0B\u7684\u597D\u5904" aria-hidden="true">#</a> \u591A\u534F\u7A0B\u7684\u597D\u5904</h2><p>\u6BD4\u5982\uFF0C\u6B64\u65F6\u6709\u4E00\u4E2A\u4EFB\u52A1</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">job</span><span class="token punctuation">(</span>index <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
  time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond <span class="token operator">*</span> <span class="token number">500</span><span class="token punctuation">)</span>
  <span class="token keyword">return</span> index
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6211\u4EEC\u624B\u52A8\u52A0\u4E86\u8017\u65F6\u64CD\u4F5C\uFF0C\u6211\u4EEC\u4F7F\u7528\u6B63\u5E38\u7684\u65B9\u5F0F\u6765\u8FDB\u884C\u83B7\u53D6\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  start <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  num <span class="token operator">:=</span> <span class="token number">5</span>
  <span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> num<span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
      fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token function">job</span><span class="token punctuation">(</span>param<span class="token punctuation">)</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
  end <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Since</span><span class="token punctuation">(</span>start<span class="token punctuation">)</span>
  fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u8017\u65F6: &quot;</span><span class="token punctuation">,</span> end<span class="token punctuation">.</span><span class="token function">String</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u6837\u4E0B\u6765\u8FD0\u884C\u7684\u8017\u65F6\u662F\u9700\u8981 2s \u591A\u4E00\u70B9\u7684\u3002</p><h2 id="\u521D\u7EA7\u7248\u672C" tabindex="-1"><a class="header-anchor" href="#\u521D\u7EA7\u7248\u672C" aria-hidden="true">#</a> \u521D\u7EA7\u7248\u672C</h2><p>\u6211\u4EEC\u63A5\u4E0B\u6765\u4F7F\u7528<code>sync.WaitGroup + goroutine</code> \u6765\u4F18\u5316</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  start <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  num <span class="token operator">:=</span> <span class="token number">5</span>

  wg <span class="token operator">:=</span> sync<span class="token punctuation">.</span>WaitGroup<span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> num<span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
    wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span>param <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">defer</span> wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
      fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token function">job</span><span class="token punctuation">(</span>param<span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
  wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

  end <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Since</span><span class="token punctuation">(</span>start<span class="token punctuation">)</span>
  fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u8017\u65F6: &quot;</span><span class="token punctuation">,</span> end<span class="token punctuation">.</span><span class="token function">String</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u6837\uFF0C\u4F7F\u7528\u4E86\u534F\u7A0B \u6765\u5904\u7406\u4E4B\u540E\uFF0C\u8017\u65F6\u53D8\u6210\u4E86<code>501.338458ms </code></p><p>\u518D\u6B21\u4F18\u5316\uFF0C\u6211\u4EEC\u53EF\u4EE5\u52A0\u4E0A<code>channel </code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  start <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  num <span class="token operator">:=</span> <span class="token number">5</span>
  result <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token comment">// \u7ED3\u679Cchan</span>
  <span class="token comment">//wg := sync.WaitGroup{}</span>
  <span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> num<span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
    <span class="token comment">//wg.Add(1)</span>
    <span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span>param <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">//defer wg.Done()</span>
      result <span class="token operator">&lt;-</span> <span class="token function">job</span><span class="token punctuation">(</span>param<span class="token punctuation">)</span>
      <span class="token comment">//fmt.Println(job(param))</span>
    <span class="token punctuation">}</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
  <span class="token comment">//wg.Wait()</span>

  <span class="token comment">// low \u5199\u6CD5</span>
  count <span class="token operator">:=</span> <span class="token number">0</span>

  <span class="token keyword">for</span> item <span class="token operator">:=</span> <span class="token keyword">range</span> result <span class="token punctuation">{</span>
    count<span class="token operator">++</span>
    fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u6536\u5230\u7ED3\u679C:&quot;</span><span class="token punctuation">,</span> item<span class="token punctuation">)</span>

    <span class="token keyword">if</span> count <span class="token operator">==</span> num <span class="token punctuation">{</span>
      <span class="token comment">// \u5173\u95EDchannel \u4E0D\u51FA\u73B0\u6B7B\u9501</span>
      <span class="token function">close</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span>
      <span class="token keyword">break</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
  end <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Since</span><span class="token punctuation">(</span>start<span class="token punctuation">)</span>
  fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u8017\u65F6: &quot;</span><span class="token punctuation">,</span> end<span class="token punctuation">.</span><span class="token function">String</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u6837\u4E5F\u4F1A\u5F97\u5230\u4EE5\u4E0B\u7ED3\u679C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C go run <span class="token number">1</span>.multi_co.go
\u6536\u5230\u7ED3\u679C: <span class="token number">3</span>
\u6536\u5230\u7ED3\u679C: <span class="token number">0</span>
\u6536\u5230\u7ED3\u679C: <span class="token number">1</span>
\u6536\u5230\u7ED3\u679C: <span class="token number">4</span>
\u6536\u5230\u7ED3\u679C: <span class="token number">2</span>
\u8017\u65F6:  <span class="token number">501</span>.338458ms
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u4F18\u96C5\u7248\u672C" tabindex="-1"><a class="header-anchor" href="#\u4F18\u96C5\u7248\u672C" aria-hidden="true">#</a> \u4F18\u96C5\u7248\u672C</h2><p>\u4F18\u96C5\u7684\u5173\u95ED<code>channel </code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
  <span class="token string">&quot;fmt&quot;</span>
  <span class="token string">&quot;sync&quot;</span>
  <span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">job</span><span class="token punctuation">(</span>index <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token builtin">int</span> <span class="token punctuation">{</span>
  time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Millisecond <span class="token operator">*</span> <span class="token number">500</span><span class="token punctuation">)</span>
  <span class="token keyword">return</span> index
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  start <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  num <span class="token operator">:=</span> <span class="token number">5</span>
  result <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token comment">// \u7ED3\u679Cchan</span>
  wg <span class="token operator">:=</span> sync<span class="token punctuation">.</span>WaitGroup<span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token keyword">for</span> i <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> num<span class="token punctuation">;</span> i<span class="token operator">++</span> <span class="token punctuation">{</span>
    wg<span class="token punctuation">.</span><span class="token function">Add</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span>param <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">defer</span> wg<span class="token punctuation">.</span><span class="token function">Done</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
      result <span class="token operator">&lt;-</span> <span class="token function">job</span><span class="token punctuation">(</span>param<span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">defer</span> <span class="token function">close</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span>
    <span class="token comment">// \u7B49\u5230\u4E0A\u9762\u7ED3\u675F\u624D\u4F1A\u6267\u884Cclose</span>
    wg<span class="token punctuation">.</span><span class="token function">Wait</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

  <span class="token comment">// \u6CA1\u6709\u503C\u4F1A\u963B\u585E\uFF0C\u76F4\u81F3channel\u88ABclose\u6389</span>
  <span class="token keyword">for</span> item <span class="token operator">:=</span> <span class="token keyword">range</span> result <span class="token punctuation">{</span>
    fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u6536\u5230\u7ED3\u679C:&quot;</span><span class="token punctuation">,</span> item<span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
  end <span class="token operator">:=</span> time<span class="token punctuation">.</span><span class="token function">Since</span><span class="token punctuation">(</span>start<span class="token punctuation">)</span>
  fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u8017\u65F6: &quot;</span><span class="token punctuation">,</span> end<span class="token punctuation">.</span><span class="token function">String</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,17),o=[e];function c(i,l){return s(),a("div",null,o)}var r=n(p,[["render",c],["__file","multi-goroutine-result.html.vue"]]);export{r as default};
