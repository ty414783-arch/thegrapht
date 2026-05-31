package su.thegrapht.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ListView
import android.widget.TextView
import android.widget.Toast
import org.json.JSONArray
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

    // Premium horizontal scroller tabs
    private lateinit var tabAll: View
    private lateinit var tabAllText: TextView
    private lateinit var tabAllBadge: TextView

    private lateinit var tabGroups: View
    private lateinit var tabGroupsText: TextView
    private lateinit var tabGroupsBadge: TextView

    private lateinit var tabWork: View
    private lateinit var tabWorkText: TextView
    private lateinit var tabWorkBadge: TextView

    private lateinit var tabBots: View
    private lateinit var tabBotsText: TextView
    private lateinit var tabBotsBadge: TextView

    private var activeCategory = "all"
    private val allLoadedRows = mutableListOf<DialogsAdapter.RowItem>()

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
        dialogsLoader = findViewById(R.id.dialogsLoader)
        val logoutButton = findViewById(R.id.logoutButton) as Button
        val createGroupButton = findViewById(R.id.createGroupButton) as Button

        // Initialize category tabs
        tabAll = findViewById(R.id.tabAll)
        tabAllText = findViewById(R.id.tabAllText) as TextView
        tabAllBadge = findViewById(R.id.tabAllBadge) as TextView

        tabGroups = findViewById(R.id.tabGroups)
        tabGroupsText = findViewById(R.id.tabGroupsText) as TextView
        tabGroupsBadge = findViewById(R.id.tabGroupsBadge) as TextView

        tabWork = findViewById(R.id.tabWork)
        tabWorkText = findViewById(R.id.tabWorkText) as TextView
        tabWorkBadge = findViewById(R.id.tabWorkBadge) as TextView

        tabBots = findViewById(R.id.tabBots)
        tabBotsText = findViewById(R.id.tabBotsText) as TextView
        tabBotsBadge = findViewById(R.id.tabBotsBadge) as TextView

        tabAll.setOnClickListener { selectCategory("all") }
        tabGroups.setOnClickListener { selectCategory("groups") }
        tabWork.setOnClickListener { selectCategory("work") }
        tabBots.setOnClickListener { selectCategory("bots") }

        adapter = DialogsAdapter(this)
        dialogsList.adapter = adapter
        dialogsUserName.text = SessionStore.getUserName(this)
        dialogsStatus.text = "Загружаем чаты…"

        dialogsList.setOnItemClickListener { _, _, position, _ ->
            val item = currentRows[position]
            if (item.isSearchUser) {
                showUserOptionsDialog(item.user?.id.orEmpty(), item.user?.name.orEmpty())
            } else {
                openChat(item.dialog?.publicId.orEmpty(), item.dialog?.title.orEmpty(), item.dialog?.subtitle.orEmpty())
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
        
        updateTabsUI()
    }

    private fun selectCategory(category: String) {
        activeCategory = category
        updateTabsUI()
        applyFilter()
    }

    private fun updateTabsUI() {
        val activeBg = resources.getDrawable(R.drawable.bg_tab_active)
        val inactiveBg = resources.getDrawable(R.drawable.bg_tab_inactive)
        
        tabAll.background = if (activeCategory == "all") activeBg else inactiveBg
        tabAllText.setTextColor(if (activeCategory == "all") 0xFFFFFFFF.toInt() else 0xFF6E7C8B.toInt())
        tabAllText.setTypeface(null, if (activeCategory == "all") android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
        tabAllBadge.background = resources.getDrawable(if (activeCategory == "all") R.drawable.bg_tab_badge_active else R.drawable.bg_tab_badge_inactive)
        tabAllBadge.setTextColor(if (activeCategory == "all") 0xFF2E79C9.toInt() else 0xFF6E7C8B.toInt())

        tabGroups.background = if (activeCategory == "groups") activeBg else inactiveBg
        tabGroupsText.setTextColor(if (activeCategory == "groups") 0xFFFFFFFF.toInt() else 0xFF6E7C8B.toInt())
        tabGroupsText.setTypeface(null, if (activeCategory == "groups") android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
        tabGroupsBadge.background = resources.getDrawable(if (activeCategory == "groups") R.drawable.bg_tab_badge_active else R.drawable.bg_tab_badge_inactive)
        tabGroupsBadge.setTextColor(if (activeCategory == "groups") 0xFF2E79C9.toInt() else 0xFF6E7C8B.toInt())

        tabWork.background = if (activeCategory == "work") activeBg else inactiveBg
        tabWorkText.setTextColor(if (activeCategory == "work") 0xFFFFFFFF.toInt() else 0xFF6E7C8B.toInt())
        tabWorkText.setTypeface(null, if (activeCategory == "work") android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
        tabWorkBadge.background = resources.getDrawable(if (activeCategory == "work") R.drawable.bg_tab_badge_active else R.drawable.bg_tab_badge_inactive)
        tabWorkBadge.setTextColor(if (activeCategory == "work") 0xFF2E79C9.toInt() else 0xFF6E7C8B.toInt())

        tabBots.background = if (activeCategory == "bots") activeBg else inactiveBg
        tabBotsText.setTextColor(if (activeCategory == "bots") 0xFFFFFFFF.toInt() else 0xFF6E7C8B.toInt())
        tabBotsText.setTypeface(null, if (activeCategory == "bots") android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
        tabBotsBadge.background = resources.getDrawable(if (activeCategory == "bots") R.drawable.bg_tab_badge_active else R.drawable.bg_tab_badge_inactive)
        tabBotsBadge.setTextColor(if (activeCategory == "bots") 0xFF2E79C9.toInt() else 0xFF6E7C8B.toInt())
    }

    private fun applyFilter() {
        val filtered = when (activeCategory) {
            "all" -> allLoadedRows
            "groups" -> allLoadedRows.filter { !it.isSearchUser && it.dialog?.type == "group" }
            "work" -> allLoadedRows.filter { !it.isSearchUser && (it.dialog?.type == "saved" || it.dialog?.title?.contains("work", true) == true || it.dialog?.subtitle?.contains("work", true) == true) }
            "bots" -> allLoadedRows.filter { !it.isSearchUser && (it.dialog?.title?.contains("bot", true) == true || it.dialog?.subtitle?.contains("bot", true) == true) }
            else -> allLoadedRows
        }
        currentRows.clear()
        currentRows.addAll(filtered)
        adapter.setItems(filtered)
        dialogsStatus.text = if (filtered.isEmpty()) "Чатов пока нет." else ""
    }

    private fun updateTabBadges() {
        val allCount = allLoadedRows.size
        val groupsCount = allLoadedRows.filter { !it.isSearchUser && it.dialog?.type == "group" }.size
        val workCount = allLoadedRows.filter { !it.isSearchUser && (it.dialog?.type == "saved" || it.dialog?.title?.contains("work", true) == true || it.dialog?.subtitle?.contains("work", true) == true) }.size
        val botsCount = allLoadedRows.filter { !it.isSearchUser && (it.dialog?.title?.contains("bot", true) == true || it.dialog?.subtitle?.contains("bot", true) == true) }.size

        tabAllBadge.text = allCount.toString()
        tabGroupsBadge.text = groupsCount.toString()
        tabWorkBadge.text = workCount.toString()
        tabBotsBadge.text = botsCount.toString()
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
        if (firstLoad) {
            dialogsLoader.visibility = View.VISIBLE
        }
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
                    updateTabBadges()
                    applyFilter()
                    if (firstLoad) {
                        payload.optJSONObject("selectedDialog")?.let {
                            openChat(it.optString("publicId"), it.optString("title"), it.optString("subtitle"))
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
                    updateTabBadges()
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
                    1 -> openUserDialog(userId)
                    2 -> addUserToPendingGroup(userId, userName)
                }
            }
            .show()
    }

    private fun addUserToPendingGroup(userId: String, userName: String) {
        if (pendingGroupUserIds.contains(userId)) {
            toast("Пользователь уже добавлен.")
            return
        }
        pendingGroupUserIds.add(userId)
        pendingGroupUserNames.add(userName)
        toast("$userName добавлен к списку участников группы. Нажмите 'Группа' для создания.")
    }

    private fun showCreateGroupDialog() {
        if (pendingGroupUserIds.isEmpty()) {
            toast("Сначала найдите пользователей и добавьте их в группу через меню клика.")
            return
        }

        val container = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(dp(18), dp(10), dp(18), dp(10))
        }

        val membersLabel = android.widget.TextView(this).apply {
            text = "Участники: " + pendingGroupUserNames.joinToString(", ")
            setTextColor(0xFF2E79C9.toInt())
            setTextSize(14f)
        }

        val input = android.widget.EditText(this).apply {
            hint = "Название группы"
            setTextColor(0xFF1F1F1F.toInt())
            setHintTextColor(0xFF94A3B8.toInt())
        }

        container.addView(membersLabel)
        container.addView(input)

        android.app.AlertDialog.Builder(this)
            .setTitle("Новая группа")
            .setView(container)
            .setPositiveButton("Создать") { _, _ ->
                val title = input.text.toString().trim()
                if (title.isEmpty()) {
                    toast("Название группы не может быть пустым.")
                    return@setPositiveButton
                }
                createGroup(title, pendingGroupUserIds.toList())
            }
            .setNegativeButton("Отмена", null)
            .show()
    }

    private fun createGroup(title: String, memberIds: List<String>) {
        dialogsStatus.text = "Создаем группу..."
        dialogsLoader.visibility = View.VISIBLE
        executor.execute {
            try {
                val response = ApiClient.createGroupDialog(this, title, memberIds)
                val dialog = response.optJSONObject("dialog") ?: throw RuntimeException("Группа не создана.")
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    pendingGroupUserIds.clear()
                    pendingGroupUserNames.clear()
                    dialogsSearch.setText("")
                    openChat(dialog.optString("publicId"), dialog.optString("title"), dialog.optString("subtitle"))
                }
            } catch (error: Exception) {
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsStatus.text = error.message ?: "Не удалось создать группу."
                }
            }
        }
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
                    openChat(dialog.optString("publicId"), dialog.optString("title"), dialog.optString("subtitle"))
                }
            } catch (error: Exception) {
                runOnUiThread {
                    dialogsLoader.visibility = View.GONE
                    dialogsStatus.text = error.message ?: "Не удалось открыть чат."
                }
            }
        }
    }

    private fun openChat(publicId: String, title: String, subtitle: String) {
        dialogsLoader.visibility = View.GONE
        startActivity(Intent(this, ChatActivity::class.java).apply {
            putExtra("publicId", publicId)
            putExtra("title", title)
            putExtra("subtitle", subtitle)
        })
        overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.fade_out)
    }

    private fun dp(value: Int) = UiUtils.dp(this, value)

    private fun toast(message: String) = Toast.makeText(this, message, Toast.LENGTH_SHORT).show()

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        executor.shutdownNow()
        super.onDestroy()
    }

    override fun onRealtimeEvent(type: String, payload: org.json.JSONObject) {
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
