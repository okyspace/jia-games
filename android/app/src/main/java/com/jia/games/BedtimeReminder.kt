package com.jia.games

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import java.util.Calendar

/**
 * Weekday 8:30pm bedtime-routine notification (pack bag, brush teeth, shower), shown even
 * when the app is closed. The in-app version lives in web/js/wellbeing.js - keep times in sync.
 */
object BedtimeReminder {
    const val HOUR = 20
    const val MINUTE = 30
    private val DAYS = setOf(
        Calendar.MONDAY, Calendar.TUESDAY, Calendar.WEDNESDAY, Calendar.THURSDAY, Calendar.FRIDAY,
    )
    private const val CHANNEL_ID = "bedtime"
    private const val NOTIFICATION_ID = 830
    private const val WINDOW_MILLIS = 5 * 60 * 1000L

    /** Schedules the next reminder. Safe to call often; it replaces the pending one. */
    fun schedule(context: Context) {
        val alarms = context.getSystemService(AlarmManager::class.java) ?: return
        val next = nextTrigger(Calendar.getInstance())
        // A small window instead of an exact alarm: no special permission needed.
        alarms.setWindow(AlarmManager.RTC_WAKEUP, next, WINDOW_MILLIS, alarmIntent(context))
    }

    fun nextTrigger(now: Calendar): Long {
        val candidate = (now.clone() as Calendar).apply {
            set(Calendar.HOUR_OF_DAY, HOUR)
            set(Calendar.MINUTE, MINUTE)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        repeat(8) {
            if (candidate.after(now) && candidate.get(Calendar.DAY_OF_WEEK) in DAYS) return candidate.timeInMillis
            candidate.add(Calendar.DAY_OF_YEAR, 1)
        }
        return candidate.timeInMillis
    }

    private fun alarmIntent(context: Context): PendingIntent = PendingIntent.getBroadcast(
        context,
        0,
        Intent(context, BedtimeReceiver::class.java),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

    @SuppressLint("MissingPermission") // POST_NOTIFICATIONS is checked at the top
    fun show(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        val manager = context.getSystemService(NotificationManager::class.java) ?: return
        manager.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Bedtime routine", NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = "Weekday evening reminder to get ready for tomorrow"
            },
        )
        val open = PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val text = "🎒 Pack your school bag · 🪥 Brush your teeth · 🚿 Shower if you haven't yet"
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_moon)
            .setContentTitle("🌙 It's 8:30pm! Time to get ready for tomorrow")
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
    }
}

/** Fires at bedtime (and after a reboot) to show the reminder and schedule the next one. */
class BedtimeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) {
            BedtimeReminder.show(context)
        }
        BedtimeReminder.schedule(context)
    }
}
