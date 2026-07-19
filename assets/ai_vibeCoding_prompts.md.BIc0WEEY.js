import{bV as n,aL as a,u as p,G as e}from"./chunks/framework.BfzMay2U.js";const u=JSON.parse('{"title":"一些提示词","description":"","frontmatter":{"title":"一些提示词","date":"2026-06-23 23:36"},"headers":[],"relativePath":"ai/vibeCoding/prompts.md","filePath":"ai/vibeCoding/prompts.md"}'),l={name:"ai/vibeCoding/prompts.md"};function i(r,s,c,b,t,d){return a(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="一些vibe-coding-中发现的不错的提示词" tabindex="-1">一些vibe coding 中发现的不错的提示词 <a class="header-anchor" href="#一些vibe-coding-中发现的不错的提示词" aria-label="Permalink to &quot;一些vibe coding 中发现的不错的提示词&quot;">​</a></h1><h2 id="先让-ai-根据需求输出一个对项目的理解" tabindex="-1">先让 AI 根据需求输出一个对项目的理解 <a class="header-anchor" href="#先让-ai-根据需求输出一个对项目的理解" aria-label="Permalink to &quot;先让 AI 根据需求输出一个对项目的理解&quot;">​</a></h2><div class="language-java vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">需求</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.md 先让它阅读项目和需求文档，输出需求理解、技术方案、接口设计、数据库设计和开发拆解</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><blockquote><p>新项目启动</p></blockquote><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>你先不要开发新功能，第一步帮我把原项目在本地运行起来。</span></span>
<span class="line"><span>我的电脑已经安装了 Docker，也有一些 MySQL 的镜像。项目需要的 MySQL 和 redis 或其他服务优先使用 Docker，尽量复用已有的镜像；没有合适的镜像再下载，并为这个项目创建独立容器。</span></span>
<span class="line"><span>请阅读项目文档和配置，完成数据库初始化、SQL 导入和本地配置，然后把 Java 后端和 admin 管理后台实际启动并验证可以访问。</span></span>
<span class="line"><span>app 项目不用运行，我会自己使用 HBuilderX 运行，但是代码修改需要你做。</span></span>
<span class="line"><span>最后写一个简单的启动脚本，让我以后可以快速启动项目需要的容器、Java 后端和 admin 后台管理系统。</span></span>
<span class="line"><span>请直接实际操作，遇到报错就自己查看日志并解决。</span></span>
<span class="line"><span>完成后告诉我启动方式、访问地址、修改内容和仍然存在的问题。</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><blockquote><p>新项目扩展功能</p></blockquote><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>你先帮我把这个项目整体看一遍，重点研究商品、SKU、购物车、优惠券、积分、运费、预下单和正式订单相关的代码。</span></span>
<span class="line"><span>我准备给这个项目增加一个“购物车智能凑单”的功能。</span></span>
<span class="line"><span>现在系统是用户选好商品后，自己选择优惠券、决定是否使用积分，系统再根据商品、地址和运费计算最终价格。</span></span>
<span class="line"><span>我希望改成：系统可以主动计算当前怎么买最便宜。</span></span>
<span class="line"><span>大概需要实现这些效果：</span></span>
<span class="line"><span>1. 自动找出当前最划算的优惠券。</span></span>
<span class="line"><span>2. 告诉用户距离更大的优惠券门槛还差多少钱。</span></span>
<span class="line"><span>3. 判断距离免邮还差多少钱</span></span>
<span class="line"><span>4. 从商场中推荐合适合凑单的商品和具体的 SKU。</span></span>
<span class="line"><span>5. 展示加入推荐商品前后的实付金额。</span></span>
<span class="line"><span>6. 告诉用户这次省钱是因为优惠券、积分还是免运费。</span></span>
<span class="line"><span>7. 支持一键将推荐商品加入购物车、然后重新计算。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>这里不能只按商品价格推荐，还要考虑库存、上下架状态、会员价、全场券、商品券、分类券、积分、运费、商品重量、收货地址以及秒杀、拼团等活动能不能叠加优惠。</span></span>
<span class="line"><span>本地先不要考虑一单使用多张优惠券，也不要拆成多张订单，尽量在原有订单系统上迭代，不要推翻重写。</span></span>
<span class="line"><span>你这一步先不要写代码。</span></span>
<span class="line"><span>请先阅读项目，给我整理一份开发文档，内容包括：</span></span>
<span class="line"><span>- 现在购物车到正式下单的完整流程</span></span>
<span class="line"><span>- 现有优惠券、积分和运费是怎么计算的</span></span>
<span class="line"><span>- 这个功能涉及哪些模块和主要文件</span></span>
<span class="line"><span>- 你准备怎么实现智能凑单</span></span>
<span class="line"><span>- 后端需要新增或修改哪些接口</span></span>
<span class="line"><span>- 管理后台和用户端分别需要改什么</span></span>
<span class="line"><span>- 是否需要新增数据表或配置，并给出 SQL 设计</span></span>
<span class="line"><span>- 推荐算法准备怎么做</span></span>
<span class="line"><span>- 如何避免遍历所有的商品导致性能问题</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div>`,7)])])}const m=n(l,[["render",i]]);export{u as __pageData,m as default};
