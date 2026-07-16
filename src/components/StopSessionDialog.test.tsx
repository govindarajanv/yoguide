// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StopSessionDialog } from './StopSessionDialog'

describe('StopSessionDialog', () => {
  it('offers save, reset, and cancel actions', () => {
    const onSave = vi.fn()
    const onReset = vi.fn()
    const onCancel = vi.fn()
    render(
      <StopSessionDialog
        open
        onSave={onSave}
        onReset={onReset}
        onCancel={onCancel}
      />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save and end' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onSave).toHaveBeenCalled()
    expect(onReset).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })

  it('renders nothing when closed', () => {
    render(
      <StopSessionDialog
        open={false}
        onSave={vi.fn()}
        onReset={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
