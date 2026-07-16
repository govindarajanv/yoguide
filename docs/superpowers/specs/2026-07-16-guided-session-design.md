# Guided Session and Professional UI Redesign

Date: 2026-07-16  
Status: Implemented

## Goal

Upgrade the Yogasana Practice Companion from a manual checklist into an optional guided workout experience. The user can start the complete session, hear activity instructions, follow synchronized activity and overall timers, pause or stop safely, and see an estimated calorie total. Manual check-offs remain available outside guided mode.

The visual design changes to the approved **Modern Athletic** direction and the Week view becomes readable on both mobile and desktop.

## Product decisions

- Guided mode is optional and starts only after an explicit user click.
- Starting guided mode begins the overall elapsed timer and the first activity timer.
- Activities advance automatically when their timer reaches zero.
- Each activity is voiced when it begins.
- Activities of 30 seconds or less receive an ending warning at 3 seconds.
- Longer activities receive an ending warning at 5 seconds.
- Pause, Resume, and Stop controls remain fixed and visible regardless of scroll position.
- Stop opens a confirmation with **Save & end**, **Reset**, and **Cancel**.
- Calorie estimation uses a configured body weight of 80 kg.
- Runtime configuration lives in `config/app.yaml`.
- Existing manual check-offs and local-only persistence remain supported.
- No account, backend, or cloud data storage is introduced.

## Guided session behavior

### States

The session uses one explicit state machine:

```text
idle → running ↔ paused
running|paused → stop-confirmation
stop-confirmation → running|paused | saved | idle
running → completed
```

- **idle**: no guided session is active.
- **running**: overall elapsed time, current activity time, and calorie estimate advance.
- **paused**: all time and calorie accumulation freeze.
- **stop-confirmation**: timers remain frozen while the user decides.
- **saved**: progress, elapsed time, current position, and calories remain available as the completed/ended session summary.
- **completed**: all activities have finished automatically.

Only one timing source drives all derived values. The implementation records timestamps and accumulated active milliseconds rather than relying on interval counts, preventing timer drift when the browser throttles rendering.

### Starting

The Home and Practice screens expose a prominent Play button labelled **Start guided session**. The click:

1. Ensures the Practice screen is visible.
2. Creates a fresh guided-session state unless a saved resumable session exists.
3. Starts the first incomplete activity.
4. Speaks its introduction.
5. Starts overall elapsed time, activity countdown, and calorie accumulation together.

If a stopped session was saved, the UI offers **Resume saved session** and **Start over**.

### Activity announcement

At activity start, the app speaks:

> “[Activity name]. [sets and reps]. [duration]. [short cue].”

The announcement uses the browser Web Speech API. Speech is initiated only after the user’s Start or Resume interaction to comply with browser autoplay restrictions.

If speech synthesis is unsupported or blocked:

- The timers and guided session continue.
- The same instruction remains visible in the active activity card.
- A non-blocking “Voice unavailable” indicator appears in the controller.

Starting a new announcement cancels stale queued speech first.

### Ending warning and advancement

- Duration ≤30 seconds: warning at 3 seconds remaining.
- Duration >30 seconds: warning at 5 seconds remaining.
- Warning text: “[Activity name] ends in [three/five] seconds.”
- Each warning is emitted once.
- At zero, the current item is checked off automatically and the next item begins.
- The next item is announced before its active countdown begins so spoken setup does not consume exercise time.
- When the final item ends, the session is marked complete and a completion announcement is played.

### Pause and resume

Pause:

- Freezes overall elapsed time, activity remaining time, and calories.
- Cancels queued/in-progress speech.
- Leaves the current activity and remaining time visible.

Resume:

- Announces “[Activity name]. Resume with [remaining time].”
- Restarts timers after that short announcement.

### Stop

Stop opens an accessible confirmation dialog and freezes the session.

- **Save & end**: stores activity position, remaining time, active elapsed time, calorie estimate inputs, and checked activities in `localStorage`; closes guided mode and shows a summary.
- **Reset**: clears guided state, guided calorie total, and guided automatic progress after a second destructive-action confirmation. Existing historical completed dates are not deleted.
- **Cancel**: returns to the prior running or paused state. If the session was running, it resumes from the frozen timestamp.

## Persistent controller

The controller is fixed above the device safe-area inset and remains visible while the practice list scrolls.

It displays:

- Current activity and position, such as “4 of 41”
- Current activity countdown
- Overall active elapsed time
- Estimated calories
- Primary Play/Pause/Resume control
- Stop control

The page receives enough bottom padding that the controller never obscures the final activity. Keyboard focus is visible, touch targets are at least 44×44 px, and icon buttons include text or accessible labels.

## Calorie estimate

### Configuration

`config/app.yaml` contains:

```yaml
profile:
  weightKg: 80

timer:
  shortActivityMaxSeconds: 30
  shortWarningSeconds: 3
  standardWarningSeconds: 5

met:
  default: 2.5
  categories:
    prayer: 1.5
    warmUp: 4.0
    relaxation: 2.0
    core: 5.0
    asanas: 4.0
    coolDown: 2.5
    pranayama: 2.0
    meditation: 1.3
  activities: {}
```

Activity-specific MET entries override category values. Category values override the default.

Configuration is parsed and validated during the build/runtime initialization. Invalid or missing values use documented safe defaults and emit a development warning. Weight must be a finite positive number.

### Formula

For each active activity:

```text
kcal = MET × 3.5 × weightKg ÷ 200 × activeMinutes
```

The total is the sum of:

- Active elapsed time in completed guided activities
- Active elapsed time in the current guided activity

Paused time, announcement setup time, and time spent in the stop dialog do not count. The UI labels the value **Estimated calories** because MET-based calculations are approximate and not medical measurements.

## Visual design

### Direction

Use the approved **Modern Athletic** system:

- Near-black and deep charcoal surfaces
- High-contrast off-white text
- Acid-lime accent reserved for active state and primary actions
- Modern sans-serif typography with strong numeric hierarchy
- Compact labels, generous content spacing, and restrained borders
- Metrics shown in structured cards rather than prose

The interface must remain calm enough for yoga; the athletic treatment should improve hierarchy without becoming noisy or competitive.

### Home

- Brand and day/track header
- Strong guided-session hero
- Duration, activity count, progress, and calorie estimate metric cards
- Primary Start/Resume button
- “Different from yesterday” below the primary session summary
- Manual Practice and Week navigation remain available

### Practice

- Active activity appears as a high-contrast feature card.
- Upcoming/completed activities use quieter cards.
- Current countdown is the dominant number.
- The fixed controller is the only always-on action surface.
- Automatic progress updates the same check-off data used by manual mode.

### Week

The current seven equal-width buttons are replaced:

- **Mobile**: horizontally scrollable day chips followed by a full-width selected-day panel.
- **Tablet/Desktop**: responsive two- or three-column day-card grid, not seven compressed columns.
- Each card shows track, total duration, five core highlights, and pranayama summary.
- Today and the selected day receive distinct but accessible treatments.
- Previewing another day never modifies today’s progress.

## Architecture

### New modules

- `config/app.yaml`: editable profile, warning, and MET settings.
- `src/config/appConfig.ts`: YAML import, validation, defaults, typed configuration.
- `src/lib/calories.ts`: pure MET lookup and calorie formula.
- `src/lib/speech.ts`: Web Speech API adapter and capability detection.
- `src/hooks/useGuidedSession.ts`: reducer/state machine, timestamp-based timing, persistence, and activity transitions.
- `src/components/SessionController.tsx`: fixed controls and live metrics.
- `src/components/StopSessionDialog.tsx`: accessible stop confirmation.
- `src/components/SessionSummary.tsx`: saved/completed session result.

### Existing modules

- `src/App.tsx`: owns navigation and integrates guided-session state.
- `src/components/Home.tsx`: guided-session hero and resume entry.
- `src/components/Practice.tsx`: guided activity state and automatic/manual check-offs.
- `src/components/Week.tsx`: responsive day cards/selected-day panel.
- `src/data/schedule.ts`: remains the source of activity order and duration.
- `src/lib/progress.ts`: extends local persistence for guided-session snapshots.
- `src/index.css`: replaced with Modern Athletic design tokens and responsive components.

### Persistence

Use versioned, date-scoped keys:

- `yoga-schedule:guided:v1:YYYY-MM-DD`
- Existing check-off and completed-date keys remain compatible.

The guided snapshot stores status, activity index, remaining milliseconds, active elapsed milliseconds, per-activity active elapsed values, and warning state. It does not store precomputed calories as the source of truth; calories are recomputed from elapsed values and current configuration.

## Error handling

- Unsupported speech: continue silently with visible instructions.
- Browser sleep/background throttling: recompute from timestamps on wake.
- Corrupt saved session: discard only the guided snapshot and preserve manual progress.
- Missing/invalid YAML: use safe defaults and warn during development.
- Zero/negative duration: skip the invalid activity, report a development warning, and continue.
- Local storage unavailable: keep session in memory and show a non-blocking persistence warning.

## Testing

### Unit tests

- Warning threshold selection at 30/31 seconds
- MET precedence: activity → category → default
- Calorie formula for 80 kg and partial activity time
- Paused time excluded
- Reducer transitions for start, pause, resume, advance, save, reset, and complete
- Timestamp reconciliation after delayed browser ticks
- Snapshot migration/validation and corrupt-data fallback

### Component tests

- Controller remains rendered in running, paused, and stop-confirmation states
- Stop dialog actions produce correct state transitions
- Unsupported speech displays fallback status
- Week renders mobile selected-day content and desktop cards

### End-to-end checks

- Start → announce → warning → auto-advance
- Pause freezes all metrics; resume continues accurately
- Save & end → reload → resume
- Reset clears only current guided state
- Complete full mocked short session
- Verify mobile controller does not cover final item

## Success criteria

- One Start click begins a synchronized guided session.
- Every activity is announced and receives exactly one ending warning.
- Activity and overall timers remain accurate across pause, resume, scroll, and browser throttling.
- Estimated calories update continuously from configured 80 kg weight and MET values.
- Pause/Resume/Stop controls are always visible during a guided session.
- Stop provides explicit Save & end and Reset choices.
- Week is readable without seven compressed columns.
- The app presents a cohesive Modern Athletic visual system on mobile and desktop.
