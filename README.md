# jia-games

An Android app of games and challenges for kids aged 8 and up. Kids play games, finish
challenges to earn ⭐ stars, and spend stars on prizes that grown-ups hand out. It also has
tabs for notes, drawing and "My Book" (reading logs and read-aloud recordings).

Everything works offline, and all data stays on the device.

## Objectives

What the app is for. New features should serve at least one of these.

1. **Grow the kid's brain**: puzzles, memory, logic and maths that stretch thinking.
2. **Learn Chinese, English and Science** through games and challenges.
3. **Learn prompting and vibe coding** at their level: describing what they want and seeing it built.
4. **Keep memories they like**: drawings, notes, books read, recordings, trips.
5. **Cultivate good habits**, with reminders to help (posture, breaks, bedtime routine, chores).
6. **Use it on road trips**: works offline, with activities that suit the car.

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
- **Healthy-use reminders**: sit up straight every 20 minutes. Every 30 minutes there's a 2:30 break that pauses the game. The kid picks what to do: look at trees and plants and walk around, quick maths, science questions, history facts, or relax music with eyes closed. Every second break starts with a guided eye exercise. After 1 hour of continuous use, a longer break to go do other things. On weekdays at 8:30pm, a reminder to pack the bag, brush teeth and shower. That last one also comes as a phone notification when the app is closed.

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

## Future ideas

Not built yet. Each one becomes a spec in `specs/` (via `/speckit-specify`) when we start it.

| # | Idea | What it is | Objectives | Things to decide |
| --- | --- | --- | --- | --- |
| 1 | 🗺️ Travel Journal | Kids pin places they have been, add 1–2 photos and a short note. Three views: a map, a timeline and a photo gallery. | 4, 6 | Map offline: a simple built-in world/country map, or map tiles that need internet? Photos from camera and gallery? Share with family? |
| 2 | 🀄 Chinese tab | Practice and tests: 汉语拼音 (hanyu pinyin), putting the right Chinese word into a sentence, and "find the mistake" (wrong punctuation such as ， vs 。, wrong character, wrong pinyin or tone). | 1, 2, 6 | Which school level and word lists? Tones shown as marks (mā) or numbers (ma1)? Earn stars as a challenge? |
| 3 | 💡 My Wishes | A page where kids write what they wish this app had (text, drawing or voice). Grown-ups can read the list and mark wishes as "planned" or "done". | 3 | Could feed straight into this Future ideas list; turn a wish into a challenge reward? |
| 4 | 🤖 Build My App | Kids make their own mini app just by prompting (describe it, see it, change it). Creations are **not saved** and there is a **5-minute limit** per session, unless a grown-up approves more time or saving. | 3 | Needs an AI model, so internet and an API key; this breaks the "fully offline" rule, so it would be the only online feature, behind a grown-up switch. Content safety filters for kids. Cost limits. |

## Feature history

Newest first. "Requested by" is who asked for the feature; "Built by" is who wrote the code.
Details for each feature are in `specs/`.

| Date | Version | Feature | Spec | Requested by | Built by |
| --- | --- | --- | --- | --- | --- |
| 2026-09-29 | – | Plan for automating issues → Spec Kit → PR (Emdash or GitHub Actions), parked | [docs](docs/AUTOMATION_PLAN.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | unreleased | Break activities: quick maths, science, history, relax music, and an eye exercise every 2nd break | [009](specs/009-wellbeing-reminders/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | – | Objectives and future ideas (travel journal, Chinese tab, wishes page, Build My App) added to the README | – | KY (@okyspace) | Claude Code |
| 2026-09-29 | unreleased | Healthy-use reminders: posture (20 min), break with countdown that pauses the game (30 min), long break (1 h), weekday 8:30pm bedtime routine plus phone notification | [009](specs/009-wellbeing-reminders/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | MIT license and VERSION file | – | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | Bunny app icon | – | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | CI: ESLint, Android Lint, tests and debug APK on pushes to `ideation` | – | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | Progress report saved as Markdown on the phone | [008](specs/008-progress-report/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | Challenges: Math Sprint, Book Explorer, Tidy Study Table, Laundry Helper, 读一读 Read Aloud | [007](specs/007-challenges/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | Quiz Maker (Q&A game) | [006](specs/006-qna-game/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | Memory Match | [005](specs/005-memory-game/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | Key Hero (typing) | [004](specs/004-typing-game/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | Mouse Maze | [003](specs/003-maze-game/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | Kid login with photo, app logo upload | [002](specs/002-kid-login-and-logo/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | 0.1.0 | App shell: tabs, stars, prizes, notes, draw, My Book, grown-up PIN, native and web games | [001](specs/001-app-shell/spec.md) | KY (@okyspace) | Claude Code |
| 2026-09-29 | – | Repository created | – | KY (@okyspace) | KY (@okyspace) |

When you add a feature, add a row at the top (or ask Claude Code to).

## Version

The current version is in [`VERSION`](VERSION). The Android app's `versionName` is read from it.
Releases are tagged with the same number (e.g. `0.1.0`).

## License

[MIT](LICENSE) © 2026 okyspace. You're free to use, copy, change and share this project,
including commercially, as long as you keep the copyright notice (credit Jia Games / okyspace).

Third-party parts keep their own licenses:

- Fredoka font: SIL Open Font License, see `web/fonts/FREDOKA-OFL.txt`.
- The bunny photo in `tools/icon/bunny.png` and the app icon made from it are not covered by the MIT license.
