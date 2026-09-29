package com.jia.games.nativegames.balloonpop

import kotlin.random.Random

data class Balloon(
    val id: Long,
    val x: Float,
    val y: Float,
    val radius: Float,
    val speed: Float,
    val colorIndex: Int,
)

data class BalloonPopState(
    val width: Float = 0f,
    val height: Float = 0f,
    val balloons: List<Balloon> = emptyList(),
    val score: Int = 0,
    val missed: Int = 0,
    val nextId: Long = 0,
)

/** Balloon Pop game rules as pure functions over [BalloonPopState] (no Android, unit tested). */
class BalloonPopEngine(
    private val random: Random = Random.Default,
    private val maxBalloons: Int = MAX_BALLOONS,
    private val spawnChance: Float = SPAWN_CHANCE_PER_FRAME,
) {
    fun resize(state: BalloonPopState, width: Float, height: Float): BalloonPopState =
        state.copy(width = width, height = height)

    /** Moves balloons up by [dtSeconds]; balloons that float off the top count as missed. */
    fun step(state: BalloonPopState, dtSeconds: Float): BalloonPopState {
        if (state.width <= 0f || state.height <= 0f) return state
        val moved = state.balloons.map { it.copy(y = it.y - it.speed * dtSeconds) }
        val (flying, escaped) = moved.partition { it.y + it.radius >= 0f }
        val next = state.copy(balloons = flying, missed = state.missed + escaped.size)
        return if (flying.size < maxBalloons && random.nextFloat() < spawnChance) spawn(next) else next
    }

    /** Adds a balloon just below the bottom edge. */
    fun spawn(state: BalloonPopState): BalloonPopState {
        val radius = state.width * (MIN_RADIUS + random.nextFloat() * RADIUS_RANGE)
        val balloon = Balloon(
            id = state.nextId,
            x = radius + random.nextFloat() * (state.width - 2 * radius),
            y = state.height + radius,
            radius = radius,
            speed = state.height * (MIN_SPEED + random.nextFloat() * SPEED_RANGE),
            colorIndex = random.nextInt(COLOR_COUNT),
        )
        return state.copy(balloons = state.balloons + balloon, nextId = state.nextId + 1)
    }

    /** Pops the top-most balloon under the finger, if any. */
    fun tap(state: BalloonPopState, x: Float, y: Float): BalloonPopState {
        val hit = state.balloons.lastOrNull { b ->
            val dx = x - b.x
            val dy = y - b.y
            dx * dx + dy * dy <= b.radius * b.radius
        } ?: return state
        return state.copy(balloons = state.balloons - hit, score = state.score + 1)
    }

    companion object {
        const val COLOR_COUNT = 5
        const val MAX_BALLOONS = 6
        const val SPAWN_CHANCE_PER_FRAME = 0.04f
        private const val MIN_RADIUS = 0.07f // fraction of the screen width
        private const val RADIUS_RANGE = 0.05f
        private const val MIN_SPEED = 0.12f // fraction of the screen height per second
        private const val SPEED_RANGE = 0.12f
    }
}
