import type { AppConfig } from '../config/appConfig'
import type { PracticeStep } from '../lib/types'

export type GuidedStatus =
  | 'idle'
  | 'announcing'
  | 'running'
  | 'paused'
  | 'stop-confirmation'
  | 'saved'
  | 'completed'

export type GuidedWarning = {
  stepId: string
  seconds: number
}

export type GuidedSessionState = {
  status: GuidedStatus
  activityIndex: number
  activityRemainingMs: number
  totalActiveMs: number
  activeElapsedByStep: Record<string, number>
  runningSinceMs: number | null
  warningEmitted: boolean
  pendingWarning: GuidedWarning | null
  justCompletedStepIds: string[]
  resumeAfterStop: 'running' | 'paused' | null
}

export type GuidedSessionAction =
  | { type: 'START' }
  | { type: 'BEGIN_ANNOUNCEMENT' }
  | { type: 'ANNOUNCEMENT_FINISHED'; nowMs: number }
  | { type: 'TICK'; nowMs: number; steps: PracticeStep[]; config: AppConfig }
  | { type: 'ACK_WARNING' }
  | { type: 'PAUSE'; nowMs: number; steps: PracticeStep[]; config: AppConfig }
  | { type: 'RESUME' }
  | { type: 'REQUEST_STOP'; nowMs: number; steps: PracticeStep[]; config: AppConfig }
  | { type: 'CANCEL_STOP'; nowMs: number }
  | { type: 'SAVE_AND_END' }
  | { type: 'RESET'; steps: PracticeStep[] }
  | { type: 'RESTORE'; state: GuidedSessionState }

export type ReconcileResult = {
  state: GuidedSessionState
  completedStepIds: string[]
}

export function createInitialGuidedState(steps: PracticeStep[]): GuidedSessionState {
  return {
    status: 'idle',
    activityIndex: 0,
    activityRemainingMs: (steps[0]?.durationSec ?? 0) * 1000,
    totalActiveMs: 0,
    activeElapsedByStep: {},
    runningSinceMs: null,
    warningEmitted: false,
    pendingWarning: null,
    justCompletedStepIds: [],
    resumeAfterStop: null,
  }
}

function warningSeconds(step: PracticeStep, config: AppConfig): number {
  return step.durationSec <= config.timer.shortActivityMaxSeconds
    ? config.timer.shortWarningSeconds
    : config.timer.standardWarningSeconds
}

export function reconcileAt(
  state: GuidedSessionState,
  nowMs: number,
  steps: PracticeStep[],
  config: AppConfig,
): ReconcileResult {
  if (state.status !== 'running' || state.runningSinceMs === null) {
    return { state: { ...state, justCompletedStepIds: [] }, completedStepIds: [] }
  }

  let unconsumedMs = Math.max(0, nowMs - state.runningSinceMs)
  let activityIndex = state.activityIndex
  let activityRemainingMs = state.activityRemainingMs
  let warningEmitted = state.warningEmitted
  let pendingWarning = state.pendingWarning
  let consumedMs = 0
  const completedStepIds: string[] = []
  const activeElapsedByStep = { ...state.activeElapsedByStep }

  while (steps[activityIndex] && unconsumedMs >= activityRemainingMs) {
    const step = steps[activityIndex]!
    activeElapsedByStep[step.id] = (activeElapsedByStep[step.id] ?? 0) + activityRemainingMs
    unconsumedMs -= activityRemainingMs
    consumedMs += activityRemainingMs
    completedStepIds.push(step.id)
    activityIndex += 1
    warningEmitted = false
    pendingWarning = null

    const next = steps[activityIndex]
    if (!next) {
      return {
        completedStepIds,
        state: {
          ...state,
          status: 'completed',
          activityIndex: steps.length,
          activityRemainingMs: 0,
          totalActiveMs: state.totalActiveMs + consumedMs,
          activeElapsedByStep,
          runningSinceMs: null,
          warningEmitted: true,
          pendingWarning: null,
          justCompletedStepIds: completedStepIds,
          resumeAfterStop: null,
        },
      }
    }

    activityRemainingMs = Math.max(1, next.durationSec * 1000)
  }

  const current = steps[activityIndex]
  if (!current) {
    return { state, completedStepIds }
  }

  activeElapsedByStep[current.id] = (activeElapsedByStep[current.id] ?? 0) + unconsumedMs
  consumedMs += unconsumedMs
  activityRemainingMs = Math.max(0, activityRemainingMs - unconsumedMs)

  const threshold = warningSeconds(current, config)
  if (!warningEmitted && activityRemainingMs > 0 && activityRemainingMs <= threshold * 1000) {
    warningEmitted = true
    pendingWarning = { stepId: current.id, seconds: threshold }
  }

  return {
    completedStepIds,
    state: {
      ...state,
      activityIndex,
      activityRemainingMs,
      totalActiveMs: state.totalActiveMs + consumedMs,
      activeElapsedByStep,
      runningSinceMs: nowMs,
      warningEmitted,
      pendingWarning,
      justCompletedStepIds: completedStepIds,
    },
  }
}

export function guidedSessionReducer(
  state: GuidedSessionState,
  action: GuidedSessionAction,
): GuidedSessionState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'announcing', justCompletedStepIds: [] }
    case 'BEGIN_ANNOUNCEMENT':
      return { ...state, status: 'announcing', runningSinceMs: null }
    case 'ANNOUNCEMENT_FINISHED':
      if (state.status !== 'announcing') return state
      return { ...state, status: 'running', runningSinceMs: action.nowMs }
    case 'TICK':
      return reconcileAt(state, action.nowMs, action.steps, action.config).state
    case 'ACK_WARNING':
      return { ...state, pendingWarning: null }
    case 'PAUSE': {
      const reconciled = reconcileAt(state, action.nowMs, action.steps, action.config).state
      if (reconciled.status === 'completed') return reconciled
      return { ...reconciled, status: 'paused', runningSinceMs: null }
    }
    case 'RESUME':
      if (state.status !== 'paused' && state.status !== 'saved') return state
      return { ...state, status: 'announcing', runningSinceMs: null }
    case 'REQUEST_STOP': {
      const wasRunning = state.status === 'running'
      const reconciled = wasRunning
        ? reconcileAt(state, action.nowMs, action.steps, action.config).state
        : state
      if (reconciled.status === 'completed') return reconciled
      return {
        ...reconciled,
        status: 'stop-confirmation',
        runningSinceMs: null,
        resumeAfterStop: wasRunning ? 'running' : 'paused',
      }
    }
    case 'CANCEL_STOP':
      if (state.status !== 'stop-confirmation') return state
      return {
        ...state,
        status: state.resumeAfterStop ?? 'paused',
        runningSinceMs: state.resumeAfterStop === 'running' ? action.nowMs : null,
        resumeAfterStop: null,
      }
    case 'SAVE_AND_END':
      if (state.status !== 'stop-confirmation') return state
      return { ...state, status: 'saved', runningSinceMs: null, resumeAfterStop: null }
    case 'RESET':
      return createInitialGuidedState(action.steps)
    case 'RESTORE':
      return action.state
  }
}
