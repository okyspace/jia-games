# Feature Specification: App Shell (tabs, stars, notes, draw, prizes)

**Feature Branch**: `001-app-shell`

**Created**: 2026-09-29

**Status**: Implemented (ideation)

**Input**: User description: "An Android app which can launch natively or launch HTML/CSS/JS. It starts off as a collection of games, a challenge mode that we can add to; any challenge done earns points which can be used to claim prizes. A tab for kids to write their own notes, a tab to draw and save. Kid-friendly, cartoonised layout, allow adding of tabs and new games in the games tab. Add a Claim Prizes tab."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and launch games (Priority: P1)

A kid opens the app, sees colourful game cards on the Games tab and taps one to play it
full-screen, then taps Back (or the Android back button) to return.

**Why this priority**: Games are the heart of the app.

**Independent Test**: Open the Games tab, tap each web game card, check it opens; Back returns.

**Acceptance Scenarios**:

1. **Given** the Games tab, **When** the kid taps "Mouse Maze", **Then** the maze opens full-screen with a Back bar.
2. **Given** a native game card in a browser, **When** tapped, **Then** a friendly "works in the Android app" message appears.
3. **Given** the Android app, **When** a native game card is tapped, **Then** the Kotlin activity launches.

### User Story 2 - Earn and see stars (Priority: P1)

Stars earned from challenges show in a star counter in the header that bounces when it changes.

**Independent Test**: Earn stars (e.g. finish a chore challenge) and check the header counter.

**Acceptance Scenarios**:

1. **Given** 0 stars, **When** a 10-star challenge is completed, **Then** the header shows 10 and a celebration appears.

### User Story 3 - Claim prizes (Priority: P1)

The Prizes tab lists prizes with star costs. A kid with enough stars claims one; stars are
deducted and the claim shows "Waiting" until a grown-up marks it "Given".

**Acceptance Scenarios**:

1. **Given** 5 stars, **When** viewing a 20-star prize, **Then** it shows "15 more ⭐ to go" and no Claim button.
2. **Given** 25 stars, **When** the kid claims the 20-star prize, **Then** the balance is 5 and the claim is "Waiting ⏳".
3. **Given** a waiting claim, **When** a grown-up (PIN) taps "Given ✓", **Then** the kid sees "Received ✅".
4. **Given** the grown-up PIN, **When** editing prizes, **Then** prizes can be added (emoji, name, cost) and removed.

### User Story 4 - Write notes (Priority: P2)

Kids create, edit, colour and delete sticky notes that are saved on the device.

**Acceptance Scenarios**:

1. **Given** the Notes tab, **When** a note is created and the app reloads, **Then** the note is still there.
2. **Given** a note, **When** it is deleted and confirmed, **Then** it disappears.

### User Story 5 - Draw and save (Priority: P2)

Kids draw with crayons, brush sizes, eraser, undo and clear; they save drawings to an in-app
gallery, reopen them to keep drawing, and can copy them to the phone's Pictures folder.

**Acceptance Scenarios**:

1. **Given** the Draw tab, **When** the kid draws and taps Save, **Then** a thumbnail appears in "My drawings" and survives a reload.
2. **Given** a saved drawing, **When** "Save to phone" is tapped in the Android app, **Then** it is written to Pictures/JiaGames.

### User Story 6 - Add tabs and games without touching the shell (Priority: P2)

A developer adds a game by adding a folder and one entry in `games.json`, and adds a tab by
adding a module and one line in `tabs.js`.

**Acceptance Scenarios**:

1. **Given** a new entry in `games.json`, **When** the app loads, **Then** its card appears in the Games tab.
2. **Given** more than 5 tabs, **When** on a phone, **Then** the tab bar scrolls sideways.

### Edge Cases

- Claiming a prize without enough stars is refused.
- Android back button closes the top dialog first, then the open game, then returns to the Games tab, then exits.
- Storage unavailable/full: the app keeps working (writes fail silently) instead of crashing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST show a header (logo, app name, star counter, player avatar, grown-ups button) and a bottom tab bar.
- **FR-002**: Tabs MUST be declared in one registry (`web/js/tabs.js`) and be lazily loaded.
- **FR-003**: Games MUST be declared in `web/games/games.json` with type `web` (HTML entry) or `native` (Kotlin activity id).
- **FR-004**: Web games and challenges MUST open full-screen inside the app with a Back bar.
- **FR-005**: The app MUST keep a star ledger (every earn/spend entry with reason and time); balance = sum.
- **FR-006**: Prizes MUST be claimable only with enough stars; claims are tracked Waiting → Given.
- **FR-007**: Grown-up actions MUST require a 4-digit PIN (default `1234`, changeable).
- **FR-008**: Notes MUST support create, edit, colour and delete and persist on the device.
- **FR-009**: Drawings MUST be saved as PNG in the device database, listed in a gallery, reopenable and deletable.
- **FR-010**: The app MUST work fully offline.

### Key Entities

- **Tab**: id, label, icon, colour, module loader.
- **Game**: id, title, emoji, colour, description, type (web/native), entry or nativeId.
- **Star entry**: id, time, amount (+/-), reason.
- **Prize**: id, emoji, title, cost. **Claim**: id, prize snapshot, time, status.
- **Note**: id, title, body, colour, created/updated. **Drawing**: id, player, created, PNG blob.

## Success Criteria *(mandatory)*

- **SC-001**: A kid can go from opening the app to playing a game in 2 taps after signing in.
- **SC-002**: Adding a new web game requires changing no shell code (folder + 1 manifest entry).
- **SC-003**: All shell journeys are covered by passing Playwright tests.

## Assumptions

- Default prizes (screen time, choose dinner, playground trip, small toy) are placeholders for grown-ups to edit.
- Prize fulfilment happens in real life; the app only tracks claims.
- A single shared grown-up PIN is enough for a family.
