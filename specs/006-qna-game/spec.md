# Feature Specification: Quiz Maker (Q&A)

**Feature Branch**: `006-qna-game`

**Created**: 2026-09-29

**Status**: Implemented (ideation)

**Input**: User description: "A Q&A game where we allow kids to add their questions with answers, to test others."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add my own question (Priority: P1)

A kid writes a question and the right answer. Optionally they add up to 3 wrong answers to
make it multiple choice; otherwise players type the answer. Their name is saved as the author.

**Acceptance Scenarios**:

1. **Given** the form, **When** question + answer are saved, **Then** it appears in "All questions" with "by <name>".
2. **Given** a wrong answer equal to the right answer, **Then** the kid is told to fix it.

### User Story 2 - Test others (Priority: P1)

Anyone (another player on the device, a parent) plays a quiz of up to 10 random questions and
sees a score at the end.

**Acceptance Scenarios**:

1. **Given** a typed-answer question, **When** "  four " is entered for "Four", **Then** it counts as correct (case/space-insensitive).
2. **Given** a multiple-choice question, **When** a wrong option is tapped, **Then** it turns red and the right one turns green.
3. **Given** the last question, **Then** "You got X out of Y!" shows.

### User Story 3 - Manage questions (Priority: P2)

Questions can be edited and deleted from the list. A few starter questions exist and can be deleted.

### Edge Cases

- With 0 questions, "Play" is disabled.
- Trailing punctuation in typed answers is ignored ("Mars." = "mars").

## Requirements *(mandatory)*

- **FR-001**: Questions are shared by every player on the device.
- **FR-002**: Support typed answers and multiple choice (answer + 1–3 wrong options, shuffled).
- **FR-003**: Store author name from the signed-in player.
- **FR-004**: Quiz length is 10 (or all questions if fewer).

## Success Criteria *(mandatory)*

- **SC-001**: A kid can add a question in under 1 minute.

## Assumptions

- No stars are awarded (could become a challenge later: "Write 5 questions").
- Sharing questions between devices is out of scope for now.
