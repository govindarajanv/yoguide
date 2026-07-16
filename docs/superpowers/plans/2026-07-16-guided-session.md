# Guided Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a voice-guided, timestamp-accurate session timer with fixed controls, calorie estimation, safe stop behavior, a responsive Week view, and the approved Modern Athletic visual system.

**Architecture:** A single reducer-backed `useGuidedSession` hook owns session state and derives time from timestamps to avoid interval drift. Pure configuration, calorie, persistence, and speech modules isolate browser side effects from testable state transitions. Existing check-off storage remains the shared source for manual and automatic completion.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Vitest 4, Web Speech API, YAML configuration, localStorage.

## Global Constraints

- Guided mode begins only after an explicit user click.
- Body weight is 80 kg in `config/app.yaml`.
- Activities ≤30 seconds warn at 3 seconds; longer activities warn at 5 seconds.
- Paused, announcement, and confirmation-dialog time does not count toward elapsed time or calories.
- Stop exposes Save & end, Reset, and Cancel.
- No backend, account, or cloud persistence.
- Keep the PDF-derived schedule at 41 steps and 2560 seconds.

---

### Task 1: Configuration and calorie engine

**Files:**
- Create: `config/app.yaml`
- Create: `src/config/appConfig.ts`
- Create: `src/types/yaml.d.ts`
- Create: `src/lib/calories.ts`
- Test: `src/lib/calories.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `APP_CONFIG: AppConfig`
- Produces: `getMet(step: PracticeStep, config: AppConfig): number`
- Produces: `calculateCalories(weightKg: number, met: number, elapsedMs: number): number`

- [x] Add `yaml` as a runtime dependency and declare raw YAML imports.
- [x] Write failing tests covering 80 kg partial-time calories and activity → category → default MET precedence.
- [x] Run `npm test -- src/lib/calories.test.ts`; expect failures because the module is missing.
- [x] Add YAML with weight, timer thresholds, category MET values, and empty activity overrides.
- [x] Parse and validate YAML, exporting safe typed defaults when individual fields are invalid.
- [x] Implement the pure calorie formula `MET × 3.5 × kg ÷ 200 × minutes`.
- [x] Run `npm test -- src/lib/calories.test.ts`; expect all tests to pass.

### Task 2: Guided reducer and timestamp reconciliation

**Files:**
- Create: `src/hooks/guidedSessionReducer.ts`
- Test: `src/hooks/guidedSessionReducer.test.ts`

**Interfaces:**
- Produces: `GuidedSessionState`, `GuidedSessionAction`
- Produces: `createInitialGuidedState(steps, saved?)`
- Produces: `guidedSessionReducer(state, action)`
- Produces: `reconcileAt(state, nowMs, steps, config): ReconcileResult`

- [x] Write failing reducer tests for start, pause, resume, warning, activity advancement, completion, stop-confirmation cancel, save, and reset.
- [x] Add a delayed-tick test proving timestamp reconciliation advances across multiple completed activities.
- [x] Run the focused test; expect missing-module failure.
- [x] Implement explicit `idle | announcing | running | paused | stop-confirmation | saved | completed` states.
- [x] Track `activityIndex`, `activityRemainingMs`, `totalActiveMs`, per-activity elapsed milliseconds, `runningSinceMs`, and warning emission.
- [x] Implement pure reconciliation that excludes paused/announcement/dialog time.
- [x] Run reducer tests; expect all tests to pass.

### Task 3: Speech, persistence, and guided hook

**Files:**
- Create: `src/lib/speech.ts`
- Create: `src/lib/guidedPersistence.ts`
- Create: `src/hooks/useGuidedSession.ts`
- Test: `src/lib/guidedPersistence.test.ts`
- Modify: `src/lib/progress.ts`

**Interfaces:**
- Produces: `createSpeechController(): SpeechController`
- Produces: `loadGuidedSnapshot(dateKey)`, `saveGuidedSnapshot(dateKey, snapshot)`, `clearGuidedSnapshot(dateKey)`
- Produces: `useGuidedSession({ steps, dateKey, onStepComplete })`

- [x] Write failing snapshot validation tests for valid, corrupt, and version-mismatched localStorage data.
- [x] Implement date-scoped key `yoga-schedule:guided:v1:YYYY-MM-DD` and safe in-memory fallback.
- [x] Implement speech capability detection, queue cancellation, and Promise-based utterances.
- [x] Implement the hook using one render interval only to trigger timestamp reconciliation.
- [x] Speak activity details before dispatching `ANNOUNCEMENT_FINISHED`; speak warnings once.
- [x] Automatically call `onStepComplete(step.id)` at each transition.
- [x] Persist resumable snapshots after reducer transitions.
- [x] Run all unit tests.

### Task 4: Controller, stop dialog, and summary

**Files:**
- Create: `src/components/SessionController.tsx`
- Create: `src/components/StopSessionDialog.tsx`
- Create: `src/components/SessionSummary.tsx`
- Test: `src/components/SessionController.test.tsx`
- Modify: `package.json`

**Interfaces:**
- `SessionController` receives current step, position, remaining/elapsed time, calories, status, speech availability, and pause/resume/stop handlers.
- `StopSessionDialog` receives open state and Save & end, Reset, Cancel handlers.
- `SessionSummary` receives elapsed milliseconds, calories, completed count, and Resume/Start-over handlers.

- [x] Add Testing Library with jsdom.
- [x] Write failing component tests for persistent controls in running/paused states and all stop-dialog actions.
- [x] Implement accessible fixed controller with ≥44 px controls and formatted timers.
- [x] Implement focus-safe dialog and destructive reset confirmation.
- [x] Implement saved/completed summary.
- [x] Run component tests and fix accessibility query failures.

### Task 5: App integration and guided Practice experience

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Home.tsx`
- Modify: `src/components/Practice.tsx`
- Modify: `src/lib/progress.ts`

**Interfaces:**
- Consumes `useGuidedSession`.
- Automatic completion writes the same date-scoped check-off record as manual completion.

- [x] Add a guarded `completeStep(dateKey, stepId)` that sets completion true without toggling it off.
- [x] Integrate guided state at App level so navigation does not destroy an active session.
- [x] Add Start/Resume guided action and metric cards to Home.
- [x] Render the active activity as the dominant Practice card and keep manual controls outside guided mode.
- [x] Add controller, stop dialog, and summary to App.
- [x] Ensure Surya manual rounds coexist with automatic guided completion.
- [x] Run all tests and build.

### Task 6: Responsive Week and Modern Athletic redesign

**Files:**
- Modify: `src/components/Week.tsx`
- Modify: `src/index.css`
- Modify: `index.html`

**Interfaces:**
- Week uses the existing `planForDay` and `trackForDay` functions.

- [x] Replace the seven-column strip with horizontally scrollable mobile chips and a full selected-day panel.
- [x] Add desktop two/three-column day cards containing track, duration, core highlights, and pranayama.
- [x] Replace current theme tokens with near-black/charcoal, off-white, and acid-lime tokens.
- [x] Add guided hero, metric, active-card, controller, dialog, summary, and responsive Week styles.
- [x] Add fixed-controller safe-area and bottom-content clearance.
- [x] Preserve visible focus, reduced motion, and 44×44 px touch targets.
- [x] Run lint, tests, and production build.

### Task 7: Documentation and final verification

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-07-16-guided-session.md`

- [x] Replace the obsolete “no auto timer” rule with optional guided-mode behavior.
- [x] Document `config/app.yaml`, 80 kg profile, MET estimates, browser speech limitations, and controls.
- [x] Run `npm run lint`, `npm test`, and `npm run build`.
- [x] Launch local app and verify Start, pause, stop dialog, and responsive Week through browser automation.
- [x] Mark every completed plan checkbox and record remaining browser-specific limitations.

Browser-specific note: Playwright exposes speech synthesis but does not complete
utterances, so warning/auto-advance voice timing is covered by reducer and speech
unit tests. Confirm the installed system voice once in a normal Chrome/Safari
session before relying on audio during practice.

## Verification commands

```bash
npm run lint
npm test
npm run build
```

Expected: zero lint errors, all tests pass, and Vite emits `dist/` successfully.

## Commit policy

Do not create commits unless the user explicitly requests them.
