package com.jia.games.reminders

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.DayOfWeek
import java.time.LocalDateTime

class BedtimeScheduleTest {
    private val schedule = BedtimeSchedule()

    // 2026-09-30 is a Wednesday.
    @Test
    fun `before 8_30pm on a weekday fires the same evening`() {
        assertEquals(
            LocalDateTime.of(2026, 9, 30, 20, 30),
            schedule.nextAfter(LocalDateTime.of(2026, 9, 30, 10, 0)),
        )
    }

    @Test
    fun `after 8_30pm fires the next weekday`() {
        assertEquals(
            LocalDateTime.of(2026, 10, 1, 20, 30),
            schedule.nextAfter(LocalDateTime.of(2026, 9, 30, 20, 30)),
        )
    }

    @Test
    fun `friday night skips the weekend to monday`() {
        assertEquals(
            LocalDateTime.of(2026, 10, 5, 20, 30),
            schedule.nextAfter(LocalDateTime.of(2026, 10, 2, 21, 0)),
        )
        assertEquals(DayOfWeek.MONDAY, schedule.nextAfter(LocalDateTime.of(2026, 10, 3, 12, 0)).dayOfWeek)
    }

    @Test
    fun `school nights can be sunday to thursday`() {
        val schoolNights = BedtimeSchedule(
            days = setOf(
                DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
            ),
        )
        assertEquals(
            LocalDateTime.of(2026, 10, 4, 20, 30),
            schoolNights.nextAfter(LocalDateTime.of(2026, 10, 2, 21, 0)),
        )
    }
}
