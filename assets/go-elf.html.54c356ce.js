import{_ as n}from"./plugin-vue_export-helper.21dcd24c.js";import{o as s,c as e,e as a}from"./app.c212f57f.js";const i={},l=a(`<h2 id="\u7F16\u8BD1\u597D\u7684\u542B\u6709\u7A0B\u5E8F\u6307\u4EE4-\u7A0B\u5E8F\u6570\u636E\u7684\u4E8C\u8FDB\u5236\u6587\u4EF6-elf-\u6587\u4EF6\u7ED3\u6784" tabindex="-1"><a class="header-anchor" href="#\u7F16\u8BD1\u597D\u7684\u542B\u6709\u7A0B\u5E8F\u6307\u4EE4-\u7A0B\u5E8F\u6570\u636E\u7684\u4E8C\u8FDB\u5236\u6587\u4EF6-elf-\u6587\u4EF6\u7ED3\u6784" aria-hidden="true">#</a> \u7F16\u8BD1\u597D\u7684\u542B\u6709\u7A0B\u5E8F\u6307\u4EE4+\u7A0B\u5E8F\u6570\u636E\u7684\u4E8C\u8FDB\u5236\u6587\u4EF6 - ELF \u6587\u4EF6\u7ED3\u6784</h2><p><img src="https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220430142800.png" alt="ELF\u7ED3\u6784" loading="lazy"></p><p>\u53EF\u4EE5\u8F93\u5165<code>man elf</code>\u6765\u67E5\u770B\u4E00\u4E9B\u624B\u518C\u5185\u5BB9\u3002</p><p>\u67E5\u770B<code>go</code>\u7F16\u8BD1\u51FA\u7684\u4E8C\u8FDB\u5236\u6587\u4EF6</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@jb51 base<span class="token punctuation">]</span><span class="token comment"># readelf -h demo1</span>
ELF Header:
  Magic:   7f <span class="token number">45</span> 4c <span class="token number">46</span> 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              <span class="token number">2</span>&#39;s complement, little endian
  Version:                           <span class="token number">1</span> <span class="token punctuation">(</span>current<span class="token punctuation">)</span>
  OS/ABI:                            UNIX - System V
  ABI Version:                       <span class="token number">0</span>
  Type:                              EXEC <span class="token punctuation">(</span>Executable <span class="token function">file</span><span class="token punctuation">)</span>
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x453b60  <span class="token comment"># \u7A0B\u5E8F\u5165\u53E3\u5730\u5740</span>
  Start of program headers:          <span class="token number">64</span> <span class="token punctuation">(</span>bytes into <span class="token function">file</span><span class="token punctuation">)</span>
  Start of section headers:          <span class="token number">456</span> <span class="token punctuation">(</span>bytes into <span class="token function">file</span><span class="token punctuation">)</span>
  Flags:                             0x0
  Size of this header:               <span class="token number">64</span> <span class="token punctuation">(</span>bytes<span class="token punctuation">)</span>
  Size of program headers:           <span class="token number">56</span> <span class="token punctuation">(</span>bytes<span class="token punctuation">)</span>
  Number of program headers:         <span class="token number">7</span>
  Size of section headers:           <span class="token number">64</span> <span class="token punctuation">(</span>bytes<span class="token punctuation">)</span>
  Number of section headers:         <span class="token number">23</span>
  Section header string table index: <span class="token number">3</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u8FD9\u4E2A\u5C31\u662F<code>ELF</code>\u6587\u4EF6\u5934\u4FE1\u606F\u3002</p><div class="custom-container warning"><p class="custom-container-title">\u6CE8\u610F</p><p>\u7A0B\u5E8F\u5934\u8868(program header)\u53EA\u6709\u53EF\u6267\u884C\u6587\u4EF6\u6216\u52A8\u6001\u5E93\u6587\u4EF6\u624D\u6709\uFF0C\u76EE\u6807\u6587\u4EF6\u3010\u53EF\u91CD\u5B9A\u4F4D\u6587\u4EF6\u3011\u662F\u6CA1\u6709\u7684\u3002</p></div><p>\u4F7F\u7528\u5982\u4E0B\u547D\u4EE4\u6765\u67E5\u770B\u7A0B\u5E8F\u5934\u8868</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@jb51 base<span class="token punctuation">]</span><span class="token comment"># readelf -l demo1</span>

Elf <span class="token function">file</span> <span class="token builtin class-name">type</span> is EXEC <span class="token punctuation">(</span>Executable <span class="token function">file</span><span class="token punctuation">)</span>
Entry point 0x453b60
There are <span class="token number">7</span> program headers, starting at offset <span class="token number">64</span>

Program Headers:
  Type           Offset             VirtAddr           PhysAddr
                 FileSiz            MemSiz              Flags  Align
  PHDR           0x0000000000000040 0x0000000000400040 0x0000000000400040
                 0x0000000000000188 0x0000000000000188  R      <span class="token number">1000</span>
  NOTE           0x0000000000000f9c 0x0000000000400f9c 0x0000000000400f9c
                 0x0000000000000064 0x0000000000000064  R      <span class="token number">4</span>
  LOAD           0x0000000000000000 0x0000000000400000 0x0000000000400000
                 0x00000000000553f0 0x00000000000553f0  R E    <span class="token number">1000</span>
  LOAD           0x0000000000056000 0x0000000000456000 0x0000000000456000
                 0x0000000000061d68 0x0000000000061d68  R      <span class="token number">1000</span>
  LOAD           0x00000000000b8000 0x00000000004b8000 0x00000000004b8000
                 0x00000000000033a0 0x0000000000037200  RW     <span class="token number">1000</span>
  GNU_STACK      0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000  RW     <span class="token number">8</span>
  LOOS+5041580   0x0000000000000000 0x0000000000000000 0x0000000000000000
                 0x0000000000000000 0x0000000000000000         <span class="token number">8</span>

 Section to Segment mapping:
  Segment Sections<span class="token punctuation">..</span>.
   00
   01     .note.go.buildid
   02     .text .note.go.buildid
   03     .rodata .typelink .itablink .gosymtab .gopclntab
   04     .go.buildinfo .noptrdata .data .bss .noptrbss
   05
   06
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u6709 7 \u6BB5\u7A0B\u5E8F\u5934\u8868\u3002</p><p><code>R E</code>\uFF1A\u53EF\u8BFB\u53EF\u6267\u884C\uFF0C\u5BF9\u5E94\u7684\u5E94\u8BE5\u662F\u4EE3\u7801\u6BB5\uFF0C\u53EA\u6709\u4EE3\u7801\u80FD\u8BFB\u80FD\u6267\u884C</p><p><code>R W</code>\uFF1A\u53EA\u6709\u6570\u636E\u624D\u80FD\u8BFB\u5199</p><p>\u7A0B\u5E8F\u5934\u8868\uFF1A\u5B83\u51B3\u5B9A\u4E86\u64CD\u4F5C\u7CFB\u7EDF\u52A0\u8F7D\u53EF\u6267\u884C\u6587\u4EF6\u65F6\u7684\u6620\u5C04\u65B9\u6CD5</p><p>\u7B2C\u4E09\u90E8\u5206\u6BB5\u8868\u90E8\u5206\u5185\u5BB9\uFF1A</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@jb51 base<span class="token punctuation">]</span><span class="token comment"># objdump -h demo1</span>

demo1:     <span class="token function">file</span> <span class="token function">format</span> elf64-x86-64

Sections:
Idx Name          Size      VMA<span class="token punctuation">(</span>\u6BB5\u7684\u865A\u62DF\u5730\u5740<span class="token punctuation">)</span>            LMA         File off  Algn
  <span class="token number">0</span> .text         000543f0  0000000000401000  0000000000401000  00001000  <span class="token number">2</span>**5
                  CONTENTS, ALLOC, LOAD, READONLY, CODE
  <span class="token number">1</span> .rodata       000224d8  0000000000456000  0000000000456000  00056000  <span class="token number">2</span>**5
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  <span class="token number">2</span> .typelink     000002c0  0000000000478660  0000000000478660  00078660  <span class="token number">2</span>**5
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  <span class="token number">3</span> .itablink     00000008  0000000000478920  0000000000478920  00078920  <span class="token number">2</span>**3
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  <span class="token number">4</span> .gosymtab     00000000  0000000000478928  0000000000478928  00078928  <span class="token number">2</span>**0
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  <span class="token number">5</span> .gopclntab    0003f428  0000000000478940  0000000000478940  00078940  <span class="token number">2</span>**5
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  <span class="token number">6</span> .go.buildinfo 00000020  00000000004b8000  00000000004b8000  000b8000  <span class="token number">2</span>**4
                  CONTENTS, ALLOC, LOAD, DATA
  <span class="token number">7</span> .noptrdata    00001180  00000000004b8020  00000000004b8020  000b8020  <span class="token number">2</span>**5
                  CONTENTS, ALLOC, LOAD, DATA
  <span class="token number">8</span> .data         000021f0  00000000004b91a0  00000000004b91a0  000b91a0  <span class="token number">2</span>**5
                  CONTENTS, ALLOC, LOAD, DATA
  <span class="token number">9</span> .bss          0002eb28  00000000004bb3a0  00000000004bb3a0  000bb3a0  <span class="token number">2</span>**5
                  ALLOC
 <span class="token number">10</span> .noptrbss     00005320  00000000004e9ee0  00000000004e9ee0  000e9ee0  <span class="token number">2</span>**5
                  ALLOC
 <span class="token number">11</span> .zdebug_abbrev 000001e6  00000000004f0000  00000000004f0000  000bc000  <span class="token number">2</span>**0
                  CONTENTS, READONLY, DEBUGGING
 <span class="token number">12</span> .zdebug_line  00020a4a  00000000004f0119  00000000004f0119  000bc119  <span class="token number">2</span>**0
                  CONTENTS, READONLY, DEBUGGING
 <span class="token number">13</span> .zdebug_frame 0000a594  000000000050346d  000000000050346d  000cf46d  <span class="token number">2</span>**0
                  CONTENTS, READONLY, DEBUGGING
 <span class="token number">14</span> .debug_gdb_scripts 0000002a  0000000000507036  0000000000507036  000d3036  <span class="token number">2</span>**0
                  CONTENTS, READONLY, DEBUGGING
 <span class="token number">15</span> .zdebug_info  0004fa12  0000000000507060  0000000000507060  000d3060  <span class="token number">2</span>**0
                  CONTENTS, READONLY, DEBUGGING
 <span class="token number">16</span> .zdebug_loc   000645c3  00000000005285b2  00000000005285b2  000f45b2  <span class="token number">2</span>**0
                  CONTENTS, READONLY, DEBUGGING
 <span class="token number">17</span> .zdebug_ranges 000237b0  0000000000539b68  0000000000539b68  00105b68  <span class="token number">2</span>**0
                  CONTENTS, READONLY, DEBUGGING
 <span class="token number">18</span> .note.go.buildid 00000064  0000000000400f9c  0000000000400f9c  00000f9c  <span class="token number">2</span>**2
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>\u4EE3\u7801\u6BB5\u6BD4\u8F83\u957F\uFF0C\u4E0D\u5EFA\u8BAE\u4F7F\u7528\u547D\u4EE4\u53BB\u67E5\u770B\u3002</p><div class="language-bash ext-sh line-numbers-mode"><pre class="language-bash"><code><span class="token punctuation">[</span>root@jb51 base<span class="token punctuation">]</span><span class="token comment"># size demo1</span>
   text    data     bss     dec     hex filename
 <span class="token number">745500</span>   <span class="token number">13200</span>  <span class="token number">212552</span>  <span class="token number">971252</span>   ed1f4 demo1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>text</code>\uFF1A\u662F\u4E8C\u8FDB\u5236\u6587\u4EF6\u5B58\u50A8\u7A0B\u5E8F\u6307\u4EE4\u7684\u4F4D\u7F6E\uFF0C\u4E0B\u9762\u7684\u6570\u5B57\u662F\u8868\u793A\u6307\u4EE4\u7684\u5927\u5C0F\uFF0C\u6307\u4EE4\u8D8A\u5C11\uFF0C\u6267\u884C\u8D8A\u5FEB\uFF0C\u901F\u5EA6\u5C31\u8D8A\u5FEB\u3002</li><li><code>data</code>\uFF1A\u662F\u4E8C\u8FDB\u5236\u6587\u4EF6\u5B58\u50A8\u7A0B\u5E8F\u6570\u636E\u7684\u4F4D\u7F6E\uFF0C\u4E0B\u9762\u7684\u6570\u636E\u8868\u793A\u6570\u636E\u5360\u7528\u5185\u5B58\u5927\u5C0F</li><li><code>bss</code>\uFF1A\u4E5F\u662F\u6570\u636E\u6BB5\uFF0C\u4E3B\u8981\u5B58\u50A8\u8FD8\u6CA1\u6709\u521D\u59CB\u5316\u7684\u6570\u636E</li></ul><p>\u53EF\u4EE5\u4F7F\u7528<code>readelf -s a.o</code>\u53EF\u91CD\u5B9A\u4F4D\u6587\u4EF6\u53BB\u67E5\u770B\u4E00\u4E9B\u522B\u7684\u5176\u4ED6\u6587\u4EF6\u6BB5\u3002</p>`,19),c=[l];function d(p,t){return s(),e("div",null,c)}var o=n(i,[["render",d],["__file","go-elf.html.vue"]]);export{o as default};
