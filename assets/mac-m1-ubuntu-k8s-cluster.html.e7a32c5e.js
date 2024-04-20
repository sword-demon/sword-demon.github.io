import{_ as l}from"./plugin-vue_export-helper.21dcd24c.js";import{r as t,o as c,c as o,a as n,b as e,d as s,e as i}from"./app.47898b01.js";const p={},u=n("h1",{id:"mac-m1-\u5B89\u88C5-ubuntu-\u914D\u7F6E-k8s-\u96C6\u7FA4",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#mac-m1-\u5B89\u88C5-ubuntu-\u914D\u7F6E-k8s-\u96C6\u7FA4","aria-hidden":"true"},"#"),s(" mac m1 \u5B89\u88C5 ubuntu \u914D\u7F6E k8s \u96C6\u7FA4")],-1),d=n("h2",{id:"\u5B89\u88C5\u914D\u7F6E-ubuntu-arm-\u7248",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#\u5B89\u88C5\u914D\u7F6E-ubuntu-arm-\u7248","aria-hidden":"true"},"#"),s(" \u5B89\u88C5\u914D\u7F6E ubuntu arm \u7248")],-1),r=n("code",null,"iso",-1),v=s("\u7CFB\u7EDF\u955C\u50CF\u5730\u5740\uFF1A"),k={href:"https://cdimage.ubuntu.com/releases/20.04/release/",target:"_blank",rel:"noopener noreferrer"},m=s("https://cdimage.ubuntu.com/releases/20.04/release/"),b=i(`<p>\u9009\u62E9<code>20.04</code>\u7248\u672C\u7684<code>live-server-arm64</code></p><p>\u4F7F\u7528<code>pd</code>\u8F6F\u4EF6\u5B89\u88C5\u865A\u62DF\u673A\uFF0C\u57FA\u672C\u5C31\u662F\u4E0B\u4E00\u6B65\u4E0B\u4E00\u6B65\uFF0C\u989D\u5916\u7684\u5C31\u662F\u8981\u9009\u4E00\u4E0B\u5B89\u88C5<code>open ssh server</code>\u7528\u6765\u8FDB\u884C\u8FDC\u7A0B\u767B\u5F55\u7684\uFF0C\u4E4B\u540E\u5C31\u662F\u7B49\u5F85\u5B89\u88C5\u5B8C\u6210\u91CD\u542F\u3002</p><h3 id="\u914D\u7F6E\u9759\u6001-ip" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E\u9759\u6001-ip" aria-hidden="true">#</a> \u914D\u7F6E\u9759\u6001 IP</h3><p>\u91CD\u542F\u4E4B\u540E\uFF0C\u5207\u6362<code>root</code>\u7528\u6237\u5B89\u88C5\u7F51\u7EDC\u5DE5\u5177</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u5207\u6362 root \u7528\u6237</span>
<span class="token function">sudo</span> <span class="token function">su</span>
<span class="token function">apt</span> update -y
<span class="token function">apt</span> <span class="token function">install</span> net-tools -y

<span class="token comment"># \u67E5\u770B\u7F51\u5361\u4FE1\u606F</span>
<span class="token function">ifconfig</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230224212452406.png" alt="image-20230224212452406" loading="lazy"></p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230224212515132.png" alt="image-20230224212515132" loading="lazy"></p><blockquote><p>\u7F51\u5361\u540D\u4E3A<code>enp0s5</code>\uFF0C\u5F53\u524D<code>ip</code>\u4E3A\uFF1A<code>10.211.55.5</code>\uFF0C\u5B50\u7F51\u63A9\u7801\u4E3A<code>255.255.255.0</code>\uFF0C\u7F51\u5173\u5730\u5740\u4E3A\uFF1A<code>10.211.55.1</code></p></blockquote><blockquote><p>\u5B89\u88C5\u7F51\u7EDC\u7BA1\u7406\u5DE5\u5177</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">apt</span> <span class="token function">install</span> -y network-manager

<span class="token comment"># \u8FDB\u5165\u5BF9\u5E94\u7684\u76EE\u5F55\u5907\u4EFD\u914D\u7F6E\u6587\u4EF6</span>
<span class="token builtin class-name">cd</span> /etc/netplan
<span class="token function">cp</span> 00-install-config.yaml 00-install-config.yaml.bak
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6700\u7EC8\u4FEE\u6539\u4E3A</p><div class="language-yaml ext-yml line-numbers-mode"><pre class="language-yaml"><code><span class="token key atrule">netowork</span><span class="token punctuation">:</span>
	<span class="token key atrule">ethernets</span><span class="token punctuation">:</span>
		<span class="token key atrule">enp0s5</span><span class="token punctuation">:</span>
			<span class="token key atrule">dhcp4</span><span class="token punctuation">:</span> no
			<span class="token key atrule">dhcp6</span><span class="token punctuation">:</span> no
			<span class="token key atrule">addresses</span><span class="token punctuation">:</span> <span class="token punctuation">[</span>10.211.55.40/24<span class="token punctuation">]</span> <span class="token comment"># \u9759\u6001 ip</span>
			<span class="token key atrule">gateway4</span><span class="token punctuation">:</span> 10.211.55.1
			<span class="token key atrule">nameservers</span><span class="token punctuation">:</span>
				<span class="token key atrule">addresses</span><span class="token punctuation">:</span> <span class="token punctuation">[</span>8.8.8.8<span class="token punctuation">,</span> 114.114.114.114<span class="token punctuation">]</span>
	<span class="token key atrule">version</span><span class="token punctuation">:</span> <span class="token number">2</span>
	<span class="token key atrule">renderer</span><span class="token punctuation">:</span> NetworkManager
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8BA9\u914D\u7F6E\u751F\u6548</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>netplan apply
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u751F\u6548\u8FC7\u540E\u518D\u6B21\u67E5\u770B\u672C\u673A<code>ip</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">ifconfig</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230224213745955.png" alt="image-20230224213745955" loading="lazy"></p><blockquote><p>\u6B64\u65F6\u53EF\u4EE5\u770B\u5230<code>ip</code>\u5DF2\u7ECF\u662F\u6211\u4EEC\u521A\u624D\u8BBE\u7F6E\u7684\u9759\u6001<code>ip</code></p></blockquote><h3 id="\u66F4\u6362-apt-\u8F6F\u4EF6\u6E90" tabindex="-1"><a class="header-anchor" href="#\u66F4\u6362-apt-\u8F6F\u4EF6\u6E90" aria-hidden="true">#</a> \u66F4\u6362 apt \u8F6F\u4EF6\u6E90</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u5148\u5907\u4EFD</span>
<span class="token function">cp</span> /etc/apt/sources.list /etc/apt/sources.list.bak
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,20),g=s("\u963F\u91CC\u7684"),h=n("code",null,"Ubuntu Ports",-1),f=s("\u955C\u50CF\u6E90\u6587\u6863\u5730\u5740\uFF1A"),y={href:"https://developer.aliyun.com/mirror/ubuntu-ports?spm=a2c6h.13651104.0.0.2db94763fB2bfC",target:"_blank",rel:"noopener noreferrer"},q=s("https://developer.aliyun.com/mirror/ubuntu-ports?spm=a2c6h.13651104.0.0.2db94763fB2bfC"),x=s("\u8F6F\u4EF6\u6E90\u5730\u5740\uFF1A"),_={href:"https://mirrors.aliyun.com/ubuntu-ports/",target:"_blank",rel:"noopener noreferrer"},w=s("https://mirrors.aliyun.com/ubuntu-ports/"),E=i(`<p>\u6B64\u65F6\u4F60\u5C31\u53EF\u4EE5\u53BB\u4F7F\u7528\u4E00\u4E9B<code>ssh</code>\u8F6F\u4EF6\u8FDB\u884C\u8FDE\u63A5\uFF0C\u5728<code>ubuntu-live-server</code>\u91CC\u64CD\u4F5C\u7EC8\u7AEF\u59CB\u7EC8\u4E0D\u5F97\u52B2\u3002</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">ssh</span> root@10.211.55.40
<span class="token comment"># \u8F93\u5165\u5BC6\u7801\u5373\u53EF</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u914D\u7F6E\u4E2D\u79D1\u5927\u7684\u6E90</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sed</span> -i <span class="token string">&#39;s/http:\\/\\/ports.ubuntu.com/http:\\/\\/mirrors.ustc.edu.cn/g&#39;</span> /etc/apt/sources.list

<span class="token comment"># \u66F4\u65B0\u8F6F\u4EF6\u6E90</span>
<span class="token function">apt</span> update
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>\u4E0A\u9762\u662F\u4E3B\u8282\u70B9\u7684\u5B89\u88C5\u548C\u4E00\u4E9B\u914D\u7F6E\uFF0C\u4E0B\u9762\u5728\u5206\u522B\u6574 2 \u4E2A<code>ip</code>\u5206\u522B\u662F</p><ul><li>10.211.55.41 k8s-node1</li><li>10.211.55.42 k8s-node2</li></ul></div><h2 id="\u90E8\u7F72-k8s-\u96C6\u7FA4" tabindex="-1"><a class="header-anchor" href="#\u90E8\u7F72-k8s-\u96C6\u7FA4" aria-hidden="true">#</a> \u90E8\u7F72 K8S \u96C6\u7FA4</h2><h3 id="\u524D\u7F6E\u5DE5\u4F5C" tabindex="-1"><a class="header-anchor" href="#\u524D\u7F6E\u5DE5\u4F5C" aria-hidden="true">#</a> \u524D\u7F6E\u5DE5\u4F5C</h3><blockquote><p><code>master</code>\u8282\u70B9\u914D\u7F6E<code>etc/hosts</code>\u6587\u4EF6\u3002<strong>\u6CE8\u610F\u8981\u5207\u6362\u5230<code>root</code>\u7528\u6237</strong></p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> /etc/hosts

<span class="token number">10.211</span>.55.40 k8s-master
<span class="token number">10.211</span>.55.41 k8s-node1
<span class="token number">10.211</span>.55.42 k8s-node2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u5173\u95ED\u9632\u706B\u5899</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u67E5\u770B\u72B6\u6001</span>
systemctl status ufw.service
<span class="token comment"># \u5173\u95ED</span>
systemctl stop ufw.service
<span class="token comment"># \u7981\u7528</span>
systemctl disable ufw.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u5173\u95ED swap</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>systemctl status swap.target
systemctl stop swap.target
systemctl disable swap.target

systemctl status swap.img.swap
systemctl stop swap.img.swap

<span class="token function">free</span> -m

root@k8s-master:/home/wxvirus<span class="token comment"># free -m</span>
              total        used        <span class="token function">free</span>      shared  buff/cache   available
Mem:           <span class="token number">1974</span>         <span class="token number">177</span>        <span class="token number">1249</span>           <span class="token number">1</span>         <span class="token number">547</span>        <span class="token number">1710</span>
Swap:             <span class="token number">0</span>           <span class="token number">0</span>           <span class="token number">0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7B2C\u4E8C\u884C\u5168\u662F 0 \u8BF4\u660E\u5173\u6389\u4E86\u3002</p><blockquote><p>\u6CE8\u91CA\u6389\u6700\u540E\u7684<code>swap</code>\u7684\u4E00\u884C</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> /etc/fstab
<span class="token comment"># /swap.img     none    swap    sw      0       0</span>


<span class="token comment"># \u91CD\u542F</span>
<span class="token function">reboot</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u4FEE\u6539\u5185\u6838\u53C2\u6570</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u5F00\u542F ipv4 \u7684\u8F6C\u53D1\u529F\u80FD</span>
<span class="token function">tee</span> /etc/sysctl.d/k8s.conf <span class="token operator">&lt;&lt;-</span><span class="token string">&#39;EOF&#39;
net.ipv4.ip_forward = 1
EOF</span>

sysctl -p /etc/sysctl.d/k8s.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u5B89\u88C5<code>ipvsdm</code></p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">apt</span> <span class="token function">install</span> -y ipvsadm
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">cat</span> <span class="token operator">&gt;</span> /etc/modules-load.d/ipvs.conf <span class="token operator">&lt;&lt;</span> <span class="token string">EOF
ip_vs_dh
ip_vs_fo
ip_vs_ftp
ip_vs
ip_vs_lblc
ip_vs_lblcr
ip_vs_lc
ip_vs_mh
ip_vs_nq
ip_vs_ovf
ip_vs_pe_sip
ip_vs_rr
ip_vs_sed
ip_vs_sh
ip_vs_wlc
ip_vs_wrr
nf_conntrack
EOF</span>

systemctl <span class="token builtin class-name">enable</span> --now systemd-modules-load.service

lsmod <span class="token operator">|</span> <span class="token function">grep</span> ip_vs

<span class="token function">reboot</span>

<span class="token comment"># \u91CD\u542F\u540E\u518D\u6267\u884C</span>

lsmod <span class="token operator">|</span> <span class="token function">grep</span> ip_vs
<span class="token comment"># \u5C31\u4F1A\u6709\u5185\u5BB9\u4E86</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u5B89\u88C5-docker" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-docker" aria-hidden="true">#</a> \u5B89\u88C5 docker</h3><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u66F4\u65B0\u6E90</span>
<span class="token function">apt-get</span> update

<span class="token function">apt-get</span> <span class="token function">install</span> <span class="token punctuation">\\</span>
ca-certificates <span class="token punctuation">\\</span>
<span class="token function">curl</span> <span class="token punctuation">\\</span>
gnupg <span class="token punctuation">\\</span>
lsb-release

<span class="token function">mkdir</span> -p /etc/apt/keyrings

<span class="token function">curl</span> -fsSL https://download.docker.com/linux/ubuntu/gpg <span class="token operator">|</span> <span class="token function">sudo</span> gpg --dearmor -o /etc/apt/keyrings/docker.gpg

<span class="token builtin class-name">echo</span> <span class="token string">&quot;deb [arch=<span class="token variable"><span class="token variable">$(</span>dpkg --print-architecture<span class="token variable">)</span></span> signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu <span class="token variable"><span class="token variable">$(</span>lsb_release -cs<span class="token variable">)</span></span> stable&quot;</span> <span class="token operator">|</span> <span class="token function">sudo</span> <span class="token function">tee</span> /etc/apt/sources.list.d/docker.list <span class="token operator">&gt;</span> /dev/null
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,24),R={class:"custom-container tip"},A=n("p",{class:"custom-container-title"},"\u63D0\u793A",-1),S=n("p",null,[s("\u5982\u679C\u7CFB\u7EDF\u662F\u6D4B\u8BD5\u7248\uFF0C\u4E0D\u5EFA\u8BAE\u4F7F\u7528\u6D4B\u8BD5\u7248\u5185\u6838\uFF1B"),n("code",null,"lsb_release -cs"),s("\u662F\u5F53\u524D\u7CFB\u7EDF\u7684\u5185\u6838\u7248\u672C\uFF0C\u5982\u679C\u662F\u6D4B\u8BD5\u7248\u53EF\u80FD"),n("code",null,"docker"),s("\u4ECD\u672A\u652F\u6301\u3002")],-1),N={href:"https://download.docker.com/linux/ubuntu/dists/",target:"_blank",rel:"noopener noreferrer"},T=s("Index of linux/ubuntu/dists"),C=i(`<blockquote><p>\u5B89\u88C5<code>docker-engine</code></p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u66F4\u65B0\u6E90</span>
<span class="token function">apt-get</span> update

<span class="token function">apt-get</span> <span class="token function">install</span> docker-ce docker-ce-cli containerd.io docker-compose-plugin
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4F7F\u7528<code>docker</code>\u547D\u4EE4\u6D4B\u8BD5</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> images

systemctl status <span class="token function">docker</span>
systemctl <span class="token builtin class-name">enable</span> <span class="token function">docker</span>
systemctl start <span class="token function">docker</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u914D\u7F6E<code>docker</code>\u955C\u50CF\u548C<code>cgroupdriver</code></p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">cat</span> <span class="token operator">&gt;</span> /etc/docker/daemon.json <span class="token operator">&lt;&lt;-</span><span class="token string">EOF
{
	&quot;registry-mirrors&quot;: [
		&quot;https://docker.mirrors.ustc.edu.cn&quot;,
		&quot;https://registry.docker-cn.com&quot;
	],
	&quot;exec-opts&quot;: [&quot;native.cgroupdriver=systemd&quot;],
	&quot;log-driver&quot;: &quot;json-file&quot;,
	&quot;log-opts&quot;: {
		&quot;max-size&quot;: &quot;100m&quot;
	},
	&quot;storage-driver&quot;: &quot;overlay2&quot;
}
EOF</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u91CD\u542F<code>docker</code>\u8BFB\u53D6\u6700\u65B0\u914D\u7F6E</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>systemctl daemon-reload
systemctl restart <span class="token function">docker</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="\u5B89\u88C5-kubeadm\u3001kubectl\u3001kubelet" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-kubeadm\u3001kubectl\u3001kubelet" aria-hidden="true">#</a> \u5B89\u88C5 kubeadm\u3001kubectl\u3001kubelet</h3>`,9),M=s("\u5B98\u65B9\u955C\u50CF\u5F88\u6162\uFF0C\u6211\u4EEC\u4F7F\u7528\u963F\u91CC\u4E91\u7684\u955C\u50CF "),O={href:"https://developer.aliyun.com/mirror/kubernetes?spm=a2c6h.13651102.0.0.70be1b11GnjIXI",target:"_blank",rel:"noopener noreferrer"},P=s("https://developer.aliyun.com/mirror/kubernetes?spm=a2c6h.13651102.0.0.70be1b11GnjIXI"),I=i(`<div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">apt-get</span> update <span class="token operator">&amp;&amp;</span> <span class="token function">apt-get</span> <span class="token function">install</span> -y apt-transport-https

<span class="token function">curl</span> https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg <span class="token operator">|</span> apt-key <span class="token function">add</span> -

<span class="token function">cat</span> <span class="token operator">&lt;&lt;</span><span class="token string">EOF<span class="token bash punctuation"> <span class="token operator">&gt;</span>/etc/apt/sources.list.d/kubernetes.list</span>
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
EOF</span>

<span class="token function">apt-get</span> update

<span class="token comment"># \u8FD9\u91CC\u6CA1\u6709\u6307\u5B9A\u7248\u672C</span>
<span class="token function">apt-get</span> <span class="token function">install</span> -y kubelet kubeadm kubectl

<span class="token comment"># \u5B89\u88C5\u6307\u5B9A\u7248\u672C\uFF0C\u5426\u5219\u4F1A\u51FA\u73B0\u7248\u672C\u4E0D\u517C\u5BB9\u95EE\u9898\uFF01\uFF01\uFF01\uFF01</span>
<span class="token function">apt-get</span> <span class="token function">install</span> <span class="token assign-left variable">kubelet</span><span class="token operator">=</span><span class="token number">1.23</span>.5-00 <span class="token assign-left variable">kubeadm</span><span class="token operator">=</span><span class="token number">1.23</span>.5-00 <span class="token assign-left variable">kubectl</span><span class="token operator">=</span><span class="token number">1.23</span>.5-00

kubeadm version
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>centos</code>\u5728\u5BF9\u5E94\u6587\u6863\u6709\u5176\u5BF9\u5E94\u7684\u547D\u4EE4\u3002</p><h3 id="\u521D\u59CB\u5316\u96C6\u7FA4" tabindex="-1"><a class="header-anchor" href="#\u521D\u59CB\u5316\u96C6\u7FA4" aria-hidden="true">#</a> \u521D\u59CB\u5316\u96C6\u7FA4</h3><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p><code>k8s</code>\u7248\u672C\u4E5F\u5F97\u6307\u5B9A\u7248\u672C\uFF0C\u6700\u65B0\u7248\u53EF\u80FD\u4F1A\u6709\u95EE\u9898</p><p><code>apiserver</code>\u8BBE\u7F6E\u4E3A<code>master</code>\u8282\u70B9\u7684<code>ip</code>\u5730\u5740\uFF0C\u6211\u4EEC\u914D\u7F6E\u7684\u9759\u6001<code>ip</code></p><p><code>pod-network-cidr</code>\u9700\u8981\u548C\u540E\u9762<code>flannel</code>\u7F51\u7EDC\u63D2\u4EF6\u4E2D\u7684<code>yaml</code>\u6587\u4EF6\u914D\u7F6E\u7684<code>Network</code>\u4E00\u81F4\uFF0C\u56FA\u5B9A\u503C<code>10.244.0.0/16</code></p><p><code>image-repository</code>\u914D\u7F6E\u963F\u91CC\u4E91\u955C\u50CF</p></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>kubeadm init <span class="token punctuation">\\</span>
--kubernetes-version<span class="token operator">=</span>v1.23.5 <span class="token punctuation">\\</span>
--apiserver-advertise-address<span class="token operator">=</span><span class="token number">10.211</span>.55.40 <span class="token punctuation">\\</span>
--pod-network-cidr<span class="token operator">=</span><span class="token number">10.244</span>.0.0/16 <span class="token punctuation">\\</span>
--image-repository registry.aliyuncs.com/google_containers
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u5982\u679C\u96C6\u7FA4\u521D\u59CB\u5316\u5931\u8D25\uFF0C\u91CD\u7F6E\u540E\u91CD\u65B0\u5B89\u88C5</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>kubeadm reset
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p>\u521D\u59CB\u5316\u6210\u529F</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>Your Kubernetes control-plane has initialized successfully<span class="token operator">!</span>

To start using your cluster, you need to run the following as a regular user:

  <span class="token function">mkdir</span> -p <span class="token environment constant">$HOME</span>/.kube
  <span class="token function">sudo</span> <span class="token function">cp</span> -i /etc/kubernetes/admin.conf <span class="token environment constant">$HOME</span>/.kube/config
  <span class="token function">sudo</span> <span class="token function">chown</span> <span class="token variable"><span class="token variable">$(</span><span class="token function">id</span> -u<span class="token variable">)</span></span><span class="token builtin class-name">:</span><span class="token variable"><span class="token variable">$(</span><span class="token function">id</span> -g<span class="token variable">)</span></span> <span class="token environment constant">$HOME</span>/.kube/config

Alternatively, <span class="token keyword">if</span> you are the root user, you can run:

  <span class="token builtin class-name">export</span> <span class="token assign-left variable">KUBECONFIG</span><span class="token operator">=</span>/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run <span class="token string">&quot;kubectl apply -f [podnetwork].yaml&quot;</span> with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can <span class="token function">join</span> any number of worker nodes by running the following on each as root:

kubeadm <span class="token function">join</span> <span class="token number">10.211</span>.55.40:6443 --token 3ukdeg.m1jot1qii00ilyi2 <span class="token punctuation">\\</span>
        --discovery-token-ca-cert-hash sha256:caa3e1de6baad14a4413e7f4b68733e215f8ad2c3243f3a83cc9f66258838ea5
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><code>token</code>\u662F 24 \u5C0F\u65F6\u6709\u6548\u7684\uFF0C\u8FC7\u671F\u4E86\u9700\u8981\u91CD\u65B0\u751F\u6210</p></blockquote><p>\u56E0\u4E3A\u6211\u73B0\u5728\u662F<code>root</code>\u7528\u6237\uFF0C\u6240\u4EE5\u76F4\u63A5\u4F7F\u7528<code>root</code>\u7528\u6237\u5BF9\u5E94\u7684\u547D\u4EE4</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">export</span> <span class="token assign-left variable">KUBECONFIG</span><span class="token operator">=</span>/etc/kubernetes/admin.conf

<span class="token builtin class-name">echo</span> <span class="token string">&quot;export KUBECONFIG=/etc/kubernetes/admin.conf&quot;</span> <span class="token operator">&gt;&gt;</span> ~/.bash_profile

<span class="token comment"># \u66B4\u9732\u73AF\u5883\u53D8\u91CF root \u7528\u6237 \u4E00\u6B21\u751F\u6548</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;export KUBECONFIG=/etc/kubernetes/admin.conf&quot;</span> <span class="token operator">&gt;&gt;</span> /etc/profile
<span class="token builtin class-name">source</span> /etc/profile
<span class="token builtin class-name">echo</span> <span class="token variable">$KUBECONFIG</span>


<span class="token comment"># root \u7528\u6237\uFF0C\u6BCF\u6B21\u91CD\u542F\u4E5F\u80FD\u751F\u6548</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;source /etc/profile&quot;</span> <span class="token operator">&gt;&gt;</span> /root/.bashrc
<span class="token builtin class-name">source</span> /root/.bashrc

<span class="token function">reboot</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u67E5\u770B\u96C6\u7FA4\u60C5\u51B5</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>root@k8s-master:/home/wxvirus<span class="token comment"># kubectl get nodes</span>
NAME         STATUS     ROLES                  AGE     VERSION
k8s-master   NotReady   control-plane,master   7m57s   v1.23.5
root@k8s-master:/home/wxvirus<span class="token comment"># kubectl get pod -A</span>
NAMESPACE     NAME                                 READY   STATUS    RESTARTS   AGE
kube-system   coredns-6d8c4cb4d-bz5kp              <span class="token number">0</span>/1     Pending   <span class="token number">0</span>          8m24s
kube-system   coredns-6d8c4cb4d-xc5vw              <span class="token number">0</span>/1     Pending   <span class="token number">0</span>          8m24s
kube-system   etcd-k8s-master                      <span class="token number">1</span>/1     Running   <span class="token number">0</span>          8m41s
kube-system   kube-apiserver-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          8m41s
kube-system   kube-controller-manager-k8s-master   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          8m39s
kube-system   kube-proxy-h28t6                     <span class="token number">1</span>/1     Running   <span class="token number">0</span>          8m24s
kube-system   kube-scheduler-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          8m39s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4F1A\u53D1\u73B0\u4E0A\u9762 2 \u4E2A\u662F<code>pending</code>\u72B6\u6001\u7684</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>kubectl describe pod coredns-6d8c4cb4d-bz5kp -n kube-system
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>  Warning  FailedScheduling  4s <span class="token punctuation">(</span>x9 over 11m<span class="token punctuation">)</span>  default-scheduler  <span class="token number">0</span>/1 nodes are available: <span class="token number">1</span> node<span class="token punctuation">(</span>s<span class="token punctuation">)</span> had taint <span class="token punctuation">{</span>node.kubernetes.io/not-ready: <span class="token punctuation">}</span>, that the pod didn&#39;t tolerate.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u56E0\u4E3A\u90A3\u4E2A<code>flannel</code>\u7F51\u7EDC\u63D2\u4EF6\u8FD8\u6CA1\u5B89\u88C5\u3002\u3002\u3002</p><h3 id="\u5B89\u88C5-flannel" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-flannel" aria-hidden="true">#</a> \u5B89\u88C5 flannel</h3><div class="language-bash&#39; ext-bash&#39; line-numbers-mode"><pre class="language-bash&#39;"><code>git clone --depth 1 https://github.com/flannel-io/flannel.git

kubectl apply -f flannel/Documentation/kube-flannel.yaml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-yaml ext-yml line-numbers-mode"><pre class="language-yaml"><code><span class="token punctuation">---</span>
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Namespace
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
    <span class="token key atrule">name</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>flannel
    <span class="token key atrule">labels</span><span class="token punctuation">:</span>
        <span class="token key atrule">pod-security.kubernetes.io/enforce</span><span class="token punctuation">:</span> privileged
<span class="token punctuation">---</span>
<span class="token key atrule">kind</span><span class="token punctuation">:</span> ClusterRole
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> rbac.authorization.k8s.io/v1
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
    <span class="token key atrule">name</span><span class="token punctuation">:</span> flannel
<span class="token key atrule">rules</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> <span class="token string">&#39;&#39;</span>
      <span class="token key atrule">resources</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> pods
      <span class="token key atrule">verbs</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> get
    <span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> <span class="token string">&#39;&#39;</span>
      <span class="token key atrule">resources</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> nodes
      <span class="token key atrule">verbs</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> get
          <span class="token punctuation">-</span> list
          <span class="token punctuation">-</span> watch
    <span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> <span class="token string">&#39;&#39;</span>
      <span class="token key atrule">resources</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> nodes/status
      <span class="token key atrule">verbs</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> patch
    <span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> <span class="token string">&#39;networking.k8s.io&#39;</span>
      <span class="token key atrule">resources</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> clustercidrs
      <span class="token key atrule">verbs</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> list
          <span class="token punctuation">-</span> watch
<span class="token punctuation">---</span>
<span class="token key atrule">kind</span><span class="token punctuation">:</span> ClusterRoleBinding
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> rbac.authorization.k8s.io/v1
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
    <span class="token key atrule">name</span><span class="token punctuation">:</span> flannel
<span class="token key atrule">roleRef</span><span class="token punctuation">:</span>
    <span class="token key atrule">apiGroup</span><span class="token punctuation">:</span> rbac.authorization.k8s.io
    <span class="token key atrule">kind</span><span class="token punctuation">:</span> ClusterRole
    <span class="token key atrule">name</span><span class="token punctuation">:</span> flannel
<span class="token key atrule">subjects</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">kind</span><span class="token punctuation">:</span> ServiceAccount
      <span class="token key atrule">name</span><span class="token punctuation">:</span> flannel
      <span class="token key atrule">namespace</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>flannel
<span class="token punctuation">---</span>
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> ServiceAccount
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
    <span class="token key atrule">name</span><span class="token punctuation">:</span> flannel
    <span class="token key atrule">namespace</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>flannel
<span class="token punctuation">---</span>
<span class="token key atrule">kind</span><span class="token punctuation">:</span> ConfigMap
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
    <span class="token key atrule">name</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>flannel<span class="token punctuation">-</span>cfg
    <span class="token key atrule">namespace</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>flannel
    <span class="token key atrule">labels</span><span class="token punctuation">:</span>
        <span class="token key atrule">tier</span><span class="token punctuation">:</span> node
        <span class="token key atrule">app</span><span class="token punctuation">:</span> flannel
<span class="token key atrule">data</span><span class="token punctuation">:</span>
    <span class="token key atrule">cni-conf.json</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string">
        {
          &quot;name&quot;: &quot;cbr0&quot;,
          &quot;cniVersion&quot;: &quot;0.3.1&quot;,
          &quot;plugins&quot;: [
            {
              &quot;type&quot;: &quot;flannel&quot;,
              &quot;delegate&quot;: {
                &quot;hairpinMode&quot;: true,
                &quot;isDefaultGateway&quot;: true
              }
            },
            {
              &quot;type&quot;: &quot;portmap&quot;,
              &quot;capabilities&quot;: {
                &quot;portMappings&quot;: true
              }
            }
          ]
        }</span>
    <span class="token key atrule">net-conf.json</span><span class="token punctuation">:</span> <span class="token punctuation">|</span><span class="token scalar string">
        {
          &quot;Network&quot;: &quot;10.244.0.0/16&quot;,
          &quot;Backend&quot;: {
            &quot;Type&quot;: &quot;vxlan&quot;
          }
        }</span>
<span class="token punctuation">---</span>
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> DaemonSet
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
    <span class="token key atrule">name</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>flannel<span class="token punctuation">-</span>ds
    <span class="token key atrule">namespace</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>flannel
    <span class="token key atrule">labels</span><span class="token punctuation">:</span>
        <span class="token key atrule">tier</span><span class="token punctuation">:</span> node
        <span class="token key atrule">app</span><span class="token punctuation">:</span> flannel
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
    <span class="token key atrule">selector</span><span class="token punctuation">:</span>
        <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
            <span class="token key atrule">app</span><span class="token punctuation">:</span> flannel
    <span class="token key atrule">template</span><span class="token punctuation">:</span>
        <span class="token key atrule">metadata</span><span class="token punctuation">:</span>
            <span class="token key atrule">labels</span><span class="token punctuation">:</span>
                <span class="token key atrule">tier</span><span class="token punctuation">:</span> node
                <span class="token key atrule">app</span><span class="token punctuation">:</span> flannel
        <span class="token key atrule">spec</span><span class="token punctuation">:</span>
            <span class="token key atrule">affinity</span><span class="token punctuation">:</span>
                <span class="token key atrule">nodeAffinity</span><span class="token punctuation">:</span>
                    <span class="token key atrule">requiredDuringSchedulingIgnoredDuringExecution</span><span class="token punctuation">:</span>
                        <span class="token key atrule">nodeSelectorTerms</span><span class="token punctuation">:</span>
                            <span class="token punctuation">-</span> <span class="token key atrule">matchExpressions</span><span class="token punctuation">:</span>
                                  <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> kubernetes.io/os
                                    <span class="token key atrule">operator</span><span class="token punctuation">:</span> In
                                    <span class="token key atrule">values</span><span class="token punctuation">:</span>
                                        <span class="token punctuation">-</span> linux
            <span class="token key atrule">hostNetwork</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
            <span class="token key atrule">priorityClassName</span><span class="token punctuation">:</span> system<span class="token punctuation">-</span>node<span class="token punctuation">-</span>critical
            <span class="token key atrule">tolerations</span><span class="token punctuation">:</span>
                <span class="token punctuation">-</span> <span class="token key atrule">operator</span><span class="token punctuation">:</span> Exists
                  <span class="token key atrule">effect</span><span class="token punctuation">:</span> NoSchedule
            <span class="token key atrule">serviceAccountName</span><span class="token punctuation">:</span> flannel
            <span class="token key atrule">initContainers</span><span class="token punctuation">:</span>
                <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> install<span class="token punctuation">-</span>cni<span class="token punctuation">-</span>plugin
                  <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.io/flannel/flannel<span class="token punctuation">-</span>cni<span class="token punctuation">-</span>plugin<span class="token punctuation">:</span>v1.1.2
                  <span class="token comment">#image: docker.io/rancher/mirrored-flannelcni-flannel-cni-plugin:v1.1.2</span>
                  <span class="token key atrule">command</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> cp
                  <span class="token key atrule">args</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> <span class="token punctuation">-</span>f
                      <span class="token punctuation">-</span> /flannel
                      <span class="token punctuation">-</span> /opt/cni/bin/flannel
                  <span class="token key atrule">volumeMounts</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> cni<span class="token punctuation">-</span>plugin
                        <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> /opt/cni/bin
                <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> install<span class="token punctuation">-</span>cni
                  <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.io/flannel/flannel<span class="token punctuation">:</span>v0.21.2
                  <span class="token comment">#image: docker.io/rancher/mirrored-flannelcni-flannel:v0.21.2</span>
                  <span class="token key atrule">command</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> cp
                  <span class="token key atrule">args</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> <span class="token punctuation">-</span>f
                      <span class="token punctuation">-</span> /etc/kube<span class="token punctuation">-</span>flannel/cni<span class="token punctuation">-</span>conf.json
                      <span class="token punctuation">-</span> /etc/cni/net.d/10<span class="token punctuation">-</span>flannel.conflist
                  <span class="token key atrule">volumeMounts</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> cni
                        <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> /etc/cni/net.d
                      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> flannel<span class="token punctuation">-</span>cfg
                        <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> /etc/kube<span class="token punctuation">-</span>flannel/
            <span class="token key atrule">containers</span><span class="token punctuation">:</span>
                <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>flannel
                  <span class="token key atrule">image</span><span class="token punctuation">:</span> docker.io/flannel/flannel<span class="token punctuation">:</span>v0.21.2
                  <span class="token comment">#image: docker.io/rancher/mirrored-flannelcni-flannel:v0.21.2</span>
                  <span class="token key atrule">command</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> /opt/bin/flanneld
                  <span class="token key atrule">args</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> <span class="token punctuation">-</span><span class="token punctuation">-</span>ip<span class="token punctuation">-</span>masq
                      <span class="token punctuation">-</span> <span class="token punctuation">-</span><span class="token punctuation">-</span>kube<span class="token punctuation">-</span>subnet<span class="token punctuation">-</span>mgr
                  <span class="token key atrule">resources</span><span class="token punctuation">:</span>
                      <span class="token key atrule">requests</span><span class="token punctuation">:</span>
                          <span class="token key atrule">cpu</span><span class="token punctuation">:</span> <span class="token string">&#39;100m&#39;</span>
                          <span class="token key atrule">memory</span><span class="token punctuation">:</span> <span class="token string">&#39;50Mi&#39;</span>
                  <span class="token key atrule">securityContext</span><span class="token punctuation">:</span>
                      <span class="token key atrule">privileged</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>
                      <span class="token key atrule">capabilities</span><span class="token punctuation">:</span>
                          <span class="token key atrule">add</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&#39;NET_ADMIN&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;NET_RAW&#39;</span><span class="token punctuation">]</span>
                  <span class="token key atrule">env</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> POD_NAME
                        <span class="token key atrule">valueFrom</span><span class="token punctuation">:</span>
                            <span class="token key atrule">fieldRef</span><span class="token punctuation">:</span>
                                <span class="token key atrule">fieldPath</span><span class="token punctuation">:</span> metadata.name
                      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> POD_NAMESPACE
                        <span class="token key atrule">valueFrom</span><span class="token punctuation">:</span>
                            <span class="token key atrule">fieldRef</span><span class="token punctuation">:</span>
                                <span class="token key atrule">fieldPath</span><span class="token punctuation">:</span> metadata.namespace
                      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> EVENT_QUEUE_DEPTH
                        <span class="token key atrule">value</span><span class="token punctuation">:</span> <span class="token string">&#39;5000&#39;</span>
                  <span class="token key atrule">volumeMounts</span><span class="token punctuation">:</span>
                      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> run
                        <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> /run/flannel
                      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> flannel<span class="token punctuation">-</span>cfg
                        <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> /etc/kube<span class="token punctuation">-</span>flannel/
                      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> xtables<span class="token punctuation">-</span>lock
                        <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> /run/xtables.lock
            <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
                <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> run
                  <span class="token key atrule">hostPath</span><span class="token punctuation">:</span>
                      <span class="token key atrule">path</span><span class="token punctuation">:</span> /run/flannel
                <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> cni<span class="token punctuation">-</span>plugin
                  <span class="token key atrule">hostPath</span><span class="token punctuation">:</span>
                      <span class="token key atrule">path</span><span class="token punctuation">:</span> /opt/cni/bin
                <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> cni
                  <span class="token key atrule">hostPath</span><span class="token punctuation">:</span>
                      <span class="token key atrule">path</span><span class="token punctuation">:</span> /etc/cni/net.d
                <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> flannel<span class="token punctuation">-</span>cfg
                  <span class="token key atrule">configMap</span><span class="token punctuation">:</span>
                      <span class="token key atrule">name</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>flannel<span class="token punctuation">-</span>cfg
                <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> xtables<span class="token punctuation">-</span>lock
                  <span class="token key atrule">hostPath</span><span class="token punctuation">:</span>
                      <span class="token key atrule">path</span><span class="token punctuation">:</span> /run/xtables.lock
                      <span class="token key atrule">type</span><span class="token punctuation">:</span> FileOrCreate
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u3010\u53EF\u80FD\u4F1A\u53D1\u751F\u5F02\u5E38\u3011\uFF1A\u5982\u679C\u6CA1\u6709\u5F00\u542F\u4EE3\u7406\uFF0C\u62C9\u53D6\u955C\u50CF\u4F1A\u51FA\u73B0 <strong>Error:ErrImagePull</strong> \u89E3\u51B3\u529E\u6CD5\u662F\u5F00\u542F\u672C\u5730\u4EE3\u7406\uFF0C\u6216\u8005\u7F51\u4E0A\u627E\u529E\u6CD5\u5148\u62C9\u53D6\u56FD\u5185\u7684\u5730\u5740\u7684<code>flannel</code>\u955C\u50CF</p>`,22),G=s("\u624B\u52A8\u529E\u6CD5\uFF1A"),j={href:"https://www.dqzboy.com/5306.html",target:"_blank",rel:"noopener noreferrer"},F=s("https://www.dqzboy.com/5306.html"),U=i(`<p><strong>\u4E00\u6CE2\u4E09\u6298</strong></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>root@k8s-master:/home/wxvirus<span class="token comment"># git clone --depth 1 https://github.com/flannel-io/flannel.git</span>
Cloning into <span class="token string">&#39;flannel&#39;</span><span class="token punctuation">..</span>.
fatal: unable to access <span class="token string">&#39;https://github.com/flannel-io/flannel.git/&#39;</span><span class="token builtin class-name">:</span> GnuTLS recv error <span class="token punctuation">(</span>-54<span class="token punctuation">)</span>: Error <span class="token keyword">in</span> the pull function.
root@k8s-master:/home/wxvirus<span class="token comment"># git clone --depth 1 https://github.com/flannel-io/flannel.git</span>
Cloning into <span class="token string">&#39;flannel&#39;</span><span class="token punctuation">..</span>.
remote: Enumerating objects: <span class="token number">239</span>, done.
remote: Counting objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">239</span>/239<span class="token punctuation">)</span>, done.
remote: Compressing objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">221</span>/221<span class="token punctuation">)</span>, done.
remote: Total <span class="token number">239</span> <span class="token punctuation">(</span>delta <span class="token number">33</span><span class="token punctuation">)</span>, reused <span class="token number">109</span> <span class="token punctuation">(</span>delta <span class="token number">12</span><span class="token punctuation">)</span>, pack-reused <span class="token number">0</span>
Receiving objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">239</span>/239<span class="token punctuation">)</span>, <span class="token number">2.32</span> MiB <span class="token operator">|</span> <span class="token number">6.86</span> MiB/s, done.
Resolving deltas: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">33</span>/33<span class="token punctuation">)</span>, done.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>root@k8s-master:/home/wxvirus<span class="token comment"># kubectl apply -f flannel/Documentation/kube-flannel.yml</span>
namespace/kube-flannel created
clusterrole.rbac.authorization.k8s.io/flannel created
clusterrolebinding.rbac.authorization.k8s.io/flannel created
serviceaccount/flannel created
configmap/kube-flannel-cfg created
daemonset.apps/kube-flannel-ds created
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u91CC\u6211\u4EEC\u9047\u5230\u4E00\u4E2A\u95EE\u9898\uFF0C</p><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230225005837029.png" alt="image-20230225005837029" loading="lazy"></p><p>\u6211\u4EEC\u8FD8\u662F\u5C3D\u91CF\u5C1D\u8BD5\u518D\u53BB\u7528<code>docker</code>\u5728\u62C9\u53D6\u4E00\u904D</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> pull docker.io/flannel/flannel:v0.21.2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p>\u867D\u7136\u8FC7\u7A0B\u8F83\u957F\uFF0C\u8017\u65F6\u8F83\u957F\uFF0C\u4F46\u662F\u6700\u7EC8\u8FD8\u662F\u62C9\u4E0B\u6765\u4E86\uFF1B\u955C\u50CF\u62C9\u53D6\u6210\u529F\u540E\uFF0C\u7B49\u4E00\u4F1A\uFF0CK8S \u96C6\u7FA4\u5C31\u542F\u52A8\u6210\u529F\u4E86</p></blockquote><p>\u4F46\u662F\u5982\u679C\u6709\u80FD\u529B\u7684\uFF0C\u4F1A\u81EA\u5DF1\u7F16\u8F91<code>kube-flannel.yaml</code>\u7684\uFF0C\u53EF\u4EE5\u8BB2\u4E00\u4E9B\u955C\u50CF\u6362\u6210\u56FD\u5185\u7684\uFF0C\u7136\u540E\u5728\u8FDB\u884C\u62C9\u53D6\u3002</p><blockquote><p>\u6700\u7EC8\u6548\u679C</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>root@k8s-master:/home/wxvirus<span class="token comment"># kubectl get pod -A</span>
NAMESPACE      NAME                                 READY   STATUS    RESTARTS   AGE
kube-flannel   kube-flannel-ds-djnrl                <span class="token number">1</span>/1     Running   <span class="token number">0</span>          50m
kube-system    coredns-6d8c4cb4d-bz5kp              <span class="token number">1</span>/1     Running   <span class="token number">0</span>          84m
kube-system    coredns-6d8c4cb4d-xc5vw              <span class="token number">1</span>/1     Running   <span class="token number">0</span>          84m
kube-system    etcd-k8s-master                      <span class="token number">1</span>/1     Running   <span class="token number">0</span>          84m
kube-system    kube-apiserver-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          84m
kube-system    kube-controller-manager-k8s-master   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          84m
kube-system    kube-proxy-h28t6                     <span class="token number">1</span>/1     Running   <span class="token number">0</span>          84m
kube-system    kube-scheduler-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          84m
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u5EFA\u8BAE\uFF1A\u914D\u7F6E<code>ipvs</code>\uFF0C\u9ED8\u8BA4\u5747\u8861\u7B97\u6CD5\u4E3A\u8F6E\u8BE2\uFF1A\u5C06 44 \u884C\u7684<code>mode</code>\u6539\u4E3A<code>ipvs</code></p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>kubectl edit configmap kube-proxy -n kube-system

<span class="token comment"># vim \u4E0B\u663E\u793A\u884C\u53F7</span>
:set nu
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230225010724926.png" alt="image-20230225010724926" loading="lazy"></p><blockquote><p>\u5220\u9664\u65E7\u7684<code>kube-proxy</code>\uFF0C\u81EA\u52A8\u4F1A\u91CD\u65B0\u542F\u52A8\u4E00\u4E2A<code>proxy</code></p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>root@k8s-master:/home/wxvirus<span class="token comment"># kubectl get pod -A</span>
NAMESPACE      NAME                                 READY   STATUS    RESTARTS   AGE
kube-flannel   kube-flannel-ds-djnrl                <span class="token number">1</span>/1     Running   <span class="token number">0</span>          62m
kube-system    coredns-6d8c4cb4d-bz5kp              <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95m
kube-system    coredns-6d8c4cb4d-xc5vw              <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95m
kube-system    etcd-k8s-master                      <span class="token number">1</span>/1     Running   <span class="token number">0</span>          96m
kube-system    kube-apiserver-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          96m
kube-system    kube-controller-manager-k8s-master   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          96m
kube-system    kube-proxy-h28t6                     <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95m
kube-system    kube-scheduler-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          96m

<span class="token comment"># \u5220\u9664\u65E7 pod</span>
kubectl delete pod -n kube-system kube-proxy-h28t6
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4F1A\u91CD\u65B0\u542F\u52A8\u4E00\u4E2A\u65B0\u7684<code>proxy</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>root@k8s-master:/home/wxvirus<span class="token comment"># kubectl get pod -A</span>
NAMESPACE      NAME                                 READY   STATUS    RESTARTS   AGE
kube-flannel   kube-flannel-ds-djnrl                <span class="token number">1</span>/1     Running   <span class="token number">0</span>          62m
kube-system    coredns-6d8c4cb4d-bz5kp              <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95m
kube-system    coredns-6d8c4cb4d-xc5vw              <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95m
kube-system    etcd-k8s-master                      <span class="token number">1</span>/1     Running   <span class="token number">0</span>          96m
kube-system    kube-apiserver-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          96m
kube-system    kube-controller-manager-k8s-master   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          96m
kube-system    kube-proxy-h28t6                     <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95m
kube-system    kube-scheduler-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          96m
root@k8s-master:/home/wxvirus<span class="token comment"># kubectl delete pod -n kube-system kube-proxy-h28t6</span>
pod <span class="token string">&quot;kube-proxy-h28t6&quot;</span> deleted
root@k8s-master:/home/wxvirus<span class="token comment"># kubectl get pod -A</span>
NAMESPACE      NAME                                 READY   STATUS    RESTARTS   AGE
kube-flannel   kube-flannel-ds-djnrl                <span class="token number">1</span>/1     Running   <span class="token number">0</span>          64m
kube-system    coredns-6d8c4cb4d-bz5kp              <span class="token number">1</span>/1     Running   <span class="token number">0</span>          97m
kube-system    coredns-6d8c4cb4d-xc5vw              <span class="token number">1</span>/1     Running   <span class="token number">0</span>          97m
kube-system    etcd-k8s-master                      <span class="token number">1</span>/1     Running   <span class="token number">0</span>          98m
kube-system    kube-apiserver-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          98m
kube-system    kube-controller-manager-k8s-master   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          98m
kube-system    kube-proxy-x6g86                     <span class="token number">1</span>/1     Running   <span class="token number">0</span>          1s
kube-system    kube-scheduler-k8s-master            <span class="token number">1</span>/1     Running   <span class="token number">0</span>          98m
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u67E5\u770B\u914D\u7F6E</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>ipvsadm -Ln

root@k8s-master:/home/wxvirus<span class="token comment"># kubectl logs -n kube-system kube-proxy-x6g86 | grep ipvs</span>
I0224 <span class="token number">17</span>:11:04.673561       <span class="token number">1</span> server_others.go:269<span class="token punctuation">]</span> <span class="token string">&quot;Using ipvs Proxier&quot;</span>
I0224 <span class="token number">17</span>:11:04.673577       <span class="token number">1</span> server_others.go:271<span class="token punctuation">]</span> <span class="token string">&quot;Creating dualStackProxier for ipvs&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>\u5982\u679C\u865A\u62DF\u673A\u91CD\u542F\u4E4B\u540E\uFF0C<code>k8s</code>\u96C6\u7FA4\u6CA1\u6709\u542F\u52A8\uFF0C\u91CD\u65B0\u542F\u52A8<code>k8s</code>\u96C6\u7FA4</p><p>\u6B63\u5E38\u60C5\u51B5\u4E0B\uFF0C<code>kubelet</code>\u4F1A\u81EA\u52A8\u542F\u52A8\u7684</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u542F\u52A8 kubelet</span>
systemctl <span class="token builtin class-name">enable</span> kubelet

<span class="token comment"># \u67E5\u770B\u72B6\u6001</span>
systemctl status kubelet

<span class="token comment"># \u5982\u679C linux \u5173\u673A\u4E86\uFF0C\u91CD\u542Fk8s</span>
systemctl daemon-reload
systemctl restart kubelet

<span class="token comment"># \u4F7F\u7528 kubectl \u67E5\u770B\u662F\u5426\u542F\u52A8\u6210\u529F \u9700\u8981\u5207\u6362\u5230 root \u7528\u6237</span>
kubectl get nodes
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u673A\u5668\u91CD\u542F" tabindex="-1"><a class="header-anchor" href="#\u673A\u5668\u91CD\u542F" aria-hidden="true">#</a> \u673A\u5668\u91CD\u542F</h2><p>\u518D\u6B21\u8BBE\u7F6E\u73AF\u5883\u53D8\u91CF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">echo</span> <span class="token string">&quot;export KUBECONFIG=/etc/kubernetes/admin.conf&quot;</span><span class="token operator">&gt;&gt;</span>/etc/profile
<span class="token builtin class-name">source</span> /etc/profile
<span class="token builtin class-name">echo</span> <span class="token variable">$KUBECONFIG</span>

kubectl get nodes

<span class="token comment"># root \u7528\u6237\uFF0C\u6BCF\u6B21\u91CD\u542F\u4E5F\u80FD\u751F\u6548</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;source /etc/profile&quot;</span> <span class="token operator">&gt;&gt;</span> /root/.bashrc
<span class="token builtin class-name">source</span> /root/.bashrc

<span class="token function">reboot</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="woker-\u8282\u70B9" tabindex="-1"><a class="header-anchor" href="#woker-\u8282\u70B9" aria-hidden="true">#</a> woker \u8282\u70B9</h2><blockquote><p>worker \u8282\u70B9\uFF0C\u6211\u4EEC\u5728\u5B89\u88C5 master \u8282\u70B9\u7684\u65F6\u5019\uFF0C\u5728\u6CA1\u8FDB\u884C\u90E8\u7F72<code>k8s</code>\u76F8\u5173\u7684\u4EFB\u4F55\u90E8\u5206\u7684\u90A3\u4E00\u523B\uFF0C\u5C31\u53EF\u4EE5\u53BB\u514B\u9686\u865A\u62DF\u673A\u955C\u50CF\u4E86\uFF0C\u7701\u7684\u540E\u9762\u8FD8\u5F97\u518D\u6765\u4E00\u5957<code>docker</code>\u5B89\u88C5\uFF0C\u914D\u7F6E\u5565\u7684\u3002</p><p>\u8FD9\u4E2A\u65F6\u5019\u4F60\u53EF\u4EE5\u540C\u65F6\u7ED9\u4F60 2 \u4E2A<code>node</code>\u8282\u70B9\u540C\u65F6\u5B89\u88C5</p></blockquote><p>\u6211\u4EEC\u662F\u6CA1\u6709\u5B89\u88C5<code>docker</code>\uFF0C\u8FD8\u5F97\u6765\u4E00\u904D<code>docker</code>\u5B89\u88C5\u914D\u7F6E\u7684</p><p>\u6211\u4EEC\u518D\u5230\u5B89\u88C5<code>kubeadm\u3002\u3002\u3002</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">apt-get</span> update <span class="token operator">&amp;&amp;</span> <span class="token function">apt-get</span> <span class="token function">install</span> -y apt-transport-https

<span class="token function">curl</span> https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg <span class="token operator">|</span> apt-key <span class="token function">add</span> -

<span class="token function">cat</span> <span class="token operator">&lt;&lt;</span><span class="token string">EOF<span class="token bash punctuation"> <span class="token operator">&gt;</span>/etc/apt/sources.list.d/kubernetes.list</span>
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
EOF</span>

<span class="token function">apt-get</span> update

<span class="token comment"># \u8FD9\u91CC\u6CA1\u6709\u6307\u5B9A\u7248\u672C</span>
<span class="token function">apt-get</span> <span class="token function">install</span> -y kubelet kubeadm kubectl

<span class="token comment"># \u5B89\u88C5\u6307\u5B9A\u7248\u672C\uFF0C\u5426\u5219\u4F1A\u51FA\u73B0\u7248\u672C\u4E0D\u517C\u5BB9\u95EE\u9898\uFF01\uFF01\uFF01\uFF01</span>
<span class="token function">apt-get</span> <span class="token function">install</span> <span class="token assign-left variable">kubelet</span><span class="token operator">=</span><span class="token number">1.23</span>.5-00 <span class="token assign-left variable">kubeadm</span><span class="token operator">=</span><span class="token number">1.23</span>.5-00 <span class="token assign-left variable">kubectl</span><span class="token operator">=</span><span class="token number">1.23</span>.5-00

kubeadm version
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5728\u4F7F\u7528<code>master</code>\u8282\u70B9\u7684\u751F\u6210\u7684\u5185\u5BB9\u52A0\u5165\u96C6\u7FA4</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>kubeadm <span class="token function">join</span> <span class="token number">10.211</span>.55.40:6443 --token 3ukdeg.m1jot1qii00ilyi2 <span class="token punctuation">\\</span>
        --discovery-token-ca-cert-hash sha256:caa3e1de6baad14a4413e7f4b68733e215f8ad2c3243f3a83cc9f66258838ea5
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><code>token</code>\u6709\u6548\u671F\u4E3A 24 \u5C0F\u65F6\uFF0C\u8FC7\u671F\u540E\u9700\u8981\u91CD\u65B0\u751F\u6210</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># master \u8282\u70B9\u67E5\u770B token list</span>
kubeadm token list
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>root@k8s-node1:/home/wxvirus<span class="token comment"># kubeadm join 10.211.55.40:6443 --token 3ukdeg.m1jot1qii00ilyi2 \\</span>
<span class="token operator">&gt;</span>         --discovery-token-ca-cert-hash sha256:caa3e1de6baad14a4413e7f4b68733e215f8ad2c3243f3a83cc9f66258838ea5
<span class="token punctuation">[</span>preflight<span class="token punctuation">]</span> Running pre-flight checks
	<span class="token punctuation">[</span>WARNING SystemVerification<span class="token punctuation">]</span>: this Docker version is not on the list of validated versions: <span class="token number">23.0</span>.1. Latest validated version: <span class="token number">20.10</span>
<span class="token punctuation">[</span>preflight<span class="token punctuation">]</span> Reading configuration from the cluster<span class="token punctuation">..</span>.
<span class="token punctuation">[</span>preflight<span class="token punctuation">]</span> FYI: You can <span class="token function">look</span> at this config <span class="token function">file</span> with <span class="token string">&#39;kubectl -n kube-system get cm kubeadm-config -o yaml&#39;</span>
W0224 <span class="token number">17</span>:49:08.708669    <span class="token number">6836</span> utils.go:69<span class="token punctuation">]</span> The recommended value <span class="token keyword">for</span> <span class="token string">&quot;resolvConf&quot;</span> <span class="token keyword">in</span> <span class="token string">&quot;KubeletConfiguration&quot;</span> is: /run/systemd/resolve/resolv.conf<span class="token punctuation">;</span> the provided value is: /run/systemd/resolve/resolv.conf
<span class="token punctuation">[</span>kubelet-start<span class="token punctuation">]</span> Writing kubelet configuration to <span class="token function">file</span> <span class="token string">&quot;/var/lib/kubelet/config.yaml&quot;</span>
<span class="token punctuation">[</span>kubelet-start<span class="token punctuation">]</span> Writing kubelet environment <span class="token function">file</span> with flags to <span class="token function">file</span> <span class="token string">&quot;/var/lib/kubelet/kubeadm-flags.env&quot;</span>
<span class="token punctuation">[</span>kubelet-start<span class="token punctuation">]</span> Starting the kubelet
<span class="token punctuation">[</span>kubelet-start<span class="token punctuation">]</span> Waiting <span class="token keyword">for</span> the kubelet to perform the TLS Bootstrap<span class="token punctuation">..</span>.

This <span class="token function">node</span> has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run <span class="token string">&#39;kubectl get nodes&#39;</span> on the control-plane to see this <span class="token function">node</span> <span class="token function">join</span> the cluster.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u6211\u4EEC\u53EF\u4EE5\u53BB<code>master</code>\u8282\u70B9\u67E5\u770B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>kubectl get nodes
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p>\u8981\u7B49\u4E00\u4F1A\uFF0C\u7B49<code>worker</code>\u8282\u70B9\u542F\u52A8\u5B8C\u6210\uFF1B\u6211\u5B89\u88C5\u7684\u65F6\u5019\u4F1A\u7B49\u5F88\u4E45\uFF0C\u8FD8\u662F\u90A3\u4E2A<code>flannel</code>\u7684\u95EE\u9898\uFF0C\u62C9\u7684\u592A\u8D39\u65F6\u95F4\u4E86\u3002</p></blockquote><h2 id="\u5728-worker-\u8282\u70B9\u4F7F\u7528kubectl" tabindex="-1"><a class="header-anchor" href="#\u5728-worker-\u8282\u70B9\u4F7F\u7528kubectl" aria-hidden="true">#</a> \u5728 worker \u8282\u70B9\u4F7F\u7528<code>kubectl</code></h2><p>\u5728<code>master</code>\u8282\u70B9\u4E0B\u628A<code>admin.conf</code>\u590D\u5236\u4E00\u4EFD\u5230<code>worker</code>\u8282\u70B9</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">scp</span> /etc/kunernetes/admin.conf worker\u8282\u70B9\u7684\u7528\u6237@worker\u8282\u70B9\u7684ip:~
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5728\u5207\u6362\u5230\u5BF9\u5E94\u7684<code>worker</code>\u8282\u70B9\u53BB\u67E5\u770B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> ~
<span class="token comment"># \u5982\u679C\u662F\u5BF9\u5E94\u7684\u7528\u6237\u76EE\u5F55\u5219\u4F1A\u5728 /home/xxx \u4E0B</span>

<span class="token comment"># \u79FB\u52A8</span>
<span class="token function">mv</span> admin.conf /etc/kubernetes/


<span class="token comment">#\u7136\u540E\u91CD\u590D\u64CD\u4F5C</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;export KUBECONFIG=/etc/kubernetes/admin.conf&quot;</span><span class="token operator">&gt;&gt;</span>/etc/profile
<span class="token builtin class-name">source</span> /etc/profile
<span class="token builtin class-name">echo</span> <span class="token variable">$KUBECONFIG</span>

kubectl get nodes

<span class="token comment"># root \u7528\u6237\uFF0C\u6BCF\u6B21\u91CD\u542F\u4E5F\u80FD\u751F\u6548</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;source /etc/profile&quot;</span> <span class="token operator">&gt;&gt;</span> /root/.bashrc
<span class="token builtin class-name">source</span> /root/.bashrc

<span class="token function">reboot</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>root@k8s-master:/home/wxvirus<span class="token comment"># kubectl get nodes</span>
NAME         STATUS   ROLES                  AGE    VERSION
k8s-master   Ready    control-plane,master   161m   v1.23.5
k8s-node1    Ready    <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>                 24m    v1.23.5
k8s-node2    Ready    <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>                 24m    v1.23.5
root@k8s-master:/home/wxvirus<span class="token comment">#</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6700\u7EC8\u90FD<code>Ready</code>\u5219\u6210\u529F\u4E86\u3002</p>`,46);function z(B,D){const a=t("ExternalLinkIcon");return c(),o("div",null,[u,d,n("p",null,[r,v,n("a",k,[m,e(a)])]),b,n("p",null,[g,h,f,n("a",y,[q,e(a)])]),n("p",null,[x,n("a",_,[w,e(a)])]),E,n("div",R,[A,S,n("p",null,[n("a",N,[T,e(a)])])]),C,n("p",null,[M,n("a",O,[P,e(a)])]),I,n("p",null,[G,n("a",j,[F,e(a)])]),U])}var L=l(p,[["render",z],["__file","mac-m1-ubuntu-k8s-cluster.html.vue"]]);export{L as default};
