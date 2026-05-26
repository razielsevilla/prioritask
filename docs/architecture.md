# PrioriTask Architecture

## Purpose

I am building PrioriTask as a Manifest V3 Chrome extension that helps students prioritize assignments using selectable algorithms and reminder automation.

## Architectural Style

I am using a modular client-side architecture with clear separation between:
- UI rendering
- domain logic (scoring and ranking)
- persistence
- background automation (alarms and notifications)

Because this is a Chrome extension, there is no always-on backend in the MVP. The source of truth is local extension storage.

## Main Components

### 1. Popup UI

Responsibilities:
- Show a quick ranked list of tasks.
- Let users add tasks quickly.
- Show reason tags for why a task is high priority.

Characteristics:
- Fast to open and close.
- Limited controls for daily workflow.

### 2. Options Page

Responsibilities:
- Full task management (create, edit, complete, delete).
- Configure algorithm mode.
- Configure constants and study-time settings.
- Configure reminder windows.

Characteristics:
- Full-screen management experience.
- Main place for settings and advanced controls.

### 3. Background Service Worker

Responsibilities:
- Recompute priority when data changes.
- Schedule and handle alarms.
- Trigger Chrome notifications.
- Run daily digest checks.

Characteristics:
- Event-driven, not persistent in memory.
- Must persist state in storage, not RAM.

### 4. Storage Layer

Responsibilities:
- Persist assignments and settings in chrome.storage.local.
- Expose typed data access functions.
- Validate and migrate stored data when schema evolves.

Characteristics:
- Local-first for privacy and simplicity.
- Optional future sync for lightweight preferences.

## Domain Modules

### Scoring Engine

Implements:
- DDS_safe
- DoD_safe
- B2D_safe
- EoC_safe
- FSR overlay

Rules:
- Normalize and clamp inputs.
- Prevent divide-by-zero via epsilon and safe day calculation.
- Bucket overdue tasks first.
- Apply deterministic tie-breakers.

### Ranking Pipeline

Execution order:
1. Validate task payload.
2. Normalize values.
3. Compute base score from selected mode.
4. Compute FSR risk score.
5. Apply risk boost.
6. Sort by bucket and score.
7. Generate explanation labels.

## Data Flow

1. User updates task or settings from popup/options.
2. UI writes to storage through a service layer.
3. Background worker receives or polls change events.
4. Ranking pipeline recomputes ordered list.
5. UI reads computed data and renders updated list.
6. Alarm checks may trigger user notifications.

## Tech Stack

Planned stack:
- TypeScript for strict types and safer formulas.
- React for popup and options UI.
- Vite or Plasmo for extension build tooling.
- Zod for schema validation.
- Vitest for unit tests.

Why this stack:
- It supports fast iteration.
- It reduces runtime bugs via static typing and input validation.
- It fits extension packaging workflows cleanly.

## Non-Functional Requirements

Performance:
- Ranking should feel instant for typical student workloads.

Reliability:
- Formula outputs must be deterministic for the same inputs.

Privacy:
- No external data sharing in MVP.
- Minimal permissions only.

Maintainability:
- Keep algorithm and storage logic decoupled from UI.
- Keep formulas centralized in one module.

## Future Architecture Extensions

Potential additions after MVP:
- Optional cloud sync profile.
- LMS import adapters.
- Historical analytics for effort estimation.
- Experiment flags for algorithm tuning.