package com.jia.games.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.jia.games.JiaGamesApp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/**
 * UI state of the single activity: the web app is always there; a native game can be shown on top.
 * [nativeGameSession] changes on every launch so the game starts fresh.
 */
data class MainUiState(
    val nativeGameId: String? = null,
    val nativeGameSession: Int = 0,
)

class MainViewModel(private val nativeGameIds: Set<String>) : ViewModel() {

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    fun availableNativeGames(): List<String> = nativeGameIds.sorted()

    /** Returns false if this build has no native game with that id. */
    fun openNativeGame(id: String): Boolean {
        if (id !in nativeGameIds) return false
        _uiState.update { MainUiState(nativeGameId = id, nativeGameSession = it.nativeGameSession + 1) }
        return true
    }

    fun closeNativeGame() = _uiState.update { it.copy(nativeGameId = null) }

    companion object {
        val Factory: ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val app = this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as JiaGamesApp
                MainViewModel(app.container.nativeGames.ids)
            }
        }
    }
}
