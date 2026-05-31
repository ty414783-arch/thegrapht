package su.thegrapht.app

import android.content.Context

object SessionStore {
    private const val PREFS = "thegrapht_session"
    private const val KEY_COOKIE = "cookie"
    private const val KEY_USER_NAME = "user_name"
    private const val KEY_USER_ID = "user_id"

    private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun saveSession(context: Context, cookie: String?, userId: String?, userName: String?) {
        prefs(context).edit()
            .putString(KEY_COOKIE, cookie ?: "")
            .putString(KEY_USER_ID, userId ?: "")
            .putString(KEY_USER_NAME, userName ?: "")
            .apply()
    }

    fun getCookie(context: Context): String = prefs(context).getString(KEY_COOKIE, "") ?: ""
    fun getUserId(context: Context): String = prefs(context).getString(KEY_USER_ID, "") ?: ""
    fun getUserName(context: Context): String = prefs(context).getString(KEY_USER_NAME, "") ?: ""
    fun hasSession(context: Context): Boolean = getCookie(context).trim().isNotEmpty()
    fun clear(context: Context) = prefs(context).edit().clear().apply()
}
