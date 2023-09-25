import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.879def1e.js";const e={},p=t(`<h1 id="android-\u5F00\u53D1\u8005\u7684-flutter-\u5FEB\u901F\u4E0A\u624B\u6307\u5357" tabindex="-1"><a class="header-anchor" href="#android-\u5F00\u53D1\u8005\u7684-flutter-\u5FEB\u901F\u4E0A\u624B\u6307\u5357" aria-hidden="true">#</a> android \u5F00\u53D1\u8005\u7684 flutter \u5FEB\u901F\u4E0A\u624B\u6307\u5357</h1><h2 id="\u901A\u8FC7\u6309\u94AE\u548C\u53D8\u91CF\u6765\u53D8\u66F4\u5185\u5BB9" tabindex="-1"><a class="header-anchor" href="#\u901A\u8FC7\u6309\u94AE\u548C\u53D8\u91CF\u6765\u53D8\u66F4\u5185\u5BB9" aria-hidden="true">#</a> \u901A\u8FC7\u6309\u94AE\u548C\u53D8\u91CF\u6765\u53D8\u66F4\u5185\u5BB9</h2><div class="language-dart ext-dart line-numbers-mode"><pre class="language-dart"><code><span class="token keyword">import</span> <span class="token string-literal"><span class="token string">&#39;package:flutter/material.dart&#39;</span></span><span class="token punctuation">;</span>

<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token function">runApp</span><span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token class-name">MyApp</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">class</span> <span class="token class-name">MyApp</span> <span class="token keyword">extends</span> <span class="token class-name">StatelessWidget</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token class-name">MyApp</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token keyword">super</span><span class="token punctuation">.</span>key<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// This widget is the root of your application.</span>
  <span class="token metadata function">@override</span>
  <span class="token class-name">Widget</span> <span class="token function">build</span><span class="token punctuation">(</span><span class="token class-name">BuildContext</span> context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token class-name">MaterialApp</span><span class="token punctuation">(</span>
      title<span class="token punctuation">:</span> <span class="token string-literal"><span class="token string">&#39;\u5FEB\u901F\u4E0A\u624B Flutter&#39;</span></span><span class="token punctuation">,</span>
      theme<span class="token punctuation">:</span> <span class="token class-name">ThemeData</span><span class="token punctuation">(</span>
        colorScheme<span class="token punctuation">:</span> <span class="token class-name">ColorScheme</span><span class="token punctuation">.</span><span class="token function">fromSeed</span><span class="token punctuation">(</span>seedColor<span class="token punctuation">:</span> <span class="token class-name">Colors</span><span class="token punctuation">.</span>deepPurple<span class="token punctuation">)</span><span class="token punctuation">,</span>
        useMaterial3<span class="token punctuation">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">,</span>
      home<span class="token punctuation">:</span> <span class="token keyword">const</span> <span class="token class-name">MyHomePage</span><span class="token punctuation">(</span>title<span class="token punctuation">:</span> <span class="token string-literal"><span class="token string">&#39;Flutter\u5FEB\u901F\u4E0A\u624B&#39;</span></span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">class</span> <span class="token class-name">MyHomePage</span> <span class="token keyword">extends</span> <span class="token class-name">StatefulWidget</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token class-name">MyHomePage</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token keyword">super</span><span class="token punctuation">.</span>key<span class="token punctuation">,</span> required <span class="token keyword">this</span><span class="token punctuation">.</span>title<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">final</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>

  <span class="token metadata function">@override</span>
  <span class="token class-name">State</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">MyHomePage</span><span class="token punctuation">&gt;</span></span> <span class="token function">createState</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token function">_MyHomePageState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">class</span> _MyHomePageState <span class="token keyword">extends</span> <span class="token class-name">State</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">MyHomePage</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
  <span class="token comment">// \u53D8\u91CF\u6765\u5B9E\u73B0\u9875\u9762\u5185\u5BB9\u5207\u6362</span>
  bool _toggle <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>

  <span class="token keyword">get</span> _dyWidget <span class="token operator">=</span><span class="token operator">&gt;</span> _toggle <span class="token operator">?</span> <span class="token keyword">const</span> <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&#39;Widget1&#39;</span></span><span class="token punctuation">)</span> <span class="token punctuation">:</span> <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&#39;widget2&#39;</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token metadata function">@override</span>
  <span class="token class-name">Widget</span> <span class="token function">build</span><span class="token punctuation">(</span><span class="token class-name">BuildContext</span> context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token class-name">Scaffold</span><span class="token punctuation">(</span>
      appBar<span class="token punctuation">:</span> <span class="token class-name">AppBar</span><span class="token punctuation">(</span>
        backgroundColor<span class="token punctuation">:</span> <span class="token class-name">Theme</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span>context<span class="token punctuation">)</span><span class="token punctuation">.</span>colorScheme<span class="token punctuation">.</span>inversePrimary<span class="token punctuation">,</span>
        title<span class="token punctuation">:</span> <span class="token class-name">Text</span><span class="token punctuation">(</span>widget<span class="token punctuation">.</span>title<span class="token punctuation">)</span><span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">,</span>
      body<span class="token punctuation">:</span> <span class="token class-name">Center</span><span class="token punctuation">(</span>
          child<span class="token punctuation">:</span> _dyWidget<span class="token punctuation">)</span><span class="token punctuation">,</span>
      floatingActionButton<span class="token punctuation">:</span> <span class="token class-name">FloatingActionButton</span><span class="token punctuation">(</span>
        onPressed<span class="token punctuation">:</span> _updateWidget<span class="token punctuation">,</span>
        tooltip<span class="token punctuation">:</span> <span class="token string-literal"><span class="token string">&#39;Update&#39;</span></span><span class="token punctuation">,</span>
        child<span class="token punctuation">:</span> <span class="token keyword">const</span> <span class="token class-name">Icon</span><span class="token punctuation">(</span><span class="token class-name">Icons</span><span class="token punctuation">.</span>add<span class="token punctuation">)</span><span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">void</span> <span class="token function">_updateWidget</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">setState</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      _toggle <span class="token operator">=</span> <span class="token operator">!</span>_toggle<span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230606224929507.png" alt="image-20230606224929507" loading="lazy"></p><h2 id="\u521B\u5EFA\u81EA\u5B9A\u4E49\u7684\u63A7\u4EF6-widget" tabindex="-1"><a class="header-anchor" href="#\u521B\u5EFA\u81EA\u5B9A\u4E49\u7684\u63A7\u4EF6-widget" aria-hidden="true">#</a> \u521B\u5EFA\u81EA\u5B9A\u4E49\u7684\u63A7\u4EF6(widget)</h2><p>\u5728<code>vscode</code>\u6216\u8005<code>android studio</code>\u4E2D\u8F93\u5165<code>stl</code>\u5173\u952E\u5B57\u5C31\u4F1A\u7ED9\u4F60\u81EA\u52A8\u751F\u6210\u4E00\u4E2A\u5FEB\u6377\u6A21\u677F</p><div class="language-dart ext-dart line-numbers-mode"><pre class="language-dart"><code><span class="token comment">// \u521B\u5EFA\u81EA\u5B9A\u4E49 widget</span>
<span class="token keyword">class</span> <span class="token class-name">TipsWidget</span> <span class="token keyword">extends</span> <span class="token class-name">StatelessWidget</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token class-name">TipsWidget</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token keyword">super</span><span class="token punctuation">.</span>key<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token metadata function">@override</span>
  <span class="token class-name">Widget</span> <span class="token function">build</span><span class="token punctuation">(</span><span class="token class-name">BuildContext</span> context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token keyword">const</span> <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&#39;this is a tips&#39;</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u5C31\u53EF\u4EE5\u5728\u4E0A\u9762\u4E3B\u63A7\u4EF6\u91CC\u8FDB\u884C\u52A0\u8F7D\u5373\u53EF</p><h2 id="\u6DFB\u52A0\u4E00\u4E2A\u52A8\u6001\u5217\u8868" tabindex="-1"><a class="header-anchor" href="#\u6DFB\u52A0\u4E00\u4E2A\u52A8\u6001\u5217\u8868" aria-hidden="true">#</a> \u6DFB\u52A0\u4E00\u4E2A\u52A8\u6001\u5217\u8868</h2><div class="language-dart ext-dart line-numbers-mode"><pre class="language-dart"><code><span class="token keyword">class</span> _MyHomePageState <span class="token keyword">extends</span> <span class="token class-name">State</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">MyHomePage</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
  <span class="token class-name">String</span> tips <span class="token operator">=</span> <span class="token string-literal"><span class="token string">&quot;&quot;</span></span><span class="token punctuation">;</span>
  bool _toggle <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>

  <span class="token keyword">get</span> _dyWidget <span class="token operator">=</span><span class="token operator">&gt;</span> _toggle <span class="token operator">?</span> <span class="token keyword">const</span> <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&#39;Widget1&#39;</span></span><span class="token punctuation">)</span> <span class="token punctuation">:</span> <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&#39;widget2&#39;</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">get</span> _listView <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token class-name">ListView</span><span class="token punctuation">(</span>
        children<span class="token punctuation">:</span> <span class="token punctuation">[</span>
          <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&#39;\u5FEB\u901F\u4E0A\u624B1 flutter1&#39;</span></span><span class="token punctuation">)</span><span class="token punctuation">,</span>
          <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&#39;\u5FEB\u901F\u4E0A\u624B1 flutter2&#39;</span></span><span class="token punctuation">)</span><span class="token punctuation">,</span>
          <span class="token class-name">Text</span><span class="token punctuation">(</span>
            <span class="token string-literal"><span class="token string">&#39;\u5FEB\u901F\u4E0A\u624B1&#39;</span></span><span class="token punctuation">,</span>
            style<span class="token punctuation">:</span> <span class="token class-name">TextStyle</span><span class="token punctuation">(</span>fontSize<span class="token punctuation">:</span> <span class="token number">260</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
          <span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token punctuation">]</span><span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u624B\u52BF\u4E8B\u4EF6" tabindex="-1"><a class="header-anchor" href="#\u624B\u52BF\u4E8B\u4EF6" aria-hidden="true">#</a> \u624B\u52BF\u4E8B\u4EF6</h2><h3 id="\u76D1\u542Cwidget\u7684\u624B\u52BF\u65B9\u6CD5" tabindex="-1"><a class="header-anchor" href="#\u76D1\u542Cwidget\u7684\u624B\u52BF\u65B9\u6CD5" aria-hidden="true">#</a> \u76D1\u542C<code>widget</code>\u7684\u624B\u52BF\u65B9\u6CD5</h3><div class="language-dart ext-dart line-numbers-mode"><pre class="language-dart"><code><span class="token keyword">import</span> <span class="token string-literal"><span class="token string">&#39;package:flutter/material.dart&#39;</span></span><span class="token punctuation">;</span>

<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token function">runApp</span><span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token class-name">MyApp</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">class</span> <span class="token class-name">MyApp</span> <span class="token keyword">extends</span> <span class="token class-name">StatelessWidget</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token class-name">MyApp</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token keyword">super</span><span class="token punctuation">.</span>key<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// This widget is the root of your application.</span>
  <span class="token metadata function">@override</span>
  <span class="token class-name">Widget</span> <span class="token function">build</span><span class="token punctuation">(</span><span class="token class-name">BuildContext</span> context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token class-name">MaterialApp</span><span class="token punctuation">(</span>
      title<span class="token punctuation">:</span> <span class="token string-literal"><span class="token string">&#39;\u5FEB\u901F\u4E0A\u624B Flutter&#39;</span></span><span class="token punctuation">,</span>
      theme<span class="token punctuation">:</span> <span class="token class-name">ThemeData</span><span class="token punctuation">(</span>
        colorScheme<span class="token punctuation">:</span> <span class="token class-name">ColorScheme</span><span class="token punctuation">.</span><span class="token function">fromSeed</span><span class="token punctuation">(</span>seedColor<span class="token punctuation">:</span> <span class="token class-name">Colors</span><span class="token punctuation">.</span>deepPurple<span class="token punctuation">)</span><span class="token punctuation">,</span>
        useMaterial3<span class="token punctuation">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">,</span>
      home<span class="token punctuation">:</span> <span class="token keyword">const</span> <span class="token class-name">MyHomePage</span><span class="token punctuation">(</span>title<span class="token punctuation">:</span> <span class="token string-literal"><span class="token string">&#39;Flutter\u5FEB\u901F\u4E0A\u624B&#39;</span></span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">class</span> <span class="token class-name">MyHomePage</span> <span class="token keyword">extends</span> <span class="token class-name">StatefulWidget</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token class-name">MyHomePage</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token keyword">super</span><span class="token punctuation">.</span>key<span class="token punctuation">,</span> required <span class="token keyword">this</span><span class="token punctuation">.</span>title<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// This widget is the home page of your application. It is stateful, meaning</span>
  <span class="token comment">// that it has a State object (defined below) that contains fields that affect</span>
  <span class="token comment">// how it looks.</span>

  <span class="token comment">// This class is the configuration for the state. It holds the values (in this</span>
  <span class="token comment">// case the title) provided by the parent (in this case the App widget) and</span>
  <span class="token comment">// used by the build method of the State. Fields in a Widget subclass are</span>
  <span class="token comment">// always marked &quot;final&quot;.</span>

  <span class="token keyword">final</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>

  <span class="token metadata function">@override</span>
  <span class="token class-name">State</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">MyHomePage</span><span class="token punctuation">&gt;</span></span> <span class="token function">createState</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token function">_MyHomePageState</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">class</span> _MyHomePageState <span class="token keyword">extends</span> <span class="token class-name">State</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">MyHomePage</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
  int _count <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>

  <span class="token metadata function">@override</span>
  <span class="token class-name">Widget</span> <span class="token function">build</span><span class="token punctuation">(</span><span class="token class-name">BuildContext</span> context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// This method is rerun every time setState is called, for instance as done</span>
    <span class="token comment">// by the _incrementCounter method above.</span>
    <span class="token comment">//</span>
    <span class="token comment">// The Flutter framework has been optimized to make rerunning build methods</span>
    <span class="token comment">// fast, so that you can just rebuild anything that needs updating rather</span>
    <span class="token comment">// than having to individually change instances of widgets.</span>
    <span class="token keyword">return</span> <span class="token class-name">Scaffold</span><span class="token punctuation">(</span>
      appBar<span class="token punctuation">:</span> <span class="token class-name">AppBar</span><span class="token punctuation">(</span>
        <span class="token comment">// TRY THIS: Try changing the color here to a specific color (to</span>
        <span class="token comment">// Colors.amber, perhaps?) and trigger a hot reload to see the AppBar</span>
        <span class="token comment">// change color while the other colors stay the same.</span>
        backgroundColor<span class="token punctuation">:</span> <span class="token class-name">Theme</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span>context<span class="token punctuation">)</span><span class="token punctuation">.</span>colorScheme<span class="token punctuation">.</span>inversePrimary<span class="token punctuation">,</span>
        <span class="token comment">// Here we take the value from the MyHomePage object that was created by</span>
        <span class="token comment">// the App.build method, and use it to set our appbar title.</span>
        title<span class="token punctuation">:</span> <span class="token class-name">Text</span><span class="token punctuation">(</span>widget<span class="token punctuation">.</span>title<span class="token punctuation">)</span><span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">,</span>
      body<span class="token punctuation">:</span> <span class="token class-name">Center</span><span class="token punctuation">(</span>
          <span class="token comment">// Center is a layout widget. It takes a single child and positions it</span>
          <span class="token comment">// in the middle of the parent.</span>
          child<span class="token punctuation">:</span> <span class="token class-name">ElevatedButton</span><span class="token punctuation">(</span>
        child<span class="token punctuation">:</span> <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&#39;press me one more </span><span class="token interpolation"><span class="token punctuation">$</span><span class="token expression">_count</span></span><span class="token string">&#39;</span></span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        onPressed<span class="token punctuation">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
          <span class="token function">setState</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            _count<span class="token operator">++</span><span class="token punctuation">;</span>
          <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
      floatingActionButton<span class="token punctuation">:</span> <span class="token class-name">FloatingActionButton</span><span class="token punctuation">(</span>
        onPressed<span class="token punctuation">:</span> _updateWidget<span class="token punctuation">,</span>
        tooltip<span class="token punctuation">:</span> <span class="token string-literal"><span class="token string">&#39;Update&#39;</span></span><span class="token punctuation">,</span>
        child<span class="token punctuation">:</span> <span class="token keyword">const</span> <span class="token class-name">Icon</span><span class="token punctuation">(</span><span class="token class-name">Icons</span><span class="token punctuation">.</span>add<span class="token punctuation">)</span><span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// This trailing comma makes auto-formatting nicer for build methods.</span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230606230201422.png" alt="image-20230606230201422" loading="lazy"></p><h3 id="gesturedetector-\u7684\u4F7F\u7528" tabindex="-1"><a class="header-anchor" href="#gesturedetector-\u7684\u4F7F\u7528" aria-hidden="true">#</a> GestureDetector \u7684\u4F7F\u7528</h3><div class="language-dart ext-dart line-numbers-mode"><pre class="language-dart"><code>body<span class="token punctuation">:</span> <span class="token class-name">Center</span><span class="token punctuation">(</span>
  <span class="token comment">// Center is a layout widget. It takes a single child and positions it</span>
  <span class="token comment">// in the middle of the parent.</span>
  child<span class="token punctuation">:</span> <span class="token class-name">GestureDetector</span><span class="token punctuation">(</span>
child<span class="token punctuation">:</span> <span class="token class-name">Text</span><span class="token punctuation">(</span><span class="token string-literal"><span class="token string">&#39;press me one more </span><span class="token interpolation"><span class="token punctuation">$</span><span class="token expression">_count</span></span><span class="token string">&#39;</span></span><span class="token punctuation">)</span><span class="token punctuation">,</span>
onTap<span class="token punctuation">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token function">setState</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    _count<span class="token operator">++</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u70B9\u51FB\u4E8B\u4EF6\uFF0C\u70B9\u51FB<code>GestureDetector</code>\u67E5\u770B\u6E90\u7801\u8FD8\u6709\u5F88\u591A\u7684\u4E8B\u4EF6\u3002</p>`,17),c=[p];function o(l,i){return s(),a("div",null,c)}var k=n(e,[["render",o],["__file","android-flutter.html.vue"]]);export{k as default};