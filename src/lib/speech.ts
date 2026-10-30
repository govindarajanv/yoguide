import type { PracticeStep } from './types'
import type { VoicePreferences } from './voicePreferences'

export type SpeechController = {
  available: boolean
  getVoices: () => SpeechVoice[]
  speak: (text: string, preferences?: VoicePreferences) => Promise<boolean>
  cancel: () => void
  /**
   * Call synchronously from a user gesture (e.g. the guided Start/Resume tap).
   * Warm-up unlock is required on iOS Safari, where programmatic speak() is
   * silently suppressed unless the engine was primed from within a gesture.
   */
  unlock: () => void
  /** Resolve once voices are loaded (fires voiceschanged and polls as needed). */
  ready: () => Promise<SpeechVoice[]>
}

export type SpeechVoice = {
  voiceURI: string
  name: string
  lang: string
  default: boolean
}

export function buildActivityAnnouncement(step: PracticeStep): string {
  return `${step.name}. ${step.durationSec} seconds.`
}

export function buildResumeAnnouncement(step: PracticeStep, remainingMs: number): string {
  return `${step.name}. Resume with ${Math.ceil(remainingMs / 1000)} seconds remaining.`
}

export function createSpeechController(): SpeechController {
  const available =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'

  const voicesCache: SpeechVoice[] = []

  function refreshVoices(): SpeechVoice[] {
    if (!available) return []
    const mapped = window.speechSynthesis
      .getVoices()
      .map(({ voiceURI, name, lang, default: isDefault }) => ({
        voiceURI,
        name,
        lang,
        default: isDefault,
      }))
      .sort((a, b) => Number(b.default) - Number(a.default) || a.name.localeCompare(b.name))
    voicesCache.length = 0
    voicesCache.push(...mapped)
    return voicesCache
  }

  /**
   * Load voices and resolve once available. On mobile Chrome getVoices()
   * returns an empty list until `voiceschanged` fires; iOS may need a short
   * poll. Never rejects — returns whatever voices are known.
   */
  function loadVoices(timeoutMs = 4000): Promise<SpeechVoice[]> {
    const first = refreshVoices()
    if (first.length > 0) return Promise.resolve(first)
    return new Promise((resolve) => {
      let remaining = timeoutMs
      const started = Date.now()
      const check = () => {
        const voices = refreshVoices()
        if (voices.length > 0 || Date.now() - started >= remaining) {
          window.speechSynthesis?.removeEventListener('voiceschanged', check)
          clearInterval(timer)
          resolve(voices)
          return
        }
        remaining = timeoutMs - (Date.now() - started)
      }
      window.speechSynthesis?.addEventListener('voiceschanged', check)
      const timer = window.setInterval(check, 250)
    })
  }

  function warmUp(): void {
    if (!available) return
    try {
      // iOS Safari requires an utterance during the user gesture to enable
      // subsequent programmatic speaks; a blank/whitespace utterance is enough.
      window.speechSynthesis.cancel()
      const warmUpUtterance = new SpeechSynthesisUtterance(' ')
      window.speechSynthesis.speak(warmUpUtterance)
    } catch {
      // Non-fatal: only needed to unlock iOS.
    }
  }

  return {
    available,
    getVoices: refreshVoices,
    ready: loadVoices,
    unlock: warmUp,
    cancel() {
      if (available) window.speechSynthesis.cancel()
    },
    speak(text: string, preferences = { voiceURI: '', rate: 1 }) {
      if (!available) return Promise.resolve(false)
      return (loadVoices(1500) as Promise<unknown>).then(() => {
        window.speechSynthesis.cancel()
        return new Promise<boolean>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text)
          const selected = window.speechSynthesis
            .getVoices()
            .find((voice) => voice.voiceURI === preferences.voiceURI)
          if (selected) utterance.voice = selected
          // Align the utterance language with the selected/default voice so
          // Android Chrome and iOS pick a real, audible voice.
          const chosen = selected ?? window.speechSynthesis.getVoices().find((v) => v.default)
          if (chosen) utterance.lang = chosen.lang
          utterance.rate = preferences.rate
          utterance.pitch = 1
          utterance.onend = () => resolve(true)
          utterance.onerror = () => resolve(false)
          window.speechSynthesis.speak(utterance)
        })
      })
    },
  }
}
