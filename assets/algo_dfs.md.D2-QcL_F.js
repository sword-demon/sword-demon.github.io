import{bV as n,aL as a,u as p,G as e}from"./chunks/framework.BfzMay2U.js";const u=JSON.parse('{"title":"深度优先搜索（DFS）","description":"DFS 详解：从递归思维到回溯实战，TypeScript 全面实现","frontmatter":{"title":"深度优先搜索（DFS）","description":"DFS 详解：从递归思维到回溯实战，TypeScript 全面实现","date":"2026-06-05T09:00:00.000Z","categories":["Algorithm"],"tags":["dfs","graph","tree","recursion","backtracking","interview"],"sidebarSort":37},"headers":[],"relativePath":"algo/dfs.md","filePath":"algo/dfs.md"}'),l={name:"algo/dfs.md"};function i(r,s,t,c,b,d){return a(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="深度优先搜索-depth-first-search" tabindex="-1">深度优先搜索（Depth-First Search） <a class="header-anchor" href="#深度优先搜索-depth-first-search" aria-label="Permalink to &quot;深度优先搜索（Depth-First Search）&quot;">​</a></h1><p>上一篇我们聊了 BFS——像水波纹一样一层一层往外扩散。今天来聊聊它的&quot;孪生兄弟&quot;：<strong>DFS（深度优先搜索）</strong>。</p><p>想象你在走迷宫，BFS 的策略是&quot;先把所有一步能到的地方都看一遍&quot;，而 DFS 的策略完全不同——<strong>一条路走到黑</strong>，撞墙了就退回来，换一条路继续走。听起来有点&quot;莽&quot;对吧？但这种&quot;莽&quot;的策略，在很多场景下反而是最优解。</p><h2 id="为什么需要-dfs" tabindex="-1">为什么需要 DFS？ <a class="header-anchor" href="#为什么需要-dfs" aria-label="Permalink to &quot;为什么需要 DFS？&quot;">​</a></h2><p>DFS 和 BFS 解决的问题有时候很像，但各有擅长：</p><table tabindex="0"><thead><tr><th>场景</th><th>BFS</th><th>DFS</th></tr></thead><tbody><tr><td>无权图最短路径</td><td>✅ 天然保证</td><td>❌ 不保证</td></tr><tr><td>遍历所有路径/组合</td><td>❌ 空间爆炸</td><td>✅ 递归天然回溯</td></tr><tr><td>树的前/中/后序遍历</td><td>❌ 不自然</td><td>✅ 递归天然适配</td></tr><tr><td>判断图连通性</td><td>✅ 可以</td><td>✅ 可以</td></tr><tr><td>拓扑排序</td><td>✅ Kahn 算法</td><td>✅ DFS 实现更直观</td></tr><tr><td>迷宫求解（有无解）</td><td>✅ 可以</td><td>✅ 更省内存</td></tr></tbody></table><p>简单记：<strong>求最短路用 BFS，遍历所有可能用 DFS</strong>。</p><h2 id="原理拆解" tabindex="-1">原理拆解 <a class="header-anchor" href="#原理拆解" aria-label="Permalink to &quot;原理拆解&quot;">​</a></h2><h3 id="_1-dfs-的核心-栈-stack" tabindex="-1">1. DFS 的核心：栈（Stack） <a class="header-anchor" href="#_1-dfs-的核心-栈-stack" aria-label="Permalink to &quot;1. DFS 的核心：栈（Stack）&quot;">​</a></h3><p>BFS 用队列（先进先出），DFS 用栈（先进后出）。递归调用本身就是一个隐式的函数调用栈。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>DFS 遍历过程（以二叉树为例）：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        1</span></span>
<span class="line"><span>       / \\</span></span>
<span class="line"><span>      2   3</span></span>
<span class="line"><span>     / \\   \\</span></span>
<span class="line"><span>    4   5   6</span></span>
<span class="line"><span></span></span>
<span class="line"><span>DFS 前序遍历：1 → 2 → 4 → 5 → 3 → 6</span></span>
<span class="line"><span></span></span>
<span class="line"><span>执行过程（调用栈变化）：</span></span>
<span class="line"><span>┌─ dfs(1)           # 访问 1</span></span>
<span class="line"><span>│  ├─ dfs(2)        # 访问 2</span></span>
<span class="line"><span>│  │  ├─ dfs(4)     # 访问 4，左空右空，返回</span></span>
<span class="line"><span>│  │  └─ dfs(5)     # 访问 5，左空右空，返回</span></span>
<span class="line"><span>│  └─ dfs(3)        # 访问 3</span></span>
<span class="line"><span>│     └─ dfs(6)     # 访问 6，左空右空，返回</span></span>
<span class="line"><span>└─ 栈空，结束</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h3 id="_2-递归版-vs-迭代版" tabindex="-1">2. 递归版 vs 迭代版 <a class="header-anchor" href="#_2-递归版-vs-迭代版" aria-label="Permalink to &quot;2. 递归版 vs 迭代版&quot;">​</a></h3><p>DFS 有两种写法：</p><ul><li><strong>递归版</strong>：代码简洁，直觉自然，但可能栈溢出</li><li><strong>迭代版</strong>：手动维护栈，控制更精细</li></ul><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>递归版（伪代码）：</span></span>
<span class="line"><span>function dfs(node):</span></span>
<span class="line"><span>    if node is null: return</span></span>
<span class="line"><span>    visit(node)              ← 先处理当前节点（前序）</span></span>
<span class="line"><span>    for each neighbor of node:</span></span>
<span class="line"><span>        if neighbor not visited:</span></span>
<span class="line"><span>            dfs(neighbor)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>迭代版（伪代码）：</span></span>
<span class="line"><span>function dfs(start):</span></span>
<span class="line"><span>    stack = [start]</span></span>
<span class="line"><span>    while stack is not empty:</span></span>
<span class="line"><span>        node = stack.pop()</span></span>
<span class="line"><span>        if node not visited:</span></span>
<span class="line"><span>            visit(node)</span></span>
<span class="line"><span>            for each neighbor of node:</span></span>
<span class="line"><span>                stack.push(neighbor)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>注意：迭代版压栈顺序和递归版的遍历顺序可能不同，因为栈是后进先出。</p><h3 id="_3-回溯-dfs-的灵魂" tabindex="-1">3. 回溯：DFS 的灵魂 <a class="header-anchor" href="#_3-回溯-dfs-的灵魂" aria-label="Permalink to &quot;3. 回溯：DFS 的灵魂&quot;">​</a></h3><p>DFS 最强大的应用是<strong>回溯算法</strong>——在搜索过程中&quot;走一步看一步&quot;，发现走不通就&quot;退一步换条路&quot;。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>经典回溯框架：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function backtrack(路径, 选择列表):</span></span>
<span class="line"><span>    if 满足结束条件:</span></span>
<span class="line"><span>        收集结果</span></span>
<span class="line"><span>        return</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    for each 选择 in 选择列表:</span></span>
<span class="line"><span>        做选择           ← 把选择加入路径</span></span>
<span class="line"><span>        backtrack(路径, 选择列表)  ← 递归进入下一层</span></span>
<span class="line"><span>        撤销选择         ← 回溯，把选择从路径中移除</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>以 [1, 2, 3] 的全排列为例：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                    []</span></span>
<span class="line"><span>              /      |      \\</span></span>
<span class="line"><span>            [1]     [2]     [3]</span></span>
<span class="line"><span>           /   \\   /   \\   /   \\</span></span>
<span class="line"><span>        [1,2] [1,3] [2,1] [2,3] [3,1] [3,2]</span></span>
<span class="line"><span>         |     |     |     |     |     |</span></span>
<span class="line"><span>      [1,2,3][1,3,2][2,1,3][2,3,1][3,1,2][3,2,1]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>每一层做选择 → 递归 → 回溯 → 换一个选择继续</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div>`,20)])])}const m=n(l,[["render",i]]);export{u as __pageData,m as default};
