import{_ as t}from"./plugin-vue_export-helper.21dcd24c.js";import{r as p,o,c as e,a as n,b as i,d as s,e as c}from"./app.e4fe26a1.js";const u={},l=n("h1",{id:"gin-\u81EA\u5B9A\u4E49\u9A8C\u8BC1\u5668\u548C\u7FFB\u8BD1\u54CD\u5E94\u5185\u5BB9",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#gin-\u81EA\u5B9A\u4E49\u9A8C\u8BC1\u5668\u548C\u7FFB\u8BD1\u54CD\u5E94\u5185\u5BB9","aria-hidden":"true"},"#"),s(" gin \u81EA\u5B9A\u4E49\u9A8C\u8BC1\u5668\u548C\u7FFB\u8BD1\u54CD\u5E94\u5185\u5BB9")],-1),r=n("h2",{id:"validator-\u7FFB\u8BD1\u6587\u6863\u5730\u5740",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#validator-\u7FFB\u8BD1\u6587\u6863\u5730\u5740","aria-hidden":"true"},"#"),s(" validator \u7FFB\u8BD1\u6587\u6863\u5730\u5740")],-1),k={href:"https://github.com/go-playground/validator/blob/master/_examples/translations/main.go",target:"_blank",rel:"noopener noreferrer"},d=s("https://github.com/go-playground/validator/blob/master/_examples/translations/main.go"),v=c(`<div class="language-go ext-go line-numbers-mode"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token punctuation">(</span>
	<span class="token string">&quot;fmt&quot;</span>
	<span class="token string">&quot;github.com/gin-gonic/gin&quot;</span>
	<span class="token string">&quot;github.com/gin-gonic/gin/binding&quot;</span>
	<span class="token string">&quot;github.com/go-playground/locales/zh&quot;</span>
	ut <span class="token string">&quot;github.com/go-playground/universal-translator&quot;</span>
	<span class="token string">&quot;github.com/go-playground/validator/v10&quot;</span>
	<span class="token string">&quot;github.com/go-playground/validator/v10/translations/en&quot;</span>
	zh2 <span class="token string">&quot;github.com/go-playground/validator/v10/translations/zh&quot;</span>
	<span class="token string">&quot;net/http&quot;</span>
	<span class="token string">&quot;reflect&quot;</span>
	<span class="token string">&quot;strings&quot;</span>
<span class="token punctuation">)</span>

<span class="token keyword">type</span> LoginReq <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	User     <span class="token builtin">string</span> <span class="token string">\`form:&quot;user&quot; json:&quot;user&quot; xml:&quot;user&quot; binding:&quot;required,min=3,max=10&quot;\`</span>
	Password <span class="token builtin">string</span> <span class="token string">\`form:&quot;password&quot; json:&quot;password&quot; xml:&quot;password&quot; binding:&quot;required&quot;\`</span>
<span class="token punctuation">}</span>

<span class="token keyword">type</span> SignupReq <span class="token keyword">struct</span> <span class="token punctuation">{</span>
	Age        <span class="token builtin">uint8</span>  <span class="token string">\`json:&quot;age&quot; binding:&quot;gte=1,lte=130&quot;\`</span>
	Name       <span class="token builtin">string</span> <span class="token string">\`json:&quot;name&quot; binding:&quot;required,min=3&quot;\`</span>
	Email      <span class="token builtin">string</span> <span class="token string">\`json:&quot;email&quot; binding:&quot;required,email&quot;\`</span>
	Password   <span class="token builtin">string</span> <span class="token string">\`json:&quot;password&quot; binding:&quot;required&quot;\`</span>
	RePassword <span class="token builtin">string</span> <span class="token string">\`json:&quot;re_password&quot; binding:&quot;required,eqfield=Password&quot;\`</span> <span class="token comment">// \u8DE8\u5B57\u6BB5\u9A8C\u8BC1</span>
<span class="token punctuation">}</span>

<span class="token keyword">var</span> trans ut<span class="token punctuation">.</span>Translator

<span class="token keyword">func</span> <span class="token function">removeTopStruct</span><span class="token punctuation">(</span>fields <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span><span class="token builtin">string</span> <span class="token punctuation">{</span>
	rsp <span class="token operator">:=</span> <span class="token keyword">map</span><span class="token punctuation">[</span><span class="token builtin">string</span><span class="token punctuation">]</span><span class="token builtin">string</span><span class="token punctuation">{</span><span class="token punctuation">}</span>
	<span class="token keyword">for</span> field<span class="token punctuation">,</span> err <span class="token operator">:=</span> <span class="token keyword">range</span> fields <span class="token punctuation">{</span>
		rsp<span class="token punctuation">[</span>field<span class="token punctuation">[</span>strings<span class="token punctuation">.</span><span class="token function">Index</span><span class="token punctuation">(</span>field<span class="token punctuation">,</span> <span class="token string">&quot;.&quot;</span><span class="token punctuation">)</span><span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">:</span><span class="token punctuation">]</span><span class="token punctuation">]</span> <span class="token operator">=</span> err
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span> rsp
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">InitTrans</span><span class="token punctuation">(</span>locale <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token punctuation">(</span>err <span class="token builtin">error</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token comment">// \u4FEE\u6539 gin \u7684 validator \u5F15\u64CE\u5C5E\u6027\uFF0C\u5B9E\u73B0\u5B9A\u5236</span>
	<span class="token keyword">if</span> v<span class="token punctuation">,</span> ok <span class="token operator">:=</span> binding<span class="token punctuation">.</span>Validator<span class="token punctuation">.</span><span class="token function">Engine</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token punctuation">(</span><span class="token operator">*</span>validator<span class="token punctuation">.</span>Validate<span class="token punctuation">)</span><span class="token punctuation">;</span> ok <span class="token punctuation">{</span>
		<span class="token comment">// \u6CE8\u518C\u4E00\u4E2A\u83B7\u53D6 json \u7684 tag \u7684\u81EA\u5B9A\u4E49\u65B9\u6CD5</span>
		v<span class="token punctuation">.</span><span class="token function">RegisterTagNameFunc</span><span class="token punctuation">(</span><span class="token keyword">func</span><span class="token punctuation">(</span>field reflect<span class="token punctuation">.</span>StructField<span class="token punctuation">)</span> <span class="token builtin">string</span> <span class="token punctuation">{</span>
			name <span class="token operator">:=</span> strings<span class="token punctuation">.</span><span class="token function">SplitN</span><span class="token punctuation">(</span>field<span class="token punctuation">.</span>Tag<span class="token punctuation">.</span><span class="token function">Get</span><span class="token punctuation">(</span><span class="token string">&quot;json&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">&quot;,&quot;</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span>
			<span class="token keyword">if</span> name <span class="token operator">==</span> <span class="token string">&quot;-&quot;</span> <span class="token punctuation">{</span>
				<span class="token keyword">return</span> <span class="token string">&quot;&quot;</span>
			<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
				<span class="token keyword">return</span> name
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span><span class="token punctuation">)</span>
		zhCn <span class="token operator">:=</span> zh<span class="token punctuation">.</span><span class="token function">New</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">// \u4E2D\u6587\u7FFB\u8BD1\u5668</span>
		uni <span class="token operator">:=</span> ut<span class="token punctuation">.</span><span class="token function">New</span><span class="token punctuation">(</span>zhCn<span class="token punctuation">,</span> zhCn<span class="token punctuation">)</span>
		trans<span class="token punctuation">,</span> ok <span class="token operator">=</span> uni<span class="token punctuation">.</span><span class="token function">GetTranslator</span><span class="token punctuation">(</span>locale<span class="token punctuation">)</span>
		<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
			<span class="token keyword">return</span> fmt<span class="token punctuation">.</span><span class="token function">Errorf</span><span class="token punctuation">(</span><span class="token string">&quot;uni.GetTranslator(%s)&quot;</span><span class="token punctuation">,</span> locale<span class="token punctuation">)</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">switch</span> locale <span class="token punctuation">{</span>
		<span class="token keyword">case</span> <span class="token string">&quot;zh&quot;</span><span class="token punctuation">:</span>
			err <span class="token operator">:=</span> zh2<span class="token punctuation">.</span><span class="token function">RegisterDefaultTranslations</span><span class="token punctuation">(</span>v<span class="token punctuation">,</span> trans<span class="token punctuation">)</span>
			<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
				<span class="token keyword">return</span> err
			<span class="token punctuation">}</span>
		<span class="token keyword">case</span> <span class="token string">&quot;en&quot;</span><span class="token punctuation">:</span>
			err <span class="token operator">:=</span> en<span class="token punctuation">.</span><span class="token function">RegisterDefaultTranslations</span><span class="token punctuation">(</span>v<span class="token punctuation">,</span> trans<span class="token punctuation">)</span>
			<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
				<span class="token keyword">return</span> err
			<span class="token punctuation">}</span>
		<span class="token keyword">default</span><span class="token punctuation">:</span>
			err <span class="token operator">:=</span> zh2<span class="token punctuation">.</span><span class="token function">RegisterDefaultTranslations</span><span class="token punctuation">(</span>v<span class="token punctuation">,</span> trans<span class="token punctuation">)</span>
			<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
				<span class="token keyword">return</span> err
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">return</span>
<span class="token punctuation">}</span>

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token keyword">if</span> err <span class="token operator">:=</span> <span class="token function">InitTrans</span><span class="token punctuation">(</span><span class="token string">&quot;zh&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>err<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;\u521D\u59CB\u5316\u7FFB\u8BD1\u5668\u9519\u8BEF&quot;</span><span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
	r <span class="token operator">:=</span> gin<span class="token punctuation">.</span><span class="token function">Default</span><span class="token punctuation">(</span><span class="token punctuation">)</span>

	r<span class="token punctuation">.</span><span class="token function">POST</span><span class="token punctuation">(</span><span class="token string">&quot;/login&quot;</span><span class="token punctuation">,</span> <span class="token keyword">func</span><span class="token punctuation">(</span>c <span class="token operator">*</span>gin<span class="token punctuation">.</span>Context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">var</span> loginReq LoginReq
		err <span class="token operator">:=</span> c<span class="token punctuation">.</span><span class="token function">ShouldBind</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>loginReq<span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			errs<span class="token punctuation">,</span> ok <span class="token operator">:=</span> err<span class="token punctuation">.</span><span class="token punctuation">(</span>validator<span class="token punctuation">.</span>ValidationErrors<span class="token punctuation">)</span>
			<span class="token keyword">if</span> <span class="token operator">!</span>ok <span class="token punctuation">{</span>
				c<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span>http<span class="token punctuation">.</span>StatusOK<span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span>
					<span class="token comment">// \u8FD4\u56DE\u539F\u9519\u8BEF</span>
					<span class="token string">&quot;msg&quot;</span><span class="token punctuation">:</span> err<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
				<span class="token punctuation">}</span><span class="token punctuation">)</span>
			<span class="token punctuation">}</span>
			c<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span>http<span class="token punctuation">.</span>StatusBadRequest<span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span>
				<span class="token string">&quot;error&quot;</span><span class="token punctuation">:</span> <span class="token function">removeTopStruct</span><span class="token punctuation">(</span>errs<span class="token punctuation">.</span><span class="token function">Translate</span><span class="token punctuation">(</span>trans<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// \u5904\u7406\u9519\u8BEF\u63D0\u793A\u524D\u9762\u7684\u7ED3\u6784\u4F53\u540D\u79F0</span>
			<span class="token punctuation">}</span><span class="token punctuation">)</span>
			<span class="token keyword">return</span>
		<span class="token punctuation">}</span>

		c<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span>http<span class="token punctuation">.</span>StatusOK<span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span>
			<span class="token string">&quot;msg&quot;</span><span class="token punctuation">:</span> <span class="token string">&quot;\u767B\u5F55\u6210\u529F&quot;</span><span class="token punctuation">,</span>
		<span class="token punctuation">}</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">)</span>

	r<span class="token punctuation">.</span><span class="token function">POST</span><span class="token punctuation">(</span><span class="token string">&quot;/register&quot;</span><span class="token punctuation">,</span> <span class="token keyword">func</span><span class="token punctuation">(</span>c <span class="token operator">*</span>gin<span class="token punctuation">.</span>Context<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">var</span> signupReq SignupReq
		err <span class="token operator">:=</span> c<span class="token punctuation">.</span><span class="token function">ShouldBind</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>signupReq<span class="token punctuation">)</span>
		<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
			c<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span>http<span class="token punctuation">.</span>StatusBadRequest<span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span>
				<span class="token string">&quot;error&quot;</span><span class="token punctuation">:</span> err<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
			<span class="token punctuation">}</span><span class="token punctuation">)</span>
			<span class="token keyword">return</span>
		<span class="token punctuation">}</span>

		c<span class="token punctuation">.</span><span class="token function">JSON</span><span class="token punctuation">(</span>http<span class="token punctuation">.</span>StatusOK<span class="token punctuation">,</span> gin<span class="token punctuation">.</span>H<span class="token punctuation">{</span>
			<span class="token string">&quot;msg&quot;</span><span class="token punctuation">:</span> <span class="token string">&quot;\u6CE8\u518C\u6210\u529F&quot;</span><span class="token punctuation">,</span>
		<span class="token punctuation">}</span><span class="token punctuation">)</span>
	<span class="token punctuation">}</span><span class="token punctuation">)</span>

	err <span class="token operator">:=</span> r<span class="token punctuation">.</span><span class="token function">Run</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token keyword">if</span> err <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
		fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span>err<span class="token punctuation">.</span><span class="token function">Error</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
		<span class="token keyword">return</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,1);function m(b,g){const a=p("ExternalLinkIcon");return o(),e("div",null,[l,r,n("p",null,[n("a",k,[d,i(a)])]),v])}var w=t(u,[["render",m],["__file","gin-validator-trans.html.vue"]]);export{w as default};
