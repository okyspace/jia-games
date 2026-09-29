package com.jia.games.nativegames.balloonpop

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/** Holds the game state (UDF): the screen sends events in, and draws [uiState]. */
class BalloonPopViewModel(private val engine: BalloonPopEngine) : ViewModel() {

    private val _uiState = MutableStateFlow(BalloonPopState())
    val uiState: StateFlow<BalloonPopState> = _uiState.asStateFlow()

    fun reset() = _uiState.update { BalloonPopState(width = it.width, height = it.height) }

    fun onSizeChanged(width: Float, height: Float) = _uiState.update { engine.resize(it, width, height) }

    fun onFrame(dtSeconds: Float) = _uiState.update { engine.step(it, dtSeconds) }

    fun onTap(x: Float, y: Float) = _uiState.update { engine.tap(it, x, y) }

    companion object {
        val Factory = viewModelFactory {
            initializer { BalloonPopViewModel(BalloonPopEngine()) }
        }
    }
}
