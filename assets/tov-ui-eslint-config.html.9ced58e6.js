import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.e0fd1094.js";const e={},o=t(`<h1 id="\u914D\u7F6E-eslint" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E-eslint" aria-hidden="true">#</a> \u914D\u7F6E eslint</h1><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">pnpm</span> <span class="token function">add</span> eslint @mistjs/eslint-config -D    
\u2009ERR_PNPM_ADDING_TO_ROOT\u2009 Running this <span class="token builtin class-name">command</span> will <span class="token function">add</span> the dependency to the workspace root, <span class="token function">which</span> might not be what you want - <span class="token keyword">if</span> you really meant it, <span class="token function">make</span> it explicit by running this <span class="token builtin class-name">command</span> again with the -w flag <span class="token punctuation">(</span>or --workspace-root<span class="token punctuation">)</span>. If you don&#39;t want to see this warning anymore, you may <span class="token builtin class-name">set</span> the ignore-workspace-root-check setting to true.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u91CC\u662F\u56E0\u4E3A\u6211\u4EEC\u4F7F\u7528\u4E86<code>workspace</code>\uFF0C\u6240\u4EE5\u8FD8\u9700\u8981\u52A0\u4E0A\u4E00\u4E2A<code>w</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">pnpm</span> <span class="token function">add</span> eslint @mistjs/eslint-config -Dw
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u610F\u5473\u7740\u628A\u6211\u4EEC\u7684\u4F9D\u8D56\u4E0B\u8F7D\u5230<code>workspace</code>\u7684\u6839\u76EE\u5F55\u4E0B\u7684<code>package.json</code>\u91CC</p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;devDependencies&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;@mistjs/eslint-config&quot;</span><span class="token operator">:</span> <span class="token string">&quot;^1.0.0&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;@vitejs/plugin-vue&quot;</span><span class="token operator">:</span> <span class="token string">&quot;^5.0.3&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;eslint&quot;</span><span class="token operator">:</span> <span class="token string">&quot;^8.56.0&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;typescript&quot;</span><span class="token operator">:</span> <span class="token string">&quot;^5.2.2&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;vite&quot;</span><span class="token operator">:</span> <span class="token string">&quot;^5.1.0&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;vue-tsc&quot;</span><span class="token operator">:</span> <span class="token string">&quot;^1.8.27&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u91CC\u7684<code>eslint</code>\u7684\u7248\u672C\u662F\u6709\u95EE\u9898\u7684\uFF0C\u6211\u4EEC\u9700\u8981\u624B\u52A8\u8C03\u6574\u7248\u672C\u4E3A<code>8.55.0</code>\uFF0C\u7136\u540E\u91CD\u65B0\u5B89\u88C5\u4E00\u4E0B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">pnpm</span> <span class="token function">install</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6839\u76EE\u5F55\u4E0B\u65B0\u5EFA<code>eslint.config.js</code></p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">import</span> mist <span class="token keyword">from</span> <span class="token string">&#39;@mistjs/eslint-config&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token function">mist</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u662F<code>vscode</code>\u8FDB\u884C\u76F8\u5173\u7684\u914D\u7F6E\uFF0C\u5728<code>.vscode</code>\u4E0B\u65B0\u5EFA<code>settings.json</code></p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token comment">// \u5F00\u542F eslint \u6241\u5E73\u5316\u914D\u7F6E</span>
    <span class="token property">&quot;eslint.experimental.useFlatConfig&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token comment">// \u5173\u95ED\u9ED8\u8BA4\u7684\u914D\u7F6E\uFF0C\u4E0D\u5F00\u542F prettier \u683C\u5F0F\u5316</span>
    <span class="token property">&quot;prettier.enable&quot;</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
    <span class="token comment">// \u5173\u95ED\u9ED8\u8BA4\u683C\u5F0F\u5316</span>
    <span class="token property">&quot;editor.formatOnSave&quot;</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>

    <span class="token comment">// \u4FDD\u5B58\u81EA\u52A8\u4FEE\u590D</span>
    <span class="token property">&quot;editor.codeActionsOnSave&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token comment">// \u6211\u4EEC\u8FD9\u91CC\u6307\u81EA\u5B9A\u4E49\u4FEE\u590D</span>
        <span class="token property">&quot;source.fixAll&quot;</span><span class="token operator">:</span> <span class="token string">&quot;explicit&quot;</span><span class="token punctuation">,</span>
        <span class="token comment">// \u6765\u6E90\u5BFC\u5165\u6211\u4EEC\u4E0D\u9700\u8981\u7ED9\u5173\u95ED\u6389</span>
        <span class="token property">&quot;source.organizeImports&quot;</span><span class="token operator">:</span> <span class="token string">&quot;never&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// \u9759\u9ED8\u6837\u5F0F\u89C4\u5219\u81EA\u52A8\u4FEE\u590D</span>
    <span class="token property">&quot;eslint.rules.customizations&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;rule&quot;</span><span class="token operator">:</span> <span class="token string">&quot;style/*&quot;</span><span class="token punctuation">,</span><span class="token property">&quot;severity&quot;</span><span class="token operator">:</span> <span class="token string">&quot;off&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;rule&quot;</span><span class="token operator">:</span> <span class="token string">&quot;*-indent&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;severity&quot;</span><span class="token operator">:</span> <span class="token string">&quot;off&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;rule&quot;</span><span class="token operator">:</span> <span class="token string">&quot;*-spacing&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;severity&quot;</span><span class="token operator">:</span> <span class="token string">&quot;off&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;rule&quot;</span><span class="token operator">:</span> <span class="token string">&quot;*-spaces&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;severity&quot;</span><span class="token operator">:</span> <span class="token string">&quot;off&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;rule&quot;</span><span class="token operator">:</span> <span class="token string">&quot;*-order&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;severity&quot;</span><span class="token operator">:</span> <span class="token string">&quot;off&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;rule&quot;</span><span class="token operator">:</span> <span class="token string">&quot;*-dangle&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;severity&quot;</span><span class="token operator">:</span> <span class="token string">&quot;off&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;rule&quot;</span><span class="token operator">:</span> <span class="token string">&quot;*-newline&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;severity&quot;</span><span class="token operator">:</span> <span class="token string">&quot;off&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;rule&quot;</span><span class="token operator">:</span> <span class="token string">&quot;*quotes&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;severity&quot;</span><span class="token operator">:</span> <span class="token string">&quot;off&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;rule&quot;</span><span class="token operator">:</span> <span class="token string">&quot;*semi&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;severity&quot;</span><span class="token operator">:</span> <span class="token string">&quot;off&quot;</span><span class="token punctuation">}</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token comment">// \u5728 eslint \u4E2D\u5F00\u542F\u54EA\u4E9B\u8BED\u8A00\u7684\u6821\u9A8C</span>
    <span class="token property">&quot;eslint.validate&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token string">&quot;javascript&quot;</span><span class="token punctuation">,</span>
        <span class="token string">&quot;javascriptreact&quot;</span><span class="token punctuation">,</span>
        <span class="token string">&quot;typescript&quot;</span><span class="token punctuation">,</span>
        <span class="token string">&quot;typescriptreact&quot;</span><span class="token punctuation">,</span>
        <span class="token string">&quot;vue&quot;</span><span class="token punctuation">,</span>
        <span class="token string">&quot;html&quot;</span><span class="token punctuation">,</span>
        <span class="token string">&quot;markdown&quot;</span><span class="token punctuation">,</span>
        <span class="token string">&quot;json&quot;</span><span class="token punctuation">,</span>
        <span class="token string">&quot;jsonc&quot;</span><span class="token punctuation">,</span>
        <span class="token string">&quot;yaml&quot;</span>
    <span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u662F<code>webstorm</code>,\u9700\u8981\u7248\u672C\u5927\u4E8E<code>2023.2</code></p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20240217222738452.png" alt="image-20240217222738452" loading="lazy"></p><p>\u7136\u540E\u4FEE\u6539\u4E0B\u90E8\u5206\u4EE3\u7801\uFF0C\u8FDB\u884C\u4FDD\u5B58\u6D4B\u8BD5\u5373\u53EF\u3002</p><h2 id="\u81EA\u5B9A\u4E49\u90E8\u5206\u914D\u7F6E\u89C4\u5219" tabindex="-1"><a class="header-anchor" href="#\u81EA\u5B9A\u4E49\u90E8\u5206\u914D\u7F6E\u89C4\u5219" aria-hidden="true">#</a> \u81EA\u5B9A\u4E49\u90E8\u5206\u914D\u7F6E\u89C4\u5219</h2><p>\u6BD4\u5982\u6211\u4EEC\u6709\u7684\u65F6\u5019\u4F1A\u4F7F\u7528\u5230<code>console.log</code>\u6216\u8005<code>debugger</code>\u7B49\uFF0C\u53EF\u4EE5\u5728<code>eslint.config.js</code>\u91CC\u8FDB\u884C\u6269\u5C55</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">import</span> mist <span class="token keyword">from</span> <span class="token string">&#39;@mistjs/eslint-config&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token function">mist</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token literal-property property">rules</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token string-property property">&#39;no-console&#39;</span><span class="token operator">:</span> <span class="token string">&#39;off&#39;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&#39;no-debugger&#39;</span><span class="token operator">:</span> <span class="token string">&#39;off&#39;</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,18),p=[o];function c(i,l){return s(),a("div",null,p)}var d=n(e,[["render",c],["__file","tov-ui-eslint-config.html.vue"]]);export{d as default};
