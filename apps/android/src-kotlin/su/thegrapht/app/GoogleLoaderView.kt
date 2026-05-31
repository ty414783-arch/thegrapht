package su.thegrapht.app

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import android.view.animation.Animation
import android.view.animation.Transformation

class GoogleLoaderView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = UiUtils.dp(context, 4).toFloat()
        strokeCap = Paint.Cap.ROUND
    }

    private val colors = intArrayOf(
        0xFF8F7CFF.toInt(), // Beautiful Indigo
        0xFF6F52FF.toInt(), // Deep Violet
        0xFF50D2C2.toInt(), // Mint Teal
        0xFFE84A5F.toInt()  // Sunset Coral
    )
    private var colorIndex = 0

    private val bounds = RectF()
    private var startAngle = 0f
    private var sweepAngle = 0f
    private var rotationAngle = 0f

    private val animator = object : Animation() {
        override fun applyTransformation(interpolatedTime: Float, t: Transformation?) {
            rotationAngle = interpolatedTime * 360f
            if (interpolatedTime < 0.5f) {
                val ratio = interpolatedTime / 0.5f
                sweepAngle = ratio * 280f
                startAngle = 0f
            } else {
                val ratio = (interpolatedTime - 0.5f) / 0.5f
                sweepAngle = 280f - (ratio * 280f)
                startAngle = ratio * 280f
            }
            invalidate()
        }
    }.apply {
        duration = 1600
        repeatCount = Animation.INFINITE
        setAnimationListener(object : Animation.AnimationListener {
            override fun onAnimationStart(animation: Animation?) {}
            override fun onAnimationRepeat(animation: Animation?) {
                colorIndex = (colorIndex + 1) % colors.size
            }
            override fun onAnimationEnd(animation: Animation?) {}
        })
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        startAnimation(animator)
    }

    override fun onDetachedFromWindow() {
        clearAnimation()
        super.onDetachedFromWindow()
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        val pad = paint.strokeWidth / 2f + UiUtils.dp(context, 2)
        bounds.set(pad, pad, w - pad, h - pad)
    }

    override fun onDraw(canvas: Canvas) {
        paint.color = colors[colorIndex]
        canvas.save()
        canvas.rotate(rotationAngle, width / 2f, height / 2f)
        canvas.drawArc(bounds, startAngle - 90f, maxOf(12f, sweepAngle), false, paint)
        canvas.restore()
    }
}
