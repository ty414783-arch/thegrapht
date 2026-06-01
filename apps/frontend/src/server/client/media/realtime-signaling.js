export const realtimeSignaling = () => `

        realtimeSocket = null;
        realtimeLastActivityAt = 0;
        rerenderDialogsIfVisible();
        refreshCurrentDialogChrome();
      };

      const wsInfo = (event, details = {}) => {
        try {
          console.info("[TheGraphT WS]", event, details);
        } catch {}
      };

      const wsWarn = (event, details = {}) => {
        try {
          console.warn("[TheGraphT WS]", event, details);
        } catch {}
      };

      const touchRealtimeActivity = () => {
        realtimeLastActivityAt = Date.now();
      };

      let realtimeDialogResyncTimer = null;
      let realtimeDialogResyncInFlight = false;
      let realtimeDialogResyncLastAt = 0;
      let realtimeDialogResyncLastDialogId = "";
      let chatScrollDayHideTimer = null;
      let chatScrollDayLastLabel = "";

      const reconcileCurrentDialogMessages = async (reason = "unspecified", options = {}) => {
        const force = Boolean(options.force);
        if (!currentDialogPublicId || !currentDialogSnapshot) {
          return;
        }
        if (realtimeDialogResyncInFlight) {
          return;
        }

        const nowTs = Date.now();
        if (!force && realtimeDialogResyncLastDialogId === currentDialogPublicId && (nowTs - realtimeDialogResyncLastAt) < 1800) {
          return;
        }

        realtimeDialogResyncInFlight = true;
        realtimeDialogResyncLastAt = nowTs;
        realtimeDialogResyncLastDialogId = currentDialogPublicId;

        try {
          const scrollTopBefore = messageList?.scrollTop || 0;
          const payload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages");
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.messages || []);
          if (!preparedPayload?.dialog || preparedPayload.dialog.publicId !== currentDialogPublicId) {
            return;
          }

          const serverMessages = (Array.isArray(preparedPayload.messages) ? preparedPayload.messages : [])
            .filter((message) => !isMessageDeletedLocally(message?.id));
          const currentMessages = (Array.isArray(currentMessagesSnapshot) ? currentMessagesSnapshot : [])
            .filter((message) => !isMessageDeletedLocally(message?.id));
          const serverIds = new Set(serverMessages.map((message) => String(message?.id || "")));
          const currentIds = new Set(currentMessages.map((message) => String(message?.id || "")));
          const missingInCurrent = serverMessages.filter((message) => !currentIds.has(String(message?.id || ""))).length;
          const localPendingInCurrent = currentMessages.filter((message) => String(message?.id || "").startsWith("local_")).length;

          // Reliability-first merge:
          // - keep all currently visible messages (prevents "message disappeared then reappeared")
          // - overlay with canonical server versions by id
          // - include local pending drafts until matched/replaced
          const mergedMap = new Map();
          currentMessages.forEach((message) => {
            const id = String(message?.id || "");
            if (!id) {
              return;
            }
            mergedMap.set(id, message);
          });
          serverMessages.forEach((message) => {
            const id = String(message?.id || "");
            if (!id) {
              return;
            }
            const prev = mergedMap.get(id);
            mergedMap.set(id, prev ? { ...prev, ...message } : message);
          });

          const mergedMessages = Array.from(mergedMap.values()).sort((a, b) => {
            const aTs = getMessageEpochSeconds(a) * 1000;
            const bTs = getMessageEpochSeconds(b) * 1000;
            if (aTs !== bTs) {
              return aTs - bTs;
            }
            return String(a?.id || "").localeCompare(String(b?.id || ""));
          });

          const signaturesDiffer = (
            mergedMessages.map((message) => String(message?.id || "")).join("|")
            !== currentMessages.map((message) => String(message?.id || "")).join("|")
          );

          wsInfo("dialog_resync_checked", {
            reason,
            dialogPublicId: currentDialogPublicId,
            currentCount: currentMessages.length,
            serverCount: serverMessages.length,
            missingInCurrent,
            localPendingInCurrent,
            mergedCount: mergedMessages.length,
            signaturesDiffer
          });

          if (!signaturesDiffer && missingInCurrent === 0) {
            return;
          }

          const mergedPayload = {
            dialog: preparedPayload.dialog,
            messages: mergedMessages
          };
          setDialogPayloadCache(currentDialogPublicId, mergedPayload);
          const shouldStickBottom = (messageList.scrollHeight - (messageList.scrollTop + messageList.clientHeight)) < 56;
          renderMessages(preparedPayload.dialog, mergedMessages, {
            scrollBehavior: "none",
            openingDialog: false,
            animateList: false,
            forceScrollBottom: shouldStickBottom,
            restoreScrollTop: shouldStickBottom ? null : scrollTopBefore
          });
          wsWarn("dialog_resync_applied", {
            reason,
            dialogPublicId: currentDialogPublicId,
            missingInCurrent,
            localPendingInCurrent,
            serverCount: serverMessages.length,
            mergedCount: mergedMessages.length
          });
        } catch (error) {
          wsWarn("dialog_resync_failed", {
            reason,
            error: error instanceof Error ? error.message : String(error)
          });
        } finally {
          realtimeDialogResyncInFlight = false;
        }
      };

      const startRealtimeHealthChecks = () => {
        if (realtimeHeartbeatTimer) {
          window.clearInterval(realtimeHeartbeatTimer);
          realtimeHeartbeatTimer = null;
        }
        if (realtimeWatchdogTimer) {
          window.clearInterval(realtimeWatchdogTimer);
          realtimeWatchdogTimer = null;
        }

        touchRealtimeActivity();

        realtimeHeartbeatTimer = window.setInterval(() => {
          if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
            return;
          }

          try {
            realtimeSocket.send(JSON.stringify({
              type: "ping",
              ts: Date.now()
            }));
            wsInfo("ping_sent", {
              ts: Date.now()
            });
          } catch {}
        }, REALTIME_HEARTBEAT_INTERVAL_MS);

        realtimeWatchdogTimer = window.setInterval(() => {
          if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
            return;
          }

          const staleForMs = Date.now() - (realtimeLastActivityAt || 0);
          if (staleForMs <= REALTIME_STALE_TIMEOUT_MS) {
            return;
          }

          wsWarn("stale_socket_detected_forcing_reconnect", {
            staleForMs
          });
          try {
            realtimeSocket.close();
          } catch {}
        }, REALTIME_WATCHDOG_INTERVAL_MS);

        if (realtimeDialogResyncTimer) {
          window.clearInterval(realtimeDialogResyncTimer);
          realtimeDialogResyncTimer = null;
        }
        // Periodic resync is disabled to avoid double-loading, wasteful HTTP polling,
        // and layout-reflow scroll jumps in dialogues, groups, and everywhere.
        /*
        realtimeDialogResyncTimer = window.setInterval(() => {
          if (!currentDialogPublicId || !currentDialogSnapshot || document.visibilityState === "hidden") {
            return;
          }
          void reconcileCurrentDialogMessages("periodic");
        }, 4000);
        */
      };

      const sendCurrentPresence = () => {
        if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
          return;
        }

        wsInfo("presence_send", {
          dialogId: currentDialogId || null
        });
        realtimeSocket.send(JSON.stringify({
          type: "presence",
          dialogId: currentDialogId || null
        }));
      };

      const sendActiveState = (isActive) => {
        if (!realtimeSocket || realtimeSocket.readyState !== WebSocket.OPEN) {
          return;
        }
        try {
          realtimeSocket.send(JSON.stringify({
            type: "active_state",
            isActive: Boolean(isActive)
          }));
        } catch {}
      };
      window.sendActiveState = sendActiveState;

`;
