# Implementation Plan: Memory Match

**Branch**: `005-memory-game` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

## Summary

`web/games/memory/`: CSS 3D flip cards in a grid (`--cols`), shuffle of emoji pairs, a busy
lock during flip-back, and `jia.memory.best` for best scores.

## Technical Context

**Testing**: `tests/games.spec.js` flips one wrong pair (checks flip-back), then matches all pairs and checks the win overlay and move count.

## Constitution Check

Kid-first ✅ · Offline ✅ · Tested ✅

## Project Structure

```text
web/games/memory/index.html   card styles
web/games/memory/memory.js    menu, board, flip logic, results
```
