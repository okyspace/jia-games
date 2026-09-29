package com.jia.games

import android.content.Context
import com.jia.games.data.DeviceFilesRepository
import com.jia.games.data.MediaStoreDataSource
import com.jia.games.nativegames.NativeGameRegistry
import com.jia.games.nativegames.NativeGames
import com.jia.games.reminders.BedtimeNotifier
import com.jia.games.reminders.BedtimeSchedule
import com.jia.games.reminders.BedtimeScheduler
import kotlinx.coroutines.Dispatchers

/**
 * Manual dependency injection container (Google recommends manual DI for small apps,
 * Hilt once there are many screens/ViewModels). One instance lives in [JiaGamesApp].
 */
class AppContainer(context: Context) {
    private val appContext = context.applicationContext

    val deviceFilesRepository = DeviceFilesRepository(
        storage = MediaStoreDataSource(appContext.contentResolver),
        ioDispatcher = Dispatchers.IO,
    )

    val bedtimeScheduler = BedtimeScheduler(appContext, BedtimeSchedule())
    val bedtimeNotifier = BedtimeNotifier(appContext)

    val nativeGames: NativeGameRegistry = NativeGames.registry
}
