export const realtimeConnection = ({ wsBaseUrl, logoDataUrl }) => `
      const connectRealtime = () => {
        if (!realtimeEnabled || !isPrimaryActiveTab) {
          return;
        }

        if (realtimeSocket && (realtimeSocket.readyState === WebSocket.OPEN || realtimeSocket.readyState === WebSocket.CONNECTING)) {
          return;
        }

        const explicitWsBase = ${JSON.stringify(wsBaseUrl)};
        let wsUrl;

        if (explicitWsBase) {
          try {
            const resolvedWsUrl = new URL(explicitWsBase, window.location.href);
            const isPublicHost = /^(web\\.thegrapht\\.su|thegrapht\\.su|www\\.thegrapht\\.su)$/i.test(window.location.hostname || "");
            const isLoopbackWsHost = /^(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)$/i.test(resolvedWsUrl.hostname || "");

            wsUrl = isPublicHost && isLoopbackWsHost
              ? new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws")
              : resolvedWsUrl;
          } catch {
            wsUrl = new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws");
          }
        } else {
          wsUrl = new URL((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws");
        }

        wsInfo("connecting", {
          url: wsUrl.toString(),
          dialogId: currentDialogId || null
        });
        realtimeSocket = new WebSocket(wsUrl.toString());

        realtimeSocket.addEventListener("open", () => {
          if (realtimeReconnectTimer) {
            window.clearTimeout(realtimeReconnectTimer);
            realtimeReconnectTimer = null;
          }

          wsInfo("connected", {
            readyState: realtimeSocket?.readyState
          });
          touchRealtimeActivity();
          startRealtimeHealthChecks();
          sendCurrentPresence();
          if (typeof sendActiveState === "function") {
            sendActiveState(document.visibilityState === "visible");
          }
          if (isFirstRealtimeConnection) {
            isFirstRealtimeConnection = false;
            wsInfo("ws_open_initial_skip_reconcile");
          } else {
            void reconcileCurrentDialogMessages("ws_open_reconnect", { force: true });
          }
        });

        realtimeSocket.addEventListener("message", (event) => {
          touchRealtimeActivity();
          void (async () => {
            try {
              const payload = JSON.parse(event.data);
            wsInfo("message_received", {
              type: payload?.type || "unknown",
              dialogId: payload?.dialog?.id || payload?.dialogId || null,
              messageId: payload?.message?.id || payload?.messageId || null,
              callId: payload?.callId || null
            });
            if (payload.type === "pong") {
              return;
            }
            if (payload.type === "message_created") {
              const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.message ? [payload.message] : []);
              const preparedMessage = preparedPayload.messages[0] || payload.message;
              const preparedMessageId = String(preparedMessage?.id || "");
              if (preparedMessageId && isMessageDeletedLocally(preparedMessageId)) {
                wsInfo("message_created_skipped_tombstoned", {
                  messageId: preparedMessageId
                });
                return;
              }
              const nowTs = Date.now();
              if (preparedMessageId) {
                const seenAt = Number(realtimeMessageSeenAt.get(preparedMessageId) || 0);
                if (seenAt && (nowTs - seenAt) < 6000) {
                  wsInfo("message_created_duplicate_skipped", {
                    messageId: preparedMessageId,
                    ageMs: nowTs - seenAt
                  });
                  return;
                }
                realtimeMessageSeenAt.set(preparedMessageId, nowTs);
                if (realtimeMessageSeenAt.size > 1500) {
                  const threshold = nowTs - 10 * 60 * 1000;
                  realtimeMessageSeenAt.forEach((timestamp, key) => {
                    if (!timestamp || timestamp < threshold) {
                      realtimeMessageSeenAt.delete(key);
                    }
                  });
                }
              }
              if (preparedMessage?.decryptionFailed) {
                wsWarn("message_decryption_failed", {
                  dialogId: preparedPayload.dialog?.id || preparedPayload.dialog?.publicId || null,
                  messageId: preparedMessage.id || null,
                  senderId: preparedMessage.senderId || null
                });
              }
              const replaceLocalMessageId = preparedMessage?.senderId === currentUserId
                ? findMatchingPendingLocalMessageId(preparedPayload.dialog?.publicId || "", preparedMessage)
                : "";
              if (replaceLocalMessageId) {
                removeLocalOutgoingMessage(replaceLocalMessageId);
              }
              const preparedMessagePreview = String(getMessagePreviewText(preparedMessage) || "").trim();
              const existingDialog = allDialogs.find((dialog) => dialog.id === preparedPayload.dialog?.id) || null;
              const existingUnreadCount = Math.max(0, Number(existingDialog?.unreadCount) || 0);
              const isCurrentDialogMessage = preparedPayload.dialog?.id === currentDialogId;
              const isIncomingMessage = preparedMessage?.senderId !== currentUserId;
              const nextUnreadCount = isCurrentDialogMessage
                ? 0
                : (isIncomingMessage ? (existingUnreadCount + 1) : existingUnreadCount);
              const nextDialog = updateDialogInState(preparedPayload.dialog, {
                lastMessagePreview: preparedMessage?.decryptionFailed ? undefined : preparedMessagePreview,
                lastMessageSenderName: preparedMessage.senderId === currentUserId
                  ? "You"
                  : (preparedMessage.senderName || preparedPayload.dialog?.title || ""),
                lastMessageCreatedAt: preparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || "",
                unreadCount: nextUnreadCount
              });

              if (!currentSearchQuery.trim() && nextDialog) {
                renderDialogs(allDialogs);
              }

               if (preparedMessage?.senderId !== currentUserId) {
                void showIncomingDesktopNotification(preparedMessage, nextDialog || preparedPayload.dialog || null);
              }

              if (isCurrentDialogMessage && preparedMessage) {
                const isIncomingGroupMessage = Boolean(
                  preparedPayload.dialog?.type === "group"
                  && preparedMessage.senderId !== currentUserId
                );
                let messagePatch = {};
                if (
                  preparedMessage?.type === "image"
                  && !preparedMessage?.albumId
                  && preparedMessage?.mediaUrl
                ) {
                  if (!readCachedImageDimensions(preparedMessage.mediaUrl)) {
                    await measureImageUrl(preparedMessage.mediaUrl);
                  }
                  const incomingDimensions = readCachedImageDimensions(preparedMessage.mediaUrl);
                  if (incomingDimensions?.naturalWidth > 0 && incomingDimensions?.naturalHeight > 0) {
                    messagePatch = {
                      mediaNaturalWidth: incomingDimensions.naturalWidth,
                      mediaNaturalHeight: incomingDimensions.naturalHeight
                    };
                  }
                }
                appendConfirmedMessageToCurrentDialog(preparedPayload.dialog, preparedMessage, {
                  scrollBehavior: "smooth",
                  animateMessage: !replaceLocalMessageId,
                  replaceMessageId: replaceLocalMessageId,
                  forceScrollBottom: isIncomingGroupMessage,
                  messagePatch
                });
                if (currentDialogPublicId) {
                  void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/read", {
                    method: "POST"
                  }).catch(() => {});
                }
                void reconcileCurrentDialogMessages("message_created_current_dialog");
                return;
              }

              if (!nextDialog) {
                void loadWorkspace({ preserveRoute: true });
              }
            } else if (payload.type === "presence_snapshot") {
              onlineUserIds.clear();
              (payload.userIds || []).forEach((userId) => {
                if (typeof userId === "string" && userId) {
                  onlineUserIds.add(userId);
                }
              });
              syncVisibleDialogsRealtimeState();
              refreshCurrentDialogChrome();
            } else if (payload.type === "user_presence" && payload.userId) {
              applyPresenceStateToDialogs({
                userId: payload.userId,
                isOnline: Boolean(payload.isOnline),
                lastSeenAt: payload.lastSeenAt || null
              });
              syncVisibleDialogsRealtimeState();
              refreshCurrentDialogChrome();
            } else if (payload.type === "dialog_presence" && payload.dialogId === currentDialogId) {
              const nextPeerActive = Array.isArray(payload.activeUserIds)
                ? payload.activeUserIds.some((userId) => userId !== currentUserId)
                : false;
              if (peerActiveInCurrentDialog !== nextPeerActive) {
                peerActiveInCurrentDialog = nextPeerActive;
                refreshCurrentDialogChrome();
              }
            } else if (payload.type === "dialog_created" && payload.dialog?.publicId) {
              const createdDialog = payload.dialog;
              const upsertedDialog = updateDialogInState(createdDialog, {
                lastMessagePreview: createdDialog.lastMessagePreview || null,
                lastMessageSenderName: createdDialog.lastMessageSenderName || null,
                lastMessageCreatedAt: createdDialog.lastMessageCreatedAt || new Date().toISOString()
              });
              if (!upsertedDialog) {
                allDialogs.unshift(createdDialog);
              }
              if (!currentSearchQuery.trim()) {
                renderDialogs(allDialogs);
              }
              if (payload.actorUserId !== currentUserId) {
                const permission = await ensureNotificationPermission();
                if (permission === "granted" && isWindowInactive() && isNotificationOwner()) {
                  try {
                    const notification = new Notification("TheGraphT", {
                      body: "You were added to group " + String(createdDialog.title || "Group"),
                      icon: buildNotificationAvatarUrl(createdDialog, createdDialog.title || "Group"),
                      badge: ${JSON.stringify(logoDataUrl)},
                      tag: "group_added_" + String(createdDialog.publicId),
                      renotify: false
                    });
                    window.setTimeout(() => {
                      try { notification.close(); } catch {}
                    }, 8000);
                    notification.onclick = () => {
                      window.focus();
                      pendingDialogPublicIdFromNotification = createdDialog.publicId;
                      applyRoute(createdDialog.publicId);
                      void loadDialog(createdDialog.publicId, { scrollBehavior: "auto", forceReload: true });
                      notification.close();
                    };
                  } catch {}
                }
              }
            } else if (payload.type === "dialog_read" && payload.dialogId === currentDialogId && payload.userId !== currentUserId) {
              try {
                console.log("[TheGraphT UI DEBUG]", "ws:dialog_read", {
                  ts: Date.now(),
                  payloadDialogId: payload.dialogId,
                  currentDialogId,
                  payloadUserId: payload.userId,
                  currentUserId
                });
              } catch {}
              const nextPeerReadAt = payload.readAt || currentPeerReadAt;
              if (nextPeerReadAt !== currentPeerReadAt) {
                currentPeerReadAt = nextPeerReadAt;
                refreshOutgoingReadReceiptsInPlace();
              }
            } else if (payload.type === "message_deleted") {
              handleMessageDeletedEvent(payload);
            } else if (payload.type === "dialog_typing" && payload.dialogId && payload.userId && payload.userId !== currentUserId) {
              updateTypingState(payload.dialogId, payload.userId, Boolean(payload.isTyping));
            } else if (payload.type === "call_invite") {
              void handleCallInvite(payload);
            } else if (payload.type === "call_accept") {
              void handleCallAccept(payload);
            } else if (payload.type === "call_reject") {
              void handleCallReject(payload);
            } else if (payload.type === "call_end") {
              void handleCallEnd(payload);
            } else if (payload.type === "call_candidate") {
              void handleCallCandidate(payload);
            } else if (payload.type === "call_presence") {
              void handleCallPresence(payload);
            } else if (payload.type === "call_leave") {
              void handleCallLeave(payload);
            } else if (payload.type === "call_screen_state") {
              void handleCallScreenState(payload);
            } else if (payload.type === "call_mute_state") {
              if (typeof handleCallMuteState === "function") {
                handleCallMuteState(payload);
              }
            }
            } catch (error) {
              wsWarn("message_handler_failed", {
                error: error instanceof Error ? error.message : String(error)
              });
            }
          })();
        });

        realtimeSocket.addEventListener("close", (event) => {
          wsWarn("disconnected", {
            code: event?.code,
            reason: event?.reason || "",
            wasClean: Boolean(event?.wasClean),
            willReconnect: Boolean(realtimeEnabled)
          });
          if (realtimeHeartbeatTimer) {
            window.clearInterval(realtimeHeartbeatTimer);
            realtimeHeartbeatTimer = null;
          }
          if (realtimeWatchdogTimer) {
            window.clearInterval(realtimeWatchdogTimer);
            realtimeWatchdogTimer = null;
          }
          realtimeLastActivityAt = 0;
          realtimeSocket = null;
          onlineUserIds.clear();
          clearTypingIndicators();
          syncVisibleDialogsRealtimeState();
          refreshCurrentDialogChrome();
          if (realtimeEnabled) {
            wsInfo("reconnect_scheduled", {
              delayMs: 1200
            });
            realtimeReconnectTimer = window.setTimeout(() => connectRealtime(), 1200);
          }
        });

        realtimeSocket.addEventListener("error", () => {
          wsWarn("socket_error", {
            readyState: realtimeSocket?.readyState
          });
        });
      };


`;
