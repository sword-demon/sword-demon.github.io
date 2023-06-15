import{_ as p}from"./plugin-vue_export-helper.21dcd24c.js";import{r as i,o,c as l,a as n,b as e,e as t,d as s}from"./app.b055366b.js";const c={},r=t(`<h1 id="vue-3-vite-\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF" tabindex="-1"><a class="header-anchor" href="#vue-3-vite-\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF" aria-hidden="true">#</a> Vue 3 + Vite \u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF</h1><h2 id="\u521D\u59CB\u5316\u9879\u76EE" tabindex="-1"><a class="header-anchor" href="#\u521D\u59CB\u5316\u9879\u76EE" aria-hidden="true">#</a> \u521D\u59CB\u5316\u9879\u76EE</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">yarn</span> create vite manager-fe

<span class="token comment"># \u4E0B\u9762\u9009 Vue \u9009 JavaScript</span>

<span class="token comment"># \u76F4\u5230\u51FA\u73B0</span>
<span class="token builtin class-name">cd</span> manager-fe
<span class="token function">yarn</span>
<span class="token function">yarn</span> dev
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5373\u53EF</p><h2 id="\u65E7\u7248\u672C\u5347\u7EA7" tabindex="-1"><a class="header-anchor" href="#\u65E7\u7248\u672C\u5347\u7EA7" aria-hidden="true">#</a> \u65E7\u7248\u672C\u5347\u7EA7</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u66F4\u65B0\u8BED\u6CD5</span>
<span class="token builtin class-name">cd</span> \u9879\u76EE
<span class="token function">yarn</span> vite -S
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="vscode-\u63D2\u4EF6" tabindex="-1"><a class="header-anchor" href="#vscode-\u63D2\u4EF6" aria-hidden="true">#</a> vscode \u63D2\u4EF6</h2><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>Eslint
Vetur
TypeScript
Prettier
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u9879\u76EE\u521D\u59CB\u5316" tabindex="-1"><a class="header-anchor" href="#\u9879\u76EE\u521D\u59CB\u5316" aria-hidden="true">#</a> \u9879\u76EE\u521D\u59CB\u5316</h2><h3 id="\u5B89\u88C5\u9879\u76EE\u6240\u9700\u8981\u7684\u63D2\u4EF6" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5\u9879\u76EE\u6240\u9700\u8981\u7684\u63D2\u4EF6" aria-hidden="true">#</a> \u5B89\u88C5\u9879\u76EE\u6240\u9700\u8981\u7684\u63D2\u4EF6</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># -s \u5F00\u53D1\u4F9D\u8D56</span>
<span class="token function">yarn</span> <span class="token function">add</span> vue-router@next vuex@next element-plus axios -s

<span class="token comment"># -D \u751F\u4EA7\u4F9D\u8D56</span>
<span class="token function">yarn</span> <span class="token function">add</span> sass -D
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="vue-\u5168\u5BB6\u6876\u5347\u7EA7-\u5982\u679C\u4E0D\u662F\u6700\u65B0\u7248" tabindex="-1"><a class="header-anchor" href="#vue-\u5168\u5BB6\u6876\u5347\u7EA7-\u5982\u679C\u4E0D\u662F\u6700\u65B0\u7248" aria-hidden="true">#</a> Vue \u5168\u5BB6\u6876\u5347\u7EA7(\u5982\u679C\u4E0D\u662F\u6700\u65B0\u7248)</h3><p>\u66F4\u65B0\u9879\u76EE\u4E3B\u8981\u63D2\u4EF6</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">yarn</span> <span class="token function">add</span> element-plus vue vue-router vuex -S

<span class="token function">yarn</span> <span class="token function">add</span> vite @vitejs/plugin-vue -D
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4FEE\u6539<code>element-plus</code>\u5F15\u7528\u65B9\u5F0F</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token comment">// \u4EE5\u524D\u5199\u6CD5</span>
<span class="token keyword">import</span> <span class="token string">&#39;element-plus/lib/theme-chalk/index.css&#39;</span>
<span class="token comment">// \u66F4\u65B0\u4EE5\u540E\u5F97\u5199\u6CD5</span>
<span class="token keyword">import</span> <span class="token string">&#39;element-plus/dist/index.css&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4FEE\u6539\u83DC\u5355\u7EC4\u4EF6\u8BED\u6CD5</p><div class="language-vue ext-vue line-numbers-mode"><pre class="language-vue"><code>el-submenu \u6539\u6210 el-sub-menu
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="\u76EE\u5F55\u7ED3\u6784" tabindex="-1"><a class="header-anchor" href="#\u76EE\u5F55\u7ED3\u6784" aria-hidden="true">#</a> \u76EE\u5F55\u7ED3\u6784</h2><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>dist
node_modules
public
src
    api
    assets
    components
    config
    router
    store
    utils
    views
    App.vue
    main.js
.gitignore
.env.dev
.env.test
.env.prod
index.html
package.json
vite.config.js
yarn.lock
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="vite-config-js" tabindex="-1"><a class="header-anchor" href="#vite-config-js" aria-hidden="true">#</a> vite.config.js</h3>`,21),u=s("\u5B98\u65B9\u6587\u6863: "),d={href:"https://vitejs.dev/config",target:"_blank",rel:"noopener noreferrer"},v=s("https://vitejs.dev/config"),k=t(`<blockquote><p>\u66F4\u6539\u8FD9\u4E2A\u914D\u7F6E\u9700\u8981\u91CD\u542F</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>$ <span class="token function">yarn</span> dev
<span class="token function">yarn</span> run v1.22.10
$ vite

  VITE v4.3.9  ready <span class="token keyword">in</span> <span class="token number">178</span> ms

  \u279C  Local:   http://localhost:8080/
  \u279C  Network: use --host to expose
  \u279C  press h to show <span class="token builtin class-name">help</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u83B7\u53D6\u73AF\u5883\u53D8\u91CF" tabindex="-1"><a class="header-anchor" href="#\u83B7\u53D6\u73AF\u5883\u53D8\u91CF" aria-hidden="true">#</a> \u83B7\u53D6\u73AF\u5883\u53D8\u91CF</h3><p>\u4EE5\u524D\u662F</p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code>console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>process<span class="token punctuation">.</span>env<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,5),m=s("\u6587\u6863\u5730\u5740: "),b={href:"https://vitejs.dev/guide/env-and-mode.html",target:"_blank",rel:"noopener noreferrer"},g=s("https://vitejs.dev/guide/env-and-mode.html"),h=s(" \u73B0\u5728\u9700\u8981\u6539\u6210"),y=t(`<div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code>console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">.</span>env<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5982\u679C\u8981\u5207\u6362\u73AF\u5883\uFF0C\u9700\u8981\u4FEE\u6539<code>package.json</code>\u6539\u6210\u5F00\u53D1\u73AF\u5883</p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;scripts&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;dev&quot;</span><span class="token operator">:</span> <span class="token string">&quot;vite --mode dev&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;build&quot;</span><span class="token operator">:</span> <span class="token string">&quot;vite build&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;preview&quot;</span><span class="token operator">:</span> <span class="token string">&quot;vite preview&quot;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h3 id="\u81EA\u5B9A\u4E49\u73AF\u5883\u53D8\u91CF" tabindex="-1"><a class="header-anchor" href="#\u81EA\u5B9A\u4E49\u73AF\u5883\u53D8\u91CF" aria-hidden="true">#</a> \u81EA\u5B9A\u4E49\u73AF\u5883\u53D8\u91CF</h3><blockquote><p>\u53EA\u6709\u524D\u7F00\u53D8\u91CF\u4E3A<code>VITE_</code>\u7684\u624D\u80FD\u81EA\u5B9A\u4E49\u53D8\u91CF \u5728\u9879\u76EE\u6839\u76EE\u5F55\u521B\u5EFA\u4E00\u4E2A<code>.env.dev</code></p></blockquote><p>\u5728<code>.env.dev</code>\u4E2D\u914D\u7F6E</p><div class="language-dotenv ext-dotenv line-numbers-mode"><pre class="language-dotenv"><code>NODE_ENV=development
VITE_NAME=wxvirus
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u518D\u6B21\u542F\u52A8\u6253\u5370\u4E4B\u540E</p><div class="language-json ext-json line-numbers-mode"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;VITE_NAME&quot;</span><span class="token operator">:</span> <span class="token string">&quot;wxvirus&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;VITE_USER_NODE_ENV&quot;</span><span class="token operator">:</span> <span class="token string">&quot;development&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;BASE_URL&quot;</span><span class="token operator">:</span> <span class="token string">&quot;/&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;MODE&quot;</span><span class="token operator">:</span> <span class="token string">&quot;dev&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;DEV&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token property">&quot;PROD&quot;</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
    <span class="token property">&quot;SSR&quot;</span><span class="token operator">:</span> <span class="token boolean">false</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5C31\u53EF\u4EE5\u770B\u5230\u81EA\u5DF1\u81EA\u5B9A\u4E49\u7684\u73AF\u5883\u53D8\u91CF</p><h2 id="\u8DEF\u7531\u5C01\u88C5" tabindex="-1"><a class="header-anchor" href="#\u8DEF\u7531\u5C01\u88C5" aria-hidden="true">#</a> \u8DEF\u7531\u5C01\u88C5</h2><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> createRouter<span class="token punctuation">,</span> createWebHashHistory <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vue-router&#39;</span>
<span class="token comment">// hash \u8DEF\u7531\u662F\u4E95\u53F7 \u4E0D\u9700\u8981 nginx \u914D\u7F6E</span>
<span class="token comment">// history \u662F\u76F4\u63A5\u659C\u6760</span>

<span class="token keyword">import</span> Home <span class="token keyword">from</span> <span class="token string">&#39;./../components/Home.vue&#39;</span>
<span class="token keyword">import</span> Welcome <span class="token keyword">from</span> <span class="token string">&#39;./../components/Welcome.vue&#39;</span>
<span class="token keyword">import</span> Login <span class="token keyword">from</span> <span class="token string">&#39;./../components/Login.vue&#39;</span>

<span class="token keyword">const</span> routes <span class="token operator">=</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;home&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">path</span><span class="token operator">:</span> <span class="token string">&#39;/&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">meta</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&#39;\u9996\u9875&#39;</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">component</span><span class="token operator">:</span> Home<span class="token punctuation">,</span>
        <span class="token literal-property property">redirect</span><span class="token operator">:</span> <span class="token string">&#39;/welcome&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">children</span><span class="token operator">:</span> <span class="token punctuation">[</span>
            <span class="token punctuation">{</span>
                <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;welcome&#39;</span><span class="token punctuation">,</span>
                <span class="token literal-property property">path</span><span class="token operator">:</span> <span class="token string">&#39;/welcome&#39;</span><span class="token punctuation">,</span>
                <span class="token literal-property property">component</span><span class="token operator">:</span> Welcome<span class="token punctuation">,</span>
                <span class="token literal-property property">meta</span><span class="token operator">:</span> <span class="token punctuation">{</span>
                    <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&#39;\u6B22\u8FCE\u9875&#39;</span><span class="token punctuation">,</span>
                <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token punctuation">{</span>
                <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;login&#39;</span><span class="token punctuation">,</span>
                <span class="token literal-property property">path</span><span class="token operator">:</span> <span class="token string">&#39;/login&#39;</span><span class="token punctuation">,</span>
                <span class="token literal-property property">component</span><span class="token operator">:</span> Login<span class="token punctuation">,</span>
                <span class="token literal-property property">meta</span><span class="token operator">:</span> <span class="token punctuation">{</span>
                    <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&#39;\u767B\u5F55&#39;</span><span class="token punctuation">,</span>
                <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">]</span>

<span class="token keyword">const</span> router <span class="token operator">=</span> <span class="token function">createRouter</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">history</span><span class="token operator">:</span> <span class="token function">createWebHashHistory</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    routes<span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> router
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8DF3\u8F6C\u7684\u4E09\u79CD\u65B9\u5F0F\uFF1A</p><ol><li>\u4F7F\u7528<code>router-link</code></li><li>\u4F7F\u7528<code>Options API</code>\u7684\u5B9A\u4E49\u4E8B\u4EF6\u65B9\u6CD5\u8DF3\u8F6C</li><li>\u4F7F\u7528<code>Composition API</code>\u4F7F\u7528<code>useRouter</code>\u6765\u8FDB\u884C\u8DF3\u8F6C</li></ol><p>\u7EAF\u94A9\u5B50\u51FD\u6570</p><div class="language-vue ext-vue line-numbers-mode"><pre class="language-vue"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">setup</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">import</span> <span class="token punctuation">{</span> useRouter <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vue-router&#39;</span>
    <span class="token keyword">const</span> router <span class="token operator">=</span> <span class="token function">useRouter</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token keyword">const</span> <span class="token function-variable function">goHome</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
        router<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span><span class="token string">&#39;/&#39;</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>

<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>template</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">&gt;</span></span>\u6B22\u8FCE\u6765\u5230\u767B\u5F55\u9875\u9762<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>el-button</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>primary<span class="token punctuation">&quot;</span></span> <span class="token attr-name">@click</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>goHome<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>\u56DE\u9996\u9875<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>el-button</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>template</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-vue ext-vue line-numbers-mode"><pre class="language-vue"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;login&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">methods</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token function">goHome</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">this</span><span class="token punctuation">.</span>$router<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span><span class="token string">&#39;/&#39;</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-vue ext-vue line-numbers-mode"><pre class="language-vue"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>template</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">&gt;</span></span>\u6B22\u8FCE\u6765\u5230\u6B22\u8FCE\u754C\u9762<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>router-link</span> <span class="token attr-name">to</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>/login<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>\u53BB\u767B\u5F55<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>router-link</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>template</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u73AF\u5883\u914D\u7F6E" tabindex="-1"><a class="header-anchor" href="#\u73AF\u5883\u914D\u7F6E" aria-hidden="true">#</a> \u73AF\u5883\u914D\u7F6E</h2><p><code>config/index.js</code></p><div class="language-javascript ext-js line-numbers-mode"><pre class="language-javascript"><code><span class="token doc-comment comment">/**
 * \u73AF\u5883\u914D\u7F6E\u5C01\u88C5
 */</span>

<span class="token comment">// \u662F\u4E00\u4E2A\u5BF9\u8C61</span>
<span class="token comment">// \u53D6\u51FA\u73AF\u5883 \u9ED8\u8BA4\u662F\u751F\u4EA7\u73AF\u5883</span>
<span class="token comment">// dev test prod</span>
<span class="token keyword">const</span> env <span class="token operator">=</span> <span class="token keyword">import</span><span class="token punctuation">.</span>meta<span class="token punctuation">.</span>env<span class="token punctuation">.</span><span class="token constant">MODE</span> <span class="token operator">||</span> <span class="token string">&#39;prod&#39;</span>
<span class="token keyword">const</span> EnvConfig <span class="token operator">=</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">dev</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">baseApi</span><span class="token operator">:</span> <span class="token string">&#39;/&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">mockApi</span><span class="token operator">:</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">test</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">baseApi</span><span class="token operator">:</span> <span class="token string">&#39;/test.future.com/api&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">mockApi</span><span class="token operator">:</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">prod</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">baseApi</span><span class="token operator">:</span> <span class="token string">&#39;/future.com/api&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">mockApi</span><span class="token operator">:</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>
<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
    <span class="token comment">// \u5F00\u53D1\u73AF\u5883</span>
    <span class="token literal-property property">env</span><span class="token operator">:</span> env<span class="token punctuation">,</span>
    <span class="token comment">// \u5F53\u524D\u63A5\u53E3\u662F\u5426\u652F\u6301 mock \u5F00\u5173</span>
    <span class="token literal-property property">mock</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token operator">...</span>EnvConfig<span class="token punctuation">[</span>env<span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,22),f=s("\u5728\u7EBF mock \u7684\u7F51\u7AD9"),x={href:"https://fastmock.site",target:"_blank",rel:"noopener noreferrer"},_=s("https://fastmock.site"),q=s("mockjs \u6587\u6863: "),j={href:"https://mocjs.com",target:"_blank",rel:"noopener noreferrer"},w=s("https://mockjs.com"),E=t(`<h2 id="koa2-\u540E\u7AEF\u9879\u76EE\u521D\u59CB\u5316" tabindex="-1"><a class="header-anchor" href="#koa2-\u540E\u7AEF\u9879\u76EE\u521D\u59CB\u5316" aria-hidden="true">#</a> Koa2 \u540E\u7AEF\u9879\u76EE\u521D\u59CB\u5316</h2><h3 id="koa-generator-\u5FEB\u901F\u751F\u6210-koa-\u670D\u52A1\u7684\u811A\u624B\u67B6\u5DE5\u5177" tabindex="-1"><a class="header-anchor" href="#koa-generator-\u5FEB\u901F\u751F\u6210-koa-\u670D\u52A1\u7684\u811A\u624B\u67B6\u5DE5\u5177" aria-hidden="true">#</a> koa-generator \u5FEB\u901F\u751F\u6210 koa \u670D\u52A1\u7684\u811A\u624B\u67B6\u5DE5\u5177</h3><p>\u5168\u5C40\u5B89\u88C5\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">npm</span> <span class="token function">install</span> -g koa-generator
<span class="token comment"># or</span>
<span class="token function">yarn</span> global <span class="token function">add</span> koa-generator
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u751F\u6210\u9879\u76EE\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>koa2 manager-server
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p>\u5982\u679C\u65E0\u6CD5\u4F7F\u7528\u547D\u4EE4\uFF0C\u5219\u4EE3\u8868\u6CA1\u6709\u914D\u7F6E\u73AF\u5883\u53D8\u91CF\uFF0C\u914D\u7F6E\u4E00\u4E0B\u73AF\u5883\u53D8\u91CF\u5373\u53EF</p></blockquote><h3 id="\u5B89\u88C5\u4F9D\u8D56" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5\u4F9D\u8D56" aria-hidden="true">#</a> \u5B89\u88C5\u4F9D\u8D56</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">yarn</span>
<span class="token comment"># or</span>
<span class="token function">npm</span> <span class="token function">install</span>
<span class="token comment"># or</span>
cnpm <span class="token function">install</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u542F\u52A8\u670D\u52A1" tabindex="-1"><a class="header-anchor" href="#\u542F\u52A8\u670D\u52A1" aria-hidden="true">#</a> \u542F\u52A8\u670D\u52A1</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">yarn</span> start
<span class="token comment"># or</span>
<span class="token function">npm</span> start
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u51FA\u73B0\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">node</span> .bin/www
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,13),V=s("\u5C31\u53EF\u4EE5\u4F7F\u7528\u9ED8\u8BA4\u7684\u8BBF\u95EE\u5730\u5740: "),A={href:"http://localhost:3000",target:"_blank",rel:"noopener noreferrer"},N=s("http://localhost:3000"),H=t(`<h3 id="koa2-\u7684\u6846\u67B6\u76EE\u5F55" tabindex="-1"><a class="header-anchor" href="#koa2-\u7684\u6846\u67B6\u76EE\u5F55" aria-hidden="true">#</a> koa2 \u7684\u6846\u67B6\u76EE\u5F55</h3><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>|-- koa-server
   |-- app.js             #\u6839\u5165\u53E3
   |-- package-lock.json
   |-- package.json			 #\u9879\u76EE\u4F9D\u8D56\u5305\u6587\u4EF6
   |-- bin
   |   |-- www					 #\u8FD0\u884C\u542F\u52A8\u6587\u4EF6
   |-- public            #\u516C\u5171\u8D44\u6E90
   |   |-- images
   |   |-- javascripts
   |   |-- stylesheets
   |       |-- style.css
   |-- routes
   |   |-- index.js      #\u5B9A\u4E49\u4E86localhost:3000/\u4E4B\u4E0B\u7684\u8DEF\u7531
   |   |-- users.js      #\u5B9A\u4E49\u4E86localhost:3000/users/\u4E4B\u4E0B\u7684\u8DEF\u7531
   |-- views             #\u89C6\u56FEPug\u662F\u4E00\u6B3EHTML\u6A21\u677F\u5F15\u64CE\uFF0C\u4E13\u95E8\u4E3A Node.js \u5E73\u53F0\u5F00\u53D1
       |-- error.pug
       |-- index.pug
       |-- layout.pug
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2);function D(I,R){const a=i("ExternalLinkIcon");return o(),l("div",null,[r,n("p",null,[u,n("a",d,[v,e(a)])]),k,n("p",null,[m,n("a",b,[g,e(a)]),h]),y,n("ul",null,[n("li",null,[f,n("a",x,[_,e(a)])]),n("li",null,[q,n("a",j,[w,e(a)])])]),E,n("p",null,[V,n("a",A,[N,e(a)])]),H])}var T=p(c,[["render",D],["__file","vue3-manager.html.vue"]]);export{T as default};
