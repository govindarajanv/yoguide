const PROGRESS_PREFIX = 'yoga-schedule:progress:'
const ROUNDS_PREFIX = 'yoga-schedule:rounds:'
const COMPLETED_KEY = 'yoga-schedule:completed-dates'

export type DayProgress = Record<string, boolean>
export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem'>

function defaultStorage(): ProgressStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function readJson<T>(key: string, fallback: T, storage = defaultStorage()): T {
  try {
    const raw = storage?.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadProgress(dateKey: string, storage = defaultStorage()): DayProgress {
  return readJson<DayProgress>(`${PROGRESS_PREFIX}${dateKey}`, {}, storage)
}

export function saveProgress(
  dateKey: string,
  progress: DayProgress,
  storage = defaultStorage(),
): void {
  try {
    storage?.setItem(`${PROGRESS_PREFIX}${dateKey}`, JSON.stringify(progress))
  } catch {
    // Progress remains available in React state when persistence is unavailable.
  }
}

export function toggleStep(
  dateKey: string,
  stepId: string,
  storage = defaultStorage(),
): DayProgress {
  const progress = loadProgress(dateKey, storage)
  progress[stepId] = !progress[stepId]
  saveProgress(dateKey, progress, storage)
  return progress
}

export function completeStep(
  dateKey: string,
  stepId: string,
  storage = defaultStorage(),
): DayProgress {
  const progress = loadProgress(dateKey, storage)
  progress[stepId] = true
  saveProgress(dateKey, progress, storage)
  return progress
}

export function loadRounds(dateKey: string, stepId: string): number {
  const all = readJson<Record<string, number>>(`${ROUNDS_PREFIX}${dateKey}`, {})
  return all[stepId] ?? 0
}

export function saveRounds(dateKey: string, stepId: string, rounds: number): void {
  const key = `${ROUNDS_PREFIX}${dateKey}`
  const all = readJson<Record<string, number>>(key, {})
  all[stepId] = rounds
  defaultStorage()?.setItem(key, JSON.stringify(all))
}

export function markSessionComplete(dateKey: string): void {
  const dates = readJson<string[]>(COMPLETED_KEY, [])
  if (!dates.includes(dateKey)) {
    dates.push(dateKey)
    defaultStorage()?.setItem(COMPLETED_KEY, JSON.stringify(dates))
  }
}

export function isSessionComplete(dateKey: string): boolean {
  return readJson<string[]>(COMPLETED_KEY, []).includes(dateKey)
}

export function checkedCount(progress: DayProgress, stepIds: string[]): number {
  return stepIds.filter((id) => progress[id]).length
}
