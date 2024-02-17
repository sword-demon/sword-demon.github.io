---
title: tov-ui配置eslint
date: 2024-02-17 23:01:10
category: Vue3
tag:
  - tov-ui
  - vue3
---

# 配置 eslint

```bash
pnpm add eslint @mistjs/eslint-config -D    
 ERR_PNPM_ADDING_TO_ROOT  Running this command will add the dependency to the workspace root, which might not be what you want - if you really meant it, make it explicit by running this command again with the -w flag (or --workspace-root). If you don't want to see this warning anymore, you may set the ignore-workspace-root-check setting to true.
```

这里是因为我们使用了`workspace`，所以还需要加上一个`w`

```bash
pnpm add eslint @mistjs/eslint-config -Dw
```

意味着把我们的依赖下载到`workspace`的根目录下的`package.json`里

```json
{
    "devDependencies": {
    "@mistjs/eslint-config": "^1.0.0",
    "@vitejs/plugin-vue": "^5.0.3",
    "eslint": "^8.56.0",
    "typescript": "^5.2.2",
    "vite": "^5.1.0",
    "vue-tsc": "^1.8.27"
  }
}
```

这里的`eslint`的版本是有问题的，我们需要手动调整版本为`8.55.0`，然后重新安装一下

```bash
pnpm install
```



根目录下新建`eslint.config.js`

```js
import mist from '@mistjs/eslint-config'

export default mist({
    
})
```

如果是`vscode`进行相关的配置，在`.vscode`下新建`settings.json`

```json
{
    // 开启 eslint 扁平化配置
    "eslint.experimental.useFlatConfig": true,
    // 关闭默认的配置，不开启 prettier 格式化
    "prettier.enable": false,
    // 关闭默认格式化
    "editor.formatOnSave": false,

    // 保存自动修复
    "editor.codeActionsOnSave": {
        // 我们这里指自定义修复
        "source.fixAll": "explicit",
        // 来源导入我们不需要给关闭掉
        "source.organizeImports": "never"
    },
    // 静默样式规则自动修复
    "eslint.rules.customizations": [
        { "rule": "style/*","severity": "off"},
        { "rule": "*-indent", "severity": "off"},
        { "rule": "*-spacing", "severity": "off"},
        { "rule": "*-spaces", "severity": "off"},
        { "rule": "*-order", "severity": "off"},
        { "rule": "*-dangle", "severity": "off"},
        { "rule": "*-newline", "severity": "off"},
        { "rule": "*quotes", "severity": "off"},
        { "rule": "*semi", "severity": "off"}
    ],
    // 在 eslint 中开启哪些语言的校验
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "vue",
        "html",
        "markdown",
        "json",
        "jsonc",
        "yaml"
    ]
}
```

如果是`webstorm`,需要版本大于`2023.2`

![image-20240217222738452](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20240217222738452.png)

然后修改下部分代码，进行保存测试即可。

## 自定义部分配置规则

比如我们有的时候会使用到`console.log`或者`debugger`等，可以在`eslint.config.js`里进行扩展

```js
import mist from '@mistjs/eslint-config'

export default mist({
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
  },
})
```

