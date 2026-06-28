package su.thegrapht.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ListView
import android.widget.TextView
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.Executors

class DialogsActivity : Activity(), RealtimeClient.Listener {
    private val executor = Executors.newSingleThreadExecutor()
    private val handler = Handler(Looper.getMainLooper())
    private val refreshRunnable = object : Runnable {
        override fun run() {
            loadDialogs(false)
            handler.postDelayed(this, 4000L)
        }
    }

    private lateinit var adapter: DialogsAdapter
    private lateinit var dialogsUserName: TextView
    private lateinit var dialogsStatus: TextView
    private lateinit var dialogsSearch: EditText
    private lateinit var dialogsList: ListView
    private lateinit var dialogsLoader: View
    private val currentRows = mutableListOf<DialogsAdapter.RowItem>()
    private val allLoadedRows = mutableListOf<DialogsAdapter.RowItem>()

    // Split-pane layout views
    private lateinit var dialogsSidebar: View
    private lateinit var tabletDivider: View
    private lateinit var tabletChatContainer: FrameLayout
    private var isTablet = false
    private var activeChatViewBinder: ChatViewBinder? = null

    // Pending group members
    private val pendingGroupUserIds = mutableListOf<String>()
    private val pendingGroupUserNames = mutableListOf<String>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dialogs)

        dialogsUserName = findViewById(R.id.dialogsUserName) as TextView
        dialogsStatus = findViewById(R.id.dialogsStatus) as TextView
        dialogsSearch = findViewById(R.id.dialogsSearch) as EditText
        dialogsList = findViewById(R.id.dialogsList) as ListView
        dialogsLoader = findViewById<View>(R.id.dialogsLoader)
        val logoutButton = findViewById<View>(R.id.logoutButton)
        val createGroupButton = findViewById<View>(R.id.createGroupButton)

        dialogsSidebar = findViewById(R.id.dialogsSidebar)
        tabletDivider = findViewById(R.id.tabletDivider)
        tabletChatContainer = findViewById(R.id.tabletChatContainer) as FrameLayout

        adapter = DialogsAdapter(this)
        dialogsList.adapter = adapter
        dialogsUserName.text = SessionStore.getUserName(this)
        dialogsStatus.text = "Загружаем чаты…"

        dialogsList.setOnItemClickListener { _, _, position, _ ->
            val item = currentRows[position]
            if (item.isSearchUser) {
                showUserOptionsDialog(item.user?.id.orEmpty(), item.user?.name.orEmpty())
            } else {
                openChat(
                    item.dialog?.publicId.orEmpty(),
                    item.dialog?.title.orEmpty(),
                    item.dialog?.subtitle.orEmpty(),
                    item.dialog?.unreadCount ?: 0
                )
            }
        }

        dialogsSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
            override fun afterTextChanged(s: Editable?) {
                handler.removeCallbacks(refreshRunnable)
                val query = s?.toString()?.trim().orEmpty()
                if (query.isEmpty()) loadDialogs(false) else searchUsers(query)
            }
        })

        logoutButton.setOnClickListener { logout() }
        createGroupButton.setOnClickListener { showCreateGroupDialog() }

        // Tablet adaptation
        val displayMetrics = resources.displayMetrics
        val widthDp = displayMetrics.widthPixels / displayMetrics.density
        if (widthDp > 600) {
            isTablet = true
            tabletDivider.visibility = View.VISIBLE
            tabletChatContainer.visibility = View.VISIBLE

            // Constrain sidebar width
            val sideParams = dialogsSidebar.layoutParams as LinearLayout.LayoutParams
            sideParams.width = (340 * displayMetrics.density).toInt()
            sideParams.weight = 0f
            dialogsSidebar.layoutParams = sideParams
        }
    }

    private fun applyFilter() {
        currentRows.clear()
        currentRows.addAll(allLoadedRows)
        adapter.setItems(allLoadedRows)
        dialogsStatus.text = if (allLoadedRows.isEmpty()) "Чатов пока нет." else ""
        
        // Ensure infinite loader is hidden when list has items
        if (allLoadedRows.isNotEmpty()) {
            dialogsLoader.visibility = View.GONE
        }
    }

    override fun onResume() {
        super.onResume()
        dialogsLoader.visibility = View.GONE
        RealtimeClient.addListener(this)
        RealtimeClient.setForegroundState(true, null)
        RealtimeClient.connect(this, SessionStore.getUserId(this))
        RealtimeClient.updatePresence(null)
        loadDialogs(allLoadedRows.isEmpty())
        handler.postDelayed(refreshRunnable, 4000L)
    }

    override fun onPause() {
        handler.removeCallbacks(refreshRunnable)
        RealtimeClient.removeListener(this)
        RealtimeClient.setForegroundState(false, null)
        super.onPause()
    }

    private fun logout() {
        dialogsStatus.text = "Выходим…"
        dialogsLoader.visibility = View.VISIBLE
        executor.execute {
            runCatching { ApiClient.logout(this) }
            runOnUiThread {
                dialogsLoader.visibility = View.GONE
                SessionStore.clear(this)
                startActivity(Intent(this, AuthActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                })
                finish()
            }
        }
    }

    private fun loadDialogs(firstLoad: Boolean) {
        dialogsLoader.visibility = if (firstLoad) View.VISIBLE else View.GONE
        executor.execute {
            try {
                val payload = ApiClient.getClientState(this)
                val user = payload.optJSONObject("user")
                val dialogs = payload.optJSONArray("dialogs") ?: JSONArray()
                val rows = mutableListOf<DialogsAdapter.RowItem>()
                repeat(dialogs.length()) { index ->
                    rows += DialogsAdapter.RowItem(false, DialogItem.fromJson(dialogs.optJSONObject(index)), null)
                }

                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    user?.let {
                        val displayName = it.optString("displayName")
                        dialogsUserName.text = displayName
                        SessionStore.saveSession(this, SessionStore.getCookie(this), it.optString("id"), displayName)
                    }
                    allLoadedRows.clear()
                    allLoadedRows.addAll(rows)
                    applyFilter()
                    
                    if (firstLoad) {
                        payload.optJSONObject("selectedDialog")?.let {
                            openChat(it.optStringClean("publicId"), it.optStringClean("title"), it.optStringClean("subtitle"), 0)
                        }
                    }
                }
            } catch (error: ApiClient.ApiException) {
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    if (error.statusCode == 401) {
                        SessionStore.clear(this)
                        startActivity(Intent(this, AuthActivity::class.java).apply {
                            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                        })
                        finish()
                    } else {
                        dialogsStatus.text = error.message
                    }
                }
            } catch (error: Exception) {
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsStatus.text = error.message ?: "Не удалось загрузить чаты."
                }
            }
        }
    }

    private fun searchUsers(query: String) {
        dialogsStatus.text = "Ищем…"
        dialogsLoader.visibility = View.VISIBLE
        executor.execute {
            try {
                val users = ApiClient.searchUsers(this, query)
                val rows = mutableListOf<DialogsAdapter.RowItem>()
                repeat(users.length()) { index ->
                    rows += DialogsAdapter.RowItem(true, null, SearchUserItem.fromJson(users.optJSONObject(index)))
                }
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    allLoadedRows.clear()
                    allLoadedRows.addAll(rows)
                    applyFilter()
                    dialogsStatus.text = if (rows.isEmpty()) "Ничего не найдено." else "Найдено: ${rows.size}"
                }
            } catch (error: Exception) {
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsStatus.text = error.message ?: "Поиск не удался."
                }
            }
        }
    }

    private fun showUserOptionsDialog(userId: String, userName: String) {
        val options = arrayOf("💬 Открыть обычный чат", "🔒 Создать секретный чат", "➕ Добавить в новую группу")
        android.app.AlertDialog.Builder(this)
            .setTitle(userName)
            .setItems(options) { _, which ->
                when (which) {
                    0 -> openUserDialog(userId)
                    1 -> openSecureUserDialog(userId)
                    2 -> addUserToPendingGroup(userId, userName)
                }
            }
            .show()
    }

    private fun openUserDialog(userId: String) {
        dialogsStatus.text = "Открываем чат…"
        dialogsLoader.visibility = View.VISIBLE
        executor.execute {
            try {
                val dialog = ApiClient.createDirectDialog(this, userId).optJSONObject("dialog")
                    ?: throw RuntimeException("Чат не найден.")
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsSearch.setText("")
                    openChat(dialog.optStringClean("publicId"), dialog.optStringClean("title"), dialog.optStringClean("subtitle"), 0)
                }
            } catch (error: Exception) {
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsStatus.text = error.message ?: "Не удалось открыть чат."
                }
            }
        }
    }

    private fun openSecureUserDialog(userId: String) {
        dialogsStatus.text = "Создаем секретный чат…"
        dialogsLoader.visibility = View.VISIBLE
        executor.execute {
            try {
                val dialog = ApiClient.createSecureDialog(this, userId).optJSONObject("dialog")
                    ?: throw RuntimeException("Секретный чат не создан.")
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsSearch.setText("")
                    openChat(dialog.optStringClean("publicId"), dialog.optStringClean("title"), dialog.optStringClean("subtitle"), 0)
                }
            } catch (error: Exception) {
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsStatus.text = error.message ?: "Не удалось создать секретный чат."
                }
            }
        }
    }

    private fun addUserToPendingGroup(userId: String, userName: String) {
        if (pendingGroupUserIds.contains(userId)) {
            toast("Пользователь уже добавлен.")
            return
        }
        pendingGroupUserIds.add(userId)
        pendingGroupUserNames.add(userName)
        toast("Добавлен: $userName")
    }

    private fun showCreateGroupDialog() {
        val input = EditText(this).apply {
            hint = "Название группы"
            setSingleLine(true)
        }
        android.app.AlertDialog.Builder(this)
            .setTitle("Создать группу")
            .setView(input)
            .setPositiveButton("Создать") { _, _ ->
                val title = input.text.toString().trim()
                if (title.isEmpty()) {
                    toast("Укажите название.")
                    return@setPositiveButton
                }
                createGroup(title)
            }
            .setNegativeButton("Отмена", null)
            .show()
    }

    private fun createGroup(title: String) {
        dialogsStatus.text = "Создаем группу…"
        dialogsLoader.visibility = View.VISIBLE
        executor.execute {
            try {
                val dialog = ApiClient.createGroupDialog(this, title, pendingGroupUserIds).optJSONObject("dialog")
                    ?: throw RuntimeException("Группа не создана.")
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsSearch.setText("")
                    pendingGroupUserIds.clear()
                    pendingGroupUserNames.clear()
                    openChat(dialog.optStringClean("publicId"), dialog.optStringClean("title"), dialog.optStringClean("subtitle"), 0)
                }
            } catch (error: Exception) {
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsStatus.text = error.message ?: "Не удалось создать группу."
                }
            }
        }
    }

    private fun openChat(publicId: String, title: String, subtitle: String, unread: Int) {
        dialogsLoader.visibility = View.GONE
        if (isTablet) {
            activeChatViewBinder?.release()
            tabletChatContainer.removeAllViews()
            
            val chatView = LayoutInflater.from(this).inflate(R.layout.activity_chat, tabletChatContainer, false)
            tabletChatContainer.addView(chatView)
            
            activeChatViewBinder = ChatViewBinder(this, chatView, publicId, title, subtitle, unread, isTablet = true)
            RealtimeClient.addListener(activeChatViewBinder!!)
        } else {
            startActivity(Intent(this, ChatActivity::class.java).apply {
                putExtra("publicId", publicId)
                putExtra("title", title)
                putExtra("subtitle", subtitle)
                putExtra("unreadCount", unread)
            })
            overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.fade_out)
        }
    }

    private fun toast(message: String) = Toast.makeText(this, message, Toast.LENGTH_SHORT).show()

    override fun onDestroy() {
        activeChatViewBinder?.release()
        handler.removeCallbacksAndMessages(null)
        executor.shutdownNow()
        super.onDestroy()
    }

    override fun onRealtimeEvent(type: String, payload: org.json.JSONObject) {
        activeChatViewBinder?.onRealtimeEvent(type, payload)
        when (type) {
            "message_created", "presence_snapshot", "user_presence", "dialog_typing" -> {
                if (dialogsSearch.text.toString().trim().isEmpty()) {
                    loadDialogs(false)
                } else {
                    adapter.notifyDataSetChanged()
                }
            }
            "call_invite" -> dialogsStatus.text = "Входящий звонок…"
        }
    }
}
