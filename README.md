# PrioriTask

PrioriTask is a Google Chrome extension I am building to help students decide what assignment to work on next.

Instead of keeping a static to-do list, PrioriTask ranks school tasks automatically based on selected prioritization logic and deadline pressure.

## Why I Built This

Students often have multiple assignments due at different times, with different effort levels and grade impact. PrioriTask is designed to reduce decision fatigue by giving a clear, explainable priority order.

## Core Features

- Assignment management (add, edit, complete, delete).
- Multiple prioritization modes:
  - DDS (deadline urgency)
  - DoD (difficulty + urgency)
  - B2D (benefit efficiency)
  - EoC (grade impact per effort)
- FSR risk overlay to flag potentially unrealistic schedules.
- Reason labels so users understand why items are ranked highly.
- Chrome notifications for due dates and risk alerts.

## Who This Is For

- High school and college students.
- Students managing overlapping deadlines.
- Students who want a more systematic way to choose next tasks.

## How It Works

1. User adds assignments and details.
2. User selects a prioritization mode.
3. PrioriTask computes safe scores and ranks tasks.
4. Extension updates priorities as time and data change.
5. Notifications remind users of important upcoming or risky tasks.

## Project Documents

- architecture.md: system architecture and tech stack.
- phases.md: development roadmap and progress tracking.
- deployment.md: Chrome extension deployment guide.
- schema.md: storage schema and data model details.
- structure.md: repository folder and file layout.
- algorithms.md: polished algorithm definitions and formulas.

## Current Status

Planning and architecture documentation is complete.
Implementation of the extension scaffold and core modules is next.

## MVP Goals

- Fast task entry.
- Reliable ranking output.
- Explainable recommendations.
- Practical reminder automation.

## License

TBD
