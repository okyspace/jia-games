# jia-games

An Android app of games and challenges for kids aged 8 and up. Kids play games, finish
challenges to earn ⭐ stars, and spend stars on prizes that grown-ups hand out. It also has
tabs for notes, drawing and "My Book" (reading logs and read-aloud recordings).

Everything works offline, and all data stays on the device.

| Tab | What it does |
| --- | --- |
| 🎮 Games | Mouse Maze, Key Hero (typing), Memory Match, Quiz Maker, Balloon Pop (native sample) |
| 🏆 Challenges | Math Sprint (10⭐), Book Explorer (15⭐), Tidy Study Table (10⭐), Laundry Helper (10⭐), 读一读 Read Aloud (10⭐, unlocks more) |
| 🎁 Prizes | Spend stars on prizes; grown-ups edit prizes and mark claims as given |
| 📝 Notes | Sticky notes |
| 🎨 Draw | Finger painting, gallery, save to phone |
| 📚 My Book | Books logged and Chinese read-aloud recordings |

The app also has:

- **Kid login**: each kid signs in by tapping their photo and typing their password (stored locally).
- **App logo**: grown-ups can upload one.
- **Grown-ups area (⚙️)**: protected by a PIN, **default `1234`**. It holds the logo, players, prizes to hand out, the progress report and the PIN itself.
- **Progress report**: `Download/JiaGames/jia-games-progress.md` on the phone, updated whenever stars change.

## How it is built

```text
android/   Native shell (Kotlin). A WebView serves web/ from the APK, plus a small JS bridge and native games.
web/       The app UI in plain HTML/CSS/JS with no build step. It is packaged as the APK's assets.
tests/     Playwright end-to-end tests that play every feature like a kid would.
specs/     Spec Kit specs (spec.md, plan.md and tasks.md for each feature).
.specify/  Spec Kit config, templates and the project constitution.
```

- **Web games** live in `web/games/<name>/` and are listed in `web/games/games.json`.
- **Native games** are Kotlin activities registered in `NativeGames.kt`. `games.json` lists them with `"type": "native"`.
- **Challenges** are listed in `web/challenges/challenges.json`.
- **Tabs** are listed in `web/js/tabs.js`.

See [docs/ADDING_GAMES.md](docs/ADDING_GAMES.md) for how to add games, challenges and tabs.

## Run it

```bash
npm install
npm run serve          # open http://localhost:4173 in a browser (use phone size in dev tools)
npm run lint           # ESLint quality check (JavaScript)
npm test               # Playwright end-to-end tests
```

Build the Android app with Android Studio (open `android/`), or from the command line:

```bash
cd android && ./gradlew assembleDebug   # needs the Android SDK
```

CI (`.github/workflows/ci.yml`) runs on every push to the `ideation` branch (or by hand from the Actions tab):

- **Quality check**: ESLint for the JavaScript, then the Playwright tests.
- **Android**: Android Lint for the Kotlin/Android code, then a debug APK build.

Download the APK from the run's `jia-games-debug-apk` artifact.

## Spec Kit workflow

This repo uses [Spec Kit](https://github.com/github/spec-kit). With Claude Code, run
`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` for new features.
The principles are in `.specify/memory/constitution.md`.
