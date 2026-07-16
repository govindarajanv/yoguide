import { describe, expect, it } from 'vitest'
import { completeStep, loadProgress, type ProgressStorage } from './progress'

describe('completeStep', () => {
  it('is idempotent and never toggles a completed step off', () => {
    const data = new Map<string, string>()
    const storage: ProgressStorage = {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => void data.set(key, value),
    }
    completeStep('2026-07-16', 'warm-up', storage)
    completeStep('2026-07-16', 'warm-up', storage)
    expect(loadProgress('2026-07-16', storage)).toEqual({ 'warm-up': true })
  })
})
