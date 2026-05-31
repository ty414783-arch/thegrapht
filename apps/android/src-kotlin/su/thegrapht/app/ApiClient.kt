package su.thegrapht.app

import android.content.Context
import android.net.Uri
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.BufferedWriter
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.InputStream
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.util.Locale

object ApiClient {
    class ApiException(message: String, val statusCode: Int) : Exception(message)

    private fun open(context: Context, path: String, method: String): HttpURLConnection {
        val connection = URL(BuildConfig.BASE_URL + path).openConnection() as HttpURLConnection
        connection.requestMethod = method
        connection.connectTimeout = 15000
        connection.readTimeout = 15000
        connection.setRequestProperty("Accept", "application/json")
        connection.setRequestProperty("User-Agent", "TheGrapht-Android/1.0")
        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
        connection.setRequestProperty("X-TheGraphT-Client", "android")
        SessionStore.getCookie(context).takeIf { it.isNotBlank() }?.let {
            connection.setRequestProperty("Cookie", it)
        }
        return connection
    }

    private fun readStream(stream: InputStream?): String {
        if (stream == null) return ""
        return BufferedReader(InputStreamReader(stream, StandardCharsets.UTF_8)).use { reader ->
            buildString {
                while (true) {
                    val line = reader.readLine() ?: break
                    append(line)
                }
            }
        }
    }

    private fun parseObject(text: String?): JSONObject = if (text.isNullOrBlank()) JSONObject() else JSONObject(text)

    private fun persistCookieIfPresent(context: Context, connection: HttpURLConnection, payload: JSONObject) {
        val raw = connection.headerFields?.get("Set-Cookie")?.firstOrNull() ?: return
        val cookie = raw.split(";", limit = 2).firstOrNull().orEmpty()
        val user = payload.optJSONObject("user")
        SessionStore.saveSession(
            context,
            cookie,
            user?.optString("id").orEmpty(),
            user?.optString("displayName").orEmpty()
        )
    }

    private fun sendJson(context: Context, path: String, method: String, body: JSONObject?): JSONObject {
        val connection = open(context, path, method)
        connection.doInput = true
        if (body != null) {
            connection.doOutput = true
            connection.outputStream.use { output ->
                BufferedWriter(OutputStreamWriter(output, StandardCharsets.UTF_8)).use { writer ->
                    writer.write(body.toString())
                }
            }
        }

        val status = connection.responseCode
        val payload = parseObject(readStream(if (status >= 400) connection.errorStream else connection.inputStream))
        if (status >= 400) throw ApiException(payload.optString("error", "Request failed"), status)
        persistCookieIfPresent(context, connection, payload)
        return payload
    }

    fun login(context: Context, email: String, password: String): JSONObject =
        sendJson(context, "/api/v1/auth/login", "POST", JSONObject().apply {
            put("email", email.trim())
            put("password", password)
        })

    fun register(context: Context, name: String, email: String, password: String): JSONObject =
        sendJson(context, "/api/v1/auth/register", "POST", JSONObject().apply {
            put("name", name.trim())
            put("email", email.trim())
            put("password", password)
        })

    fun verify(context: Context, email: String, code: String): JSONObject =
        sendJson(context, "/api/v1/auth/verify", "POST", JSONObject().apply {
            put("email", email.trim())
            put("code", code.trim())
        })

    fun resendVerification(context: Context, email: String): JSONObject =
        sendJson(context, "/api/v1/auth/resend", "POST", JSONObject().apply {
            put("email", email.trim())
        })

    fun logout(context: Context) {
        sendJson(context, "/api/v1/auth/logout", "POST", JSONObject())
        SessionStore.clear(context)
    }

    fun getClientState(context: Context): JSONObject = sendJson(context, "/api/v1/client-state", "GET", null)

    fun getDialogMessages(context: Context, publicId: String): JSONObject =
        sendJson(context, "/api/v1/dialogs/by-public-id/${URLEncoder.encode(publicId, "UTF-8")}/messages", "GET", null)

    fun createDirectDialog(context: Context, userId: String): JSONObject =
        sendJson(context, "/api/v1/dialogs/direct", "POST", JSONObject().apply {
            put("targetUserId", userId)
        })

    fun createGroupDialog(context: Context, title: String, memberUserIds: List<String>): JSONObject =
        sendJson(context, "/api/v1/dialogs/group", "POST", JSONObject().apply {
            put("title", title.trim())
            val array = JSONArray()
            memberUserIds.forEach { array.put(it) }
            put("memberUserIds", array)
        })

    fun searchUsers(context: Context, query: String): JSONArray {
        val connection = open(context, "/api/v1/users/search?q=${URLEncoder.encode(query, "UTF-8")}", "GET")
        val status = connection.responseCode
        val payload = parseObject(readStream(if (status >= 400) connection.errorStream else connection.inputStream))
        if (status >= 400) throw ApiException(payload.optString("error", "Search failed"), status)
        return payload.optJSONArray("users") ?: JSONArray()
    }

    fun sendMessage(context: Context, publicId: String, bodyText: String): JSONObject =
        sendJson(context, "/api/v1/dialogs/by-public-id/${URLEncoder.encode(publicId, "UTF-8")}/messages", "POST", JSONObject().apply {
            put("body", bodyText)
        })

    fun sendImages(context: Context, publicId: String, imageUris: List<Uri>, caption: String): List<JSONObject> {
        val results = mutableListOf<JSONObject>()
        imageUris.chunked(5).forEachIndexed { chunkIndex, chunk ->
            val albumId = if (imageUris.size > 1) "android_album_${System.currentTimeMillis()}_$chunkIndex" else null
            chunk.forEachIndexed { index, uri ->
                results += uploadFile(context, publicId, uri, if (index == 0) caption else "", albumId, index, chunk.size)
            }
        }
        return results
    }

    fun uploadFile(
        context: Context,
        publicId: String,
        uri: Uri,
        bodyText: String,
        albumId: String? = null,
        albumIndex: Int = -1,
        albumSize: Int = 0
    ): JSONObject {
        val boundary = "----TheGraphtBoundary${System.currentTimeMillis()}"
        val connection = open(context, "/api/v1/dialogs/by-public-id/${URLEncoder.encode(publicId, "UTF-8")}/messages", "POST")
        connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
        connection.doOutput = true

        val mime = context.contentResolver.getType(uri).takeUnless { it.isNullOrBlank() } ?: "image/jpeg"
        val isAudio = mime.startsWith("audio/", ignoreCase = true)
        val defaultExt = if (isAudio) ".mp3" else ".jpg"
        val fileName = "${if (isAudio) "audio" else "image"}_${System.currentTimeMillis()}${mimeToExtension(mime, defaultExt)}"
        val buffer = ByteArrayOutputStream()
        writeFormField(buffer, boundary, "body", bodyText)
        if (albumId != null) {
            writeFormField(buffer, boundary, "albumId", albumId)
            writeFormField(buffer, boundary, "albumIndex", albumIndex.toString())
            writeFormField(buffer, boundary, "albumSize", albumSize.toString())
        }

        buffer.write("--$boundary\r\n".toByteArray(StandardCharsets.UTF_8))
        buffer.write("Content-Disposition: form-data; name=\"file\"; filename=\"$fileName\"\r\n".toByteArray(StandardCharsets.UTF_8))
        buffer.write("Content-Type: $mime\r\n\r\n".toByteArray(StandardCharsets.UTF_8))
        context.contentResolver.openInputStream(uri)?.use { stream ->
            val chunk = ByteArray(8192)
            while (true) {
                val read = stream.read(chunk)
                if (read == -1) break
                buffer.write(chunk, 0, read)
            }
        } ?: throw IOException("Не удалось прочитать файл.")
        buffer.write("\r\n--$boundary--\r\n".toByteArray(StandardCharsets.UTF_8))

        connection.outputStream.use { it.write(buffer.toByteArray()) }
        val status = connection.responseCode
        val payload = parseObject(readStream(if (status >= 400) connection.errorStream else connection.inputStream))
        if (status >= 400) throw ApiException(payload.optString("error", "Upload failed"), status)
        return payload
    }

    private fun writeFormField(output: ByteArrayOutputStream, boundary: String, name: String, value: String) {
        output.write("--$boundary\r\n".toByteArray(StandardCharsets.UTF_8))
        output.write("Content-Disposition: form-data; name=\"$name\"\r\n\r\n".toByteArray(StandardCharsets.UTF_8))
        output.write(value.toByteArray(StandardCharsets.UTF_8))
        output.write("\r\n".toByteArray(StandardCharsets.UTF_8))
    }

    private fun mimeToExtension(mime: String, defaultExt: String): String = when (mime.toLowerCase(Locale.US)) {
        "image/png" -> ".png"
        "image/webp" -> ".webp"
        "image/gif" -> ".gif"
        "audio/mpeg", "audio/mp3" -> ".mp3"
        "audio/ogg" -> ".ogg"
        "audio/wav" -> ".wav"
        else -> defaultExt
    }
}
