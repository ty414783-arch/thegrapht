package su.thegrapht.app

import org.json.JSONObject
import java.util.Locale

data class DialogItem(
    val id: String,
    val publicId: String,
    val type: String,
    val title: String,
    val subtitle: String,
    val preview: String,
    val peerUserId: String,
    val peerLastSeenAt: String,
    val unreadCount: Int,
    val lastMessageCreatedAt: String
) {
    companion object {
        fun fromJson(json: JSONObject?) = DialogItem(
            id = json?.optString("id").orEmpty(),
            publicId = json?.optString("publicId").orEmpty(),
            type = json?.optString("type").orEmpty(),
            title = json?.optString("title").orEmpty(),
            subtitle = json?.optString("subtitle").orEmpty(),
            preview = json?.optString("lastMessagePreview").orEmpty(),
            peerUserId = json?.optString("peerUserId").orEmpty(),
            peerLastSeenAt = json?.optString("peerLastSeenAt").orEmpty(),
            unreadCount = json?.optInt("unreadCount", 0) ?: 0,
            lastMessageCreatedAt = json?.optString("lastMessageCreatedAt").orEmpty()
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
    val albumSize: Int
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
            id = json?.optString("id").orEmpty(),
            body = json?.optString("body").orEmpty(),
            senderId = json?.optString("senderId").orEmpty(),
            senderName = json?.optString("senderName").orEmpty(),
            createdAt = json?.optString("createdAt").orEmpty(),
            type = json?.optString("type").orEmpty(),
            mediaUrl = json?.optString("mediaUrl").orEmpty(),
            attachmentMime = json?.optString("attachmentMime").orEmpty(),
            albumId = json?.optString("albumId").orEmpty(),
            albumIndex = json?.optInt("albumIndex", -1) ?: -1,
            albumSize = json?.optInt("albumSize", 0) ?: 0
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
            id = json?.optString("id").orEmpty(),
            name = json?.optString("name").orEmpty(),
            username = json?.optString("username").orEmpty()
        )
    }
}
