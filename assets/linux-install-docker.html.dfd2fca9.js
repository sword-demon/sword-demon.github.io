import{_ as a}from"./plugin-vue_export-helper.21dcd24c.js";import{r as c,o,c as i,a as n,b as l,d as e,e as d}from"./app.c4aa14d0.js";const t={},r=n("h2",{id:"\u5B89\u88C5-docker",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#\u5B89\u88C5-docker","aria-hidden":"true"},"#"),e(" \u5B89\u88C5 docker")],-1),u=e("Docker \u5B89\u88C5\u6587\u6863\uFF1A"),p={href:"https://docs.docker.com/install/linux/docker-ce/centos",target:"_blank",rel:"noopener noreferrer"},v=e("https://docs.docker.com/install/linux/docker-ce/centos"),m=d(`<ol><li><p>\u5378\u8F7D\u7CFB\u7EDF\u4E4B\u524D\u7684<code>docker</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sudo</span> yum remove <span class="token function">docker</span> <span class="token punctuation">\\</span>
 docker-client <span class="token punctuation">\\</span>
 docker-client-latest <span class="token punctuation">\\</span>
 docker-common <span class="token punctuation">\\</span>
 docker-latest <span class="token punctuation">\\</span>
 docker-latest-logrotate <span class="token punctuation">\\</span>
 docker-logrotate <span class="token punctuation">\\</span>
 docker-engine
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>\u4E0B\u8F7D\u5FC5\u987B\u4F9D\u8D56\u7684\u4E00\u4E9B\u5305</p></li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sudo</span> yum <span class="token function">install</span> -y yum-utils <span class="token punctuation">\\</span>
device-mapper-persistent-data <span class="token punctuation">\\</span>
lvm2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="3"><li>\u8BBE\u7F6E\u4E0B\u8F7D\u5730\u5740</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sudo</span> yum-config-manager <span class="token punctuation">\\</span>
--add-repo <span class="token punctuation">\\</span>
https://download.docker.com/linux/centos/docker-ce.repo
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="4"><li>\u5B89\u88C5 docker</li></ol><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sudo</span> yum <span class="token function">install</span> docker-ce docker-ce-cli containerd.io
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="5"><li><p>\u542F\u52A8 docker \u670D\u52A1\uFF1A<code>sudo systemctl start docker</code></p></li><li><p>\u67E5\u770B docker \u7248\u672C\uFF1A<code>docker -v</code></p></li><li><p>\u67E5\u770B docker \u955C\u50CF\uFF1A<code>docker images</code>\u4F1A\u51FA\u73B0\u6743\u9650\u4E0D\u8DB3\u7684\u95EE\u9898\uFF0C\u56E0\u4E3A\u4F60\u73B0\u5728<code>vagrant ssh</code>\u767B\u5F55\u7684\u662F<code>vagrant</code>\u9ED8\u8BA4\u7528\u6237\uFF0C\u9700\u8981\u52A0\u4E0A<code>sudo</code></p></li><li><p>\u8BBE\u7F6E docker \u5F00\u542F\u81EA\u542F\uFF1A<code>sudo systemctl enable docker</code></p></li></ol><h2 id="\u914D\u7F6E\u963F\u91CC\u4E91\u955C\u50CF\u52A0\u901F" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E\u963F\u91CC\u4E91\u955C\u50CF\u52A0\u901F" aria-hidden="true">#</a> \u914D\u7F6E\u963F\u91CC\u4E91\u955C\u50CF\u52A0\u901F</h2><ul><li>\u9996\u5148\u8FDB\u5165\u963F\u91CC\u4E91\u7F51\u7AD9</li><li>\u8FDB\u5165\u63A7\u5236\u53F0\uFF0C\u627E\u5230\u4EA7\u54C1\u4E0E\u670D\u52A1\uFF0C\u91CC\u9762\u6709\u5BB9\u5668\u4E0E\u955C\u50CF\u670D\u52A1\uFF0C\u627E\u5230\u955C\u50CF\u52A0\u901F\u5668\uFF0C\u627E\u5230 centos</li><li>\u6309\u7167\u64CD\u4F5C\u6587\u6863\u8BF4\u7684\u914D\u7F6E\u955C\u50CF\u52A0\u901F\u5668\u5373\u53EF</li></ul><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sudo</span> <span class="token function">mkdir</span> -p /etc/docker

<span class="token function">sudo</span> <span class="token function">tee</span> /etc/docker/daemon.json <span class="token operator">&lt;&lt;-</span><span class="token string">&#39;EOF&#39;
{
     &quot;registry-mirrors&quot;: [&quot;https://82m9ar63.mirror.aliyuncs.com&quot;]
}
EOF</span>

<span class="token function">sudo</span> systemctl daemon-reload
<span class="token function">sudo</span> systemctl restart <span class="token function">docker</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,10);function k(b,h){const s=c("ExternalLinkIcon");return o(),i("div",null,[r,n("p",null,[u,n("a",p,[v,l(s)])]),m])}var _=a(t,[["render",k],["__file","linux-install-docker.html.vue"]]);export{_ as default};