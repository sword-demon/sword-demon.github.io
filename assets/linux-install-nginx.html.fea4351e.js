import{_ as l}from"./plugin-vue_export-helper.21dcd24c.js";import{r as c,o as t,c as p,a as n,b as i,e as s,d as a}from"./app.ca33caca.js";const o={},d=s(`<h1 id="linux-\u5B89\u88C5-nginx-\u548C\u914D\u7F6E" tabindex="-1"><a class="header-anchor" href="#linux-\u5B89\u88C5-nginx-\u548C\u914D\u7F6E" aria-hidden="true">#</a> Linux \u5B89\u88C5 Nginx \u548C\u914D\u7F6E</h1><h2 id="\u76EE\u5F55" tabindex="-1"><a class="header-anchor" href="#\u76EE\u5F55" aria-hidden="true">#</a> \u76EE\u5F55</h2><ul><li><p><a href="#nginx%E5%AE%89%E8%A3%85">Nginx \u5B89\u88C5</a></p><ul><li><a href="#gcc%E5%AE%89%E8%A3%85">gcc \u5B89\u88C5</a></li><li><a href="#%E6%B7%BB%E5%8A%A0%E4%B8%80%E4%B8%AAnginx%E7%94%A8%E6%88%B7">\u6DFB\u52A0\u4E00\u4E2A nginx \u7528\u6237</a></li><li><a href="#%E9%85%8D%E7%BD%AE">\u914D\u7F6E</a></li><li><a href="#%E9%85%8D%E7%BD%AEvhost">\u914D\u7F6E vhost</a></li></ul></li><li><p><a href="#nginx-%E5%8F%82%E6%95%B0%E4%BC%98%E5%8C%96">nginx \u53C2\u6570\u4F18\u5316</a></p><ul><li><a href="#%E9%85%8D%E7%BD%AE%E4%BC%98%E5%8C%96">\u914D\u7F6E\u4F18\u5316</a></li><li><a href="#%E6%9C%80%E7%BB%88%E9%85%8D%E7%BD%AE%E5%86%85%E5%AE%B9">\u6700\u7EC8\u914D\u7F6E\u5185\u5BB9</a></li></ul></li><li><p><a href="#%E8%B4%9F%E8%BD%BD%E5%9D%87%E8%A1%A1">\u8D1F\u8F7D\u5747\u8861</a></p></li></ul><h1 id="nginx-\u5B89\u88C5\u548C\u914D\u7F6E" tabindex="-1"><a class="header-anchor" href="#nginx-\u5B89\u88C5\u548C\u914D\u7F6E" aria-hidden="true">#</a> nginx \u5B89\u88C5\u548C\u914D\u7F6E</h1><h2 id="nginx-\u5B89\u88C5" tabindex="-1"><a class="header-anchor" href="#nginx-\u5B89\u88C5" aria-hidden="true">#</a> Nginx \u5B89\u88C5</h2><p>\u4E0B\u8F7D\u5B89\u88C5\u5305\uFF1A\u6211\u8FD9\u91CC\u4F7F\u7528\u7684\u662F\uFF1A<code>nginx-1.17.8.tar.gz</code></p><p>\u4E0B\u8F7D\u5B8C\u4E86\uFF0C\u7136\u540E\u4E0A\u4F20\u5230\u670D\u52A1\u5668\u4E4B\u540E\uFF0C\u6211\u4EEC\u5F97\u4E0B\u8F7D\u4E00\u4E9B\u9700\u8981\u5F97\u4F9D\u8D56\u5305\u3002</p><h3 id="gcc-\u5B89\u88C5" tabindex="-1"><a class="header-anchor" href="#gcc-\u5B89\u88C5" aria-hidden="true">#</a> gcc \u5B89\u88C5</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>yum -y <span class="token function">install</span> <span class="token function">unzip</span> <span class="token function">zip</span>  ncurses-devel zlib libxml libjpeg freetype libpng gd <span class="token function">curl</span> libiconv zlib-devel libxml2-devel libjpeg-devel freetype-devel libpng-devel gd-devel curl-devel libxslt-devel  zlib-devel openssl-devel gcc gcc-c++ autoconf libjpeg libjpeg-devel libpng-devel  freetype-devel libxml2 libxml2-devel zlib zlib-devel glibc glibc-devel glib2 glib2-devel <span class="token function">bzip2</span> bzip2-devel ncurses ncurses-devel curl-devel openssl-devel expat expat-devel <span class="token function">make</span> gcc g++ gcc-c++ libtool autoconf automake imake mysql-devel libxm2-devel expat-devel  net-snmp-devel  libcurl-deve libevent libevent-devel openldap openldap-devel
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="\u6DFB\u52A0\u4E00\u4E2A-nginx-\u7528\u6237" tabindex="-1"><a class="header-anchor" href="#\u6DFB\u52A0\u4E00\u4E2A-nginx-\u7528\u6237" aria-hidden="true">#</a> \u6DFB\u52A0\u4E00\u4E2A nginx \u7528\u6237</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">useradd</span> nginx -s /sbin/nologin
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u914D\u7F6E</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 nginx-1.17.8<span class="token punctuation">]</span><span class="token comment"># ./configure --prefix=/usr/local/nginx --user=nginx --group=nginx --with-http_ssl_module --with-http_stub_status_module --with-http_realip_module</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Configuration summary
  + using system PCRE library
  + using system OpenSSL library
  + using system zlib library

  nginx path prefix: <span class="token string">&quot;/usr/local/nginx&quot;</span>
  nginx binary file: <span class="token string">&quot;/usr/local/nginx/sbin/nginx&quot;</span>
  nginx modules path: <span class="token string">&quot;/usr/local/nginx/modules&quot;</span>
  nginx configuration prefix: <span class="token string">&quot;/usr/local/nginx/conf&quot;</span>
  nginx configuration file: <span class="token string">&quot;/usr/local/nginx/conf/nginx.conf&quot;</span>
  nginx pid file: <span class="token string">&quot;/usr/local/nginx/logs/nginx.pid&quot;</span>
  nginx error log file: <span class="token string">&quot;/usr/local/nginx/logs/error.log&quot;</span>
  nginx http access log file: <span class="token string">&quot;/usr/local/nginx/logs/access.log&quot;</span>
  nginx http client request body temporary files: <span class="token string">&quot;client_body_temp&quot;</span>
  nginx http proxy temporary files: <span class="token string">&quot;proxy_temp&quot;</span>
  nginx http fastcgi temporary files: <span class="token string">&quot;fastcgi_temp&quot;</span>
  nginx http uwsgi temporary files: <span class="token string">&quot;uwsgi_temp&quot;</span>
  nginx http scgi temporary files: <span class="token string">&quot;scgi_temp&quot;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u8FDB\u884C\u7F16\u8BD1\u5B89\u88C5</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">make</span> <span class="token operator">&amp;&amp;</span> <span class="token function">make</span> <span class="token function">install</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7F16\u8BD1\u5B89\u88C5\u5B8C\u4E4B\u540E\u6211\u4EEC\u8FDB\u884C\u542F\u52A8\u4E00\u4E0B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 nginx-1.17.8<span class="token punctuation">]</span><span class="token comment"># /usr/local/nginx/sbin/nginx</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u7ED9<code>nginx</code>\u6DFB\u52A0\u9632\u706B\u5899\u7AEF\u53E3</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>firewall-cmd --zone<span class="token operator">=</span>public --add-port<span class="token operator">=</span><span class="token number">80</span>/tcp --permanent
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u518D\u8FDB\u884C\u91CD\u542F\u9632\u706B\u5899</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>systemctl restart firewalld.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220813221453.png" alt="" loading="lazy"></p><p>\u7136\u540E\u4F7F\u7528\u6211\u4EEC\u865A\u62DF\u673A\u7684<code>ip</code>\u5730\u5740\u5230\u6D4F\u89C8\u5668\u91CC\u53BB\u8BBF\u95EE\uFF0C\u5C31\u53EF\u4EE5\u770B\u5230<code>nginx</code>\u5B89\u88C5\u548C\u542F\u52A8\u6210\u529F\u4E86\u3002</p><h3 id="\u914D\u7F6E" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E" aria-hidden="true">#</a> \u914D\u7F6E</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /usr/local/nginx/conf
<span class="token function">mv</span> nginx.conf nginx_\u5F53\u524D\u65E5\u671F.conf <span class="token comment"># \u5907\u4EFD\u4E00\u4E0B</span>
<span class="token function">vim</span> nginx.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">server</span></span> <span class="token punctuation">{</span>
        <span class="token directive"><span class="token keyword">listen</span>       <span class="token number">80</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">server_name</span>  localhost</span><span class="token punctuation">;</span>

        <span class="token comment">#charset koi8-r;</span>

        <span class="token comment">#access_log  logs/host.access.log  main;</span>

        <span class="token directive"><span class="token keyword">location</span> /</span> <span class="token punctuation">{</span>
            <span class="token directive"><span class="token keyword">root</span>   /home/web/</span><span class="token punctuation">;</span>
            <span class="token directive"><span class="token keyword">index</span>  index.html index.htm</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">#error_page  404              /404.html;</span>

        <span class="token comment"># redirect server error pages to the static page /50x.html</span>
        <span class="token comment">#</span>
        <span class="token directive"><span class="token keyword">error_page</span>   <span class="token number">500</span> <span class="token number">502</span> <span class="token number">503</span> <span class="token number">504</span>  /50x.html</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">location</span> = /50x.html</span> <span class="token punctuation">{</span>
            <span class="token directive"><span class="token keyword">root</span>   html</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5177\u4F53\u4E5F\u6CA1\u6539\u5565\uFF0C\u5C31\u662F\u6539\u4E86\u4E00\u4E2A<code>root</code>\u7684\u6307\u5411\u7684\u76EE\u5F55\u3002</p><p>\u7136\u540E\u8FDB\u884C\u8BED\u6CD5\u68C0\u6D4B\u548C\u914D\u7F6E\u91CD\u8F7D</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 conf<span class="token punctuation">]</span><span class="token comment"># /usr/local/nginx/sbin/nginx -t</span>
nginx: the configuration <span class="token function">file</span> /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration <span class="token function">file</span> /usr/local/nginx/conf/nginx.conf <span class="token builtin class-name">test</span> is successful
<span class="token punctuation">[</span>root@10 conf<span class="token punctuation">]</span><span class="token comment"># /usr/local/nginx/sbin/nginx -s reload</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u6211\u4EEC\u521B\u5EFA\u5BF9\u5E94\u7684<code>/home/web</code>\u76EE\u5F55</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">mkdir</span> -p /home/web/
<span class="token comment"># \u914D\u7F6Enginx\u6743\u9650</span>
<span class="token function">chown</span> -R nginx.nginx /home/web/

<span class="token comment"># \u7B80\u5355\u7F16\u5199\u4E00\u4E2A index.html</span>
<span class="token function">vim</span> /home/web/index.html
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u67E5\u770B\u6211\u4EEC\u6D4F\u89C8\u5668\u8BBF\u95EE\u7684\u65F6\u5019\uFF0C\u662F\u5426\u53D8\u6210\u4E86\u5BF9\u5E94\u7684\u8F93\u5165\u7684<code>index.html</code>\u7684\u5185\u5BB9\u5373\u53EF\u3002</p><p><strong>\u914D\u7F6E\u5F00\u542F\u81EA\u542F</strong></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /etc/init.d/

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6211\u4EEC\u7F16\u5199\u4E00\u4E2A\u811A\u672C\u6587\u4EF6\u540D\u79F0\u4E3A<code>nginx</code>\u4E0D\u5E26\u4EFB\u4F55\u540E\u7F00</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token shebang important">#!/bin/bash</span>
<span class="token comment">#</span>
<span class="token comment"># Startup script for Nginx - this script starts and stops the nginx daemon</span>
<span class="token comment">#</span>
<span class="token comment"># chkconfig:   - 85 15</span>
<span class="token comment"># description:  Nginx is an HTTP(S) server, HTTP(S) reverse proxy and IMAP/POP3 proxy server</span>
<span class="token comment"># processname: nginx</span>
<span class="token comment"># config:      /usr/local/nginx/conf/nginx.conf</span>
<span class="token assign-left variable">pidfile</span><span class="token operator">=</span><span class="token string">&quot;/usr/local/nginx/logs/nginx.pid&quot;</span>

<span class="token comment"># Source function library.</span>
<span class="token builtin class-name">.</span> /etc/rc.d/init.d/functions

<span class="token comment"># Source networking configuration.</span>
<span class="token builtin class-name">.</span> /etc/sysconfig/network

<span class="token comment"># Check that networking is up.</span>
<span class="token punctuation">[</span> <span class="token string">&quot;<span class="token variable">$NETWORKING</span>&quot;</span> <span class="token operator">=</span> <span class="token string">&quot;no&quot;</span> <span class="token punctuation">]</span> <span class="token operator">&amp;&amp;</span> <span class="token builtin class-name">exit</span> <span class="token number">0</span>

<span class="token assign-left variable">nginx</span><span class="token operator">=</span><span class="token string">&quot;/usr/local/nginx/sbin/nginx&quot;</span>
<span class="token assign-left variable">prog</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token function">basename</span> $nginx<span class="token variable">)</span></span>

<span class="token assign-left variable">NGINX_CONF_FILE</span><span class="token operator">=</span><span class="token string">&quot;/usr/local/nginx/conf/nginx.conf&quot;</span>

<span class="token punctuation">[</span> -f /etc/sysconfig/nginx <span class="token punctuation">]</span> <span class="token operator">&amp;&amp;</span> <span class="token builtin class-name">.</span> /etc/sysconfig/nginx

<span class="token assign-left variable">lockfile</span><span class="token operator">=</span>/var/lock/subsys/nginx

<span class="token function-name function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">[</span> -x <span class="token variable">$nginx</span> <span class="token punctuation">]</span> <span class="token operator">||</span> <span class="token builtin class-name">exit</span> <span class="token number">5</span>
    <span class="token punctuation">[</span> -f <span class="token variable">$NGINX_CONF_FILE</span> <span class="token punctuation">]</span> <span class="token operator">||</span> <span class="token builtin class-name">exit</span> <span class="token number">6</span>
    <span class="token builtin class-name">echo</span> -n $<span class="token string">&quot;Starting <span class="token variable">$prog</span>: &quot;</span>
    daemon <span class="token variable">$nginx</span> -c <span class="token variable">$NGINX_CONF_FILE</span>
    <span class="token assign-left variable">retval</span><span class="token operator">=</span><span class="token variable">$?</span>
    <span class="token builtin class-name">echo</span>
    <span class="token punctuation">[</span> <span class="token variable">$retval</span> -eq <span class="token number">0</span> <span class="token punctuation">]</span> <span class="token operator">&amp;&amp;</span> <span class="token function">touch</span> <span class="token variable">$lockfile</span>
    <span class="token builtin class-name">return</span> <span class="token variable">$retval</span>
<span class="token punctuation">}</span>

<span class="token function-name function">stop</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token builtin class-name">echo</span> -n $<span class="token string">&quot;Stopping <span class="token variable">$prog</span>: &quot;</span>
    killproc <span class="token variable">$prog</span> -QUIT
    <span class="token assign-left variable">retval</span><span class="token operator">=</span><span class="token variable">$?</span>
    <span class="token builtin class-name">echo</span>
    <span class="token punctuation">[</span> <span class="token variable">$retval</span> -eq <span class="token number">0</span> <span class="token punctuation">]</span> <span class="token operator">&amp;&amp;</span> <span class="token function">rm</span> -f <span class="token variable">$lockfile</span>
    <span class="token builtin class-name">return</span> <span class="token variable">$retval</span>
<span class="token punctuation">}</span>

<span class="token function-name function">restart</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    configtest <span class="token operator">||</span> <span class="token builtin class-name">return</span> <span class="token variable">$?</span>
    stop
    <span class="token function">sleep</span> <span class="token number">1</span>
    start
<span class="token punctuation">}</span>

<span class="token function-name function">reload</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    configtest <span class="token operator">||</span> <span class="token builtin class-name">return</span> <span class="token variable">$?</span>
    <span class="token builtin class-name">echo</span> -n $<span class="token string">&quot;Reloading <span class="token variable">$prog</span>: &quot;</span>
    killproc <span class="token variable">$nginx</span> -HUP
    <span class="token assign-left variable">RETVAL</span><span class="token operator">=</span><span class="token variable">$?</span>
    <span class="token builtin class-name">echo</span>
<span class="token punctuation">}</span>

<span class="token function-name function">force_reload</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    restart
<span class="token punctuation">}</span>

<span class="token function-name function">configtest</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token variable">$nginx</span> -t -c <span class="token variable">$NGINX_CONF_FILE</span>
<span class="token punctuation">}</span>

<span class="token function-name function">rh_status</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    status <span class="token variable">$prog</span>
<span class="token punctuation">}</span>

<span class="token function-name function">rh_status_q</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    rh_status <span class="token operator">&gt;</span>/dev/null <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span>
<span class="token punctuation">}</span>

<span class="token keyword">case</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token keyword">in</span>
    start<span class="token punctuation">)</span>
        rh_status_q <span class="token operator">&amp;&amp;</span> <span class="token builtin class-name">exit</span> <span class="token number">0</span>
        <span class="token variable">$1</span>
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    stop<span class="token punctuation">)</span>
        rh_status_q <span class="token operator">||</span> <span class="token builtin class-name">exit</span> <span class="token number">0</span>
        <span class="token variable">$1</span>
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    restart<span class="token operator">|</span>configtest<span class="token punctuation">)</span>
        <span class="token variable">$1</span>
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    reload<span class="token punctuation">)</span>
        rh_status_q <span class="token operator">||</span> <span class="token builtin class-name">exit</span> <span class="token number">7</span>
        <span class="token variable">$1</span>
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    force-reload<span class="token punctuation">)</span>
        force_reload
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    status<span class="token punctuation">)</span>
        rh_status
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    condrestart<span class="token operator">|</span>try-restart<span class="token punctuation">)</span>
        rh_status_q <span class="token operator">||</span> <span class="token builtin class-name">exit</span> <span class="token number">0</span>
            <span class="token punctuation">;</span><span class="token punctuation">;</span>
    *<span class="token punctuation">)</span>
        <span class="token builtin class-name">echo</span> $<span class="token string">&quot;Usage: <span class="token variable">$0</span> {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}&quot;</span>
        <span class="token builtin class-name">exit</span> <span class="token number">2</span>
<span class="token keyword">esac</span>


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7F16\u5199\u5B8C\u6BD5\u4E4B\u540E\u4E0A\u4F20\u5230\u521A\u624D\u7684\u76EE\u5F55\u4E2D\uFF0C\u5E76\u4E14\u8BBE\u7F6E\u4E00\u4E9B\u6743\u9650</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">chmod</span> a+x nginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u518D\u8FDB\u884C\u4F7F\u7528\u547D\u4EE4</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">service</span> nginx restart
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5982\u679C\u9047\u5230\u4EC0\u4E48<code>can not open directory\u56E0\u4E3Anginx.pid\u6CA1\u4E86</code></p><p>\u6211\u4EEC\u5C31\u5728\u4E0A\u8FF0\u7684<code>nginx</code>\u91CC\u914D\u7F6E\u4E00\u4E2A</p><p><code>pidfile=&quot;/usr/local/nginx/logs/nginx.pid&quot;</code>\u8FD9\u4E00\u884C\uFF0C\u8BBE\u7F6E\u4F60\u7684<code>nginx.pid</code>\u6587\u4EF6\u4F4D\u7F6E\u5373\u53EF\uFF0C\u4E00\u822C\u7ED9\u7684\u8FD9\u91CC\u662F\u6CE8\u91CA\u6389\u7684\u3002</p><p>\u7136\u540E\u4F7F\u7528<code>chkconfig</code>\u547D\u4EE4\u52A0\u5165\u5F00\u673A\u542F\u52A8</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">chkconfig</span> nginx on
<span class="token function">chkconfig</span> nginx --list
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u53EA\u8981\u770B\u5230 3\uFF0C4\uFF0C5 \u662F\u5F00\u7684\u5373<code>on</code>\u72B6\u6001\u5373\u53EF</p><h3 id="\u914D\u7F6E-vhost" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E-vhost" aria-hidden="true">#</a> \u914D\u7F6E vhost</h3><p>\u8FDB\u5165<code>nginx</code>\u7684\u914D\u7F6E\u6587\u4EF6\u76EE\u5F55\uFF0C\u65B0\u5EFA\u4E00\u4E2A<code>vhost</code>\u76EE\u5F55\uFF0C\u91CC\u9762\u4EE5\u540E\u5B58\u653E\u522B\u7684\u4E00\u4E9B\u7AD9\u70B9\u7684\u914D\u7F6E\u6587\u4EF6\uFF0C\u7136\u540E\u4E3B\u8981\u7684<code>nginx.conf</code>\u8FD8\u5F97\u5305\u542B\u4E00\u4E0B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> nginx.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5728\u6700\u4E0B\u9762\u4E00\u884C\u6DFB\u52A0</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code>include vhost/*.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7136\u540E\u6211\u4EEC\u5728<code>vhost</code>\u76EE\u5F55\u4E0B\u65B0\u5EFA\u4E00\u4E2A\u7B80\u5355\u7684\u7AD9\u70B9\u914D\u7F6E\u6587\u4EF6\u8FDB\u884C\u6D4B\u8BD5</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">server</span></span> <span class="token punctuation">{</span>
  <span class="token comment"># \u76D1\u542C\u7AEF\u53E3\u53F7</span>
  <span class="token directive"><span class="token keyword">listen</span> <span class="token number">80</span></span><span class="token punctuation">;</span>
  <span class="token comment"># \u57DF\u540D</span>
  <span class="token directive"><span class="token keyword">server_name</span> www.php7.tt</span><span class="token punctuation">;</span>
  <span class="token comment"># \u7F51\u7AD9\u76EE\u5F55</span>
  <span class="token directive"><span class="token keyword">root</span> /home/web/php7/</span><span class="token punctuation">;</span>
  <span class="token directive"><span class="token keyword">location</span> /</span><span class="token punctuation">{</span>
    <span class="token directive"><span class="token keyword">ssi</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">ssi_silent_errors</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">index</span> index.php index.html index.htm</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token directive"><span class="token keyword">access_log</span> /usr/local/nginx/logs/php7_access.log</span><span class="token punctuation">;</span>
  <span class="token directive"><span class="token keyword">error_log</span> /usr/local/nginx/logs/php7_error.log</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6211\u4EEC\u914D\u7F6E\u7684\u662F<code>www.php7.tt</code>\u7F51\u5740\uFF0C\u6240\u4EE5\u6211\u4EEC\u5FC5\u987B\u5728\u672C\u673A\u4E0A\u8FDB\u884C<code>hosts</code>\u8BBE\u7F6E\u624D\u80FD\u8FDB\u884C\u8BBF\u95EE\u3002</p><p>\u7136\u540E\u914D\u7F6E\u5B8C\u4E86\uFF0C\u6211\u4EEC\u521B\u5EFA\u4E00\u4E2A\u5BF9\u5E94\u7684\u5B58\u653E\u76EE\u5F55</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">mkdir</span> -p /home/web/php7
<span class="token function">vim</span> /home/web/php7/index.html
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7B80\u5355\u5199\u4E00\u70B9\u5185\u5BB9\uFF0C\u7136\u540E\u91CD\u542F<code>nginx</code>\u5728\u672C\u5730\u6D4F\u89C8\u5668\u8FDB\u884C\u67E5\u770B\u5185\u5BB9\u5373\u53EF</p><div class="language-\u7EAF\u6587\u672C ext-\u7EAF\u6587\u672C line-numbers-mode"><pre class="language-\u7EAF\u6587\u672C"><code>192.168.33.10 www.php7.tt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><code>hosts</code>\u6587\u4EF6\u91CC\u5F97\u914D\u7F6E\u4E0A\u4F60\u5BF9\u5E94\u5F97\u865A\u62DF\u673A\u7684<code>ip</code></p><h2 id="nginx-\u53C2\u6570\u4F18\u5316" tabindex="-1"><a class="header-anchor" href="#nginx-\u53C2\u6570\u4F18\u5316" aria-hidden="true">#</a> nginx \u53C2\u6570\u4F18\u5316</h2>`,61),r=s(`<li><p>\u5F00\u542F<code>gzip</code>\u538B\u7F29 \u5F00\u542F\u6807\u5FD7</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">gzip</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6587\u4EF6\u5927\u5C0F\u672A\u8FBE\u5230\u8BE5\u503C\uFF0C\u4E0D\u538B\u7F29\uFF0C\u6587\u4EF6\u5DF2\u8FBE\u5230\u8BE5\u503C\uFF0C\u538B\u7F29</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">gzip_min_length</span> <span class="token number">1k</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u8BBE\u7F6E<code>gzip</code>\u538B\u7F29\u6587\u4EF6\u4F7F\u7528\u7F13\u5B58\u7A7A\u95F4\u7684\u5927\u5C0F</p><ul><li><p><code>number</code>: \u5411\u7CFB\u7EDF\u7533\u8BF7\u6362\u79DF\u7A7A\u95F4\u7684\u4E2A\u6570</p></li><li><p><code>size</code>: \u6307\u5B9A\u6BCF\u4E2A\u7F13\u5B58\u7A7A\u95F4\u7684\u5927\u5C0F\uFF0C\u4E00\u822C\u53D6\u7CFB\u7EDF\u5185\u5B58\u9875\u4E00\u9875\u7684\u5927\u5C0F</p></li></ul><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">gzip_buffers</span> <span class="token number">4</span> <span class="token number">16k</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">gzip_http_version</span> 1.0</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7528\u4E8E\u538B\u7F29\u54CD\u5E94\u6240\u9700\u8981\u7684\u6700\u5C0F<code>http</code>\u534F\u8BAE\u7248\u672C\u3002\u6CE8\u610F\u53C2\u6570\u503C\uFF1A<code>1.0 | 1.1</code>\uFF0C\u6B64\u5904\u53EA\u80FD\u662F<code>1.0</code>\u6216\u8005<code>1.1</code></p><p>\u8BBE\u7F6E\u538B\u7F29<code>gzip</code>\u538B\u7F29\u7A0B\u5EA6\uFF0C\u5305\u62EC 1~9 \u53CA\uFF0C1 \u6700\u4F4E\uFF0C9 \u6700\u9AD8\uFF0C\u9ED8\u8BA4\u4E3A 1</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">gzip_com_level</span> <span class="token number">2</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u53C2\u6570\u503C\uFF1A\u54CD\u5E94\u62A5\u6587\u6570\u636E\u683C\u5F0F\uFF0C\u6216\u8005\u8BF4\u7C7B\u578B\uFF0C\u5BF9\u5E94<code>http</code>\u54CD\u5E94\u5934\u4E2D\u7684<code>Content-type</code>\u5B57\u6BB5\uFF0C\u5982\u5E38\u89C1\u7684\u6709<code>text/html</code>\u3001<code>text/css</code>\u3001<code>application/json</code>\u3001<code>application/javaScript</code>\u7B49\u3002\u7528\u4E8E\u6307\u5B9A\u8981\u538B\u7F29\u7684\u54CD\u5E94\u62A5\u6587\u7C7B\u578B\u3002\u201D *\u201D\u8868\u793A\u538B\u7F29\u6240\u6709\u683C\u5F0F\u7684\u54CD\u5E94\u62A5\u6587\uFF0C\u591A\u79CD\u683C\u5F0F\u7528\u7A7A\u683C\u9694\u5F00\u3002\u5982<code>text/html text/css</code>\u3002\u9ED8\u8BA4\u503C\uFF1Atext/html</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">gzip_types</span>       text/plain application/x-javascript text/css application/xml</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7528\u4E8E\u8BBE\u7F6E\u5728\u8FDB\u884C gzip \u538B\u7F29\u65F6\u662F\u5426\u53D1\u9001\u5E26\u6709 Vary:Accept-Encoding \u5934\u57DF\u7684\u54CD\u5E94\u5934\u90E8</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">gzip_vary</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6839\u636E\u4E0D\u540C\u7684\u5BA2\u6237\u7AEF\u8BF7\u6C42\u9009\u62E9\u6027\u7684\u5F00\u542F\u6216\u5173\u95ED gzip \u6307\u4EE4 gzip_disable MSIE [4-6]. \u5BF9 IE4-6 \u4E0D\u5F00\u542F gzip \u538B\u7F29</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">gzip_disable</span> msie6</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li>`,1),u=s(`<p>\u914D\u7F6E\u65E5\u5FD7\u683C\u5F0F</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">log_format</span> <span class="token string">&#39;<span class="token variable">$remote_addr</span> - <span class="token variable">$remote_user</span> [<span class="token variable">$time_local]</span> &quot;<span class="token variable">$request</span>&quot; &#39;</span>
                  <span class="token string">&#39;<span class="token variable">$status</span> <span class="token variable">$body_bytes_sent</span> &quot;<span class="token variable">$http_referer</span>&quot; &#39;</span>
                  <span class="token string">&#39;&quot;<span class="token variable">$http_user_agent</span>&quot; &quot;<span class="token variable">$http_x_forwarded_for</span>&quot;&#39;</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2),v=s("<li><p><code>$remote_addr</code> \u5BA2\u6237\u7AEF\u5730\u5740 219.227.111.255</p></li><li><p><code>$remote_user</code> \u5BA2\u6237\u7AEF\u7528\u6237\u540D\u79F0 \u2014</p></li><li><p><code>$time_local</code> \u8BBF\u95EE\u65F6\u95F4\u548C\u65F6\u533A 18/Jul/2014:17:00:01 +0800</p></li><li><p><code>$request</code> \u8BF7\u6C42\u7684 URI \u548C HTTP \u534F\u8BAE \u201CGET /article-10000.html HTTP/1.1\u201D</p></li>",4),m=n("code",null,"$http_host",-1),k=a(" \u8BF7\u6C42\u5730\u5740\uFF0C\u5373\u6D4F\u89C8\u5668\u4E2D\u4F60\u8F93\u5165\u7684\u5730\u5740\uFF08IP \u6216\u57DF\u540D\uFF09 "),b={href:"http://www.ha97.com",title:"www.ha97.com",target:"_blank",rel:"noopener noreferrer"},g=a("www.ha97.com"),h=n("li",null,[n("p",null,[n("code",null,"$status"),a(" HTTP \u8BF7\u6C42\u72B6\u6001 200")])],-1),_=n("li",null,[n("p",null,[n("code",null,"$upstream_status"),a(" upstream \u72B6\u6001 200")])],-1),x=n("li",null,[n("p",null,[n("code",null,"$body_bytes_sent"),a(" \u53D1\u9001\u7ED9\u5BA2\u6237\u7AEF\u6587\u4EF6\u5185\u5BB9\u5927\u5C0F 1547")])],-1),f=n("code",null,"$http_referer",-1),y=a(" url \u8DF3\u8F6C\u6765\u6E90 "),w={href:"https://www.google.com/",title:"https://www.google.com/",target:"_blank",rel:"noopener noreferrer"},q=a("https://www.google.com/"),$=s("<li><p><code>$http_user_agent</code> \u7528\u6237\u7EC8\u7AEF\u6D4F\u89C8\u5668\u7B49\u4FE1\u606F \u201CMozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; SV1; GTB7.0; .NET4.0C;</p></li><li><p><code>$ssl_protocol</code> SSL \u534F\u8BAE\u7248\u672C TLSv1</p></li><li><p><code>$ssl_cipher</code> \u4EA4\u6362\u6570\u636E\u4E2D\u7684\u7B97\u6CD5 RC4-SHA</p></li><li><p><code>$upstream_addr</code> \u540E\u53F0 upstream \u7684\u5730\u5740\uFF0C\u5373\u771F\u6B63\u63D0\u4F9B\u670D\u52A1\u7684\u4E3B\u673A\u5730\u5740 10.36.10.80:80</p></li><li><p><code>$request_time</code> \u6574\u4E2A\u8BF7\u6C42\u7684\u603B\u65F6\u95F4 0.165</p></li><li><p><code>$upstream_response_time</code> \u8BF7\u6C42\u8FC7\u7A0B\u4E2D\uFF0Cupstream \u54CD\u5E94\u65F6\u95F4 0.002</p></li><li><p><code>$remote_addr</code> \u4E0E<code>$http_x_forwarded_for</code> \u7528\u4EE5\u8BB0\u5F55\u5BA2\u6237\u7AEF\u7684 ip \u5730\u5740</p><blockquote><p>112.31.97.44 - - [08/Dec/2019:11:36:07 +0800] &quot;GET /goods/1.html HTTP/1.1&quot; 200 9898 &quot;-&quot; &quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36&quot;</p></blockquote></li>",7),E=s(`<li><p>\u53C2\u6570\u8C03\u4F18</p><div class="language-\u7EAF\u6587\u672C ext-\u7EAF\u6587\u672C line-numbers-mode"><pre class="language-\u7EAF\u6587\u672C"><code>user\u662F\u4E3B\u6A21\u5757\u6307\u4EE4\uFF0C\u5B9A\u4E49Nginx\u8FD0\u884C\u7684\u7528\u6237\u548C\u7528\u6237\u7EC4
    user nginx nginx;
    \u5DE5\u4F5C\u8FDB\u7A0B\u6570 \u8BBE\u7F6E\u4E3A\u81EA\u52A8
    worker_processes auto;
    nginx\u9ED8\u8BA4\u662F\u6CA1\u6709\u5F00\u542F\u5229\u7528\u591A\u6838cpu\u7684\u914D\u7F6E\u7684\u3002\u9700\u8981\u901A\u8FC7\u589E\u52A0worker_cpu_affinity\u914D\u7F6E\u53C2\u6570\u6765\u5145\u5206\u5229\u7528\u591A\u6838cpu\uFF0Ccpu\u662F\u4EFB\u52A1\u5904\u7406\uFF0C\u5F53\u8BA1\u7B97\u6700\u8D39\u65F6\u7684\u8D44\u6E90\u7684\u65F6\u5019\uFF0Ccpu\u6838\u4F7F\u7528\u4E0A\u7684\u8D8A\u591A\uFF0C\u6027\u80FD\u5C31\u8D8A\u597D
    worker_cpu_affinity 0001 0100 1000 0010;
    \u5355\u4E2A\u5DE5\u4F5C\u8FDB\u7A0B\u53EF\u4EE5\u5141\u8BB8\u540C\u65F6\u5EFA\u7ACB\u5916\u90E8\u8FDE\u63A5\u7684\u6570\u91CF \u4E00\u662F\u5185\u5B58\uFF0C\u4E8C\u662F\u64CD\u4F5C\u7CFB\u7EDF\u7EA7\u8FDB\u7A0B\u6700\u5927\u53EF\u6253\u5F00\u6587\u4EF6\u6570
    worker_connections  65535;
    \u8FDB\u7A0B\u6700\u5927\u53EF\u6253\u5F00\u6587\u4EF6\u6570
    worker_rlimit_nofile 65535;
  events {
      worker_connections 65535;
      \u6027\u80FD\u4F18\u5316-nginx\u4E8B\u4EF6\u5904\u7406\u6A21\u578B\u4F18\u5316use epoll;
      use epoll;
      \u7F51\u7EDC\u8FDE\u63A5\u7684\u4F18\u5316\u540C\u4E00\u65F6\u523B\u53EA\u6709\u4E00\u4E2A\u8BF7\u6C42\u800C\u907F\u514D\u591A\u4E2A\u7761\u7720\u8FDB\u7A0B\u88AB\u5524\u9192\u7684\u8BBE\u7F6E\uFF0Con\u4E3A\u9632\u6B62\u88AB\u540C\u65F6\u5524\u9192\uFF0C\u9ED8\u8BA4\u4E3Aoff\uFF0C\u56E0\u6B64nginx\u521A\u5B89\u88C5\u5B8C\u4EE5\u540E\u8981\u8FDB\u884C\u9002\u5F53\u7684\u4F18\u5316\u3002
      accept_mutex on;
      \u6253\u5F00\u540C\u65F6\u63A5\u53D7\u591A\u4E2A\u65B0\u7F51\u7EDC\u8FDE\u63A5\u8BF7\u6C42\u7684\u529F\u80FD\u3002
    multi_accept on;
  }
  \u8BBE\u7F6Eulimits\uFF1Aulimit -SHn 65535
  #\u670D\u52A1\u5668\u540D\u5B57\u7684hash\u8868\u5927\u5C0F
  server_names_hash_bucket_size 128;
  #\u7528\u4E8E\u6307\u5B9A\u6765\u81EA\u5BA2\u6237\u7AEF\u8BF7\u6C42\u5934headerbuffer\u5927\u5C0F\uFF0C\u5BF9\u4E8E\u5927\u591A\u6570\u8BF7\u6C42\uFF0C1KB\u7684\u7F13\u51B2\u533A\u5927\u5C0F\u5DF2\u7ECF\u8DB3\u591F\uFF0C\u5982\u679C\u81EA\u5B9A\u4E49\u4E86\u6D88\u606F\u5934\u6216\u6709\u66F4\u5927\u7684cookie\uFF0C\u53EF\u4EE5\u589E\u52A0\u7F13\u51B2\u533A\u5927\u5C0F\u3002\u8FD9\u91CC\u8BBE\u7F6E\u4E3A32KB
  client_header_buffer_size 32k;
  #\u7528\u6765\u6307\u5B9A\u5BA2\u6237\u7AEF\u8BF7\u6C42\u4E2D\u8F83\u5927\u7684\u6D88\u606F\u5934\u7684\u7F13\u5B58\u6700\u5927\u6570\u91CF\u548C\u5927\u5C0F\uFF0C\u201C4\u201D\u4E3A\u4E2A\u6570\uFF0C\u201C128\u201D\u4E3A\u5927\u5C0F\uFF0C\u6700\u5927\u7F13\u5B58\u4E3A4\u4E2A128KB\u3002
  large_client_header_buffers 4 128k;
  #\u5141\u8BB8\u5BA2\u6237\u7AEF\u8BF7\u6C42\u7684\u6700\u5927\u5355\u6587\u4EF6\u5B57\u8282\u6570
  client_max_body_size 10m;

     \u5B83\u53EF\u4EE5\u914D\u7F6E\u4E00\u6B21\u53D1\u9001\u6570\u636E\u7684\u5305\u5927\u5C0F\u3002\u4E5F\u5C31\u662F\u8BF4\uFF0C\u5B83\u4E0D\u662F\u6309\u65F6\u95F4\u7D2F\u8BA1  0.2 \u79D2\u540E\u53D1\u9001\u5305\uFF0C\u800C\u662F\u5F53\u5305\u7D2F\u8BA1\u5230\u4E00\u5B9A\u5927\u5C0F\u540E\u5C31\u53D1\u9001 \u5728 nginx \u4E2D\uFF0Ctcp_nopush \u5FC5\u987B\u548C sendfile \u642D\u914D\u4F7F\u7528\u3002
    tcp_nopush     on;
    \u53C2\u6570\u662F\u4E00\u4E2A\u8BF7\u6C42\u5B8C\u6210\u4E4B\u540E\u8FD8\u8981\u4FDD\u6301\u8FDE\u63A5\u591A\u4E45\uFF0C\u4E0D\u662F\u8BF7\u6C42\u65F6\u95F4\u591A\u4E45\uFF0C\u76EE\u7684\u662F\u4FDD\u6301\u957F\u8FDE\u63A5\uFF0C\u51CF\u5C11\u521B\u5EFA\u8FDE\u63A5\u8FC7\u7A0B\u7ED9\u7CFB\u7EDF\u5E26\u6765\u7684\u6027\u80FD\u635F\u8017\uFF0C\u7C7B\u4F3C\u4E8E\u7EBF\u7A0B\u6C60\uFF0C\u6570\u636E\u5E93\u8FDE\u63A5\u6C60
    keepalive_timeout  15;
    on \u4F1A\u589E\u52A0\u7531tcp\u534F\u8BAE\u6570\u636E\u5C0F\u5305\u7684\u6570\u91CF\uFF0C\u4F46\u662F\u53EF\u4EE5\u63D0\u9AD8\u54CD\u5E94\u901F\u5EA6\u3002\u5728\u53CA\u65F6\u6027\u9AD8\u7684\u901A\u4FE1\u573A\u666F\u4E2D\u5E94\u8BE5\u4F1A\u6709\u4E0D\u9519\u7684\u6548\u679C
    off \u4F1A\u589E\u52A0\u7531tcp\u534F\u8BAE\u901A\u4FE1\u7684\u5EF6\u65F6\uFF0C\u4F46\u662F\u4F1A\u63D0\u9AD8\u5E26\u5BBD\u5229\u7528\u7387\u3002\u5728\u9AD8\u5EF6\u65F6\u3001\u6570\u636E\u91CF\u5927\u7684\u901A\u4FE1\u573A\u666F\u4E2D\u5E94\u8BE5\u4F1A\u6709\u4E0D\u9519\u7684\u6548\u679C
    tcp_nodelay on;

    Nginx--&gt;\u8FDB\u9636--&gt;\u539F\u7406--&gt;Nginx+php+fastcgi\u7684\u539F\u7406\u4E0E\u5173\u7CFB  https://www.cnblogs.com/mangguoxiansheng/p/5967745.html
    fastcgi\u4F18\u5316\u6027\u80FD\u8C03\u4F18 http \u5C42\u52A0\u4E0Afastcgi\u53C2\u6570\u5982\u4E0B\uFF1A

    #\u8FDE\u63A5\u5230\u540E\u7AEFfastcgi\u8D85\u65F6\u65F6\u95F4
    fastcgi_connect_timeout 300;
    #\u5411fastcgi\u8BF7\u6C42\u8D85\u65F6\u65F6\u95F4(\u8FD9\u4E2A\u6307\u5B9A\u503C\u5DF2\u7ECF\u5B8C\u6210\u4E24\u6B21\u63E1\u624B\u540E\u5411fastcgi\u4F20\u9001\u8BF7\u6C42\u7684\u8D85\u65F6\u65F6\u95F4
    fastcgi_send_timeout 300;
    #\u63A5\u6536fastcgi\u5E94\u7B54\u8D85\u65F6\u65F6\u95F4\uFF0C\u540C\u7406\u4E5F\u662F2\u6B21\u63E1\u624B\u540E
    fastcgi_read_timeout 300;
    #\u8BFB\u53D6fastcgi\u5E94\u7B54\u7B2C\u4E00\u90E8\u5206\u9700\u8981\u591A\u5927\u7F13\u51B2\u533A\uFF0C\u8BE5\u503C\u8868\u793A\u4F7F\u75281\u4E2A64kb\u7684\u7F13\u51B2\u533A\u8BFB\u53D6\u5E94\u7B54\u7B2C\u4E00\u90E8\u5206(\u5E94\u7B54\u5934),\u53EF\u4EE5\u8BBE\u7F6E\u4E3Afastcgi_buffers\u9009\u9879\u7F13\u51B2\u533A\u5927\u5C0F
    fastcgi_buffer_size 64k;
    #\u6307\u5B9A\u672C\u5730\u9700\u8981\u591A\u5C11\u548C\u591A\u5927\u7684\u7F13\u51B2\u533A\u6765\u7F13\u51B2fastcgi\u5E94\u7B54\u8BF7\u6C42\uFF0C\u5047\u8BBE\u4E00\u4E2Aphp\u6216java\u811A\u672C\u6240\u4EA7\u751F\u9875\u9762\u5927\u5C0F\u4E3A256kb,\u90A3\u4E48\u4F1A\u4E3A\u5176\u5206\u914D4\u4E2A64kb\u7684\u7F13\u51B2\u6765\u7F13\u5B58\uFF1B\u82E5\u9875\u9762\u5927\u4E8E256kb,\u90A3\u4E48\u5927\u4E8E\u7684256kb\u7684\u90E8\u5206\u4F1A\u7F13\u5B58\u5230fastcgi_temp\u6307\u5B9A\u8DEF\u5F84\u4E2D\uFF0C\u8FD9\u5E76\u975E\u662F\u4E2A\u597D\u529E\u6CD5\uFF0C\u5185\u5B58\u6570\u636E\u5904\u7406\u5FEB\u4E8E\u786C\u76D8\uFF0C\u4E00\u822C\u8BE5\u503C\u5E94\u8BE5\u4E3A\u7AD9\u70B9\u4E2Dphp/java\u811A\u672C\u6240\u4EA7\u751F\u9875\u9762\u5927\u5C0F\u4E2D\u95F4\u503C\uFF0C\u5982\u679C\u7AD9\u70B9\u5927\u90E8\u5206\u811A\u672C\u6240\u4EA7\u751F\u7684\u9875\u9762\u5927\u5C0F\u4E3A256kb\uFF0C\u90A3\u4E48\u53EF\u628A\u503C\u8BBE\u7F6E\u4E3A16 16k,4 64k\u7B49
    fastcgi_buffers 4 64k;
    #\u9ED8\u8BA4\u503C\u662Ffastcgi_buffer\u76842\u500D
    fastcgi_busy_buffers_size 128k;
    #\u5199\u5165\u7F13\u5B58\u6587\u4EF6\u4F7F\u7528\u591A\u5927\u7684\u6570\u636E\u5757\uFF0C\u9ED8\u8BA4\u503C\u662Ffastcgi_buffer\u76842\u500D
    fastcgi_temp_file_write_size 128k;

    #\u7F13\u5B58\u8DEF\u5F84\u6587\u4EF6\uFF0C\u76EE\u5F55\u7ED3\u6784\u7B49\u7EA7\uFF0C\u5173\u952E\u5B57\u533A\u57DF\u5B9E\u9645\u548C\u975E\u6D3B\u52A8\u65F6\u95F4
    fastcgi_cache_path  /usr/local/nginx/fastcgi_cache levels=1:2 keys_zone=TEST:10m inactive=5m;
    #\u7F13\u5B58\u7684\u5730\u5740
    fastcgi_cache_key &quot;$request_method://$host$request_uri&quot;;
    #\u8BE5\u6307\u4EE4\u7528\u4E8E\u8BBE\u7F6E\u7F13\u5B58\u54EA\u4E9BHTTP\u65B9\u6CD5\uFF0C\u9ED8\u8BA4\u7F13\u5B58HTTP GET/HEAD\u65B9\u6CD5
    fastcgi_cache_methods GET HEAD;
    #\u5F00\u542Ffastcgi\u7F13\u5B58\u5E76\u4E3A\u5176\u6307\u5B9A\u4E3ATEST\u540D\u79F0\uFF0C\u964D\u4F4Ecpu\u8D1F\u8F7D,\u9632\u6B62502\u9519\u8BEF\u53D1\u751F.
    fastcgi_cache TEST;
    #\u5E94\u7B54\u4EE3\u7801\u7F13\u5B58\u65F6\u95F4\uFF0C200\u548C302\u5E94\u7B54\u7F13\u5B58\u4E3A1\u4E2A\u5C0F\u65F6\uFF0C301\u4E00\u5929,\u5176\u4ED61\u5206\u949F
    fastcgi_cache_valid 200 302 1h;
    fastcgi_cache_valid 301 1d;
    fastcgi_cache_valid any 1m;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>\u9690\u85CF<code>nginx</code>\u7248\u672C\u53F7 \u5728<code>http</code>\u6A21\u5757\u4E2D\u914D\u7F6E</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">server_tokens</span> <span class="token boolean">off</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li>`,2),T=s(`<h3 id="\u914D\u7F6E\u4F18\u5316" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E\u4F18\u5316" aria-hidden="true">#</a> \u914D\u7F6E\u4F18\u5316</h3><p><code>nginx.conf</code></p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token comment">#1.\u5F00\u542Fgzip\u538B\u7F29</span>
<span class="token comment">#\u5F00\u542F\u6807\u5FD7</span>
<span class="token directive"><span class="token keyword">gzip</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u6587\u4EF6\u5927\u5C0F\u672A\u8FBE\u5230\u8BE5\u503C\uFF0C\u4E0D\u538B\u7F29 \u6587\u4EF6\u5DF2\u8FBE\u5230\u8BE5\u503C\uFF0C\u538B\u7F29</span>
<span class="token directive"><span class="token keyword">gzip_min_length</span>  <span class="token number">1k</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u7528\u4E8E\u8BBE\u7F6EGzip\u538B\u7F29\u6587\u4EF6\u4F7F\u7528\u7F13\u5B58\u7A7A\u95F4\u7684\u5927\u5C0F number:\u5411\u7CFB\u7EDF\u7533\u8BF7\u6362\u7C97\u7A7A\u95F4\u7684\u4E2A\u6570\uFF0Csize\uFF1A\u6307\u5B9A\u6BCF\u4E2A\u7F13\u5B58\u7A7A\u95F4\u7684\u5927\u5C0F\uFF0C\u4E00\u822C\u53D6\u7CFB\u7EDF\u5185\u5B58\u9875\u4E00\u9875\u7684\u5927\u5C0F</span>
<span class="token directive"><span class="token keyword">gzip_buffers</span>     <span class="token number">4</span> <span class="token number">16k</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u53C2\u6570\u503C\uFF1A1.0 | 1.1\uFF0C\u6CE8\u610F\uFF0C\u6B64\u5904\u53EA\u80FD\u662F1.0\uFF0C\u6216\u80051.1\u3002\u8BBE\u7F6E\u538B\u7F29\u54CD\u5E94\u6240\u9700\u7684\u6700\u5C0Fhttp\u534F\u8BAE\u7248\u672C</span>
<span class="token directive"><span class="token keyword">gzip_http_version</span> 1.0</span><span class="token punctuation">;</span>
<span class="token comment">#\u8BBE\u7F6Egzip\u538B\u7F29\u7A0B\u5EA6\uFF0C\u5305\u62EC1~9\u7EA7\u522B\uFF0C1\u6700\u4F4E\uFF0C9\u6700\u9AD8\uFF0C\u9ED8\u8BA4\u4E3A1</span>
<span class="token directive"><span class="token keyword">gzip_comp_level</span> <span class="token number">2</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u53C2\u6570\u503C\uFF1A\u54CD\u5E94\u62A5\u6587\u6570\u636E\u683C\u5F0F\uFF0C\u6216\u8005\u8BF4\u7C7B\u578B\uFF0C\u5BF9\u5E94http\u54CD\u5E94\u5934\u4E2D\u7684Content-type\u5B57\u6BB5\uFF0C\u5982\u5E38\u89C1\u7684\u6709text/html\u3001text/css\u3001application/json\u3001application/javaScript\u7B49\u3002\u7528\u4E8E\u6307\u5B9A\u8981\u538B\u7F29\u7684\u54CD\u5E94\u62A5\u6587\u7C7B\u578B\u3002\u201D*\u201D\u8868\u793A\u538B\u7F29\u6240\u6709\u683C\u5F0F\u7684\u54CD\u5E94\u62A5\u6587\uFF0C\u591A\u79CD\u683C\u5F0F\u7528\u7A7A\u683C\u9694\u5F00\u3002\u5982text/html text/css\u3002\u9ED8\u8BA4\u503C\uFF1Atext/html</span>
<span class="token directive"><span class="token keyword">gzip_types</span>       text/plain application/x-javascript text/css application/xml</span><span class="token punctuation">;</span>
<span class="token comment">#\u7528\u4E8E\u8BBE\u7F6E\u5728\u8FDB\u884Cgzip\u538B\u7F29\u65F6\u662F\u5426\u53D1\u9001\u5E26\u6709Vary:Accept-Encoding\u5934\u57DF\u7684\u54CD\u5E94\u5934\u90E8\uFF1Bgzip_vary on | off</span>
<span class="token directive"><span class="token keyword">gzip_vary</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u6839\u636E\u4E0D\u540C\u7684\u5BA2\u6237\u7AEF\u8BF7\u6C42\u9009\u62E9\u6027\u7684\u5F00\u542F\u6216\u5173\u95EDgzip\u6307\u4EE4gzip_disable MSIE [4-6]\\. \u5BF9IE4-6\u4E0D\u5F00\u542Fgzip\u538B\u7F29</span>
<span class="token directive"><span class="token keyword">gzip_disable</span> msie6</span><span class="token punctuation">;</span>

<span class="token directive"><span class="token keyword">include</span> vhost/*.conf</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6211\u4EEC\u5728<code>include vhost/*.conf;</code>\u8FD9\u4E00\u884C\u4E0A\u9762\u6DFB\u52A0\u4E0A\u8FF0\u4F18\u5316\u914D\u7F6E\u7136\u540E\u8FDB\u884C<code>nginx -t</code>\u68C0\u6D4B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 sbin<span class="token punctuation">]</span><span class="token comment"># ./nginx -t</span>
nginx: the configuration <span class="token function">file</span> /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration <span class="token function">file</span> /usr/local/nginx/conf/nginx.conf <span class="token builtin class-name">test</span> is successful

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u67E5\u770B<code>nginx</code>\u65E5\u5FD7</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 logs<span class="token punctuation">]</span><span class="token comment"># tail -F access.log</span>
<span class="token number">192.168</span>.33.1 - - <span class="token punctuation">[</span><span class="token number">13</span>/Aug/2022:08:32:16 +0000<span class="token punctuation">]</span> <span class="token string">&quot;GET / HTTP/1.1&quot;</span> <span class="token number">200</span> <span class="token number">612</span> <span class="token string">&quot;-&quot;</span> <span class="token string">&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47&quot;</span>
<span class="token number">192.168</span>.33.1 - - <span class="token punctuation">[</span><span class="token number">13</span>/Aug/2022:08:32:16 +0000<span class="token punctuation">]</span> <span class="token string">&quot;GET /favicon.ico HTTP/1.1&quot;</span> <span class="token number">404</span> <span class="token number">555</span> <span class="token string">&quot;http://192.168.33.10/&quot;</span> <span class="token string">&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47&quot;</span>
<span class="token number">192.168</span>.33.1 - - <span class="token punctuation">[</span><span class="token number">13</span>/Aug/2022:08:39:50 +0000<span class="token punctuation">]</span> <span class="token string">&quot;GET / HTTP/1.1&quot;</span> <span class="token number">200</span> <span class="token number">14</span> <span class="token string">&quot;-&quot;</span> <span class="token string">&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47&quot;</span>
<span class="token number">192.168</span>.33.1 - - <span class="token punctuation">[</span><span class="token number">13</span>/Aug/2022:08:48:42 +0000<span class="token punctuation">]</span> <span class="token string">&quot;GET / HTTP/1.1&quot;</span> <span class="token number">304</span> <span class="token number">0</span> <span class="token string">&quot;-&quot;</span> <span class="token string">&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47&quot;</span>
<span class="token number">192.168</span>.33.1 - - <span class="token punctuation">[</span><span class="token number">13</span>/Aug/2022:10:02:27 +0000<span class="token punctuation">]</span> <span class="token string">&quot;GET / HTTP/1.1&quot;</span> <span class="token number">304</span> <span class="token number">0</span> <span class="token string">&quot;-&quot;</span> <span class="token string">&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47&quot;</span>
<span class="token number">192.168</span>.33.1 - - <span class="token punctuation">[</span><span class="token number">13</span>/Aug/2022:11:00:08 +0000<span class="token punctuation">]</span> <span class="token string">&quot;GET / HTTP/1.1&quot;</span> <span class="token number">304</span> <span class="token number">0</span> <span class="token string">&quot;-&quot;</span> <span class="token string">&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47&quot;</span>
<span class="token number">192.168</span>.33.1 - - <span class="token punctuation">[</span><span class="token number">13</span>/Aug/2022:11:00:14 +0000<span class="token punctuation">]</span> <span class="token string">&quot;GET / HTTP/1.1&quot;</span> <span class="token number">304</span> <span class="token number">0</span> <span class="token string">&quot;-&quot;</span> <span class="token string">&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.47&quot;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6DFB\u52A0\u65E5\u5FD7\u8BB0\u5F55\u914D\u7F6E</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token comment"># nginx\u65E5\u5FD7\u8BB0\u5F55\u683C\u5F0F</span>
<span class="token directive"><span class="token keyword">log_format</span> <span class="token string">&#39;<span class="token variable">$remote_addr</span> - <span class="token variable">$remote_user</span> [<span class="token variable">$time_local]</span> &quot;<span class="token variable">$request</span>&quot; &#39;</span>
                  <span class="token string">&#39;<span class="token variable">$status</span> <span class="token variable">$body_bytes_sent</span> &quot;<span class="token variable">$http_referer</span>&quot; &#39;</span>
                  <span class="token string">&#39;&quot;<span class="token variable">$http_user_agent</span>&quot; &quot;<span class="token variable">$http_x_forwarded_for</span>&quot;&#39;</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u5728<code>nginx.conf</code>\u5934\u90E8\u5206\u66FF\u6362\u539F\u5148\u7684\u5185\u5BB9</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token comment">#user\u662F\u4E3B\u6A21\u5757\u6307\u4EE4\uFF0C\u5B9A\u4E49Nginx\u8FD0\u884C\u7684\u7528\u6237\u548C\u7528\u6237\u7EC4</span>
<span class="token directive"><span class="token keyword">user</span> nginx nginx</span><span class="token punctuation">;</span>
<span class="token comment">#\u5DE5\u4F5C\u8FDB\u7A0B\u6570 \u8BBE\u7F6E\u4E3A\u81EA\u52A8</span>
<span class="token directive"><span class="token keyword">worker_processes</span> auto</span><span class="token punctuation">;</span>
<span class="token comment">#nginx\u9ED8\u8BA4\u662F\u6CA1\u6709\u5F00\u542F\u5229\u7528\u591A\u6838cpu\u7684\u914D\u7F6E\u7684\u3002\u9700\u8981\u901A\u8FC7\u589E\u52A0worker_cpu_affinity\u914D\u7F6E\u53C2\u6570\u6765\u5145\u5206\u5229\u7528\u591A\u6838cpu\uFF0Ccpu\u662F\u4EFB\u52A1\u5904\u7406\uFF0C\u5F53\u8BA1\u7B97\u6700\u8D39\u65F6\u7684\u8D44\u6E90\u7684\u65F6\u5019\uFF0Ccpu\u6838\u4F7F\u7528\u4E0A\u7684\u8D8A\u591A\uFF0C\u6027\u80FD\u5C31\u8D8A\u597D</span>
<span class="token directive"><span class="token keyword">worker_cpu_affinity</span> <span class="token number">1</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u8FDB\u7A0B\u6700\u5927\u53EF\u6253\u5F00\u6587\u4EF6\u6570</span>
<span class="token directive"><span class="token keyword">worker_rlimit_nofile</span> <span class="token number">65535</span></span><span class="token punctuation">;</span>

<span class="token comment">#error_log  logs/error.log;</span>
<span class="token comment">#error_log  logs/error.log  notice;</span>
<span class="token comment">#error_log  logs/error.log  info;</span>

<span class="token comment">#pid        logs/nginx.pid;</span>


<span class="token directive"><span class="token keyword">events</span></span> <span class="token punctuation">{</span>
  <span class="token comment">#\u5355\u4E2A\u5DE5\u4F5C\u8FDB\u7A0B\u53EF\u4EE5\u5141\u8BB8\u540C\u65F6\u5EFA\u7ACB\u5916\u90E8\u8FDE\u63A5\u7684\u6570\u91CF</span>
  <span class="token directive"><span class="token keyword">worker_connections</span> <span class="token number">65535</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u6027\u80FD\u4F18\u5316-nginx\u4E8B\u4EF6\u5904\u7406\u6A21\u578B\u4F18\u5316use epoll;</span>
  <span class="token directive"><span class="token keyword">use</span> epoll</span><span class="token punctuation">;</span>
  <span class="token comment">#\u7F51\u7EDC\u8FDE\u63A5\u7684\u4F18\u5316\u540C\u4E00\u65F6\u523B\u53EA\u6709\u4E00\u4E2A\u8BF7\u6C42\u800C\u907F\u514D\u591A\u4E2A\u7761\u7720\u8FDB\u7A0B\u88AB\u5524\u9192\u7684\u8BBE\u7F6E\uFF0Con\u4E3A\u9632\u6B62\u88AB\u540C\u65F6\u5524\u9192\uFF0C\u9ED8\u8BA4\u4E3Aoff\uFF0C\u56E0\u6B64nginx\u521A\u5B89\u88C5\u5B8C\u4EE5\u540E\u8981\u8FDB\u884C\u9002\u5F53\u7684\u4F18\u5316\u3002</span>
  <span class="token directive"><span class="token keyword">accept_mutex</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u6253\u5F00\u540C\u65F6\u63A5\u53D7\u591A\u4E2A\u65B0\u7F51\u7EDC\u8FDE\u63A5\u8BF7\u6C42\u7684\u529F\u80FD\u3002</span>
  <span class="token directive"><span class="token keyword">multi_accept</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u518D\u6B21\u8BED\u6CD5\u68C0\u6D4B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 ~<span class="token punctuation">]</span><span class="token comment"># /usr/local/nginx/sbin/nginx -t</span>
nginx: the configuration <span class="token function">file</span> /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration <span class="token function">file</span> /usr/local/nginx/conf/nginx.conf <span class="token builtin class-name">test</span> is successful

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u518D\u6B21\u91CD\u542F\u4E00\u4E0B<code>nginx</code>\u670D\u52A1</p><p>\u8BBE\u7F6E<code>ulimits</code>\u7684\u6700\u5927\u914D\u7F6E\uFF0C\u4E5F\u5C31\u662F\u6700\u5927\u6253\u5F00\u6587\u4EF6\u7684\u6570\u91CF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 ~<span class="token punctuation">]</span><span class="token comment"># ulimit -SHn 65535</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7EE7\u7EED\u914D\u7F6E\uFF0C\u4E3B\u8981\u8BBE\u7F6E\u5728<code>http</code>\u6A21\u5757\u4E2D</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">http</span></span> <span class="token punctuation">{</span>
    <span class="token directive"><span class="token keyword">include</span>       mime.types</span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">default_type</span>  application/octet-stream</span><span class="token punctuation">;</span>

  <span class="token comment">#\u670D\u52A1\u5668\u540D\u5B57\u7684hash\u8868\u5927\u5C0F</span>
  <span class="token directive"><span class="token keyword">server_names_hash_bucket_size</span> <span class="token number">128</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u7528\u4E8E\u6307\u5B9A\u6765\u81EA\u5BA2\u6237\u7AEF\u8BF7\u6C42\u5934headerbuffer\u5927\u5C0F\uFF0C\u5BF9\u4E8E\u5927\u591A\u6570\u8BF7\u6C42\uFF0C1KB\u7684\u7F13\u51B2\u533A\u5927\u5C0F\u5DF2\u7ECF\u8DB3\u591F\uFF0C\u5982\u679C\u81EA\u5B9A\u4E49\u4E86\u6D88\u606F\u5934\u6216\u6709\u66F4\u5927\u7684cookie\uFF0C\u53EF\u4EE5\u589E\u52A0\u7F13\u51B2\u533A\u5927\u5C0F\u3002\u8FD9\u91CC\u8BBE\u7F6E\u4E3A32KB</span>
  <span class="token directive"><span class="token keyword">client_header_buffer_size</span> <span class="token number">32k</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u7528\u6765\u6307\u5B9A\u5BA2\u6237\u7AEF\u8BF7\u6C42\u4E2D\u8F83\u5927\u7684\u6D88\u606F\u5934\u7684\u7F13\u5B58\u6700\u5927\u6570\u91CF\u548C\u5927\u5C0F\uFF0C\u201C4\u201D\u4E3A\u4E2A\u6570\uFF0C\u201C128\u201D\u4E3A\u5927\u5C0F\uFF0C\u6700\u5927\u7F13\u5B58\u4E3A4\u4E2A128KB\u3002</span>
  <span class="token directive"><span class="token keyword">large_client_header_buffers</span> <span class="token number">4</span> <span class="token number">128k</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u5141\u8BB8\u5BA2\u6237\u7AEF\u8BF7\u6C42\u7684\u6700\u5927\u5355\u6587\u4EF6\u5B57\u8282\u6570</span>
  <span class="token directive"><span class="token keyword">client_max_body_size</span> <span class="token number">10m</span></span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u63A5\u4E0B\u6765\u8FD8\u662F\u7EE7\u7EED\u5728<code>http</code>\u6A21\u5757\u91CC\u914D\u7F6E</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">sendfile</span>        <span class="token boolean">on</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u5B83\u53EF\u4EE5\u914D\u7F6E\u4E00\u6B21\u53D1\u9001\u6570\u636E\u7684\u5305\u5927\u5C0F\u3002\u4E5F\u5C31\u662F\u8BF4\uFF0C\u5B83\u4E0D\u662F\u6309\u65F6\u95F4\u7D2F\u8BA1  0.2 \u79D2\u540E\u53D1\u9001\u5305\uFF0C\u800C\u662F\u5F53\u5305\u7D2F\u8BA1\u5230\u4E00\u5B9A\u5927\u5C0F\u540E\u5C31\u53D1\u9001 \u5728 nginx \u4E2D\uFF0Ctcp_nopush \u5FC5\u987B\u548C sendfile \u642D\u914D\u4F7F\u7528\u3002</span>
<span class="token directive"><span class="token keyword">tcp_nopush</span>     <span class="token boolean">on</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8BBE\u7F6E<code>keepalive_timeout</code>\u7684\u503C \u4E3A 15</p><blockquote><p>\u4FDD\u6301\u957F\u8FDE\u63A5\uFF0C\u51CF\u5C11\u521B\u5EFA\u8FDE\u63A5\u8FC7\u7A0B\u7ED9\u7CFB\u7EDF\u5E26\u6765\u7684\u6027\u80FD\u635F\u8017</p></blockquote><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">keepalive_timeout</span>  <span class="token number">15</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u8BBE\u7F6E<code>TCP\u5EF6\u8FDF\u5904\u7406</code>\uFF0C\u4E5F\u662F\u5728<code>http</code>\u6A21\u5757\u4E2D</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token comment">#on \u4F1A\u589E\u52A0\u7531tcp\u534F\u8BAE\u6570\u636E\u5C0F\u5305\u7684\u6570\u91CF\uFF0C\u4F46\u662F\u53EF\u4EE5\u63D0\u9AD8\u54CD\u5E94\u901F\u5EA6\u3002\u5728\u53CA\u65F6\u6027\u9AD8\u7684\u901A\u4FE1\u573A\u666F\u4E2D\u5E94\u8BE5\u4F1A\u6709\u4E0D\u9519\u7684\u6548\u679C</span>
<span class="token comment">#off \u4F1A\u589E\u52A0\u7531tcp\u534F\u8BAE\u901A\u4FE1\u7684\u5EF6\u65F6\uFF0C\u4F46\u662F\u4F1A\u63D0\u9AD8\u5E26\u5BBD\u5229\u7528\u7387\u3002\u5728\u9AD8\u5EF6\u65F6\u3001\u6570\u636E\u91CF\u5927\u7684\u901A\u4FE1\u573A\u666F\u4E2D\u5E94\u8BE5\u4F1A\u6709\u4E0D\u9519\u7684\u6548\u679C</span>
<span class="token directive"><span class="token keyword">tcp_nodelay</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8BBE\u7F6E<code>fastcgi</code>\u914D\u7F6E\uFF0C\u4E5F\u662F\u5728<code>http</code>\u6A21\u5757\u4E2D</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token comment">#\u8FDE\u63A5\u5230\u540E\u7AEFfastcgi\u8D85\u65F6\u65F6\u95F4</span>
<span class="token directive"><span class="token keyword">fastcgi_connect_timeout</span> <span class="token number">300</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u5411fastcgi\u8BF7\u6C42\u8D85\u65F6\u65F6\u95F4(\u8FD9\u4E2A\u6307\u5B9A\u503C\u5DF2\u7ECF\u5B8C\u6210\u4E24\u6B21\u63E1\u624B\u540E\u5411fastcgi\u4F20\u9001\u8BF7\u6C42\u7684\u8D85\u65F6\u65F6\u95F4</span>
<span class="token directive"><span class="token keyword">fastcgi_send_timeout</span> <span class="token number">300</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u63A5\u6536fastcgi\u5E94\u7B54\u8D85\u65F6\u65F6\u95F4\uFF0C\u540C\u7406\u4E5F\u662F2\u6B21\u63E1\u624B\u540E</span>
<span class="token directive"><span class="token keyword">fastcgi_read_timeout</span> <span class="token number">300</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u8BFB\u53D6fastcgi\u5E94\u7B54\u7B2C\u4E00\u90E8\u5206\u9700\u8981\u591A\u5927\u7F13\u51B2\u533A\uFF0C\u8BE5\u503C\u8868\u793A\u4F7F\u75281\u4E2A64kb\u7684\u7F13\u51B2\u533A\u8BFB\u53D6\u5E94\u7B54\u7B2C\u4E00\u90E8\u5206(\u5E94\u7B54\u5934),\u53EF\u4EE5\u8BBE\u7F6E\u4E3Afastcgi_buffers\u9009\u9879\u7F13\u51B2\u533A\u5927\u5C0F</span>
<span class="token directive"><span class="token keyword">fastcgi_buffer_size</span> <span class="token number">64k</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u6307\u5B9A\u672C\u5730\u9700\u8981\u591A\u5C11\u548C\u591A\u5927\u7684\u7F13\u51B2\u533A\u6765\u7F13\u51B2fastcgi\u5E94\u7B54\u8BF7\u6C42\uFF0C\u5047\u8BBE\u4E00\u4E2Aphp\u6216java\u811A\u672C\u6240\u4EA7\u751F\u9875\u9762\u5927\u5C0F\u4E3A256kb,\u90A3\u4E48\u4F1A\u4E3A\u5176\u5206\u914D4\u4E2A64kb\u7684\u7F13\u51B2\u6765\u7F13\u5B58\uFF1B\u82E5\u9875\u9762\u5927\u4E8E256kb,\u90A3\u4E48\u5927\u4E8E\u7684256kb\u7684\u90E8\u5206\u4F1A\u7F13\u5B58\u5230fastcgi_temp\u6307\u5B9A\u8DEF\u5F84\u4E2D\uFF0C\u8FD9\u5E76\u975E\u662F\u4E2A\u597D\u529E\u6CD5\uFF0C\u5185\u5B58\u6570\u636E\u5904\u7406\u5FEB\u4E8E\u786C\u76D8\uFF0C\u4E00\u822C\u8BE5\u503C\u5E94\u8BE5\u4E3A\u7AD9\u70B9\u4E2Dphp/java\u811A\u672C\u6240\u4EA7\u751F\u9875\u9762\u5927\u5C0F\u4E2D\u95F4\u503C\uFF0C\u5982\u679C\u7AD9\u70B9\u5927\u90E8\u5206\u811A\u672C\u6240\u4EA7\u751F\u7684\u9875\u9762\u5927\u5C0F\u4E3A256kb\uFF0C\u90A3\u4E48\u53EF\u628A\u503C\u8BBE\u7F6E\u4E3A16 16k,4 64k\u7B49</span>
<span class="token directive"><span class="token keyword">fastcgi_buffers</span> <span class="token number">4</span> <span class="token number">64k</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u9ED8\u8BA4\u503C\u662Ffastcgi_buffer\u76842\u500D</span>
<span class="token directive"><span class="token keyword">fastcgi_busy_buffers_size</span> <span class="token number">128k</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u5199\u5165\u7F13\u5B58\u6587\u4EF6\u4F7F\u7528\u591A\u5927\u7684\u6570\u636E\u5757\uFF0C\u9ED8\u8BA4\u503C\u662Ffastcgi_buffer\u76842\u500D</span>
<span class="token directive"><span class="token keyword">fastcgi_temp_file_write_size</span> <span class="token number">128k</span></span><span class="token punctuation">;</span>

<span class="token comment">#\u7F13\u5B58\u8DEF\u5F84\u6587\u4EF6\uFF0C\u76EE\u5F55\u7ED3\u6784\u7B49\u7EA7\uFF0C\u5173\u952E\u5B57\u533A\u57DF\u5B9E\u9645\u548C\u975E\u6D3B\u52A8\u65F6\u95F4</span>
<span class="token directive"><span class="token keyword">fastcgi_cache_path</span>  /usr/local/nginx/fastcgi_cache levels=1:2 keys_zone=TEST:10m inactive=5m</span><span class="token punctuation">;</span>
<span class="token comment">#\u7F13\u5B58\u7684\u5730\u5740</span>
<span class="token directive"><span class="token keyword">fastcgi_cache_key</span> <span class="token string">&quot;<span class="token variable">$request_method://</span><span class="token variable">$host</span><span class="token variable">$request_uri</span>&quot;</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u8BE5\u6307\u4EE4\u7528\u4E8E\u8BBE\u7F6E\u7F13\u5B58\u54EA\u4E9BHTTP\u65B9\u6CD5\uFF0C\u9ED8\u8BA4\u7F13\u5B58HTTP GET/HEAD\u65B9\u6CD5</span>
<span class="token directive"><span class="token keyword">fastcgi_cache_methods</span> GET HEAD</span><span class="token punctuation">;</span>
<span class="token comment">#\u5F00\u542Ffastcgi\u7F13\u5B58\u5E76\u4E3A\u5176\u6307\u5B9A\u4E3ATEST\u540D\u79F0\uFF0C\u964D\u4F4Ecpu\u8D1F\u8F7D,\u9632\u6B62502\u9519\u8BEF\u53D1\u751F.</span>
<span class="token directive"><span class="token keyword">fastcgi_cache</span> TEST</span><span class="token punctuation">;</span>
<span class="token comment">#\u5E94\u7B54\u4EE3\u7801\u7F13\u5B58\u65F6\u95F4\uFF0C200\u548C302\u5E94\u7B54\u7F13\u5B58\u4E3A1\u4E2A\u5C0F\u65F6\uFF0C301\u4E00\u5929,\u5176\u4ED61\u5206\u949F</span>
<span class="token directive"><span class="token keyword">fastcgi_cache_valid</span> <span class="token number">200</span> <span class="token number">302</span> <span class="token number">1h</span></span><span class="token punctuation">;</span>
<span class="token directive"><span class="token keyword">fastcgi_cache_valid</span> <span class="token number">301</span> <span class="token number">1d</span></span><span class="token punctuation">;</span>
<span class="token directive"><span class="token keyword">fastcgi_cache_valid</span> any <span class="token number">1m</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4E0A\u9762\u7684\u7F13\u5B58<code>fastcgi_cache</code>\u76EE\u5F55\u9700\u8981\u6211\u4EEC\u63D0\u524D\u521B\u5EFA\u4E00\u4E0B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">mkdir</span> -p /usr/local/nginx/fastcgi_cache

<span class="token comment"># \u6743\u9650</span>
<span class="token function">chown</span> -R nginx.nginx /usr/local/nginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5F00\u542F<code>fascgi_cache</code>\u4E4B\u540E\u4F1A\u591A\u51E0\u4E2A\u8FDB\u7A0B\u542F\u52A8</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 ~<span class="token punctuation">]</span><span class="token comment"># ps -ef | grep nginx</span>
root     <span class="token number">19828</span>     <span class="token number">1</span>  <span class="token number">0</span> <span class="token number">19</span>:18 ?        00:00:00 nginx: master process /usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
nginx    <span class="token number">19860</span> <span class="token number">19828</span>  <span class="token number">1</span> <span class="token number">19</span>:38 ?        00:00:00 nginx: worker process
nginx    <span class="token number">19861</span> <span class="token number">19828</span>  <span class="token number">0</span> <span class="token number">19</span>:38 ?        00:00:00 nginx: worker process
nginx    <span class="token number">19862</span> <span class="token number">19828</span>  <span class="token number">0</span> <span class="token number">19</span>:38 ?        00:00:00 nginx: cache manager process
nginx    <span class="token number">19863</span> <span class="token number">19828</span>  <span class="token number">0</span> <span class="token number">19</span>:38 ?        00:00:00 nginx: cache loader process
root     <span class="token number">19865</span> <span class="token number">19695</span>  <span class="token number">0</span> <span class="token number">19</span>:38 pts/0    00:00:00 <span class="token function">grep</span> --color<span class="token operator">=</span>auto nginx

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6240\u4EE5\u4E0B\u6B21\u4F60\u6539\u9875\u9762\u3010PHP\u3011\u7684\u65F6\u5019\uFF0C\u4E0D\u4E00\u5B9A\u4F1A\u5373\u65F6\u751F\u6548\uFF0C\u56E0\u4E3A\u6709\u7F13\u5B58</p><p>\u8BBE\u7F6E\u9690\u85CF\u7248\u672C\u53F7</p><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220813221425.png" alt="" loading="lazy"></p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token comment"># \u9690\u85CF\u7248\u672C\u53F7</span>
<span class="token directive"><span class="token keyword">server_tokens</span> <span class="token boolean">off</span></span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u518D\u6B21\u9A8C\u8BC1\u91CD\u8F7D\u914D\u7F6E\u4E4B\u540E\uFF0C\u5237\u65B0\u9875\u9762\uFF0C\u6B64\u65F6\u7248\u672C\u53F7\u5C31\u4F1A\u6D88\u5931</p><div class="language-\u7EAF\u6587\u672C ext-\u7EAF\u6587\u672C line-numbers-mode"><pre class="language-\u7EAF\u6587\u672C"><code>Server: nginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="\u6700\u7EC8\u914D\u7F6E\u5185\u5BB9" tabindex="-1"><a class="header-anchor" href="#\u6700\u7EC8\u914D\u7F6E\u5185\u5BB9" aria-hidden="true">#</a> \u6700\u7EC8\u914D\u7F6E\u5185\u5BB9</h3><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token comment">#user\u662F\u4E3B\u6A21\u5757\u6307\u4EE4\uFF0C\u5B9A\u4E49Nginx\u8FD0\u884C\u7684\u7528\u6237\u548C\u7528\u6237\u7EC4</span>
<span class="token directive"><span class="token keyword">user</span> nginx nginx</span><span class="token punctuation">;</span>
<span class="token comment">#\u5DE5\u4F5C\u8FDB\u7A0B\u6570 \u8BBE\u7F6E\u4E3A\u81EA\u52A8</span>
<span class="token directive"><span class="token keyword">worker_processes</span> auto</span><span class="token punctuation">;</span>
<span class="token comment">#nginx\u9ED8\u8BA4\u662F\u6CA1\u6709\u5F00\u542F\u5229\u7528\u591A\u6838cpu\u7684\u914D\u7F6E\u7684\u3002\u9700\u8981\u901A\u8FC7\u589E\u52A0worker_cpu_affinity\u914D\u7F6E\u53C2\u6570\u6765\u5145\u5206\u5229\u7528\u591A\u6838cpu\uFF0Ccpu\u662F\u4EFB\u52A1\u5904\u7406\uFF0C\u5F53\u8BA1\u7B97\u6700\u8D39\u65F6\u7684\u8D44\u6E90\u7684\u65F6\u5019\uFF0Ccpu\u6838\u4F7F\u7528\u4E0A\u7684\u8D8A\u591A\uFF0C\u6027\u80FD\u5C31\u8D8A\u597D</span>
<span class="token directive"><span class="token keyword">worker_cpu_affinity</span> <span class="token number">1</span></span><span class="token punctuation">;</span>
<span class="token comment">#\u8FDB\u7A0B\u6700\u5927\u53EF\u6253\u5F00\u6587\u4EF6\u6570</span>
<span class="token directive"><span class="token keyword">worker_rlimit_nofile</span> <span class="token number">65535</span></span><span class="token punctuation">;</span>

<span class="token comment">#error_log  logs/error.log;</span>
<span class="token comment">#error_log  logs/error.log  notice;</span>
<span class="token comment">#error_log  logs/error.log  info;</span>

<span class="token comment">#pid        logs/nginx.pid;</span>


<span class="token directive"><span class="token keyword">events</span></span> <span class="token punctuation">{</span>
  <span class="token comment">#\u5355\u4E2A\u5DE5\u4F5C\u8FDB\u7A0B\u53EF\u4EE5\u5141\u8BB8\u540C\u65F6\u5EFA\u7ACB\u5916\u90E8\u8FDE\u63A5\u7684\u6570\u91CF</span>
  <span class="token directive"><span class="token keyword">worker_connections</span> <span class="token number">65535</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u6027\u80FD\u4F18\u5316-nginx\u4E8B\u4EF6\u5904\u7406\u6A21\u578B\u4F18\u5316use epoll;</span>
  <span class="token directive"><span class="token keyword">use</span> epoll</span><span class="token punctuation">;</span>
  <span class="token comment">#\u7F51\u7EDC\u8FDE\u63A5\u7684\u4F18\u5316\u540C\u4E00\u65F6\u523B\u53EA\u6709\u4E00\u4E2A\u8BF7\u6C42\u800C\u907F\u514D\u591A\u4E2A\u7761\u7720\u8FDB\u7A0B\u88AB\u5524\u9192\u7684\u8BBE\u7F6E\uFF0Con\u4E3A\u9632\u6B62\u88AB\u540C\u65F6\u5524\u9192\uFF0C\u9ED8\u8BA4\u4E3Aoff\uFF0C\u56E0\u6B64nginx\u521A\u5B89\u88C5\u5B8C\u4EE5\u540E\u8981\u8FDB\u884C\u9002\u5F53\u7684\u4F18\u5316\u3002</span>
  <span class="token directive"><span class="token keyword">accept_mutex</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u6253\u5F00\u540C\u65F6\u63A5\u53D7\u591A\u4E2A\u65B0\u7F51\u7EDC\u8FDE\u63A5\u8BF7\u6C42\u7684\u529F\u80FD\u3002</span>
  <span class="token directive"><span class="token keyword">multi_accept</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>


<span class="token directive"><span class="token keyword">http</span></span> <span class="token punctuation">{</span>
    <span class="token directive"><span class="token keyword">include</span>       mime.types</span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">default_type</span>  application/octet-stream</span><span class="token punctuation">;</span>

  <span class="token comment">#\u670D\u52A1\u5668\u540D\u5B57\u7684hash\u8868\u5927\u5C0F</span>
  <span class="token directive"><span class="token keyword">server_names_hash_bucket_size</span> <span class="token number">128</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u7528\u4E8E\u6307\u5B9A\u6765\u81EA\u5BA2\u6237\u7AEF\u8BF7\u6C42\u5934headerbuffer\u5927\u5C0F\uFF0C\u5BF9\u4E8E\u5927\u591A\u6570\u8BF7\u6C42\uFF0C1KB\u7684\u7F13\u51B2\u533A\u5927\u5C0F\u5DF2\u7ECF\u8DB3\u591F\uFF0C\u5982\u679C\u81EA\u5B9A\u4E49\u4E86\u6D88\u606F\u5934\u6216\u6709\u66F4\u5927\u7684cookie\uFF0C\u53EF\u4EE5\u589E\u52A0\u7F13\u51B2\u533A\u5927\u5C0F\u3002\u8FD9\u91CC\u8BBE\u7F6E\u4E3A32KB</span>
  <span class="token directive"><span class="token keyword">client_header_buffer_size</span> <span class="token number">32k</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u7528\u6765\u6307\u5B9A\u5BA2\u6237\u7AEF\u8BF7\u6C42\u4E2D\u8F83\u5927\u7684\u6D88\u606F\u5934\u7684\u7F13\u5B58\u6700\u5927\u6570\u91CF\u548C\u5927\u5C0F\uFF0C\u201C4\u201D\u4E3A\u4E2A\u6570\uFF0C\u201C128\u201D\u4E3A\u5927\u5C0F\uFF0C\u6700\u5927\u7F13\u5B58\u4E3A4\u4E2A128KB\u3002</span>
  <span class="token directive"><span class="token keyword">large_client_header_buffers</span> <span class="token number">4</span> <span class="token number">128k</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u5141\u8BB8\u5BA2\u6237\u7AEF\u8BF7\u6C42\u7684\u6700\u5927\u5355\u6587\u4EF6\u5B57\u8282\u6570</span>
  <span class="token directive"><span class="token keyword">client_max_body_size</span> <span class="token number">10m</span></span><span class="token punctuation">;</span>

    <span class="token comment">#log_format  main  &#39;$remote_addr - $remote_user [$time_local] &quot;$request&quot; &#39;</span>
    <span class="token comment">#                  &#39;$status $body_bytes_sent &quot;$http_referer&quot; &#39;</span>
    <span class="token comment">#                  &#39;&quot;$http_user_agent&quot; &quot;$http_x_forwarded_for&quot;&#39;;</span>

    <span class="token comment">#access_log  logs/access.log  main;</span>

    <span class="token directive"><span class="token keyword">sendfile</span>        <span class="token boolean">on</span></span><span class="token punctuation">;</span>
    <span class="token comment">#\u5B83\u53EF\u4EE5\u914D\u7F6E\u4E00\u6B21\u53D1\u9001\u6570\u636E\u7684\u5305\u5927\u5C0F\u3002\u4E5F\u5C31\u662F\u8BF4\uFF0C\u5B83\u4E0D\u662F\u6309\u65F6\u95F4\u7D2F\u8BA1  0.2 \u79D2\u540E\u53D1\u9001\u5305\uFF0C\u800C\u662F\u5F53\u5305\u7D2F\u8BA1\u5230\u4E00\u5B9A\u5927\u5C0F\u540E\u5C31\u53D1\u9001 \u5728 nginx \u4E2D\uFF0Ctcp_nopush \u5FC5\u987B\u548C sendfile \u642D\u914D\u4F7F\u7528\u3002</span>
    <span class="token directive"><span class="token keyword">tcp_nopush</span>     <span class="token boolean">on</span></span><span class="token punctuation">;</span>

    <span class="token comment">#keepalive_timeout  0;</span>
  <span class="token comment">#\u53C2\u6570\u662F\u4E00\u4E2A\u8BF7\u6C42\u5B8C\u6210\u4E4B\u540E\u8FD8\u8981\u4FDD\u6301\u8FDE\u63A5\u591A\u4E45\uFF0C\u4E0D\u662F\u8BF7\u6C42\u65F6\u95F4\u591A\u4E45\uFF0C\u76EE\u7684\u662F\u4FDD\u6301\u957F\u8FDE\u63A5\uFF0C\u51CF\u5C11\u521B\u5EFA\u8FDE\u63A5\u8FC7\u7A0B\u7ED9\u7CFB\u7EDF\u5E26\u6765\u7684\u6027\u80FD\u635F\u8017\uFF0C\u7C7B\u4F3C\u4E8E\u7EBF\u7A0B\u6C60\uFF0C\u6570\u636E\u5E93\u8FDE\u63A5\u6C60</span>
    <span class="token directive"><span class="token keyword">keepalive_timeout</span>  <span class="token number">15</span></span><span class="token punctuation">;</span>

  <span class="token comment">#on \u4F1A\u589E\u52A0\u7531tcp\u534F\u8BAE\u6570\u636E\u5C0F\u5305\u7684\u6570\u91CF\uFF0C\u4F46\u662F\u53EF\u4EE5\u63D0\u9AD8\u54CD\u5E94\u901F\u5EA6\u3002\u5728\u53CA\u65F6\u6027\u9AD8\u7684\u901A\u4FE1\u573A\u666F\u4E2D\u5E94\u8BE5\u4F1A\u6709\u4E0D\u9519\u7684\u6548\u679C</span>
    <span class="token comment">#off \u4F1A\u589E\u52A0\u7531tcp\u534F\u8BAE\u901A\u4FE1\u7684\u5EF6\u65F6\uFF0C\u4F46\u662F\u4F1A\u63D0\u9AD8\u5E26\u5BBD\u5229\u7528\u7387\u3002\u5728\u9AD8\u5EF6\u65F6\u3001\u6570\u636E\u91CF\u5927\u7684\u901A\u4FE1\u573A\u666F\u4E2D\u5E94\u8BE5\u4F1A\u6709\u4E0D\u9519\u7684\u6548\u679C</span>
    <span class="token directive"><span class="token keyword">tcp_nodelay</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>

    <span class="token comment">#gzip  on;</span>

  <span class="token comment">#\u8FDE\u63A5\u5230\u540E\u7AEFfastcgi\u8D85\u65F6\u65F6\u95F4</span>
  <span class="token directive"><span class="token keyword">fastcgi_connect_timeout</span> <span class="token number">300</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u5411fastcgi\u8BF7\u6C42\u8D85\u65F6\u65F6\u95F4(\u8FD9\u4E2A\u6307\u5B9A\u503C\u5DF2\u7ECF\u5B8C\u6210\u4E24\u6B21\u63E1\u624B\u540E\u5411fastcgi\u4F20\u9001\u8BF7\u6C42\u7684\u8D85\u65F6\u65F6\u95F4</span>
  <span class="token directive"><span class="token keyword">fastcgi_send_timeout</span> <span class="token number">300</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u63A5\u6536fastcgi\u5E94\u7B54\u8D85\u65F6\u65F6\u95F4\uFF0C\u540C\u7406\u4E5F\u662F2\u6B21\u63E1\u624B\u540E</span>
  <span class="token directive"><span class="token keyword">fastcgi_read_timeout</span> <span class="token number">300</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u8BFB\u53D6fastcgi\u5E94\u7B54\u7B2C\u4E00\u90E8\u5206\u9700\u8981\u591A\u5927\u7F13\u51B2\u533A\uFF0C\u8BE5\u503C\u8868\u793A\u4F7F\u75281\u4E2A64kb\u7684\u7F13\u51B2\u533A\u8BFB\u53D6\u5E94\u7B54\u7B2C\u4E00\u90E8\u5206(\u5E94\u7B54\u5934),\u53EF\u4EE5\u8BBE\u7F6E\u4E3Afastcgi_buffers\u9009\u9879\u7F13\u51B2\u533A\u5927\u5C0F</span>
  <span class="token directive"><span class="token keyword">fastcgi_buffer_size</span> <span class="token number">64k</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u6307\u5B9A\u672C\u5730\u9700\u8981\u591A\u5C11\u548C\u591A\u5927\u7684\u7F13\u51B2\u533A\u6765\u7F13\u51B2fastcgi\u5E94\u7B54\u8BF7\u6C42\uFF0C\u5047\u8BBE\u4E00\u4E2Aphp\u6216java\u811A\u672C\u6240\u4EA7\u751F\u9875\u9762\u5927\u5C0F\u4E3A256kb,\u90A3\u4E48\u4F1A\u4E3A\u5176\u5206\u914D4\u4E2A64kb\u7684\u7F13\u51B2\u6765\u7F13\u5B58\uFF1B\u82E5\u9875\u9762\u5927\u4E8E256kb,\u90A3\u4E48\u5927\u4E8E\u7684256kb\u7684\u90E8\u5206\u4F1A\u7F13\u5B58\u5230fastcgi_temp\u6307\u5B9A\u8DEF\u5F84\u4E2D\uFF0C\u8FD9\u5E76\u975E\u662F\u4E2A\u597D\u529E\u6CD5\uFF0C\u5185\u5B58\u6570\u636E\u5904\u7406\u5FEB\u4E8E\u786C\u76D8\uFF0C\u4E00\u822C\u8BE5\u503C\u5E94\u8BE5\u4E3A\u7AD9\u70B9\u4E2Dphp/java\u811A\u672C\u6240\u4EA7\u751F\u9875\u9762\u5927\u5C0F\u4E2D\u95F4\u503C\uFF0C\u5982\u679C\u7AD9\u70B9\u5927\u90E8\u5206\u811A\u672C\u6240\u4EA7\u751F\u7684\u9875\u9762\u5927\u5C0F\u4E3A256kb\uFF0C\u90A3\u4E48\u53EF\u628A\u503C\u8BBE\u7F6E\u4E3A16 16k,4 64k\u7B49</span>
  <span class="token directive"><span class="token keyword">fastcgi_buffers</span> <span class="token number">4</span> <span class="token number">64k</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u9ED8\u8BA4\u503C\u662Ffastcgi_buffer\u76842\u500D</span>
  <span class="token directive"><span class="token keyword">fastcgi_busy_buffers_size</span> <span class="token number">128k</span></span><span class="token punctuation">;</span>
  <span class="token comment">#\u5199\u5165\u7F13\u5B58\u6587\u4EF6\u4F7F\u7528\u591A\u5927\u7684\u6570\u636E\u5757\uFF0C\u9ED8\u8BA4\u503C\u662Ffastcgi_buffer\u76842\u500D</span>
  <span class="token directive"><span class="token keyword">fastcgi_temp_file_write_size</span> <span class="token number">128k</span></span><span class="token punctuation">;</span>

  <span class="token comment">#\u7F13\u5B58\u8DEF\u5F84\u6587\u4EF6\uFF0C\u76EE\u5F55\u7ED3\u6784\u7B49\u7EA7\uFF0C\u5173\u952E\u5B57\u533A\u57DF\u5B9E\u9645\u548C\u975E\u6D3B\u52A8\u65F6\u95F4</span>
    <span class="token directive"><span class="token keyword">fastcgi_cache_path</span>  /usr/local/nginx/fastcgi_cache levels=1:2 keys_zone=TEST:10m inactive=5m</span><span class="token punctuation">;</span>
    <span class="token comment">#\u7F13\u5B58\u7684\u5730\u5740</span>
    <span class="token directive"><span class="token keyword">fastcgi_cache_key</span> <span class="token string">&quot;<span class="token variable">$request_method://</span><span class="token variable">$host</span><span class="token variable">$request_uri</span>&quot;</span></span><span class="token punctuation">;</span>
    <span class="token comment">#\u8BE5\u6307\u4EE4\u7528\u4E8E\u8BBE\u7F6E\u7F13\u5B58\u54EA\u4E9BHTTP\u65B9\u6CD5\uFF0C\u9ED8\u8BA4\u7F13\u5B58HTTP GET/HEAD\u65B9\u6CD5</span>
    <span class="token directive"><span class="token keyword">fastcgi_cache_methods</span> GET HEAD</span><span class="token punctuation">;</span>
    <span class="token comment">#\u5F00\u542Ffastcgi\u7F13\u5B58\u5E76\u4E3A\u5176\u6307\u5B9A\u4E3ATEST\u540D\u79F0\uFF0C\u964D\u4F4Ecpu\u8D1F\u8F7D,\u9632\u6B62502\u9519\u8BEF\u53D1\u751F.</span>
    <span class="token directive"><span class="token keyword">fastcgi_cache</span> TEST</span><span class="token punctuation">;</span>
    <span class="token comment">#\u5E94\u7B54\u4EE3\u7801\u7F13\u5B58\u65F6\u95F4\uFF0C200\u548C302\u5E94\u7B54\u7F13\u5B58\u4E3A1\u4E2A\u5C0F\u65F6\uFF0C301\u4E00\u5929,\u5176\u4ED61\u5206\u949F</span>
    <span class="token directive"><span class="token keyword">fastcgi_cache_valid</span> <span class="token number">200</span> <span class="token number">302</span> <span class="token number">1h</span></span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">fastcgi_cache_valid</span> <span class="token number">301</span> <span class="token number">1d</span></span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">fastcgi_cache_valid</span> any <span class="token number">1m</span></span><span class="token punctuation">;</span>

  <span class="token comment"># \u9690\u85CF\u7248\u672C\u53F7</span>
  <span class="token directive"><span class="token keyword">server_tokens</span> <span class="token boolean">off</span></span><span class="token punctuation">;</span>

    <span class="token directive"><span class="token keyword">server</span></span> <span class="token punctuation">{</span>
        <span class="token directive"><span class="token keyword">listen</span>       <span class="token number">80</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">server_name</span>  localhost</span><span class="token punctuation">;</span>

        <span class="token comment">#charset koi8-r;</span>

        <span class="token comment">#access_log  logs/host.access.log  main;</span>

        <span class="token directive"><span class="token keyword">location</span> /</span> <span class="token punctuation">{</span>
            <span class="token directive"><span class="token keyword">root</span>   /home/web/</span><span class="token punctuation">;</span>
            <span class="token directive"><span class="token keyword">index</span>  index.html index.htm</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">#error_page  404              /404.html;</span>

        <span class="token comment"># redirect server error pages to the static page /50x.html</span>
        <span class="token comment">#</span>
        <span class="token directive"><span class="token keyword">error_page</span>   <span class="token number">500</span> <span class="token number">502</span> <span class="token number">503</span> <span class="token number">504</span>  /50x.html</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">location</span> = /50x.html</span> <span class="token punctuation">{</span>
            <span class="token directive"><span class="token keyword">root</span>   html</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment"># proxy the PHP scripts to Apache listening on 127.0.0.1:80</span>
        <span class="token comment">#</span>
        <span class="token comment">#location ~ \\.php$ {</span>
        <span class="token comment">#    proxy_pass   http://127.0.0.1;</span>
        <span class="token comment">#}</span>

        <span class="token comment"># pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000</span>
        <span class="token comment">#</span>
        <span class="token comment">#location ~ \\.php$ {</span>
        <span class="token comment">#    root           html;</span>
        <span class="token comment">#    fastcgi_pass   127.0.0.1:9000;</span>
        <span class="token comment">#    fastcgi_index  index.php;</span>
        <span class="token comment">#    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;</span>
        <span class="token comment">#    include        fastcgi_params;</span>
        <span class="token comment">#}</span>

        <span class="token comment"># deny access to .htaccess files, if Apache&#39;s document root</span>
        <span class="token comment"># concurs with nginx&#39;s one</span>
        <span class="token comment">#</span>
        <span class="token comment">#location ~ /\\.ht {</span>
        <span class="token comment">#    deny  all;</span>
        <span class="token comment">#}</span>
    <span class="token punctuation">}</span>


    <span class="token comment"># another virtual host using mix of IP-, name-, and port-based configuration</span>
    <span class="token comment">#</span>
    <span class="token comment">#server {</span>
    <span class="token comment">#    listen       8000;</span>
    <span class="token comment">#    listen       somename:8080;</span>
    <span class="token comment">#    server_name  somename  alias  another.alias;</span>

    <span class="token comment">#    location / {</span>
    <span class="token comment">#        root   html;</span>
    <span class="token comment">#        index  index.html index.htm;</span>
    <span class="token comment">#    }</span>
    <span class="token comment">#}</span>


    <span class="token comment"># HTTPS server</span>
    <span class="token comment">#</span>
    <span class="token comment">#server {</span>
    <span class="token comment">#    listen       443 ssl;</span>
    <span class="token comment">#    server_name  localhost;</span>

    <span class="token comment">#    ssl_certificate      cert.pem;</span>
    <span class="token comment">#    ssl_certificate_key  cert.key;</span>

    <span class="token comment">#    ssl_session_cache    shared:SSL:1m;</span>
    <span class="token comment">#    ssl_session_timeout  5m;</span>

    <span class="token comment">#    ssl_ciphers  HIGH:!aNULL:!MD5;</span>
    <span class="token comment">#    ssl_prefer_server_ciphers  on;</span>

    <span class="token comment">#    location / {</span>
    <span class="token comment">#        root   html;</span>
    <span class="token comment">#        index  index.html index.htm;</span>
    <span class="token comment">#    }</span>
    <span class="token comment">#}</span>

  <span class="token comment">#1.\u5F00\u542Fgzip\u538B\u7F29</span>
    <span class="token comment">#\u5F00\u542F\u6807\u5FD7</span>
    <span class="token directive"><span class="token keyword">gzip</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
    <span class="token comment">#\u6587\u4EF6\u5927\u5C0F\u672A\u8FBE\u5230\u8BE5\u503C\uFF0C\u4E0D\u538B\u7F29 \u6587\u4EF6\u5DF2\u8FBE\u5230\u8BE5\u503C\uFF0C\u538B\u7F29</span>
    <span class="token directive"><span class="token keyword">gzip_min_length</span>  <span class="token number">1k</span></span><span class="token punctuation">;</span>
    <span class="token comment">#\u7528\u4E8E\u8BBE\u7F6EGzip\u538B\u7F29\u6587\u4EF6\u4F7F\u7528\u7F13\u5B58\u7A7A\u95F4\u7684\u5927\u5C0F number:\u5411\u7CFB\u7EDF\u7533\u8BF7\u6362\u7C97\u7A7A\u95F4\u7684\u4E2A\u6570\uFF0Csize\uFF1A\u6307\u5B9A\u6BCF\u4E2A\u7F13\u5B58\u7A7A\u95F4\u7684\u5927\u5C0F\uFF0C\u4E00\u822C\u53D6\u7CFB\u7EDF\u5185\u5B58\u9875\u4E00\u9875\u7684\u5927\u5C0F</span>
    <span class="token directive"><span class="token keyword">gzip_buffers</span>     <span class="token number">4</span> <span class="token number">16k</span></span><span class="token punctuation">;</span>
    <span class="token comment">#\u53C2\u6570\u503C\uFF1A1.0 | 1.1\uFF0C\u6CE8\u610F\uFF0C\u6B64\u5904\u53EA\u80FD\u662F1.0\uFF0C\u6216\u80051.1\u3002\u8BBE\u7F6E\u538B\u7F29\u54CD\u5E94\u6240\u9700\u7684\u6700\u5C0Fhttp\u534F\u8BAE\u7248\u672C</span>
    <span class="token directive"><span class="token keyword">gzip_http_version</span> 1.0</span><span class="token punctuation">;</span>
    <span class="token comment">#\u8BBE\u7F6Egzip\u538B\u7F29\u7A0B\u5EA6\uFF0C\u5305\u62EC1~9\u7EA7\u522B\uFF0C1\u6700\u4F4E\uFF0C9\u6700\u9AD8\uFF0C\u9ED8\u8BA4\u4E3A1</span>
    <span class="token directive"><span class="token keyword">gzip_comp_level</span> <span class="token number">2</span></span><span class="token punctuation">;</span>
    <span class="token comment">#\u53C2\u6570\u503C\uFF1A\u54CD\u5E94\u62A5\u6587\u6570\u636E\u683C\u5F0F\uFF0C\u6216\u8005\u8BF4\u7C7B\u578B\uFF0C\u5BF9\u5E94http\u54CD\u5E94\u5934\u4E2D\u7684Content-type\u5B57\u6BB5\uFF0C\u5982\u5E38\u89C1\u7684\u6709text/html\u3001text/css\u3001application/json\u3001application/javaScript\u7B49\u3002\u7528\u4E8E\u6307\u5B9A\u8981\u538B\u7F29\u7684\u54CD\u5E94\u62A5\u6587\u7C7B\u578B\u3002\u201D*\u201D\u8868\u793A\u538B\u7F29\u6240\u6709\u683C\u5F0F\u7684\u54CD\u5E94\u62A5\u6587\uFF0C\u591A\u79CD\u683C\u5F0F\u7528\u7A7A\u683C\u9694\u5F00\u3002\u5982text/html text/css\u3002\u9ED8\u8BA4\u503C\uFF1Atext/html</span>
    <span class="token directive"><span class="token keyword">gzip_types</span>       text/plain application/x-javascript text/css application/xml</span><span class="token punctuation">;</span>
    <span class="token comment">#\u7528\u4E8E\u8BBE\u7F6E\u5728\u8FDB\u884Cgzip\u538B\u7F29\u65F6\u662F\u5426\u53D1\u9001\u5E26\u6709Vary:Accept-Encoding\u5934\u57DF\u7684\u54CD\u5E94\u5934\u90E8\uFF1Bgzip_vary on | off</span>
    <span class="token directive"><span class="token keyword">gzip_vary</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
    <span class="token comment">#\u6839\u636E\u4E0D\u540C\u7684\u5BA2\u6237\u7AEF\u8BF7\u6C42\u9009\u62E9\u6027\u7684\u5F00\u542F\u6216\u5173\u95EDgzip\u6307\u4EE4gzip_disable MSIE [4-6]\\. \u5BF9IE4-6\u4E0D\u5F00\u542Fgzip\u538B\u7F29</span>
    <span class="token directive"><span class="token keyword">gzip_disable</span> msie6</span><span class="token punctuation">;</span>
  <span class="token comment"># nginx\u65E5\u5FD7\u8BB0\u5F55\u683C\u5F0F</span>
  <span class="token directive"><span class="token keyword">log_format</span> <span class="token string">&#39;<span class="token variable">$remote_addr</span> - <span class="token variable">$remote_user</span> [<span class="token variable">$time_local]</span> &quot;<span class="token variable">$request</span>&quot; &#39;</span>
                  <span class="token string">&#39;<span class="token variable">$status</span> <span class="token variable">$body_bytes_sent</span> &quot;<span class="token variable">$http_referer</span>&quot; &#39;</span>
                  <span class="token string">&#39;&quot;<span class="token variable">$http_user_agent</span>&quot; &quot;<span class="token variable">$http_x_forwarded_for</span>&quot;&#39;</span></span><span class="token punctuation">;</span>

    <span class="token directive"><span class="token keyword">include</span> vhost/*.conf</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u8D1F\u8F7D\u5747\u8861" tabindex="-1"><a class="header-anchor" href="#\u8D1F\u8F7D\u5747\u8861" aria-hidden="true">#</a> \u8D1F\u8F7D\u5747\u8861</h2>`,40),z={href:"http://tengine.taobao.org/book/chapter_05.html",target:"_blank",rel:"noopener noreferrer"},A=a("http://tengine.taobao.org/book/chapter_05.html"),S=s(`<p><code>weight</code>\u6743\u91CD\u8D8A\u9AD8\uFF0C\u51FA\u73B0\u9891\u7387\u8D8A\u9AD8</p><blockquote><p>\u6307\u5B9A\u8F6E\u8BE2\u51E0\u7387\uFF0Cweight \u548C\u8BBF\u95EE\u6BD4\u7387\u6210\u6B63\u6BD4\uFF0C\u7528\u4E8E\u540E\u7AEF\u670D\u52A1\u5668\u6027\u80FD\u4E0D\u5747\u7684\u60C5\u51B5\u3002 \u5982\u679C\u540E\u7AEF\u670D\u52A1\u5668 down \u6389\uFF0C\u80FD\u81EA\u52A8\u5254\u9664\u3002 \u6BD4\u5982\u4EE5\u4E0B\u914D\u7F6E\uFF0C\u5219 1.11 \u670D\u52A1\u5668\u7684\u8BBF\u95EE\u91CF\u4E3A 1.10 \u670D\u52A1\u5668\u7684\u4E24\u500D\u3002</p></blockquote><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token directive"><span class="token keyword">upstream</span> easyswoole_server</span> <span class="token punctuation">{</span>
  <span class="token directive"><span class="token keyword">server</span> 127.0.0.1:9501 weight=1</span><span class="token punctuation">;</span>
  <span class="token directive"><span class="token keyword">server</span> 127.0.0.1:9502 weight=2</span><span class="token punctuation">;</span>
  <span class="token directive"><span class="token keyword">server</span> 127.0.0.1:9503 weight=3</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token directive"><span class="token keyword">server</span></span> <span class="token punctuation">{</span>
     <span class="token directive"><span class="token keyword">listen</span>       <span class="token number">80</span></span><span class="token punctuation">;</span>
     <span class="token directive"><span class="token keyword">server_name</span>  www.easyswoole.tt</span><span class="token punctuation">;</span>
     <span class="token directive"><span class="token keyword">root</span> /home/web/easyswoole/</span><span class="token punctuation">;</span>
     <span class="token directive"><span class="token keyword">location</span> /</span> <span class="token punctuation">{</span>
          <span class="token directive"><span class="token keyword">ssi</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
          <span class="token directive"><span class="token keyword">ssi_silent_errors</span> <span class="token boolean">on</span></span><span class="token punctuation">;</span>
          <span class="token directive"><span class="token keyword">index</span>  index.php index.html index.htm</span><span class="token punctuation">;</span>
          <span class="token directive"><span class="token keyword">proxy_http_version</span> 1.1</span><span class="token punctuation">;</span>
          <span class="token directive"><span class="token keyword">proxy_set_header</span> Connection <span class="token string">&quot;keep-alive&quot;</span></span><span class="token punctuation">;</span>
          <span class="token directive"><span class="token keyword">proxy_set_header</span> X-Real-IP <span class="token variable">$remote_addr</span></span><span class="token punctuation">;</span>
          <span class="token directive"><span class="token keyword">if</span> (!-f <span class="token variable">$request_filename</span>)</span> <span class="token punctuation">{</span>
            <span class="token comment">#proxy_pass http://127.0.0.1:9501;</span>
             <span class="token directive"><span class="token keyword">proxy_pass</span> http://easyswoole_server</span><span class="token punctuation">;</span>
          <span class="token punctuation">}</span>

     <span class="token punctuation">}</span>
     <span class="token directive"><span class="token keyword">location</span> ~ \\.php$</span> <span class="token punctuation">{</span>
          <span class="token directive"><span class="token keyword">fastcgi_pass</span>   127.0.0.1:9000</span><span class="token punctuation">;</span>
          <span class="token directive"><span class="token keyword">fastcgi_index</span>  index.php</span><span class="token punctuation">;</span>
          <span class="token directive"><span class="token keyword">fastcgi_param</span>  SCRIPT_FILENAME  <span class="token variable">$document_root</span><span class="token variable">$fastcgi_script_name</span></span><span class="token punctuation">;</span>
          <span class="token directive"><span class="token keyword">include</span>        fastcgi_params</span><span class="token punctuation">;</span>
     <span class="token punctuation">}</span>
     <span class="token directive"><span class="token keyword">access_log</span>  /usr/local/nginx/logs/php7_access.log</span><span class="token punctuation">;</span>
     <span class="token directive"><span class="token keyword">error_log</span> /usr/local/nginx/logs/php7_error.log</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,3);function H(N,P){const e=c("ExternalLinkIcon");return t(),p("div",null,[d,n("ol",null,[r,n("li",null,[u,n("ul",null,[v,n("li",null,[n("p",null,[m,k,n("a",b,[g,i(e)])])]),h,_,x,n("li",null,[n("p",null,[f,y,n("a",w,[q,i(e)])])]),$])]),E]),T,n("p",null,[n("a",z,[A,i(e)])]),S])}var C=l(o,[["render",H],["__file","linux-install-nginx.html.vue"]]);export{C as default};
