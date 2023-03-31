import{_ as t}from"./plugin-vue_export-helper.21dcd24c.js";import{r as p,o as e,c as o,a as n,b as c,e as s,d as i}from"./app.762d7d6b.js";const l={},u=s(`<h1 id="\u7B80\u5355\u751F\u4EA7\u6D88\u606F\u548C\u6D88\u8D39\u6D88\u606F" tabindex="-1"><a class="header-anchor" href="#\u7B80\u5355\u751F\u4EA7\u6D88\u606F\u548C\u6D88\u8D39\u6D88\u606F" aria-hidden="true">#</a> \u7B80\u5355\u751F\u4EA7\u6D88\u606F\u548C\u6D88\u8D39\u6D88\u606F</h1><h2 id="\u751F\u4EA7\u8005\u53D1\u9001\u6D88\u606F" tabindex="-1"><a class="header-anchor" href="#\u751F\u4EA7\u8005\u53D1\u9001\u6D88\u606F" aria-hidden="true">#</a> \u751F\u4EA7\u8005\u53D1\u9001\u6D88\u606F</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;github.com/streadway/amqp&quot;</span>
	<span class="token string">&quot;log&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	dsn <span class="token operator">:=</span> fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">&quot;amqp://%s:%s@%s:%d&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;wxviurs&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;123&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;127.0.0.1&quot;</span><span class="token punctuation">,</span> <span class="token number">5672</span><span class="token punctuation">)</span>
	conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> amqp<span class="token punctuation">.</span><span class="token function">Dial</span><span class="token punctuation">(</span>dsn<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">defer</span> conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token comment">// \u521B\u5EFA channel</span>
	c<span class="token punctuation">,</span> err <span class="token operator">:=</span> conn<span class="token punctuation">.</span><span class="token function">Channel</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">defer</span> c<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token comment">// \u521B\u5EFA\u961F\u5217</span>
	queue<span class="token punctuation">,</span> err <span class="token operator">:=</span> c<span class="token punctuation">.</span><span class="token function">QueueDeclare</span><span class="token punctuation">(</span><span class="token string">&quot;test&quot;</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// \u4F7F\u7528channel\u53D1\u5E03\u6D88\u606F</span>
	err <span class="token operator">=</span> c<span class="token punctuation">.</span><span class="token function">Publish</span><span class="token punctuation">(</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span> queue<span class="token punctuation">.</span>Name<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
		amqp<span class="token punctuation">.</span>Publishing<span class="token punctuation">{</span>
			ContentType<span class="token punctuation">:</span> <span class="token string">&quot;text/plain&quot;</span><span class="token punctuation">,</span>       <span class="token comment">// \u6D88\u606F\u7C7B\u578B</span>
			Body<span class="token punctuation">:</span>        <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token function">byte</span><span class="token punctuation">(</span><span class="token string">&quot;test0001&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// \u6D88\u606F\u5185\u5BB9</span>
		<span class="token punctuation">}</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	log<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u53D1\u751F\u6D88\u606F\u6210\u529F&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230107001807167.png" alt="image-20230107001807167" loading="lazy"></p><p>\u6211\u8FD9\u91CC\u53D1\u9001\u4E86 2 \u6B21\uFF0C\u8FD9\u91CC\u7684<code>idle</code>\u8868\u793A\u7A7A\u95F2\u72B6\u6001\uFF0C<code>Total</code>\u6709 2 \u4E2A\u6D88\u606F\uFF0C\u961F\u5217\u540D\u4E3A<code>test</code></p><h2 id="\u6D88\u8D39\u8005\u8BFB\u53D6\u6D88\u606F" tabindex="-1"><a class="header-anchor" href="#\u6D88\u8D39\u8005\u8BFB\u53D6\u6D88\u606F" aria-hidden="true">#</a> \u6D88\u8D39\u8005\u8BFB\u53D6\u6D88\u606F</h2><p>\u5C06\u8FDE\u63A5 MQ \u7684\u4EE3\u7801\u8FDB\u884C\u5C01\u88C5\u4E00\u4E0B</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> AppInit

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;github.com/streadway/amqp&quot;</span>
	<span class="token string">&quot;log&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> MQCone <span class="token operator">*</span>amqp<span class="token punctuation">.</span>Connection

<span class="token keyword">func</span> <span class="token function">init</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	dsn <span class="token operator">:=</span> fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">&quot;amqp://%s:%s@%s:%d&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;wxviurs&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;123&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;127.0.0.1&quot;</span><span class="token punctuation">,</span> <span class="token number">5672</span><span class="token punctuation">)</span>
	conn<span class="token punctuation">,</span> err <span class="token operator">:=</span> amqp<span class="token punctuation">.</span><span class="token function">Dial</span><span class="token punctuation">(</span>dsn<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	MQCone <span class="token operator">=</span> conn
	log<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>MQCone<span class="token punctuation">.</span>Major<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">GetConn</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span>amqp<span class="token punctuation">.</span>Connection <span class="token punctuation">{</span>
	<span class="token keyword">return</span> MQCone
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;log&quot;</span>
	<span class="token string">&quot;rmq/AppInit&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	conn <span class="token operator">:=</span> AppInit<span class="token punctuation">.</span><span class="token function">GetConn</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">defer</span> conn<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	c<span class="token punctuation">,</span> err <span class="token operator">:=</span> conn<span class="token punctuation">.</span><span class="token function">Channel</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">defer</span> c<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token comment">// \u6D88\u8D39\u8005</span>
	messages<span class="token punctuation">,</span> err <span class="token operator">:=</span> c<span class="token punctuation">.</span><span class="token function">Consume</span><span class="token punctuation">(</span><span class="token string">&quot;test&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;c1&quot;</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">for</span> msg <span class="token operator">:=</span> <span class="token keyword">range</span> messages <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>msg<span class="token punctuation">.</span>DeliveryTag<span class="token punctuation">,</span> <span class="token comment">// \u552F\u4E00\u6807\u8BC6</span>
			<span class="token function">string</span><span class="token punctuation">(</span>msg<span class="token punctuation">.</span>Body<span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token comment">// \u5185\u5BB9</span>
		<span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C  rmq go run client.go
<span class="token number">2023</span>/01/07 <span class="token number">14</span>:41:13 <span class="token number">0</span>
<span class="token number">1</span> test0001
<span class="token number">2</span> test0002

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230107144254233.png" alt="image-20230107144254233" loading="lazy"></p><p>\u6B64\u65F6 MQ \u4E2D\u662F<code>Unacked</code>\uFF0C\u8FD9\u4E2A\u662F\u786E\u8BA4\u673A\u5236\uFF0C\u6211\u4EEC\u83B7\u53D6\u6D88\u606F\u540E\uFF0C\u6211\u4EEC\u9700\u8981\u544A\u8BC9 MQ \u6D88\u606F\u6536\u5230\u4E86\uFF0C\u5426\u5219\u4E0B\u6B21\u8FD0\u884C\uFF0C<code>Ready</code>\u53C8\u4F1A\u53D8\u6210 2 \u4E2A\uFF0C\u8FD8\u80FD\u7EE7\u7EED\u6536\u5230\u8FD9\u4E2A\u6D88\u606F\u3002</p>`,12),k={href:"https://www.rabbitmq.com/tutorials/tutorial-two-go.html",target:"_blank",rel:"noopener noreferrer"},r=i("https://www.rabbitmq.com/tutorials/tutorial-two-go.html"),d=s(`<div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">for</span> msg <span class="token operator">:=</span> <span class="token keyword">range</span> messages <span class="token punctuation">{</span>
    msg<span class="token punctuation">.</span><span class="token function">Ack</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span>
    fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>msg<span class="token punctuation">.</span>DeliveryTag<span class="token punctuation">,</span> <span class="token comment">// \u552F\u4E00\u6807\u8BC6</span>
                <span class="token function">string</span><span class="token punctuation">(</span>msg<span class="token punctuation">.</span>Body<span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token comment">// \u5185\u5BB9</span>
               <span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u7B80\u5355\u5C01\u88C5-mq-\u53D1\u9001\u6D88\u606F" tabindex="-1"><a class="header-anchor" href="#\u7B80\u5355\u5C01\u88C5-mq-\u53D1\u9001\u6D88\u606F" aria-hidden="true">#</a> \u7B80\u5355\u5C01\u88C5 MQ \u53D1\u9001\u6D88\u606F</h2><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> Lib

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;github.com/streadway/amqp&quot;</span>
	<span class="token string">&quot;log&quot;</span>
	<span class="token string">&quot;rmq/AppInit&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">const</span> <span class="token punctuation">(</span>
	QueueNewUser <span class="token operator">=</span> <span class="token string">&quot;newuser&quot;</span> <span class="token comment">//\u7528\u6237\u6CE8\u518C \u5BF9\u5E94\u7684\u961F\u5217\u540D\u79F0</span>
<span class="token punctuation">)</span>

<span class="token keyword">type</span> MQ <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	Channel <span class="token operator">*</span>amqp<span class="token punctuation">.</span>Channel
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">NewMQ</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">*</span>MQ <span class="token punctuation">{</span>
	<span class="token comment">// \u521B\u5EFAchannel</span>
	c<span class="token punctuation">,</span> err <span class="token operator">:=</span> AppInit<span class="token punctuation">.</span><span class="token function">GetConn</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Channel</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
		<span class="token keyword">return</span> <span class="token boolean">nil</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> <span class="token operator">&amp;</span>MQ<span class="token punctuation">{</span>Channel<span class="token punctuation">:</span> c<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>mq <span class="token operator">*</span>MQ<span class="token punctuation">)</span> <span class="token function">SendMessage</span><span class="token punctuation">(</span>queueName <span class="token builtin">string</span><span class="token punctuation">,</span> message <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token builtin">error</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u58F0\u660E\u961F\u5217</span>
	<span class="token boolean">_</span><span class="token punctuation">,</span> err <span class="token operator">:=</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">QueueDeclare</span><span class="token punctuation">(</span>queueName<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> err
	<span class="token punctuation">}</span>
	<span class="token comment">// exchange \u4E3A\u7A7A \u4F1A\u4F7F\u7528\u9ED8\u8BA4\u7684\u4EA4\u6362\u673A</span>
	<span class="token keyword">return</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">Publish</span><span class="token punctuation">(</span><span class="token string">&quot;&quot;</span><span class="token punctuation">,</span> queueName<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
		amqp<span class="token punctuation">.</span>Publishing<span class="token punctuation">{</span>
			ContentType<span class="token punctuation">:</span> <span class="token string">&quot;text/plain&quot;</span><span class="token punctuation">,</span>
			Body<span class="token punctuation">:</span>        <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token function">byte</span><span class="token punctuation">(</span>message<span class="token punctuation">)</span><span class="token punctuation">,</span>
		<span class="token punctuation">}</span><span class="token punctuation">,</span>
	<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4F7F\u7528<code>gin</code>\u6765\u6A21\u62DF\u4E00\u4E2A<code>api</code>\u6765\u7528\u4F5C\u7528\u6237\u6CE8\u518C\u64CD\u4F5C</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;github.com/gin-gonic/gin&quot;</span>
	<span class="token string">&quot;log&quot;</span>
	<span class="token string">&quot;rmq/Lib&quot;</span>
	<span class="token string">&quot;rmq/UserReg/Models&quot;</span>
	<span class="token string">&quot;strconv&quot;</span>
	<span class="token string">&quot;time&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	router <span class="token operator">:=</span> gin<span class="token punctuation">.</span><span class="token function">Default</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	router<span class="token punctuation">.</span><span class="token function">Handle</span><span class="token punctuation">(</span><span class="token string">&quot;POST&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;/user&quot;</span><span class="token punctuation">,</span> <span class="token keyword">func</span><span class="token punctuation">(</span>context <span class="token operator">*</span>gin<span class="token punctuation">.</span>Context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		userModel <span class="token operator">:=</span> Models<span class="token punctuation">.</span><span class="token function">NewUserModel</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		err <span class="token operator">:=</span> context<span class="token punctuation">.</span><span class="token function">BindJSON</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>userModel<span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			context<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span><span class="token number">400</span><span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span><span class="token string">&quot;result&quot;</span><span class="token punctuation">:</span> <span class="token string">&quot;param error&quot;</span><span class="token punctuation">}</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
			userModel<span class="token punctuation">.</span>UserId <span class="token operator">=</span> <span class="token function">int</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span><span class="token function">Now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">Unix</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token comment">//\u5047\u8BBE\u5C31\u662F\u5165\u5E93\u8FC7\u7A0B</span>
			<span class="token keyword">if</span> userModel<span class="token punctuation">.</span>UserId <span class="token operator">&gt;</span> <span class="token number">0</span> <span class="token punctuation">{</span>                 <span class="token comment">//\u5047\u8BBE\u5165\u5E93\u6210\u529F</span>
				mq <span class="token operator">:=</span> Lib<span class="token punctuation">.</span><span class="token function">NewMQ</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
				err <span class="token operator">:=</span> mq<span class="token punctuation">.</span><span class="token function">SendMessage</span><span class="token punctuation">(</span>Lib<span class="token punctuation">.</span>QueueNewUser<span class="token punctuation">,</span> strconv<span class="token punctuation">.</span><span class="token function">Itoa</span><span class="token punctuation">(</span>userModel<span class="token punctuation">.</span>UserId<span class="token punctuation">)</span><span class="token punctuation">)</span>
				<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
					log<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
				<span class="token punctuation">}</span>
			<span class="token punctuation">}</span>
			context<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span><span class="token number">200</span><span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span><span class="token string">&quot;result&quot;</span><span class="token punctuation">:</span> userModel<span class="token punctuation">}</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">)</span>
	router<span class="token punctuation">.</span><span class="token function">Run</span><span class="token punctuation">(</span><span class="token string">&quot;:8080&quot;</span><span class="token punctuation">)</span>

<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230107150914902.png" alt="image-20230107150914902" loading="lazy"></p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230107150941704.png" alt="image-20230107150941704" loading="lazy"></p><p>\u5BF9\u5E94\u4E5F\u51FA\u73B0\u4E86\u8FD9\u4E2A<code>newuser</code>\u7684\u961F\u5217\u540D\u79F0\u3002</p>`,8);function v(m,b){const a=p("ExternalLinkIcon");return e(),o("div",null,[u,n("p",null,[n("a",k,[r,c(a)])]),d])}var q=t(l,[["render",v],["__file","3.simple-pro-con-msg.html.vue"]]);export{q as default};
