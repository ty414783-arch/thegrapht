package su.thegrapht.app

import android.content.Context
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.TextView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DialogsAdapter(context: Context) : BaseAdapter() {
    data class RowItem(
        val isSearchUser: Boolean,
        val dialog: DialogItem? = null,
        val user: SearchUserItem? = null
    )

    private val inflater = LayoutInflater.from(context)
    private val items = mutableListOf<RowItem>()

    fun setItems(nextItems: List<RowItem>) {
        items.clear()
        items.addAll(nextItems)
        notifyDataSetChanged()
    }

    override fun getCount(): Int = items.size
    override fun getItem(position: Int): Any = items[position]
    override fun getItemId(position: Int): Long = position.toLong()

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view = convertView ?: inflater.inflate(R.layout.row_dialog, parent, false)
        val avatar = view.findViewById(R.id.rowAvatar) as TextView
        val avatarImage = view.findViewById(R.id.rowAvatarImage) as su.thegrapht.app.CircleImageView
        val title = view.findViewById(R.id.rowTitle) as TextView
        val subtitle = view.findViewById(R.id.rowSubtitle) as TextView
        val presence = view.findViewById<View>(R.id.rowPresence)
        val timeView = view.findViewById(R.id.rowTime) as TextView
        val badgeView = view.findViewById(R.id.rowBadge) as TextView
        val item = items[position]

        val displayTitle: String
        val displaySubtitle: String
        val isOnline: Boolean
        var avatarUrl: String? = null
        var isSaved = false

        if (item.isSearchUser) {
            displayTitle = item.user?.name.orEmpty()
            displaySubtitle = "@${item.user?.username.orEmpty()}"
            isOnline = false
            timeView.text = ""
            badgeView.visibility = View.GONE
        } else {
            val dialog = item.dialog
            displayTitle = dialog?.title.orEmpty()
            isOnline = RealtimeClient.isUserOnline(dialog?.peerUserId)
            isSaved = dialog?.type == "saved"
            
            val preview = dialog?.preview.orEmpty()
            val sender = dialog?.lastMessageSenderName.orEmpty()
            
            val subtitleText = if (isOnline && dialog?.type == "direct") {
                "в сети"
            } else if (preview.isEmpty()) {
                dialog?.subtitle.orEmpty()
            } else if (sender.isNotEmpty() && dialog?.type == "group") {
                "$sender: $preview"
            } else if (sender.isNotEmpty() && sender != "You" && sender != "Вы") {
                "$sender: $preview"
            } else {
                preview
            }
            displaySubtitle = subtitleText
            avatarUrl = dialog?.avatarUrl
            
            // Set unread count badge
            val unread = dialog?.unreadCount ?: 0
            if (unread > 0) {
                badgeView.text = unread.toString()
                badgeView.visibility = View.VISIBLE
            } else {
                badgeView.visibility = View.GONE
            }

            // Set formatted last message timestamp
            val rawTime = dialog?.lastMessageCreatedAt
            timeView.text = formatMessageTime(rawTime)
        }

        title.text = displayTitle
        subtitle.text = displaySubtitle
        presence.visibility = if (isOnline) View.VISIBLE else View.GONE

        // Handle Saved Messages icon vs letters/avatars
        if (isSaved) {
            avatar.text = ""
            avatar.background = UiUtils.buildAvatarBackground("saved")
            avatar.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_bookmark, 0, 0, 0)
            val pad = UiUtils.dp(parent.context, 15)
            avatar.setPadding(pad, pad, pad, pad)
            avatarImage.visibility = View.GONE
        } else {
            avatar.text = UiUtils.initial(displayTitle)
            avatar.background = UiUtils.buildAvatarBackground(displayTitle)
            avatar.setCompoundDrawablesWithIntrinsicBounds(0, 0, 0, 0)
            avatar.setPadding(0, 0, 0, 0)

            if (!avatarUrl.isNullOrBlank() && avatarUrl != "null") {
                avatarImage.visibility = View.VISIBLE
                ImageLoader.loadInto(parent.context, avatarUrl, avatarImage)
            } else {
                avatarImage.visibility = View.GONE
            }
        }
        
        return view
    }

    private fun formatMessageTime(createdAtStr: String?): String {
        if (createdAtStr.isNullOrEmpty()) return ""
        return try {
            val inputFormat = if (createdAtStr.contains("T")) {
                if (createdAtStr.contains(".")) {
                    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                        timeZone = java.util.TimeZone.getTimeZone("UTC")
                    }
                } else {
                    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                        timeZone = java.util.TimeZone.getTimeZone("UTC")
                    }
                }
            } else {
                SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US)
            }
            val date = inputFormat.parse(createdAtStr) ?: return ""
            val now = java.util.Calendar.getInstance()
            val msgCal = java.util.Calendar.getInstance().apply { time = date }
            
            if (now.get(java.util.Calendar.YEAR) == msgCal.get(java.util.Calendar.YEAR) &&
                now.get(java.util.Calendar.DAY_OF_YEAR) == msgCal.get(java.util.Calendar.DAY_OF_YEAR)) {
                SimpleDateFormat("HH:mm", Locale.getDefault()).format(date)
            } else if (now.get(java.util.Calendar.YEAR) == msgCal.get(java.util.Calendar.YEAR) &&
                       now.get(java.util.Calendar.WEEK_OF_YEAR) == msgCal.get(java.util.Calendar.WEEK_OF_YEAR)) {
                SimpleDateFormat("EEE", Locale.getDefault()).format(date)
            } else {
                SimpleDateFormat("d MMM", Locale.getDefault()).format(date)
            }
        } catch (e: Exception) {
            ""
        }
    }
}
