# PrioriTask Schema

This document defines the data architecture for PrioriTask.

For MVP, I am using local extension storage, not a remote database. The schema here describes logical entities and their storage representation.

## Storage Engine

- Primary: chrome.storage.local
- Optional future: chrome.storage.sync for lightweight user preferences

## Logical Entities

1. Assignment
2. UserSettings
3. AppMeta

## 1) Assignment Schema

```json
{
  "id": "string",
  "title": "string",
  "course": "string|null",
  "dueAt": "ISO-8601 datetime string",
  "mode": "DDS|DoD|B2D|EoC",
  "difficulty": "number|null",
  "benefitPoints": "number|null",
  "weight": "number|null",
  "effortHours": "number|null",
  "currentGrade": "number|null",
  "status": "pending|completed",
  "createdAt": "ISO-8601 datetime string",
  "updatedAt": "ISO-8601 datetime string"
}
```

Validation rules:
- title is required and non-empty.
- dueAt is required and valid date-time.
- mode is required enum.
- numeric fields are non-negative when present.
- currentGrade must be in [0, 100] when present.

## 2) UserSettings Schema

```json
{
  "defaultMode": "DDS|DoD|B2D|EoC",
  "alpha": "number",
  "epsilon": "number",
  "gamma": "number",
  "defaultNeed": "number",
  "uncertaintyDefault": "number",
  "availableHoursPerDay": "number",
  "reminderWindows": [48, 24, 6],
  "checkIntervalMinutes": 30,
  "notificationEnabled": true,
  "updatedAt": "ISO-8601 datetime string"
}
```

Validation rules:
- alpha > 0
- epsilon > 0
- gamma >= 0
- defaultNeed in [0, 1]
- uncertaintyDefault in [0, 1]
- availableHoursPerDay >= 0
- checkIntervalMinutes in [1, 180]

## 3) AppMeta Schema

```json
{
  "schemaVersion": 1,
  "lastMigrationAt": "ISO-8601 datetime string|null"
}
```

Purpose:
- Track schema evolution.
- Support safe migrations in future releases.

## Computed (Non-Persistent) Fields

These are computed at runtime and not saved as source-of-truth:

- safeDaysLeft
- baseScore
- riskScore
- finalPriorityScore
- explanationReasons

Reason:
- Avoid stale precomputed values.
- Ensure ranking always reflects latest time and settings.

## Storage Keys

Suggested key layout:

- prioritask.assignments
- prioritask.settings
- prioritask.meta

## Access Pattern

Read path:
1. Load settings.
2. Load assignments.
3. Validate and normalize.
4. Compute ranking.

Write path:
1. Validate payload.
2. Apply business rules.
3. Persist updates.
4. Trigger ranking refresh.

## Migration Strategy

When schema changes:

1. Increment schemaVersion.
2. Run migration function at startup.
3. Transform old records to new shape.
4. Save migrated data.
5. Log migration timestamp in AppMeta.

## Future Relational Mapping (If Backend Is Added)

If I later move to a backend database, this schema maps naturally to:

- assignments table
- settings table
- users table
- migrations table

For now, chrome.storage.local remains the MVP datastore.
