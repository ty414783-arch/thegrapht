export const searchClientChunk = `      const formatSearchTime = (value) => {
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

      const getChatSearchResultAvatarMarkup = (message) => {
        if (currentDialogSnapshot?.type === "saved") {
          return getChatSearchContextAvatarMarkup();
        }

        const avatar = getAvatarMeta(message.senderId || message.senderName, message.senderName || "?");
        return '<div class="chat-search-result-avatar" style="' + avatar.style + '"><img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" /></div>';
      };

      const getChatSearchResultName = (message) => {
        if (currentDialogSnapshot?.type === "saved") {
          return currentDialogSnapshot?.title || "Saved Messages";
        }

        return message.senderName || currentDialogSnapshot?.title || "TheGraphT";
      };

      const setChatSearchPanelOpen = (isOpen) => {
        if (isOpen) {
          closeChatProfilePanel();
        }
        chatWindow.classList.toggle("search-open", isOpen);
        chatSearchPanel.classList.toggle("open", isOpen);
        chatSearchPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
        chatSearchToggle.classList.toggle("active", isOpen);

        if (!isOpen) {
          chatSearchQuery = "";
          chatSearchInput.value = "";
          chatSearchResults.innerHTML = "";
          return;
        }

        chatSearchAvatar.innerHTML = getChatSearchContextAvatarMarkup();
        chatSearchAvatar.style.cssText = "";
        requestAnimationFrame(() => {
          chatSearchInput.focus();
          chatSearchInput.select();
        });
      };

      const closeChatSearch = () => {
        setChatSearchPanelOpen(false);
      };

      const renderChatSearchResults = () => {
        const query = chatSearchQuery.trim().toLowerCase();

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

            const target = messageList.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');
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

            chatSearchHighlightTimer = window.setTimeout(() => {
              highlightNode.classList.remove("message-search-hit");
              void highlightNode.offsetWidth;
              highlightNode.classList.add("message-search-hit");

              chatSearchHighlightTimer = window.setTimeout(() => {
                highlightNode.classList.remove("message-search-hit");
              }, 1450);
            }, 520);
          });
        });
      };

      const syncChatIslandActions = () => {
        const hasDialog = Boolean(currentDialogSnapshot);
        chatSearchToggle.hidden = !hasDialog;
        chatCallButton.hidden = !hasDialog || currentDialogSnapshot?.type !== "direct";
        if (!hasDialog) {
          closeChatSearch();
        }
      };

`;
