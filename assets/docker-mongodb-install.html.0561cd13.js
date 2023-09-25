import{_ as t}from"./plugin-vue_export-helper.21dcd24c.js";import{o as e,c as n,e as a}from"./app.879def1e.js";const d={},o=a(`<h2 id="\u5B89\u88C5-mongo-\u955C\u50CF" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-mongo-\u955C\u50CF" aria-hidden="true">#</a> \u5B89\u88C5 mongo \u955C\u50CF</h2><p>\u53EF\u4EE5\u641C\u7D22\u4E00\u4E0B\u6709\u4EC0\u4E48\u9002\u5408\u4F60\u7684\u7248\u672C\u7684\u6211\u8FD9\u91CC\u4E0B\u7684\u662F<kbd>4.4.7</kbd></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> search mongo
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> pull mongo:4.4.7
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="\u914D\u7F6E\u672C\u5730\u5377" tabindex="-1"><a class="header-anchor" href="#\u914D\u7F6E\u672C\u5730\u5377" aria-hidden="true">#</a> \u914D\u7F6E\u672C\u5730\u5377</h2><p>\u5728\u4F60\u4EEC\u5408\u9002\u7684\u76EE\u5F55\u65B0\u5EFA\u5BF9\u5E94\u7684\u8FDB\u884C\u6620\u5C04\u7684\u76EE\u5F55\uFF0C\u6211\u662F\u5728\u7528\u6237\u76EE\u5F55\u4E0B\u65B0\u5EFA\u4E86\u4E00\u4E2A<code>mydata/mongo</code>\u6587\u4EF6\u5939\uFF0C\u7528\u4E8E\u5B58\u50A8\u6620\u5C04\u7684\u4E00\u4E9B\u76F8\u5173\u7684\u6587\u4EF6\u3002</p><p>\u9700\u8981\u5728\u76EE\u5F55\u4E0B\u65B0\u5EFA\u4E00\u4E2A\u914D\u7F6E\u6587\u4EF6\uFF1A<code>mongod.conf</code></p><div class="language-conf ext-conf line-numbers-mode"><pre class="language-conf"><code>net:
   port: 27017
   bindIp: &quot;0.0.0.0&quot;

storage:
   dbPath: &quot;/data/db&quot;

security:
   authorization: enabled

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="custom-container tip"><p class="custom-container-title">\u63D0\u793A</p><p>MacOS \u65E0\u6CD5\u4F7F\u7528<code>root</code>\u76EE\u5F55\uFF0C\u6240\u4EE5\u6211\u4EEC\u9700\u8981\u6362\u6210\u5176\u4ED6\u7684\u76EE\u5F55\uFF0C\u522B\u7684\u7CFB\u7EDF\u7684\u5C31\u7B97\u4E86\u3002</p></div><h2 id="\u521B\u5EFA\u5BB9\u5668\u8FD0\u884C" tabindex="-1"><a class="header-anchor" href="#\u521B\u5EFA\u5BB9\u5668\u8FD0\u884C" aria-hidden="true">#</a> \u521B\u5EFA\u5BB9\u5668\u8FD0\u884C</h2><blockquote><p>\u521B\u5EFA\u5BB9\u5668\uFF0C\u4E3A MongoDB \u5206\u914D 500M \u5185\u5B58</p></blockquote><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">docker</span> run -it -d --name mongo -p <span class="token number">27017</span>:27017 <span class="token punctuation">\\</span>
-v /Users/yourname/mydata/mongo:/etc/mongo -m 500m <span class="token punctuation">\\</span>
-e <span class="token assign-left variable">MONGO_INITDB_ROOT_USERNAME</span><span class="token operator">=</span>admin <span class="token punctuation">\\</span>
-e <span class="token assign-left variable">MONGO_INITDB_ROOT_PASSWORD</span><span class="token operator">=</span>admin <span class="token punctuation">\\</span>
-e <span class="token assign-left variable">TZ</span><span class="token operator">=</span>Asia/Shanghai <span class="token punctuation">\\</span>
mongo:4.4.7 --config /etc/mongo/mongod.conf

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>MONGO_INITDB_ROOT_USERNAME: \u8BBE\u7F6E\u7528\u6237\u540D</li><li>MONGO_INITDB_ROOT_PASSWORD: \u8BBE\u7F6E\u5BC6\u7801</li></ul><h2 id="\u672C\u5730\u8FDE\u63A5\u6D4B\u8BD5" tabindex="-1"><a class="header-anchor" href="#\u672C\u5730\u8FDE\u63A5\u6D4B\u8BD5" aria-hidden="true">#</a> \u672C\u5730\u8FDE\u63A5\u6D4B\u8BD5</h2><blockquote><p>\u4F7F\u7528 navicate \u8FDB\u884C\u8FDE\u63A5\u6D4B\u8BD5</p></blockquote><div class="custom-container warning"><p class="custom-container-title">\u6CE8\u610F\u4E3B\u673A\u540D</p><p>\u5148\u524D\u6211\u9ED8\u8BA4\u662F<code>localhost</code>\uFF0C\u51FA\u73B0\u9519\u8BEF\uFF0C\u540E\u6765\u4E5F\u6362\u4E86\u6211\u672C\u673A\u7684<code>ip</code>\u5730\u5740\u8FDB\u884C\u6D4B\u8BD5\uFF0C\u8C01\u77E5\u9053\u6700\u540E\u76F4\u63A5<code>127.0.0.1</code>\u5C31\u53EF\u4EE5\u3002</p></div><h2 id="mongo-\u8BED\u6CD5" tabindex="-1"><a class="header-anchor" href="#mongo-\u8BED\u6CD5" aria-hidden="true">#</a> Mongo \u8BED\u6CD5</h2><blockquote><p>MySQL \u548C Mongo \u7684\u5BF9\u6BD4</p></blockquote><table><thead><tr><th>SQL</th><th>Mongo</th></tr></thead><tbody><tr><td>\u8868 Table</td><td>\u96C6\u5408 Collection</td></tr><tr><td>\u884C Row</td><td>\u6587\u6863 Document</td></tr><tr><td>\u5217 Col</td><td>\u5B57\u6BB5 Field</td></tr><tr><td>\u4E3B\u952E Primary Key</td><td>\u5BF9\u8C61 ID ObjectId</td></tr></tbody></table><blockquote><p>\u6570\u636E\u5E93\u64CD\u4F5C</p></blockquote><table><thead><tr><th style="text-align:center;">\u521B\u5EFA\u6570\u636E\u5E93</th><th style="text-align:center;">Use demo</th></tr></thead><tbody><tr><td style="text-align:center;">\u67E5\u770B\u6570\u636E\u5E93</td><td style="text-align:center;">show dbs</td></tr><tr><td style="text-align:center;">\u5220\u9664\u6570\u636E\u5E93</td><td style="text-align:center;">db.dropDatabase()</td></tr></tbody></table><blockquote><p>\u96C6\u5408\u64CD\u4F5C</p></blockquote><table><thead><tr><th>\u521B\u5EFA\u96C6\u5408</th><th>db.createCollection(name)</th></tr></thead><tbody><tr><td>\u67E5\u770B\u96C6\u5408</td><td>show collections</td></tr><tr><td>\u5220\u9664\u96C6\u5408</td><td>db.collection.drop()</td></tr></tbody></table><blockquote><p>\u6587\u6863\u64CD\u4F5C</p></blockquote><table><thead><tr><th>\u521B\u5EFA\u6587\u6863</th><th>db.collection.insertOne({}) db.collection.insertMany([])</th></tr></thead><tbody><tr><td>\u67E5\u770B\u6587\u6863</td><td>db.collections.find({})</td></tr><tr><td>\u5220\u9664\u6587\u6863</td><td>db.collection.deleteOne() db.collection.deleteMany()</td></tr><tr><td>\u66F4\u65B0\u6587\u6863</td><td>db.collection.update({}, {}, false, true)</td></tr></tbody></table><blockquote><p>\u6761\u4EF6\u64CD\u4F5C</p></blockquote><table><thead><tr><th>\u5927\u4E8E</th><th>$gt</th></tr></thead><tbody><tr><td>\u5C0F\u4E8E</td><td>$lt</td></tr><tr><td>\u5927\u4E8E\u7B49\u4E8E</td><td>$gte</td></tr><tr><td>\u5C0F\u4E8E\u7B49\u4E8E</td><td>$lte</td></tr></tbody></table>`,27),s=[o];function l(i,c){return e(),n("div",null,s)}var u=t(d,[["render",l],["__file","docker-mongodb-install.html.vue"]]);export{u as default};