// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PracticeStep } from '../lib/types'
import { playDing, unlockDing } from '../lib/ding'
import { useGuidedSession } from './useGuidedSession'

vi.mock('../lib/ding', () => ({
  unlockDing: vi.fn(),
  playDing: vi.fn(),
}))

const mockPlayDing = vi.mocked(playDing)
const mockUnlockDing = vi.mocked(unlockDing)

const hold30: PracticeStep = {
  id: 'hold',
  category: 'core',
  name: 'Hold',
  sets: 1,
  reps: 1,
  durationSec: 30,
  cue: 'Hold.',
}

const suryaNamaskar: PracticeStep = {
  id: 'surya-namaskar',
  category: 'asanas',
  name: 'Surya Namaskar',
  sets: 1,
  reps: 1,
  durationSec: 120,
  cue: 'Flow.',
  dingIntervalSec: 30,
}

const loudStep: PracticeStep = {
  id: 'loud-hold',
  category: 'coolDown',
  name: 'Loud Hold',
  sets: 1,
  reps: 1,
  durationSec: 80,
  cue: 'Hold.',
  dingGain: 1.6,
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1_000_000)
  localStorage.clear()
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('useGuidedSession midpoint bell', () => {
  it('unlocks audio on start and rings at the activity midpoint', async () => {
    const { result } = renderHook(() =>
      useGuidedSession({ steps: [hold30], dateKey: '2026-01-01', onStepComplete: vi.fn() }),
    )

    await act(async () => {
      result.current.start()
    })
    expect(mockUnlockDing).toHaveBeenCalledTimes(1)
    expect(mockUnlockDing).toHaveBeenCalledWith([1])
    expect(result.current.state.status).toBe('running')

    await act(async () => {
      vi.advanceTimersByTime(15_000)
    })
    expect(result.current.state.nextDingRemainingMs).toBeNull()
    expect(mockPlayDing).toHaveBeenCalledTimes(1)
    expect(mockPlayDing).toHaveBeenCalledWith(1)
  })

  it('does not ring before the midpoint', async () => {
    const { result } = renderHook(() =>
      useGuidedSession({ steps: [hold30], dateKey: '2026-01-03', onStepComplete: vi.fn() }),
    )

    await act(async () => {
      result.current.start()
    })
    await act(async () => {
      vi.advanceTimersByTime(14_000)
    })
    expect(mockPlayDing).not.toHaveBeenCalled()
  })

  it('rings only once per activity', async () => {
    const { result } = renderHook(() =>
      useGuidedSession({ steps: [hold30], dateKey: '2026-01-04', onStepComplete: vi.fn() }),
    )

    await act(async () => {
      result.current.start()
    })
    await act(async () => {
      vi.advanceTimersByTime(29_000)
    })
    expect(mockPlayDing).toHaveBeenCalledTimes(1)
  })
})

describe('useGuidedSession Surya Namaskar interval rings', () => {
  it('rings N times on the Nth 30-second interval during Surya Namaskar', async () => {
    const { result } = renderHook(() =>
      useGuidedSession({
        steps: [suryaNamaskar],
        dateKey: '2026-01-05',
        onStepComplete: vi.fn(),
      }),
    )

    await act(async () => {
      result.current.start()
    })
    expect(result.current.state.dingIntervalMs).toBe(30_000)

    await act(async () => {
      vi.advanceTimersByTime(29_000)
    })
    expect(mockPlayDing).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(1_000)
    })
    expect(mockPlayDing).toHaveBeenCalledTimes(1)

    await act(async () => {
      vi.advanceTimersByTime(30_000)
    })
    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(mockPlayDing).toHaveBeenCalledTimes(3)

    await act(async () => {
      vi.advanceTimersByTime(30_000)
    })
    await act(async () => {
      vi.advanceTimersByTime(1_000)
    })
    expect(mockPlayDing).toHaveBeenCalledTimes(6)
    expect(result.current.state.nextDingRemainingMs).toBeNull()
  })
})

describe('useGuidedSession 30s Surya Namaskar warning', () => {
  it('skips the ding that lands on the same tick as the spoken 30s warning', async () => {
    const step: PracticeStep = { ...suryaNamaskar, durationSec: 60, finalWarningSec: 30 }
    const { result } = renderHook(() =>
      useGuidedSession({ steps: [step], dateKey: '2026-01-09', onStepComplete: vi.fn() }),
    )

    await act(async () => {
      result.current.start()
    })
    expect(result.current.state.pendingWarning).toBeNull()

    await act(async () => {
      vi.advanceTimersByTime(29_000)
    })
    expect(mockPlayDing).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(1_000)
    })
    expect(mockPlayDing).not.toHaveBeenCalled()
  })
})

describe('useGuidedSession loud bell gain', () => {  it('unlocks all step gain variants on start', async () => {
    const { result } = renderHook(() =>
      useGuidedSession({
        steps: [hold30, loudStep],
        dateKey: '2026-01-06',
        onStepComplete: vi.fn(),
      }),
    )

    await act(async () => {
      result.current.start()
    })
    expect(mockUnlockDing).toHaveBeenCalledWith([1, 1.6])
  })

  it('passes the step dingGain to playDing at the midpoint', async () => {
    const { result } = renderHook(() =>
      useGuidedSession({ steps: [loudStep], dateKey: '2026-01-07', onStepComplete: vi.fn() }),
    )

    await act(async () => {
      result.current.start()
    })
    mockPlayDing.mockClear()

    await act(async () => {
      vi.advanceTimersByTime(40_000)
    })
    expect(mockPlayDing).toHaveBeenCalledTimes(1)
    expect(mockPlayDing).toHaveBeenCalledWith(1.6)
  })

  it('keeps the default gain for steps without dingGain', async () => {
    const { result } = renderHook(() =>
      useGuidedSession({ steps: [hold30], dateKey: '2026-01-08', onStepComplete: vi.fn() }),
    )

    await act(async () => {
      result.current.start()
    })
    mockPlayDing.mockClear()

    await act(async () => {
      vi.advanceTimersByTime(15_000)
    })
    expect(mockPlayDing).toHaveBeenCalledWith(1)
  })
})
