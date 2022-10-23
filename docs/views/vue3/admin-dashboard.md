---
title: 后台主控面板开发
date: 2022-10-23 18:02:10
category: Vue3
tag:
    - Dashboard
    - vue3
---

# 后台主控面板开发

## 统计面板组件开发

这里推荐一个使用的`vscode`的插件：`Element Plus Snippets`，提供了很多`Element Plus`的快捷代码生成。

还需要使用到`Card`组件：[https://element-plus.gitee.io/zh-CN/component/card.html](https://element-plus.gitee.io/zh-CN/component/card.html)

标签组件：[https://element-plus.gitee.io/zh-CN/component/tag.html](https://element-plus.gitee.io/zh-CN/component/tag.html)

分割线组件：[https://element-plus.gitee.io/zh-CN/component/divider.html](https://element-plus.gitee.io/zh-CN/component/divider.html)

```js
<template>
    <div>
        <el-row :gutter="20">
            <el-col
                :span="6"
                :offset="0"
                v-for="(item, index) in panels"
                :key="index"
            >
                <el-card shadow="hover" class="border-0">
                    <template #header>
                        <div class="flex justify-between">
                            <span class="text-sm">{{ item.title }}</span>
                            <el-tag :type="item.unitColor" effect="plain">{{
                                item.unit
                            }}</el-tag>
                        </div>
                    </template>
                    <span class="text-3xl font-bold text-gray-500">
                        {{ item.value }}
                    </span>
                    <el-divider />
                    <div class="flex justify-between text-sm text-gray-500">
                        <span>{{ item.subTitle }}</span>
                        <span>{{ item.subValue }}</span>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { getStatistics1 } from "~/api/index.js";

const panels = ref([]);
getStatistics1().then((res) => {
    panels.value = res.panels;
    console.log(panels.value);
});
</script>

```

![效果图](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/20221023174825.png)

### 骨架屏优化体验

文档地址：[https://element-plus.gitee.io/zh-CN/component/skeleton.html](https://element-plus.gitee.io/zh-CN/component/skeleton.html)
