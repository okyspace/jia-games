# Feature Specification: Kid Login with Photo, and App Logo Upload

**Feature Branch**: `002-kid-login-and-logo`

**Created**: 2026-09-29

**Status**: Implemented (ideation)

**Input**: User description: "The main page should allow upload of a logo for this app. And for the kid to upload their photo as their login. The login is a simple username and password, first saved locally."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Make a player (Priority: P1)

On first open, the main page shows the app logo and "New player". The kid adds a photo,
types a name and a password (twice), and is signed in.

**Independent Test**: Fresh install → create a player with photo → header shows the photo.

**Acceptance Scenarios**:

1. **Given** no players, **When** the kid fills name + matching passwords, **Then** they are signed in and see the Games tab.
2. **Given** the name is already taken (any letter case), **Then** a friendly "That name is taken" message shows.
3. **Given** passwords differ or are shorter than 4 characters, **Then** a friendly message explains the problem.

### User Story 2 - Sign in by tapping my photo (Priority: P1)

The main page shows every player's photo. The kid taps their photo and types their password.

**Acceptance Scenarios**:

1. **Given** players exist, **When** the kid taps their photo and enters the right password, **Then** they are signed in.
2. **Given** a wrong password, **Then** "not the right password" shows and the kid can retry.
3. **Given** a signed-in kid, **When** they tap their avatar → "Switch player / Log out", **Then** the main page shows again.

### User Story 3 - Each kid has their own stuff (Priority: P1)

Stars, challenge history, prize claims, notes, drawings, book logs and recordings belong to
the signed-in player. Quiz Maker questions and game best scores are shared on the device.

**Acceptance Scenarios**:

1. **Given** Ann has 7 stars and a note, **When** Ben signs in, **Then** Ben sees 0 stars and no notes.

### User Story 4 - Grown-ups upload the app logo (Priority: P2)

A grown-up taps the logo (main page or header) or uses ⚙️ Grown-ups, enters the PIN and
picks an image. It replaces the default 🦊 mascot everywhere in the app.

**Acceptance Scenarios**:

1. **Given** the PIN is entered, **When** an image is picked, **Then** the logo shows in the header and main page.
2. **Given** a custom logo, **When** "Reset" is tapped in Grown-ups, **Then** the mascot returns.

### User Story 5 - Grown-ups manage players (Priority: P3)

In ⚙️ Grown-ups a grown-up can set a new password for a kid who forgot theirs, or delete a player.

### Edge Cases

- Photos and logos are shrunk (256 px) before saving so storage stays small.
- The Android WebView file input opens the system picker (`onShowFileChooser`).
- A deleted player's data keys are left on the device (not shown); see Assumptions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST show the login page until a player is signed in; the sign-in persists until logout.
- **FR-002**: Players MUST have a unique name (2–20 chars), a password (≥ 4 chars) and an optional photo.
- **FR-003**: Passwords MUST be stored as salted SHA-256 hashes, never in plain text.
- **FR-004**: Kid data MUST be stored per player.
- **FR-005**: A grown-up (PIN) MUST be able to upload/reset the app logo, reset a player's password and delete a player.
- **FR-006**: Everything MUST be stored locally on the device.

### Key Entities

- **Profile**: id, name, photo (data URL), salt, hash, createdAt.
- **App logo**: data URL (or none → mascot).

## Success Criteria *(mandatory)*

- **SC-001**: A new kid can create a player in under 1 minute.
- **SC-002**: A returning kid signs in with 1 tap + password.

## Assumptions

- This is a "sibling lock", not security: anyone with the device and developer tools could read local data.
- The Android launcher icon stays the built-in icon; the uploaded logo is used inside the app only.
- Deleting a player hides their data rather than wiping it (safer against accidental taps). [NEEDS CLARIFICATION: should delete also erase data?]
