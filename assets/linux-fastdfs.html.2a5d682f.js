import{_ as s}from"./plugin-vue_export-helper.21dcd24c.js";import{o as a,c as n,e}from"./app.d55bb37b.js";const i={},r=e(`<h1 id="\u4E2D\u5C0F\u6587\u4EF6\u6700\u6D41\u884C\u7684\u5206\u5E03\u5F0F\u6587\u4EF6\u670D\u52A1-fastdfs" tabindex="-1"><a class="header-anchor" href="#\u4E2D\u5C0F\u6587\u4EF6\u6700\u6D41\u884C\u7684\u5206\u5E03\u5F0F\u6587\u4EF6\u670D\u52A1-fastdfs" aria-hidden="true">#</a> \u4E2D\u5C0F\u6587\u4EF6\u6700\u6D41\u884C\u7684\u5206\u5E03\u5F0F\u6587\u4EF6\u670D\u52A1-FastDFS</h1><h2 id="\u4EC0\u4E48\u662F-fastdfs" tabindex="-1"><a class="header-anchor" href="#\u4EC0\u4E48\u662F-fastdfs" aria-hidden="true">#</a> \u4EC0\u4E48\u662F FastDFS</h2><p>FastDFS \u662F\u7528 C \u8BED\u8A00\u7F16\u5199\u7684\u4E00\u6B3E\u5F00\u6E90\u7684\u8F7B\u91CF\u7EA7\u5206\u5E03\u5F0F\u6587\u4EF6\u7CFB\u7EDF\u3002\u5B83\u5BF9\u6587\u4EF6\u8FDB\u884C\u7BA1\u7406\uFF0C\u529F\u80FD\u5305\u62EC:\u6587\u4EF6\u5B58\u50A8\u3001\u6587\u4EF6\u540C\u6B65\u3001\u6587\u4EF6\u8BBF\u95EE( \u6587\u4EF6\u4E0A\u4F20\u3001\u6587\u4EF6\u4E0B\u8F7D)\u7B49\uFF0C\u89E3\u51B3\u4E86\u5927\u5BB9\u91CF\u5B58\u50A8\u548C\u8D1F\u8F7D\u5747\u8861\u7684\u95EE\u9898\u3002\u7279\u522B\u9002\u5408\u4EE5\u6587\u4EF6\u4E3A\u8F7D\u4F53\u7684\u5728\u7EBF\u670D\u52A1\uFF0C\u5982<strong>\u76F8\u518C</strong>\u7F51\u7AD9\u3001<strong>\u77ED\u89C6\u9891</strong>\u7F51\u7AD9\u7B49\u7B49\u3002 FastDFS \u4E3A\u4E92\u8054\u7F51\u91CF\u8EAB\u5B9A\u5236\uFF0C\u5145\u5206\u8003\u8651\u4E86\u5197\u4F59\u5907\u4EFD\u3001\u8D1F\u8F7D\u5747\u8861\u3001\u7EBF\u6027\u6269\u5BB9\u7B49\u673A\u5236\uFF0C\u5E76\u6CE8\u91CD\u9AD8\u53EF\u7528\u3001\u9AD8\u6027 \u80FD\u7B49\u6307\u6807\uFF0C\u4F7F\u7528 FastDFS \u5F88\u5BB9\u6613\u642D\u5EFA\u4E00\u5957\u9AD8\u6027\u80FD\u7684\u6587\u4EF6\u670D\u52A1\u5668\u96C6\u7FA4\u63D0\u4F9B\u6587\u4EF6\u4E0A\u4F20\u3001\u4E0B\u8F7D\u7B49\u670D\u52A1\u3002</p><h2 id="fastdfs-\u7279\u6027" tabindex="-1"><a class="header-anchor" href="#fastdfs-\u7279\u6027" aria-hidden="true">#</a> FastDFS \u7279\u6027</h2><ul><li><p>\u5206\u7EC4\u5B58\u50A8\uFF0C\u7075\u6D3B\u7B80\u6D01\u3001\u5BF9\u7B49\u7ED3\u6784\uFF0C\u4E0D\u5B58\u5728\u5355\u70B9</p></li><li><p>\u6587\u4EF6\u4E0D\u5206\u5757\u5B58\u50A8\uFF0C\u4E0A\u4F20\u7684\u6587\u4EF6\u548C OS \u6587\u4EF6\u7CFB\u7EDF\u4E2D\u7684\u6587\u4EF6\u4E00\u4E00\u5BF9\u5E94</p></li><li><p>\u6587\u4EF6 ID \u7531 FastDFS \u751F\u6210\uFF0C\u4F5C\u4E3A\u6587\u4EF6\u8BBF\u95EE\u51ED\u8BC1\uFF0CFastDFS \u4E0D\u9700\u8981\u4F20\u7EDF\u7684 name server</p></li><li><p>\u548C\u6D41\u884C\u7684 web server \u65E0\u7F1D\u8854\u63A5\uFF0CFastDFS \u5DF2\u63D0\u4F9B apache \u548C nginx \u6269\u5C55\u6A21\u5757</p></li><li><p>\u4E2D\u3001\u5C0F\u6587\u4EF6\u5747\u53EF\u4EE5\u5F88\u597D\u652F\u6301\uFF0C\u652F\u6301\u6D77\u91CF\u5C0F\u6587\u4EF6\u5B58\u50A8</p></li><li><p>\u652F\u6301\u591A\u5757\u78C1\u76D8\uFF0C\u652F\u6301\u5355\u76D8\u6570\u636E\u6062\u590D</p></li><li><p>\u652F\u6301\u76F8\u540C\u5185\u5BB9\u7684\u6587\u4EF6\u53EA\u4FDD\u5B58\u4E00\u4EFD\uFF0C\u8282\u7EA6\u78C1\u76D8\u7A7A\u95F4</p></li><li><p>\u652F\u6301\u5728\u7EBF\u6269\u5BB9</p></li><li><p>\u652F\u6301\u4E3B\u4ECE\u6587\u4EF6 \u5B58\u50A8\u670D\u52A1\u5668\u4E0A\u53EF\u4EE5\u4FDD\u5B58\u6587\u4EF6\u5C5E\u6027(meta-data)V2.0 \u7F51\u7EDC\u901A\u4FE1\u91C7\u7528 libevent\uFF0C\u652F\u6301\u5927\u5E76\u53D1\u8BBF\u95EE\uFF0C\u6574 \u4F53\u6027\u80FD\u66F4\u597D</p></li><li><p>\u4E0B\u8F7D\u6587\u4EF6\u652F\u6301\u591A\u7EBF\u7A0B\u65B9\u5F0F\uFF0C\u652F\u6301\u65AD\u70B9\u7EED\u4F20</p></li></ul><h2 id="fastdfs-\u6784\u6210" tabindex="-1"><a class="header-anchor" href="#fastdfs-\u6784\u6210" aria-hidden="true">#</a> FastDFS \u6784\u6210</h2><p>FastDFS \u7531<strong>\u5BA2\u6237\u7AEF(Client)</strong>\u3001 **\u8DDF\u8E2A\u670D\u52A1\u5668(Tracker Server)<strong>\u548C</strong>\u5B58\u50A8\u670D\u52A1\u5668(Storage Server)**\u6784\u6210\u3002</p><h3 id="\u5BA2\u6237\u7AEF-client" tabindex="-1"><a class="header-anchor" href="#\u5BA2\u6237\u7AEF-client" aria-hidden="true">#</a> \u5BA2\u6237\u7AEF\uFF08Client\uFF09</h3><p>FastDFS \u7684\u5BA2\u6237\u7AEF\u4F7F\u6211\u4EEC\u4EFB\u610F\u7684\u8FDE\u63A5\u8C03\u7528\u7684\u5E94\u7528\u7A0B\u5E8F\uFF0C\u4E00\u822C\u6307\u6211\u4EEC\u81EA\u5DF1\u5F00\u53D1\u7684\u5E94\u7528\u7A0B\u5E8F\u3002\u4E24\u8005\u4E4B\u95F4\u901A\u8FC7 TCP/IP \u534F\u8BAE\u505A\u6570\u636E\u4EA4\u6362\u3002</p><p>FastDFS \u7684\u5B89\u88C5\u5305\u4E5F\u63D0\u4F9B\u4E86\u4E00\u4E2A\u4E0A\u4F20\u6307\u4EE4\uFF0C\u901A\u8FC7\u914D\u7F6E\u6587\u4EF6\u4E5F\u53EF\u4EE5\u8FBE\u5230\u4E0A\u4F20\u3001\u4E0B\u8F7D\u7684\u4F5C\u7528\u3002</p><h3 id="\u8DDF\u8E2A\u670D\u52A1\u5668-tracker-server" tabindex="-1"><a class="header-anchor" href="#\u8DDF\u8E2A\u670D\u52A1\u5668-tracker-server" aria-hidden="true">#</a> \u8DDF\u8E2A\u670D\u52A1\u5668\uFF08Tracker Server\uFF09</h3><p>Trackerserver \u4F5C\u7528\u662F\u8D1F\u8F7D\u5747\u8861\u548C\u8C03\u5EA6\u3002</p><p>\u901A\u8FC7 Tracker server \u5728\u6587\u4EF6\u4E0A\u4F20\u65F6\u53EF\u4EE5\u6839\u636E\u4E00\u4E9B\u7B56\u7565\u627E\u5230 Storage Server \u63D0\u4F9B\u6587\u4EF6\u4E0A\u4F20\u670D\u52A1\u3002</p><h3 id="\u5B58\u50A8\u670D\u52A1\u5668-storage-server" tabindex="-1"><a class="header-anchor" href="#\u5B58\u50A8\u670D\u52A1\u5668-storage-server" aria-hidden="true">#</a> \u5B58\u50A8\u670D\u52A1\u5668\uFF08Storage Server\uFF09</h3><p>Storageserver \u4F5C\u7528\u662F\u6587\u4EF6\u5B58\u50A8\uFF0C\u5BA2\u6237\u7AEF\u4E0A\u4F20\u7684\u6587\u4EF6\u6700\u7EC8\u5B58\u50A8\u5728 Storage \u670D\u52A1\u5668\u4E0A\uFF0CStorage server \u6CA1\u6709\u5B9E\u73B0\u81EA\u5DF1\u7684\u6587\u4EF6\u7CFB\u7EDF\u800C\u662F\u5229\u7528\u64CD\u4F5C\u7CFB\u7EDF\u7684\u6587\u4EF6\u7CFB\u7EDF\u6765\u7BA1\u7406\u6587\u4EF6\u3002</p><h2 id="linux-\u5B89\u88C5-fastdfs" tabindex="-1"><a class="header-anchor" href="#linux-\u5B89\u88C5-fastdfs" aria-hidden="true">#</a> Linux \u5B89\u88C5 FastDFS</h2><h3 id="\u8F6F\u4EF6\u5305\u4E0B\u8F7D" tabindex="-1"><a class="header-anchor" href="#\u8F6F\u4EF6\u5305\u4E0B\u8F7D" aria-hidden="true">#</a> \u8F6F\u4EF6\u5305\u4E0B\u8F7D</h3><h3 id="\u8F6F\u4EF6\u5B89\u88C5" tabindex="-1"><a class="header-anchor" href="#\u8F6F\u4EF6\u5B89\u88C5" aria-hidden="true">#</a> \u8F6F\u4EF6\u5B89\u88C5</h3><h4 id="\u5B89\u88C5\u4F9D\u8D56" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5\u4F9D\u8D56" aria-hidden="true">#</a> \u5B89\u88C5\u4F9D\u8D56</h4><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>yum <span class="token function">install</span> <span class="token function">git</span> gcc gcc-c++ <span class="token function">make</span> automake <span class="token function">vim</span> <span class="token function">wget</span> libevent <span class="token function">unzip</span> lrzsz -y
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="\u5B89\u88C5-libfastcommon-\u57FA\u7840\u5E93" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-libfastcommon-\u57FA\u7840\u5E93" aria-hidden="true">#</a> \u5B89\u88C5 libfastcommon \u57FA\u7840\u5E93</h4><p>\u4E0A\u4F20\u3001\u89E3\u538B\u3001\u5B89\u88C5\u57FA\u7840\u5E93\u8F6F\u4EF6\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> ~
<span class="token function">mkdir</span> fdfs
rz -y
<span class="token function">unzip</span> libfastcommon-master.zip
<span class="token builtin class-name">cd</span> libfastcommon-master
<span class="token function">sh</span> make.sh clean <span class="token operator">&amp;&amp;</span> <span class="token function">sh</span> make.sh <span class="token operator">&amp;&amp;</span> <span class="token function">sh</span> make.sh <span class="token function">install</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="\u5B89\u88C5-fastdfs" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-fastdfs" aria-hidden="true">#</a> \u5B89\u88C5 FastDFS</h4><p>\u4E0A\u4F20\u3001\u89E3\u538B\u3001\u5B89\u88C5\u8F6F\u4EF6\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> ~/fdfs
<span class="token function">unzip</span> fastdfs-master.zip
<span class="token builtin class-name">cd</span> fastdfs-master
<span class="token function">sh</span> make.sh clean <span class="token operator">&amp;&amp;</span> <span class="token function">sh</span> make.sh <span class="token operator">&amp;&amp;</span> <span class="token function">sh</span> make.sh <span class="token function">install</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u62F7\u8D1D\u914D\u7F6E\u6587\u4EF6\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">cp</span> /etc/fdfs/tracker.conf.sample /etc/fdfs/tracker.conf
<span class="token function">cp</span> /etc/fdfs/storage.conf.sample /etc/fdfs/storage.conf
<span class="token function">cp</span> /etc/fdfs/client.conf.sample /etc/fdfs/client.conf
<span class="token function">cp</span> /root/fdfs/fastdfs-master/conf/http.conf /etc/fdfs
<span class="token function">cp</span> /root/fdfs/fastdfs-master/conf/mime.types /etc/fdfs
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4FEE\u6539\u914D\u7F6E\u6587\u4EF6\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> /etc/fdfs/tracker.conf
<span class="token comment">#\u9700\u8981\u4FEE\u6539\u7684\u5185\u5BB9\u5982\u4E0B</span>
<span class="token assign-left variable">port</span><span class="token operator">=</span><span class="token number">22122</span>
<span class="token assign-left variable">base_path</span><span class="token operator">=</span>/home/fastdfs
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> /etc/fdfs/storage.conf
<span class="token comment">#\u9700\u8981\u4FEE\u6539\u7684\u5185\u5BB9\u5982\u4E0B</span>
<span class="token assign-left variable">port</span><span class="token operator">=</span><span class="token number">23000</span>
<span class="token assign-left variable">base_path</span><span class="token operator">=</span>/home/fastdfs
<span class="token assign-left variable">store_path0</span><span class="token operator">=</span>/home/fastdfs
<span class="token assign-left variable">tracker_server</span><span class="token operator">=</span><span class="token number">172.26</span>.107.191:22122
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> /etc/fdfs/client.conf
<span class="token comment">#\u9700\u8981\u4FEE\u6539\u7684\u5185\u5BB9\u5982\u4E0B</span>
<span class="token assign-left variable">base_path</span><span class="token operator">=</span>/home/fastdfs
<span class="token assign-left variable">tracker_server</span><span class="token operator">=</span><span class="token number">172.26</span>.107.191:22122
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="\u542F\u52A8\u670D\u52A1" tabindex="-1"><a class="header-anchor" href="#\u542F\u52A8\u670D\u52A1" aria-hidden="true">#</a> \u542F\u52A8\u670D\u52A1</h4><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">mkdir</span> /home/fastdfs -p
/usr/bin/fdfs_trackerd /etc/fdfs/tracker.conf restart
/usr/bin/fdfs_storaged /etc/fdfs/storage.conf restart
<span class="token function">netstat</span> -ntlp
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="\u6D4B\u8BD5\u670D\u52A1" tabindex="-1"><a class="header-anchor" href="#\u6D4B\u8BD5\u670D\u52A1" aria-hidden="true">#</a> \u6D4B\u8BD5\u670D\u52A1</h4><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>/usr/bin/fdfs_upload_file /etc/fdfs/client.conf /root/fdfs/fastdfs-master/COPYING-3_0.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,36),t=[r];function l(d,c){return a(),n("div",null,t)}var f=s(i,[["render",l],["__file","linux-fastdfs.html.vue"]]);export{f as default};
