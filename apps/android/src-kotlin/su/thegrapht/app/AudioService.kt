package su.thegrapht.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.MediaPlayer
import android.os.Binder
import android.os.Build
import android.os.IBinder

class AudioService : Service() {
    inner class AudioBinder : Binder() {
        fun getService(): AudioService = this@AudioService
    }

    private val binder = AudioBinder()
    var mediaPlayer: MediaPlayer? = null
        private set
    private var currentTitle: String = ""

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action != null) {
            when (action) {
                "ACTION_PLAY_PAUSE" -> {
                    mediaPlayer?.let {
                        if (it.isPlaying) {
                            pauseAudio()
                        } else {
                            resumeAudio()
                        }
                    }
                }
                "ACTION_STOP" -> {
                    stopAudio()
                    stopSelf()
                }
            }
        }
        return START_NOT_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "audio_playback_channel",
                "Аудио плеер",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Воспроизведение музыкальных файлов и голосовых сообщений"
                setShowBadge(false)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    fun playAudio(url: String, title: String, onPrepared: (MediaPlayer) -> Unit, onCompletion: () -> Unit) {
        stopAudio()
        currentTitle = title
        mediaPlayer = MediaPlayer().apply {
            setDataSource(url)
            setOnPreparedListener { mp ->
                mp.start()
                showNotification(currentTitle, true)
                onPrepared(mp)
            }
            setOnCompletionListener {
                onCompletion()
                stopAudio()
            }
            prepareAsync()
        }
    }

    fun pauseAudio() {
        mediaPlayer?.let {
            if (it.isPlaying) {
                it.pause()
                showNotification(currentTitle, false)
            }
        }
    }

    fun resumeAudio() {
        mediaPlayer?.let {
            if (!it.isPlaying) {
                it.start()
                showNotification(currentTitle, true)
            }
        }
    }

    fun stopAudio() {
        mediaPlayer?.let {
            try {
                if (it.isPlaying) it.stop()
                it.release()
            } catch (_: Exception) {}
        }
        mediaPlayer = null
        stopForeground(true)
    }

    private fun showNotification(title: String, isPlaying: Boolean) {
        val playPauseIntent = Intent(this, AudioService::class.java).apply {
            action = "ACTION_PLAY_PAUSE"
        }
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val playPausePendingIntent = PendingIntent.getService(this, 1, playPauseIntent, flags)

        val stopIntent = Intent(this, AudioService::class.java).apply {
            action = "ACTION_STOP"
        }
        val stopPendingIntent = PendingIntent.getService(this, 2, stopIntent, flags)

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, "audio_playback_channel")
        } else {
            Notification.Builder(this)
        }

        val playPauseIcon = if (isPlaying) android.R.drawable.ic_media_pause else android.R.drawable.ic_media_play
        val playPauseLabel = if (isPlaying) "Пауза" else "Старт"

        builder.setContentTitle("Воспроизведение")
            .setContentText(title)
            .setSmallIcon(android.R.drawable.sym_def_app_icon)
            .setOngoing(isPlaying)
            .addAction(Notification.Action.Builder(playPauseIcon, playPauseLabel, playPausePendingIntent).build())
            .addAction(Notification.Action.Builder(android.R.drawable.ic_menu_close_clear_cancel, "Закрыть", stopPendingIntent).build())

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            builder.setStyle(Notification.MediaStyle().setShowActionsInCompactView(0, 1))
        }

        startForeground(1002, builder.build())
    }

    override fun onDestroy() {
        stopAudio()
        super.onDestroy()
    }
}
