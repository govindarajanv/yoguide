// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MuscleMap } from './MuscleMap'

describe('MuscleMap', () => {
  it('renders front view by default with front toggles', () => {
    render(<MuscleMap muscles={['Shoulders', 'Core']} />)
    expect(screen.getByRole('tab', { name: 'Front' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Back' })).toHaveAttribute('aria-selected', 'false')
  })

  it('switches to back view when Back is selected', () => {
    render(<MuscleMap muscles={['Glutes']} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Back' }))
    expect(screen.getByRole('tab', { name: 'Back' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Glutes')).toBeInTheDocument()
  })

  it('highlights active front regions in the legend', () => {
    render(<MuscleMap muscles={['Shoulders', 'Hamstrings', 'Obliques']} />)
    expect(screen.getByText('Shoulders')).toBeInTheDocument()
    expect(screen.getByText('Core & abs')).toBeInTheDocument()
  })

  it('treats full body muscle targets as covering every region', () => {
    render(<MuscleMap muscles={['Full body']} />)
    expect(screen.getByText('Head & neck')).toBeInTheDocument()
    expect(screen.getByText('Shoulders')).toBeInTheDocument()
    expect(screen.getByText('Chest & breath')).toBeInTheDocument()
  })
})
