package su.thegrapht.app

import android.app.Activity
import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView

class MediaViewerActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_media_viewer)

        val imageUrl = intent.getStringExtra("imageUrl")
        val senderName = intent.getStringExtra("senderName").orEmpty()
        val createdAt = intent.getStringExtra("createdAt").orEmpty()

        (findViewById(R.id.viewerAvatar) as TextView).apply {
            text = UiUtils.initial(senderName)
            background = UiUtils.buildAvatarBackground(senderName)
        }
        (findViewById(R.id.viewerTitle) as TextView).text = senderName.ifBlank { "TheGrapht" }
        (findViewById(R.id.viewerSubtitle) as TextView).text = createdAt
        ImageLoader.loadInto(this, imageUrl, findViewById(R.id.viewerImage) as ImageView)

        (findViewById(R.id.viewerClose) as TextView).setOnClickListener { closeViewer() }
        findViewById(android.R.id.content).setOnClickListener { closeViewer() }
        (findViewById(R.id.viewerImage) as ImageView).setOnClickListener { }
    }

    private fun closeViewer() {
        finish()
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }
}
