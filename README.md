# GPT Exporter

GPT Exporter 是一个 Chrome Manifest V3 扩展，用于将 ChatGPT 当前会话导出为适合打印和保存的 PDF。

## Features

- Export the current ChatGPT conversation as a printable PDF
- Preserve common rich-text structures such as paragraphs, lists, code blocks, quotes, and tables
- Open a dedicated print view before export for cleaner layout and pagination
- Run entirely in the browser without uploading conversation content

## Installation

1. Download or clone this repository to your local machine
2. Open Chrome and go to `chrome://extensions`
3. Enable `Developer mode`
4. Click `Load unpacked`
5. Select the project folder

## Usage

1. Open a conversation on `chatgpt.com` or `chat.openai.com`
2. Click the `GPT Exporter` extension icon
3. Click `导出为 PDF`
4. In the print dialog, choose `Save as PDF`

## Notes

- The exporter reads the current ChatGPT page DOM, so selector updates may be needed if the ChatGPT UI changes
- All processing happens locally in the browser
