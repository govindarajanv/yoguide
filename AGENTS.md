# Yogasana Practice Companion — Agent Instructions

Canonical instructions for **any** coding agent (Claude, Cursor, Codex, Copilot, Gemini/Antigravity, Qwen, OpenCode, GLM, etc.). Tool-specific files (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`) point here — do not duplicate product rules elsewhere.

## Product

Personal static SPA that helps follow a ~47-minute daily yoga/fitness schedule stored in `src/data/schedule.ts`.

**Locked product decisions:**

- Practice companion: day list + diff vs yesterday + large practice mode + soft check-off + cues + Surya round helper
- Optional guided mode: voice cues, per-activity countdown, overall active timer, fixed controls, and MET calorie estimate
- Voice and speed preferences are local; narration is title + time only
- Guided activities show curated general body targets; completed sessions show category charts
- Manual practice remains available without a timer
- Progress in `localStorage` only (no login)
- Hosted on **GitHub Pages**

## Stack

- Vite + React + TypeScript
- Schedule data: `src/data/schedule.ts`
- Day logic: `src/lib/schedule.ts`
- Progress: `src/lib/progress.ts`
- Guided state: `src/hooks/useGuidedSession.ts`, `src/hooks/guidedSessionReducer.ts`
- Runtime settings: `config/app.yaml` (80 kg profile, warnings, MET values)
- Activity targets: `src/data/activityBenefits.ts`
- Voice preferences: `src/lib/voicePreferences.ts`
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
- Day tracks: Sun/Tue/Thu/Sat · Mon/Wed/Fri for Core; pranayama rotates as in the sheet
- Total duration must stay **2400 seconds** unless the schedule requirements change
- Progress keys: `yoga-schedule:progress:YYYY-MM-DD`, rounds `yoga-schedule:rounds:YYYY-MM-DD`
- Guided snapshots: `yoga-schedule:guided:v1:YYYY-MM-DD`

## Do not

- Add accounts or backends
- Count paused, speech-announcement, or stop-dialog time as active exercise time
- Commit secrets
- Force-push `main`
- Duplicate long instructions into every tool file — keep pointers thin

## Deploy

- Workflow: `.github/workflows/pages.yml`
- GitHub Actions sets Vite `base` to `/yoguide/` (repository name).
