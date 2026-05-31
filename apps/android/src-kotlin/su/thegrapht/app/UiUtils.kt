package su.thegrapht.app

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.util.TypedValue

object UiUtils {
    fun dp(context: Context, value: Int): Int =
        TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            value.toFloat(),
            context.resources.displayMetrics
        ).toInt()

    fun buildAvatarBackground(seed: String?): GradientDrawable {
        val palette = intArrayOf(
            0xFF6F63F6.toInt(), 0xFF5D8EFF.toInt(),
            0xFFFF8D5E.toInt(), 0xFFF35AD1.toInt(),
            0xFF48A8FF.toInt(), 0xFF57D96A.toInt(),
            0xFFFFB84D.toInt(), 0xFF7A82FF.toInt()
        )
        val hash = kotlin.math.abs(seed?.hashCode() ?: 0)
        val start = palette[hash % palette.size]
        val end = palette[(hash + 3) % palette.size]
        return GradientDrawable(GradientDrawable.Orientation.TL_BR, intArrayOf(start, end)).apply {
            setCornerRadius(999f)
        }
    }

    fun initial(text: String?): String = if (text.isNullOrBlank()) "?" else text.trim().take(1).toUpperCase()

    fun getDistinctColor(seed: String?): Int {
        val colors = intArrayOf(
            0xFF3498DB.toInt(), // Blue
            0xFF2ECC71.toInt(), // Green
            0xFFE67E22.toInt(), // Orange
            0xFFE74C3C.toInt(), // Red
            0xFF9B59B6.toInt(), // Purple
            0xFF1ABC9C.toInt(), // Turquoise
            0xFFF1C40F.toInt(), // Yellow
            0xFFE84393.toInt()  // Pink
        )
        val hash = kotlin.math.abs(seed?.hashCode() ?: 0)
        return colors[hash % colors.size]
    }
}
