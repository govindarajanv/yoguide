import { describe, expect, it } from 'vitest'
import { createInitialGuidedState } from '../hooks/guidedSessionReducer'
import type { PracticeStep } from './types'
import {
  clearGuidedSnapshot,
  loadGuidedSnapshot,
  saveGuidedSnapshot,
  type StorageLike,
} from './guidedPersistence'

function memoryStorage(): StorageLike {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

const steps: PracticeStep[] = [
  {
    id: 'one',
    category: 'warmUp',
    name: 'One',
    sets: 1,
    reps: 1,
    durationSec: 10,
    cue: 'Move.',
  },
]

describe('guided persistence', () => {
  it('round-trips a valid versioned snapshot', () => {
    const storage = memoryStorage()
    const state = { ...createInitialGuidedState(steps), status: 'paused' as const }
    expect(saveGuidedSnapshot('2026-07-16', state, storage)).toBe(true)
    expect(loadGuidedSnapshot('2026-07-16', steps, storage)).toEqual(state)
  })

  it('rejects corrupt and incompatible snapshots', () => {
    const storage = memoryStorage()
    storage.setItem('yoga-schedule:guided:v1:bad', '{bad')
    storage.setItem(
      'yoga-schedule:guided:v1:old',
      JSON.stringify({ version: 0, state: createInitialGuidedState(steps) }),
    )
    expect(loadGuidedSnapshot('bad', steps, storage)).toBeNull()
    expect(loadGuidedSnapshot('old', steps, storage)).toBeNull()
  })

  it('clears only the selected date snapshot', () => {
    const storage = memoryStorage()
    const state = createInitialGuidedState(steps)
    saveGuidedSnapshot('one', state, storage)
    saveGuidedSnapshot('two', state, storage)
    clearGuidedSnapshot('one', storage)
    expect(loadGuidedSnapshot('one', steps, storage)).toBeNull()
    expect(loadGuidedSnapshot('two', steps, storage)).not.toBeNull()
  })
})
