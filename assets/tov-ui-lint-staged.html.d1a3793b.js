import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.47898b01.js";const i={},t=e(`<h1 id="lint-staged\u914D\u7F6E" tabindex="-1"><a class="header-anchor" href="#lint-staged\u914D\u7F6E" aria-hidden="true">#</a> lint-staged\u914D\u7F6E</h1><p>\u524D\u9762\u4F7F\u7528<code>npx eslint . --fix</code>\u6765\u68C0\u67E5\u6211\u4EEC\u6574\u4E2A\u9879\u76EE\uFF0C\u9879\u76EE\u8DB3\u591F\u5C0F\u8FD8\u884C\uFF0C\u5982\u679C\u6587\u4EF6\u8D8A\u6765\u8D8A\u5927\u7684\u65F6\u5019\u5C31\u4F1A\u6709\u95EE\u9898\uFF0C\u6211\u4EEC\u5C31\u9700\u8981\u60F3\u529E\u6CD5\u8BA9\u5B83\u53EA\u6267\u884C\u6211\u4EEC\u53D8\u66F4\u7684\u6587\u4EF6\uFF0C\u5927\u5927\u63D0\u5347\u6211\u4EEC\u7684\u68C0\u67E5\u7684\u901F\u5EA6\uFF0C\u5C31\u63A8\u51FA\u4E86\u4E00\u4E2A\u5DE5\u5177<code>lint-staged</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">pnpm</span> <span class="token function">add</span> lint-staged -Dw
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5728<code>package.json</code>\u91CC\u914D\u7F6E</p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token comment">// ... \u4E0A\u9762 code \u7701\u7565</span>
    <span class="token comment">// \u65B0\u589E\u9879</span>
    <span class="token property">&quot;lint-staged&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;./**/*.{js,ts,vue,tsx,jsx,css,less,json}&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
      <span class="token string">&quot;eslint --fix&quot;</span>
    <span class="token punctuation">]</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u5C06\u524D\u9762\u914D\u7F6E\u7684<code>.husky/pre-commit</code>\u91CC\u7684\u5185\u5BB9\u66FF\u6362</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>#!/usr/bin/env sh
. &quot;$(dirname -- &quot;$0&quot;)/_/husky.sh&quot;

# npx eslint . --fix
npx lint-staged
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C  tov-ui git:<span class="token punctuation">(</span>main<span class="token punctuation">)</span> \u2717 <span class="token function">git</span> <span class="token function">add</span> <span class="token builtin class-name">.</span>
\u279C  tov-ui git:<span class="token punctuation">(</span>main<span class="token punctuation">)</span> \u2717 <span class="token function">git</span> commit -m <span class="token string">&quot;feat: config lint-staged&quot;</span>
\u2714 Preparing lint-staged<span class="token punctuation">..</span>.
\u2714 Running tasks <span class="token keyword">for</span> staged files<span class="token punctuation">..</span>.
\u2714 Applying modifications from tasks<span class="token punctuation">..</span>.
\u2714 Cleaning up temporary files<span class="token punctuation">..</span>.
<span class="token punctuation">[</span>main <span class="token number">7787097</span><span class="token punctuation">]</span> feat: config lint-staged
 <span class="token number">3</span> files changed, <span class="token number">282</span> insertions<span class="token punctuation">(</span>+<span class="token punctuation">)</span>, <span class="token number">1</span> deletion<span class="token punctuation">(</span>-<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u73B0\u5728\u63D0\u4EA4\u4EE3\u7801\u5C31\u53EA\u68C0\u67E5\u4E86 3 \u4E2A\u6587\u4EF6\u3002</p>`,9),l=[t];function c(o,p){return s(),a("div",null,l)}var r=n(i,[["render",c],["__file","tov-ui-lint-staged.html.vue"]]);export{r as default};
