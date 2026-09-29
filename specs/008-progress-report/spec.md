# Feature Specification: Progress Report on the Phone (Markdown)

**Feature Branch**: `008-progress-report`

**Created**: 2026-09-29

**Status**: Implemented (ideation)

**Input**: User description: "This app has to be able to run locally without internet. But with internet, it should be able to sync to my pCloud (for now) to store the status of the challenges done, stars earned or used." → follow-up: "For now, just save as md in the hp (handphone)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Always-current report file (Priority: P1)

Whenever stars change (challenge done, prize claimed or given), the Android app rewrites
`Download/JiaGames/jia-games-progress.md` on the phone. It lists, per player: stars now,
stars earned, stars used, challenges done (with book/recording names), the full star history,
and prizes claimed with their status.

**Acceptance Scenarios**:

1. **Given** a kid finishes a challenge, **Then** within ~2 s the Markdown file on the phone includes it.
2. **Given** the file already exists, **Then** it is updated in place (not duplicated).

### User Story 2 - Save report now (Priority: P2)

In ⚙️ Grown-ups, "Save report now" writes the file (Android) or downloads it (browser).

### Edge Cases

- Android 9 and older (API < 29): writing to Downloads is not supported by this version; the button reports it could not save. [NEEDS CLARIFICATION: needed for older phones?]
- Reinstalling the app loses ownership of the old file; a new copy may be created alongside it.

## Requirements *(mandatory)*

- **FR-001**: The app MUST keep working with no internet; the report is written locally.
- **FR-002**: The report MUST be readable Markdown (headings + tables).
- **FR-003**: No network permission is added for this feature.

## Success Criteria *(mandatory)*

- **SC-001**: A parent can open the file on the phone and see today's stars within seconds.

## Assumptions

- **Future (not built yet)**: pCloud sync. The file in Download/JiaGames can already be uploaded by
  the pCloud mobile app or copied manually. A later feature can add in-app sync (pCloud HTTP API
  `uploadfile` into `/JiaGames`, merge entries by id so offline devices can sync later).
