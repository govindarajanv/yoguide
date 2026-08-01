# Yogasana Practice Companion — Design

Date: 2026-07-16

> Timer behavior in this original MVP design is superseded by
> `2026-07-16-guided-session-design.md`. Manual mode remains timer-free; guided
> mode adds opt-in voice cues, activity timers, fixed controls, and calories.

## Goal

Turn `Yogasana_schedule.pdf` into a static GitHub Pages app that makes daily practice clearer and easier to complete — without an auto countdown timer.

## Locked decisions

| Topic | Choice |
|-------|--------|
| Interaction | Glance at today + practice without running timer |
| Progress | Per-exercise check-off in `localStorage`, no login |
| Approach | Practice companion: list, diff, large practice mode, cues, Surya round helper |
| Hosting | GitHub Pages |
| Agents | `AGENTS.md` canonical; thin `CLAUDE.md` / `GEMINI.md` / Copilot / Cursor wiring |

## v1 priority

1. Never lose place (check-off + sticky current + now-playing)
2. Diff vs yesterday (Core + Pranayama)
3. Short cues + Surya Namaskar manual rounds

## Screens

1. **Home** — brand, today/track, duration, progress count, CTA, diff block, equipment line
2. **Practice** — category sections, large check rows, cue text, round helper, mark done
3. **Week** — day strip preview (does not overwrite today’s check-offs)

## Out of scope (MVP)

Auto timers, voice, video, accounts, PWA install.

## Data

Ordered steps in `src/data/schedule.ts` (49 steps, 2400 seconds). Day tracks: Sun/Wed/Sat · Mon/Thu · Tue/Fri for Core; pranayama rotation per sheet.
