---
title: tov-ui配置lint-staged
date: 2024-03-08 22:36:10
category: Vue3
tag:
  - tov-ui
  - vue3
---

# lint-staged配置

前面使用`npx eslint . --fix`来检查我们整个项目，项目足够小还行，如果文件越来越大的时候就会有问题，我们就需要想办法让它只执行我们变更的文件，大大提升我们的检查的速度，就推出了一个工具`lint-staged`

```bash
pnpm add lint-staged -Dw
```

在`package.json`里配置

```json
{
    // ... 上面 code 省略
    // 新增项
    "lint-staged": {
    "./**/*.{js,ts,vue,tsx,jsx,css,less,json}": [
      "eslint --fix"
    ]
  }
}
```

然后将前面配置的`.husky/pre-commit`里的内容替换

```text
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# npx eslint . --fix
npx lint-staged
```

```bash
➜  tov-ui git:(main) ✗ git add .
➜  tov-ui git:(main) ✗ git commit -m "feat: config lint-staged"
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
[main 7787097] feat: config lint-staged
 3 files changed, 282 insertions(+), 1 deletion(-)
```

现在提交代码就只检查了 3 个文件。

