package su.thegrapht.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.ImageView

class SplashActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        (findViewById(R.id.splashLogo) as ImageView).apply {
            alpha = 0f
            scaleX = 0.86f
            scaleY = 0.86f
            animate()
                .alpha(1f)
                .scaleX(1f)
                .scaleY(1f)
                .setDuration(620)
                .start()
        }

        Handler(Looper.getMainLooper()).postDelayed({
            startActivity(Intent(this, if (SessionStore.hasSession(this)) DialogsActivity::class.java else AuthActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        }, 950L)
    }
}
