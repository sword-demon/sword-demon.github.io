import{_ as t}from"./plugin-vue_export-helper.21dcd24c.js";import{r as l,o as i,c,a as n,b as e,d as s,e as p}from"./app.6934a89b.js";const o={},u=n("h1",{id:"kubernetes-\u96C6\u7FA4\u521D\u59CB\u5316",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#kubernetes-\u96C6\u7FA4\u521D\u59CB\u5316","aria-hidden":"true"},"#"),s(" Kubernetes \u96C6\u7FA4\u521D\u59CB\u5316")],-1),d=n("h2",{id:"k8s-\u7248\u672C",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#k8s-\u7248\u672C","aria-hidden":"true"},"#"),s(" K8S \u7248\u672C")],-1),r=n("p",null,[s("\u4F7F\u7528"),n("code",null,"v1.23.9")],-1),k={href:"https://www.downloadkubernetes.com/",target:"_blank",rel:"noopener noreferrer"},v=s("\u5B98\u65B9\u4E0B\u8F7D\u5730\u5740"),m=n("p",null,[s("\u6CE8\u610F\u9009\u62E9\u5BF9\u5E94\u7684"),n("code",null,"linux"),s("\u7CFB\u7EDF\u67B6\u6784\u4EE5\u53CA\u7248\u672C")],-1),b=n("h2",{id:"\u5B89\u88C5-kubeadm",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#\u5B89\u88C5-kubeadm","aria-hidden":"true"},"#"),s(" \u5B89\u88C5 kubeadm")],-1),g={href:"https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/",target:"_blank",rel:"noopener noreferrer"},h=s("\u5B98\u7F51\u5730\u5740"),_=p(`<p>\u907F\u514D\u7F51\u7EDC\u4E0B\u8F7D\u7F13\u6162\uFF0C\u4E0B\u8F7D\u4F9D\u8D56\u5305\u6587\u4EF6:</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>\u94FE\u63A5: https://pan.baidu.com/s/1eshofN6Ac3grVX4QDxnvrA \u63D0\u53D6\u7801: kh98
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5B89\u88C5\u811A\u672C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token shebang important">#!/bin/sh</span>
<span class="token comment"># \u6307\u5B9A\u6587\u4EF6\u5305\u8DEF\u5F84</span>
<span class="token assign-left variable">K8S_INSTALL_PKG</span><span class="token operator">=~</span>/k8s_install/k8s_install_pkg
<span class="token comment"># \u5B89\u88C5CNI\u63D2\u4EF6</span>
<span class="token assign-left variable">CNI_VERSION</span><span class="token operator">=</span><span class="token string">&quot;v0.8.2&quot;</span>
<span class="token assign-left variable">ARCH</span><span class="token operator">=</span><span class="token string">&quot;amd64&quot;</span>
<span class="token function">sudo</span> <span class="token function">mkdir</span> -p /opt/cni/bin
<span class="token comment">#curl -L &quot;https://github.com/containernetworking/plugins/releases/download/\${CNI_VERSION}/cni-plugins-linux-\${ARCH}-\${CNI_VERSION}.tgz&quot; | sudo tar -C /opt/cni/bin -xz</span>
<span class="token function">tar</span> -zxvf <span class="token variable">$K8S_INSTALL_PKG</span>/cni-plugins-linux-<span class="token variable">\${ARCH}</span>-<span class="token variable">\${CNI_VERSION}</span>.tgz -C /opt/cni/bin
<span class="token comment"># \u6307\u5B9A\u53EF\u6267\u884C\u76EE\u5F55\u5730\u5740</span>
<span class="token assign-left variable">DOWNLOAD_DIR</span><span class="token operator">=</span>/usr/local/bin
<span class="token function">sudo</span> <span class="token function">mkdir</span> -p <span class="token variable">$DOWNLOAD_DIR</span>

<span class="token comment"># \u5B89\u88C5crictl</span>
<span class="token assign-left variable">CRICTL_VERSION</span><span class="token operator">=</span><span class="token string">&quot;v1.22.0&quot;</span>
<span class="token assign-left variable">ARCH</span><span class="token operator">=</span><span class="token string">&quot;amd64&quot;</span>
<span class="token comment">#curl -L &quot;https://github.com/kubernetes-sigs/cri-tools/releases/download/\${CRICTL_VERSION}/crictl-\${CRICTL_VERSION}-linux-\${ARCH}.tar.gz&quot; | sudo tar -C $DOWNLOAD_DIR -xz</span>
<span class="token function">tar</span> -zxvf <span class="token variable">$K8S_INSTALL_PKG</span>/crictl-<span class="token variable">\${CRICTL_VERSION}</span>-linux-<span class="token variable">\${ARCH}</span>.tar.gz -C <span class="token variable">$DOWNLOAD_DIR</span>
<span class="token comment">#\u5B89\u88C5kubeadm kubelete kubectl</span>
<span class="token comment">#RELEASE=&quot;$(curl -sSL https://dl.k8s.io/release/stable.txt)&quot;</span>
<span class="token assign-left variable">RELEASE</span><span class="token operator">=</span><span class="token string">&quot;v1.23.9&quot;</span>
<span class="token assign-left variable">ARCH</span><span class="token operator">=</span><span class="token string">&quot;amd64&quot;</span>
<span class="token builtin class-name">cd</span> <span class="token variable">$DOWNLOAD_DIR</span>
<span class="token comment">#sudo curl -L --remote-name-all https://storage.googleapis.com/kubernetes-release/release/\${RELEASE}/bin/linux/\${ARCH}/{kubeadm,kubelet,kubectl}</span>
<span class="token builtin class-name">cd</span> <span class="token variable">$K8S_INSTALL_PKG</span>
<span class="token function">cp</span> kubeadm kubelet kubectl <span class="token variable">$DOWNLOAD_DIR</span>/
<span class="token builtin class-name">cd</span> <span class="token variable">$DOWNLOAD_DIR</span>
<span class="token function">sudo</span> <span class="token function">chmod</span> +x kubeadm kubectl kubelet

<span class="token assign-left variable">RELEASE_VERSION</span><span class="token operator">=</span><span class="token string">&quot;v0.4.0&quot;</span>
<span class="token comment">#curl -sSL &quot;https://raw.githubusercontent.com/kubernetes/release/\${RELEASE_VERSION}/cmd/kubepkg/templates/latest/deb/kubelet/lib/systemd/system/kubelet.service&quot; | sed &quot;s:/usr/bin:\${DOWNLOAD_DIR}:g&quot; | sudo tee /etc/systemd/system/kubelet.service</span>
<span class="token function">cat</span> <span class="token variable">$K8S_INSTALL_PKG</span>/kubelet.service <span class="token operator">|</span> <span class="token function">sed</span> <span class="token string">&quot;s:/usr/bin:<span class="token variable">\${DOWNLOAD_DIR}</span>:g&quot;</span> <span class="token operator">|</span> <span class="token function">sudo</span> <span class="token function">tee</span> /etc/systemd/system/kubelet.service
<span class="token comment">#sudo mkdir -p /etc/systemd/system/kubelet.service.d</span>
<span class="token comment">#curl -sSL &quot;https://raw.githubusercontent.com/kubernetes/release/\${RELEASE_VERSION}/cmd/kubepkg/templates/latest/deb/kubeadm/10-kubeadm.conf&quot; | sed &quot;s:/usr/bin:\${DOWNLOAD_DIR}:g&quot; | sudo tee /etc/systemd/system/kubelet.service.d/10-kubeadm.conf</span>
<span class="token function">sudo</span> <span class="token function">mkdir</span> -p /etc/systemd/system/kubelet.service.d
<span class="token function">cat</span> <span class="token variable">$K8S_INSTALL_PKG</span>/10-kubeadm.conf <span class="token operator">|</span> <span class="token function">sed</span> <span class="token string">&quot;s:/usr/bin:<span class="token variable">\${DOWNLOAD_DIR}</span>:g&quot;</span> <span class="token operator">|</span> <span class="token function">sudo</span> <span class="token function">tee</span> /etc/systemd/system/kubelet.service.d/10-kubeadm.conf

<span class="token comment"># \u8BBE\u7F6Ekubelet\u5F00\u542F\u81EA\u52A8\u81EA\u52A8</span>
systemctl <span class="token builtin class-name">enable</span> --now kubelet
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sudo</span> <span class="token function">chmod</span> +x k8s_install.sh

<span class="token comment"># \u6267\u884C\u547D\u4EE4</span>
./k8s_install_sh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u9A8C\u8BC1\u5B89\u88C5</p><blockquote><p>\u5982\u679C\u80FD\u591F\u5728\u7EC8\u7AEF\u4F7F\u7528\u547D\u4EE4\u57FA\u672C\u5B89\u88C5\u5B8C\u6210</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>kubeadm version
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p>\u521D\u59CB\u5316</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u67E5\u770B\u53C2\u6570</span>
kubeadm init -h
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> k8s_install_pkg

<span class="token comment"># \u6253\u5370\u9ED8\u8BA4\u7684\u914D\u7F6E\u53C2\u6570</span>
kubeadm config print init-defaults <span class="token operator">&gt;</span> kubeadm-init-temp.yaml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4FEE\u6539\u90E8\u5206\u5185\u5BB9\uFF0C\u7ED9\u955C\u50CF\u52A0\u901F\uFF0C\u4EE5\u53CA\u5BF9\u5E94\u7684\u8282\u70B9\u8BBF\u95EE\u5730\u5740</p><div class="language-yaml ext-yml line-numbers-mode"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> kubeadm.k8s.io/v1beta2
<span class="token key atrule">bootstrapTokens</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">groups</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> system<span class="token punctuation">:</span>bootstrappers<span class="token punctuation">:</span>kubeadm<span class="token punctuation">:</span>default<span class="token punctuation">-</span>node<span class="token punctuation">-</span>token
      <span class="token key atrule">token</span><span class="token punctuation">:</span> abcdef.0123456789abcdef
      <span class="token key atrule">ttl</span><span class="token punctuation">:</span> 24h0m0s
      <span class="token key atrule">usages</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> signing
          <span class="token punctuation">-</span> authentication
<span class="token key atrule">kind</span><span class="token punctuation">:</span> InitConfiguration
<span class="token key atrule">localAPIEndpoint</span><span class="token punctuation">:</span>
    <span class="token comment">#\u8282\u70B9\u8BBF\u95EE\u5730\u5740</span>
    <span class="token key atrule">advertiseAddress</span><span class="token punctuation">:</span> 192.168.10.52
    <span class="token key atrule">bindPort</span><span class="token punctuation">:</span> <span class="token number">6443</span>
<span class="token key atrule">nodeRegistration</span><span class="token punctuation">:</span>
    <span class="token key atrule">criSocket</span><span class="token punctuation">:</span> /var/run/dockershim.sock
    <span class="token comment">#\u8282\u70B9\u540D\u5B57</span>
    <span class="token key atrule">name</span><span class="token punctuation">:</span> master
    <span class="token key atrule">taints</span><span class="token punctuation">:</span> <span class="token null important">null</span>
<span class="token punctuation">---</span>
<span class="token key atrule">apiServer</span><span class="token punctuation">:</span>
    <span class="token key atrule">timeoutForControlPlane</span><span class="token punctuation">:</span> 4m0s
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> kubeadm.k8s.io/v1beta2
<span class="token key atrule">certificatesDir</span><span class="token punctuation">:</span> /etc/kubernetes/pki
<span class="token key atrule">clusterName</span><span class="token punctuation">:</span> kubernetes
<span class="token key atrule">controllerManager</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token key atrule">dns</span><span class="token punctuation">:</span>
    <span class="token key atrule">type</span><span class="token punctuation">:</span> CoreDNS
<span class="token key atrule">etcd</span><span class="token punctuation">:</span>
    <span class="token key atrule">local</span><span class="token punctuation">:</span>
        <span class="token key atrule">dataDir</span><span class="token punctuation">:</span> /var/lib/etcd
        <span class="token comment">#etcd\u8BBF\u95EE\u5730\u5740</span>
        <span class="token key atrule">extraArgs</span><span class="token punctuation">:</span>
            <span class="token key atrule">listen-client-urls</span><span class="token punctuation">:</span> <span class="token string">&#39;https://127.0.0.1:2379,https://127.0.0.1:2379&#39;</span>
            <span class="token key atrule">listen-peer-urls</span><span class="token punctuation">:</span> <span class="token string">&#39;https://127.0.0.1:2380&#39;</span>
<span class="token comment">#\u955C\u50CF\u62C9\u53D6\u4EE3\u7406\u5730\u5740</span>
<span class="token key atrule">imageRepository</span><span class="token punctuation">:</span> registry.aliyuncs.com/google_containers
<span class="token key atrule">kind</span><span class="token punctuation">:</span> ClusterConfiguration
<span class="token comment">#k8s\u7248\u672C</span>
<span class="token key atrule">kubernetesVersion</span><span class="token punctuation">:</span> 1.21.6
<span class="token key atrule">networking</span><span class="token punctuation">:</span>
    <span class="token key atrule">dnsDomain</span><span class="token punctuation">:</span> cluster.local
    <span class="token key atrule">serviceSubnet</span><span class="token punctuation">:</span> 10.96.0.0/12
    <span class="token comment"># \u51B3\u5B9A pod \u7684\u7F51\u7EDC\u5206\u914D</span>
    <span class="token key atrule">podSubnet</span><span class="token punctuation">:</span> 10.244.0.0/16
<span class="token key atrule">scheduler</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">---</span>
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> kubeproxy.config.k8s.io/v1alpha1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> KubeProxyConfiguration
<span class="token key atrule">clusterCIDR</span><span class="token punctuation">:</span> <span class="token string">&#39;10.244.0.0/16&#39;</span>
<span class="token comment"># \u542F\u7528 ipvs \u6A21\u5F0F</span>
<span class="token key atrule">mode</span><span class="token punctuation">:</span> <span class="token string">&#39;ipvs&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u521D\u59CB\u5316</span>
kubeadm init --config kubeadm-init.yaml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u914D\u7F6E\u73AF\u5883\u53D8\u91CF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">mkdir</span> -p <span class="token environment constant">$HOME</span>/.kube
<span class="token function">sudo</span> <span class="token function">cp</span> -i /etc/kubernetes/admin.conf <span class="token environment constant">$HOME</span>/.kube/config
<span class="token function">sudo</span> <span class="token function">chown</span> <span class="token variable"><span class="token variable">$(</span><span class="token function">id</span> -u<span class="token variable">)</span></span><span class="token builtin class-name">:</span><span class="token variable"><span class="token variable">$(</span><span class="token function">id</span> -g<span class="token variable">)</span></span> <span class="token environment constant">$HOME</span>/.kube/config
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u83B7\u53D6\u8282\u70B9\u8FDB\u884C\u6D4B\u8BD5</span>
kubectl get nodes

<span class="token comment"># \u67E5\u770B\u6240\u6709\u7684 pod \u7F51\u7EDC\u63D2\u4EF6\u53EF\u80FD\u4F1A\u4E0D\u884C</span>
kubectl get pod -A
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u914D\u7F6E\u7F51\u7EDC\u63D2\u4EF6<code>flannel</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>kubectl apply -f kube-flannel.yml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7136\u540E\u518D\u6301\u7EED\u4F7F\u7528<code>kubectl get pod -A</code>\u67E5\u770B\u662F\u5426\u8FD0\u884C\u8D77\u6765</p>`,20);function f(y,I){const a=l("ExternalLinkIcon");return i(),c("div",null,[u,d,r,n("p",null,[n("a",k,[v,e(a)])]),m,b,n("p",null,[n("a",g,[h,e(a)])]),_])}var x=t(o,[["render",f],["__file","k8s-init-kubeadm.html.vue"]]);export{x as default};
