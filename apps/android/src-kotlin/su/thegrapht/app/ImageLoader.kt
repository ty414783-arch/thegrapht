package su.thegrapht.app

import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.drawable.ColorDrawable
import android.os.Handler
import android.os.Looper
import android.widget.ImageView
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

object ImageLoader {
    private val executor = Executors.newFixedThreadPool(4)

    fun loadInto(context: Context, relativeOrAbsoluteUrl: String?, imageView: ImageView) {
        if (relativeOrAbsoluteUrl.isNullOrBlank()) {
            imageView.setImageDrawable(ColorDrawable(0xFF1E2531.toInt()))
            return
        }

        val targetUrl = if (relativeOrAbsoluteUrl.startsWith("http")) relativeOrAbsoluteUrl else BuildConfig.BASE_URL + relativeOrAbsoluteUrl
        imageView.tag = targetUrl
        imageView.setImageDrawable(ColorDrawable(0xFF1E2531.toInt()))

        executor.execute {
            var connection: HttpURLConnection? = null
            val bitmap = try {
                connection = URL(targetUrl).openConnection() as HttpURLConnection
                connection!!.connectTimeout = 15000
                connection!!.readTimeout = 20000
                connection!!.setRequestProperty("User-Agent", "TheGrapht-Android/1.0")
                SessionStore.getCookie(context).takeIf { it.isNotBlank() }?.let {
                    connection!!.setRequestProperty("Cookie", it)
                }
                connection!!.connect()
                connection!!.inputStream.use { BitmapFactory.decodeStream(it) }
            } catch (_: Exception) {
                null
            } finally {
                connection?.disconnect()
            }

            Handler(Looper.getMainLooper()).post {
                if (imageView.tag != targetUrl) return@post
                if (bitmap != null) {
                    imageView.setImageBitmap(bitmap)
                } else {
                    imageView.setImageDrawable(ColorDrawable(0xFF242B37.toInt()))
                }
            }
        }
    }
}
