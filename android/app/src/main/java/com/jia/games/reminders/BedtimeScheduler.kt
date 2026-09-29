package com.jia.games.reminders

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.time.LocalDateTime
import java.time.ZoneId

/** Sets the next bedtime alarm. A small window instead of an exact alarm: no special permission. */
class BedtimeScheduler(
    private val context: Context,
    private val schedule: BedtimeSchedule,
    private val now: () -> LocalDateTime = LocalDateTime::now,
) {
    fun scheduleNext() {
        val alarms = context.getSystemService(AlarmManager::class.java) ?: return
        val next = schedule.nextAfter(now()).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
        alarms.setWindow(AlarmManager.RTC_WAKEUP, next, WINDOW_MILLIS, alarmIntent())
    }

    private fun alarmIntent(): PendingIntent = PendingIntent.getBroadcast(
        context,
        0,
        Intent(context, BedtimeReceiver::class.java),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

    private companion object {
        const val WINDOW_MILLIS = 5 * 60 * 1000L
    }
}
