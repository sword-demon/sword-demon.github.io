import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.23541a26.js";const p={},o=t(`<h1 id="go-\u63A7\u5236-grpc-\u7684-metadata" tabindex="-1"><a class="header-anchor" href="#go-\u63A7\u5236-grpc-\u7684-metadata" aria-hidden="true">#</a> go \u63A7\u5236 gRPC \u7684 metadata</h1><blockquote><p>gRPC \u8BA9\u6211\u4EEC\u53EF\u4EE5\u50CF\u672C\u5730\u8C03\u7528\u4E00\u6837\u5B9E\u73B0\u8FDC\u7A0B\u8C03\u7528\uFF0C\u5BF9\u4E8E\u6BCF\u4E00\u6B21\u7684 RPC \u8C03\u7528\u4E2D\uFF0C\u90FD\u53EF\u80FD\u4F1A\u6709\u4E00\u4E9B\u6709\u7528\u7684\u6570\u636E\uFF0C\u800C\u8FD9\u4E9B\u6570\u636E\u5C31\u53EF\u4EE5\u901A\u8FC7<code>metadata</code>\u6765\u4F20\u9012\u3002<code>metadata</code>\u662F\u4EE5<code>key-value</code>\u7684\u5F62\u5F0F\u5B58\u50A8\u6570\u636E\u7684\uFF0C\u5176\u4E2D<code>key</code>\u662F<code>string</code>\u7C7B\u578B\uFF0C\u800C<code>value</code>\u662F<code>[]string</code>\u3002<code>metadata</code>\u4F7F\u5F97<code>client</code>\u548C<code>server</code>\u80FD\u591F\u4E3A\u5BF9\u65B9\u63D0\u4F9B\u5173\u4E8E\u672C\u6B21\u8C03\u7528\u7684\u4E00\u4E9B\u4FE1\u606F\uFF0C\u5C31\u50CF\u4E00\u6B21<code>http</code>\u8BF7\u6C42\u7684<code>RequestHeader</code>\u548C<code>ResponseHeader</code>\u4E00\u6837\u3002<code>http</code>\u4E2D<code>header</code>\u7684\u751F\u547D\u5468\u671F\u662F\u4E00\u6B21<code>http</code>\u8BF7\u6C42\uFF0C\u90A3\u4E48<code>metadata</code>\u7684\u751F\u547D\u5468\u671F\u5C31\u662F\u4E00\u6B21<code>RPC</code>\u8C03\u7528\u3002</p></blockquote><h2 id="go-\u4E2D\u4F7F\u7528-metadata" tabindex="-1"><a class="header-anchor" href="#go-\u4E2D\u4F7F\u7528-metadata" aria-hidden="true">#</a> go \u4E2D\u4F7F\u7528 metadata</h2><ol><li><p>\u65B0\u5EFA<code>metadata</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">type</span> MD <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token builtin">string</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7C7B\u578B\u662F<code>map</code>,<code>key</code>\u662F<code>string</code>\uFF0C<code>value</code>\u662F<code>string</code>\u7C7B\u578B\u7684\u5207\u7247</p><p>\u521B\u5EFA\u7684\u65F6\u5019\u53EF\u4EE5\u50CF\u521B\u5EFA\u666E\u901A\u7684<code>map</code>\u7C7B\u578B\u4E00\u6837\u4F7F\u7528<code>new</code>\u5173\u952E\u5B57\u8FDB\u884C\u521B\u5EFA</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">// \u7B2C\u4E00\u79CD\u65B9\u5F0F</span>
md <span class="token operator">:=</span> metadata<span class="token punctuation">.</span><span class="token function">New</span><span class="token punctuation">(</span><span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">{</span><span class="token string">&quot;key1&quot;</span><span class="token punctuation">:</span> <span class="token string">&quot;val1&quot;</span><span class="token punctuation">}</span><span class="token punctuation">)</span>

<span class="token comment">// \u7B2C\u4E8C\u79CD\u65B9\u5F0F</span>
md <span class="token operator">:=</span> metadata<span class="token punctuation">.</span>Pairs <span class="token punctuation">(</span>
    <span class="token string">&quot;key1&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;val1&quot;</span><span class="token punctuation">,</span>
    <span class="token string">&quot;key2&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;val2&quot;</span>
<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>\u53D1\u9001<code>metadata</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code>md <span class="token operator">:=</span> metadata<span class="token punctuation">.</span><span class="token function">Pairs</span><span class="token punctuation">(</span><span class="token string">&quot;key&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;val&quot;</span><span class="token punctuation">)</span>

<span class="token comment">// \u65B0\u5EFA\u4E00\u4E2A\u6709 metadata \u7684 context</span>
ctx <span class="token operator">:=</span> metadata<span class="token punctuation">.</span><span class="token function">NewOutgoingContext</span><span class="token punctuation">(</span>context<span class="token punctuation">.</span><span class="token function">Background</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>

<span class="token comment">// \u5355\u5411 RPC</span>
response<span class="token punctuation">,</span> err <span class="token operator">:=</span> client<span class="token punctuation">.</span><span class="token function">SomeRPC</span><span class="token punctuation">(</span>ctx<span class="token punctuation">,</span> someRequest<span class="token punctuation">)</span>x
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>\u63A5\u6536<code>metadata</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>s <span class="token operator">*</span>server<span class="token punctuation">)</span> <span class="token function">SomeRPC</span><span class="token punctuation">(</span>ctx context<span class="token punctuation">.</span>Context<span class="token punctuation">,</span> in <span class="token operator">*</span>pb<span class="token punctuation">.</span>SomeRequest<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">*</span>pb<span class="token punctuation">.</span>SomeResponse<span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    md<span class="token punctuation">,</span> ok <span class="token operator">:=</span> metadata<span class="token punctuation">.</span><span class="token function">FromIncomingContext</span><span class="token punctuation">(</span>ctx<span class="token punctuation">)</span>
    <span class="token comment">// do something with metadata</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li></ol><h3 id="grpc-\u4E2D\u4F7F\u7528metadata" tabindex="-1"><a class="header-anchor" href="#grpc-\u4E2D\u4F7F\u7528metadata" aria-hidden="true">#</a> gRPC \u4E2D\u4F7F\u7528<code>metadata</code></h3><p>\u5BA2\u6237\u7AEF</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;context&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;google.golang.org/grpc&quot;</span>
	<span class="token string">&quot;google.golang.org/grpc/metadata&quot;</span>
	timestamppb <span class="token string">&quot;google.golang.org/protobuf/types/known/timestamppb&quot;</span>
	<span class="token string">&quot;grpcandprotobuf/pb&quot;</span>
	<span class="token string">&quot;log&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> grpc<span class="token punctuation">.</span><span class="token function">Dial</span><span class="token punctuation">(</span><span class="token string">&quot;127.0.0.1:8080&quot;</span><span class="token punctuation">,</span> grpc<span class="token punctuation">.</span><span class="token function">WithInsecure</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">defer</span> <span class="token keyword">func</span><span class="token punctuation">(</span>conn <span class="token operator">*</span>grpc<span class="token punctuation">.</span>ClientConn<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		err <span class="token operator">:=</span> conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span>

	c <span class="token operator">:=</span> pb<span class="token punctuation">.</span><span class="token function">NewGreeterClient</span><span class="token punctuation">(</span>conn<span class="token punctuation">)</span>

	md <span class="token operator">:=</span> metadata<span class="token punctuation">.</span><span class="token function">New</span><span class="token punctuation">(</span><span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">{</span>
		<span class="token string">&quot;name&quot;</span><span class="token punctuation">:</span> <span class="token string">&quot;wujie&quot;</span><span class="token punctuation">,</span>
		<span class="token string">&quot;password&quot;</span><span class="token punctuation">:</span> <span class="token string">&quot;123456&quot;</span><span class="token punctuation">,</span>
	<span class="token punctuation">}</span><span class="token punctuation">)</span>

	ctx <span class="token operator">:=</span> metadata<span class="token punctuation">.</span><span class="token function">NewOutgoingContext</span><span class="token punctuation">(</span>context<span class="token punctuation">.</span><span class="token function">Background</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> md<span class="token punctuation">)</span>

	r<span class="token punctuation">,</span> err <span class="token operator">:=</span> c<span class="token punctuation">.</span><span class="token function">SayHello</span><span class="token punctuation">(</span>ctx<span class="token punctuation">,</span> <span class="token operator">&amp;</span>pb<span class="token punctuation">.</span>HelloRequest<span class="token punctuation">{</span>
		Name<span class="token punctuation">:</span> <span class="token string">&quot;wujie&quot;</span><span class="token punctuation">,</span>
		Url<span class="token punctuation">:</span>  <span class="token string">&quot;https&quot;</span><span class="token punctuation">,</span>
		G<span class="token punctuation">:</span>    pb<span class="token punctuation">.</span>Gender_MALE<span class="token punctuation">,</span>
		Mp<span class="token punctuation">:</span> <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">{</span>
			<span class="token string">&quot;name&quot;</span><span class="token punctuation">:</span>    <span class="token string">&quot;wujie&quot;</span><span class="token punctuation">,</span>
			<span class="token string">&quot;company&quot;</span><span class="token punctuation">:</span> <span class="token string">&quot;\u65E0\u89E3\u7684\u6E38\u620F&quot;</span><span class="token punctuation">,</span>
		<span class="token punctuation">}</span><span class="token punctuation">,</span>
		AddTime<span class="token punctuation">:</span> timestamppb<span class="token punctuation">.</span><span class="token function">New</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
	<span class="token punctuation">}</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>r<span class="token punctuation">.</span>Message<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u670D\u52A1\u7AEF\u7684\u4EE3\u7801</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>s <span class="token operator">*</span>Server<span class="token punctuation">)</span> <span class="token function">SayHello</span><span class="token punctuation">(</span>ctx context<span class="token punctuation">.</span>Context<span class="token punctuation">,</span> request <span class="token operator">*</span>proto<span class="token punctuation">.</span>HelloRequest<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">*</span>proto<span class="token punctuation">.</span>HelloReply<span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	md<span class="token punctuation">,</span> ok <span class="token operator">:=</span> metadata<span class="token punctuation">.</span><span class="token function">FromIncomingContext</span><span class="token punctuation">(</span>ctx<span class="token punctuation">)</span>
	<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;get metadata error&quot;</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">for</span> key<span class="token punctuation">,</span> val <span class="token operator">:=</span> <span class="token keyword">range</span> md <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> val<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> <span class="token operator">&amp;</span>proto<span class="token punctuation">.</span>HelloReply<span class="token punctuation">{</span>Message<span class="token punctuation">:</span> <span class="token string">&quot;hello &quot;</span> <span class="token operator">+</span> request<span class="token punctuation">.</span>Name<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,9),e=[o];function c(i,u){return s(),a("div",null,e)}var r=n(p,[["render",c],["__file","grpc-metadata.html.vue"]]);export{r as default};