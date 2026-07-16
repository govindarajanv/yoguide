// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SessionController } from './SessionController'

const baseProps = {
  activityName: 'High Knees',
  activityIndex: 3,
  totalActivities: 41,
  remainingMs: 12_400,
  elapsedMs: 65_000,
  calories: 8.42,
  status: 'running' as const,
  speechAvailable: true,
  onPause: vi.fn(),
  onResume: vi.fn(),
  onStop: vi.fn(),
}

describe('SessionController', () => {
  it('shows synchronized metrics and running controls', () => {
    render(<SessionController {...baseProps} />)
    expect(screen.getByText('High Knees')).toBeInTheDocument()
    expect(screen.getByText('0:13')).toBeInTheDocument()
    expect(screen.getByText('1:05')).toBeInTheDocument()
    expect(screen.getByText('8.4 kcal')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pause session' }))
    expect(baseProps.onPause).toHaveBeenCalled()
  })

  it('shows resume and stop while paused', () => {
    const onResume = vi.fn()
    const onStop = vi.fn()
    render(
      <SessionController
        {...baseProps}
        status="paused"
        onResume={onResume}
        onStop={onStop}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Resume session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Stop session' }))
    expect(onResume).toHaveBeenCalled()
    expect(onStop).toHaveBeenCalled()
  })
})
