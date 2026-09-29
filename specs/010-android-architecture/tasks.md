# Tasks: Android architecture alignment

- [x] T001 Review Android code against Google's architecture recommendations (spec table)
- [x] T002 Data layer: `FileNames`, `SharedStorageDataSource`, `MediaStoreDataSource`, `DeviceFilesRepository`
- [x] T003 DI: `JiaGamesApp` + `AppContainer`
- [x] T004 Single activity + Compose root (`ui/MainActivity`, `ui/JiaApp`, `ui/MainViewModel`)
- [x] T005 Safer bridge: `ui/web/WebAppBridge` (`addWebMessageListener`), `JiaWebView`, `JiaWebChromeClient`; promise-based `web/js/native.js`
- [x] T006 Balloon Pop as engine + ViewModel + Compose screen
- [x] T007 Reminders split: `BedtimeSchedule` (pure), `BedtimeScheduler`, `BedtimeNotifier`, `BedtimeReceiver`
- [x] T008 Unit tests (engine, schedule, file names, repository with fake, ViewModels)
- [x] T009 Scans: detekt config + CI step, unit tests in CI, CodeQL workflow
- [x] T010 CLAUDE.md "Android standards", constitution 1.2.0, docs/ADDING_GAMES.md
- [ ] T011 Real-device check of the refactored app (see issue #8)
