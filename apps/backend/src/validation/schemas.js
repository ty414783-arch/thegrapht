import { z } from "zod";

const trimmedString = (min, max) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max);

export const registerSchema = z.object({
  name: trimmedString(2, 80),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
});

export const directDialogSchema = z.object({
  targetUserId: trimmedString(3, 80)
});

export const groupDialogSchema = z.object({
  title: trimmedString(1, 255),
  memberUserIds: z.array(trimmedString(3, 80)).min(1).max(19999),
  avatarDataUrl: z.string().trim().max(2_000_000).optional()
});

export const secureDirectDialogSchema = z.object({
  targetUserId: trimmedString(3, 80),
  creatorKeyEnvelope: trimmedString(24, 32768),
  recipientKeyEnvelope: trimmedString(24, 32768),
  keyAlgorithm: z.string().trim().min(3).max(40).default("X25519"),
  encryptionVersion: z.coerce.number().int().min(1).max(1).default(1),
  explicit: z.boolean().optional().default(false)
});

export const messageSchema = z.object({
  body: trimmedString(1, 4000),
  replyToMessageId: z.string().trim().min(3).max(120).optional()
});

export const secureMessageSchema = z.object({
  ciphertext: trimmedString(16, 65535),
  nonce: trimmedString(8, 1024),
  envelopeVersion: z.coerce.number().int().min(1).max(1).default(1),
  senderKeyId: z.string().trim().min(3).max(160).optional(),
  replyToMessageId: z.string().trim().min(3).max(120).optional()
});

export const mediaMessageSchema = z.object({
  body: z.string().trim().max(4000).default(""),
  albumId: z.string().trim().min(3).max(80).optional(),
  albumIndex: z.coerce.number().int().min(0).max(499).optional(),
  albumSize: z.coerce.number().int().min(1).max(5).optional(),
  attachmentDurationSeconds: z.coerce.number().int().min(0).max(24 * 60 * 60).optional(),
  replyToMessageId: z.string().trim().min(3).max(120).optional()
});

export const deleteMessageSchema = z.object({
  deleteForEveryone: z.boolean().optional().default(false)
});

export const searchUsersQuerySchema = z.object({
  q: trimmedString(1, 32)
});

export const typingEventSchema = z.object({
  dialogId: trimmedString(3, 120).nullable(),
  isTyping: z.boolean().default(false)
});

export const e2eKeyBundleSchema = z.object({
  publicKey: trimmedString(24, 8192),
  algorithm: z.string().trim().min(3).max(40).default("X25519")
});

export const verifySchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  code: z.string().trim().length(6)
});

export const resendSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase())
});
