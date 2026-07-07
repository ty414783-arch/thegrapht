// Viewer Modal Logic (Event listeners for image zoom and transitions)
export {};

const getWin = () => window as any;
declare const escapeHtml: (v: any) => string;

let viewerZoom = 1;
let viewerSourceRect: { left: number; top: number; width: number; height: number } | null = null;
let viewerCleanupTimer: number | null = null;
let viewerLoadToken = 0;

const VIEWER_MIN_ZOOM = 0.5;
const VIEWER_MAX_ZOOM = 4.0;

const formatViewerTimestamp = (value: any) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getViewerTargetRect = () => {
  const viewerModalImage = document.getElementById("viewer-modal-image") as HTMLImageElement | null;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const imageRatio = viewerModalImage && viewerModalImage.naturalWidth > 0 && viewerModalImage.naturalHeight > 0
    ? viewerModalImage.naturalWidth / viewerModalImage.naturalHeight
    : 1;
  const topInset = Math.max(72, Math.floor(viewportHeight * 0.08));
  const bottomInset = Math.max(136, Math.floor(viewportHeight * 0.14));
  const sideInset = Math.max(48, Math.floor(viewportWidth * 0.08));
  const maxWidth = Math.max(260, viewportWidth - (sideInset * 2));
  const maxHeight = Math.max(220, viewportHeight - topInset - bottomInset);
  let width = maxWidth;
  let height = width / imageRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * imageRatio;
  }

  return {
    left: viewportWidth / 2,
    top: viewportHeight / 2,
    width,
    height
  };
};

const applyViewerRect = (rect: { left: number; top: number; width: number; height: number }, zoom = viewerZoom, borderRadius = 24) => {
  const viewerModalImage = document.getElementById("viewer-modal-image");
  const viewerZoomValue = document.getElementById("viewer-zoom-value");
  if (viewerModalImage) {
    viewerModalImage.style.left = rect.left + "px";
    viewerModalImage.style.top = rect.top + "px";
    viewerModalImage.style.width = rect.width + "px";
    viewerModalImage.style.height = rect.height + "px";
    viewerModalImage.style.borderRadius = borderRadius + "px";
    viewerModalImage.style.transform = "translate(-50%, -50%) scale(" + zoom + ")";
    viewerModalImage.classList.toggle("zoomed", zoom > 1.01);
  }
  if (viewerZoomValue) {
    viewerZoomValue.textContent = Math.round(zoom * 100) + "%";
  }
};

const setViewerZoom = (nextZoom: number) => {
  viewerZoom = Math.max(VIEWER_MIN_ZOOM, Math.min(VIEWER_MAX_ZOOM, nextZoom));
  applyViewerRect(getViewerTargetRect(), viewerZoom, 24);
};

const closeViewerModal = () => {
  const viewerModal = document.getElementById("viewer-modal");
  const viewerZoomChip = document.getElementById("viewer-zoom-chip");
  const viewerModalImage = document.getElementById("viewer-modal-image") as HTMLImageElement | null;
  if (!viewerModal || !viewerModal.classList.contains("open")) {
    return;
  }

  const fallbackRect = viewerSourceRect || {
    left: window.innerWidth / 2,
    top: window.innerHeight / 2,
    width: 80,
    height: 80
  };

  viewerZoom = 1;
  viewerModal.classList.remove("open");
  applyViewerRect(fallbackRect, 1, 18);
  if (viewerZoomChip) {
    viewerZoomChip.setAttribute("aria-hidden", "true");
  }

  viewerLoadToken += 1;
  if (viewerCleanupTimer) {
    window.clearTimeout(viewerCleanupTimer);
    viewerCleanupTimer = null;
  }

  viewerCleanupTimer = window.setTimeout(() => {
    if (viewerModal) {
      viewerModal.setAttribute("aria-hidden", "true");
    }
    if (viewerModalImage) {
      viewerModalImage.onload = null;
      viewerModalImage.onerror = null;
      if (viewerModal && !viewerModal.classList.contains("open")) {
        viewerModalImage.removeAttribute("src");
      }
    }
    viewerSourceRect = null;
    viewerCleanupTimer = null;
  }, 280);
};

const openViewerModal = ({ src, fallbackSrc, senderName, senderId, createdAt, sourceRect, realAvatarUrl }: {
  src: string;
  fallbackSrc?: string;
  senderName?: string;
  senderId?: string;
  createdAt?: string;
  sourceRect?: { left: number; top: number; width: number; height: number } | null;
  realAvatarUrl?: string;
}) => {
  const viewerModal = document.getElementById("viewer-modal");
  const viewerAuthorAvatar = document.getElementById("viewer-author-avatar");
  const viewerAuthorName = document.getElementById("viewer-author-name");
  const viewerAuthorMeta = document.getElementById("viewer-author-meta");
  const viewerZoomChip = document.getElementById("viewer-zoom-chip");
  const viewerModalImage = document.getElementById("viewer-modal-image") as HTMLImageElement | null;

  if (!src || !viewerModal || !viewerModalImage) {
    return;
  }

  if (viewerCleanupTimer) {
    window.clearTimeout(viewerCleanupTimer);
    viewerCleanupTimer = null;
  }

  const loadToken = ++viewerLoadToken;
  viewerSourceRect = sourceRect || {
    left: window.innerWidth / 2,
    top: window.innerHeight / 2,
    width: 120,
    height: 120
  };
  viewerZoom = 1;

  if (viewerAuthorAvatar) {
    const avatarUrl = realAvatarUrl || "";
    if (avatarUrl) {
      viewerAuthorAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + escapeHtml(avatarUrl) + '" alt="' + escapeHtml(senderName || "?") + '" />';
      viewerAuthorAvatar.removeAttribute("style");
    } else {
      const getAvatarMeta = getWin().getAvatarMeta;
      if (typeof getAvatarMeta === "function") {
        const avatar = getAvatarMeta(senderId || senderName || "?", senderName || "?");
        viewerAuthorAvatar.innerHTML = '<img class="generated-avatar-photo" src="' + avatar.avatarUrl + '" alt="' + avatar.letter + '" />';
        viewerAuthorAvatar.style.cssText = avatar.style;
      }
    }
  }

  if (viewerAuthorName) {
    viewerAuthorName.textContent = senderName || "TheGraphT";
  }
  if (viewerAuthorMeta) {
    viewerAuthorMeta.textContent = formatViewerTimestamp(createdAt);
  }
  if (viewerZoomChip) {
    viewerZoomChip.setAttribute("aria-hidden", "false");
  }

  viewerModal.setAttribute("aria-hidden", "false");
  applyViewerRect(viewerSourceRect, 1, 18);

  viewerModalImage.onload = () => {
    if (loadToken !== viewerLoadToken) {
      return;
    }
    const targetRect = getViewerTargetRect();
    requestAnimationFrame(() => {
      if (loadToken !== viewerLoadToken) {
        return;
      }
      viewerModal.classList.add("open");
      applyViewerRect(targetRect, 1, 24);
    });
  };

  viewerModalImage.onerror = () => {
    if (loadToken !== viewerLoadToken) {
      return;
    }
    if (fallbackSrc && viewerModalImage.dataset.fallbackTried !== "true") {
      viewerModalImage.dataset.fallbackTried = "true";
      viewerModalImage.src = fallbackSrc;
      return;
    }
    viewerModal.classList.remove("open");
  };

  viewerModalImage.dataset.fallbackTried = "false";
  viewerModalImage.src = src;
};

const handleViewerWheelZoom = (event: WheelEvent) => {
  const viewerModal = document.getElementById("viewer-modal");
  if (!viewerModal || !viewerModal.classList.contains("open") || !event.ctrlKey) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  setViewerZoom(viewerZoom + (event.deltaY < 0 ? 0.14 : -0.14));
};

const initViewerModalEvents = () => {
  const messageList = document.getElementById("message-list");
  const viewerModalClose = document.getElementById("viewer-modal-close");
  const viewerModal = document.getElementById("viewer-modal");
  const viewerModalStage = document.getElementById("viewer-modal-stage");
  const viewerModalImage = document.getElementById("viewer-modal-image") as HTMLImageElement | null;
  const viewerZoomOut = document.getElementById("viewer-zoom-out");
  const viewerZoomIn = document.getElementById("viewer-zoom-in");

  if (messageList) {
    messageList.addEventListener("click", (event) => {
      const groupAvatarHit = event.target instanceof Element ? event.target.closest(".group-incoming-avatar-hit[data-sender-id]") : null;
      if (groupAvatarHit) {
        const senderId = String(groupAvatarHit.getAttribute("data-sender-id") || "").trim();
        const openDirectDialogForUser = getWin().openDirectDialogForUser;
        if (senderId && typeof openDirectDialogForUser === "function") {
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
  }

  viewerModalClose?.addEventListener("click", () => {
    closeViewerModal();
  });

  viewerModal?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }

    if (
      !target.closest(".viewer-modal-image") &&
      !target.closest(".viewer-modal-header") &&
      !target.closest(".viewer-zoom-chip")
    ) {
      closeViewerModal();
    }
  });

  viewerModal?.addEventListener("wheel", handleViewerWheelZoom as any, { passive: false });
  viewerModalStage?.addEventListener("wheel", handleViewerWheelZoom as any, { passive: false });
  viewerModalImage?.addEventListener("wheel", handleViewerWheelZoom as any, { passive: false });

  viewerZoomOut?.addEventListener("click", () => {
    if (!viewerModal?.classList.contains("open")) {
      return;
    }
    setViewerZoom(viewerZoom - 0.15);
  });

  viewerZoomIn?.addEventListener("click", () => {
    if (!viewerModal?.classList.contains("open")) {
      return;
    }
    setViewerZoom(viewerZoom + 0.15);
  });
};

if (document.readyState === "complete" || document.readyState === "interactive") {
  initViewerModalEvents();
} else {
  document.addEventListener("DOMContentLoaded", initViewerModalEvents);
}

// Bind methods on window object
(window as any).viewerZoom = viewerZoom;
(window as any).getViewerTargetRect = getViewerTargetRect;
(window as any).applyViewerRect = applyViewerRect;
(window as any).setViewerZoom = setViewerZoom;
(window as any).closeViewerModal = closeViewerModal;
(window as any).openViewerModal = openViewerModal;
(window as any).handleViewerWheelZoom = handleViewerWheelZoom;
