# Assignment Prioritization Algorithms (Polished and Safer Version)

This document refines the original four algorithms so they are safer to implement in PrioriTask and easier to explain to non-technical users.

## Shared Definitions

- Dy: Days left until deadline.
- d: Safe days left value where d = max(0, Dy).
- Df: Difficulty score from user input.
- Df_norm: Normalized difficulty in the range [0, 1].
- B: Benefit or points from the assignment.
- B_norm: Normalized benefit in the range [0, 1].
- W: Assignment weight in final grade.
- W_norm: Normalized weight in the range [0, 1].
- G: Current grade percentage.
- epsilon: Small constant (example: 0.05) to prevent division errors.

## Global Safety Rules (Use for All Algorithms)

1. Never divide by Dy directly. Always use (d + 1).
2. If Dy < 0 (already overdue), place task in an "Overdue" bucket first, then rank inside that bucket.
3. Clamp normalized values into [0, 1].
4. If required data is missing, use defaults and mark confidence as low.
5. Tie-breaker order: earliest deadline, higher weight, lower estimated effort.

---

## Solution 1: DDS (Due Date Score)

### Non-Technical Description

DDS is the simplest "deadline first" method. The closer the deadline, the higher the priority.

Why choose this as your standard:
- You want a very simple and transparent ranking.
- You mostly care about not missing submission dates.
- Assignments are similar in value and difficulty.

### Loopholes in Original Formula

- Division by zero when Dy = 0.
- Negative scores or unstable behavior for overdue tasks (Dy < 0).
- Ignores task value and effort.

### Formula

DDS_safe = 1 / (d + 1)

### Interpretation

- Higher DDS_safe means more urgent.
- Very stable and easy to explain to users.

### When to Use

- Quick mode.
- Minimal data available.
- Student wants a clean urgency-only view.

### When Not to Use

- Assignments have very different points, weights, or difficulty.

---

## Solution 2: DoD (Difficulty over Days)

### Non-Technical Description

DoD prioritizes assignments that are both difficult and close to deadline. It is useful for avoiding last-minute stress on hard tasks.

Why choose this as your standard:
- You want to start hard work early.
- You still want deadline pressure included.

### Loopholes in Original Formula

- Division by zero when Dy = 0.
- Difficulty scale can be inconsistent per user.
- Ignores assignment reward and grade impact.

### Formula

DoD_safe = Df_norm / (d + 1)

Optional smoothing for subjective difficulty:

Df_effective = 0.7 * Df_history + 0.3 * Df_new

Then use:

DoD_safe = Df_effective / (d + 1)

### Interpretation

- Higher DoD_safe means hard and urgent.
- Better than DDS when difficulty truly matters.

### When to Use

- Student tracks difficulty consistently.
- Main goal is reducing stress and avoiding hard-task cramming.

### When Not to Use

- Grade impact is the top concern.

---

## Solution 3: B2D (Benefit to Difficulty and Days)

### Non-Technical Description

B2D favors tasks that give better reward for the required effort and available time.

Why choose this as your standard:
- You want efficiency, not just urgency.
- You want to maximize points gained per effort.

### Loopholes in Original Formula

- Division by zero if Dy = 0 or Df = 0.
- Can over-prioritize far deadlines if benefit is large.
- Subjective Df can bias ranking.

### Formula

B2D_safe = B_norm / ((Df_norm + epsilon) * (d + 1)^alpha)

Recommended alpha:
- alpha = 1.0 for balanced urgency.
- alpha = 1.2 to 1.8 when you want stronger deadline pressure.

### Interpretation

- Higher B2D_safe means better reward efficiency under time pressure.

### When to Use

- Assignments differ a lot in points/benefit.
- Student wants strategic point maximization.

### When Not to Use

- Immediate deadline compliance is the only goal.

---

## Solution 4: EoC (Effort-Weighted Grade Impact)

### Non-Technical Description

EoC prioritizes tasks that can improve grades the most, considering urgency and effort.

Why choose this as your standard:
- You want grade optimization, not just task completion.
- You want a more objective approach than pure subjective difficulty.

### Loopholes in Original Formula

- Constant fallback (40) is arbitrary and may distort ranking.
- Unit mismatch (percentage, points, weight, days) without normalization.
- No direct effort estimate in denominator.

### Formula

Use normalized impact and explicit effort:

EoC_safe = (W_norm * B_norm * NeedFactor) / ((EffortHours + epsilon) * (d + 1)^alpha)

Where:
- NeedFactor = 1 - G_norm (if grade available)
- NeedFactor = default_need (example: 0.6) if no grade yet
- G_norm = G / 100, clamped to [0, 1]

### Interpretation

- Higher EoC_safe means better grade impact per hour under current time pressure.

### When to Use

- Student has grade and weight data.
- Goal is to maximize grade improvement.

### When Not to Use

- User wants only a quick deadline checklist.

---

## Solution 5: FSR (Feasibility and Schedule Risk)

### Non-Technical Description

FSR checks whether an assignment is still realistically finishable before the deadline, given available study time. This complements the other algorithms because a task can be important but still impossible to complete on time.

Why choose this as your standard:
- You want to avoid unrealistic plans.
- You want early warning for likely late submissions.
- You need a practical "can I still finish this?" signal.

### Loopholes in Simple Feasibility Checks

- Binary checks (possible/impossible) are too rigid.
- Ignoring uncertainty in effort estimates causes false confidence.
- Not considering daily available hours can mislead prioritization.

### Formula

FSR = (EffortHours * (1 + Uncertainty)) / (AvailableHoursPerDay * (d + 1) + epsilon)

Where:
- Uncertainty is in [0, 1] (example: 0.3 means 30% effort buffer).
- FSR > 1 means high risk of missing deadline.
- FSR <= 1 means currently feasible.

Priority usage:
- Use FSR as a risk multiplier on other scores.
- Example: RiskBoost = 1 + gamma * max(0, FSR - 1)

### Interpretation

- Higher FSR means higher schedule risk.
- It prevents the app from recommending impossible plans.

### When to Use

- User provides effort estimates and daily study capacity.
- Workload is heavy and deadline collisions are common.

### When Not to Use

- No reliable effort or availability data exists yet.

---

## Comparison Matrix

| Feature | DDS | DoD | B2D | EoC | FSR |
| --- | --- | --- | --- | --- | --- |
| Uses deadline pressure | Yes | Yes | Yes | Yes | Yes |
| Uses difficulty | No | Yes | Yes | Optional | No |
| Uses benefit/points | No | No | Yes | Yes | No |
| Uses current grade | No | No | No | Yes | No |
| Uses estimated effort | No | Optional | Optional | Yes | Yes |
| Uses available study time | No | No | No | No | Yes |
| Easiest to explain | High | Medium | Medium | Low | Medium |
| Best for grade optimization | Low | Medium | Medium | High | Low |
| Best for feasibility risk alerts | Low | Low | Low | Medium | High |

## Practical Recommendation for PrioriTask

Use multiple modes in the app:

1. Basic mode: DDS_safe.
2. Stress-control mode: DoD_safe.
3. Efficiency mode: B2D_safe.
4. Grade-optimization mode (default for advanced users): EoC_safe.
5. Feasibility guardrail: FSR as overlay across all modes.

This keeps the system beginner-friendly while still offering advanced prioritization.

## Final Notes for Foolproof Implementation

- Always display why a task is ranked high (deadline, impact, effort, or difficulty).
- Show "confidence" when inputs are guessed or missing.
- Keep formulas transparent in the UI so users trust the ranking.
- Recompute priorities whenever due date, effort, or grade data changes.

