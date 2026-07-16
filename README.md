# YOGUIDE — Your Yoga Guide

Static web app for a personal ~43-minute daily yoga/fitness schedule. It supports both manual check-offs and an optional voice-guided session with activity timers, fixed controls, and estimated calories.

The versioned schedule data lives in [`src/data/schedule.ts`](./src/data/schedule.ts).

## Develop

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## Guided session

- Start speaks each activity title and its available time.
- Practice includes an installed-system voice selector, 0.75×–1.5× speed control,
  and a voice preview. Preferences are saved locally.
- Spoken activity instructions contain only the title and available/remaining
  time; written form cues remain visible but are not narrated.
- Activities up to 30 seconds warn at 3 seconds remaining; longer activities warn at 5 seconds.
- Pause freezes activity time, total active time, and calories.
- Stop offers **Save & end**, **Reset**, and **Cancel**.
- Calories use a configurable MET estimate and are not a medical measurement.
- A floating card shows general body targets during guided activities.
- Completed sessions show active-time and estimated-calorie charts by section.

Edit [`config/app.yaml`](./config/app.yaml) to change the local profile, warning thresholds, or MET values. The configured body weight is **80 kg**.

Voice uses the browser Web Speech API. If it is unavailable, visible timers and cues continue normally.

## Deploy (GitHub Pages)

1. Use the GitHub repository named `yoguide`.
2. Push `main`.
3. Repo **Settings → Pages → Source: GitHub Actions**.
4. Site URL: `https://govindarajanv.github.io/yoguide/`

## Agents

Any coding agent should start at [`AGENTS.md`](./AGENTS.md). Specs/plans: `docs/superpowers/`.
