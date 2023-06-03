import{_ as s}from"./plugin-vue_export-helper.21dcd24c.js";import{o as n,c as e,e as i}from"./app.23541a26.js";const a={},l=i(`<h2 id="\u76EE\u5F55" tabindex="-1"><a class="header-anchor" href="#\u76EE\u5F55" aria-hidden="true">#</a> \u76EE\u5F55</h2><ul><li><p><a href="#%E4%B8%8B%E8%BD%BDlinux%E7%9A%84mysql%E5%8C%85">\u4E0B\u8F7D Linux \u7684 MySQL \u5305</a></p></li><li><p><a href="#%E5%AE%89%E8%A3%85%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E7%9A%84%E5%91%BD%E4%BB%A4">\u5B89\u88C5\u4E0A\u4F20\u6587\u4EF6\u7684\u547D\u4EE4</a></p></li></ul><h1 id="linux-\u5B89\u88C5-mysql8-0" tabindex="-1"><a class="header-anchor" href="#linux-\u5B89\u88C5-mysql8-0" aria-hidden="true">#</a> Linux \u5B89\u88C5 MySQL8.0</h1><h2 id="\u4E0B\u8F7D-linux-\u7684-mysql-\u5305" tabindex="-1"><a class="header-anchor" href="#\u4E0B\u8F7D-linux-\u7684-mysql-\u5305" aria-hidden="true">#</a> \u4E0B\u8F7D Linux \u7684 MySQL \u5305</h2><blockquote><p>\u53EF\u4EE5\u5148\u5728\u81EA\u5DF1\u7684 windows \u6216\u8005 mac \u91CC\u4E0B\u8F7D\u597D\uFF0C\u6216\u8005\u4F60\u672C\u8EAB\u5C31\u662F Linux\uFF0C\u4E0B\u8F7D\u597D\u5BF9\u5E94\u7684\u5305\u5373\u53EF</p></blockquote><p>\u6211\u8FD9\u91CC\u662F<code>mysql-8.0.19-el7-x86_64.tar.gz</code></p><h2 id="\u5B89\u88C5\u4E0A\u4F20\u6587\u4EF6\u7684\u547D\u4EE4" tabindex="-1"><a class="header-anchor" href="#\u5B89\u88C5\u4E0A\u4F20\u6587\u4EF6\u7684\u547D\u4EE4" aria-hidden="true">#</a> \u5B89\u88C5\u4E0A\u4F20\u6587\u4EF6\u7684\u547D\u4EE4</h2><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>yum <span class="token function">install</span> -y lrzsz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li><p>rz\uFF1A\u4E0A\u4F20</p></li><li><p>sz\uFF1A\u4E0B\u8F7D</p></li></ul><p>\u6211\u4EEC\u5148\u5728 Linux \u4E0B\u64CD\u4F5C\u5982\u4E0B\u547D\u4EE4</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /usr/local/src
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6211\u4EEC\u628A\u6587\u4EF6\u4E0A\u4F20\u5230\u6B64\u76EE\u5F55\u4E0B</p><blockquote><p>\u6211\u4EEC\u53EF\u4EE5\u4F7F\u7528<code>rz</code>\u547D\u4EE4\uFF0C\u5728 windows \u6253\u5F00\u6587\u4EF6\u4E0A\u4F20\u7684\u7A97\u53E3\u9009\u62E9\u5BF9\u5E94\u4E0B\u8F7D\u597D\u7684\u6587\u4EF6\u4E0A\u4F20\u5373\u53EF</p></blockquote><p>\u5BF9\u538B\u7F29\u6587\u4EF6\u8FDB\u884C\u89E3\u538B</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">tar</span> zxvf mysql-8.0.19-el7-x86_64.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5982\u679C\u6B64\u65F6\u4E0D\u662F<code>root</code>\u7528\u6237\u7684\u8BDD\uFF0C\u8BB0\u5F97<code>su</code>\u5207\u6362\u5230<code>root</code>\u7528\u6237</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">mv</span> mysql-8.0.19-el7-x86_64 /usr/local/mysql
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u6DFB\u52A0<code>mysql</code>\u7528\u6237</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">useradd</span> mysql -s /sbin/nologin
<span class="token comment"># \u8D4B\u4E88\u6743\u9650</span>
<span class="token function">chown</span> -R mysql.mysql /usr/local/mysql/
<span class="token comment"># \u8D4B\u4E88\u53EF\u6267\u884C\u6743\u9650</span>
<span class="token function">chmod</span> +w /usr/local/mysql
<span class="token comment"># \u521B\u5EFAtmp\u548Cdata\u76EE\u5F55</span>
<span class="token function">mkdir</span> -p /usr/local/mysql/tmp
<span class="token function">mkdir</span> -p /usr/local/mysql/data
<span class="token comment"># \u66F4\u6539\u6240\u5C5E\u7528\u6237</span>
<span class="token function">chown</span> -R mysql.mysql /usrl/local/mysql

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u521D\u59CB\u5316\u6570\u636E\u5E93\u548C\u8BBE\u7F6E\u521D\u59CB\u5BC6\u7801</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>/usr/local/mysql/bin/mysqld --initialize --user<span class="token operator">=</span>mysql --basedir<span class="token operator">=</span>/usr/local/mysql/ --datadir<span class="token operator">=</span>/usr/local/mysql/data/

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u4F60\u51FA\u73B0\u4EE5\u4E0B\u95EE\u9898:</p><blockquote><p>/usr/local/mysql/bin/mysqld: error while loading shared libraries: libaio.so.1: cannot open shared object file: No such file or directory</p></blockquote><p>\u610F\u601D\u5C31\u662F\u7F3A\u5C11<code>libaio</code>\u8FD9\u4E2A\u5E93\uFF0C\u5B89\u88C5\u4E00\u4E0B\u5373\u53EF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>yum <span class="token function">install</span> libaio*
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u5982\u679C\u662F<code>ubuntu</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">sudo</span> <span class="token function">apt-get</span> <span class="token function">install</span> libaio-dev
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u7136\u540E\u7EE7\u7EED\u6267\u884C\u4E0A\u9762\u7684\u521D\u59CB\u5316\u547D\u4EE4\u5373\u53EF</p><p>\u5982\u679C\u51FA\u73B0\u4EE5\u4E0B\u5185\u5BB9</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token number">2022</span>-08-06T14:21:00.039371Z <span class="token number">5</span> <span class="token punctuation">[</span>Note<span class="token punctuation">]</span> <span class="token punctuation">[</span>MY-010454<span class="token punctuation">]</span> <span class="token punctuation">[</span>Server<span class="token punctuation">]</span> A temporary password is generated <span class="token keyword">for</span> root@localhost: <span class="token operator">!</span>dblgu08h6uG

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u4E2A<code>!dblgu08h6uG</code>\uFF1A\u5C31\u662F\u5B83\u9ED8\u8BA4\u7ED9\u4F60\u521D\u59CB\u5316\u7684\u5BC6\u7801\uFF0C\u6211\u4EEC\u9700\u8981\u5148\u8BB0\u4E0B\u6765\uFF0C\u8FD9\u662F\u4E34\u65F6\u5BC6\u7801\uFF0C\u4E0D\u7136\u4F60\u9A6C\u4E0A mysql \u8FDB\u4E0D\u53BB\u3002</p><p>\u7136\u540E\u7F16\u8F91<code>my.cnf</code>\u6587\u4EF6</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">vim</span> /etc/my.cnf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>[mysqld]
user = mysql
port = 3306
server_id = 1
basedir = /usr/local/mysql/
datadir=/usr/local/mysql/data/
mysqlx_port = 33060
mysqlx_socket = /usr/local/mysql/mysql/mysql.sock
socket=/usr/local/mysql/tmp/mysql.sock
pid-file=/usr/local/mysql/tmp/mysqld.pid
log-error = error.log
log-bin   = bin.log
relay-log = relay.log
#\u670D\u52A1\u5668\u7F16\u7801
character-set-server  = utf8
collation-server = utf8_general_ci
init_connect     = &#39;SET NAMES utf8&#39;
log_timestamps   = SYSTEM
#\u8EAB\u4EFD\u9A8C\u8BC1\u63D2\u4EF6
default-authentication-plugin = mysql_native_password
#\u9ED8\u8BA4\u5B58\u50A8\u5F15\u64CE
default-storage-engine = INNODB
#\u5F00\u542F\u6162\u67E5\u8BE2\u65E5\u5FD7
slow_query_log = 1
slow_query_log_file = /usr/local/mysql/txt/slow_query_log.txt
long_query_time = 3
#\u5173\u95EDmysql8\u7684\u4E25\u683C\u6A21\u5F0F
sql_mode = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
# Settings user and group are ignored when systemd is used.
# If you need to run mysqld under a different user or group,
# customize your systemd unit file for mariadb according to the
# instructions in http://fedoraproject.org/wiki/Systemd

[mysqld_safe]
log-error=/usr/local/mysql/tmp/mysqld.log
pid-file=/usr/local/mysql/tmp/mysqld.pid

[client]
socket=/usr/local/mysql/tmp/mysql.sock
default-character-set=utf8
#
# include all files from the config directory
#
!includedir /etc/my.cnf.d


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>mysql</code>\u7684\u914D\u7F6E\u7684\u4E00\u4E9B\u6027\u80FD\u8C03\u4F18</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>#\u6027\u80FD\u8C03\u4F11
#\u7981\u7528dns\u89E3\u6790
skip-name-resolve
wait_timeout\u9488\u5BF9\u975E\u4EA4\u4E92\u5F0F\u8FDE\u63A5 \uFF0C\u901A\u8FC7jdbc\u8FDE\u63A5\u6570\u636E\u5E93\u662F\u975E\u4EA4\u4E92\u5F0F\u8FDE\u63A5\u3002
\u6307\u5B9A\u4E00\u4E2A\u8BF7\u6C42\u7684\u6700\u5927\u8FDE\u63A5\u65F6\u95F4\uFF0C\u5BF9\u4E8E4GB\u5DE6\u53F3\u7684\u5185\u5B58\u670D\u52A1\u5668\u6765\u8BF4\uFF0C\u53EF\u4EE5\u5C06\u5176\u8BBE\u7F6E\u4E3A5-10\u3002
wait_timeout = 10
\u9488\u5BF9\u4EA4\u4E92\u5F0F\u8FDE\u63A5\uFF0C\u5373\u5728mysql_real_connect()\u51FD\u6570\u4E2D\u4F7F\u7528\u4E86CLIENT_INTERACTIVE\u9009\u9879\u901A\u8FC7mysql\u5BA2\u6237\u7AEF\u8FDE\u63A5\u6570\u636E\u5E93\u662F\u4EA4\u4E92\u5F0F\u8FDE\u63A5
interactive_timeout = 2880000
\u6765\u9650\u5236\u5E76\u53D1\u7EBF\u7A0B\u7684\u6570\u91CF\uFF0C\u4E00\u65E6\u6267\u884C\u7EBF\u7A0B\u7684\u6570\u91CF\u8FBE\u5230\u8FD9\u4E2A\u9650\u5236\uFF0C\u989D\u5916\u7684\u7EBF\u7A0B\u5728\u88AB\u653E\u7F6E\u5230\u5BF9\u961F\u5217\u4E2D\u4E4B\u524D\uFF0C\u4F1A\u7761\u7720\u6570\u5FAE\u79D2
innodb_thread_concurrency=8

\u4E3A\u6BCF\u4E2Asession \u5206\u914D\u7684\u5185\u5B58\uFF0C\u5728\u4E8B\u52A1\u8FC7\u7A0B\u4E2D\u7528\u6765\u5B58\u50A8\u4E8C\u8FDB\u5236\u65E5\u5FD7\u7684\u7F13\u5B58\u3002 \u63D0\u9AD8\u8BB0\u5F55bin-log\u7684\u6548\u7387
binlog_cache_size = 256K
\u8FDE\u63A5\u7EBF\u7A0B\u7684\u4F18\u5316
thread_stack =512K
\u8FDE\u8868\u7F13\u51B2\u5927\u5C0F \u591A\u8868join
join_buffer_size = 8192K
\u7528\u6237\u53EF\u4EE5\u521B\u5EFA\u7684\u5185\u5B58\u8868(memory table)\u7684\u5927\u5C0F.\u8FD9\u4E2A\u503C\u7528\u6765\u8BA1\u7B97\u5185\u5B58\u8868\u7684\u6700\u5927\u884C\u6570\u503C
max_heap_table_size = 1024M
\u8DF3\u8FC7\u5916\u90E8\u9501\u5B9A \u591A\u8FDB\u7A0B\u6761\u4EF6\u4E0B\u4E3AMyISAM\u6570\u636E\u8868\u8FDB\u884C\u9501\u5B9A
skip-external-locking
\u63A7\u5236\u5185\u5B58\u6700\u5927\u5360\u7528
performance_schema_max_table_instances=400
\u4EE3\u8868MySQL\u53EF\u4EE5\u7F13\u5B58\u7684\u8868\u5B9A\u4E49\u7684\u6570\u91CF
table_definition_cache=400
\u53C2\u6570\u503C\u7684\u4EE3\u8868MySQL\u53EF\u4EE5\u7F13\u5B58\u7684\u6253\u5F00\u8868\u65F6\u5019\u7684\u6700\u5927\u6587\u4EF6\u63CF\u8FF0\u7B26\u3002
table_open_cache = 1024
\u6307\u5B9A\u7D22\u5F15\u7F13\u51B2\u533A\u7684\u5927\u5C0F\uFF0C\u5B83\u51B3\u5B9A\u7D22\u5F15\u5904\u7406\u7684\u901F\u5EA6\uFF0C\u5C24\u5176\u662F\u7D22\u5F15\u8BFB\u7684\u901F\u5EA6\u3002\u901A\u8FC7\u68C0\u67E5\u72B6\u6001\u503CKey_read_requests\u548CKey_reads\uFF0C\u53EF\u4EE5\u77E5\u9053key_buffer_size\u8BBE\u7F6E\u662F\u5426\u5408\u7406
key_buffer_size = 512M
mysql\u6839\u636E\u914D\u7F6E\u6587\u4EF6\u4F1A\u9650\u5236server\u63A5\u53D7\u7684\u6570\u636E\u5305\u5927\u5C0F\u3002
\u6709\u65F6\u5019\u5927\u7684\u63D2\u5165\u548C\u66F4\u65B0\u4F1A\u53D7max_allowed_packet \u53C2\u6570\u9650\u5236\uFF0C\u5BFC\u81F4\u5199\u5165\u6216\u8005\u66F4\u65B0\u5931\u8D25\u3002
max_allowed_packet = 100G
\u589E\u52A0sort_buffer_size \u6765\u52A0\u901FORDER BY \u6216\u8005GROUP BY \u64CD\u4F5C,\u4E0D\u80FD\u901A\u8FC7\u67E5\u8BE2\u6216\u8005\u7D22\u5F15\u4F18\u5316\u7684\u3002
sort_buffer_size = 2048K
\u5B98\u65B9\u5EFA\u8BAE\u4F7F\u7528mysqlpump \u901A\u4FE1\u65F6\u7F13\u5B58\u6570\u636E\u7684\u5927\u5C0F.
net_buffer_length = 8K
\u662FMySQL\u8BFB\u5165\u7F13\u51B2\u533A\u5927\u5C0F\u3002\u5BF9\u8868\u8FDB\u884C\u987A\u5E8F\u626B\u63CF\u7684\u8BF7\u6C42\u5C06\u5206\u914D\u4E00\u4E2A\u8BFB\u5165\u7F13\u51B2\u533A\uFF0CMySQL\u4F1A\u4E3A\u5B83\u5206\u914D\u4E00\u6BB5\u5185\u5B58\u7F13\u51B2\u533A\u3002
read_buffer_size = 2048K
\u662FMySQL\u7684\u968F\u673A\u8BFB\u7F13\u51B2\u533A\u5927\u5C0F\uFF0C\u5F53\u6309\u4EFB\u610F\u987A\u5E8F\u8BFB\u53D6\u884C\u65F6\uFF08\u5217\u5982\u6309\u7167\u6392\u5E8F\u987A\u5E8F\uFF09\u5C06\u5206\u914D\u4E00\u4E2A\u968F\u673A\u8BFB\u53D6\u7F13\u51B2\u533A\uFF0C\u8FDB\u884C\u6392\u5E8F\u67E5\u8BE2\u65F6\uFF0CMySQL\u4F1A\u9996\u5148\u626B\u63CF\u4E00\u904D\u8BE5\u7F13\u51B2\uFF0C\u4EE5\u907F\u514D\u78C1\u76D8\u641C\u7D22\uFF0C\u63D0\u9AD8\u67E5\u8BE2\u901F\u5EA6\uFF0C\u5982\u679C\u9700\u8981\u5927\u91CF\u6570\u636E\u53EF\u9002\u5F53\u7684\u8C03\u6574\u8BE5\u503C
read_rnd_buffer_size = 1024K
MySQL\u91CD\u5EFA\u7D22\u5F15\u65F6\u6240\u5141\u8BB8\u7684\u6700\u5927\u4E34\u65F6\u6587\u4EF6\u7684\u5927\u5C0F
myisam_max_sort_file_size=64G
MyISAM\u8868\u53D1\u751F\u53D8\u5316\u65F6\u91CD\u65B0\u6392\u5E8F\u6240\u9700\u7684\u7F13\u51B2\u3002\u4E00\u822C64M\u8DB3\u77E3\u3002
myisam_sort_buffer_size = 64M
\u7F13\u5B58\u53EF\u91CD\u7528\u7684\u7EBF\u7A0B\u6570 \u901A\u5E38\u81F3\u5C11\u8BBE\u7F6E\u4E3A16
thread_cache_size = 192
\u5F00\u542F\u67E5\u8BE2\u7F13\u5B58 mysql8 \u5DF2\u653E\u5F03
query_cache_type = 1
\u6307\u5B9AMySQL\u67E5\u8BE2\u7ED3\u679C\u7F13\u51B2\u533A\u7684\u5927\u5C0F\u3002\u5982\u679C\u5E94\u7528\u7A0B\u5E8F\u6709\u5927\u91CF\u8BFB\uFF0C\u800C\u4E14\u6CA1\u6709\u5E94\u7528\u7A0B\u5E8F\u7EA7\u522B\u7684\u7F13\u5B58\uFF0C\u90A3\u4E48\u8FD9\u5F88\u6709\u7528\u3002\u4E0D\u8FC7\u4E0D\u8981\u8BBE\u7F6E\u592A\u5927\uFF0C\u56E0\u4E3A\u7EF4\u62A4\u5B83\u4E5F\u9700\u8981\u4E0D\u5C11\u5F00\u9500\uFF0C\u8FD9\u4F1A\u5BFC\u81F4MySQL\u53D8\u6162\u3002
query_cache_size = 256M
\u5185\u90E8\u5185\u5B58\u4E34\u65F6\u8868\u7684\u5927\u5C0F
tmp_table_size = 1024M
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6211\u4EEC\u7F16\u8F91\u5B8C<code>my.cnf</code>\u4E4B\u540E\u8FDB\u884C\u4FDD\u5B58\uFF0C\u518D\u5F00\u4E00\u4E2A\u7EC8\u7AEF\u8FDB\u6765</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">cp</span> /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
<span class="token function">vim</span> /etc/init.d/mysqld

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u627E\u5230\u5982\u4E0B 2 \u53E5\uFF0C\u4FEE\u6539\u6210\u8FD9\u6837</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>basedir=/usr/local/mysql
datadir=/usr/local/mysql/data
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u7ED9\u5B83\u8BBE\u7F6E\u6743\u9650</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token function">chmod</span> a+x /etc/init.d/mysqld
<span class="token comment"># \u6DFB\u52A0\u8F6F\u94FE</span>
<span class="token function">ln</span> -s /usr/local/mysql/bin/mysql /usr/bin

<span class="token builtin class-name">cd</span> /usr/local/mysql/tmp/

<span class="token function">touch</span> mysqld.log
<span class="token function">chown</span> -R mysql.mysql /usr/local/mysql/

<span class="token comment"># \u6267\u884C</span>
/usr/local/mysql/bin/mysql_safe --user<span class="token operator">=</span>mysql <span class="token operator">&amp;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u5982\u679C\u51FA\u73B0\u4EE5\u4E0B\u9519\u8BEF\uFF1A</p><blockquote><p>[root@10 tmp]# 2022-08-06T14:36:24.675170Z mysqld_safe error: log-error set to &#39;/var/log/mariadb/mariadb.log&#39;, however file don&#39;t exists. Create writable for user &#39;mysql&#39;.</p></blockquote><p>\u8FD9\u53EF\u80FD\u662F\u6211\u4EEC\u524D\u9762\u4FEE\u6539<code>my.cnf</code></p><p>\u5FD8\u4E86\u4FEE\u6539\u5982\u4E0B\u5185\u5BB9\u7684\u5730\u5740</p><div class="language-text ext-text line-numbers-mode"><pre class="language-text"><code>[mysqld_safe]
log-error=/usr/local/mysql/tmp/mysqld.log
pid-file=/usr/local/mysql/tmp/mysqld.pid

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u7136\u540E\u6211\u4EEC\u518D\u7EE7\u7EED\u6765\u6267\u884C\u4E0A\u9762\u90A3\u4E00\u4E2A\u547D\u4EE4</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>/usr/local/mysql/bin/mysql_safe --user<span class="token operator">=</span>mysql <span class="token operator">&amp;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u51FA\u73B0\u5982\u4E0B\u5185\u5BB9\u5373\u53EF\uFF1A</p><blockquote><p>[root@10 tmp]# 2022-08-06T14:46:04.116955Z mysqld_safe Logging to &#39;/usr/local/mysql/tmp/mysqld.log&#39;. 2022-08-06T14:46:04.162116Z mysqld_safe Starting mysqld daemon with databases from /usr/local/mysql/data</p></blockquote><p>\u6700\u540E\u6211\u4EEC\u518D\u5F00\u4E00\u4E2A\u7EC8\u7AEF\u6765\u6D4B\u8BD5\u4E00\u4E0B\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 vagrant<span class="token punctuation">]</span><span class="token comment"># service mysqld restart</span>
Shutting down MySQL. SUCCESS<span class="token operator">!</span>
Starting MySQL<span class="token punctuation">..</span><span class="token punctuation">..</span>. SUCCESS<span class="token operator">!</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u5C31\u4EE3\u8868\u6211\u4EEC\u8BBE\u7F6E\u6210\u529F\u4E86\u3002</p><p>\u7136\u540E\u6211\u4EEC\u4F7F\u7528\u6B63\u5E38\u7684\u547D\u4EE4\u94FE\u63A5<code>mysql</code></p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>mysql -uroot -p
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>\u8F93\u5165\u4E0A\u9762\u6211\u4EEC\u8BB0\u4F4F\u7684\u4E00\u4E2A\u4E34\u65F6\u5BC6\u7801\u5373\u53EF</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@10 vagrant<span class="token punctuation">]</span><span class="token comment"># mysql -uroot -p</span>
Enter password:
Welcome to the MySQL monitor.  Commands end with <span class="token punctuation">;</span> or <span class="token punctuation">\\</span>g.
Your MySQL connection <span class="token function">id</span> is <span class="token number">9</span>
Server version: <span class="token number">8.0</span>.19

Copyright <span class="token punctuation">(</span>c<span class="token punctuation">)</span> <span class="token number">2000</span>, <span class="token number">2020</span>, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type <span class="token string">&#39;help;&#39;</span> or <span class="token string">&#39;\\h&#39;</span> <span class="token keyword">for</span> help. Type <span class="token string">&#39;\\c&#39;</span> to <span class="token function">clear</span> the current input statement.

mysql<span class="token operator">&gt;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code>mysql<span class="token operator">&gt;</span> ALTER user <span class="token string">&#39;root&#39;</span>@localhost identified by <span class="token string">&#39;root&#39;</span>
    -<span class="token operator">&gt;</span> <span class="token punctuation">;</span>
Query OK, <span class="token number">0</span> rows affected <span class="token punctuation">(</span><span class="token number">0.02</span> sec<span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4F7F\u7528\u4E0A\u8FF0\u547D\u4EE4\u6765\u4FEE\u6539\u5BC6\u7801\u4E3A\uFF1A<code>root</code></p><p>\u7136\u540E\u6211\u4EEC\u518D\u9000\u51FA\u91CD\u65B0\u4F7F\u7528<code>root</code>\u5BC6\u7801\u8FDB\u884C\u767B\u5F55\u6D4B\u8BD5\uFF0C\u5982\u679C\u6210\u529F\u4E86\uFF0C\u5C31\u4EE3\u8868\u5B8C\u7F8E\u7ED3\u675F\u4E86\u3002</p>`,61),d=[l];function r(c,o){return n(),e("div",null,d)}var v=s(a,[["render",r],["__file","linux-mysql8.html.vue"]]);export{v as default};
