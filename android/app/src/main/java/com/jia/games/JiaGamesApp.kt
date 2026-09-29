package com.jia.games

import android.app.Application

/** Application class: owns the app-wide dependency container (manual DI). */
class JiaGamesApp : Application() {
    val container: AppContainer by lazy { AppContainer(this) }
}
