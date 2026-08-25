// Viewer Modal Logic (Event listeners for image zoom, pan/drag, and pinch gestures)
import {
  mountLegacyViewerModalShell,
  renderLegacyViewerAuthor
} from "../features/media/legacyViewerModalMount.tsx";

export {};

const getWin = () => window as any;

let viewerZoom = 1;
let viewerPanX = 0;
let viewerPanY = 0;

let isMouseDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragInitialPanX = 0;
let dragInitialPanY = 0;
let hasDraggedOrMoved = false;

let viewerSourceRect: { left: number; top: number; width: number; height: number } | null = null;
let viewerCleanupTimer: number | null = null;
let viewerLoadToken = 0;

const VIEWER_MIN_ZOOM = 0.5;
const VIEWER_MAX_ZOOM = 4.0;

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

const clampViewerPan = (panX: number, panY: number, zoom: number) => {
  if (zoom <= 1.01) {
    return { panX: 0, panY: 0 };
  }
  const rect = getViewerTargetRect();
  const maxX = Math.max(40, rect.width * (zoom - 1) * 0.55);
  const maxY = Math.max(40, rect.height * (zoom - 1) * 0.55);
  return {
    panX: Math.max(-maxX, Math.min(maxX, panX)),
    panY: Math.max(-maxY, Math.min(maxY, panY))
  };
};

const applyViewerRect = (
  rect: { left: number; top: number; width: number; height: number },
  zoom = viewerZoom,
  borderRadius = 24,
  panX = viewerPanX,
  panY = viewerPanY
) => {
  const clamped = clampViewerPan(panX, panY, zoom);
  panX = clamped.panX;
  panY = clamped.panY;
  viewerPanX = panX;
  viewerPanY = panY;

  const viewerModalImage = document.getElementById("viewer-modal-image");
  const viewerZoomValue = document.getElementById("viewer-zoom-value");
  const viewerModal = document.getElementById("viewer-modal");

  if (viewerModalImage) {
    viewerModalImage.style.left = rect.left + "px";
    viewerModalImage.style.top = rect.top + "px";
    viewerModalImage.style.width = rect.width + "px";
    viewerModalImage.style.height = rect.height + "px";
    viewerModalImage.style.borderRadius = borderRadius + "px";
    viewerModalImage.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`;
    viewerModalImage.classList.toggle("zoomed", zoom > 1.01);
  }

  if (viewerZoomValue) {
    viewerZoomValue.textContent = Math.round(zoom * 100) + "%";
  }

  if (viewerModal && zoom <= 1.01 && (Math.abs(panX) > 5 || Math.abs(panY) > 5)) {
    const dist = Math.hypot(panX, panY);
    const opacity = Math.max(0.2, 1 - dist / 380);
    viewerModal.style.backgroundColor = `rgba(0, 0, 0, ${0.85 * opacity})`;
  } else if (viewerModal) {
    viewerModal.style.backgroundColor = "";
  }
};

const setViewerZoom = (nextZoom: number) => {
  viewerZoom = Math.max(VIEWER_MIN_ZOOM, Math.min(VIEWER_MAX_ZOOM, nextZoom));
  if (viewerZoom <= 1.01) {
    viewerPanX = 0;
    viewerPanY = 0;
  }
  applyViewerRect(getViewerTargetRect(), viewerZoom, 24, viewerPanX, viewerPanY);
};

const resetViewerPosition = (animate = true) => {
  viewerPanX = 0;
  viewerPanY = 0;
  const viewerModalImage = document.getElementById("viewer-modal-image");
  const viewerModal = document.getElementById("viewer-modal");
  if (viewerModal) {
    viewerModal.style.backgroundColor = "";
  }
  if (animate && viewerModalImage) {
    viewerModalImage.classList.remove("dragging");
    viewerModalImage.style.transition = "transform 0.25s cubic-bezier(0.2, 0, 0.2, 1), left 0.25s ease, top 0.25s ease";
    window.setTimeout(() => {
      if (viewerModalImage) {
        viewerModalImage.style.transition = "";
      }
    }, 260);
  }
  applyViewerRect(getViewerTargetRect(), viewerZoom, 24, 0, 0);
};

let currentViewerImageSrc = "";

const downloadViewerPhoto = async () => {
  if (!currentViewerImageSrc) {
    return;
  }
  try {
    const response = await fetch(currentViewerImageSrc);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "photo_" + Date.now() + ".jpg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  } catch {
    window.open(currentViewerImageSrc, "_blank");
  }
};

const closeViewerModal = () => {
  const viewerModal = document.getElementById("viewer-modal");
  const viewerZoomChip = document.getElementById("viewer-zoom-chip");
  const viewerModalImage = document.getElementById("viewer-modal-image") as HTMLImageElement | null;
  if (!viewerModal || !viewerModal.classList.contains("open")) {
    document.body.classList.remove("profile-viewer-open");
    return;
  }

  document.body.classList.remove("profile-viewer-open");
  document.body.style.touchAction = "";
  document.documentElement.style.touchAction = "";

  const fallbackRect = viewerSourceRect || {
    left: window.innerWidth / 2,
    top: window.innerHeight / 2,
    width: 80,
    height: 80
  };

  viewerZoom = 1;
  viewerPanX = 0;
  viewerPanY = 0;
  isMouseDragging = false;
  viewerModalImage?.classList.remove("dragging");
  if (viewerModal) {
    viewerModal.style.backgroundColor = "";
  }

  viewerModal.classList.remove("open");
  applyViewerRect(fallbackRect, 1, 18, 0, 0);
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
    currentViewerImageSrc = "";
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
  const viewerZoomChip = document.getElementById("viewer-zoom-chip");
  const viewerModalImage = document.getElementById("viewer-modal-image") as HTMLImageElement | null;

  if (!src || src.startsWith("data:image/svg+xml") || !viewerModal || !viewerModalImage) {
    return;
  }

  currentViewerImageSrc = src;
  document.body.style.touchAction = "none";
  document.documentElement.style.touchAction = "none";

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
  viewerPanX = 0;
  viewerPanY = 0;
  isMouseDragging = false;
  viewerModalImage.classList.remove("dragging");
  viewerModal.style.backgroundColor = "";

  renderLegacyViewerAuthor({
    senderName,
    senderId,
    createdAt,
    realAvatarUrl
  });

  if (viewerZoomChip) {
    viewerZoomChip.setAttribute("aria-hidden", "false");
  }

  viewerModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("profile-viewer-open");

  document.querySelectorAll(".sidebar-profile-panel.open").forEach((panel) => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  });

  applyViewerRect(viewerSourceRect, 1, 18, 0, 0);

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
      applyViewerRect(targetRect, 1, 24, 0, 0);
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
  if (!viewerModal || !viewerModal.classList.contains("open")) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  const delta = event.deltaY < 0 ? 0.16 : -0.16;
  setViewerZoom(viewerZoom + delta);
};

const initViewerModalEvents = () => {
  mountLegacyViewerModalShell();
  document.body.style.touchAction = "";
  document.documentElement.style.touchAction = "";

  const messageList = document.getElementById("message-list");
  const viewerModalClose = document.getElementById("viewer-modal-close");
  const viewerModalDownload = document.getElementById("viewer-modal-download");
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
        realAvatarUrl: imageLink.getAttribute("data-sender-avatar") || "",
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

  viewerModalClose?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeViewerModal();
  });

  viewerModalDownload?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    void downloadViewerPhoto();
  });

let dragOnImageTarget = false;

const startDragging = (clientX: number, clientY: number, targetEl?: Element | null) => {
    isMouseDragging = true;
    hasDraggedOrMoved = false;
    dragOnImageTarget = Boolean(targetEl && (targetEl.closest("#viewer-modal-image, .viewer-modal-image") || targetEl.id === "viewer-modal-image"));
    dragStartX = clientX;
    dragStartY = clientY;
    dragInitialPanX = viewerPanX;
    dragInitialPanY = viewerPanY;
    viewerModalImage?.classList.add("dragging");
  };

  const updateDragging = (clientX: number, clientY: number) => {
    if (!isMouseDragging || !viewerModal?.classList.contains("open")) return;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedOrMoved = true;
    }
    viewerPanX = dragInitialPanX + dx;
    viewerPanY = dragInitialPanY + dy;
    applyViewerRect(getViewerTargetRect(), viewerZoom, 24, viewerPanX, viewerPanY);
  };

  const endDragging = () => {
    if (!isMouseDragging) return;
    isMouseDragging = false;
    viewerModalImage?.classList.remove("dragging");

    if (viewerZoom <= 1.01) {
      const totalDragDist = Math.hypot(viewerPanX, viewerPanY);
      if (totalDragDist > 120) {
        closeViewerModal();
      } else {
        resetViewerPosition(true);
      }
    }
  };

  if (viewerModalImage) {
    viewerModalImage.addEventListener("mousedown", (e: MouseEvent) => {
      if (e.button !== 0 || !viewerModal?.classList.contains("open")) return;
      e.preventDefault();
      e.stopPropagation();
      startDragging(e.clientX, e.clientY, e.target as Element);
    });

    viewerModalImage.addEventListener("dblclick", (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (viewerZoom > 1.1) {
        setViewerZoom(1.0);
      } else {
        setViewerZoom(2.2);
      }
    });
  }

  if (viewerModalStage) {
    viewerModalStage.addEventListener("mousedown", (e: MouseEvent) => {
      if (e.button !== 0 || !viewerModal?.classList.contains("open")) return;
      const target = e.target as Element;
      if (target.closest(".viewer-modal-header") || target.closest(".viewer-zoom-chip") || target.closest("#viewer-modal-close") || target.closest("#viewer-modal-download")) return;
      e.preventDefault();
      startDragging(e.clientX, e.clientY, target);
    });
  }

  window.addEventListener("mousemove", (e: MouseEvent) => {
    updateDragging(e.clientX, e.clientY);
  });

  window.addEventListener("mouseup", () => {
    endDragging();
  });

  // Touch Pinch & Drag Handling for Mobile / Tablet
  const targetStage = viewerModalStage || viewerModal;
  let pinchStartDist = 0;
  let initialPinchZoom = 1;
  let isTouchDragging = false;
  let lastTapTime = 0;

  if (targetStage) {
    targetStage.addEventListener("touchstart", (e: TouchEvent) => {
      if (!viewerModal?.classList.contains("open")) return;
      e.preventDefault();

      if (e.touches.length === 2) {
        isTouchDragging = false;
        pinchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchZoom = viewerZoom;
        viewerModalImage?.classList.add("dragging");
      } else if (e.touches.length === 1) {
        const now = Date.now();
        const t = e.touches[0];

        if (now - lastTapTime < 300) {
          lastTapTime = 0;
          if (viewerZoom > 1.1) {
            setViewerZoom(1.0);
          } else {
            setViewerZoom(2.2);
          }
          return;
        }
        lastTapTime = now;

        isTouchDragging = true;
        hasDraggedOrMoved = false;
        dragStartX = t.clientX;
        dragStartY = t.clientY;
        dragInitialPanX = viewerPanX;
        dragInitialPanY = viewerPanY;
        viewerModalImage?.classList.add("dragging");
      }
    }, { passive: false });

    targetStage.addEventListener("touchmove", (e: TouchEvent) => {
      if (!viewerModal?.classList.contains("open")) return;
      e.preventDefault();
      e.stopPropagation();

      if (e.touches.length === 2 && pinchStartDist > 0) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleFactor = currentDist / pinchStartDist;
        setViewerZoom(initialPinchZoom * scaleFactor);
      } else if (e.touches.length === 1 && isTouchDragging) {
        const t = e.touches[0];
        const dx = t.clientX - dragStartX;
        const dy = t.clientY - dragStartY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasDraggedOrMoved = true;
        }
        viewerPanX = dragInitialPanX + dx;
        viewerPanY = dragInitialPanY + dy;
        applyViewerRect(getViewerTargetRect(), viewerZoom, 24, viewerPanX, viewerPanY);
      }
    }, { passive: false });

    targetStage.addEventListener("touchend", (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchStartDist = 0;
      }
      if (e.touches.length === 0) {
        if (isTouchDragging) {
          isTouchDragging = false;
          viewerModalImage?.classList.remove("dragging");

          if (viewerZoom <= 1.01) {
            const totalDragDist = Math.hypot(viewerPanX, viewerPanY);
            if (totalDragDist > 120) {
              closeViewerModal();
            } else {
              resetViewerPosition(true);
            }
          }
        }
      }
    }, { passive: true });
  }

  viewerModal?.addEventListener("click", (event) => {
    if (hasDraggedOrMoved) {
      hasDraggedOrMoved = false;
      dragOnImageTarget = false;
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      dragOnImageTarget = false;
      return;
    }

    // Never close if user clicked or pressed on image or header/controls!
    if (
      dragOnImageTarget ||
      target.closest("#viewer-modal-image") ||
      target.closest(".viewer-modal-image") ||
      target.closest(".viewer-modal-header") ||
      target.closest(".viewer-zoom-chip")
    ) {
      dragOnImageTarget = false;
      return;
    }

    dragOnImageTarget = false;
    closeViewerModal();
  });

  viewerModal?.addEventListener("wheel", handleViewerWheelZoom as any, { passive: false });
  viewerModalStage?.addEventListener("wheel", handleViewerWheelZoom as any, { passive: false });
  viewerModalImage?.addEventListener("wheel", handleViewerWheelZoom as any, { passive: false });

  viewerZoomOut?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!viewerModal?.classList.contains("open")) {
      return;
    }
    setViewerZoom(viewerZoom - 0.2);
  });

  viewerZoomIn?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!viewerModal?.classList.contains("open")) {
      return;
    }
    setViewerZoom(viewerZoom + 0.2);
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
(window as any).downloadViewerPhoto = downloadViewerPhoto;
