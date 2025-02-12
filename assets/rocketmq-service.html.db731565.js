import{_ as a}from"./plugin-vue_export-helper.21dcd24c.js";import{r as i,o as r,c as l,a as e,b as d,d as s,e as c}from"./app.cf87c796.js";const t={},o=e("h2",{id:"rocketmq2-8-0\u5B89\u88C5\u7F16\u8BD1\u542F\u52A8",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#rocketmq2-8-0\u5B89\u88C5\u7F16\u8BD1\u542F\u52A8","aria-hidden":"true"},"#"),s(" RocketMQ2.8.0\u5B89\u88C5\u7F16\u8BD1\u542F\u52A8")],-1),u=e("h2",{id:"\u6587\u6863\u5730\u5740",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#\u6587\u6863\u5730\u5740","aria-hidden":"true"},"#"),s(" \u6587\u6863\u5730\u5740")],-1),v={href:"https://rocketmq.apache.org/zh/docs/4.x/quickstart/01quickstart",target:"_blank",rel:"noopener noreferrer"},m=s("\u6587\u6863\u5730\u5740"),p=c(`<h3 id="\u7F16\u8BD1" tabindex="-1"><a class="header-anchor" href="#\u7F16\u8BD1" aria-hidden="true">#</a> \u7F16\u8BD1</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>mvn -Prelease-all -DskipTests -Dspotbugs.skip<span class="token operator">=</span>true clean <span class="token function">install</span> -U
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u76F4\u5230\u51FA\u73B0\u8FD9\u4E2A</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary for Apache RocketMQ 4.8.0 4.8.0:
[INFO] 
[INFO] Apache RocketMQ 4.8.0 .............................. SUCCESS [02:41 min]
[INFO] rocketmq-logging 4.8.0 ............................. SUCCESS [ 16.859 s]
[INFO] rocketmq-remoting 4.8.0 ............................ SUCCESS [  3.946 s]
[INFO] rocketmq-common 4.8.0 .............................. SUCCESS [  3.565 s]
[INFO] rocketmq-client 4.8.0 .............................. SUCCESS [  4.962 s]
[INFO] rocketmq-store 4.8.0 ............................... SUCCESS [  3.426 s]
[INFO] rocketmq-srvutil 4.8.0 ............................. SUCCESS [  0.170 s]
[INFO] rocketmq-filter 4.8.0 .............................. SUCCESS [  1.597 s]
[INFO] rocketmq-acl 4.8.0 ................................. SUCCESS [  2.034 s]
[INFO] rocketmq-broker 4.8.0 .............................. SUCCESS [  1.628 s]
[INFO] rocketmq-tools 4.8.0 ............................... SUCCESS [  1.027 s]
[INFO] rocketmq-namesrv 4.8.0 ............................. SUCCESS [  0.370 s]
[INFO] rocketmq-logappender 4.8.0 ......................... SUCCESS [  0.936 s]
[INFO] rocketmq-test 4.8.0 ................................ SUCCESS [  3.514 s]
[INFO] rocketmq-openmessaging 4.8.0 ....................... SUCCESS [  1.315 s]
[INFO] rocketmq-example 4.8.0 ............................. SUCCESS [  0.428 s]
[INFO] rocketmq-distribution 4.8.0 ........................ SUCCESS [01:26 min]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  04:53 min
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6210\u529F\u4E3A\u6B62</p><p>\u7F16\u8BD1\u5B8C\u6210\u540E\u4F1A\u51FA\u73B0\u4E00\u4E2A<code>target</code>\u76EE\u5F55</p><h2 id="\u542F\u52A8nameserver" tabindex="-1"><a class="header-anchor" href="#\u542F\u52A8nameserver" aria-hidden="true">#</a> \u542F\u52A8NameServer</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> distribution/target/rocketmq-4.8.0/rocketmq-4.8.0/
<span class="token function">nohup</span> <span class="token function">sh</span> bin/mqnamesrv <span class="token operator">&amp;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u6CE8\u610F\u8FD9\u91CC\u8981\u5207\u6362\u73AF\u5883\u53D8\u91CF java \u7684\u7248\u672C\u4E3A 1.8</p><p>\u5426\u5219\u4E0D\u9002\u914D</p></blockquote><p><code>tail -f nohup.out</code></p><p>\u770B\u5230</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>OpenJDK 64-Bit Server VM warning: Using the DefNew young collector with the CMS collector is deprecated and will likely be removed in a future release
OpenJDK 64-Bit Server VM warning: UseCMSCompactAtFullCollection is deprecated and will likely be removed in a future release.
The Name Server boot success. serializeType=JSON
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5C31\u7B97\u542F\u52A8\u6210\u529F\u4E86</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>jps
<span class="token number">63397</span> RemoteMavenServer36
<span class="token number">64906</span> Jps
<span class="token number">64813</span> NamesrvStartup
<span class="token number">63262</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u542F\u52A8-broker" tabindex="-1"><a class="header-anchor" href="#\u542F\u52A8-broker" aria-hidden="true">#</a> \u542F\u52A8 Broker</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">nohup</span> <span class="token function">sh</span> bin/mqbroker -n localhost:9876 <span class="token operator">&amp;</span>

<span class="token function">tail</span> -f nohup.out
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u51FA\u73B0</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>The broker[wxvirus, 192.168.0.107:10911] boot success. serializeType=JSON and name server is localhost:9876
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u4E5F\u7B97\u6210\u529F\u4E86</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>jps
<span class="token number">66640</span> BrokerStartup
<span class="token number">66741</span> Jps
<span class="token number">63397</span> RemoteMavenServer36
<span class="token number">64813</span> NamesrvStartup
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u9A8C\u8BC1" tabindex="-1"><a class="header-anchor" href="#\u9A8C\u8BC1" aria-hidden="true">#</a> \u9A8C\u8BC1</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">export</span> <span class="token assign-left variable">NAMESRV_ADDR</span><span class="token operator">=</span>localhost:9876
<span class="token function">sh</span> bin/tools.sh org.apache.rocketmq.example.quickstart.Producer


\u51FA\u73B0 SendResult <span class="token punctuation">[</span>sendStatus<span class="token operator">=</span>SEND_OK, <span class="token assign-left variable">msgId</span><span class="token operator">=</span> <span class="token punctuation">..</span>. \u5B57\u6837\u7684\u5C31\u7B97\u6210\u529F\u4E86

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sh</span> bin/tools.sh org.apache.rocketmq.example.quickstart.Consumer

\u51FA\u73B0 ConsumeMessageThread_%d Receive New Messages: <span class="token punctuation">[</span>MessageExt<span class="token punctuation">..</span>. \u5B57\u6837\u7684\u5C31\u7B97\u6210\u529F\u4E86
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,23);function b(h,k){const n=i("ExternalLinkIcon");return r(),l("div",null,[o,u,e("p",null,[e("a",v,[m,d(n)])]),p])}var C=a(t,[["render",b],["__file","rocketmq-service.html.vue"]]);export{C as default};
