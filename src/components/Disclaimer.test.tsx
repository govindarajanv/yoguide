// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Disclaimer } from './Disclaimer'

describe('Disclaimer', () => {
  it('renders the standard medical disclaimer text', () => {
    render(<Disclaimer />)
    expect(screen.getByText('Disclaimer:')).toBeInTheDocument()
    expect(
      screen.getByText(/not intended as medical advice or a recommendation for others/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/consult your physician, orthopedist, physiotherapist/i)).toBeInTheDocument()
    expect(screen.getByText(/at your own risk/i)).toBeInTheDocument()
  })
})
