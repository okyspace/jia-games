package com.jia.games.nativegames

import androidx.compose.runtime.Composable
import com.jia.games.nativegames.balloonpop.BalloonPopScreen

/** A native (Kotlin + Jetpack Compose) game, shown full-screen on top of the web app. */
class NativeGame(
    val id: String,
    val content: @Composable (onExit: () -> Unit) -> Unit,
)

class NativeGameRegistry(games: List<NativeGame>) {
    private val byId = games.associateBy { it.id }

    val ids: Set<String> get() = byId.keys

    operator fun get(id: String): NativeGame? = byId[id]
}

/**
 * Native games the Games tab can launch. To add one:
 *  1. Create a package under `nativegames/` with an engine (pure Kotlin), a ViewModel and a
 *     `@Composable` screen (see `balloonpop/`).
 *  2. Add it to [registry] below.
 *  3. Add an entry with "type": "native" and a matching "nativeId" to web/games/games.json.
 */
object NativeGames {
    val registry = NativeGameRegistry(
        listOf(
            NativeGame("balloon-pop") { onExit -> BalloonPopScreen(onExit = onExit) },
        ),
    )
}
