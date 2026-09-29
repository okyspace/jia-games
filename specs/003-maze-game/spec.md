# Feature Specification: Mouse Maze

**Feature Branch**: `003-maze-game`

**Created**: 2026-09-29

**Status**: Implemented (ideation)

**Input**: User description: "After the layout, start with a maze game."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Solve a maze (Priority: P1)

The kid guides a mouse 🐭 from the top-left to the cheese 🧀 at the bottom-right using the
on-screen arrows, the keyboard (arrows/WASD) or swipes. Walls block movement.

**Independent Test**: Open the maze, follow the path to the cheese, see "Level 1 done!".

**Acceptance Scenarios**:

1. **Given** a wall to the right, **When** the kid presses right, **Then** the mouse does not move and a "bonk" sound plays.
2. **Given** the mouse reaches the cheese, **Then** a celebration shows moves and time.

### User Story 2 - Levels get harder (Priority: P2)

Each new level makes the maze one cell bigger (5×5 up to 18×18). The best level reached is remembered.

**Acceptance Scenarios**:

1. **Given** Level 1 is done, **When** "Next level" is tapped, **Then** Level 2 starts with a bigger maze.

### Edge Cases

- Every maze is solvable (perfect maze: exactly one path between any two cells).
- The canvas redraws sharply on resize/rotation and on high-DPI screens.

## Requirements *(mandatory)*

- **FR-001**: Mazes MUST be randomly generated and always solvable.
- **FR-002**: Controls MUST include on-screen buttons, keyboard and swipe.
- **FR-003**: The HUD MUST show level, moves, time and best level.
- **FR-004**: Visited cells MUST leave a footprint trail.

## Success Criteria *(mandatory)*

- **SC-001**: An 8-year-old can finish Level 1 in under a minute.

## Assumptions

- The maze does not award challenge stars (games are for fun; stars come from challenges).
