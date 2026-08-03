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
}

export type DayTrack = 'sta' | 'mwf'

export type DayDiff = {
  stepId: string
  category: Category
  todayName: string
  yesterdayName: string
}
