# Implementation Plan: Challenges

**Branch**: `007-challenges` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

## Summary

The Challenges tab (`web/js/tabs/challenges.js`) reads `challenges.json`, computes status
from the player's challenge log, and starts a challenge by type. In-app types live in
`web/js/challenge-types.js`; the Math Sprint is a web page (`web/challenges/math/`) that posts
a completion message. `store.logChallenge()` records the completion and earns the stars.

## Technical Context

**Language/Version**: JavaScript ES modules

**Primary Dependencies**: `MediaRecorder` + `getUserMedia` (WebView mic permission bridged in `MainActivity`)

**Storage**: `jia.u.<id>.challengeLog`, `jia.u.<id>.books`, IndexedDB `recordings`

**Testing**: `tests/challenges.spec.js` (all 5 challenges, timer expiry with a fake clock, locking via `requires`); Chromium runs with a fake microphone.

## Constitution Check

| Gate | Status |
| --- | --- |
| Kid-First: number pad, gentle retries, celebrations | ✅ |
| Offline & Private: recordings stay on device | ✅ |
| Pluggable: one JSON entry per challenge | ✅ |
| Grown-Ups in Control: PIN for real-world tasks | ✅ |
| Tested | ✅ |

## Project Structure

```text
web/challenges/challenges.json          CHALLENGE REGISTRY
web/challenges/chinese-paragraphs.json  built-in paragraphs for 读一读
web/challenges/math/                    Math Sprint page
web/js/tabs/challenges.js               list, status, locking, start
web/js/challenge-types.js               book-log, checklist, recording
web/js/tabs/book.js                     My Book: book logs + recordings
```
