# Feature Specification: Memory Match

**Feature Branch**: `005-memory-game`

**Created**: 2026-09-29

**Status**: Implemented (ideation)

**Input**: User description: "Next memory game."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find the pairs (Priority: P1)

The kid picks Easy (6 pairs), Medium (8) or Hard (12). Cards show a pink back; tapping flips
them. Two matching animals stay face-up; two different ones flip back after a short moment.

**Acceptance Scenarios**:

1. **Given** two different cards are flipped, **Then** both flip back after ~0.8 s and moves go up by 1.
2. **Given** all pairs are found, **Then** a trophy overlay shows moves and time; a new best is saved per difficulty.

### Edge Cases

- Taps during the flip-back delay, or on a face-up/matched card, are ignored.

## Requirements *(mandatory)*

- **FR-001**: Three difficulties; the layout fits a phone screen without scrolling at Easy/Medium.
- **FR-002**: Show moves, time and pairs found.
- **FR-003**: Remember the best (fewest moves) per difficulty.

## Success Criteria *(mandatory)*

- **SC-001**: A game of Easy takes 1–3 minutes for an 8-year-old.

## Assumptions

- Emoji animals as card faces; no images to bundle.
