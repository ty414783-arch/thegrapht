package su.thegrapht.app

import android.content.Context
import android.graphics.Canvas
import android.graphics.Path
import android.graphics.RectF
import android.util.AttributeSet
import android.widget.ImageView

class RoundedCornerImageView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : ImageView(context, attrs, defStyleAttr) {

    private val path = Path()
    private val rect = RectF()
    var cornerRadius: Float = 12f * context.resources.displayMetrics.density

    override fun onDraw(canvas: Canvas) {
        path.reset()
        rect.set(0f, 0f, width.toFloat(), height.toFloat())
        path.addRoundRect(rect, cornerRadius, cornerRadius, Path.Direction.CW)
        canvas.save()
        canvas.clipPath(path)
        super.onDraw(canvas)
        canvas.restore()
    }
}
