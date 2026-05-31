package su.thegrapht.app

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Base64
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.EOFException
import java.io.InputStream
import java.io.OutputStream
import java.net.Socket
import java.net.URI
import java.security.SecureRandom
import java.util.Collections
import java.util.Locale
import java.util.concurrent.CopyOnWriteArraySet
import javax.net.ssl.SSLSocketFactory

object RealtimeClient {
    interface Listener {
        fun onRealtimeEvent(type: String, payload: JSONObject) {}
    }

    private val mainHandler = Handler(Looper.getMainLooper())
    private val listeners = CopyOnWriteArraySet<Listener>()
    private val onlineUserIds = Collections.synchronizedSet(linkedSetOf<String>())
    private val typingByDialog = linkedMapOf<String, MutableSet<String>>()
    private val random = SecureRandom()

    private var socket: Socket? = null
    private var input: InputStream? = null
    private var output: OutputStream? = null
    private var readerThread: Thread? = null
    private var currentDialogId: String? = null
    private var activeDialogPublicId: String? = null
    private var appInForeground = false
    private var currentUserId: String? = null
    private var appContext: Context? = null
    private var reconnectScheduled = false

    fun connect(context: Context, userId: String?) {
        appContext = context.applicationContext
        currentUserId = userId
        if (socket?.isConnected == true && socket?.isClosed == false) return

        Thread {
            try {
                openSocket(context)
                sendPresence(currentDialogId)
                reconnectScheduled = false
                startReaderLoop()
            } catch (_: Exception) {
                closeInternal()
                reconnect()
            }
        }.start()
    }

    fun disconnect() {
        reconnectScheduled = false
        closeInternal()
    }

    fun addListener(listener: Listener) {
        listeners.add(listener)
    }

    fun removeListener(listener: Listener) {
        listeners.remove(listener)
    }

    fun setForegroundState(inForeground: Boolean, visibleDialogPublicId: String?) {
        appInForeground = inForeground
        activeDialogPublicId = visibleDialogPublicId
    }

    fun updatePresence(dialogId: String?) {
        currentDialogId = dialogId
        sendPresence(dialogId)
    }

    fun sendTyping(dialogId: String?, isTyping: Boolean) {
        if (dialogId.isNullOrBlank()) return
        sendJson(JSONObject().apply {
            put("type", "typing")
            put("dialogId", dialogId)
            put("isTyping", isTyping)
        })
    }

    fun isUserOnline(userId: String?): Boolean = !userId.isNullOrBlank() && onlineUserIds.contains(userId)

    fun isDialogTyping(dialogId: String?): Boolean =
        !dialogId.isNullOrBlank() && !typingByDialog[dialogId].isNullOrEmpty()

    private fun openSocket(context: Context) {
        val uri = URI(BuildConfig.BASE_URL.replaceFirst("https://", "wss://").replaceFirst("http://", "ws://") + "/ws")
        val isSecure = uri.scheme.equals("wss", true)
        val host = uri.host
        val port = if (uri.port != -1) uri.port else if (isSecure) 443 else 80
        val path = if (uri.rawPath.isNullOrBlank()) "/ws" else uri.rawPath
        val cookie = SessionStore.getCookie(context)
        val socketKeyBytes = ByteArray(16).also { random.nextBytes(it) }
        val socketKey = Base64.encodeToString(socketKeyBytes, Base64.NO_WRAP)

        val createdSocket = if (isSecure) {
            SSLSocketFactory.getDefault().createSocket(host, port)
        } else {
            Socket(host, port)
        }

        val out = createdSocket.getOutputStream()
        val handshake = buildString {
            append("GET $path HTTP/1.1\r\n")
            append("Host: $host:$port\r\n")
            append("Upgrade: websocket\r\n")
            append("Connection: Upgrade\r\n")
            append("Sec-WebSocket-Key: $socketKey\r\n")
            append("Sec-WebSocket-Version: 13\r\n")
            if (cookie.isNotBlank()) {
                append("Cookie: $cookie\r\n")
            }
            append("\r\n")
        }
        out.write(handshake.toByteArray(Charsets.UTF_8))
        out.flush()

        val responseHeader = readHttpHeaders(createdSocket.getInputStream())
        if (!responseHeader.startsWith("HTTP/1.1 101")) {
            throw IllegalStateException("Realtime handshake failed")
        }

        socket = createdSocket
        input = createdSocket.getInputStream()
        output = out
    }

    private fun readHttpHeaders(stream: InputStream): String {
        val buffer = ByteArrayOutputStream()
        var state = 0
        while (true) {
            val value = stream.read()
            if (value == -1) throw EOFException("Unexpected EOF during handshake")
            buffer.write(value)
            state = when {
                state == 0 && value == '\r'.toInt() -> 1
                state == 1 && value == '\n'.toInt() -> 2
                state == 2 && value == '\r'.toInt() -> 3
                state == 3 && value == '\n'.toInt() -> 4
                else -> 0
            }
            if (state == 4) {
                return buffer.toString("UTF-8")
            }
        }
    }

    private fun startReaderLoop() {
        val stream = input ?: return
        readerThread = Thread {
            try {
                while (true) {
                    val payload = readFrame(stream) ?: break
                    handlePayload(payload)
                }
            } catch (_: Exception) {
            } finally {
                closeInternal()
                reconnect()
            }
        }.also {
            it.isDaemon = true
            it.start()
        }
    }

    private fun readFrame(stream: InputStream): JSONObject? {
        val first = stream.read()
        if (first == -1) return null
        val second = stream.read()
        if (second == -1) return null

        val opcode = first and 0x0f
        if (opcode == 0x8) return null
        if (opcode != 0x1) return null

        var length = second and 0x7f
        if (length == 126) {
            val firstLen = stream.read()
            val secondLen = stream.read()
            if (firstLen == -1 || secondLen == -1) return null
            length = (firstLen shl 8) or secondLen
        } else if (length == 127) {
            val longLengthBytes = ByteArray(8)
            if (stream.read(longLengthBytes) != 8) return null
            length = longLengthBytes[7].toInt() and 0xff
        }

        val payload = ByteArray(length)
        var offset = 0
        while (offset < length) {
            val read = stream.read(payload, offset, length - offset)
            if (read == -1) return null
            offset += read
        }

        return runCatching { JSONObject(String(payload, Charsets.UTF_8)) }.getOrNull()
    }

    private fun sendPresence(dialogId: String?) {
        sendJson(JSONObject().apply {
            put("type", "presence")
            if (dialogId.isNullOrBlank()) put("dialogId", JSONObject.NULL) else put("dialogId", dialogId)
        })
    }

    private fun sendJson(payload: JSONObject) {
        val bytes = payload.toString().toByteArray(Charsets.UTF_8)
        val header = ByteArrayOutputStream()
        header.write(0x81)

        when {
            bytes.size < 126 -> header.write(0x80 or bytes.size)
            bytes.size < 65536 -> {
                header.write(0x80 or 126)
                header.write((bytes.size shr 8) and 0xff)
                header.write(bytes.size and 0xff)
            }
            else -> return
        }

        val mask = ByteArray(4).also { random.nextBytes(it) }
        header.write(mask)
        val masked = ByteArray(bytes.size)
        for (index in bytes.indices) {
            masked[index] = (bytes[index].toInt() xor mask[index % 4].toInt()).toByte()
        }

        synchronized(this) {
            try {
                output?.write(header.toByteArray())
                output?.write(masked)
                output?.flush()
            } catch (_: Exception) {
                closeInternal()
                reconnect()
            }
        }
    }

    private fun handlePayload(payload: JSONObject) {
        val type = payload.optString("type")
        when (type) {
            "presence_snapshot" -> {
                onlineUserIds.clear()
                payload.optJSONArray("userIds")?.let { users ->
                    for (index in 0 until users.length()) {
                        onlineUserIds.add(users.optString(index))
                    }
                }
            }
            "user_presence" -> {
                val userId = payload.optString("userId")
                val isOnline = payload.optBoolean("isOnline")
                if (isOnline) onlineUserIds.add(userId) else onlineUserIds.remove(userId)
            }
            "dialog_typing" -> {
                val dialogId = payload.optString("dialogId")
                val userId = payload.optString("userId")
                val isTyping = payload.optBoolean("isTyping")
                val set = typingByDialog.getOrPut(dialogId) { linkedSetOf() }
                if (isTyping) set.add(userId) else set.remove(userId)
                if (set.isEmpty()) typingByDialog.remove(dialogId)
            }
            "message_created" -> {
                val dialog = payload.optJSONObject("dialog")
                val message = payload.optJSONObject("message")
                val senderId = message?.optString("senderId").orEmpty()
                val dialogPublicId = dialog?.optString("publicId").orEmpty()
                val dialogType = dialog?.optString("type").orEmpty()
                val isPrivateOrSecret = dialogType.equals("secret", ignoreCase = true) || dialogType.equals("private", ignoreCase = true)
                
                if (!isPrivateOrSecret && senderId.isNotBlank() && senderId != currentUserId && (!appInForeground || activeDialogPublicId != dialogPublicId)) {
                    appContext?.let {
                        NotificationHelper.showIncomingMessage(
                            it,
                            dialogPublicId,
                            dialog?.optString("title").orEmpty(),
                            dialog?.optString("subtitle").orEmpty(),
                            buildMessagePreview(message)
                        )
                    }
                }
            }
            "call_invite" -> {
                appContext?.let {
                    NotificationHelper.showIncomingCall(
                        it,
                        payload.optString("dialogPublicId"),
                        payload.optString("callerName", "TheGrapht")
                    )
                }
            }
        }

        mainHandler.post {
            listeners.forEach { it.onRealtimeEvent(type, payload) }
        }
    }

    private fun reconnect() {
        val context = appContext ?: return
        if (reconnectScheduled) return
        reconnectScheduled = true
        mainHandler.postDelayed({
            reconnectScheduled = false
            if (socket == null) {
                connect(context, currentUserId)
            }
        }, 1200L)
    }

    private fun closeInternal() {
        try {
            input?.close()
        } catch (_: Exception) {
        }
        try {
            output?.close()
        } catch (_: Exception) {
        }
        try {
            socket?.close()
        } catch (_: Exception) {
        }
        input = null
        output = null
        socket = null
        readerThread = null
    }

    private fun buildMessagePreview(message: JSONObject?): String {
        if (message == null) return "Новое сообщение"
        val type = message.optString("type")
        val body = message.optString("body")
        return if (type == "image") {
            if (body.isBlank()) "Фотография" else "Фотография: $body"
        } else {
            body.ifBlank { "Новое сообщение" }
        }
    }
}
