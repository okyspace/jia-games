package com.jia.games.reminders

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.jia.games.JiaGamesApp

/** Fires at bedtime (and after a reboot): shows the reminder and schedules the next one. */
class BedtimeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val container = (context.applicationContext as JiaGamesApp).container
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) {
            container.bedtimeNotifier.show()
        }
        container.bedtimeScheduler.scheduleNext()
    }
}
