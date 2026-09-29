# Implementation Plan: Healthy-Use Reminders

**Branch**: `009-wellbeing-reminders` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

## Summary

`web/js/wellbeing.js` ticks every second while the app is visible, adds up active seconds
(persisted in `jia.wellbeing`), and fires the highest-priority reminder when a 60/30/20-minute
boundary is crossed. Break screens post `jia:pause`/`jia:resume` to the open game page
(`launcher.postToPage`); games use `gameNow()` from `kit.js`, which excludes paused time and
blocks keys while paused. The bedtime check runs on the same tick. On Android,
`BedtimeReminder.kt` schedules a windowed `AlarmManager` alarm for the next weekday 20:30 and
posts a notification; `BedtimeReceiver` reschedules it after each alarm and after reboot.
`MainActivity` calls `webView.onPause()/onResume()` so the page's visibility follows the app.

## Technical Context

**Language/Version**: JavaScript ES modules; Kotlin

**Primary Dependencies**: AndroidX Core (`NotificationCompat`), `AlarmManager.setWindow` (no exact-alarm permission)

**Testing**: `tests/wellbeing.spec.js` and `tests/bedtime.spec.js` use Playwright's fake clock (`page.clock`) to jump 20/30/60 minutes and to 8:30pm on a Wednesday vs Saturday.

## Constitution Check

Kid-first (gentle wording, pictures, countdown) ✅ · Offline ✅ · Grown-ups in control (PIN to end a break) ✅ · Tested ✅

## Project Structure

```text
web/js/wellbeing.js           reminders, break screens, bedtime checklist, WELLBEING config
web/js/kit.js                 gameNow(), isPaused(), pause/resume message handling
web/js/launcher.js            postToPage()
android/.../BedtimeReminder.kt  alarm scheduling, notification, BedtimeReceiver
android/.../MainActivity.kt     schedule on launch, ask notification permission, WebView pause/resume
```
