import type { PracticeStep } from './types'
import type { VoicePreferences } from './voicePreferences'

export type SpeechController = {
  available: boolean
  getVoices: () => SpeechVoice[]
  speak: (text: string, preferences?: VoicePreferences) => Promise<boolean>
  cancel: () => void
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

  return {
    available,
    getVoices() {
      if (!available) return []
      return window.speechSynthesis
        .getVoices()
        .map(({ voiceURI, name, lang, default: isDefault }) => ({
          voiceURI,
          name,
          lang,
          default: isDefault,
        }))
        .sort((a, b) => Number(b.default) - Number(a.default) || a.name.localeCompare(b.name))
    },
    cancel() {
      if (available) window.speechSynthesis.cancel()
    },
    speak(text: string, preferences = { voiceURI: '', rate: 1 }) {
      if (!available) return Promise.resolve(false)
      window.speechSynthesis.cancel()
      return new Promise<boolean>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text)
        const selected = window.speechSynthesis
          .getVoices()
          .find((voice) => voice.voiceURI === preferences.voiceURI)
        if (selected) utterance.voice = selected
        utterance.rate = preferences.rate
        utterance.pitch = 1
        utterance.onend = () => resolve(true)
        utterance.onerror = () => resolve(false)
        window.speechSynthesis.speak(utterance)
      })
    },
  }
}
