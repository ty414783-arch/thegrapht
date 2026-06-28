package su.thegrapht.app

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.drawable.ColorDrawable
import android.os.Handler
import android.os.Looper
import android.util.LruCache
import android.widget.ImageView
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.Executors

object ImageLoader {
    private val executor = Executors.newFixedThreadPool(4)

    private val memoryCache: LruCache<String, Bitmap> by lazy {
        val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt()
        val cacheSize = maxMemory / 8
        object : LruCache<String, Bitmap>(cacheSize) {
            override fun sizeOf(key: String, bitmap: Bitmap): Int {
                return bitmap.byteCount / 1024
            }
        }
    }

    private fun md5(s: String): String {
        return try {
            val digest = MessageDigest.getInstance("MD5")
            digest.update(s.toByteArray())
            val messageDigest = digest.digest()
            val hexString = StringBuilder()
            for (aMessageDigest in messageDigest) {
                var h = Integer.toHexString(0xFF and aMessageDigest.toInt())
                while (h.length < 2) h = "0$h"
                hexString.append(h)
            }
            hexString.toString()
        } catch (_: Exception) {
            s.hashCode().toString()
        }
    }

    fun loadInto(context: Context, relativeOrAbsoluteUrl: String?, imageView: ImageView) {
        if (relativeOrAbsoluteUrl.isNullOrBlank()) {
            imageView.setImageDrawable(ColorDrawable(0xFF1E2531.toInt()))
            return
        }

        val targetUrl = if (relativeOrAbsoluteUrl.startsWith("http")) relativeOrAbsoluteUrl else BuildConfig.BASE_URL + relativeOrAbsoluteUrl
        imageView.tag = targetUrl

        // Check memory cache first
        val cachedBitmap = memoryCache.get(targetUrl)
        if (cachedBitmap != null) {
            imageView.setImageBitmap(cachedBitmap)
            return
        }

        imageView.setImageDrawable(ColorDrawable(0xFF1E2531.toInt()))

        executor.execute {
            val cacheDir = File(context.cacheDir, "image_cache")
            if (!cacheDir.exists()) {
                cacheDir.mkdirs()
            }
            val cacheFile = File(cacheDir, md5(targetUrl))
            var bitmap: Bitmap? = null

            // Check disk cache
            if (cacheFile.exists()) {
                try {
                    bitmap = BitmapFactory.decodeFile(cacheFile.absolutePath)
                } catch (_: Exception) {}
            }

            // If not found in disk cache, download it
            if (bitmap == null) {
                var connection: HttpURLConnection? = null
                try {
                    connection = URL(targetUrl).openConnection() as HttpURLConnection
                    connection.connectTimeout = 15000
                    connection.readTimeout = 20000
                    connection.setRequestProperty("User-Agent", "TheGrapht-Android/1.0")
                    SessionStore.getCookie(context).takeIf { it.isNotBlank() }?.let {
                        connection.setRequestProperty("Cookie", it)
                    }
                    connection.connect()

                    if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                        val tempFile = File(cacheDir, md5(targetUrl) + ".tmp")
                        connection.inputStream.use { input ->
                            FileOutputStream(tempFile).use { output ->
                                val buffer = ByteArray(8192)
                                while (true) {
                                    val read = input.read(buffer)
                                    if (read == -1) break
                                    output.write(buffer, 0, read)
                                }
                            }
                        }
                        tempFile.renameTo(cacheFile)
                        bitmap = BitmapFactory.decodeFile(cacheFile.absolutePath)
                    }
                } catch (_: Exception) {
                } finally {
                    connection?.disconnect()
                }
            }

            if (bitmap != null) {
                memoryCache.put(targetUrl, bitmap)
                Handler(Looper.getMainLooper()).post {
                    if (imageView.tag == targetUrl) {
                        imageView.setImageBitmap(bitmap)
                    }
                }
            } else {
                Handler(Looper.getMainLooper()).post {
                    if (imageView.tag == targetUrl) {
                        imageView.setImageDrawable(ColorDrawable(0xFF242B37.toInt()))
                    }
                }
            }
        }
    }
}
