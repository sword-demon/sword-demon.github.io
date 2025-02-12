import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as e,e as a}from"./app.cf87c796.js";const i={},l=a(`<h1 id="\u914D\u7F6E-husky" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E-husky" aria-hidden="true">#</a> \u914D\u7F6E Husky</h1><blockquote><p>\u5B89\u88C5</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">pnpm</span> <span class="token function">add</span> husky -Dw
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5728\u6839\u76EE\u5F55\u4E0B\u7684<code>package.json</code>\u91CC\u6DFB\u52A0\u6267\u884C\u547D\u4EE4</p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;scripts&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;prepare&quot;</span><span class="token operator">:</span> <span class="token string">&quot;husky install&quot;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u518D\u91CD\u65B0\u5B89\u88C5\u4E0B\u4F9D\u8D56</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">pnpm</span> <span class="token function">install</span>

Scope: all <span class="token number">2</span> workspace projects
Lockfile is up to date, resolution step is skipped
Already up to <span class="token function">date</span>
<span class="token builtin class-name">.</span> prepare$ husky <span class="token function">install</span>
\u2502 <span class="token function">install</span> <span class="token builtin class-name">command</span> is deprecated
\u2514\u2500 Done <span class="token keyword">in</span> 669ms
Done <span class="token keyword">in</span> <span class="token number">1</span>.1s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u6839\u76EE\u5F55\u4E0B\u5C31\u4F1A\u751F\u6210\u4E00\u4E2A<code>.husky</code>\u6587\u4EF6\uFF0C\u6211\u4EEC\u53EA\u9700\u8981\u5728<code>git commit</code>\u4E4B\u524D\u8FDB\u884C\u68C0\u67E5\u4EE3\u7801\u5373\u53EF\u3002</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>npx husky <span class="token function">add</span> .husky/pre-commit <span class="token string">&quot;npx eslint . --fix&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6211\u4EEC\u8FD9\u91CC\u5148\u628A<code>package.json</code>\u91CC\u7684<code>husky</code>\u5F97\u7248\u672C\u6362\u4E00\u4E0B\uFF0C\u65B0\u7248\u7684\u597D\u50CF\u6CA1\u6709<code>add</code>\u4E86</p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;devDependencies&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;husky&quot;</span><span class="token operator">:</span> <span class="token string">&quot;^8.0.3&quot;</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">pnpm</span> <span class="token function">install</span>

npx husky <span class="token function">add</span> .husky/pre-commit <span class="token string">&quot;npx eslint . --fix&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u81F3\u6B64<code>.husky/pre-commit</code>\u5185\u5BB9\u4E3A</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>#!/user/bin/env sh
. &quot;$(dirname -- &quot;$0&quot;)/_/husky.sh&quot;


npx eslint . --fix
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u81F3\u6B64\uFF0C\u5982\u679C\u6709\u5730\u65B9\u4E0D\u7B26\u5408\u89C4\u8303\u7684\u8BDD\uFF0C\u662F\u4E0D\u5141\u8BB8\u88AB\u63D0\u4EA4\u7684</p>`,15),o=[l];function c(t,d){return s(),e("div",null,o)}var r=n(i,[["render",c],["__file","tov-ui-husky-config.html.vue"]]);export{r as default};
