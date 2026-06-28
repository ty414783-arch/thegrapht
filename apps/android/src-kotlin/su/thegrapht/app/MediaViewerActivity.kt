package su.thegrapht.app

import android.app.Activity
import android.graphics.Matrix
import android.graphics.PointF
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.View
import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView

class MediaViewerActivity : Activity() {

    class ZoomableTouchListener(private val imageView: ImageView) : View.OnTouchListener {
        private val matrix = Matrix()
        private val savedMatrix = Matrix()
        private var mode = 0 // 0 = NONE, 1 = DRAG, 2 = ZOOM
        private val start = PointF()
        private val mid = PointF()
        private var oldDist = 1f
        private var isInitialized = false

        private fun initMatrix() {
            val drawable = imageView.drawable ?: return
            val viewWidth = imageView.width.toFloat()
            val viewHeight = imageView.height.toFloat()
            if (viewWidth == 0f || viewHeight == 0f) return

            val drawableWidth = drawable.intrinsicWidth.toFloat()
            val drawableHeight = drawable.intrinsicHeight.toFloat()

            val scale: Float
            val dx: Float
            val dy: Float

            if (drawableWidth * viewHeight > viewWidth * drawableHeight) {
                scale = viewWidth / drawableWidth
                dx = 0f
                dy = (viewHeight - drawableHeight * scale) * 0.5f
            } else {
                scale = viewHeight / drawableHeight
                dx = (viewWidth - drawableWidth * scale) * 0.5f
                dy = 0f
            }

            matrix.setScale(scale, scale)
            matrix.postTranslate(dx, dy)
            imageView.imageMatrix = matrix
            isInitialized = true
        }

        override fun onTouch(v: View, event: MotionEvent): Boolean {
            if (!isInitialized) {
                initMatrix()
            }
            imageView.scaleType = ImageView.ScaleType.MATRIX

            val scaleDetector = ScaleGestureDetector(v.context, object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
                override fun onScale(detector: ScaleGestureDetector): Boolean {
                    val scaleFactor = detector.scaleFactor
                    matrix.postScale(scaleFactor, scaleFactor, detector.focusX, detector.focusY)
                    imageView.imageMatrix = matrix
                    return true
                }
            })

            scaleDetector.onTouchEvent(event)

            val curr = PointF(event.x, event.y)
            when (event.action and MotionEvent.ACTION_MASK) {
                MotionEvent.ACTION_DOWN -> {
                    savedMatrix.set(matrix)
                    start.set(event.x, event.y)
                    mode = 1 // DRAG
                }
                MotionEvent.ACTION_POINTER_DOWN -> {
                    oldDist = spacing(event)
                    if (oldDist > 10f) {
                        savedMatrix.set(matrix)
                        midPoint(mid, event)
                        mode = 2 // ZOOM
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    mode = 0
                }
                MotionEvent.ACTION_MOVE -> {
                    if (mode == 1) {
                        matrix.set(savedMatrix)
                        matrix.postTranslate(event.x - start.x, event.y - start.y)
                        imageView.imageMatrix = matrix
                    }
                }
            }
            return true
        }

        private fun spacing(event: MotionEvent): Float {
            if (event.pointerCount < 2) return 0f
            val x = event.getX(0) - event.getX(1)
            val y = event.getY(0) - event.getY(1)
            return kotlin.math.sqrt(x * x + y * y)
        }

        private fun midPoint(point: PointF, event: MotionEvent) {
            if (event.pointerCount < 2) return
            val x = event.getX(0) + event.getX(1)
            val y = event.getY(0) + event.getY(1)
            point.set(x / 2f, y / 2f)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_media_viewer)

        val imageUrl = intent.getStringExtra("imageUrl")
        val senderName = intent.getStringExtra("senderName").orEmpty()
        val createdAt = intent.getStringExtra("createdAt").orEmpty()
        val avatarUrl = intent.getStringExtra("senderAvatarUrl")

        val viewerAvatar = findViewById(R.id.viewerAvatar) as TextView
        val viewerAvatarImage = findViewById(R.id.viewerAvatarImage) as su.thegrapht.app.CircleImageView
        val viewerTitle = findViewById(R.id.viewerTitle) as TextView
        val viewerSubtitle = findViewById(R.id.viewerSubtitle) as TextView
        val viewerImage = findViewById(R.id.viewerImage) as ImageView

        viewerAvatar.text = UiUtils.initial(senderName)
        viewerAvatar.background = UiUtils.buildAvatarBackground(senderName)

        if (!avatarUrl.isNullOrBlank() && avatarUrl != "null") {
            viewerAvatarImage.visibility = View.VISIBLE
            ImageLoader.loadInto(this, avatarUrl, viewerAvatarImage)
        } else {
            viewerAvatarImage.visibility = View.GONE
        }

        viewerTitle.text = senderName.ifBlank { "TheGrapht" }
        viewerSubtitle.text = createdAt

        ImageLoader.loadInto(this, imageUrl, viewerImage)
        viewerImage.setOnTouchListener(ZoomableTouchListener(viewerImage))

        (findViewById(R.id.viewerClose) as TextView).setOnClickListener { closeViewer() }
        findViewById<View>(android.R.id.content).setOnClickListener { closeViewer() }
        viewerImage.setOnClickListener { }
    }

    private fun closeViewer() {
        finish()
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }
}
