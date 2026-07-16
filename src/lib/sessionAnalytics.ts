import type { AppConfig } from '../config/appConfig'
import { calculateCalories, getMet } from './calories'
import { CATEGORY_LABELS } from './schedule'
import type { Category, PracticeStep } from './types'

export type CategorySummary = {
  category: Category
  label: string
  elapsedMs: number
  calories: number
}

export function buildCategorySummaries(
  steps: PracticeStep[],
  activeElapsedByStep: Record<string, number>,
  config: AppConfig,
): CategorySummary[] {
  const grouped = new Map<Category, CategorySummary>()

  for (const step of steps) {
    const elapsedMs = activeElapsedByStep[step.id] ?? 0
    if (elapsedMs <= 0) continue
    const existing = grouped.get(step.category) ?? {
      category: step.category,
      label: CATEGORY_LABELS[step.category],
      elapsedMs: 0,
      calories: 0,
    }
    existing.elapsedMs += elapsedMs
    existing.calories += calculateCalories(config.profile.weightKg, getMet(step, config), elapsedMs)
    grouped.set(step.category, existing)
  }

  return [...grouped.values()]
}
