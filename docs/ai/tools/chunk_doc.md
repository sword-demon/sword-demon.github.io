---
title: 文档分块
date: 2026:05-17 01:16:10
---

# 文档分块

## 准备工作：从 PDF 到可用文本

`Chunking`分块目标：做一个能回答`Java`编程规范问题的智能助手

```
用户问: "变量命名有什么规范？"
系统检索规范手册，给出准确答案：”代码中的命名均不能以下划线或美元符号开始...“
```

数据源：阿里巴巴 Java 开发手册

挑战：

- PDF 格式，不是纯文本
- 有页眉页脚、页码等干扰信息
- 有的还是纯图片的 PDF 的内容
- 如何切分才能保证检索准确？



### 提取 PDF 文本

安装工具

```bash
pip install pdfplumber
```

```python
with pdfplumber.open(pdf_path) as pdf:
  	for page in pdf.pages:
      	all_text += page.extract_text()
        
        
print(f"提取完成，共{len(all_text)}字符")
```

### 清洗文本

直接提取的文本包含很多干扰信息、有的时候 PDF 不是正版书籍的时候，还会出现一些广告内容以及和书本身内容无关的干扰信息。

:::tip 摘要

这些都应该去掉

:::



