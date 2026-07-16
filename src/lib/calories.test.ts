import { describe, expect, it } from 'vitest'
import type { AppConfig } from '../config/appConfig'
import type { PracticeStep } from './types'
import { calculateCalories, getMet } from './calories'

const config: AppConfig = {
  profile: { weightKg: 80 },
  timer: {
    shortActivityMaxSeconds: 30,
    shortWarningSeconds: 3,
    standardWarningSeconds: 5,
  },
  met: {
    default: 2.5,
    categories: { core: 5 },
    activities: { 'core-1': 7 },
  },
}

const step: PracticeStep = {
  id: 'core-1',
  category: 'core',
  name: 'High Knees',
  sets: 1,
  reps: 30,
  durationSec: 60,
  cue: 'Move steadily.',
}

describe('calculateCalories', () => {
  it('calculates partial activity calories for 80 kg', () => {
    expect(calculateCalories(80, 5, 30_000)).toBeCloseTo(3.5, 5)
  })

  it('returns zero for invalid or non-positive values', () => {
    expect(calculateCalories(0, 5, 60_000)).toBe(0)
    expect(calculateCalories(80, -1, 60_000)).toBe(0)
    expect(calculateCalories(80, 5, 0)).toBe(0)
  })
})

describe('getMet', () => {
  it('prefers activity override over category and default', () => {
    expect(getMet(step, config)).toBe(7)
  })

  it('falls back from category to default', () => {
    const categoryOnly = { ...step, id: 'core-2' }
    const defaultOnly = { ...step, id: 'unknown', category: 'prayer' as const }
    expect(getMet(categoryOnly, config)).toBe(5)
    expect(getMet(defaultOnly, config)).toBe(2.5)
  })
})
