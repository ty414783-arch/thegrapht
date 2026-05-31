package su.thegrapht.app

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent

object NotificationHelper {
    private fun manager(context: Context): NotificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun showIncomingMessage(context: Context, dialogPublicId: String, title: String, subtitle: String, preview: String) {
        val intent = Intent(context, ChatActivity::class.java).apply {
            putExtra("publicId", dialogPublicId)
            putExtra("title", title)
            putExtra("subtitle", subtitle)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            dialogPublicId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = Notification.Builder(context)
            .setSmallIcon(android.R.drawable.sym_action_chat)
            .setContentTitle(title)
            .setContentText(preview)
            .setStyle(Notification.BigTextStyle().bigText(preview))
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        manager(context).notify(dialogPublicId.hashCode(), notification)
    }

    fun showIncomingCall(context: Context, dialogPublicId: String, callerName: String) {
        val intent = Intent(context, ChatActivity::class.java).apply {
            putExtra("publicId", dialogPublicId)
            putExtra("title", callerName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            dialogPublicId.hashCode() + 7,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = Notification.Builder(context)
            .setSmallIcon(android.R.drawable.sym_call_incoming)
            .setContentTitle("Входящий звонок")
            .setContentText("Вам звонит $callerName")
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        manager(context).notify(dialogPublicId.hashCode() + 7, notification)
    }
}
