import { h, render } from "preact";
import { LegacyTextMessage, type LegacyTextMessageProps } from "./LegacyTextMessage.tsx";

type StatusState = LegacyTextMessageProps["statusState"];

const getWin = () => window as any;

export function resolveLegacyTextStatusState(message: any, isOutgoing: boolean): StatusState {
  if (!isOutgoing) {
    return "none";
  }

  if (message?.localStatus === "pending") {
    return "pending";
  }

  if (message?.localStatus === "failed") {
    return "failed";
  }

  const dialog = getWin().currentDialogSnapshot;
  const supportsPeerReadReceipts = Boolean(
    dialog?.peerUserId
    && ["direct", "private", "secret"].includes(String(dialog?.type || ""))
  );

  if (supportsPeerReadReceipts) {
    const messageTimestamp = new Date(message.createdAt).getTime();
    const peerReadTimestamp = getWin().currentPeerReadAt ? new Date(getWin().currentPeerReadAt).getTime() : 0;
    const isReadByPeer = Number.isFinite(peerReadTimestamp)
      && peerReadTimestamp > 0
      && messageTimestamp <= peerReadTimestamp;
    return isReadByPeer ? "read" : "sent";
  }

  if (dialog?.type === "group") {
    const messageTimestamp = new Date(message.createdAt).getTime();
    const groupReadTimestamp = getWin().currentPeerReadAt ? new Date(getWin().currentPeerReadAt).getTime() : 0;
    const isReadByAnyMember = Number.isFinite(groupReadTimestamp)
      && groupReadTimestamp > 0
      && messageTimestamp <= groupReadTimestamp;
    return isReadByAnyMember ? "read" : "sent";
  }

  return "read";
}

export function mountLegacyTextMessageDom(props: LegacyTextMessageProps): HTMLElement {
  const host = document.createElement("div");
  render(h(LegacyTextMessage, props), host);
  const node = host.firstElementChild;
  if (!(node instanceof HTMLElement)) {
    host.remove();
    throw new Error("Legacy text message mount produced no root element");
  }
  host.removeChild(node);
  host.remove();
  return node;
}
