export type User = {
  id: string;
  displayName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string | null;
  avatarUpdatedAt?: string | null;
  isSecureSupported?: boolean;
};

export type DialogType = "direct" | "private" | "secret" | "group" | "channel" | "saved";

export type Dialog = {
  id: string;
  publicId: string;
  type: DialogType;
  title?: string;
  subtitle?: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  lastMessagePreview?: string;
  peerUserId?: string | null;
  peerReadAt?: string | null;
  peerLastSeenAt?: string | null;
  encryptionMode?: string | null;
  channelSlug?: string | null;
  channelIsMember?: boolean;
  channelCanPost?: boolean;
  [key: string]: unknown;
};

export type MessageLocalStatus = "pending" | "failed" | "sent";

export type Message = {
  id: string;
  type?: string;
  body?: string | null;
  createdAt?: string;
  senderId?: string;
  senderName?: string;
  localStatus?: MessageLocalStatus;
  ciphertext?: string | null;
  nonce?: string | null;
  albumId?: string | null;
  albumIndex?: number | null;
  albumSize?: number | null;
  mediaUrl?: string | null;
  replyToMessageId?: string | null;
  [key: string]: unknown;
};

export type ToastItem = {
  id: string;
  message: string;
  type?: "info" | "error" | "success";
};

export type UploadItem = {
  id: string;
  dialogPublicId: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "failed" | "done";
  error?: string;
};

export type AppState = {
  auth: {
    user: User | null;
    userId: string;
    token: string;
    isAuthenticated: boolean;
  };
  dialogs: {
    all: Dialog[];
    current: Dialog | null;
    currentPublicId: string;
  };
  messages: {
    current: Message[];
    localOutgoing: Message[];
  };
  presence: {
    onlineUserIds: Set<string>;
    typingByDialog: Record<string, string[]>;
    peerReadAt: string | null;
  };
  ui: {
    toasts: ToastItem[];
    isNearChatBottom: boolean;
    pendingReplyMessage: Message | null;
    bootComplete: boolean;
    connectionStatus: "online" | "offline" | "reconnecting";
  };
  uploads: {
    items: UploadItem[];
  };
};

export const initialAppState = (): AppState => ({
  auth: {
    user: null,
    userId: "",
    token: "",
    isAuthenticated: false
  },
  dialogs: {
    all: [],
    current: null,
    currentPublicId: ""
  },
  messages: {
    current: [],
    localOutgoing: []
  },
  presence: {
    onlineUserIds: new Set(),
    typingByDialog: {},
    peerReadAt: null
  },
  ui: {
    toasts: [],
    isNearChatBottom: true,
    pendingReplyMessage: null,
    bootComplete: false,
    connectionStatus: "online"
  },
  uploads: {
    items: []
  }
});
