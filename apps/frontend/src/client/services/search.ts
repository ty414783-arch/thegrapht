export {};

declare const currentDialogSnapshot: any;
declare const getDialogAvatarMarkup: (dialog: any, options?: any) => string;
declare const getAvatarMeta: (idOrName: string, name: string) => { style: string; avatarUrl: string; letter: string };
declare const closeChatProfilePanel: () => void;
declare let chatSearchQuery: string;
declare const escapeHtml: (value: string) => string;
declare const getCurrentDialogMessages: () => any[];
declare let chatSearchHighlightTimer: any;

const getChatWindow = () => document.getElementById("chat-window") as HTMLElement;
const getChatSearchPanel = () => document.getElementById("chat-search-panel") as HTMLElement;
const getChatSearchToggle = () => document.getElementById("chat-search-toggle") as HTMLElement;
const getChatSearchInput = () => document.getElementById("chat-search-input") as HTMLInputElement;
const getChatSearchResults = () => document.getElementById("chat-search-results") as HTMLElement;
const getChatSearchAvatar = () => document.getElementById("chat-search-avatar") as HTMLElement;
const getChatGroupVideoButton = () => document.getElementById("chat-group-video-button") as HTMLElement;
const getChatCallButton = () => document.getElementById("chat-call-button") as HTMLElement;
const getMessageList = () => document.getElementById("message-list") as HTMLElement;

const formatSearchTime = (value: any) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getChatSearchContextAvatarMarkup = () => {
  if (!currentDialogSnapshot) {
    return "";
  }

  return getDialogAvatarMarkup(currentDialogSnapshot, {
    showPresence: false
  });
};

const getChatSearchResultAvatarMarkup = (message: any) => {
  if (currentDialogSnapshot?.type === "saved") {
    return getChatSearchContextAvatarMarkup();
  }

  const avatar = getAvatarMeta(message.senderId || message.senderName, message.senderName || "?");
  return '<div class="chat-search-result-avatar" style="' + avatar.style + '"><img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" /></div>';
};

const getChatSearchResultName = (message: any) => {
  if (currentDialogSnapshot?.type === "saved") {
    return currentDialogSnapshot?.title || "Saved Messages";
  }

  return message.senderName || currentDialogSnapshot?.title || "TheGraphT";
};

const setChatSearchPanelOpen = (isOpen: boolean) => {
  if (isOpen) {
    closeChatProfilePanel();
  }
  const chatWindow = getChatWindow();
  const chatSearchPanel = getChatSearchPanel();
  const chatSearchToggle = getChatSearchToggle();
  const chatSearchInput = getChatSearchInput();
  const chatSearchResults = getChatSearchResults();
  const chatSearchAvatar = getChatSearchAvatar();

  if (chatWindow) chatWindow.classList.toggle("search-open", isOpen);
  if (chatSearchPanel) {
    chatSearchPanel.classList.toggle("open", isOpen);
    chatSearchPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  }
  if (chatSearchToggle) chatSearchToggle.classList.toggle("active", isOpen);

  if (!isOpen) {
    (window as any).chatSearchQuery = "";
    if (chatSearchInput) chatSearchInput.value = "";
    if (chatSearchResults) chatSearchResults.innerHTML = "";
    return;
  }

  if (chatSearchAvatar) {
    chatSearchAvatar.innerHTML = getChatSearchContextAvatarMarkup();
    chatSearchAvatar.style.cssText = "";
  }
  requestAnimationFrame(() => {
    if (chatSearchInput) {
      chatSearchInput.focus();
      chatSearchInput.select();
    }
  });
};

const closeChatSearch = () => {
  setChatSearchPanelOpen(false);
};

const renderChatSearchResults = () => {
  const query = (chatSearchQuery || "").trim().toLowerCase();
  const chatSearchResults = getChatSearchResults();
  if (!chatSearchResults) return;

  if (!currentDialogSnapshot) {
    chatSearchResults.innerHTML = "";
    return;
  }

  if (!query) {
    chatSearchResults.innerHTML = '<div class="chat-search-empty">Type a word or phrase to search messages.</div>';
    return;
  }

  const matches = getCurrentDialogMessages().filter((message) => {
    const haystack = String(message.body || "").toLowerCase();
    return haystack.includes(query);
  }).slice().reverse();

  if (!matches.length) {
    chatSearchResults.innerHTML = '<div class="chat-search-empty">No results found.</div>';
    return;
  }

  chatSearchResults.innerHTML = matches.map((message) => {
    const body = String(message.body || "").trim() || (message.type === "image" ? "Photo" : "Message");
    return '<button class="chat-search-result" type="button" data-search-message-id="' + escapeHtml(message.id) + '">' +
      getChatSearchResultAvatarMarkup(message) +
      '<div class="chat-search-result-copy">' +
        '<div class="chat-search-result-line"><span class="chat-search-result-name">' + escapeHtml(getChatSearchResultName(message)) + '</span><span class="chat-search-result-time">' + escapeHtml(formatSearchTime(message.createdAt)) + '</span></div>' +
        '<div class="chat-search-result-text">' + escapeHtml(body) + '</div>' +
      '</div>' +
    '</button>';
  }).join("");

  chatSearchResults.querySelectorAll("[data-search-message-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const messageId = button.getAttribute("data-search-message-id");

      if (!messageId) {
        return;
      }

      const messageList = getMessageList();
      const target = messageList ? messageList.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]') : null;
      const highlightNode = target?.closest(".message") || target;

      if (!highlightNode) {
        return;
      }

      closeChatSearch();

      requestAnimationFrame(() => {
        highlightNode.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      });

      if (chatSearchHighlightTimer) {
        window.clearTimeout(chatSearchHighlightTimer);
      }

      const scrollHost = messageList;
      if (!scrollHost) return;
      let stableFrames = 0;
      let previousTop = scrollHost.scrollTop;
      const maxWaitMs = 1800;
      const startedAt = Date.now();

      const startSearchHighlight = () => {
        highlightNode.classList.remove("message-search-hit");
        void (highlightNode as HTMLElement).offsetWidth;
        highlightNode.classList.add("message-search-hit");

        (window as any).chatSearchHighlightTimer = window.setTimeout(() => {
          highlightNode.classList.remove("message-search-hit");
        }, 3200);
      };

      const waitForArrival = () => {
        const currentTop = scrollHost.scrollTop;
        const delta = Math.abs(currentTop - previousTop);
        previousTop = currentTop;
        stableFrames = delta < 1 ? stableFrames + 1 : 0;

        if (stableFrames >= 6 || Date.now() - startedAt > maxWaitMs) {
          startSearchHighlight();
          return;
        }

        window.requestAnimationFrame(waitForArrival);
      };

      window.requestAnimationFrame(waitForArrival);
    });
  });
};

const syncChatIslandActions = () => {
  const hasDialog = Boolean(currentDialogSnapshot);
  const chatSearchToggle = getChatSearchToggle();
  const chatGroupVideoButton = getChatGroupVideoButton();
  const chatCallButton = getChatCallButton();

  if (chatSearchToggle) chatSearchToggle.hidden = !hasDialog;
  if (chatGroupVideoButton) chatGroupVideoButton.hidden = !hasDialog || currentDialogSnapshot?.type !== "group";
  if (chatCallButton) chatCallButton.hidden = !hasDialog || currentDialogSnapshot?.type !== "direct";
  if (!hasDialog) {
    closeChatSearch();
  }
};

const initSearchEvents = () => {
  const chatSearchToggle = getChatSearchToggle();
  const chatSearchClose = document.getElementById("chat-search-close");
  const chatSearchInput = getChatSearchInput();
  const chatSearchBackdrop = document.getElementById("chat-search-backdrop");

  if (chatSearchToggle) {
    chatSearchToggle.addEventListener("click", () => {
      const chatSearchPanel = getChatSearchPanel();
      const isOpen = chatSearchPanel ? chatSearchPanel.classList.contains("open") : false;
      setChatSearchPanelOpen(!isOpen);
    });
  }

  if (chatSearchClose) {
    chatSearchClose.addEventListener("click", () => {
      closeChatSearch();
    });
  }

  if (chatSearchBackdrop) {
    chatSearchBackdrop.addEventListener("click", () => {
      closeChatSearch();
    });
  }

  if (chatSearchInput) {
    chatSearchInput.addEventListener("input", () => {
      (window as any).chatSearchQuery = chatSearchInput.value;
      renderChatSearchResults();
    });
  }
};

// Initialize listeners on DOMContentLoaded
if (document.readyState === "complete" || document.readyState === "interactive") {
  initSearchEvents();
} else {
  document.addEventListener("DOMContentLoaded", initSearchEvents);
}

// Bind to window for legacy access
(window as any).setChatSearchPanelOpen = setChatSearchPanelOpen;
(window as any).closeChatSearch = closeChatSearch;
(window as any).renderChatSearchResults = renderChatSearchResults;
(window as any).syncChatIslandActions = syncChatIslandActions;
