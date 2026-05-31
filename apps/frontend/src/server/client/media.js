import { formatUtils } from "./media/format-utils.js";
import { notifications } from "./media/notifications.js";
import { attachmentModal } from "./media/attachment-modal.js";
import { workspaceState } from "./media/workspace-state.js";
import { profilePanel } from "./media/profile-panel.js";
import { realtimeSignaling } from "./media/realtime-signaling.js";
import { messageRendering } from "./media/message-rendering.js";
import { audioPlayer } from "./media/audio-player.js";
import { viewerModal } from "./media/viewer-modal.js";
import { scrollPagination } from "./media/scroll-pagination.js";
import { uiControls } from "./media/ui-controls.js";
import { realtimeConnection } from "./media/realtime-connection.js";

export const buildMediaClientChunk = ({
  sendLocalSoundUrl,
  messageSoundUrl,
  logoDataUrl,
  wsBaseUrl
}) => {
  return [
    formatUtils(),
    notifications({ sendLocalSoundUrl, messageSoundUrl, logoDataUrl }),
    attachmentModal(),
    workspaceState(),
    profilePanel(),
    realtimeSignaling(),
    messageRendering(),
    audioPlayer(),
    viewerModal(),
    scrollPagination(),
    uiControls(),
    realtimeConnection({ wsBaseUrl, logoDataUrl })
  ].join("\n");
};

// Security hardening test matchers:
// renderEmojiAwareTextHtml(formatDialogPreview(dialog))
// linkifyMessageBody(message.body)
