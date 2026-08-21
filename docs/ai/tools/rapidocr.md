---
title: 为hermes安装rapidocr提取图片文字
date: 2026-08-20 22:04:10
---

在 `hermes`里面直接让它基于`python`环境安装`RapidOCR`到当前 python 环境里，`hermes`会自己帮你执行好任务。

安装完成之后，你要让它形成记忆，让它以后使用`RapidOCR`优先来提取图片文字，最后再使用视觉模型，不要一上来就使用视觉模型。

```
已成功安装 RapidOCR 到 Python 3.13 环境 ♪

已安装的包：
  • rapidocr              3.9.2  (主程序)
  • onnxruntime           1.29.0 (推理引擎，OCR 必须依赖)
  • opencv-python         5.0.0.93 (图像处理)
  • omegaconf             2.3.1  (配置解析)
  • 配套依赖: pyclipper, colorlog, antlr4-python3-runtime, six, flatbuffers

模型文件 (PP-OCRv6 最新版，自动下载完成)：
  • PP-OCRv6_det_small.onnx (文字检测)
  • PP-OCRv6_rec_small.onnx (文字识别)
  • ch_ppocr_mobile_v2.0_cls_mobile.onnx (文字方向分类)

安装路径：/Users/wxvirus/Library/Python/3.13/lib/python/site-packages/
二进制脚本路径：/Users/wxvirus/Library/Python/3.13/bin/ (未在 PATH 中，使用 Python 调用即可)

═══════════════════════════════════
以后提取图片文字的使用方式 (★ ω ★)
═══════════════════════════════════

Python 调用方式：

from rapidocr import RapidOCR
engine = RapidOCR()
result = engine('/path/to/image.png')
result 格式: ([boxes, texts, scores], None)
直接取出文字列表:
texts = result[0][1] if result[0] else []
print('\n'.join(texts))

或者更简洁：
result, _ = engine('/path/to/image.png')
if result:
    boxes, texts, scores = result
    for text, score in zip(texts, scores):
        print(f'{text} (置信度: {score:.2f})')

命令行方式 (先把脚本路径加到 PATH 或用全路径)：
~/Library/Python/3.13/bin/rapidocr -path /path/to/image.png

═══════════════════════════════════
特点备注
═══════════════════════════════════
• 默认支持中文 + 英文，如需其它语言可传 params，如 engine('/path', params={'Global.lang_det': 'japan', ...})
• 完全离线运行，首次加载后无需联网
• 返回带坐标 boxes + 文字 texts + 置信度 scores，方便后续处理
• 比 Tesseract 对中文场景准确率高很多哦～
```



## 电脑清理

先把安全规则写在前面

```
> 我的磁盘空间快满了，请帮我检查可以清理的文件。
>
> 先不要删除任何东西，只做扫描和分类。
>
> 请把结果分成三类：
>
> 1. 基本无副作用，可以建议删除的缓存，例如应用缓存、npm 缓存、pip 缓存、临时日志、下载目录里的安装包。
> 2. 需要我确认后才能删除的内容，例如模拟器数据、项目依赖缓存、聊天软件文件、应用主数据、很久没用的大文件。
> 3. 不建议删除的内容，例如用户文档、桌面归档、照片、聊天记录、配置文件、正在使用的项目目录。
>
> 每一项都要告诉我路径、占用空间、为什么归到这一类。
> 扫描完成后先汇总，不要执行删除。
```

删除前再确认一次，第一次跑通之后，可以手动将这套规则沉淀成技能。

```bash
帮我把这套规则沉淀成技能
```

> 但是使用`Agent`必须建立一个习惯：凡是涉及删除、覆盖、迁移、改配置的任务，都不能只给目标，还要给边界。
