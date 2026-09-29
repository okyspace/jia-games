# Feature Specification: Key Hero (typing)

**Feature Branch**: `004-typing-game`

**Created**: 2026-09-29

**Status**: Implemented (ideation)

**Input**: User description: "Next a typing game to familiarise keys on the keyboard."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find the key (Priority: P1)

A big letter is shown. The matching key glows on an on-screen QWERTY keyboard whose keys are
coloured by finger, with a hint like "Use your left pointer finger". The kid presses it on a
real keyboard or taps it on screen.

**Acceptance Scenarios**:

1. **Given** target F, **When** F is pressed, **Then** the key flashes green and the next target shows.
2. **Given** target F, **When** Q is pressed, **Then** the key flashes red, the mistake counter goes up, and F stays the target.

### User Story 2 - Level path (Priority: P1)

Levels unlock in order: Home row → Home row + → Top row → Bottom row → Numbers → All letters → Words.
Finishing shows accuracy, keys per minute and 1–3 stars (≥95% = 3, ≥80% = 2).

**Acceptance Scenarios**:

1. **Given** Home row is finished, **When** back on Levels, **Then** "Home row +" is unlocked and Home row shows its stars.

### Edge Cases

- Modifier shortcuts (Ctrl/Cmd/Alt) are ignored.
- Works on phones without a physical keyboard (on-screen keyboard is tappable).

## Requirements *(mandatory)*

- **FR-001**: Show a finger-coloured QWERTY keyboard with a legend.
- **FR-002**: Accept physical key presses and on-screen taps.
- **FR-003**: Levels MUST unlock sequentially; best stars per level are remembered.
- **FR-004**: The Words level MUST show progress through each word letter by letter.

## Success Criteria *(mandatory)*

- **SC-001**: After the Home row level a kid can name which finger presses F and J.

## Assumptions

- Standard US QWERTY layout.
- Progress is shared on the device (not per player) for now.
