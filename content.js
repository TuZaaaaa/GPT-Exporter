(function () {
  const MESSAGE_SELECTORS = [
    "[data-message-author-role]",
    "[data-testid^='conversation-turn-']",
    "article"
  ];

  function cleanTitle(rawTitle) {
    const title = (rawTitle || "").replace(/\s*[-|·]\s*ChatGPT\s*$/i, "").trim();
    if (!title || /^chatgpt$/i.test(title)) {
      return "";
    }

    return title;
  }

  function collectCandidateNodes() {
    const seen = new Set();
    const candidates = [];

    for (const selector of MESSAGE_SELECTORS) {
      document.querySelectorAll(selector).forEach((node) => {
        if (seen.has(node)) {
          return;
        }

        seen.add(node);
        candidates.push(node);
      });
    }

    return candidates;
  }

  function detectRole(node, text) {
    const role = node.getAttribute("data-message-author-role");
    if (role === "user" || role === "assistant" || role === "system") {
      return role;
    }

    const ariaLabel = `${node.getAttribute("aria-label") || ""} ${node.className || ""}`.toLowerCase();
    if (ariaLabel.includes("assistant")) {
      return "assistant";
    }

    if (ariaLabel.includes("user")) {
      return "user";
    }

    const lowerText = (text || "").trim().toLowerCase();
    if (lowerText.startsWith("you said")) {
      return "user";
    }

    return "assistant";
  }

  function stripJunk(container) {
    container.querySelectorAll("button, textarea, form, nav, svg, img[alt='User'], img[alt='Assistant']").forEach((node) => {
      node.remove();
    });

    container.querySelectorAll("[data-testid='copy-turn-action-button']").forEach((node) => {
      node.remove();
    });

    return container;
  }

  function findContentRoot(node) {
    return (
      node.querySelector(".markdown") ||
      node.querySelector("[class*='markdown']") ||
      node.querySelector("pre") ||
      node.querySelector(".whitespace-pre-wrap") ||
      node
    );
  }

  function buildMessage(node) {
    const contentRoot = findContentRoot(node);
    const clone = stripJunk(contentRoot.cloneNode(true));
    const text = clone.innerText?.replace(/\n{3,}/g, "\n\n").trim() || "";

    if (!text) {
      return null;
    }

    return {
      role: detectRole(node, text),
      text,
      html: clone.innerHTML
    };
  }

  function extractConversation() {
    const messages = [];
    const seenKeys = new Set();

    for (const node of collectCandidateNodes()) {
      const message = buildMessage(node);
      if (!message) {
        continue;
      }

      const key = `${message.role}:${message.text}`;
      if (seenKeys.has(key)) {
        continue;
      }

      seenKeys.add(key);
      messages.push(message);
    }

    if (!messages.length) {
      throw new Error("页面中没有找到可导出的聊天消息。请确认当前页面已加载完成。");
    }

    const firstUserMessage = messages.find((item) => item.role === "user");
    const fallbackTitle = firstUserMessage?.text?.slice(0, 60) || "ChatGPT Conversation";

    return {
      title: cleanTitle(document.title) || fallbackTitle,
      url: location.href,
      extractedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "GPT_EXPORTER_EXTRACT") {
      return;
    }

    try {
      sendResponse({
        ok: true,
        data: extractConversation()
      });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error.message || "提取聊天失败。"
      });
    }

    return true;
  });
})();
