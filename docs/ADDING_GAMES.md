# Adding games, challenges and tabs

## A web game (HTML/CSS/JS)

1. Create `web/games/<id>/index.html` (plus any JS/CSS). Start from an existing game, e.g. `web/games/memory/`.
   - Link `../../css/kit.css` and `../game.css` for the cartoon look.
   - Import helpers from `../../js/kit.js` (`el`, `sfx`, `confetti`, `showOverlay`, `local` storage…).
   - Don't add your own "exit" button: the app shows a **Back** bar above every game.
2. Add an entry to `web/games/games.json`:

   ```json
   { "id": "my-game", "title": "My Game", "emoji": "🚀", "color": "#FFD23F",
     "description": "One short sentence.", "type": "web", "entry": "games/my-game/index.html" }
   ```

3. Add a Playwright test in `tests/games.spec.js`.

## A native (Kotlin + Compose) game

Follow the Android standards in `CLAUDE.md` (Google's app architecture guide). Copy `nativegames/balloonpop/`:

1. `MyGameEngine.kt`: the rules as pure Kotlin functions over a `MyGameState` data class (no Android imports).
2. `MyGameViewModel.kt`: holds `uiState: StateFlow<MyGameState>`, takes events (`onTap`, `onFrame`…).
3. `MyGameScreen.kt`: a `@Composable` that draws `uiState` (`collectAsStateWithLifecycle`), sends events,
   and calls `onExit` (also on the back button, via `BackHandler`).
4. Register it in `android/app/src/main/java/com/jia/games/nativegames/NativeGames.kt`:
   `NativeGame("my-native-game") { onExit -> MyGameScreen(onExit = onExit) }`.
5. Add to `games.json`: `{ ..., "type": "native", "nativeId": "my-native-game" }`.
   In a desktop browser the card shows "📱 Android".
6. Add unit tests for the engine and ViewModel in `android/app/src/test/`.

## A challenge

Add an entry to `web/challenges/challenges.json`. These fields are common to every type:

| Field | Meaning |
| --- | --- |
| `stars` | Stars earned when completed |
| `repeat` | `daily` (once per day), `always`, or `once` |
| `parentCheck` | `true` means the grown-up PIN is needed before stars are given |
| `requires` | List of challenge ids that must be done first (locks the card until then) |
| `unlocksMore` | Shows a "secret challenges" teaser until this one is done |

The available types are:

- `checklist`: needs `"steps": ["...", "..."]`. For chores.
- `book-log`: needs `"minPages": 50`. Kids log a book they read.
- `recording`: read a paragraph from `web/challenges/chinese-paragraphs.json` aloud and record it.
- `web`: needs `"entry": "challenges/<id>/index.html"`. The page calls
  `reportChallengeComplete('<id>')` from `web/js/kit.js` when the kid has finished
  (see `web/challenges/math/`).

## A tab

1. Create `web/js/tabs/<id>.js` exporting `render(container)` and optionally `onShow()`.
2. Add one line to `web/js/tabs.js`. With more than 5 tabs, the tab bar scrolls sideways.
