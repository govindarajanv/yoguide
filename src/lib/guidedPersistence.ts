import type { GuidedSessionState, GuidedStatus } from '../hooks/guidedSessionReducer'
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

  const restoredStatus: GuidedStatus =
    state.status === 'running' || state.status === 'announcing' || state.status === 'stop-confirmation'
      ? 'paused'
      : state.status

  return {
    status: restoredStatus,
    activityIndex: state.activityIndex!,
    activityRemainingMs: state.activityRemainingMs,
    totalActiveMs: state.totalActiveMs,
    activeElapsedByStep: state.activeElapsedByStep,
    runningSinceMs: null,
    warningEmitted: Boolean(state.warningEmitted),
    pendingWarning: null,
    justCompletedStepIds: [],
    resumeAfterStop: null,
  }
}

export function loadGuidedSnapshot(
  dateKey: string,
  steps: PracticeStep[],
  storage: StorageLike | null = browserStorage(),
): GuidedSessionState | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(`${PREFIX}${dateKey}`)
    if (!raw) return null
    const snapshot = JSON.parse(raw) as { version?: unknown; state?: unknown }
    if (snapshot.version !== VERSION) return null
    return validateState(snapshot.state, steps)
  } catch {
    return null
  }
}

export function saveGuidedSnapshot(
  dateKey: string,
  state: GuidedSessionState,
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!storage) return false
  try {
    storage.setItem(`${PREFIX}${dateKey}`, JSON.stringify({ version: VERSION, state }))
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
