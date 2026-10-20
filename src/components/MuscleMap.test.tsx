// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
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
  it('lists every muscle region with the activities that cover it', () => {
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

  it('shows an empty message when no regions are highlighted', () => {
    render(<MuscleMap steps={[]} />)
    expect(screen.getByText('No body regions highlighted this day.')).toBeInTheDocument()
  })
})
