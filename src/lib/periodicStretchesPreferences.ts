const KEY = 'yoga-schedule:periodic:settings:v1'

export type PeriodicStretchesPreferences = {
  includeWarmUp: boolean
}

export type PeriodicPreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>

export const DEFAULT_PERIODIC_STRETCHES_PREFERENCES: PeriodicStretchesPreferences = {
  includeWarmUp: true,
}

function browserStorage(): PeriodicPreferenceStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function loadPeriodicStretchesPreferences(
  storage: PeriodicPreferenceStorage | null = browserStorage(),
): PeriodicStretchesPreferences {
  if (!storage) return DEFAULT_PERIODIC_STRETCHES_PREFERENCES
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return DEFAULT_PERIODIC_STRETCHES_PREFERENCES
    const value = JSON.parse(raw) as Partial<PeriodicStretchesPreferences>
    return {
      includeWarmUp:
        typeof value.includeWarmUp === 'boolean'
          ? value.includeWarmUp
          : DEFAULT_PERIODIC_STRETCHES_PREFERENCES.includeWarmUp,
    }
  } catch {
    return DEFAULT_PERIODIC_STRETCHES_PREFERENCES
  }
}

export function savePeriodicStretchesPreferences(
  preferences: PeriodicStretchesPreferences,
  storage: PeriodicPreferenceStorage | null = browserStorage(),
): boolean {
  if (!storage) return false
  try {
    storage.setItem(
      KEY,
      JSON.stringify({
        includeWarmUp: preferences.includeWarmUp,
      }),
    )
    return true
  } catch {
    return false
  }
}
