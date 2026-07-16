const KEY = 'yoga-schedule:voice-settings:v1'

export type VoicePreferences = {
  voiceURI: string
  rate: number
}

export type VoicePreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>

export const DEFAULT_VOICE_PREFERENCES: VoicePreferences = {
  voiceURI: '',
  rate: 1,
}

export function clampVoiceRate(rate: number): number {
  if (!Number.isFinite(rate)) return DEFAULT_VOICE_PREFERENCES.rate
  return Math.min(1.5, Math.max(0.75, rate))
}

function browserStorage(): VoicePreferenceStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function loadVoicePreferences(
  storage: VoicePreferenceStorage | null = browserStorage(),
): VoicePreferences {
  if (!storage) return DEFAULT_VOICE_PREFERENCES
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return DEFAULT_VOICE_PREFERENCES
    const value = JSON.parse(raw) as Partial<VoicePreferences>
    return {
      voiceURI: typeof value.voiceURI === 'string' ? value.voiceURI : '',
      rate: clampVoiceRate(typeof value.rate === 'number' ? value.rate : 1),
    }
  } catch {
    return DEFAULT_VOICE_PREFERENCES
  }
}

export function saveVoicePreferences(
  preferences: VoicePreferences,
  storage: VoicePreferenceStorage | null = browserStorage(),
): boolean {
  if (!storage) return false
  try {
    storage.setItem(
      KEY,
      JSON.stringify({
        voiceURI: preferences.voiceURI,
        rate: clampVoiceRate(preferences.rate),
      }),
    )
    return true
  } catch {
    return false
  }
}
