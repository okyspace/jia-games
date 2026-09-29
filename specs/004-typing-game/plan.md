# Implementation Plan: Key Hero

**Branch**: `004-typing-game` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

## Summary

`web/games/typing/` renders a level menu, a target card, finger hint, progress bar and a
tappable finger-coloured keyboard. `LEVELS` defines key sets or a word list; targets are
shuffled key sets. Results → stars saved in `jia.typing.progress`.

## Technical Context

**Language/Version**: JavaScript ES module, DOM

**Testing**: `tests/games.spec.js` — completes Home row with the physical keyboard (100% accuracy) and checks on-screen taps + mistakes.

## Constitution Check

Kid-first (big target, finger colours, no penalty beyond a counter) ✅ · Offline ✅ · Tested ✅

## Project Structure

```text
web/games/typing/index.html   styles
web/games/typing/typing.js    levels, finger map, input, results
```
