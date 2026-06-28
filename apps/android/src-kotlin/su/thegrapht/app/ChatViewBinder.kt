package su.thegrapht.app

import android.app.Activity
import android.app.AlertDialog
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Color
import android.graphics.PorterDuff
import android.net.Uri
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.text.Editable
import android.text.TextUtils
import android.text.TextWatcher
import android.util.TypedValue
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.GridView
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.SeekBar
import android.widget.TextView
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.concurrent.Executors

class ChatViewBinder(
    private val activity: Activity,
    private val root: View,
    private val publicId: String,
    private val chatTitleText: String,
    private val chatSubtitleText: String,
    private val initialUnreadCount: Int = 0,
    private val isTablet: Boolean = false
) : RealtimeClient.Listener {

    private val executor = Executors.newSingleThreadExecutor()
    private val handler = Handler(Looper.getMainLooper())

    private var currentDialogId: String = ""
    private var currentDialogType: String = ""
    private var currentPeerUserId: String = ""
    private var currentPeerLastSeenAt: String = ""
    private var peerReadAt: String = ""
    private var groupMembersArray: JSONArray? = null

    private var currentUserId: String = SessionStore.getUserId(activity)
    private var isFirstLoad = true
    private var currentMessages = listOf<MessageItem>()
    private val renderedMessageViews = LinkedHashMap<String, View>()

    // Background playback Service bindings
    private var audioService: AudioService? = null
    private var isServiceBound = false

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as? AudioService.AudioBinder
            audioService = binder?.getService()
            isServiceBound = true
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            audioService = null
            isServiceBound = false
        }
    }

    private val progressHandler = Handler(Looper.getMainLooper())
    private var activeSeekBar: SeekBar? = null
    private var activeDurationLabel: TextView? = null
    private var activePlayButton: ImageView? = null

    private val progressRunnable = object : Runnable {
        override fun run() {
            audioService?.mediaPlayer?.let { player ->
                if (player.isPlaying) {
                    val current = player.currentPosition
                    val duration = player.duration
                    activeSeekBar?.progress = current
                    activeDurationLabel?.text = "${formatDuration(current)} / ${formatDuration(duration)}"
                    progressHandler.postDelayed(this, 100L)
                }
            }
        }
    }

    // Dynamic views
    private val chatTitle = root.findViewById(R.id.chatTitle) as TextView
    private val chatSubtitle = root.findViewById(R.id.chatSubtitle) as TextView
    private val chatScroll = root.findViewById(R.id.chatScroll) as ScrollView
    private val chatMessages = root.findViewById(R.id.chatMessages) as LinearLayout
    private val chatComposerInput = root.findViewById(R.id.chatComposerInput) as EditText
    private val chatSendButton = root.findViewById<View>(R.id.chatSendButton)
    private val chatSearchButton = root.findViewById<View>(R.id.chatSearchButton)
    private val chatCallButton = root.findViewById<View>(R.id.chatCallButton)
    private val chatAttachButton = root.findViewById<View>(R.id.chatAttachButton)
    private val chatSearchPanel = root.findViewById(R.id.chatSearchPanel) as LinearLayout
    private val chatSearchInput = root.findViewById(R.id.chatSearchInput) as EditText
    private val chatSearchCount = root.findViewById(R.id.chatSearchCount) as TextView
    private val chatSearchClose = root.findViewById<View>(R.id.chatSearchClose)

    // Emoji panel views
    private val chatEmojiPanel = root.findViewById(R.id.chatEmojiPanel) as View
    private val chatEmojiGrid = root.findViewById(R.id.chatEmojiGrid) as GridView
    private val chatEmojiButton = root.findViewById<View>(R.id.chatEmojiButton)
    private val chatEmojiSearch = root.findViewById(R.id.chatEmojiSearch) as EditText
    private val chatEmojiTabs = root.findViewById(R.id.chatEmojiTabs) as LinearLayout

    // Reply support views
    private var pendingReplyMessage: MessageItem? = null
    private val chatReplyPreviewBar = root.findViewById(R.id.chatReplyPreviewBar) as View
    private val chatReplySender = root.findViewById(R.id.chatReplySender) as TextView
    private val chatReplyText = root.findViewById(R.id.chatReplyText) as TextView
    private val chatReplyClose = root.findViewById<View>(R.id.chatReplyClose)

    // Emojis categories map
    private val emojiCategories = listOf(
        EmojiCategory("Smileys", "😀", listOf("😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😜", "🤪", "🤨", "🧐", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖")),
        EmojiCategory("Nature", "🐶", listOf("🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🦍", "🦧", "🐕", "🐺", "🦝", "🐈", "🐴", "🦄", "🦓", "🦌", "🦬", "🐂", "🐃", "🐄", "🐖", "🐗", "🐏", "🐑", "🐐", "🐪", "🐫", "🦙", "🦒", "🐘", "🦣", "🦏", "🦛", "🐁", "🐀", "🐇", "🐿️", "🦫", "🦔", "🐾")),
        EmojiCategory("Food", "🍏", listOf("🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖")),
        EmojiCategory("Activity", "⚽", listOf("👾", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🥏", "🎱", "🪀", "🏓", "🏸", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🏂", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🎫", "🎟️", "🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁")),
        EmojiCategory("Travel", "🚗", listOf("🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🛵", "🏍", "🛺", "🚲", "🛴", "🛹", "🚏", "⚓", "⛵", "🛶", "🚤", "✈️", "🚀", "🛸", "🌌", "🏕️", "🏖️", "🌋", "🗻", "🏡", "🏢", "🏰", "🗼", "🗽", "⛪", "🕌", "⛲", "⛺")),
        EmojiCategory("Objects", "📱", listOf("📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "📷", "📸", "📹", "🎥", "📺", "📻", "🎙️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "Flashlight", "🕯️", "💸", "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🔧", "🔨", "🛡️", "⚙️")),
        EmojiCategory("Symbols", "❤️", listOf("❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "☯️", "☦️", "🛐", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🛑", "⛔", "📛")),
        EmojiCategory("Flags", "🏁", listOf("🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🇷🇺", "🇺🇸", "🇬🇧", "🇨🇳", "🇩e", "🇫🇷", "🇯🇵", "🇮🇹", "🇪🇸", "🇧🇷", "🇰🇷", "🇮🇳", "🇨🇦", "🇦🇺", "🇹🇷", "🇺🇦", "🇧🇾", "🇰🇿", "🇬🇪", "🇦🇲", "🇦🇿", "🇺🇿", "🇪🇺"))
    )

    private var selectedCategoryIndex = 0
    private var searchEmojiQuery = ""

    data class EmojiCategory(
        val name: String,
        val icon: String,
        val emojis: List<String>
    )

    init {
        chatTitle.text = chatTitleText.ifBlank { "TheGrapht" }
        chatSubtitle.text = chatSubtitleText

        val backBtn = root.findViewById<View>(R.id.chatBack)
        if (isTablet) {
            backBtn.visibility = View.GONE
        } else {
            backBtn.setOnClickListener {
                activity.finish()
                activity.overridePendingTransition(android.R.anim.fade_in, android.R.anim.slide_out_right)
            }
        }

        chatSendButton.setOnClickListener { sendMessage() }
        chatAttachButton.setOnClickListener { showAttachmentMenu() }
        chatSearchButton.setOnClickListener { openSearchPanel() }
        chatSearchClose.setOnClickListener { closeSearchPanel() }
        chatReplyClose.setOnClickListener { setReplyMessage(null) }

        // Setup Search filtering
        chatSearchInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
            override fun afterTextChanged(s: Editable?) {
                performSearch(s?.toString().orEmpty())
            }
        })

        // Setup Emoji categories and Panel grid
        setupEmojiPanel()

        // Bind playback Service
        val serviceIntent = Intent(activity, AudioService::class.java)
        activity.bindService(serviceIntent, serviceConnection, Context.BIND_AUTO_CREATE)

        // Initialize Message log loading
        loadMessages(true)
        RealtimeClient.addListener(this)
    }

    fun release() {
        try {
            RealtimeClient.removeListener(this)
            progressHandler.removeCallbacks(progressRunnable)
            if (isServiceBound) {
                activity.unbindService(serviceConnection)
                isServiceBound = false
            }
            executor.shutdownNow()
        } catch (_: Exception) {}
    }

    private fun loadMessages(scrollToBottom: Boolean) {
        val scrollY = chatScroll.scrollY
        executor.execute {
            try {
                val payload = ApiClient.getDialogMessages(activity, publicId)
                val dialog = payload.optJSONObject("dialog")
                val messages = payload.optJSONArray("messages") ?: JSONArray()
                handler.post {
                    dialog?.let {
                        currentDialogId = it.optStringClean("id")
                        currentDialogType = it.optStringClean("type")
                        currentPeerUserId = it.optStringClean("peerUserId")
                        currentPeerLastSeenAt = it.optStringClean("peerLastSeenAt")
                        peerReadAt = it.optStringClean("peerReadAt")
                        groupMembersArray = it.optJSONArray("groupMembers")

                        titleLabelUpdate(it.optStringClean("title"))
                        RealtimeClient.updatePresence(currentDialogId)
                    }
                    renderMessages(messages)
                    syncSubtitle()

                    if (scrollToBottom) {
                        if (isFirstLoad && initialUnreadCount > 0) {
                            val targetIndex = currentMessages.size - initialUnreadCount
                            if (targetIndex in currentMessages.indices) {
                                scrollToMessage(currentMessages[targetIndex].id)
                            } else {
                                scrollToBottom()
                            }
                        } else {
                            scrollToBottom()
                        }
                        isFirstLoad = false
                    } else {
                        chatScroll.post { chatScroll.scrollTo(0, scrollY) }
                    }
                }
            } catch (error: Exception) {
                handler.post { chatSubtitle.text = error.message ?: "Не удалось загрузить сообщения." }
            }
        }
    }

    private fun titleLabelUpdate(t: String) {
        chatTitle.text = t.ifBlank { "TheGrapht" }
    }

    private fun getDayKey(iso: String): String = try {
        val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US).parse(iso)
        if (parsed == null) "" else SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(parsed)
    } catch (_: Exception) {
        ""
    }

    private fun getReadableDateSeparator(iso: String): String {
        return try {
            val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US).parse(iso) ?: return ""
            val now = java.util.Calendar.getInstance()
            val msgCal = java.util.Calendar.getInstance().apply { time = parsed }

            if (now.get(java.util.Calendar.YEAR) == msgCal.get(java.util.Calendar.YEAR) &&
                now.get(java.util.Calendar.DAY_OF_YEAR) == msgCal.get(java.util.Calendar.DAY_OF_YEAR)) {
                "Сегодня"
            } else if (now.get(java.util.Calendar.YEAR) == msgCal.get(java.util.Calendar.YEAR) &&
                       now.get(java.util.Calendar.DAY_OF_YEAR) - msgCal.get(java.util.Calendar.DAY_OF_YEAR) == 1) {
                "Вчера"
            } else {
                SimpleDateFormat("d MMMM yyyy", Locale("ru")).format(parsed)
            }
        } catch (_: Exception) {
            ""
        }
    }

    private fun renderMessages(messages: JSONArray) {
        renderedMessageViews.clear()
        chatMessages.removeAllViews()
        currentMessages = (0 until messages.length()).map { MessageItem.fromJson(messages.optJSONObject(it)) }

        if (currentMessages.isEmpty()) {
            val empty = TextView(activity).apply {
                text = "Начните переписку первыми."
                setTextColor(activity.resources.getColor(R.color.tg_text_muted))
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

        var prevDayKey = ""
        var index = 0
        while (index < currentMessages.size) {
            val message = currentMessages[index]
            val dayKey = getDayKey(message.createdAt)
            if (dayKey.isNotBlank() && dayKey != prevDayKey) {
                prevDayKey = dayKey
                val separatorText = getReadableDateSeparator(message.createdAt)
                if (separatorText.isNotBlank()) {
                    chatMessages.addView(buildDateSeparatorView(separatorText))
                }
            }

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

    private fun buildDateSeparatorView(textValue: String) = TextView(activity).apply {
        text = textValue
        setTextColor(0xFF8E9CA8.toInt())
        textSize = 12f
        gravity = Gravity.CENTER
        setPadding(0, dp(12), 0, dp(6))
        layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
    }

    private fun buildBubbleWrapper(outgoing: Boolean) = LinearLayout(activity).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = if (outgoing) Gravity.END else Gravity.START
        layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            topMargin = dp(4)
            bottomMargin = dp(4)
        }
    }

    private fun buildBubbleContainer(outgoing: Boolean) = LinearLayout(activity).apply {
        orientation = LinearLayout.VERTICAL
        setBackgroundResource(if (outgoing) R.drawable.bg_bubble_outgoing_tg else R.drawable.bg_bubble_incoming_tg)
        setPadding(dp(12), dp(8), dp(12), dp(8))
        layoutParams = LinearLayout.LayoutParams(
            dp(270),
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
    }

    private fun buildMessageBody(textVal: String) = TextView(activity).apply {
        text = textVal
        setTextColor(activity.resources.getColor(R.color.tg_text))
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
        layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        )
    }

    private fun isMessageRead(createdAt: String): Boolean {
        if (peerReadAt.isBlank()) return false
        return createdAt.compareTo(peerReadAt) <= 0
    }

    private fun buildMetaLabel(createdAt: String, outgoing: Boolean): View = LinearLayout(activity).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.END or Gravity.CENTER_VERTICAL
        layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            topMargin = dp(4)
        }

        val timeLabel = TextView(context).apply {
            text = formatTime(createdAt)
            setTextColor(activity.resources.getColor(R.color.tg_text_muted))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }
        addView(timeLabel)

        if (outgoing) {
            val ticksImage = ImageView(context).apply {
                val isRead = isMessageRead(createdAt)
                setImageResource(if (isRead) R.drawable.ic_ticks_double else R.drawable.ic_tick)
                val checkColor = if (isRead) 0xFF34C759.toInt() else 0xFF8E9CA8.toInt()
                setColorFilter(checkColor, PorterDuff.Mode.SRC_IN)
                layoutParams = LinearLayout.LayoutParams(dp(14), dp(14)).apply {
                    leftMargin = dp(4)
                }
            }
            addView(ticksImage)
        }
    }

    private fun createMessageBubble(message: MessageItem): View {
        val outgoing = message.senderId == currentUserId
        val wrapper = buildBubbleWrapper(outgoing)
        val bubble = buildBubbleContainer(outgoing)

        if (!outgoing && currentDialogType == "group") {
            val senderLabel = TextView(activity).apply {
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

        if (message.replyToMessageId.isNotBlank()) {
            val replyQuote = LinearLayout(activity).apply {
                orientation = LinearLayout.HORIZONTAL
                setBackgroundColor(if (outgoing) 0x1AFFFFFF else 0x1A000000)
                setPadding(dp(8), dp(4), dp(8), dp(4))
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = dp(6)
                }
                setOnClickListener {
                    scrollToMessage(message.replyToMessageId)
                }
            }
            val strip = View(activity).apply {
                setBackgroundColor(if (outgoing) Color.WHITE else 0xFF2E79C9.toInt())
                layoutParams = LinearLayout.LayoutParams(dp(2), LinearLayout.LayoutParams.MATCH_PARENT)
            }
            replyQuote.addView(strip)

            val textLayout = LinearLayout(activity).apply {
                orientation = LinearLayout.VERTICAL
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                    leftMargin = dp(6)
                }
            }
            val quoteSender = TextView(activity).apply {
                text = message.replyToSenderName
                textSize = 11f
                setTextColor(if (outgoing) Color.WHITE else 0xFF2E79C9.toInt())
                setTypeface(null, android.graphics.Typeface.BOLD)
            }
            val quoteBody = TextView(activity).apply {
                text = message.replyToBody
                textSize = 11f
                setTextColor(if (outgoing) 0xFFECE8FF.toInt() else 0xFF6E7C8B.toInt())
                maxLines = 1
                ellipsize = android.text.TextUtils.TruncateAt.END
            }
            textLayout.addView(quoteSender)
            textLayout.addView(quoteBody)
            replyQuote.addView(textLayout)
            bubble.addView(replyQuote)
        }

        val isAudio = message.normalizedType == "audio" || message.normalizedMime.startsWith("audio/")

        if (message.isImageMessage) {
            val image = RoundedCornerImageView(activity).apply {
                adjustViewBounds = true
                scaleType = ImageView.ScaleType.CENTER_CROP
                setBackgroundResource(R.drawable.bg_album_tile)
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(200))
                setOnClickListener { openImageViewer(message) }
            }
            ImageLoader.loadInto(activity, message.mediaUrl, image)
            bubble.addView(image)
            if (message.body.isNotBlank()) bubble.addView(buildMessageBody(message.body))
        } else if (isAudio) {
            bubble.addView(buildAudioPlayerView(message))
            if (message.body.isNotBlank()) bubble.addView(buildMessageBody(message.body))
        } else {
            bubble.addView(buildMessageBody(message.body))
        }

        bubble.addView(buildMetaLabel(message.createdAt, outgoing))
        bindBubbleInteractions(bubble, message)
        wrapper.addView(bubble)
        return wrapper
    }

    private fun buildAudioPlayerView(message: MessageItem): View = LinearLayout(activity).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(dp(4), dp(4), dp(4), dp(4))
        layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            bottomMargin = dp(6)
        }

        val topRow = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val playButton = ImageView(context).apply {
            setImageResource(android.R.drawable.ic_media_play)
            setColorFilter(Color.WHITE)
            setBackgroundResource(R.drawable.bg_icon_circle)
            setPadding(dp(6), dp(6), dp(6), dp(6))
            layoutParams = LinearLayout.LayoutParams(dp(36), dp(36))
        }

        val textLayout = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                leftMargin = dp(8)
            }
        }

        val nameLabel = TextView(context).apply {
            val file = message.mediaUrl.substringAfterLast("/")
            text = if (file.contains(".mp3") || file.contains(".ogg") || file.contains(".wav")) file else "Аудиозапись"
            setTextColor(Color.WHITE)
            setTypeface(null, android.graphics.Typeface.BOLD)
            textSize = 13f
            maxLines = 1
            ellipsize = TextUtils.TruncateAt.END
        }

        val durationLabel = TextView(context).apply {
            text = "00:00"
            textSize = 11f
            setTextColor(0xFFECE8FF.toInt())
        }

        textLayout.addView(nameLabel)
        textLayout.addView(durationLabel)
        topRow.addView(playButton)
        topRow.addView(textLayout)
        addView(topRow)

        val seekBar = SeekBar(context).apply {
            progress = 0
            max = 100
            setPadding(dp(8), dp(4), dp(8), dp(4))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dp(6)
            }
        }
        addView(seekBar)

        seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(sb: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser && activeSeekBar == sb) {
                    audioService?.mediaPlayer?.seekTo(progress)
                }
            }
            override fun onStartTrackingTouch(sb: SeekBar?) {}
            override fun onStopTrackingTouch(sb: SeekBar?) {}
        })

        playButton.setOnClickListener {
            playAudio(message.mediaUrl, playButton, seekBar, durationLabel)
        }
    }

    private fun playAudio(url: String, playButton: ImageView, seekBar: SeekBar, durationLabel: TextView) {
        val target = if (url.startsWith("http")) url else BuildConfig.BASE_URL + url

        if (audioService != null && activePlayButton == playButton) {
            audioService?.mediaPlayer?.let { player ->
                if (player.isPlaying) {
                    audioService?.pauseAudio()
                    playButton.setImageResource(android.R.drawable.ic_media_play)
                    progressHandler.removeCallbacks(progressRunnable)
                } else {
                    audioService?.resumeAudio()
                    playButton.setImageResource(android.R.drawable.ic_media_pause)
                    progressHandler.post(progressRunnable)
                }
            }
            return
        }

        stopActiveAudio()

        try {
            audioService?.playAudio(target, url.substringAfterLast("/"), { mp ->
                seekBar.max = mp.duration
                durationLabel.text = "00:00 / ${formatDuration(mp.duration)}"
                playButton.setImageResource(android.R.drawable.ic_media_pause)
                progressHandler.post(progressRunnable)
            }, {
                seekBar.progress = 0
                durationLabel.text = "00:00"
                playButton.setImageResource(android.R.drawable.ic_media_play)
                progressHandler.removeCallbacks(progressRunnable)
                stopActiveAudio()
            })
            activePlayButton = playButton
            activeSeekBar = seekBar
            activeDurationLabel = durationLabel
        } catch (_: Exception) {
            Toast.makeText(activity, "Не удалось воспроизвести аудио.", Toast.LENGTH_SHORT).show()
            stopActiveAudio()
        }
    }

    private fun stopActiveAudio() {
        progressHandler.removeCallbacks(progressRunnable)
        audioService?.stopAudio()
        activePlayButton?.setImageResource(android.R.drawable.ic_media_play)
        activeSeekBar?.progress = 0
        activePlayButton = null
        activeSeekBar = null
        activeDurationLabel = null
    }

    private fun formatDuration(ms: Int): String {
        val sec = ms / 1000
        val min = sec / 60
        val remainder = sec % 60
        return String.format(Locale.getDefault(), "%02d:%02d", min, remainder)
    }

    private fun createAlbumBubble(albumMessages: List<MessageItem>): View {
        val lastMessage = albumMessages.last()
        val outgoing = lastMessage.senderId == currentUserId
        val wrapper = buildBubbleWrapper(outgoing)
        val bubble = buildBubbleContainer(outgoing).apply { setPadding(dp(8), dp(8), dp(8), dp(10)) }

        if (!outgoing && currentDialogType == "group") {
            val senderLabel = TextView(activity).apply {
                text = lastMessage.senderName
                setTextColor(UiUtils.getDistinctColor(lastMessage.senderName))
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
                setTypeface(null, android.graphics.Typeface.BOLD)
                layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                    bottomMargin = dp(4)
                    leftMargin = dp(4)
                }
            }
            bubble.addView(senderLabel)
        }

        val grid = GridView(activity).apply {
            numColumns = 2
            horizontalSpacing = dp(4)
            verticalSpacing = dp(4)
            stretchMode = GridView.STRETCH_COLUMN_WIDTH
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(120 * ((albumMessages.size + 1) / 2))
            )
        }

        grid.adapter = object : BaseAdapter() {
            override fun getCount(): Int = albumMessages.size
            override fun getItem(pos: Int): Any = albumMessages[pos]
            override fun getItemId(pos: Int): Long = pos.toLong()
            override fun getView(pos: Int, convertView: View?, parent: ViewGroup): View {
                val tileMessage = albumMessages[pos]
                val tileView = (convertView as? RoundedCornerImageView) ?: RoundedCornerImageView(activity).apply {
                    scaleType = ImageView.ScaleType.CENTER_CROP
                    setOnClickListener { openImageViewer(tileMessage) }
                }
                ImageLoader.loadInto(activity, tileMessage.mediaUrl, tileView)
                return tileView
            }
        }

        bubble.addView(grid)
        if (lastMessage.body.isNotBlank()) {
            bubble.addView(buildMessageBody(lastMessage.body).apply {
                layoutParams = (layoutParams as LinearLayout.LayoutParams).apply {
                    topMargin = dp(6)
                    leftMargin = dp(4)
                    rightMargin = dp(4)
                }
            })
        }
        bubble.addView(buildMetaLabel(lastMessage.createdAt, outgoing))
        bindBubbleInteractions(bubble, lastMessage)
        wrapper.addView(bubble)
        return wrapper
    }

    private fun bindBubbleInteractions(bubbleView: View, message: MessageItem) {
        val longPressHandler = Handler(Looper.getMainLooper())
        var longPressTriggered = false
        val longPressRunnable = Runnable {
            longPressTriggered = true
            bubbleView.performHapticFeedback(android.view.HapticFeedbackConstants.LONG_PRESS)
            showBubbleContextMenu(message)
        }

        var startX = 0f
        var startY = 0f
        var isDragging = false

        bubbleView.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    startX = event.rawX
                    startY = event.rawY
                    longPressTriggered = false
                    isDragging = false
                    longPressHandler.postDelayed(longPressRunnable, 600)
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = event.rawX - startX
                    val dy = event.rawY - startY
                    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                        longPressHandler.removeCallbacks(longPressRunnable)
                    }
                    if (dx > 40 && Math.abs(dy) < 30) {
                        isDragging = true
                        v.translationX = Math.min(dx - 40, dp(70).toFloat())
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    longPressHandler.removeCallbacks(longPressRunnable)
                    if (isDragging) {
                        val finalTx = v.translationX
                        v.animate().translationX(0f).setDuration(200).start()
                        if (finalTx > dp(45)) {
                            setReplyMessage(message)
                        }
                    } else if (!longPressTriggered && event.action == MotionEvent.ACTION_UP) {
                        val duration = event.eventTime - event.downTime
                        if (duration < 300) {
                            v.performClick()
                        }
                    }
                }
            }
            true
        }
    }

    private fun showBubbleContextMenu(message: MessageItem) {
        val items = if (message.senderId == currentUserId) arrayOf("Ответить", "Удалить") else arrayOf("Ответить")
        AlertDialog.Builder(activity)
            .setItems(items) { _, which ->
                when (which) {
                    0 -> setReplyMessage(message)
                    1 -> deleteMessage(message.id)
                }
            }
            .show()
    }

    private fun deleteMessage(messageId: String) {
        executor.execute {
            try {
                ApiClient.deleteMessage(activity, messageId)
                handler.post { loadMessages(false) }
            } catch (error: Exception) {
                handler.post { Toast.makeText(activity, error.message ?: "Не удалось удалить сообщение", Toast.LENGTH_SHORT).show() }
            }
        }
    }

    private fun setReplyMessage(message: MessageItem?) {
        pendingReplyMessage = message
        if (message == null) {
            chatReplyPreviewBar.visibility = View.GONE
        } else {
            chatReplySender.text = message.senderName
            chatReplyText.text = if (message.isImageMessage) "Фотография" else message.body
            chatReplyPreviewBar.visibility = View.VISIBLE
        }
    }

    private fun sendMessage() {
        val text = chatComposerInput.text.toString().trim()
        if (text.isEmpty()) return

        chatSendButton.isEnabled = false
        val replyId = pendingReplyMessage?.id
        executor.execute {
            try {
                ApiClient.sendMessage(activity, publicId, text, replyId)
                handler.post {
                    chatComposerInput.setText("")
                    setReplyMessage(null)
                    chatSendButton.isEnabled = true
                    loadMessages(true)
                }
            } catch (error: Exception) {
                handler.post {
                    chatSendButton.isEnabled = true
                    chatSubtitle.text = error.message ?: "Не удалось отправить."
                }
            }
        }
    }

    private fun showAttachmentMenu() {
        val options = arrayOf("📸 Изображения / Фото", "🎵 Аудио / Музыка")
        AlertDialog.Builder(activity)
            .setTitle("Прикрепить файл")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> pickImages()
                    1 -> pickAudio()
                }
            }
            .show()
    }

    private fun pickImages() {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "image/*"
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
        }
        activity.startActivityForResult(Intent.createChooser(intent, "Выберите фото"), 101)
    }

    private fun pickAudio() {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "audio/*"
        }
        activity.startActivityForResult(Intent.createChooser(intent, "Выберите аудиофайл"), 102)
    }

    fun handleAttachmentResult(requestCode: Int, data: Intent?) {
        if (data == null) return
        if (requestCode == 101) {
            val clipData = data.clipData
            val uris = mutableListOf<Uri>()
            if (clipData != null) {
                for (i in 0 until clipData.itemCount) {
                    uris += clipData.getItemAt(i).uri
                }
            } else {
                data.data?.let { uris += it }
            }
            if (uris.isNotEmpty()) uploadImages(uris)
        } else if (requestCode == 102) {
            data.data?.let { uploadAudio(it) }
        }
    }

    private fun uploadImages(uris: List<Uri>) {
        chatSubtitle.text = "Загружаем фото…"
        chatAttachButton.isEnabled = false
        chatSendButton.isEnabled = false
        val replyId = pendingReplyMessage?.id

        executor.execute {
            try {
                ApiClient.sendImages(activity, publicId, uris, "", replyId)
                handler.post {
                    setReplyMessage(null)
                    chatAttachButton.isEnabled = true
                    chatSendButton.isEnabled = true
                    loadMessages(true)
                }
            } catch (error: Exception) {
                handler.post {
                    chatAttachButton.isEnabled = true
                    chatSendButton.isEnabled = true
                    chatSubtitle.text = error.message ?: "Не удалось отправить."
                }
            }
        }
    }

    private fun uploadAudio(uri: Uri) {
        chatSubtitle.text = "Загружаем аудио…"
        chatAttachButton.isEnabled = false
        chatSendButton.isEnabled = false
        val replyId = pendingReplyMessage?.id

        executor.execute {
            try {
                ApiClient.uploadFile(activity, publicId, uri, "", replyToMessageId = replyId)
                handler.post {
                    setReplyMessage(null)
                    chatAttachButton.isEnabled = true
                    chatSendButton.isEnabled = true
                    loadMessages(true)
                }
            } catch (error: Exception) {
                handler.post {
                    chatAttachButton.isEnabled = true
                    chatSendButton.isEnabled = true
                    chatSubtitle.text = error.message ?: "Не удалось отправить аудио."
                }
            }
        }
    }

    private fun openSearchPanel() {
        chatSearchPanel.visibility = View.VISIBLE
        chatSearchInput.requestFocus()
    }

    private fun closeSearchPanel() {
        chatSearchPanel.visibility = View.GONE
        chatSearchInput.setText("")
        performSearch("")
    }

    private fun performSearch(query: String) {
        val trimmed = query.trim().toLowerCase(Locale.getDefault())
        var count = 0
        for (i in 0 until chatMessages.childCount) {
            val child = chatMessages.getChildAt(i)
            val bubble = child.findViewById<View>(R.id.rowTitle)?.parent as? LinearLayout
            val bodyText = bubble?.findViewById<TextView>(R.id.rowSubtitle)?.text?.toString().orEmpty()
            if (trimmed.isEmpty() || bodyText.toLowerCase(Locale.getDefault()).contains(trimmed)) {
                child.visibility = View.VISIBLE
                if (trimmed.isNotEmpty() && bodyText.isNotBlank()) count++
            } else {
                child.visibility = View.GONE
            }
        }
        chatSearchCount.text = if (trimmed.isEmpty()) "" else "$count найдено"
    }

    private fun setupEmojiPanel() {
        chatEmojiButton.setOnClickListener {
            if (chatEmojiPanel.visibility == View.VISIBLE) {
                chatEmojiPanel.visibility = View.GONE
            } else {
                chatEmojiPanel.visibility = View.VISIBLE
            }
        }

        // Render Tabs
        chatEmojiTabs.removeAllViews()
        emojiCategories.forEachIndexed { index, cat ->
            val tab = TextView(activity).apply {
                text = "${cat.icon} ${cat.name}"
                textSize = 13f
                setPadding(dp(12), dp(8), dp(12), dp(8))
                gravity = Gravity.CENTER
                setTextColor(if (index == selectedCategoryIndex) 0xFF6F63F6.toInt() else Color.GRAY)
                setOnClickListener {
                    selectedCategoryIndex = index
                    chatEmojiSearch.setText("")
                    updateEmojiGrid()
                    setupEmojiPanel()
                }
            }
            chatEmojiTabs.addView(tab)
        }

        // Search in Emoji
        chatEmojiSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
            override fun afterTextChanged(s: Editable?) {
                searchEmojiQuery = s?.toString().orEmpty()
                updateEmojiGrid()
            }
        })

        updateEmojiGrid()
    }

    private fun updateEmojiGrid() {
        val category = emojiCategories[selectedCategoryIndex]
        val filteredList = if (searchEmojiQuery.trim().isEmpty()) {
            category.emojis
        } else {
            val q = searchEmojiQuery.toLowerCase(Locale.getDefault())
            // Filter categories containing q in names, or search all emojis
            val allList = emojiCategories.flatMap { it.emojis }
            allList.filter { it.contains(q) }
        }

        chatEmojiGrid.adapter = object : BaseAdapter() {
            override fun getCount(): Int = filteredList.size
            override fun getItem(pos: Int): Any = filteredList[pos]
            override fun getItemId(pos: Int): Long = pos.toLong()
            override fun getView(pos: Int, convertView: View?, parent: ViewGroup): View {
                val emojiText = filteredList[pos]
                val item = (convertView as? TextView) ?: TextView(activity).apply {
                    textSize = 24f
                    gravity = Gravity.CENTER
                    setPadding(dp(6), dp(6), dp(6), dp(6))
                    setOnClickListener {
                        val start = chatComposerInput.selectionStart
                        val end = chatComposerInput.selectionEnd
                        chatComposerInput.editableText.replace(start, end, emojiText)
                    }
                }
                item.text = emojiText
                return item
            }
        }
    }

    private fun syncSubtitle() {
        val typing = RealtimeClient.isDialogTyping(currentDialogId)
        if (currentDialogType == "group" && groupMembersArray != null) {
            val total = groupMembersArray?.length() ?: 0
            var online = 0
            for (i in 0 until total) {
                val member = groupMembersArray?.optJSONObject(i)
                val mId = member?.optStringClean("userId")
                if (RealtimeClient.isUserOnline(mId)) {
                    online++
                }
            }
            chatSubtitle.text = if (typing) "кто-то печатает..." else "$total ${getMemberDeclension(total)}, $online в сети"
        } else {
            chatSubtitle.text = when {
                typing -> "печатает..."
                currentPeerUserId.isNotBlank() && RealtimeClient.isUserOnline(currentPeerUserId) -> "в сети"
                currentPeerLastSeenAt.isNotBlank() -> formatLastSeen(currentPeerLastSeenAt)
                else -> chatSubtitleText
            }
        }
    }

    private fun getMemberDeclension(count: Int): String {
        val mod10 = count % 10
        val mod100 = count % 100
        return when {
            mod100 in 11..19 -> "участников"
            mod10 == 1 -> "участник"
            mod10 in 2..4 -> "участника"
            else -> "участников"
        }
    }

    private fun formatLastSeen(iso: String): String = try {
        val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US).parse(iso)
        if (parsed == null) "был(а) недавно" else "был(а) в сети в ${SimpleDateFormat("HH:mm", Locale.getDefault()).format(parsed)}"
    } catch (_: Exception) {
        "был(а) недавно"
    }

    private fun formatTime(iso: String): String = try {
        val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US).parse(iso)
        if (parsed == null) "" else SimpleDateFormat("HH:mm", Locale.getDefault()).format(parsed)
    } catch (_: Exception) {
        ""
    }

    private fun openImageViewer(message: MessageItem) {
        activity.startActivity(Intent(activity, MediaViewerActivity::class.java).apply {
            putExtra("imageUrl", message.mediaUrl)
            putExtra("senderName", message.senderName)
            putExtra("createdAt", formatViewerDate(message.createdAt))
            // Retrieve sender avatarurl
            val senderAvatar = findSenderAvatar(message.senderId)
            putExtra("senderAvatarUrl", senderAvatar)
        })
        activity.overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }

    private fun findSenderAvatar(senderId: String): String {
        if (groupMembersArray != null) {
            for (i in 0 until groupMembersArray!!.length()) {
                val member = groupMembersArray!!.optJSONObject(i)
                if (member.optStringClean("userId") == senderId) {
                    return member.optStringClean("avatarUrl")
                }
            }
        }
        return if (senderId == currentPeerUserId) {
            // Wait, we can pass peerAvatarUrl or look it up
            ""
        } else {
            ""
        }
    }

    private fun formatViewerDate(iso: String): String = try {
        val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US).parse(iso)
        if (parsed == null) "" else SimpleDateFormat("d MMMM yyyy, HH:mm", Locale("ru")).format(parsed)
    } catch (_: Exception) {
        ""
    }

    private fun scrollToMessage(messageId: String) {
        val view = renderedMessageViews[messageId] ?: return
        view.alpha = 0.55f
        view.animate().alpha(1f).setDuration(300).start()
        chatScroll.post {
            chatScroll.smoothScrollTo(0, maxOf(0, view.top - dp(80)))
        }
    }

    private fun scrollToBottom() {
        chatScroll.post { chatScroll.fullScroll(View.FOCUS_DOWN) }
    }

    override fun onRealtimeEvent(type: String, payload: JSONObject) {
        when (type) {
            "message_created" -> {
                val dialog = payload.optJSONObject("dialog")
                if (dialog?.optStringClean("publicId") == publicId) {
                    loadMessages(true)
                }
            }
            "presence_snapshot", "user_presence", "dialog_typing" -> syncSubtitle()
            "dialog_read" -> Unit
        }
    }

    private fun dp(value: Int): Int = UiUtils.dp(activity, value)
}
