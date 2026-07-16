import { parse } from 'yaml'
import rawConfig from '../../config/app.yaml?raw'
import type { Category } from '../lib/types'

export type AppConfig = {
  profile: { weightKg: number }
  timer: {
    shortActivityMaxSeconds: number
    shortWarningSeconds: number
    standardWarningSeconds: number
  }
  met: {
    default: number
    categories: Partial<Record<Category, number>>
    activities: Record<string, number>
  }
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  profile: { weightKg: 80 },
  timer: {
    shortActivityMaxSeconds: 30,
    shortWarningSeconds: 3,
    standardWarningSeconds: 5,
  },
  met: {
    default: 2.5,
    categories: {
      prayer: 1.5,
      warmUp: 4,
      relaxation: 2,
      core: 5,
      asanas: 4,
      coolDown: 2.5,
      pranayama: 2,
      meditation: 1.3,
    },
    activities: {},
  },
}

function positive(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

function positiveRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] > 0,
    ),
  )
}

export function parseAppConfig(source: string): AppConfig {
  try {
    const parsed = parse(source) as Record<string, any>
    return {
      profile: {
        weightKg: positive(parsed?.profile?.weightKg, DEFAULT_APP_CONFIG.profile.weightKg),
      },
      timer: {
        shortActivityMaxSeconds: positive(
          parsed?.timer?.shortActivityMaxSeconds,
          DEFAULT_APP_CONFIG.timer.shortActivityMaxSeconds,
        ),
        shortWarningSeconds: positive(
          parsed?.timer?.shortWarningSeconds,
          DEFAULT_APP_CONFIG.timer.shortWarningSeconds,
        ),
        standardWarningSeconds: positive(
          parsed?.timer?.standardWarningSeconds,
          DEFAULT_APP_CONFIG.timer.standardWarningSeconds,
        ),
      },
      met: {
        default: positive(parsed?.met?.default, DEFAULT_APP_CONFIG.met.default),
        categories: {
          ...DEFAULT_APP_CONFIG.met.categories,
          ...positiveRecord(parsed?.met?.categories),
        },
        activities: positiveRecord(parsed?.met?.activities),
      },
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Invalid config/app.yaml; using defaults.', error)
    return DEFAULT_APP_CONFIG
  }
}

export const APP_CONFIG = parseAppConfig(rawConfig)
