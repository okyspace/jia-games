package com.jia.games.reminders

import java.time.DayOfWeek
import java.time.LocalDateTime
import java.time.LocalTime

/**
 * When the weekday bedtime-routine reminder fires (pure logic, unit tested).
 * Keep in sync with WELLBEING.bedtime in web/js/wellbeing.js.
 */
data class BedtimeSchedule(
    val time: LocalTime = DEFAULT_TIME,
    val days: Set<DayOfWeek> = WEEKDAYS,
) {
    /** The first reminder time strictly after [now]. */
    fun nextAfter(now: LocalDateTime): LocalDateTime {
        var candidate = now.toLocalDate().atTime(time)
        repeat(DAYS_TO_SEARCH) {
            if (candidate.isAfter(now) && candidate.dayOfWeek in days) return candidate
            candidate = candidate.plusDays(1)
        }
        error("BedtimeSchedule has no days")
    }

    companion object {
        val DEFAULT_TIME: LocalTime = LocalTime.of(20, 30)
        val WEEKDAYS: Set<DayOfWeek> = setOf(
            DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY,
        )
        private const val DAYS_TO_SEARCH = 8
    }
}
