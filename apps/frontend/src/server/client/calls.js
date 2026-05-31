import { callUtils } from "./calls/call-utils.js";
import { callDebug } from "./calls/call-debug.js";
import { callWebrtc } from "./calls/call-webrtc.js";
import { groupCallState } from "./calls/group-call-state.js";
import { callUi } from "./calls/call-ui.js";
import { callSignaling } from "./calls/call-signaling.js";

export const buildCallsClientChunk = ({
  outgoingCallRingtoneUrl,
  incomingCallRingtoneUrl,
  rtcIceServers
}) => {
  return [
    callUtils({ rtcIceServers }),
    callDebug({ outgoingCallRingtoneUrl, incomingCallRingtoneUrl }),
    callWebrtc(),
    groupCallState(),
    callUi(),
    callSignaling()
  ].join("\n");
};
