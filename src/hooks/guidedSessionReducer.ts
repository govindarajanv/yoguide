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
  /** 0 = single midpoint ding, >0 = ding every N ms */
  dingIntervalMs: number
  /** Next activity-remaining-ms threshold that triggers a ding; null = none */
  nextDingRemainingMs: number | null
  pendingBell: boolean
  /** Running round counter for round-based interval steps (1-based), 0 when N/A */
  dingRound: number
  /** Round number to announce when the pending bell fires (0 = plain bell, no announcement) */
  bellRound: number
  justCompletedStepIds: string[]
  resumeAfterStop: 'running' | 'paused' | null
}

export type GuidedSessionAction =
  | { type: 'START' }
  | { type: 'START_FROM'; index: number; round?: number; steps: PracticeStep[] }
  | { type: 'BEGIN_ANNOUNCEMENT' }
  | { type: 'ANNOUNCEMENT_FINISHED'; nowMs: number }
  | { type: 'TICK'; nowMs: number; steps: PracticeStep[]; config: AppConfig }
  | { type: 'ACK_WARNING' }
  | { type: 'ACK_BELL' }
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
  const ding = initDingForStep(steps[0])
  return {
    status: 'idle',
    activityIndex: 0,
    activityRemainingMs: (steps[0]?.durationSec ?? 0) * 1000,
    totalActiveMs: 0,
    activeElapsedByStep: {},
    runningSinceMs: null,
    warningEmitted: false,
    pendingWarning: null,
    dingIntervalMs: ding.dingIntervalMs,
    nextDingRemainingMs: ding.nextDingRemainingMs,
    pendingBell: false,
    dingRound: initRoundForStep(steps[0]),
    bellRound: 0,
    justCompletedStepIds: [],
    resumeAfterStop: null,
  }
}

function warningSeconds(step: PracticeStep, config: AppConfig): number {
  if (step.finalWarningSec != null) return step.finalWarningSec
  return step.durationSec <= config.timer.shortActivityMaxSeconds
    ? config.timer.shortWarningSeconds
    : config.timer.standardWarningSeconds
}

/** A round-based interval step is one with a per-step ding interval (e.g. Surya Namaskar). */
function isRoundBased(step: PracticeStep | undefined): boolean {
  return Boolean(step && step.dingIntervalSec && step.dingIntervalSec > 0)
}

function initRoundForStep(step: PracticeStep | undefined): number {
  return isRoundBased(step) ? 1 : 0
}

export function initDingForStep(
  step: PracticeStep | undefined,
): { dingIntervalMs: number; nextDingRemainingMs: number | null } {
  if (!step) return { dingIntervalMs: 0, nextDingRemainingMs: null }
  const intervalSec = step.dingIntervalSec ?? 0
  if (intervalSec > 0) {
    const intervalMs = intervalSec * 1000
    return {
      dingIntervalMs: intervalMs,
      nextDingRemainingMs: Math.max(1, step.durationSec * 1000 - intervalMs),
    }
  }
  const midpointMs = Math.floor(step.durationSec / 2) * 1000
  return { dingIntervalMs: 0, nextDingRemainingMs: midpointMs > 0 ? midpointMs : null }
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
  let dingIntervalMs = state.dingIntervalMs
  let nextDingRemainingMs = state.nextDingRemainingMs
  let pendingBell = state.pendingBell
  let dingRound = state.dingRound
  let bellRound = state.bellRound
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
    pendingBell = false
    bellRound = 0
    dingRound = 0

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
          dingIntervalMs: 0,
          nextDingRemainingMs: null,
          pendingBell: false,
          dingRound: 0,
          bellRound: 0,
          justCompletedStepIds: completedStepIds,
          resumeAfterStop: null,
        },
      }
    }

    const nextDing = initDingForStep(next)
    dingIntervalMs = nextDing.dingIntervalMs
    nextDingRemainingMs = nextDing.nextDingRemainingMs
    dingRound = initRoundForStep(next)
    bellRound = 0
    activityRemainingMs = Math.max(1, next.durationSec * 1000)
  }

  const current = steps[activityIndex]
  if (!current) {
    return { state, completedStepIds }
  }

  activeElapsedByStep[current.id] = (activeElapsedByStep[current.id] ?? 0) + unconsumedMs
  consumedMs += unconsumedMs
  activityRemainingMs = Math.max(0, activityRemainingMs - unconsumedMs)

  let warningJustEmitted = false
  const threshold = warningSeconds(current, config)
  if (!warningEmitted && activityRemainingMs > 0 && activityRemainingMs <= threshold * 1000) {
    warningEmitted = true
    warningJustEmitted = true
    pendingWarning = { stepId: current.id, seconds: threshold }
  }

  let bellJustTriggered = false
  if (nextDingRemainingMs !== null && activityRemainingMs > 0) {
    while (nextDingRemainingMs !== null && activityRemainingMs <= nextDingRemainingMs) {
      pendingBell = true
      bellJustTriggered = true
      if (dingIntervalMs > 0) {
        bellRound = dingRound
        dingRound += 1
        const nextThreshold: number = nextDingRemainingMs - dingIntervalMs
        nextDingRemainingMs = nextThreshold > 0 ? nextThreshold : null
      } else {
        bellRound = 0
        nextDingRemainingMs = null
      }
    }
  }

  if (warningJustEmitted && bellJustTriggered) {
    pendingBell = false
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
      dingIntervalMs,
      nextDingRemainingMs,
      pendingBell,
      dingRound,
      bellRound,
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
    case 'START_FROM': {
      const step = action.steps[action.index]
      const ding = initDingForStep(step)
      const intervalMs = ding.dingIntervalMs
      const startRound = intervalMs > 0 ? Math.max(1, action.round ?? 1) : 0
      const durationMs = (step?.durationSec ?? 0) * 1000
      const remainingMs = intervalMs > 0
        ? Math.max(1, durationMs - (startRound - 1) * intervalMs)
        : durationMs
      const nextRemaining =
        intervalMs > 0
          ? remainingMs > intervalMs
            ? remainingMs - intervalMs
            : null
          : ding.nextDingRemainingMs
      return {
        ...createInitialGuidedState(action.steps),
        status: 'announcing',
        activityIndex: action.index,
        activityRemainingMs: remainingMs,
        dingIntervalMs: ding.dingIntervalMs,
        nextDingRemainingMs: nextRemaining,
        dingRound: startRound,
        bellRound: 0,
      }
    }
    case 'BEGIN_ANNOUNCEMENT':
      return { ...state, status: 'announcing', runningSinceMs: null }
    case 'ANNOUNCEMENT_FINISHED':
      if (state.status !== 'announcing') return state
      return { ...state, status: 'running', runningSinceMs: action.nowMs }
    case 'TICK':
      return reconcileAt(state, action.nowMs, action.steps, action.config).state
    case 'ACK_WARNING':
      return { ...state, pendingWarning: null }
    case 'ACK_BELL':
      return { ...state, pendingBell: false, bellRound: 0 }
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
      return {
        ...action.state,
        dingRound: action.state.dingRound ?? 0,
        bellRound: action.state.bellRound ?? 0,
      }
  }
}
