import type { AppConfig } from '../config/appConfig'
import type { PracticeStep } from './types'

export function getMet(step: PracticeStep, config: AppConfig): number {
  return (
    config.met.activities[step.id] ??
    config.met.categories[step.category] ??
    config.met.default
  )
}

export function calculateCalories(weightKg: number, met: number, elapsedMs: number): number {
  if (
    !Number.isFinite(weightKg) ||
    !Number.isFinite(met) ||
    !Number.isFinite(elapsedMs) ||
    weightKg <= 0 ||
    met <= 0 ||
    elapsedMs <= 0
  ) {
    return 0
  }

  const elapsedMinutes = elapsedMs / 60_000
  return (met * 3.5 * weightKg * elapsedMinutes) / 200
}

export function calculateSessionCalories(
  steps: PracticeStep[],
  activeElapsedByStep: Record<string, number>,
  config: AppConfig,
): number {
  return steps.reduce((total, step) => {
    return total + calculateCalories(config.profile.weightKg, getMet(step, config), activeElapsedByStep[step.id] ?? 0)
  }, 0)
}
