export const sidebarClientChunk = `      const setStatus = (message, type) => {
        statusNode.textContent = message;
        statusNode.className = "status " + type;
      };

      const sidebarMenuButton = document.getElementById("sidebar-menu-button");
      const sidebarGlassMenu = document.getElementById("sidebar-glass-menu");
      const sidebarMenuProfile = document.getElementById("sidebar-menu-profile");
      const sidebarMenuSaved = document.getElementById("sidebar-menu-saved");
      const sidebarMenuLogout = document.getElementById("sidebar-menu-logout");
      const sidebarComposeFab = document.getElementById("sidebar-compose-fab");
      const sidebarComposeMenu = document.getElementById("sidebar-compose-menu");
      const sidebarComposeChannel = document.getElementById("sidebar-compose-channel");
      const sidebarComposeGroup = document.getElementById("sidebar-compose-group");
      const sidebarComposePrivate = document.getElementById("sidebar-compose-private");
      const groupCreatePanel = document.getElementById("group-create-panel");

      const gsapOpenSidebar = (panel) => {
        if (!panel) return;
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
      };

      const gsapCloseSidebar = (panel) => {
        if (!panel) return;
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
      };

      const groupCreateClose = document.getElementById("group-create-close");
      const groupCreateSearchInput = document.getElementById("group-create-search-input");
      const groupCreateStepMembersTitle = document.getElementById("group-create-step-members-title");
      const groupCreateList = document.getElementById("group-create-list");
      const groupCreateSelected = document.getElementById("group-create-selected");
      const groupCreateNext = document.getElementById("group-create-next");
      const groupCreateDetailsBack = document.getElementById("group-create-details-back");
      const groupCreatePhotoButton = document.getElementById("group-create-photo-button");
      const groupCreatePhotoInput = document.getElementById("group-create-photo-input");
      const groupCreatePhotoPreview = document.getElementById("group-create-photo-preview");
      const groupCreateNameInput = document.getElementById("group-create-name-input");
      const groupCreateMemberCount = document.getElementById("group-create-member-count");
      const groupCreateDetailsList = document.getElementById("group-create-details-list");
      let groupCreateSelectedDialogIds = new Set();
      let groupCreateSearchQuery = "";
      let groupCreateStep = 1;
      let groupCreatePhotoDataUrl = "";
      let groupCreateNameTouched = false;
      let groupCreateRenderedSelectedDialogIds = new Set();
      let groupCreateMode = "group";
      const GROUP_MAX_MEMBERS = 20000;
      const encodeSecretRouteToken = (value) => {
        try {
          let token = window.btoa(unescape(encodeURIComponent(String(value || ""))));
          token = token.split("+").join("-").split("/").join("_");
          while (token.endsWith("=")) {
            token = token.slice(0, -1);
          }
          return token;
        } catch {
          return "";
        }
      };
      const decodeSecretRouteToken = (value) => {
        try {
          const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
          const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
          return decodeURIComponent(escape(window.atob(normalized + padding)));
        } catch {
          return "";
        }
      };
      const getRoutedPublicId = () => {
        const path = String(window.location.pathname || "/");
        if (!path || path === "/") {
          return "";
        }
        const lowerPath = path.toLowerCase();
        if (lowerPath.startsWith("/@") && (lowerPath.endsWith("/sc") || lowerPath.endsWith("/sc/"))) {
          const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
          const parts = trimmed.split("/");
          const usernamePart = parts.length >= 2 ? parts[1] : "";
          const url = new URL(window.location.href);
          const secretToken = url.searchParams.get("s") || "";
          const decodedPublicId = decodeSecretRouteToken(secretToken);
          if (decodedPublicId) {
            return decodedPublicId;
          }
          return "@" + decodeURIComponent(String(usernamePart || "").replace(/^@+/, ""));
        }
        if (path.startsWith("/g/")) {
          return decodeURIComponent(path.slice(3));
        }
        return decodeURIComponent(path.slice(1));
      };
      const getDialogUsernameFromSidebarDialog = (dialog) => {
        if (!dialog) {
          return "";
        }
        const peerUsername = String(dialog.peerUsername || "").trim().toLowerCase();
        if (peerUsername) {
          return peerUsername.replace(/^@+/, "");
        }
        const subtitle = String(dialog.subtitle || "").trim();
        if (subtitle.startsWith("@")) {
          return subtitle.replace(/^@+/, "").trim().toLowerCase();
        }
        return "";
      };
      const resolveRoutePathForDialogPublicId = (publicId) => {
        if (!publicId) {
          return "/";
        }
        const dialog = typeof allDialogs !== "undefined" ? allDialogs.find((d) => d.publicId === publicId) : null;
        if (!dialog) {
          return "/" + publicId;
        }
        if (dialog.type === "group") {
          return "/g/" + publicId;
        }
        const isSecretDialog = Boolean(
          (dialog.type === "secret" || dialog.type === "direct" || dialog.type === "private")
          && dialog.encryptionMode === "e2e_v1"
        );
        if (isSecretDialog) {
          const username = getDialogUsernameFromSidebarDialog(dialog);
          const secretToken = encodeSecretRouteToken(publicId);
          if (username && secretToken) {
            return "/@" + encodeURIComponent(username) + "/sc?s=" + encodeURIComponent(secretToken);
          }
          return "/" + publicId;
        }
        if (["direct", "private"].includes(dialog.type)) {
          const username = getDialogUsernameFromSidebarDialog(dialog);
          if (username) {
            return "/@" + encodeURIComponent(username);
          }
        }
        return "/" + publicId;
      };

      const setSidebarMenuOpen = (isOpen) => {
        workspaceSidebar?.classList.toggle("menu-open", isOpen);
        if (sidebarGlassMenu) {
          sidebarGlassMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        }
      };

      const toggleSidebarMenu = () => {
        const isOpen = workspaceSidebar?.classList.contains("menu-open");
        setSidebarMenuOpen(!isOpen);
      };

      const setSidebarComposeOpen = (isOpen) => {
        workspaceSidebar?.classList.toggle("compose-open", isOpen);
        if (sidebarComposeMenu) {
          sidebarComposeMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        }
      };

      const toggleSidebarComposeMenu = () => {
        const isOpen = workspaceSidebar?.classList.contains("compose-open");
        setSidebarComposeOpen(!isOpen);
      };

      const getGroupCreateCandidates = () => {
        const seenPeerUsers = new Set();
        return allDialogs
          .filter((dialog) => {
            const peerUserId = String(dialog?.peerUserId || "").trim();
            if (!dialog || dialog.type !== "direct" || dialog.encryptionMode === "e2e_v1" || !peerUserId) {
              return false;
            }
            if (seenPeerUsers.has(peerUserId)) {
              return false;
            }
            seenPeerUsers.add(peerUserId);
            return true;
          })
          .sort((a, b) => {
            const aTs = new Date(a?.lastMessageCreatedAt || 0).getTime();
            const bTs = new Date(b?.lastMessageCreatedAt || 0).getTime();
            return bTs - aTs;
          });
      };

      const getSecretCreateCandidates = () => {
        const byPeer = new Map();
        allDialogs.forEach((dialog) => {
          if (!dialog || !["direct", "private", "secret"].includes(dialog.type)) {
            return;
          }
          const peerUserId = String(dialog.peerUserId || "").trim();
          if (!peerUserId) {
            return;
          }
          const existing = byPeer.get(peerUserId) || {
            peerUserId,
            cloudDialog: null,
            secretDialog: null
          };
          const isSecret = dialog.encryptionMode === "e2e_v1";
          if (isSecret) {
            existing.secretDialog = existing.secretDialog || dialog;
          } else {
            existing.cloudDialog = existing.cloudDialog || dialog;
          }
          byPeer.set(peerUserId, existing);
        });
        return Array.from(byPeer.values())
          .map((entry) => {
            const baseDialog = entry.cloudDialog || entry.secretDialog;
            if (!baseDialog) {
              return null;
            }
            return {
              id: "secret-candidate-" + entry.peerUserId,
              peerUserId: entry.peerUserId,
              title: baseDialog.title,
              subtitle: baseDialog.subtitle,
              peerLastSeenAt: baseDialog.peerLastSeenAt,
              avatarUrl: baseDialog.avatarUrl,
              publicId: baseDialog.publicId,
              lastMessageCreatedAt: baseDialog.lastMessageCreatedAt || null,
              type: "direct",
              encryptionMode: baseDialog.encryptionMode,
              unavailable: Boolean(entry.secretDialog)
            };
          })
          .filter(Boolean)
          .sort((a, b) => {
            const aTs = new Date(a?.lastMessageCreatedAt || 0).getTime();
            const bTs = new Date(b?.lastMessageCreatedAt || 0).getTime();
            return bTs - aTs;
          });
      };

      const renderGroupCreateSelected = (candidates) => {
        if (!groupCreateSelected) {
          return;
        }
        const selectedCandidates = candidates.filter((dialog) => groupCreateSelectedDialogIds.has(String(dialog.id)));
        const selectedDialogIds = new Set(selectedCandidates.map((dialog) => String(dialog.id)));
        groupCreateSelected.innerHTML = selectedCandidates.map((dialog) => {
          const dialogId = String(dialog.id);
          const isNewSelected = !groupCreateRenderedSelectedDialogIds.has(dialogId);
          return '<div class="group-selected-chip' + (isNewSelected ? " is-new" : "") + '" title="' + escapeHtml(dialog.title || "User") + '">' +
            getDialogAvatarMarkup(dialog, { showPresence: false }) +
          '</div>';
        }).join("");
        groupCreateRenderedSelectedDialogIds = selectedDialogIds;
      };

      const getGroupCreateSelectedCandidates = () => {
        const selectedIds = groupCreateSelectedDialogIds;
        const candidates = groupCreateMode === "secret" ? getSecretCreateCandidates() : getGroupCreateCandidates();
        return candidates.filter((dialog) => selectedIds.has(String(dialog.id)));
      };

      const getAutoGeneratedGroupName = (selectedCandidates) => {
        const selfName = String(currentUserDisplayName || currentUserUsername || currentUserEmail || "You").trim() || "You";
        const peerNames = selectedCandidates.map((dialog) => String(dialog.title || "User").trim() || "User");
        return [selfName].concat(peerNames).join(" & ");
      };

      const setGroupCreateStep = (step) => {
        groupCreateStep = step === 2 ? 2 : 1;
        workspaceSidebar?.classList.toggle("group-create-step2-open", groupCreateStep === 2);
      };

      const syncGroupCreateNextButtonState = () => {
        const hasSelection = groupCreateSelectedDialogIds.size > 0;
        workspaceSidebar?.classList.toggle("group-create-next-enabled", hasSelection);
      };

      const renderGroupCreateDetails = () => {
        const selectedCandidates = getGroupCreateSelectedCandidates();
        const membersCount = selectedCandidates.length;
        if (groupCreateMemberCount) {
          groupCreateMemberCount.textContent = membersCount === 1 ? "1 member" : String(membersCount) + " members";
        }
        if (groupCreateDetailsList) {
          groupCreateDetailsList.innerHTML = selectedCandidates.map((dialog) => {
            const statusText = formatDialogSubtitle(dialog) || "last seen recently";
            return '<div class="group-create-details-item">' +
              getDialogAvatarMarkup(dialog) +
              '<div class="group-create-body">' +
                '<p class="group-create-name">' + escapeHtml(dialog.title || "User") + '</p>' +
                '<p class="group-create-status">' + escapeHtml(statusText) + '</p>' +
              '</div>' +
            '</div>';
          }).join("");
        }
        if (groupCreateNameInput && (!groupCreateNameTouched || !groupCreateNameInput.value.trim())) {
          groupCreateNameInput.value = getAutoGeneratedGroupName(selectedCandidates);
        }
      };

      const renderGroupCreateList = () => {
        if (!groupCreateList) {
          return;
        }
        const candidates = groupCreateMode === "secret" ? getSecretCreateCandidates() : getGroupCreateCandidates();
        const query = groupCreateSearchQuery.trim().toLowerCase();
        const filtered = query
          ? candidates.filter((dialog) => {
              const haystack = String(dialog.title || "").toLowerCase() + " " + String(formatDialogSubtitle(dialog) || "").toLowerCase();
              return haystack.includes(query);
            })
          : candidates;

        if (!filtered.length) {
          groupCreateList.innerHTML = '<div class="group-create-empty">No people found.</div>';
          renderGroupCreateSelected(candidates);
          syncGroupCreateNextButtonState();
          return;
        }

        groupCreateList.innerHTML = filtered.map((dialog) => {
          const dialogId = String(dialog.id);
          const isSelected = groupCreateSelectedDialogIds.has(dialogId);
          const isUnavailable = Boolean(dialog.unavailable);
          const statusText = isUnavailable
            ? "Secret chat already exists"
            : (formatDialogSubtitle(dialog) || "last seen recently");
          return '<button class="group-create-item' + (isSelected ? " selected" : "") + (isUnavailable ? " unavailable" : "") + '" type="button" data-group-dialog-id="' + escapeHtml(dialogId) + '" ' + (isUnavailable ? 'disabled aria-disabled="true"' : "") + '>' +
            '<span class="group-create-check"><span class="lucide" aria-hidden="true">check</span></span>' +
            getDialogAvatarMarkup(dialog) +
            '<div class="group-create-body">' +
              '<p class="group-create-name">' + escapeHtml(dialog.title || "User") + '</p>' +
              '<p class="group-create-status">' + escapeHtml(statusText) + '</p>' +
            '</div>' +
          '</button>';
        }).join("");

        groupCreateList.querySelectorAll("[data-group-dialog-id]").forEach((button) => {
          button.addEventListener("click", () => {
            const dialogId = button.getAttribute("data-group-dialog-id");
            if (!dialogId) {
              return;
            }
            const candidate = filtered.find((item) => String(item.id) === dialogId);
            if (candidate?.unavailable) {
              return;
            }
            if (groupCreateSelectedDialogIds.has(dialogId)) {
              groupCreateSelectedDialogIds.delete(dialogId);
            } else {
              if (groupCreateMode === "secret") {
                groupCreateSelectedDialogIds = new Set([dialogId]);
                renderGroupCreateList();
                renderGroupCreateDetails();
                return;
              }
              if (groupCreateSelectedDialogIds.size >= GROUP_MAX_MEMBERS) {
                showToast("Group member limit is 20000.", "info");
                return;
              }
              groupCreateSelectedDialogIds.add(dialogId);
            }
            renderGroupCreateList();
            renderGroupCreateDetails();
          });
        });

        renderGroupCreateSelected(candidates);
        syncGroupCreateNextButtonState();
      };

      const closeGroupCreatePanel = () => {
        gsapCloseSidebar(groupCreatePanel);
        workspaceSidebar?.classList.remove("group-create-next-enabled");
        workspaceSidebar?.classList.remove("group-create-step2-open");
        groupCreateMode = "group";
        if (groupCreateStepMembersTitle) {
          groupCreateStepMembersTitle.textContent = "Add Members";
        }
        if (groupCreateSearchInput) {
          groupCreateSearchInput.placeholder = "Add people...";
        }
        setGroupCreateStep(1);
      };

      const openGroupCreatePanel = () => {
        setSidebarComposeOpen(false);
        setSidebarMenuOpen(false);
        groupCreateSearchQuery = "";
        groupCreateSelectedDialogIds = new Set();
        groupCreateRenderedSelectedDialogIds = new Set();
        groupCreatePhotoDataUrl = "";
        groupCreateNameTouched = false;
        if (groupCreatePhotoPreview) {
          groupCreatePhotoPreview.removeAttribute("src");
        }
        groupCreatePhotoButton?.classList.remove("has-photo");
        if (groupCreateSearchInput) {
          groupCreateSearchInput.value = "";
        }
        if (groupCreateNameInput) {
          groupCreateNameInput.value = "";
        }
        setGroupCreateStep(1);
        renderGroupCreateList();
        renderGroupCreateDetails();
        gsapOpenSidebar(groupCreatePanel);
        window.setTimeout(() => {
          groupCreateSearchInput?.focus();
        }, 40);
      };

      const openSecretCreatePanel = () => {
        groupCreateMode = "secret";
        if (groupCreateStepMembersTitle) {
          groupCreateStepMembersTitle.textContent = "New Secret Chat";
        }
        if (groupCreateSearchInput) {
          groupCreateSearchInput.placeholder = "Who do you want to chat with?";
        }
        if (groupCreateNameInput) {
          groupCreateNameInput.value = "";
        }
        setGroupCreateStep(1);
        openGroupCreatePanel();
      };

      const animateModeChange = (nextMode) => {
        authCopyBlock.classList.add("switching");

        window.setTimeout(() => {
          const registerMode = nextMode === "register";
          authKicker.textContent = registerMode ? "Register" : "Sign in";
          authTitle.textContent = registerMode ? "Create account" : "Log in";
          authCopy.textContent = registerMode
            ? "Sign up to enter your Thegrapht workspace."
            : "Enter your email and password to sign in to Thegrapht.";
          submitButton.textContent = registerMode ? "Create account" : "Log in";
          metaText.textContent = registerMode ? "Already have an account?" : "No account?";
          toggleButton.textContent = registerMode ? "Back to sign in" : "Create account";
          nameField.classList.toggle("open", registerMode);
          nameInput.required = registerMode;
          passwordInput.autocomplete = registerMode ? "new-password" : "current-password";
          authCopyBlock.classList.remove("switching");
        }, 180);
      };

      const switchView = (showWorkspace) => {
        authView.classList.toggle("hidden", showWorkspace);
        workspaceView.classList.toggle("hidden", !showWorkspace);
        pageRoot.classList.toggle("workspace-mode", showWorkspace);
      };

      const finishBoot = async (showWorkspace) => {
        const wasBooting = pageRoot.classList.contains("booting");
        await ensureBootMinDuration();
        switchView(showWorkspace);
        pageRoot.classList.remove("booting");
        hideBootSplash();
        finishAllTopProgress();
        if (showWorkspace && wasBooting) {
          chatWindow.classList.remove("motion-enter");
          void chatWindow.offsetWidth;
          chatWindow.classList.add("motion-enter");
          animateDialogListItems();
        }
      };

      const getDialogSortTimestamp = (dialog) => {
        const raw = dialog?.lastMessageCreatedAt || dialog?.updatedAt || dialog?.createdAt || "";
        const ts = raw ? Date.parse(raw) : NaN;
        return Number.isFinite(ts) ? ts : 0;
      };

      const getFilteredDialogs = (dialogs) => {
        return dialogs.slice().sort((left, right) => {
          const leftSaved = left?.type === "saved";
          const rightSaved = right?.type === "saved";

          if (leftSaved && !rightSaved) {
            return -1;
          }
          if (!leftSaved && rightSaved) {
            return 1;
          }

          const timeDelta = getDialogSortTimestamp(right) - getDialogSortTimestamp(left);
          if (timeDelta !== 0) {
            return timeDelta;
          }

          return String(left?.title || "").localeCompare(String(right?.title || ""));
        });
      };

      const renderSearchLoadingState = () => {
        dialogList.classList.remove("search-empty");
        dialogList.classList.add("search-loading");
        dialogList.innerHTML =
          '<div class="search-loading-state">' +
            '<div class="search-spinner" aria-hidden="true"></div>' +
          '</div>';
        animateDialogListItems();
      };

      const renderSearchResults = (users) => {
        dialogList.classList.remove("search-loading");
        dialogList.classList.remove("search-empty");
        const query = currentSearchQuery.trim().toLowerCase();
        const savedDialog = allDialogs.find((dialog) => dialog.type === "saved");
        const selfMatches = Boolean(
          query
          && (
            String(currentUserDisplayName || "").toLowerCase().includes(query)
            || String(currentUserUsername || "").toLowerCase().includes(query)
            || String(currentUserEmail || "").toLowerCase().includes(query)
          )
        );
        const visibleUsers = selfMatches
          ? [
              {
                id: currentUserId,
                name: currentUserDisplayName || currentUserUsername || currentUserEmail || "You",
                username: currentUserUsername || "",
                isSelf: true
              },
              ...users.filter((user) => user.id !== currentUserId)
            ]
          : users;

        if (!visibleUsers.length) {
          dialogList.classList.add("search-empty");
          dialogList.innerHTML =
            '<div class="search-empty-state">' +
              '<video autoplay muted loop playsinline preload="auto" aria-hidden="true">' +
                '<source src="' + searchEmptyVideoUrl + '" type="video/mp4" />' +
              '</video>' +
              '<p class="search-empty-title">No results found</p>' +
              '<p class="search-empty-copy">Try another username or clear the search.</p>' +
            '</div>';
          animateDialogListItems();
          return;
        }

        dialogList.innerHTML = visibleUsers.map((user) => {
          const avatar = getAvatarMeta(user.id || user.username, user.name || user.username || "?");
          return '<button class="dialog-item" type="button" data-search-user-id="' + escapeHtml(user.id) + '">' +
            '<div class="dialog-avatar user-avatar" style="' + avatar.style + '"><img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" /></div>' +
            '<div class="dialog-body">' +
              '<div class="dialog-line only-title"><strong>' + escapeHtml(user.name) + '</strong></div>' +
                  '<p class="dialog-preview">' + (
                user.isSelf
                  ? 'You'
                  : '@' + escapeHtml(user.username)
              ) + '</p>' +
            '</div>' +
          '</button>';
        }).join("");

        dialogList.querySelectorAll("[data-search-user-id]").forEach((button) => {
          button.addEventListener("click", async () => {
            const targetUserId = button.getAttribute("data-search-user-id");
            if (!targetUserId) {
              return;
            }

            if (targetUserId === currentUserId && savedDialog?.publicId) {
              currentSearchQuery = "";
              currentSearchResults = [];
              sidebarSearch.value = "";
              renderDialogs(allDialogs, { animate: true });
              await loadDialog(savedDialog.publicId);
              return;
            }

            try {
              const payload = await createPreferredDirectDialog(targetUserId);

              const preparedPayload = await prepareDialogPayloadForDisplay(
                payload.dialog || null,
                payload.messages || []
              );

              currentSearchQuery = "";
              currentSearchResults = [];
              sidebarSearch.value = "";
              await loadWorkspace();
              if (preparedPayload.dialog?.publicId) {
                setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
                await loadDialog(preparedPayload.dialog.publicId);
              }
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Failed to open chat.", "error");
              showToast(error instanceof Error ? error.message : "Failed to open chat.", "error");
            }
          });
        });
        animateDialogListItems();
      };

      const renderDialogs = (dialogs, options = {}) => {
        const shouldAnimate = Boolean(options.animate);
        const visibleDialogs = getFilteredDialogs(dialogs);

        dialogList.classList.remove("search-loading");
        dialogList.classList.remove("search-empty");

        dialogList.innerHTML = visibleDialogs.map((dialog) => {
          const active = dialog.id === currentDialogId ? " active" : "";
          const unreadCount = Math.max(0, Number(dialog?.unreadCount) || 0);
          const unreadBadgeClassName = unreadCount > 0
            ? "dialog-unread-badge"
            : "dialog-unread-badge is-hidden";
          const unreadBadgeText = unreadCount > 99 ? "99+" : String(unreadCount || "");

          return '<button class="dialog-item saved-item' + active + '" data-dialog-id="' + escapeHtml(dialog.id) + '" data-public-id="' + escapeHtml(dialog.publicId) + '">' +
            getDialogAvatarMarkup(dialog) +
            '<div class="dialog-body">' +
              '<div class="dialog-line"><span class="dialog-title-wrap"><strong>' + escapeHtml(dialog.title) + '</strong>' + (dialog.muted ? '<span class="lucide" style="font-size: 14px; margin-left: 4px; vertical-align: middle; opacity: 0.6;">volume_off</span>' : '') + '</span><span class="dialog-meta">' + escapeHtml(formatDialogListTime(dialog.lastMessageCreatedAt)) + '</span></div>' +
              '<div class="dialog-preview dialog-preview-row">' +
                '<span class="dialog-preview-copy">' + renderDialogPreviewHtml(dialog) + '</span>' +
                '<span class="' + unreadBadgeClassName + '" aria-hidden="' + (unreadCount > 0 ? "false" : "true") + '">' + escapeHtml(unreadBadgeText) + '</span>' +
              '</div>' +
            '</div>' +
          '</button>';
        }).join("");

        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
          button.addEventListener("click", () => {
            const dialogId = button.getAttribute("data-dialog-id");
            const publicId = button.getAttribute("data-public-id");
            if (dialogId && publicId) {
              // Immediately add is-hidden class to the badge if it exists to trigger the CSS transition
              const badgeEl = button.querySelector(".dialog-unread-badge");
              if (badgeEl && !badgeEl.classList.contains("is-hidden")) {
                badgeEl.classList.add("is-hidden");
              }

              allDialogs = allDialogs.map((dialog) => dialog.publicId === publicId
                ? { ...dialog, unreadCount: 0 }
                : dialog);
              if (currentDialogSnapshot?.publicId === publicId) {
                currentDialogSnapshot = {
                  ...currentDialogSnapshot,
                  unreadCount: 0
                };
              }

              // Delay renderDialogs to allow transition to complete
              window.setTimeout(() => {
                renderDialogs(allDialogs);
              }, 220);

              void loadDialog(publicId);
            }
          });
        });
        if (shouldAnimate) {
          animateDialogListItems();
        }
      };

      const closeDialogContextMenu = () => {
        if (dialogContextMenuCloseTimer) {
          window.clearTimeout(dialogContextMenuCloseTimer);
          dialogContextMenuCloseTimer = null;
        }
        dialogContextMenu.classList.remove("open");
        dialogContextMenu.setAttribute("aria-hidden", "true");
        dialogContextMenuState = null;
      };

      const closeDialogContextMenuSoon = () => {
        if (dialogContextMenuCloseTimer) {
          window.clearTimeout(dialogContextMenuCloseTimer);
        }
        dialogContextMenuCloseTimer = window.setTimeout(() => {
          closeDialogContextMenu();
        }, 140);
      };

      const openDialogContextMenu = (event, context) => {
        if (!context?.publicId) {
          return;
        }

        dialogContextMenuState = context;
        dialogContextMenuBody.innerHTML =
          '<button class="dialog-context-menu-item" type="button" data-action="open_in_new">' +
            '<span class="lucide" aria-hidden="true">open_in_new</span>' +
            '<span>Open chat in new window</span>' +
          '</button>';

        const menuWidth = 268;
        const menuHeight = 72;
        const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, event.clientX));
        const top = Math.min(window.innerHeight - menuHeight - 12, Math.max(12, event.clientY));
        dialogContextMenu.style.left = left + "px";
        dialogContextMenu.style.top = top + "px";
        dialogContextMenu.classList.add("open");
        dialogContextMenu.setAttribute("aria-hidden", "false");

        dialogContextMenuBody.querySelectorAll("[data-action]").forEach((button) => {
          button.addEventListener("click", () => {
            const action = button.getAttribute("data-action");
            if (action !== "open_in_new" || !dialogContextMenuState?.publicId) {
              return;
            }

            const targetPath = resolveRoutePathForDialogPublicId(dialogContextMenuState.publicId);
            window.open(targetPath, "_blank", "noopener,noreferrer");
            closeDialogContextMenuSoon();
          });
        });
      };

      const closeDialog = (options = {}) => {
        sendTypingState(false);
        clearPendingReplyMessage();
        closeMessageContextMenu();
        closeDialogContextMenu();
        closeDeleteMessageModal();
        currentDialogId = "";
        currentDialogPublicId = "";
        pendingAutoBottomDialogPublicId = "";
        pendingAutoBottomCanceled = false;
        peerActiveInCurrentDialog = false;
        currentPeerReadAt = null;
        if (typingStopTimer) {
          window.clearTimeout(typingStopTimer);
          typingStopTimer = null;
        }
        clearPendingImageAttachment();
        sendCurrentPresence();
        closeChatProfilePanel();
        renderMessages(null, []);
        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
          button.classList.remove("active");
        });
        if (!options.skipHistory) {
          applyRoute("");
        }
      };

      const closeDialogWithMotion = (options = {}) => {
        if (!(chatWindow instanceof HTMLElement)) {
          closeDialog(options);
          return;
        }
        if (chatWindow.classList.contains("motion-exit")) {
          return;
        }
        chatWindow.classList.add("motion-exit");
        window.setTimeout(() => {
          closeDialog(options);
          chatWindow.classList.remove("motion-exit");
        }, 140);
      };

      const isMobileViewport = () => window.matchMedia("(max-width: 900px)").matches;
      const syncMobileChatOpenState = (hasOpenDialog) => {
        if (!isMobileViewport()) {
          pageRoot.classList.remove("mobile-chat-open");
          return;
        }
        pageRoot.classList.toggle("mobile-chat-open", Boolean(hasOpenDialog));
      };

      window.addEventListener("resize", () => {
        syncMobileChatOpenState(Boolean(currentDialogSnapshot));
      });

      const dedupeMessagesById = (messages) => {
        if (!Array.isArray(messages) || !messages.length) {
          return [];
        }
        const uniqueMap = new Map();
        messages.forEach((message) => {
          if (!message || typeof message !== "object") {
            return;
          }
          const key = String(message.id || "");
          if (!key) {
            return;
          }
          // Keep latest object shape for the same message id.
          uniqueMap.set(key, message);
        });
        return Array.from(uniqueMap.values());
      };

      const renderMessages = (dialog, messages, options = {}) => {
        uiRenderDebug("renderMessages:called", {
          dialogPublicId: dialog?.publicId || null,
          dialogType: dialog?.type || null,
          messageCount: Array.isArray(messages) ? messages.length : 0,
          options
        });
        const shouldAnimateList = Boolean(options.animateList);
        const startMessagesLoading = () => {
          messageList.classList.add("loading-messages");
        };
        const finishMessagesLoading = () => {
          requestAnimationFrame(() => {
            messageList.classList.remove("loading-messages");
          });
        };
        currentDialogSnapshot = dialog;
        currentMessagesSnapshot = Array.isArray(messages)
          ? dedupeMessagesById(messages).map((message) => (
              message && typeof message === "object" && message.animateOnRender
                ? { ...message, animateOnRender: false }
                : message
            ))
          : [];
        if (dialog && dialog.type !== "group") {
          groupCallJoinStrip?.classList.remove("visible");
          groupCallJoinStrip?.setAttribute("aria-hidden", "true");
          if (groupCallJoinStrip) {
            groupCallJoinStrip.hidden = true;
          }
          chatWindow?.classList.remove("group-call-join-visible");
        }

        if (!dialog) {
          startMessagesLoading();
          if (typeof preserveActiveAudioForLayoutChange === "function") {
            preserveActiveAudioForLayoutChange();
          }
          currentPeerReadAt = null;
          syncChatHeaderMeta();
          syncChatIslandActions();
          syncActiveCallChip();
          syncChatProfilePanel();
          workspaceMain.classList.add("empty-chat");
          workspaceMain.classList.remove("open-chat");
          chatStage.classList.add("empty");
          chatStage.classList.remove("open-chat");
          chatComposer.style.display = "none";
          syncMobileChatOpenState(false);
          setSidebarComposeOpen(false);
          composerInput.value = "";
        composerInput.style.height = "48px";
          composerInput.style.overflowY = "hidden";
          clearPendingImageAttachment();
          syncComposerState();
          messageList.classList.remove("saved-empty");
          messageList.innerHTML = '<div class="empty-chat-state"><p>Choose a chat to start messaging.</p><p>When you pick a dialog on the left, your conversation appears here.</p></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          finishMessagesLoading();
          finishDialogSwitchTransition();
          return;
        }

        const localMessages = getLocalMessagesForDialog(dialog.publicId).map((message) => (
          message && typeof message === "object" && message.animateOnRender
            ? { ...message, animateOnRender: false }
            : message
        ));
        const mergedMessages = dedupeMessagesById(currentMessagesSnapshot.concat(localMessages));
        if (dialog.type === "group" && typeof syncGroupCallStateFromMessages === "function") {
          syncGroupCallStateFromMessages(dialog, mergedMessages);
        }
        if (dialog.type !== "direct" && dialog.type !== "group") {
          currentPeerReadAt = null;
        }

        workspaceMain.classList.remove("empty-chat");
        workspaceMain.classList.add("open-chat");
        chatStage.classList.remove("empty");
        chatStage.classList.add("open-chat");
        chatComposer.style.display = "flex";
        syncMobileChatOpenState(true);
        setSidebarComposeOpen(false);
        setSidebarMenuOpen(false);
        chatTitle.textContent = dialog.title;
        chatSubtitle.textContent = formatDialogSubtitle(dialog);
        syncChatHeaderMeta();
        syncChatProfilePanel();
        syncChatIslandActions();
        syncActiveCallChip();
        syncComposerState();
        if (dialog.type === "saved" && mergedMessages.length === 0) {
          startMessagesLoading();
          bottomLockToken += 1;
          messageList.classList.remove("preparing-bottom");
          messageList.classList.add("saved-empty");
          messageList.innerHTML = '<div class="saved-empty-state"><h3>Your personal space</h3><p>Forward useful messages here.</p><p>Store photos and videos here safely.</p></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          closeChatSearch();
          finishMessagesLoading();
          finishDialogSwitchTransition();
          return;
        }

        if (dialog.type === "direct" && mergedMessages.length === 0) {
          startMessagesLoading();
          bottomLockToken += 1;
          messageList.classList.remove("preparing-bottom");
          const peerName = escapeHtml(dialog.title || "this user");
          messageList.classList.remove("saved-empty");
          messageList.innerHTML = '<div class="direct-empty-state"><div class="direct-empty-card"><h3>Start chatting with ' + peerName + '</h3><p>Once you send the first message, your chat history appears here.</p></div></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          if (chatSearchPanel.classList.contains("open")) {
            renderChatSearchResults();
          }
          syncActiveCallChip();
          finishMessagesLoading();
          finishDialogSwitchTransition();
          return;
        }

        if (dialog.type === "group" && mergedMessages.length === 0) {
          startMessagesLoading();
          bottomLockToken += 1;
          messageList.classList.remove("preparing-bottom");
          const groupName = escapeHtml(dialog.title || "Group");
          messageList.classList.remove("saved-empty");
          messageList.innerHTML = '<div class="direct-empty-state"><div class="direct-empty-card"><h3>Group "' + groupName + '"</h3><p>Groups can have:</p><p>✓ Up to 20,000 members</p><p>✓ Persistent chat history</p><p>✓ Public links such as thegrapht.su/g/' + escapeHtml(dialog.publicId) + '</p><p>✓ Admins with different rights</p></div></div>';
          chatScrollBottom.classList.remove("visible");
          isNearChatBottom = true;
          finishMessagesLoading();
          finishDialogSwitchTransition();
          return;
        }

        messageList.classList.remove("saved-empty");
        suppressBottomLockCancel = true;
        const hasRestoreScrollTop = typeof options.restoreScrollTop === "number";
        const shouldPrepareBottom = options.scrollBehavior !== "none" && !hasRestoreScrollTop;
        const forceBottomForRender = shouldPrepareBottom && (options.scrollBehavior === "auto" || options.forceScrollBottom);
        const applyRestoredScrollTop = () => {
          if (!hasRestoreScrollTop) {
            return false;
          }

          suppressBottomLockCancel = true;
          const maxTop = Math.max(0, messageList.scrollHeight - messageList.clientHeight);
          const nextTop = Math.min(maxTop, Math.max(0, Number(options.restoreScrollTop) || 0));
          messageList.scrollTop = nextTop;
          requestAnimationFrame(() => {
            window.setTimeout(() => {
              suppressBottomLockCancel = false;
            }, 150);
            syncChatScrollBottomButton();
            rememberCurrentDialogScrollTop();
          });
          return true;
        };
        const renderLockToken = shouldPrepareBottom ? startBottomLock({
          hideList: !options.forceScrollBottom
        }) : 0;
        if (!shouldPrepareBottom) {
          messageList.classList.remove("preparing-bottom");
        }
        if (typeof preserveActiveAudioForLayoutChange === "function") {
          preserveActiveAudioForLayoutChange();
        }
        startMessagesLoading();
        const renderableItems = buildRenderableMessageItems(mergedMessages);
        const normalizedItems = typeof annotateGroupIncomingSequences === "function"
          ? annotateGroupIncomingSequences(renderableItems)
          : renderableItems;
        uiRenderDebug("renderMessages:normalized_items", {
          dialogType: dialog?.type || null,
          totalItems: Array.isArray(normalizedItems) ? normalizedItems.length : 0,
          groupItemsWithMeta: Array.isArray(normalizedItems)
            ? normalizedItems.filter((item) => item?.groupIncomingMeta).length
            : 0
        });

        let firstUnreadMessageId = null;
        if (dialog.unreadCount > 0 && mergedMessages.length >= dialog.unreadCount) {
          const sorted = sortMessagesChronologically(mergedMessages);
          const firstUnread = sorted[sorted.length - dialog.unreadCount];
          if (firstUnread) {
            firstUnreadMessageId = firstUnread.id;
          }
        }

        let renderedUnreadDivider = false;
        messageList.innerHTML = normalizedItems.map((item) => {
          let prefix = "";
          if (firstUnreadMessageId && !renderedUnreadDivider && item.messages) {
            const hasFirstUnread = item.messages.some(m => m && m.id === firstUnreadMessageId);
            if (hasFirstUnread) {
              renderedUnreadDivider = true;
              prefix = '<div class="message-unread-divider"><span>Unread Messages</span></div>';
            }
          }
          const html = item.kind === "day"
            ? renderDaySeparator(item.dayValue)
            : item.kind === "album"
              ? renderAlbumMessage(item.messages, { groupIncomingMeta: item.groupIncomingMeta })
              : renderSingleMessage(item.messages[0], { groupIncomingMeta: item.groupIncomingMeta });
          return prefix + html;
        }).join("");

        if (typeof normalizeMessageDaySeparators === "function") {
          normalizeMessageDaySeparators();
        }
        hydrateMessageImages({ lockToken: renderLockToken });
        if (chatSearchPanel.classList.contains("open")) {
          renderChatSearchResults();
        }
        syncActiveCallChip();
        prefetchDialogMedia(mergedMessages);
        if (shouldPrepareBottom) {
          hardPinMessagesToBottom(renderLockToken);
        }
        requestAnimationFrame(() => {
          if (shouldPrepareBottom) {
            finishBottomLock(renderLockToken);
            if (options.scrollBehavior === "smooth") {
              scrollMessagesToBottom("smooth");
            }
            if (forceBottomForRender && !bottomLockCanceledByUser) {
              hardPinMessagesToBottom(renderLockToken);
            }
            window.setTimeout(() => {
              suppressBottomLockCancel = false;
            }, 150);
            finishMessagesLoading();
            return;
          }
          if (!applyRestoredScrollTop()) {
            syncChatScrollBottomButton();
            window.setTimeout(() => {
              suppressBottomLockCancel = false;
            }, 150);
          }
          finishMessagesLoading();
        });
        finishDialogSwitchTransition();
      };

      const fetchJson = async (url, options = {}) => {
        const requestHeaders = {
          ...(options.headers || {})
        };

        if (legacySessionToken && !requestHeaders.Authorization) {
          requestHeaders.Authorization = "Bearer " + legacySessionToken;
        }

        startTopProgress();

        try {
          let response;

          try {
            response = await fetch(url, {
              credentials: "include",
              headers: requestHeaders,
              ...options
            });
          } catch (error) {
            const currentHost = window.location.hostname || "";
            const hint = currentHost === "web.thegrapht.su"
              ? " Could not reach API at web.thegrapht.su."
              : "";
            throw new Error("Network request failed." + hint);
          }

          const rawBody = await response.text();
          const payload = rawBody ? JSON.parse(rawBody) : {};

          if (!response.ok) {
            if (response.status === 401 && !String(url).includes("/auth/")) {
              persistLegacySessionToken("");
              if (currentUserId) {
                handleUnauthorizedSession(payload.error || "Session ended. Please sign in again.");
              } else {
                disableRealtime();
              }
            }

            throw new Error(payload.error || "Request failed.");
          }

          return payload;
        } finally {
          finishTopProgress();
        }
      };

      const applyRoute = (publicId) => {
        const nextPath = resolveRoutePathForDialogPublicId(publicId);
        if (window.location.pathname !== nextPath) {
          window.history.pushState({}, "", nextPath);
        }
      };

      const uiRenderDebugEnabled = true;
      const uiRenderDebug = (event, details = {}) => {
        if (!uiRenderDebugEnabled) {
          return;
        }
        try {
          console.log("[TheGraphT UI DEBUG]", event, {
            ts: Date.now(),
            route: window.location.pathname || "/",
            currentDialogPublicId: currentDialogPublicId || null,
            currentDialogId: currentDialogId || null,
            ...details
          });
        } catch {}
      };

      const warmupDialogMediaInBackground = (messages = [], options = {}) => {
        const targetPublicId = String(options.targetPublicId || "");
        const targetLoadToken = Number(options.targetLoadToken) || 0;
        const start = () => {
          void preloadDialogMediaDimensions(messages, {
            limit: Number(options.limit) || 12,
            chunkSize: Number(options.chunkSize) || 4,
            timeBudgetMs: Number(options.timeBudgetMs) || 140,
            shouldContinue: () => (
              currentDialogPublicId === targetPublicId
              && activeDialogLoadToken === targetLoadToken
            )
          });
          prefetchDialogMedia(messages);
        };

        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(start, { timeout: 180 });
          return;
        }

        window.setTimeout(start, 0);
      };

      const loadDialog = async (publicId, options = {}) => {
        uiRenderDebug("loadDialog:start", {
          publicId: publicId || null,
          options
        });
        if (!publicId) {
          return;
        }

        if (currentDialogPublicId === publicId && currentDialogSnapshot && !options.forceReload) {
          if (!options.skipHistory) {
            applyRoute(publicId);
          }
          return;
        }

        if (currentDialogId && currentDialogPublicId !== publicId) {
          sendTypingState(false);
          rememberCurrentDialogScrollTop();
        }

        if (currentDialogPublicId !== publicId) {
          clearPendingReplyMessage();
          closeChatProfilePanel();
          if (activeCall && activeCall.dialogPublicId !== publicId) {
            minimizeCallModal();
          }
        }

        activeDialogLoadToken += 1;
        const loadToken = activeDialogLoadToken;
        const cachedPayload = options.skipCache ? null : getDialogPayloadCache(publicId);
        
        const shouldRestoreScrollTop = Boolean(options.restoreScrollOnOpen)
          || visitedDialogsInSession.has(publicId)
          || dialogScrollTopCache.has(publicId);
        const restoredScrollTop = shouldRestoreScrollTop ? getDialogScrollTop(publicId) : 0;
        const hasRestoredScrollTop = shouldRestoreScrollTop
          && Number.isFinite(restoredScrollTop)
          && restoredScrollTop > 0;

        dialogList.querySelectorAll("[data-dialog-id]").forEach((button) => {
          button.classList.toggle("active", button.getAttribute("data-public-id") === publicId);
        });

        if (!options.skipHistory) {
          applyRoute(publicId);
        }

        if (cachedPayload?.dialog && !options.forceReload) {
          uiRenderDebug("loadDialog:cached", {
            publicId,
            messageCount: Array.isArray(cachedPayload.messages) ? cachedPayload.messages.length : 0
          });
          currentDialogId = cachedPayload.dialog.id;
          currentDialogPublicId = cachedPayload.dialog.publicId;
          peerActiveInCurrentDialog = false;
          currentPeerReadAt = cachedPayload.dialog.peerReadAt || null;
          renderMessages(cachedPayload.dialog, cachedPayload.messages, {
            // Keep cached dialog instant: no loading overlay or delayed reveal.
            scrollBehavior: "none",
            openingDialog: false,
            animateList: false,
            forceScrollBottom: !hasRestoredScrollTop,
            restoreScrollTop: hasRestoredScrollTop ? restoredScrollTop : null
          });
          visitedDialogsInSession.add(cachedPayload.dialog.publicId);
          warmupDialogMediaInBackground(cachedPayload.messages, {
            targetPublicId: cachedPayload.dialog.publicId,
            targetLoadToken: loadToken
          });

          if (pendingDialogPublicIdFromNotification === cachedPayload.dialog.publicId) {
            pendingDialogPublicIdFromNotification = "";
          }

          pendingAutoBottomDialogPublicId = "";
          void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(cachedPayload.dialog.publicId) + "/read", {
            method: "POST"
          }).catch(() => {});
          sendCurrentPresence();
          return;
        }

        const previewDialog = allDialogs.find((d) => d.publicId === publicId);
        if (previewDialog) {
          currentDialogId = previewDialog.id;
          currentDialogPublicId = previewDialog.publicId;
          currentDialogSnapshot = previewDialog;
          currentMessagesSnapshot = [];
          
          chatTitle.textContent = previewDialog.title;
          chatSubtitle.textContent = formatDialogSubtitle(previewDialog) || "";
          syncChatHeaderMeta();
          syncChatProfilePanel();
          
          workspaceMain.classList.remove("empty-chat");
          workspaceMain.classList.add("open-chat");
          chatStage.classList.remove("empty");
          chatStage.classList.add("open-chat");
          chatComposer.style.display = "flex";
          
          syncMobileChatOpenState(true);
          setSidebarComposeOpen(false);
          setSidebarMenuOpen(false);
          syncComposerState();
        } else {
          currentDialogId = "";
          currentDialogPublicId = publicId;
          currentDialogSnapshot = null;
          currentMessagesSnapshot = [];
          
          chatTitle.textContent = "Loading...";
          chatSubtitle.textContent = "";
          syncChatHeaderMeta();
          syncChatProfilePanel();
          
          workspaceMain.classList.remove("empty-chat");
          workspaceMain.classList.add("open-chat");
          chatStage.classList.remove("empty");
          chatStage.classList.add("open-chat");
          chatComposer.style.display = "none";
          
          syncMobileChatOpenState(true);
          setSidebarComposeOpen(false);
          setSidebarMenuOpen(false);
          syncComposerState();
        }

        pendingAutoBottomDialogPublicId = publicId;
        pendingAutoBottomCanceled = false;
        forceBottomOnNextDialogRender = !hasRestoredScrollTop && options.scrollBehavior !== "none";

        try {
          messageList.innerHTML = '\
            <div class="chat-spinner-container">\
              <div class="boot-splash-inner">\
                <svg class="boot-splash-circular" viewBox="22 22 44 44" aria-hidden="true" focusable="false">\
                  <circle class="boot-splash-circular-indicator" cx="44" cy="44" r="20.2"></circle>\
                </svg>\
              </div>\
            </div>\
          ';
          
          const payload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(publicId) + "/messages");
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.messages || []);

          if (loadToken !== activeDialogLoadToken) {
            return;
          }

          setDialogPayloadCache(publicId, preparedPayload);
          currentDialogId = preparedPayload.dialog.id;
          currentDialogPublicId = preparedPayload.dialog.publicId;
          if (pendingDialogPublicIdFromNotification === preparedPayload.dialog.publicId) {
            pendingDialogPublicIdFromNotification = "";
          }
          peerActiveInCurrentDialog = false;
          currentPeerReadAt = preparedPayload.dialog.peerReadAt || null;
          const cachedSignature = cachedPayload?.messages
            ? cachedPayload.messages.map((message) => message.id).join("|")
            : "";
          const nextSignature = (preparedPayload.messages || []).map((message) => message.id).join("|");
          const lastPreparedMessage = (preparedPayload.messages || []).length
            ? preparedPayload.messages[preparedPayload.messages.length - 1]
            : null;

          if (lastPreparedMessage && !lastPreparedMessage.decryptionFailed) {
            updateDialogInState(preparedPayload.dialog, {
              lastMessagePreview: getMessagePreviewText(lastPreparedMessage),
              lastMessageSenderName: lastPreparedMessage.senderId === currentUserId
                ? "You"
                : (lastPreparedMessage.senderName || preparedPayload.dialog?.title || ""),
              lastMessageCreatedAt: lastPreparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
            });
            if (!currentSearchQuery.trim()) {
              renderDialogs(allDialogs);
            }
          }

          if (!cachedPayload?.dialog || cachedSignature !== nextSignature || options.forceReload) {
            uiRenderDebug("loadDialog:renderMessages", {
              publicId,
              cachedSignature,
              nextSignature,
              messageCount: Array.isArray(preparedPayload.messages) ? preparedPayload.messages.length : 0,
              options
            });
            renderMessages(preparedPayload.dialog, preparedPayload.messages, {
              scrollBehavior: hasRestoredScrollTop ? "none" : (options.scrollBehavior || "auto"),
              openingDialog: true,
              animateList: false,
              forceScrollBottom: !hasRestoredScrollTop,
              restoreScrollTop: hasRestoredScrollTop ? restoredScrollTop : null
            });
            visitedDialogsInSession.add(preparedPayload.dialog.publicId);
            warmupDialogMediaInBackground(preparedPayload.messages, {
              targetPublicId: preparedPayload.dialog.publicId,
              targetLoadToken: loadToken
            });
          } else {
            currentDialogSnapshot = preparedPayload.dialog;
            currentMessagesSnapshot = preparedPayload.messages || [];
            visitedDialogsInSession.add(preparedPayload.dialog.publicId);
            refreshCurrentDialogChrome();
            warmupDialogMediaInBackground(preparedPayload.messages, {
              targetPublicId: preparedPayload.dialog.publicId,
              targetLoadToken: loadToken
            });
          }
          pendingAutoBottomDialogPublicId = "";
          if (preparedPayload.dialog?.publicId) {
            void fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(preparedPayload.dialog.publicId) + "/read", {
              method: "POST"
            }).catch(() => {});
          }
          sendCurrentPresence();
        } catch (error) {
          pendingAutoBottomDialogPublicId = "";
          finishDialogSwitchTransition();
          throw error;
        }
      };

      let workspaceLoadInFlightPromise = null;

      const loadWorkspace = (options = {}) => {
        uiRenderDebug("loadWorkspace:requested", { options, inFlight: Boolean(workspaceLoadInFlightPromise) });
        if (workspaceLoadInFlightPromise) {
          uiRenderDebug("loadWorkspace:joined_inflight", { options });
          return workspaceLoadInFlightPromise;
        }

        workspaceLoadInFlightPromise = (async () => {
          const isInitialWorkspaceBoot = pageRoot.classList.contains("booting");

          if (currentUserId) {
            uiRenderDebug("loadWorkspace:start_transition", { options });
            startDialogSwitchTransition();
          }

          const routedToken = pendingDialogPublicIdFromNotification
            || (
              options.preserveRoute
                ? currentDialogPublicId || getRoutedPublicId()
                : getRoutedPublicId()
            );
          const pathName = String(window.location.pathname || "");
          const lowerPathName = pathName.toLowerCase();
          const routeIsSecretUsernamePath = lowerPathName.startsWith("/@")
            && (lowerPathName.endsWith("/sc") || lowerPathName.endsWith("/sc/"));
          const routeIsUsername = String(routedToken || "").startsWith("@");
          let routedUsernameFromRoute = "";
          const routePublicId = routeIsUsername ? "" : String(routedToken || "");
          const clientStateParams = new URLSearchParams();
          if (routePublicId) {
            clientStateParams.set("publicId", routePublicId);
          } else if (routeIsUsername) {
            const routeUsername = String(routedToken || "").replace(/^@+/, "").trim().toLowerCase();
            if (routeUsername) {
              clientStateParams.set("routeUsername", routeUsername);
              clientStateParams.set("routeKind", routeIsSecretUsernamePath ? "secret" : "cloud");
            }
          }
          const payload = await fetchJson(
            apiBase + "/v1/client-state" + (clientStateParams.toString() ? "?" + clientStateParams.toString() : "")
          );

          currentUserId = payload.user.id;
          currentUserUsername = payload.user.username || "";
          currentUserEmail = payload.user.email || "";
          currentUserDisplayName = payload.user.displayName || payload.user.username || payload.user.email || "TheGraphT user";
          currentUserAvatarLetter = String(currentUserDisplayName || "?").trim().charAt(0).toUpperCase() || "?";
          currentUserAvatarUrl = String(
            payload?.user?.avatarUrl
            || payload?.user?.photoUrl
            || payload?.user?.avatarDataUrl
            || payload?.user?.profilePhotoUrl
            || ""
          ).trim();
          secureFeatureState.identityPromise = null;
          secureFeatureState.publishPromise = null;
          const hydrateDialogPreviewsForSidebar = async (dialogs) => Array.isArray(dialogs) ? dialogs : [];

          workspaceUserName.textContent = currentUserDisplayName;
          allDialogs = await hydrateDialogPreviewsForSidebar(payload.dialogs || []);
          if (routeIsUsername) {
            const routedUsername = String(routedToken || "").replace(/^@+/, "").trim().toLowerCase();
            routedUsernameFromRoute = routedUsername;
            if (routedUsername) {
              let targetDialog = allDialogs.find((dialog) => (
                getDialogUsernameFromSidebarDialog(dialog) === routedUsername
                && (
                  routeIsSecretUsernamePath
                    ? (["direct", "private", "secret"].includes(dialog?.type) && dialog?.encryptionMode === "e2e_v1")
                    : (["direct", "private"].includes(dialog?.type) && dialog?.encryptionMode !== "e2e_v1")
                )
              )) || null;

              if (targetDialog?.publicId) {
                const targetPayload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(targetDialog.publicId) + "/messages");
                const preparedTarget = await prepareDialogPayloadForDisplay(targetPayload.dialog || null, targetPayload.messages || []);
                if (preparedTarget?.dialog?.publicId) {
                  payload.selectedDialog = preparedTarget.dialog;
                  payload.messages = preparedTarget.messages || [];
                }
              }
            }
          }
          const preparedSelection = await prepareDialogPayloadForDisplay(payload.selectedDialog || null, payload.messages || []);
          if (
            routeIsUsername
            && !routeIsSecretUsernamePath
            && routedUsernameFromRoute
            && preparedSelection?.dialog?.encryptionMode === "e2e_v1"
            && ["direct", "private", "secret"].includes(preparedSelection?.dialog?.type)
          ) {
            const cloudDialogForUsername = allDialogs.find((dialog) => (
              getDialogUsernameFromSidebarDialog(dialog) === routedUsernameFromRoute
              && ["direct", "private"].includes(dialog?.type)
              && dialog?.encryptionMode !== "e2e_v1"
            ));
            if (cloudDialogForUsername?.publicId) {
              const cloudPayload = await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(cloudDialogForUsername.publicId) + "/messages");
              const preparedCloud = await prepareDialogPayloadForDisplay(cloudPayload.dialog || null, cloudPayload.messages || []);
              if (preparedCloud?.dialog?.publicId) {
                payload.selectedDialog = preparedCloud.dialog;
                payload.messages = preparedCloud.messages || [];
              }
            }
          }
          const finalSelection = await prepareDialogPayloadForDisplay(payload.selectedDialog || null, payload.messages || []);
          uiRenderDebug("loadWorkspace:fetched", {
            selectedDialogPublicId: finalSelection.dialog?.publicId || null,
            selectedMessageCount: Array.isArray(finalSelection.messages) ? finalSelection.messages.length : 0,
            dialogsCount: Array.isArray(payload.dialogs) ? payload.dialogs.length : 0
          });
          currentDialogId = finalSelection.dialog ? finalSelection.dialog.id : "";
          currentDialogPublicId = finalSelection.dialog ? finalSelection.dialog.publicId : "";
          if (currentDialogPublicId) {
            allDialogs = allDialogs.map((dialog) => dialog.publicId === currentDialogPublicId
              ? { ...dialog, unreadCount: 0 }
              : dialog);
          }
          peerActiveInCurrentDialog = false;
          currentPeerReadAt = finalSelection.dialog?.peerReadAt || null;
          if (currentSearchQuery.trim()) {
            renderSearchResults(currentSearchResults);
          } else {
            renderDialogs(allDialogs);
          }
          if (finalSelection.dialog?.publicId) {
            setDialogPayloadCache(finalSelection.dialog.publicId, finalSelection);
          }
          forceBottomOnNextDialogRender = Boolean(finalSelection.dialog?.publicId) && options.scrollBehavior !== "none";
          renderMessages(finalSelection.dialog, finalSelection.messages, {
            scrollBehavior: options.scrollBehavior || "auto",
            animateList: isInitialWorkspaceBoot,
            forceScrollBottom: Boolean(finalSelection.dialog?.publicId)
          });
          if (finalSelection.dialog?.publicId) {
            applyRoute(finalSelection.dialog.publicId);
          }
          if (finalSelection.dialog?.publicId) {
            warmupDialogMediaInBackground(finalSelection.messages, {
              targetPublicId: finalSelection.dialog.publicId,
              targetLoadToken: activeDialogLoadToken
            });
          }
          uiRenderDebug("loadWorkspace:renderMessages", {
            selectedDialogPublicId: finalSelection.dialog?.publicId || null,
            selectedMessageCount: Array.isArray(finalSelection.messages) ? finalSelection.messages.length : 0,
            options
          });
          if (pendingDialogPublicIdFromNotification && finalSelection.dialog?.publicId === pendingDialogPublicIdFromNotification) {
            pendingDialogPublicIdFromNotification = "";
          }
          bindNotificationPermissionPrompt();
          scheduleBackgroundRefresh();
          sendCurrentPresence();
          finishBoot(true);
        })();

        return workspaceLoadInFlightPromise.finally(() => {
          uiRenderDebug("loadWorkspace:finished");
          workspaceLoadInFlightPromise = null;
        });
      };

      window.addEventListener("popstate", () => {
        if (currentUserId) {
          void loadWorkspace().catch(() => {
            finishBoot(false);
          });
        }
      });

      startNotificationOwnershipHeartbeat();
      startPrimaryTabOwnershipHeartbeat();

      window.addEventListener("focus", () => {
        refreshNotificationOwnership();
        refreshPrimaryTabOwnership();
        scheduleBackgroundRefresh();
        if (typeof sendActiveState === "function") {
          sendActiveState(true);
        }
      });

      window.addEventListener("blur", () => {
        if (typeof sendActiveState === "function") {
          sendActiveState(false);
        }
      });

      document.addEventListener("visibilitychange", () => {
        refreshNotificationOwnership();
        refreshPrimaryTabOwnership();
        scheduleBackgroundRefresh();
        if (typeof sendActiveState === "function") {
          sendActiveState(document.visibilityState === "visible");
        }
      });

      window.addEventListener("storage", (event) => {
        if (event.key === ACTIVE_TAB_OWNER_STORAGE_KEY) {
          refreshPrimaryTabOwnership();
        }
      });

      window.addEventListener("beforeunload", () => {
        releasePrimaryTabOwnership();
      });

      const shouldBlockWorkspaceClipboard = () => !workspaceView.classList.contains("hidden");
      const isEditableTarget = (target) => {
        if (!(target instanceof Element)) {
          return false;
        }
        return Boolean(target.closest("input, textarea, [contenteditable='true'], [contenteditable='plaintext-only']"));
      };
      const isMessageTextTarget = (target) => {
        if (!(target instanceof Element)) {
          return false;
        }
        return Boolean(target.closest(".message-body, .message-reply-text"));
      };
      const hasAllowedMessageTextSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount < 1 || selection.isCollapsed) {
          return false;
        }
        const anchorNode = selection.anchorNode;
        const focusNode = selection.focusNode;
        const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
        const focusElement = focusNode instanceof Element ? focusNode : focusNode?.parentElement;
        return Boolean(
          anchorElement
          && focusElement
          && isMessageTextTarget(anchorElement)
          && isMessageTextTarget(focusElement)
        );
      };

      document.addEventListener("copy", (event) => {
        if (!shouldBlockWorkspaceClipboard()) {
          return;
        }
        if (hasAllowedMessageTextSelection()) {
          return;
        }
        event.preventDefault();
      });

      document.addEventListener("cut", (event) => {
        if (!shouldBlockWorkspaceClipboard()) {
          return;
        }
        if (hasAllowedMessageTextSelection()) {
          return;
        }
        event.preventDefault();
      });

      document.addEventListener("selectstart", (event) => {
        if (
          !shouldBlockWorkspaceClipboard()
          || isEditableTarget(event.target)
          || isMessageTextTarget(event.target)
        ) {
          return;
        }
        event.preventDefault();
      });

      document.addEventListener("contextmenu", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }

        if (workspaceView.classList.contains("hidden")) {
          return;
        }

        if (!target.closest("#workspace-view")) {
          return;
        }

        const allowNativeContextMenu = Boolean(
          target.closest("#composer-input, #attachment-modal-caption")
        );

        if (allowNativeContextMenu) {
          return;
        }

        event.preventDefault();
      });

      dialogList.addEventListener("contextmenu", (event) => {
        const target = event.target instanceof Element
          ? event.target.closest(".dialog-item[data-public-id]")
          : null;

        if (!target) {
          closeDialogContextMenu();
          return;
        }

        const publicId = target.getAttribute("data-public-id");
        const dialogId = target.getAttribute("data-dialog-id");
        if (!publicId || !dialogId) {
          closeDialogContextMenu();
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        openDialogContextMenu(event, { publicId, dialogId });
      });

      dialogContextMenu?.addEventListener("mouseenter", () => {
        if (dialogContextMenuCloseTimer) {
          window.clearTimeout(dialogContextMenuCloseTimer);
          dialogContextMenuCloseTimer = null;
        }
      });

      dialogContextMenu?.addEventListener("mouseleave", () => {
        closeDialogContextMenuSoon();
      });

      document.addEventListener("pointerdown", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }

        if (!target.closest("#dialog-context-menu")) {
          closeDialogContextMenu();
        }

        if (
          !target.closest("#sidebar-glass-menu")
          && !target.closest("#sidebar-menu-button")
          && workspaceSidebar?.classList.contains("menu-open")
        ) {
          setSidebarMenuOpen(false);
        }

        if (
          !target.closest("#sidebar-compose-menu")
          && !target.closest("#sidebar-compose-fab")
          && workspaceSidebar?.classList.contains("compose-open")
        ) {
          setSidebarComposeOpen(false);
        }
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && dialogContextMenu.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeDialogContextMenu();
          return;
        }

        if (event.key === "Escape" && workspaceSidebar?.classList.contains("menu-open")) {
          event.preventDefault();
          setSidebarMenuOpen(false);
          return;
        }

        if (event.key === "Escape" && workspaceSidebar?.classList.contains("compose-open")) {
          event.preventDefault();
          setSidebarComposeOpen(false);
          return;
        }

        if (event.key === "Escape" && groupCreatePanel && groupCreatePanel.getAttribute("aria-hidden") === "false") {
          event.preventDefault();
          event.stopPropagation();
          closeGroupCreatePanel();
          return;
        }

        if (event.key === "Escape" && sidebarProfilePanel && sidebarProfilePanel.getAttribute("aria-hidden") === "false") {
          event.preventDefault();
          event.stopPropagation();
          closeSidebarProfilePanel();
          return;
        }

        if (event.key === "Escape" && viewerModal.classList.contains("open")) {
          closeViewerModal();
          return;
        }

        if (event.key === "Escape" && chatProfilePanel.classList.contains("open")) {
          closeChatProfilePanel();
          return;
        }

        if (event.key === "Escape" && chatSearchPanel.classList.contains("open")) {
          closeChatSearch();
          return;
        }

        if (event.key === "Escape" && attachmentModal.classList.contains("open")) {
          event.preventDefault();
          event.stopPropagation();
          closeAttachmentModal();
          return;
        }

        if (attachmentModal.classList.contains("open") && event.key === "ArrowLeft") {
          event.preventDefault();
          moveAttachmentModal(-1);
          return;
        }

        if (attachmentModal.classList.contains("open") && event.key === "ArrowRight") {
          event.preventDefault();
          moveAttachmentModal(1);
          return;
        }

        if ((event.key === "+" || event.key === "=") && event.ctrlKey && viewerModal.classList.contains("open")) {
          event.preventDefault();
          setViewerZoom(viewerZoom + 0.14);
          return;
        }

        if (event.key === "-" && event.ctrlKey && viewerModal.classList.contains("open")) {
          event.preventDefault();
          setViewerZoom(viewerZoom - 0.14);
          return;
        }

        if (event.key === "Escape" && currentDialogId) {
          closeDialogWithMotion();
        }
      });

      sidebarSearch.addEventListener("input", () => {
        currentSearchQuery = sidebarSearch.value || "";
        if (searchDelayTimer) {
          window.clearTimeout(searchDelayTimer);
          searchDelayTimer = null;
        }

        if (!currentSearchQuery.trim()) {
          currentSearchResults = [];
          renderDialogs(allDialogs, { animate: true });
          return;
        }

        renderSearchLoadingState();
        const requestId = ++searchRequestId;
        searchDelayTimer = window.setTimeout(() => {
          void (async () => {
            try {
              const payload = await fetchJson(usersSearchApiUrl + "?q=" + encodeURIComponent(currentSearchQuery.trim()));

              if (requestId !== searchRequestId) {
                return;
              }

              currentSearchResults = payload.users || [];
              renderSearchResults(currentSearchResults);
            } catch (error) {
              if (requestId !== searchRequestId) {
                return;
              }

              currentSearchResults = [];
              dialogList.classList.remove("search-loading");
              dialogList.classList.add("search-empty");
              dialogList.innerHTML = '<div class="search-empty-state"><p class="search-empty-title">Search unavailable</p><p class="search-empty-copy">Failed to load users.</p></div>';
              showToast(error instanceof Error ? error.message : "Search is currently unavailable.", "error");
            }
          })();
        }, 240);
      });

      sidebarMenuButton?.addEventListener("click", () => {
        toggleSidebarMenu();
      });

      let composeHoverTimeout = null;

      const clearComposeHoverTimeout = () => {
        if (composeHoverTimeout) {
          clearTimeout(composeHoverTimeout);
          composeHoverTimeout = null;
        }
      };

      const startComposeCloseTimeout = () => {
        clearComposeHoverTimeout();
        composeHoverTimeout = setTimeout(() => {
          setSidebarComposeOpen(false);
        }, 300);
      };

      sidebarComposeFab?.addEventListener("click", (event) => {
        event.stopPropagation();
        clearComposeHoverTimeout();
        setSidebarComposeOpen(true);
      });

      sidebarComposeFab?.addEventListener("mouseenter", () => {
        clearComposeHoverTimeout();
        setSidebarComposeOpen(true);
      });

      sidebarComposeFab?.addEventListener("mouseleave", () => {
        startComposeCloseTimeout();
      });

      sidebarComposeMenu?.addEventListener("mouseenter", () => {
        clearComposeHoverTimeout();
      });

      sidebarComposeMenu?.addEventListener("mouseleave", () => {
        startComposeCloseTimeout();
      });

      const handleComposeAction = (label) => {
        setSidebarComposeOpen(false);
        showToast(label + " is coming soon.", "info");
      };

      sidebarComposeChannel?.addEventListener("click", (event) => {
        event.preventDefault();
      });
      sidebarComposeGroup?.addEventListener("click", () => {
        groupCreateMode = "group";
        if (groupCreateStepMembersTitle) {
          groupCreateStepMembersTitle.textContent = "Add Members";
        }
        if (groupCreateSearchInput) {
          groupCreateSearchInput.placeholder = "Add people...";
        }
        openGroupCreatePanel();
      });
      sidebarComposePrivate?.addEventListener("click", () => openSecretCreatePanel());
      groupCreateClose?.addEventListener("click", () => closeGroupCreatePanel());
      groupCreateNext?.addEventListener("click", () => {
        if (groupCreateMode === "secret") {
          const selectedCandidates = getGroupCreateSelectedCandidates();
          const selected = selectedCandidates[0] || null;
          const peerUserId = String(selected?.peerUserId || "").trim();
          if (!peerUserId) {
            return;
          }
          (async () => {
            try {
              const payload = await createSecretDirectDialog(peerUserId);
              const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog || null, payload.messages || []);
              if (!preparedPayload.dialog?.publicId) {
                throw new Error("Failed to open secret chat.");
              }
              setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
              const upsertedDialog = updateDialogInState(preparedPayload.dialog, {
                lastMessagePreview: preparedPayload.dialog.lastMessagePreview || "Secure messages",
                lastMessageSenderName: preparedPayload.dialog.lastMessageSenderName || null,
                lastMessageCreatedAt: preparedPayload.dialog.lastMessageCreatedAt || new Date().toISOString()
              });
              if (!upsertedDialog) {
                allDialogs.unshift(preparedPayload.dialog);
              }
              if (!currentSearchQuery.trim()) {
                renderDialogs(allDialogs);
              }
              closeGroupCreatePanel();
              await loadDialog(preparedPayload.dialog.publicId, { forceReload: true });
            } catch (error) {
              showToast(error instanceof Error ? error.message : "Failed to start secret chat.", "error");
            }
          })();
          return;
        }
        if (groupCreateStep === 1) {
          if (!groupCreateSelectedDialogIds.size) {
            return;
          }
          renderGroupCreateDetails();
          setGroupCreateStep(2);
          return;
        }
        const groupName = groupCreateNameInput ? (groupCreateNameInput.value || "New Group") : "New Group";
        const selectedCandidates = getGroupCreateSelectedCandidates();
        const memberUserIds = Array.from(new Set(
          selectedCandidates
            .map((dialog) => String(dialog.peerUserId || "").trim())
            .filter(Boolean)
        ));
        if (!memberUserIds.length) {
          showToast("Select at least one member with a valid user.", "info");
          return;
        }
        (async () => {
          try {
            const payload = await fetchJson(apiBase + "/v1/dialogs/group", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                title: groupName,
                memberUserIds,
                avatarDataUrl: groupCreatePhotoDataUrl || undefined
              })
            });
            const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.messages || []);
            setDialogPayloadCache(preparedPayload.dialog.publicId, preparedPayload);
            const updatedDialog = updateDialogInState(preparedPayload.dialog, {
              lastMessagePreview: "You created a group",
              lastMessageSenderName: "You",
              lastMessageCreatedAt: new Date().toISOString()
            });
            if (!updatedDialog) {
              allDialogs.unshift({
                ...preparedPayload.dialog,
                lastMessagePreview: "You created a group",
                lastMessageSenderName: "You",
                lastMessageCreatedAt: new Date().toISOString()
              });
            }
            if (!currentSearchQuery.trim()) {
              renderDialogs(allDialogs);
            }
            applyRoute(preparedPayload.dialog.publicId);
            closeGroupCreatePanel();
            void loadDialog(preparedPayload.dialog.publicId, { forceReload: true });
          } catch (error) {
            showToast(error instanceof Error ? error.message : "Failed to create group.", "error");
          }
        })();
      });
      groupCreateDetailsBack?.addEventListener("click", () => {
        setGroupCreateStep(1);
      });
      groupCreateSearchInput?.addEventListener("input", () => {
        groupCreateSearchQuery = groupCreateSearchInput.value || "";
        renderGroupCreateList();
      });
      groupCreatePhotoButton?.addEventListener("click", () => {
        groupCreatePhotoInput?.click();
      });
      groupCreatePhotoInput?.addEventListener("change", () => {
        const file = groupCreatePhotoInput.files && groupCreatePhotoInput.files[0] ? groupCreatePhotoInput.files[0] : null;
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const result = typeof reader.result === "string" ? reader.result : "";
          groupCreatePhotoDataUrl = result;
          if (groupCreatePhotoPreview && result) {
            groupCreatePhotoPreview.src = result;
            groupCreatePhotoButton?.classList.add("has-photo");
          }
        };
        reader.readAsDataURL(file);
        groupCreatePhotoInput.value = "";
      });
      groupCreateNameInput?.addEventListener("input", () => {
        groupCreateNameTouched = true;
      });

      const sidebarProfilePanel = document.getElementById("sidebar-profile-panel");


      const sidebarProfileBack = document.getElementById("sidebar-profile-back");
      const sidebarProfileAvatarEl = document.getElementById("sidebar-profile-avatar");
      const sidebarProfileDisplayName = document.getElementById("sidebar-profile-display-name");
      const sidebarProfileUsername = document.getElementById("sidebar-profile-username");

      const openSidebarProfilePanel = () => {
        if (!sidebarProfilePanel) { return; }
        // Populate display name
        const displayName = String(currentUserDisplayName || currentUserUsername || currentUserEmail || "You").trim();
        if (sidebarProfileDisplayName) {
          sidebarProfileDisplayName.textContent = displayName;
        }
        // Populate username
        const rawUsername = String(currentUserUsername || "").trim();
        if (sidebarProfileUsername) {
          sidebarProfileUsername.textContent = rawUsername ? ("@" + rawUsername) : "";
        }
        // Populate avatar
        if (sidebarProfileAvatarEl) {
          const avatarUrl = String(currentUserAvatarUrl || "").trim();
          if (avatarUrl) {
            sidebarProfileAvatarEl.innerHTML = '<img class="generated-avatar-photo" src="' + escapeHtml(avatarUrl) + '" alt="' + escapeHtml(displayName) + '" />';
            sidebarProfileAvatarEl.removeAttribute("style");
          } else {
            const meta = typeof getAvatarMeta === "function"
              ? getAvatarMeta(currentUserId || displayName, displayName)
              : null;
            if (meta) {
              sidebarProfileAvatarEl.innerHTML = '<img class="generated-avatar-photo" src="' + meta.avatarUrl + '" alt="' + escapeHtml(meta.letter || "?") + '" />';
              sidebarProfileAvatarEl.style.cssText = meta.style || "";
            } else {
              const seed = String(currentUserId || displayName || "?");
              const palettes = [["#6cb5ff","#4a8fe9"],["#ff9f6c","#ea6d4a"],["#7de3b2","#39b67f"],["#f7a6d8","#d66ab3"],["#b49cff","#7f69ee"],["#ffd56a","#f0a93e"],["#7fd4ff","#3d8fe0"]];
              let h = 0;
              for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h + seed.charCodeAt(i)) | 0; }
              const pal = palettes[Math.abs(h) % palettes.length];
              const raw = displayName.trim().split(/\\s+/);
              let ltr = raw.length >= 2 ? (raw[0][0] || "") + (raw[1][0] || "") : displayName.slice(0, 2);
              ltr = ltr.toUpperCase();
              const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + pal[0] + '"/><stop offset="100%" stop-color="' + pal[1] + '"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(#pg)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Roboto,sans-serif" font-size="56" font-weight="700">' + escapeHtml(ltr) + '</text></svg>';
              sidebarProfileAvatarEl.innerHTML = '<img class="generated-avatar-photo" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '" alt="' + escapeHtml(ltr) + '" />';
              sidebarProfileAvatarEl.style.cssText = "--avatar-start:" + pal[0] + ";--avatar-end:" + pal[1] + ";";
            }
          }
        }
        gsapOpenSidebar(sidebarProfilePanel);
      };

      const closeSidebarProfilePanel = () => {
        gsapCloseSidebar(sidebarProfilePanel);
      };

      sidebarMenuProfile?.addEventListener("click", () => {
        setSidebarMenuOpen(false);
        openSidebarProfilePanel();
      });

      sidebarProfileBack?.addEventListener("click", () => {
        closeSidebarProfilePanel();
      });

      sidebarMenuSaved?.addEventListener("click", () => {
        const savedDialog = allDialogs.find((dialog) => dialog.type === "saved");
        setSidebarMenuOpen(false);
        const targetPublicId = savedDialog?.publicId || "-1002003143";
        void loadDialog(targetPublicId, { scrollBehavior: "auto" });
      });

      sidebarMenuLogout?.addEventListener("click", () => {
        if (!logoutButton || logoutButton.disabled) {
          return;
        }
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement) {
          activeElement.blur();
        }
        setSidebarMenuOpen(false);
        logoutButton.click();
      });

      syncSidebarWidth();

      sidebarResizeHandle.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        startSidebarResize(event.clientX);
      });

      sidebarResizeHandle.addEventListener("dblclick", () => {
        applySidebarWidth(360);
      });

      window.addEventListener("pointermove", (event) => {
        updateSidebarResize(event.clientX);
      });

      window.addEventListener("pointerup", () => {
        stopSidebarResize();
      });

      window.addEventListener("pointercancel", () => {
        stopSidebarResize();
      });

      window.addEventListener("resize", () => {
        syncSidebarWidth();
      });

      composerInput.addEventListener("input", () => {
        syncComposerState();

        if (!currentDialogId || !realtimeEnabled) {
          return;
        }

        if (!composerInput.value.trim()) {
          sendTypingState(false);
          return;
        }

        sendTypingState(true);
        scheduleTypingStop();
      });

      ["select", "keyup", "mouseup", "focus", "blur"].forEach((eventName) => {
        composerInput.addEventListener(eventName, () => {
          renderComposerOverlay();
        });
      });

      const sendCurrentMessage = async () => {
        if (textMessageSendInFlight) {
          return;
        }

        const body = composerInput.value.trim();

        if (!body || !currentDialogPublicId) {
          return;
        }

        const isGifUrl = (body.startsWith("http://") || body.startsWith("https://")) &&
                         (body.split("?")[0].split("#")[0].toLowerCase().endsWith(".gif"));
        if (isGifUrl) {
          rememberRecentGif(body);
        }

        textMessageSendInFlight = true;
        composerSend.disabled = true;
        const replyContext = pendingReplyMessage
          ? {
              id: pendingReplyMessage.id || null,
              senderId: pendingReplyMessage.senderId || null,
              senderName: pendingReplyMessage.senderName || null,
              body: pendingReplyMessage.body || null,
              type: pendingReplyMessage.type || null,
              mediaUrl: pendingReplyMessage.mediaUrl || null
            }
          : null;
        const localMessageId = "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 60000);
        localOutgoingMessages.push({
          id: localMessageId,
          dialogPublicId: currentDialogPublicId,
          senderId: currentUserId,
          senderName: currentUserDisplayName || currentUserUsername || workspaceUserName.textContent || "You",
          body,
          type: "text",
          mediaUrl: null,
          attachmentMime: null,
          replyToMessageId: replyContext?.id || null,
          replyToSenderId: replyContext?.senderId || null,
          replyToSenderName: replyContext?.senderName || null,
          replyToBody: replyContext?.body || null,
          replyToType: replyContext?.type || null,
          replyToMediaUrl: replyContext?.mediaUrl || null,
          createdAt: new Date().toISOString(),
          localStatus: "pending",
          animateOnRender: true
        });
        clearPendingReplyMessage();
        composerInput.value = "";
        composerInput.style.height = "48px";
        composerInput.style.overflowY = "hidden";
        syncComposerState();
        composerInput.focus({ preventScroll: true });
        if (typingStopTimer) {
          window.clearTimeout(typingStopTimer);
          typingStopTimer = null;
        }
        sendTypingState(false);
        const appendedLocal = appendLocalOutgoingMessageToCurrentDialog(localOutgoingMessages[localOutgoingMessages.length - 1], {
          scrollBehavior: "smooth",
          forceScrollBottom: true
        });
        if (!appendedLocal) {
          rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
        }
        playSound("send");

        try {
          const payload = isSecureDialog(currentDialogSnapshot)
            ? await (async () => {
                const encrypted = await encryptSecureMessageBody(currentDialogSnapshot, body);
                return fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    ciphertext: encrypted.ciphertext,
                    nonce: encrypted.nonce,
                    senderKeyId: encrypted.senderKeyId || undefined,
                    replyToMessageId: replyContext?.id || undefined
                  }),
                  signal: controller.signal
                });
              })()
            : await fetchJson(apiBase + "/v1/dialogs/by-public-id/" + encodeURIComponent(currentDialogPublicId) + "/messages", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  body,
                  replyToMessageId: replyContext?.id || undefined
                }),
                signal: controller.signal
              });
          const preparedPayload = await prepareDialogPayloadForDisplay(payload.dialog, payload.message ? [payload.message] : []);
          const preparedMessage = preparedPayload.messages[0] || payload.message;

          removeLocalOutgoingMessage(localMessageId);
          updateDialogInState(preparedPayload.dialog, {
            lastMessagePreview: getMessagePreviewText(preparedMessage) || body,
            lastMessageSenderName: preparedMessage.senderId === currentUserId
              ? "You"
              : (preparedMessage.senderName || preparedPayload.dialog?.title || ""),
            lastMessageCreatedAt: preparedMessage.createdAt || preparedPayload.dialog?.lastMessageCreatedAt || ""
          });
          if (preparedPayload.dialog?.id === currentDialogId && preparedMessage) {
            appendConfirmedMessageToCurrentDialog(preparedPayload.dialog, preparedMessage, {
              scrollBehavior: "smooth",
              animateList: false,
              forceScrollBottom: true,
              animateMessage: false,
              replaceMessageId: localMessageId
            });
          } else {
            rerenderCurrentDialog({ scrollBehavior: "smooth", animateList: false, forceScrollBottom: true });
          }

          if (!currentSearchQuery.trim()) {
            renderDialogs(allDialogs);
          }
        } catch (error) {
          localOutgoingMessages = localOutgoingMessages.map((message) => (
            message.id === localMessageId
              ? { ...message, localStatus: "failed" }
              : message
          ));
          setStatus(error instanceof Error ? error.message : "Failed to send message.", "error");
          showToast(error instanceof Error ? error.message : "Failed to send message.", "error");
          updateRenderedMessageStatus(localMessageId, "failed");
        } finally {
          window.clearTimeout(timeoutId);
          composerSend.disabled = false;
          textMessageSendInFlight = false;
        }
      };

      composerSend.addEventListener("click", () => {
        void sendCurrentMessage();
      });

      composerEmojiButton.addEventListener("mouseenter", () => {
        openEmojiPicker();
      });

      composerEmojiButton.addEventListener("mouseleave", () => {
        scheduleEmojiPickerClose();
      });

      composerEmojiButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (emojiPicker.classList.contains("open")) {
          closeEmojiPicker();
        } else {
          openEmojiPicker();
        }
      });

      const renderAttachmentEmojiPicker = () => {
        const emojiTabIcons = {
          recent: "⏱️",
          people: "😃",
          nature: "🐼",
          food: "🍔",
          activity: "⚽",
          travel: "🚗",
          objects: "💡",
          symbols: "🔣",
          flags: "🏁"
        };
        const recentSection = {
          ...emojiSections[0],
          emojis: readRecentEmojis()
        };
        const sections = [recentSection].concat(emojiSections.slice(1));

        attachmentModalEmojiPickerHead.innerHTML = sections.map((section, index) => {
          const emojiChar = emojiTabIcons[section.key] || "";
          const emojiAssetUrl = getEmojiAssetUrl(emojiChar);
          const iconHtml = emojiAssetUrl
            ? '<img class="emoji-picker-tab-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emojiChar) + '" onerror=\\\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\\\' aria-hidden="true" loading="lazy" decoding="async">'
            : '<span class="emoji-picker-tab-fallback">' + escapeHtml(emojiChar) + '</span>';

          return '<button class="emoji-picker-tab' + (index === 0 ? ' active' : '') + '" type="button" data-emoji-tab="' + section.key + '" aria-label="' + escapeHtml(section.title) + '">' +
            iconHtml +
          '</button>';
        }).join("");

        attachmentModalEmojiPickerBody.innerHTML = sections.map((section) => (
          '<section class="emoji-picker-section" data-emoji-section="' + section.key + '">' +
            '<p class="emoji-picker-title">' + escapeHtml(section.title) + '</p>' +
            (
              section.emojis.length
                ? '<div class="emoji-picker-grid">' + section.emojis.map((emoji) => (
                  (() => {
                    const emojiAssetUrl = getEmojiAssetUrl(emoji);
                    return (
                  '<button class="emoji-button" type="button" data-emoji-value="' + escapeHtml(emoji) + '" aria-label="' + escapeHtml(emoji) + '">' +
                    (
                      emojiAssetUrl
                        ? '<img class="emoji-button-image" src="' + escapeHtml(emojiAssetUrl) + '" alt="' + escapeHtml(emoji) + '" onerror=\\\'if(!/-fe0f/.test(this.src) && !this.dataset.triedFe0f){this.dataset.triedFe0f=true;this.src=this.src.replace(/[.]png$/,"-fe0f.png");}else if(/-fe0f/.test(this.src) && !this.dataset.triedNoFe0f){this.dataset.triedNoFe0f=true;this.src=this.src.replace(/-fe0f[.]png$/,".png");}else{this.outerHTML=this.alt;}\\\' aria-hidden="true" loading="lazy" decoding="async">'
                        : '<span class="emoji-button-image" aria-hidden="true">' + escapeHtml(emoji) + '</span>'
                    ) +
                  '</button>'
                    );
                  })()
                )).join("") + '</div>'
                : '<div class="emoji-picker-title">Nothing here yet</div>'
            ) +
          '</section>'
        )).join("");

        attachmentModalEmojiPickerHead.querySelectorAll("[data-emoji-tab]").forEach((button) => {
          button.addEventListener("click", () => {
            const key = button.getAttribute("data-emoji-tab");
            if (!key) {
              return;
            }
            attachmentModalEmojiPickerHead.querySelectorAll("[data-emoji-tab]").forEach((node) => node.classList.toggle("active", node === button));
            const targetSection = attachmentModalEmojiPickerBody.querySelector('[data-emoji-section="' + key + '"]');
            if (targetSection) {
              const targetScrollTop = targetSection.getBoundingClientRect().top - attachmentModalEmojiPickerBody.getBoundingClientRect().top + attachmentModalEmojiPickerBody.scrollTop;
              attachmentModalEmojiPickerBody.scrollTo({
                top: targetScrollTop,
                behavior: "smooth"
              });
            }
          });
        });

        attachmentModalEmojiPickerBody.querySelectorAll("[data-emoji-value]").forEach((button) => {
          button.addEventListener("click", () => {
            const emoji = button.getAttribute("data-emoji-value");
            if (!emoji) {
              return;
            }

            const selectionStart = attachmentModalCaption.selectionStart ?? attachmentModalCaption.value.length;
            const selectionEnd = attachmentModalCaption.selectionEnd ?? attachmentModalCaption.value.length;
            attachmentModalCaption.value = attachmentModalCaption.value.slice(0, selectionStart) + emoji + attachmentModalCaption.value.slice(selectionEnd);
            pendingImageCaption = attachmentModalCaption.value;
            attachmentModalCaption.focus();
            attachmentModalCaption.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
            rememberRecentEmoji(emoji);
            renderAttachmentEmojiPicker();
          });
        });
      };

      const closeAttachmentEmojiPicker = () => {
        attachmentModalEmojiPicker.classList.remove("open");
        attachmentModalEmojiPicker.setAttribute("aria-hidden", "true");
      };

      const openAttachmentEmojiPicker = () => {
        renderAttachmentEmojiPicker();
        attachmentModalEmojiPicker.classList.add("open");
        attachmentModalEmojiPicker.setAttribute("aria-hidden", "false");
      };

      attachmentModalEmojiButton?.addEventListener("click", (event) => {
        event.preventDefault();
        if (attachmentModalEmojiPicker.classList.contains("open")) {
          closeAttachmentEmojiPicker();
        } else {
          openAttachmentEmojiPicker();
        }
      });

      emojiPicker.addEventListener("mouseenter", () => {
        openEmojiPicker();
      });

      emojiPicker.addEventListener("mouseleave", () => {
        scheduleEmojiPickerClose();
      });

      if (emojiPickerSearch) {
        emojiPickerSearch.addEventListener("input", () => {
          if (pickerMode === "emoji") {
            renderEmojiPicker();
          } else {
            renderGifPicker();
          }
        });
      }

      if (emojiModeTabEmoji) {
        emojiModeTabEmoji.addEventListener("click", (e) => {
          e.preventDefault();
          setPickerMode("emoji");
        });
      }

      if (emojiModeTabGif) {
        emojiModeTabGif.addEventListener("click", (e) => {
          e.preventDefault();
          setPickerMode("gif");
        });
      }

      // Touch-swipe support on emoji picker slide container
      const emojiPickerSlideContainer = emojiPicker.querySelector(".emoji-picker-slide-container");
      if (emojiPickerSlideContainer && emojiPickerSlideTrack) {
        let startX = 0;
        let startY = 0;
        let isSwiping = false;

        emojiPickerSlideContainer.addEventListener("pointerdown", (e) => {
          if (e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea")) {
            return;
          }
          startX = e.clientX;
          startY = e.clientY;
          isSwiping = true;
          emojiPickerSlideTrack.classList.add("no-transition");
        });

        document.addEventListener("pointermove", (e) => {
          if (!isSwiping) return;
          const diffX = e.clientX - startX;
          const diffY = e.clientY - startY;

          // If vertical scroll is dominating, cancel swipe
          if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 10) {
            isSwiping = false;
            emojiPickerSlideTrack.classList.remove("no-transition");
            emojiPickerSlideTrack.style.transform = pickerMode === "gif" ? "translateX(-50%)" : "translateX(0)";
            return;
          }

          const pickerWidth = emojiPickerSlideContainer.offsetWidth;
          const basePercent = pickerMode === "gif" ? -50 : 0;
          const changePercent = (diffX / (pickerWidth * 2)) * 100;
          let newPercent = basePercent + changePercent;
          
          newPercent = Math.max(-55, Math.min(5, newPercent));
          
          emojiPickerSlideTrack.style.transform = "translateX(" + newPercent + "%)";
        });

        const endSwipe = (e) => {
          if (!isSwiping) return;
          isSwiping = false;
          emojiPickerSlideTrack.classList.remove("no-transition");

          const diffX = e.clientX - startX;
          const pickerWidth = emojiPickerSlideContainer.offsetWidth;
          const threshold = pickerWidth * 0.2;

          if (diffX < -threshold && pickerMode === "emoji") {
            setPickerMode("gif");
          } else if (diffX > threshold && pickerMode === "gif") {
            setPickerMode("emoji");
          } else {
            emojiPickerSlideTrack.style.transform = pickerMode === "gif" ? "translateX(-50%)" : "translateX(0)";
          }
        };

        document.addEventListener("pointerup", endSwipe);
        document.addEventListener("pointercancel", endSwipe);
      }

      document.addEventListener("pointerdown", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }
        if (!target.closest("#emoji-picker") && !target.closest("#composer-emoji-button")) {
          closeEmojiPicker();
        }
        if (!target.closest("#attachment-modal-emoji-picker") && !target.closest("#attachment-modal-emoji-button")) {
          closeAttachmentEmojiPicker();
        }
        if (!target.closest("#attach-menu") && !target.closest("#composer-attach-button")) {
          closeAttachMenu();
        }
      });

      composerAttachButton.addEventListener("mouseenter", () => {
        openAttachMenu();
      });

      composerAttachButton.addEventListener("mouseleave", () => {
        scheduleAttachMenuClose();
      });

      attachMenu.addEventListener("mouseenter", () => {
        openAttachMenu();
      });

      attachMenu.addEventListener("mouseleave", () => {
        scheduleAttachMenuClose();
      });

      composerAttachButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (attachMenu.classList.contains("open")) {
          closeAttachMenu();
        } else {
          openAttachMenu();
        }
      });

      attachMenu.querySelectorAll(".attach-menu-item").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.classList.contains("disabled")) {
            return;
          }

          button.classList.add("pressed");
          window.setTimeout(() => {
            button.classList.remove("pressed");
          }, 120);

          if (button.dataset.attachAction === "media") {
            closeAttachMenu();
            if (pendingImageAttachments.length || pendingFileAttachments.length) {
              clearPendingImageAttachment();
            }
            composerFileInput.setAttribute("accept", "image/png,image/jpeg,image/webp,image/gif");
            composerFileInput.dataset.attachMode = "media";
            composerFileInput.multiple = true;
            composerFileInput.click();
            return;
          }

          if (button.dataset.attachAction === "file") {
            closeAttachMenu();
            if (pendingImageAttachments.length || pendingFileAttachments.length) {
              clearPendingImageAttachment();
            }
            composerFileInput.setAttribute("accept", "audio/*");
            composerFileInput.dataset.attachMode = "file";
            composerFileInput.multiple = true;
            composerFileInput.click();
          }
        });
      });

      composerFileInput.addEventListener("change", () => {
        const files = Array.from(composerFileInput.files || []);
        const attachMode = composerFileInput.dataset.attachMode || "media";
        composerFileInput.value = "";
        if (files.length && attachMode === "media") {
          void addPendingImageAttachments(files);
          return;
        }
        if (files.length && attachMode === "file") {
          void addPendingFileAttachments(files);
        }
      });

      composerAttachmentRemove.addEventListener("click", () => {
        clearPendingImageAttachment();
      });

      attachmentModalClose.addEventListener("click", () => {
        closeAttachmentModal();
      });

      attachmentModalPrev.addEventListener("click", () => {
        moveAttachmentModal(-1);
      });

      attachmentModalNext.addEventListener("click", () => {
        moveAttachmentModal(1);
      });

      attachmentModal.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;

        if (!target) {
          return;
        }

        if (
          !target.closest(".attachment-modal-content")
          && !target.closest(".attachment-modal-main")
          && !target.closest(".attachment-modal-footer")
          && !target.closest(".attachment-modal-header")
          && !target.closest(".attachment-modal-nav")
          && !target.closest(".attachment-modal-strip")
        ) {
          closeAttachmentModal();
        }
      });

      attachmentModalCaption.addEventListener("input", () => {
        pendingImageCaption = attachmentModalCaption.value;
      });

      attachmentModalCaption.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          attachmentModalSend.click();
        }
      });

      attachmentModalSend.addEventListener("click", () => {
        void (async () => {
          if (mediaMessageSendInFlight) {
            return;
          }

          if (attachmentModalMode === "file") {
            if (!pendingFileAttachments.length) {
              return;
            }
            mediaMessageSendInFlight = true;
            attachmentModalSend.disabled = true;
            attachmentModalCaption.disabled = true;
            const attachmentsToSend = pendingFileAttachments.slice();
            const previewUrlsToPreserve = attachmentsToSend.map((attachment) => attachment.previewUrl);
            const caption = attachmentModalCaption.value.trim();
            clearPendingImageAttachment({ preservePreviewUrls: previewUrlsToPreserve });
            try {
              await uploadAudioBatch({
                attachments: attachmentsToSend,
                caption
              });
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Failed to send audio.", "error");
              showToast(error instanceof Error ? error.message : "Failed to send audio.", "error");
            } finally {
              attachmentModalSend.disabled = false;
              attachmentModalCaption.disabled = false;
              mediaMessageSendInFlight = false;
            }
            return;
          }
          if (!pendingImageAttachments.length) {
            return;
          }

          mediaMessageSendInFlight = true;
          attachmentModalSend.disabled = true;
          attachmentModalCaption.disabled = true;

          const attachmentsToSend = pendingImageAttachments.slice();
          const previewUrlsToPreserve = attachmentsToSend.map((attachment) => attachment.previewUrl);
          const caption = attachmentModalCaption.value.trim();
          clearPendingImageAttachment({ preservePreviewUrls: previewUrlsToPreserve });

          try {
            await uploadImageBatch({
              attachments: attachmentsToSend,
              caption
            });
          } catch (error) {
            setStatus(error instanceof Error ? error.message : "Failed to send photos.", "error");
            showToast(error instanceof Error ? error.message : "Failed to send photos.", "error");
          } finally {
            attachmentModalSend.disabled = false;
            attachmentModalCaption.disabled = false;
            mediaMessageSendInFlight = false;
          }
        })();
      });

      composerInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          void sendCurrentMessage();
        }
      });

      composerInput.addEventListener("paste", (event) => {
        const imageItems = Array.from(event.clipboardData?.items || []).filter((item) => item.type.startsWith("image/"));

        if (!imageItems.length) {
          return;
        }

        event.preventDefault();
        void addPendingImageAttachments(
          imageItems
            .map((item) => item.getAsFile())
            .filter(Boolean)
        );
      });

      ["dragenter", "dragover"].forEach((eventName) => {
        chatStage.addEventListener(eventName, (event) => {
          const hasImages = Array.from(event.dataTransfer?.items || []).some((item) => item.type.startsWith("image/"));

          if (!hasImages) {
            return;
          }

          event.preventDefault();
          chatStage.classList.add("drag-active");
        });
      });

      ["dragleave", "dragend", "drop"].forEach((eventName) => {
        chatStage.addEventListener(eventName, () => {
          chatStage.classList.remove("drag-active");
        });
      });

      chatStage.addEventListener("drop", (event) => {
        const files = Array.from(event.dataTransfer?.files || []).filter((file) => String(file.type || "").startsWith("image/"));

        if (!files.length) {
          return;
        }

        event.preventDefault();
        void addPendingImageAttachments(files);
      });

      // TheGraphT Chat AI Panel interactions
      const sidebarAiPanel = document.getElementById("sidebar-ai-panel");
      const sidebarAiButton = document.getElementById("sidebar-ai-button");
      const sidebarAiClose = document.getElementById("sidebar-ai-close");
      const sidebarAiMessages = document.getElementById("sidebar-ai-messages");
      const sidebarAiInput = document.getElementById("sidebar-ai-input");
      const sidebarAiSend = document.getElementById("sidebar-ai-send");
      const sidebarAiPillsWrap = document.getElementById("sidebar-ai-pills-wrap");
      const sidebarAiPills = document.getElementById("sidebar-ai-pills");
      let aiHistory = [];
      let activeAiController = null;

      // Translate vertical mouse wheel scrolling to horizontal scroll for pills wrapper
      if (sidebarAiPillsWrap) {
        sidebarAiPillsWrap.addEventListener("wheel", (e) => {
          if (e.deltaY !== 0) {
            e.preventDefault();
            sidebarAiPillsWrap.scrollTo({
              left: sidebarAiPillsWrap.scrollLeft + e.deltaY * 1.5,
              behavior: "auto"
            });
          }
        });
      }

      // Gather visible chat messages for AI context
      const gatherChatContext = () => {
        const messageListEl = document.getElementById("message-list");
        if (!messageListEl) return "";
        
        // Only target actual messages or rows in the main chat pane (excluding AI sidebar messages)
        const messageEls = messageListEl.querySelectorAll(".message, .group-incoming-row, .message-system-row");
        const lines = [];
        const maxMessages = 40;
        const start = Math.max(0, messageEls.length - maxMessages);
        
        const peerName = currentDialogSnapshot ? (currentDialogSnapshot.title || "Собеседник") : "Собеседник";
        const myName = workspaceUserName ? (workspaceUserName.textContent || "Я") : "Я";
        
        for (let i = start; i < messageEls.length; i++) {
          const el = messageEls[i];
          
          // System message row
          if (el.classList.contains("message-system-row")) {
            const pill = el.querySelector(".message-system-pill");
            if (pill) {
              lines.push("[Системное сообщение]: " + pill.textContent.trim());
            }
            continue;
          }
          
          // Check incoming state
          let isIncoming = el.classList.contains("incoming");
          if (el.classList.contains("group-incoming-row")) {
            isIncoming = true;
          }
          
          const bubble = el.classList.contains("message") ? el : el.querySelector(".message");
          if (!bubble) continue;
          
          // Determine sender name
          let sender = "";
          if (isIncoming) {
            const groupSender = el.querySelector(".group-incoming-sender");
            sender = groupSender ? groupSender.textContent.trim() : peerName;
          } else {
            sender = myName + " (Вы)";
          }
          
          // Find text
          const body = bubble.querySelector(".message-body, .message-text");
          let text = body ? body.textContent.trim() : "";
          
          // Handle attachment fallback descriptions
          if (!text) {
            const msgType = bubble.getAttribute("data-message-type");
            const attName = bubble.getAttribute("data-attachment-name");
            if (msgType === "image") {
              text = "[Изображение/Фото: " + (attName || "Без названия") + "]";
            } else if (msgType === "audio") {
              text = "[Голосовое сообщение/Аудио: " + (attName || "Без названия") + "]";
            }
          }
          
          if (text) {
            lines.push(sender + ": " + text);
          }
        }
        
        const activeChatMeta = "=== ИНФОРМАЦИЯ ОБ ОТКРЫТОМ ЧАТЕ ===\\n" +
          "Название чата: " + peerName + "\\n" +
          "Тип чата: " + (currentDialogSnapshot ? (currentDialogSnapshot.type || "Личный чат") : "Личный чат") + "\\n" +
          "Текущий пользователь: " + myName + "\\n" +
          "=================================\\n\\n" +
          lines.join("\\n");
        return activeChatMeta;
      };

      // Smart Context-Aware Randomized Pill Generator
      const getPillsForContext = (isInitial, replyText = "") => {
        const contextText = gatherChatContext();
        const isRussian = /[а-яА-ЯёЁ]/.test(contextText) || /[а-яА-ЯёЁ]/.test(replyText) || (navigator.language && navigator.language.toLowerCase().startsWith("ru"));
        const peerName = currentDialogSnapshot ? (currentDialogSnapshot.title || (isRussian ? "собеседник" : "partner")) : (isRussian ? "собеседник" : "partner");

        // Analyze topics in the context & replyText
        const lowerContext = (contextText + " " + replyText).toLowerCase();
        
        const hasCode = lowerContext.includes("code") || lowerContext.includes("function") || lowerContext.includes("код") || lowerContext.includes("функция") || lowerContext.includes("ошибка") || lowerContext.includes("баг") || lowerContext.includes("js") || lowerContext.includes("html") || lowerContext.includes("css");
        const hasVideo = lowerContext.includes("video") || lowerContext.includes("media") || lowerContext.includes("видео") || lowerContext.includes("медиа") || lowerContext.includes("монтаж") || lowerContext.includes("клип") || lowerContext.includes("звук") || lowerContext.includes("аудио") || lowerContext.includes("youtube");
        const hasTasks = lowerContext.includes("plan") || lowerContext.includes("task") || lowerContext.includes("checklist") || lowerContext.includes("план") || lowerContext.includes("задач") || lowerContext.includes("цель") || lowerContext.includes("сделать") || lowerContext.includes("todo") || lowerContext.includes("проект");
        const hasChat = lowerContext.includes("summary") || lowerContext.includes("chat") || lowerContext.includes("conversation") || lowerContext.includes("выжимка") || lowerContext.includes("чат") || lowerContext.includes("переписка") || lowerContext.includes("сообщение") || lowerContext.includes("диалог");

        const ruPools = {
          initial: {
            general: [
              { label: "💬 Сделай выжимку чата", prompt: "Сделай краткую выжимку этого чата" },
              { label: "✍️ Помоги ответить", prompt: "Помоги мне написать вежливый ответ на последние сообщения" },
              { label: "🔍 Проанализируй чат", prompt: "Что мне нужно знать об этой переписке?" },
              { label: "🌐 Переведи на английский", prompt: "Переведи последние сообщения на английский язык" },
              { label: "💡 Предложи идею", prompt: "Дай мне интересную или креативную идею на сегодня" },
              { label: "📅 Составь план дня", prompt: "Помоги мне составить эффективный план на день" },
              { label: "❓ Что ты умеешь?", prompt: "Расскажи, чем ты можешь мне помочь в этом чате?" }
            ],
            chat: [
              { label: "📊 Кто активнее в чате?", prompt: "Кто самый активный участник в этой переписке?" },
              { label: "📌 Главные темы беседы", prompt: "Какие ключевые темы обсуждались в этом чате?" },
              { label: "🤝 О чем договорились?", prompt: "Сделай список договоренностей и решений из этого чата" },
              { label: "🎭 Какой тон беседы?", prompt: "Какая атмосфера и тон общения в этом чате?" }
            ],
            code: [
              { label: "💻 Объясни этот код", prompt: "Объясни, как работает этот программный код в переписке" },
              { label: "⚡ Оптимизируй код", prompt: "Как можно сделать этот код более быстрым и понятным?" },
              { label: "🐞 Найди баги", prompt: "Проверь код в этом чате на наличие ошибок или уязвимостей" }
            ],
            video: [
              { label: "🎬 Сценарий для видео", prompt: "Предложи креативный сценарий для короткого видео" },
              { label: "✂️ Как быстро монтировать?", prompt: "Дай советы по быстрому и качественному монтажу видео" },
              { label: "🎙️ Как улучшить звук?", prompt: "Как записать чистый и качественный звук для ролика?" }
            ],
            tasks: [
              { label: "📝 Чеклист задач", prompt: "Составь структурированный список задач на основе чата" },
              { label: "🚀 Какие наши шаги?", prompt: "Каковы наши следующие шаги по обсуждаемому проекту?" },
              { label: "🎯 Расставь приоритеты", prompt: "Помоги мне расставить приоритеты для этих задач" }
            ]
          },
          followUp: {
            general: [
              { label: "Продолжай", prompt: "Продолжай развивать эту мысль дальше" },
              { label: "Объясни подробнее", prompt: "Можешь объяснить этот момент подробнее?" },
              { label: "Дай мне пример", prompt: "Приведи практический пример для этого" },
              { label: "Можно попроще?", prompt: "Объясни это простыми словами для новичка" },
              { label: "Какие альтернативы?", prompt: "Какие еще есть варианты или альтернативные подходы?" },
              { label: "Дай практический совет", prompt: "Дай мне один конкретный совет, который я могу применить прямо сейчас" }
            ],
            chat: [
              { label: "Сделай выжимку подробнее", prompt: "Сделай более детальную выжимку этой беседы" },
              { label: "Как вежливо ответить " + peerName + "?", prompt: "Напиши несколько вариантов вежливого ответа для " + peerName },
              { label: "Как отказать " + peerName + "?", prompt: "Напиши вежливый и мягкий отказ для " + peerName },
              { label: "Выдели самое важное", prompt: "Покажи только самые критически важные тезисы из этого" }
            ],
            code: [
              { label: "Напиши тест-кейс", prompt: "Напиши модульный тест (unit test) для этой функции" },
              { label: "Сделай рефакторинг", prompt: "Предложи красивый рефакторинг этого решения" },
              { label: "Добавь комментарии", prompt: "Добавь понятные JSDoc комментарии к коду" }
            ],
            video: [
              { label: "Напиши детальный план", prompt: "Напиши подробную раскадровку для этого видео-сценария" },
              { label: "Какие инструменты нужны?", prompt: "Какой софт лучше использовать для реализации этого?" },
              { label: "Как продвигать ролик?", prompt: "Дай советы по продвижению этого видео на YouTube или TikTok" }
            ],
            tasks: [
              { label: "Преврати в чеклист", prompt: "Оформи эти пункты в виде красивого чеклиста задач" },
              { label: "С чего начать?", prompt: "Какой самый первый шаг мне нужно сделать прямо сейчас?" },
              { label: "Оцени риски", prompt: "Какие основные сложности или риски могут возникнуть при реализации?" }
            ]
          }
        };

        const enPools = {
          initial: {
            general: [
              { label: "💬 Summarize chat", prompt: "Summarize this chat for me concisely" },
              { label: "✍️ Help me reply", prompt: "Help me write a polite reply to the last messages" },
              { label: "🔍 Analyze chat", prompt: "What should I know about this conversation?" },
              { label: "🌐 Translate to English", prompt: "Translate the last messages in this chat to English" },
              { label: "💡 Give me an idea", prompt: "Give me an interesting or creative idea for today" },
              { label: "📅 Plan my day", prompt: "Help me create an efficient schedule for my day" },
              { label: "❓ What can you do?", prompt: "Explain what features you have and how you can help me here" }
            ],
            chat: [
              { label: "📊 Who is most active?", prompt: "Who is the most active participant in this chat?" },
              { label: "📌 Main discussion topics", prompt: "What are the primary topics discussed in this conversation?" },
              { label: "🤝 What was agreed?", prompt: "Make a list of agreements and decisions from this chat" },
              { label: "🎭 Conversation tone?", prompt: "What is the tone and mood of this conversation?" }
            ],
            code: [
              { label: "💻 Explain code", prompt: "Explain how the code in this chat works" },
              { label: "⚡ Optimize code", prompt: "How can this code be made faster and more readable?" },
              { label: "🐞 Find bugs", prompt: "Check the code in this chat for bugs or vulnerabilities" }
            ],
            video: [
              { label: "🎬 Video script idea", prompt: "Suggest a creative script for a short video" },
              { label: "✂️ Faster video editing", prompt: "Give me tips on editing videos faster and better" },
              { label: "🎙️ High-quality audio", prompt: "How do I record clear, professional audio for videos?" }
            ],
            tasks: [
              { label: "📝 Task checklist", prompt: "Create a structured task checklist based on this conversation" },
              { label: "🚀 Our next steps", prompt: "What are our next steps for this project?" },
              { label: "🎯 Prioritize tasks", prompt: "Help me prioritize these items" }
            ]
          },
          followUp: {
            general: [
              { label: "Continue", prompt: "Please continue expanding on this" },
              { label: "Explain further", prompt: "Can you explain this point in more detail?" },
              { label: "Give me an example", prompt: "Give me a practical, real-world example of this" },
              { label: "Can you simplify?", prompt: "Explain this in very simple terms for a beginner" },
              { label: "What are the alternatives?", prompt: "What are other ways or alternative approaches to this?" },
              { label: "Give a practical tip", prompt: "Give me one highly actionable tip I can use right now" }
            ],
            chat: [
              { label: "Detailed summary", prompt: "Provide a more detailed summary of this chat" },
              { label: "Reply to " + peerName, prompt: "Write a polite response to " + peerName },
              { label: "Decline " + peerName, prompt: "Write a polite and soft decline message to " + peerName },
              { label: "Show main bullet points", prompt: "Extract only the absolute key bullet points from this" }
            ],
            code: [
              { label: "Write a test case", prompt: "Write a unit test for this code" },
              { label: "Refactor this code", prompt: "Suggest a elegant refactoring of this code block" },
              { label: "Add comments", prompt: "Add clear documentation or comments to this code" }
            ],
            video: [
              { label: "Write a detailed plan", prompt: "Write a step-by-step storyboard for this video script" },
              { label: "What tools to use?", prompt: "What software or tools do you recommend for this?" },
              { label: "How to promote?", prompt: "How do I promote this video effectively on YouTube/TikTok?" }
            ],
            tasks: [
              { label: "Turn into checklist", prompt: "Format these items as a clean checklist" },
              { label: "Where should I start?", prompt: "What is the very first step I should take right now?" },
              { label: "Identify risks", prompt: "What are the potential risks or roadblocks here?" }
            ]
          }
        };

        const activePools = isRussian ? ruPools : enPools;
        const currentCategory = isInitial ? activePools.initial : activePools.followUp;

        // Collect matching items
        let candidates = [...currentCategory.general];
        if (hasChat) candidates = candidates.concat(currentCategory.chat);
        if (hasCode) candidates = candidates.concat(currentCategory.code);
        if (hasVideo) candidates = candidates.concat(currentCategory.video);
        if (hasTasks) candidates = candidates.concat(currentCategory.tasks);

        // Shuffle candidates using a secure random sort
        const shuffled = candidates.sort(() => 0.5 - Math.random());

        // Deduplicate based on label and take first 3 or 4
        const unique = [];
        const seen = new Set();
        for (const item of shuffled) {
          if (!seen.has(item.label)) {
            seen.add(item.label);
            unique.push(item);
          }
          if (unique.length >= (isInitial ? 4 : 3)) break;
        }

        return unique;
      };

      // Regenerate initial welcome pills
      const regenerateInitialPills = () => {
        if (!sidebarAiPills) return;
        const pills = getPillsForContext(true);
        sidebarAiPills.innerHTML = pills.map((p) => {
          return '<button class="sidebar-ai-pill" type="button" data-prompt="' + escapeHtml(p.prompt) + '">' + escapeHtml(p.label) + '</button>';
        }).join("");
        
        // Re-setup quick prompts clicking
        sidebarAiPills.querySelectorAll(".sidebar-ai-pill").forEach((pill) => {
          pill.addEventListener("click", () => {
            const prompt = pill.getAttribute("data-prompt");
            if (!prompt || !sidebarAiInput) return;
            sidebarAiInput.value = prompt;
            void sendAiMessage();
          });
        });
      };

      // Render follow-up suggestion pills after assistant reply
      const renderFollowUps = (replyText) => {
        const pills = getPillsForContext(false, replyText);
        const wrap = document.createElement("div");
        wrap.className = "sidebar-ai-follow-up";
        pills.forEach((p) => {
          const pill = document.createElement("button");
          pill.className = "sidebar-ai-follow-up-pill";
          pill.type = "button";
          pill.textContent = p.label;
          pill.addEventListener("click", () => {
            if (sidebarAiInput) sidebarAiInput.value = p.prompt;
            void sendAiMessage();
          });
          wrap.appendChild(pill);
        });
        sidebarAiMessages.appendChild(wrap);
        sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
      };

      // Handle and render reply suggestions if present
      const handleAiReplySuggestions = (fullReply, streamBubble) => {
        const suggestionsWrap = document.getElementById("sidebar-ai-suggestions-wrap");
        const suggestionsContainer = document.getElementById("sidebar-ai-suggestions");
        if (!suggestionsWrap || !suggestionsContainer) return;

        // Reset suggestions
        suggestionsWrap.classList.add("hidden");
        suggestionsContainer.innerHTML = "";

        const suggestionsMatch = fullReply.match(/\[SUGGESTIONS\]([\\s\\S]*?)\[\/SUGGESTIONS\]/);
        if (suggestionsMatch) {
          const rawBlock = suggestionsMatch[1];
          const suggestions = rawBlock
            .split("\\n")
            .map((s) => s.trim().replace(/^[-*•+]\\s*/, "").replace(/^\\\[[-*•+]\\s*\\\]/, "").trim())
            .filter((s) => s.length > 0);

          if (suggestions.length > 0) {
            suggestions.forEach((text) => {
              const pill = document.createElement("button");
              pill.className = "sidebar-ai-suggestion-pill";
              pill.type = "button";
              pill.textContent = text;

              pill.addEventListener("click", () => {
                const composerInput = document.getElementById("composer-input");
                if (composerInput) {
                  // Flyer Animation
                  const rectStart = pill.getBoundingClientRect();
                  const rectEnd = composerInput.getBoundingClientRect();

                  const flyer = document.createElement("div");
                  flyer.className = "sidebar-ai-flyer-pill";
                  flyer.textContent = text;
                  flyer.style.position = "fixed";
                  flyer.style.left = rectStart.left + "px";
                  flyer.style.top = rectStart.top + "px";
                  flyer.style.width = rectStart.width + "px";
                  flyer.style.height = rectStart.height + "px";
                  flyer.style.zIndex = "99999";
                  flyer.style.pointerEvents = "none";
                  flyer.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
                  document.body.appendChild(flyer);

                  // Trigger animation
                  requestAnimationFrame(() => {
                    flyer.style.left = rectEnd.left + "px";
                    flyer.style.top = rectEnd.top + "px";
                    flyer.style.width = rectEnd.width + "px";
                    flyer.style.height = rectEnd.height + "px";
                    flyer.style.opacity = "0";
                    flyer.style.transform = "scale(0.85) rotate(1deg)";
                  });

                  setTimeout(() => {
                    flyer.remove();
                    composerInput.value = text;
                    composerInput.dispatchEvent(new Event("input", { bubbles: true }));
                    composerInput.focus();

                    // Hide suggestions after use
                    suggestionsWrap.classList.add("hidden");
                  }, 600);
                } else {
                  // Fallback
                  const suggestionsAlert = document.createElement("div");
                  suggestionsAlert.style.position = "fixed";
                  suggestionsAlert.style.bottom = "80px";
                  suggestionsAlert.style.right = "20px";
                  suggestionsAlert.style.background = "rgba(239, 68, 68, 0.9)";
                  suggestionsAlert.style.color = "#fff";
                  suggestionsAlert.style.padding = "8px 16px";
                  suggestionsAlert.style.borderRadius = "8px";
                  suggestionsAlert.style.zIndex = "99999";
                  suggestionsAlert.style.fontSize = "13px";
                  suggestionsAlert.textContent = "Please open a chat to insert this reply.";
                  document.body.appendChild(suggestionsAlert);
                  setTimeout(() => suggestionsAlert.remove(), 2500);
                }
              });

              suggestionsContainer.appendChild(pill);
            });

            suggestionsWrap.classList.remove("hidden");
          }

          // Strip [SUGGESTIONS] block from message bubble text
          const cleanText = fullReply.replace(/\[SUGGESTIONS\][\\s\\S]*?\[\/SUGGESTIONS\]/, "").trim();
          streamBubble.innerHTML = parseMarkdown(cleanText);
        }
      };

      const parseMarkdown = (txt) => {
        if (!txt) return "";
        var html = escapeHtml(txt);
        // Code Block
        var codeBlockRegex = new RegExp(String.fromCharCode(96) + "{3}([^]*?)" + String.fromCharCode(96) + "{3}", "g");
        html = html.replace(codeBlockRegex, "<pre><code>$1</code></pre>");
        // Inline Code
        var inlineCodeRegex = new RegExp(String.fromCharCode(96) + "([^" + String.fromCharCode(96) + String.fromCharCode(10) + "]+)" + String.fromCharCode(96), "g");
        html = html.replace(inlineCodeRegex, "<code>$1</code>");
        // URL Linkification
        var urlRegex = new RegExp("(https?:\\/\\/[^\\s<>'\\\"]+[^\\s\\.\\,\\<\\>\\'\\\"])", "gi");
        html = html.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
        // Bold-Italic (***)
        var boldItalicRegex = new RegExp("[*][*][*]([^*]+)[*][*][*]", "g");
        html = html.replace(boldItalicRegex, "<strong><em>$1</em></strong>");
        // Bold (**)
        var boldRegex = new RegExp("[*][*]([^*]+)[*][*]", "g");
        html = html.replace(boldRegex, "<strong>$1</strong>");
        // Italic (*)
        var italicRegex = new RegExp("[*]([^*]+)[*]", "g");
        html = html.replace(italicRegex, "<em>$1</em>");
        
        return html.split(String.fromCharCode(10)).map(function(p) {
          return p.trim() ? "<p>" + p + "</p>" : "";
        }).join("");
      };

      const renderAiBubble = (text, isUser = false) => {
        const bubble = document.createElement("div");
        bubble.className = "sidebar-ai-bubble " + (isUser ? "user" : "assistant");
        
        if (!isUser) {
          bubble.innerHTML = parseMarkdown(text);
        } else {
          bubble.innerHTML = "<p>" + escapeHtml(text) + "</p>";
        }
        
        sidebarAiMessages.appendChild(bubble);
        sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
      };

      const sendAiMessage = async () => {
        // Toggle Stop Generation behavior if currently streaming
        if (activeAiController) {
          activeAiController.abort();
          activeAiController = null;
          if (sidebarAiSend) {
            sidebarAiSend.classList.remove("is-streaming");
            sidebarAiSend.innerHTML = '<span class="lucide" aria-hidden="true">arrow_upward</span>';
          }
          
          // Append italicized stopped label
          const stopLabel = document.createElement("div");
          stopLabel.className = "sidebar-ai-stopped-label";
          stopLabel.innerHTML = "<em>Your message was stopped</em>";
          sidebarAiMessages.appendChild(stopLabel);
          sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
          return;
        }

        // Reset suggestions panel
        const suggestionsWrap = document.getElementById("sidebar-ai-suggestions-wrap");
        const suggestionsContainer = document.getElementById("sidebar-ai-suggestions");
        if (suggestionsWrap && suggestionsContainer) {
          suggestionsWrap.classList.add("hidden");
          suggestionsContainer.innerHTML = "";
        }

        const messageText = sidebarAiInput.value.trim();
        if (!messageText) return;
        
        sidebarAiInput.value = "";
        sidebarAiInput.style.height = "auto";
        
        // Remove welcome screen if it exists
        const welcome = sidebarAiMessages.querySelector(".sidebar-ai-welcome");
        if (welcome) {
          welcome.remove();
        }
        
        // Render user message bubble
        renderAiBubble(messageText, true);
        
        // Hide initial quick prompt pills after first message
        if (sidebarAiPillsWrap) sidebarAiPillsWrap.style.display = "none";

        // Remove previous follow-up pills
        sidebarAiMessages.querySelectorAll(".sidebar-ai-follow-up").forEach((el) => el.remove());

        // Create an empty assistant bubble that will be filled in real-time
        const streamBubble = document.createElement("div");
        streamBubble.className = "sidebar-ai-bubble assistant is-generating";
        streamBubble.innerHTML = '<span class="sidebar-ai-cursor"></span>';
        sidebarAiMessages.appendChild(streamBubble);
        sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });

        // Build chat context from visible messages
        const chatContext = gatherChatContext();
        let fullReply = "";
        
        // Calculate exact user local time and timezone
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const userLocalTime = new Date().toLocaleString("ru-RU", {
          timeZone: userTimeZone,
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short"
        });
        
        activeAiController = new AbortController();
        if (sidebarAiSend) {
          sidebarAiSend.classList.add("is-streaming");
          sidebarAiSend.innerHTML = '<div style="width: 12px; height: 12px; background: #ea5656; border-radius: 2px;"></div>';
        }

        // --- GOOGLE GEMINI PRO CLIENT-SIDE OR BACKEND PROXY STREAMING ---
        if (currentAiModel === "pro") {
          const apiKey = localStorage.getItem("gemini_api_key");
          if (apiKey) {
            try {
              console.log("[TheGraphT AI] Direct client-side streaming to Google Gemini Pro. Model: gemini-2.5-flash");
              const contents = [];
              let finalSystemText = systemPrompt;
              if (chatContext) {
                finalSystemText += "\\n\\n[CONTEXT: CURRENTLY OPEN CHAT WINDOW]\\n" + chatContext;
              }
              contents.push({
                role: "user",
                parts: [{ text: finalSystemText + "\\n\\nUser Prompt: " + messageText }]
              });
              
              const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=" + apiKey, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: activeAiController.signal,
                body: JSON.stringify({
                  contents: contents,
                  generationConfig: {
                    temperature: 0.6,
                    maxOutputTokens: 384
                  }
                })
              });
              
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error?.message || "Gemini API returned status: " + res.status);
              }
              
              const reader = res.body.getReader();
              const decoder = new TextDecoder();
              let buffer = "";
              let chunkIndex = 0;
              
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                chunkIndex++;
                console.log("[TheGraphT AI] Direct Direct-Chunk #" + chunkIndex + ", size: " + value.length + " bytes");
                
                buffer += decoder.decode(value, { stream: true });
                
                let startIdx = 0;
                while (true) {
                  const openBrace = buffer.indexOf("{", startIdx);
                  if (openBrace === -1) break;
                  
                  let braceCount = 0;
                  let closeBrace = -1;
                  for (let i = openBrace; i < buffer.length; i++) {
                    if (buffer[i] === "{") braceCount++;
                    else if (buffer[i] === "}") {
                      braceCount--;
                      if (braceCount === 0) {
                        closeBrace = i;
                        break;
                      }
                    }
                  }
                  
                  if (closeBrace === -1) break;
                  
                  const jsonStr = buffer.slice(openBrace, closeBrace + 1);
                  startIdx = closeBrace + 1;
                  
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    if (text) {
                      console.log("[TheGraphT AI] Direct Parsed token successfully:", JSON.stringify(text));
                      fullReply += text;
                      streamBubble.innerHTML = parseMarkdown(fullReply) + '<span class="sidebar-ai-cursor"></span>';
                      sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
                    }
                  } catch (_) {}
                }
                
                if (startIdx > 0) {
                  buffer = buffer.slice(startIdx);
                }
              }
              
              if (fullReply) {
                streamBubble.innerHTML = parseMarkdown(fullReply);
                handleAiReplySuggestions(fullReply, streamBubble);
              } else {
                streamBubble.innerHTML = "<p>Could not get a response.</p>";
              }
              
              renderFollowUps(fullReply);
              
              aiHistory.push({ role: "user", content: messageText });
              aiHistory.push({ role: "assistant", content: fullReply });
              if (aiHistory.length > 20) {
                aiHistory = aiHistory.slice(-20);
              }
            } catch (err) {
              if (err.name === "AbortError" || err.message.includes("aborted")) {
                return;
              }
              streamBubble.innerHTML = "<p>Error: " + escapeHtml(err.message) + "</p>";
            } finally {
              activeAiController = null;
              streamBubble.classList.remove("is-generating");
              if (sidebarAiSend) {
                sidebarAiSend.classList.remove("is-streaming");
                sidebarAiSend.innerHTML = '<span class="lucide" aria-hidden="true">arrow_upward</span>';
              }
            }
            return;
          }
        }

        // --- LOCAL OLLAMA BASE OR SECURE GEMINI PRO STREAMING ---
        try {
          console.log("[TheGraphT AI] Sending request to backend. Model:", currentAiModel, "Message length:", messageText.length);
          const startTime = Date.now();
          
          const res = await fetch(apiBase + "/v1/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: activeAiController.signal,
            body: JSON.stringify({
              message: messageText,
              history: aiHistory,
              chatContext: chatContext,
              clientTime: userLocalTime,
              clientTimeZone: userTimeZone,
              model: currentAiModel
            })
          });
          
          console.log("[TheGraphT AI] Received response from backend. Status:", res.status, "Time taken:", Date.now() - startTime, "ms");
          
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            console.error("[TheGraphT AI] Backend returned error status:", res.status, "Data:", data);
            throw new Error(data.error || "AI is temporarily unavailable");
          }
          
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let chunkIndex = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("[TheGraphT AI] Stream reader completed.");
              break;
            }
            
            chunkIndex++;
            console.log("[TheGraphT AI] Received chunk #" + chunkIndex + ", size: " + value.length + " bytes");
            
            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split(String.fromCharCode(10) + String.fromCharCode(10));
            buffer = events.pop();
            
            for (const event of events) {
              const dataLine = event.trim();
              if (!dataLine.startsWith("data: ")) continue;
              const payload = dataLine.slice(6);
              if (payload === "[DONE]") {
                console.log("[TheGraphT AI] Received [DONE] event payload.");
                continue;
              }
              
              try {
                const parsed = JSON.parse(payload);
                if (parsed.error) {
                  console.error("[TheGraphT AI] Payload contains error field:", parsed.error);
                  throw new Error(parsed.error);
                }
                if (parsed.token) {
                  console.log("[TheGraphT AI] Parsed token successfully:", JSON.stringify(parsed.token));
                  fullReply += parsed.token;
                  streamBubble.innerHTML = parseMarkdown(fullReply) + '<span class="sidebar-ai-cursor"></span>';
                  sidebarAiMessages.scrollTo({ top: sidebarAiMessages.scrollHeight, behavior: "smooth" });
                }
              } catch (parseErr) {
                if (parseErr.message !== "Stream interrupted") {
                  console.warn("[TheGraphT AI] JSON parse warning on payload:", payload, parseErr);
                }
              }
            }
          }
          
          if (fullReply) {
            streamBubble.innerHTML = parseMarkdown(fullReply);
            handleAiReplySuggestions(fullReply, streamBubble);
          } else {
            streamBubble.innerHTML = "<p>Could not get a response.</p>";
          }
          
          renderFollowUps(fullReply);
          
          aiHistory.push({ role: "user", content: messageText });
          aiHistory.push({ role: "assistant", content: fullReply });
          if (aiHistory.length > 20) {
            aiHistory = aiHistory.slice(-20);
          }
        } catch (err) {
          if (err.name === "AbortError" || err.message.includes("aborted")) {
            return;
          }
          console.error("[TheGraphT AI] Error inside the streaming loop:", err);
          streamBubble.innerHTML = "<p>Error: " + escapeHtml(err.message) + "</p>";
        } finally {
          activeAiController = null;
          streamBubble.classList.remove("is-generating");
          if (sidebarAiSend) {
            sidebarAiSend.classList.remove("is-streaming");
            sidebarAiSend.innerHTML = '<span class="lucide" aria-hidden="true">arrow_upward</span>';
          }
        }
      };

      if (sidebarAiButton) {
        sidebarAiButton.addEventListener("click", () => {
          gsapOpenSidebar(sidebarAiPanel);
          
          // Regenerate initial pills when opening the panel
          regenerateInitialPills();
          if (sidebarAiPillsWrap && sidebarAiMessages.querySelector(".sidebar-ai-welcome")) {
            sidebarAiPillsWrap.style.display = "block";
          }
          
          window.setTimeout(() => {
            sidebarAiInput?.focus();
          }, 150);
        });
      }

      if (sidebarAiClose) {
        sidebarAiClose.addEventListener("click", () => {
          gsapCloseSidebar(sidebarAiPanel);
        });
      }

      // Close on Escape press
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebarAiPanel && sidebarAiPanel.getAttribute("aria-hidden") === "false") {
          gsapCloseSidebar(sidebarAiPanel);
        }
      });

      if (sidebarAiInput) {
        // Auto-grow textarea height
        sidebarAiInput.addEventListener("input", () => {
          sidebarAiInput.style.height = "auto";
          sidebarAiInput.style.height = sidebarAiInput.scrollHeight + "px";
        });
        
        // Enter key to send (Shift+Enter for new line)
        sidebarAiInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void sendAiMessage();
          }
        });
      }

      if (sidebarAiSend) {
        sidebarAiSend.addEventListener("click", () => {
          void sendAiMessage();
        });
      }

      // --- MODEL SELECTOR & GEMINI API KEY LOGIC ---
      const sidebarAiModelSelectorBtn = document.getElementById("sidebar-ai-model-selector-btn");
      const sidebarAiSelectedModelName = document.getElementById("sidebar-ai-selected-model-name");
      const sidebarAiSelectedModelIcon = document.getElementById("sidebar-ai-selected-model-icon");
      const sidebarAiSelectorChevron = document.getElementById("sidebar-ai-selector-chevron");
      const sidebarAiModelMenu = document.getElementById("sidebar-ai-model-menu");
      const sidebarAiCheckBase = document.getElementById("sidebar-ai-check-base");
      const sidebarAiCheckPro = document.getElementById("sidebar-ai-check-pro");
      
      let currentAiModel = "base";
      localStorage.setItem("sidebar_ai_model", "base");

      const updateSelectedModelUI = () => {
        if (sidebarAiCheckPro) {
          sidebarAiCheckPro.textContent = currentAiModel === "pro" ? "check" : "";
          sidebarAiCheckPro.style.color = currentAiModel === "pro" ? "#6366f1" : "#9da5b4";
        }
        
        if (sidebarAiCheckBase) {
          sidebarAiCheckBase.textContent = currentAiModel === "base" ? "check" : "";
        }
        
        if (sidebarAiSelectedModelName) {
          sidebarAiSelectedModelName.textContent = currentAiModel === "pro" ? "TheGraphT Chat Pro" : "TheGraphT Chat (Base)";
        }
        
        if (sidebarAiSelectedModelIcon) {
          sidebarAiSelectedModelIcon.textContent = currentAiModel === "pro" ? "auto_awesome" : "mode_fan";
          sidebarAiSelectedModelIcon.style.color = currentAiModel === "pro" ? "#a5b4fc" : "#9da5b4";
        }
        
        sidebarAiModelMenu?.querySelectorAll(".sidebar-ai-model-menu-item").forEach((el) => {
          const mod = el.getAttribute("data-model");
          el.classList.toggle("active", mod === currentAiModel);
        });
      };

      if (sidebarAiModelSelectorBtn) {
        sidebarAiModelSelectorBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = sidebarAiModelMenu?.classList.contains("open");
          sidebarAiModelMenu?.classList.toggle("open", !isOpen);
          sidebarAiModelMenu?.setAttribute("aria-hidden", isOpen ? "true" : "false");
          if (sidebarAiSelectorChevron) {
            sidebarAiSelectorChevron.style.transform = isOpen ? "rotate(0)" : "rotate(180deg)";
          }
        });
      }

      window.addEventListener("click", () => {
        if (sidebarAiModelMenu?.classList.contains("open")) {
          sidebarAiModelMenu.classList.remove("open");
          sidebarAiModelMenu.setAttribute("aria-hidden", "true");
          if (sidebarAiSelectorChevron) {
            sidebarAiSelectorChevron.style.transform = "rotate(0)";
          }
        }
      });

      sidebarAiModelMenu?.querySelectorAll(".sidebar-ai-model-menu-item").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const modelType = el.getAttribute("data-model");
          
          if (modelType === "base") {
            currentAiModel = "base";
            localStorage.setItem("sidebar_ai_model", "base");
            updateSelectedModelUI();
          } else if (modelType === "pro") {
            // Pro model is locked until June 15
            const proAlert = document.createElement("div");
            proAlert.style.position = "fixed";
            proAlert.style.bottom = "80px";
            proAlert.style.right = "20px";
            proAlert.style.left = "20px";
            proAlert.style.background = "linear-gradient(135deg, #1e1b4b, #312e81)";
            proAlert.style.border = "1px solid rgba(99, 102, 241, 0.35)";
            proAlert.style.color = "#c7d2fe";
            proAlert.style.padding = "16px";
            proAlert.style.borderRadius = "16px";
            proAlert.style.zIndex = "99999";
            proAlert.style.fontSize = "14px";
            proAlert.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.15)";
            proAlert.style.display = "flex";
            proAlert.style.flexDirection = "column";
            proAlert.style.gap = "8px";
            proAlert.style.transition = "all 0.3s ease";
            
            proAlert.innerHTML = '<div style="display:flex; align-items:center; gap:8px; font-weight:700; color:#fff;"><span class="lucide" style="color:#a5b4fc; font-size:18px;">lock</span>TheGraphT Chat Pro</div><div style="font-size:13px; opacity:0.9; line-height:1.4;">Интеллектуальная модель станет доступна <strong>15 июня</strong>! Мы готовим для вас самое мощное ИИ-обновление.</div>';
            document.body.appendChild(proAlert);
            setTimeout(() => {
              proAlert.style.opacity = "0";
              proAlert.style.transform = "translateY(8px)";
              setTimeout(() => proAlert.remove(), 300);
            }, 4000);
          }
          
          sidebarAiModelMenu.classList.remove("open");
          if (sidebarAiSelectorChevron) sidebarAiSelectorChevron.style.transform = "rotate(0)";
        });
      });

      // Initial call to sync UI
      updateSelectedModelUI();

      // Setup initial quick prompts clicking & trigger first load generation
      regenerateInitialPills();

`;
