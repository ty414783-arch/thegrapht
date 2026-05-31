export const viewerModal = () => `
      messageList.addEventListener("click", (event) => {
        const groupAvatarHit = event.target instanceof Element ? event.target.closest(".group-incoming-avatar-hit[data-sender-id]") : null;
        if (groupAvatarHit) {
          const senderId = String(groupAvatarHit.getAttribute("data-sender-id") || "").trim();
          if (senderId) {
            void openDirectDialogForUser(senderId, { openProfile: true });
          }
          return;
        }

        const imageLink = event.target instanceof Element ? event.target.closest(".message-image-link") : null;

        if (!imageLink) {
          return;
        }

        event.preventDefault();
        const imageNode = imageLink.querySelector(".message-image");
        const imageRect = imageNode?.getBoundingClientRect();
        openViewerModal({
          src: imageLink.getAttribute("data-image-url") || "",
          fallbackSrc: imageLink.getAttribute("data-image-fallback-url") || "",
          senderName: imageLink.getAttribute("data-sender-name") || "TheGraphT",
          senderId: imageLink.getAttribute("data-sender-id") || "",
          createdAt: imageLink.getAttribute("data-created-at") || "",
          sourceRect: imageRect
            ? {
                left: imageRect.left + imageRect.width / 2,
                top: imageRect.top + imageRect.height / 2,
                width: imageRect.width,
                height: imageRect.height
              }
            : null
        });
      });

      messageList.addEventListener("dragstart", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) {
          return;
        }
        if (target.closest(".message-image, .message-image-link, .message-album-item")) {
          event.preventDefault();
        }
      });

      messageList.addEventListener("auxclick", (event) => {
        const imageLink = event.target instanceof Element ? event.target.closest(".message-image-link") : null;
        if (!imageLink) {
          return;
        }
        event.preventDefault();
      });

      viewerModalClose.addEventListener("click", () => {
        closeViewerModal();
      });

      viewerModal.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;

        if (!target) {
          return;
        }

        if (
          !target.closest(".viewer-modal-image")
          && !target.closest(".viewer-modal-header")
          && !target.closest(".viewer-zoom-chip")
        ) {
          closeViewerModal();
        }
      });

      viewerModal.addEventListener("wheel", handleViewerWheelZoom, { passive: false });
      viewerModalStage.addEventListener("wheel", handleViewerWheelZoom, { passive: false });
      viewerModalImage.addEventListener("wheel", handleViewerWheelZoom, { passive: false });

      viewerZoomOut.addEventListener("click", () => {
        if (!viewerModal.classList.contains("open")) {
          return;
        }
        setViewerZoom(viewerZoom - 0.15);
      });

      viewerZoomIn.addEventListener("click", () => {
        if (!viewerModal.classList.contains("open")) {
          return;
        }
        setViewerZoom(viewerZoom + 0.15);
      });


`;
