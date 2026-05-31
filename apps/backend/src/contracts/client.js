import { z } from "zod";

export const userDtoSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  username: z.string(),
  email: z.string(),
  isSecureSupported: z.boolean().optional()
});

export const dialogDtoSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  type: z.string(),
  avatarUrl: z.string().nullable().optional(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  encryptionMode: z.string().optional(),
  encryptionVersion: z.number().int().nullable().optional(),
  isSecureSupported: z.boolean().optional(),
  peerUserId: z.string().nullable().optional(),
  peerLastSeenAt: z.union([z.string(), z.date()]).nullable().optional().transform(v => v instanceof Date ? v.toISOString() : v),
  participants: z.number().int().nonnegative().optional(),
  lastMessagePreview: z.string().nullable().optional(),
  lastMessageSenderName: z.string().nullable().optional(),
  lastMessageId: z.string().nullable().optional(),
  lastMessageType: z.string().nullable().optional(),
  lastMessageCiphertext: z.string().nullable().optional(),
  lastMessageNonce: z.string().nullable().optional(),
  lastMessageSenderKeyId: z.string().nullable().optional(),
  lastMessageCreatedAt: z.union([z.string(), z.date()]).nullable().optional().transform(v => v instanceof Date ? v.toISOString() : v),
  unreadCount: z.number().int().nonnegative().optional()
});

export const replyPreviewDtoSchema = z.object({
  replyToMessageId: z.string().nullable().optional(),
  replyToSenderId: z.string().nullable().optional(),
  replyToSenderName: z.string().nullable().optional(),
  replyToBody: z.string().nullable().optional(),
  replyToType: z.string().nullable().optional(),
  replyToMediaUrl: z.string().nullable().optional()
});

export const messageDtoSchema = z.object({
  id: z.string(),
  body: z.string().nullable().optional(),
  ciphertext: z.string().nullable().optional(),
  nonce: z.string().nullable().optional(),
  envelopeVersion: z.number().int().nullable().optional(),
  senderKeyId: z.string().nullable().optional(),
  type: z.string(),
  albumId: z.string().nullable().optional(),
  albumIndex: z.number().int().nullable().optional(),
  albumSize: z.number().int().nullable().optional(),
  mediaUrl: z.string().nullable().optional(),
  attachmentMime: z.string().nullable().optional(),
  attachmentName: z.string().nullable().optional(),
  attachmentSize: z.number().int().nullable().optional(),
  attachmentDurationSeconds: z.number().int().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).transform(v => v instanceof Date ? v.toISOString() : v),
  senderId: z.string(),
  senderName: z.string()
}).merge(replyPreviewDtoSchema);

export const presenceEventSchema = z.object({
  userId: z.string(),
  isOnline: z.boolean(),
  lastSeenAt: z.union([z.string(), z.date()]).nullable().optional().transform(v => v instanceof Date ? v.toISOString() : v)
});

export const typingEventSchema = z.object({
  dialogId: z.string(),
  userId: z.string(),
  isTyping: z.boolean()
});
