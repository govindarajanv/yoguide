import { describe, expect, it } from 'vitest'
import {
  loadVoicePreferences,
  saveVoicePreferences,
  type VoicePreferenceStorage,
} from './voicePreferences'

function memoryStorage(): VoicePreferenceStorage {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  }
}

describe('voice preferences', () => {
  it('uses professional defaults when no preference exists', () => {
    expect(loadVoicePreferences(memoryStorage())).toEqual({ voiceURI: '', rate: 1 })
  })

  it('persists voice and rate', () => {
    const storage = memoryStorage()
    saveVoicePreferences({ voiceURI: 'voice-1', rate: 1.2 }, storage)
    expect(loadVoicePreferences(storage)).toEqual({ voiceURI: 'voice-1', rate: 1.2 })
  })

  it('clamps rate and rejects corrupt values', () => {
    const low = memoryStorage()
    saveVoicePreferences({ voiceURI: 'voice-1', rate: 0.1 }, low)
    expect(loadVoicePreferences(low).rate).toBe(0.75)

    const high = memoryStorage()
    saveVoicePreferences({ voiceURI: 'voice-1', rate: 4 }, high)
    expect(loadVoicePreferences(high).rate).toBe(1.5)

    const corrupt = memoryStorage()
    corrupt.setItem('yoga-schedule:voice-settings:v1', '{bad')
    expect(loadVoicePreferences(corrupt)).toEqual({ voiceURI: '', rate: 1 })
  })
})
