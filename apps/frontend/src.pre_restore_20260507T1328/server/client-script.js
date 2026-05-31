import { buildAuthClientChunk } from "./client/auth.js";
import { buildBootstrapClientChunk } from "./client/bootstrap.js";
import { buildCallsClientChunk } from "./client/calls.js";
import { buildMediaClientChunk } from "./client/media.js";
import { messageActionsClientChunk } from "./client/message-actions.js";
import { searchClientChunk } from "./client/search.js";
import { secureClientChunk } from "./client/secure.js";
import { sidebarClientChunk } from "./client/sidebar.js";

export const buildClientScript = ({
  apiBaseUrl,
  appleEmojiAssetBaseUrl,
  outgoingCallRingtoneUrl,
  incomingCallRingtoneUrl,
  rtcIceServers,
  logoDataUrl,
  messageSoundUrl,
  searchEmptyVideoUrl,
  sendLocalSoundUrl,
  serviceWorkerUrl,
  uiFlags,
  wsBaseUrl
}) => [
  buildBootstrapClientChunk({
    apiBaseUrl,
    appleEmojiAssetBaseUrl,
    uiFlags,
    searchEmptyVideoUrl
  }),
  secureClientChunk,
  searchClientChunk,
  buildCallsClientChunk({
    outgoingCallRingtoneUrl,
    incomingCallRingtoneUrl,
    rtcIceServers
  }),
  buildMediaClientChunk({
    sendLocalSoundUrl,
    messageSoundUrl,
    logoDataUrl,
    wsBaseUrl
  }),
  sidebarClientChunk,
  messageActionsClientChunk,
  buildAuthClientChunk({
    serviceWorkerUrl
  })
].join("\n");
