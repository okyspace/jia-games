# CLAUDE.md

Jia Games: an Android app (Kotlin + Jetpack Compose shell hosting a WebView) whose main UI is a no-build web app in `web/`.
Audience: kids aged 8 and up. Read `.specify/memory/constitution.md` before changing anything.

## Commands

- `npm run lint`: ESLint (must pass; CI runs it).
- `cd android && ./gradlew lintDebug detekt testDebugUnitTest`: Android Lint, detekt, Kotlin unit tests (all must pass; CI runs them).
- `npm install`, then `npm test`: Playwright end-to-end tests (Chromium, Pixel 7 viewport, fake mic).
- `npm run serve`: serves `web/` at http://localhost:4173.
- `cd android && ./gradlew assembleDebug`: builds the APK (needs the Android SDK; CI builds it).

## Layout

- `web/js/tabs.js`, `web/games/games.json`, `web/challenges/challenges.json`: registries. Add content here, not in the shell.
- `web/js/store.js`: per-player data (`jia.u.<playerId>.*`). `web/js/profiles.js`: login and logo. `web/js/db.js`: IndexedDB blobs.
- `web/js/native.js`: the only place that talks to `window.JiaNative`. Always keep the browser fallback.
- `android/app/src/main/java/com/jia/games/`: `ui/` (MainActivity, MainViewModel, JiaApp, `web/` bridge), `data/` (repositories, data sources), `reminders/`, `nativegames/` (Compose games). See "Android standards" below.
- `specs/NNN-*/`: Spec Kit specs. Update `tasks.md` when you finish tasks.

## Conventions

- Kid-friendly text, 52px+ touch targets, emoji cues, and the cartoon kit in `web/css/kit.css`.
- Build DOM with `el()` from `web/js/kit.js`. CSS custom properties passed in `style` are supported.
- Every user story gets a Playwright test. Use accessible names (aria-label) so tests and screen readers can find controls.
- New ideas go to the `ideation` branch first.
- When a feature is added, add a row to the "Feature history" table in README.md (date, version, feature, spec, requested by, built by).

## Android standards

The Android code follows Google's **Guide to app architecture** and **Architecture recommendations**
(https://developer.android.com/topic/architecture, https://developer.android.com/topic/architecture/recommendations).
Checked 2026-09-29. Apply these to every Kotlin change:

- **Layers**: a UI layer (`ui/`, `nativegames/*Screen`, ViewModels) and a data layer (`data/`).
  The UI never touches a data source (MediaStore, files, prefs) directly: it goes through a
  **repository** (e.g. `DeviceFilesRepository`), even when there is only one data source.
  No domain layer yet (recommended only for big apps).
- **Coroutines and flows** between layers: repositories expose `suspend` functions and run I/O on an
  injected `CoroutineDispatcher` (never hard-code `Dispatchers.IO` inside a class).
- **UDF + ViewModels**: ViewModels (`androidx.lifecycle.ViewModel`, not `AndroidViewModel`) expose a
  single `uiState: StateFlow<…UiState>` and receive events through methods. No `Context`/`Activity`
  in ViewModels. Screen-level ViewModels only.
- **Compose** for all native UI; collect state with `collectAsStateWithLifecycle()`. Use
  `LifecycleResumeEffect` / `DisposableEffect` instead of overriding Activity lifecycle methods.
- **Single activity** (`ui/MainActivity`). Native games are composables shown by `JiaApp`, not
  separate activities.
- **Dependency injection**: constructor injection; manual DI via `AppContainer` (in `JiaGamesApp`),
  as Google recommends for small apps. Move to Hilt when there are many ViewModels/screens.
- **Pure logic is plain Kotlin** (e.g. `BalloonPopEngine`, `BedtimeSchedule`, `FileNames`) so it can be
  unit tested on the JVM.
- **Testing**: unit tests for every ViewModel, repository and engine in `android/app/src/test`;
  **prefer fakes to mocks** (see `FakeSharedStorage`).
- **WebView security**: web ↔ native messages use `WebViewCompat.addWebMessageListener` restricted to
  `https://appassets.androidplatform.net` (no `addJavascriptInterface`); only bundled assets load;
  file and content access are off.
- **Quality gates**: Android Lint (errors fail), detekt (`android/config/detekt.yml`), unit tests,
  and GitHub **CodeQL** (`security-and-quality`, Java/Kotlin + JavaScript) on pushes to `ideation`.

Justified exception: the kid-facing tabs, games and challenges stay in the **WebView web app**
(constitution principle IV), so they can be built and tested in a browser without a build step.
Only native games and platform features use Compose.
