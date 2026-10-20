// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Home } from './Home'

describe('Home Chair Mode Toggle', () => {
  const baseProps = {
    day: 'wed' as const,
    today: 'wed' as const,
    onSelectDay: vi.fn(),
    totalSec: 2400,
    dayBenefits: {
      muscles: ['Core', 'Shoulders'],
      calories: 180,
      physiology: ['Muscular strength and endurance', 'Flexibility'],
    },
    checked: 0,
    totalSteps: 49,
    practiceSteps: [],
    guidedStatus: 'idle' as const,
    guidedElapsedMs: 0,
    guidedCalories: 0,
    travelMode: false,
    onToggleTravelMode: vi.fn(),
    onStartGuided: vi.fn(),
    onStartFrom: vi.fn(),
    onOpenGuided: vi.fn(),
    onResumeGuided: vi.fn(),
    onStart: vi.fn(),
    onOpenToday: vi.fn(),
    onOpenWeek: vi.fn(),
    theme: 'light' as const,
    onToggleTheme: vi.fn(),
  }

  it('renders with chair mode OFF by default and shows existing app', () => {
    render(<Home {...baseProps} />)
    const toggle = screen.getByRole('switch', { name: 'Toggle chair mode' })
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('OFF')).toBeInTheDocument()
    expect(screen.getByText('Wednesday')).toBeInTheDocument()
    expect(screen.getByText('PERSONAL PRACTICE')).toBeInTheDocument()
    expect(screen.getByText('Mat · wall · towel')).toBeInTheDocument()
    expect(screen.getByText('Muscle groups covered today')).toBeInTheDocument()
  })

  it('calls onToggleTravelMode when clicking the Chair Yoga toggle', () => {
    const onToggleTravelMode = vi.fn()
    render(<Home {...baseProps} onToggleTravelMode={onToggleTravelMode} />)
    const toggle = screen.getByRole('switch', { name: 'Toggle chair mode' })
    fireEvent.click(toggle)
    expect(onToggleTravelMode).toHaveBeenCalledTimes(1)
  })

  it('renders Chair Yoga view when travelMode is true', () => {
    render(
      <Home
        {...baseProps}
        travelMode={true}
        totalSec={1200}
        totalSteps={31}
      />,
    )
    const toggle = screen.getByRole('switch', { name: 'Toggle chair mode' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('ON')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /Chair Yoga/i })).toBeInTheDocument()
    expect(screen.getByText('CHAIR MODE')).toBeInTheDocument()
    expect(screen.getByText('Chair · comfortable clothes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Chair Yoga activities' })).toBeInTheDocument()
  })
})
