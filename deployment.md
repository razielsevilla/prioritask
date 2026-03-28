# PrioriTask Deployment Guide

This document explains how I deploy PrioriTask as a Google Chrome extension.

## Deployment Targets

1. Local development deployment (unpacked extension).
2. Chrome Web Store deployment (published package).

## 1) Local Development Deployment

### Prerequisites

- Google Chrome installed.
- Node.js LTS installed.
- Project dependencies installed.

### Build Steps

1. Install dependencies.
2. Run development build or watch mode.
3. Confirm extension output folder is generated.

Example commands:

```bash
npm install
npm run build
```

### Load as Unpacked Extension

1. Open Chrome and go to chrome://extensions.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the generated build directory.
5. Pin PrioriTask and test popup/options pages.

### During Development

- Rebuild after source changes.
- Click Reload on the extension card.
- Re-test alarms and notifications after reload.

## 2) Production Deployment (Chrome Web Store)

### Pre-Release Checklist

- Confirm manifest version and extension version are updated.
- Verify requested permissions are minimal and justified.
- Ensure icons and store assets are complete.
- Validate all links and privacy copy.
- Run unit/integration/manual QA checklist.

### Package Preparation

1. Run production build.
2. Zip the extension build output directory.
3. Verify zip includes manifest.json and required assets.

### Publish Steps

1. Open Chrome Web Store Developer Dashboard.
2. Create new item or update existing listing.
3. Upload package zip.
4. Fill listing details:
   - Name
   - Short description
   - Full description
   - Screenshots and icons
   - Category
5. Submit for review.

### Post-Submission

- Track review status.
- Address reviewer feedback quickly.
- Publish once approved.

## Versioning Strategy

- Use semantic versioning for release clarity.
- Bump patch for fixes.
- Bump minor for backward-compatible feature additions.
- Bump major for breaking changes.

## Release Validation

After publishing:

1. Install from store on a clean Chrome profile.
2. Validate onboarding and basic assignment flow.
3. Validate ranking results against known sample data.
4. Validate reminders and notification behavior.

## Rollback Plan

If a bad release is detected:

1. Prepare a hotfix build immediately.
2. Increment version and resubmit.
3. Communicate issue and expected fix timeline in release notes.
