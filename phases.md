# PrioriTask Development Phases

This file is my execution tracker for building PrioriTask from MVP to launch-ready extension.

## Phase P1: Project Foundation

| Phase ID | Subphase | Title | Description | Definition of Done (Checklist) |
| --- | --- | --- | --- | --- |
| P1 | P1.1 | Extension Bootstrap | Set up core extension runtime and build pipeline. | - [x] Manifest V3 file is created and valid.<br>- [x] Build command produces extension output.<br>- [x] Unpacked extension loads successfully in Chrome. |
| P1 | P1.2 | UI Entry Points | Create initial popup and options page entry points. | - [x] Popup entry point is created.<br>- [x] Options entry point is created.<br>- [x] Both pages render basic shell UI without runtime errors. |
| P1 | P1.3 | Engineering Baseline | Establish TypeScript, linting, and testing baseline. | - [x] Shared TypeScript config is set up.<br>- [x] Linting is configured and runnable.<br>- [x] Test runner is configured and runnable. |
| P1 | P1.4 | Core Domain Models | Define base models for assignment and settings. | - [x] Assignment model type/interface is defined.<br>- [x] Settings model type/interface is defined.<br>- [x] Model fields align with schema expectations. |

## Phase P2: Data and CRUD

| Phase ID | Subphase | Title | Description | Definition of Done (Checklist) |
| --- | --- | --- | --- | --- |
| P2 | P2.1 | Storage Service | Implement data persistence using chrome.storage.local. | - [x] Storage adapter is implemented.<br>- [x] Read/write/update/delete methods are available.<br>- [x] Error handling is implemented for storage failures. |
| P2 | P2.2 | Assignment CRUD | Build create, edit, complete, and delete task flows. | - [x] Assignment create flow works.<br>- [x] Assignment edit flow works.<br>- [x] Assignment complete toggle works.<br>- [x] Assignment delete flow works. |
| P2 | P2.3 | Settings CRUD | Build user settings create and update flow. | - [x] Settings save flow works.<br>- [x] Settings update flow works.<br>- [x] Defaults are applied when settings are missing. |
| P2 | P2.4 | Validation Layer | Add input validation and user-safe error feedback. | - [x] Required fields are validated before save.<br>- [x] Numeric ranges are validated.<br>- [x] UI feedback is shown for invalid inputs. |
| P2 | P2.5 | Persistence QA | Verify reliability of saved data across restarts. | - [x] Assignment data persists after browser restart.<br>- [x] Settings persist after browser restart.<br>- [x] No data corruption in normal edit flows. |

## Phase P3: Scoring Engine

| Phase ID | Subphase | Title | Description | Definition of Done (Checklist) |
| --- | --- | --- | --- | --- |
| P3 | P3.1 | Base Algorithms | Implement DDS, DoD, B2D, and EoC scoring modules. | - [ ] DDS_safe is implemented.<br>- [x] DoD_safe is implemented.<br>- [x] B2D_safe is implemented.<br>- [x] EoC_safe is implemented. |
| P3 | P3.2 | Risk Overlay | Implement FSR feasibility and risk boost behavior. | - [x] FSR formula is implemented.<br>- [x] RiskBoost application is implemented.<br>- [x] Risk threshold behavior is defined and tested. |
| P3 | P3.3 | Ranking Pipeline | Implement sorting flow with buckets and tie-breakers. | - [x] Overdue bucket is handled first.<br>- [x] Final score sorting is implemented.<br>- [x] Tie-breakers are deterministic and implemented. |
| P3 | P3.4 | Explainability Labels | Add reason tags for transparent scoring output. | - [x] Reason tags are generated for high urgency/impact/risk.<br>- [x] Tags are displayed in UI-ready format.<br>- [x] Labels remain consistent for same input data. |
| P3 | P3.5 | Scoring Tests | Validate formulas and ranking behavior with edge cases. | - [x] Unit tests cover each formula.<br>- [x] Edge cases are covered (zero day, overdue, missing values).<br>- [x] Sample dataset ranking is validated. |

## Phase P4: Notifications and Automation

| Phase ID | Subphase | Title | Description | Definition of Done (Checklist) |
| --- | --- | --- | --- | --- |
| P4 | P4.1 | Alarm Scheduler | Set up background scheduling for periodic checks. | - [x] Background alarm job is implemented.<br>- [x] Schedule intervals are configurable.<br>- [x] Alarm events trigger expected handlers. |
| P4 | P4.2 | Due Notifications | Notify users for upcoming due tasks. | - [x] Reminder windows (e.g., 48h/24h/6h) are supported.<br>- [x] Upcoming due alerts trigger on time.<br>- [x] Alert content includes assignment context. |
| P4 | P4.3 | Overdue Notifications | Notify users when tasks pass due date uncompleted. | - [x] Overdue detection logic is implemented.<br>- [x] Overdue alerts trigger once per policy.<br>- [x] Completed tasks do not trigger overdue alerts. |
| P4 | P4.4 | Risk Notifications | Notify users when workload feasibility is high risk. | - [x] FSR threshold warning logic is implemented.<br>- [x] High-risk notifications trigger correctly.<br>- [x] Warning text clearly explains risk reason. |
| P4 | P4.5 | Notification Preferences | Give users control over notification behavior. | - [x] Notification enabled/disabled setting works.<br>- [x] Reminder window preferences are saved.<br>- [x] Preferences are respected by scheduler. |

## Phase P5: UX Refinement

| Phase ID | Subphase | Title | Description | Definition of Done (Checklist) |
| --- | --- | --- | --- | --- |
| P5 | P5.1 | Ranked List UX | Improve readability and scan speed of prioritized tasks. | - [x] Task hierarchy is visually clear.<br>- [x] Priority order is easy to scan quickly.<br>- [x] Critical tasks are visually distinguishable. |
| P5 | P5.2 | Explainability UX | Improve trust via reason tags and confidence labels. | - [x] Reason tags are visible on each task row.<br>- [x] Confidence indicator appears when defaults are used.<br>- [x] Users can understand "why this is ranked here" quickly. |
| P5 | P5.3 | Filter UX | Add practical task views for daily planning. | - [ ] Today filter works.<br>- [ ] This Week filter works.<br>- [ ] Overdue filter works.<br>- [ ] Completed filter works. |
| P5 | P5.4 | Empty and Onboarding States | Reduce first-use friction and dead-end screens. | - [ ] Empty state guidance is implemented.<br>- [ ] First-task onboarding hint is implemented.<br>- [ ] Missing-data hints are user-friendly. |
| P5 | P5.5 | Usability Validation | Verify speed and clarity of core workflows. | - [ ] User can add and prioritize a task in under 30 seconds.<br>- [ ] Core actions are understandable without external docs.<br>- [ ] No major friction in daily flow scenarios. |

## Phase P6: Hardening and Release

| Phase ID | Subphase | Title | Description | Definition of Done (Checklist) |
| --- | --- | --- | --- | --- |
| P6 | P6.1 | Regression QA | Perform full pass to catch functional regressions. | - [ ] Manual regression checklist is executed.<br>- [ ] Critical defects are fixed.<br>- [ ] No release-blocking issues remain. |
| P6 | P6.2 | Permission and Privacy Review | Finalize security posture and user privacy messaging. | - [ ] Permissions are minimal and justified.<br>- [ ] Privacy statement/copy is finalized.<br>- [ ] No unnecessary data collection is present. |
| P6 | P6.3 | Store Listing Preparation | Prepare all Chrome Web Store listing assets and content. | - [ ] Store description is complete.<br>- [ ] Screenshots and icons are prepared.<br>- [ ] Category and metadata are finalized. |
| P6 | P6.4 | Versioning and Packaging | Build and package releasable extension artifact. | - [ ] Version number is updated.<br>- [ ] Production build is generated.<br>- [ ] Upload-ready package is created and validated. |
| P6 | P6.5 | Release Readiness Gate | Final go/no-go gate before store submission. | - [ ] QA checklist passes.<br>- [ ] Release notes are finalized.<br>- [ ] Package is ready for Web Store upload. |

## Progress Tracking Template

- Current phase:
- This week goals:
- Blockers:
- Risks:
- Next milestone date:
