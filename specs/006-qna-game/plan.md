# Implementation Plan: Quiz Maker

**Branch**: `006-qna-game` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

## Summary

`web/games/qna/` has four views (menu, edit form, list, play). Questions live in
`jia.qna.questions` (shared, seeded with starters). `normalise()` compares typed answers.

## Technical Context

**Testing**: `tests/games.spec.js` deletes starters, adds a typed and a multiple-choice question, plays both correctly, checks score and authors.

## Constitution Check

Kid-first (big answer buttons, gentle "the answer is…") ✅ · Offline ✅ · Tested ✅

## Project Structure

```text
web/games/qna/index.html
web/games/qna/qna.js
```
