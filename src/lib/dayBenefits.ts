import type { AppConfig } from '../config/appConfig'
import { getActivityBenefit } from '../data/activityBenefits'
import { calculateCalories, getMet } from './calories'
import type { PracticeStep } from './types'

export type DayBenefits = {
  /** Muscle groups / body targets covered by the day's schedule */
  muscles: string[]
  /** Estimated calories burned if every activity is completed */
  calories: number
  /** Metabolic & physiological benefits realized on completion */
  physiology: string[]
}

const CARDIOMETABOLIC = new Set([
  'High Knees',
  'Mountain Climbers',
  'Surya Namaskar',
  'Butt Kickers',
  'Side Jack',
  'Side Lunge',
  'Deep Squats',
  'Wall Sit',
  'Push Ups',
])

export function buildDayBenefits(steps: PracticeStep[], config: AppConfig): DayBenefits {
  const muscles = new Set<string>()
  for (const step of steps) {
    const benefit = getActivityBenefit(step)
    muscles.add(benefit.primary)
    for (const secondary of benefit.secondary) muscles.add(secondary)
  }

  const categories = new Set(steps.map((step) => step.category))
  const hasCardio = steps.some((step) => CARDIOMETABOLIC.has(step.name))

  const physiology: string[] = []
  if (hasCardio) physiology.push('Cardiovascular conditioning and a metabolic boost')
  if (categories.has('core') || categories.has('asanas')) {
    physiology.push('Muscular strength and endurance')
  }
  if (categories.has('warmUp') || categories.has('coolDown')) {
    physiology.push('Joint mobility and flexibility')
  }
  if (categories.has('pranayama')) physiology.push('Breath control and respiratory capacity')
  if (categories.has('meditation') || categories.has('relaxation') || categories.has('prayer')) {
    physiology.push('Stress reduction and nervous-system recovery')
  }
  if (physiology.length === 0) physiology.push('Mobility and whole-body wellness')

  const calories = steps.reduce(
    (total, step) =>
      total + calculateCalories(config.profile.weightKg, getMet(step, config), step.durationSec * 1000),
    0,
  )

  return { muscles: [...muscles], calories, physiology }
}
