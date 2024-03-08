import{_ as a}from"./plugin-vue_export-helper.21dcd24c.js";import{r as e,o as i,c as l,b as c,e as n}from"./app.5e4f352e.js";const p={},d=n(`<h1 id="elf-\u53EF\u6267\u884C\u6587\u4EF6\u7684\u88C5\u8F7D\u4E0E\u6267\u884C" tabindex="-1"><a class="header-anchor" href="#elf-\u53EF\u6267\u884C\u6587\u4EF6\u7684\u88C5\u8F7D\u4E0E\u6267\u884C" aria-hidden="true">#</a> ELF \u53EF\u6267\u884C\u6587\u4EF6\u7684\u88C5\u8F7D\u4E0E\u6267\u884C</h1><h2 id="\u7A0B\u5E8F\u7684\u542F\u52A8\u8FC7\u7A0B" tabindex="-1"><a class="header-anchor" href="#\u7A0B\u5E8F\u7684\u542F\u52A8\u8FC7\u7A0B" aria-hidden="true">#</a> \u7A0B\u5E8F\u7684\u542F\u52A8\u8FC7\u7A0B</h2><p>\u6848\u4F8B\u4EE3\u7801\uFF1A</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;time&quot;</span>

<span class="token keyword">var</span> a <span class="token operator">=</span> <span class="token number">300</span>
<span class="token keyword">var</span> b <span class="token operator">=</span> <span class="token number">300</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">for</span> <span class="token punctuation">{</span>
		time<span class="token punctuation">.</span><span class="token function">Sleep</span><span class="token punctuation">(</span>time<span class="token punctuation">.</span>Second <span class="token operator">*</span> <span class="token number">10</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6211\u4EEC\u5C06\u4EE3\u7801\u4F20\u5230<code>Linux</code>\u670D\u52A1\u5668\uFF0C\u7136\u540E\u5BF9\u8FD9\u6BB5\u4EE3\u7801\u8FDB\u884C\u7F16\u8BD1\uFF1A<code>go build demo1.go</code></p><p>\u6211\u4EEC\u4F7F\u7528<code>echo $$</code>\u6765\u67E5\u770B\u5F53\u524D<code>Linux</code>\u7684\u63A7\u5236\u8FDB\u7A0B\uFF0C\u4E5F\u5C31\u662F<code>bash</code>\u8FDB\u7A0B\u6216\u8005<code>sh</code>\u8FDB\u7A0B\u3002</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos base<span class="token punctuation">]</span><span class="token comment"># echo $$</span>
<span class="token number">11885</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7F16\u8BD1\u540E\u67E5\u770B\u6587\u4EF6\u7C7B\u578B\u662F\u4E00\u4E2A\u9759\u6001\u94FE\u63A5\u3002</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos base<span class="token punctuation">]</span><span class="token comment"># file demo1</span>
demo1: ELF <span class="token number">64</span>-bit LSB executable, x86-64, version <span class="token number">1</span> <span class="token punctuation">(</span>SYSV<span class="token punctuation">)</span>, statically linked, not stripped
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4F7F\u7528<code>strace</code>\u547D\u4EE4\u6765\u8DDF\u8E2A\u63A7\u5236\u8FDB\u7A0B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">strace</span> -f -s <span class="token number">65000</span> -i -t -e <span class="token assign-left variable">trace</span><span class="token operator">=</span>read,clone,fork,execve,wait4 -p <span class="token number">11885</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221126131438412.png" alt="image-20221126131438412" loading="lazy"></p><ol><li><p>\u63A7\u5236\u8FDB\u7A0B\u8C03\u7528<code>read</code>\u51FD\u6570\u63A5\u6536<code>./demo1</code>\u6570\u636E</p></li><li><p>\u63A7\u5236\u8FDB\u7A0B\u8C03\u7528<code>clone</code>\u51FD\u6570\u521B\u5EFA\u4E00\u4E2A\u8FDB\u7A0B\u5E76\u5206\u914D\u597D\u865A\u62DF\u5730\u5740\u7A7A\u95F4</p></li><li><p>\u65B0\u5B50\u8FDB\u7A0B\u8C03\u7528<code>execve</code>\u52A0\u8F7D<code>demo1</code>\u7A0B\u5E8F\u3010ELF \u53EF\u6267\u884C\u6587\u4EF6\uFF0C\u7A0B\u5E8F\u6307\u4EE4 + \u7A0B\u5E8F\u6570\u636E\u3011\u52A0\u8F7D\u5230\u5185\u5B58\u4E2D\u53BB\u6267\u884C</p><blockquote><p>\u52A0\u8F7D\u65F6\uFF0C\u5B83\u5E76\u4E0D\u662F\u5168\u90E8\u52A0\u8F7D\u6240\u6709\u7684\u6307\u4EE4\u548C\u6570\u636E\uFF0C\u5B83\u5728\u52A0\u8F7D\u65F6\uFF0C\u64CD\u4F5C\u7CFB\u7EDF\u4F1A\u5148\u628A\u8FDB\u7A0B\u7684\u865A\u62DF\u5730\u5740\u7A7A\u95F4\u6309\u9875\u5206\u5272\uFF0C\u540C\u65F6\u4E5F\u4F1A\u628A\u7269\u7406\u5185\u5B58\u4E5F\u6309\u9875\u5206\u5272\uFF0C\u4E5F\u628A\u78C1\u76D8\u6309\u9875\u5206\u5272\u3002</p></blockquote><ol><li>\u521B\u5EFA\u597D\u865A\u62DF\u5730\u5740\u7A7A\u95F4</li><li>\u8BFB\u53D6 ELF \u53EF\u6267\u884C\u6587\u4EF6\u4FE1\u606F\uFF0C\u5E76\u4E14\u5EFA\u7ACB\u6620\u5C04\u5173\u7CFB\u3010\u628A ELF \u6587\u4EF6\u7684 VMA \u548C\u8FDB\u7A0B\u7684\u865A\u62DF\u5730\u5740\u7A7A\u95F4\u5EFA\u7ACB\u6620\u5C04\u5173\u7CFB\u3011</li><li>\u627E\u5230\u53EF\u6267\u884C\u7A0B\u5E8F\u7684\u5165\u53E3\u5730\u5740\uFF0C\u5F00\u59CB\u6267\u884C</li></ol></li></ol><p>\u4F7F\u7528<code>pstree -ap</code>\u6765\u67E5\u770B\u8FDB\u7A0B\u7236\u5B50\u5173\u7CFB</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>  \u251C\u2500sshd,1112 -D
  \u2502   \u251C\u2500sshd,11857
  \u2502   \u2502   \u2514\u2500bash,11885
  \u2502   \u2502       \u2514\u2500demo1,15602
  \u2502   \u2502           \u251C\u2500<span class="token punctuation">{</span>demo1<span class="token punctuation">}</span>,15603
  \u2502   \u2502           \u251C\u2500<span class="token punctuation">{</span>demo1<span class="token punctuation">}</span>,15604
  \u2502   \u2502           \u2514\u2500<span class="token punctuation">{</span>demo1<span class="token punctuation">}</span>,15605

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /proc/15602
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7136\u540E\u67E5\u770B\u8FDB\u7A0B\u7684\u865A\u62DF\u5730\u5740\u7A7A\u95F4\u3010\u8FDB\u7A0B\u5185\u5B58\u5E03\u5C40\u3011</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos <span class="token number">15602</span><span class="token punctuation">]</span><span class="token comment"># cat maps</span>
\u5730\u5740\u8303\u56F4		   \u6743\u9650  dev      <span class="token function">node</span>                                     \u6240\u6620\u5C04\u7684\u6587\u4EF6
00400000-00458000 r-xp 00000000 fd:01 <span class="token number">797257</span>                             /data/work/gopath/src/te/base/demo1  <span class="token comment"># \u6620\u5C04\u7684\u6587\u4EF6 \u4EE3\u7801\u6BB5 VMA\u4EE3\u7801\u6BB5</span>
00458000-004bf000 r--p 00058000 fd:01 <span class="token number">797257</span>                             /data/work/gopath/src/te/base/demo1 <span class="token comment"># \u53EA\u8BFB\u6570\u636E\u6BB5 VMA\u53EA\u8BFB</span>
004bf000-004c4000 rw-p 000bf000 fd:01 <span class="token number">797257</span>                             /data/work/gopath/src/te/base/demo1 <span class="token comment"># \u8BFB\u5199\u6570\u636E\u6BB5 VMA\u8BFB\u5199</span>
004c4000-004f7000 rw-p 00000000 00:00 <span class="token number">0</span>
c000000000-c000400000 rw-p 00000000 00:00 <span class="token number">0</span>
c000400000-c004000000 ---p 00000000 00:00 <span class="token number">0</span>
7fb351003000-7fb353374000 rw-p 00000000 00:00 <span class="token number">0</span>
7fb353374000-7fb3634f4000 ---p 00000000 00:00 <span class="token number">0</span>
7fb3634f4000-7fb3634f5000 rw-p 00000000 00:00 <span class="token number">0</span>
7fb3634f5000-7fb3753a4000 ---p 00000000 00:00 <span class="token number">0</span>
7fb3753a4000-7fb3753a5000 rw-p 00000000 00:00 <span class="token number">0</span>
7fb3753a5000-7fb37777a000 ---p 00000000 00:00 <span class="token number">0</span>
7fb37777a000-7fb37777b000 rw-p 00000000 00:00 <span class="token number">0</span>
7fb37777b000-7fb377bf4000 ---p 00000000 00:00 <span class="token number">0</span>
7fb377bf4000-7fb377bf5000 rw-p 00000000 00:00 <span class="token number">0</span>
7fb377bf5000-7fb377c74000 ---p 00000000 00:00 <span class="token number">0</span>
7fb377c74000-7fb377cd4000 rw-p 00000000 00:00 <span class="token number">0</span>
7fff1538f000-7fff153b0000 rw-p 00000000 00:00 <span class="token number">0</span>                          <span class="token punctuation">[</span>stack<span class="token punctuation">]</span>  <span class="token comment"># VMA \u6808</span>
7fff153f9000-7fff153fb000 r-xp 00000000 00:00 <span class="token number">0</span>                          <span class="token punctuation">[</span>vdso<span class="token punctuation">]</span> <span class="token comment"># \u5185\u6838</span>
ffffffffff600000-ffffffffff601000 r-xp 00000000 00:00 <span class="token number">0</span>                  <span class="token punctuation">[</span>vsyscall<span class="token punctuation">]</span>	<span class="token comment"># \u7CFB\u7EDF\u8C03\u7528</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>VMA</code>\u5730\u5740\u8303\u56F4\uFF1A</p><ul><li>r: read</li><li>w: write</li><li>e:execute</li><li>p:private</li><li>s: \u5171\u4EAB share</li></ul><p>\u53EF\u4EE5\u4F7F\u7528<code>man proc</code>\u53BB\u67E5\u770B\u6587\u6863\uFF0C\u7136\u540E\u8F93\u5165<code>/maps</code>\u67E5\u627E</p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221126132528422.png" alt="image-20221126132528422" loading="lazy"></p><hr><p>\u4F7F\u7528<code>readelf -l demo1</code>\u6765\u67E5\u770B\u7A0B\u5E8F\u5934\u8868</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos base<span class="token punctuation">]</span><span class="token comment"># readelf -l demo1</span>

Elf <span class="token function">file</span> <span class="token builtin class-name">type</span> is EXEC <span class="token punctuation">(</span>Executable <span class="token function">file</span><span class="token punctuation">)</span>
Entry point 0x454b20
There are <span class="token number">7</span> program headers, starting at offset <span class="token number">64</span>

Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  PHDR           0x0000000000000040 0x0000000000400040 0x0000000000400040
                 0x0000000000000188 0x0000000000000188  R      <span class="token number">1000</span>
  NOTE           0x0000000000000f9c 0x0000000000400f9c 0x0000000000400f9c
                 0x0000000000000064 0x0000000000000064  R      <span class="token number">4</span>
  LOAD           0x0000000000000000 0x0000000000400000 0x0000000000400000
                 0x00000000000576ce 0x00000000000576ce  R E    <span class="token number">1000</span>
  LOAD           0x0000000000058000 0x0000000000458000 0x0000000000458000
                 0x0000000000066b20 0x0000000000066b20  R      <span class="token number">1000</span>
  LOAD           0x00000000000bf000 0x00000000004bf000 0x00000000004bf000
                 0x0000000000004020 0x0000000000037fa0  RW     <span class="token number">1000</span>
  GNU_STACK      0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000  RW     <span class="token number">8</span>
  LOOS+5041580   0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000         <span class="token number">8</span>

 Section to Segment mapping:
  Segment Sections<span class="token punctuation">..</span>.
   00
   01     .note.go.buildid
   02     .text .note.go.buildid
   03     .rodata .typelink .itablink .gosymtab .gopclntab
   04     .go.buildinfo .noptrdata .data .bss .noptrbss
   05
   06

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FDB\u7A0B\u7684\u5185\u5B58\u5E03\u5C40(\u9759\u6001\u94FE\u63A5\u6682\u65F6\u6CA1\u6709\u5806)</p>`,26),t=n(`<p>\u5F53\u7A0B\u5E8F\u542F\u52A8\u65F6\uFF0C\u4F1A\u521B\u5EFA\u4E00\u4E2A\u865A\u62DF\u5730\u5740\u7A7A\u95F4\u3010\u8FDB\u7A0B\u662F\u6709\u81EA\u5DF1\u7684\u865A\u62DF\u5730\u5740\u7A7A\u95F4\u3011\u540C\u65F6\u52A0\u8F7D ELF \u6587\u4EF6\u5E76\u8BFB\u53D6\u8BE5\u6587\u4EF6\u4FE1\u606F\uFF0C\u540C\u65F6\u5EFA\u7ACB\u6620\u5C04\u5173\u7CFB(<code>/proc/PID/maps</code>)</p><p>\u7A0B\u5E8F\u8981\u8FD0\u884C\uFF0C\u80AF\u5B9A\u662F\u8981\u628A\u7A0B\u5E8F\u6307\u4EE4\u548C\u7A0B\u5E8F\u6570\u636E\u52A0\u8F7D\u5230\u5185\u5B58\u4E2D\u624D\u53EF\u4EE5\u6267\u884C\u7684</p><ol><li><p>\u6211\u4EEC\u7684\u7269\u7406\u5185\u5B58\u662F\u6709\u9650\u7684</p></li><li><p>\u64CD\u4F5C\u7CFB\u7EDF\u542F\u52A8\u7684\u8FDB\u7A0B\u6570\u91CF\u662F\u975E\u5E38\u591A\u7684</p></li><li><p>\u6211\u4EEC\u7684\u8FDB\u7A0B\u4F7F\u7528\u7684\u5185\u5B58\u5927\u90E8\u5206\u60C5\u51B5\u4E0B\u662F\u4F1A\u8D85\u51FA\u7269\u7406\u5185\u5B58\u7684</p><ol><li>\u7269\u7406\u5730\u5740</li><li>\u865A\u62DF\u5730\u5740</li></ol></li></ol><h2 id="\u4EE3\u7801\u6BB5" tabindex="-1"><a class="header-anchor" href="#\u4EE3\u7801\u6BB5" aria-hidden="true">#</a> \u4EE3\u7801\u6BB5</h2><p>\u7A0B\u5E8F\u6E90\u7801</p><div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">var</span> a <span class="token operator">=</span> <span class="token number">300</span>
<span class="token keyword">var</span> b <span class="token operator">=</span> <span class="token number">300</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>a<span class="token punctuation">,</span> b<span class="token punctuation">)</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>a<span class="token punctuation">,</span> <span class="token operator">&amp;</span>b<span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7A0B\u5E8F\u6307\u4EE4\uFF0C\u53EA\u590D\u5236 2 \u884C\u51FA\u6765\u89E3\u6790\uFF0C\u592A\u591A\u4E86\uFF0C\u4F7F\u7528<code>objdump -s demo1 &gt; demo1.txt</code>\u5373\u53EF\u751F\u6210</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>401000 493b6610 76384883 ec184889 6c241048  I;f.v8H...H.l$.H
401010 8d6c2410 48894424 2048895c 24286690  .l$.H.D$ H.\\$(f.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><p><code>401000</code>go \u7F16\u8BD1\u5668\u7ED9\u53EF\u6267\u884C\u6587\u4EF6\u5206\u914D\u7684\u865A\u62DF\u5730\u5740\u3010\u5730\u5740\u504F\u79FB\u3011</p></li><li><p><code>493b6610 76384883 ec184889 6c241048</code>\u662F\u6307\u4EE4\u5185\u5BB9</p></li><li><p>\u6307\u4EE4\u5927\u5C0F\uFF1A\u4E00\u5806 4 \u4E2A\u5B57\u8282\uFF0C\u603B\u5171 16 \u4E2A\u5B57\u8282</p></li><li><p>\u6307\u4EE4\u5BF9\u5E94\u7684\u6C47\u7F16\u8BED\u53E5\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos base<span class="token punctuation">]</span><span class="token comment"># size demo1</span>
   text	   data	    bss	    dec	    hex	filename
<span class="token number">1093520</span>	  <span class="token number">97776</span>	 <span class="token number">213608</span>	<span class="token number">1404904</span>	 156fe8	demo1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5927\u5C0F\uFF1A1093520KB\uFF0C\u592A\u5927\uFF0C\u4E0D\u592A\u65B9\u4FBF\u770B\u3002</p><p>\u53EF\u4EE5\u4F7F\u7528</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos base<span class="token punctuation">]</span><span class="token comment"># objdump -d demo1 &gt; demo1go3.txt</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6765\u67E5\u770B\u6C47\u7F16\u8BED\u53E5</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>  401000:       49 3b 66 10             cmp    0x10(%r14),%rsp
  401004:       76 38                   jbe    40103e &lt;internal/cpu.Initialize+0x3e&gt;
  401006:       48 83 ec 18             sub    $0x18,%rsp
  40100a:       48 89 6c 24 10          mov    %rbp,0x10(%rsp)
  40100f:       48 8d 6c 24 10          lea    0x10(%rsp),%rbp
  401014:       48 89 44 24 20          mov    %rax,0x20(%rsp)
  401019:       48 89 5c 24 28          mov    %rbx,0x28(%rsp)
  40101e:       66 90                   xchg   %ax,%ax
  401020:       e8 7b 06 00 00          callq  4016a0 &lt;internal/cpu.doinit&gt;
  401025:       48 8b 44 24 20          mov    0x20(%rsp),%rax
  40102a:       48 8b 5c 24 28          mov    0x28(%rsp),%rbx
  40102f:       e8 2c 00 00 00          callq  401060 &lt;internal/cpu.processOptions&gt;
  401034:       48 8b 6c 24 10          mov    0x10(%rsp),%rbp
  401039:       48 83 c4 18             add    $0x18,%rsp
  40103d:       c3                      retq
  40103e:       48 89 44 24 08          mov    %rax,0x8(%rsp)
  401043:       48 89 5c 24 10          mov    %rbx,0x10(%rsp)
  401048:       e8 b3 7b 05 00          callq  458c00 &lt;runtime.morestack_noctxt.abi0&gt;
  40104d:       48 8b 44 24 08          mov    0x8(%rsp),%rax
  401052:       48 8b 5c 24 10          mov    0x10(%rsp),%rbx
  401057:       eb a7                   jmp    401000 &lt;internal/cpu.Initialize&gt;
  401059:       cc                      int3
  40105a:       cc                      int3
  40105b:       cc                      int3
  40105c:       cc                      int3
  40105d:       cc                      int3
  40105e:       cc                      int3
  40105f:       cc                      int3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u865A\u62DF\u5730\u5740\uFF1A401000</p><p>\u6307\u4EE4\u5185\u5BB9\uFF1A49 3b 66 10</p><p>\u6307\u4EE4\u5927\u5C0F\uFF1A4 \u5B57\u8282</p><p>\u6307\u4EE4\u5BF9\u5E94\u7684\u6C47\u7F16\u6307\u4EE4\uFF1A<code>cmp 0x10(%r14),%rsp</code></p></li></ul><blockquote><p><code>go</code>\u7A0B\u5E8F\u8BED\u53E5\u65F6\u591A\u6761</p><p>\u4E00\u6761<code>go</code>\u8BED\u53E5\uFF1A\u5BF9\u5E94\u591A\u6761\u6C47\u7F16\u8BED\u53E5</p><p>\u4E00\u6761\u6C47\u7F16\u8BED\u53E5\uFF1A\u5BF9\u5E94\u591A\u4E2A\u5B57\u8282\u7684\u6307\u4EE4</p><p>\u6BCF\u6761\u6307\u4EE4\u90FD\u6709\u4E00\u4E2A\u865A\u62DF\u5185\u5B58\u5730\u5740</p></blockquote><p>\u67E5\u770B\u7A0B\u5E8F\u5165\u53E3\u5730\u5740</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@VM-16-4-centos base<span class="token punctuation">]</span><span class="token comment"># readelf -h demo1</span>
ELF \u5934\uFF1A
  Magic\uFF1A  7f <span class="token number">45</span> 4c <span class="token number">46</span> 02 01 01 00 00 00 00 00 00 00 00 00
  \u7C7B\u522B:                              ELF64
  \u6570\u636E:                              <span class="token number">2</span> \u8865\u7801\uFF0C\u5C0F\u7AEF\u5E8F <span class="token punctuation">(</span>little endian<span class="token punctuation">)</span>
  \u7248\u672C:                              <span class="token number">1</span> <span class="token punctuation">(</span>current<span class="token punctuation">)</span>
  OS/ABI:                            UNIX - System V
  ABI \u7248\u672C:                          <span class="token number">0</span>
  \u7C7B\u578B:                              EXEC <span class="token punctuation">(</span>\u53EF\u6267\u884C\u6587\u4EF6<span class="token punctuation">)</span>
  \u7CFB\u7EDF\u67B6\u6784:                          Advanced Micro Devices X86-64
  \u7248\u672C:                              0x1
  \u5165\u53E3\u70B9\u5730\u5740\uFF1A              0x45c220
  \u7A0B\u5E8F\u5934\u8D77\u70B9\uFF1A              <span class="token number">64</span> <span class="token punctuation">(</span>bytes into <span class="token function">file</span><span class="token punctuation">)</span>
  Start of section headers:          <span class="token number">456</span> <span class="token punctuation">(</span>bytes into <span class="token function">file</span><span class="token punctuation">)</span>
  \u6807\u5FD7\uFF1A             0x0
  \u672C\u5934\u7684\u5927\u5C0F\uFF1A       <span class="token number">64</span> <span class="token punctuation">(</span>\u5B57\u8282<span class="token punctuation">)</span>
  \u7A0B\u5E8F\u5934\u5927\u5C0F\uFF1A       <span class="token number">56</span> <span class="token punctuation">(</span>\u5B57\u8282<span class="token punctuation">)</span>
  Number of program headers:         <span class="token number">7</span>
  \u8282\u5934\u5927\u5C0F\uFF1A         <span class="token number">64</span> <span class="token punctuation">(</span>\u5B57\u8282<span class="token punctuation">)</span>
  \u8282\u5934\u6570\u91CF\uFF1A         <span class="token number">23</span>
  \u5B57\u7B26\u4E32\u8868\u7D22\u5F15\u8282\u5934\uFF1A <span class="token number">3</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,12);function o(r,u){const s=e("Mermaid");return i(),l("div",null,[d,c(s,{id:"mermaid-64a5706e",code:"graph%20TD%0A%09%E5%A0%86-heap%0A%09%E6%A0%88-stack%0A%09%E4%BB%A3%E7%A0%81%E6%AE%B5%0A%09%E6%95%B0%E6%8D%AE%E6%AE%B5%0A%09%E5%8A%A8%E6%80%81%E9%93%BE%E6%8E%A5%E6%98%A0%E5%B0%84%0A"}),t])}var b=a(p,[["render",o],["__file","elf-program-load-exec.html.vue"]]);export{b as default};
