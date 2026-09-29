# CLAUDE.md

Jia Games: an Android app (Kotlin WebView shell) whose UI is a no-build web app in `web/`.
Audience: kids aged 8 and up. Read `.specify/memory/constitution.md` before changing anything.

## Commands

- `npm run lint`: ESLint (must pass; CI runs it). Android Lint: `cd android && ./gradlew lintDebug`.
- `npm install`, then `npm test`: Playwright end-to-end tests (Chromium, Pixel 7 viewport, fake mic).
- `npm run serve`: serves `web/` at http://localhost:4173.
- `cd android && ./gradlew assembleDebug`: builds the APK (needs the Android SDK; CI builds it).

## Layout

- `web/js/tabs.js`, `web/games/games.json`, `web/challenges/challenges.json`: registries. Add content here, not in the shell.
- `web/js/store.js`: per-player data (`jia.u.<playerId>.*`). `web/js/profiles.js`: login and logo. `web/js/db.js`: IndexedDB blobs.
- `web/js/native.js`: the only place that talks to `window.JiaNative`. Always keep the browser fallback.
- `android/app/src/main/java/com/jia/games/`: `MainActivity`, `JiaBridge`, `NativeGames`, native games.
- `specs/NNN-*/`: Spec Kit specs. Update `tasks.md` when you finish tasks.

## Conventions

- Kid-friendly text, 52px+ touch targets, emoji cues, and the cartoon kit in `web/css/kit.css`.
- Build DOM with `el()` from `web/js/kit.js`. CSS custom properties passed in `style` are supported.
- Every user story gets a Playwright test. Use accessible names (aria-label) so tests and screen readers can find controls.
- New ideas go to the `ideation` branch first.
