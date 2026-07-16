# Voice, Benefits, and Analytics Implementation Plan

> **For agentic workers:** Implement test-first and update checkboxes.

**Goal:** Add configurable speech, active-exercise target information, final
session charts, and robust full-width presentation.

## Tasks

- [x] Test and implement versioned voice preferences with rate clamping.
- [x] Extend speech controller with installed voices, selected voice, and rate.
- [x] Add top-of-Practice voice controls and test-voice action.
- [x] Curate benefit targets for all 41 schedule steps.
- [x] Add floating active-target card.
- [x] Test and implement time/calorie category aggregation.
- [x] Render accessible final-summary bar charts.
- [x] Enforce full viewport width and responsive floating-card/controller spacing.
- [x] Update docs and verify lint, tests, build, desktop, and mobile.

## Verification

```bash
npm run lint
npm test
npm run build
```

Do not commit unless the user explicitly requests it.
