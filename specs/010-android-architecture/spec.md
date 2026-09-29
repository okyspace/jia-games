# Feature Specification: Android code aligned with Google's app architecture guide

**Feature Branch**: `010-android-architecture`

**Created**: 2026-09-29

**Status**: Implemented (ideation), verified by CI

**Input**: User description: "Refer to Google's architecture guide to see if the Android part aligns to industry standards. If not, refactor and scan. Put the standards used in CLAUDE.md."

**Objectives served**: supports all (maintainable, safe foundation for native features).

## Review against the guide (before → after)

Sources: https://developer.android.com/topic/architecture and /recommendations (checked 2026-09-29).

| Recommendation (Google) | Before | After |
| --- | --- | --- |
| Clearly defined data layer; repositories even for one data source | `JiaBridge` wrote to MediaStore directly | `data/DeviceFilesRepository` → `SharedStorageDataSource` (`MediaStoreDataSource`) |
| Coroutines and flows between layers | Blocking I/O on the JS bridge thread | `suspend` repository functions, injected I/O dispatcher, `lifecycleScope` in the bridge |
| UDF, AAC ViewModels, `uiState` as `StateFlow` | None; game state inside a custom View | `MainViewModel`, `BalloonPopViewModel` expose `StateFlow` UI state and take events |
| ViewModels independent of lifecycle, no `AndroidViewModel` | n/a | Plain `ViewModel`s with constructor dependencies, created by `viewModelFactory` |
| Lifecycle-aware collection, no lifecycle overrides | `onPause`/`onResume`/`onDestroy` overrides | `collectAsStateWithLifecycle`, `LifecycleResumeEffect`, `DisposableEffect` |
| Single-activity app | Native games were separate activities | One `MainActivity`; native games are composables shown by `JiaApp` |
| Jetpack Compose | Custom `View` | Compose (`BalloonPopScreen`, `JiaApp`); web tabs stay in a WebView (constitution IV) |
| Dependency injection (manual for small apps, Hilt for complex) | Singletons | `AppContainer` in `JiaGamesApp`, constructor injection |
| Unit tests for ViewModels, repositories; prefer fakes | None | 24 JVM unit tests with a fake data source |
| WebView bridge security (Android WebView guidance) | `addJavascriptInterface` | `WebViewCompat.addWebMessageListener` limited to the app's origin |

## Requirements

- **FR-001**: Behaviour for kids is unchanged (games, drawing save, report, native Balloon Pop, reminders, back button).
- **FR-002**: The web ↔ native protocol is asynchronous JSON messages (`web/js/native.js` ↔ `ui/web/WebAppBridge.kt`), with browser fallbacks.
- **FR-003**: CI runs Android Lint, detekt, unit tests and CodeQL; all must pass.
- **FR-004**: The standards are written down in CLAUDE.md "Android standards".

## Success Criteria

- **SC-001**: CI green on `ideation` with the new checks.
- **SC-002**: A new native game can be added following `docs/ADDING_GAMES.md` without touching `MainActivity`.

## Assumptions

- Hilt is not added yet (one real screen); revisit when native screens grow.
- Navigation library not needed while native content is one overlay at a time.
