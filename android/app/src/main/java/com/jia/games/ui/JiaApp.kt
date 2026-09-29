package com.jia.games.ui

import android.view.ViewGroup
import android.webkit.WebView
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jia.games.nativegames.NativeGameRegistry

/**
 * Root composable of the single activity: the web app (tabs, web games, challenges) in a WebView,
 * with a native Compose game drawn on top when one is open.
 */
@Composable
fun JiaApp(viewModel: MainViewModel, webView: WebView, nativeGames: NativeGameRegistry) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val game = uiState.nativeGameId?.let { nativeGames[it] }
    val webVisible = game == null

    // The web app only counts play time (break reminders) while it is on screen.
    LifecycleResumeEffect(webView, webVisible) {
        if (webVisible) webView.onResume() else webView.onPause()
        onPauseOrDispose { webView.onPause() }
    }
    DisposableEffect(webView) {
        onDispose {
            (webView.parent as? ViewGroup)?.removeView(webView)
            webView.destroy()
        }
    }

    Box(Modifier.fillMaxSize()) {
        AndroidView(factory = { webView }, modifier = Modifier.fillMaxSize())
        if (game != null) {
            key(uiState.nativeGameSession) {
                game.content(viewModel::closeNativeGame)
            }
        }
    }
}
