# Feature Specification: Challenges

**Feature Branch**: `007-challenges`

**Created**: 2026-09-29

**Status**: Implemented (ideation)

**Input**: User description: "A challenge tab. 1st challenge: complete math questions, 3 rounds — addition and subtraction, then multiplication — with a timer; complete it to get 10 stars. 2nd: read an English story book of at least 50 pages; log the book name, author, a short paragraph on what the story is about and what they like about the book — 15 stars. 3rd: clean the study table — 10 stars. 4th: help parents fold clothes — 10 stars. 5th: read aloud 1 Chinese paragraph, record it and save it in the app book. This challenge unlocks more challenges."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Math Sprint (Priority: P1) — ⭐ 10

Three timed rounds: ➕ adding, ➖ taking away, ✖️ times tables. 10 questions per round,
2 minutes per round. Answers are typed on a big number pad (or keyboard). A wrong answer
must be corrected. If time runs out, that round restarts. Finishing all 3 gives 10 stars.

**Acceptance Scenarios**:

1. **Given** round 1, **Then** questions are additions with sums ≤ 99; round 2 subtractions with non-negative results; round 3 tables 2–10.
2. **Given** a wrong answer, **Then** the same question stays and the answer box shakes.
3. **Given** the timer reaches 0, **Then** "Time's up!" and the round restarts.
4. **Given** all 3 rounds are done, **Then** 10 stars are added and the card shows "Done today".

### User Story 2 - Book Explorer (Priority: P1) — ⭐ 15

The kid logs an English story book: name, author, pages (≥ 50), what the story is about
(≥ 15 words) and what they liked (≥ 5 words). A grown-up checks with the PIN. The log is
saved in **My Book**.

**Acceptance Scenarios**:

1. **Given** 30 pages, **Then** "The book needs at least 50 pages".
2. **Given** a book already logged, **Then** "Read a new one!".
3. **Given** valid entries + PIN, **Then** 15 stars and the book appears in My Book.

### User Story 3 - Chores: Tidy Study Table & Laundry Helper (Priority: P1) — ⭐ 10 each

A checklist of steps. When every step is ticked, "All done!" asks for the grown-up PIN.

### User Story 4 - 读一读 Read Aloud (Priority: P1) — ⭐ 10, unlocks more

The kid picks one of the built-in Chinese paragraphs (or "my own book" + book name), records
themselves reading it aloud, listens back, and saves it into **My Book** after a grown-up check.
Finishing it the first time unlocks challenges that declare `"requires": ["chinese-read-aloud"]`.

**Acceptance Scenarios**:

1. **Given** microphone permission, **When** Record → Stop → Save → PIN, **Then** 10 stars and a playable recording in My Book.
2. **Given** it has never been done, **Then** a "Secret challenges" card is locked; after it is done, the card says more challenges are unlocked.

### User Story 5 - Adding challenges (Priority: P2)

Grown-ups/developers add a challenge with one entry in `web/challenges/challenges.json`
(types: `web`, `book-log`, `checklist`, `recording`), with `stars`, `repeat`, `parentCheck`, `requires`.

### Edge Cases

- Daily challenges can be done once per calendar day; `always` (Book Explorer) any time with a new book; `once` only once.
- Closing a challenge half-way gives nothing.
- Microphone denied → friendly message, no crash.

## Requirements *(mandatory)*

- **FR-001**: Challenges MUST be defined in `challenges.json` and shown in order with stars and status (Ready / Done today / Locked).
- **FR-002**: Web challenges report completion with `postMessage({type:'jia:challenge-complete'})`; the shell only accepts it from the page it opened for that challenge.
- **FR-003**: Real-world challenges (`parentCheck: true`) MUST require the grown-up PIN before stars are given.
- **FR-004**: Completions MUST be logged per player (for "done today", unlocking and the progress report).
- **FR-005**: Recordings MUST be stored on the device (IndexedDB) and playable in My Book.

### Key Entities

- **Challenge**: id, title, emoji, colour, stars, description, type, repeat, parentCheck, requires, unlocksMore, type-specific fields (entry, minPages, steps).
- **Challenge log entry**: id, challengeId, title, time, stars, details.
- **Book log**: title, author, pages, about, liked, time. **Recording**: id, player, title, text, audio blob, time.

## Success Criteria *(mandatory)*

- **SC-001**: Each of the 5 challenges can be completed end-to-end (covered by `tests/challenges.spec.js`).

## Assumptions

- Stars for 读一读 were not specified: set to **10**. [NEEDS CLARIFICATION]
- Math: 10 questions × 3 rounds, 2 minutes per round, retry the round on time-out. [NEEDS CLARIFICATION on difficulty/timing]
- Repeat rules: Math, chores and read-aloud once per day; Book Explorer once per new book. [NEEDS CLARIFICATION]
- Which challenges 读一读 unlocks is not decided yet; the unlock mechanism is ready. [NEEDS CLARIFICATION]
