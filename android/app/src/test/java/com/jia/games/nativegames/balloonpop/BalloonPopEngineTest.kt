package com.jia.games.nativegames.balloonpop

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.random.Random

class BalloonPopEngineTest {
    private val engine = BalloonPopEngine(Random(42), spawnChance = 0f)
    private val board = BalloonPopState(width = 1000f, height = 2000f)
    private val balloon = Balloon(id = 1, x = 500f, y = 1000f, radius = 100f, speed = 400f, colorIndex = 0)

    @Test
    fun `nothing moves before the screen size is known`() {
        val state = BalloonPopState(balloons = listOf(balloon))
        assertSame(state, engine.step(state, 1f))
    }

    @Test
    fun `balloons float up by speed times time`() {
        val next = engine.step(board.copy(balloons = listOf(balloon)), 0.5f)
        assertEquals(800f, next.balloons.single().y)
    }

    @Test
    fun `balloons leaving the top count as missed`() {
        val high = balloon.copy(y = 50f)
        val next = engine.step(board.copy(balloons = listOf(high)), 1f)
        assertTrue(next.balloons.isEmpty())
        assertEquals(1, next.missed)
    }

    @Test
    fun `tapping a balloon pops it and scores`() {
        val next = engine.tap(board.copy(balloons = listOf(balloon)), 540f, 1030f)
        assertTrue(next.balloons.isEmpty())
        assertEquals(1, next.score)
    }

    @Test
    fun `tapping empty sky changes nothing`() {
        val state = board.copy(balloons = listOf(balloon))
        assertSame(state, engine.tap(state, 10f, 10f))
    }

    @Test
    fun `spawned balloons start below the screen and inside its width`() {
        var state = board
        repeat(20) { state = engine.spawn(state) }
        assertEquals(20, state.balloons.map { it.id }.distinct().size)
        state.balloons.forEach { b ->
            assertTrue(b.y > board.height)
            assertTrue(b.x - b.radius >= 0f && b.x + b.radius <= board.width)
            assertTrue(b.colorIndex in 0 until BalloonPopEngine.COLOR_COUNT)
        }
    }

    @Test
    fun `no more than the maximum balloons are spawned`() {
        val always = BalloonPopEngine(Random(1), maxBalloons = 3, spawnChance = 1f)
        var state = board
        repeat(10) { state = always.step(state, 0f) }
        assertEquals(3, state.balloons.size)
    }
}
