package com.jia.games.ui

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class MainViewModelTest {
    private val vm = MainViewModel(setOf("balloon-pop"))

    @Test
    fun `opening a known native game shows it with a new session`() {
        assertTrue(vm.openNativeGame("balloon-pop"))
        assertEquals("balloon-pop", vm.uiState.value.nativeGameId)
        assertEquals(1, vm.uiState.value.nativeGameSession)

        vm.closeNativeGame()
        assertNull(vm.uiState.value.nativeGameId)

        vm.openNativeGame("balloon-pop")
        assertEquals(2, vm.uiState.value.nativeGameSession)
    }

    @Test
    fun `unknown games are refused`() {
        assertFalse(vm.openNativeGame("space-race"))
        assertNull(vm.uiState.value.nativeGameId)
    }

    @Test
    fun `available games are listed`() {
        assertEquals(listOf("balloon-pop"), vm.availableNativeGames())
    }
}
