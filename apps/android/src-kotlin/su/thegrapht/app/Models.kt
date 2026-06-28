package su.thegrapht.app

import org.json.JSONObject
import java.util.Locale

fun JSONObject.optStringClean(name: String): String {
    val value = optString(name, "")
    return if (value == "null") "" else value
}

data class DialogItem(
    val id: String,
    val publicId: String,
    val type: String,
    val title: String,
    val subtitle: String,
    val preview: String,
    val lastMessageSenderName: String,
    val peerUserId: String,
    val peerLastSeenAt: String,
    val unreadCount: Int,
    val lastMessageCreatedAt: String,
    val avatarUrl: String
) {
    companion object {
        fun fromJson(json: JSONObject?) = DialogItem(
            id = json?.optStringClean("id").orEmpty(),
            publicId = json?.optStringClean("publicId").orEmpty(),
            type = json?.optStringClean("type").orEmpty(),
            title = json?.optStringClean("title").orEmpty(),
            subtitle = json?.optStringClean("subtitle").orEmpty(),
            preview = json?.optStringClean("lastMessagePreview").orEmpty(),
            lastMessageSenderName = json?.optStringClean("lastMessageSenderName").orEmpty(),
            peerUserId = json?.optStringClean("peerUserId").orEmpty(),
            peerLastSeenAt = json?.optStringClean("peerLastSeenAt").orEmpty(),
            unreadCount = json?.optInt("unreadCount", 0) ?: 0,
            lastMessageCreatedAt = json?.optStringClean("lastMessageCreatedAt").orEmpty(),
            avatarUrl = json?.optStringClean("avatarUrl").orEmpty()
        )
    }
}

data class MessageItem(
    val id: String,
    val body: String,
    val senderId: String,
    val senderName: String,
    val createdAt: String,
    val type: String,
    val mediaUrl: String,
    val attachmentMime: String,
    val albumId: String,
    val albumIndex: Int,
    val albumSize: Int,
    val replyToMessageId: String,
    val replyToSenderName: String,
    val replyToBody: String
) {
    val normalizedType: String
        get() = type.trim().toLowerCase(Locale.US)

    val normalizedMime: String
        get() = attachmentMime.trim().toLowerCase(Locale.US)

    val isImageMessage: Boolean
        get() = normalizedType == "image" && mediaUrl.isNotBlank() && normalizedMime.startsWith("image/")

    val normalizedAlbumId: String
        get() = if (isImageMessage && albumSize > 1) albumId.trim() else ""

    companion object {
        fun fromJson(json: JSONObject?) = MessageItem(
            id = json?.optStringClean("id").orEmpty(),
            body = json?.optStringClean("body").orEmpty(),
            senderId = json?.optStringClean("senderId").orEmpty(),
            senderName = json?.optStringClean("senderName").orEmpty(),
            createdAt = json?.optStringClean("createdAt").orEmpty(),
            type = json?.optStringClean("type").orEmpty(),
            mediaUrl = json?.optStringClean("mediaUrl").orEmpty(),
            attachmentMime = json?.optStringClean("attachmentMime").orEmpty(),
            albumId = json?.optStringClean("albumId").orEmpty(),
            albumIndex = json?.optInt("albumIndex", -1) ?: -1,
            albumSize = json?.optInt("albumSize", 0) ?: 0,
            replyToMessageId = json?.optStringClean("replyToMessageId").orEmpty(),
            replyToSenderName = json?.optStringClean("replyToSenderName").orEmpty(),
            replyToBody = json?.optStringClean("replyToBody").orEmpty()
        )
    }
}

data class SearchUserItem(
    val id: String,
    val name: String,
    val username: String
) {
    companion object {
        fun fromJson(json: JSONObject?) = SearchUserItem(
            id = json?.optStringClean("id").orEmpty(),
            name = json?.optStringClean("name").orEmpty(),
            username = json?.optStringClean("username").orEmpty()
        )
    }
}
