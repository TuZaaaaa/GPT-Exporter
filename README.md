# GPT Exporter

一个本地加载的 Chrome Manifest V3 插件，用于把 ChatGPT 当前聊天页面导出为适合打印的 PDF 视图。

## 功能

- 从 `chatgpt.com` 或 `chat.openai.com` 当前聊天页面提取消息
- 保留常见富文本结构：段落、列表、代码块、引用、表格
- 打开单独的打印页，并调用浏览器打印功能
- 使用 Chrome 的“保存为 PDF”完成导出

## 安装

1. 打开 Chrome，进入 `chrome://extensions`
2. 打开右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择目录 `/Volumes/Code/project/i/GPT-Exporter`

## 使用

1. 打开一个 ChatGPT 聊天页面
2. 点击浏览器工具栏中的 `GPT Exporter`
3. 点击“导出为 PDF”
4. 在打开的打印页面中选择“保存为 PDF”

## 说明

- 当前实现基于页面 DOM 提取消息，因此依赖 ChatGPT 页面结构；如果 OpenAI 后续改版，选择器可能需要调整
- 插件不会上传聊天内容，所有处理都在本地浏览器中完成
