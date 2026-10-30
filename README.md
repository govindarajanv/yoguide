# YOGUIDE — Your Yoga Guide

Static web app for a personal ~47-minute daily yoga/fitness schedule. It supports both manual check-offs and an optional voice-guided session with activity timers, fixed controls, and estimated calories.

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
- A system-voice selector, 0.75×–1.5× speed control, and a voice preview are
  available on the **home page** (Voice & speed) and in Practice. Preferences
  are saved locally.
- Spoken activity instructions contain only the title and available/remaining
  time; written form cues remain visible but are not narrated.
- **Pick your session** starts guided mode from any section or a single activity;
  for Surya Namaskar you can also start from a specific round.
- Surya Namaskar rings a single bell each round and announces the round number
  (round-based activities). Other activities ring once at their midpoint.
- "Muscle groups covered today" lists each body section with the number of
  activities that train it, e.g. **Arms (9)**.
- Activities up to 30 seconds warn at 3 seconds remaining; longer activities warn at 5 seconds.
- Pause freezes activity time, total active time, and calories.
- Stop offers **Save & end**, **Reset**, and **Cancel**.
- Calories use a configurable MET estimate and are not a medical measurement.
- A floating card shows general body targets during guided activities.
- Completed sessions show active-time and estimated-calorie charts by section.

## Alternate sections

- **Chair mode** (Chair Yoga) is a separate ~20-minute chair routine.
- **Periodic Stretches** is a separate optional micro-practice of six 2-minute
  gentle stretches, toggled from the home screen. Each activity can be played
  individually via **Pick your session** with the same voice cues as other sections.

The chair and periodic schedules live in
[`src/data/chairYogaSchedule.ts`](./src/data/chairYogaSchedule.ts) and
[`src/data/periodicStretchesSchedule.ts`](./src/data/periodicStretchesSchedule.ts).

Edit [`config/app.yaml`](./config/app.yaml) to change the local profile, warning thresholds, or MET values. The configured body weight is **80 kg**.

Voice uses the browser Web Speech API. If it is unavailable, visible timers and cues continue normally.

> **Mobile/iOS troubleshooting:** On iOS, voice (Web Speech) follows the
> **Silent / Ringer switch**, unlike media such as YouTube. If you hear no voice
> while your phone volume is high, turn **Silent mode off** (Control Center bell,
> or the physical switch/Action Button) — and make sure a speech voice is
> installed under **Settings → Accessibility → Spoken Content → Voices**.

## Deploy (GitHub Pages)

1. Use the GitHub repository named `yoguide`.
2. Push `main`.
3. Repo **Settings → Pages → Source: GitHub Actions**.
4. Site URL: `https://govindarajanv.github.io/yoguide/`

## Agents

Any coding agent should start at [`AGENTS.md`](./AGENTS.md). Specs/plans: `docs/superpowers/`.
