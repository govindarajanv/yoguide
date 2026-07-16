# Voice Controls, Activity Targets, and Session Analytics

Date: 2026-07-16  
Status: Implemented

## Scope

Enhance guided practice with:

- A voice selector, speech-speed control (0.75×–1.5×), and preview button at the top of Practice.
- Persisted voice preferences in localStorage.
- Speech limited to activity title and available/remaining time.
- A floating card showing curated primary and secondary body targets for the active exercise.
- Final-session graphs for active time and estimated calories by schedule category.
- A defensive full-viewport layout rule to prevent white space outside the app.

## Voice behavior

The voice list comes from `speechSynthesis.getVoices()` and updates after the
browser emits `voiceschanged`. If the saved voice is unavailable, the browser
default is used. Rate changes apply to all subsequent announcements and to a
“Test voice” preview. Preferences use `yoga-schedule:voice-settings:v1`.

## Activity targets

`src/data/activityBenefits.ts` maps every schedule step ID to a concise primary
target and secondary target list. Labels describe general exercise targets,
not medical outcomes. The card is visible only during an active guided session.

## Analytics

Pure summary logic groups per-step active milliseconds and MET calories by
category. The completed summary renders two accessible horizontal bar charts:

1. Active minutes by category
2. Estimated calories by category

Bars include text values and do not rely on color alone.

## Testing

- Voice preference parsing, defaults, bounds, and persistence.
- Speech copy remains title + time only.
- Category aggregation and percentage scaling.
- Component visibility and accessible labels.
- Lint, full unit suite, production build, and responsive browser checks.
