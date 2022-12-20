import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.a6cd7906.js";const t={},i=e(`<h2 id="bool-\u7C7B\u578B" tabindex="-1"><a class="header-anchor" href="#bool-\u7C7B\u578B" aria-hidden="true">#</a> bool \u7C7B\u578B</h2><p>\u5E03\u5C14\u7C7B\u578B\u7684\u503C\u53EA\u53EF\u4EE5\u662F\u5E38\u91CF<code>true</code>\u6216\u8005<code>false</code>\u3002</p><p>\u4E00\u4E2A\u7B80\u5355\u7684\u4F8B\u5B50\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> gender <span class="token builtin">bool</span> <span class="token operator">=</span> <span class="token boolean">false</span>

flag <span class="token operator">:=</span> <span class="token boolean">true</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u6570\u503C\u578B" tabindex="-1"><a class="header-anchor" href="#\u6570\u503C\u578B" aria-hidden="true">#</a> \u6570\u503C\u578B</h2><h3 id="\u6574\u6570\u578B" tabindex="-1"><a class="header-anchor" href="#\u6574\u6570\u578B" aria-hidden="true">#</a> \u6574\u6570\u578B</h3><ul><li>int8 \u6709\u7B26\u53F7 8 \u4F4D\u6574\u578B(-128-127)\u957F\u5EA6\uFF1A8bit \u4E00\u4E2A\u5B57\u8282</li><li>int16 \u6709\u7B26\u53F7 16 \u4F4D\u6574\u578B(-32768-32767)</li><li>int32 \u6709\u7B26\u53F7 32 \u4F4D\u6574\u578B(-214783648 \u5230 214783647)</li><li>int64 \u6709\u7B26\u53F7 63 \u4F4D\u6574\u578B(-922337203854775808 \u5230 922337203854775807)</li><li>uint8 \u65E0\u7B26\u53F7 8 \u4F4D\u6574\u578B(0-255)8 \u4F4D\u90FD\u7528\u4E8E\u8868\u793A\u6570\u503C</li><li>uint16 \u65E0\u7B26\u53F7 16 \u4F4D\u6574\u578B(0-65535)</li><li>uint32 \u65E0\u7B26\u53F7 32 \u4F4D\u6574\u578B(0-4294967295)</li><li>uint64 \u65E0\u7B26\u53F7 63 \u4F4D\u6574\u578B(0-184457440737095)</li></ul><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>\u6709\u7B26\u53F7\u6570 \u7F3A\u9677\uFF1A\u4E0D\u80FD\u8868\u793A\u8D1F\u6570
11111111 = 257
\u540E\u9762\u5C31\u628A\u7B2C\u4E00\u4F4D\u62FF\u51FA\u6765\u4EE3\u8868\u7B26\u53F7\u4F4D
01111111 = 127
\u5982\u679C\u7B2C\u4E00\u4F4D\u662F\u8D1F\u6570(\u7B2C\u4E00\u4F4D\u662F1)
10000001 = -1

\u6709\u7B26\u53F7\u6570\u4F1A\u62FF\u51FA\u7B2C\u4E00\u4F4D\u6765\u8868\u793A\u6B63/\u8D1F\u6570\uFF0C\u6240\u4EE5\u5B83\u7684\u4E0A\u9650\u5C31\u4F1A\u5C0F

\u65E0\u7B26\u53F7\u6570\uFF0C\u7B2C\u4E00\u4F4D\u5C31\u4F1A\u53C2\u4E0E\u8BA1\u7B97\uFF0C\u4E0A\u9650\u5C31\u4F1A\u5F88\u9AD8
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u76F8\u6BD4\u8F83 python \u4E3A\u5565 go \u6709\u8FD9\u4E48\u591A int \u7C7B\u578B</p><p><code>python</code>\u4E0D\u7BA1\u4F60\u6570\u636E\u5E93\u8BBE\u7F6E\u7684\u5B57\u6BB5\u6709\u5565\u4E0A\u9650\uFF0C\u90FD\u662F\u7528<code>int</code>\u8868\u793A</p><p>\u4F46\u662F\u76F8\u5BF9\u4E8E\u73B0\u5B9E\u6765\u8BF4\uFF0C\u5F88\u591A\u90FD\u662F\u6709\u4E0A\u9650\u7684\uFF0C\u6BD4\u5982\uFF1A\u5E74\u9F84\uFF0C\u5206\u6570\u90FD\u662F\u6709\u4E0A\u9650\u7684\uFF0C\u8FD9\u4E9B\u6570\u636E\u5C31\u4E0D\u5FC5\u8981\u53BB\u7528<code>int16</code>\u540E\u9762\u7684\u3002</p><p>\u6240\u4EE5\u5728\u5F88\u591A\u573A\u666F\u4E0B\uFF0C\u6570\u5B57\u6709\u4E0A\u9650\uFF0C\u6211\u4EEC\u53EF\u4EE5\u9009\u62E9\u5408\u9002\u7684\u6570\u636E\u7C7B\u578B\u6765\u964D\u4F4E\u5185\u5B58\u7684\u5360\u7528\u3002</p><p>\u5728<code>python</code>\u4E2D\u5B9A\u4E00\u4E2A<code>int</code>\u53D8\u91CF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span> age <span class="token operator">=</span> <span class="token number">18</span>
<span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span> <span class="token function">import</span> sys
<span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span> print<span class="token punctuation">(</span>sys.getsizeof<span class="token punctuation">(</span>age<span class="token punctuation">))</span>
<span class="token number">28</span>
<span class="token operator">&gt;&gt;</span><span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5B83\u5C31\u5360\u7528\u4E86<strong>28</strong>\u4E2A\u5B57\u8282\uFF0C\u867D\u7136\u5728<code>python</code>\u4E2D<code>int</code>\u5360\u7528\u5B57\u8282\u662F\u52A8\u6001\u7684\uFF0C\u4F46\u662F\u5B83\u7684\u4F7F\u7528\u6211\u4EEC\u4E0D\u7528\u62C5\u5FC3\u8D85\u8FC7\u4E0A\u9650\u3002</p></div><blockquote><p>\u6240\u4EE5\u5BF9\u5E94\u9759\u6001\u7C7B\u578B\u7684\u8BED\u8A00\u7684\u7C7B\u578B\u9009\u62E9\uFF0C\u6211\u4EEC\u5FC5\u987B\u5F97\u5148\u505A\u597D\u9884\u671F\uFF0C\u5426\u5219\u5230\u4E86\u4E0A\u9650\u5C31\u5F88\u96BE\u53D7\u3002</p></blockquote><div class="custom-container tip"><p class="custom-container-title">int \u7C7B\u578B</p><p>\u5728<code>go</code>\u8BED\u8A00\u4E2D\uFF0C\u5982\u679C\u5B9A\u4E49\u4E86<code>int</code>\u7C7B\u578B\u7684\u6570\u636E\uFF0C\u5B83\u4E5F\u662F\u4E00\u4E2A\u52A8\u6001\u7C7B\u578B\uFF0C\u53D6\u51B3\u4E8E\u673A\u5668\u672C\u8EAB\u662F\u591A\u5C11\u4F4D\uFF0C64 \u4F4D\u7684\u673A\u5668\u4E0A\u8FD0\u884C\u90A3\u4E48<code>int</code>\u5C31\u662F<code>int64</code>\uFF0C\u5982\u679C\u662F<code>32</code>\u4F4D\u7684\u673A\u5668\u4E0A\u90A3\u4E48\u5C31\u662F 4 \u4E2A\u5B57\u8282 \u3002</p><p>\u4F7F\u7528<code>go</code>\u8BED\u8A00\u5185\u7F6E\u7684\u4E00\u4E2A\u65B9\u6CD5\u6765\u67E5\u770B</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> age <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">18</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>age<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>unsafe<span class="token punctuation">.</span><span class="token function">Sizeof</span><span class="token punctuation">(</span>age<span class="token punctuation">)</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">18</span>
<span class="token number">8</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6211\u8FD9\u91CC\u662F 8 \u4E2A\u5B57\u8282\u3002</p><p>\u4E00\u822C\u60C5\u51B5\u4E0B\uFF0C\u6211\u4EEC\u90FD\u4F1A\u6307\u660E<code>int</code>\u5360\u7528\u591A\u5C11\u4E2A\u5B57\u8282</p></div><h3 id="\u6D6E\u70B9\u578B" tabindex="-1"><a class="header-anchor" href="#\u6D6E\u70B9\u578B" aria-hidden="true">#</a> \u6D6E\u70B9\u578B</h3><ul><li>float32 32 \u4F4D\u6D6E\u70B9\u578B\u6570</li><li>float64 64 \u4F4D\u6D6E\u70B9\u578B\u6570</li></ul><div class="custom-container tip"><p class="custom-container-title">\u6CE8\u610F</p><p>\u5B83\u6CA1\u6709<code>float</code>\u7C7B\u578B</p><p><code>float32</code>\u6700\u5927\u503C\uFF1A<code>3.4028234663852886e+38</code></p><p><code>float64</code>\u6700\u5927\u503C\uFF1A<code>1.7976931348623157e+308</code></p><blockquote><p>\u4E3A\u4EC0\u4E48 64 \u4F4D\u7684 float \u6700\u5927\u503C\u8FDC\u5927\u4E8E int64\uFF0Cfloat \u5E95\u5C42\u5B58\u50A8\u548C int \u7684\u5B58\u50A8\u662F\u4E0D\u4E00\u6837\u7684</p><p>float32 \u548C float64 \u4E24\u8005\u5360\u7528\u5185\u5B58\u4E0D\u4E00\u6837\uFF0C64 \u4F4D\u7684\u6700\u5927\u6570\u548C\u7CBE\u5EA6\u90FD\u6BD4 32 \u4F4D\u9AD8</p></blockquote></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">var</span> age <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">18</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>age<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>unsafe<span class="token punctuation">.</span><span class="token function">Sizeof</span><span class="token punctuation">(</span>age<span class="token punctuation">)</span><span class="token punctuation">)</span>

<span class="token comment">// float \u7C7B\u578B</span>
<span class="token keyword">var</span> weight <span class="token builtin">float64</span> <span class="token operator">=</span> <span class="token number">71.2</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>weight<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>unsafe<span class="token punctuation">.</span><span class="token function">Sizeof</span><span class="token punctuation">(</span>weight<span class="token punctuation">)</span><span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>math<span class="token punctuation">.</span>MaxFloat32<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>math<span class="token punctuation">.</span>MaxFloat64<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;%T\\n&quot;</span><span class="token punctuation">,</span> weight<span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;%T\\n&quot;</span><span class="token punctuation">,</span> age<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">18</span>
<span class="token number">8</span>
<span class="token number">71.2</span>
<span class="token number">8</span>
<span class="token number">3</span>.4028234663852886e+38
<span class="token number">1</span>.7976931348623157e+308
float64
int

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u5176\u4ED6" tabindex="-1"><a class="header-anchor" href="#\u5176\u4ED6" aria-hidden="true">#</a> \u5176\u4ED6</h3><ul><li>byte \u7B49\u4E8E uint8 <code>type byte = uint8</code> \u5B9E\u9645\u4E0A\u662F<code>uint8</code>\u7684\u522B\u79F0</li><li>rune \u7B49\u4E8E int32 <code>type rune = int32</code> \u548C\u5B57\u7B26\u5904\u7406\u6709\u5173</li><li>uint 32 \u6216 64 \u4F4D \u81EA\u52A8\u9009\u62E9 32 \u4F4D\u6216\u8005 64 \u4F4D\u7684</li></ul><h3 id="\u5B57\u7B26" tabindex="-1"><a class="header-anchor" href="#\u5B57\u7B26" aria-hidden="true">#</a> \u5B57\u7B26</h3><blockquote><p>\u5B57\u7B26\u7684\u672C\u8D28\u662F\u4E00\u4E2A\u6570\u5B57\uFF0C\u53EF\u4EE5\u8FDB\u884C\u52A0\u51CF\u4E58\u9664</p></blockquote><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>b <span class="token operator">:=</span> <span class="token char">&#39;b&#39;</span>
fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>reflect<span class="token punctuation">.</span><span class="token function">TypeOf</span><span class="token punctuation">(</span>b <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;b+1=%c&quot;</span><span class="token punctuation">,</span> b <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>int32
b+1<span class="token operator">=</span>c

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u6CE8\u610F</p><ol><li>b + 1 \u53EF\u4EE5\u548C\u6570\u5B57\u91D1\u849C</li><li>b + 1 \u7684\u7C7B\u578B\u662F<code>int32</code></li><li>int \u7C7B\u578B\u53EF\u4EE5\u76F4\u63A5\u53D8\u6210\u5B57\u7B26</li></ol></div>`,23),o=[i];function c(p,l){return s(),a("div",null,o)}var r=n(t,[["render",c],["__file","go-base-datatype.html.vue"]]);export{r as default};