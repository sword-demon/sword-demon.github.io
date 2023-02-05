import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e}from"./app.c212f57f.js";const p={},t=e(`<h1 id="iterator-\u6A21\u5F0F" tabindex="-1"><a class="header-anchor" href="#iterator-\u6A21\u5F0F" aria-hidden="true">#</a> Iterator \u6A21\u5F0F</h1><blockquote><p>\u4E00\u822C\u7528\u4E8E\u591A\u6570\u636E\u904D\u5386\u3002</p><p>\u5728\u4F7F\u7528 Java \u8BED\u8A00\u663E\u793A\u6570\u7EC4<code>arr</code>\u5143\u7D20\u65F6\uFF0C\u6211\u4EEC\u5927\u90E8\u5206\u65F6\u5019\u4F7F\u7528<code>for</code>\u5FAA\u73AF\u904D\u5386\u6570\u7EC4</p><div class="language-java ext-java line-numbers-mode"><pre class="language-java"><code><span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> arr<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
   <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">printlne</span><span class="token punctuation">(</span>arr<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5C06\u8FD9\u91CC\u7684\u5FAA\u73AF\u53D8\u91CF<code>i</code>\u7684\u4F5C\u7528\u62BD\u8C61\u5316\u3001\u901A\u7528\u5316\u540E\u5F62\u6210\u7684\u6A21\u5F0F\uFF0C\u5728\u8BBE\u8BA1\u6A21\u5F0F\u4E2D\u6210\u4E3A<code>Iterator</code>\u6A21\u5F0F\u3002<code>Iterator</code>\u6A21\u5F0F\u7528\u4E8E\u5728\u6570\u636E\u96C6\u5408\u4E2D\u6309\u7167\u987A\u5E8F\u904D\u5386\u96C6\u5408\u3002</p></blockquote><h2 id="demo-\u5C06\u4E66-book-\u653E\u7F6E\u5230\u4E66\u67B6-bookshelf-\u4E2D-\u5E76\u5C06\u4E66\u7684\u540D\u5B57\u6309\u987A\u5E8F\u663E\u793A\u51FA\u6765" tabindex="-1"><a class="header-anchor" href="#demo-\u5C06\u4E66-book-\u653E\u7F6E\u5230\u4E66\u67B6-bookshelf-\u4E2D-\u5E76\u5C06\u4E66\u7684\u540D\u5B57\u6309\u987A\u5E8F\u663E\u793A\u51FA\u6765" aria-hidden="true">#</a> Demo\uFF1A\u5C06\u4E66(Book)\u653E\u7F6E\u5230\u4E66\u67B6(BookShelf)\u4E2D\uFF0C\u5E76\u5C06\u4E66\u7684\u540D\u5B57\u6309\u987A\u5E8F\u663E\u793A\u51FA\u6765</h2><p><code>Aggregate</code>\u63A5\u53E3\uFF1A\u662F\u6240\u8981\u904D\u5386\u7684\u96C6\u5408\u7684\u63A5\u53E3\u3002\u5B9E\u73B0\u4E86\u8BE5\u63A5\u53E3\u7684\u7C7B\u5C06\u6210\u4E3A\u4E00\u4E2A\u53EF\u4EE5\u4FDD\u5B58\u591A\u4E2A\u5143\u7D20\u7684\u96C6\u5408\u3002</p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221105204942011.png" alt="image-20221105204942011" loading="lazy"></p><div class="language-java ext-java line-numbers-mode"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">demo<span class="token punctuation">.</span>bookself</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * \u8868\u793A\u96C6\u5408\u7684\u63A5\u53E3
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">Aggregate</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token class-name">WxIterator</span> <span class="token function">iterator</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u4E2A\u63A5\u53E3\u4E2D\u58F0\u660E\u7684\u65B9\u6CD5\u53EA\u6709\u4E00\u4E2A<code>iterator</code>\u7684\u65B9\u6CD5\uFF0C\u8BE5\u65B9\u6CD5\u4F1A\u751F\u6210\u4E00\u4E2A\u7528\u4E8E\u904D\u5386\u96C6\u5408\u7684\u8FED\u4EE3\u5668\u3002<strong>\u8FD9\u91CC\u6211\u4FEE\u6539\u4E86\u4E00\u4E2A\u8FED\u4EE3\u5668\u63A5\u53E3\u7684\u540D\u79F0\u4E3A<code>WxIterator</code>\u7528\u4E8E\u533A\u5206\u548C<code>java</code>\u5DF2\u6709\u7684</strong></p><div class="language-java ext-java line-numbers-mode"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">demo<span class="token punctuation">.</span>bookself</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * \u8868\u793A\u904D\u5386\u96C6\u5408\u7684\u63A5\u53E3
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">WxIterator</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * \u5224\u65AD\u662F\u5426\u6709\u4E0B\u4E00\u4E2A\u5143\u7D20
     * \u4E3B\u8981\u7528\u4E8E\u7EC8\u6B62\u5FAA\u73AF
     * <span class="token keyword">@return</span> boolean
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token keyword">boolean</span> <span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * \u83B7\u53D6\u4E0B\u4E00\u4E2A\u5143\u7D20
     * \u5305\u542B\u8FED\u4EE3\u5668\u79FB\u52A8\u81F3\u4E0B\u4E00\u4E2A\u5143\u7D20\u7684\u4F4D\u7F6E
     * <span class="token keyword">@return</span> Object
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token class-name">Object</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>WxIterator</code>\u76F8\u5F53\u4E8E\u4E0A\u9762<code>for</code>\u5FAA\u73AF\u7684\u5FAA\u73AF\u53D8\u91CF\uFF0C\u6211\u4EEC\u5B9A\u4E49 2 \u4E2A\u65B9\u6CD5</p><ul><li><p>\u5224\u65AD\u662F\u5426\u6709\u4E0B\u4E00\u4E2A\u5143\u7D20</p><blockquote><p>\u8FD9\u4E2A\u65B9\u6CD5\u7684\u8FD4\u56DE\u503C\u662F<code>boolean</code>,\u5F53\u96C6\u5408\u4E2D\u5B58\u5728\u4E0B\u4E00\u4E2A\u5143\u7D20\u65F6\uFF0C\u8FD4\u56DE<code>true</code>\uFF1B\u5F53\u96C6\u5408\u4E2D\u4E0D\u5B58\u5728\u4E0B\u4E00\u4E2A\u5143\u7D20\u65F6\uFF0C\u5373\u5DF2\u7ECF\u904D\u5386\u81F3\u96C6\u5408\u672B\u5C3E\u65F6\uFF0C\u8BE5\u65B9\u6CD5\u8FD4\u56DE<code>false</code>\uFF1B<code>hasNext</code>\u65B9\u6CD5\u4E3B\u8981\u7528\u4E8E\u5FAA\u73AF\u7EC8\u6B62\u6761\u4EF6\u3002</p></blockquote></li><li><p>\u83B7\u53D6\u4E0B\u4E00\u4E2A\u5143\u7D20\uFF0C\u5E76\u5C06\u8FED\u4EE3\u5668\u79FB\u52A8\u5230\u4E0B\u4E00\u4E2A\u4F4D\u7F6E\u3002</p></li></ul><h2 id="\u8FED\u4EE3\u5668\u63A5\u53E3" tabindex="-1"><a class="header-anchor" href="#\u8FED\u4EE3\u5668\u63A5\u53E3" aria-hidden="true">#</a> \u8FED\u4EE3\u5668\u63A5\u53E3</h2><div class="language-java ext-java line-numbers-mode"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">demo<span class="token punctuation">.</span>bookself</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * \u8868\u793A\u904D\u5386\u96C6\u5408\u7684\u63A5\u53E3
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">WxIterator</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * \u5224\u65AD\u662F\u5426\u6709\u4E0B\u4E00\u4E2A\u5143\u7D20
     * \u4E3B\u8981\u7528\u4E8E\u7EC8\u6B62\u5FAA\u73AF
     * <span class="token keyword">@return</span> boolean
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token keyword">boolean</span> <span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * \u83B7\u53D6\u4E0B\u4E00\u4E2A\u5143\u7D20
     * \u5305\u542B\u8FED\u4EE3\u5668\u79FB\u52A8\u81F3\u4E0B\u4E00\u4E2A\u5143\u7D20\u7684\u4F4D\u7F6E
     * <span class="token keyword">@return</span> Object
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token class-name">Object</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u4E66\u67B6\u7C7B\u548C\u4E66\u5B9E\u4F53\u7C7B" tabindex="-1"><a class="header-anchor" href="#\u4E66\u67B6\u7C7B\u548C\u4E66\u5B9E\u4F53\u7C7B" aria-hidden="true">#</a> \u4E66\u67B6\u7C7B\u548C\u4E66\u5B9E\u4F53\u7C7B</h2><div class="language-java ext-java line-numbers-mode"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">demo<span class="token punctuation">.</span>bookself</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * \u4E66\u7684\u5B9E\u4F53\u7C7B
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Book</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> name<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">Book</span><span class="token punctuation">(</span><span class="token class-name">String</span> name<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>name <span class="token operator">=</span> name<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> name<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java ext-java line-numbers-mode"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">demo<span class="token punctuation">.</span>bookself</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * \u8868\u793A\u4E66\u67B6\u7684\u7C7B
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">BookSelf</span> <span class="token keyword">implements</span> <span class="token class-name">Aggregate</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token class-name">Book</span><span class="token punctuation">[</span><span class="token punctuation">]</span> books<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> last <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">BookSelf</span><span class="token punctuation">(</span><span class="token keyword">int</span> maxsize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>books <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Book</span><span class="token punctuation">[</span>maxsize<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">Book</span> <span class="token function">getBookAt</span><span class="token punctuation">(</span><span class="token keyword">int</span> index<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> books<span class="token punctuation">[</span>index<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">appendBook</span><span class="token punctuation">(</span><span class="token class-name">Book</span> book<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>books<span class="token punctuation">[</span>last<span class="token punctuation">]</span> <span class="token operator">=</span> book<span class="token punctuation">;</span>
        last<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">getLength</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> last<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">WxIterator</span> <span class="token function">iterator</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BookSelfIterator</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u5B9E\u73B0wxiterator\u7684\u65B9\u6CD5" tabindex="-1"><a class="header-anchor" href="#\u5B9E\u73B0wxiterator\u7684\u65B9\u6CD5" aria-hidden="true">#</a> \u5B9E\u73B0<code>WxIterator</code>\u7684\u65B9\u6CD5</h2><div class="language-java ext-java line-numbers-mode"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">demo<span class="token punctuation">.</span>bookself</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * \u904D\u5386\u4E66\u67B6\u7684\u7C7B
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">BookSelfIterator</span> <span class="token keyword">implements</span> <span class="token class-name">WxIterator</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token class-name">BookSelf</span> bookSelf<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> index<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">BookSelfIterator</span><span class="token punctuation">(</span><span class="token class-name">BookSelf</span> bookSelf<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>bookSelf <span class="token operator">=</span> bookSelf<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>index <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * \u5224\u65AD\u662F\u5426\u6709\u4E0B\u4E00\u4E2A\u5143\u7D20
     * \u4E3B\u8981\u7528\u4E8E\u7EC8\u6B62\u5FAA\u73AF
     *
     * <span class="token keyword">@return</span> boolean
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> index <span class="token operator">&lt;</span> bookSelf<span class="token punctuation">.</span><span class="token function">getLength</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * \u83B7\u53D6\u4E0B\u4E00\u4E2A\u5143\u7D20
     * \u5305\u542B\u8FED\u4EE3\u5668\u79FB\u52A8\u81F3\u4E0B\u4E00\u4E2A\u5143\u7D20\u7684\u4F4D\u7F6E
     *
     * <span class="token keyword">@return</span> Object
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">Object</span> <span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Book</span> book <span class="token operator">=</span> bookSelf<span class="token punctuation">.</span><span class="token function">getBookAt</span><span class="token punctuation">(</span>index<span class="token punctuation">)</span><span class="token punctuation">;</span>
        index<span class="token operator">++</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> book<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u6D4B\u8BD5\u7C7B" tabindex="-1"><a class="header-anchor" href="#\u6D4B\u8BD5\u7C7B" aria-hidden="true">#</a> \u6D4B\u8BD5\u7C7B</h2><div class="language-java ext-java line-numbers-mode"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">demo<span class="token punctuation">.</span>bookself</span><span class="token punctuation">;</span>

<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Main</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">BookSelf</span> bookSelf <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">BookSelf</span><span class="token punctuation">(</span><span class="token number">4</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        bookSelf<span class="token punctuation">.</span><span class="token function">appendBook</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Book</span><span class="token punctuation">(</span><span class="token string">&quot;Around the world in 80 days&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        bookSelf<span class="token punctuation">.</span><span class="token function">appendBook</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Book</span><span class="token punctuation">(</span><span class="token string">&quot;Bible&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        bookSelf<span class="token punctuation">.</span><span class="token function">appendBook</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Book</span><span class="token punctuation">(</span><span class="token string">&quot;Cinderella&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        bookSelf<span class="token punctuation">.</span><span class="token function">appendBook</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Book</span><span class="token punctuation">(</span><span class="token string">&quot;Daddy-Long-Legs&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">WxIterator</span> it <span class="token operator">=</span> bookSelf<span class="token punctuation">.</span><span class="token function">iterator</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span>it<span class="token punctuation">.</span><span class="token function">hasNext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">Book</span> book <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">Book</span><span class="token punctuation">)</span> it<span class="token punctuation">.</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>book<span class="token punctuation">.</span><span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,19),o=[t];function c(l,i){return s(),a("div",null,o)}var k=n(p,[["render",c],["__file","iterator-designer.html.vue"]]);export{k as default};
