# PrioriTask Extension

PrioriTask is a Chrome extension that helps students prioritize assignments with transparent ranking logic.

## Current Status

Phase 1 (Project Foundation) is complete:
- Manifest V3 bootstrap is working.
- Popup and options entry points are working.
- TypeScript, ESLint, and Vitest baselines are configured.
- Core domain models are defined in src/types/models.ts.

## Tech Stack

- React
- TypeScript
- Vite
- @crxjs/vite-plugin
- ESLint
- Vitest

## Development Commands

```bash
npm install
npm run dev
npm run lint
npm run test -- --run
npm run build
```

## Load in Chrome (Unpacked)

1. Build the extension with npm run build.
2. Open chrome://extensions.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the dist folder.

## Entry Points

- Popup: src/popup/main.tsx
- Options: src/options/main.tsx
- Shared models: src/types/models.ts

## Related Docs

- ../algorithms.md
- ../architecture.md
- ../phases.md
- ../schema.md
- ../deployment.md
- ../structure.md
