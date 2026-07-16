import { describe, expect, it } from 'vitest'
import { DEFAULT_APP_CONFIG } from '../config/appConfig'
import type { PracticeStep } from '../lib/types'
import {
  createInitialGuidedState,
  guidedSessionReducer,
  reconcileAt,
} from './guidedSessionReducer'

const steps: PracticeStep[] = [
  {
    id: 'short',
    category: 'warmUp',
    name: 'Short Move',
    sets: 1,
    reps: 1,
    durationSec: 30,
    cue: 'Move.',
  },
  {
    id: 'long',
    category: 'core',
    name: 'Long Move',
    sets: 1,
    reps: 1,
    durationSec: 60,
    cue: 'Hold.',
  },
  {
    id: 'finish',
    category: 'meditation',
    name: 'Finish',
    sets: 1,
    reps: 1,
    durationSec: 10,
    cue: 'Rest.',
  },
]

describe('guidedSessionReducer', () => {
  it('starts in announcing state and runs after announcement', () => {
    const initial = createInitialGuidedState(steps)
    const announcing = guidedSessionReducer(initial, { type: 'START' })
    const running = guidedSessionReducer(announcing, {
      type: 'ANNOUNCEMENT_FINISHED',
      nowMs: 1_000,
    })
    expect(announcing.status).toBe('announcing')
    expect(running.status).toBe('running')
    expect(running.runningSinceMs).toBe(1_000)
  })

  it('freezes the next activity while its announcement plays', () => {
    const running = {
      ...createInitialGuidedState(steps),
      status: 'running' as const,
      runningSinceMs: 1_000,
    }
    const announcing = guidedSessionReducer(running, { type: 'BEGIN_ANNOUNCEMENT' })
    expect(announcing.status).toBe('announcing')
    expect(announcing.runningSinceMs).toBeNull()
  })

  it('freezes elapsed time while paused and resumes accurately', () => {
    let state = createInitialGuidedState(steps)
    state = guidedSessionReducer(state, { type: 'START' })
    state = guidedSessionReducer(state, { type: 'ANNOUNCEMENT_FINISHED', nowMs: 0 })
    state = guidedSessionReducer(state, {
      type: 'PAUSE',
      nowMs: 10_000,
      steps,
      config: DEFAULT_APP_CONFIG,
    })
    expect(state.status).toBe('paused')
    expect(state.totalActiveMs).toBe(10_000)
    expect(state.activityRemainingMs).toBe(20_000)

    state = guidedSessionReducer(state, { type: 'RESUME' })
    state = guidedSessionReducer(state, { type: 'ANNOUNCEMENT_FINISHED', nowMs: 50_000 })
    state = guidedSessionReducer(state, {
      type: 'TICK',
      nowMs: 55_000,
      steps,
      config: DEFAULT_APP_CONFIG,
    })
    expect(state.totalActiveMs).toBe(15_000)
    expect(state.activityRemainingMs).toBe(15_000)
  })

  it('uses 3-second warning for short and 5-second warning for long activities', () => {
    let short = createInitialGuidedState(steps)
    short = guidedSessionReducer(short, { type: 'START' })
    short = guidedSessionReducer(short, { type: 'ANNOUNCEMENT_FINISHED', nowMs: 0 })
    short = guidedSessionReducer(short, {
      type: 'TICK',
      nowMs: 27_000,
      steps,
      config: DEFAULT_APP_CONFIG,
    })
    expect(short.pendingWarning?.seconds).toBe(3)

    const longInitial = {
      ...createInitialGuidedState(steps),
      activityIndex: 1,
      activityRemainingMs: 60_000,
      status: 'running' as const,
      runningSinceMs: 0,
    }
    const long = guidedSessionReducer(longInitial, {
      type: 'TICK',
      nowMs: 55_000,
      steps,
      config: DEFAULT_APP_CONFIG,
    })
    expect(long.pendingWarning?.seconds).toBe(5)
  })

  it('reconciles delayed ticks across multiple completed activities', () => {
    const running = {
      ...createInitialGuidedState(steps),
      status: 'running' as const,
      runningSinceMs: 0,
    }
    const result = reconcileAt(running, 95_000, steps, DEFAULT_APP_CONFIG)
    expect(result.state.activityIndex).toBe(2)
    expect(result.state.activityRemainingMs).toBe(5_000)
    expect(result.state.totalActiveMs).toBe(95_000)
    expect(result.completedStepIds).toEqual(['short', 'long'])
  })

  it('completes the final activity and supports stop choices', () => {
    const finalRunning = {
      ...createInitialGuidedState(steps),
      activityIndex: 2,
      activityRemainingMs: 10_000,
      status: 'running' as const,
      runningSinceMs: 0,
    }
    const completed = guidedSessionReducer(finalRunning, {
      type: 'TICK',
      nowMs: 10_000,
      steps,
      config: DEFAULT_APP_CONFIG,
    })
    expect(completed.status).toBe('completed')

    let state = guidedSessionReducer(createInitialGuidedState(steps), { type: 'START' })
    state = guidedSessionReducer(state, { type: 'ANNOUNCEMENT_FINISHED', nowMs: 0 })
    state = guidedSessionReducer(state, {
      type: 'REQUEST_STOP',
      nowMs: 5_000,
      steps,
      config: DEFAULT_APP_CONFIG,
    })
    expect(state.status).toBe('stop-confirmation')
    state = guidedSessionReducer(state, { type: 'CANCEL_STOP', nowMs: 8_000 })
    expect(state.status).toBe('running')
    state = guidedSessionReducer(state, {
      type: 'REQUEST_STOP',
      nowMs: 9_000,
      steps,
      config: DEFAULT_APP_CONFIG,
    })
    expect(guidedSessionReducer(state, { type: 'SAVE_AND_END' }).status).toBe('saved')
    expect(guidedSessionReducer(state, { type: 'RESET', steps }).status).toBe('idle')
  })
})
