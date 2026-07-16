import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { APP_CONFIG } from '../config/appConfig'
import { calculateSessionCalories } from '../lib/calories'
import {
  clearGuidedSnapshot,
  loadGuidedSnapshot,
  saveGuidedSnapshot,
} from '../lib/guidedPersistence'
import {
  buildActivityAnnouncement,
  buildResumeAnnouncement,
  createSpeechController,
  type SpeechVoice,
} from '../lib/speech'
import type { PracticeStep } from '../lib/types'
import {
  clampVoiceRate,
  loadVoicePreferences,
  saveVoicePreferences,
  type VoicePreferences,
} from '../lib/voicePreferences'
import {
  createInitialGuidedState,
  guidedSessionReducer,
  type GuidedSessionState,
} from './guidedSessionReducer'

type Options = {
  steps: PracticeStep[]
  dateKey: string
  onStepComplete: (stepId: string) => void
}

export type GuidedSession = {
  state: GuidedSessionState
  currentStep: PracticeStep | null
  calories: number
  speechAvailable: boolean
  voices: SpeechVoice[]
  voicePreferences: VoicePreferences
  setVoiceURI: (voiceURI: string) => void
  setVoiceRate: (rate: number) => void
  testVoice: () => void
  hasSavedSession: boolean
  start: () => void
  pause: () => void
  resume: () => void
  requestStop: () => void
  cancelStop: () => void
  saveAndEnd: () => void
  reset: () => void
}

export function useGuidedSession({ steps, dateKey, onStepComplete }: Options): GuidedSession {
  const speech = useMemo(() => createSpeechController(), [])
  const [voices, setVoices] = useState<SpeechVoice[]>(() => speech.getVoices())
  const [voicePreferences, setVoicePreferences] = useState(loadVoicePreferences)
  const [state, dispatch] = useReducer(
    guidedSessionReducer,
    undefined,
    (): GuidedSessionState =>
      loadGuidedSnapshot(dateKey, steps) ?? createInitialGuidedState(steps),
  )
  const announcedIndex = useRef<number | null>(null)
  const completionAnnounced = useRef(false)

  const currentStep = steps[state.activityIndex] ?? null
  const calories = calculateSessionCalories(steps, state.activeElapsedByStep, APP_CONFIG)

  const announceAndRun = useCallback(
    async (step: PracticeStep, resume = false) => {
      const copy = resume
        ? buildResumeAnnouncement(step, state.activityRemainingMs)
        : buildActivityAnnouncement(step)
      await speech.speak(copy, voicePreferences)
      dispatch({ type: 'ANNOUNCEMENT_FINISHED', nowMs: Date.now() })
    },
    [speech, state.activityRemainingMs, voicePreferences],
  )

  const start = useCallback(() => {
    const first = steps[state.activityIndex] ?? steps[0]
    if (!first) return
    completionAnnounced.current = false
    announcedIndex.current = state.activityIndex
    dispatch({ type: 'START' })
    void announceAndRun(first)
  }, [announceAndRun, state.activityIndex, steps])

  const pause = useCallback(() => {
    speech.cancel()
    dispatch({ type: 'PAUSE', nowMs: Date.now(), steps, config: APP_CONFIG })
  }, [speech, steps])

  const resume = useCallback(() => {
    if (!currentStep) return
    announcedIndex.current = state.activityIndex
    dispatch({ type: 'RESUME' })
    void announceAndRun(currentStep, true)
  }, [announceAndRun, currentStep, state.activityIndex])

  const requestStop = useCallback(() => {
    speech.cancel()
    dispatch({ type: 'REQUEST_STOP', nowMs: Date.now(), steps, config: APP_CONFIG })
  }, [speech, steps])

  const cancelStop = useCallback(() => {
    dispatch({ type: 'CANCEL_STOP', nowMs: Date.now() })
  }, [])

  const saveAndEnd = useCallback(() => {
    dispatch({ type: 'SAVE_AND_END' })
  }, [])

  const reset = useCallback(() => {
    speech.cancel()
    clearGuidedSnapshot(dateKey)
    announcedIndex.current = null
    completionAnnounced.current = false
    dispatch({ type: 'RESET', steps })
  }, [dateKey, speech, steps])

  useEffect(() => {
    if (state.status !== 'running') return
    const timer = window.setInterval(() => {
      dispatch({ type: 'TICK', nowMs: Date.now(), steps, config: APP_CONFIG })
    }, 250)
    return () => window.clearInterval(timer)
  }, [state.status, steps])

  useEffect(() => {
    for (const stepId of state.justCompletedStepIds) onStepComplete(stepId)
  }, [onStepComplete, state.justCompletedStepIds])

  useEffect(() => {
    if (
      state.status !== 'running' ||
      state.justCompletedStepIds.length === 0 ||
      !currentStep ||
      announcedIndex.current === state.activityIndex
    ) {
      return
    }
    announcedIndex.current = state.activityIndex
    dispatch({ type: 'BEGIN_ANNOUNCEMENT' })
    void announceAndRun(currentStep)
  }, [
    announceAndRun,
    currentStep,
    state.activityIndex,
    state.justCompletedStepIds.length,
    state.status,
  ])

  useEffect(() => {
    if (!state.pendingWarning || state.status !== 'running') return
    const step = steps.find((candidate) => candidate.id === state.pendingWarning?.stepId)
    if (!step) return
    void speech
      .speak(`${step.name} ends in ${state.pendingWarning.seconds} seconds.`, voicePreferences)
      .finally(() => dispatch({ type: 'ACK_WARNING' }))
  }, [speech, state.pendingWarning, state.status, steps, voicePreferences])

  useEffect(() => {
    if (state.status !== 'completed' || completionAnnounced.current) return
    completionAnnounced.current = true
    void speech.speak('Session complete. Well done.', voicePreferences)
  }, [speech, state.status, voicePreferences])

  useEffect(() => {
    if (!speech.available) return
    const refreshVoices = () => setVoices(speech.getVoices())
    refreshVoices()
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices)
  }, [speech])

  useEffect(() => {
    saveVoicePreferences(voicePreferences)
  }, [voicePreferences])

  useEffect(() => {
    if (state.status === 'idle') {
      clearGuidedSnapshot(dateKey)
    } else {
      saveGuidedSnapshot(dateKey, state)
    }
  }, [dateKey, state])

  useEffect(() => () => speech.cancel(), [speech])

  return {
    state,
    currentStep,
    calories,
    speechAvailable: speech.available,
    voices,
    voicePreferences,
    setVoiceURI(voiceURI: string) {
      setVoicePreferences((current) => ({ ...current, voiceURI }))
    },
    setVoiceRate(rate: number) {
      setVoicePreferences((current) => ({ ...current, rate: clampVoiceRate(rate) }))
    },
    testVoice() {
      void speech.speak('YOGUIDE voice preview. 10 seconds.', voicePreferences)
    },
    hasSavedSession:
      (state.status === 'saved' || state.status === 'paused') && state.totalActiveMs > 0,
    start,
    pause,
    resume,
    requestStop,
    cancelStop,
    saveAndEnd,
    reset,
  }
}
