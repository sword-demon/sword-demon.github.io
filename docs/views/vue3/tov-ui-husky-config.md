---
title: tov-ui配置Husky
date: 2024-02-17 23:01:10
category: Vue3
tag:
  - tov-ui
  - vue3
---

# 配置 Husky

>   安装

```bash
pnpm add husky -Dw
```

在根目录下的`package.json`里添加执行命令

```json
{
    "scripts": {
    "prepare": "husky install"
  },
}
```

然后再重新安装下依赖

```bash
pnpm install

Scope: all 2 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date
. prepare$ husky install
│ install command is deprecated
└─ Done in 669ms
Done in 1.1s
```

然后根目录下就会生成一个`.husky`文件，我们只需要在`git commit`之前进行检查代码即可。

```bash
npx husky add .husky/pre-commit "npx eslint . --fix"
```

我们这里先把`package.json`里的`husky`得版本换一下，新版的好像没有`add`了

```json
{
    "devDependencies": {
        "husky": "^8.0.3",
    }
}
```

```bash
pnpm install

npx husky add .husky/pre-commit "npx eslint . --fix"
```

至此`.husky/pre-commit`内容为

```
#!/user/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"


npx eslint . --fix
```

至此，如果有地方不符合规范的话，是不允许被提交的