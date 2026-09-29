# Feature Specification: Healthy-Use Reminders

**Feature Branch**: `009-wellbeing-reminders`

**Created**: 2026-09-29

**Status**: Implemented (ideation)

**Input**: User description: "Add a background task: remind the kid to sit properly every 20 mins; every 30 mins, take a break and look at trees, plants, stand up and walk — during the break pause the game with a countdown. After continuous 1 hour usage, remind the kid to take a break and go do other things. On weekdays at 8:30pm, remind the kid to pack bag, brush teeth, shower if not."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Posture reminder every 20 minutes (Priority: P1)

After every 20 minutes of use, a friendly banner says "Sit up straight! Back straight, feet on the floor, screen an arm away." It does not interrupt play and disappears after 20 s or on "OK".

### User Story 2 - Break every 30 minutes (Priority: P1)

After every 30 minutes of use, a full-screen break appears: look far away at trees and plants, stand up and stretch, walk around, drink water. A 2:30 countdown runs; "Back to fun" unlocks at 0:00. The open game is **paused**: its clock stops and key presses are ignored. The back button cannot skip the break; a grown-up (PIN) can end it early.

**Acceptance Scenarios**:

1. **Given** the maze is open, **When** 30 minutes of use pass, **Then** the break screen shows and the maze timer and mouse do not move until the break ends.

### User Story 2b - Things to do on the break (Priority: P1)

The 30-minute break is 2:30 long. The kid picks one: 🌳 move & look far (trees, plants, stand up, walk), 🧮 quick maths (5 multiple-choice + − ×), 🔬 science (5 questions), 🏛️ history ("did you know" cards), 🧘 relax (calm generated music and a breathing circle, eyes closed), or 👀 eye exercise. They can switch with "Pick something else". Every 2nd break starts with the guided eye exercise (blink, look far, near/far focus, eye rolls, follow the dot, palming).

**Acceptance Scenarios**:

1. **Given** a break, **Then** six activities are offered.
2. **Given** the 2nd break of a session, **Then** the eye exercise starts automatically at step 1 of 6.

### User Story 3 - Long break after 1 hour (Priority: P1)

After 60 minutes of continuous use, a longer break (5:00) suggests going to do other things: read a book, play outside, build or draw, help at home. It replaces the 30-minute break at the same moment.

### User Story 4 - Weekday bedtime routine at 8:30pm (Priority: P1)

Monday–Friday from 8:30pm, the app shows a checklist once per day: pack school bag, brush teeth, shower if not done yet. On Android, a notification with the same message is posted at 8:30pm even when the app is closed.

### Edge Cases

- Only time with the app on screen counts. Being away 10+ minutes starts a new session (counters reset).
- Time spent inside a native (Kotlin) game is not counted (the WebView is paused).
- On Android 13+ the notification needs the notification permission, asked on first launch; if denied, only the in-app reminder shows.
- The notification is rescheduled after a phone restart.

## Requirements *(mandatory)*

- **FR-001**: Reminder intervals and durations MUST be configurable in one place (`WELLBEING` in `web/js/wellbeing.js`).
- **FR-002**: Games MUST pause during breaks (`jia:pause`/`jia:resume` messages, `gameNow()` clock in `kit.js`).
- **FR-003**: The bedtime time/days MUST match between the web app and `BedtimeReminder.kt`.
- **FR-004**: No internet is needed.

## Success Criteria *(mandatory)*

- **SC-001**: In a 1-hour session the kid sees 2 posture banners (20, 40 min), 1 break (30 min) and 1 long break (60 min).

## Assumptions

- Break length 2:30 (requested 2–3 minutes); eye exercise every 2nd break ("occasionally"); long break 5 minutes; a new session after 10 minutes away. [NEEDS CLARIFICATION]
- "Weekdays" = Monday–Friday evenings. School nights are often Sunday–Thursday: change `days` if preferred. [NEEDS CLARIFICATION]
- Usage time is per device (not per kid).
- The long break can be ended after its countdown; it does not lock the app. [NEEDS CLARIFICATION: should it lock until a grown-up unlocks?]
