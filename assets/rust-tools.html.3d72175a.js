import{_ as d}from"./plugin-vue_export-helper.21dcd24c.js";import{r as l,o as c,c as r,a as e,b as i,e as s,d as a}from"./app.90ebc455.js";const o={},t=s(`<h1 id="\u5E38\u7528\u5DE5\u5177" tabindex="-1"><a class="header-anchor" href="#\u5E38\u7528\u5DE5\u5177" aria-hidden="true">#</a> \u5E38\u7528\u5DE5\u5177</h1><h2 id="pre-commit" tabindex="-1"><a class="header-anchor" href="#pre-commit" aria-hidden="true">#</a> pre-commit</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>pip <span class="token function">install</span> pre-commit
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5B89\u88C5\u6210\u529F\u540E\u8FD0\u884C<code>pre-commit install</code></p><h2 id="cargo-deny" tabindex="-1"><a class="header-anchor" href="#cargo-deny" aria-hidden="true">#</a> cargo deny</h2><blockquote><p>\u7528\u4E8E\u68C0\u67E5\u4F9D\u8D56\u7684\u5B89\u5168\u6027</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">install</span> --locked cargo-deny
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="typos" tabindex="-1"><a class="header-anchor" href="#typos" aria-hidden="true">#</a> typos</h2><blockquote><p>\u62FC\u5199\u68C0\u67E5\u5DE5\u5177</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">install</span> typos-cli
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="git-cliff" tabindex="-1"><a class="header-anchor" href="#git-cliff" aria-hidden="true">#</a> git cliff</h2><blockquote><p>\u751F\u4EA7\u4E00\u4E2A<code>changelog</code>\u7684\u5DE5\u5177</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">install</span> git-cliff
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="nextest" tabindex="-1"><a class="header-anchor" href="#nextest" aria-hidden="true">#</a> nextest</h2><blockquote><p>rust \u7684\u589E\u5F3A\u6D4B\u8BD5\u5DE5\u5177</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">install</span> cargo-nextest --locked
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="cargo-generate" tabindex="-1"><a class="header-anchor" href="#cargo-generate" aria-hidden="true">#</a> cargo-generate</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">install</span> cargo-generate
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="custom-container danger"><p class="custom-container-title">\u95EE\u9898</p><p>\u5982\u679C\u9047\u5230\u4E00\u4E2A</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>\u4F7F\u7528 cargo generate \u4F1A\u51FA\u73B0 unknown http scheme &#39;socks5&#39;; class=Http (34)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></div><p>\u53EF\u80FD\u662F\u4F60\u7684<code>git</code>\u8BBE\u7F6E\u4E86<code>proxy</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">git</span> config --global --unset http.proxy
<span class="token function">git</span> config --global --unset https.proxy
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u6837\u4E4B\u540E\u518D\u6B21\u5C1D\u8BD5\u5373\u53EF</p><h2 id="tokei" tabindex="-1"><a class="header-anchor" href="#tokei" aria-hidden="true">#</a> tokei</h2><p>\u7EDF\u8BA1\u4EE3\u7801\u884C\u6570\u7684\u5DE5\u5177</p>`,24),u={href:"https://github.com/XAMPPRocky/tokei",target:"_blank",rel:"noopener noreferrer"},p=a("https://github.com/XAMPPRocky/tokei"),h=s(`<div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token comment"># \u6211\u4F7F\u7528 cargo \u5B89\u88C5</span>
cargo <span class="token function">install</span> tokei
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="rustc" tabindex="-1"><a class="header-anchor" href="#rustc" aria-hidden="true">#</a> rustc</h2><ul><li><p>\u67E5\u770B\u7248\u672C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>rustc --version
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>\u7F16\u8BD1\u751F\u6210\u4E8C\u8FDB\u5236\u6587\u4EF6</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>rustc -o output_filename filename.rs
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>\u7F16\u8BD1\u751F\u6210\u5E93\u6587\u4EF6</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>rustc --crate-type lib filename.rs
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li></ul><h2 id="\u5F00\u53D1\u73AF\u5883" tabindex="-1"><a class="header-anchor" href="#\u5F00\u53D1\u73AF\u5883" aria-hidden="true">#</a> \u5F00\u53D1\u73AF\u5883</h2><ul><li><p>\u63A8\u8350: <code>vscode</code></p></li><li><p><code>vscode</code>\u63D2\u4EF6</p><ul><li><code>rust-analyzer</code></li><li><code>Error Lens</code></li></ul></li><li><p>\u9690\u5F0F\u7684\u4F7F\u7528<code>rustc</code>\u8FDB\u884C\u7F16\u8BD1</p></li><li><p>\u547D\u4EE4</p><ul><li><p>\u521B\u5EFA</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo new project_name

<span class="token comment"># \u521B\u5EFA\u4E00\u4E2A\u65B0\u7684 rust \u5E93\u9879\u76EE</span>
cargo new --lib project_name
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>\u6784\u5EFA\u9879\u76EE\uFF08\u751F\u6210\u4E8C\u8FDB\u5236\u53EF\u6267\u884C\u6587\u4EF6\u6216\u5E93\u6587\u4EF6\uFF09</p><ul><li><code>cargo build</code></li><li><code>cargo build --release</code>\u4E3A\u751F\u6210\u4F18\u5316\u7684\u53EF\u6267\u884C\u6587\u4EF6\uFF0C\u5E38\u7528\u4E8E\u751F\u4EA7\u73AF\u5883</li></ul></li><li><p>\u68C0\u6D4B</p><ul><li><code>cargo check</code></li></ul></li><li><p>\u8FD0\u884C\u3001\u6D4B\u8BD5</p><ul><li><code>cargo run / cargo test</code></li></ul></li></ul></li></ul><h3 id="\u9879\u76EE\u7ED3\u6784" tabindex="-1"><a class="header-anchor" href="#\u9879\u76EE\u7ED3\u6784" aria-hidden="true">#</a> \u9879\u76EE\u7ED3\u6784</h3><ul><li>\u5E93</li><li><code>project_name/</code><ul><li><code>Cargo.toml</code></li><li><code>src/</code><ul><li><code>lib.rs</code></li></ul></li></ul></li><li>\u53EF\u6267\u884C\u4E8C\u8FDB\u5236</li><li><code>project_name/</code><ul><li><code>Cargo.toml</code></li><li><code>src/</code><ul><li><code>main.rs</code></li></ul></li></ul></li></ul><p><code>Cargo.toml</code>\u6587\u4EF6</p><ul><li><code>package</code><ul><li>\u8BBE\u7F6E\u9879\u76EE\u540D</li><li>\u7248\u672C\u7B49</li></ul></li><li><code>dependencies</code><ul><li>\u8BBE\u7F6E\u4F9D\u8D56</li><li><code>[build-dependencies]</code>\u5217\u51FA\u4E86\u5728\u6784\u5EFA\u9879\u76EE\u65F6\u9700\u8981\u7684\u4F9D\u8D56\u9879</li><li><code>[dev-dependencies]</code>\u5217\u51FA\u4E86\u53EA\u5728\u5F00\u53D1\u65F6\u9700\u8981\u7684\u4F9D\u8D56\u9879</li></ul></li></ul><h2 id="\u5B98\u65B9\u5E93" tabindex="-1"><a class="header-anchor" href="#\u5B98\u65B9\u5E93" aria-hidden="true">#</a> \u5B98\u65B9\u5E93</h2>`,10),v={href:"https://crates.io",target:"_blank",rel:"noopener noreferrer"},b=a("https://crates.io"),g=s(`<h2 id="cargo-edit" tabindex="-1"><a class="header-anchor" href="#cargo-edit" aria-hidden="true">#</a> cargo-edit</h2><p>\u5B89\u88C5</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">install</span> cargo-edit
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6DFB\u52A0\u5E93</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">add</span> dependency_name
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5B89\u88C5\u6307\u5B9A\u7248\u672C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">add</span> dependency_name@1.2.3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6DFB\u52A0\u5F00\u53D1\u65F6\u7528\u7684\u4F9D\u8D56\u5E93</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">add</span> --dev dev_dependency_name
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6DFB\u52A0\u6784\u5EFA\u65F6\u4F7F\u7528\u7684\u4F9D\u8D56\u5E93</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">add</span> --build build_dependency_name
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5220\u9664\u5E93</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>cargo <span class="token function">rm</span> dependency_name

<span class="token comment"># \u5220\u9664\u5F00\u53D1\u65F6\u7684</span>
cargo <span class="token function">rm</span> --dev dependency_name
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="\u8BBE\u7F6E\u56FD\u5185\u6E90" tabindex="-1"><a class="header-anchor" href="#\u8BBE\u7F6E\u56FD\u5185\u6E90" aria-hidden="true">#</a> \u8BBE\u7F6E\u56FD\u5185\u6E90</h2>`,14),m=a("\u63A8\u8350"),x=e("code",null,"rsproxy.cn",-1),f=a(),_={href:"https://rsproxy.cn/",target:"_blank",rel:"noopener noreferrer"},k=a("https://rsproxy.cn/"),y=s(`<p>\u6587\u4EF6: <code>~/.cargo/config</code></p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>[source.crates-io]
replace-with = &#39;rsproxy-sparse&#39;
[source.rsproxy]
registry = &quot;https://rsproxy.cn/crates.io-index&quot;
[source.rsproxy-sparse]
registry = &quot;sparse+https://rsproxy.cn/index/&quot;
[registries.rsproxy]
index = &quot;https://rsproxy.cn/crates.io-index&quot;
[net]
git-fetch-with-cli = true
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6309\u7167\u8FD9\u4E2A\u7F51\u7AD9\u7684\u4ECB\u7ECD\u4F7F\u7528\u5C31\u884C</p>`,3);function q(w,j){const n=l("ExternalLinkIcon");return c(),r("div",null,[t,e("p",null,[e("a",u,[p,i(n)])]),h,e("p",null,[e("a",v,[b,i(n)])]),g,e("p",null,[m,x,f,e("a",_,[k,i(n)])]),y])}var N=d(o,[["render",q],["__file","rust-tools.html.vue"]]);export{N as default};