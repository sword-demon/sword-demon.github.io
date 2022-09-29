import{_ as c}from"./plugin-vue_export-helper.21dcd24c.js";import{r as i,o as l,c as p,a as n,b as e,d as s,e as o}from"./app.9eb1cdcc.js";const t={},d=n("h2",{id:"\u5B89\u88C5\u914D\u7F6E",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#\u5B89\u88C5\u914D\u7F6E","aria-hidden":"true"},"#"),s(" \u5B89\u88C5\u914D\u7F6E")],-1),r=s("github \u5730\u5740\uFF1A"),u={href:"https://github.com/laradock/laradock",target:"_blank",rel:"noopener noreferrer"},v=s("https://github.com/laradock/laradock"),k=s("\u6587\u6863\u3001\u5B98\u7F51\u5730\u5740\uFF1A"),m={href:"http://laradock.io/",target:"_blank",rel:"noopener noreferrer"},b=s("http://laradock.io/"),g=o(`<ol><li><p>\u514B\u9686\u4EE3\u7801</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">git</span> clone https://github.com/Laradock/laradock.git
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>\u590D\u5236\u914D\u7F6E\u6587\u4EF6</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">cp</span> .env.example .env
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>\u56E0\u4E3A\u662F M1 \u7CFB\u7EDF\uFF0C\u6240\u4EE5\u9700\u8981\u5728<code>docker-compose.yml</code>\u4E2D\u7684<code>mysql</code>\u90E8\u5206\u8FDB\u884C\u4FEE\u6539</p><div class="language-yaml ext-yml line-numbers-mode"><pre class="language-yaml"><code><span class="token key atrule">mysql</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> mysql<span class="token punctuation">:</span>8.0.19
    <span class="token key atrule">platform</span><span class="token punctuation">:</span> <span class="token string">&#39;linux/x86_64&#39;</span>
    <span class="token key atrule">build</span><span class="token punctuation">:</span>
        <span class="token key atrule">context</span><span class="token punctuation">:</span> ./mysql
        <span class="token key atrule">args</span><span class="token punctuation">:</span>
            <span class="token punctuation">-</span> MYSQL_VERSION=$<span class="token punctuation">{</span>MYSQL_VERSION<span class="token punctuation">}</span>
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> MYSQL_DATABASE=$<span class="token punctuation">{</span>MYSQL_DATABASE<span class="token punctuation">}</span>
        <span class="token punctuation">-</span> MYSQL_USER=$<span class="token punctuation">{</span>MYSQL_USER<span class="token punctuation">}</span>
        <span class="token punctuation">-</span> MYSQL_PASSWORD=$<span class="token punctuation">{</span>MYSQL_PASSWORD<span class="token punctuation">}</span>
        <span class="token punctuation">-</span> MYSQL_ROOT_PASSWORD=$<span class="token punctuation">{</span>MYSQL_ROOT_PASSWORD<span class="token punctuation">}</span>
        <span class="token punctuation">-</span> TZ=$<span class="token punctuation">{</span>WORKSPACE_TIMEZONE<span class="token punctuation">}</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> $<span class="token punctuation">{</span>DATA_PATH_HOST<span class="token punctuation">}</span>/mysql<span class="token punctuation">:</span>/var/lib/mysql
        <span class="token punctuation">-</span> $<span class="token punctuation">{</span>MYSQL_ENTRYPOINT_INITDB<span class="token punctuation">}</span><span class="token punctuation">:</span>/docker<span class="token punctuation">-</span>entrypoint<span class="token punctuation">-</span>initdb.d
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> <span class="token string">&#39;\${MYSQL_PORT}:3306&#39;</span>
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> backend
    <span class="token key atrule">user</span><span class="token punctuation">:</span> mysql
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>\u540E\u9762\u8FD8\u53EF\u80FD\u56E0\u4E3A\u7F51\u7EDC\u95EE\u9898\uFF0C\u5BFC\u81F4<code>Service php-fpm build failed</code>\uFF0C\u4FEE\u6539<code>docker-compose.yml</code></p><div class="language-yaml ext-yml line-numbers-mode"><pre class="language-yaml"><code>WORKSPACE_TIMEZONE=UTC <span class="token comment"># \u6362\u6210 PRC</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5982\u679C\u6CA1\u6709\u5F88\u597D\u7684\u8BBF\u95EE\u56FD\u5916<code>raw.github.com</code>\u7C7B\u4F3C\u7684\u7F51\u5740\u7684\uFF0C\u5EFA\u8BAE\u53BB<code>hosts</code>\u6587\u4EF6\u6DFB\u52A0\uFF0C\u5982\u679C\u6709\uFF0C\u90A3\u5C31\u53E6\u5F53\u522B\u8BBA\u3002</p></li><li><p>\u542F\u52A8\u5BB9\u5668 \uFF0C\u6839\u636E\u81EA\u5DF1\u9700\u8981\u7684\u955C\u50CF\u6765\u542F\u52A8</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker-compose</span> up -d redis mysql nginx workspace
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u8FDB\u884C\u7B49\u5F85\u6F2B\u957F\u7684\u4E0B\u8F7D\u8FC7\u7A0B\u5373\u53EF\u3002</p></li></ol><p>\u5982\u679C\u6700\u540E\u90FD\u6709\u4E00\u4E2A\u7EFF\u8272\u7684<code>done</code>\u663E\u793A\uFF0C\u5E76\u4E14\u6CA1\u6709<code>error</code>\uFF0C\u518D\u4F7F\u7528<code>docker ps</code>\u67E5\u770B\u8FD0\u884C\u7684\u5BB9\u5668\u662F\u5426\u8FD0\u884C\u6210\u529F\u3002</p><p>\u56E0\u4E3A\u6211\u4EEC\u4F7F\u7528\u8FD9\u4E2A\uFF0C\u4EC5\u4EC5\u9700\u8981\u4E00\u4E2A<code>workspace</code>\uFF0C\u6240\u4EE5\u6211\u4EEC\u9700\u8981\u8FDB\u5165<code>workspace</code>\u7684\u63A7\u5236\u53F0\u3002</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker-compose</span> up <span class="token builtin class-name">exec</span> workspace <span class="token function">bash</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u514B\u9686\u4E00\u4E2A laravel \u4EE3\u7801\uFF0C\u9ED8\u8BA4\u514B\u9686\u4E0B\u6765\u662F\u6700\u65B0\u7684\u7248\u672C\uFF0C\u6211\u4EEC\u9700\u8981\u5207\u6362\u5230\u6211\u4EEC\u652F\u6301\u7684\u7248\u672C\u4E0A\u53BB\u3002</p><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220221211556.png" alt="" loading="lazy"></p><p>\u6211\u8FD9\u91CC\u76EE\u5F55\u653E\u7684\u6709\u70B9\u8349\u7387\u4E86\uFF0C\u5BFC\u81F4\u5F53\u524D\u4E0A\u4E00\u7EA7\u76EE\u5F55\u90FD\u88AB\u6620\u5C04\u5230\u5BB9\u5668\u5185\u90E8\u53BB\u4E86\uFF0C\u6D6A\u8D39\u4E86\u3002\u6240\u4EE5\u4F60\u4EEC\u9700\u8981\u627E\u4E00\u4E2A\u5F53\u524D<code>laradock</code>\u76EE\u5F55\u4E0A\u4E00\u7EA7\u662F\u4E2A\u9664\u4E86<code>laradock</code>\u4EE5\u5916\u6CA1\u5565\u4E1C\u897F\u7684\u5730\u65B9\u53BB\u5F04\u6BD4\u8F83\u5408\u9002\u3002</p><h2 id="laravel-\u914D\u7F6E" tabindex="-1"><a class="header-anchor" href="#laravel-\u914D\u7F6E" aria-hidden="true">#</a> Laravel \u914D\u7F6E</h2><p>\u6211\u4EEC\u9700\u8981\u914D\u7F6E<code>composer</code>\u4F7F\u7528\u963F\u91CC\u4E91\u955C\u50CF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">composer</span> config -g repo.packagist <span class="token function">composer</span> https://mirrors.aliyun.com/composer/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u590D\u5236\u4E00\u4EFD\u73AF\u5883\u914D\u7F6E\u6587\u4EF6</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">cp</span> .env.example .env
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5B89\u88C5 Laravel \u9700\u8981\u7684\u4F9D\u8D56</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">composer</span> <span class="token function">install</span> -vvv
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7B49\u5F85\u4E0B\u8F7D\u5B89\u88C5\u5B8C\u6210\u5373\u53EF\u3002</p><p>\u8FD8\u9700\u8981\u5BF9<code>.env</code>\u7684<code>key</code>\u8FDB\u884C\u914D\u7F6E\uFF0C\u56E0\u4E3A\u6211\u4EEC\u662F\u76F4\u63A5\u62C9\u53D6\u7684\u4E00\u4E2A\u4EE3\u7801\uFF0C\u800C\u4E0D\u662F\u4F7F\u7528<code>Laravel</code>\u7684\u547D\u4EE4\u6216\u8005<code>composer</code>\u5B89\u88C5\u7684</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> laravel
php artisan key:generate
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u914D\u7F6E\u5B8C\u6210\u4E4B\u540E\uFF0C\u6211\u4EEC\u6700\u7EC8\u8FD8\u662F\u9700\u8981\u5728\u7F51\u9875\u8FDB\u884C\u8BBF\u95EE\u7684\uFF0C\u6240\u4EE5\u8FD8\u9700\u8981\u914D\u7F6E<code>nginx</code></p><blockquote><p>\u5230\u6211\u4EEC\u7684<code>laradock</code>\u76EE\u5F55\u4E0B\u7684<code>nginx</code>\u4E0B\u7684<code>sites</code>\u76EE\u5F55\u91CC\u6709\u4E00\u4E2A<code>laravel.conf.example</code>\u6587\u4EF6\uFF0C\u6211\u4EEC\u8FDB\u884C\u590D\u5236\u4E00\u4EFD\uFF0C\u53BB\u9664\u540E\u9762\u7684<code>.example</code>\u5373\u53EF\u3002</p></blockquote><p><strong>\u6CE8\u610F\uFF1A</strong></p><p>\u6B64\u65F6\u6211\u4EEC\u7684<code>nginx</code>\u914D\u7F6E\u6587\u4EF6\u4E2D\u7684\u6848\u4F8B\uFF0C\u662F\u6307\u5411\u7684\u662F\u5BF9\u7684\uFF0C</p><div class="language-nginx ext-nginx line-numbers-mode"><pre class="language-nginx"><code><span class="token comment">#server {</span>
<span class="token comment">#    listen 80;</span>
<span class="token comment">#    server_name laravel.com.co;</span>
<span class="token comment">#    return 301 https://laravel.com.co$request_uri;</span>
<span class="token comment">#}</span>

<span class="token directive"><span class="token keyword">server</span></span> <span class="token punctuation">{</span>

    <span class="token directive"><span class="token keyword">listen</span> <span class="token number">80</span></span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">listen</span> [::]:80</span><span class="token punctuation">;</span>

    <span class="token comment"># For https</span>
    <span class="token comment"># listen 443 ssl;</span>
    <span class="token comment"># listen [::]:443 ssl ipv6only=on;</span>
    <span class="token comment"># ssl_certificate /etc/nginx/ssl/default.crt;</span>
    <span class="token comment"># ssl_certificate_key /etc/nginx/ssl/default.key;</span>

    <span class="token comment"># \u914D\u7F6E\u865A\u62DF\u57DF\u540D</span>
    <span class="token directive"><span class="token keyword">server_name</span> laravel.test</span><span class="token punctuation">;</span>
    <span class="token comment"># \u4E3B\u8981\u662F\u8FD9\u91CC\uFF0C\u5FC5\u987B\u6307\u5411\u6211\u4EEC\u771F\u786E\u7684\u76EE\u5F55</span>
    <span class="token directive"><span class="token keyword">root</span> /var/www/laravel/public</span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">index</span> index.php index.html index.htm</span><span class="token punctuation">;</span>

    <span class="token directive"><span class="token keyword">location</span> /</span> <span class="token punctuation">{</span>
         <span class="token directive"><span class="token keyword">try_files</span> <span class="token variable">$uri</span> <span class="token variable">$uri</span>/ /index.php<span class="token variable">$is_args</span><span class="token variable">$args</span></span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token directive"><span class="token keyword">location</span> ~ \\.php$</span> <span class="token punctuation">{</span>
        <span class="token directive"><span class="token keyword">try_files</span> <span class="token variable">$uri</span> /index.php =404</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">fastcgi_pass</span> php-upstream</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">fastcgi_index</span> index.php</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">fastcgi_buffers</span> <span class="token number">16</span> <span class="token number">16k</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">fastcgi_buffer_size</span> <span class="token number">32k</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">fastcgi_param</span> SCRIPT_FILENAME <span class="token variable">$document_root</span><span class="token variable">$fastcgi_script_name</span></span><span class="token punctuation">;</span>
        <span class="token comment">#fixes timeouts</span>
        <span class="token directive"><span class="token keyword">fastcgi_read_timeout</span> <span class="token number">600</span></span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">include</span> fastcgi_params</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token directive"><span class="token keyword">location</span> ~ /\\.ht</span> <span class="token punctuation">{</span>
        <span class="token directive"><span class="token keyword">deny</span> all</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token directive"><span class="token keyword">location</span> /.well-known/acme-challenge/</span> <span class="token punctuation">{</span>
        <span class="token directive"><span class="token keyword">root</span> /var/www/letsencrypt/</span><span class="token punctuation">;</span>
        <span class="token directive"><span class="token keyword">log_not_found</span> <span class="token boolean">off</span></span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token directive"><span class="token keyword">error_log</span> /var/log/nginx/laravel_error.log</span><span class="token punctuation">;</span>
    <span class="token directive"><span class="token keyword">access_log</span> /var/log/nginx/laravel_access.log</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8981\u60F3\u4F7F\u5F97<code>nginx</code>\u751F\u6548\uFF0C\u6211\u4EEC\u8FD8\u5F97\u91CD\u65B0\u542F\u52A8\u4E00\u4E0B<code>nginx</code></p><p>\u91CD\u542F<code>nginx</code>\u7684\u51E0\u79CD\u65B9\u5F0F</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u8FDB\u5165\u5230laradock\u76EE\u5F55</span>
<span class="token function">docker-compose</span> <span class="token builtin class-name">exec</span> nginx <span class="token function">bash</span>

<span class="token comment"># \u6216\u8005\u4F7F\u7528docker ps \u67E5\u770B\u5BB9\u5668\u7684id</span>
<span class="token function">docker-compose</span> <span class="token builtin class-name">exec</span> \u5BB9\u5668id <span class="token function">bash</span>

<span class="token comment"># \u6216\u8005\u76F4\u63A5\u5728\u4EFB\u610F\u76EE\u5F55\u4E0B\u4F7F\u7528docker\u91CD\u542F</span>
<span class="token function">docker</span> restart \u5BB9\u5668id
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u914D\u7F6E\u865A\u62DF\u57DF\u540D" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E\u865A\u62DF\u57DF\u540D" aria-hidden="true">#</a> \u914D\u7F6E\u865A\u62DF\u57DF\u540D</h2><p>\u5982\u4E0A\u6240\u8FF0\uFF0C\u6211\u4EEC\u914D\u7F6E\u4E86<code>http://laravel.test</code>\u7684\u865A\u62DF\u57DF\u540D</p><p>\u6211\u4EEC\u5728<code>Mac</code>\u4E2D\u6709\u4E00\u4E2A\u8F6F\u4EF6\uFF1A<code>SwitchHosts</code>\u53EF\u4EE5\u8F7B\u677E\u505A\u5230\u3002<code>Windows</code>\u4E0B\u4F60\u4EEC\u53EF\u4EE5\u81EA\u5DF1\u53BB\u627E\u5230<code>hosts</code>\u6587\u4EF6\u8FDB\u884C\u4FEE\u6539\u5373\u53EF\u3002</p><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220221215315.png" alt="" loading="lazy"></p><p>\u914D\u7F6E\u5B8C\u6210\u4E4B\u540E\uFF0C\u6211\u4EEC\u5C1D\u8BD5<code>ping</code>\u901A\u4E00\u4E0B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">ping</span> laravel.test
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220221215419.png" alt="" loading="lazy"></p><p>\u6211\u4EEC\u5728\u6D4F\u89C8\u5668\u4E0A\u8BBF\u95EE\u662F\u5426\u53EF\u4EE5</p><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220221215526.png" alt="" loading="lazy"></p>`,34);function h(_,y){const a=i("ExternalLinkIcon");return l(),p("div",null,[d,n("p",null,[r,n("a",u,[v,e(a)])]),n("p",null,[k,n("a",m,[b,e(a)])]),g])}var w=c(t,[["render",h],["__file","mac-laradock.html.vue"]]);export{w as default};
