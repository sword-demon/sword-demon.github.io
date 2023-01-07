import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as a,e as t}from"./app.0e0aab5a.js";const p={},e=t(`<h1 id="\u4EA4\u6362\u673A" tabindex="-1"><a class="header-anchor" href="#\u4EA4\u6362\u673A" aria-hidden="true">#</a> \u4EA4\u6362\u673A</h1><h2 id="\u5B9A\u4E49\u4EA4\u6362\u673A-\u5411-2-\u4E2A\u961F\u5217\u540C\u65F6\u53D1\u751F\u6D88\u606F" tabindex="-1"><a class="header-anchor" href="#\u5B9A\u4E49\u4EA4\u6362\u673A-\u5411-2-\u4E2A\u961F\u5217\u540C\u65F6\u53D1\u751F\u6D88\u606F" aria-hidden="true">#</a> \u5B9A\u4E49\u4EA4\u6362\u673A\uFF1A\u5411 2 \u4E2A\u961F\u5217\u540C\u65F6\u53D1\u751F\u6D88\u606F</h2><p>\u524D\u9762\u6211\u4EEC\u53D1\u9001\u6D88\u606F\u7684\u65F6\u5019\uFF0C\u6211\u4EEC\u4F20\u7684<code>exchange</code>\u90FD\u662F\u7A7A\uFF0C\u6240\u4EE5\u5B83\u662F\u76F4\u63A5\u4F7F\u7528\u7684\u9ED8\u8BA4\u7684<code>AMQP default</code>\u9ED8\u8BA4\u7684\u4EA4\u6362\u673A\u3002</p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230107162507874.png" alt="image-20230107162507874" loading="lazy"></p><p><code>Direct Exchange</code>\uFF1A\u76F4\u63A5\u6A21\u5F0F\u4EA4\u6362\u673A\u3002\u4EA4\u6362\u673A\u548C\u4E00\u4E2A\u961F\u5217<strong>\u7ED1\u5B9A</strong>\u8D77\u6765\uFF0C\u5E76\u6307\u5B9A\u4E00\u4E2A\u8DEF\u7531\u952E\uFF0C\u4EA4\u6362\u673A\u4F1A\u5BFB\u627E\u5339\u914D\u7684\u8DEF\u7531\u952E\u7684\u7ED1\u5B9A\uFF0C\u5E76\u5C06\u6D88\u606F\u8DEF\u7531\u7ED9\u5BF9\u5E94\u7684\u961F\u5217\u3002</p><p>\u6211\u4EEC\u628A\u524D\u9762\u7684\u53D1\u9001\u6D88\u606F\u7684\u4FEE\u6539\u4E00\u4E0B\u4EE3\u7801</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token punctuation">(</span>mq <span class="token operator">*</span>MQ<span class="token punctuation">)</span> <span class="token function">SendMessage</span><span class="token punctuation">(</span>queueName <span class="token builtin">string</span><span class="token punctuation">,</span> message <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token builtin">error</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u58F0\u660E\u961F\u5217</span>
	q1<span class="token punctuation">,</span> err <span class="token operator">:=</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">QueueDeclare</span><span class="token punctuation">(</span>queueName<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> err
	<span class="token punctuation">}</span>
	<span class="token comment">// \u5047\u8BBE\u5408\u4F5C\u7F51\u7AD9\u7528\u7684\u961F\u5217</span>
	q2<span class="token punctuation">,</span> err <span class="token operator">:=</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">QueueDeclare</span><span class="token punctuation">(</span>queueName<span class="token operator">+</span><span class="token string">&quot;union&quot;</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> err
	<span class="token punctuation">}</span>
	<span class="token comment">// \u58F0\u660E\u4EA4\u6362\u673A</span>
	err <span class="token operator">=</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">ExchangeDeclare</span><span class="token punctuation">(</span><span class="token string">&quot;UserExchange&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;direct&quot;</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> err
	<span class="token punctuation">}</span>
	err <span class="token operator">=</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">QueueBind</span><span class="token punctuation">(</span>q1<span class="token punctuation">.</span>Name<span class="token punctuation">,</span> <span class="token string">&quot;userReg&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;UserExchange&quot;</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> err
	<span class="token punctuation">}</span>
    <span class="token comment">// userReg \u662F\u8DEF\u7531\u952E</span>
	err <span class="token operator">=</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">QueueBind</span><span class="token punctuation">(</span>q2<span class="token punctuation">.</span>Name<span class="token punctuation">,</span> <span class="token string">&quot;userReg&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;UserExchange&quot;</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> err
	<span class="token punctuation">}</span>
	<span class="token comment">// exchange \u4E3A\u7A7A \u4F1A\u4F7F\u7528\u9ED8\u8BA4\u7684\u4EA4\u6362\u673A</span>
	<span class="token keyword">return</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">Publish</span><span class="token punctuation">(</span><span class="token string">&quot;UserExchange&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;userReg&quot;</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
		amqp<span class="token punctuation">.</span>Publishing<span class="token punctuation">{</span>
			ContentType<span class="token punctuation">:</span> <span class="token string">&quot;text/plain&quot;</span><span class="token punctuation">,</span>
			Body<span class="token punctuation">:</span>        <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token function">byte</span><span class="token punctuation">(</span>message<span class="token punctuation">)</span><span class="token punctuation">,</span>
		<span class="token punctuation">}</span><span class="token punctuation">,</span>
	<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u63A5\u7740\u8FD0\u884C\u524D\u9762\u7684<code>gin</code>\u63A5\u53E3\u4EE3\u7801</p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230107163524334.png" alt="image-20230107163524334" loading="lazy"></p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230107163535550.png" alt="image-20230107163535550" loading="lazy"></p><p>\u5BF9\u5E94\u521B\u5EFA\u7684\u4EA4\u6362\u673A\u548C\u961F\u5217\u90FD\u6709\u4E86\u3002\u800C\u4E14 2 \u4E2A\u961F\u5217\u53D1\u9001\u7684\u6D88\u606F\u90FD\u662F\u4E00\u6837\u7684\u3002</p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230107163827355.png" alt="image-20230107163827355" loading="lazy"></p><p>\u53EF\u4EE5\u770B\u5230<code>UserExchange</code>\u548C\u4E24\u4E2A\u8DEF\u7531\u952E\u7ED1\u5B9A\u4E86\u3002</p><h2 id="\u4EE3\u7801\u4F18\u5316" tabindex="-1"><a class="header-anchor" href="#\u4EE3\u7801\u4F18\u5316" aria-hidden="true">#</a> \u4EE3\u7801\u4F18\u5316</h2><p>\u6211\u4EEC\u53EF\u4EE5\u5C06\u5199\u4E86\u5F88\u957F\u4E00\u90E8\u5206\u7684\u58F0\u660E\u961F\u5217\u548C\u4EA4\u6362\u673A\u7684\u8FDB\u884C\u5C01\u88C5\uFF0C\u5C01\u88C5\u4E4B\u524D\u5148\u628A\u4E0A\u9762\u7684\u751F\u6210\u7684\u961F\u5217\u548C\u4EA4\u6362\u673A\u90FD\u5220\u6389\u3002</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> Lib

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;github.com/streadway/amqp&quot;</span>
	<span class="token string">&quot;log&quot;</span>
	<span class="token string">&quot;rmq/AppInit&quot;</span>
	<span class="token string">&quot;strings&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">const</span> <span class="token punctuation">(</span>
	QueueNewUser <span class="token operator">=</span> <span class="token string">&quot;newuser&quot;</span> <span class="token comment">//\u7528\u6237\u6CE8\u518C \u5BF9\u5E94\u7684\u961F\u5217\u540D\u79F0</span>
	QueueNewUserUnion <span class="token operator">=</span> <span class="token string">&quot;new_user_union&quot;</span> <span class="token comment">// \u5408\u4F5C\u5355\u4F4D\u7528\u6237\u6CE8\u518C \u5BF9\u5E94\u7684\u961F\u5217\u540D\u79F0</span>
	ExchangeUser <span class="token operator">=</span> <span class="token string">&quot;UserExchange&quot;</span> <span class="token comment">// \u7528\u6237\u6A21\u5757\u76F8\u5173\u7684\u4EA4\u6362\u673A</span>
	RouteKeyUserReg <span class="token operator">=</span> <span class="token string">&quot;userReg&quot;</span> <span class="token comment">// \u6CE8\u518C\u7528\u6237\u7684\u8DEF\u7531key</span>
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

<span class="token comment">// DecQueueAndBind \u58F0\u660E\u961F\u5217\u4EE5\u53CA\u75C5\u6BD2\u8DEF\u7531key \u591A\u4E2A\u961F\u5217\u53EF\u4EE5\u7528\u9017\u53F7\u9694\u5F00</span>
<span class="token keyword">func</span> <span class="token punctuation">(</span>mq <span class="token operator">*</span>MQ<span class="token punctuation">)</span> <span class="token function">DecQueueAndBind</span><span class="token punctuation">(</span>queues <span class="token builtin">string</span><span class="token punctuation">,</span> key <span class="token builtin">string</span><span class="token punctuation">,</span> exchange <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token builtin">error</span> <span class="token punctuation">{</span>
	qList <span class="token operator">:=</span> strings<span class="token punctuation">.</span><span class="token function">Split</span><span class="token punctuation">(</span>queues<span class="token punctuation">,</span> <span class="token string">&quot;,&quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">for</span> <span class="token boolean">_</span><span class="token punctuation">,</span> queue <span class="token operator">:=</span> <span class="token keyword">range</span> qList <span class="token punctuation">{</span>
		q<span class="token punctuation">,</span> err <span class="token operator">:=</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">QueueDeclare</span><span class="token punctuation">(</span>queue<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			<span class="token keyword">return</span> err
		<span class="token punctuation">}</span>
		err <span class="token operator">=</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">QueueBind</span><span class="token punctuation">(</span>q<span class="token punctuation">.</span>Name<span class="token punctuation">,</span> key<span class="token punctuation">,</span> exchange<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			<span class="token keyword">return</span> err
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>mq <span class="token operator">*</span>MQ<span class="token punctuation">)</span> <span class="token function">SendMessage</span><span class="token punctuation">(</span>key <span class="token builtin">string</span><span class="token punctuation">,</span> exchange <span class="token builtin">string</span><span class="token punctuation">,</span> message <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token builtin">error</span> <span class="token punctuation">{</span>

	<span class="token comment">// exchange \u4E3A\u7A7A \u4F1A\u4F7F\u7528\u9ED8\u8BA4\u7684\u4EA4\u6362\u673A</span>
	<span class="token keyword">return</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">Publish</span><span class="token punctuation">(</span>exchange<span class="token punctuation">,</span> key<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
		amqp<span class="token punctuation">.</span>Publishing<span class="token punctuation">{</span>
			ContentType<span class="token punctuation">:</span> <span class="token string">&quot;text/plain&quot;</span><span class="token punctuation">,</span>
			Body<span class="token punctuation">:</span>        <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token function">byte</span><span class="token punctuation">(</span>message<span class="token punctuation">)</span><span class="token punctuation">,</span>
		<span class="token punctuation">}</span><span class="token punctuation">,</span>
	<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>QueueInit.go</code></p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> Lib

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token comment">// UserInit \u521D\u59CB\u5316\u7528\u6237\u76F8\u5173\u7684\u961F\u5217</span>
<span class="token keyword">func</span> <span class="token function">UserInit</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token builtin">error</span> <span class="token punctuation">{</span>
	mq <span class="token operator">:=</span> <span class="token function">NewMQ</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> mq <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> fmt<span class="token punctuation">.</span><span class="token function">Errorf</span><span class="token punctuation">(</span><span class="token string">&quot;mq init error&quot;</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">defer</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token comment">// \u58F0\u660E\u4EA4\u6362\u673A</span>
	err <span class="token operator">:=</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">ExchangeDeclare</span><span class="token punctuation">(</span>ExchangeUser<span class="token punctuation">,</span> <span class="token string">&quot;direct&quot;</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token boolean">nil</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> fmt<span class="token punctuation">.</span><span class="token function">Errorf</span><span class="token punctuation">(</span><span class="token string">&quot;ExChange error: %s&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	qs <span class="token operator">:=</span> fmt<span class="token punctuation">.</span><span class="token function">Sprintf</span><span class="token punctuation">(</span><span class="token string">&quot;%s,%s&quot;</span><span class="token punctuation">,</span> QueueNewUser<span class="token punctuation">,</span> QueueNewUserUnion<span class="token punctuation">)</span>
	err <span class="token operator">=</span> mq<span class="token punctuation">.</span><span class="token function">DecQueueAndBind</span><span class="token punctuation">(</span>qs<span class="token punctuation">,</span> RouteKeyUserReg<span class="token punctuation">,</span> ExchangeUser<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> fmt<span class="token punctuation">.</span><span class="token function">Errorf</span><span class="token punctuation">(</span><span class="token string">&quot;queue bind error: %s&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6539\u5199<code>gin</code>\u670D\u52A1\u63A5\u53E3</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

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
				err <span class="token operator">:=</span> mq<span class="token punctuation">.</span><span class="token function">SendMessage</span><span class="token punctuation">(</span>Lib<span class="token punctuation">.</span>RouteKeyUserReg<span class="token punctuation">,</span> Lib<span class="token punctuation">.</span>ExchangeUser<span class="token punctuation">,</span> strconv<span class="token punctuation">.</span><span class="token function">Itoa</span><span class="token punctuation">(</span>userModel<span class="token punctuation">.</span>UserId<span class="token punctuation">)</span><span class="token punctuation">)</span>
				<span class="token keyword">defer</span> mq<span class="token punctuation">.</span>Channel<span class="token punctuation">.</span><span class="token function">Close</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
				<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
					log<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
				<span class="token punctuation">}</span>
			<span class="token punctuation">}</span>
			context<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span><span class="token number">200</span><span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span><span class="token string">&quot;result&quot;</span><span class="token punctuation">:</span> userModel<span class="token punctuation">}</span><span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">)</span>
	c <span class="token operator">:=</span> <span class="token function">make</span><span class="token punctuation">(</span><span class="token keyword">chan</span> <span class="token builtin">error</span><span class="token punctuation">)</span>
	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		err <span class="token operator">:=</span> router<span class="token punctuation">.</span><span class="token function">Run</span><span class="token punctuation">(</span><span class="token string">&quot;:8083&quot;</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			c <span class="token operator">&lt;-</span> err
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	<span class="token keyword">go</span> <span class="token keyword">func</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token comment">// \u6267\u884Cmq \u521D\u59CB\u5316\u7528\u6237\u961F\u5217</span>
		err <span class="token operator">:=</span> Lib<span class="token punctuation">.</span><span class="token function">UserInit</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			c <span class="token operator">&lt;-</span> err
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	err <span class="token operator">:=</span> <span class="token operator">&lt;-</span>c
	log<span class="token punctuation">.</span><span class="token function">Fatalln</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6211\u4EEC\u7A0B\u5E8F\u542F\u52A8\u5C31\u4F1A\u4EA7\u751F\u4E0A\u9762\u4E00\u6837\u7684<code>UserExchange</code>\u4EA4\u6362\u673A\u4EE5\u53CA<code>new_user_union</code>\u548C<code>newuser</code>\u961F\u5217\u3002\u73B0\u5728\u961F\u5217\u8FD8\u6682\u65F6\u6CA1\u6709\u6D88\u606F\uFF0C\u6211\u4EEC\u8C03\u7528\u4E00\u4E0B API \u63A5\u53E3\uFF0C\u65E0\u660E\u663E\u62A5\u9519\uFF0C\u53EA\u8981\u7A0D\u5FAE\u7B49 1 \u79D2\u5C31\u4F1A\u51FA\u73B0\u6D88\u606F\u3002</p>`,21),o=[e];function c(l,i){return s(),a("div",null,o)}var r=n(p,[["render",c],["__file","4.exchange-demo.html.vue"]]);export{r as default};
