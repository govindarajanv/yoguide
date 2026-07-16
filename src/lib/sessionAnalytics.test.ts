import { describe, expect, it } from 'vitest'
import { DEFAULT_APP_CONFIG } from '../config/appConfig'
import type { PracticeStep } from './types'
import { buildCategorySummaries } from './sessionAnalytics'

const steps: PracticeStep[] = [
  {
    id: 'warm-1',
    category: 'warmUp',
    name: 'Warm',
    sets: 1,
    reps: 1,
    durationSec: 60,
    cue: '',
  },
  {
    id: 'core-1',
    category: 'core',
    name: 'Core',
    sets: 1,
    reps: 1,
    durationSec: 60,
    cue: '',
  },
  {
    id: 'warm-2',
    category: 'warmUp',
    name: 'Warm again',
    sets: 1,
    reps: 1,
    durationSec: 30,
    cue: '',
  },
]

describe('buildCategorySummaries', () => {
  it('groups active time and calories by category', () => {
    const summaries = buildCategorySummaries(
      steps,
      { 'warm-1': 60_000, 'core-1': 30_000, 'warm-2': 30_000 },
      DEFAULT_APP_CONFIG,
    )
    expect(summaries.map(({ category, elapsedMs }) => ({ category, elapsedMs }))).toEqual([
      { category: 'warmUp', elapsedMs: 90_000 },
      { category: 'core', elapsedMs: 30_000 },
    ])
    expect(summaries[0]?.calories).toBeCloseTo(8.4, 5)
    expect(summaries[1]?.calories).toBeCloseTo(3.5, 5)
  })

  it('omits categories with no active time', () => {
    expect(buildCategorySummaries(steps, {}, DEFAULT_APP_CONFIG)).toEqual([])
  })
})
