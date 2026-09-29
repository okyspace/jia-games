package com.jia.games.nativegames.balloonpop

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

private val Sky = Color(0xFFBDE8FF)
private val Ink = Color(0xFF2B2D42)
private val Sun = Color(0xFFFFD23F)
private val BalloonColors = listOf(
    Color(0xFFFF6B6B), Color(0xFFFFD23F), Color(0xFF4ECDC4), Color(0xFFA78BFA), Color(0xFFFF8C42),
)
private const val NANOS_PER_SECOND = 1_000_000_000f
private const val STRING_LENGTH = 2.2f
private const val LINE_WIDTH = 6f

/** Sample native game: tap the balloons before they float away. */
@Composable
fun BalloonPopScreen(
    onExit: () -> Unit,
    viewModel: BalloonPopViewModel = viewModel(factory = BalloonPopViewModel.Factory),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(viewModel) {
        viewModel.reset()
        var last = withFrameNanos { it }
        while (true) {
            withFrameNanos { now ->
                viewModel.onFrame((now - last) / NANOS_PER_SECOND)
                last = now
            }
        }
    }
    BackHandler(onBack = onExit)

    Box(Modifier.fillMaxSize().background(Sky)) {
        Canvas(
            Modifier
                .fillMaxSize()
                .onSizeChanged { viewModel.onSizeChanged(it.width.toFloat(), it.height.toFloat()) }
                .pointerInput(viewModel) { detectTapGestures { viewModel.onTap(it.x, it.y) } },
        ) {
            state.balloons.forEach { b ->
                val center = Offset(b.x, b.y)
                drawLine(Ink, Offset(b.x, b.y + b.radius), Offset(b.x, b.y + b.radius * STRING_LENGTH), LINE_WIDTH)
                drawCircle(BalloonColors[b.colorIndex % BalloonColors.size], b.radius, center)
                drawCircle(Ink, b.radius, center, style = Stroke(LINE_WIDTH))
            }
        }
        Text(
            text = "🎈 ${state.score}   💨 ${state.missed}",
            color = Ink,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.align(Alignment.TopStart).safeDrawingPadding().padding(16.dp),
        )
        Button(
            onClick = onExit,
            colors = ButtonDefaults.buttonColors(containerColor = Sun, contentColor = Ink),
            modifier = Modifier.align(Alignment.TopEnd).safeDrawingPadding().padding(16.dp),
        ) {
            Text("⬅ Back", fontWeight = FontWeight.Bold)
        }
    }
}
