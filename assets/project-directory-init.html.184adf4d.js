import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as e,e as a}from"./app.e0fd1094.js";const i={},c=a(`<h1 id="tov-ui\u5DE5\u7A0B\u76EE\u5F55\u521D\u59CB\u5316" tabindex="-1"><a class="header-anchor" href="#tov-ui\u5DE5\u7A0B\u76EE\u5F55\u521D\u59CB\u5316" aria-hidden="true">#</a> tov-ui\u5DE5\u7A0B\u76EE\u5F55\u521D\u59CB\u5316</h1><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>\u279C  tov-ui git:(main) tree -L 1
.
\u251C\u2500\u2500 ESLint.md
\u251C\u2500\u2500 Git.md
\u251C\u2500\u2500 Husky.md
\u251C\u2500\u2500 README.md
\u251C\u2500\u2500 eslint.config.js
\u251C\u2500\u2500 node_modules
\u251C\u2500\u2500 package.json
\u251C\u2500\u2500 packages
\u251C\u2500\u2500 pnpm-lock.yaml
\u251C\u2500\u2500 pnpm-workspace.yaml
\u251C\u2500\u2500 tsconfig.json
\u251C\u2500\u2500 tsconfig.node.json
\u2514\u2500\u2500 vite.config.ts
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6253\u5F00\u7EC8\u7AEF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">pnpm</span> create vite

<span class="token comment"># \u8F93\u5165\u9879\u76EE\u540D\u79F0</span>

<span class="token comment"># \u9009\u62E9 Vue</span>

<span class="token comment"># \u9009\u62E9 Typescript</span>

<span class="token comment"># \u5B89\u88C5\u4F9D\u8D56</span>
<span class="token function">pnpm</span> <span class="token function">install</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FDB\u5165\u9879\u76EE\u76EE\u5F55</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">touch</span> pnpm-workspace.yaml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6216\u8005\u5982\u679C\u662F<code>windows</code>\u4E0B\u5C31\u76F4\u63A5\u53F3\u952E\u65B0\u5EFA\u6587\u4EF6\u5373\u53EF\uFF0C\u6CE8\u610F\u6587\u4EF6\u540D\u79F0\u540E\u7F00<code>yaml</code></p><div class="language-yaml ext-yml line-numbers-mode"><pre class="language-yaml"><code><span class="token key atrule">packages</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> packages/*
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5E76\u5728\u6839\u76EE\u5F55\u4E2D\u521B\u5EFA<code>packages</code>\u76EE\u5F55\uFF0C\u5E76\u7EE7\u7EED\u521B\u5EFA<code>tov-ui</code>\u76EE\u5F55\uFF0C\u518D\u6B21\u6253\u5F00\u7EC8\u7AEF\u8FDB\u5165<code>tov-ui</code>\u547D\u4EE4\u521D\u59CB\u5316\u9879\u76EE</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> packages/tov-ui
<span class="token function">pnpm</span> init
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5C31\u4F1A\u4EA7\u751F\u4E00\u4E2A<code>package.json</code>\u6587\u4EF6\u3002</p><p>\u6700\u540E\u5728\u6E05\u7406\u4E00\u4E9B\u7528\u4E0D\u5230\u7684\u6587\u4EF6</p><ul><li>\u6839\u76EE\u5F55\u4E0B\u7684<code>src</code>\u76EE\u5F55</li><li>\u6839\u76EE\u5F55\u4E0B\u7684<code>public</code>\u76EE\u5F55</li><li>\u6839\u76EE\u5F55\u4E0B\u7684<code>index.html</code></li></ul><p>\u4FEE\u6539\u6839\u76EE\u5F55\u4E0B\u7684<code>tsconfig.json</code>\u5C06\u91CC\u9762\u7684<code>include</code>\u4E00\u884C\u5220\u9664\uFF0C\u6839\u76EE\u5F55\u4E0B\u7684<code>package.json</code>\u91CC\u7684<code>name</code>\u4EE5\u53CA<code>scripts</code>\u91CC\u7684\u5185\u5BB9\u5220\u9664\uFF0C\u4EE5\u53CA<code>private</code>\u4E5F\u5220\u9664</p><p>\u5728<code>packages/tov-ui</code>\u4E0B\u65B0\u5EFA<code>tsconfig.json</code>\u8FDB\u884C\u914D\u7F6E</p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token comment">// \u7EE7\u627F\u6839\u76EE\u5F55\u4E0B\u7684\u4E00\u4E9B\u914D\u7F6E</span>
    <span class="token property">&quot;extends&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;../../tsconfig.json&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token property">&quot;compilerOptions&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;include&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;src/**/*.ts&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;src/**/*.tsx&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;src/**/*.vue&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u6700\u7EC8\u76EE\u5F55\u7ED3\u6784</p></blockquote><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>.
\u251C\u2500\u2500 ESLint.md
\u251C\u2500\u2500 Git.md
\u251C\u2500\u2500 Husky.md
\u251C\u2500\u2500 README.md
\u251C\u2500\u2500 eslint.config.js
\u251C\u2500\u2500 node_modules
|-- node_modules\u4E0B\u7684\u5B50\u96C6....
\u251C\u2500\u2500 package.json
\u251C\u2500\u2500 packages
\u2502   \u2514\u2500\u2500 tov-ui
\u2502       \u251C\u2500\u2500 package.json
\u2502       \u251C\u2500\u2500 src
\u2502       \u2514\u2500\u2500 tsconfig.json
\u251C\u2500\u2500 pnpm-lock.yaml
\u251C\u2500\u2500 pnpm-workspace.yaml
\u251C\u2500\u2500 tsconfig.json
\u251C\u2500\u2500 tsconfig.node.json
\u2514\u2500\u2500 vite.config.ts
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,18),d=[c];function l(o,t){return s(),e("div",null,d)}var v=n(i,[["render",l],["__file","project-directory-init.html.vue"]]);export{v as default};
