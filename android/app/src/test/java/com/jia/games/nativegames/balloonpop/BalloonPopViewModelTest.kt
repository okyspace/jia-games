package com.jia.games.nativegames.balloonpop

import org.junit.Assert.assertEquals
import org.junit.Test
import kotlin.random.Random

class BalloonPopViewModelTest {
    private fun viewModel() = BalloonPopViewModel(BalloonPopEngine(Random(7), spawnChance = 1f))

    @Test
    fun `frames spawn balloons once the size is known`() {
        val vm = viewModel()
        vm.onFrame(0.016f)
        assertEquals(0, vm.uiState.value.balloons.size)

        vm.onSizeChanged(1000f, 2000f)
        vm.onFrame(0.016f)
        assertEquals(1, vm.uiState.value.balloons.size)
    }

    @Test
    fun `tap pops and reset starts over but keeps the size`() {
        val vm = viewModel()
        vm.onSizeChanged(1000f, 2000f)
        vm.onFrame(0f)
        val b = vm.uiState.value.balloons.single()
        vm.onTap(b.x, b.y)
        assertEquals(1, vm.uiState.value.score)

        vm.reset()
        assertEquals(BalloonPopState(width = 1000f, height = 2000f), vm.uiState.value)
    }
}
