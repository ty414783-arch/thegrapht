import test from "node:test";
import assert from "node:assert/strict";

import { uiFlags } from "../src/server/ui-flags.js";

test("legacy UI flags stay disabled by default", () => {
  assert.equal(uiFlags.newChatUi, false);
  assert.equal(uiFlags.newSidebar, false);
  assert.equal(uiFlags.newAuthUi, false);
});

test("legacy workspace shell includes slice anchors when new UI is off", async () => {
  const { buildHtml } = await import("../src/server/page-template.js");
  const html = buildHtml({
    clientScriptUrl: "/assets/main-test.js",
    clientPreloadUrls: [],
    clientCssUrls: [],
    clientBuildId: "main-test",
    manifestUrl: "/manifest.webmanifest",
    logoDataUrl: "/logo.jpg",
    wallpaperDataUrl: "/wallpaper.png",
    emojiIconDataUrl: "/emoji.png",
    settingsKeyboardIconDataUrl: "/attach.png",
    uiFlags: {
      telegramTopBar: true,
      desktopInterFont: true,
      desktopSideGuttersOnly: true,
      sidebarAccountCardHidden: false,
      newChatUi: false,
      newSidebar: false,
      newAuthUi: false
    }
  });

  assert.match(html, /id="composer-input"/);
  assert.match(html, /class="composer-shell"/);
  assert.match(html, /id="chat-island"/);
  assert.match(html, /class="chat-island"/);
  assert.match(html, /id="chat-profile-panel"/);
  assert.match(html, /class="chat-profile-panel"/);
  assert.match(html, /id="viewer-modal"/);
  assert.match(html, /id="message-list"/);
  assert.doesNotMatch(html, /class="tg-new-sidebar"/);
});

test("legacy slice modules are bundled in workspace entry", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/workspace.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /mountLegacyChatHeader/);
  assert.match(source, /mountLegacyProfilePanel/);
  assert.match(source, /mountLegacyMediaHydrator/);
  assert.match(source, /legacyProfilePanelSync/);
});

test("message rendering uses legacy text bubble path", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/message-rendering.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyTextMessageMount/);
  assert.match(source, /isLegacyTextOnlyMessage/);
  assert.match(source, /renderRenderableItemDom/);
});

test("message rendering uses legacy media bubble path for image audio album", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/message-rendering.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyMediaMessageMount/);
  assert.match(source, /isLegacyMediaMessage/);
  assert.match(source, /renderLegacyAlbumMessageNode/);
  assert.match(source, /renderLegacyMediaMessageNode/);
});

test("message rendering uses legacy system and call bubble paths", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/message-rendering.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacySystemRowMount/);
  assert.match(source, /isLegacySystemRowMessage/);
  assert.match(source, /isLegacyCallBubbleMessage/);
  assert.match(source, /renderLegacySystemRowNode/);
  assert.match(source, /renderLegacyCallBubbleNode/);
  assert.match(source, /message-group-video-event/);
});

test("legacy system row component keeps legacy classes", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/chat/LegacySystemRowMessage.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /message-system-pill/);
  assert.match(source, /rowClassName/);
  assert.doesNotMatch(source, /MessageBubble\.module\.css/);
});

test("legacy media message component keeps legacy article classes", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/chat/LegacyMediaMessage.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /class=\{articleClassName\}/);
  assert.match(source, /message-meta/);
  assert.match(source, /group-incoming-main/);
  assert.match(source, /shell\.rowClassName/);
  assert.doesNotMatch(source, /MessageBubble\.module\.css/);
});

test("message rendering uses legacy day separator path", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/message-rendering.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyDaySeparatorMount/);
  assert.match(source, /renderLegacyDaySeparatorNode/);
});

test("legacy day separator component keeps legacy classes", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/chat/LegacyDaySeparator.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /message-day-separator/);
  assert.match(source, /data-day-ts/);
  assert.doesNotMatch(source, /DaySeparator\.module\.css/);
});

test("sidebar uses legacy composer and dialog item mounts", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/sidebar.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyComposerSend/);
  assert.match(source, /legacyDialogItemMount/);
  assert.match(source, /mountLegacyComposer/);
  assert.match(source, /mountLegacyAttachMenu/);
});

test("bootstrap delegates emoji picker rendering to legacy Preact mount", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/bootstrap.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyEmojiPickerMount/);
  assert.match(source, /renderLegacyEmojiPicker/);
  assert.doesNotMatch(source, /emojiPickerHead\.innerHTML/);
  assert.doesNotMatch(source, /emojiPickerBody\.innerHTML/);
});

test("legacy emoji picker components keep legacy classes", async () => {
  const headSource = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/chat/LegacyEmojiPickerHead.tsx", import.meta.url), "utf8")
  ));
  const bodySource = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/chat/LegacyEmojiPickerBody.tsx", import.meta.url), "utf8")
  ));

  assert.match(headSource, /emoji-picker-tab/);
  assert.match(bodySource, /emoji-picker-section/);
  assert.match(bodySource, /emoji-picker-grid/);
  assert.match(bodySource, /emoji-button/);
});

test("legacy attach menu component keeps legacy classes", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/chat/LegacyAttachMenu.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /attach-menu-item/);
  assert.match(source, /data-attach-action="media"/);
  assert.match(source, /data-attach-action="file"/);
  assert.doesNotMatch(source, /ComposeMenu\.module\.css/);
});

test("message actions delegates context menu rendering to legacy Preact mount", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/message-actions.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyMessageContextMenuMount/);
  assert.match(source, /renderLegacyMessageContextMenuBody/);
  assert.match(source, /getLegacyContextMenuActions/);
  assert.doesNotMatch(source, /messageContextMenuBody\.innerHTML/);
  assert.doesNotMatch(source, /buildContextMenuButton/);
});

test("legacy message context menu component keeps legacy classes", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/profile/LegacyMessageContextMenuBody.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /message-context-menu-item/);
  assert.match(source, /data-action=/);
  assert.doesNotMatch(source, /MessageContextMenu\.module\.css/);
});

test("scroll pagination mounts legacy scroll-bottom icon", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/scroll-pagination.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /mountLegacyScrollBottomIcon/);
});

test("legacy scroll-bottom icon keeps chat-scroll-bottom anchor", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/chat/mountLegacyScrollBottomIcon.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /chat-scroll-bottom/);
});

test("message actions delegates delete modal rendering to legacy Preact mount", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/message-actions.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyDeleteMessageModalMount/);
  assert.match(source, /renderLegacyDeleteMessageModalBody/);
  assert.match(source, /getLegacyDeleteMessageModalState/);
  assert.match(source, /mountLegacyDeleteMessageModalShell/);
});

test("legacy delete message modal keeps legacy classes", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/chat/LegacyDeleteMessageModalBody.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /delete-message-modal-shell|delete-message-title/);
  assert.match(source, /delete-message-button/);
  assert.match(source, /delete-message-for-everyone/);
  assert.doesNotMatch(source, /module\.css/);
});

test("viewer modal mounts legacy shell and author via Preact", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/viewer-modal.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyViewerModalMount/);
  assert.match(source, /mountLegacyViewerModalShell/);
  assert.match(source, /renderLegacyViewerAuthor/);
  assert.doesNotMatch(source, /viewerAuthorAvatar\.innerHTML/);
});

test("legacy viewer modal shell keeps legacy classes", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/media/LegacyViewerModalShell.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /viewer-modal-shell/);
  assert.match(source, /viewer-modal-stage/);
  assert.match(source, /viewer-modal-image/);
  assert.match(source, /viewer-zoom-chip/);
  assert.doesNotMatch(source, /ImageViewer\.module\.css/);
});

test("legacy viewer author avatar keeps generated-avatar-photo class", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/media/LegacyViewerAuthorAvatar.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /generated-avatar-photo/);
});

test("sidebar mounts legacy attachment modal shell before wiring", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/sidebar.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /mountLegacyAttachmentModalShell/);
});

test("attachment modal delegates strip and collage rendering to legacy Preact mount", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/attachment-modal.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyAttachmentModalMount/);
  assert.match(source, /renderLegacyAttachmentFileStrip/);
  assert.match(source, /renderLegacyAttachmentPhotoCollage/);
  assert.doesNotMatch(source, /attachmentModalStrip\.innerHTML/);
  assert.doesNotMatch(source, /attachmentModalCollage\.innerHTML/);
});

test("legacy attachment modal components keep legacy classes", async () => {
  const shellSource = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/media/LegacyAttachmentModalShell.tsx", import.meta.url), "utf8")
  ));
  const stripSource = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/media/LegacyAttachmentFileStrip.tsx", import.meta.url), "utf8")
  ));
  const collageSource = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/media/LegacyAttachmentPhotoCollage.tsx", import.meta.url), "utf8")
  ));

  assert.match(shellSource, /attachment-modal-shell/);
  assert.match(shellSource, /attachment-modal-caption/);
  assert.match(stripSource, /attachment-modal-file-item/);
  assert.match(collageSource, /attachment-modal-collage-item/);
  assert.match(collageSource, /photo-tile-delete/);
  assert.doesNotMatch(shellSource, /AttachmentModalHost\.module\.css/);
});

test("message actions delegates composer reply preview to legacy Preact mount", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/message-actions.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyComposerReplyPreviewMount/);
  assert.match(source, /syncLegacyComposerReplyPreview/);
  assert.match(source, /setLegacyComposerReplyPreviewHandlers/);
  assert.doesNotMatch(source, /composerReplyText\.innerHTML/);
});

test("legacy composer reply preview keeps legacy classes", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/chat/LegacyComposerReplyPreviewInner.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /composer-reply-copy/);
  assert.match(source, /composer-reply-author/);
  assert.match(source, /composer-reply-text/);
  assert.match(source, /composer-reply-close/);
  assert.doesNotMatch(source, /Composer\.module\.css/);
});

test("sidebar delegates dialog context menu rendering to legacy Preact mount", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/services/sidebar.ts", import.meta.url), "utf8")
  ));

  assert.match(source, /legacyDialogContextMenuMount/);
  assert.match(source, /renderLegacyDialogContextMenuBody/);
  assert.match(source, /getLegacyDialogContextMenuActions/);
  assert.doesNotMatch(source, /dialogContextMenuBody\.innerHTML/);
});

test("legacy dialog context menu keeps legacy classes", async () => {
  const source = await import("node:fs/promises").then((fs) => (
    fs.readFile(new URL("../src/client/features/sidebar/LegacyDialogContextMenuBody.tsx", import.meta.url), "utf8")
  ));

  assert.match(source, /dialog-context-menu-item/);
  assert.match(source, /data-action=/);
  assert.doesNotMatch(source, /DialogItem\.module\.css/);
});
