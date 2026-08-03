import type { AppConfig } from '../config/appConfig'
import { DEFAULT_APP_CONFIG } from '../config/appConfig'
import { reconcileAt, type GuidedSessionState, type GuidedStatus } from '../hooks/guidedSessionReducer'
import type { PracticeStep } from './types'

const PREFIX = 'yoga-schedule:guided:v1:'
const VERSION = 1

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function isStatus(value: unknown): value is GuidedStatus {
  return (
    typeof value === 'string' &&
    ['idle', 'announcing', 'running', 'paused', 'stop-confirmation', 'saved', 'completed'].includes(
      value,
    )
  )
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function validateState(value: unknown, steps: PracticeStep[]): GuidedSessionState | null {
  if (!value || typeof value !== 'object') return null
  const state = value as Partial<GuidedSessionState>
  if (
    !isStatus(state.status) ||
    !Number.isInteger(state.activityIndex) ||
    state.activityIndex! < 0 ||
    state.activityIndex! > steps.length ||
    !finiteNonNegative(state.activityRemainingMs) ||
    !finiteNonNegative(state.totalActiveMs) ||
    !state.activeElapsedByStep ||
    typeof state.activeElapsedByStep !== 'object'
  ) {
    return null
  }

  const elapsedEntries = Object.entries(state.activeElapsedByStep)
  if (elapsedEntries.some(([, elapsed]) => !finiteNonNegative(elapsed))) return null

  return {
    status: state.status!,
    activityIndex: state.activityIndex!,
    activityRemainingMs: state.activityRemainingMs,
    totalActiveMs: state.totalActiveMs,
    activeElapsedByStep: state.activeElapsedByStep,
    runningSinceMs:
      typeof state.runningSinceMs === 'number' && Number.isFinite(state.runningSinceMs)
        ? state.runningSinceMs
        : null,
    warningEmitted: Boolean(state.warningEmitted),
    pendingWarning: null,
    bellEmitted: Boolean(state.bellEmitted),
    pendingBell: false,
    justCompletedStepIds: [],
    resumeAfterStop: null,
  }
}

function pauseForRestore(state: GuidedSessionState): GuidedSessionState {
  return {
    ...state,
    status: 'paused',
    runningSinceMs: null,
    pendingWarning: null,
    justCompletedStepIds: [],
    resumeAfterStop: null,
  }
}

function restoreRunningSession(
  state: GuidedSessionState,
  steps: PracticeStep[],
  config: AppConfig,
  savedAtMs: number,
  nowMs: number,
): GuidedSessionState {
  const anchorMs = state.runningSinceMs ?? savedAtMs
  const atSave = reconcileAt({ ...state, status: 'running', runningSinceMs: anchorMs }, savedAtMs, steps, config)
  if (atSave.state.status === 'completed') {
    return { ...atSave.state, justCompletedStepIds: [] }
  }

  const atNow = reconcileAt(
    { ...atSave.state, status: 'running', runningSinceMs: savedAtMs },
    nowMs,
    steps,
    config,
  )
  return { ...atNow.state, justCompletedStepIds: [] }
}

export function loadGuidedSnapshot(
  dateKey: string,
  steps: PracticeStep[],
  storage: StorageLike | null = browserStorage(),
  config: AppConfig = DEFAULT_APP_CONFIG,
  nowMs: number = Date.now(),
): GuidedSessionState | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(`${PREFIX}${dateKey}`)
    if (!raw) return null
    const snapshot = JSON.parse(raw) as {
      version?: unknown
      savedAtMs?: unknown
      state?: unknown
    }
    if (snapshot.version !== VERSION) return null

    const validated = validateState(snapshot.state, steps)
    if (!validated) return null

    const savedAtMs =
      typeof snapshot.savedAtMs === 'number' && Number.isFinite(snapshot.savedAtMs)
        ? snapshot.savedAtMs
        : nowMs

    if (validated.status === 'running') {
      return restoreRunningSession(validated, steps, config, savedAtMs, nowMs)
    }

    if (validated.status === 'announcing' || validated.status === 'stop-confirmation') {
      return pauseForRestore(validated)
    }

    return validated
  } catch {
    return null
  }
}

export function saveGuidedSnapshot(
  dateKey: string,
  state: GuidedSessionState,
  storage: StorageLike | null = browserStorage(),
  savedAtMs: number = Date.now(),
): boolean {
  if (!storage) return false
  try {
    storage.setItem(
      `${PREFIX}${dateKey}`,
      JSON.stringify({ version: VERSION, savedAtMs, state }),
    )
    return true
  } catch {
    return false
  }
}

export function clearGuidedSnapshot(
  dateKey: string,
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!storage) return false
  try {
    storage.removeItem(`${PREFIX}${dateKey}`)
    return true
  } catch {
    return false
  }
}
