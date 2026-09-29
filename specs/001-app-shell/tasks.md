---
description: "Tasks for the app shell"
---

# Tasks: App Shell

**Input**: `specs/001-app-shell/`

## Phase 1: Setup

- [x] T001 Create Gradle project `android/` (AGP 8.7, Kotlin 2.0, minSdk 26) with wrapper
- [x] T002 [P] Create `web/` with `index.html`, `css/kit.css`, `css/app.css`, bundled Fredoka font
- [x] T003 [P] Add Playwright config and `package.json` scripts (`npm test`, `npm run serve`)
- [x] T004 [P] Add CI workflow `.github/workflows/ci.yml` (web tests + debug APK)

## Phase 2: Foundational

- [x] T005 `MainActivity.kt`: WebView + `WebViewAssetLoader`, back button → `window.jia.handleBack()`
- [x] T006 `JiaBridge.kt` + `web/js/native.js` with browser fallbacks
- [x] T007 `web/js/kit.js` helpers (el, storage, sfx, confetti, overlay)
- [x] T008 `web/js/store.js` (stars ledger, challenge log, prizes, claims, notes, books, PIN) and `web/js/db.js` (IndexedDB)
- [x] T009 `web/js/ui.js` sheets, toast, confirm, grown-up PIN pad, celebration
- [x] T010 `web/js/tabs.js` registry + `web/js/app.js` header/tab bar

## Phase 3: US1 Browse and launch games 🎯 MVP

- [x] T011 [US1] `web/games/games.json` + `web/js/tabs/games.js` cards
- [x] T012 [US1] `web/js/launcher.js` full-screen iframe with Back bar
- [x] T013 [US1] `NativeGames.kt` registry + sample `BalloonPopActivity`
- [x] T014 [US1] Test: `tests/shell.spec.js`

## Phase 4: US2/US3 Stars and prizes

- [x] T015 [US2] Header star pill with bump animation on `jia:stars`
- [x] T016 [US3] `web/js/tabs/prizes.js` claim flow, claimed list, grown-up prize editor
- [x] T017 [US3] Grown-ups sheet: mark claims given, change PIN, star history (`web/js/grownups.js`)
- [x] T018 [US3] Tests: `tests/tabs.spec.js` (prizes, PIN)

## Phase 5: US4/US5 Notes and drawing

- [x] T019 [P] [US4] `web/js/tabs/notes.js` + test
- [x] T020 [P] [US5] `web/js/tabs/draw.js` (crayons, sizes, eraser, undo, clear, gallery, save to phone) + test

## Phase 6: US6 Extensibility & polish

- [x] T021 [US6] Scrollable tab bar for more than 5 tabs; "More games" card explaining how to add one
- [x] T022 [US6] `docs/ADDING_GAMES.md`
- [ ] T023 Verify on a real Android phone/tablet (APK from CI artifact)
