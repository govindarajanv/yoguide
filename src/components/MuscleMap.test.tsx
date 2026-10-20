// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PracticeStep } from '../lib/types'
import { MuscleMap } from './MuscleMap'

function step(name: string): PracticeStep {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    category: 'asanas',
    name,
    sets: 1,
    reps: 1,
    durationSec: 60,
    cue: 'Flow.',
  }
}

describe('MuscleMap', () => {
  it('renders front view by default with front toggles', () => {
    render(<MuscleMap steps={[step('Planks')]} />)
    expect(screen.getByRole('tab', { name: 'Front' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Back' })).toHaveAttribute('aria-selected', 'false')
  })

  it('switches to back view when Back is selected and lists activities', () => {
    render(<MuscleMap steps={[step('Bridges')]} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Back' }))
    expect(screen.getByRole('tab', { name: 'Back' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Glutes')).toBeInTheDocument()
    expect(screen.getAllByText('Bridges').length).toBeGreaterThan(0)
  })

  it('lists all activities that cover a muscle region', () => {
    render(<MuscleMap steps={[step('Planks'), step('Bird Dog')]} />)
    expect(screen.getByText('Core & abs')).toBeInTheDocument()
    expect(screen.getAllByText('Planks').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bird Dog').length).toBeGreaterThan(0)
  })

  it('treats full body muscle targets as covering every region', () => {
    render(<MuscleMap steps={[step('Surya Namaskar')]} />)
    expect(screen.getByText('Head & neck')).toBeInTheDocument()
    expect(screen.getByText('Shoulders')).toBeInTheDocument()
    expect(screen.getByText('Chest & breath')).toBeInTheDocument()
  })
})
