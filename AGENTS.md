# Yogasana Practice Companion — Agent Instructions

Canonical instructions for **any** coding agent (Claude, Cursor, Codex, Copilot, Gemini/Antigravity, Qwen, OpenCode, GLM, etc.). Tool-specific files (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`) point here — do not duplicate product rules elsewhere.

## Product

Personal static SPA that helps follow a ~47-minute daily yoga/fitness schedule stored in `src/data/schedule.ts`.

**Locked product decisions:**

- Practice companion: day list + muscle-coverage/benefits section + large practice mode + soft check-off + cues + Surya round helper
- "Muscle groups covered today" lists body sections (e.g. Arms) each with the count of activities that train it: `Arms (9)`
- Optional guided mode: voice cues, per-activity countdown, overall active timer, fixed controls, and MET calorie estimate
- **Pick your session** starts guided mode from any section or single activity; round-based activities (Surya Namaskar) can start from a chosen round
- **Periodic Stretches** is a separate optional micro-practice (six 2-minute gentle stretches) toggled from the home screen — it is never merged into the daily schedule. Any single activity can be played individually via Pick your session (voice works the same as other sections).
- Round-based activities ring a **single bell** per round then announce the round number (voice); non-round activities ring once at midpoint
- Voice and speed preferences are local; narration is title + time only (+ round number for Surya). A **Voice & speed** panel (voice selector, speed, Test voice) is shown on the **home page** and in Practice, so audio can be verified before starting.
- Guided activities show curated general body targets; completed sessions show category charts
- Manual practice remains available without a timer
- Progress in `localStorage` only (no login)
- Hosted on **GitHub Pages**

## Stack

- Vite + React + TypeScript
- Schedule data: `src/data/schedule.ts`
- Chair yoga data: `src/data/chairYogaSchedule.ts`
- Periodic Stretches data: `src/data/periodicStretchesSchedule.ts`
- Day logic: `src/lib/schedule.ts`
- Progress: `src/lib/progress.ts`
- Guided state: `src/hooks/useGuidedSession.ts`, `src/hooks/guidedSessionReducer.ts`
- Runtime settings: `config/app.yaml` (80 kg profile, warnings, MET values)
- Activity targets: `src/data/activityBenefits.ts`
- Voice preferences: `src/lib/voicePreferences.ts`
- Speech (Web Speech) + bells/tone: `src/lib/speech.ts`, `src/lib/ding.ts`
- Session charts: `src/lib/sessionAnalytics.ts`, `src/components/SessionCharts.tsx`
- UI: `src/components/{Home,Practice,Week}.tsx`, `src/App.tsx`
- Design / plan docs: `docs/superpowers/`

## Commands

```bash
npm install
npm run dev          # local root hosting; Pages builds use /yoguide/
npm test
npm run build
npm run preview
```

For local root hosting: `VITE_BASE=/ npm run dev`

## Resume protocol

1. `git pull` (or fetch) before editing
2. Read this file + latest spec under `docs/superpowers/specs/`
3. Open the active plan under `docs/superpowers/plans/` and do the **next unchecked** task
4. Prefer small, verified diffs; run `npm test` and `npm run build` before claiming done
5. Update plan checkboxes / leave a short status note if ending mid-task

## Data rules

- Session order and dosing come from `src/data/schedule.ts` — do not invent exercises
- Day tracks: Sun/Wed/Sat · Mon/Thu · Tue/Fri; pranayama rotates as in the sheet
- Total duration must stay **2400 seconds** unless the schedule requirements change
- Progress keys: `yoga-schedule:progress:YYYY-MM-DD`, rounds `yoga-schedule:rounds:YYYY-MM-DD`
- Guided snapshots: `yoga-schedule:guided:v1:YYYY-MM-DD`

## Audio / speech notes (mobile)

- Guided voice uses the **Web Speech API** (`src/lib/speech.ts`); bells/tone use **Web Audio** (`src/lib/ding.ts`).
- **iOS Safari** only plays the first `speak()` if it is primed inside a real user gesture. `SpeechController.unlock()` is called synchronously on Start/Start-from/Resume/Test-voice to warm up the engine before later programmatic speaks.
- Mobile browsers may return an empty `getVoices()` list until `voiceschanged` fires; never speak with no voice selected, and always assign a concrete voice + `lang`.
- **"No voice on iPhone" is frequently device-side, not a code bug:** Web Speech follows the iOS **Silent/Ringer switch** (unlike media/YouTube). Check Silent mode + a speech voice installed under Settings → Accessibility → Spoken Content before assuming a regression.

## Versioning (strict)

Semantic versioning, format `v[major].[minor].[patch]`. Source of truth is the `VERSION` file at repo root (e.g. `v0.4.0`).

Bump rules per commit:

- `major`: breaking change (removed/changed behavior, incompatible data or snapshot schema)
- `minor`: backwards-compatible new feature
- `patch`: bug fix, schedule/content update, docs, or tooling

Every commit **must**:

1. Bump `VERSION` and mirror it in `package.json#version` (`X.Y.Z`, no `v` prefix)
2. Use the largest change class in the commit (major > minor > patch)
3. Create a git tag `vX.Y.Z` on the commit
4. Never reuse, amend, or move an existing tag

The version string is displayed under the brand in `src/components/Home.tsx` via `VERSION?raw` — update it wherever the app renders version info.

## Do not

- Add accounts or backends
- Count paused, speech-announcement, or stop-dialog time as active exercise time
- Commit secrets
- Force-push `main`
- Duplicate long instructions into every tool file — keep pointers thin

## Deploy

- Workflow: `.github/workflows/pages.yml`
- GitHub Actions sets Vite `base` to `/yoguide/` (repository name).
