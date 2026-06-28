package su.thegrapht.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View

class ChatActivity : Activity() {

    private lateinit var chatViewBinder: ChatViewBinder

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)

        val publicId = intent.getStringExtra("publicId").orEmpty()
        val title = intent.getStringExtra("title").orEmpty()
        val subtitle = intent.getStringExtra("subtitle").orEmpty()
        val unreadCount = intent.getIntExtra("unreadCount", 0)

        chatViewBinder = ChatViewBinder(
            activity = this,
            root = findViewById(android.R.id.content),
            publicId = publicId,
            chatTitleText = title,
            chatSubtitleText = subtitle,
            initialUnreadCount = unreadCount,
            isTablet = false
        )
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == RESULT_OK) {
            chatViewBinder.handleAttachmentResult(requestCode, data)
        }
    }

    override fun onDestroy() {
        chatViewBinder.release()
        super.onDestroy()
    }
}
