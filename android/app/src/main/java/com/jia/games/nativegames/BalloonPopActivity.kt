package com.jia.games.nativegames

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import androidx.activity.ComponentActivity
import kotlin.random.Random

/**
 * Sample native game: tap the balloons before they float away.
 * It shows how a game written in Kotlin plugs into the Games tab (see NativeGames.kt).
 */
class BalloonPopActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(BalloonView(this))
    }
}

private class Balloon(var x: Float, var y: Float, val radius: Float, val speed: Float, val color: Int)

private class BalloonView(context: Context) : View(context) {
    private val colors = intArrayOf(
        Color.parseColor("#FF6B6B"), Color.parseColor("#FFD23F"), Color.parseColor("#4ECDC4"),
        Color.parseColor("#A78BFA"), Color.parseColor("#FF8C42"),
    )
    private val balloons = mutableListOf<Balloon>()
    private val fill = Paint(Paint.ANTI_ALIAS_FLAG)
    private val outline = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 6f
        color = Color.parseColor("#2B2D42")
    }
    private val text = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#2B2D42")
        textSize = 64f
        isFakeBoldText = true
    }
    private var score = 0
    private var missed = 0
    private var lastFrame = 0L

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawColor(Color.parseColor("#BDE8FF"))

        val now = System.nanoTime()
        val dt = if (lastFrame == 0L) 0f else (now - lastFrame) / 1_000_000_000f
        lastFrame = now

        if (balloons.size < 6 && Random.nextFloat() < 0.04f && width > 0) {
            val r = width * (0.07f + Random.nextFloat() * 0.05f)
            balloons += Balloon(
                x = r + Random.nextFloat() * (width - 2 * r),
                y = height + r,
                radius = r,
                speed = height * (0.12f + Random.nextFloat() * 0.12f),
                color = colors.random(),
            )
        }

        val iterator = balloons.iterator()
        while (iterator.hasNext()) {
            val b = iterator.next()
            b.y -= b.speed * dt
            if (b.y + b.radius < 0) {
                iterator.remove()
                missed++
                continue
            }
            canvas.drawLine(b.x, b.y + b.radius, b.x, b.y + b.radius * 2.2f, outline)
            fill.color = b.color
            canvas.drawCircle(b.x, b.y, b.radius, fill)
            canvas.drawCircle(b.x, b.y, b.radius, outline)
        }

        canvas.drawText("🎈 $score   💨 $missed", 40f, 110f, text)
        postInvalidateOnAnimation()
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.actionMasked == MotionEvent.ACTION_DOWN) {
            val hit = balloons.lastOrNull { b ->
                val dx = event.x - b.x
                val dy = event.y - b.y
                dx * dx + dy * dy <= b.radius * b.radius
            }
            if (hit != null) {
                balloons.remove(hit)
                score++
            }
            return true
        }
        return super.onTouchEvent(event)
    }
}
