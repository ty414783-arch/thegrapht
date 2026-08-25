// Attachment Modal Service for Preact / TypeScript Migration
import {
  buildLegacyAttachmentCollageItems,
  buildLegacyAttachmentFileItems,
  renderLegacyAttachmentFileStrip,
  renderLegacyAttachmentPhotoCollage
} from "../features/media/legacyAttachmentModalMount.tsx";
import { getLegacyAttachmentCollageCountClass } from "../features/media/legacyAttachmentModalSync.ts";

export {};

declare const messageList: HTMLElement;
declare const bottomLockToken: any;
declare const hardPinMessagesToBottom: (token: any) => void;
declare const composerAttachmentPreview: HTMLElement;
declare const composerAttachmentImage: HTMLImageElement;
declare const composerAttachmentMeta: HTMLElement;
declare const syncComposerState: () => void;
declare const attachmentModal: HTMLElement;
declare const attachmentModalEmojiPicker: HTMLElement;
declare const composerFileInput: HTMLInputElement;
declare const attachmentModalCaption: HTMLInputElement;
declare const attachmentModalPrev: HTMLElement;
declare const attachmentModalNext: HTMLElement;
declare const attachmentModalImage: HTMLImageElement;
declare const attachmentModalStrip: HTMLElement;
declare const attachmentModalTitle: HTMLElement;
declare const composerInput: HTMLInputElement;
declare const showToast: (msg: string, type: "error" | "success" | "info") => void;

declare const measureImageUrl: (url: string) => Promise<{ naturalWidth: number; naturalHeight: number }>;
declare const measureAudioDuration: (url: string) => Promise<number>;
declare const readCachedImageDimensions: (url: string) => { naturalWidth: number; naturalHeight: number } | null;
declare const writeImageDimensions: (url: string, imageNode: HTMLImageElement) => void;

// Global format helpers from format-utils
declare const formatFileCount: (count: number) => string;
declare const formatPhotoCount: (count: number) => string;
declare const formatDuration: (v: number) => string;
declare const formatBytes: (v: number) => string;

const getWin = () => window as any;

// Initialize state variables on window so they are globally accessible/shared
if (typeof getWin().pendingImageAttachments === 'undefined') getWin().pendingImageAttachments = [];
if (typeof getWin().pendingImageAttachmentIndex === 'undefined') getWin().pendingImageAttachmentIndex = 0;
if (typeof getWin().pendingFileAttachments === 'undefined') getWin().pendingFileAttachments = [];
if (typeof getWin().pendingFileAttachmentIndex === 'undefined') getWin().pendingFileAttachmentIndex = 0;
if (typeof getWin().attachmentModalMode === 'undefined') getWin().attachmentModalMode = "image";
if (typeof getWin().pendingImageCaption === 'undefined') getWin().pendingImageCaption = "";
if (typeof getWin().pendingAttachmentModalScrollTop === 'undefined') getWin().pendingAttachmentModalScrollTop = 0;
if (typeof getWin().attachmentModalCleanupToken === 'undefined') getWin().attachmentModalCleanupToken = 0;
if (typeof getWin().attachmentModalCleanupTimer === 'undefined') getWin().attachmentModalCleanupTimer = null;

let collageRemovingIndex: number | null = null;

const getMaxMediaAttachments = () => getWin().MAX_MEDIA_ATTACHMENTS || 500;

const getConstrainedImageSize = (naturalWidth: number, naturalHeight: number) => {
  if (!naturalWidth || !naturalHeight) {
    return null;
  }

  const maxWidth = Math.min(420, Math.max(180, Math.floor(window.innerWidth * 0.46)));
  const maxHeight = Math.min(520, Math.max(220, Math.floor(window.innerHeight * 0.62)));
  const ratio = naturalWidth / naturalHeight;
  let width = Math.min(naturalWidth, maxWidth);
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
};

const getImageShellStyle = (message: any) => {
  if (message?.albumId) {
    return "";
  }

  const inlineDimensions = (
    Number(message?.mediaNaturalWidth) > 0
    && Number(message?.mediaNaturalHeight) > 0
  )
    ? {
        naturalWidth: Number(message.mediaNaturalWidth),
        naturalHeight: Number(message.mediaNaturalHeight)
      }
    : null;
  const dimensions = inlineDimensions || (typeof readCachedImageDimensions !== 'undefined' ? readCachedImageDimensions(message?.mediaUrl) : null);
  const size = dimensions
    ? getConstrainedImageSize(dimensions.naturalWidth, dimensions.naturalHeight)
    : null;

  return size ? ' style="width: ' + size.width + 'px; height: ' + size.height + 'px;"' : "";
};

const markMessageImageLoaded = (imageNode: HTMLImageElement) => {
  if (!(imageNode instanceof HTMLImageElement)) {
    return;
  }

  const shell = imageNode.closest(".message-image-shell");

  if (!shell || !(shell instanceof HTMLElement)) {
    return;
  }

  const isAlbumTile = Boolean(shell.closest(".message-album-item"));
  if (typeof writeImageDimensions !== 'undefined') {
    writeImageDimensions(imageNode.currentSrc || imageNode.src, imageNode);
  }

  if (
    !isAlbumTile
    && imageNode.naturalWidth > 0
    && imageNode.naturalHeight > 0
  ) {
    const size = getConstrainedImageSize(imageNode.naturalWidth, imageNode.naturalHeight);
    if (size) {
      shell.style.width = size.width + "px";
      shell.style.height = size.height + "px";
    }
  }

  shell.classList.add("loaded");
};
const hydrateMessageImages = (options: any = {}) => {
  const lockToken = options.lockToken || 0;
  const pendingImages: HTMLImageElement[] = [];
  const keepBottomPinned = () => {
    const cancelState = Boolean(getWin().bottomLockCanceledByUser);
    const currentToken = getWin().bottomLockToken || 0;
    if (!cancelState && typeof hardPinMessagesToBottom === "function") {
      hardPinMessagesToBottom(currentToken);
    }
  };

  const listNode = getWin().messageList || document.getElementById("message-list");
  if (listNode) {
    listNode.querySelectorAll(".message-image").forEach((imageNode) => {
      if (!(imageNode instanceof HTMLImageElement) || imageNode.dataset.hydrated === "true") {
        return;
      }

      imageNode.dataset.hydrated = "true";
      imageNode.addEventListener("load", () => {
        markMessageImageLoaded(imageNode);
        keepBottomPinned();
      });
      imageNode.addEventListener("error", () => {
        const fallbackSrc = String(imageNode.getAttribute("data-fallback-src") || "");
        if (fallbackSrc && imageNode.dataset.fallbackTried !== "true") {
          imageNode.dataset.fallbackTried = "true";
          imageNode.src = fallbackSrc;
          const linkNode = imageNode.closest(".message-image-link");
          if (linkNode) {
            linkNode.setAttribute("data-image-url", fallbackSrc);
          }
          return;
        }
        const shell = imageNode.closest(".message-image-shell");
        if (shell) {
          shell.classList.add("loaded");
        }
        keepBottomPinned();
      });

      if (imageNode.complete && imageNode.naturalWidth > 0) {
        markMessageImageLoaded(imageNode);
        keepBottomPinned();
        return;
      }

      pendingImages.push(imageNode);
    });
  }

  return pendingImages;
};

const renderComposerAttachmentPreview = () => {
  if (typeof composerAttachmentPreview !== 'undefined' && composerAttachmentPreview) {
    composerAttachmentPreview.classList.remove("visible");
  }
  if (typeof composerAttachmentImage !== 'undefined' && composerAttachmentImage) {
    composerAttachmentImage.removeAttribute("src");
  }
  if (typeof composerAttachmentMeta !== 'undefined' && composerAttachmentMeta) {
    composerAttachmentMeta.textContent = "";
  }
  if (typeof getWin().syncComposerState === 'function') {
    getWin().syncComposerState();
  }
};

const closeAttachmentModal = () => {
  if (typeof attachmentModal === 'undefined' || !attachmentModal) {
    return;
  }
  const attachmentModalContent = attachmentModal.querySelector(".attachment-modal-content");
  if (attachmentModalContent instanceof HTMLElement) {
    getWin().pendingAttachmentModalScrollTop = attachmentModalContent.scrollTop || 0;
  }
  if (typeof attachmentModalEmojiPicker !== 'undefined' && attachmentModalEmojiPicker) {
    attachmentModalEmojiPicker.classList.remove("open");
    attachmentModalEmojiPicker.setAttribute("aria-hidden", "true");
  }
  attachmentModal.classList.remove("open");
  attachmentModal.setAttribute("aria-hidden", "true");
};

const clearPendingImageAttachment = (options: any = {}) => {
  if (typeof attachmentModal === 'undefined' || !attachmentModal) {
    return;
  }
  const preservePreviewUrls = new Set(options.preservePreviewUrls || []);
  const closingAttachments = getWin().pendingImageAttachments.concat(getWin().pendingFileAttachments);
  getWin().attachmentModalCleanupToken += 1;
  const cleanupToken = getWin().attachmentModalCleanupToken;
  const attachmentModalShell = attachmentModal.querySelector(".attachment-modal-shell");

  if (getWin().attachmentModalCleanupTimer) {
    window.clearTimeout(getWin().attachmentModalCleanupTimer);
    getWin().attachmentModalCleanupTimer = null;
  }

  getWin().pendingImageAttachments = [];
  getWin().pendingImageAttachmentIndex = 0;
  getWin().pendingFileAttachments = [];
  getWin().pendingFileAttachmentIndex = 0;
  getWin().attachmentModalMode = "image";
  getWin().pendingImageCaption = "";
  getWin().pendingAttachmentModalScrollTop = 0;
  if (typeof composerFileInput !== 'undefined' && composerFileInput) {
    composerFileInput.value = "";
  }
  if (typeof attachmentModalCaption !== 'undefined' && attachmentModalCaption) {
    attachmentModalCaption.value = "";
  }
  if (typeof attachmentModalEmojiPicker !== 'undefined' && attachmentModalEmojiPicker) {
    attachmentModalEmojiPicker.classList.remove("open");
    attachmentModalEmojiPicker.setAttribute("aria-hidden", "true");
  }
  if (attachmentModalShell) {
    attachmentModalShell.classList.remove("is-file-mode");
    attachmentModalShell.classList.remove("is-multi");
    attachmentModalShell.classList.add("is-single");
  }
  attachmentModal.classList.remove("open");
  attachmentModal.setAttribute("aria-hidden", "true");
  if (typeof attachmentModalPrev !== 'undefined' && attachmentModalPrev) {
    attachmentModalPrev.hidden = true;
  }
  if (typeof attachmentModalNext !== 'undefined' && attachmentModalNext) {
    attachmentModalNext.hidden = true;
  }
  renderComposerAttachmentPreview();

  getWin().attachmentModalCleanupTimer = window.setTimeout(() => {
    if (cleanupToken !== getWin().attachmentModalCleanupToken || attachmentModal.classList.contains("open")) {
      return;
    }

    for (const attachment of closingAttachments) {
      if (attachment?.previewUrl && !preservePreviewUrls.has(attachment.previewUrl)) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    }

    if (typeof attachmentModalImage !== 'undefined' && attachmentModalImage) {
      attachmentModalImage.removeAttribute("src");
      attachmentModalImage.alt = "";
      attachmentModalImage.parentElement?.classList.remove("loading");
    }
    if (typeof attachmentModalStrip !== 'undefined' && attachmentModalStrip) {
      renderLegacyAttachmentFileStrip(attachmentModalStrip, [], {
        onSelect: () => {},
        onRemove: () => {}
      });
    }
  }, 220);
};

const moveAttachmentModal = (direction: number) => {
  if (getWin().attachmentModalMode !== "image" || getWin().pendingImageAttachments.length < 2) {
    return;
  }

  getWin().pendingImageAttachmentIndex = (getWin().pendingImageAttachmentIndex + direction + getWin().pendingImageAttachments.length) % getWin().pendingImageAttachments.length;
  renderAttachmentModal();
};

const handleRemoveFileAttachment = (removeIndex: number) => {
  const files = getWin().pendingFileAttachments || [];
  const removed = files.splice(removeIndex, 1);
  if (removed[0]?.previewUrl) {
    try {
      URL.revokeObjectURL(removed[0].previewUrl);
    } catch {}
  }
  if (!files.length) {
    clearPendingImageAttachment();
  } else {
    if (getWin().pendingFileAttachmentIndex >= files.length) {
      getWin().pendingFileAttachmentIndex = files.length - 1;
    }
    renderComposerAttachmentPreview();
    renderAttachmentModal();
  }
};

const handleRemovePhotoAttachment = (removeIndex: number) => {
  collageRemovingIndex = removeIndex;
  const collageEl = document.getElementById("attachment-modal-collage");
  if (collageEl instanceof HTMLElement) {
    renderLegacyAttachmentPhotoCollage(
      collageEl,
      buildLegacyAttachmentCollageItems(getWin().pendingImageAttachments),
      {
        removingIndex: collageRemovingIndex,
        onRemove: handleRemovePhotoAttachment
      }
    );
  }

  window.setTimeout(() => {
    collageRemovingIndex = null;
    const photos = getWin().pendingImageAttachments || [];
    const removed = photos.splice(removeIndex, 1);
    if (removed[0]?.previewUrl) {
      try {
        URL.revokeObjectURL(removed[0].previewUrl);
      } catch {}
    }
    if (!photos.length) {
      clearPendingImageAttachment();
    } else {
      if (getWin().pendingImageAttachmentIndex >= photos.length) {
        getWin().pendingImageAttachmentIndex = photos.length - 1;
      }
      renderComposerAttachmentPreview();
      renderAttachmentModal({ preserveScroll: true });
    }
  }, 140);
};

const renderAttachmentModal = (options: any = {}) => {
  if (typeof attachmentModal === 'undefined' || !attachmentModal) {
    return;
  }
  const attachmentModalShell = attachmentModal.querySelector(".attachment-modal-shell");
  const attachmentModalContent = attachmentModal.querySelector(".attachment-modal-content");
  const stageEl = document.getElementById("attachment-modal-stage") || attachmentModal.querySelector(".attachment-modal-stage");
  const preserveScroll = Boolean(options.preserveScroll);

  if (getWin().attachmentModalMode === "file") {
    const attachment = getWin().pendingFileAttachments[getWin().pendingFileAttachmentIndex];

    if (!attachment) {
      attachmentModal.classList.remove("open");
      attachmentModal.setAttribute("aria-hidden", "true");
      return;
    }

    if (stageEl instanceof HTMLElement) {
      stageEl.hidden = true;
      stageEl.style.display = "none";
    }

    const hasLongFileList = getWin().pendingFileAttachments.length > 6;
    if (attachmentModalShell) {
      attachmentModalShell.classList.add("is-file-mode");
      attachmentModalShell.classList.remove("is-image-mode");
      attachmentModalShell.classList.toggle("is-multi", hasLongFileList);
      attachmentModalShell.classList.toggle("is-single", !hasLongFileList);
    }

    if (typeof attachmentModalTitle !== 'undefined' && attachmentModalTitle) {
      attachmentModalTitle.textContent = formatFileCount(getWin().pendingFileAttachments.length);
    }
    if (typeof attachmentModalCaption !== 'undefined' && attachmentModalCaption) {
      attachmentModalCaption.placeholder = (window as any).t ? (window as any).t("media.addCaption") : "Add a caption...";
      attachmentModalCaption.value = getWin().pendingImageCaption || "";
    }
    if (typeof attachmentModalPrev !== 'undefined' && attachmentModalPrev) {
      attachmentModalPrev.hidden = true;
    }
    if (typeof attachmentModalNext !== 'undefined' && attachmentModalNext) {
      attachmentModalNext.hidden = true;
    }
    if (typeof attachmentModalStrip !== 'undefined' && attachmentModalStrip) {
      attachmentModalStrip.hidden = false;
    }
    if (typeof attachmentModalImage !== 'undefined' && attachmentModalImage) {
      attachmentModalImage.removeAttribute("src");
      attachmentModalImage.alt = "";
      attachmentModalImage.parentElement?.classList.remove("loading");
    }
    const stripEl = document.getElementById("attachment-modal-strip");
    if (stripEl instanceof HTMLElement) {
      renderLegacyAttachmentFileStrip(
        stripEl,
        buildLegacyAttachmentFileItems(
          getWin().pendingFileAttachments,
          getWin().pendingFileAttachmentIndex
        ),
        {
          onSelect: (index) => {
            getWin().pendingFileAttachmentIndex = index;
            renderAttachmentModal();
          },
          onRemove: handleRemoveFileAttachment
        }
      );
    }

    const attachmentModalCollage = document.getElementById("attachment-modal-collage");
    if (attachmentModalCollage instanceof HTMLElement) {
      attachmentModalCollage.hidden = true;
      attachmentModalCollage.style.display = "none";
    }

    attachmentModal.classList.add("open");
    attachmentModal.setAttribute("aria-hidden", "false");

    if (preserveScroll && attachmentModalContent instanceof HTMLElement) {
      attachmentModalContent.scrollTop = getWin().pendingAttachmentModalScrollTop;
    } else if (attachmentModalContent instanceof HTMLElement) {
      attachmentModalContent.scrollTop = 0;
    }
    return;
  }

  const attachment = getWin().pendingImageAttachments[getWin().pendingImageAttachmentIndex];

  if (!attachment) {
    attachmentModal.classList.remove("open");
    attachmentModal.setAttribute("aria-hidden", "true");
    return;
  }
  const isMultiSelection = getWin().pendingImageAttachments.length > 1;
  if (attachmentModalShell) {
    attachmentModalShell.classList.remove("is-file-mode");
    attachmentModalShell.classList.add("is-image-mode");
    attachmentModalShell.classList.toggle("is-multi", isMultiSelection);
    attachmentModalShell.classList.toggle("is-single", !isMultiSelection);
  }

  const attachmentModalCollage = document.getElementById("attachment-modal-collage");

  if (typeof attachmentModalTitle !== 'undefined' && attachmentModalTitle) {
    attachmentModalTitle.textContent = formatPhotoCount(getWin().pendingImageAttachments.length);
  }

  if (isMultiSelection) {
    // Hide single photo stage and strip in favor of Telegram collage grid
    if (stageEl instanceof HTMLElement) {
      stageEl.hidden = true;
      stageEl.style.display = "none";
    }
    if (typeof attachmentModalStrip !== 'undefined' && attachmentModalStrip) {
      attachmentModalStrip.hidden = true;
    }
    if (attachmentModalCollage instanceof HTMLElement) {
      const count = getWin().pendingImageAttachments.length;
      attachmentModalCollage.className = getLegacyAttachmentCollageCountClass(count);
      attachmentModalCollage.hidden = false;
      attachmentModalCollage.style.display = "grid";
      renderLegacyAttachmentPhotoCollage(
        attachmentModalCollage,
        buildLegacyAttachmentCollageItems(getWin().pendingImageAttachments),
        {
          removingIndex: collageRemovingIndex,
          onRemove: handleRemovePhotoAttachment
        }
      );
    }
  } else {
    // Single image mode
    if (attachmentModalCollage instanceof HTMLElement) {
      attachmentModalCollage.hidden = true;
      attachmentModalCollage.style.display = "none";
    }
    if (typeof attachmentModalStrip !== 'undefined' && attachmentModalStrip) {
      attachmentModalStrip.hidden = true;
    }
    if (stageEl instanceof HTMLElement) {
      stageEl.hidden = false;
      stageEl.style.display = "flex";
    }
    if (typeof attachmentModalImage !== 'undefined' && attachmentModalImage) {
      attachmentModalImage.parentElement?.classList.add("loading");
      attachmentModalImage.src = attachment.previewUrl;
      attachmentModalImage.alt = attachment.file.name || "Photo";
      attachmentModalImage.onload = () => {
        attachmentModalImage.parentElement?.classList.remove("loading");
      };
      attachmentModalImage.onerror = () => {
        attachmentModalImage.parentElement?.classList.remove("loading");
      };
      if (attachmentModalImage.complete && attachmentModalImage.naturalWidth > 0) {
        attachmentModalImage.parentElement?.classList.remove("loading");
      }
    }
  }

  if (typeof attachmentModalCaption !== 'undefined' && attachmentModalCaption) {
    attachmentModalCaption.placeholder = (window as any).t ? (window as any).t("media.addCaption") : "Add a caption...";
    attachmentModalCaption.value = getWin().pendingImageCaption || "";
    if (attachmentModalCaption instanceof HTMLElement) {
      attachmentModalCaption.style.height = "auto";
      const h = Math.min(100, Math.max(24, attachmentModalCaption.scrollHeight));
      attachmentModalCaption.style.height = h + "px";
    }
  }
  if (typeof attachmentModalPrev !== 'undefined' && attachmentModalPrev) {
    attachmentModalPrev.hidden = true;
  }
  if (typeof attachmentModalNext !== 'undefined' && attachmentModalNext) {
    attachmentModalNext.hidden = true;
  }

  attachmentModal.classList.add("open");
  attachmentModal.setAttribute("aria-hidden", "false");

  if (preserveScroll && attachmentModalContent instanceof HTMLElement) {
    attachmentModalContent.scrollTop = getWin().pendingAttachmentModalScrollTop;
  }
};

const openAttachmentModal = (index: number = 0, options: any = {}) => {
  if (getWin().attachmentModalMode === "file") {
    if (!getWin().pendingFileAttachments.length) {
      return;
    }
  } else if (!getWin().pendingImageAttachments.length) {
    return;
  }

  getWin().attachmentModalCleanupToken += 1;
  if (getWin().attachmentModalCleanupTimer) {
    window.clearTimeout(getWin().attachmentModalCleanupTimer);
    getWin().attachmentModalCleanupTimer = null;
  }

  if (getWin().attachmentModalMode === "file") {
    getWin().pendingFileAttachmentIndex = Math.max(0, Math.min(index, getWin().pendingFileAttachments.length - 1));
  } else {
    getWin().pendingImageAttachmentIndex = Math.max(0, Math.min(index, getWin().pendingImageAttachments.length - 1));
  }
  renderAttachmentModal({
    preserveScroll: Boolean(options.preserveScroll)
  });
};

const addPendingImageAttachments = async (files: FileList | File[]) => {
  const validFiles = Array.from(files || []).filter((file) => file && String(file.type || "").startsWith("image/"));

  if (!validFiles.length) {
    showToast("Only images are supported.", "error");
    return;
  }

  const availableSlots = Math.max(0, getMaxMediaAttachments() - getWin().pendingImageAttachments.length);

  if (!availableSlots) {
    showToast("You can select up to 500 photos at once.", "error");
    return;
  }

  const acceptedFiles = validFiles.slice(0, availableSlots);

  if (acceptedFiles.length < validFiles.length) {
    showToast("Selection limit: 500 photos.", "error");
  }

  const nextAttachments = await Promise.all(acceptedFiles.map(async (file) => {
    const previewUrl = URL.createObjectURL(file);
    let measured = null;
    if (typeof measureImageUrl === 'function') {
      measured = await measureImageUrl(previewUrl);
    }
    return {
      id: "draft_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      file,
      previewUrl,
      naturalWidth: Number(measured?.naturalWidth) || 0,
      naturalHeight: Number(measured?.naturalHeight) || 0
    };
  }));

  if (!getWin().pendingImageCaption && typeof composerInput !== 'undefined' && composerInput.value.trim()) {
    getWin().pendingImageCaption = composerInput.value.trim();
    composerInput.value = "";
    if (typeof getWin().syncComposerState === 'function') {
      getWin().syncComposerState();
    }
  }

  getWin().pendingImageAttachments = getWin().pendingImageAttachments.concat(nextAttachments);
  getWin().attachmentModalMode = "image";
  renderComposerAttachmentPreview();
  openAttachmentModal(getWin().pendingImageAttachments.length - nextAttachments.length);
};

const setPendingImageAttachment = (file: File) => {
  void addPendingImageAttachments([file]);
};

const addPendingFileAttachments = async (files: FileList | File[]) => {
  const validFiles = Array.from(files || []).filter((file) => Boolean(file && file.name));

  if (!validFiles.length) {
    return;
  }

  const availableSlots = Math.max(0, getMaxMediaAttachments() - getWin().pendingFileAttachments.length);

  if (!availableSlots) {
    showToast("You can select up to 500 files at once.", "error");
    return;
  }

  const acceptedFiles = validFiles.slice(0, availableSlots);
  if (acceptedFiles.length < validFiles.length) {
    showToast("Selection limit: 500 files.", "error");
  }

  const nextAttachments = await Promise.all(acceptedFiles.map(async (file) => {
    const previewUrl = URL.createObjectURL(file);
    let durationSeconds = 0;
    const isAudio = String(file.type || "").startsWith("audio/") || file.name.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i);
    if (isAudio && typeof measureAudioDuration === 'function') {
      durationSeconds = await measureAudioDuration(previewUrl);
    }
    return {
      id: "file_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      file,
      previewUrl,
      durationSeconds: Number(durationSeconds) || 0
    };
  }));

  if (!getWin().pendingImageCaption && typeof composerInput !== 'undefined' && composerInput.value.trim()) {
    getWin().pendingImageCaption = composerInput.value.trim();
    composerInput.value = "";
    if (typeof getWin().syncComposerState === 'function') {
      getWin().syncComposerState();
    }
  }

  getWin().pendingFileAttachments = getWin().pendingFileAttachments.concat(nextAttachments);
  getWin().attachmentModalMode = "file";
  renderComposerAttachmentPreview();
  openAttachmentModal(getWin().pendingFileAttachments.length - nextAttachments.length);
};

// Expose APIs to window
getWin().getConstrainedImageSize = getConstrainedImageSize;
getWin().getImageShellStyle = getImageShellStyle;
getWin().hydrateMessageImages = hydrateMessageImages;
getWin().clearPendingImageAttachment = clearPendingImageAttachment;
getWin().closeAttachmentModal = closeAttachmentModal;
getWin().openAttachmentModal = openAttachmentModal;
getWin().moveAttachmentModal = moveAttachmentModal;
getWin().renderAttachmentModal = renderAttachmentModal;
getWin().addPendingImageAttachments = addPendingImageAttachments;
getWin().setPendingImageAttachment = setPendingImageAttachment;
getWin().addPendingFileAttachments = addPendingFileAttachments;

// Immediately hydrate any images already in the DOM (as this module is lazy-loaded)
try {
  hydrateMessageImages({ lockToken: 0 });
} catch (err) {
  console.warn("Failed to run initial image hydration:", err);
}
