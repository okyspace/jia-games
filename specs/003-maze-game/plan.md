# Implementation Plan: Mouse Maze

**Branch**: `003-maze-game` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

## Summary

A standalone web game in `web/games/maze/`: depth-first-search maze generator (`makeMaze`),
canvas renderer with emoji sprites, keyboard/D-pad/swipe controls, win overlay with next level.

## Technical Context

**Language/Version**: JavaScript ES module, Canvas 2D

**Storage**: `jia.maze.bestLevel` (shared on the device)

**Testing**: `tests/games.spec.js` solves the maze with a breadth-first search over `window.mazeGame.grid` (read-only test peek) and presses the arrow keys.

## Constitution Check

Kid-first controls ✅ · Offline ✅ · Pluggable (folder + `games.json` entry) ✅ · Tested ✅

## Project Structure

```text
web/games/maze/index.html   layout, D-pad
web/games/maze/maze.js      generator, renderer, controls
```
