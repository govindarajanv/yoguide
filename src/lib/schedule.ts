import { SCHEDULE_STEPS } from '../data/schedule'
import { CHAIR_YOGA_STEPS } from '../data/chairYogaSchedule'
import type { Category, DayDiff, DayId, DayTrack, PracticeStep, StepDef } from './types'

export const DAY_IDS: DayId[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export const DAY_LABELS: Record<DayId, string> = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  prayer: 'Prayer',
  warmUp: 'Warm Up',
  relaxation: 'Relaxation',
  core: 'Core',
  asanas: 'Asanas',
  coolDown: 'Cool Down',
  pranayama: 'Pranayama',
  meditation: 'Meditation',
}

export function jsDayToDayId(jsDay: number): DayId {
  // Date.getDay(): 0=Sun … 6=Sat
  return DAY_IDS[jsDay] ?? 'sun'
}

export function trackForDay(day: DayId): DayTrack {
  if (day === 'sun' || day === 'tue' || day === 'thu' || day === 'sat') return 'sta'
  return 'mwf'
}

export function trackLabel(track: DayTrack): string {
  if (track === 'sta') return 'Sun / Tue / Thu / Sat track'
  return 'Mon / Wed / Fri track'
}

function resolveName(def: StepDef, day: DayId): string {
  if (def.nameByDay?.[day]) return def.nameByDay[day]!
  if (def.name) return def.name
  throw new Error(`Missing name for step ${def.id} on ${day}`)
}

export function planForDay(day: DayId): PracticeStep[] {
  return SCHEDULE_STEPS.map((def) => ({
    id: def.id,
    category: def.category,
    name: resolveName(def, day),
    sets: def.sets,
    reps: def.reps,
    durationSec: def.durationSec,
    cue: def.cue,
    rounds: def.rounds,
    dingIntervalSec: def.dingIntervalSec,
    finalWarningSec: def.finalWarningSec,
  }))
}

export function chairYogaPlan(): PracticeStep[] {
  return CHAIR_YOGA_STEPS.map((def) => ({
    id: def.id,
    category: def.category,
    name: def.name ?? '',
    sets: def.sets,
    reps: def.reps,
    durationSec: def.durationSec,
    cue: def.cue,
    rounds: def.rounds,
    dingIntervalSec: def.dingIntervalSec,
    dingGain: def.dingGain,
    finalWarningSec: def.finalWarningSec,
  }))
}

export function totalDurationSec(steps: PracticeStep[]): number {
  return steps.reduce((sum, s) => sum + s.durationSec, 0)
}

export type PlanBlock = {
  /** Section label, e.g. "Block 1" or "Practice" */
  label: string
  name: string
  steps: PracticeStep[]
}

/** Step id where the two-block split lands for Sun/Tue/Thu/Sat routines. */
export const BLOCK_SPLIT_AFTER_STEP_ID = 'savasana'

/**
 * Sun/Tue/Thu/Sat run the routine in two blocks — the practice through
 * Savasana, then the cool-down and breath wind-down. Mon/Wed/Fri show the
 * whole day as a single block.
 */
export function blocksForDay(day: DayId): PlanBlock[] {
  const plan = planForDay(day)
  if (trackForDay(day) !== 'sta') {
    return [{ label: '', name: 'Practice', steps: plan }]
  }
  const splitIndex = plan.findIndex((step) => step.id === BLOCK_SPLIT_AFTER_STEP_ID)
  const endOfFirst = splitIndex >= 0 ? splitIndex + 1 : plan.length
  return [
    { label: 'Block 1', name: 'Practice', steps: plan.slice(0, endOfFirst) },
    { label: 'Block 2', name: 'Wind-down', steps: plan.slice(endOfFirst) },
  ]
}

export function blocksForChairYoga(): PlanBlock[] {
  const plan = chairYogaPlan()
  const splitIndex = plan.findIndex((step) => step.id === 'chair-savasana')
  const endOfFirst = splitIndex >= 0 ? splitIndex + 1 : plan.length
  return [
    { label: 'Block 1', name: 'Practice', steps: plan.slice(0, endOfFirst) },
    { label: 'Block 2', name: 'Wind-down', steps: plan.slice(endOfFirst) },
  ]
}

export function formatDuration(totalSec: number): string {
  const m = Math.round(totalSec / 60)
  return `~${m} min`
}

export function previousDay(day: DayId): DayId {
  const i = DAY_IDS.indexOf(day)
  return DAY_IDS[(i + 6) % 7]!
}

/** Steps whose resolved name differs from yesterday (mainly Core + Pranayama). */
export function diffVsYesterday(day: DayId): DayDiff[] {
  const today = planForDay(day)
  const yesterday = planForDay(previousDay(day))
  const diffs: DayDiff[] = []
  for (let i = 0; i < today.length; i++) {
    const t = today[i]!
    const y = yesterday[i]!
    if (t.name !== y.name) {
      diffs.push({
        stepId: t.id,
        category: t.category,
        todayName: t.name,
        yesterdayName: y.name,
      })
    }
  }
  return diffs
}

export function groupByCategory(steps: PracticeStep[]): { category: Category; steps: PracticeStep[] }[] {
  const groups: { category: Category; steps: PracticeStep[] }[] = []
  for (const step of steps) {
    const last = groups[groups.length - 1]
    if (last && last.category === step.category) {
      last.steps.push(step)
    } else {
      groups.push({ category: step.category, steps: [step] })
    }
  }
  return groups
}

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
