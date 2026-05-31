package su.thegrapht.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import java.util.concurrent.Executors

class AuthActivity : Activity() {
    private val executor = Executors.newSingleThreadExecutor()
    private val handler = Handler(Looper.getMainLooper())
    private var registerMode = false
    private var pendingEmail: String? = null
    private var resendCooldown = 0

    private lateinit var authCard: View
    private lateinit var verifyCard: View

    // Credentials views
    private lateinit var authTitle: TextView
    private lateinit var authSubtitle: TextView
    private lateinit var authStatus: TextView
    private lateinit var nameInput: EditText
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var authSubmit: SparkleButton
    private lateinit var authToggle: Button

    // Verification views
    private lateinit var codeInput: EditText
    private lateinit var verifySubmit: SparkleButton
    private lateinit var verifyStatus: TextView
    private lateinit var verifyResend: SparkleButton

    private val cooldownRunnable = object : Runnable {
        override fun run() {
            if (resendCooldown > 0) {
                resendCooldown--
                verifyResend.text = "Отправить код повторно ($resendCooldown)"
                verifyResend.isEnabled = false
                handler.postDelayed(this, 1000)
            } else {
                verifyResend.text = "Отправить код повторно"
                verifyResend.isEnabled = true
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth)

        authCard = findViewById(R.id.authCard)
        verifyCard = findViewById(R.id.verifyCard)

        // Credentials mapping
        authTitle = findViewById(R.id.authTitle) as TextView
        authSubtitle = findViewById(R.id.authSubtitle) as TextView
        authStatus = findViewById(R.id.authStatus) as TextView
        nameInput = findViewById(R.id.nameInput) as EditText
        emailInput = findViewById(R.id.emailInput) as EditText
        passwordInput = findViewById(R.id.passwordInput) as EditText
        authSubmit = findViewById(R.id.authSubmit) as SparkleButton
        authToggle = findViewById(R.id.authToggle) as Button

        // Verification mapping
        codeInput = findViewById(R.id.codeInput) as EditText
        verifySubmit = findViewById(R.id.verifySubmit) as SparkleButton
        verifyStatus = findViewById(R.id.verifyStatus) as TextView
        verifyResend = findViewById(R.id.verifyResend) as SparkleButton

        authSubmit.setOnClickListener { submitCredentials() }
        authToggle.setOnClickListener {
            registerMode = !registerMode
            syncMode()
        }

        verifySubmit.setOnClickListener { submitVerification() }
        verifyResend.setOnClickListener { resendCode() }

        syncMode()
    }

    private fun syncMode() {
        val container = authCard.parent as? android.view.ViewGroup
        if (container != null) {
            android.transition.TransitionManager.beginDelayedTransition(
                container,
                android.transition.AutoTransition().apply { duration = 250 }
            )
        }
        nameInput.visibility = if (registerMode) View.VISIBLE else View.GONE
        authTitle.text = if (registerMode) "Создать аккаунт" else "Войти"
        authSubtitle.text = if (registerMode) "Создайте аккаунт и сразу попадете в TheGrapht." else "Войдите в свой аккаунт TheGrapht."
        authSubmit.text = if (registerMode) "Создать аккаунт" else "Войти"
        authToggle.text = if (registerMode) "У меня уже есть аккаунт" else "Создать аккаунт"
        authStatus.text = ""
        verifyStatus.text = ""
    }

    private fun submitCredentials() {
        val name = nameInput.text.toString().trim()
        val email = emailInput.text.toString().trim()
        val password = passwordInput.text.toString()

        when {
            registerMode && name.isEmpty() -> authStatus.text = "Введите имя."
            email.isEmpty() || password.isEmpty() -> authStatus.text = "Введите почту и пароль."
            else -> {
                authSubmit.isEnabled = false
                authStatus.text = "Подключаемся…"
                executor.execute {
                    try {
                        val response = if (registerMode) {
                            ApiClient.register(this, name, email, password)
                        } else {
                            ApiClient.login(this, email, password)
                        }
                        
                        val status = response.optString("status")
                        val emailResponse = response.optString("email", email)

                        runOnUiThread {
                            authSubmit.isEnabled = true
                            if (status == "verification_required") {
                                pendingEmail = emailResponse
                                val rootContainer = authCard.parent as? android.view.ViewGroup
                                if (rootContainer != null) {
                                    android.transition.TransitionManager.beginDelayedTransition(
                                        rootContainer,
                                        android.transition.AutoTransition().apply { duration = 300 }
                                    )
                                }
                                authCard.visibility = View.GONE
                                verifyCard.visibility = View.VISIBLE
                                startResendCooldown()
                            } else {
                                startActivity(Intent(this, DialogsActivity::class.java))
                                finish()
                            }
                        }
                    } catch (error: Exception) {
                        runOnUiThread {
                            authSubmit.isEnabled = true
                            authStatus.text = error.message ?: "Не удалось войти."
                        }
                    }
                }
            }
        }
    }

    private fun submitVerification() {
        val email = pendingEmail ?: emailInput.text.toString().trim()
        val code = codeInput.text.toString().trim()

        if (code.length != 6) {
            verifyStatus.text = "Введите 6-значный код."
            return
        }

        verifySubmit.isEnabled = false
        verifyStatus.text = "Проверяем код…"

        executor.execute {
            try {
                ApiClient.verify(this, email, code)
                runOnUiThread {
                    verifySubmit.isEnabled = true
                    startActivity(Intent(this, DialogsActivity::class.java))
                    finish()
                }
            } catch (error: Exception) {
                runOnUiThread {
                    verifySubmit.isEnabled = true
                    verifyStatus.text = error.message ?: "Неверный код."
                }
            }
        }
    }

    private fun resendCode() {
        val email = pendingEmail ?: emailInput.text.toString().trim()
        if (email.isEmpty()) return

        verifyResend.isEnabled = false
        verifyStatus.text = "Отправляем новый код…"

        executor.execute {
            try {
                ApiClient.resendVerification(this, email)
                runOnUiThread {
                    verifyStatus.text = "Новый код отправлен!"
                    startResendCooldown()
                }
            } catch (error: Exception) {
                runOnUiThread {
                    verifyResend.isEnabled = true
                    verifyStatus.text = error.message ?: "Не удалось отправить код."
                }
            }
        }
    }

    private fun startResendCooldown() {
        handler.removeCallbacks(cooldownRunnable)
        resendCooldown = 60
        verifyResend.text = "Отправить код повторно ($resendCooldown)"
        verifyResend.isEnabled = false
        handler.post(cooldownRunnable)
    }

    override fun onBackPressed() {
        if (verifyCard.visibility == View.VISIBLE) {
            val container = authCard.parent as? android.view.ViewGroup
            if (container != null) {
                android.transition.TransitionManager.beginDelayedTransition(
                    container,
                    android.transition.AutoTransition().apply { duration = 300 }
                )
            }
            verifyCard.visibility = View.GONE
            authCard.visibility = View.VISIBLE
            verifyStatus.text = ""
            authStatus.text = ""
            handler.removeCallbacks(cooldownRunnable)
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        executor.shutdownNow()
        handler.removeCallbacks(cooldownRunnable)
        super.onDestroy()
    }
}
