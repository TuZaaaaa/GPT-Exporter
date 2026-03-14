const statusNode = document.getElementById("status");
const exportButton = document.getElementById("exportButton");

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.style.color = isError ? "#8c2f1c" : "#4a4037";
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function requestConversationFromTab(tabId) {
  return chrome.tabs.sendMessage(tabId, { type: "GPT_EXPORTER_EXTRACT" });
}

async function openPrintView() {
  const url = chrome.runtime.getURL("export.html?autoprint=1");
  await chrome.tabs.create({ url });
}

exportButton.addEventListener("click", async () => {
  exportButton.disabled = true;
  setStatus("正在提取聊天内容...");

  try {
    const tab = await getActiveTab();

    if (!tab?.id || !tab.url) {
      throw new Error("未找到活动标签页。");
    }

    if (!/^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(tab.url)) {
      throw new Error("请先打开 ChatGPT 聊天页面。");
    }

    const payload = await requestConversationFromTab(tab.id);

    if (!payload?.ok) {
      throw new Error(payload?.error || "未能读取当前页面中的聊天记录。");
    }

    await chrome.storage.local.set({
      lastExport: {
        ...payload.data,
        exportedAt: new Date().toISOString()
      }
    });

    setStatus("已生成打印页，正在打开...");
    await openPrintView();
    window.close();
  } catch (error) {
    setStatus(error.message || "导出失败。", true);
    exportButton.disabled = false;
  }
});
