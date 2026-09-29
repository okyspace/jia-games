<!--
Sync Impact Report
- Version change: template → 1.0.0
- Added principles: I. Kid-First Design, II. Offline-First & Private, III. Pluggable Content,
  IV. Web Core, Native Shell, V. Tested User Journeys, VI. Grown-Ups Stay in Control
- Added sections: Technology Constraints, Development Workflow
- Templates: plan-template.md Constitution Check uses the gates below (no template edits needed)
-->

# Jia Games Constitution

Jia Games is an Android app of games and challenges for kids aged 8 and up. Kids play games,
finish challenges to earn stars, and spend stars on prizes that grown-ups hand out.

## Core Principles

### I. Kid-First Design

Every screen MUST be usable by an 8-year-old without help: big touch targets (at least 44px,
ideally 52px+), short sentences, emoji/picture cues, cheerful cartoon styling (thick outlines,
bright colours, bouncy feedback), and friendly error messages that say what to do next.
No ads, no dark patterns, no punishment for mistakes: a wrong answer means "try again".

### II. Offline-First & Private

The app MUST work fully without internet. All assets (fonts, images, games) are bundled.
Kid data (profiles, stars, notes, drawings, recordings) stays on the device unless a grown-up
explicitly exports or syncs it. The app requests only the permissions a feature needs
(today: microphone for read-aloud recordings) and asks at the moment of use.

### III. Pluggable Content

Adding a game, a challenge, a prize or a tab MUST be a small, local change:
a folder plus one manifest/registry entry (`web/games/games.json`, `web/challenges/challenges.json`,
`web/js/tabs.js`, `NativeGames.kt`). Shell code MUST NOT need edits to add ordinary content.

### IV. Web Core, Native Shell

The kid-facing UI is a plain HTML/CSS/JavaScript app (`web/`) with no build step, hosted in an
Android WebView served from `https://appassets.androidplatform.net`. Native (Kotlin) code is kept
to the shell, a small JS bridge (`JiaNative`), and optional native games. Every bridge call MUST
have a browser fallback so the whole app can be developed and tested in a desktop browser.

### V. Tested User Journeys

Every user story MUST have an end-to-end Playwright test that plays it the way a kid would
(tap, type, draw, record). A feature is not done until `npm test` passes and the Android CI build
is green.

### VI. Grown-Ups Stay in Control

Anything that gives stars for real-world tasks, changes prizes, resets passwords, changes the
logo or exports data MUST sit behind the grown-up PIN. Kid profile passwords are stored only
as salted hashes.

## Technology Constraints

- Android: Kotlin, minSdk 26, targetSdk 35, AndroidX WebKit `WebViewAssetLoader`.
- Web: ES modules, no framework, no bundler; storage via `localStorage` (small JSON) and
  IndexedDB (drawings, recordings).
- Tests: Playwright (Chromium, Pixel 7 viewport) in `tests/`.
- External scripts/CDNs are not allowed at runtime (offline-first).

## Development Workflow

- Features follow Spec Kit: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
  Specs live in `specs/NNN-feature-name/`.
- New ideas land on the `ideation` branch first so they can be reviewed and re-organised
  before being merged into the development branch.
- Assumptions made while specifying MUST be written down in the spec's Assumptions section
  or marked `[NEEDS CLARIFICATION]`.

## Governance

This constitution overrides other practices in the repo. Amendments are made by editing this
file with a version bump (MAJOR: principle removed/redefined, MINOR: principle added,
PATCH: wording) and a note in the Sync Impact Report. Reviews check the Constitution Check in
each plan.

**Version**: 1.0.0 | **Ratified**: 2026-09-29 | **Last Amended**: 2026-09-29
