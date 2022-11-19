import{_ as i}from"./plugin-vue_export-helper.21dcd24c.js";import{r as l,o as t,c,a as n,b as e,d as s,e as o}from"./app.bbed4eea.js";const r={},p={href:"https://github.com/zeromicro/go-zero",target:"_blank",rel:"noopener noreferrer"},d=s("go-zero github \u5730\u5740"),u={href:"https://github.com/zeromicro/go-zero/blob/master/readme-cn.md",target:"_blank",rel:"noopener noreferrer"},v=s("\u4E2D\u6587\u4ECB\u7ECD"),m={href:"https://go-zero.dev/cn/",target:"_blank",rel:"noopener noreferrer"},g=s("\u6587\u6863\u5730\u5740"),b=o(`<h2 id="\u5B89\u88C5-goctl-\u5DE5\u5177" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-goctl-\u5DE5\u5177" aria-hidden="true">#</a> \u5B89\u88C5 goctl \u5DE5\u5177</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># Go 1.15 \u53CA\u4E4B\u524D\u7248\u672C</span>
<span class="token assign-left variable">GO111MODULE</span><span class="token operator">=</span>on <span class="token assign-left variable">GOPROXY</span><span class="token operator">=</span>https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero/tools/goctl@latest

<span class="token comment"># Go 1.16 \u53CA\u4EE5\u540E\u7248\u672C</span>
<span class="token assign-left variable">GOPROXY</span><span class="token operator">=</span>https://goproxy.cn/,direct go <span class="token function">install</span> github.com/zeromicro/go-zero/tools/goctl@latest

<span class="token comment"># For Mac</span>
brew <span class="token function">install</span> goctl

<span class="token comment"># docker for amd64 architecture</span>
<span class="token function">docker</span> pull kevinwan/goctl
<span class="token comment"># run goctl like</span>
<span class="token function">docker</span> run --rm -it -v <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>:/app kevinwan/goctl goctl --help

<span class="token comment"># docker for arm64 (M1) architecture</span>
<span class="token function">docker</span> pull kevinwan/goctl:latest-arm64
<span class="token comment"># run goctl like</span>
<span class="token function">docker</span> run --rm -it -v <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>:/app kevinwan/goctl:latest-arm64 goctl --help
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5B89\u88C5\u7ED3\u679C\u9A8C\u8BC1</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C goctl -v
goctl version <span class="token number">1.3</span>.8 darwin/arm64
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">windows \u7528\u6237</p><p><code>windows</code>\u7528\u6237\u9700\u8981\u81EA\u5DF1\u6DFB\u52A0\u73AF\u5883\u53D8\u91CF</p></div><h2 id="\u5B89\u88C5-protoc-protoc-gen-go" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-protoc-protoc-gen-go" aria-hidden="true">#</a> \u5B89\u88C5 protoc &amp; protoc-gen-go</h2><p>\u5B89\u88C5\u65B9\u5F0F\u6587\u6863\u4E0A\u90FD\u6709\uFF0C\u8FD9\u91CC\u642C\u4E00\u4E0B</p><h3 id="\u65B9\u5F0F-1-goctl-\u4E00\u952E\u5B89\u88C5" tabindex="-1"><a class="header-anchor" href="#\u65B9\u5F0F-1-goctl-\u4E00\u952E\u5B89\u88C5" aria-hidden="true">#</a> \u65B9\u5F0F 1\uFF1Agoctl \u4E00\u952E\u5B89\u88C5</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>$ goctl <span class="token function">env</span> check -i -f --verbose
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: preparing to check <span class="token function">env</span>

<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: looking up <span class="token string">&quot;protoc&quot;</span>
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: <span class="token string">&quot;protoc&quot;</span> is not found <span class="token keyword">in</span> <span class="token environment constant">PATH</span>
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: preparing to <span class="token function">install</span> <span class="token string">&quot;protoc&quot;</span>
<span class="token string">&quot;protoc&quot;</span> installed from cache
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: <span class="token string">&quot;protoc&quot;</span> is already installed <span class="token keyword">in</span> <span class="token string">&quot;/Users/keson/go/bin/protoc&quot;</span>

<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: looking up <span class="token string">&quot;protoc-gen-go&quot;</span>
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: <span class="token string">&quot;protoc-gen-go&quot;</span> is not found <span class="token keyword">in</span> <span class="token environment constant">PATH</span>
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: preparing to <span class="token function">install</span> <span class="token string">&quot;protoc-gen-go&quot;</span>
<span class="token string">&quot;protoc-gen-go&quot;</span> installed from cache
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: <span class="token string">&quot;protoc-gen-go&quot;</span> is already installed <span class="token keyword">in</span> <span class="token string">&quot;/Users/keson/go/bin/protoc-gen-go&quot;</span>

<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: looking up <span class="token string">&quot;protoc-gen-go-grpc&quot;</span>
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: <span class="token string">&quot;protoc-gen-go-grpc&quot;</span> is not found <span class="token keyword">in</span> <span class="token environment constant">PATH</span>
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: preparing to <span class="token function">install</span> <span class="token string">&quot;protoc-gen-go-grpc&quot;</span>
<span class="token string">&quot;protoc-gen-go-grpc&quot;</span> installed from cache
<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: <span class="token string">&quot;protoc-gen-go-grpc&quot;</span> is already installed <span class="token keyword">in</span> <span class="token string">&quot;/Users/keson/go/bin/protoc-gen-go-grpc&quot;</span>

<span class="token punctuation">[</span>goctl-env<span class="token punctuation">]</span>: congratulations<span class="token operator">!</span> your goctl environment is ready<span class="token operator">!</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u65B9\u5F0F-2-homebrew" tabindex="-1"><a class="header-anchor" href="#\u65B9\u5F0F-2-homebrew" aria-hidden="true">#</a> \u65B9\u5F0F 2\uFF1AHomeBrew</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>$ brew <span class="token function">install</span> protobuf protoc-gen-go protoc-gen-go-grpc
$ protoc --version
libprotoc x.x.x
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u65B9\u5F0F-3-\u6E90\u6587\u4EF6\u5B89\u88C5" tabindex="-1"><a class="header-anchor" href="#\u65B9\u5F0F-3-\u6E90\u6587\u4EF6\u5B89\u88C5" aria-hidden="true">#</a> \u65B9\u5F0F 3\uFF1A\u6E90\u6587\u4EF6\u5B89\u88C5</h3><h4 id="proto-\u5B89\u88C5" tabindex="-1"><a class="header-anchor" href="#proto-\u5B89\u88C5" aria-hidden="true">#</a> proto \u5B89\u88C5</h4>`,13),k=s("\u8FDB\u5165"),h={href:"https://github.com/protocolbuffers/protobuf/releases",target:"_blank",rel:"noopener noreferrer"},f=s("protobuf release"),_=s(" \u9875\u9762\uFF0C\u9009\u62E9\u9002\u5408\u81EA\u5DF1\u64CD\u4F5C\u7CFB\u7EDF\u7684\u538B\u7F29\u5305\u6587\u4EF6"),q=o(`<li><p>\u89E3\u538B<code>protoc-x.x.x-osx-x86_64.zip</code>\u5E76\u8FDB\u5165<code>protoc-x.x.x-osx-x86_64</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> protoc-x.x.x-osx-x86_64/bin
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>\u5C06\u542F\u52A8\u7684<code>protoc</code>\u4E8C\u8FDB\u5236\u6587\u4EF6\u79FB\u52A8\u5230\u88AB\u6DFB\u52A0\u5230\u73AF\u5883\u53D8\u91CF\u7684\u4EFB\u610F path \u4E0B\uFF0C\u5982<code>$GOPATH/bin</code>\uFF0C\u8FD9\u91CC\u4E0D\u5EFA\u8BAE\u76F4\u63A5\u5C06\u5176\u548C\u7CFB\u7EDF\u7684\u4EE5\u4E0B path \u653E\u5728\u4E00\u8D77\u3002</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">mv</span> protoc <span class="token variable">$GOPATH</span>/bin
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p><code>$GOPATH</code>\u4E3A\u4F60\u672C\u673A\u7684\u5B9E\u9645\u6587\u4EF6\u5939\u5730\u5740</p></div></li><li><p>\u9A8C\u8BC1\u5B89\u88C5\u7ED3\u679C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C protoc --version
libprotoc <span class="token number">3.15</span>.6
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div></li>`,3),x=o(`<h4 id="proto-gen-go-proto-gen-go-grpc-\u5B89\u88C5" tabindex="-1"><a class="header-anchor" href="#proto-gen-go-proto-gen-go-grpc-\u5B89\u88C5" aria-hidden="true">#</a> Proto-gen-go/proto-gen-go-grpc \u5B89\u88C5</h4><ul><li><p>\u4E0B\u8F7D\u5B89\u88C5<code>protoc-gen-go</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>go <span class="token function">install</span> google.golang.org/protobuf/cmd/protoc-gen-go@latest
go <span class="token function">install</span> google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div></li></ul><h3 id="\u4E00\u4E9B\u5E38\u7528\u7684goctl\u811A\u672C" tabindex="-1"><a class="header-anchor" href="#\u4E00\u4E9B\u5E38\u7528\u7684goctl\u811A\u672C" aria-hidden="true">#</a> \u4E00\u4E9B\u5E38\u7528\u7684<code>goctl</code>\u811A\u672C</h3>`,3),y={href:"https://github.com/Mikaelemmmm/go-zero-looklook/blob/main/deploy/script/gencode/gen.sh",target:"_blank",rel:"noopener noreferrer"},w=s("\u5927\u4F6C\u63D0\u4F9B\u7684\u5730\u5740"),z=o(`<div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code># \u751F\u6210api\u4E1A\u52A1\u4EE3\u7801 \uFF0C \u8FDB\u5165&quot;\u670D\u52A1/cmd/api/desc&quot;\u76EE\u5F55\u4E0B\uFF0C\u6267\u884C\u4E0B\u9762\u547D\u4EE4
# goctl api go -api *.api -dir ../  --style=goZero

# \u751F\u6210rpc\u4E1A\u52A1\u4EE3\u7801
# \u3010\u6CE8\u3011 \u9700\u8981\u5B89\u88C5\u4E0B\u97623\u4E2A\u63D2\u4EF6
#       protoc &gt;= 3.13.0 \uFF0C \u5982\u679C\u6CA1\u5B89\u88C5\u8BF7\u5148\u5B89\u88C5 https://github.com/protocolbuffers/protobuf\uFF0C\u4E0B\u8F7D\u89E3\u538B\u5230$GOPATH/bin\u4E0B\u5373\u53EF\uFF0C\u524D\u63D0\u662F$GOPATH/bin\u5DF2\u7ECF\u52A0\u5165$PATH\u4E2D
#       protoc-gen-go \uFF0C\u5982\u679C\u6CA1\u6709\u5B89\u88C5\u8BF7\u5148\u5B89\u88C5 go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
#       protoc-gen-go-grpc  \uFF0C\u5982\u679C\u6CA1\u6709\u5B89\u88C5\u8BF7\u5148\u5B89\u88C5 go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
#
#       \u5982\u679C\u6709\u8981\u4F7F\u7528grpc-gateway\uFF0C\u4E5F\u8BF7\u5B89\u88C5\u5982\u4E0B\u4E24\u4E2A\u63D2\u4EF6 , \u6CA1\u6709\u4F7F\u7528\u5C31\u5FFD\u7565\u4E0B\u97622\u4E2A\u63D2\u4EF6
#       go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@latest
#       go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2@latest
#
# 1\uFF09goctl &gt;= 1.3 \u8FDB\u5165&quot;\u670D\u52A1/cmd/rpc/pb&quot;\u76EE\u5F55\u4E0B\uFF0C\u6267\u884C\u4E0B\u9762\u547D\u4EE4
#    goctl rpc protoc *.proto --go_out=../ --go-grpc_out=../  --zrpc_out=../ --style=goZero
#    \u53BB\u9664proto\u4E2D\u7684json\u7684omitempty
#    mac: sed -i &quot;&quot; &#39;s/,omitempty//g&#39; *.pb.go
#    linux: sed -i &#39;s/,omitempty//g&#39; *.pb.go
# 2\uFF09goctl &lt; 1.3 \u8FDB\u5165&quot;\u670D\u52A1/cmd&quot;\u76EE\u5F55\u4E0B\uFF0C\u6267\u884C\u4E0B\u9762\u547D\u4EE4
#    goctl rpc proto -src rpc/pb/*.proto -dir ./rpc --style=goZero
#    \u53BB\u9664proto\u4E2D\u7684json\u7684omitempty
#    mac: sed -i &quot;&quot; &#39;s/,omitempty//g&#39;  ./rpc/pb/*.pb.go
#    linux: sed -i &#39;s/,omitempty//g&#39;  ./rpc/pb/*.pb.go



# \u521B\u5EFAkafka\u7684topic
# kafka-topics.sh --create --zookeeper zookeeper:2181 --replication-factor 1 -partitions 1 --topic {topic}
# \u67E5\u770B\u6D88\u8D39\u8005\u7EC4\u60C5\u51B5
# kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group {group}
# \u547D\u4EE4\u884C\u6D88\u8D39
# ./kafka-console-consumer.sh  --bootstrap-server kafka:9092  --topic looklook-log   --from-beginning
# \u547D\u4EE4\u751F\u4EA7
# ./kafka-console-producer.sh --bootstrap-server kafka:9092 --topic second
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C goctl -h
A cli tool to generate api, zrpc, model code

Usage:
  goctl <span class="token punctuation">[</span>command<span class="token punctuation">]</span>

Available Commands:
  api         Generate api related files
  bug         Report a bug
  completion  Generate the autocompletion script <span class="token keyword">for</span> the specified shell
  <span class="token function">docker</span>      Generate Dockerfile
  <span class="token function">env</span>         Check or edit goctl environment
  <span class="token builtin class-name">help</span>        Help about any <span class="token builtin class-name">command</span>
  kube        Generate kubernetes files
  migrate     Migrate from tal-tech to zeromicro
  model       Generate model code
  quickstart  quickly start a project
  rpc         Generate rpc code
  template    Template operation
  upgrade     Upgrade goctl to latest version
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="api-\u8BED\u6CD5\u4ECB\u7ECD" tabindex="-1"><a class="header-anchor" href="#api-\u8BED\u6CD5\u4ECB\u7ECD" aria-hidden="true">#</a> api \u8BED\u6CD5\u4ECB\u7ECD</h3>`,3),G={href:"https://go-zero.dev/cn/docs/design/grammar",target:"_blank",rel:"noopener noreferrer"},$=s("\u5B98\u7F51\u5730\u5740"),U=o(`<p><code>user.api</code>\u4F7F\u7528\u6848\u4F8B</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token comment">/**
 * api\u8BED\u6CD5\u793A\u4F8B\u53CA\u8BED\u6CD5\u8BF4\u660E
 */</span>

<span class="token comment">// api\u8BED\u6CD5\u7248\u672C</span>
syntax <span class="token operator">=</span> <span class="token string">&quot;v1&quot;</span>

<span class="token function">info</span><span class="token punctuation">(</span>
    author<span class="token punctuation">:</span> <span class="token string">&quot;wxvirus&quot;</span>
    date<span class="token punctuation">:</span>   <span class="token string">&quot;2022-06-12&quot;</span>
    desc<span class="token punctuation">:</span>   <span class="token string">&quot;api\u8BED\u6CD5\u793A\u4F8B\u53CA\u8BED\u6CD5\u8BF4\u660E&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">type</span> <span class="token punctuation">(</span>
	UserInfoReq <span class="token punctuation">{</span>
		UserId <span class="token builtin">int64</span> <span class="token string">\`json:&quot;userId&quot;\`</span>
	<span class="token punctuation">}</span>
	UserInfoResp <span class="token punctuation">{</span>
		UserId <span class="token builtin">int64</span> <span class="token string">\`json:&quot;userId&quot;\`</span>
		Nickname <span class="token builtin">string</span> <span class="token string">\`json:&quot;nickname&quot;\`</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">)</span>

service user<span class="token operator">-</span>api<span class="token punctuation">{</span>
    @doc <span class="token string">&quot;\u83B7\u53D6\u7528\u6237\u4FE1\u606F&quot;</span>
    @handler userInfo
    post <span class="token operator">/</span>user<span class="token operator">/</span>info <span class="token punctuation">(</span>UserInfoReq<span class="token punctuation">)</span> returns <span class="token punctuation">(</span>UserInfoResp<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u751F\u6210\u7684\u8BDD\uFF0C\u6211\u4EEC\u90A3\u53EF\u4EE5\u4F7F\u7528<code>alias</code>\u6765\u7B80\u5199</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> ~/.zshrc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">alias</span> <span class="token assign-left variable">apigen</span><span class="token operator">=</span><span class="token string">&quot;goctl api go -api *.api -dir ../  --style=goZero&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u4FDD\u5B58\u4E4B\u540E\u4F7F\u4E4B\u751F\u6548\uFF1A<code>source ~/.zshrc</code></p><p>\u9ED8\u8BA4\u4F7F\u7528\u793A\u4F8B\uFF0C\u8FDB\u5165\u5230\u5BF9\u5E94\u76EE\u5F55</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C goctl api go -api *.api -dir <span class="token punctuation">..</span>/  --style<span class="token operator">=</span>goZero
Done.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220612104801.png" alt="\u751F\u6210\u4EE3\u7801\u5185\u5BB9" loading="lazy"></p><p>\u7136\u540E\u53EF\u4EE5\u76F4\u63A5\u8FDB\u5165\u6839\u76EE\u5F55\u4F7F\u7528\u547D\u4EE4\u4E0B\u8F7D\u4F9D\u8D56\u4E86</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>go mod tidy
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u8FD9\u6837\u4F1A\u81EA\u52A8\u5E2E\u4F60\u4E0B\u8F7D<code>go-zero</code></p>`,12),I={href:"https://gocn.vip/topics/xQJ3X6cbwY",target:"_blank",rel:"noopener noreferrer"},O=s("\u6700\u7B80\u5355\u7684 Go Dockerfile \u7F16\u5199\u59FF\u52BF"),P=o(`<div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C goctl <span class="token function">docker</span> -go user.go
Hint: run <span class="token string">&quot;docker build ...&quot;</span> <span class="token builtin class-name">command</span> <span class="token keyword">in</span> dir:
    /Users/wangxin/GolangProjects/src/github.com/sword-demon/zero-demo
Done.

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1),H={href:"https://gocn.vip/topics/rw8KO7cXQG",target:"_blank",rel:"noopener noreferrer"},M=s("\u6700\u7B80\u5355\u7684 K8S \u90E8\u7F72\u6587\u4EF6\u7F16\u5199\u59FF\u52BF"),R=o(`<div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C goctl kube deploy -name user-api -namespace go-zero-demo -image user-api:v1.0 -o user-api.yaml -port <span class="token number">1001</span> -nodePort <span class="token number">31001</span>
Done.

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u7F16\u5199-rpc-\u5B9E\u4F8B" tabindex="-1"><a class="header-anchor" href="#\u7F16\u5199-rpc-\u5B9E\u4F8B" aria-hidden="true">#</a> \u7F16\u5199 rpc \u5B9E\u4F8B</h3><p><code>zero-demo/user-rpc/pb</code></p><div class="language-protobuf ext-protobuf line-numbers-mode"><pre class="language-protobuf"><code><span class="token keyword">syntax</span> <span class="token operator">=</span> <span class="token string">&quot;proto3&quot;</span><span class="token punctuation">;</span>

<span class="token comment">//  \u8FD9\u4E2A\u73B0\u5728\u5FC5\u987B\u5199 \u800C\u4E14\u8FD8\u5F97\u5E26\u70B9\u8DEF\u5F84</span>
<span class="token keyword">option</span> go_package <span class="token operator">=</span> <span class="token string">&quot;./pb&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">package</span> pb<span class="token punctuation">;</span>

<span class="token keyword">message</span> <span class="token class-name">GetUserInfoReq</span> <span class="token punctuation">{</span>
    <span class="token builtin">int64</span>  id <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">message</span> <span class="token class-name">GetUserInfoResp</span> <span class="token punctuation">{</span>
    <span class="token builtin">int64</span> id <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token builtin">string</span> nickname <span class="token operator">=</span> <span class="token number">2</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">//service</span>
<span class="token keyword">service</span> <span class="token class-name">usercenter</span> <span class="token punctuation">{</span>
    <span class="token keyword">rpc</span> <span class="token function">getUserInfo</span><span class="token punctuation">(</span><span class="token class-name">GetUserInfoReq</span><span class="token punctuation">)</span> <span class="token keyword">returns</span> <span class="token punctuation">(</span><span class="token class-name">GetUserInfoResp</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u751F\u6210\u4EE3\u7801\u7684\u8BDD\uFF0C\u6211\u4EEC\u8FD8\u662F\u4F7F\u7528<code>alias</code>\u53BB\u6DFB\u52A0\u5FEB\u6377\u65B9\u5F0F</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">alias</span> <span class="token assign-left variable">rpcgen</span><span class="token operator">=</span><span class="token string">&quot;goctl rpc protoc *.proto --go_out=../ --go-grpc_out=../  --zrpc_out=../ --style=goZeros&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C rpcgen
Done.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220612112931.png" alt="\u751F\u6210\u7684\u4EE3\u7801" loading="lazy"></p><h3 id="\u5FEB\u901F\u751F\u6210\u6A21\u578B" tabindex="-1"><a class="header-anchor" href="#\u5FEB\u901F\u751F\u6210\u6A21\u578B" aria-hidden="true">#</a> \u5FEB\u901F\u751F\u6210\u6A21\u578B</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token shebang important">#!/usr/bin/env bash</span>

<span class="token comment"># \u4F7F\u7528\u65B9\u6CD5\uFF1A</span>
<span class="token comment"># ./genModel.sh usercenter user</span>
<span class="token comment"># ./genModel.sh usercenter user_auth</span>
<span class="token comment"># \u518D\u5C06./genModel\u4E0B\u7684\u6587\u4EF6\u526A\u5207\u5230\u5BF9\u5E94\u670D\u52A1\u7684model\u76EE\u5F55\u91CC\u9762\uFF0C\u8BB0\u5F97\u6539package</span>


<span class="token comment">#\u751F\u6210\u7684\u8868\u540D</span>
<span class="token assign-left variable">tables</span><span class="token operator">=</span><span class="token variable">$2</span>
<span class="token comment">#\u8868\u751F\u6210\u7684genmodel\u76EE\u5F55</span>
<span class="token assign-left variable">modeldir</span><span class="token operator">=</span>./genModel

<span class="token comment"># \u6570\u636E\u5E93\u914D\u7F6E</span>
<span class="token assign-left variable">host</span><span class="token operator">=</span><span class="token number">127.0</span>.0.1
<span class="token assign-left variable">port</span><span class="token operator">=</span><span class="token number">3306</span>
<span class="token assign-left variable">dbname</span><span class="token operator">=</span>looklook_<span class="token variable">$1</span>
<span class="token assign-left variable">username</span><span class="token operator">=</span>root
<span class="token assign-left variable">passwd</span><span class="token operator">=</span><span class="token number">1</span>


<span class="token builtin class-name">echo</span> <span class="token string">&quot;\u5F00\u59CB\u521B\u5EFA\u5E93\uFF1A<span class="token variable">$dbname</span> \u7684\u8868\uFF1A<span class="token variable">$2</span>&quot;</span>
goctl model mysql datasource -url<span class="token operator">=</span><span class="token string">&quot;<span class="token variable">\${username}</span>:<span class="token variable">\${passwd}</span>@tcp(<span class="token variable">\${host}</span>:<span class="token variable">\${port}</span>)/<span class="token variable">\${dbname}</span>&quot;</span> -table<span class="token operator">=</span><span class="token string">&quot;<span class="token variable">\${tables}</span>&quot;</span>  -dir<span class="token operator">=</span><span class="token string">&quot;<span class="token variable">\${modeldir}</span>&quot;</span> -cache<span class="token operator">=</span>true --style<span class="token operator">=</span>goZero
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>\u279C <span class="token function">sh</span> genModel.sh order homestay_order
\u5F00\u59CB\u521B\u5EFA\u5E93\uFF1Alooklook_order \u7684\u8868\uFF1Ahomestay_order
Done.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,11),A={href:"https://github.com/Mikaelemmmm/go-zero-looklook/blob/main/deploy/sql/looklook_order.sql",target:"_blank",rel:"noopener noreferrer"},T=s("sql \u8D44\u6E90\u5730\u5740"),D=o(`<h2 id="\u5B89\u88C5-go-zero" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-go-zero" aria-hidden="true">#</a> \u5B89\u88C5 go-zero</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token assign-left variable">GO111MODULE</span><span class="token operator">=</span>on <span class="token assign-left variable">GOPROXY</span><span class="token operator">=</span>https://goproxy.cn/,direct go get -u github.com/zeromicro/go-zero
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,2);function Z(j,E){const a=l("ExternalLinkIcon");return t(),c("div",null,[n("p",null,[n("a",p,[d,e(a)])]),n("p",null,[n("a",u,[v,e(a)])]),n("p",null,[n("a",m,[g,e(a)])]),b,n("ul",null,[n("li",null,[n("p",null,[k,n("a",h,[f,e(a)]),_])]),q]),x,n("p",null,[n("a",y,[w,e(a)])]),z,n("p",null,[n("a",G,[$,e(a)])]),U,n("p",null,[n("a",I,[O,e(a)])]),P,n("p",null,[n("a",H,[M,e(a)])]),R,n("p",null,[n("a",A,[T,e(a)])]),D])}var B=i(r,[["render",Z],["__file","go-zero\u73AF\u5883\u642D\u5EFA.html.vue"]]);export{B as default};
