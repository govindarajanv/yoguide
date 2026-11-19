import { describe, expect, it } from 'vitest'
import {
  loadPeriodicStretchesPreferences,
  savePeriodicStretchesPreferences,
  type PeriodicPreferenceStorage,
} from './periodicStretchesPreferences'

function memoryStorage(): PeriodicPreferenceStorage {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  }
}

describe('periodic stretches preferences', () => {
  it('defaults to including the warm-up when no preference exists', () => {
    expect(loadPeriodicStretchesPreferences(memoryStorage()).includeWarmUp).toBe(true)
  })

  it('persists the include-warm-up setting', () => {
    const storage = memoryStorage()
    savePeriodicStretchesPreferences({ includeWarmUp: false }, storage)
    expect(loadPeriodicStretchesPreferences(storage).includeWarmUp).toBe(false)
  })

  it('falls back to warm-up on for corrupt values', () => {
    const corrupt = memoryStorage()
    corrupt.setItem('yoga-schedule:periodic:settings:v1', '{bad')
    expect(loadPeriodicStretchesPreferences(corrupt).includeWarmUp).toBe(true)
  })
})