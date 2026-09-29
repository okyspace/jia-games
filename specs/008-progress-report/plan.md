# Implementation Plan: Progress Report on the Phone

**Branch**: `008-progress-report` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

## Summary

`web/js/report.js` builds Markdown from every player's star ledger, challenge log and claims.
On Android, `startAutoReport()` re-saves it (debounced 1.5 s) on `jia:stars`/`jia:prizes`
events through `JiaNative.saveTextFile()`, which uses MediaStore Downloads
(`Download/JiaGames/`, updated in place via a query on name + relative path).

## Technical Context

**Language/Version**: JavaScript; Kotlin (MediaStore, API 29+)

**Storage**: public `Download/JiaGames/jia-games-progress.md`; no extra permissions on API 29+

**Testing**: `tests/tabs.spec.js` checks the Markdown content and that "Save report now" downloads `jia-games-progress.md` in a browser.

## Constitution Check

Offline-first ✅ (no network) · Private ✅ (file stays on the phone, grown-up decides where it goes) · Tested ✅

## Project Structure

```text
web/js/report.js      buildReport(), saveReport(), startAutoReport()
web/js/native.js      saveTextToDevice() with browser download fallback
android/.../JiaBridge.kt   saveTextFile()
```
