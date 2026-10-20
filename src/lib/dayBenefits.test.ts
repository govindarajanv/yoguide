import { describe, expect, it } from 'vitest'
import { DEFAULT_APP_CONFIG } from '../config/appConfig'
import type { PracticeStep } from './types'
import { buildDayBenefits } from './dayBenefits'

const steps: PracticeStep[] = [
  {
    id: 'surya-namaskar',
    category: 'asanas',
    name: 'Surya Namaskar',
    sets: 1,
    reps: 1,
    durationSec: 220,
    cue: 'Flow.',
  },
  {
    id: 'torso',
    category: 'warmUp',
    name: 'Torso Twist',
    sets: 1,
    reps: 1,
    durationSec: 30,
    cue: 'Twist.',
  },
  {
    id: 'meditation',
    category: 'meditation',
    name: 'Meditation',
    sets: 1,
    reps: 1,
    durationSec: 60,
    cue: 'Rest.',
  },
]

describe('buildDayBenefits', () => {
  it('collects unique muscle targets across the day', () => {
    const benefits = buildDayBenefits(steps, DEFAULT_APP_CONFIG)
    expect(benefits.muscles).toContain('Full body')
    expect(benefits.muscles).toContain('Obliques')
    expect(benefits.muscles).toContain('Attention & breath')
    expect(new Set(benefits.muscles).size).toBe(benefits.muscles.length)
  })

  it('reports a positive metabolic burn estimate', () => {
    const benefits = buildDayBenefits(steps, DEFAULT_APP_CONFIG)
    expect(benefits.calories).toBeGreaterThan(0)
  })

  it('derives cardio, strength, mobility and recovery physiology', () => {
    const benefits = buildDayBenefits(steps, DEFAULT_APP_CONFIG)
    expect(benefits.physiology).toEqual(
      expect.arrayContaining([
        'Cardiovascular conditioning and a metabolic boost',
        'Muscular strength and endurance',
        'Joint mobility and flexibility',
        'Stress reduction and nervous-system recovery',
      ]),
    )
  })
})
