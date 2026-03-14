const titleNode = document.getElementById("conversationTitle");
const metaNode = document.getElementById("conversationMeta");
const messagesNode = document.getElementById("messages");
const messageTemplate = document.getElementById("messageTemplate");
const printButton = document.getElementById("printButton");

function formatRole(role) {
  switch (role) {
    case "user":
      return "User";
    case "assistant":
      return "Assistant";
    case "system":
      return "System";
    default:
      return "Message";
  }
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toLocaleString("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch (_error) {
    return value;
  }
}

function sanitizeHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html || ""}</div>`, "text/html");
  const allowedTags = new Set([
    "A",
    "B",
    "BLOCKQUOTE",
    "BR",
    "CODE",
    "DEL",
    "DIV",
    "EM",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "HR",
    "I",
    "LI",
    "OL",
    "P",
    "PRE",
    "SPAN",
    "STRONG",
    "TABLE",
    "TBODY",
    "TD",
    "TH",
    "THEAD",
    "TR",
    "UL"
  ]);

  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  const toRemove = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!allowedTags.has(node.tagName)) {
      toRemove.push(node);
      continue;
    }

    [...node.attributes].forEach((attribute) => {
      const isHref = node.tagName === "A" && attribute.name === "href";
      if (isHref) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noreferrer noopener");
        return;
      }

      node.removeAttribute(attribute.name);
    });
  }

  toRemove.forEach((node) => {
    node.replaceWith(...node.childNodes);
  });

  return doc.body.innerHTML;
}

function renderMessage(message) {
  const fragment = messageTemplate.content.cloneNode(true);
  const article = fragment.querySelector(".message");
  const roleNode = fragment.querySelector(".message-role");
  const bodyNode = fragment.querySelector(".message-body");

  article.dataset.role = message.role || "assistant";
  roleNode.textContent = formatRole(message.role);
  bodyNode.innerHTML = sanitizeHtml(message.html) || `<p>${message.text}</p>`;

  return fragment;
}

async function loadExportPayload() {
  const { lastExport } = await chrome.storage.local.get("lastExport");
  return lastExport;
}

function renderConversation(data) {
  titleNode.textContent = data.title || "ChatGPT Conversation";
  metaNode.textContent = `${data.messageCount} 条消息 · ${formatDate(data.exportedAt || data.extractedAt)}`;

  messagesNode.textContent = "";
  data.messages.forEach((message) => {
    messagesNode.appendChild(renderMessage(message));
  });
}

function shouldAutoPrint() {
  const params = new URLSearchParams(location.search);
  return params.get("autoprint") === "1";
}

printButton.addEventListener("click", () => {
  window.print();
});

(async function init() {
  const data = await loadExportPayload();

  if (!data?.messages?.length) {
    titleNode.textContent = "没有可用的导出内容";
    metaNode.textContent = "请返回 ChatGPT 页面，通过插件弹窗重新执行导出。";
    printButton.style.display = "none";
    return;
  }

  renderConversation(data);

  if (shouldAutoPrint()) {
    window.setTimeout(() => {
      window.print();
    }, 300);
  }
})();
