package com.jia.games

import android.app.Activity
import com.jia.games.nativegames.BalloonPopActivity

/**
 * Native (Kotlin) games the Games tab can launch.
 *
 * To add one:
 *  1. Create an Activity in the `nativegames` package.
 *  2. Declare it in AndroidManifest.xml.
 *  3. Add it to [registry] below.
 *  4. Add an entry with "type": "native" and a matching "nativeId" to web/games/games.json.
 */
object NativeGames {
    val registry: Map<String, Class<out Activity>> = mapOf(
        "balloon-pop" to BalloonPopActivity::class.java,
    )
}
