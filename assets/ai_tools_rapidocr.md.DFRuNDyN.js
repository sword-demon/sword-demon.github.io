import{bV as n,aL as a,u as p,G as e}from"./chunks/framework.BfzMay2U.js";const u=JSON.parse('{"title":"为hermes安装rapidocr提取图片文字","description":"","frontmatter":{"title":"为hermes安装rapidocr提取图片文字","date":"2026-08-20T22:04:10.000Z"},"headers":[],"relativePath":"ai/tools/rapidocr.md","filePath":"ai/tools/rapidocr.md"}'),l={name:"ai/tools/rapidocr.md"};function i(r,s,c,b,t,o){return a(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="为hermes安装rapidocr提取图片文字" tabindex="-1">为hermes安装rapidocr提取图片文字 <a class="header-anchor" href="#为hermes安装rapidocr提取图片文字" aria-label="Permalink to &quot;为hermes安装rapidocr提取图片文字&quot;">​</a></h1><p>在 <code>hermes</code>里面直接让它基于<code>python</code>环境安装<code>RapidOCR</code>到当前 python 环境里，<code>hermes</code>会自己帮你执行好任务。</p><p>安装完成之后，你要让它形成记忆，让它以后使用<code>RapidOCR</code>优先来提取图片文字，最后再使用视觉模型，不要一上来就使用视觉模型。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>已成功安装 RapidOCR 到 Python 3.13 环境 ♪</span></span>
<span class="line"><span></span></span>
<span class="line"><span>已安装的包：</span></span>
<span class="line"><span>  • rapidocr              3.9.2  (主程序)</span></span>
<span class="line"><span>  • onnxruntime           1.29.0 (推理引擎，OCR 必须依赖)</span></span>
<span class="line"><span>  • opencv-python         5.0.0.93 (图像处理)</span></span>
<span class="line"><span>  • omegaconf             2.3.1  (配置解析)</span></span>
<span class="line"><span>  • 配套依赖: pyclipper, colorlog, antlr4-python3-runtime, six, flatbuffers</span></span>
<span class="line"><span></span></span>
<span class="line"><span>模型文件 (PP-OCRv6 最新版，自动下载完成)：</span></span>
<span class="line"><span>  • PP-OCRv6_det_small.onnx (文字检测)</span></span>
<span class="line"><span>  • PP-OCRv6_rec_small.onnx (文字识别)</span></span>
<span class="line"><span>  • ch_ppocr_mobile_v2.0_cls_mobile.onnx (文字方向分类)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>安装路径：/Users/wxvirus/Library/Python/3.13/lib/python/site-packages/</span></span>
<span class="line"><span>二进制脚本路径：/Users/wxvirus/Library/Python/3.13/bin/ (未在 PATH 中，使用 Python 调用即可)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>═══════════════════════════════════</span></span>
<span class="line"><span>以后提取图片文字的使用方式 (★ ω ★)</span></span>
<span class="line"><span>═══════════════════════════════════</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Python 调用方式：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>from rapidocr import RapidOCR</span></span>
<span class="line"><span>engine = RapidOCR()</span></span>
<span class="line"><span>result = engine(&#39;/path/to/image.png&#39;)</span></span>
<span class="line"><span>result 格式: ([boxes, texts, scores], None)</span></span>
<span class="line"><span>直接取出文字列表:</span></span>
<span class="line"><span>texts = result[0][1] if result[0] else []</span></span>
<span class="line"><span>print(&#39;\\n&#39;.join(texts))</span></span>
<span class="line"><span></span></span>
<span class="line"><span>或者更简洁：</span></span>
<span class="line"><span>result, _ = engine(&#39;/path/to/image.png&#39;)</span></span>
<span class="line"><span>if result:</span></span>
<span class="line"><span>    boxes, texts, scores = result</span></span>
<span class="line"><span>    for text, score in zip(texts, scores):</span></span>
<span class="line"><span>        print(f&#39;{text} (置信度: {score:.2f})&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>命令行方式 (先把脚本路径加到 PATH 或用全路径)：</span></span>
<span class="line"><span>~/Library/Python/3.13/bin/rapidocr -path /path/to/image.png</span></span>
<span class="line"><span></span></span>
<span class="line"><span>═══════════════════════════════════</span></span>
<span class="line"><span>特点备注</span></span>
<span class="line"><span>═══════════════════════════════════</span></span>
<span class="line"><span>• 默认支持中文 + 英文，如需其它语言可传 params，如 engine(&#39;/path&#39;, params={&#39;Global.lang_det&#39;: &#39;japan&#39;, ...})</span></span>
<span class="line"><span>• 完全离线运行，首次加载后无需联网</span></span>
<span class="line"><span>• 返回带坐标 boxes + 文字 texts + 置信度 scores，方便后续处理</span></span>
<span class="line"><span>• 比 Tesseract 对中文场景准确率高很多哦～</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br></div></div><h2 id="电脑清理" tabindex="-1">电脑清理 <a class="header-anchor" href="#电脑清理" aria-label="Permalink to &quot;电脑清理&quot;">​</a></h2><p>先把安全规则写在前面</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&gt; 我的磁盘空间快满了，请帮我检查可以清理的文件。</span></span>
<span class="line"><span>&gt;</span></span>
<span class="line"><span>&gt; 先不要删除任何东西，只做扫描和分类。</span></span>
<span class="line"><span>&gt;</span></span>
<span class="line"><span>&gt; 请把结果分成三类：</span></span>
<span class="line"><span>&gt;</span></span>
<span class="line"><span>&gt; 1. 基本无副作用，可以建议删除的缓存，例如应用缓存、npm 缓存、pip 缓存、临时日志、下载目录里的安装包。</span></span>
<span class="line"><span>&gt; 2. 需要我确认后才能删除的内容，例如模拟器数据、项目依赖缓存、聊天软件文件、应用主数据、很久没用的大文件。</span></span>
<span class="line"><span>&gt; 3. 不建议删除的内容，例如用户文档、桌面归档、照片、聊天记录、配置文件、正在使用的项目目录。</span></span>
<span class="line"><span>&gt;</span></span>
<span class="line"><span>&gt; 每一项都要告诉我路径、占用空间、为什么归到这一类。</span></span>
<span class="line"><span>&gt; 扫描完成后先汇总，不要执行删除。</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>删除前再确认一次，第一次跑通之后，可以手动将这套规则沉淀成技能。</p><div class="language-bash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">帮我把这套规则沉淀成技能</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><blockquote><p>但是使用<code>Agent</code>必须建立一个习惯：凡是涉及删除、覆盖、迁移、改配置的任务，都不能只给目标，还要给边界。</p></blockquote>`,10)])])}const d=n(l,[["render",i]]);export{u as __pageData,d as default};
