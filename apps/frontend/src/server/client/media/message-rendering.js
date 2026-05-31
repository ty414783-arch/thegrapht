export const messageRendering = () => `

      const getMessageStatusMarkup = (message, isOutgoing) => {
        if (!isOutgoing) {
          return "";
        }

        if (message.localStatus === "pending") {
          return '<span class="message-state" aria-label="Pending">' + pendingClockIcon + '</span>';
        }

        if (message.localStatus === "failed") {
          return '<span class="message-state" aria-label="Failed">!</span>';
        }

        const supportsPeerReadReceipts = Boolean(
          currentDialogSnapshot?.peerUserId
          && ["direct", "private", "secret"].includes(currentDialogSnapshot?.type)
        );

        if (supportsPeerReadReceipts) {
          const messageTimestamp = new Date(message.createdAt).getTime();
          const peerReadTimestamp = currentPeerReadAt ? new Date(currentPeerReadAt).getTime() : 0;
          const isReadByPeer = Number.isFinite(peerReadTimestamp) && peerReadTimestamp > 0 && messageTimestamp <= peerReadTimestamp;
          return isReadByPeer
            ? '<span class="message-checks message-checks-double">' + doubleChecksIcon + '</span>'
            : '<span class="message-checks message-checks-single">' + singleCheckIcon + '</span>';
        }

        if (currentDialogSnapshot?.type === "group") {
          const messageTimestamp = new Date(message.createdAt).getTime();
          const groupReadTimestamp = currentPeerReadAt ? new Date(currentPeerReadAt).getTime() : 0;
          const isReadByAnyMember = Number.isFinite(groupReadTimestamp) && groupReadTimestamp > 0 && messageTimestamp <= groupReadTimestamp;
          return isReadByAnyMember
            ? '<span class="message-checks message-checks-double">' + doubleChecksIcon + '</span>'
            : '<span class="message-checks message-checks-single">' + singleCheckIcon + '</span>';
        }

        return '<span class="message-checks message-checks-double">' + doubleChecksIcon + '</span>';
      };

      const mediaUrlToBlobUrlCache = new Map();
      const registerMediaBlobUrl = (mediaUrl, blobUrl) => {
        if (!mediaUrl || !blobUrl) return;
        mediaUrlToBlobUrlCache.set(mediaUrl, blobUrl);
        if (mediaUrlToBlobUrlCache.size > 100) {
          const firstKey = mediaUrlToBlobUrlCache.keys().next().value;
          const firstVal = mediaUrlToBlobUrlCache.get(firstKey);
          if (firstVal && firstVal.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(firstVal);
            } catch {}
          }
          mediaUrlToBlobUrlCache.delete(firstKey);
        }
      };
      window.registerMediaBlobUrl = registerMediaBlobUrl;
      window.mediaUrlToBlobUrlCache = mediaUrlToBlobUrlCache;

      const resolvePublicMediaUrl = (rawUrl) => {
        var value = String(rawUrl || "").trim();
        if (!value) {
          return "";
        }
        if (typeof mediaUrlToBlobUrlCache !== "undefined" && mediaUrlToBlobUrlCache.has(value)) {
          return mediaUrlToBlobUrlCache.get(value);
        }
        if (value.startsWith("blob:") || value.startsWith("data:")) {
          return value;
        }
        if (value.startsWith("/v/")) {
          value = "https://cdn.thegrapht.su" + value;
        } else if (/^https?:\\/\\/web\\.thegrapht\\.su\\/v\\//i.test(value)) {
          value = value.replace(/^https?:\\/\\/web\\.thegrapht\\.su/i, "https://cdn.thegrapht.su");
        }
        if (typeof legacySessionToken !== "undefined" && legacySessionToken) {
          value = value + (value.indexOf("?") >= 0 ? "&" : "?") + "token=" + encodeURIComponent(legacySessionToken);
        }
        return value;
      };

      const resolveWebMediaUrlFallback = (rawUrl) => {
        var value = String(rawUrl || "").trim();
        if (!value) {
          return "";
        }
        if (value.startsWith("blob:") || value.startsWith("data:")) {
          return value;
        }
        var cleanUrl = value.split("?")[0];
        if (cleanUrl.startsWith("/v/")) {
          value = "https://web.thegrapht.su" + cleanUrl;
        } else if (/^https?:\\/\\/cdn\\.thegrapht\\.su\\/v\\//i.test(cleanUrl)) {
          value = cleanUrl.replace(/^https?:\\/\\/cdn\\.thegrapht\\.su/i, "https://web.thegrapht.su");
        } else {
          value = cleanUrl;
        }
        if (typeof legacySessionToken !== "undefined" && legacySessionToken) {
          value = value + (value.indexOf("?") >= 0 ? "&" : "?") + "token=" + encodeURIComponent(legacySessionToken);
        }
        return value;
      };

      const renderImageLinkHtml = (message, caption, senderName, extraClass = "") => {
        const publicMediaUrl = resolvePublicMediaUrl(message.mediaUrl);
        const fallbackMediaUrl = resolveWebMediaUrlFallback(message.mediaUrl);
        const isPending = message.localStatus === "pending";

        let spinnerMarkup = "";
        if (isPending) {
          spinnerMarkup =
            '<div class="m3-spinner-container">' +
              '<svg class="m3-spinner" viewBox="0 0 48 48">' +
                '<circle class="m3-spinner-track" cx="24" cy="24" r="18" fill="none" stroke-width="4"></circle>' +
                '<circle class="m3-spinner-active" cx="24" cy="24" r="18" fill="none" stroke-width="4" stroke-dasharray="113" stroke-dashoffset="56"></circle>' +
              '</svg>' +
            '</div>';
        }

        const shellClass = "message-image-shell" + (isPending ? " is-pending" : "");
        const imageClass = "message-image" + (isPending ? " message-image-pending" : "");

        return '<button class="message-image-link' + extraClass + '" type="button" data-image-url="' + escapeHtml(publicMediaUrl) + '" data-image-fallback-url="' + escapeHtml(fallbackMediaUrl) + '" data-sender-name="' + escapeHtml(senderName) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-created-at="' + escapeHtml(message.createdAt || "") + '">' +
          '<span class="' + shellClass + '"' + getImageShellStyle(message) + '>' +
            '<img class="' + imageClass + '" src="' + escapeHtml(publicMediaUrl) + '" data-fallback-src="' + escapeHtml(fallbackMediaUrl) + '" alt="' + escapeHtml(caption || "Photo") + '" loading="lazy" decoding="async" fetchpriority="low" />' +
            spinnerMarkup +
          '</span>' +
        '</button>';
      };

      const getAudioDisplayName = (message) => {
        const fromAttachment = String(message?.attachmentName || "").trim();
        if (fromAttachment) {
          return fromAttachment;
        }
        const fromBody = String(message?.body || "").trim();
        if (fromBody) {
          return fromBody;
        }
        return "Audio";
      };

      const formatAudioMetaLabel = (seconds, sizeBytes, options = {}) => {
        const durationLabel = formatDuration(Number(seconds) || 0);
        const sizeLabel = formatBytes(Number(sizeBytes) || 0);
        const currentTimeLabel = String(options.currentTimeLabel || "").trim();

        if (currentTimeLabel && sizeLabel) {
          return currentTimeLabel + " • " + sizeLabel;
        }
        if (currentTimeLabel) {
          return currentTimeLabel;
        }
        if (durationLabel && sizeLabel) {
          return durationLabel + " • " + sizeLabel;
        }
        if (durationLabel) {
          return durationLabel;
        }
        if (sizeLabel) {
          return sizeLabel;
        }
        return "Audio";
      };

      const renderAudioMessageHtml = (message) => {
        const publicMediaUrl = resolvePublicMediaUrl(message.mediaUrl);
        const fallbackMediaUrl = resolveWebMediaUrlFallback(message.mediaUrl);
        const displayName = getAudioDisplayName(message);
        const durationSeconds = Number(message?.attachmentDurationSeconds) || 0;
        const sizeBytes = Number(message?.attachmentSize) || 0;
        const metaLabel = formatAudioMetaLabel(durationSeconds, sizeBytes);
        const caption = String(message?.body || "").trim();

        const isActiveTrack = (
          activeAudioElement instanceof HTMLAudioElement
          && !activeAudioElement.paused
          && String(activeAudioMessageId || "") === String(message.id || "")
        );
        const toggleIcon = isActiveTrack ? "pause" : "play_arrow";
        return renderReplyPreviewHtml(message) + '<div class="message-audio-wrap">' +
          '<div class="tg-audio-message message-audio-card' + (isActiveTrack ? " is-playing" : "") + '" data-audio-card data-message-id="' + escapeHtml(message.id) + '" data-audio-duration="' + escapeHtml(String(durationSeconds)) + '" data-audio-size="' + escapeHtml(String(sizeBytes)) + '" title="' + escapeHtml(displayName) + '">' +
            '<button class="tg-audio-play message-audio-toggle" type="button" data-audio-toggle aria-label="Play audio">' +
              '<span class="tg-audio-icon material-symbols-rounded message-audio-toggle-icon" aria-hidden="true">' + toggleIcon + '</span>' +
            '</button>' +
            '<div class="tg-audio-content message-audio-main">' +
              '<div class="tg-audio-title message-audio-name" title="' + escapeHtml(displayName) + '">' + escapeHtml(displayName) + '</div>' +
              '<div class="tg-audio-meta-row">' +
                '<span class="tg-audio-time message-audio-meta-line" data-audio-meta title="' + escapeHtml(displayName) + '">' + escapeHtml(metaLabel) + '</span>' +
                '<div class="tg-audio-seek">' +
                  '<div class="tg-audio-seek-track"></div>' +
                  '<div class="tg-audio-seek-fill"></div>' +
                  '<div class="tg-audio-seek-thumb"></div>' +
                  '<input class="tg-audio-seek-input" type="range" min="0" max="' + escapeHtml(String(Math.max(1, durationSeconds || 1))) + '" step="0.01" value="0" data-audio-progress aria-label="Audio position" title="' + escapeHtml(displayName) + '" />' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<audio class="message-audio-element" preload="metadata" src="' + escapeHtml(publicMediaUrl) + '" data-fallback-src="' + escapeHtml(fallbackMediaUrl) + '"></audio>' +
          '</div>' +
          (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '') +
        '</div>';
      };

      const renderMessageBodyHtml = (message) => {
        const callMarker = parseCallSummaryMessage(message);
        if (
          currentDialogSnapshot?.type === "group"
          && callMarker
          && (callMarker.kind === "started_video" || callMarker.kind === "ended_video")
        ) {
          const actorName = String(message?.senderName || "Someone").trim() || "Someone";
          const durationLabel = (() => {
            const safe = Math.max(0, Math.floor(Number(callMarker.durationSeconds) || 0));
            if (safe < 60) {
              return safe + " seconds";
            }
            const m = Math.floor(safe / 60);
            const s = safe % 60;
            if (m < 60) {
              return m + " min " + s + " sec";
            }
            const h = Math.floor(m / 60);
            const mm = m % 60;
            return h + " h " + mm + " min";
          })();
          const line = callMarker.kind === "started_video"
            ? (actorName + " started a video chat")
            : (actorName + " ended the video chat (" + durationLabel + ")");
          return '<div class="message-group-video-event">' + escapeHtml(line) + '</div>';
        }

        const callSummary = getCallSummaryPresentation(message);

        if (callSummary) {
          return '<div class="message-call-card ' + callSummary.tone + '">' +
            '<span class="material-symbols-rounded message-call-icon" aria-hidden="true">' + escapeHtml(callSummary.icon) + '</span>' +
            '<div class="message-call-copy">' +
              '<div class="message-call-title">' + escapeHtml(callSummary.title) + '</div>' +
              '<div class="message-call-subtitle">' + escapeHtml(callSummary.subtitle) + '</div>' +
            '</div>' +
          '</div>';
        }

        if (message?.type === "image" && message.mediaUrl) {
          const caption = String(message.body || "").trim();
          const senderName = String(message.senderName || (message.senderId === currentUserId ? workspaceUserName.textContent : "TheGraphT"));
          return renderReplyPreviewHtml(message) + '<div class="message-visual">' +
            renderImageLinkHtml(message, caption, senderName) +
            (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '') +
          '</div>';
        }

        if (message?.type === "audio" && message.mediaUrl) {
          return renderAudioMessageHtml(message);
        }

        return renderReplyPreviewHtml(message) + '<div class="message-body">' + linkifyMessageBody(message.body) + '</div>';
      };

      const renderDaySeparator = (value) => {
        const dayTs = startOfDayTs(value);
        const label = formatDaySeparatorLabel(value);
        if (!dayTs || !label) {
          return "";
        }
        return '<div class="message-day-separator" data-day-ts="' + escapeHtml(String(dayTs)) + '"><span>' + escapeHtml(label) + '</span></div>';
      };
      const getMessageEpochSeconds = (message) => {
        if (!message || typeof message !== "object") {
          return 0;
        }
        const tsMs = toEpochMs(message.createdAt || 0);
        if (!Number.isFinite(tsMs) || tsMs <= 0) {
          const rawDate = String(message.date || "").trim();
          if (!rawDate) {
            return 0;
          }
          const isNumericEpoch = /^\d{10,}$/.test(rawDate);
          const hasCalendarDate = /\d{4}-\d{2}-\d{2}/.test(rawDate) || /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(rawDate);
          if (!isNumericEpoch && !hasCalendarDate) {
            return 0;
          }
          const dateMs = toEpochMs(rawDate);
          if (!Number.isFinite(dateMs) || dateMs <= 0) {
            return 0;
          }
          return Math.floor(dateMs / 1000);
        }
        return Math.floor(tsMs / 1000);
      };
      const isNewDay = (prevMsg, nextMsg) => {
        const prevSec = getMessageEpochSeconds(prevMsg);
        const nextSec = getMessageEpochSeconds(nextMsg);
        if (!prevSec || !nextSec) {
          return true;
        }
        return new Date(prevSec * 1000).toDateString() !== new Date(nextSec * 1000).toDateString();
      };
      const debugDaySeparators = (stage, payload = {}) => {
        try {
          const isDirect = currentDialogSnapshot?.type === "direct" || currentDialogSnapshot?.type === "private";
          if (!isDirect) {
            return;
          }
          console.log("[TG_DAY_DEBUG]", stage, {
            dialogPublicId: currentDialogSnapshot?.publicId || null,
            dialogType: currentDialogSnapshot?.type || null,
            ...payload
          });
        } catch {}
      };
      const sortMessagesChronologically = (messages) => {
        if (!Array.isArray(messages) || messages.length <= 1) {
          return Array.isArray(messages) ? messages.slice() : [];
        }

        return messages.slice().sort((left, right) => {
          const leftTs = getMessageEpochSeconds(left);
          const rightTs = getMessageEpochSeconds(right);
          if (leftTs !== rightTs) {
            return leftTs - rightTs;
          }

          return String(left?.id || "").localeCompare(String(right?.id || ""));
        });
      };
      const getMessageDayValue = (message) => {
        const messageEpochSeconds = getMessageEpochSeconds(message);
        if (messageEpochSeconds > 0) {
          return messageEpochSeconds * 1000;
        }
        return message?.createdAt || Date.now();
      };
      const isSameDay = (leftValue, rightValue) => {
        const leftDate = new Date(leftValue || 0);
        const rightDate = new Date(rightValue || 0);
        if (!Number.isFinite(leftDate.getTime()) || !Number.isFinite(rightDate.getTime())) {
          return false;
        }
        return leftDate.toDateString() === rightDate.toDateString();
      };
      const normalizeMessageDaySeparators = () => {
        if (!messageList) {
          return;
        }

        const nodes = Array.from(messageList.children);
        const seenDayTs = new Set();
        let activeSeparator = null;
        let activeSeparatorHasMessage = false;

        const isRenderableMessageNode = (node) => (
          node instanceof HTMLElement
          && (
            node.classList.contains("message")
            || node.classList.contains("message-system-row")
            || node.classList.contains("group-incoming-row")
          )
        );

        nodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          if (node.classList.contains("message-day-separator")) {
            if (activeSeparator && !activeSeparatorHasMessage) {
              activeSeparator.remove();
            }

            const dayTs = String(node.dataset.dayTs || "");
            if (!dayTs || seenDayTs.has(dayTs)) {
              node.remove();
              activeSeparator = null;
              activeSeparatorHasMessage = false;
              return;
            }

            seenDayTs.add(dayTs);
            activeSeparator = node;
            activeSeparatorHasMessage = false;
            return;
          }

          if (activeSeparator && isRenderableMessageNode(node)) {
            activeSeparatorHasMessage = true;
          }
        });

        if (activeSeparator && !activeSeparatorHasMessage) {
          activeSeparator.remove();
        }

        const messageById = new Map();
        currentMessagesSnapshot.forEach((entry) => {
          const id = String(entry?.id || "");
          if (id) {
            messageById.set(id, entry);
          }
        });
        getLocalMessagesForDialog(currentDialogPublicId).forEach((entry) => {
          const id = String(entry?.id || "");
          if (id && !messageById.has(id)) {
            messageById.set(id, entry);
          }
        });

        const createSeparatorNode = (dayValue) => {
          const separatorContainer = document.createElement("div");
          separatorContainer.innerHTML = renderDaySeparator(dayValue);
          return separatorContainer.firstElementChild instanceof HTMLElement
            ? separatorContainer.firstElementChild
            : null;
        };

        let lastRenderableDayTs = "";
        Array.from(messageList.children).forEach((node) => {
          if (!isRenderableMessageNode(node)) {
            return;
          }

          const messageId = String(node.getAttribute("data-message-id") || "");
          const linkedMessage = messageId ? messageById.get(messageId) : null;
          const dayValue = linkedMessage ? getMessageDayValue(linkedMessage) : null;
          const dayTs = dayValue ? String(startOfDayTs(dayValue) || "") : "";
          if (!dayTs) {
            return;
          }

          const shouldStartNewDayBlock = dayTs !== lastRenderableDayTs;
          if (shouldStartNewDayBlock) {
            const previous = node.previousElementSibling;
            const hasProperSeparator = (
              previous instanceof HTMLElement
              && previous.classList.contains("message-day-separator")
              && String(previous.getAttribute("data-day-ts") || "") === dayTs
            );

            if (!hasProperSeparator) {
              const separatorNode = createSeparatorNode(dayValue);
              if (separatorNode) {
                messageList.insertBefore(separatorNode, node);
              }
            }
          }

          lastRenderableDayTs = dayTs;
        });
      };

      const hideScrollDayIndicator = () => {};
      const updateScrollDayIndicator = () => {};

      const buildRenderableMessageItems = (messages) => {
        const items = [];
        let previousRenderableMessage = null;
        const orderedMessages = sortMessagesChronologically(messages);
        const dayBuckets = [];
        const seenDayBuckets = new Set();

        debugDaySeparators("build_start", {
          inputCount: Array.isArray(messages) ? messages.length : 0,
          orderedCount: orderedMessages.length,
          sample: orderedMessages.slice(0, 5).map((msg) => ({
            id: msg?.id || null,
            date: msg?.date ?? null,
            createdAt: msg?.createdAt || null,
            epochSec: getMessageEpochSeconds(msg)
          }))
        });

        for (let index = 0; index < orderedMessages.length; index += 1) {
          const message = orderedMessages[index];
          if (!message || isMessageDeletedLocally(String(message.id || ""))) {
            continue;
          }
          if (!previousRenderableMessage || isNewDay(previousRenderableMessage, message)) {
            const dayBucketTs = startOfDayTs(getMessageDayValue(message));
            if (dayBucketTs && !seenDayBuckets.has(dayBucketTs)) {
              seenDayBuckets.add(dayBucketTs);
              dayBuckets.push(new Date(dayBucketTs).toISOString().slice(0, 10));
            }
            items.push({
              kind: "day",
              dayValue: getMessageDayValue(message)
            });
          }

          if (message?.type === "image" && message.albumId) {
            const albumMessages = [message];
            let cursor = index + 1;

            while (cursor < orderedMessages.length) {
              const candidate = orderedMessages[cursor];

              if (
                candidate?.type === "image"
                && candidate.albumId === message.albumId
                && candidate.senderId === message.senderId
              ) {
                albumMessages.push(candidate);
                cursor += 1;
                continue;
              }

              break;
            }

            // Split albums into chunks of 5
            for (let i = 0; i < albumMessages.length; i += 5) {
              items.push({
                kind: "album",
                messages: albumMessages.slice(i, i + 5)
              });
            }

            index = cursor - 1;
            previousRenderableMessage = albumMessages[albumMessages.length - 1] || message;
            continue;
          }

          items.push({
            kind: "message",
            messages: [message]
          });
          previousRenderableMessage = message;
        }

        debugDaySeparators("build_done", {
          itemCount: items.length,
          dayItemCount: items.filter((item) => item?.kind === "day").length,
          dayBuckets
        });

        return items;
      };

      const GROUP_SENDER_NAME_COLORS = [
        "#d49b84",
        "#85b6e2",
        "#8fc7a0",
        "#cfb07a",
        "#b6a2db",
        "#cf9fba",
        "#7fbdb8",
        "#9cb6dc",
        "#d4ae8e",
        "#8fb7d6",
        "#9bc3a6",
        "#c4a0d4"
      ];

      const getStableSenderColor = (senderId, senderName = "") => {
        const seed = String(senderId || senderName || "sender");
        let hash = 0;
        for (let i = 0; i < seed.length; i += 1) {
          hash = ((hash << 5) - hash) + seed.charCodeAt(i);
          hash |= 0;
        }
        const index = Math.abs(hash) % GROUP_SENDER_NAME_COLORS.length;
        return GROUP_SENDER_NAME_COLORS[index];
      };

      const getRenderableItemTailMessage = (item) => {
        if (!item || !Array.isArray(item.messages) || !item.messages.length) {
          return null;
        }
        return item.messages[item.messages.length - 1] || null;
      };

      const annotateGroupIncomingSequences = (items) => {
        if (!Array.isArray(items) || !items.length) {
          return items;
        }

        const isGroupDialog = currentDialogSnapshot?.type === "group";
        if (!isGroupDialog) {
          return items;
        }

        for (let index = 0; index < items.length; index += 1) {
          const item = items[index];
          if (!item || (item.kind !== "message" && item.kind !== "album")) {
            continue;
          }

          const tailMessage = getRenderableItemTailMessage(item);
          const isOutgoing = tailMessage?.senderId === currentUserId || Boolean(tailMessage?.localStatus);
          const senderId = String(tailMessage?.senderId || "");
          if (!tailMessage || isOutgoing || !senderId) {
            item.groupIncomingMeta = null;
            continue;
          }

          item.groupIncomingMeta = {
            showName: true,
            showAvatar: true
          };
        }

        try {
          const incomingWithMeta = items.filter((item) => Boolean(item?.groupIncomingMeta)).length;
          console.log("[TheGraphT UI DEBUG] annotateGroupIncomingSequences", {
            ts: Date.now(),
            dialogPublicId: currentDialogSnapshot?.publicId || null,
            dialogType: currentDialogSnapshot?.type || null,
            totalItems: items.length,
            incomingWithMeta
          });
        } catch {}
        return items;
      };

      const renderGroupIncomingMessageShell = (message, contentHtml, meta = null) => {
        const senderName = String(message?.senderName || "Member").trim() || "Member";
        const senderId = String(message?.senderId || "");
        const avatar = getAvatarMeta(senderId || senderName, senderName);
        const senderColor = getStableSenderColor(senderId, senderName);
        const showAvatar = Boolean(meta?.showAvatar);
        const showName = Boolean(meta?.showName);
        const rowClass = showAvatar ? "group-incoming-row has-avatar" : "group-incoming-row no-avatar";
        const avatarClass = "group-incoming-avatar visible";

        return '<div class="' + rowClass + '">' +
          (showAvatar
            ? '<div class="' + avatarClass + '" style="' + avatar.style + '">' +
                '<div class="group-incoming-avatar-hit" data-sender-id="' + escapeHtml(senderId) + '" role="button" tabindex="0" aria-label="Open direct chat">' +
                '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + escapeHtml(avatar.letter || "?") + '" />' +
                '</div>' +
              '</div>'
            : ''
          ) +
          '<div class="group-incoming-main">' +
            (showName ? '<div class="group-incoming-sender" style="color:' + escapeHtml(senderColor) + '">' + escapeHtml(senderName) + '</div>' : '') +
            contentHtml +
          '</div>' +
        '</div>';
      };

      const renderAlbumMessage = (albumMessages, options = {}) => {
        const leadMessage = albumMessages[0];
        const tailMessage = albumMessages[albumMessages.length - 1];
        const isOutgoing = tailMessage.senderId === currentUserId || tailMessage.localStatus;
        const date = new Date(tailMessage.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const localStatusClass = tailMessage.localStatus ? ' message-status-' + tailMessage.localStatus : "";
        const shouldLaunch = Boolean(tailMessage.animateOnRender);
        if (shouldLaunch) {
          tailMessage.animateOnRender = false;
        }
        const launchClass = shouldLaunch ? " message-launch" : "";
        const senderName = String(leadMessage.senderName || (leadMessage.senderId === currentUserId ? workspaceUserName.textContent : "TheGraphT"));
        const caption = String(leadMessage.body || "").trim();

        const articleHtml = '<article class="message' + (isOutgoing ? "" : " incoming") + localStatusClass + launchClass + '" data-message-id="' + escapeHtml(tailMessage.id) + '" data-sender-id="' + escapeHtml(tailMessage.senderId || "") + '" data-message-type="' + escapeHtml(tailMessage.type || "text") + '" data-attachment-name="' + escapeHtml(tailMessage.attachmentName || "") + '" data-media-url="' + escapeHtml(tailMessage.mediaUrl || "") + '">' +
          renderReplyPreviewHtml(leadMessage) +
          '<div class="message-visual">' +
            '<div class="message-album count-' + albumMessages.length + '">' +
              albumMessages.map((message) => {
                const tileCaption = String(message.body || "").trim() || caption;
                return '<div class="message-album-item" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' + renderImageLinkHtml(message, tileCaption, senderName) + '</div>';
              }).join("") +
            '</div>' +
            (caption ? '<div class="message-body message-caption">' + linkifyMessageBody(caption) + '</div>' : '') +
          '</div>' +
          '<div class="message-meta"><span>' + date + '</span>' + getMessageStatusMarkup(tailMessage, isOutgoing) + '</div>' +
        '</article>';

        if (!isOutgoing && currentDialogSnapshot?.type === "group") {
          return renderGroupIncomingMessageShell(tailMessage, articleHtml, options.groupIncomingMeta);
        }
        return articleHtml;
      };

      const renderSingleMessage = (message, options = {}) => {
        const callMarker = parseCallSummaryMessage(message);
        if (
          currentDialogSnapshot?.type === "group"
          && callMarker
          && (callMarker.kind === "started_video" || callMarker.kind === "ended_video")
        ) {
          const groupName = String(currentDialogSnapshot?.title || "Group").trim() || "Group";
          const plural = (count, one, many) => (count === 1 ? one : many);
          const durationLabel = (() => {
            const safe = Math.max(0, Math.floor(Number(callMarker.durationSeconds) || 0));
            if (safe < 60) {
              return safe + " " + plural(safe, "second", "seconds");
            }
            const m = Math.floor(safe / 60);
            const s = safe % 60;
            if (m < 60) {
              return m + " " + plural(m, "minute", "minutes") + ", " + s + " " + plural(s, "second", "seconds");
            }
            const h = Math.floor(m / 60);
            const mm = m % 60;
            return h + " " + plural(h, "hour", "hours") + ", " + mm + " " + plural(mm, "minute", "minutes");
          })();
          const line = callMarker.kind === "started_video"
            ? (groupName + " started a video chat")
            : (groupName + " ended the video chat (" + durationLabel + ")");
          const shouldLaunch = Boolean(message.animateOnRender);
          if (shouldLaunch) {
            message.animateOnRender = false;
          }
          return '<div class="message-system-row' + (shouldLaunch ? " message-launch" : "") + '" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' +
            '<div class="message-system-pill">' + escapeHtml(line) + '</div>' +
          '</div>';
        }

        const isOutgoing = message.senderId === currentUserId || message.localStatus;
        const date = new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const localStatusClass = message.localStatus ? ' message-status-' + message.localStatus : "";
        const shouldLaunch = Boolean(message.animateOnRender);
        if (shouldLaunch) {
          message.animateOnRender = false;
        }
        const launchClass = shouldLaunch ? " message-launch" : "";
        const mediaClass = ((message.type === "image" && !message.albumId) || message.type === "audio") ? " message-media" : "";
        const articleHtml = '<article class="message' + mediaClass + (isOutgoing ? "" : " incoming") + localStatusClass + launchClass + '" data-message-id="' + escapeHtml(message.id) + '" data-sender-id="' + escapeHtml(message.senderId || "") + '" data-message-type="' + escapeHtml(message.type || "text") + '" data-attachment-name="' + escapeHtml(message.attachmentName || "") + '" data-media-url="' + escapeHtml(message.mediaUrl || "") + '">' +
          renderMessageBodyHtml(message) +
          '<div class="message-meta"><span>' + date + '</span>' + getMessageStatusMarkup(message, isOutgoing) + '</div>' +
        '</article>';
        if (!isOutgoing && currentDialogSnapshot?.type === "group") {
          return renderGroupIncomingMessageShell(message, articleHtml, options.groupIncomingMeta);
        }
        return articleHtml;
      };

      function appendRenderableItemsToMessageList(items, options = {}) {
        if (!Array.isArray(items) || !items.length) {
          return false;
        }

        const normalizedItems = annotateGroupIncomingSequences(items);
        const html = normalizedItems.map((item) => (
          item.kind === "day"
            ? renderDaySeparator(item.dayValue)
            : item.kind === "album"
              ? renderAlbumMessage(item.messages, { groupIncomingMeta: item.groupIncomingMeta })
              : renderSingleMessage(item.messages[0], { groupIncomingMeta: item.groupIncomingMeta })
        )).join("");

        if (!html) {
          return false;
        }

        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = html;
        const nodes = Array.from(tempContainer.children);
        if (!nodes.length) {
          return false;
        }

        let hadReplacement = false;
        if (options.replaceMessageId) {
          const selector = '[data-message-id="' + CSS.escape(String(options.replaceMessageId)) + '"]';
          const previousNode = messageList.querySelector(selector);
          hadReplacement = Boolean(previousNode);
          if (previousNode && nodes.length > 0) {
            const primaryNewNode = nodes.shift();
            previousNode.replaceWith(primaryNewNode);
          } else {
            previousNode?.remove();
          }
        }

        const dedupedNodes = nodes.filter((node) => {
          const messageId = node.getAttribute("data-message-id");
          if (!messageId) {
            return true;
          }
          const selector = '[data-message-id="' + CSS.escape(String(messageId)) + '"]';
          return !messageList.querySelector(selector);
        });

        if (!dedupedNodes.length) {
          if (hadReplacement) {
            renderMessages(currentDialogSnapshot, currentMessagesSnapshot, {
              scrollBehavior: "none",
              animateList: false,
              restoreScrollTop: messageList?.scrollTop || 0
            });
          }
          return hadReplacement;
        }

        const firstIncomingDayNode = dedupedNodes.find((node) => (
          node instanceof HTMLElement && node.classList.contains("message-day-separator")
        ));
        const existingDayNodes = messageList.querySelectorAll(".message-day-separator[data-day-ts]");
        const lastExistingDayNode = existingDayNodes.length ? existingDayNodes[existingDayNodes.length - 1] : null;
        if (firstIncomingDayNode && lastExistingDayNode instanceof HTMLElement) {
          const incomingTs = String(firstIncomingDayNode.getAttribute("data-day-ts") || "");
          const existingTs = String(lastExistingDayNode.getAttribute("data-day-ts") || "");
          if (incomingTs && existingTs && incomingTs === existingTs) {
            firstIncomingDayNode.remove();
          }
        }

        const fragment = document.createDocumentFragment();
        dedupedNodes.filter(Boolean).forEach((node) => fragment.appendChild(node));
        messageList.appendChild(fragment);
        normalizeMessageDaySeparators();
        hydrateMessageImages({ lockToken: 0 });
        return true;
      }

      function appendLocalOutgoingMessageToCurrentDialog(localMessage, options = {}) {
        if (!currentDialogSnapshot || !localMessage || localMessage.dialogPublicId !== currentDialogSnapshot.publicId) {
          return false;
        }

        const emptyStateVisible = Boolean(
          messageList.querySelector(".empty-chat-state, .saved-empty-state, .direct-empty-state")
        );

        if (emptyStateVisible) {
          renderMessages(currentDialogSnapshot, currentMessagesSnapshot, {
            scrollBehavior: options.scrollBehavior || "auto",
            animateList: false,
            forceScrollBottom: Boolean(options.forceScrollBottom)
          });
          return true;
        }

        const appended = appendRenderableItemsToMessageList(buildRenderableMessageItems([localMessage]));
        if (!appended) {
          return false;
        }

        const applyComposerLaunchMotion = () => {
          const messageId = String(localMessage?.id || "");
          if (!messageId) {
            return;
          }
          const bubble = messageList.querySelector('[data-message-id="' + CSS.escape(messageId) + '"]');
          if (!(bubble instanceof HTMLElement) || !bubble.classList.contains("message")) {
            return;
          }
          bubble.classList.add("sending");
          requestAnimationFrame(() => {
            bubble.classList.add("shown");
          });
        };

        requestAnimationFrame(applyComposerLaunchMotion);

        if (options.forceScrollBottom) {
          scrollMessagesToBottom(options.scrollBehavior || "auto");
        } else {
          syncChatScrollBottomButton();
        }

        return true;
      }

      function updateRenderedMessageStatus(messageId, status) {
        if (!messageId) {
          return;
        }

        const selector = '[data-message-id="' + CSS.escape(String(messageId)) + '"]';
        const node = messageList.querySelector(selector);
        if (!node) {
          return;
        }

        node.classList.remove("message-status-pending", "message-status-failed");
        if (status) {
          node.classList.add("message-status-" + status);
        }
      }

      const rerenderCurrentDialog = (options = {}) => {
        if (!currentDialogSnapshot) {
          return;
        }

        renderMessages(currentDialogSnapshot, currentMessagesSnapshot, options);
      };

      const refreshOutgoingReadReceiptsInPlace = () => {
        if (!currentDialogSnapshot || !currentDialogPublicId) {
          return;
        }

        const messagesById = new Map();
        currentMessagesSnapshot.forEach((message) => {
          if (message?.id) {
            messagesById.set(String(message.id), message);
          }
        });
        getLocalMessagesForDialog(currentDialogPublicId).forEach((message) => {
          if (message?.id) {
            messagesById.set(String(message.id), message);
          }
        });

        messageList.querySelectorAll(".message[data-message-id]").forEach((node) => {
          if (!(node instanceof HTMLElement) || node.classList.contains("incoming")) {
            return;
          }
          const messageId = node.getAttribute("data-message-id");
          if (!messageId) {
            return;
          }
          const message = messagesById.get(messageId);
          if (!message) {
            return;
          }

          const metaNode = node.querySelector(".message-meta");
          if (!(metaNode instanceof HTMLElement)) {
            return;
          }

          const nextStatusMarkup = getMessageStatusMarkup(message, true);
          const statusNode = metaNode.querySelector(".message-checks, .message-state");
          if (statusNode instanceof HTMLElement) {
            statusNode.outerHTML = nextStatusMarkup;
            return;
          }
          if (nextStatusMarkup) {
            metaNode.insertAdjacentHTML("beforeend", nextStatusMarkup);
          }
        });
      };

`;
