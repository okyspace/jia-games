# Implementation Plan: App Shell

**Branch**: `001-app-shell` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

## Summary

A thin native Android shell (Kotlin `MainActivity` + WebView) hosts a no-build web app in `web/`.
The web app renders the header, tab bar and tabs from registries, opens games/challenges in a
full-screen iframe, and stores data locally (localStorage + IndexedDB). A JS bridge (`JiaNative`)
exposes native abilities (launch native games, save images/files) with browser fallbacks.

## Technical Context

**Language/Version**: Kotlin 2.0 (Android), JavaScript ES2022 modules

**Primary Dependencies**: AndroidX Activity, Core, WebKit (`WebViewAssetLoader`); no JS libraries

**Storage**: localStorage (JSON, keys `jia.*`, per-player keys `jia.u.<playerId>.*`), IndexedDB `jia-games` (drawings, recordings)

**Testing**: Playwright (Chromium, Pixel 7 emulation), `npm test`

**Target Platform**: Android 8.0+ (API 26), also any modern browser for development

**Project Type**: mobile-app (hybrid)

**Performance Goals**: Tab switch < 100 ms, drawing at 60 fps on mid-range phones

**Constraints**: Offline, no runtime CDN, secure context (served from `https://appassets.androidplatform.net`)

**Scale/Scope**: One family device, a few players, dozens of games/challenges

## Constitution Check

| Gate | Status |
| --- | --- |
| I. Kid-First Design: 52px buttons, emoji cues, friendly errors | ✅ |
| II. Offline-First & Private: bundled font/assets, no network permission | ✅ |
| III. Pluggable Content: `games.json`, `challenges.json`, `tabs.js`, `nativegames/NativeGames.kt` | ✅ |
| IV. Web Core, Native Shell: every bridge call has a fallback in `web/js/native.js` | ✅ |
| V. Tested User Journeys: `tests/shell.spec.js`, `tests/tabs.spec.js` | ✅ |
| VI. Grown-Ups in Control: PIN gate in `web/js/ui.js` | ✅ |

## Project Structure

```text
android/                         Gradle project (app module)
└── app/src/main/java/com/jia/games/
    ├── ui/MainActivity.kt       single activity: WebView host, mic permission, file picker, back button
    ├── (refactored in spec 010: ui/, data/, reminders/, nativegames/; see CLAUDE.md "Android standards")
    ├── ui/web/WebAppBridge.kt   window.JiaNative: native games, save image/text files
    └── nativegames/             registry + Compose native games (sample: balloonpop/)
web/                             the app UI (packaged as APK assets)
├── index.html, css/kit.css, css/app.css, fonts/
├── js/app.js                    shell bootstrap (login → header, tabs)
├── js/tabs.js                   TAB REGISTRY
├── js/tabs/*.js                 games, challenges, prizes, notes, draw, book
├── js/store.js, js/db.js        data
├── js/ui.js, js/launcher.js     sheets, PIN gate, full-screen page launcher
├── games/games.json             GAME REGISTRY (+ one folder per game)
└── challenges/challenges.json   CHALLENGE REGISTRY
tests/                           Playwright end-to-end tests
```

**Structure Decision**: Hybrid app. The web folder is referenced directly as the Android assets
source (`assets.srcDir("../../web")`), so there is no copy/build step.

## Complexity Tracking

None.
