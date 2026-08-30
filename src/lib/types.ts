export type DayId = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

export type Category =
  | 'prayer'
  | 'warmUp'
  | 'relaxation'
  | 'core'
  | 'asanas'
  | 'coolDown'
  | 'pranayama'
  | 'meditation'

export type StepDef = {
  id: string
  category: Category
  sets: number
  reps: number
  durationSec: number
  cue: string
  /** Same name every day when set */
  name?: string
  /** Per-day name when the exercise rotates */
  nameByDay?: Partial<Record<DayId, string>>
  /** Manual round helper (Surya Namaskar) */
  rounds?: number
  /** Repeat a ding every N seconds instead of a single midpoint ding */
  dingIntervalSec?: number
  /** Volume multiplier for the midpoint/interval ding (default 1) */
  dingGain?: number
  /** Override the spoken end-of-activity warning seconds (defaults to config) */
  finalWarningSec?: number
}

export type PracticeStep = {
  id: string
  category: Category
  name: string
  sets: number
  reps: number
  durationSec: number
  cue: string
  rounds?: number
  dingIntervalSec?: number
  dingGain?: number
  finalWarningSec?: number
}

export type DayTrack = 'sta' | 'mwf'

export type DayDiff = {
  stepId: string
  category: Category
  todayName: string
  yesterdayName: string
}
