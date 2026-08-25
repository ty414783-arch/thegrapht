export const loadSecureFeatures = () => import("../../services/secure.ts");
export { useSecureMessageBody } from "./useSecureMessageBody.ts";

export const createSecretChat = async (peerUserId: string) => {
  await loadSecureFeatures();
  const win = window as any;
  if (typeof win.createSecretDirectChat === "function") {
    return win.createSecretDirectChat(peerUserId);
  }
  throw new Error("Secure chat creation is unavailable.");
};
