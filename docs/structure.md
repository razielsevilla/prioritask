# PrioriTask Repository Structure

This document describes the intended folder and file structure for the PrioriTask repository.

## Root Layout

```text
PrioriTask/
  README.md
  architecture.md
  phases.md
  deployment.md
  schema.md
  structure.md
  algorithms.md

  package.json
  tsconfig.json
  vite.config.ts
  manifest.config.ts

  public/
    icons/

  src/
    background/
      index.ts
      alarms.ts
      notifications.ts

    popup/
      App.tsx
      main.tsx
      components/
      styles/

    options/
      App.tsx
      main.tsx
      components/
      styles/

    domain/
      models/
        assignment.ts
        settings.ts
      scoring/
        dds.ts
        dod.ts
        b2d.ts
        eoc.ts
        fsr.ts
        ranking.ts
      validators/
        assignmentSchema.ts
        settingsSchema.ts

    storage/
      chromeStorage.ts
      repository.ts
      migrations.ts

    shared/
      constants.ts
      dates.ts
      types.ts
      logger.ts

  tests/
    unit/
      scoring/
      validators/
    integration/
      flows/

  scripts/
    build.mjs
    package-extension.mjs
```

## Structure Principles

I will keep the structure aligned to these rules:

1. Domain logic stays independent from UI.
2. Formula modules are isolated and testable.
3. Storage access is centralized behind service/repository files.
4. Background automation logic is separate from popup/options rendering.
5. Shared helpers are framework-agnostic where possible.

## File Ownership by Concern

UI concern:
- src/popup
- src/options

Automation concern:
- src/background

Business logic concern:
- src/domain

Persistence concern:
- src/storage

Cross-cutting concern:
- src/shared

## Naming Conventions

- Use lowercase kebab or lowercase camel consistently for files per module style.
- Keep one primary responsibility per file.
- Keep algorithm names explicit in scoring files.

## Testing Layout

- Unit tests mirror domain module structure.
- Integration tests mirror user flows.
- Test data fixtures live close to tests that use them.

## Documentation Policy

At the root, these documents act as project guides:
- README.md for overview.
- architecture.md for technical design.
- phases.md for execution tracking.
- deployment.md for release workflow.
- schema.md for data model.
- algorithms.md for ranking formulas.
