import{_ as a}from"./plugin-vue_export-helper.21dcd24c.js";import{r as e,o as l,c as p,b as o,e as s}from"./app.3944c4be.js";const t={},c=s(`<h1 id="linux-\u5B89\u88C5-java-\u76F8\u5173\u4EE5\u53CA\u8FD0\u7EF4\u90E8\u7F72" tabindex="-1"><a class="header-anchor" href="#linux-\u5B89\u88C5-java-\u76F8\u5173\u4EE5\u53CA\u8FD0\u7EF4\u90E8\u7F72" aria-hidden="true">#</a> Linux \u5B89\u88C5 Java \u76F8\u5173\u4EE5\u53CA\u8FD0\u7EF4\u90E8\u7F72</h1><h2 id="\u5B89\u88C5-jdk-\u64CD\u4F5C\u6B65\u9AA4" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5-jdk-\u64CD\u4F5C\u6B65\u9AA4" aria-hidden="true">#</a> \u5B89\u88C5 JDK \u64CD\u4F5C\u6B65\u9AA4</h2><ol><li><p>\u4E0B\u8F7D\u4E00\u4E2A<code>jdk</code>\u7684<code>linux</code>\u7684<code>x86</code>\u67B6\u6784\u7684\u4E8C\u8FDB\u5236\u6587\u4EF6\u538B\u7F29\u5305</p></li><li><p>\u4E0A\u4F20\u5230<code>linux</code>\u670D\u52A1\u5668\u8FDB\u884C\u89E3\u538B\u7F29\u5230<code>/usr/local</code>\u76EE\u5F55</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">tar</span> -zxvf jdk-8u171-linux-x86.tar.gz -C /usr/local
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>\u914D\u7F6E\u73AF\u5883\u53D8\u91CF\uFF0C\u4F7F\u7528<code>vim</code>\u547D\u4EE4\u4FEE\u6539<code>/etc/profile</code>\u6587\u4EF6\uFF0C\u5728\u6587\u4EF6\u672B\u5C3E\u6DFB\u52A0\u5982\u4E0B\u914D\u7F6E\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token assign-left variable">JAVA_HOME</span><span class="token operator">=</span>/usr/local/jdk1.8.0_171
<span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token variable">$JAVA_HOME</span>/bin:<span class="token environment constant">$PATH</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>\u8BA9\u4E0A\u8FF0\u914D\u7F6E\u6587\u4EF6\u751F\u6548</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">source</span> /etc/profile
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>\u68C0\u67E5\u5B89\u88C5\u662F\u5426\u6210\u529F</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>java -version
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li></ol><h2 id="\u5B89\u88C5\u90E8\u7F72-java-\u9879\u76EE" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5\u90E8\u7F72-java-\u9879\u76EE" aria-hidden="true">#</a> \u5B89\u88C5\u90E8\u7F72 java \u9879\u76EE</h2><h3 id="\u624B\u5DE5\u90E8\u7F72" tabindex="-1"><a class="header-anchor" href="#\u624B\u5DE5\u90E8\u7F72" aria-hidden="true">#</a> \u624B\u5DE5\u90E8\u7F72</h3><p>\u5728\u5BF9\u5E94\u7684<code>java</code>\u9879\u76EE\u91CC\uFF0C\u4F7F\u7528<code>maven</code>\u7684<code>package</code>\u8FDB\u884C\u6253\u5305\uFF0C\u5C31\u4F1A\u5728<code>target</code>\u76EE\u5F55\u4E0B\u751F\u6210\u4E00\u4E2A\u5BF9\u5E94\u7684\u9879\u76EE\u540D\u79F0\u7684<code>.jar</code>\u5305\uFF0C\u6211\u4EEC\u5C06\u8FD9\u4E2A<code>jar</code>\u5305\u4E0A\u4F20\u5230<code>linux</code>\u7684<code>/usr/local/app</code>\u76EE\u5F55\u4E0B\u3002</p><p>\u5728\u5B8C\u6210<code>jdk</code>\u7684\u5B89\u88C5\u540E\uFF0C\u6211\u4EEC\u5728<code>linux</code>\u4E0A\u4F7F\u7528\u5982\u4E0B\u547D\u4EE4\u8FDB\u884C\u8FD0\u884C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>java -jar helloworld-1.0-SNAPSHOT.jar
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5C31\u7B49\u5B83\u8FD0\u884C\u8D77\u6765\uFF0C\u8FD9\u6837\u8FD0\u884C\u4E0B\uFF0C\u662F\u524D\u53F0\u8FD0\u884C\uFF0C\u800C\u4E0D\u662F\u540E\u53F0\u8FD0\u884C\u3002</p><hr><p>\u6211\u4EEC\u8FD8\u9700\u8981\u68C0\u67E5\u4E00\u4E0B\u9632\u706B\u5899\uFF0C\u786E\u4FDD\u9879\u76EE\u8FD0\u884C\u7684\u7AEF\u53E3\u662F\u5426\u5BF9\u5916\u5F00\u653E\uFF0C\u6BD4\u5982\u4E00\u822C\u90FD\u662F<code>8080</code>\u7AEF\u53E3</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>firewall-cmd --zone<span class="token operator">=</span>public --list-ports
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u67E5\u770B\u4E00\u4E0B\u662F\u5426\u5F00\u653E\uFF1B\u5982\u679C\u90FD\u5F00\u653E\u4E86\uFF0C\u5982\u679C\u662F\u865A\u62DF\u673A\uFF0C\u5C31\u4F7F\u7528\u5BF9\u5E94\u7684\u5916\u7F51 IP \u52A0\u7AEF\u53E3\u8FDB\u884C\u8BBF\u95EE\u5BF9\u5E94\u7684\u8DEF\u7531\u6765\u6D4B\u8BD5\u662F\u5426<code>OK</code>\uFF1B\u5982\u679C\u662F\u6B63\u5F0F\u670D\u52A1\u5668\uFF0C\u4E5F\u53EF\u4EE5\u62FF\u5BF9\u5E94\u7684 IP \u52A0\u7AEF\u53E3\u53BB\u68C0\u6D4B\u3002</p><hr><p><strong>\u6539\u4E3A\u540E\u53F0\u8FD0\u884C</strong>\uFF0C\u5E76\u5C06\u65E5\u5FD7\u8F93\u51FA\u5230\u65E5\u5FD7\u6587\u4EF6</p><p>\u4F7F\u7528<code>nohup</code>\u547D\u4EE4\uFF0C\u7528\u4E8E\u4E0D\u6302\u65AD\u5730\u8FD0\u884C\u6307\u5B9A\u547D\u4EE4\uFF0C\u9000\u51FA\u7EC8\u7AEF\u4E0D\u4F1A\u5F71\u54CD\u7A0B\u5E8F\u7684\u8FD0\u884C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">nohup</span> java -jar \u5DE5\u7A0B.jar <span class="token operator">&amp;&gt;</span> hello.log <span class="token operator">&amp;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u540E\u53F0\u8FD0\u884C\u547D\u4EE4\u5E76\u5C06\u65E5\u5FD7\u8F93\u51FA\u5230<code>hello.log</code>\u6587\u4EF6\uFF1B\u53EF\u4EE5\u518D\u6B21\u4F7F\u7528 IP \u52A0\u7AEF\u53E3\u7684\u65B9\u5F0F\u8FDB\u884C\u8BBF\u95EE\u6D4B\u8BD5\u3002</p><hr><p><strong>\u505C\u6B62\u670D\u52A1\uFF1A\u6211\u4EEC\u9700\u8981\u627E\u5230\u8BE5\u8FD0\u884C\u7684\u8FDB\u7A0B\u7136\u540E\u5C06\u8BE5\u8FDB\u7A0B\u6740\u6389\u5373\u53EF</strong></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">ps</span> -ef <span class="token operator">|</span> <span class="token function">grep</span> java -jar
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u627E\u5230\u5BF9\u5E94\u7684\u8FDB\u7A0B ID\uFF0C\u7136\u540E\u4F7F\u7528<code>kill -9 \u8FDB\u7A0B\u53F7</code>\u5373\u53EF\u3002</p><h3 id="\u901A\u8FC7-shell-\u811A\u672C\u81EA\u52A8\u90E8\u7F72\u9879\u76EE" tabindex="-1"><a class="header-anchor" href="#\u901A\u8FC7-shell-\u811A\u672C\u81EA\u52A8\u90E8\u7F72\u9879\u76EE" aria-hidden="true">#</a> \u901A\u8FC7 shell \u811A\u672C\u81EA\u52A8\u90E8\u7F72\u9879\u76EE</h3><p>\u64CD\u4F5C\u6B65\u9AA4\uFF1A</p><ol><li>\u5728<code>linux</code>\u4E2D\u5B89\u88C5<code>git</code></li><li>\u5728<code>linux</code>\u4E2D\u5B89\u88C5<code>maven</code></li><li>\u7F16\u5199<code>Shell</code>\u811A\u672C\u3010\u62C9\u53D6\u4EE3\u7801\u3001\u7F16\u8BD1\u3001\u6253\u5305\u3001\u542F\u52A8\u3011</li><li>\u4E3A\u7528\u6237\u6388\u4E88\u6267\u884C<code>Shell</code>\u811A\u672C\u7684\u6743\u9650</li><li>\u6267\u884C<code>Shell</code>\u811A\u672C</li></ol>`,25),i=s(`<hr><p>\u5728<code>linux</code>\u4E2D\u5B89\u88C5<code>git</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>yum list <span class="token function">git</span> <span class="token comment"># \u5217\u51FAgit\u5B89\u88C5\u5305</span>
yum <span class="token function">install</span> <span class="token function">git</span> <span class="token comment"># \u5728\u7EBF\u5B89\u88C5git</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><hr><p>\u4F7F\u7528<code>git</code>\u514B\u9686\u8FDC\u7A0B\u4ED3\u5E93\u7684\u4EE3\u7801</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /usr/local
<span class="token function">git</span> clone xxxx.git
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><hr><p>\u5C06\u81EA\u5DF1\u4E0B\u8F7D\u7684<code>maven</code>\u7684<code>linux</code>\u7248\u4E0A\u4F20\u5230\u670D\u52A1\u5668\u5E76\u5B89\u88C5</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">tar</span> -zxvf apache-maven-3.6.3-bin.tar.gz -C /usr/local
<span class="token function">vim</span> /etc/profile

<span class="token comment"># \u52A0\u5165\u4E00\u4E0B\u5185\u5BB9</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">MAVEN_HOME</span><span class="token operator">=</span>/usr/local/apache-maven-3.6.3
<span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token variable">$JAVA_HOME</span>/bin:<span class="token variable">$MAVEN_HOME</span>/bin:<span class="token environment constant">$PATH</span>

<span class="token comment"># \u4F7F\u4E4B\u7ACB\u9A6C\u751F\u6548</span>
<span class="token builtin class-name">source</span> /etc/profile
<span class="token comment"># \u68C0\u6D4B</span>
mvn -version

<span class="token comment"># \u4FEE\u6539maven\u7684\u914D\u7F6E\u6587\u4EF6</span>
<span class="token function">vim</span> /usr/local/apache-maven-3.6.3/conf/settings.xml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-xml ext-xml line-numbers-mode"><pre class="language-xml"><code><span class="token prolog">&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>settings</span> <span class="token attr-name">xmlns</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>http://maven.apache.org/SETTINGS/1.0.0<span class="token punctuation">&quot;</span></span>
          <span class="token attr-name"><span class="token namespace">xmlns:</span>xsi</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>http://www.w3.org/2001/XMLSchema-instance<span class="token punctuation">&quot;</span></span>
          <span class="token attr-name"><span class="token namespace">xsi:</span>schemaLocation</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>mirrors</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>mirror</span><span class="token punctuation">&gt;</span></span>
            <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>id</span><span class="token punctuation">&gt;</span></span>alimaven<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>id</span><span class="token punctuation">&gt;</span></span>
            <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>mirrorOf</span><span class="token punctuation">&gt;</span></span>*<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>mirrorOf</span><span class="token punctuation">&gt;</span></span>
            <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>name</span><span class="token punctuation">&gt;</span></span>aliyun maven<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>name</span><span class="token punctuation">&gt;</span></span>
            <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>url</span><span class="token punctuation">&gt;</span></span>http://maven.aliyun.com/repository/public<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>url</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>mirror</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>mirrors</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>settings</span><span class="token punctuation">&gt;</span></span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><p><code>shell</code>\u811A\u672C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token shebang important">#!/bin/sh</span>
<span class="token builtin class-name">echo</span> <span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">=</span>
<span class="token builtin class-name">echo</span>  \u81EA\u52A8\u5316\u90E8\u7F72\u811A\u672C\u542F\u52A8
<span class="token builtin class-name">echo</span> <span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">==</span><span class="token operator">=</span>

<span class="token builtin class-name">echo</span> \u505C\u6B62\u539F\u6765\u8FD0\u884C\u4E2D\u7684\u5DE5\u7A0B
<span class="token assign-left variable">APP_NAME</span><span class="token operator">=</span>helloworld

<span class="token assign-left variable">tpid</span><span class="token operator">=</span><span class="token variable"><span class="token variable">\`</span><span class="token function">ps</span> -ef<span class="token operator">|</span><span class="token function">grep</span> $APP_NAME<span class="token operator">|</span><span class="token function">grep</span> -v <span class="token function">grep</span><span class="token operator">|</span><span class="token function">grep</span> -v <span class="token function">kill</span><span class="token operator">|</span><span class="token function">awk</span> <span class="token string">&#39;{print $2}&#39;</span><span class="token variable">\`</span></span>
<span class="token keyword">if</span> <span class="token punctuation">[</span> <span class="token variable">\${tpid}</span> <span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&#39;Stop Process...&#39;</span>
    <span class="token function">kill</span> -15 <span class="token variable">$tpid</span>
<span class="token keyword">fi</span>
<span class="token function">sleep</span> <span class="token number">2</span>
<span class="token assign-left variable">tpid</span><span class="token operator">=</span><span class="token variable"><span class="token variable">\`</span><span class="token function">ps</span> -ef<span class="token operator">|</span><span class="token function">grep</span> $APP_NAME<span class="token operator">|</span><span class="token function">grep</span> -v <span class="token function">grep</span><span class="token operator">|</span><span class="token function">grep</span> -v <span class="token function">kill</span><span class="token operator">|</span><span class="token function">awk</span> <span class="token string">&#39;{print $2}&#39;</span><span class="token variable">\`</span></span>
<span class="token keyword">if</span> <span class="token punctuation">[</span> <span class="token variable">\${tpid}</span> <span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&#39;Kill Process!&#39;</span>
    <span class="token function">kill</span> -9 <span class="token variable">$tpid</span>
<span class="token keyword">else</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&#39;Stop Success!&#39;</span>
<span class="token keyword">fi</span>

<span class="token builtin class-name">echo</span> \u51C6\u5907\u4ECEGit\u4ED3\u5E93\u62C9\u53D6\u6700\u65B0\u4EE3\u7801
<span class="token builtin class-name">cd</span> /usr/local/helloworld

<span class="token builtin class-name">echo</span> \u5F00\u59CB\u4ECEGit\u4ED3\u5E93\u62C9\u53D6\u6700\u65B0\u4EE3\u7801
<span class="token function">git</span> pull
<span class="token builtin class-name">echo</span> \u4EE3\u7801\u62C9\u53D6\u5B8C\u6210

<span class="token builtin class-name">echo</span> \u5F00\u59CB\u6253\u5305
<span class="token assign-left variable">output</span><span class="token operator">=</span><span class="token variable"><span class="token variable">\`</span>mvn clean package -Dmaven.test.skip<span class="token operator">=</span>true<span class="token variable">\`</span></span>

<span class="token builtin class-name">cd</span> target

<span class="token builtin class-name">echo</span> \u542F\u52A8\u9879\u76EE
<span class="token function">nohup</span> java -jar helloworld-1.0-SNAPSHOT.jar <span class="token operator">&amp;&gt;</span> helloworld.log <span class="token operator">&amp;</span>
<span class="token builtin class-name">echo</span> \u9879\u76EE\u542F\u52A8\u5B8C\u6210

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u524D\u63D0\u4F60\u5F97\u5148<code>clone</code>\u4E00\u904D\uFF0C\u5426\u5219\u8FD9\u91CC<code>git pull</code>\u662F\u62C9\u4E0D\u5230\u4EE3\u7801\u7684\u3002</p><p><code>APP_NAME</code>\uFF1A\u53EF\u6539\u9879</p><p><code>nohup java -jar helloworld-1.0-SNAPSHOT.jar &amp;&gt; helloworld.log &amp;</code>\u8FD9\u91CC\u7684\u751F\u6210\u7684<code>jar</code>\u540D\u79F0\u4E5F\u662F\u53EF\u6539\u9879\u3002</p><p>\u521A\u5F04\u4E0A\u53BB\u7684\u811A\u672C\uFF0C\u4E0D\u4E00\u5B9A\u6709\u6267\u884C\u6743\u9650\uFF0C\u6240\u4EE5\u8FD8\u5F97\u4E3A\u5B83\u8D4B\u4E88\u6267\u884C\u6743\u9650\u3002</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">chmod</span> +x xxx.sh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6216\u8005\u76F4\u63A5\u7ED9\u5168\u90E8\u6743\u9650</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">chmod</span> <span class="token number">777</span> xxx.sh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6267\u884C\u811A\u672C</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>./xxx.sh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7B49\u5230\u5B83\u7684\u8F93\u51FA\u5B8C\u6210\u4E4B\u540E\uFF0C\u6211\u4EEC\u8FD8\u9700\u8981\u4F7F\u7528 IP \u52A0\u7AEF\u53E3\u7684\u65B9\u5F0F\u53BB\u68C0\u6D4B\u662F\u5426\u6210\u529F\u3002\u3010\u7B2C\u4E00\u6B21\u6267\u884C\u7684\u65F6\u5019\uFF0C\u9700\u8981\u5B89\u88C5\u4E0B\u8F7D\u4E00\u4E9B<code>jar</code>\u5305\u53EF\u80FD\u4F1A\u6BD4\u8F83\u6162\u3011\u3002</p><p>\u7136\u540E\u518D\u8BD5\u7740\u4FEE\u6539\u4E00\u4E0B\u7A0B\u5E8F\uFF0C\u7136\u540E\u63A8\u9001\u5230<code>git</code>\u8FDC\u7A0B\u4ED3\u5E93\uFF0C\u518D\u6B21\u6267\u884C<code>shell</code>\u811A\u672C\u68C0\u67E5\u662F\u5426\u4FEE\u6539\u6210\u529F\u3002</p>`,24);function r(d,u){const n=e("FlowChart");return l(),p("div",null,[c,o(n,{id:"flowchart-64a570a6",code:"startID%3D%3Estart%3A%20Git%E4%BB%93%E5%BA%93%0AconditionID%3D%3Econdition%3A%20pull%2Fpush%0AsubroutineID%3D%3Esubroutine%3A%20%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83push%E4%BB%A3%E7%A0%81%0AendID%3D%3Eend%3A%20Linux%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%8B%89%E5%8F%96%E4%BB%A3%E7%A0%81%E8%BF%9B%E8%A1%8C%E7%BC%96%E8%AF%91%E6%89%93%E5%8C%85%E5%90%AF%E5%8A%A8%0A%0AstartID-%3EconditionID%0AconditionID(no)-%3EsubroutineID%0AconditionID(yes)-%3EendID%0A",preset:"vue"}),i])}var m=a(t,[["render",r],["__file","linux-install-export.html.vue"]]);export{m as default};
