import { z } from "zod";

import {
  dialogDtoSchema,
  messageDtoSchema,
  presenceEventSchema,
  typingEventSchema
} from "./client.js";

export const realtimeEventTypes = Object.freeze([
  "presence_snapshot",
  "user_presence",
  "dialog_presence",
  "dialog_created",
  "message_created",
  "message_deleted",
  "dialog_read",
  "dialog_typing",
  "call_invite",
  "call_accept",
  "call_reject",
  "call_end",
  "call_candidate",
  "call_presence",
  "call_leave",
  "call_screen_state",
  "call_mute_state"
]);

const dialogSummarySchema = dialogDtoSchema.pick({
  id: true,
  publicId: true,
  title: true,
  type: true,
  encryptionMode: true,
  encryptionVersion: true,
  isSecureSupported: true
}).extend({
  subtitle: z.string().nullable()
});

const presenceSnapshotSchema = z.object({
  type: z.literal("presence_snapshot"),
  userIds: z.array(z.string())
});

const userPresenceSchema = z.object({
  type: z.literal("user_presence")
}).merge(presenceEventSchema);

const dialogPresenceSchema = z.object({
  type: z.literal("dialog_presence"),
  dialogId: z.string(),
  activeUserIds: z.array(z.string())
});

const dialogCreatedSchema = z.object({
  type: z.literal("dialog_created"),
  dialog: dialogDtoSchema,
  actorUserId: z.string()
});

const messageCreatedSchema = z.object({
  type: z.literal("message_created"),
  dialog: dialogSummarySchema,
  message: messageDtoSchema
});

const messageDeletedSchema = z.object({
  type: z.literal("message_deleted"),
  dialog: dialogSummarySchema,
  messageId: z.string(),
  deletedForEveryone: z.boolean(),
  actorUserId: z.string()
});

const dialogReadSchema = z.object({
  type: z.literal("dialog_read"),
  dialogId: z.string(),
  userId: z.string(),
  readAt: z.union([z.string(), z.date()]).transform(v => v instanceof Date ? v.toISOString() : v)
});

const dialogTypingSchema = z.object({
  type: z.literal("dialog_typing")
}).merge(typingEventSchema);

const callEventSchema = z.object({
  type: z.enum(["call_invite", "call_accept", "call_reject", "call_end", "call_candidate", "call_presence", "call_leave", "call_screen_state", "call_mute_state"]),
  dialogPublicId: z.string(),
  callerName: z.string().optional(),
  senderUserId: z.string()
}).passthrough();

export const realtimeEventSchema = z.discriminatedUnion("type", [
  presenceSnapshotSchema,
  userPresenceSchema,
  dialogPresenceSchema,
  dialogCreatedSchema,
  messageCreatedSchema,
  messageDeletedSchema,
  dialogReadSchema,
  dialogTypingSchema,
  callEventSchema
]);

export const createPresenceSnapshotEvent = (userIds) =>
  realtimeEventSchema.parse({
    type: "presence_snapshot",
    userIds
  });

export const createUserPresenceEvent = ({ userId, isOnline, lastSeenAt = null }) =>
  realtimeEventSchema.parse({
    type: "user_presence",
    userId,
    isOnline,
    lastSeenAt
  });

export const createDialogPresenceEvent = ({ dialogId, activeUserIds }) =>
  realtimeEventSchema.parse({
    type: "dialog_presence",
    dialogId,
    activeUserIds
  });

export const createMessageCreatedEvent = ({ dialog, message }) =>
  realtimeEventSchema.parse({
    type: "message_created",
    dialog: {
      id: dialog.id,
      publicId: dialog.publicId,
      title: dialog.title,
      type: dialog.type,
      subtitle: dialog.subtitle ?? null,
      encryptionMode: dialog.encryptionMode,
      encryptionVersion: dialog.encryptionVersion,
      isSecureSupported: dialog.isSecureSupported
    },
    message
  });

export const createDialogCreatedEvent = ({ dialog, actorUserId }) =>
  realtimeEventSchema.parse({
    type: "dialog_created",
    dialog,
    actorUserId
  });

export const createMessageDeletedEvent = ({
  dialog,
  messageId,
  deletedForEveryone,
  actorUserId
}) =>
  realtimeEventSchema.parse({
    type: "message_deleted",
    dialog: {
      id: dialog.id,
      publicId: dialog.publicId,
      title: dialog.title,
      type: dialog.type,
      subtitle: dialog.subtitle ?? null,
      encryptionMode: dialog.encryptionMode,
      encryptionVersion: dialog.encryptionVersion,
      isSecureSupported: dialog.isSecureSupported
    },
    messageId,
    deletedForEveryone,
    actorUserId
  });

export const createDialogReadEvent = ({ dialogId, userId, readAt }) =>
  realtimeEventSchema.parse({
    type: "dialog_read",
    dialogId,
    userId,
    readAt
  });

export const createDialogTypingEvent = ({ dialogId, userId, isTyping }) =>
  realtimeEventSchema.parse({
    type: "dialog_typing",
    dialogId,
    userId,
    isTyping
  });

export const createCallInviteEvent = (payload) => realtimeEventSchema.parse(payload);
