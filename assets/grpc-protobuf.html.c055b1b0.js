import{_ as t}from"./plugin-vue_export-helper.21dcd24c.js";import{r as p,o as c,c as l,a as n,b as o,d as s,e as a}from"./app.00e101e4.js";const i={},r=n("h2",{id:"grpc",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#grpc","aria-hidden":"true"},"#"),s(" gRPC")],-1),u=n("blockquote",null,[n("p",null,"gRPC \u662F\u4E00\u4E2A\u9AD8\u6027\u80FD\u7684\u3001\u5F00\u6E90\u548C\u901A\u7528\u7684 RPC \u6846\u67B6\uFF0C\u9762\u5411\u79FB\u52A8\u548C HTTP/2 \u8BBE\u8BA1\u3002\u76EE\u524D\u63D0\u4F9B C\u3001Java \u548C Go \u8BED\u8A00\u7248\u672C\uFF0C\u5206\u522B\u662F\uFF1Agrpc\u3001grpc-java\u3001grpc-go\uFF0C\u5176\u4E2D C \u7248\u672C\u652F\u6301 C\u3001C++\u3001Nodejs\u3001Python\u3001Ruby\u3001Objective-C\u3001PHP \u548C C#\u3002")],-1),d=s("grpc \u7F51\u5740\uFF1A"),k={href:"https://grpc.io/",target:"_blank",rel:"noopener noreferrer"},v=s("https://grpc.io/"),m=a('<p>\u6BD4\u5982\uFF1Ajava \u4E2D\u7684<code>dubbo</code>\u4F7F\u7528\u4E86<code>dubbo/rmi/hessian</code>\u5404\u79CD\u534F\u8BAE\uFF0C\u4F46\u662F\u5B83\u4EEC\u538B\u7F29\u6BD4\u90FD\u4F1A\u6BD4<code>json</code>\u548C<code>xml</code>\u9AD8\uFF0C\u751A\u81F3\u67D0\u4E9B\u573A\u666F\u548C<code>protobuf</code>\u5DEE\u4E0D\u591A\uFF0C<strong>\u5982\u679C\u61C2\u4E86\u534F\u8BAE\uFF0C\u5B8C\u5168\u6709\u80FD\u529B\u81EA\u5DF1\u5B9E\u73B0\u4E00\u4E2A\u6027\u80FD\u6BD4\u8F83\u9AD8\u7684\u534F\u8BAE\u3002</strong></p><h2 id="protobuf" tabindex="-1"><a class="header-anchor" href="#protobuf" aria-hidden="true">#</a> protobuf</h2><p>\u5B83\u5168\u79F0\u4E3A\uFF1A<code>protocol buffer</code>\uFF0C\u662F\u4E00\u79CD\u6570\u636E\u5B58\u50A8\u683C\u5F0F</p><ul><li>\u5B83\u662F\u8C37\u6B4C\u51FA\u54C1\u7684\u4E00\u79CD\u8F7B\u91CF\u3001\u9AD8\u6548\u7684\u7ED3\u6784\u5316\u6570\u636E\u5B58\u50A8\u683C\u5F0F\uFF0C\u6027\u80FD\u6BD4<code>json</code>\u3001<code>xml</code>\u771F\u7684\u5F3A\u5F88\u591A</li><li><code>protobuf</code>\u7ECF\u5386\u4E86<code>protobuf2</code>\u548C<code>protobuf3</code>\uFF0C<code>pb3</code>\u6BD4<code>pb2</code>\u7B80\u5316\u4E86\u5F88\u591A\uFF0C\u76EE\u524D\u4E3B\u6D41\u7684\u7248\u672C\u662F<code>pb3</code></li></ul><p>\u4F18\u70B9\uFF1A</p><ol><li>\u6027\u80FD <ol><li>\u538B\u7F29\u6027\u597D</li><li>\u5E8F\u5217\u5316\u548C\u53CD\u5E8F\u5217\u5316\u5FEB\uFF0C\u6BD4<code>json</code>\u548C<code>xml</code>\u5FEB 2-100 \u500D</li><li>\u4F20\u8F93\u901F\u5EA6\u5FEB</li></ol></li><li>\u4FBF\u6377\u6027 <ol><li>\u4F7F\u7528\u7B80\u5355\uFF1A\u53EF\u4EE5\u81EA\u52A8\u751F\u6210\u5E8F\u5217\u5316\u548C\u53CD\u5E8F\u5217\u5316\u7684\u4EE3\u7801</li><li>\u7EF4\u62A4\u6210\u672C\u5730\uFF0C\u6211\u4EEC\u53EA\u9700\u8981\u7EF4\u62A4<code>proto</code>\u6587\u4EF6\u5373\u53EF</li><li>\u5411\u540E\u517C\u5BB9\u597D\uFF0C\u4E0D\u7834\u574F\u65E7\u7684\u683C\u5F0F</li><li>\u52A0\u5BC6\u6027\u597D\uFF0C\u5B83\u7684\u4EE3\u7801\u4F1A\u53D8\u6210\u4E8C\u8FDB\u5236\u7684\uFF0C\u5C31\u7B97\u522B\u4EBA\u62FF\u5230\u4E5F\u4E0D\u4E00\u5B9A\u77E5\u9053</li></ol></li><li>\u8DE8\u8BED\u8A00 <ol><li>\u8DE8\u5E73\u53F0</li><li>\u652F\u6301\u5404\u79CD\u4E3B\u6D41\u8BED\u8A00</li></ol></li></ol><p>\u7F3A\u70B9\uFF1A</p><ol><li>\u901A\u7528\u6027\u5DEE\uFF1A<code>json</code>\u53EF\u4EE5\u4EFB\u4F55\u8BED\u8A00\u90FD\u652F\u6301\uFF0C\u4F46\u662F<code>protobuf</code>\u9700\u8981\u4E13\u95E8\u7684\u89E3\u6790\u5E93</li><li>\u81EA\u89E3\u91CA\u6027\u5DEE\uFF1A\u53EA\u6709\u901A\u8FC7<code>proto</code>\u6587\u4EF6\u624D\u80FD\u4E86\u89E3\u6570\u636E\u7ED3\u6784\uFF0C\u6E90\u81EA\u4E8E\u5B83\u52A0\u5BC6\u6027\u597D\uFF0C\u6240\u4EE5\u6709\u7684\u65F6\u5019\u4E0D\u662F\u5FC5\u987B\u4F7F\u7528<code>protobuf</code></li></ol><h2 id="python-\u4E0B\u4F53\u9A8C-protobuf" tabindex="-1"><a class="header-anchor" href="#python-\u4E0B\u4F53\u9A8C-protobuf" aria-hidden="true">#</a> python \u4E0B\u4F53\u9A8C protobuf</h2>',9),b={href:"https://grpc.io/docs/languages/python/quickstart/",target:"_blank",rel:"noopener noreferrer"},g=s("\u6587\u6863\u5730\u5740"),h=a(`<p>\u751F\u6210\u4EE3\u7801\u7684\u5DE5\u5177\u4EE3\u7801\u7F16\u5199\uFF0C\u53EF\u4EE5\u548C<code>proto</code>\u6587\u4EF6\u5378\u8F7D\u540C\u4E00\u76EE\u5F55\u4E0B\uFF0C\u4FBF\u4E8E\u4EE3\u7801\u751F\u6210</p><div class="language-python ext-py line-numbers-mode"><pre class="language-python"><code><span class="token comment"># -*- coding: utf8 -*-</span>
<span class="token comment"># @Time    : 2022/7/10 21:47</span>
<span class="token comment"># @Author  : wxvirus</span>
<span class="token comment"># @File    : tools.py</span>
<span class="token comment"># @Software: PyCharm</span>

<span class="token keyword">import</span> pkg_resources
<span class="token keyword">from</span> grpc_tools <span class="token keyword">import</span> _protoc_compiler


<span class="token keyword">def</span> <span class="token function">main</span><span class="token punctuation">(</span>command_arguments<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;Run the protocol buffer compiler with the given command-line arguments.
  Args:
    command_arguments: a list of strings representing command line arguments to
        \`protoc\`.
  &quot;&quot;&quot;</span>
    command_arguments <span class="token operator">=</span> <span class="token punctuation">[</span>argument<span class="token punctuation">.</span>encode<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">for</span> argument <span class="token keyword">in</span> command_arguments<span class="token punctuation">]</span>
    <span class="token keyword">return</span> _protoc_compiler<span class="token punctuation">.</span>run_main<span class="token punctuation">(</span>command_arguments<span class="token punctuation">)</span>


proto_include <span class="token operator">=</span> pkg_resources<span class="token punctuation">.</span>resource_filename<span class="token punctuation">(</span><span class="token string">&#39;grpc_tools&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;_proto&#39;</span><span class="token punctuation">)</span>

argv <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token string">&#39;&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;-I.&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;--python_out=.&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;--grpc_python_out=.&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;./hello.proto&#39;</span><span class="token punctuation">]</span>
main<span class="token punctuation">(</span>argv <span class="token operator">+</span> <span class="token punctuation">[</span><span class="token string">&#39;-I{}&#39;</span><span class="token punctuation">.</span><span class="token builtin">format</span><span class="token punctuation">(</span>proto_include<span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>proto</code>\u6587\u4EF6</p><div class="language-protobuf ext-protobuf line-numbers-mode"><pre class="language-protobuf"><code><span class="token keyword">syntax</span> <span class="token operator">=</span> <span class="token string">&quot;proto3&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">message</span> <span class="token class-name">HelloRequest</span> <span class="token punctuation">{</span>
    <span class="token builtin">string</span> name <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6D4B\u8BD5\u4EE3\u7801</p><div class="language-python ext-py line-numbers-mode"><pre class="language-python"><code><span class="token comment"># -*- coding: utf8 -*-</span>
<span class="token comment"># @Time    : 2022/7/10 21:40</span>
<span class="token comment"># @Author  : wxvirus</span>
<span class="token comment"># @File    : client.py</span>
<span class="token comment"># @Software: PyCharm</span>
<span class="token keyword">from</span> protobuf_test<span class="token punctuation">.</span>proto <span class="token keyword">import</span> hello_pb2

<span class="token comment"># \u751F\u6210\u7684pb\u6587\u4EF6\u4E0D\u8981\u53BB\u6539</span>
request <span class="token operator">=</span> hello_pb2<span class="token punctuation">.</span>HelloRequest<span class="token punctuation">(</span><span class="token punctuation">)</span>
request<span class="token punctuation">.</span>name <span class="token operator">=</span> <span class="token string">&quot;wujie&quot;</span>
res_str <span class="token operator">=</span> request<span class="token punctuation">.</span>SerializeToString<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token keyword">print</span><span class="token punctuation">(</span>res_str<span class="token punctuation">)</span>

<span class="token comment"># \u5982\u679C\u901A\u8FC7\u5B57\u7B26\u4E32\u53CD\u5411\u751F\u6210\u5BF9\u8C61</span>
request2 <span class="token operator">=</span> hello_pb2<span class="token punctuation">.</span>HelloRequest<span class="token punctuation">(</span><span class="token punctuation">)</span>
request2<span class="token punctuation">.</span>ParseFromString<span class="token punctuation">(</span>res_str<span class="token punctuation">)</span>
<span class="token keyword">print</span><span class="token punctuation">(</span>request2<span class="token punctuation">.</span>name<span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>b<span class="token string">&#39;\\n\\x05wujie&#39;</span>
wujie
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u91CC\u7684<code>name</code>\u5C5E\u6027\u662F\u7F16\u53F7 1\uFF0C<code>\\n\\x</code>\u662F\u4E00\u4E2A\u53EF\u53D8\u957F\u7F16\u7801</p><h2 id="python-\u4E0B\u4F7F\u7528-grpc" tabindex="-1"><a class="header-anchor" href="#python-\u4E0B\u4F7F\u7528-grpc" aria-hidden="true">#</a> python \u4E0B\u4F7F\u7528 gRPC</h2><p><code>grpc_hello/proto/helloworld.proto</code></p><div class="language-protobuf ext-protobuf line-numbers-mode"><pre class="language-protobuf"><code><span class="token keyword">syntax</span> <span class="token operator">=</span> <span class="token string">&quot;proto3&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">package</span> helloworld<span class="token punctuation">;</span>

<span class="token keyword">message</span> <span class="token class-name">HelloRequest</span> <span class="token punctuation">{</span>
    <span class="token builtin">string</span> name <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">message</span> <span class="token class-name">HelloReply</span> <span class="token punctuation">{</span>
    <span class="token builtin">string</span> message <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">service</span> <span class="token class-name">Greeter</span> <span class="token punctuation">{</span>
    <span class="token keyword">rpc</span> <span class="token function">SayHello</span><span class="token punctuation">(</span><span class="token class-name">HelloRequest</span><span class="token punctuation">)</span> <span class="token keyword">returns</span> <span class="token punctuation">(</span><span class="token class-name">HelloReply</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FDB\u5165\u5230\u4E0A\u9762\u7684\u76EE\u5F55\u91CC\u4E4B\u540E\u4F7F\u7528\u547D\u4EE4\u6765\u751F\u6210\u4EE3\u7801</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>python -m grpc_tools.protoc --python_out<span class="token operator">=</span>. --grpc_python_out<span class="token operator">=</span>. -I. Helloworld.proto

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>server.py</code></p><div class="language-python ext-py line-numbers-mode"><pre class="language-python"><code><span class="token comment"># -*- coding: utf8 -*-</span>
<span class="token comment"># @Time    : 2022/7/11 22:09</span>
<span class="token comment"># @Author  : wxvirus</span>
<span class="token comment"># @File    : server.py</span>
<span class="token comment"># @Software: PyCharm</span>
<span class="token keyword">from</span> concurrent <span class="token keyword">import</span> futures
<span class="token keyword">import</span> grpc
<span class="token keyword">from</span> grpc_hello<span class="token punctuation">.</span>proto <span class="token keyword">import</span> Helloworld_pb2_grpc<span class="token punctuation">,</span> Helloworld_pb2


<span class="token keyword">class</span> <span class="token class-name">Greeter</span><span class="token punctuation">(</span>Helloworld_pb2_grpc<span class="token punctuation">.</span>GreeterServicer<span class="token punctuation">)</span><span class="token punctuation">:</span>

    <span class="token keyword">def</span> <span class="token function">SayHello</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> request<span class="token punctuation">,</span> context<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token keyword">return</span> Helloworld_pb2<span class="token punctuation">.</span>HelloReply<span class="token punctuation">(</span>message<span class="token operator">=</span><span class="token string-interpolation"><span class="token string">f&quot;ni hao, </span><span class="token interpolation"><span class="token punctuation">{</span>request<span class="token punctuation">.</span>name<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span><span class="token punctuation">)</span>


<span class="token keyword">if</span> __name__ <span class="token operator">==</span> <span class="token string">&#39;__main__&#39;</span><span class="token punctuation">:</span>
    <span class="token comment"># \u542F\u52A8grpc</span>
    <span class="token comment"># 1. \u5B9E\u4F8B\u5316 server</span>
    <span class="token comment"># \u8BBE\u7F6E10\u4E2A\u7EBF\u7A0B\u6C60</span>
    server <span class="token operator">=</span> grpc<span class="token punctuation">.</span>server<span class="token punctuation">(</span>futures<span class="token punctuation">.</span>ThreadPoolExecutor<span class="token punctuation">(</span>max_workers<span class="token operator">=</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token comment"># 2. \u6CE8\u518C\u903B\u8F91\u5230server\u4E2D</span>
    Helloworld_pb2_grpc<span class="token punctuation">.</span>add_GreeterServicer_to_server<span class="token punctuation">(</span>Greeter<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> server<span class="token punctuation">)</span>
    <span class="token comment"># 3. \u542F\u52A8server</span>
    <span class="token comment"># \u53EF\u4EE5\u4E0D\u914D\u8BC1\u4E66\u4E4B\u7C7B\u7684</span>
    server<span class="token punctuation">.</span>add_insecure_port<span class="token punctuation">(</span><span class="token string">&#39;:50051&#39;</span><span class="token punctuation">)</span>
    server<span class="token punctuation">.</span>start<span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token comment"># \u5FC5\u987B\u52A0\u4E0A\u8FD9\u4E2A\uFF0C\u9632\u6B62\u522B\u7684\u7EBF\u7A0B\u6CA1\u6267\u884C\u5230</span>
    server<span class="token punctuation">.</span>wait_for_termination<span class="token punctuation">(</span><span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5BA2\u6237\u7AEF</p><div class="language-python ext-py line-numbers-mode"><pre class="language-python"><code><span class="token comment"># -*- coding: utf8 -*-</span>
<span class="token comment"># @Time    : 2022/7/11 22:45</span>
<span class="token comment"># @Author  : wxvirus</span>
<span class="token comment"># @File    : client.py</span>
<span class="token comment"># @Software: PyCharm</span>
<span class="token keyword">import</span> grpc
<span class="token keyword">from</span> grpc_hello<span class="token punctuation">.</span>proto <span class="token keyword">import</span> Helloworld_pb2<span class="token punctuation">,</span> Helloworld_pb2_grpc

<span class="token keyword">if</span> __name__ <span class="token operator">==</span> <span class="token string">&#39;__main__&#39;</span><span class="token punctuation">:</span>
    <span class="token keyword">with</span> grpc<span class="token punctuation">.</span>insecure_channel<span class="token punctuation">(</span><span class="token string">&quot;127.0.0.1:12345&quot;</span><span class="token punctuation">)</span> <span class="token keyword">as</span> channel<span class="token punctuation">:</span>
        stub <span class="token operator">=</span> Helloworld_pb2_grpc<span class="token punctuation">.</span>GreeterStub<span class="token punctuation">(</span>channel<span class="token punctuation">)</span>
        <span class="token comment"># \u8FD4\u56DE\u503C\u6307\u660E\u7C7B\u578B</span>
        resp<span class="token punctuation">:</span> Helloworld_pb2<span class="token punctuation">.</span>HelloReply <span class="token operator">=</span> stub<span class="token punctuation">.</span>SayHello<span class="token punctuation">(</span>Helloworld_pb2<span class="token punctuation">.</span>HelloRequest<span class="token punctuation">(</span>name<span class="token operator">=</span><span class="token string">&quot;wxvirus&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token comment"># \u6253\u5370proto\u5B9A\u4E49\u7684\u8FD4\u56DE\u4F53\u7684message\u5C5E\u6027</span>
        <span class="token keyword">print</span><span class="token punctuation">(</span>resp<span class="token punctuation">.</span>message<span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u8FD0\u884C\u7ED3\u679C</span>
ni hao, wxvirus
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="go-\u4E0B-grpc-\u5F00\u53D1\u4F53\u9A8C" tabindex="-1"><a class="header-anchor" href="#go-\u4E0B-grpc-\u5F00\u53D1\u4F53\u9A8C" aria-hidden="true">#</a> go \u4E0B gRPC \u5F00\u53D1\u4F53\u9A8C</h2><h3 id="\u4E0B\u8F7Dprotoc\u5DE5\u5177" tabindex="-1"><a class="header-anchor" href="#\u4E0B\u8F7Dprotoc\u5DE5\u5177" aria-hidden="true">#</a> \u4E0B\u8F7D<code>protoc</code>\u5DE5\u5177</h3><p>\u9996\u5148\u8FD8\u662F\u5F97\u5148\u5B89\u88C5<code>protoc</code>\u53EF\u6267\u884C\u6587\u4EF6\u7528\u6765\u751F\u6210\u4EE3\u7801\u3002</p>`,21),_=a(`<li><p>Linux, using <code>apt</code> or <code>apt-get</code>, for example:</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>$ <span class="token function">apt</span> <span class="token function">install</span> -y protobuf-compiler
$ protoc --version  <span class="token comment"># Ensure compiler version is 3+</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div></li>`,1),y=s("MacOS, using "),f={href:"https://brew.sh/",target:"_blank",rel:"noopener noreferrer"},w=s("Homebrew"),q=s(":"),x=a(`<div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>$ brew <span class="token function">install</span> protobuf
$ protoc --version  <span class="token comment"># Ensure compiler version is 3+</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,1),H=a(`<p>\u5982\u679C\u4E0A\u8FF0\u64CD\u4F5C\u6CA1\u6709\u76F4\u63A5\u7ED9\u4F60\u6DFB\u52A0\u5230\u73AF\u5883\u53D8\u91CF \uFF0C\u8FD8\u5F97\u81EA\u5DF1\u624B\u52A8\u53BB\u52A0\u4E00\u4E0B\u5230\u73AF\u5883\u53D8\u91CF\u91CC\uFF0C\u5426\u5219\u6267\u884C<code>protoc --version</code>\u4F1A\u4E0D\u6210\u529F\u3002</p><h3 id="\u4E0B\u8F7D-go-\u7684\u4F9D\u8D56\u5305" tabindex="-1"><a class="header-anchor" href="#\u4E0B\u8F7D-go-\u7684\u4F9D\u8D56\u5305" aria-hidden="true">#</a> \u4E0B\u8F7D go \u7684\u4F9D\u8D56\u5305</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>go get github.com/golang/protobuf/protoc-gen-go
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="proto-\u6587\u4EF6" tabindex="-1"><a class="header-anchor" href="#proto-\u6587\u4EF6" aria-hidden="true">#</a> proto \u6587\u4EF6</h3><div class="language-protobuf ext-protobuf line-numbers-mode"><pre class="language-protobuf"><code><span class="token keyword">syntax</span> <span class="token operator">=</span> <span class="token string">&quot;proto3&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">package</span> helloworld<span class="token punctuation">;</span>

<span class="token keyword">option</span> go_package <span class="token operator">=</span> <span class="token string">&quot;.;proto&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">message</span> <span class="token class-name">HelloRequest</span> <span class="token punctuation">{</span>
    <span class="token builtin">string</span> name <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">message</span> <span class="token class-name">HelloReply</span> <span class="token punctuation">{</span>
    <span class="token builtin">string</span> message <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">service</span> <span class="token class-name">Greeter</span> <span class="token punctuation">{</span>
    <span class="token keyword">rpc</span> <span class="token function">SayHello</span><span class="token punctuation">(</span><span class="token class-name">HelloRequest</span><span class="token punctuation">)</span> <span class="token keyword">returns</span> <span class="token punctuation">(</span><span class="token class-name">HelloReply</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5728\u5F53\u524D\u76EE\u5F55\u67E5\u627E\u5F53\u524D<code>xxx.proto</code>\u751F\u6210\u6587\u4EF6\u5230\u5F53\u524D\u76EE\u5F55</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>protoc -I ./ --go_out<span class="token operator">=</span>./ --go-grpc_out<span class="token operator">=</span>. helloworld.proto
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u670D\u52A1\u7AEF\u4EE3\u7801</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> server

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;context&quot;</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;google.golang.org/grpc&quot;</span>
	<span class="token string">&quot;grpc_demo/proto&quot;</span>
	<span class="token string">&quot;net&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">type</span> Server <span class="token keyword">struct</span><span class="token punctuation">{</span>
	proto<span class="token punctuation">.</span>UnimplementedGreeterServer
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token punctuation">(</span>s <span class="token operator">*</span>Server<span class="token punctuation">)</span> <span class="token function">SayHello</span><span class="token punctuation">(</span>ctx context<span class="token punctuation">.</span>Context<span class="token punctuation">,</span> req <span class="token operator">*</span>proto<span class="token punctuation">.</span>HelloRequest<span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token operator">*</span>proto<span class="token punctuation">.</span>HelloReply<span class="token punctuation">,</span> <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">return</span> <span class="token operator">&amp;</span>proto<span class="token punctuation">.</span>HelloReply<span class="token punctuation">{</span>
		Message<span class="token punctuation">:</span> <span class="token string">&quot;\u4F60\u597D&quot;</span> <span class="token operator">+</span> req<span class="token punctuation">.</span>Name<span class="token punctuation">,</span>
	<span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token boolean">nil</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span>
	g <span class="token operator">:=</span> grpc<span class="token punctuation">.</span><span class="token function">NewServer</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	proto<span class="token punctuation">.</span><span class="token function">RegisterGreeterServer</span><span class="token punctuation">(</span>g<span class="token punctuation">,</span> <span class="token operator">&amp;</span>Server<span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">)</span>
	lis<span class="token punctuation">,</span> err <span class="token operator">:=</span> net<span class="token punctuation">.</span><span class="token function">Listen</span><span class="token punctuation">(</span><span class="token string">&quot;tcp&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;0.0.0.0:8080&quot;</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;failed to listen: %v&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	err <span class="token operator">=</span> g<span class="token punctuation">.</span><span class="token function">Serve</span><span class="token punctuation">(</span>lis<span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Printf</span><span class="token punctuation">(</span><span class="token string">&quot;failed to serve: %v&quot;</span><span class="token punctuation">,</span> err<span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,9);function R(S,P){const e=p("ExternalLinkIcon");return c(),l("div",null,[r,u,n("p",null,[d,n("a",k,[v,o(e)])]),m,n("p",null,[n("a",b,[g,o(e)])]),h,n("ul",null,[_,n("li",null,[n("p",null,[y,n("a",f,[w,o(e)]),q]),x])]),H])}var G=t(i,[["render",R],["__file","grpc-protobuf.html.vue"]]);export{G as default};
