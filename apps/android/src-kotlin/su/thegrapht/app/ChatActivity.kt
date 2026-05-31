package su.thegrapht.app

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.*
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.concurrent.Executors

class ChatActivity : Activity(), RealtimeClient.Listener {
    companion object {
        private const val REQUEST_PICK_IMAGES = 7001
        private const val REQUEST_PICK_AUDIO = 7002
    }

    private val executor = Executors.newSingleThreadExecutor()
    private val handler = Handler(Looper.getMainLooper())
    private var typingStopRunnable: Runnable? = null

    private lateinit var publicId: String
    private var title: String = ""
    private var subtitle: String = ""
    private lateinit var currentUserId: String
    private var currentDialogId: String = ""
    private var currentDialogType: String = ""
    private var currentPeerUserId: String = ""
    private var currentPeerLastSeenAt: String = ""
    private var peerReadAt: String = ""
    private val renderedMessageViews = linkedMapOf<String, View>()
    private var currentMessages = emptyList<MessageItem>()
    private var currentSearchMatches = emptyList<MessageItem>()
    private var currentSearchIndex = 0

    // Audio Playback Engine
    private var activeMediaPlayer: android.media.MediaPlayer? = null
    private var activePlayButton: TextView? = null
    private var activeProgressBar: ProgressBar? = null
    private var activeDurationLabel: TextView? = null
    private val progressHandler = Handler(Looper.getMainLooper())
    private val progressRunnable = object : Runnable {
        override fun run() {
            activeMediaPlayer?.let { player ->
                if (player.isPlaying) {
                    val current = player.currentPosition
                    val duration = player.duration
                    activeProgressBar?.progress = current
                    activeDurationLabel?.text = formatDuration(current) + " / " + formatDuration(duration)
                    progressHandler.postDelayed(this, 100L)
                }
            }
        }
    }

    private fun formatDuration(ms: Int): String {
        val totalSec = ms / 1000
        val min = totalSec / 60
        val sec = totalSec % 60
        return String.format(Locale.getDefault(), "%02d:%02d", min, sec)
    }

    private lateinit var chatTitle: TextView
    private lateinit var chatSubtitle: TextView
    private lateinit var chatScroll: ScrollView
    private lateinit var chatMessages: LinearLayout
    private lateinit var chatComposerInput: EditText
    private lateinit var chatSendButton: Button
    private lateinit var chatSearchButton: TextView
    private lateinit var chatCallButton: TextView
    private lateinit var chatAttachButton: TextView
    private lateinit var chatSearchPanel: LinearLayout
    private lateinit var chatSearchInput: EditText
    private lateinit var chatSearchCount: TextView
    private lateinit var chatSearchClose: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)

        publicId = intent.getStringExtra("publicId").orEmpty()
        title = intent.getStringExtra("title").orEmpty()
        subtitle = intent.getStringExtra("subtitle").orEmpty()
        currentUserId = SessionStore.getUserId(this)

        chatTitle = findViewById(R.id.chatTitle) as TextView
        chatSubtitle = findViewById(R.id.chatSubtitle) as TextView
        chatScroll = findViewById(R.id.chatScroll) as ScrollView
        chatMessages = findViewById(R.id.chatMessages) as LinearLayout
        chatComposerInput = findViewById(R.id.chatComposerInput) as EditText
        chatSendButton = findViewById(R.id.chatSendButton) as Button
        chatSearchButton = findViewById(R.id.chatSearchButton) as TextView
        chatCallButton = findViewById(R.id.chatCallButton) as TextView
        chatAttachButton = findViewById(R.id.chatAttachButton) as TextView
        chatSearchPanel = findViewById(R.id.chatSearchPanel) as LinearLayout
        chatSearchInput = findViewById(R.id.chatSearchInput) as EditText
        chatSearchCount = findViewById(R.id.chatSearchCount) as TextView
        chatSearchClose = findViewById(R.id.chatSearchClose) as TextView

        chatTitle.text = title.ifBlank { "TheGrapht" }
        chatSubtitle.text = subtitle

        (findViewById(R.id.chatBack) as TextView).setOnClickListener {
            finish()
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.slide_out_right)
        }
        chatSendButton.setOnClickListener { sendMessage() }
        chatAttachButton.setOnClickListener { showAttachmentMenu() }
        chatSearchButton.setOnClickListener { toggleSearch(true) }
        chatSearchClose.setOnClickListener { toggleSearch(false) }
        chatCallButton.setOnClickListener { toast("Нативные звонки добавлю следующим большим слоем.") }

        chatComposerInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                if (currentDialogId.isBlank()) return
                RealtimeClient.sendTyping(currentDialogId, s?.isNotEmpty() == true)
                typingStopRunnable?.let { handler.removeCallbacks(it) }
                typingStopRunnable = Runnable {
                    RealtimeClient.sendTyping(currentDialogId, false)
                }.also { handler.postDelayed(it, 1600L) }
            }
            override fun afterTextChanged(s: Editable?) = Unit
        })

        chatSearchInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                performSearch(s?.toString().orEmpty())
            }
            override fun afterTextChanged(s: Editable?) = Unit
        })
        chatSearchCount.setOnClickListener { jumpToNextSearchResult() }
    }

    override fun onResume() {
        super.onResume()
        RealtimeClient.addListener(this)
        RealtimeClient.connect(this, currentUserId)
        RealtimeClient.setForegroundState(true, publicId)
        loadMessages(true)
    }

    override fun onPause() {
        stopActiveAudio()
        RealtimeClient.removeListener(this)
        RealtimeClient.setForegroundState(false, null)
        RealtimeClient.sendTyping(currentDialogId, false)
        typingStopRunnable?.let { handler.removeCallbacks(it) }
        super.onPause()
    }

    private fun sendMessage() {
        val text = chatComposerInput.text.toString().trim()
        if (text.isEmpty()) return

        chatSendButton.isEnabled = false
        executor.execute {
            try {
                ApiClient.sendMessage(this, publicId, text)
                runOnUiThread {
                    chatComposerInput.setText("")
                    chatSendButton.isEnabled = true
                }
            } catch (error: Exception) {
                runOnUiThread {
                    chatSendButton.isEnabled = true
                    chatSubtitle.text = error.message ?: "Не удалось отправить."
                }
            }
        }
    }

    private fun pickImages() {
        startActivityForResult(
            Intent.createChooser(Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }, "Выберите фото"),
            REQUEST_PICK_IMAGES
        )
    }

    private fun showAttachmentMenu() {
        val options = arrayOf("📸 Изображения / Фото", "🎵 Аудио / Музыка")
        android.app.AlertDialog.Builder(this)
            .setTitle("Прикрепить файл")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> pickImages()
                    1 -> pickAudio()
                }
            }
            .show()
    }

    private fun pickAudio() {
        startActivityForResult(
            Intent.createChooser(Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "audio/*"
            }, "Выберите аудиофайл"),
            REQUEST_PICK_AUDIO
        )
    }

    private fun uploadAudioFile(uri: Uri) {
        val caption = chatComposerInput.text.toString().trim()
        chatSubtitle.text = "Загружаем аудио…"
        chatAttachButton.isEnabled = false
        chatSendButton.isEnabled = false

        executor.execute {
            try {
                ApiClient.uploadFile(this, publicId, uri, caption)
                runOnUiThread {
                    chatComposerInput.setText("")
                    chatAttachButton.isEnabled = true
                    chatSendButton.isEnabled = true
                    syncSubtitle()
                    loadMessages(true)
                }
            } catch (error: Exception) {
                runOnUiThread {
                    chatAttachButton.isEnabled = true
                    chatSendButton.isEnabled = true
                    chatSubtitle.text = error.message ?: "Не удалось отправить аудио."
                }
            }
        }
    }

    private fun loadMessages(scrollToBottom: Boolean) {
        executor.execute {
            try {
                val payload = ApiClient.getDialogMessages(this, publicId)
                val dialog = payload.optJSONObject("dialog")
                val messages = payload.optJSONArray("messages") ?: JSONArray()
                runOnUiThread {
                    dialog?.let {
                        currentDialogId = it.optString("id")
                        currentDialogType = it.optString("type")
                        currentPeerUserId = it.optString("peerUserId")
                        currentPeerLastSeenAt = it.optString("peerLastSeenAt")
                        peerReadAt = it.optString("peerReadAt")
                        title = it.optString("title")
                        subtitle = it.optString("subtitle")
                        chatTitle.text = title
                        RealtimeClient.updatePresence(currentDialogId)
                    }
                    renderMessages(messages)
                    syncSubtitle()
                    if (scrollToBottom) scrollToBottom()
                }
            } catch (error: Exception) {
                runOnUiThread { chatSubtitle.text = error.message ?: "Не удалось загрузить сообщения." }
            }
        }
    }

    private fun renderMessages(messages: JSONArray) {
        renderedMessageViews.clear()
        chatMessages.removeAllViews()
        currentMessages = (0 until messages.length()).map { MessageItem.fromJson(messages.optJSONObject(it)) }

        if (currentMessages.isEmpty()) {
            val empty = TextView(this).apply {
                text = "Начните переписку первыми."
                setTextColor(resources.getColor(R.color.tg_text_muted))
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
                gravity = Gravity.CENTER_HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                    topMargin = dp(48)
                }
            }
            chatMessages.addView(empty)
            performSearch(chatSearchInput.text.toString())
            return
        }

        var index = 0
        while (index < currentMessages.size) {
            val message = currentMessages[index]
            if (message.normalizedAlbumId.isNotBlank()) {
                val albumMessages = mutableListOf(message)
                var cursor = index + 1
                while (
                    cursor < currentMessages.size
                    && currentMessages[cursor].normalizedAlbumId == message.normalizedAlbumId
                ) {
                    albumMessages += currentMessages[cursor]
                    cursor += 1
                }
                if (albumMessages.all { it.isImageMessage }) {
                    val view = createAlbumBubble(albumMessages)
                    chatMessages.addView(view)
                    renderedMessageViews[albumMessages.first().id] = view
                    index = cursor
                } else {
                    val view = createMessageBubble(message)
                    chatMessages.addView(view)
                    renderedMessageViews[message.id] = view
                    index += 1
                }
            } else {
                val view = createMessageBubble(message)
                chatMessages.addView(view)
                renderedMessageViews[message.id] = view
                index += 1
            }
        }

        performSearch(chatSearchInput.text.toString())
    }

    private fun createMessageBubble(message: MessageItem): View {
        val outgoing = message.senderId == currentUserId
        val wrapper = buildBubbleWrapper(outgoing)
        val bubble = buildBubbleContainer(outgoing)

        // Prepend bold colored username in group chats for incoming messages
        if (!outgoing && currentDialogType == "group") {
            val senderLabel = TextView(this).apply {
                text = message.senderName
                setTextColor(UiUtils.getDistinctColor(message.senderName))
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
                setTypeface(null, android.graphics.Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                    bottomMargin = dp(4)
                }
            }
            bubble.addView(senderLabel)
        }

        val isAudio = message.normalizedType == "audio" || message.normalizedMime.startsWith("audio/")

        if (message.isImageMessage) {
            val image = ImageView(this).apply {
                adjustViewBounds = true
                scaleType = ImageView.ScaleType.CENTER_CROP
                setBackgroundResource(R.drawable.bg_album_tile)
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(220))
                setOnClickListener { openImageViewer(message) }
            }
            ImageLoader.loadInto(this, message.mediaUrl, image)
            bubble.addView(image)
            if (message.body.isNotBlank()) bubble.addView(buildMessageBody(message.body))
        } else if (isAudio) {
            bubble.addView(buildAudioPlayerView(message))
            if (message.body.isNotBlank()) bubble.addView(buildMessageBody(message.body))
        } else {
            bubble.addView(buildMessageBody(message.body))
        }

        bubble.addView(buildMetaLabel(message.createdAt, outgoing))
        wrapper.addView(bubble)
        return wrapper
    }

    private fun buildAudioPlayerView(message: MessageItem): View = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        setGravity(Gravity.CENTER_VERTICAL)
        setPadding(dp(4), dp(4), dp(4), dp(4))
        layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            bottomMargin = dp(6)
        }

        val playButton = TextView(context).apply {
            text = "▶"
            textSize = 18f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setBackgroundResource(R.drawable.bg_icon_circle)
            layoutParams = LinearLayout.LayoutParams(dp(40), dp(40)).apply {
                rightMargin = dp(10)
            }
        }

        val timelineLayout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1f
            )

            val progressBar = ProgressBar(context, null, android.R.attr.progressBarStyleHorizontal).apply {
                progress = 0
                max = 100
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    dp(6)
                ).apply {
                    bottomMargin = dp(4)
                }
            }

            val durationLabel = TextView(context).apply {
                text = "00:00"
                textSize = 12f
                setTextColor(0xFFECE8FF.toInt())
            }

            addView(progressBar)
            addView(durationLabel)

            playButton.setOnClickListener {
                playAudio(message.mediaUrl, playButton, progressBar, durationLabel)
            }
        }

        addView(playButton)
        addView(timelineLayout)
    }

    private fun playAudio(relativeOrAbsoluteUrl: String, playButton: TextView, progressBar: ProgressBar, durationLabel: TextView) {
        val targetUrl = if (relativeOrAbsoluteUrl.startsWith("http")) relativeOrAbsoluteUrl else BuildConfig.BASE_URL + relativeOrAbsoluteUrl

        if (activeMediaPlayer != null && activePlayButton == playButton) {
            activeMediaPlayer?.let { player ->
                if (player.isPlaying) {
                    player.pause()
                    playButton.text = "▶"
                    progressHandler.removeCallbacks(progressRunnable)
                } else {
                    player.start()
                    playButton.text = "⏸"
                    progressHandler.post(progressRunnable)
                }
            }
            return
        }

        stopActiveAudio()

        try {
            val player = android.media.MediaPlayer().apply {
                setDataSource(targetUrl)
                setOnPreparedListener { mp ->
                    progressBar.max = mp.duration
                    durationLabel.text = "00:00 / " + formatDuration(mp.duration)
                    mp.start()
                    playButton.text = "⏸"
                    progressHandler.post(progressRunnable)
                }
                setOnCompletionListener {
                    progressBar.progress = 0
                    durationLabel.text = formatDuration(it.duration)
                    playButton.text = "▶"
                    progressHandler.removeCallbacks(progressRunnable)
                    stopActiveAudio()
                }
                prepareAsync()
            }
            activeMediaPlayer = player
            activePlayButton = playButton
            activeProgressBar = progressBar
            activeDurationLabel = durationLabel
            playButton.text = "⏳"
        } catch (e: Exception) {
            toast("Не удалось воспроизвести аудиофайл.")
            stopActiveAudio()
        }
    }

    private fun stopActiveAudio() {
        progressHandler.removeCallbacks(progressRunnable)
        try {
            activeMediaPlayer?.let { player ->
                if (player.isPlaying) {
                    player.stop()
                }
                player.release()
            }
        } catch (_: Exception) {
        }
        activePlayButton?.text = "▶"
        activeProgressBar?.progress = 0
        activeMediaPlayer = null
        activePlayButton = null
        activeProgressBar = null
        activeDurationLabel = null
    }

    private fun createAlbumBubble(albumMessages: List<MessageItem>): View {
        val lastMessage = albumMessages.last()
        val outgoing = lastMessage.senderId == currentUserId
        val wrapper = buildBubbleWrapper(outgoing)
        val bubble = buildBubbleContainer(outgoing).apply { setPadding(dp(8), dp(8), dp(8), dp(10)) }

        // Prepend bold colored username in group chats for incoming messages
        if (!outgoing && currentDialogType == "group") {
            val senderLabel = TextView(this).apply {
                text = lastMessage.senderName
                setTextColor(UiUtils.getDistinctColor(lastMessage.senderName))
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
                setTypeface(null, android.graphics.Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                    bottomMargin = dp(4)
                    leftMargin = dp(4)
                    rightMargin = dp(4)
                }
            }
            bubble.addView(senderLabel)
        }

        var index = 0
        while (index < albumMessages.size) {
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                    if (index > 0) topMargin = dp(6)
                }
            }
            repeat(2) { column ->
                if (index >= albumMessages.size) return@repeat
                val tileMessage = albumMessages[index]
                val tile = FrameLayout(this).apply {
                    layoutParams = LinearLayout.LayoutParams(0, dp(124), 1f).apply {
                        if (column > 0) leftMargin = dp(6)
                    }
                }
                val image = ImageView(this).apply {
                    layoutParams = FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
                    scaleType = ImageView.ScaleType.CENTER_CROP
                    setBackgroundResource(R.drawable.bg_album_tile)
                    setOnClickListener { openImageViewer(tileMessage) }
                }
                ImageLoader.loadInto(this, tileMessage.mediaUrl, image)
                tile.addView(image)
                row.addView(tile)
                index += 1
            }
            bubble.addView(row)
        }

        albumMessages.firstOrNull()?.body?.takeIf { it.isNotBlank() }?.let { bubble.addView(buildMessageBody(it)) }
        bubble.addView(buildMetaLabel(lastMessage.createdAt, outgoing))
        wrapper.addView(bubble)
        return wrapper
    }

    private fun buildBubbleWrapper(outgoing: Boolean) = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setGravity(if (outgoing) Gravity.END else Gravity.START)
        layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
            topMargin = dp(8)
        }
    }

    private fun buildBubbleContainer(outgoing: Boolean) = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setBackgroundResource(if (outgoing) R.drawable.bg_bubble_outgoing_tg else R.drawable.bg_bubble_incoming_tg)
        setPadding(dp(12), dp(8), dp(12), dp(8))
        layoutParams = LinearLayout.LayoutParams(minOf(dp(300), resources.displayMetrics.widthPixels - dp(62)), LinearLayout.LayoutParams.WRAP_CONTENT).apply {
            gravity = if (outgoing) Gravity.END else Gravity.START
        }
    }

    private fun buildMessageBody(text: String) = TextView(this).apply {
        this.text = if (text.isBlank()) "" else text
        setTextColor(0xFF1F1F1F.toInt())
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
    }

    private fun isMessageRead(createdAt: String): Boolean {
        if (peerReadAt.isBlank()) return false
        return createdAt.compareTo(peerReadAt) <= 0
    }

    private fun buildMetaLabel(createdAt: String, outgoing: Boolean) = TextView(this).apply {
        val time = formatTime(createdAt)
        text = if (outgoing) {
            val ticks = if (isMessageRead(createdAt)) "  ✓✓" else "  ✓"
            "$time$ticks"
        } else {
            time
        }
        setTextColor(if (outgoing) 0xFF5D9B4A.toInt() else 0xFF8A9685.toInt())
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f)
        gravity = Gravity.END
        layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
            topMargin = dp(4)
        }
    }

    private fun toggleSearch(open: Boolean) {
        chatSearchPanel.visibility = if (open) View.VISIBLE else View.GONE
        if (open) {
            chatSearchInput.requestFocus()
        } else {
            chatSearchInput.setText("")
            clearHighlights()
        }
    }

    private fun performSearch(queryRaw: String) {
        val query = queryRaw.trim().toLowerCase(Locale.getDefault())
        if (query.isEmpty()) {
            currentSearchMatches = emptyList()
            chatSearchCount.text = ""
            clearHighlights()
            return
        }

        currentSearchMatches = currentMessages.filter { it.body.toLowerCase(Locale.getDefault()).contains(query) }
        currentSearchIndex = 0
        chatSearchCount.text = if (currentSearchMatches.isEmpty()) "нет" else "${currentSearchMatches.size}"
        highlightCurrentSearchResult()
    }

    private fun jumpToNextSearchResult() {
        if (currentSearchMatches.isEmpty()) return
        currentSearchIndex = (currentSearchIndex + 1) % currentSearchMatches.size
        highlightCurrentSearchResult()
    }

    private fun clearHighlights() {
        renderedMessageViews.values.forEach { it.alpha = 1f }
    }

    private fun highlightCurrentSearchResult() {
        clearHighlights()
        if (currentSearchMatches.isEmpty()) return
        val message = currentSearchMatches[currentSearchIndex]
        val target = renderedMessageViews[message.id] ?: renderedMessageViews[message.normalizedAlbumId]
        target?.let { view ->
            view.alpha = 0.55f
            view.animate().alpha(1f).setDuration(300).start()
            chatScroll.post {
                chatScroll.smoothScrollTo(0, maxOf(0, view.top - dp(80)))
            }
        }
    }

    private fun syncSubtitle() {
        val typing = RealtimeClient.isDialogTyping(currentDialogId)
        chatSubtitle.text = when {
            typing -> "печатает..."
            currentPeerUserId.isNotBlank() && RealtimeClient.isUserOnline(currentPeerUserId) -> "в сети"
            currentPeerLastSeenAt.isNotBlank() -> formatLastSeen(currentPeerLastSeenAt)
            else -> subtitle
        }
    }

    private fun formatLastSeen(iso: String): String = try {
        val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US).parse(iso)
        if (parsed == null) "был(а) недавно" else "был(а) в сети в ${SimpleDateFormat("HH:mm", Locale.getDefault()).format(parsed)}"
    } catch (_: Exception) {
        "был(а) недавно"
    }

    private fun openImageViewer(message: MessageItem) {
        startActivity(Intent(this, MediaViewerActivity::class.java).apply {
            putExtra("imageUrl", message.mediaUrl)
            putExtra("senderName", message.senderName)
            putExtra("createdAt", formatViewerDate(message.createdAt))
        })
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }

    private fun scrollToBottom() {
        chatScroll.post { chatScroll.fullScroll(View.FOCUS_DOWN) }
    }

    private fun formatTime(iso: String): String = try {
        val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US).parse(iso)
        if (parsed == null) "" else SimpleDateFormat("HH:mm", Locale.getDefault()).format(parsed)
    } catch (_: Exception) {
        ""
    }

    private fun formatViewerDate(iso: String): String = try {
        val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US).parse(iso)
        if (parsed == null) "" else SimpleDateFormat("dd.MM, HH:mm", Locale.getDefault()).format(parsed)
    } catch (_: Exception) {
        ""
    }

    private fun dp(value: Int) = UiUtils.dp(this, value)

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode != RESULT_OK || data == null) return

        if (requestCode == REQUEST_PICK_AUDIO) {
            val audioUri = data.data ?: return
            uploadAudioFile(audioUri)
            return
        }

        if (requestCode == REQUEST_PICK_IMAGES) {
            val imageUris = mutableListOf<Uri>()
            data.data?.let { imageUris += it }
            data.clipData?.let { clip ->
                repeat(minOf(clip.itemCount, 500)) { idx ->
                    clip.getItemAt(idx)?.uri?.let { imageUris += it }
                }
            }
            if (imageUris.isEmpty()) return

            val caption = chatComposerInput.text.toString().trim()
            chatSubtitle.text = "Загружаем фото…"
            chatAttachButton.isEnabled = false
            chatSendButton.isEnabled = false

            executor.execute {
                try {
                    ApiClient.sendImages(this, publicId, imageUris, caption)
                    runOnUiThread {
                        chatComposerInput.setText("")
                        chatAttachButton.isEnabled = true
                        chatSendButton.isEnabled = true
                        syncSubtitle()
                    }
                } catch (error: Exception) {
                    runOnUiThread {
                        chatAttachButton.isEnabled = true
                        chatSendButton.isEnabled = true
                        chatSubtitle.text = error.message ?: "Не удалось отправить фото."
                    }
                }
            }
        }
    }

    override fun onRealtimeEvent(type: String, payload: JSONObject) {
        when (type) {
            "message_created" -> {
                val dialog = payload.optJSONObject("dialog")
                if (dialog?.optString("publicId") == publicId) {
                    loadMessages(true)
                }
            }
            "presence_snapshot", "user_presence", "dialog_typing" -> syncSubtitle()
            "dialog_read" -> Unit
        }
    }

    private fun toast(message: String) = Toast.makeText(this, message, Toast.LENGTH_SHORT).show()

    override fun onDestroy() {
        stopActiveAudio()
        RealtimeClient.updatePresence(null)
        handler.removeCallbacksAndMessages(null)
        executor.shutdownNow()
        super.onDestroy()
    }
}
