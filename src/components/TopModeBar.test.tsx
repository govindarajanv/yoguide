// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TopModeBar } from './TopModeBar'

describe('TopModeBar', () => {
  it('renders both modes with Regular Yoga active by default', () => {
    const onToggle = vi.fn()
    render(<TopModeBar travelMode={false} onToggleTravelMode={onToggle} />)

    expect(screen.getByText('Regular Yoga')).toBeInTheDocument()
    expect(screen.getByText('Chair Yoga')).toBeInTheDocument()
    expect(screen.getByText('40 min')).toBeInTheDocument()
    expect(screen.getByText('Travel · 20 min')).toBeInTheDocument()

    const regularBtn = screen.getByRole('button', { name: /regular yoga/i })
    const chairBtn = screen.getByRole('button', { name: /chair yoga/i })
    const switchInput = screen.getByRole('switch', { name: /toggle chair yoga travel mode/i })

    expect(regularBtn).toHaveClass('mode-tab-active')
    expect(chairBtn).not.toHaveClass('mode-tab-active')
    expect(switchInput).not.toBeChecked()
    expect(screen.getByText('OFF')).toBeInTheDocument()

    // Clicking Chair Yoga calls onToggle
    fireEvent.click(chairBtn)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('renders Chair Yoga active when travelMode is true', () => {
    const onToggle = vi.fn()
    render(<TopModeBar travelMode={true} onToggleTravelMode={onToggle} />)

    const regularBtn = screen.getByRole('button', { name: /regular yoga/i })
    const chairBtn = screen.getByRole('button', { name: /chair yoga/i })
    const switchInput = screen.getByRole('switch', { name: /toggle chair yoga travel mode/i })

    expect(regularBtn).not.toHaveClass('mode-tab-active')
    expect(chairBtn).toHaveClass('mode-tab-active')
    expect(switchInput).toBeChecked()
    expect(screen.getByText('ON')).toBeInTheDocument()

    // Clicking Regular Yoga calls onToggle
    fireEvent.click(regularBtn)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
