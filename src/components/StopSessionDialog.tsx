import { useEffect, useRef, useState } from 'react'

type Props = {
  open: boolean
  onSave: () => void
  onReset: () => void
  onCancel: () => void
}

export function StopSessionDialog({ open, onSave, onReset, onCancel }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
    if (!open) setConfirmReset(false)
  }, [open])

  if (!open) return null

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="stop-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-title"
      >
        <span className="eyebrow">Guided session paused</span>
        <h2 id="stop-title">{confirmReset ? 'Reset this session?' : 'Stop your practice?'}</h2>
        <p>
          {confirmReset
            ? 'This clears today’s guided timer, calories, and automatically completed items.'
            : 'Save your place to resume later, or reset today’s guided session.'}
        </p>
        <div className="dialog-actions">
          {!confirmReset ? (
            <>
              <button type="button" className="btn btn-primary" onClick={onSave}>
                Save and end
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setConfirmReset(true)}>
                Reset session
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setConfirmReset(false)
                onReset()
              }}
            >
              Confirm reset
            </button>
          )}
          <button
            ref={cancelRef}
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (confirmReset) setConfirmReset(false)
              else onCancel()
            }}
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  )
}
